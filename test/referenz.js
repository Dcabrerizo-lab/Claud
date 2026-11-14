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
function haushalt(e) {
  const erwachsene = e.adults === 2 ? 2 : 1;
  const kinder = Math.max(0, e.kids | 0), jung = Math.max(0, e.young | 0);
  const u6 = Math.min(Math.max(0, e.kidsU6 | 0), kinder);
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
  let rente = !!e.alter, grenz = false, gruppe = { '<31': '<30', '31-40': '30-39', '41-50': '40-49', '51+': '50+', '<30': '<30', '30-39': '30-39', '40-49': '40-49', '50+': '50+' }[e.alterGruppe] || '', jahre = 0;
  if (jahr >= 1900 && jahr <= 2010) {
    const rag = regelaltersgrenze(jahr);
    rente = jahr + 1 + rag <= heute; // auch bei Geburt im Dezember erreicht
    grenz = !rente && jahr + rag <= heute; // bei Geburt im Januar erreicht
    const alter = heute - jahr - 0.5;
    jahre = alter; // vollendete Lebensjahre (Mitte des Geburtsjahres)
    gruppe = alter < 30 ? '<30' : alter < 40 ? '30-39' : alter < 50 ? '40-49' : '50+';
  }
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
  // Unterhaltsvorschuss, den die Kinder bekämen (Alleinerziehende, Unterhalt fehlt); ab 12 nur mit 600 € eigenem Einkommen
  let uvg = 0;
  if (erwachsene === 1 && kinder > 0 && e.unterhaltFehlt) {
    const ohneAeltere = !!e.kinder12 && brutto < 600;
    uvg = Math.max(0, u6 * UVG.u6 + mitte * UVG.u12 + (ohneAeltere ? 0 : k14 * UVG.u18) - unterhalt);
  }
  // Mehrbedarf Alleinerziehende (§ 21 Abs. 3 SGB II): 36 % (1 Kind < 7 oder 2-3 Kinder < 16) oder 12 % je Kind, max. 60 %
  let mehrAE = 0;
  if (erwachsene === 1 && kinder > 0) {
    const unter16 = kinder - k14;
    const prozent = Math.min(0.6, Math.max(0.12 * kinder, u6 >= 1 || (unter16 >= 2 && unter16 <= 3) ? 0.36 : 0));
    mehrAE = prozent * RB[1];
  }
  const em = e.emStd === 'unter3' || !!e.wfbm || !!e.erwerbsgemindert || e.art1 === 'wfbm' || e.art2 === 'wfbm' || (Array.isArray(e.einkommen) && e.einkommen.some((x) => x.art === 'wfbm'));
  return { e, erwachsene, kinder, jung, u6, k14, mitte, personen, brutto, brutto2, netto, p, rente, grenz, gruppe, jahre, em,
    mini: minijobAm(heute), regelEltern, regel: regelEltern + regelKinder, regelKinder, miete: zahl(e.miete), vermoegen: zahl(e.vermoegen), unterhalt, kindEink, uvg, mehrAE, uz, uzFest, uzDeckel,
    bezug: e.bezug || {}, kids: kinder + jung };
}

