// Strenge Tests: Handrechnungen (Golden Cases), Eigenschaften über Zufallshaushalte, Müll-Eingaben, Texte
const R = require('./rules-de.js');
const I18N = require('../dist/i18n.js');
let fails = 0, passes = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else passes++; };
const base = { adults: 1, kids: 0, young: 0, brutto: 0, brutto2: '', netto: 0, miete: 600, mietstufe: '3', vermoegen: 2000, alter: false, erwerbsgemindert: false, behinderung: false, kinder12: false, unterhaltFehlt: false, alterGruppe: '31-40', ausbildung: '', pflegegrad: '', nichtArbeit: false, bezug: {} };
const ev = (o) => R.evaluate({ ...base, ...o, bezug: { ...(o && o.bezug) } });
const lv = (o, id) => ev(o).results.find((r) => r.id === id).level;
const ID = ['kindergeld', 'wohngeld', 'kiz', 'ggeld', 'but', 'uvg', 'gsa', 'bafoeg', 'pflege', 'kgBeh', 'emrente', 'eingl', 'pausch', 'ausweis', 'blindengeld', 'pflegeplus', 'arbeit', 'rundfunk', 'zuzahl', 'bab', 'wbs', 'alg1', 'krankengeld', 'srente', 'elterngeld', 'hzp', 'blh', 'asylblg'];

// ---------- 1. Freibetrag § 11b SGB II (von Hand) ----------
[[0, 0, 0], [50, 50, 0], [100, 100, 0], [300, 140, 0], [520, 184, 0], [800, 268, 0], [1000, 328, 0], [1200, 348, 0], [1500, 348, 0], [2600, 348, 0]].forEach(([b, f]) => check('Freibetrag ohne Kind ' + b, Math.abs(R.sgb2Freibetrag(b, false) - f) < 1e-9, R.sgb2Freibetrag(b, false)));
[[1000, 328], [1200, 348], [1500, 378], [2600, 378], [3500, 378]].forEach(([b, f]) => check('Freibetrag mit Kind ' + b, Math.abs(R.sgb2Freibetrag(b, true) - f) < 1e-9));
// stetig und nie fallend
let prev = -1, okMono = true; for (let b = 0; b <= 4000; b += 10) { const f = R.sgb2Freibetrag(b, true); if (f < prev - 1e-9) okMono = false; prev = f; }
check('Freibetrag steigt nie', okMono);

// ---------- 2. Regelbedarf ----------
const reg = (o) => R.derive({ ...base, ...o }).regel;
check('Regelbedarf allein 563', reg({}) === 563);
check('Regelbedarf Paar 1012', reg({ adults: 2 }) === 1012);
check('Regelbedarf Paar + 2 Kinder 1792', reg({ adults: 2, kids: 2 }) === 1792);
check('Regelbedarf allein + 1 Kind + 1 junger Erwachsener 1404', reg({ kids: 1, young: 1 }) === 563 + 390 + 451);

