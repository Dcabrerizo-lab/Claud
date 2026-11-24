// Zweites Einkommen auch für Paare: Einkommensliste mit Person (p: 1 | 2). Musterfälle mit von Hand gerechneten Werten
// (Entwurf docs/entwuerfe/paar-einkommen.md, Abschnitt 4.6, geprüft 20.11.2026). Quellen (abgerufen 20.11.2026):
//  - § 11b Abs. 2, 3 SGB II (Freibetrag für Arbeit je erwerbstätiger Person; BA-FW §§ 11-11b Rz. 11.144; mehrere Jobs einer Person
//    addiert, ein Freibetrag: Rz. 11.15; Versicherungspauschale bei Lohn unter 30 € nur der Rest: Rz. 11.155)
//  - § 6 Abs. 1 Nr. 1 GrusiGV (Versicherungspauschale 30 € je volljähriger Person)
//  - § 82 Abs. 3 SGB XII (30 %, höchstens 50 % RS 1 = 281,50 €, je Person)
//  - §§ 14, 16 WoGG, § 9a EStG (Werbungskosten-Pauschbetrag einmal je Person; § 16-Abzug je Person für ihr ganzes Einkommen, WoGVwV 16.11-16.13)
//  - § 6a Abs. 1 Nr. 2, Abs. 6 BKGG (Mindesteinkommen 900 € ohne § 11b, Minderung 45 % / 100 %)
'use strict';
// Grenzen seit 21.11.2026 mit der 10-€-Schwelle (§ 21 Nr. 1 WoGG, gerundet ab 9,50 €), daher rund 25 € niedriger als vorher
const R = require('./rules-de.js');
// ohneWege: Beträge je Leistung (Handrechnungen), ohne die Lage der zwei Wege (eigene Tests in test/test.js)
const base = { ohneWege: true,  kids: 0, young: 0, vermoegen: 0, bezug: {}, gebJahr: 1985, heute: 2026.9 };
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const run = (o) => { const r = R.evaluate({ ...base, ...o }); const m = { _h: r.h }; r.results.forEach((x) => { m[x.id] = x; }); return m; };
const t = (x, re) => x.tx.find((a) => re.test(a[0]));
const sch = (x) => { const a = t(x, /^schaetz\./); return a ? a[1] : null; };
const E = (x) => Math.round(x).toLocaleString('de-DE') + ' €';
const grenze = (x) => { const a = t(x, /^wohngeld\.grenze/); return a ? [a[1].lo, a[1].hi] : null; };
const P = (p, art, b, nn) => (nn == null ? { p, art, b } : { p, art, b, n: nn });

// F1 Paar + Kind, P1 Lohn 1.200 + Unterhalt 300, P2 Lohn 1.800: Freibetrag 348 + 378 = 726 (je Person); Lücke 219; KiZ 263,92
let m = run({ adults: 2, kids: 1, miete: 950, einkommen: [P(1, 'lohn', 1200, 950), P(1, 'unt', 300), P(2, 'lohn', 1800, 1350)] });
ck('[paar-ek] F1 brutto2 = 1.800 (Summe Person 2)', m._h.brutto2 === 1800, m._h.brutto2);
ck('F1 Freibetrag je Person 348 + 378 = 726', Math.abs(R.haushaltsFreibetrag(m._h) - 726) < 0.01, R.haushaltsFreibetrag(m._h));
ck('F1 Grundsicherungsgeld ≈ 240 € (Lücke 219 + 25 € Sofortzuschlag, § 72 SGB II)', m.ggeld.level === 'ja' && sch(m.ggeld).a === E(240), m.ggeld.tx);
ck('F1 Kinderzuschlag ≈ 260 €', m.kiz.level === 'ja' && sch(m.kiz).a === E(260), m.kiz.tx);

