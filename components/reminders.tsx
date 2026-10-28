'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { changeTimer } from '@/lib/actions/timer';
import { REMIND_EVERY_MINUTES, WARN_BEFORE_LIMIT_MINUTES, reminderDue } from '@/lib/session-time';

type Running = { id: string; name: string; startedAt: string; minutesLeft: number };

const KEY = 'screentime-confirmed';
const read = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};

/**
 * In-app reminders while a timer runs: a "still on screen?" check every REMIND_EVERY_MINUTES and a
 * heads-up shortly before the daily limit. They only show while this page is open. Messages to a locked or closed phone are phone alerts
 * (see components/push-alerts.tsx and app/api/push/sweep).
 */
export default function Reminders({ running, now }: { running: Running[]; now: number }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<Record<string, number>>({});
  const [pending, begin] = useTransition();
  const [error, setError] = useState('');
  useEffect(() => setConfirmed(read()), []);

  const due = running.filter((r) => r.minutesLeft > 0 && reminderDue(new Date(r.startedAt).getTime(), confirmed[r.id] ?? null, now));
  const soon = running.filter((r) => r.minutesLeft > 0 && r.minutesLeft <= WARN_BEFORE_LIMIT_MINUTES);

  // A background tab can't show the banner, but it can show it in the tab title.
  useEffect(() => {
    if (!due.length && !soon.length) return;
    const original = document.title;
    document.title = `⏰ ${due.length ? 'Still on screen?' : 'Limit almost reached'} · ${original}`;
    return () => { document.title = original; };
  }, [due.length, soon.length]);

  const confirm = (id: string) => {
    const next = { ...read(), [id]: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: reminder just returns after a refresh */ }
    setConfirmed(next);
  };
  const stop = (id: string) => {
    setError('');
    const form = new FormData();
    form.set('operation', 'stop');
    form.set('id', id);
    begin(async () => {
      const result = await changeTimer(form);
      if (result.error) setError(result.error);
      router.refresh();
    });
  };

  if (!due.length && !soon.length && !error) return null;
  return (
    <section className="limit-notifications" aria-label="Reminders">
      {error && <p className="error" role="alert">{error}</p>}
      {due.map((r) => (
        <div className="limit-notification" role="alert" key={`due-${r.id}`}>
          <div>
            <strong>Is {r.name} still on screen?</strong>
            <p>The timer has been running for a while. Stop it if {r.name} has finished (checked every {REMIND_EVERY_MINUTES} minutes).</p>
          </div>
          <div className="row-actions">
            <button type="button" onClick={() => confirm(r.id)}>Still on screen</button>
            <button type="button" className="button" disabled={pending} onClick={() => stop(r.id)}>{pending ? 'Saving…' : 'Stop now'}</button>
          </div>
        </div>
      ))}
      {soon.map((r) => (
        <div className="limit-notification" role="status" key={`soon-${r.id}`}>
          <div>
            <strong>{r.name} is almost at the daily limit</strong>
            <p>About {Math.max(1, Math.ceil(r.minutesLeft))} minute{Math.ceil(r.minutesLeft) === 1 ? '' : 's'} left today. The timer stops automatically when the limit is reached.</p>
          </div>
        </div>
      ))}
    </section>
  );
}
