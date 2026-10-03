import { createClient } from "@/lib/supabase/server";
import type { ScreenSession, SessionWithChild } from "@/lib/types";

export type SessionInput = {
  child_id: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  device_type: string;
  activity_type: string;
  notes: string | null;
};

export async function listSessions(opts: {
  childId?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<SessionWithChild[]> {
  const supabase = await createClient();
  let q = supabase.from("screen_sessions").select("*, children(name)").order("started_at", { ascending: false });
  if (opts.childId) q = q.eq("child_id", opts.childId);
  if (opts.from) q = q.gte("started_at", opts.from);
  if (opts.to) q = q.lt("started_at", opts.to);
  q = q.limit(opts.limit ?? 200);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as unknown as SessionWithChild[];
}

export async function getSession(id: string): Promise<SessionWithChild | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screen_sessions")
    .select("*, children(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as SessionWithChild | null;
}

/** child_id -> total minutes for sessions that started in [from, to). */
export async function totalsByChild(from: string, to: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("screen_sessions")
    .select("child_id, duration_minutes")
    .gte("started_at", from)
    .lt("started_at", to);
  if (error) throw new Error(error.message);
  const totals: Record<string, number> = {};
  for (const row of data ?? []) totals[row.child_id] = (totals[row.child_id] ?? 0) + row.duration_minutes;
  return totals;
}

export async function insertSession(input: SessionInput): Promise<ScreenSession> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("screen_sessions").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as ScreenSession;
}

export async function updateSessionRow(id: string, input: SessionInput): Promise<ScreenSession> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("screen_sessions").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as ScreenSession;
}

export async function deleteSessionRow(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("screen_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
