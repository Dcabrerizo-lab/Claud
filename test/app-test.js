// Test der Store-App (app/www) im Browser, mit nachgeahmten Capacitor-Plugins.
// Prüft: kein Netz, keine CSP-Verstöße, Schriften lokal, Sprachen, Antragsmappe (Teilen, PDF), Foto-Scan, Speichern.
// Aufruf: npm run test:app (baut vorher app/www)
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require(path.join(__dirname, '..', 'app', 'node_modules', 'pdf-lib'));

const WWW = path.join(__dirname, '..', 'app', 'www');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };

// Nachgeahmte Plugins; alle Aufrufe landen in window.__calls
const MOCK = () => {
  const calls = (window.__calls = []);
  const log = (name) => (o) => { calls.push([name, o]); return Promise.resolve({}); };
  const store = {};
  window.Capacitor = {
    Plugins: {
      Preferences: {
        get: (o) => { calls.push(['Preferences.get', o]); return Promise.resolve({ value: o.key in store ? store[o.key] : null }); },
        set: (o) => { calls.push(['Preferences.set', o]); store[o.key] = o.value; return Promise.resolve(); },
        remove: (o) => { calls.push(['Preferences.remove', o]); delete store[o.key]; return Promise.resolve(); }
      },
      Share: { share: log('Share.share') },
      Filesystem: {
        writeFile: (o) => { calls.push(['Filesystem.writeFile', { path: o.path, directory: o.directory, size: o.data.length }]); window.__pdf = o.data; return Promise.resolve({ uri: 'file:///cache/' + o.path }); },
        deleteFile: log('Filesystem.deleteFile')
      },
      Clipboard: { write: log('Clipboard.write') },
      Browser: { open: log('Browser.open') },
      Camera: { getPhoto: (o) => { calls.push(['Camera.getPhoto', o]); return Promise.resolve({ path: 'file:///cache/foto.jpg', webPath: 'http://localhost/_capacitor_file_/cache/foto.jpg' }); } },
      TextRecognition: { recognize: (o) => { calls.push(['TextRecognition.recognize', o]); return Promise.resolve({ lines: ['Antrag auf Wohngeld', 'Name, Vorname', 'Geburtsdatum', 'IBAN', 'Ort, Datum, Unterschrift'] }); } }
    }
  };
};

