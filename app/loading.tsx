export default function Loading(){return <main className="loading" aria-busy="true"><h1>Loading your day…</h1>{[1,2,3,4].map(n=><div className="skeleton" key={n}/>)}</main>;}
