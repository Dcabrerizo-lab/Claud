// Differenztest gegen amtliche Rechner: BAföG, Elterngeld (Basis) und Pfändungsfreibetrag.
// Erzeugt zufällige, realistische Fälle (fester Startwert, daher immer dieselben) und rechnet sie mit SoLo.
// Die amtlichen Ergebnisse holt tools/amtliche-rechner/bafoeg-eg-abfrage.js (GitHub-Workflow amtlich-bafoeg-eg.yml).
//
// Amtliche Rechner (Abruf 21.11.2026):
//   BAföG:      BAföG-Rechner von „BAföG Digital“ (https://bafoeg-digital.de/rechner/landing), verlinkt vom
//               Bundesministerium für Forschung, Technologie und Raumfahrt (https://www.bmftr.bund.de/bafoeg).
//   Elterngeld: Elterngeld-Schnellrechner im Familienportal des BMBFSFJ (https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner).
//   Pfändung:   Freibetragsrechner der Justiz NRW (https://freibetragsrechner.justiz.nrw.de/), Freigrenzen ab 1.7.2026.
//
// Aufrufe:
//   node tools/amtlich-vergleich-bafoeg-eg.js faelle <bafoeg|elterngeld|pfaendung>      Fälle als JSON ausgeben
//   node tools/amtlich-vergleich-bafoeg-eg.js auswerten <Ordner> [--md <Datei>] [--json <Datei>]
//        liest amtlich-<art>*.json (Ausgabe der Abfrage), rechnet mit SoLo, listet Abweichungen > 1 € bzw. andere Einschätzung
const fs = require('fs'), path = require('path');
const R = require('../src/rules.js');
const Ref = require('../test/referenz.js');
const HEUTE = 2026.9;
const N = { bafoeg: 200, elterngeld: 300, pfaendung: 300 };

