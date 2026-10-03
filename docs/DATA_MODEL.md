# Data Model

## children
| field | type | notes |
|---|---|---|
| id | uuid pk | default gen_random_uuid() |
| user_id | uuid | nullable (owner scoping added later) |
| name | text | not null |
| age | int | |
| daily_limit_minutes | int | default 120 |
| notes | text | |
| created_at | timestamptz | default now() |

RLS: v1 permissive read/write (demo-first). Later: `auth.uid() = user_id`.

## screen_sessions
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid | nullable |
| child_id | uuid → children(id) | not null |
| started_at | timestamptz | not null |
| ended_at | timestamptz | nullable (active session) |
| duration_minutes | int | not null, check > 0 |
| device_type | text | tv / tablet / phone / computer / game-console |
| activity_type | text | video / game / educational / social / browsing |
| notes | text | |
| created_at | timestamptz | default now() |

RLS: v1 permissive. Later: owner-scoped via child's user_id.

## audit_logs
| field | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid | nullable |
| action | text | create / update / delete |
| entity_type | text | child / screen_session |
| entity_id | uuid | |
| details | jsonb | before/after snapshot |
| created_at | timestamptz | default now() |

RLS: v1 permissive read; write via service logic only.

## Relationships
- children 1 — many screen_sessions (child_id).
- Every create/update/delete on children or screen_sessions appends one audit_logs row.

## AI Fields (later phase)
Future `screen_sessions.ai_activity_tag` will follow the pattern: **value** (text) + **source** (text, model id) + **confidence** (numeric 0–1) + **review_status** (text default 'unreviewed'). Not in v1 schema/migration.

## Permission Notes
- v1: no auth; all tables open read/write (demo-first, seed data viewable).
- Lock-down sprint: replace permissive policies with `auth.uid() = user_id` on children; screen_sessions scoped through owning child; audit_logs insert-only + owner read.