# Engineering Guide (Agent)

## Repository Context
- **Purpose**: Patient diagnostics platform for Prism Health Lab covering catalog, checkout, appointments, results, and admin ops.
- **Stack**: Next.js App Router 15, React 19, TypeScript (strict), Tailwind 4, Supabase, Swell, optional Upstash Redis, Sentry, PWA/Web Push.
- **Key Paths**: `app/` (routes/API), `components/` (UI), `lib/` (server/client libs), `context/`, `hooks/`, `database/`, `scripts/`, `public/`, `styles/`, `types/`, `docs/`.

## Architecture Overview
- **Server boundaries**: Keep server-only code under `lib/**` with `import 'server-only'` where applicable. Do not import server modules from client components.
- **App Router**: Use `app/**/page.tsx` for views, `app/api/**/route.ts` for APIs. Prefer server components by default; add `'use client'` only where needed.
- **Supabase**: Use `lib/supabase/server.ts` (server) and `lib/supabase/client.ts` (client). Respect RLS.
- **E‑commerce**: Swell client in `lib/swell.ts` (browser) and server integrations guarded from client bundling (`next.config.ts` fallbacks).
- **Feature flags**: `lib/feature-flags.ts`, `lib/deployment-config.ts` drive full/degraded modes and fallbacks.

## Coding Style & Conventions
- **Language**: TypeScript, strict. Path alias: `@/*`.
- **Components**: PascalCase filenames; colocate small helpers near usage; prefer named exports.
- **Formatting/Lint**: ESLint via `eslint.config.mjs` (`next/core-web-vitals`). Run `npm run lint` and fix.
- **Styling**: Tailwind classes; prefer utility classes over custom CSS. Use `styles/accessibility.css` for global a11y tweaks.
- **Client vs Server**: Mark client components with `'use client'`. Avoid importing server-only code into client bundles; cross boundary via API routes or server actions.

## Data & Security Rules
- **Auth**: Supabase session managed in `middleware.ts`. Gate admin via `app/admin/layout.tsx` + `lib/admin-server.ts`.
- **2FA**: Use `lib/auth/two-factor.ts` flows for TOTP; do not reimplement.
- **HIPAA audit**: Log sensitive operations using `lib/audit/hipaa-logger.ts` for PHI access/changes and security events.
- **PII**: Never log PHI/PII. Sentry sanitization is enabled; still avoid sending secrets/PII to logs.
- **Secrets**: Use `.env.local`; never commit secrets. Required vars are validated in `next.config.ts` and `lib/env-validation.ts`.

## Feature Flags & Degraded Mode
- **Detection**: `next.config.ts` sets `NEXT_PUBLIC_DEPLOYMENT_MODE` and `NEXT_PUBLIC_FEATURES_AVAILABLE`.
- **Usage**: Query `isFeatureEnabled('database'|'ecommerce'|...)` and `getDeploymentConfig()` from `lib/deployment-config.ts`.
- **Fallbacks**: Prefer `lib/fallbacks/**` when services are unavailable (mock data, demo catalog, memory cache, email fallback for push).

## Development Workflow
- **Run**: `npm run dev` (http://localhost:3000), `npm run build`, `npm run start`, `npm run lint`.
- **Scripts**: `node scripts/setup-admin-tables.js`, `node scripts/populate-swell-products.js`, `node scripts/test-swell-connection.js`.
- **Env**: See `.env.example`. Critical: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SWELL_STORE_ID`, `NEXT_PUBLIC_SWELL_PUBLIC_KEY`.

## Testing & Verification
- **Status**: No unit test framework in repo. For critical logic in `lib/**` or `app/api/**`, consider adding Jest/Vitest colocated `*.test.ts` (keep scope minimal).
- **Manual checks**: Verify auth redirects, checkout flow, orders API, appointment creation, and degraded mode behavior.

## Commit & PR Rules
- **Commits**: Imperative, concise (e.g., `Fix TypeScript build error`). Optional scope: `feat(admin): ...`.
- **PRs**: Include purpose, linked issues, screenshots for UI, DB migration notes for `database/**`, and rollback steps. Ensure `npm run lint` and `npm run build` pass.

## When Adding Features
- **Server-first**: Put sensitive logic in server components/API routes. Use Supabase server client; verify RLS access.
- **Audit & Security**: Log via HIPAA logger for PHI access/changes; integrate 2FA where relevant.
- **Monitoring**: Use `lib/monitoring/sentry.ts` helpers (`trackAPICall`, `trackHealthCheck`, `trackCacheEvent`); avoid sending PII.
- **Performance**: Favor server rendering; lazy-load heavy UI. Follow patterns in `lib/monitoring/performance.ts`.
- **PWA/Realtime**: Use `hooks/usePWA` and `lib/websocket/client.ts` conventions; add server endpoints under `app/api/**`.

## Do / Don’t
- **Do**: Keep diffs minimal, align with folder structure, add docs for new endpoints, validate env flags, prefer fallbacks when integrations are absent.
- **Don’t**: Bypass RLS, log PHI, import server modules into client, disable lint/types, commit secrets, or introduce heavyweight deps without need.

