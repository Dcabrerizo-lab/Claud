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
  // Widerspruch mit Bescheiddatum: die Frist steht beim Schreiben, eine Liste gibt es nicht
  await p.click('#brief-pk'); await p.fill('#pf-datum', '2026-11-10'); await p.click('#pf-wid-mach');
  ok('Widerspruchsfrist steht beim Schreiben', /14\.12\.2026/.test(await p.textContent('#pf-frist')), await p.textContent('#pf-frist'));
  ok('Nichts als Frist gespeichert', (await p.evaluate(() => localStorage.getItem('lotse.fristen'))) === null);
  await p.click('#briefZurueck');
  // Fremde Sprache: Hinweis „nur auf Deutsch“, Bereiche übersetzt
  await p.selectOption('#lang', 'tr'); await p.click('#appnav [data-ansicht=briefe]'); await p.click('#brief-wg');
  ok('Türkisch: Hinweis, dass die Prüfung nur auf Deutsch ist', await p.isVisible('#ppNurDe'));
  ok('Türkisch: Leiste übersetzt', (await p.textContent('#appnav')).includes('Mektup kontrol'));
  await p.selectOption('#lang', 'de');
  // Auf dem Computer: Reiter oben, ohne seitliches Scrollen
  await p.setViewportSize({ width: 1280, height: 900 }); await p.click('#briefZurueck');
  ok('Computer: Leiste sichtbar und nicht unten fixiert', await p.isVisible('#appnav') && (await p.evaluate(() => getComputedStyle(document.getElementById('appnav')).position)) !== 'fixed');
  ok('Computer: kein seitliches Scrollen', await breit());
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bereiche-Test bestanden: ${n} Prüfungen (Startseite, drei Bereiche, Brief prüfen mit 6 Prüfungen, alte Fristen gelöscht, Sprache, Computer)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
