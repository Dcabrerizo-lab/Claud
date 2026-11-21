// Vorgänge (Haushalte): mehrere gespeicherte Angaben auf dem Gerät, optional mit PIN verschlüsselt. Läuft in der App und in Node (Tests).
// Ohne PIN bleiben die Angaben des geöffneten Vorgangs unter den bisherigen Schlüsseln (lotse.state, lotse.einfach, lotse.pflegecheck,
// lotse.pfaendung); die übrigen Vorgänge und die Namen stehen unter lotse.vorgaenge. So laden ältere Speicherstände ohne Umbau.
// Mit PIN steht alles verschlüsselt (PBKDF2-SHA-256 + AES-GCM, zufälliges Salt und IV) unter lotse.vorgaenge; die PIN selbst wird nie gespeichert.
// Einzelne Vorgänge lassen sich zusätzlich mit einer eigenen PIN sperren (v.sperre): Name und Angaben stehen dann nur verschlüsselt
// ({salt, iter, iv, ct}, eigenes zufälliges Salz je Vorgang, neuer IV bei jedem Speichern), sichtbar bleibt höchstens ein freiwilliger
// Kurzname. Geprüft wird die PIN nur über die erfolgreiche Entschlüsselung (kein Hash). Geöffnet stehen die Angaben nur im Speicher;
// beim Wechsel zu einem anderen Vorgang und nach dem Neustart ist der Vorgang wieder gesperrt.
const Vorgaenge = (function () {
  var zuletzt = null; // zuletzt angelegter Tresor (die App hat genau einen): für Vorgaenge.oeffneGesperrt
  var SCHLUESSEL = 'lotse.vorgaenge';
  var DATEN = ['lotse.state', 'lotse.einfach', 'lotse.pflegecheck', 'lotse.pfaendung', 'lotse.haushalt', 'lotse.haken', 'lotse.ausziehen', 'lotse.fristliste', 'lotse.schulden', 'lotse.beratung-haken', 'lotse.klient-blatt'];
  // lotse.klient-blatt: Blatt, das die Beratung per QR-Code/SoLo-Datei weitergegeben hat (src/weitergabe.js), nur Daten, kein HTML
  var ITER = 600000; // PBKDF2-HMAC-SHA-256: Empfehlung OWASP Password Storage Cheat Sheet (Stand 2023/2026)
  var NAME_MAX = 24;
  var TAG = 86400000;
  var PIN_RE = /^\d{4,12}$/;
  var VPIN_RE = /^\d{4,8}$/; // PIN für einen einzelnen Vorgang: 4 bis 8 Ziffern

  function zufall(n) { var a = new Uint8Array(n); globalThis.crypto.getRandomValues(a); return a; }
  function neueId() { return Array.prototype.map.call(zufall(6), function (b) { return (b + 256).toString(16).slice(1); }).join(''); }
  function kopieVon(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  function neu(name, daten, jetzt) { return { id: neueId(), name: nameSauber(name), erstellt: jetzt, geaendert: jetzt, daten: daten || {} }; }
  function leer(jetzt) { var v = neu('', {}, jetzt); return { aktiv: v.id, liste: [v] }; }
  function nameSauber(s) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX); }
  function finde(c, id) { return c.liste.filter(function (v) { return v.id === id; })[0] || null; }
  function aktiv(c) { return finde(c, c.aktiv) || c.liste[0]; }
  function gesp(v) { return !!(v && v.sperre && typeof v.sperre.ct === 'string'); }
  // Abbild zum Speichern: gesperrte Vorgänge nur mit dem verschlüsselten Inhalt, nie mit den Angaben aus dem Speicher
  function fuerSpeicher(c) {
    var cc = kopieVon(c);
    cc.liste.forEach(function (v) { if (gesp(v)) v.daten = null; });
    return cc;
  }
  function gueltig(c) {
    return !!(c && Array.isArray(c.liste) && c.liste.length && c.liste.every(function (v) { return v && typeof v.id === 'string' && typeof v.name === 'string' && typeof v.geaendert === 'number'; }));
  }
  // Wert eines Datenschlüssels im geöffneten Vorgang setzen (null = löschen). Gibt true zurück, wenn sich etwas geändert hat.
  function wertSetzen(c, key, val, jetzt) {
    var v = aktiv(c), alt = Object.prototype.hasOwnProperty.call(v.daten, key) ? v.daten[key] : null;
    if (alt === (val == null ? null : val)) return false;
    if (val == null) delete v.daten[key]; else v.daten[key] = val;
    v.geaendert = jetzt; return true;
  }
  function kopie(c, id, name, jetzt) {
    var q = finde(c, id); if (!q) return null;
    var v = neu(name, kopieVon(q.daten), jetzt);
    c.liste.splice(c.liste.indexOf(q) + 1, 0, v); c.aktiv = v.id; return v;
  }
  function loeschen(c, id, jetzt) {
    var v = finde(c, id); if (!v) return false;
    c.liste.splice(c.liste.indexOf(v), 1);
    if (!c.liste.length) { var l = leer(jetzt); c.liste = l.liste; c.aktiv = l.aktiv; } else if (c.aktiv === id) c.aktiv = c.liste[0].id;
    return true;
  }
  // Automatisches Löschen: Vorgang gilt bis „zuletzt geändert + Tage“
  function ablauf(v, tage) { return tage > 0 ? v.geaendert + tage * TAG : null; }
  function aufraeumen(c, tage, jetzt) {
    if (!(tage > 0)) return 0;
    var weg = c.liste.filter(function (v) { return jetzt >= ablauf(v, tage); }).map(function (v) { return v.id; });
    weg.forEach(function (id) { loeschen(c, id, jetzt); });
    return weg.length;
  }
  function spaetestens(c, tage) { return tage > 0 ? Math.max.apply(null, c.liste.map(function (v) { return ablauf(v, tage); })) : 0; }
  // Schutz gegen schnelles Durchprobieren: die ersten 4 Fehlversuche ohne Wartezeit, dann 30 s, verdoppelt bis höchstens 15 Minuten
  function wartezeit(fehl) { return fehl < 5 ? 0 : Math.min(15 * 60000, 30000 * Math.pow(2, fehl - 5)); }

  // ----- Verschlüsselung (WebCrypto) -----
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function schluessel(pin, salt, iter) {
    var sc = globalThis.crypto && globalThis.crypto.subtle;
    if (!sc) return Promise.reject(new Error('kein WebCrypto'));
    return sc.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return sc.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function verschluesseln(key, obj) {
    var iv = zufall(12);
    return globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(JSON.stringify(obj)))
      .then(function (ct) { return { iv: b64(iv), ct: b64(new Uint8Array(ct)) }; });
  }
  function entschluesseln(key, iv, ct) {
    return globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct))
      .then(function (pt) { return JSON.parse(new TextDecoder().decode(pt)); });
  }
  function webCrypto() { try { return !!(globalThis.crypto && globalThis.crypto.subtle && globalThis.TextEncoder); } catch (e) { return false; } }

  // ----- Tresor: verbindet die Vorgänge mit dem Gerätespeicher -----
  // roh: { get(key, cb), set(key, val, fehler, ok), remove(key) }
  // opt: { jetzt(), fehler(), gesperrt(), bereit(), iter }
  function tresor(roh, opt) {
    opt = opt || {};
    var meta = null, c = null, key = null, offenG = null, bereit = false, warte = [], kette = Promise.resolve(true), geplant = false;
    var jetzt = function () { return opt.jetzt ? opt.jetzt() : Date.now(); };
    var fehler = function () { if (opt.fehler) opt.fehler(); };
    function setzen(k, v) { return new Promise(function (res) { roh.set(k, v, function () { fehler(); res(false); }, function () { res(true); }); }); }
    function parse(v) { try { var m = v ? JSON.parse(v) : null; return m && typeof m === 'object' && m.v === 1 ? m : null; } catch (e) { return null; } }
    // Ohne PIN: geöffneter Vorgang unter den bisherigen Schlüsseln, der Rest (ohne dessen Daten) unter lotse.vorgaenge
    function klarMeta() {
      var cc = fuerSpeicher(c); aktiv(cc).daten = null;
      return { v: 1, tage: meta.tage || 0, zuletzt: meta.zuletzt || 0, klar: cc };
    }
    function speichernJetzt() {
      if (!bereit) return Promise.resolve(false);
      return gAktualisieren().then(speichernRoh);
    }
    function speichernRoh() {
      if (!bereit) return Promise.resolve(false);
      if (!key) return setzen(SCHLUESSEL, JSON.stringify(klarMeta()));
      var pin = meta.pin, tage = meta.tage || 0, bis = spaetestens(c, tage);
      return verschluesseln(key, fuerSpeicher(c)).then(function (e) {
        var m = { v: 1, tage: tage, zuletzt: meta.zuletzt || 0, pin: { salt: pin.salt, iter: pin.iter, iv: e.iv, ct: e.ct }, bis: bis };
        if (!meta.pin) return true; // PIN inzwischen ausgeschaltet: der nächste Schreibvorgang speichert unverschlüsselt
        meta = m; return setzen(SCHLUESSEL, JSON.stringify(m));
      }, function () { fehler(); return false; });
    }
    // Schreiben nacheinander; mehrere Änderungen kurz hintereinander werden zu einem Schreibvorgang mit dem neuesten Stand
    function speichern() {
      if (!bereit) return kette;
      gSchliessen();
      if (geplant) return kette;
      geplant = true;
      kette = kette.then(function () { geplant = false; return speichernJetzt(); });
      return kette;
    }
    // ----- Einzeln gesperrte Vorgänge -----
    // offenG: der gerade mit seiner PIN geöffnete gesperrte Vorgang { id, key, name } (nur im Speicher)
    function gAktualisieren() { // verschlüsselt den geöffneten gesperrten Vorgang neu (neuer IV), bevor gespeichert wird
      var o = offenG, v = o && finde(c, o.id);
      if (!v || !gesp(v) || !v.daten) return Promise.resolve(true);
      var sp = v.sperre;
      return verschluesseln(o.key, { name: o.name, daten: v.daten }).then(function (e) { sp.iv = e.iv; sp.ct = e.ct; return true; }, function () { fehler(); return false; });
    }
    // Nach einem Wechsel: den bisher geöffneten gesperrten Vorgang ein letztes Mal verschlüsseln, dann Angaben und Schlüssel vergessen
    function gSchliessen() {
      var o = offenG; if (!o || (c && c.aktiv === o.id && finde(c, o.id))) return;
      offenG = null;
      var v = c && finde(c, o.id); if (!v || !gesp(v) || !v.daten) { if (v && gesp(v)) v.daten = null; return; }
      var d = v.daten, sp = v.sperre; v.daten = null;
      kette = kette.then(function () {
        return verschluesseln(o.key, { name: o.name, daten: d }).then(function (e) { sp.iv = e.iv; sp.ct = e.ct; }, fehler);
      }).then(speichernRoh);
    }
    // Ist der geöffnete Vorgang gesperrt (aber nicht mit PIN geöffnet), einen offenen nehmen oder einen neuen leeren anlegen.
    // Ein mit PIN geöffneter gesperrter Vorgang bleibt geöffnet: sonst stünden die Angaben des dann gewählten Vorgangs weder
    // unter den bisherigen Schlüsseln noch in lotse.vorgaenge (Datenverlust nach dem Neustart).
    function offenWaehlen() {
      if (!gesp(aktiv(c)) || gOffen(aktiv(c))) return false;
      var o = c.liste.filter(function (v) { return !gesp(v); })[0];
      if (!o) { o = neu('', {}, jetzt()); c.liste.push(o); }
      c.aktiv = o.id; return true;
    }
    function klarAktiv() { return !key && !gesp(aktiv(c)); } // Angaben des geöffneten Vorgangs stehen unter den bisherigen Schlüsseln
    function klarDatenSchreiben() {
      if (!klarAktiv()) { klarDatenEntfernen(); return; }
      var d = aktiv(c).daten;
      DATEN.forEach(function (k) { if (d[k] != null) roh.set(k, d[k], fehler); else roh.remove(k); });
    }
    function klarDatenEntfernen() { DATEN.forEach(function (k) { roh.remove(k); }); }
    function fertig() {
      bereit = true;
      var w = warte; warte = [];
      w.forEach(function (x) { x[1](wert(x[0])); });
      if (opt.bereit) opt.bereit();
    }
    function wert(k) { var d = aktiv(c).daten; return d && d[k] != null ? d[k] : null; }
    // beimStart: beim Öffnen bzw. Entsperren. Dann wird gemeldet, was gelöscht wurde (opt.geloescht), und bei einem
    // Sprung der Geräteuhr um mehr als ein Jahr seit dem letzten Öffnen erst nachgefragt (opt.sprung), statt sofort zu löschen.
    function uhrSprung() { return !!(meta && meta.zuletzt && jetzt() - meta.zuletzt > 365 * TAG); }
    function abgelaufenePruefen(beimStart) {
      if (beimStart && meta.tage > 0 && uhrSprung() && opt.sprung) {
        opt.sprung(function () { meta.zuletzt = jetzt(); abgelaufenePruefen(true); speichern(); });
        return 0;
      }
      var a = aktiv(c).id;
      var n = aufraeumen(c, meta.tage || 0, jetzt());
      if (n) offenWaehlen();
      if (n && !key && aktiv(c).id !== a) klarDatenSchreiben();
      meta.zuletzt = Math.max(meta.zuletzt || 0, jetzt());
      if (n) speichern();
      if (n && beimStart && opt.geloescht) opt.geloescht(n, jetzt());
      return n;
    }

    function init() {
      roh.get(SCHLUESSEL, function (v) {
        meta = parse(v) || { v: 1, tage: 0 };
        if (meta.pin) {
          // Alles abgelaufen: ohne PIN löschen (das Ablaufdatum steht unverschlüsselt, die Angaben nicht)
          if (meta.tage > 0 && meta.bis && jetzt() >= meta.bis && !uhrSprung()) { allesLoeschen(); return; }
          klarDatenEntfernen(); // Reste aus der Zeit vor der PIN
          if (opt.gesperrt) opt.gesperrt();
          return;
        }
        c = gueltig(meta.klar) ? meta.klar : leer(jetzt());
        if (!finde(c, c.aktiv)) c.aktiv = c.liste[0].id;
        if (offenWaehlen()) { // zuletzt war ein gesperrter Vorgang geöffnet: dessen Angaben stehen nicht unter den bisherigen Schlüsseln
          klarDatenEntfernen(); bereit = true; klarDatenSchreiben(); abgelaufenePruefen(true); speichern(); fertig(); return;
        }
        // Daten des geöffneten Vorgangs aus den bisherigen Schlüsseln (auch Speicherstände von vor den Vorgängen)
        var d = {}, offen = DATEN.length;
        DATEN.forEach(function (k) {
          roh.get(k, function (x) {
            if (x != null) d[k] = x;
            if (--offen) return;
            aktiv(c).daten = d;
            bereit = true; abgelaufenePruefen(true); fertig();
          });
        });
      });
    }

    function sperrRest() { return meta && meta.sperreBis ? Math.max(0, meta.sperreBis - jetzt()) : 0; }
    function entsperren(pin) {
      var rest = sperrRest();
      if (rest > 0) return Promise.resolve({ ok: false, warten: rest });
      var p = meta.pin;
      return schluessel(pin, unb64(p.salt), p.iter).then(function (k) {
        return entschluesseln(k, p.iv, p.ct).then(function (obj) {
          if (!gueltig(obj)) throw new Error('ungültig');
          return { k: k, obj: obj };
        });
      }).then(function (r) {
        // außerhalb des Fehlerzweigs: ein Fehler beim Anzeigen zählt nicht als falsche PIN
        key = r.k; c = r.obj; meta.fehl = 0; meta.sperreBis = 0;
        if (!finde(c, c.aktiv)) c.aktiv = c.liste[0].id;
        offenWaehlen();
        bereit = true; abgelaufenePruefen(true); speichern(); fertig();
        return { ok: true };
      }, function () {
        meta.fehl = (meta.fehl || 0) + 1;
        var w = wartezeit(meta.fehl);
        meta.sperreBis = w ? jetzt() + w : 0;
        return setzen(SCHLUESSEL, JSON.stringify(meta)).then(function () { return { ok: false, warten: w }; });
      });
    }
    function pinSetzen(pin) {
      if (!bereit || !PIN_RE.test(String(pin))) return Promise.resolve(false);
      var salt = zufall(16), iter = opt.iter || ITER;
      return schluessel(pin, salt, iter).then(function (k) {
        var vorher = !key;
        key = k; meta.pin = { salt: b64(salt), iter: iter };
        return kette.then(speichernJetzt).then(function (ok) {
          if (ok && vorher) klarDatenEntfernen(); // erst nach erfolgreichem verschlüsseltem Schreiben
          if (!ok && vorher) { key = null; delete meta.pin; } // nicht gespeichert: PIN gilt nicht, Angaben bleiben wie vorher
          return ok;
        });
      }, function () { return false; });
    }
    function pinAus() {
      if (!bereit || !key) return Promise.resolve(false);
      key = null; delete meta.pin; delete meta.bis; meta.fehl = 0; meta.sperreBis = 0;
      klarDatenSchreiben();
      return kette.then(speichernJetzt);
    }
    function allesLoeschen() {
      key = null; offenG = null; klarDatenEntfernen(); roh.remove(SCHLUESSEL);
      meta = { v: 1, tage: meta && meta.tage || 0 }; c = leer(jetzt());
      if (!bereit) fertig();
      if (meta.tage) speichern(); // nur die Einstellung „automatisch löschen“ bleibt
      return kette;
    }

    function gOffen(v) { return !!(offenG && v && offenG.id === v.id && gesp(v)); }
    function gName(v) { return gOffen(v) ? offenG.name : v.name; }
    function gRest(v) { return v.sperre.bis ? Math.max(0, v.sperre.bis - jetzt()) : 0; }
    // Inhalt eines gesperrten Vorgangs mit der PIN entschlüsseln: { k, name, daten } oder Fehler (falsche PIN, Wartezeit)
    function gEntschluesseln(v, pin) {
      var sp = v.sperre, rest = gRest(v);
      if (rest > 0) return Promise.reject({ warten: rest });
      if (!VPIN_RE.test(String(pin))) return gFalsch(v);
      return schluessel(String(pin), unb64(sp.salt), sp.iter).then(function (k) {
        return entschluesseln(k, sp.iv, sp.ct).then(function (obj) {
          if (!obj || typeof obj.name !== 'string' || !obj.daten || typeof obj.daten !== 'object') throw new Error('ungültig');
          return { k: k, name: obj.name, daten: obj.daten };
        });
      }).then(function (r) { sp.fehl = 0; sp.bis = 0; return r; }, function () { return gFalsch(v); });
    }
    // Falsche PIN: Fehlversuch zählen (gleiche Wartezeiten wie bei der App-PIN), gespeichert ohne Angaben
    function gFalsch(v) {
      var sp = v.sperre; sp.fehl = (sp.fehl || 0) + 1;
      var w = wartezeit(sp.fehl); sp.bis = w ? jetzt() + w : 0;
      return speichernRoh().then(function () { throw { falsch: true, warten: w }; }); // läuft schon in der Kette (gVersuch)
    }
    // Ein PIN-Versuch nach dem anderen (in der Schreibkette): mehrere gleichzeitig gestartete Versuche können die Wartezeit nicht umgehen
    function gVersuch(v, pin) {
      var p = kette.then(function () { return gEntschluesseln(v, pin); });
      kette = p.then(function () { return true; }, function () { return true; });
      return p;
    }
    function gErgebnis(e) { return { ok: false, warten: e && e.warten || 0, falsch: !!(e && e.falsch) }; }
    // Vorgang mit eigener PIN sperren. kurz: freiwilliger Kurzname, der ohne PIN in der Liste steht (sonst neutral).
    // Ist es der geöffnete Vorgang, wird danach ein anderer geöffnet (oder ein neuer leerer angelegt): gesperrt heißt sofort zu.
    function gSperren(id, pin, kurz) {
      var v = bereit && finde(c, id);
      if (!v || gesp(v) || !VPIN_RE.test(String(pin))) return Promise.resolve(false);
      var salt = zufall(16), iter = opt.iter || ITER;
      var p = kette.then(function () {
        return schluessel(String(pin), salt, iter).then(function (k) { return verschluesseln(k, { name: v.name, daten: v.daten || {} }); });
      }).then(function (e) {
        if (!finde(c, id) || gesp(v)) return false;
        var vorher = { name: v.name, daten: v.daten, aktiv: c.aktiv, liste: c.liste.slice() };
        v.sperre = { salt: b64(salt), iter: iter, iv: e.iv, ct: e.ct }; v.name = nameSauber(kurz); v.daten = null;
        var warAktiv = c.aktiv === id;
        offenWaehlen();
        return speichernRoh().then(function (ok) {
          if (ok) { if (warAktiv) klarDatenSchreiben(); return true; }
          // nicht gespeichert: alles wie vorher (die Angaben bleiben ungesperrt)
          delete v.sperre; v.name = vorher.name; v.daten = vorher.daten; c.liste = vorher.liste; c.aktiv = vorher.aktiv;
          return false;
        });
      }, function () { fehler(); return false; });
      kette = p.then(function () { return true; }, function () { return true; }); // nachfolgende Schreibvorgänge erst danach
      return p;
    }
    // Gesperrten Vorgang mit der PIN öffnen: Angaben nur im Speicher, gespeichert wird weiter verschlüsselt
    function gOeffnen(id, pin) {
      var v = bereit && finde(c, id);
      if (!v || !gesp(v)) return Promise.resolve({ ok: false });
      if (gOffen(v)) return Promise.resolve({ ok: true });
      return gVersuch(v, pin).then(function (r) {
        if (!finde(c, id) || !gesp(v)) return { ok: false };
        c.aktiv = id; gSchliessen(); // anderer gesperrter Vorgang war offen: wieder zu
        offenG = { id: id, key: r.k, name: r.name }; v.daten = r.daten;
        // der bisher geöffnete steht jetzt mit seinen Angaben in lotse.vorgaenge: erst das schreiben, dann die bisherigen Schlüssel leeren
        var k = speichern(); if (!key) k.then(function (ok) { if (ok && !klarAktiv()) klarDatenEntfernen(); });
        return { ok: true };
      }, gErgebnis);
    }
    // Sperre aufheben (PIN nötig): Name und Angaben stehen danach wieder wie bei jedem anderen Vorgang
    function gAufheben(id, pin) {
      var v = bereit && finde(c, id);
      if (!v || !gesp(v)) return Promise.resolve({ ok: false });
      return gVersuch(v, pin).then(function (r) {
        if (!finde(c, id) || !gesp(v)) return { ok: false };
        var daten = gOffen(v) && v.daten ? v.daten : r.daten;
        if (gOffen(v)) offenG = null;
        delete v.sperre; v.name = r.name; v.daten = daten;
        if (c.aktiv === id) klarDatenSchreiben();
        speichern(); return { ok: true };
      }, gErgebnis);
    }

    // Nur lesen (z. B. „Für Klient zusammenstellen“): entschlüsselt einen gesperrten Vorgang, ohne ihn zu öffnen oder etwas
    // zurückzuschreiben (nur der Fehlversuchszähler wird gespeichert). Ergebnis: { id, name, daten } als Kopie; falsche PIN: reject.
    function oeffneGesperrt(id, pin) {
      var v = bereit && finde(c, id);
      if (!v || !gesp(v)) return Promise.reject(new Error('nicht gesperrt'));
      return gVersuch(v, pin).then(function (r) {
        var d = gOffen(v) && v.daten ? v.daten : r.daten; // geöffnet: neuester Stand aus dem Speicher
        return { id: id, name: r.name, daten: kopieVon(d) };
      }, function (e) { var x = new Error(e && e.falsch ? 'falsche PIN' : 'warten'); x.warten = e && e.warten || 0; x.falsch = !!(e && e.falsch); throw x; });
    }

    var api = {
      SCHLUESSEL: SCHLUESSEL, DATEN: DATEN,
      hat: function (k) { return DATEN.indexOf(k) >= 0; },
      get: function (k, cb) { if (!bereit) { warte.push([k, cb]); return; } cb(wert(k)); },
      set: function (k, val) { // false: nicht gespeichert (vor dem Laden oder gesperrt)
        if (!bereit) return false; // vor dem Laden oder gesperrt: nichts überschreiben
        if (!wertSetzen(c, k, val == null ? null : String(val), jetzt())) return true; // unverändert
        if (klarAktiv()) { if (val == null) roh.remove(k); else roh.set(k, String(val), fehler); }
        speichern(); return true;
      },
      remove: function (k) { api.set(k, null); },
      bereit: function () { return bereit; },
      pinAn: function () { return !!(meta && meta.pin); },
      gesperrt: function () { return !!(meta && meta.pin) && !bereit; },
      sperrRest: sperrRest,
      // Gesperrte Vorgänge: name = freiwilliger Kurzname (sonst leer), offen = gerade mit PIN geöffnet (dann der richtige Name)
      liste: function () { return bereit ? c.liste.map(function (v) { return { id: v.id, name: gName(v), erstellt: v.erstellt, geaendert: v.geaendert, ablauf: ablauf(v, meta.tage || 0), gesperrt: gesp(v), offen: gOffen(v) }; }) : []; },
      // Wert eines Datenschlüssels in allen Vorgängen (nur lesen), z. B. für den Fristen-Hinweis beim Öffnen
      ueberall: function (k) { if (!bereit) return []; return c.liste.map(function (v) { return { id: v.id, name: gName(v), aktiv: v.id === c.aktiv, wert: v.daten && v.daten[k] != null ? v.daten[k] : null }; }); }, // gesperrt und nicht geöffnet: keine Angaben
      aktiv: function () { if (!bereit) return null; var v = aktiv(c); return { id: v.id, name: gName(v), geaendert: v.geaendert, ablauf: ablauf(v, meta.tage || 0), gesperrt: gesp(v) }; },
      // Vorgang wechseln: vorher müssen die Angaben im Speicher stehen (App: flush())
      oeffnen: function (id) {
        if (!bereit || !finde(c, id) || id === c.aktiv || gesp(finde(c, id))) return false; // gesperrt: nur mit PIN (gOeffnen)
        c.aktiv = id; var k = speichern(); if (!key) k.then(klarDatenSchreiben); return true; // erst lotse.vorgaenge, dann die Klartext-Schlüssel
      },
      neu: function (name) {
        if (!bereit) return null;
        var v = neu(name, {}, jetzt()); c.liste.push(v); c.aktiv = v.id;
        if (!key) klarDatenEntfernen();
        speichern(); return v.id;
      },
      // Neuer Vorgang aus einer Weitergabe (QR-Code/SoLo-Datei, src/weitergabe.js): nur bekannte Datenschlüssel (Texte), der geöffnete Vorgang
      // bleibt geöffnet, bestehende Vorgänge werden nie überschrieben
      importieren: function (name, daten) {
        if (!bereit || !daten || typeof daten !== 'object') return null;
        var d = {}, n = 0;
        DATEN.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(daten, k) && typeof daten[k] === 'string') { d[k] = daten[k]; n++; } });
        if (!n) return null;
        var v = neu(name, d, jetzt()); c.liste.push(v);
        speichern(); return v.id;
      },
      umbenennen: function (id, name) {
        var v = bereit && finde(c, id), n = nameSauber(name);
        if (!v || !n || gesp(v)) return false;
        v.name = n; speichern(); return true;
      },
      kopie: function (id, name) {
        if (!bereit || gesp(finde(c, id))) return null; // gesperrte Vorgänge nicht kopieren (sonst lägen die Angaben ungeschützt daneben)
        var v = kopie(c, id, name, jetzt()); if (!v) return null;
        if (!key) klarDatenSchreiben();
        speichern(); return v.id;
      },
      loeschen: function (id) {
        if (!bereit) return false;
        var a = c.aktiv;
        if (!loeschen(c, id, jetzt())) return false; // auch gesperrte Vorgänge: ohne PIN (die App fragt vorher nach)
        offenWaehlen();
        if (!key && a === id) klarDatenSchreiben();
        speichern(); return true;
      },
      tage: function (n) {
        if (n === undefined) return meta ? meta.tage || 0 : 0;
        if (!bereit) return 0;
        meta.tage = [0, 30, 90].indexOf(Number(n)) >= 0 ? Number(n) : 0;
        abgelaufenePruefen(); speichern(); return meta.tage;
      },
      pinPruefen: function (pin) {
        var p = meta && meta.pin; if (!p || !p.ct || !PIN_RE.test(String(pin))) return Promise.resolve(false);
        return kette.then(function () { p = meta.pin; return schluessel(String(pin), unb64(p.salt), p.iter); }).then(function (k) { return entschluesseln(k, p.iv, p.ct).then(function () { return true; }); }).catch(function () { return false; });
      },
      // Für „Rückgängig“ nach dem Löschen eines Vorgangs: Abbild aller Vorgänge (mit Daten) und Zurückholen
      sicherung: function () { return bereit ? kopieVon(c) : null; },
      zurueck: function (alt) {
        if (!bereit || !gueltig(alt)) return false;
        var vor = c; c = kopieVon(alt);
        // Rückgängig ändert nie eine Sperre: was jetzt gesperrt ist, bleibt gesperrt (nicht der Klartext von vorher), was inzwischen
        // entsperrt wurde, bleibt offen, und der Fehlversuchszähler wird nicht zurückgesetzt. Sonst gilt der Stand von jetzt.
        c.liste = c.liste.map(function (v) { var h = finde(vor, v.id); return h && (gesp(h) || gesp(v)) ? h : v; });
        if (!finde(c, c.aktiv)) c.aktiv = c.liste[0].id;
        c.liste.forEach(function (v) { if (gesp(v) && !gOffen(v)) v.daten = null; }); // Angaben gesperrter Vorgänge nur, solange geöffnet
        if (offenG && c.aktiv !== offenG.id) { var vo = finde(c, offenG.id); if (vo) vo.daten = null; offenG = null; }
        offenWaehlen();
        if (!key) klarDatenSchreiben();
        speichern(); return true;
      },
      gSperren: gSperren, gOeffnen: gOeffnen, oeffneGesperrt: oeffneGesperrt, gAufheben: gAufheben, gWarten: function (id) { var v = bereit && finde(c, id); return v && gesp(v) ? gRest(v) : 0; },
      entsperren: entsperren, pinSetzen: pinSetzen, pinAus: pinAus, allesLoeschen: allesLoeschen,
      fertig: function () { return kette; }
    };
    init();
    zuletzt = api;
    return api;
  }

  // Vorgaenge.oeffneGesperrt(id, pin) -> Promise<{ id, name, daten }>: siehe oeffneGesperrt im Tresor
  function oeffneGesperrtAussen(id, pin) { return zuletzt ? zuletzt.oeffneGesperrt(id, pin) : Promise.reject(new Error('kein Tresor')); }
  return { tresor: tresor, oeffneGesperrt: oeffneGesperrtAussen, DATEN: DATEN, SCHLUESSEL: SCHLUESSEL, neu: neu, leer: leer, kopie: kopie, loeschen: loeschen, wertSetzen: wertSetzen, ablauf: ablauf, aufraeumen: aufraeumen,
    wartezeit: wartezeit, nameSauber: nameSauber, schluessel: schluessel, verschluesseln: verschluesseln, entschluesseln: entschluesseln,
    webCrypto: webCrypto, ITER: ITER, NAME_MAX: NAME_MAX, PIN_RE: PIN_RE, VPIN_RE: VPIN_RE, TAGE: [0, 30, 90] };
})();
if (typeof module !== 'undefined') module.exports = Vorgaenge;
