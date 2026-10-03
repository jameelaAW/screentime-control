'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="loading"><h1>We couldn’t load your records.</h1><p>Check your connection and try again.</p><button className="button" onClick={reset}>Try again</button></main>;}
