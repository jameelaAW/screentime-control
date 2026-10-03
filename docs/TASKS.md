# Tasks & Sprints

## Sprint 1 — Core Engine (DB + Logging) 🏁 v1 functional milestone
**Goal:** Log a screen session, see today's totals vs limit — works end to end, no login.
- [x] Create Supabase tables (children, screen_sessions, audit_logs) + seed 4 children, ~10 sessions.
- [x] `lib/data/` CRUD for children + sessions; `lib/actions/` validated server actions (create/update/delete).
- [x] **Log Session** page: select child, device, activity, start/duration, note → insert + audit.
- [x] **Today's Dashboard**: list children, sum today's minutes, bar vs daily_limit, green/amber/red.
- [x] Sidebar shell (Children, Log Session, Today's Dashboard) responsive hamburger on mobile.
- [x] Empty state (no children), error state (save fail toast), loading skeletons.
**DoD:** Stranger opens URL → sees demo dashboard → logs a 30-min session for "Mia" → bar updates to amber and persists on reload.

## Sprint 2 — Manage Children & Limits
**Goal:** Full CRUD on children + editable limits.
- [x] Add/edit/remove child (name, age, daily_limit_minutes, notes).
- [x] Edit/delete a past session with reason → audit log.
- [x] Dashboard sorts by usage ratio desc; colour legend.
- [x] Session history per child (filter by day).
**DoD:** Add a new child, set 60-min limit, log 70 min → bar red; delete a session → total drops and persists.

## Sprint 3 — Lock It Down (Auth + Per-User RLS)
**Goal:** Real login + owner-scoped data before real users.
- [ ] Supabase Auth: signup/login (email + magic link).
- [ ] Replace permissive RLS with `auth.uid() = user_id` on children; scope sessions via child owner.
- [ ] Migrate seed rows to a demo owner or mark public-demo.
- [ ] Audit logs insert-only + owner read.
- [ ] Stranger now sees login page; logged-in sees only own data.
**DoD:** Two users see disjoint children; no cross-user reads; refresh keeps session.

## Sprint 4 — Insights & Reports (later)
- [ ] Weekly usage report per child; export CSV (human-approved).
- [ ] AI activity tagging from notes (value+source+confidence+review_status).
- [ ] Draft limit suggestions + reminders (medium approval).
- [ ] Limit-approached alert banner.

## Simple Gantt
```
S1: DB + logging engine + dashboard        [v1 functional]
S2: children/limits CRUD + history
S3: auth + RLS lock-down
S4: insights, reports, AI tags, alerts
```
