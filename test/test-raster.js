// Prüfung über sehr viele Haushalte: Die App (src/rules.js) muss bei jeder Konstellation dasselbe Ergebnis liefern
// wie die unabhängige Referenzrechnung (test/referenz.js). Verglichen werden die Einstufung (wahrscheinlich, möglich,
// unwahrscheinlich, schon vorhanden) und die Zahlen (Bedarf, geschätzte Beträge).
// Aufruf: node test/test-raster.js [Anzahl Zufallshaushalte, Standard 60000]
'use strict';
const Rules = require('../src/rules.js');
const Ref = require('./referenz.js');

const N = Number(process.argv[2]) || 60000;
let seed = 20261107;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const geld = (max, schritt) => Math.round(rnd() * max / schritt) * schritt;

const ARTEN = ['lohn', 'rente', 'alg', 'kg', 'eg', 'ohne'];
// Wie die App (syncEinkommen): Einkommen je Person -> brutto (Summe), brutto2, netto (Summe), art1, art2
function haushaltZufall(i) {
  const adults = rnd() < 0.5 ? 1 : 2;
  const kids = pick([0, 0, 1, 1, 2, 2, 3, 4, 5]);
  const kidsU6 = Math.floor(rnd() * (kids + 1));
  const kids14 = Math.floor(rnd() * (kids - kidsU6 + 1));
  const young = pick([0, 0, 0, 1, 2]);
  const person = () => {
    const art = pick(ARTEN);
    if (art === 'ohne') return { art, b: 0, n: 0 };
    const b = art === 'lohn' ? pick([geld(600, 1), geld(2500, 10), geld(6000, 50), 603, 1000, 1200, 1500]) : geld(art === 'eg' ? 1800 : 2600, 10);
    const n = art === 'lohn' || art === 'rente' ? Math.round(b * (0.6 + rnd() * 0.3)) : b;
    return { art, b, n };
  };
  const p1 = person(), p2 = adults === 2 ? person() : null;
  const e = {
    adults, kids, kidsU6, kids14, young,
    art1: p1.art, art2: p2 ? p2.art : '',
    brutto: p1.b + (p2 ? p2.b : 0), brutto2: p2 ? p2.b : '', netto: p1.n + (p2 ? p2.n : 0),
    miete: pick([0, geld(400, 10) + 200, geld(1200, 10) + 300, geld(2000, 10) + 500]),
    mietstufe: pick(['', '1', '2', '3', '4', '5', '6', '7']),
    vermoegen: pick([0, geld(9000, 100), geld(30000, 500), geld(120000, 1000), 5000, 10000, 15000, 20000, 55000, 70000]),
    unterhalt: kids + young > 0 && rnd() < 0.3 ? geld(900, 10) : '',
    unterhaltFehlt: kids > 0 && rnd() < 0.5,
    kinder12: kids > 0 && rnd() < 0.3,
    kindEink: kids + young > 0 && rnd() < 0.25 ? geld(1200, 10) : '',
    gebJahr: pick([1940, 1955, 1958, 1959, 1960, 1961, 1965, 1972, 1980, 1990, 1996, 2003]),
    heute: 2026 + 10 / 12,
    ausbildung: pick(['', '', '', 'kind', 'kindBetrieb', 'ich']),
    babBetrieb: rnd() < 0.3, babWohnt: rnd() < 0.3,
    emStd: pick(['', '', '', 'unter3', '3bis6']),
    wfbm: rnd() < 0.05,
    gdb: pick(['', '', '', '50', '80', '100', 'H']),
    pflegegrad: pick(['', '', '', '2', '3']),
    bezug: { grundsicherungsgeld: rnd() < 0.05, sozialamt: rnd() < 0.03, wohngeld: rnd() < 0.05, kiz: rnd() < 0.05, kindergeld: rnd() < 0.4 }
  };
  return e;
}

const fehler = {};
let n = 0;
const melde = (art, e, info) => { fehler[art] = fehler[art] || { anzahl: 0, beispiel: null }; fehler[art].anzahl++; if (!fehler[art].beispiel) fehler[art].beispiel = { e, info }; };
const zahlAus = (r, key, feld) => { const x = r.tx.find((t) => t[0] === key); return x && x[1] && x[1][feld] ? x[1][feld].eur : null; };

