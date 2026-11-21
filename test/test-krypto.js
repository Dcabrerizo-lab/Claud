// Gemeinsames Krypto-Modul (src/krypto.js) für Vorgänge (src/vorgaenge.js) und Weitergabe (src/weitergabe.js):
// gleiche Parameter wie vorher und alte verschlüsselte Daten beider Formate bleiben lesbar (test/daten/krypto-beispiele.json,
// erzeugt mit dem Code vor der Zusammenlegung). Ohne Browser, mit WebCrypto aus Node. Aufruf: node test/test-krypto.js
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../src/krypto.js');
const V = require('../src/vorgaenge.js');
const W = require('../src/weitergabe.js');
const B = require('./daten/krypto-beispiele.json');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL ' + name, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok   ' + name); };
function speicher(start) {
  const mem = Object.assign({}, start);
  return { mem, roh: { get: (k, cb) => cb(k in mem ? mem[k] : null), set: (k, v, f, ok) => { mem[k] = String(v); if (ok) ok(); }, remove: (k) => { delete mem[k]; } } };
}
const holen = (t, k) => { let v; t.get(k, (x) => { v = x; }); return v; };

(async () => {
  // Parameter unverändert
  ck('PBKDF2 600.000 Durchläufe, Salz 16, IV 12', K.ITER === 600000 && K.SALZ === 16 && K.IV === 12);
  ck('Vorgänge und Weitergabe nutzen dieselben Durchläufe', V.ITER === K.ITER && W.ITER === K.ITER);
  ck('zufall liefert n Byte', K.zufall(16).length === 16 && K.zufall(16).some((b) => b !== 0));
  ck('webCrypto in Node vorhanden', K.webCrypto() === true);
  // base64 wie vorher (Standard mit = bzw. base64url ohne =), auch für große Daten
  const u = new Uint8Array(70000); for (let i = 0; i < u.length; i++) u[i] = (i * 31 + 7) & 255;
  ck('base64 gleich wie Buffer', K.b64(u) === Buffer.from(u).toString('base64') && Buffer.from(K.unb64(K.b64(u))).equals(Buffer.from(u)));
  ck('base64url gleich wie Buffer', K.b64url(u) === Buffer.from(u).toString('base64url') && Buffer.from(K.unb64url(K.b64url(u))).equals(Buffer.from(u)));
  ck('base64url: falsche Zeichen -> null', K.unb64url('ab+c') === null && K.unb64url(5) === null);
  ck('Weitergabe: unb64url mit falschen Zeichen wirft weiter „format“', (() => { try { W.unb64url('a/b'); return false; } catch (e) { return e.art === 'format'; } })());
  // Schlüssel: AES-GCM 256, nur ver- und entschlüsseln, nicht exportierbar
  const key = await K.schluessel('1234', K.zufall(16), 1000);
  ck('Schlüssel AES-GCM 256, nicht exportierbar', key.algorithm.name === 'AES-GCM' && key.algorithm.length === 256 && key.extractable === false && key.usages.sort().join() === 'decrypt,encrypt');
  ck('Ohne Angabe 600.000 Durchläufe (gleicher Schlüssel wie explizit)', await (async () => {
    const salz = K.zufall(16), iv = K.zufall(12), k1 = await K.schluessel('55', salz), k2 = await K.schluessel('55', salz, 600000);
    const ct = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k1, new Uint8Array([1, 2, 3]));
    return Buffer.from(await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k2, ct)).equals(Buffer.from([1, 2, 3]));
  })());

  // Alte Daten: Vorgang mit eigener PIN
  { const b = B.vorgangSperre, s = speicher(b.mem), t = V.tresor(s.roh, {});
    await t.fertig();
    const r = await t.gOeffnen(b.id, b.pin);
    ck('Alter gesperrter Vorgang öffnet mit der PIN', r && (r.ok === undefined || r.ok) && t.aktiv().id === b.id && holen(t, 'lotse.state') === b.erwartet && t.aktiv().name === b.name, r); }
  // Alte Daten: App-PIN
  { const b = B.appPin, s = speicher(b.mem), t = V.tresor(s.roh, { gesperrt: () => {} });
    ck('Alter Speicher mit App-PIN: falsche PIN abgelehnt', !(await t.entsperren('00000')).ok);
    const r = await t.entsperren(b.pin);
    ck('Alter Speicher mit App-PIN öffnet', r.ok && holen(t, 'lotse.state') === b.erwartet && t.aktiv().name === b.name); }
  // Alte Daten: Weitergabe-Kode
  { const b = B.weitergabe;
    const m = await W.auspacken(b.mitPin, b.pin);
    ck('Alter SoLo-Kode mit PIN (AAD Kopf) öffnet', m.name === b.name && m.daten['lotse.haken'] === b.haken);
    const o = await W.auspacken(b.ohnePin);
    ck('Alter SoLo-Kode ohne PIN öffnet', o.name === b.name);
    let art = null; try { await W.auspacken(b.mitPin, '000000'); } catch (e) { art = e.art; }
    ck('Alter SoLo-Kode: falsche PIN -> pinFalsch', art === 'pinFalsch'); }

  // Kein doppelter Krypto-Code mehr
  const src = (f) => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
  ck('Keine eigenen Krypto-Hilfen mehr in vorgaenge.js und weitergabe.js', ['vorgaenge.js', 'weitergabe.js'].every((f) => !/function (schluessel|zufall|webCrypto|b64|b64url|unb64)\s*\(|deriveKey|new Uint8Array\(n\); globalThis\.crypto\.getRandomValues|ITER\s*=\s*\d/.test(src(f))));

  console.log(fails ? fails + ' von ' + n + ' Prüfungen fehlgeschlagen (Krypto)' : 'Krypto: ' + n + ' Prüfungen bestanden');
  if (fails) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
