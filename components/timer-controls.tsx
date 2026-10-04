'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {changeTimer} from '@/lib/actions/timer';
import type {Session} from '@/lib/data/tracker';
export default function TimerControls({childId,active}:{childId:string;active?:Session}){
 const router=useRouter(),[pending,begin]=useTransition(),[error,setError]=useState('');
 const save=(form:FormData)=>{setError('');begin(async()=>{const result=await changeTimer(form);if(result.error)setError(result.error);router.refresh();});};
 return <div className="timer-controls">{error&&<p className="error" role="alert">{error}</p>}{active?<><p className="live-status" role="status">● Logged in since {new Date(active.started_at).toLocaleString()} · {active.device_type}</p><form action={save}><input type="hidden" name="operation" value="stop"/><input type="hidden" name="id" value={active.id}/><button className="button" disabled={pending}>{pending?'Saving…':'Log out / stop'}</button></form></>:<form action={save}><input type="hidden" name="operation" value="start"/><input type="hidden" name="id" value={childId}/><div className="form-grid"><label>Device<select name="device" defaultValue="tablet">{['tablet','tv','phone','computer','game-console'].map(v=><option key={v}>{v}</option>)}</select></label><label>Activity<select name="activity" defaultValue="educational">{['educational','video','game','social','browsing'].map(v=><option key={v}>{v}</option>)}</select></label></div><button className="button" disabled={pending}>{pending?'Saving…':'Log in / start'}</button></form>}</div>;
}
