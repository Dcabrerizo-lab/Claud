// Unabhängige Referenzrechnung. Bewusst NICHT aus src/rules.js abgeleitet: eigene Tabellen, eigene Formeln,
// direkt nach dem Gesetzestext (Stand 2026). test/test-raster.js vergleicht die App über sehr viele Haushalte damit.
// Wo die App bewusst vereinfacht (z. B. Schwellen für „wahrscheinlich“), nutzt die Referenz dieselben Konventionen,
// die Rechnung selbst ist getrennt geschrieben.
'use strict';

// ---------- Beträge 2026 ----------
const RB = { 1: 563, 2: 506, 3: 451, 4: 471, 5: 390, 6: 357 }; // Regelbedarfsstufen (RBSFV 2026)
const KG = 259; // Kindergeld je Kind (§ 66 EStG)
// Minijob-Grenze (§ 8 Abs. 1a SGB IV): 603 € im Jahr 2026, 633 € ab 1.1.2027 (Mindestlohn 14,60 €)
const minijobAm = (heute) => ((heute || new Date().getFullYear() + new Date().getMonth() / 12) >= 2027 ? 633 : 603);
const UVG = { u6: 227, u12: 299, u18: 394 }; // § 2 UVG i. V. m. Mindestunterhalt, abzgl. Kindergeld
// § 2 Abs. 4 UVG: Arbeitnehmer-Pauschbetrag 1.230 € im Jahr (§ 9a EStG), davon ein Zwölftel; Auszubildende weitere 100 €
const UVG_WK = 1230 / 12, UVG_AZUBI = 100;

// ---------- Hilfen ----------
const leer = (v) => v === '' || v == null;
const zahl = (v) => { const x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(x) && x > 0 ? x : 0; };
const runde10 = (x) => Math.round(x / 10) * 10;

// Rentenalter (§ 235 SGB VI): Monate über 65 je Geburtsjahr
function regelaltersgrenze(jahr) {
  if (jahr < 1947) return 65;
  if (jahr >= 1964) return 67;
  const monate = jahr <= 1958 ? jahr - 1946 : 12 + (jahr - 1958) * 2;
  return 65 + monate / 12;
}

// Haushalt aus den Eingaben aufbauen: Liste der Personen mit Rolle, Alter(sgruppe) und Einkommen
// Kinder der Geburt bei schon laufendem Elterngeld (Baby ist da): Zwillinge 2, Drillinge oder mehr 3 (§ 10 Abs. 4 BEEG)
function egMehrlinge(e) { return e && e.baby === 'da' ? Math.min(3, Math.max(1, Number(e.egKinder) | 0)) : 1; }
// Baby ist da: lebt im Haushalt, ist ein Kind unter 6 (§§ 62, 63 EStG), auch wenn es bei „Kinder“ fehlt (Vollprüfung familie 24.11.2026)
const babyKinder = (e) => (e && e.baby === 'da' ? egMehrlinge(e) : 0);
const kinderMitBaby = (e) => Math.max(Math.max(0, e.kids | 0), babyKinder(e));
// Elterngeld als Einkommen (§ 10 BEEG, Fassung seit 1.1.2023; Abruf 24.11.2026): Grundsicherungsgeld, Sozialhilfe, Kinderzuschlag (Abs. 5):
// frei höchstens 300 €, höchstens das Elterngeld-Netto vor der Geburt (Netto − 1.230 €/12), ElterngeldPlus die Hälfte, Mehrlinge nicht vervielfacht.
// Wohngeld (Abs. 1, 3, 4): 300 € bzw. ElterngeldPlus 150 € je Kind der Geburt. Basiselterngeld mindestens 300 € (+ 300 € je weiteres Kind der
// Geburt), ElterngeldPlus höchstens 900 € + 10 % Geschwisterbonus + 150 € je weiteres Kind: dazwischen offen, ob Basis oder Plus.
// Ohne Netto vor der Geburt: höchstens Mindestbetrag + Geschwisterbonus 75 € (wenn möglich) + Mehrlingszuschlag kann ohne Einkommen entstehen.
function elterngeldFrei(e, b) {
  if (!(b > 0)) return { lo: 0, hi: 0, wgLo: 0, wgHi: 0 };
  const m = egMehrlinge(e);
  const bonus = e.baby === 'da' && Math.min(Math.max(0, e.kidsU6 | 0), kinderMitBaby(e)) > m;
  const vor = leer(e.egVor) ? null : zahl(e.egVor);
  const basisMin = 300 * m, plusMax = 900 * 1.1 + 150 * (m - 1);
  const nurPlus = b < basisMin, nurBasis = b > plusMax;
  const ohneEinkommenBis = 300 + (bonus ? 75 : 0) + 300 * (m - 1);
  const grund = (plus) => {
    const deckel = plus ? 150 : 300;
    if (vor == null) return b <= (plus ? ohneEinkommenBis / 2 : ohneEinkommenBis) ? 0 : deckel;
    return Math.min(deckel, Math.max(0, vor - 1230 / 12));
  };
  const v = nurPlus ? [grund(true)] : nurBasis ? [grund(false)] : [grund(true), grund(false)];
  const w = nurPlus ? [150] : nurBasis ? [300] : [150, 300];
  return { lo: Math.min(...v), hi: Math.max(...v), wgLo: Math.min(...w) * m, wgHi: Math.max(...w) * m };
}
function haushalt(e) {
  const erwachsene = e.adults === 2 ? 2 : 1;
  const kinder = kinderMitBaby(e), jung = Math.max(0, e.young | 0);
  const u6 = Math.min(Math.max(babyKinder(e), e.kidsU6 | 0), kinder);
  const k14 = Math.min(Math.max(0, e.kids14 | 0), kinder - u6);
  const mitte = kinder - u6 - k14;
  const brutto = zahl(e.brutto), brutto2 = erwachsene === 2 ? Math.min(zahl(e.brutto2), brutto) : 0;
  const nettoAngabe = !leer(e.netto) && zahl(e.netto) > 0;
  const netto = nettoAngabe ? zahl(e.netto) : brutto * 0.8;
  const arten = ['lohn', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'ohne'];
  // Selbstständige: Gewinn wie Einkommen aus Arbeit (Freibetrag § 11b Abs. 3 SGB II, Pauschalabzug beim Wohngeld wie Lohn)
  const art = (a, alt) => (a === 'selbst' ? 'lohn' : arten.indexOf(a) >= 0 ? a : (alt ? 'rente' : 'lohn'));
  // aus: Betrag ist schon ausgezahlt. Die App fragt ALG, Krankengeld, Elterngeld und Werkstattlohn als Auszahlung ab (und eine künftige Leistung)
  const ausgezahlt = (a) => ['alg', 'kg', 'eg', 'wfbm'].indexOf(a) >= 0;
  const p = [{ art: art(e.art1, e.nichtArbeit), brutto: brutto - brutto2 }];
  p[0].aus = !!e.aus1 || ausgezahlt(p[0].art); p[0].selbst = e.art1 === 'selbst';
  if (erwachsene === 2) { const a2 = art(e.art2, e.nichtArbeit2); p.push({ art: a2, brutto: brutto2, aus: ausgezahlt(a2), selbst: e.art2 === 'selbst' }); }
  // Alter
  const jahr = Number(e.gebJahr) | 0;
  const heute = e.heute ? Number(e.heute) : new Date().getFullYear() + new Date().getMonth() / 12;
  let gruppeAlt = '';
  let rente = !!e.alter, grenz = false, gruppe = { '<31': '<30', '31-40': '30-39', '41-50': '40-49', '51+': '50+', '<30': '<30', '30-39': '30-39', '40-49': '40-49', '50+': '50+' }[e.alterGruppe] || '', jahre = 0;
  if (jahr >= 1900 && jahr <= 2010) {
    const rag = regelaltersgrenze(jahr);
    rente = jahr + 1 + rag <= heute; // auch bei Geburt im Dezember erreicht
    grenz = !rente && jahr + rag <= heute; // bei Geburt im Januar erreicht
    const alter = heute - jahr - 0.5;
    jahre = alter; // vollendete Lebensjahre (Mitte des Geburtsjahres)
    gruppe = alter < 30 ? '<30' : alter < 40 ? '30-39' : alter < 50 ? '40-49' : '50+';
    // § 12 Abs. 2 Satz 2 SGB II: Wer dieses Jahr 30, 40 oder 50 wird, hat je nach Geburtsmonat den kleineren oder größeren Freibetrag
    const vor = Math.floor(heute) - jahr - 1, nach = vor + 1;
    if ([30, 40, 50].indexOf(nach) >= 0) gruppeAlt = gruppe === (nach === 30 ? '30-39' : nach === 40 ? '40-49' : '50+') ? (vor < 30 ? '<30' : vor < 40 ? '30-39' : '40-49') : (nach === 30 ? '30-39' : nach === 40 ? '40-49' : '50+');
  }
  // § 11b Abs. 2b SGB II: unter 25 in Ausbildung (Person 1): Minijob-Grenze statt 100 € frei; Alter unbekannt: offen
  const azubi = e.ausbildung === 'ich' ? (jahre ? (jahre < 25 ? 'ja' : '') : (gruppe === '' || gruppe === '<30' ? 'evtl' : '')) : '';
  const regelEltern = erwachsene === 2 ? 2 * RB[2] : RB[1];
  const regelKinder = u6 * RB[6] + mitte * RB[5] + k14 * RB[4] + jung * RB[3];
  const personen = erwachsene + kinder + jung;
  const unterhalt = kinder + jung > 0 ? zahl(e.unterhalt) : 0;
  const kindEink = kinder + jung > 0 ? zahl(e.kindEink) : 0;
  // Selbst gezahlter Unterhalt: SGB II nur festgelegt (Titel, Urkunde, Notar); Wohngeld § 18 WoGG 3.000 €/Jahr je Kind, 6.000 €/Jahr Ex-Partner
  const uz = zahl(e.uzBetrag);
  const uzFest = uz > 0 && !!e.uzTitel;
  const uzWer = { k1: [1, 0], k2: [2, 0], k3: [3, 0], ex: [0, 1], exk: [1, 1] }[e.uzAn] || [1, 0];
  const uzDeckel = uzWer[0] * 3000 / 12 + uzWer[1] * 6000 / 12;
  // Waisenrente der Kinder: Einkommen der Kinder wie Unterhalt
  const waisen = kinder + jung > 0 ? zahl(e.waisen) : 0;
  // Azubi-Einkommen eines einzigen 14- bis 17-jährigen Kindes (§ 2 Abs. 4 UVG), aus dem Auszahlungsbetrag (untere Grenze)
  const azubiAnr = kinder === 1 && jung === 0 && k14 === 1 && e.ausbildung === 'kindBetrieb' ? Math.max(0, kindEink - UVG_WK - UVG_AZUBI) / 2 : 0;
  // Unterhaltsvorschuss, den die Kinder bekämen: Elternteil allein oder mit neuem Partner ohne Trauschein, Unterhalt fehlt,
  // nicht ein einziges Kind im Wechselmodell (Asyl/Duldung offen: deutsches Kind möglich); ab 12 nur mit 600 € eigenem Einkommen (Partner zählt nicht)
  let uvg = 0, uvgOffen = 0, uvgOffenGG = 0;
  const allein = erwachsene === 1 || e.uvgPartner === 'neu';
  const grundUVG = kinder > 0 && e.unterhaltFehlt && !(e.uvgWechsel && kinder === 1);
  // Ein Kind von 14 bis 17 ist immer 12 oder älter (§ 1 Abs. 1a UVG), auch ohne Haken
  const ohneAeltere = (!!e.kinder12 || k14 > 0) && brutto - brutto2 < 600;
  // Haken „ab 12“ ohne Kind von 14 bis 17: ein 6- bis 13-jähriges Kind ist 12 oder 13 und gehört zur dritten Altersstufe
  // (§ 2 Abs. 1 UVG mit § 1612a Abs. 1 Satz 3 Nr. 3 BGB: ab dem 13. Lebensjahr; abgerufen 21.11.2026)
  const zwoelf = e.kinder12 && k14 === 0 && mitte >= 1 ? 1 : 0;
  const aeltere = k14 + zwoelf;
  const uvgSumme = (ohneAe) => Math.max(0, u6 * UVG.u6 + (mitte - zwoelf) * UVG.u12 + (ohneAe ? 0 : aeltere * UVG.u18) - unterhalt - waisen - azubiAnr);
  // Befunde G2/K1/U1 (Rechenplan): UVG offen, wenn die zweite Person unbekannt ist (Ehe: kein UVG, § 1 Abs. 1 Nr. 2 UVG) oder der andere
  // Elternteil bei mehreren Kindern (§ 1 Abs. 3 UVG nur für gemeinsame Kinder); Kinder ab 12 bekommen UVG auch ohne 600 €, wenn sie kein
  // Grundsicherungsgeld bekommen (§ 1 Abs. 1a Nr. 1 UVG) – also mit Kinderzuschlag oder Wohngeld. Nur für „wahrscheinlich“ (vorsichtig).
  if (allein && grundUVG) { uvg = uvgSumme(ohneAeltere); uvgOffen = uvgSumme(false) - uvg; }
  else if (grundUVG && erwachsene === 2 && (!e.uvgPartner || (e.uvgPartner === 'eltern' && kinder > 1))) { uvgOffen = uvgSumme(false); uvgOffenGG = uvgSumme(ohneAeltere); }
  // Mehrbedarf Alleinerziehende (§ 21 Abs. 3 SGB II): 36 % (1 Kind < 7 oder 2-3 Kinder < 16) oder 12 % je Kind, max. 60 %
  let mehrAE = 0;
  if (erwachsene === 1 && kinder > 0) {
    const unter16 = kinder - k14;
    const prozent = Math.min(0.6, Math.max(0.12 * kinder, u6 >= 1 || (unter16 >= 2 && unter16 <= 3) ? 0.36 : 0));
    mehrAE = prozent * RB[1];
  }
  // Wechselmodell: halber Mehrbedarf (BSG 3.3.2009, B 4 AS 50/07 R), vorsichtig; offen bis zum vollen
  let mehrAEoffen = 0;
  if (e.uvgWechsel && erwachsene === 1 && kinder > 0) { mehrAEoffen = mehrAE / 2; mehrAE /= 2; }
  const em = e.emStd === 'unter3' || !!e.wfbm || !!e.erwerbsgemindert || e.art1 === 'wfbm' || e.art2 === 'wfbm' || (Array.isArray(e.einkommen) && e.einkommen.some((x) => x.art === 'wfbm'));
  return { e, erwachsene, kinder, jung, u6, k14, mitte, personen, brutto, brutto2, netto, p, rente, grenz, gruppe, gruppeAlt, azubi, jahre, em,
    mini: minijobAm(heute), regelEltern, regel: regelEltern + regelKinder, regelKinder, mehrAEoffen, miete: zahl(e.miete), vermoegen: zahl(e.vermoegen), unterhalt, waisen, azubiAnr, kindEink, uvg, uvgOffen, uvgOffenGG, mehrAE, uz, uzFest, uzDeckel,
    bezug: e.bezug || {}, kids: kinder + jung };
}

