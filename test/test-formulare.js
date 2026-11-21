// Amtliche Formulare (src/formulare.js): SoLo liefert keine Vordrucke mehr mit und füllt nichts aus.
// Geprüft wird: Zu den Angaben passen die richtigen Anträge; jeder Link führt auf eine geprüfte amtliche Seite (Liste unten,
// zuletzt am 16.11.2026 abgerufen); wo es keine prüfbare Landesseite gibt, steht ein Hinweis, wo es den Antrag gibt;
// die Ausfüllhilfe nennt die nötigen Anlagen.
const F = require('../src/formulare.js');
const R = require('../src/rules.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL [formulare] ' + name, x === undefined ? '' : x); } };
// Geprüfte amtliche Seiten (HTTP 200 beim Abruf am 16.11.2026)
const GEPRUEFT = [
  'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/downloads-arbeitslos-arbeit-finden',
  'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-kinderzuschlag',
  'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-kindergeld',
  'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-kindergeld-ab-18',
  'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-erwachsene-mit-behinderungen',
  'https://www.stmb.bayern.de/wohnen/wohnraum_nutzen/wohngeld/index.php',
  'https://www.stmb.bayern.de/wohnen/wohnraum_nutzen/gefoerderte_wohnung_mieten/index.php',
  'https://www.hamburg.de/service/info/11268748/n0/',
  'https://mlw.baden-wuerttemberg.de/de/bauen-wohnen/wohnungsbau/wohnberechtigung',
  'https://www.berlin.de/sen/wohnen/wissen-fuer-mieter/berliner-mietratgeber/wohnberechtigungsschein/'
];

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
const alle = [];
const plan = (s, res) => { const p = F.plan(s, PERSON, res || R.evaluate(s).results); alle.push(...p); return p; };
const finde = (p, id) => p.find((x) => x.id === id);

// Grundsicherungsgeld: ein Link auf die Formularseite der Bundesagentur, Ausfüllhilfe mit den passenden Anlagen
const gg = (s) => finde(plan(s, [{ id: 'ggeld', level: 'ja' }]), 'ggeld');
const a1 = gg({ adults: 1, kids: 2, ek1Art: 'lohn', ek1Brutto: 1600, miete: 850, unterhalt: 200, bezug: { kindergeld: true } });
const t1 = a1 ? a1.hilfe.join(' | ') : '';
ck('Grundsicherungsgeld: Link auf die Formularseite der Bundesagentur', !!a1 && a1.art === 'link' && /downloads-arbeitslos-arbeit-finden/.test(a1.url), JSON.stringify(a1));
ck('Alleinerziehend mit Lohn und Miete: HA, EK, KDU (mit Mietbetrag), VM, KI, UH3, Einkommens- und Mietbescheinigung', ['Hauptantrag', 'Anlage EK', 'Anlage KDU', '850 €', 'Anlage VM', 'Anlage KI', 'Anlage UH3', 'Einkommensbescheinigung', 'Mietbescheinigung'].every((w) => t1.indexOf(w) >= 0), t1);
ck('Alleinerziehend: keine Partner-Anlagen, keine Selbstständigkeit', !/Anlage WEP und|Anlage EKS|Anlage HG|Anlage MEB/.test(t1), t1);
const t2 = gg({ adults: 2, ek1Art: 'selbst', miete: 600, wohnart: 'eigentum', hhAndere: 'verwandte', ernaehrung: true }).hilfe.join(' | ');
ck('Paar, selbstständig, Eigentum, Verwandte, Ernährung: WEP/VE, EKS/SV, HG, MEB; keine Mietbescheinigung', ['Anlage WEP', 'Anlage VE', 'Anlage EKS', 'Anlage SV', 'Anlage HG', 'Anlage MEB'].every((w) => t2.indexOf(w) >= 0) && !/Mietbescheinigung|UH3/.test(t2), t2);
ck('Schwanger, allein: Anlage UH2', /Anlage UH2/.test(gg({ adults: 1, schwanger: true, miete: 450 }).hilfe.join(' ')));
ck('Ausfüllhilfe sagt: Antrag an keine Form gebunden, Geld ab dem Monat des Antrags', /keine Form gebunden/.test(t1) && /Ersten des Monats/.test(t1));
ck('Ohne Grundsicherungsgeld-Ergebnis kein Jobcenter-Antrag', !finde(plan({ adults: 1 }, [{ id: 'ggeld', level: 'nein' }]), 'ggeld'));

