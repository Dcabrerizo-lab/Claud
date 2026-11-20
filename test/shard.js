// Aufteilung langer Tests auf mehrere parallele Läufe (CI-Matrix). SHARD=2/4 heißt: Teil 2 von 4.
// Ohne SHARD läuft alles (Teil 1 von 1), lokale Aufrufe bleiben unverändert.
// nimm(i): gehört der i-te Fall (ab 0) zu diesem Teil? Verteilung reihum (i modulo Anzahl).
'use strict';
const roh = process.env.SHARD || '';
const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(roh);
if (roh && !m) { console.log('SHARD ungültig: „' + roh + '“ (erwartet z. B. 2/4)'); process.exit(1); }
const teil = m ? Number(m[1]) : 1, anzahl = m ? Number(m[2]) : 1;
if (anzahl < 1 || teil < 1 || teil > anzahl) { console.log('SHARD ungültig: ' + roh); process.exit(1); }
module.exports = {
  teil, anzahl, aktiv: anzahl > 1,
  nimm: (i) => i % anzahl === teil - 1,
  name: anzahl > 1 ? ' (Teil ' + teil + '/' + anzahl + ')' : ''
};
