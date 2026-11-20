// Zufalls-Klicktest: Ein Programm bedient die App im Browser tausendfach zufällig (Felder füllen und leeren, Auswahlen,
// Haken, Zähler, Beispiele, Sprache, große Schrift, einfache und ausführliche Version, Antragsmappe, Neuladen) und prüft
// nach jedem Schritt: keine Skriptfehler, nichts Kaputtes auf dem Bildschirm (NaN, undefined, {platzhalter}), kein seitliches
// Scrollen, in der einfachen Version immer eine Frage oder ein Ergebnis, in der ausführlichen Version Karten oder Startanleitung.
// Aufruf: node test/e2e-zufall.js [Schritte, Standard 1200] (BROWSER=firefox|webkit für andere Browser; ZUFALL_SEED für einen anderen Ablauf)
const pw = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
const browserTyp = pw[process.env.BROWSER || 'chromium'];
const path = require('path');
// SHARD=k/n: jeder Teil macht ein n-tel der Schritte mit eigenem Startwert (zusammen gleicher Umfang)
const SHARD = require('./shard.js');
const GESAMT = Number(process.argv[2]) || 1200;
const SCHRITTE = Math.ceil(GESAMT / SHARD.anzahl);
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
const START = (Number(process.env.ZUFALL_SEED) || 20261114) + (SHARD.teil - 1) * 1000003;
let seed = START;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const WERTE = ['0', '1', '450', '603', '604', '1200', '1.234,56', '2,050.50', '99999', '', '  ', 'abc', '-50', '−50', '12.5.2026', '1e9', '780 €', '3500', '600,5'];
// Nicht anklicken: Druck, Teilen, Kopieren, Dateiauswahl, Dokument-Scan, externe Links
const VERBOTEN = '#mappePrint, #mappeShare, #mappeCopy, #feedbackMail, #sc-take, #sc-file, #sc-claude, #sc-local, a[target="_blank"], input[type=file]';

