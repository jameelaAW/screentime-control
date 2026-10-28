-- 0010: phone (push) alerts.
-- A caregiver can switch alerts on from the Account page; each phone/browser then has one row in
-- push_subscriptions. Every minute a scheduler calls the app, which calls push_sweep(); push_sweep decides which
-- running timers need an alert, remembers it (push_sent) so each alert goes out once, and also stops a timer at the
-- daily limit or the maximum run time even if nobody has the app open.
-- Keep the limit / maximum-run logic in sync with auto_stop_screen_time in 0007 and MAX_RUN_MINUTES in lib/session-time.ts.

create table if not exists public.push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 endpoint text not null unique check (length(endpoint) between 20 and 2000),
 p256dh text not null check (length(p256dh) between 20 and 200),
 auth text not null check (length(auth) between 8 and 100),
 tz text not null default 'UTC',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

-- Which alert has already gone out for which session, so a minute-by-minute sweep never repeats one.
create table if not exists public.push_sent (
 session_id uuid not null references public.screen_sessions(id) on delete cascade,
 kind text not null check (kind in ('warn','limit','maxrun','remind')),
 slot int not null default 0,
 sent_at timestamptz not null default now(),
 primary key (session_id, kind, slot)
);

alter table public.push_subscriptions enable row level security;
alter table public.push_sent enable row level security;
drop policy if exists push_subscriptions_owner on public.push_subscriptions;
create policy push_subscriptions_owner on public.push_subscriptions for select to authenticated using (user_id=auth.uid());
drop policy if exists push_subscriptions_owner_delete on public.push_subscriptions;
create policy push_subscriptions_owner_delete on public.push_subscriptions for delete to authenticated using (user_id=auth.uid());
-- Writes go through save_push_subscription() below. push_sent has no policies: only the sweep touches it.
revoke all on public.push_subscriptions, public.push_sent from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;

-- Register (or take over) this phone for the signed-in caregiver. A phone that was used by someone else before
-- moves to the new account, so alerts never go to the previous person.
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_tz text default 'UTC') returns void
language plpgsql security definer set search_path=public as $$
declare zone text := coalesce(nullif(p_tz,''),'UTC'); me uuid := auth.uid();
begin
 if me is null then raise exception 'Not signed in.'; end if;
 if not exists (select 1 from pg_timezone_names where name=zone) then zone:='UTC'; end if;
 if not public.has_license() then raise exception 'Activate your licence first.'; end if;
 if (select count(*) from push_subscriptions where user_id=me and endpoint<>p_endpoint)>=10 then raise exception 'Too many phones on this account. Turn alerts off on one first.'; end if;
 insert into push_subscriptions(user_id,endpoint,p256dh,auth,tz) values(me,p_endpoint,p_p256dh,p_auth,zone)
 on conflict (endpoint) do update set user_id=me, p256dh=excluded.p256dh, auth=excluded.auth, tz=excluded.tz, updated_at=now();
end; $$;
revoke execute on function public.save_push_subscription(text,text,text,text) from public, anon;
grant execute on function public.save_push_subscription(text,text,text,text) to authenticated;

-- The sweep. Returns the alerts to send now (one row per alert); service role only.
create or replace function public.push_sweep(max_minutes int default 180, warn_minutes int default 5, remind_every int default 30)
returns table(user_id uuid, session_id uuid, child_name text, kind text, minutes_left int, limit_minutes int, ran_minutes int)
language plpgsql security definer set search_path=public as $$
declare r record; zone text; day_start timestamptz; used numeric; limit_at timestamptz; cap_at timestamptz; stop_at timestamptz;
 stopping boolean; why text; ran int; slot int; n int;
begin
 for r in
  select s.id, s.user_id, s.child_id, s.started_at, c.name, c.daily_limit_minutes
  from screen_sessions s join children c on c.id=s.child_id
  where s.ended_at is null and exists (select 1 from push_subscriptions p where p.user_id=s.user_id)
 loop
  select p.tz into zone from push_subscriptions p where p.user_id=r.user_id order by p.updated_at desc limit 1;
  if zone is null or not exists (select 1 from pg_timezone_names where name=zone) then zone:='UTC'; end if;
  day_start := date_trunc('day', now() at time zone zone) at time zone zone;
  used := public.screen_time_used_today(r.child_id, r.id, zone, max_minutes);
  limit_at := greatest(r.started_at, day_start) + make_interval(secs => greatest(0, r.daily_limit_minutes - used) * 60);
  cap_at := r.started_at + make_interval(mins => max_minutes);
  stopping := limit_at < cap_at;
  stop_at := greatest(least(limit_at, cap_at), r.started_at + interval '1 minute');
  ran := floor(extract(epoch from now() - r.started_at) / 60)::int;

  if stop_at <= clock_timestamp() then
   -- Time is up: close the session exactly where the app would, then say so once.
   why := case when stopping then 'Auto-stopped: daily limit of '||r.daily_limit_minutes||' minutes reached'
               else 'Auto-stopped: reached the maximum run time of '||max_minutes||' minutes' end;
   perform set_config('app.mutation_reason', why, true);
   perform set_config('request.jwt.claim.sub', r.user_id::text, true); -- so the change history belongs to the caregiver, as when they stop it themselves
   update screen_sessions set ended_at=stop_at, duration_minutes=greatest(1, ceil(extract(epoch from stop_at - started_at)/60)::int)
    where id=r.id and ended_at is null;
   insert into push_sent(session_id,kind,slot) values(r.id, case when stopping then 'limit' else 'maxrun' end, 0) on conflict do nothing;
   get diagnostics n = row_count;
   if n>0 then
    user_id:=r.user_id; session_id:=r.id; child_name:=r.name; kind:=case when stopping then 'limit' else 'maxrun' end;
    minutes_left:=0; limit_minutes:=r.daily_limit_minutes; ran_minutes:=ran; return next;
   end if;
  else
   if stopping and stop_at - make_interval(mins => warn_minutes) <= clock_timestamp() then
    insert into push_sent(session_id,kind,slot) values(r.id,'warn',0) on conflict do nothing;
    get diagnostics n = row_count;
    -- the warning stands in for a reminder that falls due at the same time, so one minute never sends two alerts
    insert into push_sent(session_id,kind,slot) values(r.id,'remind',ran / remind_every) on conflict do nothing;
    if n>0 then
     user_id:=r.user_id; session_id:=r.id; child_name:=r.name; kind:='warn';
     minutes_left:=greatest(1, ceil(extract(epoch from stop_at - clock_timestamp())/60)::int); limit_minutes:=r.daily_limit_minutes; ran_minutes:=ran; return next;
     continue;
    end if;
   end if;
   slot := ran / remind_every; -- 1 after 30 minutes, 2 after 60 ...
   if slot >= 1 then
    insert into push_sent(session_id,kind,slot) values(r.id,'remind',slot) on conflict do nothing;
    get diagnostics n = row_count;
    if n>0 then
     user_id:=r.user_id; session_id:=r.id; child_name:=r.name; kind:='remind';
     minutes_left:=greatest(0, ceil(extract(epoch from stop_at - clock_timestamp())/60)::int); limit_minutes:=r.daily_limit_minutes; ran_minutes:=ran; return next;
    end if;
   end if;
  end if;
 end loop;
end; $$;
revoke execute on function public.push_sweep(int,int,int) from public, anon, authenticated;
grant execute on function public.push_sweep(int,int,int) to service_role;

-- Deleting an account removes its phones too (the foreign key does it), so nothing else to change there.
