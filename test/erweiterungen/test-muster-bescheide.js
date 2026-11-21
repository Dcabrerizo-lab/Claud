// Tests: Brief einlesen und Gutachten-Import mit öffentlich verfügbaren Muster-Bescheiden (Quellen in test/erweiterungen/muster/*.txt,
// abgerufen am 21.11.2026; alle Namen und Zahlen dort sind erfundene Musterdaten). Text wie aus der PDF (pdftotext -layout: Spalten,
// Kopf- und Fußzeilen, Seitenumbrüche, Wasserzeichen-Reste) und zusätzlich mit typischen Fehlern der Texterkennung.
// Erwartete Werte stehen im jeweiligen Muster selbst.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../../erweiterungen/brief-lesen.js');
const I = require('../../erweiterungen/pflege-import.js');
const P = require('../../erweiterungen/pflege.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
const lade = (d) => fs.readFileSync(path.join(__dirname, 'muster', d), 'utf8').split('\n').filter((z) => !z.startsWith('# ')).join('\n');

// Typische Fehler der Handy-Texterkennung in Zahlen (O statt 0, l statt 1, Punkt statt Komma, Leerzeichen nach dem Komma)
function ocrFehler(t) {
  let i = 0;
  return t.replace(/\d{1,3}(?:\.\d{3})*,\d{2}/g, (b) => {
    i++;
    if (i % 4 === 1) return b.replace(/0/g, 'O');
    if (i % 4 === 2) return b.replace(/^1/, 'l');
    if (i % 4 === 3) return b.includes('.') ? b.replace(',', '.') : b.replace(',', ', ');
    return b;
  });
}
// Ohne Spalten: pdf.js setzt Spalten mit gleicher Höhe in eine Zeile (wie src/app.js pdfZeilen)
const einfach = (t) => t.split('\n').map((z) => z.replace(/\s+/g, ' ').trim()).join('\n');

// Erwartete Werte je Muster (aus dem Muster selbst abgelesen); auch von tools/scan-muster.js genutzt
const FAELLE = require('./muster/erwartet.json');
// Zeichen aus dem Spaltenkopf nur mit erhaltenen Spalten; ohne Spalten bleibt es leer (lieber leer als unsicher)
const NUR_LAYOUT = ['wg-az'];

const bericht = [];
for (const fa of FAELLE) {
  const roh = lade(fa.datei);
  for (const [variante, text] of [['PDF', roh], ['pdf.js', einfach(roh)], ['Texterkennung', ocrFehler(roh)]]) {
    const r = L.lies(text, fa.fest || null);
    const tag = `${fa.datei} (${variante})`;
    ok(`${tag}: Art`, r.art === fa.art, r.art);
    if (fa.datum) ok(`${tag}: Datum`, r.datum === fa.datum, r.datum);
    let richtig = 0;
    for (const [id, soll] of Object.entries(fa.felder)) {
      if (variante === 'pdf.js' && NUR_LAYOUT.includes(id)) { ok(`${tag}: ${id} ohne Spalten leer`, r.felder[id] === undefined, r.felder[id]); richtig++; continue; }
      const ist = r.felder[id];
      const gleich = typeof soll === 'number' ? Math.abs(ist - soll) < 0.005 : ist === soll;
      if (gleich) richtig++;
      ok(`${tag}: ${id}`, gleich, { soll, ist });
    }
    if (fa.posten) ok(`${tag}: Posten`, r.posten.length === fa.posten, r.posten);
    bericht.push(`${tag}: ${richtig}/${Object.keys(fa.felder).length}`);
  }
}

// Echter PDF-Weg der App (pdf.js-Reihenfolge: Fußzeilen zuerst, Spaltenköpfe und Werte in getrennten Zeilen)
for (const fa of FAELLE) {
  const datei = path.join(__dirname, 'muster', 'pdfjs', fa.datei);
  if (!fs.existsSync(datei)) continue;
  const r = L.lies(lade('pdfjs/' + fa.datei), fa.fest || null);
  const tag = `${fa.datei} (pdf.js echt)`;
  ok(`${tag}: Art`, r.art === fa.art, r.art);
  if (fa.datum) ok(`${tag}: Datum`, r.datum === fa.datum, r.datum);
  let richtig = 0;
  for (const [id, soll] of Object.entries(fa.felder)) {
    const ist = r.felder[id];
    if (NUR_LAYOUT.includes(id)) { ok(`${tag}: ${id} ohne Spalten leer`, ist === undefined, ist); richtig++; continue; }
    const gleich = typeof soll === 'number' ? Math.abs(ist - soll) < 0.005 : ist === soll;
    if (gleich) richtig++;
    ok(`${tag}: ${id}`, gleich, { soll, ist });
  }
  bericht.push(`${tag}: ${richtig}/${Object.keys(fa.felder).length}`);
}

// Kinderzuschlag: Kein öffentlicher Musterbescheid der Familienkasse gefunden. Nachgebaut im üblichen Aufbau mit den Zahlen aus
// Beispiel 1 des BA-Merkblatts Kinderzuschlag (Stand Juli 2026, S. 14): Bedarf 1.570, Einkommen 1.915, Kinderzuschlag 736 Euro.
const KIZ = `Familienkasse Bayern Nord                                    Kindergeldnummer: 123FK456789
                                                             Datum: 14.08.2026
Bescheid über Kinderzuschlag nach § 6a Bundeskindergeldgesetz (BKGG)
Für die Zeit von August 2026 bis Januar 2027 wird Kinderzuschlag bewilligt.
Berechnung                                                   monatlich
Regelbedarf der Eltern                                        1.012,00 €
Anteil der Eltern an den Wohnkosten (62 %)                      558,00 €
gesamter Bedarf der Eltern                                    1.570,00 €
zu berücksichtigendes Einkommen der Eltern                    1.915,00 €
Kinderzuschlag insgesamt monatlich                              736,00 €`;
for (const [variante, text] of [['Text', KIZ], ['Texterkennung', ocrFehler(KIZ)]]) {
  const k = L.lies(text);
  ok(`KiZ nachgebaut (${variante}): Art`, k.art === 'fk', k.art);
  ok(`KiZ nachgebaut (${variante}): Bedarf nicht Regelbedarf`, k.felder['kz-b-bedarf'] === 1570, k.felder);
  ok(`KiZ nachgebaut (${variante}): Einkommen, KiZ, Kindergeldnummer, Datum`, k.felder['kz-b-eink'] === 1915 && k.felder['kz-b-kiz'] === 736 && k.felder['kz-kgnr'] === '123FK456789' && k.datum === '2026-08-14', k);
  bericht.push(`KiZ nachgebaut (${variante}): ${[k.felder['kz-b-bedarf'] === 1570, k.felder['kz-b-eink'] === 1915, k.felder['kz-b-kiz'] === 736, k.felder['kz-kgnr'] === '123FK456789'].filter(Boolean).length}/4`);
}

// Falsche Werte, die vor der Korrektur kamen, dürfen nicht wiederkommen
const wg = L.lies(lade('wg-frankfurt.txt'));
ok('Wohngeld: nicht der Jahreswert 18.046,20 als Einkommen', wg.felder['wg-b-eink'] !== 18046.2);
ok('Wohngeld: nicht der Höchstbetrag 769,80 als Miete', wg.felder['wg-b-miete'] !== 769.8);
ok('Wohngeld: Zeichen ist nicht das Wort „Datum“', wg.felder['wg-az'] !== 'Datum');
const jc = L.lies(lade('jc-buergergeld-nuernberg.txt'));
ok('Jobcenter: Regelbedarf nicht aus der letzten Spalte (Kind 348,00)', jc.felder['bs-b-regel'] !== 348);
ok('IBAN vor dem Betrag: kein Leerzeichen-Tausender', L.betraege('Müller, Hans 01/23 DE06 8605 5592 1812 1214 12 674,92')[0] === 674.92);
ok('OCR: O statt 0 und l statt 1', L.betraege('Regelbedarf l.25O,OO')[0] === 1250);
ok('OCR: Punkt statt Komma mit Tausenderpunkt', L.betraege('Zahlbetrag 1.501.33')[0] === 1501.33);
ok('OCR: Leerzeichen nach dem Komma', L.betraege('Gesamtkosten 6.717, 61')[0] === 6717.61);
ok('Ganze Euro mit Währung', L.betraege('= gesamter Bedarf der Eltern 1.570 Euro')[0] === 1570 && L.betraege('Wohngeld 214 €')[0] === 214);
ok('Ohne Währung keine ganzen Zahlen (Jahr, Paragraf)', L.betraege('§ 12 WoGG vom 24. September 2008').length === 0);
ok('Datum (Bewilligungszeitraum) ist kein Betrag', L.betraege('01.01.2023 bis 31.12.2023').length === 0);

// Fehler aus der Foto-Simulation (tools/scan-muster.js)
ok('Ungültiges Datum aus der Texterkennung („98.02.2023“) bleibt leer', L.lies('Jobcenter Musterstadt\nDatum: 98.02.2023\nRegelbedarf 563,00', 'jc').datum === null);
ok('Zeitraum mit langem Gedankenstrich', L.lies('Nebenkostenabrechnung\nAbrechnungszeitraum: 01.01.2022 — 31.12.2022', 'vm').felder['nk-bis'] === '2022-12-31');
const spalte = L.lies('Jobcenter Musterstadt\nGesamtbedarf\nRegelbedarf 1.250,00 451,6 451,00 348,00\nMehrbedarf 24,92 10,37 10,37 4,18\nWarmwassererzeugung\nGrundmiete 750,00 250,00 250,00 250,00', 'jc');
ok('Gesamt-Spalte vorn: auch wenn ein Einzelwert falsch gelesen ist', spalte.felder['bs-b-regel'] === 1250 && spalte.felder['bs-b-ww'] === 24.92, spalte.felder);

// Pflegegutachten: Formulargutachten der BRi (leer) und daraus zwei ausgefüllte Fassungen
const form = lade('pk-bri-formular.txt');
ok('Formulargutachten: als Pflegegutachten erkannt', L.erkenne('Gutachten zur Feststellung der Pflegebedürftigkeit gemäß SGB XI\n' + form).art === 'pk');
const leer = I.lies(form, P);
ok('Leeres Formular („0 1 2 3“ in jeder Zeile): keine Bewertung erfunden', leer.gefunden.length === 0, leer.stufen);
// Fassung A: in jeder Kriterienzeile steht nur der vergebene Punktwert (Spalten sonst leer)
const WAHL = { '1.1': 1, '1.2': 2, '1.3': 0, '1.4': 3, '1.5': 3, '2.1': 0, '2.2': 1, '2.4': 2, '2.8': 3, '3.1': 2, '3.2': 1, '3.10': 3, '4.1': 1, '4.3': 2, '4.8': 1, '4.9': 2, '4.10': 3, '6.1': 2, '6.6': 1 };
const punkte = (id, i) => { const k = P.KRITERIEN.find((x) => x.id === id); return P.SKALA[k.s].punkte[i] * (k.faktor || 1); };
const zeilen = form.split('\n');
let aktiv = null;
const fassungA = zeilen.map((z) => {
  const m = z.match(/^\s*(4\.[1-6]\.\d{1,2})\b/); if (m) aktiv = m[1].slice(2);
  if (!/\s0\s+\d\s+\d\s+\d\s*$/.test(z)) return z;
  const id = (m ? m[1].slice(2) : aktiv);
  const w = WAHL[id];
  return z.replace(/\s0\s+\d\s+\d\s+\d\s*$/, w == null ? '' : '      ' + punkte(id, w));
}).join('\n');
const a = I.lies(fassungA, P);
for (const [id, i] of Object.entries(WAHL)) ok(`Formular mit Punktwerten: ${id}`, a.stufen[id] === i, { id, soll: i, ist: a.stufen[id] });
ok('Formular mit Punktwerten: leere Zeilen bleiben offen', a.stufen['2.3'] === undefined && a.stufen['6.2'] === undefined, a.stufen);
// Fassung B: Ergebnis als Wort, Name durch die Kriteriennummer getrennt, ohne Umlaute (Texterkennung)
const B = `Gutachten zur Feststellung der Pflegebedurftigkeit gemaß SGB XI
4.1 Modul 1: Mobilitat
4.1.1 Positionswechsel im Bett                überwiegend selbstandig
          Halten einer stabilen Sitzpo-
4.1.2                                         uberwiegend unselbstandig
          sition
4.1.3 Umsetzen                                selbststandig
Seite 3 von 9
4.2.6 Treffen von Entscheidungen im Alltagsleben   Fahigkeit in geringem Maße vorhanden
4.3.2 Nachtliche Unruhe                       taglich
4.4.8 Essen                                   unselbstandig
Empfehlung: Pflegegrad 3`;
const b = I.lies(B, P);
ok('Gutachten-Text ohne Umlaute: 1.1 überwiegend selbständig', b.stufen['1.1'] === 1, b.stufen);
ok('Name durch Nummer getrennt: 1.2', b.stufen['1.2'] === 2, b.stufen);
ok('„selbststandig“ (neue Schreibung): 1.3', b.stufen['1.3'] === 0, b.stufen);
ok('2.6 / 3.2 / 4.8', b.stufen['2.6'] === 2 && b.stufen['3.2'] === 3 && b.stufen['4.8'] === 3, b.stufen);
ok('Pflegegrad aus „Empfehlung: Pflegegrad 3“', b.pgBescheid === 3, b.pgBescheid);
const ocr = I.lies('4.1.4 UNnselbständig\n4.1.2 Überwiegeng Unselbständig\n4.4.12 Stuhlinkontinenz und Umgang mit Stoma\nVersorgung selbständig\n4.4.13 0 0 6 3', P);
ok('Texterkennung „UNnselbständig“ ist unselbständig, nicht selbständig', ocr.stufen['1.4'] === 3, ocr.stufen);
ok('Texterkennung „Überwiegeng Unselbständig“', ocr.stufen['1.2'] === 2, ocr.stufen);
ok('Spaltenkopf „Versorgung selbständig“ ist keine Bewertung von 4.12', ocr.stufen['4.12'] === undefined, ocr.stufen);
const ocr2 = I.lies('4.3.1 Motorisch geprägte Verhaltens-\nhäufig (zweimal bis mehrmals wöchentlich, nicht täglich)\nauffälligkeiten\n4.6.1 laufs und Anpassung an äegend UNnselbständig\n4.6.6 nen außerhalb des direk. Twiegend Selbständig', P);
ok('Getrenntes Wort vor „häufig (… nicht täglich)“: nie „täglich“', ocr2.stufen['3.1'] !== 3, ocr2.stufen);
ok('Verstümmeltes „überwiegend“ vor (un)selbständig', ocr2.stufen['6.1'] === 2 && ocr2.stufen['6.6'] === 1, ocr2.stufen);
ok('Bewertung der nächsten Zeile wird nicht übernommen', I.lies('4.1.1 Positionswechsel im Bett\n4.1.2 Halten einer stabilen Sitzposition unselbständig', P).stufen['1.1'] === undefined);

if (process.env.BERICHT) console.log(bericht.join('\n'));
console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Muster-Bescheide: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
