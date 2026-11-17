// Text aus einem Pflegegutachten lesen (Erweiterung, nicht Teil der App 1.2.0)
// Eingabe: Text aus der Texterkennung (Foto/Scan) oder aus einem PDF. Gesucht wird je Kriterium der Name aus Anlage 1
// und die danach folgende Bewertung. Alles Erkannte ist nur ein Vorschlag: Der Nutzer bestätigt jede Zahl, bevor gerechnet wird.
const PflegeImport = (function () {
  'use strict';
  const norm = (s) => String(s || '')
    .replace(/­/g, '') // weiches Trennzeichen
    .replace(/-\s*\n\s*/g, '') // Silbentrennung am Zeilenende
    .replace(/[„“”"]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Namen tolerant: Leerraum flexibel, Klammerzusätze optional
  const muster = (name) => esc(norm(name).replace(/\s*\(.*?\)\s*/g, ' ').trim()).replace(/\\? /g, '\\s*');

  function lies(text, Pflege) {
    const t = norm(text);
    const stufen = {}, gefunden = [], fehlend = [];
    for (const k of Pflege.KRITERIEN) {
      const re = new RegExp(muster(k.name));
      const m = re.exec(t);
      if (!m) { fehlend.push(k.id); continue; }
      const nach = t.slice(m.index + m[0].length, m.index + m[0].length + 160);
      // längste Stufenbezeichnung zuerst (sonst passt „selbständig“ auch in „überwiegend selbständig“)
      const sk = Pflege.SKALA[k.s].stufen.map((s, i) => ({ s: norm(s).replace(/\s*\(.*?\)\s*/g, ' ').trim(), i })).sort((a, b) => b.s.length - a.s.length);
      let best = null;
      for (const x of sk) {
        const p = nach.indexOf(x.s);
        if (p >= 0 && (best == null || p < best.p || (p === best.p && x.s.length > best.len))) best = { p, i: x.i, len: x.s.length };
      }
      // Kurzformen in Gutachten: „überw. selbständig“, „überw. unselbständig“
      if (k.s === 'sel') {
        const kurz = [[/überw\.?\s*unselbst/, 2], [/überw\.?\s*selbst/, 1], [/\bunselbst/, 3], [/\bselbst/, 0]];
        for (const [r, i] of kurz) { const mm = r.exec(nach); if (mm && (best == null || mm.index < best.p)) best = { p: mm.index, i, len: mm[0].length }; }
      }
      if (best) { stufen[k.id] = best.i; gefunden.push(k.id); } else fehlend.push(k.id);
    }
    // Feststellungen zur Inkontinenz und Pflegegrad aus dem Bescheid. Die Namen der Kriterien 4.11/4.12 enthalten selbst „Harninkontinenz“,
    // „Dauerkatheter“, „Stoma“ und werden deshalb vorher entfernt; gezählt wird nur eine ausdrückliche Feststellung.
    let rest = t;
    for (const k of Pflege.KRITERIEN) rest = rest.replace(new RegExp(muster(k.name), 'g'), ' ');
    const inkontinenz = { harn: /harn\w*\s*:?\s*(?:ist\s*)?(?:überwiegend|vollständig)\s*inkontinent|(?:überwiegend|vollständig)\s*harninkontinent|(?:überwiegend|vollständig)\s*inkontinent[^.]{0,30}\bharn|\burostoma\b[^.]{0,20}\b(?:vorhanden|angelegt)|dauerkatheter[^.]{0,20}\b(?:vorhanden|liegt|angelegt)/.test(rest),
      stuhl: /stuhl\w*\s*:?\s*(?:ist\s*)?(?:überwiegend|vollständig)\s*inkontinent|(?:überwiegend|vollständig)\s*stuhlinkontinent|(?:überwiegend|vollständig)\s*inkontinent[^.]{0,30}\bstuhl|\b(?:colo|ileo)?stoma\b[^.]{0,20}\b(?:vorhanden|angelegt)/.test(rest) };
    const pg = /pflegegrad\s*([1-5])\b/.exec(t);
    return { stufen, gefunden, fehlend, inkontinenz, pgBescheid: pg ? +pg[1] : null };
  }
  return { lies, norm };
})();
if (typeof module !== 'undefined') module.exports = PflegeImport;
