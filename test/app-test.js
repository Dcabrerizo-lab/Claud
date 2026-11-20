// Test der Store-App (app/www) im Browser, mit nachgeahmten Capacitor-Plugins.
// Prüft: kein Netz, keine CSP-Verstöße, Schriften lokal, Sprachen, Antragsmappe (Teilen, PDF), Foto-Scan, Speichern.
// Aufruf: npm run test:app (baut vorher app/www)
'use strict';
const { chromium } = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
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
  const store = { 'lotse.checkWeg': 'alles' }; // Leistungs-Check: Weg „Alles auf einer Seite“ vorgewählt (src/schritte.js)
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
      Camera: { getPhoto: (o) => { calls.push(['Camera.getPhoto', o]); return Promise.resolve({ path: 'file:///cache/foto.jpg', webPath: location.origin + '/_capacitor_file_/cache/foto.jpg' }); } },
      PdfAusgabe: {
        drucken: (o) => { calls.push(['PdfAusgabe.drucken', { name: o.name, size: o.data.length }]); window.__druck = o.data; return Promise.resolve(); },
        speichern: (o) => { calls.push(['PdfAusgabe.speichern', { name: o.name, size: o.data.length }]); window.__gespeichert = o.data; return Promise.resolve({ ort: 'Download', name: o.name }); }
      },
      TextRecognition: { recognize: (o) => { calls.push(['TextRecognition.recognize', o]); return Promise.resolve({ lines: ['Antrag auf Wohngeld', 'Name, Vorname', 'Geburtsdatum', 'IBAN', 'Ort, Datum, Unterschrift'] }); } }
    }
  };
};