// ---------- SGB II: Einkommen nach Abzügen ----------
// § 11b Abs. 2, 3 SGB II: 100 € Grundfreibetrag, 20 % (100-520), 30 % (520-1.000), 10 % (1.000-1.200; mit minderjährigem Kind 1.500)
function freibetragArbeit(b, mitKind) {
  const stufen = [[0, 100, 1], [100, 520, 0.2], [520, 1000, 0.3], [1000, mitKind ? 1500 : 1200, 0.1]];
  return stufen.reduce((s, [von, bis, q]) => s + Math.max(0, Math.min(b, bis) - von) * q, 0);
}
// § 11b Abs. 2b, Abs. 3 Satz 4 SGB II: Minijob-Grenze statt 100 €, ohne die Stufe 20 %
function freibetragAzubi(b, mitKind, mini) {
  const stufen = [[520, 1000, 0.3], [1000, mitKind ? 1500 : 1200, 0.1]];
  return Math.min(b, Math.min(b, mini) + stufen.reduce((s, [von, bis, q]) => s + Math.max(0, Math.min(b, bis) - von) * q, 0));
}
function elternEinkommenSGB2(h, azubi, egHoch) {
  let abzug = 0;
  const az = azubi != null ? azubi : h.azubi === 'ja';
  h.p.forEach((x, i) => {
    if (x.art === 'lohn') abzug += i === 0 && az ? freibetragAzubi(x.brutto, h.kinder > 0, h.mini) : freibetragArbeit(x.brutto, h.kinder > 0);
    else if (x.art !== 'ohne' && x.brutto > 0) abzug += 30; // Versicherungspauschale
    if (x.art === 'eg') abzug += egHoch ? elterngeldFrei(h.e, x.brutto).hi : elterngeldFrei(h.e, x.brutto).lo; // § 10 Abs. 5 BEEG
  });
  if (h.uzFest) abzug += h.uz; // § 11b Abs. 1 Satz 1 Nr. 7 SGB II
  return Math.max(0, h.netto - abzug);
}
// Einkommen der Kinder, das ihren Bedarf deckt (Überschuss mindert nicht den Bedarf der Eltern). § 11 Abs. 1 Satz 5 SGB II: zuerst das eigene
// Einkommen des Kindes; Kindergeld nur, soweit noch Bedarf bleibt, der Rest zählt beim Elternteil (minus 30 €, wenn bei ihm noch keine
// Pauschale abgeht). Rückgabe ohne Kindergeld (das zählt der Aufrufer voll). alt: frühere Reihenfolge (untere Grenze bei mehreren Kindern).
function kinderEinkommen(h, extra, alt) {
  const e = h.unterhalt + h.waisen + h.uvg + (extra || 0) + Math.max(0, h.kindEink - h.mini);
  if (!e) return 0;
  const bedarf = Math.max(0, h.regelKinder + h.miete * h.kids / h.personen);
  if (alt) return Math.min(kinderEinkommen(h, extra), Math.max(0, bedarf - h.kids * KG));
  const anr = Math.min(e, bedarf);
  const rest = Math.min(h.kids * KG, Math.max(0, h.kids * KG - (bedarf - anr)));
  const pauschaleSchon = h.p.some((x, i) => (x.art !== 'lohn' && x.art !== 'ohne' && x.brutto > 0) || (i === 0 && x.art === 'lohn' && x.brutto >= 30));
  return Math.max(0, anr - (rest > 0 && !pauschaleSchon ? Math.min(rest, 30) : 0));
}

// Regelsatz der Person mit Behinderung und Mehrbedarfe wegen Behinderung (§ 21 Abs. 4, § 23 Nr. 2 und 4 SGB II; § 30 Abs. 1 und 4 SGB XII)
function regelSatzBehindert(h) {
  const p = h.e.bhPerson;
  if (p === 'minder') return RB[4];
  if (p === 'erwVor25' && h.jung > 0) return RB[3];
  if (p === 'erwVor25' || p === 'erwNach25') return h.erwachsene === 2 ? RB[2] : RB[1];
  return 0;
}
// Schwangerschaft 17 % (Erwachsenen-Regelsatz), Warmwasser aus dem Boiler (2,3 / 1,4 / 1,2 / 0,8 %), Ernährung nur als „möglich“ (20 % RS1)
function mehrSonst(h, eigenRegel) {
  const e = h.e;
  const erw = eigenRegel || (h.erwachsene === 2 ? RB[2] : RB[1]);
  const schw = e.schwanger ? 0.17 * erw : 0;
  let ww = 0, wwEltern = 0;
  if (e.warmwasser) {
    if (eigenRegel) ww = 0.023 * eigenRegel;
    else { wwEltern = 0.023 * h.regelEltern; ww = wwEltern + 0.023 * h.jung * RB[3] + 0.014 * h.k14 * RB[4] + 0.012 * h.mitte * RB[5] + 0.008 * h.u6 * RB[6]; }
  }
  return { sicher: schw + ww, eltern: schw + wwEltern, moeglich: e.ernaehrung ? 0.2 * RB[1] : 0 };
}
function behMehrSGB2(h) {
  const e = h.e, rp = regelSatzBehindert(h);
  const teil = !!e.teilhabe && !e.wfbm;
  const sicher = teil && (e.bhPerson === 'erwVor25' || e.bhPerson === 'erwNach25') ? 0.35 * rp : 0;
  let moeglich = teil && e.bhPerson === 'minder' ? 0.35 * rp : 0;
  if (e.mzG && (e.bhPerson === 'minder' || e.bhPerson === 'erwVor25')) moeglich += Math.max(0, 0.17 * rp - (e.teilhabe ? 0.35 * rp : 0));
  return { sicher, moeglich };
}

// EU-Staatsangehörige ohne Arbeit (auch keine selbstständige), weniger als 5 Jahre in Deutschland: ausgeschlossen (§ 7 SGB II, § 23 SGB XII)
function euAus(h) {
  const e = h.e;
  const selbst = e.art1 === 'selbst' || (h.erwachsene === 2 && e.art2 === 'selbst');
  return e.aufenthalt === 'eu' && e.euJahre !== 'ab5' && e.euArbeit !== 'ja' && !selbst && !(h.p[0].art === 'lohn' && h.brutto > 0);
}
// Besondere Lagen: „wahrscheinlich“ wird „möglich“ (Eigentum, Verwandte in der Wohnung, teures Auto)
function kappe(e, id, level) {
  if (level !== 'ja') return level;
  const eig = e.wohnart === 'eigentum', verw = e.hhAndere === 'verwandte', auto = (Number(e.autoWert) || 0) > 15000 && !e.autoBraucht;
  if (eig && (id === 'ggeld' || id === 'gsa' || id === 'wohngeld')) return 'vielleicht';
  if (verw && (id === 'ggeld' || id === 'wohngeld')) return 'vielleicht';
  if (auto && (id === 'ggeld' || id === 'kiz')) return 'vielleicht';
  if (auto && !e.mzG && !(e.mz && e.mz.aG) && (id === 'gsa' || id === 'hzp' || id === 'blh')) return 'vielleicht';
  return level;
}
function grundsicherungsgeld(h) {
  if (euAus(h)) return { level: 'nein' };
  // Paar mit einer Person im Rentenalter bzw. voll erwerbsgemindert: die andere kann erwerbsfähig und selbst leistungsberechtigt sein
  // (§ 7 Abs. 1 Satz 1, Abs. 3 Nr. 3 SGB II; gemischte Bedarfsgemeinschaft) – nie „nein“, auch ohne Kinder; laufender Bezug: „na“
  // Voll erwerbsgemindert: nur der Elternteil zählt (emElternteil); ein erwachsenes Kind in der Werkstatt hat eigene Grundsicherung (§ 41 Abs. 3
  // SGB XII, § 5 Abs. 2 SGB II), der erwerbsfähige Elternteil bleibt beim Jobcenter (§ 7 Abs. 1 SGB II)
  // Allein, Werkstatt-Haken nur bei „eine erwachsene Person“ ohne eigenen Werkstattlohn: kann die Person selbst oder ein Kind ab 25 sein
  // (eigene Bedarfsgemeinschaft, § 7 Abs. 3 Nr. 4 SGB II) -> rechnen wie ohne Werkstatt, höchstens „möglich“
  if (!h.rente && h.erwachsene === 1 && emWerRef(h.e)) { const r = grundsicherungsgeld(haushalt({ ...h.e, wfbm: false })); return { level: r.level === 'ja' ? 'vielleicht' : r.level }; }
  if (h.rente || emElternteil(h.e)) return { level: h.erwachsene === 2 ? (h.bezug.grundsicherungsgeld ? 'na' : 'vielleicht') : 'nein' };
  const b = h.bezug;
  if (b.grundsicherungsgeld) return { level: 'na' };
  // Nur das erwachsene Kind voll erwerbsgemindert: der Bezug vom Sozialamt ist dann in der Regel der des Kindes und schließt den Elternteil nicht aus
  if (b.sozialamt && !kindNurEMRef(h)) return { level: 'nein' };
  // § 7 Abs. 5 SGB II: Ausschluss dem Grunde nach, unabhängig vom Alter (BSG B 14 AS 24/09 R); nur die Person in Ausbildung (Partner/Kinder:
  // eigener Anspruch -> „möglich“ ohne Betrag); bei den Eltern § 7 Abs. 6 Nr. 2 -> weiter rechnen, höchstens „möglich“
  const ausb = h.e.ausbildung === 'ich' && !h.e.babBetrieb, eltern = h.e.wohnform === 'eltern';
  if (ausb && !eltern) return { level: h.erwachsene === 2 || h.kids > 0 ? 'vielleicht' : 'nein' };
  const SCH = { '': 10000, '<30': 5000, '30-39': 10000, '40-49': 12500, '50+': 20000 };
  const schonG = (g) => SCH[g] * h.erwachsene + 5000 * h.kids;
  const schon = Math.max(schonG(h.gruppe), h.gruppeAlt ? schonG(h.gruppeAlt) : 0);
  if (h.vermoegen > schon) return { level: 'nein' };
  // kleinste mögliche Grenze: erste Person ohne Alter unter 30 bzw. im Grenzjahr die kleinere Gruppe, weitere Personen unter 30
  const erste = h.gruppe === '' ? 5000 : Math.min(SCH[h.gruppe], h.gruppeAlt ? SCH[h.gruppeAlt] : Infinity);
  const vMin = erste + 5000 * (h.erwachsene - 1 + h.kids);
  // Bei den Eltern unter 25 ohne Kind: Regelbedarfsstufe 3 (§ 20 Abs. 2 Satz 2 Nr. 1 SGB II)
  const u25 = eltern && h.erwachsene === 1 && h.kids === 0 && h.jahre && h.jahre < 25;
  const regel = h.regel - (u25 ? RB[1] - RB[3] : 0);
  const bm = behMehrSGB2(h), ms = mehrSonst(h);
  const bedarf = regel + h.miete + h.mehrAE + bm.sicher + ms.sicher;
  const hR = u25 ? { ...h, regel } : h;
  const eink = elternEinkommenSGB2(h) + h.kids * KG + kinderEinkommen(hR);
  const luecke = bedarf - eink;
  // Befund G2: möglicher, nicht sicherer UVG (Einkommen des Kindes bis zu seinem Bedarf) -> „wahrscheinlich“ nur, wenn die Lücke bleibt
  const offen = kinderEinkommen(hR, h.uvgOffenGG) - kinderEinkommen(hR);
  // Gegen ein falsches „nein“: Kinder ohne Altersangabe vielleicht 14 bis 17 (471 statt 390 €), Unterhalt bei mehreren Kindern, Freibetrag § 11b Abs. 2b
  const altersAngabe = !!h.e.kidsAlter || (h.kinder > 0 && h.u6 === h.kinder);
  const pAlter = altersAngabe ? 0 : h.mitte * (RB[4] - RB[5]);
  const pUnt = h.kids > 1 ? kinderEinkommen(hR) - kinderEinkommen(hR, 0, true) : 0;
  const p2b = h.azubi === 'evtl' && h.p[0].art === 'lohn' ? elternEinkommenSGB2(h, false) - elternEinkommenSGB2(h, true) : 0;
  // Offen: Elterngeld-Freibetrag (Basis oder Plus unbekannt), voller Mehrbedarf im Wechselmodell
  const egOffen = elternEinkommenSGB2(h) - elternEinkommenSGB2(h, undefined, true);
  let level = luecke >= 50 ? (luecke - offen >= 50 ? 'ja' : 'vielleicht') : luecke > -(100 + bm.moeglich + ms.moeglich + pAlter + pUnt + p2b + egOffen + h.mehrAEoffen) ? 'vielleicht' : 'nein';
  // Wechselmodell: Bedarf des Kindes nur anteilig -> höchstens „möglich“, Betrag nur als obere Grenze
  if (h.e.uvgWechsel && h.kinder > 0 && level === 'ja') level = 'vielleicht';
  // höchstens „möglich“: bei den Eltern (§ 9 Abs. 2, 5 SGB II), BAB geht vor (§ 12a), volljähriges Kind in Schule/Studium (§ 7 Abs. 5, 6),
  // EU früher gearbeitet (§ 2 Abs. 3 FreizügG/EU), Vermögen zwischen kleinster und größter Grenze (§ 12 Abs. 2)
  const eu = h.e.aufenthalt === 'eu' && h.e.euJahre !== 'ab5' && h.e.euArbeit === 'ja' && !(h.e.art1 === 'selbst' || (h.erwachsene === 2 && h.e.art2 === 'selbst')) && !(h.p[0].art === 'lohn' && h.brutto > 0);
  if (level === 'ja' && (eltern || (h.e.ausbildung === 'ich' && h.e.babBetrieb && h.e.babWohnt) || (h.e.ausbildung === 'kind' && h.jung > 0) || eu || h.vermoegen > vMin)) level = 'vielleicht';
  // § 7 Abs. 4 SGB II: Altersrente (auch vorgezogen) schließt aus; allein mit nur Rente, Alter unbekannt oder ab 60 -> höchstens „möglich“
  // Nur das erwachsene Kind voll erwerbsgemindert: eigene Grundsicherung, Haushalt trotzdem mitgerechnet -> höchstens „möglich“
  // Dann auch kein Bedarf und kein Betrag: beide enthielten das Kind, das Jobcenter rechnet meist ohne es (§ 5 Abs. 2 Satz 2, § 19 Abs. 1 Satz 2 SGB II)
  if (kindNurEMRef(h) && level !== 'nein') return { level: 'vielleicht' };
  // Angezeigter Betrag mit 25 € Sofortzuschlag je Kind (§ 72 SGB II, Fassung ab 1.7.2026, Abruf 24.11.2026); kein Bedarf, nur zusätzlich
  // Sofortzuschlag nicht, wenn die Kinder ihren Bedarf (Regelbedarf + Kopfteil Miete) schon mit eigenem Einkommen ohne Kindergeld decken
  const kindEigen = h.unterhalt + h.waisen + h.uvg + Math.max(0, h.kindEink - h.mini);
  const sofort = h.kids > 0 && kindEigen >= h.regelKinder + h.miete * h.kids / h.personen ? 0 : 25 * h.kids;
  return { level: level === 'ja' && h.erwachsene === 1 && nurRenteAb60(h) ? 'vielleicht' : level, bedarf, luecke: luecke + sofort };
}

