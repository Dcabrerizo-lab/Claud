// Weitergabe an die SoLo-App des Klienten (src/klient.js + src/weitergabe.js) in der fertigen Web-Version (dist) mit JSDOM:
// Auswahl a/b (ganzer Vorgang / ausgewählte Teile), PIN an/aus, QR-Code sichtbar, SoLo-Datei teilen, Import beim Klienten mit
// PIN, Vorschau „Das bekommst du“, neuer Vorgang (nichts überschrieben), Fristen-Rückfrage, Blatt in „Mein Ordner“, XSS. Aufruf: node test/test-weitergabe-dom.js
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const nodeCrypto = require('crypto');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
const W = require('../src/weitergabe.js');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };
const DE = I18N.de;
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const KW = Object.keys(JSON.parse(fs.readFileSync(__dirname + '/../src/lang/klient/de.json', 'utf8'))).filter((k) => k.startsWith('kw.'));
check('Texte „kw.*“ in allen 13 Sprachen', KW.length > 50 && LANGS.every((l) => KW.every((k) => typeof I18N[l][k] === 'string' && I18N[l][k].length > 0)));

class FakeFile { constructor(parts, name, o) { this.parts = parts; this.name = name; this.type = (o && o.type) || ''; this.size = parts.join('').length; } text() { return Promise.resolve(this.parts.join('')); } }