// F2 Paar, P1 Lohn 2.000 + Lohn 300 (ein Freibetrag aus 2.300), P2 Minijob 603
m = run({ adults: 2, miete: 800, mietstufe: '3', einkommen: [P(1, 'lohn', 2000, 1480), P(1, 'lohn', 300), P(2, 'lohn', 603, 603)] });
ck('[paar-ek] F2 Freibetrag 348 + 208,90 = 556,90', Math.abs(R.haushaltsFreibetrag(m._h) - 556.9) < 0.01, R.haushaltsFreibetrag(m._h));
ck('F2 Grundsicherungsgeld möglich (Lücke −14,10)', m.ggeld.level === 'vielleicht', m.ggeld.level);
ck('F2 Wohngeld: Werbungskosten P1 einmal, lo 2.442 / hi 3.116, bis 80 €', JSON.stringify(grenze(m.wohngeld)) === JSON.stringify([E(2442), E(3116)]) && sch(m.wohngeld).b === E(80), m.wohngeld.tx);
// F2b Gegenprobe: Minijob 300 bei Person 2
m = run({ adults: 2, miete: 800, mietstufe: '3', einkommen: [P(1, 'lohn', 2000, 1480), P(2, 'lohn', 603, 603), P(2, 'lohn', 300)] });
ck('[paar-ek] F2b Freibetrag 348 + 298,90 = 646,90; Grundsicherungsgeld ≈ 80 €', Math.abs(R.haushaltsFreibetrag(m._h) - 646.9) < 0.01 && m.ggeld.level === 'ja' && sch(m.ggeld).a === E(80), m.ggeld.tx);

// F3 Rentnerpaar, P1 Rente 800 + Minijob 300 (30 % = 90 € frei, § 82 Abs. 3 SGB XII), P2 Rente 650: Lücke 102
m = run({ adults: 2, gebJahr: 1950, miete: 750, einkommen: [P(1, 'rente', 910, 800), P(1, 'lohn', 300), P(2, 'rente', 740, 650)] });
ck('[paar-ek] F3 Grundsicherung im Alter ≈ 100 €', m.gsa.level === 'ja' && sch(m.gsa).a === E(100), m.gsa.tx);

// F3b SGB-XII-Freibetrag je Person, nicht je Einkommen: P1 Rente 400 + zwei Löhne je 900 (Zahlbetrag) → 30 % von 1.800 = 540,
//   gedeckelt auf 281,50 (50 % RS 1) einmal; P2 Rente 600. Bedarf 1.012 + 900 = 1.912; Einkommen 400 + 1.800 − 281,50 + 600 = 2.518,50
//   → kein Anspruch. Je Einkommen gedeckelt (270 + 270 = 540) wären es 2.260 → ebenfalls kein Anspruch; deshalb mit höherer Miete:
//   Miete 1.500 → Bedarf 2.512: je Person 2.518,50 > 2.512 (kein Betrag), je Einkommen 2.260 < 2.512 (≈ 250 €)
m = run({ adults: 2, gebJahr: 1950, miete: 1500, einkommen: [P(1, 'rente', 450, 400), P(1, 'lohn', 900, 900), P(1, 'lohn', 900), P(2, 'rente', 680, 600)] });
ck('[paar-ek] F3b SGB-XII-Freibetrag für Arbeit einmal je Person (281,50 €): keine Lücke', !sch(m.gsa) || m.gsa.level === 'nein', m.gsa);

// F4 Paar + 2 Kinder, P1 ALG I 1.100 + Nebenjob 165 (Freibetrag 113, keine Pauschale), P2 Lohn 1.400 (368): Lücke 377; KiZ 530,10
m = run({ adults: 2, kids: 2, kidsU6: 1, miete: 1000, einkommen: [P(1, 'alg', 1100), P(1, 'lohn', 165), P(2, 'lohn', 1400, 1080)] });
ck('[paar-ek] F4 Freibetrag 113 + 368 = 481, keine Versicherungspauschale', Math.abs(R.haushaltsFreibetrag(m._h) - 481) < 0.01 && m._h.vPausch === 0, [R.haushaltsFreibetrag(m._h), m._h.vPausch]);
ck('F4 Grundsicherungsgeld ≈ 430 € (Lücke 377 + 2 × 25 € Sofortzuschlag)', m.ggeld.level === 'ja' && sch(m.ggeld).a === E(430), m.ggeld.tx);
ck('F4 Kinderzuschlag ≈ 530 €', m.kiz.level === 'ja' && sch(m.kiz).a === E(530), m.kiz.tx);
ck('F4 Arbeitslosengeld: „beziehst du schon“', m.alg1.level === 'na', m.alg1.level);

