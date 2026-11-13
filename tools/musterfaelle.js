// Musterfälle zum Abgleich mit den amtlichen Rechnern. Erzeugt docs/Musterfaelle-Abgleich.csv (für Excel/LibreOffice)
// mit Eingaben, dem Ergebnis der App und leeren Spalten für das Ergebnis des amtlichen Rechners.
// Aufruf: node tools/musterfaelle.js   (nach jeder Regeländerung neu erzeugen)
'use strict';
const fs = require('fs');
const path = require('path');
const R = require('../test/rules-de.js');

const base = { adults: 1, kids: 0, young: 0, kidsU6: 0, brutto: 0, brutto2: '', netto: '', miete: 0, vermoegen: 0, heute: 2026.85, bezug: {} };
const ev = (o) => { const m = {}; R.evaluate({ ...base, ...o }).results.forEach((x) => { m[x.id] = x; }); return m; };
const STUFE = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII' };
const LV = { ja: 'wahrscheinlich', vielleicht: 'möglich', nein: 'unwahrscheinlich', na: 'schon vorhanden' };
const betrag = (x) => {
  const t = x.tx.find((a) => /^schaetz\./.test(a[0]));
  if (!t) return '';
  const p = t[1];
  if (t[0] === 'schaetz.spanne') return p.a + ' bis ' + p.b;
  if (t[0] === 'schaetz.bis') return 'bis ' + p.b;
  if (t[0] === 'schaetz.mind') return 'mindestens ' + p.a;
  return 'etwa ' + p.a;
};
const zeilen = [];
const add = (rechner, haushalt, eingaben, x, zusatz) => zeilen.push([zeilen.length + 1, rechner, haushalt, eingaben, LV[x.level], (zusatz || betrag(x)), '', '']);

// ---------- Wohngeld (Wohngeldrechner des Bundesbauministeriums) ----------
const WG = 'Wohngeldrechner (Bundesbauministerium)';
const wg = [
  [1, 0, 'rente', 1100, 0, 520, 3, 'Rentnerin allein'],
  [1, 0, 'rente', 1400, 0, 650, 4, 'Rentner allein'],
  [1, 0, 'lohn', 1600, 0, 600, 3, 'Teilzeit allein'],
  [1, 1, 'lohn', 1900, 0, 750, 4, 'Alleinerziehend, 1 Kind'],
  [1, 2, 'lohn', 2200, 0, 900, 5, 'Alleinerziehend, 2 Kinder'],
  [2, 0, 'rente', 1500, 700, 700, 3, 'Rentnerpaar'],
  [2, 1, 'lohn', 2600, 0, 850, 3, 'Paar, 1 Kind, ein Verdienst'],
  [2, 2, 'lohn', 2800, 600, 1000, 6, 'Paar, 2 Kinder'],
  [2, 3, 'lohn', 3200, 0, 1150, 7, 'Paar, 3 Kinder, teure Stadt'],
  [2, 4, 'lohn', 3600, 0, 1300, 4, 'Paar, 4 Kinder'],
  [1, 0, 'lohn', 2000, 0, 800, 7, 'Allein, teure Stadt'],
  [2, 2, 'lohn', 4200, 0, 1100, 3, 'Paar, 2 Kinder, mittleres Einkommen']
];
for (const [ad, k, art, b1, b2, miete, st, txt] of wg) {
  const e = { adults: ad, kids: k, art1: art, art2: b2 ? art : '', brutto: b1 + b2, brutto2: ad === 2 ? b2 : '', netto: Math.round((b1 + b2) * (art === 'lohn' ? 0.72 : 0.89)), miete, mietstufe: String(st) };
  const abz = art === 'lohn' ? 'Steuern, Kranken- und Rentenversicherung: ja' : 'Kranken- und Pflegeversicherung: ja, Steuern: nein';
  // Die App fragt die Warmmiete; der Wohngeldrechner will die Bruttokaltmiete (ohne Heizung). Die App zieht dafür pauschal
  // die Heizkosten-Entlastung ab (§ 12 Abs. 6 WoGG) – genau diesen Wert für den amtlichen Rechner angeben.
  const heiz = Math.round(R.wgHeiz(ad + k));
  const eingaben = ad + ' Erwachsene, ' + k + ' Kinder; Gemeinde mit Mietenstufe ' + STUFE[st] + '; Bruttokaltmiete ' + (miete - heiz) + ' €/Monat (Warmmiete ' + miete + ' € minus Heizung ' + heiz + ' €); ' +
    (art === 'lohn' ? 'Lohn' : 'Rente') + ' brutto ' + b1 + ' €' + (b2 ? ' und ' + b2 + ' €' : '') + '/Monat (Jahr: ' + (b1 + b2) * 12 + ' €); ' + abz;
  add(WG, txt, eingaben, ev(e).wohngeld);
}
// ---------- Kinderzuschlag (KiZ-Lotse der Familienkasse) ----------
const KZ = 'KiZ-Lotse (Familienkasse)';
const kz = [[1, 1, 1500, 650, 'Alleinerziehend, 1 Kind'], [1, 2, 1900, 800, 'Alleinerziehend, 2 Kinder'], [2, 1, 2200, 800, 'Paar, 1 Kind'],
  [2, 2, 2600, 950, 'Paar, 2 Kinder'], [2, 2, 3400, 950, 'Paar, 2 Kinder, mehr Einkommen'], [2, 3, 3000, 1100, 'Paar, 3 Kinder'], [2, 4, 3500, 1250, 'Paar, 4 Kinder'], [2, 2, 1300, 900, 'Paar, 2 Kinder, wenig Einkommen']];
