// Haushaltsplan und Haushaltsbuch (Bereich „Geld sparen“). Eigenes Modul: reine Rechnung (Node-Tests) und Oberfläche.
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
    var o = { ek1: null, ek1Art: '', ek1NurBrutto: false, ek2: null, ek2Art: '', ek2NurBrutto: false, zwei: false, miete: null, uh: null, kinder: 0, kg: null };
    if (!s) return o;
    o.zwei = s.adults === 2;
    [1, 2].forEach(function (i) {
      if (i === 2 && !o.zwei) return;
      var art = s['ek' + i + 'Art'] || '';
      o['ek' + i + 'Art'] = art;
      o['ek' + i] = art === 'ohne' ? null : wert(s['ek' + i + 'Netto']);
      o['ek' + i + 'NurBrutto'] = MIT_BRUTTO.indexOf(art) >= 0 && o['ek' + i] === null && wert(s['ek' + i + 'Brutto']) !== null;
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
    // Raten und Schulden
    if (katSumme('raten') > 0) add('schulden', 45, { art: 'schulden' });
    // 1. Sozialtarife und Rundfunkbeitrag: Ausgaben für Handy, Mobilität, Strom oder Rundfunk; nur bei passender Leistung oder knappem Plan
    var rf = !!(bz.grundsicherungsgeld || bz.sozialamt) || offen('rundfunk');
    if ((katSumme('handy') > 0 || katSumme('mobil') > 0 || katSumme('energie') > 0 || WORTE.rundfunk.test(notizen)) && (rf || e.knapp)) add('tarif', 40, { art: 'tarif', rundfunk: rf });
    return out.sort(function (a, b) { return b.prio - a.prio; });
  }
  function aenderungsBrief(alt, neu, datum) {
    return ['[Name, Anschrift]', '', 'An: [zuständige Stelle]', '', 'Aktenzeichen bzw. Nummer der Bedarfsgemeinschaft: [_____]', '', 'Mitteilung über eine Änderung meines Einkommens', '',
      'Sehr geehrte Damen und Herren,', '', 'hiermit teile ich Ihnen nach § 60 Abs. 1 Satz 1 Nr. 2 SGB I mit, dass sich mein Einkommen geändert hat.',
      'Bisher: etwa ' + alt + ' netto im Monat.', 'Neu: etwa ' + neu + ' netto im Monat, ab dem [Datum].', '', 'Nachweise (zum Beispiel die Lohnabrechnung) lege ich bei.', '',
      'Mit freundlichen Grüßen', '', '[Ort], ' + datum, '[Unterschrift]'].join('\n');
  }

  // =====================================================================
  // Oberfläche
  // =====================================================================
  var ctx = null, daten = null, ansicht = 'plan', monat = '', offenKat = '', eingabe = null, rueck = null, ueOffen = false, scanLaeuft = false;
  var $ = function (id) { return document.getElementById(id); };
  function t(k, p) { return ctx.t(k, p); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function eur(cent) { return ctx.euro((cent || 0) / 100); }
  function katName(k) { return t('hb.k.' + k); }
  function katSym(k) { var x = KAT.filter(function (a) { return a[0] === k; })[0] || KAT[8]; return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + x[1] + '</svg>'; }
  function leer() { return { v: 1, plan: { kg: null, leist: null, sonst: null, aus: {} }, buch: [], weg: {}, bewilligt: {}, ekBasis: null }; }

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
    if (Array.isArray(d.buch)) x.buch = d.buch.filter(function (e) { return e && /^\d{4}-\d\d-\d\d$/.test(e.d) && typeof e.c === 'number' && e.c > 0; });
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
    return [g.ek1, g.zwei ? g.ek2 : null, p.kg !== null ? p.kg : g.kg, g.uh, p.leist, p.sonst];
  }
  function planAus() { var a = Object.assign({}, daten.plan.aus); a.miete = geteilte().miete || 0; return a; }
  function rechnung() { return planRechnung(planEin(), planAus()); }

  // ----- Hilfen für Elemente -----
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
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
    box.appendChild(el('p', 'hb-lead', esc(t('hb.plan.lead'))));
    var erg = el('p', 'hb-ergebnis'); erg.id = 'hbErgebnis'; erg.setAttribute('aria-live', 'polite'); box.appendChild(erg);
    var aktual = function () {
      var r = rechnung(); erg.textContent = ergebnisSatz(r); erg.classList.toggle('minus', !r.leer && r.rest < 0);
      var h = $('hbHinweise'); if (h) hinweise(h, r);
    };

    // Einnahmen
    var fs = el('fieldset', 'hb-karte'); fs.appendChild(el('legend', '', esc(t('hb.ein'))));
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
      [['', 'ek.art.0'], ['lohn', 'ek.art.lohn'], ['selbst', 'ek.art.selbst'], ['rente', 'ek.art.rente'], ['alg', 'ek.art.alg'], ['kg', 'ek.art.kg'], ['eg', 'ek.art.eg'], ['wfbm', 'ek.art.wfbm'], ['ohne', 'ek.art.ohne']]
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
    var fa = el('fieldset', 'hb-karte'); fa.appendChild(el('legend', '', esc(t('hb.aus'))));
    fa.appendChild(el('p', 'hint', esc(t('hb.aus.t'))));
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
    var ekJetzt = g.ek1 === null && (!g.zwei || g.ek2 === null) ? null : (g.ek1 || 0) + (g.zwei ? g.ek2 || 0 : 0);
    if (ekJetzt !== null && !(daten.ekBasis > 0)) { daten.ekBasis = ekJetzt; sichern(); }
    var res = ctx.ergebnis ? ctx.ergebnis() : null, lv = null;
    if (res) { lv = {}; res.forEach(function (x) { lv[x.id] = x.level; }); }
    return hinweisListe({ aus: planAus(), eintraege: monatsEintraege(daten.buch, monat).concat(monatsEintraege(daten.buch, monatPlus(monat, -1))),
      knapp: !r.leer && r.knapp, ein: r.ein, ekBasis: daten.ekBasis, ekJetzt: ekJetzt, bezug: s && s.bezug, ergebnis: lv, kinder: s ? Number(s.kids) || 0 : null,
      bewilligt: daten.bewilligt, heute: new Date(), weg: daten.weg });
  }
  function leistungName(l) { return t('hb.wb.' + l); }
  function hinweisElement(h, neuZeichnen) {
    var d = el('div', 'hb-hinweis'); d.id = 'hb-hw-' + h.art;
    var txt = h.art === 'wb' ? t('hb.hw.wb', { l: leistungName(h.leistung), d: ctx.datum(new Date(+h.ende.slice(0, 4), +h.ende.slice(5, 7) - 1, +h.ende.slice(8, 10))) }) :
      h.art === 'ek' ? t('hb.hw.ek', { alt: { eur: euroGanz(h.alt) }, neu: { eur: euroGanz(h.neu) } }) : h.art === 'tarif' && !h.rundfunk ? t('hb.hw.tarif0') : t('hb.hw.' + h.art);
    d.appendChild(el('p', '', esc(txt)));
    var det = el('details', 'hb-hw-det'), su = el('summary'); su.textContent = t('hb.hw.mehr'); det.appendChild(su);
    det.appendChild(el('p', 'small', esc(t('hb.hw.' + (h.art === 'tarif' && !h.rundfunk ? 'tarif0' : h.art) + '.d'))));
    d.appendChild(det);
    var b = el('div', 'btns');
    var weg = function () { daten.weg[h.id] = true; if (h.art === 'ek') daten.ekBasis = h.neu; sichern(); neuZeichnen(); };
    if (h.art === 'knapp' || h.art === 'but') b.appendChild(knopf('btn ghost klein', t('hb.zumCheck'), function () { ctx.zeige('leistungen', true); }));
    if (h.art === 'schulden') b.appendChild(knopf('btn ghost klein', t('hb.zuSchulden'), function () { ctx.zeige('pfaendung', true); }));
    if (h.art === 'nk') b.appendChild(knopf('btn ghost klein', t('hb.hw.brief'), function () { ctx.zeige('briefe', true); }));
    if (h.art === 'ek') {
      b.appendChild(knopf('btn ghost klein', t('hb.hw.neuPruefen'), function () { daten.ekBasis = h.neu; sichern(); ctx.zeige('leistungen', true); }));
      b.appendChild(knopf('btn ghost klein', t('hb.hw.melden'), function () {
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
    var v = $('v-start'); if (!v) return;
    var alt = $('hbStart'); if (alt) alt.remove();
    var wb = hinweisListe({ bewilligt: daten.bewilligt, heute: new Date(), weg: daten.weg }).filter(function (h) { return h.art === 'wb'; })[0];
    if (!wb) return;
    var box = el('div', 'hb-hinweise hb-start'); box.id = 'hbStart';
    var e = hinweisElement(wb, startHinweis);
    var b = e.querySelector('.btns'); b.insertBefore(knopf('btn ghost klein', t('hb.kachel'), function () { ctx.zeige('haushalt', true); }), b.firstChild);
    box.appendChild(e);
    var h = v.querySelector('h2'); if (h && h.nextSibling) v.insertBefore(box, h.nextSibling); else v.appendChild(box);
  }
  function bewilligtBox() {
    var d = el('details', 'hb-karte hb-wb'), su = el('summary'); su.textContent = t('hb.wb.h'); d.appendChild(su);
    if (Object.keys(daten.bewilligt).length) d.open = true;
    d.appendChild(el('p', 'hint', esc(t('hb.wb.t'))));
    ['sgb2', 'sgb12', 'wohngeld', 'kiz'].forEach(function (l) {
      var f = el('div', 'field'), lab = el('label'); lab.htmlFor = 'hb-wb-' + l; lab.textContent = t('hb.wb.bis', { l: leistungName(l) }); f.appendChild(lab);
      var i = el('input'); i.type = 'date'; i.id = 'hb-wb-' + l; i.value = daten.bewilligt[l] || '';
      i.addEventListener('change', function () { if (/^\d{4}-\d\d-\d\d$/.test(i.value)) daten.bewilligt[l] = i.value; else delete daten.bewilligt[l]; sichern(); var h = $('hbHinweise'); if (h) hinweise(h, rechnung()); startHinweis(); });
      f.appendChild(i); d.appendChild(f);
    });
    d.appendChild(el('p', 'small', esc(t('hb.wb.quelle'))));
    return d;
  }
  function uebernahmeBox(s) {
    var u = uebernahme(s, { kg: daten.plan.kg !== null ? daten.plan.kg : geteilte().kg, energie: daten.plan.aus.energie || 0, leist: daten.plan.leist || 0 });
    var box = el('div', 'hb-karte hb-ue'); box.id = 'hbUe';
    var h = el('h3', '', esc(t('hb.ue.h'))); h.id = 'hb-ue-h'; h.tabIndex = -1; box.appendChild(h);
    box.appendChild(el('p', 'hb-ue-t', esc(t('hb.ue.da'))));
    var ul = el('ul', 'hb-liste');
    if (!u.da.length) ul.appendChild(el('li', '', esc(t('hb.ue.nichts'))));
    u.da.forEach(function (x) {
      var txt = x.was === 'ek' ? t('hb.ue.ek', { art: t('ek.art.' + x.art), b: { eur: x.c / 100 } }) : x.was === 'miete' ? t('hb.ue.miete', { b: { eur: x.c / 100 } }) :
        x.was === 'uh' ? t('hb.ue.uh', { b: { eur: x.c / 100 } }) : t('hb.ue.kinder', { n: String(x.n) });
      ul.appendChild(el('li', 'ok', esc(txt)));
    });
    box.appendChild(ul);
    var bestaetigt = {};
    u.fragen.forEach(function (x) {
      var l = el('label', 'check'), c = el('input'); c.type = 'checkbox'; c.id = 'hb-frage-' + x.was;
      c.addEventListener('change', function () { bestaetigt[x.was] = c.checked; });
      l.appendChild(c); l.appendChild(el('span', '', esc(t('hb.ue.kgFrage')))); box.appendChild(l);
    });
    if (u.fehlt.length) {
      box.appendChild(el('p', 'hb-ue-t', esc(t('hb.ue.fehlt'))));
      var ul2 = el('ul', 'hb-liste');
      u.fehlt.forEach(function (x) { ul2.appendChild(el('li', 'fehlt', esc(t('hb.f.' + x.was, { art: x.art ? t('ek.art.' + x.art) : '' })))); });
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

  // ----- Beratungsmodus (Schalter aus claude/beratung-hilfen): Abfrage, ob es ihn gibt; sonst null = immer anbieten -----
  function beratung() {
    try { if (window.SoloBeratung && typeof window.SoloBeratung.an === 'function') return !!window.SoloBeratung.an(); } catch (e) {}
    var a = $('app');
    if (a && a.hasAttribute('data-beratung')) return /^(1|an|true)$/.test(a.getAttribute('data-beratung'));
    return null;
  }
  function planText() {
    var g = geteilte(), r = rechnung(), z = [t('hb.druck.h'), t('hb.druck.stand', { d: ctx.datum(new Date()) }), '', t('hb.ein')];
    var ein = [[t('hb.ek1'), g.ek1], [g.zwei ? t('hb.ek2') : '', g.zwei ? g.ek2 : null], [t('hb.kg'), daten.plan.kg !== null ? daten.plan.kg : g.kg], [t('hb.uh'), g.uh], [t('hb.leist'), daten.plan.leist], [t('hb.sonstEin'), daten.plan.sonst]];
    ein.forEach(function (x) { if (x[1]) z.push('  ' + x[0] + ': ' + eur(x[1])); });
    z.push('  = ' + eur(r.ein), '', t('hb.aus'));
    var aus = planAus(); KAT_IDS.forEach(function (k) { if (aus[k]) z.push('  ' + katName(k) + ': ' + eur(aus[k])); });
    z.push('  = ' + eur(r.aus), '', ergebnisSatz(r));
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
    box.appendChild(el('p', 'hb-summe', esc(t('hb.summe', { m: monatsName(monat), b: { eur: summe(liste.map(function (e) { return e.c; })) / 100 } }))));
    if (!liste.length) box.appendChild(el('p', 'muted', esc(t('hb.liste.leer'))));
    var ul = el('ul', 'hb-eintraege');
    liste.forEach(function (e) {
      var li = el('li', 'hb-eintrag');
      li.innerHTML = '<span class="hb-sym">' + katSym(e.k) + '</span><span class="hb-e-txt"><b>' + esc(katName(e.k)) + '</b><span>' + esc(ctx.datum(new Date(+e.d.slice(0, 4), +e.d.slice(5, 7) - 1, +e.d.slice(8, 10)))) +
        (e.w ? ' · ' + esc(t('hb.wieder.kurz')) : '') + (e.n ? ' · ' + esc(e.n) : '') + '</span></span><span class="hb-e-betrag">' + esc(eur(e.c)) + '</span>';
      var bt = el('span', 'hb-e-knoepfe');
      bt.appendChild(knopf('btn ghost klein', t('hb.bearbeiten'), function () {
        var o = daten.buch.filter(function (x) { return x.id === e.id; })[0]; if (!o) return;
        neueEingabe({ id: o.id, betrag: String((o.c / 100).toFixed(2)).replace('.', ','), k: o.k, d: o.d, n: o.n || '', w: !!o.w });
        renderBuch('hb-betrag');
      }, { 'aria-label': t('hb.bearbeiten') + ': ' + katName(e.k) + ' ' + eur(e.c) }));
      bt.appendChild(knopf('btn ghost klein', t('hb.loeschen'), function () { loeschen(e); }, { 'aria-label': t('hb.loeschen') + ': ' + katName(e.k) + ' ' + eur(e.c) }));
      li.appendChild(bt); ul.appendChild(li);
    });
    box.appendChild(ul);
    if (rueck) {
      var r = el('div', 'hb-rueck'); r.setAttribute('role', 'status');
      r.appendChild(el('span', '', esc(rueck.text)));
      r.appendChild(knopf('btn ghost klein', t('hb.rueck'), function () { daten.buch = rueck.vorher; rueck = null; sichern(); renderBuch('hb-neu'); }, { id: 'hb-rueck' }));
      box.appendChild(r);
    }
    box.appendChild(el('p', 'small', esc(t('home.privat'))));
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
    var fk = el('fieldset', 'hb-katwahl'); fk.appendChild(el('legend', '', esc(t('hb.kat'))));
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
    lw.appendChild(cw); lw.appendChild(el('span', '', esc(t('hb.wieder')))); f.appendChild(lw);
    if (eingabe.id && eingabe.w) f.appendChild(el('p', 'hint', esc(t('hb.wieder.hint'))));
    var msg = el('p', 'warn'); msg.id = 'hbEingabeMsg'; msg.setAttribute('role', 'alert'); msg.hidden = true; f.appendChild(msg);
    var bt = el('div', 'btns');
    bt.appendChild(knopf('btn', t('hb.speichern'), function () {
      var c = zuCent(eingabe.betrag);
      var fehler = !(c > 0) ? 'hb.bitteBetrag' : !eingabe.k ? 'hb.bitteKat' : !/^\d{4}-\d\d-\d\d$/.test(eingabe.d) ? 'hb.datum' : '';
      if (fehler) { msg.hidden = false; msg.textContent = t(fehler); (fehler === 'hb.bitteBetrag' ? inp : fehler === 'hb.datum' ? di : g.querySelector('button')).focus(); return; }
      var e = { id: eingabe.id || ('e' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36)), d: eingabe.d, c: c, k: eingabe.k, n: eingabe.n.trim(), w: !!eingabe.w };
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
    if (!aw.zeilen.length) { box.appendChild(el('p', 'muted', esc(t('hb.ausw.leer')))); if (fokusId && $(fokusId)) $(fokusId).focus(); return; }
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
    box.appendChild(el('p', 'hb-summe', esc(t('hb.ausw.summe', { b: { eur: aw.summe / 100 } })) + ' <span class="small">' + esc(t('hb.ausw.vm', { b: { eur: aw.vorSumme / 100 } })) + ' · ' +
      esc(sd > 0 ? t('hb.ausw.mehr', { b: { eur: sd / 100 } }) : sd < 0 ? t('hb.ausw.weniger', { b: { eur: -sd / 100 } }) : t('hb.ausw.gleich')) + '</span>'));
    // Spartipps (höchstens 3) mit Quelle
    var tp = tipps(aw);
    if (tp.length) {
      box.appendChild(el('h3', 'hb-h3', esc(t('hb.tipps'))));
      var tl = el('ul', 'hb-tipps');
      tp.forEach(function (k) {
        var li = el('li'); li.innerHTML = '<b>' + esc(katName(k)) + '</b><p>' + esc(t('hb.tipp.' + k)) + '</p><p class="small">' + esc(t('hb.quelle', { q: t('hb.quelle.' + k) })) + '</p>';
        if (k === 'raten') li.appendChild(knopf('btn ghost', t('hb.zuSchulden'), function () { ctx.zeige('pfaendung', true); }));
        if (k === 'kinder' || k === 'miete') li.appendChild(knopf('btn ghost', t('hb.zumCheck'), function () { ctx.zeige('leistungen', true); }));
        tl.appendChild(li);
      });
      box.appendChild(tl);
    }
    // Regelbedarf zur Orientierung (aufklappbar, nicht wertend)
    var st1 = ctx.regeln && ctx.regeln().regelbedarf && ctx.regeln().regelbedarf.alleinstehend;
    if (st1) {
      var d = el('details', 'hb-rb'), su = el('summary'); su.textContent = t('hb.rb.h'); d.appendChild(su);
      d.appendChild(el('p', '', esc(t('hb.rb.t', { b: { eur: st1 } }))));
      var rl = el('ul', 'hb-liste');
      regelbedarfAnteile(st1).forEach(function (x) { rl.appendChild(el('li', '', esc(t('hb.rb.zeile', { k: t('hb.rb.' + x.k), p: String(x.prozent), b: { eur: x.euro } })))); });
      d.appendChild(rl); d.appendChild(el('p', 'small', esc(t('hb.rb.quelle'))));
      box.appendChild(d);
    }
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
    var cl = $('clearBtn'); if (cl) cl.addEventListener('click', function () { daten = leer(); offenKat = ''; eingabe = null; rueck = null; speicher.schreiben(JSON.stringify(daten), function () {}); var h = $('hbStart'); if (h) h.remove(); render(); }); // „Alle Angaben löschen“ löscht auch Plan und Haushaltsbuch
    var go = $('goHaushalt'); if (go) go.addEventListener('click', function () { ctx.zeige('haushalt', true); });
    speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); startHinweis(); });
  }
  function zeigen() { ueOffen = false; render(); }

  return {
    // Rechnung (Tests)
    KAT: KAT_IDS, zuCent: zuCent, euroGanz: euroGanz, planRechnung: planRechnung, monatPlus: monatPlus, monatsEintraege: monatsEintraege,
    nachKategorie: nachKategorie, auswertung: auswertung, tipps: tipps, kassenzettel: kassenzettel, csv: csv, regelbedarfAnteile: regelbedarfAnteile, RBEG5: RBEG5,
    ausCheck: ausCheck, aenderung: aenderung, uebernahme: uebernahme, normiere: normiere, hinweisListe: hinweisListe, aenderungsBrief: aenderungsBrief, VORLAUF_TAGE: VORLAUF_TAGE,
    // Oberfläche
    init: init, zeigen: zeigen, sprache: function () { render(); if (daten) startHinweis(); }, speicherOrt: speicherOrt,
    daten: function () { return JSON.parse(JSON.stringify(daten)); }, laden: function (d) { daten = normiere(d); sichern(); render(); startHinweis(); },
    // Nach einem Wechsel des Vorgangs: Plan des geöffneten Vorgangs aus dem Speicherort lesen (ohne zu schreiben)
    neuLaden: function () { offenKat = ''; eingabe = null; rueck = null; speicher.laden(function (v) { try { daten = normiere(v ? JSON.parse(v) : null); } catch (e) { daten = leer(); } render(); startHinweis(); }); }
  };
})();
if (typeof module !== 'undefined') module.exports = Haushalt;
