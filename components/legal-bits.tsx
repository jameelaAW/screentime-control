import type { ReactNode } from 'react';
import Link from 'next/link';
import { LEGAL_FINAL, legal } from '@/lib/legal';

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

/** Plain text with the support email turned into a mailto link. */
export function T({ children }: { children: string }) {
  const parts = children.split(legal.supportEmail);
  return <>{parts.map((part, i) => <span key={i}>{part}{i < parts.length - 1 && <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>}</span>)}</>;
}

/** Numbered clauses: [heading, text] pairs, rendered as "1. Heading. Text". */
export function Clauses({ items }: { items: [string, string][] }) {
  return <>{items.map(([h, t], i) => <p key={h}><strong>{i + 1}. {h}.</strong> <T>{t}</T></p>)}</>;
}
