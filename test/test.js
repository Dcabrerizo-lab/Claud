const fs = require('fs');
const Rules = require('./rules-de.js');
const I18N = require('../dist/i18n.js');
const KARTEN = require('./karten.js');
let fails = 0;
function check(name, cond, extra) {
  if (!cond) { fails++; console.log('FAIL', name, extra || ''); } else { console.log('ok  ', name); }
}

// 1) Wohngeld-Grenzen: unabhängige Neuberechnung aus den amtlichen Parametern (Bisektion auf der Formel § 19 WoGG),
//    Quellen: Anlage 1 und 2 WoGG, § 12 Abs. 6 und 7 WoGG, BT-Drs. 21/8284 (Anlage 1 mit Klimakomponente)
const OFF = { // Höchstbeträge 2025 je Mietenstufe: Haushaltsgröße 1..5, Mehrbetrag
  1: [361, 437, 521, 608, 694, 82], 2: [408, 493, 587, 686, 782, 94], 3: [456, 551, 657, 766, 875, 106], 4: [511, 619, 737, 858, 982, 119],
  5: [562, 680, 809, 946, 1080, 129], 6: [615, 745, 887, 1035, 1183, 149], 7: [677, 820, 975, 1139, 1302, 163]
};
const ABC = [[4e-2, 4.797e-4, 4.08e-5], [3e-2, 3.571e-4, 3.04e-5], [2e-2, 2.917e-4, 2.45e-5], [1e-2, 2.163e-4, 1.76e-5], [0, 1.907e-4, 1.72e-5], [-1e-2, 1.722e-4, 1.66e-5],
  [-2e-2, 1.592e-4, 1.65e-5], [-3e-2, 1.583e-4, 1.65e-5], [-4e-2, 1.376e-4, 1.66e-5], [-6e-2, 1.249e-4, 1.66e-5], [-9e-2, 1.141e-4, 1.96e-5], [-1.2e-1, 1.107e-4, 2.21e-5]];
const wogg = (n, M, Y) => { const [a, b, c] = ABC[n - 1]; return 1.15 * (M - (a + b * M + c * Y) * Y); };
let tabFails = 0, tabCount = 0;
for (let st = 1; st <= 7; st++) for (let n = 1; n <= 12; n++) {
  const hb = n <= 5 ? OFF[st][n - 1] : OFF[st][4] + (n - 5) * OFF[st][5];
  const klima = n <= 5 ? [19.2, 24.8, 29.6, 34.4, 39.2][n - 1] : 39.2 + (n - 5) * 4.8;
  const heiz = n <= 5 ? [110.4, 142.6, 170.2, 197.8, 225.4][n - 1] : 225.4 + (n - 5) * 27.6;
  const M = hb + klima + heiz;
  let lo = 0, hi = 20000; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (wogg(n, M, mid) > 0) lo = mid; else hi = mid; }
  const [g10, g30] = Rules.limits(st, n);
  tabCount += 2;
  if (Math.abs(g10 - lo / 0.9) > 0.01) { tabFails++; console.log('Grenze 10 % weicht ab', st, n, g10, lo / 0.9); }
  if (Math.abs(g30 - lo / 0.7) > 0.01) { tabFails++; console.log('Grenze 30 % weicht ab', st, n, g30, lo / 0.7); }
}
check('Wohngeld-Grenzen stimmen mit unabhängiger Neuberechnung aus amtlichen Parametern überein (' + tabCount + ' Werte)', tabFails === 0);
// Anker: Gesamtbeträge laut Gesetzentwurf BT-Drs. 21/8284 (Höchstbetrag plus Klimakomponente)
[[1, 1, 380.2], [7, 1, 696.2], [1, 2, 461.8], [7, 2, 844.8], [1, 3, 550.6], [7, 3, 1004.6], [1, 4, 642.4], [7, 4, 1173.4], [1, 5, 733.2], [7, 5, 1341.2]].forEach(([st, n, v]) => check('Höchstbetrag+Klima Stufe ' + st + ', ' + n + ' Pers. = ' + v, Math.abs(Rules.wgCap(st, n) - v) < 1e-9, Rules.wgCap(st, n)));
check('Heizkostenkomponente 1 Person 110,40 / 5 Personen 225,40 / 6 Personen 253,00', Rules.wgHeiz(1) === 110.4 && Rules.wgHeiz(5) === 225.4 && Math.abs(Rules.wgHeiz(6) - 253) < 1e-9);
let mono = true;
for (let s = 1; s <= 7; s++) for (let n = 1; n <= 12; n++) {
  const [a, b] = Rules.limits(s, n);
  if (!(b > a)) mono = false;
  if (n > 1 && !(a > Rules.limits(s, n - 1)[0])) mono = false;
  if (s > 1 && !(a > Rules.limits(s - 1, n)[0])) mono = false;
}
check('Tabelle monoton in Haushaltsgröße und Mietenstufe', mono);

const base = { adults: 1, kids: 0, young: 0, brutto: '', netto: '', miete: '', mietstufe: '', vermoegen: '', alter: false, erwerbsgemindert: false, behinderung: false, kinder12: false, unterhaltFehlt: false, alterGruppe: '', ausbildung: '', pflegegrad: '', bezug: {} };
const get = (r, id) => r.results.find((x) => x.id === id);
const lv = (r, id) => get(r, id).level;
const keys = (r, id) => get(r, id).tx.map((x) => x[0]);
const ev = (o) => Rules.evaluate({ ...base, ...o });

