#!/usr/bin/env node
// Testlisten ausführen: node tools/tests.js <liste> [<liste> …] [-j N] [--alle]
//  - Listen stehen in test/listen/<liste>.txt (eine Zeile je Test, z. B. „node test/test-x.js“ oder „HEUTE=2027.05 node test/y.js 8000“).
//    Grund: Die Testlisten standen als eine lange Zeile in package.json; jeder neue Test eines parallelen PRs gab dort einen Konflikt.
//    Zeilenlisten werden per .gitattributes (merge=union) konfliktfrei zusammengeführt; doppelte Zeilen laufen nur einmal.
//  - -j N: höchstens N Tests gleichzeitig (Standard 1 = nacheinander wie früher, Ausgabe live, Abbruch beim ersten Fehler).
//    Mit N > 1 laufen alle Tests (auch nach einem Fehler), die Ausgabe je Test steht am Stück, am Ende eine Tabelle.
//    CI nutzt -j 3 (mehr nicht: test-jahreswechsel.js braucht allein über 3 GB Speicher).
//  - Rot (Rückgabe 1), wenn ein Test nicht mit 0 endet, abstürzt oder vom System beendet wird (z. B. Speicher, Signal),
//    wenn eine Liste eine fehlende Datei nennt oder eine Datei test/test-*.js in KEINER Liste steht (vergessener Test).
//  - --alle: auch nacheinander nach einem Fehler weitermachen.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LISTEN = path.join(ROOT, 'test', 'listen');
const args = process.argv.slice(2);
let N = Number(process.env.TESTS_PARALLEL) || 1, alle = false;
const namen = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-j') N = Number(args[++i]);
  else if (args[i] === '--alle') alle = true;
  else namen.push(args[i]);
}
if (!namen.length || !(N >= 1)) { console.log('Aufruf: node tools/tests.js <liste> [<liste> …] [-j N] [--alle]'); process.exit(2); }

const lies = (name) => {
  const f = path.join(LISTEN, name + '.txt');
  if (!fs.existsSync(f)) { console.log('FEHLER: Testliste fehlt: test/listen/' + name + '.txt'); process.exit(1); }
  return fs.readFileSync(f, 'utf8').split('\n').map((z) => z.trim()).filter((z) => z && !z.startsWith('#'));
};
const ZEILE = /^((?:[A-Z_][A-Z0-9_]*=\S+\s+)*)node\s+(\S+)((?:\s+\S+)*)$/;
const zerlege = (z) => {
  const m = ZEILE.exec(z);
  if (!m) return null;
  const env = Object.fromEntries(m[1].trim().split(/\s+/).filter(Boolean).map((e) => [e.slice(0, e.indexOf('=')), e.slice(e.indexOf('=') + 1)]));
  return { zeile: z, env, datei: m[2], argv: m[3].trim().split(/\s+/).filter(Boolean) };
};

// Wächter 1: jede Zeile hat die Form „[VAR=wert …] node <datei> [argumente]“ und die Datei gibt es
const fehlerListe = [];
const tests = [];
const gesehen = new Set();
for (const name of namen) {
  for (const z of lies(name)) {
    const t = zerlege(z);
    if (!t) { fehlerListe.push('test/listen/' + name + '.txt: Zeile nicht lesbar: „' + z + '“ (erlaubt: [VAR=wert …] node <datei> [argumente])'); continue; }
    if (!fs.existsSync(path.join(ROOT, t.datei))) { fehlerListe.push('test/listen/' + name + '.txt: Datei fehlt: ' + t.datei); continue; }
    if (gesehen.has(z)) continue; // doppelte Zeile (z. B. nach merge=union) nur einmal
    gesehen.add(z); tests.push(t);
  }
}
// Wächter 2: jede Datei test/test-*.js und test/dom-test.js steht in irgendeiner Liste (oder in ausgenommen.txt)
const alleListen = fs.readdirSync(LISTEN).filter((f) => f.endsWith('.txt'));
const genannt = new Set();
for (const f of alleListen) for (const z of lies(f.replace(/\.txt$/, ''))) { const t = zerlege(z) || { datei: z.split(/\s+/)[0] }; genannt.add(path.normalize(t.datei)); }
for (const f of fs.readdirSync(path.join(ROOT, 'test'))) {
  if (!/^test-.*\.js$|^dom-test\.js$/.test(f)) continue;
  if (!genannt.has(path.normalize('test/' + f))) fehlerListe.push('test/' + f + ' steht in keiner Testliste (test/listen/*.txt). Eintragen oder mit Grund in test/listen/ausgenommen.txt.');
}
// Wächter 3: package.json ruft die Listen auf (nach einem Konflikt darf dort keine lange Testkette zurückkommen)
const sk = require(path.join(ROOT, 'package.json')).scripts;
for (const [k, soll] of [['test:rules', 'node tools/tests.js regeln'], ['test:dom', 'node tools/tests.js oberflaeche']]) {
  if (sk[k] !== soll) fehlerListe.push('package.json „' + k + '“ muss „' + soll + '“ lauten. Neue Tests als eigene Zeile in test/listen/*.txt eintragen, nicht in package.json.');
}
if (fehlerListe.length) { console.log('FEHLER in den Testlisten:\n- ' + fehlerListe.join('\n- ')); process.exit(1); }

