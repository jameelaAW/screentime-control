# Screen Time Control — PRD

## Problem
Caregivers (parents, guardians, daycare staff) can't easily track cumulative screen time across multiple children. Manual notes get lost, there are no alerts when a daily limit is approached, and end-of-day totals are guessed.

## Target User
Parents, guardians, and staff in child-care / day-care centres managing 1–30 children at once.

## Core Objects
- **Child** — a minor under care (name, age, daily limit in minutes).
- **Screen Session** — one logged block of screen time (child, start, end, duration, device, activity type, notes).
- **Daily Limit** — stored on the Child; minutes/day.
- **Audit Log** — append-only record of every create/edit/delete.

## MVP (v1) — Checklist
- [ ] View a dashboard of all children with today's total screen time vs daily limit (green / amber / red).
- [ ] Add, edit, remove a child.
- [ ] Set / edit per-child daily limit (minutes).
- [ ] Log a screen session: pick child, device, activity type, start + end (or duration), optional note.
- [ ] Edit or delete a past session.
- [ ] Dashboard updates live after each log.
- [ ] Seeded demo data renders with NO login wall.
- [ ] Handles empty (no children), error (save fail), loading states.

## Non-Goals (v1)
- OS-level device blocking / remote control of devices.
- User accounts, login, per-user data isolation (later sprint).
- Multi-caregiver teams & shared rosters.
- AI tagging, smart suggestions, automated alerts (later).
- Payments, billing, multi-tenant SaaS resale.

## Success Criteria (one concrete scenario)
A daycare staff member opens the app URL with no login, sees 4 demo children with today's usage bars. She clicks **Log Session**, selects "Mia", device "Tablet", activity "Educational", duration 30 min, saves. The dashboard refreshes; Mia's bar reads 90/120 min and turns amber (under limit). The row persists to the database and survives a page reload. Every button works against the live DB — no dead UI, no seed-only screens.