function zufall(seed) { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

// ---------- Fälle ----------
function faelle(art) {
  const rnd = zufall({ bafoeg: 19019, elterngeld: 20262, pfaendung: 85020 }[art]);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const out = [];
  for (let i = 0; i < N[art]; i++) {
    if (art === 'bafoeg') {
      const ich = rnd() < 0.3;
      if (ich) {
        // Studierende Person selbst: eigenes Vermögen (gehäuft um die Freibeträge 15.000 / 45.000 €), teils Nebenjob
        const ue30 = rnd() < 0.35, grenze = ue30 ? 45000 : 15000;
        const verm = rnd() < 0.15 ? 0 : rnd() < 0.6 ? Math.round((grenze - 5000 + rnd() * 20000) / 100) * 100 : Math.round(rnd() * (grenze + 25000) / 100) * 100;
        const eigenEk = rnd() < 0.25 ? Math.round((3000 + rnd() * 12000) / 100) * 100 : 0;
        out.push({ typ: 'ich', ue30, gebJahr: ue30 ? 1984 + Math.floor(rnd() * 10) : 1999 + Math.floor(rnd() * 8), beiEltern: !ue30 && rnd() < 0.3, kv: ue30 ? '1' : pick(['0', '1']), verm, eigenEk });
      } else {
        // Eltern (SoLo-Sicht „Kind in Schule oder Studium“): Paar oder getrennt (anderer Elternteil ohne Einkommen), Geschwister
        const paar = rnd() < 0.6;
        const lohn = () => (rnd() < 0.08 ? 0 : Math.round((1000 + rnd() * 6500) / 50) * 50);
        const b1 = Math.max(800, lohn()), b2 = paar && rnd() < 0.6 ? lohn() : 0;
        const geschw = pick([0, 0, 1, 1, 1, 2, 2, 3]), geschwAusb = rnd() < 0.12 ? 1 : 0;
        const jahre = Array.from({ length: geschw }, () => 2008 + Math.floor(rnd() * 15));
        out.push({ typ: 'kind', paar, b1, b2, jahre, geschwAusb, beiEltern: rnd() < 0.4, kv: pick(['0', '0', '1']) });
      }
    } else if (art === 'elterngeld') {
      const r = rnd(), vorher = r < 0.1 ? Math.floor(rnd() * 1000) : r < 0.85 ? 1000 + Math.floor(rnd() * 2200) : 3200 + Math.floor(rnd() * 3000);
      const f = { vorher };
      if (rnd() < 0.3 && vorher > 600) f.nachher = Math.round(Math.min(vorher - 100, 200 + rnd() * vorher * 0.6));
      if (rnd() < 0.3) f.geschwister = true;
      if (rnd() < 0.12) f.kinder = rnd() < 0.8 ? 2 : 3;
      out.push(f);
    } else {
      // Pfändung: Netto gehäuft um die Freibeträge (1.587,40 € + Unterhaltspflichten) und über dem Höchstbetrag 4.866,30 €
      const personen = pick([0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6]);
      const frei = R.pfaendFreibetrag(personen);
      const r = rnd();
      const netto = Math.round((r < 0.35 ? frei - 30 + rnd() * 60 : r < 0.85 ? 900 + rnd() * 4500 : 4700 + rnd() * 1500) * 100) / 100;
      out.push({ netto, personen, ehegatte: personen > 0 && rnd() < 0.5 });
    }
  }
  return out;
}

// ---------- SoLo ----------
// BAföG-Eltern: Monatsbrutto -> Netto mit SoLos Lohnrechner (Steuerklasse 4/4, 3 bzw. 2), Steuer als Jahreswert für den amtlichen Rechner
function elternLohn(f) {
  const stkl1 = !f.paar ? 2 : f.b2 > 0 ? 4 : 3, stkl2 = 4;
  const l1 = R.nettoLohn(f.b1, { stkl: stkl1, heute: HEUTE }), l2 = f.b2 > 0 ? R.nettoLohn(f.b2, { stkl: stkl2, heute: HEUTE }) : { netto: 0, lst: 0, soli: 0 };
  const st = (l) => Math.round(12 * (l.lst + l.soli + (l.kist || 0)));
  return { netto: Math.round((l1.netto + l2.netto) * 100) / 100, st1: st(l1), st2: st(l2), ek1: f.b1 > 0 ? 12 * f.b1 - 1230 : 0, ek2: f.b2 > 0 ? 12 * f.b2 - 1230 : 0 };
}
function bafoegSolo(f) {
  let inp;
  if (f.typ === 'kind') {
    const l = elternLohn(f);
    // Geschwister in förderfähiger Ausbildung kennt SoLo nicht gesondert: sie zählen als weiteres Kind im Haushalt
    inp = { ausbildung: 'kind', adults: f.paar ? 2 : 1, kids: f.jahre.length, kidsU6: f.jahre.filter((j) => j >= 2021).length, young: 1 + f.geschwAusb, art1: 'lohn', art2: f.b2 > 0 ? 'lohn' : 'ohne', brutto: f.b1 + f.b2, brutto2: f.b2, netto: l.netto, vermoegen: 0, gebJahr: 1975, bezug: { kindergeld: true }, heute: HEUTE };
  } else {
    inp = { ausbildung: 'ich', adults: 1, kids: 0, kidsU6: 0, young: 0, art1: f.eigenEk ? 'lohn' : 'ohne', brutto: Math.round(f.eigenEk / 12), netto: Math.round(f.eigenEk / 12 * 0.8), vermoegen: f.verm, gebJahr: f.gebJahr, bezug: {}, heute: HEUTE };
  }
  const r = R.evaluate(inp).results.find((x) => x.id === 'bafoeg');
  const vt = r.tx.find((t) => t[0] === 'bafoeg.vermTeil');
  // Betragsschätzung (seit Update BAföG-Betrag): Spanne [von, bis] in €; „bis etwa“ -> von 0; keine Schätzung oder „eher nicht“ -> [0, 0].
  // Dazu die Spanne je Wohnsituation (bafoeg.betragWohnen: a–b bei den Eltern, c–d nicht bei den Eltern).
  const sch = r.tx.find((t) => /^schaetz\./.test(t[0])), bw = r.tx.find((t) => t[0] === 'bafoeg.betragWohnen');
  const spanne = r.level === 'nein' || !sch ? [0, 0] : sch[0] === 'schaetz.eins' ? [sch[1].a.eur, sch[1].a.eur] : sch[0] === 'schaetz.spanne' ? [sch[1].a.eur, sch[1].b.eur] : [0, sch[1].b.eur];
  const wohnen = bw ? { eltern: [bw[1].a.eur, bw[1].b.eur], aus: [bw[1].c.eur, bw[1].d.eur] } : null;
  return { level: r.level, hl: r.hl, keys: r.tx.map((t) => t[0]), spanne, wohnen, vermMonat: vt ? (vt[1].monat && vt[1].monat.eur != null ? vt[1].monat.eur : Number(String(vt[1].monat).replace(/[^\d]/g, ''))) : null };
}
function egSolo(f) {
  const kids = f.geschwister ? 2 : 0;
  // Teilzeit (Netto nach der Geburt) und Mehrlinge rechnet SoLo seit 21.11.2026 mit (§ 2 Abs. 3, § 2a Abs. 4 BEEG)
  const inp = { baby: 'bald', egVor: f.vorher, egNach: f.nachher || '', egKinder: f.kinder > 1 ? String(f.kinder) : '', art1: 'lohn', brutto: 2000, netto: 1500, heute: HEUTE, kids, kidsU6: kids };
  const e = R.evaluate(inp).results.find((r) => r.id === 'elterngeld');
  const p = e.tx[0][1];
  return { basis: p.basis.eur, plus: p.plus.eur, inp }; // SoLo zeigt volle Euro; inp für das Elterngeld-Netto nach § 2f BEEG (egAbgleich)
}
function pfSolo(f) { return R.pfaendung(f.netto, f.personen); }

// ---------- Vergleich ----------
function lies(dir, art) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true }).filter((n) => new RegExp('amtlich-' + art + '(-\\d+)?\\.json$').test(path.basename(String(n))))
    .flatMap((n) => JSON.parse(fs.readFileSync(path.join(dir, String(n)), 'utf8'))).sort((a, b) => a.i - b.i);
}
const eur = (x) => (x == null ? '–' : Number(x).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €');

function auswerten(dir) {
  const erg = { bafoeg: null, elterngeld: null, pfaendung: null };
  // BAföG: Einschätzung und (seit Update BAföG-Betrag) geschätzte Spanne. Regeln: „wahrscheinlich“ -> amtlich > 0 €; „eher nicht“ -> amtlich 0 €
  // (unter 10 € wird nicht ausgezahlt, § 51 Abs. 4 BAföG); „möglich“ ist immer vereinbar. Zeigt SoLo die monatliche Minderung durch
  // Vermögen (bafoeg.vermTeil), muss amtlich Bedarf − Minderung herauskommen (± 1 €), wenn sonst nichts angerechnet wird.
  const B = lies(dir, 'bafoeg');
  if (B.length) {
    const z = { n: B.length, ohne: 0, gleich: 0, anders: [], moeglichPos: 0, moeglichNull: 0, ja: 0, nein: 0, vermGeprueft: 0, betragGeprueft: 0, betragBreite: [], hinweise: [] };
    for (const x of B) {
      if (!x.amtlich || x.amtlich.anspruch == null) { z.ohne++; continue; }
      const s = bafoegSolo(x.f), a = x.amtlich.anspruch, pos = a >= 10;
      let fehler = '';
      if (s.level === 'ja') { z.ja++; if (!pos) fehler = 'SoLo „wahrscheinlich“, amtlich ' + eur(a); }
      else if (s.level === 'nein') { z.nein++; if (pos) fehler = 'SoLo „eher nicht“, amtlich ' + eur(a); }
      else pos ? z.moeglichPos++ : z.moeglichNull++;
      if (!fehler && s.vermMonat != null && x.f.typ === 'ich' && !x.f.eigenEk && x.amtlich.bedarf) {
        z.vermGeprueft++;
        const soll = Math.max(0, x.amtlich.bedarf - s.vermMonat);
        if (Math.abs(soll - a) > 1) fehler = 'Minderung durch Vermögen: SoLo ' + eur(s.vermMonat) + '/Monat, amtlich Bedarf ' + eur(x.amtlich.bedarf) + ' − Anspruch ' + eur(a) + ' = ' + eur(x.amtlich.bedarf - a);
      }
      // Betrag: Der amtliche Anspruch muss in SoLos Spanne liegen, und in der Spanne der passenden Wohnsituation. Toleranz 0 €:
      // SoLo rundet die Grenzen schon nach außen auf 10 € (untere ab, obere auf), der amtliche Betrag ist nach § 51 Abs. 3 auf volle Euro
      // gerundet; die Teilspannen je Wohnsituation rechnen mit demselben § 51 (gerundet, unter 10 € = 0 €).
      if (!fehler) {
        z.betragGeprueft++;
        if (s.spanne[1] > s.spanne[0]) z.betragBreite.push(s.spanne[1] - s.spanne[0]);
        if (a < s.spanne[0] || a > s.spanne[1]) fehler = 'Betrag: amtlich ' + eur(a) + ' außerhalb der SoLo-Spanne ' + eur(s.spanne[0]) + ' bis ' + eur(s.spanne[1]);
        else if (s.wohnen) {
          const w = x.f.beiEltern ? s.wohnen.eltern : s.wohnen.aus;
          if (a < w[0] || a > w[1]) fehler = 'Betrag: amtlich ' + eur(a) + ' außerhalb der Spanne ' + (x.f.beiEltern ? 'bei den Eltern ' : 'eigene Wohnung ') + eur(w[0]) + ' bis ' + eur(w[1]);
        }
      }
      if (fehler) z.anders.push({ i: x.i, f: x.f, solo: s, amtlich: x.amtlich, fehler }); else z.gleich++;
    }
    erg.bafoeg = z;
  }
  // Elterngeld (Basiselterngeld). SoLo rechnet nach § 2c Abs. 1 BEEG mit 102,50 € Abzug (1.230 € / 12), der Schnellrechner mit 83,33 €
  // (Entscheidung David, 21.11.2026). Kein Toleranzband: amtlich muss auf den Cent der Formel mit 83,33 € entsprechen, SoLo auf den Euro der
  // Formel mit 102,50 €; bei festem Satz Differenz = −Satz × 19,17 €, bei Mindest-/Höchstbetrag 0 € (test/referenz.js, egAbgleich).
  // Teilzeit (Netto nach der Geburt) und Mehrlinge rechnet SoLo mit; getrennt gezählt, damit Fehler auffallen.
  const E = lies(dir, 'elterngeld');
  if (E.length) {
    const z = { n: E.length, ohne: 0, einfach: { n: 0, gleich: 0, anders: [] }, teilzeit: { n: 0, gleich: 0, anders: [] }, mehrlinge: { n: 0, gleich: 0, anders: [] } };
    for (const x of E) {
      if (x.amtlich == null) { z.ohne++; continue; }
      const s = egSolo(x.f), d = Math.round((s.basis - x.amtlich) * 100) / 100, a = Ref.egAbgleich(x.f, s.basis, x.amtlich, s.inp);
      const g = x.f.kinder > 1 ? z.mehrlinge : x.f.nachher ? z.teilzeit : z.einfach;
      g.n++;
      if (a.fehler) g.anders.push({ i: x.i, f: x.f, solo: s.basis, amtlich: x.amtlich, diff: d, erwartet: a.diff, fehler: a.fehler }); else g.gleich++;
    }
    erg.elterngeld = z;
  }
  // Pfändung: pfändbarer Betrag auf 1 € genau (Ziel: auf den Cent)
  const P = lies(dir, 'pfaendung');
  if (P.length) {
    const z = { n: P.length, ohne: 0, gleich: 0, cent: 0, anders: [] };
    for (const x of P) {
      if (x.amtlich == null) { z.ohne++; continue; }
      const s = pfSolo(x.f), d = Math.round((s.pfaendbar - x.amtlich) * 100) / 100;
      if (Math.abs(d) > 1) z.anders.push({ i: x.i, f: x.f, solo: s.pfaendbar, amtlich: x.amtlich, diff: d });
      else { z.gleich++; if (d !== 0) z.cent++; }
    }
    erg.pfaendung = z;
  }
  return erg;
}

function bericht(erg) {
  const L = [];
  const fb = (f) => (f.typ === 'kind'
    ? (f.paar ? 'Eltern Paar' : 'Elternteil allein') + ', Brutto ' + f.b1 + (f.b2 ? ' + ' + f.b2 : '') + ' €/Monat, Geschwister ' + f.jahre.length + (f.geschwAusb ? ' + 1 in Ausbildung' : '') + ', ' + (f.beiEltern ? 'wohnt bei Eltern' : 'eigene Wohnung')
    : 'Studierende selbst, ' + (f.ue30 ? 'über 30' : 'unter 30') + ', Vermögen ' + f.verm + ' €' + (f.eigenEk ? ', Nebenjob ' + f.eigenEk + ' €/Jahr' : '') + ', ' + (f.beiEltern ? 'bei Eltern' : 'eigene Wohnung'));
  if (erg.bafoeg) {
    const z = erg.bafoeg;
    L.push('## BAföG', '', '| | Anzahl |', '|---|---|', '| Fälle | ' + z.n + ' |', '| amtlich ohne Ergebnis | ' + z.ohne + ' |', '| SoLo „wahrscheinlich“ | ' + z.ja + ' |', '| SoLo „eher nicht“ | ' + z.nein + ' |',
      '| SoLo „möglich“, amtlich Anspruch | ' + z.moeglichPos + ' |', '| SoLo „möglich“, amtlich 0 € | ' + z.moeglichNull + ' |', '| Vermögensminderung in € geprüft | ' + z.vermGeprueft + ' |', '| Betrag in SoLos Spanne geprüft | ' + z.betragGeprueft + ' |', '| Breite der Spanne (Median) | ' + (z.betragBreite.length ? eur(z.betragBreite.slice().sort((p, q) => p - q)[z.betragBreite.length >> 1]) : '–') + ' |', '| **Widersprüche** | **' + z.anders.length + '** |', '');
    if (z.anders.length) {
      L.push('| Nr. | Fall | SoLo | amtlich | Befund |', '|---|---|---|---|---|');
      z.anders.slice(0, 60).forEach((a) => L.push('| ' + a.i + ' | ' + fb(a.f) + ' | ' + a.solo.level + ' (' + a.solo.keys.join(', ') + ') | ' + eur(a.amtlich.anspruch) + ' (Bedarf ' + eur(a.amtlich.bedarf) + ') | ' + a.fehler + ' |'));
      L.push('');
    }
  }
  if (erg.elterngeld) {
    const z = erg.elterngeld;
    L.push('## Elterngeld (Basiselterngeld, Schnellrechner)', '', 'SoLo zieht nach § 2c Abs. 1 BEEG 102,50 € ab (1.230 € / 12), der Schnellrechner 83,33 €. Gezählt wird nur, was sich daraus nicht genau erklärt.', '', '| Gruppe | Fälle | nicht aus dem Pauschbetrag erklärt |', '|---|---|---|',
      '| ohne Teilzeit, ohne Mehrlinge (mit/ohne Geschwisterbonus) | ' + z.einfach.n + ' | ' + z.einfach.anders.length + ' |',
      '| Teilzeit nach der Geburt | ' + z.teilzeit.n + ' | ' + z.teilzeit.anders.length + ' |', '| Mehrlinge | ' + z.mehrlinge.n + ' | ' + z.mehrlinge.anders.length + ' |', '| amtlich ohne Ergebnis | ' + z.ohne + ' | |', '');
    for (const [name, g] of [['ohne Teilzeit/Mehrlinge', z.einfach], ['Teilzeit', z.teilzeit], ['Mehrlinge', z.mehrlinge]]) {
      if (!g.anders.length) continue;
      L.push('### Abweichungen: ' + name, '', '| Nr. | Netto vorher | Netto nachher | Geschwister | Kinder | SoLo | amtlich | Differenz | erwartete Differenz | Grund |', '|---|---|---|---|---|---|---|---|---|---|');
      g.anders.slice(0, 25).forEach((a) => L.push('| ' + a.i + ' | ' + a.f.vorher + ' | ' + (a.f.nachher || '–') + ' | ' + (a.f.geschwister ? 'ja' : 'nein') + ' | ' + (a.f.kinder || 1) + ' | ' + eur(a.solo) + ' | ' + eur(a.amtlich) + ' | ' + eur(a.diff) + ' | ' + eur(a.erwartet) + ' | ' + a.fehler + ' |'));
      if (g.anders.length > 25) L.push('', '… und ' + (g.anders.length - 25) + ' weitere');
      L.push('');
    }
  }
  if (erg.pfaendung) {
    const z = erg.pfaendung;
    L.push('## Pfändung (Freibetragsrechner Justiz NRW)', '', '| | Anzahl |', '|---|---|', '| Fälle | ' + z.n + ' |', '| gleich (± 1 €) | ' + z.gleich + ' (davon mit Cent-Abweichung ' + z.cent + ') |', '| **Abweichung > 1 €** | **' + z.anders.length + '** |', '| amtlich ohne Ergebnis | ' + z.ohne + ' |', '');
    if (z.anders.length) {
      L.push('| Nr. | Netto | Unterhaltspflichten | SoLo pfändbar | amtlich pfändbar | Differenz |', '|---|---|---|---|---|---|');
      z.anders.slice(0, 40).forEach((a) => L.push('| ' + a.i + ' | ' + eur(a.f.netto) + ' | ' + a.f.personen + ' | ' + eur(a.solo) + ' | ' + eur(a.amtlich) + ' | ' + eur(a.diff) + ' |'));
      L.push('');
    }
  }
  return L.join('\n');
}

module.exports = { faelle, bafoegSolo, egSolo, pfSolo, elternLohn, auswerten, bericht, N };

if (require.main === module) {
  const [cmd, a1] = process.argv.slice(2);
  const opt = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  if (cmd === 'faelle') console.log(JSON.stringify(faelle(a1), null, 1));
  else if (cmd === 'auswerten') {
    const erg = auswerten(a1), md = bericht(erg);
    console.log(md);
    if (opt('--md')) fs.writeFileSync(opt('--md'), md + '\n');
    if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(erg, null, 1));
  } else { console.log('Aufruf: faelle <art> | auswerten <Ordner> [--md Datei] [--json Datei]'); process.exit(2); }
}
