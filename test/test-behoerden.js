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
const DE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'behoerden-deutschland.json'), 'utf8'));
D.de = DE; // wie im Build (scripts/build.js)
check('Daten werden angenommen', Behoerden.init(D) && Behoerden.available() && Plz.init(P));
// Außerhalb Bayerns: Name und Website, keine Anschrift; nur gesicherte Zuständigkeiten
const bd = (id, a) => Behoerden.fuer(id, a);
check('[beh-de] Köln (kreisfreie Stadt): Wohngeld, Grundsicherung, Unterhaltsvorschuss bei der Stadt Köln mit Website, ohne Anschrift', bd('wohngeld', '05315').name === 'Stadt Köln' && /stadt-koeln\.de/.test(bd('wohngeld', '05315').web) && bd('wohngeld', '05315').anschrift === null && bd('gsa', '05315').name === 'Stadt Köln' && bd('uvg', '05315').name === 'Stadt Köln');
check('[beh-de] Landkreis (Kreis Mettmann): nur Grundsicherung im Alter, kein Wohngeld und kein Jugendamt (liegen teils bei Gemeinden)', bd('gsa', '05158').name === 'Kreis Mettmann' && bd('wohngeld', '05158') === null && bd('uvg', '05158') === null);
check('[beh-de] Berlin und Hamburg: keine Stadt-Angabe (dort die Bezirksämter)', bd('wohngeld', '11000') === null && bd('wohngeld', '02000') === null);
check('[beh-de] Landkreis und Stadt Leipzig getrennt', bd('wohngeld', '14713').name === 'Stadt Leipzig' && bd('wohngeld', '14729') === null && bd('gsa', '14729').name === 'Landkreis Leipzig');
check('[beh-de] Alle Kreise außerhalb Bayerns (außer Berlin, Hamburg) mit Website, 79 kreisfreie Städte', P.kreise.filter((k) => !/^(09|11|02)/.test(k.ags)).every((k) => DE.kreise[k.ags] && /^https?:\/\//.test(DE.kreise[k.ags].web)) && Object.values(DE.kreise).filter((e) => e.typ === 'stadt').length === 79);
{ // Anschrift aus dem Handy-Abruf (nur Beispiel im Speicher): erscheint mit Stand
  const D2 = JSON.parse(JSON.stringify(D)); D2.de.kreise['05315'] = Object.assign({}, D2.de.kreise['05315'], { anschrift: ['Beispielplatz 1', '50667 Köln'], stand: '11.11.2026', quelle: 'https://example.org/impressum' });
  Behoerden.init(D2);
  check('[beh-de] Anschrift aus dem Handy-Abruf wird genutzt', JSON.stringify(Behoerden.fuer('wohngeld', '05315').anschrift) === JSON.stringify(['Beispielplatz 1', '50667 Köln']) && Behoerden.fuer('wohngeld', '05315').stand === '11.11.2026');
  Behoerden.init(D);
}
check('[beh-de] Bayern unverändert: Erlangen-Höchstadt mit Anschrift', /Landratsamt/.test(bd('wohngeld', '09572').name) && !!bd('wohngeld', '09572').anschrift);

// Vollständigkeit: jeder bayerische Kreis aus den PLZ-Daten hat eine Stelle
const ags = P.kreise.map((k) => k.ags).filter((a) => a.startsWith('09')); // Anschriften gibt es (noch) nur für Bayern
check('96 Kreise, alle mit Eintrag', ags.length === 96 && ags.every((a) => D.kreise[a]), ags.filter((a) => !D.kreise[a]).join(','));
const mit = ags.filter((a) => D.kreise[a].anschrift);
check('alle 96 Kreise mit Anschrift', mit.length === 96, mit.length);
check('Namen: Landkreise -> Landratsamt, kreisfreie Städte -> Stadt', ags.every((a) => (Number(a.slice(3)) > 70 ? /^Landratsamt /.test(D.kreise[a].name) : /^(Stadt|Landeshauptstadt) /.test(D.kreise[a].name))));
// Anschrift: [Straße oder Postfach, PLZ Ort] oder nur [PLZ Ort] (Großkunden-Postleitzahl einer Behörde)
const plzOrt = (z) => /^(6|8|9)\d{4} \S/.test(z);
check('Anschrift endet mit "PLZ Ort" (bayerische PLZ)', mit.every((a) => { const x = D.kreise[a].anschrift; return x.length >= 1 && x.length <= 2 && plzOrt(x[x.length - 1]); }), mit.filter((a) => !plzOrt(D.kreise[a].anschrift.slice(-1)[0])).join(','));
check('jede Anschrift hat Quelle (https) und Abrufdatum', mit.every((a) => /^https?:\/\//.test(D.kreise[a].quelle) && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(D.kreise[a].stand)));
check('jede Stelle hat eine Website', ags.every((a) => /^https:\/\//.test(D.kreise[a].web)));
check('keine Anschrift eines Dienstleisters außerhalb Bayerns', mit.every((a) => !/^(0|1|2|3|4|5|7)/.test(D.kreise[a].anschrift.slice(-1)[0])));

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
check('Leistungen ohne Verzeichnis (Pflegekasse, Krankenkasse, Rentenversicherung) -> null', b('pflege', '09572') === null && b('zuzahl', '09572') === null && b('emrente', '09572') === null);

// Jobcenter (amtliche Liste aller Jobcenter, Zuständigkeit laut BayernPortal)
check('alle 96 Kreise mit Jobcenter und Anschrift', ags.every((a) => D.jobcenter[a] && D.jobcenter[a].anschrift && /^(6|8|9)\d{4} /.test(D.jobcenter[a].anschrift.slice(-1)[0])), ags.filter((a) => !D.jobcenter[a]).join(','));
check('Grundsicherungsgeld Erlangen-Höchstadt -> Jobcenter Erlangen-Höchstadt', b('ggeld', '09572').name === 'Jobcenter Erlangen-Höchstadt');
check('Stadt Erlangen: kommunales Jobcenter', b('ggeld', '09562').name === 'Erlanger Jobcenter');
check('Landkreis Würzburg: kommunaler Träger (Landratsamt, Geschäftsbereich 4)', /^Landratsamt Würzburg, Geschäftsbereich 4/.test(b('ggeld', '09679').name));
check('Jobcenter-Namen ohne interne Kürzel', ags.every((a) => !/^(SG \d|\d|Abteilung|Fachbereich)/.test(D.jobcenter[a].name)));
check('Geschäftsstelle wird durch die Hauptstelle ersetzt', !ags.some((a) => / Geschäftsstelle /.test(D.jobcenter[a].name)) && b('ggeld', '09472').name === 'Jobcenter Bayreuth Land');

// Familienkasse (Nord/Süd nach Wohnort; offen, wo die Quelle beide nennt)
check('Familienkassen Nord und Süd mit Postanschrift', D.familienkasse.nord.anschrift.join(' ') === '90316 Nürnberg' && D.familienkasse.sued.anschrift.join(' ') === '93013 Regensburg');
check('Kindergeld Erlangen-Höchstadt -> Familienkasse Bayern Nord', b('kindergeld', '09572').name === 'Familienkasse Bayern Nord');
check('Kinderzuschlag München -> Familienkasse Bayern Süd, Kinderzuschlag', b('kiz', '09162').name === 'Familienkasse Bayern Süd' && b('kiz', '09162').abt === 'Kinderzuschlag');
// laut BayernPortal: Franken Nord; Ober-/Niederbayern Süd; Schwaben Süd außer Dillingen und Donau-Ries (Agenturbezirk Donauwörth) Nord
check('Franken -> Nord, Ober-/Niederbayern -> Süd', ['094', '095', '096'].every((rb) => ags.filter((a) => a.startsWith(rb)).every((a) => D.fkZuordnung[a] === 'nord')) && ['091', '092'].every((rb) => ags.filter((a) => a.startsWith(rb)).every((a) => D.fkZuordnung[a] === 'sued')));
check('Schwaben: Süd, außer Dillingen und Donau-Ries (Nord)', ags.filter((a) => a.startsWith('097')).every((a) => D.fkZuordnung[a] === (['09773', '09779'].includes(a) ? 'nord' : 'sued')));
check('Nördliche Oberpfalz (Quelle nennt Nord und Süd): keine geratene Familienkasse', ['09361', '09363', '09371', '09372', '09374', '09376', '09377'].every((a) => b('kindergeld', a) === null));

check('Nördliche Oberpfalz: Hinweis mit beiden Familienkassen und Servicenummer', (() => { const h = Behoerden.hinweis('kindergeld', '09363'); return h && h.key === 'beh.fkUnklar' && h.p.nord === '90316 Nürnberg' && h.p.sued === '93013 Regensburg' && /0800/.test(h.p.tel); })());
check('Kein Hinweis, wo die Familienkasse eindeutig ist', Behoerden.hinweis('kindergeld', '09572') === null && Behoerden.hinweis('wohngeld', '09363') === null);

// ZBFS und Bezirke nach Regierungsbezirk
check('Blindengeld Eckental -> ZBFS Region Mittelfranken', b('blindengeld', '09572').name === 'Zentrum Bayern Familie und Soziales, Region Mittelfranken');
check('Schwerbehindertenausweis München -> ZBFS Region Oberbayern', /Region Oberbayern/.test(b('ausweis', '09162').name) && b('ausweis', '09162').abt === 'Schwerbehindertenrecht');
check('Eingliederungshilfe Würzburg -> Bezirk Unterfranken', b('eingl', '09663').name === 'Bezirk Unterfranken');
check('Budget für Arbeit Augsburg -> Bezirk Schwaben', b('arbeit', '09761').name === 'Bezirk Schwaben');
check('7 Bezirke und 7 ZBFS-Regionalstellen mit Anschrift', Object.keys(D.bezirke).length === 7 && Object.keys(D.zbfs).length === 7 && Object.values(D.bezirke).concat(Object.values(D.zbfs)).every((x) => x.anschrift && x.quelle));
check('Besucheranschrift nur, wenn sie von der Postanschrift abweicht', b('eingl', '09162').haus && b('eingl', '09162').haus.join(', ') === 'Prinzregentenstr. 14, 80538 München' && b('wohngeld', '09572').haus === null);
check('ohne Kreis -> null; Kreis außerhalb Bayerns ohne Eintrag (Berlin) -> null', b('wohngeld', null) === null && b('wohngeld', '') === null && b('wohngeld', '11000') === null);
check('Kreis ohne belegte Anschrift: Name und Website, keine Anschrift', (() => { const x = ags.find((a) => !D.kreise[a].anschrift); return !x || (b('wohngeld', x).anschrift === null && b('wohngeld', x).web); })());

// Zusammenspiel mit der PLZ: Postleitzahl -> Kreis -> Stelle
check('PLZ 90542 (Eckental) -> Landratsamt Erlangen-Höchstadt', b('wohngeld', Plz.lookup('90542').ags).name === 'Landratsamt Erlangen-Höchstadt');
check('PLZ 80331 -> Landeshauptstadt München', b('wohngeld', Plz.lookup('80331').ags).name === 'Landeshauptstadt München');
check('PLZ 20095 (Hamburg) -> keine Stelle', b('wohngeld', Plz.lookup('20095').ags) === null);

console.log(fails ? '\n' + fails + ' FEHLER von ' + n : '\nBehörden-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