// ---------- Wohngeld (WoGG) ----------
// Anlage 1 zu § 12 WoGG (Stand 1.1.2025): Höchstbeträge je Mietenstufe I..VII für 1..5 Personen und je weitere Person
const HB = [
  [361, 408, 456, 511, 562, 615, 677], [437, 493, 551, 619, 680, 745, 820], [521, 587, 657, 737, 809, 887, 975],
  [608, 686, 766, 858, 946, 1035, 1139], [694, 782, 875, 982, 1080, 1183, 1302], [82, 94, 106, 119, 129, 149, 163]
];
const KLIMA = [19.2, 24.8, 29.6, 34.4, 39.2, 4.8], HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4, 27.6];
// Anlage 2 (Werte a, b, c je Haushaltsgröße 1..12)
const ABC = [[0.04, 4.797e-4, 4.08e-5], [0.03, 3.571e-4, 3.04e-5], [0.02, 2.917e-4, 2.45e-5], [0.01, 2.163e-4, 1.76e-5], [0, 1.907e-4, 1.72e-5], [-0.01, 1.722e-4, 1.66e-5],
  [-0.02, 1.592e-4, 1.65e-5], [-0.03, 1.583e-4, 1.65e-5], [-0.04, 1.376e-4, 1.66e-5], [-0.06, 1.249e-4, 1.66e-5], [-0.09, 1.141e-4, 1.96e-5], [-0.12, 1.107e-4, 2.21e-5]];
const proPerson = (tab, n, spalte) => { const k = Math.min(n, 12); return k <= 5 ? (spalte == null ? tab[k - 1] : tab[k - 1][spalte]) : (spalte == null ? tab[4] + (k - 5) * tab[5] : tab[4][spalte] + (k - 5) * tab[5][spalte]); };
const hoechst = (st, n) => proPerson(HB, n, st - 1) + proPerson(KLIMA, n);
const heiz = (n) => proPerson(HEIZ, n);
// Anlage 3 WoGG (ab 1.1.2025): M und Y mindestens in dieser Höhe
const MMIN = [54, 67, 79, 92, 103, 103, 115, 128, 140, 152, 187, 298], YMIN = [396, 679, 906, 1132, 1358, 1585, 1811, 2037, 2264, 2490, 2717, 2943];
const wg = (n, M, Y) => { const i = Math.min(n, 12) - 1, [a, b, c] = ABC[i]; M = Math.max(M, MMIN[i]); Y = Math.max(Y, YMIN[i]); return 1.15 * (M - (a + b * M + c * Y) * Y); };
// Werbungskosten-Pauschbetrag (§ 9a EStG) beim Wohngeld: Arbeit (auch Werkstatt) 1.230 €, Rente 102 € im Jahr; nicht bei Selbstständigen
const werbung = (x) => Math.min(x.brutto, x.selbst ? 0 : x.art === 'lohn' || x.art === 'wfbm' ? 1230 / 12 : x.art === 'rente' ? 102 / 12 : 0);
// § 21 Nr. 1 WoGG: unter 10 € kein Wohngeld; gerundet auf volle Euro (Anlage 3 Nr. 3) -> Grenze bei 9,50 € ungerundet
const WG_MIN = 9.5;
// § 19 Abs. 3 WoGG: über 12 Personen je weiteres Mitglied 65 € mehr, höchstens bis zur Miete
const ueber12 = (n, w, M) => (n > 12 && w > 0 ? Math.min(w + 65 * (Math.floor(n) - 12), M) : w);
const wgRoh = (n, M, Y) => { const w = wg(n, M, Y); return w >= WG_MIN ? ueber12(n, w, M) : 0; };
function yGrenze(n, M) { let lo = 0, hi = 30000; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (wg(n, M, m) >= WG_MIN) lo = m; else hi = m; } return lo; }
// Bruttokaltmiete = Warmmiete minus angegebene Heizkosten (sonst Heizkostenkomponente als Näherung), höchstens Höchstbetrag; dazu die Heizkostenkomponente
const mieteWG = (st, n, warm, faktor, hk) => Math.min(faktor * Math.max(0, warm - (hk > 0 && hk < warm ? hk : heiz(n))), hoechst(st, n)) + heiz(n);
const ABZUG = { lohn: [0.1, 0.3], rente: [0.1, 0.2], kg: [0.1, 0.2], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.1], ohne: [0, 0] };
// Auf schon ausgezahlte Beträge (Beiträge sind abgezogen) nur noch ein kleiner Abzug (Konvention der App für ausgezahlte Beträge)
const ABZUG_AUSZ = { lohn: [0, 0.12], rente: [0, 0.06], kg: [0, 0.06], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.05], ohne: [0, 0] };
const abzugAus = (x, i) => (x.aus ? ABZUG_AUSZ : ABZUG)[x.art][i];

function wohngeld(h) {
  // Nur das erwachsene Kind bekommt Grundsicherung vom Sozialamt: nur das Kind ist ausgeschlossen (§ 7 Abs. 1 Satz 1 Nr. 5, Abs. 2 WoGG; Einkommen
  // der Eltern zählt bei seiner Grundsicherung nicht, § 43 Abs. 5 SGB XII) -> wie ohne Bezug, höchstens „möglich“
  if (h.bezug.sozialamt && kindNurEMRef(h)) { const r = wohngeld(haushalt({ ...h.e, bezug: { ...h.e.bezug, sozialamt: false } })); return { level: r.level === 'ja' ? 'vielleicht' : r.level }; }
  const b = h.bezug, e = h.e;
  if (b.grundsicherungsgeld || b.sozialamt) return { level: 'nein' };
  if (b.wohngeld) return { level: 'na' };
  if (h.vermoegen > 60000 + 30000 * (h.personen - 1)) return { level: 'nein' };
  const jung = h.jahre ? h.jahre < 45 : (h.gruppe === '' || h.gruppe === '<30' || h.gruppe === '30-39');
  if (e.ausbildung === 'ich' && h.erwachsene === 1 && h.kids === 0 && (!e.babBetrieb || e.babWohnt) && jung) return { level: 'nein' };
  if (h.miete <= 0) return { level: 'nein' };
  const st = [1, 2, 3, 4, 5, 6, 7].indexOf(Number(e.mietstufe)) >= 0 ? Number(e.mietstufe) : null;
  const n = Math.min(h.personen, 12);
  const hk = zahl(e.heizkosten);
  const yMaxLo = yGrenze(n, mieteWG(st || 1, n, h.miete, hk > 0 && hk < h.miete ? 1 : 0.9, hk)), yMaxHi = yGrenze(n, mieteWG(st || 7, n, h.miete, 1, hk));
  // § 17 WoGG: Freibeträge (Behinderung: GdB 100 oder GdB >= 50 mit Pflegegrad; Alleinerziehende 110 € im Monat)
  const gdb = e.gdb === 'H' ? 100 : Number(e.gdb) || (e.behinderung ? 100 : 0);
  const pg = ['1', '2', '3', '4', '5'].indexOf(String(e.pflegegrad)) >= 0;
  let frei = (gdb === 100 || (gdb >= 50 && pg) ? 150 : 0) + (h.erwachsene === 1 && h.kinder > 0 ? 110 : 0);
  frei += Math.min(4, Math.max(0, e.bhWeitere | 0)) * 150; // weitere schwerbehinderte Haushaltsmitglieder
  // § 10 Abs. 1, 3, 4 BEEG: vorsichtig der kleinere Freibetrag (ElterngeldPlus möglich), günstig der größere
  const egWG = (k) => h.p.reduce((s, x) => s + (x.art === 'eg' ? Math.min(elterngeldFrei(e, x.brutto)[k], x.brutto) : 0), 0);
  // § 17a WoGG: Grundrentenfreibetrag je Rente, nur auf die gesetzliche Rente (ohne enthaltene Betriebs-, Riester- oder private Rente)
  if (e.grundrente33) {
    let offenWG = zahl(e.zusatzRente);
    for (const x of h.p) {
      if (x.art !== 'rente') continue;
      const davon = Math.min(offenWG, x.brutto); offenWG -= davon;
      frei += Math.min(Math.max(0, x.brutto - davon), 100 + 0.3 * Math.max(0, x.brutto - davon - 100), 0.5 * RB[1]); // § 17a Abs. 1 Satz 2: nie mehr als die Rente
    }
  }
  // Lohn der Kinder je Kind: Arbeitnehmer-Pauschbetrag 1.230 €/Jahr (§ 14 Abs. 1 WoGG, § 9a EStG) und Freibetrag 1.200 €/Jahr (§ 17 Nr. 4
  // WoGG). Nur die Summe bekannt: vorsichtig ein verdienendes Kind, günstig verteilt auf alle Kinder ab 6 und jungen Erwachsenen.
  const kindAb = 1230 / 12 + 1200 / 12, kindN = Math.max(1, h.kinder - h.u6 + h.jung);
  const plus = h.unterhalt + h.waisen + h.uvg;
  // Über der Minijob-Grenze (Ausbildungsvergütung, Auszahlung < Brutto): vorsichtig ohne Pauschbetrag
  // günstig: der Freibetrag (bis zu den eigenen Einnahmen) darf Unterhalt/Waisenrente/Unterhaltsvorschuss der Kinder mindern
  const kindX = h.kindEink / kindN;
  const kindVorsichtig = Math.max(0, h.kindEink - (h.kindEink > h.mini ? 100 : kindAb)), kindGuenstig = Math.max(-plus, kindN * (Math.max(0, kindX - 1230 / 12) - Math.min(kindX, 100)));
  const freiPess = frei + egWG('wgLo'), freiOpt = frei + egWG('wgHi');
  const uzVorsichtig = h.uzFest ? Math.min(h.uz, h.uzDeckel) : 0, uzGuenstig = h.uzFest ? h.uz : Math.min(h.uz, h.uzDeckel);
  const yPess = Math.max(0, h.p.reduce((s, x) => s + (x.brutto - werbung(x)) * (1 - abzugAus(x, 0)), 0) + plus + h.uvgOffen + kindVorsichtig - freiPess - uzVorsichtig); // + möglicher UVG (Befund U1, § 14 Abs. 2 Nr. 21 WoGG)
  const yOpt = Math.max(0, h.p.reduce((s, x) => s + (x.brutto - werbung(x)) * (1 - abzugAus(x, 1)), 0) + plus + kindGuenstig - freiOpt - uzGuenstig);
  if (yOpt > yMaxHi) return { level: 'nein' };
  let level = yPess <= yMaxLo ? 'ja' : 'vielleicht';
  // Plausibilitätsprüfung Nr. 15.01 WoGVwV: Einnahmen plus vorsichtig geschätztes Wohngeld (Stufe I ohne Angabe) decken die ganze Miete
  // und 80 % der Regelbedarfe (ohne Mehrbedarfe)
  const wgVors = wgRoh(n, mieteWG(st || 1, n, h.miete, 1, hk), yPess);
  const mittel = h.netto + h.kinder * KG + h.unterhalt + h.waisen + h.uvg + h.kindEink - h.uz + wgVors;
  if (mittel < h.miete + 0.8 * h.regel) level = 'vielleicht';
  let betrag = null;
  if (st) { const M = mieteWG(st, n, h.miete, 1, hk); betrag = [Math.max(0, runde10(wgRoh(n, M, yPess))), Math.max(0, runde10(wgRoh(n, M, yOpt)))]; }
  return { level, yPess, yOpt, betrag };
}

