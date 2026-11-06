// Erzeugt content/plz-data.json aus den amtlichen Quellen in content/quellen/roh/:
//  - geonames-DE.zip  (GeoNames, CC BY 4.0): PLZ -> Ort, Bundesland, Kreis mit amtlichem Kreisschlüssel
//  - wogv-anlage.html (Wohngeldverordnung, Anlage): Mietenstufen der Gemeinden ab 10.000 Einwohnern und der Kreise
// Umfang: PLZ -> Bundesland bundesweit; Kreis, Mietenstufe und (über den Kreisschlüssel) Behörden nur für Bayern.
// Format: siehe src/plz.js. Aufruf: node tools/build-plz-data.js (bricht ab, wenn eine Zuordnung nicht eindeutig ist)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'content', 'quellen', 'roh');
const OUT = path.join(ROOT, 'content', 'plz-data.json');
const abruf = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'quellen', 'abruf.json'), 'utf8'));
const abgerufen = (f) => (abruf.find((e) => e.datei === f) || {}).abgerufen || '';

const BL = [['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'], ['BB', 'Brandenburg'], ['HB', 'Bremen'], ['HH', 'Hamburg'], ['HE', 'Hessen'], ['MV', 'Mecklenburg-Vorpommern'], ['NI', 'Niedersachsen'], ['NW', 'Nordrhein-Westfalen'], ['RP', 'Rheinland-Pfalz'], ['SL', 'Saarland'], ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'], ['SH', 'Schleswig-Holstein'], ['TH', 'Thüringen']];
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };

// ---------- GeoNames ----------
const geo = execFileSync('unzip', ['-p', path.join(RAW, 'geonames-DE.zip'), 'DE.txt'], { encoding: 'utf8', maxBuffer: 64 << 20 })
  .split('\n').filter(Boolean).map((l) => l.split('\t'))
  .map(([, plz, ort, , bl, , , kreis, ags, , , genau]) => ({ plz, ort, bl, kreis, ags, genau: !!genau }));
if (geo.length < 20000) throw new Error('GeoNames: zu wenige Zeilen');

// Großkunden- und Postfach-PLZ (Firmen, Behörden) aussortieren: Einträge ohne Koordinaten-Genauigkeit, die nach Organisation
// aussehen, und Einträge, deren Bundesland nicht zu den Wohnorten derselben PLZ passt (z. B. eine Münchner Firma unter 20083).
const ORGA = /(^|[\s,(&\/-])(GmbH|mbH|AG|KG|KGaA|OHG|SE|e\.\s?V\.?|eG|e\.G\.|Inc\.|LLP|Ltd\.?|Co\.?|\w*[Vv]ersicherung\w*|\w*[Bb]ank|\w*[Kk]asse|BKK|IKK|AOK|Verlag|Zeitung|Presse|Post|Postbank|\w+amt|Amt für|\w*[Vv]erwaltung\w*|Universität|\w*[Hh]ochschule|\w*[Kk]linik\w*|Krankenhaus|Hospital|\w*[Cc]enter|Service|\w*[Gg]ericht\w*|\w*[Mm]inisterium|Bundes\w+|Agentur|Behörde\w*|Versand\w*|Fernsehen|Rundfunk|Sparkasse|Stadtwerke|Zentrale|ZENTRALE|Verein|Verband|\w*[Kk]ammer|Institut|Stiftung|Gruppe|Group|Holding|Vertrieb|Logistik|Leasing|\w*[Dd]irektion|Abteilung|Dienst\w*|Polizei\w*|Kaserne|Justiz\w*|JVA|Messe|Flughafen|Staatsanwaltschaft|Generalstaatsanwalt|Ordinariat|Generalvikariat|Landeskirche\w*|Diakon\w*|Berufsgenossenschaft|Seniorenzentrum|Rechenzentr\w*|Niederlassung|Filiale|Fabrik|Werk|Kraftwerk|Studio|Rathaus|Magistrat|Landrat|Senatsverwaltung|Regierungspräsidium|Präsidium|Landkreis \w+ \w+|Stadt \w+ \w+)(?=$|[\s,.)&\/-])/;
const wohnBL = {};
geo.forEach((g) => { if (g.genau) (wohnBL[g.plz] = wohnBL[g.plz] || new Set()).add(g.bl); });
const geoAlle = geo.length;
const geoWohn = geo.filter((g) => g.genau || (!ORGA.test(g.ort) && (!wohnBL[g.plz] || wohnBL[g.plz].has(g.bl))));
geo.length = 0; geo.push(...geoWohn);
console.log(`GeoNames: ${geoAlle} Einträge, davon ${geoAlle - geo.length} Firmen-/Behörden-PLZ aussortiert`);

