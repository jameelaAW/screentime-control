'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; notice?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(form: FormData): { email: string; password: string } | { error: string } {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  if (!EMAIL.test(email) || email.length > 254) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Use a password of at least 8 characters.' };
  if (password.length > 72) return { error: 'Passwords can be at most 72 characters.' };
  return { email, password };
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const creds = readCredentials(form);
  if ('error' in creds) return creds;
  try {
    const { error } = await (await createClient()).auth.signInWithPassword(creds);
    if (error) return { error: error.message.toLowerCase().includes('not confirmed') ? 'Please confirm your email first. Check your inbox for the link.' : 'Incorrect email or password.' };
  } catch {
    return { error: 'Could not sign in. Please try again.' };
  }
  redirect('/');
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const creds = readCredentials(form);
  if ('error' in creds) return creds;
  let signedIn = false;
  try {
    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const { data, error } = await (await createClient()).auth.signUp({
      ...creds,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) return { error: error.message.toLowerCase().includes('already') ? 'That email already has an account. Try signing in.' : 'Could not create the account. Please try again.' };
    // With email confirmation off Supabase returns a session straight away; with it on, the caregiver must confirm first.
    signedIn = !!data.session;
  } catch {
    return { error: 'Could not create the account. Please try again.' };
  }
  if (signedIn) redirect('/');
  return { notice: 'Almost there. We sent a confirmation link to your email. Open it, then sign in.' };
}

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return { error: 'Enter a valid email address.' };
  try {
    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    await (await createClient()).auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
  } catch {
    // Fall through: the reply below is identical either way.
  }
  // Same answer whether or not the address has an account, so this can't be used to discover who has one.
  return { notice: 'If that email has an account, we have sent a link to reset the password. Open it in this same browser.' };
}

export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');
  if (password.length < 8) return { error: 'Use a password of at least 8 characters.' };
  if (password.length > 72) return { error: 'Passwords can be at most 72 characters.' };
  if (password !== confirm) return { error: 'The two passwords don\x27t match.' };
  try {
    const { error } = await (await createClient()).auth.updateUser({ password });
    if (error) return { error: error.message.toLowerCase().includes('different') ? 'Choose a password you haven\x27t used before.' : 'Could not update the password. Request a new link and try again.' };
  } catch {
    return { error: 'Could not update the password. Please try again.' };
  }
  redirect('/');
}

export async function signOut() {
  try {
    await (await createClient()).auth.signOut();
  } catch {
    // Clearing the cookie below is what matters; fall through to the login page.
  }
  redirect('/login');
}
