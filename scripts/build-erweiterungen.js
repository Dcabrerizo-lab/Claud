// Baut die Vorschau der Erweiterungen als eigene Datei: dist/solo-pruefpaket-vorschau.html
// Getrennt von der App: verändert weder dist/sozialleistungslotse.html noch die App-Pakete.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const E = (f) => fs.readFileSync(path.join(ROOT, 'erweiterungen', f), 'utf8');

function render() {
  const json = (f) => JSON.stringify(JSON.parse(E(f)));
  const teile = {
    RULES: fs.readFileSync(path.join(ROOT, 'src', 'rules.js'), 'utf8'),
    PFLEGE: E('pflege.js'), IMPORT: E('pflege-import.js'), BESCHEID: E('bescheid-sgb2.js'), BESCHEIDWG: E('bescheid-wg.js'), FRISTEN: E('fristen.js'), WIDERSPRUCH: E('widerspruch.js'), LIZENZ: E('lizenz.js'),
    VORSCHAU: E('vorschau.js')
  };
  let html = E('vorschau.html');
  for (const [k, v] of Object.entries(teile)) {
    const marke = '/*' + k + '*/\n';
    if (!html.includes(marke)) throw new Error('Platzhalter fehlt: ' + k);
    html = html.replace(marke, () => v + '\n');
  }
  html = html.replace('/*SCHLUESSEL*/null', () => json('lizenz-schluessel.json')).replace('/*DEMOLIZENZ*/null', () => json('demo-lizenz.json'));
  const rest = html.match(/\/\*(RULES|PFLEGE|IMPORT|BESCHEID|BESCHEIDWG|FRISTEN|WIDERSPRUCH|LIZENZ|VORSCHAU|SCHLUESSEL|DEMOLIZENZ)\*\//);
  if (rest) throw new Error('Platzhalter nicht ersetzt: ' + rest[0]);
  // Titel und Stile gehören in den Kopf
  const kopf = [];
  html = html.replace(/<title>[\s\S]*?<\/title>\n?/, (m) => { kopf.push(m.trim()); return ''; }).replace(/<style>[\s\S]*?<\/style>\n?/, (m) => { kopf.push(m.trim()); return ''; });
  if (kopf.length !== 2) throw new Error('Titel oder Stile fehlen in vorschau.html');
  return '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="data:,">\n' + kopf.join('\n') + '\n</head>\n<body>\n' + html.trim() + '\n</body>\n</html>\n';
}

if (require.main === module) {
  const out = path.join(ROOT, 'dist', 'solo-pruefpaket-vorschau.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = render();
  fs.writeFileSync(out, html);
  console.log('Vorschau Prüfpaket: dist/solo-pruefpaket-vorschau.html', (html.length / 1024).toFixed(1), 'KB');
}
module.exports = { render };
