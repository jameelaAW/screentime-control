'use client';
import { useActionState } from 'react';
import { updatePassword, type AuthState } from '@/lib/actions/auth';

export default function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <section className="auth-card">
      <h1>Choose a new password</h1>
      <p className="muted">Use at least 8 characters.</p>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      <form action={action}>
        <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} /></label>
        <label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72} /></label>
        <button className="button" disabled={pending}>{pending ? 'Please wait…' : 'Save new password'}</button>
      </form>
    </section>
  );
}
