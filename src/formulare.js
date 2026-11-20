// Ausfüllhilfe für die amtlichen Formulare (Jobcenter: Hauptantrag und Anlagen; Familienkasse: Kinderzuschlag; Wohngeld).
// Wählt die Formulare, die zu den Angaben passen (nach dem Anforderungskatalog des Jobcenters), und füllt vor, was SoLo weiß.
// Alles andere bleibt leer. Ja/Nein-Fragen werden als 'ja'/'nein' angegeben; welcher Wert im PDF „Ja“ bedeutet, steht im
// geprüften Katalog content/formulare/katalog.json (tools/formulare-pruefen.py) und wird beim Füllen nachgeschlagen.
// Läuft in der App und in Node (Tests). Keine Abhängigkeiten.
const Formulare = (function () {
  const ok = (r) => !!r && (r.level === 'ja' || r.level === 'vielleicht' || r.level === 'na');
  const n = (v) => { const x = Number(String(v == null ? '' : v).replace(',', '.')); return isFinite(x) && x > 0 ? x : 0; };
  const geld = (v) => String(Math.round(n(v)));

  // „Maria Muster“ -> Vorname „Maria“, Nachname „Muster“; „Muster, Maria“ -> ebenso
  function teileName(s) {
    const t = String(s || '').trim().replace(/\s+/g, ' ');
    if (!t) return { vor: '', nach: '' };
    if (t.indexOf(',') > 0) { const [a, b] = t.split(','); return { vor: b.trim(), nach: a.trim() }; }
    const w = t.split(' ');
    return w.length === 1 ? { vor: '', nach: w[0] } : { vor: w.slice(0, -1).join(' '), nach: w[w.length - 1] };
  }
  // „Hauptstr. 1a“ -> Straße „Hauptstr.“, Hausnummer „1a“
  function teileStrasse(s) {
    const t = String(s || '').trim().replace(/\s+/g, ' ');
    const m = t.match(/^(.*\S)\s+(\d+\s?[a-zA-Z]?(?:\s?[-–/]\s?\d+\s?[a-zA-Z]?)?)$/);
    return m ? { str: m[1], nr: m[2].replace(/\s/g, '') } : { str: t, nr: '' };
  }
  // „91054 Erlangen“ -> PLZ und Ort
  function teileOrt(s) {
    const t = String(s || '').trim().replace(/\s+/g, ' ');
    const m = t.match(/^(\d{5})\s+(.+)$/);
    return m ? { plz: m[1], ort: m[2] } : { plz: '', ort: t };
  }

  // Kopf der Jobcenter-Formulare (antragstellende Person) und Abschnitt B (Person, für die die Anlage ist)
  function kopf(p, praefix) {
    const nm = teileName(p.name), v = {};
    const a = praefix || 'txtfPerson', d = praefix === 'txtfAnlPerson' ? 'dateAnlPersonGebDatum' : 'datePersonGebDatum';
    if (nm.vor) v[a + 'Vorname'] = nm.vor;
    if (nm.nach) v[a + 'Nachname'] = nm.nach;
    if (p.geb) v[d] = String(p.geb).trim();
    return v;
  }
  function selbe(p, praefix) {
    const nm = teileName(p.name), v = {};
    const a = praefix || 'txtfBG', d = praefix === 'txtfAnlBG' ? 'dateAnlBGGebDatum' : 'dateBGGebDatum';
    if (nm.vor) v[a + 'Vorname'] = nm.vor;
    if (nm.nach) v[a + 'Nachname'] = nm.nach;
    if (p.geb) v[d] = String(p.geb).trim();
    return v;
  }
  function anschrift(p) {
    const s = teileStrasse(p.strasse), o = teileOrt(p.ort), v = {};
    if (s.str) v.txtfPersonStr = s.str;
    if (s.nr) v.txtfPersonHausNr = s.nr;
    if (o.plz) v.txtfPersonPlz = o.plz;
    if (o.ort) v.txtfPersonOrt = o.ort;
    return v;
  }

  // Einkommensarten der antragstellenden Person (erste Person mit ihrem zweiten Einkommen)
  // (Einkommensliste: Einträge der zweiten Person, p = 2, gehören nicht dazu)
  function arten(s) {
    if (Array.isArray(s.einkommen)) return s.einkommen.filter((e) => e && Number(e.p) !== 2).map((e) => e.art).filter(Boolean);
    return [s.ek1Art || s.art1, s.ek1bArt || ''].filter(Boolean);
  }
  const istSelbst = (s) => arten(s).indexOf('selbst') >= 0 || s.ek2Art === 'selbst';

  // Die Formulare für die Angaben. s: Angaben (state), p: Person (Antragsmappe), results: Ergebnis der Regeln
  function plan(s, p, results) {
    s = s || {}; p = p || {};
    const R = (id) => (results || []).find((x) => x.id === id);
    const liste = [];
    const leer = (id, datei, titel, warum, hilfe) => { liste.push({ id, datei, titel, warum, werte: {}, art: 'leer', hilfe: hilfe || null }); };
    const hinweis = (id, titel, warum, hilfe) => { liste.push({ id, datei: '', titel, warum, werte: {}, art: 'hinweis', hilfe: hilfe || null }); };
    const link = (id, titel, warum, url, hilfe) => { liste.push({ id, datei: '', titel, warum, werte: {}, art: 'link', url, hilfe: hilfe || null }); };
    const FK = 'https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder';
    const add = (id, datei, titel, warum, werte, art) => liste.push({ id, datei, titel, warum, werte: werte || {}, art: art || 'fuellen' });
    const a = arten(s), kids = s.kids | 0, young = s.young | 0, erw = s.adults === 2 ? 2 : 1;
    const miete = n(s.miete), eigen = s.wohnart === 'eigentum';
    const allein = erw === 1 && kids > 0;
    const selbst = istSelbst(s);
    const k = kopf(p);

    // Grundsicherungsgeld (Jobcenter): keine mitgelieferten Vordrucke mehr, sondern die amtliche Formularseite der Bundesagentur.
    // Die Ausfüllhilfe nennt die Anlagen, die nach den Angaben gebraucht werden.
    if (ok(R('ggeld'))) {
      const anl = ['Hauptantrag (HA)', 'Anlage EK: Einkommen, für jede Person ab 15 Jahren eine eigene'];
      if (miete > 0 || eigen) anl.push('Anlage KDU: Kosten für Unterkunft und Heizung' + (miete > 0 ? ' (laut SoLo zusammen ' + geld(miete) + ' € im Monat: nach Grundmiete, Nebenkosten und Heizkosten aufteilen)' : ''));
      anl.push('Anlage VM: Vermögen (Konten, Auto, Immobilien)');
      if (erw === 2) anl.push('Anlage WEP und eine eigene Anlage EK für die Partnerin oder den Partner; Anlage VE nur, wenn ihr nicht verheiratet seid');
      if (young > 0) anl.push('Anlage WEP für jedes Kind ab 15 Jahren');
      if (kids > 0) anl.push('Anlage KI für jedes Kind unter 15 Jahren');
      if (allein) anl.push('Anlage UH3: Unterhalt für die Kinder vom anderen Elternteil, je Kind eine');
      if (s.schwanger && erw === 1) anl.push('Anlage UH2: Schwangerschaft, wenn du nicht verheiratet bist');
      if (s.ernaehrung) anl.push('Anlage MEB: Mehrbedarf für Ernährung (Seite 3 und 4 füllt die Ärztin oder der Arzt aus)');
      if (s.hhAndere === 'verwandte') anl.push('Anlage HG: Verwandte in derselben Wohnung');
      if (selbst) anl.push('Anlage EKS (Einnahmen und Ausgaben) und Anlage SV (Kranken- und Pflegeversicherung) für die Selbstständigkeit');
      if (a.indexOf('lohn') >= 0) anl.push('Einkommensbescheinigung: füllt der Arbeitgeber aus');
      if (miete > 0 && !eigen) anl.push('Mietbescheinigung: füllt die Vermieterin oder der Vermieter aus, wenn kein Mietvertrag vorliegt');
      anl.push('Der Antrag ist an keine Form gebunden: online (am einfachsten), persönlich, telefonisch oder schriftlich. Das Geld gibt es ab dem Ersten des Monats, in dem der Antrag eingeht');
      link('ggeld', 'Antrag auf Grundsicherungsgeld (Hauptantrag und Anlagen)', 'Beim Jobcenter; online über die Online-Services der Bundesagentur oder mit den Vordrucken zum Herunterladen',
        'https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/downloads-arbeitslos-arbeit-finden', anl);
    }
    // Kinderzuschlag (Familienkasse): Vordrucke sind vom Herausgeber geschützt und ändern sich oft. Link auf die amtliche Formularseite.
    if (ok(R('kiz')) && !(s.bezug || {}).kiz) link('kiz', 'Antrag auf Kinderzuschlag (KiZ 1)', 'Bei der Familienkasse; am einfachsten online (mit BundID ganz ohne Papier)', FK + '/formulare-kinderzuschlag', [
      'Zum Antrag gehören: je Kind die „Anlage Kind“ (KiZ 1-AnK) und die „Anlage zur antragstellenden Person und Partner“ (KiZ 1-AnA)',
      'Einkommensnachweise der letzten 6 Monate (Lohnabrechnungen), Mietvertrag und Nebenkostenabrechnung, Kindergeld- und Unterhaltsnachweise',
      'Kinderzuschlag gibt es erst ab dem Monat des Antrags und jeweils für 6 Monate: früh stellen',
      'Vorher prüfen geht mit dem KiZ-Lotsen der Familienkasse']);
    // Wohngeld: jedes Land hat eigene Vordrucke; Bayern verlinkt, sonst Hinweis auf die Wohngeldstelle
    if (ok(R('wohngeld')) && !(s.bezug || {}).wohngeld) {
      const wgHilfe = ['Mietvertrag und Mietbescheinigung bzw. Nachweis der Miete, Nebenkosten und Heizkosten',
        'Einkommensnachweise aller Personen im Haushalt (Lohnabrechnungen der letzten 12 Monate, Rentenbescheid, Bescheide über Arbeitslosengeld, Elterngeld usw.)',
        'Personalausweis; bei Kindern Kindergeldbescheid; bei Schwerbehinderung den Ausweis (Freibetrag)',
        'Wohngeld gibt es ab dem Monat des Antrags: früh stellen, Unterlagen können nachgereicht werden'];
      const by = !s.bundesland || s.bundesland === 'BY';
      if (by) link('wg', 'Antrag auf Wohngeld (Mietzuschuss)', 'Bayern: Vordruck des Staatsministeriums oder online über das BayernPortal; abgeben bei der Wohngeldstelle (Landratsamt oder kreisfreie Stadt)', 'https://www.stmb.bayern.de/wohnen/wohnraum_nutzen/wohngeld/index.php', wgHilfe);
      else { add('wg', '', 'Antrag auf Wohngeld (Mietzuschuss)', 'Den Vordruck gibt es bei der Wohngeldstelle deiner Stadt oder deines Landkreises und meist auf deren Internetseite; viele Länder haben einen Online-Antrag', {}, 'hinweis'); liste[liste.length - 1].hilfe = wgHilfe; }
    }
    // Kindergeld (Familienkasse): Vordrucke sind vom Herausgeber geschützt und ändern sich oft. Link auf die amtliche Formularseite.
    const kgOk = ok(R('kindergeld')), kgNa = (R('kindergeld') || {}).level === 'na';
    if (kgOk && !(s.bezug || {}).kindergeld) link('kg1', 'Antrag auf Kindergeld (KG 1)', 'Bei der Familienkasse; online mit BundID ganz ohne Papier', FK + '/formulare-kindergeld', [
      'Zum Antrag gehört für jedes Kind eine „Anlage Kind“ (KG 1-AnK)',
      'Steuerliche Identifikationsnummer von dir und von jedem Kind (steht im Brief vom Bundeszentralamt für Steuern) ist Pflicht',
      'Angaben zur Partnerin oder zum Partner bzw. zum anderen Elternteil im Haushalt, Bankverbindung (IBAN)',
      'Für ein Pflegekind zusätzlich die Erklärung für ein Pflegekind (KG 12a); alle Vordrucke stehen auf derselben Seite'].concat(
      s.aufenthalt === 'eu' ? ['Staatsangehörigkeit eines anderen EU-Landes: zusätzlich die „Anlage EU“ (KG 1-AnEU); wohnt oder arbeitet jemand im Ausland, auch die „Anlage Ausland“ (KG 51)'] : s.aufenthalt ? ['Staatsangehörigkeit außerhalb der EU: Aufenthaltstitel beilegen'] : [],
      ['Kindergeld gibt es rückwirkend nur für 6 Monate: Antrag bald stellen']));
    if ((s.young | 0) > 0 && (kgOk || kgNa)) link('kg18', 'Nachweise für Kinder ab 18', 'Die Familienkasse verlangt ab dem 18. Geburtstag Nachweise; die Vordrucke stehen auf ihrer Seite „Kindergeld ab 18“', FK + '/formulare-kindergeld-ab-18', [
      'Schule: Schulbescheinigung (KG 5a), füllt die Schule aus',
      'Studium: Erklärung zur Hochschulausbildung (KG 7e) mit Immatrikulationsbescheinigung',
      'Ausbildung im Betrieb: Erklärung zum Ausbildungsverhältnis mit Ausbildungsvertrag',
      'Nur falls zutreffend: Kind ohne Ausbildungs- oder Arbeitsplatz (KG 11a, bis 21 arbeitsuchend gemeldet bzw. bis 25 Ausbildungsplatz suchend), Praktikum (KG 10), Ausbildung bei der Bundeswehr (KG 15), erkranktes Kind (KG 9a), Verhältnisse eines volljährigen Kindes (KG 5d, z. B. bei einer zweiten Ausbildung; Arbeit höchstens 20 Stunden in der Woche)']);
    if (ok(R('kgBeh'))) link('kg4', 'Kindergeld für ein erwachsenes Kind mit Behinderung', 'Vordrucke der Familienkasse für erwachsene Kinder mit Behinderung', FK + '/formulare-erwachsene-mit-behinderungen', [
      'Erklärung zu den Verhältnissen eines volljährigen Kindes mit Behinderung (KG 4e) und zum verfügbaren Nettoeinkommen des Kindes (KG 4f)',
      'Ärztlicher Nachweis: das Wort „Behinderung“, seit wann sie besteht und wie sie sich auf die Erwerbsfähigkeit auswirkt (gilt höchstens 1 Jahr); dafür gibt es Vordrucke der Familienkasse',
      'Schwerbehindertenausweis oder Feststellungsbescheid in Kopie'].concat(s.pflegegrad ? ['Mit Pflegegrad: ärztliche Bescheinigung über erforderliche Betreuungsleistungen (zusätzlicher Freibetrag), Pflegegrad-Bescheid'] : [],
      ['Ist das Kind verheiratet: Erklärung zum Nettoeinkommen des Ehepartners (KG 4g)',
       'Lebt das Kind nicht bei dir oder zahlst du keinen Unterhalt: Das Kindergeld kann an das Kind selbst oder an das Sozialamt gehen (Abzweigung, Antrag KG 11e auf der Seite „Kindergeld ab 18“)']));
    // Grundsicherung im Alter und bei Erwerbsminderung (Sozialamt)
    if (ok(R('gsa')) && !(s.bezug || {}).sozialamt) {
      hinweis('gsa', 'Antrag auf Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)', 'Beim Sozialamt der Stadt oder des Landkreises; viele Sozialämter haben einen eigenen Vordruck auf ihrer Internetseite. Der Antrag gilt aber auch formlos, ein Brief reicht', [
        'Angaben zu dir und zu Personen im Haushalt, Wohnkosten (Mietvertrag, Nebenkosten- und Heizkostenabrechnung)',
        'Einkommen: Rentenbescheid, bei Werkstatt Lohnabrechnung; Vermögen mit Kontoauszügen der letzten 3 Monate (geschützt sind 10.000 €)',
        'Bei Erwerbsminderung: Rentenbescheid oder Bescheid über die volle Erwerbsminderung; bei Werkstatt reicht der Nachweis der Werkstatt',
        'Unterhalt von Kindern oder Eltern wird erst ab 100.000 € Jahreseinkommen geprüft',
        'Schwerbehindertenausweis mit Merkzeichen G oder aG: Mehrbedarf, Kopie beilegen']);
    }
    // Wohnberechtigungsschein: SoLo füllt nichts aus. Es gibt den leeren Landesvordruck mit Ausfüllhilfe, sonst die Fundstelle.
    if (ok(R('wbs'))) {
      const bl = s.bundesland || '';
      // Nur geprüfte amtliche Seiten (Abruf 16.11.2026); wo es keine Landesseite gibt oder sie nicht prüfbar ist: Hinweis, wo es den Antrag gibt
      const WBSLINK = { BY: ['https://www.stmb.bayern.de/wohnen/wohnraum_nutzen/gefoerderte_wohnung_mieten/index.php', 'Bayern: Vordruck WBS I des Staatsministeriums (rechts unter „Formulare“) oder Onlineantrag; in München gilt ein eigenes Verfahren (SOWON)'],
        HH: ['https://www.hamburg.de/service/info/11268748/n0/', 'Hamburg: Antrag beim Bezirksamt, auch online'],
        BW: ['https://mlw.baden-wuerttemberg.de/de/bauen-wohnen/wohnungsbau/wohnberechtigung', 'Baden-Württemberg: Informationen und Landesvordruck des Ministeriums für Landesentwicklung und Wohnen; abgeben bei der Stadt oder Gemeinde'],
        BE: ['https://www.berlin.de/sen/wohnen/wissen-fuer-mieter/berliner-mietratgeber/wohnberechtigungsschein/', 'Berlin: Antrag beim Wohnungsamt des Bezirks, auch online'] };
      const WBSWO = { BB: 'Brandenburg: Antrag bei der Stadt- oder Amtsverwaltung bzw. der amtsfreien Gemeinde (Wohnungsamt oder Bürgerbüro)',
        HB: 'Bremen: Antrag bei der Senatorin für Bau, Mobilität und Stadtentwicklung (Referat Wohnungswesen), in Bremerhaven beim Magistrat; Vordruck und Einkommenserklärung auf bau.bremen.de',
        RP: 'Rheinland-Pfalz: Antrag bei der Stadt-, Verbandsgemeinde- oder Kreisverwaltung deines Wohnorts; dort gibt es den Landesvordruck',
        SL: 'Saarland: Antrag beim Ministerium für Inneres, Bauen und Sport (Wohnungsbauförderung) bzw. über deine Stadt oder Gemeinde; Vordruck auf saarland.de' };
      const hilfe = wbsHilfe(s, a);
      if (WBSLINK[bl]) link('wbs', 'Antrag auf Wohnberechtigungsschein', WBSLINK[bl][1], WBSLINK[bl][0], hilfe);
      else hinweis('wbs', 'Antrag auf Wohnberechtigungsschein', WBSWO[bl] || (bl
        ? 'In diesem Land gibt es keinen einheitlichen Landesvordruck. Du bekommst ihn beim Wohnungsamt (in kleineren Orten beim Bauamt oder Bürgerbüro) deiner Stadt oder Gemeinde, meist auch auf deren Internetseite unter „Wohnberechtigungsschein“'
        : 'Gib dein Bundesland oder deine Postleitzahl an; dann sagt SoLo, wo es den Antrag gibt'), hilfe);
    }
    return liste;
  }

  // Ausfüllhilfe für den WBS-Antrag: was in die Felder gehört, mit SoLos Angaben als Anhaltspunkt (nichts wird eingetragen)
  function wbsHilfe(s, a) {
    const erw = s.adults === 2 ? 2 : 1, kids = (s.kids | 0) + (s.young | 0), pers = erw + kids;
    const h = ['Haushalt: alle Personen, die mit dir einziehen, mit Geburtsdatum (laut deinen Angaben ' + pers + (pers === 1 ? ' Person' : ' Personen') + (kids ? ', davon ' + kids + (kids === 1 ? ' Kind' : ' Kinder') : '') + ')'];
    const tsd = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const ek = (art, b) => art && art !== 'ohne' && n(b) > 0 ? tsd(n(b) * 12) + ' € brutto im Jahr' : '';
    const e1 = ek(s.ek1Art || s.art1, s.ek1Brutto || s.brutto), e2 = erw === 2 ? ek(s.ek2Art, s.ek2Brutto) : '';
    h.push('Einkommen: das Einkommen der letzten 12 Monate bzw. das erwartete der nächsten 12 Monate, für jede Person eine Einkommenserklärung' + (e1 ? ' (du laut deinen Angaben etwa ' + e1 + (e2 ? ', Partner/in etwa ' + e2 : '') + ')' : ''));
    h.push('Abzüge macht das Amt: Werbungskosten (mindestens 1.230 € bei Arbeit, 102 € bei Rente) und je 10 % für Steuern, Kranken- und Rentenversicherung, wenn du sie zahlst');
    if (s.gdb || s.bhPerson || s.pflegegrad) h.push('Schwerbehinderung oder Pflegegrad angeben und Nachweis beilegen: dafür gibt es Freibeträge');
    if (n(s.uzBetrag) > 0) h.push('Unterhalt, den du zahlst, angeben und Titel oder Vereinbarung beilegen: er wird abgezogen');
    if (s.schwanger) h.push('Schwangerschaft angeben (Mutterpass): das erwartete Kind zählt mit');
    if (s.adults === 2) h.push('Seid ihr unter 40 und weniger als 5 Jahre verheiratet oder verpartnert? Das angeben: dafür gibt es in vielen Ländern einen Freibetrag');
    h.push('Beilegen: Personalausweis, Einkommensnachweise (Lohnabrechnungen, Rentenbescheid, Bescheide), bei Kindern Kindergeldbescheid; alle Erwachsenen unterschreiben');
    return h;
  }

  // Unterlagen nach dem Anforderungskatalog des Jobcenters, nur die zu den Angaben passenden
  function unterlagen(s) {
    s = s || {};
    const u = ['Personalausweis oder Pass; bei Menschen aus anderen Ländern der Aufenthaltstitel',
      'Kontoauszüge der letzten 3 Monate von allen Konten (auch PayPal)'];
    const a = arten(s), miete = n(s.miete), eigen = s.wohnart === 'eigentum';
    if ((s.kids | 0) > 0) u.push('Geburtsurkunden oder Kinderausweise der Kinder bis 15 Jahre; Schulbescheinigungen ab 15 Jahren');
    if (miete > 0 && !eigen) u.push('Mietvertrag oder Mietbescheinigung; Nachweis über Nebenkosten und Heizkosten, wenn nicht im Mietvertrag');
    if (eigen) u.push('Kaufvertrag oder Grundbuchauszug, Darlehensverträge, Nachweis der Schuldzinsen (Zins und Tilgung getrennt), Nachweise über Heizkosten und Nebenkosten (Grundsteuer, Wasser, Müll, Versicherung)');
    if (a.indexOf('lohn') >= 0) u.push('Arbeitsvertrag und Lohnabrechnungen der letzten 6 Monate (oder Einkommensbescheinigung vom Arbeitgeber)');
    if (istSelbst(s)) u.push('Anlage EKS mit Einnahmen und Ausgaben, letzter Steuerbescheid, betriebliche Kontoauszüge');
    if (a.indexOf('rente') >= 0) u.push('Rentenbescheid');
    if (a.indexOf('alg') >= 0) u.push('Bescheid über Arbeitslosengeld');
    if (a.indexOf('kg') >= 0) u.push('Bescheid über Krankengeld');
    if (a.indexOf('eg') >= 0) u.push('Elterngeldbescheid');
    if ((s.bezug || {}).kindergeld || (s.kids | 0) > 0) u.push('Kindergeldbescheid' + ((s.bezug || {}).kiz ? ' und Bescheid über Kinderzuschlag' : ''));
    if ((s.bezug || {}).wohngeld) u.push('Wohngeldbescheid');
    if (n(s.unterhalt) > 0 || s.unterhaltFehlt) u.push('Unterhaltstitel oder Nachweis über Unterhalt bzw. Unterhaltsvorschuss');
    if (n(s.uzBetrag) > 0) u.push('Nachweis über den Unterhalt, den du zahlst (Urteil, Jugendamtsurkunde oder Vereinbarung, Kontoauszüge)');
    if (n(s.autoWert) > 0) u.push('Fahrzeugschein und Nachweis der Kfz-Versicherung');
    if (n(s.vermoegen) > 0) u.push('Nachweise über Sparbücher, Wertpapiere, Lebens- und Rentenversicherungen (Rückkaufswert), Bausparverträge');
    if (s.gdb || s.bhPerson) u.push('Schwerbehindertenausweis bzw. Feststellungsbescheid');
    if (s.ausbildung === 'ich') u.push('Immatrikulations- oder Schulbescheinigung bzw. Ausbildungsvertrag; BAföG- oder BAB-Bescheid (auch Ablehnung)');
    if (s.schwanger) u.push('Mutterpass (Seite mit dem Entbindungstermin)');
    return u;
  }

  return { plan, unterlagen, teileName, teileStrasse, teileOrt };
})();
if (typeof module !== 'undefined') module.exports = Formulare;
