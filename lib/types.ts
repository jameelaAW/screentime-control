export type Child = {
  id: string;
  user_id: string | null;
  name: string;
  age: number | null;
  daily_limit_minutes: number;
  notes: string | null;
  created_at: string;
};

export type ScreenSession = {
  id: string;
  user_id: string | null;
  child_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  device_type: string | null;
  activity_type: string | null;
  notes: string | null;
  created_at: string;
};

export type SessionWithChild = ScreenSession & { children: { name: string } | null };

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };
