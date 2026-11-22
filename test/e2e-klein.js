// Kleine Handys und große Schrift: 320 px breit, in allen 13 Sprachen, je normal, mit „Große Schrift“ der App
// und mit Systemschrift 200 % (Android vergrößert die Schrift in der WebView). Geprüft: kein seitliches Scrollen,
// kein Element ragt über den Bildschirmrand, keine abgeschnittenen Knopftexte, Knöpfe bleiben erreichbar.
// Ausführliche Version mit ausgefülltem Haushalt (Karten sichtbar) und einfache Version (erste Frage).
'use strict';
const { chromium, firefox, webkit } = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
const fs = require('fs'), path = require('path');
const SHARD = require('./shard.js'); // SHARD=k/n: nur jede n-te Kombination aus Modus und Sprache
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
const SPRACHEN = fs.readdirSync(path.join(__dirname, '..', 'src', 'lang')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const HH = { adults: 2, kids: 2, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: '2400', ek1Netto: '1750', ek2Art: 'rente', ek2Brutto: '700', ek2Netto: '640', miete: '850', plz: '90402', vermoegen: '2000', gebJahr: '1962', pflegegrad: '2', gdb: '60', baby: 'bald', bezug: {} };
let n = 0, fails = 0;
const ok = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : String(x).slice(0, 400)); } };

