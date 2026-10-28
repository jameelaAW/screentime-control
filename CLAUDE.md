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
- users can delete their own account and trigger a refund process
- test coverage was added for alert delivery verifying what the push service answered (feat commit).

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
- VAPID key pasting tolerates stray spaces, quotes, or '=' characters (fixed via a fix commit) so pasted keys don't break the web push setup.
- key tidy pattern must strip whitespace, not the letter s — a fix commit corrected this

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
- a Payhip licence-key gate was added but is off until switched on (feat commit)
- support contact email changed to support@mzdigitalbuys.com via docs commit
- the in-app user guide (/help) is now linked from the activation page (feat commit)
- a one-page 'Start here' PDF for Payhip buyers was added as documentation (docs commit)
- Privacy, Terms and Refund pages were added as a draft (committed but not yet confirmed final).
- The latest commit adds Privacy, Terms and Refund pages in draft status — they have not been formally confirmed/reviewed yet.
- feat: delete-my-account and the refund process was recently committed
- refund process was added alongside the delete-my-account feature
- phone alerts (push notifications) for the daily screen-time limit have been added (feat commit)
- a fix was committed that names the missing settings when phone alerts are not configured, providing clearer error/informational messages for caregivers who have not set up phone alert settings
- test alert always shows a result, including server errors (fix commit)
- phone check now also reports the alert handler state (recent commit)
