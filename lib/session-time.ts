export type TimedSession={started_at:string;ended_at:string|null;duration_minutes:number};
/** A running session never counts past this many minutes (matches auto_stop_screen_time in 0005). */
export const MAX_RUN_MINUTES=180;
/** Split sessions at local midnight; time between sessions never counts. */
export function minutesForDay(session:TimedSession,day:Date,now:number):number{
 const from=new Date(day);from.setHours(0,0,0,0);const to=new Date(from);to.setDate(to.getDate()+1);
 const start=new Date(session.started_at).getTime(),end=session.ended_at?new Date(session.ended_at).getTime():Math.min(now,start+MAX_RUN_MINUTES*60000);
 if(!Number.isFinite(start)||!Number.isFinite(end))return 0;
 return Math.max(0,Math.min(end,to.getTime())-Math.max(start,from.getTime()))/60000;
}
/** Remind the caregiver this often while a timer keeps running. */
export const REMIND_EVERY_MINUTES=30;
/** Heads-up this many minutes before a child reaches their daily limit. */
export const WARN_BEFORE_LIMIT_MINUTES=5;
/** Today's total: finished sessions plus the running one, which cannot count past the daily limit (the server stops it there). */
export function capRunning(finishedMinutes:number,runningMinutes:number,limit:number):number{return finishedMinutes+Math.min(runningMinutes,Math.max(0,limit-finishedMinutes));}
/** True once a running session has gone `every` minutes since it started or was last confirmed as still on screen. */
export function reminderDue(startedMs:number,confirmedMs:number|null,nowMs:number,every:number=REMIND_EVERY_MINUTES):boolean{return nowMs-Math.max(startedMs,confirmedMs??0)>=every*60000;}
export const displayMinutes=(minutes:number)=>Math.round(minutes*10)/10;

