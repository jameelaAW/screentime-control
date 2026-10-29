import { NextResponse } from 'next/server';
import { loadExportData } from '@/lib/data/export';
import { buildCsv, exportFilename, localParts } from '@/lib/export-data';

export const dynamic = 'force-dynamic';

const text = (body: string, status: number) => new NextResponse(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

// "Download my data" as a spreadsheet file (CSV). Signed-out visitors are sent to /login by the route guard.
export async function GET() {
  const data = await loadExportData();
  if (!data.ok) return text(data.message, data.reason === 'signed-out' ? 401 : data.reason === 'paused' ? 403 : 500);
  const now = Date.now();
  return new NextResponse(buildCsv(data.children, data.sessions, data.tz, now), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFilename(localParts(new Date(now).toISOString(), data.tz).date)}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
