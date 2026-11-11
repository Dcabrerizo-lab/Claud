// Übernimmt die Anschriften aus solo-anschriften.json (Ergebnis des Handy-Skripts) nach content/behoerden-deutschland.json.
// Eine Anschrift wird nur übernommen, wenn ihre Postleitzahl im selben Kreis liegt wie die Behörde (Prüfung über die PLZ-Daten).
// Aufruf: node tools/anschriften-uebernehmen.js pfad/zu/solo-anschriften.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const datei = process.argv[2];
if (!datei) { console.error('Aufruf: node tools/anschriften-uebernehmen.js solo-anschriften.json'); process.exit(1); }
const E = JSON.parse(fs.readFileSync(datei, 'utf8'));
const DEF = path.join(ROOT, 'content', 'behoerden-deutschland.json');
const DE = JSON.parse(fs.readFileSync(DEF, 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'plz-data.json'), 'utf8'));
const kreiseDerPlz = (plz) => new Set((P.plz[plz] || []).filter((e) => e[1] >= 0).map((e) => P.kreise[e[1]].ags));
let ok = 0, ohne = 0, falsch = 0, nImp = 0, nWiki = 0;
const bericht = [];
Object.keys(DE.kreise).forEach((ags) => {
  const e = E[ags];
  const passt = (l) => (l || []).find((k) => /^\d{5}$/.test(k.plz) && kreiseDerPlz(k.plz).has(ags) && k.zeilen.length === 2 && k.zeilen[0].length >= 4 && k.zeilen[0].length <= 80);
  if (!e || (!(e.kandidaten || []).length && !(e.wiki_kandidaten || []).length)) { ohne++; return; }
  // Vorrang: Impressum der Behörde; sonst Infokasten des Wikipedia-Artikels (Anschrift der Kreis-/Stadtverwaltung)
  const ausImpressum = passt(e.kandidaten), gut = ausImpressum || passt(e.wiki_kandidaten);
  if (!gut) { falsch++; bericht.push(ags + ' ' + DE.kreise[ags].name + ': keine Anschrift im eigenen Kreis (' + (e.kandidaten || []).concat(e.wiki_kandidaten || []).map((k) => k.zeilen.join(', ')).join(' | ') + ')'); return; }
  DE.kreise[ags].anschrift = gut.zeilen;
  DE.kreise[ags].quelle = ausImpressum ? (e.impressum || e.web) : e.wikipedia;
  DE.kreise[ags].quelleArt = ausImpressum ? 'impressum' : 'wikipedia';
  if (ausImpressum) nImp++; else nWiki++;
  DE.kreise[ags].stand = String(e.zeit || '').slice(0, 10).split('-').reverse().map(Number).join('.');
  ok++;
});
DE.stand = DE.stand.replace(/; Anschriften außerhalb Bayerns noch nicht hinterlegt$/, '') + '; Anschriften laut Impressum der Behörden, sonst laut Wikipedia (Handy-Abruf), nur wenn die PLZ im eigenen Kreis liegt';
fs.writeFileSync(DEF, JSON.stringify(DE, null, 1));
console.log(`Anschriften übernommen: ${ok} (Impressum ${nImp}, Wikipedia ${nWiki}), ohne Ergebnis: ${ohne}, abgelehnt (PLZ nicht im Kreis): ${falsch}`);
if (bericht.length) console.log('Abgelehnt:\n  ' + bericht.join('\n  '));
