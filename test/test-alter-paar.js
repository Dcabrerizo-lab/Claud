// Regelaltersgrenze bei Paaren: Das Geburtsjahr gilt der ältesten erwachsenen Person (Frage „älteste erwachsene Person“).
// Die jüngere Person eines Paares kann die Grenze noch nicht erreicht haben. Karten, die ab der Regelaltersgrenze entfallen
// (Erwerbsminderungsrente, Arbeitslosengeld, Altersrente für schwerbehinderte Menschen), dürfen bei einem Paar deshalb nicht
// allein wegen des Alters der ältesten Person „nein“ sagen. Quellen (Abruf 24.11.2026): § 43 Abs. 1 und 2, §§ 35, 235, §§ 37, 236a SGB VI;
// § 136 Abs. 2 SGB III; Grundsicherung § 41 Abs. 2 und 3 SGB XII (Alter ODER dauerhafte volle Erwerbsminderung).
'use strict';
const R = require('./rules-de.js');
const base = { ohneWege: true, kids: 0, young: 0, vermoegen: 0, bezug: {}, heute: 2026.9, miete: 600 };
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const run = (o) => { const m = {}; R.evaluate({ ...base, ...o }).results.forEach((x) => { m[x.id] = x; }); return m; };
const hat = (x, k) => x.tx.some((a) => a[0] === k);

// 1) Paar 70/55, jüngere Person voll erwerbsgemindert, Wartezeit erfüllt: Erwerbsminderungsrente möglich, nicht sicher (wer betroffen ist, kennt die App nicht)
let m = run({ adults: 2, gebJahr: 1956, emStd: 'unter3', em5: true, netto: 1400 });
ck('[alter-paar] Paar 70/55 + EM: emrente nicht „nein“', m.emrente.level === 'vielleicht', m.emrente);
ck('Paar 70/55 + EM: Hinweis Regelaltersgrenze dabei', hat(m.emrente, 'emrente.alter') && hat(m.emrente, 'emrente.voll'), m.emrente.tx);
// teilweise erwerbsgemindert, Wartezeit offen: wie bisher „vielleicht“ mit Wartezeit-Hinweis
m = run({ adults: 2, gebJahr: 1956, emStd: '3bis6', netto: 1400 });
ck('Paar 70/55 + teilweise EM: vielleicht mit Wartezeit', m.emrente.level === 'vielleicht' && hat(m.emrente, 'emrente.warte'), m.emrente);
ck('Paar 70/55 + teilweise EM: Hinweis Regelaltersgrenze auch bei „vielleicht“', hat(m.emrente, 'emrente.alter'), m.emrente.tx);
// Paar über der Grenze ohne Angabe zur Erwerbsminderung: nein (wie bisher, Grund „keine Erwerbsminderung angegeben“)
m = run({ adults: 2, gebJahr: 1950, netto: 1400 });
ck('Paar beide über der Grenze, keine EM: emrente nein', m.emrente.level === 'nein', m.emrente);

// 2) Einzelperson über der Grenze: weiterhin „nein“ wegen Alters (auch mit EM-Angabe)
m = run({ adults: 1, gebJahr: 1950, emStd: 'unter3', em5: true, netto: 900 });
ck('[alter-paar] Einzelperson über der Grenze: emrente nein (Alter)', m.emrente.level === 'nein' && hat(m.emrente, 'emrente.alter'), m.emrente);
// Einzelperson unter der Grenze: unverändert „ja“
m = run({ adults: 1, gebJahr: 1975, emStd: 'unter3', em5: true, netto: 900 });
ck('Einzelperson 51 + EM + Wartezeit: emrente ja', m.emrente.level === 'ja', m.emrente);

