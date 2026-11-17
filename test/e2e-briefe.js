// Klicktest der Bereiche: Startseite, Brief prüfen (Prüfpaket in der App) und Fristen
// Prüft: jede Kachel öffnet den richtigen Teil, Zurück führt zur Auswahl, Widerspruchsfristen landen in der Fristenliste,
// Fristen bleiben nach dem Neuladen erhalten, Erledigt entfernt sie, kein seitliches Scrollen, keine Skriptfehler, Hinweis bei fremder Sprache.
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
  await p.goto(APP); await p.waitForTimeout(300);
  ok('Ohne Adresszusatz öffnet die Startseite', await p.isVisible('#v-start') && !(await p.isVisible('#v-leistungen')));
  ok('Startseite: keine Fristen, kein Punkt in der Leiste', !(await p.isVisible('#navPunkt')) && (await p.textContent('#startFristen')) === '');
  await p.click('#goLeistungen');
  ok('Weg „Welche Hilfen“ öffnet den Leistungscheck', await p.isVisible('#form') && (await p.evaluate(() => location.hash)) === '#leistungen');
  await p.click('#appnav [data-ansicht=start]'); await p.click('#goBriefe');
  ok('Weg „Brief bekommen“ öffnet die Kacheln', await p.isVisible('#briefKacheln') && (await p.locator('#briefKacheln .kachel').count()) === 6);
  const ERWARTET = { jc: 'p-bescheid', sa: 'p-gsa', wg: 'p-wg', fk: 'p-kiz', pk: 'p-pflege', vm: 'p-nk' };
  for (const [k, teil] of Object.entries(ERWARTET)) {
    await p.click('#brief-' + k);
    const offen = await p.evaluate(() => [...document.querySelectorAll('#checkBox .pp-teil')].filter((s) => !s.hidden).map((s) => s.id));
    ok(`Kachel ${k} öffnet genau ${teil}`, offen.length === 1 && offen[0] === teil, offen);
    ok(`Kachel ${k}: Fokus auf der Überschrift`, await p.evaluate((t) => document.activeElement === document.querySelector('#' + t + ' h2'), teil));
    ok(`Kachel ${k}: kein seitliches Scrollen`, await breit());
    await p.click('#briefZurueck');
    ok(`Kachel ${k}: Zurück zeigt wieder die Auswahl, Fokus auf der Kachel`, await p.isVisible('#briefKacheln') && !(await p.isVisible('#checkBox')) && await p.evaluate((id) => document.activeElement.id === id, 'brief-' + k));
  }
  // Rechnen im eingebetteten Prüfpaket: Beispiel Grundsicherungsgeld zeigt ein Ergebnis
  await p.click('#brief-jc'); await p.click('#p-bescheid >> text=Beispiel laden'); await p.waitForTimeout(100);
  ok('Bescheid-Check rechnet in der App', ((await p.textContent('#p-bescheid')) || '').includes('€'));
  // Nochmal auf „Brief prüfen“ tippen führt zur Auswahl
  await p.click('#appnav [data-ansicht=briefe]');
  ok('Erneutes Tippen auf „Brief prüfen“: zurück zur Auswahl', await p.isVisible('#briefKacheln'));
  // Widerspruch mit Bescheiddatum → Frist in der Liste
  await p.click('#brief-pk'); await p.fill('#pf-datum', '2026-11-10'); await p.click('#pf-wid-mach');
  await p.click('#brief-pk').catch(() => {});
  await p.click('#appnav [data-ansicht=fristen]');
  const titel = () => p.evaluate(() => [...document.querySelectorAll('#fristListe .frist b')].map((x) => x.textContent));
  ok('Widerspruchsfrist Pflegekasse steht in den Fristen', (await titel()).includes('Widerspruch Pflegekasse'), await titel());
  await p.click('#appnav [data-ansicht=briefe]'); await p.click('#pf-wid-mach'); await p.click('#appnav [data-ansicht=fristen]');
  ok('Gleiche Frist wird nicht doppelt eingetragen', (await titel()).filter((x) => x === 'Widerspruch Pflegekasse').length === 1, await titel());
  // Eigene Frist, Fehlermeldung bei fehlendem Datum
  await p.click('#fristNeu summary'); await p.fill('#fristTitel', 'Unterlagen Jobcenter'); await p.click('#fristAdd');
  ok('Ohne Datum: Hinweis statt Eintrag', (await p.textContent('#fristMsg')).length > 0 && !(await titel()).includes('Unterlagen Jobcenter'));
  await p.fill('#fristDatum', '2020-01-01'); await p.click('#fristAdd');
  ok('Vergangene Frist wird als vorbei markiert', await p.locator('#fristListe .frist.vorbei').count() === 1);
  ok('Punkt in der Leiste bei naher oder vergangener Frist', await p.isVisible('#navPunkt'));
  ok('Fristen nach Datum sortiert', (await titel())[0] === 'Unterlagen Jobcenter', await titel());
  // Rechner im Fristenbereich
  await p.click('#fristRechner summary'); await p.fill('#fr-datum', '2026-11-16'); await p.dispatchEvent('#fr-datum', 'input');
  await p.click('#fr-merken');
  ok('Fristrechner übernimmt die Widerspruchsfrist', (await titel()).includes('Widerspruch einlegen'), await titel());
  // Startseite zeigt die nächsten offenen Fristen (höchstens zwei, keine vergangenen)
  await p.click('#appnav [data-ansicht=start]');
  const start = await p.evaluate(() => [...document.querySelectorAll('#startFristen .frist b')].map((x) => x.textContent));
  ok('Startseite: höchstens zwei offene Fristen, keine vergangene', start.length === 2 && !start.includes('Unterlagen Jobcenter'), start);
  // Neuladen: Fristen bleiben, Erledigt entfernt
  await p.reload(); await p.waitForTimeout(300);
  await p.click('#appnav [data-ansicht=fristen]');
  ok('Fristen bleiben nach dem Neuladen', (await titel()).length === 3, await titel());
  await p.click('#fristListe .frist >> nth=0 >> button');
  ok('Erledigt entfernt die Frist', (await titel()).length === 2 && !(await titel()).includes('Unterlagen Jobcenter'), await titel());
  ok('Fristenbereich: kein seitliches Scrollen', await breit());
  // Fremde Sprache: Hinweis „nur auf Deutsch“, Bereiche übersetzt
  await p.selectOption('#lang', 'tr'); await p.click('#appnav [data-ansicht=briefe]'); await p.click('#brief-wg');
  ok('Türkisch: Hinweis, dass die Prüfung nur auf Deutsch ist', await p.isVisible('#ppNurDe'));
  ok('Türkisch: Leiste übersetzt', (await p.textContent('#appnav')).includes('Süreler'));
  await p.selectOption('#lang', 'de');
  // Auf dem Computer: Reiter oben, ohne seitliches Scrollen
  await p.setViewportSize({ width: 1280, height: 900 }); await p.click('#briefZurueck');
  ok('Computer: Leiste sichtbar und nicht unten fixiert', await p.isVisible('#appnav') && (await p.evaluate(() => getComputedStyle(document.getElementById('appnav')).position)) !== 'fixed');
  ok('Computer: kein seitliches Scrollen', await breit());
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bereiche-Test bestanden: ${n} Prüfungen (Startseite, Brief prüfen mit 6 Prüfungen, Fristen, Neuladen, Sprache, Computer)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
