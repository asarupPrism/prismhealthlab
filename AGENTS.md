Prism Health Lab – Agent Guide
==============================

Purpose
- How automation/AI agents should safely make high‑quality changes that ship.

Ground Rules
- Be surgical: change only what’s required; preserve style/structure.
- Prefer minimal, high‑value patches; avoid unrelated refactors.
- Never commit secrets; validate env via `lib/env-validation.ts`.
- Keep server‑only deps (e.g., `swell-node`, `web-push`) out of client bundles.

Project Structure (essentials)
- `app/`: App Router routes, layouts, API routes (use Node runtime for server‑only deps)
- `components/`: UI building blocks (auth, admin, portal, pwa, seo)
- `lib/`: Supabase, Swell, cache, monitoring, email, actions
- `database/`: SQL migrations and admin setup
- `scripts/`: Utilities (populate Swell, setup admin tables)
- `public/`: PWA assets (manifest, sw.js)

Commands
- `npm run dev` – local dev (http://localhost:3000)
- `npm run build` – production build; must pass
- `npm run start` – serve production build
- `npm run lint` – ESLint (core-web-vitals + TS)

Coding Standards
- TypeScript strict; path alias `@/*` (tsconfig.json)
- Client vs Server: use `'use client'` for client components; keep server logic in `lib/**`
- Named exports preferred; 2‑space indentation
- Respect RLS and PHI boundaries; avoid logging sensitive data

Runtime/Deployment
- Vercel: Admin subtree is dynamic (no prerender of server secrets)
- Swell API routes: `export const runtime='nodejs'` and `export const dynamic='force-dynamic'`
- Lazy‑init server SDKs (e.g., `swell-node`) to avoid build‑time side effects
- PWA: ensure `public/manifest.json` assets exist; service worker at `public/sw.js`

Planning and Patching
- Create a short plan (steps) before large changes
- Group related edits; keep commit messages concise and imperative
- Update docs when behavior changes (README.md, DEPLOYMENT.md, SECURITY.md, STYLEGUIDE.md)

Testing Philosophy
- Run `npm run build` and `npm run lint` locally when possible
- Add focused tests for pure utilities in `lib/**` when logic changes are non‑trivial
- Don’t add new frameworks unless requested

Security & Compliance
- RLS must be enabled for public tables; see SECURITY.md and database migrations
- Sentry must scrub PHI; push/email payloads must avoid sensitive data
- Use service role only server‑side; never expose in client code

Follow the Style Guide
- All changes must adhere to STYLEGUIDE.md (coding, security, performance, testing, docs).

Hand‑off Expectations
- Summarize changes (files, rationale, risk)
- Call out migrations, env var changes, and any manual steps
- Link to relevant docs (DEPLOYMENT.md, ARCHITECTURE.md, SECURITY.md)
