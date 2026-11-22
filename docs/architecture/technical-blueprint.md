

## Supabase deployment decision — confirmed

The user confirmed that NOVA CUIDAR+ must use a **dedicated Supabase project**, separate from CIADI and other NOVA products. This is a project-level isolation decision; it does not yet authorize project creation, billing, database migrations, or production configuration.

### Proposed project configuration

- Project name: `nova-cuidar-plus`.
- Region recommendation: `eu-west-1` (Ireland), subject to the user's confirmation and available plan/organization options.
- Database: dedicated PostgreSQL instance for NOVA CUIDAR+.
- Authentication: Supabase Auth; email confirmation enabled before public launch.
- Data access: explicit least-privilege grants and Row Level Security on every exposed table.
- Storage: private buckets by default; no public bucket for child, guardian, provider, or service documents.
- API keys: publishable key only in browser code; secret/service-role keys restricted to trusted server-side environments and never committed to Git.
- Environments: local development and hosted project; add a separate staging project before production launch if the chosen plan and budget support it.
- Backups/recovery: choose plan and retention after cost review; perform and document a restore test before production use.

### Security implementation rules

1. Authorization must use trusted database records or server-controlled app metadata, never user-editable user metadata.
2. RLS policies must check both the authenticated identity and the actual relationship to the requested row (guardian-child, provider-booking, or organization membership).
3. UPDATE policies must include both `USING` and `WITH CHECK`; SELECT access must be separately granted where needed.
4. Views exposed to clients must use `security_invoker = true` where supported, or remain in a non-exposed schema with restricted grants.
5. Avoid `SECURITY DEFINER` functions unless a reviewed requirement proves they are necessary; any such function must be isolated, narrowly granted, and audited.
6. Do not store clinical notes, diagnoses, or treatment records in the first NOVA CORE release. The first release manages only the minimum operational child profile and authorised service relationship.
7. Store uploaded identity/provider documents in private Storage buckets and issue short-lived signed access only after authorization checks.
8. Audit security-sensitive events without logging passwords, tokens, full documents, or unnecessary child data.
9. Keep database schema migrations in version control and review them before applying to hosted environments.
10. Review Supabase Security and Performance Advisors after schema implementation and before launch.

### Current Supabase organization discovery

The connected Supabase account currently exposes one organization: `CIADI PROJECT SITE`. The user must explicitly confirm whether the dedicated NOVA CUIDAR+ project should be created inside this organization or whether a separate Supabase organization should be created first. A separate project inside the existing organization provides database/project isolation, but billing and organization-level administration remain shared.

### Current status

- Dedicated-project requirement: confirmed by user.
- Supabase organization: discovered, not yet selected by user.
- Region: recommended, not yet confirmed.
- Cost quote: not yet requested; must be retrieved for the selected organization before project creation.
- Supabase project: not created.
- Database schema, Auth settings, Storage buckets, RLS policies and secrets: not configured.
