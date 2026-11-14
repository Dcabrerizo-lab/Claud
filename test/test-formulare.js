// Ausfüllhilfe für amtliche Formulare (src/formulare.js, app/pdf/pdf-entry.js fillForms):
// - Jede Zuordnung zeigt auf ein Feld, das es im PDF gibt, mit dem richtigen Typ; keine unklare Ja/Nein-Frage wird gesetzt.
// - Die Auswahl der Formulare passt zu den Angaben (Musterfälle).
// - Die Formulare werden wirklich gefüllt und wieder gelesen: Text, Haken und Ja/Nein stehen im PDF so, wie SoLo es meint
//   (Ja/Nein über den geprüften Katalog, der „Ja“ und „Nein“ an der Beschriftung neben dem Feld erkennt).
// - Geschützte PDFs (Kinderzuschlag, Wohngeld: Verändern vom Herausgeber nicht erlaubt) bleiben unverändert (leerer Vordruck).
// Braucht pdf-lib und esbuild aus app/node_modules (CI: npm ci in app vor npm test).
const fs = require('fs');
const path = require('path');
const os = require('os');
const ROOT = path.join(__dirname, '..');
const F = require('../src/formulare.js');
const R = require('../src/rules.js');
const DIR = path.join(ROOT, 'content', 'formulare');
const K = JSON.parse(fs.readFileSync(path.join(DIR, 'katalog.json'), 'utf8'));
const MODS = path.join(ROOT, 'app', 'node_modules');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL [formulare] ' + name, x === undefined ? '' : x); } };

// Hilfen
ck('Name „Maria Anna Muster“', JSON.stringify(F.teileName('Maria Anna Muster')) === '{"vor":"Maria Anna","nach":"Muster"}');
ck('Name „Muster, Maria“', JSON.stringify(F.teileName('Muster, Maria')) === '{"vor":"Maria","nach":"Muster"}');
ck('Name nur ein Wort', F.teileName('Muster').nach === 'Muster' && F.teileName('Muster').vor === '');
ck('Straße „Hauptstr. 1a“', JSON.stringify(F.teileStrasse('Hauptstr. 1a')) === '{"str":"Hauptstr.","nr":"1a"}');
ck('Straße „Am Ring 12-14“', JSON.stringify(F.teileStrasse('Am Ring 12-14')) === '{"str":"Am Ring","nr":"12-14"}');
ck('Straße ohne Nummer', JSON.stringify(F.teileStrasse('Marktplatz')) === '{"str":"Marktplatz","nr":""}');
ck('Ort „91054 Erlangen“', JSON.stringify(F.teileOrt('91054 Erlangen')) === '{"plz":"91054","ort":"Erlangen"}');
ck('Ort ohne PLZ', JSON.stringify(F.teileOrt('Erlangen')) === '{"plz":"","ort":"Erlangen"}');

