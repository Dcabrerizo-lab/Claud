// Differenztest Kinderzuschlag: SoLo gegen den KiZ-Lotsen der Familienkasse (web.arbeitsagentur.de/kiz/lotse).
// Der KiZ-Lotse ist der einzige amtliche Rechner zum Kinderzuschlag. Er nennt KEINEN Betrag, nur „Aussicht auf Erfolg“ oder
// „kein Anspruch“ mit Grund (Familienportal, Seite „Wer kann Kinderzuschlag bekommen?“, abgerufen 21.11.2026). Verglichen wird
// daher die Einschätzung (ja/nein) und der Grund. Einen amtlichen Rechner für den Bedarf beim Grundsicherungsgeld hat die BA nicht.
//
// Aufrufe:
//   node tools/amtlich-vergleich-kiz.js faelle <N>                 zeigt die Fälle (fester Startwert, immer gleich)
//   node tools/amtlich-vergleich-kiz.js abfragen <N> <Ausgabe.json> fragt den KiZ-Lotsen ab (nur auf GitHub, braucht Internet)
//   node tools/amtlich-vergleich-kiz.js auswerten <Ergebnis.json>   rechnet dieselben Fälle mit SoLo und listet Abweichungen
//   node tools/amtlich-vergleich-kiz.js gegenprobe <Nr,Nr,…> <Ausgabe.json>  nur feste Fälle, je Fall mit Unterhalt, ohne Unterhalt und
//                                                                   mit hohem Unterhalt (1.000 € je Kind): prüft, ob der Lotse Einkommen der Kinder einrechnet
// Höflich: mindestens 2,5 s Pause zwischen den Abfragen, höchstens 400 Abfragen je Lauf.
// Zeit: eine Abfrage dauert etwa 24 s (Lauf 1: 300 Abfragen in 120 min, Job-Zeitlimit im Workflow 120 min, ca. 8 min für Einrichtung).
// Der Lauf hört nach ZEIT_MIN Minuten (Standard 105, also etwa 260 Abfragen) von selbst auf und speichert, damit Auswertung und Artefakt
// immer noch laufen. Gegenproben kommen direkt nach ihrer Familie, nicht erst am Ende: auch ein gekürzter Lauf hat vollständige Paare.
// Feste Fallliste ohne Änderung am Workflow: Steht in tools/amtliche-rechner/kiz-vergleich-auftrag.txt eine Zeile „gegenprobe: 60,145,…“,
// fragt ein push-Lauf (Änderung der Auftragsdatei) nur diese Familien ab (je mit, ohne und mit 1.000 € Unterhalt je Kind, höchstens 13 Familien).
// Ein Lauf von Hand (workflow_dispatch) beachtet die Zeile nicht.
'use strict';
/* global document */
const fs = require('fs');
const R = require('../src/rules.js');
const K = require('../erweiterungen/bescheid-kiz.js');
const HEUTE = 2026.9;
const MAX_ABFRAGEN = 400, PAUSE_MS = 2500;

// ---------- Fälle: zufällige, realistische Familien (nur Eingaben, die beide Rechner kennen) ----------
function faelle(N) {
  let seed = 20261121; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const z10 = (x) => Math.round(x / 10) * 10;
  const out = [];
  for (let i = 0; i < N; i++) {
    const partner = rnd() < 0.5, nk = pick([1, 1, 2, 2, 2, 3, 3, 4, 5]);
    const alter = Array.from({ length: nk }, () => (rnd() < 0.25 ? pick([5, 6, 7, 13, 14]) : Math.floor(rnd() * 18)));
    const kinder = nk;
    // Lohn: Netto nach SoLos Lohnsteuer-Rechner (Steuerklasse 2 bzw. 3/5 oder 4/4); beide Rechner bekommen dasselbe Netto
    const brutto = z10(700 + rnd() * 4000);
    const pBrutto = partner && rnd() < 0.45 ? z10(300 + rnd() * 2400) : 0;
    const stkl = partner ? (pBrutto > 0 ? 4 : 3) : 2;
    const o = (s) => ({ stkl: s, kinder: Math.min(kinder, 6), kinderlos: false, pva: Math.max(0, Math.min(4, kinder - 1)), heute: HEUTE });
    const netto = Math.round(R.nettoLohn(brutto, o(stkl)).netto);
    const pNetto = pBrutto ? Math.round(R.nettoLohn(pBrutto, o(4)).netto) : 0;
    // Wohnkosten: Kaltmiete + Nebenkosten + Heizung (Warmmiete), grob nach Haushaltsgröße
    const pers = (partner ? 2 : 1) + nk;
    const kalt = z10(300 + rnd() * 700 + pers * 60), heiz = z10(60 + pers * 20 + rnd() * 60), neben = z10(80 + pers * 25);
    // Unterhalt oder Unterhaltsvorschuss je Kind (nur Alleinerziehende, etwa jede zweite Familie)
    const uh = !partner && rnd() < 0.55 ? pick([0, 150, 200, 227, 299, 350, 394, 450]) : 0;
    out.push({ alter, partner, brutto, netto, pBrutto, pNetto, uh, kalt, neben, heiz, miete: kalt + neben + heiz, vermoegen: z10(rnd() * 8000) });
  }
  // Gegenprobe: dieselbe Familie mit und ohne Unterhalt (prüft, ob der Lotse Einkommen der Kinder berücksichtigt)
  // Die Gegenprobe folgt direkt auf ihre Familie, damit auch ein abgebrochener Lauf vollständige Paare hat.
  const liste = []; let paare = 0;
  for (const f of out) {
    liste.push(f);
    if (f.uh > 0 && paare < 40) { paare++; liste.push(Object.assign({}, f, { uh: 0, gegenprobeZu: liste.length - 1 })); }
  }
  return liste;
}

