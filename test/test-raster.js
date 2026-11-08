// Prüfung über sehr viele Haushalte: Die App (src/rules.js) muss bei jeder Konstellation dasselbe Ergebnis liefern
// wie die unabhängige Referenzrechnung (test/referenz.js). Verglichen werden die Einstufung (wahrscheinlich, möglich,
// unwahrscheinlich, schon vorhanden) und die Zahlen (Bedarf, geschätzte Beträge).
// Aufruf: node test/test-raster.js [Anzahl Zufallshaushalte, Standard 60000]
'use strict';
const Rules = require('../src/rules.js');
const Ref = require('./referenz.js');

const N = Number(process.argv[2]) || 60000;
let seed = 20261107;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const geld = (max, schritt) => Math.round(rnd() * max / schritt) * schritt;

const ARTEN = ['lohn', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'ohne'];
// Wie die App (syncEinkommen): Einkommen je Person -> brutto (Summe), brutto2, netto (Summe), art1, art2
function haushaltZufall(i) {
  const adults = rnd() < 0.5 ? 1 : 2;
  const kids = pick([0, 0, 1, 1, 2, 2, 3, 4, 5]);
  const kidsU6 = Math.floor(rnd() * (kids + 1));
  const kids14 = Math.floor(rnd() * (kids - kidsU6 + 1));
  const young = pick([0, 0, 0, 1, 2]);
  const person = () => {
    const art = pick(ARTEN);
    if (art === 'ohne') return { art, b: 0, n: 0 };
    const b = art === 'wfbm' ? pick([52, 150, 250, 400]) : art === 'lohn' ? pick([geld(600, 1), geld(2500, 10), geld(6000, 50), 603, 1000, 1200, 1500]) : geld(art === 'eg' ? 1800 : 2600, 10);
    const n = art === 'lohn' || art === 'rente' ? Math.round(b * (0.6 + rnd() * 0.3)) : b;
    return { art, b, n };
  };
  const p1 = person(), p2 = adults === 2 ? person() : null;
  const e = {
    adults, kids, kidsU6, kids14, young,
    art1: p1.art, art2: p2 ? p2.art : '',
    brutto: p1.b + (p2 ? p2.b : 0), brutto2: p2 ? p2.b : '', netto: p1.n + (p2 ? p2.n : 0),
    miete: pick([0, geld(400, 10) + 200, geld(1200, 10) + 300, geld(2000, 10) + 500]),
    mietstufe: pick(['', '1', '2', '3', '4', '5', '6', '7']),
    vermoegen: pick([0, geld(9000, 100), geld(30000, 500), geld(120000, 1000), 5000, 10000, 15000, 20000, 55000, 70000]),
    unterhalt: kids + young > 0 && rnd() < 0.3 ? geld(900, 10) : '',
    unterhaltFehlt: kids > 0 && rnd() < 0.5,
    kinder12: kids > 0 && rnd() < 0.3,
    kindEink: kids + young > 0 && rnd() < 0.25 ? geld(1200, 10) : '',
    gebJahr: pick([1940, 1955, 1958, 1959, 1960, 1961, 1965, 1972, 1980, 1990, 1996, 2003]),
    heute: 2026 + 10 / 12,
    ausbildung: pick(['', '', '', 'kind', 'kindBetrieb', 'ich']),
    babBetrieb: rnd() < 0.3, babWohnt: rnd() < 0.3,
    emStd: pick(['', '', '', 'unter3', '3bis6']),
    wfbm: rnd() < 0.05,
    gdb: pick(['', '', '', '50', '80', '100', 'H']),
    bhPerson: pick(['', '', 'minder', 'erwVor25', 'erwNach25']), teilhabe: rnd() < 0.25, mzG: rnd() < 0.2, bhWeitere: pick([0, 0, 0, 1, 2]),
    schwanger: rnd() < 0.1, warmwasser: rnd() < 0.2, ernaehrung: rnd() < 0.1, grundrente33: rnd() < 0.15,
    pflegegrad: pick(['', '', '', '2', '3']),
    arbeitSit: pick(['', '', 'arbeitslos', 'krank']), algZeit: rnd() < 0.6, algMonate: pick(['', 12, 16, 20, 24, 30, 36, 48]),
    krankWochen: pick(['', 'unter6', 'laeuft', 'ende']), lohnVorher: pick(['', geld(4000, 10), 9000, 6000]),
        bezug: { grundsicherungsgeld: rnd() < 0.05, sozialamt: rnd() < 0.03, wohngeld: rnd() < 0.05, kiz: rnd() < 0.05, kindergeld: rnd() < 0.4 }
  };
  return e;
}

