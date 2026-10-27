'use server';
import { createClient as createJsClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type DeleteState = { error?: string };

/**
 * Permanently deletes the signed-in caregiver's account and everything tied to it (children, sessions,
 * change history, licence record). Two safeguards against an accident or an unattended screen:
 * the account password is re-checked, and the word DELETE must be typed.
 */
export async function deleteAccount(_prev: DeleteState, form: FormData): Promise<DeleteState> {
  if (String(form.get('confirm') || '').trim().toUpperCase() !== 'DELETE') return { error: 'Type the word DELETE to confirm.' };
  const password = String(form.get('password') || '');
  if (!password) return { error: 'Enter your password to confirm.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');

  // Re-check the password on a throwaway client so this does not disturb the current session.
  try {
    const check = createJsClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await check.auth.signInWithPassword({ email: user.email, password });
    if (error) return { error: 'That password is not correct.' };
  } catch {
    return { error: 'Could not check your password. Please try again.' };
  }

  const { error } = await supabase.rpc('delete_my_account');
  if (error) {
    console.error('delete_my_account failed', error.code, error.message);
    return { error: 'Could not delete your account. Please try again, or email support and we will do it for you.' };
  }

  try {
    await supabase.auth.signOut(); // clears the browser cookies; the account itself is already gone
  } catch {
    // Nothing to do: the login is gone either way.
  }
  redirect('/login?deleted=1');
}
