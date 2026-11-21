// Fristen für die Erweiterungen (nicht Teil der App 1.2.0)
// 1. Widerspruchsfrist: Bekanntgabe bei Post am vierten Tag nach Aufgabe zur Post (§ 37 Abs. 2 SGB X, seit 1.1.2025),
//    Frist ein Monat ab Bekanntgabe (§ 84 Abs. 1 SGG), Fristende nach § 64 SGG (gleicher Tag im Folgemonat, sonst Monatsletzter;
//    Samstag, Sonntag oder gesetzlicher Feiertag → nächster Werktag). SoLo nennt bewusst den frühesten möglichen Tag:
//    Die Bekanntgabe wird nicht verschoben, und es zählen nur bundesweite Feiertage (Landesfeiertage können die Frist verlängern).
// 2. Erinnerung an den Weiterbewilligungs- bzw. Folgeantrag vor dem Ende des Bewilligungszeitraums.
// Daten als 'JJJJ-MM-TT' (ohne Uhrzeit, keine Zeitzonen-Probleme).
const Fristen = (function () {
  'use strict';
  const iso = (d) => d.toISOString().slice(0, 10);
  const tag = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const plusTage = (s, n) => { const d = tag(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };

  // Ostersonntag (Gauß/Meeus) und bundesweite Feiertage
  function ostern(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mon = Math.floor((h + l - 7 * m + 114) / 31), t = ((h + l - 7 * m + 114) % 31) + 1;
    return `${y}-${String(mon).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
  }
  function feiertage(y) {
    const o = ostern(y);
    return new Set([`${y}-01-01`, plusTage(o, -2), plusTage(o, 1), `${y}-05-01`, plusTage(o, 39), plusTage(o, 50), `${y}-10-03`, `${y}-12-25`, `${y}-12-26`]);
  }
  function werktag(s) {
    let d = s;
    for (;;) {
      const w = tag(d).getUTCDay();
      if (w !== 0 && w !== 6 && !feiertage(+d.slice(0, 4)).has(d)) return d;
      d = plusTage(d, 1);
    }
  }
  // Ein Monat nach § 64 Abs. 2 SGG: Tag mit derselben Zahl im Folgemonat, fehlt er, der letzte Tag des Monats
  function einMonat(s) {
    const [y, m, d] = s.split('-').map(Number);
    const ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
    const letzter = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
    return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(d, letzter)).padStart(2, '0')}`;
  }

  // datum: Datum des Bescheids (Aufgabe zur Post) oder zugang: Tag, an dem er sicher zugegangen ist (z. B. persönlich übergeben)
  function widerspruch({ datum, zugang }) {
    const bekanntgabe = zugang || plusTage(datum, 4);
    const ende = werktag(einMonat(bekanntgabe));
    return { bekanntgabe, fristende: ende, hinweis: 'Der Widerspruch muss bis zu diesem Tag bei der Stelle eingegangen sein (Einwurf in den Briefkasten der Stelle, Fax oder persönlich mit Eingangsstempel). Fehlt die Rechtsbehelfsbelehrung oder ist sie falsch, gilt ein Jahr (§ 66 SGG, beim Wohngeld § 58 VwGO).' };
  }

  // Erinnerung an den Folgeantrag: leistung = 'sgb2' | 'wohngeld' | 'kiz'; ende = letzter Tag des Bewilligungszeitraums
  const VORLAUF = {
    sgb2: { tage: 42, stelle: 'Jobcenter', text: 'Weiterbewilligungsantrag stellen. Ohne Antrag endet die Zahlung mit dem Bewilligungszeitraum.' },
    wohngeld: { tage: 60, stelle: 'Wohngeldstelle', text: 'Weiterleistungsantrag stellen. Wohngeld gibt es erst ab dem Monat des Antrags, ein später Antrag kostet Geld.' },
    kiz: { tage: 42, stelle: 'Familienkasse', text: 'Neuen Antrag auf Kinderzuschlag stellen. Er wird immer nur für sechs Monate bewilligt.' }
  };
  function erinnerung({ leistung, ende }) {
    const v = VORLAUF[leistung];
    if (!v || !ende) return null;
    return { leistung, ende, erinnerungAm: plusTage(ende, -v.tage), stelle: v.stelle, text: v.text };
  }

  return { widerspruch, erinnerung, einMonat, werktag, feiertage, ostern, plusTage };
})();
if (typeof module !== 'undefined') module.exports = Fristen;