const PERSON = { name: 'Maria Muster', geb: '01.02.1980', strasse: 'Hauptstr. 1a', ort: '91054 Erlangen', tel: '09131 12345' };
const FAELLE = [
  { name: 'Alleinerziehend mit Lohn, Miete, Unterhalt, Kindergeld', s: { adults: 1, kids: 2, kidsU6: 1, kids14: 0, ek1Art: 'lohn', ek1Brutto: 1600, ek1Netto: 1250, unterhalt: 200, miete: 850, mietstufe: '4', vermoegen: 500, bezug: { kindergeld: true } },
    hat: ['ha', 'ek', 'kdu', 'vm', 'ki-0', 'ki-1', 'uh3', 'ab', 'mb'], nicht: ['wep', 've', 'eks', 'sv', 'meb', 'hg'],
    werte: { ha: { txtfPersonVorname: 'Maria', txtfPersonNachname: 'Muster', txtfPersonStr: 'Hauptstr.', txtfPersonHausNr: '1a', txtfPersonPlz: '91054', txtfPersonOrt: 'Erlangen', rbtnAlleinerziehend: 'ja', rbtnSelbstaendig: 'nein', rbtnBedarfUnterkunft: 'ja', chbxWohnenKindU15: true }, ek: { rbtnEinkommen: 'ja', chbxEinnahmeKindergeld: true }, uh3: { rbtnUH: 'ja', numfUHZahlung: '200' } } },
  { name: 'Paar, selbstständig, Eigentum, Auto, Verwandte, Ernährung', s: { adults: 2, kids: 0, ek1Art: 'selbst', ek1Brutto: 900, ek1Netto: 700, ek2Art: '', miete: 600, wohnart: 'eigentum', autoWert: 9000, hhAndere: 'verwandte', ernaehrung: true, vermoegen: 2000 },
    hat: ['ha', 'ek', 'kdu', 'vm', 'wep', 'ek2', 've', 'meb', 'hg', 'eks', 'sv'], nicht: ['uh3', 'mb', 'ab'],
    werte: { ha: { rbtnSelbstaendig: 'ja', rbtnMEB: 'ja', chbxWohnenEhegatte: true, chbxWohnenVerwandte: true }, kdu: { chbxWohnenEigentum: true }, vm: { rbtnBGImmobBewohnt: 'ja', rbtnBGKfZ: 'ja', numfKfZWertZ1: '9000' }, ek: { rbtnEinkommenFreiberuflich: 'ja', chbxVersicherungKfz: true } } },
  { name: 'Allein, Rente, Wohngeld möglich', s: { adults: 1, ek1Art: 'rente', ek1Brutto: 1150, ek1Netto: 1020, miete: 520, mietstufe: '3', vermoegen: 3000, gebJahr: 1955 }, hat: [], nicht: ['ki-0'] },
  { name: 'Allein, schwanger, kein Einkommen', s: { adults: 1, schwanger: true, miete: 450, mietstufe: '2', vermoegen: 100 }, hat: ['ha', 'ek', 'kdu', 'vm', 'uh2'], nicht: ['ab', 'uh3'],
    werte: { ha: { rbtnSchwanger: 'ja', rbtnWohnsituation: 'ja' }, ek: { chbxEinnahmeKeine: true } } }
];

const planFuer = (f) => F.plan(f.s, PERSON, R.evaluate(f.s).results);
const alle = [];
FAELLE.forEach((f) => {
  const p = planFuer(f), ids = p.map((x) => x.id);
  alle.push(...p);
  f.hat.forEach((id) => ck(f.name + ': Formular ' + id + ' dabei', ids.indexOf(id) >= 0, ids.join(' ')));
  f.nicht.forEach((id) => ck(f.name + ': Formular ' + id + ' nicht dabei', ids.indexOf(id) < 0, ids.join(' ')));
  Object.keys(f.werte || {}).forEach((id) => {
    const fo = p.find((x) => x.id === id) || { werte: {} };
    Object.keys(f.werte[id]).forEach((k) => ck(f.name + ': ' + id + '.' + k + ' = ' + f.werte[id][k], fo.werte[k] === f.werte[id][k], fo.werte[k]));
  });
});
// Rente mit Altersgrenze: kein Jobcenter, aber die Unterlagenliste ist trotzdem sinnvoll
const rente = planFuer(FAELLE[2]);
ck('Rentnerin im Rentenalter: kein Hauptantrag beim Jobcenter', !rente.some((x) => x.id === 'ha'), rente.map((x) => x.id).join(' '));
ck('Rentnerin: Wohngeld-Vordruck dabei', rente.some((x) => x.id === 'wg'), rente.map((x) => x.id).join(' '));
// Kinderzuschlag
const kizFall = { adults: 2, kids: 2, kidsU6: 1, ek1Art: 'lohn', ek1Brutto: 2600, ek1Netto: 1900, miete: 900, mietstufe: '3', vermoegen: 1000, bezug: { kindergeld: true } };
const kizPlan = F.plan(kizFall, PERSON, R.evaluate(kizFall).results);
const kz = kizPlan.find((x) => x.id === 'kiz');
ck('Familie mit Lohn: Kinderzuschlag als Link auf die Formularseite der Familienkasse mit Ausfüllhilfe (Anlage Kind)', !!kz && kz.art === 'link' && /formulare-kinderzuschlag/.test(kz.url) && /Anlage Kind/.test(kz.hilfe.join(' ')), kizPlan.map((x) => x.id).join(' ') + ' | kiz=' + (R.evaluate(kizFall).results.find((r) => r.id === 'kiz') || {}).level);
if (kz) alle.push(kz);
ck('Bereits Kinderzuschlag: kein KiZ-Antrag', !F.plan(Object.assign({}, kizFall, { bezug: { kindergeld: true, kiz: true } }), PERSON, R.evaluate(kizFall).results).some((x) => x.id === 'kiz'));
ck('Ohne gewählte Leistungen: keine Formulare', F.plan(kizFall, PERSON, []).length === 0);

