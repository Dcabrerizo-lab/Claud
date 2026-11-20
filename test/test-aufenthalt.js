// Aufenthalt „Asylverfahren oder Duldung“ (aufenthalt = 'asyl'): Ausschlüsse und Hinweise je Karte, jede Erwartung aus dem Gesetz
// (alle Fundstellen am 20.11.2026 auf gesetze-im-internet.de bzw. gesetze-bayern.de abgerufen):
//  - WBS: § 27 Abs. 2 WoFG, Art. 14 Abs. 2 BayWoFG -> „unwahrscheinlich“ mit Hinweis auf Ausnahmen (Entscheidung David, 20.11.2026)
//  - Wohngeld: § 3 Abs. 5 Satz 1 Nr. 2 und 4 WoGG (Duldung, Gestattung berechtigt), § 7 Abs. 1 Satz 1 Nr. 8 WoGG (nur AsylbLG-Bezug schließt aus)
//  - Bildung und Teilhabe: § 3 Abs. 4 AsylbLG -> nie „nein“ allein wegen Asyl
//  - BAföG: § 8 Abs. 2a und 3 BAföG; BAB: § 60 Abs. 3 SGB III; Arbeitslosengeld: § 138 Abs. 5 Nr. 1 SGB III
//  - Hilfe zur Pflege: § 23 Abs. 2 SGB XII; Eingliederungshilfe: § 100 Abs. 2 SGB IX; Kindergeld bei Behinderung: § 62 Abs. 2 EStG
//  - Ausweis: § 2 Abs. 2 SGB IX („rechtmäßig“); Landesblindengeld: § 9 Abs. 1 AsylbLG („vergleichbare Landesgesetze“)
'use strict';
const R = require('./rules-de.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : JSON.stringify(x)); } };
const base = { adults: 1, kids: 0, young: 0, brutto: 0, brutto2: '', netto: '', miete: 0, vermoegen: 0, gebJahr: 1990, heute: 2026.8, bezug: {} };
const res = (o) => { const m = {}; R.evaluate({ ...base, ...o }).results.forEach((x) => { m[x.id] = x; }); return m; };
const keys = (x) => x.tx.map((a) => a[0]);
// Gleicher Haushalt ohne und mit Asyl
const paar = (o, id) => [res(o)[id], res({ ...o, aufenthalt: 'asyl' })[id]];

// Wohnberechtigungsschein
for (const land of ['', 'BY', 'NW', 'BE']) {
  const [o, a] = paar({ art1: 'lohn', brutto: 900, netto: 700, miete: 500, bundesland: land }, 'wbs');
  ck('[wbs-asyl] WBS bei Asyl „unwahrscheinlich“ mit Hinweis auf Ausnahmen und Wohnungsamt (' + (land || 'ohne Land') + ')', o.level === 'ja' && a.level === 'nein' && keys(a)[0] === 'wbs.asyl', [o.level, a]);
}

// Wohngeld: nicht pauschal ausgeschlossen, höchstens „möglich“
{
  const hh = { adults: 1, kids: 2, kidsU6: 1, art1: 'lohn', brutto: 2300, netto: 1700, miete: 850, mietstufe: '4' };
  const [o, a] = paar(hh, 'wohngeld');
  ck('[wg-asyl] Wohngeld bei Asyl und Arbeit: „möglich“ statt „unwahrscheinlich“, Hinweis vorn (nur ohne Asylbewerberleistungen)', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'wohngeld.asyl', [o.level, a.level, keys(a)]);
  const [o2, a2] = paar({ ...hh, brutto: 9000, netto: 6000 }, 'wohngeld');
  ck('[wg-asyl] Wohngeld bei Asyl und hohem Einkommen: bleibt „unwahrscheinlich“', o2.level === 'nein' && a2.level === 'nein');
}

// Bildung und Teilhabe
{
  const [o, a] = paar({ adults: 2, kids: 2, kidsU6: 1, art1: 'ohne', brutto: 0, netto: 0, miete: 700 }, 'but');
  ck('[but-asyl] Bildung und Teilhabe bei Asyl mit Kindern: „möglich“ (§ 3 Abs. 4 AsylbLG), nicht „nein“', a.level === 'vielleicht' && keys(a)[0] === 'but.asyl' && keys(a).includes('but.kita'), [o.level, a]);
  ck('[but-asyl] Bildung und Teilhabe bei Asyl ohne Kinder: nein', res({ aufenthalt: 'asyl' }).but.level === 'nein');
}

// BAföG
{
  const [o, a] = paar({ adults: 2, kids: 0, young: 1, ausbildung: 'kind', art1: 'lohn', brutto: 1200, netto: 950 }, 'bafoeg');
  ck('[bafoeg-asyl] BAföG bei Asyl: „wahrscheinlich“ wird „möglich“ mit Hinweis (Gestattung, Duldung erst nach 15 Monaten)', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'bafoeg.asyl', [o.level, a]);
}

// Berufsausbildungsbeihilfe
{
  const a = res({ ausbildung: 'ich', babBetrieb: true, babWohnt: true, aufenthalt: 'asyl' }).bab;
  const k = res({ adults: 2, young: 1, ausbildung: 'kindBetrieb', aufenthalt: 'asyl' }).bab;
  const o = res({ ausbildung: 'ich', babBetrieb: true, babWohnt: true }).bab;
  ck('[bab-asyl] BAB bei Asyl: „möglich“ mit Hinweis (Gestattung nein, Duldung nach 15 Monaten, § 60 Abs. 3 SGB III)', a.level === 'vielleicht' && keys(a)[0] === 'bab.asyl' && k.level === 'vielleicht' && keys(k)[0] === 'bab.asyl' && !keys(o).includes('bab.asyl'), [a, k]);
}

// Hilfe zur Pflege
{
  const hh = { art1: 'rente', brutto: 900, netto: 900, miete: 500, gebJahr: 1950, pflegegrad: '3' };
  const [o, a] = paar(hh, 'hzp');
  ck('[hzp-asyl] Hilfe zur Pflege bei Asyl: „möglich“ mit eigenem Hinweis statt Einkommensgrenze', o.level === 'vielleicht' && keys(o)[0] === 'hzp.unter' && a.level === 'vielleicht' && keys(a)[0] === 'hzp.asyl', [keys(o), keys(a)]);
  const [, av] = paar({ ...hh, vermoegen: 40000 }, 'hzp');
  ck('[hzp-asyl] Hilfe zur Pflege bei Asyl und hohem Vermögen: nein', av.level === 'nein');
}

// Eingliederungshilfe
{
  const [o, a] = paar({ bhPerson: 'ich', gdb: '80' }, 'eingl');
  ck('[eingl-asyl] Eingliederungshilfe bei Asyl: eigener Hinweis (§ 100 Abs. 2 SGB IX, 36 Monate)', keys(o)[0] === 'eingl.erw' && a.level === 'vielleicht' && keys(a)[0] === 'eingl.asyl', [keys(o), keys(a)]);
}

// Kindergeld bei Behinderung
{
  const [o, a] = paar({ adults: 2, bhPerson: 'erwVor25', bhSelbst: true, gdb: '80' }, 'kgBeh');
  ck('[kgbeh-asyl] Kindergeld bei Behinderung und Asyl: höchstens „möglich“ wie Kindergeld (§ 62 Abs. 2 EStG)', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'kindergeld.asyl', [o.level, a]);
}

// Arbeitslosengeld
{
  const [o, a] = paar({ art1: 'ohne', arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: 2800 }, 'alg1');
  ck('[alg-asyl] Arbeitslosengeld bei Asyl: höchstens „möglich“ mit Hinweis auf Arbeitserlaubnis (§ 138 Abs. 5 Nr. 1 SGB III)', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'alg1.asyl', [o.level, a]);
}

// Landesblindengeld und Schwerbehindertenausweis
for (const land of ['', 'NW']) {
  const [o, a] = paar({ bhPerson: 'ich', gdb: '100', blind: 'blind', bundesland: land }, 'blindengeld');
  ck('[blindengeld-asyl] Landesblindengeld bei Asyl: höchstens „möglich“ (§ 9 Abs. 1 AsylbLG unklar) (' + (land || 'Bayern') + ')', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'blindengeld.asyl', [o.level, a]);
}
{
  const [o, a] = paar({ bhPerson: 'ich', gdb: '60' }, 'ausweis');
  ck('[ausweis-asyl] Schwerbehindertenausweis bei Asyl: höchstens „möglich“ (§ 2 Abs. 2 SGB IX „rechtmäßig“)', o.level === 'ja' && a.level === 'vielleicht' && keys(a)[0] === 'ausweis.asyl', [o.level, a]);
}

// Jeder Hinweis-Schlüssel hat einen deutschen Text
{
  const I18N = require('../src/lang/de.json');
  const neu = ['wbs.asyl', 'wohngeld.asyl', 'but.asyl', 'bafoeg.asyl', 'bab.asyl', 'hzp.asyl', 'eingl.asyl', 'alg1.asyl', 'blindengeld.asyl', 'ausweis.asyl'];
  ck('Alle Asyl-Hinweise haben einen Text', neu.every((k) => typeof I18N['t.' + k] === 'string' && I18N['t.' + k].length > 20), neu.filter((k) => !I18N['t.' + k]));
  ck('Karte Familienversicherung ist entfernt (keine Texte mehr)', !Object.keys(I18N).some((k) => /famvers/.test(k)) && !R.evaluate({ ...base }).results.some((x) => x.id === 'famvers'));
}

console.log((fails ? 'FEHLER ' : '') + '[aufenthalt] ' + (n - fails) + '/' + n + ' Prüfungen zum Aufenthalt (Asylverfahren/Duldung) bestanden');
if (fails) process.exit(1);
