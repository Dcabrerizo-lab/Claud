// Bösartige Weitergaben (SoLo-Datei / QR-Code von Fremden) in der fertigen Web-Version (dist) mit JSDOM:
// Schadcode in allen gespeicherten Eingaben eines „ganzen Vorgangs“, falsche Datentypen, Prototyp-Schlüssel, Kompressions-Bombe,
// falsche Dateien. Danach: nichts ausgeführt, kein eingeschleustes Element, keine Skriptfehler, eigener Vorgang unverändert,
// Fristen nur nach eigenem Haken. Aufruf: node test/test-weitergabe-boese.js
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const zlib = require('zlib');
const nodeCrypto = require('crypto');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(__dirname + '/../dist/sozialleistungslotse.html', 'utf8');
const W = require('../src/weitergabe.js');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else console.log('ok  ', n); };
const DE = I18N.de;
const BOESE = '"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
const art = (p) => p.then(() => 'ok', (e) => (e && e.art) || 'ausnahme');

class FakeFile { constructor(parts, name, o) { this.parts = parts; this.name = name; this.type = (o && o.type) || ''; this.size = (o && o.size) || parts.join('').length; } text() { return Promise.resolve(this.parts.join('')); } }
function app(store) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.addEventListener('error', (e) => errors.push(String((e.error && e.error.stack) || e.message)));
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {}; w.print = function () {};
      Object.defineProperty(w, 'crypto', { value: nodeCrypto.webcrypto, configurable: true });
      w.CompressionStream = globalThis.CompressionStream; w.DecompressionStream = globalThis.DecompressionStream;
      w.TextEncoder = globalThis.TextEncoder; w.TextDecoder = globalThis.TextDecoder;
      w.File = FakeFile;
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
    }
  });
  return { dom, w: dom.window, d: dom.window.document, errors };
}
const bis = async (fn, ms = 8000) => { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) return false; await new Promise((r) => setTimeout(r, 25)); } return true; };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fire = (w, el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const dateiWaehlen = (w, input, text, o) => { Object.defineProperty(input, 'files', { value: [new FakeFile([text], 'x.solo', Object.assign({ type: 'text/plain' }, o))], configurable: true }); fire(w, input, 'change'); };
const roh = (o) => 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from(JSON.stringify(o))]));

