// Rechtsmatrix Pflege & Rente (Vollprüfung 24.11.2026): Fälle beider Prüfungen (Claude „pflege-rente“, Fable „fable-pflege-rente“)
// und eigene Fälle der Korrektur, Datei test/rechtsmatrix/pflege.json. Bereinigte Matrix mit Quellen: docs/rechtsmatrix/pflege.md.
// Fallarten: Karte (Status, Texte, Betrag), „nba“ (Pflegegrad-Rechnung erweiterungen/pflege.js), „funktion“ (z. B. nettoRente).
// Dazu feste Prüfungen: Wohngeld-Schätzung aus der Rentenauszahlung nicht günstiger als mit Brutto (§ 16 WoGG, Befund B09) und
// Pflege-Einschätzung für Kinder bis 18 Monate (nur Module 3, 5 und 4.K; Begutachtungs-Richtlinien).
'use strict';
const path = require('path');
const Rules = require(path.join(__dirname, '..', 'src', 'rules.js'));
const Pflege = require(path.join(__dirname, '..', 'erweiterungen', 'pflege.js'));
const T = require('./rechtsmatrix/pflege.json');
const zahl = (v) => (v && typeof v === 'object' ? (v.eur != null ? v.eur : v.eur2 != null ? v.eur2 : NaN) : Number(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')));
let ok = 0; const fehler = [];
for (const t of T) {
  const f = [];
  if (t.art === 'funktion') {
    const w = Rules[t.funktion].apply(null, t.args);
    if (!(Math.abs(w - t.erwartet.wert) <= t.erwartet.toleranz)) f.push(t.funktion + ': ist ' + w + ', soll ' + t.erwartet.wert);
  } else if (t.art === 'nba') {
    const r = Pflege.rechne(t.g);
    const E = t.erwartet;
    if ((E.pg != null && r.pg !== E.pg) || (E.punkte != null && r.gesamt !== E.punkte) || (E.modul4 != null && r.module[4].summe !== E.modul4)) f.push('NBA: ist PG ' + r.pg + ' / ' + r.gesamt + ' Punkte / Modul 4: ' + r.module[4].summe + ', soll ' + JSON.stringify(E));
  } else {
    const res = {}; Rules.evaluate(t.h).results.forEach((r) => { res[r.id] = r; });
    for (const id of Object.keys(t.erwartet)) {
      const e = t.erwartet[id], r = res[id];
      if (!r) { f.push(id + ': Karte fehlt'); continue; }
      if (e.status && e.status.split('|').indexOf(r.level) < 0) f.push(id + ': Status ist „' + r.level + '“ (' + r.hl + '), soll „' + e.status + '“');
      const keys = r.tx.map((x) => x[0]);
      (e.tx || []).forEach((k) => { if (keys.indexOf(k) < 0) f.push(id + ': Text ' + k + ' fehlt (' + keys.join(', ') + ')'); });
      (e.txNicht || []).forEach((k) => { if (keys.indexOf(k) >= 0) f.push(id + ': Text ' + k + ' wird gezeigt, darf nicht'); });
      if (e.betrag != null) {
        const p = e.betragAus.split('.'); const param = p.pop(); const key = p.join('.');
        const tx = r.tx.find((x) => x[0] === key);
        if (!tx || !tx[1] || tx[1][param] == null) f.push(id + ': Betrag ' + e.betragAus + ' fehlt, soll ' + e.betrag);
        else { const w = zahl(tx[1][param]); if (!(Math.abs(w - e.betrag) <= (e.toleranz || 0.01))) f.push(id + ': Betrag ' + e.betragAus + ' ist ' + w + ', soll ' + e.betrag); }
      }
    }
  }
  if (f.length) fehler.push({ id: t.id, beschreibung: t.beschreibung, f }); else ok++;
}

// B09: Rentner, Wohngeld: nur Auszahlung eingegeben darf keine höhere untere Schätzung ergeben als dasselbe Brutto (Auszahlung ≈ 87,65 % Brutto)
const ext = [];
const schaetz = (r) => { const s = r.tx.find((x) => x[0] === 'schaetz.spanne' || x[0] === 'schaetz.eins'); return s ? zahl(s[1].a) : 0; };
for (const brutto of [900, 1100, 1300, 1500]) {
  const aus = Math.round(brutto * 0.8765);
  const basis = { adults: 1, kids: 0, young: 0, miete: 650, mietstufe: '3', vermoegen: 0, gebJahr: 1950, heute: 2026.9, bezug: {}, ohneWege: true, bundesland: 'BY' };
  const mitB = Rules.evaluate({ ...basis, einkommen: [{ art: 'rente', b: brutto, n: aus }] }).results.find((x) => x.id === 'wohngeld');
  const nurA = Rules.evaluate({ ...basis, einkommen: [{ art: 'rente', b: aus, n: '' }] }).results.find((x) => x.id === 'wohngeld');
  ext.push(['Wohngeld Rente ' + brutto + ' €: Schätzung aus Auszahlung (' + schaetz(nurA) + ') ≤ aus Brutto (' + schaetz(mitB) + ')', schaetz(nurA) <= schaetz(mitB)]);
}
// Säugling: Module 1, 2, 6 zählen nicht; 4.K bringt 20 Einzelpunkte
const s = Pflege.rechne({ alterJahre: 0, alterMonate: 12, stufen: { '1.4': 3, '1.5': 3, '2.1': 3, '2.2': 3, '6.1': 3, '6.2': 3, '6.3': 3 } });
ext.push(['Kind 12 Monate: Module 1, 2, 6 zählen nicht (0 Punkte)', s.gesamt === 0 && s.pg === 0]);
const e = Pflege.rechne({ alterJahre: 20, stufen: { '1.4': 3, '1.5': 3, '6.1': 3, '6.2': 3, '6.3': 3 } });
ext.push(['Erwachsene: Module 1 und 6 zählen weiter', e.gesamt > 0]);
ext.forEach(([name, c]) => { if (c) ok++; else fehler.push({ id: 'fest', beschreibung: name, f: ['nicht erfüllt'] }); });

console.log('[vp-pflege] Rechtsmatrix Pflege & Rente: ' + (T.length + ext.length) + ' Prüfungen, bestanden: ' + ok + ', Fehler: ' + fehler.length);
fehler.forEach((x) => console.log('FAIL ' + x.id + ' – ' + x.beschreibung + '\n    ' + x.f.join('\n    ')));
process.exit(fehler.length ? 1 : 0);
