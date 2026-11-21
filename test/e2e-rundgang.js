// Fester Rundgang: besucht jeden Bereich, den der Zufalls-Klicktest erreichen muss, einmal gezielt – Start, ausführliche Version
// mit Ergebniskarten, einfache Version, Antragsmappe, Mein Ordner, Einstellungen – und prüft dort dasselbe wie der Zufallstest:
// keine Skriptfehler, nichts Kaputtes auf dem Bildschirm (NaN, undefined, {platzhalter}), kein seitliches Scrollen,
// in der einfachen Version eine Frage oder ein Ergebnis, in der ausführlichen Version Karten.
// Grund: Der Zufalls-Klicktest meldete oft „erreicht nicht alle Bereiche“, wenn sich die Navigation änderte (Zufallsweg, kein
// App-Fehler). Die Pflichtbesuche stehen jetzt hier fest; im PR-Lauf warnt der Zufallstest bei zu wenig Abdeckung nur noch.
// Aufruf: node test/e2e-rundgang.js (BROWSER=firefox|webkit für andere Browser)
'use strict';
const pw = require('playwright');
const path = require('path');
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
let n = 0, fails = 0;
const ok = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL [rundgang] ' + name + (x === undefined ? '' : ' -> ' + String(x).slice(0, 300))); } };

(async () => {
  const b = await pw[process.env.BROWSER || 'chromium'].launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'de-DE' });
  const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
  const fehler = [];
  p.on('pageerror', (e) => fehler.push('Skriptfehler: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR_FILE_NOT_FOUND/.test(m.text())) fehler.push('Konsole: ' + m.text().slice(0, 200)); });
  p.on('dialog', (d) => d.dismiss().catch(() => {}));
  const zustand = () => p.evaluate(() => {
    const vis = (el) => !!el && el.offsetParent !== null && !el.closest('[hidden]');
    const text = document.body.innerText;
    const m = text.match(/\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|\{[a-zA-Z]\w*\}/);
    return {
      ansicht: document.getElementById('app') && document.getElementById('app').getAttribute('data-ansicht'),
      esModus: vis(document.querySelector('#es-raus')), esInhalt: !!document.querySelector('.es-wahl, #es-weiter, .es-ergebnis, .es-karte'),
      karten: document.querySelectorAll('#cards .card').length, mappe: vis(document.getElementById('mappe')),
      breite: document.documentElement.scrollWidth - window.innerWidth, kaputt: m ? text.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, ' ') : '',
    };
  });
  const bereich = async (name, bedingung) => {
    await p.waitForTimeout(250);
    const z = await zustand();
    ok(name + ': erreicht', bedingung(z), JSON.stringify(z));
    ok(name + ': nichts Kaputtes auf dem Bildschirm', !z.kaputt, z.kaputt);
    ok(name + ': kein seitliches Scrollen', z.breite <= 2, z.breite + ' px');
    ok(name + ': keine Skript- oder Konsolenfehler', !fehler.length, fehler.splice(0).join(' | '));
    return z;
  };
  const schliessen = async () => {
    await p.evaluate(() => { if (window.Suche && Suche.offen && Suche.offen()) Suche.schliessen(false); });
    for (const zu of ['#mappeClose', '#legalClose']) if (await p.isVisible(zu)) await p.click(zu, { timeout: 2000 });
  };
  const zuLeistungen = async () => { await schliessen(); await p.evaluate(() => { const s = document.querySelector('#appnav [data-ansicht=start]'); if (s) s.click(); const g = document.getElementById('goLeistungen'); if (g) g.click(); }); await p.waitForTimeout(150); };

  await p.goto(APP);
  await p.click('#firstOk', { timeout: 3000 }).catch(() => {});
  await bereich('Start', (z) => z.ansicht === 'start');

  // Ausführliche Version mit Beispiel: Ergebniskarten
  await zuLeistungen();
  if (await p.locator('#es-raus').first().isVisible()) await p.locator('#es-raus').first().click({ timeout: 2000 });
  await p.evaluate(() => document.getElementById('p1').click()).catch(() => {});
  if (await p.isVisible('#beispielJa')) await p.click('#beispielJa', { timeout: 2000 });
  await bereich('Ausführliche Version mit Ergebnis', (z) => z.ansicht === 'leistungen' && !z.esModus && z.karten > 1);

  // Antragsmappe
  await p.evaluate(() => { const c = [...document.querySelectorAll('[data-pick]')]; if (c.length && !c.some((x) => x.checked)) c[0].click(); });
  if (await p.isVisible('#mappeMake')) await p.click('#mappeMake', { timeout: 2000 });
  await bereich('Antragsmappe', (z) => z.mappe);
  await schliessen();

  // Einfache Version: eine Frage oder ein Ergebnis
  await zuLeistungen();
  await p.evaluate(() => document.getElementById('einfachBtn').click());
  await bereich('Einfache Version', (z) => z.esModus && z.esInhalt);
  // ein paar Schritte darin: erste Antwort wählen (oder weiter), danach weiter eine Frage oder ein Ergebnis
  for (let i = 0; i < 3; i++) {
    await p.evaluate(() => { const w = document.querySelector('.es-wahl button, .es-wahl input, #es-weiter'); if (w) w.click(); });
    await p.waitForTimeout(150);
  }
  await bereich('Einfache Version nach 3 Antworten', (z) => z.esModus && z.esInhalt);
  await p.locator('#es-raus').first().click({ timeout: 2000 }).catch(() => {});

  // Mein Ordner und Einstellungen über die Leiste unten
  await schliessen();
  await p.evaluate(() => document.querySelector('#appnav [data-ansicht=ordner]').click());
  await bereich('Mein Ordner', (z) => z.ansicht === 'ordner');
  await p.evaluate(() => document.querySelector('#appnav [data-ansicht=einst]').click());
  await bereich('Einstellungen', (z) => z.ansicht === 'einst');

  await b.close();
  if (fails) { console.log(fails + ' von ' + n + ' Prüfungen FEHLGESCHLAGEN (Rundgang)'); process.exit(1); }
  console.log('[rundgang] Fester Rundgang bestanden: ' + n + ' Prüfungen (Start, ausführlich mit Karten, Antragsmappe, einfache Version, Mein Ordner, Einstellungen)');
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
