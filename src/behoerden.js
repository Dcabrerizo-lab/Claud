// Zuständige Stelle mit Anschrift (Bayern). Läuft in der App (Daten fest eingebaut, offline) und in Node (Tests).
// Daten: content/behoerden-bayern.json, erzeugt von tools/build-behoerden.js (jede Anschrift mit Quelle und Abrufdatum).
// Schlüssel ist der amtliche Kreisschlüssel (z. B. 09572), den src/plz.js aus der Postleitzahl ermittelt.
// Die ersten drei Ziffern sind der Regierungsbezirk (091 Oberbayern ... 097 Schwaben).
const Behoerden = (function () {
  var D = null;
  function init(data) { D = data && data.kreise ? data : null; return !!D; }
  function available() { return !!D; }
  var has = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };

  // Welche Stelle ist für welche Leistung zuständig (Bayern). abt: Fachbereich, wie er im Anschreiben steht.
  //  kreis:   Landratsamt oder kreisfreie Stadt
  //           - Wohngeld (Bayerisches Staatsministerium für Wohnen, Bau und Verkehr)
  //           - Grundsicherung im Alter und bei Erwerbsminderung: örtlicher Träger der Sozialhilfe
  //           - Unterhaltsvorschuss: Jugendamt (in Bayern bei Landkreisen und kreisfreien Städten)
  //           - Bildung und Teilhabe bei Wohngeld oder Kinderzuschlag (§ 6b BKGG)
  //  jobcenter: Grundsicherungsgeld (SGB II), Jobcenter des Wohnorts
  //  zbfs:    Zentrum Bayern Familie und Soziales, Regionalstelle des Regierungsbezirks (Blindengeld, Schwerbehindertenrecht)
  //  bezirk:  Bezirk als überörtlicher Träger der Eingliederungshilfe (Art. 66a AGSG)
  //  fk:      Familienkasse Bayern Nord oder Süd nach Wohnort (§ 13 BKGG, § 72 EStG)
  //  fest:    eine Anschrift für alle (Rundfunkbeitrag)
  var ZUST = {
    wohngeld: { typ: 'kreis', abt: 'Wohngeldstelle' },
    gsa: { typ: 'kreis', abt: 'Sozialamt, Grundsicherung im Alter und bei Erwerbsminderung' },
    uvg: { typ: 'kreis', abt: 'Jugendamt, Unterhaltsvorschussstelle' },
    but: { typ: 'kreis', abt: 'Bildung und Teilhabe' },
    ggeld: { typ: 'jobcenter', abt: '' },
    blindengeld: { typ: 'zbfs', abt: 'Blindengeld' },
    ausweis: { typ: 'zbfs', abt: 'Schwerbehindertenrecht' },
    eingl: { typ: 'bezirk', abt: 'Eingliederungshilfe' },
    arbeit: { typ: 'bezirk', abt: 'Eingliederungshilfe, Budget für Arbeit' },
    kindergeld: { typ: 'fk', abt: '' },
    kiz: { typ: 'fk', abt: 'Kinderzuschlag' },
    kgBeh: { typ: 'fk', abt: '' },
    rundfunk: { typ: 'fest', key: 'beitragsservice' }
  };

  function stelle(e, abt) {
    return e ? { name: e.name, abt: abt || e.abt || '', anschrift: e.anschrift || null, web: e.web || '', quelle: e.quelle || '', stand: e.stand || '' } : null;
  }

  // Ergebnis: { name, abt, anschrift: [Zeilen] | null, web, quelle, stand } oder null (keine Angabe, unbekannter Ort oder nicht Bayern)
  function fuer(id, ags) {
    if (!D || !has(ZUST, id)) return null;
    var z = ZUST[id];
    if (z.typ === 'fest') return stelle(D.fest && D.fest[z.key], '');
    if (!ags || !has(D.kreise, ags)) return null;
    var rb = String(ags).slice(0, 3);
    if (z.typ === 'kreis') return stelle(D.kreise[ags], z.abt);
    if (z.typ === 'jobcenter') return has(D.jobcenter, ags) ? stelle(D.jobcenter[ags], z.abt) : null;
    if (z.typ === 'zbfs') return has(D.zbfs, rb) ? stelle(D.zbfs[rb], z.abt) : null;
    if (z.typ === 'bezirk') return has(D.bezirke, rb) ? stelle(D.bezirke[rb], z.abt) : null;
    if (z.typ === 'fk') { var fk = D.fkZuordnung && D.fkZuordnung[ags]; return fk && has(D.familienkasse, fk) ? stelle(D.familienkasse[fk], z.abt) : null; }
    return null;
  }
  // Braucht die Leistung den Wohnort (Kreis), um eine Stelle zu nennen?
  function brauchtKreis(id) { return has(ZUST, id) && ZUST[id].typ !== 'fest'; }
  function ids() { return Object.keys(ZUST); }
  function info() { return D ? D.stand : null; }
  return { init: init, available: available, fuer: fuer, ids: ids, brauchtKreis: brauchtKreis, info: info };
})();
if (typeof module !== 'undefined') module.exports = Behoerden;
