// Tests: Bescheid-Check Grundsicherungsgeld, Fristen, Widerspruch, Gutachten-Import (Erweiterungen, nicht Teil von npm test der App 1.2.0)
'use strict';
const Rules = require('../../src/rules.js');
const B = require('../../erweiterungen/bescheid-sgb2.js');
const F = require('../../erweiterungen/fristen.js');
const W = require('../../erweiterungen/widerspruch.js');
const P = require('../../erweiterungen/pflege.js');
const I = require('../../erweiterungen/pflege-import.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
const R = Rules.RULES;

// 1. Werte stammen aus den App-Regeln (gleiche Zahlen wie in SoLo 1.2.0)
ok('Regelbedarf Stufe 1 aus rules.js', R.regelbedarf.alleinstehend === 563 && R.regelbedarf.partner === 506);

// 2. Durchgerechnetes Beispiel (von Hand): alleinerziehend, Kinder 4 und 9 Jahre, Lohn 1.000 € brutto / 800 € netto, Miete 700 + 100 Heizung
//    Regel 563+357+390 = 1.310; Mehrbedarf 36 % von 563 = 202,68 (Kind unter 7); Freibetrag 100+84+144 = 328 → anrechenbar 472;
//    Kindergeld 2 × 259 = 518; Bedarf 1.310+202,68+800 = 2.312,68; Zahlbetrag 2.312,68−472−518 = 1.322,68
const fall = {
  personen: [{ rolle: 'erw', alter: 34, brutto: 1000, netto: 800 }, { rolle: 'kind', alter: 4 }, { rolle: 'kind', alter: 9 }],
  miete: { tatsaechlich: 700, heizung: 100 },
  bescheid: { regel: 1310, mehrAE: 67.56, kdu: 800, einkommen: 500, kindergeld: 518, zahlbetrag: 1162.56 }
};
const r = B.pruefe(fall, Rules);
const p = (k) => r.posten.find((x) => x.key === k);
ok('Regel passt', p('regel').wirkung === 'passt', p('regel'));
ok('Mehrbedarf AE erwartet 202,68', p('mehrAE').erwartet === 202.68, p('mehrAE'));
ok('Mehrbedarf AE zu wenig (12 % statt 36 %)', p('mehrAE').wirkung === 'zuWenig' && p('mehrAE').diff === 135.12, p('mehrAE'));
ok('Einkommen erwartet 472', p('einkommen').erwartet === 472, p('einkommen'));
ok('Einkommen 28 € zu hoch angerechnet', p('einkommen').wirkung === 'zuWenig' && p('einkommen').diff === 28, p('einkommen'));
ok('Kindergeld passt', p('kindergeld').wirkung === 'passt');
ok('Unterkunft passt', p('kdu').wirkung === 'passt');
ok('Summe zu wenig 163,12 im Monat', r.zuWenigImMonat === 163.12, r.zuWenigImMonat);
ok('Zahlbetrag erwartet 1.322,68', r.erwartet.zahlbetrag === 1322.68, r.erwartet);
ok('Zahlbetrag-Differenz 160 (Bescheid 1.162,56)', r.zahlbetrag.diff === 160.12, r.zahlbetrag);
ok('Zwei Gründe für den Widerspruch', r.gruende.length === 2, r.gruende.map((g) => g.key));

// 3. Einzelregeln
const nurRegel = (personen) => B.pruefe({ personen, bescheid: {} }, Rules).erwartet.regel;
ok('Paar: 2 × 506', nurRegel([{ rolle: 'erw' }, { rolle: 'erw' }]) === 1012);
ok('Kind 5 → 357, 6 → 390', nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 5 }]) === 920 && nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 6 }]) === 953);
ok('Kind 13 → 390, 14 → 471', nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 13 }]) === 953 && nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 14 }]) === 1034);
ok('Volljähriges Kind 20 → 451', nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 20 }]) === 1014);
ok('Kind ab 25 nicht mitgerechnet + Hinweis', nurRegel([{ rolle: 'erw' }, { rolle: 'kind', alter: 26 }]) === 563 && B.pruefe({ personen: [{ rolle: 'erw' }, { rolle: 'kind', alter: 26 }] }, Rules).hinweise.length === 1);
const ae = (alter) => B.pruefe({ personen: [{ rolle: 'erw' }].concat(alter.map((a) => ({ rolle: 'kind', alter: a }))), bescheid: {} }, Rules).erwartet.mehrAE;
ok('AE ein Kind 7 Jahre: 12 %', ae([7]) === 67.56, ae([7]));
ok('AE ein Kind 6 Jahre: 36 %', ae([6]) === 202.68);
ok('AE zwei Kinder 10 und 15: 36 %', ae([10, 15]) === 202.68);
ok('AE vier Kinder 8-15: 48 %', ae([8, 10, 12, 15]) === 270.24, ae([8, 10, 12, 15]));
ok('AE sechs Kinder: höchstens 60 %', ae([2, 4, 8, 10, 12, 15]) === 337.8, ae([2, 4, 8, 10, 12, 15]));
ok('AE nicht bei Paaren', B.pruefe({ personen: [{ rolle: 'erw' }, { rolle: 'erw' }, { rolle: 'kind', alter: 3 }] }, Rules).erwartet.mehrAE === 0);
ok('AE nicht für volljährige Kinder', ae([19]) === 0);
ok('Schwangerschaft 17 % von 563 = 95,71', B.pruefe({ personen: [{ rolle: 'erw', schwanger: true }] }, Rules).erwartet.mehrSchw === 95.71);
ok('Warmwasser Paar + Kind 15 = 29,87', B.pruefe({ personen: [{ rolle: 'erw' }, { rolle: 'erw' }, { rolle: 'kind', alter: 15 }], warmwasserDezentral: true }, Rules).erwartet.mehrWW === 29.87);
ok('Freibetrag ohne Kinder bis 1.200', B.pruefe({ personen: [{ rolle: 'erw', brutto: 1500, netto: 1150 }] }, Rules).erwartet.einkommen === 1150 - Rules.sgb2Freibetrag(1500, false));
ok('Freibetrag 1.500 € brutto mit Kind = 378', Rules.sgb2Freibetrag(1500, true) === 378);
ok('Sonstiges Einkommen minus 30 € Pauschale', B.pruefe({ personen: [{ rolle: 'erw', sonstiges: 200 }] }, Rules).erwartet.einkommen === 170);
ok('Unterhalt beim Kind ohne Pauschale', B.pruefe({ personen: [{ rolle: 'erw' }, { rolle: 'kind', alter: 8, sonstiges: 200 }] }, Rules).erwartet.einkommen === 200);
const kd = B.pruefe({ personen: [{ rolle: 'erw' }], miete: { tatsaechlich: 600, heizung: 90 }, bescheid: { kdu: 550 } }, Rules);
ok('Gekürzte Unterkunft → prüfen, 140 €', kd.kdu.gekuerzt === 140 && kd.posten.find((x) => x.key === 'kdu').wirkung === 'pruefen');
ok('Gekürzte Unterkunft nicht als sicherer Fehler gezählt', kd.zuWenigImMonat === 0);
ok('Zu Gunsten (mehr als zusteht) kein Grund', B.pruefe({ personen: [{ rolle: 'erw' }], bescheid: { regel: 600 } }, Rules).gruende.length === 0);
ok('Rundung bis 1 € passt', B.pruefe({ personen: [{ rolle: 'erw' }], bescheid: { regel: 562.4 } }, Rules).posten[0].wirkung === 'passt');
ok('Grenzen der Prüfung genannt', /Angemessenheit/.test(r.grenzen));

