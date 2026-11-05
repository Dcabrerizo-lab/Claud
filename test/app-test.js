const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const out = []; const ok = (n, c, x) => out.push((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : ' ' + (x || '')));
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' }); const p = await c.newPage();
  const reqs = [], errs = [], csp = [];
  p.on('request', (r) => reqs.push(r.url())); p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') (/Content Security/i.test(m.text()) ? csp : errs).push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '../app/www/index.html'));
  await p.waitForTimeout(500);
  ok('Nur lokale Anfragen (kein Netz)', reqs.every((u) => u.startsWith('file://') || u.startsWith('data:')), reqs.filter((u) => !u.startsWith('file://')).join(','));
  ok('Keine Skriptfehler', errs.length === 0, errs.join('|'));
  ok('Keine CSP-Verstöße', csp.length === 0, csp.join('|'));
  ok('Scanner nicht enthalten', (await p.locator('#scan').count()) === 0);
  ok('21 Karten', (await p.locator('#cards .card').count()) === 21);
  ok('Schrift lokal geladen', await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.status === 'loaded'); }));
  for (const l of ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro']) { await p.selectOption('#lang', l); ok('Sprache ' + l, (await p.locator('#cards .card').count()) === 21); }
  await p.selectOption('#lang', 'de'); await p.click('#p1'); await p.fill('#p-name', 'Maria Muster');
  await p.click('#mappeMake'); ok('Mappe öffnet', await p.isVisible('#mappe'));
  ok('Drucken ausgeblendet, Teilen sichtbar', !(await p.isVisible('#mappePrint')) && (await p.isVisible('#mappeShare')));
  let shared = null; await p.evaluate(() => { window.Capacitor = { Plugins: { Share: { share: (o) => { window.__shared = o; return Promise.resolve(); } } } }; });
  await p.click('#mappeShare'); shared = await p.evaluate(() => window.__shared);
  ok('Teilen übergibt die Mappe', shared && /Maria Muster/.test(shared.text));
  await p.screenshot({ path: path.join(__dirname, 'app-mappe.png') });
  await b.close(); console.log(out.join('\n')); process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
})();
