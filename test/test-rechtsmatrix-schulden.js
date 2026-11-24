// Rechtsmatrix Schulden, Pfändung, Fristen, Brief prüfen (Vollprüfung 24.11.2026): Fälle aus test/rechtsmatrix/schulden.json
// (Prüfer „schulden-briefe“, Blindprüfung „fable“, Ergänzungen der Korrektur) gegen die App-Funktionen und gegen eine unabhängige
// Rechnung nach dem Gesetzestext (§ 850c ZPO mit Pfändungsfreigrenzenbekanntmachung 2026, § 37 Abs. 2 SGB X, § 64 SGG, § 222 ZPO).
// Übersicht mit Quellen: docs/rechtsmatrix/schulden.md. Exit 1 bei Abweichung.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const req = (p) => require(path.join(ROOT, p));
const Rules = req('src/rules.js');
const Schulden = req('src/schulden.js');
const FO = req('src/fristen.js');
const FE = req('erweiterungen/fristen.js');
const BL = req('erweiterungen/brief-lesen.js');
global.BriefLesen = BL; // src/fristen.js liest Briefe über BriefLesen
const Geld = req('src/geld.js');
const Haushalt = req('src/haushalt.js');
const BS2 = req('erweiterungen/bescheid-sgb2.js');
const BG = req('erweiterungen/bescheid-gsa.js');
const Formulare = req('src/formulare.js');
const M = require('./rechtsmatrix/schulden.json');

let ok = 0, fehler = 0;
const prf = (id, ist, soll, tol) => {
  const gut = typeof soll === 'number' ? typeof ist === 'number' && Math.abs(ist - soll) <= (tol || 0.005) + 1e-9 : ist === soll;
  if (gut) ok++; else { fehler++; console.log(`FEHLER ${id}: ist ${JSON.stringify(ist)}, soll ${JSON.stringify(soll)}`); }
};
const hol = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);

// ---------- unabhängige Referenzen ----------
// § 850c ZPO + PfändfreiGrBek 2026 (BGBl. 2026 I Nr. 80): 1.587,40 / 597,42 / 332,83 / 4.866,30 €; Abs. 5: auf 10 € abrunden
function refPfaendung(netto, n) {
  n = Math.min(5, n);
  const frei = 1587.40 + (n >= 1 ? 597.42 : 0) + Math.max(0, n - 1) * 332.83;
  const q = [0.7, 0.5, 0.4, 0.3, 0.2, 0.1][n];
  const mehr = Math.max(0, netto - 4866.30);
  const stufe = Math.floor((netto - mehr) / 10) * 10;
  const teil = stufe > frei ? Math.round((stufe - frei) * q * 100 + 1e-6) / 100 : 0;
  return Math.round((teil + mehr) * 100) / 100;
}
// § 899 Abs. 1, § 902 Satz 1 Nr. 1a, Nr. 5 ZPO; Kindergeld 2026: 259 € (§ 66 EStG)
function refPkonto(n, kg) { n = Math.min(5, n); return Math.round((1590 + (n >= 1 ? 597.42 : 0) + Math.max(0, n - 1) * 332.83 + kg * 259) * 100) / 100; }
// Kalender: bundesweite Feiertage über das Osterdatum (Gauß), unabhängig von der App
const fmt = (d) => d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
const tag = (y, m, d) => new Date(Date.UTC(y, m, d, 12));
function ostern(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return tag(y, mo - 1, da); }
const FT = {};
const feiertage = (y) => { if (!FT[y]) { const o = ostern(y), p = (k) => fmt(tag(y, o.getUTCMonth(), o.getUTCDate() + k)); FT[y] = new Set([y + '-01-01', p(-2), p(1), y + '-05-01', p(39), p(50), y + '-10-03', y + '-12-25', y + '-12-26']); } return FT[y]; };
const werktag = (d) => { while (d.getUTCDay() % 6 === 0 || feiertage(d.getUTCFullYear()).has(fmt(d))) d = tag(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1); return fmt(d); };
const d0 = (s) => { const [y, m, t] = s.split('-').map(Number); return tag(y, m - 1, t); };
const refWid = (s) => { const b = d0(s); b.setUTCDate(b.getUTCDate() + 4); const y = b.getUTCFullYear() + (b.getUTCMonth() === 11 ? 1 : 0), m = (b.getUTCMonth() + 1) % 12; const l = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return werktag(tag(y, m, Math.min(b.getUTCDate(), l))); };
const refMb = (s) => { const b = d0(s); return werktag(tag(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate() + 14)); };

