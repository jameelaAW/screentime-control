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
  const gate = await supabase.rpc('license_status');
  const paused = Boolean(gate.data?.required && !gate.data?.licensed);

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

      <section id="export">
        <h2>Download my data</h2>
        {paused ? (
          <p>Your access is paused, so the download is not available here. Email <a href="mailto:support@mzdigitalbuys.com">support@mzdigitalbuys.com</a> and we will send you a copy of your data.</p>
        ) : (
          <>
            <p>Keep a copy of your children and all their screen-time sessions. Choose the format that suits you.</p>
            <ul>
              <li><strong>Readable report:</strong> a clean page with each child&apos;s day-by-day totals against the limit and every session. Best on a phone. You can print it or save it as a PDF.</li>
              <li><strong>Spreadsheet (CSV):</strong> one row per session, for Excel, Numbers or Google Sheets. Best if you want to sort or chart the data.</li>
              <li>Times are in your time zone, and children with no sessions yet are included. Download again any time for a fresh copy.</li>
            </ul>
            <p className="guide-actions no-print"><Link className="button" href="/account/report">View readable report</Link> <a className="button" href="/account/export" download>Download spreadsheet (CSV)</a></p>
            <p className="muted">These files contain your children&apos;s names, so keep them somewhere private.</p>
          </>
        )}
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