// ---------- SGB II: Einkommen nach Abzügen ----------
// § 11b Abs. 2, 3 SGB II: 100 € Grundfreibetrag, 20 % (100-520), 30 % (520-1.000), 10 % (1.000-1.200; mit minderjährigem Kind 1.500)
function freibetragArbeit(b, mitKind) {
  const stufen = [[0, 100, 1], [100, 520, 0.2], [520, 1000, 0.3], [1000, mitKind ? 1500 : 1200, 0.1]];
  return stufen.reduce((s, [von, bis, q]) => s + Math.max(0, Math.min(b, bis) - von) * q, 0);
}
function elternEinkommenSGB2(h) {
  let abzug = 0;
  h.p.forEach((x) => {
    if (x.art === 'lohn') abzug += freibetragArbeit(x.brutto, h.kinder > 0);
    else if (x.art !== 'ohne' && x.brutto > 0) abzug += 30; // Versicherungspauschale
    if (x.art === 'eg' && x.brutto > 300) abzug += 300; // § 10 Abs. 5 BEEG
  });
  if (h.uzFest) abzug += h.uz; // § 11b Abs. 1 Satz 1 Nr. 7 SGB II
  return Math.max(0, h.netto - abzug);
}
// Einkommen der Kinder, das ihren Bedarf deckt (Überschuss mindert nicht den Bedarf der Eltern)
function kinderEinkommen(h) {
  const e = h.unterhalt + h.uvg + Math.max(0, h.kindEink - h.mini);
  if (!e) return 0;
  const bedarfKinder = h.regelKinder + h.miete * h.kids / h.personen - h.kids * KG;
  return Math.min(e, Math.max(0, bedarfKinder));
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
  return level;
}
function grundsicherungsgeld(h) {
  if (euAus(h)) return { level: 'nein' };
  if (h.rente || h.em) return { level: h.erwachsene === 2 && h.kids > 0 && !h.bezug.grundsicherungsgeld ? 'vielleicht' : 'nein' };
  const b = h.bezug;
  if (b.grundsicherungsgeld) return { level: 'na' };
  if (b.sozialamt) return { level: 'nein' };
  const jung = h.jahre ? h.jahre < 45 : (h.gruppe === '' || h.gruppe === '<30' || h.gruppe === '30-39');
  if (h.e.ausbildung === 'ich' && !h.e.babBetrieb && jung) return { level: 'nein' };
  const schon = { '': 10000, '<30': 5000, '30-39': 10000, '40-49': 12500, '50+': 20000 }[h.gruppe] * h.erwachsene + 5000 * h.kids;
  if (h.vermoegen > schon) return { level: 'nein' };
  const bm = behMehrSGB2(h), ms = mehrSonst(h);
  const bedarf = h.regel + h.miete + h.mehrAE + bm.sicher + ms.sicher;
  const eink = elternEinkommenSGB2(h) + h.kids * KG + kinderEinkommen(h);
  const luecke = bedarf - eink;
  return { level: luecke >= 50 ? 'ja' : luecke > -(100 + bm.moeglich + ms.moeglich) ? 'vielleicht' : 'nein', bedarf, luecke };
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
function yGrenze(n, M) { let lo = 0, hi = 30000; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (wg(n, M, m) > 0) lo = m; else hi = m; } return lo; }
const mieteWG = (st, n, warm, faktor) => Math.min(faktor * Math.max(0, warm - heiz(n)), hoechst(st, n)) + heiz(n);
const ABZUG = { lohn: [0.1, 0.3], rente: [0.1, 0.2], kg: [0.1, 0.2], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.1], ohne: [0, 0] };
// Auf schon ausgezahlte Beträge (Beiträge sind abgezogen) nur noch ein kleiner Abzug (Konvention der App für ausgezahlte Beträge)
const ABZUG_AUSZ = { lohn: [0, 0.12], rente: [0, 0.06], kg: [0, 0.06], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.05], ohne: [0, 0] };
const abzugAus = (x, i) => (x.aus ? ABZUG_AUSZ : ABZUG)[x.art][i];

