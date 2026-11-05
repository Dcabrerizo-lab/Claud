// Erzeugt content/behoerden-bayern.json: Landratsämter und kreisfreie Städte in Bayern mit Anschrift.
// Quellen (content/quellen/roh/, abgerufen vom Workflow "Quellen abrufen"):
//  - Namen und Websites: Übersichten des Bayerischen Staatsministeriums für Wohnen, Bau und Verkehr
//  - Anschriften: Impressum (bzw. Startseite) der jeweiligen Behörde, also ihre eigene Angabe
// Die Auswahl der Anschrift (viele Impressen nennen auch Dienstleister, Außenstellen oder Datenschutzbeauftragte) steht
// unten in AUSWAHL. Das Skript prüft, dass Straße und Ort wörtlich in der genannten Quelldatei stehen, und bricht sonst ab.
// Aufruf: node tools/build-behoerden.js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'content', 'quellen', 'roh');
const OUT = path.join(ROOT, 'content', 'behoerden-bayern.json');
const abruf = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'quellen', 'abruf.json'), 'utf8'));
const plz = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'plz-data.json'), 'utf8'));

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16))).replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
  .replace(/&Auml;/g, 'Ä').replace(/&Ouml;/g, 'Ö').replace(/&Uuml;/g, 'Ü').replace(/&szlig;/g, 'ß');
// Text einer Seite, Leerraum vereinheitlicht (für die wörtliche Prüfung)
function seitentext(datei) {
  const html = fs.readFileSync(path.join(RAW, datei), 'utf8');
  return decode(html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/[\s ]+/g, ' ');
}

// ---------- Namen und Websites aus den Übersichten des Ministeriums ----------
function verweise(datei, muster) {
  const html = fs.readFileSync(path.join(RAW, datei), 'utf8');
  const main = html.slice(html.indexOf('id="main"'));
  return [...main.matchAll(/<a[^>]+href="([^"]+)"[^>]*>\s*((?:Landratsamt|Landeshauptstadt|Stadt) [^<]*)<\/a>/g)]
    .map((m) => ({ web: m[1], name: decode(m[2]).trim() })).filter((x) => muster.test(x.name));
}
const lra = verweise('stmb-landkreise.html', /^Landratsamt /);
const staedte = verweise('stmb-kreisfreie-staedte.html', /^(Stadt|Landeshauptstadt) /);
if (lra.length !== 71 || staedte.length !== 25) throw new Error(`Ministerium: erwartet 71 Landratsämter und 25 Städte, gefunden ${lra.length}/${staedte.length}`);

// Zuordnung zum Kreisschlüssel über die Startseiten-Datei (start-<ags>.html wurde aus genau diesen Verweisen erzeugt, s. QUELLEN.txt)
const quellen = fs.readFileSync(path.join(ROOT, 'content', 'quellen', 'QUELLEN.txt'), 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/));
const urlVon = (datei) => (quellen.find((q) => q[0] === datei) || [])[1];
const agsZuWeb = {};
quellen.forEach(([datei, url]) => { const m = datei.match(/^start-(\d{5})\.html$/); if (m) agsZuWeb[m[1]] = url; });

