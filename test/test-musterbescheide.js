// Abgleich mit veröffentlichten Musterbescheiden und amtlichen Rechenbeispielen (unabhängiger Abgleich vom 21.11.2026,
// 43 Fälle, 9 Befunde). Feste Tests ohne Internet: die 23 Testfall-Vorschläge des Berichts plus je ein Regressionstest pro Befund.
// Quellen (alle abgerufen am 21.11.2026):
//  KiZ-MB   Familienkasse, Merkblatt Kinderzuschlag, Stand Juli 2026 (https://www.arbeitsagentur.de/datei/kiz2-merkblattkinderzuschlag_ba015395.pdf)
//  DA-KiZ   Familienkasse Direktion, Durchführungsanweisung Kinderzuschlag, Stand 20.02.2026 (https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf)
//  MB-SGB2  BA, Merkblatt „Grundsicherung für Arbeitsuchende“, Stand August 2026 (https://www.arbeitsagentur.de/datei/merkblatt-sgb2_ba043375.pdf)
//  BG-Muster  Musterbescheid Bürgergeld (Jobcenter-Vorlage), Februar 2023, Werte 2023
//  WG-Muster  Stadt Frankfurt am Main, Musterbescheid Wohngeld vom 03.06.2025 (https://www.frankfurtpass.de/files/Musterbescheid_Wohngeld.pdf)
//  WG-Han   Landeshauptstadt Hannover, Wohngeld-Musterberechnungen für Seniorinnen und Senioren, Januar 2025 (Mietenstufe V)
//  WG-Muc   Landeshauptstadt München, Wohngeld – Einkommensgrenzen 2025, Mietenstufe VII
//  WG-12    BMWSB, Hinweise zu Nr. 19.31 WoGVwV vom 02.12.2024 (mehr als 12 Haushaltsmitglieder); § 19 Abs. 3 WoGG
//  WG-Plaus BMI, Hinweise zu Nr. 15.01 WoGVwV vom 11.03.2020 (Plausibilitätsprüfung)
//  GSA-Han  Region Hannover, Faltblatt Grundsicherung im Alter 4/2024; GSA-Bo Stadt Bochum, Merkblatt Grundsicherung (Werte ab 1.1.2024)
//  EG-Br    BMBFSFJ, Broschüre „Elterngeld und Elternzeit“, 28. Auflage Oktober 2025; AE-2026 BMBFSFJ, Leistungen für Alleinerziehende 2026
'use strict';
const R = require('../src/rules.js');
const BSGB2 = require('../erweiterungen/bescheid-sgb2.js');
const BWG = require('../erweiterungen/bescheid-wg.js');
const BKIZ = require('../erweiterungen/bescheid-kiz.js');
const BGSA = require('../erweiterungen/bescheid-gsa.js');

let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL [muster] ' + name, x === undefined ? '' : JSON.stringify(x)); } };
const nah = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 0.005 : tol);
const HEUTE = 2026.9;
const F = R.sgb2Freibetrag;
const kg = { kindergeld: true };
const karte = (inp, id) => R.evaluate(Object.assign({ heute: HEUTE, vermoegen: 0, bezug: {} }, inp)).results.find((r) => r.id === id);
const betrag = (k) => { const t = k.tx.find((x) => /^schaetz\./.test(x[0])); return t ? t[1] : null; };
const eins = (k) => { const b = betrag(k); return b && b.a ? b.a.eur : null; };
const keys = (k) => k.tx.map((t) => t[0]);

