import PrintButton from '@/components/print-button';
import type { Report } from '@/lib/export-data';

const mins = (n: number) => `${n} min`;

/** The readable copy of a caregiver's data: summary, then for each child the day-by-day totals and every session. */
export default function ReportView({ report, email }: { report: Report; email: string }) {
  return (
    <>
      <p className="muted">Prepared {report.generatedDate} at {report.generatedTime} ({report.tz}) for {email}. Times are in your time zone. A session is counted on the day it started.</p>
      <p className="no-print guide-actions">
        <PrintButton /> <a className="button" href="/account/export" download>Download spreadsheet (CSV)</a>
      </p>
      <p className="muted no-print">On an iPhone: tap Share, then Print, pinch the preview outward, tap Share again and choose Save to Files to keep a PDF.</p>

      {!report.children.length ? (
        <p>You have not added any children yet.</p>
      ) : (
        <>
          <h2>Summary</h2>
          <div className="report-scroll">
            <table className="guide-table">
              <thead><tr><th>Child</th><th>Age</th><th>Daily limit</th><th>Sessions</th><th>Total time</th></tr></thead>
              <tbody>
                {report.children.map((c) => (
                  <tr key={c.name}><td>{c.name}</td><td>{c.age ?? '—'}</td><td>{mins(c.limit)}</td><td>{c.sessionCount}</td><td>{mins(c.totalMinutes)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.children.map((c) => (
            <section className="report-child" key={`detail-${c.name}`}>
              <h2>{c.name}</h2>
              <p className="muted">{c.age === null ? 'Age not set' : `${c.age} years old`} · daily limit {mins(c.limit)}{c.notes ? ` · ${c.notes}` : ''}</p>
              {!c.sessions.length ? (
                <p>No sessions recorded yet.</p>
              ) : (
                <>
                  <h3>Day by day</h3>
                  <div className="report-scroll">
                    <table className="guide-table">
                      <thead><tr><th>Date</th><th>Sessions</th><th>Total</th><th>Against the limit</th></tr></thead>
                      <tbody>
                        {c.days.map((d) => (
                          <tr key={d.date}><td className="nowrap">{d.date}</td><td>{d.sessions}</td><td>{mins(d.minutes)}</td><td>{d.over ? `Over limit (${d.minutes - c.limit} min over)` : 'Within limit'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3>All sessions</h3>
                  <div className="report-scroll">
                    <table className="guide-table">
                      <thead><tr><th>Date</th><th>Time</th><th>Minutes</th><th>Device</th><th>Activity</th><th>Notes</th></tr></thead>
                      <tbody>
                        {c.sessions.map((s, i) => (
                          <tr key={`${s.date}-${s.start}-${i}`}>
                            <td className="nowrap">{s.date}</td>
                            <td className="nowrap">{s.start}{s.running ? ' – running' : `–${s.end}`}</td>
                            <td>{s.minutes}</td>
                            <td>{s.device}</td>
                            <td>{s.activity}</td>
                            <td>{s.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          ))}
        </>
      )}
      <p className="muted">This file contains your children&apos;s names. Keep it somewhere private.</p>
    </>
  );
}
