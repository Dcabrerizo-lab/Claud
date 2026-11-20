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
  // Beträge: 1.234,56 oder 1234,56 (mit oder ohne €); auch 1 234,56 aus der Texterkennung
  const BETRAG = /(\d{1,3}(?:[.\s]\d{3})+|\d+),(\d{2})(?!\d)/g;
  function betraege(zeile) {
    const out = []; let m; BETRAG.lastIndex = 0;
    while ((m = BETRAG.exec(zeile))) out.push(+(m[1].replace(/[.\s]/g, '') + '.' + m[2]));
    return out;
  }
  const DATUM = /\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/;
  function iso(m) { return `${m[3]}-${('0' + m[2]).slice(-2)}-${('0' + m[1]).slice(-2)}`; }
  function zeilen(text) { return String(text || '').split(/\r?\n/).map((z) => z.replace(/\s+/g, ' ').trim()).filter(Boolean); }

  // Erster Betrag nach einem Stichwort: in derselben Zeile der letzte Betrag (bei Tabellen die Spalte „Gesamt“), sonst in der nächsten Zeile
  function nach(z, muster, opt) {
    opt = opt || {};
    for (let i = 0; i < z.length; i++) {
      if (!muster.some((re) => re.test(z[i]))) continue;
      if (opt.ohne && opt.ohne.some((re) => re.test(z[i]))) continue;
      let b = betraege(z[i]);
      if (!b.length && i + 1 < z.length && !/[A-Za-zÄÖÜäöü]{4,}/.test(z[i + 1].replace(/EUR|Euro/g, ''))) b = betraege(z[i + 1]);
      if (b.length) return opt.erster ? b[0] : b[b.length - 1];
    }
    return null;
  }
  // Datum des Bescheids nur aus eindeutigen Mustern: „Datum: 12.03.2026“, „Bescheid vom 12.03.2026“ oder das Datum im Briefkopf
  // („Musterstadt, den 12.03.2026“ oder nur das Datum in einer eigenen Zeile). Ein anderes Datum (Bewilligungszeitraum,
  // „Ihr Antrag vom“, Geburtsdatum) wäre falsch und verschöbe die Widerspruchsfrist; dann bleibt das Feld leer (bitte eintragen).
  function bescheidDatum(z) {
    const D = '(\\d{1,2}\\.\\d{1,2}\\.20\\d{2})';
    const muster = [new RegExp('(?:^|[^\\wäöüß])(?:Datum|Bescheiddatum)\\s*:?\\s*' + D, 'i'), new RegExp('\\bBescheid(?:es)? vom\\s*' + D, 'i')];
    for (const re of muster) for (const zl of z.slice(0, 40)) { const m = zl.match(re); if (m) return iso(m[1].match(DATUM)); }
    const kopf = new RegExp('^(?:[A-ZÄÖÜ][\\wäöüß .()/-]{1,40},\\s*(?:(?:den|am)\\s+)?)?' + D + '$');
    for (const zl of z.slice(0, 15)) { if (/bis|Zeitraum|geboren|Geburt/i.test(zl)) continue; const m = zl.match(kopf); if (m) return iso(m[1].match(DATUM)); }
    return null;
  }

  // ---------- Felder je Art (IDs der Prüfungen in „Brief prüfen“) ----------
  const FELDER = {
    jc: {
      'bs-b-regel': [[/Regelbedarf/i], { ohne: [/Mehrbedarf/i] }],
      'bs-b-ae': [[/Alleinerziehend/i]],
      'bs-b-schw': [[/Schwanger|werdende Mütter/i]],
      'bs-b-ww': [[/Warmwasser/i]],
      'bs-b-kdu': [[/Unterkunft und Heizung|Kosten der Unterkunft|Bedarfe für Unterkunft/i]],
      'bs-b-eink': [[/anzurechnende[sn]? Einkommen|zu berücksichtigende[sn]? Einkommen|Einkommen (gesamt|insgesamt)/i], { ohne: [/Kindergeld/i] }],
      'bs-b-kg': [[/Kindergeld/i]],
      'bs-b-zahl': [[/Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch|Leistungsanspruch|monatliche[rn]? Gesamtbetrag/i]],
      'bs-heiz': [[/Heizkosten|Heizung\b/i], { ohne: [/Unterkunft und Heizung/i] }]
    },
    sa: {
      'ga-b-regel': [[/Regelbedarf|Regelsatz/i], { ohne: [/Mehrbedarf/i] }],
      'ga-b-g': [[/Merkzeichen G|Mehrbedarf.{0,20}\bG\b|Gehbehinderung/i]],
      'ga-b-ww': [[/Warmwasser/i]],
      'ga-b-kdu': [[/Unterkunft und Heizung|Kosten der Unterkunft/i]],
      'ga-b-eink': [[/anzurechnende[sn]? Einkommen|einzusetzende[sn]? Einkommen|Einkommen (gesamt|insgesamt)/i]],
      'ga-b-zahl': [[/Zahlbetrag|Auszahlungsbetrag|Gesamtanspruch|monatliche[rn]? Leistung/i]],
      'ga-heiz': [[/Heizkosten/i]]
    },
    wg: {
      'wg-b-miete': [[/zu berücksichtigende Miete|berücksichtigungsfähige Miete|Höchstbetrag|Miete \/ Belastung|zu berücksichtigende Belastung/i]],
      'wg-b-eink': [[/Gesamteinkommen/i]],
      'wg-b-wg': [[/Wohngeld (in Höhe von|monatlich|beträgt)|monatliche[sn]? Wohngeld|Wohngeldbetrag/i]],
      'wg-kalt': [[/Bruttokaltmiete|Miete ohne Heizkosten/i]]
    },
    fk: {
      'kz-b-bedarf': [[/Bedarf der Eltern|elterliche[rn]? Bedarf|Gesamtbedarf der Eltern/i]],
      'kz-b-eink': [[/Einkommen der Eltern|elterliche[sn]? Einkommen|zu berücksichtigende[sn]? Einkommen/i]],
      'kz-b-kiz': [[/Kinderzuschlag.{0,30}(insgesamt|monatlich|gesamt|in Höhe)|Gesamtbetrag Kinderzuschlag/i]],
      'kz-wohn': [[/Wohnkosten|Kosten für Unterkunft|Miete und Heizung/i]]
    },
    vm: {
      'nk-voraus': [[/geleistete Vorauszahlung|Ihre Vorauszahlung|Vorauszahlungen? (gesamt|insgesamt)|abzüglich Vorauszahlung/i]],
      'nk-heiz': [[/Heizkosten.{0,25}(Ihr|Anteil)|Ihr Anteil Heiz|Heiz- und Warmwasserkosten/i]]
    }
  };
  // Nebenkosten: Posten mit Kosten für das Haus (erster Betrag) und Anteil (letzter Betrag)
  const POSTEN = /^(Grundsteuer|Müll\w*|Abfall\w*|Wasser\w*|Abwasser|Kaltwasser|Entwässerung|Niederschlagswasser|Straßenreinigung|Hausreinigung|Treppenhausreinigung|Gebäudereinigung|Hausmeister\w*|Garten\w*|Allgemeinstrom|Beleuchtung|Strom (allgemein|Treppenhaus)|Versicherung\w*|Gebäudeversicherung|Haftpflicht\w*|Aufzug|Fahrstuhl|Schornstein\w*|Kabel\w*|Antenne|Ungeziefer\w*|Winterdienst|Verwaltung\w*|Instandhaltung\w*|Reparatur\w*|Bankgebühren|Porto|Rauchwarnmelder\w*|Wartung\w*)\b/i;

  function lies(text, art) {
    const z = zeilen(text);
    const e = art ? { art, titel: ARTEN[art] ? ARTEN[art].titel : '', sicher: 99 } : erkenne(text);
    const out = Object.assign({}, e, { datum: bescheidDatum(z), felder: {}, posten: [], text: String(text || '') });
    const f = FELDER[out.art] || {};
    for (const [id, [muster, opt]] of Object.entries(f)) { const w = nach(z, muster, opt); if (w != null) out.felder[id] = w; }
    if (out.art === 'jc' || out.art === 'sa') {
      // Miete (ohne Heizung) aus Grundmiete + Nebenkosten
      const gm = nach(z, [/Grundmiete|Kaltmiete|Nettokaltmiete/i]), nk = nach(z, [/^Nebenkosten|kalte Nebenkosten|Betriebskosten/i]);
      if (gm != null) out.felder[out.art === 'jc' ? 'bs-miete' : 'ga-miete'] = Math.round((gm + (nk || 0)) * 100) / 100;
    }
    if (out.art === 'wg') { const m = String(text).match(/(\d+)\s*(?:zu berücksichtigende )?Haushaltsmitglied/i); if (m) out.felder['wg-n'] = +m[1]; }
    // Für das Schreiben: Absender (Stelle) und Zeichen aus dem Brief, damit man sie nicht abtippen muss
    const k = kennungen(z, String(text));
    const ZIEL = { jc: { stelle: 'bs-jc', bg: 'bs-bg', az: 'bs-bg' }, sa: { stelle: 'ga-stelle', az: 'ga-az' }, wg: { stelle: 'wg-stelle', az: 'wg-az' }, fk: { kg: 'kz-kgnr' }, pk: { stelle: 'pf-kasse', vnr: 'pf-vnr' }, vm: { stelle: 'nk-verm' } }[out.art] || {};
    for (const [was, id] of Object.entries(ZIEL)) if (k[was] && out.felder[id] == null) out.felder[id] = k[was];
    if (out.art === 'vm') {
      const m = String(text).match(/(?:Abrechnungszeitraum|Zeitraum)\s*:?\s*(?:vom\s*)?(\d{1,2}\.\d{1,2}\.20\d{2})\s*(?:bis|-|–)\s*(\d{1,2}\.\d{1,2}\.20\d{2})/i);
      if (m) { out.felder['nk-von'] = iso(m[1].match(DATUM)); out.felder['nk-bis'] = iso(m[2].match(DATUM)); }
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
    const stelle = z.slice(0, 8).find((l) => /\b(Jobcenter|Landratsamt|Sozialamt|Bezirk|Stadt |Gemeinde|Wohngeld|Familienkasse|Pflegekasse|Krankenkasse|AOK|BKK|IKK|Barmer|DAK|Techniker|Knappschaft|Hausverwaltung|Immobilien|Wohnungs|Verwaltung)/i.test(l) && l.length <= 80 && !/\d{2}\.\d{2}\.\d{4}/.test(l));
    if (stelle) k.stelle = stelle.trim();
    const m = (re) => { const x = text.match(re); return x ? x[1].replace(/\s+/g, ' ').trim() : null; };
    k.bg = m(/(?:BG-Nummer|BG-Nr\.?|Nummer der Bedarfsgemeinschaft|Bedarfsgemeinschaft(?:snummer)?(?:\s*Nr\.?)?)\s*:?\s*(\d{3}\s?[A-Z]?\s?\d{5,8})/i);
    k.az = m(/(?:Aktenzeichen|Geschäftszeichen|Unser Zeichen|Az\.|Wohngeldnummer)\s*:?\s*([A-Za-z0-9][A-Za-z0-9.\/-]*(?: [A-Za-z0-9.\/-]+){0,3})\s*$/im);
    k.kg = m(/(?:Kindergeldnummer|Kindergeld-Nr\.?)\s*:?\s*(\d{3}\s?FK\s?\d{4,8})/i);
    k.vnr = m(/(?:Versichertennummer|Versicherten-Nr\.?|Krankenversichertennummer)\s*:?\s*([A-Z]\d{9})/i);
    return k;
  }

  // Was die App bei Briefen ohne Rechnung sagt
  const ERKLAERUNG = {
    anh: 'Eine Anhörung kommt, bevor das Amt etwas zu deinen Ungunsten entscheidet, zum Beispiel Geld zurückfordert oder kürzt. Du darfst dich innerhalb der genannten Frist äußern. Erkläre kurz, wie es war, und lege Belege bei. Wenn du nicht antwortest, entscheidet das Amt nach Aktenlage.',
    mit: 'Das Amt braucht noch Unterlagen. Reiche sie bis zur genannten Frist ein, am besten mit Kopie und Eingangsbestätigung. Wenn du etwas nicht rechtzeitig schaffst, schreib das vor Ablauf der Frist und nenne einen Termin. Ohne Unterlagen kann das Amt die Leistung ganz oder teilweise versagen (§ 66 SGB I).'
  };
  function frist(text) { const m = String(text).match(/(?:bis zum|bis spätestens|spätestens bis zum?|innerhalb von)\s*(\d{1,2}\.\d{1,2}\.20\d{2}|\w+ Wochen?)/i); return m ? m[1] : null; }

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

  return { erkenne, lies, betraege, ERKLAERUNG, frist, andere, ARTEN, kostensenkung, kennungen: (text) => kennungen(zeilen(text), String(text || '')) };
})();
if (typeof module !== 'undefined') module.exports = BriefLesen;
