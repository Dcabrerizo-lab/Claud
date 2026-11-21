// Differenztest Wohngeld, Abfrageteil (läuft auf GitHub Actions, Workflow amtlich-wohngeld.yml):
// erzeugt N zufällige Haushalte (wg-differenz-faelle.js, fester Startwert), gibt sie nacheinander in den amtlichen
// Wohngeldrechner des BMWSB ein und speichert [{ f, eingabe, amtlich, fehler }] als JSON.
// Höflich: ein Browser, nacheinander, mindestens 2 s Pause je Abfrage (robots.txt: Crawl-delay 1), höchstens 400 Haushalte.
// Aufruf: node tools/amtliche-rechner/wg-differenz.js <Anzahl> <Startwert> <ausgabe.json>
const fs = require('fs');
const F = require('./wg-differenz-faelle.js');
const A = require('./wg-amtlich.js');
const N = Math.min(400, Number(process.argv[2]) || 400), START = Number(process.argv[3]) || 2611, OUT = process.argv[4] || 'amtlich-wohngeld.json';
const PAUSE = 2000;
(async () => {
  const faelle = F.faelle(N, START);
  let { b, p } = await A.open(); const out = [];
  for (const f of faelle) {
    const eingabe = F.amtlicheEingabe(f); let amtlich = null, fehler = '';
    for (let versuch = 0; versuch < 3 && amtlich === null; versuch++) {
      try {
        const r = await A.rechne(p, eingabe);
        const z = Number(String(r.r).replace(/\./g, '').replace(',', '.'));
        amtlich = String(r.r).trim() !== '' && isFinite(z) ? z : null; fehler = r.fehler || '';
        if (r.pruef && r.pruef.length) fehler += ' | Eingabe nicht übernommen: ' + r.pruef.join(', ');
        if (r.pruef && r.pruef.length) amtlich = null;
      } catch (e) { fehler = e.message.slice(0, 200); try { await b.close(); } catch (x) { /* egal */ } ({ b, p } = await A.open()); }
      await p.waitForTimeout(PAUSE);
    }
    out.push({ f, eingabe, amtlich, fehler });
    if (out.length % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify({ rechner: A.URL, startwert: START, stand: new Date().toISOString(), faelle: out })); console.log(out.length + ' Haushalte'); }
  }
  fs.writeFileSync(OUT, JSON.stringify({ rechner: A.URL, startwert: START, stand: new Date().toISOString(), faelle: out }));
  await b.close();
  console.log('fertig: ' + out.length + ' Haushalte, ohne Ergebnis: ' + out.filter((x) => x.amtlich === null).length);
})();
