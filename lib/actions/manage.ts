'use server';
import {database} from '@/lib/data/tracker';
import {revalidatePath} from 'next/cache';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function manageRecord(form:FormData):Promise<{error?:string;success?:string}>{
 try{
 const entity=String(form.get('entity')),operation=String(form.get('operation')),id=String(form.get('id')||''),reason=String(form.get('reason')||'').trim();
 if(!['child','screen_session'].includes(entity)||!['create','update','delete'].includes(operation))return {error:'Invalid action.'};
 if(operation!=='create'&&!uuid.test(id))return {error:'Choose an existing record.'};
 if(operation!=='create'&&(reason.length<3||reason.length>500))return {error:'Enter a reason (3–500 characters).'};
 let payload:Record<string,unknown>={};
 if(operation!=='delete'){
 const notes=String(form.get('notes')||'').trim();if(notes.length>2000)return {error:'Keep notes under 2,000 characters.'};
 if(entity==='child'){
 const name=String(form.get('name')||'').trim(),ageText=String(form.get('age')||''),age=ageText===''?null:Number(ageText),limit=Number(form.get('daily_limit_minutes'));
 if(name.length<1||name.length>80)return {error:'Enter a name (1–80 characters).'};
 if(age!==null&&(!Number.isInteger(age)||age<0||age>18))return {error:'Age must be 0–18.'};
 if(!Number.isInteger(limit)||limit<1||limit>1440)return {error:'Daily limit must be 1–1,440 minutes.'};
 payload={name,age,daily_limit_minutes:limit,notes};
 }else{
 const duration=Number(form.get('duration_minutes')),start=new Date(String(form.get('started_at'))),child_id=String(form.get('child_id')),device_type=String(form.get('device_type')),activity_type=String(form.get('activity_type'));
 if(!Number.isInteger(duration)||duration<1||duration>1440||isNaN(start.getTime()))return {error:'Choose a valid start and duration (1–1,440 minutes).'};
 if(!uuid.test(child_id)||!['tv','tablet','phone','computer','game-console'].includes(device_type)||!['video','game','educational','social','browsing'].includes(activity_type))return {error:'Choose a child, device, and activity.'};
 payload={child_id,started_at:start.toISOString(),ended_at:new Date(start.getTime()+duration*60000).toISOString(),duration_minutes:duration,device_type,activity_type,notes};
 }
 }
 const {error}=await database().rpc('mutate_screen_time',{entity,operation,record_id:id||null,payload,reason});
 if(error)return {error:error.message.includes('Too many')?'Too many changes. Wait a minute and try again.':"Couldn't save — try again."};
 revalidatePath('/','layout');return {success:operation==='delete'?'Record removed. Totals updated.':'Changes saved.'};
 }catch{return {error:"Couldn't save — try again."};}
}
