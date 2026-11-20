// Haushaltsplan und Haushaltsbuch (Geld und Schulden → Mein Geld planen). Eigenes Modul: reine Rechnung (Node-Tests) und Oberfläche.
// Alles bleibt auf dem Gerät. Beträge intern in Cent (ganze Zahlen), damit keine Rundungsfehler entstehen.
// Gemeinsame Felder mit dem Leistungs-Check (Einkommen netto, Miete warm, Unterhalt für die Kinder) liegen nur im Check
// (eine Datenquelle). Der Plan liest und schreibt sie über ctx.daten() / ctx.setze(); vorhandene Werte nur nach Rückfrage.
var Haushalt = (function () {
  'use strict';

  // ---------- Kategorien (Plan und Haushaltsbuch) ----------
  var KAT = [
    ['miete', '<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>'],
    ['energie', '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
    ['handy', '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'],
    ['vers', '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>'],
    ['mobil', '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M4 11h16M8 20l1-4M16 20l-1-4"/>'],
    ['essen', '<path d="M5 8h14l-1.5 11a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z"/><path d="M9 8a3 3 0 0 1 6 0"/>'],
    ['kinder', '<circle cx="12" cy="7" r="3"/><path d="M7 21c0-4 2-7 5-7s5 3 5 7"/>'],
    ['raten', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['sonst', '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>']
  ];
  var KAT_IDS = KAT.map(function (k) { return k[0]; });

  // ---------- Regelbedarf zur Orientierung ----------
  // § 5 Abs. 1 RBEG (Regelbedarfs-Ermittlungsgesetz 2021), regelbedarfsrelevante Verbrauchsausgaben der Einpersonenhaushalte
  // (EVS 2018) je Abteilung, Summe § 5 Abs. 2: 434,96 €. Quelle: gesetze-im-internet.de/rbeg_2021/__5.html, abgerufen 20.11.2026.
  // Die Fortschreibung (§ 28a SGB XII) ändert alle Abteilungen mit demselben Satz, die Anteile bleiben gleich.
  var RBEG5 = { summe: 434.96, abt: { essen: 150.93, energie: 36.87, handy: 38.89, mobil: 39.01 } };
  function regelbedarfAnteile(stufe1) {
    return ['essen', 'energie', 'handy', 'mobil'].map(function (k) {
      var anteil = RBEG5.abt[k] / RBEG5.summe;
      return { k: k, prozent: Math.round(anteil * 100), euro: Math.round(anteil * stufe1) };
    });
  }

  // ---------- Beträge ----------
  // Eingabe wie im Leistungs-Check (Fmt.parse): „1.234,50“, „12,5“, „950.50“. Ergebnis in Cent oder null.
  function zuCent(v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
    var F = typeof Fmt !== 'undefined' ? Fmt : require('./fmt.js');
    var n = F.parse(v);
    return n === '' ? null : Math.round(n * 100);
  }
  function euroGanz(cent) { return Math.round((cent || 0) / 100); } // „etwa … €“: auf ganze Euro gerundet
  function summe(liste) { return liste.reduce(function (a, c) { return a + (c > 0 ? c : 0); }, 0); }

  // Plan: Einnahmen (Liste in Cent) und feste Ausgaben (Objekt Kategorie -> Cent); Ergebnis in Cent und gerundet
  function planRechnung(ein, aus) {
    var e = summe(ein), a = summe(KAT_IDS.map(function (k) { return aus[k] || 0; }));
    var rest = e - a;
    return { ein: e, aus: a, rest: rest, restEuro: euroGanz(rest), leer: e === 0 && a === 0,
      // Hinweis „Prüfe Leistungen“: weniger als ein Zehntel der Einnahmen übrig (nur ein Auslöser für den Hinweis, keine Grenze aus einem Gesetz)
      knapp: e > 0 && rest < e / 10 };
  }

  // ---------- Datum und Monat ----------
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  function isoTag(d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); }
  function monatVon(iso) { return String(iso).slice(0, 7); }
  function monatPlus(ym, n) {
    var j = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + n;
    j += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    return j + '-' + zwei(m + 1);
  }
  function tageImMonat(ym) { return new Date(+ym.slice(0, 4), +ym.slice(5, 7), 0).getDate(); }

  // ---------- Haushaltsbuch ----------
  // Eintrag: { id, d: 'JJJJ-MM-TT', c: Cent, k: Kategorie, n: Notiz, w: wiederkehrend (jeden Monat), bis: 'JJJJ-MM' (letzter Monat) }
  // Wiederkehrende Einträge erscheinen ab ihrem Monat in jedem Monat am selben Tag (kürzere Monate: letzter Tag).
  function monatsEintraege(buch, ym) {
    var out = [];
    (buch || []).forEach(function (e) {
      var start = monatVon(e.d);
      if (!e.w) { if (start === ym) out.push(e); return; }
      if (ym < start || (e.bis && ym > e.bis)) return;
      var tag = Math.min(+e.d.slice(8, 10), tageImMonat(ym));
      out.push(Object.assign({}, e, { d: ym + '-' + zwei(tag), kopie: ym !== start }));
    });
    return out.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
  }
  function nachKategorie(buch, ym) {
    var s = {}; KAT_IDS.forEach(function (k) { s[k] = 0; });
    monatsEintraege(buch, ym).forEach(function (e) { s[KAT_IDS.indexOf(e.k) >= 0 ? e.k : 'sonst'] += e.c; });
    return s;
  }
  // Monatsübersicht: Kategorien mit Betrag (absteigend), Vormonat, Summen
  function auswertung(buch, ym) {
    var jetzt = nachKategorie(buch, ym), vor = nachKategorie(buch, monatPlus(ym, -1));
    var zeilen = KAT_IDS.filter(function (k) { return jetzt[k] > 0 || vor[k] > 0; })
      .map(function (k) { return { k: k, c: jetzt[k], vor: vor[k], diff: jetzt[k] - vor[k] }; })
      .sort(function (a, b) { return b.c - a.c || KAT_IDS.indexOf(a.k) - KAT_IDS.indexOf(b.k); });
    return { zeilen: zeilen, summe: summe(KAT_IDS.map(function (k) { return jetzt[k]; })), vorSumme: summe(KAT_IDS.map(function (k) { return vor[k]; })) };
  }
  // Höchstens 3 Spartipps, zu den größten Posten des Monats (jede Kategorie hat einen belegten Tipp)
  function tipps(aw) { return aw.zeilen.filter(function (z) { return z.c > 0; }).slice(0, 3).map(function (z) { return z.k; }); }

  // ---------- Kassenzettel lesen (Text aus der Texterkennung) ----------
  var GESCHAEFTE = [
    ['ALDI', /\baldi\b/i, 'essen'], ['LIDL', /\blidl\b/i, 'essen'], ['REWE', /\brewe\b/i, 'essen'], ['EDEKA', /\bedeka\b|\be\s?center\b/i, 'essen'],
    ['PENNY', /\bpenny\b/i, 'essen'], ['Netto', /\bnetto\s+(marken|city|filiale|supermarkt)|netto-online|\bnetto\s*$/i, 'essen'], ['Kaufland', /\bkaufland\b/i, 'essen'],
    ['NORMA', /\bnorma\b/i, 'essen'], ['tegut', /\btegut\b/i, 'essen'], ['Globus', /\bglobus\b/i, 'essen'], ['Marktkauf', /\bmarktkauf\b/i, 'essen'],
    ['dm', /\bdm[- ]?(drogerie|markt)\b/i, 'sonst'], ['Rossmann', /\brossmann\b/i, 'sonst'],
    ['Aral', /\baral\b/i, 'mobil'], ['Shell', /\bshell\b/i, 'mobil'], ['Esso', /\besso\b/i, 'mobil'], ['JET', /\bjet\s+tankstelle|\bjet\b(?=.*tank)/i, 'mobil'],
    ['TotalEnergies', /totalenergies|total\s+tankstelle/i, 'mobil'], ['Deutsche Bahn', /deutsche\s+bahn|\bdb\s+(fernverkehr|regio|vertrieb)/i, 'mobil'],
    ['IKEA', /\bikea\b/i, 'sonst'], ['Action', /\baction\b/i, 'sonst'], ['TEDi', /\btedi\b/i, 'sonst'], ['KiK', /\bkik\b/i, 'sonst'], ['Deichmann', /\bdeichmann\b/i, 'sonst'],
    ['OBI', /\bobi\b/i, 'sonst'], ['Bauhaus', /\bbauhaus\b/i, 'sonst'], ['Hornbach', /\bhornbach\b/i, 'sonst'], ['toom', /\btoom\b/i, 'sonst'],
    ['MediaMarkt', /media\s?markt/i, 'sonst'], ['Saturn', /\bsaturn\b/i, 'sonst']
  ];
  var ART_WORTE = [[/b(ä|ae|a)ckerei|backhaus|metzgerei|fleischerei|supermarkt|lebensmittel|getr(ä|ae)nkemarkt|bio-?markt/i, 'essen'],
    [/tankstelle|kraftstoff|diesel|super\s?e\s?(5|10)/i, 'mobil'], [/apotheke|drogerie/i, 'sonst']];
  // Zahlen wie „12,34“, „1.234,56“, „12.34“, „12 ,34“ (Texterkennung setzt manchmal Leerzeichen)
  var BETRAG = /(\d{1,3}(?:[.\s]\d{3})+|\d{1,5})\s?[,.]\s?(\d{2})(?![\d])/g;
  function betraegeIn(zeile) {
    var out = [], m; BETRAG.lastIndex = 0;
    while ((m = BETRAG.exec(zeile))) out.push(Number(m[1].replace(/[.\s]/g, '')) * 100 + Number(m[2]));
    return out;
  }
  function gueltigesDatum(j, m, t, heute) {
    var d = new Date(j, m - 1, t);
    if (d.getFullYear() !== j || d.getMonth() !== m - 1 || d.getDate() !== t) return null;
    var h = heute || new Date(), morgen = new Date(h.getFullYear(), h.getMonth(), h.getDate() + 1), alt = new Date(h.getFullYear() - 3, h.getMonth(), h.getDate());
    return d > morgen || d < alt ? null : isoTag(d);
  }
  function kassenzettel(text, heute) {
    var zeilen = String(text || '').split(/\r?\n/).map(function (z) { return z.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    var r = { summe: null, datum: null, geschaeft: null, kat: null, sicher: false };
    // Gesamtsumme: Zeile mit Schlüsselwort, Betrag in derselben oder der nächsten Zeile; stärkere Wörter gewinnen
    var STARK = [[3, /zu\s*zahlen|zahlbetrag|endbetrag|gesamtbetrag|rechnungsbetrag/i], [2, /\bsumme\b|\bsumme\s*eur|^summe|\bgesamt\b|\btotal\b(?!\s*energies)|\bbetrag\s+eur\b/i],
      [1, /\b(ec[- ]?karte|girocard|kartenzahlung|bar\b|visa|mastercard|maestro)/i]];
    var NICHT = /zwischensumme|mwst|ust\b|steuer|netto|brutto|gegeben|r(ü|ue)ckgeld|bonus|punkte|rabatt|pfand/i;
    var kand = [];
    zeilen.forEach(function (z, i) {
      if (NICHT.test(z)) return;
      for (var s = 0; s < STARK.length; s++) {
        if (!STARK[s][1].test(z)) continue;
        var b = betraegeIn(z); if (!b.length && zeilen[i + 1] && !NICHT.test(zeilen[i + 1])) b = betraegeIn(zeilen[i + 1]);
        if (b.length) kand.push({ st: STARK[s][0], c: b[b.length - 1] });
        break;
      }
    });
    kand = kand.filter(function (k) { return k.c > 0 && k.c < 1000000; }); // über 10.000 €: kein Kassenzettel
    if (kand.length) {
      var best = kand.reduce(function (a, k) { return k.st > a.st ? k : a; });
      r.summe = best.c;
      r.sicher = best.st >= 2 || kand.filter(function (k) { return k.c === best.c; }).length >= 2;
    }
    // Datum: TT.MM.JJ(JJ) oder JJJJ-MM-TT; nicht in der Zukunft, nicht älter als 3 Jahre
    for (var i = 0; i < zeilen.length && !r.datum; i++) {
      var m = zeilen[i].match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})\b/), m2 = zeilen[i].match(/\b(20\d\d)-(\d\d)-(\d\d)\b/);
      if (m2) r.datum = gueltigesDatum(+m2[1], +m2[2], +m2[3], heute);
      if (!r.datum && m) r.datum = gueltigesDatum(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1], heute);
    }
    // Geschäft: bekannte Namen in den ersten Zeilen (dort steht der Kopf des Zettels), sonst Art des Geschäfts im ganzen Text
    var kopf = zeilen.slice(0, 8);
    GESCHAEFTE.some(function (g) { if (kopf.some(function (z) { return g[1].test(z); })) { r.geschaeft = g[0]; r.kat = g[2]; return true; } return false; });
    if (!r.kat) ART_WORTE.some(function (a) { if (zeilen.some(function (z) { return a[0].test(z); })) { r.kat = a[1]; return true; } return false; });
    return r;
  }

  // ---------- CSV (Semikolon, für Tabellenprogramme mit deutscher Einstellung) ----------
  function csvFeld(s) { s = String(s == null ? '' : s); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function csv(buch, kopf, katName, vonYm, bisYm) {
    var zeilen = [kopf.map(csvFeld).join(';')], ym = vonYm;
    for (var n = 0; ym <= bisYm && n < 600; n++, ym = monatPlus(ym, 1)) {
      monatsEintraege(buch, ym).slice().reverse().forEach(function (e) {
        zeilen.push([e.d, katName(e.k), (e.c / 100).toFixed(2).replace('.', ','), e.n || '', e.w ? 'x' : ''].map(csvFeld).join(';'));
      });
    }
    return zeilen.join('\r\n') + '\r\n';
  }

  // ---------- Übernahme Plan <-> Leistungs-Check (reine Logik) ----------
  var MIT_BRUTTO = ['lohn', 'rente', 'selbst'];
  function wert(v) { return v === '' || v === null || v === undefined ? null : zuCent(v); }
  // Aus den Angaben im Check: Werte für den Plan (vorausfüllen). s = state des Checks oder null (keine eigenen Angaben)
  function ausCheck(s, kindergeldEuro) {
    var o = { ek1: null, ek1Art: '', ek1NurBrutto: false, ek2: null, ek2Art: '', ek2NurBrutto: false, ek1b: null, ek1bArt: '', ek2b: null, ek2bArt: '', zwei: false, miete: null, uh: null, kinder: 0, kg: null };
    if (!s) return o;
    o.zwei = s.adults === 2;
    [1, 2].forEach(function (i) {
      if (i === 2 && !o.zwei) return;
      var art = s['ek' + i + 'Art'] || '';
      o['ek' + i + 'Art'] = art;
      o['ek' + i] = art === 'ohne' ? null : wert(s['ek' + i + 'Netto']);
      o['ek' + i + 'NurBrutto'] = MIT_BRUTTO.indexOf(art) >= 0 && o['ek' + i] === null && wert(s['ek' + i + 'Brutto']) !== null;
      // Zweites Einkommen der Person (Betrag „was ankommt“), nur mit gewählter Art
      var zArt = s['ek' + i + 'bArt'] || '';
      o['ek' + i + 'bArt'] = zArt;
      o['ek' + i + 'b'] = zArt ? wert(s['ek' + i + 'bBetrag']) : null;
    });
    o.miete = wert(s.miete); o.uh = wert(s.unterhalt);
    o.kinder = Number(s.kids) || 0;
    o.kg = o.kinder > 0 && kindergeldEuro > 0 ? Math.round(o.kinder * kindergeldEuro * 100) : null;
    return o;
  }
  // Eine Änderung im Plan an einem gemeinsamen Feld: direkt schreiben (Feld leer oder gleich) oder erst fragen (anderer Wert steht schon da)
  function aenderung(alt, neu) {
    if (neu === alt) return 'gleich';
    if (alt === null || alt === undefined || alt === '') return 'schreiben';
    return 'fragen';
  }
  // Liste vor dem Sprung in den Check: was übernommen ist, was fehlt, was nur mit Bestätigung übernommen wird
  function uebernahme(s, plan) {
    s = s || {};
    var da = [], fehlt = [], fragen = [];
    [1, 2].forEach(function (i) {
      if (i === 2 && s.adults !== 2) return;
      var art = s['ek' + i + 'Art'] || '', netto = wert(s['ek' + i + 'Netto']);
      if (art && art !== 'ohne' && netto !== null) da.push({ was: 'ek', i: i, art: art, c: netto });
      var zArt = s['ek' + i + 'bArt'] || '', zC = zArt ? wert(s['ek' + i + 'bBetrag']) : null;
      if (zArt && zC !== null) da.push({ was: 'ek', i: i, zweit: true, art: zArt, c: zC });
      if (MIT_BRUTTO.indexOf(art) >= 0 && wert(s['ek' + i + 'Brutto']) === null) fehlt.push({ was: 'brutto', i: i, art: art, feld: 'ek' + i + 'Brutto' });
      if (!art && netto !== null) fehlt.push({ was: 'art', i: i, feld: 'ek' + i + 'Art' });
    });
    if (wert(s.miete) !== null) da.push({ was: 'miete', c: wert(s.miete) });
    if (wert(s.unterhalt) !== null) da.push({ was: 'uh', c: wert(s.unterhalt) });
    if ((Number(s.kids) || 0) > 0) da.push({ was: 'kinder', n: Number(s.kids) });
    var kg = plan && plan.kg;
    if (kg > 0 && !(Number(s.kids) > 0)) fehlt.push({ was: 'kinder', feld: 'kids' });
    if (kg > 0 && !(s.bezug && s.bezug.kindergeld)) fragen.push({ was: 'kgBezug', feld: 'b-kindergeld' });
    if (wert(s.miete) !== null && wert(s.heizkosten) === null) fehlt.push({ was: 'heiz', feld: 'heizkosten' });
    if (plan && plan.energie > 0 && wert(s.miete) !== null) fehlt.push({ was: 'gas', feld: 'miete' });
    if (!s.plz) fehlt.push({ was: 'plz', feld: 'plz' });
    if (plan && plan.leist > 0) fehlt.push({ was: 'leist', feld: 'b-wohngeld' });
    return { da: da, fehlt: fehlt, fragen: fragen };
  }

  // ---------- Querverbindungen: Hinweise aus Plan und Haushaltsbuch ----------
  // Ein Hinweis erscheint nur, wenn die Angaben ihn auslösen; höchstens 2 sichtbar (nach Wirkung sortiert), der Rest aufklappbar;
  // „Nicht mehr zeigen“ merkt sich die Kennung (e.weg). Rechtsgrundlagen stehen in den Texten (hb.hw.*.d).
  var WORTE = {
    rundfunk: /rundfunk|\bgez\b|beitragsservice/i,
    but: /schul|klassenfahrt|ausflug|mittagessen|kita-?essen|verein|nachhilfe|ranzen|sportverein|musikschule/i,
    nk: /nebenkosten|nachzahlung|betriebskosten|heizkostenabrechnung/i,
    kaputt: /kaputt|reparatur|waschmaschine|k(ü|ue)hlschrank|herd\b|backofen|trockner|sp(ü|ue)lmaschine|haushaltsger(ä|ae)t|bett\b|matratze/i
  };
  var VORLAUF_TAGE = { sgb2: 42, sgb12: 42, wohngeld: 60, kiz: 42 }; // wie erweiterungen/fristen.js (Erinnerung vor dem Ende des Bewilligungszeitraums)
  function tageBis(heute, iso) { var a = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate()), b = new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)); return Math.round((b - a) / 86400000); }
  function hinweisListe(e) {
    var weg = e.weg || {}, out = [], lv = e.ergebnis || {}, bz = e.bezug || {};
    var offen = function (id) { return lv[id] === 'ja' || lv[id] === 'vielleicht'; };
    var notizen = (e.eintraege || []).map(function (x) { return x.n || ''; }).join('\n');
    var katSumme = function (k) { return (e.aus && e.aus[k] || 0) + (e.eintraege || []).filter(function (x) { return x.k === k; }).reduce(function (a, x) { return a + x.c; }, 0); };
    var sgb = !!(bz.grundsicherungsgeld || bz.sozialamt) || offen('ggeld') || offen('gsa');
    var add = function (id, prio, extra) { if (!weg[id]) out.push(Object.assign({ id: id, prio: prio }, extra || {})); };
    // 6. Weiterbewilligung: kurz vor dem Ende des Bewilligungszeitraums
    Object.keys(e.bewilligt || {}).forEach(function (l) {
      var ende = e.bewilligt[l]; if (!/^\d{4}-\d\d-\d\d$/.test(ende || '')) return;
      var tage = tageBis(e.heute || new Date(), ende);
      if (tage >= 0 && tage <= (VORLAUF_TAGE[l] || 42)) add('wb-' + l + '-' + ende, 100, { art: 'wb', leistung: l, ende: ende });
    });
    // 5. Einkommen hat sich deutlich geändert (mindestens ein Zehntel; reiner Auslöser, keine Grenze aus einem Gesetz)
    if (e.ekBasis > 0 && e.ekJetzt !== null && e.ekJetzt !== undefined && Math.abs(e.ekJetzt - e.ekBasis) >= e.ekBasis / 10) add('ek', 90, { art: 'ek', alt: e.ekBasis, neu: e.ekJetzt });
    // Es bleibt wenig übrig: Leistungen prüfen
    if (e.knapp) add('knapp', 80, { art: 'knapp' });
    // 3. Nachzahlung Nebenkosten
    if (WORTE.nk.test(notizen)) add('nk', 70, { art: 'nk' });
    // 4. Etwas geht kaputt: nur mit Grundsicherungsgeld bzw. Sozialhilfe (Darlehen § 24 Abs. 1 SGB II, § 37 Abs. 1 SGB XII)
    var gross = (e.eintraege || []).some(function (x) { return !x.w && e.ein > 0 && x.c >= e.ein / 5; }); // einmalig mindestens ein Fünftel der Einnahmen
    if (sgb && (WORTE.kaputt.test(notizen) || gross)) add('kaputt', 60, { art: 'kaputt' });
    // 2. Bildung und Teilhabe: Ausgaben für Kinder; nicht, wenn der Check es sicher ausschließt
    if ((katSumme('kinder') > 0 || WORTE.but.test(notizen)) && lv.but !== 'nein' && !(e.kinder === 0 && e.ergebnis)) add('but', 50, { art: 'but' });
    // Energie: Nachzahlung möglich (nur belastbar geschätzt: eigener Preis, nicht ungenau; Summe vom Aufrufer, siehe energieNachzahlung)
    if (e.energieNach > 0) add('energie', 75, { art: 'energie', b: e.energieNach });
    // Raten und Schulden
    if (katSumme('raten') > 0) add('schulden', 45, { art: 'schulden' });
    // 1. Sozialtarife und Rundfunkbeitrag: Ausgaben für Handy, Mobilität, Strom oder Rundfunk; nur bei passender Leistung oder knappem Plan
    var rf = !!(bz.grundsicherungsgeld || bz.sozialamt) || offen('rundfunk');
    if ((katSumme('handy') > 0 || katSumme('mobil') > 0 || katSumme('energie') > 0 || WORTE.rundfunk.test(notizen)) && (rf || e.knapp)) add('tarif', 40, { art: 'tarif', rundfunk: rf });
    geldHinweis(e, sgb, notizen, out); // Mehrbedarf, Erspartes, Pflege, Steuer: höchstens einer (Funktionen am Ende)
    return out.sort(function (a, b) { return b.prio - a.prio; });
  }
  function aenderungsBrief(alt, neu, datum) {
    return ['[Name, Anschrift]', '', 'An: [Jobcenter oder Sozialamt]', '', 'Aktenzeichen bzw. Nummer der Bedarfsgemeinschaft: [_____]', '', 'Mitteilung über eine Änderung meines Einkommens', '',
      'Sehr geehrte Damen und Herren,', '', 'hiermit teile ich Ihnen nach § 60 Abs. 1 Satz 1 Nr. 2 SGB I mit, dass sich mein Einkommen geändert hat.',
      'Bisher: etwa ' + alt + ' netto im Monat.', 'Neu: etwa ' + neu + ' netto im Monat, ab dem [Datum].', '', 'Nachweise (zum Beispiel die Lohnabrechnung) lege ich bei.', '',
      'Mit freundlichen Grüßen', '', '[Ort], ' + datum, '[Unterschrift]'].join('\n');
  }

  // ---------- Energiekosten-Check (Strom, Gas): Abschlag prüfen ----------
  // Entwurf docs/entwuerfe/energie.md (geprüft 20.11.2026). Nur Schätzung, Ergebnis immer „möglich“ bzw. „ungefähr“.
  // Destatis PM Nr. 345 vom 30.09.2026, 1. Hj. 2026, Durchschnittspreis private Haushalte mit Grundpreis, Steuern, Abgaben; abgerufen 20.11.2026
  var PREIS = { strom: 37.97, gas: 11.58, stand: '2026-1' }; // ct/kWh
  // Destatis, UGR, „Stromverbrauch der privaten Haushalte nach Haushaltsgrößenklassen“, Berichtsjahr 2021 (Stand 27.09.2023), kWh je Haushalt
  // (Strom insgesamt, auch Haushalte, die mit Strom heizen); abgerufen 20.11.2026. Nur Orientierung, kein Urteil „hoch/niedrig“.
  // Stromspiegel-Klassen (co2online) bewusst NICHT eingebaut: Nutzung nur mit schriftlicher Erlaubnis (Prüfvermerk Nr. 2); nur Hinweis auf stromspiegel.de.
  var VERBRAUCH_DESTATIS = { jahr: 2021, kwh: [2105, 3470, 5411] }; // 1, 2, 3 und mehr Personen
  var TOL = { cent: 3000, anteil: 0.05 }; // „passt ungefähr“: Faustregel von SoLo, keine Grenze aus einem Gesetz
  var ISO = /^\d{4}-\d\d-\d\d$/;
  var SAISON_TAGE = 330, AKTUELL_TAGE = 31; // Faustregeln von SoLo (keine Grenzen aus einem Gesetz)
  function tageZwischen(a, b) {
    var u = function (s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), 12); };
    return Math.round((u(b) - u(a)) / 86400000);
  }
  function zahlOk(v) { return typeof v === 'number' && isFinite(v) && v >= 0; }
  // e = { z1, d1, z2, d2, jahr }: Zählerstände (mit Datum) gehen vor; bei einem Fehler kein stiller Rückfall auf die Rechnung
  function jahresVerbrauch(e, heuteIso) {
    e = e || {};
    var r = { kwh: null, quelle: '', tage: 0, ungenau: false, lang: false, fehler: '' };
    var zaehler = zahlOk(e.z1) && zahlOk(e.z2) && ISO.test(e.d1 || '') && ISO.test(e.d2 || '');
    if (zaehler) {
      r.quelle = 'zaehler';
      var h = heuteIso || isoTag(new Date());
      if (e.d2 < e.d1 || e.d2 > h || e.d1 > h) { r.fehler = 'datum'; return r; }
      if (e.z2 < e.z1) { r.fehler = 'rueck'; return r; }
      r.tage = tageZwischen(e.d1, e.d2);
      if (r.tage < 14) { r.fehler = 'kurz'; return r; }
      if (e.z2 === e.z1) { r.fehler = 'null'; return r; }
      r.kwh = Math.round((e.z2 - e.z1) / r.tage * 365); // immer × 365, auch im Schaltjahr (Abweichung höchstens 0,3 %)
      r.ungenau = r.tage < 60; r.lang = r.tage > 730;
      return r;
    }
    // Zählerangaben leer oder unvollständig: dann gilt der Verbrauch von der Rechnung
    if (zahlOk(e.jahr) && e.jahr > 0) { r.kwh = Math.round(e.jahr); r.quelle = 'rechnung'; return r; }
    r.fehler = 'fehlt'; return r;
  }
  function gasKwh(m3, faktor) { return zahlOk(m3) && typeof faktor === 'number' && faktor > 0 ? Math.round(m3 * faktor) : null; }
  // ap in ct/kWh, gpCent Grundpreis im Monat in Cent; ohne Arbeitspreis: amtlicher Durchschnittspreis (Grundpreis darin enthalten)
  function jahresKosten(kwh, ap, gpCent, art) {
    if (!zahlOk(kwh)) return null;
    if (!(typeof ap === 'number' && ap > 0)) return { cent: Math.round(kwh * PREIS[art === 'gas' ? 'gas' : 'strom']), geschaetzt: true, gpFehlt: false };
    var gp = zahlOk(gpCent) ? gpCent : 0;
    return { cent: Math.round(kwh * ap + 12 * gp), geschaetzt: false, gpFehlt: !zahlOk(gpCent) };
  }
  function abschlagVergleich(kostenCent, abschlagCent, n) {
    if (!zahlOk(kostenCent) || !(abschlagCent > 0)) return null;
    n = n === 11 ? 11 : 12;
    var gezahlt = n * abschlagCent, diff = kostenCent - gezahlt;
    var art = Math.abs(diff) <= Math.max(TOL.cent, TOL.anteil * kostenCent) ? 'passt' : diff > 0 ? 'nach' : 'gut';
    return { gezahlt: gezahlt, diff: diff, betrag: Math.abs(diff), art: art, vorschlag: Math.ceil(kostenCent / n / 100) * 100 };
  }
  function destatisVergleich(personen) {
    var p = Math.floor(Number(personen) || 0); if (p < 1) return null;
    var i = Math.min(p, 3) - 1;
    return { klasse: i + 1, kwh: VERBRAUCH_DESTATIS.kwh[i], jahr: VERBRAUCH_DESTATIS.jahr };
  }
  // Eine Sparte (Strom oder Gas) ausrechnen. x = gespeicherte Angaben (energie.strom bzw. energie.gas)
  // heiz = Art der Heizung (energie.heiz). Gas und Heizen mit Strom schwanken stark über das Jahr: Hochrechnung aus Zählerständen
  // erst ab SAISON_TAGE belastbar (sonst „ungenau“, kein Plan-Hinweis, kein Brief). Ablesung älter als AKTUELL_TAGE: kein Brief, kein Plan-Hinweis.
  function energieSparte(x, art, heuteIso, heiz) {
    x = x || {};
    var m3 = art === 'gas' && !!x.m3, h = heuteIso || isoTag(new Date());
    var v = jahresVerbrauch(x.weg === 'rechnung' ? { jahr: x.jahr } : { z1: x.z1, d1: x.d1, z2: x.z2, d2: x.d2 }, h);
    var r = { art: art, verbrauch: v, kwh: v.kwh, m3: m3, kosten: null, vergleich: null, belastbar: false, fehltFaktor: false, aktuell: true };
    if (v.quelle === 'zaehler' && v.kwh !== null) {
      if ((art === 'gas' || heiz === 'strom') && v.tage < SAISON_TAGE) { v.ungenau = true; v.saison = true; }
      r.aktuell = tageZwischen(x.d2, h) <= AKTUELL_TAGE;
    }
    if (m3 && v.kwh !== null) { r.kwh = gasKwh(v.kwh, x.faktor); r.fehltFaktor = r.kwh === null; }
    r.kosten = jahresKosten(r.kwh, x.ap, x.gp, art);
    r.vergleich = r.kosten ? abschlagVergleich(r.kosten.cent, x.a, x.n) : null;
    r.belastbar = !!(r.vergleich && !r.kosten.geschaetzt && !r.kosten.gpFehlt && !v.ungenau && r.aktuell);
    return r;
  }
  // Summe der belastbar geschätzten Nachzahlungen (Strom und, wenn mit eigenem Gasvertrag geheizt wird, Gas); 0 = kein Hinweis im Plan
  function energieNachzahlung(en, heuteIso) {
    if (!en) return 0;
    return (en.heiz === 'gas' ? ['strom', 'gas'] : ['strom']).reduce(function (a, s) {
      var r = energieSparte(en[s], s, heuteIso, en.heiz);
      return a + (r.belastbar && r.vergleich.art === 'nach' ? r.vergleich.diff : 0);
    }, 0);
  }
  // Brief an den Versorger (nur Deutsch, nur Platzhalter für persönliche Daten). o = { art: 'nach'|'gut', datum, stand, einheit, kwh, neu }
  function abschlagBrief(o) {
    var satz = o.art === 'gut' ?
      'Mein Verbrauch ist damit voraussichtlich geringer als bei der Berechnung meines Abschlags angenommen. Bitte prüfen Sie das und senken Sie meinen monatlichen Abschlag auf etwa ' + o.neu + ' (§ 41b Abs. 3 Satz 2 EnWG bzw. § 13 Abs. 1 Satz 4 StromGVV/GasGVV).' :
      'Damit ich keine hohe Nachzahlung bekomme, bitte ich Sie, meinen monatlichen Abschlag auf etwa ' + o.neu + ' zu erhöhen.';
    return ['[Name, Anschrift]', '', 'An: [Name des Strom- bzw. Gasversorgers]', '', 'Kundennummer: [_____]   Zählernummer: [_____]', '', 'Bitte um Anpassung meines Abschlags', '',
      'Sehr geehrte Damen und Herren,', '', 'mein aktueller Zählerstand am ' + o.datum + ' ist ' + o.stand + ' ' + o.einheit + '. Daraus ergibt sich ein Verbrauch von etwa ' + o.kwh + ' kWh im Jahr.',
      satz, 'Bitte bestätigen Sie mir die Änderung in Textform.', '', 'Mit freundlichen Grüßen', '', '[Ort], ' + o.datum, '[Unterschrift]'].join('\n');
  }
  // Preis und Umrechnungsfaktor: bis zu 4 Nachkommastellen (z. B. 32,875 ct oder 10,934 kWh/m³). Toleranzvergleich wegen Gleitkomma (32,8 · 100 ≠ 3280).
  var STELLEN = 4;
  function dezimalOk(v) { var c = v * Math.pow(10, STELLEN); return Math.abs(Math.round(c) - c) < 1e-6; }
  // Eingabe „32,875“, „32.875“, „10,934“: genau ein Komma oder Punkt als Dezimalzeichen, keine Tausenderpunkte. Leer → null, ungültig → NaN.
  function dezimalAus(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).replace(/[\s\u00a0\u202f]/g, '');
    if (s === '') return null;
    if (!/^\d+([.,]\d{1,4})?$/.test(s)) return NaN;
    var n = Number(s.replace(',', '.'));
    return isFinite(n) ? Math.round(n * 10000) / 10000 : NaN;
  }
  function leerEnergie() {
    var s = function (weg) { return { a: null, n: 12, weg: weg, z1: null, d1: '', z2: null, d2: '', jahr: null, ap: null, gp: null }; };
    var g = s('rechnung'); g.m3 = false; g.faktor = null;
    return { heiz: '', personen: null, strom: s('zaehler'), gas: g };
  }
  function normiereEnergie(d) {
    var x = leerEnergie();
    if (!d || typeof d !== 'object') return x;
    var ganz = function (v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v === Math.floor(v) ? v : null; };
    if (['miete', 'gas', 'strom', 'andere'].indexOf(d.heiz) >= 0) x.heiz = d.heiz;
    var p = ganz(d.personen); x.personen = p >= 1 && p <= 20 ? p : null;
    ['strom', 'gas'].forEach(function (s) {
      var q = d[s], z = x[s]; if (!q || typeof q !== 'object') return;
      ['a', 'gp', 'z1', 'z2', 'jahr'].forEach(function (k) { z[k] = ganz(q[k]); });
      z.n = q.n === 11 ? 11 : 12;
      if (q.weg === 'zaehler' || q.weg === 'rechnung') z.weg = q.weg;
      ['d1', 'd2'].forEach(function (k) { var v = q[k]; if (typeof v === 'string' && ISO.test(v)) { var t2 = new Date(Date.UTC(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10))); if (t2.getUTCMonth() === +v.slice(5, 7) - 1) z[k] = v; } });
      z.ap = typeof q.ap === 'number' && q.ap > 0 && q.ap < 200 && dezimalOk(q.ap) ? q.ap : null;
      if (s === 'gas') { z.m3 = q.m3 === true; z.faktor = typeof q.faktor === 'number' && q.faktor >= 5 && q.faktor <= 15 && dezimalOk(q.faktor) ? q.faktor : null; }
    });
    return x;
  }

  // =====================================================================
  // Oberfläche
  // =====================================================================
  var ctx = null, daten = null, ansicht = 'plan', monat = '', offenKat = '', eingabe = null, rueck = null, ueOffen = false, scanLaeuft = false, enOffen = false, enSparte = 'strom';
  var $ = function (id) { return document.getElementById(id); };
  function t(k, p) { return ctx.t(k, p); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function eur(cent) { return ctx.euro((cent || 0) / 100); }
  function katName(k) { return t('hb.k.' + k); }
  function katSym(k) { var x = KAT.filter(function (a) { return a[0] === k; })[0] || KAT[8]; return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + x[1] + '</svg>'; }
  function leer() { return { v: 1, plan: { kg: null, leist: null, sonst: null, aus: {} }, buch: [], weg: {}, bewilligt: {}, ekBasis: null, ekV: 2, energie: leerEnergie() }; }

  // ----- Speicherung: eine kleine Schnittstelle, später leicht an „Vorgänge“ anzubinden (Haushalt.speicherOrt) -----
  var SCHLUESSEL = 'lotse.haushalt';
  var speicher = {
    laden: function (cb) {
      var p = ctx && ctx.plug && ctx.plug('Preferences');
      if (p) { p.get({ key: SCHLUESSEL }).then(function (r) { cb(r && r.value); }, function () { cb(null); }); return; }
      try { cb(localStorage.getItem(SCHLUESSEL)); } catch (e) { cb(null); }
    },
    schreiben: function (text, cb) {
      var p = ctx && ctx.plug && ctx.plug('Preferences');
      if (p) { p.set({ key: SCHLUESSEL, value: text }).then(function () { cb(null); }, function (e) { cb(e || new Error('speichern')); }); return; }
      try { localStorage.setItem(SCHLUESSEL, text); cb(null); } catch (e) { cb(e); }
    }
  };
  function speicherOrt(s) { if (s && s.laden) speicher.laden = s.laden; if (s && s.schreiben) speicher.schreiben = s.schreiben; }
  function normiere(d) {
    var x = leer();
    if (!d || typeof d !== 'object') return x;
    if (d.plan && typeof d.plan === 'object') { ['kg', 'leist', 'sonst'].forEach(function (k) { x.plan[k] = typeof d.plan[k] === 'number' ? d.plan[k] : null; }); if (d.plan.aus) KAT_IDS.forEach(function (k) { if (k !== 'miete' && typeof d.plan.aus[k] === 'number') x.plan.aus[k] = d.plan.aus[k]; }); }
    if (d.weg && typeof d.weg === 'object') Object.keys(d.weg).forEach(function (k) { if (d.weg[k] === true) x.weg[k] = true; });
    if (d.bewilligt && typeof d.bewilligt === 'object') ['sgb2', 'sgb12', 'wohngeld', 'kiz'].forEach(function (k) { if (/^\d{4}-\d\d-\d\d$/.test(d.bewilligt[k] || '')) x.bewilligt[k] = d.bewilligt[k]; });
    if (typeof d.ekBasis === 'number') x.ekBasis = d.ekBasis;
    // ekV 2: ekBasis enthält das zweite Einkommen. Ältere Stände (ohne ekV) werden in hinweisDaten() einmal angeglichen.
    x.ekV = d.ekV === 2 ? 2 : 1;
    x.energie = normiereEnergie(d.energie);
    if (Array.isArray(d.buch)) x.buch = d.buch.filter(function (e) { return e && /^\d{4}-\d\d-\d\d$/.test(e.d) && typeof e.c === 'number' && e.c > 0; }).map(buchungBereinigen);
    return x;
  }
  function sichern() {
    var msg = $('hbSpeicherMsg');
    speicher.schreiben(JSON.stringify(daten), function (err) { if (msg) msg.textContent = err ? t('hb.speicherFehler') : ''; });
  }

  // ----- Werte aus dem Check -----
  function check() { return ctx.daten ? ctx.daten() : null; }
  function kindergeldEuro() { return ctx.regeln && ctx.regeln().kindergeld || 0; }
  function geteilte() { return ausCheck(check(), kindergeldEuro()); }
  function planEin() {
    var g = geteilte(), p = daten.plan;
    return [g.ek1, g.ek1b, g.zwei ? g.ek2 : null, g.zwei ? g.ek2b : null, p.kg !== null ? p.kg : g.kg, g.uh, p.leist, p.sonst];
  }
  function planAus() { var a = Object.assign({}, daten.plan.aus); a.miete = geteilte().miete || 0; return a; }
  function rechnung() { return planRechnung(planEin(), planAus()); }

  // ----- Hilfen für Elemente -----
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; } // nur Text, nie HTML
  function knopf(cls, text, fn, attr) { var b = el('button', cls); b.type = 'button'; b.textContent = text; b.addEventListener('click', fn); if (attr) Object.keys(attr).forEach(function (k) { b.setAttribute(k, attr[k]); }); return b; }
  function geldFeld(id, label, cent, hint, onWert) {
    var f = el('div', 'field hb-feld');
    var l = el('label'); l.htmlFor = id; l.textContent = label; f.appendChild(l);
    var m = el('div', 'money'), i = el('input'); i.type = 'text'; i.inputMode = 'decimal'; i.autocomplete = 'off'; i.id = id;
    i.value = cent === null || cent === undefined ? '' : String((cent / 100).toFixed(2)).replace(/\.00$/, '').replace('.', ',');
    m.appendChild(i); m.appendChild(el('span', '', '€')); m.lastChild.setAttribute('aria-hidden', 'true'); f.appendChild(m);
    if (hint) { var h = el('span', 'hint'); h.id = id + '-h'; h.textContent = hint; f.appendChild(h); i.setAttribute('aria-describedby', h.id); }
    i.addEventListener('change', function () { onWert(i.value.trim() === '' ? null : zuCent(i.value), i, f); });
    return f;
  }

  // ----- Rückfrage, bevor ein vorhandener Wert im Check ersetzt wird -----
  function fragen(feld, text, ja, nein) {
    var alt = feld.querySelector('.hb-frage'); if (alt) alt.remove();
    var box = el('div', 'hb-frage'); box.setAttribute('role', 'group');
    var p = el('p'); p.textContent = text; box.appendChild(p);
    var b = el('div', 'btns');
    b.appendChild(knopf('btn', t('hb.ja.ersetzen'), function () { box.remove(); ja(); }));
    b.appendChild(knopf('btn ghost', t('hb.nein.behalten'), function () { box.remove(); nein(); }));
    box.appendChild(b); feld.appendChild(box);
    box.querySelector('button').focus();
  }
  function geteiltSetzen(feld, schluessel, altCent, neuCent, input) {
    var schreib = function () { var o = {}; o[schluessel] = neuCent === null ? '' : neuCent / 100; ctx.setze(o); renderPlan(schluessel); };
    var a = aenderung(altCent, neuCent);
    if (a === 'gleich') return;
    if (a === 'schreiben') { schreib(); return; }
    fragen(feld, t('hb.frage.ersetzen', { alt: eur(altCent), neu: neuCent === null ? '–' : eur(neuCent) }), schreib, function () {
      input.value = altCent === null ? '' : String(altCent / 100).replace('.', ','); input.focus();
    });
  }

  // ----- Plan -----
  function ergebnisSatz(r) {
    if (r.leer) return t('hb.rest.leer');
    return r.rest >= 0 ? t('hb.rest', { b: { eur: euroGanz(r.rest) } }) : t('hb.fehlt', { b: { eur: euroGanz(-r.rest) } });
  }
  function renderPlan(fokusId) {
    var box = $('hbInhalt'); box.innerHTML = '';
    var g = geteilte(), p = daten.plan, s = check();
    box.appendChild(el('p', 'hb-lead', t('hb.plan.lead')));
    var erg = el('p', 'hb-ergebnis'); erg.id = 'hbErgebnis'; erg.setAttribute('aria-live', 'polite'); box.appendChild(erg);
    var aktual = function () {
      var r = rechnung(); erg.textContent = ergebnisSatz(r); erg.classList.toggle('minus', !r.leer && r.rest < 0);
      var h = $('hbHinweise'); if (h) hinweise(h, r);
    };

    // Einnahmen
    var fs = el('fieldset', 'hb-karte'); fs.appendChild(el('legend', '', t('hb.ein')));
    [1, 2].forEach(function (i) {
      if (i === 2 && !g.zwei) return;
      var art = g['ek' + i + 'Art'], c = g['ek' + i];
      var hint = g['ek' + i + 'NurBrutto'] ? t('hb.ek.nurBrutto') : c !== null ? t('hb.uebernommen') + ' ' + t('hb.geteilt') : t('hb.ek.hint') + ' ' + t('hb.geteilt');
      var f = geldFeld('hb-ek' + i, t(i === 1 ? 'hb.ek1' : 'hb.ek2'), c, hint, function (neu, inp, feld) {
        geteiltSetzen(feld, 'ek' + i + 'Netto', geteilte()['ek' + i], neu, inp);
      });
      // Art des Einkommens: wie im Check; eine vorhandene andere Art nur nach Rückfrage ändern
      var sl = el('div', 'field hb-art'), lab = el('label'); lab.htmlFor = 'hb-ek' + i + 'Art'; lab.textContent = t('hb.ek.art'); sl.appendChild(lab);
      var sel = el('select'); sel.id = 'hb-ek' + i + 'Art';
      [['', 'ek.art.0'], ['lohn', 'ek.art.lohn'], ['selbst', 'ek.art.selbst'], ['rente', 'ek.art.rente'], ['alg', 'ek.art.alg'], ['kg', 'ek.art.kg'], ['eg', 'ek.art.eg'], ['wfbm', 'ek.art.wfbm'], ['unt', 'ek.art.unt'], ['ohne', 'ek.art.ohne']]
        .forEach(function (o) { var op = el('option'); op.value = o[0]; op.textContent = t(o[1]); sel.appendChild(op); });
      sel.value = art || '';
      sel.addEventListener('change', function () {
        var neu = sel.value, alt = geteilte()['ek' + i + 'Art'];
        var o = {}; o['ek' + i + 'Art'] = neu;
        if (!alt) { ctx.setze(o); renderPlan(sel.id); return; }
        if (neu === alt) return;
        fragen(sl, t('hb.frage.art', { alt: t('ek.art.' + alt), neu: neu ? t('ek.art.' + neu) : t('ek.art.0') }), function () {
          o['ek' + i + 'Brutto'] = ''; // Brutto von Lohn ist nicht Brutto von Rente: neu im Check eintragen
          if (neu === 'ohne') o['ek' + i + 'Netto'] = '';
          ctx.setze(o); renderPlan(sel.id);
        }, function () { sel.value = alt; sel.focus(); });
      });
      sl.appendChild(sel);
      fs.appendChild(f); fs.appendChild(sl);
      // Zweites Einkommen der Person: eigene Zeile, nur wenn im Check eine Art gewählt ist (die Art wählt man dort)
      var zArt = g['ek' + i + 'bArt'];
      if (zArt) {
        var zc = g['ek' + i + 'b'];
        fs.appendChild(geldFeld('hb-ek' + i + 'b', t(i === 1 ? 'hb.ek1b' : 'hb.ek2b'), zc, t('ek.art.' + zArt) + '. ' + (zc !== null ? t('hb.uebernommen') + ' ' : '') + t('hb.geteilt'), function (neu, inp, feld) {
          geteiltSetzen(feld, 'ek' + i + 'bBetrag', geteilte()['ek' + i + 'b'], neu, inp);
        }));
      }
    });
    var kgC = p.kg !== null ? p.kg : g.kg;
    fs.appendChild(geldFeld('hb-kg', t('hb.kg'), kgC, p.kg === null && g.kg !== null ? t('hb.kg.aus', { n: String(g.kinder), b: { eur: kindergeldEuro() } }) + ' ' + t('hb.uebernommen') : '', function (neu) {
      p.kg = neu === g.kg ? null : neu; sichern(); aktual();
    }));
    fs.appendChild(geldFeld('hb-uh', t('hb.uh'), g.uh, (g.uh !== null ? t('hb.uebernommen') + ' ' : '') + t('hb.geteilt'), function (neu, inp, feld) {
      geteiltSetzen(feld, 'unterhalt', geteilte().uh, neu, inp);
    }));
    fs.appendChild(geldFeld('hb-leist', t('hb.leist'), p.leist, '', function (neu) { p.leist = neu; sichern(); aktual(); }));
    fs.appendChild(geldFeld('hb-sonstEin', t('hb.sonstEin'), p.sonst, '', function (neu) { p.sonst = neu; sichern(); aktual(); }));
    box.appendChild(fs);

    // Feste Ausgaben: große Knöpfe mit Symbol; ein Tipp öffnet das Feld darunter
    var fa = el('fieldset', 'hb-karte'); fa.appendChild(el('legend', '', t('hb.aus')));
    fa.appendChild(el('p', 'hint', t('hb.aus.t')));
    var grid = el('div', 'hb-kats'), aus = planAus();
    KAT.forEach(function (k) {
      var b = el('button', 'hb-kat'); b.type = 'button'; b.id = 'hb-kat-' + k[0];
      b.setAttribute('aria-expanded', String(offenKat === k[0])); b.setAttribute('aria-controls', 'hb-katFeld');
      b.innerHTML = '<span class="hb-sym">' + katSym(k[0]) + '</span><span class="hb-kname">' + esc(katName(k[0])) + '</span><span class="hb-kwert">' + (aus[k[0]] ? esc(eur(aus[k[0]])) : '–') + '</span>';
      b.addEventListener('click', function () { offenKat = offenKat === k[0] ? '' : k[0]; renderPlan(offenKat ? 'hb-aus-' + k[0] : b.id); });
      grid.appendChild(b);
    });
    fa.appendChild(grid);
    if (offenKat) {
      var wrap = el('div', 'hb-katfeld'); wrap.id = 'hb-katFeld';
      var k = offenKat, hint = k === 'miete' ? t('hb.k.miete.t') + ' ' + (g.miete !== null ? t('hb.uebernommen') + ' ' : '') + t('hb.geteilt') : '';
      wrap.appendChild(geldFeld('hb-aus-' + k, t('hb.betrag.f', { k: katName(k) }), k === 'miete' ? g.miete : (daten.plan.aus[k] === undefined ? null : daten.plan.aus[k]), hint, function (neu, inp, feld) {
        if (k === 'miete') { geteiltSetzen(feld, 'miete', geteilte().miete, neu, inp); return; }
        if (neu === null) delete daten.plan.aus[k]; else daten.plan.aus[k] = neu;
        sichern(); renderPlan('hb-aus-' + k);
      }));
      if (k === 'energie') { // Energiekosten-Check: Knopf unter dem Betragsfeld, Box zum Aufklappen
        wrap.appendChild(knopf('btn ghost', t('hb.en.knopf'), function () { enOffen = !enOffen; renderPlan(enOffen ? 'hb-en-h' : 'hb-en-knopf'); }, { id: 'hb-en-knopf', 'aria-expanded': String(enOffen), 'aria-controls': 'hbEnergie' }));
        if (enOffen) wrap.appendChild(energieBox());
      }
      wrap.appendChild(knopf('btn ghost', t('hb.fertig'), function () { var war = offenKat; offenKat = ''; renderPlan('hb-kat-' + war); }));
      fa.appendChild(wrap);
    }
    box.appendChild(fa);

    var hw = el('div', 'hb-hinweise'); hw.id = 'hbHinweise'; box.appendChild(hw);
    box.appendChild(bewilligtBox());
    // Übernahme in den Leistungs-Check
    var ue = el('div', 'btns hb-ue-knopf');
    ue.appendChild(knopf('btn', t('hb.pruefen'), function () { ueOffen = true; renderPlan('hb-ue-h'); }, { 'aria-expanded': String(ueOffen) }));
    box.appendChild(ue);
    if (ueOffen) box.appendChild(uebernahmeBox(s));
    // Fachkräfte: Druckblatt (wenn der Beratungsmodus an ist oder es ihn noch nicht gibt); CSV-Export
    var ex = el('div', 'btns hb-export');
    if (beratung() !== false) ex.appendChild(knopf('btn ghost', t('hb.drucken'), drucken));
    ex.appendChild(knopf('btn ghost', t('hb.csv'), exportCsv));
    box.appendChild(ex);
    var em = el('p', 'small'); em.id = 'hbExportMsg'; em.setAttribute('aria-live', 'polite'); box.appendChild(em);
    aktual();
    if (fokusId && $(fokusId)) $(fokusId).focus();
  }
  function hinweisDaten(r) {
    var s = check(), g = geteilte();
    var teile = [g.ek1, g.ek1b, g.zwei ? g.ek2 : null, g.zwei ? g.ek2b : null];
    var ekJetzt = teile.every(function (x) { return x === null; }) ? null : teile.reduce(function (a, x) { return a + (x || 0); }, 0);
    // Erste Basis oder einmalige Angleichung älterer Stände (Basis ohne zweites Einkommen gespeichert, sonst käme der Hinweis grundlos)
    if (ekJetzt !== null && (!(daten.ekBasis > 0) || daten.ekV !== 2)) { daten.ekBasis = ekJetzt; daten.ekV = 2; sichern(); }
    var res = ctx.ergebnis ? ctx.ergebnis() : null, lv = null;
    if (res) { lv = {}; res.forEach(function (x) { lv[x.id] = x.level; }); }
    return hinweisListe({ aus: planAus(), eintraege: monatsEintraege(daten.buch, monat).concat(monatsEintraege(daten.buch, monatPlus(monat, -1))),
      knapp: !r.leer && r.knapp, ein: r.ein, ekBasis: daten.ekBasis, ekJetzt: ekJetzt, bezug: s && s.bezug, ergebnis: lv, kinder: s ? Number(s.kids) || 0 : null,
      bewilligt: daten.bewilligt, heute: new Date(), weg: daten.weg, geld: geldDaten(r), energieNach: energieNachzahlung(daten.energie, heuteIso()) });
  }
  function leistungName(l) { return t('hb.wb.' + l); }
  function hinweisElement(h, neuZeichnen) {
    if (GELD_ARTEN.indexOf(h.art) >= 0) return geldHinweisElement(h, neuZeichnen);
    var d = el('div', 'hb-hinweis'); d.id = 'hb-hw-' + h.art;
    var txt = h.art === 'wb' ? t('hb.hw.wb', { l: leistungName(h.leistung), d: ctx.datum(new Date(+h.ende.slice(0, 4), +h.ende.slice(5, 7) - 1, +h.ende.slice(8, 10))) }) :
      h.art === 'ek' ? t('hb.hw.ek', { alt: { eur: euroGanz(h.alt) }, neu: { eur: euroGanz(h.neu) } }) : h.art === 'tarif' && !h.rundfunk ? t('hb.hw.tarif0') : t('hb.hw.' + h.art);
    d.appendChild(el('p', '', txt));
    var det = el('details', 'hb-hw-det'), su = el('summary'); su.textContent = t('hb.hw.mehr'); det.appendChild(su);
    det.appendChild(el('p', 'small', t('hb.hw.' + (h.art === 'tarif' && !h.rundfunk ? 'tarif0' : h.art) + '.d', h.b ? { b: { eur: euroGanz(h.b) } } : undefined)));
    d.appendChild(det);
    var b = el('div', 'btns');
    var weg = function () { daten.weg[h.id] = true; if (h.art === 'ek') daten.ekBasis = h.neu; sichern(); neuZeichnen(); };
    if (h.art === 'knapp' || h.art === 'but') b.appendChild(knopf('btn ghost klein', t('hb.zumCheck'), function () { ctx.zeige('leistungen', true); }));
    if (h.art === 'schulden') b.appendChild(knopf('btn ghost klein', t('hb.zuSchulden'), function () { ctx.zeige('pfaendung', true); }));
    if (h.art === 'energie') b.appendChild(knopf('btn ghost klein', t('hb.en.knopf'), enOeffnen));
    if (h.art === 'nk') b.appendChild(knopf('btn ghost klein', t('hb.hw.brief'), function () { ctx.zeige('briefe', true); }));
    if (h.art === 'ek') {
      b.appendChild(knopf('btn ghost klein', t('hb.hw.neuPruefen'), function () { daten.ekBasis = h.neu; sichern(); ctx.zeige('leistungen', true); }));
      // Mitteilung nach § 60 SGB I nur bei Grundsicherungsgeld oder Sozialhilfe (Wohngeld und Kinderzuschlag haben eigene Regeln)
      var bzk = (check() || {}).bezug || {};
      if (bzk.grundsicherungsgeld || bzk.sozialamt) b.appendChild(knopf('btn ghost klein', t('hb.hw.melden'), function () {
        if (d.querySelector('textarea')) return;
        var l = el('label'); l.htmlFor = 'hb-brief'; l.textContent = t('hb.hw.briefLabel'); d.appendChild(l);
        var ta = el('textarea'); ta.id = 'hb-brief'; ta.rows = 12; ta.lang = 'de'; ta.value = aenderungsBrief(ctx.euroDe(euroGanz(h.alt)), ctx.euroDe(euroGanz(h.neu)), ctx.datumDe(new Date())); d.appendChild(ta);
        var m = el('p', 'small'); m.setAttribute('aria-live', 'polite');
        d.appendChild(knopf('btn', t('hb.hw.briefAus'), function () { ctx.textAusgeben(ta.value, 'Aenderungsmitteilung', m); }));
        d.appendChild(m); ta.focus();
      }));
    }
    b.appendChild(knopf('btn ghost klein', t(h.art === 'wb' ? 'hb.hw.erledigt' : 'hb.hw.weg'), weg));
    d.appendChild(b);
    return d;
  }
  function hinweise(box, r) {
    box.innerHTML = '';
    var liste = hinweisDaten(r), neu = function () { hinweise(box, rechnung()); var f = box.querySelector('button') || $('hbErgebnis'); if (f) f.focus(); };
    liste.slice(0, 2).forEach(function (h) { box.appendChild(hinweisElement(h, neu)); });
    if (liste.length > 2) {
      var d = el('details', 'hb-mehr'), su = el('summary'); su.textContent = t('hb.hw.weitere', { n: String(liste.length - 2) }); d.appendChild(su);
      liste.slice(2).forEach(function (h) { d.appendChild(hinweisElement(h, neu)); });
      box.appendChild(d);
    }
  }
  // Beim Öffnen der App: Erinnerung an den Weiterbewilligungsantrag oben auf der Startseite (nur in der App, keine Mitteilung)
  function startHinweis() {
    if (ctx && ctx.fristenNeu) { var a0 = $('hbStart'); if (a0) a0.remove(); ctx.fristenNeu(); return; } // nur ein Hinweis: Fristen (src/fristen.js) übernimmt den Folgeantrag
    var v = $('v-start'); if (!v) return;
    var alt = $('hbStart'); if (alt) alt.remove();
    var wb = hinweisListe({ bewilligt: daten.bewilligt, heute: new Date(), weg: daten.weg }).filter(function (h) { return h.art === 'wb'; })[0];
    if (!wb) return;
    var box = el('div', 'hb-hinweise hb-start'); box.id = 'hbStart';
    var e = hinweisElement(wb, startHinweis);
    var b = e.querySelector('.btns'); b.insertBefore(knopf('btn ghost klein', t('hb.kachel'), function () { ctx.zeige('haushalt', true); }), b.firstChild);
    box.appendChild(e);
    // Unter der Begrüßung (Überschrift und Satz) und vor den Kacheln, damit sie den Gruß nicht trennt und keine anderen Hinweise überdeckt
    var r = v.querySelector('.start-raster'), h = v.querySelector('h2');
    if (r) v.insertBefore(box, r); else if (h && h.nextSibling) v.insertBefore(box, h.nextSibling); else v.appendChild(box);
  }
  function bewilligtBox() {
    var d = el('details', 'hb-karte hb-wb'), su = el('summary'); su.textContent = t('hb.wb.h'); d.appendChild(su);
    if (Object.keys(daten.bewilligt).length) d.open = true;
    d.appendChild(el('p', 'hint', t('hb.wb.t')));
    ['sgb2', 'sgb12', 'wohngeld', 'kiz'].forEach(function (l) {
      var f = el('div', 'field'), lab = el('label'); lab.htmlFor = 'hb-wb-' + l; lab.textContent = t('hb.wb.bis', { l: leistungName(l) }); f.appendChild(lab);
      var i = el('input'); i.type = 'date'; i.id = 'hb-wb-' + l; i.value = daten.bewilligt[l] || '';
      i.addEventListener('change', function () { if (/^\d{4}-\d\d-\d\d$/.test(i.value)) daten.bewilligt[l] = i.value; else delete daten.bewilligt[l]; sichern(); var h = $('hbHinweise'); if (h) hinweise(h, rechnung()); startHinweis(); });
      f.appendChild(i); d.appendChild(f);
    });
    d.appendChild(el('p', 'small', t('hb.wb.quelle')));
    return d;
  }
  function uebernahmeBox(s) {
    var u = uebernahme(s, { kg: daten.plan.kg !== null ? daten.plan.kg : geteilte().kg, energie: daten.plan.aus.energie || 0, leist: daten.plan.leist || 0 });
    var box = el('div', 'hb-karte hb-ue'); box.id = 'hbUe';
    var h = el('h3', '', t('hb.ue.h')); h.id = 'hb-ue-h'; h.tabIndex = -1; box.appendChild(h);
    box.appendChild(el('p', 'hb-ue-t', t('hb.ue.da')));
    var ul = el('ul', 'hb-liste');
    if (!u.da.length) ul.appendChild(el('li', '', t('hb.ue.nichts')));
    u.da.forEach(function (x) {
      var txt = x.was === 'ek' ? t('hb.ue.ek', { art: t('ek.art.' + x.art), b: { eur: x.c / 100 } }) : x.was === 'miete' ? t('hb.ue.miete', { b: { eur: x.c / 100 } }) :
        x.was === 'uh' ? t('hb.ue.uh', { b: { eur: x.c / 100 } }) : t('hb.ue.kinder', { n: String(x.n) });
      ul.appendChild(el('li', 'ok', txt));
    });
    box.appendChild(ul);
    var bestaetigt = {};
    u.fragen.forEach(function (x) {
      var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'hb-frage-' + x.was;
      c.addEventListener('change', function () { bestaetigt[x.was] = c.checked; });
      l.appendChild(c); l.appendChild(el('span', '', t('hb.ue.kgFrage'))); box.appendChild(l);
    });
    if (u.fehlt.length) {
      box.appendChild(el('p', 'hb-ue-t', t('hb.ue.fehlt')));
      var ul2 = el('ul', 'hb-liste');
      u.fehlt.forEach(function (x) { ul2.appendChild(el('li', 'fehlt', t('hb.f.' + x.was, { art: x.art ? t('ek.art.' + x.art) : '' }))); });
      box.appendChild(ul2);
    }
    var b = el('div', 'btns');
    b.appendChild(knopf('btn', t('hb.weiter'), function () {
      if (bestaetigt.kgBezug) { var bz = Object.assign({}, (check() || {}).bezug || {}); bz.kindergeld = true; ctx.setze({ bezug: bz }); }
      ueOffen = false;
      ctx.zeige('leistungen', true);
      markieren(u.fehlt.map(function (x) { return x.feld; }));
    }));
    b.appendChild(knopf('btn ghost', t('hb.abbrechen'), function () { ueOffen = false; renderPlan(); }));
    box.appendChild(b);
    return box;
  }
  // Fehlende Felder im Check markieren (Rahmen und Wort „Fehlt noch“), Markierung verschwindet nach der Eingabe
  function markieren(ids) {
    document.querySelectorAll('.hb-fehlt').forEach(function (f) { f.classList.remove('hb-fehlt'); var m = f.querySelector('.hb-fehlt-t'); if (m) m.remove(); });
    var erstes = null;
    ids.forEach(function (id) {
      var e = $(id); if (!e) return;
      var f = e.closest('.field') || e.closest('label') || e.parentNode; if (!f || f.classList.contains('hb-fehlt')) return;
      f.classList.add('hb-fehlt');
      var m = el('span', 'hb-fehlt-t'); m.textContent = t('hb.markiert'); f.insertBefore(m, f.firstChild);
      var weg = function () { f.classList.remove('hb-fehlt'); if (m.parentNode) m.remove(); };
      f.addEventListener('input', weg, { once: true }); f.addEventListener('change', weg, { once: true });
      if (!erstes && !f.closest('[hidden]')) erstes = f;
    });
    if (erstes) { try { erstes.scrollIntoView({ block: 'center' }); } catch (e) {} }
  }

  // ----- Energiekosten-Check (im Plan unter „Strom und Gas“; keine eigene Kachel) -----
  var SYM_EN = { strom: KAT[1][1], gas: '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-3 5-3 8a6 6 0 0 0 6 6z"/>' }; // wie „Geld sparen“ (Strom, Heizen)
  function zahlAus(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    var F = typeof Fmt !== 'undefined' ? Fmt : require('./fmt.js'), n = F.parse(String(v));
    return n === '' || !isFinite(n) || n < 0 ? NaN : n;
  }
  function zahlLokal(n) { try { return Number(n).toLocaleString(ctx.locale()); } catch (e) { return String(n); } }
  function zahlText(n) { return n === null || n === undefined ? '' : String(n).replace('.', ','); }
  // Sichtbare Fehlermeldung unter dem Feld (verschwindet beim nächsten Neuzeichnen)
  function feldFehler(inp, f) {
    inp.setAttribute('aria-invalid', 'true');
    var fid = inp.id + '-f', m = $(fid);
    if (!m) { m = el('span', 'hb-feld-fehler'); m.id = fid; f.appendChild(m); inp.setAttribute('aria-describedby', ((inp.getAttribute('aria-describedby') || '') + ' ' + fid).trim()); }
    m.textContent = t('hb.en.f.zahl');
  }
  function zahlFeld(id, label, wert, hint, einheit, onWert, dezimal) {
    var f = el('div', 'field hb-feld'), l = el('label'); l.htmlFor = id; l.textContent = label; f.appendChild(l);
    var m = el('div', 'money'), i = el('input'); i.type = 'text'; i.inputMode = 'decimal'; i.autocomplete = 'off'; i.id = id; i.value = zahlText(wert);
    m.appendChild(i); if (einheit) { var u = el('span', '', einheit); u.setAttribute('aria-hidden', 'true'); m.appendChild(u); } f.appendChild(m);
    if (hint) { var h = el('span', 'hint'); h.id = id + '-h'; h.textContent = hint; f.appendChild(h); i.setAttribute('aria-describedby', h.id); }
    i.addEventListener('change', function () {
      var n = dezimal ? dezimalAus(i.value) : zahlAus(i.value);
      if (n !== null && !(n >= 0)) { feldFehler(i, f); return; }
      onWert(n, i, f);
    });
    return f;
  }
  function auswahl(id, label, wert, optionen, onWert) {
    var f = el('div', 'field'), l = el('label'); l.htmlFor = id; l.textContent = label; f.appendChild(l);
    var s = el('select'); s.id = id;
    optionen.forEach(function (o) { var op = el('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    s.value = wert; s.addEventListener('change', function () { onWert(s.value, s, f); }); f.appendChild(s);
    return f;
  }
  function personenZahl() {
    var s = check();
    if (s) { var n = (Number(s.adults) || 0) + (Number(s.kids) || 0) + (Number(s.young) || 0); if (n > 0) return n; }
    return daten.energie.personen;
  }
  function enSparten() { return daten.energie.heiz === 'gas' ? ['strom', 'gas'] : ['strom']; }
  function enAktiv() { return enSparten().indexOf(enSparte) >= 0 ? enSparte : 'strom'; }
  function enBezugSgb() { var bz = (check() || {}).bezug || {}; return !!(bz.grundsicherungsgeld || bz.sozialamt); }
  function heuteIso() { return isoTag(new Date()); }
  // Ergebnis (das Wichtigste zuerst): Wort, Betrag, Vorschlag, Hinweise zur Genauigkeit, Vergleich
  function enErgebnis(box) {
    box.innerHTML = '';
    var art = enAktiv(), x = daten.energie[art], r = energieSparte(x, art, heuteIso(), daten.energie.heiz), v = r.verbrauch;
    var wort = el('p', 'hb-en-erg'); box.appendChild(wort);
    var fehlt = [];
    if (!(x.a > 0)) fehlt.push(t('hb.en.abschlag'));
    if (v.fehler === 'fehlt') fehlt.push(t(x.weg === 'rechnung' ? 'hb.en.jahr' : 'hb.en.z2'));
    if (r.fehltFaktor) fehlt.push(t('hb.en.gas.faktor'));
    if (v.fehler && v.fehler !== 'fehlt') { wort.classList.add('fehler'); wort.textContent = t('hb.en.f.' + v.fehler); return r; }
    if (fehlt.length) { wort.classList.add('offen'); wort.textContent = t('hb.en.fehlt', { was: fehlt.join(', ') }); }
    if (r.kwh !== null) {
      box.appendChild(el('p', '', t(v.quelle === 'rechnung' ? 'hb.en.verbrauch.rechnung' : 'hb.en.verbrauch', { kwh: zahlLokal(r.kwh) })));
      if (v.ungenau) box.appendChild(el('p', 'hint hb-en-ungenau', t('hb.en.ungenau') + (v.saison ? ' ' + t('hb.en.saison') : '')));
      if (!r.aktuell) box.appendChild(el('p', 'hint hb-en-alt', t('hb.en.alt')));
      if (v.lang) box.appendChild(el('p', 'hint', t('hb.en.lang')));
    }
    if (r.vergleich) {
      var c = r.vergleich;
      wort.classList.add(c.art); wort.textContent = c.art === 'passt' ? t('hb.en.passt') : t('hb.en.' + c.art, { b: { eur: euroGanz(c.betrag) } });
      if (r.kosten.geschaetzt) box.appendChild(el('p', 'hb-en-schaetz', t('hb.en.schaetz', { ct: zahlText(PREIS[art]) })));
      if (c.art !== 'passt') box.appendChild(el('p', 'hb-en-vorschlag', t('hb.en.vorschlag', { b: { eur: c.vorschlag / 100 } })));
      box.appendChild(el('p', '', t('hb.en.kosten', { b: { eur: euroGanz(r.kosten.cent) }, a: { eur: euroGanz(c.gezahlt) } })));
      if (r.kosten.gpFehlt) box.appendChild(el('p', 'hint', t('hb.en.gp.fehlt')));
      box.appendChild(el('p', 'small', t('hb.en.hinweis')));
    }
    // Vergleich mit dem amtlichen Durchschnitt: nur Strom, nicht bei Heizung mit Strom; nur die Zahl, kein Urteil
    var dv = destatisVergleich(personenZahl());
    if (art === 'strom' && daten.energie.heiz !== 'strom' && dv && r.kwh !== null) {
      box.appendChild(el('p', 'hb-en-dv', t('hb.en.dv.zeile', { n: t(['hb.en.dv.n1', 'hb.en.dv.n2', 'hb.en.dv.n3'][dv.klasse - 1]), kwh: zahlLokal(dv.kwh) })));
      box.appendChild(el('p', 'small', t('hb.en.dv.quelle') + ' ' + t('hb.en.dv.link')));
    }
    return r;
  }
  function enDetails(cls, sum, kinder) {
    var d = el('details', 'hb-en-det ' + cls), s = el('summary'); s.textContent = sum; d.appendChild(s);
    kinder.forEach(function (k) { if (k) d.appendChild(typeof k === 'string' ? el('p', '', k) : k); });
    return d;
  }
  function enSetze(fn, fokusId) { fn(daten.energie); sichern(); renderPlan(fokusId); }
  // Abschläge in den Plan („Strom und Gas“) übernehmen: leer → schreiben, anderer Wert → fragen
  function enPlanUebernahme(feld, fokusId) {
    var en = daten.energie, neu = enSparten().reduce(function (a, s) { return a + (en[s].a > 0 ? en[s].a : 0); }, 0);
    var alt = daten.plan.aus.energie === undefined ? null : daten.plan.aus.energie;
    if (!(neu > 0)) { renderPlan(fokusId); return; }
    var a = aenderung(alt, neu), schreib = function () { daten.plan.aus.energie = neu; sichern(); renderPlan(fokusId); };
    if (a === 'gleich') { renderPlan(fokusId); return; }
    if (a === 'schreiben') { schreib(); return; }
    var e = $('hbEnErgebnis'); if (e) enErgebnis(e);
    fragen(feld, t('hb.en.frage.plan', { alt: eur(alt), neu: eur(neu) }), schreib, function () { renderPlan(fokusId); });
  }
  function energieBox() {
    var en = daten.energie, art = enAktiv(), x = en[art], sgb = enBezugSgb(), p = 'hb-en-';
    var box = el('section', 'hb-karte hb-en'); box.id = 'hbEnergie';
    var h = el('h3', 'hb-h3', t('hb.en.h')); h.id = 'hb-en-h'; h.tabIndex = -1; box.appendChild(h);
    box.appendChild(el('p', 'hint', t('hb.en.lead')));
    var erg = el('div', 'hb-en-ergebnis'); erg.id = 'hbEnErgebnis'; erg.setAttribute('aria-live', 'polite'); box.appendChild(erg);
    var r = enErgebnis(erg);
    // Eingaben
    box.appendChild(auswahl(p + 'heiz', t('hb.en.heiz'), en.heiz, [['', '–'], ['miete', t('hb.en.heiz.miete')], ['gas', t('hb.en.heiz.gas')], ['strom', t('hb.en.heiz.strom')], ['andere', t('hb.en.heiz.andere')]],
      function (w) { enSetze(function (e) { e.heiz = w; }, p + 'heiz'); }));
    if (en.heiz === 'gas') {
      var tabs = el('div', 'hb-en-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', t('hb.en.h'));
      ['strom', 'gas'].forEach(function (s) {
        var b = el('button', 'hb-en-tab'); b.type = 'button'; b.id = p + 'tab-' + s; b.setAttribute('aria-pressed', String(s === art));
        b.innerHTML = '<span class="hb-sym"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + SYM_EN[s] + '</svg></span><span>' + esc(t('hb.en.tab.' + s)) + '</span>';
        b.addEventListener('click', function () { enSparte = s; renderPlan(b.id); });
        tabs.appendChild(b);
      });
      box.appendChild(tabs);
    }
    var fs = el('fieldset', 'hb-en-felder'); fs.appendChild(el('legend', '', t('hb.en.tab.' + art)));
    fs.appendChild(geldFeld(p + 'a', t('hb.en.abschlag'), x.a, t('hb.en.abschlag.t'), function (neu, inp, feld) {
      x.a = neu > 0 ? neu : null; sichern(); enPlanUebernahme(feld, p + 'a');
    }));
    fs.appendChild(auswahl(p + 'n', t('hb.en.anzahl'), String(x.n), [['12', t('hb.en.anzahl.12')], ['11', t('hb.en.anzahl.11')]], function (w) { enSetze(function () { x.n = w === '11' ? 11 : 12; }, p + 'n'); }));
    fs.appendChild(auswahl(p + 'weg', t('hb.en.weg'), x.weg, [['zaehler', t('hb.en.weg.zaehler')], ['rechnung', t('hb.en.weg.rechnung')]], function (w) { enSetze(function () { x.weg = w; }, p + 'weg'); }));
    if (art === 'gas') {
      var lm = el('label', 'check'), cm = el('input'); cm.type = 'checkbox'; cm.id = p + 'm3'; cm.checked = !!x.m3;
      cm.addEventListener('change', function () { enSetze(function () { x.m3 = cm.checked; }, p + 'm3'); });
      lm.appendChild(cm); lm.appendChild(el('span', '', t('hb.en.gas.einheit'))); fs.appendChild(lm);
      if (x.m3) fs.appendChild(zahlFeld(p + 'faktor', t('hb.en.gas.faktor'), x.faktor, '', 'kWh/m³', function (n, inp, f) {
        if (n !== null && !(n >= 5 && n <= 15)) { feldFehler(inp, f); return; }
        enSetze(function () { x.faktor = n; }, p + 'faktor');
      }, true));
    }
    var einheit = art === 'gas' && x.m3 ? 'm³' : 'kWh';
    var ganzSetzen = function (k, id) { return function (n, inp, f) { if (n !== null && !(n >= 0)) { feldFehler(inp, f); return; } enSetze(function () { x[k] = n === null ? null : Math.round(n); if (k === 'z2' && n !== null && !x.d2) x.d2 = heuteIso(); }, id); }; };
    var datum = function (k, label) {
      var f = el('div', 'field'), l = el('label'); l.htmlFor = p + k; l.textContent = label; f.appendChild(l);
      var i = el('input'); i.type = 'date'; i.id = p + k; i.value = x[k] || ''; i.max = heuteIso();
      i.addEventListener('change', function () { enSetze(function () { x[k] = ISO.test(i.value) ? i.value : ''; }, p + k); });
      f.appendChild(i); return f;
    };
    if (x.weg === 'zaehler') {
      fs.appendChild(zahlFeld(p + 'z1', t('hb.en.z1').replace('kWh', einheit), x.z1, t('hb.en.z1.t'), einheit, ganzSetzen('z1', p + 'z1')));
      fs.appendChild(datum('d1', t('hb.en.d1')));
      fs.appendChild(zahlFeld(p + 'z2', t('hb.en.z2').replace('kWh', einheit), x.z2, t('hb.en.z2.t'), einheit, ganzSetzen('z2', p + 'z2')));
      fs.appendChild(datum('d2', t('hb.en.d2')));
    } else {
      fs.appendChild(zahlFeld(p + 'jahr', t('hb.en.jahr').replace('kWh', einheit), x.jahr, '', einheit, ganzSetzen('jahr', p + 'jahr')));
    }
    fs.appendChild(zahlFeld(p + 'ap', t('hb.en.ap'), x.ap, '', 'ct', function (n, inp, f) {
      if (n !== null && !(n > 0 && n < 200)) { feldFehler(inp, f); return; }
      enSetze(function () { x.ap = n; }, p + 'ap');
    }, true));
    fs.appendChild(geldFeld(p + 'gp', t('hb.en.gp'), x.gp, t('hb.en.preis.t'), function (neu) { enSetze(function () { x.gp = neu; }, p + 'gp'); }));
    // Warmwasser mit Strom: dasselbe Feld wie im Leistungs-Check (eine Datenquelle)
    var s = check(), lw = el('label', 'check'), cw = el('input'); cw.type = 'checkbox'; cw.id = p + 'ww'; cw.checked = !!(s && s.warmwasser);
    var fw = el('div', 'field');
    cw.addEventListener('change', function () {
      var alt = !!((check() || {}).warmwasser), neu = cw.checked, schreib = function () { ctx.setze({ warmwasser: neu }); renderPlan(p + 'ww'); };
      if (!alt || alt === neu) { schreib(); return; }
      fragen(fw, t('hb.en.frage.ww'), schreib, function () { cw.checked = alt; cw.focus(); });
    });
    lw.appendChild(cw); lw.appendChild(el('span', '', t('hb.en.ww'))); fw.appendChild(lw); fw.appendChild(el('span', 'hint', t('hb.en.ww.t'))); fs.appendChild(fw);
    if (!s) fs.appendChild(zahlFeld(p + 'personen', t('hb.en.personen'), en.personen, '', '', function (n, inp, f) {
      if (n !== null && !(n >= 1 && n <= 20)) { feldFehler(inp, f); return; }
      enSetze(function (e) { e.personen = n === null ? null : Math.round(n); }, p + 'personen');
    }));
    box.appendChild(fs);

    // Details zum Aufklappen (Reihenfolge = Wichtigkeit)
    var anp = enDetails('hb-en-anp', t('hb.en.anp.s'), [t('hb.en.anp.t'), sgb && en.heiz === 'gas' ? t('hb.en.anp.sgb') : '']);
    if (r.belastbar && r.vergleich.art !== 'passt' && x.weg === 'zaehler') {
      var bb = el('div', 'btns');
      bb.appendChild(knopf('btn ghost', t('hb.en.anp.brief'), function () {
        if (anp.querySelector('textarea')) return;
        var l = el('label'); l.htmlFor = 'hb-en-briefText'; l.textContent = t('hb.en.anp.briefLabel'); anp.appendChild(l);
        var ta = el('textarea'); ta.id = 'hb-en-briefText'; ta.rows = 14; ta.lang = 'de';
        ta.value = abschlagBrief({ art: r.vergleich.art, datum: ctx.datumDe(new Date(+x.d2.slice(0, 4), +x.d2.slice(5, 7) - 1, +x.d2.slice(8, 10))), stand: String(x.z2), einheit: einheit,
          kwh: r.kwh.toLocaleString('de-DE'), neu: ctx.euroDe(r.vergleich.vorschlag / 100) });
        anp.appendChild(ta);
        var m = el('p', 'small'); m.setAttribute('aria-live', 'polite');
        anp.appendChild(knopf('btn', t('hb.hw.briefAus'), function () { ctx.textAusgeben(ta.value, 'Abschlag', m); }));
        anp.appendChild(m); ta.focus();
      }, { id: p + 'brief' }));
      anp.appendChild(bb);
    }
    box.appendChild(anp);
    var heizt = en.heiz === 'gas' || en.heiz === 'strom', ww = !!(s && s.warmwasser), st1 = ctx.regeln && ctx.regeln().regelbedarf && ctx.regeln().regelbedarf.alleinstehend;
    var allein = s && Number(s.adults) === 1 && (Number(s.kids) || 0) + (Number(s.young) || 0) === 0;
    var rbE = st1 ? regelbedarfAnteile(st1).filter(function (a) { return a.k === 'energie'; })[0] : null;
    var nz = [sgb ? t('hb.en.nz.strom.sgb') : '', sgb && heizt ? t('hb.en.nz.heiz.sgb') : '', !sgb && heizt ? t('hb.en.nz.heiz.ohne') : '', ww ? t('hb.en.nz.ww') : '',
      allein && rbE ? t('hb.en.nz.rb', { p: String(rbE.prozent), b: { eur: rbE.euro } }) : ''];
    if (nz.some(Boolean)) {
      var nzd = enDetails('hb-en-nz', t('hb.en.nz.s'), nz);
      if (ww) { var nb = el('div', 'btns'); nb.appendChild(knopf('btn ghost klein', t('hb.zumCheck'), function () { ctx.zeige('leistungen', true); })); nzd.appendChild(nb); }
      box.appendChild(nzd);
    }
    box.appendChild(enDetails('hb-en-sperre', t('hb.en.sperre.s'), [t('sp.schulden.strom'), t('hb.en.sperre.raten')]));
    box.appendChild(enDetails('hb-en-ssc', t('hb.en.ssc.s'), [t('sp.strom.6'), t('hb.en.ssc')]));
    var thema = art === 'gas' || en.heiz === 'strom' ? 'heizen' : 'strom', ul = el('ul', 'hb-liste');
    [1, 2, 3, 4, 5].forEach(function (i) { ul.appendChild(el('li', '', t('sp.' + thema + '.' + i))); });
    var tip = enDetails('hb-en-tipps', t('hb.en.tipps.s'), [ul, el('p', 'small', t('sp.quellen'))]);
    if (ctx.sparen) { var tb = el('div', 'btns'); tb.appendChild(knopf('btn ghost klein', t('hb.en.mehrTipps'), function () { ctx.sparen(thema); })); tip.appendChild(tb); }
    box.appendChild(tip);
    box.appendChild(enDetails('hb-en-wie', t('hb.en.wie.s'), [t('hb.en.wie', { tolEur: { eur: TOL.cent / 100 }, tolProz: String(TOL.anteil * 100) })]));
    return box;
  }
  // Zeile fürs Druckblatt (Fachkräfte): nur belastbares Ergebnis, keine Zählerstände oder Nummern
  function enOeffnen() { ansicht = 'plan'; offenKat = 'energie'; enOffen = true; render('hb-en-h'); }
  function energieZeile() {
    var b = energieNachzahlung(daten.energie, heuteIso());
    return b > 0 ? t('hb.en.druck', { b: { eur: euroGanz(b) } }) : '';
  }

  // ----- Beratungsmodus (Schalter aus claude/beratung-hilfen): Abfrage, ob es ihn gibt; sonst null = immer anbieten -----
  function beratung() {
    try { if (window.SoloBeratung && typeof window.SoloBeratung.an === 'function') return !!window.SoloBeratung.an(); } catch (e) {}
    var a = $('app');
    if (a && a.hasAttribute('data-beratung')) return /^(1|an|true)$/.test(a.getAttribute('data-beratung'));
    return null;
  }
  function planText() {
    var g = geteilte(), r = rechnung(), z = [t('hb.druck.h'), t('hb.druck.stand', { d: ctx.datum(new Date()) }), '', t('hb.ein')];
    var ein = [[t('hb.ek1'), g.ek1], [t('hb.ek1b'), g.ek1b], [g.zwei ? t('hb.ek2') : '', g.zwei ? g.ek2 : null], [g.zwei ? t('hb.ek2b') : '', g.zwei ? g.ek2b : null], [t('hb.kg'), daten.plan.kg !== null ? daten.plan.kg : g.kg], [t('hb.uh'), g.uh], [t('hb.leist'), daten.plan.leist], [t('hb.sonstEin'), daten.plan.sonst]];
    ein.forEach(function (x) { if (x[1]) z.push('  ' + x[0] + ': ' + eur(x[1])); });
    z.push('  = ' + eur(r.ein), '', t('hb.aus'));
    var aus = planAus(); KAT_IDS.forEach(function (k) { if (aus[k]) z.push('  ' + katName(k) + ': ' + eur(aus[k])); });
    z.push('  = ' + eur(r.aus), '', ergebnisSatz(r));
    var ez = energieZeile(); if (ez) z.push(ez);
    return z.join('\n');
  }
  function drucken() { ctx.textAusgeben(planText(), t('hb.druck.h'), $('hbExportMsg')); } // Druck-CSS wie bei den Schreiben (#druckBrief)
  function exportCsv() {
    var msg = $('hbExportMsg'), heute = monatVon(isoTag(new Date()));
    var von = daten.buch.reduce(function (a, e) { var m = monatVon(e.d); return m < a ? m : a; }, heute);
    var text = '﻿' + csv(daten.buch, [t('hb.datum'), t('hb.kat'), t('hb.betrag'), t('hb.notiz'), t('hb.wieder.kurz')], katName, von, heute > monat ? heute : monat);
    var name = 'Haushaltsbuch-' + isoTag(new Date()) + '.csv';
    var fsys = ctx.plug && ctx.plug('Filesystem'), sh = ctx.plug && ctx.plug('Share');
    if (ctx.nativ) {
      if (!fsys || !sh) { msg.textContent = t('hb.csv.fehler'); return; }
      fsys.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' })
        .then(function (r) { return sh.share({ title: name, files: [r.uri] }).then(function () {}, function () {}); })
        .then(function () { msg.textContent = ''; return fsys.deleteFile({ path: name, directory: 'CACHE' }).catch(function () {}); })
        .catch(function () { msg.textContent = t('hb.csv.fehler'); });
      return;
    }
    try {
      var url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
      var a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      msg.textContent = t('hb.csv.ok', { name: name });
    } catch (e) { msg.textContent = t('hb.csv.fehler'); }
  }

  // ----- Haushaltsbuch -----
  function monatsName(ym) {
    try { return new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1, 1).toLocaleDateString(ctx.locale(), { month: 'long', year: 'numeric' }); } catch (e) { return ym; }
  }
  function monatsLeiste(box, nachher) {
    var d = el('div', 'hb-monat');
    d.appendChild(knopf('hb-mon-knopf', '‹', function () { monat = monatPlus(monat, -1); nachher('hb-mon-vor'); }, { 'aria-label': t('hb.vor'), id: 'hb-mon-vor' }));
    var n = el('b', 'hb-mon-name'); n.textContent = monatsName(monat); n.setAttribute('aria-live', 'polite'); d.appendChild(n);
    d.appendChild(knopf('hb-mon-knopf', '›', function () { monat = monatPlus(monat, 1); nachher('hb-mon-nach'); }, { 'aria-label': t('hb.nach'), id: 'hb-mon-nach' }));
    box.appendChild(d);
  }
  function neueEingabe(werte) {
    eingabe = Object.assign({ id: '', betrag: '', k: '', d: isoTag(new Date()), n: '', w: false, scan: '' }, werte || {});
  }
  function renderBuch(fokusId) {
    var box = $('hbInhalt'); box.innerHTML = '';
    if (eingabe) { renderEingabe(box); if (fokusId && $(fokusId)) $(fokusId).focus(); return; }
    var top = el('div', 'hb-gross');
    top.appendChild(knopf('btn hb-plus', '+ ' + t('hb.neu'), function () { neueEingabe(); renderBuch('hb-betrag'); }, { id: 'hb-neu' }));
    top.appendChild(knopf('btn ghost hb-plus', t('hb.scan'), scannen, { id: 'hb-scan' }));
    box.appendChild(top);
    var sm = el('p', 'small'); sm.id = 'hbScanMsg'; sm.setAttribute('aria-live', 'polite'); sm.textContent = t('hb.scan.t'); box.appendChild(sm);
    monatsLeiste(box, renderBuch);
    var liste = monatsEintraege(daten.buch, monat);
    box.appendChild(el('p', 'hb-summe', t('hb.summe', { m: monatsName(monat), b: { eur: summe(liste.map(function (e) { return e.c; })) / 100 } })));
    if (!liste.length) box.appendChild(el('p', 'muted', t('hb.liste.leer')));
    var ul = el('ul', 'hb-eintraege');
    liste.forEach(function (e) {
      var li = el('li', 'hb-eintrag');
      li.innerHTML = '<span class="hb-sym">' + katSym(e.k) + '</span><span class="hb-e-txt"><b>' + esc(katName(e.k)) + '</b><span>' + esc(ctx.datum(new Date(+e.d.slice(0, 4), +e.d.slice(5, 7) - 1, +e.d.slice(8, 10)))) +
        (e.w ? ' · ' + esc(t('hb.wieder.kurz')) : '') + (e.bs || e.bp ? ' · ' + esc(t('hb.beleg.kurz')) : '') + (e.n ? ' · ' + esc(e.n) : '') + '</span></span><span class="hb-e-betrag">' + esc(eur(e.c)) + '</span>';
      var bt = el('span', 'hb-e-knoepfe');
      bt.appendChild(knopf('btn ghost klein', t('hb.bearbeiten'), function () {
        var o = daten.buch.filter(function (x) { return x.id === e.id; })[0]; if (!o) return;
        neueEingabe({ id: o.id, betrag: String((o.c / 100).toFixed(2)).replace('.', ','), k: o.k, d: o.d, n: o.n || '', w: !!o.w, bs: !!o.bs, bp: !!o.bp });
        renderBuch('hb-betrag');
      }, { 'aria-label': t('hb.bearbeiten') + ': ' + katName(e.k) + ' ' + eur(e.c) }));
      bt.appendChild(knopf('btn ghost klein', t('hb.loeschen'), function () { loeschen(e); }, { 'aria-label': t('hb.loeschen') + ': ' + katName(e.k) + ' ' + eur(e.c) }));
      li.appendChild(bt); ul.appendChild(li);
    });
    box.appendChild(ul);
    if (rueck) {
      var r = el('div', 'hb-rueck'); r.setAttribute('role', 'status');
      r.appendChild(el('span', '', rueck.text));
      r.appendChild(knopf('btn ghost klein', t('hb.rueck'), function () { daten.buch = rueck.vorher; rueck = null; sichern(); renderBuch('hb-neu'); }, { id: 'hb-rueck' }));
      box.appendChild(r);
    }
    // Ganzes Haushaltsbuch löschen (der Plan bleibt); „Rückgängig“ wie beim einzelnen Eintrag
    if (daten.buch.length) {
      var lb = el('div', 'btns');
      lb.appendChild(knopf('btn ghost klein', t('hb.buchLoeschen'), function () { rueck = { vorher: JSON.parse(JSON.stringify(daten.buch)), text: t('hb.buchGeloescht') }; daten.buch = []; sichern(); renderBuch('hb-rueck'); }, { id: 'hb-buchLoeschen' }));
      box.appendChild(lb);
    }
    if (fokusId && $(fokusId)) $(fokusId).focus();
  }
  function loeschen(e) {
    var vorher = JSON.parse(JSON.stringify(daten.buch)), o = daten.buch.filter(function (x) { return x.id === e.id; })[0]; if (!o) return;
    var text = t('hb.geloescht');
    // Wiederkehrend und nicht im ersten Monat: ab diesem Monat beenden, frühere Monate bleiben
    if (o.w && monat > monatVon(o.d)) { o.bis = monatPlus(monat, -1); text = t('hb.beendet'); }
    else daten.buch = daten.buch.filter(function (x) { return x.id !== e.id; });
    rueck = { vorher: vorher, text: text };
    sichern(); renderBuch('hb-rueck');
  }
  function renderEingabe(box) {
    var f = el('div', 'hb-karte hb-eingabe');
    if (eingabe.scan) { var sc = el('p', 'hb-scaninfo'); sc.id = 'hbScanInfo'; sc.setAttribute('role', 'status'); sc.textContent = eingabe.scan; f.appendChild(sc); }
    // Betrag: Feld (Tastatur möglich) und große Zahlenknöpfe
    var fb = el('div', 'field'), lb = el('label'); lb.htmlFor = 'hb-betrag'; lb.textContent = t('hb.betrag'); fb.appendChild(lb);
    var mo = el('div', 'money hb-betrag'), inp = el('input'); inp.id = 'hb-betrag'; inp.type = 'text'; inp.inputMode = 'decimal'; inp.autocomplete = 'off'; inp.value = eingabe.betrag;
    inp.addEventListener('input', function () { eingabe.betrag = inp.value; });
    mo.appendChild(inp); var eu = el('span', '', '€'); eu.setAttribute('aria-hidden', 'true'); mo.appendChild(eu); fb.appendChild(mo); f.appendChild(fb);
    var pad = el('div', 'hb-pad'); pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', t('hb.betrag'));
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].forEach(function (z) {
      var b = knopf('hb-taste', z, function () {
        var v = eingabe.betrag;
        if (z === '⌫') v = v.slice(0, -1);
        else if (z === ',') { if (v.indexOf(',') < 0) v = (v || '0') + ','; }
        else if (/,\d\d$/.test(v) || v.replace(/,.*/, '').length >= 6 && v.indexOf(',') < 0) return;
        else v = v === '0' ? z : v + z;
        eingabe.betrag = v; inp.value = v;
      }, z === '⌫' ? { 'aria-label': t('hb.loeschen.z') } : z === ',' ? { 'aria-label': t('hb.komma') } : null);
      pad.appendChild(b);
    });
    f.appendChild(pad);
    // Kategorie per Tipp
    var fk = el('fieldset', 'hb-katwahl'); fk.appendChild(el('legend', '', t('hb.kat')));
    var g = el('div', 'hb-kats klein');
    KAT.forEach(function (k) {
      var b = el('button', 'hb-kat'); b.type = 'button'; b.setAttribute('aria-pressed', String(eingabe.k === k[0])); b.id = 'hb-wahl-' + k[0];
      b.innerHTML = '<span class="hb-sym">' + katSym(k[0]) + '</span><span class="hb-kname">' + esc(katName(k[0])) + '</span>';
      b.addEventListener('click', function () { eingabe.k = k[0]; g.querySelectorAll('.hb-kat').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
      g.appendChild(b);
    });
    fk.appendChild(g); f.appendChild(fk);
    // Datum (heute), Notiz, wiederkehrend
    var fd = el('div', 'field'), ld = el('label'); ld.htmlFor = 'hb-datum'; ld.textContent = t('hb.datum'); fd.appendChild(ld);
    var di = el('input'); di.type = 'date'; di.id = 'hb-datum'; di.value = eingabe.d; di.addEventListener('change', function () { eingabe.d = di.value; }); fd.appendChild(di); f.appendChild(fd);
    var fn = el('div', 'field'), ln = el('label'); ln.htmlFor = 'hb-notiz'; ln.textContent = t('hb.notiz'); fn.appendChild(ln);
    var ni = el('input'); ni.type = 'text'; ni.id = 'hb-notiz'; ni.maxLength = 80; ni.autocomplete = 'off'; ni.value = eingabe.n; ni.addEventListener('input', function () { eingabe.n = ni.value; }); fn.appendChild(ni); f.appendChild(fn);
    var lw = el('label', 'check'), cw = el('input'); cw.type = 'checkbox'; cw.id = 'hb-wieder'; cw.checked = eingabe.w; cw.addEventListener('change', function () { eingabe.w = cw.checked; });
    lw.appendChild(cw); lw.appendChild(el('span', '', t('hb.wieder'))); f.appendChild(lw);
    if (eingabe.id && eingabe.w) f.appendChild(el('p', 'hint', t('hb.wieder.hint')));
    f.appendChild(belegFeld(f));
    var msg = el('p', 'warn'); msg.id = 'hbEingabeMsg'; msg.setAttribute('role', 'alert'); msg.hidden = true; f.appendChild(msg);
    var bt = el('div', 'btns');
    bt.appendChild(knopf('btn', t('hb.speichern'), function () {
      var c = zuCent(eingabe.betrag);
      var fehler = !(c > 0) ? 'hb.bitteBetrag' : !eingabe.k ? 'hb.bitteKat' : !/^\d{4}-\d\d-\d\d$/.test(eingabe.d) ? 'hb.datum' : '';
      if (fehler) { msg.hidden = false; msg.textContent = t(fehler); (fehler === 'hb.bitteBetrag' ? inp : fehler === 'hb.datum' ? di : g.querySelector('button')).focus(); return; }
      var e = { id: eingabe.id || ('e' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36)), d: eingabe.d, c: c, k: eingabe.k, n: eingabe.n.trim(), w: !!eingabe.w };
      if (eingabe.bs) e.bs = true; if (eingabe.bp) e.bp = true;
      var alt = daten.buch.filter(function (x) { return x.id === e.id; })[0];
      if (alt && alt.bis && e.w) e.bis = alt.bis;
      daten.buch = daten.buch.filter(function (x) { return x.id !== e.id; }).concat([e]);
      monat = monatVon(e.d); eingabe = null; rueck = null; sichern();
      renderBuch('hb-neu'); var sm = $('hbScanMsg'); if (sm) sm.textContent = t('hb.gespeichert');
    }, { id: 'hb-speichern' }));
    bt.appendChild(knopf('btn ghost', t('hb.abbrechen'), function () { eingabe = null; renderBuch('hb-neu'); }));
    f.appendChild(bt); box.appendChild(f);
  }

  // ----- Kassenzettel scannen: derselbe Weg wie „Brief prüfen“ (App: Kamera und Texterkennung des Geräts; Browser: Bild wählen) -----
  function scannen() {
    if (scanLaeuft) return;
    var msg = $('hbScanMsg');
    var weiter = function (text) {
      scanLaeuft = false;
      var r = kassenzettel(text, new Date());
      var info = r.summe !== null && r.sicher ? t('hb.scan.ok') : r.summe !== null || r.datum || r.geschaeft ? t('hb.scan.teil') : t('hb.scan.nichts');
      neueEingabe({ betrag: r.summe !== null ? String((r.summe / 100).toFixed(2)).replace('.', ',') : '', k: r.kat || '', d: r.datum || isoTag(new Date()), n: r.geschaeft || '', scan: info });
      renderBuch('hbScanInfo');
    };
    var fehler = function (e) { scanLaeuft = false; if (msg) msg.textContent = /cancel/i.test(String(e && (e.message || e) || '')) ? '' : t('hb.scan.fehler'); };
    if (ctx.nativ && ctx.foto) { scanLaeuft = true; if (msg) msg.textContent = t('hb.scan.lese'); ctx.foto().then(weiter, fehler); return; }
    var fi = $('hbFile');
    if (!fi) {
      fi = el('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.setAttribute('capture', 'environment'); fi.id = 'hbFile'; fi.hidden = true; fi.tabIndex = -1;
      fi.addEventListener('change', function () {
        var f = fi.files && fi.files[0]; if (!f || !ctx.bild) return;
        scanLaeuft = true; var m = $('hbScanMsg'); if (m) m.textContent = t('hb.scan.lese') + ' ' + t('hb.scan.web');
        ctx.bild(f).then(function (x) { fi.value = ''; weiter(x); }, function (e) { fi.value = ''; fehler(e); }); // Bild nicht behalten
      });
      document.body.appendChild(fi);
    }
    fi.value = ''; fi.click();
  }

  // ----- Auswertung -----
  function renderAusw(fokusId) {
    var box = $('hbInhalt'); box.innerHTML = '';
    monatsLeiste(box, renderAusw);
    var aw = auswertung(daten.buch, monat);
    if (!aw.zeilen.length) { box.appendChild(el('p', 'muted', t('hb.ausw.leer'))); box.appendChild(belegBox()); if (fokusId && $(fokusId)) $(fokusId).focus(); return; }
    var max = aw.zeilen.reduce(function (a, z) { return Math.max(a, z.c, z.vor); }, 1);
    var ul = el('ul', 'hb-balken');
    aw.zeilen.forEach(function (z) {
      var li = el('li');
      var diff = z.diff > 0 ? t('hb.ausw.mehr', { b: { eur: z.diff / 100 } }) : z.diff < 0 ? t('hb.ausw.weniger', { b: { eur: -z.diff / 100 } }) : t('hb.ausw.gleich');
      li.innerHTML = '<div class="hb-b-kopf"><span class="hb-sym">' + katSym(z.k) + '</span><b>' + esc(katName(z.k)) + '</b><span class="hb-b-wert">' + esc(eur(z.c)) + '</span></div>' +
        '<div class="hb-b-spur" aria-hidden="true"><span style="width:' + Math.round(z.c / max * 100) + '%"></span></div>' +
        '<div class="hb-b-spur vor" aria-hidden="true"><span style="width:' + Math.round(z.vor / max * 100) + '%"></span></div>' +
        '<p class="small">' + esc(t('hb.ausw.vm', { b: { eur: z.vor / 100 } })) + ' · ' + esc(diff) + '</p>';
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var sd = aw.summe - aw.vorSumme;
    var su = el('p', 'hb-summe', t('hb.ausw.summe', { b: { eur: aw.summe / 100 } }) + ' ');
    su.appendChild(el('span', 'small', t('hb.ausw.vm', { b: { eur: aw.vorSumme / 100 } }) + ' · ' +
      (sd > 0 ? t('hb.ausw.mehr', { b: { eur: sd / 100 } }) : sd < 0 ? t('hb.ausw.weniger', { b: { eur: -sd / 100 } }) : t('hb.ausw.gleich'))));
    box.appendChild(su);
    // Spartipps (höchstens 3) mit Quelle
    var tp = tipps(aw);
    if (tp.length) {
      box.appendChild(el('h3', 'hb-h3', t('hb.tipps')));
      var tl = el('ul', 'hb-tipps');
      tp.forEach(function (k) {
        var li = el('li'); li.innerHTML = '<b>' + esc(katName(k)) + '</b><p>' + esc(t('hb.tipp.' + k)) + '</p><p class="small">' + esc(t('hb.quelle', { q: t('hb.quelle.' + k) })) + '</p>';
        if (k === 'raten') li.appendChild(knopf('btn ghost', t('hb.zuSchulden'), function () { ctx.zeige('pfaendung', true); }));
        if (k === 'energie') li.appendChild(knopf('btn ghost', t('hb.en.knopf'), enOeffnen));
        if (k === 'kinder' || k === 'miete') li.appendChild(knopf('btn ghost', t('hb.zumCheck'), function () { ctx.zeige('leistungen', true); }));
        tl.appendChild(li);
      });
      box.appendChild(tl);
    }
    // Regelbedarf zur Orientierung (aufklappbar, nicht wertend)
    var st1 = ctx.regeln && ctx.regeln().regelbedarf && ctx.regeln().regelbedarf.alleinstehend;
    if (st1) {
      var d = el('details', 'hb-rb'), su = el('summary'); su.textContent = t('hb.rb.h'); d.appendChild(su);
      d.appendChild(el('p', '', t('hb.rb.t', { b: { eur: st1 } })));
      var rl = el('ul', 'hb-liste');
      regelbedarfAnteile(st1).forEach(function (x) { rl.appendChild(el('li', '', t('hb.rb.zeile', { k: t('hb.rb.' + x.k), p: String(x.prozent), b: { eur: x.euro } }))); });
      d.appendChild(rl); d.appendChild(el('p', 'small', t('hb.rb.quelle')));
      box.appendChild(d);
    }
    box.appendChild(belegBox());
    var hw = el('div', 'hb-hinweise'); hw.id = 'hbHinweise'; box.appendChild(hw); hinweise(hw, rechnung());
    if (fokusId && $(fokusId)) $(fokusId).focus();
  }

  // ----- Rahmen: drei Reiter -----
  function render(fokusId) {
    if (!ctx || !$('hbInhalt') || !daten) return;
    ['plan', 'buch', 'ausw'].forEach(function (a) { var b = $('hb-tab-' + a); if (b) { b.setAttribute('aria-pressed', String(a === ansicht)); b.textContent = t('hb.tab.' + a); } });
    if (ansicht === 'buch') renderBuch(fokusId); else if (ansicht === 'ausw') renderAusw(fokusId); else renderPlan(fokusId);
  }
  function init(c) {
    ctx = c; monat = monatVon(isoTag(new Date())); daten = leer();
    ['plan', 'buch', 'ausw'].forEach(function (a) { var b = $('hb-tab-' + a); if (b) b.addEventListener('click', function () { ansicht = a; eingabe = null; render(); }); });
    // „Alle Angaben löschen“ löscht auch Plan und Haushaltsbuch: das erledigt die App über die Vorgänge (lotse.haushalt in Vorgaenge.DATEN, danach neuLaden)
    var go = $('goHaushalt'); if (go) go.addEventListener('click', function () { ctx.zeige('haushalt', true); });
    speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); startHinweis(); });
  }
  function zeigen() { ueOffen = false; render(); }

  // =====================================================================
  // Geld-Hinweise (Mehrbedarf, Erspartes, Pflege- und Steuer-Belege) und Beleg-Häkchen je Buchung.
  // Entwurf mit Prüfvermerk: docs/entwuerfe/haushaltsbuch-hinweise.md. Gebündelt am Ende, damit das Zusammenführen leicht bleibt.
  // Höchstens EIN Hinweis aus dieser Gruppe gleichzeitig (nicht überladen). Unsichere Fälle nur „möglich“, nie Zusagen.
  // =====================================================================
  var GELD_ARTEN = ['mb', 'verm', 'pflege', 'steuer'];
  var WORTE_GELD = {
    // ohne „Frauenarzt“ und „Kinderwagen“: zu viele falsche Treffer bei einer sehr persönlichen Frage
    // „Schwangerschaftstest“ ist kein Hinweis auf eine Schwangerschaft
    schwanger: /schwanger(?!schaftstest)|umstands|mutterpass|baby(ausstattung|erstausstattung)/i,
    // ohne „Therme“: Gas-Therme läuft meist über die Heizkosten (§ 21 Abs. 7 Satz 1 SGB II)
    ww: /boiler|durchlauferhitzer|warmwasserspeicher/i,
    // ohne „Ernährung“ allein (z. B. „Ernährungsberatung“, „gesunde Ernährung“): kein Hinweis auf eine Krankheit
    ern: /di(ä|ae)t|glutenfrei|z(ö|oe)liakie|laktosefrei|sondennahrung/i,
    dauer: /umgang|besuch.*kind\b|fahrt.*kind\b|hygiene|inkontinenz|medikament/i,
    // „Reinigungsmittel“ und „Brillenputztuch“ sind keine Steuer-Belege
    steuer: /handwerker|reinigung(?!smittel)|haushaltshilfe|g(ä|ae)rtner|schornstein|pflegedienst|apotheke|zuzahlung|brille\b|zahnarzt|arbeitsmittel|fachbuch|laptop.*arbeit/i,
    // Barzahlung schadet nur bei § 35a EStG (Handwerker, haushaltsnahe Dienste), nicht z. B. bei Zuzahlungen in der Apotheke
    hhw: /handwerker|haushalts-?hilfe|putz(hilfe|kraft|frau)|reinigungskraft|g(ä|ae)rtner|maler|klempner|elektriker|installateur|schornstein/i,
    pflegeBeleg: /pflegedienst|alltagshilfe|alltagsbegleit|tagespflege|kurzzeitpflege|verhinderungspflege|betreuungsdienst|inkontinenz|einmalhandschuh|bettschutz/i,
    bar: /(^|[^a-zäöüß])bar([^a-zäöüß]|$)/i
  };
  // Buchung beim Laden bereinigen: nur bekannte Felder; Beleg-Häkchen nur als echtes true (Schutz gegen veränderte Stände)
  // Typen prüfen: id (kurzer Text), d und c prüft normiere, k bekannte Kategorie, n Text bis 80 Zeichen, w nur true, bis 'JJJJ-MM'
  function buchungBereinigen(e, i) {
    var o = { id: typeof e.id === 'string' && /^[\w-]{1,40}$/.test(e.id) ? e.id : 'e-alt-' + i, d: e.d, c: e.c, k: KAT_IDS.indexOf(e.k) >= 0 ? e.k : 'sonst' };
    if (typeof e.n === 'string' && e.n) o.n = e.n.slice(0, 80);
    if (e.w === true) o.w = true;
    if (o.w && typeof e.bis === 'string' && /^\d{4}-\d\d$/.test(e.bis)) o.bis = e.bis;
    if (e.bs === true) o.bs = true;
    if (e.bp === true) o.bp = true;
    return o;
  }
  // Pflege-Belege: laufendes Kalenderjahr; bis 30.6. auch das Vorjahr (nicht verbrauchter Entlastungsbetrag, § 45b Abs. 1 Satz 5 SGB XI)
  function pflegeFenster(d) {
    var iso = typeof d === 'string' ? d : isoTag(d || new Date()), j = +iso.slice(0, 4), vj = iso.slice(5) <= '06-30';
    return { von: (vj ? j - 1 : j) + '-01-01', bis: iso, id: 'pflege-' + j + (vj ? '-vj' : '') };
  }
  // Belege einer Art ('bs' Steuer, 'bp' Pflegekasse) zwischen zwei Tagen, höchstens bis heute (wiederkehrende Buchungen erzeugen
  // sonst künftige Monate); wiederkehrende Buchungen je Monat aufgelöst, nach Datum sortiert
  function belegListe(buch, art, vonIso, bisIso, heuteIso) {
    var h = heuteIso || isoTag(new Date());
    if (h < bisIso) bisIso = h;
    var out = [], ym = monatVon(vonIso), bis = monatVon(bisIso);
    for (var n = 0; ym <= bis && n < 600; n++, ym = monatPlus(ym, 1)) {
      monatsEintraege(buch, ym).forEach(function (e) { if (e[art] === true && e.d >= vonIso && e.d <= bisIso) out.push(e); });
    }
    return out.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  }
  function belegSumme(buch, art, vonIso, bisIso, heuteIso) {
    return belegListe(buch, art, vonIso, bisIso, heuteIso).reduce(function (a, e) { return a + e.c; }, 0);
  }
  // CSV der Belegliste: Datum;Kategorie;Notiz;Betrag;Für (csvFeld schützt vor Formeln)
  function belegCsv(liste, kopf, katName, zweck) {
    var z = [kopf.map(csvFeld).join(';')];
    liste.forEach(function (e) { z.push([e.d, katName(e.k), e.n || '', (e.c / 100).toFixed(2).replace('.', ','), zweck ? zweck(e) : ''].map(csvFeld).join(';')); });
    return z.join('\r\n') + '\r\n';
  }
  // Erspartes nah an einer Vermögensgrenze (App-Regel, kein Gesetz: ab 80 % der Grenze oder in 6 Monaten erreicht).
  // v: Erspartes laut Check (Euro), grenzen: { ggeld, gsa, wohngeld, kiz } (Euro), restCent: was laut Plan im Monat übrig bleibt.
  var VERM_LEISTUNG = [['ggeld', 'grundsicherungsgeld'], ['gsa', 'sozialamt'], ['wohngeld', 'wohngeld'], ['kiz', 'kiz']];
  function vermNah(v, grenzen, restCent, lv, bz) {
    if (v === null || v === undefined || !(v >= 0) || !grenzen) return null;
    lv = lv || {}; bz = bz || {}; restCent = restCent > 0 ? restCent : 0;
    var best = null;
    VERM_LEISTUNG.forEach(function (x) {
      // gMin: kleinste mögliche Grenze, wenn sie vom Alter weiterer Personen abhängt (Paare, Alter unbekannt); dann keine feste Zahl im Text
      var l = x[0], g = grenzen[l], gMin = grenzen[l + 'Min'] > 0 && grenzen[l + 'Min'] < g ? grenzen[l + 'Min'] : 0, ga = gMin || g;
      if (!(bz[x[1]] || lv[l] === 'ja' || lv[l] === 'vielleicht') || !(g > 0) || v > g) return;
      if (!(v >= 0.8 * ga || (restCent > 0 && v * 100 + 6 * restCent > ga * 100))) return;
      if (!best || ga < (best.gMin || best.g)) best = { l: l, g: g, gMin: gMin, etwa: !!gMin, v: v, r: restCent, monate: restCent > 0 && !gMin && v < g ? Math.ceil((g * 100 - v * 100) / restCent) : 0 };
    });
    return best;
  }
  // Nur geltendes Recht: keine Hinweise auf Gesetzentwürfe (z. B. Pflegereform), auch nicht als „Entwurf“ (Regel des Nutzers, 20.11.2026).
  function geldHinweis(e, sgb, notizen, out) {
    var weg = e.weg || {}, lv = e.ergebnis || {}, bz = e.bezug || {}, g = e.geld || {}, hat = g.angaben || {}, kand = [];
    var k = function (id, prio, extra) { if (!weg[id]) kand.push(Object.assign({ id: id, prio: prio }, extra)); };
    var bezugSgb = !!(bz.grundsicherungsgeld || bz.sozialamt), eintraege = e.eintraege || [];
    if (sgb) {
      // Schwangerschaft nur bei Bezug: Der Text sagt „Sag es dem Amt“ (beim Check-Ergebnis „vielleicht“ gibt es noch kein Amt)
      if (bezugSgb && WORTE_GELD.schwanger.test(notizen) && !hat.schwanger) k('mb-schwanger', 56, { art: 'mb', was: 'schwanger' });
      if (WORTE_GELD.ww.test(notizen) && !hat.warmwasser) k('mb-ww', 55, { art: 'mb', was: 'ww' });
      if (WORTE_GELD.ern.test(notizen) && !hat.ernaehrung) k('mb-ern', 54, { art: 'mb', was: 'ern' });
      if (eintraege.some(function (x) { return x.w && x.k === 'sonst' && WORTE_GELD.dauer.test(x.n || ''); })) k('mb-dauer', 52, { art: 'mb', was: 'dauer' });
      // nur mit Auslöser: GdB ab 50 oder Merkzeichen H/Bl/TBl (Wert 'H'); nicht bei „antrag“ oder kleinem GdB
      if ((hat.gdb === 'H' || Number(hat.gdb) >= 50) && !hat.teilhabe && !hat.mzG) k('mb-beh', 51, { art: 'mb', was: 'beh' });
    }
    if (bezugSgb && Number(hat.adults) === 1 && Number(hat.kids) > 0) k('mb-ae', 50, { art: 'mb', was: 'ae' });
    var vn = vermNah(g.verm, g.grenzen, g.rest, lv, bz);
    if (vn) k('verm-' + vn.l + '-' + vn.g, 58, Object.assign({ art: 'verm' }, vn));
    var hIso = isoTag(e.heute || new Date()), fe = pflegeFenster(hIso), pf = g.buchAlle ? belegSumme(g.buchAlle, 'bp', fe.von, fe.bis, hIso) : 0;
    if (pf > 0) k(fe.id, 35, { art: 'pflege', b: pf });
    // Steuer: nicht bei Grundsicherungsgeld/Sozialhilfe ohne eigenes Erwerbseinkommen (keine Steuer, kein Nutzen)
    var erwerb = ['lohn', 'selbst'].indexOf(hat.ek1Art) >= 0 || ['lohn', 'selbst'].indexOf(hat.ek2Art) >= 0;
    if (!(bezugSgb && !erwerb) && eintraege.some(function (x) { return !x.bs && !x.bp && WORTE_GELD.steuer.test(x.n || ''); })) k('steuer', 20, { art: 'steuer' });
    if (kand.length) out.push(kand.sort(function (a, b) { return b.prio - a.prio; })[0]);
  }
  // Daten aus dem Check und dem Plan für geldHinweis (nur in der Oberfläche)
  function geldDaten(r) {
    var s = check(), a = {};
    if (s) {
      ['schwanger', 'warmwasser', 'ernaehrung', 'teilhabe', 'mzG'].forEach(function (f) { a[f] = !!s[f]; });
      a.gdb = s.gdb || ''; a.adults = Number(s.adults) || 0; a.kids = Number(s.kids) || 0; a.pflegegrad = Number(s.pflegegrad) || 0; a.ek1Art = s.ek1Art || ''; a.ek2Art = s.adults === 2 ? s.ek2Art || '' : '';
    }
    var v = s ? wert(s.vermoegen) : null;
    return { angaben: a, verm: v === null ? null : v / 100, grenzen: ctx.grenzen ? ctx.grenzen() : null, rest: r.leer ? 0 : r.rest, buchAlle: daten.buch };
  }
  function prozent(x) { var n = Math.round(x * 1000) / 10; try { return n.toLocaleString(ctx.locale(), { maximumFractionDigits: 1 }); } catch (e) { return String(n); } }
  var VERM_NAME = { ggeld: 'sgb2', gsa: 'sgb12', wohngeld: 'wohngeld', kiz: 'kiz' };
  function geldTexte(h) {
    var R = ctx.regeln ? ctx.regeln() : {}, E = function (x) { return { eur: x }; };
    if (h.art === 'mb') {
      var p = { schwanger: { p: prozent(R.mehr.schwanger) }, ww: { p: prozent(R.mehr.ww.erw) }, ae: { max: prozent(R.mehr.aeMax) }, beh: { p: prozent(R.mehr.teilhabe) } }[h.was] || {};
      return [t('hb.hw.mb.' + h.was), [t('hb.hw.mb.' + h.was + '.d', p)]];
    }
    if (h.art === 'verm') {
      var l = leistungName(VERM_NAME[h.l]), S = R.sgb2.schon;
      var dp = { ggeld: { a: E(S['<30']), b: E(S['30-39']), c: E(S['40-49']), d: E(S['50+']) }, gsa: { a: E(R.grundsicherung.schonAllein), k: E(R.schonUnterhalten) },
        wohngeld: { g1: E(R.wohngeld.vermoegenErste), g2: E(R.wohngeld.vermoegenJeWeitere) }, kiz: { a: E(R.kiz.vermZwei - R.kiz.vermJeWeiteres), b: E(R.kiz.vermJeWeiteres) } }[h.l];
      // Grundsicherungsgeld: immer mit Vorbehalt (Altfälle § 65a SGB II); Paare/Alter unbekannt ohne Zahl; Wohngeld: Richtwert, keine Grenze
      var pre = h.l === 'wohngeld' ? 'hb.hw.verm.wg' : h.l === 'ggeld' ? (h.etwa ? 'hb.hw.verm.gg0' : 'hb.hw.verm.gg') : 'hb.hw.verm';
      var ga = h.gMin || h.g, bald = h.r > 0 && h.v < 0.8 * ga;
      var txt = bald ? t(pre + '.bald', { r: E(euroGanz(h.r)), n: String(h.monate), l: l, g: E(h.g) }) : t(pre, { b: E(h.v), l: l, g: E(h.g) });
      return [txt, [t('hb.hw.verm.d.' + h.l, dp), t('hb.hw.verm.d2')]];
    }
    if (h.art === 'pflege') {
      return [t('hb.hw.pflege', { b: E(h.b / 100) }), [t('hb.hw.pflege.d', { e: E(R.pflege.entlastung), h: E(R.pflegeHm), j: E(R.entlastungsbudget) })]];
    }
    var P = R.pflegePausch;
    return [t('hb.hw.steuer'), [t('hb.hw.steuer.d', { a: E(R.steuer.hnd), hw: E(R.steuer.handwerk), p2: E(P[2]), p3: E(P[3]), p4: E(P[4]), wk: E(R.steuer.anPausch) })]];
  }
  // Hinweis-Element der Gruppe (Text und Details nur über textContent)
  function geldHinweisElement(h, neuZeichnen) {
    var d = el('div', 'hb-hinweis'); d.id = 'hb-hw-' + h.art;
    var tx = geldTexte(h);
    d.appendChild(el('p', '', tx[0]));
    var det = el('details', 'hb-hw-det'), su = el('summary'); su.textContent = t('hb.hw.mehr'); det.appendChild(su);
    tx[1].forEach(function (x) { det.appendChild(el('p', 'small', x)); });
    d.appendChild(det);
    var b = el('div', 'btns');
    if (h.art === 'mb') b.appendChild(knopf('btn ghost klein', t('hb.hw.mb.melden'), function () { ctx.zeige('leistungen', true); }));
    if (h.art === 'verm') b.appendChild(knopf('btn ghost klein', t('hb.hw.verm.check'), function () { ctx.zeige('leistungen', true); markieren(['vermoegen']); }));
    if (h.art === 'pflege' || h.art === 'steuer') b.appendChild(knopf('btn ghost klein', t('hb.hw.belege'), zeigeBelege));
    if (h.art === 'pflege') b.appendChild(knopf('btn ghost klein', t('hb.hw.pflege.knopf'), function () { ctx.zeige('pflegestart', true); }));
    b.appendChild(knopf('btn ghost klein', t('hb.hw.weg'), function () { daten.weg[h.id] = true; sichern(); neuZeichnen(); }));
    d.appendChild(b);
    return d;
  }
  // Eingabe: Häkchen „Beleg aufheben“; erst danach „für die Steuer“ / „für die Pflegekasse“. Passende Notiz: nur Tipp, kein Anhaken.
  function belegFeld(form) {
    var box = el('div', 'hb-beleg');
    var c = function (id, txt, an, parent) { var l = el('label', 'check'), i = el('input'); i.type = 'checkbox'; i.id = id; i.checked = an; l.appendChild(i); l.appendChild(el('span', '', txt)); parent.appendChild(l); return i; };
    var haupt = c('hb-beleg', t('hb.beleg'), !!(eingabe.bs || eingabe.bp), box);
    var sub = el('div', 'hb-beleg-art'); sub.setAttribute('role', 'group'); sub.setAttribute('aria-label', t('hb.beleg'));
    var st = c('hb-beleg-st', t('hb.beleg.st'), !!eingabe.bs, sub), pf = c('hb-beleg-pf', t('hb.beleg.pf'), !!eingabe.bp, sub);
    box.appendChild(sub);
    var tipp = el('p', 'hint', t('hb.beleg.vorschlag')); tipp.id = 'hb-beleg-tipp'; box.appendChild(tipp);
    var bar = el('p', 'warn', t('hb.beleg.bar')); bar.id = 'hb-beleg-bar'; box.appendChild(bar);
    var zeig = function () {
      var an = !!(eingabe.bs || eingabe.bp), n = eingabe.n || '';
      haupt.checked = an; st.checked = !!eingabe.bs; pf.checked = !!eingabe.bp; sub.hidden = !an;
      tipp.hidden = an || !(WORTE_GELD.steuer.test(n) || WORTE_GELD.pflegeBeleg.test(n));
      bar.hidden = !(eingabe.bs && WORTE_GELD.bar.test(n) && WORTE_GELD.hhw.test(n));
    };
    haupt.addEventListener('change', function () {
      if (haupt.checked) { if (WORTE_GELD.pflegeBeleg.test(eingabe.n || '')) eingabe.bp = true; else eingabe.bs = true; } else { eingabe.bs = false; eingabe.bp = false; }
      zeig(); if (haupt.checked) (eingabe.bp ? pf : st).focus();
    });
    st.addEventListener('change', function () { eingabe.bs = st.checked; zeig(); if (!eingabe.bs && !eingabe.bp) haupt.focus(); });
    pf.addEventListener('change', function () { eingabe.bp = pf.checked; zeig(); if (!eingabe.bs && !eingabe.bp) haupt.focus(); });
    var ni = form.querySelector('#hb-notiz'); if (ni) ni.addEventListener('input', zeig);
    zeig();
    return box;
  }
  // Belegliste in der Auswertung (Kalenderjahr, umschaltbar), Druck und CSV
  var blJahr = 0, blOffen = false;
  function zeigeBelege() { ansicht = 'ausw'; eingabe = null; blOffen = true; render('hb-bl-sum'); }
  function belegDaten(j) {
    var st = belegListe(daten.buch, 'bs', j + '-01-01', j + '-12-31'), pf = belegListe(daten.buch, 'bp', j + '-01-01', j + '-12-31'); // jeweils höchstens bis heute
    var sum = function (l) { return l.reduce(function (a, e) { return a + e.c; }, 0); };
    return { st: st, pf: pf, sst: sum(st), spf: sum(pf),
      alle: daten.buch.length ? st.concat(pf.filter(function (e) { return !e.bs; })).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; }) : [] };
  }
  function belegZeile(e) { return ctx.datum(new Date(+e.d.slice(0, 4), +e.d.slice(5, 7) - 1, +e.d.slice(8, 10))) + ' · ' + katName(e.k) + (e.n ? ' · ' + e.n : '') + ' · ' + eur(e.c); }
  function belegZweck(e) { return [e.bs ? t('hb.beleg.st') : '', e.bp ? t('hb.beleg.pf') : ''].filter(Boolean).join(', '); }
  function belegText(j, b) {
    var z = [t('hb.bl.h', { j: String(j) }), t('hb.druck.stand', { d: ctx.datum(new Date()) }), ''];
    if (b.st.length) { z.push(t('hb.bl.st', { n: String(b.st.length), b: { eur: b.sst / 100 } })); b.st.forEach(function (e) { z.push('  ' + belegZeile(e)); }); z.push(''); }
    if (b.pf.length) { z.push(t('hb.bl.pf', { n: String(b.pf.length), b: { eur: b.spf / 100 } })); b.pf.forEach(function (e) { z.push('  ' + belegZeile(e)); }); z.push(''); }
    z.push(t('hb.bl.hinweis'));
    return z.join('\n');
  }
  function belegDatei(name, text, msg) {
    var fsys = ctx.plug && ctx.plug('Filesystem'), sh = ctx.plug && ctx.plug('Share');
    if (ctx.nativ) {
      if (!fsys || !sh) { msg.textContent = t('hb.csv.fehler'); return; }
      fsys.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' })
        .then(function (r) { return sh.share({ title: name, files: [r.uri] }).then(function () {}, function () {}); })
        .then(function () { msg.textContent = ''; return fsys.deleteFile({ path: name, directory: 'CACHE' }).catch(function () {}); })
        .catch(function () { msg.textContent = t('hb.csv.fehler'); });
      return;
    }
    try {
      var url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
      var a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      msg.textContent = t('hb.csv.ok', { name: name });
    } catch (e) { msg.textContent = t('hb.csv.fehler'); }
  }
  function belegBox() {
    var jetzt = new Date().getFullYear(), j = Math.min(blJahr || +monat.slice(0, 4), jetzt), b = belegDaten(j); // nicht über das laufende Jahr hinaus
    var d = el('details', 'hb-karte hb-bl'); d.id = 'hbBelege'; d.open = blOffen;
    d.addEventListener('toggle', function () { blOffen = d.open; });
    var su = el('summary'); su.id = 'hb-bl-sum'; su.textContent = t('hb.bl.h', { j: String(j) }); d.appendChild(su);
    var neu = function (fokus) { var o = $('hbBelege'), n2 = belegBox(); if (o) o.replaceWith(n2); var f = $(fokus); if (f && f.disabled) f = $('hb-bl-vor'); if (f) f.focus(); };
    var lei = el('div', 'hb-monat');
    lei.appendChild(knopf('hb-mon-knopf', '‹', function () { blJahr = j - 1; neu('hb-bl-vor'); }, { 'aria-label': t('hb.bl.vor'), id: 'hb-bl-vor' }));
    var jn = el('b', 'hb-mon-name', String(j)); jn.setAttribute('aria-live', 'polite'); lei.appendChild(jn);
    var na = knopf('hb-mon-knopf', '›', function () { if (j < jetzt) { blJahr = j + 1; neu('hb-bl-nach'); } }, { 'aria-label': t('hb.bl.nach'), id: 'hb-bl-nach' });
    na.disabled = j >= jetzt; lei.appendChild(na);
    d.appendChild(lei);
    if (!b.st.length && !b.pf.length) { d.appendChild(el('p', 'muted', t('hb.bl.leer'))); return d; }
    if (b.st.length) d.appendChild(el('p', 'hb-bl-summe', t('hb.bl.st', { n: String(b.st.length), b: { eur: b.sst / 100 } })));
    if (b.pf.length) d.appendChild(el('p', 'hb-bl-summe', t('hb.bl.pf', { n: String(b.pf.length), b: { eur: b.spf / 100 } })));
    var ul = el('ul', 'hb-liste hb-bl-liste');
    b.alle.forEach(function (e) { ul.appendChild(el('li', '', belegZeile(e) + ' (' + belegZweck(e) + ')')); });
    d.appendChild(ul);
    d.appendChild(el('p', 'small', t('hb.bl.hinweis')));
    var msg = el('p', 'small'); msg.id = 'hbBlMsg'; msg.setAttribute('aria-live', 'polite');
    var bt = el('div', 'btns');
    bt.appendChild(knopf('btn ghost', t('hb.bl.drucken'), function () { ctx.textAusgeben(belegText(j, b), t('hb.bl.h', { j: String(j) }), msg); }, { id: 'hb-bl-drucken' }));
    bt.appendChild(knopf('btn ghost', t('hb.bl.csv'), function () {
      belegDatei('Belege-' + j + '.csv', '﻿' + belegCsv(b.alle, [t('hb.datum'), t('hb.kat'), t('hb.notiz'), t('hb.betrag'), t('hb.bl.zweck')], katName, belegZweck), msg);
    }, { id: 'hb-bl-csv' }));
    d.appendChild(bt); d.appendChild(msg);
    return d;
  }

  return {
    // Rechnung (Tests)
    KAT: KAT_IDS, zuCent: zuCent, euroGanz: euroGanz, planRechnung: planRechnung, monatPlus: monatPlus, monatsEintraege: monatsEintraege,
    nachKategorie: nachKategorie, auswertung: auswertung, tipps: tipps, kassenzettel: kassenzettel, csv: csv, regelbedarfAnteile: regelbedarfAnteile, RBEG5: RBEG5,
    pflegeFenster: pflegeFenster, belegListe: belegListe, belegSumme: belegSumme, belegCsv: belegCsv, vermNah: vermNah, WORTE_GELD: WORTE_GELD,
    ausCheck: ausCheck, aenderung: aenderung, uebernahme: uebernahme, normiere: normiere, hinweisListe: hinweisListe, aenderungsBrief: aenderungsBrief, VORLAUF_TAGE: VORLAUF_TAGE,
    // Energiekosten-Check (Rechnung)
    PREIS: PREIS, VERBRAUCH_DESTATIS: VERBRAUCH_DESTATIS, TOL: TOL, tageZwischen: tageZwischen, jahresVerbrauch: jahresVerbrauch, gasKwh: gasKwh, jahresKosten: jahresKosten,
    abschlagVergleich: abschlagVergleich, destatisVergleich: destatisVergleich, energieSparte: energieSparte, energieNachzahlung: energieNachzahlung, abschlagBrief: abschlagBrief, dezimalAus: dezimalAus, SAISON_TAGE: SAISON_TAGE, AKTUELL_TAGE: AKTUELL_TAGE,
    // Oberfläche
    rest: function () { return rechnung(); }, // Kurzstatus für „Mein Ordner“: { rest, restEuro, leer }
    init: init, zeigen: zeigen, sprache: function () { render(); if (daten) startHinweis(); }, speicherOrt: speicherOrt,
    daten: function () { return JSON.parse(JSON.stringify(daten)); }, laden: function (d) { daten = normiere(d); sichern(); render(); startHinweis(); },
    // Nach einem Wechsel des Vorgangs: Plan des geöffneten Vorgangs aus dem Speicherort lesen (ohne zu schreiben)
    neuLaden: function () { offenKat = ''; enOffen = false; eingabe = null; rueck = null; speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); startHinweis(); }); }
  };
})();
if (typeof module !== 'undefined') module.exports = Haushalt;
