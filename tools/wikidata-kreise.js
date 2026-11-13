// Lädt aus Wikidata (offene Daten, CC0) für alle Kreise und kreisfreien Städte Deutschlands den amtlichen Kreisschlüssel und
// die offizielle Website. Ergebnis: content/quellen/roh/wikidata-kreise.json. Danach: node tools/build-behoerden-de.js
// Aufruf von Hand (etwa einmal im Jahr): node tools/wikidata-kreise.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const OUT = path.join(__dirname, '..', 'content', 'quellen', 'roh', 'wikidata-kreise.json');
const QUERY = `SELECT ?item ?key ?itemLabel ?web ?street ?plz WHERE {
  ?item wdt:P440 ?key .
  FILTER NOT EXISTS { ?item wdt:P576 ?end }
  OPTIONAL { ?item wdt:P856 ?web }
  OPTIONAL { ?item wdt:P6375 ?street }
  OPTIONAL { ?item wdt:P281 ?plz }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
}`;
const json = execFileSync('curl', ['-sS', '--fail', '-m', '120', '-G', 'https://query.wikidata.org/sparql', '--data-urlencode', 'query=' + QUERY,
  '-H', 'Accept: application/sparql-results+json', '-A', 'SoLo-Sozialleistungslotse/1.0 (gemeinnuetzige App, Datenabruf von Hand)'], { encoding: 'utf8', maxBuffer: 64 << 20 });
const n = JSON.parse(json).results.bindings.length;
if (n < 400) throw new Error('Wikidata: zu wenige Einträge (' + n + ')');
fs.writeFileSync(OUT, json);
console.log('wikidata-kreise.json: ' + n + ' Einträge, abgerufen ' + new Date().toISOString().slice(0, 10));
