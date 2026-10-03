create or replace function public.mutate_screen_time(entity text, operation text, record_id uuid, payload jsonb, reason text default '') returns uuid
language plpgsql security invoker set search_path=public as $$
declare result_id uuid;
begin
 if (select count(*) from audit_logs where created_at>now()-interval '1 minute')>=120 then raise exception 'Too many changes. Please wait a minute.'; end if;
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
 if (select count(*) from audit_logs where created_at>now()-interval '1 minute')>=120 then raise exception 'Too many changes. Please wait a minute.'; end if;
 insert into audit_logs(action,entity_type,entity_id,details)
 values(case when TG_OP='INSERT' then 'create' else lower(TG_OP) end,case when TG_TABLE_NAME='children' then 'child' else 'screen_session' end,coalesce(NEW.id,OLD.id),jsonb_build_object('before',case when TG_OP<>'INSERT' then to_jsonb(OLD) end,'after',case when TG_OP<>'DELETE' then to_jsonb(NEW) end,'reason',current_setting('app.mutation_reason',true)));
 return coalesce(NEW,OLD);
end; $$;