// ---------- Fälle Prüfer „schulden-briefe“ ----------
for (const f of M.claude) {
  const h = f.h, e = f.erwartet;
  if (f.fn === 'pfaendung') {
    prf(f.id + ' Rules', Rules.pfaendung(h.netto, h.personen).pfaendbar, e.pfaendung.betrag, e.pfaendung.toleranz);
    prf(f.id + ' Referenz', refPfaendung(h.netto, h.personen), e.pfaendung.betrag, e.pfaendung.toleranz);
  } else if (f.fn === 'pkonto') {
    prf(f.id + ' Rules', Rules.pkonto({ personen: h.personen, kindergeldKinder: h.kindergeldKinder, kiz: h.kiz || 0 }).gesamt, e.pkonto.betrag);
    prf(f.id + ' Referenz', refPkonto(h.personen, h.kindergeldKinder) + (h.kiz || 0), e.pkonto.betrag);
  } else if (f.fn === 'widerspruch') {
    prf(f.id + ' src/fristen.js', FO.widerspruch(h.datum, h.zugang || null, h.erhalten || null).bis, e.frist.datum);
    if (!h.zugang && !h.erhalten) {
      prf(f.id + ' erweiterungen/fristen.js', FE.widerspruch({ datum: h.datum }).fristende, e.frist.datum);
      prf(f.id + ' Referenz', refWid(h.datum), e.frist.datum);
    }
  } else if (f.fn === 'mahnbescheid') {
    prf(f.id + ' schulden.js', Schulden.fristEnde(h.zugestellt, 14), e.frist.datum);
    prf(f.id + ' fristen.js', FO.rechne({ art: h.art || 'mb', basis: { zugang: h.zugestellt } }).bis, e.frist.datum);
    prf(f.id + ' Referenz', refMb(h.zugestellt), e.frist.datum);
  } else if (f.fn === 'rate') {
    const r = Geld.rateEmpfehlung(h.hh, h.liste || []);
    prf(f.id + ' art', r.art, e.rate.status);
    if (e.rate.betrag !== undefined) prf(f.id + ' rate (Cent)', r.rate, e.rate.betrag);
  } else if (f.fn === 'bescheidSGB2') {
    const r = BS2.pruefe(h, Rules);
    for (const k of Object.keys(e)) prf(f.id + ' ' + k, r.erwartet[k], e[k].betrag, e[k].toleranz);
  } else { fehler++; console.log('FEHLER unbekannte Funktion ' + f.fn + ' in ' + f.id); }
}

// ---------- Fälle Blindprüfung ----------
const ruf = (t) => {
  const e = t.eingabe;
  switch (t.funktion) {
    case 'Rules.pfaendung': return Rules.pfaendung(e.netto, e.personen);
    case 'Rules.pkonto': return Rules.pkonto(e);
    case 'FristenOrdner.widerspruch': return FO.widerspruch(e.datum, e.zugang, e.erhalten);
    case 'Fristen.widerspruch': return FE.widerspruch(e);
    case 'FristenOrdner.rechne': return FO.rechne(e);
    case 'Schulden.fristEnde': return { bis: Schulden.fristEnde(e.zu, e.tage) };
    case 'FristenOrdner.ausBrief': return FO.ausBrief(e.text, e.art, e.erhalten) || { bis: null };
    case 'BriefLesen.lies.datum': return { datum: BL.lies(e.text, e.art).datum };
    case 'BriefLesen.andere': return BL.andere(e.text);
    case 'BescheidSGB2.pruefe': return BS2.pruefe(e, Rules);
    case 'BescheidGSA.pruefe': return BG.pruefe(e, Rules);
    default: throw new Error('unbekannte Funktion ' + t.funktion);
  }
};
for (const t of M.fable) {
  let r; try { r = ruf(t); } catch (x) { r = { fehler: String(x) }; }
  for (const [k, v] of Object.entries(t.erwartet)) { if (k !== 'toleranz') prf(t.id + ' ' + k, hol(r, k), v, t.erwartet.toleranz); }
}