// Wohnberechtigungsschein je Land: Landesvordruck (BY, BE, BB, HH), Hinweis mit Fundstelle (HB, RP, SL), sonst Stadt/Gemeinde
const wbsFall = { adults: 1, ek1Art: 'lohn', ek1Brutto: 1500, ek1Netto: 1150, miete: 500, mietstufe: '3', vermoegen: 100 };
const wbsRes = [{ id: 'wbs', level: 'ja' }];
const wbsFuer = (bl) => F.plan(Object.assign({}, wbsFall, { bundesland: bl }), PERSON, wbsRes).find((x) => x.id === 'wbs');
['BW', 'BE', 'BB', 'HB', 'RP', 'SL'].forEach((bl) => { const w = wbsFuer(bl); ck('WBS ' + bl + ': Landesvordruck wbs-' + bl + '.pdf als unveränderter Vordruck', !!w && w.datei === 'wbs-' + bl + '.pdf' && w.art === 'leer', JSON.stringify(w)); if (w) alle.push(w); });
[['BY', 'stmb.bayern.de'], ['HH', 'hamburg.de']].forEach(([bl, dom]) => { const w = wbsFuer(bl); ck('WBS ' + bl + ': geschützter Landesvordruck als Link auf die amtliche Seite mit Ausfüllhilfe', !!w && w.art === 'link' && w.url.indexOf(dom) > 0 && w.hilfe.length >= 4, JSON.stringify(w)); });
ck('WBS Bremen: Einkommens- und Vermögenserklärung dabei', F.plan(Object.assign({}, wbsFall, { bundesland: 'HB' }), PERSON, wbsRes).some((x) => x.datei === 'wbs-HB-anlage1.pdf'));
alle.push(F.plan(Object.assign({}, wbsFall, { bundesland: 'HB' }), PERSON, wbsRes).find((x) => x.id === 'wbs-ek'));
['HE', 'MV', 'NI', 'NW', 'SN', 'ST', 'SH', 'TH'].forEach((bl) => { const w = wbsFuer(bl); ck('WBS ' + bl + ': Hinweis auf Vordruck der Stadt oder Gemeinde', !!w && w.art === 'hinweis' && /Stadt oder Gemeinde/.test(w.warum) && /Wohnungsamt/.test(w.warum), JSON.stringify(w)); });
const hb = wbsFuer('BY');
ck('WBS: Landesvordruck wird nicht ausgefüllt, aber mit Ausfüllhilfe', Object.keys(hb.werte).length === 0 && Array.isArray(hb.hilfe) && hb.hilfe.length >= 4 && /1 Person/.test(hb.hilfe[0]) && /18\.000 € brutto im Jahr/.test(hb.hilfe.join(' ')), JSON.stringify(hb.hilfe));
const hn = wbsFuer('NW');
ck('WBS ohne Landesvordruck: sagt, wo es den Vordruck gibt, plus Ausfüllhilfe', /Wohnungsamt/.test(hn.warum) && Array.isArray(hn.hilfe) && hn.hilfe.length >= 4, hn.warum);
ck('WBS ohne Bundesland: Hinweis, Land anzugeben', /Bundesland/.test(wbsFuer('').warum));
ck('Kein WBS ohne passendes Ergebnis', !F.plan(wbsFall, PERSON, [{ id: 'wbs', level: 'nein' }]).some((x) => x.id === 'wbs'));

