# Security

## Secret Handling
- Supabase service key + any model API keys live in server-only env vars (Vercel project settings). Never imported in client components. No secrets in code or chat.

## Permission Model
- **v1 (demo-first):** RLS enabled on every table with permissive read/write policies so anonymous visitors can view seeded data and log sessions.
- **Lock-down sprint (later):** permissive policies replaced with `auth.uid() = user_id` on children; screen_sessions scoped through owning child; audit_logs insert-only (via service role) + owner read. Caregiver sees only their own children/sessions.
- Server actions validate input (duration > 0, child exists, no negative limits) before any write.

## Approved-Tools Rule
- Agent may call only named, narrow tools (`tag_session_activity`, `draft_limit_suggestion`, `draft_reminder`, `send_reminder`).
- No raw shell, file, or arbitrary HTTP execution.
- Each tool returns structured errors: `{retryable: bool, reason: string}`.

## Audit Principle
- Every meaningful mutation (create/update/delete on children or screen_sessions) and every agentic action appends an audit_logs row with actor, action, entity, before/after details.
- Audit logs are append-only; never deleted via app UI.

## Verification & Honesty
- Run `npm audit` for dependency vulnerabilities.
- Check: injection (parameterised Supabase queries), XSS (React escaping + no dangerouslySetInnerHTML on user notes), CSRF (Next server actions), rate-limiting on writes.
- State plainly what could NOT be verified (e.g., no real device-blocking integration exists in v1).
- Do not mark secure before a real check.