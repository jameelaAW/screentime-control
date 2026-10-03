"use server";

import { revalidatePath } from "next/cache";
import { appendAudit } from "@/lib/data/audit";
import { insertSession } from "@/lib/data/sessions";
import { validateSession, type SessionFormInput } from "@/lib/validation/session";

type Result = { ok: true } | { ok: false; error: string };

const SAVE_ERROR = "Couldn't save — try again";

export async function createSession(input: SessionFormInput): Promise<Result> {
  try {
    const v = await validateSession(input);
    if (!v.ok) return v;
    const created = await insertSession(v.row);
    try {
      await appendAudit({
        action: "create",
        entity_type: "screen_session",
        entity_id: created.id,
        details: { child: v.childName, ...v.row },
      });
    } catch (e) {
      console.error("audit append failed (session create)", e);
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error("createSession failed", e);
    return { ok: false, error: SAVE_ERROR };
  }
}
