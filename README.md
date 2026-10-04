# Screen Time Control

A working, no-login caregiver demo: manage children and daily limits, log screen sessions, edit/delete records with reasons, and view today's usage and session history.

Production: https://screentime-control.vercel.app

## Run locally

1. `npm ci`
2. `vercel link` then `vercel env pull .env.local`
3. Apply unapplied files in `supabase/migrations/` in order to the linked Supabase project.
4. `npm run dev`

All database access lives in `lib/data/`. Server actions validate mutations; database triggers atomically append before/after audit records. Audit records cannot be modified by anonymous or authenticated API clients. Database writes are limited to 120 audit-producing changes per minute across the shared demo.

Daily totals use the browser's local day. The dashboard refreshes after logging and every 30 seconds. Amber starts at 75% to satisfy the PRD's 90/120 acceptance scenario; red means strictly above the limit.

## Validation (3 October 2026)

- Production Vercel build passed, including TypeScript checks.
- Public URL tested without login; seeded children and persisted sessions visible.
- UI: logged 30 minutes for Mia, verified dashboard update, reload persistence, one session row and one atomic audit entry.
- UI: added child with 60-minute limit, logged 70 minutes and verified red; edited session to 40 minutes and changed child limit to 90 minutes, with reasons persisted in audit entries.
- Live database: create/edit/delete child and session; invalid duration rejected; test records cleaned up without altering existing records.
- Production dependency audit: zero vulnerabilities. Full audit reports five development-only advisories through ESLint's `fast-glob` / `micromatch` / `braces` dependency; the current published braces version has no fix.
- Local production build/server execution is restricted by the Windows sandbox; final builds and browser checks run on Vercel.

## Scope

This is a public, shared demo workspace. Use fictional children. Auth and owner-scoped RLS are the later lock-down sprint; AI insights and reports are also deferred, per the PRD. No OS-level device blocking is implemented.

Deploy only by committing and pushing to `main`; Vercel is connected to the GitHub repository. Never deploy local files using `vercel deploy`.

## Whole-day login/logout tracking (4 October 2026)

Use each child's **Log in / start** and **Log out / stop** buttons when screen use begins and ends. Every login creates a persistent session; logout closes it using the database clock. Logging in again starts another session without resetting the daily allowance. Running sessions survive page reloads and continue counting until explicitly logged out. Breaks are excluded, overlapping active logins for one child are prevented, and cross-midnight sessions count only their overlap with each local calendar day. Totals use timestamp precision, rounded to one decimal minute only for display; repeated short visits do not incur a one-minute rounding charge each time. Retrospective manual logging remains available.

Verified two persisted login/logout cycles, duplicate start/stop rejection, atomic audit entries, and cumulative usage. `node tests/session-time.test.cjs` covers repeated visits, breaks, running sessions, local midnight, and short-session precision.
