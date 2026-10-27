-- 0009: self-service account deletion, and the refund process (licence revocation).

-- ---------------------------------------------------------------------------------------------
-- Refunds. A refunded licence is SUSPENDED, not deleted: the account stops working but its data
-- is kept (the person can still sign in to the Account page to delete it). Reversible.
-- ---------------------------------------------------------------------------------------------
alter table public.licenses add column if not exists revoked_at timestamptz;
alter table public.licenses add column if not exists revoked_reason text;

-- A revoked licence no longer counts: has_license() (used by every data policy) ignores it.
create or replace function public.has_license() returns boolean
language sql stable security definer set search_path = public as $$
  select not coalesce((select license_required from app_settings limit 1), false)
      or exists (select 1 from licenses where user_id = auth.uid() and revoked_at is null);
$$;

create or replace function public.license_status() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'required', coalesce((select license_required from app_settings limit 1), false),
    'licensed', exists (select 1 from licenses where user_id = auth.uid() and revoked_at is null),
    'revoked',  exists (select 1 from licenses where user_id = auth.uid() and revoked_at is not null));
$$;

-- Owner-only commands, run from the Supabase SQL editor after refunding in Payhip.
-- Pass the buyer's licence KEY (most reliable) or the email they use in the app.
create or replace function public.revoke_license(key_or_email text, reason text default 'refunded') returns text
language plpgsql security definer set search_path = public, extensions as $$
declare n int;
begin
 if key_or_email is null or length(trim(key_or_email)) < 3 then raise exception 'Give a licence key or an email address.'; end if;
 if position('@' in key_or_email) > 0 then
  update licenses l set revoked_at = now(), revoked_reason = reason
   from auth.users u
   where u.id = l.user_id and lower(u.email) = lower(trim(key_or_email)) and l.revoked_at is null;
 else
  update licenses set revoked_at = now(), revoked_reason = reason
   where key_hash = encode(digest(upper(regexp_replace(trim(key_or_email), '\s', '', 'g')), 'sha256'), 'hex')
     and revoked_at is null;
 end if;
 get diagnostics n = row_count;
 return n || ' licence(s) suspended';
end; $$;

create or replace function public.restore_license(key_or_email text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare n int;
begin
 if key_or_email is null or length(trim(key_or_email)) < 3 then raise exception 'Give a licence key or an email address.'; end if;
 if position('@' in key_or_email) > 0 then
  update licenses l set revoked_at = null, revoked_reason = null
   from auth.users u
   where u.id = l.user_id and lower(u.email) = lower(trim(key_or_email)) and l.revoked_at is not null;
 else
  update licenses set revoked_at = null, revoked_reason = null
   where key_hash = encode(digest(upper(regexp_replace(trim(key_or_email), '\s', '', 'g')), 'sha256'), 'hex')
     and revoked_at is not null;
 end if;
 get diagnostics n = row_count;
 return n || ' licence(s) restored';
end; $$;

revoke execute on function public.revoke_license(text, text), public.restore_license(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Account deletion. Removes the caller's account and everything tied to it, immediately.
-- ---------------------------------------------------------------------------------------------
-- During a deletion the audit trigger stands aside: it would otherwise write (and rate-limit) a
-- history row for every session removed, and we delete that history anyway.
create or replace function public.record_screen_time_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
 if current_setting('app.account_deletion', true) = '1' then return coalesce(NEW,OLD); end if;
 if (select count(*) from audit_logs where user_id is not distinct from auth.uid() and created_at>now()-interval '1 minute')>=120 then raise exception 'Too many changes. Please wait a minute.'; end if;
 insert into audit_logs(action,entity_type,entity_id,details)
 values(case when TG_OP='INSERT' then 'create' else lower(TG_OP) end,case when TG_TABLE_NAME='children' then 'child' else 'screen_session' end,coalesce(NEW.id,OLD.id),jsonb_build_object('before',case when TG_OP<>'INSERT' then to_jsonb(OLD) end,'after',case when TG_OP<>'DELETE' then to_jsonb(NEW) end,'reason',current_setting('app.mutation_reason',true)));
 return coalesce(NEW,OLD);
end; $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
 if uid is null then raise exception 'Not signed in.'; end if;
 perform set_config('app.account_deletion', '1', true);
 delete from screen_sessions where user_id = uid;
 delete from children where user_id = uid;
 delete from audit_logs where user_id = uid;
 delete from license_attempts where user_id = uid;
 delete from licenses where user_id = uid;
 delete from auth.users where id = uid;
end; $$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