// ---------- Wohngeldverordnung, Anlage ----------
function wogvBayern() {
  const html = fs.readFileSync(path.join(RAW, 'wogv-anlage.html'), 'utf8');
  const text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '').replace(/<\/(tr|p|div|h\d|li)>/g, '\n')
    .replace(/<\/t[dh]>/g, '\t').replace(/<[^>]+>/g, '').replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n));
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const stand = (text.replace(/\s+/g, ' ').match(/Mietenstufen der Gemeinden nach Ländern ab ([0-9]+\. \S+ \d{4})/) || [])[1];
  if (!stand) throw new Error('WoGV: Überschrift mit Stichtag nicht gefunden');
  const a = lines.findIndex((l) => /^Land:\s*Bayern$/.test(l));
  const b = lines.findIndex((l, i) => i > a && /^Land:/.test(l));
  if (a < 0 || b < 0) throw new Error('WoGV: Abschnitt Bayern nicht gefunden');
  const rows = { gemeinden: [], kreise: [] };
  let mode = null;
  lines.slice(a + 1, b).forEach((l) => {
    const [name, st] = l.split('\t').map((x) => x.trim());
    if (name === 'Gemeinde') { mode = 'gemeinden'; return; }
    if (name === 'Kreis') { mode = 'kreise'; return; }
    if (!mode || !ROMAN[st]) throw new Error('WoGV: unerwartete Zeile: ' + l);
    rows[mode].push({ name, stufe: ROMAN[st] });
  });
  return { stand: stand.replace(/^1\. Januar /, '1.1.'), ...rows };
}
const W = wogvBayern();
if (W.gemeinden.length !== 233 || W.kreise.length !== 71) throw new Error(`WoGV: erwartet 233 Gemeinden und 71 Kreise, gefunden ${W.gemeinden.length}/${W.kreise.length}`);

// ---------- Namen abgleichen ----------
// Schlüssel aus Buchstaben ohne Füllwörter: "Landsberg a. Lech, Stadt" und "Landsberg am Lech" -> "landsberglech"
const FILL = new Set(['a', 'am', 'an', 'd', 'der', 'den', 'i', 'im', 'in', 'b', 'bei', 'stadt', 'markt', 'landkreis', 'kreisfreie', 'große', 'kreisstadt']);
const key = (s) => String(s).toLowerCase().replace(/ß/g, 'ss').split(/[^a-zäöü]+/).filter((w) => w && !FILL.has(w)).join('');

const BY = geo.filter((g) => g.bl === 'BY');
const kreisName = {}; BY.forEach((g) => { kreisName[g.ags] = g.kreis; });
const kreisAGS = Object.keys(kreisName).sort();
if (kreisAGS.length !== 96) throw new Error('GeoNames: erwartet 96 bayerische Kreise, gefunden ' + kreisAGS.length);
const istKreisfrei = (ags) => Number(ags.slice(3)) < 70;

// Amtliche Kreisnamen (GeoNames schreibt teils englisch oder ohne "Landkreis")
const KREIS_ALIAS = { '09564': 'Nürnberg', '09471': 'Bamberg', '09177': 'Erding', '09182': 'Miesbach', '09185': 'Neuburg-Schrobenhausen', '09172': 'Berchtesgadener Land', '09574': 'Nürnberger Land', '09762': 'Kaufbeuren', '09575': 'Neustadt/Aisch-Bad Windsheim', '09374': 'Neustadt a. d. Waldnaab', '09776': 'Lindau (Bodensee)' };
const amtlich = (ags) => {
  const n = KREIS_ALIAS[ags] || kreisName[ags].replace(/^(Landkreis|Kreisfreie Stadt) /, '');
  return (istKreisfrei(ags) ? 'Stadt ' : 'Landkreis ') + n;
};

