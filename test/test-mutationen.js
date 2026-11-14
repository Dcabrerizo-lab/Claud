// Schnellprüfung: Jede eingebaute Fehlerstelle des Mutationstests (tools/mutationstest.js) muss genau einmal im Code vorkommen.
// Sonst wäre die Mutation wirkungslos und der große Mutationstest schlüge erst auf GitHub fehl.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, 'tools/mutationstest.js'), 'utf8');
const a = s.indexOf('const M = ['), e = s.indexOf('\n];', a);
const M = new Function('return ' + s.slice(a + 10, e + 2))();
let bad = 0;
for (const m of M) {
  const t = fs.readFileSync(path.join(ROOT, m[3] || 'src/rules.js'), 'utf8'); const n = t.split(m[1]).length - 1;
  if (n !== 1) { bad++; console.log('FAIL Mutation „' + m[0] + '“: Stelle ' + n + '-mal gefunden'); }
}
console.log(bad ? bad + ' Mutationen ungültig' : 'Mutationen: alle ' + M.length + ' Stellen genau einmal gefunden, bestanden');
process.exit(bad ? 1 : 0);
