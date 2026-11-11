// Bedienung der echten App im Android-Emulator (Playwright verbindet sich mit der WebView der Debug-APK).
//  node tools/emulator-bedienung.js vorher  : Fragebogen ausfüllen, Karten prüfen, Antragsmappe erzeugen,
//                                             PDF über Teilen öffnen (natives Filesystem- und Share-Plugin)
//  node tools/emulator-bedienung.js nachher : nach dem Update über die alte Version: alle Angaben noch da
'use strict';
const { _android: android } = require('playwright');
const { execSync } = require('child_process');
const PKG = 'com.sozialleistungslotse.apk';
const KARTEN = require('../test/karten.js');
const phase = process.argv[2] || 'vorher';
let n = 0, fails = 0;
const ok = (name, c, x) => { n++; console.log((c ? 'ok   ' : 'FAIL ') + name + (c ? '' : ' ' + (x === undefined ? '' : String(x).slice(0, 400)))); if (!c) fails++; };
const adb = (c) => execSync('adb ' + c, { encoding: 'utf8' });
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const [device] = await android.devices();
  if (!device) { console.log('::error::kein Emulator gefunden'); process.exit(1); }
  await device.shell('am force-stop ' + PKG);
  await device.shell('monkey -p ' + PKG + ' -c android.intent.category.LAUNCHER 1');
  const webview = await device.webView({ pkg: PKG }, { timeout: 90000 });
  const p = await webview.page();
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.waitForSelector('#cards', { timeout: 60000 });
  await warte(1500);
  ok('Native App erkannt (Capacitor)', await p.evaluate(() => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())));

  if (phase === 'vorher') {
    if (await p.isVisible('#firstOk')) await p.tap('#firstOk');
    await p.tap('#p2'); await warte(800);
    ok('Beispiel-Haushalt: alle ' + KARTEN.length + ' Karten', (await p.locator('#cards .card:not(.startcard)').count()) === KARTEN.length);
    await p.fill('#ek1Brutto', '2100'); await p.locator('#ek1Brutto').press('Tab'); await warte(500);
    await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen');
    await warte(1500); // Speichern ist verzögert
    await p.evaluate(() => document.querySelectorAll('[data-pick]').forEach((x) => { if (!x.checked) x.click(); }));
    await p.evaluate(() => document.getElementById('mappeMake').click()); await warte(800);
    const txt = await p.inputValue('#mappeText');
    ok('Antragsmappe erzeugt, mit Name und ohne kaputte Texte', /Maria Muster/.test(txt) && !/undefined|NaN/.test(txt), txt.slice(0, 200));
    // PDF über das native Teilen: Datei wird gebaut, im Cache gespeichert, Teilen-Dialog des Systems öffnet sich
    await p.evaluate(() => document.getElementById('mappePrint').click());
    let geteilt = false;
    for (let i = 0; i < 30 && !geteilt; i++) {
      await warte(1000);
      const akt = adb('shell dumpsys activity activities');
      geteilt = /Chooser|ResolverActivity|intentresolver/i.test((akt.match(/(mResumedActivity|topResumedActivity|ResumedActivity).*/g) || []).join(' '));
    }
    const meldung = await p.evaluate(() => document.getElementById('copyMsg').textContent).catch(() => '');
    ok('PDF der Antragsmappe: Teilen-Dialog des Systems geöffnet', geteilt, 'Meldung: ' + meldung);
    try { adb('exec-out screencap -p > emulator-teilen.png'); } catch (e) {}
    adb('shell input keyevent 4'); await warte(1500);
    const msg2 = await p.evaluate(() => document.getElementById('copyMsg').textContent).catch(() => '');
    ok('Keine Fehlermeldung beim PDF', !/nicht|fehl/i.test(msg2), msg2);
    await p.evaluate(() => document.getElementById('mappeClose').click());
  } else {
    await warte(1000);
    ok('Nach dem Update: Name in der Antragsmappe noch da', (await p.inputValue('#p-name')) === 'Maria Muster', await p.inputValue('#p-name'));
    ok('Nach dem Update: Einkommen noch da', (await p.inputValue('#ek1Brutto')) === '2100', await p.inputValue('#ek1Brutto'));
    ok('Nach dem Update: Karten erscheinen sofort (kein leerer Start)', (await p.locator('#cards .card:not(.startcard)').count()) === KARTEN.length);
  }
  ok('Keine Skriptfehler in der App', fehler.length === 0, fehler.join(' | '));
  await device.close();
  console.log(fails ? `\n${fails} von ${n} FEHLGESCHLAGEN (${phase})` : `Bedienung im Emulator bestanden (${phase}): ${n} Prüfungen`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('::error::' + e.message); process.exit(1); });