(async () => {
  const b = await browserTyp.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, locale: 'de-DE' });
  const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
  const fehler = [];
  const log = [];
  p.on('pageerror', (e) => fehler.push('Skriptfehler: ' + e.message + ' | nach: ' + log.slice(-6).join(' > ')));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR_FILE_NOT_FOUND/.test(m.text())) fehler.push('Konsole: ' + m.text().slice(0, 200) + ' | nach: ' + log.slice(-6).join(' > ')); });
  p.on('dialog', (d) => d.dismiss().catch(() => {}));
  await p.goto(APP);
  await p.click('#firstOk').catch(() => {});

  // Zum Leistungs-Check: seit der neuen Leiste (Start | Mein Ordner | Einstellungen) über die Startkachel
  const zuLeistungen = async () => { await p.evaluate(() => { const s = document.querySelector('#appnav [data-ansicht=start]'); if (s) s.click(); const g = document.getElementById('goLeistungen'); if (g) g.click(); }); await p.waitForTimeout(150); };
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
    return els.map((el, i) => { el.setAttribute('data-zufall', String(i)); return { i, tag: el.tagName.toLowerCase(), typ: el.type || '', id: el.id || '', weg: !!el.closest('#appnav, .nav-kopf, #leistungenKopf') || !el.closest('#v-leistungen'), text: (el.innerText || el.value || '').slice(0, 30), opts: el.tagName === 'SELECT' ? [...el.options].map((o) => o.value) : null }; });
  }, VERBOTEN);

  const besucht = { einfach: 0, ausfuehrlich: 0, mappe: 0, karten: 0 };
  let imEinfach = false;
  let einfachNochmal = 0; // ebenso für den festen Besuch der einfachen Version
  let mappeNochmal = 0; // fester Mappen-Besuch: klappt er nicht (z. B. Knopf gerade verdeckt), bis zu 10 Schritte erneut versuchen
  for (let s = 0; s < SCHRITTE; s++) {
    let schritt = '';
    try {
      const r = rnd();
      // Feste Besuche, damit jeder Lauf sicher alle Bereiche prüft: einfache Version und Antragsmappe
      if ((s % 100 === 25 || einfachNochmal > 0) && !imEinfach) { einfachNochmal = s % 100 === 25 ? 10 : einfachNochmal - 1; schritt = 'Einfache Version (fest)'; for (const zu of ['#mappeClose', '#legalClose']) if (await p.isVisible(zu)) await p.click(zu, { timeout: 1000 }); await zuLeistungen(); if (!(await p.locator('#es-raus').first().isVisible())) await p.evaluate(() => document.getElementById('einfachBtn').click()); } // vorher Mappe oder Impressum schließen und zum Bereich Leistungen (sonst bleibt die einfache Version unsichtbar); klappt es nicht, bis zu 10 Schritte erneut
      else if (s % 200 === 150 || mappeNochmal > 0) { mappeNochmal = s % 200 === 150 ? 10 : mappeNochmal - 1; schritt = 'Antragsmappe (fest)'; for (const zu of ['#mappeClose', '#legalClose']) if (await p.isVisible(zu)) await p.click(zu, { timeout: 1000 }); await zuLeistungen(); if (await p.locator('#es-raus').first().isVisible()) { await p.locator('#es-raus').first().click({ timeout: 1000 }); await p.waitForTimeout(150); } if (!(await p.isVisible('#mappeMake')) || await p.isDisabled('#mappeMake')) { await p.evaluate(() => document.getElementById('p1').click()).catch(() => {}); if (await p.isVisible('#beispielJa')) await p.click('#beispielJa', { timeout: 1000 }); await p.waitForTimeout(150); } /* noch kein Ergebnis (Mappe-Bereich erscheint erst mit Ergebnis) oder nichts auswählbar: Beispiel laden */ await p.evaluate(() => { const c = [...document.querySelectorAll('[data-pick]')]; if (c.length && !c.some((x) => x.checked)) c[0].click(); }); /* alles abgewählt: eine Leistung wählen */ if (await p.isVisible('#mappeMake')) await p.click('#mappeMake', { timeout: 1000 }); } // erst zum Bereich Leistungen (es gibt jetzt mehr Bereiche), dann die einfache Version verlassen
      else if (r < 0.01) { schritt = 'Neu laden'; await p.reload(); await p.click('#firstOk', { timeout: 500 }).catch(() => {}); }
      else if (r < 0.045 && !imEinfach) { schritt = 'Einfache Version'; if (true) await p.evaluate(() => document.getElementById('einfachBtn').click()); }
      else if (r < 0.055) { schritt = 'Antragsmappe'; if (await p.isVisible('#mappeMake')) await p.click('#mappeMake', { timeout: 1000 }); }
      else if (r < 0.06) { const l = pick(['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so']); schritt = 'Sprache ' + l; if (true) await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, l); }
      else {
        const zs = await ziele();
        if (!zs.length) { schritt = 'nichts bedienbar'; fehler.push('Sackgasse: kein bedienbares Element | nach: ' + log.slice(-6).join(' > ')); break; }
        // In der einfachen Version länger bleiben: „zur ausführlichen Version“ nur selten wählen, sonst bleibt sie kaum geprüft
        // In der einfachen Version: Leiste unten und „← Zurück“ (verlassen den Bereich) fast nie wählen
        const zsE = imEinfach ? zs.filter((x) => !x.weg || rnd() < 0.05) : zs;
        let z = pick(zsE.length ? zsE : zs);
        for (let k = 0; k < 5 && imEinfach && (z.id === 'es-raus' || z.id === 'einfachBtn' || z.weg) && rnd() < 0.85; k++) z = pick(zs); // auch Leiste und „← Zurück“ (verlassen die Seite) nur selten
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
    if (imEinfach) einfachNochmal = 0;
    if (z.esModus) besucht.einfach++; else besucht.ausfuehrlich++;
    if (z.mappe) { besucht.mappe++; mappeNochmal = 0; }
    if (z.karten > 1) besucht.karten++;
    if (z.kaputt) fehler.push('Kaputte Anzeige „' + z.kaputt + '“: …' + z.stelle.replace(/\s+/g, ' ') + '… | nach: ' + log.slice(-6).join(' > '));
    if (z.breite > 2) fehler.push('Seitliches Scrollen (' + z.breite + ' px) | nach: ' + log.slice(-6).join(' > '));
    if (z.esModus && !z.esInhalt && !z.mappe && !z.legal) fehler.push('Einfache Version ohne Frage und ohne Ergebnis | nach: ' + log.slice(-6).join(' > '));
    if (!z.esModus && !z.mappe && !z.legal && z.karten === 0) fehler.push('Ausführliche Version ohne Karten und ohne Startanleitung | nach: ' + log.slice(-6).join(' > '));
    if (fehler.length >= 5) break;
  }
  await b.close();
  if (fehler.length) { console.log('FEHLER Zufalls-Klicktest' + SHARD.name + ' (Startwert ' + START + '):'); [...new Set(fehler)].slice(0, 5).forEach((f) => console.log('- ' + f)); process.exit(1); }
  if (besucht.einfach < SCHRITTE / 20 || !besucht.mappe || !besucht.karten) { console.log('FEHLER Zufalls-Klicktest erreicht nicht alle Bereiche: ' + JSON.stringify(besucht)); process.exit(1); }
  console.log('[zufall-klick] Zufalls-Klicktest' + SHARD.name + ' bestanden (Startwert ' + START + '): ' + SCHRITTE + ' zufällige Bedienschritte ohne Skriptfehler, kaputte Anzeige, seitliches Scrollen oder Sackgasse (Schritte in der einfachen Version ' + besucht.einfach + ', mit Ergebniskarten ' + besucht.karten + ', in der Antragsmappe ' + besucht.mappe + ')');
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
