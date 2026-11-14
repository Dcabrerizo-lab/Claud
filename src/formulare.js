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

  // Einkommensarten der antragstellenden Person (erste Person, dazu ein weiteres Einkommen bei Alleinstehenden)
  // (einfache Version: Einkommensliste)
  function arten(s) {
    if (Array.isArray(s.einkommen)) return s.einkommen.map((e) => e && e.art).filter(Boolean);
    return [s.ek1Art || s.art1, s.adults === 1 ? s.ek1bArt : ''].filter(Boolean);
  }
  const istSelbst = (s) => arten(s).indexOf('selbst') >= 0 || s.ek2Art === 'selbst';

  // Die Formulare für die Angaben. s: Angaben (state), p: Person (Antragsmappe), results: Ergebnis der Regeln
  function plan(s, p, results) {
    s = s || {}; p = p || {};
    const R = (id) => (results || []).find((x) => x.id === id);
    const liste = [];
    const add = (id, datei, titel, warum, werte, art) => liste.push({ id, datei, titel, warum, werte: werte || {}, art: art || 'fuellen' });
    const a = arten(s), kids = s.kids | 0, young = s.young | 0, erw = s.adults === 2 ? 2 : 1;
    const miete = n(s.miete), eigen = s.wohnart === 'eigentum';
    const allein = erw === 1 && kids > 0;
    const selbst = istSelbst(s);
    const k = kopf(p);

    if (ok(R('ggeld'))) {
      // Hauptantrag
      const ha = Object.assign({}, k, anschrift(p));
      if (p.tel) ha.txtfPersonTel = String(p.tel).trim();
      ha.chbxBUEGSofort = true;
      const em = s.emStd === 'unter3' || !!s.wfbm || a.indexOf('wfbm') >= 0;
      ha.rtbnErwerbsfaehig = em ? 'nein' : 'ja';
      ha.rbtnAlleinerziehend = allein ? 'ja' : 'nein';
      ha.rbtnSchwanger = s.schwanger ? 'ja' : 'nein';
      ha.rbtnSchueler = s.ausbildung === 'ich' ? 'ja' : 'nein';
      ha.rbtnAsylbLG = s.aufenthalt === 'asyl' ? 'ja' : 'nein';
      ha.rbtnMEB = s.ernaehrung ? 'ja' : 'nein';
      if (s.bhPerson === 'ich') { ha.rbtnBehinderung = 'ja'; ha.rbtnLeistungTeilhabe = s.teilhabe ? 'ja' : 'nein'; }
      else if (!s.bhPerson) ha.rbtnBehinderung = 'nein';
      if ((s.bezug || {}).grundsicherungsgeld || (s.bezug || {}).sozialamt) ha.rbtnBUEG = 'ja';
      ha.rbtnSelbstaendig = selbst ? 'ja' : 'nein';
      const ersatz = a.filter((x) => x === 'alg' || x === 'kg' || x === 'eg');
      ha.rbtnEntgeltersatz = ersatz.length ? 'ja' : 'nein';
      if (ersatz.length) ha.txtfEntgeltersatz = ersatz.map((x) => ({ alg: 'Arbeitslosengeld', kg: 'Krankengeld', eg: 'Elterngeld' })[x]).join(', ');
      const andere = { chbxLeistungWohngeld: ok(R('wohngeld')) && !(s.bezug || {}).wohngeld, chbxLeistungArbeitslosengeld: ok(R('alg1')) && a.indexOf('alg') < 0,
        chbxLeistungKRG: ok(R('krankengeld')) && a.indexOf('kg') < 0, chbxLeistungKG: kids + young > 0 && !(s.bezug || {}).kindergeld,
        chbxLeistungKIZ: ok(R('kiz')) && !(s.bezug || {}).kiz, chbxLeistungBafoeg: ok(R('bafoeg')), chbxLeistungBAB: ok(R('bab')), chbxLeistungRente: ok(R('emrente')) || ok(R('srente')) };
      const welche = Object.keys(andere).filter((x) => andere[x]);
      ha.rbtnLeistungAndere = welche.length ? 'ja' : 'nein';
      welche.forEach((x) => { ha[x] = true; });
      const alleinWohnen = erw === 1 && kids + young === 0 && !s.hhAndere && s.wohnform !== 'eltern';
      ha.rbtnWohnsituation = alleinWohnen ? 'ja' : 'nein';
      if (erw === 2) ha.chbxWohnenEhegatte = true;
      if (kids > (s.kids14 | 0)) ha.chbxWohnenKindU15 = true;
      if ((s.kids14 | 0) > 0 || young > 0) ha.chbxWohnenKind = true;
      if (s.wohnform === 'eltern') ha.chbxWohnenEltern = true;
      if (s.hhAndere === 'verwandte') ha.chbxWohnenVerwandte = true;
      if (s.hhAndere === 'wg') ha.chbxWohnenSonstige = true;
      ha.rbtnBedarfUnterkunft = miete > 0 ? 'ja' : 'nein';
      add('ha', 'antrag-sgb2_ba147846.pdf', 'Hauptantrag (HA)', 'Antrag auf Grundsicherungsgeld', ha);

      // Anlage EK: Einkommen der antragstellenden Person
      const ek = Object.assign({}, k, selbe(p));
      ek.rbtnEinkommen = a.indexOf('lohn') >= 0 ? 'ja' : 'nein';
      ek.rbtnEinkommenFreiberuflich = selbst ? 'ja' : 'nein';
      const ein = { chbxEinnahmeWohngeld: !!(s.bezug || {}).wohngeld, chbxEinnahmeArbeitslosengeld: a.indexOf('alg') >= 0, chbxEinnahmeKrankengeld: a.indexOf('kg') >= 0,
        chbxEinnahmeElterngeld: a.indexOf('eg') >= 0, chbxEinnahmeKindergeld: kids + young > 0 && !!(s.bezug || {}).kindergeld, chbxEinnahmeKinderzuschlag: !!(s.bezug || {}).kiz,
        chbxEinnahmeRenten: a.indexOf('rente') >= 0, chbxEinnahmeSozialhilfe: !!(s.bezug || {}).sozialamt };
      const hat = Object.keys(ein).filter((x) => ein[x]);
      hat.forEach((x) => { ek[x] = true; });
      if (!hat.length && a.indexOf('lohn') < 0 && !selbst && a.indexOf('wfbm') < 0) ek.chbxEinnahmeKeine = true;
      if (a.indexOf('wfbm') >= 0) { ek.chbxEinnahmeSonstige = true; ek.txtfEinnahmeSonstige = 'Lohn aus der Werkstatt für behinderte Menschen'; }
      ek.rbtnUnterhaltszahlung = n(s.uzBetrag) > 0 ? 'ja' : 'nein';
      if (n(s.autoWert) > 0) ek.chbxVersicherungKfz = true;
      add('ek', 'anlageek_ba013053.pdf', 'Anlage EK', 'Einkommen (für jede Person ab 15 Jahren eine eigene Anlage EK)', ek);

      // Anlage KDU: Unterkunft und Heizung
      if (miete > 0 || eigen) {
        const kdu = Object.assign({}, k, anschrift(p));
        kdu.numfUnterkunftAnzahlPersonen = String(erw + kids + young);
        if (eigen) kdu.chbxWohnenEigentum = true; else kdu.chbxWohnenMiete = true;
        if (s.warmwasser) kdu.chbxWasserDezentral = true;
        add('kdu', 'anlagekdu_ba013056.pdf', 'Anlage KDU', 'Kosten für Unterkunft und Heizung' + (miete > 0 ? ' (laut SoLo zusammen ' + geld(miete) + ' € im Monat: bitte nach Grundmiete, Nebenkosten und Heizkosten aufteilen)' : ''), kdu);
      }
      // Anlage VM: Vermögen
      const vm = Object.assign({}, k);
      vm.rbtnBGImmobBewohnt = eigen ? 'ja' : 'nein';
      vm.rbtnBGKfZ = n(s.autoWert) > 0 ? 'ja' : 'nein';
      if (n(s.autoWert) > 0) vm.numfKfZWertZ1 = geld(s.autoWert);
      add('vm', 'anlagevm_ba013070.pdf', 'Anlage VM', 'Vermögen (Konten, Wertgegenstände, Auto, Immobilien)', vm);
      // Weitere Personen
      if (erw === 2) {
        add('wep', 'anlagewep_ba013071.pdf', 'Anlage WEP', 'Für die Partnerin oder den Partner', Object.assign({}, k));
        add('ek2', 'anlageek_ba013053.pdf', 'Anlage EK (Partner)', 'Einkommen der Partnerin oder des Partners', Object.assign({}, k));
        add('ve', 'anlageve_ba013069.pdf', 'Anlage VE', 'Nur wenn ihr nicht verheiratet seid: Fragen zur Partnerschaft', Object.assign({}, k));
      }
      for (let i = 0; i < young; i++) add('wep-' + i, 'anlagewep_ba013071.pdf', 'Anlage WEP (Kind ab 15)', 'Für jedes Kind ab 15 Jahren', Object.assign({}, k));
      for (let i = 0; i < kids; i++) {
        const ki = Object.assign({}, k);
        if (allein) ki.rbtnBGElternAusserhalb = 'ja';
        add('ki-' + i, 'anlageki_ba013057.pdf', 'Anlage KI (Kind ' + (i + 1) + ')', 'Für jedes Kind unter 15 Jahren (Kinder von 15 bis 17 Jahren: Anlage WEP)', ki);
      }
      if (allein) {
        const uh = Object.assign({}, k);
        uh.rbtnUH = n(s.unterhalt) > 0 ? 'ja' : 'nein';
        if (n(s.unterhalt) > 0) uh.numfUHZahlung = geld(s.unterhalt);
        add('uh3', 'anlageuh3_ba013067.pdf', 'Anlage UH3', 'Unterhalt für die Kinder vom anderen Elternteil (für jedes Kind eine eigene Anlage)', uh);
      }
      if (s.schwanger && erw === 1) add('uh2', 'anlageuh2_ba013066.pdf', 'Anlage UH2', 'Schwangerschaft, wenn du nicht verheiratet bist', Object.assign({}, k, selbe(p)));
      if (s.ernaehrung) add('meb', 'anlagemeb_ba013060.pdf', 'Anlage MEB', 'Mehrbedarf für kostenaufwändige Ernährung (Seite 3 und 4 füllt die Ärztin oder der Arzt aus)',
        Object.assign({}, kopf(p, 'txtfAnlPerson'), selbe(p, 'txtfAnlBG'), { chbxAnlBGMehrbedarfErstmalig: true }));
      if (s.hhAndere === 'verwandte') add('hg', 'anlagehg_ba013055.pdf', 'Anlage HG', 'Verwandte in derselben Wohnung (Haushaltsgemeinschaft)', Object.assign({}, k));
      if (selbst) {
        add('eks', 'AnlageEKS_ba013054.pdf', 'Anlage EKS', 'Einkommen aus Selbstständigkeit (Einnahmen und Ausgaben, vorläufig)', Object.assign({}, k));
        add('sv', 'anlagesv_ba013063.pdf', 'Anlage SV', 'Kranken- und Pflegeversicherung bei Selbstständigkeit', Object.assign({}, k, selbe(p), { rbtnSelbstaendig: 'ja' }));
      }
      // Vordrucke für Dritte
      if (a.indexOf('lohn') >= 0) add('ab', 'dok_ba033945.pdf', 'Einkommensbescheinigung', 'Füllt der Arbeitgeber aus', {}, 'leer');
      if (miete > 0 && !eigen) add('mb', 'Mietbescheinigung_1.pdf', 'Mietbescheinigung', 'Füllt die Vermieterin oder der Vermieter aus, wenn kein Mietvertrag vorliegt', {}, 'leer');
    }
    // Kinderzuschlag (Familienkasse): Das PDF ist vom Herausgeber geschützt (Ausfüllen erlaubt, Verändern nicht). SoLo verändert es
    // deshalb nicht und gibt es als leeren Vordruck mit; Ausfüllen geht in jeder PDF-App oder online mit BundID.
    if (ok(R('kiz')) && !(s.bezug || {}).kiz) add('kiz', 'kiz1-antrag_ba036540.pdf', 'Antrag auf Kinderzuschlag (KiZ 1)', 'Für die Familienkasse; zum Ausfüllen in einer PDF-App, einfacher geht es online mit BundID', {}, 'leer');
    // Wohngeld: Vordruck ohne Formularfelder (Muster; die Wohngeldstelle kann einen eigenen Vordruck verlangen)
    if (ok(R('wohngeld')) && !(s.bezug || {}).wohngeld) add('wg', '35_mz_antrag.pdf', 'Antrag auf Wohngeld (Mietzuschuss)', 'Muster-Vordruck zum Ausdrucken; manche Wohngeldstellen haben einen eigenen Vordruck', {}, 'leer');
    // Kindergeld (Familienkasse): Vordrucke sind vom Herausgeber geschützt; SoLo gibt sie unverändert mit Ausfüllhilfe weiter.
    const kgOk = ok(R('kindergeld')), kgNa = (R('kindergeld') || {}).level === 'na';
    const leer = (id, datei, titel, warum, hilfe) => { add(id, datei, titel, warum, {}, 'leer'); if (hilfe) liste[liste.length - 1].hilfe = hilfe; };
    if (kgOk && !(s.bezug || {}).kindergeld) {
      leer('kg1', 'kg1.pdf', 'Antrag auf Kindergeld (KG 1)', 'An die Familienkasse; einfacher online mit BundID unter familienkasse.de', [
        'Für jedes Kind eine „Anlage Kind“ beilegen (gibt es bei der Familienkasse und online, nicht in SoLo enthalten)',
        'Steuerliche Identifikationsnummer von dir und von jedem Kind (steht im Brief vom Bundeszentralamt für Steuern) ist Pflicht',
        'Angaben zur Partnerin oder zum Partner bzw. zum anderen Elternteil im Haushalt, Bankverbindung (IBAN)',
        'Staatsangehörigkeit nicht deutsch: aus der EU zusätzlich die „Anlage EU“, sonst Aufenthaltstitel beilegen',
        'Kindergeld gibt es rückwirkend nur für 6 Monate: Antrag bald stellen'].concat((s.young | 0) > 0 ? ['Für Kinder ab 18: Nachweis über Schule, Studium oder Ausbildung beilegen (siehe die Vordrucke unten)'] : []));
      if (s.aufenthalt === 'eu') leer('kg51', 'kg51.pdf', 'Anlage Ausland (KG 51)', 'Nur wenn ein Elternteil oder ein Kind im Ausland wohnt oder arbeitet oder Leistungen aus dem Ausland bezieht');
    }
    // Kinder von 18 bis 24 in Ausbildung: Nachweise, die die Familienkasse ab dem 18. Geburtstag verlangt
    if ((s.young | 0) > 0 && (kgOk || kgNa)) {
      leer('kg5a', 'kg5a.pdf', 'Schulbescheinigung (KG 5a)', 'Für ein Kind, das zur Schule geht; füllt die Schule aus');
      leer('kg7e', 'kg7e.pdf', 'Erklärung zur Hochschulausbildung (KG 7e)', 'Für ein Kind im Studium; mit Immatrikulationsbescheinigung');
      leer('kg-ausbildung', 'kg-ausbildung.pdf', 'Erklärung zum Ausbildungsverhältnis', 'Für ein Kind in betrieblicher Ausbildung; mit Ausbildungsvertrag');
      leer('kg5d', 'kg5d.pdf', 'Erklärung zu den Verhältnissen eines volljährigen Kindes (KG 5d)', 'Wenn die Familienkasse danach fragt, z. B. bei einer zweiten Ausbildung oder Arbeit neben dem Studium (höchstens 20 Stunden in der Woche)');
      leer('kg-ohneplatz', 'kg-ohneplatz.pdf', 'Erklärung für ein volljähriges Kind ohne Ausbildungsplatz', 'Nur falls das Kind einen Ausbildungsplatz sucht');
      leer('kg10', 'kg10.pdf', 'Erklärung zum Praktikum (KG 10)', 'Nur falls das Kind ein Praktikum macht');
    }
    // Volljähriges Kind mit Behinderung (Behinderung vor dem 25. Geburtstag)
    if (ok(R('kgBeh'))) {
      leer('kg4e', 'kg4e.pdf', 'Erklärung zu den Verhältnissen eines volljährigen Kindes mit Behinderung (KG 4e)', 'Zum Kindergeld für ein erwachsenes Kind mit Behinderung', [
        'Ärztlicher Nachweis muss enthalten: das Wort „Behinderung“, seit wann sie besteht und wie sie sich auf die Erwerbsfähigkeit auswirkt; er gilt höchstens 1 Jahr',
        'Schwerbehindertenausweis oder Feststellungsbescheid in Kopie beilegen',
        'Einkommen des Kindes (Lohn, Werkstattlohn, Rente, Grundsicherung) in der Erklärung zum Nettoeinkommen (KG 4f) angeben']);
      leer('kg4f', 'kg4f.pdf', 'Erklärung zum verfügbaren Nettoeinkommen des Kindes (KG 4f)', 'Damit die Familienkasse prüfen kann, ob sich das Kind selbst unterhalten kann');
      leer('kg4k', 'kg4k.pdf', 'Ärztliche Bescheinigung über das Vorliegen einer Behinderung', 'Füllt die Ärztin oder der Arzt aus, wenn kein Schwerbehindertenausweis vorliegt oder er nicht reicht');
      leer('kg-erwerb', 'kg-erwerb.pdf', 'Ärztliche Bescheinigung zum möglichen Umfang der Erwerbstätigkeit', 'Füllt die Ärztin oder der Arzt aus');
      if (s.pflegegrad) leer('kg-betreuung', 'kg-betreuung.pdf', 'Ärztliche Bescheinigung über erforderliche Betreuungsleistungen', 'Bei Pflege- oder Betreuungsbedarf; dafür gibt es einen zusätzlichen Freibetrag');
      leer('kg-begleitung', 'kg-begleitung.pdf', 'Ärztliche Bescheinigung über die Notwendigkeit ständiger Begleitung', 'Nur falls das Kind ständig begleitet werden muss (z. B. Merkzeichen B)');
      leer('kg4g', 'kg4g.pdf', 'Erklärung zum Nettoeinkommen des Ehepartners des Kindes (KG 4g)', 'Nur falls das Kind verheiratet ist oder in eingetragener Lebenspartnerschaft lebt');
    }
    // Grundsicherung im Alter und bei Erwerbsminderung (Sozialamt)
    if (ok(R('gsa')) && !(s.bezug || {}).sozialamt) {
      leer('gsa', 'sgb12-grundsicherung.pdf', 'Antrag auf Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)', 'Muster des Deutschen Vereins (Stand 27.4.2023); viele Sozialämter haben einen eigenen Vordruck, der Antrag gilt aber in jeder Form', [
        'Angaben zu dir und zu Personen im Haushalt, Wohnkosten (Mietvertrag, Nebenkosten- und Heizkostenabrechnung)',
        'Einkommen: Rentenbescheid, bei Werkstatt Lohnabrechnung; Vermögen mit Kontoauszügen der letzten 3 Monate (geschützt sind 10.000 €)',
        'Bei Erwerbsminderung: Rentenbescheid oder Bescheid über die volle Erwerbsminderung; bei Werkstatt reicht der Nachweis der Werkstatt',
        'Unterhalt von Kindern oder Eltern wird erst ab 100.000 € Jahreseinkommen geprüft',
        'Schwerbehindertenausweis mit Merkzeichen G oder aG: Mehrbedarf, Kopie beilegen']);
    }
    // Wohnberechtigungsschein: SoLo füllt nichts aus. Es gibt den leeren Landesvordruck mit Ausfüllhilfe, sonst die Fundstelle.
    if (ok(R('wbs'))) {
      const bl = s.bundesland || '';
      const WBS = { BW: ['wbs-BW.pdf', 'Baden-Württemberg, Landesvordruck (Anlage 4) des Ministeriums für Landesentwicklung und Wohnen'], BY: ['wbs-BY.pdf', 'Bayern, Stand April 2026; in München gilt ein eigenes Verfahren (SOWON)'], BE: ['wbs-BE.pdf', 'Berlin'],
        BB: ['wbs-BB.pdf', 'Brandenburg, amtlicher Landesvordruck'], HH: ['wbs-HH.pdf', 'Hamburg, an das Bezirksamt'],
        HB: ['wbs-HB.pdf', 'Bremen, an die Senatorin für Bau, Mobilität und Stadtentwicklung'], RP: ['wbs-RP.pdf', 'Rheinland-Pfalz, Landesvordruck 2026'],
        SL: ['wbs-SL.pdf', 'Saarland, Stand 1.9.2025, an das Ministerium für Inneres, Bauen und Sport'] };
      const hilfe = wbsHilfe(s, a);
      if (WBS[bl]) {
        add('wbs', WBS[bl][0], 'Antrag auf Wohnberechtigungsschein', WBS[bl][1] + '; dazu je Person mit Einkommen eine Einkommenserklärung', {}, 'leer');
        liste[liste.length - 1].hilfe = hilfe;
        if (bl === 'HB') add('wbs-ek', 'wbs-HB-anlage1.pdf', 'Einkommens- und Vermögenserklärung (Anlage 1)', 'Für jede Person im Haushalt mit eigenem Einkommen eine eigene Erklärung', {}, 'leer');
      } else {
        add('wbs', '', 'Antrag auf Wohnberechtigungsschein', bl
          ? 'In diesem Land gibt es keinen einheitlichen Landesvordruck. Du bekommst ihn beim Wohnungsamt (in kleineren Orten beim Bauamt oder Bürgerbüro) deiner Stadt oder Gemeinde, meist auch auf deren Internetseite unter „Wohnberechtigungsschein“'
          : 'Gib dein Bundesland oder deine Postleitzahl an; manche Länder haben einen Landesvordruck, sonst gibt ihn die Stadt oder Gemeinde heraus', {}, 'hinweis');
        liste[liste.length - 1].hilfe = hilfe;
      }
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
