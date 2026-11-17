// Tests: Bescheid-Check Kinderzuschlag (Erweiterung, nicht Teil von npm test der App 1.2.0)
'use strict';
const Rules = require('../../src/rules.js');
const K = require('../../erweiterungen/bescheid-kiz.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
const R = Rules.RULES;

// 1. Von Hand: Paar, Kinder 5 und 9, Wohnkosten 900 €, ein Lohn 2.500 € brutto / 1.900 € netto
//    Bedarf Eltern: 2 × 506 + 900 × 0,71 = 1.012 + 639 = 1.651; Freibetrag 100+84+144+50 = 378 → Einkommen 1.522 < Bedarf → 2 × 297 = 594
const a = { eltern: [{ brutto: 2500, netto: 1900 }, {}], kinder: [{ alter: 5 }, { alter: 9 }], wohnkosten: 900 };
const ra = K.rechne(a, Rules);
ok('Bedarf Eltern 1.651', ra.bedarf === 1651, ra);
ok('Einkommen Eltern 1.522', ra.einkEltern === 1522, ra.einkEltern);
ok('Kinderzuschlag voll 594', ra.kiz === 594, ra.kiz);
// 2. Einkommen über dem Bedarf: netto 2.300 / brutto 3.100 → 1.922, 271 über Bedarf → 594 − 121,95 = 472,05
const rb = K.rechne({ eltern: [{ brutto: 3100, netto: 2300 }, {}], kinder: [{ alter: 5 }, { alter: 9 }], wohnkosten: 900 }, Rules);
ok('Über Bedarf: 45 % angerechnet → 472,05', rb.ueber === 271 && rb.kiz === 472.05, rb);
// 3. Unterhalt beim Kind: 200 € → 297 − 90 = 207 für dieses Kind
const rc = K.rechne({ eltern: [{ brutto: 1800, netto: 1400 }], kinder: [{ alter: 8, unterhalt: 200 }], wohnkosten: 700 }, Rules);
ok('Unterhalt mindert um 45 %', rc.jeKind[0] === 207, rc.jeKind);
ok('Alleinerziehend: Mehrbedarf 12 % bei Kind 8', rc.mehrAE === 67.56, rc.mehrAE);
ok('Alleinerziehend: Wohnanteil 77 % bei einem Kind', rc.wohnanteil === 0.77);
ok('Eigenes Einkommen des Kindes bis Minijob-Grenze frei', K.rechne({ eltern: [{ brutto: 1800, netto: 1400 }], kinder: [{ alter: 16, eigenes: R.minijob }], wohnkosten: 700 }, Rules).jeKind[0] === 297);
ok('Mindesteinkommen Paar 900 €', K.rechne({ eltern: [{ brutto: 800, netto: 700 }, {}], kinder: [{ alter: 3 }], wohnkosten: 600 }, Rules).mindestOk === false);
ok('Mindesteinkommen Alleinerziehend 600 €', K.rechne({ eltern: [{ brutto: 650, netto: 600 }], kinder: [{ alter: 3 }], wohnkosten: 600 }, Rules).mindestOk === true);
// § 6a Abs. 6 BKGG: anderes Einkommen über dem Bedarf voll angerechnet (hier: Arbeitslosengeld I 1.900 €, Bedarf 1.651 €)
const alg = K.rechne({ eltern: [{ sonstiges: 1900 }, {}], kinder: [{ alter: 5 }, { alter: 9 }], wohnkosten: 900 }, Rules);
ok('ALG I: 1.870 € (nach 30 € Pauschale) − 1.651 € = 219 € voll → 375 €', alg.anderes === 1870 && alg.minderung === 219 && alg.kiz === 375, alg);
// Gemischt: Lohn 2.400/1.800 € (anrechenbar 1.800 − 378 = 1.422 €) und ALG I 1.000 € (970 €, unter dem Bedarf): 2.392 − 1.651 = 741 € zu 45 % = 333,45 €
const misch = K.rechne({ eltern: [{ brutto: 2400, netto: 1800 }, { sonstiges: 1000 }], kinder: [{ alter: 5 }, { alter: 9 }], wohnkosten: 900 }, Rules);
ok('Gemischt, anderes Einkommen unter dem Bedarf: Überschreitung zu 45 % = 333,45 €', misch.arbeit === 1422 && misch.anderes === 970 && misch.minderung === 333.45 && misch.kiz === 260.55, misch);
ok('Nie negativ', K.rechne({ eltern: [{ brutto: 9000, netto: 6000 }, {}], kinder: [{ alter: 3 }], wohnkosten: 600 }, Rules).kiz === 0);

// 4. Bescheid prüfen
const richtig = K.pruefe(Object.assign({ bescheid: { bedarf: 1651, einkommen: 1522, kiz: 594 } }, a), Rules);
ok('Richtiger Bescheid passt', richtig.posten.every((p) => p.wirkung === 'passt') && !richtig.gruende.length, richtig.posten);
const ohneFrei = K.pruefe(Object.assign({ bescheid: { bedarf: 1651, einkommen: 1900, kiz: 594 - 0.45 * (1900 - 1651) } }, a), Rules);
ok('Freibetrag vergessen → Einkommen zu hoch, Grund genannt', ohneFrei.posten.find((p) => p.key === 'einkommen').wirkung === 'zuWenig' && /Freibetrag/.test(ohneFrei.gruende[0].grund));
ok('… Kinderzuschlag zu niedrig um 112,05', ohneFrei.zuWenigImMonat === 112.05, ohneFrei.zuWenigImMonat);
const wenigWohn = K.pruefe(Object.assign({ bescheid: { bedarf: 1012 + 900 * 0.5, kiz: 500 } }, a), Rules);
ok('Wohnanteil zu klein → Bedarf zu niedrig', wenigWohn.posten.find((p) => p.key === 'bedarf').wirkung === 'zuWenig' && /Wohnkostenanteil/.test(wenigWohn.gruende[0].grund));
ok('Grenzen nennen den 6-Monats-Zeitraum', /sechs Monate/.test(richtig.grenzen));

// 5. Gleicher Betrag wie die App: zufällige Familien mit einem Lohn; die App zeigt den Betrag auf 10 € gerundet (mindestens 10 €)
let rnd = 4242; const zuf = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
let verglichen = 0;
for (let i = 0; i < 2000; i++) {
  const adults = zuf() < 0.5 ? 1 : 2, nk = 1 + Math.floor(zuf() * 4);
  // 14- bis 17-Jährige als 16 Jahre: Die App kennt nur die Gruppe „14 bis 17“ und rechnet vorsichtig, als wären sie mindestens 16 (Mehrbedarf)
  const alter = Array.from({ length: nk }, () => [3, 9, 16][Math.floor(zuf() * 3)]);
  const brutto = Math.round((700 + zuf() * 3800) / 10) * 10, netto = Math.round(brutto * (brutto < 1300 ? 0.8 : 0.7));
  const uh = zuf() < 0.3 ? Math.round(zuf() * 300) : 0, miete = Math.round((400 + zuf() * 1200) / 10) * 10;
  const inp = { adults, kids: nk, kidsU6: alter.filter((x) => x < 6).length, kids14: alter.filter((x) => x >= 14).length, art1: 'lohn', art2: adults === 2 ? 'ohne' : undefined, brutto, brutto2: 0, netto,
    unterhalt: uh * nk, miete, mietstufe: '3', vermoegen: 0, gebJahr: 1988, bezug: { kindergeld: true }, heute: '2026-11-17' };
  const app = Rules.evaluate(inp).results.find((x) => x.id === 'kiz');
  const sch = app && app.tx.find((t) => t[0] === 'schaetz.eins');
  if (!sch || app.tx.some((t) => t[0] === 'kiz.ae7')) continue;
  const r = K.rechne({ eltern: adults === 2 ? [{ brutto, netto }, {}] : [{ brutto, netto }], kinder: alter.map((x) => ({ alter: x, unterhalt: uh })), wohnkosten: miete }, Rules);
  const r10 = Math.max(10, Math.round(r.kiz / 10) * 10);
  verglichen++;
  if (r10 !== sch[1].a.eur) ok(`Fall ${i}: gleicher Betrag wie die App`, false, { inp, app: sch[1].a.eur, check: r.kiz });
}
ok('Mit der App verglichen (mindestens 300 Fälle mit Betrag)', verglichen >= 300, verglichen);

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bescheid-Check Kinderzuschlag: alle ${n} Prüfungen bestanden (${verglichen} Familien mit der App verglichen)`);
process.exit(f ? 1 : 0);
