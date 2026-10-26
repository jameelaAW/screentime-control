-- 0006: lock it down. Each caregiver sees and changes only their own children, sessions and audit history.
-- Owner decision: the shared demo data is deleted; rows with no owner cannot belong to anyone.
delete from screen_sessions where user_id is null;
delete from children where user_id is null; -- their sessions cascade

alter table children alter column user_id set default auth.uid();
alter table screen_sessions alter column user_id set default auth.uid();
alter table audit_logs alter column user_id set default auth.uid();
alter table children alter column user_id set not null;
alter table screen_sessions alter column user_id set not null;

drop policy if exists children_v1_read on children;
drop policy if exists children_v1_write on children;
drop policy if exists screen_sessions_v1_read on screen_sessions;
drop policy if exists screen_sessions_v1_write on screen_sessions;
drop policy if exists audit_logs_v1_read on audit_logs;
drop policy if exists children_owner on children;
drop policy if exists sessions_owner_read on screen_sessions;
drop policy if exists sessions_owner_insert on screen_sessions;
drop policy if exists sessions_owner_update on screen_sessions;
drop policy if exists sessions_owner_delete on screen_sessions;
drop policy if exists audit_owner_read on audit_logs;

create policy children_owner on children for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy sessions_owner_read on screen_sessions for select to authenticated using (user_id=auth.uid());
create policy sessions_owner_insert on screen_sessions for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from children c where c.id=child_id and c.user_id=auth.uid()));
create policy sessions_owner_update on screen_sessions for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid() and exists(select 1 from children c where c.id=child_id and c.user_id=auth.uid()));
create policy sessions_owner_delete on screen_sessions for delete to authenticated using (user_id=auth.uid());
-- audit_logs: owners may read their own rows; rows are written only by the audit trigger.
create policy audit_owner_read on audit_logs for select to authenticated using (user_id=auth.uid());

revoke all on children, screen_sessions, audit_logs from anon;
grant select,insert,update,delete on children, screen_sessions to authenticated;
revoke insert,update,delete,truncate on audit_logs from authenticated;
grant select on audit_logs to authenticated;

-- Per-user write throttle (was global, so one busy user could block everyone).
create or replace function public.mutate_screen_time(entity text, operation text, record_id uuid, payload jsonb, reason text default '') returns uuid
language plpgsql security invoker set search_path=public as $$
declare result_id uuid;
begin
 if (select count(*) from audit_logs where user_id is not distinct from auth.uid() and created_at>now()-interval '1 minute')>=120 then raise exception 'Too many changes. Please wait a minute.'; end if;
 if operation in ('update','delete') and length(trim(reason))<3 then raise exception 'A reason is required.'; end if;
 perform set_config('app.mutation_reason',left(reason,500),true);
 if entity='child' then
  if operation='create' then
   insert into children(name,age,daily_limit_minutes,notes) values(payload->>'name',(payload->>'age')::int,(payload->>'daily_limit_minutes')::int,payload->>'notes') returning id into result_id;
  elsif operation='update' then
   update children set name=payload->>'name',age=(payload->>'age')::int,daily_limit_minutes=(payload->>'daily_limit_minutes')::int,notes=payload->>'notes' where id=record_id returning id into result_id;
  elsif operation='delete' then delete from children where id=record_id returning id into result_id;
  end if;
 elsif entity='screen_session' then
  if operation='update' then
   update screen_sessions set child_id=(payload->>'child_id')::uuid,started_at=(payload->>'started_at')::timestamptz,ended_at=(payload->>'ended_at')::timestamptz,duration_minutes=(payload->>'duration_minutes')::int,device_type=payload->>'device_type',activity_type=payload->>'activity_type',notes=payload->>'notes' where id=record_id returning id into result_id;
  elsif operation='delete' then delete from screen_sessions where id=record_id returning id into result_id;
  end if;
 end if;
 if result_id is null then raise exception 'Record not found or invalid operation.'; end if;
 return result_id;
end; $$;
create or replace function public.record_screen_time_audit() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if (select count(*) from audit_logs where user_id is not distinct from auth.uid() and created_at>now()-interval '1 minute')>=120 then raise exception 'Too many changes. Please wait a minute.'; end if;
 insert into audit_logs(action,entity_type,entity_id,details)
 values(case when TG_OP='INSERT' then 'create' else lower(TG_OP) end,case when TG_TABLE_NAME='children' then 'child' else 'screen_session' end,coalesce(NEW.id,OLD.id),jsonb_build_object('before',case when TG_OP<>'INSERT' then to_jsonb(OLD) end,'after',case when TG_OP<>'DELETE' then to_jsonb(NEW) end,'reason',current_setting('app.mutation_reason',true)));
 return coalesce(NEW,OLD);
end; $$;

-- Only signed-in caregivers may call the timer / management functions.
revoke execute on function public.start_screen_time(uuid,text,text), public.stop_screen_time(uuid), public.mutate_screen_time(text,text,uuid,jsonb,text), public.auto_stop_screen_time(int) from public, anon;
grant execute on function public.start_screen_time(uuid,text,text), public.stop_screen_time(uuid), public.mutate_screen_time(text,text,uuid,jsonb,text), public.auto_stop_screen_time(int) to authenticated;