// ---------- SoLo-Seite ----------
function solo(f) {
  const nk = f.alter.length;
  const inp = { adults: f.partner ? 2 : 1, kids: nk, kidsU6: f.alter.filter((a) => a < 6).length, kids14: f.alter.filter((a) => a >= 14).length,
    art1: 'lohn', art2: f.pBrutto > 0 ? 'lohn' : 'ohne', brutto: f.brutto + f.pBrutto, brutto2: f.pBrutto, netto: f.netto + f.pNetto,
    unterhalt: f.uh * nk, miete: f.miete, heizkosten: f.heiz, mietstufe: '3', vermoegen: f.vermoegen, gebJahr: 1988, bezug: { kindergeld: true }, heute: HEUTE };
  if (!f.partner && f.uh > 0) inp.unterhaltFehlt = false;
  const k = R.evaluate(inp).results.find((r) => r.id === 'kiz');
  // Schätzung als Betrag oder (Alter der Kinder nur grob bekannt) als Spanne: { eur } bzw. { eur: unten, bis: oben }
  const t = k.tx.find((x) => x[0] === 'schaetz.eins' || x[0] === 'schaetz.spanne');
  const sch = t ? [t[0], { a: t[0] === 'schaetz.eins' ? t[1].a : { eur: t[1].a.eur, bis: t[1].b.eur } }] : null;
  const eltern = [{ brutto: f.brutto, netto: f.netto }]; if (f.partner) eltern.push(f.pBrutto ? { brutto: f.pBrutto, netto: f.pNetto } : {});
  const b = K.rechne({ eltern, kinder: f.alter.map((a) => ({ alter: a, unterhalt: f.uh })), wohnkosten: f.miete }, R);
  return { level: k.level, hl: k.hl, schaetzung: sch ? sch[1].a : null, bescheidKiz: b.kiz, bedarfEltern: b.bedarf, einkEltern: b.einkEltern };
}

