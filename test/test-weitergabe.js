// Weitergabe an den Klienten (src/weitergabe.js): Kodierung/Dekodierung, Kompression, PIN (AES-GCM/PBKDF2), falsche PIN,
// Größenlimit, QR-Grenze, Datei-Format und strenge Prüfung bösartiger Daten. Aufruf: node test/test-weitergabe.js
'use strict';
const W = require('../src/weitergabe.js');
let fails = 0;
const ck = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x || ''); } else console.log('ok  ', n); };
const art = (p) => p.then(() => 'ok', (e) => e && e.art);

const blatt = {
  l: 'en', rtl: false, zwei: true,
  titel: { art: 'h', k: 'Put together for you', de: 'Für dich zusammengestellt' },
  kopf: { art: 'p', k: 'Date: 21/11/2026', de: 'Datum: 21.11.2026' },
  abschnitte: [{ teil: 'unterlagen', h: { art: 'h', k: 'Bring along', de: 'Das bringst du mit' }, zeilen: [{ art: 'h3', k: 'Wohngeld', de: null }, { art: 'li', k: 'Rental agreement', de: 'Mietvertrag' }] }]
};
const auswahl = { s: 1, typ: 'auswahl', name: 'Familie A', datum: '2026-11-21', blatt, fristen: { v: 1, e: [{ id: 'ab12', art: 'zahl', bis: '2026-12-15', basis: { fest: '2026-12-15' } }] } };
const state = { s: { kinder: 2, miete: 650, plz: '90542', bezug: { wg: true } }, p: { name: 'Max Muster', geb: '01.01.1980', strasse: 'Weg 1', ort: '90542 Eckental', tel: '' }, e: true };
const vorgang = { s: 1, typ: 'vorgang', name: 'Haushalt B', datum: '2026-11-21', daten: { 'lotse.state': JSON.stringify(state), 'lotse.haken': JSON.stringify({ 'wg|u.miet': true }) } };