(async () => {
  const server = http.createServer((req, res) => {
    const f = path.join(WWW, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (!f.startsWith(WWW) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const origin = 'http://127.0.0.1:' + server.address().port;

  const out = [];
  const ok = (n, c, x) => out.push((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : ' ' + (x || '')));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' });
  await ctx.addInitScript(MOCK);
  const p = await ctx.newPage();
  const reqs = [], errs = [], csp = [];
  p.on('request', (r) => reqs.push(r.url()));
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') (/Content Security/i.test(m.text()) ? csp : errs).push(m.text()); });
  const calls = (name) => p.evaluate((n) => window.__calls.filter((c) => c[0] === n).map((c) => c[1]), name);

  await p.goto(origin + '/index.html');
  await p.waitForTimeout(400);
  ok('Keine Skriptfehler beim Start', errs.length === 0, errs.join('|'));
  ok('Gespeicherte Daten werden über Preferences gelesen', (await calls('Preferences.get')).length > 0);
  ok('21 Karten', (await p.locator('#cards .card').count()) === 21);
  ok('Schrift lokal geladen', await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.status === 'loaded'); }));
  ok('Hinweis zur Web-Version im Impressum ausgeblendet', await p.evaluate(() => { document.getElementById('legalBtn').click(); const h = document.getElementById('legalWeb').hidden; document.getElementById('legalClose').click(); return h; }));
  ok('Web-Scan (Tesseract/Claude) nicht enthalten, Kamera-Scan vorhanden', (await p.locator('#sc-local').count()) === 0 && (await p.locator('#sc-claudeBox').count()) === 0 && (await p.isVisible('#sc-take')));
  for (const l of ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro']) { await p.selectOption('#lang', l); ok('Sprache ' + l, (await p.locator('#cards .card').count()) === 21); }
  await p.selectOption('#lang', 'de');

  // Foto-Scan: Kamera -> Texterkennung -> Felder, Foto wird danach gelöscht
  await p.click('#p1'); await p.fill('#p-name', 'Maria Muster');
  await p.click('#sc-take');
  await p.waitForSelector('#sc-out .sc-row', { timeout: 5000 }).catch(() => {});
  ok('Scan: Kamera ohne Galerie-Speicherung aufgerufen', (await calls('Camera.getPhoto')).some((o) => o.saveToGallery === false && o.source === 'CAMERA'));
  ok('Scan: Texterkennung mit Fotopfad', (await calls('TextRecognition.recognize')).some((o) => /foto\.jpg$/.test(o.path)));
  ok('Scan: Felder erkannt, Name vorausgefüllt', (await p.locator('#sc-out .sc-row').count()) >= 3 && /Maria Muster/.test(await p.textContent('#sc-out')));
  ok('Scan: Foto danach gelöscht', (await calls('Filesystem.deleteFile')).some((o) => /foto\.jpg$/.test(o.path)));

  // Antragsmappe
  await p.click('#mappeMake'); ok('Mappe öffnet', await p.isVisible('#mappe'));
  ok('PDF-Knopf statt Drucken, Teilen sichtbar', (await p.textContent('#mappePrint')).includes('PDF') && (await p.isVisible('#mappeShare')));
  await p.click('#mappeShare');
  ok('Teilen übergibt die Mappe als Text', (await calls('Share.share')).some((o) => /Maria Muster/.test(o.text || '')));
  await p.click('#mappePrint');
  await p.waitForFunction(() => window.__calls.some((c) => c[0] === 'Share.share' && c[1].files), null, { timeout: 15000 }).catch(() => {});
  const shared = (await calls('Share.share')).find((o) => o.files);
  ok('PDF wird erzeugt, gespeichert und geteilt', !!shared && /Antragsmappe\.pdf$/.test(shared.files[0]), JSON.stringify(await p.evaluate(() => window.__calls.slice(-4))) + ' ' + (await p.textContent('#copyMsg')));
  const b64 = await p.evaluate(() => window.__pdf || '');
  if (b64) {
    const bytes = Buffer.from(b64, 'base64');
    const doc = await PDFDocument.load(bytes);
    ok('PDF ist gültig und hat Briefe, Angabenblatt und Unterlagenliste (>= 3 Seiten)', bytes.slice(0, 5).toString() === '%PDF-' && doc.getPageCount() >= 3, doc.getPageCount());
    ok('PDF-Datei wird nach dem Teilen aus dem Cache gelöscht', (await calls('Filesystem.deleteFile')).some((o) => o.path === 'Antragsmappe.pdf'));
  } else ok('PDF erzeugt', false, await p.textContent('#copyMsg'));
  // PDF auch auf Russisch (Kyrillisch) und Arabisch (Unterlagenliste bleibt deutsch)
  for (const l of ['ru', 'ar']) {
    await p.evaluate(() => { window.__pdf = ''; });
    await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, l); // Auswahl ist bei offener Mappe verdeckt
    await p.click('#mappePrint');
    await p.waitForFunction(() => !!window.__pdf, null, { timeout: 15000 }).catch(() => {});
    ok('PDF auch in Sprache ' + l, !!(await p.evaluate(() => window.__pdf)), await p.textContent('#copyMsg'));
  }
  await p.evaluate(() => { const s = document.getElementById('lang'); s.value = 'de'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.screenshot({ path: path.join(require('os').tmpdir(), 'app-mappe.png') });
  await p.click('#mappeClose');

  // Links ins Netz öffnen im Systembrowser
  await p.evaluate(() => { const a = document.createElement('a'); a.href = 'https://www.example.org/'; a.textContent = 'x'; document.body.appendChild(a); a.click(); });
  ok('Externe Links öffnen im Systembrowser', (await calls('Browser.open')).some((o) => o.url === 'https://www.example.org/'));

  // Speichern
  await p.fill('#miete', '777'); await p.press('#miete', 'Tab'); await p.waitForTimeout(800);
  ok('Eingaben werden über Preferences gespeichert', (await calls('Preferences.set')).some((o) => /777/.test(o.value || '')));
  await p.click('#clearBtn');
  ok('„Alle Angaben löschen“ entfernt gespeicherte Eingaben', (await calls('Preferences.remove')).length > 0);

  const net = reqs.filter((u) => !u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:'));
  ok('Nur lokale Anfragen (kein Netz)', net.length === 0, net.join(','));
  ok('Keine CSP-Verstöße', csp.length === 0, csp.join('|'));
  ok('Keine Skriptfehler', errs.length === 0, errs.join('|'));

  await b.close(); server.close();
  console.log(out.join('\n'));
  const failed = out.filter((l) => l.startsWith('FAIL')).length;
  console.log(failed ? '\n' + failed + ' FEHLER' : '\nApp-Tests bestanden: ' + out.length + ' Prüfungen');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.stack); process.exit(1); });
