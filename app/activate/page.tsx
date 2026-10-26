import { redirect } from 'next/navigation';
import ActivateForm from '@/components/activate-form';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SUPPORT_EMAIL = 'support@mzdigitalbuys.com';

// Reached by signed-in accounts that have not activated a licence key yet.
// Signed-out visitors are sent to /login by the route guard.
export default async function ActivatePage() {
  const supabase = await createClient();
  const status = await supabase.rpc('license_status');
  if (!status.data || !status.data.required || status.data.licensed) redirect('/');
  return (
    <main className="auth-page">
      <p className="brand">◷ Screen Time</p>
      <ActivateForm supportEmail={SUPPORT_EMAIL} />
    </main>
  );
}