const fehler = {};
let n = 0;
const melde = (art, e, info) => { fehler[art] = fehler[art] || { anzahl: 0, beispiel: null }; fehler[art].anzahl++; if (!fehler[art].beispiel) fehler[art].beispiel = { e, info }; };
const zahlAus = (r, key, feld) => { const x = r.tx.find((t) => t[0] === key); return x && x[1] && x[1][feld] ? x[1][feld].eur : null; };

function pruefe(e) {
  n++;
  const out = Rules.evaluate(e);
  const r = {}; out.results.forEach((x) => { r[x.id] = x; });
  const h = Ref.haushalt(e);
  // Grundsicherungsgeld
  const gg = Ref.grundsicherungsgeld(h);
  if (r.ggeld.level !== gg.level) melde('Grundsicherungsgeld: Einstufung', e, { app: r.ggeld.level, ref: gg.level, ref2: gg });
  else if (gg.bedarf != null) {
    const bApp = r.ggeld.tx[0][1] && r.ggeld.tx[0][1].bedarf ? r.ggeld.tx[0][1].bedarf.eur : null;
    if (bApp !== Math.round(gg.bedarf)) melde('Grundsicherungsgeld: Bedarf', e, { app: bApp, ref: Math.round(gg.bedarf) });
    const s = zahlAus(r.ggeld, 'schaetz.eins', 'a');
    if (gg.level === 'ja' && s !== Math.round(gg.luecke / 10) * 10) melde('Grundsicherungsgeld: geschätzter Betrag', e, { app: s, ref: gg.luecke });
  }
  // Wohngeld
  const w = Ref.wohngeld(h);
  if (r.wohngeld.level !== w.level) melde('Wohngeld: Einstufung', e, { app: r.wohngeld.level, ref: w.level, yPess: w.yPess, yOpt: w.yOpt });
  else if (w.betrag && r.wohngeld.hl !== 'einkoNiedrig' && w.level !== 'nein' && w.level !== 'na') {
    const a = zahlAus(r.wohngeld, 'schaetz.spanne', 'a') ?? zahlAus(r.wohngeld, 'schaetz.eins', 'a');
    const b = zahlAus(r.wohngeld, 'schaetz.spanne', 'b') ?? zahlAus(r.wohngeld, 'schaetz.bis', 'b') ?? a;
    const [ra, rb] = w.betrag;
    const erwartetB = rb >= 10 ? rb : null;
    if ((b ?? null) !== erwartetB && !(erwartetB === null && b === null)) melde('Wohngeld: geschätzter Höchstbetrag', e, { app: [a, b], ref: w.betrag });
    else if (erwartetB && ra >= 10 && a !== ra) melde('Wohngeld: geschätzter Mindestbetrag', e, { app: [a, b], ref: w.betrag });
  }
  // Kinderzuschlag
  const k = Ref.kinderzuschlag(h);
  if (r.kiz.level !== k.level) melde('Kinderzuschlag: Einstufung', e, { app: r.kiz.level, ref: k.level, kiz: k.kiz });
  else if (k.kiz != null && (k.level === 'ja' || (k.level === 'vielleicht' && r.kiz.hl !== 'einkoNiedrig'))) {
    const s = zahlAus(r.kiz, 'schaetz.eins', 'a');
    if (s !== Math.max(10, Math.round(k.kiz / 10) * 10)) melde('Kinderzuschlag: geschätzter Betrag', e, { app: s, ref: k.kiz });
  }
  // Grundsicherung im Alter und bei Erwerbsminderung
  vergleicheGSA(e, r);
  // Unterhaltsvorschuss, BAföG, Arbeitslosengeld I, Krankengeld
  const u = Ref.unterhaltsvorschuss(e);
  if (r.uvg.level !== u.level) melde('Unterhaltsvorschuss: Einstufung', e, { app: r.uvg.level, ref: u.level });
  const bf = Ref.bafoeg(e);
  if (r.bafoeg.level !== bf.level) melde('BAföG: Einstufung', e, { app: r.bafoeg.level, ref: bf.level });
  const al = Ref.arbeitslosengeld(e);
  if (r.alg1.level !== al.level) melde('Arbeitslosengeld I: Einstufung', e, { app: r.alg1.level, ref: al.level });
  else if (al.level === 'ja') {
    const p = r.alg1.tx.find((x) => x[0] === 'alg1.ja'), d = r.alg1.tx.find((x) => x[0] === 'alg1.dauer');
    if (!p || p[1].p !== al.satz) melde('Arbeitslosengeld I: Satz', e, { app: p && p[1], ref: al.satz });
    if ((d ? d[1].m : null) !== al.dauer) melde('Arbeitslosengeld I: Dauer', e, { app: d && d[1], ref: al.dauer });
    const sp = r.alg1.tx.find((x) => x[0] === 'schaetz.spanne');
    if (JSON.stringify(sp ? [sp[1].a.eur, sp[1].b.eur] : null) !== JSON.stringify(al.spanne)) melde('Arbeitslosengeld I: Betrag', e, { app: sp && sp[1], ref: al.spanne });
  }
  const kk = Ref.krankengeld(e);
  if (r.krankengeld.level !== kk.level) melde('Krankengeld: Einstufung', e, { app: r.krankengeld.level, ref: kk.level });
  else if (kk.level === 'ja' || kk.level === 'vielleicht') {
    const sp = r.krankengeld.tx.find((x) => x[0] === 'schaetz.spanne');
    if (JSON.stringify(sp ? [sp[1].a.eur, sp[1].b.eur] : null) !== JSON.stringify(kk.spanne)) melde('Krankengeld: Betrag', e, { app: sp && sp[1], ref: kk.spanne });
  }
  // Allgemein: keine Fehlwerte
  if (/NaN|Infinity|undefined/.test(JSON.stringify(out))) melde('Fehlwerte (NaN/undefined)', e, {});
}

