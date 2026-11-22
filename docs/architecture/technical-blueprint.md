# NOVA CUIDAR+ — Technical Blueprint

## Product and architecture

NOVA CUIDAR+ is an independent national platform for Angola, initially focused on children and connecting families/responsible adults with individual caregivers and service-provider organizations. The platform supports individual and organizational providers and a hybrid payment model.

Recommended application stack:
- Next.js + TypeScript for the web application and trusted server-side workflows.
- Supabase PostgreSQL, Auth and private Storage.
- Vercel for application hosting.
- GitHub as the source of truth for code, SQL migrations and technical documentation.

The product is independent from CIADI and other NOVA applications. It has its own Supabase project and database.

## NOVA CORE boundaries

The first core release establishes identity, organizations, memberships, family/child records, guardian relationships, consent evidence and restricted audit events.

The first release does not store clinical notes, diagnoses, therapy records, medical histories or other clinical records. Child data must remain the minimum operational data needed to establish an authorised account relationship and service workflow.

Planned functional modules:
1. NOVA CORE — identity, accounts, organizations, access and audit.
2. Families and Children — guardian profiles, child profiles, verified relationships and consent.
3. Providers — individual and organizational provider onboarding and verification.
4. Services — service categories, service descriptions and service areas.
5. Scheduling — availability, requests and bookings.
6. Payments — hybrid payment workflows and reconciliation.
7. Communication — notifications and service-related messaging.
8. Reviews and reporting — controlled feedback, operational indicators and administration.

## Supabase deployment — created and verified

- Project: `NOVA CUIDAR+`
- Project ref: `jzzctsmpvprqpmvuemli`
- Project URL: `https://jzzctsmpvprqpmvuemli.supabase.co`
- Dashboard: `https://supabase.com/dashboard/project/jzzctsmpvprqpmvuemli`
- Organization: `CIADI PROJECT SITE` (`wgbwihdqskmhvfdeuggr`)
- Region: `eu-west-1` (Ireland)
- PostgreSQL: 17.12
- Plan at creation: Free; creation quote was US$0/month, subject to plan quotas and future paid upgrades/add-ons.
- Project status verified as `ACTIVE_HEALTHY`.

The project has its own database and is isolated from other project databases. It remains under the existing CIADI PROJECT SITE organization, so organization administration and billing context are shared.

## Database foundation — applied

The following migrations are committed to `feature/nova-cuidar-core-foundation` and applied to the NOVA CUIDAR+ Supabase project:

- `supabase/migrations/202611220001_nova_core_foundation.sql`
- `supabase/migrations/202611220002_nova_core_security_hardening.sql`

Tables created:
- `nova_profiles`
- `nova_organizations`
- `nova_organization_memberships`
- `nova_children`
- `nova_guardian_child_links`
- `nova_consents`
- `nova_audit_events`

All seven tables have Row Level Security enabled. Explicit table grants are used; anonymous access is not granted. Authenticated access is granted only where the initial workflows require it. Audit events are withheld from client access and reserved for trusted server-side processes.

The guardian-child access model is relationship-based. Child records are visible to their creator or an active linked guardian. The initial guardian link can only be created by the authenticated creator of the child. Additional guardian invitations and organization membership administration must be handled through trusted server-side workflows; clients cannot assign their own organization roles.

Consent records are append-only from the client in this foundation. Client insertion is limited to a currently linked guardian granting consent. Revocation and administrative corrections require a trusted server-side workflow and a separately reviewed migration/API.

## Security implementation rules

1. Authorization must use trusted database records or server-controlled app metadata, never user-editable user metadata.
2. RLS policies must check both authenticated identity and the actual relationship to the requested row.
3. UPDATE policies must include both `USING` and `WITH CHECK`; SELECT access must be separately granted where needed.
4. Views exposed to clients must use `security_invoker = true` where supported, or remain in a non-exposed schema with restricted grants.
5. Avoid `SECURITY DEFINER` functions unless a reviewed requirement proves they are necessary; any such function must be isolated, narrowly granted and audited.
6. Store identity/provider documents in private Storage buckets; issue short-lived signed access only after authorization checks.
7. Never expose service-role or secret keys in browser code or commit them to GitHub.
8. Audit security-sensitive events without logging passwords, tokens, full documents or unnecessary child data.
9. Keep schema migrations in version control and review them before applying to hosted environments.
10. Review Supabase Security and Performance Advisors after schema changes and before launch.

## Verification status — 22 November 2026

Verified after migration:
- Project reports `ACTIVE_HEALTHY`.
- Seven application tables exist in the `public` schema.
- RLS is enabled on all seven tables.
- No table grants SELECT access to `anon`.
- `nova_audit_events` has no client SELECT grant.
- Two migrations are recorded in the hosted database.
- Supabase Security Advisor returned no findings after the hardening migration.
- Performance Advisor returned only informational unused-index notices; these are expected on a newly created database with no application traffic.

Not yet verified or implemented:
- End-to-end RLS tests with real authenticated test accounts.
- Auth signup, email confirmation, password recovery and production SMTP configuration.
- Trusted server-side workflows for organization membership, additional guardian invitations and consent revocation.
- Private Storage buckets and upload/download policies.
- Provider, services, scheduling and payment modules.
- Application frontend, deployment, monitoring, backup/export and restore testing.

## Operational constraints

- Do not create real child records or test accounts without explicit approval.
- Do not add clinical data to the initial core.
- Do not configure production secrets in GitHub or client-side environment variables.
- Free-plan projects may be subject to quotas and inactivity pausing; maintain independent exports and verify recovery procedures before production use.
- No public launch should occur until authenticated end-to-end authorization tests, Auth settings, Storage controls and backup/recovery procedures have been verified.