// ---------- 1-4: Merkblatt Kinderzuschlag (Juli 2026) ----------
{
  const n1 = 1585 + F(2500, true), n2 = 330 + F(750, true);
  const k = karte({ adults: 2, kids: 3, kidsAlter: true, einkommen: [{ art: 'lohn', b: 2500, n: n1, p: 1 }, { art: 'lohn', b: 750, n: n2, p: 2 }], miete: 900, mietstufe: '3', bezug: kg }, 'kiz');
  const b = BKIZ.rechne({ eltern: [{ brutto: 2500, netto: n1 }, { brutto: 750, netto: n2 }], kinder: [{ alter: 8 }, { alter: 10 }, { alter: 12 }], wohnkosten: 900 }, R);
  ck('[musterbescheide] KiZ-MB 2.2 Bsp. 1: App „ja“, 740 € (amtlich 736 €)', k.level === 'ja' && eins(k) === 740, k);
  ck('KiZ-MB 2.2 Bsp. 1: Bescheid-Check Bedarf 1.570, KiZ 735,75', nah(b.bedarf, 1570) && nah(b.kiz, 735.75), b);
}
{
  const nn = 2100 + F(3300, true);
  const k = karte({ adults: 2, kids: 1, kidsAlter: true, einkommen: [{ art: 'lohn', b: 3300, n: nn, p: 1 }], miete: 800, mietstufe: '3', bezug: kg }, 'kiz');
  const b = BKIZ.rechne({ eltern: [{ brutto: 3300, netto: nn }, {}], kinder: [{ alter: 8 }], wohnkosten: 800 }, R);
  ck('KiZ-MB 2.2 Bsp. 2: App „ja“, 110 € (amtlich 106 €)', k.level === 'ja' && eins(k) === 110, k);
  ck('KiZ-MB 2.2 Bsp. 2: Bescheid-Check 106,20', nah(b.kiz, 106.2), b.kiz);
}
{
  const k = karte({ adults: 1, kids: 1, kidsAlter: true, einkommen: [{ art: 'lohn', b: 1500, n: 1200, p: 1 }], unterhalt: 300, miete: 600, mietstufe: '3', bezug: kg }, 'kiz');
  const b = BKIZ.rechne({ eltern: [{ brutto: 1500, netto: 1200 }], kinder: [{ alter: 8, unterhalt: 300 }], wohnkosten: 600 }, R);
  ck('KiZ-MB 2.1 Unterhalt 300 €: App 160 €, Check 162 €', eins(k) === 160 && nah(b.kiz, 162), [eins(k), b.kiz]);
}
const famA = (brutto, zuBer) => ({ adults: 2, kids: 2, kids14: 1, kidsAlter: true, einkommen: [{ art: 'lohn', b: brutto, n: zuBer + F(brutto, true), p: 1 }], miete: 900, mietstufe: '3', bezug: kg });
{
  const g = karte(Object.assign(famA(2700, 1600), { bezug: {} }), 'ggeld'), k = karte(famA(2700, 1600), 'kiz');
  ck('KiZ-MB 1.3 Bsp. 1: Bedarf 2.773 €', g.tx[0][1].bedarf.eur === 2773, g.tx[0]);
  ck('KiZ-MB 1.3 Bsp. 1: Kinderzuschlag nicht „nein“, 590 € (amtlich 594 €)', k.level !== 'nein' && eins(k) === 590, k);
  ck('KiZ-MB 1.3 Bsp. 2 (700 € zu ber., Wohngeld 800 €): kein Kinderzuschlag -> „Einkommen eher zu niedrig“', karte(famA(1300, 700), 'kiz').hl === 'einkoNiedrig');
}

