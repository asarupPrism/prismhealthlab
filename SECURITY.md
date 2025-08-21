Security and Compliance
=======================

Principles
- Minimize PHI/PII exposure in code, logs, and third‑party services
- Enforce RLS on all public tables; restrict admin operations to server with service role
- Prefer defense‑in‑depth: schema separation for backups/admin data, strict policies

Row Level Security (RLS)
- Enable RLS on all `public.*` tables exposed via PostgREST
- Backups: move to `admin` schema or enable RLS deny‑all (no policies)
- Domain tables: either admin‑only (no policies) or read‑only for `authenticated`
- See docs/DEPLOYMENT_TODO.md for concrete SQL and remediation steps

Secrets and Environment
- Never commit secrets; supply via Vercel env vars
- `SUPABASE_SERVICE_ROLE_KEY` must be server‑only; never used client‑side
- Optional keys (Sentry, Redis, Push, Email) enable features but are not required to build

Sentry and Monitoring
- Initialize Sentry only when DSN is configured
- Use privacy integrations and `beforeSend`/`beforeSendTransaction` to scrub PII/PHI
- Keep sampling modest in production (e.g., traces: 0.1)

Email and Push
- Avoid PHI in notification payloads; link back to portal for details
- Validate VAPID keys; rate‑limit `/api/push/send` and require admin/system auth
- Use provider webhooks (optional) for delivery status

Audit Logging
- `lib/audit/hipaa-logger.ts` writes tamper‑aware entries to `hipaa_audit_logs`
- Set `HIPAA_AUDIT_ENCRYPTION_KEY` in production
- Define retention and access procedures

Dependency Hygiene
- Server‑only deps (e.g., `swell-node`, `web-push`) must not bundle to client; use Node runtime and lazy init
- Keep `next.config.ts` fallbacks for native modules on client