function wohngeld(h) {
  const b = h.bezug, e = h.e;
  if (b.grundsicherungsgeld || b.sozialamt) return { level: 'nein' };
  if (b.wohngeld) return { level: 'na' };
  if (h.vermoegen > 60000 + 30000 * (h.personen - 1)) return { level: 'nein' };
  const jung = h.jahre ? h.jahre < 45 : (h.gruppe === '' || h.gruppe === '<30' || h.gruppe === '30-39');
  if (e.ausbildung === 'ich' && h.erwachsene === 1 && h.kids === 0 && (!e.babBetrieb || e.babWohnt) && jung) return { level: 'nein' };
  if (h.miete <= 0) return { level: 'nein' };
  const st = [1, 2, 3, 4, 5, 6, 7].indexOf(Number(e.mietstufe)) >= 0 ? Number(e.mietstufe) : null;
  const n = Math.min(h.personen, 12);
  const yMaxLo = yGrenze(n, mieteWG(st || 1, n, h.miete, 0.9)), yMaxHi = yGrenze(n, mieteWG(st || 7, n, h.miete, 1));
  // § 17 WoGG: Freibeträge (Behinderung: GdB 100 oder GdB >= 50 mit Pflegegrad; Alleinerziehende 110 € im Monat)
  const gdb = e.gdb === 'H' ? 100 : Number(e.gdb) || (e.behinderung ? 100 : 0);
  const pg = ['1', '2', '3', '4', '5'].indexOf(String(e.pflegegrad)) >= 0;
  let frei = (gdb === 100 || (gdb >= 50 && pg) ? 150 : 0) + (h.erwachsene === 1 && h.kinder > 0 ? 110 : 0);
  frei += Math.min(4, Math.max(0, e.bhWeitere | 0)) * 150; // weitere schwerbehinderte Haushaltsmitglieder
  frei += h.p.reduce((s, x) => s + (x.art === 'eg' ? Math.min(300, x.brutto) : 0), 0);
  // § 17a WoGG: Grundrentenfreibetrag je Rente
  frei += e.grundrente33 ? h.p.filter((x) => x.art === 'rente').reduce((a, x) => a + Math.min(100 + 0.3 * Math.max(0, x.brutto - 100), 0.5 * RB[1]), 0) : 0;
  const plus = h.unterhalt + h.uvg + Math.max(0, h.kindEink - 100);
  const uzVorsichtig = h.uzFest ? Math.min(h.uz, h.uzDeckel) : 0, uzGuenstig = h.uzFest ? h.uz : Math.min(h.uz, h.uzDeckel);
  const yPess = Math.max(0, h.p.reduce((s, x) => s + (x.brutto - werbung(x)) * (1 - abzugAus(x, 0)), 0) + plus - frei - uzVorsichtig);
  const yOpt = Math.max(0, h.p.reduce((s, x) => s + (x.brutto - werbung(x)) * (1 - abzugAus(x, 1)), 0) + plus - frei - uzGuenstig);
  if (yOpt > yMaxHi) return { level: 'nein' };
  let level = yPess <= yMaxLo ? 'ja' : 'vielleicht';
  const mittel = h.netto + h.kinder * KG + h.unterhalt + h.uvg + h.kindEink - h.uz;
  if (mittel < 0.8 * (h.regel + h.miete + h.mehrAE)) level = 'vielleicht'; // App: ohne weitere Mehrbedarfe
  let betrag = null;
  if (st) { const M = mieteWG(st, n, h.miete, 1); betrag = [Math.max(0, runde10(wg(n, M, yPess))), Math.max(0, runde10(wg(n, M, yOpt)))]; }
  return { level, yPess, yOpt, betrag };
}

