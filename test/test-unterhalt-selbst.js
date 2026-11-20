// Unterhalt für die Person selbst (Einkommensart „unt“: Trennungs- oder Ehegattenunterhalt, Unterhalt von den Eltern).
// Musterfälle mit von Hand gerechneten Werten; Quellen (Stand 20.11.2026, gesetze-im-internet.de):
//  - SGB II: § 11 Abs. 1 SGB II (Unterhalt ist Einkommen), kein Freibetrag für Arbeit (§ 11b Abs. 3 nur Erwerbseinkommen),
//    Versicherungspauschale 30 € (§ 11b Abs. 1 Satz 1 Nr. 3 SGB II i. V. m. § 6 Abs. 1 Nr. 1 Bürgergeld-V)
//  - SGB XII: § 82 Abs. 1 SGB XII (alle Einkünfte in Geld), kein Freibetrag nach § 82 Abs. 3
//  - Wohngeld: § 14 Abs. 2 Nr. 19 und 20 WoGG (steuerfreier Unterhalt voll) bzw. § 22 Nr. 1a EStG mit 102 € Pauschbetrag
//    (§ 9a Satz 1 Nr. 3 EStG) bei Realsplitting; Pauschalabzug § 16 WoGG 0 % (familienversichert) bis 20 % (Steuer + KV/PV)
//  - Kinderzuschlag: § 6a Abs. 1 Nr. 2 BKGG (Mindesteinkommen = Einkommen nach § 11 Abs. 1 Satz 1 und 2 SGB II, also auch
//    Unterhalt), § 6a Abs. 6 BKGG (anderes Einkommen mindert in voller Höhe, Überschreitung gilt zuerst als Erwerbseinkommen)
//  - BAföG: § 21 Abs. 1 BAföG (positive Einkünfte nach § 2 EStG; Unterhalt nur mit Realsplitting)
'use strict';
const R = require('./rules-de.js');
const RR = R.RULES;
const base = { adults: 1, kids: 0, young: 0, brutto: 0, brutto2: 0, netto: '', miete: 0, vermoegen: 0, bezug: {}, gebJahr: 1985, heute: 2026.9 };
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const ev = (o) => { const r = R.evaluate({ ...base, ...o }); const m = {}; r.results.forEach((x) => { m[x.id] = x; }); return m; };
const sch = (x) => { const t = x.tx.find((a) => /^schaetz\./.test(a[0])); return t ? t[1] : null; };
const E = (x) => Math.round(x).toLocaleString('de-DE') + ' €';
const r10 = (x) => Math.round(x / 10) * 10;

// 1 Grundsicherungsgeld: allein, Trennungsunterhalt 400 €, Warmmiete 500 €
//   Bedarf 563 + 500 = 1.063 €; Einkommen 400 - 30 (Versicherungspauschale) = 370 €; Lücke 693 € -> etwa 690 €
const f1 = { miete: 500, einkommen: [{ art: 'unt', b: 400 }] };
let m = ev(f1);
ck('[unt-sgb2] F1 Grundsicherungsgeld wahrscheinlich, Bedarf 1.063 €', m.ggeld.level === 'ja' && m.ggeld.tx[0][1].bedarf === E(1063), m.ggeld.tx);
ck('[unt-sgb2] F1 Lücke 1.063 - (400 - 30) = 693 -> 690 €', sch(m.ggeld) && sch(m.ggeld).a === E(690), m.ggeld.tx);
// Gegenprobe: 400 € Lohn hätte den Freibetrag 100 + 20 % von 300 = 160 € -> Lücke 1.063 - 240 = 823 -> 820 €
ck('F1 Gegenprobe Lohn 400 € mit Freibetrag: 820 €', sch(ev({ miete: 500, einkommen: [{ art: 'lohn', b: 400, n: 400 }] }).ggeld).a === E(820));
// Ausführliche Version (Formular: Art unt, Betrag = Brutto = Netto, wie syncEinkommen) rechnet gleich
ck('F1 Formular gleich wie Liste', sch(ev({ miete: 500, art1: 'unt', brutto: 400, netto: 400 }).ggeld).a === E(690));
// Netto: keine Lohnsteuer- oder Beitragsschätzung, auch ohne eingetragenes Netto
ck('F1 Netto ohne Schätzung = Zahlbetrag', R.evaluate({ ...base, miete: 500, art1: 'unt', brutto: 400, netto: '' }).h.netto === 400);

// 2 Grundsicherung im Alter: geboren 1950, Rente 400 € (Zahlbetrag), Ehegattenunterhalt 200 €, Miete 500 €
//   Bedarf 563 + 500 = 1.063 €; Einkommen 400 + 200 = 600 € (kein Freibetrag); Lücke 463 -> 460 €
const f2 = { gebJahr: 1950, miete: 500, einkommen: [{ art: 'rente', b: 400, n: 400 }, { art: 'unt', b: 200 }] };
m = ev(f2);
ck('[unt-sgb12] F2 Grundsicherung im Alter: Lücke 1.063 - 600 = 463 -> 460 €', m.gsa.level === 'ja' && m.gsa.tx[0][1].bedarf === E(1063) && sch(m.gsa).a === E(460), m.gsa.tx);

