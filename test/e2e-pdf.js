// Klicktest: PDF wählen bei „Brief prüfen“ (Web-Version). Digitales PDF: Text wird direkt gelesen, Absender erkannt, Werte übernommen.
// pdf.js kommt im Browser von cdnjs (mit Prüfsumme); im Test liefert eine Weiterleitung dieselbe Version aus app/node_modules (gleiche Datei, kein Netz nötig).
// Eingescannte PDFs (Seite als Bild → Texterkennung) prüft test/app-test.js mit der Texterkennung der App.
'use strict';
const { chromium } = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
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
  const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' })).newPage(); await p.addInitScript(SF_ALLES);
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message));
  let geladen = 0;
  await p.route('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/**', (r) => { geladen++; const name = r.request().url().split('/').pop(); r.fulfill({ path: path.join(PDFJS, name), contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' } }); });
  await p.goto(APP + '#briefe'); await p.waitForTimeout(300);
  ok('Übersicht ohne PDF-Knopf', !(await p.isVisible('#elPdf')));
  await p.click('#brief-jc');
  ok('In der Kachel: Knopf „PDF wählen“', await p.isVisible('#elPdf'));
  ok('pdf.js wird erst bei Bedarf geladen', geladen === 0);
  await p.setInputFiles('#elPdfFile', jc);
  await p.waitForFunction(() => /Werte|keine/.test(document.getElementById('elMsg').textContent), null, { timeout: 30000 }).catch(() => {});
  ok('Digitales PDF: Jobcenter-Bescheid gelesen', /Jobcenter/.test(await p.textContent('#elMsg')), await p.textContent('#elMsg'));
  ok('Digitales PDF: Beträge übernommen', (await p.inputValue('#bs-b-regel')) === '920' && (await p.inputValue('#bs-b-zahl')) === '1501.33' && (await p.inputValue('#bs-datum')) === '2026-03-12');
  ok('Digitales PDF: Formular nach dem Einlesen offen', await p.isVisible('#p-bescheid > :nth-child(2)'));
  ok('pdf.js aus der festen Version 3.11.174 geladen (Programm und Worker)', geladen >= 2, geladen);
  await p.click('#briefZurueck'); await p.click('#brief-wg');
  await p.setInputFiles('#elPdfFile', kaputt);
  await p.waitForFunction(() => /nicht lesen/.test(document.getElementById('elMsg').textContent), null, { timeout: 30000 }).catch(() => {});
  ok('Keine PDF-Datei: verständliche Meldung', /Passwort/.test(await p.textContent('#elMsg')), await p.textContent('#elMsg'));
  await p.click('#briefZurueck');
  await p.click('#brief-ab'); await p.click('#brief-af');
  ok('Antragsformular: Knopf „PDF-Datei wählen“', await p.isVisible('label[for=sc-pdf]'));
  await p.setInputFiles('#sc-pdf', form);
  await p.waitForFunction(() => document.getElementById('sc-out').textContent.length > 20, null, { timeout: 30000 }).catch(() => {});
  const out = await p.textContent('#sc-out');
  ok('Antragsformular aus PDF: Formularname und Felder erklärt', /Erkannt: Antrag auf Wohngeld/.test(out) && /Heizkosten/.test(out) && /Krankenkasse/.test(out), out.slice(0, 300));
  ok('Antragsformular aus PDF: Vorschau der Seite über der Liste', (await p.locator('#sc-out .sc-vorschau .sc-bild img').count()) >= 1);
  // PDF mit Fax-Bild (CCITT, übliches Format von Schwarz-Weiß-Scans): pdf.js 3.11.174 hat den Dekoder im Programm (pdf.js 6 bräuchte
  // Zusatzdateien, sonst bliebe das Bild weiß; Prüfung PR 138). Das PDF hat auch digitalen Text: so braucht der Test keine Texterkennung aus dem Netz.
  const dunkel = () => p.evaluate(async () => {
    const im = document.querySelector('#sc-out .sc-vorschau .sc-bild img'); if (!im) return -1;
    await im.decode().catch(() => {});
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let z = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 100) z++; return z;
  });
  const nurText = await dunkel(); // Vorschau des rein digitalen Formulars: nur wenige dunkle Punkte (Schrift)
  await p.setInputFiles('#sc-pdf', path.join(__dirname, 'daten', 'text-ccitt.pdf'));
  let mitBild = -1;
  for (let i = 0; i < 60 && !(mitBild > 4000); i++) { await p.waitForTimeout(500); mitBild = await dunkel().catch(() => -1); } // neue Vorschau abwarten
  ok('PDF mit Fax-Bild: Bild in der Vorschau sichtbar (nicht weiß)', mitBild > 4000 && mitBild > nurText * 2, { mitBild, nurText });
  ok('Kein seitliches Scrollen', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `PDF-Test bestanden: ${n} Prüfungen (digitales PDF beim Einlesen und beim Antragsformular, kaputte Datei)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
