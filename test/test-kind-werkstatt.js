// Grundsicherungsgeld, wenn nur ein erwachsenes Kind voll erwerbsgemindert ist (Werkstatt-Haken bei „Kind ab 18“).
// Das Kind bekommt eigene Grundsicherung (§ 41 Abs. 3 SGB XII) und ist vom Sozialgeld ausgeschlossen (§ 5 Abs. 2 Satz 2,
// § 19 Abs. 1 Satz 2 SGB II). Der erwerbsfähige Elternteil bleibt beim Jobcenter leistungsberechtigt (§ 7 Abs. 1 Satz 1 SGB II).
// Bis 24.11.2026 sagte die App Alleinerziehenden in diesem Fall „nein, Sozialamt zuständig“. Quellen: gesetze-im-internet.de
// (sgb_2/__5.html, __7.html, __19.html; sgb_12/__41.html), Abruf 24.11.2026.
'use strict';
const R = require('./rules-de.js');
const base = { ohneWege: true, kids: 0, young: 0, vermoegen: 0, bezug: {}, heute: 2026.9, miete: 700, gebJahr: 1975 };
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const run = (o) => { const m = {}; R.evaluate({ ...base, ...o }).results.forEach((x) => { m[x.id] = x; }); return m; };
const hat = (x, k) => x.tx.some((a) => a[0] === k);

// 1) Alleinerziehend, erwachsenes Kind (22) in der Werkstatt, wenig Einkommen: kein „nein“, höchstens „möglich“, Hinweis eigene Grundsicherung
let m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('[kind-werkstatt] Alleinerziehend + Kind in Werkstatt: ggeld nicht „nein“', m.ggeld.level === 'vielleicht', m.ggeld);
ck('Alleinerziehend + Kind in Werkstatt: Hinweis ggeld.kindGsa', hat(m.ggeld, 'ggeld.kindGsa'), m.ggeld.tx);
ck('Alleinerziehend + Kind in Werkstatt: nicht „Sozialamt zuständig“', !hat(m.ggeld, 'ggeld.sozialamtZustaendig'), m.ggeld.tx);
ck('Alleinerziehend + Kind in Werkstatt: Grundsicherung (fürs Kind) nicht „nein“', m.gsa.level !== 'nein', m.gsa);

// 2) Hohes Einkommen: weiterhin „nein“ wegen Einkommen (keine falsche Zusage)
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 4000, brutto: 6000, art1: 'lohn' });
ck('Alleinerziehend + Kind in Werkstatt, hohes Einkommen: ggeld nein', m.ggeld.level === 'nein', m.ggeld);

