# Architecture

## Stack
Next.js (App Router) · Supabase (Postgres + RLS) · Vercel deploy.

## Build Now vs Later
- **Now:** child profiles, daily limits, session logging, today dashboard with limit bars.
- **Later:** auth + per-user RLS, weekly reports, multi-caregiver teams, AI activity tagging, auto alerts when limit approached, scheduled reminders.

## Key User Action Flow (Log a Screen Session)
1. Caregiver opens **Today's Dashboard** (no login).
2. Clicks **Log Session** → modal/page: select child, device, activity type, start time, end/duration, optional note.
3. Server action validates (duration > 0, child exists) and inserts a `screen_sessions` row.
4. Audit log row appended.
5. Dashboard refetches today's totals; child's bar recalculates vs `daily_limit_minutes`; colour updates.
6. Page reload shows the persisted session (truth is server-derived).

## Responsive Nav Shell
Multi-page app → persistent **left sidebar** on desktop (Children, Log Session, Today's Dashboard); collapses to **hamburger menu** on mobile. Current section highlighted.

## Layer Plan
1. **Data** — Supabase tables + `lib/data/` (all reads/writes in one place).
2. **App logic** — `lib/actions/` server actions for insert/update/delete, validated server-side.
3. **Smart features** — `lib/ai/` later: activity auto-tagging, usage insights. Core logging/totals/limit comparison are pure SQL + arithmetic → run with AI switched off.

## Why Core Runs Without AI
Totals = `sum(duration_minutes) ... where date = today`. Limit check = integer compare. No model call needed for the v1 engine.

## Repo Structure
```
app/
  children/        # list + add/edit/delete
  sessions/        # log + edit session
  dashboard/       # today overview
  layout.tsx       # sidebar shell
components/         # shared UI (bars, modal, forms)
lib/data/          # ALL Supabase queries (children, sessions, audit)
lib/actions/       # server actions (create/update/delete)
lib/ai/            # (later) tagging + insights
tests/             # beside code they test
```

## Module Map (build order)
1. **sessions** — log + persist a screen session (core engine). *Built first.*
2. **children** — manage child profiles + daily limits.
3. **dashboard** — today's totals vs limit, live refresh.
4. **audit** — append-only log of every mutation.
5. **auth** (later) — login + owner-scoped RLS.
6. **insights** (later) — AI tagging, alerts, reports.