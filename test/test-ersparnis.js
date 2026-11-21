// Ersparnisse und Kapitalerträge: geschützte Altersvorsorge, unsichere Versicherungen, Zinsen als Einkommen.
// Quellen: § 12 Abs. 1 Satz 2 Nr. 3 SGB II, § 90 Abs. 2 Nr. 2 SGB XII, WoGVwV 21.37, § 1 Abs. 1 Nr. 3 GrusiGV (100 € im Jahr frei), § 14 WoGG.
'use strict';
const R = require('../src/rules.js');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', n); };
const card = (inp, id) => R.evaluate(inp).results.find((r) => r.id === id);
// ohneWege: hier zählt nur der Vermögensschutz der Grundsicherung im Alter (Wohngeld ginge bei dieser Rente voraussichtlich vor)
const rentnerin = { ohneWege: true, adults: 1, kids: 0, young: 0, art1: 'rente', brutto: 900, netto: 800, miete: 500, mietstufe: 3, vermoegen: 4000, gebJahr: 1955, bezug: {}, heute: 2026.9 };
check('[verm-av] Riester/Rürup/Betriebsrente zählen nicht (GSA bleibt wahrscheinlich bei 50.000 € Riester)', card({ ...rentnerin, vermAV: 50000 }, 'gsa').level === 'ja');
const lv = card({ ...rentnerin, vermLV: 9000 }, 'gsa');
check('[verm-lv] Lebensversicherung über der Grenze: nur „möglich“ mit Hinweis', lv.level === 'vielleicht' && lv.tx.some((t) => t[0] === 'verm.lvUnsicher'), lv);
check('[verm-lv] Lebensversicherung unter der Grenze: bleibt wahrscheinlich', card({ ...rentnerin, vermLV: 3000 }, 'gsa').level === 'ja');
check('[verm-lv] ohne Angaben unverändert', JSON.stringify(R.evaluate(rentnerin).results) === JSON.stringify(R.evaluate({ ...rentnerin, vermLV: '', vermAV: '', kapErtrag: '' }).results));
check('[kap-wg] Wohngeld: Zinsen bis 100 € im Jahr zählen nicht (§ 14 Abs. 2 Nr. 15 WoGG)', R.evaluate({ ...rentnerin, kapErtrag: 100 }).h.kapWG === 0 && Math.abs(R.evaluate({ ...rentnerin, kapErtrag: 1300 }).h.kapWG - 100) < 0.001);
check('[kap-sgb2] Zinsen bis 100 € im Jahr zählen nicht', R.evaluate({ ...rentnerin, kapErtrag: 100 }).h.netto === 800);
check('[kap-sgb2] Zinsen 1.300 € im Jahr: 100 €/Monat Einkommen', Math.abs(R.evaluate({ ...rentnerin, kapErtrag: 1300 }).h.netto - 900) < 0.001);
const wg0 = { adults: 1, kids: 0, young: 0, art1: 'lohn', brutto: 1700, netto: 1300, miete: 700, mietstufe: 3, vermoegen: 0, gebJahr: 1980, bezug: {}, heute: 2026.9 };
const betrag = (r) => { const s = r.tx.find((t) => t[0] === 'schaetz.eins' || t[0] === 'schaetz.spanne'); return s ? JSON.stringify(s[1]) : r.level; };
check('[kap-wg] Wohngeld: Zinsen zählen zum Einkommen (Betrag sinkt oder Einstufung ändert sich)', betrag(card(wg0, 'wohngeld')) !== betrag(card({ ...wg0, kapErtrag: 2400 }, 'wohngeld')), [betrag(card(wg0, 'wohngeld')), betrag(card({ ...wg0, kapErtrag: 2400 }, 'wohngeld'))]);

// Einmalige Bedarfe (§ 24 Abs. 3 SGB II, § 31 SGB XII, § 22 Abs. 6 SGB II)
const keys = (inp, id) => card(inp, id).tx.map((t) => t[0]);
const arm = { adults: 1, kids: 1, young: 0, art1: 'ohne', brutto: 0, netto: 0, miete: 600, mietstufe: 3, vermoegen: 0, gebJahr: 1990, bezug: {}, heute: 2026.9 };
check('[einmal] Grundsicherungsgeld: Erstausstattung und Umzug als Hinweis', keys(arm, 'ggeld').includes('einmal.sgb2') && keys(arm, 'ggeld').includes('einmal.umzug'));
check('[einmal] Grundsicherung im Alter: Erstausstattung als Hinweis', keys(rentnerin, 'gsa').includes('einmal.sgb12'));
const reich = { ...arm, kids: 0, art1: 'lohn', brutto: 3500, netto: 2400, schwanger: true };
check('[einmal] Schwanger, Einkommen zu hoch für laufende Leistung: Erstausstattung trotzdem möglich', card(reich, 'ggeld').level === 'nein' && keys(reich, 'ggeld').includes('einmal.ohneBezug'));

console.log(fails ? '\n' + fails + ' Fehler' : '\nErsparnis-Tests bestanden');
process.exit(fails ? 1 : 0);
