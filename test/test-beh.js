// Strenge Tests für die Karten zu Behinderung, Rente, Ausbildung und Wohnen.
// Zahlen werden hier unabhängig von rules.js aus den amtlichen Quellen eingetragen:
//  - § 33b Abs. 3 EStG (Pauschbeträge), § 32a EStG (Grundfreibetrag 2026 = 12.348 €)
//  - ZBFS Bayern, Infoblatt Blindengeld, Stand 1.7.2026: Blindengeld 809 €, Sehbehindertengeld 242,70 €,
//    Anrechnung Pflegegeld ab Pflegegrad 2: 159,62 € (blind), 83,08 € (hochgradig sehbehindert)
//  - § 40 SGB XI: 42 € Verbrauchsmittel je Monat, 4.180 € je Maßnahme
//  - Art. 11 BayWoFG: 28.300 € / 43.200 € / +10.700 € je weitere Person / +3.200 € je Kind
//  - § 208 SGB IX: 5 Arbeitstage Zusatzurlaub; § 61 SGB IX: Lohnkostenzuschuss bis 75 %
const R = require('./rules-de.js');
const I18N = require('../dist/i18n.js');
let fails = 0, n = 0;
function check(name, cond, extra) { n++; if (!cond) { fails++; console.log('FAIL', name, extra === undefined ? '' : extra); } }
const base = { adults: 1, kids: 0, young: 0, brutto: 0, netto: '', miete: 0, vermoegen: 0, bezug: {} };
const ev = (o) => R.evaluate({ ...base, ...o });
const get = (o, id) => ev(o).results.find((x) => x.id === id);
const lv = (o, id) => get(o, id).level;
const txKeys = (o, id) => get(o, id).tx.map((x) => x[0]);
const eur = (x) => Math.round(x).toLocaleString('de-DE') + ' €';

// --- Konstanten gegen die Quellen ---
const OFF = { 20: 384, 30: 620, 40: 860, 50: 1140, 60: 1440, 70: 1780, 80: 2120, 90: 2460, 100: 2840, H: 7400 };
Object.keys(OFF).forEach((g) => {
  const r = get({ gdb: g }, 'pausch');
  check('Pauschbetrag GdB ' + g, r.level === 'ja' && r.tx[0][1].betrag === eur(OFF[g]), JSON.stringify(r.tx[0]));
});
check('Pauschbetrag: Behinderung (GdB 100) als Haken zählt 2.840 €', get({ behinderung: true }, 'pausch').tx[0][1].betrag === eur(2840));
check('Pauschbetrag: ausdrücklicher GdB schlägt den Haken', get({ behinderung: true, gdb: '40' }, 'pausch').tx[0][1].betrag === eur(860));
check('Pauschbetrag ohne GdB: nein', lv({}, 'pausch') === 'nein');
check('Pauschbetrag: unbekannter GdB-Wert wird ignoriert', lv({ gdb: '55' }, 'pausch') === 'nein' && lv({ gdb: 'abc' }, 'pausch') === 'nein');
// steigt mit dem GdB
let prev = 0, mono = true;
['20', '30', '40', '50', '60', '70', '80', '90', '100', 'H'].forEach((g) => { const v = R.RULES.beh.pausch[g]; if (v <= prev) mono = false; prev = v; });
check('Pauschbeträge steigen mit dem GdB', mono);
check('Pauschbetrag: Kinderhinweis nur bei Kind', txKeys({ gdb: '50', bhPerson: 'minder' }, 'pausch').includes('pausch.kind') && !txKeys({ gdb: '50' }, 'pausch').includes('pausch.kind'));

// --- Kindergeld Behinderung ---
check('KG-Beh: kein Eintrag => nein', lv({}, 'kgBeh') === 'nein');
check('KG-Beh: Kind unter 18 => nein (normales Kindergeld)', lv({ bhPerson: 'minder' }, 'kgBeh') === 'nein');
check('KG-Beh: Behinderung nach 25 => nein', lv({ bhPerson: 'erwNach25', bhSelbst: true }, 'kgBeh') === 'nein' && txKeys({ bhPerson: 'erwNach25' }, 'kgBeh')[0] === 'kgBeh.nach25');
check('KG-Beh: vor 25 und kann sich nicht selbst unterhalten => ja, 259 €', lv({ bhPerson: 'erwVor25', bhSelbst: true }, 'kgBeh') === 'ja' && get({ bhPerson: 'erwVor25', bhSelbst: true }, 'kgBeh').tx[0][1].kg === '259 €');
check('KG-Beh: vor 25 ohne Angabe zum Unterhalt => möglich, nennt Grundfreibetrag 12.348 €', lv({ bhPerson: 'erwVor25' }, 'kgBeh') === 'vielleicht' && get({ bhPerson: 'erwVor25' }, 'kgBeh').tx[0][1].gfb === '12.348 €');
check('KG-Beh: Kindergeld schon bezogen => na', lv({ bhPerson: 'erwVor25', bezug: { kindergeld: true } }, 'kgBeh') === 'na');

