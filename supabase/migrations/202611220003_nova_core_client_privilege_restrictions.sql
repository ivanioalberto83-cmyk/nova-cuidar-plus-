-- NOVA CUIDAR+ | restrict client-writable fields and initial states
begin;

revoke insert, update on public.nova_profiles from authenticated;
grant select on public.nova_profiles to authenticated;
grant insert (user_id, display_name, phone, preferred_locale)
  on public.nova_profiles to authenticated;
grant update (display_name, phone, preferred_locale)
  on public.nova_profiles to authenticated;

revoke insert, update on public.nova_organizations from authenticated;
grant select on public.nova_organizations to authenticated;
grant insert (legal_name, display_name, organization_type, country_code, created_by)
  on public.nova_organizations to authenticated;
grant update (legal_name, display_name)
  on public.nova_organizations to authenticated;

revoke insert, update on public.nova_children from authenticated;
grant select on public.nova_children to authenticated;
grant insert (display_name, birth_date, created_by)
  on public.nova_children to authenticated;
grant update (display_name, birth_date, status)
  on public.nova_children to authenticated;

revoke insert on public.nova_guardian_child_links from authenticated;
grant select on public.nova_guardian_child_links to authenticated;
grant insert (child_id, guardian_user_id, relationship, is_primary, created_by)
  on public.nova_guardian_child_links to authenticated;

revoke insert on public.nova_consents from authenticated;
grant select on public.nova_consents to authenticated;
grant insert (child_id, guardian_user_id, consent_type, status, policy_version, granted_at, evidence_reference)
  on public.nova_consents to authenticated;

drop policy nova_profiles_insert_self on public.nova_profiles;
create policy nova_profiles_insert_self on public.nova_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and account_status = 'pending'
  );

drop policy nova_organizations_insert_creator on public.nova_organizations;
create policy nova_organizations_insert_creator on public.nova_organizations
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'pending'
  );

drop policy nova_children_insert_creator on public.nova_children;
create policy nova_children_insert_creator on public.nova_children
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'active'
  );

drop policy nova_guardian_links_insert_self_for_created_child on public.nova_guardian_child_links;
create policy nova_guardian_links_insert_self_for_created_child on public.nova_guardian_child_links
  for insert to authenticated
  with check (
    guardian_user_id = (select auth.uid())
    and created_by = (select auth.uid())
    and status = 'active'
    and exists (
      select 1 from public.nova_children c
      where c.id = nova_guardian_child_links.child_id
        and c.created_by = (select auth.uid())
    )
  );

commit;