// Kindergeld, Kinder ab 18, Kind mit Behinderung, Grundsicherung im Alter
const ids = (st, res) => F.plan(st, PERSON, res).map((x) => x.id);
const kgNeu = ids({ adults: 1, kids: 1, bezug: {} }, [{ id: 'kindergeld', level: 'ja' }]);
ck('Kindergeld noch nicht bezogen: Antrag KG 1 mit Ausfüllhilfe (Anlage Kind, Steuer-ID)', kgNeu.indexOf('kg1') >= 0 && /Anlage Kind/.test(F.plan({ adults: 1, kids: 1, bezug: {} }, PERSON, [{ id: 'kindergeld', level: 'ja' }]).find((x) => x.id === 'kg1').hilfe.join(' ')), kgNeu.join(' '));
ck('Kindergeld schon bezogen: kein Antrag KG 1', ids({ adults: 1, kids: 1, bezug: { kindergeld: true } }, [{ id: 'kindergeld', level: 'na' }]).indexOf('kg1') < 0);
const kg1 = (st) => F.plan(st, PERSON, [{ id: 'kindergeld', level: 'ja' }]).find((x) => x.id === 'kg1');
ck('EU-Bürger: Ausfüllhilfe nennt Anlage EU und Anlage Ausland, sonst nicht', /Anlage EU/.test(kg1({ kids: 1, aufenthalt: 'eu', bezug: {} }).hilfe.join(' ')) && !/Anlage EU/.test(kg1({ kids: 1, bezug: {} }).hilfe.join(' ')));
const jung = F.plan({ adults: 2, young: 1, bezug: { kindergeld: true } }, PERSON, [{ id: 'kindergeld', level: 'na' }]).find((x) => x.id === 'kg18');
ck('Kind von 18 bis 24 in Ausbildung: Nachweise (Schule, Studium, Ausbildung) auch bei laufendem Kindergeld, Link auf „Kindergeld ab 18“', !!jung && /formulare-kindergeld-ab-18$/.test(jung.url) && ['KG 5a', 'KG 7e', 'KG 11a', 'KG 15', 'KG 9a'].every((k) => jung.hilfe.join(' ').includes(k)) && !ids({ adults: 1, kids: 1, bezug: {} }, [{ id: 'kindergeld', level: 'ja' }]).includes('kg18'));
const beh = (pg) => F.plan({ adults: 1, bhPerson: 'erwVor25', pflegegrad: pg, bezug: {} }, PERSON, [{ id: 'kgBeh', level: 'vielleicht' }]).find((x) => x.id === 'kg4');
ck('Erwachsenes Kind mit Behinderung: Link auf die Behinderungs-Vordrucke, KG 4e, 4f, Abzweigung KG 11e, ärztlicher Nachweis; Betreuung nur mit Pflegegrad', /formulare-erwachsene-mit-behinderungen$/.test(beh('3').url) && /KG 11e/.test(beh('3').hilfe.join(' ')) && /KG 4e/.test(beh('3').hilfe.join(' ')) && /Betreuungsleistungen/.test(beh('3').hilfe.join(' ')) && !/Betreuungsleistungen/.test(beh('').hilfe.join(' ')));
const gsa = F.plan({ adults: 1, bezug: {} }, PERSON, [{ id: 'gsa', level: 'ja' }]).find((x) => x.id === 'gsa');
ck('Grundsicherung im Alter: SGB-XII-Antrag (Muster) mit Ausfüllhilfe', !!gsa && gsa.art === 'leer' && gsa.hilfe.length >= 4);
ck('Grundsicherung schon bezogen: kein Antrag', !F.plan({ adults: 1, bezug: { sozialamt: true } }, PERSON, [{ id: 'gsa', level: 'ja' }]).some((x) => x.id === 'gsa'));
alle.push(...F.plan({ adults: 1, kids: 1, young: 1, aufenthalt: 'eu', bhPerson: 'erwVor25', pflegegrad: '3', bezug: {} }, PERSON, [{ id: 'kindergeld', level: 'ja' }, { id: 'kgBeh', level: 'ja' }, { id: 'gsa', level: 'ja' }]));

// Fristen und Kalenderdatei
{
  const heute = new Date(2026, 10, 14);
  const fr = F.fristen([{ id: 'wohngeld' }, { id: 'kiz' }, { id: 'kindergeld' }, { id: 'wbs' }, { id: 'ausweis' }], heute, (k) => k, (id) => id);
  const tag = (x) => x.datum.toISOString().slice(0, 10);
  const find = (id) => fr.find((x) => x.id === id);
  ck('Fristen: Antrag in 3 Tagen, Kinderzuschlag nach 150 Tagen neu, Wohngeld nach 305 Tagen weiter, WBS nach 335 Tagen; ohne Frist (Ausweis) nichts',
    find('wohngeld-3') && find('kiz-150') && find('wohngeld-305') && find('wbs-335') && !fr.some((x) => /^ausweis/.test(x.id)) && tag(find('kiz-150')) === '2027-04-13', fr.map((x) => x.id + ' ' + tag(x)).join(', '));
  ck('Fristen nach Datum sortiert', fr.every((x, i) => i === 0 || fr[i - 1].datum <= x.datum));
  const txt = F.ics([{ id: 'wohngeld-3', datum: new Date(2026, 10, 17), titel: 'Wohngeld: Antrag, jetzt; bald', text: 'Zeile 1\nZeile 2 ' + 'äöü'.repeat(40) }], new Date(Date.UTC(2026, 10, 14, 12, 0)));
  const zeilen = txt.split('\r\n');
  ck('Kalenderdatei: Rahmen, ganztägiger Termin, Erinnerung, CRLF', zeilen[0] === 'BEGIN:VCALENDAR' && zeilen.includes('DTSTART;VALUE=DATE:20261117') && zeilen.includes('DTEND;VALUE=DATE:20261118') && zeilen.includes('BEGIN:VALARM') && txt.endsWith('END:VCALENDAR\r\n') && !/[^\r]\n/.test(txt));
  ck('Kalenderdatei: Komma, Semikolon und Zeilenumbruch maskiert', txt.includes('SUMMARY:Wohngeld: Antrag\\, jetzt\\; bald') && txt.includes('Zeile 1\\nZeile 2'));
  ck('Kalenderdatei: keine Zeile länger als 75 Byte (RFC 5545)', zeilen.every((z) => Buffer.byteLength(z, 'utf8') <= 75), zeilen.map((z) => Buffer.byteLength(z, 'utf8')).join(','));
}

