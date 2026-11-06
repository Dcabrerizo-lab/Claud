// PLZ -> Bundesland, Kreis, Mietenstufe (content/plz-data.json, erzeugt von tools/build-plz-data.js).
// Erwartete Mietenstufen stehen hier unabhängig vom Erzeugungsskript, abgelesen aus der Anlage zur Wohngeldverordnung
// (Mietenstufen ab 1.1.2023, content/quellen/roh/wogv-anlage.html).
'use strict';
const path = require('path');
const fs = require('fs');
const Plz = require('../src/plz.js');
let n = 0, fails = 0;
const check = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

const file = path.join(__dirname, '..', 'content', 'plz-data.json');
check('content/plz-data.json vorhanden', fs.existsSync(file));
const D = JSON.parse(fs.readFileSync(file, 'utf8'));
check('Daten werden angenommen', Plz.init(D) && Plz.available());

const at = (plz) => Plz.lookup(plz);
const cand = (plz, ort) => (at(plz) || { candidates: [] }).candidates.find((c) => c.label === ort);

// Eindeutige PLZ: Stufe wird sicher gesetzt (Gemeinde einzeln in der Verordnung oder Kreis)
[
  ['90542', 'Eckental', 'Landkreis Erlangen-Höchstadt', 3],
  ['80331', 'München', 'Stadt München', 7],
  ['86150', 'Augsburg', 'Stadt Augsburg', 5],
  ['97070', 'Würzburg', 'Stadt Würzburg', 4],
  ['82024', 'Taufkirchen', 'Landkreis München', 2], // „Taufkirchen“ (Lkr. München) II, nicht „Taufkirchen (Vils)“ V
  ['90518', 'Altdorf', 'Landkreis Nürnberger Land', 2], // „Altdorf bei Nürnberg“ II, nicht „Altdorf, Markt“ (Lkr. Landshut) III
  ['83022', 'Rosenheim', 'Stadt Rosenheim', 5],
  ['83101', 'Rohrdorf', 'Landkreis Rosenheim', 4], // nicht einzeln aufgeführt -> Kreis Rosenheim IV
  ['87435', 'Kempten', 'Stadt Kempten', 4],
  ['92700', 'Kaltenbrunn, Oberpfalz', 'Landkreis Neustadt a. d. Waldnaab', 1],
  ['63739', 'Aschaffenburg', 'Stadt Aschaffenburg', 4]
].forEach(([plz, ort, kreis, stufe]) => {
  const r = at(plz);
  check(`${plz} ${ort}: Bayern, sicher Stufe ${stufe}`, r && r.bl === 'BY' && r.sure && r.stufe === stufe, JSON.stringify(r && { sure: r.sure, stufe: r.stufe, c: r.candidates }));
  const c = cand(plz, ort);
  check(`${plz} ${ort}: Kreis ${kreis}`, c && c.kreis === kreis, JSON.stringify(c));
});

// Mehrere Gemeinden mit unterschiedlicher Stufe: App fragt nach dem Ort
check('84416: Taufkirchen (Vils) V oder Inning am Holz (Kreis Erding IV) -> Nachfrage', (() => { const r = at('84416'); return r && !r.sure && cand('84416', 'Taufkirchen (Vils)').stufe === 5 && cand('84416', 'Inning am Holz').stufe === 4; })());
check('84032: Altdorf (Lkr. Landshut) III oder Stadt Landshut IV -> Nachfrage', (() => { const r = at('84032'); return r && !r.sure && cand('84032', 'Altdorf').stufe === 3 && cand('84032', 'Landshut').stufe === 4; })());

// Andere Bundesländer: nur das Land, keine Stufe
[['20095', 'HH'], ['10115', 'BE'], ['01067', 'SN'], ['70173', 'BW'], ['50667', 'NW']].forEach(([plz, bl]) => {
  const r = at(plz);
  check(`${plz}: Bundesland ${bl}, keine Mietenstufe`, r && r.bl === bl && !r.sure && r.stufe === null, JSON.stringify(r));
});

// Großkunden-PLZ (Firmen) sind aussortiert und färben keine Wohn-PLZ falsch ein
check('20083 (Großkunde in München, Hamburger PLZ-Bereich) nicht als Bayern', !(at('20083') && at('20083').bl === 'BY'));
check('Ungültige Eingaben ergeben null', at('') === null && at('123') === null && at('abcde') === null && at('00000') === null);

// Kreisschlüssel für die Behördensuche
check('90542: Kreisschlüssel 09572 (Erlangen-Höchstadt)', at('90542').ags === '09572');
check('80331: Kreisschlüssel 09162 (Stadt München)', at('80331').ags === '09162');
check('84032: zwei Kreise (Lkr. Landshut, Stadt Landshut) -> kein eindeutiger Schlüssel', at('84032').ags === null && cand('84032', 'Altdorf').ags === '09274' && cand('84032', 'Landshut').ags === '09261');
check('20095 Hamburg: kein Kreisschlüssel', at('20095').ags === null);

// Vollständigkeit
check('96 bayerische Kreise mit amtlichem Schlüssel', D.kreise.length === 96 && D.kreise.every((k) => /^09\d{3}$/.test(k.ags)));
const byPlz = Object.keys(D.plz).filter((p) => D.plz[p].some((e) => D.bl[e[4]] === 'BY'));
check('über 2.000 bayerische PLZ', byPlz.length > 2000, byPlz.length);
check('jede bayerische PLZ hat Kreis und Mietenstufe I-VII', byPlz.every((p) => D.plz[p].filter((e) => D.bl[e[4]] === 'BY').every((e) => e[1] >= 0 && e[2] >= 1 && e[2] <= 7)));
check('jeder Kreis kommt in den PLZ vor', D.kreise.every((k, i) => byPlz.some((p) => D.plz[p].some((e) => e[1] === i))));
check('233 bayerische Gemeinden mit eigener Stufe (Anlage WoGV)', D.kreise.reduce((s, k) => s + k.g.length, 0) === 233);
check('Quellenangabe mit Stichtag', /1\.1\.2023/.test(D.stand.wogv) && /GeoNames/.test(D.stand.geonames));

console.log(fails ? '\n' + fails + ' FEHLER von ' + n : '\nPLZ-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
