import 'server-only';
import webpush from 'web-push';
import { adminClient } from '@/lib/license';

const REQUIRED = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'CRON_SECRET'] as const;

/** Names (never values) of the settings phone alerts still need: the VAPID key pair, the scheduler secret and the server-only Supabase key. */
export const missingPushConfig = (): string[] => REQUIRED.filter((name) => !process.env[name]);
export const pushConfigured = () => missingPushConfig().length === 0;

/** A key pasted into Vercel often carries a stray space, line break, quote or trailing '='. Strip those. */
const tidy = (v: string) => v.replace(/\s+/g, '').replace(/^["']+|["']+$/g, '').replace(/=+$/, '');

let ready = false;
function setup() {
  if (ready) return;
  webpush.setVapidDetails('mailto:support@mzdigitalbuys.com', tidy(process.env.VAPID_PUBLIC_KEY!), tidy(process.env.VAPID_PRIVATE_KEY!));
  ready = true;
}

/** Sends one alert to every phone a caregiver has switched on. `sent` is how many the push service accepted; `statuses` says what it answered for each (no secrets). */
export async function sendToUser(userId: string, payload: { title: string; body: string; tag: string }): Promise<{ sent: number; statuses: string[] }> {
  setup();
  const db = adminClient();
  const { data: subs } = await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id', userId);
  let sent = 0;
  const statuses: string[] = [];
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 600, urgency: 'high' });
      sent++;
      statuses.push('accepted');
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      statuses.push(`${status ?? 'error'} ${String((e as { body?: string }).body ?? (e as Error).message ?? '').slice(0, 80)}`);
      if (status === 404 || status === 410) await db.from('push_subscriptions').delete().eq('id', s.id); // the phone removed the app or turned alerts off
      else console.error('Push send failed with status', status);
    }
  }
  return { sent, statuses };
}