// 2) Rechenbausteine
check('Freibetrag SGB II bei 1.000 € brutto = 328', Math.abs(Rules.sgb2Freibetrag(1000, false) - 328) < 0.01, Rules.sgb2Freibetrag(1000, false));
check('Freibetrag SGB II bei 1.200 € brutto = 348', Math.abs(Rules.sgb2Freibetrag(1200, false) - 348) < 0.01);
check('Freibetrag SGB II bei 1.500 € brutto mit Kindern = 378', Math.abs(Rules.sgb2Freibetrag(1500, true) - 378) < 0.01);
check('Freibetrag SGB II ohne Kinder bei 1.500 € gedeckelt auf 348', Math.abs(Rules.sgb2Freibetrag(1500, false) - 348) < 0.01);
check('Freibetrag SGB II bei 50 € brutto = 50', Rules.sgb2Freibetrag(50, false) === 50);
check('Regelbedarf Paar mit 3 Kindern = 506+506+3x390 = 2.182 (Gegenrechnung Beispielquelle)', ev({ adults: 2, kids: 3 }).h.regel === 2182, ev({ adults: 2, kids: 3 }).h.regel);
check('Regelbedarf Alleinstehende = 563', ev({}).h.regel === 563);
check('Regelbedarf Jungerwachsene 451', ev({ young: 1 }).h.regel === 563 + 451);

// 3) Beispielhaushalte
const t1 = ev({ kids: 2, brutto: 2200, netto: 1750, miete: 950, mietstufe: 3, vermoegen: 3000, unterhaltFehlt: true, alterGruppe: '30-39' });
check('T1 Alleinerziehend: Wohngeld ja', lv(t1, 'wohngeld') === 'ja');
check('T1 Kinderzuschlag ja', lv(t1, 'kiz') === 'ja', lv(t1, 'kiz'));
check('T1 BuT ja', lv(t1, 'but') === 'ja');
check('T1 Kindergeld ja', lv(t1, 'kindergeld') === 'ja');
check('T1 Unterhaltsvorschuss ja', lv(t1, 'uvg') === 'ja');
check('T1 Grundsicherung im Alter nein', lv(t1, 'gsa') === 'nein');
// Bedarf 563 + 2 x 390 + 950 + Mehrbedarf Alleinerziehende 36 % (202,68) = 2.495,68; Einkommen 1.750 - 378 Freibetrag + 518 Kindergeld
// + 598 Unterhaltsvorschuss (2 x 299, Einkommen der Kinder) = 2.488 -> knapp -> möglich
check('T1 Grundsicherungsgeld knapp (Aufstocker mit Mehrbedarf und Unterhaltsvorschuss)', lv(t1, 'ggeld') === 'vielleicht', lv(t1, 'ggeld'));
check('T1 Hinweis Grundsicherungsgeld gegen Wohngeld', t1.zusammen.some((z) => z[0] === 'z.ggVsWg'));

const t2 = ev({ brutto: 880, netto: 780, miete: 480, mietstufe: 3, vermoegen: 4000, alter: true, alterGruppe: '50+' });
check('T2 Rentnerin: Grundsicherung im Alter ja', lv(t2, 'gsa') === 'ja', lv(t2, 'gsa'));
check('T2 Wohngeld nur möglich (Mindesteinkommen)', lv(t2, 'wohngeld') === 'vielleicht' && get(t2, 'wohngeld').hl === 'einkoNiedrig');
check('T2 Kinder-Leistungen, UVG, BAföG, Pflege nein', ['kiz', 'but', 'uvg', 'bafoeg', 'pflege', 'kindergeld'].every((id) => lv(t2, id) === 'nein'));
check('T2 Grundsicherungsgeld nein (Sozialamt zuständig)', lv(t2, 'ggeld') === 'nein' && get(t2, 'ggeld').hl === 'andereStelle');

const t3 = ev({ adults: 2, kids: 1, brutto: 3200, netto: 2500, miete: 1100, mietstufe: 5, vermoegen: 8000, alterGruppe: '30-39' });
check('T3 Paar mit Kind: Wohngeld vielleicht', lv(t3, 'wohngeld') === 'vielleicht', lv(t3, 'wohngeld'));
// Elterneinkommen 2.500 - 378 Freibetrag = 2.122; Bemessung 1.012 + 1.100 x 2/2,4 = 1.928,67; 297 - 0,45 x 193,33 = 210 -> wahrscheinlich
check('T3 Kinderzuschlag wahrscheinlich (Freibetrag für Arbeit mindert das Einkommen, § 6a BKGG mit § 11b SGB II)', lv(t3, 'kiz') === 'ja', lv(t3, 'kiz'));

const t4 = ev({ adults: 2, kids: 2, brutto: 6500, netto: 4500, miete: 1400, mietstufe: 4, vermoegen: 20000, alterGruppe: '40-49' });
check('T4 hohes Einkommen: Wohngeld, Kinderzuschlag, Grundsicherungsgeld nein', ['wohngeld', 'kiz', 'ggeld'].every((id) => lv(t4, id) === 'nein'));
check('T4 Kindergeld bleibt ja', lv(t4, 'kindergeld') === 'ja');
const t4b = ev({ brutto: 6000, netto: 4000, miete: 800, vermoegen: 90000 });
check('T4b alles nein: Hinweis "keine Leistung"', t4b.zusammen.some((z) => z[0] === 'z.keine') && t4b.results.every((x) => x.level === 'nein'));

const t5 = ev({ kids: 1, brutto: 1200, netto: 1100, miete: 600, mietstufe: 3, bezug: { grundsicherungsgeld: true } });
check('T5 Grundsicherungsgeld bezogen: Wohngeld nein, KiZ nein, BuT ja, Grundsicherungsgeld na', lv(t5, 'wohngeld') === 'nein' && lv(t5, 'kiz') === 'nein' && lv(t5, 'but') === 'ja' && lv(t5, 'ggeld') === 'na');
check('T5 Hinweis zum Bezug', t5.zusammen.some((z) => z[0] === 'z.ggBezug'));

