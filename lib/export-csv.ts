// Builds the "Download my data" file. Pure functions (no server imports) so they can be unit-tested.

export type ExportChild = { id: string; name: string; age: number | null; daily_limit_minutes: number; notes: string | null };
export type ExportSession = { child_id: string; started_at: string; ended_at: string | null; duration_minutes: number; device_type: string; activity_type: string; notes: string | null };

/** A running session never counts past this many minutes (same as MAX_RUN_MINUTES in lib/session-time.ts). */
const MAX_RUN_MINUTES = 180;

const HEADER = ['Child', 'Age', 'Daily limit (minutes)', 'Child notes', 'Date', 'Start time', 'End time', 'Minutes', 'Device', 'Activity', 'Session notes', 'Status'];

/**
 * One quoted CSV cell. Text that starts with = + - @ (or a tab / carriage return) would be run as a formula by Excel
 * or Sheets, so it gets a leading apostrophe.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Local date (YYYY-MM-DD) and time (HH:mm) of an instant in a time zone. Falls back to UTC for an unknown zone. */
export function localParts(iso: string, tz: string): { date: string; time: string } {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return { date: '', time: '' };
  let zone = tz;
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); } catch { zone = 'UTC'; }
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(instant).map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** The whole file: UTF-8 byte-order mark (so Excel shows accents correctly), a header row, then one row per session. */
export function buildCsv(children: ExportChild[], sessions: ExportSession[], tz: string, now: number): string {
  const byChild = new Map<string, ExportSession[]>();
  for (const s of sessions) byChild.set(s.child_id, [...(byChild.get(s.child_id) ?? []), s]);
  const rows: string[][] = [];
  for (const c of [...children].sort((a, b) => a.name.localeCompare(b.name))) {
    const own = (byChild.get(c.id) ?? []).sort((a, b) => a.started_at.localeCompare(b.started_at));
    const base = [c.name, c.age ?? '', c.daily_limit_minutes, c.notes ?? ''];
    if (!own.length) rows.push([...base.map(String), '', '', '', '', '', '', '', 'No sessions']);
    for (const s of own) {
      const start = localParts(s.started_at, tz);
      const running = !s.ended_at;
      const minutes = running
        ? Math.max(0, Math.min(Math.round((now - new Date(s.started_at).getTime()) / 60000), MAX_RUN_MINUTES))
        : s.duration_minutes;
      rows.push([...base.map(String), start.date, start.time, s.ended_at ? localParts(s.ended_at, tz).time : '', String(minutes), s.device_type, s.activity_type, s.notes ?? '', running ? 'Running' : 'Finished']);
    }
  }
  return '﻿' + [HEADER, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export const exportFilename = (date: string) => `screen-time-control-${date}.csv`;
