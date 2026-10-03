create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  age int,
  daily_limit_minutes int not null default 120,
  notes text,
  created_at timestamptz not null default now()
);

alter table children enable row level security;
drop policy if exists "children_v1_read" on children;
create policy "children_v1_read" on children for select using (true);
drop policy if exists "children_v1_write" on children;
create policy "children_v1_write" on children for all using (true) with check (true);

create table if not exists screen_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  child_id uuid not null references children(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int not null check (duration_minutes > 0),
  device_type text,
  activity_type text,
  notes text,
  created_at timestamptz not null default now()
);

alter table screen_sessions enable row level security;
drop policy if exists "screen_sessions_v1_read" on screen_sessions;
create policy "screen_sessions_v1_read" on screen_sessions for select using (true);
drop policy if exists "screen_sessions_v1_write" on screen_sessions;
create policy "screen_sessions_v1_write" on screen_sessions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into children (id, name, age, daily_limit_minutes, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Mia Chen', 5, 120, 'Loves educational apps.'),
  ('22222222-2222-2222-2222-222222222222', 'Liam Patel', 7, 90, 'Prefers games.'),
  ('33333333-3333-3333-3333-333333333333', 'Ava Brooks', 4, 60, 'Younger; shorter limit.'),
  ('44444444-4444-4444-4444-444444444444', 'Noah Diaz', 8, 150, 'Allowed more on weekends.')
on conflict (id) do nothing;

insert into screen_sessions (id, child_id, started_at, ended_at, duration_minutes, device_type, activity_type, notes)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours', now() - interval '2 hours 30 minutes', 30, 'tablet', 'educational', 'ABC learning app'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', now() - interval '2 hours', now() - interval '1 hour 30 minutes', 30, 'tv', 'video', 'Bluey episode'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', now() - interval '5 hours', now() - interval '4 hours', 60, 'game-console', 'game', 'Mario Kart'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', now() - interval '1 hour 15 minutes', now() - interval '45 minutes', 30, 'phone', 'social', 'Video call with grandma'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', now() - interval '4 hours', now() - interval '3 hours 30 minutes', 30, 'tablet', 'video', 'Sing-along show'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', now() - interval '6 hours', now() - interval '5 hours', 60, 'computer', 'educational', 'Math practice'),
  ('10101010-1010-1010-1010-101010101010', '44444444-4444-4444-4444-444444444444', now() - interval '3 hours', now() - interval '2 hours 15 minutes', 45, 'game-console', 'game', 'Roblox'),
  ('12121212-1212-1212-1212-121212121212', '11111111-1111-1111-1111-111111111111', now() - interval '26 hours', now() - interval '25 hours 30 minutes', 30, 'tablet', 'educational', 'Yesterday - reading app'),
  ('13131313-1313-1313-1313-131313131313', '33333333-3333-3333-3333-333333333333', now() - interval '26 hours', now() - interval '25 hours 45 minutes', 15, 'phone', 'video', 'Yesterday - cartoon')
on conflict (id) do nothing;

insert into audit_logs (id, action, entity_type, entity_id, details)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'create', 'child', '11111111-1111-1111-1111-111111111111', '{"name": "Mia Chen", "daily_limit_minutes": 120}'),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'create', 'screen_session', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"child": "Mia Chen", "duration_minutes": 30}')
on conflict (id) do nothing;