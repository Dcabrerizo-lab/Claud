// Haushaltsbuch: Geld-Hinweise (Mehrbedarf, Erspartes, Pflege- und Steuer-Belege), Beleg-Häkchen, Belegliste.
// Entwurf mit Prüfvermerk: docs/entwuerfe/haushaltsbuch-hinweise.md. Nur geltendes Recht (keine Gesetzentwürfe).
'use strict';
const fs = require('fs'), path = require('path');
const H = require('../src/haushalt.js');
const R = require('../src/rules.js');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const heute = new Date(2026, 10, 20);
const geld = (l) => l.filter((x) => ['mb', 'verm', 'pflege', 'steuer'].includes(x.art));
const eins = (e) => { const g = geld(H.hinweisListe(Object.assign({ heute }, e))); return g.length ? g[0] : null; };
const GG = { grundsicherungsgeld: true };

// 1. Mehrbedarf Schwangerschaft nur mit Grundsicherungsgeld/Sozialhilfe; keine Treffer bei „Frauenarzt“/„Kinderwagen“
check('[hb-mehrbedarf] Schwangerschaft ohne Bezug: kein Hinweis', eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Mutterpass Kopie' }] }) === null);
check('[hb-mehrbedarf] Schwangerschaft mit Grundsicherungsgeld', (eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Mutterpass Kopie' }], bezug: GG }) || {}).was === 'schwanger');
check('[hb-mehrbedarf] auch mit Check-Ergebnis „vielleicht“', (eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Umstandshose' }], ergebnis: { gsa: 'vielleicht' } }) || {}).was === 'schwanger');
check('[hb-mehrbedarf] Frauenarzt / Kinderwagen lösen nichts aus', eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Frauenarzt' }, { c: 9000, k: 'kinder', n: 'Kinderwagen' }], bezug: GG, ein: 10000000 }) === null);
check('[hb-mehrbedarf] schon im Check angehakt: kein Hinweis', eins({ eintraege: [{ c: 500, k: 'sonst', n: 'schwanger' }], bezug: GG, geld: { angaben: { schwanger: true } } }) === null);
// 2. Warmwasser, Ernährung, Dauer
check('[hb-mehrbedarf] Warmwasser: Boiler ja, Therme nein', (eins({ eintraege: [{ c: 500, k: 'energie', n: 'Boiler repariert' }], bezug: GG }) || {}).was === 'ww' && eins({ eintraege: [{ c: 500, k: 'energie', n: 'Gastherme Wartung' }], bezug: GG }) === null);
check('[hb-mehrbedarf] Warmwasser im Check angehakt: kein Hinweis', eins({ eintraege: [{ c: 500, k: 'energie', n: 'Durchlauferhitzer' }], bezug: GG, geld: { angaben: { warmwasser: true } } }) === null);
check('[hb-mehrbedarf] Ernährung (glutenfrei, Zöliakie)', (eins({ eintraege: [{ c: 500, k: 'essen', n: 'glutenfreies Brot' }], bezug: GG }) || {}).was === 'ern' && (eins({ eintraege: [{ c: 500, k: 'essen', n: 'Zoeliakie' }], bezug: GG }) || {}).was === 'ern');
check('[hb-mehrbedarf] Dauer nur wiederkehrend in „Sonstiges“', (eins({ eintraege: [{ c: 3000, k: 'sonst', n: 'Fahrt zum Kind (Umgang)', w: true }], bezug: GG }) || {}).was === 'dauer' &&
  eins({ eintraege: [{ c: 3000, k: 'sonst', n: 'Fahrt zum Kind (Umgang)' }], bezug: GG }) === null && eins({ eintraege: [{ c: 3000, k: 'mobil', n: 'Umgang', w: true }], bezug: GG }) === null);
// 3. Alleinerziehend nur mit Bezug; Behinderung nicht bei „antrag“
check('[hb-mehrbedarf] Alleinerziehend nur mit Bezug und 1 Erwachsener + Kind', (eins({ bezug: GG, geld: { angaben: { adults: 1, kids: 2 } } }) || {}).was === 'ae' &&
  eins({ ergebnis: { ggeld: 'ja' }, geld: { angaben: { adults: 1, kids: 2 } } }) === null && eins({ bezug: GG, geld: { angaben: { adults: 2, kids: 2 } } }) === null);
check('[hb-mehrbedarf] Behinderung: GdB ohne Teilhabe/G; nicht bei „antrag“', (eins({ bezug: GG, geld: { angaben: { gdb: '50' } } }) || {}).was === 'beh' &&
  eins({ bezug: GG, geld: { angaben: { gdb: 'antrag' } } }) === null && eins({ bezug: GG, geld: { angaben: { gdb: '50', mzG: true } } }) === null);

// 4. Höchstens ein Geld-Hinweis, der mit der höchsten Prio
const viele = H.hinweisListe({ heute, bezug: GG, eintraege: [{ c: 500, k: 'sonst', n: 'Mutterpass' }, { c: 9000, k: 'sonst', n: 'Handwerker' }],
  geld: { angaben: { ek1Art: 'lohn', adults: 1, kids: 1 }, buchAlle: [{ id: 'a', d: '2026-10-05', c: 13100, k: 'sonst', n: 'Pflegedienst', bp: true }] } });
check('[hb-geld] höchstens ein Geld-Hinweis gleichzeitig (höchste Prio)', geld(viele).length === 1 && geld(viele)[0].id === 'mb-schwanger', viele.map((x) => x.id));
check('[hb-geld] weggeklickt: nächster Kandidat', geld(H.hinweisListe({ heute, bezug: GG, weg: { 'mb-schwanger': true }, eintraege: [{ c: 500, k: 'sonst', n: 'Mutterpass' }], geld: { angaben: { adults: 1, kids: 1 } } }))[0].id === 'mb-ae');

// 5. Erspartes nah an der Grenze (App-Regel 80 % / 6 Monate)
const G = { ggeld: 10000, gsa: 10000, wohngeld: 60000, kiz: 55000 };
check('[hb-verm] 7.999 € von 10.000 €: nein', H.vermNah(7999, G, 0, { ggeld: 'ja' }, {}) === null);
check('[hb-verm] 8.000 €: ja', (H.vermNah(8000, G, 0, { ggeld: 'ja' }, {}) || {}).g === 10000);
check('[hb-verm] über der Grenze: kein Hinweis (Check sagt schon „nein“)', H.vermNah(10001, G, 0, { ggeld: 'ja' }, {}) === null);
const bald = H.vermNah(5000, G, 90000, {}, GG);
check('[hb-verm] 5.000 € + 900 € im Monat: in 6 Monaten', bald && bald.l === 'ggeld' && bald.monate === 6, bald);
check('[hb-verm] ohne Leistung oder ohne Erspartes: nein', H.vermNah(9000, G, 0, {}, {}) === null && H.vermNah(null, G, 0, { ggeld: 'ja' }, {}) === null && H.vermNah(9000, null, 0, { ggeld: 'ja' }, {}) === null);
check('[hb-verm] kleinste Grenze gewinnt', H.vermNah(9000, G, 0, { ggeld: 'ja', wohngeld: 'ja' }, {}).l === 'ggeld' && H.vermNah(50000, G, 0, { ggeld: 'ja', wohngeld: 'ja' }, {}).l === 'wohngeld');
const vh = (grenze, weg) => geld(H.hinweisListe({ heute, ergebnis: { ggeld: 'ja' }, weg, geld: { verm: 9500, grenzen: { ggeld: grenze }, rest: 60000 } }));
check('[hb-verm] Weg-ID mit Grenze: neue Grenze zeigt den Hinweis wieder', vh(10000, { 'verm-ggeld-10000': true }).length === 0 && vh(12500, { 'verm-ggeld-10000': true }).length === 1 && vh(12500, {})[0].id === 'verm-ggeld-12500');
// Grenzen aus der Regel-Engine (dieselben Formeln wie die Karten)
const gr = R.evaluate({ adults: 1, kids: 1, young: 0, gebJahr: 1980, alterGruppe: '40-49', bezug: {} }).grenzen;
check('[hb-verm] Regel-Engine liefert Grenzen je Leistung', gr && gr.ggeld > 0 && gr.gsa === R.RULES.grundsicherung.schonAllein + R.RULES.schonUnterhalten && gr.wohngeld === R.RULES.wohngeld.vermoegenErste + R.RULES.wohngeld.vermoegenJeWeitere && gr.kiz === R.RULES.kiz.vermZwei, gr);

// 7. Pflege-Belege; nur geltendes Recht (kein Hinweis auf Gesetzentwürfe), gleich vor und ab 1.1.2027
const buchPf = [{ id: 'p', d: '2026-09-10', c: 13100, k: 'sonst', n: 'Alltagshilfe', bp: true }];
const pfl = (tag, buch) => geld(H.hinweisListe({ heute: tag, geld: { angaben: { pflegegrad: 2 }, buchAlle: buch } }));
check('[hb-belege] Pflege-Belege: Hinweis mit Summe', pfl(heute, buchPf).length === 1 && pfl(heute, buchPf)[0].b === 13100 && pfl(heute, buchPf)[0].id === 'pflege-2026-2');
check('[hb-belege] Pflege-Belege aus dem vorigen Halbjahr zählen mit (Reste bis 30.6.)', pfl(new Date(2027, 2, 1), buchPf).length === 1 && pfl(new Date(2027, 6, 1), buchPf).length === 0);
check('[hb-pflege-recht] ohne Belege kein Pflege-Hinweis, auch mit Pflegegrad (31.12.2026 und 1.1.2027)', pfl(new Date(2026, 11, 31), []).length === 0 && pfl(new Date(2027, 0, 1), []).length === 0 && pfl(new Date(2026, 10, 1), []).length === 0);
check('[hb-pflege-recht] Hinweis vor und ab 1.1.2027 gleich (geltendes Recht, keine Frist-Variante)', JSON.stringify(pfl(new Date(2026, 11, 31), buchPf).map((x) => [x.art, x.frist, x.b])) === JSON.stringify(pfl(new Date(2027, 0, 1), buchPf).map((x) => [x.art, x.frist, x.b])));
const DE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt', 'de.json'), 'utf8'));
const geldTexte = Object.keys(DE).filter((k) => /^hb\.(hw\.(mb|verm|pflege|steuer|belege)|beleg|bl)\b/.test(k));
check('[hb-pflege-recht] keine Texte zu Gesetzentwürfen (Pflegereform, Sozialraumbudget, Entwurf, ab 2027)', geldTexte.length > 30 && !geldTexte.some((k) => /entwurf|sozialraum|pflegereform|PNOG|2027|21\/8869/i.test(DE[k])), geldTexte.filter((k) => /entwurf|sozialraum|2027/i.test(DE[k])));
check('[hb-pflege-recht] Pflege-Text nennt geltendes Recht: Entlastungsbetrag, Reste bis 30.6., § 45b SGB XI', /Entlastungsbetrag/.test(DE['hb.hw.pflege.d']) && /30\.6\./.test(DE['hb.hw.pflege.d']) && /§ 45b/.test(DE['hb.hw.pflege.d']));
check('[hb-pflege-recht] RULES ohne Entwurfs-Werte', !('pnog' in R.RULES) && R.RULES.pflege.entlastung === 131 && R.RULES.pflegeHm === 42);
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'haushalt.js'), 'utf8');
check('[hb-pflege-recht] Code ohne Frist-Hinweis zum Entwurf', !/pflege\.frist|pnog/i.test(src));

// 7a. Steuer-Hinweis
const st = (bezug, ek1Art) => eins({ bezug, eintraege: [{ c: 9000, k: 'sonst', n: 'Handwerker Bad' }], geld: { angaben: { ek1Art } } });
check('[hb-steuer] kein Steuer-Hinweis bei Grundsicherungsgeld ohne Erwerbseinkommen', st(GG, '') === null && st({ sozialamt: true }, 'rente') === null);
check('[hb-steuer] Steuer-Hinweis mit Lohn oder ohne Bezug', (st(GG, 'lohn') || {}).art === 'steuer' && (st({}, '') || {}).art === 'steuer');
check('[hb-steuer] schon als Beleg markiert: kein Hinweis', eins({ eintraege: [{ c: 9000, k: 'sonst', n: 'Handwerker', bs: true }] }) === null);

// 8. Belegliste und Halbjahre
const buch = [{ id: 'w', d: '2026-05-31', c: 5000, k: 'sonst', n: 'Pflegedienst', w: true, bp: true }, { id: 's', d: '2026-07-01', c: 2000, k: 'sonst', n: 'Brille', bs: true }];
check('[hb-belege] wiederkehrender Beleg über drei Monate = 3 Einträge (31. → Monatsletzter)', H.belegListe(buch, 'bp', '2026-05-01', '2026-07-31').map((e) => e.d).join() === '2026-05-31,2026-06-30,2026-07-31');
check('[hb-belege] Halbjahr-Grenze 30.6./1.7.', H.halbjahr('2026-06-30') === '2026-1' && H.halbjahr('2026-07-01') === '2026-2' && H.halbjahr(new Date(2026, 11, 31)) === '2026-2');
check('[hb-belege] Summe laufendes Halbjahr / mit vorigem', H.belegSumme(buch, 'bp', '2026-1', false) === 10000 && H.belegSumme(buch, 'bs', '2026-2', true) === 2000 && H.belegSumme([buch[0]], 'bp', '2026-2', true) > 30000);
// 9. CSV
const csv = H.belegCsv([{ d: '2026-07-01', k: 'sonst', n: '=SUMME(A1)', c: 1234 }, { d: '2026-07-02', k: 'sonst', n: 'a;b', c: 100 }], ['Datum', 'Kategorie', 'Notiz', 'Betrag', 'Für'], (k) => k, () => 'Steuer');
const zeilen = csv.split('\r\n');
check('[hb-belege] CSV: Kopfzeile, Formel entschärft, Semikolon in Anführungszeichen, CRLF', zeilen[0] === 'Datum;Kategorie;Notiz;Betrag;Für' && zeilen[1] === "2026-07-01;sonst;'=SUMME(A1);12,34;Steuer" && zeilen[2] === '2026-07-02;sonst;"a;b";1,00;Steuer' && csv.endsWith('\r\n'), zeilen);
// 10. Speichern: Beleg-Felder nur als true, fremde Felder weg, alte Stände lesbar
const nd = H.normiere({ buch: [{ id: '1', d: '2026-11-01', c: 100, k: 'sonst', n: 'x', w: false, bs: 'ja', bp: true, x: 1 }, { id: '2', d: '2026-11-02', c: 200, k: 'essen' }] });
check('[hb-belege] normiere: bs nur als true, fremde Felder weg, alter Stand unverändert', nd.buch[0].bs === undefined && nd.buch[0].bp === true && !('x' in nd.buch[0]) && JSON.stringify(nd.buch[1]) === JSON.stringify({ id: '2', d: '2026-11-02', c: 200, k: 'essen' }), nd.buch);
// 11. Zahlen aus RULES (keine festen Beträge in den Texten)
check('[hb-geld] Werte in RULES: 42 €, § 35a 4.000 / 1.200 €, 1.230 €, 500 €', R.RULES.pflegeHm === 42 && R.RULES.steuer.hnd === 4000 && R.RULES.steuer.handwerk === 1200 && R.RULES.steuer.anPausch === 1230 && R.RULES.schonUnterhalten === 500);
check('[hb-geld] keine festen Euro-Beträge in den neuen Texten (Platzhalter)', !geldTexte.some((k) => /\d\s?(€|Euro)/.test(DE[k])), geldTexte.filter((k) => /\d\s?(€|Euro)/.test(DE[k])));
// Sprachen: alle neuen Schlüssel in 13 Sprachen (Platzhalter/Zahlen prüft test-haushalt.js), Einfache Sprache mit denselben Platzhaltern
const LANGS = ['en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
LANGS.forEach((l) => { const L = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt', l + '.json'), 'utf8')); check('[hb-geld] ' + l + ': alle neuen Schlüssel übersetzt', geldTexte.every((k) => typeof L[k] === 'string' && L[k].trim() && (L[k] !== DE[k] || /^Zum Leistungs-Check$/.test(DE[k])))); });
const EF = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'haushalt.json'), 'utf8'));
check('[hb-geld] Einfache Sprache für die Hinweistexte', ['hb.hw.mb.schwanger', 'hb.hw.verm', 'hb.hw.pflege', 'hb.hw.steuer', 'hb.bl.hinweis'].every((k) => EF[k] && EF[k] !== DE[k]));
// Wortlisten
check('[hb-belege] Vorschlag: Pflegedienst/Handwerker; „bar“ erkannt, „Barzahlung“ nicht als Wort „bar“', H.WORTE_GELD.pflegeBeleg.test('Pflegedienst Mai') && H.WORTE_GELD.steuer.test('Handwerker') && H.WORTE_GELD.bar.test('Maler, bar bezahlt') && !H.WORTE_GELD.bar.test('Barzahlung'));

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
console.log('Haushalt-Geld-Test bestanden: ' + n + ' Prüfungen (Mehrbedarf, Erspartes, Pflege, Steuer, Belege, geltendes Recht vor/ab 1.1.2027)');
