// Suche: Lupe oben auf jeder Seite (Startseite: in der Kopfzeile) öffnet ein Such-Fenster „Was suchst du?“; Treffer führen direkt zur Seite.
// - Offline: kein Server, keine Daten nach außen, die Suchbegriffe werden nirgends gespeichert (nur im Eingabefeld, solange die App offen ist).
// - Index: alle Ziele der App (ZIELE unten) mit dem Seitentitel der gewählten Sprache, dem deutschen Titel und den Alltagswörtern
//   aus src/lang/suche/woerter/<Sprache>.json (beim Bauen als WOERTER eingesetzt; alte Namen wie „Hartz 4“, „Pflegestufe“, „GEZ“).
// - Tippfehler-tolerant (Damerau-Levenshtein, je nach Wortlänge 0, 1 oder 2 Fehler), Groß/Klein egal, ä = ae, ß = ss, Teilwörter.
// - Die Wege zu den Seiten kennt die App (o.gehe in src/app.js); hier stehen nur Liste, Suche und Anzeige.
var Suche = (function () {
  'use strict';
  var WOERTER = /*SUCHWOERTER*/null;

  // Bereiche: Beschriftung (vorhandene Schlüssel) und Linien-Symbol; Farbe des Symbols in der Bereichsfarbe (CSS .su-<Bereich>)
  var BEREICHE = {
    L: ['su.b.leistungen', '<path d="M9 11l2 2 4-4"/><rect x="4" y="3" width="16" height="18" rx="2"/>'],
    B: ['su.b.briefe', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'],
    G: ['home.geld', '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M6 7l9.6-2.9A1 1 0 0 1 17 5v2"/><path d="M21 11h-4.5a2 2 0 0 0 0 4H21"/>'],
    P: ['home.pflege', '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M9 12h6M12 9v6"/>'],
    A: ['az.kachel', '<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/><path d="M17 3l2 2-2 2"/>'],
    M: ['su.b.mappe', '<path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 13h6"/>'],
    E: ['nav.einst', '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'],
    O: ['nav.ordner', '<path d="M3 6h7l2 2h9v11H3z"/>']
  };
  // Ziele: [ID, Bereich, Titel-Schlüssel]. „N:<id>“ = Name der Leistung (Rules.NAMES bzw. n.<id>). Reihenfolge = Rang bei gleicher Güte.
  var LEISTUNGEN = ['wohngeld', 'ggeld', 'kiz', 'kindergeld', 'but', 'uvg', 'gsa', 'pflege', 'ausweis', 'rundfunk', 'alg1', 'bafoeg', 'bab', 'elterngeld',
    'mutter', 'krankengeld', 'kkg', 'zuzahl', 'wbs', 'emrente', 'eingl', 'pausch', 'blindengeld', 'blh', 'hzp', 'lpg', 'pflegeplus', 'arbeit', 'srente', 'kgBeh', 'asylblg'];
  var ZIELE = [['check', 'L', 'home.leistungen']].concat(LEISTUNGEN.map(function (id) { return ['l-' + id, 'L', 'N:' + id]; })).concat([
    ['brief', 'B', 'home.brief'], ['b-jc', 'B', 'briefe.jobcenter'], ['b-sa', 'B', 'briefe.sozialamt'], ['b-wg', 'B', 'briefe.wohngeld'],
    ['b-fk', 'B', 'briefe.familienkasse'], ['b-pk', 'B', 'briefe.pflegekasse'], ['b-vm', 'B', 'briefe.vermieter'], ['b-ab', 'B', 'briefe.ab'],
    ['b-an', 'B', 'briefe.andere'], ['b-af', 'B', 'briefe.formular'],
    ['geld', 'G', 'home.geld'], ['g-dringend', 'G', 'gs.dringend'], ['g-check', 'G', 'kc.h'], ['g-konto', 'G', 'pf.konto'], ['g-strom', 'G', 'gs.d.strom'],
    ['g-mahn', 'G', 'gs.d.mahn'], ['g-miete', 'G', 'gs.d.miete'], ['g-geldstrafe', 'G', 'gs.d.geld'], ['g-bleibt', 'G', 'gs.bleibt'], ['g-lohn', 'G', 'pf.lohn'],
    ['g-pkonto', 'G', 'ms.pkonto'], ['g-liste', 'G', 'sl.h'], ['g-inkasso', 'G', 'gs.inkasso'], ['g-pruef', 'G', 'ip.h'], ['g-schreiben', 'G', 'ms.h'],
    ['g-rate', 'G', 'gs.rate'], ['g-hilfe', 'G', 'sb.h'], ['g-finden', 'G', 'sb.finden'], ['g-termin', 'G', 'sb.termin'], ['g-bmappe', 'G', 'sb.mappe'],
    ['g-ablauf', 'G', 'sb.ablauf'], ['g-planen', 'G', 'gs.planen'], ['g-haushalt', 'G', 'hb.kachel'], ['g-sp-strom', 'G', 'sp.strom'], ['g-sp-heizen', 'G', 'sp.heizen'],
    ['g-sp-essen', 'G', 'sp.essen'], ['g-sp-vertraege', 'G', 'sp.vertraege'], ['g-abschlag', 'G', 'pl.abschlag'], ['g-tarif', 'G', 'hb.tv.kachel'],
    ['pflege', 'P', 'home.pflege'], ['p-hilfe', 'P', 'pu.hilfe'], ['p-schaetzen', 'P', 'pu.schaetzen'],
    ['ausziehen', 'A', 'az.kachel'], ['a-vorher', 'A', 'az.vorher.h'], ['a-tage', 'A', 'az.tage.h'], ['a-geld', 'A', 'az.geld.h'], ['a-vers', 'A', 'az.vers.h'],
    ['a-achtung', 'A', 'az.achtung.h'], ['a-hilfen', 'A', 'az.hilfen.h'],
    ['mappe', 'M', 'ordner.mappe'],
    ['einst', 'E', 'nav.einst'], ['e-anzeige', 'E', 'set.anzeige.h'], ['e-erinnern', 'E', 'set.erinnern.h'], ['e-sicher', 'E', 'set.sicher.h'],
    ['e-fach', 'E', 'set.fach.h'], ['e-about', 'E', 'set.about.h'],
    ['ordner', 'O', 'nav.ordner'], ['o-fristen', 'O', 'fri.h'], ['o-ergebnis', 'O', 'ordner.ergebnis']
  ]);

  // ---------- Vergleich ----------
  // Kleinbuchstaben, Umlaute als ae/oe/ue, ß als ss, Akzente weg (é = e, ё = е), arabische Varianten vereinheitlicht (ي/ى = ی, ك = ک, ة = ه),
  // Satzzeichen als Leerzeichen
  var ERSATZ = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'ł': 'l', 'ı': 'i', 'ي': 'ی', 'ى': 'ی', 'ك': 'ک', 'ة': 'ه', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ۀ': 'ه' };
  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase().replace(/[äöüßłıيىكةأإآۀ]/g, function (c) { return ERSATZ[c]; });
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ًͯ-ٰٟ]/g, '');
    return s.replace(/[‌‍­]/g, '').replace(/[^0-9a-zЀ-ӿ؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+/g, ' ').trim();
  }
  // Damerau-Levenshtein (Vertauschen zweier Nachbarn zählt 1); max: Abbruch, sobald sicher mehr Fehler
  function dist(a, b, max) {
    if (max == null) max = 99;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var i, j, z2 = [], z1 = [], z = [];
    for (j = 0; j <= b.length; j++) z1[j] = j;
    for (i = 1; i <= a.length; i++) {
      z = [i]; var min = i;
      for (j = 1; j <= b.length; j++) {
        var k = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(z1[j] + 1, z[j - 1] + 1, z1[j - 1] + k);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, z2[j - 2] + 1);
        z[j] = v; if (v < min) min = v;
      }
      if (min > max) return max + 1;
      z2 = z1; z1 = z;
    }
    return z1[b.length];
  }
  // Erlaubte Tippfehler je Wortlänge: bis 3 Zeichen keiner, bis 7 einer, sonst zwei
  function toleranz(n) { return n <= 3 ? 0 : n <= 7 ? 1 : 2; }
  // Güte eines Suchworts q gegen ein Wort w (0 = kein Treffer)
  function wortGuete(q, w) {
    if (!q || !w) return 0;
    if (w === q) return 100;
    if (w.indexOf(q) === 0) return 86;
    if (q.length >= 3 && w.indexOf(q) > 0) return 66; // Teilwort: „geld“ in „wohngeld“
    var tl = toleranz(q.length); if (!tl) return 0;
    var d = dist(q, w, tl); if (d <= tl) return 74 - 14 * d;
    if (w.length > q.length && q.length >= 4) { d = dist(q, w.slice(0, q.length), tl); if (d <= tl) return 62 - 14 * d; } // halb getippt mit Tippfehler
    return 0;
  }
  // Güte einer Suche (Wörter qw, zusammengeschrieben qz) gegen einen Begriff t = { n, w: Wörter, z: zusammengeschrieben }
  function begriffGuete(qw, qz, t) {
    if (qz === t.z) return 110; // ganzer Begriff, auch ohne Leerzeichen („hartz4“, „kontogepfändet“)
    var summe = 0, treffer = 0;
    qw.forEach(function (q) {
      var best = 0; t.w.forEach(function (w) { var g = wortGuete(q, w); if (g > best) best = g; });
      if (best) { summe += best; treffer++; }
    });
    var g = 0;
    if (treffer && treffer * 2 >= qw.length) g = (summe / treffer) * (0.6 + 0.4 * treffer / qw.length);
    if (qw.length > 1 && qz.length >= 5) { var z = wortGuete(qz, t.z); if (z > g) g = z; } // „mahn bescheid“ → „mahnbescheid“
    return g;
  }
  function begriff(text, gewicht) {
    var n = norm(text); if (!n) return null;
    return { n: n, w: n.split(' '), z: n.replace(/ /g, ''), g: gewicht };
  }

  // ---------- Index ----------
  // o: { lang, titel(ziel) Seitentitel in der Sprache, titelDe(ziel) deutscher Standardtitel, woerter: optional (Tests) }
  function index(o) {
    var wb = o.woerter || WOERTER || {};
    var eigene = wb[o.lang] || {}, de = wb.de || {}, nah = o.lang === 'fa-AF' ? (wb.fa || {}) : o.lang === 'fa' ? (wb['fa-AF'] || {}) : {};
    return ZIELE.map(function (z, i) {
      var id = z[0], titel = o.titel(z), terme = [];
      var dazu = function (text, g) { var b = begriff(text, g); if (b && !terme.some(function (x) { return x.n === b.n && x.g >= g; })) terme.push(b); };
      dazu(titel, 1);
      if (o.titelDe) dazu(o.titelDe(z), o.lang === 'de' ? 0.98 : 0.9);
      (eigene[id] || []).forEach(function (w) { dazu(w, 0.96); });
      (nah[id] || []).forEach(function (w) { dazu(w, 0.9); });
      if (o.lang !== 'de') (de[id] || []).forEach(function (w) { dazu(w, 0.86); }); // deutsche Amtswörter kennen viele auch in anderen Sprachen
      return { id: id, bereich: z[1], titel: titel, rang: i, terme: terme };
    });
  }
  // Treffer: höchstens max (Standard 6), beste zuerst; bei gleicher Güte in der Reihenfolge der Ziele
  function suche(idx, text, max) {
    var qn = norm(text); if (qn.replace(/ /g, '').length < 2) return [];
    var qw = qn.split(' ').filter(function (w) { return w.length > 1 || qn.length <= 2; }), qz = qn.replace(/ /g, '');
    if (!qw.length) qw = [qz];
    var liste = [];
    idx.forEach(function (e) {
      var best = 0;
      e.terme.forEach(function (t) { var g = begriffGuete(qw, qz, t) * t.g; if (g > best) best = g; });
      if (best >= 45) liste.push({ e: e, g: best });
    });
    liste.sort(function (a, b) { return b.g - a.g || a.e.rang - b.e.rang; });
    return liste.slice(0, max || 6).map(function (x) { return { id: x.e.id, bereich: x.e.bereich, titel: x.e.titel, guete: Math.round(x.g) }; });
  }

  // ---------- Anzeige ----------
  // o: { t(key, werte), titel(ziel), titelDe(ziel), lang() (Sprachkennung, bei Einfacher Sprache 'de'), schluessel() (ändert sich mit Sprache
  //      und Einfacher Sprache: Index neu), gehe(id), check() }
  var app = null, idx = null, idxFuer = '';
  function $(id) { return document.getElementById(id); }
  function aktIndex() {
    var s = app.schluessel();
    if (!idx || idxFuer !== s) { idx = index({ lang: app.lang(), titel: app.titel, titelDe: app.titelDe }); idxFuer = s; }
    return idx;
  }
  // Leeres Feld: häufige Begriffe als Knöpfe (UX-Audit A, Aufgabe 12). Amtsbegriffe auf Deutsch, die Suche findet sie in jeder Sprache.
  var VORSCHLAEGE = ['Wohngeld', 'Kindergeld', 'Pflegegrad', 'Bescheid', 'Mahnung'];
  function vorschlaege(an) {
    var v = $('suVorschlag'); if (!v) return;
    v.hidden = !an; if (!an || v.firstChild) return;
    var p = document.createElement('p'); p.id = 'suVorschlagH'; p.textContent = app.t('su.haeufig'); v.appendChild(p);
    var c = document.createElement('div'); c.className = 'chips'; c.setAttribute('role', 'group'); c.setAttribute('aria-labelledby', 'suVorschlagH');
    VORSCHLAEGE.forEach(function (w) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.lang = 'de'; b.textContent = w;
      b.addEventListener('click', function () { var f = $('suFeld'); f.value = w; zeigen(); f.focus(); });
      c.appendChild(b);
    });
    v.appendChild(c);
  }
  function zeigen() {
    var feld = $('suFeld'), box = $('suTreffer'), status = $('suStatus'); if (!feld || !box) return;
    var text = feld.value;
    box.textContent = '';
    $('suLeeren').hidden = !text;
    vorschlaege(norm(text).replace(/ /g, '').length < 2);
    if (norm(text).replace(/ /g, '').length < 2) { box.hidden = true; status.textContent = ''; return; }
    var tr = suche(aktIndex(), text, 6);
    box.hidden = false;
    if (!tr.length) {
      var p = document.createElement('p'); p.className = 'su-nichts'; p.textContent = app.t('su.nichts'); box.appendChild(p);
      var d = document.createElement('div'); d.className = 'btns';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.id = 'suCheck'; b.textContent = app.t('home.leistungen');
      b.addEventListener('click', function () { if (offen()) schliessen(false); app.check(); }); d.appendChild(b); box.appendChild(d);
      status.textContent = app.t('su.nichts');
      return;
    }
    var ul = document.createElement('ul'); ul.className = 'zeilen su-liste'; ul.id = 'suListe';
    tr.forEach(function (x) {
      var li = document.createElement('li'), k = document.createElement('button'), be = BEREICHE[x.bereich];
      k.type = 'button'; k.className = 'zeile su-zeile su-' + x.bereich; k.setAttribute('data-ziel', x.id);
      k.innerHTML = '<span class="zeile-sym" aria-hidden="true"><svg viewBox="0 0 24 24">' + be[1] + '</svg></span><span class="zeile-txt"><b></b><span class="zeile-st"></span></span><span class="zeile-pfeil" aria-hidden="true">›</span>';
      k.querySelector('b').textContent = x.titel; k.querySelector('.zeile-st').textContent = app.t(be[0]);
      k.addEventListener('click', function () { gehe(x.id); });
      li.appendChild(k); ul.appendChild(li);
    });
    box.appendChild(ul);
    status.textContent = tr.length === 1 ? app.t('su.n1') : app.t('su.n', { n: tr.length });
  }
  // Pfeiltasten: vom Feld in die Treffer und zurück; Enter öffnet den ersten Treffer; Escape leert
  function tasten(ev) {
    var feld = $('suFeld'), knoepfe = [].slice.call(document.querySelectorAll('#suTreffer button'));
    var i = knoepfe.indexOf(document.activeElement);
    if (ev.key === 'ArrowDown') { if (knoepfe.length) { ev.preventDefault(); knoepfe[Math.min(i + 1, knoepfe.length - 1)].focus(); } }
    else if (ev.key === 'ArrowUp') { if (i >= 0) { ev.preventDefault(); if (i === 0) feld.focus(); else knoepfe[i - 1].focus(); } }
    else if (ev.key === 'Enter' && ev.target === feld) { ev.preventDefault(); if (knoepfe.length) knoepfe[0].click(); }
    else if (ev.key === 'Escape' && offen()) { ev.preventDefault(); schliessen(true); }
    else if (ev.key === 'Escape' && feld.value) { ev.preventDefault(); leeren(); }
  }
  function gehe(id) { if (offen()) schliessen(false); app.gehe(id); }
  // ---------- Such-Fenster auf allen anderen Seiten (Lupe oben): dasselbe Feld mit denselben Treffern ----------
  // Das Suchfeld steht nur im Fenster (Entscheidung David 21.11.2026: auch auf der Startseite nur die Lupe). Text und Treffer bleiben,
  // solange die App offen ist (nur im Feld, nie gespeichert).
  var vorFokus = null;
  function offen() { var f = $('suFenster'); return !!f && !f.hidden; }
  function sperre(an) { ['inhalt', 'appnav'].forEach(function (id) { var e = $(id); if (e) { e.inert = an; if (an) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); }
  function oeffnen() {
    var f = $('suFenster'); if (!f || offen()) return;
    vorFokus = document.activeElement;
    f.hidden = false; sperre(true);
    zeigen();
    try { $('suFeld').focus({ preventScroll: true }); } catch (e) { $('suFeld').focus(); }
  }
  function schliessen(fokusZurueck) {
    var f = $('suFenster'); if (!offen()) return false;
    f.hidden = true; sperre(false);
    if (fokusZurueck !== false && vorFokus && document.body.contains(vorFokus) && vorFokus.focus) { try { vorFokus.focus({ preventScroll: true }); } catch (e) { vorFokus.focus(); } }
    vorFokus = null;
    return true;
  }
  function leeren() { var f = $('suFeld'); f.value = ''; zeigen(); f.focus(); }
  function init(o) {
    app = o;
    var feld = $('suFeld'); if (!feld) return;
    feld.addEventListener('input', zeigen);
    $('suSuche').addEventListener('keydown', tasten);
    $('suSuche').addEventListener('submit', function (ev) { ev.preventDefault(); });
    $('suLeeren').addEventListener('click', leeren);
    document.querySelectorAll('.su-lupe-knopf').forEach(function (b) { b.addEventListener('click', oeffnen); });
    var fe = $('suFenster'); if (fe) fe.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { ev.preventDefault(); schliessen(true); } });
    var zu = $('suZu'); if (zu) zu.addEventListener('click', function () { schliessen(true); });
  }
  // Nach Sprachwechsel: Platzhalter und Treffer in der neuen Sprache
  function sprache() {
    if (!$('suFeld') || !app) return; // Platzhalter und Beschriftung setzt applyLang (data-t-ph, data-t-aria)
    idx = null; var v = $('suVorschlag'); if (v) v.textContent = ''; zeigen(); // Vorschläge mit neuer Überschrift
  }
  // Zurück von einem Treffer (Startseite): Such-Fenster wieder offen, Text und Treffer wie vorher; Schließen setzt den Fokus auf die Lupe
  function fokus() { var l = $('suLupeStart'); if (l) l.focus({ preventScroll: true }); oeffnen(); }

  return { ZIELE: ZIELE, BEREICHE: BEREICHE, LEISTUNGEN: LEISTUNGEN, WOERTER: WOERTER, norm: norm, dist: dist, toleranz: toleranz, wortGuete: wortGuete, index: index, suche: suche,
    init: init, zeigen: zeigen, sprache: sprache, fokus: fokus, offen: offen, oeffnen: oeffnen, schliessen: schliessen };
})();
if (typeof module !== 'undefined') module.exports = Suche;
