// Tests: Bescheid-Check Grundsicherung im Alter und bei Erwerbsminderung (Erweiterung, nicht Teil von npm test der App 1.2.0)
'use strict';
const Rules = require('../../src/rules.js');
const G = require('../../erweiterungen/bescheid-gsa.js');
const W = require('../../erweiterungen/widerspruch.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
const R = Rules.RULES;

// 1. Freibeträge (§ 82 Abs. 3 und 4, § 82a SGB XII; Höchstbetrag 50 % von 563 € = 281,50 €)
ok('Grundrente 900: 100 + 30 % von 800 = 340 → gedeckelt 281,50', G.freiGrundrente(900, R) === 281.5);
ok('Grundrente 400: 100 + 90 = 190', G.freiGrundrente(400, R) === 190);
ok('Betriebsrente 80: ganz frei', G.freiVorsorge(80, R) === 80);
ok('Betriebsrente 150: 100 + 15 = 115', G.freiVorsorge(150, R) === 115);
ok('Arbeit 400: 30 % = 120', G.freiArbeit(400, R) === 120);
ok('Arbeit 1.200: höchstens 281,50', G.freiArbeit(1200, R) === 281.5);

// 2. Von Hand: alleinstehend, Merkzeichen G, Rente 900 netto mit 33 Grundrentenjahren, Betriebsrente 150, Miete 450 + 70 Heizung
//    Regel 563; Mehrbedarf G 17 % = 95,71; Einkommen (900 − 281,50) + (150 − 115) = 653,50; Bedarf 563 + 95,71 + 520 = 1.178,71; Zahlbetrag 525,21
const fall = { personen: [{ mzG: true, renteNetto: 900, grundrente33: true, zusatzRente: 150 }], miete: { tatsaechlich: 450, heizung: 70 },
  bescheid: { regel: 563, mehrG: 0, kdu: 520, einkommen: 1050, zahlbetrag: 33 } };
const r = G.pruefe(fall, Rules);
const p = (k) => r.posten.find((x) => x.key === k);
ok('Erwartet: Einkommen 653,50', r.erwartet.einkommen === 653.5, r.erwartet);
ok('Erwartet: Zahlbetrag 525,21', r.erwartet.zahlbetrag === 525.21, r.erwartet);
ok('Mehrbedarf G fehlt: 95,71 zu wenig', p('mehrG').wirkung === 'zuWenig' && p('mehrG').diff === 95.71, p('mehrG'));
ok('Freibeträge fehlen: 396,50 zu viel Einkommen', p('einkommen').wirkung === 'zuWenig' && p('einkommen').diff === 396.5, p('einkommen'));
ok('Grund nennt Grundrente und Betriebsrente', /Grundrentenfreibetrag/.test(p('einkommen').grund) && /Betriebs-, Riester- oder private Rente/.test(p('einkommen').grund));
ok('Zusammen 492,21 im Monat zu wenig', r.zuWenigImMonat === 492.21, r.zuWenigImMonat);
ok('Regel und Unterkunft passen', p('regel').wirkung === 'passt' && p('kdu').wirkung === 'passt');
ok('Paar: 2 × 506', G.pruefe({ personen: [{}, {}], bescheid: {} }, Rules).erwartet.regel === 1012);
ok('Paar: Mehrbedarf G nur für die Person mit G', G.pruefe({ personen: [{ mzG: true }, {}], bescheid: {} }, Rules).erwartet.mehrG === 86.02);
ok('Warmwasser 2,3 %', G.pruefe({ personen: [{}], warmwasserDezentral: true }, Rules).erwartet.mehrWW === 12.95);
ok('Versicherungsbeiträge werden abgezogen', G.pruefe({ personen: [{ renteNetto: 800, versicherungen: 25 }] }, Rules).erwartet.einkommen === 775);
ok('Ohne Grundrentenzeiten kein Freibetrag', G.pruefe({ personen: [{ renteNetto: 800 }] }, Rules).erwartet.einkommen === 800);
// Befund 14 (Abgleich 2, 21.11.2026): § 82a Abs. 1 SGB XII rechnet aus der Bruttorente (DRV „Die Grundsicherung“ 5/2026, S. 18)
const gb = G.pruefe({ personen: [{ renteNetto: 535, renteBrutto: 600, grundrente33: true }] }, Rules);
ok('Grundrente brutto 600 / netto 535: Freibetrag 250,00 aus dem Brutto', gb.teile[0].freiGrundrente === 250 && gb.erwartet.einkommen === 285, gb.teile);
ok('Harald F. (DRV S. 18): brutto 870, netto 776 -> Freibetrag 281,50', G.pruefe({ personen: [{ renteNetto: 776, renteBrutto: 870, grundrente33: true }] }, Rules).teile[0].freiGrundrente === 281.5);
const gn = G.pruefe({ personen: [{ renteNetto: 535, grundrente33: true }] }, Rules);
ok('Ohne Brutto: Freibetrag aus dem Netto (230,50) und Hinweis in „Nicht geprüft“', gn.teile[0].freiGrundrente === 230.5 && /Bruttorente fehlt/.test(gn.grenzen), gn);
ok('Mit Brutto kein Hinweis', !/Bruttorente fehlt/.test(gb.grenzen));
const kd = G.pruefe({ personen: [{}], miete: { tatsaechlich: 600, heizung: 80 }, bescheid: { kdu: 560 } }, Rules);
ok('Gekürzte Unterkunft → prüfen, nicht sicher zu wenig', kd.posten[0].wirkung === 'pruefen' && kd.zuWenigImMonat === 0);
ok('Widerspruch Grundsicherung im Alter', /Widerspruch gegen den Bescheid über Leistungen der Grundsicherung im Alter und bei Erwerbsminderung vom 16\.11\.2026/.test(W.text({ art: 'gsa', bescheidDatum: '2026-11-16', heute: '2026-11-17', punkte: W.punkteSGB2(r) })));

// 3. Gleicher Betrag wie die App: alleinstehende Rentner (mit und ohne Grundrentenzeiten), ohne Betriebsrente (die App kennt sie nicht)
let rnd = 777; const zuf = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
let verglichen = 0;
for (let i = 0; i < 1500; i++) {
  const netto = Math.round(200 + zuf() * 1100), miete = Math.round((300 + zuf() * 600) / 10) * 10, gr = zuf() < 0.5;
  const brutto = Math.round(netto * 1.12);
  const inp = { adults: 1, kids: 0, art1: 'rente', brutto, netto, miete, mietstufe: '3', vermoegen: 0, alter: true, grundrente33: gr, bezug: {} };
  const app = Rules.evaluate(inp).results.find((x) => x.id === 'gsa');
  const sch = app && app.tx.find((t) => t[0] === 'schaetz.eins');
  if (!sch) continue;
  const c = G.pruefe({ personen: [{ renteNetto: netto, renteBrutto: brutto, grundrente33: gr }], miete: { tatsaechlich: miete } }, Rules);
  verglichen++;
  const r10 = Math.round(c.erwartet.zahlbetrag / 10) * 10;
  if (r10 !== sch[1].a.eur) ok(`Fall ${i}: gleicher Betrag wie die App`, false, { inp, app: sch[1].a.eur, check: c.erwartet.zahlbetrag });
}
ok('Mit der App verglichen (mindestens 300 Fälle)', verglichen >= 300, verglichen);

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bescheid-Check Grundsicherung im Alter: alle ${n} Prüfungen bestanden (${verglichen} Rentner mit der App verglichen)`);
process.exit(f ? 1 : 0);