(async () => {
  // Rundreise ohne PIN
  const c1 = await W.packen(auswahl, null);
  ck('Kode beginnt mit SOLO: und ist base64url', c1.startsWith('SOLO:') && /^[A-Za-z0-9_-]+$/.test(c1.slice(5)));
  ck('Ohne PIN: keine PIN nötig', !W.brauchtPin(c1) && W.istCode(c1));
  const r1 = await W.auspacken(c1);
  ck('Rundreise Auswahl (Blatt + Fristen) unverändert', JSON.stringify(r1.blatt) === JSON.stringify(blatt) && r1.fristen.e.length === 1 && r1.name === 'Familie A');
  // Kompression wirkt
  const gross = JSON.parse(JSON.stringify(auswahl)); for (let i = 0; i < 80; i++) gross.blatt.abschnitte[0].zeilen.push({ art: 'li', k: 'Lohnabrechnungen der letzten 3 Monate', de: 'Lohnabrechnungen der letzten 3 Monate' });
  const cg = await W.packen(gross, null);
  ck('Kompression (deflate-raw) verkleinert deutlich', W.kannKomprimieren() && cg.length < JSON.stringify(gross).length / 3, cg.length + ' vs ' + JSON.stringify(gross).length);
  ck('Merker „komprimiert“ gesetzt', (W.unb64url(cg.slice(5))[1] & 1) === 1);
  // Mit PIN
  const pin = W.pinVorschlag();
  ck('PIN-Vorschlag: 6 Ziffern', /^\d{6}$/.test(pin) && W.pinOk(pin));
  const c2 = await W.packen(vorgang, pin);
  ck('Mit PIN: Kode verlangt PIN, Klartext nicht lesbar', W.brauchtPin(c2) && !Buffer.from(c2.slice(5), 'base64').toString('latin1').includes('Muster'));
  ck('Ohne PIN-Eingabe: Fehler „pin“', await art(W.auspacken(c2)) === 'pin');
  ck('Falsche PIN: Fehler „pinFalsch“', await art(W.auspacken(c2, pin === '000000' ? '111111' : '000000')) === 'pinFalsch');
  const r2 = await W.auspacken(c2, pin);
  ck('Richtige PIN: Vorgang mit Angaben zurück', r2.typ === 'vorgang' && JSON.parse(r2.daten['lotse.state']).p.name === 'Max Muster');
  ck('Zwei Kodierungen mit gleicher PIN unterscheiden sich (zufälliges Salz und IV)', (await W.packen(vorgang, pin)) !== c2);
  ck('Ungültige PIN beim Packen abgelehnt', await art(W.packen(vorgang, '12a')) === 'pin');
  // Manipulation mit PIN: GCM erkennt
  const bytes = W.unb64url(c2.slice(5)); bytes[bytes.length - 1] ^= 1;
  ck('Veränderter verschlüsselter Kode: wird abgelehnt', await art(W.auspacken('SOLO:' + W.b64url(bytes), pin)) === 'pinFalsch');
  // Datei
  const f = W.datei(c1);
  ck('Datei: JSON mit format/v/code, wieder lesbar', JSON.parse(f).format === 'solo' && W.ausDatei(f) === c1 && W.ausDatei(c1) === c1);
  ck('Datei: fremde Felder/Format abgelehnt', ['{"format":"solo","v":1,"code":"' + c1 + '","x":1}', '{"format":"pdf","v":1,"code":"' + c1 + '"}', '<html>', ''].every((t) => { try { W.ausDatei(t); return false; } catch (e) { return e.art === 'format'; } }));
  ck('Datei: zu groß abgelehnt', (() => { try { W.ausDatei('x'.repeat(W.MAX_DATEI + 1)); return false; } catch (e) { return e.art === 'zuGross'; } })());
  // Format-Fehler
  ck('Kaputter Kode: Format-Fehler', await art(W.auspacken('SOLO:@@@')) === 'format' && await art(W.auspacken('HALLO')) === 'format' && await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([2, 0, 1])))) === 'format');
  // Kompressions-Bombe: entpackt größer als 512 KB
  const bombe = await new Promise((res) => { const zlib = require('zlib'); res(zlib.deflateRawSync(Buffer.alloc(W.MAX_INHALT + 10000, 32))); });
  ck('Kompressions-Bombe (> 512 KB entpackt): „zuGross“', await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([1, 1, ...bombe])))) === 'zuGross');
  // Zu großer Inhalt beim Packen
  const riesig = { s: 1, typ: 'auswahl', blatt: JSON.parse(JSON.stringify(blatt)) }; for (let i = 0; i < 300; i++) riesig.blatt.abschnitte[0].zeilen.push({ art: 'li', k: 'x'.repeat(1900), de: null });
  ck('Inhalt über 512 KB: „zuGross“', await art(W.packen(riesig, null)) === 'zuGross');
  // QR-Grenze
  ck('QR: kleiner Kode passt (Version ≤ 25)', W.qrMatrix(c1) && W.qrMatrix(c1).version <= W.QR_MAX);
  const zufallText = require('crypto').randomBytes(1500).toString('base64url');
  ck('QR: zu großer Kode → null (Hinweis „bitte als Datei“)', W.qrMatrix('SOLO:' + zufallText) === null);
  // Bösartige Daten
  const pack = async (o) => 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from(JSON.stringify(o))]));
  const boese = [
    ['Unbekanntes Feld oben', { ...auswahl, x: 1 }],
    ['Unbekannter Typ', { ...auswahl, typ: 'skript' }],
    ['Falsche Version', { ...auswahl, s: 2 }],
    ['Unbekannter Datenschlüssel', { ...vorgang, daten: { 'lotse.state': vorgang.daten['lotse.state'], 'lotse.vorgaenge': '{}' } }],
    ['Haken der Beraterin nicht übertragbar', { ...vorgang, daten: { 'lotse.beratung-haken': '{}' } }],
    ['Kein JSON im Wert', { ...vorgang, daten: { 'lotse.haken': 'kein json' } }],
    ['__proto__ im Wert', { ...vorgang, daten: { 'lotse.haken': '{"__proto__":{"x":1}}' } }],
    ['Zu tief verschachtelt', { ...vorgang, daten: { 'lotse.haken': '[[[[[[[[[[[1]]]]]]]]]]]' } }],
    ['Steuerzeichen im Namen', { ...auswahl, name: 'A\u0000B' }],
    ['Name zu lang', { ...auswahl, name: 'x'.repeat(25) }],
    ['state mit fremdem Feld', { ...vorgang, daten: { 'lotse.state': JSON.stringify({ ...state, boese: 1 }) } }],
    ['Person mit fremdem Feld', { ...vorgang, daten: { 'lotse.state': JSON.stringify({ ...state, p: { name: 'x', html: '<b>' } }) } }],
    ['Blatt: unbekannte Zeilenart', { ...auswahl, blatt: { ...blatt, abschnitte: [{ ...blatt.abschnitte[0], zeilen: [{ art: 'script', k: 'x' }] }] } }],
    ['Blatt: unbekannter Teil', { ...auswahl, blatt: { ...blatt, abschnitte: [{ ...blatt.abschnitte[0], teil: 'iframe' }] } }],
    ['Blatt: Teil doppelt', { ...auswahl, blatt: { ...blatt, abschnitte: [blatt.abschnitte[0], blatt.abschnitte[0]] } }],
    ['Blatt: unbekannte Sprache', { ...auswahl, blatt: { ...blatt, l: 'xx' } }],
    ['Blatt: Zeile mit fremdem Feld (onclick)', { ...auswahl, blatt: { ...blatt, titel: { art: 'h', k: 'x', onclick: 'alert(1)' } } }],
    ['Fristen: mehr als 50', { ...auswahl, fristen: { v: 1, e: Array.from({ length: 51 }, () => ({ art: 'zahl' })) } }],
    ['Vorgang ohne Daten', { ...vorgang, daten: {} }],
    ['Vorgang mit Blatt gemischt', { ...vorgang, blatt }],
    ['Wert zu groß', { ...vorgang, daten: { 'lotse.haken': JSON.stringify({ a: 'x'.repeat(5001) }) } }]
  ];
  for (const [n, o] of boese) ck('Bösartig abgelehnt: ' + n, await art(W.auspacken(await pack(o))) === 'schema');
  ck('Bösartig: packen verweigert ebenfalls', await art(W.packen({ ...auswahl, x: 1 }, null)) === 'schema');
  // HTML bleibt Text (nicht verboten, nur nie als HTML angezeigt): Rundreise unverändert
  const html = JSON.parse(JSON.stringify(auswahl)); html.blatt.titel.k = '<img src=x onerror=alert(1)>';
  ck('HTML-Zeichen bleiben reiner Text (Anzeige nur mit textContent)', (await W.auspacken(await W.packen(html, null))).blatt.titel.k === '<img src=x onerror=alert(1)>');
  ck('Gleiche PBKDF2-Werte wie Vorgangs-PIN (600 000)', W.ITER === 600000);
  console.log(fails ? fails + ' Fehler' : '[weitergabe] alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
})();
