// Grenzwerte auf den Euro genau: An jeder Grenze wird mit Grenze − 1 €, genau auf der Grenze und Grenze + 1 € geprüft,
// ob die App auf der richtigen Seite entscheidet. Die Seite steht im Gesetz („bis“, „mindestens“, „nicht übersteigt“):
//  - Schonvermögen (§ 12 Abs. 2 SGB II, § 90 SGB XII mit Barbetrag-VO, Kinderzuschlag, Wohngeld-VwV): genau auf der Grenze geschützt
//  - Mindesteinkommen Kinderzuschlag (§ 6a Abs. 1 Nr. 2 BKGG) und Unterhaltsvorschuss ab 12 (§ 1 Abs. 1a UVG): „mindestens“
//  - Minijob (§ 8 Abs. 1 Nr. 1 SGB IV): „nicht übersteigt“ – genau auf der Grenze ist es ein Minijob (2026: 603 €, 2027: 633 €)
//  - Einkommensgrenze § 85 SGB XII (Hilfe zur Pflege, Blindenhilfe): genau auf der Grenze „unter“
//  - Freibetrag für Arbeit (§ 11b Abs. 2 und 3 SGB II): Stufen bei 100, 520, 1.000, 1.200 / 1.500 €
// Die Beträge selbst kommen aus den Regeln (R.RULES); geprüft wird die Entscheidung an der Grenze.
const Rules = require('./rules-de.js');
const R = Rules.RULES;
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const base = { adults: 1, kids: 0, young: 0, brutto: 0, netto: '', miete: 500, vermoegen: 0, bezug: {} };
const res = (o, id) => Rules.evaluate({ ...base, ...o }).results.find((x) => x.id === id);
const keys = (o, id) => res(o, id).tx.map((t) => t[0]);
const E = (v) => v.toLocaleString('de-DE') + ' €';
// v-1, v, v+1 -> erwartet [unter, auf, über] (true = Bedingung trifft zu)
const drei = (name, v, f, soll) => {
  const ist = [v - 1, v, v + 1].map(f);
  ck('[grenzen] ' + name + ' (' + E(v - 1) + ' / ' + E(v) + ' / ' + E(v + 1) + ')', ist.join() === soll.join(), 'ist ' + ist.join() + ', soll ' + soll.join());
};
const NUR_UEBER = [false, false, true], NUR_UNTER = [true, false, false], BIS = [true, true, false];

