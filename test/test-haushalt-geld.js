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
check('[hb-mehrbedarf] Schwangerschaft nur bei Bezug, nicht bei Check „vielleicht“/„ja“', eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Umstandshose' }], ergebnis: { gsa: 'vielleicht' } }) === null && eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Umstandshose' }], ergebnis: { ggeld: 'ja' } }) === null);
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
check('[hb-mehrbedarf] Behinderung nur ab GdB 50 oder Merkzeichen H', eins({ bezug: GG, geld: { angaben: { gdb: '30' } } }) === null && eins({ bezug: GG, geld: { angaben: { gdb: '40' } } }) === null &&
  (eins({ bezug: GG, geld: { angaben: { gdb: 'H' } } }) || {}).was === 'beh' && (eins({ bezug: GG, geld: { angaben: { gdb: '100' } } }) || {}).was === 'beh');

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
check('[hb-belege] Pflege-Belege: Hinweis mit Summe', pfl(heute, buchPf).length === 1 && pfl(heute, buchPf)[0].b === 13100 && pfl(heute, buchPf)[0].id === 'pflege-2026');
check('[hb-pflege-fenster] Vorjahr zählt bis 30.6. mit (Reste § 45b), ab 1.7. nicht mehr', pfl(new Date(2027, 2, 1), buchPf).length === 1 && pfl(new Date(2027, 5, 30), buchPf).length === 1 && pfl(new Date(2027, 6, 1), buchPf).length === 0);
check('[hb-pflege-fenster] Belege aus Januar zählen im Dezember (ganzes Kalenderjahr, nicht nur Halbjahr)', pfl(new Date(2026, 11, 1), [{ id: 'j', d: '2026-01-10', c: 4000, k: 'sonst', n: 'Alltagshilfe', bp: true }]).length === 1);
check('[hb-pflege-fenster] Fenster und Weg-ID', JSON.stringify(H.pflegeFenster('2027-03-01')) === JSON.stringify({ von: '2026-01-01', bis: '2027-03-01', id: 'pflege-2027-vj' }) &&
  JSON.stringify(H.pflegeFenster('2027-07-01')) === JSON.stringify({ von: '2027-01-01', bis: '2027-07-01', id: 'pflege-2027' }) && H.pflegeFenster('2027-06-30').von === '2026-01-01');
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
check('[hb-steuer] als Pflege-Beleg markiert: kein Steuer-Hinweis', eins({ eintraege: [{ c: 9000, k: 'sonst', n: 'Pflegedienst', bp: true }] }) === null && (eins({ eintraege: [{ c: 9000, k: 'sonst', n: 'Pflegedienst' }] }) || {}).art === 'steuer');

