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
  check('Falsche PIN: Meldung, Abfrage bleibt', await bis(() => $2('kwImpMsg').textContent === DE['kw.imp.pinFalsch']) && !!$2('kwImpPin'));
  $2('kwImpPin').value = pinA; $2('kwImpPinOk').click();
  check('Richtige PIN: Vorschau „Das bekommst du“ mit Haken', await bis(() => $2('kwImpTeile')) && $2('kwImpBox').textContent.includes(DE['kw.imp.vorschau']) && [...d2.querySelectorAll('#kwImpTeile input')].every((c) => c.checked));
  const vorher = JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[1]}}').klar.liste.length;
  $2('kwImpName').value = 'Familie <b>X</b>';
  $2('kwImpSpeichern').click();
  check('Gespeichert als neuer Vorgang (Meldung)', await bis(() => $2('kwImpOk')) && $2('kwImpOk').textContent.includes('Familie <b>X</b>') && !$2('kwImpOk').querySelector('b'));
  const nachher = JSON.parse(store['lotse.vorgaenge']).klar;
  check('Neuer Vorgang angelegt, eigener Vorgang bleibt geöffnet und unverändert', nachher.liste.length === vorher + 1 && store['lotse.state'] === eigenerStand && nachher.liste[nachher.liste.length - 1].daten['lotse.state'] === ia.daten['lotse.state']);
  // Datei (b) ohne PIN: Blatt + Fristen-Rückfrage
  dateiWaehlen(w2, $2('kwDateiEin'), dateiOhne);
  check('Datei ohne PIN: gleich die Vorschau', await bis(() => $2('kwImpTeile')) && !$2('kwImpPin'));
  $2('kwImpSpeichern').click();
  await bis(() => $2('kwImpOk'));
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
  check('Keine Skriptfehler (Klient)', B.errors.length === 0, B.errors.join(' | '));
  console.log(fails ? fails + ' Fehler' : '[weitergabe-dom] alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL Ausnahme', e && e.stack); process.exit(1); });