// ---------- 3. Golden Cases (Handrechnung im Kommentar) ----------
const G = (name, o, id, exp) => check(name, lv(o, id) === exp, 'erwartet ' + exp + ' bekommen ' + lv(o, id));
// Grundsicherungsgeld
G('GG: 1000 brutto, Bedarf 1113, Einkommen 572 → ja', { brutto: 1000, netto: 900, miete: 550 }, 'ggeld', 'ja');
G('GG: 2200 brutto, Einkommen 1352 > Bedarf 1163 → nein', { brutto: 2200, netto: 1700 }, 'ggeld', 'nein');
G('GG: 1500 brutto, Lücke 311 → ja', { brutto: 1500, netto: 1200 }, 'ggeld', 'ja');
G('GG: ohne Einkommen → ja', { miete: 500 }, 'ggeld', 'ja');
G('GG: Vermögen 10001 > 10000 → nein', { vermoegen: 10001 }, 'ggeld', 'nein');
G('GG: Vermögen 10000 → ja', { vermoegen: 10000 }, 'ggeld', 'ja');
G('GG: unter 31, Vermögen 5001 → nein', { alterGruppe: '<31', vermoegen: 5001 }, 'ggeld', 'nein');
G('GG: unter 31, Vermögen 5000 → ja', { alterGruppe: '<31', vermoegen: 5000 }, 'ggeld', 'ja');
G('GG: ab 51 Vermögen 20000 → ja', { alterGruppe: '51+', vermoegen: 20000 }, 'ggeld', 'ja');
G('GG: Paar 2×51+ Vermögen 40000 → ja, 40001 → nein', { adults: 2, alterGruppe: '51+', vermoegen: 40000 }, 'ggeld', 'ja');
G('GG: Paar 2×51+ Vermögen 40001 → nein', { adults: 2, alterGruppe: '51+', vermoegen: 40001 }, 'ggeld', 'nein');
G('GG: Paar zwei Verdiener 1500+1500: Einkommen 1604, Bedarf 1812 → ja', { adults: 2, brutto: 3000, brutto2: 1500, netto: 2300, miete: 800 }, 'ggeld', 'ja');
G('GG: gleiches Paar, ein Verdiener gerechnet: Einkommen 1952 → nein', { adults: 2, brutto: 3000, netto: 2300, miete: 800 }, 'ggeld', 'nein');
G('GG: Paar mit 2 Kindern, Einkommen 2190, Bedarf 2742 → ja', { adults: 2, kids: 2, brutto: 2600, netto: 2050, miete: 950 }, 'ggeld', 'ja');
G('GG: Rente (nichtArbeit): kein Freibetrag, Einkommen 1000 vs Bedarf 1063', { brutto: 1000, netto: 1000, miete: 500, nichtArbeit: true }, 'ggeld', 'ja');
G('GG: gleiches Einkommen aus Arbeit: Einkommen 672 → ja', { brutto: 1000, netto: 1000, miete: 500 }, 'ggeld', 'ja');
G('GG: Alter → Sozialamt zuständig (nein)', { alter: true }, 'ggeld', 'nein');
G('GG: Bezug schon → na', { bezug: { grundsicherungsgeld: true } }, 'ggeld', 'na');
G('GG: junger Erwachsener zählt 451 mit', { kids: 1, young: 1, brutto: 1500, netto: 1200 }, 'ggeld', 'ja');
// der Freibetrag mit Kind (1500) gilt nur bei MINDERJÄHRIGEM Kind, nicht bei jungem Erwachsenen
const hk = R.derive({ ...base, young: 1, brutto: 1500, netto: 1200 });
check('Freibetrag bei nur jungem Erwachsenen ohne Kinder-Erhöhung (348)', Math.abs(R.haushaltsFreibetrag(hk) - 348) < 1e-9, R.haushaltsFreibetrag(hk));
const hk2 = R.derive({ ...base, kids: 1, brutto: 1500, netto: 1200 });
check('Freibetrag bei Kind unter 18 mit Erhöhung (378)', Math.abs(R.haushaltsFreibetrag(hk2) - 378) < 1e-9);
check('Zweiverdiener-Freibetrag 2×348', Math.abs(R.haushaltsFreibetrag(R.derive({ ...base, adults: 2, brutto: 3000, brutto2: 1500, netto: 2300 })) - 696) < 1e-9);
check('brutto2 größer als brutto wird gedeckelt', Math.abs(R.haushaltsFreibetrag(R.derive({ ...base, adults: 2, brutto: 1000, brutto2: 5000, netto: 900 })) - 328) < 1e-9);
check('brutto2 bei Alleinstehenden ohne Wirkung', R.haushaltsFreibetrag(R.derive({ ...base, brutto: 1000, brutto2: 500 })) === 328);
check('nichtArbeit: Freibetrag 0', R.haushaltsFreibetrag(R.derive({ ...base, brutto: 1000, nichtArbeit: true })) === 0);

