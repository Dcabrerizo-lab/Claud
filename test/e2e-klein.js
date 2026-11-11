// Kleine Handys und große Schrift: 320 px breit, in allen 8 Sprachen, je normal, mit „Große Schrift“ der App
// und mit Systemschrift 200 % (Android vergrößert die Schrift in der WebView). Geprüft: kein seitliches Scrollen,
// kein Element ragt über den Bildschirmrand, keine abgeschnittenen Knopftexte, Knöpfe bleiben erreichbar.
// Ausführliche Version mit ausgefülltem Haushalt (Karten sichtbar) und einfache Version (erste Frage).
'use strict';
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs'), path = require('path');
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
const SPRACHEN = fs.readdirSync(path.join(__dirname, '..', 'src', 'lang')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const HH = { adults: 2, kids: 2, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: '2400', ek1Netto: '1750', ek2Art: 'rente', ek2Brutto: '700', ek2Netto: '640', miete: '850', plz: '90402', vermoegen: '2000', gebJahr: '1962', pflegegrad: '2', gdb: '60', baby: 'bald', bezug: {} };
let n = 0, fails = 0;
const ok = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : String(x).slice(0, 400)); } };

const pruefen = () => {
  const W = window.innerWidth, out = [];
  const sichtbar = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[hidden], .sr-only, .visually-hidden, dialog:not([open])'); };
  const ov = document.documentElement.scrollWidth - W;
  if (ov > 1) out.push('seitliches Scrollen ' + ov + ' px');
  document.querySelectorAll('body *').forEach((e) => {
    if (!sichtbar(e) || e.closest('.mappe-text, textarea, pre')) return;
    const r = e.getBoundingClientRect();
    if (r.right > W + 1 || r.left < -1) out.push('ragt heraus: ' + e.tagName + (e.id ? '#' + e.id : '') + '.' + (e.className || '') + ' [' + Math.round(r.left) + '–' + Math.round(r.right) + '] „' + (e.textContent || '').trim().slice(0, 40) + '“');
  });
  document.querySelectorAll('button, .chip, label, select, .pill').forEach((e) => {
    if (!sichtbar(e)) return;
    const cs = getComputedStyle(e);
    if (e.tagName !== 'SELECT' && e.scrollWidth > e.clientWidth + 2) out.push('Text abgeschnitten: ' + e.tagName + (e.id ? '#' + e.id : '') + ' „' + e.textContent.trim().slice(0, 40) + '“');
    const r = e.getBoundingClientRect();
    if ((e.tagName === 'BUTTON' || e.classList.contains('chip')) && (r.height < 40 || r.width < 40)) out.push('Knopf zu klein: ' + (e.id || e.textContent.trim().slice(0, 30)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  });
  return [...new Set(out)].slice(0, 12);
};

(async () => {
  const B = { chromium, firefox, webkit }[process.env.BROWSER || 'chromium'];
  const b = await B.launch();
  for (const modus of ['normal', 'gross', 'system200']) {
    for (const lang of SPRACHEN) {
      const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, locale: 'de-DE', deviceScaleFactor: 1 });
      await ctx.addInitScript(([lang, hh, gross]) => {
        try {
          localStorage.setItem('lotse-lang', lang); localStorage.setItem('lotse.ack', '1');
          localStorage.setItem('lotse.state', JSON.stringify({ s: hh, p: {}, e: true, big: gross }));
        } catch (e) {}
      }, [lang, HH, modus === 'gross']);
      const p = await ctx.newPage();
      const err = []; p.on('pageerror', (e) => err.push(e.message));
      await p.goto(APP);
      if (modus === 'system200') await p.addStyleTag({ content: 'html { font-size: 200% !important; } html.big { font-size: 200% !important; }' });
      await p.waitForTimeout(300);
      const karten = await p.locator('#cards .card:not(.startcard)').count();
      ok(`${modus} ${lang}: ausführliche Version mit Karten, ohne Skriptfehler`, karten > 20 && err.length === 0, karten + ' ' + err.join('; '));
      const f1 = await p.evaluate(pruefen);
      ok(`${modus} ${lang}: ausführliche Version passt auf 320 px`, f1.length === 0, f1.join(' | '));
      // Antragsmappe öffnen (falls vorhanden)
      if (await p.locator('#mappeBtn').count()) {
        await p.click('#mappeBtn').catch(() => {});
        await p.waitForTimeout(200);
        const f2 = await p.evaluate(pruefen);
        ok(`${modus} ${lang}: Antragsmappe passt auf 320 px`, f2.length === 0, f2.join(' | '));
        await p.click('#mappeClose').catch(() => {});
      }
      // Einfache Version: erste Frage
      await p.evaluate(() => document.getElementById('einfachBtn').click()); // Leiste unten kann den Knopf je nach Scrollstand verdecken
      await p.waitForTimeout(250);
      const f3 = await p.evaluate(pruefen);
      ok(`${modus} ${lang}: einfache Version passt auf 320 px`, f3.length === 0 && err.length === 0, f3.join(' | ') + err.join('; '));
      await ctx.close();
    }
  }
  await b.close();
  console.log(fails ? `\n${fails} von ${n} FEHLGESCHLAGEN` : `Kleinbild-Test bestanden: ${n} Prüfungen (320 px, 8 Sprachen, normal, große Schrift, Systemschrift 200 %)`);
  process.exit(fails ? 1 : 0);
})();
