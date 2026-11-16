// Großer Abgleich mit amtlichen Rechnern, verteilt auf mehrere Rechner (GitHub Actions, Matrix).
// Aufruf: node tools/amtliche-rechner/gross.js <wohngeld|kiz> <Anzahl gesamt> <Teil> <Teile> <Ausgabedatei>
// Erzeugt die Fälle immer gleich (fester Startwert), fragt nur jeden <Teile>-ten ab Fall <Teil> ab und schreibt
// [{ f, amtlich }] in die Ausgabedatei. Ausgewertet wird danach mit tools/amtliche-rechner/gross-auswerten.js.
const fs = require('fs');
const [art, NS, TS, TT, OUT] = process.argv.slice(2);
const N = Number(NS) || 100, TEIL = Number(TS) || 0, TEILE = Number(TT) || 1;
let seed = { kiz: 2027, elterngeld: 777, kiz2: 9001, wg2: 4242, wggrenz: 5150, kizgrenz: 6160 }[art] || 31337; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4];
const faelle = [];
for (let i = 0; i < N; i++) {
  if (art === 'kiz2' || art === 'kizgrenz') {
    // schwer: Partner mit Einkommen, Unterhalt für die Kinder, Alter an den Grenzen (5/6/7, 13/14), bis 6 Kinder
    const partner = rnd() < 0.5, nk = pick([1, 1, 2, 2, 3, 4, 5, 6]);
    const alter = Array.from({ length: nk }, () => (rnd() < 0.4 ? pick([5, 6, 7, 13, 14]) : Math.floor(rnd() * 18)));
    const brutto = Math.round((900 + rnd() * 4100) / 10) * 10, netto = Math.round(brutto * (brutto < 1300 ? 0.8 : 0.7));
    const pBrutto = partner && rnd() < 0.5 ? Math.round((300 + rnd() * 2200) / 10) * 10 : 0, pNetto = Math.round(pBrutto * (pBrutto < 1300 ? 0.8 : 0.7));
    const uh = !partner && rnd() < 0.5 ? Math.round(rnd() * 50) * 10 : 0;
    faelle.push({ alter, partner, brutto, netto, pBrutto, pNetto, uh, miete: Math.round((400 + rnd() * 1400) / 10) * 10 });
  } else if (art === 'wg2' || art === 'wggrenz') {
    // schwer: bis 8 Personen, Renten-Paare, angegebene Heizkosten, Alleinerziehende, sehr kleine und große Einkommen
    const adults = pick([1, 1, 2, 2]), kids = pick([0, 1, 2, 3, 4, 5, 6]), a = pick(['lohn', 'lohn', 'rente']), persons = adults + kids;
    const b1 = Math.round((a === 'rente' ? 200 + rnd() * 2200 : 200 + rnd() * 4800) / 10) * 10;
    const b2 = adults === 2 && rnd() < 0.5 ? Math.round((100 + rnd() * 2500) / 10) * 10 : 0;
    const warm = Math.round((250 + rnd() * 1500 + persons * 80) / 10) * 10;
    const heiz = rnd() < 0.6 ? Math.round((40 + rnd() * 0.3 * warm) / 10) * 10 : 0;
    faelle.push({ adults, kids, art: a, persons, stufe: 1 + Math.floor(rnd() * 7), b1, b2, warm, heiz });
  } else if (art === 'elterngeld') {
    const r = rnd(), vorher = r < 0.1 ? Math.floor(rnd() * 1000) : r < 0.9 ? 1000 + Math.floor(rnd() * 2000) : 3000 + Math.floor(rnd() * 3000);
    faelle.push(rnd() < 0.3 ? { vorher, geschwister: true } : { vorher });
  } else if (art === 'kiz') {
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
if (art === 'wggrenz' || art === 'kizgrenz') {
  const S = require('./gross-solo.js');
  for (const f of faelle) {
    const lvl = (x) => (art === 'wggrenz' ? S.wg(x).level : S.kiz(x));
    const setz = (x, v) => (art === 'wggrenz' ? Object.assign({}, x, { b1: v }) : Object.assign({}, x, { brutto: v, netto: Math.round(v * (v < 1300 ? 0.8 : 0.7)) }));
    const start = art === 'wggrenz' ? f.b1 : f.brutto, l0 = lvl(f);
    // Suche das nächste Einkommen (in 10-€-Schritten bis 6.000 €), bei dem die Einstufung wechselt, dann ± 10 €
    const wechsel = [];
    for (let v = 100; v <= 6000; v += 10) if (lvl(setz(f, v)) !== lvl(setz(f, v + 10))) wechsel.push(v);
    const grenze = wechsel.length ? pick(wechsel) + (rnd() < 0.5 ? 0 : 10) : start;
    Object.assign(f, setz(f, grenze)); f.grenze = l0 !== undefined && wechsel.length > 0;
  }
}
const ART = { kiz2: 'kiz', kizgrenz: 'kiz', wg2: 'wohngeld', wggrenz: 'wohngeld' }[art] || art;
(async () => {
  const A = require(ART === 'kiz' ? './kiz-amtlich.js' : ART === 'elterngeld' ? './eg-amtlich.js' : './wg-amtlich.js');
  let { b, p } = await A.open(); const out = [];
  for (let i = TEIL; i < faelle.length; i += TEILE) {
    const f = faelle[i]; let amtlich = null;
    for (let versuch = 0; versuch < 3 && amtlich === null; versuch++) {
      try {
        if (ART === 'elterngeld') {
          const m = String(await A.rechne(p, f)).split('||').pop().match(/([\d.]+,\d\d) €/);
          amtlich = m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : null;
        } else if (ART === 'kiz') {
          const t = await A.rechne(p, f);
          const pos = /Aussicht auf Erfolg|Anspruch auf Kinderzuschlag haben/.test(t) && !/keinen Anspruch/.test(t), neg = /keinen Anspruch|nicht vermieden werden/.test(t);
          amtlich = pos ? 'ja' : neg ? 'nein' : null; if (amtlich === null) f.text = String(t).slice(0, 200);
        } else {
          const heiz = f.heiz || HEIZ[Math.min(f.persons, 5) - 1] + Math.max(0, f.persons - 5) * 27.6;
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
