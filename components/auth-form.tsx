'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { signIn, signUp, type AuthState } from '@/lib/actions/auth';

export default function AuthForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === 'signin' ? signIn : signUp, initialError ? { error: initialError } : {});
  return (
    <section className="auth-card">
      <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="muted">{mode === 'signin' ? 'Sign in to see the children in your care.' : 'Your children and their screen time stay private to you.'}</p>
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