function vergleicheGSA(e, r) {
  const g = Ref.grundsicherungAlter(e);
  if (r.gsa.level !== g.level) melde('Grundsicherung im Alter: Einstufung', e, { app: r.gsa.level, ref: g.level, ref2: g });
  else if (g.bedarf != null && r.gsa.tx[0][1] && r.gsa.tx[0][1].bedarf) {
    if (r.gsa.tx[0][1].bedarf.eur !== Math.round(g.bedarf)) melde('Grundsicherung im Alter: Bedarf', e, { app: r.gsa.tx[0][1].bedarf.eur, ref: g.bedarf });
    const s = zahlAus(r.gsa, 'schaetz.eins', 'a') ?? zahlAus(r.gsa, 'schaetz.mind', 'a');
    if (g.luecke >= 50 && s !== Math.round(g.luecke / 10) * 10) melde('Grundsicherung im Alter: geschätzter Betrag', e, { app: s, ref: g.luecke });
  }
}
// Werkstatt-Beschäftigte und einfache Version: eine Person, Liste von Einkommen, Wohnform
function personZufall() {
  const ein = [];
  if (rnd() < 0.6) ein.push({ art: 'wfbm', b: pick([52, 120, 180, 250, 300, 400, geld(600, 1)]) });
  if (rnd() < 0.2) ein.push({ art: 'lohn', b: geld(1500, 5) });
  if (rnd() < 0.5) { const b = geld(1600, 5); ein.push(rnd() < 0.5 ? { art: 'rente', b } : { art: 'rente', b: Math.round(b / 0.89), n: b }); }
  const wf = pick(['', 'eltern', 'heim']);
  return {
    adults: 1, kids: 0, young: 0, einkommen: ein, wohnform: wf,
    miete: wf === 'heim' ? '' : pick(['', 0, geld(300, 10), geld(900, 10) + 200]),
    wfbm: rnd() < 0.7, wfbmEssen: rnd() < 0.5, emStd: pick(['', 'unter3', 'unklar']),
    gebJahr: pick([1950, 1958, 1960, 1962, 1970, 1985, 2000]), heute: 2026 + 10 / 12,
    mzG: rnd() < 0.3, gdb: pick(['', '50', '80', '100', 'H']), bhPerson: pick(['erwNach25', 'erwVor25']), teilhabe: rnd() < 0.3, pflegegrad: pick(['', '2', '3']), grundrente33: rnd() < 0.3,
    vermoegen: pick([0, 5000, 9999, 10001, 20000]), mietstufe: pick(['', '3', '5']), bezug: { sozialamt: rnd() < 0.05 }
  };
}

for (let i = 0; i < N; i++) pruefe(haushaltZufall(i));
const N2 = Math.round(N / 2);
for (let i = 0; i < N2; i++) {
  const e = personZufall(); n++;
  const out = Rules.evaluate(e); const r = {}; out.results.forEach((x) => { r[x.id] = x; });
  vergleicheGSA(e, r);
  if (e.wohnform && r.wohngeld.level !== 'nein') melde('Wohngeld bei Eltern/Wohnheim', e, { app: r.wohngeld.level });
  if (r.ggeld.level === 'ja' && (e.wfbm || e.emStd === 'unter3')) melde('Grundsicherungsgeld trotz Erwerbsminderung', e, {});
  if (/NaN|Infinity|undefined/.test(JSON.stringify(out))) melde('Fehlwerte (NaN/undefined)', e, {});
}

