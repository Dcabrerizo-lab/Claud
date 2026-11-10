// Erzeugt das fertige Handy-Skript solo-anschriften.py (Liste der Behörden außerhalb Bayerns eingefügt).
// Aufruf: node tools/handy-skript-erzeugen.js [Zielordner]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DE = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'behoerden-deutschland.json'), 'utf8'));
const liste = Object.keys(DE.kreise).sort().map((ags) => ({ ags, name: DE.kreise[ags].name, web: DE.kreise[ags].web }));
const src = fs.readFileSync(path.join(__dirname, 'handy-anschriften.py'), 'utf8');
if (!src.includes('BEHOERDEN = []  # wird beim Erzeugen eingefügt')) throw new Error('Platzhalter fehlt');
const out = src.replace('BEHOERDEN = []  # wird beim Erzeugen eingefügt', 'BEHOERDEN = ' + JSON.stringify(liste, null, 0).replace(/\},\{/g, '},\n  {'));
const ziel = path.join(process.argv[2] || path.join(ROOT, 'dist'), 'solo-anschriften.py');
fs.mkdirSync(path.dirname(ziel), { recursive: true });
fs.writeFileSync(ziel, out);
console.log('Handy-Skript: ' + ziel + ' (' + liste.length + ' Behörden)');