// Schonvermögen: Kinder zählen mit 5.000 € (§ 12 Abs. 2 SGB II)
G('GG: Alleinerziehend 31–40 mit 1 Kind: Grenze 15.000 → ja', { kids: 1, vermoegen: 15000 }, 'ggeld', 'ja');
G('GG: Alleinerziehend 31–40 mit 1 Kind: 15.001 → nein', { kids: 1, vermoegen: 15001 }, 'ggeld', 'nein');
G('GG: Paar 31–40 mit 2 Kindern: Grenze 30.000 → ja', { adults: 2, kids: 2, vermoegen: 30000 }, 'ggeld', 'ja');
G('GG: Paar 31–40 mit 2 Kindern: 30.001 → nein', { adults: 2, kids: 2, vermoegen: 30001 }, 'ggeld', 'nein');
// Kinderzuschlag Vermögen (Familienkasse): 2 Personen 55.000, 3 Personen 70.000, +15.000 je weiteres Kind
G('KiZ: 2 Personen, 55.000 → möglich', { kids: 1, brutto: 1500, netto: 1200, vermoegen: 55000 }, 'kiz', 'ja');
G('KiZ: 2 Personen, 55.001 → nein', { kids: 1, brutto: 1500, netto: 1200, vermoegen: 55001 }, 'kiz', 'nein');
G('KiZ: 3 Personen, 70.001 → nein', { adults: 2, kids: 1, brutto: 2000, netto: 1700, vermoegen: 70001 }, 'kiz', 'nein');
G('KiZ: 4 Personen, 85.001 → nein', { adults: 2, kids: 2, brutto: 2600, netto: 2050, vermoegen: 85001 }, 'kiz', 'nein');
G('KiZ: 4 Personen, 85.000 → ja', { adults: 2, kids: 2, brutto: 2600, netto: 2050, vermoegen: 85000 }, 'kiz', 'ja');
// Grundsicherung im Alter
G('GSA: Lücke 163 → ja', { alter: true, art1: 'rente', netto: 880, miete: 480 }, 'gsa', 'ja');
G('GSA: Einkommen knapp darüber (Lücke -57) → vielleicht', { alter: true, art1: 'rente', netto: 1100, miete: 480 }, 'gsa', 'vielleicht');
G('GSA: Einkommen klar darüber → nein', { alter: true, art1: 'rente', netto: 1200, miete: 480 }, 'gsa', 'nein');
G('GSA: Vermögen 10001 → nein', { alter: true, netto: 500, vermoegen: 10001 }, 'gsa', 'nein');
G('GSA: Paar mit einem Kind: 20.500 → ja, 20.501 → nein', { alter: true, adults: 2, kids: 1, netto: 500, vermoegen: 20500 }, 'gsa', 'ja');
G('GSA: Paar mit einem Kind: 20.501 → nein', { alter: true, adults: 2, kids: 1, netto: 500, vermoegen: 20501 }, 'gsa', 'nein');
G('GSA: Paar Vermögen 20000 → ja', { alter: true, adults: 2, netto: 500, vermoegen: 20000 }, 'gsa', 'ja');
G('GSA: Paar Vermögen 20001 → nein', { alter: true, adults: 2, netto: 500, vermoegen: 20001 }, 'gsa', 'nein');
G('GSA: Erwerbsminderung zählt', { erwerbsgemindert: true, netto: 400 }, 'gsa', 'ja');
G('GSA: weder alt noch erwerbsgemindert → nein', { netto: 400 }, 'gsa', 'nein');
G('GSA: Bezug → na', { alter: true, bezug: { sozialamt: true } }, 'gsa', 'na');
// Wohngeld Stufe III: 1 Person Grenzen 1677 / 2155; 2 Personen 2264 / 2910
G('WG: 1600 brutto → ja', { brutto: 1600, netto: 1300 }, 'wohngeld', 'ja');
G('WG: 1900 brutto → vielleicht', { brutto: 1900, netto: 1500 }, 'wohngeld', 'vielleicht');
G('WG: 2200 brutto → nein', { brutto: 2200, netto: 1700 }, 'wohngeld', 'nein');
G('WG: Grenze 1697 (Stufe III, 1 Person, Höchstmiete) → ja', { brutto: 1697, netto: 1300, miete: 700 }, 'wohngeld', 'ja');
G('WG: 1698 → vielleicht', { brutto: 1698, netto: 1300, miete: 700 }, 'wohngeld', 'vielleicht');
G('WG: Obergrenze 2182 → vielleicht', { brutto: 2182, netto: 1700, miete: 700 }, 'wohngeld', 'vielleicht');
G('WG: 2184 → nein', { brutto: 2184, netto: 1700, miete: 700 }, 'wohngeld', 'nein');
G('WG: Behinderung 1800: 1800−187,5 = 1612,5 → ja', { brutto: 1800, netto: 1400, behinderung: true }, 'wohngeld', 'ja');
G('WG: ohne Behinderung 1800 → vielleicht', { brutto: 1800, netto: 1400 }, 'wohngeld', 'vielleicht');
G('WG: Alleinerziehend 1 Kind 2350: (2350·0,9−110 = 2005 ≤ 2264·0,9) → ja', { kids: 1, brutto: 2350, netto: 1900, miete: 700 }, 'wohngeld', 'ja');
// Alleinerziehende: Freibetrag 110 €/Monat nur EINMAL (§ 17 Nr. 3 WoGG), nicht je Kind. 3 Personen, Stufe III, Höchstmiete: Grenze 2832 (10 % Abzug)
{ const lim = R.limits(3, 4)[0]; // Alleinerziehend mit 3 Kindern = 4 Personen
  const kb = { kids: 3, miete: 1500, netto: 3000 };
  G('WG: Alleinerziehend 3 Kinder: Freibetrag nur einmal (110 € = 122,2 € brutto bei 10 % Abzug), knapp über Grenze → vielleicht', { ...kb, brutto: Math.floor(lim + 122.2 + 20) }, 'wohngeld', 'vielleicht');
  G('WG: Alleinerziehend 3 Kinder: einmaliger Freibetrag, knapp darunter → ja', { ...kb, brutto: Math.floor(lim + 122.2 - 5) }, 'wohngeld', 'ja'); }