// Vollständiges Raster für Werkstatt-Beschäftigte (jede Kombination) und Eigenschaften, die immer gelten müssen
const RANG = { ja: 2, vielleicht: 1, nein: 0, na: -1 };
const W = { wohn: ['', 'eltern', 'heim'], wfbm: [0, 52, 100, 180, 250, 350, 500, 700], rente: [0, 300, 600, 800, 1000, 1300], lohn: [0, 300, 900], g: [false, true], essen: [false, true], miete: ['', 0, 350, 700], geb: [1955, 1960, 1990], verm: [0, 9000, 15000] };
let raster = 0;
for (const wohn of W.wohn) for (const wf of W.wfbm) for (const re of W.rente) for (const lo of W.lohn) for (const g of W.g) for (const essen of W.essen) for (const miete of W.miete) for (const geb of W.geb) for (const verm of W.verm) {
  if (wohn === 'heim' && miete !== '') continue;
  const ein = [];
  if (wf) ein.push({ art: 'wfbm', b: wf });
  if (re) ein.push({ art: 'rente', b: re });
  if (lo) ein.push({ art: 'lohn', b: lo });
  const e = { adults: 1, kids: 0, young: 0, einkommen: ein, wohnform: wohn, miete, wfbm: wf > 0, wfbmEssen: essen && wf > 0, mzG: g, gebJahr: geb, heute: 2026 + 10 / 12, vermoegen: verm, bhPerson: 'erwNach25', bezug: {} };
  raster++; n++;
  const r = {}; Rules.evaluate(e).results.forEach((x) => { r[x.id] = x; });
  vergleicheGSA(e, r);
  // Eigenschaft: 100 € mehr Rente macht die Grundsicherung nie wahrscheinlicher
  const r2 = {}; Rules.evaluate({ ...e, einkommen: ein.concat([{ art: 'rente', b: 100 }]) }).results.forEach((x) => { r2[x.id] = x; });
  if (RANG[r2.gsa.level] > RANG[r.gsa.level]) melde('Eigenschaft: mehr Einkommen verbessert die Grundsicherung', e, { vorher: r.gsa.level, nachher: r2.gsa.level });
  // Eigenschaft: Merkzeichen G (Mehrbedarf) macht die Grundsicherung nie unwahrscheinlicher
  if (!g) { const r3 = {}; Rules.evaluate({ ...e, mzG: true }).results.forEach((x) => { r3[x.id] = x; }); if (RANG[r3.gsa.level] < RANG[r.gsa.level]) melde('Eigenschaft: Mehrbedarf G verschlechtert die Grundsicherung', e, {}); }
  // Eigenschaft: Werkstatt-Beschäftigte sind nie beim Jobcenter (Grundsicherungsgeld) richtig
  if (wf > 0 && (r.ggeld.level === 'ja' || r.ggeld.level === 'vielleicht')) melde('Eigenschaft: Werkstatt beim Jobcenter', e, { app: r.ggeld.level });
  // Eigenschaft: im Rentenalter (geboren 1955) nie Grundsicherungsgeld, nie Arbeitslosengeld
  if (geb === 1955 && (r.ggeld.level !== 'nein' || r.alg1.level === 'ja')) melde('Eigenschaft: Rentenalter beim Jobcenter', e, {});
}

// Schwellen-Raster: BAföG (Kind) und Unterhaltsvorschuss in 10-€-Schritten über alle Grenzen
let schwelle = 0;
for (const adults of [1, 2]) for (const kids of [1, 2, 3]) for (let netto = 0; netto <= 6000; netto += 10) {
  const e = { adults, kids, young: 0, art1: 'lohn', brutto: Math.round(netto / 0.75), netto, miete: 700, vermoegen: 0, ausbildung: 'kind', unterhaltFehlt: true, kinder12: true, bezug: {} };
  schwelle++; n++;
  const r = {}; Rules.evaluate(e).results.forEach((x) => { r[x.id] = x; });
  const bf = Ref.bafoeg(e); if (r.bafoeg.level !== bf.level) melde('BAföG (Schwellen-Raster): Einstufung', e, { app: r.bafoeg.level, ref: bf.level });
  const u = Ref.unterhaltsvorschuss(e); if (r.uvg.level !== u.level) melde('Unterhaltsvorschuss (Schwellen-Raster): Einstufung', e, { app: r.uvg.level, ref: u.level });
}
// Arbeitslosengeld und Krankengeld: jedes Brutto in 10-€-Schritten bis über die Beitragsbemessungsgrenzen
for (let lohn = 10; lohn <= 10000; lohn += 10) for (const kids of [0, 1]) {
  for (const e of [{ adults: 1, kids, young: 0, arbeitSit: 'arbeitslos', algZeit: true, algMonate: 24, gebJahr: 1980, heute: 2026.8, lohnVorher: lohn, bezug: {} },
    { adults: 1, kids, young: 0, arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: lohn, bezug: {} }]) {
    schwelle++; n++;
    const r = {}; Rules.evaluate(e).results.forEach((x) => { r[x.id] = x; });
    const ref = e.arbeitSit === 'krank' ? Ref.krankengeld(e) : Ref.arbeitslosengeld(e);
    const id = e.arbeitSit === 'krank' ? 'krankengeld' : 'alg1';
    const sp = r[id].tx.find((x) => x[0] === 'schaetz.spanne');
    if (JSON.stringify(sp ? [sp[1].a.eur, sp[1].b.eur] : null) !== JSON.stringify(ref.spanne)) melde(id + ' (Schwellen-Raster): Betrag', e, { app: sp && sp[1], ref: ref.spanne });
  }
}

