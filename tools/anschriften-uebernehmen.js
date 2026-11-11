// Übernimmt die Anschriften aus solo-anschriften.json (Ergebnis des Handy-Skripts) nach content/behoerden-deutschland.json.
// Aufruf: node tools/anschriften-uebernehmen.js pfad/zu/solo-anschriften.json [--bericht datei.txt]
//
// Auswahl, von sicher nach weniger sicher. Die PLZ muss im selben Bundesland liegen (viele Landratsämter sitzen in der
// benachbarten kreisfreien Stadt, z. B. Landkreis Heilbronn in Heilbronn); wo nur eine Quelle vorliegt, gelten strengere Regeln.
//  1. Impressum und Wikipedia nennen dieselbe Anschrift (gleiche PLZ, gleiche Straße)  -> Quelle „Impressum“
//     (auch ohne Hausnummer, z. B. „Europaplatz“, „Kreishaus am Schloßplatz“)
//  2. Wikipedia nennt eine vollständige Anschrift der Kreis-/Stadtverwaltung (Straße mit Nummer) -> Quelle „Wikipedia“
//     (Impressen nennen oft zusätzlich Webagenturen, Portalbetreiber oder Datenschutzbeauftragte)
//  3. Wikipedia nennt nur die Hausnummer: die Impressum-Anschrift mit derselben PLZ und Hausnummer -> „Impressum“
//  4. Keine Wikipedia-Angabe: Impressum-Anschrift mit PLZ im eigenen Kreis und Straße mit Nummer -> „Impressum“
//  5. Sonst keine Anschrift (die App nennt dann die Website der Behörde)
// Eine Straßenzeile muss wie eine Anschrift aussehen (Straße mit Hausnummer oder Postfach), ohne Klammern oder Personennamen.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const datei = args.find((a) => !a.startsWith('--'));
const berichtDatei = args.includes('--bericht') ? args[args.indexOf('--bericht') + 1] : null;
if (!datei) { console.error('Aufruf: node tools/anschriften-uebernehmen.js solo-anschriften.json [--bericht datei.txt]'); process.exit(1); }
const E = JSON.parse(fs.readFileSync(datei, 'utf8'));
const DEF = path.join(ROOT, 'content', 'behoerden-deutschland.json');
const DE = JSON.parse(fs.readFileSync(DEF, 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'plz-data.json'), 'utf8'));
const kreiseDerPlz = (plz) => new Set((P.plz[plz] || []).filter((e) => e[1] >= 0).map((e) => P.kreise[e[1]].ags));
const imKreis = (plz, ags) => kreiseDerPlz(plz).has(ags);
const imLand = (plz, ags) => [...kreiseDerPlz(plz)].some((a) => a.slice(0, 2) === ags.slice(0, 2));

// Zeilen säubern: Vorsätze („Hausanschrift:“), Satzzeichen am Ende, doppelte Leerzeichen, Gedankenstriche in Hausnummern
const saeubern = (z) => z.replace(/^(Haus|Post|Besucher)?anschrift\s*:\s*/i, '').replace(/^(Landratsamt|Kreisverwaltung|Stadtverwaltung|Rathaus)\s+[A-ZÄÖÜ][\wäöüß-]*\s+(?=[A-ZÄÖÜ][\wäöüß.-]+\s\d)/, '').replace(/\s+-(?=\S)/g, '-').replace(/[,;.]+$/, '').replace(/\s+/g, ' ')
  .replace(/\s*([–-])\s*(?=\d)/g, '–').replace(/(\d)\s*[–-]\s*$/, '$1').trim();
