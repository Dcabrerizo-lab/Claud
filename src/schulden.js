// Schulden-Liste (Geld und Schulden → Meine Schulden-Liste). Eigenes Modul: reine Rechnung (Node-Tests) und Oberfläche.
// Alles bleibt auf dem Gerät, je Vorgang (lotse.schulden in Vorgaenge.DATEN; verschlüsselt nur mit PIN). Beträge in Cent.
// Ausgabe nur per textContent (el()), nie als HTML: auch ein manipulierter Speicherstand kann kein HTML einschleusen.
// Grundlage: docs/entwuerfe/schuldenliste.md (Prüfvermerk und Entscheidung Koordination vom 20.11.2026).
var Schulden = (function () {
  'use strict';

  // ---------- Art der Forderung und Stufe ----------
  // Stufe 1 „Zuerst“, 2 „Auch wichtig“, 3 „Kann meist warten“. Reihenfolge nach BAG-SB (meine-schulden.de, „Vorbereitung Erstgespräch“,
  // Aktualisierung 09.07.2026: Lebensmittel, Miete, Strom zuerst; Geldstrafen; Banken, Inkasso, Versand zum Schluss) und Verbraucherzentrale
  // („Finanzieller Engpass“, Stand 27.01.2026: Unterhalt). Krankenversicherung in Stufe 1 wie der Text sp.schulden.2 (Entscheidung 20.11.2026;
  // Ruhen des Anspruchs § 16 Abs. 3a SGB V). Bußgeld Stufe 2 (Erzwingungshaft § 96 OWiG), Rückforderung vom Amt Stufe 2 (§ 43 SGB II).
  var ART = [['miete', 1], ['energie', 1], ['unterhalt', 1], ['geldstrafe', 1], ['kranken', 1], ['bussgeld', 2], ['behoerde', 2],
    ['bank', 3], ['inkasso', 3], ['handy', 3], ['versand', 3], ['sonst', 3]];
  var ART_IDS = ART.map(function (a) { return a[0]; });
  var STATUS = ['offen', 'mahnung', 'inkasso', 'drohung', 'mahnbescheid', 'vollstreckungsbescheid', 'pfaendung', 'ratenzahlung', 'widersprochen', 'erledigt'];
  // Mahnbescheid: Aufforderung, binnen 2 Wochen zu zahlen oder zu widersprechen (§ 692 Abs. 1 Nr. 3 ZPO); Widerspruch aber möglich,
  // solange kein Vollstreckungsbescheid verfügt ist (§ 694 Abs. 1 ZPO). Vollstreckungsbescheid: Einspruch 2 Wochen, Notfrist (§§ 700, 339 ZPO).
  var FRIST_TAGE = { mahnbescheid: 14, vollstreckungsbescheid: 14 };
  var DRINGEND = ['drohung', 'pfaendung'];
  // Wort-Pille mit Zustandsfarbe (Klassen des Ergebnisblatts): Gefahr, Warnung, läuft, neutral
  var PILLE = { mahnbescheid: 'nein', vollstreckungsbescheid: 'nein', pfaendung: 'nein', drohung: 'nein', mahnung: 'vielleicht', inkasso: 'vielleicht', ratenzahlung: 'ja' };
  var MAX_EINTRAEGE = 200;
  var MAX_CENT = 100000000; // unter 1 Mio. €

  function artStufe(art) { var a = ART.filter(function (x) { return x[0] === art; })[0]; return a ? a[1] : 3; }
  function stufe(e) {
    if (e.st === 'erledigt') return 'erledigt';
    if (FRIST_TAGE[e.st]) return 'frist';
    if (DRINGEND.indexOf(e.st) >= 0) return 'dringend';
    return artStufe(e.art);
  }
  function betrag(e) { return e.stand !== null && e.stand !== undefined ? e.stand : e.anfang !== null && e.anfang !== undefined ? e.anfang : null; }

  // ---------- Datum ----------
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  function isoTag(d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); }
  function ausIso(s) {
    if (!/^\d{4}-\d\d-\d\d$/.test(String(s || ''))) return null;
    var j = +s.slice(0, 4), m = +s.slice(5, 7), t = +s.slice(8, 10), d = new Date(j, m - 1, t);
    return d.getFullYear() === j && d.getMonth() === m - 1 && d.getDate() === t ? d : null;
  }
  function gueltigIso(s) { return ausIso(s) !== null; }

  // ---------- Fristende (austauschbar) ----------
  // Eigene kleine Rechnung: Zustellung + Tage; fällt das Ende auf Samstag, Sonntag oder einen bundesweiten Feiertag, endet die Frist am
  // nächsten Werktag (§ 222 Abs. 2 ZPO). Landesfeiertage kennt die App nicht: Sie nennt deshalb eher einen zu frühen Tag (Text sl.frist.ungefaehr).
  // Später soll der Rechenkern aus b-fristen rechnen: Schulden.fristRechner(function (zuIso, tage) { return 'JJJJ-MM-TT'; }).
  function ostersonntag(j) { // Gaußsche Osterformel (gregorianisch, Algorithmus nach Meeus/Jones/Butcher)
    var a = j % 19, b = Math.floor(j / 100), c = j % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var monat = Math.floor((h + l - 7 * m + 114) / 31), tag = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(j, monat - 1, tag);
  }
  // Die 9 bundesweiten gesetzlichen Feiertage: Neujahr, Karfreitag, Ostermontag, 1. Mai, Christi Himmelfahrt, Pfingstmontag,
  // Tag der Deutschen Einheit (3. Oktober), 1. und 2. Weihnachtstag
  function feiertageBund(j) {
    var o = ostersonntag(j), plus = function (n) { return isoTag(new Date(o.getFullYear(), o.getMonth(), o.getDate() + n)); };
    return [j + '-01-01', plus(-2), plus(1), j + '-05-01', plus(39), plus(50), j + '-10-03', j + '-12-25', j + '-12-26'];
  }
  function werktag(d) { var w = d.getDay(); return w !== 0 && w !== 6 && feiertageBund(d.getFullYear()).indexOf(isoTag(d)) < 0; }
  function fristEndeEinfach(zuIso, tage) {
    var z = ausIso(zuIso); if (!z) return null;
    var d = new Date(z.getFullYear(), z.getMonth(), z.getDate() + tage);
    for (var n = 0; n < 10 && !werktag(d); n++) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return isoTag(d);
  }
  var fristRechnerFn = null;
  function fristRechner(fn) { fristRechnerFn = typeof fn === 'function' ? fn : null; }
  function fristEnde(zuIso, tage) {
    if (!gueltigIso(zuIso) || !(tage > 0)) return null;
    if (fristRechnerFn) { try { var r = fristRechnerFn(zuIso, tage); if (gueltigIso(r)) return r; } catch (e) { /* Rückfall auf die eigene Rechnung */ } }
    return fristEndeEinfach(zuIso, tage);
  }
  // { art, zu, bis, vorbei, ohneDatum } für Einträge mit Frist (Mahnbescheid, Vollstreckungsbescheid), sonst null
  function fristInfo(e, heute) {
    if (!e || !FRIST_TAGE[e.st]) return null;
    if (!gueltigIso(e.zu)) return { art: e.st, zu: '', bis: null, vorbei: false, ohneDatum: true };
    var bis = fristEnde(e.zu, FRIST_TAGE[e.st]);
    return { art: e.st, zu: e.zu, bis: bis, vorbei: !!bis && bis < isoTag(heute || new Date()), ohneDatum: false };
  }
  function fristVorbei(e, heute) { var f = fristInfo(e, heute); return !!(f && f.vorbei); }

  // ---------- Summen mit Kontrolle ----------
  // Kontrolle: Die Teilmengen (je Stufe der Art und je Art) ergeben lückenlos und ohne Überschneidung die Gesamtsumme; erledigte zählen nirgends.
  // stufeVon: nur für den Mutationstest austauschbar (Standard: Stufe der Art)
  function summen(liste, stufeVon) {
    var sv = stufeVon || artStufe;
    var s = { gesamt: 0, raten: 0, n: 0, ohneBetrag: 0, proStufe: { 1: 0, 2: 0, 3: 0 }, proArt: {}, ok: true };
    ART_IDS.forEach(function (a) { s.proArt[a] = 0; });
    (liste || []).forEach(function (e) {
      if (e.st === 'erledigt') return;
      s.n++;
      if (e.rate > 0) s.raten += e.rate;
      var b = betrag(e);
      if (b === null) { s.ohneBetrag++; return; }
      s.gesamt += b;
      var st = sv(e.art);
      if (st === 1 || st === 2 || st === 3) s.proStufe[st] += b;
      if (Object.prototype.hasOwnProperty.call(s.proArt, e.art)) s.proArt[e.art] += b;
    });
    var sumArt = ART_IDS.reduce(function (a, k) { return a + s.proArt[k]; }, 0);
    s.ok = s.proStufe[1] + s.proStufe[2] + s.proStufe[3] === s.gesamt && sumArt === s.gesamt;
    return s;
  }

  // ---------- Reihenfolge ----------
  // Frist läuft (früheste zuerst, ohne Datum ganz oben) → dringend → Stufe 1 → 2 → 3 → erledigt; innerhalb: Fälligkeit, leere zuletzt, dann Name
  var RANG = { frist: 0, dringend: 1, 1: 2, 2: 3, 3: 4, erledigt: 5 };
  function sortiert(liste, heute) {
    return (liste || []).map(function (e, i) {
      var f = fristInfo(e, heute);
      return { e: e, i: i, r: RANG[stufe(e)], f: f ? (f.bis || '0000-00-00') : '', d: gueltigIso(e.faellig) ? e.faellig : '9999-99-99' };
    }).sort(function (a, b) {
      return a.r - b.r || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0) || (a.d < b.d ? -1 : a.d > b.d ? 1 : 0) ||
        String(a.e.g).localeCompare(String(b.e.g), 'de') || a.i - b.i;
    }).map(function (x) { return x.e; });
  }

  // ---------- Vergleich mit dem Haushaltsplan (keine Doppelzählung) ----------
  // Haushalt.rest().rest ist der Rest nach allen festen Ausgaben, auch nach der Kategorie „Raten“. Frei vor Raten = rest + Plan-Raten;
  // davon gehen die Raten aus der Liste ab. Die Liste schreibt nicht in den Haushaltsplan.
  function vergleich(ratenListe, hh) {
    if (!hh || !hh.rest || hh.rest.leer) return null;
    var planRaten = hh.raten > 0 ? hh.raten : 0, frei = hh.rest.rest + planRaten, nach = frei - (ratenListe || 0);
    return { frei: frei, nachRaten: nach, zuviel: nach < 0, abweichung: planRaten !== (ratenListe || 0), planRaten: planRaten };
  }

  // ---------- Fristen für andere Bereiche (b-fristen, „Mein Ordner“) ----------
  // Art-Kennungen wie in fristen.md (mb, vb), damit derselbe Bescheid aus „Brief prüfen“ erkannt wird. Kein Gläubigername.
  function fristen(liste, heute) {
    var out = [];
    (liste || []).forEach(function (e) {
      if (e.st === 'erledigt' || !FRIST_TAGE[e.st] || !gueltigIso(e.zu)) return;
      out.push({ id: e.id, art: e.st === 'mahnbescheid' ? 'mb' : 'vb', basis: { zugang: e.zu }, bis: fristEnde(e.zu, FRIST_TAGE[e.st]), vorbei: fristVorbei(e, heute) });
    });
    return out;
  }

  // ---------- CSV (wie das Haushaltsbuch: Semikolon, CRLF, BOM vom Aufrufer) ----------
  // Schutz vor Formeln in Tabellenprogrammen: beginnt ein Feld (auch nach Leerzeichen) mit = + - @ oder Tab/CR, kommt ' davor.
  function csvFeld(s) { s = String(s == null ? '' : s); if (/^\s*[=+\-@]|^[\t\r]/.test(s)) s = "'" + s; return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function centText(c) { return c === null || c === undefined ? '' : (c / 100).toFixed(2).replace('.', ','); }
  // kopf: 12 Spaltennamen (+ Notiz), namen: { art: fn, st: fn }
  function csv(liste, kopf, namen, mitNotiz) {
    var k = mitNotiz ? kopf.slice(0, 13) : kopf.slice(0, 12);
    var zeilen = [k.map(csvFeld).join(';')];
    (liste || []).forEach(function (e, i) {
      var z = [String(i + 1), e.g, e.adr || '', namen.art(e.art), e.az || '', centText(e.anfang), centText(e.stand), e.standD || '', centText(e.rate), e.faellig || '', namen.st(e.st), e.zu || ''];
      if (mitNotiz) z.push(e.n || '');
      zeilen.push(z.map(csvFeld).join(';'));
    });
    return zeilen.join('\r\n') + '\r\n';
  }

  // ---------- Speicherstand prüfen ----------
  function leer() { return { v: 1, liste: [] }; }
  function geld(v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v < MAX_CENT && Math.floor(v) === v ? v : null; }
  function text(s, max, zeilen) {
    s = String(s == null ? '' : s);
    if (zeilen) {
      s = s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').split('\n').map(function (z) { return z.replace(/\s+/g, ' ').trim(); });
      while (s.length && !s[s.length - 1]) s.pop();
      s = s.slice(0, zeilen).join('\n');
    } else s = s.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
    return s.slice(0, max);
  }
  function neueId() { var s = ''; for (var i = 0; i < 6; i++) s += Math.floor(Math.random() * 16).toString(16); return s; }
  function eintrag(x) {
    if (!x || typeof x !== 'object') return null;
    var g = text(x.g, 60);
    if (!g) return null;
    var st = STATUS.indexOf(x.st) >= 0 ? x.st : 'offen';
    return {
      id: /^[0-9a-f]{6}$/.test(String(x.id)) ? x.id : neueId(), g: g, art: ART_IDS.indexOf(x.art) >= 0 ? x.art : 'sonst',
      anfang: geld(x.anfang), stand: geld(x.stand), standD: gueltigIso(x.standD) ? x.standD : '', rate: geld(x.rate),
      faellig: gueltigIso(x.faellig) ? x.faellig : '', st: st, zu: FRIST_TAGE[st] && gueltigIso(x.zu) ? x.zu : '',
      az: text(x.az, 40), adr: text(x.adr, 160, 4), n: text(x.n, 500, 20)
    };
  }
  function normiere(d) {
    var x = leer();
    if (!d || typeof d !== 'object' || !Array.isArray(d.liste)) return x;
    var ids = {};
    d.liste.slice(0, MAX_EINTRAEGE).forEach(function (e) {
      var n = eintrag(e); if (!n) return;
      while (ids[n.id]) n.id = neueId();
      ids[n.id] = true; x.liste.push(n);
    });
    return x;
  }
  function zuCent(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    var F = typeof Fmt !== 'undefined' ? Fmt : require('./fmt.js');
    var n = F.parse(v);
    return n === '' ? undefined : Math.round(n * 100); // undefined: keine gültige Zahl
  }

  // =====================================================================
  // Oberfläche
  // =====================================================================
  var ctx = null, daten = null, eingabe = null, frage = null, blattZurueck = null;
  var $ = function (id) { return document.getElementById(id); };
  function t(k, p) { return ctx.t(k, p); }
  function de(k, p) { return ctx.tDe ? ctx.tDe(k, p) : ctx.t(k, p); } // Druckblatt: Deutsch für die Beratungsstelle
  function eur(cent) { return ctx.euro((cent || 0) / 100); }
  function eurDe(cent) { return ctx.euroDe ? ctx.euroDe((cent || 0) / 100) : eur(cent); }
  function datum(iso, deutsch) { var d = ausIso(iso); return d ? (deutsch && ctx.datumDe ? ctx.datumDe(d) : ctx.datum(d)) : ''; }
  function artName(a, f) { return (f || t)('sl.art.' + a); }
  function stName(s, f) { return (f || t)('sl.st.' + s); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; } // nur Text, nie HTML
  function knopf(cls, txt, fn, attr) { var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', fn); if (attr) Object.keys(attr).forEach(function (k) { b.setAttribute(k, attr[k]); }); return b; }
  function aufklapp(titel, cls) { var d = el('details', cls || 'pf-tipps'); d.appendChild(el('summary', '', titel)); return d; }
  function beratung() { try { if (window.SoloBeratung && typeof window.SoloBeratung.an === 'function') return !!window.SoloBeratung.an(); } catch (e) { /* ohne Schalter: aus */ } return false; }
  function offen() { return daten.liste.filter(function (e) { return e.st !== 'erledigt'; }); }
  function haushalt() { try { return ctx.haushalt ? ctx.haushalt() : null; } catch (e) { return null; } }

  // ----- Speicherung (Vorgänge über Schulden.speicherOrt) -----
  var SCHLUESSEL = 'lotse.schulden';
  var speicher = {
    laden: function (cb) { try { cb(localStorage.getItem(SCHLUESSEL)); } catch (e) { cb(null); } },
    schreiben: function (txt, cb) { try { localStorage.setItem(SCHLUESSEL, txt); cb(null); } catch (e) { cb(e); } }
  };
  function speicherOrt(s) { if (s && s.laden) speicher.laden = s.laden; if (s && s.schreiben) speicher.schreiben = s.schreiben; }
  function sichern() {
    var m = $('slSpeicherMsg');
    speicher.schreiben(JSON.stringify(daten), function (err) { if (m) m.textContent = err ? t('sl.speicherFehler') : ''; });
  }
  function laden(fertig) {
    speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } if (fertig) fertig(); });
  }

  // ----- Liste -----
  function render(fokusId) {
    var box = $('slInhalt'); if (!ctx || !box || !daten) return;
    box.textContent = '';
    if (eingabe) { renderEingabe(box); fokus(fokusId || 'sl-f-g'); return; }
    var heute = new Date(), s = summen(daten.liste), liste = sortiert(daten.liste, heute);
    if (!daten.liste.length) box.appendChild(el('p', 'sl-lead', t('sl.lead')));
    if (s.n) box.appendChild(summenKarte(s));
    var nb = el('div', 'btns');
    nb.appendChild(knopf('btn', t('sl.neu'), function () { neueEingabe(null); render('sl-f-g'); }, { id: 'sl-neu' }));
    box.appendChild(nb);
    if (!daten.liste.length) box.appendChild(el('p', 'muted', t('sl.leer')));
    // Gruppen nach Dringlichkeit
    var gruppen = [['frist', 'sl.stufe.frist'], ['dringend', 'sl.stufe.dringend'], [1, 'sl.stufe.1'], [2, 'sl.stufe.2'], [3, 'sl.stufe.3']];
    gruppen.forEach(function (g) {
      var teil = liste.filter(function (e) { return stufe(e) === g[0]; });
      if (!teil.length) return;
      var h = el('h3', 'sl-stufe', t(g[1])); h.id = 'sl-g-' + g[0]; box.appendChild(h);
      var ul = el('ul', 'sl-liste'); ul.setAttribute('aria-labelledby', h.id);
      teil.forEach(function (e) { ul.appendChild(zeile(e, heute)); });
      box.appendChild(ul);
    });
    var erl = liste.filter(function (e) { return e.st === 'erledigt'; });
    if (erl.length) {
      var de2 = aufklapp(t('sl.erledigt', { n: String(erl.length) }), 'pf-tipps sl-erledigt'), ul2 = el('ul', 'sl-liste');
      erl.forEach(function (e) { ul2.appendChild(zeile(e, heute)); });
      de2.appendChild(ul2); box.appendChild(de2);
    }
    // Erklärungen zum Aufklappen
    var pr = aufklapp(t('sl.prio.h')); pr.appendChild(el('p', 'hint', t('sl.prio.lead'))); box.appendChild(pr);
    var hi = aufklapp(t('sl.hilfe.h')); hi.id = 'slHilfe';
    ['sl.hilfe.1', 'sl.hilfe.2', 'sl.hilfe.3', 'sl.hilfe.4', 'sl.hilfe.5'].forEach(function (k) { hi.appendChild(el('p', 'hint', t(k))); });
    box.appendChild(hi);
    var un = aufklapp(t('sl.u.h')), ulu = el('ul', 'sp-liste');
    for (var i = 1; i <= 8; i++) ulu.appendChild(el('li', '', t('sl.u.' + i)));
    un.appendChild(ulu); box.appendChild(un);
    // Ausgaben und Sprünge
    var ex = el('div', 'btns sl-export');
    if (s.n) ex.appendChild(knopf('btn ghost', t('sl.druck'), blattOeffnen, { id: 'sl-druck' }));
    if (daten.liste.length) ex.appendChild(knopf('btn ghost', t('sl.csv'), csvFragen, { id: 'sl-csv' }));
    ex.appendChild(knopf('btn ghost', t('sl.hh.knopf'), function () { ctx.zeige('haushalt', true); }, { id: 'sl-hh' }));
    ex.appendChild(knopf('btn ghost', t('sp.schulden.pf'), function () { ctx.zeige('pfaendung', true); }, { id: 'sl-pf' }));
    box.appendChild(ex);
    var fb = el('div', 'sl-frage-platz'); fb.id = 'slFrage'; box.appendChild(fb);
    if (frage && frage.art === 'csv') csvFrageZeigen(fb);
    var m = el('p', 'small'); m.id = 'slExportMsg'; m.setAttribute('aria-live', 'polite'); box.appendChild(m);
    box.appendChild(el('p', 'small muted', t('sl.privat')));
    box.appendChild(el('p', 'small muted', t('sp.schulden.quellen')));
    fokus(fokusId);
  }
  function fokus(id) { var e = id && $(id); if (e) { try { e.focus(); } catch (x) { /* nicht fokussierbar */ } } }
  function summenKarte(s) {
    var k = el('div', 'sl-summe'); k.id = 'slSumme';
    k.appendChild(el('p', 'sl-gesamt', t('sl.sum.gesamt', { b: { eur: Math.round(s.gesamt / 100) } })));
    k.appendChild(el('p', '', t('sl.sum.n', { n: String(s.n) })));
    k.appendChild(el('p', '', t('sl.sum.raten', { b: { eur: s.raten / 100 } })));
    if (s.ohneBetrag) k.appendChild(el('p', 'warn', t('sl.sum.ohneBetrag', { n: String(s.ohneBetrag) })));
    var sumStufen = s.proStufe[1] + s.proStufe[2] + s.proStufe[3];
    if (beratung()) k.appendChild(el('p', 'small', t('sl.sum.check', { b1: { eur: sumStufen / 100 }, b2: { eur: s.gesamt / 100 } })));
    if (!s.ok) k.appendChild(el('p', 'sl-fehler', t('sl.sum.fehler')));
    var hh = el('div', 'sl-hh'); hh.id = 'slHh'; hh.setAttribute('aria-live', 'polite');
    var v = vergleich(s.raten, haushalt());
    if (!v) hh.appendChild(el('p', 'small', t('sl.hh.keiner')));
    else {
      hh.appendChild(el('p', '', t('sl.hh.frei', { b: { eur: Math.round(v.frei / 100) } })));
      if (s.raten > 0) hh.appendChild(el('p', v.zuviel ? 'warn' : '', v.zuviel ? t('sl.hh.zuviel', { b: { eur: Math.round(-v.nachRaten / 100) } }) : t('sl.hh.reicht', { b: { eur: Math.round(v.nachRaten / 100) } })));
      if (v.abweichung) hh.appendChild(el('p', 'small', t('sl.hh.abweichung', { a: { eur: v.planRaten / 100 }, b: { eur: s.raten / 100 } })));
    }
    k.appendChild(hh);
    return k;
  }
  function fristText(e, f, tf, dat) {
    if (f.ohneDatum) return tf('sl.frist.ohneDatum');
    var p = { d: dat(f.zu), frist: dat(f.bis) };
    return tf('sl.frist.' + f.art + (f.vorbei ? '.vorbei' : ''), p);
  }
  function zeile(e, heute) {
    var li = el('li', 'sl-eintrag'); li.id = 'sl-e-' + e.id; li.tabIndex = -1;
    var kopf = el('div', 'sl-kopf');
    kopf.appendChild(el('b', 'sl-name', e.g));
    kopf.appendChild(el('span', 'pill ' + (PILLE[e.st] || 'na'), stName(e.st)));
    li.appendChild(kopf);
    var teile = [artName(e.art)], b = betrag(e);
    if (b !== null) teile.push(t('sl.col.jetzt') + ': ' + eur(b));
    if (e.rate > 0) teile.push(t('sl.col.rate') + ': ' + eur(e.rate));
    if (e.faellig) teile.push(t('sl.col.faellig') + ': ' + datum(e.faellig));
    if (e.az) teile.push(e.az);
    li.appendChild(el('p', 'sl-daten', teile.join(' · ')));
    var f = fristInfo(e, heute), st = stufe(e);
    if (f) {
      li.appendChild(el('p', 'warn sl-frist', fristText(e, f, t, datum)));
      if (!f.ohneDatum) li.appendChild(el('p', 'small muted', t('sl.frist.ungefaehr')));
    } else if (st === 'dringend') li.appendChild(el('p', 'warn', t('sl.dringend')));
    if (st !== 'erledigt') {
      var w = aufklapp(t('sl.warum.s')), as = artStufe(e.art);
      w.appendChild(el('p', 'hint', t(as === 3 ? 'sl.warum.rest' : 'sl.warum.' + e.art)));
      li.appendChild(w);
    }
    var bt = el('div', 'btns sl-knoepfe');
    bt.appendChild(knopf('btn ghost klein', t('sl.bearbeiten'), function () { neueEingabe(e); render('sl-f-g'); }, { 'aria-label': t('sl.bearbeiten') + ': ' + e.g, id: 'sl-b-' + e.id }));
    li.appendChild(bt);
    return li;
  }

  // ----- Eingabe (ersetzt die Liste, wie im Haushaltsbuch) -----
  function centFeld(c) { return c === null || c === undefined ? '' : (c / 100).toFixed(2).replace(/\.00$/, '').replace('.', ','); }
  function neueEingabe(e) {
    frage = null;
    eingabe = e ? { id: e.id, g: e.g, art: e.art, anfang: centFeld(e.anfang), stand: centFeld(e.stand), standD: e.standD, rate: centFeld(e.rate), faellig: e.faellig, st: e.st, zu: e.zu, az: e.az, adr: e.adr, n: e.n, loeschen: false }
      : { id: '', g: '', art: '', anfang: '', stand: '', standD: '', rate: '', faellig: '', st: 'offen', zu: '', az: '', adr: '', n: '', loeschen: false };
  }
  function feld(box, id, label, hint, input) {
    var f = el('div', 'field'), l = el('label', '', label); l.htmlFor = id; f.appendChild(l);
    input.id = id; f.appendChild(input);
    if (hint) { var h = el('span', 'hint', hint); h.id = id + '-h'; f.appendChild(h); input.setAttribute('aria-describedby', h.id); }
    box.appendChild(f); return f;
  }
  function textInput(k, max, typ) {
    var i = el(typ === 'area' ? 'textarea' : 'input');
    if (typ === 'area') i.rows = 3; else { i.type = typ || 'text'; i.autocomplete = 'off'; }
    if (max) i.maxLength = max;
    i.value = eingabe[k] || '';
    i.addEventListener('input', function () { eingabe[k] = i.value; });
    i.addEventListener('change', function () { eingabe[k] = i.value; });
    return i;
  }
  function geldInput(k) {
    var w = el('div', 'money'), i = textInput(k, 14); i.inputMode = 'decimal';
    w.appendChild(i); var s = el('span', '', '€'); s.setAttribute('aria-hidden', 'true'); w.appendChild(s);
    return { wrap: w, input: i };
  }
  function auswahl(k, ids, prefix, leerText) {
    var s = el('select');
    if (leerText) { var o0 = el('option', '', leerText); o0.value = ''; s.appendChild(o0); }
    ids.forEach(function (id) { var o = el('option', '', t(prefix + id)); o.value = id; s.appendChild(o); });
    s.value = eingabe[k] || '';
    s.addEventListener('change', function () { eingabe[k] = s.value; });
    return s;
  }
  function renderEingabe(box) {
    var f = el('div', 'hb-karte sl-eingabe'); f.id = 'slEingabe';
    var h = el('h3', '', t(eingabe.id ? 'sl.bearbeiten' : 'sl.neu')); f.appendChild(h);
    feld(f, 'sl-f-g', t('sl.f.glaeubiger'), t('sl.f.glaeubiger.h'), textInput('g', 60));
    feld(f, 'sl-f-art', t('sl.f.art'), '', auswahl('art', ART_IDS, 'sl.art.', '–'));
    var ga = geldInput('anfang'), gs = geldInput('stand'), gr = geldInput('rate');
    geldFeldIn(f, 'sl-f-anfang', t('sl.f.anfang'), '', ga);
    geldFeldIn(f, 'sl-f-stand', t('sl.f.stand'), t('sl.f.stand.h'), gs);
    feld(f, 'sl-f-standD', t('sl.f.standDatum'), '', textInput('standD', 0, 'date'));
    geldFeldIn(f, 'sl-f-rate', t('sl.f.rate'), '', gr);
    feld(f, 'sl-f-faellig', t('sl.f.faellig'), '', textInput('faellig', 0, 'date'));
    var stSel = auswahl('st', STATUS, 'sl.st.');
    feld(f, 'sl-f-st', t('sl.f.status'), '', stSel);
    var zuBox = el('div', 'sl-zu'); f.appendChild(zuBox);
    var zuZeigen = function () {
      zuBox.textContent = '';
      if (!FRIST_TAGE[eingabe.st]) return;
      feld(zuBox, 'sl-f-zu', t('sl.f.zugestellt'), eingabe.zu ? '' : t('sl.frist.ohneDatum'), textInput('zu', 0, 'date'));
    };
    stSel.addEventListener('change', zuZeigen); zuZeigen();
    feld(f, 'sl-f-az', t('sl.f.az'), '', textInput('az', 40));
    var mehr = aufklapp(t('sl.f.mehr'), 'pf-tipps sl-mehr'); if (eingabe.adr || eingabe.n) mehr.open = true;
    feld(mehr, 'sl-f-adr', t('sl.f.anschrift'), t('sl.f.anschrift.h'), textInput('adr', 160, 'area'));
    feld(mehr, 'sl-f-n', t('sl.f.notiz'), '', textInput('n', 500, 'area'));
    f.appendChild(mehr);
    var msg = el('p', 'warn'); msg.id = 'slEingabeMsg'; msg.setAttribute('role', 'alert'); msg.hidden = true; f.appendChild(msg);
    var bt = el('div', 'btns');
    bt.appendChild(knopf('btn', t('sl.speichern'), speichern, { id: 'sl-speichern' }));
    bt.appendChild(knopf('btn ghost', t('sl.abbrechen'), function () { var id = eingabe.id; eingabe = null; render(id ? 'sl-e-' + id : 'sl-neu'); }, { id: 'sl-abbrechen' }));
    if (eingabe.id) bt.appendChild(knopf('btn ghost', t('sl.loeschen'), function () { eingabe.loeschen = true; render('sl-loeschen-ja'); }, { id: 'sl-loeschen' }));
    f.appendChild(bt);
    if (eingabe.loeschen) {
      var q = el('div', 'hb-frage'); q.setAttribute('role', 'group');
      q.appendChild(el('p', '', t('sl.loeschen.frage', { name: eingabe.g })));
      var qb = el('div', 'btns');
      qb.appendChild(knopf('btn', t('sl.loeschen'), function () {
        var id = eingabe.id; daten.liste = daten.liste.filter(function (x) { return x.id !== id; }); eingabe = null; sichern(); render('sl-neu');
      }, { id: 'sl-loeschen-ja' }));
      qb.appendChild(knopf('btn ghost', t('sl.abbrechen'), function () { eingabe.loeschen = false; render('sl-loeschen'); }));
      q.appendChild(qb); f.appendChild(q);
    }
    box.appendChild(f);
  }
  function geldFeldIn(box, id, label, hint, g) {
    var f = el('div', 'field'), l = el('label', '', label); l.htmlFor = id; f.appendChild(l);
    g.input.id = id; f.appendChild(g.wrap);
    if (hint) { var h = el('span', 'hint', hint); h.id = id + '-h'; f.appendChild(h); g.input.setAttribute('aria-describedby', h.id); }
    box.appendChild(f);
  }
  function speichern() {
    var msg = $('slEingabeMsg'), fehler = function (k, id) { msg.hidden = false; msg.textContent = t(k); fokus(id); };
    if (!text(eingabe.g, 60)) { fehler('sl.fehlt.glaeubiger', 'sl-f-g'); return; }
    var c = {};
    var felder = [['anfang', 'sl-f-anfang'], ['stand', 'sl-f-stand'], ['rate', 'sl-f-rate']];
    for (var i = 0; i < felder.length; i++) {
      var v = zuCent(eingabe[felder[i][0]]);
      if (v === undefined || (v !== null && v >= MAX_CENT)) { fehler('sl.fehlt.betrag', felder[i][1]); return; }
      c[felder[i][0]] = v;
    }
    if (!daten.liste.some(function (x) { return x.id === eingabe.id; }) && daten.liste.length >= MAX_EINTRAEGE) { fehler('sl.voll', 'sl-f-g'); return; }
    var e = eintrag({ id: eingabe.id || neueId(), g: eingabe.g, art: eingabe.art || 'sonst', anfang: c.anfang, stand: c.stand, standD: eingabe.standD, rate: c.rate,
      faellig: eingabe.faellig, st: eingabe.st, zu: eingabe.zu, az: eingabe.az, adr: eingabe.adr, n: eingabe.n });
    var ids = daten.liste.map(function (x) { return x.id; });
    if (!eingabe.id) while (ids.indexOf(e.id) >= 0) e.id = neueId();
    var pos = ids.indexOf(e.id);
    if (pos >= 0) daten.liste[pos] = e; else daten.liste.push(e);
    eingabe = null; sichern(); render('sl-e-' + e.id);
  }

  // ----- CSV-Export (gleicher Weg wie das Haushaltsbuch; vorher Hinweis) -----
  function csvFragen() { frage = { art: 'csv', notiz: false }; render(); fokus('sl-csv-ja'); }
  function csvFrageZeigen(platz) {
    var q = el('div', 'hb-frage'); q.setAttribute('role', 'group');
    q.appendChild(el('p', '', t('sl.csv.warn')));
    var nl = el('label', 'check'), nc = el('input'); nc.type = 'checkbox'; nc.id = 'sl-csv-notiz'; nc.checked = !!frage.notiz;
    nc.addEventListener('change', function () { frage.notiz = nc.checked; });
    nl.appendChild(nc); nl.appendChild(el('span', '', t('sl.csv.notiz'))); q.appendChild(nl);
    var qb = el('div', 'btns');
    qb.appendChild(knopf('btn', t('sl.csv.ja'), function () { var mit = !!frage.notiz; frage = null; render(); exportCsv(mit); fokus('sl-csv'); }, { id: 'sl-csv-ja' }));
    qb.appendChild(knopf('btn ghost', t('sl.abbrechen'), function () { frage = null; render('sl-csv'); }));
    q.appendChild(qb); platz.appendChild(q);
  }
  function csvText(mitNotiz) {
    var kopf = ['nr', 'glaeubiger', 'anschrift', 'art', 'az', 'anfang', 'jetzt', 'standD', 'rate', 'faellig', 'stand', 'zu', 'notiz'].map(function (k) { return t('sl.col.' + k); });
    return '﻿' + csv(sortiert(daten.liste, new Date()), kopf, { art: function (a) { return artName(a); }, st: function (s) { return stName(s); } }, !!mitNotiz);
  }
  function exportCsv(mitNotiz) {
    var msg = $('slExportMsg'), txt = csvText(mitNotiz), name = 'Schulden-' + isoTag(new Date()) + '.csv';
    var fsys = ctx.plug && ctx.plug('Filesystem'), sh = ctx.plug && ctx.plug('Share');
    if (ctx.nativ) {
      if (!fsys || !sh) { msg.textContent = t('sl.csv.fehler'); return; }
      fsys.writeFile({ path: name, data: txt, directory: 'CACHE', encoding: 'utf8' })
        .then(function (r) { return sh.share({ title: name, files: [r.uri] }).then(function () {}, function () {}); })
        .then(function () { msg.textContent = ''; return fsys.deleteFile({ path: name, directory: 'CACHE' }).catch(function () {}); })
        .catch(function () { msg.textContent = t('sl.csv.fehler'); });
      return;
    }
    try {
      var url = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
      var a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      msg.textContent = t('sl.csv.ok', { name: name });
    } catch (e) { msg.textContent = t('sl.csv.fehler'); }
  }

  // ----- Blatt für die Schuldnerberatung (Deutsch, ohne Namen; wie das Ergebnisblatt) -----
  function blattSection() {
    var s = $('slBlatt'); if (s) return s;
    s = el('section'); s.id = 'slBlatt'; s.hidden = true; s.setAttribute('aria-labelledby', 'h-slb');
    var bar = el('div', 'mappe-bar no-print'); bar.id = 'slBlattBar';
    var art = el('article', 'page ergblatt sl-blatt'); art.id = 'slSeite'; art.lang = 'de'; art.dir = 'ltr';
    s.appendChild(bar); s.appendChild(art);
    var eb = $('ergBlatt');
    if (eb && eb.parentNode) eb.parentNode.insertBefore(s, eb.nextSibling); else ($('app') || document.body).appendChild(s);
    return s;
  }
  function blattStandard() { return { kuerzel: '', az: true, adr: true, notiz: false, hh: true }; }
  var blattOpt = blattStandard();
  function blattBar() {
    var bar = $('slBlattBar'); bar.textContent = '';
    var h = el('h2', '', t('sl.druck')); h.id = 'h-slb'; h.tabIndex = -1; bar.appendChild(h);
    bar.appendChild(el('p', '', t('sl.druck.intro')));
    if (ctx.lang && ctx.lang() !== 'de') bar.appendChild(el('p', 'pp-hinweis small', t('sl.druck.nurDeutsch')));
    var kf = el('div', 'field eb-kuerzel'), kl = el('label', '', t('sl.druck.kuerzel')); kl.htmlFor = 'slKuerzel'; kf.appendChild(kl);
    var ki = el('input'); ki.type = 'text'; ki.id = 'slKuerzel'; ki.maxLength = 8; ki.autocomplete = 'off'; ki.spellcheck = false; ki.value = blattOpt.kuerzel;
    ki.addEventListener('input', function () { blattOpt.kuerzel = ki.value; blattSeite(); }); kf.appendChild(ki); bar.appendChild(kf);
    [['az', 'slMitAz', 'sl.druck.az'], ['adr', 'slMitAdr', 'sl.druck.anschrift'], ['notiz', 'slMitNotiz', 'sl.druck.notizen']].forEach(function (x) {
      var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = x[1]; c.checked = blattOpt[x[0]];
      c.addEventListener('change', function () { blattOpt[x[0]] = c.checked; blattSeite(); });
      l.appendChild(c); l.appendChild(el('span', '', t(x[2]))); bar.appendChild(l);
    });
    if (hhZeile(true)) { // nur, wenn es einen Haushaltsplan gibt
      var hl = el('label', 'check'), hc = el('input'); hc.type = 'checkbox'; hc.id = 'slMitHh'; hc.checked = blattOpt.hh;
      hc.addEventListener('change', function () { blattOpt.hh = hc.checked; blattSeite(); });
      hl.appendChild(hc); hl.appendChild(el('span', '', t('sl.druck.hhMit'))); bar.appendChild(hl);
    }
    var b = el('div', 'btns');
    b.appendChild(knopf('btn', t('f.print'), blattAusgeben, { id: 'slDruck' }));
    b.appendChild(knopf('btn ghost', t('pf.zurueck'), blattSchliessen, { id: 'slBlattZu' }));
    bar.appendChild(b);
    var m = el('p', 'msg'); m.id = 'slMsg'; m.setAttribute('role', 'status'); bar.appendChild(m);
    bar.appendChild(el('p', 'small', t('sl.druck.privat')));
  }
  function blattZeilen() { return sortiert(offen(), new Date()); }
  function kopfZeile() {
    var k = text(blattOpt.kuerzel, 8);
    return de('sl.druck.stand', { d: ctx.datumDe ? ctx.datumDe(new Date()) : ctx.datum(new Date()) }) + (k ? ' · ' + de('eb.kuerzelZeile', { k: k }) : '');
  }
  function hhZeile(immer) {
    if (!immer && !blattOpt.hh) return '';
    var hh = haushalt(), s = summen(daten.liste), v = vergleich(s.raten, hh);
    return v ? de('sl.druck.hh', { e: eurDe(hh.rest.ein), a: eurDe(hh.rest.aus), r: eurDe(hh.rest.rest), f: eurDe(v.frei) }) : '';
  }
  function zellen(e) {
    var b = betrag(e);
    return {
      jetzt: b === null ? '' : eurDe(b) + (e.stand !== null && e.standD ? ' (' + datum(e.standD, true) + ')' : ''),
      stand: stName(e.st, de) + (e.zu ? ' · ' + de('sl.col.zu') + ': ' + datum(e.zu, true) : '')
    };
  }
  function blattSeite() {
    var a = $('slSeite'); if (!a) return;
    a.textContent = '';
    a.appendChild(el('h2', 'eb-titel', de('sl.druck.titel')));
    a.appendChild(el('p', 'eb-kopf', kopfZeile()));
    var spalten = ['nr', 'glaeubiger', 'art'].concat(blattOpt.az ? ['az'] : [], ['anfang', 'jetzt', 'rate', 'faellig', 'stand'], blattOpt.notiz ? ['notiz'] : []);
    var tab = el('table', 'eb-tab'), th = el('thead'), tr = el('tr');
    spalten.forEach(function (k) { var c = el('th', '', de('sl.col.' + k)); c.scope = 'col'; tr.appendChild(c); });
    th.appendChild(tr); tab.appendChild(th);
    var tb = el('tbody');
    blattZeilen().forEach(function (e, i) {
      var r = el('tr'), z = zellen(e);
      spalten.forEach(function (k) {
        var c = el(k === 'glaeubiger' ? 'th' : 'td');
        if (k === 'glaeubiger') {
          c.scope = 'row'; c.appendChild(el('span', '', e.g));
          if (blattOpt.adr && e.adr) e.adr.split('\n').forEach(function (zl) { c.appendChild(el('br')); c.appendChild(el('span', 'small', zl)); });
        } else c.textContent = k === 'nr' ? String(i + 1) : k === 'art' ? artName(e.art, de) : k === 'az' ? e.az : k === 'anfang' ? (e.anfang === null ? '' : eurDe(e.anfang)) :
          k === 'jetzt' ? z.jetzt : k === 'rate' ? (e.rate > 0 ? eurDe(e.rate) : '') : k === 'faellig' ? datum(e.faellig, true) : k === 'stand' ? z.stand : e.n;
        r.appendChild(c);
      });
      tb.appendChild(r);
    });
    tab.appendChild(tb); a.appendChild(tab);
    var s = summen(daten.liste);
    a.appendChild(el('p', 'eb-hinweis', de('sl.druck.summen', { b1: eurDe(s.gesamt), b2: eurDe(s.raten) })));
    if (s.ohneBetrag) a.appendChild(el('p', 'eb-hinweis', de('sl.sum.ohneBetrag', { n: String(s.ohneBetrag) })));
    var hz = hhZeile(); if (hz) a.appendChild(el('p', 'eb-hinweis', hz));
    a.appendChild(el('h3', '', de('sl.u.h')));
    var ul = el('ul', 'sl-unterlagen');
    for (var i = 1; i <= 8; i++) ul.appendChild(el('li', '', '☐ ' + de('sl.u.' + i)));
    a.appendChild(ul);
    a.appendChild(el('p', 'eb-hinweis small', de('sl.druck.hinweis')));
  }
  function pdfSeiten() {
    var b = [{ t: 'h', text: de('sl.druck.titel') }, { t: 'p', text: kopfZeile() }];
    blattZeilen().forEach(function (e, i) {
      var z = zellen(e);
      b.push({ t: 'h', text: (i + 1) + '. ' + e.g });
      if (blattOpt.adr && e.adr) b.push({ t: 'small', text: e.adr.replace(/\n/g, ', ') });
      var li = [['art', artName(e.art, de)], ['az', blattOpt.az ? e.az : ''], ['anfang', e.anfang === null ? '' : eurDe(e.anfang)], ['jetzt', z.jetzt],
        ['rate', e.rate > 0 ? eurDe(e.rate) : ''], ['faellig', datum(e.faellig, true)], ['stand', z.stand], ['notiz', blattOpt.notiz ? e.n : '']];
      li.forEach(function (x) { if (x[1]) b.push({ t: 'li', text: de('sl.col.' + x[0]) + ': ' + x[1] }); });
    });
    var s = summen(daten.liste);
    b.push({ t: 'p', text: de('sl.druck.summen', { b1: eurDe(s.gesamt), b2: eurDe(s.raten) }) });
    if (s.ohneBetrag) b.push({ t: 'p', text: de('sl.sum.ohneBetrag', { n: String(s.ohneBetrag) }) });
    var hz = hhZeile(); if (hz) b.push({ t: 'p', text: hz });
    b.push({ t: 'h', text: de('sl.u.h') });
    for (var i = 1; i <= 8; i++) b.push({ t: 'li', text: de('sl.u.' + i) });
    b.push({ t: 'small', text: de('sl.druck.hinweis') });
    return [{ blocks: b }];
  }
  function blattOeffnen() {
    blattZurueck = document.activeElement;
    var s = blattSection(); blattBar(); blattSeite();
    s.hidden = false;
    var app = $('app'); if (app) app.classList.add('pm');
    try { window.scrollTo(0, 0); } catch (e) { /* JSDOM */ }
    fokus('h-slb');
  }
  function blattSchliessen() {
    var s = $('slBlatt'); if (s) s.hidden = true;
    var app = $('app'); if (app) app.classList.remove('pm');
    if (blattZurueck && blattZurueck.focus && document.body.contains(blattZurueck)) blattZurueck.focus(); else fokus('sl-druck');
  }
  function blattOffen() { var s = $('slBlatt'); return !!(s && !s.hidden); }
  function blattAusgeben() {
    if (!ctx.nativ || !ctx.pdf) { try { window.print(); } catch (e) { /* kein Druckdialog */ } return; }
    ctx.pdf(pdfSeiten(), de('sl.druck.titel'), 'SoLo-Schulden.pdf', $('slMsg'));
  }

  // ----- Rahmen -----
  function init(c) { ctx = c; daten = leer(); laden(function () { render(); }); }
  function zeigen() { eingabe = null; frage = null; render(); }
  function sprache() { render(); if (blattOffen()) { blattBar(); blattSeite(); } }
  function zurueck() {
    if (blattOffen()) { blattSchliessen(); return true; }
    if (eingabe) { var id = eingabe.id; eingabe = null; render(id ? 'sl-e-' + id : 'sl-neu'); return true; }
    return false;
  }
  function neuLaden() {
    eingabe = null; frage = null; if (blattOffen()) blattSchliessen();
    blattOpt = blattStandard(); // Kürzel und Haken gehören nicht in den nächsten Vorgang
    ['slSeite', 'slBlattBar'].forEach(function (id) { var x = $(id); if (x) x.textContent = ''; });
    laden(function () { render(); });
  }
  // Kurzstatus für „Mein Ordner“: nur die Zahl der offenen Einträge (keine Summe, Entscheidung 20.11.2026) und die nächste laufende Frist
  function kurz() {
    if (!daten) return null;
    var o = offen(), fr = fristen(o, new Date()).filter(function (f) { return f.bis && !f.vorbei; }).map(function (f) { return f.bis; }).sort();
    return { n: o.length, frist: fr[0] || '' };
  }

  return {
    // Rechnung (Tests)
    ART: ART_IDS, STATUS: STATUS, FRIST_TAGE: FRIST_TAGE, artStufe: artStufe, stufe: stufe, betrag: betrag, summen: summen, sortiert: sortiert,
    vergleich: vergleich, fristEnde: fristEnde, fristEndeEinfach: fristEndeEinfach, fristRechner: fristRechner, fristInfo: fristInfo, fristVorbei: fristVorbei,
    feiertageBund: feiertageBund, fristen: fristen, csv: csv, pdfSeiten: function () { return pdfSeiten(); }, csvFeld: csvFeld, normiere: normiere, zuCent: zuCent,
    // Oberfläche
    init: init, zeigen: zeigen, sprache: sprache, zurueck: zurueck, neuLaden: neuLaden, speicherOrt: speicherOrt, kurz: kurz,
    daten: function () { return daten ? JSON.parse(JSON.stringify(daten)) : null; }
  };
})();
if (typeof module !== 'undefined') module.exports = Schulden;