// ---------- Kinderzuschlag (§ 6a BKGG) ----------
// § 6a Abs. 6 BKGG: Elterneinkommen über dem Bedarf mindert zu 45 %, soweit es Arbeitseinkommen ist; anderes Einkommen (Rente, ALG I,
// Krankengeld, Elterngeld) mindert voll. Vorrang: Die Überschreitung wird dem Arbeitseinkommen zugerechnet, solange das andere
// Einkommen allein den Bedarf nicht übersteigt.
function minderungElternKiZ(h, bedarf, egHoch) {
  const gesamt = elternEinkommenSGB2(h, undefined, egHoch);
  const s = h.p.reduce((a, x) => a + x.brutto, 0);
  let anders = 0;
  h.p.forEach((x) => {
    const n = s > 0 ? h.netto * x.brutto / s : h.netto / h.p.length;
    if (['rente', 'alg', 'kg', 'eg'].indexOf(x.art) >= 0) anders += n - 30 * (x.brutto > 0 ? 1 : 0) - (x.art === 'eg' ? elterngeldFrei(h.e, x.brutto)[egHoch ? 'hi' : 'lo'] : 0);
  });
  anders = Math.min(gesamt, Math.max(0, anders));
  if (anders <= bedarf) return 0.45 * Math.max(0, gesamt - bedarf);
  return (anders - bedarf) + 0.45 * (gesamt - anders);
}
// Nur Rente, Alter unbekannt oder ab 60: vielleicht eine Altersrente vor der Regelaltersgrenze (§ 7 Abs. 4 SGB II schließt dann SGB II aus;
// eine vorgezogene Altersrente gibt es frühestens mit 60 bis 63, § 36-38, § 236-237a SGB VI)
function nurRenteAb60(h) {
  const mit = h.p.filter((x) => x.brutto > 0);
  if (!mit.length || mit.some((x) => x.art !== 'rente')) return false;
  return h.jahre ? h.jahre >= 60 : (h.gruppe === '' || h.gruppe === '50+');
}
// Der Elternteil selbst voll erwerbsgemindert: weniger als 3 Stunden, Werkstattlohn, oder Werkstatt-Haken ohne Angabe „Kind mit Behinderung“
// Nur ein erwachsenes Kind mit Behinderung ist voll erwerbsgemindert (Werkstatt-Haken bei „Kind ab 18“), nicht der Elternteil
function kindNurEMRef(h) {
  return !!h.em && !emElternteil(h.e) && (h.e.bhPerson === 'erwVor25' || h.e.bhPerson === 'erwNach25');
}
function emWerRef(e) {
  const wfbmEink = e.art1 === 'wfbm' || (e.adults === 2 && e.art2 === 'wfbm') || (Array.isArray(e.einkommen) && e.einkommen.some((x) => x.art === 'wfbm'));
  return !e.erwerbsgemindert && e.emStd !== 'unter3' && !wfbmEink && !!e.wfbm && !e.wfbmSelbst && e.bhPerson === 'erwNach25';
}
function emElternteil(e) {
  const wfbmEink = e.art1 === 'wfbm' || (e.adults === 2 && e.art2 === 'wfbm') || (Array.isArray(e.einkommen) && e.einkommen.some((x) => x.art === 'wfbm'));
  return e.emStd === 'unter3' || !!e.erwerbsgemindert || wfbmEink || (!!e.wfbm && (!!e.wfbmSelbst || ['minder', 'erwVor25'].indexOf(e.bhPerson) < 0));
}
function kinderzuschlag(h, ohneKindPruefung) {
  const b = h.bezug;
  if (h.kids === 0) return { level: 'nein' };
  // Nur das erwachsene Kind bekommt Grundsicherung vom Sozialamt: kein Ausschluss der Eltern, höchstens „möglich“
  // Einziges Kind: für das Kind mit eigener Grundsicherung gibt es keinen Kinderzuschlag (DA-KiZ 20.02.2026 B.2 Abs. 2 Satz 8) -> „nein“
  // Auch ohne laufenden Bezug: für ein Kind ab 18 in der Werkstatt (Kind ab 18 bis 24, nur das Kind voll erwerbsgemindert) gibt es keinen
  // Kinderzuschlag, es bleibt in der Bedarfsgemeinschaft (DA-KiZ 20.02.2026 B.2 Abs. 2 Satz 5 bis 8): einziges Kind „nein“, sonst höchstens „möglich“
  const ohneKiz = !ohneKindPruefung && kindNurEMRef(h) && (b.sozialamt || (h.e.bhPerson === 'erwVor25' && h.jung > 0));
  // Unabhängige Prüfung 24.11.2026: nur wenn das einzige Kind das gezählte Kind von 18 bis 24 ist und kein Kinderzuschlag läuft
  if (ohneKiz && h.kids === 1 && h.jung === 1 && !b.kiz) return { level: 'nein' };
  if (ohneKiz) { const r = kinderzuschlag(b.sozialamt ? haushalt({ ...h.e, bezug: { ...h.e.bezug, sozialamt: false } }) : h, true); return { level: r.level === 'ja' ? 'vielleicht' : r.level }; }
  if (b.grundsicherungsgeld || b.sozialamt) return { level: 'nein' };
  if (b.kiz) return { level: 'na' };
  // § 6a Abs. 1 Nr. 3 BKGG mit § 7 SGB II (DA-KiZ 20.02.2026 D.2 Abs. 1 Satz 5; BSG B 7/14 KG 1/21 R): Im Haushalt muss jemand
  // erwerbsfähig sein und dem Grunde nach zum SGB II gehören (Elternteil oder Kind ab 15). Junge Erwachsene: ja.
  let hoechstensMoeglich = false;
  if (h.jung === 0) {
    const em = emElternteil(h.e);
    if (h.erwachsene === 1 && (h.rente || em)) {
      const alterBekannt = !!h.e.kidsAlter || h.u6 === h.kinder;
      if (h.k14 === 0 && alterBekannt) return { level: 'nein' }; // alle Kinder unter 14
      hoechstensMoeglich = true;
    } else if (h.erwachsene === 1 && (h.grenz || nurRenteAb60(h))) hoechstensMoeglich = true;
    else if (h.erwachsene === 2 && !Array.isArray(h.e.einkommen) && h.p[0].art === 'rente' && h.p[1].art === 'rente' && (h.rente || em)) hoechstensMoeglich = true;
  }
  const r0 = kizBetrag(h);
  // Wechselmodell: nur wer das Kindergeld bekommt, Kind ggf. anteilig (DA-KiZ C.3.1.1 Abs. 2) -> höchstens „möglich“, Betrag nur „bis“
  const r = h.e.uvgWechsel && (r0.level === 'ja' || r0.level === 'vielleicht') ? { level: 'vielleicht', kiz: null } : r0;
  return hoechstensMoeglich && r.level === 'ja' ? { ...r, level: 'vielleicht' } : r;
}
function kizBetrag(h) {
  const vermGrenze = h.personen <= 2 ? 55000 : 70000 + 15000 * (h.personen - 3);
  // Mindesteinkommen: bei Selbstständigen die Betriebseinnahmen vor Ausgaben (DA-KiZ C.1 Abs. 2): mit Gewinn darunter offen
  const selbst = h.e.art1 === 'selbst' || (h.erwachsene === 2 && h.e.art2 === 'selbst');
  if (h.brutto < (h.erwachsene === 2 ? 900 : 600)) return { level: selbst && !(h.vermoegen > vermGrenze) ? 'vielleicht' : 'nein' };
  // § 6a Abs. 3 Satz 5-7 BKGG: Vermögen über der Grenze mindert nur den ersten Monat; kleiner als der Monatsbetrag -> höchstens „möglich“
  const r = kizBetrag0(h), ueber = h.vermoegen - vermGrenze;
  if (!(ueber > 0)) return r;
  if (!(r.kiz > ueber)) return { level: 'nein' };
  return r.level === 'ja' ? { ...r, level: 'vielleicht' } : r;
}
function kizBetrag0(h) {
  const max = 297 * h.kids;
  // Wohnanteil der Eltern: Tabelle DA-KiZ C.3.1.2 (Stand 20.02.2026); alleinerziehend nur mit Altersrente: Kopfteil (DA-KiZ D.2 Abs. 1 Satz 9-11)
  const mitEink = h.p.filter((x) => x.brutto > 0);
  const rentnerAllein = h.erwachsene === 1 && h.rente && mitEink.length > 0 && mitEink.every((x) => x.art === 'rente');
  const anteilEltern = rentnerAllein ? 1 / h.personen : (h.erwachsene === 1 ? [1, 77, 63, 53, 46, 40, 36, 33, 30, 27, 25] : [1, 83, 71, 62, 55, 50, 45, 41, 38, 35, 33])[Math.min(h.kids, 10)] / (h.kids ? 100 : 1);
  const ms = mehrSonst(h), bm = behMehrSGB2(h);
  const bedarfEltern = h.regelEltern + h.mehrAE + ms.eltern + (h.e.bhPerson === 'erwNach25' ? bm.sicher : 0) + h.miete * anteilEltern;
  // Ein einziges Kind ab 14 kann verdienen: zusätzlich 30 % von 520 bis 1.000 €, 10 % bis 1.200 € frei (DA-KiZ C.2.2.1 Abs. 3 Satz 9-11)
  const einVerdiener = h.k14 + h.jung === 1 && h.kindEink > h.mini;
  const lohnFrei = einVerdiener ? 0.3 * (Math.min(h.kindEink, 1000) - Math.min(h.kindEink, 520)) + 0.1 * Math.max(0, Math.min(h.kindEink, 1200) - 1000) : 0;
  const kindAnr = h.unterhalt + h.waisen + h.uvg + Math.max(0, h.kindEink - h.mini - lohnFrei);
  const kizMit = (mehrAE, anr, egHoch) => Math.max(0, max - minderungElternKiZ(h, bedarfEltern - h.mehrAE + mehrAE, egHoch) - Math.min(max, 0.45 * anr));
  const kiz = kizMit(h.mehrAE, kindAnr);
  if (kiz <= 0) {
    // Alter nur grob bekannt: 36 % Mehrbedarf möglich, wenn ein Kind 6-13 ist (vielleicht 6) oder zwei Kinder da sind (beide vielleicht unter 16)
    const aeAlter = h.erwachsene === 1 && h.kinder > 0 && h.u6 === 0 && 0.12 * h.kinder < 0.36 && (h.mitte >= 1 || h.kinder >= 2) ? 0.36 * RB[1] : h.mehrAE;
    // Wechselmodell: der volle Mehrbedarf ist möglich
    const aeHoch = Math.max(aeAlter, h.mehrAE + h.mehrAEoffen);
    if (kizMit(aeHoch, kindAnr) > 0) return { level: 'vielleicht' };
    // Elterngeld: höherer Freibetrag möglich (Basiselterngeld statt ElterngeldPlus)
    if (kizMit(aeHoch, kindAnr, true) > 0) return { level: 'vielleicht' };
    // DA-KiZ 20.02.2026 C.2.2.1 Abs. 3 Satz 3: 30 € Versicherungspauschale vom Einkommen des Kindes, falls versichert -> knapp „möglich“
    // (§ 6 Abs. 1 Nr. 2 Grundsicherungsgeld-Verordnung; nur Unterhalt, Unterhaltsvorschuss, Waisenrente, nicht Lohn der Kinder)
    const zahl = h.unterhalt + h.waisen + h.uvg, lohn = Math.max(0, h.kindEink - h.mini), zahlKnapp = Math.max(0, zahl - 30 * h.kids);
    if (zahl > 0 && kizMit(aeHoch, zahlKnapp + lohn) > 0) return { level: 'vielleicht' };
    // Lohn der Kinder: je Kind ab 14 Jahren 603 € und bis zu 164 € Freibetrag (§ 11b Abs. 2b, Abs. 3 Satz 2 Nr. 2 und 3, Satz 4 SGB II:
    // 30 % von 480 € + 10 % von 200 €; DA-KiZ C.2.2.1 Abs. 3 Satz 9-11) -> „möglich“
    if (lohn > 0 && kizMit(aeHoch, zahlKnapp + Math.max(0, h.kindEink - Math.max(1, h.k14 + h.jung) * (h.mini + 164))) > 0) return { level: 'vielleicht' };
    return { level: 'nein' };
  }
  // § 6a Abs. 1 Nr. 3 BKGG: mit dem Kinderzuschlag nicht mehr hilfebedürftig (bereinigtes Einkommen, Kindergeld, Kinderzuschlag; ein mögliches Wohngeld als fester Puffer von 300 € –
  // die App schätzt es genauer, die Einstufung bleibt dabei „möglich“, nur der Hinweis wechselt)
  const mitKiz = elternEinkommenSGB2(h) + (h.kinder + h.jung) * KG + h.unterhalt + h.waisen + h.uvg + h.kindEink + kiz, bedarfAlle = h.regel + h.miete + h.mehrAE + ms.sicher + bm.sicher;
  if (mitKiz + 300 < bedarfAlle) return { level: 'vielleicht', kiz };
  if (mitKiz < bedarfAlle) return { level: 'vielleicht', kiz, mitWg: true }; // nur zusammen mit Wohngeld
  // Befund K1: möglicher UVG mindert zu 45 % (§ 6a Abs. 3 BKGG) -> „wahrscheinlich“ nur, wenn es auch damit reicht
  const kizU = h.uvgOffen > 0 ? kizMit(h.mehrAE, kindAnr + h.uvgOffen) : kiz;
  return { level: kiz >= 60 && kizU >= 60 ? 'ja' : 'vielleicht', kiz };
}