for (const [ad, k, b, miete, txt] of kz) {
  const e = { adults: ad, kids: k, art1: 'lohn', brutto: b, netto: Math.round(b * 0.75), miete, mietstufe: '3' };
  add(KZ, txt, ad + ' Erwachsene, ' + k + ' Kinder (6 bis 13 Jahre); Lohn brutto ' + b + ' €, netto ' + e.netto + ' €; Warmmiete ' + miete + ' €; kein Unterhalt, kein Vermögen', ev(e).kiz);
}
// ---------- Elterngeld (Elterngeldrechner des Bundesfamilienministeriums) ----------
const EG = 'Elterngeldrechner (Bundesfamilienministerium)';
for (const vor of [0, 500, 900, 1100, 1300, 1800, 2600, 3200]) {
  const x = ev({ baby: 'da', egVor: vor }).elterngeld;
  const t = x.tx.find((a) => a[0] === 'eg.ja');
  add(EG, 'Ein Kind, Netto vorher ' + vor + ' €', 'Geburt 2026, ein Kind, keine Geschwister, Netto vor der Geburt ' + vor + ' €/Monat (Durchschnitt 12 Monate), kein Einkommen nach der Geburt', x, 'Basis ' + t[1].basis + ', ElterngeldPlus ' + t[1].plus);
}
// ---------- Grundsicherungsgeld (Rechner des Jobcenters oder einer Beratungsstelle) ----------
const GG = 'Grundsicherungsgeld-Rechner (z. B. Jobcenter, Beratungsstelle)';
const gg = [[1, 0, 'ohne', 0, 480, 'Allein, kein Einkommen'], [1, 0, 'lohn', 900, 520, 'Allein, Teilzeit'], [1, 1, 'lohn', 1200, 650, 'Alleinerziehend, 1 Kind (5 Jahre)'],
  [2, 2, 'lohn', 2000, 850, 'Paar, 2 Kinder'], [2, 0, 'alg', 1100, 600, 'Paar, Arbeitslosengeld'], [1, 2, 'ohne', 0, 750, 'Alleinerziehend, 2 Kinder, kein Einkommen']];
for (const [ad, k, art, b, miete, txt] of gg) {
  const e = { adults: ad, kids: k, kidsU6: k ? 1 : 0, art1: art, brutto: b, netto: art === 'lohn' ? Math.round(b * 0.8) : b, miete, vermoegen: 0, gebJahr: 1990 };
  add(GG, txt, ad + ' Erwachsene, ' + k + ' Kinder; ' + (art === 'ohne' ? 'kein Einkommen' : (art === 'lohn' ? 'Lohn brutto ' + b + ' €, netto ' + e.netto + ' €' : 'Arbeitslosengeld ' + b + ' €')) + '; Warmmiete ' + miete + ' € (angemessen); kein Vermögen', ev(e).ggeld);
}
// ---------- Arbeitslosengeld I und Krankengeld ----------
const AL = 'Arbeitslosengeldrechner (Arbeitsagentur)';
for (const [lohn, kind] of [[2000, false], [3000, true], [4500, false]]) {
  add(AL, 'Lohn ' + lohn + ' €' + (kind ? ', mit Kind' : ''), 'Steuerklasse I' + (kind ? ' (mit Kinderfreibetrag)' : '') + ', Brutto ' + lohn + ' €/Monat, 24 Monate versichert, 46 Jahre', ev({ arbeitSit: 'arbeitslos', algZeit: true, algMonate: 24, gebJahr: 1980, lohnVorher: lohn, kids: kind ? 1 : 0 }).alg1);
}
const KR = 'Krankengeldrechner (z. B. einer Krankenkasse)';
for (const lohn of [2500, 4000]) add(KR, 'Lohn ' + lohn + ' €', 'Steuerklasse I, Brutto ' + lohn + ' €/Monat, gesetzlich versichert', ev({ arbeitSit: 'krank', krankWochen: 'laeuft', lohnVorher: lohn }).krankengeld);

const kopf = ['Nr', 'Amtlicher Rechner', 'Haushalt', 'Eingaben für den Rechner', 'App: Einstufung', 'App: Betrag im Monat', 'Amtlicher Rechner: Betrag', 'Passt? (ja/nein, Bemerkung)'];
const csv = '﻿' + [kopf].concat(zeilen).map((z) => z.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\r\n') + '\r\n';
const ziel = path.join(__dirname, '..', 'docs', 'Musterfaelle-Abgleich.csv');
fs.writeFileSync(ziel, csv);
console.log(zeilen.length + ' Musterfälle geschrieben: ' + path.relative(process.cwd(), ziel));
