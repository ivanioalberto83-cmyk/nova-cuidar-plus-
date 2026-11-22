-- Secure, atomic onboarding for a provider organization and its first owner.
-- The caller remains subject to RLS: no elevated database role is used.

grant insert on table public.nova_organizations to authenticated;
grant insert on table public.nova_organization_memberships to authenticated;

drop policy if exists nova_org_memberships_insert_initial_owner on public.nova_organization_memberships;
create policy nova_org_memberships_insert_initial_owner
on public.nova_organization_memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and created_by = (select auth.uid())
  and role = 'owner'
  and status = 'active'
  and exists (
    select 1
    from public.nova_organizations o
    where o.id = organization_id
      and o.created_by = (select auth.uid())
      and o.status = 'pending'
  )
);

create or replace function public.nova_create_provider_organization(
  p_legal_name text,
  p_display_name text,
  p_organization_type text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_legal_name text := nullif(btrim(p_legal_name), '');
  v_display_name text := btrim(coalesce(p_display_name, ''));
  v_organization_type text := btrim(coalesce(p_organization_type, ''));
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if char_length(v_display_name) < 2 or char_length(v_display_name) > 160 then
    raise exception 'invalid_display_name' using errcode = '22023';
  end if;

  if v_legal_name is not null and char_length(v_legal_name) > 200 then
    raise exception 'invalid_legal_name' using errcode = '22023';
  end if;

  if v_organization_type not in ('care_provider', 'school', 'clinic', 'agency', 'other') then
    raise exception 'invalid_organization_type' using errcode = '22023';
  end if;

  insert into public.nova_organizations (
    legal_name, display_name, organization_type, country_code, status, created_by
  )
  values (
    v_legal_name, v_display_name, v_organization_type, 'AO', 'pending', v_user_id
  )
  returning id into v_organization_id;

  insert into public.nova_organization_memberships (
    organization_id, user_id, role, status, created_by
  )
  values (
    v_organization_id, v_user_id, 'owner', 'active', v_user_id
  );

  return v_organization_id;
end;
$$;

revoke all on function public.nova_create_provider_organization(text, text, text) from public;
revoke all on function public.nova_create_provider_organization(text, text, text) from anon;
grant execute on function public.nova_create_provider_organization(text, text, text) to authenticated;
