import { redirect } from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{child?:string}>}){const {child}=await searchParams;redirect('/sessions'+(child?'?child='+encodeURIComponent(child):''));}
