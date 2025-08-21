Prism Health Lab – Patient Portal and Admin Suite
=================================================

Production-ready Next.js (App Router) application for patient engagement, diagnostic test ordering, and healthcare operations. Integrates Supabase (auth + data), Swell (commerce), Redis (caching), Sentry (observability), and PWA features (offline + push).

Quick Links
- Deployment: DEPLOYMENT.md
- Architecture: ARCHITECTURE.md
- Security: SECURITY.md
- Style Guide: STYLEGUIDE.md
- Database: database/README.md
- Agents (AI/automation): AGENTS.md
- Open TODOs: docs/DEPLOYMENT_TODO.md

Features
- Patient portal: auth, dashboard, orders, results, analytics
- Admin suite: users, locations, appointments, orders, analytics
- Commerce: Swell catalog, cart, checkout, order logging
- Realtime + PWA: offline caching, push notifications, installable app
- Observability: performance metrics, error tracking hooks

Tech Stack
- Next.js 15 (App Router), TypeScript, TailwindCSS 4
- Supabase (Postgres, RLS, Realtime, Auth)
- Swell (storefront SDK + admin server SDK)
- Upstash Redis (optional caching), web-push (optional push)
- Sentry (optional monitoring)

Getting Started (Local)
1) Setup env vars
   cp .env.example .env.local
   # Fill values (see DEPLOYMENT.md for details)

2) Install and run
   npm install
   npm run dev
   # http://localhost:3000

3) Useful scripts
   npm run lint           # ESLint (core-web-vitals + TS)
   npm run build          # Production build
   npm run start          # Serve production build
   npm run setup-admin    # Create roles/departments (see database/admin)

Environment Variables (Essentials)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (admin/server-only)
- NEXT_PUBLIC_SWELL_STORE_ID, NEXT_PUBLIC_SWELL_PUBLIC_KEY, SWELL_SECRET_KEY
- Optional: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_SENTRY_DSN, RESEND_API_KEY

Project Structure
- app/ – routes, layouts, API routes (Node runtime for server-only deps)
- components/ – UI building blocks (auth, admin, portal, pwa)
- context/, hooks/ – React providers and custom hooks
- lib/ – server utilities, supabase, commerce, monitoring, cache, email
- database/ – SQL migrations, admin setup, docs
- scripts/ – one-off helpers (Swell populate, admin setup)
- public/ – PWA, static assets (manifest, sw.js)
- docs/ – TODOs and supporting docs

Development Notes
- Client vs Server: mark client components with 'use client'; keep server-only logic in lib/** and Node runtime API routes
- Type safety: strict TS; prefer named exports; follow repo lint rules
- RLS: All public tables must have RLS enabled; see SECURITY.md and database/migrations
- Commerce: client uses swell-js; server uses swell-node with lazy init (Vercel safe)
- PWA: service worker at public/sw.js; ensure referenced icons/screenshots exist

Deployment (Vercel)
- Required env vars set in Vercel: see DEPLOYMENT.md
- Admin subtree is dynamic (no prerender of server secrets)
- Swell API routes use runtime='nodejs' and dynamic='force-dynamic'
- See docs/DEPLOYMENT_TODO.md for outstanding tasks and RLS remediation

Troubleshooting
- Build stalls: ensure lazy server SDK init (done), Node runtime for server-only deps
- Admin prerender errors: ensure SUPABASE_SERVICE_ROLE_KEY is set; admin routes marked dynamic
- Supabase Edge warnings in middleware: harmless; split imports only if they escalate to errors
- Missing PWA assets: update public/manifest.json or add icons/screenshots

Contributing
- Follow AGENTS.md (for automation) and repo linting rules
- PRs must include purpose, linked issues, screenshots for UI, migration notes for database changes, and rollback steps