// ---------- 5-8: DA-KiZ (20.02.2026) ----------
{
  const k = karte({ adults: 1, kids: 2, kidsAlter: true, einkommen: [{ art: 'lohn', b: 1000, n: 928, p: 1 }, { art: 'unt', b: 450, n: 450, p: 1 }], miete: 400, mietstufe: '3', bezug: kg }, 'kiz');
  ck('DA-KiZ C.3.2 Mutter T.: 580 € (amtlich 579,46 €)', eins(k) === 580, k);
  const x = karte({ adults: 2, kids: 3, kids14: 2, kidsAlter: true, kinder12: true, einkommen: [{ art: 'rente', b: 1480, n: 1480, p: 1 }, { art: 'lohn', b: 500, n: 480, p: 2 }], miete: 645.16, mietstufe: '3', bezug: kg }, 'kiz');
  ck('DA-KiZ C.3.2 Ehepaar X: 720 € (amtlich 718 €)', eins(x) === 720, x);
  const p = karte({ adults: 2, kids: 2, kidsU6: 1, kidsAlter: true, einkommen: [{ art: 'lohn', b: 2500, n: 1916, p: 1 }], unterhalt: 100, miete: 600, mietstufe: '3', bezug: kg }, 'kiz');
  ck('DA-KiZ C.3.2 Patchwork: 500 € (amtlich 504 €)', eins(p) === 500, p);
}
const mia = (v) => karte({ adults: 1, kids: 1, kids14: 1, kidsAlter: true, kinder12: true, einkommen: [{ art: 'lohn', b: 1500, n: 1200, p: 1 }], unterhalt: 400, miete: 600, mietstufe: '3', vermoegen: v, bezug: kg }, 'kiz');
ck('DA-KiZ C.2.2.2 Mia: 120 € (amtlich 117 €)', eins(mia(0)) === 120, mia(0));
ck('DA-KiZ C.2.2.2 Mia: Vermögen 56.500 € (1.500 € über dem Freibetrag) -> nein', mia(56500).level === 'nein' && mia(56500).hl === 'vermHoch');

// ---------- 9-11: Grundsicherungsgeld ----------
{
  const pers = [{ rolle: 'erw', alter: 34, brutto: 500, netto: 400 }, { rolle: 'erw', alter: 31, sonstiges: 180 }, { rolle: 'kind', alter: 7 }];
  const e = { personen: pers, warmwasserDezentral: true, miete: { tatsaechlich: 900, heizung: 90 }, bescheid: { regel: 1250, mehrWW: 24.92, kdu: 990, einkommen: 370, kindergeld: 250, zahlbetrag: 1644.92 } };
  const R23 = Object.assign({}, R, { RULES: Object.assign({}, R.RULES, { regelbedarf: { alleinstehend: 502, partner: 451, kind0: 318, kind: 348, kind14: 420, jungErwachsener: 402 }, kindergeld: 250 }) });
  const p23 = BSGB2.pruefe(e, R23).erwartet, p26 = BSGB2.pruefe(e, R).erwartet;
  ck('BG-Muster 2/2023 auf den Cent: Regel 1.250; Warmwasser 24,92; Einkommen 370; Kindergeld 250; Zahlbetrag 1.644,92',
    nah(p23.regel, 1250) && nah(p23.mehrWW, 24.92) && nah(p23.einkommen, 370) && nah(p23.kindergeld, 250) && nah(p23.zahlbetrag, 1644.92), p23);
  const k = karte({ adults: 2, kids: 1, kidsAlter: true, einkommen: [{ art: 'lohn', b: 500, n: 400, p: 1 }, { art: 'alg', b: 180, p: 2 }], miete: 990, warmwasser: true, mietstufe: '5', gebJahr: 1988 }, 'ggeld');
  ck('BG-Muster mit Werten 2026: Check 1.790,96 €, App 1.790 €', nah(p26.zahlbetrag, 1790.96) && eins(k) === 1790, [p26.zahlbetrag, eins(k)]);
}
ck('MB-SGB2 9.2: Freibetrag Minijob 603 € = 208,90 €', nah(F(603, false), 208.9));
// Befund 2: Vermögen bei Paaren je Person (MB-SGB2 9.5: Paar 32 und 59 Jahre, Freibeträge 10.000 + 20.000 €)
{
  const paar = (v) => karte({ adults: 2, kids: 0, einkommen: [], miete: 600, mietstufe: '3', vermoegen: v, gebJahr: 1967 }, 'ggeld');
  ck('MB-SGB2 9.5: Paar, Vermögen 30.000 € -> nicht „nein“', paar(30000).level !== 'nein', paar(30000));
  ck('[gg-verm-paar] Paar, Vermögen 35.000 € -> nicht „wahrscheinlich“ (zweite Person kann jünger sein), Hinweis vorn', paar(35000).level === 'vielleicht' && keys(paar(35000))[0] === 'ggeld.vermAlter', paar(35000));
  ck('[gg-verm-paar] Paar, Vermögen 25.000 € (sicher frei: 20.000 + 5.000) -> „wahrscheinlich“ ohne Hinweis', paar(25000).level === 'ja' && !keys(paar(25000)).includes('ggeld.vermAlter'));
  ck('[gg-verm-paar] Paar, Vermögen 40.001 € -> nein', paar(40001).level === 'nein');
  ck('[gg-verm-paar] Allein, Vermögen 15.000 € ab 50 -> kein Paar-Hinweis', !keys(karte({ adults: 1, einkommen: [], miete: 600, mietstufe: '3', vermoegen: 15000, gebJahr: 1967 }, 'ggeld')).includes('ggeld.vermAlter'));
}

