"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-8 text-center">
      <p className="mb-2 text-lg font-semibold text-red-700">Something went wrong</p>
      <p className="mb-4 text-sm text-slate-500">We couldn&apos;t load this page. Check your connection and try again.</p>
      <button onClick={reset} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
        Try again
      </button>
    </div>
  );
}
