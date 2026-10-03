import { ACTIVITIES, DEVICES, MAX_SESSION_MINUTES } from "@/lib/constants";
import { getChild } from "@/lib/data/children";
import type { SessionInput } from "@/lib/data/sessions";
import { getTz, parseLocalInput } from "@/lib/time";

export type SessionFormInput = {
  childId: string;
  /** datetime-local value in the caller's timezone: YYYY-MM-DDTHH:mm */
  startedLocal: string;
  /** Provide exactly one of durationMinutes / endedLocal. */
  durationMinutes?: number | null;
  endedLocal?: string | null;
  device: string;
  activity: string;
  notes?: string | null;
  /** Reason for an edit/delete (stored in the audit log). */
  reason?: string | null;
};

/** Server-side validation shared by create and edit. */
export async function validateSession(input: SessionFormInput): Promise<{ ok: false; error: string } | { ok: true; row: SessionInput; childName: string }> {
  if (!input.childId) return { ok: false, error: "Select a child." };
  if (!DEVICES.includes(input.device as never)) return { ok: false, error: "Select a device." };
  if (!ACTIVITIES.includes(input.activity as never)) return { ok: false, error: "Select an activity type." };

  const tz = await getTz();
  const start = parseLocalInput(input.startedLocal ?? "", tz);
  if (!start) return { ok: false, error: "Enter a valid start time." };

  let minutes: number;
  if (input.endedLocal) {
    const end = parseLocalInput(input.endedLocal, tz);
    if (!end) return { ok: false, error: "Enter a valid end time." };
    minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes <= 0) return { ok: false, error: "End time must be after the start time." };
  } else {
    minutes = Number(input.durationMinutes);
    if (!Number.isInteger(minutes)) return { ok: false, error: "Duration must be a whole number of minutes." };
    if (minutes <= 0) return { ok: false, error: "Duration must be greater than 0 minutes." };
  }
  if (minutes > MAX_SESSION_MINUTES) return { ok: false, error: "A session can't be longer than 24 hours." };

  const child = await getChild(input.childId);
  if (!child) return { ok: false, error: "That child no longer exists." };

  const notes = input.notes?.trim() ? input.notes.trim().slice(0, 500) : null;
  return {
    ok: true,
    childName: child.name,
    row: {
      child_id: child.id,
      started_at: start.toISOString(),
      ended_at: new Date(start.getTime() + minutes * 60000).toISOString(),
      duration_minutes: minutes,
      device_type: input.device,
      activity_type: input.activity,
      notes,
    },
  };
}

