// Bedienung der echten App im Android-Emulator (Playwright verbindet sich mit der WebView der Debug-APK).
//  node tools/emulator-bedienung.js vorher  : Fragebogen ausfüllen, Karten prüfen, Antragsmappe erzeugen,
//                                             PDF über Teilen öffnen (natives Filesystem- und Share-Plugin)
//  node tools/emulator-bedienung.js nachher : nach dem Update über die alte Version: alle Angaben noch da
'use strict';
const { _android: android } = require('playwright');
const { execSync } = require('child_process');
const PKG = 'com.Sozialleistungslotse.test'; // Debug-APK = Test-App (applicationIdSuffix ".test")
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
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Share canceled/.test(m.text())) fehler.push(m.text()); }); // „Share canceled“: der Test schließt den Teilen-Dialog selbst
  p.on('response', (r) => { if (r.status() >= 400) fehler.push('Datei fehlt (' + r.status() + '): ' + r.url()); });
  // Seit den Reitern startet die App auf der Startseite; #cards liegt in der (verborgenen) Ansicht „Leistungen“
  // Ohne Sichtbarkeitsprüfung von Playwright: ältere WebViews (Android 11/API 30) kennen element.checkVisibility nicht (ab Playwright 1.65)
  const da = async (sel, ms) => { for (let t = 0; t < ms; t += 500) { if (await p.evaluate((s) => !!document.querySelector(s), sel).catch(() => false)) return; await warte(500); } throw new Error('nicht gefunden: ' + sel); };
  const sichtbar = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && e.offsetParent !== null); }, sel);
  const tippe = (sel, wert) => p.evaluate(([s, w]) => { const e = document.querySelector(s); e.focus(); e.value = w; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur(); }, [sel, wert]);
  await da('#cards', 60000);
  await p.evaluate(() => { const b = document.getElementById('goLeistungen'); if (b) b.click(); });
  await warte(1500);
  ok('Native App erkannt (Capacitor)', await p.evaluate(() => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())));

  if (phase === 'vorher') {
    if (await sichtbar('#firstOk')) await p.evaluate(() => document.getElementById('firstOk').click());
    await p.evaluate(() => document.getElementById('p2').click()); await warte(800);
    await p.evaluate(() => { const b = document.getElementById('goLeistungen'); if (b) b.click(); }); await warte(500);
    ok('Beispiel-Haushalt: alle ' + KARTEN.length + ' Karten', (await p.locator('#cards .card:not(.startcard)').count()) === KARTEN.length);
    await tippe('#ek1Brutto', '2100'); await warte(500);
    await tippe('#p-name', 'Maria Muster'); await tippe('#p-strasse', 'Hauptstr. 1'); await tippe('#p-ort', '91054 Erlangen');
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
    // Android: Drucken öffnet den Druckdialog des Systems (Druckspooler), Speichern legt das PDF in Downloads ab
    const sdk = Number(adb('shell getprop ro.build.version.sdk').trim());
    const oben = () => (adb('shell dumpsys activity activities').match(/(mResumedActivity|topResumedActivity|ResumedActivity).*/g) || []).join(' ');
    ok('Knöpfe Drucken und PDF speichern sichtbar', await p.evaluate(() => !document.getElementById('mappeDruck').hidden && !document.getElementById('mappeSpeichern').hidden));
    await p.evaluate(() => document.getElementById('mappeDruck').click());
    let druck = false;
    for (let i = 0; i < 30 && !druck; i++) { await warte(1000); druck = /printspooler|PrintActivity/i.test(oben()); }
    ok('Drucken: Druckdialog des Systems geöffnet', druck, oben().slice(0, 300));
    try { adb('exec-out screencap -p > emulator-drucken.png'); } catch (e) {}
    adb('shell input keyevent 4'); await warte(2000);
    if (/printspooler/i.test(oben())) { adb('shell input keyevent 4'); await warte(1500); }
    await p.evaluate(() => { document.getElementById('copyMsg').textContent = ''; document.getElementById('mappeSpeichern').click(); });
    if (sdk >= 29) {
      let msgS = '';
      for (let i = 0; i < 30 && !/Download/.test(msgS); i++) { await warte(1000); msgS = await p.evaluate(() => document.getElementById('copyMsg').textContent).catch(() => ''); }
      const liste = adb('shell ls -l /sdcard/Download/');
      ok('Speichern: Meldung nennt den Ordner Downloads', /Download/.test(msgS), msgS);
      ok('Speichern: Antragsmappe.pdf liegt in Downloads (Android ' + sdk + ')', /Antragsmappe.*\.pdf/.test(liste), liste.slice(0, 300));
      const kopf = adb('shell "head -c 5 /sdcard/Download/Antragsmappe.pdf"');
      ok('Speichern: Datei ist ein PDF', /%PDF-/.test(kopf), kopf);
    } else {
      let wahl = false;
      for (let i = 0; i < 30 && !wahl; i++) { await warte(1000); wahl = /documentsui|DocumentsActivity|CreateDocument/i.test(oben()); }
      ok('Speichern (Android ' + sdk + '): „Speichern unter“ des Systems geöffnet', wahl, oben().slice(0, 300));
      adb('shell input keyevent 4'); await warte(1500);
      const msgA = await p.evaluate(() => document.getElementById('copyMsg').textContent).catch(() => '');
      ok('Speichern abgebrochen: keine Fehlermeldung', !/nicht|fehl/i.test(msgA), msgA);
    }
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
