#!/usr/bin/env node
// Schnelltest für Agenten: nur die Oberflächentests, die von den eigenen Änderungen betroffen sind.
// Aufruf: npm run test:betroffen   (Vergleich: Arbeitskopie gegen den Abzweig von origin/main; anderer Vergleich: BASIS=origin/<zweig>)
// Ersetzt KEINE Prüfung: CI führt weiter alle Tests aus. Das Skript spart nur lokale Wartezeit vor dem Push.
// Auswahl (aus test/listen/oberflaeche.txt):
//  - geänderte Testdatei selbst,
//  - Tests, deren Quelltext den Namen eines geänderten Moduls nennt (src/fristen.js → alle Tests mit „fristen“),
//  - bei Änderungen an zentralen Dateien (app.js, template.html, Build, Hauptsprachdateien) zusätzlich ein fester Grundstock.
// Setzt voraus, dass dist/ gebaut ist (npm run test:vor-push baut vorher).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const sh = (c) => { try { return execSync(c, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } };
const basis = process.env.BASIS || sh('git merge-base HEAD origin/main') || 'origin/main';
const geaendert = [...new Set([
  ...sh('git diff --name-only ' + basis).split('\n'),
  ...sh('git ls-files --others --exclude-standard').split('\n'),
].filter(Boolean))];

const liste = fs.readFileSync(path.join(ROOT, 'test', 'listen', 'oberflaeche.txt'), 'utf8').split('\n').map((z) => z.trim()).filter((z) => z && !z.startsWith('#'));
const datei = (z) => (z.match(/node\s+(\S+)/) || [])[1];
const GRUNDSTOCK = ['test/dom-test.js', 'test/test-sicherheit.js', 'test/test-navigation.js', 'test/test-frisch-dom.js'];
const ZENTRAL = /^(src\/app\.js|src\/template\.html|src\/[^/]+\.css|scripts\/build\.js|src\/lang\/[^/]+\.json|src\/lang\/einfach\/[^/]+\.json)$/;

const wahl = new Set();
let zentral = false;
for (const f of geaendert) {
  if (liste.some((z) => datei(z) === f)) wahl.add(f);
  if (ZENTRAL.test(f)) zentral = true;
  const m = f.match(/^src\/(?:lang\/)?([a-z-]+)(?:\/|\.js$)/);
  if (m && !['app', 'template', 'lang', 'einfach', 'zusatz'].includes(m[1])) {
    const name = m[1];
    for (const z of liste) { const d = datei(z); if (d && fs.existsSync(path.join(ROOT, d)) && fs.readFileSync(path.join(ROOT, d), 'utf8').toLowerCase().includes(name)) wahl.add(d); }
  }
}
if (zentral) GRUNDSTOCK.forEach((d) => wahl.add(d));
const zeilen = liste.filter((z) => wahl.has(datei(z)));

console.log('Vergleich mit ' + basis.slice(0, 12) + ': ' + geaendert.length + ' geänderte Dateien.');
if (geaendert.some((f) => /^test\/(e2e-|a11y|app-test)/.test(f) || f.startsWith('app/'))) console.log('Hinweis: Browser-/App-Tests sind betroffen; die laufen nur in CI (Tests b).');
if (!zeilen.length) { console.log('Keine Oberflächentests betroffen.'); process.exit(0); }
const tmp = path.join(ROOT, 'test', 'listen', '.betroffen.txt');
fs.writeFileSync(tmp, zeilen.join('\n') + '\n');
console.log('Betroffene Oberflächentests (' + zeilen.length + ' von ' + liste.length + '): ' + zeilen.map(datei).map((d) => path.basename(d)).join(', '));
const r = spawnSync(process.execPath, [path.join(__dirname, 'tests.js'), '.betroffen', '-j', process.env.TESTS_PARALLEL || '2'], { cwd: ROOT, stdio: 'inherit' });
fs.rmSync(tmp, { force: true });
process.exit(r.status === null ? 1 : r.status);
