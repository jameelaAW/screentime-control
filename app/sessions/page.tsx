import Tracker from '@/components/tracker';
import { readTracker } from '@/lib/data/tracker';
export const dynamic='force-dynamic';
export default async function Page(){return <Tracker {...await readTracker()} view="sessions"/>;}
