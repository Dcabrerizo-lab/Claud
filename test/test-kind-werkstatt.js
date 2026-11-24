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

// 4) Kind unter 18 in der Werkstatt (selten): Sozialgeld fürs Kind, Elternteil beim Jobcenter, kein Grundsicherungs-Hinweis fürs Kind
m = run({ adults: 1, kids: 1, kids14: 1, bhPerson: 'minder', wfbm: true, netto: 300, brutto: 300, art1: 'minijob' });
ck('Alleinerziehend + Kind unter 18 in Werkstatt: ggeld nicht „nein“', m.ggeld.level !== 'nein', m.ggeld);
ck('Alleinerziehend + Kind unter 18: kein Hinweis ggeld.kindGsa', !hat(m.ggeld, 'ggeld.kindGsa'), m.ggeld.tx);

console.log(fails ? fails + ' von ' + n + ' Prüfungen ROT' : 'Kind in der Werkstatt: ' + n + ' Prüfungen bestanden');
process.exitCode = fails ? 1 : 0;