// 8. Belegliste und Halbjahre
const buch = [{ id: 'w', d: '2026-05-31', c: 5000, k: 'sonst', n: 'Pflegedienst', w: true, bp: true }, { id: 's', d: '2026-07-01', c: 2000, k: 'sonst', n: 'Brille', bs: true }];
check('[hb-belege] wiederkehrender Beleg über drei Monate = 3 Einträge (31. → Monatsletzter)', H.belegListe(buch, 'bp', '2026-05-01', '2026-07-31', '2026-11-20').map((e) => e.d).join() === '2026-05-31,2026-06-30,2026-07-31');
check('[hb-belege] Summen', H.belegSumme(buch, 'bp', '2026-01-01', '2026-06-30', '2026-11-20') === 10000 && H.belegSumme(buch, 'bs', '2026-01-01', '2026-12-31', '2026-11-20') === 2000);
// Befund 1: wiederkehrende Belege zählen keine künftigen Monate
const wj = [{ id: 'm', d: '2026-01-15', c: 5000, k: 'sonst', n: 'Alltagshilfe', w: true, bp: true }];
check('[hb-belege-heute] Jahresliste am 20.11.: Januar bis November (11), nicht Dezember', H.belegListe(wj, 'bp', '2026-01-01', '2026-12-31', '2026-11-20').length === 11 && H.belegListe(wj, 'bp', '2026-01-01', '2026-12-31', '2026-11-14').length === 10);
check('[hb-belege-heute] künftiges Jahr leer, Summe nur bis heute', H.belegListe(wj, 'bp', '2027-01-01', '2027-12-31', '2026-11-20').length === 0 && H.belegSumme(wj, 'bp', '2026-01-01', '2026-12-31', '2026-11-20') === 55000);
check('[hb-belege-heute] Pflege-Hinweis zählt nur bis heute', (pfl(heute, wj)[0] || {}).b === 55000, pfl(heute, wj));
// 9. CSV
const csv = H.belegCsv([{ d: '2026-07-01', k: 'sonst', n: '=SUMME(A1)', c: 1234 }, { d: '2026-07-02', k: 'sonst', n: 'a;b', c: 100 }], ['Datum', 'Kategorie', 'Notiz', 'Betrag', 'Für'], (k) => k, () => 'Steuer');
const zeilen = csv.split('\r\n');
check('[hb-belege] CSV: Kopfzeile, Formel entschärft, Semikolon in Anführungszeichen, CRLF', zeilen[0] === 'Datum;Kategorie;Notiz;Betrag;Für' && zeilen[1] === "2026-07-01;sonst;'=SUMME(A1);12,34;Steuer" && zeilen[2] === '2026-07-02;sonst;"a;b";1,00;Steuer' && csv.endsWith('\r\n'), zeilen);
// 10. Speichern: Beleg-Felder nur als true, fremde Felder weg, alte Stände lesbar
const nd = H.normiere({ buch: [{ id: '1', d: '2026-11-01', c: 100, k: 'sonst', n: 'x', w: false, bs: 'ja', bp: true, x: 1 }, { id: '2', d: '2026-11-02', c: 200, k: 'essen' }] });
const nt = H.normiere({ buch: [{ id: { x: 1 }, d: '2026-11-01', c: 100, k: 'quatsch', n: 42, w: 'true', bis: 'bald' }, { id: 'ok', d: '2026-11-01', c: 100, k: 'essen', n: 'x'.repeat(200), w: true, bis: '2026-12' }, { id: 'ok2', d: '2026-11-01', c: 100, k: 'essen', bis: '2026-12' }] }).buch;
check('[hb-bereinigen] Typen: id Text, k bekannte Kategorie, n Text bis 80, w nur true, bis JJJJ-MM', nt[0].id === 'e-alt-0' && nt[0].k === 'sonst' && !('n' in nt[0]) && !('w' in nt[0]) && !('bis' in nt[0]) &&
  nt[1].id === 'ok' && nt[1].n.length === 80 && nt[1].w === true && nt[1].bis === '2026-12' && !('bis' in nt[2]), nt);
