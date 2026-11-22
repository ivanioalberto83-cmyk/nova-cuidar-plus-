-- NOVA CUIDAR+ | hardening after first advisor review
begin;
create index nova_guardian_links_created_by_idx
  on public.nova_guardian_child_links(created_by);
create index nova_org_memberships_created_by_idx
  on public.nova_organization_memberships(created_by);
create policy nova_audit_events_deny_client_access
  on public.nova_audit_events
  for all to authenticated
  using (false)
  with check (false);
commit;
