'use server';
import {timerMutation} from '@/lib/data/tracker';
import {revalidatePath} from 'next/cache';
export async function changeTimer(form:FormData):Promise<{error?:string;success?:string}>{
 const operation=String(form.get('operation')),id=String(form.get('id'));
 if(!/^[0-9a-f-]{36}$/i.test(id)||!['start','stop'].includes(operation))return {error:'Choose a valid child or session.'};
 const device=String(form.get('device')||''),activity=String(form.get('activity')||'');
 if(operation==='start'&&(!['tv','tablet','phone','computer','game-console'].includes(device)||!['video','game','educational','social','browsing'].includes(activity)))return {error:'Choose a device and activity.'};
 try{
 const result=await timerMutation(operation,id,device,activity);
 if(result.error)return {error:result.error.code==='23505'?'This child is already logged in. Refresh to see their running session.':result.error.message.includes('already ended')?result.error.message:'Could not change screen time. Please try again.'};
 revalidatePath('/','layout');return {success:operation==='start'?'Logged in. Screen-time tracking started.':'Logged out. This session was added to today’s total.'};
 }catch{return {error:'Could not change screen time. Please try again.'};}
}