check('[hb-belege] normiere: bs nur als true, fremde Felder weg, alter Stand unverändert', nd.buch[0].bs === undefined && nd.buch[0].bp === true && !('x' in nd.buch[0]) && JSON.stringify(nd.buch[1]) === JSON.stringify({ id: '2', d: '2026-11-02', c: 200, k: 'essen' }), nd.buch);
// 11. Zahlen aus RULES (keine festen Beträge in den Texten)
check('[hb-geld] Werte in RULES: 42 €, § 35a 4.000 / 1.200 €, 1.230 €, 500 €', R.RULES.pflegeHm === 42 && R.RULES.steuer.hnd === 4000 && R.RULES.steuer.handwerk === 1200 && R.RULES.steuer.anPausch === 1230 && R.RULES.schonUnterhalten === 500);
check('[hb-geld] keine festen Euro-Beträge in den neuen Texten (Platzhalter)', !geldTexte.some((k) => /\d\s?(€|Euro)/.test(DE[k])), geldTexte.filter((k) => /\d\s?(€|Euro)/.test(DE[k])));
// Sprachen: alle neuen Schlüssel in 13 Sprachen (Platzhalter/Zahlen prüft test-haushalt.js), Einfache Sprache mit denselben Platzhaltern
const LANGS = ['en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'fr', 'fa-AF', 'fa', 'ps', 'so'];
LANGS.forEach((l) => { const L = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt', l + '.json'), 'utf8')); check('[hb-geld] ' + l + ': alle neuen Schlüssel übersetzt', geldTexte.every((k) => typeof L[k] === 'string' && L[k].trim() && (L[k] !== DE[k] || /^Zum Leistungs-Check$/.test(DE[k])))); });
const EF = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'haushalt.json'), 'utf8'));
const ALLE = Object.fromEntries(['de'].concat(LANGS).map((l) => [l, JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'haushalt', l + '.json'), 'utf8'))]));
// Befund 2, 3, 5, 18: Einfache Sprache
check('[hb-einfach] Pflege: „kann … zurückgeben. Nur für anerkannte Hilfen.“', /^Die Pflegekasse kann dir Geld zurückgeben\. Nur für anerkannte Hilfen\. Dafür brauchst du Belege\./.test(EF['hb.hw.pflege.d']));
check('[hb-einfach] Schwangerschaft: erst die Frage nach dem Bezug', /^Bekommst du Grundsicherungsgeld oder Sozial-Hilfe\? Dann gibt es ab der 13\. Woche mehr Geld\./.test(EF['hb.hw.mb.schwanger']));
check('[hb-einfach] Grundsicherungsgeld: Bescheid vor dem 1.7.2026 → andere Beträge', /Hat dein Bescheid vor dem 1\.7\.2026 angefangen\? Dann gelten andere Beträge\./.test(EF['hb.hw.verm.d.ggeld']));
check('[hb-einfach] Sozialhilfe: „Jeder Erwachsene darf {a} behalten.“', /Jeder Erwachsene darf \{a\} behalten\./.test(EF['hb.hw.verm.d.gsa']));
check('[hb-einfach] Bar-Warnung nur Handwerker/Haushalts-Hilfe', EF['hb.beleg.bar'] === 'Handwerker oder Haushalts-Hilfe bar bezahlt? Das zählt bei der Steuer nicht.');
// Befund 4, 5, 6, 12: neue Texte in allen Sprachen
const NEUK = ['hb.hw.verm.gg', 'hb.hw.verm.gg.bald', 'hb.hw.verm.gg0', 'hb.hw.verm.gg0.bald', 'hb.hw.verm.wg', 'hb.hw.verm.wg.bald'];
check('[hb-verm-text] neue Überschriften in 13 Sprachen und Einfach, gleiche Platzhalter', Object.keys(ALLE).every((l) => NEUK.every((k) => ALLE[l][k] && JSON.stringify((ALLE[l][k].match(/\{\w+\}/g) || []).sort()) === JSON.stringify((ALLE.de[k].match(/\{\w+\}/g) || []).sort()))) && NEUK.every((k) => EF[k] && EF[k] !== ALLE.de[k]));
check('[hb-verm-wohngeld] „Richtwert“ statt „Grenze“, Aufklapptext mit Nr. 21.37 WoGVwV (13 Sprachen + Einfach)', /Richtwert/.test(ALLE.de['hb.hw.verm.wg']) && !/Grenze/.test(ALLE.de['hb.hw.verm.wg'] + ALLE.de['hb.hw.verm.wg.bald']) &&
  Object.keys(ALLE).every((l) => /\(Nr\. 21\.37 WoGVwV\)/.test(ALLE[l]['hb.hw.verm.d.wohngeld'])) && /Nr\. 21\.37 WoGVwV/.test(EF['hb.hw.verm.d.wohngeld']));