// --- Erwerbsminderungsrente ---
check('EM-Rente: keine Angabe => nein', lv({}, 'emrente') === 'nein');
check('EM-Rente: unter 3 Std, Wartezeit => ja, volle Rente', lv({ emStd: 'unter3', em5: true }, 'emrente') === 'ja' && txKeys({ emStd: 'unter3', em5: true }, 'emrente')[0] === 'emrente.voll');
check('EM-Rente: 3 bis 6 Std => halbe Rente', txKeys({ emStd: '3bis6', em5: true }, 'emrente')[0] === 'emrente.teil');
check('EM-Rente: ohne Wartezeit => möglich', lv({ emStd: 'unter3' }, 'emrente') === 'vielleicht' && txKeys({ emStd: 'unter3' }, 'emrente')[1] === 'emrente.warte');
check('EM-Rente: Werkstatt ohne 5 Jahre => möglich mit 20-Jahre-Hinweis', txKeys({ emStd: 'unter3', wfbm: true }, 'emrente')[1] === 'emrente.werkstatt');
check('EM-Rente: Regelaltersgrenze erreicht => nein', lv({ emStd: 'unter3', em5: true, alter: true }, 'emrente') === 'nein');
check('EM-Rente: unbekannter Stundenwert wird ignoriert', lv({ emStd: 'viel', em5: true }, 'emrente') === 'nein');

// --- Eingliederungshilfe ---
check('Eingliederungshilfe: ohne Angabe => nein', lv({}, 'eingl') === 'nein');
['bhPerson', 'gdb', 'blind', 'pflegegrad', 'erwerbsgemindert', 'wfbm'].forEach((k) => {
  const v = { bhPerson: 'erwVor25', gdb: '50', blind: 'blind', pflegegrad: '2', erwerbsgemindert: true, wfbm: true }[k];
  check('Eingliederungshilfe: ' + k + ' löst "möglich" aus', lv({ [k]: v }, 'eingl') === 'vielleicht');
});
check('Eingliederungshilfe: Kind bekommt Kindertext', txKeys({ bhPerson: 'minder' }, 'eingl')[0] === 'eingl.kind' && txKeys({ bhPerson: 'erwVor25' }, 'eingl')[0] === 'eingl.erw');
check('Eingliederungshilfe wird nie "ja" (nur Einzelfallprüfung)', ['minder', 'erwVor25', 'erwNach25'].every((p) => lv({ bhPerson: p, gdb: '100' }, 'eingl') === 'vielleicht'));

// --- Ausweis ---
['50', '60', '70', '80', '90', '100', 'H'].forEach((g) => check('Ausweis GdB ' + g + ' => ja, 5 Tage Zusatzurlaub', lv({ gdb: g }, 'ausweis') === 'ja' && get({ gdb: g }, 'ausweis').tx[0][1].tage === 5));
['30', '40'].forEach((g) => check('Ausweis GdB ' + g + ' => Gleichstellung möglich', lv({ gdb: g }, 'ausweis') === 'vielleicht' && txKeys({ gdb: g }, 'ausweis')[0] === 'ausweis.gleich'));
check('Ausweis GdB 20 => nein', lv({ gdb: '20' }, 'ausweis') === 'nein');
check('Ausweis: Behinderung ohne GdB => Antrag möglich', lv({ bhPerson: 'minder' }, 'ausweis') === 'vielleicht' && txKeys({ bhPerson: 'minder' }, 'ausweis')[0] === 'ausweis.antrag');
check('Ausweis: nichts angegeben => nein', lv({}, 'ausweis') === 'nein');
check('Ausweis: Haken GdB 100 => ja', lv({ behinderung: true }, 'ausweis') === 'ja');

