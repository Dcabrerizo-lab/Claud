// Monatliche Prüfung gegen die amtlichen Rechner (GitHub Actions, Workflow „Amtliche Rechner“):
// Die gespeicherten Vergleichsfälle (test/amtlich-*.json) werden erneut online abgefragt. Weicht ein amtliches Ergebnis vom
// gespeicherten ab, haben die Behörden Werte oder Regeln geändert (z. B. zum Jahreswechsel): dann schlägt der Lauf fehl und
// SoLo muss angepasst werden. Aufruf: node tools/amtliche-rechner/live-pruefen.js [wohngeld|elterngeld|kiz|alle]
const path = require('path');
const T = (f) => require(path.join(__dirname, '..', '..', 'test', f));
const welche = process.argv[2] || 'alle';
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4];
let abw = 0, n = 0;
const meld = (art, f, alt, neu) => { abw++; console.log('ABWEICHUNG ' + art + ': ' + JSON.stringify(f) + ' gespeichert ' + alt + ', heute ' + neu); };
(async () => {
  if (welche === 'alle' || welche === 'wohngeld') {
    const A = require('./wg-amtlich.js'); const { b, p } = await A.open();
    for (const x of T('amtlich-wohngeld.json').faelle.slice(0, 20)) {
      const f = x.f, heiz = HEIZ[Math.min(f.persons, 5) - 1] + Math.max(0, f.persons - 5) * 27.6;
      const abz = f.art === 'lohn' ? { steuer: true, kv: true, rv: true } : { steuer: true, kv: true }, wk = f.art === 'lohn' ? 102.5 : 8.5;
      const m = [Object.assign({ ek: f.b1, wk: Math.min(wk, f.b1) }, abz)];
      if (f.adults === 2) m.push(f.b2 > 0 ? Object.assign({ ek: f.b2, wk: Math.min(wk, f.b2) }, abz) : { ek: 0 });
      for (let k = 0; k < f.kids; k++) m.push({ ek: 0 });
      const r = await A.rechne(p, { miete: Math.max(0, f.warm - heiz), stufe: f.stufe, mitglieder: m, allein: f.adults === 1 && f.kids > 0 });
      const neu = Number(String(r.r).replace(',', '.')); n++;
      if (!(Math.abs(neu - x.amtlich) <= 1)) meld('Wohngeld', f, x.amtlich, r.r || r.fehler);
    }
    await b.close();
  }
  if (welche === 'alle' || welche === 'elterngeld') {
    const A = require('./eg-amtlich.js'); const { b, p } = await A.open();
    for (const x of T('amtlich-elterngeld.json').faelle) {
      const t = await A.rechne(p, { vorher: x.vorher }); const neu = Number(t.split('||').pop().replace(/[^\d,]/g, '').replace(',', '.')); n++;
      if (!(Math.abs(neu - x.amtlich) <= 0.01)) meld('Elterngeld', { vorher: x.vorher }, x.amtlich, neu);
    }
    await b.close();
  }
  if (welche === 'alle' || welche === 'kiz') {
    const A = require('./kiz-amtlich.js'); const { b, p } = await A.open();
    for (const x of T('amtlich-kiz.json').faelle.slice(0, 12)) {
      const t = await A.rechne(p, x.f); const neu = /Aussicht auf Erfolg/.test(t) ? 'ja' : /keinen Anspruch|Hilfebedürftigkeit/.test(t) ? 'nein' : '?'; n++;
      if (neu !== x.lotse) meld('Kinderzuschlag', x.f, x.lotse, neu + ' (' + t.slice(0, 80) + ')');
    }
    await b.close();
  }
  console.log(abw ? '\n' + abw + ' von ' + n + ' amtlichen Ergebnissen haben sich geändert: Regeln in SoLo prüfen und anpassen, dann test/amtlich-*.json neu erzeugen.' : '\nAmtliche Rechner unverändert: ' + n + ' Fälle gleich wie gespeichert.');
  process.exit(abw ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ (Seite des Rechners geändert?)', e.message); process.exit(2); });
