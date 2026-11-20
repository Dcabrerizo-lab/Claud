// Tests: Brief einlesen (erweiterungen/brief-lesen.js). Beispieltexte im üblichen Aufbau der Briefe, wie sie aus einer PDF
// oder der Texterkennung kommen (mit Zeilenumbrüchen, Tausenderpunkten, Spalten). Echte geschwärzte Briefe ergänzen die Tests später.
'use strict';
const L = require('../../erweiterungen/brief-lesen.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

const JC = `Jobcenter Musterstadt
Datum: 12.03.2026
Bescheid über Leistungen zur Sicherung des Lebensunterhalts nach dem Zweiten Buch Sozialgesetzbuch (SGB II) – Grundsicherungsgeld
Bewilligungszeitraum 01.04.2026 bis 31.03.2027
Berechnungsbogen für die Bedarfsgemeinschaft
                                   Person 1     Person 2     Gesamt
Regelbedarf                         563,00       357,00      920,00
Mehrbedarf für Alleinerziehende      67,56                    67,56
Mehrbedarf dezentrale Warmwasserversorgung 12,95   4,82      17,77
Grundmiete 520,00
Nebenkosten 140,00
Heizkosten 95,00
Kosten der Unterkunft und Heizung                            755,00
Kindergeld                                       259,00      259,00
Anzurechnendes Einkommen                         0,00        0,00
Zahlbetrag monatlich                                       1.501,33`;
const r = L.lies(JC);
ok('Jobcenter erkannt', r.art === 'jc', r.art);
ok('Datum des Bescheids', r.datum === '2026-03-12', r.datum);
ok('Regelbedarf: Spalte Gesamt', r.felder['bs-b-regel'] === 920, r.felder);
ok('Mehrbedarf Alleinerziehende', r.felder['bs-b-ae'] === 67.56);
ok('Mehrbedarf Warmwasser', r.felder['bs-b-ww'] === 17.77);
ok('Unterkunft und Heizung', r.felder['bs-b-kdu'] === 755);
ok('Kindergeld', r.felder['bs-b-kg'] === 259);
ok('Einkommen ohne Kindergeld-Zeile', r.felder['bs-b-eink'] === 0);
ok('Zahlbetrag mit Tausenderpunkt', r.felder['bs-b-zahl'] === 1501.33, r.felder['bs-b-zahl']);
ok('Miete = Grundmiete + Nebenkosten', r.felder['bs-miete'] === 660, r.felder['bs-miete']);
ok('Heizkosten', r.felder['bs-heiz'] === 95);

const WG = `Stadt Musterstadt – Wohngeldbehörde
Musterstadt, den 02.02.2026
Wohngeldbescheid
Ihnen wird Wohngeld in Höhe von 214,00 EUR monatlich bewilligt.
Anzahl der zu berücksichtigenden Haushaltsmitglieder: 3 Haushaltsmitglieder
Bruttokaltmiete 780,00 €
zu berücksichtigende Miete 702,00 €
monatliches Gesamteinkommen 1.845,20 €`;
const w = L.lies(WG);
ok('Wohngeld erkannt', w.art === 'wg', w.art);
ok('Wohngeld-Betrag', w.felder['wg-b-wg'] === 214, w.felder);
ok('Gesamteinkommen', w.felder['wg-b-eink'] === 1845.2);
ok('Zu berücksichtigende Miete', w.felder['wg-b-miete'] === 702);
ok('Haushaltsmitglieder', w.felder['wg-n'] === 3);
ok('Datum aus „den 02.02.2026“', w.datum === '2026-02-02', w.datum);

const KIZ = `Familienkasse Bayern Süd
Bescheid vom 05.01.2026
Kinderzuschlag nach § 6a Bundeskindergeldgesetz (BKGG)
Bedarf der Eltern 1.651,00 €
Einkommen der Eltern 1.522,00 €
Kinderzuschlag insgesamt monatlich 594,00 €`;
const k = L.lies(KIZ);
ok('Kinderzuschlag erkannt', k.art === 'fk', k.art);
ok('Bedarf, Einkommen, Kinderzuschlag', k.felder['kz-b-bedarf'] === 1651 && k.felder['kz-b-eink'] === 1522 && k.felder['kz-b-kiz'] === 594, k.felder);

const GSA = `Landratsamt – Sozialamt
Grundsicherung im Alter und bei Erwerbsminderung nach dem Zwölften Buch Sozialgesetzbuch (SGB XII)
Regelsatz 563,00
Mehrbedarf Merkzeichen G 95,71
Kosten der Unterkunft 480,00
Anzurechnendes Einkommen 812,40
Zahlbetrag 326,31`;
const g = L.lies(GSA);
ok('Grundsicherung im Alter erkannt', g.art === 'sa', g.art);
ok('Regelsatz, Mehrbedarf G, Unterkunft, Einkommen, Zahlbetrag', g.felder['ga-b-regel'] === 563 && g.felder['ga-b-g'] === 95.71 && g.felder['ga-b-kdu'] === 480 && g.felder['ga-b-eink'] === 812.4 && g.felder['ga-b-zahl'] === 326.31, g.felder);

const NK = `Hausverwaltung Muster GmbH
Betriebskostenabrechnung 2025
Abrechnungszeitraum: 01.01.2025 bis 31.12.2025
Ihre Wohnfläche: 60 m²   Gesamtfläche: 600 m²
Kostenart                 Gesamtkosten   Schlüssel     Ihr Anteil
Grundsteuer                 2.400,00     Wohnfläche      240,00
Müllabfuhr                  1.800,00     Wohnfläche      180,00
Hausmeister                 3.000,00     Wohnfläche      300,00
Allgemeinstrom                420,00     Wohnfläche       42,00
Ihre Vorauszahlungen gesamt                            1.800,00`;
const v = L.lies(NK);
ok('Nebenkostenabrechnung erkannt', v.art === 'vm', v.art);
ok('Zeitraum', v.felder['nk-von'] === '2025-01-01' && v.felder['nk-bis'] === '2025-12-31', v.felder);
ok('Flächen', v.felder['nk-wfl'] === 60 && v.felder['nk-gfl'] === 600, v.felder);
ok('Vorauszahlungen', v.felder['nk-voraus'] === 1800, v.felder['nk-voraus']);
ok('Vier Posten mit Haus und Anteil', v.posten.length === 4 && v.posten[0].gesamt === 2400 && v.posten[0].anteil === 240 && v.posten[2].bez === 'Hausmeister', v.posten);

const PK = `Gutachten zur Feststellung der Pflegebedürftigkeit gemäß SGB XI
Medizinischer Dienst Bayern
Modul 1: Mobilität
1.1 Positionswechsel im Bett überwiegend selbständig`;
ok('Pflegegutachten erkannt', L.erkenne(PK).art === 'pk');
ok('Anhörung vom Jobcenter gilt als Anhörung', L.erkenne('Jobcenter Musterstadt\nAnhörung nach § 24 SGB X\nSie haben Gelegenheit, sich bis zum 30.04.2026 zu äußern.').art === 'anh');
ok('Reine Anhörung erkannt', L.erkenne('Anhörung nach § 24 SGB X\nSie haben Gelegenheit, sich zu äußern.').art === 'anh');
ok('Mitwirkung erkannt', L.erkenne('Mitwirkungspflichten nach § 60 SGB I\nBitte reichen Sie folgende Unterlagen bis zum 15.05.2026 ein:').art === 'mit');
ok('Frist aus „bis zum“', L.frist('Bitte reichen Sie die Unterlagen bis zum 15.05.2026 ein.') === '15.05.2026');
ok('Formular erkannt', L.erkenne('Antrag auf Wohngeld\nAngaben zur Person\n☐ ledig ☐ verheiratet\nZutreffendes ankreuzen').art === 'af');
ok('Unbekannter Text: nicht erkannt', L.erkenne('Liebe Oma, vielen Dank für das Geschenk.').art === null);
ok('Feste Art aus der Kachel geht vor', L.lies(WG, 'jc').art === 'jc');
ok('Beträge mit Leerzeichen aus der Texterkennung', L.betraege('Zahlbetrag 1 501,33 EUR')[0] === 1501.33);

// Datum des Bescheids nur aus eindeutigen Mustern, sonst leer (ein falsches Datum verschöbe die Widerspruchsfrist)
const D = (t) => L.lies(t, 'jc').datum;
ok('Datum: „Bescheid vom“', D('Jobcenter Musterstadt\nBescheid vom 03.02.2026\nRegelbedarf 563,00') === '2026-02-03');
ok('Datum: Briefkopf „Ort, den“', D('Jobcenter Musterstadt\nMusterstadt, den 04.02.2026\nRegelbedarf 563,00') === '2026-02-04');
ok('Datum: nur das Datum in eigener Zeile', D('Jobcenter Musterstadt\n05.02.2026\nRegelbedarf 563,00') === '2026-02-05');
ok('Kein Datum aus „Ihr Antrag vom“', D('Jobcenter Musterstadt\nIhr Antrag vom 10.01.2026\nRegelbedarf 563,00') === null);
ok('Kein Datum aus dem Bewilligungszeitraum', D('Jobcenter Musterstadt\nBewilligungszeitraum 01.04.2026 bis 31.03.2027\nRegelbedarf 563,00') === null);
ok('Kein Datum aus dem Geburtsdatum', D('Jobcenter Musterstadt\nMax Muster, geboren 01.01.2020\nGeburtsdatum: 01.01.2020') === null);
ok('Kein Datum aus „für die Zeit vom“', D('Leistungen für die Zeit vom 01.04.2026 bis 30.09.2026') === null);

// Anderer Brief: Frist nur mit Beleg, Mahnbescheid und Inkasso
const MB = `Amtsgericht Coburg – Zentrales Mahngericht
Mahnbescheid
Das Gericht hat nicht geprüft, ob dem Antragsteller der Anspruch zusteht.
Sie können innerhalb von zwei Wochen seit der Zustellung Widerspruch erheben.`;
const a1 = L.andere(MB);
ok('Mahnbescheid erkannt', a1.mahnbescheid && !a1.vollstreckungsbescheid, a1);
ok('Frist mit Beleg', a1.fristen[0] && a1.fristen[0].frist === 'zwei Wochen' && /Widerspruch/.test(a1.fristen[0].zeile), a1.fristen);
const a2 = L.andere('Muster Inkasso GmbH\nBitte zahlen Sie den Betrag bis zum 15.12.2026.');
ok('Inkasso erkannt', a2.inkasso && !a2.mahnbescheid);
ok('Frist mit Datum', a2.fristen[0] && a2.fristen[0].frist === '15.12.2026', a2.fristen);
const a3 = L.andere('Sehr geehrte Damen und Herren,\nanbei die Unterlagen.');
ok('Ohne Frist keine Frist', a3.fristen.length === 0 && !a3.inkasso && !a3.mahnbescheid);
ok('Mahnbescheid nur mit Gericht', !L.andere('Wir drohen mit einem Mahnbescheid.').mahnbescheid);
// Korrekturen 15–17
const ink = L.andere('Muster Inkasso GmbH\nZahlen Sie bis zum 15.12.2026. Andernfalls werden wir beim zuständigen Amtsgericht einen Mahnbescheid beantragen.');
ok('Inkasso-Drohsatz „… Mahnbescheid beantragen“ ist kein Mahnbescheid', !ink.mahnbescheid && ink.inkasso, ink);
const VB1 = L.andere('Amtsgericht Coburg – Vollstreckungsbescheid\nAuf der Grundlage des Mahnbescheids vom 01.10.2026 wird der Vollstreckungsbescheid erlassen.\nGegen diesen Bescheid ist Einspruch möglich, innerhalb von zwei Wochen.');
ok('Vollstreckungsbescheid mit Kopfzeile „Amtsgericht … – Vollstreckungsbescheid“', VB1.vollstreckungsbescheid && !VB1.mahnbescheid, VB1);
const VB2 = L.andere('Amtsgericht Coburg\nMahnbescheid zugestellt am 01.10.2026\nVollstreckungsbescheid\nSie können innerhalb von zwei Wochen Einspruch einlegen.');
ok('Vollstreckungsbescheid trotz Zeile „Mahnbescheid zugestellt am …“', VB2.vollstreckungsbescheid && !VB2.mahnbescheid, VB2);
ok('Mahnbescheid mit Hinweis auf möglichen Vollstreckungsbescheid bleibt Mahnbescheid', (() => { const x = L.andere(MB + '\nOhne Widerspruch kann der Antragsteller einen Vollstreckungsbescheid beantragen; dagegen ist Einspruch möglich.'); return x.mahnbescheid && !x.vollstreckungsbescheid; })());
const fr = L.andere('Bitte zahlen Sie bis zum 10.12.2026.\nGegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.');
ok('Fristen mit Widerspruch, Einspruch oder Klage zuerst', fr.fristen.length === 2 && /Widerspruch/.test(fr.fristen[0].zeile), fr.fristen);
// Anzeigefehler „Frist im Brief: Monats“ (Brief › Anderer Brief, Bescheid mit „innerhalb eines Monats“): lesbar „1 Monat“
ok('„innerhalb eines Monats“: Rohwert bleibt für die Fristrechnung, Anzeige „1 Monat“', fr.fristen[0].frist === 'Monats' && L.fristLesbar(fr.fristen[0].frist) === '1 Monat', fr.fristen[0]);
ok('Frist lesbar: „einer Woche“ → „1 Woche“, „Woche“ → „1 Woche“, „zwei Wochen“ und Datum unverändert', L.fristLesbar('einer Woche') === '1 Woche' && L.fristLesbar('Woche') === '1 Woche' && L.fristLesbar('zwei Wochen') === 'zwei Wochen' && L.fristLesbar('15.12.2026') === '15.12.2026' && L.fristLesbar('einem Monat') === '1 Monat');
ok('Anhörung mit „innerhalb eines Monats“: frist() liefert den Rohwert, lesbar „1 Monat“', L.fristLesbar(L.frist('Anhörung\nSie haben Gelegenheit, sich innerhalb eines Monats zu äußern.')) === '1 Monat');

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Brief einlesen: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