// F5 Mindesteinkommen KiZ: 300 + 200 (Unterhalt zählt mit) + 400 = 900 €
m = run({ adults: 2, kids: 1, miete: 900, einkommen: [P(1, 'lohn', 300), P(1, 'unt', 200), P(2, 'lohn', 400, 400)] });
ck('[paar-ek] F5 Kinderzuschlag nicht minEink (900 € erreicht)', m.kiz.hl !== 'minEink' && m.kiz.level === 'vielleicht' && m.kiz.hl === 'einkoNiedrig', [m.kiz.level, m.kiz.hl]);
ck('F5 Grundsicherungsgeld ≈ 1.470 € (mit 25 € Sofortzuschlag)', m.ggeld.level === 'ja' && sch(m.ggeld).a === E(1470), m.ggeld.tx);
m = run({ adults: 2, kids: 1, miete: 900, einkommen: [P(1, 'lohn', 300), P(1, 'unt', 150), P(2, 'lohn', 400, 400)] });
ck('[paar-ek] F5b 850 € < 900 €: minEink', m.kiz.level === 'nein' && m.kiz.hl === 'minEink', [m.kiz.level, m.kiz.hl]);

// F6 Wohngeld, § 16 je Person: Unterhalt bei P1 (Lohn mit voller Sozialversicherung) für „möglich“ mit 30 %
m = run({ adults: 2, miete: 700, mietstufe: '3', einkommen: [P(1, 'lohn', 1500, 1150), P(1, 'unt', 300), P(2, 'rente', 1000, 890)] });
ck('[paar-ek] F6 Wohngeld möglich, lo 2.290 / hi 2.868, bis 30 €', m.wohngeld.level === 'vielleicht' && JSON.stringify(grenze(m.wohngeld)) === JSON.stringify([E(2290), E(2868)]) && sch(m.wohngeld).b === E(30), m.wohngeld.tx);

// F7 kleiner Lohn 80 €: Grundabsetzbetrag deckt die Pauschale (Rz. 11.155), keine 30 € extra
m = run({ adults: 2, miete: 700, einkommen: [P(1, 'lohn', 80, 80), P(1, 'unt', 400), P(2, 'ohne', 0)] });
ck('[paar-ek] F7 vPausch 0, Grundsicherungsgeld ≈ 1.310 €', m._h.vPausch === 0 && m.ggeld.level === 'ja' && sch(m.ggeld).a === E(1310), [m._h.vPausch, m.ggeld.tx]);
// F7b Lohn 20 €: vom Unterhalt gehen noch 30 − 20 = 10 € ab (Entscheidung 20.11.2026, Rz. 11.155)
//   Bedarf 1.712; 420 − 20 (Freibetrag) − 10 = 390 → Lücke 1.322 → 1.320 €
m = run({ adults: 2, miete: 700, einkommen: [P(1, 'lohn', 20, 20), P(1, 'unt', 400), P(2, 'ohne', 0)] });
ck('[paar-ek] F7b vPausch = 30 − 20 = 10, Grundsicherungsgeld ≈ 1.320 €', m._h.vPausch === 10 && sch(m.ggeld).a === E(1320), [m._h.vPausch, m.ggeld.tx]);
// Person ohne Lohn mit Rente: volle 30 € (je Person, auch wenn die andere Person Lohn hat)
m = run({ adults: 2, miete: 700, einkommen: [P(1, 'lohn', 1500, 1150), P(2, 'rente', 500, 450)] });
ck('[paar-ek] Versicherungspauschale 30 € für Person 2 ohne Lohn', m._h.vPausch === 30, m._h.vPausch);

// F8 Elterngeld 600 + Teilzeit 450 (P1), Lohn 2.100 (P2): Freibetrag 170 + 378, Elterngeld-Freibetrag 300 (Basiselterngeld) → Lücke 178; KiZ 267,97.
// ElterngeldPlus möglich (App fragt nicht): Freibetrag nur 150 € (§ 10 Abs. 5 Satz 3 BEEG) → Lücke 28: Grundsicherungsgeld „möglich“, KiZ 200 bis 270 €
m = run({ adults: 2, kids: 1, kidsU6: 1, miete: 850, einkommen: [P(1, 'eg', 600), P(1, 'lohn', 450, 450), P(2, 'lohn', 2100, 1580)] });
ck('[paar-ek] F8 Grundsicherungsgeld möglich, Kinderzuschlag ≈ 200 bis 270 €', m.ggeld.level === 'vielleicht' && m.kiz.level === 'ja' && sch(m.kiz).a === E(200) && sch(m.kiz).b === E(270), [m.ggeld.tx, m.kiz.tx]);

