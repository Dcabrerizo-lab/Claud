// SoLo-Seite des großen Abgleichs: übersetzt einen Fall (wie an den amtlichen Rechner geschickt) in SoLo-Eingaben.
// Gemeinsam genutzt von gross.js (Grenzfälle suchen) und gross-auswerten.js (vergleichen).
const R = require('../../src/rules.js');
const HEUTE = 2026.9;
function wg(f) {
  const inp = { adults: f.adults, kids: f.kids, kidsU6: 0, art1: f.art, art2: f.art, brutto: f.b1 + f.b2, brutto2: f.b2, netto: 9000, miete: f.warm, heizkosten: f.heiz || '', mietstufe: String(f.stufe), vermoegen: 0, gebJahr: f.art === 'rente' ? 1955 : 1985, bezug: {}, heute: HEUTE };
  const w = R.evaluate(inp).results.find((r) => r.id === 'wohngeld');
  const sp = w.tx.find((t) => /^schaetz\./.test(t[0]));
  return { level: w.level, betrag: !sp ? null : sp[1].b ? sp[1].b.eur : sp[1].a.eur };
}
function kiz(f) {
  const nk = f.alter.length, pB = f.partner ? f.pBrutto || 0 : 0, pN = f.partner ? f.pNetto || 0 : 0;
  const inp = { adults: f.partner ? 2 : 1, kids: nk, kidsU6: f.alter.filter((a) => a < 6).length, kids14: f.alter.filter((a) => a >= 14).length, art1: 'lohn', art2: pB > 0 ? 'lohn' : 'ohne', brutto: f.brutto + pB, brutto2: pB, netto: f.netto + pN, unterhalt: (f.uh || 0) * nk, miete: f.miete, mietstufe: '3', vermoegen: 0, gebJahr: 1988, bezug: { kindergeld: true }, heute: HEUTE };
  return R.evaluate(inp).results.find((r) => r.id === 'kiz').level;
}
function eg(f) {
  const e = R.evaluate({ baby: 'bald', egVor: f.vorher, art1: 'lohn', brutto: 2000, netto: 1500, heute: HEUTE, kids: f.geschwister ? 2 : 0, kidsU6: f.geschwister ? 2 : 0 }).results.find((r) => r.id === 'elterngeld');
  return e.tx[0][1].basis.eur;
}
module.exports = { wg, kiz, eg };
