// Text aus einem Pflegegutachten lesen (Erweiterung, nicht Teil der App 1.2.0)
// Eingabe: Text aus der Texterkennung (Foto/Scan) oder aus einem PDF. Gesucht wird je Kriterium der Name aus Anlage 1
// und die danach folgende Bewertung. Alles Erkannte ist nur ein Vorschlag: Der Nutzer bestätigt jede Zahl, bevor gerechnet wird.
// Robust gegen Texterkennung und PDF-Spalten (Muster: Formulargutachten der BRi, Kap. 6.2, md-nord.de, abgerufen 21.11.2026):
// Umlaute fehlen oft („selbstandig“), Namen sind mit der Kriteriennummer dazwischen umbrochen („Sitzpo- / 4.1.2 / sition“),
// statt des Worts steht nur der Punktwert in der Spalte. Dann zählt die Nummer „4.<Modul>.<Kriterium>“ und genau ein Punktwert.
const PflegeImport = (function () {
  'use strict';
  const norm = (s) => String(s || '')
    .replace(/­/g, '') // weiches Trennzeichen
    .replace(/-[ \t]*\r?\n\s*(?=[a-zäöüß])/g, '') // Silbentrennung am Zeilenende (nur wenn ein Wortteil folgt)
    .replace(/[„“”"]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    // Texterkennung verliert Umlaute; neue Schreibung „selbstständig“ wie „selbständig“
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .replace(/selbstst/g, 'selbst')
    // Texterkennung: „Überwiegeng“, „UNnselbständig“
    .replace(/\buberwie[a-z]*/g, 'uberwiegend').replace(/\bun+selbst/g, 'unselbst')
    // verstümmeltes „überwiegend“ direkt vor „(un)selbständig“ („Twiegend Selbständig“, „äegend UNnselbständig“)
    .replace(/\b[a-z]*(?:wieg|iegen|egend)[a-z]*(?=\s+(?:un)?selbst)/g, 'uberwiegend');
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Namen tolerant: Leerraum flexibel, Klammerzusätze optional
  const muster = (name) => esc(norm(name).replace(/\s*\(.*?\)\s*/g, ' ').trim()).replace(/\\? /g, '\\s*');
  // Nächste Kriteriennummer („1.2“, „4.1.2“, „F 4.1.2“): dort endet die Bewertung des vorigen Kriteriums
  const NAECHSTE = /(?:^|[\s(])(?:k?f\s?)?(?:4\.)?[1-6]\.\d{1,2}(?=[\s.,;)]|$)/;
  // Verweis statt Bewertung: „… entweder unter 4.3.2 oder …“, „entfällt (4.4.13 entfällt)“
  const VERWEIS = /\(\s*(?:k?f\s?)?4\.[1-6]\.\d|\b(?:unter|siehe|vgl\.?)\s+(?:k?f\s?)?4\.[1-6]/;
  const SEITE = /seite \d+ von \d+/g;

  function stufeIn(nach, k, Pflege) {
    // Erläuterungen in Klammern sind keine Bewertung („häufig (… nicht täglich)“: „täglich“ zählt nicht)
    nach = nach.replace(/\([^)]*\)?/g, ' ');
    // Mehrere einzelne Ziffern („0 1 2 3“): leere Formularzeile, die Wörter danach gehören zur nächsten Spaltenüberschrift
    const z = [...new Set((nach.match(/(?:^|\s)\d(?=\s|$)/g) || []).map((x) => +x.trim()))];
    if (z.length > 1) return null;
    // längste Stufenbezeichnung zuerst (sonst passt „selbständig“ auch in „überwiegend selbständig“)
    const sk = Pflege.SKALA[k.s].stufen.map((s, i) => ({ s: norm(s).replace(/\s*\(.*?\)\s*/g, ' ').trim(), i })).sort((a, b) => b.s.length - a.s.length);
    let best = null;
    for (const x of sk) {
      // nur ganze Wörter: „selbständig“ nicht in einem verstümmelten „…unselbständig“ finden
      const r = new RegExp('(?:^|[^a-z])' + esc(x.s)).exec(nach);
      const p = r ? r.index + r[0].length - x.s.length : -1;
      if (p >= 0 && (best == null || p < best.p || (p === best.p && x.s.length > best.len))) best = { p, i: x.i, len: x.s.length };
    }
    // Kurzformen in Gutachten: „überw. selbständig“, „überw. unselbständig“
    if (k.s === 'sel') {
      const kurz = [[/uberw\.?\s*unselbst/, 2], [/uberw\.?\s*selbst/, 1], [/\bunselbst/, 3], [/\bselbst/, 0]];
      for (const [r, i] of kurz) { const mm = r.exec(nach); if (mm && (best == null || mm.index < best.p)) best = { p: mm.index, i, len: mm[0].length }; }
    }
    if (best) return best.i;
    // Nur der Punktwert in der Spalte: genau eine einzelne Ziffer (ein leeres Formular zeigt alle Werte „0 1 2 3“ und bleibt leer)
    if (z.length !== 1) return null;
    const sk2 = Pflege.SKALA[k.s];
    const i = sk2.punkte.findIndex((p) => p * (k.faktor || 1) === z[0]);
    return i >= 0 ? i : null;
  }
  function fenster(t, ab) {
    let nach = t.slice(ab, ab + 160);
    if (VERWEIS.test(nach.slice(0, 60))) return '';
    const m = NAECHSTE.exec(nach);
    if (m) nach = nach.slice(0, m.index);
    // Spaltenköpfe, Erläuterungen und Summen danach gehören nicht mehr zum Kriterium
    const ende = /\b(?:versorgung|erlauterung|summe der einzelpunkte|gewichtete punkte|die fahigkeit ist|modul [1-6])\b/.exec(nach);
    if (ende) nach = nach.slice(0, ende.index);
    return nach;
  }

  function lies(text, Pflege) {
    // Spaltenköpfe von 4.4.13 („Versorgung selbständig“, „Versorgung mit Hilfe …“) sind keine Bewertung des Kriteriums davor
    const t = norm(text).replace(SEITE, ' ').replace(/versorgung (?:selbstandig|mit hilfe)/g, ' ');
    const stufen = {}, gefunden = [], fehlend = [];
    for (const k of Pflege.KRITERIEN) {
      // Jede Fundstelle des Namens prüfen: Der Name kommt auch in Erläuterungen vor („z. B. nächtliche Unruhe … unter 4.3.2“)
      const re = new RegExp(muster(k.name), 'g');
      let i = null, m;
      while (i == null && (m = re.exec(t))) i = stufeIn(fenster(t, m.index + m[0].length), k, Pflege);
      if (i == null) {
        // Nummer aus dem Formulargutachten: Kriterium „1.2“ steht dort als „4.1.2“
        const nr = new RegExp('(?:^|\\s)(?:k?f\\s?)?4\\.' + esc(k.id) + '(?=\\s)', 'g');
        let mm;
        while (i == null && (mm = nr.exec(t))) i = stufeIn(fenster(t, mm.index + mm[0].length), k, Pflege);
      }
      if (i != null) { stufen[k.id] = i; gefunden.push(k.id); } else fehlend.push(k.id);
    }
    // Feststellungen zur Inkontinenz und Pflegegrad aus dem Bescheid. Die Namen der Kriterien 4.11/4.12 enthalten selbst „Harninkontinenz“,
    // „Dauerkatheter“, „Stoma“ und werden deshalb vorher entfernt; gezählt wird nur eine ausdrückliche Feststellung.
    let rest = t;
    for (const k of Pflege.KRITERIEN) rest = rest.replace(new RegExp(muster(k.name), 'g'), ' ');
    const inkontinenz = { harn: /harn\w*\s*:?\s*(?:ist\s*)?(?:uberwiegend|vollstandig)\s*inkontinent|(?:uberwiegend|vollstandig)\s*harninkontinent|(?:uberwiegend|vollstandig)\s*inkontinent[^.]{0,30}\bharn|\burostoma\b[^.]{0,20}\b(?:vorhanden|angelegt)|dauerkatheter[^.]{0,20}\b(?:vorhanden|liegt|angelegt)/.test(rest),
      stuhl: /stuhl\w*\s*:?\s*(?:ist\s*)?(?:uberwiegend|vollstandig)\s*inkontinent|(?:uberwiegend|vollstandig)\s*stuhlinkontinent|(?:uberwiegend|vollstandig)\s*inkontinent[^.]{0,30}\bstuhl|\b(?:colo|ileo)?stoma\b[^.]{0,20}\b(?:vorhanden|angelegt)/.test(rest) };
    const pg = /pflegegrad\s*:?\s*([1-5])\b/.exec(t);
    return { stufen, gefunden, fehlend, inkontinenz, pgBescheid: pg ? +pg[1] : null };
  }
  return { lies, norm };
})();
if (typeof module !== 'undefined') module.exports = PflegeImport;
