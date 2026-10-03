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

## Gotchas

- The initial Supabase migration was not executable (e.g. missing shebang/permissions) and was fixed via commit 'fix: make initial Supabase migration executable'.

## Notes

- Project uses Supabase with a migrations setup (an initial migration exists).
- Sprint 1 delivered the core engine: screen session logging, today's dashboard, and navigation shell.
