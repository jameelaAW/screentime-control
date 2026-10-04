'use client';
import Link from 'next/link';
import type {Child} from '@/lib/data/tracker';
export default function LimitNotifications({children,totals,running}:{children:Child[];totals:Map<string,number>;running:Set<string>}){
 const reached=children.filter(child=>(totals.get(child.id)??0)>=child.daily_limit_minutes);
 if(!reached.length)return null;
 return <section className="limit-notifications" aria-label="Daily limit notifications">{reached.map(child=><div className="limit-notification" role="alert" key={child.id}><div><strong>Daily limit reached: {child.name}</strong><p>{child.name} has used their {child.daily_limit_minutes}-minute screen-time allowance for today. {running.has(child.id)?'Please log out / stop their current session.':'Today’s allowance has been used.'}</p></div><Link href={`/#child-${child.id}`}>{running.has(child.id)?'Go to stop screen time':'View child'}</Link></div>)}</section>;
}
