// Schulden-Liste (src/schulden.js): reine Rechnung (Stufen, Summen mit Kontrolle, Fristende, Reihenfolge, Vergleich mit dem
// Haushaltsplan, Speicherstand, CSV) und Sprachdateien (src/lang/schulden/*.json, src/lang/einfach/schulden.json).
'use strict';
const fs = require('fs'), path = require('path');
const S = require('../src/schulden.js');
let n = 0, fehler = 0;
const ck = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const e = (o) => Object.assign({ id: 'a00000', g: 'X', art: 'sonst', anfang: null, stand: null, standD: '', rate: null, faellig: '', st: 'offen', zu: '', az: '', adr: '', n: '' }, o);
const tag = (iso) => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

// 1. Stufen
ck('[schuldenliste] jede Art hat Stufe 1 bis 3', S.ART.every((a) => [1, 2, 3].includes(S.artStufe(a))));
ck('[schuldenliste] Stufe 1: Miete, Energie, Unterhalt, Geldstrafe, Krankenversicherung (Entscheidung 20.11.2026)', ['miete', 'energie', 'unterhalt', 'geldstrafe', 'kranken'].every((a) => S.artStufe(a) === 1));
ck('[schuldenliste] Stufe 2: Bußgeld, Amt', ['bussgeld', 'behoerde'].every((a) => S.artStufe(a) === 2));
ck('[schuldenliste] Stufe 3: Bank, Inkasso, Handy, Versand, Sonstiges', ['bank', 'inkasso', 'handy', 'versand', 'sonst'].every((a) => S.artStufe(a) === 3));
ck('[schuldenliste] Mahn- und Vollstreckungsbescheid: Frist, unabhängig von der Art', S.stufe(e({ art: 'bank', st: 'mahnbescheid' })) === 'frist' && S.stufe(e({ art: 'miete', st: 'vollstreckungsbescheid' })) === 'frist');
ck('[schuldenliste] Drohung und Pfändung: dringend; erledigt: erledigt', S.stufe(e({ st: 'drohung' })) === 'dringend' && S.stufe(e({ st: 'pfaendung' })) === 'dringend' && S.stufe(e({ art: 'miete', st: 'erledigt' })) === 'erledigt');

// 2. Summen mit Kontrolle
let s = S.summen([e({ stand: 10 }), e({ anfang: 20 })]);
ck('[schuldenliste] Summe centgenau (0,10 + 0,20 = 0,30)', s.gesamt === 30, s);
s = S.summen([e({ anfang: 1000, stand: 1500, rate: 100 }), e({ rate: 50 }), e({ stand: 999, rate: 70, st: 'erledigt' })]);
ck('[schuldenliste] Stand vor Anfang, ohne Betrag zählt mit, erledigte zählen nicht', s.gesamt === 1500 && s.ohneBetrag === 1 && s.raten === 150 && s.n === 2, s);
let seed = 7;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
let alleOk = true;
for (let i = 0; i < 5000; i++) {
  const liste = Array.from({ length: Math.floor(rnd() * 12) }, () => e({ art: S.ART[Math.floor(rnd() * S.ART.length)], st: S.STATUS[Math.floor(rnd() * S.STATUS.length)], anfang: rnd() < 0.7 ? Math.floor(rnd() * 500000) : null, stand: rnd() < 0.5 ? Math.floor(rnd() * 500000) : null, rate: rnd() < 0.5 ? Math.floor(rnd() * 20000) : null }));
  const x = S.summen(liste);
  const art = Object.values(x.proArt).reduce((a, b) => a + b, 0);
  if (!x.ok || x.proStufe[1] + x.proStufe[2] + x.proStufe[3] !== x.gesamt || art !== x.gesamt) { alleOk = false; break; }
}
ck('[schuldenliste] Kontrolle: Stufen und Arten ergeben lückenlos die Gesamtsumme (5000 Zufallslisten)', alleOk);
ck('[schuldenliste] Kontrolle erkennt eine falsche Stufen-Tabelle (Mutation)', S.summen([e({ art: 'bank', stand: 500 })], (a) => (a === 'bank' ? 4 : S.artStufe(a))).ok === false);

