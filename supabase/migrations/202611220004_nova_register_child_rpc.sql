-- NOVA CUIDAR+ | atomic guardian-led child registration
-- SECURITY INVOKER is intentional: all underlying grants and RLS policies remain in force.
begin;

create or replace function public.nova_register_child(
  p_display_name text,
  p_birth_date date,
  p_relationship text,
  p_policy_version text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_child_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_display_name is null or char_length(trim(p_display_name)) not between 1 and 120 then
    raise exception 'Invalid child display name' using errcode = '22023';
  end if;

  if p_birth_date is not null and p_birth_date > current_date then
    raise exception 'Birth date cannot be in the future' using errcode = '22023';
  end if;

  if p_relationship not in ('mother', 'father', 'legal_guardian', 'family_member', 'other') then
    raise exception 'Invalid guardian relationship' using errcode = '22023';
  end if;

  if p_policy_version is null or char_length(trim(p_policy_version)) not between 1 and 40 then
    raise exception 'Invalid policy version' using errcode = '22023';
  end if;

  insert into public.nova_children (display_name, birth_date, created_by)
  values (trim(p_display_name), p_birth_date, v_user_id)
  returning id into v_child_id;

  insert into public.nova_guardian_child_links (
    child_id, guardian_user_id, relationship, is_primary, created_by
  )
  values (v_child_id, v_user_id, p_relationship, true, v_user_id);

  insert into public.nova_consents (
    child_id, guardian_user_id, consent_type, status, policy_version,
    granted_at, evidence_reference
  )
  select
    v_child_id, v_user_id, consent_type, 'granted', trim(p_policy_version),
    now(), 'family-registration-form'
  from unnest(array['privacy_notice', 'data_processing']::text[]) as consent_type;

  return v_child_id;
end;
$$;

revoke all on function public.nova_register_child(text, date, text, text) from public, anon;
grant execute on function public.nova_register_child(text, date, text, text) to authenticated;

commit;