// ---------- Grundsicherung im Alter und bei Erwerbsminderung (SGB XII, 4. Kapitel) ----------
// Einkommen § 82: Werkstattlohn ohne Arbeitsförderungsgeld (52 €), davon frei: RS1/8 + 50 % des Rests (Abs. 3 Satz 2);
// Lohn: 30 % frei, höchstens RS1/2 (Abs. 3 Satz 1); Elterngeld über 300 €: 300 € frei; Renten, ALG, Krankengeld voll.
function einkommenSGB12(e, h) {
  let posten;
  if (Array.isArray(e.einkommen)) posten = e.einkommen.map((x) => ({ art: x.art, n: leer(x.n) ? zahl(x.b) : zahl(x.n), b: zahl(x.b) }));
  else {
    const summe = h.p.reduce((s, x) => s + x.brutto, 0);
    posten = h.p.map((x) => ({ art: x.art, n: summe > 0 ? h.netto * x.brutto / summe : h.netto / h.p.length, b: x.brutto }));
  }
  const rs1 = RB[1];
  let summe = 0;
  // Betriebs-, Riester- oder private Rente (in der Rente enthalten): § 82 Abs. 4 SGB XII, 100 € + 30 % des Rests, höchstens RS1/2
  let offen = zahl(e.zusatzRente), offenB = zahl(e.zusatzRente);
  const staffel = (x) => (x <= 0 ? 0 : Math.min(x, 100 + 0.3 * Math.max(0, x - 100), 0.5 * rs1));
  for (const x of posten) {
    if (x.art === 'wfbm') { const lohn = Math.max(0, x.n - 52); const frei = Math.min(lohn, rs1 / 8 + 0.5 * Math.max(0, lohn - rs1 / 8)); summe += lohn - frei; }
    else if (x.art === 'lohn') summe += x.n - Math.min(0.3 * x.n, 0.5 * rs1);
    else if (x.art === 'eg') summe += Math.max(0, x.n - elterngeldFrei(e, x.b != null ? x.b : x.n).lo); // § 10 Abs. 5 BEEG, vorsichtig
    else if (x.art === 'rente') {
      const zus = Math.min(offen, Math.max(0, x.n)); offen -= zus;
      const zusB = Math.min(offenB, Math.max(0, x.b || 0)); offenB -= zusB;
      // § 82a Abs. 1 SGB XII: Freibetrag aus der gesetzlichen Bruttorente (mindestens Netto), höchstens die Netto-Rente selbst
      const gesN = x.n - zus, gesB = Math.max(gesN, (x.b || 0) - zusB);
      summe += x.n - (e.grundrente33 ? Math.min(gesN, staffel(gesB)) : 0) - staffel(zus); // § 82a nur gesetzliche Rente, § 82 Abs. 4 Zusatzrente
    }
    else if (x.art !== 'ohne') summe += x.n;
  }
  return summe;
}
function grundsicherungAlter(e) {
  const h = haushalt(e);
  if (Array.isArray(e.einkommen)) { const s = e.einkommen.reduce((a, x) => a + zahl(x.b), 0); h.brutto = s; h.netto = e.einkommen.reduce((a, x) => a + (leer(x.n) ? zahl(x.b) : zahl(x.n)), 0); h.p = [{ art: e.einkommen.length ? e.einkommen[0].art : 'ohne', brutto: s }]; }
  // § 41 Abs. 3 SGB XII: dauerhaft voll erwerbsgemindert zählt erst ab 18 Jahren – ein Kind unter 18 in der Werkstatt reicht nicht
  const em = h.em && (emElternteil(e) || e.bhPerson !== 'minder');
  if (!h.rente && !em && !h.grenz) return { level: 'nein' };
  if (euAus(h)) return { level: 'nein' };
  if (h.bezug.sozialamt) return { level: 'na' };
  // Nur das erwachsene Kind voll erwerbsgemindert (Angaben der Eltern): Leistung des Kindes allein, Einkommen und Vermögen der Eltern zählen
  // nicht (§ 43 Abs. 1, 5, § 94 Abs. 1a SGB XII) -> weder Betrag noch „nein“, sondern „möglich“
  if (kindNurEMRef(h) && !h.rente && !h.grenz && e.wohnform !== 'eltern' && e.wohnform !== 'heim') return { level: 'vielleicht' };
  if (h.bezug.grundsicherungsgeld) return { level: 'nein' };
  const wf = e.wohnform === 'eltern' || e.wohnform === 'heim' ? e.wohnform : '';
  // Angemessenes Auto ist im SGB XII geschützt (§ 90 Abs. 2 Nr. 10 SGB XII); hoher Wert nur „möglich“ (kappe)
  const auto = 0;
  if (h.vermoegen + auto > (wf ? 10000 : 10000 * h.erwachsene + 500 * h.kids)) return { level: 'nein' };
  const regelPerson = wf === 'heim' || (h.erwachsene === 2 && !wf) ? RB[2] : RB[1];
  const g = e.mzG ? 0.17 * regelPerson : 0;
  const rpB = regelSatzBehindert(h), teil = !!e.teilhabe && !e.wfbm;
  const tSicher = teil && (e.bhPerson === 'erwVor25' || e.bhPerson === 'erwNach25') ? 0.35 * (e.bhPerson === 'erwNach25' && wf ? regelPerson : rpB) : 0;
  const tMoeglich = teil && e.bhPerson === 'minder' && !wf ? 0.35 * rpB : 0;
  const mehrB = e.bhPerson === 'erwNach25' || wf ? Math.max(g, tSicher) : g + tSicher;
  const mieteDa = !leer(e.miete) && zahl(e.miete) > 0;
  let bedarf, unsicher = 0;
  const msG = mehrSonst(h, wf ? regelPerson : 0);
  if (wf === 'eltern') { bedarf = RB[1] + (mieteDa ? zahl(e.miete) : 0) + mehrB; unsicher = mieteDa ? 0 : 300; }
  else if (wf === 'heim') { bedarf = RB[2] + mehrB; unsicher = 700; }
  else bedarf = h.regel + h.miete + h.mehrAE + mehrB;
  if (e.wfbmEssen) unsicher += 90;
  unsicher += tMoeglich + msG.moeglich;
  bedarf += msG.sicher;
  const eink = einkommenSGB12(e, h) + (wf ? 0 : h.kids * KG + kinderEinkommen(h));
  const luecke = bedarf - eink;
  const altersAngabe = !!e.kidsAlter || (h.kinder > 0 && h.u6 === h.kinder);
  let level = luecke >= 50 ? 'ja' : luecke > -(100 + unsicher + (wf || altersAngabe ? 0 : h.mitte * (RB[4] - RB[5]))) ? 'vielleicht' : 'nein';
  if (h.grenz && level === 'ja') level = 'vielleicht';
  // Gemischtes Paar: zweite Person mit Lohn oder Arbeitslosengeld, Kinder ab 14 oder volljährig -> Jobcenter für sie, höchstens „möglich“ ohne Betrag
  if (!wf && level !== 'nein' && h.erwachsene === 2 && ((h.p[1].art === 'lohn' && h.p[1].brutto > 0) || h.p[1].art === 'alg' || h.jung > 0 || h.k14 > 0)) return { level: 'vielleicht' };
  // Konvention der App: Fehlt eine Angabe (Einkommen, Vermögen, Miete in der eigenen Wohnung), gibt es kein „wahrscheinlich“
  const fehlt = (!Array.isArray(e.einkommen) && leer(e.brutto) && leer(e.netto)) || leer(e.vermoegen) || (!wf && leer(e.miete));
  if (fehlt && level === 'ja') return { level: 'vielleicht' };
  if (fehlt && level === 'vielleicht') return { level: 'vielleicht' };
  return { level, bedarf, luecke };
}

// ---------- Unterhaltsvorschuss (UVG) ----------
// Einstufung Grundsicherungsgeld wie in der App-Karte: mit künftiger vorrangiger Leistung und Grenze der angemessenen Miete
function grundsicherungsgeldStufe(e) {
  const h = haushalt(e), e2 = kuenftig(e);
  let lv = grundsicherungsgeld(h).level;
  if (e2) lv = zusammen(lv, grundsicherungsgeld(haushalt(e2)).level);
  const g = kduGrenze(e);
  if (g && (Number(e.miete) || 0) > g) lv = zusammen(lv, grundsicherungsgeld(haushalt({ ...e, miete: g })).level);
  return kappe(e, 'ggeld', lv);
}
function unterhaltsvorschuss(e, ggStufe) {
  const r = uvgOhneAufenthalt(e, ggStufe);
  // § 1 Abs. 2a: Kind ODER Elternteil muss die Voraussetzung erfüllen -> bei Asyl/Duldung höchstens offen
  return e.aufenthalt === 'asyl' && r.level === 'ja' ? { level: 'vielleicht' } : r;
}
function uvgOhneAufenthalt(e, ggStufe) {
  const h = haushalt(e);
  const NEIN = { level: 'nein' }, OFFEN = { level: 'vielleicht' };
  if (h.kinder === 0) return NEIN;
  // Waisenrente ohne Haken „Unterhalt fehlt/gestorben“: wie mit Haken, aber höchstens offen
  if (!e.unterhaltFehlt) {
    if (!(h.waisen > 0)) return NEIN;
    const r = uvgOhneAufenthalt(Object.assign({}, e, { unterhaltFehlt: true }), ggStufe);
    return r.level === 'nein' ? r : OFFEN;
  }
  // § 1 Abs. 1 Nr. 2 (neu verheiratet); § 1 Abs. 3 (anderer Elternteil im Haushalt) gilt nur für gemeinsame Kinder
  if (h.erwachsene === 2 && e.uvgPartner === 'ehe') return NEIN;
  if (h.erwachsene === 2 && e.uvgPartner === 'eltern') return h.kinder === 1 ? NEIN : OFFEN;
  if (e.uvgWechsel && h.kinder === 1) return NEIN; // BVerwG 5 C 9.22: 40 % beim anderen Elternteil
  // Anrechnung je Kind (§ 2 Abs. 3): Nur bei einem einzigen Kind lässt sich sagen, dass nichts übrig bleibt
  if (h.kinder === 1) {
    const satz = h.u6 ? UVG.u6 : h.k14 || e.kinder12 ? UVG.u18 : UVG.u12; // höchstmöglicher Satz dieses Kindes
    if (h.unterhalt + h.waisen + h.azubiAnr >= satz) return NEIN;
  }
  if (h.unterhalt + h.waisen > 0) return OFFEN;
  if (h.erwachsene === 2 && e.uvgPartner !== 'neu') return OFFEN;
  if (e.uvgWechsel) return OFFEN;
  // § 1 Abs. 1a: Nr. 2 eigenes Einkommen mindestens 600 €; sonst Nr. 1 nur sicher, wenn das Grundsicherungsgeld allein
  // an Einkommen oder Vermögen scheitert (kein Ausschluss wegen Rente, Erwerbsminderung, Studium, EU-Recht, Sozialamt)
  if ((e.kinder12 || h.k14 > 0) && h.brutto - h.brutto2 < 600) {
    const ausgeschlossen = euAus(h) || h.rente || h.em || h.bezug.sozialamt || (e.ausbildung === 'ich' && !e.babBetrieb);
    if (ausgeschlossen || (ggStufe || grundsicherungsgeldStufe(e)) !== 'nein') return OFFEN;
  }
  if (h.azubiAnr > 0 || (h.kinder === 1 && h.k14 > 0 && h.kindEink > UVG_WK)) return OFFEN;
  return { level: 'ja' };
}

// ---------- BAföG (nur Einstufung; Kind: Freibeträge der Eltern § 25 BAföG, vereinfacht wie in der App) ----------
function bafoeg(e) {
  const r = bafoeg0(e);
  // § 8 Abs. 1 Nr. 2 bis 4 BAföG: EU-Bürger ohne Arbeit, unter 5 Jahren höchstens „möglich“
  return euAus(haushalt(e)) && r.level === 'ja' ? { ...r, level: 'vielleicht' } : r;
}
// Arbeitnehmeranteil Sozialversicherung 2026 (eigene Rechnung für B1): KV 7,3 % + halber Zusatzbeitrag 2,9 %, PV 1,8 % (Sachsen 2,3 %;
// kinderlos + 0,6; ab dem 2. Kind − 0,25 je Kind, höchstens 4), RV 9,3 %, AV 1,3 %; Minijob 0; Übergangsbereich bis 2.000 € mit
// reduzierter Bemessung (§ 20 Abs. 2a SGB IV); Beitragsbemessungsgrenzen 2026 RV 8.450 €, KV 5.812,50 €. Annahme wie die App:
// Kinder im Haushalt = Kinder der Person.
function svAN(b, h, e) {
  const mini = minijobAm(e.heute ? Number(e.heute) : undefined);
  if (b <= mini) return 0;
  const kinder = h.kids, pv = (e.bundesland === 'SN' ? 0.023 : 0.018) + (kinder === 0 ? 0.006 : -0.0025 * Math.min(4, Math.max(0, kinder - 1)));
  const be = b <= 2000 ? 2000 / (2000 - mini) * (b - mini) : b;
  return Math.round((Math.min(be, 8450) * 0.106 + Math.min(be, 5812.5) * (0.073 + 0.0145 + pv)) * 100) / 100;
}
// Befund B1 (behoben 21.11.2026): Einkommen der Eltern nach § 21 BAföG (Abruf gesetze-im-internet.de/baf_g/__21.html 21.11.2026) statt Netto.
// Lohn mit Brutto: (Brutto − 102,50 €) − 22,3 % davon (höchstens 17.200 € / 12) − Steuer (Brutto − Netto − echte Beiträge).
// ja: sonst Netto; nein: Lohn wie oben, Unterhalt für sich selbst ab, Elterngeld bis 300 € ab.
function einkBaf21(h, e) {
  const s = h.p.reduce((a, x) => a + x.brutto, 0);
  let ja = 0, nein = 0, basisL = 0, steuerL = 0, bruttoL = 0, zahlL = 0;
  h.p.forEach((x, i) => {
    const n = s > 0 ? h.netto * x.brutto / s : (i === 0 ? h.netto : 0);
    const unt = (i === 0 ? e.art1 : e.art2) === 'unt';
    if (x.art === 'ohne') return;
    if (x.art === 'lohn' && !x.selbst && !unt && x.brutto > 0) {
      const ein = Math.max(0, x.brutto - 1230 / 12), basis = ein - Math.min(0.223 * ein, 17200 / 12);
      const steuer = x.aus ? 0 : Math.max(0, x.brutto - n - svAN(x.brutto, h, e));
      nein += Math.max(0, basis - steuer);
      if (x.aus) ja += n; else { basisL += basis; steuerL += steuer; bruttoL += x.brutto; zahlL++; }
      return;
    }
    ja += n; nein += n - (unt ? x.brutto : x.art === 'eg' ? Math.min(300, x.brutto) : 0);
  });
  // Prüfung 21.11.2026: Für „ja“ zählt als Steuer höchstens die Lohnsteuer laut Steuerbescheid (§ 21 Abs. 1 Satz 3 Nr. 3 BAföG): verheiratete
  // Eltern (nur für sie gilt der Freibetrag 2.540 €, § 25 Abs. 1 Nr. 1) mit Splittingtarif auf den gemeinsamen Lohn (Steuerklasse III, zweiter
  // Arbeitnehmer-Pauschbetrag vorab abgezogen), allein Steuerklasse II mit Kind, sonst I. Die Lohnsteuer selbst kommt aus der Lohnrechnung
  // der App (Programmablaufplan, eigener Test test-lohn); Annahmen zur Pflegeversicherung wie dort.
  if (zahlL) {
    const RJ = require('../src/rules.js'), o = RJ.lohnAnnahmen(RJ.derive(e), 1);
    const amt = h.erwachsene === 2 ? RJ.nettoLohn(Math.max(0, bruttoL - (zahlL - 1) * 1230 / 12), { ...o, stkl: 3 }).lst : RJ.nettoLohn(bruttoL, o).lst;
    ja += Math.max(0, basisL - Math.min(steuerL, amt));
  }
  return { ja, nein };
}
function bafoeg0(e) {
  const h = haushalt(e);
  const a = e.ausbildung;
  if (a !== 'kind' && a !== 'kindBetrieb' && a !== 'ich') return { level: 'nein' };
  if (a === 'kindBetrieb') return { level: 'nein' };
  if (a === 'ich' && e.babBetrieb) return { level: 'nein' }; // § 2 Abs. 1 BAföG: betriebliche Ausbildung -> BAB
  if (a === 'kind') {
    if (h.kids - babyKinder(e) === 0) return { level: 'nein' }; // das Baby ist kein Kind in Ausbildung
    const frei = (h.erwachsene === 2 ? 2540 : 1690) + Math.max(0, h.kids - 1) * 770;
    // § 25 Abs. 4 BAföG: vom Einkommen über dem Freibetrag 50 % frei, je weiteres Kind mit Freibetrag 5 % mehr; „nein“ erst, wenn der Rest
    // den höchsten Bedarf (475 + 380 + 185 + 48 = 1.088 €, §§ 13, 13a Abs. 2) übersteigt
    const anteil = 0.5 - 0.05 * Math.max(0, h.kids - 1);
    // § 51 Abs. 3, 4 BAföG: unter 10 € (gerundet, also ungerundet unter 9,50 €) kein BAföG -> Grenze 1.088 − 9,50 €
    // § 11 Abs. 4 BAföG: Sind j Geschwister ebenfalls in förderfähiger Ausbildung, entfällt für sie der Freibetrag 770 € (und die 5 %),
    // das Einkommen wird auf 1 + j Auszubildende geteilt. „nein“ nur, wenn es für jedes j = 0 … Geschwister nicht reicht.
    // Elterngeld: bis 300 € frei (§ 10 Abs. 1 BEEG); Unterhalt für sich selbst nur versteuert (zählt hier nicht).
    const e21 = einkBaf21(h, e), eink = e21.nein;
    let reicht = false;
    for (let j = 0; j <= Math.max(0, h.kids - 1); j++) {
      const mit = Math.max(0, h.kids - 1) - j, fj = (h.erwachsene === 2 ? 2540 : 1690) + mit * 770, qj = 0.5 - 0.05 * mit;
      if (qj <= 0 || Math.max(0, eink - fj) * qj / (1 + j) <= 1088 - 9.5) reicht = true;
    }
    return { level: e21.ja <= frei ? 'ja' : anteil <= 0 || (eink - frei) * anteil <= 1088 - 9.5 || reicht ? 'vielleicht' : 'nein', frei };
  }
  if (h.gruppe === '50+') return { level: 'nein' };
  if (h.gruppe === '40-49' && !(h.jahre && h.jahre < 45)) return { level: 'vielleicht' };
  // §§ 29, 30 BAföG: nur der Betrag über dem Freibetrag, verteilt auf 12 Monate, mindert den Bedarf (höchstens 1.088 €)
  // § 29 Abs. 1 Nr. 2, 3: 2.300 € mehr je Partner und je Kind; § 14b: 160 € Kinderbetreuungszuschlag je Kind; § 51: unter 9,50 € ungerundet nichts
  const grenzeV = (h.gruppe === '<30' ? 15000 : 45000) + 2300 * ((h.erwachsene === 2 ? 1 : 0) + h.kids);
  if ((h.vermoegen + zahl(h.e.autoWert) - grenzeV) / 12 > 1088 + 160 * h.kids - 9.5) return { level: 'nein' };
  return { level: 'vielleicht' };
}

