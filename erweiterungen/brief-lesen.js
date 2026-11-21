// Brief einlesen: erkennt aus dem Text eines Briefs (Foto mit Texterkennung, PDF oder eingefügt), von wem er ist und was er ist,
// und liest die Beträge für die Prüfung aus. Nichts davon ist sicher: die App markiert jeden erkannten Wert zum Vergleichen.
// Ergebnis von lies(): { art, titel, sicher, datum, felder: { <Feld-ID der Prüfung>: Wert }, posten: [...], text }
const BriefLesen = (function () {
  'use strict';

  // Arten mit Stichwörtern (Gewicht). Gewinner = höchste Summe; unter 3 Punkten gilt die Art als unbekannt.
  const ARTEN = {
    pk: { titel: 'Pflegegutachten oder Bescheid der Pflegekasse', w: [[/Gutachten zur Feststellung der Pflegebedürftigkeit/i, 6], [/Medizinische[rn]? Dienst/i, 3], [/Pflegegrad/i, 2], [/Modul\s*[1-6]|Selbstversorgung|Mobilität/i, 2], [/Pflegekasse/i, 2], [/SGB XI\b/i, 2]] },
    vm: { titel: 'Nebenkostenabrechnung', w: [[/Betriebskostenabrechnung|Nebenkostenabrechnung|Heiz- und Betriebskosten/i, 6], [/Abrechnungszeitraum/i, 2], [/Vorauszahlung/i, 2], [/Umlageschlüssel|Verteilerschlüssel|Wohnfläche/i, 2], [/Grundsteuer|Müllabfuhr|Hausmeister/i, 2]] },
    jc: { titel: 'Bescheid vom Jobcenter (Grundsicherungsgeld)', w: [[/Jobcenter/i, 4], [/Grundsicherungsgeld|Bürgergeld/i, 4], [/SGB II\b|Zweite[sn]? Buch/i, 3], [/Bedarfsgemeinschaft/i, 3], [/Regelbedarf/i, 1]] },
    sa: { titel: 'Bescheid vom Sozialamt (Grundsicherung im Alter)', w: [[/Grundsicherung im Alter/i, 6], [/Sozialamt|Amt für Soziales|Sozialhilfe/i, 3], [/SGB XII\b|Zwölfte[sn]? Buch/i, 3], [/Erwerbsminderung/i, 2]] },
    wg: { titel: 'Wohngeldbescheid', w: [[/Wohngeldbescheid|Bewilligung von Wohngeld|Wohngeld in Höhe/i, 6], [/Wohngeldbehörde|Wohngeldstelle/i, 4], [/WoGG|Wohngeldgesetz/i, 3], [/Wohngeld/i, 1]] },
    fk: { titel: 'Bescheid der Familienkasse (Kinderzuschlag)', w: [[/Kinderzuschlag/i, 5], [/Familienkasse/i, 3], [/BKGG|Bundeskindergeldgesetz/i, 3]] },
    anh: { titel: 'Anhörung', w: [[/Anhörung/i, 5], [/§\s*24 SGB X\b/i, 4], [/Gelegenheit, sich (zu|dazu) zu äußern|Stellungnahme/i, 2]] },
    mit: { titel: 'Aufforderung, Unterlagen nachzureichen', w: [[/Mitwirkung/i, 4], [/§\s*6[06] SGB I\b/i, 4], [/reichen Sie .{0,40}(ein|nach)|bitte legen Sie .{0,40}vor|fehlende Unterlagen/i, 3]] },
    af: { titel: 'Antragsformular', w: [[/[☐□▢]/, 3], [/Bitte (ankreuzen|ausfüllen)|Zutreffendes ankreuzen/i, 3], [/Unterschrift (des|der) Antragstellers?/i, 3], [/^\s*Antrag auf\b/im, 2], [/Angaben zur Person/i, 2]] }
  };
  // Ein Bescheid schlägt die allgemeinen Arten: „Anhörung“ oder Formular-Merkmale stehen manchmal auch in Bescheiden
  const VORRANG = ['pk', 'vm', 'jc', 'sa', 'wg', 'fk', 'anh', 'mit', 'af'];

  function erkenne(text) {
    const t = String(text || '');
    let best = null, bestP = 0;
    // Formular: typische Eingabefelder zählen (je Feld 2 Punkte, höchstens 8), Bescheide nennen sie kaum
    const formFelder = [/Name,? Vorname|Familienname/i, /Geburtsdatum/i, /\bIBAN\b/i, /Steuer-?ID|Steueridentifikationsnummer/i, /Ort,? Datum/i, /Unterschrift/i, /Telefon/i, /Staatsangehörigkeit/i, /Familienstand/i]
      .filter((re) => re.test(t)).length;
    for (const art of VORRANG) {
      let p = ARTEN[art].w.reduce((s, [re, g]) => s + (re.test(t) ? g : 0), 0);
      if (art === 'af') p += Math.min(8, formFelder * 2);
      if (p > bestP) { best = art; bestP = p; }
    }
    if (bestP < 3) return { art: null, titel: 'Nicht erkannt', sicher: 0 };
    // Jobcenter-Bescheid, der Grundsicherung im Alter nur erwähnt: Jobcenter bleibt
    return { art: best, titel: ARTEN[best].titel, sicher: bestP };
  }

  // ---------- Zahlen und Daten ----------
  // Beträge: 1.234,56 oder 1234,56 (mit oder ohne €); auch 1 234,56 aus der Texterkennung.
  // Ganze Euro nur mit Währung dahinter („1.570 Euro“, „214 €“), sonst wären Jahreszahlen, Paragrafen oder Hausnummern Beträge.
  const BETRAG = /(\d{1,3}(?:[.\s]\d{3})+|\d+),(\d{2})(?!\d)|(\d{1,3}(?:\.\d{3})+|\d+)(?=\s?(?:€|EUR\b|Euro\b))(?![.,]\d)/g;
  // Typische Fehler der Texterkennung in Zahlen ausgleichen (nur in Zahlenteilen, Wörter bleiben unverändert):
  // O/o statt 0, l/I/| statt 1 („l.25O,OO“), Leerzeichen nach dem Komma („755, 00“), Punkt statt Komma („1.501.33“, „95.71 €“)
  function zahlNorm(zeile) {
    return String(zeile)
      .replace(/(^|[\s(:=+-])([\dOolI|]{1,3}(?:[.\s][\dOolI|]{3})*[,.][\dOo]{2})(?=$|[\s€)*]|EUR|Euro)/g, (x, v, z) => (/\d/.test(z) || /^[0O]+,[0O]{2}$/.test(z) ? v + z.replace(/[Oo]/g, '0').replace(/[lI|]/g, '1') : x))
      .replace(/(\d),[ \t](\d{2})(?![\d.,])/g, '$1,$2')
      .replace(/(\d{1,3}(?:\.\d{3})+)\.(\d{2})(?![\d.])/g, '$1,$2')
      .replace(/(^|[^\d.,])(\d+)\.(\d{2})(?=\s?(?:€|EUR\b|Euro\b))/g, '$1$2,$3');
  }
  function betraege(zeile) {
    const out = []; let m; BETRAG.lastIndex = 0;
    const z = zahlNorm(zeile);
    while ((m = BETRAG.exec(z))) {
      if (m[3] != null) { out.push(+m[3].replace(/\./g, '')); continue; }
      let g = m[1];
      // „DE06 8605 … 1214 12 674,92“: Ziffern davor gehören zu IBAN, Kundennummer o. Ä., Leerzeichen-Tausender dann nicht
      if (/\s/.test(g) && /\d\s*$/.test(z.slice(0, m.index))) g = g.split(/\s/).pop();
      out.push(+(g.replace(/[.\s]/g, '') + '.' + m[2]));
    }
    return out;
  }
  const DATUM = /\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/;
  function iso(m) { return `${m[3]}-${('0' + m[2]).slice(-2)}-${('0' + m[1]).slice(-2)}`; }
  // Nur gültige Kalenderdaten: die Texterkennung liest „08.02.2023“ auch als „98.02.2023“; ein solches Datum bleibt leer
  function gueltig(m) { const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])); return d.getUTCDate() === +m[1] && d.getUTCMonth() === +m[2] - 1; }
  function zeilen(text) { return String(text || '').split(/\r?\n/).map((z) => z.replace(/\s+/g, ' ').trim()).filter(Boolean); }

  // Spalte „Gesamt“ einer Tabellenzeile: steht hinten (Summe der anderen) oder vorn (BA-Berechnungsbogen: „Regelbedarf 1.250,00 451,00 451,00 348,00“)
  // vorn: Im selben Dokument steht die Summe sonst vorn (siehe richtung); dann auch bei Zeilen, deren Einzelwerte falsch gelesen wurden
  const summe = (a) => Math.round(a.reduce((x, y) => x + y, 0) * 100);
  const hinten = (b) => b.length >= 3 && Math.abs(summe(b.slice(0, -1)) - Math.round(b[b.length - 1] * 100)) <= 2;
  const vornS = (b) => b.length >= 3 && Math.abs(summe(b.slice(1)) - Math.round(b[0] * 100)) <= 2;
  function gesamt(b, vorn) {
    if (hinten(b)) return b[b.length - 1];
    if (vornS(b) || (vorn && b.length >= 3)) return b[0];
    return b[b.length - 1];
  }
  // Richtung der Spalte „Gesamt“ im ganzen Dokument: nur vorn, wenn mindestens eine Zeile vorn aufgeht und keine hinten
  function richtung(z) {
    let v = 0, h = 0;
    for (const l of z) { const b = betraege(l); if (b.length < 3 || b.every((x) => x === b[0])) continue; if (hinten(b)) h++; else if (vornS(b)) v++; }
    return v > 0 && h === 0;
  }
  // Erster Betrag nach einem Stichwort: in derselben Zeile die Spalte „Gesamt“, sonst in der nächsten Zeile
  // opt.vor: Muster, die zuerst gesucht werden (z. B. „monatliches Gesamteinkommen“ vor dem Jahreswert „Gesamteinkommen“)
  function nach(z, muster, opt) {
    opt = opt || {};
    if (opt.vor) { const w = nach(z, opt.vor, Object.assign({}, opt, { vor: null })); if (w != null) return w; }
    for (let i = 0; i < z.length; i++) {
      if (!muster.some((re) => re.test(z[i]))) continue;
      if (opt.ohne && opt.ohne.some((re) => re.test(z[i]))) continue;
      // Nur Beträge ab dem Stichwort („von 912,40 € ergibt sich … ein monatliches Wohngeld von“ / „355,00 €“: nicht 912,40)
      const ab = Math.min(...muster.map((re) => { const x = z[i].match(re); return x ? x.index : Infinity; }));
      let b = betraege(z[i].slice(ab));
      // sonst in der nächsten Zeile, wenn davor kein Wort steht („von 355,00 € monatlich bewilligt.“)
      if (!b.length && i + 1 < z.length) { const n = zahlNorm(z[i + 1]), p = n.search(/\d/); if (p >= 0 && !/[A-Za-zÄÖÜäöü]{4,}/.test(n.slice(0, p))) b = betraege(z[i + 1]); }
      if (b.length) return opt.erster ? b[0] : gesamt(b, opt.vorn);
    }
    return null;
  }
  // Tabellen aus PDF und Texterkennung: Bezeichnung über zwei Zeilen. Zwei Formen kommen vor:
  //  A) Beträge in der ersten Zeile, Rest der Bezeichnung darunter („Mehrbedarf 24,92 10,37 …“ / „Warmwassererzeugung“; pdftotext)
  //  B) Bezeichnung in ein oder zwei eigenen Zeilen, Beträge allein darunter („Mehrbedarf“ / „Warmwassererzeugung“ / „24,92 10,37 …“; pdf.js)
  // Daraus wird eine Zeile „Bezeichnung Beträge“; die übrigen Zeilen bleiben unverändert.
  const kurzLabel = (n) => !/\d/.test(n) && n.split(' ').length <= 3 && !/[:.!?]$/.test(n) && /^[A-Za-zÄÖÜäöüß]/.test(n);
  const nurBetraege = (n) => betraege(n).length > 0 && !/[A-Za-zÄÖÜäöüß]{2,}/.test(zahlNorm(n).replace(/EUR|Euro/g, ''));
  function zusammen(z) {
    const out = z.slice();
    for (let i = 0; i + 1 < z.length; i++) {
      // B
      if (kurzLabel(z[i]) && nurBetraege(z[i + 1])) { out[i] = z[i] + ' ' + z[i + 1]; continue; }
      if (i + 2 < z.length && kurzLabel(z[i]) && kurzLabel(z[i + 1]) && nurBetraege(z[i + 2])) { out[i] = z[i] + ' ' + z[i + 1] + ' ' + z[i + 2]; continue; }
      // A (nicht, wenn die Folgezeile selbst Bezeichnung von Beträgen darunter ist)
      const b = betraege(z[i]), n = z[i + 1];
      if (!b.length || !kurzLabel(n)) continue;
      if (i + 2 < z.length && (nurBetraege(z[i + 2]) || (kurzLabel(z[i + 2]) && i + 3 < z.length && nurBetraege(z[i + 3])))) continue;
      const p = zahlNorm(z[i]).search(/\d/);
      if (p <= 0) continue;
      out[i] = z[i].slice(0, p).trim() + ' ' + n + ' ' + z[i].slice(p).trim();
    }
    return out;
  }
  // Datum des Bescheids nur aus eindeutigen Mustern: „Datum: 12.03.2026“, „Bescheid vom 12.03.2026“ oder das Datum im Briefkopf
  // („Musterstadt, den 12.03.2026“ oder nur das Datum in einer eigenen Zeile). Ein anderes Datum (Bewilligungszeitraum,
  // „Ihr Antrag vom“, Geburtsdatum) wäre falsch und verschöbe die Widerspruchsfrist; dann bleibt das Feld leer (bitte eintragen).
  function bescheidDatum(z) {
    const D = '(\\d{1,2}\\.\\d{1,2}\\.20\\d{2})';
    const muster = [new RegExp('(?:^|[^\\wäöüß])(?:Datum|Bescheiddatum)\\s*:?\\s*' + D, 'i'), new RegExp('\\bBescheid(?:es)? vom\\s*' + D, 'i')];
    const gut = (x) => { const d = x.match(DATUM); return d && gueltig(d) ? iso(d) : null; };
    for (const re of muster) for (const zl of z.slice(0, 40)) { const m = zl.match(re); if (m && gut(m[1])) return gut(m[1]); }
    // Briefkopf als Spalten („Unser Zeichen   Datum“, darunter „64.4-412000   Frankfurt am Main,“ / „4125   03.06.2025“): Datum am Zeilenende
    for (let i = 0; i < Math.min(z.length, 60); i++) {
      if (!/(?:^|\s)Datum:?$/.test(z[i])) continue;
      for (const zl of z.slice(i + 1, i + 6)) { if (/bis|Zeitraum|geboren|Geburt/i.test(zl)) break; const m = zl.match(new RegExp('(?:^|\\s)' + D + '$')); if (m && gut(m[1])) return gut(m[1]); }
    }
    const kopf = new RegExp('^(?:[A-ZÄÖÜ][\\wäöüß .()/-]{1,40},\\s*(?:(?:den|am)\\s+)?)?' + D + '$');
    for (const zl of z.slice(0, 15)) { if (/bis|Zeitraum|geboren|Geburt/i.test(zl)) continue; const m = zl.match(kopf); if (m && gut(m[1])) return gut(m[1]); }
    return null;
  }

  // ---------- Felder je Art (IDs der Prüfungen in „Brief prüfen“) ----------
  const FELDER = {
    jc: {
      'bs-b-regel': [[/Regelbedarf/i], { ohne: [/Mehrbedarf/i] }],
      'bs-b-ae': [[/Alleinerziehend/i]],
      'bs-b-schw': [[/Schwanger|werdende Mütter/i]],
      'bs-b-ww': [[/Warmwasser/i]],
      'bs-b-kdu': [[/Unterkunft und Heizung|Kosten der Unterkunft|Bedarfe für Unterkunft|^KdU\b/i]],
      'bs-b-eink': [[/anzurechnende[sn]? Einkommen|zu berücksichtigende[sn]? (Gesamt)?einkommen|Einkommen (gesamt|insgesamt)/i], { ohne: [/Kindergeld/i] }],
      'bs-b-kg': [[/Kindergeld/i]],
      'bs-b-zahl': [[/Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch|Leistungsanspruch|monatliche[rn]? Gesamtbetrag/i]],
      'bs-heiz': [[/Heizkosten|Heizung\b/i], { ohne: [/Unterkunft und Heizung/i] }]
    },
    sa: {
      'ga-b-regel': [[/Regelbedarf|Regelsatz/i], { ohne: [/Mehrbedarf/i] }],
      'ga-b-g': [[/Merkzeichen G|Mehrbedarf.{0,20}\bG\b|Gehbehinderung/i]],
      'ga-b-ww': [[/Warmwasser/i]],
      'ga-b-kdu': [[/Unterkunft und Heizung|Kosten der Unterkunft/i]],
      'ga-b-eink': [[/anzurechnende[sn]? Einkommen|einzusetzende[sn]? Einkommen|Einkommen (gesamt|insgesamt)|Summe anrechenb(?:\.|are[sn]?) Einkommen/i]],
      'ga-b-zahl': [[/Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch|monatliche[rn]? Leistung|^Lfd\.? Anspruch|laufende[rn]? Anspruch/i]],
      'ga-heiz': [[/Heizkosten/i]]
    },
    wg: {
      // Der Höchstbetrag ist nur die Grenze; die zu berücksichtigende Miete (mit Heizkosten- und CO2-Komponente) geht vor
      'wg-b-miete': [[/Höchstbetrag|Miete \/ Belastung/i], { vor: [/zu berücksichtigende (Miete|Belastung)|berücksichtigungsfähige Miete/i] }],
      // „Gesamteinkommen“ allein ist im Bescheid oft der Jahreswert; der monatliche Wert geht vor
      'wg-b-eink': [[/Gesamteinkommen/i], { vor: [/monatliche[sn]? Gesamteinkommen/i], ohne: [/Jahres/i] }],
      'wg-b-wg': [[/Wohngeld (in Höhe( von)?|monatlich|beträgt)|monatliche[sn]? Wohngeld|Wohngeldbetrag/i], { ohne: [/Kosten|abgezogen/i] }],
      'wg-kalt': [[/Bruttokaltmiete|Miete ohne Heizkosten/i]]
    },
    fk: {
      'kz-b-bedarf': [[/Bedarf der Eltern|elterliche[rn]? Bedarf|Gesamtbedarf der Eltern/i], { vor: [/gesamte[rn]? Bedarf der Eltern|Gesamtbedarf der Eltern/i], ohne: [/Regelbedarf/i] }],
      'kz-b-eink': [[/Einkommen der Eltern|elterliche[sn]? Einkommen|zu berücksichtigende[sn]? Einkommen/i]],
      'kz-b-kiz': [[/Kinderzuschlag.{0,30}(insgesamt|monatlich|gesamt|in Höhe)|Gesamtbetrag Kinderzuschlag/i]],
      'kz-wohn': [[/Wohnkosten|Kosten für Unterkunft|Miete und Heizung/i]]
    },
    vm: {
      'nk-voraus': [[/geleistete Vorauszahlung|Ihre Vorauszahlung|Vorauszahlungen? (gesamt|insgesamt)|abzüglich (der )?(vereinbarten |geleisteten )?(Nebenkosten|Betriebskosten)?vorauszahlung/i]],
      'nk-heiz': [[/^Heiz(ungs)?kosten\b/i], { vor: [/Heizkosten.{0,25}(Ihr|Anteil)|Ihr Anteil Heiz|Heiz- und Warmwasserkosten/i] }]
    }
  };
  // Nebenkosten: Posten mit Kosten für das Haus (erster Betrag) und Anteil (letzter Betrag)
  const POSTEN = /^(Grundsteuer|Müll\w*|Abfall\w*|Wasser\w*|Abwasser|Kaltwasser|Entwässerung|Niederschlagswasser|Straßenreinigung|Hausreinigung|Treppenhausreinigung|Gebäudereinigung|Hausmeister\w*|Garten\w*|Allgemeinstrom|Beleuchtung|Strom (allgemein|Treppenhaus)|Versicherung\w*|Gebäudeversicherung|Gebäude[ -]?(?:Haftpflicht[ -]?)?Versicherung|Haftpflicht\w*|Aufzug|Fahrstuhl|Schornstein\w*|Kabel\w*|Antenne|Ungeziefer\w*|Winterdienst|Verwaltung\w*|Instandhaltung\w*|Reparatur\w*|Bankgebühren|Porto|Rauchwarnmelder\w*|Wartung\w*)\b/i;

  function lies(text, art) {
    const z = zeilen(text);
    const e = art ? { art, titel: ARTEN[art] ? ARTEN[art].titel : '', sicher: 99 } : erkenne(text);
    const out = Object.assign({}, e, { datum: bescheidDatum(z), felder: {}, posten: [], text: String(text || '') });
    const f = FELDER[out.art] || {}, zz = zusammen(z);
    const vorn = richtung(zz);
    for (const [id, [muster, opt]] of Object.entries(f)) { const w = nach(zz, muster, Object.assign({ vorn }, opt)); if (w != null) out.felder[id] = w; }
    if (out.art === 'jc' && out.felder['bs-b-kg'] != null && out.felder['bs-b-eink'] != null) {
      // BA-Berechnungsbogen: „zu berücksichtigendes Gesamteinkommen“ enthält das Kindergeld (Zeile „Kindergeld“ unter „sonstiges Einkommen“);
      // die Prüfung führt Kindergeld getrennt, deshalb hier ohne Kindergeld
      const gz = zz.find((l) => /zu berücksichtigende[sn]? Gesamteinkommen/i.test(l) && betraege(l).length);
      if (gz && gesamt(betraege(gz), vorn) === out.felder['bs-b-eink']) out.felder['bs-b-eink'] = Math.round((out.felder['bs-b-eink'] - out.felder['bs-b-kg']) * 100) / 100;
    }
    if (out.art === 'wg' && out.felder['wg-kalt'] == null) {
      // Gesamtmiete minus Heizkosten („außer Betracht bleiben: Kosten des Betriebs der zentralen Heizung“) = Miete ohne Heizkosten
      const gm = nach(zz, [/monatliche Gesamtmiete|Gesamtmiete/i]), hz = nach(zz, [/Kosten des Betriebs der zentralen Heizung|Heizkosten/i], { ohne: [/Komponente/i] });
      if (gm != null && hz != null && hz < gm) out.felder['wg-kalt'] = Math.round((gm - hz) * 100) / 100;
    }
    if (out.art === 'jc' || out.art === 'sa') {
      // Miete (ohne Heizung) aus Grundmiete + Nebenkosten
      const gm = nach(zz, [/Grundmiete|Kaltmiete|Nettokaltmiete/i], { vorn }), nk = nach(zz, [/^Nebenkosten|kalte Nebenkosten|Betriebskosten/i], { vorn });
      if (gm != null) out.felder[out.art === 'jc' ? 'bs-miete' : 'ga-miete'] = Math.round((gm + (nk || 0)) * 100) / 100;
    }
    if (out.art === 'wg') { const m = String(text).match(/(\d+)\s*(?:zu berücksichtigende )?Haushaltsmitglied/i); if (m) out.felder['wg-n'] = +m[1]; }
    // Für das Schreiben: Absender (Stelle) und Zeichen aus dem Brief, damit man sie nicht abtippen muss
    const k = kennungen(z, String(text));
    const ZIEL = { jc: { stelle: 'bs-jc', bg: 'bs-bg', az: 'bs-bg' }, sa: { stelle: 'ga-stelle', az: 'ga-az' }, wg: { stelle: 'wg-stelle', az: 'wg-az' }, fk: { kg: 'kz-kgnr' }, pk: { stelle: 'pf-kasse', vnr: 'pf-vnr' }, vm: { stelle: 'nk-verm' } }[out.art] || {};
    for (const [was, id] of Object.entries(ZIEL)) if (k[was] && out.felder[id] == null) out.felder[id] = k[was];
    if (out.art === 'vm') {
      const m = String(text).match(/(?:Abrechnungszeitraum|Zeitraum)\s*:?\s*(?:vom\s*)?(\d{1,2}\.\d{1,2}\.20\d{2})\s*(?:bis|-|–|—|‒)\s*(\d{1,2}\.\d{1,2}\.20\d{2})/i);
      if (m && gueltig(m[1].match(DATUM)) && gueltig(m[2].match(DATUM))) { out.felder['nk-von'] = iso(m[1].match(DATUM)); out.felder['nk-bis'] = iso(m[2].match(DATUM)); }
      const wfl = String(text).match(/(?:Ihre |Wohn)fläche\s*:?\s*(\d+(?:,\d+)?)\s*m/i); if (wfl) out.felder['nk-wfl'] = +wfl[1].replace(',', '.');
      const gfl = String(text).match(/Gesamt(?:wohn)?fläche\s*:?\s*(\d+(?:[.,]\d+)?)\s*m/i); if (gfl) out.felder['nk-gfl'] = +gfl[1].replace('.', '').replace(',', '.');
      for (const zl of z) {
        if (!POSTEN.test(zl)) continue;
        const b = betraege(zl); if (!b.length) continue;
        out.posten.push({ bez: zl.match(POSTEN)[0], gesamt: b.length > 1 ? b[0] : '', anteil: b[b.length - 1], flaeche: /m²|Wohnfläche|qm/i.test(zl) });
      }
    }
    return out;
  }

  // Kennungen für das Schreiben: Stelle (Briefkopf), Aktenzeichen, Nummer der Bedarfsgemeinschaft, Kindergeldnummer, Versichertennummer
  function kennungen(z, text) {
    const k = {};
    const istStelle = (l) => /\b(Jobcenter|Landratsamt|Sozialamt|Bezirk|Stadt |Stadtverwaltung|Gemeinde|Wohngeld|Familienkasse|Pflegekasse|Krankenkasse|AOK|BKK|IKK|Barmer|DAK|Techniker|Knappschaft|Hausverwaltung|Immobilien|Wohnungs|Verwaltung)/i.test(l) && l.length <= 80 && !/\d{2}\.\d{2}\.\d{4}/.test(l) && !/@|E-Mail|Telefon|Sachbearbeit/i.test(l);
    // Briefkopf: erste passende Zeile oben; pdf.js liefert den Kopf manchmal erst nach Fußzeile und Text, dann nur mit Postleitzahl
    const stelle = z.slice(0, 8).find(istStelle) || z.slice(0, 40).find((l) => istStelle(l) && /\b\d{5}\b/.test(l));
    if (stelle) k.stelle = stelle.replace(/[\s|_]+$/, '').trim(); // Rest eines Rahmens aus der Texterkennung („… am Main |“)
    const m = (re) => { const x = text.match(re); return x ? x[1].replace(/\s+/g, ' ').trim() : null; };
    // BG-Nummer: „123 A 12345“ oder wie im BA-Bescheid „73514//0000002“ (Dienststelle // laufende Nummer)
    k.bg = m(/(?:BG-Nummer|BG-Nr\.?|Nummer der Bedarfsgemeinschaft|Bedarfsgemeinschaft(?:snummer)?(?:\s*Nr\.?)?)\s*:?\s*(\d{5}\s?\/\/\s?\d{5,8}|\d{3}\s?[A-Z]?\s?\d{5,8})/i);
    // Zeichen muss eine Ziffer enthalten: sonst wäre im Spaltenkopf „Unser Zeichen   Datum“ das Wort „Datum“ das Zeichen
    const az = text.match(/(?:Aktenzeichen|Geschäftszeichen|Unser Zeichen|Mein Zeichen|Az\.|Wohngeldnummer)\s*:?\s*([A-Za-z0-9][A-Za-z0-9.\/-]*(?: [A-Za-z0-9.\/-]+){0,3})\s*$/im);
    k.az = az && /\d/.test(az[1]) ? az[1].replace(/\s+/g, ' ').trim() : null;
    if (!k.az) {
      // Spaltenkopf „Unser Zeichen“ ohne Wert, Wert genau darunter (nur mit erhaltenen Spalten, z. B. PDF-Layout; sonst unsicher und leer)
      const roh = text.split(/\r?\n/);
      for (let i = 0; i + 1 < roh.length && i < 60; i++) {
        const sp = roh[i].search(/Unser Zeichen|Aktenzeichen|Geschäftszeichen/);
        if (sp < 0 || /\d/.test(roh[i].slice(sp))) continue;
        const w = /\S+/g; let x;
        while ((x = w.exec(roh[i + 1]))) if (Math.abs(x.index - sp) <= 6 && /\d/.test(x[0]) && !DATUM.test(x[0]) && x[0].length >= 4) { k.az = x[0].replace(/,$/, ''); break; }
        if (k.az) break;
      }
    }
    k.kg = m(/(?:Kindergeldnummer|Kindergeld-Nr\.?)\s*:?\s*(\d{3}\s?FK\s?\d{4,8})/i);
    k.vnr = m(/(?:Versichertennummer|Versicherten-Nr\.?|Krankenversichertennummer)\s*:?\s*([A-Z]\d{9})/i);
    return k;
  }

  // Was die App bei Briefen ohne Rechnung sagt
  const ERKLAERUNG = {
    anh: 'Eine Anhörung kommt, bevor das Amt etwas zu deinen Ungunsten entscheidet, zum Beispiel Geld zurückfordert oder kürzt. Du darfst dich innerhalb der genannten Frist äußern. Erkläre kurz, wie es war, und lege Belege bei. Wenn du nicht antwortest, entscheidet das Amt nach Aktenlage.',
    mit: 'Das Amt braucht noch Unterlagen. Reiche sie bis zur genannten Frist ein, am besten mit Kopie und Eingangsbestätigung. Wenn du etwas nicht rechtzeitig schaffst, schreib das vor Ablauf der Frist und nenne einen Termin. Ohne Unterlagen kann das Amt die Leistung ganz oder teilweise versagen (§ 66 SGB I).'
  };
  // Frist für Anhörung und Mitwirkung: Zeile für Zeile, nur aus Zeilen mit einem Frist-Wort („äußern“, „Unterlagen“, „Frist“ …).
  // Ein anderes Datum im Brief („Leistungen bis zum 31.01.2027 bewilligt“) wäre zu spät. Bei mehreren Daten zählt das früheste;
  // ein festes Datum geht vor einer Dauer („innerhalb von zwei Wochen“). Ergebnis: { frist, zeile, abBrief } oder null.
  // abBrief: Die Zeile sagt, dass die Frist ab dem Datum des Schreibens läuft (dann nie ab dem Tag des Erhalts rechnen).
  const FRIST_WORT = /(?:^|[^A-Za-zÄÖÜäöüß])(?:äußer|Äußer|Stellung|einreich|einzureich|reichen Sie|vorleg|vorzuleg|legen Sie|Unterlagen|nachreich|nachzureich|Frist|Widerspruch|Gelegenheit|mitteil|mitzuteil|Nachweis|Rückmeldung)/i;
  const FRIST_ANFANG = /(?:bis zum|bis spätestens(?: zum)?|spätestens bis zum?|spätestens am|innerhalb von|innerhalb eines|binnen)\s*$/i;
  const AB_BRIEF = /\bab (?:dem )?(?:Datum|Ausstellungsdatum) (?:dieses|des|dieser|der) (?:Schreibens|Briefe?s|Bescheide?s|Mitteilung|Anhörung|Aufforderung)|\bnach (?:dem )?Datum (?:dieses|des) (?:Schreibens|Briefe?s)|\bvom Datum dieses Schreibens an\b/i;
  function fristMitZeile(text) {
    const zl = zeilen(text), re = new RegExp(FRIST.source, 'gi');
    let fest = null, dauer = null;
    for (let i = 0; i < zl.length; i++) {
      let z = zl[i];
      if (FRIST_ANFANG.test(z) && i + 1 < zl.length) z += ' ' + zl[i + 1]; // „… bis zum“ am Zeilenende, Datum in der nächsten Zeile
      if (!FRIST_WORT.test(z)) continue;
      const zeile = z.length > 160 ? z.slice(0, 157) + '…' : z;
      let m; re.lastIndex = 0;
      while ((m = re.exec(z))) {
        const d = m[1].match(DATUM);
        if (d) { const x = iso(d); if (!fest || x < fest.iso) fest = { frist: m[1], zeile, iso: x }; }
        else if (!dauer) dauer = { frist: m[1], zeile, abBrief: AB_BRIEF.test(z) };
      }
    }
    if (fest) return { frist: fest.frist, zeile: fest.zeile, abBrief: false };
    return dauer;
  }
  function frist(text) { const r = fristMitZeile(text); return r ? r.frist : null; }
  // Lesbare Anzeige der gefundenen Frist: „innerhalb eines Monats“ liefert nur „Monats“ (das Wort „eines“ steckt im Anfang),
  // „innerhalb einer Woche“ ggf. nur „Woche“. Angezeigt wird dann „1 Monat“ bzw. „1 Woche“; der Rohwert bleibt für die Fristrechnung.
  function fristLesbar(f) {
    const x = String(f == null ? '' : f).trim();
    if (/^Monats$/i.test(x)) return '1 Monat';
    if (/^Woche$/i.test(x)) return '1 Woche';
    const m = /^(einem|einer)\s+(Monat|Woche|Tag)$/i.exec(x);
    return m ? '1 ' + m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase() : x;
  }

  // Anderer Brief: Frist nur mit Beleg (die Zeile aus dem Brief, in der sie steht), dazu Hinweise auf Mahnbescheid oder Inkasso.
  // Ergebnis: { fristen: [{ frist, zeile }], mahnbescheid, vollstreckungsbescheid, inkasso, art (erkannte Art aus erkenne oder null) }
  const FRIST = /(?:bis zum|bis spätestens(?: zum)?|spätestens bis zum?|spätestens am|innerhalb von|innerhalb eines|binnen)\s*(\d{1,2}\.\d{1,2}\.20\d{2}|(?:zwei|drei|vier|sechs|einem|einer|\d{1,2})\s+(?:Wochen?|Tagen?|Monats?|Monaten)|Monats|Woche)/i;
  function andere(text) {
    const t = String(text || ''), fristen = [];
    const zl = zeilen(t), alle = [];
    for (const z of zl) { const m = z.match(FRIST); if (m) alle.push({ frist: m[1], zeile: z.length > 160 ? z.slice(0, 157) + '…' : z }); }
    // Fristen für Widerspruch, Einspruch oder Klage zuerst (stabil sortiert), höchstens 3
    const rf = (x) => (/Widerspruch|Einspruch|Klage/i.test(x.zeile) ? 0 : 1);
    alle.map((x, i) => [x, i]).sort((a, b) => rf(a[0]) - rf(b[0]) || a[1] - b[1]).slice(0, 3).forEach((x) => fristen.push(x[0]));
    // Mahnbescheid: als Überschrift (eigene Zeile, auch „Amtsgericht … – Mahnbescheid“) oder zusammen mit Widerspruch und Zustellung;
    // nicht in Drohsätzen („… werden wir einen Mahnbescheid beantragen“)
    const mbZ = zl.filter((z) => /Mahnbescheid/i.test(z) && !/beantrag|werden wir/i.test(z));
    const mbKopf = mbZ.some((z) => /(^|[–—-]\s*)Mahnbescheid\s*$/i.test(z.trim()));
    const mb = mbKopf || (mbZ.length > 0 && /Widerspruch/i.test(t) && /Zustellung|zugestellt/i.test(t));
    // Vollstreckungsbescheid: Wort und (Einspruch oder „auf der Grundlage des Mahnbescheids“); ein Mahnbescheid mit eigener
    // Überschrift erwähnt ihn oft nur als Folge, dann zählt er nur mit eigener Überschrift
    const vbKopf = zl.some((z) => /(^|[–—-]\s*)Vollstreckungsbescheid\s*$/i.test(z.trim()));
    const vb = /Vollstreckungsbescheid/i.test(t) && (/Einspruch/i.test(t) || /auf der Grundlage des Mahnbescheids/i.test(t)) && (vbKopf || !mbKopf);
    const e = erkenne(t);
    return { fristen, mahnbescheid: !vb && mb && /Amtsgericht|Mahngericht/i.test(t), vollstreckungsbescheid: vb, inkasso: /Inkasso/i.test(t), art: e.art };
  }

  // ---------- Aufforderung zur Senkung der Unterkunfts- oder Heizkosten (§ 22 Abs. 1 SGB II, § 35 SGB XII) ----------
  // Eigene Prüfung statt Eintrag in ARTEN: ein solcher Brief vom Jobcenter gewönne in erkenne() sonst als Bescheid „jc“.
  // Ergebnis: { ist, punkte, traeger: 'jc'|'sa'|null, heiz, kostenIst, grenze, frist, fristZeile, stichtag, datum,
  //   anhoerung, rechtsbehelf, keinVA, eineinhalb }. Nichts davon ist sicher; die App nennt Unsicheres nur „möglich“.
  const KS_KERN = /Kostensenkung|Senkung (der|Ihrer) (Unterkunfts|Wohn|Heiz)?(kosten|Aufwendungen)|(kosten|Aufwendungen)[^.\n]{0,30}zu senken/i;
  const KS_UNANG = /unangemessen/i;
  const KS_ANG = /Angemessenheitsgrenze|Mietobergrenze|angemessene[nr]? (Aufwendungen|Kosten|Miete|Bruttokaltmiete|Heizkosten)|Richtwert/i;
  const KS = [
    [KS_KERN, 6], [KS_UNANG, 3], [KS_ANG, 3],
    [/Kosten der Unterkunft|Unterkunftskosten|Unterkunft und Heizung|Bruttokaltmiete/i, 2],
    [/§\s*22 Abs(?:atz|\.)?\s*1\b[^\n]{0,20}SGB II|§\s*35 Abs(?:atz|\.)?\s*[13]\b[^\n]{0,20}SGB XII/i, 4],
    [/(sechs|6) Monate/i, 2],
    [/Wohnungssuche|Bemühungen|Wohnungsangebote|Untervermietung/i, 2],
    [/Karenzzeit/i, 1]
  ];
  const KS_BESCHEID = [/Bewilligungszeitraum/i, /Berechnungsbogen|Berechnung der Leistung/i, /Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch/i,
    /Rechtsbehelfsbelehrung/i, /hiermit (bewillige|bewilligt)|werden .{0,40}bewilligt/i];
  const KS_KEIN_VA = /kein Verwaltungsakt|kein Bescheid|Widerspruch (ist )?nicht (zulässig|möglich|statthaft)/i;
  function ksTraeger(t) {
    if (/§\s*35\b[^\n]{0,30}SGB XII/i.test(t)) return 'sa';
    if (/§\s*22\b[^\n]{0,30}SGB II\b/i.test(t)) return 'jc';
    if (/Jobcenter/i.test(t)) return 'jc';
    if (/Sozialamt|Amt für Soziales|Grundsicherung im Alter|SGB XII\b|Zwölfte[sn]? Buch/i.test(t)) return 'sa';
    if (/SGB II\b|Zweite[sn]? Buch/i.test(t)) return 'jc';
    return null;
  }
  function kostensenkung(text) {
    const t = String(text || ''), z = zeilen(t);
    const punkte = KS.reduce((s, [re, g]) => s + (re.test(t) ? g : 0), 0);
    const keinVA = KS_KEIN_VA.test(t);
    const bescheid = keinVA ? 0 : KS_BESCHEID.filter((re) => re.test(t)).length;
    const ist = KS_KERN.test(t) && (KS_UNANG.test(t) || KS_ANG.test(t)) && punkte >= 9 && bescheid < 2;
    const anhP = ARTEN.anh.w.reduce((s, [re, g]) => s + (re.test(t) ? g : 0), 0);
    const rechtsbehelf = /Rechtsbehelfsbelehrung|Widerspruch (erheben|einlegen|erhoben werden)/i.test(t)
      && !/kein(en)? Widerspruch|Widerspruch (ist )?nicht (zulässig|möglich|statthaft)|kein Verwaltungsakt/i.test(t);
    const heiz = /Heizkosten/.test(t) && !/Bruttokaltmiete|Kaltmiete|Mietobergrenze|Unterkunftskosten/i.test(t);
    // Beträge: eigene Kosten (erster Betrag) und Grenze des Amts (letzter Betrag), nur aus passenden Zeilen
    let kostenIst = null, grenze = null;
    // Zeilen zur Grenze des Amts („Die angemessenen Aufwendungen betragen 540 €“) sind nicht die eigenen Kosten;
    // „Ihre Miete von 610 € übersteigt die angemessene …“ nennt die eigenen Kosten zuerst
    const istGrenzZeile = (zl) => /angemessen|Angemessenheitsgrenze|Mietobergrenze|Richtwert/i.test(zl) && !/unangemessen|tatsächlich|übersteigt/i.test(zl);
    for (const zl of z) {
      if (!/tatsächlich|Ihre (Brutto)?kaltmiete|betr(a|ä)gt|betragen/i.test(zl) || istGrenzZeile(zl)) continue;
      const b = betraege(zl); if (b.length) { kostenIst = b[0]; break; }
    }
    for (const zl of z) {
      if (!/angemessen|Angemessenheitsgrenze|Mietobergrenze/i.test(zl) || /unangemessen|übersteigt|tatsächlich/i.test(zl)) continue;
      const b = betraege(zl); if (b.length) { grenze = b[b.length - 1]; break; }
    }
    if (grenze == null) for (const zl of z) { if (/übersteigt die angemessene/i.test(zl)) { const b = betraege(zl); if (b.length) { grenze = b[b.length - 1]; break; } } }
    // Frist: nur ein Datum, mit der Zeile als Beleg; Zeilen zur Senkung oder zu Nachweisen zuerst
    const FD = /(?:bis zum|bis spätestens(?: zum)?|spätestens bis zum?|spätestens am)\s*(\d{1,2}\.\d{1,2}\.20\d{2})/i;
    const kand = z.filter((zl) => FD.test(zl));
    const best = kand.find((zl) => /senk|Bemühung|Nachweis|Unterkunft|Heiz|äußern/i.test(zl)) || kand[0] || null;
    const frist = best ? best.match(FD)[1] : null;
    const fristZeile = best ? (best.length > 160 ? best.slice(0, 157) + '…' : best) : null;
    const st = t.match(/ab (?:dem )?(\d{1,2}\.\d{1,2}\.20\d{2})[^\n]{0,80}(nur noch|angemessen)/i);
    return {
      ist, punkte, traeger: ksTraeger(t), heiz, kostenIst, grenze, frist, fristZeile, stichtag: st ? st[1] : null,
      datum: bescheidDatum(z), anhoerung: anhP >= 9, rechtsbehelf, keinVA,
      eineinhalb: /eineinhalb|anderthalb|1,5[- ]?fach|150\s*(%|Prozent)/i.test(t)
    };
  }

  return { erkenne, lies, betraege, ERKLAERUNG, frist, fristLesbar, fristMitZeile, andere, ARTEN, kostensenkung, kennungen: (text) => kennungen(zeilen(text), String(text || '')) };
})();
if (typeof module !== 'undefined') module.exports = BriefLesen;
