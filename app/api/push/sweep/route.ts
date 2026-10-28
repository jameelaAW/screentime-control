import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { adminClient } from '@/lib/license';
import { MAX_RUN_MINUTES, REMIND_EVERY_MINUTES, WARN_BEFORE_LIMIT_MINUTES } from '@/lib/session-time';
import { alertPayload, type Alert } from '@/lib/push/messages';
import { missingPushConfig, sendToUser } from '@/lib/push/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function authorised(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const wanted = Buffer.from(`Bearer ${secret}`);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

// Called every minute by the database scheduler (see docs/PHONE-ALERTS.md). Closes timers that reached the limit
// and sends each alert once.
export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: 'Not allowed' }, { status: 401 });
  const missing = missingPushConfig();
  if (missing.length) return NextResponse.json({ error: 'Phone alerts are not configured', missing }, { status: 503 }); // only reachable with the scheduler secret
  const { data, error } = await adminClient().rpc('push_sweep', { max_minutes: MAX_RUN_MINUTES, warn_minutes: WARN_BEFORE_LIMIT_MINUTES, remind_every: REMIND_EVERY_MINUTES });
  if (error) { console.error('push_sweep failed', error.message); return NextResponse.json({ error: 'Sweep failed' }, { status: 500 }); }
  let delivered = 0;
  for (const row of (data ?? []) as (Alert & { user_id: string })[]) delivered += await sendToUser(row.user_id, alertPayload(row));
  return NextResponse.json({ alerts: (data ?? []).length, delivered });
}
