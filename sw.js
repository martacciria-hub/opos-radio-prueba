const CACHE = 'opos-radio-v4';
const CORE = ['./', './index.html', './manifest.json', './icon.svg', './reto-test.html', './retos.html', './perfil.html'];

const TOOLBAR = `
<style id="or-toolbar-style">
#orToolbar{position:fixed;left:10px;right:10px;bottom:10px;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:7px;background:rgba(255,255,255,.96);border:1px solid #d9e2ea;border-radius:18px;box-shadow:0 8px 28px rgba(24,48,68,.18);backdrop-filter:blur(8px)}
#orToolbar a{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:48px;border-radius:12px;text-decoration:none;color:#183044;font:bold .72rem Arial,sans-serif;gap:2px}#orToolbar a b{font-size:1.15rem;line-height:1}#orToolbar a.active{background:#256b9e;color:#fff}
body{padding-bottom:82px!important}@media(min-width:800px){#orToolbar{max-width:720px;left:50%;right:auto;width:720px;transform:translateX(-50%)}}
</style>
<nav id="orToolbar" aria-label="Herramientas de navegación">
<a href="index.html"><b>🏠</b>Inicio</a>
<a href="index.html#estudio"><b>📚</b>Estudio</a>
<a href="retos.html"><b>🏆</b>Retos</a>
<a href="perfil.html"><b>👤</b>Perfil</a>
</nav>`;

function enhance(html, url){
  let out = html;
  if(url.pathname.endsWith('/modulo1.html') || url.pathname.endsWith('/modulo1.html/')){
    out = out.replace(/<script src=["']modules23\.js["']><\/script>/gi,'');
    out = out.replace(/<p><a href=["']modulo4\.html["'][\s\S]*?<\/p>/gi,'');
  }
  if(url.pathname.endsWith('/retos.html') || url.pathname.endsWith('/retos.html/')){
    out = out.replace(/onclick=["']startChallenge\('daily'\)["']/g,'onclick="location.href=\'reto-test.html?mode=daily\'"');
    out = out.replace(/onclick=["']startChallenge\('speed'\)["']/g,'onclick="location.href=\'reto-test.html?mode=speed\'"');
    out = out.replace(/onclick=["']startChallenge\('perfect'\)["']/g,'onclick="location.href=\'reto-test.html?mode=perfect\'"');
    out = out.replace(/onclick=["']startChallenge\('module4'\)["']/g,'onclick="location.href=\'reto-test.html?mode=module4\'"');
  }
  if(out.includes('</body>') && !out.includes('id="orToolbar"')){
    out = out.replace('</body>', TOOLBAR + `<script>(function(){var p=location.pathname;document.querySelectorAll('#orToolbar a').forEach(function(a){var h=a.getAttribute('href').split('#')[0];if(h==='perfil.html'&&p.endsWith('/perfil.html'))a.classList.add('active');else if(h==='retos.html'&&p.endsWith('/retos.html'))a.classList.add('active');else if(h==='index.html'&&(p.endsWith('/')||p.endsWith('/index.html')))a.classList.add('active')});})();</script></body>`);
  }
  return out;
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(async response => {
    const type = response.headers.get('content-type') || '';
    if(type.includes('text/html')){
      const html = enhance(await response.text(), new URL(event.request.url));
      const transformed = new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
      caches.open(CACHE).then(cache=>cache.put(event.request,transformed.clone()));
      return transformed;
    }
    caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
    return response;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