// ---------- Ergänzungen der Korrektur ----------
for (const f of M.eigen) {
  const h = f.h, e = f.erwartet;
  if (f.fn === 'pfBasis') prf(f.id, Haushalt.pfaendbarBasis(h.g), e.pfBasis);
  else if (f.fn === 'erkenne') prf(f.id, BL.erkenne(h.text).art, e.art);
  else if (f.fn === 'andere') { const r = BL.andere(h.text); if ('anzahlFristen' in e) prf(f.id, r.fristen.length, e.anzahlFristen); if ('frist0' in e) prf(f.id, r.fristen[0] && r.fristen[0].frist, e.frist0); }
  else if (f.fn === 'datum') prf(f.id, BL.lies(h.text, null).datum, e.datum);
  else if (f.fn === 'formulare') {
    const p = Formulare.plan(h.s, { name: '', geb: '', strasse: '', ort: '', tel: '' }, [{ id: 'ggeld', level: 'ja' }]).find((x) => x.id === 'ggeld');
    prf(f.id, !!p && p.hilfe.some((x) => /Anlage WEP für jedes Kind ab 15/.test(x)), e.wep);
  } else if (f.fn === 'unterlagen') { const u = Rules.STEPS[h.karte].u; prf(f.id + ' enthält', u.includes(e.enthaelt), true); prf(f.id + ' nicht', u.includes(e.nicht), false); }
  else { fehler++; console.log('FEHLER unbekannte Funktion ' + f.fn + ' in ' + f.id); }
}

// ---------- Ratenvorschlag aus dem Haushaltsplan: Obergrenze nur aus dem pfändbaren eigenen Einkommen ----------
{
  const r = Geld.rateEmpfehlung({ ein: 400000, aus: 200000, wesentlich: true, kindergeld: 0, personen: 1, pfBasis: Haushalt.pfaendbarBasis({ ek1: 150000, ek1Art: 'lohn', ek2: 150000, ek2Art: 'lohn', zwei: true }) }, []);
  prf('RA-Paar 2 × 1.500 € netto, Person 1 mit 1 Unterhaltsberechtigten: nichts pfändbar', r.art, 'unpfaendbar');
}

// ---------- Massenprüfungen (unabhängige Rechnung) ----------
let n1 = 0, a1 = 0;
for (let p = 0; p <= 5; p++) for (let c = 0; c <= 600000; c += 37) { n1++; if (Math.abs(Rules.pfaendung(c / 100, p).pfaendbar - refPfaendung(c / 100, p)) > 0.005) { a1++; if (a1 < 5) console.log('FEHLER Pfändung', c / 100, p); } }
let n2 = 0, a2 = 0;
for (let d = tag(2025, 0, 1); d < tag(2028, 10, 25); d = tag(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)) {
  const s = fmt(d), soll = refWid(s), soll2 = refMb(s); n2++;
  if (FO.widerspruch(s).bis !== soll || FE.widerspruch({ datum: s }).fristende !== soll || FO.rechne({ art: 'mb', basis: { zugang: s } }).bis !== soll2 || Schulden.fristEnde(s, 14) !== soll2) { a2++; if (a2 < 5) console.log('FEHLER Frist', s, soll, soll2); }
}
fehler += a1 + a2; ok += n1 - a1 + n2 - a2;

console.log(`Rechtsmatrix Schulden: ${ok} Prüfungen stimmen, ${fehler} weichen ab (${M.claude.length + M.fable.length + M.eigen.length} Fälle, ${n1} Pfändungswerte, ${n2} Fristtage).`);
process.exitCode = fehler ? 1 : 0;