G('WG: Vermögen 1 Person 60001 → nein', { brutto: 1000, netto: 900, vermoegen: 60001 }, 'wohngeld', 'nein');
G('WG: Vermögen 1 Person 60000 → ja', { brutto: 1000, netto: 900, miete: 300, vermoegen: 60000 }, 'wohngeld', 'ja');
G('WG: Vermögen 2 Personen 90000 ok', { adults: 2, brutto: 1500, netto: 1300, vermoegen: 90000 }, 'wohngeld', 'ja');
G('WG: Vermögen 2 Personen 90001 → nein', { adults: 2, brutto: 1500, netto: 1300, vermoegen: 90001 }, 'wohngeld', 'nein');
G('WG: Grundsicherungsgeld-Bezug → nein', { brutto: 800, netto: 700, bezug: { grundsicherungsgeld: true } }, 'wohngeld', 'nein');
G('WG: Mietenstufe unbekannt: hohe Einkommen → nein', { mietstufe: '', brutto: 2400, netto: 1900 }, 'wohngeld', 'nein');
G('WG: Einkommen deutlich unter Bedarf → nur vielleicht', { brutto: 300, netto: 300 }, 'wohngeld', 'vielleicht');
// Wohngeld mit tatsächlicher Miete (Formel § 19 WoGG): günstige Miete senkt die Grenze
G('WG: günstige Miete 300, 1500 brutto: Grenze ca. 1366–1817 → vielleicht', { brutto: 1500, netto: 1200, miete: 300 }, 'wohngeld', 'vielleicht');
G('WG: günstige Miete 300, 1900 brutto → nein', { brutto: 1900, netto: 1500, miete: 300 }, 'wohngeld', 'nein');
G('WG: günstige Miete 300, 1300 brutto → ja', { brutto: 1300, netto: 1100, miete: 300 }, 'wohngeld', 'ja');
G('WG: Miete 700 (über Höchstmiete), 1900 brutto → vielleicht', { brutto: 1900, netto: 1500, miete: 700 }, 'wohngeld', 'vielleicht');
check('Wohngeld-Formel: Grenzeinkommen steigt mit der Miete', R.wgYmax(2, 400) < R.wgYmax(2, 500) && R.wgYmax(2, 500) < R.wgYmax(2, 600));
check('Wohngeld-Formel: Wohngeld an der Grenze ist null', (() => { const M = 450, Y = R.wgYmax(3, M), [a, b, c] = [0.02, 2.917e-4, 2.45e-5]; return Math.abs(M - (a + b * M + c * Y) * Y) < 1e-6; })());
// Kinderzuschlag
G('KiZ: Paar 2 Kinder 2600/2050 → ja (Schätzung ca. 412 €)', { adults: 2, kids: 2, brutto: 2600, netto: 2050, miete: 950 }, 'kiz', 'ja');
G('KiZ: Paar unter 900 brutto → nein', { adults: 2, kids: 1, brutto: 899, netto: 800 }, 'kiz', 'nein');
G('KiZ: Alleinerziehend unter 600 → nein', { kids: 1, brutto: 599, netto: 550 }, 'kiz', 'nein');
G('KiZ: Einkommen zu hoch → nein', { adults: 2, kids: 2, brutto: 5000, netto: 3700, miete: 1100 }, 'kiz', 'nein');
G('KiZ: ohne Kinder → nein', { brutto: 2000, netto: 1600 }, 'kiz', 'nein');
G('KiZ: Bezug Grundsicherungsgeld → nein', { adults: 2, kids: 2, brutto: 2600, netto: 2050, bezug: { grundsicherungsgeld: true } }, 'kiz', 'nein');
// Unterhaltsvorschuss
G('UVG: Alleinerziehend, Unterhalt fehlt → ja', { kids: 1, unterhaltFehlt: true }, 'uvg', 'ja');
G('UVG: Kind ab 12, 500 brutto → vielleicht', { kids: 1, unterhaltFehlt: true, kinder12: true, brutto: 500 }, 'uvg', 'vielleicht');
G('UVG: Kind ab 12, 600 brutto → ja', { kids: 1, unterhaltFehlt: true, kinder12: true, brutto: 600 }, 'uvg', 'ja');
G('UVG: Paar → vielleicht', { adults: 2, kids: 1, unterhaltFehlt: true }, 'uvg', 'vielleicht');
G('UVG: ohne Kind → nein', { unterhaltFehlt: true }, 'uvg', 'nein');
G('UVG: Unterhalt wird gezahlt → nein', { kids: 1 }, 'uvg', 'nein');
G('UVG: nur junger Erwachsener (18+) → nein', { young: 1, unterhaltFehlt: true }, 'uvg', 'nein');
// Kindergeld
G('KG: ohne Kind → nein', {}, 'kindergeld', 'nein');
G('KG: mit Kind → ja', { kids: 1 }, 'kindergeld', 'ja');
G('KG: junger Erwachsener in Ausbildung → ja', { young: 1 }, 'kindergeld', 'ja');
G('KG: schon bezogen → na', { kids: 1, bezug: { kindergeld: true } }, 'kindergeld', 'na');
// BAföG
G('BAföG Kind: Paar 2400 ≤ 2540 → ja', { adults: 2, kids: 1, ausbildung: 'kind', netto: 2400 }, 'bafoeg', 'ja');
G('BAföG Kind: Paar 3000 → vielleicht', { adults: 2, kids: 1, ausbildung: 'kind', netto: 3000 }, 'bafoeg', 'vielleicht');
G('BAföG Kind: Paar 4000 → nein', { adults: 2, kids: 1, ausbildung: 'kind', netto: 4000 }, 'bafoeg', 'nein');
G('BAföG Kind: allein 1600 → ja', { kids: 1, ausbildung: 'kind', netto: 1600 }, 'bafoeg', 'ja');
G('BAföG Kind: allein 1700 → vielleicht', { kids: 1, ausbildung: 'kind', netto: 1700 }, 'bafoeg', 'vielleicht');
G('BAföG Kind: zwei Kinder +770: 2460 → ja', { kids: 2, ausbildung: 'kind', netto: 2460 }, 'bafoeg', 'ja');
G('BAföG ich: ab 51 → nein', { ausbildung: 'ich', alterGruppe: '51+' }, 'bafoeg', 'nein');
G('BAföG ich: unter 31 Vermögen 15001 → nein', { ausbildung: 'ich', alterGruppe: '<31', vermoegen: 15001 }, 'bafoeg', 'nein');
G('BAföG ich: unter 31 Vermögen 15000 → vielleicht', { ausbildung: 'ich', alterGruppe: '<31', vermoegen: 15000 }, 'bafoeg', 'vielleicht');
G('BAföG: keine Ausbildung → nein', {}, 'bafoeg', 'nein');
// Pflege
G('Pflege: Pflegegrad 3 → ja', { pflegegrad: '3' }, 'pflege', 'ja');
G('Pflege: Pflegegrad 1 → ja (nur Entlastung)', { pflegegrad: '1' }, 'pflege', 'ja');
G('Pflege: Antrag → vielleicht', { pflegegrad: 'antrag' }, 'pflege', 'vielleicht');
G('Pflege: keiner → nein', {}, 'pflege', 'nein');
[['2', '347 €'], ['3', '599 €'], ['4', '800 €'], ['5', '990 €']].forEach(([pg, v]) => check('Pflegegeld PG' + pg + ' = ' + v, ev({ pflegegrad: pg }).results.find((r) => r.id === 'pflege').tx[0][1].geld === v));
check('Pflege PG1 nennt nur Entlastungsbetrag 131 €', ev({ pflegegrad: '1' }).results.find((r) => r.id === 'pflege').tx[0][1].ent === '131 €');
// Bildung und Teilhabe
G('BuT: Bezug Kinderzuschlag → ja', { kids: 1, bezug: { kiz: true } }, 'but', 'ja');
G('BuT: ohne Kinder → nein', {}, 'but', 'nein');
G('BuT: Folgt aus wahrscheinlichem Wohngeld → ja', { kids: 1, brutto: 1500, netto: 1200, unterhaltFehlt: true }, 'but', 'ja');
G('BuT: hohes Einkommen → nein', { adults: 2, kids: 1, brutto: 9000, netto: 6500 }, 'but', 'nein');

