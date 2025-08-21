Engineering Style Guide
=======================

Objective
- Ensure enterprise-grade, gold-standard quality across code, docs, reviews, security, performance, and operations.

Coding Standards
- TypeScript strict: no `any` (except narrow, justified cases); prefer explicit types for public APIs.
- Naming: PascalCase for components, camelCase for vars/functions, UPPER_SNAKE_CASE for constants/env.
- Exports: prefer named exports; avoid default exports unless required by libraries.
- Structure: client code in components/hooks/context; server-only code in `lib/**` and Node runtime API routes.
- Boundaries: do not import server-only deps into client bundles; use dynamic imports/Node runtime.
- Errors: fail fast with actionable messages; avoid swallowing errors; propagate with context.
- Logging: no PHI/PII in logs; use levels (debug/info/warn/error); keep server logs concise.

Security & Compliance
- Secrets: never commit; use env vars; service role only on server.
- RLS: enable on all public tables; document policies with migrations; test access paths.
- PHI/PII: scrub from Sentry and logs; notifications should link back to portal for details.
- Dependencies: avoid client bundling of native/server deps (`swell-node`, `web-push`, etc.).
- Auditing: log sensitive access via `lib/audit/hipaa-logger.ts`; set encryption keys in prod.

UI Design System (Visual)
- Route: `/styleguide` (App Router) showcases the canonical design system.
- Palette: Primary Cyan `#06b6d4`, Medical Blue `#3b82f6`, Health Green `#10b981`, Warning Amber `#f59e0b`, Critical Rose `#f43f5e`, Dark neutrals (Slate 50–950).
- Typography: Headline scale (6xl, 4xl, 2xl, xl, lg) with clinical clarity; body text (lg/base/sm) with high contrast; respect reduced-motion.
- Components: Glass-morphism cards, soft borders, subtle shadows; accessible focus styles; responsive grid spacing from `/styleguide` examples.
- Motion: Professional easing ([0.4, 0.0, 0.2, 1]); minimal motion defaults; support reduced-motion.

Performance & Reliability
- Budgets: aim for Core Web Vitals passing thresholds (LCP <2.5s, CLS <0.1, INP <200ms).
- Caching: use Redis for hot paths when configured; set sensible TTLs; invalidate on writes.
- Async: use timeouts and retries with backoff for external calls; keep default timeouts <15s.
- Bundles: leverage `optimizePackageImports`; lazy-load heavy client modules; use bundle analyzer.

Testing & Quality Gates
- Lint: `npm run lint` must pass; no `eslint-disable` unless justified with comments.
- Types: `tsc --noEmit` must pass; fix types at source.
- Tests: add focused unit tests for pure utilities in `lib/**` when logic is non-trivial.
- CI: builds must pass `lint` and `build` before merge to main.

API & Data Contracts
- Next.js App Router conventions; prefer `Response` helpers and typed request bodies.
- Use Zod or clear TS interfaces at the boundary; validate external inputs.
- Error shape: `{ error: string, ...context }` with appropriate HTTP status.

Observability
- Sentry: initialize only when DSN set; modest sampling in prod; scrub PII/PHI via hooks.
- Metrics: track key user paths (checkout, results fetch) and critical API failures.

Accessibility & UX
- Adhere to WCAG AA for color contrast; provide keyboard access and focus states.
- Respect reduced-motion; prefer system fonts and performant animations.
- Follow patterns demonstrated in `/styleguide` for color usage, spacing, and content hierarchy.

Documentation & Reviews
- Keep README current; update DEPLOYMENT.md, ARCHITECTURE.md, SECURITY.md on relevant changes.
- Changelogs in PRs: purpose, files touched, risk, migrations, env changes, rollbacks.
- Commit messages: imperative, scoped when helpful (e.g., `feat(admin): ...`).

Release Management
- Use feature flags where feasible; default safe in preview.
- Document migrations with rollback steps; verify RLS after DB changes.