// ---------- Kinderzuschlag (§ 6a BKGG) ----------
function kinderzuschlag(h) {
  const b = h.bezug;
  if (h.kids === 0) return { level: 'nein' };
  if (b.grundsicherungsgeld || b.sozialamt) return { level: 'nein' };
  if (b.kiz) return { level: 'na' };
  const vermGrenze = h.personen <= 2 ? 55000 : 70000 + 15000 * (h.personen - 3);
  if (h.vermoegen > vermGrenze) return { level: 'nein' };
  if (h.brutto < (h.erwachsene === 2 ? 900 : 600)) return { level: 'nein' };
  const max = 297 * h.kids;
  const anteilEltern = h.erwachsene / (h.erwachsene + (h.erwachsene === 1 ? 0.29 : 0.4) * h.kids);
  const ms = mehrSonst(h), bm = behMehrSGB2(h);
  const bedarfEltern = h.regelEltern + h.mehrAE + ms.eltern + (h.e.bhPerson === 'erwNach25' ? bm.sicher : 0) + h.miete * anteilEltern;
  const kindAnr = h.unterhalt + h.uvg + Math.max(0, h.kindEink - h.mini);
  const kiz = Math.max(0, max - 0.45 * Math.max(0, elternEinkommenSGB2(h) - bedarfEltern) - 0.45 * kindAnr);
  if (kiz <= 0) return { level: 'nein' };
  if (h.netto - (h.uzFest ? h.uz : 0) + h.unterhalt + h.uvg + h.kindEink + max + 300 < h.regel + h.miete + h.mehrAE + ms.sicher + bm.sicher) return { level: 'vielleicht', kiz };
  return { level: kiz >= 60 ? 'ja' : 'vielleicht', kiz };
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
  for (const x of posten) {
    if (x.art === 'wfbm') { const lohn = Math.max(0, x.n - 52); const frei = Math.min(lohn, rs1 / 8 + 0.5 * Math.max(0, lohn - rs1 / 8)); summe += lohn - frei; }
    else if (x.art === 'lohn') summe += x.n - Math.min(0.3 * x.n, 0.5 * rs1);
    else if (x.art === 'eg') summe += Math.max(0, x.n - ((x.b != null ? x.b : x.n) > 300 ? 300 : 0));
    else if (x.art === 'rente' && e.grundrente33) summe += x.n - Math.min(100 + 0.3 * Math.max(0, x.n - 100), 0.5 * rs1); // § 82a
    else if (x.art !== 'ohne') summe += x.n;
  }
  return summe;
}
function grundsicherungAlter(e) {
  const h = haushalt(e);
  if (Array.isArray(e.einkommen)) { const s = e.einkommen.reduce((a, x) => a + zahl(x.b), 0); h.brutto = s; h.netto = e.einkommen.reduce((a, x) => a + (leer(x.n) ? zahl(x.b) : zahl(x.n)), 0); h.p = [{ art: e.einkommen.length ? e.einkommen[0].art : 'ohne', brutto: s }]; }
  const em = h.em;
  if (!h.rente && !em && !h.grenz) return { level: 'nein' };
  if (euAus(h)) return { level: 'nein' };
  if (h.bezug.sozialamt) return { level: 'na' };
  if (h.bezug.grundsicherungsgeld) return { level: 'nein' };
  const wf = e.wohnform === 'eltern' || e.wohnform === 'heim' ? e.wohnform : '';
  // Auto zählt im SGB XII zum Vermögen, außer es wird wegen Behinderung oder für die Arbeit gebraucht
  const auto = e.autoBraucht || e.mzG || (e.mz && e.mz.aG) ? 0 : zahl(e.autoWert);
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
  let level = luecke >= 50 ? 'ja' : luecke > -(100 + unsicher) ? 'vielleicht' : 'nein';
  if (h.grenz && level === 'ja') level = 'vielleicht';
  // Konvention der App: Fehlt eine Angabe (Einkommen, Vermögen, Miete in der eigenen Wohnung), gibt es kein „wahrscheinlich“
  const fehlt = (!Array.isArray(e.einkommen) && leer(e.brutto) && leer(e.netto)) || leer(e.vermoegen) || (!wf && leer(e.miete));
  if (fehlt && level === 'ja') return { level: 'vielleicht' };
  if (fehlt && level === 'vielleicht') return { level: 'vielleicht' };
  return { level, bedarf, luecke };
}

// ---------- Unterhaltsvorschuss (UVG) ----------
function unterhaltsvorschuss(e) {
  const h = haushalt(e);
  if (h.kinder === 0) return { level: 'nein' };
  if (!e.unterhaltFehlt) return { level: 'nein' };
  if (h.unterhalt > 0) return { level: h.unterhalt >= h.kinder * UVG.u18 ? 'nein' : 'vielleicht' };
  if (h.erwachsene === 2) return { level: 'vielleicht' };
  if (e.kinder12 && h.brutto < 600) return { level: 'vielleicht' };
  return { level: 'ja' };
}

// ---------- BAföG (nur Einstufung; Kind: Freibeträge der Eltern § 25 BAföG, vereinfacht wie in der App) ----------
function bafoeg(e) {
  const h = haushalt(e);
  const a = e.ausbildung;
  if (a !== 'kind' && a !== 'kindBetrieb' && a !== 'ich') return { level: 'nein' };
  if (a === 'kindBetrieb') return { level: 'nein' };
  if (a === 'kind') {
    if (h.kids === 0) return { level: 'nein' };
    const frei = (h.erwachsene === 2 ? 2540 : 1690) + Math.max(0, h.kids - 1) * 770;
    return { level: h.netto <= frei ? 'ja' : h.netto <= frei + 1200 ? 'vielleicht' : 'nein', frei };
  }
  if (h.gruppe === '50+') return { level: 'nein' };
  if (h.gruppe === '40-49' && !(h.jahre && h.jahre < 45)) return { level: 'vielleicht' };
  if (h.vermoegen + zahl(h.e.autoWert) > (h.gruppe === '<30' ? 15000 : 45000)) return { level: 'nein' };
  return { level: 'vielleicht' };
}