// ---------- Amtliche Seite: KiZ-Lotse (Playwright) ----------
async function lotse(p, f, protokoll) {
  await p.goto('https://web.arbeitsagentur.de/kiz/lotse', { timeout: 60000 }); await p.waitForTimeout(2000);
  await p.click('#btn-start'); await p.waitForTimeout(1200);
  for (let s = 0; s < 30; s++) {
    const txt = await p.evaluate(() => (document.querySelector('main') || document.body).innerText);
    if (/\bErgebnis\b/.test(txt) && !/Wie hoch|Beziehen Sie|Haben Sie/.test(txt.split('Ergebnis')[1] || '')) return txt.split('Ergebnis')[1].split('Hinweis')[0].replace(/\s+/g, ' ').trim();
    const felder = await p.$$eval('input', (e) => e.filter((x) => x.offsetParent !== null).map((x) => {
      const l = x.id && document.querySelector('label[for="' + x.id + '"]'); return { id: x.id, label: l ? l.innerText.replace(/\s+/g, ' ').trim() : '' };
    }));
    if (protokoll) protokoll.push({ seite: s, text: txt.replace(/\s+/g, ' ').slice(0, 1500), felder });
    const ids = felder.map((x) => x.id);
    const fill = async (id, v) => { if (ids.includes(id)) await p.fill('#' + id, String(v)); };
    const box = async (id, on) => { if (ids.includes(id)) { const c = await p.isChecked('#' + id); if (c !== !!on) await p.click('label[for="' + id + '"]').catch(() => p.click('#' + id)); } };
    await fill('kinderAnzahlInBG', f.alter.length); await fill('kinderAnzahlErhaltenKG', f.alter.length);
    for (let k = 0; k < f.alter.length; k++) await fill('kindAlter_' + k, f.alter[k]);
    await box('grundsicherung', false); await box('partnerVorhanden', f.partner); await box('wohngeldBezug', false);
    if (ids.includes('antragstellerEinkommen_brutto')) { await fill('antragstellerEinkommen_brutto', f.brutto); await fill('antragstellerEinkommen_netto', f.netto); await fill('antragstellerEinkommen_sonstiges', 0); }
    if (ids.includes('partnerEinkommen_brutto')) { await fill('partnerEinkommen_brutto', f.pBrutto); await fill('partnerEinkommen_netto', f.pNetto); await fill('partnerEinkommen_sonstiges', 0); }
    if (ids.includes('kindEinkommen_brutto')) { await fill('kindEinkommen_brutto', 0); await fill('kindEinkommen_netto', 0); await fill('kindEinkommen_sonstiges', f.uh); await box('kindbeziehtKG', true); }
    await fill('antragstellerAusgaben_miete', f.miete);
    const unbekannt = ids.filter((x) => !/^(kinderAnzahl|kindAlter_|grundsicherung|partnerVorhanden|wohngeldBezug|antragsteller|partnerEinkommen|kindEinkommen|kindbeziehtKG|star-rating)/.test(x));
    if (unbekannt.length) return 'UNBEKANNTE FELDER: ' + unbekannt.join(',') + ' | ' + txt.replace(/\s+/g, ' ').slice(0, 300);
    await p.click('#btn-next'); await p.waitForTimeout(1100);
  }
  return 'KEIN ERGEBNIS';
}
const einstufen = (t) => {
  const pos = /Aussicht auf Erfolg|Anspruch auf Kinderzuschlag haben/.test(t) && !/keinen Anspruch/.test(t);
  const neg = /keinen Anspruch|nicht vermieden werden/.test(t);
  return pos ? 'ja' : neg ? 'nein' : null;
};
const grund = (t) => (/Mindesteinkommen/.test(t) ? 'Mindesteinkommen' : /Hilfebedürftigkeit|nicht vermieden/.test(t) ? 'Hilfebedürftigkeit bleibt' : /zu hoch|übersteigt|Höchsteinkommen/.test(t) ? 'Einkommen zu hoch' : /Aussicht/.test(t) ? '' : 'anderer');

// Feste Fallliste für die Gegenprobe: je Fall mit dem Unterhalt aus dem Zufallslauf, ohne Unterhalt und mit 1.000 € je Kind.
// Nummer = Nummer der Familie (ohne eingeschobene Gegenproben), wie in Lauf 1 (kiz-lotse.json vom 21.11.2026, Feld i).
const GP_HOCH = 1000;
function gegenprobeFaelle(nummern) {
  const basis = faelle(Math.max(...nummern) + 1).filter((f) => f.gegenprobeZu === undefined);
  const out = [];
  for (const n of nummern) {
    const f = basis[n];
    out.push(Object.assign({}, f, { fall: n, variante: 'mit' }), Object.assign({}, f, { uh: 0, fall: n, variante: 'ohne' }), Object.assign({}, f, { uh: GP_HOCH, fall: n, variante: 'hoch' }));
  }
  return out;
}

async function abfragen(N, OUT, liste) {
  const { chromium } = require('playwright');
  const alle = (liste || faelle(N)).slice(0, MAX_ABFRAGEN);
  const start = async () => { const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}); return { b, p: await b.newPage({ viewport: { width: 1280, height: 1000 } }) }; };
  let { b, p } = await start(); const out = [];
  const ende = Date.now() + (Number(process.env.ZEIT_MIN) || 105) * 60000; // Zeitbudget: rechtzeitig aufhören, damit das Artefakt hochgeladen wird
  for (let i = 0; i < alle.length && Date.now() < ende; i++) {
    const f = alle[i], prot = i < 2 ? [] : null; let text = null;
    for (let v = 0; v < 2 && text === null; v++) {
      try { text = await lotse(p, f, prot); } catch (e) { text = null; try { await b.close(); } catch (x) { /* egal */ } ({ b, p } = await start()); await new Promise((r) => setTimeout(r, 5000)); }
    }
    out.push(Object.assign({ i, f, text: text && text.slice(0, 400), amtlich: text ? einstufen(text) : null }, prot ? { protokoll: prot } : {}));
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1)); if (out.length % 10 === 0) console.log(out.length + ' Abfragen');
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }
  await b.close(); fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('fertig: ' + out.length + ' Abfragen, ohne Ergebnis: ' + out.filter((x) => x.amtlich === null).length);
}

