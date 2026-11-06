/** Cloudflare Pages Function — D1 binding: DB; secret: COUNTER_PEPPER. */
const corsHeaders={'cache-control':'no-store','content-type':'application/json; charset=utf-8'};
export async function onRequest({request,env}) {
  if(!env.DB || !env.COUNTER_PEPPER) return new Response(JSON.stringify({error:'not configured'}),{status:503,headers:corsHeaders});
  if(request.method!=='GET' && request.method!=='POST') return new Response('Method Not Allowed',{status:405,headers:{allow:'GET, POST'}});
  try {
    if(request.method==='POST') {
      const origin=request.headers.get('Origin');
      if(origin && new URL(origin).origin!==new URL(request.url).origin) return new Response('Forbidden',{status:403});
      const body=await request.json();
      if(typeof body.token!=='string' || !/^[0-9a-f-]{36}$/.test(body.token)) return new Response('Bad Request',{status:400});
      const data=new TextEncoder().encode(env.COUNTER_PEPPER+':'+body.token);
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(n=>n.toString(16).padStart(2,'0')).join('');
      await env.DB.prepare('INSERT OR IGNORE INTO visitor_browsers (token_hash) VALUES (?)').bind(hash).run();
    }
    const row=await env.DB.prepare('SELECT COUNT(*) AS total FROM visitor_browsers').first();
    return new Response(JSON.stringify({total:row?.total??0}),{headers:corsHeaders});
  } catch {return new Response(JSON.stringify({error:'temporarily unavailable'}),{status:503,headers:corsHeaders});}
}
