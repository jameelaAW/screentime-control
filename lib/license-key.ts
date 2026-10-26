// Pure helpers for licence keys: no secrets and no network, so they can be unit-tested.

/** Keys are compared in upper case with all whitespace removed. */
export function normalizeKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

/** Payhip keys look like WTKP4-66NL5-HMKQW-GFSCZ. Reject anything else before it is sent anywhere. */
export function isValidKeyFormat(key: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{6,62}[A-Z0-9]$/.test(key);
}

/**
 * Payhip answers a good key with {"data":{"enabled":true,...}}. Everything else (an unknown key,
 * a refunded/disabled key, an empty body, junk) is treated as not valid.
 */
export function parsePayhipVerify(body: string): 'valid' | 'invalid' {
  if (!body.trim()) return 'invalid';
  try {
    return JSON.parse(body)?.data?.enabled === true ? 'valid' : 'invalid';
  } catch {
    return 'invalid';
  }
}
