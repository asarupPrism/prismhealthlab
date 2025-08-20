# Repository Guidelines

## Project Structure & Modules
- `app/`: Next.js App Router pages, layouts, API routes.
- `components/`: Reusable UI (auth, portal, layout, pwa, seo).
- `lib/`: Application logic (auth, supabase, monitoring, cache, pdf, email, server utilities) and `lib/actions/` for server actions.
- `context/` and `hooks/`: React context providers and custom hooks.
- `database/`: SQL schemas, migrations, admin setup, and docs.
- `scripts/`: Node utilities (populate Swell, setup admin tables, connectivity tests).
- `public/` and `styles/`: Static assets, service worker, Tailwind styles.
- `types/` and `docs/`: Shared TypeScript types and project documentation.

## Build, Test, and Development
- `npm run dev`: Start local dev server at `http://localhost:3000` (Turbopack).
- `npm run build`: Compile production build.
- `npm run start`: Serve production build.
- `npm run lint`: Run ESLint (Next.js core-web-vitals + TypeScript).
- Connectivity/util scripts: `node scripts/test-swell-connection.js`, `node scripts/test-module-resolution.js`.
- Data/setup scripts: `node scripts/populate-swell-products.js`, `node scripts/setup-admin-tables.js`.

## Coding Style & Naming
- Language: TypeScript, strict mode; path alias `@/*` (see `tsconfig.json`).
- Components: PascalCase filenames in `components/` and `app/**/page.tsx` for routes.
- Indentation: 2 spaces; prefer named exports; avoid default unless required.
- Client vs Server: Mark client components with `'use client'`; keep server-only logic in `lib/**`.
- Linting/format: ESLint enforced via `npm run lint`; follow auto-fix suggestions.

## Testing Guidelines
- No unit test runner is configured yet. For new critical logic, add lightweight tests (e.g., Jest/Vitest) with files named `*.test.ts(x)` colocated with sources.
- Use scripts for integration checks (Swell, module resolution). Validate key flows manually: auth, checkout, portal, admin.
- Aim for high-value coverage on pure utilities in `lib/**`.

## Commit & Pull Requests
- Commits: Imperative, concise subjects (e.g., "Fix TypeScript build error"). Optional scope: `feat(admin): …` is welcome but not required.
- PRs must include: purpose, linked issues, screenshots for UI, migration notes for any `database/**` changes, and clear rollback steps.
- Checks: Ensure `npm run lint` and `npm run build` pass; include script outputs if relevant.

## Security & Configuration
- Secrets in `.env.local` (never commit). Validate with `lib/env-validation.ts`.
- Review HIPAA logging and monitoring settings in `lib/audit/**` and `lib/monitoring/**` before enabling.
- Database changes go through `database/migrations/supabase/**` with documented steps in PR.
