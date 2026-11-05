// PLZ -> Bundesland und Mietenstufe. Läuft in der App (offline, Daten sind fest eingebaut) und in Node (Tests).
// Daten: content/plz-data.json, erzeugt von tools/build-plz-data.js (Mietenstufen: Anlage WoGV; PLZ -> Ort/Kreis: GeoNames).
const Plz = (function () {
  var D = null;
  function init(data) { D = data && data.plz ? data : null; return !!D; }
  function available() { return !!D; }
  function stufeLabel(s) { return s; }
  function short(name) { return String(name).split(',')[0]; }

  // Ergebnis für eine PLZ:
  //  null                       PLZ unbekannt oder keine 5 Ziffern
  //  { plz, bl, states, candidates: [{label, kreis, ags, stufe|null}], alternatives: [{label, kreis, stufe}], stufe, sure, ags }
  //  ags: amtlicher Kreisschlüssel (nur Bayern), wenn alle Orte der PLZ im selben Kreis liegen; sonst null
  //  candidates: Orte dieser PLZ. sure = true: alle haben dieselbe Mietenstufe, die App setzt sie selbst.
  //  Sonst fragt die App nach dem Wohnort. alternatives: größere Gemeinden desselben Kreises mit anderer Stufe, falls der Ort ein Ortsteil sein könnte (optionale Auswahl).
  function lookup(plz) {
    if (!D) return null;
    var p = String(plz == null ? '' : plz).replace(/\s/g, '');
    if (!/^\d{5}$/.test(p) || !D.plz[p]) return null;
    var seen = {}, cands = [], alts = [], seenAlt = {}, states = [];
    function add(label, kreis, stufe, ags) {
      var key = label + '|' + kreis + '|' + stufe;
      if (seen[key]) return; seen[key] = 1;
      cands.push({ label: label, kreis: kreis, ags: ags || null, stufe: stufe || null });
    }
    D.plz[p].forEach(function (e) {
      var bl = D.bl[e[4]]; if (states.indexOf(bl) < 0) states.push(bl);
      var k = e[1] >= 0 ? D.kreise[e[1]] : null;
      add(e[0], k ? k.n : '', e[2], k ? k.ags : null);
      // Ort steht nicht einzeln in der Verordnung (kann Ortsteil einer größeren Gemeinde sein): Gemeinden des Kreises mit anderer Stufe als Alternativen
      if (!e[3] && k) k.g.forEach(function (g) {
        var key = short(g[0]) + '|' + g[1];
        if (g[1] !== e[2] && !seenAlt[key]) { seenAlt[key] = 1; alts.push({ label: short(g[0]), kreis: k.n, stufe: g[1] }); }
      });
    });
    var stufen = [];
    cands.forEach(function (c) { if (stufen.indexOf(c.stufe) < 0) stufen.push(c.stufe); });
    var sure = stufen.length === 1 && stufen[0] !== null;
    var agsAll = []; cands.forEach(function (c) { if (agsAll.indexOf(c.ags) < 0) agsAll.push(c.ags); });
    return { plz: p, bl: states.length === 1 ? states[0] : '', states: states, candidates: cands, alternatives: alts, stufe: sure ? stufen[0] : null, sure: sure, ags: agsAll.length === 1 ? agsAll[0] : null };
  }
  function blName(code) { if (!D) return ''; var i = D.bl.indexOf(code); return i >= 0 ? D.blNamen[i] : ''; }
  function blList() { return D ? D.bl.map(function (c, i) { return [c, D.blNamen[i]]; }) : []; }
  function info() { return D ? D.stand : null; }
  return { init: init, available: available, lookup: lookup, blName: blName, blList: blList, info: info };
})();
if (typeof module !== 'undefined') module.exports = Plz;