// ---------- 12-14: Grundsicherung im Alter ----------
{
  const k = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 690.59, n: 690.59, p: 1 }], miete: 380, mietstufe: '5', gebJahr: 1956, mzG: true, gdb: '50' }, 'gsa');
  const b = BGSA.pruefe({ personen: [{ mzG: true, renteNetto: 690.59 }], miete: { tatsaechlich: 330, heizung: 50 }, bescheid: {} }, R);
  ck('GSA-Han: App 350 €, Bedarf 1.039 €, Check 348,12 €', eins(k) === 350 && k.tx[0][1].bedarf.eur === 1039 && nah(b.erwartet.zahlbetrag, 348.12), [eins(k), k.tx[0][1], b.erwartet.zahlbetrag]);
  const k2 = karte({ adults: 1, kids: 0, einkommen: [{ art: 'rente', b: 550, n: 550, p: 1 }], miete: 300, mietstufe: '4', gebJahr: 1956, mzG: true, gdb: '50' }, 'gsa');
  const b2 = BGSA.pruefe({ personen: [{ mzG: true, renteNetto: 550 }], miete: { tatsaechlich: 250, heizung: 50 }, bescheid: {} }, R);
  ck('GSA-Bo a): App 410 €, Check 408,71 €', eins(k2) === 410 && nah(b2.erwartet.zahlbetrag, 408.71), [eins(k2), b2.erwartet.zahlbetrag]);
  const b3 = BGSA.pruefe({ personen: [{ mzG: true, renteNetto: 800 }, { mzG: true, renteNetto: 350 }], miete: { tatsaechlich: 260, heizung: 66 }, bescheid: {} }, R);
  ck('GSA-Bo b) Ehepaar, beide G: Check 360,04 €', nah(b3.erwartet.zahlbetrag, 360.04), b3.erwartet.zahlbetrag);
  // Befund 9: Die App fragt Merkzeichen G nur für eine Person -> bei Paaren Hinweis, dass der Betrag mit zwei Ausweisen höher ist
  const k3 = karte({ adults: 2, kids: 0, einkommen: [{ art: 'rente', b: 800, n: 800, p: 1 }, { art: 'rente', b: 350, n: 350, p: 2 }], miete: 326, mietstufe: '4', gebJahr: 1956, mzG: true, gdb: '50' }, 'gsa');
  const t = k3.tx.find((x) => x[0] === 'gsa.mzGBeide');
  ck('[gsa-g-paar] GSA Paar mit Merkzeichen G: Hinweis „bei beiden höher“ mit 17 % von 506 € (rund 86 €)', t && Math.abs(t[1].betrag.eur - 86.02) < 0.5, k3.tx);
  ck('[gsa-g-paar] GSA allein mit Merkzeichen G: kein Paar-Hinweis', !keys(k2).includes('gsa.mzGBeide'));
}

