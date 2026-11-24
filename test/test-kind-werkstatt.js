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
ck('[kind-werkstatt] Kind unter 18 in Werkstatt: gsa „nein“ (erst ab 18)', m.gsa.level === 'nein' && hat(m.gsa, 'gsa.voraus'), m.gsa);
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

console.log(fails ? fails + ' von ' + n + ' Prüfungen ROT' : 'Kind in der Werkstatt: ' + n + ' Prüfungen bestanden');
process.exitCode = fails ? 1 : 0;
