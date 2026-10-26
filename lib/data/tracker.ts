import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { MAX_RUN_MINUTES } from '@/lib/session-time';
import { getTz } from '@/lib/time';
export type Child = { id:string; name:string; age:number|null; daily_limit_minutes:number; notes:string|null };
export type Session = { id:string; child_id:string; started_at:string; ended_at:string|null; duration_minutes:number; device_type:string; activity_type:string; notes:string|null };
/** Supabase client bound to the signed-in caregiver's session, so row-level security applies to every query. */
export async function database() { return createClient(); }
export async function readTracker() {
 const db=await database();
 await db.rpc('auto_stop_screen_time',{max_minutes:MAX_RUN_MINUTES,tz:await getTz()}); // stop timers at the daily limit / max run time; the dashboard also caps them, so a failure here is safe to ignore
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
 const result=await (await database()).from('children').select('id').eq('id',id).single();
 return !result.error;
}
export async function insertLoggedSession(payload:Record<string,unknown>) { return (await database()).from('screen_sessions').insert(payload); }
export async function mutateTracker(input:{entity:string;operation:string;record_id:string|null;payload:Record<string,unknown>;reason:string}) { return (await database()).rpc('mutate_screen_time',input); }

export async function timerMutation(operation:string,id:string,device:string,activity:string){const db=await database();return operation==='start'?db.rpc('start_screen_time',{child:id,device,activity,tz:await getTz()}):db.rpc('stop_screen_time',{session:id});}
