import ResetForm from '@/components/reset-form';

export const dynamic = 'force-dynamic';

// Reached from the emailed reset link, which signs the caregiver in first (see /auth/callback).
// Signed-out visitors are sent to /login by the route guard.
export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <p className="brand">◷ Screen Time</p>
      <ResetForm />
    </main>
  );
}
