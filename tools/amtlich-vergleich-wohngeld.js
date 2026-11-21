// Differenztest Wohngeld: rechnet die Haushalte aus dem Lauf gegen den amtlichen Wohngeldrechner (Workflow
// .github/workflows/amtlich-wohngeld.yml, Artefakt amtlich-wohngeld.json) mit SoLo nach und listet jede Abweichung > 1 €.
// SoLo wird über die echte App-Rechnung (evaluate in src/rules.js) gerechnet. Einzige Änderung: die Anzeige-Rundung auf 10 €
// (r10) wird beim Laden durch die Rundung nach Anlage 3 Schritt 3 WoGG ersetzt (ab 0,50 € auf, sonst ab; gesetze-im-internet.de,
// Abruf 21.11.2026), damit auf den Euro verglichen werden kann. Verglichen wird im Modus 'hoch' mit SoLos oberer Schätzung
// (größter Pauschalabzug nach § 16 WoGG), im Modus 'klein' mit der unteren (je 10 %). Wohngeld unter 10 € wird nicht gezahlt
// (§ 21 Nr. 1 WoGG): amtlich unter 10 € und SoLo „keine Schätzung“ gelten als gleich.
// Aufruf: node tools/amtlich-vergleich-wohngeld.js <amtlich-wohngeld.json> [--md <bericht.md>] [--json <abweichungen.json>]
const fs = require('fs');
const { solo, kurz, kindGrenze } = require('./amtlich-vergleich-wohngeld-kern.js');
const datei = process.argv[2];
if (!datei) { console.log('Aufruf: node tools/amtlich-vergleich-wohngeld.js <amtlich-wohngeld.json> [--md bericht.md]'); process.exit(2); }
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
const liste = Array.isArray(daten) ? daten : daten.faelle;
let gleich = 0, offen = 0, spanne = 0; const abw = [];
for (const x of liste) {
  if (x.amtlich === null || x.amtlich === undefined) { offen++; continue; }
  const s = solo(x.f);
  const amt = x.amtlich < 10 ? 0 : x.amtlich, so = s.betrag < 10 ? 0 : s.betrag;
  const d = so - amt, g = kindGrenze(x.f);
  if (Math.abs(d) <= 1) gleich++;
  else if ((g === 'oben' && d > 0) || (g === 'unten' && d < 0)) spanne++;
  else abw.push({ nr: x.f.nr, diff: d, solo: so, amtlich: x.amtlich, soloStufe: s.level, f: x.f, eingabe: x.eingabe });
}
abw.sort((p, q) => Math.abs(q.diff) - Math.abs(p.diff));
const n = liste.length - offen;
console.log('Wohngeld-Differenztest: ' + liste.length + ' Haushalte, verglichen ' + n + ', gleich (±1 €) ' + gleich + ', innerhalb der SoLo-Grenze (Zahl verdienender Kinder unbekannt) ' + spanne + ', ABWEICHUNG ' + abw.length + ', amtlich ohne Ergebnis ' + offen);
abw.forEach((a) => console.log('  ABW Nr. ' + a.nr + ': SoLo ' + a.solo + ' €, amtlich ' + a.amtlich + ' € (' + (a.diff > 0 ? '+' : '') + a.diff + ') | ' + kurz(a.f)));
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(abw, null, 1));
if (arg('--md')) {
  const z = ['# Wohngeld-Differenztest SoLo gegen amtlichen Wohngeldrechner', '', '| Haushalte | verglichen | gleich (±1 €) | innerhalb der Grenze (Kinder-Einkommen) | Abweichung | ohne amtliches Ergebnis |', '|---|---|---|---|---|---|',
    '| ' + liste.length + ' | ' + n + ' | ' + gleich + ' | ' + spanne + ' | ' + abw.length + ' | ' + offen + ' |', '', '| Nr. | SoLo € | amtlich € | Diff | Haushalt |', '|---|---|---|---|---|'];
  abw.forEach((a) => z.push('| ' + a.nr + ' | ' + a.solo + ' | ' + a.amtlich + ' | ' + a.diff + ' | ' + kurz(a.f) + ' |'));
  fs.writeFileSync(arg('--md'), z.join('\n') + '\n');
}
process.exitCode = abw.length ? 1 : 0;