// Auswertung der festen Gegenprobe: je Fall Lotse und SoLo mit / ohne / hohem Unterhalt
function auswertenGegenprobe(d) {
  const faelleGp = [...new Set(d.map((x) => x.f.fall))].map((n) => {
    const v = (name) => d.find((x) => x.f.fall === n && x.f.variante === name);
    const z = {};
    for (const name of ['mit', 'ohne', 'hoch']) { const x = v(name); if (x) { const s = solo(x.f); z[name] = { lotse: x.amtlich, text: (x.text || '').slice(0, 160), solo: s.level, soloKiz: s.bescheidKiz }; } }
    return { fall: n, f: (v('mit') || v('ohne')).f, z };
  });
  const reagiert = faelleGp.filter((g) => g.z.mit && g.z.ohne && g.z.mit.lotse && g.z.ohne.lotse && g.z.mit.lotse !== g.z.ohne.lotse).length;
  const reagiertHoch = faelleGp.filter((g) => g.z.hoch && g.z.ohne && g.z.hoch.lotse && g.z.ohne.lotse && g.z.hoch.lotse !== g.z.ohne.lotse).length;
  console.log('Gegenprobe Unterhalt (feste Fälle): ' + faelleGp.length + ' Fälle | Lotse ändert Ergebnis mit/ohne: ' + reagiert + ', hoch/ohne: ' + reagiertHoch);
  faelleGp.forEach((g) => console.log('  Fall ' + g.fall + ' ' + ['mit', 'ohne', 'hoch'].map((k) => k + ': Lotse ' + (g.z[k] ? g.z[k].lotse : '-') + ' / SoLo ' + (g.z[k] ? g.z[k].solo + ' ' + g.z[k].soloKiz : '-')).join(' | ')));
  return { modus: 'gegenprobe', n: faelleGp.length, reagiert, reagiertHoch, faelle: faelleGp };
}

