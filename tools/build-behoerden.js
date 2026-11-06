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
// Impressum nicht abrufbar (Seite lehnte den Abruf ab oder antwortete nicht): Anschrift stattdessen aus dem BayernPortal (s. u.)
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

// ---------- BayernPortal: Jobcenter, Familienkasse, Bezirke, ZBFS ----------
// Zuständigkeit je Kreis aus der amtlichen Seite "Ausgewählte Behörden ... zuständig für das Gebiet" einer Gemeinde des Kreises
// (bp-gem-<Kreisschlüssel>.html). Gegenprobe: Die Seite muss den Bezirk des Regierungsbezirks und bei Landkreisen das
// Landratsamt des Kreises nennen; sonst bricht das Skript ab.
const bp = require('./bayernportal.js');
const R = (datei) => path.join(RAW, datei);
const ok = (datei) => { const l = abruf.find((x) => x.datei === datei); return l && l.ok ? l : null; };
const RB = { '091': 'Oberbayern', '092': 'Niederbayern', '093': 'Oberpfalz', '094': 'Oberfranken', '095': 'Mittelfranken', '096': 'Unterfranken', '097': 'Schwaben' };
const norm = (s) => String(s).toLowerCase().replace(/ß/g, 'ss').replace(/a\.d\.|a\. d\.|an der/g, 'ad').replace(/i\.d\.|in der/g, 'id').replace(/[^a-zäöü]/g, '');

// Für Anschreiben: Postanschrift, wenn angegeben, sonst Hausanschrift
function bpStelle(datei, name) {
  const l = ok(datei);
  if (!l) return null;
  const a = bp.anschrift(R(datei));
  if (!a) { fehler.push('keine Anschrift in ' + datei); return null; }
  return { name: name || a.titel, anschrift: a.post && a.post.length ? a.post : a.haus, haus: a.haus, quelle: urlVon(datei) || l.url, stand: deDatum(l.abgerufen) };
}

const jobcenter = {}, fkZuordnung = {}, lraBp = {}, fkUnklar = [];
// Amtliche Liste aller Jobcenter in Bayern (gemeinsame Einrichtungen und zugelassene kommunale Träger)
const JC_ALLE = bp.verweise(R('bp-jc-alle.html'));
const jcId = {}; JC_ALLE.forEach((x) => { jcId[x.id] = x.name; });
const jcNachName = {}; JC_ALLE.forEach((x) => { jcNachName[x.name] = x.id; });
plz.kreise.forEach((k) => {
  const ags = k.ags, rb = ags.slice(0, 3), datei = 'bp-gem-' + ags + '.html';
  if (!ok(datei)) { fehler.push(ags + ': Zuständigkeitsseite fehlt (' + datei + ')'); return; }
  const v = bp.verweise(R(datei));
  const bez = v.filter((x) => /^Bezirk /.test(x.name)).map((x) => x.name);
  if (bez.length !== 1 || bez[0] !== 'Bezirk ' + RB[rb]) fehler.push(ags + ': Bezirk passt nicht: ' + bez.join(', '));
  if (Number(ags.slice(3)) > 70) {
    const lra = v.filter((x) => /^Landratsamt /.test(x.name) && norm(x.name) === norm(kreise[ags].name));
    if (lra.length !== 1) fehler.push(ags + ': Landratsamt ' + kreise[ags].name + ' nicht auf der Zuständigkeitsseite: ' + v.filter((x) => /^Landratsamt/.test(x.name)).map((x) => x.name).join(', '));
    else lraBp[ags] = lra[0].id;
  } else {
    const st = v.filter((x) => /^(Stadt|Landeshauptstadt|Große Kreisstadt) /.test(x.name) && norm(x.name).endsWith(norm(kreise[ags].name.replace(/^(Stadt|Landeshauptstadt) /, ''))));
    if (st.length) lraBp[ags] = st[0].id;
  }
  // Jobcenter: Eintrag aus der amtlichen Jobcenter-Liste; nennt die Seite nur eine Geschäftsstelle, gilt deren Hauptstelle
  let jc = [...new Set(v.filter((x) => jcId[x.id]).map((x) => x.id))];
  if (!jc.length) {
    jc = [...new Set(v.filter((x) => / Geschäftsstelle /.test(x.name)).map((x) => jcNachName[x.name.replace(/ Geschäftsstelle .*$/, '')]).filter(Boolean))];
  }
  if (jc.length !== 1) { fehler.push(ags + ': nicht genau ein Jobcenter: ' + v.filter((x) => /Jobcenter|Geschäftsbereich/.test(x.name)).map((x) => x.name).join(', ')); }
  else {
    const n = jcId[jc[0]];
    // Kommunales Jobcenter ohne "Jobcenter" im Namen (z. B. Geschäftsbereich eines Landratsamts): Behörde voranstellen
    // Interne Kürzel vor dem Namen entfernen ("SG 44 Jobcenter Oberallgäu" -> "Jobcenter Oberallgäu")
    const sauber = n.replace(/^(SG \d+|\d+[a-z]?|Abteilung \d+|Fachbereich \d+ -)\s+/, '');
    const name = /Jobcenter/.test(sauber) ? sauber.replace(/^Kommunales Jobcenter/, 'Kommunales Jobcenter') : kreise[ags].name + ', ' + sauber + ' (Jobcenter)';
    const s = bpStelle('bp-jc-' + jc[0] + '.html', name);
    if (s) jobcenter[ags] = s; else fehler.push(ags + ': Anschrift von ' + n + ' fehlt (bp-jc-' + jc[0] + '.html)');
  }
  // Familienkasse: Nord oder Süd. Nennt die Seite beide (nördliche Oberpfalz), bleibt es offen: keine geratene Zuordnung.
  const fk = [...new Set(v.filter((x) => /^Familienkasse Bayern (Nord|Süd)/.test(x.name)).map((x) => (/Nord/.test(x.name) ? 'nord' : 'sued')))];
  if (fk.length === 1) fkZuordnung[ags] = fk[0];
  else if (fk.length === 2) fkUnklar.push(ags);
  else fehler.push(ags + ': keine Familienkasse auf der Zuständigkeitsseite');
});