// Lange Tests zuerst starten (nur Reihenfolge, bei -j > 1 kürzere Gesamtzeit). Gemessen in CI am 21.11.2026.
const LANG = ['test-jahreswechsel.js', 'test-anzeige.js', 'dom-test.js', 'test-mietgrenze-dom.js', 'test-altstaende.js', 'test-vorgaenge-app.js',
  'test-schritte.js', 'test-strict.js', 'test-weitergabe-boese.js', 'test-fristen-dom.js', 'test-raster.js'];
// Gemessene Spitzen (lokal, 21.11.2026): test-anzeige.js 3,8 GB, test-jahreswechsel.js 3,2 GB, alle anderen unter 1,8 GB.
const SPEICHER = ['test-jahreswechsel.js', 'test-anzeige.js'];
const rang = (t) => { const i = LANG.indexOf(path.basename(t.datei)); return i < 0 ? LANG.length : i; };
const reihe = N > 1 ? [...tests].sort((a, b) => rang(a) - rang(b)) : tests;

const ergebnisse = [];
const lauf = (t) => new Promise((fertig) => {
  const start = Date.now();
  const live = N === 1;
  const p = spawn(process.execPath, [t.datei, ...t.argv], { cwd: ROOT, env: { ...process.env, ...t.env }, stdio: live ? 'inherit' : ['ignore', 'pipe', 'pipe'] });
  let aus = '';
  if (!live) { p.stdout.on('data', (d) => { aus += d; }); p.stderr.on('data', (d) => { aus += d; }); }
  p.on('error', (e) => { aus += '\nStart fehlgeschlagen: ' + e.message; });
  p.on('close', (code, signal) => {
    const r = { zeile: t.zeile, s: (Date.now() - start) / 1000, ok: code === 0 && !signal, code, signal };
    ergebnisse.push(r);
    if (!live) process.stdout.write('\n===== ' + (r.ok ? 'bestanden' : 'ROT') + ' (' + r.s.toFixed(1) + ' s): ' + t.zeile + ' =====\n' + aus + (aus.endsWith('\n') ? '' : '\n'));
    else if (!r.ok) console.log('===== ROT: ' + t.zeile + (signal ? ' (beendet durch ' + signal + ')' : ' (Rückgabe ' + code + ')'));
    fertig(r);
  });
});

(async () => {
  const t0 = Date.now();
  let abbruch = false;
  if (N === 1) {
    for (const t of reihe) { const r = await lauf(t); if (!r.ok && !alle) { abbruch = true; break; } }
  } else {
    // Speicherhungrige Tests (je über 3 GB) nie gleichzeitig, damit kein Test vom System beendet wird
    const offen = [...reihe], laufend = new Set();
    let schwerLaeuft = false;
    await new Promise((alleFertig) => {
      const weiter = () => {
        while (laufend.size < N) {
          const k = offen.findIndex((t) => !(schwerLaeuft && SPEICHER.includes(path.basename(t.datei))));
          if (k < 0) break;
          const t = offen.splice(k, 1)[0], schwer = SPEICHER.includes(path.basename(t.datei));
          if (schwer) schwerLaeuft = true;
          const p = lauf(t).then(() => { laufend.delete(p); if (schwer) schwerLaeuft = false; weiter(); });
          laufend.add(p);
        }
        if (!offen.length && !laufend.size) alleFertig();
      };
      weiter();
    });
  }
  const rot = ergebnisse.filter((r) => !r.ok);
  if (N > 1 || rot.length || process.env.CI) {
    console.log('\nTest                                                     Sek.  Ergebnis');
    for (const r of [...ergebnisse].sort((a, b) => b.s - a.s)) console.log(r.zeile.padEnd(55).slice(0, 55) + ' ' + r.s.toFixed(1).padStart(6) + '  ' + (r.ok ? 'bestanden' : 'ROT' + (r.signal ? ' (' + r.signal + ')' : ' (' + r.code + ')')));
  }
  const gesamt = ((Date.now() - t0) / 1000).toFixed(0);
  if (!abbruch && ergebnisse.length !== tests.length) { console.log('FEHLER: ' + ergebnisse.length + ' von ' + tests.length + ' Tests gelaufen'); process.exit(1); }
  if (rot.length) { console.log('\n' + rot.length + ' von ' + tests.length + ' Tests ROT (' + namen.join(', ') + ', ' + gesamt + ' s)' + (abbruch ? ' – nach dem ersten Fehler abgebrochen (--alle: weitermachen)' : '') + ':\n- ' + rot.map((r) => r.zeile).join('\n- ')); process.exit(1); }
  console.log('\nAlle ' + tests.length + ' Tests bestanden (' + namen.join(', ') + ', ' + gesamt + ' s, ' + N + ' gleichzeitig)');
})();
