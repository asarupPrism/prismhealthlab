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

---

# Codebase Audit: Stubs, Dead-Ends, Loose Ends

The items below are either placeholders, partial implementations, or areas that require decisions before a full production rollout.

## Realtime/WebSockets

- `app/api/websocket/route.ts` is a stub: upgradeWebSocket() deliberately returns a 501 response and never establishes a real WebSocket.
  - Impact: `lib/websocket/client.ts` will fail to connect in production.
  - Options:
    - Use Supabase Realtime directly in the client (recommended) and remove the custom WebSocket route.
    - Or adopt a managed WebSocket provider (Ably, Pusher, or Vercel Edge WebSockets) and implement a proper upgrade path.
  - TODO:
    - Decide direction, remove dead code accordingly, and wire purchase/result channels through the chosen solution.

## Sentry/Error Monitoring

- `lib/monitoring/sentry.ts` exports `initializeSentry()` but is never called.
  - Impact: No error monitoring in production even if DSN is set.
  - TODO:
    - Call `initializeSentry()` from a top-level client boundary (e.g., `app/providers.tsx`) when `NEXT_PUBLIC_SENTRY_DSN` is present.
    - Confirm sampling rates, privacy masking, and PII scrubbing are compliant (HIPAA context is already considered in code).

## Push Notifications

- API routes exist for subscribe/unsubscribe/send and service worker handles `push`/`notificationclick`.
  - Prereqs: valid `VAPID_PUBLIC_KEY` (length 88) and `VAPID_PRIVATE_KEY`; presence of `push_subscriptions` and `user_preferences` tables and RLS.
  - TODO:
    - Set VAPID keys in Vercel and verify routes `/api/push/subscribe` and `/api/push/send`.
    - Validate DB schema exists and RLS allows only the owner to upsert/read.
    - Consider rate limiting and abuse controls on `/api/push/send`.

## Email Service

- `lib/email.ts` uses Resend REST API; templates are partially implemented (confirmation complete; reminders/results generated but review recommended).
  - TODO:
    - Set `RESEND_API_KEY`, `FROM_EMAIL` in Vercel.
    - Add retry/queue mechanism for reliability (e.g., Upstash Q/Sturdy Worker/Trigger.dev).
    - Add provider failover (optional) and delivery analytics (webhooks or provider API).

## Admin System Health + Checks

- `lib/admin-server-api.ts` and `lib/admin-client.ts` mark `systemHealth` as placeholder and TODO other checks (Swell/email/SMS).
  - TODO:
    - Implement `getSystemHealth()` checks: ping Supabase, Swell, email provider, and any SMS provider.
    - Replace placeholders with real status and surface in UI.

## Swell Integration

- Server-side admin Swell is implemented in `lib/admin-swell-server.ts` (lazy client OK for Vercel). Client `lib/admin-swell.ts` contains many TODOs and is not used by admin dashboard.
  - TODO:
    - Either remove/ignore client AdminSwell API or implement if you plan client-side admin.
    - Review PCI concerns: using `swell-js` for card data on client; confirm compliance and consider hosted payment if needed.

## PWA Manifest and Assets

- `public/manifest.json` exists but references icons and screenshots that are not present under `public/icons` and `public/screenshots`.
  - TODO:
    - Add the referenced icons and screenshots or update the manifest to point to existing assets.
    - Validate service worker registration (`hooks/usePWA.ts`) works in production and that cache strategies fit your SLA.

## Middleware + Edge Runtime Warnings

- Supabase SSR in middleware can emit Edge runtime warnings (Node APIs in dependency tree). Build passes; warnings are benign.
  - TODO:
    - If desired, split edge-safe imports or leave as-is since middleware currently functions.

## Database and RLS

- Migrations exist in `database/migrations/supabase/**` and admin SQL in `database/admin/**`, but Supabase linter flagged multiple public tables without RLS (see earlier section).
  - TODO:
    - Apply the RLS remediation plan (move backups to `admin` schema or enable deny-all RLS, add read policies for selected domain tables).
    - Verify tables used by push, HIPAA audit, orders, tests have appropriate RLS and indexes.

## HIPAA Audit Logger

- `lib/audit/hipaa-logger.ts` requires `hipaa_audit_logs` and optionally `HIPAA_AUDIT_ENCRYPTION_KEY`.
  - TODO:
    - Ensure migration `20250725_hipaa_audit_system.sql` is applied.
    - Set `HIPAA_AUDIT_ENCRYPTION_KEY` in Vercel for production.
    - Validate volume/retention strategy for audit logs.

## Performance + Monitoring

- `lib/monitoring/performance.ts` is present and used via hooks, but backends for metrics are console-only unless Sentry/analytics configured.
  - TODO:
    - Decide on analytics provider (Plausible/Umami) and wire basic events (optional).
    - Confirm sampling and privacy budgets.

## Testing + CI

- No test runner configured; guidelines suggest adding lightweight tests for critical logic.
  - TODO:
    - Add Jest/Vitest config for `lib/**` utilities.
    - Add a small CI (GitHub Actions) to run `npm run lint` and `npm run build` on PRs.

## Data/Setup Scripts

- Scripts exist under `/scripts` (e.g., `setup-admin-tables.js`, `populate-swell-products.js`).
  - TODO:
    - Document expected run order and environment for these scripts.
    - For production, avoid running seeders that create demo data.

## Versioning + App Metadata

- `NEXT_PUBLIC_APP_VERSION` is read by feature flags/monitoring but not set.
  - TODO:
    - Set `NEXT_PUBLIC_APP_VERSION` during CI or manually to aid monitoring and audit.

---

# Production Build-Out Guidelines

- Environments:
  - Keep `Preview` builds “safe”: disable payments and push by omitting secrets or using demo keys.
  - `Production` must include all required env vars (see list above), especially `SUPABASE_SERVICE_ROLE_KEY`.

- Next.js runtime:
  - Keep Node-only deps (e.g., `swell-node`, `web-push`) isolated to Node runtime routes/components.
  - Avoid prerendering pages that require server secrets; use `export const dynamic = 'force-dynamic'`.

- Security and RLS:
  - Enable and test RLS on all public tables; move backup tables to a private schema.
  - Ensure audit logging tables and policies exist; set encryption keys.

- Observability:
  - Call `initializeSentry()` in a client provider when DSN is present.
  - Start with low sampling in production (e.g., traces 0.1).

- Notifications:
  - Configure VAPID keys and verify service worker push path end-to-end.
  - Rate limit `/api/push/send` and enforce admin-only access.

- Realtime:
  - Prefer Supabase Realtime channels on client over custom WebSocket routing in serverless; remove the stub route.

- Compliance:
  - Mask PII in logs; verify Sentry privacy settings and SW cache rules.
  - Review email templates for PHI exposure.

- Performance:
  - Add Redis for caching if needed; confirm TTLs and invalidation.
  - Monitor bundle size (bundle analyzer already configured via `ANALYZE=true`).
