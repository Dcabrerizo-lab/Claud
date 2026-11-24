// Tests: Bescheid-Check Wohngeld (Erweiterung, nicht Teil von npm test der App 1.2.0)
// Prüft die Rechnung gegen alle Ergebnisse des amtlichen Wohngeldrechners, die im Projekt liegen (Abgleiche 2026).
'use strict';
const Rules = require('../../src/rules.js');
const W = require('../../erweiterungen/bescheid-wg.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

// 1. Amtlicher Wohngeldrechner: gleiche Eingaben wie beim Abgleich (tools/amtliche-rechner/gross.js):
//    Bruttokaltmiete = Warmmiete − Heizkosten (ohne Angabe: Heizkostenkomponente), Lohn mit Steuer/KV/RV (30 %), Rente mit Steuer/KV (20 %)
const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4];
let faelle = 0, genau = 0, maxAbw = 0;
for (const datei of ['amtlich-gross-wohngeld', 'amtlich-gross-wg2', 'amtlich-gross-wggrenz', 'amtlich-wohngeld']) {
  const d = require('../' + datei + '.json');
  const liste = Array.isArray(d) ? d : Object.values(d).find(Array.isArray);
  for (const x of liste) {
    if (x.amtlich == null) continue;
    const g = x.f, heiz = g.heiz || HEIZ[Math.min(g.persons, 5) - 1] + Math.max(0, g.persons - 5) * 27.6;
    const abz = g.art === 'lohn' ? { steuer: true, kv: true, rv: true } : { steuer: true, kv: true };
    const mitglieder = [Object.assign({ art: g.art, brutto: g.b1 }, abz)];
    if (g.adults === 2) mitglieder.push(g.b2 > 0 ? Object.assign({ art: g.art, brutto: g.b2 }, abz) : { art: 'ohne', brutto: 0 });
    const r = W.rechne({ personen: g.persons, stufe: g.stufe, bruttokalt: Math.max(0, g.warm - heiz), mitglieder, alleinerziehend: g.adults === 1 && g.kids > 0 }, Rules);
    const abw = Math.abs(r.wohngeld - x.amtlich);
    faelle++; if (abw === 0) genau++; maxAbw = Math.max(maxAbw, abw);
    if (abw > 1) ok(`${datei}: höchstens 1 € Abweichung`, false, { g, amtlich: x.amtlich, solo: r.wohngeld });
  }
}
ok('Amtliche Fälle gelesen', faelle >= 7000, faelle);
ok('Höchstens 1 € Abweichung zum amtlichen Rechner', maxAbw <= 1, maxAbw);
ok('Mindestens 85 % auf den Euro genau', genau / faelle >= 0.85, { genau, faelle });

// 2. Einzelregeln
const R = Rules.RULES;
const basis = { personen: 1, stufe: 3, bruttokalt: 400, mitglieder: [{ art: 'rente', brutto: 1000, steuer: false, kv: true }] };
const r1 = W.rechne(basis, Rules);
ok('Miete = Bruttokalt + Heizkostenkomponente', r1.miete === Math.round((400 + Rules.wgHeiz(1)) * 100) / 100, r1);
ok('Höchstbetrag kappt', W.rechne(Object.assign({}, basis, { bruttokalt: 2000 }), Rules).mieteGekappt === true && W.rechne(Object.assign({}, basis, { bruttokalt: 2000 }), Rules).miete === Math.round((Rules.wgCap(3, 1) + Rules.wgHeiz(1)) * 100) / 100);
ok('Rente: Werbungskosten 8,50 € und 10 % Abzug', Math.abs(r1.einkommen - (1000 - 8.5) * 0.9) < 0.01, r1.einkommen);
ok('Abzug aus Prozentangabe und aus Häkchen', W.abzugAus({ abzug: 20 }) === 0.2 && Math.abs(W.abzugAus({ steuer: true, kv: true, rv: true }) - 0.3) < 1e-9 && W.abzugAus({}) === 0);
// Elterngeld-Freibetrag (§ 14 Abs. 2 Nr. 6 WoGG i. V. m. § 10 Abs. 1, 3, 4 BEEG, buzer.de, abgerufen 24.11.2026): 300 €, Plus 150 €, je Kind der Geburt
const egW = (m) => W.rechne({ personen: 2, stufe: 3, bruttokalt: 500, mitglieder: [Object.assign({ art: 'eg' }, m)] }, Rules);
ok('Basiselterngeld bis 300 € kein Einkommen', egW({ brutto: 300, egPlus: false }).einkommen === 0);
ok('ElterngeldPlus: nur 150 € frei', egW({ brutto: 300, egPlus: true }).einkommen === 150);
ok('Zwillinge, Basiselterngeld 600 €: 600 € frei (§ 10 Abs. 4 BEEG)', egW({ brutto: 600, egPlus: false, egKinder: 2 }).einkommen === 0);
ok('Kein Abzug „Einkommen vor der Geburt“ beim Wohngeld: Mindestbetrag 300 € Basis frei', egW({ brutto: 300, egPlus: false }).einkommen === 0);
ok('Unbekannt, 300 € (Basis oder Plus möglich): vorsichtig 150 € frei, offen', egW({ brutto: 300 }).einkommen === 150 && egW({ brutto: 300 }).egOffen === true);
ok('Unbekannt, 200 € (unter Basis-Mindestbetrag): sicher Plus, 150 € frei', egW({ brutto: 200 }).einkommen === 50 && !egW({ brutto: 200 }).egOffen);
ok('Unbekannt, 1.200 € (über höchstem Plus 990 €): sicher Basis, 300 € frei', egW({ brutto: 1200 }).einkommen === 900 && !egW({ brutto: 1200 }).egOffen);
{
  const f = { personen: 2, stufe: 3, bruttokalt: 500, mitglieder: [{ art: 'eg', brutto: 600 }] };
  const hoch = W.rechne(f, Rules, { egHoch: true }), tief = W.rechne(f, Rules);
  const p = W.pruefe(Object.assign({}, f, { bescheid: { miete: hoch.miete, einkommen: hoch.einkommen, wohngeld: hoch.wohngeld } }), Rules);
  ok('Offen: Bescheid mit 300 € Freibetrag gilt als passend', p.posten.every((x) => x.wirkung === 'passt') && p.zuWenigImMonat === 0, p.posten);
  const q = W.pruefe(Object.assign({}, f, { bescheid: { miete: tief.miete, einkommen: tief.einkommen, wohngeld: tief.wohngeld } }), Rules);
  ok('Offen: Bescheid mit 150 € Freibetrag gilt als passend', q.posten.every((x) => x.wirkung === 'passt'), q.posten);
}
ok('Unterhalt ohne Abzug', W.rechne({ personen: 2, stufe: 3, bruttokalt: 500, mitglieder: [{ art: 'ohne', brutto: 0, unterhalt: 250 }] }, Rules).einkommen === 250);
ok('Freibetrag Alleinerziehende', W.rechne({ personen: 2, stufe: 3, bruttokalt: 500, mitglieder: [{ art: 'ohne', unterhalt: 500 }], alleinerziehend: true }, Rules).einkommen === 500 - R.wohngeld.freibetragAlleinerzMonat);
ok('Freibetrag Schwerbehinderung je Person', W.rechne({ personen: 2, stufe: 3, bruttokalt: 500, mitglieder: [{ art: 'ohne', unterhalt: 500 }], schwerbehindert: 2 }, Rules).einkommen === 500 - 2 * R.wohngeld.freibetragBehinderungMonat);
ok('Unter 10 € kein Wohngeld', W.rechne({ personen: 1, stufe: 1, bruttokalt: 300, mitglieder: [{ art: 'lohn', brutto: 2200, steuer: true, kv: true, rv: true }] }, Rules).wohngeld === 0);

