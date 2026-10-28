import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeleteAccountForm from '@/components/delete-account-form';
import PushAlerts from '@/components/push-alerts';
import { pushConfigured } from '@/lib/push/send';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Account · Screen Time Control' };
export const dynamic = 'force-dynamic';

// Signed-in only (signed-out visitors are sent to /login by the route guard). Reachable even when a licence
// is suspended, so a refunded buyer can always delete their data.
export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="guide">
      <p className="eyebrow">ACCOUNT</p>
      <h1>Your account</h1>
      <p className="muted">Signed in as <strong>{user.email}</strong></p>
      <p className="no-print"><Link href="/">← Back to the dashboard</Link> · <Link href="/help">User guide</Link></p>

      <section id="alerts">
        <h2>Phone alerts</h2>
        <p>Get a message on your phone, even when the app is closed, when a child is about 5 minutes from the daily limit, when the timer is stopped at the limit, and if a timer keeps running for a long time.</p>
        <p className="muted">Each phone is switched on separately, so both parents can turn it on. The message shows the child&apos;s first name on the lock screen.</p>
        <PushAlerts publicKey={process.env.VAPID_PUBLIC_KEY ?? ''} available={pushConfigured()} />
      </section>

      <section className="danger-zone">
        <h2>Delete my account</h2>
        <p>This <strong>permanently deletes</strong>, straight away:</p>
        <ul>
          <li>your sign-in (email and password),</li>
          <li>every child you added and all their screen-time sessions,</li>
          <li>the history of changes, and your licence record.</li>
        </ul>
        <p><strong>It cannot be undone</strong>, and we cannot recover anything afterwards. It does <strong>not</strong> refund your purchase. If you want a refund, read the refund policy and email us first.</p>
        <DeleteAccountForm />
      </section>
    </main>
  );
}