// 4. Fristen (§ 37 Abs. 2 SGB X: 4. Tag; § 64 SGG)
ok('Ostern 2024/2025/2026/2027', F.ostern(2024) === '2024-03-31' && F.ostern(2025) === '2025-04-20' && F.ostern(2026) === '2026-04-05' && F.ostern(2027) === '2027-03-28');
const fr = F.widerspruch({ datum: '2026-11-16' });
ok('Bekanntgabe am 4. Tag', fr.bekanntgabe === '2026-11-20', fr);
ok('Fristende Sonntag → Montag', fr.fristende === '2026-12-21', fr);
ok('31. → Monatsletzter, Sonntag → Montag', F.widerspruch({ datum: '2027-01-27' }).fristende === '2027-03-01');
ok('Weihnachten und Wochenende übersprungen', F.widerspruch({ zugang: '2026-11-25' }).fristende === '2026-12-28');
ok('Karfreitag bis Ostermontag 2027 übersprungen', F.werktag('2027-03-26') === '2027-03-30' && F.werktag('2027-03-29') === '2027-03-30' && F.werktag('2027-03-25') === '2027-03-25');
ok('Persönlicher Zugang zählt ohne 4 Tage', F.widerspruch({ zugang: '2026-11-16' }).fristende === '2026-12-16');
ok('Jahreswechsel', F.einMonat('2026-12-15') === '2027-01-15');
ok('Erinnerung Grundsicherungsgeld 6 Wochen vorher', F.erinnerung({ leistung: 'sgb2', ende: '2027-06-30' }).erinnerungAm === '2027-05-19');
ok('Erinnerung Wohngeld 60 Tage vorher', F.erinnerung({ leistung: 'wohngeld', ende: '2027-03-31' }).erinnerungAm === '2027-01-30');
ok('Unbekannte Leistung → null', F.erinnerung({ leistung: 'x', ende: '2027-01-01' }) === null);

