// Store-Bilder erzeugen: zuerst npm run build:app, dann node tools/store-bilder.js (Ergebnis in store-bilder/)
// Rohe Aufnahmen der Store-App (app/www, mit nachgeahmten Capacitor-Plugins), damit die Knöpfe der App zu sehen sind
// (Antragsmappe: Android Drucken, PDF speichern, PDF teilen; iPhone PDF teilen). Danach mit Überschrift in die Store-Formate gesetzt.
// Logo: tools/logo/brief-siegel.svg. Farbe der Bilder passend zum Logo (Tintenblau mit Gold).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', 'store-bilder') + '/'; fs.mkdirSync(D, { recursive: true });
const http = require('http');
const WWW = path.join(__dirname, '..', 'app', 'www');
// Nachgeahmte Plugins wie in test/app-test.js; die Plattform bestimmt, welche Knöpfe die App zeigt
const MOCK = (pl) => { const st = {}; const ok = () => Promise.resolve({});
  window.Capacitor = { getPlatform: () => pl, isNativePlatform: () => true, Plugins: {
    Preferences: { get: (o) => Promise.resolve({ value: o.key in st ? st[o.key] : null }), set: (o) => { st[o.key] = o.value; return Promise.resolve(); }, remove: (o) => { delete st[o.key]; return Promise.resolve(); } },
    Share: { share: ok }, Filesystem: { writeFile: () => Promise.resolve({ uri: 'file:///x' }), deleteFile: ok }, PdfAusgabe: { drucken: ok, speichern: ok } } }; };
