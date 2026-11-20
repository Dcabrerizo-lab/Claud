// Tests: Einfache Sprache in der Pflege-Einschätzung (src/lang/einfach/pflege/pflege.json, pflege-fragen.js, pflege-assistent.js)
// - Jede Frage, Antwort, jeder Hinweis und jeder feste Text der Ergebnisseite hat eine einfache Fassung ("=" = Standard ist schon einfach).
// - Zahlen bleiben gleich: keine Zahl fällt weg, neue Zahlen nur als Ziffer statt Zahlwort (bis 12). Platzhalter gleich.
// - Punktewerte unverändert: Anzahl, Reihenfolge und Werte der Antworten sind in beiden Fassungen gleich, die Rechnung auch.
'use strict';
const fs = require('fs');
const path = require('path');
global.Pflege = require('../erweiterungen/pflege.js');
global.PflegeFragen = require('../erweiterungen/pflege-fragen.js');
const P = global.Pflege, F = global.PflegeFragen;
const A = require('../erweiterungen/pflege-assistent.js');
const E = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'lang', 'einfach', 'pflege', 'pflege.json'), 'utf8'));
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
const zahlen = (s) => s.replace(/\{\w+\}/g, '').match(/\d+(?:[.,]\d+)*/g) || [];
const klein = (z) => /^\d+$/.test(z) && +z <= 12;
// Einfache Fassung gegen Standardtext prüfen
function vergleiche(name, std, ein, istFrage) {
  ok(`${name}: einfache Fassung vorhanden`, typeof ein === 'string' && ein.trim() !== '', ein);
  if (typeof ein !== 'string' || ein === '=') return;
  ok(`${name}: Platzhalter gleich`, ph(std) === ph(ein), [std, ein]);
  const z0 = zahlen(std), z1 = zahlen(ein);
  ok(`${name}: keine Zahl weggefallen`, z0.every((z) => z1.includes(z)), [z0, z1]);
  ok(`${name}: keine neue Zahl`, z1.every((z) => z0.includes(z) || klein(z)), [z0, z1]);
  if (istFrage) ok(`${name}: bleibt eine Frage`, /\?$/.test(ein), ein);
}

// 1. Fragen und Hinweise je Kriterium, Vorfragen, Bereich 5
for (const id of Object.keys(F.TEXT)) {
  const e = E.text[id] || [];
  vergleiche(`Frage ${id}`, F.TEXT[id][0], e[0], true);
  vergleiche(`Hinweis ${id}`, F.TEXT[id][1], e[1]);
}
for (const m of Object.keys(F.VORFRAGE)) {
  const e = E.vorfrage[m] || [];
  vergleiche(`Vorfrage ${m}`, F.VORFRAGE[m].frage, e[0], true);
  vergleiche(`Vorfrage-Hinweis ${m}`, F.VORFRAGE[m].hinweis, e[1]);
}
for (const id of Object.keys(F.M5)) {
  vergleiche(`Frage ${id}`, F.M5[id], E.m5[id], true);
  // „Wie oft“-Frage wird aus der Frage gebildet: Anfang „Muss jemand “ muss bleiben
  if (/^Muss jemand /.test(F.M5[id]) && E.m5[id] !== '=') ok(`${id}: beginnt mit „Muss jemand“`, /^Muss jemand /.test(E.m5[id]), E.m5[id]);
}
for (const id of Object.keys(F.M5_KURZ)) vergleiche(`Kurz ${id}`, F.M5_KURZ[id], E.m5Kurz[id]);
for (const id of Object.keys(F.M5_TIPP)) vergleiche(`Tipp ${id}`, F.M5_TIPP[id], E.m5Tipp[id]);
vergleiche('Hinweis Bereich 5', F.M5_HINWEIS, E.m5Hinweis);
vergleiche('Hinweis Kinder', F.KIND, E.kind);
F.GRUNDSATZ.forEach((t, i) => vergleiche(`Grundsatz ${i + 1}`, t, E.grundsatz[i]));
ok('Grundsätze: gleiche Anzahl', E.grundsatz.length === F.GRUNDSATZ.length);
vergleiche('Wie oft 5.12', F.m5Oft('5.12'), E.m5Oft['5.12'], true);
for (const m of [1, 2, 3, 4, 5, 6]) vergleiche(`Bereich ${m}`, P.MODUL[m].kurz, E.modul[m]);

// 2. Antworten: gleiche Anzahl wie die Stufen in pflege.js (die Stufe bestimmt die Punkte)
for (const s of Object.keys(P.SKALA)) {
  const std = P.SKALA[s].kurz, e = E.antworten[s] || [];
  ok(`Antworten ${s}: gleiche Anzahl`, e.length === std.length && std.length === P.SKALA[s].punkte.length, e);
  std.forEach((t, i) => vergleiche(`Antwort ${s}[${i}]`, t, e[i]));
}
for (const [art, id] of [['oft', '5.1'], ['besuch', '5.13'], ['aufwendig', '5.12']]) {
  const std = F.m5Antworten(id), e = E.antworten[art] || [];
  ok(`Antworten ${art}: gleiche Anzahl`, e.length === std.length, e);
  std.forEach((x, i) => vergleiche(`Antwort ${art}[${i}]`, x.text, e[i]));
}