// 3) Arbeitslosengeld: Paar, älteste Person über der Grenze, jemand arbeitslos → vielleicht; Einzelperson → nein
m = run({ adults: 2, gebJahr: 1956, arbeitSit: 'arbeitslos', netto: 1400 });
ck('[alter-paar] Paar 70/55 arbeitslos: alg1 vielleicht', m.alg1.level === 'vielleicht' && hat(m.alg1, 'alg1.alter'), m.alg1);
m = run({ adults: 1, gebJahr: 1950, arbeitSit: 'arbeitslos', netto: 900 });
ck('Einzelperson über der Grenze arbeitslos: alg1 nein', m.alg1.level === 'nein' && hat(m.alg1, 'alg1.alter'), m.alg1);

// 4) Altersrente für schwerbehinderte Menschen: Paar mit GdB 50 → vielleicht (allgemeiner Hinweis); Einzelperson → nein
m = run({ adults: 2, gebJahr: 1956, gdb: '50', netto: 1400 });
ck('[alter-paar] Paar 70/55 GdB 50: srente vielleicht', m.srente.level === 'vielleicht' && hat(m.srente, 'srente.allg'), m.srente);
m = run({ adults: 1, gebJahr: 1950, gdb: '50', netto: 900 });
ck('Einzelperson über der Grenze GdB 50: srente nein', m.srente.level === 'nein' && hat(m.srente, 'srente.alter'), m.srente);
// Paar ohne Behinderung: srente nein (keine Behinderung)
m = run({ adults: 2, gebJahr: 1956, netto: 1400 });
ck('Paar ohne GdB: srente nein', m.srente.level === 'nein', m.srente);

// 4a) Reihenfolge der Hinweise: erst die Voraussetzung, dann die Altersgrenze (unter „Möglich“ soll nicht zuerst eine Absage stehen)
m = run({ adults: 2, gebJahr: 1956, arbeitSit: 'arbeitslos', netto: 1400 });
ck('Paar arbeitslos: alg1 zuerst Voraussetzung, dann Altersgrenze', m.alg1.tx[0][0] === 'alg1.zeit' && m.alg1.tx[1][0] === 'alg1.alter', m.alg1.tx);
m = run({ adults: 2, gebJahr: 1956, gdb: '50', netto: 1400 });
ck('Paar GdB 50: srente zuerst Voraussetzung, dann Altersgrenze', m.srente.tx[0][0] === 'srente.allg' && m.srente.tx[1][0] === 'srente.alter', m.srente.tx);
// 4b) Budget für Arbeit (§ 61, § 58 Abs. 1 Satz 3 SGB IX): Paar, jüngere Person kann in der Werkstatt arbeiten → nicht „nein“ wegen Alters
m = run({ adults: 2, gebJahr: 1956, wfbm: true, netto: 1400 });
ck('[alter-paar] Paar 70/55 + Werkstatt: Budget für Arbeit vielleicht', m.arbeit.level === 'vielleicht', m.arbeit);
m = run({ adults: 1, gebJahr: 1950, wfbm: true, netto: 900 });
ck('Einzelperson über der Grenze + Werkstatt: Budget für Arbeit nein', m.arbeit.level === 'nein', m.arbeit);
m = run({ adults: 1, gebJahr: 1980, wfbm: true, netto: 900 });
ck('Einzelperson 46 + Werkstatt: Budget für Arbeit vielleicht (unverändert)', m.arbeit.level === 'vielleicht', m.arbeit);

// 5) Grundsicherung im Alter und bei Erwerbsminderung: Alter ODER Erwerbsminderung genügt (kein Muster „nur älteste Person“)
m = run({ adults: 2, gebJahr: 1975, emStd: 'unter3', netto: 300 });
ck('[alter-paar] Paar 51 + volle EM: gsa nicht wegen Alters ausgeschlossen', m.gsa.level !== 'nein' || !hat(m.gsa, 'gsa.voraus'), m.gsa);

console.log(fails ? `${fails} von ${n} Prüfungen ROT` : `Alter bei Paaren: ${n} Prüfungen bestanden`);
process.exit(fails ? 1 : 0);