// 5. Widerspruch
const txt = W.text({ art: 'sgb2', absender: { name: 'Erika Muster', strasse: 'Hauptstr. 1', ort: '90542 Eckental' }, stelle: { name: 'Jobcenter Erlangen-Höchstadt' }, bescheidDatum: '2026-11-16', heute: '2026-11-20', zeichen: '12345BG0000001', punkte: W.punkteSGB2(r) });
ok('Widerspruch: Betreff mit Datum', /Widerspruch gegen den Bescheid .* vom 16\.11\.2026/.test(txt));
ok('Widerspruch: beide Gründe', /Mehrbedarf für Alleinerziehende/.test(txt) && /Angerechnetes Einkommen/.test(txt));
ok('Widerspruch: Ort ohne PLZ im Datum', /\nEckental, 20\.11\.2026\n/.test(txt), txt.split('\n').slice(0, 8));
ok('Widerspruch: Eingangsbestätigung und Unterschrift', /Eingang/.test(txt) && /Erika Muster$/.test(txt));
const tp = W.text({ art: 'pflege', pflege: { pgBescheid: 2, pgZiel: 3 }, punkte: W.punktePflege([{ id: '4.4', stufeIst: 1, stufeSoll: 3, alltag: 'Sie kann nicht allein in die Dusche steigen.' }], P), bescheidDatum: '2026-11-02', heute: '2026-11-20' });
ok('Widerspruch Pflege: Ziel-Pflegegrad', /Pflegegrad 3/.test(tp) && /Duschen und Baden/.test(tp) && /„überwiegend selbständig“, tatsächlich „unselbständig“/.test(tp));
ok('Widerspruch Pflege: ohne Alltagsbeschreibung Platzhalter', /\[Bitte beschreiben/.test(W.punktePflege([{ id: '1.5', stufeIst: 0, stufeSoll: 2 }], P)[0]));

const hs = W.hoeherstufung({ absender: { name: 'Erika Muster', ort: '90542 Eckental' }, stelle: { name: 'AOK Bayern' }, pgJetzt: 2, seit: '2025-03-10', heute: '2026-11-17', zeichen: 'A123', arzt: true,
  punkte: W.punkteHoeher([{ id: '1.5', stufeIst: 1, stufeSoll: 3, alltag: 'Seit dem Sturz im Juli kann sie keine Treppe mehr gehen.' }], P) });
ok('Höherstufung: Betreff', /\nAntrag auf Höherstufung des Pflegegrades\n/.test(hs));
ok('Höherstufung: jetziger Grad und Datum der Begutachtung', /Pflegegrad 2 festgestellt \(Begutachtung vom 10\.03\.2025\)/.test(hs));
ok('Höherstufung: Veränderung mit vorher/heute', /bei der letzten Begutachtung „überwiegend selbständig“, heute „unselbständig“\. Seit dem Sturz/.test(hs));
ok('Höherstufung: kein Wort „Widerspruch“', !/Widerspruch/.test(hs));
ok('Höherstufung: ärztliche Unterlagen, Hausbesuch, Unterschrift', /Ärztliche Unterlagen/.test(hs) && /häuslichen Umfeld/.test(hs) && /Erika Muster$/.test(hs));
ok('Höherstufung ohne Beschreibung: Platzhalter', /\[Bitte beschreiben, was sich verändert hat/.test(W.punkteHoeher([{ id: '4.4', stufeIst: 0, stufeSoll: 2 }], P)[0]));

// 6. Gutachten-Text lesen (wie aus Texterkennung: Zeilenumbrüche, Trennungen, Kurzformen)
const gut = `Modul 1: Mobilität
1.1 Positionswechsel im Bett selbständig
1.2 Halten einer stabilen Sitz-
position überwiegend selbständig
1.3 Umsetzen überw. unselbständig
1.4 Fortbewegen innerhalb des Wohnbereichs überwiegend unselbständig
1.5 Treppensteigen unselbständig
2.3 Zeitliche Orientierung Fähigkeit in geringem Maße vorhanden
3.2 Nächtliche Unruhe häufig (zweimal bis mehrmals wöchentlich, aber nicht täglich)
4.4 Duschen und Baden einschließlich Waschen der Haare unselbständig
4.8 Essen überwiegend selbständig
4.11 Bewältigen der Folgen einer Harninkontinenz und Umgang mit Dauerkatheter und Urostoma überwiegend unselbständig
Harn: überwiegend inkontinent
Ergebnis: Pflegegrad 2`;
const im = I.lies(gut, P);
ok('Import 1.1 selbständig', im.stufen['1.1'] === 0, im.stufen);
ok('Import Trennung „Sitz-position“', im.stufen['1.2'] === 1, im.stufen);
ok('Import Kurzform „überw. unselbständig“', im.stufen['1.3'] === 2, im.stufen);
ok('Import längste Stufe zuerst', im.stufen['1.4'] === 2 && im.stufen['1.5'] === 3, im.stufen);
ok('Import Modul 2 Skala', im.stufen['2.3'] === 2, im.stufen);
ok('Import Modul 3 häufig', im.stufen['3.2'] === 2, im.stufen);
ok('Import 4.4 und 4.8', im.stufen['4.4'] === 3 && im.stufen['4.8'] === 1, im.stufen);
ok('Import Harninkontinenz erkannt', im.inkontinenz.harn === true && im.inkontinenz.stuhl === false, im.inkontinenz);
ok('Import Pflegegrad aus Bescheid', im.pgBescheid === 2);
const ohneInk = I.lies('4.11 Bewältigen der Folgen einer Harninkontinenz und Umgang mit Dauerkatheter und Urostoma selbständig\n4.12 Bewältigen der Folgen einer Stuhlinkontinenz und Umgang mit Stoma selbständig', P);
ok('Import: Kriteriennamen allein sind keine Inkontinenz-Feststellung', ohneInk.inkontinenz.harn === false && ohneInk.inkontinenz.stuhl === false, ohneInk.inkontinenz);
ok('Import: Stuhl vollständig inkontinent', I.lies('Stuhl: vollständig inkontinent', P).inkontinenz.stuhl === true);
ok('Import: Stoma angelegt', I.lies('Ein Colostoma ist angelegt.', P).inkontinenz.stuhl === true);
ok('Import nicht Gefundenes als fehlend', im.fehlend.includes('6.1') && !im.fehlend.includes('1.1'));
ok('Import → Rechnung läuft', P.rechne(im).gesamt > 0);

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Bescheid-Check, Fristen, Widerspruch, Import: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
