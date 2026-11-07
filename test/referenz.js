// Unabhängige Referenzrechnung. Bewusst NICHT aus src/rules.js abgeleitet: eigene Tabellen, eigene Formeln,
// direkt nach dem Gesetzestext (Stand 2026). test/test-raster.js vergleicht die App über sehr viele Haushalte damit.
// Wo die App bewusst vereinfacht (z. B. Schwellen für „wahrscheinlich“), nutzt die Referenz dieselben Konventionen,
// die Rechnung selbst ist getrennt geschrieben.
'use strict';

// ---------- Beträge 2026 ----------
const RB = { 1: 563, 2: 506, 3: 451, 4: 471, 5: 390, 6: 357 }; // Regelbedarfsstufen (RBSFV 2026)
const KG = 259; // Kindergeld je Kind (§ 66 EStG)
const MINIJOB = 603; // § 8 Abs. 1a SGB IV
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
  const art = (a, alt) => (arten.indexOf(a) >= 0 ? a : (alt ? 'rente' : 'lohn'));
  const p = [{ art: art(e.art1, e.nichtArbeit), brutto: brutto - brutto2 }];
  if (erwachsene === 2) p.push({ art: art(e.art2, e.nichtArbeit2), brutto: brutto2 });
  // Alter
  const jahr = Number(e.gebJahr) | 0;
  const heute = e.heute ? Number(e.heute) : new Date().getFullYear() + new Date().getMonth() / 12;
  let rente = !!e.alter, grenz = false, gruppe = ['<31', '31-40', '41-50', '51+'].indexOf(e.alterGruppe) >= 0 ? e.alterGruppe : '';
  if (jahr >= 1900 && jahr <= 2010) {
    const rag = regelaltersgrenze(jahr);
    rente = jahr + 1 + rag <= heute; // auch bei Geburt im Dezember erreicht
    grenz = !rente && jahr + rag <= heute; // bei Geburt im Januar erreicht
    const alter = heute - jahr - 0.5;
    gruppe = alter < 31 ? '<31' : alter < 41 ? '31-40' : alter < 51 ? '41-50' : '51+';
  }
  const regelEltern = erwachsene === 2 ? 2 * RB[2] : RB[1];
  const regelKinder = u6 * RB[6] + mitte * RB[5] + k14 * RB[4] + jung * RB[3];
  const personen = erwachsene + kinder + jung;
  const unterhalt = kinder + jung > 0 ? zahl(e.unterhalt) : 0;
  const kindEink = kinder + jung > 0 ? zahl(e.kindEink) : 0;
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
  return { e, erwachsene, kinder, jung, u6, k14, mitte, personen, brutto, brutto2, netto, p, rente, grenz, gruppe, em,
    regelEltern, regel: regelEltern + regelKinder, regelKinder, miete: zahl(e.miete), vermoegen: zahl(e.vermoegen), unterhalt, kindEink, uvg, mehrAE,
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
  return Math.max(0, h.netto - abzug);
}
// Einkommen der Kinder, das ihren Bedarf deckt (Überschuss mindert nicht den Bedarf der Eltern)
function kinderEinkommen(h) {
  const e = h.unterhalt + h.uvg + Math.max(0, h.kindEink - MINIJOB);
  if (!e) return 0;
  const bedarfKinder = h.regelKinder + h.miete * h.kids / h.personen - h.kids * KG;
  return Math.min(e, Math.max(0, bedarfKinder));
}

function grundsicherungsgeld(h) {
  if (h.rente || h.em) return { level: 'nein' };
  const b = h.bezug;
  if (b.grundsicherungsgeld) return { level: 'na' };
  if (b.sozialamt) return { level: 'nein' };
  const jung = h.gruppe === '' || h.gruppe === '<31' || h.gruppe === '31-40';
  if (h.e.ausbildung === 'ich' && !h.e.babBetrieb && jung) return { level: 'nein' };
  const schon = { '': 10000, '<31': 5000, '31-40': 10000, '41-50': 12500, '51+': 20000 }[h.gruppe] * h.erwachsene + 5000 * h.kids;
  if (h.vermoegen > schon) return { level: 'nein' };
  const bedarf = h.regel + h.miete + h.mehrAE;
  const eink = elternEinkommenSGB2(h) + h.kids * KG + kinderEinkommen(h);
  const luecke = bedarf - eink;
  return { level: luecke >= 50 ? 'ja' : luecke > -100 ? 'vielleicht' : 'nein', bedarf, luecke };
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
const wg = (n, M, Y) => { const [a, b, c] = ABC[Math.min(n, 12) - 1]; return 1.15 * (M - (a + b * M + c * Y) * Y); };
function yGrenze(n, M) { let lo = 0, hi = 30000; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (wg(n, M, m) > 0) lo = m; else hi = m; } return lo; }
const mieteWG = (st, n, warm, faktor) => Math.min(faktor * Math.max(0, warm - heiz(n)), hoechst(st, n)) + heiz(n);
const ABZUG = { lohn: [0.1, 0.3], rente: [0.1, 0.2], kg: [0.1, 0.2], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.1], ohne: [0, 0] };

