(async () => {
  const endpoint = window.PRIVACY_COUNTER_ENDPOINT;
  if (!endpoint) return; // No identifier collection before setup is complete.
  const display = document.getElementById('visitorCount');
  const note = document.getElementById('visitorNote');
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.workers.dev') || url.pathname !== '/api/visitors') throw Error('invalid endpoint');
    let token;
    try {
      const key = 'privacy-dummy-maker-browser-id';
      token = localStorage.getItem(key);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token || '')) {
        token = crypto.randomUUID(); localStorage.setItem(key, token);
      }
    } catch { token = null; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch(url.href, {
        method: token ? 'POST' : 'GET', mode: 'cors', credentials: 'omit',
        headers: token ? {'content-type': 'application/json'} : {},
        body: token ? JSON.stringify({token}) : undefined,
        cache: 'no-store', signal: controller.signal
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) throw Error('counter unavailable');
    const data = await response.json();
    if (!Number.isSafeInteger(data.total) || data.total < 0) throw Error('invalid count');
    if (display) display.textContent = data.total.toLocaleString('ja-JP') + ' ブラウザ';
    if (note) note.textContent = '集計開始後のブラウザID数。同じブラウザは原則1回。別端末や保存データの削除で重複するため、人数そのものではありません。';
  } catch {
    if (display) display.textContent = '集計できません';
    if (note) note.textContent = '集計先に接続できません。生成・コピー機能は引き続き使えます。';
  }
})();
