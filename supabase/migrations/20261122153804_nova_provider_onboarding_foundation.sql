create table public.nova_provider_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  provider_type text not null check (provider_type in ('individual','organization')),
  organization_id uuid references public.nova_organizations(id) on delete restrict,
  public_name text not null check (char_length(trim(public_name)) between 2 and 160),
  professional_summary text check (professional_summary is null or char_length(professional_summary) <= 2000),
  qualification_path text not null check (qualification_path in ('certified','experience_based','both')),
  years_experience smallint check (years_experience is null or years_experience between 0 and 60),
  experience_summary text check (experience_summary is null or char_length(experience_summary) <= 2000),
  service_categories text[] not null default '{}',
  provinces text[] not null default '{}',
  verification_status text not null default 'pending'
    check (verification_status in ('pending','under_review','changes_requested','approved','rejected','suspended')),
  is_public boolean not null default false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nova_provider_type_org_consistency check (
    (provider_type = 'individual' and organization_id is null)
    or (provider_type = 'organization' and organization_id is not null)
  ),
  constraint nova_provider_public_requires_approval check (
    is_public = false or verification_status = 'approved'
  )
);

create index nova_provider_profiles_owner_idx on public.nova_provider_profiles(owner_user_id);
create index nova_provider_profiles_org_idx on public.nova_provider_profiles(organization_id) where organization_id is not null;
create index nova_provider_profiles_discovery_idx on public.nova_provider_profiles(verification_status, is_public, provider_type);

alter table public.nova_provider_profiles enable row level security;

create policy nova_provider_profiles_select_owner
on public.nova_provider_profiles for select to authenticated
using (owner_user_id = (select auth.uid()));

create policy nova_provider_profiles_insert_owner_pending
on public.nova_provider_profiles for insert to authenticated
with check (
  owner_user_id = (select auth.uid())
  and verification_status = 'pending'
  and is_public = false
  and reviewed_at is null
  and reviewed_by is null
  and (
    (provider_type = 'individual' and organization_id is null)
    or (
      provider_type = 'organization'
      and organization_id is not null
      and exists (
        select 1 from public.nova_organization_memberships m
        where m.organization_id = nova_provider_profiles.organization_id
          and m.user_id = (select auth.uid())
          and m.status = 'active'
          and m.role in ('owner','admin','manager')
      )
    )
  )
);

create policy nova_provider_profiles_update_owner
on public.nova_provider_profiles for update to authenticated
using (owner_user_id = (select auth.uid()))
with check (
  owner_user_id = (select auth.uid())
  and verification_status in ('pending','changes_requested')
  and is_public = false
  and reviewed_at is null
  and reviewed_by is null
);

revoke all on public.nova_provider_profiles from anon, authenticated;
grant select on public.nova_provider_profiles to authenticated;
grant insert (owner_user_id, provider_type, organization_id, public_name, professional_summary, qualification_path, years_experience, experience_summary, service_categories, provinces)
on public.nova_provider_profiles to authenticated;
grant update (public_name, professional_summary, qualification_path, years_experience, experience_summary, service_categories, provinces)
on public.nova_provider_profiles to authenticated;

create table public.nova_provider_review_events (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references public.nova_provider_profiles(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  previous_status text check (previous_status is null or previous_status in ('pending','under_review','changes_requested','approved','rejected','suspended')),
  new_status text not null check (new_status in ('pending','under_review','changes_requested','approved','rejected','suspended')),
  decision_note text check (decision_note is null or char_length(decision_note) <= 2000),
  created_at timestamptz not null default now()
);

create index nova_provider_review_events_profile_idx
on public.nova_provider_review_events(provider_profile_id, created_at desc);

alter table public.nova_provider_review_events enable row level security;
revoke all on public.nova_provider_review_events from anon, authenticated;

comment on table public.nova_provider_profiles is
'NOVA CUIDAR+ provider onboarding profile. Client users can edit professional details only; verification and public visibility are server-controlled.';
comment on table public.nova_provider_review_events is
'Restricted append-only history of administrative provider verification decisions. No direct client access.';
