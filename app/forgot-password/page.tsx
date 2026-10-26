import ForgotForm from '@/components/forgot-form';

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <p className="brand">◷ Screen Time</p>
      <ForgotForm initialError={error === 'link' ? 'That reset link has expired or was already used. Request a new one below. Open it in the same browser you request it from.' : undefined} />
    </main>
  );
}