// Lohnsteuer Steuerklasse III: Ausnahme von der Unabhängigkeit. Die Lohnsteuer kommt aus der Umsetzung des Programmablaufplans in
// src/rules.js (nettoLohn), die test/test-netto.js selbst gegen veröffentlichte Werte und eine Rechnung zu Fuß prüft.
const lohnIII = (lohn, e) => require('../src/rules.js').nettoLohn(lohn, { stkl: 3, heute: e.heute ? Number(e.heute) : undefined });
const lstIII = (lohn, e) => { const t = lohnIII(lohn, e); return t.lst + t.soli; };
// ---------- Arbeitslosengeld I (§§ 137, 147, 149 SGB III) ----------
function arbeitslosengeld(e) {
  const h = haushalt(e);
  const bekommt = h.p.some((x) => x.art === 'alg');
  if (bekommt) return { level: 'na' };
  if (e.arbeitSit === 'krank' && e.krankWochen === 'ende') return { level: 'vielleicht' };
  if (e.arbeitSit !== 'arbeitslos') return { level: 'nein' };
  // Paar: Das Geburtsjahr gilt der ältesten Person; die jüngere kann die Regelaltersgrenze noch nicht erreicht haben (§ 136 Abs. 2 SGB III)
  if (h.rente) return { level: h.erwachsene === 2 ? 'vielleicht' : 'nein' };
  // Selbstständige nur mit freiwilliger Arbeitslosenversicherung (§ 28a SGB III)
  if (e.art1 === 'selbst' || (h.erwachsene === 2 && e.art2 === 'selbst')) return { level: 'vielleicht' };
  if (!e.algZeit) return { level: 'vielleicht' };
  if (zahl(e.lohnVorher) > 0 && zahl(e.lohnVorher) <= minijobAm(e.heute ? Number(e.heute) : 0)) return { level: 'vielleicht', spanne: null };
  const satz = h.kids > 0 ? 67 : 60;
  const jahr = Number(e.gebJahr) | 0;
  const heute = e.heute ? Number(e.heute) : new Date().getFullYear() + new Date().getMonth() / 12;
  const alter = jahr >= 1900 && jahr <= 2010 ? heute - jahr - 0.5 : 0;
  const m = [12, 16, 20, 24, 30, 36, 48].indexOf(Number(e.algMonate)) >= 0 ? Number(e.algMonate) : 0;
  // § 147 Abs. 2: Versicherungsmonate -> Anspruchsdauer, ab bestimmten Altersgrenzen länger
  let dauer = null;
  // Paar: Alter gilt der ältesten Person; ab 30 Versicherungsmonaten hängt die Dauer vom Alter der arbeitslosen Person ab -> keine
  // konkrete Dauer. Unter 30 Monaten (6, 8, 10, 12 Monate) ist die Dauer vom Alter unabhängig und bleibt konkret.
  if (m && (h.erwachsene !== 2 || m < 30)) dauer = m >= 48 && alter >= 58 ? 24 : m >= 36 && alter >= 55 ? 18 : m >= 30 && alter >= 50 ? 15 : m >= 24 ? 12 : m >= 20 ? 10 : m >= 16 ? 8 : 6;
  const lohn = Math.min(zahl(e.lohnVorher), 8450);
  // Netto bei kleinem Brutto höher; oben mindestens das Leistungsentgelt in Steuerklasse III (§ 153 SGB III: 20 % SV-Pauschale + Lohnsteuer)
  const oben = Math.max(lohn <= 2000 ? 0.8 : 0.72, lohn > 0 ? (0.8 * lohn - lstIII(lohn, e)) / lohn : 0);
  const spanne = lohn > 0 ? [runde10(lohn * 0.6 * satz / 100), runde10(lohn * oben * satz / 100)] : null;
  return { level: 'ja', satz, dauer, spanne };
}

// ---------- Krankengeld (§§ 47, 48 SGB V) ----------
function krankengeld(e) {
  const h = haushalt(e);
  if (h.p.some((x) => x.art === 'kg')) return { level: 'na' };
  if (e.arbeitSit !== 'krank') return { level: 'nein' };
  if (e.krankWochen === 'ende') return { level: 'nein' };
  // Selbstständige nur mit Wahlerklärung oder Wahltarif (§ 44 Abs. 2, § 53 Abs. 6 SGB V)
  if (e.art1 === 'selbst' || ((e.adults === 2) && e.art2 === 'selbst')) return { level: 'vielleicht', spanne: null };
  if (zahl(e.lohnVorher) > 0 && zahl(e.lohnVorher) <= minijobAm(e.heute ? Number(e.heute) : 0)) return { level: 'nein', spanne: null };
  const lohn = Math.min(zahl(e.lohnVorher), 5812.5);
  const kg = (q) => runde10(Math.min(0.7 * lohn, 0.9 * lohn * q) * 0.875);
  // § 50 Abs. 1 und 2 SGB V: Rente (erste Person) beendet oder kürzt das Krankengeld -> höchstens „möglich“
  const rente = h.p[0].art === 'rente' && h.p[0].brutto > 0;
  const nIII = lohn > 0 ? lohnIII(lohn, e).netto / lohn : 0; // echtes Netto Steuerklasse III als obere Grenze (§ 47 Abs. 1 SGB V)
  return { level: e.krankWochen === 'unter6' || rente ? 'vielleicht' : 'ja', spanne: lohn > 0 ? [kg(0.6), kg(Math.max(lohn <= 2000 ? 0.8 : 0.72, nIII))] : null };
}


