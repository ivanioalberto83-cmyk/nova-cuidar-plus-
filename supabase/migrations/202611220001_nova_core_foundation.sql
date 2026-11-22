-- NOVA CUIDAR+ | NOVA CORE foundation
-- Migration: nova_core_foundation_20261122
-- Scope: operational identity, organizations, families, children, guardian links,
-- consent records, and restricted audit events. No clinical records or seed users.

begin;

create table public.nova_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  phone text,
  preferred_locale text not null default 'pt-AO' check (preferred_locale in ('pt-AO', 'en')),
  account_status text not null default 'pending' check (account_status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nova_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160),
  organization_type text not null check (organization_type in ('care_provider', 'school', 'clinic', 'agency', 'other')),
  country_code char(2) not null default 'AO',
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nova_organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.nova_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'manager', 'staff', 'provider')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nova_org_membership_unique unique (organization_id, user_id)
);

create table public.nova_children (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  birth_date date,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nova_child_birth_date_not_future check (birth_date is null or birth_date <= current_date)
);

create table public.nova_guardian_child_links (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.nova_children(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null check (relationship in ('mother', 'father', 'legal_guardian', 'family_member', 'other')),
  is_primary boolean not null default false,
  status text not null default 'active' check (status in ('pending', 'active', 'revoked')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nova_guardian_child_unique unique (child_id, guardian_user_id)
);

create table public.nova_consents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.nova_children(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete restrict,
  consent_type text not null check (consent_type in ('privacy_notice', 'terms_of_service', 'data_processing', 'service_booking', 'photo_media', 'communications')),
  status text not null check (status in ('granted', 'revoked')),
  policy_version text not null check (char_length(trim(policy_version)) between 1 and 40),
  granted_at timestamptz,
  revoked_at timestamptz,
  evidence_reference text,
  created_at timestamptz not null default now(),
  constraint nova_consent_state_consistent check (
    (status = 'granted' and granted_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create table public.nova_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(trim(action)) between 1 and 100),
  entity_type text not null check (char_length(trim(entity_type)) between 1 and 80),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index nova_organizations_created_by_idx on public.nova_organizations(created_by);
create index nova_org_memberships_user_status_idx on public.nova_organization_memberships(user_id, status);
create index nova_org_memberships_org_status_idx on public.nova_organization_memberships(organization_id, status);
create index nova_children_created_by_idx on public.nova_children(created_by);
create index nova_guardian_links_guardian_status_idx on public.nova_guardian_child_links(guardian_user_id, status);
create index nova_guardian_links_child_status_idx on public.nova_guardian_child_links(child_id, status);
create index nova_consents_guardian_child_idx on public.nova_consents(guardian_user_id, child_id, created_at desc);
create index nova_consents_child_type_idx on public.nova_consents(child_id, consent_type, created_at desc);
create index nova_audit_events_actor_created_idx on public.nova_audit_events(actor_user_id, created_at desc);

alter table public.nova_profiles enable row level security;
alter table public.nova_organizations enable row level security;
alter table public.nova_organization_memberships enable row level security;
alter table public.nova_children enable row level security;
alter table public.nova_guardian_child_links enable row level security;
alter table public.nova_consents enable row level security;
alter table public.nova_audit_events enable row level security;

-- Explicit API grants: new public tables are not assumed to be exposed.
revoke all on table
  public.nova_profiles,
  public.nova_organizations,
  public.nova_organization_memberships,
  public.nova_children,
  public.nova_guardian_child_links,
  public.nova_consents,
  public.nova_audit_events
from anon, authenticated;

grant select, insert, update on public.nova_profiles to authenticated;
grant select, insert, update on public.nova_organizations to authenticated;
grant select on public.nova_organization_memberships to authenticated;
grant select, insert, update on public.nova_children to authenticated;
grant select, insert on public.nova_guardian_child_links to authenticated;
grant select, insert on public.nova_consents to authenticated;
grant all on public.nova_profiles, public.nova_organizations,
  public.nova_organization_memberships, public.nova_children,
  public.nova_guardian_child_links, public.nova_consents,
  public.nova_audit_events to service_role;

-- Profiles: each signed-in user can access and maintain only their own profile.
create policy nova_profiles_select_self on public.nova_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy nova_profiles_insert_self on public.nova_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy nova_profiles_update_self on public.nova_profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Organizations: creator can manage the initial organization record.
-- Organization membership administration remains server-controlled in this foundation.
create policy nova_organizations_select_creator_or_member on public.nova_organizations
  for select to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.nova_organization_memberships m
      where m.organization_id = nova_organizations.id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
    )
  );
create policy nova_organizations_insert_creator on public.nova_organizations
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy nova_organizations_update_creator on public.nova_organizations
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- Membership records are visible only to the member concerned.
create policy nova_org_memberships_select_self on public.nova_organization_memberships
  for select to authenticated using (user_id = (select auth.uid()));

-- A guardian can see their own link; a new link can only be created by the
-- authenticated creator of the child, for their own account.
create policy nova_guardian_links_select_self on public.nova_guardian_child_links
  for select to authenticated using (guardian_user_id = (select auth.uid()));
create policy nova_guardian_links_insert_self_for_created_child on public.nova_guardian_child_links
  for insert to authenticated
  with check (
    guardian_user_id = (select auth.uid())
    and created_by = (select auth.uid())
    and exists (
      select 1 from public.nova_children c
      where c.id = nova_guardian_child_links.child_id
        and c.created_by = (select auth.uid())
    )
  );

-- Child access is restricted to the creator or an active linked guardian.
create policy nova_children_select_creator_or_guardian on public.nova_children
  for select to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.nova_guardian_child_links g
      where g.child_id = nova_children.id
        and g.guardian_user_id = (select auth.uid())
        and g.status = 'active'
    )
  );