const t6 = ev({ kids: 1, brutto: 400, netto: 400, miete: 500, mietstufe: 3, vermoegen: 0 });
check('T6 Mindesteinkommen Kinderzuschlag nicht erreicht', lv(t6, 'kiz') === 'nein' && get(t6, 'kiz').hl === 'minEink');
check('T6 Grundsicherungsgeld ja', lv(t6, 'ggeld') === 'ja');

// 4) Mietenstufe unbekannt: nur 'ja', wenn jede Stufe 'ja' sagt, nur 'nein', wenn jede Stufe 'nein' sagt
let sweepOk = true, sweepN = 0;
for (let adults = 1; adults <= 2; adults++) for (let kids = 0; kids <= 4; kids++) for (let b = 600; b <= 9000; b += 150) {
  const mk = (st) => lv(ev({ adults, kids, brutto: b, netto: b * 0.8, miete: 700, mietstufe: st }), 'wohngeld');
  const unk = mk('');
  const all = [1, 2, 3, 4, 5, 6, 7].map(mk);
  sweepN++;
  if (unk === 'ja' && !all.every((x) => x === 'ja')) { sweepOk = false; console.log('Sweep ja', adults, kids, b, all); }
  if (unk === 'nein' && !all.every((x) => x === 'nein')) { sweepOk = false; console.log('Sweep nein', adults, kids, b, all); }
}
check('Unbekannte Mietenstufe ist vorsichtig (Sweep über ' + sweepN + ' Haushalte)', sweepOk);
const t7b = ev({ kids: 1, brutto: 2100, netto: 1700, miete: 800, vermoegen: 0 });
check('Hinweis zur unbekannten Mietenstufe', keys(t7b, 'wohngeld').includes('wohngeld.stufeUnbekannt'));

// 5) Vermögen, Freibeträge
check('Vermögen über 10.000 €: Grundsicherung im Alter nein', lv(ev({ brutto: 900, netto: 800, miete: 450, mietstufe: 2, alter: true, vermoegen: 15000 }), 'gsa') === 'nein');
check('Vermögen über 60.000 €: Wohngeld nein', lv(ev({ brutto: 1000, netto: 900, miete: 450, mietstufe: 2, vermoegen: 80000 }), 'wohngeld') === 'nein');
const nf = ev({ brutto: 1760, netto: 1500, miete: 600, mietstufe: 3, vermoegen: 0 });
check('Freibetrag: ohne Behinderung Grenzbereich', lv(nf, 'wohngeld') === 'vielleicht');
check('Freibetrag: mit Behinderung besser', lv(ev({ brutto: 1760, netto: 1500, miete: 600, mietstufe: 3, vermoegen: 0, behinderung: true }), 'wohngeld') === 'ja');
// § 17 Nr. 1 WoGG: Pflegegrad allein gibt keinen Freibetrag; GdB 50 bis 99 nur zusammen mit Pflegebedürftigkeit; GdB 100 immer
const wgL = (o) => lv(ev({ brutto: 1760, netto: 1500, miete: 600, mietstufe: 3, vermoegen: 0, ...o }), 'wohngeld');
check('Freibetrag: Pflegegrad allein gibt ihn nicht', wgL({ pflegegrad: '2' }) === wgL({}));
check('Freibetrag: GdB 50 ohne Pflege gibt ihn nicht', wgL({ gdb: '50' }) === wgL({}));
check('Freibetrag: GdB 50 mit Pflegegrad besser', wgL({ gdb: '50', pflegegrad: '2' }) === 'ja');
check('Freibetrag: GdB 100 besser', wgL({ gdb: '100' }) === 'ja');

// 6) Kindergeld
check('Kindergeld: ohne Kind nein', lv(ev({}), 'kindergeld') === 'nein');
check('Kindergeld: mit Kind ja', lv(ev({ kids: 1 }), 'kindergeld') === 'ja');
check('Kindergeld: Jungerwachsener in Ausbildung ja', lv(ev({ young: 1 }), 'kindergeld') === 'ja');
check('Kindergeld: schon bezogen = na', lv(ev({ kids: 1, bezug: { kindergeld: true } }), 'kindergeld') === 'na');

// 7) Grundsicherungsgeld
check('Grundsicherungsgeld: Schonvermögen bis 30 Jahre 5.000', lv(ev({ brutto: 0, miete: 400, vermoegen: 6000, alterGruppe: '<30' }), 'ggeld') === 'nein' && get(ev({ brutto: 0, miete: 400, vermoegen: 6000, alterGruppe: '<30' }), 'ggeld').hl === 'vermHoch');
check('Grundsicherungsgeld: ab 50 Jahren 15.000 sind erlaubt', lv(ev({ brutto: 0, miete: 400, vermoegen: 15000, alterGruppe: '50+' }), 'ggeld') === 'ja');
check('Grundsicherungsgeld: Paar verdoppelt Schonvermögen', lv(ev({ adults: 2, brutto: 0, miete: 500, vermoegen: 19000, alterGruppe: '30-39' }), 'ggeld') === 'ja');
check('Grundsicherungsgeld: Alter -> Sozialamt zuständig', get(ev({ alter: true, miete: 400 }), 'ggeld').hl === 'andereStelle');
check('Grundsicherungsgeld: Erwerbsminderung -> Sozialamt zuständig', get(ev({ erwerbsgemindert: true, miete: 400 }), 'ggeld').hl === 'andereStelle');
check('Grundsicherungsgeld: Einkommen über Bedarf nein', lv(ev({ brutto: 3000, netto: 2400, miete: 600 }), 'ggeld') === 'nein');
check('Grundsicherungsgeld: Sozialamt-Bezug schließt aus', lv(ev({ miete: 400, bezug: { sozialamt: true } }), 'ggeld') === 'nein');
// Randfall: Bedarf 563+500 = 1063, Einkommen netto 800 bei brutto 1000 -> anrechenbar 800-328 = 472 -> Lücke 591 -> ja
check('Grundsicherungsgeld: Aufstocker mit Erwerbsfreibetrag', lv(ev({ brutto: 1000, netto: 800, miete: 500, vermoegen: 0 }), 'ggeld') === 'ja');