// ---------- 15-20: Wohngeld ----------
{
  ck('WG-Muster Frankfurt: zu berücksichtigende Miete 912,40 €', nah(R.wgMiete(6, 2, 900, 1, 110), 912.4));
  ck('WG-Muster Frankfurt: Wohngeld 355 € aus Miete 912,40 und Einkommen 1.503,85', Math.round(R.wgBetrag(2, 912.4, 1503.85)) === 355);
  const k = karte({ adults: 2, kids: 0, einkommen: [{ art: 'rente', b: 1470, n: 1300, p: 1 }, { art: 'alg', b: 620, p: 2 }], miete: 900, heizkosten: 110, mietstufe: '6', gebJahr: 1970, gdb: '100', grundrente33: true, erwerbsgemindert: true }, 'wohngeld');
  const b = betrag(k);
  ck('WG-Muster Frankfurt: App-Spanne enthält 355 €', b && b.a && b.b && b.a.eur <= 355 && b.b.eur >= 355, k.tx);
  // Befund 3: Bescheid-Check mit Grundrentenfreibetrag (§ 17a WoGG), Art „Rente mit 33 Jahren Grundrentenzeiten“
  const f = { personen: 2, stufe: 6, bruttokalt: 790, schwerbehindert: 1, mitglieder: [{ art: 'rente33', brutto: 1470, abzug: 10 }, { art: 'alg', brutto: 620, abzug: 0 }] };
  const c = BWG.rechne(f, R);
  ck('[bwg-17a] Bescheid-Check Frankfurt mit § 17a WoGG: Einkommen 1.503,85 €, Wohngeld 355 €', nah(c.einkommen, 1503.85) && c.wohngeld === 355, c);
  const c2 = BWG.rechne(Object.assign({}, f, { mitglieder: [{ art: 'rente', grundrente33: true, brutto: 1470, abzug: 10 }, f.mitglieder[1]] }), R);
  ck('[bwg-17a] Bescheid-Check: grundrente33 als Merkmal wirkt wie Art rente33', c2.wohngeld === 355, c2);
  const p = BWG.pruefe(Object.assign({}, f, { bescheid: { miete: 912.4, einkommen: 1503.85, wohngeld: 355 } }), R);
  ck('[bwg-17a] Bescheid-Check Frankfurt: alle Posten „passt“', p.posten.every((x) => x.wirkung === 'passt'), p.posten);
  ck('[bwg-17a] Ohne Grundrentenzeiten weiter 207 € (Freibetrag nur mit Angabe)', BWG.rechne(Object.assign({}, f, { mitglieder: [{ art: 'rente', brutto: 1470, abzug: 10 }, f.mitglieder[1]] }), R).wohngeld === 207);
}
{
  // WG-Han: Rente brutto, Werbungskosten-Pauschbetrag 102 €/Jahr (8,50 €), 10 % Abzug, GdB 100: 150 € Freibetrag; Mietenstufe V
  const han = (nP, rente, kalt, sb) => Math.round(R.wgBetrag(nP, Math.min(kalt, R.wgCap(5, nP)) + R.wgHeiz(nP), (rente - 8.5) * 0.9 - (sb ? 150 : 0)));
  ck('WG-Han: 349 / 422 / 412 €', han(1, 1000, 540, 0) === 349 && han(1, 1000, 540, 1) === 422 && han(2, 1300, 600, 0) === 412, [han(1, 1000, 540, 0), han(1, 1000, 540, 1), han(2, 1300, 600, 0)]);
}
{
  // WG-Muc / Befund 8: Einkommensgrenze = Einkommen, bei dem das Wohngeld 9,50 € erreicht (gerundet 10 €, § 21 Nr. 1 WoGG)
  const MUC = [1619, 2181, 2717, 3671, 4200, 4717];
  const y = (nP) => { const M = R.wgCap(7, nP) + R.wgHeiz(nP); let lo = 0, hi = 10000; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (R.wgBetrag(nP, M, mid) > 9.5) lo = mid; else hi = mid; } return lo; };
  ck('WG-Muc: Einkommensgrenzen 1-6 Personen (Wohngeld 9,50 €) = 1.619 / 2.181 / 2.717 / 3.671 / 4.200 / 4.717 €', MUC.every((v, i) => Math.floor(y(i + 1)) === v), MUC.map((v, i) => y(i + 1)));
  ck('[wg-grenze10] Angezeigte Grenze (wgYmax) trifft die Münchner Werte auf 1,5 €', MUC.every((v, i) => Math.abs(R.wgYmax(i + 1, R.wgCap(7, i + 1) + R.wgHeiz(i + 1)) - v) <= 1.5), MUC.map((v, i) => R.wgYmax(i + 1, R.wgCap(7, i + 1) + R.wgHeiz(i + 1))));
}
{
  ck('WG-12: Höchstbetrag 12 Personen Stufe III 1.689,80 €; Wohngeld 1.204,9782 €', nah(R.wgCap(3, 12), 1689.8) && nah(R.wgBetrag(12, 1600 + R.wgHeiz(12), 4688.25), 1204.9782, 0.0001));
  // Befund 7: § 19 Abs. 3 WoGG: je Person über 12 plus 65 €
  ck('[wg-ueber12] WG-12: 14 Personen -> 1.205 + 2 × 65 = 1.335 €', R.wgUeber12(14, 1205, 1600 + R.wgHeiz(14)) === 1335);
  const c = BWG.rechne({ personen: 14, stufe: 3, bruttokalt: 1600, mitglieder: [{ art: 'alg', brutto: 4688.25, abzug: 0 }] }, R);
  ck('[wg-ueber12] Bescheid-Check 14 Personen: 1.335 €', c.wohngeld === 1335, c.wohngeld);
  ck('[wg-ueber12] Mehrbetrag höchstens bis zur Miete', R.wgUeber12(14, 900, 1000) === 1000 && R.wgUeber12(12, 900, 1000) === 900 && R.wgUeber12(14, 0, 1000) === 0);
}
{
  // Befund 1: Plausibilitätsprüfung Nr. 15.01 WoGVwV zählt das Wohngeld mit. 1 Person, Rente 800 brutto, Kaltmiete 420, Heizung 80, Stufe V:
  // Wohngeldstelle Hannover 342 €; SoLo vorher „Einkommen eher zu niedrig“ ohne Betrag.
  const han = (nP, rente, kalt, gdb) => karte({ adults: nP, kids: 0, einkommen: [{ art: 'rente', b: rente, n: rente * 0.88, p: 1 }], miete: kalt + 80, heizkosten: 80, mietstufe: '5', gebJahr: 1955, gdb: gdb ? '100' : '' }, 'wohngeld');
  const k = han(1, 800, 420, 0), b = betrag(k);
  ck('[wg-plaus] WG-Han 1 Person, Rente 800: nicht „Einkommen eher zu niedrig“, Betrag um 340-350 €', k.hl !== 'einkoNiedrig' && b && b.a && b.a.eur >= 330 && b.a.eur <= 350, k);
  const alle = [[1, 800, 420, 0, 342], [1, 1000, 540, 0, 349], [1, 800, 420, 1, 402], [1, 1000, 540, 1, 422], [2, 1300, 600, 0, 412]];
  ck('[wg-plaus] Alle fünf Hannover-Haushalte: Betrag sichtbar und amtlicher Wert in Reichweite (± 10 € bzw. in der Spanne)', alle.every(([nP, r, kalt, g, soll]) => {
    const x = betrag(han(nP, r, kalt, g)); return x && x.a && x.a.eur - 10 <= soll && (x.b ? x.b.eur : x.a.eur) + 10 >= soll && han(nP, r, kalt, g).hl !== 'einkoNiedrig';
  }), alle.map(([nP, r, kalt, g]) => han(nP, r, kalt, g).tx));
  // Gegenprobe WG-Plaus (Beispiel 2020): Einnahmen + Wohngeld decken die Miete, aber weniger als 80 % des Regelbedarfs -> „möglich“, Betrag bleibt
  const tief = karte({ adults: 1, einkommen: [{ art: 'rente', b: 300, n: 290, p: 1 }], miete: 500, heizkosten: 80, mietstufe: '5', gebJahr: 1955 }, 'wohngeld');
  ck('[wg-plaus] Rente 300 €: „Einkommen eher zu niedrig“ (keine Ablehnung), Betrag bleibt sichtbar', tief.level === 'vielleicht' && tief.hl === 'einkoNiedrig' && !!betrag(tief), tief);
}

