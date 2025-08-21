Deployment Guide (Vercel)
=========================

Overview
- Production builds run on Vercel with Node runtime for server‑only code and dynamic admin routes to avoid prerendering server secrets.
- See docs/DEPLOYMENT_TODO.md for open tasks and RLS remediation checklists.

Required Environment Variables
- Database (Supabase): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Commerce (Swell): `NEXT_PUBLIC_SWELL_STORE_ID`, `NEXT_PUBLIC_SWELL_PUBLIC_KEY`, `SWELL_SECRET_KEY`
- Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_VERSION`

Build Commands
- Install: (Vercel default) `npm ci`
- Build: `npm run build`
- Output: `.next`
- Node version: 18+ (default ok)

Runtime Configuration
- Admin subtree: mark pages/layout as `export const dynamic = 'force-dynamic'`
- Swell API routes: `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`
- Server SDKs: Lazy‑init `swell-node` and similar to avoid build‑time side effects

Known Pitfalls and Fixes
- Build stalls: initialize server SDKs lazily (implemented)
- Edge runtime warnings (Supabase SSR in middleware): benign; split imports only if they escalate to errors
- Admin prerender errors: ensure `SUPABASE_SERVICE_ROLE_KEY` is set; admin routes are dynamic
- Missing PWA assets: ensure icons/screenshots referenced in `public/manifest.json` exist

Post‑Deploy Verification
- Admin pages render and can access Supabase (service role on server)
- `/api/swell/*` endpoints respond (Node runtime)
- Push/email optional features respect configuration (disabled if keys missing)
- No RLS linter errors for public tables (see SECURITY.md)

Rollback
- Revert the failing commit and redeploy
- If DB migration misbehaves: revert migration or disable the offending policy temporarily; keep admin features server‑side until corrected