function wohngeld(h) {
  const b = h.bezug, e = h.e;
  if (b.grundsicherungsgeld || b.sozialamt) return { level: 'nein' };
  if (b.wohngeld) return { level: 'na' };
  if (h.vermoegen > 60000 + 30000 * (h.personen - 1)) return { level: 'nein' };
  const jung = h.gruppe === '' || h.gruppe === '<31' || h.gruppe === '31-40';
  if (e.ausbildung === 'ich' && h.erwachsene === 1 && h.kids === 0 && (!e.babBetrieb || e.babWohnt) && jung) return { level: 'nein' };
  if (h.miete <= 0) return { level: 'nein' };
  const st = [1, 2, 3, 4, 5, 6, 7].indexOf(Number(e.mietstufe)) >= 0 ? Number(e.mietstufe) : null;
  const n = Math.min(h.personen, 12);
  const yMaxLo = yGrenze(n, mieteWG(st || 1, n, h.miete, 0.9)), yMaxHi = yGrenze(n, mieteWG(st || 7, n, h.miete, 1));
  // § 17 WoGG: Freibeträge (Behinderung: GdB 100 oder GdB >= 50 mit Pflegegrad; Alleinerziehende 110 € im Monat)
  const gdb = e.gdb === 'H' ? 100 : Number(e.gdb) || (e.behinderung ? 100 : 0);
  const pg = ['1', '2', '3', '4', '5'].indexOf(String(e.pflegegrad)) >= 0;
  let frei = (gdb === 100 || (gdb >= 50 && pg) ? 150 : 0) + (h.erwachsene === 1 && h.kinder > 0 ? 110 : 0);
  frei += h.p.reduce((s, x) => s + (x.art === 'eg' ? Math.min(300, x.brutto) : 0), 0);
  const plus = h.unterhalt + h.uvg + Math.max(0, h.kindEink - 100);
  const yPess = Math.max(0, h.p.reduce((s, x) => s + x.brutto * (1 - ABZUG[x.art][0]), 0) + plus - frei);
  const yOpt = Math.max(0, h.p.reduce((s, x) => s + x.brutto * (1 - ABZUG[x.art][1]), 0) + plus - frei);
  if (yOpt > yMaxHi) return { level: 'nein' };
  let level = yPess <= yMaxLo ? 'ja' : 'vielleicht';
  const mittel = h.netto + h.kinder * KG + h.unterhalt + h.uvg + h.kindEink;
  if (mittel < 0.8 * (h.regel + h.miete + h.mehrAE)) level = 'vielleicht';
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
  const bedarfEltern = h.regelEltern + h.mehrAE + h.miete * anteilEltern;
  const kindAnr = h.unterhalt + h.uvg + Math.max(0, h.kindEink - MINIJOB);
  const kiz = Math.max(0, max - 0.45 * Math.max(0, elternEinkommenSGB2(h) - bedarfEltern) - 0.45 * kindAnr);
  if (kiz <= 0) return { level: 'nein' };
  if (h.netto + h.unterhalt + h.uvg + h.kindEink + max + 300 < h.regel + h.miete + h.mehrAE) return { level: 'vielleicht', kiz };
  return { level: kiz >= 60 ? 'ja' : 'vielleicht', kiz };
}

// ---------- Grundsicherung im Alter und bei Erwerbsminderung (SGB XII, 4. Kapitel) ----------
// Einkommen § 82: Werkstattlohn ohne Arbeitsförderungsgeld (52 €), davon frei: RS1/8 + 50 % des Rests (Abs. 3 Satz 2);
// Lohn: 30 % frei, höchstens RS1/2 (Abs. 3 Satz 1); Elterngeld über 300 €: 300 € frei; Renten, ALG, Krankengeld voll.
function einkommenSGB12(e, h) {
  let posten;
  if (Array.isArray(e.einkommen)) posten = e.einkommen.map((x) => ({ art: x.art, n: zahl(x.b) }));
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
    else if (x.art !== 'ohne') summe += x.n;
  }
  return summe;
}
function grundsicherungAlter(e) {
  const h = haushalt(e);
  if (Array.isArray(e.einkommen)) { const s = e.einkommen.reduce((a, x) => a + zahl(x.b), 0); h.brutto = s; h.netto = s; h.p = [{ art: e.einkommen.length ? e.einkommen[0].art : 'ohne', brutto: s }]; }
  const em = h.em;
  if (!h.rente && !em && !h.grenz) return { level: 'nein' };
  if (h.bezug.sozialamt) return { level: 'na' };
  if (h.bezug.grundsicherungsgeld) return { level: 'nein' };
  const wf = e.wohnform === 'eltern' || e.wohnform === 'heim' ? e.wohnform : '';
  if (h.vermoegen > (wf ? 10000 : 10000 * h.erwachsene + 500 * h.kids)) return { level: 'nein' };
  const regelPerson = wf === 'heim' || (h.erwachsene === 2 && !wf) ? RB[2] : RB[1];
  const g = e.mzG ? 0.17 * regelPerson : 0;
  const mieteDa = !leer(e.miete) && zahl(e.miete) > 0;
  let bedarf, unsicher = 0;
  if (wf === 'eltern') { bedarf = RB[1] + (mieteDa ? zahl(e.miete) : 0) + g; unsicher = mieteDa ? 0 : 300; }
  else if (wf === 'heim') { bedarf = RB[2] + g; unsicher = 700; }
  else bedarf = h.regel + h.miete + h.mehrAE + g;
  if (e.wfbmEssen) unsicher += 90;
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

module.exports = { haushalt, grundsicherungsgeld, wohngeld, kinderzuschlag, grundsicherungAlter, regelaltersgrenze, freibetragArbeit, RB };
