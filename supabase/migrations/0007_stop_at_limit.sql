-- Stop a running timer automatically when the child reaches their daily limit.
-- "Today" is the caregiver's local day, so the app passes the browser timezone (tz).
-- A session is closed at the moment the limit was reached (not when the sweep happens to run),
-- or at the maximum run time if that comes first. Keep max_minutes in sync with MAX_RUN_MINUTES in lib/session-time.ts.

drop function if exists public.auto_stop_screen_time(int);
drop function if exists public.start_screen_time(uuid,text,text);

-- Minutes of screen time a child has used today (local day in tz), optionally ignoring one session.
create or replace function public.screen_time_used_today(child uuid, exclude_session uuid, tz text, max_minutes int default 180) returns numeric
language plpgsql stable security invoker set search_path=public as $$
declare zone text := tz; day_start timestamptz; day_end timestamptz; used numeric;
begin
 if not exists (select 1 from pg_timezone_names where name=zone) then zone:='UTC'; end if;
 day_start := date_trunc('day', now() at time zone zone) at time zone zone;
 day_end := (date_trunc('day', now() at time zone zone) + interval '1 day') at time zone zone;
 select coalesce(sum(greatest(0, extract(epoch from
          least(coalesce(o.ended_at, least(now(), o.started_at + make_interval(mins=>max_minutes))), day_end) - greatest(o.started_at, day_start)) / 60)), 0)
   into used from screen_sessions o where o.child_id=child and (exclude_session is null or o.id<>exclude_session);
 return used;
end; $$;

create or replace function public.auto_stop_screen_time(max_minutes int default 180, tz text default 'UTC') returns int
language plpgsql security invoker set search_path=public as $$
declare r record; zone text := tz; day_start timestamptz; used numeric; limit_at timestamptz; cap_at timestamptz; stop_at timestamptz; why text; stopped int := 0;
begin
 if max_minutes<1 then raise exception 'Maximum run time must be at least 1 minute.';end if;
 if not exists (select 1 from pg_timezone_names where name=zone) then zone:='UTC'; end if;
 day_start := date_trunc('day', now() at time zone zone) at time zone zone;
 for r in select s.id, s.child_id, s.started_at, c.daily_limit_minutes from screen_sessions s join children c on c.id=s.child_id where s.ended_at is null loop
  used := public.screen_time_used_today(r.child_id, r.id, zone, max_minutes);
  limit_at := greatest(r.started_at, day_start) + make_interval(secs => greatest(0, r.daily_limit_minutes - used) * 60);
  cap_at := r.started_at + make_interval(mins => max_minutes);
  if limit_at < cap_at then
   stop_at := limit_at; why := 'Auto-stopped: daily limit of '||r.daily_limit_minutes||' minutes reached';
  else
   stop_at := cap_at; why := 'Auto-stopped: reached the maximum run time of '||max_minutes||' minutes';
  end if;
  stop_at := greatest(stop_at, r.started_at + interval '1 minute'); -- a recorded session is at least 1 minute
  if stop_at <= clock_timestamp() then
   perform set_config('app.mutation_reason', why, true);
   update screen_sessions set ended_at=stop_at, duration_minutes=greatest(1, ceil(extract(epoch from stop_at - started_at)/60)::int) where id=r.id and ended_at is null;
   stopped := stopped + 1;
  end if;
 end loop;
 return stopped;
end; $$;

-- Starting first closes expired timers, and refuses a child who has already used today's allowance.
create or replace function public.start_screen_time(child uuid, device text, activity text, tz text default 'UTC') returns uuid
language plpgsql security invoker set search_path=public as $$
declare session_id uuid; lim int;
begin
 if device not in ('tv','tablet','phone','computer','game-console') or activity not in ('video','game','educational','social','browsing') then raise exception 'Choose a valid device and activity.';end if;
 perform public.auto_stop_screen_time(180, tz);
 select daily_limit_minutes into lim from children where id=child;
 if lim is null then raise exception 'Child not found.';end if;
 if public.screen_time_used_today(child, null, tz, 180) >= lim then raise exception 'Daily limit already reached. Raise the limit or try again tomorrow.';end if;
 insert into screen_sessions(child_id,started_at,ended_at,duration_minutes,device_type,activity_type) values(child,now(),null,0,device,activity) returning id into session_id;
 return session_id;
end; $$;

revoke execute on function public.screen_time_used_today(uuid,uuid,text,int), public.auto_stop_screen_time(int,text), public.start_screen_time(uuid,text,text,text) from public, anon;
grant execute on function public.screen_time_used_today(uuid,uuid,text,int), public.auto_stop_screen_time(int,text), public.start_screen_time(uuid,text,text,text) to authenticated;
