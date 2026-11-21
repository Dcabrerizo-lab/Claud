// Abhängigkeitstest: Welche Angabe verändert welches Ergebnis?
// Für viele zufällige Haushalte wird jeweils EINE Angabe geändert (z. B. Aufenthalt, Alter, Pflegegrad) und alles andere
// gleich gelassen. Ändert sich dadurch die Einstufung einer Karte, hängt die Karte von dieser Angabe ab.
// Das Ergebnis wird mit der Soll-Tabelle test/abhaengigkeiten.json verglichen (jede Zeile mit Rechtsgrundlage):
//  - Soll „hängt ab“, aber die Karte reagiert nie         → FEHLER (Voraussetzung vergessen, z. B. Aufenthalt beim WBS)
//  - Karte reagiert, aber in der Soll-Tabelle steht nichts → FEHLER (neue, ungeprüfte Abhängigkeit: Tabelle prüfen und ergänzen)
//  - Ausschluss-Regeln (z. B. „Asyl → nie wahrscheinlich“, „hoechstens“) und Mindest-Regeln („mindestens“, optional nur mit Kindern
//    oder nur „wenn“ weitere Angaben passen)
//    werden für jeden Haushalt geprüft
// Bekannte, schon vorgemerkte Lücken stehen in „bekannt“ und werden nur gemeldet (mit Verweis auf den Entwurf).
// Aufruf: node test/test-abhaengigkeiten.js [Anzahl Haushalte, Standard 1500]   ·   --tabelle  gibt die beobachtete Tabelle aus
'use strict';
// ohneWege: Eigenschaften je Leistung; die zwei Wege (Grundsicherungsgeld oder Wohngeld und Kinderzuschlag) koppeln Leistungen absichtlich
// und haben eigene Tests in test/test.js
const Rules0 = require('../src/rules.js');
const Rules = Object.assign({}, Rules0, { evaluate: (e) => Rules0.evaluate(Object.assign({ ohneWege: true }, e)) });
const KARTEN = require('./karten.js');
const SOLL = require('./abhaengigkeiten.json');

const N = Number(process.argv.find((a) => /^\d+$/.test(a))) || 1500;
const ZEIGEN = process.argv.includes('--tabelle');
const HEUTE = Number(process.env.HEUTE) || 2026.8;
let seed = 9137;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

function zufall() {
  const adults = rnd() < 0.5 ? 1 : 2;
  const kids = pick([0, 0, 1, 2, 3]);
  const art1 = pick(['lohn', 'lohn', 'rente', 'alg', 'unt', 'ohne']);
  const art2 = adults === 2 ? pick(['lohn', 'rente', 'unt', 'ohne']) : '';
  const b1 = art1 === 'ohne' ? 0 : Math.round(rnd() * 3500);
  const b2 = art2 && art2 !== 'ohne' ? Math.round(rnd() * 2500) : 0;
  const q = (a) => (a === 'lohn' ? 0.72 : 1);
  // Asylbewerberleistungen (asylblg) ohne weiteren Zufallswert: bei „ohne“ und ungerader Kinderzahl. Zählt nur mit Aufenthalt „asyl“,
  // sonst wie „ohne“ – die übrigen Beobachtungen bleiben gleich
  return {
    adults, kids, kidsU6: Math.floor(rnd() * (kids + 1)), young: pick([0, 0, 1]),
    art1: art1 === 'ohne' && kids % 2 === 1 ? 'asylblg' : art1, art2, brutto: b1 + b2, brutto2: adults === 2 ? b2 : '', netto: Math.round(b1 * q(art1) + b2 * q(art2)),
    miete: pick([0, 300 + Math.round(rnd() * 1200)]), mietstufe: pick(['', '1', '3', '5', '7']),
    vermoegen: pick([0, 0, 3000, 9000, 14000, 40000, 70000]),
    gebJahr: pick(['', 1950, 1958, 1965, 1980, 1995, 2003]), heute: HEUTE,
    unterhaltFehlt: kids > 0 && rnd() < 0.4, unterhalt: kids > 0 && rnd() < 0.3 ? Math.round(rnd() * 600) : '',
    pflegegrad: pick(['', '', '', '1', '2', '3', '4', '5']),
    bhPerson: pick(['', '', 'erwNach25', 'erwVor25', 'minder']), gdb: pick(['', '30', '50', '60', '80', '100', 'H']),
    blind: pick(['', '', '', 'blind', 'hoch']), mzG: rnd() < 0.2,
    ausbildung: pick(['', '', '', 'ich', 'kind', 'kindBetrieb']), aufenthalt: '', babBetrieb: rnd() < 0.5, babWohnt: rnd() < 0.5,
    bhSelbst: rnd() < 0.5, wfbm: rnd() < 0.1, kindKrank: rnd() < 0.2,
    baby: pick(['', '', '', 'da', 'bald']), egVor: pick(['', 0, 900, 2000]),
    wohnart: rnd() < 0.1 ? 'eigentum' : '', hhAndere: pick(['', '', '', 'wg', 'verwandte']), autoWert: pick(['', '', 7000, 20000]), autoBraucht: rnd() < 0.3,
    euArbeit: pick(['', 'ja', 'nein']), euJahre: pick(['', 'unter5', 'ab5']),
    arbeitSit: pick(['', '', '', 'arbeitslos', 'krank']), algZeit: rnd() < 0.7, krankWochen: pick(['', 'unter6', 'laeuft', 'ende']), lohnVorher: pick(['', 1500, 2800, 4500]),
    bundesland: pick(['', 'BY', 'BY', 'NW', 'BE']), bezug: {}
  };
}