const pruefen = () => {
  const W = window.innerWidth, out = [];
  // Nur für Screenreader versteckt (.vh, Kopfzeile außerhalb der Startseite: clip auf 1 px): nicht sichtbar, zählt nicht
  const versteckt = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if ((c.clip && c.clip !== 'auto') || c.clipPath === 'inset(50%)') return true; } return false; };
  const sichtbar = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[hidden], .sr-only, .visually-hidden, .vh, dialog:not([open])') && !versteckt(e); };
  const ov = document.documentElement.scrollWidth - W;
  if (ov > 1) {
    // Verursacher nennen, auch unsichtbare oder absolut positionierte Elemente
    const alle = [...document.querySelectorAll('body *')].map((e) => ({ e, r: e.getBoundingClientRect() })).filter((x) => x.r.right > W + 1 && x.r.width > 0)
      .sort((a, b) => b.r.right - a.r.right).slice(0, 4)
      .map((x) => { const cs = getComputedStyle(x.e); return x.e.tagName + (x.e.id ? '#' + x.e.id : '') + '.' + (x.e.className || '') + ' right=' + Math.round(x.r.right) + ' w=' + Math.round(x.r.width) + ' pos=' + cs.position + ' vis=' + cs.visibility + ' disp=' + cs.display + ' „' + (x.e.textContent || '').trim().slice(0, 30) + '“'; });
    // Inhalt, der über seinen eigenen Kasten hinausläuft (z. B. nicht umbrechender Text)
    const inhalt = [...document.querySelectorAll('body *')].map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter((x) => x.e.scrollWidth > x.e.clientWidth + 1 && x.r.left + x.e.scrollWidth > W + 1 && x.e.clientWidth > 0)
      .filter((x) => ![...x.e.children].some((c) => c.scrollWidth > c.clientWidth + 1 && c.getBoundingClientRect().left + c.scrollWidth > W + 1))
      .slice(0, 4).map((x) => x.e.tagName + (x.e.id ? '#' + x.e.id : '') + '.' + (x.e.className || '') + ' sw=' + x.e.scrollWidth + ' cw=' + x.e.clientWidth + ' ov=' + getComputedStyle(x.e).overflowX + ' „' + (x.e.textContent || '').trim().slice(0, 30) + '“');
    out.push('seitliches Scrollen ' + ov + ' px [' + alle.join(' ; ') + '] Inhalt: [' + inhalt.join(' ; ') + ']');
  }
  document.querySelectorAll('body *').forEach((e) => {
    if (!sichtbar(e) || e.closest('.mappe-text, textarea, pre')) return;
    const r = e.getBoundingClientRect();
    if (r.right > W + 1 || r.left < -1) out.push('ragt heraus: ' + e.tagName + (e.id ? '#' + e.id : '') + '.' + (e.className || '') + ' [' + Math.round(r.left) + '–' + Math.round(r.right) + '] „' + (e.textContent || '').trim().slice(0, 40) + '“');
  });
  document.querySelectorAll('button, .chip, label, select, .pill').forEach((e) => {
    if (!sichtbar(e)) return;
    if (e.tagName !== 'SELECT' && e.scrollWidth > e.clientWidth + 2) out.push('Text abgeschnitten: ' + e.tagName + (e.id ? '#' + e.id : '') + ' „' + e.textContent.trim().slice(0, 40) + '“');
    const r = e.getBoundingClientRect();
    if ((e.tagName === 'BUTTON' || e.classList.contains('chip')) && (r.height < 40 || r.width < 40)) out.push('Knopf zu klein: ' + (e.id || e.textContent.trim().slice(0, 30)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  });
  return [...new Set(out)].slice(0, 12);
};

(async () => {
  const B = { chromium, firefox, webkit }[process.env.BROWSER || 'chromium'];
  const b = await B.launch();
  let fall = -1;
  for (const modus of ['normal', 'gross', 'system200']) {
    for (const lang of SPRACHEN) {
      if (!SHARD.nimm(++fall)) continue;
      const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, locale: 'de-DE', deviceScaleFactor: 1 });
      await ctx.addInitScript(([lang, hh, gross]) => {
        try {
          localStorage.setItem('lotse-lang', lang); localStorage.setItem('lotse.ack', '1');
          localStorage.setItem('lotse.state', JSON.stringify({ s: hh, p: {}, e: true, big: gross }));
        } catch (e) {}
      }, [lang, HH, modus === 'gross']);
      const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
      const err = []; p.on('pageerror', (e) => err.push(e.message));
      await p.goto(APP + '#leistungen'); // ausführliche Version direkt (ohne Adresszusatz öffnet die Startseite, die Karten wären verborgen)
      if (modus === 'system200') await p.addStyleTag({ content: 'html { font-size: 200% !important; } html.big { font-size: 200% !important; }' });
      await p.waitForTimeout(300);
      const karten = await p.locator('#cards .card:not(.startcard)').count(), sichtbar = await p.isVisible('#cards .card:not(.startcard)');
      ok(`${modus} ${lang}: ausführliche Version mit sichtbaren Karten, ohne Skriptfehler`, sichtbar && karten > 20 && err.length === 0, karten + ' sichtbar=' + sichtbar + ' ' + err.join('; '));
      const f1 = await p.evaluate(pruefen);
      ok(`${modus} ${lang}: ausführliche Version passt auf 320 px`, f1.length === 0, f1.join(' | '));
      // Antragsmappe über den Hauptknopf „Antrag vorbereiten“ (#mappeMake) öffnen, alle Schritte aufgeklappt
      const mk = await p.isVisible('#mappeMake');
      ok(`${modus} ${lang}: Knopf „Antrag vorbereiten“ sichtbar`, mk);
      if (mk) {
        await p.evaluate(() => document.getElementById('mappeMake').click()); // Leiste unten kann den Knopf verdecken
        await p.evaluate(() => document.querySelectorAll('#mappeAufgaben details').forEach((d) => { d.open = true; }));
        await p.waitForTimeout(200);
        const offen = await p.isVisible('#mappe');
        const f2 = await p.evaluate(pruefen);
        ok(`${modus} ${lang}: Antragsmappe offen und passt auf 320 px`, offen && f2.length === 0, 'offen=' + offen + ' ' + f2.join(' | '));
        await p.evaluate(() => document.getElementById('mappeClose').click());
        await p.waitForTimeout(150);
      }
      // Einfache Version: erste Frage
      await p.evaluate(() => document.getElementById('einfachBtn').click()); // Leiste unten kann den Knopf je nach Scrollstand verdecken
      await p.waitForTimeout(250);
      const f3 = await p.evaluate(pruefen);
      ok(`${modus} ${lang}: einfache Version passt auf 320 px`, f3.length === 0 && err.length === 0, f3.join(' | ') + err.join('; '));
      await ctx.close();
    }
  }
  // UX-Nachprüfung 22.11.2026, Nr. 6: Systemschrift 200 % auf 390 px mit den Fällen der Prüfung (A alleinerziehend, B Rentnerin, C Paar mit 3 Kindern):
  // Ergebnis mit allen Karten aufgeklappt und Antragsmappe mit allen Schritten offen werden nicht breiter als der Bildschirm.
  const FAELLE = {
    A: { adults: 1, kids: 2, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: '1700', ek1Netto: '1250', miete: '850', plz: '91054', vermoegen: '0', bezug: {} },
    B: { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'rente', ek1Brutto: '960', ek1Netto: '880', miete: '520', plz: '90542', vermoegen: '0', gebJahr: '1955', pflegegrad: '2', bezug: {} },
    C: { adults: 2, kids: 3, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: '2900', ek1Netto: '2150', ek2Art: 'ohne', miete: '1150', plz: '90402', vermoegen: '0', bezug: {} }
  };
  for (const [name, hh] of Object.entries(FAELLE)) {
    if (!SHARD.nimm(++fall)) continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', deviceScaleFactor: 1 });
    await ctx.addInitScript((hh) => { try { localStorage.setItem('lotse-lang', 'de'); localStorage.setItem('lotse.ack', '1'); localStorage.setItem('lotse.state', JSON.stringify({ s: hh, p: {}, e: true })); } catch (e) {} }, hh);
    const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
    const err = []; p.on('pageerror', (e) => err.push(e.message));
    await p.goto(APP + '#leistungen');
    await p.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await p.evaluate(() => document.querySelectorAll('#cards details').forEach((d) => { d.open = true; }));
    await p.waitForTimeout(250);
    const breit = () => ({ sw: document.documentElement.scrollWidth, wer: [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > 391 && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]')).slice(0, 3).map((e) => e.tagName + '.' + e.className + ' „' + (e.textContent || '').trim().slice(0, 30) + '“') });
    const e1 = await p.evaluate(breit), sichtbar = await p.isVisible('#cards .card');
    ok(`system200 390px Fall ${name}: Ergebnis (alle Karten offen) sichtbar und höchstens 390 px breit`, sichtbar && e1.sw <= 390 && err.length === 0, e1.sw + ' ' + e1.wer.join(' ; ') + err.join('; '));
    if (await p.locator('#mappeMake').count()) {
      await p.evaluate(() => document.getElementById('mappeMake').click());
      await p.evaluate(() => document.querySelectorAll('#mappe details').forEach((d) => { d.open = true; }));
      await p.waitForTimeout(250);
      const e2 = await p.evaluate(breit);
      ok(`system200 390px Fall ${name}: Antragsmappe (alles offen) höchstens 390 px breit`, e2.sw <= 390 && err.length === 0, e2.sw + ' ' + e2.wer.join(' ; ') + err.join('; '));
    } else ok(`system200 390px Fall ${name}: Knopf „Antrag vorbereiten“ da`, false);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} von ${n} FEHLGESCHLAGEN` : `Kleinbild-Test${SHARD.name} bestanden: ${n} Prüfungen (320 px, 13 Sprachen, normal, große Schrift, Systemschrift 200 %)`);
  process.exit(fails ? 1 : 0);
})();