// 8) Unterhaltsvorschuss
check('UVG: ohne Kind nein', lv(ev({ unterhaltFehlt: true }), 'uvg') === 'nein');
check('UVG: ohne fehlenden Unterhalt nein', lv(ev({ kids: 1, brutto: 1500 }), 'uvg') === 'nein');
check('UVG: Alleinerziehend mit fehlendem Unterhalt ja', lv(ev({ kids: 1, brutto: 1500, unterhaltFehlt: true }), 'uvg') === 'ja');
check('UVG: Paar im Haushalt nur möglich', lv(ev({ adults: 2, kids: 1, unterhaltFehlt: true }), 'uvg') === 'vielleicht');
check('UVG: Kind ab 12 mit 400 € brutto nur möglich', lv(ev({ kids: 1, brutto: 400, unterhaltFehlt: true, kinder12: true }), 'uvg') === 'vielleicht');
check('UVG: Kind ab 12 mit 700 € brutto ja', lv(ev({ kids: 1, brutto: 700, unterhaltFehlt: true, kinder12: true }), 'uvg') === 'ja');
check('UVG: Beträge 227/299/394', JSON.stringify(get(ev({ kids: 1, unterhaltFehlt: true, brutto: 1000 }), 'uvg').tx[0][1]) === JSON.stringify({ a: '227 €', b: '299 €', c: '394 €' }));

// 9) BAföG
check('BAföG: niemand in Ausbildung nein', lv(ev({ kids: 1, netto: 1500 }), 'bafoeg') === 'nein');
check('BAföG: Kind, Elterneinkommen unter Freibetrag ja', lv(ev({ kids: 1, netto: 1500, ausbildung: 'kind' }), 'bafoeg') === 'ja');
check('BAföG: Kind, etwas über Freibetrag vielleicht', lv(ev({ kids: 1, netto: 2500, ausbildung: 'kind' }), 'bafoeg') === 'vielleicht');
check('BAföG: Kind, weit über Freibetrag nein', lv(ev({ kids: 1, netto: 4000, ausbildung: 'kind' }), 'bafoeg') === 'nein');
check('BAföG: Paar mit 2 jungen Erwachsenen, Freibetrag 2.540 + 770', lv(ev({ adults: 2, young: 2, netto: 3300, ausbildung: 'kind' }), 'bafoeg') === 'ja' && lv(ev({ adults: 2, young: 2, netto: 3400, ausbildung: 'kind' }), 'bafoeg') === 'vielleicht');
check('BAföG: Kind angegeben, aber kein Kind im Haushalt nein', lv(ev({ ausbildung: 'kind', netto: 1000 }), 'bafoeg') === 'nein');
check('BAföG: selbst, Vermögen über 15.000 bis 29 nein', lv(ev({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 20000 }), 'bafoeg') === 'nein');
check('BAföG: selbst, Vermögen im Rahmen vielleicht', lv(ev({ ausbildung: 'ich', alterGruppe: '<30', vermoegen: 5000 }), 'bafoeg') === 'vielleicht');
check('BAföG: selbst, ab 50 nein, 41 bis 50 vielleicht', lv(ev({ ausbildung: 'ich', alterGruppe: '50+' }), 'bafoeg') === 'nein' && lv(ev({ ausbildung: 'ich', alterGruppe: '40-49' }), 'bafoeg') === 'vielleicht');

// 10) Pflegegeld
check('Pflege: kein Pflegegrad nein', lv(ev({}), 'pflege') === 'nein');
check('Pflege: beantragt vielleicht', lv(ev({ pflegegrad: 'antrag' }), 'pflege') === 'vielleicht');
check('Pflege: Pflegegrad 1 = Entlastungsbetrag 131 €', lv(ev({ pflegegrad: '1' }), 'pflege') === 'ja' && get(ev({ pflegegrad: '1' }), 'pflege').tx[0][1].ent === '131 €');
check('Pflege: Beträge nach Pflegegrad 347/599/800/990', ['2', '3', '4', '5'].map((g) => get(ev({ pflegegrad: g }), 'pflege').tx[0][1].geld).join() === '347 €,599 €,800 €,990 €');

// 10b) Leere Felder sind keine 0: ohne Angabe kein „wahrscheinlich“, aber echte „nein“ bleiben stehen
check('Leeres Vermögen: Wohngeld nur "möglich" mit Hinweis', (() => { const r = get(ev({ brutto: 1200, netto: 1000, miete: 600, mietstufe: 3 }), 'wohngeld'); return r.level === 'vielleicht' && r.hl === 'angabeFehlt' && r.tx.some((x) => x[0] === 'fehlt.vermoegen'); })());
check('Leere Miete: Grundsicherungsgeld nur "möglich"', get(ev({ brutto: 0, netto: 0, vermoegen: 0 }), 'ggeld').hl === 'angabeFehlt');
check('Leeres Einkommen: Kinderzuschlag kein falsches "nein" wegen Mindesteinkommen', get(ev({ kids: 1, miete: 600, vermoegen: 0 }), 'kiz').hl === 'angabeFehlt');
check('Eingetragenes Einkommen unter Mindesteinkommen bleibt "nein", auch ohne Vermögensangabe', get(ev({ kids: 1, brutto: 400, netto: 400, miete: 500 }), 'kiz').hl === 'minEink' && lv(ev({ kids: 1, brutto: 400, netto: 400, miete: 500 }), 'kiz') === 'nein');
check('BAföG: Netto allein genügt als Einkommensangabe', lv(ev({ kids: 1, netto: 1500, ausbildung: 'kind' }), 'bafoeg') === 'ja');
check('Grundsicherung im Alter: Netto allein genügt als Einkommensangabe', get(ev({ alter: true, netto: 600, miete: 450, vermoegen: 0 }), 'gsa').hl !== 'angabeFehlt');
check('Wohngeld: Netto allein genügt NICHT (Wohngeld rechnet mit Brutto)', get(ev({ netto: 1000, miete: 600, vermoegen: 0, mietstufe: 3 }), 'wohngeld').hl === 'angabeFehlt');