// 3. Fristende (eigene Rechnung, bundesweite Feiertage; austauschbar)
ck('[schuldenliste] 9 bundesweite Feiertage 2026 (Ostern 5.4.)', S.feiertageBund(2026).join() === '2026-01-01,2026-04-03,2026-04-06,2026-05-01,2026-05-14,2026-05-25,2026-10-03,2026-12-25,2026-12-26', S.feiertageBund(2026));
ck('[schuldenliste] Ostern 2027 (28.3.) und 2028 (16.4.)', S.feiertageBund(2027)[2] === '2027-03-29' && S.feiertageBund(2028)[1] === '2028-04-14');
ck('[schuldenliste] Fr 11.12.2026 + 2 Wochen → Mo 28.12.2026 (25./26.12. Feiertage, 27.12. Sonntag)', S.fristEnde('2026-12-11', 14) === '2026-12-28', S.fristEnde('2026-12-11', 14));
ck('[schuldenliste] Mo 16.11.2026 + 14 → Mo 30.11.2026', S.fristEnde('2026-11-16', 14) === '2026-11-30');
ck('[schuldenliste] Sa 21.11.2026 + 14 → Sa 05.12. → Mo 07.12.2026', S.fristEnde('2026-11-21', 14) === '2026-12-07');
ck('[schuldenliste] Jahreswechsel 24.12.2026 → 07.01.2027', S.fristEnde('2026-12-24', 14) === '2027-01-07');
ck('[schuldenliste] Schaltjahr 20.02.2028 → So 05.03. → Mo 06.03.2028', S.fristEnde('2028-02-20', 14) === '2028-03-06');
ck('[schuldenliste] Karfreitag/Ostermontag: 20.03.2026 + 14 = Fr 03.04. → Di 07.04.2026', S.fristEnde('2026-03-20', 14) === '2026-04-07');
ck('[schuldenliste] leeres oder ungültiges Datum → null', S.fristEnde('', 14) === null && S.fristEnde('2026-02-30', 14) === null);
S.fristRechner((zu) => (zu === '2026-12-11' ? '2026-12-29' : 'kaputt'));
ck('[schuldenliste] Rechenkern austauschbar (Schulden.fristRechner), ungültige Antwort → eigene Rechnung', S.fristEnde('2026-12-11', 14) === '2026-12-29' && S.fristEnde('2026-11-16', 14) === '2026-11-30');
S.fristRechner(null);
const mb = e({ st: 'mahnbescheid', zu: '2026-11-16' });
ck('[schuldenliste] fristVorbei: am letzten Tag nicht, einen Tag danach ja', !S.fristVorbei(mb, tag('2026-11-30')) && S.fristVorbei(mb, tag('2026-12-01')));
ck('[schuldenliste] Mahnbescheid ohne Zustelldatum: Hinweis statt Frist', S.fristInfo(e({ st: 'mahnbescheid' }), new Date()).ohneDatum === true);

// 4. Reihenfolge
const liste = [e({ id: 'a00001', g: 'Bank', art: 'bank' }), e({ id: 'a00002', g: 'Erledigt', art: 'miete', st: 'erledigt' }), e({ id: 'a00003', g: 'Amt', art: 'behoerde' }),
  e({ id: 'a00004', g: 'Strom B', art: 'energie', faellig: '2026-12-10' }), e({ id: 'a00005', g: 'Pfändung', art: 'bank', st: 'pfaendung' }),
  e({ id: 'a00006', g: 'Gericht', art: 'inkasso', st: 'mahnbescheid', zu: '2026-11-16' }), e({ id: 'a00007', g: 'Strom A', art: 'energie' }), e({ id: 'a00008', g: 'Miete', art: 'miete', faellig: '2026-12-01' })];
const reih = S.sortiert(liste, tag('2026-11-20')).map((x) => x.g).join(',');
ck('[schuldenliste] Reihenfolge: Frist, dringend, Stufe 1 (nach Fälligkeit, leere zuletzt), 2, 3, erledigt', reih === 'Gericht,Pfändung,Miete,Strom B,Strom A,Amt,Bank,Erledigt', reih);

// 5. Vergleich mit dem Haushaltsplan
const v = S.vergleich(8000, { rest: { rest: 20000, leer: false }, raten: 5000 });
ck('[schuldenliste] frei vor Raten 250 €, nach Raten 170 €, Abweichung', v.frei === 25000 && v.nachRaten === 17000 && v.abweichung && !v.zuviel, v);
ck('[schuldenliste] zu hohe Raten', S.vergleich(30000, { rest: { rest: 20000, leer: false }, raten: 5000 }).zuviel === true);
ck('[schuldenliste] ohne Plan kein Vergleich', S.vergleich(100, null) === null && S.vergleich(100, { rest: { rest: 0, leer: true }, raten: 0 }) === null);

