import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";

export type ChildInput = {
  name: string;
  age: number | null;
  daily_limit_minutes: number;
  notes: string | null;
};

export async function listChildren(): Promise<Child[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("children").select("*").order("name");
  if (error) throw new Error(error.message);
  return data as Child[];
}

export async function getChild(id: string): Promise<Child | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("children").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Child | null;
}

export async function insertChild(input: ChildInput): Promise<Child> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("children").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Child;
}

export async function updateChildRow(id: string, input: ChildInput): Promise<Child> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("children").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Child;
}

export async function deleteChildRow(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
