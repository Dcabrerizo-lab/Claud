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
// ---------- Basiselterngeld oder ElterngeldPlus (Frage je Person, Auftrag David 25.11.2026) ----------
// Unabhängige Rechnung nach § 10 BEEG (https://www.gesetze-im-internet.de/beeg/__10.html, Abruf 25.11.2026):
// Wohngeld/BAföG (Abs. 1, 3, 4): 300 € bzw. 150 € (Plus), je Kind der Geburt; SGB II/XII, KiZ (Abs. 5): bis 300 € bzw. 150 €,
// höchstens Einkommen vor der Geburt (Netto − 102,50 € Pauschbetrag), nicht vervielfacht. „Weiß ich nicht“: Spanne.
{
  const D = (o) => Rules.derive(Object.assign({ adults: 1, baby: 'da', egVor: 1500, miete: 600, heute: 2026.9 }, o));
  const je = (o, i) => D(o).egFreiJe[i || 0];
  const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const C = [
    ['Basis, ein Kind', je({ art1: 'eg', brutto: 936, netto: 936, egArt1: 'basis' }), { sgbLo: 300, sgbHi: 300, wgLo: 300, wgHi: 300 }],
    ['Plus, ein Kind', je({ art1: 'eg', brutto: 468, netto: 468, egArt1: 'plus' }), { sgbLo: 150, sgbHi: 150, wgLo: 150, wgHi: 150 }],
    ['weiß nicht, 468 € (offen)', je({ art1: 'eg', brutto: 468, netto: 468, egArt1: '' }), { sgbLo: 150, sgbHi: 300, wgLo: 150, wgHi: 300 }],
    ['unbekannter Wert = weiß nicht', je({ art1: 'eg', brutto: 468, netto: 468, egArt1: 'xyz' }), { sgbLo: 150, sgbHi: 300, wgLo: 150, wgHi: 300 }],
    ['Zwillinge Basis: Wohngeld 600, SGB 300', je({ art1: 'eg', brutto: 1200, netto: 1200, egKinder: '2', egArt1: 'basis' }), { sgbLo: 300, sgbHi: 300, wgLo: 600, wgHi: 600 }],
    ['Drillinge Plus: Wohngeld 450, SGB 150', je({ art1: 'eg', brutto: 800, netto: 800, egKinder: '3', egArt1: 'plus' }), { sgbLo: 150, sgbHi: 150, wgLo: 450, wgHi: 450 }],
    ['Basis, Netto vor der Geburt 300 €: SGB höchstens 197,50', je({ art1: 'eg', brutto: 400, netto: 400, egVor: 300, egArt1: 'basis' }), { sgbLo: 197.5, sgbHi: 197.5, wgLo: 300, wgHi: 300 }],
    ['Plus, Netto vor der Geburt 200 €: SGB höchstens 97,50', je({ art1: 'eg', brutto: 400, netto: 400, egVor: 200, egArt1: 'plus' }), { sgbLo: 97.5, sgbHi: 97.5, wgLo: 150, wgHi: 150 }],
    ['Paar: Person 1 Plus, Person 2 Basis (Liste)', D({ adults: 2, einkommen: [{ art: 'eg', b: 600, p: 1 }, { art: 'eg', b: 700, p: 2 }], egArt1: 'plus', egArt2: 'basis' }).egFreiJe,
      [{ sgbLo: 150, sgbHi: 150, wgLo: 150, wgHi: 150 }, { sgbLo: 300, sgbHi: 300, wgLo: 300, wgHi: 300 }]],
    ['Paar ohne Liste: Person 2 Plus', D({ adults: 2, art1: 'lohn', art2: 'eg', brutto: 2500, brutto2: 500, netto: 2200, egArt2: 'plus' }).egFreiJe[1], { sgbLo: 150, sgbHi: 150, wgLo: 150, wgHi: 150 }],
    ['Allein: Angabe für Person 2 zählt nicht', D({ art1: 'eg', brutto: 468, netto: 468, egArt2: 'basis' }).egFreiJe[0], { sgbLo: 150, sgbHi: 300, wgLo: 150, wgHi: 300 }]
  ];
  C.forEach(([name, ist, soll]) => { if (gleich(ist, soll)) ok++; else { fehl++; console.log('FAIL egArt ' + name + ': ist ' + JSON.stringify(ist) + ', soll ' + JSON.stringify(soll)); } });
  // Bekannte Art: keine offene Spanne mehr (egFreiOffen 0), Summe wie Einzelwert
  const h = D({ art1: 'eg', brutto: 468, netto: 468, egArt1: 'basis' });
  if (h.egFreiOffen === 0 && h.egFreiSGB === 300) ok++; else { fehl++; console.log('FAIL egArt Summe/Offen: ' + h.egFreiSGB + ' / ' + h.egFreiOffen); }
}
console.log(fehl ? fehl + ' von ' + FAELLE.length + ' Fällen der Rechtsmatrix Familie abweichend' : '[rechtsmatrix-familie] Rechtsmatrix Familie bestanden: ' + ok + ' Fälle');
process.exit(fehl ? 1 : 0);
