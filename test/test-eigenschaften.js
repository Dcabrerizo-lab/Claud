// Eigenschaftstests: Regeln, die IMMER gelten müssen, geprüft über sehr viele zufällige Haushalte.
// Sie brauchen keine von Hand gerechnete Zahl und finden so Fehler, an die bei einzelnen Fällen niemand denkt.
//  - Monotonie: mehr Einkommen nie mehr Grundsicherungsgeld/Grundsicherung/Wohngeld/Kinderzuschlag (ab dem Mindesteinkommen),
//    ein Kind mehr nie weniger Bedarf, mehr Miete nie weniger Bedarf oder Wohngeld, mehr Vermögen nie eine bessere Einstufung,
//    höherer GdB oder Pflegegrad nie weniger Nachteilsausgleich
//  - Widerspruchsfreiheit zwischen den Karten
// Aufruf: node test/test-eigenschaften.js [Anzahl, Standard 15000]
'use strict';
const Rules = require('../src/rules.js');
const KARTEN = require('./karten.js');

const N = Number(process.argv[2]) || 15000;
let seed = 777;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const RANG = { ja: 3, vielleicht: 2, na: 1, nein: 0 };

const fehler = {};
let n = 0;
const melde = (art, e, info) => { if (!fehler[art]) fehler[art] = { anzahl: 0, beispiel: { e, info } }; fehler[art].anzahl++; };
const ev = (e) => { const m = {}; const r = Rules.evaluate(e); r.results.forEach((x) => { m[x.id] = x; }); m._z = r.zusammen.map((z) => z[0]); return m; };
const betrag = (x) => { if (!x) return null; const t = x.tx.find((a) => /^schaetz\./.test(a[0])); if (!t) return null; const p = t[1]; return p.b ? p.b.eur : p.a ? p.a.eur : null; };
const bedarf = (x) => { const t = x && x.tx.find((a) => a[1] && a[1].bedarf); return t ? t[1].bedarf.eur : null; };

function zufall() {
  const adults = rnd() < 0.5 ? 1 : 2;
  const kids = pick([0, 0, 1, 2, 3]);
  const art1 = pick(['lohn', 'lohn', 'rente', 'alg', 'ohne']);
  const art2 = adults === 2 ? pick(['lohn', 'rente', 'ohne']) : '';
  const b1 = art1 === 'ohne' ? 0 : Math.round(rnd() * 3500);
  const b2 = art2 && art2 !== 'ohne' ? Math.round(rnd() * 2500) : 0;
  const q = (a) => (a === 'lohn' ? 0.72 : 1);
  return {
    adults, kids, kidsU6: Math.floor(rnd() * (kids + 1)), young: pick([0, 0, 1]),
    art1, art2, brutto: b1 + b2, brutto2: adults === 2 ? b2 : '', netto: Math.round(b1 * q(art1) + b2 * q(art2)),
    miete: pick([0, 300 + Math.round(rnd() * 1200)]), mietstufe: pick(['', '1', '3', '5', '7']),
    vermoegen: pick([0, 0, 3000, 9000, 14000, 40000, 70000]),
    gebJahr: pick(['', 1950, 1958, 1965, 1980, 1995, 2003]), heute: 2026.8,
    unterhaltFehlt: kids > 0 && rnd() < 0.4, unterhalt: kids > 0 && rnd() < 0.3 ? Math.round(rnd() * 600) : '',
    pflegegrad: pick(['', '', '', '1', '2', '3', '4', '5']),
    bhPerson: pick(['', '', 'erwNach25', 'erwVor25', 'minder']), gdb: pick(['', '30', '50', '60', '80', '100', 'H']),
    blind: pick(['', '', '', 'blind', 'hoch']), mzG: rnd() < 0.2,
    ausbildung: pick(['', '', '', 'ich', 'kind']), aufenthalt: rnd() < 0.08 ? 'asyl' : '',
    baby: pick(['', '', '', 'da']), egVor: pick(['', 0, 900, 2000]),
    bundesland: pick(['', 'BY', 'BY', 'NW']), bezug: {}
  };
}

