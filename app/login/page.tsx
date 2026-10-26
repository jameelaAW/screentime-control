import Link from 'next/link';
import AuthForm from '@/components/auth-form';
import { LEGAL_FINAL } from '@/lib/legal';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <p className="brand">◷ Screen Time</p>
      <AuthForm legalLinks={LEGAL_FINAL} licenseRequired={Boolean(process.env.PAYHIP_PRODUCT_SECRET)} initialError={error === 'confirm' ? 'That confirmation link has expired or was already used. Try signing in.' : undefined} />
      <p className="muted"><Link href="/help">New here? Read the user guide</Link></p>
      {LEGAL_FINAL && <p className="muted auth-legal"><Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/refunds">Refunds</Link></p>}
    </main>
  );
}