// 3 Wohngeld: allein, Unterhalt 1.000 €, Miete 600 €, Mietenstufe III
//   „wahrscheinlich“ (vorsichtig): steuerfrei, familienversichert -> Y = 1.000 € (0 % Abzug, kein Pauschbetrag)
//   „möglich“: Realsplitting -> (1.000 - 102/12) × (1 - 20 %) = 793,20 €
const M3 = R.wgMiete(3, 1, 600, 1, 0);
const wgA = r10(R.wgBetrag(1, M3, 1000)), wgB = r10(R.wgBetrag(1, M3, (1000 - 102 / 12) * 0.8));
m = ev({ miete: 600, mietstufe: '3', einkommen: [{ art: 'unt', b: 1000 }] });
ck('[unt-wg] F3 Wohngeld Spanne mit Y 1.000 € bzw. 793,20 €', sch(m.wohngeld) && sch(m.wohngeld).a === E(wgA) && sch(m.wohngeld).b === E(wgB), [m.wohngeld.tx, wgA, wgB]);
ck('F3 Werte in der Rechnung: § 16 WoGG 0 bis 20 %, 102 € Pauschbetrag', RR.wgAbzug.unt[0] === 0 && RR.wgAbzug.unt[1] === 0.2 && RR.wgWerbung.rente === 102);

// 4 Kinderzuschlag: alleinerziehend, ein Kind unter 6, Miete 700 €
//   a) nur Unterhalt 650 €: zählt für das Mindesteinkommen 600 € (§ 6a Abs. 1 Nr. 2 BKGG), 550 € reicht nicht
ck('[unt-kiz] F4a Unterhalt 650 € erfüllt das Mindesteinkommen', ev({ kids: 1, kidsU6: 1, miete: 700, einkommen: [{ art: 'unt', b: 650 }] }).kiz.hl !== 'minEink');
ck('F4a Unterhalt 550 € unter dem Mindesteinkommen', ev({ kids: 1, kidsU6: 1, miete: 700, einkommen: [{ art: 'unt', b: 550 }] }).kiz.hl === 'minEink');
//   b) Lohn 2.000 brutto / 1.500 netto + Unterhalt 300 €: Freibetrag 100 + 84 + 144 + 50 = 378 €, Einkommen 1.422 €;
//      Bedarf Eltern 563 + 36 % × 563 (202,68) + 700 × 0,77 (539) = 1.304,68 €; Unterhalt 300 € allein unter dem Bedarf ->
//      Überschreitung 117,32 € gilt als Erwerbseinkommen -> 45 %: 52,79 €; 297 - 52,79 = 244,21 -> 240 €
m = ev({ kids: 1, kidsU6: 1, miete: 700, einkommen: [{ art: 'lohn', b: 2000, n: 1500 }, { art: 'unt', b: 300 }] });
ck('[unt-kiz] F4b Kinderzuschlag 297 - 0,45 × 117,32 -> 240 €', m.kiz.level === 'ja' && sch(m.kiz).a === E(240), m.kiz.tx);
//   c) Minijob 600 € + Unterhalt 1.400 €: Freibetrag 100 + 84 + 24 = 208 €, Einkommen 1.792 €; Unterhalt allein 1.400 € über dem
//      Bedarf 1.304,68 € -> 95,32 € voll + 45 % von 392 € (176,40 €) = 271,72 €; 297 - 271,72 = 25,28 -> „möglich“, etwa 30 €
m = ev({ kids: 1, kidsU6: 1, miete: 700, einkommen: [{ art: 'lohn', b: 600, n: 600 }, { art: 'unt', b: 1400 }] });
ck('[unt-kiz] F4c Unterhalt über dem Bedarf mindert voll: etwa 30 €', m.kiz.level === 'vielleicht' && sch(m.kiz) && sch(m.kiz).a === E(30), m.kiz.tx);

// 5 BAföG (Kind studiert): Paar, ein Kind, Netto 3.500 € Lohn + 800 € Unterhalt eines Elternteils
//   Freibetrag 2.540 € + Spanne 1.200 € = 3.740 €: mit Unterhalt 4.300 € darüber, ohne 3.500 € darunter -> „möglich“
const f5 = { adults: 2, kids: 1, ausbildung: 'kind', art1: 'lohn', art2: 'unt', brutto: 5800, brutto2: 800, netto: 4300 };
ck('[unt-bafoeg] F5 BAföG möglich (Unterhalt zählt nur mit Realsplitting)', ev(f5).bafoeg.level === 'vielleicht');
ck('F5 Gegenprobe Rente 800 €: unwahrscheinlich', ev({ ...f5, art2: 'rente' }).bafoeg.level === 'nein');

console.log(fails ? fails + ' von ' + n + ' Prüfungen fehlgeschlagen (Unterhalt für sich selbst)' : 'Unterhalt für sich selbst: ' + n + ' Prüfungen bestanden');
if (fails) process.exit(1);
