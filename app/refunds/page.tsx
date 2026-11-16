import type { Metadata } from 'next';
import { Clauses, Fill, LegalShell, legalRobots } from '@/components/legal-bits';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Refund Policy · Screen Time Control', robots: legalRobots };

const REFUNDS: [string, string][] = [
  ['What you purchase', 'Screen Time Control is sold as a one-time digital licence for SGD 5.00 through Payhip. There is no subscription. Access is provided after successful purchase and licence activation.'],
  ['Voluntary seven-day technical-fault refund', `In addition to your statutory rights, you may request a refund within ${legal.refundDays} days of purchase if a material fault prevents you from creating or activating your account or using the Service substantially as described, and we cannot remedy the issue within ${legal.fixBusinessDays} business days after receiving enough information to investigate it.`],
  ['Incorrect or duplicate charges', 'We will investigate and appropriately remedy duplicate or incorrect charges.'],
  ['Change of mind and undisclosed features', 'We generally do not offer a voluntary change-of-mind refund after activation. We do not offer a voluntary refund merely because the Service lacks a feature that was not represented as included. These limits do not affect statutory rights or remedies.'],
  ['Your legal rights', 'Nothing in this policy excludes or restricts rights or remedies available under applicable Singapore consumer protection law or other mandatory law. The seven-day period in section 2 applies only to our additional voluntary refund arrangement, not to statutory claims.'],
  ['How to request a refund', `Email ${legal.supportEmail} from the email address used for purchase. Include your Payhip order number and a short description of the problem. We aim to reply within ${legal.replyBusinessDays} business days.`],
  ['Processing and access after a refund', 'Approved refunds are processed through Payhip to the original payment method where available; arrival time depends on the payment provider and bank. Once a refund is processed, we will suspend access associated with that purchase. You can still sign in to the Account page to download or delete your data. Otherwise, the account and its data are deleted 12 months after the refund, as described in the Privacy Policy.'],
  ['Payhip terms', 'Payhip may apply separate checkout or payment-processing terms. Those terms do not remove any mandatory rights you have against the seller under applicable law.'],
];

export default function RefundsPage() {
  return (
    <LegalShell title="Refund Policy">
      <p className="muted">Effective date: <Fill v={legal.effectiveDate} /></p>
      <Clauses items={REFUNDS} />
    </LegalShell>
  );
}