// WoGV-Kreise -> Kreisschlüssel (nur Landkreise)
const kreisStufe = {};
const kreisOffen = [];
W.kreise.forEach((k) => {
  const hits = kreisAGS.filter((a) => !istKreisfrei(a) && key(amtlich(a)) === key(k.name));
  if (hits.length !== 1) { kreisOffen.push(k.name + ' -> ' + (hits.join(',') || 'kein Treffer')); return; }
  kreisStufe[hits[0]] = k.stufe;
});
if (kreisOffen.length) {
  console.error('WoGV-Kreise nicht eindeutig:\n  ' + kreisOffen.join('\n  ') + '\nLandkreise ohne Stufe: ' +
    kreisAGS.filter((a) => !istKreisfrei(a) && !kreisStufe[a]).map((a) => a + ' ' + amtlich(a)).join(', '));
  process.exit(1);
}
if (Object.keys(kreisStufe).length !== 71) throw new Error('Nicht alle Landkreise haben eine Mietenstufe');

// WoGV-Gemeinden -> (Kreisschlüssel, GeoNames-Ortsname). Mehrdeutige Namen sind über den Kreis festgelegt.
const GEMEINDE_ALIAS = {
  'Altdorf, Markt': ['09274', 'Altdorf'],
  'Altdorf bei Nürnberg, Stadt': ['09574', 'Altdorf'],
  'Taufkirchen': ['09184', 'Taufkirchen'],
  'Taufkirchen (Vils)': ['09177', 'Taufkirchen (Vils)'],
  'Alzenau i. Ufr., Stadt': ['09671', 'Alzenau in Unterfranken'],
  'Weilheim i. OB, Stadt': ['09190', 'Weilheim in Oberbayern'],
  'Weißenburg i. Bayern, Stadt': ['09577', 'Weißenburg in Bayern'],
  'Immenstadt i. Allgäu, Stadt': ['09780', 'Immenstadt im Allgäu'],
  'Lindenberg i. Allgäu, Stadt': ['09776', 'Lindenberg im Allgäu'],
  'Kempten (Allgäu), Stadt': ['09763', 'Kempten'],
  'Lindau (Bodensee), Stadt': ['09776', 'Lindau (Bodensee)'],
  'Krumbach (Schwaben), Stadt': ['09774', 'Krumbach'],
  'Lauingen (Donau), Stadt': ['09773', 'Lauingen (Donau)'],
  'Rothenburg ob der Tauber, Stadt': ['09571', 'Rothenburg ob der Tauber'],
  'Neustadt bei Coburg, Stadt': ['09473', 'Neustadt bei Coburg'],
  'Neustadt an der Aisch, Stadt': ['09575', 'Neustadt an der Aisch'],
  'Neustadt an der Donau, Stadt': ['09273', 'Neustadt an der Donau'],
  'Kirchheim bei München': ['09184', 'Kirchheim bei München'],
  'Garching bei München, Stadt': ['09184', 'Garching bei München'],
  'Grafing bei München, Stadt': ['09175', 'Grafing bei München'],
  'Neufahrn bei Freising': ['09178', 'Neufahrn bei Freising'],
  'Markt Indersdorf, Markt': ['09174', 'Markt Indersdorf'],
  'Markt Schwaben, Markt': ['09175', 'Markt Schwaben'],
  'München': ['09162', 'München'],
  'Nürnberg, Stadt': ['09564', 'Nürnberg'],
  // gleichnamige Orte in anderen Kreisen: gemeint ist die Gemeinde ab 10.000 Einwohnern
  'Amberg, Stadt': ['09361', 'Amberg'],
  'Eching': ['09178', 'Eching'],
  'Holzkirchen, Markt': ['09182', 'Holzkirchen'],
  // abweichende Schreibweise bei GeoNames
  'Moosburg an der Isar, Stadt': ['09178', 'Moosburg'],
  'Stein, Stadt': ['09573', 'Stein bei Nürnberg'],
  'Vilshofen a. d. Donau, Stadt': ['09275', 'Vilshofen'],
  'Weiden i. d. Oberpfalz, Stadt': ['09363', 'Weiden'],
  'Höhenkirchen-Siegertsbrunn': ['09184', 'Höhenkirchen-Siegertsbrunn']
};
const ortKey = (s) => key(String(s).split(/[,(]/)[0]);
const gemeinden = []; // { name, stufe, ags, orte: [GeoNames-Schreibweisen] }
const offen = [];
W.gemeinden.forEach((g) => {
  let ags, orte;
  if (GEMEINDE_ALIAS[g.name]) {
    const [a, ort] = GEMEINDE_ALIAS[g.name];
    ags = a;
    orte = [...new Set(BY.filter((x) => x.ags === a && key(x.ort) === key(ort)).map((x) => x.ort))];
    if (!orte.length) { offen.push(g.name + ' (Alias ohne Treffer: ' + ort + ' in ' + a + ')'); return; }
  } else {
    const hits = BY.filter((x) => key(x.ort) === key(g.name));
    const kreiseTreffer = [...new Set(hits.map((x) => x.ags))];
    if (kreiseTreffer.length !== 1) { offen.push(g.name + ' -> ' + ([...new Set(hits.map((x) => x.ags + '|' + x.ort))].join('; ') || 'kein Treffer')); return; }
    ags = kreiseTreffer[0];
    orte = [...new Set(hits.map((x) => x.ort))];
  }
  gemeinden.push({ name: g.name, stufe: g.stufe, ags, orte });
});
if (offen.length) { console.error('Nicht eindeutig zugeordnet:\n  ' + offen.join('\n  ')); process.exit(1); }

// Kreisfreie Städte: Stufe aus der Gemeindeliste
kreisAGS.filter(istKreisfrei).forEach((a) => {
  const g = gemeinden.find((x) => x.ags === a);
  if (!g) throw new Error('Keine Mietenstufe für kreisfreie Stadt ' + amtlich(a));
  kreisStufe[a] = g.stufe;
});

// ---------- Ausgabe im Format von src/plz.js ----------
const kreise = kreisAGS.map((a) => ({
  n: amtlich(a), ags: a,
  g: gemeinden.filter((x) => x.ags === a).map((x) => [x.name, x.stufe]).sort((p, q) => p[0].localeCompare(q[0], 'de'))
}));
const kIdx = {}; kreise.forEach((k, i) => { kIdx[k.ags] = i; });
const gemStufe = {}; gemeinden.forEach((x) => x.orte.forEach((o) => { gemStufe[x.ags + '|' + o] = x.stufe; }));

const plz = {};
geo.forEach((g) => {
  const bl = BL.findIndex((b) => b[0] === g.bl);
  if (bl < 0 || !/^\d{5}$/.test(g.plz)) return;
  const list = (plz[g.plz] = plz[g.plz] || []);
  if (g.bl === 'BY') {
    const eigen = gemStufe[g.ags + '|' + g.ort];
    const e = [g.ort, kIdx[g.ags], eigen || kreisStufe[g.ags], eigen || istKreisfrei(g.ags) ? 1 : 0, bl];
    if (!list.some((x) => x[0] === e[0] && x[1] === e[1])) list.push(e);
  } else if (!list.some((x) => x[4] === bl)) list.push([g.ort, -1, null, 0, bl]);
});

const data = {
  stand: {
    wogv: 'Anlage zur Wohngeldverordnung, Mietenstufen ab ' + W.stand,
    geonames: 'GeoNames (CC BY 4.0), abgerufen ' + abgerufen('geonames-DE.zip').slice(0, 10),
    umfang: 'Kreis und Mietenstufe nur Bayern; übrige Länder nur Bundesland'
  },
  bl: BL.map((b) => b[0]), blNamen: BL.map((b) => b[1]),
  kreise, plz
};
fs.writeFileSync(OUT, JSON.stringify(data));
const nBY = Object.values(plz).filter((l) => l.some((e) => e[4] === 1)).length;
console.log(`plz-data.json: ${Object.keys(plz).length} PLZ (Bayern ${nBY}), ${kreise.length} bayerische Kreise, ${gemeinden.length} Gemeinden mit eigener Mietenstufe, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
