// Zuständige Stelle mit Anschrift (Bayern). Läuft in der App (Daten fest eingebaut, offline) und in Node (Tests).
// Daten: content/behoerden-bayern.json (Anschriften aus den Impressum-Seiten der Behörden, je mit Quelle und Abrufdatum).
// Schlüssel ist der amtliche Kreisschlüssel, den src/plz.js aus der Postleitzahl ermittelt.
const Behoerden = (function () {
  var D = null;
  function init(data) { D = data && data.kreise ? data : null; return !!D; }
  function available() { return !!D; }

  // Welche Stelle ist für welche Leistung zuständig (Bayern). abt: Fachbereich, wie er im Anschreiben steht.
  //  - Wohngeld: Landratsamt oder kreisfreie Stadt (Bayerisches Staatsministerium für Wohnen, Bau und Verkehr)
  //  - Grundsicherung im Alter und bei Erwerbsminderung: örtlicher Träger der Sozialhilfe = Landkreis oder kreisfreie Stadt
  //  - Unterhaltsvorschuss: Jugendamt; in Bayern sind das die Landkreise und kreisfreien Städte
  //  - Bildung und Teilhabe bei Wohngeld oder Kinderzuschlag: Landkreis oder kreisfreie Stadt (§ 6b BKGG)
  var ZUST = {
    wohngeld: { typ: 'kreis', abt: 'Wohngeldstelle' },
    gsa: { typ: 'kreis', abt: 'Sozialamt, Grundsicherung im Alter und bei Erwerbsminderung' },
    uvg: { typ: 'kreis', abt: 'Jugendamt, Unterhaltsvorschussstelle' },
    but: { typ: 'kreis', abt: 'Bildung und Teilhabe' },
    rundfunk: { typ: 'fest', key: 'beitragsservice' }
  };

  // Ergebnis: { name, abt, anschrift: [Zeilen] | null, web, quelle, stand } oder null (nicht zuständig, unbekannt oder kein Bayern)
  function fuer(id, ags) {
    if (!D) return null;
    var z = ZUST[id];
    if (!z) return null;
    if (z.typ === 'fest') { var f = D.fest && D.fest[z.key]; return f ? { name: f.name, abt: f.abt || '', anschrift: f.anschrift || null, web: f.web || '', quelle: f.quelle || '', stand: f.stand || '' } : null; }
    var k = ags && Object.prototype.hasOwnProperty.call(D.kreise, ags) ? D.kreise[ags] : null;
    if (!k) return null;
    return { name: k.name, abt: z.abt, anschrift: k.anschrift || null, web: k.web || '', quelle: k.quelle || '', stand: k.stand || '' };
  }
  // Leistungen, für die die App eine Stelle nennen kann (Bayern, mit Kreis)
  function ids() { return Object.keys(ZUST); }
  function brauchtKreis(id) { return !!ZUST[id] && ZUST[id].typ === 'kreis'; }
  function info() { return D ? D.stand : null; }
  return { init: init, available: available, fuer: fuer, ids: ids, brauchtKreis: brauchtKreis, info: info };
})();
if (typeof module !== 'undefined') module.exports = Behoerden;