// Angaben, die einzeln verändert werden: Name → Liste möglicher Werte (der Haushalt wird auf jeden Wert gesetzt)
const MERKMALE = {
  aufenthalt: ['', 'eu', 'asyl', 'ausreise'],
  alter: ['', 1950, 1958, 1965, 1980, 1995, 2003],
  ausbildung: ['', 'ich', 'kind', 'kindBetrieb'],
  // Ausbildung im Betrieb und Wohnen außerhalb der Eltern (BAB, § 60 SGB III)
  bab: ['', 'betrieb', 'betriebWohnt'],
  bhPerson: ['', 'ich', 'minder', 'erwVor25', 'erwNach25'],
  wfbm: [false, true],
  kindKrank: [false, true],
  einkommen2: [0, 500, 1500],
  pflegegrad: ['', '1', '2', '3', '5'],
  behinderung: ['', '30', '50', '80', '100', 'H'],
  blind: ['', 'blind', 'hoch'],
  kinder: [0, 1, 3],
  baby: ['', 'da', 'bald'],
  wohnart: ['', 'eigentum'],
  vermoegen: [0, 9000, 70000],
  bundesland: ['', 'BY', 'NW', 'BE'],
  arbeit: ['', 'arbeitslos', 'krank'],
  einkommen: [0, 900, 2500, 6000],
  miete: [0, 500, 1400]
};
function setze(e, m, v) {
  const x = { ...e, bezug: {} };
  if (m === 'alter') x.gebJahr = v;
  else if (m === 'behinderung') x.gdb = v;
  else if (m === 'kinder') { x.kids = v; x.kidsU6 = Math.min(x.kidsU6, v); if (!v) { x.unterhaltFehlt = false; x.unterhalt = ''; } }
  else if (m === 'arbeit') x.arbeitSit = v;
  else if (m === 'bab') { x.babBetrieb = v !== ''; x.babWohnt = v === 'betriebWohnt'; }
  else if (m === 'einkommen2') {
    // Einkommen der 2. Person (Lohn); bei Alleinstehenden ohne Wirkung
    if (x.adults === 2) { const b1 = x.brutto - (Number(x.brutto2) || 0), n1 = x.art1 === 'lohn' ? 0.72 : 1; x.art2 = v ? 'lohn' : 'ohne'; x.brutto2 = v; x.brutto = b1 + v; x.netto = Math.round(b1 * n1 + v * 0.72); }
  }
  else if (m === 'bundesland') x.bundesland = v;
  else if (m === 'einkommen') { x.art1 = v ? 'lohn' : 'ohne'; x.art2 = x.adults === 2 ? 'ohne' : ''; x.brutto = v; x.brutto2 = x.adults === 2 ? 0 : ''; x.netto = Math.round(v * 0.72); }
  else x[m] = v;
  return x;
}
const stufen = (e) => { const m = {}; Rules.evaluate(e).results.forEach((r) => { m[r.id] = r.level; }); return m; };

