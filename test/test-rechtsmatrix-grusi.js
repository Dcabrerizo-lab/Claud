// Rechtsmatrix Grundsicherung, Wohnen, Ausbildung, Asyl (Vollprüfung 24.11.2026): feste Fälle mit Soll-Einstufung und Soll-Betrag
// nach der Rechtslage vom 24.11.2026 (Fälle: test/rechtsmatrix/grusi.json, Matrix: docs/rechtsmatrix/grusi.md).
// Quellen der Fälle: Prüfung „grundsicherung-wohnen“ (GW-*), Fable-Blindprüfung (FA-*, nur Karten dieses Gebiets), eigene Fälle (EX-*).
// Erwartung je Karte: status (ja | vielleicht | nein | na), auchOk (weitere zulässige Stufen), betrag ± toleranz (Schätzung der Karte),
// ohneBetrag (keine Schätzung). Aufruf: node test/test-rechtsmatrix-grusi.js
'use strict';
const Rules = require('../src/rules.js');
const FAELLE = require('./rechtsmatrix/grusi.json');

function spanne(r) {
  const s = r.tx.find((t) => /^schaetz\.(eins|spanne|bis|mind)$/.test(t[0]));
  if (!s) return null;
  if (s[0] === 'schaetz.eins') return [s[1].a.eur, s[1].a.eur];
  if (s[0] === 'schaetz.spanne') return [s[1].a.eur, s[1].b.eur];
  if (s[0] === 'schaetz.bis') return [0, s[1].b.eur];
  return [s[1].a.eur, Infinity];
}

let ok = 0, fehler = 0;
for (const f of FAELLE) {
  const res = Rules.evaluate(f.h).results;
  for (const [id, e] of Object.entries(f.erwartet)) {
    const r = res.find((x) => x.id === id);
    const p = [];
    if (!r) p.push('Karte fehlt');
    else {
      if (r.level !== e.status && !(e.auchOk || []).includes(r.level)) p.push(`Status ${r.level} statt ${e.status}`);
      // Texte (seit 26.11.2026): tx = müssen vorkommen, txNicht = dürfen nicht vorkommen
      const keys = r.tx.map((t) => t[0]);
      (e.tx || []).forEach((k) => { if (keys.indexOf(k) < 0) p.push(`Text ${k} fehlt (${keys.join(', ')})`); });
      (e.txNicht || []).forEach((k) => { if (keys.indexOf(k) >= 0) p.push(`Text ${k} gezeigt, darf nicht`); });
      const s = spanne(r);
      if (e.ohneBetrag && s) p.push('Betrag gezeigt, erwartet keiner');
      if (e.betrag != null && (r.level === 'ja' || r.level === 'vielleicht')) {
        const tol = e.toleranz == null ? 10 : e.toleranz;
        if (!s) p.push(`kein Betrag, erwartet ${e.betrag}`);
        else if (e.betrag < s[0] - tol || e.betrag > s[1] + tol) p.push(`Betrag ${s[0] === s[1] ? s[0] : s[0] + '–' + s[1]} statt ${e.betrag} (±${tol})`);
      }
    }
    if (p.length) { fehler++; console.log(`FEHLER ${f.id} ${id}: ${p.join('; ')} – ${f.beschreibung}`); } else ok++;
  }
}
console.log(`[rechtsmatrix-grusi] ${FAELLE.length} Fälle, ${ok + fehler} Prüfungen: ${ok} erfüllt, ${fehler} nicht erfüllt`);
process.exit(fehler ? 1 : 0);
