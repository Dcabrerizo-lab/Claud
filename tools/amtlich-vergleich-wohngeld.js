// Differenztest Wohngeld: rechnet die Haushalte aus dem Lauf gegen den amtlichen Wohngeldrechner (Workflow
// .github/workflows/amtlich-wohngeld.yml, Artefakt amtlich-wohngeld.json) mit SoLo nach und listet jede Abweichung > 1 €.
// SoLo wird über die echte App-Rechnung (evaluate in src/rules.js) gerechnet. Einzige Änderung: die Anzeige-Rundung auf 10 €
// (r10) wird beim Laden durch die Rundung nach Anlage 3 Schritt 3 WoGG ersetzt (ab 0,50 € auf, sonst ab; gesetze-im-internet.de,
// Abruf 21.11.2026), damit auf den Euro verglichen werden kann. Verglichen wird im Modus 'hoch' mit SoLos oberer Schätzung
// (größter Pauschalabzug nach § 16 WoGG), im Modus 'klein' mit der unteren (je 10 %). Wohngeld unter 10 € wird nicht gezahlt
// (§ 21 Nr. 1 WoGG): amtlich unter 10 € und SoLo „keine Schätzung“ gelten als gleich.
// Aufruf: node tools/amtlich-vergleich-wohngeld.js <amtlich-wohngeld.json> [--md <bericht.md>] [--json <abweichungen.json>]
const fs = require('fs'), path = require('path');
const F = require('./amtliche-rechner/wg-differenz-faelle.js');
const datei = process.argv[2];
if (!datei) { console.log('Aufruf: node tools/amtlich-vergleich-wohngeld.js <amtlich-wohngeld.json> [--md bericht.md]'); process.exit(2); }
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

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

const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
const liste = Array.isArray(daten) ? daten : daten.faelle;
let gleich = 0, offen = 0; const abw = [];
for (const x of liste) {
  if (x.amtlich === null || x.amtlich === undefined) { offen++; continue; }
  const s = solo(x.f);
  const amt = x.amtlich < 10 ? 0 : x.amtlich, so = s.betrag < 10 ? 0 : s.betrag;
  const d = so - amt;
  if (Math.abs(d) <= 1) gleich++; else abw.push({ nr: x.f.nr, diff: d, solo: so, amtlich: x.amtlich, soloStufe: s.level, f: x.f, eingabe: x.eingabe });
}
abw.sort((p, q) => Math.abs(q.diff) - Math.abs(p.diff));
const n = liste.length - offen;
console.log('Wohngeld-Differenztest: ' + liste.length + ' Haushalte, verglichen ' + n + ', gleich (±1 €) ' + gleich + ', ABWEICHUNG ' + abw.length + ', amtlich ohne Ergebnis ' + offen);
const kurz = (f) => f.adults + ' Erw., ' + f.kids + ' Ki., ' + f.young + ' jung, St. ' + f.stufe + ', ' + f.p.map((p) => p.art + ' ' + p.b).join(' + ') +
  (f.kindEink.length ? ', Minijob Kind ' + f.kindEink.join('+') : '') + (f.unterhaltKind ? ', UH Kind ' + f.unterhaltKind : '') + (f.uz ? ', zahlt UH ' + f.uz : '') +
  (f.gdb100 ? ', GdB 100' : '') + (f.bhWeitere ? ', +1 SB' : '') + (f.gr ? ', Grundrente' : '') + ', kalt ' + f.kalt + (f.heiz ? ', Heiz ' + f.heiz : ', Heiz-Komp.') + ', ' + f.modus;
abw.forEach((a) => console.log('  ABW Nr. ' + a.nr + ': SoLo ' + a.solo + ' €, amtlich ' + a.amtlich + ' € (' + (a.diff > 0 ? '+' : '') + a.diff + ') | ' + kurz(a.f)));
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(abw, null, 1));
if (arg('--md')) {
  const z = ['# Wohngeld-Differenztest SoLo gegen amtlichen Wohngeldrechner', '', '| Haushalte | verglichen | gleich (±1 €) | Abweichung | ohne amtliches Ergebnis |', '|---|---|---|---|---|',
    '| ' + liste.length + ' | ' + n + ' | ' + gleich + ' | ' + abw.length + ' | ' + offen + ' |', '', '| Nr. | SoLo € | amtlich € | Diff | Haushalt |', '|---|---|---|---|---|'];
  abw.forEach((a) => z.push('| ' + a.nr + ' | ' + a.solo + ' | ' + a.amtlich + ' | ' + a.diff + ' | ' + kurz(a.f) + ' |'));
  fs.writeFileSync(arg('--md'), z.join('\n') + '\n');
}
module.exports = { solo, kurz };
process.exitCode = abw.length ? 1 : 0;
