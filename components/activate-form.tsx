'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { activateLicense, type ActivateState } from '@/lib/actions/license';
import { signOut } from '@/lib/actions/auth';

export default function ActivateForm({ supportEmail }: { supportEmail: string }) {
  const [state, action, pending] = useActionState<ActivateState, FormData>(activateLicense, {});
  return (
    <section className="auth-card">
      <h1>Activate your account</h1>
      <p className="muted">Enter the licence key from your purchase. You will find it on your Payhip receipt and in the email Payhip sent you. You only do this once.</p>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <form action={action}>
        <label>Licence key<input name="license_key" autoComplete="off" autoCapitalize="characters" spellCheck={false} required maxLength={80} placeholder="XXXXX-XXXXX-XXXXX-XXXXX" /></label>
        <button className="button" disabled={pending}>{pending ? 'Checking…' : 'Activate'}</button>
      </form>
      <p className="muted">Lost your key or something is wrong? Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with the email you used to buy.</p>
      <p className="muted">New here? <Link href="/help">Read the user guide</Link> for how sign-up, activation and the timer work.</p>
      <form action={signOut}><button className="link-button">Sign out</button></form>
    </section>
  );
}