// F9 Regression allein, Liste ohne p: wie bisher
m = run({ adults: 1, miete: 500, einkommen: [{ art: 'lohn', b: 1200, n: 950 }, { art: 'unt', b: 300 }] });
ck('[paar-ek] F9 allein Lohn + Unterhalt: Grundsicherungsgeld ≈ 160 €', m.ggeld.level === 'ja' && sch(m.ggeld).a === E(160), m.ggeld.tx);
// p: 2 zählt bei einer Person nicht als zweite Person
m = run({ adults: 1, miete: 500, einkommen: [{ art: 'lohn', b: 1200, n: 950 }, { p: 2, art: 'unt', b: 300 }] });
ck('[paar-ek] allein: p 2 wird Person 1, brutto2 = 0', m._h.brutto2 === 0 && sch(m.ggeld).a === E(160), [m._h.brutto2, m.ggeld.tx]);

// F10 Rentnerpaar, zwei Renten bei P1 (zweites Einkommen nur Zahlbetrag): Renten-Pauschbetrag 102 € bei P1 nur einmal
m = run({ adults: 2, gebJahr: 1950, miete: 650, mietstufe: '2', einkommen: [P(1, 'rente', 790, 700), P(1, 'rente', 300), P(2, 'rente', 680, 600)] });
ck('[paar-ek] F10 Grundsicherung im Alter ≈ 60 €', m.gsa.level === 'ja' && sch(m.gsa).a === E(60), m.gsa.tx);
ck('F10 Wohngeld 170–260 €, lo 2.142 / hi 2.504', m.wohngeld.level === 'ja' && sch(m.wohngeld).a === E(170) && sch(m.wohngeld).b === E(260) && JSON.stringify(grenze(m.wohngeld)) === JSON.stringify([E(2142), E(2504)]), m.wohngeld.tx);

// F11 KiZ-Hinweis Rentnerpaar auch mit Liste (beide haben Rente)
m = run({ adults: 2, kids: 1, gebJahr: 1955, miete: 800, einkommen: [P(1, 'rente', 1000, 880), P(1, 'lohn', 200), P(2, 'rente', 800, 700)] });
ck('[paar-ek] F11 Kinderzuschlag möglich mit Hinweis Rentnerpaar', m.kiz.level === 'vielleicht' && !!t(m.kiz, /^kiz\.rentnerPaar$/), m.kiz.tx);
ck('F11 Grundsicherung im Alter ≈ 220 €', m.gsa.level === 'ja' && sch(m.gsa).a === E(220), m.gsa.tx);

// F12 P2 ALG I 300 + Nebenjob 200
m = run({ adults: 2, miete: 700, einkommen: [P(1, 'lohn', 2000, 1480), P(2, 'alg', 300), P(2, 'lohn', 200)] });
ck('F12 Arbeitslosengeld bei Person 2: „beziehst du schon“', m.alg1.level === 'na', m.alg1.level);

// Versicherungspauschale höchstens bis zur Höhe des anderen Einkommens: Unterhalt 20 € ohne Lohn -> 20, nicht 30
m = run({ adults: 2, miete: 700, einkommen: [P(1, 'unt', 20), P(2, 'ohne', 0)] });
ck('[paar-ek] Versicherungspauschale höchstens 20 € bei 20 € Unterhalt (Liste)', m._h.vPausch === 20, m._h.vPausch);
const vp = run({ adults: 1, miete: 500, art1: 'rente', brutto: 20, netto: 20 });
ck('[paar-ek] Versicherungspauschale höchstens 20 € bei 20 € Rente (ohne Liste)', vp._h.vPausch === 20, vp._h.vPausch);

// Krankengeld als zweites Einkommen (allein): Karte „beziehst du schon“
m = run({ adults: 1, miete: 500, einkommen: [{ art: 'lohn', b: 300, n: 300 }, { art: 'kg', b: 900 }] });
ck('[paar-ek] Krankengeld als zweites Einkommen: „beziehst du schon“', m.krankengeld.level === 'na', m.krankengeld.level);

// Ohne Liste (Summenfelder) bleibt alles wie bisher: Paar Lohn 1.800 / 1.200 brutto
const ohne = run({ adults: 2, kids: 1, miete: 950, art1: 'lohn', art2: 'lohn', brutto: 3000, brutto2: 1200, netto: 2300 });
ck('[paar-ek] ohne Liste: Freibetrag aus brutto − brutto2 und brutto2', Math.abs(R.haushaltsFreibetrag(ohne._h) - (R.sgb2Freibetrag(1800, true) + R.sgb2Freibetrag(1200, true))) < 0.01, R.haushaltsFreibetrag(ohne._h));

console.log(fails ? fails + ' von ' + n + ' Prüfungen FEHLGESCHLAGEN' : 'Zweites Einkommen für Paare: ' + n + ' Prüfungen bestanden');
process.exit(fails ? 1 : 0);