// --- Blindengeld ---
check('Blindengeld: nichts => nein', lv({}, 'blindengeld') === 'nein');
const bl = get({ blind: 'blind' }, 'blindengeld');
check('Blindengeld 809 €', bl.level === 'ja' && bl.tx[0][0] === 'blindengeld.blind' && bl.tx[0][1].betrag === '809 €' && bl.tx[0][1].stand === '7/2026', JSON.stringify(bl.tx[0]));
const sb = get({ blind: 'hoch' }, 'blindengeld');
check('Sehbehindertengeld 242,70 € (mit Cent)', sb.tx[0][0] === 'blindengeld.hoch' && sb.tx[0][1].betrag === '242,70 €', JSON.stringify(sb.tx[0]));
check('Blindengeld Pflegegeld-Anrechnung 159,62 € nur ab Pflegegrad 2', get({ blind: 'blind', pflegegrad: '2' }, 'blindengeld').tx.some((x) => x[0] === 'blindengeld.pflege' && x[1].kuerz === '159,62 €') && !get({ blind: 'blind', pflegegrad: '1' }, 'blindengeld').tx.some((x) => x[0] === 'blindengeld.pflege'));
check('Sehbehindertengeld PG2: Anrechnung 159,62 €, Rest 83,08 €', (()=>{const x=get({ blind: 'hoch', pflegegrad: '2' }, 'blindengeld').tx.find((y) => y[0] === 'blindengeld.pflege'); return x && x[1].kuerz === '159,62 €' && x[1].rest === '83,08 €';})());
check('Blindengeld PG3: 33 % von 599 = 197,67 €, Rest 611,33 €; PG4 Sehbehinderung: Mindestbetrag 20 €', (()=>{const x=get({ blind: 'blind', pflegegrad: '3' }, 'blindengeld').tx.find((y) => y[0] === 'blindengeld.pflege'); const z=get({ blind: 'hoch', pflegegrad: '4' }, 'blindengeld').tx.find((y) => y[0] === 'blindengeld.pflege'); return x[1].kuerz === '197,67 €' && x[1].rest === '611,33 €' && z[1].rest === '20 €';})());
check('Blindengeld 809 − 159,62 = 649,38 (Quelle: 649,38 €)', Math.abs(809 - 159.62 - 649.38) < 1e-9);
check('Blindengeld: Landeshinweis immer dabei', txKeys({ blind: 'blind' }, 'blindengeld').slice(-1)[0] === 'blindengeld.land');

// --- Pflege plus ---
check('Pflege plus: kein Pflegegrad => nein', lv({}, 'pflegeplus') === 'nein');
check('Pflege plus: beantragt => möglich', lv({ pflegegrad: 'antrag' }, 'pflegeplus') === 'vielleicht');
const pp1 = get({ pflegegrad: '1' }, 'pflegeplus'), pp3 = get({ pflegegrad: '3' }, 'pflegeplus');
check('Pflege plus Grad 1: 42 € / 4.180 €, keine Verhinderungspflege', pp1.level === 'ja' && pp1.tx[0][1].verbrauch === '42 €' && pp1.tx[0][1].wohn === '4.180 €' && pp1.tx.length === 1);
check('Pflege plus Grad 3: mit Verhinderungspflege', pp3.tx.length === 2 && pp3.tx[1][0] === 'pflegeplus.verh');

// --- Budget für Arbeit ---
check('Budget für Arbeit: ohne Werkstatt => nein', lv({ gdb: '100' }, 'arbeit') === 'nein');
check('Budget für Arbeit: Werkstatt => möglich, 75 %', lv({ wfbm: true }, 'arbeit') === 'vielleicht' && get({ wfbm: true }, 'arbeit').tx[0][1].prozent === 75);