// ---------- Arbeitslosengeld I (§§ 137, 147, 149 SGB III) ----------
function arbeitslosengeld(e) {
  const h = haushalt(e);
  const bekommt = h.p.some((x) => x.art === 'alg');
  if (bekommt) return { level: 'na' };
  if (e.arbeitSit === 'krank' && e.krankWochen === 'ende') return { level: 'vielleicht' };
  if (e.arbeitSit !== 'arbeitslos') return { level: 'nein' };
  if (h.rente) return { level: 'nein' };
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
  if (m) dauer = m >= 48 && alter >= 58 ? 24 : m >= 36 && alter >= 55 ? 18 : m >= 30 && alter >= 50 ? 15 : m >= 24 ? 12 : m >= 20 ? 10 : m >= 16 ? 8 : 6;
  const lohn = Math.min(zahl(e.lohnVorher), 8450);
  const oben = lohn <= 2000 ? 0.8 : 0.72; // Netto bei kleinem Brutto höher
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
  return { level: e.krankWochen === 'unter6' ? 'vielleicht' : 'ja', spanne: lohn > 0 ? [kg(0.6), kg(lohn <= 2000 ? 0.8 : 0.72)] : null };
}


// ---------- Elterngeld (§ 2 BEEG, wörtlich: 0,1 Prozentpunkte je volle 2 € Abstand) ----------
function elterngeld(nettoVorher) {
  // § 2c Abs. 1 BEEG: Elterngeld-Netto = Netto minus 1/12 des Arbeitnehmer-Pauschbetrags (1.000 €), wie der Elterngeldrechner des Bundes
  const n = Math.max(0, nettoVorher - 1000 / 12);
  let prozent = 67;
  if (n < 1000) prozent = Math.min(100, 67 + Math.floor((1000 - n) / 2) * 0.1);
  if (n > 1200) prozent = Math.max(65, 67 - Math.floor((n - 1200) / 2) * 0.1);
  const basis = Math.min(1800, Math.max(300, n * prozent / 100));
  return { basis, plus: basis / 2, monate: 14 };
}
// ---------- Einkommensgrenze § 85 SGB XII (Hilfe zur Pflege, Blindenhilfe) und Schonvermögen ----------
function grenze85(e) {
  const personen = (e.adults === 2 ? 2 : 1) + Math.max(0, e.kids | 0) + Math.max(0, e.young | 0);
  return 2 * RB[1] + zahl(e.miete) + 0.7 * RB[1] * (personen - 1);
}
function schon90(e) { return 10000 * (e.adults === 2 ? 2 : 1) + 500 * (Math.max(0, e.kids | 0) + Math.max(0, e.young | 0)); }
// ---------- Asylbewerber: Ausschlüsse (§ 7 Abs. 1 SGB II, § 23 Abs. 2 SGB XII, § 7 WoGG, § 6a BKGG mit § 62 EStG) ----------
const ASYL_NEIN = ['ggeld', 'gsa', 'wohngeld', 'kiz'];

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
  else if (e.baby === 'bald' && h.erwachsene === 1 && !leer(e.egVor)) { art = 'eg'; betrag = runde10(elterngeld(zahl(e.egVor)).basis); }
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
  const n = Math.min((e.adults === 2 ? 2 : 1) + Math.max(0, e.kids | 0) + Math.max(0, e.young | 0), 12);
  return hoechst(st, n) * 1.1 + heiz(n);
}

module.exports = { kappe, euAus, kduGrenze, kuenftig, zusammen, elterngeld, grenze85, schon90, ASYL_NEIN, haushalt, grundsicherungsgeld, wohngeld, kinderzuschlag, grundsicherungAlter, unterhaltsvorschuss, bafoeg, arbeitslosengeld, krankengeld, regelaltersgrenze, freibetragArbeit, RB };
