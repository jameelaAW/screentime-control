import type { Metadata } from 'next';
import { Fill, LegalShell, legalRobots } from '@/components/legal-bits';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Refund Policy · Screen Time Control', robots: legalRobots };

export default function RefundsPage() {
  return (
    <LegalShell title="Refund Policy">
      <p className="muted">Effective date: <Fill v={legal.effectiveDate} /></p>
      <p>You can get a refund within <Fill v={legal.refundDays} suffix=" days" /> of buying if you cannot use Screen Time Control because of a fault we cannot fix.</p>
      <p><strong>What you are buying.</strong> A one-time digital licence for Screen Time Control (SGD 6), sold through Payhip. You get access as soon as you buy, so we cannot take it back once it has been delivered, except as set out here.</p>

      <h2>When we refund</h2>
      <ul>
        <li><strong>A fault we cannot fix.</strong> Within <Fill v={legal.refundDays} suffix=" days" /> of purchase, you cannot create or activate your account, or use the app as described in the guide, and we have not fixed it within <Fill v={legal.fixBusinessDays} suffix=" business days" /> of you telling us.</li>
        <li><strong>A mistake in the sale.</strong> You were charged twice for the same purchase, or the wrong amount.</li>
        <li><strong>Where the law requires it.</strong> Nothing here limits any right you have under consumer protection law.</li>
      </ul>

      <h2>When we do not refund</h2>
      <p>We do not refund because you changed your mind after activating your licence, or because the app does not offer a feature that was not described.</p>

      <h2>How to ask</h2>
      <p>Email <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a> from the address you used to buy. Include your Payhip order number and a short note on what went wrong. We aim to reply within <Fill v={legal.replyBusinessDays} suffix=" business days" />.</p>

      <h2>What happens next</h2>
      <ul>
        <li><strong>If we agree,</strong> we refund through Payhip to your original payment method. The time it takes to reach you depends on Payhip and your bank or card provider.</li>
        <li><strong>Your access stops.</strong> Payhip disables your licence key, and we suspend your account, so the app no longer works for you. We keep your data so you can still sign in to the Account page and delete it yourself, or ask us to delete it. We do not delete it automatically.</li>
        <li>Payhip may have its own buyer terms that also apply to your order.</li>
      </ul>
    </LegalShell>
  );
}
