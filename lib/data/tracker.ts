import 'server-only';
import { createClient } from '@supabase/supabase-js';
export type Child = { id:string; name:string; age:number|null; daily_limit_minutes:number; notes:string|null };
export type Session = { id:string; child_id:string; started_at:string; ended_at:string|null; duration_minutes:number; device_type:string; activity_type:string; notes:string|null };
export function database() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {auth:{persistSession:false,autoRefreshToken:false}}); }
export async function readTracker() {
 const db=database();
 const [c,s]=await Promise.all([db.from('children').select('*').order('name'),db.from('screen_sessions').select('*').order('started_at',{ascending:false})]);
 if(c.error||s.error) throw Error('Could not load screen-time records.');
 return {children:c.data as Child[],sessions:s.data as Session[]};
}
