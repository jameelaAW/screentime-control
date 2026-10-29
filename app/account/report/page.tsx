import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReportView from '@/components/report-view';
import { loadExportData } from '@/lib/data/export';
import { buildReport } from '@/lib/export-data';

export const metadata: Metadata = { title: 'My data · Screen Time Control', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// A readable copy of the signed-in caregiver's data: daily totals against the limit, then every session. Meant to be read
// on a phone or saved as a PDF (Print / save as PDF).
export default async function ReportPage() {
  const data = await loadExportData();
  if (!data.ok && data.reason === 'signed-out') redirect('/login');

  return (
    <main className="guide report">
      <p className="no-print"><Link href="/account">← Back to Account</Link></p>
      <p className="eyebrow">MY DATA</p>
      <h1>Screen Time Control</h1>
      {data.ok ? <ReportView report={buildReport(data.children, data.sessions, data.tz, Date.now())} email={data.email} /> : <p>{data.message}</p>}
    </main>
  );
}
