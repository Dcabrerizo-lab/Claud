// Test der Store-App (app/www) im Browser, mit nachgeahmten Capacitor-Plugins.
// Prüft: kein Netz, keine CSP-Verstöße, Schriften lokal, Sprachen, Antragsmappe (Teilen, PDF), Foto-Scan, Speichern.
// Aufruf: npm run test:app (baut vorher app/www)
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require(path.join(__dirname, '..', 'app', 'node_modules', 'pdf-lib'));
const KARTEN = require('./karten.js');

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
        writeFile: (o) => { calls.push(['Filesystem.writeFile', { path: o.path, directory: o.directory, size: o.data.length }]); window.__pdf = o.data; (window.__files = window.__files || {})[o.path] = o.data; return Promise.resolve({ uri: 'file:///cache/' + o.path }); },
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
  ok('Erster Start: Anleitung statt Beispielwerte', (await p.locator('#cards .startcard').count()) === 1 && (await p.inputValue('#ek1Brutto')) === '');
  await p.click('#p1');
  ok(KARTEN.length + ' Karten', (await p.locator('#cards .card').count()) === KARTEN.length);
  ok('Schrift lokal geladen', await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.status === 'loaded'); }));
  ok('Hinweis zur Web-Version im Impressum ausgeblendet', await p.evaluate(() => { document.getElementById('legalBtn').click(); const h = document.getElementById('legalWeb').hidden; document.getElementById('legalClose').click(); return h; }));
  ok('Web-Scan (Tesseract/Claude) nicht enthalten, Kamera-Scan vorhanden', (await p.locator('#sc-local').count()) === 0 && (await p.locator('#sc-claudeBox').count()) === 0 && (await p.isVisible('#sc-take')));
  for (const l of ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro']) { await p.selectOption('#lang', l); ok('Sprache ' + l, (await p.locator('#cards .card').count()) === KARTEN.length); }
  await p.selectOption('#lang', 'de');

  // Foto-Scan: Kamera -> Texterkennung -> Felder, Foto wird danach gelöscht
  await p.click('#p1'); await p.fill('#p-name', 'Maria Muster');
  await p.click('#sc-take');
  await p.waitForSelector('#sc-out .sc-row', { timeout: 5000 }).catch(() => {});
  ok('Scan: Kamera ohne Galerie-Speicherung aufgerufen', (await calls('Camera.getPhoto')).some((o) => o.saveToGallery === false && o.source === 'CAMERA'));
  ok('Scan: Texterkennung mit Fotopfad', (await calls('TextRecognition.recognize')).some((o) => /foto\.jpg$/.test(o.path)));
  ok('Scan: Felder erkannt, Name vorausgefüllt', (await p.locator('#sc-out .sc-row').count()) >= 3 && /Maria Muster/.test(await p.textContent('#sc-out')));
  ok('Scan: Foto danach gelöscht', (await calls('Filesystem.deleteFile')).some((o) => /foto\.jpg$/.test(o.path)));

  // Wohnort: PLZ -> Mietenstufe und zuständige Stelle mit Anschrift (offline)
  ok('Ohne PLZ: Hinweis auf die Postleitzahl in der Wohngeld-Karte', /Postleitzahl/.test(await p.textContent('#c-wohngeld')));
  await p.fill('#plz', '90542'); await p.waitForTimeout(300);
  ok('PLZ 90542: Bayern und Mietenstufe III gesetzt', (await p.inputValue('#bundesland')) === 'BY' && (await p.inputValue('#mietstufe')) === '3');
  const beh = (await p.textContent('#c-wohngeld .behoerde').catch(() => '')).replace(/\s+/g, ' ');
  ok('Wohngeld-Karte nennt Landratsamt Erlangen-Höchstadt mit Anschrift', /Landratsamt Erlangen-Höchstadt, Wohngeldstelle/.test(beh) && /Nägelsbachstraße 1/.test(beh) && /91052 Erlangen/.test(beh), beh);

  // Antragsmappe
  // Grundsicherungsgeld zusätzlich wählen (falls angeboten), damit die vorausgefüllten Jobcenter-Formulare mitgeprüft werden
  const mitGG = await p.evaluate(() => { const cb = document.querySelector('[data-pick="ggeld"]'); if (!cb) return false; cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); return true; });
  await p.click('#mappeMake'); ok('Mappe öffnet', await p.isVisible('#mappe'));
  const brief = await p.inputValue('#mappeText');
  ok('Anschreiben Wohngeld: Empfänger mit Anschrift', /Landratsamt Erlangen-Höchstadt\nWohngeldstelle\nNägelsbachstraße 1\n91052 Erlangen/.test(brief), brief.slice(0, 300));
  ok('Anschreiben Kindergeld: Familienkasse Bayern Nord, Postanschrift', /Familienkasse Bayern Nord\n90316 Nürnberg/.test(brief), brief.slice(0, 300));
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
  // Amtliche Formulare: vorausgefüllt als PDF-Dateien teilen
  ok('Amtliche Formulare in der Mappe mit Knopf', await p.isVisible('#formsShare'));
  const vorher = (await calls('Share.share')).length;
  await p.evaluate(() => { window.__files = {}; });
  await p.click('#formsShare');
  await p.waitForFunction((n) => window.__calls.filter((c) => c[0] === 'Share.share').length > n, vorher, { timeout: 30000 }).catch(() => {});
  const formShare = (await calls('Share.share')).slice(vorher).find((o) => o.files);
  const dateien = await p.evaluate(() => window.__files || {});
  ok('Formulare werden als PDF-Dateien geteilt', !!formShare && formShare.files.length >= 1 && formShare.files.length === Object.keys(dateien).length && formShare.files.every((f) => /\.pdf$/.test(f)), JSON.stringify(formShare) + ' ' + (await p.textContent('#formsMsg')));
  let gefuellt = 0;
  for (const [name, data] of Object.entries(dateien)) {
    const buf = Buffer.from(data, 'base64');
    ok('Formular ' + name + ' ist ein PDF', buf.slice(0, 5).toString() === '%PDF-' && buf.length > 10000, buf.length);
    if (/\/Encrypt/.test(buf.toString('latin1'))) continue; // vom Herausgeber geschützt: unverändert weitergegeben
    const doc = await PDFDocument.load(buf);
    ok('Formular ' + name + ' lässt sich öffnen', doc.getPageCount() > 0);
    if (/Hauptantrag/.test(name)) { ok('Hauptantrag: Vorname aus der Mappe eingetragen', doc.getForm().getTextField('txtfPersonVorname').getText() === 'Maria'); gefuellt++; }
  }
  const geloescht = (await calls('Filesystem.deleteFile')).map((o) => o.path);
  ok('Formular-Dateien nach dem Teilen aus dem Cache gelöscht', Object.keys(dateien).every((n) => geloescht.indexOf(n) >= 0), geloescht.join(' '));
  if (mitGG) ok('Mit Grundsicherungsgeld: Hauptantrag vorausgefüllt geprüft', gefuellt === 1);
  console.log('  (Formulare geteilt: ' + Object.keys(dateien).join(', ') + (gefuellt ? '; Hauptantrag geprüft' : '') + ')');
  // Fristen in den Kalender: Datei SoLo-Fristen.ics schreiben und über den Teilen-Dialog anbieten
  const vorIcs = (await calls('Share.share')).length;
  await p.evaluate(() => { window.__files = {}; });
  await p.click('#mappeIcs');
  await p.waitForFunction((n) => window.__calls.filter((c) => c[0] === 'Share.share').length > n, vorIcs, { timeout: 10000 }).catch(() => {});
  const icsDatei = await p.evaluate(() => (window.__files || {})['SoLo-Fristen.ics'] || '');
  const icsShare = (await calls('Share.share')).slice(vorIcs).find((o) => o.files);
  ok('Fristen: Kalenderdatei mit Terminen geschrieben und geteilt', /BEGIN:VCALENDAR/.test(icsDatei) && /BEGIN:VEVENT/.test(icsDatei) && !!icsShare && /SoLo-Fristen\.ics$/.test(icsShare.files[0]), icsDatei.slice(0, 80));
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

  // Wohnort nur in der Anschrift der Antragsmappe (PLZ-Feld im Fragebogen leer): App nutzt die PLZ aus „PLZ und Ort“
  await p.click('#p1'); await p.fill('#plz', ''); await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-ort', '');
  await p.click('#mappeMake');
  ok('Ohne Wohnort: Hinweis in der Mappe, dass die PLZ fehlt', await p.isVisible('#mappeAdrNote'));
  await p.click('#mappeClose');
  await p.fill('#p-ort', '90542 Eckental'); await p.waitForTimeout(200);
  ok('PLZ aus der Anschrift: Karte nennt die zuständige Stelle', /Familienkasse Bayern Nord/.test(await p.textContent('#c-kindergeld')));
  await p.click('#mappeMake');
  const brief2 = await p.inputValue('#mappeText');
  ok('PLZ aus der Anschrift: Anschreiben an Familienkasse Bayern Nord mit Postanschrift', /Familienkasse Bayern Nord\n90316 Nürnberg/.test(brief2), brief2.slice(0, 250));
  ok('PLZ aus der Anschrift: kein Hinweis auf fehlende PLZ', !(await p.isVisible('#mappeAdrNote')));
  await p.click('#mappeClose');
  // Mehrere Orte unter einer PLZ: Ortsname aus der Anschrift entscheidet (84032: Altdorf im Lkr. Landshut oder Stadt Landshut)
  await p.fill('#p-ort', '84032 Altdorf'); await p.waitForTimeout(200);
  ok('84032 Altdorf: Landratsamt Landshut (nicht Stadt Landshut)', /Landratsamt Landshut/.test(await p.textContent('#c-wohngeld').catch(() => '')));

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
