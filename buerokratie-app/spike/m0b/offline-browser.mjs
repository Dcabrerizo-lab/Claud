// Offline proof for the photo path in a real browser (Chromium):
// - every file comes from a local origin, every other request is blocked and counted
// - the page runs under the app's Content-Security-Policy (variants below)
// - CPU throttling via CDP does NOT slow down the OCR web worker, so phone speed cannot be measured here
// Usage: node spike/m0b/offline-browser.mjs   (WORKER_CSP=1: send the CSP with the worker script as well)
// Exit code 1 if a variant that must work fails or any request leaves the local origin.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const nm = join(root, 'node_modules');
const FILES = {
  '/t/': join(nm, 'tesseract.js/dist/'),
  '/core/': join(nm, 'tesseract.js-core/'),
  '/lang/': join(nm, '@tesseract.js-data/deu/4.0.0_best_int/'),
  '/photo/': join(root, 'spike/m0b/photos/'),
};
const TYPES = { '.js': 'text/javascript', '.wasm': 'application/wasm', '.gz': 'application/gzip', '.jpg': 'image/jpeg' };
const CSP = {
  "connect-src 'none' (CLAUDE.md)": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'none'; img-src 'self' blob: data:",
  "connect-src 'self'": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self'; img-src 'self' blob: data:",
};
const PAGE = `<!doctype html><meta charset=utf-8><script type=module src=/app.js></script>`;
// external file: the CSP forbids inline scripts (as the app will)
const APP = `
import Tesseract from '/t/tesseract.esm.min.js';
window.run = async (photo) => {
  const t0 = performance.now();
  const w = await Tesseract.createWorker('deu', 1, { workerPath: '/t/worker.min.js', corePath: '/core/', langPath: '/lang', workerBlobURL: false, gzip: true, cacheMethod: 'none' });
  const t1 = performance.now();
  await w.setParameters({ tessedit_pageseg_mode: '11' });
  // pass pixels, not a URL: loading the photo via <img> falls under img-src, not connect-src
  const img = new Image(); img.src = '/photo/' + photo; await img.decode();
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  const r = await w.recognize(c, {}, { blocks: true });
  const t2 = performance.now();
  await w.terminate();
  const text = r.data.blocks.flatMap(b => b.paragraphs.flatMap(p => p.lines.flatMap(l => l.words))).map(x => x.text).join(' ');
  return { init: Math.round(t1 - t0), ocr: Math.round(t2 - t1), text };
};
window.ready = true;
`;

const WORKER_CSP = process.env.WORKER_CSP === '1'; // also send the CSP with the worker script
const WANT = ['Familienname', 'Vorname', 'Geburtsdatum', 'Straße', 'Postleitzahl', 'Wohnort', 'Miete'];
const browser = await chromium.launch();
const results = [];
for (const [name, csp] of Object.entries(CSP)) {
  for (const throttle of [1]) {
    const ctx = await browser.newContext();
    const blocked = [], cspErrors = [];
    await ctx.route('**/*', (r) => {
      const u = new URL(r.request().url());
      if (u.origin !== 'http://local') { blocked.push(u.href); return r.abort('internetdisconnected'); }
      if (u.pathname === '/') return r.fulfill({ contentType: 'text/html', headers: { 'Content-Security-Policy': csp }, body: PAGE });
      if (u.pathname === '/app.js') return r.fulfill({ contentType: 'text/javascript', body: APP });
      const pre = Object.keys(FILES).find((p) => u.pathname.startsWith(p));
      if (!pre) return r.fulfill({ status: 404, body: '' });
      const f = join(FILES[pre], decodeURIComponent(u.pathname.slice(pre.length)));
      const headers = WORKER_CSP && u.pathname.endsWith('worker.min.js') ? { 'Content-Security-Policy': csp } : {};
      try { return r.fulfill({ contentType: TYPES[extname(f)] ?? 'application/octet-stream', headers, body: readFileSync(f) }); }
      catch { return r.fulfill({ status: 404, body: '' }); }
    });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (/Content Security Policy|Refused/i.test(m.text())) cspErrors.push(m.text().slice(0, 140)); });
    if (throttle > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
    await page.goto('http://local/');
    await page.waitForFunction(() => window.ready);
    let res;
    try {
      res = await Promise.race([page.evaluate((p) => window.run(p), 'test-a-wohnen-schwer.jpg'), new Promise((_, rej) => setTimeout(() => rej(new Error('Zeitüberschreitung 120 s')), 120000))]);
      const hits = WANT.filter((w) => res.text.includes(w)).length;
      results.push(`${name} | CPU ×${throttle}: OK, Start ${res.init} ms, Erkennung ${res.ocr} ms, Beschriftungen ${hits}/${WANT.length}, blockierte Netzaufrufe ${blocked.length}`);
    } catch (e) {
      results.push(`${name} | CPU ×${throttle}: FEHLER ${String(e.message ?? e).slice(0, 120)} | CSP: ${cspErrors[0] ?? '-'} | blockiert ${blocked.length}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(results.join('\n'));
// Must hold: zero blocked (external) requests everywhere, and connect-src 'self' must work
const bad = results.filter((r) => !/blockiert(e Netzaufrufe)? 0\b/.test(r) || (r.startsWith("connect-src 'self'") && !r.includes(': OK')));
if (bad.length) { console.error('NICHT BESTANDEN:\n' + bad.join('\n')); process.exit(1); }