// Zuordnung gegen den Katalog
alle.forEach((fo) => {
  if (fo.art === 'link') { ck(fo.id + ': Link auf amtliche Seite (https, Bund/Land)', /^https:\/\/(www\.arbeitsagentur\.de|www\.stmb\.bayern\.de|www\.hamburg\.de)\//.test(fo.url) && Array.isArray(fo.hilfe) && fo.hilfe.length >= 3, fo.url); return; }
  if (fo.art === 'hinweis') return;
  ck(fo.id + ': Datei vorhanden', fs.existsSync(path.join(DIR, fo.datei)), fo.datei);
  const kat = K[fo.datei];
  if (kat && kat.geschuetzt) ck(fo.id + ': vom Herausgeber geschütztes PDF wird nicht verändert (leerer Vordruck)', fo.art === 'leer');
  if (fo.art === 'leer') { ck(fo.id + ': leerer Vordruck ohne Werte', Object.keys(fo.werte).length === 0); return; }
  ck(fo.id + ': im Katalog', !!kat, fo.datei);
  if (!kat) return;
  Object.keys(fo.werte).forEach((k) => {
    const v = fo.werte[k], fd = kat.felder[k];
    ck(fo.id + ': Feld ' + k + ' gibt es im PDF', !!fd);
    if (!fd) return;
    const typ = v === true ? 'check' : (v === 'ja' || v === 'nein') && fd.typ === 'radio' ? 'radio' : 'text';
    ck(fo.id + ': Feld ' + k + ' hat den Typ ' + fd.typ, typ === fd.typ, typ);
    if (fd.typ === 'radio') ck(fo.id + ': Ja/Nein bei ' + k + ' eindeutig zugeordnet', !fd.unklar && fd.ja && fd.nein && fd.ja !== fd.nein, JSON.stringify(fd));
    if (fd.typ === 'text') ck(fo.id + ': Text bei ' + k + ' ohne kaputte Werte', typeof v === 'string' && !/NaN|undefined|null|\[object/.test(v), v);
  });
});
// Katalog vollständig: jede Formulardatei im Ordner ist im Katalog und umgekehrt
const pdfs = fs.readdirSync(DIR).filter((x) => x.endsWith('.pdf')).sort();
ck('Katalog enthält alle Formulare im Ordner', JSON.stringify(pdfs) === JSON.stringify(Object.keys(K).sort()), pdfs.length + ' / ' + Object.keys(K).length);

// Kein mitgeliefertes Formular älter als 2 Jahre (Stand laut Formular); sonst bei der Jahresprüfung erneuern
const heute = process.env.HEUTE ? Number(process.env.HEUTE) : new Date().getFullYear() + new Date().getMonth() / 12;
Object.keys(K).forEach((d) => { const m = String(K[d].stand || '').match(/^(\d{2})\/(\d{4})$/); if (m) ck('Formular ' + d + ' (Stand ' + K[d].stand + ') ist höchstens 2 Jahre alt, sonst neue Fassung holen', heute - (Number(m[2]) + (Number(m[1]) - 1) / 12) <= 2, K[d].stand); });
ck('Keine vom Herausgeber geschützten PDFs mehr in der App (dafür Link)', Object.keys(K).every((d) => !K[d].geschuetzt), Object.keys(K).filter((d) => K[d].geschuetzt).join(' '));

// Unterlagen
const u1 = F.unterlagen(FAELLE[0].s).join(' | '), u2 = F.unterlagen(FAELLE[1].s).join(' | ');
ck('Unterlagen Alleinerziehende: Mietvertrag, Lohnabrechnungen, Geburtsurkunden, Unterhalt', /Mietvertrag/.test(u1) && /Lohnabrechnungen/.test(u1) && /Geburtsurkunden/.test(u1) && /Unterhalt/.test(u1), u1);
ck('Unterlagen Selbstständige mit Eigentum und Auto: EKS, Grundbuch, Fahrzeugschein; kein Mietvertrag', /EKS/.test(u2) && /Grundbuch/.test(u2) && /Fahrzeugschein/.test(u2) && !/Mietvertrag/.test(u2), u2);

// Wirklich füllen und zurücklesen
(async () => {
  let fill, sichtbar, PDFDocument, PDFName;
  try {
    ({ PDFDocument, PDFName } = require(path.join(MODS, 'pdf-lib')));
    const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'solo-form-')), 'pdf.cjs');
    require(path.join(MODS, 'esbuild')).buildSync({ entryPoints: [path.join(ROOT, 'app', 'pdf', 'pdf-entry.js')], bundle: true, format: 'cjs', platform: 'node', outfile: out, logLevel: 'error' });
    const m = require(out); fill = (m.default || m).fillForms; sichtbar = (m.default || m).sichtbar;
  } catch (e) {
    console.log('FAIL [formulare] pdf-lib/esbuild fehlen (npm ci in app): ' + e.message); process.exit(1);
  }
  // pdf-lib meldet harmlose Lesewarnungen der amtlichen PDFs auf der Konsole: im Testprotokoll ausblenden
  const log = console.log;
  console.log = (...a) => { if (!/Trying to parse invalid object|Invalid object ref/.test(a.join(' '))) log(...a); };
  const loadFile = async (d) => new Uint8Array(fs.readFileSync(path.join(DIR, d)));
  const mitPdf = alle.filter((x) => x.datei && (x.art === 'fuellen' || x.art === 'leer'));
  const res = await fill({ forms: alle, katalog: K, loadFile });
  ck('Für jedes Formular eine Datei, keine für reine Hinweise', res.length === mitPdf.length, res.length + ' / ' + mitPdf.length);
  ck('Dateinamen eindeutig', new Set(res.map((r) => r.name)).size === res.length, res.map((r) => r.name).join(' '));
  let geprueft = 0;
  for (let i = 0; i < res.length; i++) {
    const fo = mitPdf[i], r = res[i];
    if (fo.art === 'leer') { ck(fo.id + ': leerer Vordruck unverändert', Buffer.compare(Buffer.from(r.bytes), fs.readFileSync(path.join(DIR, fo.datei))) === 0); continue; }
    const doc = await PDFDocument.load(r.bytes);
    const kat = K[fo.datei], form = doc.getForm();
    ck(fo.id + ': alle Werte gesetzt', r.gesetzt === Object.keys(fo.werte).length, r.gesetzt + ' / ' + Object.keys(fo.werte).length);
    Object.keys(fo.werte).forEach((k) => {
      const v = fo.werte[k], fd = kat.felder[k];
      let ist;
      try {
        if (fd.typ === 'text') ist = form.getTextField(k).getText();
        else if (fd.typ === 'check') ist = form.getCheckBox(k).isChecked();
        else { const sel = sichtbar(form.getRadioGroup(k)); ist = sel === fd.ja ? 'ja' : sel === fd.nein ? 'nein' : 'anders:' + sel; }
      } catch (e) { ist = 'Fehler: ' + e.message; }
      ck(fo.id + ': im PDF steht ' + k + ' = ' + v, ist === v, ist);
      geprueft++;
    });
    if (kat.xfa) ck(fo.id + ': XFA-Teil entfernt', !form.acroForm.dict.get(PDFName.of('XFA')));
    ck(fo.id + ': Formular bleibt ausfüllbar (nicht flach gemacht)', form.getFields().length === Object.keys(kat.felder).length || form.getFields().length > 0);
  }
  console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '[formulare] Ausfüllhilfe bestanden: ' + n + ' Prüfungen, ' + res.length + ' Formulare gefüllt und ' + geprueft + ' Felder im PDF zurückgelesen');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.stack); process.exit(1); });