// --- Rundfunk ---
check('Rundfunk: Grundsicherungsgeld bezogen => ja', lv({ bezug: { grundsicherungsgeld: true } }, 'rundfunk') === 'ja');
check('Rundfunk: Sozialamt bezogen => ja', lv({ bezug: { sozialamt: true } }, 'rundfunk') === 'ja');
check('Rundfunk: nur Wohngeld bezogen => nein (kein Befreiungsgrund)', lv({ bezug: { wohngeld: true }, brutto: 4000, netto: 3200, miete: 600 }, 'rundfunk') === 'nein');
check('Rundfunk: hohes Einkommen => nein', lv({ brutto: 5000, netto: 3800, miete: 700 }, 'rundfunk') === 'nein');
check('Rundfunk: Rentnerin mit Anspruch auf Grundsicherung => möglich', lv({ alter: true, brutto: 600, netto: 600, miete: 450 }, 'rundfunk') === 'vielleicht');
// konsistent: wenn ggeld oder gsa 'ja' ist, ist Rundfunk nie 'nein' (ohne Bezug)
{
  let bad = 0;
  for (const b of [0, 300, 600, 900, 1500]) for (const alter of [false, true]) for (const kids of [0, 2]) {
    const o = { brutto: b, netto: b * 0.8, miete: 600, alter, kids };
    const e = ev(o); const g = (id) => e.results.find((x) => x.id === id).level;
    if ((g('ggeld') === 'ja' || g('gsa') === 'ja') && g('rundfunk') === 'nein') bad++;
  }
  check('Rundfunk-Folgerung konsistent mit Grundsicherung', bad === 0, bad);
}

// --- Zuzahlung ---
check('Zuzahlung: ohne Angabe => nein', lv({}, 'zuzahl') === 'nein');
check('Zuzahlung: mit Pflegegrad => möglich, nur 2 %', lv({ pflegegrad: '2' }, 'zuzahl') === 'vielleicht' && txKeys({ pflegegrad: '2' }, 'zuzahl').join() === 'zuzahl.grenze');
check('Zuzahlung: GdB 50 => nur 2 %', txKeys({ gdb: '50' }, 'zuzahl').join() === 'zuzahl.grenze');
['60', '100', 'H'].forEach((g) => check('Zuzahlung: GdB ' + g + ' => 1 %-Hinweis', txKeys({ gdb: g }, 'zuzahl').join() === 'zuzahl.grenze,zuzahl.chron'));

// --- BAB ---
check('BAB: ohne Angaben => nein', lv({}, 'bab') === 'nein');
check('BAB: Azubi ohne Betrieb-Haken => nein', lv({ ausbildung: 'ich', babWohnt: true }, 'bab') === 'nein');
check('BAB: Betrieb-Haken ohne Ausbildung ("ich") => nein', lv({ babBetrieb: true, babWohnt: true }, 'bab') === 'nein');
check('BAB: Azubi, wohnt nicht bei Eltern => möglich, nie "ja"', lv({ ausbildung: 'ich', babBetrieb: true, babWohnt: true }, 'bab') === 'vielleicht');
check('BAB: Azubi, wohnt bei Eltern => nein mit Hinweis', lv({ ausbildung: 'ich', babBetrieb: true }, 'bab') === 'nein' && txKeys({ ausbildung: 'ich', babBetrieb: true }, 'bab')[0] === 'bab.wohnen');
check('BAB: Ausbildung des Kindes zählt nicht', lv({ ausbildung: 'kind', kids: 1, babBetrieb: true, babWohnt: true }, 'bab') === 'nein');

