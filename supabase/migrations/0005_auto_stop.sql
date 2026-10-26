-- Forgotten timers: a running session is closed after a maximum run time.
-- The session is recorded as exactly max_minutes (forgotten time is not charged).
-- Keep the default in sync with MAX_RUN_MINUTES in lib/session-time.ts.
create or replace function public.auto_stop_screen_time(max_minutes int default 180) returns int
language plpgsql security invoker set search_path=public as $$
declare stopped int;
begin
 if max_minutes<1 then raise exception 'Maximum run time must be at least 1 minute.';end if;
 perform set_config('app.mutation_reason','Auto-stopped: reached the maximum run time of '||max_minutes||' minutes',true);
 update screen_sessions set ended_at=started_at+make_interval(mins=>max_minutes),duration_minutes=max_minutes
  where ended_at is null and started_at+make_interval(mins=>max_minutes)<=clock_timestamp();
 get diagnostics stopped=row_count;
 return stopped;
end; $$;

-- Starting a timer first closes any expired forgotten session, so it cannot block a new login.
create or replace function public.start_screen_time(child uuid,device text,activity text) returns uuid language plpgsql security invoker set search_path=public as $$
declare session_id uuid;
begin
 if device not in ('tv','tablet','phone','computer','game-console') or activity not in ('video','game','educational','social','browsing') then raise exception 'Choose a valid device and activity.';end if;
 perform public.auto_stop_screen_time();
 insert into screen_sessions(child_id,started_at,ended_at,duration_minutes,device_type,activity_type) values(child,now(),null,0,device,activity) returning id into session_id;
 return session_id;
end; $$;