// ---------- Inhalte ----------
const B = BOESE;
const sBoese = { adults: 1, kids: 2, ek1Art: 'lohn', ek1Brutto: '1500', ek1Netto: '1150', miete: B, plz: B, bundesland: B, mietstufe: B, vermoegen: B, gebJahr: B, bhPerson: B, gdb: B, aufenthalt: B, baby: B, heizung: B, wohnform: B, bezug: { wg: true } };
const vorgangXss = {
  s: 1, typ: 'vorgang', name: '<b>X</b>', datum: '2026-11-21', daten: {
    'lotse.state': JSON.stringify({ s: sBoese, p: { name: B, geb: B, strasse: B, ort: '80331 ' + B, tel: B }, e: true, sf: { pos: B, ja: [B, 'kinder'] } }),
    'lotse.einfach': JSON.stringify({ es: { schritt: 3, geb: B, wohnen: B, miete: B, arbeit: B, lohn: B, plz: B, gdb: B, mz: { G: B }, schon: { x: B }, antworten: { name: B } }, an: false }),
    'lotse.pflegecheck': JSON.stringify({ antworten: { v: 2, alterJahre: B, alterMonate: B, vor: { 1: B, 5: true }, stufen: { '1.1': B, '5.16': B }, m5: { '5.1': { a: B }, '5.2': B }, m5Hilfe: { '5.1': B }, m5Wahl: { '5.1': B }, inkontinenz: { harn: B, stuhl: B }, ink: B, sonde: B, k4K: B, pos: 3 }, schaetzung: { pg: B, punkte: B, datum: '2026-11-01' } }),
    'lotse.pfaendung': JSON.stringify({ art: 'konto', schritt: 2, netto: B, pers: B, kg: B, kiz: B }),
    'lotse.haushalt': JSON.stringify({ v: 1, plan: { kg: 250, leist: 100, sonst: 5, aus: { essen: 300, [Object.keys({ strom: 1 })[0]]: 60 } }, weg: { essen: true }, ekBasis: 1500, ekV: 2,
      buch: [{ id: B, d: '2026-11-01', c: 500, k: B, n: B, w: true, bis: B }, { id: 'e1', d: '2026-11-02', c: 700, k: 'essen', n: B }], energie: { heiz: B, strom: { a: B, weg: B, d1: B }, gas: B } }),
    'lotse.haken': JSON.stringify({ 'wg|u.miet': B, 'x|y': { a: B }, z: [B] }),
    'lotse.ausziehen': JSON.stringify({ ab: { x: true }, notiz: { vorher: B, tage: B, x: B } }),
    'lotse.fristliste': JSON.stringify({ v: 1, e: [{ id: 'ab12', art: 'eigen', titel: B, stelle: B, notiz: B, quelle: B, basis: { fest: '2026-12-15', frist: B } }, { id: 'ab13', art: 'frist', titel: B, notiz: B, basis: { fest: '2026-12-01' } }] }),
    'lotse.schulden': JSON.stringify({ v: 1, liste: [{ id: 'abc123', g: B.slice(0, 60), art: B, anfang: 100000, stand: 90000, rate: 5000, st: B, az: B.slice(0, 40), adr: B, n: B, faellig: '2026-12-01' }] })
  }
};
// Falsche Datentypen in allen Feldern (soll weder abstürzen noch die App unbenutzbar machen)
const muell = [null, true, 7, -1e300, 'x', [], [[1, 'a', null]], { a: { b: { c: [1, { d: 'e' }] } } }, { length: 5 }, { toString: 1, valueOf: 2, hasOwnProperty: 3 }];
const typVarianten = muell.map((m, i) => {
  const m2 = muell[(i + 3) % muell.length];
  return { s: 1, typ: 'vorgang', name: 'T' + i, daten: {
    'lotse.state': JSON.stringify({ s: { adults: m2 === null || typeof m2 !== 'object' || Array.isArray(m2) ? m2 : 1, kids: Array.isArray(m) ? m : 2, miete: [m, m2], plz: typeof m === 'string' ? m : 5, ek1Art: [], ek1Brutto: true, bezug: { wg: true }, toString: 5, valueOf: [1], hasOwnProperty: 'x', length: 3 }, p: { name: 'A' }, e: m === true ? true : false, big: m, sf: m }),
    'lotse.einfach': JSON.stringify({ es: m && typeof m === 'object' && !Array.isArray(m) ? Object.assign({ schritt: m2, mz: m2, schon: m2, geb: m2, miete: m2 }, m) : { schritt: m, mz: m, schon: m2, plz: m, geb: [m] }, an: i % 2 === 0 }),
    'lotse.pflegecheck': JSON.stringify({ antworten: m, schaetzung: m2 === null ? { pg: m, punkte: m, datum: m } : m2 }),
    'lotse.pfaendung': JSON.stringify({ art: i % 2 ? 'lohn' : 'konto', schritt: i % 3 ? m : 2, netto: m, pers: m2, kg: m, kiz: m2 }),
    'lotse.haushalt': JSON.stringify({ plan: i % 2 ? m : { kg: m, leist: m2, sonst: m, aus: m2 }, weg: m, ekBasis: m, ekV: m, buch: i % 2 ? m : [m, { d: '2026-11-01', c: 1, k: m, n: m2, id: m, w: m, bis: m }], energie: i % 2 ? { heiz: m, strom: m, gas: { a: m, n: m, weg: m, d1: m } } : m }),
    'lotse.haken': JSON.stringify(m === null || typeof m !== 'object' ? { a: m, 'wg|u.miet': m2 } : m),
    'lotse.ausziehen': JSON.stringify({ ab: m, notiz: i % 2 ? m : { vorher: m, tage: m2 } }),
    'lotse.fristliste': JSON.stringify({ v: 1, e: [{ art: 'eigen', titel: 'T', id: 'a1', basis: { fest: '2026-12-15' }, notiz: 'n', neu: 1 }] }),
    'lotse.schulden': JSON.stringify({ liste: i % 2 ? m : [m, { g: 'Bank', id: m, art: m, anfang: m, stand: m2, rate: m, st: m, az: m, adr: m, n: m, faellig: m, zu: m }] })
  } };
});

