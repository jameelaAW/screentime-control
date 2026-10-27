'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signIn, signUp, type AuthState } from '@/lib/actions/auth';

export default function AuthForm({ initialError, initialNotice, licenseRequired, legalLinks }: { initialError?: string; initialNotice?: string; licenseRequired?: boolean; legalLinks?: boolean }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === 'signin' ? signIn : signUp, initialError ? { error: initialError } : initialNotice ? { notice: initialNotice } : {});
  return (
    <section className="auth-card">
      <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="muted">{mode === 'signin' ? 'Sign in to see the children in your care.' : 'Your children and their screen time stay private to you.'}</p>
      {mode === 'signup' && licenseRequired && <p className="notice">You will need the <strong>licence key from your purchase</strong>. After you confirm your email and sign in, you enter it once to activate your account.</p>}
      {mode === 'signup' && legalLinks && <p className="muted auth-legal">By creating an account you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>}
      {state.error && <p className="error" role="alert">{state.error}</p>}
      {state.notice && <p className="notice" role="status">{state.notice}</p>}
      <form action={action}>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Password<input name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={8} maxLength={72} /></label>
        <button className="button" disabled={pending}>{pending ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
      </form>
      {mode === 'signin' && <p className="muted"><Link href="/forgot-password">Forgot your password?</Link></p>}
      <p className="muted">
        {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
        <button type="button" className="link-button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</button>
      </p>
    </section>
  );
}
