// Testhilfe: Die Regeln liefern Beträge als Zahlen ({ eur: 1140 }), die Anzeige formatiert sie je Sprache.
// Die Regeltests vergleichen mit deutschen Beträgen („1.140 €“). Dieser Wrapper formatiert die Parameter
// genau so wie die App (src/fmt.js, Sprache de), ändert aber sonst nichts am Ergebnis.
'use strict';
const Rules = require('../src/rules.js');
const Fmt = require('../src/fmt.js');

const fmtVal = (v) => (v && typeof v === 'object' && 'eur' in v ? Fmt.euro(v.eur, 'de').replace(/ | /g, ' ') : v);
const fmtParams = (p) => (p && typeof p === 'object' ? Object.fromEntries(Object.entries(p).map(([k, v]) => [k, fmtVal(v)])) : p);
const fmtTx = (tx) => tx.map(([k, p]) => (p === undefined ? [k] : [k, fmtParams(p)]));

function evaluate(inp) {
  const out = Rules.evaluate(inp);
  return { ...out, results: out.results.map((r) => ({ ...r, tx: fmtTx(r.tx) })), zusammen: fmtTx(out.zusammen) };
}

module.exports = { ...Rules, evaluate, raw: Rules };
