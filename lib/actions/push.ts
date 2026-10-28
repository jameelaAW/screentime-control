'use server';
import { createClient } from '@/lib/supabase/server';
import { pushConfigured, sendToUser } from '@/lib/push/send';

export type PushResult = { error?: string; ok?: boolean; detail?: string };
type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

const valid = (s: unknown): s is Sub => {
  const x = s as Sub;
  return Boolean(x && typeof x.endpoint === 'string' && x.endpoint.startsWith('https://') && x.keys && typeof x.keys.p256dh === 'string' && typeof x.keys.auth === 'string');
};

export async function savePushSubscription(subscription: unknown, tz: string): Promise<PushResult> {
  if (!pushConfigured()) return { error: 'Phone alerts are not available yet.' };
  if (!valid(subscription)) return { error: 'This phone did not allow alerts.' };
  const supabase = await createClient();
  const { error } = await supabase.rpc('save_push_subscription', { p_endpoint: subscription.endpoint, p_p256dh: subscription.keys.p256dh, p_auth: subscription.keys.auth, p_tz: String(tz).slice(0, 64) });
  if (error) return { error: error.message.includes('Too many') || error.message.includes('licence') ? error.message : 'Could not turn alerts on. Please try again.' };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<PushResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', String(endpoint)); // row-level security: only this caregiver's own phones
  return error ? { error: 'Could not turn alerts off. Please try again.' } : { ok: true };
}

export async function sendTestAlert(): Promise<PushResult> {
  if (!pushConfigured()) return { error: 'Phone alerts are not available yet.' };
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) return { error: 'Please sign in again.' };
  const { sent, statuses } = await sendToUser(user.id, { title: 'Alerts are on', body: 'You will get a message like this when a child is nearly at the limit.', tag: 'test' });
  const detail = statuses.length ? ` (${statuses.join('; ')})` : ' (no phone is registered for this account)';
  return sent ? { ok: true, detail: `${sent} of ${statuses.length} phone entries accepted by the push service${detail}` } : { error: `No alert could be delivered${detail}. Turn alerts off and on again on this phone.` };
}
