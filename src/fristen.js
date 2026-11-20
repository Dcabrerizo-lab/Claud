// Fristen in „Mein Ordner“: Liste je Vorgang (lotse.fristliste in Vorgaenge.DATEN, mit PIN verschlüsselt, mitkopiert, mitgelöscht).
// Kein eigener Bereich, kein Kalender, keine Mitteilung des Systems. Erinnerung nur als ruhiger Hinweis beim Öffnen, höchstens einmal am Tag.
// Fristen aus „Brief prüfen“ kommen NUR auf Knopfdruck („Frist merken“) in die Liste. Das Ende eines Bewilligungszeitraums
// (Haushaltsplan, lotse.haushalt → bewilligt) wird abgeleitet und nicht doppelt gespeichert.
// Texte: src/lang/fristen/<Sprache>.json (Schlüssel „fri.*“), Einfache Sprache: src/lang/einfach/fristen.json.
//
// Rechnung (Quellen abgerufen am 20.11.2026, Entwurf docs/entwuerfe/fristen.md Abschnitt 4). SoLo nennt immer den frühesten möglichen Tag:
// - Bescheid per Post: bekannt gegeben am 4. Tag nach Aufgabe zur Post (§ 37 Abs. 2 SGB X, seit 1.1.2025), nicht auf einen Werktag verschoben
//   (BSG 6.5.2010, B 14 AS 12/09 R). Widerspruch 1 Monat (§ 84 Abs. 1 SGG), Ende nach § 64 SGG.
// - Anhörung, Mitwirkung (keine Verwaltungsakte): ab dem Tag des Erhalts, sonst ab Briefdatum + 1 („Ungefähr“), §§ 187, 188 BGB, § 26 SGB X.
// - Mahnbescheid, Vollstreckungsbescheid: 2 Wochen ab Zustellung (§ 692 Abs. 1 Nr. 3, § 700, § 339 ZPO), Ende § 222 ZPO.
// - Ende an Samstag, Sonntag oder Feiertag → nächster Werktag. Nur die 9 bundesweiten Feiertage (Entscheidung des Nutzers, 20.11.2026).
// - Daten, die im Brief stehen, werden nie verschoben (§ 26 Abs. 3 Satz 2, Abs. 5 SGB X).
//
// Schnittstelle für andere Bereiche (z. B. Kostensenkung, Schuldenliste):
//   FristenOrdner.hinzu(eintrag) → 'neu' | 'da' (gleiche Frist schon gespeichert) | false (ungültig oder Speicher nicht bereit)
//   Kurzform (z. B. Kostensenkung): { art, datum, titel, stelle, quelle, notiz }: datum = Tag der Frist aus dem Brief ('JJJJ-MM-TT', „Fest“).
//     Eine unbekannte art (a–z, z. B. 'kostensenkung') wird als 'frist' mit freiem titel gespeichert; Dublettenschutz über art + datum.
//     notiz: kurzer Text (höchstens 200 Zeichen), nur als Text angezeigt.
//   eintrag = { art: 'wid'|'mit'|'anh'|'zahl'|'mb'|'vb'|'termin'|'frist'|'eigen', stelle: 'jc'|'sa'|'wg'|'fk'|'pk'|'vm'|'gericht'|'andere',
//               titel: (nur bei 'eigen', höchstens 60 Zeichen), bis: 'JJJJ-MM-TT' (fester Tag aus dem Brief, wird nie verschoben),
//               basis: { datum, erhalten, zugang, frist: '1M'|'2W'|'14T' } (zum Rechnen), quelle: 'brief'|'bescheid'|… (a–z),
//               schluessel: eigener Dublettenschlüssel /^[a-z0-9-]{1,40}$/ (z. B. 'ks-2027-05-31') }
//   Nur auf ausdrückliche Handlung des Nutzers aufrufen (Knopf), nie automatisch. FristenOrdner.knopf(fn, opt) liefert einen fertigen Knopf.
var FristenOrdner = (function () {
  'use strict';
  var RE_TAG = /^\d{4}-\d\d-\d\d$/;
  var ARTEN = ['wid', 'mit', 'anh', 'zahl', 'mb', 'vb', 'termin', 'frist', 'wb', 'eigen'];
  var STELLEN = ['jc', 'sa', 'wg', 'fk', 'pk', 'vm', 'gericht', 'andere'];
  var WORTE = ['fest', 'gerechnet', 'ungefaehr', 'offen'];
  var LEISTUNGEN = ['sgb2', 'sgb12', 'wohngeld', 'kiz'];
  var VORLAUF_TAGE = { sgb2: 42, sgb12: 42, wohngeld: 60, kiz: 42 }; // App-Regel wie Haushalt.VORLAUF_TAGE (kein Gesetz)
  var MAX = 50, TITEL_MAX = 60, NOTIZ_MAX = 200, ERLEDIGT_TAGE = 30, BALD = 7, VORBEI = 14;

  // ---------- Rechenkern (Daten immer 'JJJJ-MM-TT', ohne Uhrzeit) ----------
  // Gleiche Rechnung wie erweiterungen/fristen.js (Fristen.*); hier eigene Kopie, weil die App ohne das Prüfpaket laufen kann.
  function gueltigerTag(s) {
    if (!RE_TAG.test(String(s || ''))) return false;
    var d = tag(s); return iso(d) === s;
  }
  function tag(s) { var a = String(s).split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2])); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function plusTage(s, n) { var d = tag(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function diff(von, bis) { return Math.round((tag(bis) - tag(von)) / 86400000); }
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  function ostern(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mon = Math.floor((h + l - 7 * m + 114) / 31), t = ((h + l - 7 * m + 114) % 31) + 1;
    return y + '-' + zwei(mon) + '-' + zwei(t);
  }
  var FT = {};
  function feiertage(y) {
    if (FT[y]) return FT[y];
    var o = ostern(y), s = {};
    [y + '-01-01', plusTage(o, -2), plusTage(o, 1), y + '-05-01', plusTage(o, 39), plusTage(o, 50), y + '-10-03', y + '-12-25', y + '-12-26'].forEach(function (x) { s[x] = true; });
    return (FT[y] = s);
  }
  function werktag(s) {
    var d = s;
    for (;;) {
      var w = tag(d).getUTCDay();
      if (w !== 0 && w !== 6 && !feiertage(+d.slice(0, 4))[d]) return d;
      d = plusTage(d, 1);
    }
  }
  // n Monate nach § 188 Abs. 2, 3 BGB / § 64 Abs. 2 SGG: Tag mit derselben Zahl, fehlt er, der letzte Tag des Monats
  function plusMonate(s, n) {
    var a = s.split('-').map(Number), m0 = a[1] - 1 + n, y = a[0] + Math.floor(m0 / 12), m = ((m0 % 12) + 12) % 12;
    var letzter = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return y + '-' + zwei(m + 1) + '-' + zwei(Math.min(a[2], letzter));
  }
  function endeMonat(bekannt, n) { return werktag(plusMonate(bekannt, n)); }
  function endeWochen(bekannt, n) { return werktag(plusTage(bekannt, 7 * n)); }
  function endeTage(bekannt, n) { return werktag(plusTage(bekannt, n)); }
  function endeDauer(bekannt, frist) {
    var m = /^(\d{1,2})([MWT])$/.exec(frist || ''); if (!m) return null;
    var n = +m[1]; return m[2] === 'M' ? endeMonat(bekannt, n) : m[2] === 'W' ? endeWochen(bekannt, n) : endeTage(bekannt, n);
  }
  // Nur für Bescheide (Widerspruch): Zugang (Zustellung, persönlich) sonst Briefdatum + 4; ohne Datum nur mit Erhalt: „Ungefähr“
  function bekanntgabe(b) {
    if (b.zugang) return { bekannt: b.zugang, wort: 'gerechnet' };
    if (b.datum) return { bekannt: plusTage(b.datum, 4), wort: 'gerechnet' };
    if (b.erhalten) return { bekannt: b.erhalten, wort: 'ungefaehr' };
    return null;
  }
  // Anhörung, Mitwirkung (keine Verwaltungsakte, keine 4-Tage-Regel): Tag des Erhalts, sonst Briefdatum + 1 (früheste Ankunft)
  function zugangEinfach(b) {
    if (b.erhalten) return { bekannt: b.erhalten, wort: 'gerechnet' };
    if (b.datum) return { bekannt: plusTage(b.datum, 1), wort: 'ungefaehr' };
    return null;
  }
  // Ende und Wort einer Frist aus ihrer Grundlage. Ergebnis: { bis, wort, bekannt }
  function rechne(e) {
    var b = e.basis || {};
    if (e.art === 'wb') return { bis: e.ende || null, wort: 'fest', bekannt: null };
    if (b.fest) return { bis: b.fest, wort: 'fest', bekannt: null };
    var z = null, frist = b.frist;
    if (e.art === 'wid') { z = bekanntgabe(b); frist = frist || '1M'; }
    else if (e.art === 'mb' || e.art === 'vb') { z = b.zugang ? { bekannt: b.zugang, wort: 'gerechnet' } : null; frist = '2W'; }
    else if (e.art === 'mit' || e.art === 'anh') z = zugangEinfach(b);
    var bis = z && frist ? endeDauer(z.bekannt, frist) : null;
    return bis ? { bis: bis, wort: z.wort, bekannt: z.bekannt } : { bis: null, wort: 'offen', bekannt: null };
  }
  function widerspruch(datum, zugang, erhalten) { return rechne({ art: 'wid', basis: { datum: datum || null, zugang: zugang || null, erhalten: erhalten || null } }); }
  function folgeantrag(l, ende) { return { art: 'wb', leistung: l, ende: ende, bis: ende, wort: 'fest', faellig: plusTage(ende, -(VORLAUF_TAGE[l] || 42)), id: 'wb-' + l + '-' + ende }; }
  function faellig(e) { return e.art === 'wb' ? e.faellig || plusTage(e.bis, -(VORLAUF_TAGE[e.leistung] || 42)) : plusTage(e.bis, -BALD); }

  // Frist aus dem Text eines Briefs (Anhörung, Mitwirkung): rechnet nur, speichert nichts.
  var ZAHLWORT = { ein: 1, eine: 1, einem: 1, einer: 1, eines: 1, zwei: 2, drei: 3, vier: 4, 'fünf': 5, fuenf: 5, sechs: 6, sieben: 7, acht: 8, zehn: 10, zwölf: 12, zwoelf: 12 };
  function dauerAusText(s) {
    var m = /^(\d{1,2}|[a-zäöüß]+)\s+(Woche|Wochen|Tag|Tage|Tagen|Monat|Monats|Monate|Monaten)$/i.exec(String(s || '').trim());
    if (!m) { if (/^Monats$/i.test(String(s || '').trim())) return '1M'; if (/^Woche$/i.test(String(s || '').trim())) return '1W'; return null; }
    var n = /^\d+$/.test(m[1]) ? +m[1] : ZAHLWORT[m[1].toLowerCase()];
    if (!n || n > 99) return null;
    var u = m[2][0].toUpperCase(); return n + (u === 'W' ? 'W' : u === 'T' ? 'T' : 'M');
  }
  function datumAusText(s) {
    var m = /^(\d{1,2})\.(\d{1,2})\.(20\d{2})$/.exec(String(s || '').trim()); if (!m) return null;
    var x = m[3] + '-' + zwei(+m[2]) + '-' + zwei(+m[1]); return gueltigerTag(x) ? x : null;
  }
  // ausBrief(text, art, erhalten) → { art, basis, bis, wort } oder null (keine Frist gefunden)
  function ausBrief(text, art, erhalten) {
    var BL = typeof BriefLesen !== 'undefined' ? BriefLesen : (typeof window !== 'undefined' && window.BriefLesen) || null;
    if (!BL || !text) return null;
    var roh = BL.frist(text);
    if (!roh && BL.andere) { var a = BL.andere(text); roh = a.fristen && a.fristen[0] ? a.fristen[0].frist : null; }
    if (!roh) return null;
    var datum = null; try { datum = BL.lies(text, null).datum || null; } catch (e) { datum = null; }
    var basis = { datum: datum, erhalten: gueltigerTag(erhalten) ? erhalten : null, zugang: null, frist: null, fest: null };
    var fest = datumAusText(roh);
    if (fest) basis.fest = fest; else { basis.frist = dauerAusText(roh); if (!basis.frist) return null; }
    var e = { art: art === 'anh' ? 'anh' : 'mit', basis: basis }, r = rechne(e);
    e.bis = r.bis; e.wort = r.wort; e.bekannt = r.bekannt;
    return e;
  }

  // ---------- Daten ----------
  function textSauber(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  function titelSauber(s) { return textSauber(s, TITEL_MAX); }
  function tagOderNull(s) { return gueltigerTag(s) ? s : null; }
  function leer() { return { v: 1, e: [], wb: {} }; }
  function neueId() {
    try { var a = new Uint8Array(4); globalThis.crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return (b + 256).toString(16).slice(1); }).join(''); } catch (e) { return Math.random().toString(16).slice(2, 10); }
  }
  // Ein Eintrag gegen feste Listen prüfen (aus art, stelle, wort werden Textschlüssel gebildet); Ende neu rechnen
  function eintragSauber(x) {
    if (!x || typeof x !== 'object' || ARTEN.indexOf(x.art) < 0 || x.art === 'wb') return null;
    var b = x.basis && typeof x.basis === 'object' ? x.basis : {};
    var e = {
      id: typeof x.id === 'string' && /^[a-z0-9]{1,16}$/.test(x.id) ? x.id : neueId(),
      art: x.art, stelle: STELLEN.indexOf(x.stelle) >= 0 ? x.stelle : null,
      titel: x.art === 'eigen' || x.art === 'frist' ? titelSauber(x.titel) : '',
      basis: { datum: tagOderNull(b.datum), erhalten: tagOderNull(b.erhalten), zugang: tagOderNull(b.zugang), frist: /^\d{1,2}[MWT]$/.test(b.frist || '') ? b.frist : null, fest: tagOderNull(b.fest) },
      quelle: /^[a-z]{1,16}$/.test(x.quelle || '') ? x.quelle : 'hand',
      erledigt: tagOderNull(x.erledigt), spaeter: tagOderNull(x.spaeter), neu: typeof x.neu === 'number' && isFinite(x.neu) ? x.neu : Date.now()
    };
    var notiz = textSauber(x.notiz, NOTIZ_MAX); if (notiz) e.notiz = notiz;
    if (typeof x.schluessel === 'string' && /^[a-z0-9-]{1,40}$/.test(x.schluessel)) e.schluessel = x.schluessel;
    if (e.art === 'eigen' && !e.titel) return null;
    var r = rechne(e); e.bis = r.bis; e.wort = r.wort;
    return e;
  }
  // Laden mit Prüfung: Unbekanntes weg, höchstens 50 Einträge (die neuesten), erledigte nach 30 Tagen weg
  function normiere(json, heute) {
    var d; try { d = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { d = null; }
    var x = leer();
    if (!d || typeof d !== 'object') return x;
    var grenze = heute ? plusTage(heute, -ERLEDIGT_TAGE) : null;
    if (Array.isArray(d.e)) {
      d.e.forEach(function (y) { var e = eintragSauber(y); if (e && !(grenze && e.erledigt && e.erledigt < grenze)) x.e.push(e); });
      x.e.sort(function (a, b) { return b.neu - a.neu; }); x.e = x.e.slice(0, MAX);
    }
    if (d.wb && typeof d.wb === 'object') Object.keys(d.wb).forEach(function (k) {
      var m = /^wb-(sgb2|sgb12|wohngeld|kiz)-(\d{4}-\d\d-\d\d)$/.exec(k), v = d.wb[k];
      if (!m || !gueltigerTag(m[2]) || !v || typeof v !== 'object') return;
      if (grenze && m[2] < grenze) return; // Zeitraum lange vorbei
      var z = { erledigt: tagOderNull(v.erledigt), spaeter: tagOderNull(v.spaeter) };
      if (z.erledigt || z.spaeter) x.wb[k] = z;
    });
    return x;
  }
  // Dublettenschutz: gleiche Art, Stelle und gleiches Ende (bzw. gleiche Grundlage, solange das Datum fehlt)
  function schluessel(e) {
    if (e.schluessel) return 'k|' + e.schluessel;
    if (e.art === 'wb') return 'wb-' + e.leistung + '-' + e.ende;
    var b = e.basis || {};
    var wann = e.bis || ('o' + (b.datum || '') + '/' + (b.zugang || '') + '/' + (b.erhalten || '') + '/' + (b.frist || ''));
    return e.art + '|' + (e.stelle || '') + '|' + (e.titel ? e.titel.toLowerCase() + '|' : '') + wann;
  }
  // Folgeanträge aus dem Haushaltsplan (lotse.haushalt → bewilligt) mit ihrem Zustand aus der Fristliste
  function wbAus(haushaltText, d, heute) {
    var h = null; try { h = haushaltText ? JSON.parse(haushaltText) : null; } catch (e) { h = null; }
    var bew = h && h.bewilligt && typeof h.bewilligt === 'object' ? h.bewilligt : {}, out = [];
    LEISTUNGEN.forEach(function (l) {
      if (!gueltigerTag(bew[l])) return;
      var e = folgeantrag(l, bew[l]);
      if (heute && diff(heute, e.ende) < -ERLEDIGT_TAGE) return;
      var z = d && d.wb && d.wb[e.id] || {};
      e.erledigt = z.erledigt || null; e.spaeter = z.spaeter || null; out.push(e);
    });
    return out;
  }
  // Auswahl für den Hinweis beim Öffnen: offen, nicht „später“, endet in 0–7 Tagen oder seit 1–14 Tagen abgelaufen
  // (Folgeantrag ab Ende − 42 bzw. − 60 Tage). Sortiert: früheres Ende zuerst (abgelaufen vor heute vor morgen), bei gleichem Tag „Fest“ zuerst.
  function zeigen(liste, heute) {
    var rang = function (e) { return WORTE.indexOf(e.wort); };
    return liste.filter(function (e) {
      if (e.erledigt || !e.bis || (e.spaeter && e.spaeter > heute)) return false;
      return heute >= faellig(e) && diff(heute, e.bis) >= -VORBEI;
    }).sort(function (a, b) { return (a.bis < b.bis ? -1 : a.bis > b.bis ? 1 : 0) || rang(a) - rang(b); });
  }
  function offeneSortiert(liste) {
    return liste.filter(function (e) { return !e.erledigt; }).sort(function (a, b) {
      if (!a.bis !== !b.bis) return a.bis ? -1 : 1;
      return (a.bis || '') < (b.bis || '') ? -1 : (a.bis || '') > (b.bis || '') ? 1 : WORTE.indexOf(a.wort) - WORTE.indexOf(b.wort);
    });
  }
  // „Später erinnern“: kurze Fristen morgen; Folgeantrag in 7 Tagen, aber spätestens 7 Tage vor dem Ende; ab dem Ende morgen
  function spaeterTag(e, heute) {
    var morgen = plusTage(heute, 1);
    if (e.art === 'wb' && heute < e.bis) { var x = plusTage(heute, 7), y = plusTage(e.bis, -7); if (y < x) x = y; return x > heute ? x : morgen; }
    return morgen;
  }

  // =====================================================================
  // Oberfläche
  // =====================================================================
  var ctx = null, daten = null, geladen = false, erlaubt = true, uhrTest = null, letzteNeu = null;
  var speicher = {
    laden: function (cb) { try { cb(localStorage.getItem('lotse.fristliste')); } catch (e) { cb(null); } },
    schreiben: function (text, cb) { try { localStorage.setItem('lotse.fristliste', text); cb(null); } catch (e) { cb(e); } }
  };
  function speicherOrt(s) { if (s && s.laden) speicher.laden = s.laden; if (s && s.schreiben) speicher.schreiben = s.schreiben; }
  var $ = function (id) { return document.getElementById(id); };
  function t(k, p) { return ctx.t(k, p); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function knopfEl(cls, text, fn) { var b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function heute() {
    if (uhrTest) return uhrTest;
    var d = new Date(); return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate());
  }
  var WT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
  function datumText(s) {
    var d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    var x = ctx.datum(d);
    return ctx.lang && ctx.lang() === 'de' ? WT[d.getDay()] + ', ' + x : x; // Wochentag nur auf Deutsch
  }
  function restText(bis, h) {
    var n = diff(h || heute(), bis);
    if (n === 0) return t('fri.rest.heute');
    if (n === 1) return t('fri.rest.morgen');
    if (n === -1) return t('fri.rest.gestern');
    return n > 1 ? t('fri.rest.tage', { n: String(n) }) : t('fri.rest.vorbei', { n: String(-n) });
  }
  function leistungName(l) { return t('hb.wb.' + l); }
  function titelVon(e) {
    if (e.art === 'eigen' || (e.art === 'frist' && e.titel)) return e.titel;
    if (e.art === 'wb') return t('fri.art.wb', { leistung: leistungName(e.leistung) });
    var s = t('fri.art.' + e.art, { stelle: e.stelle && e.stelle !== 'andere' ? t('fri.stelle.' + e.stelle) : '\u0000' });
    return s.replace(/\s*[(（]\s*\u0000\s*[)）]/g, '').replace(/\u0000/g, t('fri.stelle.andere')).trim();
  }
  function bereit() { return !!(ctx && geladen && daten); }
  function aktivListe() {
    if (!bereit()) return [];
    var h = heute(), hh = null;
    try { var a = ctx.alle ? ctx.alle() : []; a.forEach(function (v) { if (v.aktiv) hh = v.haushalt; }); } catch (e) { hh = null; }
    return daten.e.concat(wbAus(hh, daten, h));
  }
  function sichern() { speicher.schreiben(JSON.stringify(daten), function () {}); }
  function aendern() { sichern(); neuZeichnen(); }
  function neuZeichnen() {
    if (ctx && ctx.neu) { try { ctx.neu(); } catch (e) {} }
    render();
    var s = $('friStart'); if (s && s.getAttribute('data-art') === 'hinweis') startHinweisZeichnen(false);
  }
  function findeId(id) { return daten ? daten.e.filter(function (e) { return e.id === id; })[0] || null : null; }
  function setzeZustand(e, feld, wert) {
    if (e.art === 'wb') { var z = daten.wb[e.id] || {}; z[feld] = wert; if (!z.erledigt && !z.spaeter) delete daten.wb[e.id]; else daten.wb[e.id] = z; }
    else { var x = findeId(e.id); if (x) x[feld] = wert; }
  }
  // Eingabe der Schnittstelle vereinheitlichen (Kurzform mit datum, unbekannte Art → 'frist')
  function eingabe(roh) {
    if (!roh || typeof roh !== 'object') return null;
    var x = Object.assign({}, roh);
    if (!x.bis && !x.basis && x.datum) x.bis = x.datum; // Kurzform: datum = Tag der Frist
    if (typeof x.art === 'string' && ARTEN.indexOf(x.art) < 0) {
      if (!/^[a-z][a-z0-9-]{0,23}$/.test(x.art) || !gueltigerTag(x.bis)) return null;
      if (!x.schluessel) x.schluessel = x.art + '-' + x.bis;
      x.art = 'frist';
    }
    // Fester Tag ohne Grundlage (z. B. { art: 'zahl', bis }) gilt als „Fest“; sonst wird das Ende immer aus der Grundlage gerechnet
    if (x.bis && !x.basis) x.basis = { fest: x.bis };
    return x;
  }
  function hinzuIntern(roh) {
    if (!bereit()) return { s: 'fehler' };
    var e = eintragSauber(eingabe(roh)); if (!e) return { s: 'fehler' };
    var k = schluessel(e);
    var da = daten.e.filter(function (x) { return schluessel(x) === k; })[0];
    if (da) return { s: 'da', id: da.id };
    e.neu = Date.now(); e.erledigt = null; e.spaeter = null;
    daten.e.unshift(e);
    if (daten.e.length > MAX) daten.e = daten.e.slice(0, MAX);
    letzteNeu = e.id; aendern();
    return { s: 'neu', id: e.id, e: e };
  }
  function hinzu(roh) { var s = hinzuIntern(roh).s; return s === 'fehler' ? false : s; }
  function entfernen(id) {
    if (!bereit()) return false;
    var n = daten.e.length; daten.e = daten.e.filter(function (x) { return x.id !== id; });
    if (daten.e.length === n) return false;
    aendern(); return true;
  }

  // Meldung mit „Rückgängig“ (10 Sekunden), immer als Text
  function meldung(box, text, rueck) {
    if (!box) return;
    box.textContent = '';
    box.appendChild(document.createTextNode(text));
    if (rueck) {
      box.appendChild(document.createTextNode(' '));
      var b = knopfEl('linkbtn', t('fri.rueck'), function () { clearTimeout(box._uhr); box.textContent = ''; rueck(); });
      box.appendChild(b);
      clearTimeout(box._uhr); box._uhr = setTimeout(function () { if (b.parentNode === box) box.removeChild(b); }, 10000);
    }
  }

  // ---------- Knopf „Frist merken“ (für „Brief prüfen“ und andere Bereiche) ----------
  // fn(wert) liefert den Eintrag; opt.feld: 'erhalten' | 'zugang' (Datumsfeld davor, freiwillig)
  var knopfNr = 0;
  function knopf(fn, opt) {
    opt = opt || {};
    var box = el('div', 'fri-merken'), feld = null, nr = ++knopfNr;
    if (opt.feld === 'erhalten' || opt.feld === 'zugang') {
      var f = el('div', 'field'), l = el('label', null, t('fri.feld.' + opt.feld)); l.htmlFor = 'friFeld' + nr;
      feld = el('input'); feld.type = 'date'; feld.id = 'friFeld' + nr;
      f.appendChild(l); f.appendChild(feld); box.appendChild(f);
    }
    var b = knopfEl('btn ghost klein', t('fri.merken'), function () {
      var wert = feld && gueltigerTag(feld.value) ? feld.value : null;
      var e = null; try { e = fn(wert); } catch (x) { e = null; }
      var r = hinzuIntern(e);
      if (r.s === 'neu') meldung(m, t('fri.gemerkt', { titel: titelVon(r.e), datum: r.e.bis ? datumText(r.e.bis) : t('fri.wort.offen') }), function () { entfernen(r.id); meldung(m, t('fri.entfernt')); });
      else if (r.s === 'da') meldung(m, t('fri.schonDa'));
      else meldung(m, t('fri.fehler'));
    });
    b.setAttribute('aria-describedby', 'friMerkenT' + nr);
    box.appendChild(b);
    var hint = el('p', 'small muted', t('fri.merken.t')); hint.id = 'friMerkenT' + nr; box.appendChild(hint);
    var m = el('p', 'msg'); m.setAttribute('role', 'status'); box.appendChild(m);
    return box;
  }
  // Für Anhörung und Mitwirkung in „Brief prüfen“: nur, wenn eine Frist im Brief steht
  function briefKnopf(text, art) {
    var probe = ausBrief(text, art, null);
    if (!probe) return null;
    return knopf(function (erhalten) { var e = ausBrief(text, art, erhalten); if (e) e.quelle = 'brief'; return e; }, { feld: probe.basis.fest ? null : 'erhalten' });
  }

  // ---------- Liste (Unterseite „Fristen“ in „Mein Ordner“) ----------
  function rechnungText(e) {
    var b = e.basis || {}, r = rechne(e);
    if (e.wort === 'fest') return t('fri.rechnung.fest');
    if (e.wort === 'offen') return t('fri.wort.offen.t');
    var dauer = dauerText(e.art === 'wid' ? b.frist || '1M' : (e.art === 'mb' || e.art === 'vb') ? '2W' : b.frist);
    if (e.art === 'wid') return b.zugang || b.datum ? t('fri.rechnung.wid', { datum: datumText(b.datum || b.zugang), bekannt: datumText(r.bekannt) }) : t('fri.rechnung.wid.ohne', { bekannt: datumText(r.bekannt) });
    if (e.art === 'mb' || e.art === 'vb') return t('fri.rechnung.zustellung', { datum: datumText(b.zugang) });
    return b.erhalten ? t('fri.rechnung.woche', { bekannt: datumText(b.erhalten), dauer: dauer }) : t('fri.rechnung.woche.ohne', { datum: datumText(b.datum), dauer: dauer });
  }
  function dauerText(f) {
    var m = /^(\d{1,2})([MWT])$/.exec(f || ''); if (!m) return '';
    var n = +m[1], k = m[2] === 'M' ? 'm' : m[2] === 'W' ? 'w' : 't';
    return t('fri.dauer.' + k + (n === 1 ? '1' : ''), { n: String(n) });
  }
  var PILL = { fest: 'ja', gerechnet: 'na', ungefaehr: 'vielleicht', offen: 'nein' };
  function eintragEl(e, h) {
    var art = el('article', 'fri-e'); art.id = 'fri-' + e.id;
    var kopf = el('h3', 'fri-titel', titelVon(e)); art.appendChild(kopf);
    var z = el('p', 'fri-bis');
    var w = el('span', 'pill ' + PILL[e.wort], t('fri.wort.' + e.wort)); w.title = t('fri.wort.' + e.wort + '.t');
    if (e.bis) { var bb = el('b', null, t('fri.bis', { datum: datumText(e.bis), rest: restText(e.bis, h) })); z.appendChild(bb); z.appendChild(document.createTextNode(' ')); }
    z.appendChild(w); art.appendChild(z);
    if (e.art === 'wb') {
      art.appendChild(el('p', 'small', t('fri.art.wb.t', { leistung: leistungName(e.leistung), ende: datumText(e.ende) })));
      if (h > e.ende) art.appendChild(el('p', 'small warn', t('fri.art.wb.spaet')));
    } else if (e.art !== 'eigen') art.appendChild(el('p', 'small', t('fri.art.' + e.art + '.t')));
    if (e.notiz) art.appendChild(el('p', 'small fri-notiz', e.notiz)); // nur als Text
    var ab = ctx.ablauf ? ctx.ablauf() : null;
    if (ab && e.bis) { var abTag = ab.getFullYear() + '-' + zwei(ab.getMonth() + 1) + '-' + zwei(ab.getDate()); if (abTag < e.bis) art.appendChild(el('p', 'small warn', t('fri.vorgangWeg', { datum: datumText(abTag), bis: datumText(e.bis) }))); }
    if (e.art !== 'wb' && e.art !== 'eigen') {
      var d = el('details', 'fri-det'), su = el('summary', null, t('fri.rechnung')); d.appendChild(su);
      d.appendChild(el('p', null, t('fri.wort.' + e.wort + '.t')));
      if (e.wort !== 'fest' && e.wort !== 'offen') d.appendChild(el('p', null, rechnungText(e)));
      else if (e.wort === 'fest') d.appendChild(el('p', null, t('fri.rechnung.fest')));
      if (e.wort === 'gerechnet' || e.wort === 'ungefaehr') d.appendChild(el('p', 'small', t('fri.rechnung.feiertag')));
      if (['wid', 'mit', 'anh', 'mb', 'vb'].indexOf(e.art) >= 0) d.appendChild(el('p', 'small', t('fri.eingang')));
      if (e.art === 'wid') d.appendChild(el('p', 'small', t('fri.belehrung')));
      art.appendChild(d);
    }
    var btns = el('div', 'btns');
    btns.appendChild(knopfEl('btn ghost klein', t('fri.erledigt'), function () {
      setzeZustand(e, 'erledigt', heute()); aendern();
      meldung($('friMsg'), t('fri.erledigt.ok'), function () { setzeZustand(e, 'erledigt', null); aendern(); });
      var hh = $('friH'); if (hh) hh.focus();
    }));
    if (e.art !== 'wb') {
      btns.appendChild(knopfEl('btn ghost klein', t('fri.aendern'), function (ev) { aendernForm(art, e, ev.currentTarget); }));
      btns.appendChild(knopfEl('btn ghost klein', t('fri.loeschen'), function () {
        var alt = JSON.parse(JSON.stringify(findeId(e.id)));
        entfernen(e.id);
        meldung($('friMsg'), t('fri.entfernt'), function () { if (!findeId(alt.id)) { daten.e.unshift(alt); aendern(); } });
        var hh = $('friH'); if (hh) hh.focus();
      }));
    }
    art.appendChild(btns);
    return art;
  }
  // „Datum ändern“: je nach Art das Datum, aus dem gerechnet wird, oder der feste Tag
  function aendernForm(art, e, ausloeser) {
    var alt = art.querySelector('form'); if (alt) { alt.remove(); ausloeser.setAttribute('aria-expanded', 'false'); return; }
    ausloeser.setAttribute('aria-expanded', 'true');
    var b = e.basis, feld = e.wort === 'fest' || ['zahl', 'termin', 'frist', 'eigen'].indexOf(e.art) >= 0 ? 'fest' : e.art === 'wid' ? 'datum' : (e.art === 'mb' || e.art === 'vb') ? 'zugang' : 'erhalten';
    var f = el('form', 'fri-form'); f.setAttribute('novalidate', '');
    var id = 'friAendern-' + e.id, l = el('label', null, t(feld === 'fest' ? 'fri.eigen.bis' : 'fri.feld.' + feld)); l.htmlFor = id;
    var i = el('input'); i.type = 'date'; i.id = id; i.value = b[feld] || (feld === 'fest' ? e.bis || '' : '');
    var s = el('button', 'btn klein', t('fri.speichern')); s.type = 'submit';
    var m = el('p', 'msg'); m.setAttribute('role', 'status');
    f.appendChild(l); f.appendChild(i); f.appendChild(s); f.appendChild(m);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!gueltigerTag(i.value)) { m.textContent = t('fri.eigen.fehlt'); i.focus(); return; }
      var x = findeId(e.id); if (!x) return;
      x.basis[feld] = i.value; var r = rechne(x); x.bis = r.bis; x.wort = r.wort;
      aendern(); var neu = $('fri-' + e.id); var h3 = neu && neu.querySelector('h3'); if (h3) { h3.setAttribute('tabindex', '-1'); h3.focus(); }
    });
    art.insertBefore(f, art.querySelector('.btns').nextSibling);
    i.focus();
  }
  function eigenForm(box) {
    var d = el('details', 'fri-eigen'), su = el('summary', null, t('fri.eigen')); d.appendChild(su);
    var f = el('form', 'fri-form'); f.setAttribute('novalidate', '');
    var l1 = el('label', null, t('fri.eigen.titel')); l1.htmlFor = 'friEigenTitel';
    var i1 = el('input'); i1.type = 'text'; i1.id = 'friEigenTitel'; i1.maxLength = TITEL_MAX; i1.setAttribute('autocomplete', 'off');
    var l2 = el('label', null, t('fri.eigen.bis')); l2.htmlFor = 'friEigenBis';
    var i2 = el('input'); i2.type = 'date'; i2.id = 'friEigenBis';
    var s = el('button', 'btn klein', t('fri.speichern')); s.type = 'submit';
    var m = el('p', 'msg'); m.setAttribute('role', 'status');
    [l1, i1, l2, i2, s, m].forEach(function (x) { f.appendChild(x); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!titelSauber(i1.value) || !gueltigerTag(i2.value)) { m.textContent = t('fri.eigen.fehlt'); (titelSauber(i1.value) ? i2 : i1).focus(); return; }
      var r = hinzuIntern({ art: 'eigen', titel: i1.value, bis: i2.value, quelle: 'hand' });
      if (r.s === 'da') { m.textContent = t('fri.schonDa'); return; }
      meldung($('friMsg'), t('fri.gemerkt', { titel: titelSauber(i1.value), datum: datumText(i2.value) }), function () { entfernen(r.id); });
      var hh = $('friH'); if (hh) hh.focus();
    });
    d.appendChild(f); box.appendChild(d);
  }
  function render() {
    var box = $('friListe');
    if (!box || !ctx) return;
    var seite = $('ordnerFristen'); if (seite && seite.hidden) return;
    box.textContent = '';
    if (!bereit()) return;
    var h = heute(), alle = aktivListe(), offen = offeneSortiert(alle), fertig = alle.filter(function (e) { return e.erledigt; });
    if (!offen.length) box.appendChild(el('p', 'muted', t('fri.karte.keine')));
    offen.forEach(function (e) { box.appendChild(eintragEl(e, h)); });
    eigenForm(box);
    if (fertig.length) {
      var d = el('details', 'fri-fertig'), su = el('summary', null, t('fri.erledigtListe', { n: String(fertig.length) })); d.appendChild(su);
      d.appendChild(el('p', 'small muted', t('fri.erledigtListe.t')));
      var ul = el('ul', 'fri-fertig-l');
      fertig.forEach(function (e) {
        var li = el('li'); li.appendChild(el('span', null, titelVon(e) + (e.bis ? ' · ' + datumText(e.bis) : '') + ' '));
        li.appendChild(knopfEl('linkbtn', t('fri.rueck'), function () { setzeZustand(e, 'erledigt', null); aendern(); var hh = $('friH'); if (hh) hh.focus(); }));
        ul.appendChild(li);
      });
      d.appendChild(ul); box.appendChild(d);
    }
  }
  // Für die Karte in „Mein Ordner“: nächste offene Frist (oder null, wenn keine offen ist)
  function stand() {
    if (!bereit()) return null;
    var offen = offeneSortiert(aktivListe());
    if (!offen.length) return null;
    var e = offen[0], h = heute();
    var text = e.bis ? t('fri.karte.naechste', { titel: titelVon(e), datum: datumText(e.bis), rest: restText(e.bis, h) }) : titelVon(e) + ': ' + t('fri.wort.offen');
    return { text: text, n: offen.length, bald: !!(e.bis && diff(h, e.bis) <= BALD) };
  }

  // ---------- Hinweis beim Öffnen (Startseite) ----------
  function auswahlAlle(h) {
    var out = [], vg = [];
    try { vg = ctx.alle ? ctx.alle() : []; } catch (e) { vg = []; }
    vg.forEach(function (v) {
      var d = v.aktiv && daten ? daten : normiere(v.fristliste, h);
      d.e.concat(wbAus(v.haushalt, d, h)).forEach(function (e) { out.push({ e: e, vg: v }); });
    });
    var sortiert = zeigen(out.map(function (x) { return x.e; }), h);
    return { liste: sortiert.map(function (e) { return out.filter(function (x) { return x.e === e; })[0]; }), mehrereVg: vg.length > 1 };
  }
  // Einmal am Tag: Merker lotse.fristTag (nur JJJJ-MM-TT) wird bei jeder Tagesprüfung gesetzt, auch ohne Frist und mit Schalter aus
  function startHinweis() {
    if (!bereit() || !ctx.roh) return;
    var h = heute();
    ctx.roh.get('lotse.fristTag', function (v) {
      var tagVorher = RE_TAG.test(String(v || '')) ? v : null;
      if (tagVorher === h) return;
      ctx.roh.set('lotse.fristTag', h);
      if (!erlaubt) return;
      startHinweisZeichnen(true);
    });
  }
  function startHinweisWeg() { var s = $('friStart'); if (s) s.remove(); }
  function startHinweisZeichnen(neu) {
    var v = $('v-start'); if (!v || !bereit()) return;
    var h = heute(), a = auswahlAlle(h);
    var alt = $('friStart');
    if (!a.liste.length) { if (alt && alt.getAttribute('data-art') === 'hinweis') alt.remove(); return; }
    if (!neu && !alt) return;
    var x = a.liste[0], e = x.e, eigen = !!x.vg.aktiv, vorbei = e.bis < h;
    var box = el('div', 'fri-start ' + (vorbei ? 'vorbei' : 'bald')); box.id = 'friStart'; box.setAttribute('role', 'status'); box.setAttribute('data-art', 'hinweis');
    box.appendChild(el('p', 'fri-start-t', vorbei ? t('fri.start.vorbei', { titel: titelVon(e), datum: datumText(e.bis) }) : t('fri.start.bald', { titel: titelVon(e), datum: datumText(e.bis), rest: restText(e.bis, h) })));
    if (a.mehrereVg) box.appendChild(el('p', 'small', t('fri.start.vorgang', { name: x.vg.name || t('fri.start.ohneName') })));
    var btns = el('div', 'btns');
    var ansehen = function () {
      startHinweisWeg();
      if (!eigen && ctx.oeffneVorgang) ctx.oeffneVorgang(x.vg.id);
      if (ctx.zeigeListe) ctx.zeigeListe();
    };
    if (eigen) {
      btns.appendChild(knopfEl('btn ghost klein', t('fri.erledigt'), function () {
        setzeZustand(e, 'erledigt', h); sichern(); if (ctx.neu) ctx.neu(); render();
        box.setAttribute('data-art', 'meldung'); box.textContent = '';
        var m = el('p'); box.appendChild(m);
        meldung(m, t('fri.erledigt.ok'), function () { setzeZustand(e, 'erledigt', null); sichern(); if (ctx.neu) ctx.neu(); render(); startHinweisZeichnen(true); });
        var b0 = m.querySelector('button'); if (b0) b0.focus();
      }));
      btns.appendChild(knopfEl('btn ghost klein', t('fri.start.spaeter'), function () {
        var tg = spaeterTag(e, h); setzeZustand(e, 'spaeter', tg); sichern(); if (ctx.neu) ctx.neu(); render();
        box.setAttribute('data-art', 'meldung'); box.textContent = ''; box.appendChild(el('p', null, t('fri.start.spaeter.ok', { datum: datumText(tg) })));
      }));
    }
    btns.appendChild(knopfEl('btn ghost klein', t('fri.start.ansehen'), ansehen));
    box.appendChild(btns);
    if (a.liste.length > 1) box.appendChild(knopfEl('linkbtn', t('fri.start.mehr', { n: String(a.liste.length - 1) }), ansehen));
    if (alt) alt.replaceWith(box);
    else {
      var r = v.querySelector('.start-raster'), hh = v.querySelector('h2');
      if (r) v.insertBefore(box, r); else if (hh && hh.nextSibling) v.insertBefore(box, hh.nextSibling); else v.appendChild(box);
    }
  }

  // ---------- Schalter „Erinnerung an Fristen beim Öffnen“ (Einstellungen → Sicherheit und Daten) ----------
  function schalterSetzen() { var b = $('friHinweisBtn'); if (b) b.setAttribute('aria-checked', String(erlaubt)); }

  // ctx = { t, datum(d), lang(), roh (Gerätespeicher ohne Vorgang), alle() → [{ id, name, aktiv, fristliste, haushalt }],
  //         ablauf() → Date|null (automatisches Löschen des geöffneten Vorgangs), oeffneVorgang(id), zeigeListe(), neu() (Karte neu zeichnen) }
  function init(c) {
    ctx = c;
    var b = $('friHinweisBtn');
    if (b) b.addEventListener('click', function () {
      erlaubt = !erlaubt; schalterSetzen();
      if (ctx.roh) ctx.roh.set('lotse.fristHinweis', erlaubt ? '1' : '0');
      if (!erlaubt) startHinweisWeg();
    });
    var weiter = function () {
      speicher.laden(function (v) { daten = normiere(v, heute()); geladen = true; neuZeichnen(); startHinweis(); });
    };
    if (ctx.roh) ctx.roh.get('lotse.fristHinweis', function (v) { erlaubt = v !== '0'; schalterSetzen(); weiter(); });
    else weiter();
  }
  // Nach einem Wechsel des Vorgangs (oder Löschen): Liste des geöffneten Vorgangs neu lesen, ohne zu schreiben
  function neuLaden() {
    if (!ctx) return;
    geladen = false;
    speicher.laden(function (v) { daten = normiere(v, heute()); geladen = true; neuZeichnen(); });
  }

  return {
    // Rechnung (Tests)
    plusTage: plusTage, werktag: werktag, feiertage: feiertage, ostern: ostern, plusMonate: plusMonate, endeMonat: endeMonat, endeWochen: endeWochen, endeTage: endeTage,
    bekanntgabe: bekanntgabe, zugangEinfach: zugangEinfach, rechne: rechne, widerspruch: widerspruch, folgeantrag: folgeantrag, faellig: faellig, ausBrief: ausBrief,
    dauerAusText: dauerAusText, zeigen: zeigen, spaeterTag: spaeterTag, schluessel: schluessel, normiere: normiere, eintragSauber: eintragSauber, wbAus: wbAus,
    VORLAUF_TAGE: VORLAUF_TAGE, ARTEN: ARTEN, STELLEN: STELLEN, WORTE: WORTE, MAX: MAX, TITEL_MAX: TITEL_MAX,
    // Oberfläche
    speicherOrt: speicherOrt, init: init, neuLaden: neuLaden, render: render, stand: stand, startHinweis: startHinweis,
    neu: function () { if (bereit()) neuZeichnen(); },
    sprache: function () { if (!bereit()) return; render(); var s = $('friStart'); if (s && s.getAttribute('data-art') === 'hinweis') startHinweisZeichnen(false); },
    // Schnittstelle für andere Bereiche
    hinzu: hinzu, merken: hinzu, entfernen: entfernen, knopf: knopf, briefKnopf: briefKnopf,
    rueckgaengig: function () { return letzteNeu ? entfernen(letzteNeu) : false; },
    t: function (k, p) { return ctx ? t(k, p) : k; },
    // nur für Tests: feste Uhr (JJJJ-MM-TT)
    uhr: function (s) { uhrTest = gueltigerTag(s) ? s : null; }
  };
})();
if (typeof globalThis !== 'undefined') globalThis.FristenOrdner = FristenOrdner; // Schnittstelle für andere Bereiche (globalThis.FristenOrdner.hinzu)
if (typeof module !== 'undefined') module.exports = FristenOrdner;
