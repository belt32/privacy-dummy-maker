// Deploy as a Cloudflare Worker on the Workers Free plan.
// Add D1 binding DB and apply cloudflare/schema.sql first.
const ALLOWED_ORIGIN = 'https://belt32.github.io';
export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const headers = {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'vary': 'Origin'};
    if (origin === ALLOWED_ORIGIN) headers['access-control-allow-origin'] = origin;
    const reply = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
    if (new URL(request.url).pathname !== '/api/visitors') return reply({error: 'not found'}, 404);
    if (origin && origin !== ALLOWED_ORIGIN) return reply({error: 'origin not allowed'}, 403);
    if (request.method === 'OPTIONS') {
      if (origin !== ALLOWED_ORIGIN) return reply({error: 'origin required'}, 403);
      return new Response(null, {status: 204, headers: {...headers, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type'}});
    }
    if (!['GET', 'POST'].includes(request.method)) return reply({error: 'method not allowed'}, 405);
    if (!env.DB) return reply({error: 'not configured'}, 503);
    try {
      let row;
      if (request.method === 'POST') {
        if (origin !== ALLOWED_ORIGIN) return reply({error: 'origin required'}, 403);
        if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({error: 'JSON required'}, 415);
        // Hard bound even when Content-Length is absent or inaccurate.
        const reader = request.body?.getReader();
        if (!reader) return reply({error: 'body required'}, 400);
        const chunks = []; let length = 0;
        while (true) {
          const {value, done} = await reader.read(); if (done) break;
          length += value.byteLength;
          if (length > 128) { await reader.cancel(); return reply({error: 'body too large'}, 413); }
          chunks.push(value);
        }
        const bytes = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
        let body;
        try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply({error: 'invalid JSON'}, 400); }
        if (!body || typeof body.token !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.token)) return reply({error: 'invalid token'}, 400);
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.token.toLowerCase()))), b => b.toString(16).padStart(2, '0')).join('');
        const results = await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO counter_browsers (token_hash) VALUES (?)').bind(hash),
          env.DB.prepare('SELECT total FROM counter_totals WHERE id = 1')
        ]);
        row = results[1]?.results?.[0];
      } else {
        row = await env.DB.prepare('SELECT total FROM counter_totals WHERE id = 1').first();
      }
      if (!Number.isSafeInteger(row?.total) || row.total < 0) throw Error('invalid count');
      return reply({total: row.total});
    } catch { return reply({error: 'temporarily unavailable'}, 503); }
  }
};
