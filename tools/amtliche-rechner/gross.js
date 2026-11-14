// Großer Abgleich mit amtlichen Rechnern, verteilt auf mehrere Rechner (GitHub Actions, Matrix).
// Aufruf: node tools/amtliche-rechner/gross.js <wohngeld|kiz> <Anzahl gesamt> <Teil> <Teile> <Ausgabedatei>
// Erzeugt die Fälle immer gleich (fester Startwert), fragt nur jeden <Teile>-ten ab Fall <Teil> ab und schreibt
// [{ f, amtlich }] in die Ausgabedatei. Ausgewertet wird danach mit tools/amtliche-rechner/gross-auswerten.js.
const fs = require('fs');
const [art, NS, TS, TT, OUT] = process.argv.slice(2);
const N = Number(NS) || 100, TEIL = Number(TS) || 0, TEILE = Number(TT) || 1;
let seed = art === 'kiz' ? 2027 : 31337; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4];
const faelle = [];
for (let i = 0; i < N; i++) {
  if (art === 'kiz') {
    const partner = rnd() < 0.55, nk = pick([1, 1, 2, 2, 3, 4]);
    const alter = Array.from({ length: nk }, () => Math.floor(rnd() * 18));
    const brutto = Math.round((900 + rnd() * 3600) / 10) * 10, netto = Math.round(brutto * (brutto < 1300 ? 0.8 : 0.7));
    faelle.push({ alter, partner, brutto, netto, pBrutto: 0, pNetto: 0, miete: Math.round((450 + rnd() * 1000) / 10) * 10 });
  } else {
    const adults = pick([1, 1, 2]), kids = pick([0, 0, 1, 2, 3, 4]), a = pick(['lohn', 'lohn', 'rente']), persons = adults + kids;
    const b1 = Math.round((a === 'rente' ? 500 + rnd() * 1500 : 600 + rnd() * 3400) / 10) * 10;
    const b2 = adults === 2 ? pick([0, 0, Math.round((300 + rnd() * 1800) / 10) * 10]) : 0;
    faelle.push({ adults, kids, art: a, persons, stufe: 1 + Math.floor(rnd() * 7), b1, b2, warm: Math.round((300 + rnd() * 1100 + persons * 70) / 10) * 10 });
  }
}
(async () => {
  const A = require(art === 'kiz' ? './kiz-amtlich.js' : './wg-amtlich.js');
  let { b, p } = await A.open(); const out = [];
  for (let i = TEIL; i < faelle.length; i += TEILE) {
    const f = faelle[i]; let amtlich = null;
    for (let versuch = 0; versuch < 3 && amtlich === null; versuch++) {
      try {
        if (art === 'kiz') {
          const t = await A.rechne(p, f);
          const pos = /Aussicht auf Erfolg|Anspruch auf Kinderzuschlag haben/.test(t) && !/keinen Anspruch/.test(t), neg = /keinen Anspruch/.test(t);
          amtlich = pos ? 'ja' : neg ? 'nein' : null; if (amtlich === null) f.text = String(t).slice(0, 200);
        } else {
          const heiz = HEIZ[Math.min(f.persons, 5) - 1] + Math.max(0, f.persons - 5) * 27.6;
          const abz = f.art === 'lohn' ? { steuer: true, kv: true, rv: true } : { steuer: true, kv: true }, wk = f.art === 'lohn' ? 102.5 : 8.5;
          const m = [Object.assign({ ek: f.b1, wk: Math.min(wk, f.b1) }, abz)];
          if (f.adults === 2) m.push(f.b2 > 0 ? Object.assign({ ek: f.b2, wk: Math.min(wk, f.b2) }, abz) : { ek: 0 });
          for (let k = 0; k < f.kids; k++) m.push({ ek: 0 });
          const r = await A.rechne(p, { miete: Math.max(0, f.warm - heiz), stufe: f.stufe, mitglieder: m, allein: f.adults === 1 && f.kids > 0 });
          const z = Number(String(r.r).replace(',', '.')); amtlich = isFinite(z) && String(r.r).trim() !== '' ? z : null;
        }
      } catch (e) { try { await b.close(); } catch (x) {} ({ b, p } = await A.open()); }
    }
    out.push({ i, f, amtlich });
    if (out.length % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(out)); console.log(out.length + ' Fälle'); }
  }
  fs.writeFileSync(OUT, JSON.stringify(out));
  await b.close();
  console.log('fertig: ' + out.length + ' Fälle, ohne Ergebnis: ' + out.filter((x) => x.amtlich === null).length);
})();
