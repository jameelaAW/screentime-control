import { createClient } from "@/lib/supabase/server";
import type { AuditLog } from "@/lib/types";

export async function appendAudit(entry: {
  action: "create" | "update" | "delete";
  entity_type: "child" | "screen_session";
  entity_id: string;
  details: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert(entry);
  if (error) throw new Error(error.message);
}

export async function listAudit(limit = 100): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as AuditLog[];
}