for (let i = 0; i < N; i++) {
  const e = zufall();
  const a = ev(e);
  n++;
  // ---------- Widerspruchsfreiheit ----------
  if (Object.keys(a).filter((k) => k !== '_z').length !== KARTEN.length) melde('Anzahl der Karten', e, Object.keys(a).length);
  if (e.aufenthalt === 'asyl') ['ggeld', 'gsa', 'wohngeld', 'kiz'].forEach((id) => { if (a[id].level !== 'nein') melde('Asyl: ' + id + ' nicht ausgeschlossen', e, a[id].level); });
  if (a.ggeld.level === 'ja' && a.gsa.level === 'ja') melde('Jobcenter und Sozialamt beide wahrscheinlich', e, null);
  if (a.ggeld.level === 'ja' && e.kids > 0 && a.but.level !== 'ja') melde('Grundsicherungsgeld wahrscheinlich, aber Bildung und Teilhabe nicht', e, a.but.level);
  if ((a.wohngeld.level === 'ja' || a.kiz.level === 'ja') && e.kids > 0 && a.but.level === 'nein') melde('Wohngeld/Kinderzuschlag wahrscheinlich, aber Bildung und Teilhabe nein', e, null);
  if ((a.ggeld.level === 'ja' || a.ggeld.level === 'vielleicht') && (a.wohngeld.level !== 'nein' || a.kiz.level !== 'nein') && !a._z.includes('z.ggVsWg')) melde('Fehlender Hinweis Grundsicherungsgeld oder Wohngeld', e, null);
  if (a.kiz.level === 'ja' && a.kindergeld.level === 'nein') melde('Kinderzuschlag ohne Kindergeld', e, null);
  if (a.blh.level !== 'nein' && e.blind !== 'blind') melde('Blindenhilfe ohne Blindheit', e, null);
  KARTEN.forEach((id) => {
    const x = a[id];
    if (x.level === 'nein' && betrag(x)) melde('Betrag bei „unwahrscheinlich“: ' + id, e, x.tx);
    const b = betrag(x); if (b !== null && !(b >= 0)) melde('Negativer oder ungültiger Betrag: ' + id, e, b);
  });
  // ---------- Monotonie: mehr Einkommen ----------
  if (e.art1 !== 'ohne') {
    const m = { ...e, brutto: e.brutto + 200, netto: e.netto + (e.art1 === 'lohn' ? 144 : 200) };
    const b = ev(m);
    for (const id of ['ggeld', 'gsa']) {
      if (RANG[b[id].level] > RANG[a[id].level] && a[id].level !== 'na') melde('Mehr Einkommen, bessere Einstufung: ' + id, e, [a[id].level, b[id].level]);
      if (betrag(a[id]) !== null && betrag(b[id]) !== null && betrag(b[id]) > betrag(a[id]) + 10) melde('Mehr Einkommen, mehr Geld: ' + id, e, [betrag(a[id]), betrag(b[id])]);
    }
    for (const id of ['wohngeld', 'kiz']) {
      const unten = (x) => /einkoNiedrig|minEink/.test(x.hl);
      if (!unten(a[id]) && !unten(b[id]) && betrag(a[id]) !== null && betrag(b[id]) !== null && betrag(b[id]) > betrag(a[id]) + 10) melde('Mehr Einkommen, mehr Geld: ' + id, e, [betrag(a[id]), betrag(b[id])]);
      if (!unten(a[id]) && !unten(b[id]) && RANG[b[id].level] > RANG[a[id].level] && a[id].level !== 'na') melde('Mehr Einkommen, bessere Einstufung: ' + id, e, [a[id].level, b[id].level]);
    }
  }
  // ---------- Monotonie: ein Kind mehr, mehr Miete ----------
  const k = ev({ ...e, kids: e.kids + 1 });
  if (bedarf(a.ggeld) !== null && bedarf(k.ggeld) !== null && bedarf(k.ggeld) <= bedarf(a.ggeld)) melde('Ein Kind mehr, Bedarf nicht höher', e, [bedarf(a.ggeld), bedarf(k.ggeld)]);
  if (e.miete > 0) {
    const mm = ev({ ...e, miete: e.miete + 100 });
    if (bedarf(a.ggeld) !== null && bedarf(mm.ggeld) !== null && bedarf(mm.ggeld) < bedarf(a.ggeld)) melde('Mehr Miete, weniger Bedarf', e, null);
    if (betrag(a.wohngeld) !== null && betrag(mm.wohngeld) !== null && betrag(mm.wohngeld) + 10 < betrag(a.wohngeld)) melde('Mehr Miete, weniger Wohngeld', e, [betrag(a.wohngeld), betrag(mm.wohngeld)]);
  }
  // ---------- Monotonie: mehr Vermögen ----------
  const v = ev({ ...e, vermoegen: (Number(e.vermoegen) || 0) + 20000 });
  KARTEN.forEach((id) => { if (RANG[v[id].level] > RANG[a[id].level] && a[id].level !== 'na' && v[id].level !== 'na') melde('Mehr Vermögen, bessere Einstufung: ' + id, e, [a[id].level, v[id].level]); });
  // ---------- Monotonie: höherer GdB, höherer Pflegegrad ----------
  const GDB = ['30', '50', '60', '80', '100'];
  const gi = GDB.indexOf(e.gdb);
  if (gi >= 0 && gi < GDB.length - 1 && e.bhPerson) {
    const g = ev({ ...e, gdb: GDB[gi + 1] });
    const pb = (x) => { const t = x.tx.find((y) => y[0] === 'pausch.ja'); return t ? t[1].betrag.eur : 0; };
    if (pb(g.pausch) < pb(a.pausch)) melde('Höherer GdB, kleinerer Pauschbetrag', e, null);
    ['ausweis', 'pausch', 'zuzahl', 'wohngeld', 'wbs'].forEach((id) => { if (RANG[g[id].level] < RANG[a[id].level] && g[id].level !== 'na') melde('Höherer GdB, schlechtere Einstufung: ' + id, e, [a[id].level, g[id].level]); });
  }
  const PG = ['', '1', '2', '3', '4', '5'];
  const pi = PG.indexOf(e.pflegegrad);
  if (pi < PG.length - 1) {
    const p = ev({ ...e, pflegegrad: PG[pi + 1] });
    const geld = (x) => { const t = x.tx.find((y) => y[0] === 'pflege.pg2'); return t ? t[1].geld.eur : 0; };
    if (geld(p.pflege) < geld(a.pflege)) melde('Höherer Pflegegrad, weniger Pflegegeld', e, null);
    ['pflege', 'pflegeplus', 'hzp', 'zuzahl'].forEach((id) => { if (RANG[p[id].level] < RANG[a[id].level] && p[id].level !== 'na') melde('Höherer Pflegegrad, schlechtere Einstufung: ' + id, e, [a[id].level, p[id].level]); });
  }
}

const arten = Object.keys(fehler);
if (arten.length) {
  console.log('VERLETZTE EIGENSCHAFTEN (' + n + ' Haushalte):');
  arten.forEach((a) => console.log('\n- ' + a + ': ' + fehler[a].anzahl + 'x\n  Beispiel: ' + JSON.stringify(fehler[a].beispiel).slice(0, 900)));
  process.exit(1);
}
console.log('Eigenschaftstest bestanden: ' + n + ' Haushalte, Monotonie (Einkommen, Kinder, Miete, Vermögen, GdB, Pflegegrad) und Widerspruchsfreiheit der Karten');