// --- WBS Bayern ---
// Art. 4 Abs. 1 BayWoBindG: 17.500 / 27.500 / +5.000 je weitere Person / +1.300 je Kind. Höchstwerte Art. 11 BayWoFG (28.300 / 43.200 / +10.700 / +3.200) nur per Gebietsverordnung.
const WB = [
  [{ adults: 1 }, 17500], [{ adults: 2 }, 27500], [{ adults: 2, kids: 1 }, 27500 + 5000 + 1300], [{ adults: 1, kids: 2 }, 27500 + 5000 + 2600],
  [{ adults: 2, kids: 2 }, 27500 + 10000 + 2600], [{ adults: 1, kids: 1 }, 27500 + 1300]
];
const WMAX = (p, c) => (p <= 1 ? 28300 : 43200 + (p - 2) * 10700) + c * 3200;
WB.forEach(([o, g]) => {
  const j = g / 12;
  const pers = (o.adults || 1) + (o.kids || 0), kk = o.kids || 0, mx = WMAX(pers, kk);
  const hh = { ...o, brutto: j - 1 };
  check('WBS Grenze ' + JSON.stringify(o) + ' = ' + g, get(hh, 'wbs').level === 'ja' && get(hh, 'wbs').tx[0][1].grenze === eur(g), JSON.stringify(get(hh, 'wbs').tx));
  check('WBS knapp über Grenze => nur "möglich" (mit 30-%-Abzug darunter)', lv({ ...o, brutto: j + 100 }, 'wbs') === 'vielleicht' && txKeys({ ...o, brutto: j + 100 }, 'wbs')[0] === 'wbs.rand');
  check('WBS über der 30-%-Abzugsgrenze, unter Art.-11-Höchstwert => möglich (Gebiet)', lv({ ...o, brutto: j / 0.7 + 50 }, 'wbs') === 'vielleicht' && txKeys({ ...o, brutto: j / 0.7 + 50 }, 'wbs')[0] === 'wbs.gebiet');
  check('WBS über Höchstwert nach Abzug => nein', lv({ ...o, brutto: mx / 0.7 / 12 + 50 }, 'wbs') === 'nein' && get({ ...o, brutto: mx / 0.7 / 12 + 50 }, 'wbs').tx[0][1].grenze === eur(mx));
  check('WBS knapp unter dem Höchstwert nach Abzug => möglich', lv({ ...o, brutto: mx / 0.7 / 12 - 20 }, 'wbs') === 'vielleicht');
});
check('WBS: Schwerbehinderung erweitert die "möglich"-Spanne um 4.000 € im Jahr', lv({ adults: 1, brutto: (28300 + 4000) / 0.7 / 12 - 5, gdb: '50' }, 'wbs') === 'vielleicht' && lv({ adults: 1, brutto: (28300 + 4000) / 0.7 / 12 + 20, gdb: '50' }, 'wbs') === 'nein' && lv({ adults: 1, brutto: 28300 / 0.7 / 12 + 20 }, 'wbs') === 'nein');
check('WBS: Einkommen 0 => ja', lv({ brutto: 0 }, 'wbs') === 'ja');
// Monotonie: mehr Einkommen kann das Ergebnis nur verschlechtern
{
  const rank = { ja: 0, vielleicht: 1, nein: 2 }; let bad = 0;
  for (const adults of [1, 2]) for (const kids of [0, 1, 3]) for (const gdb of ['', '50']) {
    let last = 0;
    for (let b = 0; b <= 12000; b += 50) { const r = rank[lv({ adults, kids, brutto: b, gdb }, 'wbs')]; if (r < last) bad++; last = r; }
  }
  check('WBS monoton im Einkommen', bad === 0, bad);
}
// Kinder und Personen erhöhen die Grenze
{
  let bad = 0;
  for (let k = 0; k < 6; k++) { const a = get({ adults: 2, kids: k, brutto: 1 }, 'wbs').tx[0][1].grenze, b = get({ adults: 2, kids: k + 1, brutto: 1 }, 'wbs').tx[0][1].grenze; if (parseInt(a.replace(/\D/g, ''), 10) >= parseInt(b.replace(/\D/g, ''), 10)) bad++; }
  check('WBS: jedes weitere Kind erhöht die Grenze', bad === 0);
}

// --- Wohngeld-Freibetrag folgt dem GdB 100 aus der Auswahl wie aus dem Haken ---
{
  const a = R.evaluate({ ...base, brutto: 2600, netto: 2000, miete: 700, mietstufe: 3, gdb: '100' }).h.behinderung;
  const c = R.evaluate({ ...base, brutto: 2600, netto: 2000, miete: 700, mietstufe: 3, gdb: '90' }).h.behinderung;
  check('GdB 100 in der Auswahl zählt wie der Haken für den Wohngeld-Freibetrag, GdB 90 nicht', a === true && c === false);
}

