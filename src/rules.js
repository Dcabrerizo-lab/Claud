const Rules = (function () {
  'use strict';

  // ---------------------------------------------------------------
  // Regeln als Daten. Stand: November 2026 (Werte 2026).
  // Die Logik gibt keine fertigen Sätze aus, sondern Textschlüssel
  // mit Parametern. Die Texte stehen in den Sprachdateien.
  // ---------------------------------------------------------------
  const R = {
    stand: 'November 2026',
    // Ab diesem Tag können sich Beträge geändert haben (Regelsätze, Kindergeld, Wohngeld jeweils zum 1. Januar): Die App zeigt dann einen Hinweis
    pruefenAb: '2027-01-01',
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
    // § 12 Abs. 2 SGB II (neue Grundsicherung ab 1.7.2026): bis zur Vollendung des 30. Lebensjahres 5.000 €, ab dem 30. Geburtstag 10.000 €,
    // ab dem 40. 12.500 €, ab dem 50. 20.000 € je Person
    sgb2: { schon: { '': 10000, '<30': 5000, '30-39': 10000, '40-49': 12500, '50+': 20000 } },
    but: { schulbedarf: 195, teilhabeMonat: 15 },
    // Minijob-Grenze 2026 (§ 8 Abs. 1a SGB IV): Erwerbseinkommen von Schülern und Azubis unter 25 bleibt bis dahin frei (§ 11b Abs. 2b SGB II)
    minijob: 603,
    // Ab 1.1.2027: 633 € (Mindestlohn 14,60 €, Mindestlohnanpassungsverordnung; § 8 Abs. 1a SGB IV). Die App schaltet am Stichtag selbst um.
    minijob2027: 633,
    // Arbeitslosengeld I (SGB III): 60 %, mit Kind 67 % des pauschalierten Nettos (§ 149); Beitragsbemessungsgrenze 2026: 8.450 € im Monat;
    // Netto grob 60-72 % des Bruttos; Dauer § 147 Abs. 2: [Monate versichert in 5 Jahren, Mindestalter, Monate Anspruch]
    alg: { nebenFrei: 165, sperrWochen: 12, satz: 0.6, satzKind: 0.67, bbg: 8450, netto: [0.6, 0.72], nettoKlein: 0.8, kleinBis: 2000, dauer: [[48, 58, 24], [36, 55, 18], [30, 50, 15], [24, 0, 12], [20, 0, 10], [16, 0, 8], [12, 0, 6]] },
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
    mehr: { ae36: 0.36, aeJeKind: 0.12, aeMax: 0.6, g: 0.17, teilhabe: 0.35, schwanger: 0.17, ernaehrung: 0.2,
      // Dezentrale Warmwasserbereitung (§ 21 Abs. 7 SGB II, § 30 Abs. 7 SGB XII): Anteil am Regelbedarf je Person
      ww: { erw: 0.023, kind14: 0.014, kind: 0.012, kind0: 0.008 } },
    // Pflegesachleistung (§ 36 SGB XI) und Tages-/Nachtpflege (§ 41 SGB XI) im Monat, seit 1.1.2025; Entlastungsbudget für Verhinderungs-
    // und Kurzzeitpflege seit 1.7.2025 (§ 42a SGB XI)
    pflegeSach: { 2: 796, 3: 1497, 4: 1859, 5: 2299 }, pflegeTages: { 2: 721, 3: 1357, 4: 1685, 5: 2085 }, entlastungsbudget: 3539,
    // Mehrbedarf 35 % für Menschen mit Behinderung bei Hilfe zur Schule, Ausbildung oder Teilhabe am Arbeitsleben:
    // § 21 Abs. 4 SGB II (erwerbsfähig), § 23 Nr. 2 SGB II (Sozialgeld ab 15), § 30 Abs. 4 SGB XII (ab 15, Eingliederungshilfe § 112 SGB IX)
    // Pflege-Pauschbetrag für unentgeltlich Pflegende (§ 33b Abs. 6 EStG): Pflegegrad 2: 600 €, 3: 1.100 €, 4 und 5 sowie Merkzeichen H: 1.800 €
    pflegePausch: { 2: 600, 3: 1100, 4: 1800, 5: 1800, H: 1800 },
    // Altersrente für schwerbehinderte Menschen (§ 37, § 236a SGB VI): abschlagsfrei ab 65 (ab Jahrgang 1964), frühestens 3 Jahre früher mit Abschlag
    // (höchstens 10,8 %); Jahrgänge 1952 bis 1963 nach der gleichen Staffel wie die Regelaltersgrenze, nur 2 Jahre früher; bis 1951: 63. Wartezeit 35 Jahre.
    srente: { frei: 65, frueher: 3, bis1951: 63, abschlag: 10.8 },
    // Elterngeld (§ 2 BEEG): 67 % des Nettos vor der Geburt (65 % ab 1.240 €, bis 100 % bei kleinem Einkommen), 300 bis 1.800 €;
    // ElterngeldPlus die Hälfte für doppelt so lange; Basiselterngeld 12 Monate, mit Partnermonaten oder alleinerziehend 14;
    // kein Anspruch über 175.000 € zu versteuerndem Einkommen der Eltern (Geburten ab 1.4.2025, § 1 Abs. 8 BEEG)
    eg: { min: 300, max: 1800, satz: 0.67, satzHoch: 0.65, grenzeUnten: 1000, grenzeOben: 1200, monate: 12, partner: 2, einkommenGrenze: 175000 },
    // Hilfe zur Pflege (§§ 61 ff., 85 SGB XII): Einkommensgrenze 2 × RS1 + Wohnkosten + 70 % RS1 je weiterer Person; Vermögen 10.000 € je Erwachsenem
    hzp: { grund: 2, familie: 0.7 },
    // Blindenhilfe (§ 72 SGB XII): gleiche Einkommensgrenze wie Hilfe zur Pflege (§ 85); vom Einkommen über der Grenze
    // werden höchstens 40 % eingesetzt (§ 87 Abs. 1 Satz 3); Landesblindengeld wird voll angerechnet (§ 72 Abs. 1 Satz 2)
    blh: { einsatzUeber: 0.4 },
    // Landesblindengeld außerhalb Bayerns: für Erwachsene je nach Land etwa 350 € (Schleswig-Holstein) bis 950 € (Nordrhein-Westfalen, unter 60).
    // Feste Beträge nur, wo belegt (Stand 11/2026): BW 410 € (§ 2 BliHG), HE 86 % der Blindenhilfe = 818,65 € (BliGG Hessen),
    // MV 430 € (LBlGG M-V), NI 450 € (Merkblatt Landesblindengeld), RP 410 € (LBlGG, Merkblatt Kreisverwaltung), SH 350 € ab 4/2026.
    // Übrige Länder: Quellen widersprüchlich, daher nur die Spanne (Prüfliste).
    landBlind: { von: 350, bis: 950, land: { BW: 410, HE: 818.65, MV: 430, NI: 450, RP: 410, SH: 350 }, stand: '11/2026' },
    // Blindenhilfe § 72 Abs. 1 SGB XII ab 1.7.2026 (angepasst wie die Renten); unter 18 die Hälfte (§ 72 Abs. 2)
    blhBetrag: { erw: 951.92, kind: 476.78, stand: '7/2026' },
    // Bayerisches Landespflegegeld (BayLPflGG): ab Pflegegrad 2, unabhängig vom Einkommen; ab dem Pflegegeldjahr 2026 500 € im Jahr (vorher 1.000 €)
    lpg: { betrag: 500, stand: '2026' },
    // Mutterschaftsgeld (§ 19 MuSchG, § 24i SGB V): Krankenkasse höchstens 13 € je Kalendertag, Arbeitgeber zahlt den Unterschied
    // zum bisherigen Netto (§ 20 MuSchG); nicht gesetzlich versicherte Arbeitnehmerinnen (auch Minijob, familienversichert):
    // Bundesamt für Soziale Sicherung einmalig höchstens 210 €. Schutzfrist 6 Wochen vor, 8 (bei Früh- oder Mehrlingsgeburt 12) nach der Geburt
    mutter: { tag: 13, bas: 210, vor: 6, nach: 8, nachLang: 12 },
    // Kinderkrankengeld (§ 45 SGB V): 90 % des Nettos (höchstens 135,63 € am Tag); Arbeitstage je Kind und Elternteil:
    // 2026 befristet 15 (Alleinerziehende 30), höchstens 35 (70); ab 2027 wieder 10 (20), höchstens 25 (50)
    kkg: { 2026: { tage: 15, ae: 30, max: 35, maxAe: 70 }, 2027: { tage: 10, ae: 20, max: 25, maxAe: 50 }, satz: 90, hoechst: 135.63 },
    // Bayerisches Familiengeld (250 €, ab dem 3. Kind 300 € im Monat, 13. bis 36. Lebensmonat) und Krippengeld (bis 100 €, einkommensabhängig):
    // nur noch für Kinder, die bis 31.12.2024 geboren sind
    famgeld: { betrag: 250, ab3: 300, krippe: 100 },
    // Wohnberechtigungsschein, Bundeswerte § 9 Abs. 2 WoFG (Untergrenze; die Länder legen eigene, meist höhere Grenzen fest)
    wbsBund: { ein: 12000, zwei: 18000, weitere: 4100, kind: 500 },
    // Landesgrenzen für den WBS, wo belegt (Jahreseinkommen; Stand 11/2026). hoch: höchste Stufe (Faktor) für eingeschränkte/erhöhte Scheine.
    //  NW: § 13 WFNG NRW, Werte ab 1.1.2025 (Städte Köln, Bonn, Münster), Gruppe B bis +40 %
    //  HE: HWoFG, Werte laut Verwaltungsportal Hessen und Landkreis
    //  BE: Bundeswerte +40 % (WBS 140), erhöhte Stufe WBS 180 (+80 %) laut berlin.de
    //  HB: Bundeswerte +10 % (uneingeschränkter Schein), eingeschränkt bis +60 % (Senatorin für Bau)
    // Ältere (niedrigere) Werte bleiben auf der sicheren Seite: „wahrscheinlich“ nur, wenn das Brutto darunter liegt.
    wbsLand: {
      NW: { ein: 23540, zwei: 28350, weitere: 6530, kind: 860, hoch: 1.4, stand: '1/2025' },
      HE: { ein: 18166, zwei: 27561, weitere: 6265, kind: 833, hoch: 0, stand: '2026' },
      BE: { ein: 16800, zwei: 25200, weitere: 5740, kind: 700, hoch: 1.8 / 1.4, stand: '2026' },
      HB: { ein: 13200, zwei: 19800, weitere: 4510, kind: 550, hoch: 1.6 / 1.1, stand: '2026' },
    },
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
    // Gezahlter Unterhalt (Höchstbeträge im Monat für das Wohngeld, § 18 WoGG: 3.000 € im Jahr je Kind oder sonstiger Person,
    // 6.000 € im Jahr für frühere oder dauernd getrennt lebende Ehe- oder Lebenspartner)
    uzWG: { kind: 250, ex: 500 },
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
    wbs: { ein: 17500, zwei: 27500, weitere: 5000, kind: 1300, maxEin: 28300, maxZwei: 43200, maxWeitere: 10700, maxKind: 3200, maxAbzug: 0.3,
      // Freibeträge für Schwerbehinderte nach dem Muster § 24 WoFG: 4.500 € (GdB 100 oder ab 80 mit Pflegegrad), 2.100 € (unter 80 mit Pflegegrad).
      // Bayerische Werte bitte fachlich prüfen; die App nutzt sie nur für „möglich“, nie für „wahrscheinlich“.
      schwerbFreiHoch: 4500, schwerbFreiPflege: 2100 }
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
    // Unterhalt, den die Person selbst an andere zahlt (Kinder, die nicht im Haushalt leben, frühere Partner), im Monat.
    // Grundsicherungsgeld und Kinderzuschlag: abgezogen, soweit festgelegt (Unterhaltstitel, Jugendamtsurkunde, notarielle
    // Vereinbarung) und wirklich gezahlt (§ 11b Abs. 1 Satz 1 Nr. 7 SGB II). Wohngeld: Höchstbeträge nach § 18 WoGG; mit
    // festgelegtem Betrag rechnet die App für „möglich“ den ganzen Betrag, ohne festgelegten Betrag für „wahrscheinlich“ nichts.
    const uzBetrag = num(inp.uzBetrag);
    const uzAn = ['k1', 'k2', 'k3', 'ex', 'exk'].indexOf(inp.uzAn) >= 0 ? inp.uzAn : '';
    const uzTitel = uzBetrag > 0 && !!inp.uzTitel;
    // ohne Angabe, an wen: wie für ein Kind (niedrigster Höchstbetrag)
    const uzCap = ({ k1: 1, k2: 2, k3: 3, ex: 0, exk: 1 })[uzAn || 'k1'] * R.uzWG.kind + (uzAn === 'ex' || uzAn === 'exk' ? R.uzWG.ex : 0);
    const uzWGpess = uzTitel ? Math.min(uzBetrag, uzCap) : 0, uzWGopt = uzTitel ? uzBetrag : Math.min(uzBetrag, uzCap);
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
    let alter = !!inp.alter, alterGrenz = false, gruppe = ({ '<31': '<30', '31-40': '30-39', '41-50': '40-49', '51+': '50+' })[inp.alterGruppe] || (R.sgb2.schon.hasOwnProperty(inp.alterGruppe || '') ? (inp.alterGruppe || '') : '');
    if (jahr >= 1900 && jahr <= 2010) {
      const ragJahre = jahr < 1947 ? 65 : jahr >= 1964 ? 67 : 65 + R.rag[jahr] / 12;
      // geboren im Dezember: Grenze erst am Ende des Jahres jahr + rag erreicht; im Januar: am Anfang
      alter = jahr + 1 + ragJahre <= heute;
      alterGrenz = !alter && jahr + ragJahre <= heute;
      const age = heute - jahr - 0.5;
      gruppe = age < 30 ? '<30' : age < 40 ? '30-39' : age < 50 ? '40-49' : '50+'; // vollendete Lebensjahre
    }
    return {
      uzBetrag, uzAn, uzTitel, uzSGB: uzTitel ? uzBetrag : 0, uzWGpess, uzWGopt,
      art1, art2, pers, liste: !!liste, kindEink, uvgEst, kindZahl: unterhalt + uvgEst, mehrAE, alterGrenz,
      egFreiSGB: sumIf((a, b) => a === 'eg' && b > R.elterngeldFrei ? R.elterngeldFrei : 0),
      vPausch: sumIf((a, b) => a !== 'lohn' && a !== 'ohne' && b > 0 ? R.versPauschale : 0),
      mzG: !!inp.mzG, mzGl: !!inp.mzGl || !!(inp.mz && inp.mz.Gl), mzRF: !!(inp.mz && inp.mz.RF), mzAG: !!(inp.mz && inp.mz.aG), wfbmJahre: num(inp.wfbmJahre), grundrente33: !!inp.grundrente33, bhEinkHoch: !!inp.bhEinkHoch, teilhabe: !!inp.teilhabe, bhWeitere: Math.min(4, Math.max(0, inp.bhWeitere | 0)), schwanger: !!inp.schwanger, ernaehrung: !!inp.ernaehrung, warmwasser: !!inp.warmwasser, gebJahr: jahr,
      baby: inp.baby === 'bald' || inp.baby === 'da' ? inp.baby : '', egVor: blank(inp.egVor) ? null : num(inp.egVor), asyl: inp.aufenthalt === 'asyl',
      wohnform: inp.wohnform === 'eltern' || inp.wohnform === 'heim' ? inp.wohnform : '', wfbmEssen: !!inp.wfbmEssen,
      mieteGegeben: !blank(inp.miete) && num(inp.miete) > 0,
      arbeitSit: inp.arbeitSit === 'arbeitslos' || inp.arbeitSit === 'krank' ? inp.arbeitSit : '',
      algZeit: !!inp.algZeit, algMonate: [12, 16, 20, 24, 30, 36, 48].indexOf(Number(inp.algMonate)) >= 0 ? Number(inp.algMonate) : 0,
      krankWochen: ['unter6', 'laeuft', 'ende'].indexOf(inp.krankWochen) >= 0 ? inp.krankWochen : '',
      minijob: heute >= 2027 ? R.minijob2027 : R.minijob, heute,
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
      // Bundesland als Kürzel (BY, BW, ...); leer = unbekannt (dann gelten die bayerischen Werte für Blindengeld und WBS).
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
    const eink = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - h.minijob);
    if (!eink) return 0;
    const kinderBedarf = (h.regel - h.regelElt) + h.miete * h.children / h.persons;
    return Math.min(eink, Math.max(0, kinderBedarf - h.children * R.kindergeld));
  }
  // Weitere Mehrbedarfe (SGB II und SGB XII gleich): Schwangerschaft 17 % ab der 13. Woche (§ 21 Abs. 2 / § 30 Abs. 2),
  // dezentrale Warmwasserbereitung (§ 21 Abs. 7 / § 30 Abs. 7). Kostenaufwändige Ernährung (§ 21 Abs. 5 / § 30 Abs. 5) hängt von der
  // Krankheit ab (Empfehlungen des Deutschen Vereins) und wird nur als „möglich“ berücksichtigt.
  function mehrAllg(h, nurEigen, regelEigen) {
    const rErw = h.adults === 2 && !nurEigen ? R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    const schw = h.schwanger ? R.mehr.schwanger * (nurEigen ? regelEigen : rErw) : 0;
    let ww = 0, wwEltern = 0;
    if (h.warmwasser) {
      if (nurEigen) ww = R.mehr.ww.erw * regelEigen;
      else {
        wwEltern = R.mehr.ww.erw * h.regelElt;
        const mitte = h.kids - h.kidsU6 - h.kids14;
        ww = wwEltern + R.mehr.ww.erw * h.young * R.regelbedarf.jungErwachsener + R.mehr.ww.kind14 * h.kids14 * R.regelbedarf.kind14 +
          R.mehr.ww.kind * mitte * R.regelbedarf.kind + R.mehr.ww.kind0 * h.kidsU6 * R.regelbedarf.kind0;
      }
    }
    const ern = h.ernaehrung ? R.mehr.ernaehrung * R.regelbedarf.alleinstehend : 0;
    const tx = (schw ? [['mehr.schwanger', { betrag: eur(schw) }]] : []).concat(ww ? [['mehr.warmwasser', { betrag: eur(ww) }]] : [], ern ? [['mehr.ernaehrung']] : []);
    return { fest: schw + ww, eltern: schw + wwEltern, offen: ern, tx };
  }

  // Regelsatz der Person mit Behinderung: Kind unter 18 (Stufe 4), erwachsenes Kind im Haushalt (Stufe 3), erwachsene Person (Stufe 1 oder 2)
  function regelBhPerson(h) {
    if (h.bhPerson === 'minder') return R.regelbedarf.kind14;
    if (h.bhPerson === 'erwVor25' && h.young > 0) return R.regelbedarf.jungErwachsener;
    if (h.bhPerson) return h.adults === 2 ? R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    return 0;
  }
  // Mehrbedarfe wegen Behinderung im Grundsicherungsgeld (SGB II): fest = sicher anzusetzen, offen = möglich (Alter oder Erwerbsfähigkeit unbekannt)
  function mehrBehSGB2(h) {
    const rp = regelBhPerson(h);
    let fest = 0, offen = 0;
    if (h.teilhabe && !h.wfbm) {
      if (h.bhPerson === 'minder') offen += R.mehr.teilhabe * rp; // nur ab 15 Jahren (§ 23 Nr. 2 SGB II)
      else if (h.bhPerson) fest += R.mehr.teilhabe * rp;           // § 21 Abs. 4 SGB II
    }
    // Merkzeichen G bei nicht erwerbsfähigen Kindern ab 15 bzw. befristet voll erwerbsgeminderten Erwachsenen (§ 23 Nr. 4 SGB II)
    if (h.mzG && (h.bhPerson === 'minder' || h.bhPerson === 'erwVor25')) offen += Math.max(0, R.mehr.g * rp - (h.teilhabe ? R.mehr.teilhabe * rp : 0));
    return { fest, offen };
  }
  // Einkommen der Eltern nach Abzügen (§ 11b SGB II): Freibetrag für Arbeit, Versicherungspauschale, Elterngeld-Freibetrag
  const elternEinkSGB2 = (h) => Math.max(0, h.netto - haushaltsFreibetrag(h) - (h.egFreiSGB || 0) - (h.vPausch || 0) - (h.uzSGB || 0));
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

  // BAföG dem Grunde nach möglich (Altersgrenze 45 bei Beginn, § 10 Abs. 3 BAföG): genau mit Geburtsjahr, sonst nach Altersgruppe
  const bafoegAlter = (h) => (h.alterJahre ? h.alterJahre < 45 : (h.gruppe === '' || h.gruppe === '<30' || h.gruppe === '30-39'));

  // ---------------------------------------------------------------
  // Kindergeld
  // ---------------------------------------------------------------
  function kindergeld(h) {
    const id = 'kindergeld';
    // § 32 Abs. 4 EStG: auch arbeitslos gemeldet bis 21, Freiwilligendienst, Ausbildungsplatzsuche, Übergangszeit bis 4 Monate;
    // nach der ersten Ausbildung höchstens 20 Stunden Arbeit in der Woche (Satz 2, 3)
    if (h.children === 0) return mk(id, 'nein', 'keinKind', [['kindergeld.keinKind'], ['kindergeld.mehr']]);
    if (h.bezug.kindergeld) return mk(id, 'na', 'na', [['kindergeld.na']]);
    // § 62 Abs. 2 EStG: Ausländerinnen und Ausländer nur mit bestimmten Aufenthaltstiteln; im Asylverfahren oder mit Duldung meist nicht
    if (h.asyl) return mk(id, 'vielleicht', 'vielleicht', [['kindergeld.asyl']]);
    const bay = !h.land || h.land === 'BY';
    return mk(id, 'ja', 'ja', [['kindergeld.ja', { kg: eur(R.kindergeld) }], ['kindergeld.mehr']].concat(bay && h.kids > 0 ? [['kindergeld.familiengeld', { betrag: eur(R.famgeld.betrag), ab3: eur(R.famgeld.ab3), krippe: eur(R.famgeld.krippe) }]] : []));
  }

  // ---------------------------------------------------------------
  // Wohngeld
  // ---------------------------------------------------------------
  function wohngeld(h) {
    const id = 'wohngeld';
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['wohngeld.ausschluss']]);
    if (h.bezug.wohngeld) return mk(id, 'na', 'na', [['wohngeld.na']]);
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['wohngeld.asyl']]); // § 7 Abs. 1 Nr. 9 WoGG
    // Bei den Eltern: Wohngeld gibt es nur für den ganzen Haushalt (Antrag der Eltern); im Wohnheim geht die Grundsicherung vor
    if (h.wohnform) return mk(id, 'nein', 'vorausFehlt', [['wohngeld.' + h.wohnform]]);
    const vermLimit = R.wohngeld.vermoegenErste + R.wohngeld.vermoegenJeWeitere * (h.persons - 1);
    if (h.vermoegen > vermLimit) return mk(id, 'nein', 'vermHoch', [['wohngeld.verm', { n: h.persons, limit: eur(vermLimit) }]]);

    // § 20 Abs. 2 WoGG: kein Wohngeld, wenn allen Haushaltsmitgliedern BAföG oder BAB dem Grunde nach zusteht
    if (h.ausbildung === 'ich' && h.adults === 1 && h.children === 0 && (!h.babBetrieb || h.babWohnt) && bafoegAlter(h)) {
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
    // Elterngeld bis 300 € je Person ist gar kein Einkommen (§ 10 Abs. 1 BEEG): nur der Teil darüber zählt, mit Pauschalabzug
    pers.forEach(function (x) {
      const ab = (x[3] ? R.wgAbzugAuszahlung[x[0]] : R.wgAbzug[x[0]]) || R.wgAbzug.lohn;
      const zaehlt = x[0] === 'eg' ? Math.max(0, x[1] - R.elterngeldFrei) : x[1];
      sumB += zaehlt; yA += zaehlt * (1 - ab[0]); yB += zaehlt * (1 - ab[1]);
    });
    const wA = sumB > 0 ? yA / sumB : 0.9, wB = sumB > 0 ? yB / sumB : 0.7;
    // Anzeige als Grenze für das Brutto (bzw. den ausgezahlten Betrag bei ALG I und Elterngeld)
    const lo = yMaxLo / wA, hi = yMaxHi / wB;

    let freib = 0;
    // § 17 Nr. 1 WoGG: 1.800 €/Jahr je schwerbehindertem Haushaltsmitglied mit GdB 100, oder GdB unter 100 (ab 50) bei Pflegebedürftigkeit
    // (nicht bei vollstationärer Pflege). Pflegegrad allein ohne Schwerbehinderung gibt den Freibetrag nicht. Die App kennt nur eine Person mit Behinderung.
    if (gdbNum(h) === 100 || (gdbNum(h) >= 50 && h.pflegegrad > 0)) freib += R.wohngeld.freibetragBehinderungMonat;
    // weitere Personen im Haushalt mit GdB 100 oder Schwerbehinderung und Pflegegrad: je 1.800 € im Jahr
    freib += (h.bhWeitere || 0) * R.wohngeld.freibetragBehinderungMonat;
    if (h.alleinerz) freib += R.wohngeld.freibetragAlleinerzMonat; // § 17 Nr. 3 WoGG: 1.320 € im Jahr, einmal je Haushalt
    // Unterhalt und Unterhaltsvorschuss der Kinder zählen als Einkommen (§ 14 WoGG), ohne Pauschalabzug; eigenes Einkommen
    // der Kinder mit Freibetrag (§ 17 Nr. 4 WoGG); Elterngeld bis 300 € frei (§ 10 Abs. 1 BEEG); Freibeträge nach § 17 WoGG.
    // § 17a WoGG: Grundrentenfreibetrag bei 33 Jahren Grundrentenzeiten (100 € + 30 % des Rests, höchstens 50 % RS1)
    const grFrei = h.grundrente33 ? pers.filter((x) => x[0] === 'rente').reduce((a, x) => a + Math.min(R.grundrente.sockel + R.grundrente.quote * Math.max(0, x[1] - R.grundrente.sockel), R.grundrente.max * R.regelbedarf.alleinstehend), 0) : 0;
    const extra = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - R.wgKindFrei) - freib - grFrei;
    const yPess = Math.max(0, yA + extra - (h.uzWGpess || 0)), yOpt = Math.max(0, yB + extra - (h.uzWGopt || 0));

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

    const mittel = h.netto + h.kids * R.kindergeld + (h.kindZahl || 0) + (h.kindEink || 0) - (h.uzBetrag || 0);
    const mindest = R.wohngeld.mindestAnteil * (h.regel + h.miete + (h.mehrAE || 0));
    if (h.miete > 0 && mittel < mindest) {
      level = 'vielleicht'; hl = 'einkoNiedrig';
      const schonGS = (h.alter || h.erwerbsgemindert)
        ? R.grundsicherung.schonAllein * h.adults + 500 * h.children
        : R.sgb2.schon[h.gruppe] * h.adults + R.sgb2.schon['<30'] * h.children;
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
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['kiz.asyl']]);
    const vermGrenze = h.persons <= 2 ? R.kiz.vermZwei : R.kiz.vermDrei + R.kiz.vermJeWeiteres * (h.persons - 3);
    if (h.vermoegen > vermGrenze) return mk(id, 'nein', 'vermHoch', [['kiz.verm', { n: h.persons, limit: eur(vermGrenze) }]]);
    const minEink = h.adults === 2 ? R.kiz.minPaar : R.kiz.minAlleinerziehend;
    if (h.brutto < minEink) return mk(id, 'nein', 'minEink', [['kiz.minEink', { min: eur(minEink) }]]);

    const gmax = R.kiz.max * h.children;
    const gewicht = h.adults === 1 ? R.kiz.gewichtKindAllein : R.kiz.gewichtKindPaar;
    const elternAnteil = h.adults / (h.adults + gewicht * h.children);
    // Mehrbedarfe der Eltern gehören zum Bedarf der Eltern (Schwangerschaft, Warmwasser, 35 % bei Teilhabe am Arbeitsleben)
    const maK = mehrAllg(h, false), mbK = mehrBehSGB2(h);
    const mehrEltern = maK.eltern + (h.bhPerson === 'erwNach25' ? mbK.fest : 0);
    const bemessung = h.regelElt + (h.mehrAE || 0) + mehrEltern + h.miete * elternAnteil;
    // Einkommen der Eltern nach § 11b SGB II (Freibetrag für Arbeit usw.); Einkommen der Kinder (Unterhalt, Unterhaltsvorschuss,
    // eigenes Einkommen über der Minijob-Grenze) mindert den Kinderzuschlag um 45 % (§ 6a Abs. 3 und 6 BKGG)
    const kindAnr = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - h.minijob);
    const est = Math.max(0, gmax - R.kiz.anrechnung * Math.max(0, elternEinkSGB2(h) - bemessung) - R.kiz.anrechnung * kindAnr);
    const gesamtBedarf = h.regel + h.miete + (h.mehrAE || 0) + maK.fest + mbK.fest;

    if (est <= 0) return mk(id, 'nein', 'einkoHoch', [['kiz.zuHoch']]);
    if (h.netto - (h.uzSGB || 0) + (h.kindZahl || 0) + (h.kindEink || 0) + gmax + R.kiz.puffer < gesamtBedarf) return mk(id, 'vielleicht', 'einkoNiedrig', [['kiz.zuNiedrig']]);
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
    // Paar mit Kindern, eine Person im Rentenalter oder voll erwerbsgemindert: Die andere Person kann erwerbsfähig sein und gehört
    // dann mit den Kindern zum Jobcenter (gemischte Bedarfsgemeinschaft, § 7 Abs. 2 und 3 SGB II); ohne Kinder nur als Hinweis
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);
    if (h.alter || h.erwerbsgemindert) {
      if (h.adults === 2 && h.children > 0 && !h.bezug.grundsicherungsgeld) return mk(id, 'vielleicht', 'vielleicht', [['ggeld.gemischt']]);
      return mk(id, 'nein', 'andereStelle', [['ggeld.sozialamtZustaendig']].concat(h.adults === 2 ? [['ggeld.gemischt']] : []));
    }
    if (h.bezug.grundsicherungsgeld) return mk(id, 'na', 'na', [['ggeld.na']]);
    if (h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['ggeld.sozialamt']]);
    // § 7 Abs. 5 SGB II: Schule/Studium, die nach BAföG förderfähig sind, schließen Grundsicherungsgeld in der Regel aus
    // (betriebliche Ausbildung mit Berufsausbildungsbeihilfe: aufstockend möglich). Ab 45 (Altersgrenze BAföG) nicht mehr förderfähig: offen.
    if (h.ausbildung === 'ich' && !h.babBetrieb && bafoegAlter(h)) {
      return mk(id, 'nein', 'ausschluss', [['ggeld.ausbildung']]);
    }
    // § 12 Abs. 2 SGB II: je Person der Bedarfsgemeinschaft ein Freibetrag nach Alter; Kinder und junge Erwachsene bis 30: 5.000 €
    const schon = R.sgb2.schon[h.gruppe] * h.adults + R.sgb2.schon['<30'] * h.children;
    if (h.vermoegen > schon) return mk(id, 'nein', 'vermHoch', [['ggeld.verm', { schon: eur(schon) }]]);
    const einkommen = elternEinkSGB2(h) + h.children * R.kindergeld + unterhaltAnrechenbar(h);
    const mb = mehrBehSGB2(h), ma = mehrAllg(h, false);
    const bedarf = h.regel + h.miete + (h.mehrAE || 0) + mb.fest + ma.fest;
    const luecke = bedarf - einkommen;
    mb.offen += ma.offen;
    const behTx = (mb.fest ? [['mehr.teilhabe', { betrag: eur(mb.fest) }]] : []).concat(mb.offen - ma.offen ? [['ggeld.mehrBeh']] : [],
      h.bhPerson === 'erwVor25' && h.erwerbsgemindert ? [['ggeld.kindGsa']] : [], ma.tx, h.schwanger ? [['mehr.erstausstattung']] : [],
      h.kids > 0 && h.land && h.land !== 'BY' ? [['ggeld.schulbuch']] : [], h.miete > 0 ? [['kdu.angemessen']] : []);
    if (luecke >= R.grundsicherung.sicherAb) return mk(id, 'ja', 'ja', bedarfTx('ja', bedarf).concat([['schaetz.eins', { a: eur(r10(luecke)) }]], behTx));
    if (luecke > -(R.grundsicherung.knappPuffer + mb.offen)) return mk(id, 'vielleicht', 'vielleicht', bedarfTx('vielleicht', bedarf).concat(behTx));
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
      return mk(id, 'ja', 'ja', [['but.bezug'], inhalt].concat(h.kidsU6 > 0 ? [['but.kita']] : []));
    }
    // § 90 Abs. 4 SGB VIII: Kita und Tagespflege ohne Kostenbeitrag bei Grundsicherung, Wohngeld, Kinderzuschlag, Asylbewerberleistungen
    const kita = h.kidsU6 > 0 ? [['but.kita']] : [];
    if (wg.level === 'ja' || kz.level === 'ja' || gg.level === 'ja') return mk(id, 'ja', 'butFolgt', [['but.folgt'], inhalt].concat(kita));
    if (wg.level === 'vielleicht' || kz.level === 'vielleicht' || gg.level === 'vielleicht') {
      return mk(id, 'vielleicht', 'butMoeglich', [['but.moeglich'], inhalt].concat(kita));
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
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);
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
    // § 30 Abs. 4 SGB XII: 35 % bei Eingliederungshilfe für Schule oder Ausbildung (ab 15; nicht für die Werkstatt). Kind unter 18: Alter unbekannt -> nur „möglich“
    const rpB = regelBhPerson(h);
    const teilFest = h.teilhabe && !h.wfbm && (h.bhPerson === 'erwVor25' || h.bhPerson === 'erwNach25') ? R.mehr.teilhabe * (h.bhPerson === 'erwNach25' && eigen ? regelP : rpB) : 0;
    const teilOffen = h.teilhabe && !h.wfbm && h.bhPerson === 'minder' && !eigen ? R.mehr.teilhabe * rpB : 0;
    let bedarf, kduOffen = 0;
    // Mehrbedarf G und 35 % für dieselbe Person nicht zusammen (§ 30 Abs. 1 Satz 2 SGB XII): der höhere zählt
    const mehrBeh = h.bhPerson === 'erwNach25' || eigen ? Math.max(mehrG, teilFest) : mehrG + teilFest;
    if (h.wohnform === 'eltern') { bedarf = regelP + (h.mieteGegeben ? h.miete : 0) + mehrBeh; if (!h.mieteGegeben) kduOffen = R.offen.elternKdu; }
    else if (h.wohnform === 'heim') { bedarf = regelP + mehrBeh; kduOffen = R.offen.heimKdu; }
    else bedarf = h.regel + h.miete + (h.mehrAE || 0) + mehrBeh;
    const maG = mehrAllg(h, eigen, regelP);
    bedarf += maG.fest;
    const offen = kduOffen + (h.wfbmEssen ? R.offen.essen : 0) + teilOffen + maG.offen;
    const eink = gsaEinkommen(h) + (eigen ? 0 : h.children * R.kindergeld + unterhaltAnrechenbar(h));
    const luecke = bedarf - eink;
    const hatRente = (h.pers || []).some((x) => x[0] === 'rente' && x[1] > 0);
    const extra = (h.alterGrenz ? [['gsa.grenz']] : []).concat(h.wfbmEssen ? [['gsa.essen']] : [], kduOffen ? [[h.wohnform === 'heim' ? 'gsa.heim' : 'gsa.eltern']] : [],
      hatRente && !h.grundrente33 ? [['gsa.grundrente']] : [], teilFest ? [['mehr.teilhabe', { betrag: eur(teilFest) }]] : [], teilOffen ? [['ggeld.mehrBeh']] : [], maG.tx,
      !eigen && h.miete > 0 ? [['kdu.angemessen']] : []);
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
    // § 10 Abs. 3 BAföG: Altersgrenze 45 bei Beginn (Ausnahmen möglich); ab 50 unwahrscheinlich
    if (h.gruppe === '50+' || (h.gruppe === '40-49' && !bafoegAlter(h))) {
      return mk(id, h.gruppe === '50+' ? 'nein' : 'vielleicht', h.gruppe === '50+' ? 'vorausFehlt' : 'vielleicht', [['bafoeg.alter']]);
    }
    const vermGrenze = h.gruppe === '<30' ? R.bafoeg.vermBis29 : R.bafoeg.vermAb30; // § 29: 15.000 € bis zur Vollendung des 30. Lebensjahres
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
    if (h.pflegegrad === 1) return mk(id, 'ja', 'ja', [['pflege.pg1', { ent: eur(R.pflege.entlastung) }], ['pflege.zeit']]);
    const pg = h.pflegegrad;
    return mk(id, 'ja', 'ja', [['pflege.pg2', { geld: eur(R.pflege.geld[pg]), pg, ent: eur(R.pflege.entlastung) }],
      // Pflegedienst statt Angehörige (Sachleistung, auch kombiniert), Tages- und Nachtpflege zusätzlich
      ['pflege.sach', { sach: eur(R.pflegeSach[pg]), tages: eur(R.pflegeTages[pg]) }],
      // Pflegende Angehörige: Rentenversicherung (§ 44 SGB XI), Pflege-Pauschbetrag (§ 33b Abs. 6 EStG), Steuerermäßigung (§ 35a EStG), Pflegezeit
      ['pflege.rente'], ['pflege.pauschbetrag', { betrag: eur(R.pflegePausch[pg]) }], ['pflege.steuer35a'], ['pflege.zeit']]);
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
    // Minijob ist arbeitslosenversicherungsfrei (§ 27 Abs. 2 SGB III): zählt nicht für den Anspruch
    if (h.lohnVorher > 0 && h.lohnVorher <= h.minijob) return mk(id, 'vielleicht', 'vielleicht', [['alg1.minijob'], melden]);
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
    // Sperrzeit bei eigener Kündigung oder Aufhebungsvertrag (§ 159 SGB III); Nebeneinkommen 165 € frei (§ 155 SGB III)
    tx.push(['alg1.sperrzeit', { wochen: R.alg.sperrWochen }], ['alg1.neben', { frei: eur(R.alg.nebenFrei) }], melden);
    return mk(id, 'ja', 'ja', tx);
  }

  // Krankengeld (§§ 44 ff. SGB V)
  function krankengeld(h) {
    const id = 'krankengeld';
    if (h.art1 === 'kg' || (h.adults === 2 && h.art2 === 'kg')) return mk(id, 'na', 'na', [['krank.na'], ['krank.78']]);
    if (h.arbeitSit !== 'krank') return mk(id, 'nein', 'vorausFehlt', [['krank.keine']]);
    if (h.krankWochen === 'ende') return mk(id, 'nein', 'vorausFehlt', [['krank.ende']]);
    // Minijob (bis 603 €): nicht krankenversichert über die Arbeit, daher kein Krankengeld (§ 7 SGB V, § 44 SGB V)
    if (h.lohnVorher > 0 && h.lohnVorher <= h.minijob) return mk(id, 'nein', 'vorausFehlt', [['krank.minijob']]);
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

  // Elterngeld (BEEG)
  function elterngeldBerechnen(n) {
    const E = R.eg;
    let q = E.satz;
    // § 2 Abs. 2 BEEG: 0,1 Prozentpunkte für je (volle) 2 € Abstand zur Grenze
    if (n < E.grenzeUnten) q = Math.min(1, E.satz + Math.floor((E.grenzeUnten - n) / 2) * 0.001);
    else if (n > E.grenzeOben) q = Math.max(E.satzHoch, E.satz - Math.floor((n - E.grenzeOben) / 2) * 0.001);
    return Math.min(E.max, Math.max(E.min, n * q));
  }
  function elterngeld(h) {
    const id = 'elterngeld';
    if (!h.baby) return mk(id, 'nein', 'vorausFehlt', [['eg.keine']]);
    if ((h.pers || []).some((x) => x[0] === 'eg' && x[1] > 0)) return mk(id, 'na', 'na', [['eg.na']]);
    if (h.asyl) return mk(id, 'vielleicht', 'vielleicht', [['eg.asyl']]);
    const monate = R.eg.monate + R.eg.partner; // Paare zusammen 14, Alleinerziehende allein 14 (§ 4 Abs. 4, 6 BEEG)
    const tx = [];
    if (h.egVor == null) tx.push(['eg.ohneBetrag', { min: eur(R.eg.min), max: eur(R.eg.max) }]);
    else {
      const basis = elterngeldBerechnen(h.egVor);
      tx.push(['eg.ja', { basis: eur(basis), plus: eur(basis / 2), monate }], ['schaetz.eins', { a: eur(r10(basis)) }]);
    }
    tx.push(['eg.mutterschaft'], ['eg.grenze', { grenze: eur(R.eg.einkommenGrenze) }]);
    return mk(id, h.egVor == null ? 'vielleicht' : 'ja', h.egVor == null ? 'vielleicht' : 'ja', tx);
  }

  // Hilfe zur Pflege (SGB XII, 7. Kapitel): wenn Pflegekasse und eigenes Geld nicht reichen (Pflegedienst, Tagespflege, Heim)
  function hilfeZurPflege(h) {
    const id = 'hzp';
    if (h.pflegegrad < 2 && !h.pflegeAntrag) return mk(id, 'nein', 'vorausFehlt', [['hzp.keine']]);
    if (h.vermoegen > R.grundsicherung.schonAllein * h.adults + 500 * h.children) return mk(id, 'nein', 'vermHoch', [['hzp.verm']]);
    const grenze = R.hzp.grund * R.regelbedarf.alleinstehend + h.miete + R.hzp.familie * R.regelbedarf.alleinstehend * (h.persons - 1);
    return mk(id, 'vielleicht', 'vielleicht', [[h.netto <= grenze ? 'hzp.unter' : 'hzp.ueber', { grenze: eur(grenze) }], ['hzp.heim']]);
  }

  // Mutterschaftsgeld: für angestellte (auch Minijob) oder arbeitslose Schwangere in der Schutzfrist
  function mutterschaftsgeld(h) {
    const id = 'mutter';
    if (!h.baby) return mk(id, 'nein', 'vorausFehlt', [['mu.keine']]);
    const pers = h.pers || [];
    const lohn = pers.filter((x) => x[0] === 'lohn' && x[1] > 0), alg = pers.some((x) => x[0] === 'alg' && x[1] > 0);
    if (!lohn.length && !alg) return mk(id, 'nein', 'vorausFehlt', [['mu.ohne']]);
    const M = R.mutter, p = { tag: eur(M.tag), bas: eur(M.bas), vor: M.vor, nach: M.nach, nachLang: M.nachLang };
    const tx = [[alg && !lohn.length ? 'mu.alg' : 'mu.lohn', p]];
    if (lohn.some((x) => x[1] <= h.minijob)) tx.push(['mu.minijob', p]);
    tx.push(['mu.frist', p]);
    if (h.baby === 'da') return mk(id, 'vielleicht', 'vielleicht', [['mu.da', p]].concat(tx));
    // Bei zwei Erwachsenen weiß die App nicht, wer schwanger ist und wer das Einkommen hat
    return h.adults === 1 ? mk(id, 'ja', 'ja', tx) : mk(id, 'vielleicht', 'vielleicht', tx.concat([['mu.wer']]));
  }

  // Kinderkrankengeld: Eltern mit Arbeitseinkommen, Kind unter 12 krank (Alter der Kinder unbekannt, daher „möglich“)
  function kinderkrankengeld(h) {
    const id = 'kkg';
    if (h.kids === 0) return mk(id, 'nein', 'keinKind', [['kkg.keine']]);
    const pers = h.pers || [];
    if (!pers.some((x) => x[0] === 'lohn' && x[1] > h.minijob)) return mk(id, 'nein', 'vorausFehlt', [['kkg.ohne']]);
    const T = h.heute >= 2027 ? R.kkg[2027] : R.kkg[2026];
    return mk(id, 'vielleicht', 'vielleicht', [[h.alleinerz ? 'kkg.ae' : 'kkg.ja', { tage: h.alleinerz ? T.ae : T.tage, max: h.alleinerz ? T.maxAe : T.max, satz: R.kkg.satz, hoechst: eur2(R.kkg.hoechst) }], ['kkg.hinweis']]);
  }

  // Bayerisches Landespflegegeld (BayLPflGG): Pflegegrad 2 bis 5, Hauptwohnsitz Bayern, einkommensunabhängig, Antrag beim Landesamt für Pflege
  function landespflegegeld(h) {
    const id = 'lpg';
    if (h.land && h.land !== 'BY') return mk(id, 'nein', 'land', [['lpg.land']]);
    if (h.pflegegrad < 2 && !h.pflegeAntrag) return mk(id, 'nein', 'vorausFehlt', [['lpg.keine']]);
    const tx = [['lpg.ja', { betrag: eur(R.lpg.betrag), stand: R.lpg.stand }], ['lpg.antrag']];
    return h.pflegegrad >= 2 ? mk(id, 'ja', 'ja', tx) : mk(id, 'vielleicht', 'vielleicht', [['lpg.pflegeAntrag', { betrag: eur(R.lpg.betrag) }]]);
  }

  // Blindenhilfe (§ 72 SGB XII): ergänzt das Landesblindengeld, wenn Einkommen und Vermögen gering sind
  function blindenhilfe(h) {
    const id = 'blh';
    if (h.blind !== 'blind') return mk(id, 'nein', h.blind ? 'vorausFehlt' : 'keinBeh', [[h.blind ? 'blh.hoch' : 'blh.keine']]);
    if (h.asyl) return mk(id, 'vielleicht', 'vielleicht', [['blh.asyl']]);
    if (h.vermoegen > R.grundsicherung.schonAllein * h.adults + 500 * h.children) return mk(id, 'nein', 'vermHoch', [['blh.verm']]);
    const grenze = R.hzp.grund * R.regelbedarf.alleinstehend + h.miete + R.hzp.familie * R.regelbedarf.alleinstehend * (h.persons - 1);
    const tx = [h.netto <= grenze ? ['blh.unter', { grenze: eur(grenze) }] : ['blh.ueber', { grenze: eur(grenze), prozent: Math.round(R.blh.einsatzUeber * 100) }],
      [h.land && h.land !== 'BY' ? 'blh.landAnders' : 'blh.bayern']];
    // Höhe: Blindenhilfe minus Landesblindengeld (voll angerechnet, § 72 Abs. 1 Satz 2), wo das Landesblindengeld belegt ist
    const B = R.blhBetrag, landB = !h.land || h.land === 'BY' ? R.beh.blind.blind : R.landBlind.land[h.land];
    tx.push(['blh.betrag', { betrag: eur2(B.erw), kind: eur2(B.kind), stand: B.stand }]);
    if (landB && h.bhPerson !== 'minder') tx.push(['blh.differenz', { land: BL_NAME[h.land || 'BY'], landbetrag: eur2(landB), rest: eur2(Math.max(0, B.erw - landB)) }]);
    if (h.bhPerson === 'minder') tx.push(['blh.kind']);
    if (h.pflegegrad >= 2) tx.push(['blh.pflege']);
    tx.push(['blh.heim']);
    return mk(id, 'vielleicht', 'vielleicht', tx);
  }

  // Leistungen nach dem Asylbewerberleistungsgesetz
  function asylbewerber(h) {
    const id = 'asylblg';
    if (!h.asyl) return mk(id, 'nein', 'vorausFehlt', [['asyl.keine']]);
    return mk(id, 'ja', 'ja', [['asyl.ja'], ['asyl.analog']]);
  }

  // Altersrente für schwerbehinderte Menschen (§§ 37, 236a SGB VI)
  function schwerbRente(h) {
    const id = 'srente';
    if (h.alter) return mk(id, 'nein', 'vorausFehlt', [['srente.alter']]);
    if (!(gdbNum(h) >= 50) && !h.gdbAntrag) return keinBeh(id);
    const j = h.gebJahr;
    if (!(j >= 1900 && j <= 2010)) return mk(id, 'vielleicht', 'vielleicht', [['srente.allg', { abschlag: R.srente.abschlag }]]);
    const frei = j <= 1951 ? R.srente.bis1951 : j >= 1964 ? R.srente.frei : R.srente.frei - 2 + R.rag[j] / 12;
    const jm = (x) => { const y = Math.floor(x + 1e-9); return [y, Math.round((x - y) * 12)]; };
    const [fj, fm] = jm(frei), [gj, gm] = jm(frei - R.srente.frueher);
    return mk(id, 'vielleicht', 'vielleicht', [['srente.alter2', { fj, fm, gj, gm, abschlag: R.srente.abschlag }]]);
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
    if (g === 'H' || h.mzAG) tx.push(['pausch.fahrt', { betrag: eur(4500) }]);
    else if (gdbNum(h) >= 80 || (gdbNum(h) >= 70 && h.mzG)) tx.push(['pausch.fahrt', { betrag: eur(900) }]);
    if (h.alter || h.netto * 12 < R.beh.grundfreibetrag) tx.push(['pausch.steuer']);
    if (g === 'H' && h.pflegegrad < 2) tx.push(['pflege.pauschbetrag', { betrag: eur(R.pflegePausch.H) }]);
    if (h.bhPerson === 'minder' || h.bhPerson === 'erwVor25') tx.push(['pausch.kind']);
    return mk(id, 'ja', 'ja', tx);
  }

  // Schwerbehindertenausweis und Nachteilsausgleiche (§ 2 SGB IX, § 208 SGB IX)
  function ausweis(h) {
    const id = 'ausweis';
    const g = gdbNum(h);
    if (!gdbEff(h) && h.gdbAntrag) return mk(id, 'na', 'na', [['ausweis.laeuft']]);
    if (gdbEff(h) && g >= 50) {
      const frei = gdbEff(h) === 'H' || h.blind === 'blind' || h.mzAG; // H, Bl, TBl, aG
      return mk(id, 'ja', 'ja', [h.alter ? ['ausweis.schwerRente'] : ['ausweis.schwer', { tage: R.beh.zusatzurlaub }]]
        .concat(h.alter ? [] : [['ausweis.kuendigung']], frei ? [['ausweis.frei']] : h.mzG || h.mzGl ? [['ausweis.g']] : [], h.mzGl ? [['ausweis.gl']] : [], h.mzAG || h.blind === 'blind' ? [['ausweis.park']] : []));
    }
    if (gdbEff(h) && g >= 30) return mk(id, 'vielleicht', 'vielleicht', [['ausweis.gleich']]);
    if (gdbEff(h)) return mk(id, 'nein', 'vorausFehlt', [['ausweis.niedrig']]);
    if (hatBeh(h)) return mk(id, 'vielleicht', 'vielleicht', [['ausweis.antrag']]);
    return keinBeh(id);
  }

  // Landesblindengeld Bayern (Art. 1 BayBlindG; ZBFS, Stand 1.7.2026)
  function blindengeld(h) {
    const id = 'blindengeld';
    if (!h.blind) return keinBeh(id);
    // Andere Länder: Jedes Land hat ein eigenes Landesblindengeld (eigene Gesetze und Beträge). Blinde Menschen bekommen es überall,
    // meist unabhängig vom Einkommen; hochgradig Sehbehinderte nur in einigen Ländern. Die Beträge der Länder sind in den Quellen
    // widersprüchlich, daher nur eine Spanne und keine feste Zahl (Prüfliste).
    if (h.land && h.land !== 'BY') {
      if (h.blind !== 'blind') return mk(id, 'vielleicht', 'vielleicht', [['blindengeld.hochLand']]);
      const fest = R.landBlind.land[h.land];
      const t1 = fest ? ['blindengeld.landBetrag', { land: BL_NAME[h.land], betrag: eur2(fest), stand: R.landBlind.stand }] : ['blindengeld.landJa', { von: eur(R.landBlind.von), bis: eur(R.landBlind.bis) }];
      return mk(id, 'ja', 'ja', [t1].concat(h.pflegegrad >= 2 ? [['blindengeld.pflegeLand']] : []));
    }
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
    if (h.pflegegrad >= 2) tx.push(['pflegeplus.budget', { betrag: eur(R.entlastungsbudget) }]);
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
    // § 4 Abs. 1 Nr. 4 RBStV: Leistungen nach dem Asylbewerberleistungsgesetz
    if (h.asyl) return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.asyl']]);
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
    // Chroniker-Richtlinie § 2: GdB mindestens 60 oder Pflegegrad 3 bis 5 (bei Dauerbehandlung)
    if (gdbNum(h) >= 60 || h.pflegegrad >= 3) tx.push(['zuzahl.chron']);
    // Fahrten zur ambulanten Behandlung (§ 60 SGB V, Krankentransport-Richtlinie): bei aG, Bl, H oder Pflegegrad 3 (mit Einschränkung) bis 5
    if (gdbEff(h) === 'H' || h.mzAG || h.blind === 'blind' || h.pflegegrad >= 3) tx.push(['zuzahl.fahrt']);
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
    // Andere Länder: eigene Einkommensgrenzen (Landesrecht). Sicher ist nur: Kein Land liegt unter den Bundeswerten (§ 9 Abs. 2 WoFG).
    // Das Brutto ist nie kleiner als das maßgebliche Gesamteinkommen; liegt es unter der Bundesgrenze, ist der WBS wahrscheinlich.
    if (h.land && h.land !== 'BY') {
      const jahr = (h.brutto + (h.kindEink || 0)) * 12;
      const gr = (w) => (h.persons <= 1 ? w.ein : w.zwei + (h.persons - 2) * w.weitere) + h.children * w.kind;
      const L = R.wbsLand[h.land];
      if (L) {
        const grenze = gr(L), land = BL_NAME[h.land];
        if (jahr <= grenze) return mk(id, 'ja', 'ja', [['wbs.landGrenze', { land, grenze: eur(grenze), stand: L.stand }], ['wbs.landStelle']]);
        // Höchstens 30 % Abzüge (§ 16 WoFG und Landesrecht); darüber hinaus auch nicht mit der höchsten Landesstufe
        // 5 % Reserve, weil die Länder ihre Grenzen jährlich erhöhen (ältere Werte dürfen kein falsches „nein“ ergeben)
        if (L.hoch && jahr * (1 - R.wbs.maxAbzug) > grenze * L.hoch * 1.05) return mk(id, 'nein', 'einkoHoch', [['wbs.landHoch', { land, grenze: eur(grenze * L.hoch) }]]);
        return mk(id, 'vielleicht', 'vielleicht', [['wbs.landUeber', { land, grenze: eur(grenze), stand: L.stand }], ['wbs.landStelle']]);
      }
      const bund = gr(R.wbsBund);
      return jahr <= bund ? mk(id, 'ja', 'ja', [['wbs.landJa', { grenze: eur(bund) }], ['wbs.landStelle']]) : mk(id, 'vielleicht', 'vielleicht', [['wbs.landEigen'], ['wbs.landStelle']]);
    }
    const grenze = wbsGrenze(h, false), max = wbsGrenze(h, true);
    const jahr = (h.brutto + (h.kindEink || 0)) * 12;
    const gd = gdbNum(h), pg = h.pflegegrad > 0;
    const frei = (gd === 100 || (gd >= 80 && pg) ? R.wbs.schwerbFreiHoch : gd >= 50 && pg ? R.wbs.schwerbFreiPflege : 0) + (h.bhWeitere || 0) * R.wbs.schwerbFreiPflege;
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
    blindengeld: 'Landesblindengeld', pflegeplus: 'Verhinderungspflege und Pflegehilfsmittel', arbeit: 'Budget für Arbeit',
    rundfunk: 'Befreiung vom Rundfunkbeitrag', zuzahl: 'Befreiung von Zuzahlungen', bab: 'Berufsausbildungsbeihilfe',
    wbs: 'Wohnberechtigungsschein', alg1: 'Arbeitslosengeld I', krankengeld: 'Krankengeld', srente: 'Altersrente für schwerbehinderte Menschen', elterngeld: 'Elterngeld', hzp: 'Hilfe zur Pflege', lpg: 'Landespflegegeld (Bayern)', mutter: 'Mutterschaftsgeld', kkg: 'Kinderkrankengeld', blh: 'Blindenhilfe (Sozialhilfe)', asylblg: 'Asylbewerberleistungen'
  };
  // Unterlagen der neuen Karten: gemeinsame Schlüssel (u.*), damit nicht jede Karte eigene Texte braucht
  const NEWSTEPS = {
    kgBeh: ['u.ausweis', 'u.arzt', 'u.steuerid'], emrente: ['u.ausweis', 'u.arzt', 'u.rentenverlauf'],
    eingl: ['u.ausweis', 'u.arzt', 'u.einkommen'], ausweis: ['u.ausweis', 'u.arzt', 'u.foto'],
    blindengeld: ['u.ausweis', 'u.arzt', 'u.bescheide'], pflegeplus: ['u.versichertenkarte', 'u.pflegebescheid', 'u.kosten'],
    arbeit: ['u.ausweis', 'u.arzt', 'u.vertrag'], rundfunk: ['u.beitragsnr', 'u.bescheide', 'u.ausweis'],
    zuzahl: ['u.versichertenkarte', 'u.quittungen', 'u.einkommen'], bab: ['u.ausbildungsvertrag', 'u.einkommen', 'u.mietvertrag'],
    wbs: ['u.einkommen', 'u.ausweis', 'u.haushalt'],
    srente: ['u.ausweis', 'u.arzt', 'u.rentenverlauf'],
    elterngeld: ['u.geburtsurkunde', 'u.lohnabrechnung', 'u.steuerid'], hzp: ['u.pflegebescheid', 'u.einkommen', 'u.kosten'], lpg: ['u.pflegebescheid', 'u.ausweis', 'u.bescheide'], mutter: ['u.arzt', 'u.versichertenkarte', 'u.lohnabrechnung'], kkg: ['u.arzt', 'u.versichertenkarte', 'u.lohnabrechnung'], blh: ['u.ausweis', 'u.bescheide', 'u.einkommen'], asylblg: ['u.ausweis', 'u.aufenthalt', 'u.einkommen'],
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


  // ---------------------------------------------------------------
  // Zuständige Stellen außerhalb Bayerns (ohne Anschrift). Nur Einträge, die als gesichert gelten; sonst die allgemeine Angabe ('_').
  // In Bayern nennt die App die Stelle mit Anschrift (behoerden.js). Bitte fachlich prüfen (Prüfliste).
  // ---------------------------------------------------------------
  const BL_NAME = { BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg', HE: 'Hessen', MV: 'Mecklenburg-Vorpommern',
    NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen' };
  const ZUST_LAND = {
    ausweis: {
      _: 'Versorgungsamt deines Bundeslandes',
      BW: 'Landratsamt bzw. Stadtkreis (Versorgungsamt)', BE: 'Landesamt für Gesundheit und Soziales (LAGeSo)', BB: 'Landesamt für Soziales und Versorgung (LASV)',
      HB: 'Amt für Versorgung und Integration Bremen', HH: 'Versorgungsamt Hamburg', HE: 'Hessisches Amt für Versorgung und Soziales',
      MV: 'Landesamt für Gesundheit und Soziales (LAGuS)', NI: 'Niedersächsisches Landesamt für Soziales, Jugend und Familie', NW: 'Kreis bzw. kreisfreie Stadt (Versorgungsamt)',
      RP: 'Landesamt für Soziales, Jugend und Versorgung', SL: 'Landesamt für Soziales', SN: 'Landratsamt bzw. kreisfreie Stadt (Versorgungsamt)',
      ST: 'Landesverwaltungsamt Sachsen-Anhalt (Versorgungsamt)', SH: 'Landesamt für soziale Dienste'
    },
    blindengeld: {
      _: 'Stelle für das Landesblindengeld (das Sozialamt deines Kreises oder deiner Stadt sagt dir, wer zuständig ist)',
      BE: 'Landesamt für Gesundheit und Soziales (LAGeSo)', HE: 'Landeswohlfahrtsverband Hessen', NW: 'Landschaftsverband Rheinland bzw. Westfalen-Lippe',
      ST: 'Sozialagentur Sachsen-Anhalt', BW: 'Landratsamt bzw. Stadtkreis'
    },
    elterngeld: {
      _: 'Elterngeldstelle deines Kreises oder deiner Stadt',
      BW: 'L-Bank (Elterngeldstelle)', BE: 'Elterngeldstelle des Bezirksamts', HH: 'Elterngeldstelle des Bezirksamts', HE: 'Hessisches Amt für Versorgung und Soziales',
      MV: 'Landesamt für Gesundheit und Soziales (LAGuS)', SL: 'Landesamt für Soziales', SH: 'Landesamt für soziale Dienste'
    },
    eingl: {
      _: 'Träger der Eingliederungshilfe (meist der Landkreis oder die kreisfreie Stadt; bei seelischer Behinderung von Kindern das Jugendamt)',
      HE: 'Landeswohlfahrtsverband Hessen (Erwachsene), Kreis oder Stadt (Kinder)', NW: 'Landschaftsverband Rheinland bzw. Westfalen-Lippe (Erwachsene), Kreis oder Stadt (Kinder)',
      SL: 'Landesamt für Soziales', ST: 'Sozialagentur Sachsen-Anhalt', BE: 'Bezirksamt (Teilhabefachdienst)'
    },
    arbeit: { _: 'Träger der Eingliederungshilfe (meist der Landkreis oder die kreisfreie Stadt)', HE: 'Landeswohlfahrtsverband Hessen', NW: 'Landschaftsverband Rheinland bzw. Westfalen-Lippe' },
    hzp: { _: 'Sozialamt deines Kreises oder deiner Stadt' },
    blh: { _: 'Sozialamt deines Kreises oder deiner Stadt' },
    wbs: { _: 'Wohnungsamt deiner Stadt oder Gemeinde' }
  };
  const zustLand = (id, land) => (land && land !== 'BY' && ZUST_LAND[id] ? (ZUST_LAND[id][land] || ZUST_LAND[id]._) : null);

  // Hinweise zum Unterhalt, den die Person selbst zahlt (nur wo er die Einstufung beeinflussen kann)
  function uzHinweise(h, results) {
    if (!(h.uzBetrag > 0)) return;
    const u = { u: eur(h.uzBetrag) };
    results.forEach(function (r) {
      if (r.level === 'na' || (r.level === 'nein' && r.hl !== 'einkoHoch' && r.hl !== 'einkoNiedrig')) return;
      if (r.id === 'wohngeld') r.tx = r.tx.concat([['uz.wg', u]]);
      else if (r.id === 'kiz' || r.id === 'ggeld') r.tx = r.tx.concat([[h.uzTitel ? 'uz.sgb2Titel' : 'uz.sgb2Ohne', u]], r.id === 'ggeld' && r.level !== 'nein' ? [['uz.selbstbehalt']] : []);
      else if (r.id === 'gsa') r.tx = r.tx.concat([['uz.gsa', u], ['uz.selbstbehalt']]);
    });
  }

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
      alg1(h), krankengeld(h), elterngeld(h), mutterschaftsgeld(h), kinderkrankengeld(h), hilfeZurPflege(h), landespflegegeld(h), asylbewerber(h), kindergeldBeh(h), erwerbsminderungsrente(h), schwerbRente(h), eingliederungshilfe(h), pauschbetrag(h), ausweis(h), blindengeld(h), blindenhilfe(h),
      pflegeplus(h), budgetArbeit(h), rundfunk(h, gg, gsa), zuzahlung(h), bab(h), wbs(h)].map(angabeFehlt(h)).map((x, i) => ({ ...x, name: NAMES[x.id], order: i, steps: STEPS[x.id] }));
    uzHinweise(h, results);
    const sorted = results.slice().sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.order - b.order);
    return { h, results: sorted, zusammen: zusammenspiel(h, results) };
  }

  return { evaluate, RULES: R, WG, limits, wgYmax, wgMiete, wgCap, wgHeiz, roman, sgb2Freibetrag, haushaltsFreibetrag, derive, NAMES, STEPS, ZUST_LAND, zustLand };
})();

if (typeof module !== 'undefined') module.exports = Rules;
