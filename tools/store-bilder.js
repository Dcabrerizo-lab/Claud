// Store-Bilder erzeugen: zuerst npm run build:app, dann node tools/store-bilder.js (Ergebnis in store-bilder/, nicht im Repo)
// Rohe Aufnahmen der Store-App (app/www, mit nachgeahmten Capacitor-Plugins, Android), Musterdaten („Maria Muster“, Musterbescheid, Muster-Fristen).
// Danach mit Überschrift in die Store-Formate gesetzt: play (1080 x 1920, 8 Bilder), ios-6.9 (1320 x 2868) und ios-6.5 (1242 x 2688, je 9 Bilder).
// Die Aufnahme steht ganz im Rahmen (samt Leiste unten), nichts wird abgeschnitten. DEBUG=1 legt bei einem Fehler store-bilder/fehler.png ab.
// Logo: tools/logo/sprechblase.svg. Farbe der Bilder passend zum Design „Warm und menschlich“ (Petrol, Creme, Koralle).
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
const LOGO = fs.readFileSync(path.join(__dirname, 'logo', 'sprechblase.svg'), 'utf8');
const VERLAUF = 'linear-gradient(160deg,#13806e,#0a4f44)';
(async () => {
  if (!fs.existsSync(path.join(WWW, 'index.html'))) throw new Error('app/www fehlt: zuerst npm run build:app');
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split(/[?#]/)[0]); const f = path.join(WWW, u === '/' ? 'index.html' : u);
    if (!f.startsWith(WWW)) { r.writeHead(403); r.end(); return; }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const APP = 'http://localhost:' + srv.address().port + '/index.html';
  const b = await chromium.launch();
  const neu = async (pl) => { const c = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: 'de-DE' }); await c.addInitScript(MOCK, pl); return c.newPage(); };
  // Seit 1.9: Name und Anschrift erst in der Antragsmappe (#helper), beim Leistungs-Check zuerst die Wahl „Schritt für Schritt / Alles auf einer Seite“
  // (#sfWegSchritt, #sfWegAlles; gemerkt in lotse.checkWeg). Fristen kommen nur per Knopf „Frist merken“ aus „Brief prüfen“ in „Mein Ordner“.
  const p = await neu('android'); p.setDefaultTimeout(8000);
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message));
  const roh = async (name, fn) => { await fn(); await p.waitForTimeout(400); await p.screenshot({ path: D + 'roh-' + name + '.png' }); };
  const zu = async (sel, off = 0) => p.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]);
  const oben = () => p.evaluate(() => window.scrollTo(0, 0));
  const start = async () => { await p.click('#appnav [data-ansicht=start]'); await oben(); };
  const sprache = (x) => p.evaluate((l) => { const s = document.getElementById('lang'); s.value = l; s.dispatchEvent(new Event('change', { bubbles: true })); }, x);
  const datum = (n) => new Date(Date.now() + n * 864e5); // Fristen relativ zu heute, damit sie offen sind
  const tt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  globalThis.__p = p;
  await p.goto(APP); await p.click('#firstOk').catch(() => {});
  await roh('1-start', async () => { await start(); await zu('#goLeistungen', 120); }); // Begrüßung, großer Knopf und die Kacheln mit Text
  // Leistungs-Check: erst die Wahl des Wegs (neu in 1.9), für die übrigen Bilder „Alles auf einer Seite“
  await p.click('#goLeistungen'); await roh('9-weg', oben); await p.click('#sfWahlAlles');
  // Brief prüfen: Musterbescheid nachrechnen (Beispiel), dann zwei Fristen merken (Unterlagen nachreichen, Widerspruch gegen Bescheid)
  await start(); await p.click('#goBriefe');
  await roh('4-bescheid', async () => {
    await p.click('#brief-jc'); if (await p.isVisible('#elSelbst')) await p.click('#elSelbst');
    await p.evaluate(() => document.querySelector('#p-bescheid [id$="-beispiel"]').click());
    await zu('#bs-erg', 10);
  });
  await p.click('#briefZurueck'); await p.click('#brief-jc'); await p.check('input[value=mit]');
  await p.fill('#bs-art-tag', datum(12).toISOString().slice(0, 10)); await p.press('#bs-art-tag', 'Tab');
  await p.click('.fri-merken button:has-text("Frist merken")');
  await p.click('#briefZurueck'); await p.click('#brief-jc'); await p.check('input[value=bescheid]'); await p.click('#elPaste');
  await p.fill('#elText', 'Jobcenter Musterstadt\nDatum: ' + tt(datum(-3)) + '\nBescheid über Leistungen zur Sicherung des Lebensunterhalts\nRechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden.');
  await p.click('#elLesen'); await p.waitForTimeout(300);
  await p.click('.fri-merken button:has-text("Frist merken")');
  await p.click('#briefZurueck');
  // Leistungs-Check (Weg „Alles auf einer Seite“) mit Musterhaushalt (verstecktes Beispiel p1) und PLZ
  await start(); await p.click('#goLeistungen');
  await p.evaluate(() => document.getElementById('p1').click());
  await p.fill('#plz', '91054'); await p.press('#plz', 'Tab');
  if (await p.isVisible('#plzPick')) await p.selectOption('#plzPick', { index: 2 });
  await roh('2-ergebnis', async () => { await zu('#ergebnis', 10); });
  // Antragsmappe: Musterdaten eintragen, Bild zeigt die Schritte (Anschreiben, Formulare, Unterlagen, Abschicken)
  await roh('6-mappe', async () => {
    await p.click('#mappeMake'); await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-geb', '01.01.1991'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen');
    await p.press('#p-ort', 'Tab'); await p.waitForTimeout(300); await zu('#mappeBody', 10);
  });
  await p.click('#mappeClose');
  // Geld und Schulden: Es ist dringend → Konto gepfändet (Frist und erster Schritt)
  await roh('3-dringend', async () => { await start(); await p.click('#goGeld'); await p.click('#v-geld button:has-text("Es ist dringend"), button:has-text("Es ist dringend")'); await p.click('button:has-text("Mein Konto ist gepfändet")'); await oben(); });
  // Pflege: Leistungen bei Pflegegrad 3
  await roh('5-pflege', async () => { await start(); await p.click('#goPflege'); await p.click('#pu-hilfe'); await p.locator('button:visible', { hasText: /^3$/ }).first().click(); await oben(); });
  // Mein Ordner → Fristen
  await roh('7-fristen', async () => { await p.click('#appnav [data-ansicht=ordner]'); await p.click('#or-fristen'); await oben(); });
  // Arabisch: Ergebnis
  await start(); await p.click('#goLeistungen'); await sprache('ar');
  await roh('8-sprachen', async () => { await zu('#ergebnis', 10); });
  await sprache('de');
  if (fehler.length) throw new Error('Skriptfehler in der App: ' + fehler.join(' | '));

  // In Store-Formate setzen
  const MOTIVE = [
    ['1-start', 'Hilfen finden, Briefe prüfen', 'Alles an einem Ort, ohne Anmeldung'],
    ['2-ergebnis', require('../test/karten.js').length + ' Leistungen geprüft', 'Mit grober Höhe und klarer Einschätzung'],
    ['3-dringend', 'Schulden? Erst das Dringende', 'Bei Pfändung, Sperre oder Mahnbescheid: Frist und erster Schritt'],
    ['4-bescheid', 'Bescheid nachgerechnet', 'Abweichungen mit Paragraf, Widerspruch als PDF'],
    ['5-pflege', 'Was steht dir bei Pflege zu?', 'Leistungen je Pflegegrad, Pflegegrad selbst einschätzen'],
    ['6-mappe', 'Anträge fertig zum Abschicken', 'Schritt für Schritt: Anschreiben, Formulare, Unterlagen'],
    ['7-fristen', 'Fristen im Blick', 'In „Mein Ordner“: was bis wann zu tun ist'],
    ['8-sprachen', 'In 13 Sprachen', 'Amtsbegriffe bleiben deutsch, damit du sie wiedererkennst'],
    ['9-weg', 'Eine Frage pro Seite', 'Oder alles auf einer Seite, wie es dir lieber ist', 'nurIos']]; // Play: höchstens 8 Bilder
  const FORMATE = [['play', 1080, 1920], ['ios-6.9', 1320, 2868], ['ios-6.5', 1242, 2688]];
  const p2 = await b.newPage();
  for (const [fmt, w, h] of FORMATE) {
    fs.rmSync(D + fmt, { recursive: true, force: true }); fs.mkdirSync(D + fmt, { recursive: true });
    for (const [n, titel, unter, nur] of MOTIVE) {
      if (nur === 'nurIos' && !fmt.startsWith('ios')) continue;
      const img = 'data:image/png;base64,' + fs.readFileSync(D + 'roh-' + n + '.png').toString('base64');
      await p2.setViewportSize({ width: w, height: h });
      await p2.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;background:${VERLAUF};font-family:system-ui,sans-serif;color:#fff;overflow:hidden;display:flex;flex-direction:column;align-items:center">
        <div style="padding:${h * 0.045}px ${w * 0.07}px ${h * 0.025}px;text-align:center"><div style="font-size:${w * 0.072}px;font-weight:800;line-height:1.15">${titel}</div>
        <div style="font-size:${w * 0.038}px;opacity:.92;margin-top:${h * 0.012}px;line-height:1.3">${unter}</div></div>
        <div style="flex:1;min-height:0;width:100%;display:flex;justify-content:center;align-items:center;padding-bottom:${h * 0.035}px;box-sizing:border-box" id="rahmen">
        <img src="${img}" id="bild" style="border-radius:${w * 0.045}px;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#fff;display:block"></div></body></html>`); // ganzer Bildschirm samt Leiste, nichts abgeschnitten
      // Bild so groß wie möglich, ohne Rand und ohne Abschneiden (Seitenverhältnis der Aufnahme bleibt)
      await p2.evaluate((mw) => new Promise((ok) => { const i = document.getElementById('bild'); const f = () => { const r = document.getElementById('rahmen'); const cs = getComputedStyle(r);
        const hh = r.clientHeight - parseFloat(cs.paddingBottom); const k = Math.min(mw / i.naturalWidth, hh / i.naturalHeight); i.style.width = Math.floor(i.naturalWidth * k) + 'px'; i.style.height = Math.floor(i.naturalHeight * k) + 'px'; ok(); };
        if (i.complete) f(); else i.onload = f; }), w * 0.82);
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
  await p2.setContent(`<html><body style="margin:0;width:1024px;height:500px;background:linear-gradient(135deg,#13806e,#0a4f44);font-family:system-ui,sans-serif;color:#fffaf3;display:flex;align-items:center;gap:52px;padding:0 76px;box-sizing:border-box">
    <img src="${logoImg}" style="width:210px;height:210px;border-radius:46px;box-shadow:0 14px 40px rgba(0,0,0,.35)">
    <div><div style="font-size:66px;font-weight:800;letter-spacing:-1px;line-height:1">SoLo</div><div style="font-size:26px;font-weight:600;opacity:.85;margin-top:4px">Sozialleistungslotse</div>
    <div style="font-size:34px;font-weight:700;margin-top:16px;line-height:1.25">Hilfen finden.<br>Briefe prüfen.<br><span style="color:#ffc2ad">Anträge schreiben.</span></div>
    <div style="font-size:24px;margin-top:16px;opacity:.9">Offline · ohne Anmeldung · in 13 Sprachen</div></div></body></html>`);
  await p2.waitForTimeout(100);
  await p2.screenshot({ path: D + 'play-werbegrafik-1024x500.png' });
  await b.close(); srv.close();
  console.log('fertig');
})().catch(async (e) => { console.log('FEHLER', e.message.split('\n')[0]); if (process.env.DEBUG && globalThis.__p) await globalThis.__p.screenshot({ path: D + 'fehler.png' }); process.exit(1); });