// 10c) Unterhalt für die Kinder (Feld „unterhalt“, im Monat, alle Kinder zusammen)
{
  const raw = Rules.raw || Rules;
  const uvg = (o) => get(ev({ kids: 1, brutto: 1500, netto: 1200, unterhaltFehlt: true, ...o }), 'uvg');
  check('UVG ohne gezahlten Unterhalt: wahrscheinlich', uvg({}).level === 'ja');
  check('UVG: 150 € Unterhalt werden angerechnet -> nur noch möglich, mit Hinweis (§ 2 Abs. 3 UVG)', uvg({ unterhalt: 150 }).level === 'vielleicht' && keys(ev({ kids: 1, brutto: 1500, netto: 1200, unterhaltFehlt: true, unterhalt: 150 }), 'uvg')[0] === 'uvg.teil');
  check('UVG: Unterhalt mindestens so hoch wie der höchste UVG (394 € je Kind) -> nein', uvg({ unterhalt: 394 }).level === 'nein' && uvg({ unterhalt: 394 }).tx[0][0] === 'uvg.genug');
  check('UVG: 2 Kinder, 500 € Unterhalt (< 2 x 394 €) -> möglich', get(ev({ kids: 2, brutto: 1500, netto: 1200, unterhaltFehlt: true, unterhalt: 500 }), 'uvg').level === 'vielleicht');

  // Kinderzuschlag (§ 6a Abs. 3 BKGG): Paar, 2 Kinder, netto 2.050, Miete 950. Handrechnung:
  // Höchstbetrag 2 x 297 = 594; Elterneinkommen 2.050 - 378 Freibetrag = 1.672; Elternanteil Miete 2/2,8 -> Bemessung 1.012 + 678,57
  // = 1.690,57 -> kein Überschuss, Schätzung 594 €. Mit 1.200 € Unterhalt: 594 - 540 = 54 (< 60 -> „möglich“); mit 1.400 €: < 0 -> nein
  const kz = (u) => lv(ev({ adults: 2, kids: 2, brutto: 2600, netto: 2050, miete: 950, vermoegen: 0, unterhalt: u }), 'kiz');
  check('KiZ ohne Unterhalt: wahrscheinlich (Schätzung 594 €)', kz('') === 'ja');
  check('KiZ mit 1.200 € Unterhalt: Rest 54 € -> möglich', kz(1200) === 'vielleicht');
  check('KiZ mit 1.400 € Unterhalt: kein Zuschlag mehr -> nein', kz(1400) === 'nein');

  // Wohngeld (§§ 14, 16 WoGG): Unterhalt ohne Pauschalabzug; bei der unteren Grenze (10 % Abzug) zählt er wie u / 0,9 Brutto,
  // bei der oberen (30 %) wie u / 0,7. Paar mit 1 Kind, Stufe III, Miete 800.
  const wgo = { adults: 2, kids: 1, miete: 800, mietstufe: 3, vermoegen: 0 };
  const grenze = raw.evaluate({ ...wgo, brutto: 1000, netto: 800 }).results.find((x) => x.id === 'wohngeld').tx.find((x) => /grenze/.test(x[0]))[1];
  const lo = grenze.lo.eur, hi = grenze.hi.eur;
  const wg = (brutto, u) => lv(ev({ ...wgo, brutto, netto: brutto * 0.8, unterhalt: u }), 'wohngeld');
  check('Wohngeld: 50 € unter der unteren Grenze -> wahrscheinlich', wg(lo - 50, '') === 'ja', lo);
  check('Wohngeld: dazu 50 € Unterhalt (zählt wie 55,56 € Brutto) -> nur noch möglich', wg(lo - 50, 50) === 'vielleicht');
  check('Wohngeld: 50 € unter der oberen Grenze -> möglich', wg(hi - 50, '') === 'vielleicht', hi);
  check('Wohngeld: dazu 40 € Unterhalt (zählt wie 57,14 € Brutto) -> nein', wg(hi - 50, 40) === 'nein');

  // Grundsicherungsgeld: Unterhalt ist Einkommen des Kindes, aber nur bis zu dessen Bedarf. Alleinerziehend, 1 Kind (390 €),
  // Miete 600, Rente 900 (kein Freibetrag, 30 € Versicherungspauschale): Bedarf 563 + 390 + 600 + 67,56 Mehrbedarf (12 %) = 1.620,56;
  // Kinderbedarf 390 + 300 = 690, abzüglich 259 Kindergeld = 431 € anrechenbarer Unterhalt. Mit 1.000 € Unterhalt: Einkommen
  // 870 + 259 + 431 = 1.560 -> Lücke 60,56 -> noch „wahrscheinlich“ (bei voller Anrechnung wären es 2.129 € und damit „nein“).
  const gg = (u) => lv(ev({ kids: 1, brutto: 900, netto: 900, nichtArbeit: true, miete: 600, vermoegen: 0, unterhalt: u }), 'ggeld');
  check('Grundsicherungsgeld ohne Unterhalt: Lücke 394 € -> wahrscheinlich', gg('') === 'ja');
  check('Grundsicherungsgeld mit 1.000 € Unterhalt: nur 431 € angerechnet -> Lücke 61 € (nicht nein)', gg(1000) === 'ja');
  check('Grundsicherungsgeld: 431 € und 1.000 € Unterhalt wirken gleich (Deckel beim Kinderbedarf)', gg(431) === gg(1000));

  // Eigenschaft: mehr Unterhalt verbessert keine Einstufung (über viele Haushalte)
  {
    const rank = { ja: 0, vielleicht: 1, nein: 2, na: 3 }; let bad = [];
    for (const adults of [1, 2]) for (const kids of [1, 2, 3]) for (const b of [0, 900, 1600, 2400, 3400]) for (const miete of [400, 800, 1200]) for (const alter of [false, true]) {
      let last = null;
      for (const u of [0, 100, 250, 400, 700, 1000, 1500]) {
        const r = ev({ adults, kids, brutto: b, netto: b * 0.8, miete, mietstufe: 3, vermoegen: 0, alter, unterhaltFehlt: true, unterhalt: u });
        // Ausnahme (gesetzlich gewollt): Wohngeld und Kinderzuschlag setzen genug Einkommen zum Leben voraus (hl einkoNiedrig,
        // § 6a Abs. 1 Nr. 3 BKGG; Plausibilität beim Wohngeld). Dort darf mehr Einkommen die Leistung erst möglich machen.
        const ids = ['wohngeld', 'kiz', 'ggeld', 'gsa', 'uvg'];
        const niedrig = ids.map((id) => get(r, id).hl === 'einkoNiedrig');
        const now = ids.map((id) => rank[lv(r, id)]);
        if (last && now.some((v, i) => v < last.v[i] && !niedrig[i] && !last.niedrig[i])) bad.push([adults, kids, b, miete, alter, u].join('/'));
        last = { v: now, niedrig };
      }
    }
    check('Mehr Unterhalt macht Wohngeld, KiZ, Grundsicherung und UVG nie wahrscheinlicher (' + (2 * 3 * 5 * 3 * 2) + ' Haushalte)', bad.length === 0, bad.slice(0, 5).join(' | '));
  }
  check('Unterhalt ohne Kinder im Haushalt bleibt ohne Wirkung', JSON.stringify(ev({ brutto: 1500, netto: 1200, miete: 600, vermoegen: 0, unterhalt: 500 }).results) === JSON.stringify(ev({ brutto: 1500, netto: 1200, miete: 600, vermoegen: 0 }).results));
}