// ---------- Elterngeld (§ 2 BEEG, wörtlich: 0,1 Prozentpunkte je volle 2 € Abstand) ----------
const EG_PAUSCH = 1230 / 12;         // Gesetz: 102,50 € (gesetze-im-internet.de/beeg/__2c.html, /estg/__9a.html, abgerufen 21.11.2026)
const EG_PAUSCH_RECHNER = 1000 / 12; // Elterngeld-Schnellrechner des Bundes (familienportal.de): 83,33 €, aus 1.033 abgefragten Fällen auf den Cent belegt
// Befund E2 (behoben 21.11.2026): Elterngeld-Netto nach §§ 2e, 2f BEEG (gesetze-im-internet.de/beeg/__2e.html, __2f.html, Abruf 21.11.2026)
// statt des eingegebenen Nettos: Netto + echte Beiträge − Pauschale 21 % (9 + 10 + 2 %) des Bruttos. Das Brutto kommt aus der geprüften
// Lohnsteuer der App (Rules.bruttoAusNetto mit Rules.lohnAnnahmen; Ausnahme von der Unabhängigkeit wie lohnIII), die Beiträge aus svAN
// (eigene Rechnung). Minijob und Übergangsbereich (Brutto bis 2.000 €): Netto unverändert. e: Eingaben wie Rules.evaluate.
function egHaushalt(e) {
  const k = Math.max(0, e.kids | 0) + Math.max(0, e.young | 0), m = Math.min(3, Math.max(1, Number(e.egKinder) | 0));
  const land = /^(BW|BY|BE|BB|HB|HH|HE|MV|NI|NW|RP|SL|SN|ST|SH|TH)$/.test(e.bundesland) ? e.bundesland : '';
  const heute = e.heute ? Number(e.heute) : new Date().getFullYear() + new Date().getMonth() / 12;
  return { adults: e.adults === 2 ? 2 : 1, land, heute, vor: Math.max(0, k - (e.baby === 'da' ? m : 0)), nach: k + (e.baby === 'bald' ? m : 0) };
}
function egNettoRef(netto, hh, nachGeburt) {
  if (!(netto > 0) || !hh) return netto;
  const RL = require('../src/rules.js'), kinder = nachGeburt ? hh.nach : hh.vor;
  const b = RL.bruttoAusNetto(netto, RL.lohnAnnahmen({ adults: hh.adults, kids: kinder, young: 0, land: hh.land, heute: hh.heute }, 1));
  if (b <= 2000) return netto;
  return Math.round((netto + svAN(b, { kids: kinder }, { bundesland: hh.land, heute: hh.heute }) - 0.21 * b) * 100) / 100;
}
function elterngeld(nettoVorher, geschwister, weitere) {
  // weitere: { nachher (Netto nach der Geburt bei Teilzeit), mehrlinge (Kinder der Geburt), haushalt (egHaushalt; ohne: Netto unverändert) }
  const w = weitere || {};
  if (w.haushalt) {
    const hh = w.haushalt;
    return elterngeld(egNettoRef(nettoVorher, hh, false), geschwister, Object.assign({}, w, { haushalt: null, nachher: w.nachher > 0 ? egNettoRef(w.nachher, hh, true) : w.nachher }));
  }
  // § 2c Abs. 1 BEEG: Netto minus 1/12 des Arbeitnehmer-Pauschbetrags. Nach dem Gesetz 1.230 € (§ 9a Satz 1 Nr. 1 Buchst. a EStG in der Fassung
  // vom 1. Januar des Jahres vor der Geburt, Satz 4), also 102,50 €. w.pausch nur für den Abgleich mit dem Schnellrechner des Bundes (egAbgleich).
  const pausch = w.pausch != null ? w.pausch : EG_PAUSCH;
  const n = Math.max(0, nettoVorher - pausch);
  let prozent = 67;
  if (n < 1000) prozent = Math.min(100, 67 + Math.floor((1000 - n) / 2) * 0.1);
  if (n > 1200) prozent = Math.max(65, 67 - Math.floor((n - 1200) / 2) * 0.1);
  const bonusSicher = geschwister >= 2; // § 2a BEEG Geschwisterbonus (zwei Kinder unter 6)
  const zuschlag = 300 * Math.max(0, (w.mehrlinge || 1) - 1); // § 2a Abs. 4: je 300 € ab dem zweiten Kind der Geburt
  // Basiselterngeld ohne Einkommen nach der Geburt (§ 2 Abs. 1, 4) mit Bonus und Mehrlingszuschlag
  const ohneArbeit = (() => { const g = Math.min(1800, Math.max(300, n * prozent / 100)); return g + (bonusSicher ? Math.max(75, g / 10) : 0) + zuschlag; })();
  if (!(w.nachher > 0)) return { basis: ohneArbeit, plus: ohneArbeit / 2, monate: 14 };
  // § 2 Abs. 3: Prozentsatz auf den Unterschied der Einkommen; vorher höchstens 2.770 €
  const unterschied = Math.max(0, Math.min(n, 2770) - Math.max(0, w.nachher - pausch));
  const roh = Math.min(1800, unterschied * prozent / 100);
  const g1 = Math.max(300, roh);
  const basis = g1 + (bonusSicher ? Math.max(75, g1 / 10) : 0) + zuschlag;
  // § 4a Abs. 2: halbe Mindestbeträge und halber Mehrlingszuschlag; insgesamt höchstens die Hälfte des Basiselterngelds ohne Arbeit
  const g2 = Math.max(150, roh);
  const plus = Math.min(ohneArbeit / 2, g2 + (bonusSicher ? Math.max(37.5, g2 / 10) : 0) + zuschlag / 2);
  return { basis, plus, monate: 14 };
}
// Abgleich mit dem Elterngeld-Schnellrechner des Bundes. SoLo rechnet nach dem Gesetz mit 102,50 € Abzug, der Schnellrechner mit 83,33 €
// (Entscheidung David, 21.11.2026). Der Unterschied wird nicht geduldet, sondern erklärt:
//  1. Das amtliche Ergebnis muss auf den Cent der Formel mit 83,33 € entsprechen (sonst rechnet der Schnellrechner anders als angenommen).
//  2. SoLo (volle Euro) muss der gleichen Formel mit 102,50 € entsprechen, also amtlich + erwartete Differenz.
//  3. Die erwartete Differenz wird, wo der Prozentsatz auf beiden Seiten gleich ist, zusätzlich geschlossen nachgerechnet:
//     −Satz × 19,17 € (230 € / 12; mit Geschwisterbonus über dem Mindestbonus × 1,1), 0 € bei Mindest- oder Höchstbetrag auf beiden Seiten.
//     Bei Teilzeit hebt sich der Abzug im Unterschied der Einkommen auf (0 €), außer am Deckel 2.770 € oder wenn das Netto danach unter dem Abzug liegt.
//     Im gleitenden Bereich (Satz ändert sich je 2 €) gibt es keine einfache Formel; dort gilt nur 1. und 2.
// f: { vorher, nachher, geschwister, kinder } wie in den gespeicherten Fällen. Rückgabe: { fehler (Text oder null), diff, gruppe }.
// Seit 21.11.2026 (Befund E2) rechnet SoLo zusätzlich das Elterngeld-Netto mit den Pauschalen nach § 2f BEEG (e = Eingaben für egHaushalt):
// SoLo muss dann gesetzSV entsprechen; Prüfungen 1. und 3. bleiben beim Netto (gesetz), weil der Schnellrechner das Netto direkt nimmt.
// sv = gesetzSV − gesetz: Mehrbetrag aus den Pauschalen (Gruppe bleibt; bei Übergangsbereich und Minijob 0 €).
function egAbgleich(f, solo, amtlich, e) {
  const g = f.geschwister ? 2 : 0, w = { nachher: f.nachher, mehrlinge: f.kinder }, D = EG_PAUSCH - EG_PAUSCH_RECHNER;
  const rechner = elterngeld(f.vorher, g, Object.assign({ pausch: EG_PAUSCH_RECHNER }, w)).basis, gesetz = elterngeld(f.vorher, g, w).basis;
  const gesetzSV = e ? elterngeld(f.vorher, g, Object.assign({ haushalt: egHaushalt(e) }, w)).basis : gesetz;
  const diff = Math.round((gesetz - rechner) * 100) / 100;
  const satz = (n) => (n < 1000 ? Math.min(100, 67 + Math.floor((1000 - n) / 2) * 0.1) : n > 1200 ? Math.max(65, 67 - Math.floor((n - 1200) / 2) * 0.1) : 67) / 100;
  const n0 = Math.max(0, f.vorher - EG_PAUSCH_RECHNER), n1 = Math.max(0, f.vorher - EG_PAUSCH), q = satz(n1);
  // Kern (ohne Bonus und Zuschlag) auf beiden Seiten, nur für die Einordnung in die Gruppen
  const kern = (n, p) => (f.nachher > 0 ? Math.max(0, Math.min(n, 2770) - Math.max(0, f.nachher - p)) : n) * satz(n);
  const k0 = kern(n0, EG_PAUSCH_RECHNER), k1 = kern(n1, EG_PAUSCH);
  const bonus = (k) => (g >= 2 && k >= 750 ? 1.1 : 1);
  let gruppe = 'gleitend', soll = null;
  if ((k0 <= 300 && k1 <= 300) || (k0 >= 1800 && k1 >= 1800)) { gruppe = 'grenze'; soll = 0; }
  else if (satz(n0) === q && k0 > 300 && k1 > 300 && k0 < 1800 && k1 < 1800 && bonus(k0) === bonus(k1)) {
    if (!(f.nachher > 0)) { gruppe = 'satz'; soll = -q * D * bonus(k1); }
    else if (n0 <= 2770 && f.nachher >= EG_PAUSCH) { gruppe = 'teilzeit'; soll = 0; }                   // Abzug hebt sich auf
    else if (n1 >= 2770 && f.nachher >= EG_PAUSCH) { gruppe = 'teilzeit'; soll = q * D * bonus(k1); } // vorher gedeckelt, nachher 19,17 € weniger
  }
  let fehler = null;
  if (Math.abs(rechner - amtlich) > 0.011) fehler = 'Schnellrechner ' + amtlich + ' € passt nicht zur Formel mit 83,33 € Abzug (' + rechner.toFixed(2) + ' €)';
  else if (Math.abs(solo - gesetzSV) > 0.5 + 1e-6) fehler = 'SoLo ' + solo + ' €, erwartet ' + gesetzSV.toFixed(2) + ' € = amtlich ' + amtlich + ' € ' + (diff < 0 ? '− ' : '+ ') + Math.abs(diff).toFixed(2) + ' € (Abzug 102,50 statt 83,33 €) + ' + (gesetzSV - gesetz).toFixed(2) + ' € (Sozialabgaben-Pauschale § 2f BEEG)';
  else if (soll != null && Math.abs(gesetz - rechner - soll) > 0.005) fehler = 'Differenz ' + diff + ' € statt ' + soll.toFixed(2) + ' € (' + gruppe + ', Satz ' + (q * 100).toFixed(1) + ' %)';
  return { fehler, diff, gruppe, gesetz, gesetzSV, sv: Math.round((gesetzSV - gesetz) * 100) / 100, rechner };
}
// ---------- Einkommensgrenze § 85 SGB XII (Hilfe zur Pflege, Blindenhilfe) und Schonvermögen ----------
function grenze85(e) {
  const personen = (e.adults === 2 ? 2 : 1) + kinderMitBaby(e) + Math.max(0, e.young | 0);
  // § 85 Abs. 1 SGB XII: Unterkunft mit Heizung (BSG 30.04.2020, B 8 SO 1/19 R), Familienzuschlag 70 % auf volle Euro aufgerundet
  return 2 * RB[1] + zahl(e.miete) + Math.ceil(0.7 * RB[1]) * (personen - 1);
}
function schon90(e) { return 10000 * (e.adults === 2 ? 2 : 1) + 500 * (kinderMitBaby(e) + Math.max(0, e.young | 0)); }
// ---------- Asylbewerber: Ausschlüsse (§ 7 Abs. 1 SGB II, § 23 Abs. 2 SGB XII, § 7 WoGG, § 6a BKGG mit § 62 EStG) ----------
// Asylverfahren oder Duldung: ausgeschlossen (§ 7 Abs. 1 Satz 2 Nr. 3 SGB II, § 23 Abs. 2 SGB XII, § 6a BKGG; WBS: § 27 Abs. 2 WoFG,
// Entscheidung David 20.11.2026: „unwahrscheinlich“)
const ASYL_NEIN = ['ggeld', 'gsa', 'kiz', 'wbs'];
// Höchstens „möglich“, sonst wie ohne Asyl: BAföG (§ 8 Abs. 2a,
// Abs. 3 BAföG), Arbeitslosengeld (§ 138 Abs. 5 Nr. 1 SGB III), Kindergeld bei Behinderung (§ 62 Abs. 2 EStG), Ausweis (§ 2 Abs. 2 SGB IX),
// Landesblindengeld (§ 9 Abs. 1 AsylbLG) – alle abgerufen 20.11.2026 auf gesetze-im-internet.de bzw. gesetze-bayern.de
// Wohngeld: ohne Einkommensart „Asylbewerberleistungen“ normal gerechnet (§ 3 Abs. 5 WoGG, Entscheidung David 20.11.2026), mit ihr
// ausgeschlossen (§ 7 Abs. 1 Satz 1 Nr. 8 WoGG) – eigene Prüfung im Raster-Test
const ASYL_MOEGLICH = ['bafoeg', 'alg1', 'kgBeh', 'ausweis', 'blindengeld'];

// ---------- Asylbewerberleistungen (§ 7 AsylbLG): Einkommen und Vermögen zuerst; frei 25 % vom Lohn (höchstens 50 % RS 1 je Erwachsenem),
// 200 € Vermögen je Person. Bedarf grob: Regelbedarfe (SGB II, obere Grenze) plus Miete.
function asylbewerber(e) {
  const h = haushalt(e);
  if (e.aufenthalt !== 'asyl' && e.aufenthalt !== 'ausreise') return { level: 'nein' };
  const bezug = e.art1 === 'asylblg' || (h.erwachsene === 2 && e.art2 === 'asylblg') || (Array.isArray(e.einkommen) && e.einkommen.some((x) => x && x.art === 'asylblg'));
  if (bezug) return { level: 'na' };
  const bedarf = h.regel + h.miete;
  let lohn = 0;
  if (Array.isArray(e.einkommen)) e.einkommen.forEach((x) => { if (x && (x.art === 'lohn' || x.art === 'selbst')) lohn += leer(x.n) ? zahl(x.b) : zahl(x.n); });
  else h.p.forEach((x) => { if (x.art === 'lohn' && h.brutto > 0) lohn += h.netto * x.brutto / h.brutto; });
  const netto = Array.isArray(e.einkommen) ? e.einkommen.reduce((a, x) => a + (x ? (leer(x.n) ? zahl(x.b) : zahl(x.n)) : 0), 0) : h.netto;
  const luecke = bedarf - Math.max(0, netto - Math.min(0.25 * lohn, 0.5 * RB[1] * h.erwachsene));
  const ueber = h.vermoegen - 200 * h.personen;
  if (ueber > bedarf || luecke < -100) return { level: 'nein' };
  if (ueber > 0 || netto > 0 || luecke < 50) return { level: 'vielleicht' };
  return { level: 'ja' };
}

// ---------- Künftige vorrangige Leistung der ersten Person (Arbeitslosengeld, Krankengeld, Elterngeld) ----------
// Sie zählt bei Grundsicherungsgeld, Wohngeld und Kinderzuschlag als Einkommen (§ 11 SGB II, § 14 WoGG; Elterngeld über 300 €).
// Zweiter Haushalt: Einkommen der ersten Person (Lohn oder keins) wird durch die Mitte der geschätzten Spanne ersetzt.
function kuenftig(e) {
  if (Array.isArray(e.einkommen) || e.aufenthalt === 'asyl') return null;
  const h = haushalt(e);
  if (h.p[0].art !== 'lohn' && h.p[0].art !== 'ohne') return null;
  let art = null, betrag = 0;
  const a = arbeitslosengeld(e), k = krankengeld(e);
  if (a.level === 'ja' && e.arbeitSit === 'arbeitslos' && a.spanne) { art = 'alg'; betrag = (a.spanne[0] + a.spanne[1]) / 2; }
  else if ((k.level === 'ja' || k.level === 'vielleicht') && (e.krankWochen === 'unter6' || e.krankWochen === 'laeuft') && k.spanne) { art = 'kg'; betrag = (k.spanne[0] + k.spanne[1]) / 2; }
  else if (e.baby === 'bald' && h.erwachsene === 1 && !leer(e.egVor) && !(zahl(e.egNach) > 0) && !(Number(e.egKinder) > 1)) { // nicht bei Teilzeit/Mehrlingen (§ 10 Abs. 4 BEEG)
    art = 'eg'; betrag = runde10(elterngeld(zahl(e.egVor), Math.min(Math.max(0, e.kidsU6 | 0), Math.max(0, e.kids | 0)), { haushalt: egHaushalt(e) }).basis); }
  if (!art || !(betrag > 0)) return null;
  const lohn1 = h.brutto - h.brutto2;
  const netto1 = h.erwachsene === 1 ? h.netto : h.brutto > 0 ? h.netto * lohn1 / h.brutto : 0;
  return Object.assign({}, e, { art1: art, nichtArbeit: false, brutto: betrag + h.brutto2, brutto2: h.brutto2, netto: Math.max(0, h.netto - netto1) + betrag, aus1: true, _art: art, _betrag: betrag });
}
// Einstufung aus jetzt und künftig: gleich bleibt, sonst „möglich“
const zusammen = (jetzt, dann) => (jetzt === 'na' ? 'na' : jetzt === dann ? jetzt : 'vielleicht');

// ---------- Angemessene Unterkunftskosten (§ 22 SGB II, § 35 SGB XII): Orientierung WoGG-Höchstbetrag + 10 % plus Heizkosten ----------
// Ohne bekannte Mietenstufe, bei Eigentum, bei den Eltern oder im Wohnheim keine Prüfung
function kduGrenze(e) {
  const st = [1, 2, 3, 4, 5, 6, 7].indexOf(Number(e.mietstufe)) >= 0 ? Number(e.mietstufe) : null;
  if (!st || e.wohnart === 'eigentum' || e.wohnform === 'eltern' || e.wohnform === 'heim') return null;
  // Baby ist da: zählt als Kind im Haushalt (wie in der App, Vollprüfung familie Fable 11)
  const n = Math.min((e.adults === 2 ? 2 : 1) + kinderMitBaby(e) + Math.max(0, e.young | 0), 12);
  return hoechst(st, n) * 1.1 + heiz(n);
}

