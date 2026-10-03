export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="mb-6 h-8 w-56 rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
