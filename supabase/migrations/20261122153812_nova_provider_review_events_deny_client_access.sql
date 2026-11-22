create policy nova_provider_review_events_deny_client_access
on public.nova_provider_review_events
for all to authenticated
using (false)
with check (false);
