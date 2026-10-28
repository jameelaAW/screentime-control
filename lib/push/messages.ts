export type AlertKind = 'warn' | 'limit' | 'maxrun' | 'remind';
export type Alert = { child_name: string; kind: AlertKind; minutes_left: number; limit_minutes: number; ran_minutes: number; session_id: string };
export type Payload = { title: string; body: string; tag: string };

const plural = (n: number) => `${n} minute${n === 1 ? '' : 's'}`;

/** The text of a phone alert. Kept short: it shows on a lock screen. */
export function alertPayload(a: Alert): Payload {
  const name = a.child_name;
  switch (a.kind) {
    case 'warn':
      return { title: 'Almost at the limit', body: `${name} has about ${plural(a.minutes_left)} left today.`, tag: `warn-${a.session_id}` };
    case 'limit':
      return { title: 'Daily limit reached', body: `${name}'s timer was stopped at the limit of ${plural(a.limit_minutes)}.`, tag: `limit-${a.session_id}` };
    case 'maxrun':
      return { title: 'Timer stopped', body: `${name}'s timer ran for ${plural(a.ran_minutes)} and was stopped automatically.`, tag: `maxrun-${a.session_id}` };
    default:
      return { title: 'Still on screen?', body: `${name}'s timer has been running for ${plural(a.ran_minutes)}. Open the app to stop it.`, tag: `remind-${a.session_id}` };
  }
}
