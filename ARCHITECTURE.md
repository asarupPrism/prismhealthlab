Architecture Overview
=====================

Core Services
- Supabase (Postgres + RLS + Realtime + Auth)
- Swell (storefront client SDK + server admin SDK)
- Optional: Upstash Redis (cache), Sentry (monitoring), Web Push (notifications)

Code Modules
- `app/` – App Router routes and API handlers
  - Admin routes are dynamic to avoid prerendering server secrets
  - Node runtime for routes using server‑only deps (e.g., `web-push`, `swell-node`)
- `lib/` – Integrations and utilities
  - `supabase/*` – server/browser clients and middleware
  - `admin-swell-server.ts` – server‑only Swell (lazy init)
  - `swell.ts` – client storefront helpers
  - `cache/redis.ts` – optional Redis cache wrapper
  - `monitoring/*` – performance + Sentry helpers
  - `audit/hipaa-logger.ts` – tamper‑aware audit logs
- `database/` – SQL migrations (Supabase), admin setup scripts

Data Flows (examples)
- Checkout: client cart (swell.js) → order submit → server logs order to Supabase (`/api/orders`)
- Admin analytics: server gathers Supabase stats + Swell analytics
- Portal analytics: server aggregates orders + results (RLS‑safe) with caching hook

Runtime Separation
- Client: UI, pwa, swell storefront, analytics hooks
- Server: admin Swell, email, push, HIPAA audit, database ops with service role

Security Model
- RLS enforced for public schema; admin functions use service role in server context
- PHI/PII scrubbed in Sentry; limited logging in server routes
- Push/email payloads avoid sensitive data; audit logs capture accesses

Extensibility
- Add new providers under `lib/**` with clear server/client boundaries
- Keep migrations additive with documented RLS policies

