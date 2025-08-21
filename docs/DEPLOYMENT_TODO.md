# Deployment TODOs (Vercel + Supabase)

This document lists the concrete actions to stabilize Vercel deployments and remediate Supabase linter findings. Execute items in order.

## Immediate

- Ensure `SUPABASE_SERVICE_ROLE_KEY` exists in Vercel → Settings → Environment Variables.
  - Scope: Production (and Preview if admin must work there)
  - Value: Supabase → Project Settings → API → Service Role Key
- Redeploy from `main` to pick up recent fixes:
  - Admin pages/layout marked `dynamic = 'force-dynamic'`
  - Swell API routes set `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`
  - Lazy initialization for `swell-node` server client
  - Installed `@emotion/is-prop-valid` to satisfy framer-motion warning

## Supabase Linter: RLS Disabled (Errors to Fix)

The following tables were flagged with RLS disabled in `public` (exposed to PostgREST):

- Backups: `public._policy_backup`, `public._backup_staff`, `public._backup_staff_roles`, `public._backup_staff_departments`
- Domain data: `public.test_requirements`, `public.condition_test_recommendations`, `public.seasonal_test_trends`, `public.test_bundles`, `public.biomarker_definitions`, `public.test_result_templates`, `public.data_retention_policies`

Choose an approach and apply SQL (preferably as migrations). See “Migrations” below.

### Backups (Recommended: move out of public + lock down)

Option B (preferred): move to private `admin` schema and restrict access

```
-- Create private schema
CREATE SCHEMA IF NOT EXISTS admin;

-- Move backup tables out of public
ALTER TABLE public._policy_backup SET SCHEMA admin;
ALTER TABLE public._backup_staff SET SCHEMA admin;
ALTER TABLE public._backup_staff_roles SET SCHEMA admin;
ALTER TABLE public._backup_staff_departments SET SCHEMA admin;

-- Lock down schema to server-side only (defense in depth)
REVOKE ALL ON SCHEMA admin FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA admin FROM anon, authenticated;

-- Enable RLS on moved tables (optional but recommended)
ALTER TABLE admin._policy_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin._backup_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin._backup_staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin._backup_staff_departments ENABLE ROW LEVEL SECURITY;
```

Option A (faster): keep in `public` but enable RLS and define no policies (deny all)

```
ALTER TABLE public._policy_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_staff_departments ENABLE ROW LEVEL SECURITY;
```

### Domain Tables (decide intent per table)

1) Admin-only (no client access)

```
-- Deny through PostgREST; serve via server-only endpoints using service role
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
-- no policies created
```

2) Read-only for authenticated users

```
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
CREATE POLICY authenticated_read ON public.<table_name>
FOR SELECT TO authenticated
USING (true);
```

Apply the chosen policy to each of:

- `test_requirements`
- `condition_test_recommendations`
- `seasonal_test_trends`
- `test_bundles`
- `biomarker_definitions`
- `test_result_templates`
- `data_retention_policies`

## Migrations (repo changes to make)

- Add SQL migration files under `database/migrations/supabase/<timestamp>__*.sql` with the statements above.
- Include a short README note in `database/` explaining the intent (why backups are private, which domain tables are readable, etc.).
- After applying migrations, run the Supabase linter again and verify no `RLS Disabled in Public` errors remain.

## Vercel/Next Runtime Notes

- Admin subtree: marked as dynamic to avoid build-time evaluation of server-only secrets.
  - Files updated: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/locations/page.tsx`, `app/admin/users/staff/page.tsx`
- Swell API routes: `runtime = 'nodejs'` and `dynamic = 'force-dynamic'` to avoid Edge/static constraints.
  - Files: `app/api/swell/analytics/route.ts`, `app/api/swell/orders/route.ts`, `app/api/swell/inventory/route.ts`
- Middleware: Supabase SSR may log Edge warnings; these are benign unless they convert to errors. If needed, refactor imports to be edge-safe.

## Environment Variables (Vercel)

Required for full functionality:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/admin features)
- `NEXT_PUBLIC_SWELL_STORE_ID`
- `NEXT_PUBLIC_SWELL_PUBLIC_KEY`
- `SWELL_SECRET_KEY`

Optional (enables enhanced features):

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (caching)
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (web push)
- `NEXT_PUBLIC_SENTRY_DSN` (monitoring)

## Verification Checklist

- Build on Vercel completes without prerender errors.
- Admin pages render at runtime and can access Supabase via service role (server-only).
- API routes under `/api/swell/*` respond successfully in production.
- Supabase linter shows no `RLS Disabled in Public` errors.
- Optional: No warning for `@emotion/is-prop-valid` in build logs.

## Rollback

- If migration causes unintended access issues, disable RLS policies or revert schema moves with `ALTER TABLE ... SET SCHEMA public;` and redeploy. Keep service functionality behind server-only endpoints while investigating.
