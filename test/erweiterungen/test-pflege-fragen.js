// Tests: Texte und Ablauf der geführten Pflegegrad-Einschätzung (pflege-fragen.js, Schritte und Eingabe aus pflege-assistent.js)
'use strict';
global.Pflege = require('../../erweiterungen/pflege.js');
global.PflegeFragen = require('../../erweiterungen/pflege-fragen.js');
const P = global.Pflege, F = global.PflegeFragen;
const A = require('../../erweiterungen/pflege-assistent.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

// 1. Jedes Kriterium hat eine Frage und eine Erklärung, jede Frage ist eine Frage
for (const k of P.KRITERIEN) {
  ok(`Frage zu ${k.id}`, F.TEXT[k.id] && F.TEXT[k.id][0].length > 10, k.id);
  ok(`Erklärung zu ${k.id}`, F.TEXT[k.id] && F.TEXT[k.id][1].length > 20, k.id);
  ok(`${k.id} endet mit Fragezeichen`, /\?$/.test(F.frage(k.id)), F.frage(k.id));
}
for (const [id] of P.M5A.concat(P.M5B, P.M5C)) ok(`Frage zu ${id}`, /\?$/.test(F.frage(id)), id);
ok('Frage zu 5.16', /\?$/.test(F.frage('5.16')));
for (const m of [1, 2, 3, 4, 5, 6]) ok(`Vorfrage Bereich ${m}`, F.VORFRAGE[m] && /\?$/.test(F.VORFRAGE[m].frage));
ok('Keine Frage doppelt', new Set(P.KRITERIEN.map((k) => F.frage(k.id))).size === P.KRITERIEN.length);

// 2. Antworten in Bereich 5 werden richtig in Häufigkeiten übersetzt
ok('5.1 „2- bis 3-mal am Tag“ = 3 pro Tag', JSON.stringify(F.m5Wert('5.1', 2)) === '{"tag":3}');
ok('5.1 „Nein“ = nichts', JSON.stringify(F.m5Wert('5.1', 0)) === '{}');
ok('5.13 „Jede Woche“ = 1 pro Woche', JSON.stringify(F.m5Wert('5.13', 3)) === '{"woche":1}');
ok('5.12 „Ja, jeden Tag“ = täglich', F.m5Wert('5.12', 1).taeglich === true);
// 3-mal täglich Medikamente richten: 630 Einheiten → 1 Punkt in 5A (Anlage 1: über 1 bis 3-mal täglich)
ok('Medikamente 3-mal täglich gibt 1 Punkt', P.modul5({ '5.1': F.m5Wert('5.1', 2) }, false).teile.a === 1, P.modul5({ '5.1': F.m5Wert('5.1', 2) }, false));
ok('Arztbesuch 2- bis 3-mal im Monat gibt Punkte in 5C', P.modul5({ '5.13': F.m5Wert('5.13', 2) }, false).teile.c >= 0);

// 3. Ablauf: Vorfrage „Nein“ überspringt den Bereich; Inkontinenz-Fragen nur bei Inkontinenz; Säugling: 4.K statt Bereich 4
const a = A.neu(); a.alterJahre = '80';
ok('Alles „Nein“: Alter, 6 Vorfragen, Ergebnis', A.schritte(a).length === 8, A.schritte(a).length);
a.vor[4] = true;
const s4 = A.schritte(a).filter((x) => x.m === 4).map((x) => x.id || x.art);
ok('Bereich 4 ohne Inkontinenz: 4.11 und 4.12 nicht gefragt', s4.includes('ink') && !s4.includes('4.11') && !s4.includes('4.12'), s4);
a.inkontinenz = { harn: true, stuhl: false };
ok('Harninkontinenz: 4.11 gefragt, 4.12 nicht', A.schritte(a).some((x) => x.id === '4.11') && !A.schritte(a).some((x) => x.id === '4.12'));
const baby = A.neu(); baby.alterJahre = '1'; baby.alterMonate = '10'; baby.vor[4] = true;
ok('Kind 10 Monate: Frage 4.K statt Bereich 4', A.schritte(baby).some((x) => x.art === 'k4K') && !A.schritte(baby).some((x) => x.id === '4.1'));
const kind = A.neu(); kind.alterJahre = '6'; kind.vor[5] = true;
ok('Kind: Frühförderung wird gefragt', A.schritte(kind).some((x) => x.id === '5.K'));
const alt = A.neu(); alt.alterJahre = '70'; alt.vor[5] = true;
ok('Erwachsener: keine Frage zur Frühförderung', !A.schritte(alt).some((x) => x.id === '5.K'));

// 4. Eingabe für die Rechnung: Antworten aus übersprungenen Bereichen zählen nicht
const b = A.neu(); b.alterJahre = '85'; b.vor = { 1: true, 4: false }; b.stufen = { '1.4': 3, '4.8': 3 };
const g = A.eingabe(b, null);
ok('Übersprungener Bereich zählt nicht', g.stufen['4.8'] === undefined && g.stufen['1.4'] === 3, g.stufen);
// Gleiches Ergebnis wie die Rechnung von pflege.js mit denselben Werten (Beispiel: Bereich 1 und 4 überwiegend unselbständig)
const c = A.neu(); c.alterJahre = '82'; c.vor = { 1: true, 4: true };
for (const k of P.KRITERIEN.filter((x) => x.m === 1 || (x.m === 4 && x.s === 'sel' && !x.ink))) c.stufen[k.id] = 2;
const r = P.rechne(A.eingabe(c, null));
const direkt = P.rechne({ stufen: c.stufen, alterJahre: '82' });
ok('Einschätzung rechnet wie pflege.js', r.gesamt === direkt.gesamt && r.pg === direkt.pg, { r: r.gesamt, d: direkt.gesamt });
ok('Beispiel: 10 + 30 = 40 Punkte, Pflegegrad 2', r.gesamt === 40 && r.pg === 2, { g: r.gesamt, pg: r.pg });

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Pflegegrad-Einschätzung (Texte, Ablauf, Rechnung): alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
