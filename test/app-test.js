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
    getPlatform: () => window.__platform || 'android',
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
      PdfAusgabe: {
        drucken: (o) => { calls.push(['PdfAusgabe.drucken', { name: o.name, size: o.data.length }]); window.__druck = o.data; return Promise.resolve(); },
        speichern: (o) => { calls.push(['PdfAusgabe.speichern', { name: o.name, size: o.data.length }]); window.__gespeichert = o.data; return Promise.resolve({ ort: 'Download', name: o.name }); }
      },
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
  ok('Start: Startseite mit den drei Bereichen', await p.isVisible('#v-start') && (await p.locator('#appnav button').count()) === 3);
  ok('Alte Fristen werden über Preferences gelöscht', (await calls('Preferences.remove')).some((c) => c.key === 'lotse.fristen'));
  // Prüfpaket läuft unter der CSP der App
  await p.click('#appnav [data-ansicht=briefe]'); await p.click('#brief-jc'); await p.click('#p-bescheid >> text=Beispiel laden');
  ok('Brief prüfen rechnet in der App', ((await p.textContent('#p-bescheid')) || '').includes('€'));
  ok('Keine Fristen über Preferences gespeichert', !(await calls('Preferences.set')).some((c) => c.key === 'lotse.fristen'));
  await p.click('#appnav [data-ansicht=leistungen]');
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
  ok('Entweder Formular oder formlos: kein formloser Brief für Wohngeld (Bayern) und Kindergeld, weil es den Formular-Link gibt', !/Betreff: Antrag auf Wohngeld/.test(brief) && !/Betreff: Antrag auf Kindergeld/.test(brief), brief.slice(0, 300));
  const links = await p.$$eval('#mappeBody .forms a[href]', (e) => e.map((x) => x.getAttribute('href')));
  ok('Formular-Links für Wohngeld (Bayern) und Kindergeld in der Mappe', links.some((u) => /stmb\.bayern\.de/.test(u)) && links.some((u) => /formulare-kindergeld/.test(u)), links.join(' '));
  ok('Knöpfe einzeln: PDF teilen, kein doppelter Knopf „Teilen oder speichern“', (await p.textContent('#mappePrint')).includes('PDF') && !(await p.isVisible('#mappeShare')));
  ok('Keine Doppelbeschriftung „oder“ auf den Mappe-Knöpfen', !(await p.evaluate(() => [...document.querySelectorAll('#mappe .btns button')].filter((b) => !b.hidden).some((b) => / oder | or /.test(b.textContent)))));
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
  // Android: Drucken (Druckdialog des Systems) und Speichern (Ordner Downloads) über das native Plugin PdfAusgabe
  ok('Android: Knöpfe Drucken und PDF speichern sichtbar', (await p.isVisible('#mappeDruck')) && (await p.isVisible('#mappeSpeichern')));
  await p.click('#mappeDruck');
  await p.waitForFunction(() => !!window.__druck, null, { timeout: 15000 }).catch(() => {});
  const druck = Buffer.from(await p.evaluate(() => window.__druck || ''), 'base64');
  ok('Drucken: gültiges PDF an den Druckdialog übergeben', druck.slice(0, 5).toString() === '%PDF-' && (await PDFDocument.load(druck)).getPageCount() >= 3, await p.textContent('#copyMsg'));
  await p.click('#mappeSpeichern');
  await p.waitForFunction(() => !!window.__gespeichert, null, { timeout: 15000 }).catch(() => {});
  const gesp = Buffer.from(await p.evaluate(() => window.__gespeichert || ''), 'base64');
  ok('Speichern: gültiges PDF gespeichert, Meldung nennt den Ordner Downloads', gesp.slice(0, 5).toString() === '%PDF-' && /Downloads/.test(await p.textContent('#copyMsg')), await p.textContent('#copyMsg'));
  // PDF auch auf Russisch (Kyrillisch) und Arabisch (Unterlagenliste bleibt deutsch)
  for (const l of ['ru', 'ar']) {
    await p.evaluate(() => { window.__pdf = ''; });
    await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, l); // Auswahl ist bei offener Mappe verdeckt
    await p.click('#mappePrint');
    await p.waitForFunction(() => !!window.__pdf, null, { timeout: 15000 }).catch(() => {});
    ok('PDF auch in Sprache ' + l, !!(await p.evaluate(() => window.__pdf)), await p.textContent('#copyMsg'));
  }
  await p.evaluate(() => { const s = document.getElementById('lang'); s.value = 'de'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  // Amtliche Formulare: nur Links, kein Ausfüllen und Teilen von Vordrucken mehr
  ok('Kein Knopf zum Ausfüllen von Formularen, keine Formular-Dateien in der App', (await p.locator('#formsShare').count()) === 0 && !fs.existsSync(path.join(WWW, 'formulare')));
  if (mitGG) ok('Mit Grundsicherungsgeld: Link auf die Formularseite der Bundesagentur, kein formloser Jobcenter-Brief', links.length >= 0 && (await p.$$eval('#mappeBody .forms a[href]', (e) => e.some((x) => /downloads-arbeitslos-arbeit-finden/.test(x.href)))) && !/Betreff: Antrag auf Grundsicherungsgeld/.test(await p.inputValue('#mappeText')));
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
  ok('PLZ aus der Anschrift: Mappe übernimmt den Wohnort; Kindergeld über den Formular-Link statt formlosem Brief', /90542 Eckental/.test(brief2) && !/Betreff: Antrag auf Kindergeld/.test(brief2), brief2.slice(0, 250));
  ok('PLZ aus der Anschrift: kein Hinweis auf fehlende PLZ', !(await p.isVisible('#mappeAdrNote')));
  await p.click('#mappeClose');
  // Mehrere Orte unter einer PLZ: Ortsname aus der Anschrift entscheidet (84032: Altdorf im Lkr. Landshut oder Stadt Landshut)
  await p.fill('#p-ort', '84032 Altdorf'); await p.waitForTimeout(200);
  ok('84032 Altdorf: Landratsamt Landshut (nicht Stadt Landshut)', /Landratsamt Landshut/.test(await p.textContent('#c-wohngeld').catch(() => '')));

  const net = reqs.filter((u) => !u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:'));
  ok('Nur lokale Anfragen (kein Netz)', net.length === 0, net.join(','));
  ok('Keine CSP-Verstöße', csp.length === 0, csp.join('|'));
  ok('Keine Skriptfehler', errs.length === 0, errs.join('|'));

  // Impressum je Plattform: Android David Cabrerizo, iPhone Natascha Cabrerizo y Polo (Apple-Konto); iPhone ohne Android-Knöpfe
  const anbieter = () => p.evaluate(() => document.getElementById('anbieterName').textContent);
  ok('Android: Anbieter im Impressum David Cabrerizo', (await anbieter()) === 'David Cabrerizo', await anbieter());
  const ctxI = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', serviceWorkers: 'block' });
  await ctxI.addInitScript(() => { window.__platform = 'ios'; }); await ctxI.addInitScript(MOCK);
  const pi = await ctxI.newPage(); await pi.goto(origin + '/index.html#leistungen'); await pi.waitForTimeout(400);
  const legalI = await pi.evaluate(() => document.getElementById('legal').textContent);
  ok('iPhone: Anbieter im Impressum Natascha Cabrerizo y Polo, nicht David', /Anbieter: Natascha Cabrerizo y Polo/.test(legalI.replace(/\s+/g, ' ')) && !/David/.test(legalI), legalI.slice(0, 200));
  await pi.click('#p1'); await pi.fill('#p-name', 'Test'); await pi.evaluate(() => document.getElementById('mappeMake').click()); await pi.waitForTimeout(300);
  ok('iPhone: keine Android-Knöpfe Drucken/Speichern, PDF teilen vorhanden', !(await pi.isVisible('#mappeDruck')) && !(await pi.isVisible('#mappeSpeichern')) && (await pi.isVisible('#mappePrint')));
  await ctxI.close();

  await b.close(); server.close();
  console.log(out.join('\n'));
  const failed = out.filter((l) => l.startsWith('FAIL')).length;
  console.log(failed ? '\n' + failed + ' FEHLER' : '\nApp-Tests bestanden: ' + out.length + ' Prüfungen');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.stack); process.exit(1); });