// Kinderzuschlag, Kindergeld, Kinder ab 18, Kind mit Behinderung
const kizFall = { adults: 2, kids: 2, kidsU6: 1, ek1Art: 'lohn', ek1Brutto: 2600, ek1Netto: 1900, miete: 900, mietstufe: '3', vermoegen: 1000, bezug: { kindergeld: true } };
const kz = finde(plan(kizFall), 'kiz');
ck('Kinderzuschlag: Link auf die Formularseite der Familienkasse mit Ausfüllhilfe (Anlage Kind)', !!kz && kz.art === 'link' && /formulare-kinderzuschlag/.test(kz.url) && /Anlage Kind/.test(kz.hilfe.join(' ')));
ck('Bereits Kinderzuschlag: kein KiZ-Antrag', !finde(F.plan(Object.assign({}, kizFall, { bezug: { kindergeld: true, kiz: true } }), PERSON, R.evaluate(kizFall).results), 'kiz'));
ck('Ohne gewählte Leistungen: keine Formulare', F.plan(kizFall, PERSON, []).length === 0);
const kg1 = (st) => finde(plan(st, [{ id: 'kindergeld', level: 'ja' }]), 'kg1');
ck('Kindergeld: Link KG 1 mit Anlage Kind und Steuer-ID', /formulare-kindergeld$/.test(kg1({ kids: 1, bezug: {} }).url) && /Anlage Kind/.test(kg1({ kids: 1, bezug: {} }).hilfe.join(' ')));
ck('EU-Bürger: Ausfüllhilfe nennt Anlage EU, sonst nicht', /Anlage EU/.test(kg1({ kids: 1, aufenthalt: 'eu', bezug: {} }).hilfe.join(' ')) && !/Anlage EU/.test(kg1({ kids: 1, bezug: {} }).hilfe.join(' ')));
ck('Kindergeld schon bezogen: kein KG 1', !finde(plan({ adults: 1, kids: 1, bezug: { kindergeld: true } }, [{ id: 'kindergeld', level: 'na' }]), 'kg1'));
const jung = finde(plan({ adults: 2, young: 1, bezug: { kindergeld: true } }, [{ id: 'kindergeld', level: 'na' }]), 'kg18');
ck('Kind ab 18: Link „Kindergeld ab 18“ mit KG 5a, 7e, 11a', !!jung && /formulare-kindergeld-ab-18$/.test(jung.url) && ['KG 5a', 'KG 7e', 'KG 11a'].every((k) => jung.hilfe.join(' ').indexOf(k) >= 0));
const beh = finde(plan({ adults: 1, bhPerson: 'erwVor25', pflegegrad: '3', bezug: {} }, [{ id: 'kgBeh', level: 'vielleicht' }]), 'kg4');
ck('Erwachsenes Kind mit Behinderung: Link auf die Behinderungs-Vordrucke, KG 4e', !!beh && /formulare-erwachsene-mit-behinderungen$/.test(beh.url) && /KG 4e/.test(beh.hilfe.join(' ')));

// Wohngeld: Bayern Link, sonst Hinweis auf die Wohngeldstelle; Grundsicherung im Alter: Hinweis (kein mitgeliefertes Muster)
const wgFall = { adults: 1, ek1Art: 'rente', ek1Brutto: 1150, miete: 520, mietstufe: '3', gebJahr: 1955 };
ck('Wohngeld Bayern: Link auf das Staatsministerium', finde(plan(Object.assign({ bundesland: 'BY' }, wgFall), [{ id: 'wohngeld', level: 'ja' }]), 'wg').art === 'link');
ck('Wohngeld anderes Land: Hinweis auf die Wohngeldstelle', finde(plan(Object.assign({ bundesland: 'NW' }, wgFall), [{ id: 'wohngeld', level: 'ja' }]), 'wg').art === 'hinweis');
const gsa = finde(plan({ adults: 1, bezug: {} }, [{ id: 'gsa', level: 'ja' }]), 'gsa');
ck('Grundsicherung im Alter: Hinweis Sozialamt, formlos möglich, mit Ausfüllhilfe', !!gsa && gsa.art === 'hinweis' && /Sozialamt/.test(gsa.warum) && /formlos/.test(gsa.warum) && gsa.hilfe.length >= 4);
ck('Grundsicherung schon bezogen: kein Antrag', !finde(plan({ adults: 1, bezug: { sozialamt: true } }, [{ id: 'gsa', level: 'ja' }]), 'gsa'));

