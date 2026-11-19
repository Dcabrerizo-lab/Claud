// Ersparnisse und Kapitalerträge: geschützte Altersvorsorge, unsichere Versicherungen, Zinsen als Einkommen.
// Quellen: § 12 Abs. 1 Satz 2 Nr. 3 SGB II, § 90 Abs. 2 Nr. 2 SGB XII, WoGVwV 21.37, § 1 Abs. 1 Nr. 3 GrusiGV (100 € im Jahr frei), § 14 WoGG.
'use strict';
const R = require('../src/rules.js');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', n); };
const card = (inp, id) => R.evaluate(inp).results.find((r) => r.id === id);
const rentnerin = { adults: 1, kids: 0, young: 0, art1: 'rente', brutto: 900, netto: 800, miete: 500, mietstufe: 3, vermoegen: 4000, gebJahr: 1955, bezug: {}, heute: 2026.9 };
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

// Familienversicherung (§ 10 SGB V): 2026 Grenze 3.955 € / 7 = 565 €, Minijob 603 €
const fam = (inp) => card({ adults: 2, kids: 0, young: 0, art1: 'lohn', brutto: 3000, netto: 2100, miete: 800, mietstufe: 3, vermoegen: 0, gebJahr: 1985, bezug: {}, heute: 2026.9, ...inp }, 'famvers');
check('[famvers] Partner ohne Einkommen: möglich', fam({ art2: 'ohne', brutto2: 0 }).level === 'vielleicht');
check('[famvers] Partner Minijob 603 €: möglich', fam({ art2: 'lohn', brutto: 3603, brutto2: 603 }).level === 'vielleicht');
check('[famvers] Partner 1.200 € Lohn: nein', fam({ art2: 'lohn', brutto: 4200, brutto2: 1200 }).level === 'nein');
check('[famvers] Partner Rente über der Grenze: nein (eigene Versicherung)', fam({ art2: 'rente', brutto: 3900, brutto2: 900 }).level === 'nein');
check('[famvers] Partner kleine Rente unter der Grenze: möglich (§ 10 Abs. 1 SGB V)', fam({ art2: 'rente', brutto: 3400, brutto2: 400 }).level === 'vielleicht');
check('[famvers] Grenze 565 € im Text', JSON.stringify(fam({ art2: 'ohne' }).tx).includes('565'));
check('[famvers] Allein ohne Kinder: nein', card({ ...rentnerin }, 'famvers').level === 'nein');
console.log(fails ? '\n' + fails + ' Fehler' : '\nErsparnis-Tests bestanden');
process.exit(fails ? 1 : 0);
