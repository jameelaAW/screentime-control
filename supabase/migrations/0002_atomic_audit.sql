-- Every mutation and its audit record commit in one database transaction.
create or replace function public.record_screen_time_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
 insert into audit_logs(action,entity_type,entity_id,details)
 values(lower(TG_OP),case when TG_TABLE_NAME='children' then 'child' else 'screen_session' end,
 coalesce(NEW.id,OLD.id),jsonb_build_object('before',case when TG_OP<>'INSERT' then to_jsonb(OLD) end,'after',case when TG_OP<>'DELETE' then to_jsonb(NEW) end));
 return coalesce(NEW,OLD);
end; $$;
drop trigger if exists children_audit on children;
create trigger children_audit after insert or update or delete on children for each row execute function public.record_screen_time_audit();
drop trigger if exists sessions_audit on screen_sessions;
create trigger sessions_audit after insert or update or delete on screen_sessions for each row execute function public.record_screen_time_audit();
drop policy if exists audit_logs_v1_write on audit_logs;
revoke insert,update,delete on audit_logs from anon,authenticated;
alter table children add constraint children_limit_positive check(daily_limit_minutes>0);
