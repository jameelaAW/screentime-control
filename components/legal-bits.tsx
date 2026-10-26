import type { ReactNode } from 'react';
import Link from 'next/link';
import { LEGAL_FINAL } from '@/lib/legal';

/** A value that may not be decided yet: shows the value, or a highlighted [to be confirmed]. */
export function Fill({ v, suffix = '' }: { v: string | number | null; suffix?: string }) {
  if (v === null) return <mark className="legal-fill">[to be confirmed]</mark>;
  return <>{v}{suffix}</>;
}

/** A choice that is still open, with a short note on what is being decided. */
export function Tbc({ children }: { children: ReactNode }) {
  return <mark className="legal-fill">[to be confirmed: {children}]</mark>;
}

/** Robots rule for the legal pages: invisible to search engines until they are final. */
export const legalRobots = LEGAL_FINAL ? undefined : { index: false, follow: false };

export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="guide">
      {!LEGAL_FINAL && (
        <p className="legal-banner" role="note">
          <strong>Draft.</strong> This page is being finalised and is not yet in force. Highlighted items are still to be confirmed.
        </p>
      )}
      <p className="eyebrow">LEGAL</p>
      <h1>{title}</h1>
      {children}
      <p className="legal-links no-print">
        <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link> · <Link href="/refunds">Refund Policy</Link> · <Link href="/help">User guide</Link> · <Link href="/login">Back to the app</Link>
      </p>
    </main>
  );
}
