import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { getTz } from '@/lib/time';
import type { ExportChild, ExportSession } from '@/lib/export-data';

export type ExportLoad =
  | { ok: true; email: string; tz: string; children: ExportChild[]; sessions: ExportSession[] }
  | { ok: false; reason: 'signed-out' | 'paused' | 'failed'; message: string };

/**
 * The signed-in caregiver's own children and sessions. The database client is bound to their session, so row-level
 * security returns only their rows. Used by the CSV download and the readable report.
 */
export async function loadExportData(): Promise<ExportLoad> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'signed-out', message: 'Please sign in to see your data.' };

  const gate = await supabase.rpc('license_status');
  if (gate.data?.required && !gate.data?.licensed) {
    return { ok: false, reason: 'paused', message: 'Your access is paused, so this is not available here. Email support@mzdigitalbuys.com and we will send you a copy of your data.' };
  }

  const children = await supabase.from('children').select('id,name,age,daily_limit_minutes,notes').order('name');
  if (children.error) return { ok: false, reason: 'failed', message: 'Could not read your children. Please try again.' };

  const sessions: ExportSession[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await supabase.from('screen_sessions').select('child_id,started_at,ended_at,duration_minutes,device_type,activity_type,notes').order('started_at').order('id').range(offset, offset + 499);
    if (page.error) return { ok: false, reason: 'failed', message: 'Could not read your sessions. Please try again.' };
    sessions.push(...(page.data as ExportSession[]));
    if (page.data.length < 500) break;
  }
  return { ok: true, email: user.email ?? '', tz: await getTz(), children: children.data as ExportChild[], sessions };
}
