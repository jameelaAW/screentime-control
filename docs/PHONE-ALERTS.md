# Phone alerts (owner's runbook)

Phone alerts are push notifications to a caregiver's phone, even when the app is closed:
- about 5 minutes before a child reaches the daily limit,
- when the timer is stopped at the limit (or at the 3-hour safety stop),
- every 30 minutes while a timer keeps running ("Still on screen?").

A caregiver turns them on per phone at **Account > Phone alerts**.

## How it works

1. The phone gives the app a push address (a "subscription"), saved in `push_subscriptions` (migration `0010`).
2. A Supabase scheduler (`pg_cron`) calls `POST /api/push/sweep` once a minute with a secret.
3. The route calls `push_sweep()` in the database. It stops timers that reached the limit (so the limit is enforced
   even when nobody has the app open), records each alert in `push_sent` so it is sent once, and returns the alerts.
4. The route sends them with the `web-push` library, to every phone the caregiver switched on.

Only accounts that have at least one phone switched on are swept. Accounts without alerts behave as before: timers
are stopped the next time the dashboard loads.

## One-time setup

The values are in `phone-alerts-setup.local.txt` in the project folder (not in GitHub):
1. Add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `CRON_SECRET` in Vercel, make sure `SUPABASE_SERVICE_ROLE_KEY`
   exists, and redeploy.
2. Run the scheduler SQL from that file in the Supabase SQL editor.
3. Migration `0010_push_alerts.sql` is already applied.

Never paste these values into chat, email or a public place. To rotate them, generate new ones, change them in Vercel,
re-run the scheduler SQL with the new secret, and ask every caregiver to turn alerts off and on again (new VAPID keys
invalidate existing phone subscriptions).

## Check that it is running

Supabase SQL editor:

```sql
select start_time, status, return_message from cron.job_run_details order by start_time desc limit 5;
```

`status` should be `succeeded`. To see what the app answered:

```sql
select status_code, content::text from net._http_response order by created desc limit 5;
```

`200` with `{"alerts":0,"delivered":0}` is normal when nothing needed an alert.

| Answer | Meaning |
| --- | --- |
| 401 | The secret in the scheduler SQL does not match `CRON_SECRET` in Vercel. |
| 503 | A Vercel variable is missing (VAPID keys or `SUPABASE_SERVICE_ROLE_KEY`), or the app was not redeployed after adding it. |
| 500 | The database call failed. Check the Vercel function logs. |

To pause alerts: `select cron.unschedule('push-sweep');`  To resume, run the scheduler SQL again.

## Limits to know

- iPhone and iPad only receive alerts when the app has been added to the Home Screen (iOS 16.4 or newer).
- A phone's own settings (Do Not Disturb, battery saver, blocked notifications) can delay or hide an alert.
- The time zone used for "today" is the one the phone had when alerts were switched on. A caregiver who moves to a
  different time zone should turn alerts off and on again.
- The scheduler runs once a minute, so alerts arrive within about a minute of the moment.
- Alerts show the child's first name on the lock screen. This is stated on the Account page and in the Privacy Policy.