// ---------- 21-22: Elterngeld, Mehrbedarf Alleinerziehende ----------
{
  const eg = (v) => karte({ baby: 'bald', egVor: v, art1: 'lohn', brutto: 2000, netto: 1500, kids: 0 }, 'elterngeld').tx[0][1];
  ck('EG-Br 1.4.1/1.7: Elterngeld-Netto 2.000 € -> 1.300 €, 1.000 € -> 670 € (Eingabe mit 83,33 € Pauschale)', eg(2083.33).basis.eur === 1300 && eg(1083.33).basis.eur === 670, [eg(2083.33), eg(1083.33)]);
  const ae = (kids, u6, k14) => R.derive({ adults: 1, kids, kidsU6: u6 || 0, kids14: k14 || 0, kidsAlter: true }).mehrAE;
  ck('AE-2026: Mehrbedarf Alleinerziehende 67,56 / 202,68 / 270,24 / 337,80 €', nah(ae(1, 0, 1), 67.56) && nah(ae(1, 1, 0), 202.68) && nah(ae(4, 0, 0), 270.24) && nah(ae(5, 0, 0), 337.8), [ae(1, 0, 1), ae(1, 1, 0), ae(4, 0, 0), ae(5, 0, 0)]);
}

// ---------- Regressionstests Kinderzuschlag (Befunde 4-6) ----------
{
  // Befund 4: Statt fester 300 € die eigene Wohngeld-Schätzung plus erweiterter Zugang (§ 6a Abs. 1a BKGG: höchstens 100 € dürfen fehlen).
  // KiZ-MB 1.4: 1.800 € brutto, 1.030 € zu berücksichtigen, Wohngeld 600 € -> Anspruch, 594 €
  const k = karte(famA(1800, 1030), 'kiz');
  ck('[kiz-wg-schaetz] KiZ-MB 1.4 erweiterter Zugang: nicht „Einkommen eher zu niedrig“, 590 €', k.hl !== 'einkoNiedrig' && k.level !== 'nein' && eins(k) === 590, k);
  // Befund 5: Vermögen knapp über der Grenze mindert nur den 1. Monat (§ 6a Abs. 3 Satz 7 BKGG; DA-KiZ C.2.2.2: 100 € darüber -> 1. Monat 17 €, danach 117 €)
  const m = mia(55100);
  ck('[kiz-verm-knapp] Mia, 100 € über dem Freibetrag: „möglich“ mit Hinweis, Betrag 120 €', m.level === 'vielleicht' && keys(m)[0] === 'kiz.vermKnapp' && eins(m) === 120, m);
  ck('[kiz-verm-knapp] Mia, 200 € über dem Freibetrag (mehr als der Monatsbetrag) -> nein', mia(55200).level === 'nein');
  // Befund 6: DA-KiZ D.2 Bsp. 2: alleinerziehender Altersrentner 900 €, Kind 16, Miete 360 € -> 238 €
  const r = karte({ adults: 1, kids: 1, kids14: 1, kidsAlter: true, kinder12: true, einkommen: [{ art: 'rente', b: 900, n: 900, p: 1 }], miete: 360, mietstufe: '3', gebJahr: 1958, bezug: kg }, 'kiz');
  ck('[kiz-rentner-kopf] DA-KiZ D.2 Bsp. 2: 240 € (amtlich 238 €), Hinweis Kind ab 15', eins(r) === 240 && keys(r)[0] === 'kiz.nurAb15', r);
  // DA-KiZ D.2 Bsp. 1 (Paar, Vater Altersrente 1.350 €, Mutter ohne Einkommen) bleibt bei der Tabelle: 560 € (amtlich 561 €)
  const p = karte({ adults: 2, kids: 2, kidsAlter: true, einkommen: [{ art: 'rente', b: 1350, n: 1350, p: 1 }], miete: 380, mietstufe: '3', gebJahr: 1958, bezug: kg }, 'kiz');
  ck('[kiz-rentner-kopf] DA-KiZ D.2 Bsp. 1: 560 € (amtlich 561 €)', eins(p) === 560, p);
}

console.log((fails ? 'FEHLER' : 'ok') + ' – Musterbescheide und amtliche Beispiele: ' + (n - fails) + '/' + n + ' bestanden');
process.exit(fails ? 1 : 0);
