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

Documentation & Reviews
- Keep README current; update DEPLOYMENT.md, ARCHITECTURE.md, SECURITY.md on relevant changes.
- Changelogs in PRs: purpose, files touched, risk, migrations, env changes, rollbacks.
- Commit messages: imperative, scoped when helpful (e.g., `feat(admin): ...`).

Release Management
- Use feature flags where feasible; default safe in preview.
- Document migrations with rollback steps; verify RLS after DB changes.