// 6. Speicherstand
ck('[schuldenliste] Müll ergibt leere Liste', [null, 5, [], { liste: 'x' }, 'x'].every((m) => S.normiere(m).liste.length === 0));
const nm = S.normiere({ liste: [{ g: '  <img src=x onerror=alert(1)>  ', art: 'quatsch', st: 'nix', anfang: -5, stand: 12.5, rate: 300, zu: '2026-11-16', standD: '2026-13-01', az: 'A'.repeat(99), adr: '=X\nZeile2\nZ3\nZ4\nZ5', n: 'N' }, { g: '' }, { art: 'miete' }] });
const x0 = nm.liste[0];
ck('[schuldenliste] Normieren: Einträge ohne Gläubiger weg, Art/Status bekannt, Cent ganzzahlig ≥ 0, Datum geprüft, Längen gekürzt', nm.liste.length === 1 && x0.art === 'sonst' && x0.st === 'offen' && x0.anfang === null && x0.stand === null && x0.rate === 300 && x0.zu === '' && x0.standD === '' && x0.az.length === 40 && x0.adr.split('\n').length === 4 && x0.g === '<img src=x onerror=alert(1)>', x0);
ck('[schuldenliste] höchstens 200 Einträge', S.normiere({ liste: Array.from({ length: 250 }, (_, i) => ({ g: 'G' + i })) }).liste.length === 200);
ck('[schuldenliste] Beträge wie im Check eingeben', S.zuCent('512,30') === 51230 && S.zuCent('1.234,5') === 123450 && S.zuCent('') === null && S.zuCent('abc') === undefined && S.zuCent('-5') === undefined);

// 7. CSV
const kopf = ['Nr.', 'Gläubiger', 'Anschrift', 'Wofür', 'Aktenzeichen', 'Anfang', 'Jetzt', 'Stand vom', 'Rate/Monat', 'Fällig', 'Stand', 'Zugestellt', 'Notiz'];
const namen = { art: (a) => (a === 'bank' ? '=Bank' : a), st: (x) => x };
const c = S.csv([e({ g: '=1+1', art: 'bank', stand: 51230, az: '  =1+1', adr: '=HYPERLINK("x")\nStraße 1', n: 'a;b "c"' }), e({ g: '+49', az: '-5' }), e({ g: '@SUM' }), e({ g: '\tx' }), e({ g: '\rx' })], ['=Kopf'].concat(kopf.slice(1)), namen, true);
const zl = c.split('\r\n');
ck('[schuldenliste] CSV: Zeilenende CRLF, Kopf und Notiz-Spalte', c.endsWith('\r\n') && zl[0].split(';').length === 13 && zl[0].startsWith("'=Kopf"), zl[0]);
ck('[schuldenliste] CSV: Formeln entschärft (= + - @ Tab CR, auch nach Leerzeichen, erste Zeile der Anschrift, übersetzte Namen)', zl[1].startsWith("2;") === false && zl[1].includes(";'=1+1;") && zl[1].includes(";'  =1+1;") && zl[1].includes('"\'=HYPERLINK(""x"")\nStraße 1"') && zl[1].includes(";'=Bank;") && zl[2].includes(";'+49;") && zl[2].includes(";'-5;"), zl[1]);
ck('[schuldenliste] CSV: @, Tab und CR am Anfang entschärft', c.includes(";'@SUM;") && c.includes(";'\tx;") && c.includes(';"\'\rx";'));
ck('[schuldenliste] CSV: Semikolon und Anführungszeichen gequotet, Betrag 512,30', zl[1].includes(';"a;b ""c"""') && zl[1].includes(';512,30;'), zl[1]);
ck('[schuldenliste] CSV: ohne Notiz 12 Spalten', S.csv([e({ g: 'A', n: 'geheim' })], kopf, namen, false).split('\r\n')[1].split(';').length === 12 && !S.csv([e({ g: 'A', n: 'geheim' })], kopf, namen, false).includes('geheim'));

// 8. Fristen für andere Bereiche
const fr = S.fristen([mb, e({ id: 'b00000', g: 'Geheim GmbH', st: 'vollstreckungsbescheid', zu: '2026-12-11' }), e({ st: 'mahnbescheid' }), e({ st: 'erledigt', zu: '2026-11-16' })], tag('2026-11-20'));
ck('[schuldenliste] fristen(): nur offene mit Zustelldatum, Art mb/vb, kein Gläubigername', fr.length === 2 && fr[0].art === 'mb' && fr[1].art === 'vb' && fr[1].bis === '2026-12-28' && !JSON.stringify(fr).includes('Geheim'), fr);