// ---------- Auswahl der Anschrift je Kreis: [Quelldatei, Straße, PLZ Ort] wie in der Quelle geschrieben ----------
const AUSWAHL = {
  '09161': ['impressum-09161.html', 'Rathausplatz 4', '85049 Ingolstadt'],
  '09162': ['impressum-09162.html', 'Marienplatz 8', '80331 München'],
  '09163': ['impressum-09163.html', 'Königstraße 24', '83022 Rosenheim'],
  '09171': ['impressum-09171.html', 'Bahnhofstr. 38', '84503 Altötting'],
  '09172': ['impressum-09172.html', 'Salzburger Straße 64', '83435 Bad Reichenhall'],
  '09173': ['impressum-09173.html', 'Prof.-Max-Lange-Platz 1', '83646 Bad Tölz'],
  '09174': ['impressum-09174.html', 'Weiherweg 16', '85221 Dachau'],
  '09176': ['impressum-09176.html', 'Residenzplatz 1', '85072 Eichstätt'],
  '09177': ['impressum-09177.html', 'Alois-Schießl-Platz 2', '85435 Erding'],
  '09178': ['impressum-09178.html', 'Landshuter Str. 31', '85356 Freising'],
  '09179': ['impressum-09179.html', 'Münchner Str. 32', '82256 Fürstenfeldbruck'],
  '09180': ['impressum-09180.html', 'Olympiastraße 10', '82467 Garmisch-Partenkirchen'],
  '09181': ['impressum-09181.html', 'Von-Kühlmann-Straße 15', '86899 Landsberg am Lech'],
  '09182': ['impressum-09182.html', 'Riezlerstr. 2', '83714 Miesbach'],
  '09183': ['impressum-09183.html', 'Töginger Straße 18', '84453 Mühldorf a. Inn'],
  '09184': ['impressum-09184.html', 'Mariahilfplatz 17', '81541 München'],
  '09185': ['impressum-09185.html', 'Platz der Deutschen Einheit 1', '86633 Neuburg a.d.Donau'],
  '09186': ['impressum-09186.html', 'Hauptplatz 22', '85276 Pfaffenhofen a.d.Ilm'],
  '09187': ['impressum-09187.html', 'Wittelsbacherstraße 53', '83022 Rosenheim'],
  '09188': ['impressum-09188.html', 'Strandbadstraße 2', '82319 Starnberg'],
  '09189': ['impressum-09189.html', 'Papst-Benedikt-XVI.-Platz', '83278 Traunstein'],
  '09190': ['impressum-09190.html', 'Pütrichstraße 8', '82362 Weilheim i. OB'],
  '09261': ['impressum-09261.html', 'Luitpoldstraße 29', '84034 Landshut'],
  '09262': ['impressum-09262.html', 'Rathausplatz 2', '94032 Passau'],
  '09263': ['impressum-09263.html', 'Theresienplatz 2', '94315 Straubing'],
  '09271': ['impressum-09271.html', 'Herrenstraße 18', '94469 Deggendorf'],
  '09272': ['impressum2-09272.html', 'Grafenauer Str. 44', '94078 Freyung'],
  '09273': ['impressum-09273.html', 'Donaupark 12', '93309 Kelheim'],
  '09274': ['impressum2-09274.html', 'Josef-Neumeier-Allee 1', '84051 Essenbach'],
  '09275': ['impressum-09275.html', 'Domplatz 11', '94032 Passau'],
  '09276': ['impressum-09276.html', 'Poschetsrieder Str. 16', '94209 Regen'],
  '09277': ['impressum-09277.html', 'Ringstraße 4 - 7', '84347 Pfarrkirchen'],
  '09278': ['impressum-09278.html', 'Leutnerstraße 15', '94315 Straubing'],
  '09279': ['impressum-09279.html', 'Obere Stadt 1', '84130 Dingolfing'],
  '09361': ['impressum-09361.html', 'Marktplatz 11', '92224 Amberg'],
  '09362': ['impressum-09362.html', 'Rathausplatz 1', '93047 Regensburg'],
  '09363': ['impressum-09363.html', 'Dr.-Pfleger-Straße 15', '92637 Weiden i.d.OPf.'],
  '09371': ['impressum-09371.html', 'Schloßgraben 3', '92224 Amberg'],
  '09372': ['impressum-09372.html', 'Rachelstraße 6', '93413 Cham'],
  '09373': ['impressum-09373.html', 'Nürnberger Straße 1', '92318 Neumarkt i.d.OPf.'],
  '09374': ['impressum-09374.html', 'Am Hohlweg 2', '92660 Neustadt an der Waldnaab'],
  '09376': ['impressum-09376.html', 'Wackersdorfer Str. 80', '92421 Schwandorf'],
  '09377': ['impressum-09377.html', 'Mähringer Straße 7', '95643 Tirschenreuth'],
  '09461': ['impressum2-09461.html', 'Maximiliansplatz 3', '96047 Bamberg'],
  '09462': ['impressum-09462.html', 'Luitpoldplatz 13', '95444 Bayreuth'],
  '09463': ['impressum-09463.html', 'Markt 1', '96450 Coburg'],
  '09471': ['impressum-09471.html', 'Ludwigstraße 23', '96052 Bamberg'],
  '09472': ['impressum-09472.html', 'Markgrafenallee 5', '95448 Bayreuth'],
  '09473': ['impressum-09473.html', 'Lauterer Straße 60', '96450 Coburg'],
  '09475': ['impressum-09475.html', 'Schaumbergstraße 14', '95032 Hof'],
  '09476': ['impressum-09476.html', 'Güterstraße 18', '96317 Kronach'],
  '09477': ['impressum-09477.html', 'Konrad-Adenauer-Straße 5', '95326 Kulmbach'],
  '09478': ['start-09478.html', 'Kronacher Str. 30', '96215 Lichtenfels'],
  '09479': ['impressum-09479.html', 'Jean-Paul-Straße 9', '95632 Wunsiedel'],
  '09561': ['impressum-09561.html', 'Johann-Sebastian-Bach-Platz 1', '91522 Ansbach'],
  '09562': ['impressum2-09562.html', 'Rathausplatz 1', '91052 Erlangen'],
  '09563': ['impressum-09563.html', 'Königstraße 88', '90762 Fürth'],
  '09564': ['impressum-09564.html', 'Fünferplatz 2', '90403 Nürnberg'],
  '09565': ['impressum-09565.html', 'Ludwigstraße 16', '91126 Schwabach'],
  '09571': ['impressum-09571.html', 'Crailsheimstraße 1', '91522 Ansbach'],
  '09572': ['impressum-09572.html', 'Nägelsbachstraße 1', '91052 Erlangen'],
  '09574': ['impressum-09574.html', 'Waldluststraße 1', '91207 Lauf an der Pegnitz'],
  '09575': ['start-09575.html', 'Konrad-Adenauer-Straße 1', '91413 Neustadt a.d.Aisch'],
  '09576': ['impressum2-09576.html', 'Weinbergweg 1', '91154 Roth'],
  '09577': ['impressum-09577.html', 'Bahnhofstraße 2', '91781 Weißenburg i. Bay.'],
  '09661': ['impressum-09661.html', 'Dalbergstraße 15', '63739 Aschaffenburg'],
  '09662': ['impressum-09662.html', 'Markt 1', '97421 Schweinfurt'],
  '09663': ['impressum-09663.html', 'Rückermainstraße 2', '97070 Würzburg'],
  '09671': ['impressum-09671.html', 'Bayernstraße 18', '63739 Aschaffenburg'],
  '09673': ['impressum-09673.html', 'Spörleinstraße 11', '97616 Bad Neustadt a. d. Saale'],
  '09674': ['impressum-09674.html', 'Am Herrenhof 1', '97437 Haßfurt'],
  '09675': ['impressum-09675.html', 'Kaiserstraße 4', '97318 Kitzingen'],
  '09676': ['impressum-09676.html', 'Brückenstraße 2', '63897 Miltenberg'],
  '09677': ['impressum-09677.html', 'Marktplatz 8', '97753 Karlstadt'],
  '09678': ['impressum-09678.html', 'Schrammstr. 1', '97421 Schweinfurt'],
  '09679': ['impressum-09679.html', 'Zeppelinstraße 15', '97074 Würzburg'],
  '09761': ['impressum-09761.html', 'Rathausplatz 1', '86150 Augsburg'],
  '09762': ['impressum-09762.html', 'Kaiser-Max-Straße 1', '87600 Kaufbeuren'],
  '09763': ['impressum-09763.html', 'Rathausplatz 22', '87435 Kempten (Allgäu)'],
  '09764': ['impressum-09764.html', 'Marktplatz 1', '87700 Memmingen'],
  '09771': ['impressum-09771.html', 'Münchener Str. 9', '86551 Aichach'],
  '09772': ['impressum-09772.html', 'Prinzregentenplatz 4', '86150 Augsburg'],
  '09773': ['impressum-09773.html', 'Große Allee 24', '89407 Dillingen a.d.Donau'],
  '09774': ['impressum-09774.html', 'An der Kapuzinermauer 1', '89312 Günzburg'],
  '09775': ['impressum-09775.html', 'Kantstraße 8', '89231 Neu-Ulm'],
  '09776': ['impressum-09776.html', 'Stiftsplatz 4', '88131 Lindau (Bodensee)'],
  '09777': ['impressum2-09777.html', 'Schwabenstraße 11', '87616 Marktoberdorf'],
  '09778': ['impressum-09778.html', 'Bad Wörishofer Str. 33', '87719 Mindelheim'],
  '09779': ['impressum-09779.html', 'Pflegstraße 2', '86609 Donauwörth'],
  '09780': ['impressum-09780.html', 'Oberallgäuer Platz 2', '87527 Sonthofen']
};
// Ohne abrufbare Quelle (Seite lehnte den Abruf ab oder antwortete nicht): nur Name und Website, keine geratene Anschrift
const OHNE_ANSCHRIFT = ['09175', '09375', '09464', '09474', '09573', '09672'];

