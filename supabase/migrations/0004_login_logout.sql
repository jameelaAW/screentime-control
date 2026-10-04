alter table screen_sessions drop constraint if exists screen_sessions_duration_minutes_check;
alter table screen_sessions add constraint screen_sessions_duration_minutes_check check ((ended_at is null and duration_minutes=0) or (ended_at is not null and duration_minutes>0));
create unique index if not exists one_active_screen_session_per_child on screen_sessions(child_id) where ended_at is null;
create or replace function public.start_screen_time(child uuid,device text,activity text) returns uuid language plpgsql security invoker set search_path=public as $$
declare session_id uuid;
begin
 if device not in ('tv','tablet','phone','computer','game-console') or activity not in ('video','game','educational','social','browsing') then raise exception 'Choose a valid device and activity.';end if;
 insert into screen_sessions(child_id,started_at,ended_at,duration_minutes,device_type,activity_type) values(child,now(),null,0,device,activity) returning id into session_id;
 return session_id;
end; $$;
create or replace function public.stop_screen_time(session uuid) returns uuid language plpgsql security invoker set search_path=public as $$
declare session_id uuid;
begin
 perform set_config('app.mutation_reason','Child logged out of screen time',true);
 update screen_sessions set ended_at=clock_timestamp(),duration_minutes=greatest(1,ceil(extract(epoch from(clock_timestamp()-started_at))/60)::int) where id=session and ended_at is null returning id into session_id;
 if session_id is null then raise exception 'This session has already ended. Refresh to see the latest total.';end if;
 return session_id;
end; $$;
