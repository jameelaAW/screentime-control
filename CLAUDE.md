# screentime-control

<!-- Managed by Launchpad. Edits here may be overwritten on next sync. -->

## Stack & commands

- Framework: Next.js
- `dev`: `next dev --turbopack`
- `build`: `next build`
- `lint`: `next lint`
- `start`: `next start`

## Architecture

- Core engine logs screen sessions (per-screen session records) and powers a today's dashboard inside a nav shell.
- A daily screen-time allowance concept was added: repeated login/logout sessions now count against one daily allowance (rather than existing as fully independent session records), extending sprint 2's session management.

## Gotchas

- The initial Supabase migration was not executable (e.g. missing shebang/permissions) and was fixed via commit 'fix: make initial Supabase migration executable'.

## Notes

- Project uses Supabase with a migrations setup (an initial migration exists).
- Sprint 1 delivered the core engine: screen session logging, today's dashboard, and navigation shell.
- Sprint 1 work (live session logging + daily dashboard) was integrated with concurrent atomic database auditing via a merge commit; DB auditing became part of the same integration.
- sprint 2 build sits on top of sprint 1's core engine (screen session logging + today's dashboard in nav shell); child limits and audited session management extend that engine.
- sprint 2 delivered child limits and audited session management (feat commit).
- Launchpad verification notes were preserved into the repo via a merge commit so they survive alongside the code.
- caregiver workflows were completed and end-to-end verification documented via a fix commit, extending the engine beyond child limits/audited session management.