function app(store) {
  const errors = [], aus = { geteilt: null };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {};
      Object.defineProperty(w, 'crypto', { value: nodeCrypto.webcrypto, configurable: true });
      w.CompressionStream = globalThis.CompressionStream; w.DecompressionStream = globalThis.DecompressionStream;
      w.TextEncoder = globalThis.TextEncoder; w.TextDecoder = globalThis.TextDecoder;
      w.File = FakeFile;
      w.navigator.canShare = (o) => !!(o && o.files && o.files.length);
      w.navigator.share = (o) => { aus.geteilt = o; return Promise.resolve(); };
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
    }
  });
  return { dom, w: dom.window, d: dom.window.document, errors, aus };
}
const bis = async (fn, ms = 8000) => { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) return false; await new Promise((r) => setTimeout(r, 25)); } return true; };
const fire = (w, el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const dateiWaehlen = (w, input, text) => { Object.defineProperty(input, 'files', { value: [new FakeFile([text], 'x.solo', { type: 'text/plain' })], configurable: true }); fire(w, input, 'change'); };

(async () => {
  // ---------- Beraterin: zusammenstellen und weitergeben ----------
  const A = app({}), w = A.w, d = A.d, $ = (id) => d.getElementById(id);
  d.querySelector('#appnav [data-ansicht="start"]').click(); $('goLeistungen').click();
  $('p1').click();
  $('beratungBtn').click();
  $('kbOpen').click();
  check('Weitergabe-Bereich im Blatt sichtbar, PIN standardmäßig an (6 Ziffern)', !$('kwBox').hidden && $('kwPinAn').checked && /^\d{3} \d{3}$/.test($('kwPin').textContent));
  const passt0 = await w.Klient.qrPruefen();
  check('[rot-d] QR-Vorprüfung: Hinweis „zu viel“ schon vor dem Tippen genau dann, wenn es nicht passt', $('kwQrHinweis').hidden === !!passt0 && $('kwQrBtn').hasAttribute('aria-disabled') === !passt0);
  const auf = d.querySelector('#kbHilfenAuf');
  check('[rot-d] Klient-Seite: zwei Schritte, Gruppen zugeklappt mit Zähler, Vorschau zugeklappt', d.querySelectorAll('#klientBlatt .kb-schritt').length === 2 && auf && !auf.open && /\(\d+ von \d+\)$/.test(auf.querySelector('summary').textContent) && $('kbSeite').classList.contains('kb-zu') && $('kbVorschau').getAttribute('aria-expanded') === 'false');
  $('kbVorschau').click();
  check('[rot-d] Vorschau zeigen klappt das Blatt auf', !$('kbSeite').classList.contains('kb-zu') && $('kbVorschau').getAttribute('aria-expanded') === 'true');
  check('Auswahl a/b: „Nur ausgewählte Teile“ voreingestellt', $('kwModus-blatt').checked && !$('kwModus-vorgang').checked && !!$('kbHilfen'));
  // (b) nur gewählte Teile → QR
  [...d.querySelectorAll('#kbHilfen input[data-kb]')].slice(1).forEach((c) => { c.checked = false; fire(w, c, 'change'); });
  [...d.querySelectorAll('#kbUnterlagen input[data-kb]')].slice(1).forEach((c) => { c.checked = false; fire(w, c, 'change'); });
  const pinB = $('kwPin').textContent.replace(' ', '');
  $('kwQrBtn').click();
  check('QR-Code zeigen: SVG sichtbar (Version ≤ 25), Hilfe und Hinweis „PIN mündlich sagen“', await bis(() => !$('kwQr').hidden && $('kwQr').querySelector('svg')) && +$('kwQr').querySelector('svg').getAttribute('data-version') <= 25 && $('kwQr').textContent.includes(DE['kw.qr.hilfe']) && $('kwQr').textContent.includes(DE['kw.pin.hinweis']), $('kwMsg').textContent);
  check('PIN steht nicht beim QR-Code (ein Foto des Codes enthält die PIN nicht)', !$('kwQr').textContent.replace(/\s/g, '').includes(pinB));
  // Inhalt (b) prüfen: nur Gewähltes, keine Angaben
  const ib = w.Klient.inhaltFuerWeitergabe();
  check('Inhalt (b): Blatt-Daten mit nur einer Hilfe, keine gespeicherten Eingaben', ib.typ === 'auswahl' && !ib.daten && ib.blatt.abschnitte.find((a) => a.teil === 'hilfen').zeilen.filter((z) => z.art === 'h3').length === 1);
  // SoLo-Datei (b) teilen
  A.aus.geteilt = null; $('kwDateiBtn').click();
  check('Als SoLo-Datei teilen: Teilen-Menü mit .solo-Datei', await bis(() => A.aus.geteilt) && /\.solo$/.test(A.aus.geteilt.files[0].name));
  const dateiB = await A.aus.geteilt.files[0].text();
  check('SoLo-Datei (b) mit PIN: verschlüsselt, ohne Klartext', W.brauchtPin(W.ausDatei(dateiB)) && !/Wohngeld|Kindergeld/.test(dateiB));
  // PIN aus
  $('kwPinAn').checked = false; fire(w, $('kwPinAn'), 'change');
  check('PIN aus: Hinweis „Wer den Code oder die Datei hat, kann es lesen.“', !$('kwPin') && $('kwOhnePin').textContent === DE['kw.pin.aus']);
  A.aus.geteilt = null; $('kwDateiBtn').click(); await bis(() => A.aus.geteilt);
  const dateiOhne = await A.aus.geteilt.files[0].text();
  check('SoLo-Datei ohne PIN: keine PIN nötig', !W.brauchtPin(W.ausDatei(dateiOhne)));
  $('kwPinAn').checked = true; fire(w, $('kwPinAn'), 'change');
  // (a) ganzer Vorgang
  $('kwModus-vorgang').checked = true; fire(w, $('kwModus-vorgang'), 'change');
  check('Auswahl (a): keine Haken, Übersicht „Das bekommt dein Klient“, Drucken/Teilen ausgeblendet', !$('kbHilfen') && $('kbSeite').textContent.includes(DE['kw.vorgang.h']) && $('kbSeite').textContent.includes(DE['kw.teil.state']) && $('kbDruck').hidden);
  const pinA = $('kwPin').textContent.replace(' ', '');
  A.aus.geteilt = null; $('kwDateiBtn').click(); await bis(() => A.aus.geteilt);
  const dateiA = await A.aus.geteilt.files[0].text();
  const ia = await W.auspacken(W.ausDatei(dateiA), pinA);
  check('Inhalt (a): ganzer Vorgang mit gespeicherten Angaben, ohne Haken der Beraterin', ia.typ === 'vorgang' && !!ia.daten['lotse.state'] && !ia.daten['lotse.beratung-haken']);
  $('kwQrBtn').click(); await bis(() => $('kwMsg').textContent && $('kwMsg').textContent !== DE['kw.bitte'] || !$('kwQr').hidden);
  check('QR bei großem Inhalt: ehrlicher Hinweis oder passender Code', (!$('kwQr').hidden && !!$('kwQr').querySelector('svg')) || $('kwMsg').textContent === DE['kw.f.qrGross'], $('kwMsg').textContent);
  $('kbClose').click();
  check('Schließen vergisst die PIN (Bereich leer)', $('kwBox').textContent === '');
  check('Keine Skriptfehler (Beraterin)', A.errors.length === 0, A.errors.join(' | '));

  // ---------- Klient: öffnen (Privatmodus, für alle Nutzer) ----------
  const store = {};
  const B = app(store), w2 = B.w, d2 = B.d, $2 = (id) => d2.getElementById(id);
  // eigener Vorgang des Klienten mit Angaben (darf nicht überschrieben werden)
  d2.querySelector('#appnav [data-ansicht="start"]').click(); $2('goLeistungen').click(); $2('p2').click();
  await bis(() => store['lotse.state']);
  const eigenerStand = store['lotse.state'];
  d2.querySelector('#appnav [data-ansicht="ordner"]').click();
  check('Mein Ordner: „Von der Beratung bekommen“ auch ohne Beratungsmodus', !!$2('kwImport') && !$2('kwDatei').hidden && $2('kbOpen').hidden);
  // ohne BarcodeDetector: ehrlicher Hinweis
  $2('kwScan').click();
  check('QR scannen ohne Kamera-Erkennung: Hinweis auf SoLo-Datei', $2('kwImpMsg').textContent === DE['kw.imp.keinScan']);
  // ungültige Datei
  dateiWaehlen(w2, $2('kwDateiEin'), '<html><script>alert(1)</script>');
  check('Ungültige Datei: Fehlermeldung, keine Vorschau', await bis(() => $2('kwImpMsg').textContent === DE['kw.imp.f.format']) && $2('kwImpBox').hidden);
  // Datei (a) mit PIN
  dateiWaehlen(w2, $2('kwDateiEin'), dateiA);
  check('Datei mit PIN: PIN-Abfrage', await bis(() => $2('kwImpPin')));
  $2('kwImpPin').value = pinA === '000000' ? '111111' : '000000'; $2('kwImpPinOk').click();
  check('Falsche PIN: Meldung, Abfrage bleibt', await bis(() => $2('kwImpPinFehler') && !$2('kwImpPinFehler').hidden) && !!$2('kwImpPin') && $2('kwImpMsg').textContent === '');
  check('[rot-d] Falsche PIN: Meldung rot am Feld, Feld nicht geleert, „PIN zeigen“ schaltet um', !$2('kwImpPinFehler').hidden && $2('kwImpPinFehler').textContent === DE['kw.imp.pinFalsch'] && $2('kwImpPin').getAttribute('aria-invalid') === 'true' && $2('kwImpPin').value !== '' && ($2('kwImpPinZeigen').click(), $2('kwImpPin').type === 'text'));
  $2('kwImpPin').value = pinA; $2('kwImpPinOk').click();
  check('Richtige PIN: Vorschau „Das bekommst du“ mit Haken', await bis(() => $2('kwImpTeile')) && $2('kwImpBox').textContent.includes(DE['kw.imp.vorschau']) && [...d2.querySelectorAll('#kwImpTeile input')].every((c) => c.checked));
  const vorher = JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[1]}}').klar.liste.length;
  $2('kwImpName').value = 'Familie <b>X</b>';
  $2('kwImpSpeichern').click();
  check('Gespeichert als neuer Vorgang (Meldung)', await bis(() => $2('kwImpOk')) && $2('kwImpOk').textContent.includes('Familie <b>X</b>') && !$2('kwImpOk').querySelector('b'));
  await bis(() => JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length > vorher); // Speichern läuft über die Schreibkette (Vorgaenge), ein Takt später
  const nachher = JSON.parse(store['lotse.vorgaenge']).klar;
  check('Neuer Vorgang angelegt, eigener Vorgang bleibt geöffnet und unverändert', nachher.liste.length === vorher + 1 && store['lotse.state'] === eigenerStand && nachher.liste[nachher.liste.length - 1].daten['lotse.state'] === ia.daten['lotse.state']);
  // Datei (b) ohne PIN: Blatt + Fristen-Rückfrage
  const vorher2 = JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length;
  dateiWaehlen(w2, $2('kwDateiEin'), dateiOhne);
  check('Datei ohne PIN: gleich die Vorschau', await bis(() => $2('kwImpTeile')) && !$2('kwImpPin'));
  $2('kwImpSpeichern').click();
  await bis(() => $2('kwImpOk'));
  await bis(() => JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length > vorher2);
  const liste = JSON.parse(store['lotse.vorgaenge']).klar.liste, neu = liste[liste.length - 1];
  check('Blatt als Daten im neuen Vorgang (lotse.klient-blatt)', !!neu.daten['lotse.klient-blatt'] && JSON.parse(neu.daten['lotse.klient-blatt']).abschnitte.length >= 1);
  // Öffnen → Mein Ordner zeigt „Von deiner Beratung“
  $2('kwImpOeffnen').click();
  d2.querySelector('#appnav [data-ansicht="ordner"]').click();
  check('Mein Ordner: Zeile „Von deiner Beratung“ im geöffneten neuen Vorgang', await bis(() => $2('or-beratung')));
  $2('or-beratung').click();
  check('Blatt ansehen ohne Beratungsmodus: Blatt sichtbar, keine Auswahl, keine Weitergabe', !$2('klientBlatt').hidden && $2('kbWahl').hidden && $2('kwBox').hidden && $2('kbSeite').querySelectorAll('.kb-abschnitt').length >= 1 && $2('h-kb').textContent === DE['kw.blatt.h']);
  $2('kbClose').click();
  check('Blatt schließen', $2('klientBlatt').hidden);
  // XSS über manipuliertes Blatt: nur Text
  const boese = await W.packen({ s: 1, typ: 'auswahl', name: 'X', blatt: { l: 'de', rtl: false, zwei: false, titel: { art: 'h', k: '<img src=x onerror="window.boese=1">' }, kopf: { art: 'p', k: 'k' }, abschnitte: [{ teil: 'hilfen', h: { art: 'h', k: '<script>window.boese=1</script>' }, zeilen: [{ art: 'li', k: '<b>fett</b>' }] }] } }, null);
  d2.querySelector('#appnav [data-ansicht="ordner"]').click();
  dateiWaehlen(w2, $2('kwDateiEin'), W.datei(boese));
  check('XSS: Vorschau nur als Text', await bis(() => $2('kwImpTeile')) && !d2.querySelector('#kwImpBox script, #kwImpBox img'));
  $2('kwImpSpeichern').click(); await bis(() => $2('kwImpOk')); $2('kwImpOeffnen').click();
  d2.querySelector('#appnav [data-ansicht="ordner"]').click(); await bis(() => $2('or-beratung')); $2('or-beratung').click();
  check('XSS: Blatt nur als Text, kein Bild, kein Skript ausgeführt', !d2.querySelector('#kbSeite img, #kbSeite script, #kbSeite b') && !w2.boese && $2('kbSeite').textContent.includes('<img'));

  // ---------- SoLo-Datei direkt mit der App öffnen (Dateizuordnung Android/iOS, src/weitergabe.js nativInit) ----------
  // Nachgestellt: App-Plugin (appUrlOpen, getLaunchUrl) und Filesystem-Plugin. Es muss derselbe Weg wie „Datei öffnen“ laufen (PIN-Abfrage).
  {
    const NW = w2.Weitergabe;
    const merk2 = { m: {}, getItem(k) { return this.m[k] || null; }, setItem(k, v) { this.m[k] = String(v); } }; // wie sessionStorage
    check('Öffnen-Adressen: Android nur content://, iOS nur file:///….solo',
      NW.nativErlaubt('content://com.whatsapp.provider.media/item/1', false) && !NW.nativErlaubt('file:///sdcard/x.solo', false) && !NW.nativErlaubt('https://x.de/a.solo', false) &&
      NW.nativErlaubt('file:///var/mobile/Containers/Data/Application/X/Documents/Inbox/SoLo-Vorgang.solo', true) && !NW.nativErlaubt('file:///etc/passwd', true) &&
      !NW.nativErlaubt('content://a/b.solo', true) && !NW.nativErlaubt('content://a/b\nc', false) && !NW.nativErlaubt(null, false) && !NW.nativErlaubt('javascript:alert(1)//.solo', true));
    const dateien = { 'content://p/a': dateiA, 'content://p/kaputt': '<html><script>window.boese=2</script>', 'content://p/gross': 'x' };
    const log = { gelesen: [], geloescht: [] };
    const fsFake = {
      stat: async ({ path }) => { if (path === 'content://p/gross') return { size: W.MAX_DATEI + 1 }; if (!(path in dateien)) throw new Error('fehlt'); return { size: dateien[path].length }; },
      readFile: async ({ path, encoding, length }) => { log.gelesen.push(path + '|' + encoding); log.laenge = length; if (!(path in dateien)) throw new Error('fehlt'); return { data: dateien[path] }; },
      deleteFile: async ({ path }) => { log.geloescht.push(path); }
    };
    const hoerer = {};
    const appFake = { addListener: (n, fn) => { hoerer[n] = fn; return Promise.resolve({ remove() {} }); }, getLaunchUrl: async () => ({ url: 'content://p/a' }) };
    d2.querySelector('#appnav [data-ansicht="start"]').click();
    await NW.nativInit({ app: appFake, fs: fsFake, ios: false, merker: merk2, zeigen: () => d2.querySelector('#appnav [data-ansicht="ordner"]').click() });
    check('Android: Start mit .solo-Datei → „Mein Ordner“, PIN-Abfrage der Datei', await bis(() => $2('kwImpPin')) && $2('app').getAttribute('data-ansicht') === 'ordner' && $2('kwImport').open && log.gelesen[0] === 'content://p/a|utf8');
    // Unabhängige Prüfung 21.11.2026: Die Größe meldet die fremde App (kann fehlen oder falsch sein) → beim Lesen selbst begrenzen
    check('Android: Lesen auf MAX_DATEI + 1 Byte begrenzt', log.laenge === W.MAX_DATEI + 1);
    check('iOS: gelöscht wird nur die Kopie im Eingangsordner, nie eine Datei an anderem Ort',
      NW.nativKopie('file:///var/mobile/Containers/Data/Application/X/Documents/Inbox/SoLo-Vorgang.solo') && NW.nativKopie('file:///private/var/mobile/Containers/Data/Application/X/tmp/com.Sozialleistungslotse-Inbox/a%20b.solo') &&
      !NW.nativKopie('file:///var/mobile/Containers/Data/Application/X/Documents/a.solo') && !NW.nativKopie('file:///private/var/mobile/Library/Mobile%20Documents/com~apple~CloudDocs/a.solo') &&
      !NW.nativKopie('file:///var/X/Documents/Inbox/../a.solo') && !NW.nativKopie('file:///var/X/Documents/Inbox/%2e%2e/a.solo') && !NW.nativKopie('file:///var/X/Documents/Inbox/u/a.solo') && !NW.nativKopie('file:///var/X/Documents/Inbox/a.pdf') && !NW.nativKopie('file:///%E0%A4%A/Documents/Inbox/a.solo'));
    hoerer.appUrlOpen({ url: 'content://p/a' });
    await new Promise((r) => setTimeout(r, 100));
    check('Android: dieselbe Datei beim Start doppelt gemeldet → nur einmal gelesen', log.gelesen.length === 1 && !!$2('kwImpPin'));
    check('Android: nach dem Neuladen meldet getLaunchUrl die alte Datei → nicht noch einmal', (await NW.nativOeffnen('content://p/a', true)) === false && log.gelesen.length === 1);
    $2('kwImpPin').value = pinA; $2('kwImpPinOk').click();
    check('Android: richtige PIN → Vorschau (vorhandener Weg)', await bis(() => $2('kwImpTeile')));
    $2('kwImpAbbr').click();
    hoerer.appUrlOpen({ url: 'content://p/kaputt' });
    check('Android: falsche Datei → Hinweis, keine Vorschau, nichts ausgeführt', await bis(() => $2('kwImpMsg').textContent === DE['kw.imp.f.format']) && $2('kwImpBox').hidden && !w2.boese);
    hoerer.appUrlOpen({ url: 'content://p/gross' });
    check('Android: zu große Datei → Hinweis, gar nicht gelesen', await bis(() => $2('kwImpMsg').textContent === DE['kw.imp.f.zuGross']) && !log.gelesen.some((x) => x.startsWith('content://p/gross')));
    hoerer.appUrlOpen({ url: 'content://p/fehlt' });
    check('Android: Datei nicht lesbar (Leserecht weg) → Hinweis', await bis(() => $2('kwImpMsg').textContent === DE['kw.imp.f.format']));
    const n0 = log.gelesen.length;
    hoerer.appUrlOpen({ url: 'https://example.org/a.solo' }); hoerer.appUrlOpen({ url: 'file:///sdcard/a.solo' });
    await new Promise((r) => setTimeout(r, 100));
    check('Android: andere Adressen werden nicht gelesen, auf Android wird nichts gelöscht', log.gelesen.length === n0 && log.geloescht.length === 0);
    check('Kein Dateiname im Sitzungsspeicher (nur Fingerabdruck)', /^\[\["[0-9a-f]+",\d+\]/.test(merk2.getItem('solo.geoeffnet')) && !merk2.getItem('solo.geoeffnet').includes('content'));
  }
  {
    // iOS: Kopie in Documents/Inbox lesen, danach löschen; Reste in Inbox aufräumen (nur .solo)
    const C = app({}), w3 = C.w, d3 = C.d, $3 = (id) => d3.getElementById(id);
    const url = 'file:///var/mobile/Containers/Data/Application/X/Documents/Inbox/SoLo-Unterlagen.solo';
    const log = { gelesen: [], geloescht: [] };
    const fsFake = {
      stat: async () => ({ size: dateiOhne.length }),
      readFile: async ({ path }) => { log.gelesen.push(path); if (log.geloescht.includes(path)) throw new Error('gelöscht'); return { data: dateiOhne }; },
      deleteFile: async ({ path, directory }) => { log.geloescht.push(directory ? directory + ':' + path : path); },
      readdir: async () => ({ files: [{ name: 'alt.solo', type: 'file' }, { name: 'brief.pdf', type: 'file' }] })
    };
    const appFake = { addListener: () => Promise.resolve({ remove() {} }), getLaunchUrl: async () => ({ url }) };
    await w3.Weitergabe.nativInit({ app: appFake, fs: fsFake, ios: true, merker: { m: {}, getItem(k) { return this.m[k] || null; }, setItem(k, v) { this.m[k] = String(v); } }, zeigen: () => d3.querySelector('#appnav [data-ansicht="ordner"]').click() });
    check('iOS: .solo-Datei ohne PIN → gleich die Vorschau', await bis(() => $3('kwImpTeile')) && log.gelesen[0] === url);
    check('iOS: Kopie nach dem Lesen gelöscht, alter Rest in Inbox gelöscht, andere Dateien bleiben', log.geloescht.includes(url) && log.geloescht.includes('DOCUMENTS:Inbox/alt.solo') && !log.geloescht.some((x) => x.includes('brief.pdf')));
    // Datei an anderem Ort (kein Eingangsordner): lesen ja, löschen nie; ohne Längenangabe (iOS liest die eigene Kopie)
    const fremd = 'file:///private/var/mobile/Library/Mobile%20Documents/com~apple~CloudDocs/SoLo-Original.solo';
    let opt = null; const lesen0 = fsFake.readFile; fsFake.readFile = async (o) => { opt = o; return lesen0(o); };
    await w3.Weitergabe.nativOeffnen(fremd);
    check('iOS: Datei außerhalb des Eingangsordners wird gelesen, aber nicht gelöscht', log.gelesen.includes(fremd) && !log.geloescht.includes(fremd) && opt && !('length' in opt));
    check('Keine Skriptfehler (iOS-Öffnen)', C.errors.length === 0, C.errors.join(' | '));
  }
  check('Keine Skriptfehler (Klient)', B.errors.length === 0, B.errors.join(' | '));
  console.log(fails ? fails + ' Fehler' : '[weitergabe-dom] alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL Ausnahme', e && e.stack); process.exit(1); });