// Dieselben falschen Datentypen nur in den Feldern, die das jeweilige Modul beim Laden selbst prüft (kommen durch die Prüfung der Weitergabe)
const modulVarianten = typVarianten.map((v, i) => ({ s: 1, typ: 'vorgang', name: 'M' + i, daten: {
  'lotse.haushalt': v.daten['lotse.haushalt'], 'lotse.ausziehen': v.daten['lotse.ausziehen'], 'lotse.schulden': v.daten['lotse.schulden'],
  'lotse.haken': JSON.stringify({ a: muell[i], 'wg|u.miet': muell[(i + 3) % muell.length], 'wg|u.x': [muell[i]] }),
  'lotse.pflegecheck': JSON.stringify({ antworten: { v: i % 2 ? 2 : 1, alterJahre: i % 3 ? 'abc' : -5, alterMonate: 1e300, vor: { 1: 'x', 2: 7, 3: true, 4: true, 5: true, 6: true, 9: true }, stufen: { '1.1': 99, '9.9': -1, x: 'y', '5.16': 'z', '4.1': 1e300 }, m5: { '5.1': { x: 'y' }, zz: 5, '5.2': [1, 'a'] }, m5Hilfe: { '5.1': 'ja', zz: true }, m5Wahl: { '5.1': 99, zz: 'x' }, inkontinenz: { harn: 'x' }, ink: 99, sonde: 'x', k4K: 'ja', pos: i % 2 ? 500 : 0 }, schaetzung: { pg: 99, punkte: 'viele', datum: '9999-99-99' } }),
  'lotse.pfaendung': JSON.stringify({ art: i % 2 ? 'lohn' : 'konto', schritt: [0, 1, 2, 3, 20, 7, 5, 6, 4, 5][i], netto: i % 2 ? 'abc' : -1e300, pers: i % 2 ? 'x' : 99, kg: i % 2 ? true : -1, kiz: i % 2 ? 5 : 'x' }),
  'lotse.einfach': JSON.stringify({ es: { schritt: [0, 1, 2, 3, 99, -1, 1.5, 1e300, 'x', true][i], geb: 'abcd', mz: { G: 'x', zz: 5 }, schon: { zz: 'x' }, miete: true, lohn: -1, plz: 99, wohnen: 7, kind: 1e300 }, an: i % 2 === 0 }),
  'lotse.state': JSON.stringify({ s: { adults: [99, -1, 'x', true, 1e300, 1.5, null, 0, '', 2][i], kids: 'viele', kidsU6: -4, miete: true, plz: 5, ek1Art: 7, ek1Brutto: true, gebJahr: 99, mietstufe: 'IX', bundesland: 5, bezug: { wg: true, zz: false }, unbekannt: 'x' }, p: { name: 'A' }, e: true, sf: { pos: 'gibtsnicht', ja: ['gibtsnicht', 'kinder'] } })
} }));

