// Zufalls-Klicktest: Ein Programm bedient die App im Browser tausendfach zufällig (Felder füllen und leeren, Auswahlen,
// Haken, Zähler, Beispiele, Sprache, große Schrift, einfache und ausführliche Version, Antragsmappe, Neuladen) und prüft
// nach jedem Schritt: keine Skriptfehler, nichts Kaputtes auf dem Bildschirm (NaN, undefined, {platzhalter}), kein seitliches
// Scrollen, in der einfachen Version immer eine Frage oder ein Ergebnis, in der ausführlichen Version Karten oder Startanleitung.
// Aufruf: node test/e2e-zufall.js [Schritte, Standard 1200] (BROWSER=firefox|webkit für andere Browser; ZUFALL_SEED für einen anderen Ablauf)
const pw = require('playwright');
const browserTyp = pw[process.env.BROWSER || 'chromium'];
const path = require('path');
const SCHRITTE = Number(process.argv[2]) || 1200;
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
let seed = Number(process.env.ZUFALL_SEED) || 20261114;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const WERTE = ['0', '1', '450', '603', '604', '1200', '1.234,56', '2,050.50', '99999', '', '  ', 'abc', '-50', '−50', '12.5.2026', '1e9', '780 €', '3500', '600,5'];
const KAPUTT = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|\{[a-zA-Z]\w*\}/;
// Nicht anklicken: Druck, Teilen, Kopieren, Dateiauswahl, Dokument-Scan, externe Links
const VERBOTEN = '#mappePrint, #mappeShare, #mappeCopy, #sc-take, #sc-file, #sc-claude, #sc-local, a[target="_blank"], input[type=file]';