// 3) Elternteil selbst voll erwerbsgemindert (Werkstatt ohne Angabe „Kind mit Behinderung“): unverändert „nein, Sozialamt zuständig“
m = run({ adults: 1, wfbm: true, netto: 300, brutto: 300 });
ck('[kind-werkstatt] Einzelperson in Werkstatt: ggeld nein, Sozialamt', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamtZustaendig'), m.ggeld);
m = run({ adults: 1, emStd: 'unter3', netto: 300, brutto: 300 });
ck('Einzelperson unter 3 Stunden: ggeld nein, Sozialamt', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamtZustaendig'), m.ggeld);

// 4) Kind unter 18 in der Werkstatt (selten): Grundsicherungsgeld auch fürs Kind (§ 19 Abs. 1 Satz 2, § 23 SGB II; früher „Sozialgeld“),
//    Elternteil beim Jobcenter, kein Grundsicherungs-Hinweis fürs Kind
m = run({ adults: 1, kids: 1, kids14: 1, bhPerson: 'minder', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('Alleinerziehend + Kind unter 18 in Werkstatt: ggeld nicht „nein“', m.ggeld.level !== 'nein', m.ggeld);
ck('Alleinerziehend + Kind unter 18: kein Hinweis ggeld.kindGsa', !hat(m.ggeld, 'ggeld.kindGsa'), m.ggeld.tx);

// ---- Unabhängige Prüfung 24.11.2026 ----
// 5) Kein Betrag und keine Bedarfszeile beim Grundsicherungsgeld: beide enthielten das Kind, das Jobcenter rechnet meist ohne es
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('Alleinerziehend + Kind in Werkstatt: ggeld ohne Betrag und ohne Bedarfszeile', !m.ggeld.tx.some((a) => a[0].indexOf('schaetz.') === 0 || a[0].indexOf('bedarf') === 0), m.ggeld.tx);
// 6) Grundsicherung bei Erwerbsminderung ist die Leistung des Kindes allein (§ 43 Abs. 1, 5, § 94 Abs. 1a SGB XII): „möglich“ ohne Haushaltsbetrag,
//    auch bei gut verdienendem Elternteil und bei Vermögen der Eltern kein „nein“
ck('[kind-werkstatt] Kind in Werkstatt: gsa „möglich“ ohne Betrag, mit Hinweis', m.gsa.level === 'vielleicht' && hat(m.gsa, 'ggeld.kindGsa') && hat(m.gsa, 'gsa.eltern') && !m.gsa.tx.some((a) => a[0].indexOf('schaetz.') === 0), m.gsa);
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 4000, brutto: 6000, art1: 'lohn', vermoegen: 60000 });
ck('Kind in Werkstatt, Elternteil verdient gut und hat Vermögen: gsa nicht „nein“', m.gsa.level === 'vielleicht', m.gsa);
// 7) Paar mit erwachsenem Kind in der Werkstatt: wie alleinerziehend
m = run({ adults: 2, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('Paar + Kind in Werkstatt: ggeld „möglich“ mit Hinweis, nicht gemischte Bedarfsgemeinschaft', m.ggeld.level === 'vielleicht' && hat(m.ggeld, 'ggeld.kindGsa') && !hat(m.ggeld, 'ggeld.gemischt'), m.ggeld);
// 8) Das Kind bekommt schon Grundsicherung vom Sozialamt: der Elternteil ist dadurch nicht ausgeschlossen (§ 7 Abs. 1 Satz 1, § 5 Abs. 2 Satz 2 SGB II)
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob', bezug: { sozialamt: true } });
ck('[kind-werkstatt] Kind in Werkstatt, Bezug vom Sozialamt: ggeld nicht „nein“', m.ggeld.level === 'vielleicht' && hat(m.ggeld, 'ggeld.kindGsa') && !hat(m.ggeld, 'ggeld.sozialamt'), m.ggeld);
m = run({ adults: 1, netto: 300, brutto: 300, art1: 'minijob', bezug: { sozialamt: true } });
ck('Ohne Kind in Werkstatt, Bezug vom Sozialamt: ggeld weiter „nein“', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamt'), m.ggeld);
// 9) Kind unter 18 in der Werkstatt: keine Grundsicherung bei Erwerbsminderung (erst ab 18, § 41 Abs. 3 SGB XII), Grundsicherungsgeld mit Betrag
m = run({ adults: 1, kids: 1, kids14: 1, bhPerson: 'minder', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('[kind-werkstatt] Kind unter 18 in Werkstatt: gsa „nein“ (erst ab 18)', m.gsa.level === 'nein' && hat(m.gsa, 'gsa.kindU18'), m.gsa);
ck('Kind unter 18 in Werkstatt: ggeld „wahrscheinlich“ mit Betrag', m.ggeld.level === 'ja' && m.ggeld.tx.some((a) => a[0].indexOf('schaetz.') === 0), m.ggeld);
// 10) Wohngeld-Hinweis bei zu niedrigem Einkommen: Schonvermögen des Jobcenters (40 bis 49 Jahre: 12.500 € + 5.000 € fürs Kind, § 12 Abs. 2 SGB II),
//     nicht das des Sozialamts (10.500 €). Vorher: „Grundsicherung eher nicht“ neben „Grundsicherungsgeld möglich“.
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 900, brutto: 1100, art1: 'lohn', vermoegen: 12000, gebJahr: 1981 });
ck('[kind-werkstatt] Wohngeld-Hinweis mit Schonvermögen des Jobcenters', hat(m.wohngeld, 'wohngeld.zuNiedrig') && !hat(m.wohngeld, 'wohngeld.zuNiedrigVerm') && m.ggeld.level === 'vielleicht', [m.wohngeld, m.ggeld]);
m = run({ adults: 1, wfbm: true, netto: 300, brutto: 300, vermoegen: 12000, gebJahr: 1981 });
ck('Einzelperson in Werkstatt: Wohngeld-Hinweis weiter mit Schonvermögen des Sozialamts', hat(m.wohngeld, 'wohngeld.zuNiedrigVerm'), m.wohngeld);

// ---- Zweite unabhängige Prüfung 24.11.2026 ----
// 11) Einfache Version: Die Person in der Werkstatt antwortet selbst („Behinderung seit der Kindheit“ -> erwVor25, wfbmSelbst). Sie ist kein
//     Elternteil mit Kind in der Werkstatt, auch wenn sie die Lohnfrage überspringt: Sozialamt zuständig, Grundsicherung mit Betrag wie bisher.
for (const ein of [[], [{ art: 'rente', b: 600 }], [{ art: 'wfbm', b: 250 }]]) for (const wohnform of ['', 'eltern', 'heim']) {
  m = run({ adults: 1, young: 0, bhPerson: 'erwVor25', bhSelbst: true, wfbm: true, wfbmSelbst: true, einkommen: ein, wohnform, miete: wohnform === '' ? 500 : 0, gebJahr: 1996 });
  ck('[kind-werkstatt] Einfache Version, selbst in der Werkstatt (' + (wohnform || 'eigene Wohnung') + ', ' + ein.length + ' Einkommen): ggeld nein, Sozialamt', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamtZustaendig') && !hat(m.ggeld, 'ggeld.kindGsa'), m.ggeld);
  ck('Einfache Version, selbst in der Werkstatt: gsa ohne Hinweis „erwachsenes Kind“', !hat(m.gsa, 'ggeld.kindGsa') && m.gsa.level !== 'nein' && m.gsa.tx.some((a) => a[0].indexOf('bedarf') === 0), m.gsa);
}

// ---- Restpunkte 24.11.2026 (Auftrag „Ja, schaue es dir an“) ----
// 12) Nur das erwachsene Kind bekommt Grundsicherung vom Sozialamt: Wohngeld nicht „nein“ (§ 7 Abs. 1 Satz 1 Nr. 5, Abs. 2 WoGG), höchstens „möglich“
//     ohne Betrag; Kinderzuschlag nicht „nein“ wegen des Bezugs; Rundfunk nicht „bekommst du“ (§ 4 Abs. 3 RBeitrStV: Befreiung gilt nicht für Eltern)
const kindBezug = { adults: 1, young: 1, kids: 1, kids14: 1, kidsAlter: true, bhPerson: 'erwVor25', wfbm: true, netto: 1700, brutto: 2300, art1: 'lohn', miete: 900, bezug: { sozialamt: true } };
m = run(kindBezug);
ck('[kind-werkstatt] Kind mit eigener Grundsicherung: Wohngeld nicht „nein“ wegen Ausschluss', m.wohngeld.hl !== 'ausschluss', m.wohngeld);
ck('Kind mit eigener Grundsicherung: Wohngeld höchstens „möglich“, Hinweis, kein Betrag', m.wohngeld.level !== 'ja' && (m.wohngeld.level === 'nein' || (hat(m.wohngeld, 'wohngeld.kindGsa') && !m.wohngeld.tx.some((a) => a[0].indexOf('schaetz.') === 0))), m.wohngeld);
ck('Kind mit eigener Grundsicherung: Kinderzuschlag nicht „nein“ wegen Ausschluss', m.kiz.hl !== 'ausschluss', m.kiz);
ck('Kind mit eigener Grundsicherung: Kinderzuschlag höchstens „möglich“', m.kiz.level !== 'ja', m.kiz);
ck('Kind mit eigener Grundsicherung: Rundfunk nicht „bekommst du“, Hinweis', m.rundfunk.level !== 'ja' && hat(m.rundfunk, 'rundfunk.kindGsa'), m.rundfunk);
// Unabhängige Prüfung 24.11.2026: Bildung und Teilhabe nicht „bekommst du“, wenn nur das erwachsene Kind Grundsicherung bekommt (§ 42 Nr. 3
// SGB XII: nur für das Kind selbst; Geschwister über § 28 SGB II, § 6b BKGG), höchstens „möglich“
ck('[kind-werkstatt] Kind mit eigener Grundsicherung: Bildung und Teilhabe nicht „bekommst du“', m.but.level !== 'ja' && !hat(m.but, 'but.bezug'), m.but);
// Einziges Kind ist das Kind mit eigener Grundsicherung: kein Kinderzuschlag (DA-KiZ B.2 Abs. 2 Satz 8), kein Bildungspaket (kein Schüler)
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 1700, brutto: 2300, art1: 'lohn', miete: 900, vermoegen: 0, bezug: { sozialamt: true } });
ck('Einziges Kind mit eigener Grundsicherung: Kinderzuschlag „nein“', m.kiz.level === 'nein', m.kiz);
ck('Einziges Kind in der Werkstatt: Bildung und Teilhabe „nein“', m.but.level === 'nein' && hat(m.but, 'but.azubi'), m.but);
ck('Einziges Kind mit eigener Grundsicherung: Wohngeld für den Elternteil nicht „nein“ wegen Ausschluss', m.wohngeld.hl !== 'ausschluss', m.wohngeld);
// Gegenprobe: eigener Bezug vom Sozialamt (ohne Kind in der Werkstatt) bleibt Ausschluss bzw. Befreiung
m = run({ adults: 1, kids: 1, netto: 300, brutto: 300, art1: 'minijob', bezug: { sozialamt: true } });
ck('Eigener Bezug vom Sozialamt: Wohngeld weiter „nein“ (Ausschluss)', m.wohngeld.level === 'nein' && hat(m.wohngeld, 'wohngeld.ausschluss'), m.wohngeld);
ck('Eigener Bezug vom Sozialamt: Kinderzuschlag weiter „nein“', m.kiz.level === 'nein' && hat(m.kiz, 'kiz.ausschluss'), m.kiz);
ck('Eigener Bezug vom Sozialamt: Rundfunk „bekommst du“', m.rundfunk.level === 'ja' && hat(m.rundfunk, 'rundfunk.bezug'), m.rundfunk);
// 13) Kind unter 18 in der Werkstatt: eigener Hinweis gsa.kindU18 statt gsa.voraus
m = run({ adults: 1, kids: 1, kids14: 1, bhPerson: 'minder', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('Kind unter 18 in Werkstatt: Hinweis gsa.kindU18, nicht gsa.voraus', hat(m.gsa, 'gsa.kindU18') && !hat(m.gsa, 'gsa.voraus'), m.gsa);
// 14) Allein, Werkstatt-Haken bei „eine erwachsene Person“ ohne eigenen Werkstattlohn: kann die Person selbst oder ein Kind ab 25 sein.
//     Wenig Einkommen: höchstens „möglich“ mit Hinweis ggeld.emWer, kein Betrag; viel Vermögen: weiter „nein“
m = run({ adults: 1, bhPerson: 'erwNach25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('[kind-werkstatt] Allein, unklar wer in der Werkstatt: ggeld „möglich“ mit Hinweis emWer', m.ggeld.level === 'vielleicht' && hat(m.ggeld, 'ggeld.emWer') && !m.ggeld.tx.some((a) => a[0].indexOf('schaetz.') === 0), m.ggeld);
m = run({ adults: 1, bhPerson: 'erwNach25', wfbm: true, netto: 300, brutto: 300, art1: 'minijob', vermoegen: 90000 });
ck('Allein, unklar wer in der Werkstatt, viel Vermögen: ggeld „nein“', m.ggeld.level === 'nein', m.ggeld);
m = run({ adults: 1, bhPerson: 'erwNach25', wfbm: true, art1: 'wfbm', netto: 250, brutto: 250 });
ck('Allein, eigener Werkstattlohn: weiter „Sozialamt zuständig“', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamtZustaendig'), m.ggeld);
m = run({ adults: 1, bhPerson: 'erwNach25', wfbm: true, wfbmSelbst: true, netto: 0, brutto: 0, art1: '' });
ck('Einfache Version (wfbmSelbst): weiter „Sozialamt zuständig“', m.ggeld.level === 'nein' && hat(m.ggeld, 'ggeld.sozialamtZustaendig'), m.ggeld);
// 15) Absage nur wegen Einkommen des erwachsenen Kindes in der Werkstatt (kindEink): ohne Kindeinkommen reicht es -> „möglich“
//     (unterhaltAnrechenbar begrenzt das Kindeinkommen auf den Bedarf der Kinder; hier also nur, wenn es die Lücke schließt)
//     Vorher (main d7437ad6): netto 1.600 € ohne Kindeinkommen „möglich“, mit 1.500 € Kindeinkommen „nein“
const ohneKE = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 1600, brutto: 2160, art1: 'lohn', miete: 650 });
const mitKE = run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 1600, brutto: 2160, art1: 'lohn', miete: 650, kindEink: 1500 });
ck('[kind-werkstatt] Kindeinkommen allein führt nicht zur Absage beim Elternteil', ohneKE.ggeld.level === 'vielleicht' && mitKE.ggeld.level === 'vielleicht' && hat(mitKE.ggeld, 'ggeld.kindGsa') && !mitKE.ggeld.tx.some((a) => a[0].indexOf('schaetz.') === 0), { ohne: ohneKE.ggeld.level, mit: mitKE.ggeld });
// Einkommen des Elternteils selbst zu hoch: weiter „nein“
ck('Einkommen des Elternteils zu hoch: weiter „nein“', run({ adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 2600, brutto: 3500, art1: 'lohn', miete: 650, kindEink: 1500 }).ggeld.level === 'nein');
// 16) gsa.eltern: „mehr als 100.000 €“ (§ 94 Abs. 1a SGB XII) und „kann … bekommen“
const de = require('../src/lang/de.json');
ck('gsa.eltern: „mehr als 100.000 €“ und „kann“', /mehr als 100\.000/.test(de['t.gsa.eltern']) && /kann/.test(de['t.gsa.eltern']) && !/erst ab 100/.test(de['t.gsa.eltern']), de['t.gsa.eltern']);

// 15) Kind ab 18 in der Werkstatt OHNE laufenden Bezug vom Sozialamt: für dieses Kind kein Kinderzuschlag (DA-KiZ 20.02.2026 B.2 Abs. 2
//     Satz 5 bis 8, https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf). Einziges Kind: „nein“; mit weiteren Kindern höchstens „möglich“
//     ohne Betrag (die Rechnung kann das Kind nicht herausnehmen). Bis 24.11.2026: Betrag für alle Kinder.
const kizBasis = { adults: 1, young: 1, bhPerson: 'erwVor25', wfbm: true, netto: 1700, brutto: 2300, art1: 'lohn', miete: 900, vermoegen: 0 };
m = run(kizBasis);
ck('[kind-werkstatt] Einziges Kind ab 18 in der Werkstatt (ohne Bezug): Kinderzuschlag „nein“', m.kiz.level === 'nein' && hat(m.kiz, 'kiz.ausschluss'), m.kiz);
m = run({ ...kizBasis, kids: 2, kids14: 1, kidsAlter: true });
ck('Kind ab 18 in der Werkstatt + 2 weitere Kinder: Kinderzuschlag höchstens „möglich“', m.kiz.level !== 'ja', m.kiz);
ck('Kind ab 18 in der Werkstatt + weitere Kinder: kein Betrag', !m.kiz.tx.some((a) => a[0].indexOf('schaetz.') === 0) && typeof m.kiz.est !== 'number', m.kiz);
ck('Kind ab 18 in der Werkstatt + weitere Kinder: Hinweis kiz.kindGsa (wenn nicht „nein“)', m.kiz.level === 'nein' || hat(m.kiz, 'kiz.kindGsa'), m.kiz);
// Gegenprobe: Kind ab 18 OHNE Werkstatt-Haken (Behinderung, aber nicht erwerbsgemindert) bleibt KiZ-Kind wie bisher
m = run({ adults: 1, young: 1, bhPerson: 'erwVor25', netto: 1700, brutto: 2300, art1: 'lohn', miete: 900, vermoegen: 0, kids: 2, kids14: 1, kidsAlter: true });
ck('Kind ab 18 ohne Werkstatt: kein Hinweis kiz.kindGsa', !hat(m.kiz, 'kiz.kindGsa'), m.kiz);
// Elternteil selbst in der Werkstatt (einfache Version, wfbmSelbst): unverändert, kein Kind-Hinweis
m = run({ ...kizBasis, wfbmSelbst: true, kids: 1, kids14: 1, kidsAlter: true });
ck('Elternteil selbst in der Werkstatt: kein Hinweis kiz.kindGsa', !hat(m.kiz, 'kiz.kindGsa'), m.kiz);
ck('t.kiz.kindGsa nennt „keinen Kinderzuschlag“ für das Kind und „zählt … mit“', /keinen Kinderzuschlag/.test(de['t.kiz.kindGsa']) && /zählt/.test(de['t.kiz.kindGsa']), de['t.kiz.kindGsa']);

console.log(fails ? fails + ' von ' + n + ' Prüfungen ROT' : 'Kind in der Werkstatt: ' + n + ' Prüfungen bestanden');
process.exitCode = fails ? 1 : 0;
