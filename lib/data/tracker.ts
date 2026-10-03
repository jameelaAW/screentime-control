import 'server-only';
import { createClient } from '@supabase/supabase-js';
export type Child = { id:string; name:string; age:number|null; daily_limit_minutes:number; notes:string|null };
export type Session = { id:string; child_id:string; started_at:string; ended_at:string|null; duration_minutes:number; device_type:string; activity_type:string; notes:string|null };
export function database() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {auth:{persistSession:false,autoRefreshToken:false}}); }
export async function readTracker() {
 const db=database();
 const c=await db.from('children').select('*').order('name');
 if(c.error) throw Error('Could not load child profiles.');
 const sessions:Session[]=[];
 for(let offset=0;;offset+=500){
  const page=await db.from('screen_sessions').select('*').order('started_at',{ascending:false}).order('id').range(offset,offset+499);
  if(page.error) throw Error('Could not load screen-time records.');
  sessions.push(...page.data as Session[]);
  if(page.data.length<500)break;
 }
 return {children:c.data as Child[],sessions};
}
export async function childExists(id:string) {
 const result=await database().from('children').select('id').eq('id',id).single();
 return !result.error;
}
export async function insertLoggedSession(payload:Record<string,unknown>) { return database().from('screen_sessions').insert(payload); }
export async function mutateTracker(input:{entity:string;operation:string;record_id:string|null;payload:Record<string,unknown>;reason:string}) { return database().rpc('mutate_screen_time',input); }