const LOGO = fs.readFileSync(path.join(__dirname, 'logo', 'brief-siegel.svg'), 'utf8');
const VERLAUF = 'linear-gradient(160deg,#2d3d85,#161f4a)';
(async () => {
  if (!fs.existsSync(path.join(WWW, 'index.html'))) throw new Error('app/www fehlt: zuerst npm run build:app');
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split(/[?#]/)[0]); const f = path.join(WWW, u === '/' ? 'index.html' : u);
    if (!f.startsWith(WWW)) { r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const APP = 'http://localhost:' + srv.address().port + '/index.html';
  const b = await chromium.launch();
  const neu = async (pl) => { const c = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: 'de-DE' }); await c.addInitScript(MOCK, pl); return c.newPage(); };
  // iPhone: Antragsmappe mit „PDF teilen“ (Drucken und Sichern stecken im Teilen-Dialog)
  { const pi = await neu('ios'); await pi.goto(APP + '#leistungen'); await pi.click('#firstOk').catch(() => {}); await pi.click('#p1'); await pi.fill('#p-name', 'Maria Muster');
    await pi.fill('#p-strasse', 'Hauptstr. 1'); await pi.fill('#p-ort', '91054 Erlangen'); await pi.press('#p-ort', 'Tab'); await pi.waitForTimeout(300);
    await pi.click('#mappeMake'); await pi.evaluate(() => window.scrollTo(0, 0)); await pi.waitForTimeout(300); await pi.screenshot({ path: D + 'roh-6-mappe-ios.png' }); await pi.context().close(); }
  const p = await neu('android');
  const roh = async (name, fn) => { await fn(); await p.waitForTimeout(300); await p.screenshot({ path: D + 'roh-' + name + '.png' }); };
  const zu = async (sel, off = 0) => p.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]);
  const oben = () => p.evaluate(() => window.scrollTo(0, 0));

  await p.goto(APP);
  await roh('1-start', async () => { await p.click('#appnav [data-ansicht=start]'); await oben(); });
  // Leistungscheck mit Beispiel
  await p.click('#appnav [data-ansicht=leistungen]');
  await p.click('#firstOk').catch(() => {});
  await p.click('#p1');
  await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen'); await p.press('#p-ort', 'Tab');
  if (await p.isVisible('#plz')) await p.fill('#plz', '91054');
  await p.waitForTimeout(300);
  await roh('2-ergebnis', async () => { await zu('#ergebnis', 10); });
  await roh('3-brief', async () => { await p.click('#appnav [data-ansicht=briefe]'); await zu('#einfachBtn', 10); });
  await roh('4-bescheid', async () => {
    await p.click('#brief-jc'); if (await p.isVisible('#elSelbst')) await p.click('#elSelbst');
    await p.evaluate(() => document.querySelector('#p-bescheid [id$="-beispiel"]').click());
    await zu('#bs-erg', 10);
  });
  await p.click('#briefZurueck');
  await p.click('#appnav [data-ansicht=leistungen]');
  await roh('5-pflege', async () => {
    await p.click('#paStart'); await p.fill('#pa-jahre', '81'); await p.click('#pflegeAssist .es-weiter'); await p.click('#pflegeAssist .es-btn:has-text("Ja")'); await oben();
  });
  await p.click('#appnav [data-ansicht=leistungen]');
  await roh('6-mappe', async () => { await p.click('#mappeMake'); await oben(); });
  await p.click('#mappeClose');
  await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'ar');
  await roh('13-sprachen', async () => { await zu('#ergebnis', 10); });
  await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'de');
  await p.evaluate(() => document.getElementById('einfachBtn').click());
  await p.addStyleTag({ content: '.top{display:none!important}' }); // Kopfzeile nur für das Bild ausblenden
  await p.fill('#es-in', '1990'); await p.click('#es-weiter');
  await roh('7-einfach', async () => { await zu('.es-top', 16); });

  // In Store-Formate setzen
  const MOTIVE = [
    ['1-start', 'Hilfen finden, Briefe prüfen', 'Alles an einem Ort, ohne Anmeldung'],
    ['2-ergebnis', require('../test/karten.js').length + ' Leistungen geprüft', 'Mit grober Höhe und klarer Einschätzung'],
    ['3-brief', 'Brief vom Amt bekommen?', 'Scannen, als PDF oder Text einfügen'],
    ['4-bescheid', 'Bescheid nachgerechnet', 'Abweichungen mit Paragraf, Widerspruch als PDF'],
    ['5-pflege', 'Pflegegrad selbst einschätzen', 'Eine Frage pro Bildschirm, mit Erklärung'],
    ['6-mappe', 'Anträge fertig zum Abschicken', 'Formlose Anträge und Angabenblatt als PDF'],
    ['7-einfach', 'Auch in einfacher Sprache', 'Eine Frage pro Bildschirm, große Knöpfe'],
    ['13-sprachen', 'In 13 Sprachen', 'Amtsbegriffe bleiben deutsch, damit du sie wiedererkennst']];
  const FORMATE = [['play', 1080, 1920], ['ios-6.9', 1320, 2868], ['ios-6.5', 1242, 2688]];
  const p2 = await b.newPage();
  for (const [fmt, w, h] of FORMATE) {
    fs.rmSync(D + fmt, { recursive: true, force: true }); fs.mkdirSync(D + fmt, { recursive: true });
    for (const [n, titel, unter] of MOTIVE) {
      const roh = fmt.startsWith('ios') && fs.existsSync(D + 'roh-' + n + '-ios.png') ? 'roh-' + n + '-ios.png' : 'roh-' + n + '.png';
      const img = 'data:image/png;base64,' + fs.readFileSync(D + roh).toString('base64');
      await p2.setViewportSize({ width: w, height: h });
      await p2.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;background:${VERLAUF};font-family:system-ui,sans-serif;color:#fff;overflow:hidden;display:flex;flex-direction:column;align-items:center">
        <div style="padding:${h * 0.045}px ${w * 0.07}px ${h * 0.025}px;text-align:center"><div style="font-size:${w * 0.072}px;font-weight:800;line-height:1.15">${titel}</div>
        <div style="font-size:${w * 0.038}px;opacity:.92;margin-top:${h * 0.012}px;line-height:1.3">${unter}</div></div>
        <div style="flex:1;width:${w * 0.82}px;border-radius:${w * 0.05}px ${w * 0.05}px 0 0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#fff">
        <img src="${img}" style="width:100%;display:block"></div></body></html>`);
      await p2.waitForTimeout(100);
      await p2.screenshot({ path: D + fmt + '/' + n + '.png' });
    }
  }
  // Symbol (512 x 512 für Play, 1024 x 1024 Vorlage für Apple) und Werbegrafik für Google Play (1024 x 500)
  const logoImg = 'data:image/svg+xml;base64,' + Buffer.from(LOGO).toString('base64');
  for (const s of [512, 1024]) {
    await p2.setViewportSize({ width: s, height: s });
    await p2.setContent(`<html><body style="margin:0"><img src="${logoImg}" style="width:${s}px;height:${s}px;display:block"></body></html>`);
    await p2.waitForTimeout(100);
    await p2.screenshot({ path: D + (s === 512 ? 'play-symbol-512.png' : 'logo-1024.png') });
  }
  await p2.setViewportSize({ width: 1024, height: 500 });
  await p2.setContent(`<html><body style="margin:0;width:1024px;height:500px;background:linear-gradient(135deg,#2d3d85,#161f4a);font-family:system-ui,sans-serif;color:#fff;display:flex;align-items:center;gap:52px;padding:0 76px;box-sizing:border-box">
    <img src="${logoImg}" style="width:210px;height:210px;border-radius:46px;box-shadow:0 14px 40px rgba(0,0,0,.35)">
    <div><div style="font-size:66px;font-weight:800;letter-spacing:-1px;line-height:1">SoLo</div><div style="font-size:26px;font-weight:600;opacity:.85;margin-top:4px">Sozialleistungslotse</div>
    <div style="font-size:34px;font-weight:700;margin-top:16px;line-height:1.25">Hilfen finden.<br>Briefe prüfen.<br><span style="color:#f2b233">Anträge schreiben.</span></div>
    <div style="font-size:24px;margin-top:16px;opacity:.9">Offline · ohne Anmeldung · in 13 Sprachen</div></div></body></html>`);
  await p2.waitForTimeout(100);
  await p2.screenshot({ path: D + 'play-werbegrafik-1024x500.png' });
  await b.close(); srv.close();
  console.log('fertig');
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });

