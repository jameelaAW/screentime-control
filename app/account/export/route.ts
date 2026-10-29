import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTz } from '@/lib/time';
import { buildCsv, exportFilename, localParts, type ExportChild, type ExportSession } from '@/lib/export-csv';

export const dynamic = 'force-dynamic';

const text = (body: string, status: number) => new NextResponse(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

// "Download my data": the signed-in caregiver's own children and sessions as a CSV file. The database client is bound to
// their session, so row-level security returns only their rows. Signed-out visitors are sent to /login by the route guard.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return text('Please sign in to download your data.', 401);

  const gate = await supabase.rpc('license_status');
  if (gate.data?.required && !gate.data?.licensed) return text('Your access is paused, so the download is not available here. Email support@mzdigitalbuys.com and we will send you a copy of your data.', 403);

  const children = await supabase.from('children').select('id,name,age,daily_limit_minutes,notes').order('name');
  if (children.error) return text('Could not read your children. Please try again.', 500);

  const sessions: ExportSession[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await supabase.from('screen_sessions').select('child_id,started_at,ended_at,duration_minutes,device_type,activity_type,notes').order('started_at').order('id').range(offset, offset + 499);
    if (page.error) return text('Could not read your sessions. Please try again.', 500);
    sessions.push(...(page.data as ExportSession[]));
    if (page.data.length < 500) break;
  }

  const tz = await getTz();
  const csv = buildCsv(children.data as ExportChild[], sessions, tz, Date.now());
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFilename(localParts(new Date().toISOString(), tz).date)}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