// Beobachtung
const beob = {}; KARTEN.forEach((k) => { beob[k] = {}; });
const fehler = [];
const ausschlussVerstoss = {};
for (let i = 0; i < N; i++) {
  const basis = zufall();
  for (const [m, werte] of Object.entries(MERKMALE)) {
    const erg = werte.map((v) => { const e = setze(basis, m, v); return { v, e, s: stufen(e) }; });
    for (const k of KARTEN) {
      const set = new Set(erg.map((x) => x.s[k]));
      if (set.size > 1) beob[k][m] = (beob[k][m] || 0) + 1;
    }
    // Ausschluss-Regeln: bei diesem Merkmalswert darf die Karte höchstens die genannte Stufe haben
    for (const x of erg) {
      for (const regel of SOLL.ausschluesse) {
        if (regel.merkmal !== m || regel.wert !== x.v) continue;
        for (const k of regel.karten) {
          const RANG = { nein: 0, na: 0, vielleicht: 1, ja: 2 };
          if (regel.nurMitKindern && !(x.e.kids > 0)) continue;
          // wenn: weitere Bedingungen an den Haushalt (Feld → erlaubte Werte), z. B. EU-Bürger ohne Arbeit und unter 5 Jahren
          if (regel.wenn && !Object.entries(regel.wenn).every(([f, w]) => w.includes(x.e[f]))) continue;
          const zuHoch = regel.hoechstens && RANG[x.s[k]] > RANG[regel.hoechstens], zuNiedrig = regel.mindestens && RANG[x.s[k]] < RANG[regel.mindestens];
          if (zuHoch || zuNiedrig) {
            const key = k + ' bei ' + m + '=' + x.v;
            if (!ausschlussVerstoss[key]) ausschlussVerstoss[key] = { anzahl: 0, stufe: x.s[k], regel };
            ausschlussVerstoss[key].anzahl++;
          }
        }
      }
    }
  }
}

if (ZEIGEN) {
  const out = {};
  KARTEN.forEach((k) => { out[k] = Object.keys(beob[k]).sort(); });
  console.log(JSON.stringify(out, null, 1));
  process.exit(0);
}

// Vergleich mit der Soll-Tabelle
const bekannt = (k, m) => (SOLL.bekannt || []).find((b) => b.karte === k && b.merkmal === m);
const meldungen = [];
for (const k of KARTEN) {
  const soll = SOLL.karten[k];
  if (!soll) { fehler.push('Karte ' + k + ' fehlt in test/abhaengigkeiten.json'); continue; }
  for (const m of Object.keys(MERKMALE)) {
    const istAb = !!beob[k][m], sollAb = soll.haengtAb.includes(m);
    if (sollAb && !istAb) {
      const b = bekannt(k, m);
      if (b) meldungen.push('Bekannte Lücke: ' + k + ' beachtet „' + m + '“ noch nicht (' + b.entwurf + ')');
      else fehler.push(k + ': muss laut Tabelle von „' + m + '“ abhängen (' + (soll.quelle || '') + '), reagiert aber nie darauf. Voraussetzung vergessen?');
    }
    if (istAb && !sollAb) fehler.push(k + ': hängt von „' + m + '“ ab (' + beob[k][m] + ' Haushalte), steht aber nicht in der Tabelle. Rechtsgrundlage prüfen und Tabelle ergänzen.');
  }
}
for (const [key, v] of Object.entries(ausschlussVerstoss)) {
  const k = key.split(' ')[0], b = bekannt(k, v.regel.merkmal + '=' + v.regel.wert);
  const txt = key + ': Stufe „' + v.stufe + '“ in ' + v.anzahl + ' Haushalten, erlaubt ' + (v.regel.hoechstens ? 'höchstens „' + v.regel.hoechstens : 'mindestens „' + v.regel.mindestens) + '“ (' + v.regel.quelle + ')';
  if (b) meldungen.push('Bekannte Lücke: ' + txt + ' (' + b.entwurf + ')'); else fehler.push(txt);
}

meldungen.forEach((x) => console.log('  Hinweis: ' + x));
if (fehler.length) {
  console.error('Abhängigkeitstest: ' + fehler.length + ' Fehler');
  fehler.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('Abhängigkeitstest bestanden: ' + N + ' Haushalte × ' + Object.keys(MERKMALE).length + ' Angaben × ' + KARTEN.length + ' Karten' + (meldungen.length ? ' (' + meldungen.length + ' bekannte Lücken)' : ''));
