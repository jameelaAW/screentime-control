// Timezone helpers. The browser reports its IANA zone in a `tz` cookie
// (see components/TzCookie.tsx); the server falls back to UTC until it arrives.
import { cookies } from "next/headers";

function validTz(tz: string | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function getTz(): Promise<string> {
  const tz = (await cookies()).get("tz")?.value;
  return validTz(tz) ? tz : "UTC";
}

function offsetMs(ts: number, tz: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(ts))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/** Wall-clock time in `tz` -> UTC Date. Month is 1-based; day/hour overflow is normalised. */
export function zonedToUtc(y: number, m: number, d: number, h: number, mi: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let t = guess - offsetMs(guess, tz);
  t = guess - offsetMs(t, tz);
  return new Date(t);
}

/** YYYY-MM-DD for `date` as seen in `tz`. */
export function localDateStr(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function isDateStr(s: string | undefined | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** [start, end) of a local calendar day, as UTC ISO strings. */
export function dayRange(dateStr: string, tz: string): { from: string; to: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return {
    from: zonedToUtc(y, m, d, 0, 0, tz).toISOString(),
    to: zonedToUtc(y, m, d + 1, 0, 0, tz).toISOString(),
  };
}

/** "YYYY-MM-DDTHH:mm" (datetime-local value, in `tz`) -> UTC Date, or null if malformed. */
export function parseLocalInput(value: string, tz: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number) as unknown as number[];
  const date = zonedToUtc(y, mo, d, h, mi, tz);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** UTC ISO string -> "YYYY-MM-DDTHH:mm" in `tz` (datetime-local value). */
export function toLocalInput(iso: string, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatDateTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}
