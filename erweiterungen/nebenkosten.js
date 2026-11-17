// Nebenkosten-Check (Betriebskostenabrechnung) – Erweiterung, nicht Teil der App 1.2.0
// Prüft eine Betriebskostenabrechnung nach festen Regeln. Ob ein Betrag „zu hoch“ ist (Wirtschaftlichkeitsgebot), entscheidet SoLo nicht.
// Rechtsgrundlagen: § 556 Abs. 3 BGB (Abrechnungszeitraum, Abrechnungsfrist, Einwendungsfrist), § 556a BGB (Umlage nach Fläche),
// § 2 BetrKV (umlagefähige Kosten), § 1 Abs. 2 BetrKV (Verwaltung, Instandhaltung nicht umlagefähig), §§ 7, 12 HeizkostenV,
// CO2KostAufG (Aufteilung der CO2-Kosten), § 22 SGB II / § 35 SGB XII (Nachzahlung als Bedarf für Unterkunft).
const Nebenkosten = (function () {
  'use strict';
  // Umlagefähige Betriebskosten nach § 2 BetrKV; muster: Stichworte in der Bezeichnung (klein geschrieben)
  const ARTEN = [
    { nr: 1, name: 'Grundsteuer', muster: ['grundsteuer', 'öffentliche last'] },
    { nr: 2, name: 'Wasserversorgung', muster: ['wasser', 'frischwasser', 'kaltwasser', 'wasserzähler', 'eichung'], verbrauch: true },
    { nr: 3, name: 'Entwässerung', muster: ['abwasser', 'entwässerung', 'kanal', 'niederschlag', 'schmutzwasser', 'regenwasser'], verbrauch: true },
    { nr: 4, name: 'Heizung', muster: ['heizung', 'heizkosten', 'brennstoff', 'heizöl', 'fernwärme', 'gas', 'wärme'], verbrauch: true, heiz: true },
    { nr: 5, name: 'Warmwasser', muster: ['warmwasser'], verbrauch: true, heiz: true },
    { nr: 7, name: 'Aufzug', muster: ['aufzug', 'fahrstuhl', 'lift'] },
    { nr: 8, name: 'Straßenreinigung und Müllbeseitigung', muster: ['müll', 'abfall', 'straßenreinigung', 'winterdienst', 'schneeräum', 'restmüll', 'biomüll', 'papiertonne'] },
    { nr: 9, name: 'Gebäudereinigung und Ungezieferbekämpfung', muster: ['treppenhaus', 'hausreinigung', 'gebäudereinigung', 'reinigung', 'ungeziefer', 'schädling'] },
    { nr: 10, name: 'Gartenpflege', muster: ['garten', 'grünanlage', 'grünpflege', 'rasen', 'spielplatz'] },
    { nr: 11, name: 'Beleuchtung', muster: ['beleuchtung', 'allgemeinstrom', 'hausstrom', 'strom allgemein'] },
    { nr: 12, name: 'Schornsteinreinigung', muster: ['schornstein', 'kaminkehrer', 'schornsteinfeger', 'emissionsmessung'] },
    { nr: 13, name: 'Sach- und Haftpflichtversicherung', muster: ['gebäudeversicherung', 'wohngebäude', 'haftpflicht', 'feuerversicherung', 'sturm', 'leitungswasser', 'versicherung'] },
    { nr: 14, name: 'Hauswart', muster: ['hauswart', 'hausmeister'] },
    { nr: 15, name: 'Glasfaser-Bereitstellungsentgelt', muster: ['glasfaser', 'bereitstellungsentgelt'] },
    { nr: 16, name: 'Wäschepflege', muster: ['waschküche', 'waschmaschine', 'trockenraum', 'wäsche'] },
    { nr: 17, name: 'Sonstige Betriebskosten', muster: ['sonstige', 'rauchmelder', 'dachrinne', 'feuerlöscher', 'blitzschutz'], sonstige: true }
  ];
  // Reihenfolge der Suche: speziell vor allgemein („Warmwasser“ und „Abwasser“ vor „Wasser“, „Treppenhausbeleuchtung“ vor „Treppenhaus“)
  // Sonstige zuerst: „Dachrinnenreinigung“ ist keine Gebäudereinigung, sondern eine sonstige Betriebsart (nur mit Vereinbarung)
  const REIHENFOLGE = [17, 5, 3, 2, 4, 7, 11, 12, 8, 9, 10, 13, 14, 15, 16, 1];
  // Nicht umlagefähig (vor den Arten geprüft): Stichwort → Begründung
  const NICHT = [
    [['verwaltung', 'hausverwaltung'], 'Verwaltungskosten sind keine Betriebskosten (§ 1 Abs. 2 Nr. 1 BetrKV).'],
    [['reparatur', 'instandhaltung', 'instandsetzung', 'erneuerung', 'austausch', 'sanierung', 'neuanschaffung'], 'Reparaturen und Instandhaltung trägt der Vermieter (§ 1 Abs. 2 Nr. 2 BetrKV).'],
    [['rücklage', 'erhaltungsrücklage', 'instandhaltungsrücklage'], 'Rücklagen sind keine laufenden Betriebskosten (§ 1 Abs. 2 BetrKV).'],
    [['bankgebühr', 'kontoführung', 'kontogebühr', 'porto', 'mahngebühr', 'mahnkosten'], 'Bank-, Porto- und Mahnkosten gehören zur Verwaltung (§ 1 Abs. 2 Nr. 1 BetrKV).'],
    [['leerstand'], 'Kosten für leer stehende Wohnungen trägt der Vermieter.'],
    [['rechtsschutz', 'mietausfall'], 'Rechtsschutz- und Mietausfallversicherungen schützen den Vermieter und sind nicht umlagefähig.'],
    [['notdienst'], 'Eine Notdienstpauschale des Hausmeisters ist nicht umlagefähig (BGH, Urteil vom 18.12.2019, VIII ZR 62/19).'],
    [['kabel', 'kabelfernsehen', 'kabelanschluss', 'antenne', 'tv-gebühr', 'fernseh'], 'Kabelfernsehen ist seit dem 1.7.2024 nicht mehr über die Nebenkosten umlagefähig (Ende des Nebenkostenprivilegs, § 2 Nr. 15 BetrKV neue Fassung).']
  ];
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  // Einordnung eines Postens nach seiner Bezeichnung: { status: 'ok'|'nicht'|'pruefen'|'unbekannt', art, grund }
  function einordnen(bez, opts) {
    const t = norm(bez);
    if (!t) return { status: 'unbekannt' };
    // Wartung ist umlagefähig (z. B. Heizung, Aufzug), Reparatur nicht: „Wartung“ schützt vor dem Treffer „Reparatur“ nicht, deshalb Reparatur zuerst
    for (const [w, grund] of NICHT) if (w.some((x) => t.includes(x))) return { status: 'nicht', grund };
    for (const nr of REIHENFOLGE) {
      const a = ARTEN.find((x) => x.nr === nr);
      if (a.muster.some((x) => t.includes(x))) {
        if (a.sonstige) return { status: 'pruefen', art: a, grund: 'Sonstige Betriebskosten sind nur umlagefähig, wenn sie im Mietvertrag einzeln genannt sind (§ 2 Nr. 17 BetrKV). Bitte im Mietvertrag nachsehen.' };
        if (a.nr === 15 && opts && opts.glasfaserJahr > 60) return { status: 'pruefen', art: a, grund: 'Das Bereitstellungsentgelt für Glasfaser ist auf 60 € im Jahr begrenzt (§ 72 TKG).' };
        return { status: 'ok', art: a };
      }
    }
    return { status: 'unbekannt', grund: 'Diese Bezeichnung kennt SoLo nicht. Bitte prüfen, ob sie zu den Betriebskosten nach § 2 BetrKV gehört und im Mietvertrag vereinbart ist.' };
  }

  // Datumshilfen ('JJJJ-MM-TT')
  const letzterTag = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m = 1..12
  // Ablauf des zwölften Monats nach dem Monat des Datums (§ 556 Abs. 3 BGB)
  function zwoelfMonateNach(s) {
    const [y, m] = s.split('-').map(Number);
    const ny = y + 1;
    return `${ny}-${String(m).padStart(2, '0')}-${String(letzterTag(ny, m)).padStart(2, '0')}`;
  }
  function monate(von, bis) {
    const [y1, m1, d1] = von.split('-').map(Number), [y2, m2, d2] = bis.split('-').map(Number);
    let n = (y2 - y1) * 12 + (m2 - m1);
    if (d2 >= d1 - 1 || d2 === letzterTag(y2, m2)) n += 1; // 01.01.–31.12. = 12 Monate
    return n;
  }

  // CO2KostAufG, Stufenmodell für Wohngebäude: kg CO2 je m² Wohnfläche und Jahr → Anteil des Vermieters
  const CO2_STUFEN = [[12, 0], [17, 0.1], [22, 0.2], [27, 0.3], [32, 0.4], [37, 0.5], [42, 0.6], [47, 0.7], [52, 0.8], [Infinity, 0.95]];
  function co2Vermieter(kgJeQm) { for (const [bis, anteil] of CO2_STUFEN) if (kgJeQm < bis) return anteil; return 0.95; }

  const z = (x) => (Number.isFinite(+x) ? +x : 0);
  const c2 = (x) => Math.round(x * 100) / 100;

  // a = { von, bis, zugang, posten: [{bez, anteil, gesamt, flaeche (true: nach Wohnfläche verteilt)}], vorauszahlungen,
  //       wohnflaeche, gesamtflaeche, heiz: { verbrauchProzent, anteil }, co2: { kosten, kgJeQm, vermieterAbgezogen }, heute }
  function pruefe(a) {
    const befunde = [], hinweise = [];
    // 1. Zeitraum und Fristen
    let fristen = null;
    if (a.von && a.bis) {
      const m = monate(a.von, a.bis);
      if (m > 12) befunde.push({ art: 'zeitraum', schwere: 'fehler', text: `Der Abrechnungszeitraum umfasst ${m} Monate. Erlaubt sind höchstens 12 Monate (§ 556 Abs. 3 Satz 1 BGB).` });
      const abrechnungBis = zwoelfMonateNach(a.bis);
      fristen = { abrechnungBis };
      if (a.zugang) {
        fristen.einwendungBis = zwoelfMonateNach(a.zugang);
        if (a.zugang > abrechnungBis) {
          fristen.zuSpaet = true;
          befunde.push({ art: 'frist', schwere: 'fehler', text: `Die Abrechnung kam am ${de(a.zugang)}, die Frist endete am ${de(abrechnungBis)}. Eine Nachzahlung kann der Vermieter dann in der Regel nicht mehr verlangen (§ 556 Abs. 3 Satz 3 BGB). Ein Guthaben muss er trotzdem auszahlen.` });
        }
      }
    }
    // 2. Posten einordnen und Anteil nach Wohnfläche nachrechnen
    const posten = (a.posten || []).filter((p) => p && (p.bez || z(p.anteil))).map((p) => {
      const e = einordnen(p.bez, { glasfaserJahr: z(p.anteil) });
      const o = { bez: p.bez, anteil: c2(z(p.anteil)), status: e.status, art: e.art ? e.art.name : null, grund: e.grund || null };
      if (p.flaeche && z(p.gesamt) > 0 && z(a.wohnflaeche) > 0 && z(a.gesamtflaeche) > 0) {
        o.soll = c2(z(p.gesamt) * z(a.wohnflaeche) / z(a.gesamtflaeche));
        if (o.anteil - o.soll > 1) { o.rechenfehler = c2(o.anteil - o.soll); befunde.push({ art: 'rechnung', schwere: 'fehler', text: `${p.bez}: Nach Wohnfläche (${zahl(a.wohnflaeche)} von ${zahl(a.gesamtflaeche)} m²) ergibt sich ein Anteil von ${eur(o.soll)}, berechnet sind ${eur(o.anteil)}.`, betrag: o.rechenfehler }); }
      }
      if (e.status === 'nicht') befunde.push({ art: 'nicht', schwere: 'fehler', text: `${p.bez} (${eur(o.anteil)}): ${e.grund}`, betrag: o.anteil });
      else if (e.status === 'pruefen' || e.status === 'unbekannt') befunde.push({ art: 'pruefen', schwere: 'pruefen', text: `${p.bez || 'Posten ohne Bezeichnung'} (${eur(o.anteil)}): ${e.grund}`, betrag: o.anteil });
      return o;
    });
    // 3. Heizkosten (HeizkostenV)
    const h = a.heiz || {};
    let heizKuerzung = 0;
    if (h.verbrauchProzent != null && h.verbrauchProzent !== '') {
      const v = z(h.verbrauchProzent);
      if (v === 0) {
        heizKuerzung = c2(0.15 * z(h.anteil));
        befunde.push({ art: 'heiz', schwere: 'fehler', text: `Die Heizkosten sind nicht nach Verbrauch abgerechnet. Dann darf der Heizkostenanteil um 15 % gekürzt werden (§ 12 Abs. 1 HeizkostenV), hier ${eur(heizKuerzung)}.`, betrag: heizKuerzung });
      } else if (v < 50 || v > 70) befunde.push({ art: 'heiz', schwere: 'fehler', text: `Nach Verbrauch abgerechnet sind ${zahl(v)} %. Vorgeschrieben sind 50 bis 70 % (§ 7 Abs. 1 HeizkostenV). Die Heizkosten müssen neu berechnet werden.` });
    }
    // 4. CO2-Kosten
    const c = a.co2 || {};
    let co2Fehlt = 0;
    if (z(c.kosten) > 0 && c.kgJeQm != null && c.kgJeQm !== '') {
      const anteil = co2Vermieter(z(c.kgJeQm)), soll = c2(z(c.kosten) * anteil);
      if (anteil > 0 && !c.vermieterAbgezogen) { co2Fehlt = soll; befunde.push({ art: 'co2', schwere: 'fehler', text: `Bei ${zahl(c.kgJeQm)} kg CO₂ je m² und Jahr trägt der Vermieter ${Math.round(anteil * 100)} % der CO₂-Kosten (CO2KostAufG), hier ${eur(soll)}. Dieser Anteil ist nicht abgezogen.`, betrag: soll }); }
    } else if (a.co2Fehlt) befunde.push({ art: 'co2', schwere: 'pruefen', text: 'Die Abrechnung nennt die CO₂-Kosten und ihre Aufteilung nicht. Dann darf der Heizkostenanteil um 3 % gekürzt werden (§ 7 Abs. 4 CO2KostAufG).' });
    // 5. Ergebnis
    const summe = c2(posten.reduce((s, p) => s + p.anteil, 0));
    const strittig = c2(posten.filter((p) => p.status === 'nicht').reduce((s, p) => s + p.anteil, 0) + posten.reduce((s, p) => s + (p.rechenfehler || 0), 0) + heizKuerzung + co2Fehlt);
    const voraus = c2(z(a.vorauszahlungen));
    const ergebnis = c2(summe - voraus); // > 0 Nachzahlung, < 0 Guthaben
    const korrigiert = c2(summe - strittig - voraus);
    if (fristen && fristen.zuSpaet && ergebnis > 0) hinweise.push('Wegen der verspäteten Abrechnung entfällt die Nachzahlung voraussichtlich ganz.');
    return { posten, befunde, hinweise, fristen, summe, vorauszahlungen: voraus, ergebnis, strittig, korrigiert,
      grenzen: 'Nicht geprüft: ob einzelne Beträge zu hoch sind (Wirtschaftlichkeitsgebot), was im Mietvertrag vereinbart ist, Verbrauchswerte von Wasser und Heizung, andere Verteilerschlüssel als die Wohnfläche. Belege kann man beim Vermieter einsehen (§ 259 BGB).' };
  }

  // Schreiben an den Vermieter
  function einwendungen(w, res) {
    const a = w.absender || {}, v = w.vermieter || {};
    const zl = [];
    zl.push([a.name, a.strasse, a.ort].filter(Boolean).join('\n') || '[Name, Anschrift]', '', [v.name, v.strasse, v.ort].filter(Boolean).join('\n') || '[Vermieter, Anschrift]', '');
    zl.push(`${a.ort ? a.ort.replace(/^\d{5}\s*/, '') + ', ' : ''}${de(w.heute)}`, '');
    zl.push(`Betriebskostenabrechnung für den Zeitraum ${de(w.von)} bis ${de(w.bis)}${w.wohnung ? ', Wohnung ' + w.wohnung : ''}`, '');
    zl.push('Sehr geehrte Damen und Herren,', '');
    zl.push('gegen die oben genannte Abrechnung erhebe ich folgende Einwendungen (§ 556 Abs. 3 Satz 5 BGB):', '');
    const punkte = res.befunde.filter((b) => b.art !== 'pruefen' || w.pruefenMit);
    punkte.forEach((b, i) => zl.push(`${i + 1}. ${b.text}`, ''));
    if (res.fristen && res.fristen.zuSpaet) zl.push('Eine Nachzahlung schulde ich deshalb nicht.', '');
    zl.push('Ich bitte um Einsicht in die Belege zu dieser Abrechnung (§ 259 BGB) und um eine berichtigte Abrechnung.' + (res.ergebnis > 0 && !(res.fristen && res.fristen.zuSpaet) ? ' Bis zur Klärung zahle ich nur den unstrittigen Teil der Nachforderung.' : ''), '');
    zl.push('Mit freundlichen Grüßen', '', '', '________________________________', a.name || '[Unterschrift]');
    return zl.join('\n');
  }

  // Antrag an Jobcenter oder Sozialamt: Nachzahlung als Bedarf für Unterkunft und Heizung übernehmen
  function antragUebernahme(w, res) {
    const a = w.absender || {}, s = w.stelle || {};
    const sgb = w.leistung === 'gsa' ? '§ 35 SGB XII' : '§ 22 Abs. 1 SGB II';
    const zl = [];
    zl.push([a.name, a.strasse, a.ort].filter(Boolean).join('\n') || '[Name, Anschrift]', '', [s.name, s.strasse, s.ort].filter(Boolean).join('\n') || '[Jobcenter oder Sozialamt, Anschrift]', '');
    zl.push(`${a.ort ? a.ort.replace(/^\d{5}\s*/, '') + ', ' : ''}${de(w.heute)}`, '');
    zl.push('Antrag auf Übernahme einer Nachzahlung aus der Betriebskostenabrechnung');
    if (w.zeichen) zl.push(`${w.leistung === 'gsa' ? 'Aktenzeichen' : 'Nummer der Bedarfsgemeinschaft'}: ${w.zeichen}`);
    zl.push('', 'Sehr geehrte Damen und Herren,', '');
    zl.push(`mein Vermieter fordert aus der Betriebskostenabrechnung für ${de(w.von)} bis ${de(w.bis)} eine Nachzahlung von ${eur(w.betrag != null ? w.betrag : res.ergebnis)}${w.faellig ? `, fällig am ${de(w.faellig)}` : ''}. Ich beantrage, diese Nachzahlung als Bedarf für Unterkunft und Heizung zu übernehmen (${sgb}). Die Abrechnung liegt bei.`, '');
    if (res.befunde.some((b) => b.schwere === 'fehler')) zl.push('Gegen einzelne Posten habe ich beim Vermieter Einwendungen erhoben. Eine Kopie liegt bei. Ich informiere Sie über das Ergebnis.', '');
    zl.push('Bitte bestätigen Sie mir den Eingang dieses Antrags.', '', 'Mit freundlichen Grüßen', '', '', '________________________________', a.name || '[Unterschrift]');
    return zl.join('\n');
  }

  function de(s) { if (!s) return '…'; const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; }
  function zahl(x) { return String(Math.round(+x * 100) / 100).replace('.', ','); }
  function eur(x) { return (Math.round(x * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  return { ARTEN, einordnen, pruefe, einwendungen, antragUebernahme, zwoelfMonateNach, monate, co2Vermieter };
})();
if (typeof module !== 'undefined') module.exports = Nebenkosten;
