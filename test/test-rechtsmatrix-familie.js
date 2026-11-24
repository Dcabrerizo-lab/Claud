// Rechtsmatrix Familienleistungen (Vollprüfung 24.11.2026): Kindergeld, Kinderzuschlag, Unterhaltsvorschuss, Elterngeld, Mutterschaftsgeld,
// Bildung und Teilhabe, Sofortzuschlag. Fälle aus zwei unabhängigen Prüfungen (Claude: ids klein, Fable: „F-…“) mit amtlicher Quelle je Fall
// in test/rechtsmatrix/familie.json; Übersicht und Quellen in docs/rechtsmatrix/familie.md.
// Je Karte: status (Stufe; auchOk = weitere zulässige Stufen), betrag (± toleranz, gegen Schätzung bzw. Spanne der Karte),
// texteEnthalten / texteNicht (Textschlüssel). Exit 1 bei einer Abweichung.
'use strict';
const path = require('path');
const Rules = require(path.join(__dirname, '..', 'src', 'rules.js'));
const FAELLE = require('./rechtsmatrix/familie.json');
// Betrag einer Karte als Spanne [lo, hi] (Schätz-Texte; Elterngeld: Basiselterngeld)
function spanne(r) {
  const eg = r.tx.find((t) => t[0] === 'eg.ja'); if (eg) return [eg[1].basis.eur, eg[1].basis.eur];
  const s = r.tx.find((t) => /^schaetz\.(eins|spanne|bis|mind)$/.test(t[0]));
  if (!s) return null;
  if (s[0] === 'schaetz.eins') return [s[1].a.eur, s[1].a.eur];
  if (s[0] === 'schaetz.spanne') return [s[1].a.eur, s[1].b.eur];
  if (s[0] === 'schaetz.bis') return [0, s[1].b.eur];
  return [s[1].a.eur, Infinity];
}
let ok = 0, fehl = 0;
for (const f of FAELLE) {
  const res = Rules.evaluate(f.h).results;
  const probleme = [];
  for (const [id, soll] of Object.entries(f.erwartet)) {
    const r = res.find((x) => x.id === id);
    if (!r) { probleme.push(id + ': Karte fehlt'); continue; }
    if (soll.status && r.level !== soll.status && !(soll.auchOk || []).includes(r.level)) probleme.push(id + ': Stufe ' + r.level + ' statt ' + soll.status);
    if (typeof soll.betrag === 'number' && (r.level === 'ja' || r.level === 'vielleicht')) {
      const s = spanne(r), tol = soll.toleranz == null ? 10 : soll.toleranz;
      if (!s) probleme.push(id + ': kein Betrag, erwartet ' + soll.betrag);
      else if (soll.betrag < s[0] - tol || soll.betrag > s[1] + tol) probleme.push(id + ': Betrag ' + s.join('–') + ' statt ' + soll.betrag + ' (±' + tol + ')');
    }
    const keys = r.tx.map((t) => t[0]);
    (soll.texteEnthalten || []).forEach((k) => { if (!keys.includes(k)) probleme.push(id + ': Text ' + k + ' fehlt'); });
    (soll.texteNicht || []).forEach((k) => { if (keys.includes(k)) probleme.push(id + ': Text ' + k + ' sollte nicht stehen'); });
  }
  if (probleme.length) { fehl++; console.log('FAIL ' + f.id + ' – ' + f.beschreibung.slice(0, 100) + '\n    ' + probleme.join('\n    ')); } else ok++;
}
console.log(fehl ? fehl + ' von ' + FAELLE.length + ' Fällen der Rechtsmatrix Familie abweichend' : '[rechtsmatrix-familie] Rechtsmatrix Familie bestanden: ' + ok + ' Fälle');
process.exit(fehl ? 1 : 0);
