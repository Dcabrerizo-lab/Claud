const Rules = (function () {
  'use strict';

  // ---------------------------------------------------------------
  // Regeln als Daten. Stand: November 2026 (Werte 2026).
  // Die Logik gibt keine fertigen Sätze aus, sondern Textschlüssel
  // mit Parametern. Die Texte stehen in den Sprachdateien.
  // ---------------------------------------------------------------
  const R = {
    stand: 'November 2026',
    // RBSFV 2026, Anlage zu § 28 SGB XII: Stufe 1 563, Stufe 2 506, Stufe 3 451, Stufe 4 (14-17) 471, Stufe 5 (6-13) 390, Stufe 6 (0-5) 357
    regelbedarf: { alleinstehend: 563, partner: 506, kind0: 357, kind: 390, kind14: 471, jungErwachsener: 451 },
    kindergeld: 259,
    // Wohnkostenanteil der Eltern (§ 6a Abs. 5 BKGG, Existenzminimumbericht): Näherung über ein Gewicht je Kind,
    // Alleinerziehende ca. 77 % / 63 % / 53 % bei 1 / 2 / 3 Kindern, Paare ca. 83 % / 71 % / 62 %
    kiz: { vermZwei: 55000, vermDrei: 70000, vermJeWeiteres: 15000, max: 297, minAlleinerziehend: 600, minPaar: 900, anrechnung: 0.45, gewichtKindAllein: 0.29, gewichtKindPaar: 0.4, puffer: 300, ampelGruenAb: 60 },
    wohngeld: {
      // Keine Beträge im Gesetzestext (§ 21 Nr. 3 WoGG: nur "erhebliches Vermögen"); die Beträge sind die Regelvermutung der Verwaltungsvorschrift (nur Sekundärquellen)
      vermoegenErste: 60000,
      vermoegenJeWeitere: 30000,
      mindestAnteil: 0.8, // reine Heuristik, keine Rechtsgrundlage
      freibetragBehinderungMonat: 150,
      freibetragAlleinerzMonat: 110,
      abzugMittel: 0.8
    },
    grundsicherung: { schonAllein: 10000, schonPaar: 20000, knappPuffer: 100, sicherAb: 50 },
    sgb2: { schon: { '': 10000, '<31': 5000, '31-40': 10000, '41-50': 12500, '51+': 20000 } },
    but: { schulbedarf: 195, teilhabeMonat: 15 },
    // Minijob-Grenze 2026 (§ 8 Abs. 1a SGB IV): Erwerbseinkommen von Schülern und Azubis unter 25 bleibt bis dahin frei (§ 11b Abs. 2b SGB II)
    minijob: 603,
    // Arbeitslosengeld I (SGB III): 60 %, mit Kind 67 % des pauschalierten Nettos (§ 149); Beitragsbemessungsgrenze 2026: 8.450 € im Monat;
    // Netto grob 60-72 % des Bruttos; Dauer § 147 Abs. 2: [Monate versichert in 5 Jahren, Mindestalter, Monate Anspruch]
    alg: { satz: 0.6, satzKind: 0.67, bbg: 8450, netto: [0.6, 0.72], nettoKlein: 0.8, kleinBis: 2000, dauer: [[48, 58, 24], [36, 55, 18], [30, 50, 15], [24, 0, 12], [20, 0, 10], [16, 0, 8], [12, 0, 6]] },
    // Krankengeld (§ 47 SGB V): 70 % des Bruttos, höchstens 90 % des Nettos, bis zur Beitragsbemessungsgrenze 2026 (5.812,50 € im Monat);
    // davon gehen Beiträge zur Renten-, Arbeitslosen- und Pflegeversicherung ab (rund 12,5 %); höchstens 78 Wochen (§ 48 SGB V)
    krank: { satz: 0.7, nettoMax: 0.9, bbg: 5812.5, abzug: 0.125, wochen: 78 },
    // Pauschale für Versicherungen bei Einkommen, das kein Lohn ist (§ 6 Abs. 1 Nr. 1 Bürgergeld-V)
    versPauschale: 30,
    // Elterngeld: bis 300 € frei beim Wohngeld (§ 10 Abs. 1 BEEG); bei Grundsicherung und Kinderzuschlag nur, wenn vor der Geburt Einkommen da war (§ 10 Abs. 5 BEEG)
    elterngeldFrei: 300,
    // Werkstatt für behinderte Menschen (WfbM) und Grundsicherung nach dem SGB XII:
    // § 82 Abs. 3 Satz 2 SGB XII: vom Werkstattlohn bleiben ein Achtel der Regelbedarfsstufe 1 und die Hälfte des Rests frei;
    // § 82 Abs. 2 Nr. 5 SGB XII i. V. m. § 59 SGB IX: Arbeitsförderungsgeld (52 €) zählt nicht; § 82 Abs. 3 Satz 1: sonst 30 % frei,
    // höchstens 50 % der Regelbedarfsstufe 1. Regelbedarfsstufe 1 auch bei den Eltern, Stufe 2 in einer besonderen Wohnform (Anlage zu § 28).
    wfbm: { afoeg: 52, achtel: 1 / 8, rest: 0.5 }, gsaArbeit: { quote: 0.3, max: 0.5 },
    // Unsichere Teile ohne feste Zahl (die App rechnet sie nicht, sondern verbreitert den Bereich „möglich“):
    // Mittagessen in der Werkstatt (§ 42b Abs. 2 SGB XII), Wohnkosten bei den Eltern ohne Mietvertrag (§ 42a Abs. 3) oder im Wohnheim (§ 42a Abs. 5)
    offen: { essen: 90, elternKdu: 300, heimKdu: 700 },
    // Mehrbedarfe: Alleinerziehende § 21 Abs. 3 SGB II / § 30 Abs. 3 SGB XII; Merkzeichen G bei Rentenalter oder voller Erwerbsminderung § 30 Abs. 1 SGB XII (17 %)
    mehr: { ae36: 0.36, aeJeKind: 0.12, aeMax: 0.6, g: 0.17 },
    // Freibetrag beim Wohngeld für eigenes Einkommen von Kindern (16 bis 24 Jahre): 1.200 € im Jahr (§ 17 Nr. 4 WoGG)
    wgKindFrei: 100,
    // Pauschalabzug beim Wohngeld (§ 16 WoGG) je Einkommensart: [kleinster, größter] üblicher Abzug
    wgAbzug: { lohn: [0.1, 0.3], rente: [0.1, 0.2], kg: [0.1, 0.2], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.1], ohne: [0, 0] },
    // Wenn nur die Auszahlung bekannt ist: Rente netto ≈ 0,89 × Brutto, also 90 % (bzw. 80 %) Brutto ≈ 100 % (bzw. 94 %) der Auszahlung; Lohn netto 70-80 %
    wgAbzugAuszahlung: { lohn: [0, 0.12], rente: [0, 0.06], kg: [0, 0.06], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.05], ohne: [0, 0] },
    // Grundrentenfreibetrag (§ 82a SGB XII): bei 33 Jahren Grundrentenzeiten bleiben von der Rente 100 € und 30 % des Rests frei, höchstens 50 % der Regelbedarfsstufe 1
    grundrente: { sockel: 100, quote: 0.3, max: 0.5 },
    // Regelaltersgrenze (§ 235 SGB VI) in Monaten über 65, je Geburtsjahr 1947..1963; ab 1964: 67 Jahre
    rag: { 1947: 1, 1948: 2, 1949: 3, 1950: 4, 1951: 5, 1952: 6, 1953: 7, 1954: 8, 1955: 9, 1956: 10, 1957: 11, 1958: 12, 1959: 14, 1960: 16, 1961: 18, 1962: 20, 1963: 22 },
    uvg: { bis5: 227, bis11: 299, bis17: 394, min12: 600 },
    bafoeg: { freiAllein: 1690, freiPaar: 2540, jeKind: 770, spanne: 1200, vermBis29: 15000, vermAb30: 45000 },
    pflege: { geld: { 2: 347, 3: 599, 4: 800, 5: 990 }, entlastung: 131 },
    // Menschen mit Behinderung. Quellen: § 33b Abs. 3 EStG (Pauschbeträge), § 32a EStG (Grundfreibetrag 2026),
    // ZBFS Bayern, Infoblatt Blindengeld (Stand 1.7.2026), § 40 SGB XI, § 61 SGB IX, § 208 SGB IX, Art. 11 BayWoFG
    beh: {
      pausch: { 20: 384, 30: 620, 40: 860, 50: 1140, 60: 1440, 70: 1780, 80: 2120, 90: 2460, 100: 2840, H: 7400 },
      grundfreibetrag: 12348,
      blind: { blind: 809, hoch: 242.7, kuerzBlind: 159.62, kuerzHoch: 159.62, stand: '7/2026' },
      verbrauch: 42, wohnumfeld: 4180,
      budgetProzent: 75, zusatzurlaub: 5
    },
    // Wohnberechtigungsschein Bayern: Art. 4 Abs. 1 BayWoBindG (seit 1.8.2024). In Gebieten mit erhöhtem Wohnungsbedarf darf die Gemeinde per
    // Verordnung höhere Grenzen bis zu den Höchstwerten nach Art. 11 Abs. 1 BayWoFG festlegen (Art. 4 Abs. 3 BayWoBindG); ob das bei dir gilt, weiß die App nicht.
    wbs: { ein: 17500, zwei: 27500, weitere: 5000, kind: 1300, maxEin: 28300, maxZwei: 43200, maxWeitere: 10700, maxKind: 3200, maxAbzug: 0.3, schwerbFrei: 4000 }
  };

  // ---------------------------------------------------------------
  // Wohngeld (WoGG). Alle Parameter aus amtlichen Quellen, Stand Rechtslage 2026 (Dynamisierung vom 1.1.2025):
  //  - Höchstbeträge der Miete, Anlage 1 zu § 12 WoGG: Haushaltsgröße 1..5 je Mietenstufe I..VII, Mehrbetrag je weiteres Mitglied
  //  - Klimakomponente, § 12 Abs. 7 WoGG; Heizkostenkomponente (Gesamtbetrag), § 12 Abs. 6 WoGG
  //  - Formel § 19 Abs. 1 WoGG: Wohngeld = 1,15 × (M − (a + b·M + c·Y) × Y), Werte a, b, c: Anlage 2
  // Achtung: Ein Gesetzentwurf (BT-Drs. 21/8284) will das Wohngeld zum 1.1.2027 ändern. Er ist noch nicht beschlossen.
  // ---------------------------------------------------------------
  const HOECHST = { 1: [361, 437, 521, 608, 694, 82], 2: [408, 493, 587, 686, 782, 94], 3: [456, 551, 657, 766, 875, 106], 4: [511, 619, 737, 858, 982, 119],
    5: [562, 680, 809, 946, 1080, 129], 6: [615, 745, 887, 1035, 1183, 149], 7: [677, 820, 975, 1139, 1302, 163] };
  const KLIMA = [19.2, 24.8, 29.6, 34.4, 39.2], KLIMA_WEITER = 4.8;
  const HEIZ = [110.4, 142.6, 170.2, 197.8, 225.4], HEIZ_WEITER = 27.6;
  const WGF = [[0.04, 4.797e-4, 4.08e-5], [0.03, 3.571e-4, 3.04e-5], [0.02, 2.917e-4, 2.45e-5], [0.01, 2.163e-4, 1.76e-5], [0, 1.907e-4, 1.72e-5], [-0.01, 1.722e-4, 1.66e-5],
    [-0.02, 1.592e-4, 1.65e-5], [-0.03, 1.583e-4, 1.65e-5], [-0.04, 1.376e-4, 1.66e-5], [-0.06, 1.249e-4, 1.66e-5], [-0.09, 1.141e-4, 1.96e-5], [-0.12, 1.107e-4, 2.21e-5]];
  const wgIdx = (n) => Math.min(Math.max(Math.floor(n), 1), 12) - 1;
  // Höchstbetrag der Miete einschließlich Klimakomponente (Stufe 1..7, Haushaltsgröße n)
  function wgCap(stufe, n) {
    const row = HOECHST[stufe], k = Math.min(Math.max(Math.floor(n), 1), 12);
    return k <= 5 ? row[k - 1] + KLIMA[k - 1] : row[4] + (k - 5) * row[5] + KLIMA[4] + (k - 5) * KLIMA_WEITER;
  }
  function wgHeiz(n) {
    const k = Math.min(Math.max(Math.floor(n), 1), 12);
    return k <= 5 ? HEIZ[k - 1] : HEIZ[4] + (k - 5) * HEIZ_WEITER;
  }
  // Höchstes anrechenbares Monatseinkommen Y (nach Pauschalabzug), bei dem bei Miete M noch Wohngeld > 0 bleibt
  // Wohngeld im Monat nach § 19 Abs. 1 WoGG
  function wgBetrag(n, M, Y) {
    const [a, b, c] = WGF[wgIdx(n)];
    return 1.15 * (M - (a + b * M + c * Y) * Y);
  }
  function wgYmax(n, M) {
    const [a, b, c] = WGF[wgIdx(n)];
    const p = a + b * M;
    return (-p + Math.sqrt(p * p + 4 * c * M)) / (2 * c);
  }
  // Die Miete M, mit der Wohngeld rechnet: Bruttokaltmiete (bis zur Höchstmiete) plus Heizkostenkomponente.
  // Die Warmmiete dient als Näherung: Wohngeld ersetzt die Heizkosten durch die Pauschale.
  // factor < 1 rechnet vorsichtig. Ohne Mietangabe gilt die Höchstmiete.
  function wgMiete(stufe, n, warm, factor) {
    const heiz = wgHeiz(n), cap = wgCap(stufe, n);
    if (!(warm > 0)) return cap + heiz;
    return Math.min(factor * Math.max(0, warm - heiz), cap) + heiz;
  }
  // Brutto-Einkommensgrenzen bei Höchstmiete: [bei 10 % pauschalem Abzug, bei 30 % pauschalem Abzug]
  function limits(stufe, n) {
    const y = wgYmax(n, wgCap(stufe, n) + wgHeiz(n));
    return [y / 0.9, y / 0.7];
  }
  const WG = {};
  for (let st = 1; st <= 7; st++) { WG[st] = []; for (let n = 1; n <= 12; n++) WG[st].push(limits(st, n)); }

  // Leer (nicht ausgefüllt) ist etwas anderes als 0: ein leeres Feld darf kein „wahrscheinlich“ ergeben
  const blank = (v) => v === '' || v == null;
  function num(v) {
    const x = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return isFinite(x) && x > 0 ? x : 0;
  }

  // Beträge sind Zahlen, keine Texte: { eur: 1674 }. Die Anzeige formatiert sie je Sprache (format.js).
  const eur = (x) => ({ eur: Math.round(x) });
  // Betrag mit Cent, wenn nötig (z. B. 242,70 €); die Anzeige blendet Nullcent aus
  const eur2 = (x) => ({ eur: Math.round(x * 100) / 100 });
  function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][n] || String(n); }

  // Ergebnis: level = ja | vielleicht | nein | na, hl = Schlüssel der Überschrift (h.*),
  // tx = Liste aus [Schlüssel, Parameter] (t.*), die hintereinander angezeigt werden.
  const mk = (id, level, hl, tx) => ({ id, level, hl, tx });

  // ---------------------------------------------------------------
  // Hilfsgrößen
  // ---------------------------------------------------------------
  function derive(inp) {
    const adults = inp.adults === 2 ? 2 : 1;
    const kids = Math.max(0, inp.kids | 0);
    const young = Math.max(0, inp.young | 0);
    const persons = adults + kids + young;
    // Einfache Version: Liste der Einkommen einer Person [{ art, b }] (b = ausgezahlter Betrag)
    const ARTEN = ['lohn', 'rente', 'alg', 'kg', 'eg', 'wfbm', 'ohne'];
    // Eintrag: [Art, Brutto, Netto, nurAuszahlung] – ohne eigenes Netto ist b der ausgezahlte Betrag (einfache Version)
    const liste = Array.isArray(inp.einkommen) ? inp.einkommen.filter((x) => x && ARTEN.indexOf(x.art) >= 0).map((x) => {
      const nurAus = blank(x.n);
      return [x.art, num(x.b), nurAus ? num(x.b) : num(x.n), nurAus];
    }) : null;
    const brutto = liste ? liste.reduce((a, x) => a + x[1], 0) : num(inp.brutto);
    const brutto2 = adults === 2 && !liste ? Math.min(num(inp.brutto2), brutto) : 0;
    const nettoGiven = liste ? true : inp.netto !== '' && inp.netto != null && num(inp.netto) > 0;
    const netto = liste ? liste.reduce((a, x) => a + x[2], 0) : nettoGiven ? num(inp.netto) : brutto * 0.8;
    const miete = num(inp.miete);
    const vermoegen = num(inp.vermoegen);
    // Unterhalt, den die Kinder vom anderen Elternteil bekommen (im Monat, alle Kinder zusammen); nur mit Kindern im Haushalt
    const unterhalt = kids + young > 0 ? num(inp.unterhalt) : 0;
    const regelElt = adults === 2 ? 2 * R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    // Alter der Kinder optional: ohne Angabe gilt die mittlere Stufe (6-13 Jahre, 390 €)
    const kidsU6 = Math.min(Math.max(0, inp.kidsU6 | 0), kids);
    const kids14 = Math.min(Math.max(0, inp.kids14 | 0), kids - kidsU6);
    const regel = regelElt + kidsU6 * R.regelbedarf.kind0 + kids14 * R.regelbedarf.kind14 + (kids - kidsU6 - kids14) * R.regelbedarf.kind + young * R.regelbedarf.jungErwachsener;
    const pg = ['1', '2', '3', '4', '5'].indexOf(String(inp.pflegegrad)) >= 0 ? Number(inp.pflegegrad) : 0;
    // Einkommensart je erwachsener Person (lohn, rente, alg, kg, eg = Elterngeld, ohne). Ältere Speicherstände: aus den Haken.
    const art1 = liste ? (liste.some((x) => x[0] === 'lohn') ? 'lohn' : liste.length ? liste[0][0] : 'ohne') : ARTEN.indexOf(inp.art1) >= 0 ? inp.art1 : (inp.nichtArbeit ? 'rente' : 'lohn');
    const art2 = ARTEN.indexOf(inp.art2) >= 0 ? inp.art2 : (inp.nichtArbeit2 ? 'rente' : 'lohn');
    const pers = liste ? (liste.length ? liste : [['ohne', 0]]) : adults === 2 ? [[art1, brutto - brutto2], [art2, brutto2]] : [[art1, brutto]];
    const sumIf = (f) => pers.reduce((a, x) => a + f(x[0], x[1]), 0);
    // Eigenes Einkommen der Kinder (Ausbildungsvergütung, Minijob; ohne Kindergeld und Unterhalt), im Monat
    const kindEink = kids + young > 0 ? num(inp.kindEink) : 0;
    // Unterhaltsvorschuss, den die Kinder bekommen würden (zählt als ihr Einkommen): nur Alleinerziehende, wenn Unterhalt fehlt.
    // Ab 12 Jahren nur mit eigenem Einkommen des Elternteils von mindestens 600 € (oder ohne Grundsicherung), daher dann ohne die Älteren.
    let uvgEst = 0;
    if (adults === 1 && kids > 0 && inp.unterhaltFehlt) {
      const mitte = kids - kidsU6 - kids14;
      const ab12raus = !!inp.kinder12 && brutto < R.uvg.min12;
      uvgEst = Math.max(0, kidsU6 * R.uvg.bis5 + mitte * R.uvg.bis11 + (ab12raus ? 0 : kids14 * R.uvg.bis17) - unterhalt);
    }
    // Mehrbedarf für Alleinerziehende: 36 % bei einem Kind unter 7 oder 2-3 Kindern unter 16, sonst 12 % je Kind, höchstens 60 %
    let mehrAE = 0;
    if (adults === 1 && kids > 0) {
      const unter16 = kids - kids14; // sicher unter 16 (14- bis 17-Jährige ungewiss)
      let p = R.mehr.aeJeKind * kids;
      if (kidsU6 >= 1 || (unter16 >= 2 && unter16 <= 3)) p = Math.max(p, R.mehr.ae36);
      mehrAE = Math.min(p, R.mehr.aeMax) * R.regelbedarf.alleinstehend;
    }
    // Regelaltersgrenze aus dem Geburtsjahr der ältesten erwachsenen Person: sicher erreicht, oder je nach Geburtsmonat (grenz)
    const jahr = Number(inp.gebJahr) | 0;
    const heute = inp.heute ? Number(inp.heute) : (new Date().getFullYear() + new Date().getMonth() / 12);
    let alter = !!inp.alter, alterGrenz = false, gruppe = R.sgb2.schon.hasOwnProperty(inp.alterGruppe || '') ? (inp.alterGruppe || '') : '';
    if (jahr >= 1900 && jahr <= 2010) {
      const ragJahre = jahr < 1947 ? 65 : jahr >= 1964 ? 67 : 65 + R.rag[jahr] / 12;
      // geboren im Dezember: Grenze erst am Ende des Jahres jahr + rag erreicht; im Januar: am Anfang
      alter = jahr + 1 + ragJahre <= heute;
      alterGrenz = !alter && jahr + ragJahre <= heute;
      const age = heute - jahr - 0.5;
      gruppe = age < 31 ? '<31' : age < 41 ? '31-40' : age < 51 ? '41-50' : '51+';
    }
    return {
      art1, art2, pers, liste: !!liste, kindEink, uvgEst, kindZahl: unterhalt + uvgEst, mehrAE, alterGrenz,
      egFreiWG: sumIf((a, b) => a === 'eg' ? Math.min(R.elterngeldFrei, b) : 0),
      egFreiSGB: sumIf((a, b) => a === 'eg' && b > R.elterngeldFrei ? R.elterngeldFrei : 0),
      vPausch: sumIf((a, b) => a !== 'lohn' && a !== 'ohne' && b > 0 ? R.versPauschale : 0),
      mzG: !!inp.mzG, mzRF: !!(inp.mz && inp.mz.RF), wfbmJahre: num(inp.wfbmJahre), grundrente33: !!inp.grundrente33, bhEinkHoch: !!inp.bhEinkHoch,
      wohnform: inp.wohnform === 'eltern' || inp.wohnform === 'heim' ? inp.wohnform : '', wfbmEssen: !!inp.wfbmEssen,
      mieteGegeben: !blank(inp.miete) && num(inp.miete) > 0,
      arbeitSit: inp.arbeitSit === 'arbeitslos' || inp.arbeitSit === 'krank' ? inp.arbeitSit : '',
      algZeit: !!inp.algZeit, algMonate: [12, 16, 20, 24, 30, 36, 48].indexOf(Number(inp.algMonate)) >= 0 ? Number(inp.algMonate) : 0,
      krankWochen: ['unter6', 'laeuft', 'ende'].indexOf(inp.krankWochen) >= 0 ? inp.krankWochen : '',
      lohnVorher: num(inp.lohnVorher), alterJahre: jahr >= 1900 && jahr <= 2010 ? heute - jahr - 0.5 : 0,
      fehlt: { einkommen: !liste && blank(inp.brutto), netto: !liste && blank(inp.netto), vermoegen: blank(inp.vermoegen), miete: blank(inp.miete) && inp.wohnform !== 'heim' && inp.wohnform !== 'eltern' },
      adults, kids, kidsU6, kids14, young, persons, brutto, brutto2, erwerb: pers[0][0] === 'lohn' || (liste ? liste.some((x) => x[0] === 'lohn') : false), erwerb2: art2 === 'lohn', netto, nettoGiven, miete, vermoegen, unterhalt, regel, regelElt,
      children: kids + young,
      alleinerz: adults === 1 && kids > 0,
      stufe: [1, 2, 3, 4, 5, 6, 7].indexOf(Number(inp.mietstufe)) >= 0 ? Number(inp.mietstufe) : null,
      alter,
      // WfbM-Arbeitsbereich gilt als voll erwerbsgemindert (BA-Weisung § 8 SGB II Rz. 8.8-8.10a) -> Sozialamt statt Jobcenter
      erwerbsgemindert: !!inp.erwerbsgemindert || inp.emStd === 'unter3' || !!inp.wfbm || pers.some((x) => x[0] === 'wfbm'),
      behinderung: !!inp.behinderung || String(inp.gdb) === '100',
      kinder12: !!inp.kinder12,
      unterhaltFehlt: !!inp.unterhaltFehlt,
      ausbildung: ['kind', 'kindBetrieb', 'ich'].indexOf(inp.ausbildung) >= 0 ? inp.ausbildung : '',
      gruppe,
      pflegegrad: pg,
      pflegeAntrag: inp.pflegegrad === 'antrag',
      bezug: inp.bezug || {},
      // Behinderung
      bhPerson: ['minder', 'erwVor25', 'erwNach25'].indexOf(inp.bhPerson) >= 0 ? inp.bhPerson : '',
      gdb: R.beh.pausch.hasOwnProperty(String(inp.gdb || '')) ? String(inp.gdb) : '',
      gdbAntrag: inp.gdb === 'antrag',
      blind: inp.blind === 'blind' || inp.blind === 'hoch' ? inp.blind : '',
      // Bundesland als Kürzel (BY, BW, ...); leer = unbekannt. Blindengeld und WBS-Grenzen der App gelten nur für Bayern.
      land: /^(BW|BY|BE|BB|HB|HH|HE|MV|NI|NW|RP|SL|SN|ST|SH|TH)$/.test(inp.bundesland) ? inp.bundesland : '',
      emStd: inp.emStd === 'unter3' || inp.emStd === '3bis6' || inp.emStd === 'unklar' ? inp.emStd : '',
      em5: !!inp.em5, wfbm: !!inp.wfbm, bhSelbst: !!inp.bhSelbst,
      babBetrieb: !!inp.babBetrieb, babWohnt: !!inp.babWohnt
    };
  }

  // Freibetrag auf Erwerbseinkommen beim Grundsicherungsgeld (§ 11b SGB II) für EINE Person:
  // 100 € frei, 20 % von 100 bis 520 €, 30 % von 520 bis 1.000 €, 10 % von 1.000 bis 1.200 €
  // (bis 1.500 €, wenn ein minderjähriges Kind im Haushalt lebt).
  function sgb2Freibetrag(b, mitKindern) {
    const cap = mitKindern ? 1500 : 1200;
    let f = Math.min(b, 100);
    if (b > 100) f += 0.2 * (Math.min(b, 520) - 100);
    if (b > 520) f += 0.3 * (Math.min(b, 1000) - 520);
    if (b > 1000) f += 0.1 * (Math.min(b, cap) - 1000);
    return f;
  }

  // Unterhalt für Kinder bei Grundsicherungsgeld / Grundsicherung im Alter: Einkommen des Kindes, aber nur bis zu dessen
  // eigenem Bedarf (Regelbedarf der Kinder plus Kopfanteil der Miete); ein Überschuss mindert nicht den Bedarf der Eltern
  // (§ 11 Abs. 1 SGB II, § 82 SGB XII). Das Kindergeld wird wie bisher voll beim Kind angerechnet.
  // Einkommen der Kinder: Unterhalt, Unterhaltsvorschuss und eigenes Einkommen (Ausbildungsvergütung bis zur Minijob-Grenze frei).
  function unterhaltAnrechenbar(h) {
    const eink = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - R.minijob);
    if (!eink) return 0;
    const kinderBedarf = (h.regel - h.regelElt) + h.miete * h.children / h.persons;
    return Math.min(eink, Math.max(0, kinderBedarf - h.children * R.kindergeld));
  }
  // Einkommen der Eltern nach Abzügen (§ 11b SGB II): Freibetrag für Arbeit, Versicherungspauschale, Elterngeld-Freibetrag
  const elternEinkSGB2 = (h) => Math.max(0, h.netto - haushaltsFreibetrag(h) - (h.egFreiSGB || 0) - (h.vPausch || 0));
  // Grobe Schätzung als Betrag, auf 10 € gerundet
  const r10 = (x) => Math.round(x / 10) * 10;

  // Freibetrag des Haushalts: je Person einzeln, nur bei Einkommen aus Arbeit
  // Der Freibetrag gilt je Person und nur für Einkommen aus Arbeit (§ 11b Abs. 3 SGB II), nicht für Rente,
  // Arbeitslosengeld I oder Krankengeld. erwerb: erste Person (bei Alleinstehenden der ganze Haushalt), erwerb2: zweite Person.
  function haushaltsFreibetrag(h) {
    const mk_ = h.kids > 0;
    // Einfache Version: nur der Lohn zählt für den Freibetrag (nicht Rente oder Werkstattlohn derselben Person)
    const b1 = h.liste ? h.pers.filter((x) => x[0] === 'lohn').reduce((a, x) => a + x[1], 0) : h.brutto - h.brutto2;
    const f1 = h.erwerb ? sgb2Freibetrag(b1, mk_) : 0;
    const f2 = h.adults === 2 && h.erwerb2 ? sgb2Freibetrag(h.brutto2, mk_) : 0;
    return f1 + f2;
  }

  // ---------------------------------------------------------------
  // Kindergeld
  // ---------------------------------------------------------------
  function kindergeld(h) {
    const id = 'kindergeld';
    if (h.children === 0) return mk(id, 'nein', 'keinKind', [['kindergeld.keinKind']]);
    if (h.bezug.kindergeld) return mk(id, 'na', 'na', [['kindergeld.na']]);
    return mk(id, 'ja', 'ja', [['kindergeld.ja', { kg: eur(R.kindergeld) }]]);
  }

  // ---------------------------------------------------------------
  // Wohngeld
  // ---------------------------------------------------------------
  function wohngeld(h) {
    const id = 'wohngeld';
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['wohngeld.ausschluss']]);
    if (h.bezug.wohngeld) return mk(id, 'na', 'na', [['wohngeld.na']]);
    // Bei den Eltern: Wohngeld gibt es nur für den ganzen Haushalt (Antrag der Eltern); im Wohnheim geht die Grundsicherung vor
    if (h.wohnform) return mk(id, 'nein', 'vorausFehlt', [['wohngeld.' + h.wohnform]]);
    const vermLimit = R.wohngeld.vermoegenErste + R.wohngeld.vermoegenJeWeitere * (h.persons - 1);
    if (h.vermoegen > vermLimit) return mk(id, 'nein', 'vermHoch', [['wohngeld.verm', { n: h.persons, limit: eur(vermLimit) }]]);

    // § 20 Abs. 2 WoGG: kein Wohngeld, wenn allen Haushaltsmitgliedern BAföG oder BAB dem Grunde nach zusteht
    if (h.ausbildung === 'ich' && h.adults === 1 && h.children === 0 && (!h.babBetrieb || h.babWohnt) && (h.gruppe === '' || h.gruppe === '<31' || h.gruppe === '31-40')) {
      return mk(id, 'nein', 'ausschluss', [['wohngeld.ausbildung']]);
    }
    if (h.miete <= 0) return mk(id, 'nein', 'vorausFehlt', [['wohngeld.keineMiete']]);

    const stufen = h.stufe ? [h.stufe, h.stufe] : [1, 7];
    // Höchstes Einkommen Y (nach Pauschalabzug und Freibeträgen) mit der tatsächlichen Miete (Formel § 19 WoGG):
    // vorsichtig für "wahrscheinlich" mit 90 % der Bruttokaltmiete, für "möglich" mit 100 %
    const yMaxLo = wgYmax(h.persons, wgMiete(stufen[0], h.persons, h.miete, 0.9));
    const yMaxHi = wgYmax(h.persons, wgMiete(stufen[1], h.persons, h.miete, 1));
    // Pauschalabzug je Person und Einkommensart (§ 16 WoGG): Lohn 10-30 %, Rente und Krankengeld 10-20 %, ALG I und Elterngeld 0 %
    const pers = h.pers || [['lohn', h.brutto]];
    let sumB = 0, yA = 0, yB = 0;
    // Nur der ausgezahlte Betrag bekannt: Steuern und Beiträge sind schon abgezogen, das Brutto nach § 16-Abzug liegt nahe daran
    pers.forEach(function (x) { const ab = (x[3] ? R.wgAbzugAuszahlung[x[0]] : R.wgAbzug[x[0]]) || R.wgAbzug.lohn; sumB += x[1]; yA += x[1] * (1 - ab[0]); yB += x[1] * (1 - ab[1]); });
    const wA = sumB > 0 ? yA / sumB : 0.9, wB = sumB > 0 ? yB / sumB : 0.7;
    // Anzeige als Grenze für das Brutto (bzw. den ausgezahlten Betrag bei ALG I und Elterngeld)
    const lo = yMaxLo / wA, hi = yMaxHi / wB;

    let freib = 0;
    // § 17 Nr. 1 WoGG: 1.800 €/Jahr je schwerbehindertem Haushaltsmitglied mit GdB 100, oder GdB unter 100 (ab 50) bei Pflegebedürftigkeit
    // (nicht bei vollstationärer Pflege). Pflegegrad allein ohne Schwerbehinderung gibt den Freibetrag nicht. Die App kennt nur eine Person mit Behinderung.
    if (gdbNum(h) === 100 || (gdbNum(h) >= 50 && h.pflegegrad > 0)) freib += R.wohngeld.freibetragBehinderungMonat;
    if (h.alleinerz) freib += R.wohngeld.freibetragAlleinerzMonat; // § 17 Nr. 3 WoGG: 1.320 € im Jahr, einmal je Haushalt
    // Unterhalt und Unterhaltsvorschuss der Kinder zählen als Einkommen (§ 14 WoGG), ohne Pauschalabzug; eigenes Einkommen
    // der Kinder mit Freibetrag (§ 17 Nr. 4 WoGG); Elterngeld bis 300 € frei (§ 10 Abs. 1 BEEG); Freibeträge nach § 17 WoGG.
    const extra = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - R.wgKindFrei) - (h.egFreiWG || 0) - freib;
    const yPess = Math.max(0, yA + extra), yOpt = Math.max(0, yB + extra);

    const grenze = h.stufe
      ? ['wohngeld.grenzeStufe', { n: h.persons, stufe: roman(h.stufe), lo: eur(lo), hi: eur(hi) }]
      : ['wohngeld.grenzeOhne', { n: h.persons, lo: eur(lo), hi: eur(hi) }];
    const unb = h.stufe ? [] : [['wohngeld.stufeUnbekannt']];

    if (yOpt > yMaxHi) return mk(id, 'nein', 'einkoHoch', [['wohngeld.hoch'], grenze].concat(unb));

    let level = yPess <= yMaxLo ? 'ja' : 'vielleicht';
    let hl = level;
    let tx = [[level === 'ja' ? 'wohngeld.ja' : 'wohngeld.vielleicht'], grenze].concat(unb);
    // Grobe Höhe (nur mit bekannter Mietenstufe): Formel § 19 WoGG mit dem Einkommen bei kleinem und großem Abzug
    if (h.stufe) {
      const M = wgMiete(h.stufe, h.persons, h.miete, 1);
      const a = Math.max(0, r10(wgBetrag(h.persons, M, yPess))), b = Math.max(0, r10(wgBetrag(h.persons, M, yOpt)));
      if (b >= 10) tx.push(a >= 10 && a < b ? ['schaetz.spanne', { a: eur(a), b: eur(b) }] : a >= 10 ? ['schaetz.eins', { a: eur(a) }] : ['schaetz.bis', { b: eur(b) }]);
    }

    const mittel = h.netto + h.kids * R.kindergeld + (h.kindZahl || 0) + (h.kindEink || 0);
    const mindest = R.wohngeld.mindestAnteil * (h.regel + h.miete + (h.mehrAE || 0));
    if (h.miete > 0 && mittel < mindest) {
      level = 'vielleicht'; hl = 'einkoNiedrig';
      const schonGS = (h.alter || h.erwerbsgemindert)
        ? R.grundsicherung.schonAllein * h.adults + 500 * h.children
        : R.sgb2.schon[h.gruppe] * h.adults + R.sgb2.schon['<31'] * h.children;
      tx = [[h.vermoegen > schonGS ? 'wohngeld.zuNiedrigVerm' : 'wohngeld.zuNiedrig'], grenze];
    }
    return mk(id, level, hl, tx);
  }

  // ---------------------------------------------------------------
  // Kinderzuschlag
  // ---------------------------------------------------------------
  function kinderzuschlag(h) {
    const id = 'kiz';
    if (h.children === 0) return mk(id, 'nein', 'keinKind', [['kiz.keinKind']]);
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['kiz.ausschluss']]);
    if (h.bezug.kiz) return mk(id, 'na', 'na', [['kiz.na']]);
    const vermGrenze = h.persons <= 2 ? R.kiz.vermZwei : R.kiz.vermDrei + R.kiz.vermJeWeiteres * (h.persons - 3);
    if (h.vermoegen > vermGrenze) return mk(id, 'nein', 'vermHoch', [['kiz.verm', { n: h.persons, limit: eur(vermGrenze) }]]);
    const minEink = h.adults === 2 ? R.kiz.minPaar : R.kiz.minAlleinerziehend;
    if (h.brutto < minEink) return mk(id, 'nein', 'minEink', [['kiz.minEink', { min: eur(minEink) }]]);

    const gmax = R.kiz.max * h.children;
    const gewicht = h.adults === 1 ? R.kiz.gewichtKindAllein : R.kiz.gewichtKindPaar;
    const elternAnteil = h.adults / (h.adults + gewicht * h.children);
    const bemessung = h.regelElt + (h.mehrAE || 0) + h.miete * elternAnteil;
    // Einkommen der Eltern nach § 11b SGB II (Freibetrag für Arbeit usw.); Einkommen der Kinder (Unterhalt, Unterhaltsvorschuss,
    // eigenes Einkommen über der Minijob-Grenze) mindert den Kinderzuschlag um 45 % (§ 6a Abs. 3 und 6 BKGG)
    const kindAnr = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - R.minijob);
    const est = Math.max(0, gmax - R.kiz.anrechnung * Math.max(0, elternEinkSGB2(h) - bemessung) - R.kiz.anrechnung * kindAnr);
    const gesamtBedarf = h.regel + h.miete + (h.mehrAE || 0);

    if (est <= 0) return mk(id, 'nein', 'einkoHoch', [['kiz.zuHoch']]);
    if (h.netto + (h.kindZahl || 0) + (h.kindEink || 0) + gmax + R.kiz.puffer < gesamtBedarf) return mk(id, 'vielleicht', 'einkoNiedrig', [['kiz.zuNiedrig']]);
    const sch = ['schaetz.eins', { a: eur(Math.max(10, r10(est))) }];
    if (est >= R.kiz.ampelGruenAb) return mk(id, 'ja', 'ja', [['kiz.ja', { max: eur(R.kiz.max) }], sch]);
    return mk(id, 'vielleicht', 'vielleicht', [['kiz.rand', { max: eur(R.kiz.max) }], sch]);
  }

  // ---------------------------------------------------------------
  // Grundsicherungsgeld (SGB II, ehemals Bürgergeld)
  // ---------------------------------------------------------------
  function bedarfTx(level, bedarf) {
    return [[level === 'ja' ? 'bedarfJa' : level === 'vielleicht' ? 'bedarfRand' : 'bedarfNein', { bedarf: eur(bedarf) }]];
  }

  function grundsicherungsgeld(h) {
    const id = 'ggeld';
    if (h.alter || h.erwerbsgemindert) return mk(id, 'nein', 'andereStelle', [['ggeld.sozialamtZustaendig']]);
    if (h.bezug.grundsicherungsgeld) return mk(id, 'na', 'na', [['ggeld.na']]);
    if (h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['ggeld.sozialamt']]);
    // § 7 Abs. 5 SGB II: Schule/Studium, die nach BAföG förderfähig sind, schließen Grundsicherungsgeld in der Regel aus
    // (betriebliche Ausbildung mit Berufsausbildungsbeihilfe: aufstockend möglich). Nicht mehr förderfähig: ab 41 Jahren offen.
    if (h.ausbildung === 'ich' && !h.babBetrieb && (h.gruppe === '' || h.gruppe === '<31' || h.gruppe === '31-40')) {
      return mk(id, 'nein', 'ausschluss', [['ggeld.ausbildung']]);
    }
    // § 12 Abs. 2 SGB II: je Person der Bedarfsgemeinschaft ein Freibetrag nach Alter; Kinder und junge Erwachsene bis 30: 5.000 €
    const schon = R.sgb2.schon[h.gruppe] * h.adults + R.sgb2.schon['<31'] * h.children;
    if (h.vermoegen > schon) return mk(id, 'nein', 'vermHoch', [['ggeld.verm', { schon: eur(schon) }]]);
    const einkommen = elternEinkSGB2(h) + h.children * R.kindergeld + unterhaltAnrechenbar(h);
    const bedarf = h.regel + h.miete + (h.mehrAE || 0);
    const luecke = bedarf - einkommen;
    if (luecke >= R.grundsicherung.sicherAb) return mk(id, 'ja', 'ja', bedarfTx('ja', bedarf).concat([['schaetz.eins', { a: eur(r10(luecke)) }]]));
    if (luecke > -R.grundsicherung.knappPuffer) return mk(id, 'vielleicht', 'vielleicht', bedarfTx('vielleicht', bedarf));
    return mk(id, 'nein', 'einkoHoch', bedarfTx('nein', bedarf));
  }

  // ---------------------------------------------------------------
  // Bildung und Teilhabe
  // ---------------------------------------------------------------
  function bildungTeilhabe(h, wg, kz, gg) {
    const id = 'but';
    if (h.children === 0) return mk(id, 'nein', 'keinKind', [['but.keinKind']]);
    // § 28 Abs. 1 SGB II: junge Erwachsene nur, solange sie zur Schule gehen und keine Ausbildungsvergütung bekommen
    if (h.kids === 0 && (h.ausbildung === 'kindBetrieb' || h.kindEink > 0)) return mk(id, 'nein', 'vorausFehlt', [['but.azubi']]);
    const inhalt = h.young === 0 && h.kids > 0 && h.kidsU6 === h.kids ? ['but.inhaltKlein', { teil: eur(R.but.teilhabeMonat) }] : ['but.inhalt', { schul: eur(R.but.schulbedarf), teil: eur(R.but.teilhabeMonat) }];
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt || h.bezug.kiz || h.bezug.wohngeld) {
      return mk(id, 'ja', 'ja', [['but.bezug'], inhalt]);
    }
    if (wg.level === 'ja' || kz.level === 'ja' || gg.level === 'ja') return mk(id, 'ja', 'butFolgt', [['but.folgt'], inhalt]);
    if (wg.level === 'vielleicht' || kz.level === 'vielleicht' || gg.level === 'vielleicht') {
      return mk(id, 'vielleicht', 'butMoeglich', [['but.moeglich'], inhalt]);
    }
    return mk(id, 'nein', 'vorausFehlt', [['but.fehlt']]);
  }

  // ---------------------------------------------------------------
  // Unterhaltsvorschuss
  // ---------------------------------------------------------------
  function unterhaltsvorschuss(h) {
    const id = 'uvg';
    if (h.kids === 0) return mk(id, 'nein', 'keinKind', [['uvg.keinKind']]);
    if (!h.unterhaltFehlt) return mk(id, 'nein', 'vorausFehlt', [['uvg.unterhalt']]);
    const betrag = ['uvg.ja', { a: eur(R.uvg.bis5), b: eur(R.uvg.bis11), c: eur(R.uvg.bis17) }];
    // Gezahlter Unterhalt wird angerechnet (§ 2 Abs. 3 UVG). Erreicht er den höchsten Unterhaltsvorschuss für alle Kinder,
    // bleibt nichts übrig; sonst nur noch der Unterschied (Alter der Kinder unbekannt, daher "möglich").
    if (h.unterhalt > 0) {
      if (h.unterhalt >= h.kids * R.uvg.bis17) return mk(id, 'nein', 'vorausFehlt', [['uvg.genug', { u: eur(h.unterhalt) }]]);
      return mk(id, 'vielleicht', 'vielleicht', [['uvg.teil', { u: eur(h.unterhalt) }], betrag]);
    }
    if (h.adults === 2) return mk(id, 'vielleicht', 'vielleicht', [['uvg.zwei'], betrag]);
    if (h.kinder12 && h.brutto < R.uvg.min12) return mk(id, 'vielleicht', 'vielleicht', [['uvg.ab12', { min: eur(R.uvg.min12) }], betrag]);
    return mk(id, 'ja', 'ja', [betrag]);
  }

  // ---------------------------------------------------------------
  // Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)
  // ---------------------------------------------------------------
  // Einkommen für die Grundsicherung nach dem SGB XII je Einkommen der Person(en) (§ 82 SGB XII)
  function gsaEinkommen(h) {
    const pers = h.pers || [['lohn', h.brutto]];
    const sumB = pers.reduce((a, x) => a + x[1], 0);
    const rs1 = R.regelbedarf.alleinstehend;
    return pers.reduce((a, x) => {
      const art = x[0], b = x[1];
      // Netto dieses Einkommens: in der ausführlichen Version anteilig aus dem Haushaltsnetto
      const n = h.liste ? x[2] : sumB > 0 ? h.netto * b / sumB : h.netto / pers.length;
      if (art === 'wfbm') {
        const e = Math.max(0, n - R.wfbm.afoeg);
        const frei = Math.min(e, R.wfbm.achtel * rs1 + R.wfbm.rest * Math.max(0, e - R.wfbm.achtel * rs1));
        return a + e - frei;
      }
      if (art === 'lohn') return a + n - Math.min(R.gsaArbeit.quote * n, R.gsaArbeit.max * rs1);
      if (art === 'eg') return a + Math.max(0, n - (b > R.elterngeldFrei ? R.elterngeldFrei : 0));
      if (art === 'rente' && h.grundrente33) return a + n - Math.min(R.grundrente.sockel + R.grundrente.quote * Math.max(0, n - R.grundrente.sockel), R.grundrente.max * rs1);
      if (art === 'ohne') return a;
      return a + n;
    }, 0);
  }

  function grundsicherungAlter(h) {
    const id = 'gsa';
    if (!h.alter && !h.erwerbsgemindert && !h.alterGrenz) return mk(id, 'nein', 'vorausFehlt', [['gsa.voraus']]);
    if (h.bezug.sozialamt) return mk(id, 'na', 'na', [['gsa.na']]);
    if (h.bezug.grundsicherungsgeld) return mk(id, 'nein', 'schonGrund', [['gsa.ggBezug']]);
    // Barbetrag-Verordnung zu § 90 SGB XII: 10.000 € je volljähriger Person, 500 € je überwiegend unterhaltene Person
    const eigen = h.wohnform !== '';
    const schon = eigen ? R.grundsicherung.schonAllein : R.grundsicherung.schonAllein * h.adults + 500 * h.children;
    if (h.vermoegen > schon) return mk(id, 'nein', 'vermHoch', [['gsa.verm', { schon: eur(schon) }]]);
    // Bei den Eltern oder im Wohnheim zählt nur der eigene Bedarf der Person (keine Einsatzgemeinschaft mit den Eltern; § 43 Abs. 5 SGB XII:
    // Einkommen der Eltern erst ab 100.000 € im Jahr). Regelbedarfsstufe 1 bei den Eltern, Stufe 2 im Wohnheim.
    const regelP = h.wohnform === 'heim' ? R.regelbedarf.partner : (h.adults === 2 && !eigen ? R.regelbedarf.partner : R.regelbedarf.alleinstehend);
    // Mehrbedarf Merkzeichen G (§ 30 Abs. 1 SGB XII): 17 % des Regelsatzes der Person
    const mehrG = h.mzG ? R.mehr.g * regelP : 0;
    let bedarf, kduOffen = 0;
    if (h.wohnform === 'eltern') { bedarf = regelP + (h.mieteGegeben ? h.miete : 0) + mehrG; if (!h.mieteGegeben) kduOffen = R.offen.elternKdu; }
    else if (h.wohnform === 'heim') { bedarf = regelP + mehrG; kduOffen = R.offen.heimKdu; }
    else bedarf = h.regel + h.miete + (h.mehrAE || 0) + mehrG;
    const offen = kduOffen + (h.wfbmEssen ? R.offen.essen : 0);
    const eink = gsaEinkommen(h) + (eigen ? 0 : h.children * R.kindergeld + unterhaltAnrechenbar(h));
    const luecke = bedarf - eink;
    const hatRente = (h.pers || []).some((x) => x[0] === 'rente' && x[1] > 0);
    const extra = (h.alterGrenz ? [['gsa.grenz']] : []).concat(h.wfbmEssen ? [['gsa.essen']] : [], kduOffen ? [[h.wohnform === 'heim' ? 'gsa.heim' : 'gsa.eltern']] : [],
      hatRente && !h.grundrente33 ? [['gsa.grundrente']] : []);
    const ja = !h.alterGrenz;
    if (luecke >= R.grundsicherung.sicherAb) {
      const sch = offen ? ['schaetz.mind', { a: eur(r10(luecke)) }] : ['schaetz.eins', { a: eur(r10(luecke)) }];
      return mk(id, ja ? 'ja' : 'vielleicht', ja ? 'ja' : 'vielleicht', bedarfTx('ja', bedarf).concat([sch], extra));
    }
    if (luecke > -(R.grundsicherung.knappPuffer + offen)) return mk(id, 'vielleicht', 'vielleicht', bedarfTx('vielleicht', bedarf).concat(extra));
    return mk(id, 'nein', 'einkoHoch', bedarfTx('nein', bedarf));
  }

  // ---------------------------------------------------------------
  // BAföG
  // ---------------------------------------------------------------
  function bafoeg(h) {
    const id = 'bafoeg';
    if (!h.ausbildung) return mk(id, 'nein', 'vorausFehlt', [['bafoeg.keine']]);
    if (h.ausbildung === 'kindBetrieb') return mk(id, 'nein', 'vorausFehlt', [['bafoeg.betrieb']]);
    if (h.ausbildung === 'kind') {
      if (h.children === 0) return mk(id, 'nein', 'vorausFehlt', [['bafoeg.keinKind']]);
      const fb = (h.adults === 2 ? R.bafoeg.freiPaar : R.bafoeg.freiAllein) + Math.max(0, h.children - 1) * R.bafoeg.jeKind;
      const p = { fb: eur(fb) };
      if (h.netto <= fb) return mk(id, 'ja', 'ja', [['bafoeg.kindJa', p]]);
      if (h.netto <= fb + R.bafoeg.spanne) return mk(id, 'vielleicht', 'vielleicht', [['bafoeg.kindRand', p]]);
      return mk(id, 'nein', 'einkoHoch', [['bafoeg.kindNein', p]]);
    }
    // ich selbst: Elterneinkommen unbekannt
    if (h.gruppe === '51+' || h.gruppe === '41-50') {
      return mk(id, h.gruppe === '51+' ? 'nein' : 'vielleicht', h.gruppe === '51+' ? 'vorausFehlt' : 'vielleicht', [['bafoeg.alter']]);
    }
    const vermGrenze = h.gruppe === '<31' ? R.bafoeg.vermBis29 : R.bafoeg.vermAb30;
    if (h.vermoegen > vermGrenze) return mk(id, 'nein', 'vermHoch', [['bafoeg.vermHoch', { verm: eur(vermGrenze) }]]);
    return mk(id, 'vielleicht', 'vielleicht', [['bafoeg.ich']]);
  }

  // ---------------------------------------------------------------
  // Pflegegeld und Entlastungsbetrag
  // ---------------------------------------------------------------
  function pflege(h) {
    const id = 'pflege';
    if (h.pflegeAntrag) return mk(id, 'vielleicht', 'vielleicht', [['pflege.antrag']]);
    if (h.pflegegrad === 0) return mk(id, 'nein', 'vorausFehlt', [['pflege.keiner']]);
    if (h.pflegegrad === 1) return mk(id, 'ja', 'ja', [['pflege.pg1', { ent: eur(R.pflege.entlastung) }]]);
    return mk(id, 'ja', 'ja', [['pflege.pg2', { geld: eur(R.pflege.geld[h.pflegegrad]), pg: h.pflegegrad, ent: eur(R.pflege.entlastung) }]]);
  }

  // ---------------------------------------------------------------
  // Menschen mit Behinderung, Rente, Ausbildung, Wohnen (neue Karten)
  // ---------------------------------------------------------------
  const gdbEff = (h) => h.gdb || (h.behinderung ? '100' : '');
  const gdbNum = (h) => { const g = gdbEff(h); return g === 'H' ? 100 : g ? Number(g) : 0; };
  const hatBeh = (h) => !!(h.bhPerson || gdbEff(h) || h.gdbAntrag || h.erwerbsgemindert || h.pflegegrad > 0 || h.pflegeAntrag || h.blind || h.wfbm);
  const keinBeh = (id) => mk(id, 'nein', 'keinBeh', [[id + '.keine']]);

  // Kindergeld für volljährige Kinder mit Behinderung (§ 32 Abs. 4 Satz 1 Nr. 3 EStG)
  function kindergeldBeh(h) {
    const id = 'kgBeh';
    if (h.bhPerson === 'erwNach25') return mk(id, 'nein', 'vorausFehlt', [['kgBeh.nach25']]);
    if (h.bhPerson !== 'erwVor25') return keinBeh(id);
    if (h.bezug.kindergeld) return mk(id, 'na', 'na', [['kgBeh.na']]);
    if (h.bhEinkHoch) return mk(id, 'nein', 'einkoHoch', [['kgBeh.hoch', { gfb: eur(R.beh.grundfreibetrag) }]]);
    if (h.bhSelbst) return mk(id, 'ja', 'ja', [['kgBeh.ja', { kg: eur(R.kindergeld) }]]);
    return mk(id, 'vielleicht', 'vielleicht', [['kgBeh.pruefen', { gfb: eur(R.beh.grundfreibetrag) }]]);
  }

  // Erwerbsminderungsrente (§ 43 SGB VI; Quelle: Deutsche Rentenversicherung)
  function erwerbsminderungsrente(h) {
    const id = 'emrente';
    if (h.alter) return mk(id, 'nein', 'vorausFehlt', [['emrente.alter']]);
    if (h.bezug.emrente) return mk(id, 'na', 'na', [['emrente.na']]);
    // Werkstatt: gilt als voll erwerbsgemindert; Rente nach 20 Jahren Wartezeit (§ 43 Abs. 6 SGB VI), sonst wie üblich
    if (!h.emStd && h.wfbm) return h.wfbmJahre >= 20 ? mk(id, 'ja', 'ja', [['emrente.wfbm20']]) : mk(id, 'vielleicht', 'vielleicht', [['emrente.werkstatt']]);
    if (!h.emStd && h.arbeitSit === 'krank' && h.krankWochen && h.krankWochen !== 'unter6') return mk(id, 'vielleicht', 'vielleicht', [['emrente.unklar']]);
    if (!h.emStd) return mk(id, 'nein', 'vorausFehlt', [['emrente.keine']]);
    if (h.emStd === 'unklar') return mk(id, 'vielleicht', 'vielleicht', [['emrente.unklar']]);
    const art = h.emStd === 'unter3' ? 'emrente.voll' : 'emrente.teil';
    if (h.em5) return mk(id, 'ja', 'ja', [[art], ['emrente.ja']]);
    if (h.wfbm) return mk(id, 'vielleicht', 'vielleicht', [[art], ['emrente.werkstatt']]);
    return mk(id, 'vielleicht', 'vielleicht', [[art], ['emrente.warte']]);
  }

  // Netto grob als Anteil vom Brutto: 60 % (Steuerklasse V, hohe Abzüge) bis 72 %, bei kleinem Brutto (bis 2.000 €) bis 80 %
  const nettoSpanne = (b) => [R.alg.netto[0], b <= R.alg.kleinBis ? R.alg.nettoKlein : R.alg.netto[1]];

  // Arbeitslosengeld I (§§ 136 ff. SGB III)
  function alg1(h) {
    const id = 'alg1';
    const melden = ['alg1.melden'];
    if (h.art1 === 'alg' || (h.adults === 2 && h.art2 === 'alg')) return mk(id, 'na', 'na', [['alg1.na']]);
    // Krankengeld läuft aus: Arbeitslosengeld trotz eingeschränkter Leistungsfähigkeit (Nahtlosigkeit, § 145 SGB III)
    if (h.arbeitSit === 'krank' && h.krankWochen === 'ende') return mk(id, 'vielleicht', 'vielleicht', [['alg1.nahtlos'], melden]);
    if (h.arbeitSit !== 'arbeitslos') return mk(id, 'nein', 'vorausFehlt', [['alg1.keine']]);
    if (h.alter) return mk(id, 'nein', 'vorausFehlt', [['alg1.alter']]);
    if (!h.algZeit) return mk(id, 'vielleicht', 'vielleicht', [['alg1.zeit'], melden]);
    const p = h.children > 0 ? R.alg.satzKind : R.alg.satz;
    const tx = [['alg1.ja', { p: Math.round(p * 100) }]];
    if (h.algMonate) {
      const row = R.alg.dauer.find((r) => h.algMonate >= r[0] && h.alterJahre >= r[1]);
      tx.push(['alg1.dauer', { m: row[2] }]);
    } else tx.push(['alg1.dauerMin']);
    if (h.lohnVorher > 0) {
      const b = Math.min(h.lohnVorher, R.alg.bbg);
      const q = nettoSpanne(b);
      tx.push(['schaetz.spanne', { a: eur(r10(b * q[0] * p)), b: eur(r10(b * q[1] * p)) }]);
    }
    tx.push(melden);
    return mk(id, 'ja', 'ja', tx);
  }

  // Krankengeld (§§ 44 ff. SGB V)
  function krankengeld(h) {
    const id = 'krankengeld';
    if (h.art1 === 'kg' || (h.adults === 2 && h.art2 === 'kg')) return mk(id, 'na', 'na', [['krank.na'], ['krank.78']]);
    if (h.arbeitSit !== 'krank') return mk(id, 'nein', 'vorausFehlt', [['krank.keine']]);
    if (h.krankWochen === 'ende') return mk(id, 'nein', 'vorausFehlt', [['krank.ende']]);
    const tx = [[h.krankWochen === 'unter6' ? 'krank.lfz' : 'krank.ja']];
    if (h.lohnVorher > 0) {
      const b = Math.min(h.lohnVorher, R.krank.bbg);
      // Netto grob 60-72 % des Bruttos; Krankengeld = min(70 % brutto, 90 % netto), abzüglich der Beiträge
      const kgv = (q) => r10(Math.min(R.krank.satz * b, R.krank.nettoMax * b * q) * (1 - R.krank.abzug));
      const q = nettoSpanne(b);
      tx.push(['schaetz.spanne', { a: eur(kgv(q[0])), b: eur(kgv(q[1])) }]);
    }
    tx.push(['krank.78']);
    return mk(id, h.krankWochen === 'unter6' ? 'vielleicht' : 'ja', h.krankWochen === 'unter6' ? 'vielleicht' : 'ja', tx);
  }

  // Eingliederungshilfe (SGB IX Teil 2, bei seelischer Behinderung von Kindern § 35a SGB VIII)
  function eingliederungshilfe(h) {
    const id = 'eingl';
    if (!hatBeh(h)) return keinBeh(id);
    // nur Pflegebedürftigkeit im Rentenalter, ohne Hinweis auf Behinderung: hier nicht vorschlagen (dafür gibt es die Pflegekarten)
    if (h.alter && !h.bhPerson && !gdbEff(h) && !h.blind && !h.wfbm && !h.erwerbsgemindert) return keinBeh(id);
    if (h.bezug.eingl) return mk(id, 'na', 'na', [['eingl.na']]);
    if (h.bhPerson === 'minder') return mk(id, 'vielleicht', 'vielleicht', [['eingl.kind']]);
    return mk(id, 'vielleicht', 'vielleicht', [['eingl.erw']]);
  }

  // Behinderten-Pauschbetrag (§ 33b EStG)
  function pauschbetrag(h) {
    const id = 'pausch';
    const g = gdbEff(h);
    if (!g && h.gdbAntrag) return mk(id, 'vielleicht', 'vielleicht', [['pausch.laeuft']]);
    if (!g) return keinBeh(id);
    const tx = [['pausch.ja', { betrag: eur(R.beh.pausch[g]) }]];
    // Fahrtkostenpauschale (§ 33 Abs. 2a EStG): 900 € ab GdB 80 oder GdB 70 mit Merkzeichen G; 4.500 € bei aG, Bl, TBl oder H
    if (g === 'H') tx.push(['pausch.fahrt', { betrag: eur(4500) }]);
    else if (gdbNum(h) >= 80 || (gdbNum(h) >= 70 && h.mzG)) tx.push(['pausch.fahrt', { betrag: eur(900) }]);
    if (h.alter || h.netto * 12 < R.beh.grundfreibetrag) tx.push(['pausch.steuer']);
    if (h.bhPerson === 'minder' || h.bhPerson === 'erwVor25') tx.push(['pausch.kind']);
    return mk(id, 'ja', 'ja', tx);
  }

  // Schwerbehindertenausweis und Nachteilsausgleiche (§ 2 SGB IX, § 208 SGB IX)
  function ausweis(h) {
    const id = 'ausweis';
    const g = gdbNum(h);
    if (!gdbEff(h) && h.gdbAntrag) return mk(id, 'na', 'na', [['ausweis.laeuft']]);
    if (gdbEff(h) && g >= 50) return mk(id, 'ja', 'ja', [h.alter ? ['ausweis.schwerRente'] : ['ausweis.schwer', { tage: R.beh.zusatzurlaub }]].concat(h.mzG ? [['ausweis.g']] : []));
    if (gdbEff(h) && g >= 30) return mk(id, 'vielleicht', 'vielleicht', [['ausweis.gleich']]);
    if (gdbEff(h)) return mk(id, 'nein', 'vorausFehlt', [['ausweis.niedrig']]);
    if (hatBeh(h)) return mk(id, 'vielleicht', 'vielleicht', [['ausweis.antrag']]);
    return keinBeh(id);
  }

  // Landesblindengeld Bayern (Art. 1 BayBlindG; ZBFS, Stand 1.7.2026)
  function blindengeld(h) {
    const id = 'blindengeld';
    if (!h.blind) return keinBeh(id);
    if (h.land && h.land !== 'BY') return mk(id, 'na', 'land', [['land.blindengeld']]);
    const b = R.beh.blind;
    const tx = [[h.blind === 'blind' ? 'blindengeld.blind' : 'blindengeld.hoch', { betrag: eur2(h.blind === 'blind' ? b.blind : b.hoch), stand: b.stand }]];
    // Art. 4 Abs. 1 BayBlindG: Pflegegeld wird angerechnet, PG 2: 46 %, PG 3-5: 33 % des Pflegegeldes; Mindestzahlbetrag 20 € (Abs. 4)
    if (h.pflegegrad >= 2) {
      const grund = h.blind === 'blind' ? b.blind : b.hoch;
      const anrech = (h.pflegegrad === 2 ? 0.46 : 0.33) * R.pflege.geld[h.pflegegrad];
      const rest = Math.max(20, Math.round((grund - anrech) * 100) / 100);
      tx.push(['blindengeld.pflege', { pg: String(h.pflegegrad), kuerz: eur2(Math.round(anrech * 100) / 100), rest: eur2(rest) }]);
    }
    tx.push(['blindengeld.land']);
    return mk(id, 'ja', 'ja', tx);
  }

  // Verhinderungspflege, Pflegehilfsmittel, Wohnumfeld (SGB XI)
  function pflegeplus(h) {
    const id = 'pflegeplus';
    if (h.pflegeAntrag) return mk(id, 'vielleicht', 'vielleicht', [['pflegeplus.antrag']]);
    if (h.pflegegrad === 0) return mk(id, 'nein', 'vorausFehlt', [['pflegeplus.keiner']]);
    const tx = [['pflegeplus.mittel', { verbrauch: eur(R.beh.verbrauch), wohn: eur(R.beh.wohnumfeld) }]];
    if (h.pflegegrad >= 2) tx.push(['pflegeplus.verh']);
    return mk(id, 'ja', 'ja', tx);
  }

  // Budget für Arbeit (§ 61 SGB IX)
  function budgetArbeit(h) {
    const id = 'arbeit';
    if (!h.wfbm || h.alter) return mk(id, 'nein', 'vorausFehlt', [['arbeit.keine']]);
    return mk(id, 'vielleicht', 'vielleicht', [['arbeit.ja', { prozent: R.beh.budgetProzent }]]);
  }

  // Befreiung vom Rundfunkbeitrag
  function rundfunk(h, gg, gsa) {
    const res = rundfunk0(h, gg, gsa);
    res.tx.push(['rundfunk.mehr']);
    return res;
  }
  function rundfunk0(h, gg, gsa) {
    const id = 'rundfunk';
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'ja', 'ja', [['rundfunk.bezug']]);
    if (gg.level === 'ja' || gsa.level === 'ja') return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.folgt']]);
    if (gg.level === 'vielleicht' || gsa.level === 'vielleicht') return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.haerte']]);
    if (h.mzRF) return mk(id, 'vielleicht', 'vielleicht', [['rundfunk.rf']]);
    return mk(id, 'nein', 'vorausFehlt', [['rundfunk.nein']]);
  }

  // Befreiung von Zuzahlungen der Krankenkasse (§ 62 SGB V)
  function zuzahlung(h) {
    const id = 'zuzahl';
    if (!hatBeh(h)) return keinBeh(id);
    const tx = [['zuzahl.grenze']];
    if (gdbNum(h) >= 60) tx.push(['zuzahl.chron']);
    return mk(id, 'vielleicht', 'vielleicht', tx);
  }

  // Berufsausbildungsbeihilfe (§§ 56 ff. SGB III): nur Voraussetzungen, keine Berechnung
  function bab(h) {
    const id = 'bab';
    if (h.ausbildung === 'kindBetrieb') return mk(id, 'vielleicht', 'vielleicht', [['bab.kind']]);
    if (h.ausbildung !== 'ich' || !h.babBetrieb) return mk(id, 'nein', 'vorausFehlt', [['bab.keine']]);
    if (!h.babWohnt) return mk(id, 'nein', 'vorausFehlt', [['bab.wohnen']]);
    return mk(id, 'vielleicht', 'vielleicht', [['bab.ja']]);
  }

  // Wohnberechtigungsschein Bayern (Art. 11 BayWoFG): Jahres-Einkommensgrenze
  function wbsGrenze(h, hoechst) {
    const w = R.wbs;
    const ein = hoechst ? w.maxEin : w.ein, zwei = hoechst ? w.maxZwei : w.zwei, weitere = hoechst ? w.maxWeitere : w.weitere, kind = hoechst ? w.maxKind : w.kind;
    const basis = h.persons <= 1 ? ein : zwei + (h.persons - 2) * weitere;
    return basis + h.children * kind;
  }
  function wbs(h) {
    const id = 'wbs';
    if (h.land && h.land !== 'BY') return mk(id, 'na', 'land', [['land.wbs']]);
    const grenze = wbsGrenze(h, false), max = wbsGrenze(h, true);
    const jahr = (h.brutto + (h.kindEink || 0)) * 12;
    const frei = gdbNum(h) >= 50 ? R.wbs.schwerbFrei : 0;
    const netto = jahr * (1 - R.wbs.maxAbzug) - frei;
    if (jahr <= grenze) return mk(id, 'ja', 'ja', [['wbs.ja', { grenze: eur(grenze) }], ['wbs.abzug']]);
    if (netto <= grenze) return mk(id, 'vielleicht', 'vielleicht', [['wbs.rand', { grenze: eur(grenze) }], ['wbs.abzug']]);
    if (netto <= max) return mk(id, 'vielleicht', 'vielleicht', [['wbs.gebiet', { grenze: eur(grenze), max: eur(max) }], ['wbs.abzug']]);
    return mk(id, 'nein', 'einkoHoch', [['wbs.hoch', { grenze: eur(max) }]]);
  }

  // ---------------------------------------------------------------
  // Zusammenspiel
  // ---------------------------------------------------------------
  function zusammenspiel(h, r) {
    const out = [];
    const ok = (x) => !!x && (x.level === 'ja' || x.level === 'vielleicht');
    const g = (id) => r.find((x) => x.id === id);
    if (h.bezug.grundsicherungsgeld) out.push(['z.ggBezug']);
    if (ok(g('wohngeld')) && ok(g('kiz')) && g('wohngeld').hl !== 'einkoNiedrig' && g('kiz').hl !== 'einkoNiedrig') out.push(['z.wgKiz']);
    if (ok(g('gsa')) && ok(g('wohngeld'))) out.push(['z.gsaWg']);
    if (!h.bezug.grundsicherungsgeld && !h.bezug.sozialamt && ok(g('ggeld')) && (ok(g('wohngeld')) || ok(g('kiz')))) out.push(['z.ggVsWg']);
    if (g('kindergeld').level === 'ja' && ok(g('kiz'))) out.push(['z.kgZuerst']);
    if (r.some(ok)) out.push(['z.stichtag']);
    if (r.every((x) => x.level === 'nein' || x.level === 'na')) out.push(['z.keine']);
    return out;
  }

  // ---------------------------------------------------------------
  // Namen und Nächste Schritte (Schlüssel, Texte in den Sprachdateien)
  // ---------------------------------------------------------------
  const NAMES = {
    kindergeld: 'Kindergeld', wohngeld: 'Wohngeld', kiz: 'Kinderzuschlag', ggeld: 'Grundsicherungsgeld',
    but: 'Bildung und Teilhabe', uvg: 'Unterhaltsvorschuss', gsa: 'Grundsicherung im Alter und bei voller Erwerbsminderung',
    bafoeg: 'BAföG', pflege: 'Pflegegeld und Entlastungsbetrag',
    kgBeh: 'Kindergeld für erwachsene Kinder mit Behinderung', emrente: 'Erwerbsminderungsrente',
    eingl: 'Eingliederungshilfe', pausch: 'Behinderten-Pauschbetrag', ausweis: 'Schwerbehindertenausweis und Nachteilsausgleiche',
    blindengeld: 'Blindengeld (Bayern)', pflegeplus: 'Verhinderungspflege und Pflegehilfsmittel', arbeit: 'Budget für Arbeit',
    rundfunk: 'Befreiung vom Rundfunkbeitrag', zuzahl: 'Befreiung von Zuzahlungen', bab: 'Berufsausbildungsbeihilfe',
    wbs: 'Wohnberechtigungsschein (Bayern)', alg1: 'Arbeitslosengeld I', krankengeld: 'Krankengeld'
  };
  // Unterlagen der neuen Karten: gemeinsame Schlüssel (u.*), damit nicht jede Karte eigene Texte braucht
  const NEWSTEPS = {
    kgBeh: ['u.ausweis', 'u.arzt', 'u.steuerid'], emrente: ['u.ausweis', 'u.arzt', 'u.rentenverlauf'],
    eingl: ['u.ausweis', 'u.arzt', 'u.einkommen'], ausweis: ['u.ausweis', 'u.arzt', 'u.foto'],
    blindengeld: ['u.ausweis', 'u.arzt', 'u.bescheide'], pflegeplus: ['u.versichertenkarte', 'u.pflegebescheid', 'u.kosten'],
    arbeit: ['u.ausweis', 'u.arzt', 'u.vertrag'], rundfunk: ['u.beitragsnr', 'u.bescheide', 'u.ausweis'],
    zuzahl: ['u.versichertenkarte', 'u.quittungen', 'u.einkommen'], bab: ['u.ausbildungsvertrag', 'u.einkommen', 'u.mietvertrag'],
    wbs: ['u.einkommen', 'u.ausweis', 'u.haushalt'],
    alg1: ['u.ausweis', 'u.kuendigung', 'u.lohnabrechnung'], krankengeld: ['u.au', 'u.versichertenkarte', 'u.lohnabrechnung']
  };
  const STEPS = {};
  Object.keys(NAMES).forEach((id) => {
    STEPS[id] = { wo: 's.' + id + '.wo', u: NEWSTEPS[id] || ['s.' + id + '.u1', 's.' + id + '.u2', 's.' + id + '.u3'], tip: 's.' + id + '.tip' };
  });
  // Der Pauschbetrag wird in der Steuererklärung geltend gemacht, dazu gibt es keinen Antrag
  STEPS.pausch.u = ['u.steuererklaerung', 'u.ausweis', 'u.steuerid'];

  // Fehlende Angaben: Leistungen, die Einkommen, Vermögen oder Miete vergleichen, dürfen mit leeren Feldern kein „ja“ ergeben.
  // Nur positive Ergebnisse werden ersetzt; „nein“ aus anderen Gründen (z. B. falsche Zuständigkeit) und „na“ bleiben stehen.
  const BRAUCHT = {
    wohngeld: ['einkommen', 'vermoegen', 'miete'], kiz: ['einkommen', 'vermoegen', 'miete'], ggeld: ['einkommen', 'vermoegen', 'miete'],
    gsa: ['einkommen', 'vermoegen', 'miete'], but: ['einkommen'], bafoeg: ['einkommen'], wbs: ['einkommen'], rundfunk: ['einkommen']
  };
  // BAföG und Grundsicherung im Alter rechnen mit dem Nettoeinkommen: dort genügt eine Angabe zu Brutto ODER Netto
  const NUR_NETTO = { bafoeg: true, gsa: true };
  const angabeFehlt = (h) => (x) => {
    const fehlt = (k) => (k === 'einkommen' && NUR_NETTO[x.id] ? h.fehlt.einkommen && h.fehlt.netto : h.fehlt[k]);
    const need = (BRAUCHT[x.id] || []).filter(fehlt);
    // „nein“ nur wegen leerer Felder (Miete 0, Mindesteinkommen nicht erreicht) ist ebenfalls keine Aussage.
    // Ein eingetragenes Einkommen unter dem Mindesteinkommen ist dagegen ein echtes „nein“, auch wenn z. B. das Vermögen fehlt.
    const leerNein = x.level === 'nein' && ((x.id === 'wohngeld' && h.fehlt.miete && x.tx[0][0] === 'wohngeld.keineMiete') || (x.hl === 'minEink' && h.fehlt.einkommen));
    if (!need.length || (x.level !== 'ja' && x.level !== 'vielleicht' && !leerNein)) return x;
    return mk(x.id, 'vielleicht', 'angabeFehlt', need.map((k) => ['fehlt.' + k]));
  };

  const ORDER = { ja: 0, vielleicht: 1, nein: 2, na: 3 };

  function evaluate(inp) {
    const h = derive(inp);
    const kg = kindergeld(h);
    const wg = wohngeld(h);
    const kz = kinderzuschlag(h);
    const gg = grundsicherungsgeld(h);
    const but = bildungTeilhabe(h, wg, kz, gg);
    const uvg = unterhaltsvorschuss(h);
    const gsa = grundsicherungAlter(h);
    const baf = bafoeg(h);
    const pf = pflege(h);
    const results = [kg, wg, kz, gg, but, uvg, gsa, baf, pf,
      alg1(h), krankengeld(h), kindergeldBeh(h), erwerbsminderungsrente(h), eingliederungshilfe(h), pauschbetrag(h), ausweis(h), blindengeld(h),
      pflegeplus(h), budgetArbeit(h), rundfunk(h, gg, gsa), zuzahlung(h), bab(h), wbs(h)].map(angabeFehlt(h)).map((x, i) => ({ ...x, name: NAMES[x.id], order: i, steps: STEPS[x.id] }));
    const sorted = results.slice().sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.order - b.order);
    return { h, results: sorted, zusammen: zusammenspiel(h, results) };
  }

  return { evaluate, RULES: R, WG, limits, wgYmax, wgMiete, wgCap, wgHeiz, roman, sgb2Freibetrag, haushaltsFreibetrag, derive, NAMES, STEPS };
})();

if (typeof module !== 'undefined') module.exports = Rules;
