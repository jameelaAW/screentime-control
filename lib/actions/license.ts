'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { adminClient, gateConfigured, hashKey, verifyWithPayhip } from '@/lib/license';
import { isValidKeyFormat, normalizeKey } from '@/lib/license-key';

export type ActivateState = { error?: string };

const MAX_ATTEMPTS = 5; // failed or repeated tries allowed per 10 minutes, per account

export async function activateLicense(_prev: ActivateState, form: FormData): Promise<ActivateState> {
  const key = normalizeKey(String(form.get('license_key') || ''));
  if (!isValidKeyFormat(key)) return { error: 'That does not look like a licence key. Copy it exactly from your Payhip receipt or email.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Already activated (or the gate is off): nothing to do.
  const status = await supabase.rpc('license_status');
  if (status.data && (!status.data.required || status.data.licensed)) redirect('/');

  if (!gateConfigured()) return { error: 'Activation is not available right now. Please email support and we will help.' };

  const admin = adminClient();
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await admin.from('license_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('at', since);
    if ((count ?? 0) >= MAX_ATTEMPTS) return { error: 'Too many attempts. Please wait 10 minutes and try again.' };
    await admin.from('license_attempts').insert({ user_id: user.id });

    const verdict = await verifyWithPayhip(key);
    if (verdict === 'error') return { error: 'We could not reach the licence service. Please try again in a moment.' };
    if (verdict === 'invalid') return { error: 'That licence key was not recognised, or it is no longer active. Check it and try again.' };

    const { error } = await admin.from('licenses').insert({ key_hash: hashKey(key), user_id: user.id });
    if (error) {
      if (error.code === '23505') {
        const { data: mine } = await admin.from('licenses').select('user_id').eq('user_id', user.id).maybeSingle();
        if (!mine) return { error: 'That licence key has already been used for another account. Each key works for one account. Email support if you think this is a mistake.' };
        // Your own account already holds a licence: fall through to the dashboard.
      } else {
        console.error('licence insert failed', error.code, error.message);
        return { error: 'Could not save your licence. Please try again.' };
      }
    }
  } catch (e) {
    console.error('activateLicense failed', e instanceof Error ? e.message : e);
    return { error: 'Something went wrong. Please try again.' };
  }
  redirect('/');
}
