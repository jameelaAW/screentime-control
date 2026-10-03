'use server';
import { revalidatePath } from 'next/cache';
import { insertSession } from '@/lib/data/sessions';
import { validateSession, type SessionFormInput } from '@/lib/validation/session';
export async function createSession(input:SessionFormInput):Promise<{ok:true}|{ok:false;error:string}>{try{const v=await validateSession(input);if(!v.ok)return v;await insertSession(v.row);revalidatePath('/','layout');return {ok:true};}catch{return {ok:false,error:"Couldn't save — try again"};}}