function pruefe(e) {
  n++;
  const out = Rules.evaluate(e);
  const r = {}; out.results.forEach((x) => { r[x.id] = x; });
  const h = Ref.haushalt(e);
  // Grundsicherungsgeld
  const gg = Ref.grundsicherungsgeld(h);
  if (r.ggeld.level !== gg.level) melde('Grundsicherungsgeld: Einstufung', e, { app: r.ggeld.level, ref: gg.level, ref2: gg });
  else if (gg.bedarf != null) {
    const bApp = r.ggeld.tx[0][1] && r.ggeld.tx[0][1].bedarf ? r.ggeld.tx[0][1].bedarf.eur : null;
    if (bApp !== Math.round(gg.bedarf)) melde('Grundsicherungsgeld: Bedarf', e, { app: bApp, ref: Math.round(gg.bedarf) });
    const s = zahlAus(r.ggeld, 'schaetz.eins', 'a');
    if (gg.level === 'ja' && s !== Math.round(gg.luecke / 10) * 10) melde('Grundsicherungsgeld: geschätzter Betrag', e, { app: s, ref: gg.luecke });
  }
  // Wohngeld
  const w = Ref.wohngeld(h);
  if (r.wohngeld.level !== w.level) melde('Wohngeld: Einstufung', e, { app: r.wohngeld.level, ref: w.level, yPess: w.yPess, yOpt: w.yOpt });
  else if (w.betrag && r.wohngeld.hl !== 'einkoNiedrig' && w.level !== 'nein' && w.level !== 'na') {
    const a = zahlAus(r.wohngeld, 'schaetz.spanne', 'a') ?? zahlAus(r.wohngeld, 'schaetz.eins', 'a');
    const b = zahlAus(r.wohngeld, 'schaetz.spanne', 'b') ?? zahlAus(r.wohngeld, 'schaetz.bis', 'b') ?? a;
    const [ra, rb] = w.betrag;
    const erwartetB = rb >= 10 ? rb : null;
    if ((b ?? null) !== erwartetB && !(erwartetB === null && b === null)) melde('Wohngeld: geschätzter Höchstbetrag', e, { app: [a, b], ref: w.betrag });
    else if (erwartetB && ra >= 10 && a !== ra) melde('Wohngeld: geschätzter Mindestbetrag', e, { app: [a, b], ref: w.betrag });
  }
  // Kinderzuschlag
  const k = Ref.kinderzuschlag(h);
  if (r.kiz.level !== k.level) melde('Kinderzuschlag: Einstufung', e, { app: r.kiz.level, ref: k.level, kiz: k.kiz });
  else if (k.kiz != null && (k.level === 'ja' || (k.level === 'vielleicht' && r.kiz.hl !== 'einkoNiedrig'))) {
    const s = zahlAus(r.kiz, 'schaetz.eins', 'a');
    if (s !== Math.max(10, Math.round(k.kiz / 10) * 10)) melde('Kinderzuschlag: geschätzter Betrag', e, { app: s, ref: k.kiz });
  }
  // Allgemein: keine Fehlwerte
  if (/NaN|Infinity|undefined/.test(JSON.stringify(out))) melde('Fehlwerte (NaN/undefined)', e, {});
}

for (let i = 0; i < N; i++) pruefe(haushaltZufall(i));

const arten = Object.keys(fehler);
if (arten.length) {
  console.log('ABWEICHUNGEN zwischen App und Referenz (' + n + ' Haushalte):');
  arten.forEach((a) => { console.log('\n- ' + a + ': ' + fehler[a].anzahl + 'x\n  Beispiel: ' + JSON.stringify(fehler[a].beispiel)); });
  process.exit(1);
}
console.log('Raster-Test bestanden: ' + n + ' Haushalte, App und unabhängige Referenz stimmen überein (Grundsicherungsgeld, Wohngeld, Kinderzuschlag: Einstufung und Beträge).');