check('[hb-verm-ggeld] Grundsicherungsgeld-Überschrift mit Vorbehalt („möglicherweise“, „etwa“); ohne Zahl bei Paaren', /möglicherweise/.test(ALLE.de['hb.hw.verm.gg']) && /etwa \{g\}/.test(ALLE.de['hb.hw.verm.gg']) && !/\{g\}/.test(ALLE.de['hb.hw.verm.gg0'] + ALLE.de['hb.hw.verm.gg0.bald'] + EF['hb.hw.verm.gg0']));
check('[hb-verm-kiz] Kinderzuschlag: nur erster Monat gekürzt, wenn darüber kleiner als der monatliche Kinderzuschlag (alle Sprachen)', /Ist der Betrag darüber kleiner als dein Kinderzuschlag im Monat, wird nur der erste Monat gekürzt\./.test(ALLE.de['hb.hw.verm.d.kiz']) &&
  Object.keys(ALLE).every((l) => /Kinderzuschlag/.test(ALLE[l]['hb.hw.verm.d.kiz']) && !/(oft|often|souvent|часто|często|adesea|çoğu zaman|غالبًا|اغلب|اکثراً|badanaa) .*(erste|first|premier|перв|pierwsz|prima|ilk|الأول|اول|لومړۍ|koowaad)[^.]*\.$/.test(ALLE[l]['hb.hw.verm.d.kiz'])) && /ersten Monat/.test(EF['hb.hw.verm.d.kiz']));
