// Kern des Wohngeld-Differenztests: SoLo auf den Euro rechnen (für tools/amtlich-vergleich-wohngeld.js und test/test-amtlich-wohngeld.js).
// SoLo wird über die echte App-Rechnung (evaluate in src/rules.js) gerechnet. Einzige Änderung: die Anzeige-Rundung auf 10 € (r10) wird
// beim Laden durch die Rundung nach Anlage 3 Schritt 3 WoGG ersetzt (ab 0,50 € auf, sonst ab; gesetze-im-internet.de, Abruf 21.11.2026).
const fs = require('fs'), path = require('path');
const F = require('./amtliche-rechner/wg-differenz-faelle.js');
function ladeSolo() {
  const src = fs.readFileSync(path.join(__dirname, '../src/rules.js'), 'utf8');
  const alt = 'const r10 = (x) => Math.round(x / 10) * 10;';
  if (src.indexOf(alt) < 0) throw new Error('r10 in src/rules.js nicht gefunden – Vergleichsskript anpassen');
  const m = { exports: {} };
  new Function('module', src.replace(alt, 'const r10 = (x) => Math.round(x);'))(m); // eslint-disable-line no-new-func
  return m.exports;
}
const R = ladeSolo();

function solo(f) {
  const w = R.evaluate(F.soloEingabe(f)).results.find((r) => r.id === 'wohngeld');
  const sp = w.tx.find((t) => /^schaetz\./.test(t[0]));
  let a = null, b = null;
  if (sp) { b = sp[1].b ? sp[1].b.eur : sp[1].a.eur; a = sp[1].a ? sp[1].a.eur : null; } // 'bis': untere Schätzung < 10 €
  const betrag = f.modus === 'hoch' ? b : a;
  return { level: w.level, hl: w.hl, betrag: betrag === null ? 0 : betrag, a, b };
}

// Einkommen von Kindern: SoLo kennt nur die Summe, nicht wie viele Kinder verdienen (§ 17 Nr. 4 WoGG: Freibetrag je Kind).
// Obere Schätzung = verteilt auf alle Kinder (ab 6) und jungen Erwachsenen, untere = ein verdienendes Kind. Genau vergleichbar ist
// daher nur 'hoch' mit allen Kindern verdienend und 'klein' mit einem verdienenden Kind; sonst muss amtlich innerhalb der Grenze liegen
// ('hoch': amtlich höchstens SoLo, 'klein': amtlich mindestens SoLo).
const kindGrenze = (f) => {
  if (!f.kindEink || !f.kindEink.length) return null;
  if (f.modus === 'hoch') return f.kindEink.length >= f.kids + f.young ? null : 'oben';
  return f.kindEink.length === 1 ? null : 'unten';
};
const kurz = (f) => f.adults + ' Erw., ' + f.kids + ' Ki., ' + f.young + ' jung, St. ' + f.stufe + ', ' + f.p.map((p) => p.art + ' ' + p.b).join(' + ') +
  (f.kindEink.length ? ', Minijob Kind ' + f.kindEink.join('+') : '') + (f.unterhaltKind ? ', UH Kind ' + f.unterhaltKind : '') + (f.uz ? ', zahlt UH ' + f.uz : '') +
  (f.gdb100 ? ', GdB 100' : '') + (f.bhWeitere ? ', +1 SB' : '') + (f.gr ? ', Grundrente' : '') + ', kalt ' + f.kalt + (f.heiz ? ', Heiz ' + f.heiz : ', Heiz-Komp.') + ', ' + f.modus;
module.exports = { solo, kurz, kindGrenze, R };
