import Link from "next/link";
import { Legend, UsageBar } from "@/components/UsageBar";
import { listChildren } from "@/lib/data/children";
import { totalsByChild } from "@/lib/data/sessions";
import { dayRange, formatDay, getTz, localDateStr } from "@/lib/time";
import { usageRatio } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const tz = await getTz();
  const today = localDateStr(new Date(), tz);
  const { from, to } = dayRange(today, tz);
  const [children, totals] = await Promise.all([listChildren(), totalsByChild(from, to)]);

  const rows = children
    .map((c) => ({ child: c, total: totals[c.id] ?? 0 }))
    .sort(
      (a, b) =>
        usageRatio(b.total, b.child.daily_limit_minutes) - usageRatio(a.total, a.child.daily_limit_minutes) ||
        a.child.name.localeCompare(b.child.name),
    );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Dashboard</h1>
          <p className="text-sm text-slate-500">{formatDay(today)}</p>
        </div>
        <Link href="/sessions/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Log Session
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="mb-1 text-lg font-semibold">No children yet</p>
          <p className="text-sm text-slate-500">Add a child to start tracking screen time.</p>
        </div>
      ) : (
        <>
          <div className="mb-4"><Legend /></div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {rows.map(({ child, total }) => (
              <li key={child.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-xs text-slate-500">{child.age != null ? `Age ${child.age}` : "Age not set"}</p>
                  </div>
                  <Link href={`/sessions/new?child=${child.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                    + Log
                  </Link>
                </div>
                <UsageBar total={total} limit={child.daily_limit_minutes} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