// 10d) Gemischtes Einkommen bei Paaren: Freibetrag (§ 11b SGB II) je Person und nur für Einkommen aus Arbeit.
// Paar ohne Kinder, Brutto 2.500, davon 1.000 bei der zweiten Person. Handrechnung: erste Person 1.500 -> 348 (gedeckelt bei 1.200),
// zweite Person 1.000 -> 100 + 20 % x 420 + 30 % x 480 = 328.
{
  const fb = (o) => Rules.haushaltsFreibetrag(Rules.derive({ adults: 2, kids: 0, brutto: 2500, brutto2: 1000, netto: 2150, ...o }));
  check('Paar, beide arbeiten: Freibetrag 348 + 328 = 676', Math.abs(fb({}) - 676) < 1e-9, fb({}));
  check('Paar, zweite Person bekommt Arbeitslosengeld I: nur 348 (erste Person)', Math.abs(fb({ nichtArbeit2: true }) - 348) < 1e-9, fb({ nichtArbeit2: true }));
  check('Paar, erste Person bekommt Rente, zweite arbeitet: nur 328 (zweite Person)', Math.abs(fb({ nichtArbeit: true }) - 328) < 1e-9, fb({ nichtArbeit: true }));
  check('Paar, beide ohne Arbeitseinkommen: kein Freibetrag', fb({ nichtArbeit: true, nichtArbeit2: true }) === 0);
  check('Alleinstehend: zweiter Haken ohne Wirkung', Rules.haushaltsFreibetrag(Rules.derive({ adults: 1, brutto: 1000, netto: 900, nichtArbeit2: true })) === 328);
  // Wirkung auf die Einstufung: Bedarf 1.012 + 800 = 1.812; netto 2.150.
  // beide arbeiten: 2.150 - 676 = 1.474 -> Lücke 338 -> wahrscheinlich; zweite Person Arbeitslosengeld: 2.150 - 348 = 1.802 -> Lücke 10 -> nur möglich
  const gg = (o) => lv(ev({ adults: 2, brutto: 2500, brutto2: 1000, netto: 2150, miete: 800, vermoegen: 0, ...o }), 'ggeld');
  check('Grundsicherungsgeld: beide arbeiten -> wahrscheinlich', gg({}) === 'ja');
  check('Grundsicherungsgeld: zweite Person Arbeitslosengeld I -> nur möglich (kein Freibetrag für sie)', gg({ nichtArbeit2: true }) === 'vielleicht');
}

// 11) Sortierung und Robustheit
const order = { ja: 0, vielleicht: 1, nein: 2, na: 3 };
let sorted = true;
[t1, t2, t3, t4, t5, t6].forEach((r) => { for (let i = 1; i < r.results.length; i++) if (order[r.results[i - 1].level] > order[r.results[i].level]) sorted = false; });
check('Ergebnisse sortiert nach Wahrscheinlichkeit', sorted);
check('Leere Eingaben erzeugen ' + KARTEN.length + ' Ergebnisse', ev({}).results.length === KARTEN.length);
check('Jedes Ergebnis hat Namen und Schritte', ev({}).results.every((r) => r.name && r.steps && r.steps.wo));