function auswerten(IN) {
  const d = JSON.parse(fs.readFileSync(IN, 'utf8'));
  if (d.length && d[0].f && d[0].f.variante) return auswertenGegenprobe(d);
  const haupt = d.filter((x) => x.f.gegenprobeZu === undefined), gp = d.filter((x) => x.f.gegenprobeZu !== undefined);
  const z = { gleich: 0, moeglich: 0, widerspruch: 0, kindEink: 0, offen: 0, lotseJa: 0, lotseNein: 0 }; const wider = [], moeglich = [], grundAnders = [], intern = [], kindEink = [];
  const soloGrund = { minEink: 'Mindesteinkommen', einkoNiedrig: 'Hilfebedürftigkeit bleibt', einkoHoch: 'Einkommen zu hoch' };
  for (const x of haupt) {
    const s = solo(x.f);
    // Interne Gegenprobe: Hauptrechner (Schätzung auf 10 €) gegen Bescheid-Check (auf den Cent) – beide SoLo
    const bk = Math.max(10, Math.round(s.bescheidKiz / 10) * 10);
    if (s.schaetzung && (bk < s.schaetzung.eur - 10 || bk > (s.schaetzung.bis || s.schaetzung.eur) + 10)) intern.push({ i: x.i, f: x.f, s });
    if (x.amtlich === null) { z.offen++; continue; }
    x.amtlich === 'ja' ? z.lotseJa++ : z.lotseNein++;
    if (s.level === 'vielleicht') { z.moeglich++; moeglich.push({ i: x.i, f: x.f, s, amtlich: x.amtlich, grund: grund(x.text || '') }); continue; }
    if ((s.level === 'ja') === (x.amtlich === 'ja')) {
      z.gleich++;
      if (x.amtlich === 'nein' && soloGrund[s.hl] && soloGrund[s.hl] !== grund(x.text || '')) grundAnders.push({ i: x.i, f: x.f, s, lotseGrund: grund(x.text || '') });
    } else if (x.amtlich === 'ja' && x.f.uh > 0 && solo(Object.assign({}, x.f, { uh: 0 })).level !== 'nein') {
      // Erklärt: Der KiZ-Lotse rechnet Einkommen der Kinder nicht ein (Gegenproben 14.11. und 21.11.2026); die Familienkasse rechnet
      // es nach § 6a Abs. 3 BKGG und DA-KiZ C.2.2.1 Abs. 5 zu 45 % an. Ohne Unterhalt stimmt SoLo mit dem Lotsen überein.
      z.kindEink++; kindEink.push({ i: x.i, f: x.f, s });
    } else { z.widerspruch++; wider.push({ i: x.i, f: x.f, s, amtlich: x.amtlich, text: x.text }); }
  }
  // Gegenprobe Unterhalt
  const gpErg = gp.map((x) => { const o = d.find((y) => y.i === x.f.gegenprobeZu); if (!o) return null; return { mit: o && o.amtlich, ohne: x.amtlich, soloMit: solo(o.f).level, soloOhne: solo(x.f).level, f: o.f }; }).filter(Boolean);
  const lotseReagiert = gpErg.filter((g) => g.mit && g.ohne && g.mit !== g.ohne).length;
  const res = { n: haupt.length, z, wider, kindEink, moeglich, grundAnders, intern, gegenprobe: { n: gpErg.length, lotseReagiert, soloReagiert: gpErg.filter((g) => g.soloMit !== g.soloOhne).length, faelle: gpErg } };
  console.log('KiZ-Lotse vs. SoLo: ' + res.n + ' Familien | Lotse ja ' + z.lotseJa + ', nein ' + z.lotseNein + ', ohne Ergebnis ' + z.offen);
  console.log('  gleich ' + z.gleich + ', SoLo „möglich“ ' + z.moeglich + ', WIDERSPRUCH ' + z.widerspruch + ', erklärt durch Einkommen der Kinder ' + z.kindEink + ', Grund anders ' + grundAnders.length + ', intern (Hauptrechner vs. Bescheid-Check > 10 €) ' + intern.length);
  console.log('  Gegenprobe Unterhalt: ' + gpErg.length + ' Paare, Lotse ändert Ergebnis in ' + lotseReagiert + ', SoLo in ' + res.gegenprobe.soloReagiert);
  wider.forEach((w) => console.log('  WIDERSPRUCH ' + JSON.stringify({ i: w.i, f: w.f, solo: w.s, lotse: w.amtlich, text: (w.text || '').slice(0, 140) })));
  return res;
}

// Fallliste aus der Auftragsdatei (Zeile „gegenprobe: Nr,Nr,…“), sonst leer
function auftragListe() {
  let t = '';
  try { t = fs.readFileSync(require('path').join(__dirname, 'amtliche-rechner', 'kiz-vergleich-auftrag.txt'), 'utf8'); } catch (e) { return []; }
  const m = t.match(/^gegenprobe:\s*([0-9,\s]+)$/m);
  return m ? m[1].split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x >= 0).slice(0, Math.floor(40 / 3)) : [];
}

module.exports = { faelle, solo, einstufen, grund, auswerten, gegenprobeFaelle };
if (require.main === module) {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'faelle') faelle(Number(a) || 10).forEach((f, i) => console.log(i, JSON.stringify(f), JSON.stringify(solo(f))));
  else if (cmd === 'abfragen' && process.env.GITHUB_EVENT_NAME === 'push' && auftragListe().length) abfragen(0, b || 'kiz-vergleich.json', gegenprobeFaelle(auftragListe())).catch((e) => { console.error(e); process.exit(1); });
  else if (cmd === 'abfragen') abfragen(Math.min(Number(a) || 50, MAX_ABFRAGEN), b || 'kiz-vergleich.json').catch((e) => { console.error(e); process.exit(1); });
  else if (cmd === 'gegenprobe') {
    const nr = String(a || '').split(',').map(Number).filter((x) => Number.isInteger(x) && x >= 0);
    if (!nr.length) { console.error('gegenprobe: Fallnummern fehlen'); process.exit(1); }
    abfragen(0, b || 'kiz-gegenprobe.json', gegenprobeFaelle(nr)).catch((e) => { console.error(e); process.exit(1); });
  } else if (cmd === 'auswerten') { const r = auswerten(a); if (b) fs.writeFileSync(b, JSON.stringify(r, null, 1)); }
  else console.log('Aufruf: faelle <N> | abfragen <N> <Ausgabe.json> | gegenprobe <Nr,Nr,…> <Ausgabe.json> | auswerten <Ergebnis.json> [Auswertung.json]');
}
