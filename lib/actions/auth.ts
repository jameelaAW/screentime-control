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

export async function signOut() {
  try {
    await (await createClient()).auth.signOut();
  } catch {
    // Clearing the cookie below is what matters; fall through to the login page.
  }
  redirect('/login');
}
