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
  //           - Wohnberechtigungsschein (wbs): Wohnungsamt der kreisfreien Stadt; Bayern: Landratsamt, aber nur in Landkreisen ohne Große Kreisstadt
  //             oder Große Delegationsgemeinde (D.wbsAusnahme, BayernPortal), sonst keine Anschrift. Andere Länder: nur kreisfreie Städte
  //             (Landkreise ohne Anschrift). Berlin/Hamburg: Bezirksämter, keine Angabe.
  //  jobcenter: Grundsicherungsgeld (SGB II), Jobcenter des Wohnorts
  //  zbfs:    Zentrum Bayern Familie und Soziales, Regionalstelle des Regierungsbezirks (Blindengeld, Schwerbehindertenrecht)
  //  bezirk:  Bezirk als überörtlicher Träger der Eingliederungshilfe (Art. 66a AGSG)
  //  fk:      Familienkasse Bayern Nord oder Süd nach Wohnort (§ 13 BKGG, § 72 EStG)
  //  fest:    eine Anschrift für alle (Rundfunkbeitrag; Bayerisches Landespflegegeld: Landesamt für Pflege, nurBY = nicht für Wohnorte außerhalb Bayerns)
  var ZUST = {
    wohngeld: { typ: 'kreis', abt: 'Wohngeldstelle' },
    gsa: { typ: 'kreis', abt: 'Sozialamt, Grundsicherung im Alter und bei Erwerbsminderung' },
    // Hilfe zum Lebensunterhalt außerhalb von Einrichtungen: örtlicher Träger der Sozialhilfe wie bei der Grundsicherung (§ 97 Abs. 1 SGB XII;
    // in Bayern die Landkreise und kreisfreien Städte als örtliche Träger; in Einrichtungen kann der Bezirk zuständig sein)
    hlu: { typ: 'kreis', abt: 'Sozialamt, Hilfe zum Lebensunterhalt' },
    uvg: { typ: 'kreis', abt: 'Jugendamt, Unterhaltsvorschussstelle' },
    but: { typ: 'kreis', abt: 'Bildung und Teilhabe' },
    wbs: { typ: 'kreis', abt: 'Wohnungsamt', wbs: true },
    ggeld: { typ: 'jobcenter', abt: '' },
    blindengeld: { typ: 'zbfs', abt: 'Blindengeld' },
    ausweis: { typ: 'zbfs', abt: 'Schwerbehindertenrecht' },
    eingl: { typ: 'bezirk', abt: 'Eingliederungshilfe' },
    arbeit: { typ: 'bezirk', abt: 'Eingliederungshilfe, Budget für Arbeit' },
    kindergeld: { typ: 'fk', abt: '' },
    kiz: { typ: 'fk', abt: 'Kinderzuschlag' },
    kgBeh: { typ: 'fk', abt: '' },
    elterngeld: { typ: 'zbfs', abt: 'Elterngeldstelle' },
    hzp: { typ: 'bezirk', abt: 'Hilfe zur Pflege' },
    blh: { typ: 'bezirk', abt: 'Blindenhilfe' },
    asylblg: { typ: 'kreis', abt: 'Leistungen nach dem Asylbewerberleistungsgesetz' },
    rundfunk: { typ: 'fest', key: 'beitragsservice' },
    lpg: { typ: 'fest', key: 'landesamtPflege', nurBY: true }
  };

  function stelle(e, abt) {
    if (!e) return null;
    // anschrift: für Briefe (Postanschrift, wenn vorhanden); haus: Hausanschrift für Besuche, nur wenn sie abweicht
    var haus = e.haus && e.anschrift && e.haus.join('|') !== e.anschrift.join('|') ? e.haus : null;
    return { name: e.name, abt: abt || e.abt || '', anschrift: e.anschrift || null, haus: haus, web: e.web || '', quelle: e.quelle || '', stand: e.stand || '' };
  }

  // Ergebnis: { name, abt, anschrift: [Zeilen] | null, web, quelle, stand } oder null (keine Angabe, unbekannter Ort oder nicht Bayern)
  function fuer(id, ags) {
    if (!D || !has(ZUST, id)) return null;
    var z = ZUST[id];
    if (z.typ === 'fest') return z.nurBY && ags && String(ags).slice(0, 2) !== '09' ? null : stelle(D.fest && D.fest[z.key], '');
    // Jobcenter außerhalb Bayerns: nur einzeln belegte Fälle (D.jobcenterDE), sonst keine Angabe
    if (z.typ === 'jobcenter' && ags && !has(D.kreise, ags)) return D.jobcenterDE && has(D.jobcenterDE, ags) ? stelle(D.jobcenterDE[ags], z.abt) : null;
    // Familienkasse außerhalb Bayerns: nur Länder mit genau einer Familienkasse (D.fkLand, Quelle arbeitsagentur.de); sonst keine Angabe
    if (z.typ === 'fk' && ags && !has(D.kreise, ags)) {
      var fl = D.fkLand && D.fkLand[String(ags).slice(0, 2)];
      return fl && D.familienkasseDE && has(D.familienkasseDE, fl) ? stelle(D.familienkasseDE[fl], z.abt) : null;
    }
    // Außerhalb Bayerns (Daten „de“): kreisfreie Städte für alle Leistungen der Kreisebene, Landkreise für die Grundsicherung
    // im Alter und für Wohngeld. Wohngeld liegt in manchen Ländern bei Städten oder Gemeinden; dann gilt der Antrag beim Kreis
    // trotzdem als gestellt und wird weitergeleitet (§ 16 Abs. 2 SGB I) – daher Anschrift des Kreises mit Hinweis (weiter).
    // Jugendamt (Unterhaltsvorschuss) und Bildung und Teilhabe bleiben ohne Anschrift (teils eigene Ämter großer Städte).
    if (ags && !has(D.kreise, ags) && D.de && has(D.de.kreise, ags)) {
      var e = D.de.kreise[ags];
      if (z.typ !== 'kreis' || (e.typ !== 'stadt' && id !== 'gsa' && id !== 'hlu' && id !== 'wohngeld')) return null;
      // Anschrift nur aus amtlicher Quelle (Impressum der Behörde). Aus Wikipedia übernommene Anschriften zeigt die App nicht (Projektregel: jede
      // Anschrift braucht eine amtliche Quelle; Prüfung Richtigkeit 21.11.2026) – dann nur Name und Website der Behörde (beh.ohneAdr).
      // Am 21.11.2026 wurden die 60 früheren Wikipedia-Anschriften gegen die Website der Behörde geprüft: 47 mit Impressum/Kontaktseite als
      // Quelle (bestätigt oder korrigiert), 13 weiter ohne Anschrift (Website nicht abrufbar). Liste: docs/PRUEFLISTE.md, Zeile beh-de.
      // Großkunden-PLZ oder Postfach (z. B. „48127 Münster“) erscheinen so, wie die Behörde sie als Postanschrift nennt (auch einzeilig).
      var amtlich = e.quelleArt === 'impressum';
      return { name: e.name, abt: z.abt, anschrift: amtlich && e.anschrift || null, haus: null, web: e.web || '', quelle: amtlich ? e.quelle || '' : 'Wikidata', quelleArt: amtlich ? 'impressum' : '', stand: amtlich ? e.stand || '' : '',
        weiter: id === 'wohngeld' && e.typ !== 'stadt' };
    }
    if (!ags || !has(D.kreise, ags)) return null;
    var rb = String(ags).slice(0, 3);
    if (z.wbs && Number(String(ags).slice(3)) > 70) {
      // Landkreis (Kreisschlüssel ab 71): Landratsamt nur, wenn die Liste der Ausnahmen vorliegt und der Kreis nicht darin steht
      return D.wbsAusnahme && D.wbsAusnahme.kreise && !has(D.wbsAusnahme.kreise, ags) ? stelle(D.kreise[ags], 'Wohnberechtigungsschein') : null;
    }
    if (z.typ === 'kreis') return stelle(D.kreise[ags], z.abt);
    if (z.typ === 'jobcenter') return has(D.jobcenter, ags) ? stelle(D.jobcenter[ags], z.abt) : null;
    if (z.typ === 'zbfs') return has(D.zbfs, rb) ? stelle(D.zbfs[rb], z.abt) : null;
    if (z.typ === 'bezirk') return has(D.bezirke, rb) ? stelle(D.bezirke[rb], z.abt) : null;
    if (z.typ === 'fk') { var fk = D.fkZuordnung && D.fkZuordnung[ags]; return fk && has(D.familienkasse, fk) ? stelle(D.familienkasse[fk], z.abt) : null; }
    return null;
  }
  // Hinweis statt Anschrift, wenn die Quelle keine eindeutige Stelle nennt: { key, p } oder null
  function hinweis(id, ags) {
    if (!D || !has(ZUST, id) || ZUST[id].typ !== 'fk' || !ags) return null;
    if ((D.fkUnklar || []).indexOf(ags) < 0) return null;
    var n = D.familienkasse || {};
    return { key: 'beh.fkUnklar', p: { nord: n.nord ? n.nord.anschrift.join(', ') : '', sued: n.sued ? n.sued.anschrift.join(', ') : '', tel: D.fkTelefon || '' } };
  }
  // Braucht die Leistung den Wohnort (Kreis), um eine Stelle zu nennen?
  function brauchtKreis(id) { return has(ZUST, id) && ZUST[id].typ !== 'fest'; }
  function ids() { return Object.keys(ZUST); }
  function info() { return D ? D.stand : null; }
  return { init: init, available: available, fuer: fuer, hinweis: hinweis, ids: ids, brauchtKreis: brauchtKreis, info: info };
})();
if (typeof module !== 'undefined') module.exports = Behoerden;
