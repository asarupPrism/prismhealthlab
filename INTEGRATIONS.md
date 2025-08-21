Integrations
============

Swell (Commerce)
- Client: `lib/swell.ts` wraps `swell-js` with initialization guard
- Server: `lib/admin-swell-server.ts` lazily creates `swell-node` client
- API routes: `app/api/swell/*` use Node runtime and are forced dynamic
- Scripts: `scripts/populate-swell-products*.js` for catalog seeding
- Notes:
  - Keep card data handling PCI‑aware; prefer provider‑hosted fields where possible
  - Admin analytics/routes must remain server‑only

Supabase (Auth/Data/Realtime)
- Clients: `lib/supabase/server.ts`, `lib/supabase/client.ts`, middleware in `lib/supabase/middleware.ts`
- RLS: all public tables require RLS; see SECURITY.md and database/migrations
- Realtime: prefer client channels (consider removing stubbed custom WebSocket route)

Redis (Optional Cache)
- `lib/cache/redis.ts` provides a safe, optional wrapper
- Missing config falls back gracefully with warnings

Sentry (Optional Monitoring)
- `lib/monitoring/sentry.ts` with privacy controls
- Call initialization from a top‑level client provider when DSN present

Email (Resend)
- `lib/email.ts` posts to Resend REST API; configure `RESEND_API_KEY`
- Consider queue/retry for reliability; avoid PHI in payloads

