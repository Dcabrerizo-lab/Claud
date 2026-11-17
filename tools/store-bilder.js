// Store-Bilder erzeugen: zuerst npm run build:web, dann node tools/store-bilder.js (Ergebnis in store-bilder/)
// Rohe Aufnahmen der App (Version mit Startseite, Brief prüfen und Fristen), dann mit Überschrift in die Store-Formate gesetzt.
// Logo: tools/logo/sprechblase.svg. Farbe der Bilder passend zum Logo (Petrol).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', 'store-bilder') + '/'; fs.mkdirSync(D, { recursive: true });
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
const LOGO = fs.readFileSync(path.join(__dirname, 'logo', 'sprechblase.svg'), 'utf8');
const VERLAUF = 'linear-gradient(160deg,#0f7f70,#0a4f47)';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 3, locale: 'de-DE' });
  const p = await ctx.newPage();
  const roh = async (name, fn) => { await fn(); await p.waitForTimeout(300); await p.screenshot({ path: D + 'roh-' + name + '.png' }); };
  const zu = async (sel, off = 0) => p.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - o); }, [sel, off]);
  const oben = () => p.evaluate(() => window.scrollTo(0, 0));

  // Beispielfall mit Fristen, damit Startseite und Fristen nicht leer sind
  await p.goto(APP + '#briefe');
  await p.click('#brief-pk'); await p.fill('#pf-datum', isoIn(-5)); await p.click('#pf-wid-mach');
  await p.click('#briefZurueck'); await p.click('#brief-vm'); await p.click('#p-nk >> text=Beispiel laden'); await p.click('#nk-ew-mach');
  await p.click('#briefZurueck');
  await p.click('#appnav [data-ansicht=fristen]'); await p.click('#fristNeu summary');
  await p.fill('#fristTitel', 'Unterlagen ans Jobcenter'); await p.fill('#fristDatum', isoIn(9)); await p.click('#fristAdd');
  await p.click('#fristNeu summary');

  await roh('1-start', async () => { await p.click('#appnav [data-ansicht=start]'); await zu('#einfachBtn', 10); });
  // Leistungscheck mit Beispiel
  await p.click('#appnav [data-ansicht=leistungen]');
  await p.click('#firstOk').catch(() => {});
  await p.click('#p1');
  await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen'); await p.press('#p-ort', 'Tab');
  if (await p.isVisible('#plz')) await p.fill('#plz', '91054');
  await p.waitForTimeout(300);
  await roh('2-ergebnis', async () => { await zu('#ergebnis', 10); });
  await roh('3-brief', async () => { await p.click('#appnav [data-ansicht=briefe]'); await zu('#einfachBtn', 10); });
  await roh('4-bescheid', async () => {
    await p.click('#brief-jc'); await p.click('#p-bescheid >> text=Beispiel laden');
    await zu('#bs-erg', 10);
  });
  await p.click('#briefZurueck');
  await roh('5-fristen', async () => { await p.click('#appnav [data-ansicht=fristen]'); await zu('#h-fristen', 14); });
  await p.click('#appnav [data-ansicht=leistungen]');
  await roh('6-mappe', async () => { await p.click('#mappeMake'); await oben(); });
  await p.click('#mappeClose');
  await p.selectOption('#lang', 'ar');
  await roh('8-sprachen', async () => { await zu('#ergebnis', 10); });
  await p.selectOption('#lang', 'de');
  await p.click('#einfachBtn');
  await p.addStyleTag({ content: '.top{display:none!important}' }); // Kopfzeile nur für das Bild ausblenden
  await p.fill('#es-in', '1990'); await p.click('#es-weiter');
  await roh('7-einfach', async () => { await zu('.es-top', 16); });

  // In Store-Formate setzen
  const MOTIVE = [
    ['1-start', 'Hilfen finden, Briefe prüfen', 'Alles an einem Ort, ohne Anmeldung'],
    ['2-ergebnis', require('../test/karten.js').length + ' Leistungen geprüft', 'Mit grober Höhe und klarer Einschätzung'],
    ['3-brief', 'Brief vom Amt bekommen?', 'Jobcenter, Sozialamt, Wohngeld, Pflegekasse, Vermieter'],
    ['4-bescheid', 'Bescheid nachgerechnet', 'Abweichungen mit Paragraf, Widerspruch in Minuten'],
    ['5-fristen', 'Keine Frist verpassen', 'Die App zählt die Tage für dich'],
    ['6-mappe', 'Anträge fertig zum Abschicken', 'Formlose Anträge und Angabenblatt als PDF'],
    ['7-einfach', 'Auch in einfacher Sprache', 'Eine Frage pro Bildschirm, große Knöpfe, Vorlesen'],
    ['8-sprachen', 'In 8 Sprachen', 'Amtsbegriffe bleiben deutsch, damit du sie wiedererkennst']];
  const FORMATE = [['play', 1080, 1920], ['ios-6.9', 1320, 2868], ['ios-6.5', 1242, 2688]];
  const p2 = await b.newPage();
  for (const [fmt, w, h] of FORMATE) {
    fs.rmSync(D + fmt, { recursive: true, force: true }); fs.mkdirSync(D + fmt, { recursive: true });
    for (const [n, titel, unter] of MOTIVE) {
      const img = 'data:image/png;base64,' + fs.readFileSync(D + 'roh-' + n + '.png').toString('base64');
      await p2.setViewportSize({ width: w, height: h });
      await p2.setContent(`<html><body style="margin:0;width:${w}px;height:${h}px;background:${VERLAUF};font-family:system-ui,sans-serif;color:#fff;overflow:hidden;display:flex;flex-direction:column;align-items:center">
        <div style="padding:${h * 0.045}px ${w * 0.07}px ${h * 0.025}px;text-align:center"><div style="font-size:${w * 0.072}px;font-weight:800;line-height:1.15">${titel}</div>
        <div style="font-size:${w * 0.038}px;opacity:.92;margin-top:${h * 0.012}px;line-height:1.3">${unter}</div></div>
        <div style="flex:1;width:${w * 0.82}px;border-radius:${w * 0.05}px ${w * 0.05}px 0 0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35);background:#fff">
        <img src="${img}" style="width:100%;display:block"></div></body></html>`);
      await p2.waitForTimeout(100);
      await p2.screenshot({ path: D + fmt + '/' + n + '.png' });
    }
  }
  // Symbol (512 x 512 für Play, 1024 x 1024 Vorlage für Apple) und Werbegrafik für Google Play (1024 x 500)
  const logoImg = 'data:image/svg+xml;base64,' + Buffer.from(LOGO).toString('base64');
  for (const s of [512, 1024]) {
    await p2.setViewportSize({ width: s, height: s });
    await p2.setContent(`<html><body style="margin:0"><img src="${logoImg}" style="width:${s}px;height:${s}px;display:block"></body></html>`);
    await p2.waitForTimeout(100);
    await p2.screenshot({ path: D + (s === 512 ? 'play-symbol-512.png' : 'logo-1024.png') });
  }
  await p2.setViewportSize({ width: 1024, height: 500 });
  await p2.setContent(`<html><body style="margin:0;width:1024px;height:500px;background:linear-gradient(135deg,#0f7f70,#0a4f47);font-family:system-ui,sans-serif;color:#fff;display:flex;align-items:center;gap:52px;padding:0 76px;box-sizing:border-box">
    <img src="${logoImg}" style="width:210px;height:210px;border-radius:46px;box-shadow:0 14px 40px rgba(0,0,0,.35)">
    <div><div style="font-size:70px;font-weight:800;letter-spacing:-1px">SoLo</div>
    <div style="font-size:36px;font-weight:700;margin-top:6px;line-height:1.25">Hilfen finden.<br>Briefe prüfen.<br>Fristen behalten.</div>
    <div style="font-size:24px;margin-top:16px;opacity:.9">Offline · ohne Anmeldung · in 8 Sprachen</div></div></body></html>`);
  await p2.waitForTimeout(100);
  await p2.screenshot({ path: D + 'play-werbegrafik-1024x500.png' });
  await b.close();
  console.log('fertig');
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });

function isoIn(tage) { const d = new Date(Date.now() + tage * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
