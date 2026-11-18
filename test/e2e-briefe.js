// Klicktest der Bereiche: Startseite, Leistungen und Brief prüfen (Prüfpaket in der App)
// Prüft: drei Bereiche (keine Fristen mehr), jede Kachel öffnet den richtigen Teil, Zurück führt zur Auswahl, Widerspruchsfrist steht im Schreiben,
// alte gespeicherte Fristen werden gelöscht, kein seitliches Scrollen, keine Skriptfehler, Hinweis bei fremder Sprache.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' });
  const p = await ctx.newPage();
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  const breit = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  // Gespeicherte Fristen aus Build 141 liegen noch im Speicher: Die App löscht sie beim Start
  await p.addInitScript(() => { try { if (!sessionStorage.getItem('erster')) { localStorage.setItem('lotse.fristen', '[{"titel":"Alt","datum":"2026-12-01"}]'); sessionStorage.setItem('erster', '1'); } } catch (e) {} });
  await p.goto(APP); await p.waitForTimeout(300);
  ok('Ohne Adresszusatz öffnet die Startseite', await p.isVisible('#v-start') && !(await p.isVisible('#v-leistungen')));
  ok('Drei Bereiche, keine Fristen', (await p.locator('#appnav button').count()) === 3 && (await p.locator('#v-fristen, [data-ansicht=fristen], #startFristen').count()) === 0);
  ok('Alte gespeicherte Fristen werden gelöscht', (await p.evaluate(() => localStorage.getItem('lotse.fristen'))) === null);
  await p.goto(APP + '#fristen'); await p.waitForTimeout(200);
  ok('Alter Link #fristen führt zur Startseite', await p.isVisible('#v-start'));
  await p.click('#goLeistungen');
  ok('Weg „Welche Hilfen“ öffnet den Leistungscheck', await p.isVisible('#form') && (await p.evaluate(() => location.hash)) === '#leistungen');
  await p.click('#appnav [data-ansicht=start]'); await p.click('#goBriefe');
  ok('Weg „Brief bekommen“ öffnet die Kacheln', await p.isVisible('#briefKacheln') && (await p.locator('#briefKacheln .kachel').count()) === 7);
  const ERWARTET = { jc: 'p-bescheid', sa: 'p-gsa', wg: 'p-wg', fk: 'p-kiz', pk: 'p-pflege', vm: 'p-nk' };
  for (const [k, teil] of Object.entries(ERWARTET)) {
    await p.click('#brief-' + k);
    const offen = await p.evaluate(() => [...document.querySelectorAll('#checkBox .pp-teil')].filter((s) => !s.hidden).map((s) => s.id));
    ok(`Kachel ${k} öffnet genau ${teil}`, offen.length === 1 && offen[0] === teil, offen);
    ok(`Kachel ${k}: Fokus auf der Überschrift`, await p.evaluate((t) => document.activeElement === document.querySelector('#' + t + ' h2'), teil));
    ok(`Kachel ${k}: kein seitliches Scrollen`, await breit());
    ok(`Kachel ${k}: oben steht die gewählte Stelle, nicht „Von wem ist der Brief?“`, /^Brief von: /.test(await p.textContent('#h-briefe')), await p.textContent('#h-briefe'));
    ok(`Kachel ${k}: erst die Wahl (scannen, einfügen, selbst eingeben), Formular noch zu`, await p.isVisible('#elScan') && await p.isVisible('#elPaste') && await p.isVisible('#elSelbst') && !(await p.isVisible('#' + teil + ' form, #' + teil + ' > .card:nth-child(2)')));
    ok(`Kachel ${k}: Wahl steht unter der Erklärung des Abschnitts`, await p.evaluate((t) => document.querySelector('#' + t + ' > .card:first-child #einlesen') !== null, teil));
    ok(`Kachel ${k}: kein „Beispiel laden“ in der App`, !(await p.isVisible('#' + teil + ' [id$="-beispiel"]')));
    await p.click('#elSelbst');
    ok(`Kachel ${k}: „Werte selbst eingeben“ öffnet das Formular`, await p.isVisible('#' + teil + ' > :nth-child(2)') && !(await p.isVisible('#elSelbst')));
    await p.click('#briefZurueck');
    ok(`Kachel ${k}: Zurück zeigt wieder die Auswahl, Fokus auf der Kachel`, await p.isVisible('#briefKacheln') && !(await p.isVisible('#checkBox')) && await p.evaluate((id) => document.activeElement.id === id, 'brief-' + k));
  }
  // Rechnen im eingebetteten Prüfpaket: Beispiel Grundsicherungsgeld zeigt ein Ergebnis
  await p.click('#brief-jc');
  ok('Einmal geöffnet: beim nächsten Mal ist das Formular gleich offen (Eingaben bleiben)', await p.isVisible('#p-bescheid > :nth-child(2)') && !(await p.isVisible('#elSelbst')));
  if (await p.isVisible('#elSelbst')) await p.click('#elSelbst'); await p.evaluate(() => document.querySelector('#p-bescheid [id$="-beispiel"]').click()); await p.waitForTimeout(100);
  ok('Bescheid-Check rechnet in der App', ((await p.textContent('#p-bescheid')) || '').includes('€'));
  // Nochmal auf „Brief prüfen“ tippen führt zur Auswahl
  await p.click('#appnav [data-ansicht=briefe]');
  ok('Erneutes Tippen auf „Brief prüfen“: zurück zur Auswahl', await p.isVisible('#briefKacheln'));
  // Widerspruch mit Bescheiddatum: die Frist steht beim Schreiben, eine Liste gibt es nicht
  await p.click('#brief-pk');
  ok('Pflegekasse: kein zweites Textfeld „Text aus dem Gutachten“', !(await p.isVisible('#pf-text')) && !(await p.isVisible('#pf-lesen')));
  if (await p.isVisible('#elSelbst')) await p.click('#elSelbst'); await p.fill('#pf-datum', '2026-11-10'); await p.click('#pf-wid-mach');
  ok('Widerspruchsfrist steht beim Schreiben', /14\.12\.2026/.test(await p.textContent('#pf-frist')), await p.textContent('#pf-frist'));
  ok('Nichts als Frist gespeichert', (await p.evaluate(() => localStorage.getItem('lotse.fristen'))) === null);
  await p.click('#briefZurueck');
  // Brief einlesen gibt es nur in den Kacheln: Text einfügen → Werte gelb markiert, Personen aus „Leistungen“
  await p.click('#appnav [data-ansicht=leistungen]'); await p.click('#p1'); await p.click('#appnav [data-ansicht=briefe]');
  ok('Übersicht „Von wem ist der Brief?“: nur Kacheln, kein Scannen, Einfügen oder PDF', await p.isVisible('#briefKacheln') && !(await p.isVisible('#einlesen')) && !(await p.isVisible('#elScan')) && !(await p.isVisible('#elPdf')));
  await p.click('#brief-jc'); await p.click('#elPaste');
  await p.fill('#elText', 'Jobcenter Musterstadt\nDatum: 12.03.2026\nGrundsicherungsgeld nach dem SGB II\nRegelbedarf 563,00 357,00 920,00\nKosten der Unterkunft und Heizung 755,00\nZahlbetrag 1.501,33');
  await p.click('#elLesen');
  ok('Eingefügter Jobcenter-Bescheid: Formular offen', await p.isVisible('#p-bescheid > :nth-child(2)'));
  ok('Werte übernommen und markiert', (await p.inputValue('#bs-b-regel')) === '920' && (await p.inputValue('#bs-b-zahl')) === '1501.33' && await p.evaluate(() => document.getElementById('bs-b-kdu').classList.contains('pp-erkannt')));
  ok('Datum des Bescheids übernommen', (await p.inputValue('#bs-datum')) === '2026-03-12');
  ok('Haushalt aus „Leistungen“: 1 Erwachsener, 2 Kinder', (await p.locator('#bs-personen tr').count()) === 3);
  ok('Meldung nennt Absender und Zahl der Werte', /Jobcenter.*4 Werte/.test(await p.textContent('#elMsg')), await p.textContent('#elMsg'));
  ok('Einlesen sitzt in der geöffneten Prüfung', await p.evaluate(() => document.getElementById('checkBox').contains(document.getElementById('einlesen'))) && /Diesen Brief/.test(await p.textContent('#elScan')));
  await p.click('#briefZurueck');
  // Wohngeld
  await p.click('#brief-wg'); if (!(await p.isVisible('#elText'))) await p.click('#elPaste');
  await p.fill('#elText', 'Wohngeldbehörde\nWohngeld in Höhe von 214,00 EUR monatlich\nzu berücksichtigende Miete 702,00 €\nmonatliches Gesamteinkommen 1.845,20 €'); await p.click('#elLesen');
  ok('Wohngeld in der Kachel gelesen', (await p.inputValue('#wg-b-wg')) === '214' && (await p.inputValue('#wg-b-eink')) === '1845.2');
  await p.click('#briefZurueck');
  // Nebenkosten: Posten als Zeilen
  await p.click('#brief-vm'); if (!(await p.isVisible('#elText'))) await p.click('#elPaste');
  await p.fill('#elText', 'Betriebskostenabrechnung 2025\nAbrechnungszeitraum: 01.01.2025 bis 31.12.2025\nGrundsteuer 2.400,00 Wohnfläche 240,00\nHausmeister 3.000,00 Wohnfläche 300,00\nIhre Vorauszahlungen gesamt 1.800,00'); await p.click('#elLesen');
  ok('Nebenkosten: zwei Posten, Zeitraum', (await p.locator('#nk-posten tr').count()) === 2 && (await p.inputValue('#nk-von')) === '2025-01-01');
  await p.click('#briefZurueck');
  // Aufforderung zur Mitwirkung in der Kachel Jobcenter: Erklärung mit Frist statt Rechnung
  await p.click('#brief-jc'); if (!(await p.isVisible('#elText'))) await p.click('#elPaste');
  await p.fill('#elText', 'Mitwirkungspflichten nach § 60 SGB I\nBitte reichen Sie folgende Unterlagen bis zum 15.05.2026 ein.'); await p.click('#elLesen');
  ok('Mitwirkung in der Kachel: Erklärung mit Frist', /Unterlagen/.test(await p.textContent('#elErg')) && /15\.05\.2026/.test(await p.textContent('#elErg')));
  await p.click('#briefZurueck');
  // Antragsformular: Kachel zeigt die Formular-Erklärung, Einlesen ist dort nicht doppelt
  await p.click('#brief-af');
  ok('Kachel Antragsformular zeigt das Formular-Scannen', await p.isVisible('#scan') && !(await p.isVisible('#einlesen')));
  ok('Antragsformular: großer Foto-Knopf statt Dateifeld', await p.isVisible('#scan .sc-foto') && (await p.getAttribute('#sc-file', 'class')).includes('vh'));
  const FORMULAR = 'Antrag auf Wohngeld\n1. Angaben zur antragstellenden Person\nFamilienname, Vorname\nGeburtsdatum\nIBAN\n2. Haushaltsmitglieder\nFamilienstand\n3. Wohnkosten\nGesamtmiete monatlich\nHeizkosten\nWohnfläche in m²\n4. Einkommen\nRenten\nKrankenkasse\nStaatsangehörigkeit\nOrt, Datum, Unterschrift';
  await p.fill('#sc-text', FORMULAR); await p.click('#sc-local');
  const out = await p.textContent('#sc-out');
  ok('Antragsformular: Name des Formulars erkannt', /Erkannt: Antrag auf Wohngeld/.test(out), out.slice(0, 200));
  ok('Antragsformular: kein Feld geht verloren (Heizkosten, Wohnfläche, Familienstand, Renten)', ['Heizkosten', 'Wohnfläche in m²', 'Familienstand', 'Renten', 'Krankenkasse', 'Staatsangehörigkeit'].every((x) => out.includes(x)));
  ok('Antragsformular: Nummerierung wird weggelassen', !/\b2\. Haushaltsmitglieder/.test(out) && out.includes('Haushaltsmitglieder'));
  ok('Antragsformular: zusammengehörige Felder in einer Karte', (await p.locator('#sc-out .sc-row:has-text("Heizkosten") .sc-labs li').count()) === 3);
  ok('Mit Leistungscheck: Werte zum Abschreiben (Miete 950 €), kein leeres „0 €“', /Warmmiete im Monat: 950 €/.test(out) && !/(^|[^\d.,])0 €/.test(out), out.slice(0, 900));
  ok('Antragsformular: kein seitliches Scrollen', await breit());
  await p.click('#briefZurueck');
  await p.click('#appnav [data-ansicht=leistungen]');
  ok('Leistungsseite: kein Formular-Scannen und kein Verweis darauf', !(await p.isVisible('#scan')) && (await p.locator('#v-leistungen #scanVerweis, #v-leistungen #scan, #v-leistungen [data-t^="sc."]').count()) === 0);
  // Fremde Sprache: Hinweis „nur auf Deutsch“, Bereiche übersetzt
  await p.selectOption('#lang', 'tr'); await p.click('#appnav [data-ansicht=briefe]'); await p.click('#brief-wg');
  ok('Türkisch: Hinweis, dass die Prüfung nur auf Deutsch ist', await p.isVisible('#ppNurDe'));
  ok('Türkisch: Leiste übersetzt', (await p.textContent('#appnav')).includes('Mektup kontrol'));
  await p.click('#briefZurueck'); await p.selectOption('#lang', 'de');
  // Auf dem Computer: Reiter oben, ohne seitliches Scrollen
  await p.setViewportSize({ width: 1280, height: 900 });
  ok('Computer: Leiste sichtbar und nicht unten fixiert', await p.isVisible('#appnav') && (await p.evaluate(() => getComputedStyle(document.getElementById('appnav')).position)) !== 'fixed');
  ok('Computer: kein seitliches Scrollen', await breit());
  // Ganz ohne Leistungscheck (neues Gerät): keine erfundenen Werte, sondern ein Tipp
  const ctx2 = await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' }); const q = await ctx2.newPage();
  await q.goto(APP + '#briefe'); await q.waitForTimeout(300); await q.click('#brief-af');
  await q.fill('#sc-text', 'Antrag auf Wohngeld\nGesamtmiete monatlich\nEinkommen\nVermögen\nHaushaltsmitglieder'); await q.click('#sc-local');
  const leer = await q.textContent('#sc-out');
  ok('Ohne Leistungscheck: kein „0 €“, keine Haushaltszeile, aber Tipp', !/€/.test(leer) && !/Erwachsene/.test(leer) && /Leistungscheck/.test(leer), leer.slice(0, 400));
  await ctx2.close();
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bereiche-Test bestanden: ${n} Prüfungen (Startseite, drei Bereiche, Brief prüfen mit 6 Prüfungen, alte Fristen gelöscht, Sprache, Computer)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