(async () => {
  const b = await browserTyp.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'de-DE' });
  const p = await ctx.newPage();
  const fehler = [];
  const log = [];
  p.on('pageerror', (e) => fehler.push('Skriptfehler: ' + e.message + ' | nach: ' + log.slice(-6).join(' > ')));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR_FILE_NOT_FOUND/.test(m.text())) fehler.push('Konsole: ' + m.text().slice(0, 200) + ' | nach: ' + log.slice(-6).join(' > ')); });
  p.on('dialog', (d) => d.dismiss().catch(() => {}));
  await p.goto(APP);
  await p.click('#firstOk').catch(() => {});

  const zustand = async () => p.evaluate(() => {
    const vis = (el) => !!el && el.offsetParent !== null && !el.closest('[hidden]');
    const es = document.querySelector('.es-wahl, #es-weiter, .es-ergebnis, .es-karte');
    const esModus = !!document.querySelector('#es-raus') && vis(document.querySelector('#es-raus'));
    const text = document.body.innerText;
    return {
      esModus, esInhalt: !!es, karten: document.querySelectorAll('#cards .card').length, mappe: vis(document.getElementById('mappe')),
      legal: vis(document.getElementById('legal')), breite: document.documentElement.scrollWidth - window.innerWidth,
      kaputt: (text.match(/\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|\{[a-zA-Z]\w*\}/) || [''])[0],
      stelle: (() => { const m = text.match(/\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]|\{[a-zA-Z]\w*\}/); return m ? text.slice(Math.max(0, m.index - 50), m.index + 50) : ''; })()
    };
  });

  // Ein zufälliges sichtbares, bedienbares Element
  const ziele = async () => p.evaluate((verboten) => {
    const vis = (el) => el.offsetParent !== null && !el.closest('[hidden]') && !el.disabled && el.getClientRects().length > 0;
    const offen = document.querySelector('#mappe:not([hidden]), #legal:not([hidden])');
    const wurzel = offen || document;
    const els = [...wurzel.querySelectorAll('button, input, select, summary, [role=button]')].filter((el) => vis(el) && !el.matches(verboten));
    return els.map((el, i) => { el.setAttribute('data-zufall', String(i)); return { i, tag: el.tagName.toLowerCase(), typ: el.type || '', id: el.id || '', text: (el.innerText || el.value || '').slice(0, 30), opts: el.tagName === 'SELECT' ? [...el.options].map((o) => o.value) : null }; });
  }, VERBOTEN);

  const besucht = { einfach: 0, ausfuehrlich: 0, mappe: 0, karten: 0 };
  let imEinfach = false;
  for (let s = 0; s < SCHRITTE; s++) {
    let schritt = '';
    try {
      const r = rnd();
      // Feste Besuche, damit jeder Lauf sicher alle Bereiche prüft: einfache Version und Antragsmappe
      if (s % 200 === 50 && !imEinfach) { schritt = 'Einfache Version (fest)'; if (await p.isVisible('#einfachBtn')) await p.click('#einfachBtn', { timeout: 1000 }); }
      else if (s % 200 === 150) { schritt = 'Antragsmappe (fest)'; if (await p.isVisible('#es-raus')) await p.click('#es-raus', { timeout: 1000 }); if (await p.isVisible('#mappeClose')) await p.click('#mappeClose', { timeout: 1000 }); if (await p.isVisible('#mappeMake')) await p.click('#mappeMake', { timeout: 1000 }); }
      else if (r < 0.01) { schritt = 'Neu laden'; await p.reload(); await p.click('#firstOk', { timeout: 500 }).catch(() => {}); }
      else if (r < 0.045 && !imEinfach) { schritt = 'Einfache Version'; if (await p.isVisible('#einfachBtn')) await p.click('#einfachBtn', { timeout: 1000 }); }
      else if (r < 0.055) { schritt = 'Antragsmappe'; if (await p.isVisible('#mappeMake')) await p.click('#mappeMake', { timeout: 1000 }); }
      else if (r < 0.06) { const l = pick(['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro']); schritt = 'Sprache ' + l; if (await p.isVisible('#lang')) await p.selectOption('#lang', l); }
      else {
        const zs = await ziele();
        if (!zs.length) { schritt = 'nichts bedienbar'; fehler.push('Sackgasse: kein bedienbares Element | nach: ' + log.slice(-6).join(' > ')); break; }
        // In der einfachen Version länger bleiben: „zur ausführlichen Version“ nur selten wählen, sonst bleibt sie kaum geprüft
        let z = pick(zs);
        for (let k = 0; k < 5 && imEinfach && (z.id === 'es-raus' || z.id === 'einfachBtn') && rnd() < 0.85; k++) z = pick(zs);
        const sel = '[data-zufall="' + z.i + '"]';
        if (z.tag === 'select') { const v = pick(z.opts); schritt = 'Auswahl ' + (z.id || '?') + '=' + v; await p.selectOption(sel, v, { timeout: 1000 }); }
        else if (z.tag === 'input' && (z.typ === 'text' || z.typ === 'number' || z.typ === 'tel' || z.typ === '')) { const v = pick(WERTE); schritt = 'Eingabe ' + (z.id || '?') + '="' + v + '"'; await p.fill(sel, v, { timeout: 1000 }); await p.press(sel, 'Tab', { timeout: 1000 }).catch(() => {}); }
        else { schritt = 'Klick ' + z.tag + ' ' + (z.id || '') + ' „' + z.text.trim() + '“'; await p.click(sel, { timeout: 1000 }); }
      }
    } catch (e) { /* Element verschwand zwischendurch: kein Fehler der App */ }
    log.push(schritt);
    await p.waitForTimeout(20);
    const z = await zustand();
    if (process.env.ZUFALL_DEBUG && z.esModus !== imEinfach) console.log(s, z.esModus ? 'rein' : 'raus', schritt);
    imEinfach = z.esModus;
    if (z.esModus) besucht.einfach++; else besucht.ausfuehrlich++;
    if (z.mappe) besucht.mappe++;
    if (z.karten > 1) besucht.karten++;
    if (z.kaputt) fehler.push('Kaputte Anzeige „' + z.kaputt + '“: …' + z.stelle.replace(/\s+/g, ' ') + '… | nach: ' + log.slice(-6).join(' > '));
    if (z.breite > 2) fehler.push('Seitliches Scrollen (' + z.breite + ' px) | nach: ' + log.slice(-6).join(' > '));
    if (z.esModus && !z.esInhalt && !z.mappe && !z.legal) fehler.push('Einfache Version ohne Frage und ohne Ergebnis | nach: ' + log.slice(-6).join(' > '));
    if (!z.esModus && !z.mappe && !z.legal && z.karten === 0) fehler.push('Ausführliche Version ohne Karten und ohne Startanleitung | nach: ' + log.slice(-6).join(' > '));
    if (fehler.length >= 5) break;
  }
  await b.close();
  if (fehler.length) { console.log('FEHLER Zufalls-Klicktest (Startwert ' + (Number(process.env.ZUFALL_SEED) || 20261114) + '):'); [...new Set(fehler)].slice(0, 5).forEach((f) => console.log('- ' + f)); process.exit(1); }
  if (besucht.einfach < SCHRITTE / 20 || !besucht.mappe || !besucht.karten) { console.log('FEHLER Zufalls-Klicktest erreicht nicht alle Bereiche: ' + JSON.stringify(besucht)); process.exit(1); }
  console.log('[zufall-klick] Zufalls-Klicktest bestanden: ' + SCHRITTE + ' zufällige Bedienschritte ohne Skriptfehler, kaputte Anzeige, seitliches Scrollen oder Sackgasse (Schritte in der einfachen Version ' + besucht.einfach + ', mit Ergebniskarten ' + besucht.karten + ', in der Antragsmappe ' + besucht.mappe + ')');
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