// 9. Sprachdateien
const DIR = path.join(__dirname, '..', 'src', 'lang', 'schulden');
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
const de = JSON.parse(fs.readFileSync(path.join(DIR, 'de.json'), 'utf8'));
const ph = (x) => (String(x).match(/\{\w+\}/g) || []).sort().join(',');
const AR = '٠١٢٣٤٥٦٧٨٩';
const zahlen = (x) => (String(x).replace(/[٠-٩]/g, (z) => AR.indexOf(z)).replace(/\{[^}]*\}/g, ' ').match(/\d+(?:[.,  ٫٬ ]\d{3})*(?:[.,٫]\d{1,2})?/g) || []).map((z) => z.replace(/\D/g, '').replace(/^0+(?=\d)/, '')).sort().join(' ');
const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'schulden.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '..', 'src', 'geld.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '..', 'src', 'template.html'), 'utf8').replace(/data-t="([^"]+)"/g, "'$1'");
S.ART.forEach((a) => ck('[schuldenliste] Text für Art ' + a, !!de['sl.art.' + a]));
S.STATUS.forEach((a) => ck('[schuldenliste] Text für Stand ' + a, !!de['sl.st.' + a]));
['miete', 'energie', 'unterhalt', 'geldstrafe', 'kranken', 'bussgeld', 'behoerde', 'rest'].forEach((a) => ck('[schuldenliste] Begründung „Warum?“ ' + a, !!de['sl.warum.' + a]));
const unbenutzt = Object.keys(de).filter((k) => !code.includes("'" + k + "'") && !/^sl\.(art|st|warum|col|u|hilfe|stufe|frist)\./.test(k) && !/^(kc\.q\d|ip\.\d|sb\.w\d|ms\.(geduld|aufst|wider|pkonto)(\.t)?)$|\.kurz$/.test(k)); // zusammengesetzte Schlüssel (src/geld.js, tippEl)
ck('[schuldenliste] keine unbenutzten Schlüssel', unbenutzt.length === 0, unbenutzt);
for (const l of LANGS) {
  const f = path.join(DIR, l + '.json');
  if (!fs.existsSync(f)) { ck('[schuldenliste] Sprachdatei ' + l, false); continue; }
  const L = JSON.parse(fs.readFileSync(f, 'utf8'));
  const fehlt = Object.keys(de).filter((k) => typeof L[k] !== 'string' || !L[k].trim());
  ck('[schuldenliste] ' + l + ': alle Schlüssel vorhanden', fehlt.length === 0, fehlt.slice(0, 5));
  ck('[schuldenliste] ' + l + ': keine fremden Schlüssel', Object.keys(L).every((k) => k in de), Object.keys(L).filter((k) => !(k in de)));
  const phF = Object.keys(de).filter((k) => L[k] && ph(L[k]) !== ph(de[k]));
  ck('[schuldenliste] ' + l + ': Platzhalter wie im Deutschen', phF.length === 0, phF);
  const zF = Object.keys(de).filter((k) => L[k] && zahlen(L[k]) !== zahlen(de[k]));
  ck('[schuldenliste] ' + l + ': Zahlen und Paragrafen wie im Deutschen', zF.length === 0, zF.map((k) => k + ' de[' + zahlen(de[k]) + '] ' + l + '[' + zahlen(L[k]) + ']'));
}
const ein = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'schulden.json'), 'utf8'));
ck('[schuldenliste] Einfache Sprache: nur Schlüssel aus de, Platzhalter nur aus de', Object.keys(ein).every((k) => k in de && (ph(ein[k]) === '' || ph(ein[k]).split(',').every((p) => ph(de[k]).includes(p)))), Object.keys(ein).filter((k) => !(k in de)));

// 10. Korrektur sp.schulden.mahn (alle Sprachen): Widerspruch bis zum Vollstreckungsbescheid (§ 694 ZPO), Einspruch 2 Wochen Notfrist (§§ 700, 339 ZPO), Einspruch stoppt die Pfändung nicht von selbst (§ 719 ZPO)
for (const l of LANGS) {
  const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', l + '.json'), 'utf8'))['sp.schulden.mahn'] || '';
  ck('[schuldenliste] ' + l + ': sp.schulden.mahn nennt §§ 692, 694, 700, 339, 719 ZPO und 2 Wochen nicht mehr als hartes Ende', ['692', '694', '700', '339', '719'].every((z) => m.includes(z)) && (l !== 'de' || (/solange/.test(m) && /sofort gepfändet/.test(m) && !/muss innerhalb von 2 Wochen nach der Zustellung beim Gericht ankommen \(§ 692/.test(m))));
}

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
console.log('Schulden-Liste-Test bestanden: ' + n + ' Prüfungen');