// Elterngeld: jedes Netto vor der Geburt in 1-€-Schritten bis 3.000 € (Basis und ElterngeldPlus, auf den Euro wie angezeigt)
for (let vor = 0; vor <= 3000; vor += 1) {
  schwelle++; n++;
  const e = { adults: 1, kids: 0, young: 0, baby: 'da', egVor: vor, bezug: {} };
  const t = Rules.evaluate(e).results.find((x) => x.id === 'elterngeld').tx.find((x) => x[0] === 'eg.ja');
  const ref = Ref.elterngeld(vor);
  if (!t || t[1].basis.eur !== Math.round(ref.basis) || t[1].plus.eur !== Math.round(ref.plus) || t[1].monate !== ref.monate) melde('Elterngeld: Betrag', e, { app: t && t[1], ref });
}
// Hilfe zur Pflege und Blindenhilfe: Einkommensgrenze § 85 SGB XII, Schonvermögen; Asylbewerber: Ausschlüsse
for (let i = 0; i < 20000; i++) {
  const e = haushaltZufall(i);
  e.pflegegrad = pick(['2', '3', '4', '5']); e.blind = 'blind'; e.bhPerson = 'erwNach25';
  schwelle++; n++;
  const r = {}; Rules.evaluate(e).results.forEach((x) => { r[x.id] = x; });
  for (const id of ['hzp', 'blh']) {
    const verm = (Number(e.vermoegen) || 0) > Ref.schon90(e);
    const app = r[id];
    if (verm) { if (app.level !== 'nein') melde(id + ': Vermögen', e, { app: app.level }); continue; }
    const g = Ref.grenze85(e);
    const k = app.tx[0];
    if (!k || !/\.(unter|ueber)$/.test(k[0]) || k[1].grenze.eur !== Math.round(g)) melde(id + ': Einkommensgrenze', e, { app: k, ref: g });
  }
  const a = Rules.evaluate({ ...e, aufenthalt: 'asyl' }).results;
  Ref.ASYL_NEIN.forEach((id) => { const x = a.find((y) => y.id === id); if (x.level !== 'nein' && x.level !== 'na') melde('Asyl: ' + id + ' muss ausgeschlossen sein', e, { app: x.level }); });
  if (a.find((y) => y.id === 'asylblg').level !== 'ja') melde('Asyl: Asylbewerberleistungen', e, {});
}

const arten = Object.keys(fehler);
if (arten.length) {
  console.log('ABWEICHUNGEN zwischen App und Referenz (' + n + ' Haushalte):');
  arten.forEach((a) => { console.log('\n- ' + a + ': ' + fehler[a].anzahl + 'x\n  Beispiel: ' + JSON.stringify(fehler[a].beispiel)); });
  process.exit(1);
}
console.log('[wg-formel] [wg-ae] [kiz-formel] [eg-satz] [hzp-grenze] [blh-grenze] [asyl-ausschluss] Raster-Test bestanden: ' + n + ' Haushalte (davon ' + raster + ' als vollständiges Raster für Werkstatt-Beschäftigte, ' + schwelle + ' im Schwellen-Raster), App und unabhängige Referenz stimmen überein (Grundsicherungsgeld, Grundsicherung im Alter und bei Erwerbsminderung mit Werkstattlohn und Wohnform, Wohngeld, Kinderzuschlag, Unterhaltsvorschuss, BAföG, Arbeitslosengeld I, Krankengeld, Elterngeld, Hilfe zur Pflege, Blindenhilfe, Ausschlüsse bei Asyl: Einstufung und Beträge).');
