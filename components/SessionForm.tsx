"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createSession } from "@/lib/actions/sessions";
import { ACTIVITIES, ACTIVITY_LABELS, DEVICES, DEVICE_LABELS } from "@/lib/constants";
import type { Child } from "@/lib/types";
import { useToast } from "./Toast";

export type SessionFormInitial = {
  childId?: string;
  startedLocal?: string;
  durationMinutes?: number;
  device?: string;
  activity?: string;
  notes?: string;
};

type Props = {
  children: Pick<Child, "id" | "name">[];
  initial?: SessionFormInitial;
  /** Server action to run on submit. Defaults to creating a new session. */
  submitAction?: (input: Parameters<typeof createSession>[0]) => Promise<{ ok: true } | { ok: false; error: string }>;
  submitLabel?: string;
  successMessage?: string;
  /** Show a "reason for change" field (edits). */
  askReason?: boolean;
  cancelHref?: string;
};

function nowLocalInput() {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function SessionForm({
  children,
  initial,
  submitAction = createSession,
  submitLabel = "Save",
  successMessage = "Session logged",
  askReason = false,
  cancelHref = "/",
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [childId, setChildId] = useState(initial?.childId ?? "");
  const [startedLocal, setStartedLocal] = useState(initial?.startedLocal ?? "");
  const [mode, setMode] = useState<"duration" | "end">("duration");
  const [duration, setDuration] = useState(initial?.durationMinutes ? String(initial.durationMinutes) : "");
  const [endedLocal, setEndedLocal] = useState("");
  const [device, setDevice] = useState(initial?.device ?? "");
  const [activity, setActivity] = useState(initial?.activity ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [reason, setReason] = useState("");

  // Default the start time to "now" in the browser's timezone (same zone the server is told via cookie).
  useEffect(() => {
    if (!initial?.startedLocal) setStartedLocal(nowLocalInput());
  }, [initial?.startedLocal]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!childId) return setError("Select a child.");
    if (!device) return setError("Select a device.");
    if (!activity) return setError("Select an activity type.");
    if (!startedLocal) return setError("Enter a start time.");
    if (mode === "duration") {
      const n = Number(duration);
      if (!Number.isInteger(n) || n <= 0) return setError("Duration must be a whole number greater than 0.");
    } else if (!endedLocal) {
      return setError("Enter an end time.");
    }

    startTransition(async () => {
      let res;
      try {
        res = await submitAction({
          childId,
          startedLocal,
          durationMinutes: mode === "duration" ? Number(duration) : null,
          endedLocal: mode === "end" ? endedLocal : null,
          device,
          activity,
          notes,
          reason,
        });
      } catch {
        res = { ok: false as const, error: "Couldn't save — try again" };
      }
      if (res.ok) {
        toast(successMessage);
        router.push(initial?.childId && askReason ? cancelHref : "/");
        router.refresh();
      } else {
        setError(res.error);
        toast(res.error, "error");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4" noValidate>
      <div>
        <label htmlFor="child" className="mb-1 block text-sm font-medium text-slate-700">Child</label>
        <select id="child" className={field} value={childId} onChange={(e) => setChildId(e.target.value)}>
          <option value="">Select a child…</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="device" className="mb-1 block text-sm font-medium text-slate-700">Device</label>
          <select id="device" className={field} value={device} onChange={(e) => setDevice(e.target.value)}>
            <option value="">Select a device…</option>
            {DEVICES.map((d) => (
              <option key={d} value={d}>{DEVICE_LABELS[d]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="activity" className="mb-1 block text-sm font-medium text-slate-700">Activity type</label>
          <select id="activity" className={field} value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="">Select an activity…</option>
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="start" className="mb-1 block text-sm font-medium text-slate-700">Start time</label>
        <input id="start" type="datetime-local" className={field} value={startedLocal} onChange={(e) => setStartedLocal(e.target.value)} />
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">How long?</legend>
        <div className="mb-2 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="mode" checked={mode === "duration"} onChange={() => setMode("duration")} /> Duration
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="mode" checked={mode === "end"} onChange={() => setMode("end")} /> End time
          </label>
        </div>
        {mode === "duration" ? (
          <div className="flex items-center gap-2">
            <input
              id="duration"
              aria-label="Duration in minutes"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className={field}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
            />
            <span className="text-sm text-slate-500">minutes</span>
          </div>
        ) : (
          <input
            id="end"
            aria-label="End time"
            type="datetime-local"
            className={field}
            value={endedLocal}
            onChange={(e) => setEndedLocal(e.target.value)}
          />
        )}
      </fieldset>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">Note (optional)</label>
        <textarea id="notes" rows={2} maxLength={500} className={field} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {askReason && (
        <div>
          <label htmlFor="reason" className="mb-1 block text-sm font-medium text-slate-700">Reason for change (saved to audit log)</label>
          <input id="reason" maxLength={200} className={field} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