const deDatum = (iso) => { const [y, m, d] = iso.slice(0, 10).split('-'); return Number(d) + '.' + Number(m) + '.' + y; };
const fehler = [];
const kreise = {};
plz.kreise.forEach((k) => {
  const ags = k.ags;
  const web = agsZuWeb[ags];
  const eintrag = [...lra, ...staedte].find((x) => x.web === web);
  if (!eintrag) { fehler.push(ags + ': kein Eintrag im Ministerium für ' + web); return; }
  const e = { name: eintrag.name, web: web.replace(/^http:\/\//, 'https://'), anschrift: null, quelle: '', stand: '' };
  const a = AUSWAHL[ags];
  if (a) {
    const [datei, strasse, ort] = a;
    const log = abruf.find((x) => x.datei === datei);
    if (!log || !log.ok) { fehler.push(ags + ': Quelldatei fehlt: ' + datei); return; }
    const t = seitentext(datei);
    if (!t.includes(strasse)) fehler.push(ags + ': Straße nicht in der Quelle: ' + strasse + ' (' + datei + ')');
    if (!t.includes(ort)) fehler.push(ags + ': Ort nicht in der Quelle: ' + ort + ' (' + datei + ')');
    e.anschrift = [strasse, ort];
    e.quelle = urlVon(datei) || log.url;
    e.stand = deDatum(log.abgerufen);
  } else if (!OHNE_ANSCHRIFT.includes(ags)) fehler.push(ags + ': weder Anschrift noch als fehlend vermerkt');
  kreise[ags] = e;
});
if (Object.keys(kreise).length !== 96) fehler.push('erwartet 96 Kreise, erzeugt ' + Object.keys(kreise).length);
if (fehler.length) { console.error('Fehler:\n  ' + fehler.join('\n  ')); process.exit(1); }

const data = {
  stand: 'Anschriften laut Impressum der Behörden, abgerufen ' + deDatum([...new Set(abruf.filter((x) => /^(impressum|start)/.test(x.datei) && x.ok).map((x) => x.abgerufen))].sort().pop()),
  kreise,
  fest: {
    // Bundesweit eine Anschrift (www.rundfunkbeitrag.de, Kontakt)
    beitragsservice: { name: 'ARD ZDF Deutschlandradio Beitragsservice', anschrift: ['50656 Köln'], web: 'https://www.rundfunkbeitrag.de', quelle: 'https://www.rundfunkbeitrag.de', stand: '' }
  }
};
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
const mit = Object.values(kreise).filter((k) => k.anschrift).length;
console.log(`behoerden-bayern.json: 96 Kreise, davon ${mit} mit Anschrift, ${96 - mit} nur mit Name und Website`);
