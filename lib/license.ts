import 'server-only';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { parsePayhipVerify } from '@/lib/license-key';

const PAYHIP_VERIFY_URL = 'https://payhip.com/api/v2/license/verify';

/** The gate needs the Payhip product secret and the server-only Supabase key. Neither is ever sent to the browser. */
export const gateConfigured = () =>
  Boolean(process.env.PAYHIP_PRODUCT_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

/** Only the hash is stored, so a database leak would not expose usable keys. */
export const hashKey = (normalizedKey: string) => createHash('sha256').update(normalizedKey).digest('hex');

/** Server-only client that bypasses row-level security. Used solely to record a licence after Payhip confirms it. */
export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 'error' means we could not get an answer (network, Payhip down, wrong product secret), not that the key is bad. */
export async function verifyWithPayhip(normalizedKey: string): Promise<'valid' | 'invalid' | 'error'> {
  try {
    const res = await fetch(`${PAYHIP_VERIFY_URL}?${new URLSearchParams({ license_key: normalizedKey })}`, {
      headers: { 'product-secret-key': process.env.PAYHIP_PRODUCT_SECRET! },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500) {
      console.error('Payhip licence check failed with HTTP', res.status); // 401/403 usually means the product secret is wrong
      return 'error';
    }
    return parsePayhipVerify(await res.text());
  } catch (e) {
    console.error('Payhip licence check could not be completed', e instanceof Error ? e.message : e);
    return 'error';
  }
}
