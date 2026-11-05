// Behördenverzeichnis Bayern (content/behoerden-bayern.json, erzeugt von tools/build-behoerden.js) und src/behoerden.js
'use strict';
const path = require('path');
const fs = require('fs');
const Behoerden = require('../src/behoerden.js');
const Plz = require('../src/plz.js');
let n = 0, fails = 0;
const check = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'behoerden-bayern.json'), 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'plz-data.json'), 'utf8'));
check('Daten werden angenommen', Behoerden.init(D) && Behoerden.available() && Plz.init(P));

// Vollständigkeit: jeder bayerische Kreis aus den PLZ-Daten hat eine Stelle
const ags = P.kreise.map((k) => k.ags);
check('96 Kreise, alle mit Eintrag', ags.length === 96 && ags.every((a) => D.kreise[a]), ags.filter((a) => !D.kreise[a]).join(','));
const mit = ags.filter((a) => D.kreise[a].anschrift);
check('mindestens 90 Kreise mit Anschrift', mit.length >= 90, mit.length);
check('Namen: Landkreise -> Landratsamt, kreisfreie Städte -> Stadt', ags.every((a) => (Number(a.slice(3)) > 70 ? /^Landratsamt /.test(D.kreise[a].name) : /^(Stadt|Landeshauptstadt) /.test(D.kreise[a].name))));
check('Anschrift: Straße und "PLZ Ort" mit bayerischer PLZ', mit.every((a) => { const [s, o] = D.kreise[a].anschrift; return s && /^(6|8|9)\d{4} \S/.test(o); }), mit.filter((a) => !/^(6|8|9)\d{4} /.test(D.kreise[a].anschrift[1])).join(','));
check('jede Anschrift hat Quelle (https) und Abrufdatum', mit.every((a) => /^https?:\/\//.test(D.kreise[a].quelle) && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(D.kreise[a].stand)));
check('jede Stelle hat eine Website', ags.every((a) => /^https:\/\//.test(D.kreise[a].web)));
check('keine Anschrift eines Dienstleisters außerhalb Bayerns', mit.every((a) => !/^(0|1|2|3|4|5|7)/.test(D.kreise[a].anschrift[1])));

// Stichproben (Anschrift laut Impressum der Behörde)
const st = (a) => D.kreise[a];
check('Erlangen-Höchstadt: Nägelsbachstraße 1, 91052 Erlangen', st('09572').name === 'Landratsamt Erlangen-Höchstadt' && st('09572').anschrift.join(', ') === 'Nägelsbachstraße 1, 91052 Erlangen');
check('Landshut (Landkreis): Sitz in Essenbach', st('09274').anschrift[1] === '84051 Essenbach');
check('Neuburg-Schrobenhausen: Hauptgebäude, nicht Außenstelle Bahnhofstraße', st('09185').anschrift[0] === 'Platz der Deutschen Einheit 1');
check('München (Stadt): Landeshauptstadt München, Marienplatz 8', st('09162').name === 'Landeshauptstadt München' && st('09162').anschrift[0] === 'Marienplatz 8');

// Zuständigkeit nach Leistung
const b = (id, a) => Behoerden.fuer(id, a);
check('Wohngeld -> Landratsamt, Wohngeldstelle', b('wohngeld', '09572').name === 'Landratsamt Erlangen-Höchstadt' && b('wohngeld', '09572').abt === 'Wohngeldstelle');
check('Grundsicherung im Alter -> Sozialamt', /Sozialamt/.test(b('gsa', '09572').abt));
check('Unterhaltsvorschuss -> Jugendamt', /Jugendamt/.test(b('uvg', '09572').abt));
check('Bildung und Teilhabe -> Landratsamt', b('but', '09162').name === 'Landeshauptstadt München');
check('Rundfunkbeitrag -> Beitragsservice Köln, auch ohne Kreis', b('rundfunk', null).anschrift.join(' ') === '50656 Köln');
check('Leistungen ohne Verzeichnis (z. B. Kindergeld, Pflege) -> null', b('kindergeld', '09572') === null && b('pflege', '09572') === null);
check('ohne Kreis (z. B. außerhalb Bayerns) -> null', b('wohngeld', null) === null && b('wohngeld', '') === null && b('wohngeld', '05315') === null);
check('Kreis ohne belegte Anschrift: Name und Website, keine Anschrift', (() => { const x = ags.find((a) => !D.kreise[a].anschrift); return !x || (b('wohngeld', x).anschrift === null && b('wohngeld', x).web); })());

// Zusammenspiel mit der PLZ: Postleitzahl -> Kreis -> Stelle
check('PLZ 90542 (Eckental) -> Landratsamt Erlangen-Höchstadt', b('wohngeld', Plz.lookup('90542').ags).name === 'Landratsamt Erlangen-Höchstadt');
check('PLZ 80331 -> Landeshauptstadt München', b('wohngeld', Plz.lookup('80331').ags).name === 'Landeshauptstadt München');
check('PLZ 20095 (Hamburg) -> keine Stelle', b('wohngeld', Plz.lookup('20095').ags) === null);

console.log(fails ? '\n' + fails + ' FEHLER von ' + n : '\nBehörden-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
