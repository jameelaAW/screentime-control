-- Paid-access gate (Payhip licence keys).
-- Supabase sign-up is a public service, so the lock cannot live only in the app's sign-up form: anyone
-- can create an account. Instead, every table's row-level security requires a verified licence
-- (see has_license) once the gate is switched on. A licence is bound to exactly one account.
--
-- SAFE BY DEFAULT: license_required starts FALSE, so applying this migration changes nothing for anyone.
-- Switch the gate on only after the Payhip product and the server-only keys are configured:
--     update public.app_settings set license_required = true;
-- and off again with = false.

create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  license_required boolean not null default false
);
insert into public.app_settings (id) values (true) on conflict do nothing;
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

-- One row per activated licence. key_hash is a SHA-256 of the key, so the raw key is never stored.
create table if not exists public.licenses (
  key_hash text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  source text not null default 'payhip',
  created_at timestamptz not null default now()
);
alter table public.licenses enable row level security;
drop policy if exists licenses_own_read on public.licenses;
create policy licenses_own_read on public.licenses for select to authenticated using (user_id = auth.uid());
revoke all on public.licenses from anon, authenticated;
grant select on public.licenses to authenticated; -- writes only happen server-side after Payhip confirms the key

-- Throttle for guessing keys (written server-side only).
create table if not exists public.license_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  at timestamptz not null default now()
);
create index if not exists license_attempts_user_at on public.license_attempts (user_id, at);
alter table public.license_attempts enable row level security;
revoke all on public.license_attempts from anon, authenticated;

-- Accounts that already exist (they predate the paid gate) keep working.
insert into public.licenses (key_hash, user_id, source)
select 'grandfathered:' || id::text, id, 'grandfathered' from auth.users
on conflict do nothing;

create or replace function public.has_license() returns boolean
language sql stable security definer set search_path = public as $$
  select not coalesce((select license_required from app_settings limit 1), false)
      or exists (select 1 from licenses where user_id = auth.uid());
$$;

create or replace function public.license_status() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'required', coalesce((select license_required from app_settings limit 1), false),
    'licensed', exists (select 1 from licenses where user_id = auth.uid()));
$$;

revoke execute on function public.has_license(), public.license_status() from public, anon;
grant execute on function public.has_license(), public.license_status() to authenticated;

-- Every data policy now also requires a licence (a no-op while the gate is off).
drop policy if exists children_owner on public.children;
create policy children_owner on public.children for all to authenticated
  using (user_id = auth.uid() and public.has_license())
  with check (user_id = auth.uid() and public.has_license());

drop policy if exists sessions_owner_read on public.screen_sessions;
create policy sessions_owner_read on public.screen_sessions for select to authenticated
  using (user_id = auth.uid() and public.has_license());

drop policy if exists sessions_owner_insert on public.screen_sessions;
create policy sessions_owner_insert on public.screen_sessions for insert to authenticated
  with check (user_id = auth.uid() and public.has_license()
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists sessions_owner_update on public.screen_sessions;
create policy sessions_owner_update on public.screen_sessions for update to authenticated
  using (user_id = auth.uid() and public.has_license())
  with check (user_id = auth.uid() and public.has_license()
    and exists (select 1 from public.children c where c.id = child_id and c.user_id = auth.uid()));

drop policy if exists sessions_owner_delete on public.screen_sessions;
create policy sessions_owner_delete on public.screen_sessions for delete to authenticated
  using (user_id = auth.uid() and public.has_license());
