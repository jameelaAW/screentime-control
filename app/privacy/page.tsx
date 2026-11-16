import type { Metadata } from 'next';
import { Clauses, Fill, LegalShell, T, legalRobots } from '@/components/legal-bits';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Privacy Policy · Screen Time Control', robots: legalRobots };

const E = legal.supportEmail;

const PRIVACY: [string, string][] = [
  ['Who uses the Service', "The Service is intended for adults, including parents, guardians and authorised childcare personnel. Children do not create accounts. Nevertheless, the records entered by adults may contain children's personal data."],
  ['Personal data collected', "We process the adult account email address and authentication information (passwords are hashed by our authentication provider); each child's nickname, optional age, notes and daily limit; screen-time sessions (start/end times, duration, device and activity type, notes); change history (previous and new values, reasons and timestamps); hashed licence-key records, activation dates and attempts; the date and version of the Terms and Privacy Policy you accepted; time zone, sign-in cookies, browser reminder preferences, IP address, browser/server logs; support messages; and, if enabled, push subscriptions and notification data. Payhip handles payments and shares with us the order details needed to issue and support your licence, such as your email address and order number; we do not receive full payment-card details."],
  ['Why we use data', 'We use data to authenticate accounts, activate licences, provide screen-time tracking and exports, maintain change history, deliver requested alerts and account emails, respond to support requests, protect the Service, investigate misuse, and meet legal obligations. We do not use the data for behavioural advertising, we do not sell it, and we do not send marketing emails.'],
  ["Children's data and authority", 'Adults should enter only the minimum information needed: a nickname, not a full name, and no sensitive details. Adults submitting information must have appropriate authority and provide required notices and obtain required consent where applicable; the app asks you to confirm this when you add a child. We will assess the applicable PDPA obligations based on whether we determine processing purposes ourselves or process data for a childcare organisation as its data intermediary.'],
  ['Service providers and overseas processing', 'We use Supabase (database and authentication), Vercel (hosting; potentially multiple countries), Resend (account emails), Cloudflare (domain/email forwarding), Microsoft Outlook (support inbox), Payhip (checkout, receipts and licence keys), and relevant Apple, Google or Mozilla push services when alerts are enabled. Processing may occur outside Singapore. We will take measures required by the PDPA for overseas transfers, including appropriate contractual or other safeguards where required.'],
  ['Phone notifications', "If you enable alerts, your browser or device supplies push subscription details, and notification text may include a child's nickname. Notification content may be handled by the relevant push service and may appear on a lock screen or be seen by others with access to the device. You can disable notifications in the Service or device settings."],
  ['Cookies and tracking', 'We use sign-in and time-zone cookies, and limited browser storage to remember which reminders you dismissed. We do not use advertising or analytics trackers.'],
  ['Retention', `Account records, children's details, sessions and change history are kept while an account is active. Account deletion removes live account records immediately; provider backups may retain a copy for up to ${legal.backupDays} days. If a purchase is refunded, the account is suspended and its data is deleted 12 months after suspension, with a reminder 30 days before, unless you reactivate or delete it sooner. Accounts with no sign-in for 24 months are deleted after a 30-day warning email. Licence activation attempts are kept for 90 days. Support emails are kept for 2 years, and sales and refund records for 5 years for tax purposes. Data linked to an open refund, dispute or legal claim is kept until it is resolved.`],
  ['Access, correction, withdrawal and deletion', `You may export children's records and sessions and request access to or correction of personal data by emailing ${E}. You may delete your account in the Account page, or ask us by email and we will do it within ${legal.deleteWithinDays} days. You may withdraw consent by contacting us; withdrawal may affect our ability to provide the Service and does not necessarily require deletion of data we lawfully need to retain. We will respond in accordance with applicable PDPA requirements, including any permitted exceptions and applicable fees.`],
  ['Security and incidents', 'We use encrypted connections and account-level access controls. Authorised personnel may access records where reasonably needed for support, security or legal compliance, subject to appropriate safeguards. No system is completely secure. We assess data incidents and make notifications to the PDPC and affected individuals where required by law.'],
  ['Contact and complaints', `For privacy requests or concerns, contact our Data Protection Officer at ${E}. You may also contact Singapore's Personal Data Protection Commission about concerns relating to personal data.`],
  ['Updates', 'We may update this policy when practices or legal requirements change. Material changes will be notified by email or in the Service before taking effect where practicable. The effective date above indicates the current version.'],
];

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p className="muted">Effective date: <Fill v={legal.effectiveDate} /></p>
      <p><T>{`This policy explains how ${legal.legalName}, trading as MZ Digital Buys, collects, uses, discloses, retains and protects personal data when adults use Screen Time Control. Contact our Data Protection Officer at ${E}.`}</T></p>
      <Clauses items={PRIVACY} />
    </LegalShell>
  );
}