// 12) Sprachen
const LANGS = ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro'];
check('Acht Sprachen vorhanden', LANGS.every((l) => I18N[l]) && Object.keys(I18N).length === 8);
const deKeys = Object.keys(I18N.de);
LANGS.forEach((l) => {
  const ks = Object.keys(I18N[l]);
  const missing = deKeys.filter((k) => !(k in I18N[l]));
  const extra = ks.filter((k) => !(k in I18N.de));
  check(l + ': alle ' + deKeys.length + ' Schlüssel vorhanden, keine überzähligen', missing.length === 0 && extra.length === 0, 'fehlt: ' + missing.join(',') + ' extra: ' + extra.join(','));
  const empty = ks.filter((k) => !String(I18N[l][k]).trim() && !(l === 'de' && k.startsWith('n.')));
  check(l + ': keine leeren Texte', empty.length === 0, empty.join(','));
  const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join('');
  const bad = deKeys.filter((k) => ph(I18N.de[k]) !== ph(I18N[l][k]));
  check(l + ': Platzhalter stimmen mit Deutsch überein', bad.length === 0, bad.map((k) => k + ' de=' + ph(I18N.de[k]) + ' ' + l + '=' + ph(I18N[l][k])).join(' | '));
});
check('Arabisch läuft rechts nach links, alle anderen links nach rechts', I18N.ar['meta.dir'] === 'rtl' && LANGS.filter((l) => l !== 'ar').every((l) => I18N[l]['meta.dir'] === 'ltr'));

