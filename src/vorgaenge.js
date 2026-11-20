// Vorgänge (Haushalte): mehrere gespeicherte Angaben auf dem Gerät, optional mit PIN verschlüsselt. Läuft in der App und in Node (Tests).
// Ohne PIN bleiben die Angaben des geöffneten Vorgangs unter den bisherigen Schlüsseln (lotse.state, lotse.einfach, lotse.pflegecheck,
// lotse.pfaendung); die übrigen Vorgänge und die Namen stehen unter lotse.vorgaenge. So laden ältere Speicherstände ohne Umbau.
// Mit PIN steht alles verschlüsselt (PBKDF2-SHA-256 + AES-GCM, zufälliges Salt und IV) unter lotse.vorgaenge; die PIN selbst wird nie gespeichert.
const Vorgaenge = (function () {
  var SCHLUESSEL = 'lotse.vorgaenge';
  var DATEN = ['lotse.state', 'lotse.einfach', 'lotse.pflegecheck', 'lotse.pfaendung', 'lotse.haushalt', 'lotse.haken', 'lotse.ausziehen', 'lotse.fristliste', 'lotse.schulden'];
  var ITER = 600000; // PBKDF2-HMAC-SHA-256: Empfehlung OWASP Password Storage Cheat Sheet (Stand 2023/2026)
  var NAME_MAX = 24;
  var TAG = 86400000;
  var PIN_RE = /^\d{4,12}$/;

  function zufall(n) { var a = new Uint8Array(n); globalThis.crypto.getRandomValues(a); return a; }
  function neueId() { return Array.prototype.map.call(zufall(6), function (b) { return (b + 256).toString(16).slice(1); }).join(''); }
  function kopieVon(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }

  function neu(name, daten, jetzt) { return { id: neueId(), name: nameSauber(name), erstellt: jetzt, geaendert: jetzt, daten: daten || {} }; }
  function leer(jetzt) { var v = neu('', {}, jetzt); return { aktiv: v.id, liste: [v] }; }
  function nameSauber(s) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX); }
  function finde(c, id) { return c.liste.filter(function (v) { return v.id === id; })[0] || null; }
  function aktiv(c) { return finde(c, c.aktiv) || c.liste[0]; }
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
    var meta = null, c = null, key = null, bereit = false, warte = [], kette = Promise.resolve(true), geplant = false;
    var jetzt = function () { return opt.jetzt ? opt.jetzt() : Date.now(); };
    var fehler = function () { if (opt.fehler) opt.fehler(); };
    function setzen(k, v) { return new Promise(function (res) { roh.set(k, v, function () { fehler(); res(false); }, function () { res(true); }); }); }
    function parse(v) { try { var m = v ? JSON.parse(v) : null; return m && typeof m === 'object' && m.v === 1 ? m : null; } catch (e) { return null; } }
    // Ohne PIN: geöffneter Vorgang unter den bisherigen Schlüsseln, der Rest (ohne dessen Daten) unter lotse.vorgaenge
    function klarMeta() {
      var cc = kopieVon(c); aktiv(cc).daten = null;
      return { v: 1, tage: meta.tage || 0, zuletzt: meta.zuletzt || 0, klar: cc };
    }
    function speichernJetzt() {
      if (!bereit) return Promise.resolve(false);
      if (!key) return setzen(SCHLUESSEL, JSON.stringify(klarMeta()));
      var pin = meta.pin, tage = meta.tage || 0, bis = spaetestens(c, tage);
      return verschluesseln(key, c).then(function (e) {
        var m = { v: 1, tage: tage, zuletzt: meta.zuletzt || 0, pin: { salt: pin.salt, iter: pin.iter, iv: e.iv, ct: e.ct }, bis: bis };
        if (!meta.pin) return true; // PIN inzwischen ausgeschaltet: der nächste Schreibvorgang speichert unverschlüsselt
        meta = m; return setzen(SCHLUESSEL, JSON.stringify(m));
      }, function () { fehler(); return false; });
    }
    // Schreiben nacheinander; mehrere Änderungen kurz hintereinander werden zu einem Schreibvorgang mit dem neuesten Stand
    function speichern() {
      if (!bereit) return kette;
      if (geplant) return kette;
      geplant = true;
      kette = kette.then(function () { geplant = false; return speichernJetzt(); });
      return kette;
    }
    function klarDatenSchreiben() {
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
      key = null; klarDatenEntfernen(); roh.remove(SCHLUESSEL);
      meta = { v: 1, tage: meta && meta.tage || 0 }; c = leer(jetzt());
      if (!bereit) fertig();
      if (meta.tage) speichern(); // nur die Einstellung „automatisch löschen“ bleibt
      return kette;
    }

    var api = {
      SCHLUESSEL: SCHLUESSEL, DATEN: DATEN,
      hat: function (k) { return DATEN.indexOf(k) >= 0; },
      get: function (k, cb) { if (!bereit) { warte.push([k, cb]); return; } cb(wert(k)); },
      set: function (k, val) { // false: nicht gespeichert (vor dem Laden oder gesperrt)
        if (!bereit) return false; // vor dem Laden oder gesperrt: nichts überschreiben
        if (!wertSetzen(c, k, val == null ? null : String(val), jetzt())) return true; // unverändert
        if (!key) { if (val == null) roh.remove(k); else roh.set(k, String(val), fehler); }
        speichern(); return true;
      },
      remove: function (k) { api.set(k, null); },
      bereit: function () { return bereit; },
      pinAn: function () { return !!(meta && meta.pin); },
      gesperrt: function () { return !!(meta && meta.pin) && !bereit; },
      sperrRest: sperrRest,
      liste: function () { return bereit ? c.liste.map(function (v) { return { id: v.id, name: v.name, erstellt: v.erstellt, geaendert: v.geaendert, ablauf: ablauf(v, meta.tage || 0) }; }) : []; },
      // Wert eines Datenschlüssels in allen Vorgängen (nur lesen), z. B. für den Fristen-Hinweis beim Öffnen
      ueberall: function (k) { if (!bereit) return []; return c.liste.map(function (v) { return { id: v.id, name: v.name, aktiv: v.id === c.aktiv, wert: v.daten && v.daten[k] != null ? v.daten[k] : null }; }); },
      aktiv: function () { if (!bereit) return null; var v = aktiv(c); return { id: v.id, name: v.name, geaendert: v.geaendert, ablauf: ablauf(v, meta.tage || 0) }; },
      // Vorgang wechseln: vorher müssen die Angaben im Speicher stehen (App: flush())
      oeffnen: function (id) {
        if (!bereit || !finde(c, id) || id === c.aktiv) return false;
        c.aktiv = id; var k = speichern(); if (!key) k.then(klarDatenSchreiben); return true; // erst lotse.vorgaenge, dann die Klartext-Schlüssel
      },
      neu: function (name) {
        if (!bereit) return null;
        var v = neu(name, {}, jetzt()); c.liste.push(v); c.aktiv = v.id;
        if (!key) klarDatenEntfernen();
        speichern(); return v.id;
      },
      umbenennen: function (id, name) {
        var v = bereit && finde(c, id), n = nameSauber(name);
        if (!v || !n) return false;
        v.name = n; speichern(); return true;
      },
      kopie: function (id, name) {
        if (!bereit) return null;
        var v = kopie(c, id, name, jetzt()); if (!v) return null;
        if (!key) klarDatenSchreiben();
        speichern(); return v.id;
      },
      loeschen: function (id) {
        if (!bereit) return false;
        var a = c.aktiv;
        if (!loeschen(c, id, jetzt())) return false;
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
      entsperren: entsperren, pinSetzen: pinSetzen, pinAus: pinAus, allesLoeschen: allesLoeschen,
      fertig: function () { return kette; }
    };
    init();
    return api;
  }

  return { tresor: tresor, DATEN: DATEN, SCHLUESSEL: SCHLUESSEL, neu: neu, leer: leer, kopie: kopie, loeschen: loeschen, wertSetzen: wertSetzen, ablauf: ablauf, aufraeumen: aufraeumen,
    wartezeit: wartezeit, nameSauber: nameSauber, schluessel: schluessel, verschluesseln: verschluesseln, entschluesseln: entschluesseln,
    webCrypto: webCrypto, ITER: ITER, NAME_MAX: NAME_MAX, PIN_RE: PIN_RE, TAGE: [0, 30, 90] };
})();
if (typeof module !== 'undefined') module.exports = Vorgaenge;