// --- Zufall, Müll, Konsistenz ---
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const LV = ['ja', 'vielleicht', 'nein', 'na'];
let randBad = 0, textBad = [];
for (let i = 0; i < 30000; i++) {
  const o = {
    adults: pick([1, 2]), kids: pick([0, 0, 1, 2, 4]), young: pick([0, 0, 1]), brutto: pick([0, 300, 900, 1500, 2400, 3500, 6000, 12000]),
    miete: pick([0, 400, 700, 1200]), vermoegen: pick([0, 3000, 20000, 90000]), alter: rnd() < 0.2, erwerbsgemindert: rnd() < 0.2, behinderung: rnd() < 0.15,
    bhPerson: pick(['', 'minder', 'erwVor25', 'erwNach25', 'x']), gdb: pick(['', '20', '30', '40', '50', '60', '70', '80', '90', '100', 'H', '77', null]),
    blind: pick(['', 'blind', 'hoch', 'foo']), emStd: pick(['', 'unter3', '3bis6', 'ueber6']), em5: rnd() < 0.5, wfbm: rnd() < 0.2, bhSelbst: rnd() < 0.5,
    babBetrieb: rnd() < 0.5, babWohnt: rnd() < 0.5, ausbildung: pick(['', 'kind', 'ich']), pflegegrad: pick(['', 'antrag', '1', '2', '3', '4', '5', '9']),
    bezug: { grundsicherungsgeld: rnd() < 0.1, sozialamt: rnd() < 0.1, kindergeld: rnd() < 0.2, wohngeld: rnd() < 0.1, kiz: rnd() < 0.1 }
  };
  o.netto = o.brutto * 0.8;
  let out; try { out = R.evaluate(o); } catch (e) { randBad++; console.log('Absturz', JSON.stringify(o), e.message); continue; }
  const ids = new Set(out.results.map((x) => x.id));
  if (out.results.length !== 21 || ids.size !== 21 || !out.results.every((x) => LV.includes(x.level) && x.name && x.steps && x.tx.length >= 1)) randBad++;
  // Texte müssen in allen Sprachen ohne offene Platzhalter erscheinen
  if (i % 50 === 0) out.results.forEach((x) => x.tx.forEach((y) => {
    ['de', 'en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro'].forEach((l) => {
      let s = I18N[l]['t.' + y[0]]; if (s === undefined) { textBad.push(l + ':' + y[0]); return; }
      s = s.replace(/\{(\w+)\}/g, (m, k) => (y[1] && k in y[1] ? String(y[1][k]) : m));
      if (/\{\w+\}/.test(s) || /undefined|NaN|Infinity/.test(s)) textBad.push(l + ':' + y[0] + ' -> ' + s);
    });
  }));
  // Konsistenzregeln
  const g = (id) => out.results.find((x) => x.id === id);
  if (g('kgBeh').level === 'ja' && !(o.bhPerson === 'erwVor25' && o.bhSelbst)) randBad++;
  if (g('blindengeld').level === 'ja' && !(o.blind === 'blind' || o.blind === 'hoch')) randBad++;
  if (g('pausch').level === 'ja' && !(o.gdb && ['20', '30', '40', '50', '60', '70', '80', '90', '100', 'H'].includes(o.gdb)) && !o.behinderung) randBad++;
  if (g('emrente').level === 'ja' && !(o.em5 && (o.emStd === 'unter3' || o.emStd === '3bis6') && !o.alter)) randBad++;
  if (g('bab').level !== 'nein' && !(o.ausbildung === 'ich' && o.babBetrieb && o.babWohnt)) randBad++;
  if (g('pflegeplus').level === 'ja' && !(['1', '2', '3', '4', '5'].includes(o.pflegegrad))) randBad++;
  if (g('arbeit').level !== 'nein' && !o.wfbm) randBad++;
  if (g('rundfunk').level === 'ja' && !(o.bezug.grundsicherungsgeld || o.bezug.sozialamt)) randBad++;
}
check('30.000 Zufallshaushalte ohne Absturz und widerspruchsfrei', randBad === 0, randBad);
check('Alle Ergebnistexte in 8 Sprachen ohne offene Platzhalter', textBad.length === 0, [...new Set(textBad)].slice(0, 5).join(' | '));

// Müll-Eingaben
[null, undefined, {}, { gdb: {} }, { bhPerson: [] }, { blind: 1 }, { emStd: false }, { brutto: 'abc', gdb: 'H' }, { brutto: -5, kids: -2 }, { gdb: 50 }, { gdb: '050' }].forEach((j, i) => {
  let err = null, out; try { out = R.evaluate(j || {}); } catch (e) { err = e; }
  check('Müll ' + i + ' ohne Absturz', !err && out && out.results.length === 21, err && err.message);
});
check('GdB als Zahl 50 wird erkannt', lv({ gdb: 50 }, 'ausweis') === 'ja');

// Namen: alle 21 vorhanden, eindeutig, die Grundsicherungskarte heißt wie gewünscht
const names = R.evaluate({}).results.map((x) => x.name);
check('21 verschiedene Namen', new Set(names).size === 21);
check('Grundsicherungskarte heißt "Grundsicherung im Alter und bei voller Erwerbsminderung"', names.includes('Grundsicherung im Alter und bei voller Erwerbsminderung'));

console.log(fails ? '\n' + fails + ' FEHLER von ' + n : '\nBehinderungs-Tests bestanden: ' + n + ' Prüfungen');
process.exit(fails ? 1 : 0);
