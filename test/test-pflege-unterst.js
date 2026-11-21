// Pflege-Startkachel „Welche Unterstützung gibt es?“: Regeln (Rules.pflegeFuer) und feste Beträge mit amtlicher Quelle.
// Quelle der Beträge: Bundesministerium für Gesundheit, Online-Ratgeber Pflege „Pflege zu Hause“, „Verhinderungspflege“,
// „Weitere Leistungen und Angebote zur Unterstützung im Alltag“, „Pflege-Wohngemeinschaften“ (alle Stand 14.9.2026,
// abgerufen 20.11.2026); §§ 36–45b SGB XI. Ändert sich ein Betrag (z. B. Pflegereform 2027), muss dieser Test bewusst angepasst werden.
const Rules = require('../src/rules.js');
const R = Rules.RULES;
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } };
const ids = (pg) => Rules.pflegeFuer(pg).map((l) => l.id);
const wert = (pg, id) => (Rules.pflegeFuer(pg).find((l) => l.id === id) || {}).wert;

// Feste Zahlen 2026 (BMG, Stand 14.9.2026)
const FEST = {
  geld: { 2: 347, 3: 599, 4: 800, 5: 990 }, // § 37 SGB XI, Pflegegeld pro Monat
  dienst: { 2: 796, 3: 1497, 4: 1859, 5: 2299 }, // § 36 SGB XI, Pflegesachleistung bis pro Monat
  tages: { 2: 721, 3: 1357, 4: 1685, 5: 2085 } // § 41 SGB XI, Tages-/Nachtpflege bis pro Monat
};
Object.keys(FEST).forEach((id) => [2, 3, 4, 5].forEach((pg) => check('[pu-betrag] ' + id + ' PG ' + pg, wert(pg, id) === FEST[id][pg], wert(pg, id))));
[1, 2, 3, 4, 5].forEach((pg) => {
  check('Entlastungsbetrag 131 € pro Monat (§ 45b) PG ' + pg, wert(pg, 'entl') === 131);
  check('Pflegehilfsmittel zum Verbrauch 42 € (§ 40 Abs. 2) PG ' + pg, wert(pg, 'hilfs') === 42);
  check('Wohnumfeld 4.180 € je Maßnahme (§ 40 Abs. 4) PG ' + pg, wert(pg, 'umbau') === 4180);
  check('Wohngruppenzuschlag 224 € (§ 38a) PG ' + pg, wert(pg, 'wg') === 224);
});
[2, 3, 4, 5].forEach((pg) => check('Gemeinsamer Jahresbetrag 3.539 € (§ 42a) PG ' + pg, wert(pg, 'verh') === 3539));

// Was bei welchem Pflegegrad gilt
check('[pu-pg] Ohne Pflegegrad: nur Pflegekurse und Pflegeberatung', ids(0).join() === 'kurs,beratung', ids(0));
['geld', 'dienst', 'kombi', 'verh', 'tages', 'rente'].forEach((id) => check('Pflegegrad 1 ohne ' + id + ' (§ 28a SGB XI)', ids(1).indexOf(id) < 0, ids(1)));
['entl', 'hilfs', 'umbau', 'wg', 'notruf', 'kurs', 'beratung', 'zeit'].forEach((id) => check('Pflegegrad 1 mit ' + id, ids(1).indexOf(id) >= 0, ids(1)));
[2, 3, 4, 5].forEach((pg) => check('Pflegegrad ' + pg + ': alle 14 Leistungen', ids(pg).length === 14, ids(pg)));
check('Ungültiger Pflegegrad wie „noch keiner“', ids('x').join() === ids(0).join() && ids(7).join() === ids(0).join());

// Einheiten: pro Monat und pro Jahr klar getrennt; jede Leistung mit Rechtsgrundlage
const L = Rules.pflegeLeistungen();
check('Nur der gemeinsame Jahresbetrag ist pro Jahr', L.filter((l) => l.einheit === 'jahr').map((l) => l.id).join() === 'verh');
check('Jede Leistung mit Betrag hat eine Einheit', L.every((l) => !l.betrag || ['monat', 'jahr', 'mass'].indexOf(l.einheit) >= 0));
check('Jede Leistung hat eine Rechtsgrundlage', L.every((l) => /SGB|PflegeZG/.test(l.recht)));
check('Nur Pflegegeld und Kombination kommen aufs Konto', L.filter((l) => l.art === 'konto').map((l) => l.id).join() === 'geld,kombi');
check('Beträge kommen aus den Rechenregeln (keine zweite Quelle)', wert(3, 'geld') === R.pflege.geld[3] && wert(3, 'dienst') === R.pflegeSach[3] && wert(2, 'verh') === R.entlastungsbudget && wert(1, 'wg') === R.pflegeUnterst.wohngruppe);

// Kombinationsleistung (§ 38): anteiliges Pflegegeld
check('Kombi: Hälfte der Sachleistung -> halbes Pflegegeld (PG 2: 173,50 €)', Rules.pflegeKombi(2, 398) === 173.5, Rules.pflegeKombi(2, 398));
check('Kombi: ganze Sachleistung -> kein Pflegegeld', Rules.pflegeKombi(3, 1497) === 0 && Rules.pflegeKombi(3, 5000) === 0);
check('Kombi: ohne Pflegedienst -> volles Pflegegeld', Rules.pflegeKombi(4, 0) === 800);
check('Kombi: Pflegegrad 1 -> nichts', Rules.pflegeKombi(1, 0) === 0);

// Quelle, Stand; kein Hinweis auf Entwürfe
check('Stand und Quelle gesetzt', R.pflegeUnterst.stand === '14.9.2026' && /Gesundheit/.test(R.pflegeUnterst.quelle));
check('[recht-geltend] Kein Reformentwurf in den Daten (nur geltendes Recht)', !('reform' in R.pflegeUnterst));

console.log(fails ? fails + ' FEHLER (Pflege-Unterstützung)' : '[pflege-unterst] Pflege-Übersicht: Leistungen je Pflegegrad, feste Beträge (BMG, Stand 14.9.2026), Einheiten und Kombination stimmen');
process.exit(fails ? 1 : 0);
