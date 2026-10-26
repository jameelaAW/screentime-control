import AuthForm from '@/components/auth-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <p className="brand">◷ Screen Time</p>
      <AuthForm initialError={error === 'confirm' ? 'That confirmation link has expired or was already used. Try signing in.' : undefined} />
    </main>
  );
}
