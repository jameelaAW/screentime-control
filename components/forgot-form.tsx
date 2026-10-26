'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset, type AuthState } from '@/lib/actions/auth';

export default function ForgotForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, initialError ? { error: initialError } : {});
  return (
    <section className="auth-card">
      <h1>Reset your password</h1>
      <p className="muted">Enter your email and we will send you a link to choose a new password.</p>
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {state.notice && <p className="notice" role="status">{state.notice}</p>}
      <form action={action}>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <button className="button" disabled={pending}>{pending ? 'Please wait…' : 'Send reset link'}</button>
      </form>
      <p className="muted"><Link href="/login">Back to sign in</Link></p>
    </section>
  );
}