// 3. Durchgerechneter Bescheid: Paar mit 2 Kindern, Mietenstufe IV, Bruttokalt 800 €, Lohn 2.600 € brutto (30 %)
const e = { personen: 4, stufe: 4, bruttokalt: 800, mitglieder: [{ art: 'lohn', brutto: 2600, steuer: true, kv: true, rv: true }, { art: 'ohne' }] };
const soll = W.rechne(e, Rules);
ok('Beispiel: Miete 800 + 197,80 = 997,80', soll.miete === 997.8, soll.miete);
ok('Beispiel: Einkommen (2.600 − 102,50) × 0,7 = 1.748,25', soll.einkommen === 1748.25, soll.einkommen);
const richtig = W.pruefe(Object.assign({ bescheid: { miete: soll.miete, einkommen: soll.einkommen, wohngeld: soll.wohngeld } }, e), Rules);
ok('Richtiger Bescheid: alles passt', richtig.posten.every((p) => p.wirkung === 'passt') && richtig.gruende.length === 0, richtig.posten);
// Fehler 1: Heizkostenkomponente vergessen
const ohneHeiz = W.pruefe(Object.assign({ bescheid: { miete: 800, einkommen: soll.einkommen, wohngeld: W.ausBescheid(4, 800, soll.einkommen, Rules) } }, e), Rules);
ok('Heizkostenkomponente vergessen → Miete zu niedrig', ohneHeiz.posten.find((p) => p.key === 'miete').wirkung === 'zuWenig' && /Heizkostenkomponente/.test(ohneHeiz.gruende[0].grund));
ok('… und Wohngeld zu niedrig', ohneHeiz.zuWenigImMonat > 0, ohneHeiz.zuWenigImMonat);
// Fehler 2: nur 20 % Abzug statt 30 %
const y20 = Math.round((2600 - 102.5) * 0.8 * 100) / 100;
const abzug20 = W.pruefe(Object.assign({ bescheid: { miete: soll.miete, einkommen: y20, wohngeld: W.ausBescheid(4, soll.miete, y20, Rules) } }, e), Rules);
ok('Zu kleiner Pauschalabzug → Einkommen zu hoch', abzug20.posten.find((p) => p.key === 'einkommen').wirkung === 'zuWenig');
ok('Formel mit Bescheid-Zahlen stimmt (kein Rechenfehler)', abzug20.posten.find((p) => p.key === 'formel').wirkung === 'passt');
// Fehler 3: Rechenfehler bei richtigen Grundlagen
const rf = W.pruefe(Object.assign({ bescheid: { miete: soll.miete, einkommen: soll.einkommen, wohngeld: soll.wohngeld - 25 } }, e), Rules);
ok('Rechenfehler erkannt', rf.posten.find((p) => p.key === 'formel').wirkung === 'zuWenig' && rf.zuWenigImMonat === 25);
ok('Grenzen genannt', /Mietenstufe/.test(rf.grenzen));

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bescheid-Check Wohngeld: alle ${n} Prüfungen bestanden (${faelle} amtliche Fälle, ${genau} auf den Euro genau, höchstens ${maxAbw} € Abweichung)`);
process.exit(f ? 1 : 0);
