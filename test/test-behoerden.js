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
// Außerhalb Bayerns: Name, Website und (aus dem Handy-Abruf geprüfte) Anschrift; nur gesicherte Zuständigkeiten
const bd = (id, a) => Behoerden.fuer(id, a);
// Anschrift nur aus amtlicher Quelle (Impressum); Anschriften aus Wikipedia werden nicht gezeigt (Prüfung Richtigkeit 21.11.2026)
// Anschrift nur aus amtlicher Quelle (Impressum/Kontaktseite der Behörde); frühere Wikipedia-Anschriften am 21.11.2026 gegen die Behörden-Website geprüft
check('[beh-de] Köln (kreisfreie Stadt): Stadt Köln mit Website und Anschrift laut Impressum (Historisches Rathaus, 50667 Köln, Abruf 21.11.2026)', bd('wohngeld', '05315').name === 'Stadt Köln' && /stadt-koeln\.de/.test(bd('wohngeld', '05315').web) && JSON.stringify(bd('wohngeld', '05315').anschrift) === JSON.stringify(['Historisches Rathaus', '50667 Köln']) && /^https:\/\/www\.stadt-koeln\.de\//.test(bd('wohngeld', '05315').quelle) && bd('wohngeld', '05315').stand === '21.11.2026' && bd('gsa', '05315').name === 'Stadt Köln' && bd('uvg', '05315').name === 'Stadt Köln');
check('[beh-de] Wuppertal (Website nicht amtlich abrufbar): Stadt Wuppertal mit Website, ohne Anschrift', bd('wohngeld', '05124').name === 'Stadt Wuppertal' && /wuppertal\.de/.test(bd('wohngeld', '05124').web) && bd('wohngeld', '05124').anschrift === null);
check('[beh-de] Nie Wikipedia als Quelle: quelleArt nur impressum oder ohne-beleg (Prüfung 21.11.2026)', Object.values(DE.kreise).every((e) => !e.quelleArt || e.quelleArt === 'impressum' || (e.quelleArt === 'ohne-beleg' && !e.anschrift && !e.quelle)));
check('[beh-de] Solingen: Anschrift laut Impressum (Walter-Scheel-Platz 1, 42651 Solingen, Abruf 21.11.2026); Neckar-Odenwald-Kreis laut Impressum bestätigt', JSON.stringify(bd('wohngeld', '05122').anschrift) === JSON.stringify(['Walter-Scheel-Platz 1', '42651 Solingen']) && /solingen\.de\/inhalt\/stadt-solingen-impressum/.test(bd('wohngeld', '05122').quelle) && DE.kreise['08225'].quelleArt === 'impressum' && JSON.stringify(DE.kreise['08225'].anschrift) === JSON.stringify(['Neckarelzer Straße 7', '74821 Mosbach']));
check('[beh-de] Jede gezeigte Anschrift hat eine amtliche Quelle (keine wikipedia.org)', Object.keys(DE.kreise).every((k) => { const b = bd('wohngeld', k), e = DE.kreise[k]; return !b || !b.anschrift || (/^https?:\/\//.test(b.quelle) && !/wikipedia\.org/i.test(b.quelle) && !/wikipedia\.org/i.test(e.quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(b.stand)); }));
check('[beh-de] Mindestens 45 der 60 früheren Wikipedia-Anschriften amtlich belegt (Prüfung 21.11.2026), höchstens 15 ohne Anschrift', Object.values(DE.kreise).filter((e) => e.quelleArt !== 'impressum').length <= 15 && Object.values(DE.kreise).filter((e) => e.stand === '21.11.2026' && e.quelleArt === 'impressum').length >= 45);
check('[beh-de] Keine Anschrift aus Wikipedia, jede gezeigte Anschrift mit Impressum als Quelle', Object.keys(DE.kreise).every((k) => { const b = bd('wohngeld', k); return b && (b.anschrift ? b.quelleArt === 'impressum' && DE.kreise[k].quelleArt === 'impressum' : DE.kreise[k].quelleArt !== 'impressum' && /^https?:\/\//.test(b.web)); }));
// Alle Anschriften außerhalb Bayerns: Quelle und Abrufdatum, zwei saubere Zeilen, PLZ im selben Bundesland wie die Behörde
{
  const PK = (plz) => (P.plz[plz] || []).filter((e) => e[1] >= 0).map((e) => P.kreise[e[1]].ags);
  const schlecht = Object.entries(DE.kreise).filter(([ags, e]) => e.anschrift && !(
    // Zwei Zeilen (Straße/Postfach, PLZ Ort) oder eine Zeile (nur Großkunden-PLZ laut Behörde, z. B. „48127 Münster“). PLZ im Land der Behörde;
    // Großkunden- und Postfach-PLZ fehlen in der PLZ-Liste – dann muss der Ort im Namen der Behörde stehen (Stadt Essen → 45121 Essen).
    (e.anschrift.length === 2 ? /^[A-ZÄÖÜa-zäöüß0-9]/.test(e.anschrift[0]) && !/[():;]|^(Haus|Post)?anschrift/i.test(e.anschrift[0]) : e.anschrift.length === 1) && /^\d{5} [A-ZÄÖÜ]/.test(e.anschrift[e.anschrift.length - 1]) &&
    (P.plz[e.anschrift[e.anschrift.length - 1].slice(0, 5)] ? PK(e.anschrift[e.anschrift.length - 1].slice(0, 5)).some((a) => a.slice(0, 2) === ags.slice(0, 2)) : e.name.includes(e.anschrift[e.anschrift.length - 1].slice(6))) && /^(impressum|wikipedia)$/.test(e.quelleArt) && /^https?:\/\//.test(e.quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(e.stand)));
  check('[beh-de] Alle Anschriften außerhalb Bayerns sauber, mit Quelle und Abrufdatum, PLZ im Bundesland der Behörde', schlecht.length === 0, schlecht.slice(0, 5).map(([a, e]) => a + ' ' + e.anschrift.join(', ')).join(' | '));
  check('[beh-de] Mindestens 290 von 302 Stellen außerhalb Bayerns mit Anschrift', Object.values(DE.kreise).filter((e) => e.anschrift).length >= 290);
}
check('[beh-de] Landkreis (Kreis Mettmann): Grundsicherung im Alter und Wohngeld mit Anschrift (Wohngeld mit Hinweis auf Weiterleitung, § 16 SGB I), kein Jugendamt', bd('gsa', '05158').name === 'Kreis Mettmann' && bd('wohngeld', '05158').name === 'Kreis Mettmann' && bd('wohngeld', '05158').weiter === true && !!bd('wohngeld', '05158').anschrift && bd('uvg', '05158') === null);
check('[beh-de] Kreisfreie Stadt: Wohngeld ohne Weiterleitungs-Hinweis', bd('wohngeld', '14713').weiter === false);
check('[beh-de] Jeder Landkreis außerhalb Bayerns mit Impressum-Anschrift hat für Wohngeld eine Anschrift', Object.keys(DE.kreise).filter((k) => DE.kreise[k].quelleArt === 'impressum').every((k) => { const b = bd('wohngeld', k); return b && b.anschrift && b.anschrift.length >= 1 && /^\d{5} /.test(b.anschrift[b.anschrift.length - 1]); }));
check('[beh-de] Berlin und Hamburg: keine Stadt-Angabe (dort die Bezirksämter)', bd('wohngeld', '11000') === null && bd('wohngeld', '02000') === null);
check('[beh-de] Landkreis und Stadt Leipzig getrennt', bd('wohngeld', '14713').name === 'Stadt Leipzig' && bd('wohngeld', '14729').name === 'Landkreis Leipzig' && bd('gsa', '14729').name === 'Landkreis Leipzig');
check('[beh-de] Alle Kreise außerhalb Bayerns (außer Berlin, Hamburg) mit Website, 79 kreisfreie Städte', P.kreise.filter((k) => !/^(09|11|02)/.test(k.ags)).every((k) => DE.kreise[k.ags] && /^https?:\/\//.test(DE.kreise[k.ags].web)) && Object.values(DE.kreise).filter((e) => e.typ === 'stadt').length === 79);
{ // Anschrift aus dem Handy-Abruf (nur Beispiel im Speicher): erscheint mit Stand
  const D2 = JSON.parse(JSON.stringify(D)); D2.de.kreise['05315'] = Object.assign({}, D2.de.kreise['05315'], { anschrift: ['Beispielplatz 1', '50667 Köln'], stand: '11.11.2026', quelle: 'https://example.org/impressum', quelleArt: 'impressum' });
  Behoerden.init(D2);
  check('[beh-de] Anschrift aus dem Handy-Abruf wird genutzt', JSON.stringify(Behoerden.fuer('wohngeld', '05315').anschrift) === JSON.stringify(['Beispielplatz 1', '50667 Köln']) && Behoerden.fuer('wohngeld', '05315').stand === '11.11.2026');
  Behoerden.init(D);
}
// WBS-Empfänger (Wohnungsamt): nur kreisfreie Städte, nie Landkreise; Berlin und Hamburg bleiben ohne Angabe
check('[wbs-stelle] Cottbus (kreisfreie Stadt, Impressum): Stadt Cottbus, Wohnungsamt, Anschrift mit Quelle und Stand, ohne Weiterleitungs-Hinweis', bd('wbs', '12052').name === 'Stadt Cottbus' && bd('wbs', '12052').abt === 'Wohnungsamt' && /^03\d{3} Cottbus$/.test(bd('wbs', '12052').anschrift[1]) && /^https?:\/\//.test(bd('wbs', '12052').quelle) && !!bd('wbs', '12052').stand && !bd('wbs', '12052').weiter);
check('[wbs-stelle] Leipzig (Stadt): Wohnungsamt; Landkreis Leipzig, Kreis Mettmann: keine Angabe', bd('wbs', '14713').name === 'Stadt Leipzig' && bd('wbs', '14729') === null && bd('wbs', '05158') === null);
check('[wbs-stelle] Alle 79 kreisfreien Städte außerhalb Bayerns mit Wohnungsamt (Anschrift nur aus dem Impressum), kein Landkreis', Object.entries(DE.kreise).every(([a, e]) => { const b = bd('wbs', a); return e.typ === 'stadt' ? !!b && b.abt === 'Wohnungsamt' && !!b.anschrift === (e.quelleArt === 'impressum') && b.name === e.name : b === null; }));
check('[wbs-stelle] Berlin und Hamburg: keine Angabe (Bezirksämter)', bd('wbs', '11000') === null && bd('wbs', '02000') === null);
check('[wbs-stelle] Bayern: kreisfreie Stadt (München, Ingolstadt) mit Wohnungsamt und Anschrift', bd('wbs', '09162').name === 'Landeshauptstadt München' && bd('wbs', '09162').abt === 'Wohnungsamt' && !!bd('wbs', '09162').anschrift && bd('wbs', '09161').name === 'Stadt Ingolstadt');
check('[wbs-stelle] Bayern: Landkreis ohne Große Kreisstadt (Erlangen-Höchstadt) -> Landratsamt mit Anschrift; Landkreis mit Großer Kreisstadt (Landshut ohne, Freising mit) -> Freising keine Angabe', /Landratsamt Erlangen-Höchstadt/.test((bd('wbs', '09572') || {}).name) && !!bd('wbs', '09572').anschrift && bd('wbs', '09572').abt === 'Wohnberechtigungsschein' && bd('wbs', '09178') === null && /Landratsamt/.test((bd('wbs', '09274') || {}).name));
check('[wbs-stelle] Bayern: alle 25 kreisfreien Städte mit Angabe; Landkreise mit Ausnahme-Liste (32 Kreise, 37 Städte) ohne Angabe, alle übrigen Landkreise mit Landratsamt', (() => { const A = D.wbsAusnahme; const lk = Object.keys(D.kreise).filter((a) => Number(a.slice(3)) > 70); const ex = Object.keys(A.kreise); return Object.keys(D.kreise).filter((a) => Number(a.slice(3)) <= 70).every((a) => !!bd('wbs', a)) && ex.length === 32 && Object.values(A.kreise).reduce((n, l) => n + l.length, 0) === 37 && ex.every((a) => lk.includes(a) && bd('wbs', a) === null) && lk.filter((a) => !ex.includes(a)).every((a) => /^Landratsamt /.test(bd('wbs', a).name) && !!bd('wbs', a).anschrift) && /^https:\/\/www\.bayernportal\.de\//.test(A.quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(A.stand); })());
check('[wbs-stelle] Ohne Ausnahme-Liste in den Daten: Landkreise sicherheitshalber ohne Angabe', (() => { const D3 = JSON.parse(JSON.stringify(D)); delete D3.wbsAusnahme; Behoerden.init(D3); const r = Behoerden.fuer('wbs', '09572'); Behoerden.init(D); return r === null; })());
check('[wbs-stelle] Unbekannter Kreis oder fehlender Ort: keine Angabe; Wohngeld in Bayern unverändert', bd('wbs', null) === null && bd('wbs', '99999') === null && !!bd('wohngeld', '09572'));
// Familienkasse außerhalb Bayerns (nur Länder mit genau einer Familienkasse)
check('[fk-land] Kindergeld und Kinderzuschlag: Hessen, Niedersachsen/Bremen, Sachsen, Sachsen-Anhalt/Thüringen, Berlin/Brandenburg mit Postanschrift, Quelle arbeitsagentur.de und Stand', [['06411', 'Familienkasse Hessen', '34196 Kassel'], ['03241', 'Familienkasse Niedersachsen-Bremen', '30131 Hannover'], ['04011', 'Familienkasse Niedersachsen-Bremen', '30131 Hannover'], ['14713', 'Familienkasse Sachsen', '09092 Chemnitz'], ['15003', 'Familienkasse Sachsen-Anhalt-Thüringen', '06073 Halle'], ['16051', 'Familienkasse Sachsen-Anhalt-Thüringen', '06073 Halle'], ['11000', 'Familienkasse Berlin-Brandenburg', '14465 Potsdam'], ['12054', 'Familienkasse Berlin-Brandenburg', '14465 Potsdam']].every(([a, n, p]) => ['kindergeld', 'kiz', 'kgBeh'].every((id) => { const r = bd(id, a); return r && r.name === n && r.anschrift.join(', ') === p && /^https:\/\/www\.arbeitsagentur\.de\//.test(r.quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(r.stand); })));
check('[fk-land] Länder mit mehreren Familienkassen (NRW, Baden-Württemberg): keine Angabe, weil die Zuordnung je Kreis nicht amtlich belegt ist', ['05315', '08111', '05111', '08221'].every((a) => bd('kindergeld', a) === null));
check('[fk-land] Hamburg, Schleswig-Holstein, Mecklenburg-Vorpommern -> Familienkasse Nord 20069 Hamburg; Rheinland-Pfalz, Saarland -> Familienkasse Rheinland-Pfalz-Saarland 55149 Mainz', ['02000', '01001', '13003'].every((a) => bd('kindergeld', a) && bd('kindergeld', a).name === 'Familienkasse Nord' && bd('kindergeld', a).anschrift[0] === '20069 Hamburg') && ['07111', '10041'].every((a) => bd('kiz', a) && bd('kiz', a).name === 'Familienkasse Rheinland-Pfalz-Saarland' && bd('kiz', a).anschrift[0] === '55149 Mainz'));
check('[fk-land] Kinderzuschlag trägt den Zusatz „Kinderzuschlag“; Bayern unverändert (Nord/Süd)', bd('kiz', '06411').abt === 'Kinderzuschlag' && bd('kindergeld', '09572').name === 'Familienkasse Bayern Nord');
check('[fk-land] Alle Kreise der Länder mit einer Familienkasse haben sie, NRW und Baden-Württemberg keine', P.kreise.filter((k) => !k.ags.startsWith('09')).every((k) => { const sol = /^(01|02|03|04|06|07|10|11|12|13|14|15|16)/.test(k.ags); const r = bd('kindergeld', k.ags); return sol ? !!(r && r.anschrift) : r === null; }));
check('[jobcenter-de] Einzeln belegte Jobcenter (Stuttgart, Bonn, Wiesbaden) mit Anschrift, Quelle und Stand; alle übrigen Kreise außerhalb Bayerns keine Angabe', ['08111', '05314', '06414'].every((a) => { const r = bd('ggeld', a); return r && /^Jobcenter|^Kommunales Jobcenter/.test(r.name) && r.anschrift.length === 2 && /^https?:\/\//.test(r.quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(r.stand); }) && bd('ggeld', '06414').anschrift[0] === 'Postfach 3920' && bd('ggeld', '06414').haus.join(', ') === 'Konradinerallee 11, 65189 Wiesbaden' && bd('ggeld', '05315') === null && bd('ggeld', '14713') === null && bd('ggeld', '09572').name === 'Jobcenter Erlangen-Höchstadt');
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
check('[lpg-stelle] Landespflegegeld -> Landesamt für Pflege, Postfach Amberg, Hausanschrift abweichend, Quelle lfp.bayern.de mit Stand, auch ohne Kreis', b('lpg', null).name === 'Bayerisches Landesamt für Pflege' && b('lpg', null).abt === 'Landespflegegeld' && b('lpg', null).anschrift.join(', ') === 'Postfach 13 65, 92203 Amberg' && b('lpg', '09572').haus.join(', ') === 'Mildred-Scheel-Str. 4, 92224 Amberg' && /^https:\/\/www\.lfp\.bayern\.de\//.test(b('lpg', '09572').quelle) && /^\d{1,2}\.\d{1,2}\.20\d\d$/.test(b('lpg', '09572').stand));
check('[lpg-stelle] Landespflegegeld gilt nur in Bayern: Wohnort außerhalb Bayerns (Köln) keine Angabe', b('lpg', '05315') === null);
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