// Wohnberechtigungsschein je Land
const wbsFall = { adults: 1, ek1Art: 'lohn', ek1Brutto: 1500, ek1Netto: 1150, miete: 500, mietstufe: '3', vermoegen: 100 };
const wbs = (bl) => finde(plan(Object.assign({}, wbsFall, { bundesland: bl }), [{ id: 'wbs', level: 'ja' }]), 'wbs');
[['BY', 'stmb.bayern.de'], ['HH', 'hamburg.de'], ['BW', 'baden-wuerttemberg.de'], ['BE', 'berlin.de']].forEach(([bl, dom]) => { const w = wbs(bl); ck('WBS ' + bl + ': Link auf die amtliche Seite mit Ausfüllhilfe', !!w && w.art === 'link' && w.url.indexOf(dom) > 0 && w.hilfe.length >= 4, JSON.stringify(w)); });
[['BB', 'Amtsverwaltung'], ['HB', 'Senatorin für Bau'], ['RP', 'Verbandsgemeinde'], ['SL', 'Ministerium für Inneres']].forEach(([bl, w0]) => { const w = wbs(bl); ck('WBS ' + bl + ': Hinweis, wo es den Antrag gibt (keine prüfbare Landesseite)', !!w && w.art === 'hinweis' && w.warum.indexOf(w0) >= 0 && !w.url, JSON.stringify(w)); });
['HE', 'MV', 'NI', 'NW', 'SN', 'ST', 'SH', 'TH'].forEach((bl) => { const w = wbs(bl); ck('WBS ' + bl + ': Hinweis auf Stadt oder Gemeinde', !!w && w.art === 'hinweis' && /Stadt oder Gemeinde/.test(w.warum)); });
ck('WBS: Ausfüllhilfe mit Haushalt und Jahreseinkommen', /1 Person/.test(wbs('BY').hilfe[0]) && /18\.000 € brutto im Jahr/.test(wbs('BY').hilfe.join(' ')));
ck('WBS ohne Bundesland: Hinweis, Land anzugeben', /Bundesland/.test(wbs('').warum));
ck('Kein WBS ohne passendes Ergebnis', !finde(F.plan(wbsFall, PERSON, [{ id: 'wbs', level: 'nein' }]), 'wbs'));

// Alle Einträge: nur Link oder Hinweis, kein mitgeliefertes Formular; jeder Link steht auf der Liste der geprüften Seiten
plan({ adults: 1, kids: 1, young: 1, aufenthalt: 'eu', bhPerson: 'erwVor25', pflegegrad: '3', bezug: {}, bundesland: 'BY', miete: 700 }, [{ id: 'kindergeld', level: 'ja' }, { id: 'kgBeh', level: 'ja' }, { id: 'gsa', level: 'ja' }, { id: 'wohngeld', level: 'ja' }, { id: 'kiz', level: 'ja' }, { id: 'ggeld', level: 'ja' }, { id: 'wbs', level: 'ja' }]);
ck('Nur Links oder Hinweise, keine mitgelieferten Vordrucke', alle.every((f) => (f.art === 'link' || f.art === 'hinweis') && !f.datei), alle.filter((f) => f.datei || (f.art !== 'link' && f.art !== 'hinweis')).map((f) => f.id).join(' '));
const links = [...new Set(alle.filter((f) => f.url).map((f) => f.url))];
links.forEach((u) => ck('Link geprüft: ' + u, GEPRUEFT.indexOf(u) >= 0));
ck('Jeder Link mit Ausfüllhilfe', alle.filter((f) => f.art === 'link').every((f) => Array.isArray(f.hilfe) && f.hilfe.length >= 3));
ck('Keine Formular-Dateien mehr in der App', !require('fs').existsSync(require('path').join(__dirname, '..', 'content', 'formulare')));

// Unterlagenliste fürs Jobcenter
const u = F.unterlagen({ adults: 1, kids: 2, ek1Art: 'lohn', miete: 850 });
ck('Unterlagen: Ausweis, Kontoauszüge, Mietvertrag, Lohnabrechnungen', ['Personalausweis', 'Kontoauszüge', 'Mietvertrag', 'Lohnabrechnungen'].every((w) => u.join(' ').indexOf(w) >= 0));

// Satz unter dem Formular-Knopf in der Antragsmappe (fw.*, übersetzt): der deutsche Text ist derselbe wie in formulare.js (keine zweite Fassung)
{
  const de = require('../src/lang/de.json');
  const ja = (id) => [{ id, level: 'ja' }];
  const satz = (s, res, id) => (finde(F.plan(s, PERSON, res), id) || {}).warum;
  const paare = [
    ['fw.ggeld', satz({ adults: 1 }, ja('ggeld'), 'ggeld')], ['fw.kiz', satz({ kids: 1 }, ja('kiz'), 'kiz')],
    ['fw.wg.by', satz({ bundesland: 'BY' }, ja('wohngeld'), 'wg')], ['fw.wg.land', satz({ bundesland: 'HE' }, ja('wohngeld'), 'wg')],
    ['fw.kg1', satz({ kids: 1 }, ja('kindergeld'), 'kg1')], ['fw.kg18', satz({ young: 1 }, ja('kindergeld'), 'kg18')], ['fw.kg4', satz({}, ja('kgBeh'), 'kg4')],
    ['fw.gsa', satz({}, ja('gsa'), 'gsa')], ['fw.wbs.BY', satz({ bundesland: 'BY' }, ja('wbs'), 'wbs')], ['fw.wbs.sonst', satz({ bundesland: 'HE' }, ja('wbs'), 'wbs')], ['fw.wbs.leer', satz({}, ja('wbs'), 'wbs')]];
  paare.forEach(([k, w]) => ck('Mappe: ' + k + ' gleich dem Satz in formulare.js', de[k] === w, [de[k], w]));
}

console.log(fails ? fails + ' von ' + n + ' Formular-Prüfungen FALSCH' : 'Formulare: alle ' + n + ' Prüfungen bestanden (nur geprüfte amtliche Links und Hinweise)');
process.exit(fails ? 1 : 0);
