// Tests für den Pflegegutachten-Check (erweiterungen/pflege.js). Nicht Teil von npm test der App 1.2.0.
'use strict';
const P = require('../../erweiterungen/pflege.js');
const Rules = require('../../src/rules.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

// 1. Anlage 2 unabhängig abgeschrieben (Punktbereiche als Spannen, wie im Gesetz gedruckt) und gegen die Umsetzung geprüft
const GESETZ = {
  1: [[0, 1, 0], [2, 3, 2.5], [4, 5, 5], [6, 9, 7.5], [10, 15, 10]],
  2: [[0, 1, 0], [2, 5, 3.75], [6, 10, 7.5], [11, 16, 11.25], [17, 33, 15]],
  3: [[0, 0, 0], [1, 2, 3.75], [3, 4, 7.5], [5, 6, 11.25], [7, 65, 15]],
  4: [[0, 2, 0], [3, 7, 10], [8, 18, 20], [19, 36, 30], [37, 54, 40]],
  5: [[0, 0, 0], [1, 1, 5], [2, 3, 10], [4, 5, 15], [6, 15, 20]],
  6: [[0, 0, 0], [1, 3, 3.75], [4, 6, 7.5], [7, 11, 11.25], [12, 18, 15]]
};
for (const m of Object.keys(GESETZ)) for (const [von, bis, gew] of GESETZ[m]) for (let s = von; s <= bis; s++) {
  const b = P.bereich(+m, s);
  ok(`Anlage 2 Modul ${m} Summe ${s}`, P.ANLAGE2[m].gew[b] === gew, { b, gew });
}
// Höchstsummen je Modul aus Anlage 1: M1 5×3, M2 11×3, M3 13×5, M4 7×3+9+6+6+3+3+6 = 54, M6 6×3
const max = (m) => P.KRITERIEN.filter((k) => k.m === m).reduce((s, k) => s + Math.max(...P.SKALA[k.s].punkte) * (k.faktor || 1), 0);
ok('Modul 1 höchstens 15', max(1) === 15, max(1));
ok('Modul 2 höchstens 33', max(2) === 33, max(2));
ok('Modul 3 höchstens 65', max(3) === 65, max(3));
ok('Modul 4 höchstens 54', max(4) === 54, max(4));
ok('Modul 6 höchstens 18', max(6) === 18, max(6));
ok('Zahl der Kriterien 5/11/13/13/6', [1, 2, 3, 4, 6].map((m) => P.KRITERIEN.filter((k) => k.m === m).length).join() === '5,11,13,13,6');

// 2. Pflegegrade nach § 15 Abs. 3 und Abs. 7
const G = [[0, 0], [12.49, 0], [12.5, 1], [26.99, 1], [27, 2], [47.49, 2], [47.5, 3], [69.99, 3], [70, 4], [89.99, 4], [90, 5], [100, 5]];
for (const [p, g] of G) ok(`Pflegegrad bei ${p}`, P.grad(p, false) === g, P.grad(p, false));
for (const [p, g] of [[12.4, 0], [12.5, 2], [27, 3], [47.5, 4], [70, 5], [95, 5]]) ok(`Säugling bei ${p}`, P.grad(p, true) === g, P.grad(p, true));

// 3. Gewichtung in Modul 4, Inkontinenz-Regel, Sonde
const nur = (stufen, extra) => P.rechne(Object.assign({ stufen }, extra || {}));
ok('Essen zählt 3-fach', nur({ '4.8': 3 }).module[4].summe === 9);
ok('Trinken zählt 2-fach', nur({ '4.9': 2 }).module[4].summe === 4);
ok('Toilette zählt 2-fach', nur({ '4.10': 1 }).module[4].summe === 2);
ok('4.11 ohne Inkontinenz-Feststellung 0', nur({ '4.11': 3 }).module[4].summe === 0);
ok('4.11 mit Inkontinenz zählt', nur({ '4.11': 3 }, { inkontinenz: { harn: true } }).module[4].summe === 3);
ok('4.12 braucht Stuhl-Feststellung', nur({ '4.12': 2 }, { inkontinenz: { harn: true } }).module[4].summe === 0);
ok('Sonde teilweise 6', nur({ '4.13': 1 }).module[4].summe === 6);
ok('Sonde vollständig 3', nur({ '4.13': 2 }).module[4].summe === 3);
ok('Modul 3 häufig = 3 Punkte', nur({ '3.2': 2 }).module[3].summe === 3);
ok('Modul 3 täglich = 5 Punkte', nur({ '3.2': 3 }).module[3].summe === 5);

// 4. Modul 5 nach Anlage 1 (Beispiel aus dem Gesetz: 3× Medikamente + 1× Blutzucker täglich = 4 Maßnahmen → 2 Punkte)
const m5 = (x, kind) => P.modul5(x, kind);
ok('Gesetzesbeispiel 4 pro Tag → 2', m5({ '5.1': { tag: 3 }, '5.6': { tag: 1 } }).teile.a === 2);
ok('genau 1 pro Tag → 1', m5({ '5.1': { tag: 1 } }).teile.a === 1);
ok('6 pro Woche → 0', m5({ '5.1': { woche: 6 } }).teile.a === 0);
ok('7 pro Woche → 1', m5({ '5.1': { woche: 7 } }).teile.a === 1);
ok('genau 3 pro Tag → 1', m5({ '5.1': { tag: 3 } }).teile.a === 1);
ok('genau 8 pro Tag → 2', m5({ '5.1': { tag: 8 } }).teile.a === 2);
ok('9 pro Tag → 3', m5({ '5.1': { tag: 9 } }).teile.a === 3);
ok('30 pro Monat = 1 pro Tag → 1', m5({ '5.5': { monat: 30 } }).teile.a === 1);
ok('Wunde 1× wöchentlich → 1', m5({ '5.8': { woche: 1 } }).teile.b === 1);
ok('Wunde 4× monatlich → 0 (4/30 < 1/7)', m5({ '5.8': { monat: 4 } }).teile.b === 0);
ok('Wunde 5× monatlich → 1', m5({ '5.8': { monat: 5 } }).teile.b === 1);
ok('Wunde 1× täglich → 2', m5({ '5.8': { tag: 1 } }).teile.b === 2);
ok('Wunde 3× täglich → 3', m5({ '5.8': { tag: 3 } }).teile.b === 3);
ok('Arzt 4× monatlich → 0', m5({ '5.13': { monat: 4 } }).teile.c === 0);
ok('Arzt 1× wöchentlich (4,3) → 1', m5({ '5.13': { woche: 1 } }).teile.c === 1);
ok('Arzt 2× wöchentlich (8,6) → 2', m5({ '5.13': { woche: 2 } }).teile.c === 2);
ok('Arzt 3× wöchentlich (12,9) → 3', m5({ '5.13': { woche: 3 } }).teile.c === 3);
ok('lange Besuche 1× wöchentlich = 8,6 → 2', m5({ '5.15': { woche: 1 } }).teile.c === 2);
ok('Heimbeatmung täglich → 6', m5({ '5.12': { taeglich: true } }).teile.c === 6);
ok('Frühförderung nur bei Kindern', m5({ '5.K': { woche: 1 } }, false).teile.c === 0 && m5({ '5.K': { woche: 1 } }, true).teile.c === 1);
ok('5.16 überwiegend unselbständig → 2', m5({ '5.16': 2 }).teile.d === 2);
ok('Modul 5 höchstens 15', m5({ '5.1': { tag: 20 }, '5.8': { tag: 5 }, '5.12': { taeglich: true }, '5.16': 3 }).summe === 15);

// 5. Durchgerechnetes Beispiel (von Hand): M1 6 → 7,5; M2 12 → 11,25; M3 2 → 3,75; M4 19 → 30; M5 1 → 5; M6 8 → 11,25 = 65 → PG 3, 5 Punkte bis PG 4
const bsp = {
  stufen: { '1.1': 1, '1.2': 0, '1.3': 1, '1.4': 1, '1.5': 3, '2.1': 1, '2.2': 1, '2.3': 2, '2.4': 2, '2.5': 2, '2.6': 1, '2.7': 1, '2.8': 2, '3.2': 1, '3.10': 1,
    '4.1': 1, '4.2': 1, '4.3': 2, '4.4': 3, '4.5': 1, '4.6': 2, '4.7': 2, '4.8': 1, '4.9': 1, '4.10': 1, '6.1': 2, '6.3': 2, '6.4': 2, '6.6': 2 },
  m5: { '5.1': { tag: 2 } }, pgBescheid: 2
};
const rb = P.rechne(bsp);
ok('Beispiel Summen', [1, 2, 3, 4, 5, 6].map((m) => rb.module[m].summe).join() === '6,12,2,19,1,8', [1, 2, 3, 4, 5, 6].map((m) => rb.module[m].summe));
ok('Beispiel gesamt 65', rb.gesamt === 65, rb.gesamt);
ok('Beispiel PG 3', rb.pg === 3);
ok('Beispiel fehlt 5', rb.fehltBisNaechster === 5, rb.fehltBisNaechster);
ok('Beispiel Bescheid PG 2 passt nicht', rb.bescheid && rb.bescheid.passt === false && rb.bescheid.abweichung === 1);
ok('Beispiel Modul 2 zählt', rb.zaehlt23 === 2);
ok('Beispiel Grenzfall', rb.grenzfall === true);
ok('Beispiel Hebel gefunden', rb.hebel.moeglich && rb.hebel.minSchritte >= 1, rb.hebel);
ok('Besondere Bedarfskonstellation → PG 5', P.rechne({ stufen: {}, bedarfskonstellation: true }).pg === 5);
ok('Säugling 4.K + Punkte → eine Stufe höher', P.rechne({ stufen: { '2.1': 3, '2.2': 3 }, alterMonate: 10, k4K: true }).pg === 3);
ok('Erklärung hat 6 Module', P.erklaerung(bsp).length === 6);
ok('Erklärung nennt 3-fach bei Essen', P.erklaerung(bsp).find((z) => z.modul === 4).kriterien.some((k) => k.id === '4.8' && /3-fach/.test(k.text)));
ok('Pflegegeld aus den SoLo-Regeln', P.geld(3, Rules).pflegegeld === Rules.RULES.pflege.geld[3] && P.geld(1, Rules).pflegegeld === 0 && P.geld(1, Rules).entlastung === Rules.RULES.pflege.entlastung);

// 5b. Alter und Verständlichkeit
ok('Erwachsene 80 Jahre: kein Kind', P.rechne({ stufen: {}, alterJahre: 80 }).kind === false);
ok('17 Jahre: Kind', P.rechne({ stufen: {}, alterJahre: 17 }).kind === true);
ok('18 Jahre: kein Kind', P.rechne({ stufen: {}, alterJahre: 18 }).kind === false);
ok('1 Jahr 5 Monate: unter 18 Monaten', P.rechne({ stufen: {}, alterJahre: 1, alterMonate: 17 }).saeugling === true);
ok('18 Monate: nicht mehr Säuglingsregel', P.rechne({ stufen: {}, alterJahre: 1, alterMonate: 18 }).saeugling === false);
ok('2 Jahre: Kind, keine Säuglingsregel', P.rechne({ stufen: {}, alterJahre: 2 }).saeugling === false && P.rechne({ stufen: {}, alterJahre: 2 }).kind === true);
ok('Säugling: 4.1-4.13 zählen nicht', P.rechne({ stufen: { '4.8': 3 }, alterJahre: 0, alterMonate: 10 }).module[4].summe === 0);
ok('Frühförderung zählt bei Kind (aus Alter)', P.rechne({ stufen: {}, m5: { '5.K': { woche: 1 } }, alterJahre: 5 }).module[5].teile.c === 1);
ok('Frühförderung zählt nicht bei Erwachsenen', P.rechne({ stufen: {}, m5: { '5.K': { woche: 1 } }, alterJahre: 50 }).module[5].teile.c === 0);
ok('Alter unbekannt wird gemeldet', P.rechne({ stufen: {} }).alterBekannt === false && /Alter/.test(P.zusammenfassung({ stufen: {} })[0]));
ok('Zusammenfassung Kind erklärt Vergleich mit gesunden Kindern', P.zusammenfassung({ stufen: {}, alterJahre: 8 }).some((x) => /gesunden Kindern/.test(x)));
ok('Zusammenfassung Säugling erklärt Stufe höher', P.zusammenfassung({ stufen: {}, alterMonate: 6 }).some((x) => /eine Stufe höher/.test(x)));
for (const [k, sk] of Object.entries(P.SKALA)) ok(`Skala ${k}: Alltagssprache für jede Stufe`, sk.kurz.length === sk.stufen.length && sk.leicht.length === sk.stufen.length && sk.leicht.every((t) => t.length > 10 && /\.$/.test(t)));
for (const m of [1, 2, 3, 4, 5, 6]) ok(`Modul ${m} hat einfachen Namen`, !!P.MODUL[m].kurz && P.MODUL[m].kurz.length <= 40);
ok('Jedes Kriterium hat eine Alltagsbeschreibung', P.KRITERIEN.every((k) => k.leicht && k.leicht.length >= 10));
const zs = P.zusammenfassung(bsp, rb, Rules);
ok('Zusammenfassung Beispiel: Punkte, Pflegegrad, Bescheid, Abstand, Geld', /65 von 100 Punkten/.test(zs.join(' ')) && /Pflegegrad 3/.test(zs.join(' ')) && /nur Pflegegrad 2/.test(zs.join(' ')) && /fehlen 5 Punkte/.test(zs.join(' ')) && /599 €/.test(zs.join(' ')), zs);
const ek = P.erklaerung(bsp, rb);
ok('Erklärung: jede Zeile mit Bedeutung und Punkten', ek.every((m) => m.satz && m.kriterien.every((k) => /Punkt/.test(k.text) && k.bedeutung)));
ok('Erklärung: zählt nicht bei Modul 3 erklärt', /Zählt nicht/.test(ek.find((m) => m.modul === 3).satz));
ok('Erklärung: Sätze kurz (höchstens 30 Wörter)', ek.every((m) => m.kriterien.every((k) => k.bedeutung.split(/(?<=\.)\s/).every((satz) => satz.split(/\s+/).length <= 30))));
ok('So rechnet die Pflegekasse: 5 Sätze', P.SO_GEHTS.length === 5);

// 6. Eigenschaftstest: jede vorgeschlagene Kombination erreicht wirklich den nächsten Pflegegrad,
//    und keine Kombination mit weniger Stufen (Suche bis Tiefe 2 über alle Kriterien) wäre möglich
let rnd = 12345; const zuf = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648;
const M5SET = { a: (L, o) => { o['5.1'] = { tag: [0, 1, 4, 9][L] }; }, b: (L, o) => { o['5.8'] = [{}, { woche: 1 }, { tag: 1 }, { tag: 3 }][L]; }, c: (L, o) => { o['5.12'] = undefined; o['5.13'] = undefined; if (L === 6) o['5.12'] = { taeglich: true }; else if (L) o['5.13'] = { monat: [0, 5, 9, 13][L] }; }, d: (L, o) => { o['5.16'] = L; } };
let geprueft = 0, kombis = 0;
for (let fall = 0; fall < 600; fall++) {
  const stufen = {};
  for (const k of P.KRITERIEN) if (zuf() < 0.7) stufen[k.id] = Math.floor(zuf() * P.SKALA[k.s].punkte.length);
  const teile = { a: Math.floor(zuf() * 4), b: Math.floor(zuf() * 4), c: [0, 1, 2, 3, 6][Math.floor(zuf() * 5)], d: Math.floor(zuf() * 4) };
  const mm = {}; for (const t of 'abcd') M5SET[t](teile[t], mm);
  const ink = { harn: zuf() < 0.5, stuhl: zuf() < 0.3 };
  const g = { stufen, m5: mm, inkontinenz: ink };
  const r = P.rechne(g);
  ok(`Fall ${fall} Teile Modul 5`, JSON.stringify(r.module[5].teile) === JSON.stringify(teile), [r.module[5].teile, teile]);
  if (r.fehltBisNaechster == null) continue;
  for (const o of r.hebel.optionen) {
    kombis++;
    const st2 = Object.assign({}, stufen), m52 = Object.assign({}, mm), t2 = Object.assign({}, teile);
    for (const w of o.wege) {
      if (w.id.startsWith('M5')) { const t = w.id.slice(2); t2[t] = teile[t] + w.plus; M5SET[t](t2[t], m52); } else st2[w.id] = w.nach;
    }
    const r2 = P.rechne({ stufen: st2, m5: m52, inkontinenz: ink });
    ok(`Fall ${fall}: Kombination erreicht nächsten Grad`, r2.pg > r.pg, { vor: r.gesamt, nach: r2.gesamt, o });
    ok(`Fall ${fall}: Schrittzahl stimmt`, o.wege.reduce((s, w) => s + (w.schritte || 1), 0) === o.schritte, o);
  }
  // Minimalität (nur Kriterien der Module 1-4 und 6, Tiefe 1 und 2)
  if (r.hebel.minSchritte && r.hebel.minSchritte <= 3) {
    geprueft++;
    const kand = P.KRITERIEN.filter((k) => k.s !== 'sonde' && (!k.ink || ink[k.ink]) && (stufen[k.id] || 0) < P.SKALA[k.s].punkte.length - 1);
    const hoch = (st, k) => { const x = Object.assign({}, st); x[k.id] = (x[k.id] || 0) + 1; return x; };
    let tiefe = null;
    for (const a of kand) if (tiefe == null && P.rechne({ stufen: hoch(stufen, a), m5: mm, inkontinenz: ink }).pg > r.pg) tiefe = 1;
    if (tiefe == null && r.hebel.minSchritte > 2) {
      outer: for (let i = 0; i < kand.length; i++) for (let j = i; j < kand.length; j++) {
        let s2 = hoch(stufen, kand[i]);
        if (j === i) { if ((s2[kand[i].id]) >= P.SKALA[kand[i].s].punkte.length) continue; }
        s2 = hoch(s2, kand[j]);
        if (s2[kand[j].id] >= P.SKALA[kand[j].s].punkte.length) continue;
        if (P.rechne({ stufen: s2, m5: mm, inkontinenz: ink }).pg > r.pg) { tiefe = 2; break outer; }
      }
    }
    if (tiefe != null) ok(`Fall ${fall}: keine kürzere Kombination übersehen`, r.hebel.minSchritte <= tiefe, { min: r.hebel.minSchritte, tiefe });
  }
}
ok('Eigenschaftstest hat Kombinationen geprüft', kombis > 300 && geprueft > 50, { kombis, geprueft });

// 7. Vergleich alt gegen neu: die beschleunigte Grenzfall-Suche (hebel) liefert exakt dasselbe wie die bisherige Fassung.
//    Referenz = die alte Umsetzung (Stand vor der Beschleunigung), hier unverändert abgeschrieben; Eingaben zufällig, auch Säuglinge, Kinder, Modul 5.
const REF = (() => {
  const { KRITERIEN: K, SKALA, ANLAGE2, bereich } = P;
  const r2 = (x) => Math.round(x * 100) / 100;
  function stufenFuer(m, g, mehr) {
    if (mehr <= 0) return { schritte: 0, wege: [] };
    const st = g.stufen || {};
    const opts = [];
    for (const k of K) {
      if (k.m !== m) continue;
      if (k.ink && !(g.inkontinenz && g.inkontinenz[k.ink])) continue;
      if (k.s === 'sonde') continue;
      const sk = SKALA[k.s];
      const jetzt = Math.max(0, Math.round(+st[k.id] || 0));
      const wahl = [];
      for (let z = jetzt + 1; z < sk.punkte.length; z++) wahl.push({ k, nach: z, schritte: z - jetzt, plus: (sk.punkte[z] - sk.punkte[jetzt]) * (k.faktor || 1) });
      if (wahl.length) opts.push(wahl);
    }
    let dp = new Array(mehr + 1).fill(null); dp[0] = { s: 0, w: [] };
    for (const wahl of opts) {
      const neu = dp.slice();
      for (let p = 0; p <= mehr; p++) {
        if (!dp[p]) continue;
        for (const o of wahl) {
          const q = Math.min(mehr, p + o.plus), s = dp[p].s + o.schritte;
          if (!neu[q] || s < neu[q].s) neu[q] = { s, w: dp[p].w.concat([{ id: o.k.id, nach: o.nach, schritte: o.schritte, plus: o.plus }]) };
        }
      }
      dp = neu;
    }
    return dp[mehr] ? { schritte: dp[mehr].s, wege: dp[mehr].w } : null;
  }
  return function hebel(g, res) {
    if (res.fehltBisNaechster == null) return { moeglich: false, optionen: [] };
    const proModul = {};
    for (const m of [1, 2, 3, 4, 6]) {
      const mo = res.module[m];
      const liste = [{ gewinn: 0, schritte: 0, wege: [], bereich: mo.bereich }];
      // Kinder bis 18 Monate: nur Modul 3 (und 5) haben Hebel, Module 1, 2, 4, 6 zählen nicht (BRi, seit 24.11.2026)
      for (let b = mo.bereich + 1; b <= 4 && !(res.saeugling && m !== 3); b++) {
        const noetig = ANLAGE2[m].bis[b - 1] + 1 - mo.summe;
        const f = stufenFuer(m, g, noetig);
        if (!f) break;
        liste.push({ gewinn: ANLAGE2[m].gew[b] - mo.gewichtet, schritte: f.schritte, wege: f.wege, bereich: b });
      }
      proModul[m] = liste;
    }
    const t = res.module[5].teile;
    const m5opts = [{ gewinn: 0, schritte: 0, wege: [], bereich: res.module[5].bereich }];
    const naechst = { a: t.a < 3 ? t.a + 1 : null, b: t.b < 3 ? t.b + 1 : null, c: t.c < 3 ? t.c + 1 : t.c === 3 ? 6 : null, d: t.d < 3 ? t.d + 1 : null };
    const teilWege = [];
    for (const key of ['a', 'b', 'c', 'd']) if (naechst[key] != null) teilWege.push({ teil: key, plus: naechst[key] - t[key] });
    for (let mask = 1; mask < 1 << teilWege.length; mask++) {
      let plus = 0, schritte = 0; const w = [];
      teilWege.forEach((tw, i) => { if (mask & (1 << i)) { plus += tw.plus; schritte++; w.push({ id: 'M5' + tw.teil, plus: tw.plus }); } });
      const summe = res.module[5].summe + plus, b = bereich(5, summe);
      const gewinn = ANLAGE2[5].gew[b] - res.module[5].gewichtet;
      if (gewinn > 0) m5opts.push({ gewinn, schritte, wege: w, bereich: b });
    }
    proModul[5] = m5opts;
    const ziel = res.fehltBisNaechster;
    const best = [];
    const ms = [1, 2, 3, 4, 5, 6];
    const rek = (i, wahl) => {
      if (i === ms.length) {
        const w2 = res.module[2].gewichtet + wahl[2].gewinn, w3 = res.module[3].gewichtet + wahl[3].gewinn;
        const gewinn = wahl[1].gewinn + (Math.max(w2, w3) - res.m23) + wahl[4].gewinn + wahl[5].gewinn + wahl[6].gewinn;
        const schritte = ms.reduce((s, m) => s + wahl[m].schritte, 0);
        if (schritte > 0 && gewinn >= ziel - 1e-9) best.push({ schritte, gewinn: r2(gewinn), wege: ms.flatMap((m) => wahl[m].wege.map((x) => Object.assign({ modul: m }, x))) });
        return;
      }
      for (const o of proModul[ms[i]]) { wahl[ms[i]] = o; rek(i + 1, wahl); }
    };
    rek(0, {});
    best.sort((x, y) => x.schritte - y.schritte || y.gewinn - x.gewinn);
    const out = [];
    const teile = (x) => new Set(x.wege.map((w) => w.id + '>' + (w.nach != null ? w.nach : w.plus)));
    for (const b of best) {
      if (out.length >= 5) break;
      const tb = teile(b);
      if (out.some((o) => [...teile(o)].every((x) => tb.has(x)))) continue;
      out.push(b);
    }
    return { moeglich: out.length > 0, minSchritte: out.length ? out[0].schritte : null, optionen: out };
  };
})();
{
  let rv = 4242; const z = () => (rv = (rv * 1103515245 + 12345) % 2147483648) / 2147483648;
  let verglichen = 0, mitOptionen = 0, tAlt = 0, tNeu = 0;
  for (let fall = 0; fall < 300; fall++) {
    const dichte = [0.1, 0.4, 0.7, 1][fall % 4], hoch = fall % 3 === 0 ? 2 : 4; // auch fast leere und niedrige Gutachten (viele Möglichkeiten)
    const stufen = {};
    for (const k of P.KRITERIEN) if (z() < dichte) stufen[k.id] = Math.floor(z() * Math.min(hoch, P.SKALA[k.s].punkte.length));
    const teile = { a: Math.floor(z() * 4), b: Math.floor(z() * 4), c: [0, 1, 2, 3, 6][Math.floor(z() * 5)], d: Math.floor(z() * 4) };
    const mm = {}; for (const t of 'abcd') M5SET[t](teile[t], mm);
    if (z() < 0.2) mm['5.K'] = { woche: Math.floor(z() * 3) };
    const g = { stufen, m5: mm, inkontinenz: { harn: z() < 0.5, stuhl: z() < 0.3 } };
    const art = fall % 10;
    if (art === 1) g.alterMonate = Math.floor(z() * 18); // Säugling
    else if (art === 2) g.alterJahre = 1 + Math.floor(z() * 16); // Kind
    else if (art === 3) g.alterJahre = 40 + Math.floor(z() * 50);
    if (art === 1 && z() < 0.5) g.k4K = true;
    if (fall === 7) g.bedarfskonstellation = true;
    let a = process.hrtime.bigint();
    const r = P.rechne(g);
    tNeu += Number(process.hrtime.bigint() - a);
    a = process.hrtime.bigint();
    const alt = REF(g, r);
    tAlt += Number(process.hrtime.bigint() - a);
    verglichen++; if (alt.optionen.length) mitOptionen++;
    ok(`Vergleich alt/neu Fall ${fall}`, JSON.stringify(r.hebel) === JSON.stringify(alt), { neu: r.hebel, alt });
  }
  ok('Vergleich alt/neu: genug Fälle mit Vorschlägen', verglichen === 300 && mitOptionen > 150, { verglichen, mitOptionen });
  console.log(`Grenzfall-Suche alt gegen neu: ${verglichen} Fälle gleich (${mitOptionen} mit Vorschlägen); Zeit alt ${(tAlt / 1e6).toFixed(0)} ms, neu (ganze Rechnung) ${(tNeu / 1e6).toFixed(0)} ms`);
}

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Pflegegutachten-Check: alle ${n} Prüfungen bestanden (${kombis} Grenzfall-Kombinationen nachgerechnet, ${geprueft} auf Minimalität geprüft)`);
process.exit(f ? 1 : 0);