// Leichte Sprache (einfache Version, Deutsch): kurze Sätze (höchstens 15 Wörter), lange Wörter mit Bindestrich gegliedert
{
  const lang = [], wort = [];
  Object.keys(I18N.de).filter((k) => /^es\./.test(k)).forEach((k) => {
    const s = I18N.de[k].replace(/\{[^}]*\}/g, 'X');
    s.split(/[.!?]\s+/).forEach((satz) => { const w = satz.split(/\s+/).filter(Boolean); if (w.length > 15) lang.push(k + ' (' + w.length + ' Wörter)'); });
    s.split(/[\s,.;:!?()„“"]+/).forEach((w) => { if (w.length > 16 && !/-/.test(w)) wort.push(k + ': ' + w); });
  });
  check('Leichte Sprache: keine Sätze über 15 Wörter', lang.length === 0, lang.join(', '));
  check('Leichte Sprache: lange Wörter mit Bindestrich gegliedert', wort.length === 0, wort.join(', '));
}

// Die Webseite zum Hochladen (site/) enthält dieselbe Datenschutzerklärung wie das Projekt
{
  const fsx = require('fs'), px = require('path');
  const a = fsx.readFileSync(px.join(__dirname, '..', 'datenschutz.html'), 'utf8'), b = fsx.readFileSync(px.join(__dirname, '..', 'site', 'datenschutz.html'), 'utf8');
  check('Webseite: site/datenschutz.html ist aktuell (gleich wie datenschutz.html)', a === b);
  check('Webseite: Startseite verlinkt Datenschutz und Impressum', /datenschutz\.html"/.test(fsx.readFileSync(px.join(__dirname, '..', 'site', 'index.html'), 'utf8')) && /id="impressum"/.test(b));
}

// Name der App: überall „SoLo – Sozialleistungslotse“, nie der alte Name „Leistungslotse“ / „Leistungs-Lotse“ ohne „Sozial“
{
  const fsx = require('fs'), px = require('path'), R0 = px.join(__dirname, '..');
  const dateien = ['src/template.html', 'src/app.js', 'datenschutz.html', 'site/index.html', 'site/datenschutz.html', 'docs/STORE.md', 'docs/PLAY-TEST.md', 'docs/RELEASE.md', 'README.md',
    'app/capacitor.config.json', 'app/android/app/src/main/res/values/strings.xml', 'app/android/app/build.gradle', 'app/ios/App/App/Info.plist']
    .concat(fsx.readdirSync(px.join(R0, 'src', 'lang')).map((f) => 'src/lang/' + f));
  const alt = dateien.filter((f) => /(?<![Ss]ozial)[Ll]eistungs-?[Ll]otse/.test(fsx.readFileSync(px.join(R0, f), 'utf8')));
  check('Name: nirgends mehr der alte Name „Leistungslotse“ ohne „Sozial“', alt.length === 0, alt.join(', '));
}

// Zahl der Leistungen in Store-Text und Webseite passt zur App (Kartenliste)
{
  const fsx = require('fs'), px = require('path'), N = require('./karten.js').length;
  check('Store-Text nennt ' + N + ' Leistungen', fsx.readFileSync(px.join(__dirname, '..', 'docs', 'STORE.md'), 'utf8').includes(N + ' Sozialleistungen'));
  check('Webseite nennt ' + N + ' Leistungen', fsx.readFileSync(px.join(__dirname, '..', 'site', 'index.html'), 'utf8').includes('Prüft ' + N + ' Leistungen'));
}

// Amtsbegriffe bleiben deutsch erhalten
const TERMS = ['Wohngeld', 'Kinderzuschlag', 'Kindergeld', 'Grundsicherungsgeld', 'Grundsicherung im Alter', 'Jobcenter', 'Sozialamt', 'Familienkasse', 'Pflegekasse', 'BAföG', 'Pflegegeld', 'Unterhaltsvorschuss', 'Bürgergeld', 'Wohngeldstelle'];
LANGS.filter((l) => l !== 'de').forEach((l) => {
  const lost = [];
  deKeys.forEach((k) => {
    // reine Erklärtexte dürfen den Begriff übersetzen; Karten, Hinweise und Ämter behalten ihn
    if (k.startsWith('n.') || k.startsWith('meta.') || ['brutto.hint', 't.kindergeld.keinKind', 't.gsa.voraus'].includes(k)) return;
    TERMS.forEach((term) => { if (I18N.de[k].includes(term) && !I18N[l][k].includes(term)) lost.push(k + ':' + term); });
  });
  check(l + ': deutsche Amtsbegriffe bleiben erhalten', lost.length === 0, lost.join(', '));
});

// Alle von Logik und Oberfläche genutzten Schlüssel existieren
const used = new Set();
const states = [];
for (const adults of [1, 2]) for (const kids of [0, 1, 3]) for (const young of [0, 1]) for (const b of [0, 400, 900, 1500, 2500, 4500, 9000]) for (const alter of [false, true]) {
  for (const extra of [{}, { unterhaltFehlt: true, kinder12: true }, { ausbildung: 'kind' }, { ausbildung: 'ich', alterGruppe: '<30', vermoegen: 20000 }, { ausbildung: 'ich', alterGruppe: '50+' }, { pflegegrad: '1' }, { pflegegrad: '3' }, { pflegegrad: 'antrag' }, { bezug: { grundsicherungsgeld: true, kindergeld: true } }, { bezug: { sozialamt: true, wohngeld: true, kiz: true } }, { vermoegen: 99999 }, { erwerbsgemindert: true }, { mietstufe: 4, behinderung: true }, { bezug: { wohngeld: true } }, { bezug: { kiz: true } }, { ausbildung: 'ich', alterGruppe: '30-39', vermoegen: 1000 }, { bhPerson: 'minder', gdb: '50', blind: 'blind', pflegegrad: '3' }, { bhPerson: 'erwVor25', bhSelbst: true, gdb: '100' }, { bhPerson: 'erwVor25', gdb: 'H', blind: 'hoch', pflegegrad: '2' }, { bhPerson: 'erwNach25', gdb: '30', emStd: 'unter3', em5: true }, { emStd: '3bis6', wfbm: true, gdb: '20' }, { emStd: '3bis6', gdb: '40', pflegegrad: 'antrag' }, { gdb: '60', behinderung: true, ausbildung: 'ich', babBetrieb: true, babWohnt: true }, { ausbildung: 'ich', babBetrieb: true, babWohnt: false }, { bezug: { grundsicherungsgeld: true } , erwerbsgemindert: true }]) {
    states.push({ adults, kids, young, brutto: b, netto: b * 0.8, miete: 650, alter, ...extra });
  }
}
// feste Beispielhaushalte ebenfalls einbeziehen
[{ kids: 2, brutto: 2200, netto: 1750, miete: 950, mietstufe: 3 }, { adults: 2, kids: 1, brutto: 3200, netto: 2500, miete: 1100, mietstufe: 5 }].forEach((s) => states.push({ ...base, ...s }));
states.forEach((s) => {
  const r = ev(s);
  r.results.forEach((x) => {
    used.add('h.' + x.hl); used.add('lvl.' + x.level); used.add('zu.' + x.id); used.add('n.' + x.id);
    x.tx.forEach((y) => used.add('t.' + y[0]));
    used.add(x.steps.wo); x.steps.u.forEach((k) => used.add(k)); used.add(x.steps.tip);
  });
  r.zusammen.forEach((z) => used.add(z[0]));
});
const unknown = [...used].filter((k) => !(k in I18N.de));
check('Alle von der Logik genutzten Schlüssel (' + used.size + ') existieren (' + states.length + ' Haushalte durchgespielt)', unknown.length === 0, unknown.join(','));
// Parameter der Logik passen zu den Platzhaltern der Texte
let phBad = [];
states.forEach((s) => {
  ev(s).results.forEach((x) => x.tx.forEach((y) => {
    const need = (I18N.de['t.' + y[0]].match(/\{(\w+)\}/g) || []).map((m) => m.slice(1, -1)).sort().join();
    const have = Object.keys(y[1] || {}).sort().join();
    if (need !== have) phBad.push(y[0] + ' braucht ' + need + ' hat ' + have);
  }));
});
check('Parameter der Logik passen zu den Platzhaltern', phBad.length === 0, [...new Set(phBad)].join(' | '));

// Schlüssel in der Oberfläche (data-t, t('...')) existieren
const tpl = fs.readFileSync(__dirname + '/../src/template.html', 'utf8') + fs.readFileSync(__dirname + '/../src/app.js', 'utf8');
const ui = new Set();
for (const m of tpl.matchAll(/data-t(?:-aria)?="([\w.]+)"/g)) ui.add(m[1]);
for (const m of tpl.matchAll(/\bt\('([\w.]+)'/g)) ui.add(m[1]);
for (const m of tpl.matchAll(/key: '([\w.]+)'/g)) ui.add(m[1]);
const uiMissing = [...ui].filter((k) => !k.endsWith('.') && !(k in I18N.de)); // Präfixe wie 't.' werden zur Laufzeit ergänzt und oben über die Logik geprüft
check('Alle Schlüssel der Oberfläche (' + ui.size + ') existieren', uiMissing.length === 0, uiMissing.join(','));
const unused = deKeys.filter((k) => !used.has(k) && !ui.has(k) && !k.startsWith('meta.') && !/^(pflege\.n|stufe\.n|gruppe\.\d|ausb\.|adults\.|n\.|lvl\.|c\.)/.test(k));
console.log('Hinweis, nicht verwendete Schlüssel:', unused.length ? unused.join(', ') : 'keine');

console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlle Tests bestanden');
process.exit(fails ? 1 : 0);