// 3. Feste Texte der Oberfläche (T('Schlüssel', 'Standard') in pflege-assistent.js) und Aktionen der Ergebnisseite (src/app.js)
const quelle = fs.readFileSync(path.join(__dirname, '..', 'erweiterungen', 'pflege-assistent.js'), 'utf8');
const genutzt = {};
for (const m of quelle.matchAll(/\bT\('([\w.]+)', '((?:[^'\\]|\\.)*)'/g)) genutzt[m[1]] = m[2];
ok('Feste Texte gefunden', Object.keys(genutzt).length >= 50, Object.keys(genutzt).length);
for (const [k, std] of Object.entries(genutzt)) vergleiche(`Text ${k}`, std, E.ui[k], /\?$/.test(std));
const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
const aktionen = [...app.matchAll(/\{ id: '(\w+)', (?:kachel: '\w+', sym: PA_SYM\.\w+, )?titel: '([^']+)'(?:, text: '([^']+)')?/g)];
ok('Aktionen der Ergebnisseite mit id', aktionen.length === 5, aktionen.map((x) => x[1]));
for (const [, id, titel, text] of aktionen) {
  vergleiche(`Aktion ${id} Titel`, titel, E.ui[`aktion.${id}.titel`]);
  if (text) vergleiche(`Aktion ${id} Text`, text, E.ui[`aktion.${id}.text`]);
}
vergleiche('Aktion hilfen Text', 'Unterstützung bei Pflegegrad {pg}', E.ui['aktion.hilfen.text']);
vergleiche('Aktion hilfen Text ohne Pflegegrad', 'Hilfen schon ohne Pflegegrad', E.ui['aktion.hilfen.text0']);
const erlaubt = new Set(Object.keys(genutzt).concat(aktionen.flatMap(([, id, , text]) => [`aktion.${id}.titel`].concat(text ? [`aktion.${id}.text`] : [])), ['aktion.hilfen.text', 'aktion.hilfen.text0']));
const uebrig = Object.keys(E.ui).filter((k) => !erlaubt.has(k));
ok('Keine ungenutzten Texte', uebrig.length === 0, uebrig);

// 4. Schalter wirkt nur auf Texte: Werte, Reihenfolge und Rechnung bleiben gleich
const ids5 = P.M5A.concat(P.M5B, P.M5C).map((x) => x[0]);
const werte = () => JSON.stringify(ids5.map((id) => F.m5Antworten(id).map((x, i) => [x.wert, F.m5Wert(id, i)])));
F.setEinfach(false);
const w0 = werte(), f0 = F.frage('2.3'), o0 = ids5.map((id) => F.m5Oft(id));
F.setEinfach(true);
ok('Schalter an: einfache Texte', F.istEinfach() && F.frage('2.3') !== f0 && F.frage('2.3') === E.text['2.3'][0]);
ok('Schalter an: "=" zeigt den Standardtext', F.frage('1.1') === F.TEXT['1.1'][0]);
ok('Schalter an: Werte der Antworten in Bereich 5 gleich', werte() === w0);
ok('Schalter an: jede „Wie oft“-Frage ist eine Frage', ids5.every((id) => /^Wie oft .*\?$/.test(F.m5Oft(id))), ids5.map((id) => F.m5Oft(id)));
ok('Schalter an: „Wie oft“ 5.13 einfach', F.m5Oft('5.13') !== o0[ids5.indexOf('5.13')]);
ok('Schalter an: Antworten Stufe 1 bei Häufigkeit einfach', F.antwortTexte('hfg', P.SKALA.hfg.kurz)[1] === E.antworten.hfg[1]);
const a = A.neu(); a.alterJahre = '84'; a.vor = { 1: true, 3: true, 4: true, 5: true };
for (const k of P.KRITERIEN) if (k.m !== 2) a.stufen[k.id] = k.s === 'sonde' ? 0 : 2;
a.m5Hilfe = { '5.1': true, '5.13': true }; a.m5 = { '5.1': F.m5Wert('5.1', 3), '5.13': F.m5Wert('5.13', 2) };
const rEin = P.rechne(A.eingabe(a, null));
F.setEinfach(false);
const rStd = P.rechne(A.eingabe(a, null));
ok('[pflege-einfach] Rechnung in beiden Fassungen gleich', rEin.gesamt === rStd.gesamt && rEin.pg === rStd.pg, [rEin.gesamt, rStd.gesamt]);

// 5. Oberfläche: Einschätzung mit Schalter an zeigt die einfachen Texte, ohne Schalter die Standardtexte
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><div id="b"></div>');
global.document = dom.window.document;
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
const box = global.document.getElementById('b');
const b = A.neu(); b.alterJahre = '80'; b.pos = 3; // Vorfrage Bereich 3
A.start(box, { antworten: b, einfach: true });
ok('Oberfläche einfach: Vorfrage 3', box.querySelector('#pa-q').textContent === E.vorfrage[3][0], box.querySelector('#pa-q').textContent);
b.pos = 7; A.start(box, { antworten: b, einfach: true, pgAktuell: 3 });
ok('Oberfläche einfach: Ergebnisseite', box.textContent.includes(E.ui['erg.hinweis']) && box.textContent.includes(E.ui['erg.niedriger'].replace('{jetzt}', '3')), box.textContent.slice(0, 300));
A.start(box, { antworten: b, pgAktuell: 3 });
ok('Oberfläche ohne Schalter: Standardtext', box.textContent.includes('Das ist eine Einschätzung. Entscheiden tut die Pflegekasse.') && !F.istEinfach());

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Pflege-Einschätzung in Einfacher Sprache: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
