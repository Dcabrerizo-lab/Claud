// Einfache und ausführliche Version rechnen gleich: Dieselbe Person, einmal als Formular-Eingabe der ausführlichen Version
// (Einkommensart, Brutto, Netto) und einmal als Einkommensliste wie in der einfachen Version (und in der ausführlichen bei
// zwei Einkommen derselben Person). Alle Karten müssen dieselbe Einstufung und denselben Text mit denselben Beträgen haben.
// Lohn und Rente mit Brutto und Netto; Arbeitslosengeld, Krankengeld, Elterngeld und Werkstattlohn als ausgezahlter Betrag.
const R = require('./rules-de.js');
const N = Number(process.argv[2]) || 20000;
let seed = 99;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const geld = (max) => Math.round(rnd() * max / 10) * 10;
const fehler = {};
let n = 0;
for (let i = 0; i < N; i++) {
  const art = pick(['lohn', 'lohn', 'rente', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'selbst']);
  const b = geld(3500);
  const mitN = art === 'lohn' || art === 'rente' || art === 'selbst';
  const nt = mitN ? Math.round(b * (0.62 + rnd() * 0.3)) : b;
  const basis = {
    adults: 1, kids: pick([0, 0, 1, 2]), young: 0, kidsU6: 0, kids14: 0,
    miete: pick(['', 0, geld(1400)]), mietstufe: pick(['', '1', '3', '5', '7']), vermoegen: pick(['', 0, 5000, 30000]),
    gebJahr: pick(['', 1950, 1960, 1980, 2000]), bundesland: pick(['', 'BY', 'NW']), wohnform: pick(['', '', 'eltern', 'heim']),
    wfbm: art === 'wfbm' || rnd() < 0.1, wfbmEssen: rnd() < 0.3, emStd: pick(['', '', 'unter3', 'unklar']),
    bhPerson: pick(['', 'ich', 'erwVor25', 'erwNach25']), gdb: pick(['', '50', '100', 'H']), pflegegrad: pick(['', '', '2', '4']),
    blind: pick(['', '', 'blind']), uzBetrag: rnd() < 0.15 ? geld(600) : '', uzAn: pick(['', 'k1', 'ex']), uzTitel: rnd() < 0.5,
    grundrente33: rnd() < 0.1, bezug: rnd() < 0.1 ? { sozialamt: true } : {}
  };
  // Ausführliche Version: so setzt die App die Felder (syncEinkommen): bei Bescheid-Beträgen ist Brutto = Netto = Auszahlung
  const formular = Object.assign({}, basis, { art1: art, brutto: b, netto: nt });
  // Einfache Version: Einkommensliste; ohne Netto ist der Betrag die Auszahlung
  const liste = Object.assign({}, basis, { einkommen: [mitN ? { art, b, n: nt } : { art, b }] });
  const a = R.evaluate(formular).results, c = R.evaluate(liste).results;
  n++;
  a.forEach((x) => {
    const y = c.find((z) => z.id === x.id);
    const sa = x.level + ' ' + JSON.stringify(x.tx), sb = y ? y.level + ' ' + JSON.stringify(y.tx) : '(fehlt)';
    if (sa !== sb) {
      const k = x.id + ' (' + art + ')';
      fehler[k] = fehler[k] || { anzahl: 0, beispiel: { formular, ausfuehrlich: sa.slice(0, 300), einfach: sb.slice(0, 300) } };
      fehler[k].anzahl++;
    }
  });
}
const k = Object.keys(fehler);
if (k.length) {
  console.log('FEHLER: einfache und ausführliche Version rechnen verschieden:');
  k.forEach((x) => console.log('- ' + x + ': ' + fehler[x].anzahl + 'x\n  ' + JSON.stringify(fehler[x].beispiel).slice(0, 900)));
  process.exit(1);
}
console.log('[einfach-gleich] Einfache und ausführliche Version rechnen gleich: ' + n + ' Personen, alle Karten mit derselben Einstufung, demselben Text und denselben Beträgen');
