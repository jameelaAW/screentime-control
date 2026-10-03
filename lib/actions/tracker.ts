'use server';
import { database } from '@/lib/data/tracker';
import { revalidatePath } from 'next/cache';
export async function logSession(form:FormData):Promise<{error?:string;success?:string}> {
 try {
 const duration=Number(form.get('duration_minutes')),start=new Date(String(form.get('started_at'))),child_id=String(form.get('child_id')||''),device_type=String(form.get('device_type')),activity_type=String(form.get('activity_type')),notes=String(form.get('notes')||'').trim();
 if(!Number.isInteger(duration)||duration<1||duration>1440)return {error:'Enter 1–1,440 minutes.'};
 if(isNaN(start.getTime()))return {error:'Choose a valid start time.'};
 if(!['tv','tablet','phone','computer','game-console'].includes(device_type)||!['video','game','educational','social','browsing'].includes(activity_type))return {error:'Choose a device and activity.'};
 if(notes.length>2000)return {error:'Keep notes under 2,000 characters.'};
 const db=database();const child=await db.from('children').select('id').eq('id',child_id).single();
 if(child.error)return {error:'Choose an existing child.'};
 const result=await db.from('screen_sessions').insert({child_id,started_at:start.toISOString(),ended_at:new Date(start.getTime()+duration*60000).toISOString(),duration_minutes:duration,device_type,activity_type,notes});
 if(result.error)return {error:"Couldn't save — try again."};
 revalidatePath('/','layout');return {success:'Session saved. Today’s totals are updated.'};
 }catch{return {error:"Couldn't save — try again."};}
}
