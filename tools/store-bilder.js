// Store-Bilder erzeugen: zuerst npm run build:web, dann node tools/store-bilder.js (Ergebnis in store-bilder/)
// Store-Bilder: rohe Aufnahmen der App, dann mit Überschrift in die Store-Formate gesetzt
const { chromium } = require('playwright');
const fs = require('fs');
const D = require('path').join(__dirname, '..', 'store-bilder') + '/'; require('fs').mkdirSync(D, { recursive: true });
const APP = 'file://' + require('path').join(__dirname, '..', 'dist', 'leistungs-lotse.html');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: 'de-DE' });
  const p = await ctx.newPage();
  await p.goto(APP);
  await p.click('#firstOk').catch(() => {});
  const roh = async (name, fn) => { await fn(); await p.waitForTimeout(250); await p.screenshot({ path: D + 'roh-' + name + '.png' }); };
  const zu = async (sel, off = 0) => p.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]);
  await p.click('#p1');
  await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen'); await p.press('#p-ort', 'Tab');
  if (await p.isVisible('#plz')) { await p.fill('#plz', '91054'); }
  await p.waitForTimeout(300);
  await roh('1-formular', async () => { await zu('#h-form', 10); });
  await roh('2-ergebnis', async () => { await zu('#ergebnis', 10); });
  await roh('3-stelle', async () => {
    await p.evaluate(() => { const c = [...document.querySelectorAll('#cards .card')].find((x) => /Wohngeld/.test(x.querySelector('h3').textContent)); c.querySelectorAll('details').forEach((d) => { d.open = true; }); window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY - 10); });
  });
  await roh('6-mappe', async () => { await p.click('#mappeMake'); await p.evaluate(() => window.scrollTo(0, 0)); });
  await p.click('#mappeClose');
  await p.selectOption('#lang', 'ar');
  await roh('7-sprachen', async () => { await zu('#ergebnis', 10); });
  await p.selectOption('#lang', 'de');
  await p.click('#einfachBtn');
  await p.addStyleTag({ content: '.top{display:none!important}' }); // Kopfzeile nur für das Bild ausblenden
  await p.fill('#es-in', '1990'); await p.click('#es-weiter');
  await roh('4-einfach', async () => { await zu('.es-top', 16); });
  for (const a of ['eltern', 'nein', 'werkstatt']) await p.click('[data-es="' + a + '"]');
  await p.fill('#es-in', '250'); await p.click('#es-weiter');
  for (const a of ['ja', 'nein', 'ja', '80']) await p.click('[data-es="' + a + '"]');
  await p.click('[data-mz="G"]'); await p.click('#es-weiter');
  for (const a of ['ja', '2', 'wenig']) await p.click('[data-es="' + a + '"]');
  await p.fill('#es-in', '93047'); await p.click('#es-weiter');
  await roh('5-einfach-ergebnis', async () => { await zu('#es-q', 16); });
  // In Store-Formate setzen
  const MOTIVE = [['1-formular', 'In zwei Minuten zum Überblick', 'Einfache Fragen zu Haushalt, Wohnung und Einkommen'],
    ['2-ergebnis', '23 Leistungen geprüft', 'Mit grober Höhe und klarer Einschätzung'],
    ['3-stelle', 'Wo du den Antrag stellst', 'Zuständige Stelle mit Anschrift und Unterlagen'],
    ['4-einfach', 'Auch in einfacher Sprache', 'Eine Frage pro Bildschirm, große Knöpfe, Vorlesen'],
    ['5-einfach-ergebnis', 'Klares Ergebnis', 'Was du bekommen kannst und wo du hingehst'],
    ['6-mappe', 'Anträge fertig zum Abschicken', 'Formlose Anträge und Angabenblatt als PDF'],
    ['7-sprachen', 'In 8 Sprachen', 'Amtsbegriffe bleiben deutsch, damit du sie wiedererkennst']];
  const FORMATE = [['play', 1080, 1920], ['ios-6.9', 1320, 2868], ['ios-6.5', 1242, 2688]];
  const p2 = await b.newPage();
  for (const [fmt, w, h] of FORMATE) {
    fs.mkdirSync(D + fmt, { recursive: true });
    for (const [n, titel, unter] of MOTIVE) {
      const img = 'data:image/png;base64,' + fs.readFileSync(D + 'roh-' + n + '.png').toString('base64');
      await p2.setViewportSize({ width: w, height: h });
      await p2.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;background:linear-gradient(160deg,#1f3f8f,#2c5bd1);font-family:system-ui,sans-serif;color:#fff;overflow:hidden;display:flex;flex-direction:column;align-items:center">
        <div style="padding:${h * 0.045}px ${w * 0.07}px ${h * 0.025}px;text-align:center"><div style="font-size:${w * 0.072}px;font-weight:800;line-height:1.15">${titel}</div>
        <div style="font-size:${w * 0.038}px;opacity:.9;margin-top:${h * 0.012}px;line-height:1.3">${unter}</div></div>
        <div style="flex:1;width:${w * 0.82}px;border-radius:${w * 0.05}px ${w * 0.05}px 0 0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#fff">
        <img src="${img}" style="width:100%;display:block"></div></body></html>`);
      await p2.waitForTimeout(100);
      await p2.screenshot({ path: D + fmt + '/' + n + '.png' });
    }
  }
  // Werbegrafik für Google Play (1024 x 500) und Symbol (512 x 512)
  const icon = 'data:image/png;base64,' + fs.readFileSync(require('path').join(__dirname, '..', 'app', 'assets', 'icon.png')).toString('base64');
  await p2.setViewportSize({ width: 1024, height: 500 });
  await p2.setContent(`<html><body style="margin:0;width:1024px;height:500px;background:linear-gradient(135deg,#1f3f8f,#2c5bd1);font-family:system-ui,sans-serif;color:#fff;display:flex;align-items:center;gap:48px;padding:0 70px;box-sizing:border-box">
    <img src="${icon}" style="width:200px;height:200px;border-radius:44px;box-shadow:0 12px 40px rgba(0,0,0,.35)">
    <div><div style="font-size:68px;font-weight:800">Leistungs-Lotse</div><div style="font-size:30px;margin-top:14px;line-height:1.3;opacity:.95">Welche Sozialleistungen stehen dir zu?<br>In zwei Minuten, offline, in 8 Sprachen.</div></div></body></html>`);
  await p2.screenshot({ path: D + 'play-werbegrafik-1024x500.png' });
  await p2.setViewportSize({ width: 512, height: 512 });
  await p2.setContent(`<html><body style="margin:0"><img src="${icon}" style="width:512px;height:512px;display:block"></body></html>`);
  await p2.screenshot({ path: D + 'play-symbol-512.png' });
  await b.close();
  console.log('fertig');
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });
