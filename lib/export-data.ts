// "Download my data": the spreadsheet file (CSV) and the readable report. Pure functions (no server imports) so they can be unit-tested.

export type ExportChild = { id: string; name: string; age: number | null; daily_limit_minutes: number; notes: string | null };
export type ExportSession = { child_id: string; started_at: string; ended_at: string | null; duration_minutes: number; device_type: string; activity_type: string; notes: string | null };

/** A running session never counts past this many minutes (same as MAX_RUN_MINUTES in lib/session-time.ts). */
const MAX_RUN_MINUTES = 180;

const DEVICES: Record<string, string> = { tv: 'TV', tablet: 'Tablet', phone: 'Phone', computer: 'Computer', 'game-console': 'Game console' };
const ACTIVITIES: Record<string, string> = { video: 'Video', game: 'Game', educational: 'Educational', social: 'Social', browsing: 'Browsing' };
export const deviceLabel = (key: string) => DEVICES[key] ?? key;
export const activityLabel = (key: string) => ACTIVITIES[key] ?? key;

const HEADER = ['Child', 'Age', 'Daily limit (min)', 'Child notes', 'Date', 'Start', 'End', 'Minutes', 'Device', 'Activity', 'Session notes', 'Status'];

/**
 * One CSV cell. Quotes are added only when needed (comma, quote, line break, edge spaces), which keeps the raw file
 * readable. Text that starts with = + - @ (or a tab / carriage return) would be run as a formula by Excel or Sheets,
 * so it gets a leading apostrophe.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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

/** Minutes a session counts for: the recorded length, or for a running timer the time so far (never more than 3 hours). */
export function sessionMinutes(s: ExportSession, now: number): number {
  if (s.ended_at) return s.duration_minutes;
  return Math.max(0, Math.min(Math.round((now - new Date(s.started_at).getTime()) / 60000), MAX_RUN_MINUTES));
}

const byName = (a: ExportChild, b: ExportChild) => a.name.localeCompare(b.name);

/** The spreadsheet file: UTF-8 byte-order mark (so Excel shows accents correctly), a header row, then one row per session. */
export function buildCsv(children: ExportChild[], sessions: ExportSession[], tz: string, now: number): string {
  const byChild = new Map<string, ExportSession[]>();
  for (const s of sessions) byChild.set(s.child_id, [...(byChild.get(s.child_id) ?? []), s]);
  const rows: string[][] = [];
  for (const c of [...children].sort(byName)) {
    const own = (byChild.get(c.id) ?? []).sort((a, b) => a.started_at.localeCompare(b.started_at));
    const base = [c.name, c.age ?? '', c.daily_limit_minutes, c.notes ?? ''].map(String);
    if (!own.length) rows.push([...base, '', '', '', '', '', '', '', 'No sessions']);
    for (const s of own) {
      const start = localParts(s.started_at, tz);
      rows.push([...base, start.date, start.time, s.ended_at ? localParts(s.ended_at, tz).time : '', String(sessionMinutes(s, now)), deviceLabel(s.device_type), activityLabel(s.activity_type), s.notes ?? '', s.ended_at ? 'Finished' : 'Running']);
    }
  }
  return '﻿' + [HEADER, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export type ReportSession = { date: string; start: string; end: string; minutes: number; device: string; activity: string; notes: string; running: boolean };
export type ReportDay = { date: string; minutes: number; sessions: number; over: boolean };
export type ReportChild = { name: string; age: number | null; limit: number; notes: string; sessionCount: number; totalMinutes: number; days: ReportDay[]; sessions: ReportSession[] };
export type Report = { generatedDate: string; generatedTime: string; tz: string; children: ReportChild[] };

/**
 * The readable report: for each child, daily totals against the limit and every session, newest first.
 * A session is counted on the day it started (the dashboard itself splits a session that crosses midnight).
 */
export function buildReport(children: ExportChild[], sessions: ExportSession[], tz: string, now: number): Report {
  const now_ = localParts(new Date(now).toISOString(), tz);
  const out: ReportChild[] = [];
  for (const c of [...children].sort(byName)) {
    const own = sessions.filter((s) => s.child_id === c.id).sort((a, b) => b.started_at.localeCompare(a.started_at));
    const list: ReportSession[] = own.map((s) => {
      const start = localParts(s.started_at, tz);
      return { date: start.date, start: start.time, end: s.ended_at ? localParts(s.ended_at, tz).time : '', minutes: sessionMinutes(s, now), device: deviceLabel(s.device_type), activity: activityLabel(s.activity_type), notes: s.notes ?? '', running: !s.ended_at };
    });
    const days = new Map<string, ReportDay>();
    for (const s of list) {
      const d = days.get(s.date) ?? { date: s.date, minutes: 0, sessions: 0, over: false };
      d.minutes += s.minutes; d.sessions += 1; d.over = d.minutes > c.daily_limit_minutes;
      days.set(s.date, d);
    }
    out.push({ name: c.name, age: c.age, limit: c.daily_limit_minutes, notes: c.notes ?? '', sessionCount: list.length, totalMinutes: list.reduce((n, s) => n + s.minutes, 0), days: [...days.values()].sort((a, b) => b.date.localeCompare(a.date)), sessions: list });
  }
  return { generatedDate: now_.date, generatedTime: now_.time, tz, children: out };
}

export const exportFilename = (date: string) => `screen-time-control-${date}.csv`;