const STRASSE = /^[A-ZÄÖÜa-zäöüß][\wÄÖÜäöüß.'\- ]{2,60}\s\d{1,4}\s?[a-zA-Z]?(\s?[–\/+]\s?\d{1,4}\s?[a-zA-Z]?)?$/;
const POSTFACH = /^Postfach\s\d[\d ]{0,9}$/;
const ORT = /^\d{5}\s[A-ZÄÖÜ][\wÄÖÜäöüß .()\/\-]{2,60}$/;
// locker: Zeile ohne Klammern, Ort gültig, PLZ im Land; streng zusätzlich: Straße mit Nummer oder Postfach
function pruefe(k, ags) {
  if (!k || !Array.isArray(k.zeilen) || k.zeilen.length !== 2 || !/^\d{5}$/.test(k.plz)) return null;
  const z = k.zeilen.map(saeubern);
  if (/[()]/.test(z[0]) || z[0].length < 4 || z[0].length > 80 || !/[A-Za-zÄÖÜäöüß]{3}/.test(z[0]) || !ORT.test(z[1]) || !imLand(k.plz, ags)) return null;
  return { zeilen: z, plz: k.plz, streng: STRASSE.test(z[0]) || POSTFACH.test(z[0]), postfach: POSTFACH.test(z[0]), kreis: imKreis(k.plz, ags) };
}
const norm = (s) => s.toLowerCase().replace(/ß/g, 'ss').replace(/str\.?(?=\s|$)/g, 'strasse').replace(/[^a-z0-9äöü]/g, '');
const nummer = (z) => (z.match(/\d+/) || [''])[0];

let ok = 0, ohne = 0, nBeide = 0, nWiki = 0, nNummer = 0, nNurImp = 0;
const bericht = [];
Object.keys(DE.kreise).forEach((ags) => {
  const e = E[ags], b = DE.kreise[ags];
  if (!e) { ohne++; bericht.push(ags + ' ' + b.name + ': nicht abgerufen'); return; }
  const imp = (e.kandidaten || []).map((k) => pruefe(k, ags)).filter(Boolean);
  const wikiRoh = (e.wiki_kandidaten || []).filter((k) => /^\d{5}$/.test(k.plz) && imLand(k.plz, ags));
  const wiki = wikiRoh.map((k) => pruefe(k, ags)).filter(Boolean);
  let wahl = null, art = '';
  // 1. Übereinstimmung
  for (const w of wiki) {
    const i = imp.find((x) => x.plz === w.plz && norm(x.zeilen[0]) === norm(w.zeilen[0]));
    if (i) { wahl = w; art = 'impressum'; nBeide++; break; }   // Schreibweise aus Wikipedia (einheitlich, Straße ausgeschrieben)
  }
  // 2. Vollständige Wikipedia-Anschrift (keine Postfächer)
  if (!wahl) { const w = wiki.find((x) => x.streng && !x.postfach); if (w) { wahl = w; art = 'wikipedia'; nWiki++; } }
  // 3. Wikipedia nur mit Hausnummer: passende Impressum-Anschrift
  if (!wahl) {
    for (const w of wikiRoh) {
      const n = /^\d+[a-z]?([–-]\d+)?$/.test(saeubern(w.zeilen[0])) ? nummer(w.zeilen[0]) : '';
      const i = n && imp.find((x) => x.plz === w.plz && x.streng && !x.postfach && nummer(x.zeilen[0].replace(/^\D+/, '')) === n);
      if (i) { wahl = i; art = 'impressum'; nNummer++; break; }
    }
  }
  // 4. Keine Wikipedia-Angabe: nur das Impressum, dann streng (eigener Kreis, Straße mit Nummer)
  if (!wahl && !(e.wiki_kandidaten || []).length) {
    const i = imp.find((x) => x.kreis && x.streng && !x.postfach);
    if (i) { wahl = i; art = 'impressum'; nNurImp++; }
  }
  if (!wahl) {
    ohne++;
    bericht.push(ags + ' ' + b.name + ': keine gesicherte Anschrift (Impressum: ' + ((e.kandidaten || []).map((k) => k.zeilen.join(', ')).join(' | ') || e.fehler || '–') +
      '; Wikipedia: ' + ((e.wiki_kandidaten || []).map((k) => k.zeilen.join(', ')).join(' | ') || '–') + ')');
    delete b.anschrift; delete b.quelle; delete b.quelleArt; delete b.stand;
    return;
  }
  b.anschrift = wahl.zeilen;
  b.quelle = art === 'wikipedia' ? e.wikipedia : (e.impressum || e.web);
  b.quelleArt = art;
  b.stand = String(e.zeit || '').slice(0, 10).split('-').reverse().map(Number).join('.');
  ok++;
});
DE.stand = DE.stand.replace(/; Anschriften.*$/, '') + '; Anschriften: Impressum der Behörden und Wikipedia (Handy-Abruf), geprüft (PLZ im Land, Abgleich beider Quellen)';
fs.writeFileSync(DEF, JSON.stringify(DE, null, 1));
const zus = `Anschriften übernommen: ${ok} von ${Object.keys(DE.kreise).length} (Impressum und Wikipedia gleich: ${nBeide}, nur Wikipedia: ${nWiki}, Impressum über Hausnummer bestätigt: ${nNummer}, nur Impressum: ${nNurImp}); ohne gesicherte Anschrift: ${ohne}`;
console.log(zus);
if (berichtDatei) fs.writeFileSync(berichtDatei, zus + '\n\n' + bericht.join('\n') + '\n');
else if (bericht.length) console.log(bericht.join('\n'));
