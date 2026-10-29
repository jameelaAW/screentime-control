import type { Metadata } from 'next';
import { Fill, LegalShell, legalRobots } from '@/components/legal-bits';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Privacy Policy · Screen Time Control', robots: legalRobots };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p className="muted">Effective date: <Fill v={legal.effectiveDate} /></p>
      <p>Screen Time Control stores only what it needs to track children&apos;s screen time for the adults who look after them. This policy explains what we collect, who handles it, and how you can control it.</p>
      <p><strong>Who we are.</strong> <Fill v={legal.legalName} />, trading as MZ Digital Buys (&quot;we&quot;), runs Screen Time Control. You can reach us, and our data protection contact, at <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.</p>

      <h2>What we collect</h2>
      <table className="guide-table">
        <thead><tr><th>Data</th><th>Why we hold it</th></tr></thead>
        <tbody>
          <tr><td>Your email address and password</td><td>To create and protect your account. Your password is stored scrambled (hashed) by our sign-in provider, so we cannot read it.</td></tr>
          <tr><td>Children&apos;s details you enter: name, optional age (0 to 18), notes, daily limit</td><td>To show each child&apos;s screen time against their limit.</td></tr>
          <tr><td>Screen-time records you enter: start and end time, length, device type, activity type, notes</td><td>To work out daily totals and show history.</td></tr>
          <tr><td>A change history: each add, edit and delete, with the old and new values, your reason, and the time</td><td>To keep records accurate and traceable.</td></tr>
          <tr><td>A scrambled (hashed) copy of your Payhip licence key, the date you activated it, and the times of activation attempts</td><td>To make sure one key activates one account, and to stop key guessing.</td></tr>
          <tr><td>If you turn on phone alerts: a code your phone&apos;s browser gives us to reach it (the push address and keys), and your time zone</td><td>To send alerts to that phone. You can turn them off at any time; deleting your account removes them.</td></tr>
          <tr><td>Your time zone, sign-in cookies, and a small note in your browser remembering which reminders you dismissed</td><td>To show the right day, keep you signed in, and avoid repeating reminders.</td></tr>
          <tr><td>Standard server records such as IP address and browser type</td><td>Kept by our hosting and database providers for security and fault-finding.</td></tr>
          <tr><td>Messages you send to support</td><td>To answer you.</td></tr>
        </tbody>
      </table>
      <p><strong>Payments</strong> are handled by Payhip. We never see your card details.</p>
      <p><strong>What we do not collect:</strong> your location, anything on a child&apos;s device, your contacts, or advertising or analytics trackers. We do not sell your data and we do not send marketing emails.</p>

      <h2>Children&apos;s information</h2>
      <p>Screen Time Control is for adults: parents, guardians and childcare staff. Children do not have accounts or use the app. You are responsible for having the right to record information about the children in your care. We recommend a first name or nickname only, and please do not put health or other sensitive details in notes.</p>

      <h2>Who handles your data for us</h2>
      <table className="guide-table">
        <thead><tr><th>Provider</th><th>What it does</th><th>Where</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Database and sign-in</td><td>Singapore</td></tr>
          <tr><td>Vercel</td><td>Hosts the website</td><td>Servers in several countries</td></tr>
          <tr><td>Your phone&apos;s push service (Google, Apple or Mozilla, depending on your phone)</td><td>Delivers phone alerts. It sees the alert text, which includes a child&apos;s first name</td><td>Global</td></tr>
          <tr><td>Resend</td><td>Sends account emails (confirm sign-up, reset password)</td><td>Tokyo</td></tr>
          <tr><td>Cloudflare</td><td>Our domain and support-email forwarding</td><td>Global</td></tr>
          <tr><td>Microsoft Outlook</td><td>Our support inbox</td><td>Global</td></tr>
          <tr><td>Payhip</td><td>Sales, receipts and licence keys</td><td>Global</td></tr>
        </tbody>
      </table>
      <p>Some of these providers store or process data outside Singapore. We choose reputable providers and rely on their security commitments.</p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account, children and sessions stay until you or we delete them. Deleting a child deletes that child&apos;s sessions.</li>
        <li>The change history is kept while your account exists, and is deleted with it.</li>
        <li>You can delete your account yourself at any time from the Account page in the app. That deletes your account, children, sessions, change history and licence record straight away. If you would rather ask us, email us and we will do it within <Fill v={legal.deleteWithinDays} suffix=" days" />. Our provider&apos;s backups may hold a copy for up to <Fill v={legal.backupDays} suffix=" days" /> more.</li>
      </ul>

      <h2>Your choices and rights</h2>
      <p>You can download a copy of your children and sessions yourself at any time from the Account page. You can also ask us to give you a copy of your data, correct it, or delete it, and you can withdraw your consent at any time by deleting your account from the Account page. Otherwise email <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a> from the address on your account. If you are unhappy with our answer you can complain to Singapore&apos;s Personal Data Protection Commission.</p>

      <h2>How we protect it</h2>
      <p>Data travels over encrypted connections. Each account can see only its own children, sessions and history; this is enforced inside the database, not only on screen. We can access stored data when needed to give support, and we do so only for that. If a breach affects you, we will tell you as the law requires.</p>

      <h2>Changes</h2>
      <p>If we change this policy in a way that matters, we will tell you by email or in the app before it takes effect. The date at the top shows the latest version.</p>
    </LegalShell>
  );
}