// ---------- Wohnberechtigungsschein (neu 21.11.2026, Rechenplan docs/rechenplan/wbs.md) ----------
// Eigene Tabelle aus docs/WBS-GRENZEN.md (Jahreseinkommen in Euro: allein, zwei Personen, je weitere Person, je Kind, höchster Stufenfaktor).
// Bayern: Art. 4 Abs. 1 BayWoBindG (17.500 / 27.500 / 5.000 / 1.300 €) und Art. 11 Abs. 1 BayWoFG (28.300 / 43.200 / 10.700 / 3.200 €).
// Bund: § 9 Abs. 2 WoFG. SH: Zuschlag 3.000 € (1 Person) / 2.000 € (2 Personen), RP und SH auf volle 100 € aufgerundet.
const WBS_TAB = {
  BW: [60350, 60350, 9000, 0, 0], BE: [16800, 25200, 5740, 700, 220 / 140], BB: [18500, 26000, 5800, 2000, 0], HB: [13200, 19800, 4510, 550, 160 / 110],
  HH: [19200, 28800, 6560, 800, 240 / 160], HE: [20146, 30565, 6948, 924, 0], MV: [25800, 38700, 8800, 1500, 27000 / 25800], NI: [21250, 28750, 3750, 3750, 0],
  NW: [23540, 28350, 6530, 860, 1.4], RP: [19998.91, 28665.10, 6666.31, 1333.25, 1.6], SH: [19945.94, 29918.91, 6925.68, 831.08, 1.4], SN: [20520, 30780, 7011, 855, 0],
  ST: [12000, 18000, 4100, 500, 1.2], TH: [14400, 21600, 5000, 1000, 1.4]
};
const WBS_BY = [17500, 27500, 5000, 1300], WBS_BY_MAX = [28300, 43200, 10700, 3200], WBS_BUND = [12000, 18000, 4100, 500];
// Freibeträge Schwerbehinderung nach dem Muster § 24 Abs. 1 WoFG (andere Länder): 4.500 € (GdB 100 oder ab 80 mit Pflegebedarf), 2.100 € (GdB unter 80 mit Pflegebedarf)
function wbsFrei(e) {
  const g = e.gdb === 'H' ? 100 : Number(e.gdb) || (e.behinderung ? 100 : 0), pg = Number(e.pflegegrad) > 0;
  return (g === 100 || (g >= 80 && pg) ? 4500 : g >= 50 && pg ? 2100 : 0) + Math.min(4, Math.max(0, e.bhWeitere | 0)) * 2100;
}
// Bayern: Art. 5 Abs. 2 Nr. 1 BayWoFG 4.000 € je Person mit GdB ab 50; Abs. 3 Unterhalt (Titel: ganz; sonst höchstens 4.000 € je Person
// außerhalb des Haushalts, 6.000 € Ex-Ehegatte; ohne Angabe ganz). Über Art. 4 Abs. 1 Satz 1 BayWoBindG. gesetze-bayern.de, Abruf 21.11.2026.
function wbsFreiBY(e) {
  const g = e.gdb === 'H' ? 100 : Number(e.gdb) || (e.behinderung ? 100 : 0);
  const uz = zahl(e.uzBetrag) * 12;
  // Prüfung 21.11.2026: „3 oder mehr Kinder“ (k3) und „frühere Partner und Kinder“ (exk) ohne Deckel, weil die Zahl der Kinder fehlt
  const wer = { k1: [1, 0], k2: [2, 0], ex: [0, 1] }[e.uzAn];
  const deckel = wer ? wer[0] * 4000 + wer[1] * 6000 : Infinity;
  return (g >= 50 ? 4000 : 0) + Math.min(4, Math.max(0, e.bhWeitere | 0)) * 4000 + (e.uzTitel ? uz : Math.min(uz, deckel));
}
// „Nein“-Schwelle nach §§ 21–24 WoFG bzw. Art. 5, 6 BayWoFG: zuerst Werbungskosten-Pauschbetrag 1.230 € je Person mit Lohn (§ 9a EStG,
// höchstens bis zum Lohn) und einmal für Lohn der Kinder, dann pauschal 30 %, dann Freibeträge und gezahlter Unterhalt (seit 21.11.2026
// auch in Bayern; Befunde WBS1, WBS2, WBS4 behoben).
function wbs(e) {
  if (e.aufenthalt === 'ausreise' || e.aufenthalt === 'asyl') return { level: 'nein' };
  const erw = e.adults === 2 ? 2 : 1, kinder = Math.max(0, e.kids | 0) + Math.max(0, e.young | 0), n = erw + kinder;
  const kindEink = kinder > 0 ? zahl(e.kindEink) : 0;
  const jahr = (zahl(e.brutto) + kindEink) * 12;
  // Art. 4 Abs. 1 Satz 4 BayWoBindG: Schwangerschaft zählt wie ein Kind (nur in Bayern)
  const schw = (e.bundesland || 'BY') === 'BY' && (e.schwanger || e.baby === 'bald') ? 1 : 0;
  const grenze = (t) => (n <= 1 ? t[0] : t[1] + (n - 2) * t[2]) + (kinder + (t === WBS_BY || t === WBS_BY_MAX ? schw : 0)) * t[3];
  const lohn1 = e.art1 === 'lohn' ? Math.max(0, zahl(e.brutto) - (erw === 2 ? zahl(e.brutto2) : 0)) : 0, lohn2 = erw === 2 && e.art2 === 'lohn' ? zahl(e.brutto2) : 0;
  const wk = Math.min(1230, lohn1 * 12) + Math.min(1230, lohn2 * 12) + Math.min(1230, kindEink * 12);
  const land = e.bundesland || 'BY';
  if (land === 'BY') {
    const g = grenze(WBS_BY), max = grenze(WBS_BY_MAX);
    const nachAbzug = (jahr - wk) * 0.7 - wbsFreiBY(e);
    if (jahr <= g) return { level: 'ja', grenze: g };
    return { level: nachAbzug <= max ? 'vielleicht' : 'nein', grenze: g };
  }
  const t = WBS_TAB[land];
  if (!t) return { level: jahr <= grenze(WBS_BUND) ? 'ja' : 'vielleicht', grenze: grenze(WBS_BUND) };
  let g = grenze(t);
  if (land === 'SH') g += n <= 1 ? 3000 : n === 2 ? 2000 : 0;
  if (land === 'RP' || land === 'SH') g = Math.ceil(Math.round(g * 100) / 100 / 100) * 100;
  if (jahr <= g) return { level: 'ja', grenze: g };
  const nachAbzug = (jahr - wk) * 0.7 - wbsFrei(e) - zahl(e.uzBetrag) * 12;
  return { level: t[4] && nachAbzug > g * t[4] * 1.05 ? 'nein' : 'vielleicht', grenze: g };
}

// ---------- Pfändung (neu 21.11.2026, Rechenplan docs/rechenplan/pfaendung.md) ----------
// § 850c ZPO mit der Pfändungsfreigrenzenbekanntmachung 2026 (BGBl. 2026 I Nr. 80, gültig 1.7.2026 bis 30.6.2027), in Cent gerechnet
const PF_CENT = { grund: 158740, erste: 59742, weitere: 33283, hoechst: 486630 };
function pfaendung(netto, personen) {
  const u = Math.min(5, Math.max(0, personen | 0));
  const freiC = PF_CENT.grund + (u > 0 ? PF_CENT.erste + (u - 1) * PF_CENT.weitere : 0);
  const nettoC = Math.round(Math.max(0, Number(netto) || 0) * 100);
  const zehntel = u === 0 ? 7 : 6 - u; // § 850c Abs. 3: 7/10, bei Unterhalt 5, 4, 3, 2, 1 Zehntel pfändbar
  const stufeC = Math.floor(Math.min(nettoC, PF_CENT.hoechst) / 1000) * 1000; // amtliche Tabelle in 10-€-Stufen
  let pf = stufeC > freiC ? Math.round((stufeC - freiC) * zehntel / 10) : 0;
  if (nettoC > PF_CENT.hoechst) pf += nettoC - PF_CENT.hoechst; // über der Höchstgrenze voll pfändbar
  return { pfaendbar: pf / 100, frei: freiC / 100 };
}
// P-Konto: § 899 Abs. 1 ZPO (Grundfreibetrag auf volle 10 € aufgerundet), § 902 Satz 1 Nr. 1 und 5 ZPO (Unterhalt, Kindergeld, Kinderzuschlag)
function pkonto(personen, kgKinder, kiz) {
  const u = Math.min(5, Math.max(0, personen | 0));
  const sockel = Math.ceil(PF_CENT.grund / 1000) * 10;
  const unterhaltC = u > 0 ? PF_CENT.erste + (u - 1) * PF_CENT.weitere : 0;
  return Math.round(sockel * 100 + unterhaltC + Math.max(0, kgKinder | 0) * KG * 100 + Math.round(Math.max(0, Number(kiz) || 0) * 100)) / 100;
}

// ---------- Vergleich App ↔ Referenz über Zufallsfälle (WBS, Pfändung, P-Konto) ----------
// Anzahl: Umgebungsvariable REFERENZ_FAELLE (Standard 300, wenige Sekunden; schwere Tests später 50000). Seed: REFERENZ_SEED (Standard 20261121).
// Die früheren Befunde WBS1 (Werbungskosten), WBS2 (Unterhalt in Bayern) und WBS4 (bayerische Freibeträge) sind behoben; keine erwarteten Abweichungen mehr.
function vergleich(Rules, anzahl, seed) {
  const N = anzahl || Number(process.env.REFERENZ_FAELLE) || 300;
  const SEED = seed != null ? seed : (process.env.REFERENZ_SEED ? Number(process.env.REFERENZ_SEED) : 20261121);
  // mulberry32 (32-Bit-Ganzzahlrechnung): Der frühere lineare Generator rechnete mit Gleitkommazahlen über 2^53 und lieferte stark
  // gekoppelte Werte (z. B. in Bayern fast nie „unwahrscheinlich“); so fielen Fehler in der „Nein“-Schwelle nicht auf (21.11.2026).
  let s = SEED >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const fehler = [], erwartet = {};
  const LAENDER = ['BY', 'BY', 'BY', 'BW', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'];
  for (let i = 0; i < N; i++) {
    const adults = pick([1, 2]), kids = pick([0, 0, 1, 2, 3]), young = pick([0, 0, 1]);
    const b1 = pick([0, 900, 1500, 2100, 2800, 3600, Math.round(rnd() * 600) * 10, 2500 + Math.round(rnd() * 250) * 10]), b2 = adults === 2 ? pick([0, 0, 800, 1600, Math.round(rnd() * 300) * 10]) : 0;
    const e = { adults, kids, young, art1: pick(['lohn', 'lohn', 'rente', 'ohne']), art2: adults === 2 ? pick(['lohn', 'ohne']) : '', brutto: b1 + b2, brutto2: adults === 2 ? b2 : '',
      netto: Math.round((b1 + b2) * 0.75), miete: 700, vermoegen: 0, bundesland: pick(LAENDER), kindEink: kids + young > 0 && rnd() < 0.2 ? pick([300, 700]) : '',
      gdb: pick(['', '', '', '50', '80', '100']), pflegegrad: pick(['', '', '2']), bhWeitere: pick([0, 0, 0, 1]), uzBetrag: rnd() < 0.3 ? pick([200, 400, 700]) : '', uzTitel: rnd() < 0.5, uzAn: pick(['', 'k1', 'k2', 'ex', 'exk']), bezug: {}, gebJahr: 1985 };
    if (e.art1 === 'ohne') { e.brutto = b2; e.netto = Math.round(b2 * 0.75); }
    const app = Rules.evaluate(e).results.find((x) => x.id === 'wbs').level;
    const ref = wbs(e).level;
    if (app !== ref) fehler.push({ art: 'WBS', seed: SEED, fall: i, e, app, ref });
    const netto = pick([Math.round(rnd() * 600000) / 100, Math.round(rnd() * 200000 + 150000) / 100, 1587.4, 1590, 4866.3, 4870, 5200.55]), pers = pick([0, 1, 2, 3, 4, 5, 6]);
    const pa = Rules.pfaendung(netto, pers), pr = pfaendung(netto, pers);
    if (Math.abs(pa.pfaendbar - pr.pfaendbar) > 0.005 || Math.abs(pa.frei - pr.frei) > 0.005) fehler.push({ art: 'Pfändung', seed: SEED, fall: i, netto, pers, app: pa, ref: pr });
    const kgK = pick([0, 1, 2, 3]), kiz = pick([0, 0, 297, 150.5]);
    const ka = Rules.pkonto({ personen: pers, kindergeldKinder: kgK, kiz }).gesamt, kr = pkonto(pers, kgK, kiz);
    if (Math.abs(ka - kr) > 0.005) fehler.push({ art: 'P-Konto', seed: SEED, fall: i, pers, kgK, kiz, app: ka, ref: kr });
  }
  return { anzahl: N, seed: SEED, fehler, erwartet };
}

if (require.main === module) {
  const v = vergleich(require('../src/rules.js'));
  console.log('Referenz WBS/Pfändung/P-Konto: ' + v.anzahl + ' Fälle, Seed ' + v.seed + ', Fehler ' + v.fehler.length + ', erwartete Abweichungen (Befunde) ' + JSON.stringify(v.erwartet));
  v.fehler.slice(0, 5).forEach((f) => console.log('ABWEICHUNG', JSON.stringify(f)));
  process.exit(v.fehler.length ? 1 : 0);
}

module.exports = { asylbewerber, kdu15: (e) => { const g = kduGrenze(e); if (!g) return null; const st = Number(e.mietstufe), n = Math.min((e.adults === 2 ? 2 : 1) + kinderMitBaby(e) + Math.max(0, e.young | 0), 12); return hoechst(st, n) * 1.1 * 1.5 + heiz(n); }, wbs, pfaendung, pkonto, vergleich, kappe, euAus, kduGrenze, kuenftig, zusammen, elterngeld, egAbgleich, egHaushalt, egNettoRef, svAN, EG_PAUSCH, EG_PAUSCH_RECHNER, grenze85, schon90, ASYL_NEIN, ASYL_MOEGLICH, haushalt, grundsicherungsgeld, wohngeld, kinderzuschlag, grundsicherungAlter, unterhaltsvorschuss, bafoeg, arbeitslosengeld, krankengeld, regelaltersgrenze, freibetragArbeit, RB };