// Befund 15, 16: deutsche Amtsbegriffe in Klammern
check('[hb-en] Boiler und Durchlauferhitzer', /electric water heater \(Boiler\) or instantaneous water heater \(Durchlauferhitzer\)/.test(ALLE.en['hb.hw.mb.ww']));
const amt = (l) => ['(Regelbedarf)', '(Verhinderungspflege)', '(Kurzzeitpflege)', '(Pflegegrad)', '(Bewilligungszeitraum)', '(volle Erwerbsminderung)'].every((w) => Object.values(ALLE[l]).join(' ').includes(w));
check('[hb-amtsbegriffe] en/tr/ar mit deutschen Amtsbegriffen in Klammern', ['en', 'tr', 'ar'].every(amt), ['en', 'tr', 'ar'].filter((l) => !amt(l)));
check('[hb-amtsbegriffe] tr „yedek bakım (Verhinderungspflege)“, en „full reduction in earning capacity“', /yedek bakım \(Verhinderungspflege\)/i.test(ALLE.tr['hb.hw.pflege.d']) && /full reduction in earning capacity/.test(ALLE.en['hb.hw.mb.beh.d']));
// Befund 17: Entwurf markiert
const ENTW = fs.readFileSync(path.join(__dirname, '..', 'docs', 'entwuerfe', 'haushaltsbuch-hinweise.md'), 'utf8').split('\n');
check('[hb-entwurf] PNOG-/pflege.frist-Stellen als „NICHT GEBAUT (nur geltendes Recht)“ markiert', ENTW.filter((z) => /^\| [^|]*pflege\.frist|PNOG-Entwurf \(20\)|pflegeFristAktiv\(e\.heute/.test(z)).every((z) => /NICHT GEBAUT \(nur geltendes Recht\)/.test(z) || /NICHT GEBAUT/.test(ENTW[ENTW.indexOf(z) - 1])) && ENTW.filter((z) => /NICHT GEBAUT \(nur geltendes Recht\)/.test(z)).length >= 8);
check('[hb-geld] Einfache Sprache für die Hinweistexte', ['hb.hw.mb.schwanger', 'hb.hw.verm', 'hb.hw.pflege', 'hb.hw.steuer', 'hb.bl.hinweis'].every((k) => EF[k] && EF[k] !== DE[k]));
// Befund 6: Paare/unbekanntes Alter: kleinste mögliche Grenze als Auslöser, keine feste Zahl
const gp = R.evaluate({ adults: 2, kids: 0, young: 0, gebJahr: 1980, bezug: {} }).grenzen, S = R.RULES.sgb2.schon;
check('[hb-verm-paar] Grenze nicht aus dem Alter von Person 1 für beide: ggeldMin = Freibetrag Person 1 + kleinster Freibetrag', gp.ggeld === 2 * S['40-49'] && gp.ggeldMin === S['40-49'] + S['<30'], gp);
const gu = R.evaluate({ adults: 1, kids: 0, young: 0, bezug: {} }).grenzen, g1 = R.evaluate({ adults: 1, kids: 0, young: 0, gebJahr: 1980, bezug: {} }).grenzen;
check('[hb-verm-paar] Alter unbekannt: Min-Grenze; eine Person mit Alter: keine', gu.ggeldMin === S['<30'] && g1.ggeldMin === 0, [gu, g1]);
const vp = H.vermNah(15000, { ggeld: 25000, ggeldMin: 17500 }, 50000, { ggeld: 'ja' }, {});
check('[hb-verm-paar] vermNah: „etwa“, ohne Monatszahl; über dem Höchstwert kein Hinweis', vp && vp.etwa === true && vp.monate === 0 && vp.g === 25000 && H.vermNah(26000, { ggeld: 25000, ggeldMin: 17500 }, 0, { ggeld: 'ja' }, {}) === null && H.vermNah(13000, { ggeld: 25000, ggeldMin: 17500 }, 0, { ggeld: 'ja' }, {}) === null, vp);
// Befund 10: Fehltreffer der Stichwörter
const WG = H.WORTE_GELD;
check('[hb-worte] Schwangerschaftstest, Reinigungsmittel, Brillenputztuch, Ernährung allein: keine Treffer', !WG.schwanger.test('Schwangerschaftstest') && WG.schwanger.test('schwanger') && WG.schwanger.test('Schwangerschaft Vorsorge') &&
  !WG.steuer.test('Reinigungsmittel') && WG.steuer.test('Reinigung Teppich') && !WG.steuer.test('Brillenputztuch') && WG.steuer.test('neue Brille') &&
  !WG.ern.test('Ernährungsberatung') && !WG.ern.test('gesunde Ernährung') && WG.ern.test('glutenfrei') && WG.ern.test('Zöliakie') && WG.ern.test('Diät'));
check('[hb-worte] „Besuch Kindergarten“ kein Dauer-Treffer, „Besuch beim Kind“ ja', !WG.dauer.test('Besuch Kindergarten') && WG.dauer.test('Besuch beim Kind') && WG.dauer.test('Fahrt zum Kind (Umgang)'));
check('[hb-worte] Mehrbedarf: Schwangerschaftstest löst nichts aus', eins({ eintraege: [{ c: 500, k: 'sonst', n: 'Schwangerschaftstest' }], bezug: GG }) === null && eins({ eintraege: [{ c: 500, k: 'essen', n: 'Ernährung' }], bezug: GG }) === null);
// Befund 11: Bar-Warnung nur bei Handwerker/Haushaltshilfe
check('[hb-bar] Bar-Wortliste nur Handwerker/Haushaltshilfe', WG.hhw.test('Handwerker') && WG.hhw.test('Haushaltshilfe') && WG.hhw.test('Putzhilfe') && !WG.hhw.test('Apotheke Zuzahlung') && !WG.hhw.test('Brille'));
// Wortlisten
check('[hb-belege] Vorschlag: Pflegedienst/Handwerker; „bar“ erkannt, „Barzahlung“ nicht als Wort „bar“', H.WORTE_GELD.pflegeBeleg.test('Pflegedienst Mai') && H.WORTE_GELD.steuer.test('Handwerker') && H.WORTE_GELD.bar.test('Maler, bar bezahlt') && !H.WORTE_GELD.bar.test('Barzahlung'));

if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
console.log('Haushalt-Geld-Test bestanden: ' + n + ' Prüfungen (Mehrbedarf, Erspartes, Pflege, Steuer, Belege, geltendes Recht vor/ab 1.1.2027)');
