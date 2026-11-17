// Tests: Nebenkosten-Check (Erweiterung, nicht Teil von npm test der App 1.2.0)
'use strict';
const N = require('../../erweiterungen/nebenkosten.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

// 1. Einordnung der Posten
const art = (b) => { const e = N.einordnen(b); return e.status + (e.art ? ':' + e.art.name : ''); };
const faelle = [
  ['Grundsteuer', 'ok:Grundsteuer'], ['Frischwasser', 'ok:Wasserversorgung'], ['Warmwasser', 'ok:Warmwasser'], ['Abwasser / Kanal', 'ok:Entwässerung'],
  ['Niederschlagswasser', 'ok:Entwässerung'], ['Heizkosten', 'ok:Heizung'], ['Wartung Heizungsanlage', 'ok:Heizung'], ['Fernwärme', 'ok:Heizung'],
  ['Aufzug Wartung', 'ok:Aufzug'], ['Müllabfuhr', 'ok:Straßenreinigung und Müllbeseitigung'], ['Winterdienst', 'ok:Straßenreinigung und Müllbeseitigung'],
  ['Treppenhausreinigung', 'ok:Gebäudereinigung und Ungezieferbekämpfung'], ['Treppenhausbeleuchtung', 'ok:Beleuchtung'], ['Allgemeinstrom', 'ok:Beleuchtung'],
  ['Gartenpflege', 'ok:Gartenpflege'], ['Schornsteinfeger', 'ok:Schornsteinreinigung'], ['Wohngebäudeversicherung', 'ok:Sach- und Haftpflichtversicherung'],
  ['Hausmeister', 'ok:Hauswart'], ['Waschküche Strom', 'ok:Wäschepflege'],
  ['Verwaltungskosten', 'nicht'], ['Hausverwaltung', 'nicht'], ['Reparatur Aufzug', 'nicht'], ['Instandhaltung Dach', 'nicht'], ['Instandhaltungsrücklage', 'nicht'],
  ['Kontoführungsgebühren', 'nicht'], ['Porto', 'nicht'], ['Leerstand Wohnung 3', 'nicht'], ['Rechtsschutzversicherung', 'nicht'], ['Mietausfallversicherung', 'nicht'],
  ['Notdienstpauschale Hausmeister', 'nicht'], ['Kabelfernsehen', 'nicht'], ['Kabelanschluss', 'nicht'], ['Austausch Wasserzähler', 'nicht'],
  ['Rauchmelder Wartung', 'pruefen:Sonstige Betriebskosten'], ['Dachrinnenreinigung', 'pruefen:Sonstige Betriebskosten'], ['Sonstiges', 'pruefen:Sonstige Betriebskosten'],
  ['Glasfaser Bereitstellungsentgelt', 'ok:Glasfaser-Bereitstellungsentgelt'], ['Zuschlag XY', 'unbekannt'], ['', 'unbekannt']
];
for (const [b, soll] of faelle) ok(`Einordnung „${b}“ → ${soll}`, art(b) === soll, art(b));
ok('Glasfaser über 60 € im Jahr → prüfen', N.einordnen('Glasfaser Bereitstellungsentgelt', { glasfaserJahr: 90 }).status === 'pruefen');
ok('Alle 17 Nummern bis auf 6 vorhanden', N.ARTEN.map((a) => a.nr).sort((x, y) => x - y).join() === '1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17');

// 2. Fristen nach § 556 Abs. 3 BGB
ok('Abrechnung 2025 muss bis 31.12.2026 da sein', N.zwoelfMonateNach('2025-12-31') === '2026-12-31');
ok('Einwendung: Zugang 15.03.2026 → bis 31.03.2027', N.zwoelfMonateNach('2026-03-15') === '2027-03-31');
ok('Februar im Schaltjahr', N.zwoelfMonateNach('2027-02-10') === '2028-02-29');
ok('Zeitraum 1.1.–31.12. = 12 Monate', N.monate('2025-01-01', '2025-12-31') === 12);
ok('Zeitraum 1.7.–30.6. = 12 Monate', N.monate('2025-07-01', '2026-06-30') === 12);
ok('Zeitraum 1.1.2025–31.1.2026 = 13 Monate', N.monate('2025-01-01', '2026-01-31') === 13);

// 3. CO2-Stufenmodell (Wohngebäude)
ok('unter 12 kg: Vermieter 0 %', N.co2Vermieter(11.9) === 0);
ok('12 kg: 10 %', N.co2Vermieter(12) === 0.1);
ok('30 kg: 40 %', N.co2Vermieter(30) === 0.4);
ok('51,9 kg: 80 %', N.co2Vermieter(51.9) === 0.8);
ok('ab 52 kg: 95 %', N.co2Vermieter(52) === 0.95 && N.co2Vermieter(80) === 0.95);

// 4. Ganze Abrechnung
const abr = {
  von: '2025-01-01', bis: '2025-12-31', zugang: '2026-06-10', vorauszahlungen: 1800, wohnflaeche: 60, gesamtflaeche: 600,
  posten: [
    { bez: 'Grundsteuer', anteil: 240, gesamt: 2400, flaeche: true },
    { bez: 'Müllabfuhr', anteil: 200, gesamt: 1800, flaeche: true },
    { bez: 'Heizkosten', anteil: 900 },
    { bez: 'Hausmeister', anteil: 300, gesamt: 3000, flaeche: true },
    { bez: 'Verwaltungskosten', anteil: 180 },
    { bez: 'Reparatur Haustür', anteil: 95 },
    { bez: 'Rauchmelder Wartung', anteil: 20 }
  ],
  heiz: { verbrauchProzent: 70, anteil: 900 }, co2: { kosten: 120, kgJeQm: 30, vermieterAbgezogen: false }
};
const r = N.pruefe(abr);
ok('Summe der Anteile 1.935', r.summe === 1935, r.summe);
ok('Nachzahlung laut Abrechnung 135', r.ergebnis === 135, r.ergebnis);
ok('Rechenfehler Müll: 200 statt 180', r.posten.find((p) => p.bez === 'Müllabfuhr').rechenfehler === 20);
ok('Grundsteuer richtig verteilt', !r.posten.find((p) => p.bez === 'Grundsteuer').rechenfehler);
ok('Verwaltung und Reparatur beanstandet', r.befunde.filter((b) => b.art === 'nicht').length === 2);
ok('Rauchmelder als „prüfen“', r.befunde.some((b) => b.art === 'pruefen' && /Rauchmelder/.test(b.text)));
ok('CO2: Vermieter 40 % = 48 € fehlt', r.befunde.some((b) => b.art === 'co2' && b.betrag === 48));
ok('Strittig 180 + 95 + 20 + 48 = 343', r.strittig === 343, r.strittig);
ok('Korrigiert: Guthaben 208', r.korrigiert === -208, r.korrigiert);
ok('Einwendungsfrist bis 30.06.2027', r.fristen.einwendungBis === '2027-06-30');
ok('Rechtzeitig abgerechnet', !r.fristen.zuSpaet);
const spaet = N.pruefe(Object.assign({}, abr, { zugang: '2027-01-05' }));
ok('Zu spät: Nachzahlung entfällt, Befund und Hinweis', spaet.fristen.zuSpaet && spaet.befunde.some((b) => b.art === 'frist') && spaet.hinweise.some((x) => /entfällt/.test(x)));
ok('13 Monate Zeitraum beanstandet', N.pruefe(Object.assign({}, abr, { bis: '2026-01-31' })).befunde.some((b) => b.art === 'zeitraum'));
ok('Heizung nicht nach Verbrauch: 15 % = 135', N.pruefe(Object.assign({}, abr, { heiz: { verbrauchProzent: 0, anteil: 900 } })).befunde.find((b) => b.art === 'heiz').betrag === 135);
ok('Heizung 40 % Verbrauch: neu berechnen', /50 bis 70/.test(N.pruefe(Object.assign({}, abr, { heiz: { verbrauchProzent: 40, anteil: 900 } })).befunde.find((b) => b.art === 'heiz').text));
ok('CO2 abgezogen: kein Befund', !N.pruefe(Object.assign({}, abr, { co2: { kosten: 120, kgJeQm: 30, vermieterAbgezogen: true } })).befunde.some((b) => b.art === 'co2'));
ok('CO2 nicht angegeben: 3 % Kürzung als Hinweis', N.pruefe(Object.assign({}, abr, { co2: {}, co2Fehlt: true })).befunde.some((b) => /3 %/.test(b.text)));

// 5. Schreiben
const ew = N.einwendungen({ absender: { name: 'Erika Muster', ort: '90542 Eckental' }, vermieter: { name: 'Hausverwaltung X' }, von: abr.von, bis: abr.bis, heute: '2026-07-01' }, r);
ok('Einwendungen: Betreff mit Zeitraum', /Betriebskostenabrechnung für den Zeitraum 01\.01\.2025 bis 31\.12\.2025/.test(ew));
ok('Einwendungen: Verwaltung, Reparatur, CO2, Rechenfehler', /Verwaltungskosten/.test(ew) && /Reparatur/.test(ew) && /CO₂/.test(ew) && /Müllabfuhr/.test(ew));
ok('Einwendungen: „prüfen“-Posten nur auf Wunsch', !/Rauchmelder/.test(ew) && /Rauchmelder/.test(N.einwendungen({ von: abr.von, bis: abr.bis, heute: '2026-07-01', pruefenMit: true }, r)));
ok('Einwendungen: Belegeinsicht § 259 BGB', /§ 259 BGB/.test(ew));
const au = N.antragUebernahme({ absender: { name: 'Erika Muster' }, stelle: { name: 'Jobcenter' }, von: abr.von, bis: abr.bis, heute: '2026-07-01', faellig: '2026-07-15', leistung: 'sgb2' }, r);
ok('Antrag Jobcenter: § 22 SGB II, Betrag, Fälligkeit', /§ 22 Abs\. 1 SGB II/.test(au) && /135,00 €/.test(au) && /15\.07\.2026/.test(au));
ok('Antrag Sozialamt: § 35 SGB XII', /§ 35 SGB XII/.test(N.antragUebernahme({ von: abr.von, bis: abr.bis, heute: '2026-07-01', leistung: 'gsa' }, r)));

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Nebenkosten-Check: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