// Schonvermögen Grundsicherungsgeld: je Altersgruppe, allein und als Paar mit 2 Kindern
Object.keys(R.sgb2.schon).filter((g) => g).forEach((g) => {
  [[1, 0], [2, 2]].forEach(([a, k]) => {
    const v = R.sgb2.schon[g] * a + R.sgb2.schon['<30'] * k;
    drei('Grundsicherungsgeld Schonvermögen ' + g + ', ' + a + ' Erw., ' + k + ' Kinder', v, (x) => res({ adults: a, kids: k, alterGruppe: g, vermoegen: x }, 'ggeld').hl === 'vermHoch', NUR_UEBER);
  });
});
// Grundsicherung im Alter: 10.000 € je Erwachsenem, 500 € je Kind
[[1, 0], [2, 1]].forEach(([a, k]) => {
  const v = R.grundsicherung.schonAllein * a + 500 * k;
  drei('Grundsicherung im Alter Schonvermögen, ' + a + ' Erw., ' + k + ' Kind', v, (x) => res({ adults: a, kids: k, alter: true, nichtArbeit: true, brutto: 600, netto: 600, vermoegen: x }, 'gsa').hl === 'vermHoch', NUR_UEBER);
});
// Wohngeld: 60.000 € erste Person, 30.000 € jede weitere (Regelvermutung)
[1, 2, 4].forEach((p) => {
  const v = R.wohngeld.vermoegenErste + R.wohngeld.vermoegenJeWeitere * (p - 1);
  drei('Wohngeld Vermögen, ' + p + ' Personen', v, (x) => res({ adults: p > 1 ? 2 : 1, kids: Math.max(0, p - 2), brutto: 1500, netto: 1200, mietstufe: 3, vermoegen: x }, 'wohngeld').hl === 'vermHoch', NUR_UEBER);
});
// Kinderzuschlag: Vermögen und Mindesteinkommen
[[1, 1], [2, 1], [2, 3]].forEach(([a, k]) => {
  const p = a + k, v = p <= 2 ? R.kiz.vermZwei : R.kiz.vermDrei + R.kiz.vermJeWeiteres * (p - 3);
  drei('Kinderzuschlag Vermögen, ' + p + ' Personen', v, (x) => res({ adults: a, kids: k, brutto: 2400, netto: 1800, vermoegen: x }, 'kiz').hl === 'vermHoch', NUR_UEBER);
});
drei('Kinderzuschlag Mindesteinkommen Alleinerziehende', R.kiz.minAlleinerziehend, (x) => res({ kids: 1, art1: 'lohn', brutto: x, netto: Math.round(x * 0.8) }, 'kiz').hl === 'minEink', NUR_UNTER);
drei('Kinderzuschlag Mindesteinkommen Paar', R.kiz.minPaar, (x) => res({ adults: 2, kids: 1, art1: 'lohn', art2: 'ohne', brutto: x, netto: Math.round(x * 0.8) }, 'kiz').hl === 'minEink', NUR_UNTER);
// Unterhaltsvorschuss ab 12: mindestens 600 € eigenes Einkommen des Elternteils
drei('Unterhaltsvorschuss ab 12, Einkommen des Elternteils', R.uvg.min12, (x) => keys({ kids: 1, kids14: 1, kinder12: true, unterhaltFehlt: true, art1: 'lohn', brutto: x, netto: Math.round(x * 0.8) }, 'uvg').includes('uvg.ab12'), NUR_UNTER);
// Minijob: Arbeitslosengeld und Krankengeld nur aus versicherter Arbeit (über der Minijob-Grenze), 2026 und 2027
[[2026.5, R.minijob], [2027.1, R.minijob2027]].forEach(([heute, mj]) => {
  drei('Arbeitslosengeld: Lohn ' + Math.floor(heute) + ' bis zur Minijob-Grenze zählt nicht', mj, (x) => keys({ heute, arbeitSit: 'arbeitslos', algZeit: true, lohnVorher: x, gebJahr: 1980 }, 'alg1').includes('alg1.minijob'), BIS);
  drei('Krankengeld: kein Anspruch aus Minijob ' + Math.floor(heute), mj, (x) => keys({ heute, arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: x }, 'krankengeld').includes('krank.minijob'), BIS);
});
// Einkommensgrenze § 85 SGB XII: Hilfe zur Pflege und Blindenhilfe (genau auf der Grenze: „unter“)
const g85 = (o) => R.hzp.grund * R.regelbedarf.alleinstehend + o.miete + R.hzp.familie * R.regelbedarf.alleinstehend * ((o.adults || 1) - 1);
[{ miete: 500 }, { miete: 700, adults: 2 }].forEach((o) => {
  const v = Math.round(g85(o));
  drei('Hilfe zur Pflege, Einkommensgrenze § 85 SGB XII (' + (o.adults || 1) + ' Erw.)', v, (x) => keys({ ...o, pflegegrad: 3, art1: 'rente', brutto: x, netto: x }, 'hzp').includes('hzp.unter'), BIS);
});
// Freibetrag für Arbeit: Werte an den Stufengrenzen (100 € + 20 % bis 520 € + 30 % bis 1.000 € + 10 % bis 1.200 / 1.500 €)
const F = Rules.sgb2Freibetrag;
const soll = [[100, false, 100], [520, false, 184], [1000, false, 328], [1200, false, 348], [1201, false, 348], [5000, false, 348], [1500, true, 378], [1501, true, 378], [99, false, 99], [101, false, 100.2]];
soll.forEach(([b, k, f]) => ck('[grenzen] Freibetrag für Arbeit bei ' + E(b) + (k ? ' mit Kind' : '') + ': ' + E(f), Math.abs(F(b, k) - f) < 1e-9, F(b, k)));
// Stetig: kein Sprung an den Stufengrenzen (Freibetrag wächst je Euro höchstens um 1 €, nie rückwärts)
let stetig = true;
for (let b = 0; b <= 2000; b++) { const d = F(b + 1, true) - F(b, true); if (d < 0 || d > 1 + 1e-9) { stetig = false; break; } }
ck('[grenzen] Freibetrag für Arbeit ohne Sprünge von 0 bis 2.000 €', stetig);

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nGrenzwert-Test bestanden: ' + n + ' Grenzen auf den Euro genau');
process.exit(fails ? 1 : 0);
