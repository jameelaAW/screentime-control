# screentime-control

<!-- Managed by Launchpad. Edits here may be overwritten on next sync. -->

## Stack & commands

- Framework: Next.js
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `lint`: `next lint`
- `start`: `next start`

## Decisions

- a running timer is automatically stopped after 3 hours of inactivity (forgotten timers guard).

## Architecture

- Core engine logs screen sessions (per-screen session records) and powers a today's dashboard inside a nav shell.
- A daily screen-time allowance concept was added: repeated login/logout sessions now count against one daily allowance (rather than existing as fully independent session records), extending sprint 2's session management.
- a daily screen-time allowance was added; repeated login/logout sessions count against a single daily allowance instead of being fully independent session records
- caregivers are notified when a child reaches the daily screen-time limit
- sprint 2: child limits and audited session management, extending the sprint 1 core engine
- a running timer is auto-stopped after 3 hours of inactivity (forgotten timers guard)
- caregiver login and per-user data implemented (sprint 3)
- sprint 1: core engine logs screen sessions (per-screen session records) and powers a today's dashboard inside a nav shell
- PWA support added: web app manifest, generated icons, and public asset routes are now served by the app

## Gotchas

- The initial Supabase migration was not executable (e.g. missing shebang/permissions) and was fixed via commit 'fix: make initial Supabase migration executable'.
- timers that were accidentally left running are auto-stopped at the 3-hour mark to prevent unbounded session records.
- the first supabase migration was not executable and was fixed via commit 'fix: make initial supabase migration executable'
- launchpad verification notes and timer notes were preserved into the repo via merge commits so they survive alongside code

## Notes

- Project uses Supabase with a migrations setup (an initial migration exists).
- Sprint 1 delivered the core engine: screen session logging, today's dashboard, and navigation shell.
- Sprint 1 work (live session logging + daily dashboard) was integrated with concurrent atomic database auditing via a merge commit; DB auditing became part of the same integration.
- sprint 2 build sits on top of sprint 1's core engine (screen session logging + today's dashboard in nav shell); child limits and audited session management extend that engine.
- sprint 2 delivered child limits and audited session management (feat commit).
- Launchpad verification notes were preserved into the repo via a merge commit so they survive alongside the code.
- caregiver workflows were completed and end-to-end verification documented via a fix commit, extending the engine beyond child limits/audited session management.
- feat: caregivers are now notified when a child reaches the daily screen-time limit, extending the daily allowance/limits feature.
- merge: Launchpad timer notes were preserved into the repo via a merge commit so they survive alongside the code.
- icons were generated (not hand-crafted) as part of the PWA setup
- forgot password / reset password flow was recently added (feat commit)
- daily screen-time limit reminders are now delivered even while the child is still on screen (still-on-screen reminders), not only after the fact.
- the running timer is now stopped as soon as a child hits the daily screen-time limit, so the limit cuts the session off mid-use (this is in addition to the 3-hour inactivity guard).
- feat: in-app user guide (/help) and printable PDF was recently committed
- the running timer is stopped as soon as a child hits the daily screen-time limit (cuts session off mid-use)
- daily screen-time limit reminders are delivered even while the child is still on screen (still-on-screen reminders)
- A 'Keeping content safe' section was added to the in-app user guide (/help).