// Bezirke (überörtliche Träger der Eingliederungshilfe) und ZBFS-Regionalstellen je Regierungsbezirk
const bezirke = {}, zbfs = {};
Object.keys(RB).forEach((rb) => {
  const b = bpStelle('bp-bezirk-' + rb + '.html', 'Bezirk ' + RB[rb]);
  if (b) bezirke[rb] = b; else fehler.push(rb + ': Anschrift Bezirk ' + RB[rb] + ' fehlt');
  // Oberbayern hat zwei Dienstorte; Hauptsitz der Region ist die Richelstraße
  const z = bpStelle('bp-zbfs-' + (rb === '091' ? '091a' : rb) + '.html', 'Zentrum Bayern Familie und Soziales, Region ' + RB[rb]);
  if (z) zbfs[rb] = z; else fehler.push(rb + ': Anschrift ZBFS Region ' + RB[rb] + ' fehlt');
});

// Familienkasse Bayern Nord / Süd (Postanschrift laut BayernPortal)
const familienkasse = {};
[['nord', 'Familienkasse Bayern Nord'], ['sued', 'Familienkasse Bayern Süd']].forEach(([k, name]) => {
  const s = bpStelle('bp-fk-' + k + '.html', name);
  if (s) familienkasse[k] = s; else fehler.push('Anschrift ' + name + ' fehlt (bp-fk-' + k + '.html)');
});

// Landratsämter/Städte, deren Impressum nicht abrufbar war: Anschrift aus dem BayernPortal
OHNE_ANSCHRIFT.forEach((ags) => {
  // Landratsamt aus der Zuständigkeitsseite; kreisfreie Stadt: ihr eigener Gemeinde-Eintrag im BayernPortal
  const s = (lraBp[ags] || ok('bp-lra-' + ags + '.html')) && bpStelle('bp-lra-' + ags + '.html', kreise[ags].name);
  if (s) Object.assign(kreise[ags], { anschrift: s.anschrift, haus: s.haus, quelle: s.quelle, stand: s.stand });
  else fehler.push(ags + ': keine Anschrift für ' + kreise[ags].name);
});

if (fehler.length) { console.error('Fehler:\n  ' + fehler.join('\n  ')); process.exit(1); }
// IDs für weitere Abrufe (Familienkasse Nord, fehlende Landratsämter) ausgeben, falls Quellen fehlen
if (process.env.ZEIGE_IDS) console.log(JSON.stringify({ lraBp: OHNE_ANSCHRIFT.map((a) => [a, lraBp[a]]), fkUnklar }));

const data = {
  stand: 'Anschriften laut Impressum der Behörden bzw. BayernPortal, abgerufen ' + deDatum([...new Set(abruf.filter((x) => /^(impressum|start)/.test(x.datei) && x.ok).map((x) => x.abgerufen))].sort().pop()),
  kreise, jobcenter, fkZuordnung, familienkasse, bezirke, zbfs,
  // Kreise, für die das BayernPortal Familienkasse Nord und Süd nennt (keine eindeutige Zuordnung)
  fkUnklar,
  // Servicenummer der Familienkassen (BayernPortal, Standorte Schwandorf und Regensburg)
  fkTelefon: '0800 4 5555 30',
  fest: {
    // Bundesweit eine Anschrift (www.rundfunkbeitrag.de, Kontakt)
    beitragsservice: { name: 'ARD ZDF Deutschlandradio Beitragsservice', anschrift: ['50656 Köln'], web: 'https://www.rundfunkbeitrag.de', quelle: 'https://www.rundfunkbeitrag.de', stand: '' }
  }
};
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
const mit = Object.values(kreise).filter((k) => k.anschrift).length;
console.log(`behoerden-bayern.json: 96 Kreise, davon ${mit} mit Anschrift, ${96 - mit} nur mit Name und Website`);
