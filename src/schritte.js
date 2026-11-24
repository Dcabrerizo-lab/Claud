// Leistungs-Check „Schritt für Schritt“: eine Frage pro Seite (Muster „One thing per page“ und „Check answers“ von GOV.UK).
// Fragt alle Angaben des langen Formulars ab, aber nur, was für diesen Fall nötig ist (Verzweigung über wenn()).
// Beide Wege (Schritt für Schritt / Alles auf einer Seite) schreiben in DENSELBEN Zustand (state der App): Umschalten verliert nichts,
// das Ergebnis ist gleich. Nach jeder Antwort ruft das Modul ctx.geaendert(): die App schreibt das Formular neu und rechnet
// (writeForm, buildSelects, touched). Ausgeblendete Folgefragen setzt die App wie im Formular zurück (folgefragen()).
// Gespeichert wird über die App: Antworten in lotse.state (Vorgänge), Stand des Ablaufs im selben Eintrag (Feld sf).
// Die Wahl des Weges gilt pro Gerät (ctx.wegSpeichern, nicht im Vorgang).
// Texte: src/lang/schritte/<Sprache>.json (Schlüssel „sf.*“), Einfache Sprache: src/lang/einfach/schritte.json.
// Antwort-Knöpfe nutzen die Auswahltexte des Formulars (z. B. arbeit.krank), damit beide Wege dieselben Begriffe zeigen.
// Keine eigenen Zahlen oder Rechtsaussagen: alle Grenzen und Berechnungen stehen in src/rules.js.
var Schritte = (function () {
  'use strict';
  var ctx = null, box = null;
  var weg = '';          // '' = noch nicht gewählt, 'schritt', 'alles'
  var pos = '';          // aktuelle Frage (id), 'uebersicht' oder 'ergebnis'
  var ja = {};           // beantwortete Fragen
  var zurUeb = false;    // nach „ändern“ zurück zur Übersicht
  var warnOk = '';       // ungewöhnliche Zahl einmal bestätigt
  var VERZ = 250;        // ms: gewählte Antwort kurz zeigen, dann weiter

  function t(k, p) { return ctx.t(k, p); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function S() { return ctx.state(); }
  function num(v) { return v === '' || v == null ? 0 : Number(v); }
  function hatRente(s) { return s.ek1Art === 'rente' || s.ek2Art === 'rente' || s.ek1bArt === 'rente' || s.ek2bArt === 'rente'; }
  function hatWfbm(s) { return !!s.wfbm || s.ek1Art === 'wfbm' || s.ek1bArt === 'wfbm' || s.ek2bArt === 'wfbm'; }
  function plzInfo(s) { var p = String(s.plz || ''); return p.length === 5 && ctx.plz ? ctx.plz(p) : null; }
  function mitBrutto(a) { return a === 'lohn' || a === 'rente' || a === 'selbst'; }

  var JN = [[true, 'sf.a.ja'], [false, 'sf.a.nein']];
  var EK = ['lohn', 'selbst', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'unt'];
  // Einkommensart „Asylbewerberleistungen“ (Wert 'asylblg') nur bei Aufenthalt „Asylverfahren oder Duldung“ oder „ausreisepflichtig ohne Duldung“
  // ('ausreise', zählt wie 'asyl'); Werte wie Branch claude/b-aufenthalt
  function asyl(s) { return s.aufenthalt === 'asyl' || s.aufenthalt === 'ausreise'; }
  function ekArten(s) {
    var o = EK.map(function (a) { return [a, 'ek.art.' + a]; });
    if (asyl(s)) o.push(['asylblg', 'sf.a.asylblg']);
    o.push(['ohne', 'ek.art.ohne']);
    return o;
  }
  function ekFragen(i) {
    var A = 'ek' + i + 'Art', da = function (s) { return i === 1 || s.adults === 2; };
    var wer = function (s) { return s.adults === 2 ? t('sf.wer' + i) : ''; };
    return [
      { id: A, b: 'geld', art: 'wahl', wer: wer, q: 'sf.q.ekArt', h: 'sf.h.ekArt', wenn: da, opts: ekArten, klein: true },
      { id: 'ek' + i + 'Brutto', b: 'geld', art: 'zahl', euro: true, skip: 'sf.weissNicht', wer: wer, wenn: function (s) { return da(s) && mitBrutto(s[A]); },
        q: function (s) { return 'sf.q.brutto.' + s[A]; }, h: 'sf.h.brutto' },
      { id: 'ek' + i + 'Netto', b: 'geld', art: 'zahl', euro: true, skip: 'sf.weissNicht', wer: wer, wenn: function (s) { return da(s) && !!s[A] && s[A] !== 'ohne'; },
        q: function (s) { var a = s[A]; return mitBrutto(a) ? (a === 'selbst' ? 'sf.q.netto.selbst' : 'sf.q.netto') : a === 'wfbm' ? 'sf.q.betrag.wfbm' : a === 'unt' ? 'sf.q.betrag.unt' : 'sf.q.betrag'; },
        h: function (s) { return mitBrutto(s[A]) && s[A] !== 'selbst' ? 'sf.h.netto' : ''; } },
      { id: 'ek' + i + 'bArt', b: 'geld', art: 'wahl', wer: wer, q: 'sf.q.ekZweit', h: 'sf.h.ekZweit', klein: true, wenn: function (s) { return da(s) && !!s[A] && s[A] !== 'ohne' && s[A] !== 'asylblg'; },
        opts: [['', 'ek.weiteres.0']].concat(EK.map(function (a) { return [a, 'ek.art.' + a]; })) },
      { id: 'ek' + i + 'bBetrag', b: 'geld', art: 'zahl', euro: true, skip: 'sf.weissNicht', wer: wer, q: 'sf.q.ekZweitBetrag', wenn: function (s) { return da(s) && !!s['ek' + i + 'bArt']; } }
    ];
  }
  var nr = function (n) { return function () { return t('pflege.n', { n: n }); }; };

  // ---------- Die Fragen in fester Reihenfolge (Bereiche: haus, gesund, arbeit, ausb, wohnen, geld, bezug) ----------
  var FRAGEN = [
    { id: 'adults', b: 'haus', art: 'wahl', q: 'sf.q.adults', h: 'sf.h.adults', opts: [[1, 'sf.a.allein'], [2, 'sf.a.paar']] },
    { id: 'kids', b: 'haus', art: 'zaehler', q: 'sf.q.kids', max: function (s) { return Math.min(8, 12 - s.adults - s.young); } },
    { id: 'kidsU6', b: 'haus', art: 'zaehler', q: 'sf.q.kidsU6', wenn: function (s) { return s.kids > 0; }, max: function (s) { return s.kids; } },
    { id: 'kids14', b: 'haus', art: 'zaehler', q: 'sf.q.kids14', h: 'sf.h.kids14', wenn: function (s) { return s.kids - (s.kidsU6 || 0) > 0; }, max: function (s) { return s.kids - (s.kidsU6 || 0); } },
    { id: 'kinderMehr', b: 'haus', art: 'mehr', q: 'sf.q.kinderMehr', wenn: function (s) { return s.kids > 0; }, felder: [['kinder12', 'cb.kinder12'], ['kindKrank', 'cb.kindKrank'], ['unterhaltFehlt', 'cb.unterhalt']] },
    { id: 'uvgWechsel', b: 'haus', art: 'wahl', q: 'sf.q.uvgWechsel', h: 'sf.h.uvgWechsel', opts: JN, wenn: function (s) { return !!s.unterhaltFehlt && s.kids > 0; } },
    { id: 'uvgPartner', b: 'haus', art: 'wahl', q: 'sf.q.uvgPartner', h: 'sf.h.uvgPartner', wenn: function (s) { return !!s.unterhaltFehlt && s.kids > 0 && s.adults === 2; }, opts: [['neu', 'uvgPartner.neu'], ['ehe', 'uvgPartner.ehe'], ['eltern', 'uvgPartner.eltern']] },
    { id: 'young', b: 'haus', art: 'zaehler', q: 'sf.q.young', max: function (s) { return Math.min(8, 12 - s.adults - s.kids); } },
    { id: 'gebJahr', b: 'haus', art: 'zahl', ziffern: 4, skip: 'sf.weissNicht', q: 'sf.q.geb', h: 'sf.h.geb' },
    { id: 'schwanger', b: 'haus', art: 'wahl', q: 'sf.q.schwanger', opts: JN },
    { id: 'baby', b: 'haus', art: 'wahl', q: 'sf.q.baby', opts: [['', 'baby.0'], ['bald', 'baby.bald'], ['da', 'baby.da']] },
    { id: 'egVor', b: 'haus', art: 'zahl', euro: true, skip: 'sf.weissNicht', q: 'sf.q.egVor', h: 'sf.h.egVor', wenn: function (s) { return !!s.baby; } },
    { id: 'egKinder', b: 'haus', art: 'wahl', q: 'sf.q.egKinder', h: 'sf.h.egKinder', wenn: function (s) { return !!s.baby; }, opts: [['', 'egKinder.1'], ['2', 'egKinder.2'], ['3', 'egKinder.3']] },
    { id: 'egNach', b: 'haus', art: 'zahl', euro: true, skip: 'sf.egNachKeine', q: 'sf.q.egNach', h: 'sf.h.egNach', wenn: function (s) { return !!s.baby; } },
    { id: 'aufenthalt', b: 'haus', art: 'wahl', q: 'sf.q.aufenthalt', h: 'sf.h.aufenthalt', opts: [['', 'aufenthalt.0'], ['eu', 'aufenthalt.eu'], ['asyl', 'aufenthalt.asyl'], ['ausreise', 'sf.a.ausreise']] },
    { id: 'euArbeit', b: 'haus', art: 'wahl', q: 'sf.q.euArbeit', h: 'sf.h.euArbeit', wenn: function (s) { return s.aufenthalt === 'eu'; }, opts: [['ja', 'sf.a.ja'], ['nein', 'sf.a.nein']] },
    { id: 'euJahre', b: 'haus', art: 'wahl', q: 'sf.q.euJahre', wenn: function (s) { return s.aufenthalt === 'eu'; }, opts: [['unter5', 'eu.jahre.unter5'], ['ab5', 'eu.jahre.ab5']] },

    { id: 'pflegegrad', b: 'gesund', art: 'wahl', q: 'sf.q.pflege', klein: true, opts: [['', 'pflege.0'], ['antrag', 'pflege.antrag'], ['1', nr(1)], ['2', nr(2)], ['3', nr(3)], ['4', nr(4)], ['5', nr(5)]] },
    { id: 'bhPerson', b: 'gesund', art: 'wahl', q: 'sf.q.bhPerson', h: 'sf.h.bhPerson', opts: [['', 'bh.person.0'], ['minder', 'bh.person.minder'], ['erwVor25', 'bh.person.erwVor25'], ['erwNach25', 'bh.person.erwNach25']] },
    { id: 'gdb', b: 'gesund', art: 'wahl', q: 'sf.q.gdb', h: 'sf.h.gdb', klein: true, wenn: function (s) { return !!s.bhPerson; },
      opts: [['', 'bh.gdb.0']].concat([20, 30, 40, 50, 60, 70, 80, 90, 100].map(function (g) { return [String(g), function () { return t('bh.gdb.n', { n: g }); }]; }), [['H', 'bh.gdb.H'], ['antrag', 'bh.gdb.antrag']]) },
    { id: 'blind', b: 'gesund', art: 'wahl', q: 'sf.q.blind', wenn: function (s) { return !!s.bhPerson; }, opts: [['', 'bh.blind.0'], ['blind', 'bh.blind.blind'], ['hoch', 'bh.blind.hoch']] },
    { id: 'bhMehr', b: 'gesund', art: 'mehr', q: 'sf.q.bhMehr', wenn: function (s) { return !!s.bhPerson; },
      felder: [['mzG', 'cb.mzG'], ['mzGl', 'cb.mzGl'], ['bhSelbst', 'cb.bhSelbst', function (s) { return s.bhPerson === 'erwVor25'; }], ['wfbm', 'cb.wfbm'], ['teilhabe', 'cb.teilhabe']] },
    { id: 'bhWeitere', b: 'gesund', art: 'wahl', q: 'sf.q.bhWeitere', h: 'sf.h.bhWeitere', klein: true, wenn: function (s) { return !!s.bhPerson; }, opts: [['', 'bhWeitere.0'], ['1', '1'], ['2', '2'], ['3', '3']] },
    { id: 'emStd', b: 'gesund', art: 'wahl', q: 'sf.q.emStd', opts: [['', 'bh.em.0'], ['unter3', 'bh.em.unter3'], ['3bis6', 'bh.em.3bis6'], ['unklar', 'bh.em.unklar']] },
    { id: 'em5', b: 'gesund', art: 'wahl', q: 'sf.q.em5', h: 'sf.h.em5', opts: JN, wenn: function (s) { return s.emStd === 'unter3' || s.emStd === '3bis6'; } },
    { id: 'ernaehrung', b: 'gesund', art: 'wahl', q: 'sf.q.ernaehrung', h: 'sf.h.ernaehrung', opts: JN },

    { id: 'arbeitSit', b: 'arbeit', art: 'wahl', q: 'sf.q.arbeitSit', opts: [['', 'arbeit.0'], ['arbeitslos', 'arbeit.arbeitslos'], ['krank', 'arbeit.krank']] },
    { id: 'algZeit', b: 'arbeit', art: 'wahl', q: 'sf.q.algZeit', h: 'sf.h.algZeit', opts: JN, wenn: function (s) { return s.arbeitSit === 'arbeitslos'; } },
    { id: 'algMonate', b: 'arbeit', art: 'wahl', q: 'sf.q.algMonate', klein: true, wenn: function (s) { return s.arbeitSit === 'arbeitslos'; },
      opts: [['', 'algMon.0']].concat([[12, 15], [16, 19], [20, 23], [24, 29], [30, 35], [36, 47]].map(function (x) { return [String(x[0]), function () { return t('algMon.n', { a: x[0], b: x[1] }); }]; }), [['48', 'algMon.48']]) },
    { id: 'krankWochen', b: 'arbeit', art: 'wahl', q: 'sf.q.krankWochen', wenn: function (s) { return s.arbeitSit === 'krank'; }, opts: [['unter6', 'krankW.unter6'], ['laeuft', 'krankW.laeuft'], ['ende', 'krankW.ende']] },
    { id: 'lohnVorher', b: 'arbeit', art: 'zahl', euro: true, skip: 'sf.weissNicht', q: 'sf.q.lohnVorher', h: 'sf.h.lohnVorher', wenn: function (s) { return !!s.arbeitSit; } },

    { id: 'ausbildung', b: 'ausb', art: 'wahl', q: 'sf.q.ausbildung', h: 'sf.h.ausbildung', opts: [['', 'ausb.0'], ['kind', 'ausb.kind'], ['kindBetrieb', 'ausb.kindBetrieb'], ['ich', 'ausb.ich']] },
    { id: 'babMehr', b: 'ausb', art: 'mehr', q: 'sf.q.babMehr', h: 'sf.h.babMehr', wenn: function (s) { return s.ausbildung === 'ich'; }, felder: [['babBetrieb', 'cb.babBetrieb'], ['babWohnt', 'cb.babWohnt']] },

    { id: 'wohnart', b: 'wohnen', art: 'wahl', q: 'sf.q.wohnart', opts: [['', 'wohnart.miete'], ['eigentum', 'wohnart.eigen']] },
    { id: 'miete', b: 'wohnen', art: 'zahl', euro: true, skip: 'sf.weissNicht', q: function (s) { return s.wohnart === 'eigentum' ? 'sf.q.miete.eigen' : 'sf.q.miete'; }, h: function (s) { return s.wohnart === 'eigentum' ? 'sf.h.miete.eigen' : 'sf.h.miete'; } },
    { id: 'heizkosten', b: 'wohnen', art: 'zahl', euro: true, skip: 'sf.weissNicht', q: 'sf.q.heiz', h: 'sf.h.heiz' },
    { id: 'warmwasser', b: 'wohnen', art: 'wahl', q: 'sf.q.warmwasser', opts: JN },
    { id: 'hhAndere', b: 'wohnen', art: 'wahl', q: 'sf.q.hhAndere', h: 'sf.h.hhAndere', opts: [['', 'hh.0'], ['wg', 'hh.wg'], ['verwandte', 'hh.verwandte']] },
    { id: 'plz', b: 'wohnen', art: 'zahl', ziffern: 5, skip: 'sf.weissNicht', q: 'sf.q.plz', h: 'sf.h.plz', wenn: function () { return !!(ctx.plzDa && ctx.plzDa()); } },
    // Stufe aus der PLZ ist nur eine Vorbelegung (Rechtsprüfung 21.11.2026, Frage 4): Ort und Stufe zeigen, Nutzer bestätigt oder wählt selbst
    { id: 'plzOrt', b: 'wohnen', art: 'wahl', q: 'sf.q.plzOrt', h: 'sf.h.plzOrt', opts: [['ja', 'sf.a.ortJa'], ['nein', 'sf.a.ortNein']],
      info: function (s) { var r = plzInfo(s); return r && r.sure ? t('plz.wohnort', { ort: r.candidates[0].label, stufe: ctx.roman(r.stufe) }) : ''; },
      wenn: function (s) { var r = plzInfo(s); return !!(r && r.sure && r.stufe); } },
    { id: 'plzPick', b: 'wohnen', art: 'wahl', q: 'sf.q.plzPick', deutsch: true,
      wenn: function (s) { var r = plzInfo(s); return !!(r && !r.sure && r.candidates.some(function (c) { return c.stufe; })); },
      opts: function (s) {
        var r = plzInfo(s); if (!r) return [];
        return r.candidates.map(function (c) {
          var label = !c.stufe ? t('plz.candNone', { label: c.label, kreis: c.kreis }) : (c.kreis ? t('plz.cand', { label: c.label, kreis: c.kreis, stufe: ctx.roman(c.stufe) }) : t('plz.cand0', { label: c.label, stufe: ctx.roman(c.stufe) }));
          return [c.label + '|' + c.kreis + '|' + c.stufe, function () { return label; }, c];
        });
      } },
    { id: 'bundesland', b: 'wohnen', art: 'wahl', q: 'sf.q.bundesland', h: 'sf.h.bundesland', klein: true, deutsch: true,
      wenn: function (s) { var r = plzInfo(s); return !(r && r.bl); },
      opts: function () { return [['', 'bl.unbekannt']].concat(ctx.laender().map(function (x) { return [x[0], function () { return x[1]; }]; })); } },
    { id: 'mietstufe', b: 'wohnen', art: 'wahl', q: 'sf.q.mietstufe', h: 'sf.h.mietstufe', klein: true,
      wenn: function (s) { var r = plzInfo(s); if (!r) return true; if (r.sure) return s.plzOrt === 'nein'; var c = r.candidates.filter(function (x) { return x.label + '|' + x.kreis + '|' + x.stufe === s.plzPick; })[0]; return !(c && c.stufe); },
      opts: [['', 'stufe.unbekannt']].concat([1, 2, 3, 4, 5, 6, 7].map(function (n) { return [String(n), function () { return t('stufe.n', { n: ctx.roman(n) }); }]; })) }
  ].concat(ekFragen(1), ekFragen(2), [
    { id: 'zusatzRente', b: 'geld', art: 'zahl', euro: true, skip: 'sf.keine', q: 'sf.q.zusatzRente', h: 'sf.h.zusatzRente', wenn: hatRente },
    { id: 'grundrente33', b: 'geld', art: 'wahl', q: 'sf.q.grundrente33', h: 'sf.h.grundrente33', opts: JN, wenn: hatRente },
    { id: 'wfbmEssen', b: 'geld', art: 'wahl', q: 'sf.q.wfbmEssen', opts: JN, wenn: hatWfbm },
    { id: 'unterhalt', b: 'geld', art: 'zahl', euro: true, skip: 'sf.nichts0', q: 'sf.q.unterhalt', h: 'sf.h.unterhalt', wenn: function (s) { return s.kids > 0; } },
    { id: 'waisen', b: 'geld', art: 'zahl', euro: true, skip: 'sf.nichts0', q: 'sf.q.waisen', h: 'sf.h.waisen', wenn: function (s) { return s.kids + s.young > 0; } },
    { id: 'kindEink', b: 'geld', art: 'zahl', euro: true, skip: 'sf.nichts0', q: 'sf.q.kindEink', h: 'sf.h.kindEink', wenn: function (s) { return s.kids + s.young > 0; } },
    { id: 'uzBetrag', b: 'geld', art: 'zahl', euro: true, skip: 'sf.nichts0', q: 'sf.q.uzBetrag', h: 'sf.h.uzBetrag' },
    { id: 'uzAn', b: 'geld', art: 'wahl', q: 'sf.q.uzAn', wenn: function (s) { return num(s.uzBetrag) > 0; }, opts: [['k1', 'uz.an.k1'], ['k2', 'uz.an.k2'], ['k3', 'uz.an.k3'], ['ex', 'uz.an.ex'], ['exk', 'uz.an.exk']] },
    { id: 'uzTitel', b: 'geld', art: 'wahl', q: 'sf.q.uzTitel', opts: JN, wenn: function (s) { return num(s.uzBetrag) > 0; } },
    { id: 'vermoegen', b: 'geld', art: 'zahl', euro: true, skip: 'sf.weissNicht', q: 'sf.q.vermoegen', h: 'sf.h.vermoegen' },
    { id: 'autoWert', b: 'geld', art: 'zahl', euro: true, skip: 'sf.keinAuto', q: 'sf.q.autoWert' },
    { id: 'autoBraucht', b: 'geld', art: 'wahl', q: 'sf.q.autoBraucht', opts: JN, wenn: function (s) { return num(s.autoWert) > 0; } },
    { id: 'bezug', b: 'bezug', art: 'mehr', q: 'sf.q.bezug', h: 'sf.h.bezug', bezug: true,
      felder: [['grundsicherungsgeld', 'bz.gg'], ['sozialamt', 'bz.sozial'], ['wohngeld', 'bz.wg'], ['kiz', 'bz.kiz'], ['kindergeld', 'bz.kg']] }
  ]);

  function fr(id) { for (var i = 0; i < FRAGEN.length; i++) if (FRAGEN[i].id === id) return FRAGEN[i]; return null; }
  function aktiv(f, s) { if (ctx && ctx.frageAus && ctx.frageAus(f.id)) return false; return !f.wenn || !!f.wenn(s); } // frageAus: Variante ohne diese Frage
  function liste() { var s = S(); return FRAGEN.filter(function (f) { return aktiv(f, s); }); }
  function wert(f, s, x) { return typeof x === 'function' ? x(s) : x; }
  function opts(f, s) { return typeof f.opts === 'function' ? f.opts(s) : f.opts; }
  function label(o) { return typeof o[1] === 'function' ? o[1]() : /^[a-zA-Z]/.test(o[1]) && /\./.test(o[1]) ? t(o[1]) : o[1]; }
  function felder(f, s) { return f.felder.filter(function (x) { return !x[2] || x[2](s); }); }
  function feldWert(f, s, k) { if (f.get) return !!f.get(s, k); return f.bezug ? !!(s.bezug && s.bezug[k]) : !!s[k]; } // f.get/f.set: eigene Ablage (Sammelfrage der Pflege-Variante)

  // ---------- Werte setzen (wie die Bedienelemente des Formulars in app.js bind()) ----------
  function setze(f, v) {
    var s = S();
    if (f.id === 'adults') {
      s.adults = Number(v);
      while (s.adults + s.kids + s.young > 12) { if (s.young > 0) s.young--; else s.kids--; }
      s.kidsU6 = Math.min(s.kidsU6 || 0, s.kids); s.kids14 = Math.min(s.kids14 || 0, s.kids - s.kidsU6);
    } else if (f.art === 'zaehler') {
      s[f.id] = Math.max(0, Math.min(f.max(s), Number(v) || 0));
      if (f.id === 'kids' || f.id === 'kidsU6') { s.kidsU6 = Math.min(s.kidsU6 || 0, s.kids); s.kids14 = Math.min(s.kids14 || 0, s.kids - s.kidsU6); }
      if (f.id === 'kids14') s.kidsAlter = true; // wie im Formular: Frage „14 bis 17“ beantwortet
    } else if (f.id === 'plz') { s.plz = v; s.plzPick = ''; s.plzOrt = ''; }
    else if (f.id === 'plzOrt') {
      s.plzOrt = v;
      var rp = plzInfo(s); if (v === 'ja' && rp && rp.sure && rp.stufe) s.mietstufe = String(rp.stufe); // bestätigt: Stufe aus der Liste
    }
    else if (f.id === 'plzPick') {
      s.plzPick = v;
      var c = (opts(f, s).filter(function (o) { return o[0] === v; })[0] || [])[2];
      if (c && c.stufe) s.mietstufe = String(c.stufe);
    } else s[f.id] = v;
    ja[f.id] = true;
    ctx.geaendert(f.id);
  }

  // ---------- Navigation ----------
  function naechste(id) {
    var l = liste(), i = -1;
    for (var k = 0; k < l.length; k++) if (l[k].id === id) i = k;
    if (i < 0) { var all = FRAGEN.map(function (f) { return f.id; }), p = all.indexOf(id); l = l.filter(function (f) { return all.indexOf(f.id) > p; }); return l[0] ? l[0].id : 'uebersicht'; }
    return l[i + 1] ? l[i + 1].id : 'uebersicht';
  }
  function vorige(id) {
    var l = liste();
    if (id === 'uebersicht' || id === 'ergebnis') return l.length ? l[l.length - 1].id : '';
    var all = FRAGEN.map(function (f) { return f.id; }), p = all.indexOf(id);
    var v = l.filter(function (f) { return all.indexOf(f.id) < p; });
    return v.length ? v[v.length - 1].id : '';
  }
  function ersteOffene() { var l = liste().filter(function (f) { return !ja[f.id]; }); return l[0] ? l[0].id : ''; }
  function weiter(id) {
    warnOk = '';
    if (zurUeb) { var o = ersteOffene(); pos = o || 'uebersicht'; if (!o) zurUeb = false; }
    else pos = naechste(id);
    ctx.speichern(); render(true);
  }
  function geheZu(p, fokus) { pos = p; warnOk = ''; ctx.speichern(); render(fokus !== false); }

  // ---------- Darstellung ----------
  function knopf(cls, txt, attrs) {
    return '<button type="button" class="' + cls + '"' + (attrs || '') + '>' + txt + '</button>';
  }
  // Leiste oben in „Deine Angaben“: Wahl des Weges (immer sichtbar, unabhängig von „Einfache Sprache“) und „Angaben löschen“
  // (die Rückfrage dazu baut die App, src/app.js). Auf der Auswahlseite nur „Angaben löschen“ (die Karten sind die Wahl).
  function leiste() {
    var h = '<div class="sf-leiste" id="sfLeiste">';
    if (weg) {
      h += '<div class="sf-umschalter" role="group" aria-label="' + esc(t('sf.wahl.h')) + '">' +
        knopf('chip', esc(t('sf.wahl.schritt')), ' id="sfWegSchritt" aria-pressed="' + (weg === 'schritt') + '"') +
        knopf('chip', esc(t('sf.wahl.alles')), ' id="sfWegAlles" aria-pressed="' + (weg === 'alles') + '"') + '</div>' +
        // Kurzer Check für Menschen mit Behinderung: dritte Wahl oben (Klick behandelt src/app.js über die Kennung einfachBtn)
        '<p class="es-link sf-kurz">' + knopf('linkbtn', '<span data-t="einfach.btn">' + esc(t('einfach.btn')) + '</span>', ' id="einfachBtn" aria-pressed="false"') + '</p>';
    }
    // Startwahl ohne Angaben: nichts zu löschen (UX-Audit A, Aufgabe 11); die App blendet den Knopf ein, sobald es Angaben gibt (render in app.js)
    h += knopf('linkbtn sf-loeschen', esc(t('l.link')), ' id="clearLink"' + (!weg && !ctx.begonnen() ? ' hidden' : ''));
    // ctx.leisteZu (Pflege-Variante): Wegwahl, Kurzer Check und „Angaben löschen“ zugeklappt unter „Weitere Möglichkeiten“ (weniger auf einmal)
    if (ctx.leisteZu && weg) h = h.replace('<div class="sf-leiste" id="sfLeiste">', '<div class="sf-leiste sf-leiste-zu" id="sfLeiste"><details class="mehr sf-mehr"><summary>' + esc(t('sux.mehr')) + '</summary><div class="sf-mehr-innen">') + '</div></details>';
    return h + '</div>';
  }
  function leisteEinsetzen() {
    var k = box.querySelector('.sf-kopf');
    if (k) k.insertAdjacentHTML('afterend', leiste()); else box.insertAdjacentHTML('afterbegin', leiste());
    var a = box.querySelector('#sfWegSchritt'), b = box.querySelector('#sfWegAlles');
    if (a) a.addEventListener('click', function () { if (weg !== 'schritt') setzeWeg('schritt', true); });
    if (b) b.addEventListener('click', function () { if (weg !== 'alles') setzeWeg('alles', true); });
  }
  // Zurück-Knopf im gemeinsamen Aussehen (src/navigation.js, Textknopf „← Zurück“ oben links); eigener Klick: eine Frage zurück
  function zurKnopf(attrs) {
    return knopf('linkbtn pa-zur', '<span class="nav-pfeil" aria-hidden="true">←</span> <span data-t="nav.zurueck">' + esc(t('nav.zurueck')) + '</span>', ' id="sfZurueck"' + (attrs || ''));
  }
  // anteil (0–1): dünner Balken unter der Zeile, wie im Kurzen Check und in der Pflege-Einschätzung
  function kopf(zurueckZu, bereich, anteil) {
    return '<div class="es-top pa-kopf sf-kopf"><div class="pa-zeile nav-kopf">' +
      (zurueckZu ? zurKnopf(' data-zu="' + esc(zurueckZu) + '"') : '<span></span>') +
      (bereich ? '<span class="es-prog sf-bereich">' + esc(bereich) + '</span>' : '') + '</div>' +
      (anteil != null ? '<div class="es-bar" aria-hidden="true"><span style="width:' + Math.round(100 * anteil) + '%"></span></div>' : '') + '</div>';
  }
  // Fortschritt nach Abschnitten (Haushalt, Gesundheit, …): die Zahl der Fragen schwankt je nach Antworten, die Abschnitte kaum
  // (GOV.UK: kurz „Teil 2 von 5“). Gezählt werden nur Abschnitte mit mindestens einer Frage für diesen Fall.
  function teil(f) {
    var bs = [];
    liste().forEach(function (x) { if (bs.indexOf(x.b) < 0) bs.push(x.b); });
    var n = bs.indexOf(f.b) + 1;
    return { n: n, m: bs.length, anteil: bs.length > 1 ? (n - 1) / bs.length : 0 };
  }
  // Antwort mit Kästchen (Mehrfachauswahl); der Haken erscheint über CSS bei .an
  function mehrInhalt(txt) { return '<span class="es-kasten" aria-hidden="true"></span><span>' + esc(txt) + '</span>'; }
  function hilfe(key) {
    if (!key) return '';
    return '<details class="sf-hilfe"><summary>' + esc(t('sf.warum')) + '</summary><p>' + esc(t(key)) + '</p></details>';
  }
  function anzeigeWert(f, s) {
    if (f.art === 'mehr') { var an = felder(f, s).filter(function (x) { return feldWert(f, s, x[0]); }); return an.length ? an.map(function (x) { return t(x[1]); }).join(' · ') : t('sf.nichts'); }
    if (f.art === 'zaehler') return String(s[f.id] || 0);
    if (f.info && f.info(s)) return f.info(s) + (s[f.id] === 'nein' ? ' – ' + t('sf.a.ortNein') : ''); // Wohnort und Mietenstufe in „Deine Angaben“
    var v = s[f.id];
    if (f.art === 'zahl') return v === '' || v == null ? t('sf.leer') : (f.euro ? ctx.euro(Number(v)) : String(v));
    var o = opts(f, s).filter(function (x) { return x[0] === v || String(x[0]) === String(v); })[0];
    return o ? label(o) : t('sf.leer');
  }

  function renderWahl() {
    box.innerHTML = '<h2 class="es-q" id="sfFrage" tabindex="-1">' + esc(t('sf.wahl.h')) + '</h2>' +
      '<p class="es-h">' + esc(t('sf.wahl.hint')) + '</p><div class="uk-raster sf-wahl">' +
      knopf('uk-karte sf-w1', '<span class="weg-sym" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 19h4v-4h4v-4h4V7h3"/></svg></span><span class="weg-txt"><b>' + esc(t('sf.wahl.schritt')) + '</b><span>' + esc(t('sf.wahl.schritt.t')) + '</span></span>', ' id="sfWahlSchritt"') +
      knopf('uk-karte sf-w2', '<span class="weg-sym" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></svg></span><span class="weg-txt"><b>' + esc(t('sf.wahl.alles')) + '</b><span>' + esc(t('sf.wahl.alles.t')) + '</span></span>', ' id="sfWahlAlles"') +
      // dritte Wahl: Kurzer Check für Menschen mit Behinderung (gleiche Logik wie bisher, Klick in src/app.js)
      knopf('uk-karte sf-w3', '<span class="weg-sym" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="2"/><path d="M12 7v6h5l2 6"/><path d="M9 10a6 6 0 1 0 6.5 9"/></svg></span><span class="weg-txt"><b data-t="einfach.btn">' + esc(t('einfach.btn')) + '</b><span>' + esc(t('sf.wahl.kurz.t')) + '</span></span>', ' id="einfachBtn" aria-pressed="false"') +
      '</div>';
    box.querySelector('#sfWahlSchritt').addEventListener('click', function () { setzeWeg('schritt', true); });
    box.querySelector('#sfWahlAlles').addEventListener('click', function () { setzeWeg('alles', true); });
  }

  function renderFrage(f) {
    var s = S();
    var tl = teil(f);
    var bereich = (tl.n ? t('sf.teil', { n: tl.n, m: tl.m }) + ' · ' : '') + t('sf.b.' + f.b) + (f.wer && f.wer(s) ? ' · ' + f.wer(s) : '');
    var h = kopf(vorige(f.id) || (zurUeb ? 'uebersicht' : ''), bereich, tl.anteil) +
      '<h2 class="es-q" id="sfFrage" tabindex="-1">' + esc(t(wert(f, s, f.q))) + '</h2>' +
      (f.info && f.info(s) ? '<p class="es-h sf-info"><strong>' + esc(f.info(s)) + '</strong></p>' : '') + hilfe(wert(f, s, f.h));
    if (f.art === 'wahl') {
      var o = opts(f, s), v = s[f.id];
      h += '<div class="es-wahl' + (f.klein || o.length > 5 ? ' es-klein' : '') + '" role="group" aria-labelledby="sfFrage"' + (f.deutsch ? ' lang="de"' : '') + '>' + o.map(function (x, i) {
        var an = ja[f.id] && String(x[0]) === String(v);
        return knopf('es-btn' + (an ? ' an' : ''), '<span>' + esc(label(x)) + '</span>', ' data-i="' + i + '" aria-pressed="' + (an ? 'true' : 'false') + '"');
      }).join('') + '</div>';
      if (ja[f.id]) h += '<div class="es-nav1">' + knopf('es-btn es-weiter', esc(t('sf.weiter')), ' id="sfWeiter"') + '</div>';
    } else if (f.art === 'mehr') {
      // Mehrfachauswahl sichtbar anders als Einfachauswahl (GOV.UK „Checkboxes“): Kästchen mit Haken, Zeile „Mehrere Antworten möglich“,
      // „Nichts davon“ als letzte Antwort nach „oder“ (springt weiter), dann „Weiter“
      var nichts = ja[f.id] && !felder(f, s).some(function (x) { return feldWert(f, s, x[0]); });
      h += '<p class="es-h es-mehrere" id="sfMehrere">' + esc(t('sf.mehrere')) + '</p>' +
        '<div class="es-wahl es-mehr" role="group" aria-labelledby="sfFrage" aria-describedby="sfMehrere">' + felder(f, s).map(function (x) {
          var an = feldWert(f, s, x[0]);
          return knopf('es-btn' + (an ? ' an' : ''), mehrInhalt(t(x[1])), ' role="checkbox" data-k="' + esc(x[0]) + '" aria-checked="' + an + '"');
        }).join('') + '<p class="es-oder" aria-hidden="true"><span>' + esc(t('sf.oder')) + '</span></p>' +
        knopf('es-btn es-nichts' + (nichts ? ' an' : ''), mehrInhalt(t('sf.nichts')), ' role="checkbox" id="sfNichts" aria-checked="' + !!nichts + '"') +
        '</div><div class="es-nav1">' + knopf('es-btn es-weiter', esc(t('sf.weiter')), ' id="sfWeiter"') + '</div>';
    } else if (f.art === 'zaehler') {
      h += '<div class="sf-zaehler" role="group" aria-labelledby="sfFrage" dir="ltr">' + knopf('es-btn', '−', ' id="sfMinus" aria-label="' + esc(t('sf.weniger')) + '"') +
        '<output id="sfZahl" aria-live="polite">' + (s[f.id] || 0) + '</output>' + knopf('es-btn', '+', ' id="sfPlus" aria-label="' + esc(t('sf.mehr')) + '"') + '</div>' +
        '<div class="es-nav1">' + knopf('es-btn es-weiter', esc(t('sf.weiter')), ' id="sfWeiter"') + '</div>';
    } else if (f.art === 'zahl') {
      var vz = s[f.id] == null || s[f.id] === '' ? '' : String(s[f.id]).replace('.', ',');
      h += '<div class="es-zahl"><input id="sfIn" type="text" inputmode="' + (f.euro ? 'decimal' : 'numeric') + '" autocomplete="off" aria-labelledby="sfFrage" value="' + esc(vz) + '"' + (f.ziffern ? ' maxlength="' + f.ziffern + '"' : '') + '>' + (f.euro ? '<span aria-hidden="true">€</span>' : '') + '</div>' +
        '<p class="warn" id="sfWarn" role="status" hidden></p><div class="es-nav1">' + knopf('es-btn es-weiter', esc(t('sf.weiter')), ' id="sfWeiter"') +
        (f.skip ? knopf('es-btn es-skip', esc(t(f.skip)), ' id="sfSkip"') : '') + '</div>';
    }
    box.innerHTML = h;
    binden(f);
  }

  function binden(f) {
    var s = S(), q = function (sel) { return box.querySelector(sel); };
    var zb = q('#sfZurueck'); if (zb) zb.addEventListener('click', function () { geheZu(zb.getAttribute('data-zu')); });
    if (f.art === 'wahl') {
      var o = opts(f, s), weg2 = false;
      box.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (weg2) return; weg2 = true;
          box.querySelectorAll('[data-i]').forEach(function (x) { x.classList.toggle('an', x === b); x.setAttribute('aria-pressed', String(x === b)); });
          setze(f, o[Number(b.getAttribute('data-i'))][0]);
          setTimeout(function () { weiter(f.id); }, VERZ);
        });
      });
      if (q('#sfWeiter')) q('#sfWeiter').addEventListener('click', function () { weiter(f.id); });
    } else if (f.art === 'mehr') {
      box.querySelectorAll('[data-k]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-k'), s2 = S(), an;
          if (f.set) { an = !feldWert(f, s2, k); f.set(s2, k, an); } else if (f.bezug) { s2.bezug = s2.bezug || {}; an = s2.bezug[k] = !s2.bezug[k]; } else an = s2[k] = !s2[k];
          b.classList.toggle('an', an); b.setAttribute('aria-checked', String(an));
          var n = q('#sfNichts'); n.classList.remove('an'); n.setAttribute('aria-checked', 'false');
          ja[f.id] = true; ctx.geaendert(f.id);
        });
      });
      q('#sfWeiter').addEventListener('click', function () { ja[f.id] = true; ctx.speichern(); weiter(f.id); });
      q('#sfNichts').addEventListener('click', function () {
        var s2 = S();
        f.felder.forEach(function (x) { if (f.set) f.set(s2, x[0], false); else if (f.bezug) { s2.bezug = s2.bezug || {}; s2.bezug[x[0]] = false; } else s2[x[0]] = false; });
        box.querySelectorAll('[data-k]').forEach(function (x) { x.classList.remove('an'); x.setAttribute('aria-checked', 'false'); });
        var n = q('#sfNichts'); n.classList.add('an'); n.setAttribute('aria-checked', 'true');
        ja[f.id] = true; ctx.geaendert(f.id); setTimeout(function () { weiter(f.id); }, VERZ);
      });
    } else if (f.art === 'zaehler') {
      var zeig = function () { q('#sfZahl').textContent = S()[f.id] || 0; };
      q('#sfMinus').addEventListener('click', function () { setze(f, (S()[f.id] || 0) - 1); zeig(); });
      q('#sfPlus').addEventListener('click', function () { setze(f, (S()[f.id] || 0) + 1); zeig(); });
      q('#sfWeiter').addEventListener('click', function () { setze(f, S()[f.id] || 0); weiter(f.id); });
    } else if (f.art === 'zahl') {
      var inp = q('#sfIn');
      var ok = function () {
        var raw = inp.value.trim(), v, w = q('#sfWarn');
        // Meldung am Feld (GOV.UK Error message): echte Fehler in Fehlerfarbe und mit aria-invalid; „ungewöhnlich hoch“ nur als Hinweis
        var melde = function (txt, echt) { w.textContent = txt; w.hidden = false; w.classList.toggle('fehler', !!echt); inp.setAttribute('aria-describedby', 'sfWarn'); if (echt) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); inp.focus(); };
        if (raw === '') { melde(t(f.ziffern === 4 ? 'sf.warn.geb' : f.ziffern === 5 ? 'sf.warn.plz' : 'sf.warn.zahl'), true); return; }
        if (f.ziffern) {
          var d = raw.replace(/\D/g, '');
          var gut = d.length === f.ziffern && (f.ziffern !== 4 || (Number(d) >= 1900 && Number(d) <= new Date().getFullYear()));
          if (!gut) { melde(t(f.ziffern === 4 ? 'sf.warn.geb' : 'sf.warn.plz'), true); return; }
          v = f.ziffern === 4 ? Number(d) : d;
        } else {
          v = ctx.parse(raw);
          if (v === '' || !(v >= 0)) { melde(t('sf.warn.zahl'), true); return; }
          // Ungewöhnlich hoch (z. B. 45000 statt 450): einmal nachfragen; beim zweiten Tippen auf Weiter gilt die Zahl
          var grenze = f.id === 'vermoegen' || f.id === 'autoWert' ? 1000000 : 15000;
          if (v > grenze && warnOk !== f.id + ':' + v) { warnOk = f.id + ':' + v; melde(t('sf.warn.hoch', { v: ctx.euro(v) }), false); return; }
        }
        // Zusätzliche Plausibilitätshinweise (ctx.plausibel, Pflege-Variante): freundlich, einmal; beim zweiten „Weiter“ gilt die Eingabe
        var pl = ctx.plausibel ? ctx.plausibel(f, v, S()) : '';
        if (pl && warnOk !== 'p:' + f.id + ':' + v) { warnOk = 'p:' + f.id + ':' + v; melde(pl, false); return; }
        setze(f, v); weiter(f.id);
      };
      q('#sfWeiter').addEventListener('click', ok);
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ok(); });
      if (q('#sfSkip')) q('#sfSkip').addEventListener('click', function () { setze(f, ''); weiter(f.id); });
    }
  }

  // Antwort ohne Inhalt: „Nein“, 0, leer, „Nichts davon“ oder die erste Auswahl mit leerem Wert („keine“, „nein“)
  function leer(f, s) {
    if (f.art === 'mehr') return !felder(f, s).some(function (x) { return feldWert(f, s, x[0]); });
    var v = s[f.id];
    if (f.id === 'adults' || f.id === 'plzOrt') return false;
    return v === '' || v == null || v === false || v === 0 || v === '0';
  }
  function renderUebersicht() {
    var s = S(), l = liste(), h = kopf(vorige('uebersicht'), '') +
      '<h2 class="es-q" id="sfFrage" tabindex="-1">' + esc(t('sf.ueb.h')) + '</h2><p class="es-h">' + esc(t('sf.ueb.t')) + '</p>';
    var bereiche = [];
    l.forEach(function (f) { if (bereiche.indexOf(f.b) < 0) bereiche.push(f.b); });
    // Je Abschnitt eine Karte; Antworten mit „Nein“, 0 oder ohne Angabe zusammen zugeklappt (UX-Audit A, Aufgabe 6), „ändern“ bleibt je Zeile
    var zeile = function (f) {
      var wer = f.wer && f.wer(s) ? f.wer(s) + ': ' : '';
      return '<div class="sf-zeile"><dt>' + esc(wer + t(wert(f, s, f.q))) + '</dt><dd' + (f.deutsch ? ' lang="de"' : '') + '>' + esc(ja[f.id] ? anzeigeWert(f, s) : t('sf.offen')) + '</dd><dd class="sf-aendern">' +
        knopf('linkbtn', esc(t(ja[f.id] ? 'sf.aendern' : 'sf.beantworten')) + '<span class="vh"> ' + esc(t(wert(f, s, f.q))) + '</span>', ' data-aendern="' + esc(f.id) + '"') + '</dd></div>';
    };
    bereiche.forEach(function (b) {
      var fs = l.filter(function (f) { return f.b === b; });
      var rest = fs.filter(function (f) { return ja[f.id] && leer(f, s); }), haupt = fs.filter(function (f) { return rest.indexOf(f) < 0; });
      h += '<section class="sf-ueb-karte"><h3 class="sf-ueb-b">' + esc(t('sf.b.' + b)) + '</h3>' + (haupt.length ? '<dl class="sf-ueb">' + haupt.map(zeile).join('') + '</dl>' : '') +
        (rest.length ? '<details class="mehr sf-ueb-rest"><summary>' + esc(t('sf.ueb.rest', { n: rest.length })) + '</summary><dl class="sf-ueb">' + rest.map(zeile).join('') + '</dl></details>' : '') + '</section>';
    });
    h += '<div class="es-nav1">' + knopf('es-btn es-weiter', esc(t('sf.zumErgebnis')), ' id="sfErgebnis"') + '</div>';
    box.innerHTML = h;
    var zb = box.querySelector('#sfZurueck'); if (zb) zb.addEventListener('click', function () { geheZu(zb.getAttribute('data-zu')); });
    box.querySelectorAll('[data-aendern]').forEach(function (b) { b.addEventListener('click', function () { zurUeb = true; geheZu(b.getAttribute('data-aendern')); }); });
    box.querySelector('#sfErgebnis').addEventListener('click', function () { geheZu('ergebnis'); });
  }

  function renderErgebnis() {
    box.innerHTML = '<div class="pa-kopf sf-kopf"><div class="pa-zeile nav-kopf">' + zurKnopf() + '</div></div>';
    box.querySelector('#sfZurueck').addEventListener('click', function () { geheZu('uebersicht'); });
  }

  // Zeichnen und Klassen an der App setzen: sf-an = Formular ausblenden, sf-erg = Ergebnis zeigen
  function render(fokus) {
    if (!box) return;
    var app = ctx.app(), kurz = ctx.kurzAn && ctx.kurzAn();
    var wahl = !weg, schritt = weg === 'schritt';
    app.classList.toggle('sf-an', !kurz && (wahl || schritt));
    app.classList.toggle('sf-erg', !kurz && schritt && pos === 'ergebnis');
    app.classList.remove('sf-frage'); // auf einer Frageseite (unten gesetzt): Übersetzungshinweis ausblenden (src/template.html)
    box.hidden = !!kurz;
    if (kurz) return;
    if (!ctx.begonnen()) { ja = {}; if (pos === 'uebersicht' || pos === 'ergebnis') pos = ''; }
    else if (!Object.keys(ja).length) liste().forEach(function (f) { ja[f.id] = true; }); // Angaben aus dem Formular (oder Beispiel): alle gezeigten Fragen gelten als beantwortet
    if (wahl) renderWahl();
    else if (!schritt) {
      box.innerHTML = ''; leisteEinsetzen();
      if (ctx.nachRender) ctx.nachRender();
      if (fokus) { var fk = ctx.formKopf(); if (fk) { fk.setAttribute('tabindex', '-1'); fk.focus({ preventScroll: true }); } }
      return;
    } else {
      if (pos !== 'uebersicht' && pos !== 'ergebnis') { var f = fr(pos); if (!f || !aktiv(f, S())) pos = ''; }
      if (!pos) pos = ersteOffene() || 'uebersicht';
      if (pos === 'uebersicht') renderUebersicht();
      else if (pos === 'ergebnis') renderErgebnis();
      else renderFrage(fr(pos));
      app.classList.toggle('sf-frage', pos !== 'uebersicht' && pos !== 'ergebnis');
    }
    leisteEinsetzen();
    // Frageseite: oben nur „Zurück“ und Fortschritt (UX-Audit A, Aufgabe 1). Wegwahl, Kurzer Check und „Angaben löschen“ stehen auf
    // der Startwahl, in „Deine Angaben“ und im Ergebnis; auf der Frage bleibt die Leiste im Dokument, aber verborgen.
    var lei = box.querySelector('#sfLeiste'); if (lei) lei.hidden = schritt && pos !== 'uebersicht' && pos !== 'ergebnis';
    if (fokus) {
      try { window.scrollTo(0, 0); } catch (e) {}
      var z = pos === 'ergebnis' && schritt ? ctx.ergebnisKopf() : box.querySelector('#sfFrage');
      if (z) { z.setAttribute('tabindex', '-1'); z.focus({ preventScroll: true }); }
    }
    if (ctx.nachRender) ctx.nachRender();
  }

  function setzeWeg(w, fokus) {
    weg = w === 'schritt' || w === 'alles' ? w : '';
    if (ctx.wegSpeichern) ctx.wegSpeichern(weg);
    render(false);
    if (fokus) {
      try { window.scrollTo(0, 0); } catch (e) {}
      var z = weg === 'alles' ? ctx.formKopf() : (pos === 'ergebnis' ? ctx.ergebnisKopf() : box.querySelector('#sfFrage'));
      if (z) { z.setAttribute('tabindex', '-1'); z.focus({ preventScroll: true }); }
    }
  }

  return {
    FRAGEN: FRAGEN,
    // ctx: t, state, begonnen(), geaendert(id), speichern(), app(), formKopf(), ergebnisKopf(), euro(v), parse(s), roman(n), plz(p), plzDa(), laender(), kurzAn(), wegSpeichern(w)
    // c.fragen(liste): eigene Fragenliste einer App-Variante (z. B. kürzerer Pfad in „SoLo Pflege“); ohne c.fragen gilt FRAGEN unverändert
    init: function (c, el) { ctx = c; box = el; if (c.verzoegerung != null) VERZ = c.verzoegerung; if (typeof c.fragen === 'function') FRAGEN = c.fragen(FRAGEN.slice()); },
    // gespeicherte Wahl des Weges (pro Gerät); ohne Wahl: im Beratungsmodus gleich „Alles auf einer Seite“
    wegLaden: function (w, beratung) { weg = w === 'schritt' || w === 'alles' ? w : (beratung ? 'alles' : ''); render(false); },
    weg: function () { return weg; },
    setzeWeg: setzeWeg,
    zeigen: function (fokus) { render(!!fokus); },
    render: function () { render(false); },
    // Stand des Ablaufs (im Vorgang gespeichert, in lotse.state als Feld sf)
    stand: function () { return { pos: pos, ja: Object.keys(ja).filter(function (k) { return ja[k]; }) }; },
    laden: function (d) {
      ja = {}; pos = ''; zurUeb = false; warnOk = '';
      if (d && typeof d === 'object') {
        if (Array.isArray(d.ja)) d.ja.forEach(function (k) { if (typeof k === 'string' && fr(k)) ja[k] = true; });
        if (typeof d.pos === 'string' && (d.pos === 'uebersicht' || d.pos === 'ergebnis' || fr(d.pos))) pos = d.pos;
      }
      render(false);
    },
    // Tiefe für die Navigation (src/navigation.js): 0 auf der ersten Frage, je Frage eins mehr, Übersicht und Ergebnis danach
    tiefe: function () {
      if (weg !== 'schritt' || (ctx.kurzAn && ctx.kurzAn()) || !box || !box.querySelector('#sfZurueck')) return 0;
      var l = liste().map(function (f) { return f.id; });
      if (pos === 'uebersicht') return l.length + 1;
      if (pos === 'ergebnis') return l.length + 2;
      return Math.max(1, l.indexOf(pos));
    },
    pos: function () { return pos; },
    // Zurück-Taste (Android): einen Schritt zurück; false, wenn es im Ablauf nichts zurückzugehen gibt
    zurueck: function () {
      if (weg !== 'schritt' || (ctx.kurzAn && ctx.kurzAn())) return false;
      var b = box && box.querySelector('#sfZurueck'); if (!b) return false;
      b.click(); return true;
    }
  };
})();
if (typeof module !== 'undefined') module.exports = Schritte;