(async () => {
  // ---------- Prüfung ohne Oberfläche ----------
  {
    const v = (d) => ({ s: 1, typ: 'vorgang', name: 'x', daten: d });
    const mitProto = '{"s":1,"typ":"vorgang","name":"x","daten":{"lotse.haken":"{}"},"__proto__":{"polluted":1}}';
    const faelle = [
      ['__proto__ oben (als eigener Schlüssel im JSON-Text)', 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from(mitProto)]))],
      ['__proto__ in daten', 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from('{"s":1,"typ":"vorgang","daten":{"lotse.haken":"{}","__proto__":"{}"}}')]))],
      ['constructor.prototype im Wert', roh(v({ 'lotse.haken': '{"constructor":{"prototype":{"polluted":1}}}' }))],
      ['prototype im Wert', roh(v({ 'lotse.haushalt': '{"plan":{"prototype":1}}' }))],
      ['__proto__ in state.s', roh(v({ 'lotse.state': '{"s":{"__proto__":{"polluted":1}}}' }))],
      ['__proto__ in state.s.bezug', roh(v({ 'lotse.state': '{"s":{"bezug":{"__proto__":true}}}' }))],
      ['__proto__ in Fristen (Auswahl)', 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from('{"s":1,"typ":"auswahl","blatt":{"l":"de","rtl":false,"zwei":false,"titel":{"art":"h","k":"a"},"kopf":{"art":"p","k":"b"},"abschnitte":[{"teil":"hilfen","h":{"art":"h","k":"c"},"zeilen":[]}]},"fristen":{"v":1,"e":[{"art":"eigen","__proto__":{"polluted":1}}]}}')]))],
      ['__proto__ in Blatt-Zeile', 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from('{"s":1,"typ":"auswahl","blatt":{"l":"de","rtl":false,"zwei":false,"titel":{"art":"h","k":"a","__proto__":{"x":1}},"kopf":{"art":"p","k":"b"},"abschnitte":[{"teil":"hilfen","h":{"art":"h","k":"c"},"zeilen":[]}]}}')]))],
      ['Schlüssel mit HTML', roh(v({ 'lotse.haken': JSON.stringify({ '<img src=x>': true }) }))],
      ['Steuerzeichen im Wert', roh(v({ 'lotse.haken': JSON.stringify({ a: 'x\u0000y' }) }))],
      ['Richtungs-Umkehr (U+202E) im Namen', roh({ s: 1, typ: 'vorgang', name: 'a‮b', daten: { 'lotse.haken': '{}' } })],
      ['Richtungs-Umkehr (U+202E) im Blatt', roh({ s: 1, typ: 'auswahl', blatt: { l: 'de', rtl: false, zwei: false, titel: { art: 'h', k: 'gpj.‮exe' }, kopf: { art: 'p', k: 'b' }, abschnitte: [{ teil: 'hilfen', h: { art: 'h', k: 'c' }, zeilen: [] }] } })],
      ['daten als Liste', roh({ s: 1, typ: 'vorgang', daten: ['{}'] })],
      ['Wert kein Text', roh(v({ 'lotse.haken': { a: 1 } }))],
      ['Inhalt ist eine Liste', roh([1, 2])],
      ['Inhalt ist null', roh(null)],
      ['Pflege: Position negativ', roh(v({ 'lotse.pflegecheck': JSON.stringify({ antworten: { pos: -3 } }) }))],
      ['Pflege: Liste ist null', roh(v({ 'lotse.pflegecheck': JSON.stringify({ antworten: { stufen: null } }) }))],
      ['Pflege: unbekanntes Feld', roh(v({ 'lotse.pflegecheck': JSON.stringify({ antworten: {}, html: '<b>' }) }))],
      ['Pfändung: Schritt keine ganze Zahl', roh(v({ 'lotse.pfaendung': JSON.stringify({ art: 'konto', schritt: 1.5 }) }))],
      ['Pfändung: Wert ist ein Objekt', roh(v({ 'lotse.pfaendung': JSON.stringify({ art: 'konto', netto: { toString: 1 } }) }))],
      ['Angaben: Wert ist eine Liste', roh(v({ 'lotse.state': JSON.stringify({ s: { miete: [1, 2] } }) }))],
      ['Angaben: toString als Schlüssel', roh(v({ 'lotse.state': JSON.stringify({ s: { toString: 5 } }) }))],
      ['Einfache Version: tief verschachtelt', roh(v({ 'lotse.einfach': JSON.stringify({ es: { mz: { G: { a: 1 } } } }) }))],
      ['Zahl nicht endlich', 'SOLO:' + W.b64url(new Uint8Array([1, 0, ...Buffer.from('{"s":1,"typ":"vorgang","daten":{"lotse.haken":"{\\"a\\":1e999}"}}')]))]
    ];
    for (const [n, c] of faelle) check('Abgelehnt: ' + n, await art(W.auspacken(c)) === 'schema');
    check('Kein Prototyp verändert', ({}).polluted === undefined && Object.prototype.x === undefined);
    check('Kein JSON: „kaputt“', await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([1, 0, 123, 34])))) === 'kaputt');
    check('Ungültiges UTF-8: „kaputt“', await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([1, 0, 0xff, 0xfe, 0xfd])))) === 'kaputt');
    check('Unbekannte Merker-Bits / Version: „format“', await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([1, 4, 123, 125])))) === 'format' && await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([9, 0, 123, 125])))) === 'format');
    check('Kaputtes deflate: „kaputt“', await art(W.auspacken('SOLO:' + W.b64url(new Uint8Array([1, 1, 255, 255, 255, 255, 0, 1, 2])))) === 'kaputt');
    check('base64url mit ungültiger Länge: kein Absturz, Fehler', await art(W.auspacken('SOLO:AAAAA')) !== 'ok' && W.istCode('SOLO:AAAAA') === false);
    // Kompressions-Bombe: 300 MB Leerzeichen in rund 300 KB – wird nach 512 KB abgebrochen, ohne alles zu entpacken
    const bombe = zlib.deflateRawSync(Buffer.alloc(300 * 1024 * 1024, 32), { level: 9 });
    const code = 'SOLO:' + W.b64url(new Uint8Array(Buffer.concat([Buffer.from([1, 1]), bombe])));
    const vor = process.memoryUsage().arrayBuffers, t0 = Date.now();
    check('Kompressions-Bombe (300 MB in ' + Math.round(bombe.length / 1024) + ' KB): „zuGross“', await art(W.auspacken(code)) === 'zuGross');
    check('Kompressions-Bombe: früh abgebrochen (wenig Speicher, schnell)', process.memoryUsage().arrayBuffers - vor < 64 * 1024 * 1024 && Date.now() - t0 < 5000, (process.memoryUsage().arrayBuffers - vor) + ' Byte, ' + (Date.now() - t0) + ' ms');
    // Verschlüsselter Kode: Kopf (Version, Merker) ist mit geschützt
    const pin = '123456', c2 = await W.packen({ s: 1, typ: 'vorgang', daten: { 'lotse.haken': JSON.stringify({ a: 'x'.repeat(300) }) } }, pin);
    const by = W.unb64url(c2.slice(5)); by[1] ^= 1;
    check('Mit PIN: veränderter Merker im Kopf wird erkannt', await art(W.auspacken('SOLO:' + W.b64url(by), pin)) === 'pinFalsch');
    check('Mit PIN: unverändert lesbar', await art(W.auspacken(c2, pin)) === 'ok');
    check('Datei: code kein Text / Liste / verschachtelt → Format-Fehler', ['{"format":"solo","v":1,"code":5}', '{"format":"solo","v":1,"code":["SOLO:AAAA"]}', '[]', 'null', '{"format":"solo","v":1}', '{"format":"solo","v":"1","code":"SOLO:AQB7fQ"}'].every((t) => { try { W.ausDatei(t); return false; } catch (e) { return true; } }));
  }

  // ---------- Oberfläche: bösartiger „ganzer Vorgang“ ----------
  const store = {};
  const A = app(store), w = A.w, d = A.d, $ = (id) => d.getElementById(id);
  const pruefe = (wo) => {
    check(wo + ': nichts ausgeführt, kein eingeschleustes Element', !w.__xss && !d.querySelector('img[src="x"]') && !d.querySelector('[onerror]') && ![...d.querySelectorAll('script')].some((x) => /__xss/.test(x.textContent)));
  };
  d.querySelector('#appnav [data-ansicht="start"]').click(); $('goLeistungen').click(); $('p2').click();
  await bis(() => store['lotse.state']);
  const eigener = store['lotse.state'];
  const ordner = () => d.querySelector('#appnav [data-ansicht="ordner"]').click();
  const importiere = async (inhalt, haken) => {
    ordner();
    dateiWaehlen(w, $('kwDateiEin'), W.datei(typeof inhalt === 'string' ? inhalt : roh(inhalt)));
    if (!await bis(() => $('kwImpTeile') || ($('kwImpMsg').textContent && $('kwImpMsg').textContent !== DE['kw.bitte']), 4000) || !$('kwImpTeile')) return null;
    if (haken) haken();
    const vorher = JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length;
    $('kwImpSpeichern').click();
    if (!await bis(() => $('kwImpOk'), 4000)) return null;
    await bis(() => JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length > vorher, 4000); // Speichern läuft über die Schreibkette (Vorgaenge), ein Takt später
    const l = JSON.parse(store['lotse.vorgaenge']).klar.liste;
    return l[l.length - 1];
  };
  // Rundgang durch alle Bereiche des geöffneten Vorgangs
  const besucht = {};
  const rundgang = async () => {
    for (const a of ['start', 'ordner', 'einstellungen']) { const b = d.querySelector('#appnav [data-ansicht="' + a + '"]'); if (b) b.click(); }
    ordner(); await warte(30);
    const n = d.querySelectorAll('#ordnerKarten button').length;
    for (let i = 0; i < n; i++) {
      ordner();
      const b = d.querySelectorAll('#ordnerKarten button')[i]; if (!b) continue;
      b.click(); await warte(40);
      [...d.querySelectorAll('.unterseite:not([hidden]) button.tab, .hb-tabs button, [role="tab"]')].slice(0, 8).forEach((x) => { try { x.click(); } catch (e) {} });
      const ps = $('paStart'); if (b.id === 'or-pflege' && ps) { ps.click(); await warte(40); besucht.pflege = true; [...d.querySelectorAll('#paBox button, .pa-wahl button')].slice(0, 3).forEach((x) => { try { x.click(); } catch (e) {} }); }
      if (b.id === 'or-pfaendung') besucht.pfaendung = true;
      const kb = $('kbClose'); if (kb && !$('klientBlatt').hidden) kb.click();
    }
    for (const id of ['goLeistungen', 'goBriefe', 'goGeld', 'goPflege', 'goDringend', 'goFristen']) { d.querySelector('#appnav [data-ansicht="start"]').click(); const b = $(id); if (b && !b.hidden) { b.click(); await warte(30); } }
    const mk = $('mappeMake'); if (mk) { d.querySelectorAll('[data-pick]').forEach((c) => { c.checked = true; fire(w, c, 'change'); }); mk.click(); await warte(60); }
    return n;
  };

  const vx = await importiere(vorgangXss);
  check('Bösartiger Vorgang: Vorschau und Speichern als neuer Vorgang', !!vx && vx.name === '<b>X</b>' && !$('kwImpOk').querySelector('b'));
  check('Eigener Vorgang bleibt geöffnet und unverändert', store['lotse.state'] === eigener && JSON.parse(store['lotse.vorgaenge']).klar.liste.length === 2);
  pruefe('Vorschau/Speichern');
  $('kwImpOeffnen').click(); await warte(80);
  const nKarten = await rundgang();
  check('Bösartiger Vorgang geöffnet: Bereiche in „Mein Ordner“ besucht (auch Pflege und Pfändung)', nKarten >= 3 && besucht.pflege && besucht.pfaendung, nKarten + ' ' + JSON.stringify(besucht));
  pruefe('Rundgang mit Schadcode in allen gespeicherten Eingaben');
  check('Rundgang mit Schadcode: keine Skriptfehler', A.errors.length === 0, A.errors.slice(0, 3).join(' | '));
  check('Schadcode steht nur als Text da (Antragsmappe)', !$('mappeBody') || !$('mappeBody').querySelector('img[src="x"]'));

  // Falsche Datentypen: App bleibt benutzbar
  let ok = 0, abgelehnt = 0;
  for (const v of typVarianten) {
    const fehlerVorher = A.errors.length;
    const neu = await importiere(v);
    if (!neu) { ok++; abgelehnt++; continue; } // von der Prüfung abgelehnt: auch gut
    $('kwImpOeffnen').click(); await warte(60);
    await rundgang();
    if (A.errors.length === fehlerVorher) ok++; else console.log('     Fehler bei Variante ' + v.name + ': ' + A.errors.slice(fehlerVorher, fehlerVorher + 2).join(' | ').slice(0, 600));
  }
  check('Falsche Datentypen in allen Feldern (' + typVarianten.length + ' Varianten): keine Skriptfehler', ok === typVarianten.length, ok + '/' + typVarianten.length);
  console.log('     (davon schon von der Prüfung abgelehnt: ' + abgelehnt + ')');
  let okM = 0, abgelehntM = 0;
  for (const v of modulVarianten) {
    const fehlerVorher = A.errors.length;
    const neu = await importiere(v);
    if (!neu) { if (W.pruefen(v)) console.log('     Variante ' + v.name + ' nicht gespeichert: ' + $('kwImpMsg').textContent); else { okM++; abgelehntM++; } continue; }
    $('kwImpOeffnen').click(); await warte(60);
    await rundgang();
    const pfl = $('paStart'); if (pfl) { try { d.querySelector('#appnav [data-ansicht="start"]').click(); } catch (e) {} }
    if (A.errors.length === fehlerVorher) okM++; else console.log('     Fehler bei Variante ' + v.name + ': ' + A.errors.slice(fehlerVorher, fehlerVorher + 2).join(' | ').slice(0, 700));
  }
  check('Unsinnige Werte in erlaubter Form (' + modulVarianten.length + ' Varianten, ' + (modulVarianten.length - abgelehntM) + ' angenommen und geöffnet): keine Skriptfehler', okM === modulVarianten.length && abgelehntM <= 3, okM + '/' + modulVarianten.length);
  pruefe('Falsche Datentypen');
  ordner();
  check('Danach: „Mein Ordner“ und Liste der Vorgänge weiter benutzbar', !!$('kwImport') && d.querySelectorAll('#setHaushalte button').length > 0);

  // Fristen: nur mit eigenem Haken, und nur geprüfte Einträge
  const mitFrist = { s: 1, typ: 'vorgang', name: 'F', daten: { 'lotse.haken': '{}', 'lotse.fristliste': JSON.stringify({ v: 1, e: [{ id: 'ab12', art: 'eigen', titel: B, notiz: B, basis: { fest: '2026-12-15' }, boese: B }, { art: 'unbekannt', titel: 'x' }] }) } };
  ordner(); dateiWaehlen(w, $('kwDateiEin'), W.datei(roh(mitFrist))); await bis(() => $('kwImpTeile'));
  const fr = d.querySelector('#kwImpTeile input[data-kwimp="lotse.fristliste"]');
  check('Fristen: eigener, abwählbarer Haken in der Vorschau mit Hinweis auf die Erinnerung', !!fr && fr.parentNode.textContent === DE['kw.imp.fristen']);
  fr.checked = false; fire(w, fr, 'change');
  const vorF = JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length;
  $('kwImpSpeichern').click(); await bis(() => $('kwImpOk')); await bis(() => JSON.parse(store['lotse.vorgaenge'] || '{"klar":{"liste":[]}}').klar.liste.length > vorF);
  let l = JSON.parse(store['lotse.vorgaenge']).klar.liste, letzter = l[l.length - 1];
  check('Fristen ohne Haken: nicht übernommen', !letzter.daten['lotse.fristliste'] && !!letzter.daten['lotse.haken']);
  const mitHaken = await importiere(mitFrist);
  const fl = mitHaken && JSON.parse(mitHaken.daten['lotse.fristliste']);
  check('Fristen mit Haken: nur geprüfte Einträge, fremde Felder entfernt', !!fl && fl.e.length === 1 && fl.e[0].boese === undefined && !/[<>]/.test(fl.e[0].id));

  // Falsche Dateien
  const anzahl = JSON.parse(store['lotse.vorgaenge']).klar.liste.length;
  ordner(); dateiWaehlen(w, $('kwDateiEin'), 'x', { size: W.MAX_DATEI + 1 });
  check('Zu große Datei: Meldung, wird gar nicht gelesen', await bis(() => $('kwImpMsg').textContent === DE['kw.imp.f.zuGross']) && $('kwImpBox').hidden);
  for (const [n, t] of [['PDF', '%PDF-1.7\n1 0 obj'], ['HTML', '<!doctype html><script>window.__xss=1</script>'], ['JSON ohne Format', '{"a":1}'], ['Kode mit Schema-Fehler', W.datei(roh({ s: 1, typ: 'vorgang', daten: { 'lotse.vorgaenge': '{}' } }))]]) {
    ordner(); $('kwImpMsg').textContent = ''; dateiWaehlen(w, $('kwDateiEin'), t);
    check('Falsche Datei (' + n + '): Meldung, keine Vorschau', await bis(() => $('kwImpMsg').textContent === DE['kw.imp.f.format']) && $('kwImpBox').hidden && !$('kwImpTeile'));
  }
  check('Abgelehnte Dateien legen keinen Vorgang an', anzahl === JSON.parse(store['lotse.vorgaenge']).klar.liste.length);
  pruefe('Ende');
  check('Kein Prototyp verändert (App)', w.Object.prototype.polluted === undefined && ({}).polluted === undefined);
  // Weitergeben nur im Beratungsmodus
  check('Ohne Beratungsmodus: kein Weitergeben (Knopf verborgen, Schnittstelle verweigert)', $('kbOpen').hidden && $('kwBox').hidden && await w.Klient.qrZeigen() === false && await w.Klient.dateiTeilen() === false);
  console.log(fails ? fails + ' Fehler' : '[weitergabe-boese] alle Prüfungen bestanden');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL Ausnahme', e && e.stack); process.exit(1); });
