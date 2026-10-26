import type { Metadata } from 'next';
import { Fill, LegalShell, legalRobots } from '@/components/legal-bits';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Terms of Service · Screen Time Control', robots: legalRobots };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service">
      <p className="muted">Effective date: <Fill v={legal.effectiveDate} /></p>
      <p>By creating an account or activating a licence key you agree to these terms. If you do not agree, please do not use Screen Time Control.</p>

      <p><strong>1. Who we are.</strong> Screen Time Control is run by <Fill v={legal.legalName} />, trading as MZ Digital Buys (&quot;we&quot;). Contact: <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>.</p>

      <p><strong>2. What the service is, and is not.</strong> Screen Time Control is a tool for adults to record and track children&apos;s screen time against a daily limit. It stores the times you enter. It <strong>does not</strong> block or lock devices, filter websites or apps, or monitor what a child watches, plays or types. It is not a child-safety, supervision or monitoring service, and you remain responsible for supervising the children in your care.</p>

      <p><strong>3. Your licence.</strong> Your purchase gives you a licence to use the service. <strong>One licence key activates one account.</strong> You may use it for the children in your own household or in the childcare setting you run. You may not share your key or account with others outside that group, or sell, rent or give away your key or access.</p>

      <p><strong>4. Your account.</strong> Give accurate details, keep your password private, and tell us if you think someone else has used your account. You are responsible for what happens under your account. You must be an adult.</p>

      <p><strong>5. Your information.</strong> You must have the right to record the information you enter about the children in your care. Keep notes factual, and do not enter health or other sensitive details. Our Privacy Policy explains how we handle data.</p>

      <p><strong>6. Acceptable use.</strong> Do not try to get around the licence check, look at other people&apos;s data, overload or attack the service, copy it, or use it for anything unlawful.</p>

      <p><strong>7. Availability and updates.</strong> You pay a one-time price for access, not for a fixed term. We will keep the service running for at least <Fill v={legal.minAccessMonths} suffix=" months" /> from your purchase and will give at least <Fill v={legal.closureNoticeDays} suffix=" days" /> notice before closing it. If feasible, we will give you a copy of your records on request. We may update, fix or improve the service. We take reasonable care, but the service may sometimes be unavailable, so please keep your own record of anything important.</p>

      <p><strong>8. Accuracy.</strong> Totals depend on what you enter and on pressing start and stop. A timer that is not stopped is closed at the daily limit or after 3 hours, so a forgotten timer can record more time than was used. You can correct sessions in the app.</p>

      <p><strong>9. Suspension.</strong> We may suspend or close an account that breaks these terms, after warning you where reasonable. Refunds are covered by our Refund Policy.</p>

      <p><strong>10. No warranties.</strong> To the fullest extent the law allows, the service is provided &quot;as is&quot; and we do not promise it will be uninterrupted or error-free.</p>

      <p><strong>11. Limit of liability.</strong> To the fullest extent the law allows, we are not liable for indirect or consequential loss, and our total liability to you for anything connected with the service is limited to the price you paid. Nothing in these terms limits any right you have under law that cannot be excluded, including consumer protection rights.</p>

      <p><strong>12. Changes to these terms.</strong> If we make a change that matters, we will tell you by email or in the app before it takes effect.</p>

      <p><strong>13. Governing law.</strong> These terms are governed by the laws of <Fill v={legal.governingLaw} />, and the courts of <Fill v={legal.governingLaw} /> will decide any dispute, unless the law in your country gives you the right to use your local courts.</p>
    </LegalShell>
  );
}