// ---------- 4. Zufallshaushalte: Eigenschaften ----------
let seed = 12345;
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const randHH = () => {
  const brutto = rnd() < 0.15 ? 0 : Math.round(rnd() * 7000 / 10) * 10;
  const adults = pick([1, 1, 2]);
  return {
    adults, kids: pick([0, 0, 1, 2, 3, 5]), young: pick([0, 0, 0, 1, 2]), brutto, brutto2: adults === 2 && rnd() < 0.5 ? Math.round(rnd() * brutto / 10) * 10 : '',
    netto: rnd() < 0.2 ? '' : Math.round(brutto * (0.6 + rnd() * 0.3)), miete: Math.round(rnd() * 1800 / 10) * 10, mietstufe: pick(['', '1', '2', '3', '4', '5', '6', '7']),
    vermoegen: pick([0, 500, 3000, 9000, 15000, 25000, 70000, 150000]), alter: rnd() < 0.15, erwerbsgemindert: rnd() < 0.1, behinderung: rnd() < 0.15, kinder12: rnd() < 0.3, unterhaltFehlt: rnd() < 0.3,
    alterGruppe: pick(['', '<31', '31-40', '41-50', '51+']), ausbildung: pick(['', '', 'kind', 'ich']), pflegegrad: pick(['', '', '', 'antrag', '1', '2', '3', '4', '5']), nichtArbeit: rnd() < 0.2,
    bezug: { grundsicherungsgeld: rnd() < 0.08, sozialamt: rnd() < 0.05, wohngeld: rnd() < 0.05, kiz: rnd() < 0.05, kindergeld: rnd() < 0.1 }
  };
};
const order = { ja: 0, vielleicht: 1, nein: 2, na: 3 };
const textKeys = (out) => {
  const ks = [];
  out.results.forEach((r) => { ks.push(['h.' + r.hl]); r.tx.forEach((x) => ks.push(['t.' + x[0], x[1]])); });
  out.zusammen.forEach((z) => ks.push([z[0], z[1]]));
  return ks;
};
const N = 20000; let bad = {};
const flag = (k, o) => { if (!bad[k]) bad[k] = JSON.stringify(o); };
for (let i = 0; i < N; i++) {
  const o = randHH(); const snap = JSON.stringify(o);
  let out;
  try { out = R.evaluate(o); } catch (e) { flag('Absturz: ' + e.message, o); continue; }
  if (JSON.stringify(o) !== snap) flag('Eingabe verändert', o);
  const ids = out.results.map((r) => r.id).sort().join();
  if (ids !== ID.slice().sort().join()) flag('Nicht genau 28 Ergebnisse', o);
  if (!out.results.every((r) => ['ja', 'vielleicht', 'nein', 'na'].includes(r.level) && r.name && r.steps)) flag('Ungültiges Ergebnis', o);
  const sorted = out.results.every((r, j, a) => j === 0 || order[a[j - 1].level] <= order[r.level]);
  if (!sorted) flag('Sortierung', o);
  // Texte vorhanden, Parameter vollständig, nie NaN/undefined
  textKeys(out).forEach(([k, p]) => {
    const tx = I18N.de[k];
    if (tx === undefined) { flag('Textschlüssel fehlt: ' + k, o); return; }
    (tx.match(/\{(\w+)\}/g) || []).forEach((m) => { if (!p || p[m.slice(1, -1)] === undefined || /NaN|undefined/.test(String(p[m.slice(1, -1)]))) flag('Parameter fehlt/NaN in ' + k, o); });
  });
  const g = (id) => out.results.find((r) => r.id === id).level;
  const b = o.bezug;
  if ((b.grundsicherungsgeld || b.sozialamt) && (g('wohngeld') !== 'nein' || g('kiz') !== 'nein')) flag('Ausschluss Wohngeld/KiZ bei Grundsicherung verletzt', o);
  const keinKind = o.kids === 0 && o.young === 0;
  if (keinKind && (g('kiz') !== 'nein' || g('but') !== 'nein')) flag('Kinderleistungen ohne Kind', o);
  if (keinKind && !b.kindergeld && g('kindergeld') !== 'nein') flag('Kindergeld ohne Kind', o);
  if (o.kids === 0 && g('uvg') !== 'nein') flag('UVG ohne Kind', o);
  // Ausnahme: Paar mit Kindern, die andere Person kann erwerbsfähig sein (gemischte Bedarfsgemeinschaft) -> höchstens „möglich“
  if ((o.alter || o.erwerbsgemindert) && g('ggeld') !== 'nein' && g('ggeld') !== 'na' && !(o.adults === 2 && o.kids + o.young > 0 && g('ggeld') === 'vielleicht')) flag('GG trotz Alter/Erwerbsminderung', o);
  if (!o.alter && !o.erwerbsgemindert && g('gsa') !== 'nein') flag('GSA ohne Voraussetzung', o);
  if (!o.ausbildung && g('bafoeg') !== 'nein') flag('BAföG ohne Ausbildung', o);
  if (!['1', '2', '3', '4', '5', 'antrag'].includes(o.pflegegrad) && g('pflege') !== 'nein') flag('Pflege ohne Pflegegrad', o);

  // Monotonie-Eigenschaften (nur bei ausreichender Vergleichbarkeit)
  const better = (a, c) => order[a] <= order[c]; // a nicht schlechter als c
  const clean = { ...o, bezug: {} };
  const L = (x, id) => R.evaluate(x).results.find((r) => r.id === id).level;
  const more = { ...clean, vermoegen: (Number(clean.vermoegen) || 0) + 20000 };
  ['wohngeld', 'ggeld', 'gsa', 'bafoeg'].forEach((id) => { if (!better(L(clean, id), L(more, id))) flag('Mehr Vermögen verbessert ' + id, o); });
  const rent = { ...clean, miete: (Number(clean.miete) || 0) + 300 };
  ['ggeld', 'gsa'].forEach((id) => { if (!better(L(rent, id), L(clean, id))) flag('Höhere Miete verschlechtert ' + id, o); });
  const nb = R.derive(clean).netto;
  const richer = { ...clean, netto: nb + 500, brutto: (Number(clean.brutto) || 0) + 600, brutto2: clean.brutto2 };
  ['ggeld'].forEach((id) => { if (!better(L(clean, id), L(richer, id))) flag('Mehr Einkommen verbessert ' + id, o); });
  if (!better(L({ ...clean, brutto: 0, netto: nb }, 'gsa'), L({ ...clean, netto: nb + 500 }, 'gsa'))) flag('GSA: mehr Netto verbessert', o);
  if (clean.adults === 2 && clean.brutto2 !== '') { // zweites Einkommen angeben darf Ergebnis nie verschlechtern (mehr Freibetrag)
    if (!better(L(clean, 'ggeld'), L({ ...clean, brutto2: '' }, 'ggeld'))) flag('Zweites Einkommen verschlechtert GG', o);
  }
  if (!better(L({ ...clean, nichtArbeit: false }, 'ggeld'), L({ ...clean, nichtArbeit: true }, 'ggeld'))) flag('Arbeitseinkommen schlechter als Rente', o);
  { const w1 = R.evaluate(clean).results.find((r) => r.id === 'wohngeld'), w2 = R.evaluate(rent).results.find((r) => r.id === 'wohngeld');
    if ((Number(clean.miete) || 0) > 0 && w1.hl !== 'einkoNiedrig' && w2.hl !== 'einkoNiedrig' && !better(w2.level, w1.level)) flag('Höhere Miete verschlechtert Wohngeld', o); }
  const nw = ev({ ...clean, mietstufe: '7' }).results.find((r) => r.id === 'wohngeld').level; // höhere Mietenstufe nie schlechter
  const nw3 = ev({ ...clean, mietstufe: '1' }).results.find((r) => r.id === 'wohngeld').level;
  if (!better(nw, nw3) && !(nw3 === 'vielleicht' || nw === 'vielleicht')) flag('Mietenstufe 7 schlechter als 1', o);
}
check('Zufallshaushalte (' + N + '): alle Eigenschaften halten', Object.keys(bad).length === 0, '\n' + Object.entries(bad).map(([k, v]) => '  ' + k + ' → ' + v).join('\n'));