create policy nova_children_insert_creator on public.nova_children
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy nova_children_update_creator_or_guardian on public.nova_children
  for update to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.nova_guardian_child_links g
      where g.child_id = nova_children.id
        and g.guardian_user_id = (select auth.uid())
        and g.status = 'active'
        and g.is_primary
    )
  )
  with check (
    created_by = (select auth.uid())
    or exists (
      select 1 from public.nova_guardian_child_links g
      where g.child_id = nova_children.id
        and g.guardian_user_id = (select auth.uid())
        and g.status = 'active'
        and g.is_primary
    )
  );

-- Consent records are append-only from the client in this first iteration.
create policy nova_consents_select_guardian on public.nova_consents
  for select to authenticated
  using (
    guardian_user_id = (select auth.uid())
    and exists (
      select 1 from public.nova_guardian_child_links g
      where g.child_id = nova_consents.child_id
        and g.guardian_user_id = (select auth.uid())
        and g.status = 'active'
    )
  );
create policy nova_consents_insert_guardian on public.nova_consents
  for insert to authenticated
  with check (
    guardian_user_id = (select auth.uid())
    and status = 'granted'
    and granted_at is not null
    and exists (
      select 1 from public.nova_guardian_child_links g
      where g.child_id = nova_consents.child_id
        and g.guardian_user_id = (select auth.uid())
        and g.status = 'active'
    )
  );

-- Audit events are intentionally not granted to authenticated/anon clients.
-- They are written by trusted server-side processes only.

-- Avoid accidentally exposing future tables through broad default privileges.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

comment on table public.nova_profiles is 'NOVA CUIDAR+ user profile; no authorization decisions from user-editable metadata.';
comment on table public.nova_organizations is 'NOVA CUIDAR+ service-provider and partner organizations.';
comment on table public.nova_organization_memberships is 'Server-managed organization membership and role assignments.';
comment on table public.nova_children is 'Minimum operational child profile; clinical notes and diagnoses are out of scope.';
comment on table public.nova_guardian_child_links is 'Verified application relationship between a guardian account and a child.';
comment on table public.nova_consents is 'Append-only consent evidence records for a guardian and child.';
comment on table public.nova_audit_events is 'Restricted server-side audit events; metadata must not contain secrets or unnecessary child data.';

commit;
