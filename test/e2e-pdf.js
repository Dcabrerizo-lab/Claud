// Klicktest: PDF wählen bei „Brief prüfen“ (Web-Version). Digitales PDF: Text wird direkt gelesen, Absender erkannt, Werte übernommen.
// pdf.js kommt im Browser von cdnjs; im Test liefert eine Weiterleitung dieselbe Version aus app/node_modules (gleiche Datei, kein Netz nötig).
// Eingescannte PDFs (Seite als Bild → Texterkennung) prüft test/app-test.js mit der Texterkennung der App.
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const { digital } = require('./hilfe-pdf');
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
const PDFJS = path.join(__dirname, '..', 'app', 'node_modules', 'pdfjs-dist', 'build');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'solo-pdf-'));
  const jc = path.join(tmp, 'bescheid.pdf'), form = path.join(tmp, 'formular.pdf'), kaputt = path.join(tmp, 'kaputt.pdf');
  fs.writeFileSync(jc, await digital(['Jobcenter Musterstadt', 'Datum: 12.03.2026', 'Grundsicherungsgeld nach dem SGB II', 'Regelbedarf 563,00 357,00 920,00', 'Kosten der Unterkunft und Heizung 755,00', 'Zahlbetrag 1.501,33'], 3));
  fs.writeFileSync(form, await digital(['Antrag auf Wohngeld', '1. Familienname, Vorname', 'Geburtsdatum', '3. Gesamtmiete monatlich', 'Heizkosten', 'Krankenkasse', 'Ort, Datum, Unterschrift']));
  fs.writeFileSync(kaputt, 'Das ist kein PDF.');
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' })).newPage();
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message));
  let geladen = 0;
  await p.route('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/**', (r) => { geladen++; const name = r.request().url().split('/').pop(); r.fulfill({ path: path.join(PDFJS, name), contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' } }); });
  await p.goto(APP + '#briefe'); await p.waitForTimeout(300);
  ok('Knopf „PDF wählen“ beim Einlesen', await p.isVisible('#elPdf'));
  ok('pdf.js wird erst bei Bedarf geladen', geladen === 0);
  await p.setInputFiles('#elPdfFile', jc);
  await p.waitForFunction(() => /Werte|keine/.test(document.getElementById('elMsg').textContent), null, { timeout: 30000 }).catch(() => {});
  ok('Digitales PDF: Jobcenter erkannt, Prüfung geöffnet', await p.isVisible('#p-bescheid'), await p.textContent('#elMsg'));
  ok('Digitales PDF: Beträge übernommen', (await p.inputValue('#bs-b-regel')) === '920' && (await p.inputValue('#bs-b-zahl')) === '1501.33' && (await p.inputValue('#bs-datum')) === '2026-03-12');
  ok('Digitales PDF: Formular nach dem Einlesen offen', await p.isVisible('#p-bescheid > :nth-child(2)'));
  ok('pdf.js aus der festen Version 3.11.174 geladen', geladen >= 1);
  await p.click('#briefZurueck');
  await p.setInputFiles('#elPdfFile', kaputt);
  await p.waitForFunction(() => /nicht lesen/.test(document.getElementById('elMsg').textContent), null, { timeout: 30000 }).catch(() => {});
  ok('Keine PDF-Datei: verständliche Meldung', /Passwort/.test(await p.textContent('#elMsg')), await p.textContent('#elMsg'));
  await p.click('#brief-af');
  ok('Antragsformular: Knopf „PDF-Datei wählen“', await p.isVisible('label[for=sc-pdf]'));
  await p.setInputFiles('#sc-pdf', form);
  await p.waitForFunction(() => document.getElementById('sc-out').textContent.length > 20, null, { timeout: 30000 }).catch(() => {});
  const out = await p.textContent('#sc-out');
  ok('Antragsformular aus PDF: Formularname und Felder erklärt', /Erkannt: Antrag auf Wohngeld/.test(out) && /Heizkosten/.test(out) && /Krankenkasse/.test(out), out.slice(0, 300));
  ok('Kein seitliches Scrollen', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `PDF-Test bestanden: ${n} Prüfungen (digitales PDF beim Einlesen und beim Antragsformular, kaputte Datei)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