(async () => {
  // Wie Capacitor: das aufgenommene Foto liegt unter /_capacitor_file_/ auf demselben Ursprung wie die App (hier ein kleines Testbild)
  const FOTO = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/_capacitor_file_/')) { res.writeHead(200, { 'Content-Type': 'image/png' }); res.end(FOTO); return; }
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
  const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
  const reqs = [], errs = [], csp = [];
  p.on('request', (r) => reqs.push(r.url()));
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') (/Content Security/i.test(m.text()) ? csp : errs).push(m.text()); });
  const calls = (name) => p.evaluate((n) => window.__calls.filter((c) => c[0] === n).map((c) => c[1]), name);

  // Auf den Zustand warten statt fester Wartezeit; trifft er nicht ein, schlägt die folgende Prüfung fehl
  const warte = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 5000 }).catch(() => {});
  await p.goto(origin + '/index.html');
  await warte(() => !!document.getElementById('v-start') && document.getElementById('v-start').offsetParent !== null && (window.__calls || []).some((c) => c[0] === 'Preferences.remove' && c[1] && c[1].key === 'lotse.fristen'));
  ok('Keine Skriptfehler beim Start', errs.length === 0, errs.join('|'));
  ok('Start: Startseite mit den drei Reitern', await p.isVisible('#v-start') && (await p.locator('#appnav button').count()) === 3);
  ok('Alte Fristen werden über Preferences gelöscht', (await calls('Preferences.remove')).some((c) => c.key === 'lotse.fristen'));
  // Prüfpaket läuft unter der CSP der App
  await p.click('#appnav [data-ansicht=start]'); await p.click('#goBriefe'); await p.click('#brief-jc'); await p.click('#elSelbst'); await p.evaluate(() => document.querySelector('#p-bescheid [id$="-beispiel"]').click());
  ok('Brief prüfen rechnet in der App', ((await p.textContent('#p-bescheid')) || '').includes('€'));
  // Widerspruch als PDF teilen (wie die Antragsmappe), mit Hinweis zur Abgabe
  await p.click('#bs-wid-mach'); await p.waitForSelector('#p-bescheid .schreiben-aus [data-aus="teilen"]', { state: 'visible', timeout: 5000 }).catch(() => {});
  ok('Widerspruch: Knöpfe und Hinweis zur Abgabe sichtbar', await p.isVisible('#p-bescheid .schreiben-aus [data-aus="teilen"]') && /unterschreiben/.test(await p.textContent('#p-bescheid .schreiben-aus')));
  await p.click('#p-bescheid .schreiben-aus [data-aus="teilen"]'); await warte(() => (window.__calls || []).some((c) => c[0] === 'Filesystem.writeFile' && c[1].path === 'Widerspruch-Jobcenter.pdf') && (window.__calls || []).some((c) => c[0] === 'Share.share'), null, 15000);
  ok('Widerspruch: PDF geschrieben und geteilt', (await calls('Filesystem.writeFile')).some((o) => o.path === 'Widerspruch-Jobcenter.pdf') && (await calls('Share.share')).length >= 1);
  ok('Keine Fristen über Preferences gespeichert', !(await calls('Preferences.set')).some((c) => c.key === 'lotse.fristen'));
  await p.click('#appnav [data-ansicht=start]'); await p.click('#goLeistungen');
  ok('Gespeicherte Daten werden über Preferences gelesen', (await calls('Preferences.get')).length > 0);
  ok('Erster Start: Anleitung statt Beispielwerte', (await p.locator('#cards .startcard').count()) === 1 && (await p.inputValue('#ek1Brutto')) === '');
  if (await p.isVisible('#schritte .sf-w2')) await p.click('#schritte .sf-w2'); // Leistungs-Check: Weg „Alles auf einer Seite“ wählen (src/schritte.js)
  await p.evaluate(() => document.getElementById('p1').click());
  ok(KARTEN.length + ' Karten', (await p.locator('#cards .card').count()) === KARTEN.length);
  ok('Schrift lokal geladen', await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some((f) => f.status === 'loaded'); }));
  ok('Hinweis zur Web-Version im Impressum ausgeblendet', await p.evaluate(() => { document.getElementById('legalBtn').click(); const h = document.getElementById('legalWeb').hidden; document.getElementById('legalClose').click(); return h; }));
  ok('Web-Scan (Tesseract/Claude, Dateifeld) nicht enthalten; Kamera-Scan und Text einfügen vorhanden', (await p.locator('#sc-file').count()) === 0 && (await p.locator('#sc-claudeBox').count()) === 0 && (await p.locator('#sc-take').count()) === 1 && (await p.locator('#sc-text').count()) === 1 && (await p.locator('#sc-local').count()) === 1);
  for (const l of ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so']) { await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, l); ok('Sprache ' + l, (await p.locator('#cards .card').count()) === KARTEN.length); }
  await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'de');

  // Foto-Scan: Kamera -> Texterkennung -> Felder, Foto wird danach gelöscht
  await p.evaluate(() => document.getElementById('p1').click()); await p.fill('#p-name', 'Maria Muster');
  // „Brief prüfen“: die Übersicht hat kein Scannen; in der Kachel Antragsformular: Kamera → Texterkennung → Felder erklärt
  await p.click('#appnav [data-ansicht=start]'); await p.click('#goBriefe'); if (await p.isVisible('#briefZurueck')) await p.click('#briefZurueck');
  ok('Übersicht „Brief prüfen“: kein Scannen oder Einfügen', !(await p.isVisible('#einlesen')));
  await p.click('#brief-ab'); await p.click('#brief-af'); await p.click('#sc-take');
  await p.waitForSelector('#scan:not([hidden])', { timeout: 5000 }).catch(() => {});
  ok('Kachel Antragsformular offen', await p.isVisible('#scan'));
  await p.waitForSelector('#sc-out .sc-row', { timeout: 5000 }).catch(() => {});
  ok('Scan: Kamera ohne Galerie-Speicherung aufgerufen', (await calls('Camera.getPhoto')).some((o) => o.saveToGallery === false && o.source === 'CAMERA'));
  ok('Scan: Texterkennung mit Fotopfad', (await calls('TextRecognition.recognize')).some((o) => /foto\.jpg$/.test(o.path)));
  ok('Scan: Felder erkannt, Name vorausgefüllt', (await p.locator('#sc-out .sc-row').count()) >= 3 && /Maria Muster/.test(await p.textContent('#sc-out')));
  ok('Scan: Vorschau des Fotos über der Liste (nur im Arbeitsspeicher)', (await p.locator('#sc-out .sc-vorschau img').count()) === 1 && /^blob:/.test(await p.getAttribute('#sc-out .sc-vorschau img', 'src')));
  ok('Scan: Foto danach gelöscht', (await calls('Filesystem.deleteFile')).some((o) => /foto\.jpg$/.test(o.path)));
  // Eingescanntes PDF (nur Bild, kein Text): pdf.js aus der App (offline) macht ein Seitenbild, die Texterkennung des Geräts liest es,
  // das Seitenbild wird danach aus dem Cache gelöscht
  {
    const { gescannt, digital } = require('./hilfe-pdf');
    const bildSeite = await ctx.newPage();
    await bildSeite.setContent('<div style="font:28px Arial;padding:40px;background:#fff;width:800px">Antrag auf Wohngeld<br>Name, Vorname<br>Geburtsdatum<br>IBAN</div>');
    const png = await bildSeite.screenshot(); await bildSeite.close();
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'solo-app-pdf-'));
    fs.writeFileSync(path.join(tmp, 'scan.pdf'), await gescannt(png));
    fs.writeFileSync(path.join(tmp, 'digital.pdf'), await digital(['Antrag auf Wohngeld', 'Familienname, Vorname', 'Gesamtmiete monatlich', 'Ort, Datum, Unterschrift']));
    const vorRec = (await calls('TextRecognition.recognize')).length;
    await p.setInputFiles('#sc-pdf', path.join(tmp, 'scan.pdf'));
    await p.waitForFunction((v) => (window.__calls || []).filter((c) => c[0] === 'TextRecognition.recognize').length > v || /nicht lesen/.test(document.getElementById('sc-msg').textContent), vorRec, { timeout: 20000 }).catch(() => {});
    await warte(() => (window.__calls || []).some((c) => c[0] === 'Filesystem.deleteFile' && /^solo-pdfseite-/.test(c[1].path)) && /Erkannt: Antrag auf Wohngeld/.test(document.getElementById('sc-out').textContent) && !document.getElementById('sc-take').disabled); // Scan fertig (nicht mehr beschäftigt)
    const rec = (await calls('TextRecognition.recognize')).slice(vorRec);
    ok('Eingescanntes PDF: Seite als Bild an die Texterkennung des Geräts', rec.length === 1 && /solo-pdfseite-\d+\.jpg$/.test(rec[0].path), { rec, msg: await p.textContent('#sc-msg') });
    ok('Eingescanntes PDF: Seitenbild danach gelöscht', (await calls('Filesystem.deleteFile')).some((o) => /^solo-pdfseite-/.test(o.path)));
    ok('Eingescanntes PDF: Felder erklärt', /Erkannt: Antrag auf Wohngeld/.test(await p.textContent('#sc-out')));
    await p.setInputFiles('#sc-pdf', path.join(tmp, 'digital.pdf')); await warte(() => /Gesamtmiete monatlich/.test(document.getElementById('sc-out').textContent), null, 15000);
    ok('Digitales PDF in der App: Text direkt gelesen, keine Texterkennung nötig', (await calls('TextRecognition.recognize')).length === vorRec + 1 && /Gesamtmiete monatlich/.test(await p.textContent('#sc-out')));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  // Direkt in der Kachel: eigener Kamera-Knopf
  const vorher = (await calls('Camera.getPhoto')).length;
  await p.click('#sc-take'); await warte((v) => (window.__calls || []).filter((c) => c[0] === 'Camera.getPhoto').length > v, vorher);
  ok('Kachel Antragsformular: eigener Kamera-Knopf', (await calls('Camera.getPhoto')).length === vorher + 1);
  await p.click('#briefZurueck'); await p.click('#appnav [data-ansicht=start]'); await p.click('#goLeistungen');
  ok('Leistungsseite: keine Kamera und kein Formular-Hinweis', !(await p.isVisible('#sc-take')) && (await p.locator('#scanVerweis').count()) === 0);

  // Wohnort: PLZ -> Mietenstufe und zuständige Stelle mit Anschrift (offline)
  ok('Ohne PLZ: Hinweis auf die Postleitzahl in der Wohngeld-Karte', /Postleitzahl/.test(await p.textContent('#c-wohngeld')));
  await p.fill('#plz', '90542'); await warte(() => document.getElementById('mietstufe').value === '3' && /Nägelsbachstraße/.test((document.querySelector('#c-wohngeld .behoerde') || {}).textContent || ''));
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
  await p.waitForFunction(() => window.__calls.some((c) => c[0] === 'Share.share' && c[1].files && /Antragsmappe/.test(c[1].files[0])), null, { timeout: 15000 }).catch(() => {});
  const shared = (await calls('Share.share')).find((o) => o.files && /Antragsmappe/.test(o.files[0]));
  ok('PDF wird erzeugt, gespeichert und geteilt', !!shared && /Antragsmappe\.pdf$/.test(shared.files[0]), JSON.stringify(await p.evaluate(() => window.__calls.slice(-4))) + ' ' + (await p.textContent('#copyMsg')));
  const b64 = await p.evaluate(() => window.__pdf || '');
  if (b64) {
    const bytes = Buffer.from(b64, 'base64');
    const doc = await PDFDocument.load(bytes);
    ok('PDF ist gültig und hat Briefe, Angabenblatt und Unterlagenliste (>= 3 Seiten)', bytes.slice(0, 5).toString() === '%PDF-' && doc.getPageCount() >= 3, doc.getPageCount());
    ok('PDF-Datei wird nach dem Teilen aus dem Cache gelöscht', (await calls('Filesystem.deleteFile')).some((o) => o.path === 'Antragsmappe.pdf'));
  } else ok('PDF erzeugt', false, await p.textContent('#copyMsg'));
  // Android: Drucken (Druckdialog des Systems) und Speichern (Ordner Downloads) über das native Plugin PdfAusgabe
  await p.evaluate(() => { document.querySelector('#mappe .mappe-mehr').open = true; }); // Drucken/Speichern stehen unter „Weitere Möglichkeiten“
  ok('Android: Knöpfe Drucken und PDF speichern unter „Weitere Möglichkeiten“ sichtbar', (await p.isVisible('#mappeDruck')) && (await p.isVisible('#mappeSpeichern')));
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
  await p.fill('#miete', '777'); await p.press('#miete', 'Tab'); await warte(() => (window.__calls || []).some((c) => c[0] === 'Preferences.set' && /777/.test(c[1].value || '')));
  ok('Eingaben werden über Preferences gespeichert', (await calls('Preferences.set')).some((o) => /777/.test(o.value || '')));
  await p.evaluate(() => { document.getElementById('clear2').click(); document.getElementById('loeschJa').click(); });
  ok('„Nur diesen Vorgang löschen“ entfernt gespeicherte Eingaben', (await calls('Preferences.remove')).length > 0);

  // Wohnort nur in der Anschrift der Antragsmappe (PLZ-Feld im Fragebogen leer): App nutzt die PLZ aus „PLZ und Ort“
  await p.evaluate(() => document.getElementById('p1').click()); await p.fill('#plz', ''); await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-ort', '');
  await p.click('#mappeMake');
  ok('Ohne Wohnort: Hinweis in der Mappe, dass die PLZ fehlt', await p.isVisible('#mappeAdrNote'));
  await p.click('#mappeClose');
  await p.fill('#p-ort', '90542 Eckental'); await warte(() => /Familienkasse Bayern Nord/.test(document.getElementById('c-kindergeld').textContent));
  ok('PLZ aus der Anschrift: Karte nennt die zuständige Stelle', /Familienkasse Bayern Nord/.test(await p.textContent('#c-kindergeld')));
  await p.click('#mappeMake');
  const brief2 = await p.inputValue('#mappeText');
  ok('PLZ aus der Anschrift: Mappe übernimmt den Wohnort; Kindergeld über den Formular-Link statt formlosem Brief', /90542 Eckental/.test(brief2) && !/Betreff: Antrag auf Kindergeld/.test(brief2), brief2.slice(0, 250));
  ok('PLZ aus der Anschrift: kein Hinweis auf fehlende PLZ', !(await p.isVisible('#mappeAdrNote')));
  await p.click('#mappeClose');
  // Mehrere Orte unter einer PLZ: Ortsname aus der Anschrift entscheidet (84032: Altdorf im Lkr. Landshut oder Stadt Landshut)
  await p.fill('#p-ort', '84032 Altdorf'); await warte(() => /Landratsamt Landshut/.test((document.getElementById('c-wohngeld') || {}).textContent || ''));
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
  const pi = await ctxI.newPage(); await pi.addInitScript(SF_ALLES); await pi.goto(origin + '/index.html#leistungen'); await pi.waitForFunction(() => /Natascha/.test(document.getElementById('legal').textContent), null, { timeout: 5000 }).catch(() => {});
  const legalI = await pi.evaluate(() => document.getElementById('legal').textContent);
  ok('iPhone: Anbieter im Impressum Natascha Cabrerizo y Polo, nicht David', /Anbieter: Natascha Cabrerizo y Polo/.test(legalI.replace(/\s+/g, ' ')) && !/David/.test(legalI), legalI.slice(0, 200));
  if (await pi.isVisible('#schritte .sf-w2')) await pi.click('#schritte .sf-w2');
  await pi.evaluate(() => document.getElementById('p1').click()); await pi.fill('#p-name', 'Test'); await pi.evaluate(() => document.getElementById('mappeMake').click()); await pi.waitForSelector('#mappePrint', { state: 'visible', timeout: 5000 }).catch(() => {});
  ok('iPhone: keine Android-Knöpfe Drucken/Speichern, PDF teilen vorhanden', !(await pi.isVisible('#mappeDruck')) && !(await pi.isVisible('#mappeSpeichern')) && (await pi.isVisible('#mappePrint')));
  await ctxI.close();

  await b.close(); server.close();
  console.log(out.join('\n'));
  const failed = out.filter((l) => l.startsWith('FAIL')).length;
  console.log(failed ? '\n' + failed + ' FEHLER' : '\nApp-Tests bestanden: ' + out.length + ' Prüfungen');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.stack); process.exit(1); });