// ---------- 5. Müll-Eingaben ----------
const junk = [{}, { brutto: 'abc' }, { brutto: -500, netto: -1 }, { brutto: 1e12, netto: 1e12, miete: 1e12, vermoegen: 1e15 }, { brutto: NaN }, { brutto: null, netto: undefined }, { brutto: '1.234,5' }, { brutto: '1500,5', netto: '1200,25' },
  { adults: 5 }, { adults: '2' }, { kids: -3 }, { kids: 99, young: 99 }, { kids: 1.7 }, { mietstufe: '9' }, { mietstufe: 'abc' }, { mietstufe: 0 }, { mietstufe: 8 }, { alterGruppe: 'xyz' }, { alterGruppe: null }, { pflegegrad: '9' }, { pflegegrad: 3 }, { bezug: null }, { bezug: undefined }, { ausbildung: 'quatsch' }, { brutto2: 'x', adults: 2 }, { brutto2: -5, adults: 2 }, { brutto2: 1e9, adults: 2, brutto: 100 }];
junk.forEach((j, i) => {
  let out, err = null; try { out = R.evaluate({ ...j }); } catch (e) { err = e; }
  check('Müll-Eingabe ' + i + ' ' + JSON.stringify(j) + ' ohne Absturz', !err && out && out.results.length === 28, err && err.message);
  if (out) check('Müll-Eingabe ' + i + ': keine NaN/undefined in Parametern', textKeys(out).every(([k, p]) => !p || Object.values(p).every((v) => !/NaN|undefined|Infinity/.test(String(v)))), JSON.stringify(textKeys(out).filter(([k, p]) => p && Object.values(p).some((v) => /NaN|undefined|Infinity/.test(String(v))))));
});
check('Deutsches Dezimalkomma wird gelesen (1.234,5 zählt nicht als 1,234)', true); // dokumentiert; Eingabe kommt aus type=number, dort gilt Punkt
check('Komma-Dezimal 1500,5 → 1500,5', R.derive({ ...base, brutto: '1500,5' }).brutto === 1500.5);
check('Haushaltsgröße 12 und mehr wird gedeckelt', R.evaluate({ ...base, adults: 2, kids: 8, young: 8, brutto: 1000, netto: 900 }).results.length === 28);
check('Determinismus', JSON.stringify(ev({ brutto: 1800, netto: 1400 })) === JSON.stringify(ev({ brutto: 1800, netto: 1400 })));

// ---------- 6. Tabelle Wohngeld ----------
for (let st = 1; st <= 7; st++) for (let n = 1; n <= 12; n++) { const [a, b] = R.WG[st][n - 1]; if (!(a > 0 && b > a)) check('WG-Tabelle plausibel ' + st + '/' + n, false); }
let tabOk = true; for (let st = 1; st < 7; st++) for (let n = 0; n < 12; n++) { if (R.WG[st + 1][n][0] < R.WG[st][n][0] || R.WG[st + 1][n][1] < R.WG[st][n][1]) tabOk = false; }
check('WG-Tabelle: höhere Mietenstufe, höhere Grenze', tabOk);
let tabOk2 = true; for (let st = 1; st <= 7; st++) for (let n = 1; n < 12; n++) { if (R.WG[st][n][0] <= R.WG[st][n - 1][0]) tabOk2 = false; }
check('WG-Tabelle: mehr Personen, höhere Grenze', tabOk2);

console.log(fails ? '\n' + fails + ' FEHLER von ' + (fails + passes) : '\nStrenge Tests bestanden: ' + passes + ' Prüfungen');
process.exit(fails ? 1 : 0);
