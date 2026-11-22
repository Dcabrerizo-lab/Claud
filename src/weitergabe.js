// Weitergabe an den Klienten (QR-Code und SoLo-Datei): Kodierung, Prüfung und QR-Bild. Läuft in der App und in Node (Tests).
// Kein Server: Der Inhalt steht vollständig im QR-Code bzw. in der Datei. Nichts geht automatisch irgendwohin.
//
// Inhalt (JSON, „s“ = Version des Inhalts):
//   { s: 1, typ: 'vorgang', name, datum, daten: { 'lotse.state': '<JSON-Text>', … } }   ganzer Vorgang mit gespeicherten Eingaben
//   { s: 1, typ: 'auswahl', name, datum, blatt: { l, rtl, zwei, titel, kopf, abschnitte }, fristen?: { v: 1, e: [...] } }
//      blatt = Daten des Blatts aus „Für Klient zusammenstellen“ (Textpaare, kein HTML, keine PDF); die App des Klienten zeichnet es neu.
// Kode: 'SOLO:' + base64url( [1 (Version), Merker (1 = komprimiert, 2 = mit PIN), (Salz 16, IV 12,) Daten] ).
//   Kompression: deflate-raw (CompressionStream), nur wenn vorhanden und kleiner. Entpackt wird in kleinen Stücken und nur bis 512 KB
//   (Schutz vor Kompressions-Bomben: nie alles auf einmal in den Entpacker geben).
//   PIN: AES-GCM-256, Schlüssel aus PBKDF2-HMAC-SHA-256 mit 600 000 Durchläufen, Salz 16 Byte, IV 12 Byte – dieselben Werte wie die PIN
//   der Vorgänge (src/vorgaenge.js, ITER; OWASP Password Storage Cheat Sheet, abgerufen am 21.11.2026). Eine 6-stellige PIN ist ein
//   Sichtschutz, kein Schutz gegen Fachleute mit viel Rechenzeit (so steht es auch in der App). Die zwei Kopf-Bytes (Version, Merker)
//   sind als „additionalData“ mit geschützt: wer sie verändert, bekommt „PIN stimmt nicht“.
// Datei (.solo): { "format": "solo", "v": 1, "code": "SOLO:…" }.
// Prüfung beim Öffnen: nur bekannte Felder, feste Größen und Datentypen, Texte ohne Steuerzeichen, keine Schlüssel, die es an jedem
// Objekt schon gibt (__proto__, constructor, toString …). Angezeigt wird alles nur mit textContent. Dateien von Fremden sind Angriffsfläche:
// test/test-weitergabe-boese.js.
var Weitergabe = (function () {
  'use strict';
  var PREFIX = 'SOLO:';
  // Krypto-Bausteine aus src/krypto.js (in der App davor eingebunden, in Node per require); Parameter dort, unverändert
  var K = typeof Krypto !== 'undefined' ? Krypto : require('./krypto.js');
  var ITER = K.ITER, SALZ = K.SALZ, IV = K.IV;
  var MAX_INHALT = 512 * 1024; // entpackter Inhalt (JSON) höchstens 512 KB
  var MAX_CODE = 1024 * 1024; // Kode höchstens 1 MB Text
  var MAX_DATEI = 2 * 1024 * 1024; // Datei höchstens 2 MB
  var MAX_FELD = 200 * 1024; // ein gespeicherter Wert (JSON-Text) höchstens 200 KB
  var QR_MAX = 25; // größte QR-Version, die noch sicher vom Bildschirm gescannt wird (Fehlerkorrektur L)
  var LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
  // Gespeicherte Eingaben eines Vorgangs, die weitergegeben werden dürfen (Teil von Vorgaenge.DATEN; ohne die Haken der Beraterin)
  var FELDER = ['lotse.state', 'lotse.einfach', 'lotse.pflegecheck', 'lotse.pfaendung', 'lotse.haushalt', 'lotse.haken', 'lotse.ausziehen', 'lotse.fristliste', 'lotse.schulden'];
  var TEILE = ['hilfen', 'unterlagen', 'fristen', 'briefe'];
  var ZEILEN = ['h', 'h3', 'p', 'li', 'small', 'pre'];
  var MAX_BILD = 30 * 1024 * 1024; // Foto mit QR-Code höchstens 30 MB
  var STUECK = 1024; // Entpacken: so viele Byte auf einmal in den Entpacker (deflate bläht höchstens rund 1032-fach auf, also rund 1 MB je Stück)
  // Schlüssel, die es an jedem Objekt schon gibt (__proto__, constructor, toString, valueOf, hasOwnProperty …), sind in fremden Daten verboten:
  // sie könnten Prototypen verändern oder die App beim Umwandeln in Text abstürzen lassen
  function schluesselOk(n) { return typeof n === 'string' && /^[\w.|:-]{1,80}$/.test(n) && n !== 'prototype' && !(n in Object.prototype); }

  function fehler(art) { var e = new Error(art); e.art = art; return e; }
  function istObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function nurFelder(o, erlaubt) { return Object.keys(o).every(function (k) { return erlaubt.indexOf(k) >= 0; }); }
  function einfach(v) { return v == null || typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && v.length <= 200); }
  function flach(o) { return istObj(o) && Object.keys(o).every(function (k) { return einfach(o[k]); }); }
  var zufall = K.zufall;
  function tagOk(s) { return typeof s === 'string' && /^\d{4}-\d\d-\d\d$/.test(s); }
  // Keine Steuerzeichen und keine Zeichen, die die Schreibrichtung umkehren (U+202A–U+202E: Text könnte anders aussehen, als er ist).
  // U+2066–U+2069 bleiben erlaubt: die App setzt sie selbst um Zahlen in Sprachen von rechts nach links (src/fmt.js).
  function steuerOk(s, mitZeilen) { return !(mitZeilen ? /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e]/ : /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e]/).test(s); }

  // ---------- base64url ----------
  var b64url = K.b64url;
  function unb64url(s) { var u = K.unb64url(s); if (!u) throw fehler('format'); return u; }
  function verbinden(teile) {
    var n = teile.reduce(function (a, t) { return a + t.length; }, 0), u = new Uint8Array(n), p = 0;
    teile.forEach(function (t) { u.set(t, p); p += t.length; });
    return u;
  }

  // ---------- Kompression (deflate-raw) ----------
  function kannKomprimieren() { return typeof globalThis.CompressionStream === 'function' && typeof globalThis.DecompressionStream === 'function'; }
  // max > 0 (Entpacken fremder Daten): Eingabe in kleinen Stücken, nach jedem Stück wird gewartet, bis der Leser nachgekommen ist.
  // So liegt nie mehr als rund 1 MB entpackt im Speicher, auch wenn 700 KB Kode mehrere 100 MB ergeben würden.
  function strom(bytes, Art, max) {
    var s = new Art('deflate-raw'), w = s.writable.getWriter(), r = s.readable.getReader(), teile = [], n = 0, stopp = false, st = max ? STUECK : 65536;
    function schreiben(i) {
      if (stopp) return Promise.resolve();
      if (i >= bytes.length) return w.close();
      return w.ready.then(function () { return stopp ? null : w.write(bytes.subarray(i, i + st)); }).then(function () { return schreiben(i + st); });
    }
    schreiben(0).catch(function () {});
    function weiter() {
      return r.read().then(function (x) {
        if (x.done) return verbinden(teile);
        n += x.value.length;
        if (max && n > max) {
          stopp = true; teile = [];
          try { r.cancel().catch(function () {}); } catch (e) {}
          try { w.abort().catch(function () {}); } catch (e) {}
          throw fehler('zuGross');
        }
        teile.push(x.value); return weiter();
      });
    }
    return weiter();
  }
  function packenZ(bytes) { return strom(bytes, globalThis.CompressionStream, 0); }
  function entpackenZ(bytes) {
    return strom(bytes, globalThis.DecompressionStream, MAX_INHALT).catch(function (e) { throw e && e.art === 'zuGross' ? e : fehler('kaputt'); });
  }

  // ---------- Verschlüsselung (WebCrypto) ----------
  var webCrypto = K.webCrypto;
  function pinOk(pin) { return typeof pin === 'string' && /^\d{4,12}$/.test(pin); }
  // Vorschlag: 6 Ziffern, gleichverteilt (ohne Modulo-Verzerrung)
  function pinVorschlag() {
    var a = new Uint32Array(1), max = Math.floor(4294967296 / 1000000) * 1000000;
    do { globalThis.crypto.getRandomValues(a); } while (a[0] >= max);
    return String(a[0] % 1000000 + 1000000).slice(1);
  }

  // ---------- Kodieren und Dekodieren ----------
  // packen(inhalt, pin|null) → Promise<'SOLO:…'>
  function packen(inhalt, pin) {
    var sauber = pruefen(inhalt);
    if (!sauber) return Promise.reject(fehler('schema'));
    if (pin != null && !pinOk(pin)) return Promise.reject(fehler('pin'));
    if (pin != null && !webCrypto()) return Promise.reject(fehler('technik'));
    var roh = new TextEncoder().encode(JSON.stringify(sauber));
    if (roh.length > MAX_INHALT) return Promise.reject(fehler('zuGross'));
    var z = kannKomprimieren() ? packenZ(roh).then(function (k) { return k.length < roh.length ? { d: k, z: true } : { d: roh, z: false }; }, function () { return { d: roh, z: false }; }) : Promise.resolve({ d: roh, z: false });
    return z.then(function (x) {
      var merker = (x.z ? 1 : 0) | (pin != null ? 2 : 0);
      if (pin == null) return PREFIX + b64url(verbinden([new Uint8Array([1, merker]), x.d]));
      var salz = zufall(SALZ), iv = zufall(IV);
      var kopfB = new Uint8Array([1, merker]);
      return K.schluessel(pin, salz, ITER).then(function (k) { return globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: kopfB }, k, x.d); })
        .then(function (ct) { return PREFIX + b64url(verbinden([kopfB, salz, iv, new Uint8Array(ct)])); });
    });
  }
  function kopf(code) {
    if (typeof code !== 'string') throw fehler('format');
    code = code.trim();
    if (code.length > MAX_CODE) throw fehler('zuGross');
    if (code.indexOf(PREFIX) !== 0) throw fehler('format');
    var b = unb64url(code.slice(PREFIX.length));
    if (b.length < 3 || b[0] !== 1 || (b[1] & ~3)) throw fehler('format');
    if ((b[1] & 2) && b.length < 2 + SALZ + IV + 17) throw fehler('format');
    return { b: b, z: !!(b[1] & 1), pin: !!(b[1] & 2) };
  }
  function brauchtPin(code) { try { return kopf(code).pin; } catch (e) { return false; } }
  function istCode(code) { try { kopf(code); return true; } catch (e) { return false; } }
  // auspacken(code, pin) → Promise<geprüfter Inhalt>; Fehler mit .art: format, pin (PIN nötig), pinFalsch, zuGross, kaputt, schema, technik
  function auspacken(code, pin) {
    var k;
    try { k = kopf(code); } catch (e) { return Promise.reject(e); }
    var daten;
    if (k.pin) {
      if (pin == null || pin === '') return Promise.reject(fehler('pin'));
      if (!webCrypto()) return Promise.reject(fehler('technik'));
      var salz = k.b.subarray(2, 2 + SALZ), iv = k.b.subarray(2 + SALZ, 2 + SALZ + IV), ct = k.b.subarray(2 + SALZ + IV);
      daten = K.schluessel(String(pin), salz, ITER).then(function (key) { return globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv, additionalData: k.b.slice(0, 2) }, key, ct); })
        .then(function (pt) { return new Uint8Array(pt); }, function () { throw fehler('pinFalsch'); });
    } else daten = Promise.resolve(k.b.subarray(2));
    return daten.then(function (d) {
      if (!k.z) { if (d.length > MAX_INHALT) throw fehler('zuGross'); return d; }
      if (!kannKomprimieren()) throw fehler('technik');
      return entpackenZ(d);
    }).then(function (d) {
      var o;
      try { o = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(d)); } catch (e) { throw fehler('kaputt'); }
      var p = pruefen(o);
      if (!p) throw fehler('schema');
      return p;
    });
  }

  // ---------- Datei (.solo) ----------
  function datei(code) { return JSON.stringify({ format: 'solo', v: 1, code: code }); }
  // Text aus einer Datei (oder ein eingefügter Kode) → Kode; sonst Fehler 'format' bzw. 'zuGross'
  function ausDatei(text) {
    if (typeof text !== 'string') throw fehler('format');
    if (text.length > MAX_DATEI) throw fehler('zuGross');
    var s = text.replace(/^﻿/, '').trim();
    if (s.indexOf(PREFIX) === 0) { kopf(s); return s; }
    var o; try { o = JSON.parse(s); } catch (e) { throw fehler('format'); }
    if (!istObj(o) || !nurFelder(o, ['format', 'v', 'code']) || o.format !== 'solo' || o.v !== 1) throw fehler('format');
    kopf(o.code);
    return o.code.trim();
  }

  // ---------- Prüfung des Inhalts (streng) ----------
  // Beliebiger gespeicherter Wert: begrenzte Tiefe und Größe, nur einfache Typen, harmlose Schlüssel, Texte ohne Steuerzeichen
  function tiefOk(x, t) {
    if (t > 8) return false;
    if (x === null || typeof x === 'boolean') return true;
    if (typeof x === 'number') return isFinite(x);
    if (typeof x === 'string') return x.length <= 5000 && steuerOk(x, true);
    if (Array.isArray(x)) return x.length <= 500 && x.every(function (y) { return tiefOk(y, t + 1); });
    if (typeof x !== 'object') return false;
    var k = Object.keys(x);
    return k.length <= 300 && k.every(function (n) { return schluesselOk(n) && tiefOk(x[n], t + 1); });
  }
  // Gespeicherte Angaben des Leistungs-Checks: s = einfache Werte (wie src/app.js blankState), bezug = Ja/Nein je Leistung,
  // sf = Stand von „Frage für Frage“ (src/schritte.js stand()), p = Briefdaten
  function stateOk(j) {
    if (!istObj(j) || !nurFelder(j, ['s', 'p', 'e', 'big', 'sf']) || !istObj(j.s)) return false;
    if ((j.e != null && typeof j.e !== 'boolean') || (j.big != null && typeof j.big !== 'boolean')) return false;
    if (j.p != null && (!istObj(j.p) || !nurFelder(j.p, ['name', 'geb', 'strasse', 'ort', 'tel']) || !Object.keys(j.p).every(function (k) { return typeof j.p[k] === 'string' && j.p[k].length <= 200 && steuerOk(j.p[k], false); }))) return false;
    if (j.sf != null && (!istObj(j.sf) || !nurFelder(j.sf, ['pos', 'ja']) || (j.sf.pos != null && (typeof j.sf.pos !== 'string' || j.sf.pos.length > 80)) ||
      (j.sf.ja != null && (!Array.isArray(j.sf.ja) || j.sf.ja.length > 300 || !j.sf.ja.every(function (x) { return typeof x === 'string' && x.length <= 80; }))))) return false;
    return Object.keys(j.s).every(function (k) {
      var v = j.s[k];
      if (k === 'bezug') return v == null || (istObj(v) && Object.keys(v).every(function (b) { return typeof v[b] === 'boolean'; }));
      return einfach(v);
    });
  }
  // Einfache Version (src/app.js esLeer): einfache Werte, dazu flache Listen zum Ankreuzen (mz, schon)
  function einfachOk(j) {
    if (!istObj(j) || !nurFelder(j, ['es', 'an']) || (j.an != null && typeof j.an !== 'boolean')) return false;
    return j.es == null || (istObj(j.es) && Object.keys(j.es).every(function (k) { return einfach(j.es[k]) || flach(j.es[k]); }));
  }
  // Pfändungsschutz (src/app.js pfLeer): nur die bekannten Felder mit einfachen Werten
  function pfaendungOk(j) {
    return istObj(j) && nurFelder(j, ['art', 'schritt', 'netto', 'pers', 'kg', 'kiz']) && Object.keys(j).every(function (k) { return einfach(j[k]); }) &&
      (j.art == null || ['', 'lohn', 'konto'].indexOf(j.art) >= 0) && (j.schritt == null || (typeof j.schritt === 'number' && j.schritt >= 0 && j.schritt <= 20 && j.schritt === Math.floor(j.schritt)));
  }
  // Pflege-Einschätzung: Antworten wie erweiterungen/pflege-assistent.js neu() (Listen sind Objekte mit einfachen Werten, nie null) und Ergebnis { pg, punkte, datum }
  function oderFlach(v) { return einfach(v) || flach(v) || (Array.isArray(v) && v.length <= 50 && v.every(einfach)); }
  function antwortenOk(a) {
    if (!istObj(a) || !nurFelder(a, ['v', 'alterJahre', 'alterMonate', 'vor', 'stufen', 'm5', 'm5Hilfe', 'm5Wahl', 'inkontinenz', 'ink', 'sonde', 'k4K', 'pos'])) return false;
    if (!['v', 'alterJahre', 'alterMonate', 'k4K', 'pos'].every(function (k) { return einfach(a[k]); }) || (a.pos != null && !(typeof a.pos === 'number' && a.pos >= 0 && a.pos <= 500 && a.pos === Math.floor(a.pos)))) return false;
    if (!['vor', 'stufen', 'm5Hilfe', 'inkontinenz'].every(function (k) { return a[k] === undefined || flach(a[k]); })) return false;
    if (!['m5', 'm5Wahl'].every(function (k) { return a[k] === undefined || (istObj(a[k]) && Object.keys(a[k]).every(function (n) { return oderFlach(a[k][n]); })); })) return false;
    return oderFlach(a.ink) && oderFlach(a.sonde);
  }
  function pflegeOk(j) {
    return istObj(j) && nurFelder(j, ['antworten', 'schaetzung']) && (j.antworten == null || antwortenOk(j.antworten)) &&
      (j.schaetzung == null || (flach(j.schaetzung) && nurFelder(j.schaetzung, ['pg', 'punkte', 'datum']) && (j.schaetzung.datum == null || tagOk(j.schaetzung.datum))));
  }
  var FELD_OK = { 'lotse.state': stateOk, 'lotse.einfach': einfachOk, 'lotse.pfaendung': pfaendungOk, 'lotse.pflegecheck': pflegeOk, 'lotse.fristliste': function (j) { return fristenOk(j); },
    'lotse.haushalt': istObj, 'lotse.haken': istObj, 'lotse.ausziehen': istObj, 'lotse.schulden': istObj };
  function fristenOk(f) { return istObj(f) && nurFelder(f, ['v', 'e']) && f.v === 1 && Array.isArray(f.e) && f.e.length <= 50 && f.e.every(function (e) { return istObj(e) && tiefOk(e, 2); }); }
  function text(s, max, zeilen) {
    if (typeof s !== 'string' || s.length > max || !steuerOk(s, zeilen)) return null;
    return s;
  }
  function zeileOk(z) {
    if (!istObj(z) || !nurFelder(z, ['art', 'k', 'de']) || ZEILEN.indexOf(z.art) < 0) return null;
    var max = z.art === 'pre' ? 20000 : 2000, pre = z.art === 'pre';
    var k = text(z.k, max, pre); if (k == null || !k.length) return null;
    var de = z.de == null ? null : text(z.de, max, pre); if (z.de != null && de == null) return null;
    return { art: z.art, k: k, de: de };
  }
  function blattOk(b) {
    if (!istObj(b) || !nurFelder(b, ['l', 'rtl', 'zwei', 'titel', 'kopf', 'abschnitte'])) return null;
    if (LANGS.indexOf(b.l) < 0 || typeof b.rtl !== 'boolean' || typeof b.zwei !== 'boolean' || !Array.isArray(b.abschnitte)) return null;
    if (!b.abschnitte.length || b.abschnitte.length > TEILE.length) return null;
    var titel = zeileOk(b.titel), kz = zeileOk(b.kopf); if (!titel || !kz) return null;
    var gesehen = [], ab = [];
    for (var i = 0; i < b.abschnitte.length; i++) {
      var a = b.abschnitte[i];
      if (!istObj(a) || !nurFelder(a, ['teil', 'h', 'zeilen']) || TEILE.indexOf(a.teil) < 0 || gesehen.indexOf(a.teil) >= 0 || !Array.isArray(a.zeilen) || a.zeilen.length > 600) return null;
      var h = zeileOk(a.h); if (!h) return null;
      var z = a.zeilen.map(zeileOk); if (z.some(function (x) { return !x; })) return null;
      gesehen.push(a.teil); ab.push({ teil: a.teil, h: h, zeilen: z });
    }
    return { l: b.l, rtl: b.rtl, zwei: b.zwei, titel: titel, kopf: kz, abschnitte: ab };
  }
  // pruefen(o) → bereinigte Kopie (nur bekannte Felder) oder null
  function pruefen(o) {
    if (!istObj(o) || o.s !== 1 || !nurFelder(o, ['s', 'typ', 'name', 'datum', 'daten', 'blatt', 'fristen'])) return null;
    var name = o.name == null ? '' : text(o.name, 24, false); if (name == null) return null;
    if (o.datum != null && !tagOk(o.datum)) return null;
    var r = { s: 1, typ: o.typ, name: name, datum: o.datum || null };
    if (o.typ === 'vorgang') {
      if (!istObj(o.daten) || o.blatt !== undefined || o.fristen !== undefined) return null;
      var d = {}, n = 0, keys = Object.keys(o.daten);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i], v = o.daten[k], j;
        if (FELDER.indexOf(k) < 0 || typeof v !== 'string' || v.length > MAX_FELD) return null;
        try { j = JSON.parse(v); } catch (e) { return null; }
        if (!tiefOk(j, 0)) return null;
        if (!FELD_OK[k](j)) return null; // je Feld die bekannte Form (Haushalt, Haken, „Ich ziehe aus“, Schulden prüft zusätzlich das jeweilige Modul beim Laden)
        d[k] = v; n++;
      }
      if (!n) return null;
      r.daten = d;
    } else if (o.typ === 'auswahl') {
      if (o.daten !== undefined) return null;
      var b = blattOk(o.blatt); if (!b) return null;
      r.blatt = b;
      if (o.fristen != null) { if (!fristenOk(o.fristen)) return null; r.fristen = { v: 1, e: JSON.parse(JSON.stringify(o.fristen.e)) }; }
    } else return null;
    return r;
  }

  // ---------- QR-Code (qrcode-generator, MIT, src/vendor/qrcode.js; offline gebündelt) ----------
  function qrLib() {
    if (typeof globalThis.qrcode === 'function') return globalThis.qrcode;
    try { if (typeof require === 'function') return require('./vendor/qrcode.js'); } catch (e) {}
    return null;
  }
  // qrMatrix(code) → { n (Module je Seite), version, dunkel(r, c) } oder null (zu groß für Version ≤ QR_MAX)
  function qrMatrix(code) {
    var Q = qrLib(); if (!Q || typeof code !== 'string') return null;
    var q;
    try { q = Q(0, 'L'); q.addData(code, 'Byte'); q.make(); } catch (e) { return null; }
    var n = q.getModuleCount(), version = (n - 17) / 4;
    if (version > QR_MAX) return null;
    return { n: n, version: version, dunkel: function (r, c) { return q.isDark(r, c); } };
  }
  // SVG-Element (nur DOM-Aufbau, kein innerHTML): schwarz auf weiß mit Ruhezone 4 Module
  function qrSvg(doc, code, titel) {
    var m = qrMatrix(code); if (!m) return null;
    var NS = 'http://www.w3.org/2000/svg', rand = 4, g = m.n + 2 * rand, d = [];
    for (var r = 0; r < m.n; r++) for (var c = 0; c < m.n; c++) if (m.dunkel(r, c)) d.push('M' + (c + rand) + ' ' + (r + rand) + 'h1v1h-1z');
    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + g + ' ' + g); svg.setAttribute('role', 'img'); svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('data-version', String(m.version));
    if (titel) svg.setAttribute('aria-label', titel);
    var bg = doc.createElementNS(NS, 'rect'); bg.setAttribute('width', String(g)); bg.setAttribute('height', String(g)); bg.setAttribute('fill', '#fff');
    var p = doc.createElementNS(NS, 'path'); p.setAttribute('d', d.join('')); p.setAttribute('fill', '#000');
    svg.appendChild(bg); svg.appendChild(p);
    return svg;
  }


  // ---------- Öffnen beim Klienten (Mein Ordner, für alle Nutzer): Datei oder QR-Code → Vorschau → neuer Vorgang ----------
  // ctx = { t, bereit() (Speicher offen, nicht gesperrt), importieren(name, daten) → id|null, oeffnen(id), fristen(obj) → bereinigte Liste (JSON-Text) }
  var ui = null, code = null, inhalt = null;
  var lauf = 0; // zählt bei jedem Schließen hoch: ein Ergebnis, das erst danach fertig wird (Entschlüsseln, Datei lesen), wird verworfen
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function knopf(cls, txt, id, fn) { var b = el('button', cls, txt); b.type = 'button'; if (id) b.id = id; b.addEventListener('click', fn); return b; }
  function tt(k, p) { return ui.t(k, p); }
  function meldung(k, p) { var m = $('kwImpMsg'); if (m) m.textContent = k ? tt(k, p) : ''; }
  var IMP_FEHLER = { format: 'kw.imp.f.format', zuGross: 'kw.imp.f.zuGross', kaputt: 'kw.imp.f.format', schema: 'kw.imp.f.format', technik: 'kw.f.technik', pinFalsch: 'kw.imp.pinFalsch' };
  function box() { var b = $('kwImpBox'); if (b) { b.textContent = ''; b.hidden = false; } return b; }
  function boxWeg() { var b = $('kwImpBox'); if (b) { b.textContent = ''; b.hidden = true; } code = null; inhalt = null; lauf++; }
  // App: Wechsel des Vorgangs, Löschen. Vorschau, PIN-Abfrage, Meldung und Dateiauswahl weg; laufendes Entschlüsseln zeigt danach nichts mehr an.
  function importLeeren() { boxWeg(); if (ui) meldung(''); ['kwDateiEin', 'kwFotoEin'].forEach(function (id) { var e = $(id); if (e) e.value = ''; }); }
  function aufklappen() { var d = $('kwImport'); if (d && 'open' in d) d.open = true; }
  // Einstieg mit einem Kode (aus Datei oder QR-Code)
  function start(c) {
    boxWeg(); aufklappen();
    try { kopf(c); } catch (e) { meldung(IMP_FEHLER[e.art] || 'kw.imp.f.format'); return Promise.resolve(false); }
    code = c.trim(); meldung('');
    if (!brauchtPin(code)) return entpacken(null);
    var b = box(), f = el('form'); f.setAttribute('novalidate', '');
    var l = el('label', null, tt('kw.imp.pin')), i = el('input');
    i.type = 'password'; i.id = 'kwImpPin'; i.setAttribute('inputmode', 'numeric'); i.setAttribute('autocomplete', 'off'); i.maxLength = 12; l.setAttribute('for', 'kwImpPin');
    var ok = el('button', 'btn', tt('kw.imp.pinOk')); ok.type = 'submit'; ok.id = 'kwImpPinOk';
    // Fehler rot direkt über dem Feld (GOV.UK-Muster, UX-Audit D #9); Feld bleibt gefüllt; „PIN zeigen“ für alle, die Punkte schlecht lesen
    var fe = el('p', 'kw-feldfehler'); fe.id = 'kwImpPinFehler'; fe.hidden = true; fe.setAttribute('role', 'alert');
    i.setAttribute('aria-describedby', 'kwImpPinFehler');
    var zeig = knopf('linkbtn kw-pinzeigen', tt('kw.imp.pinZeigen'), 'kwImpPinZeigen', function () {
      var an = i.type === 'password'; i.type = an ? 'text' : 'password'; zeig.setAttribute('aria-pressed', an ? 'true' : 'false'); });
    zeig.setAttribute('aria-pressed', 'false');
    f.appendChild(el('p', 'small', tt('kw.imp.pinT'))); f.appendChild(l); f.appendChild(fe); f.appendChild(i); f.appendChild(zeig);
    var reihe = el('div', 'btns'); reihe.appendChild(ok);
    reihe.appendChild(knopf('linkbtn', tt('kw.imp.abbrechen'), 'kwImpAbbr', function () { boxWeg(); meldung(''); }));
    f.appendChild(reihe);
    f.addEventListener('submit', function (e) { e.preventDefault(); var p = String(i.value || ''); fe.hidden = true; i.removeAttribute('aria-invalid'); ok.disabled = true; entpacken(p).then(function () { ok.disabled = false; }); });
    b.appendChild(f);
    try { i.focus(); } catch (e) {}
    return Promise.resolve(true);
  }
  function entpacken(p) {
    meldung('kw.bitte');
    var l = lauf;
    return auspacken(code, p).then(function (o) { if (l !== lauf) return false; inhalt = o; meldung(''); vorschau(); return true; }, function (e) {
      if (l !== lauf) return false;
      meldung(IMP_FEHLER[e && e.art] || 'kw.imp.f.format');
      var fe = $('kwImpPinFehler'), pi = $('kwImpPin');
      if (e && e.art === 'pinFalsch' && fe && pi) { fe.textContent = tt('kw.imp.pinFalsch'); fe.hidden = false; pi.setAttribute('aria-invalid', 'true'); meldung(''); try { pi.focus(); pi.select(); } catch (x) {} }
      if (!(e && e.art === 'pinFalsch')) boxWeg();
      return false;
    });
  }
  function teileVon(o) { // [{ id, text, an }] für die Haken der Vorschau
    var out = [];
    if (o.typ === 'vorgang') {
      var seen = {};
      FELDER.forEach(function (k) {
        if (!o.daten[k]) return;
        var key = 'kw.teil.' + k.replace('lotse.', '');
        if (k === 'lotse.fristliste') { out.push({ id: k, text: tt('kw.imp.fristen'), frist: true }); return; }
        if (seen[key]) { seen[key].ids.push(k); return; }
        seen[key] = { id: k, ids: [k], text: tt(key) }; out.push(seen[key]);
      });
    } else {
      o.blatt.abschnitte.forEach(function (a, i) { out.push({ id: 'a' + i, text: a.h.k }); });
      if (o.fristen && o.fristen.e.length) out.push({ id: 'fristen', text: tt('kw.imp.fristen'), frist: true });
    }
    return out;
  }
  function vorschau() {
    var b = box(), o = inhalt;
    b.appendChild(el('h3', null, tt('kw.imp.vorschau')));
    b.appendChild(el('p', 'small', tt(o.typ === 'vorgang' ? 'kw.imp.typ.vorgang' : 'kw.imp.typ.auswahl')));
    var f = el('fieldset', 'kb-gruppe'); f.id = 'kwImpTeile'; f.appendChild(el('legend', null, tt('kw.imp.haken')));
    teileVon(o).forEach(function (x) {
      var lab = el('label', 'check'), cb = el('input');
      cb.type = 'checkbox'; cb.checked = true; cb.setAttribute('data-kwimp', x.id); if (x.ids) cb.setAttribute('data-ids', x.ids.join(' '));
      lab.appendChild(cb); lab.appendChild(el('span', null, x.text)); f.appendChild(lab);
    });
    b.appendChild(f);
    var fn = el('div', 'field'), nl = el('label', null, tt('kw.imp.name')), ni = el('input');
    ni.type = 'text'; ni.id = 'kwImpName'; ni.maxLength = 24; ni.value = o.name || ''; ni.setAttribute('autocomplete', 'off'); nl.setAttribute('for', 'kwImpName');
    fn.appendChild(nl); fn.appendChild(ni); b.appendChild(fn);
    b.appendChild(el('p', 'small', tt('kw.imp.neu')));
    var btns = el('div', 'btns');
    btns.appendChild(knopf('btn', tt('kw.imp.speichern'), 'kwImpSpeichern', speichernImport));
    btns.appendChild(knopf('btn ghost', tt('kw.imp.abbrechen'), 'kwImpAbbr', function () { boxWeg(); meldung(''); }));
    b.appendChild(btns);
    var h = b.querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
  }
  function gewaehlteIds() {
    var a = {};
    Array.prototype.forEach.call(document.querySelectorAll('#kwImpTeile input[data-kwimp]'), function (cb) {
      if (!cb.checked) return;
      (cb.getAttribute('data-ids') || cb.getAttribute('data-kwimp')).split(' ').forEach(function (id) { a[id] = true; });
    });
    return a;
  }
  function speichernImport() {
    var o = inhalt; if (!o || !ui) return null;
    if (!ui.bereit()) { meldung('kw.imp.f.speicher'); return null; }
    var w = gewaehlteIds(), d = {};
    if (o.typ === 'vorgang') {
      FELDER.forEach(function (k) { if (w[k] && o.daten[k]) d[k] = k === 'lotse.fristliste' ? ui.fristen(JSON.parse(o.daten[k])) : o.daten[k]; });
    } else {
      var ab = o.blatt.abschnitte.filter(function (a, i) { return w['a' + i]; });
      if (ab.length) d['lotse.klient-blatt'] = JSON.stringify({ l: o.blatt.l, rtl: o.blatt.rtl, zwei: o.blatt.zwei, titel: o.blatt.titel, kopf: o.blatt.kopf, abschnitte: ab });
      if (w.fristen && o.fristen) d['lotse.fristliste'] = ui.fristen(o.fristen);
    }
    Object.keys(d).forEach(function (k) { if (d[k] == null) delete d[k]; });
    if (!Object.keys(d).length) { meldung('kw.imp.nichts'); return null; }
    var name = String(($('kwImpName') || {}).value || o.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24) || tt('kw.imp.standardName');
    var id = ui.importieren(name, d);
    if (!id) { meldung('kw.imp.f.speicher'); return null; }
    var b = box();
    var m = el('p', 'kw-ok', tt('kw.imp.ok', { name: name })); m.id = 'kwImpOk'; m.setAttribute('role', 'status'); b.appendChild(m);
    b.appendChild(knopf('btn', tt('kw.imp.oeffnen'), 'kwImpOeffnen', function () { boxWeg(); meldung(''); ui.oeffnen(id); }));
    code = null; inhalt = null; meldung('');
    return id;
  }
  // QR-Code von einem Foto lesen (BarcodeDetector; im Browser und Android-WebView, wo vorhanden). Sonst Hinweis: Datei nehmen.
  function scanMoeglich() { return typeof globalThis.BarcodeDetector === 'function' && typeof globalThis.createImageBitmap === 'function'; }
  function ausBild(datei) {
    if (!datei) return Promise.resolve(false);
    boxWeg(); aufklappen(); meldung('');
    if (datei.size > MAX_BILD || (datei.type && !/^image\//.test(datei.type))) { meldung('kw.imp.keinCode'); return Promise.resolve(false); }
    meldung('kw.bitte');
    var det;
    try { det = new globalThis.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { meldung('kw.imp.keinScan'); return Promise.resolve(false); }
    var l = lauf;
    return globalThis.createImageBitmap(datei).then(function (bild) { return det.detect(bild); }).then(function (treffer) {
      if (l !== lauf) return false;
      var t = (treffer || []).map(function (x) { return x && x.rawValue; }).filter(function (v) { return typeof v === 'string' && istCode(v); })[0];
      if (!t) { meldung('kw.imp.keinCode'); return false; }
      return start(t);
    }, function () { if (l === lauf) meldung('kw.imp.keinCode'); return false; });
  }
  function ausDateiEin(datei) {
    if (!datei) return Promise.resolve(false);
    boxWeg(); aufklappen(); meldung(''); // alte Vorschau oder Meldung nie neben einer neuen Datei stehen lassen
    if (datei.size > MAX_DATEI) { meldung('kw.imp.f.zuGross'); return Promise.resolve(false); }
    var lesen = typeof datei.text === 'function' ? datei.text() : new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result)); }; r.onerror = rej; r.readAsText(datei); });
    var l = lauf;
    return lesen.then(function (txt) {
      if (l !== lauf) return false;
      var c; try { c = ausDatei(txt); } catch (e) { meldung(IMP_FEHLER[e.art] || 'kw.imp.f.format'); return false; }
      return start(c);
    }, function () { if (l === lauf) meldung('kw.imp.f.format'); return false; });
  }
  function importInit(c) {
    ui = c;
    var sc = $('kwScan'), da = $('kwDatei'), de = $('kwDateiEin'), fo = $('kwFotoEin');
    if (sc && fo) sc.addEventListener('click', function () { if (!scanMoeglich()) { aufklappen(); meldung('kw.imp.keinScan'); return; } meldung(''); fo.value = ''; fo.click(); });
    // Nach dem Lesen das Foto löschen (Android legt es im App-Bilderordner ab und löscht es nicht; ui.fotoWeg in src/app.js)
    var fotoWeg = function () { try { if (ui && ui.fotoWeg) ui.fotoWeg(); } catch (e) {} };
    if (fo) fo.addEventListener('change', function () { var f = fo.files && fo.files[0]; fo.value = ''; if (!f) return; ausBild(f).then(fotoWeg, fotoWeg); });
    if (da && de) da.addEventListener('click', function () { meldung(''); de.value = ''; de.click(); });
    if (de) de.addEventListener('change', function () { var f = de.files && de.files[0]; ausDateiEin(f); });
  }

  // ---------- SoLo-Datei direkt öffnen (App: Dateizuordnung Android/iOS) ----------
  // Android (AndroidManifest.xml, MainActivity.java) und iOS (Info.plist) melden eine geöffnete .solo-Datei über das App-Plugin von
  // Capacitor (appUrlOpen, beim Start getLaunchUrl). Hier nur: Adresse prüfen, Datei mit dem Filesystem-Plugin lesen und an den
  // vorhandenen Weg „Datei öffnen“ geben (ausDateiEin → ausDatei → start: PIN-Abfrage, Vorschau, neuer Vorgang). Keine eigene Prüfung.
  // n = { app (Plugin App), fs (Plugin Filesystem), ios (bool), zeigen() („Mein Ordner“ zeigen), merker (sessionStorage) }
  var nat = null, laufend = {};
  var MERK = 'solo.geoeffnet';
  // Erlaubt: Android nur content:// (Leserecht nur für diese Datei), iOS nur file:// mit Endung .solo (Kopie in Documents/Inbox)
  function nativErlaubt(url, ios) {
    if (typeof url !== 'string' || !url || url.length > 4096 || /[\u0000-\u001f\u007f\s]/.test(url)) return false;
    if (ios) return /^file:\/\/\/[^?#]*\.solo$/i.test(url);
    return /^content:\/\/[^/?#]+\/[^#]*$/i.test(url);
  }
  // iOS: Kopie, die iOS beim Öffnen für SoLo angelegt hat (Documents/Inbox oder tmp/<App>-Inbox). Nur solche Dateien löscht SoLo.
  function nativKopie(url) {
    var p; try { p = decodeURIComponent(String(url)); } catch (e) { return false; }
    return p.split('/').indexOf('..') < 0 && /\/(Documents\/Inbox|tmp\/[^/]+-Inbox)\/[^/]+\.solo$/i.test(p);
  }
  // Kurzer Fingerabdruck der Adresse (FNV-1a): nur zum Wiedererkennen, kein Dateiname im Speicher
  function adrMerk(url) { var h = 0x811c9dc5; for (var i = 0; i < url.length; i++) { h ^= url.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }
  // gemerkt: [[Fingerabdruck, Zeit], …] dieser Sitzung (sessionStorage, übersteht das Neuladen der Seite)
  function gemerkt() { try { var a = JSON.parse((nat.merker && nat.merker.getItem(MERK)) || '[]'); return Array.isArray(a) ? a.filter(Array.isArray) : []; } catch (e) { return []; } }
  function merken(m) { var a = gemerkt().filter(function (x) { return x[0] !== m; }); a.push([m, Date.now()]); try { if (nat.merker) nat.merker.setItem(MERK, JSON.stringify(a.slice(-20))); } catch (e) {} }
  var DOPPELT_MS = 10000;
  // Doppelte Meldungen derselben Adresse nicht zweimal öffnen: Beim Start melden Android und iOS sie über appUrlOpen und getLaunchUrl;
  // nach dem Neuladen der Seite (z. B. automatisches Sperren) meldet getLaunchUrl die alte Adresse noch einmal (beimStart: nie wieder).
  // Öffnet jemand dieselbe Datei später bewusst noch einmal (appUrlOpen nach mehr als 10 Sekunden), wird sie wieder geöffnet.
  function nativOeffnen(url, beimStart) {
    if (!nat || !ui || !nativErlaubt(url, nat.ios)) return Promise.resolve(false);
    var m = adrMerk(url), alt = gemerkt().filter(function (x) { return x[0] === m; })[0];
    if (laufend[url] || (alt && (beimStart || Date.now() - alt[1] < DOPPELT_MS))) return Promise.resolve(false);
    laufend[url] = true; merken(m);
    var fs = nat.fs;
    try { if (nat.zeigen) nat.zeigen(); } catch (e) {}
    var fertig = function (x) {
      // iOS: die Kopie in Documents/Inbox gleich wieder löschen (gelesen oder nicht)
      // Gelöscht wird nur in den Eingangsordnern von iOS (nativKopie); eine Datei an einem anderen Ort wäre das Original und bleibt liegen
      var w = nat.ios && nativKopie(url) && fs && fs.deleteFile ? Promise.resolve().then(function () { return fs.deleteFile({ path: url }); }).catch(function () {}) : Promise.resolve();
      return w.then(function () { delete laufend[url]; return x; });
    };
    if (!fs || !fs.readFile) { aufklappen(); meldung('kw.f.technik'); return fertig(false); }
    // Größe vorher (wenn bekannt): zu große Dateien gar nicht erst lesen
    var gr = fs.stat ? Promise.resolve().then(function () { return fs.stat({ path: url }); }).then(function (s) { return s && typeof s.size === 'number' && s.size >= 0 ? s.size : 0; }, function () { return 0; }) : Promise.resolve(0);
    return gr.then(function (size) {
      return ausDateiEin({ size: size, text: function () {
        // Android: höchstens MAX_DATEI + 1 Byte lesen. Die Größe oben meldet die fremde App (kann fehlen oder falsch sein);
        // ohne Grenze könnte eine riesige oder endlose Datei den Arbeitsspeicher füllen. ausDatei meldet dann „zu groß“.
        // iOS liest die eigene Kopie, dort ist die Größe von stat verlässlich.
        var o = { path: url, encoding: 'utf8' }; if (!nat.ios) o.length = MAX_DATEI + 1;
        return Promise.resolve().then(function () { return fs.readFile(o); })
          .then(function (r) { if (!r || typeof r.data !== 'string') throw fehler('format'); return r.data; });
      } });
    }).then(fertig, function () { return fertig(false); });
  }
  // iOS: liegengebliebene Kopien (App beim Lesen beendet) in Documents/Inbox löschen; nur .solo, keine gerade laufende
  function inboxAufraeumen() {
    var fs = nat && nat.fs;
    if (!nat || !nat.ios || !fs || !fs.readdir || !fs.deleteFile) return Promise.resolve();
    // Den Ordner Inbox legt iOS erst beim ersten Öffnen einer Datei an. Fehlt er: still nichts tun, kein readdir darauf
    // (OS-PLUG-FILE-0008 erschiene sonst als Skriptfehler in der Konsole). Dazu oberste Ebene von Documents lesen.
    return Promise.resolve().then(function () { return fs.readdir({ path: '', directory: 'DOCUMENTS' }); }).then(function (r0) {
      var da = ((r0 && r0.files) || []).some(function (f) { return typeof f === 'string' ? f === 'Inbox' : !!(f && f.name === 'Inbox' && (!f.type || f.type === 'directory')); });
      return da ? fs.readdir({ path: 'Inbox', directory: 'DOCUMENTS' }) : { files: [] };
    }).then(function (r) {
      var offen = Object.keys(laufend);
      return Promise.all(((r && r.files) || []).map(function (f) {
        var name = f && typeof f === 'object' ? f.name : f;
        if (typeof name !== 'string' || !/\.solo$/i.test(name) || name.indexOf('/') >= 0) return null;
        if (offen.some(function (u) { try { return decodeURIComponent(u.split('/').pop()) === name || u.split('/').pop() === name; } catch (e) { return true; } })) return null;
        return Promise.resolve().then(function () { return fs.deleteFile({ path: 'Inbox/' + name, directory: 'DOCUMENTS' }); }).catch(function () {});
      }));
    }).catch(function () {});
  }
  function nativInit(n) {
    if (!n || !n.app || nat) return Promise.resolve();
    nat = n;
    try { n.app.addListener('appUrlOpen', function (e) { nativOeffnen(e && e.url); }); } catch (e) {}
    var start0 = n.app.getLaunchUrl ? Promise.resolve().then(function () { return n.app.getLaunchUrl(); }).then(function (r) { return nativOeffnen(r && r.url, true); }, function () {}) : Promise.resolve();
    return start0.then(inboxAufraeumen, inboxAufraeumen);
  }

  return { importInit: importInit, importStart: start, importLeeren: importLeeren, ausBild: ausBild, ausDateiEin: ausDateiEin, importSpeichern: speichernImport, scanMoeglich: scanMoeglich,
    nativInit: nativInit, nativOeffnen: nativOeffnen, nativErlaubt: nativErlaubt, nativKopie: nativKopie,
    PREFIX: PREFIX, ITER: ITER, QR_MAX: QR_MAX, FELDER: FELDER, MAX_INHALT: MAX_INHALT, MAX_DATEI: MAX_DATEI,
    packen: packen, auspacken: auspacken, brauchtPin: brauchtPin, istCode: istCode, datei: datei, ausDatei: ausDatei, pruefen: pruefen,
    pinVorschlag: pinVorschlag, pinOk: pinOk, kannKomprimieren: kannKomprimieren, webCrypto: webCrypto, qrMatrix: qrMatrix, qrSvg: qrSvg,
    b64url: b64url, unb64url: unb64url };
})();
if (typeof globalThis !== 'undefined') globalThis.Weitergabe = Weitergabe;
if (typeof module !== 'undefined') module.exports = Weitergabe;
