import Link from "next/link";
import { SessionForm } from "@/components/SessionForm";
import { listChildren } from "@/lib/data/children";

export const dynamic = "force-dynamic";

export default async function NewSession({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const { child } = await searchParams;
  const children = await listChildren();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Log Session</h1>
      {children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="mb-1 text-lg font-semibold">No children yet</p>
          <p className="mb-4 text-sm text-slate-500">Add a child before logging a session.</p>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">Back to dashboard</Link>
        </div>
      ) : (
        <SessionForm
          children={children.map((c) => ({ id: c.id, name: c.name }))}
          initial={{ childId: children.some((c) => c.id === child) ? child : undefined }}
        />
      )}
    </div>
  );
}
