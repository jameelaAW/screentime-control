import { STATUS_TEXT, usageStatus } from "@/lib/usage";

const COLORS = {
  green: { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800" },
  amber: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-800" },
  red: { bar: "bg-red-500", badge: "bg-red-100 text-red-800" },
};

export function UsageBar({ total, limit }: { total: number; limit: number }) {
  const status = usageStatus(total, limit);
  const pct = limit > 0 ? Math.min(100, (total / limit) * 100) : total > 0 ? 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900" data-testid="usage-text">
          {total}/{limit} min
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status].badge}`} data-status={status}>
          {STATUS_TEXT[status]}
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={limit}
      >
        <div className={`h-full rounded-full transition-all ${COLORS[status].bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Under 75% of limit</span>
      <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> 75–100%</span>
      <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Over limit</span>
    </div>
  );
}
