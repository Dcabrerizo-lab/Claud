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
    // Wohnkostenanteil der Eltern (§ 6a Abs. 5 BKGG): Tabelle der Familienkasse nach dem Existenzminimumbericht
    // (DA-KiZ C.3.1.2, Stand 20.02.2026), Index = Zahl der Kinder 1-10; ab 10 Kindern gilt der Wert für 10
    kiz: { vermZwei: 55000, vermDrei: 70000, vermJeWeiteres: 15000, max: 297, minAlleinerziehend: 600, minPaar: 900, anrechnung: 0.45, puffer: 300, ampelGruenAb: 60,
      wohnAllein: [1, 0.77, 0.63, 0.53, 0.46, 0.40, 0.36, 0.33, 0.30, 0.27, 0.25], wohnPaar: [1, 0.83, 0.71, 0.62, 0.55, 0.50, 0.45, 0.41, 0.38, 0.35, 0.33] },
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
    // Netto aus Brutto (Lohn). Programmablaufplan Lohnsteuer 2026 (BMF 12.11.2025, endgültig): Tarif § 32a EStG 2026, Grundfreibetrag 12.348 €,
    // Grenzen der Steuerklassen V/VI, Kinderfreibetrag 9.756 €, Soli-Freigrenze 20.350 €, Grenzen der Vorsorgepauschale (BBG 2026).
    // 2027: Programmablaufplan 2027 bei Stand 19.11.2026 nur als Entwurf, Tarifänderung noch im Gesetzgebungsverfahren -> Steuer weiter nach 2026.
    // Sozialversicherung (Arbeitnehmeranteil): RV 9,3 %, AV 1,3 %, KV 7,3 % (halber allgemeiner Beitragssatz 14,6 %, § 241 und § 249 SGB V) + halber durchschnittlicher Zusatzbeitrag (2026 und 2027: 2,9 %,
    // BMG-Bekanntmachungen 7.11.2025 und 30.10.2026), PV 1,8 % (Sachsen 2,3 %), kinderlos +0,6, ab dem 2. Kind je -0,25 (§ 55 SGB XI).
    // Beitragsbemessungsgrenzen im Monat: 2026 RV 8.450 €, KV 5.812,50 € (SVBezGrV 2026); 2027 RV 8.850 €, KV 6.375 € (Kabinett 7.10.2026).
    // Übergangsbereich bis 2.000 € (§ 20 Abs. 2 SGB IV).
    // kvBasis 7,0 % (halber ermäßigter Beitragssatz) nur für die Vorsorgepauschale der Lohnsteuer (Programmablaufplan), kvAn 7,3 % für den echten Beitrag.
    // Rente (gesetzlich pflichtversichert, abgerufen 19.11.2026): KV allgemeiner Beitragssatz und Zusatzbeitrag aus der Rente (§ 247 SGB V),
    // davon trägt die Rentenversicherung die Hälfte (§ 249a SGB V) -> 7,3 % + halber Zusatzbeitrag. Pflege trägt die rentenbeziehende Person allein
    // (§ 59 Abs. 1 SGB XI): 3,6 % seit der Beitragssatz-Anpassung zum 1.1.2025 (der Gesetzestext § 55 Abs. 1 SGB XI nennt noch 3,4 %),
    // Abschlag 0,25 je Kind vom 2. bis 5. Kind unter 25 (§ 55 Abs. 3 SGB XI). Netto aus Brutto ohne Kinderlosen-Zuschlag und ohne Steuer
    // (vorsichtig: eher höheres Netto); Brutto aus Netto ohne Kinder im Haushalt mit Zuschlag 0,6 (vorsichtig: eher höheres Brutto).
    // Nicht eingerechnet: arbeitende Altersrentner (Lohn ohne RV/AV-Beitrag, KV 7,0 %), Pflegereform 2027 (Entwurf: Kinderlosen-Zuschlag 0,9).
    lohn: {
      pap2026: { gfb: 12348, z2: 17800, a2: 914.51, z3: 69879, a3: 173.1, c3: 1034.87, z4: 277826, c4: 11135.63, c5: 19470.38,
        w1: 14071, w2: 34939, w3: 222260, kfb: 9756, solzFrei: 20350, papBbgRV: 101400, papBbgKV: 69750,
        rvAn: 0.093, avAn: 0.013, kvBasis: 0.07, kvAn: 0.073, pv: 0.018, pvSachsen: 0.023, pvKinderlos: 0.006, pvAbschlag: 0.0025 },
      bbg2026: { rv: 8450, kv: 5812.5 }, bbg2027: { rv: 8850, kv: 6375 },
      kvz2026: 2.9, kvz2027: 2.9, uebergangBis: 2000,
      rente: { kvHalb: 0.073, pv: 0.036 }
    },
    // Pfändungsfreigrenzenbekanntmachung 2026 (BGBl. 2026 I Nr. 80 vom 26.3.2026), gilt 1.7.2026 bis 30.6.2027: Grundfreibetrag 1.587,40 €,
    // Erhöhung für die erste unterhaltsberechtigte Person 597,42 €, für die zweite bis fünfte je 332,83 €, Höchstgrenze 4.866,30 € (§ 850c ZPO)
    // Zinsen, Dividenden, ETF-Ausschüttungen (Jahr): Grundsicherungsgeld bis 100 € im Kalenderjahr frei (§ 1 Abs. 1 Nr. 3 GrusiGV),
    // der Rest zählt als Einkommen (§ 11 SGB II). Wohngeld: Kapitalerträge gehören zum Jahreseinkommen (§ 14 WoGG i. V. m. § 20 EStG),
    // die App rechnet vorsichtig ohne Sparer-Pauschbetrag. Vermögen: geförderte Altersvorsorge (Riester, Basisrente/Rürup, Betriebsrente)
    // zählt nicht (§ 12 Abs. 1 Satz 2 Nr. 3 SGB II, § 90 Abs. 2 Nr. 2 SGB XII, WoGVwV 21.37); Lebens- und Rentenversicherungen sind geschützt,
    // wenn sie der Altersvorsorge dienen (Einzelfall) -> nur „möglich“, wenn sie über die Grenze bringen.
    // Wohngeld: Kapitalerträge bis 100 € im Jahr bleiben außer Betracht (§ 14 Abs. 2 Nr. 15 WoGG)
    kap: { freiSGB2Jahr: 100, freiWGJahr: 100 },
    // Familienversicherung (§ 10 SGB V): Gesamteinkommen bis 1/7 der monatlichen Bezugsgröße (2026: 3.955 € -> 565 €; 2027: 4.130 € -> 590 €,
    // SV-Rechengrößenverordnung 2026, Kabinett 7.10.2026 für 2027), bei Minijob bis zur Minijob-Grenze. Kinder bis 18, ohne Arbeit bis 23,
    // in Schule, Ausbildung oder Studium bis 25, mit Behinderung ohne Altersgrenze.
    famvers: { bezug2026: 3955, bezug2027: 4130 },
    pfaendung: { grund: 1587.4, erste: 597.42, weitere: 332.83, hoechst: 4866.3, gueltigBis: '2027-06-30' },
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
    // pausch: ein Zwölftel des Arbeitnehmer-Pauschbetrags (§ 2c Abs. 1 BEEG). Bleibt bei 1.000 € / 12, obwohl der Wortlaut 1.230 € nahelegt:
    // Der Elterngeldrechner des Bundes rechnet nachweislich so (alle 33 Referenzfälle auf den Cent).
    eg: { pausch: 1000 / 12, bonus: 0.1, bonusMin: 75, min: 300, max: 1800, satz: 0.67, satzHoch: 0.65, grenzeUnten: 1000, grenzeOben: 1200, monate: 12, partner: 2, einkommenGrenze: 175000 },
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
    // Landesgrenzen für den WBS (Jahres-Gesamteinkommen; geprüft 11/2026 an amtlichen Quellen, siehe docs/WBS-GRENZEN.md).
    // hoch: höchste Stufe (Faktor) für eingeschränkte/erhöhte Scheine; rund: Grenze auf volle 100 € aufrunden; plus1/plus2: Zuschlag
    // für Ein- und Zweipersonenhaushalte (Schleswig-Holstein). Ohne Eintrag (Saarland): Bundeswerte als sichere Untergrenze.
    //  BW: Erlass MLW 1.12.2025, Bezugsgröße 71.000 € - 15 % = 60.350 € für 1-2 Personen, +9.000 € ab der 3. Person
    //  BE: Bundeswerte +40 % (WBS 140); erhöhte Stufen WBS 180 und WBS 220 (berlin.de)
    //  BB: § 22 BbgWoFG, Bekanntmachung MIL 6.6.2023 (Amtsblatt 28/2023), ab 1.1.2024; Kind +2.000 € (§ 22 Abs. 4)
    //  HB: Bundeswerte +10 % (uneingeschränkter Schein), eingeschränkt bis +60 % (Senatorin für Bau, Erläuterungen zum Antrag)
    //  HH: § 8 HmbWoFG (wie Bund) +60 % im 1. Förderweg, bis +140 % im 3. Förderweg (hamburg.de)
    //  HE: § 5 HWoFG, ab 1.1.2026 (Hessisches Wirtschaftsministerium)
    //  MV: Einkommensgrenzenverordnung MV, 1. Förderweg (2. Förderweg 27.000 € allein), laut Hansestadt Rostock 7/2026
    //  NI: § 3 Abs. 2 NWoFG ab 1.3.2025 (Kind +3.750 €)
    //  NW: § 13 WFNG NRW mit Einkommenserlass Wohnen (MB.NRW 2025 Nr. 88, 2026 Nr. 82), Gruppe B bis +40 %
    //  RP: § 13 LWoFG, Bekanntmachung FM 12.12.2025, ab 1.1.2026, aufgerundet auf 100 €; „speziell“ bis +60 %
    //  SH: § 8 SHWoFG mit § 7 Abs. 2, § 9 Abs. 2 SHWoFG-DVO, Dynamisierung ab 1.1.2025; 2./3. Förderweg +20 %/+40 %
    //  SN: Sächsische Einkommensgrenzen-Verordnung vom 2.12.2025, ab 1.1.2026
    //  ST: Bundeswerte (§ 9 WoFG), je nach Landesprogramm +20 %
    //  TH: § 10 ThürWoFG; Richtlinie bis +40 %
    wbsLand: {
      BW: { ein: 60350, zwei: 60350, weitere: 9000, kind: 0, hoch: 0, stand: '1.12.2025' },
      BE: { ein: 16800, zwei: 25200, weitere: 5740, kind: 700, hoch: 2.2 / 1.4, stand: '2026' },
      BB: { ein: 18500, zwei: 26000, weitere: 5800, kind: 2000, hoch: 0, stand: '1.1.2024' },
      HB: { ein: 13200, zwei: 19800, weitere: 4510, kind: 550, hoch: 1.6 / 1.1, stand: '2026' },
      HH: { ein: 19200, zwei: 28800, weitere: 6560, kind: 800, hoch: 2.4 / 1.6, stand: '2026' },
      HE: { ein: 20146, zwei: 30565, weitere: 6948, kind: 924, hoch: 0, stand: '1.1.2026' },
      MV: { ein: 25800, zwei: 38700, weitere: 8800, kind: 1500, hoch: 27000 / 25800, stand: '7/2026' },
      NI: { ein: 21250, zwei: 28750, weitere: 3750, kind: 3750, hoch: 0, stand: '1.3.2025' },
      NW: { ein: 23540, zwei: 28350, weitere: 6530, kind: 860, hoch: 1.4, stand: '1.1.2025' },
      RP: { ein: 19998.91, zwei: 28665.10, weitere: 6666.31, kind: 1333.25, rund: 100, hoch: 1.6, stand: '1.1.2026' },
      SH: { ein: 19945.94, zwei: 29918.91, weitere: 6925.68, kind: 831.08, rund: 100, plus1: 3000, plus2: 2000, hoch: 1.4, stand: '1.1.2025' },
      SN: { ein: 20520, zwei: 30780, weitere: 7011, kind: 855, hoch: 0, stand: '1.1.2026' },
      ST: { ein: 12000, zwei: 18000, weitere: 4100, kind: 500, hoch: 1.2, stand: '2026' },
      TH: { ein: 14400, zwei: 21600, weitere: 5000, kind: 1000, hoch: 1.4, stand: '2026' },
    },
    // WBS-Stufen je Land (gleiche Quellen wie wbsLand, docs/WBS-GRENZEN.md): [Name, Faktor auf die Landesgrenze oder eigene Werte].
    // Wohnungen werden für eine Stufe gefördert; wer eine niedrigere Stufe erfüllt, kommt auch an Wohnungen der höheren Stufen.
    wbsStufen: {
      BE: [['WBS 140', 1], ['WBS 180', 1.8 / 1.4], ['WBS 220', 2.2 / 1.4]],
      HB: [['uneingeschränkter WBS', 1], ['eingeschränkter WBS', 1.6 / 1.1]],
      HH: [['1. Förderweg', 1], ['2. Förderweg', 2 / 1.6], ['3. Förderweg', 2.4 / 1.6]],
      MV: [['1. Förderweg', 1], ['2. Förderweg', { ein: 27000, zwei: 40500, weitere: 9200, kind: 1500 }]],
      NW: [['Einkommensgruppe A', 1], ['Einkommensgruppe B', 1.4]],
      RP: [['allgemeine Grenze', 1], ['erhöhte Grenze („speziell“)', 1.6]],
      SH: [['1. Förderweg', 1], ['2. Förderweg', 1.2], ['3. Förderweg', 1.4]],
      ST: [['allgemeine Grenze', 1], ['Landesprogramme', 1.2]],
      TH: [['allgemeine Grenze', 1], ['Förderrichtlinie', 1.4]]
    },
    // Freibetrag beim Wohngeld für eigenes Einkommen von Kindern (16 bis 24 Jahre): 1.200 € im Jahr (§ 17 Nr. 4 WoGG)
    wgKindFrei: 100,
    // Werbungskosten-Pauschbeträge im Jahr (§ 9a Satz 1 Nr. 1 und 3 EStG), beim Wohngeld vom Einkommen abgezogen (§ 14 Abs. 1 WoGG)
    wgWerbung: { lohn: 1230, rente: 102 },
    // Pauschalabzug beim Wohngeld (§ 16 WoGG) je Einkommensart: [kleinster, größter] üblicher Abzug
    wgAbzug: { lohn: [0.1, 0.3], rente: [0.1, 0.2], kg: [0.1, 0.2], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.1], ohne: [0, 0] },
    // Wenn nur die Auszahlung bekannt ist: Rente netto ≈ 0,87 bis 0,88 × Brutto (nettoRente), also 90 % (bzw. 80 %) Brutto ≈ 103 % (bzw. 91 %)
    // der Auszahlung. Die Werte [0, 0,06] stammen aus der alten Annahme 0,89 und sind deshalb nur ungefähr (Prüfung 19.11.2026, Anpassung offen);
    // Lohn netto 70-80 %
    wgAbzugAuszahlung: { lohn: [0, 0.12], rente: [0, 0.06], kg: [0, 0.06], alg: [0, 0], eg: [0, 0], wfbm: [0, 0.05], ohne: [0, 0] },
    // Grundrentenfreibetrag (§ 82a SGB XII): bei 33 Jahren Grundrentenzeiten bleiben von der Rente 100 € und 30 % des Rests frei, höchstens 50 % der Regelbedarfsstufe 1
    grundrente: { sockel: 100, quote: 0.3, max: 0.5 },
    // Zusätzliche Altersvorsorge (Betriebsrente, Riester-Rente, private Rente), § 82 Abs. 4 SGB XII: 100 € frei und 30 % des Rests,
    // höchstens 50 % der Regelbedarfsstufe 1 (gilt für die Grundsicherung im Alter und bei Erwerbsminderung, nicht für das Grundsicherungsgeld)
    vorsorge: { sockel: 100, quote: 0.3, max: 0.5 },
    // Regelaltersgrenze (§ 235 SGB VI) in Monaten über 65, je Geburtsjahr 1947..1963; ab 1964: 67 Jahre
    rag: { 1947: 1, 1948: 2, 1949: 3, 1950: 4, 1951: 5, 1952: 6, 1953: 7, 1954: 8, 1955: 9, 1956: 10, 1957: 11, 1958: 12, 1959: 14, 1960: 16, 1961: 18, 1962: 20, 1963: 22 },
    // Unterhaltsvorschuss 2026 (§ 2 Abs. 1 und 2 UVG): Mindestunterhalt 486 / 558 / 653 € (Düsseldorfer Tabelle 1.1.2026) minus volles
    // Kindergeld 259 € (BMBFSFJ, Einlegeblatt Leistungen für Alleinerziehende, Stand Januar 2026). min12: § 1 Abs. 1a Nr. 2 UVG.
    // Eigenes Einkommen des Kindes nach der allgemeinbildenden Schule (§ 2 Abs. 4 UVG): abzüglich 1/12 des Arbeitnehmer-Pauschbetrags
    // (1.230 € / 12 = 102,50 €, § 9a EStG), in Ausbildung zusätzlich 100 € ausbildungsbedingter Aufwand, Rest zur Hälfte (familienportal.de, 11/2026)
    uvg: { bis5: 227, bis11: 299, bis17: 394, min12: 600, wk: 102.5, azubi: 100, haelfte: 0.5 },
    // Gezahlter Unterhalt (Höchstbeträge im Monat für das Wohngeld, § 18 WoGG: 3.000 € im Jahr je Kind oder sonstiger Person,
    // 6.000 € im Jahr für frühere oder dauernd getrennt lebende Ehe- oder Lebenspartner)
    uzWG: { kind: 250, ex: 500 },
    // Auto: im SGB II ist ein angemessenes Auto je erwerbsfähiger Person geschützt. Eine feste Grenze nennt das Gesetz nicht;
    // bis 2026 galt nach den Weisungen ein Wert bis 15.000 € als angemessen. Darüber prüft das Jobcenter -> nur „möglich“.
    autoPruefen: 15000,
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
  // Stand 19.11.2026: Die Kürzung aus dem Entwurf BT-Drs. 21/8284 entfällt laut Koalitionseinigung vom 11.11.2026, die Dynamisierung
  // zum 1.1.2027 wird ausgesetzt (Haushaltsbegleitgesetz 2027). Noch nicht endgültig beschlossen; die Werte 2026 gelten weiter.
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
  // Anlage 3 WoGG (Fassung ab 1.1.2025): Liegen M oder Y unter diesen Werten, wird mit ihnen gerechnet
  const WG_MMIN = [54, 67, 79, 92, 103, 103, 115, 128, 140, 152, 187, 298], WG_YMIN = [396, 679, 906, 1132, 1358, 1585, 1811, 2037, 2264, 2490, 2717, 2943];
  function wgBetrag(n, M, Y) {
    const [a, b, c] = WGF[wgIdx(n)];
    M = Math.max(M, WG_MMIN[wgIdx(n)]); Y = Math.max(Y, WG_YMIN[wgIdx(n)]);
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
  // heizIst: angegebene Heizkosten; ohne Angabe wird die Heizkostenkomponente als Näherung abgezogen
  function wgMiete(stufe, n, warm, factor, heizIst) {
    const heiz = wgHeiz(n), cap = wgCap(stufe, n);
    if (!(warm > 0)) return cap + heiz;
    const kalt = Math.max(0, warm - (heizIst > 0 && heizIst < warm ? heizIst : heiz));
    return Math.min(factor * kalt, cap) + heiz;
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
  // Netto aus Brutto (Lohn): Lohnsteuer nach dem amtlichen Programmablaufplan 2026 (BMF-Schreiben vom 12.11.2025,
  // Anlage 1, endgültig) für den Monatslohn, gesetzlich versichert, ohne Versorgungsbezüge und Einmalzahlungen.
  // Dazu die Arbeitnehmeranteile zur Sozialversicherung (Minijob, Übergangsbereich nach § 20 Abs. 2a SGB IV, normal).
  // Rundungen wie im Programmablaufplan (abrunden bzw. aufrunden auf Cent oder Euro); geprüft gegen eine
  // unabhängige Umsetzung des Programmablaufplans (test/test-netto.js).
  // ---------------------------------------------------------------
  const ab2 = (x) => Math.floor(x * 100 + 1e-7) / 100; // auf Cent abrunden
  const ab0 = (x) => Math.floor(x + 1e-9); // auf Euro abrunden
  const auf0 = (x) => Math.ceil(x - 1e-9); // auf Euro aufrunden
  const ab6 = (x) => Math.floor(x * 1e6 + 1e-4) / 1e6;
  function lohnParam(heute) {
    const L = R.lohn, j27 = heute >= 2027;
    return { ...L.pap2026, bbgRV: j27 ? L.bbg2027.rv : L.bbg2026.rv, bbgKV: j27 ? L.bbg2027.kv : L.bbg2026.kv, kvz: j27 ? L.kvz2027 : L.kvz2026,
      minijob: j27 ? R.minijob2027 : R.minijob, uebergang: L.uebergangBis };
  }
  // Einkommensteuertarif § 32a EStG wie UPTAB26 (X = zu versteuerndes Einkommen, bei Steuerklasse III halbiert)
  function tarif(X, P) {
    let st;
    if (X < P.gfb + 1) st = 0;
    else if (X < P.z2) { const y = ab6((X - P.gfb) / 10000); st = ab0((y * P.a2 + 1400) * y); }
    else if (X < P.z3) { const y = ab6((X - (P.z2 - 1)) / 10000); st = ab0((y * P.a3 + 2397) * y + P.c3); }
    else if (X < P.z4) st = ab0(X * 0.42 - P.c4);
    else st = ab0(X * 0.45 - P.c5);
    return st;
  }
  // Steuerklasse V und VI (MST5_6)
  function st56(ZZX, P) {
    const up = (ZX) => {
      const st1 = tarif(ab0(ZX * 1.25), P), st2 = tarif(ab0(ZX * 0.75), P);
      return Math.max(ab0(ZX * 0.14), (st1 - st2) * 2);
    };
    if (ZZX > P.w2) {
      let st = up(P.w2);
      if (ZZX > P.w3) { st = ab0(st + (P.w3 - P.w2) * 0.42); st = ab0(st + (ZZX - P.w3) * 0.45); }
      else st = ab0(st + (ZZX - P.w2) * 0.42);
      return st;
    }
    let st = up(ZZX);
    if (ZZX > P.w1) { const vergl = st; const hoch = ab0(up(P.w1) + (ZZX - P.w1) * 0.42); st = Math.min(hoch, vergl); }
    return st;
  }
  // o: { stkl 1-6, kinder (Zahl der Kinderfreibeträge, nur für Soli und Kirchensteuer), kinderlos (Zuschlag Pflege),
  //      pva (Abschläge Pflege ab dem 2. Kind unter 25, 0-4), sachsen, kirche (Satz 0, 0.08 oder 0.09), heute }
  function lohnsteuerMonat(brutto, o) {
    const P = lohnParam(o.heute || 2026);
    const stkl = [1, 2, 3, 4, 5, 6].indexOf(o.stkl) >= 0 ? o.stkl : 1;
    const ZRE4J = ab2(brutto * 12);
    const kvSatz = P.kvBasis + (o.kvz != null ? o.kvz : P.kvz) / 100 / 2;
    let pvSatz = o.sachsen ? P.pvSachsen : P.pv;
    pvSatz = o.kinderlos ? pvSatz + P.pvKinderlos : pvSatz - Math.min(4, Math.max(0, o.pva | 0)) * P.pvAbschlag;
    // Vorsorgepauschale (UPEVP, MVSPKVPV, MVSPHB) mit den Grenzen des Programmablaufplans
    const vspr = ab2(Math.min(ZRE4J, P.papBbgRV) * P.rvAn);
    const vspkvpv = ab2(Math.min(ZRE4J, P.papBbgKV) * (kvSatz + pvSatz));
    let vsp = auf0(vspkvpv + vspr);
    if (stkl !== 6) {
      const vsphb = Math.min(1900, ab2(ab2(P.avAn * Math.min(ZRE4J, P.papBbgRV)) + vspkvpv));
      vsp = Math.max(vsp, auf0(vspr + vsphb));
    }
    // Tabellenfreibeträge (MZTABFB)
    let anp = 0;
    if (stkl < 6 && ZRE4J > 0) anp = ZRE4J < 1230 ? auf0(ZRE4J) : 1230;
    const sap = stkl < 6 ? 36 : 0, efa = stkl === 2 ? 4260 : 0, kztab = stkl === 3 ? 2 : 1;
    const kfbJe = stkl === 4 ? P.kfb / 2 : stkl <= 3 ? P.kfb : 0;
    const jahresSteuer = (ztabfb) => {
      let zve = ZRE4J - ztabfb - vsp;
      if (zve < 1) zve = 0;
      const X = ab0(zve / kztab);
      return stkl < 5 ? tarif(X, P) * kztab : st56(X, P);
    };
    const ztabfb = ab2(efa + anp + sap);
    const lstJahr = jahresSteuer(ztabfb);
    const lst = ab0(lstJahr * 100 / 12) / 100;
    // Solidaritätszuschlag und Kirchensteuer mit Kinderfreibeträgen (MSOLZ)
    const kinder = Math.max(0, Number(o.kinder) || 0);
    const jbmg = kinder > 0 ? jahresSteuer(ab2(ztabfb + ab0(kinder * kfbJe))) : lstJahr;
    let soli = 0;
    const frei = P.solzFrei * kztab;
    if (jbmg > frei) {
      const solzj = Math.min(ab2(jbmg * 5.5 / 100), ab2((jbmg - frei) * 11.9 / 100));
      soli = ab0(ab0(solzj * 100) / 12) / 100;
    }
    const kist = o.kirche ? Math.round(ab0(jbmg * 100 / 12) / 100 * o.kirche * 100) / 100 : 0;
    return { lst, soli, kist };
  }
  // Arbeitnehmeranteile Sozialversicherung im Monat
  function svMonat(brutto, o) {
    const P = lohnParam(o.heute || 2026);
    if (brutto <= P.minijob) return 0; // Minijob: wie bisher in der App ohne Abzüge (Befreiung von der Rentenversicherung häufig)
    const kvSatz = P.kvAn + (o.kvz != null ? o.kvz : P.kvz) / 100 / 2;
    let pvSatz = o.sachsen ? P.pvSachsen : P.pv;
    pvSatz = o.kinderlos ? pvSatz + P.pvKinderlos : pvSatz - Math.min(4, Math.max(0, o.pva | 0)) * P.pvAbschlag;
    // Übergangsbereich: reduzierte beitragspflichtige Einnahme für den Arbeitnehmeranteil (§ 20 Abs. 2a Satz 6 SGB IV)
    const be = brutto <= P.uebergang ? P.uebergang / (P.uebergang - P.minijob) * (brutto - P.minijob) : brutto;
    const rvav = Math.min(be, P.bbgRV) * (P.rvAn + P.avAn), kvpv = Math.min(be, P.bbgKV) * (kvSatz + pvSatz);
    return Math.round((rvav + kvpv) * 100) / 100;
  }
  function nettoLohn(brutto, o) {
    o = o || {};
    brutto = Math.max(0, Number(brutto) || 0);
    if (!brutto) return { netto: 0, lst: 0, soli: 0, kist: 0, sv: 0 };
    const P = lohnParam(o.heute || 2026);
    // Minijob: Lohnsteuer zahlt in der Regel der Arbeitgeber pauschal (§ 40a EStG)
    const t = brutto <= P.minijob ? { lst: 0, soli: 0, kist: 0 } : lohnsteuerMonat(brutto, o);
    const sv = svMonat(brutto, o);
    return { netto: Math.round((brutto - t.lst - t.soli - t.kist - sv) * 100) / 100, lst: t.lst, soli: t.soli, kist: t.kist, sv };
  }
  // Rente netto: Kranken- und Pflegeversicherung der Rentnerinnen und Rentner (§ 247 SGB V, § 59 und § 55 SGB XI), bis zur Beitragsbemessungsgrenze KV.
  // o.kinder = Kinder im Haushalt (Näherung für Kinder unter 25); o.kinderlos = mit Zuschlag 0,6 (§ 55 Abs. 3 SGB XI). Ohne Steuer.
  function nettoRente(brutto, o) {
    o = o || {};
    brutto = Math.max(0, Number(brutto) || 0);
    const P = lohnParam(o.heute || 2026), RR = R.lohn.rente;
    const pvR = o.kinderlos ? RR.pv + P.pvKinderlos : RR.pv - P.pvAbschlag * Math.min(4, Math.max(0, (o.kinder | 0) - 1));
    const satz = RR.kvHalb + (o.kvz != null ? o.kvz : P.kvz) / 200 + pvR;
    return Math.round((brutto - Math.min(brutto, P.bbgKV) * satz) * 100) / 100;
  }
  // Umgekehrt: Brutto zu einer Rente netto (auf 1 € genau). Ohne Kinder im Haushalt mit Kinderlosen-Zuschlag (vorsichtig: eher höheres Brutto).
  function bruttoAusNettoRente(netto, o) {
    netto = Math.max(0, Number(netto) || 0);
    if (!netto) return 0;
    o = Object.assign({}, o, { kinderlos: !((o && o.kinder) > 0) });
    let lo = netto, hi = netto * 1.5 + 500;
    for (let i = 0; i < 40 && hi - lo > 0.5; i++) { const m = (lo + hi) / 2; if (nettoRente(m, o) < netto) lo = m; else hi = m; }
    return Math.round(hi);
  }
  // Umgekehrt: Brutto zu einem Netto (Halbierung, auf 1 € genau)
  function bruttoAusNetto(netto, o) {
    netto = Math.max(0, Number(netto) || 0);
    if (!netto) return 0;
    const P = lohnParam((o && o.heute) || 2026);
    if (netto <= P.minijob) return netto;
    let lo = netto, hi = netto * 2.5 + 500;
    for (let i = 0; i < 40 && hi - lo > 0.5; i++) { const m = (lo + hi) / 2; if (nettoLohn(m, o).netto < netto) lo = m; else hi = m; }
    return Math.round(hi);
  }
  // Annahmen, wenn nur das Brutto bekannt ist: Steuerklasse aus dem Haushalt (allein I, allein mit Kind II,
  // Paar mit zwei Einkommen IV, Paar mit einem Einkommen III), ohne Kirchensteuer; Pflege: kinderlos ohne Kinder im Haushalt.
  // III ist für Unverheiratete zu hoch, aber vorsichtig: höheres Netto verspricht nie zu viel. Die Steuerklasse lässt sich im Formular ändern.
  function lohnAnnahmen(h, wer) {
    const kinder = (h.kids || 0) + (h.young || 0);
    const stkl = h.adults === 2 ? (h.zweiVerdiener ? 4 : (wer === 2 ? 5 : 3)) : kinder > 0 ? 2 : 1;
    return { stkl, kinder: Math.min(kinder, 6), kinderlos: kinder === 0, pva: Math.max(0, Math.min(4, kinder - 1)), sachsen: h.land === 'SN', heute: h.heute };
  }

  // Netto schätzen, wenn nur das Brutto bekannt ist (je erwachsene Person nach Einkommensart)
  function schaetzNetto(inp, adults, kinder, brutto, brutto2) {
    const heute = inp.heute ? Number(inp.heute) : (new Date().getFullYear() + new Date().getMonth() / 12);
    const art = (a) => (a === 'selbst' ? 'selbst' : a || 'lohn');
    const teile = adults === 2 ? [[art(inp.art1), brutto - brutto2], [art(inp.art2), brutto2]] : [[art(inp.art1), brutto]];
    const zwei = adults === 2 && teile.every((x) => x[0] === 'lohn' && x[1] > 0);
    const h = { adults, kids: kinder, young: 0, zweiVerdiener: zwei, land: inp.bundesland, heute };
    return Math.round(teile.reduce((a, [ar, b], i) => {
      if (!(b > 0)) return a;
      if (ar === 'lohn') {
        const o = lohnAnnahmen(h, i + 1);
        const st = [1, 2, 3, 4, 5, 6].indexOf(Number(inp['stkl' + (i + 1)])) >= 0 ? Number(inp['stkl' + (i + 1)]) : o.stkl;
        return a + nettoLohn(b, { ...o, stkl: st, kirche: inp['kirche' + (i + 1)] ? (inp.bundesland === 'BY' || inp.bundesland === 'BW' ? 0.08 : 0.09) : 0 }).netto;
      }
      if (ar === 'rente') return a + nettoRente(b, { kinder, heute });
      if (ar === 'selbst') return a + b * 0.8;
      return a + b;
    }, 0) * 100) / 100;
  }
  // ---------------------------------------------------------------
  // Pfändung: § 850c ZPO mit der Pfändungsfreigrenzenbekanntmachung 2026 (BGBl. 2026 I Nr. 80, gilt 1.7.2026 bis 30.6.2027).
  // Monatliches Netto wird wie in der amtlichen Tabelle auf volle 10 € abgerundet; vom Betrag über dem Freibetrag sind
  // 70 % (keine Unterhaltspflicht), 50 %, 40 %, 30 %, 20 %, 10 % (5 und mehr) pfändbar; über der Höchstgrenze alles.
  // P-Konto: Grundfreibetrag auf volle 10 € aufgerundet (§ 899 Abs. 1 ZPO), Erhöhungen nach § 902 ZPO mit Bescheinigung.
  // ---------------------------------------------------------------
  function pfaendFreibetrag(personen) {
    const P = R.pfaendung, n = Math.min(5, Math.max(0, personen | 0));
    return Math.round((P.grund + (n >= 1 ? P.erste : 0) + Math.max(0, n - 1) * P.weitere) * 100) / 100;
  }
  function pfaendung(netto, personen) {
    const P = R.pfaendung, n = Math.min(5, Math.max(0, personen | 0));
    netto = Math.max(0, Number(netto) || 0);
    const frei = pfaendFreibetrag(n);
    const quote = [0.7, 0.5, 0.4, 0.3, 0.2, 0.1][n];
    const stufe = Math.floor(Math.min(netto, P.hoechst) / 10) * 10;
    let betrag = stufe > frei ? Math.round((stufe - frei) * quote * 100 + 1e-6) / 100 : 0;
    if (netto > P.hoechst) betrag = Math.round((betrag + netto - P.hoechst) * 100) / 100;
    return { pfaendbar: betrag, bleibt: Math.round((netto - betrag) * 100) / 100, frei, ueberHoechst: netto > P.hoechst };
  }
  // P-Konto: geschützt im Kalendermonat (Grund + Unterhalt + Kindergeld + Kinderzuschlag); ohne Bescheinigung nur der Grundbetrag
  function pkonto(o) {
    const P = R.pfaendung, n = Math.min(5, Math.max(0, o.personen | 0));
    const sockel = Math.ceil(P.grund / 10) * 10;
    const unterhalt = Math.round(((n >= 1 ? P.erste : 0) + Math.max(0, n - 1) * P.weitere) * 100) / 100;
    const kg = Math.max(0, o.kindergeldKinder | 0) * R.kindergeld;
    const kiz = Math.max(0, Number(o.kiz) || 0);
    return { sockel, unterhalt, kindergeld: kg, kiz, gesamt: Math.round((sockel + unterhalt + kg + kiz) * 100) / 100 };
  }

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
    // Selbstständige: Gewinn zählt wie Einkommen aus Arbeit (Freibetrag § 11b Abs. 3 SGB II, § 82 Abs. 3 SGB XII; Wohngeld § 14 WoGG);
    // Unterschiede (kein Arbeitslosengeld/Krankengeld ohne freiwillige Versicherung, vorläufige Bewilligung) über h.selbst
    const aSel = (a) => (a === 'selbst' ? 'lohn' : a);
    const selbst1 = inp.art1 === 'selbst' || (Array.isArray(inp.einkommen) && inp.einkommen.some((x) => x && x.art === 'selbst'));
    const liste = Array.isArray(inp.einkommen) ? inp.einkommen.filter((x) => x && ARTEN.indexOf(aSel(x.art)) >= 0).map((x) => {
      const nurAus = blank(x.n);
      return [aSel(x.art), num(x.b), nurAus ? num(x.b) : num(x.n), nurAus, x.art === 'selbst'];
    }) : null;
    const brutto = liste ? liste.reduce((a, x) => a + x[1], 0) : num(inp.brutto);
    const brutto2 = adults === 2 && !liste ? Math.min(num(inp.brutto2), brutto) : 0;
    const nettoGiven = liste ? true : inp.netto !== '' && inp.netto != null && num(inp.netto) > 0;
    // Ohne Netto: Lohn nach Lohnsteuer und Beiträgen geschätzt (nettoLohn), Rente abzüglich Kranken- und Pflegeversicherung (nettoRente, etwa 88 %),
    // Gewinn Selbstständiger grob 80 %; Arbeitslosengeld, Krankengeld, Elterngeld und Werkstattlohn sind schon ausgezahlte Beträge
    const nettoGeschaetzt = !liste && !nettoGiven && brutto > 0;
    const nettoOhneKap = liste ? liste.reduce((a, x) => a + x[2], 0) : nettoGiven ? num(inp.netto) : schaetzNetto(inp, adults, kids + young, brutto, brutto2);
    const miete = num(inp.miete);
    const vermoegen = num(inp.vermoegen);
    const kapJahr = num(inp.kapErtrag);
    const kapSGB = Math.max(0, kapJahr - R.kap.freiSGB2Jahr) / 12, kapWG = Math.max(0, kapJahr - R.kap.freiWGJahr) / 12;
    const netto = nettoOhneKap + kapSGB; // Kapitalerträge zählen ohne Freibetrag für Arbeit
    // Unterhalt, den die Kinder vom anderen Elternteil bekommen (im Monat, alle Kinder zusammen); nur mit Kindern im Haushalt
    const unterhalt = kids + young > 0 ? num(inp.unterhalt) : 0;
    const regelElt = adults === 2 ? 2 * R.regelbedarf.partner : R.regelbedarf.alleinstehend;
    // Alter der Kinder optional: ohne Angabe gilt die mittlere Stufe (6-13 Jahre, 390 €)
    const kidsU6 = Math.min(Math.max(0, inp.kidsU6 | 0), kids);
    const kids14 = Math.min(Math.max(0, inp.kids14 | 0), kids - kidsU6);
    const regel = regelElt + kidsU6 * R.regelbedarf.kind0 + kids14 * R.regelbedarf.kind14 + (kids - kidsU6 - kids14) * R.regelbedarf.kind + young * R.regelbedarf.jungErwachsener;
    const pg = ['1', '2', '3', '4', '5'].indexOf(String(inp.pflegegrad)) >= 0 ? Number(inp.pflegegrad) : 0;
    // Einkommensart je erwachsener Person (lohn, rente, alg, kg, eg = Elterngeld, ohne). Ältere Speicherstände: aus den Haken.
    const art1 = liste ? (liste.some((x) => x[0] === 'lohn') ? 'lohn' : liste.length ? liste[0][0] : 'ohne') : ARTEN.indexOf(aSel(inp.art1)) >= 0 ? aSel(inp.art1) : (inp.nichtArbeit ? 'rente' : 'lohn');
    const art2 = ARTEN.indexOf(aSel(inp.art2)) >= 0 ? aSel(inp.art2) : (inp.nichtArbeit2 ? 'rente' : 'lohn');
    // Arbeitslosengeld, Krankengeld, Elterngeld und Werkstattlohn fragt die App als ausgezahlten Betrag ab (laut Bescheid/Lohnzettel):
    // beim Wohngeld dann nur der kleine Abzug für ausgezahlte Beträge, wie in der einfachen Version (§ 16 WoGG)
    const AUSZ = { alg: 1, kg: 1, eg: 1, wfbm: 1 };
    const pers = liste ? (liste.length ? liste : [['ohne', 0]]) : adults === 2 ? [[art1, brutto - brutto2, 0, !!inp.aus1 || !!AUSZ[art1], inp.art1 === 'selbst'], [art2, brutto2, 0, !!AUSZ[art2], inp.art2 === 'selbst']] : [[art1, brutto, 0, !!inp.aus1 || !!AUSZ[art1], inp.art1 === 'selbst']];
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
    // Eigenes Einkommen der Kinder (Ausbildungsvergütung, Minijob; ohne Kindergeld, Unterhalt und Waisenrente), im Monat
    const kindEink = kids + young > 0 ? num(inp.kindEink) : 0;
    // Waisenrente der Kinder (Halbwaisen- oder Vollwaisenrente, alle Kinder zusammen, im Monat): Einkommen der Kinder wie Unterhalt,
    // beim Unterhaltsvorschuss angerechnet (§ 2 Abs. 3 Nr. 2 UVG)
    const waisen = kids + young > 0 ? num(inp.waisen) : 0;
    // Unterhaltsvorschuss: Wer ist die zweite erwachsene Person? neu = neue Partnerschaft ohne Trauschein (Anspruch bleibt),
    // ehe = mit dem neuen Partner verheiratet oder verpartnert (§ 1 Abs. 1 Nr. 2 UVG: kein Anspruch), eltern = der andere Elternteil (§ 1 Abs. 3)
    const uvgPartner = adults === 2 && ['neu', 'ehe', 'eltern'].indexOf(inp.uvgPartner) >= 0 ? inp.uvgPartner : '';
    // Wechselmodell: ein Kind ist zu 40 % der Zeit oder mehr beim anderen Elternteil (BVerwG, Urteil vom 12.12.2023, 5 C 9.22)
    const uvgWechsel = kids > 0 && !!inp.uvgWechsel;
    // Eigenes Einkommen des Elternteils, bei dem das Kind lebt (für die Grenze ab 12 Jahren, § 1 Abs. 1a Nr. 2 UVG)
    const bruttoEigen = brutto - brutto2;
    // Eigenes Einkommen des Kindes (§ 2 Abs. 4 UVG) sicher anrechenbar nur, wenn klar ist, wessen Einkommen es ist: ein einziges Kind,
    // 14 bis 17 Jahre, in betrieblicher Ausbildung, keine jungen Erwachsenen. Eingetragen ist der ausgezahlte Betrag; das Brutto ist
    // mindestens so hoch, die Anrechnung also mindestens so groß (untere Grenze).
    const uvgKindAnr = kids === 1 && young === 0 && kids14 === 1 && inp.ausbildung === 'kindBetrieb'
      ? Math.max(0, kindEink - R.uvg.wk - R.uvg.azubi) * R.uvg.haelfte : 0;
    // Unterhaltsvorschuss, den die Kinder bekommen würden (zählt als ihr Einkommen): nur Alleinerziehende (auch mit neuer Partnerschaft
    // ohne Trauschein), wenn Unterhalt fehlt; nicht im Wechselmodell (ein Kind). Asyl/Duldung: offen (deutsches Kind oder eigener Titel des Kindes).
    // Ab 12 Jahren nur mit eigenem Einkommen des Elternteils von mindestens 600 € (oder ohne Grundsicherung), daher dann ohne die Älteren.
    let uvgEst = 0;
    if ((adults === 1 || uvgPartner === 'neu') && kids > 0 && inp.unterhaltFehlt && !(uvgWechsel && kids === 1)) {
      const mitte = kids - kidsU6 - kids14;
      const ab12raus = !!inp.kinder12 && bruttoEigen < R.uvg.min12;
      uvgEst = Math.max(0, kidsU6 * R.uvg.bis5 + mitte * R.uvg.bis11 + (ab12raus ? 0 : kids14 * R.uvg.bis17) - unterhalt - waisen - uvgKindAnr);
    }
    // Mehrbedarf für Alleinerziehende: 36 % bei einem Kind unter 7 oder 2-3 Kindern unter 16, sonst 12 % je Kind, höchstens 60 %
    let mehrAE = 0, mehrAEhoch = 0;
    if (adults === 1 && kids > 0) {
      const unter16 = kids - kids14; // sicher unter 16 (14- bis 17-Jährige ungewiss)
      let p = R.mehr.aeJeKind * kids;
      if (kidsU6 >= 1 || (unter16 >= 2 && unter16 <= 3)) p = Math.max(p, R.mehr.ae36);
      mehrAE = Math.min(p, R.mehr.aeMax) * R.regelbedarf.alleinstehend;
      // Gefragt wird nur nach Kindern unter 6. Ein Kind von 6 bis 13 kann noch 6 sein (36 % gelten bis unter 7):
      // für „eher nicht“ rechnet SoLo deshalb auch mit 36 % (mehrAEhoch), damit kein Anspruch fälschlich verneint wird.
      if (kidsU6 === 0 && kids - kids14 >= 1 && p < R.mehr.ae36) mehrAEhoch = Math.min(R.mehr.ae36, R.mehr.aeMax) * R.regelbedarf.alleinstehend;
    }
    if (!mehrAEhoch) mehrAEhoch = mehrAE;
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
      // Besondere Lagen: selbstständig, Wohneigentum, Auto, weitere Erwachsene in der Wohnung, EU-Staatsangehörigkeit
      selbst: selbst1 || (adults === 2 && inp.art2 === 'selbst'),
      eigentum: inp.wohnart === 'eigentum',
      autoWert: num(inp.autoWert), autoBraucht: !!inp.autoBraucht,
      hhAndere: inp.hhAndere === 'wg' || inp.hhAndere === 'verwandte' ? inp.hhAndere : '',
      eu: inp.aufenthalt === 'eu', euArbeit: inp.euArbeit === 'ja', euJahre5: inp.euJahre === 'ab5',
      art1, art2, pers, liste: !!liste, kindEink, uvgEst, kindZahl: unterhalt + waisen + uvgEst, waisen, uvgPartner, uvgWechsel, bruttoEigen, uvgKindAnr, mehrAE, mehrAEhoch, alterGrenz,
      egFreiSGB: sumIf((a, b) => a === 'eg' && b > R.elterngeldFrei ? R.elterngeldFrei : 0),
      // Versicherungspauschale (§ 6 Abs. 1 Nr. 1 Bürgergeld-V) einmal je Person, nicht neben Einkommen aus Arbeit (dort deckt sie der
      // Grundfreibetrag von 100 € ab, § 11b Abs. 2 SGB II). In der Liste (eine Person mit mehreren Einkommen) also höchstens einmal.
      vPausch: liste ? (pers.some((x) => x[0] !== 'lohn' && x[0] !== 'ohne' && x[1] > 0) && !pers.some((x) => x[0] === 'lohn' && x[1] > 0) ? R.versPauschale : 0)
        : sumIf((a, b) => a !== 'lohn' && a !== 'ohne' && b > 0 ? R.versPauschale : 0),
      mzG: !!inp.mzG, mzGl: !!inp.mzGl || !!(inp.mz && inp.mz.Gl), mzRF: !!(inp.mz && inp.mz.RF), mzAG: !!(inp.mz && inp.mz.aG), wfbmJahre: num(inp.wfbmJahre), grundrente33: !!inp.grundrente33, zusatzRente: num(inp.zusatzRente), bhEinkHoch: !!inp.bhEinkHoch, teilhabe: !!inp.teilhabe, bhWeitere: Math.min(4, Math.max(0, inp.bhWeitere | 0)), schwanger: !!inp.schwanger, ernaehrung: !!inp.ernaehrung, warmwasser: !!inp.warmwasser, gebJahr: jahr,
      baby: inp.baby === 'bald' || inp.baby === 'da' ? inp.baby : '', egVor: blank(inp.egVor) ? null : num(inp.egVor), asyl: inp.aufenthalt === 'asyl',
      wohnform: inp.wohnform === 'eltern' || inp.wohnform === 'heim' ? inp.wohnform : '', wfbmEssen: !!inp.wfbmEssen,
      mieteGegeben: !blank(inp.miete) && num(inp.miete) > 0,
      // Heizkosten (freiwillig): nur gültig, wenn kleiner als die Warmmiete
      heizkosten: num(inp.heizkosten) > 0 && num(inp.heizkosten) < num(inp.miete) ? num(inp.heizkosten) : 0,
      arbeitSit: inp.arbeitSit === 'arbeitslos' || inp.arbeitSit === 'krank' ? inp.arbeitSit : '',
      algZeit: !!inp.algZeit, algMonate: [12, 16, 20, 24, 30, 36, 48].indexOf(Number(inp.algMonate)) >= 0 ? Number(inp.algMonate) : 0,
      krankWochen: ['unter6', 'laeuft', 'ende'].indexOf(inp.krankWochen) >= 0 ? inp.krankWochen : '',
      minijob: heute >= 2027 ? R.minijob2027 : R.minijob, heute,
      lohnVorher: num(inp.lohnVorher), alterJahre: jahr >= 1900 && jahr <= 2010 ? heute - jahr - 0.5 : 0,
      fehlt: { einkommen: !liste && blank(inp.brutto), netto: !liste && blank(inp.netto), vermoegen: blank(inp.vermoegen), miete: blank(inp.miete) && inp.wohnform !== 'heim' && inp.wohnform !== 'eltern' },
      adults, kids, kidsU6, kids14, young, persons, brutto, brutto2, erwerb: pers[0][0] === 'lohn' || (liste ? liste.some((x) => x[0] === 'lohn') : false), erwerb2: art2 === 'lohn', netto, nettoGiven, nettoGeschaetzt, kapJahr, kapWG, miete, vermoegen, unterhalt, regel, regelElt,
      children: kids + young,
      alleinerz: adults === 1 && kids > 0,
      stufe: [1, 2, 3, 4, 5, 6, 7].indexOf(Number(inp.mietstufe)) >= 0 ? Number(inp.mietstufe) : null,
      alter,
      // WfbM-Arbeitsbereich gilt als voll erwerbsgemindert (BA-Weisung § 8 SGB II Rz. 8.8-8.10a) -> Sozialamt statt Jobcenter
      erwerbsgemindert: !!inp.erwerbsgemindert || inp.emStd === 'unter3' || !!inp.wfbm || pers.some((x) => x[0] === 'wfbm'),
      // Voll erwerbsgemindert ist der Elternteil selbst, nicht ein Kind mit Behinderung (Werkstatt-Haken bei „Kind unter 18“ / „Kind ab 18“)
      emEltern: !!inp.erwerbsgemindert || inp.emStd === 'unter3' || pers.some((x) => x[0] === 'wfbm') || (!!inp.wfbm && inp.bhPerson !== 'minder' && inp.bhPerson !== 'erwVor25'),
      behinderung: !!inp.behinderung || String(inp.gdb) === '100',
      kinder12: !!inp.kinder12,
      // Alter der Kinder bekannt: ausdrücklich angegeben (Frage „14 bis 17“ beantwortet) oder alle Kinder unter 6
      kidsAlter: !!inp.kidsAlter || (kids > 0 && kidsU6 === kids),
      kindKrank: !!inp.kindKrank, // ein Kind ist gerade krank, ein Elternteil kann deshalb nicht arbeiten
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

  // Wohnkostenanteil der Eltern beim Kinderzuschlag (Tabelle DA-KiZ C.3.1.2)
  function kizWohnanteil(adults, kinder) { const t = adults === 1 ? R.kiz.wohnAllein : R.kiz.wohnPaar; return t[Math.min(Math.max(kinder, 0), 10)]; }

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
  // Kinderzuschlag, § 6a Abs. 6 BKGG: Übersteigt das Einkommen der Eltern ihren Bedarf, mindert Einkommen aus Arbeit den Kinderzuschlag
  // um 45 %, anderes Einkommen (Rente, Arbeitslosengeld I, Krankengeld, Elterngeld) in voller Höhe. Die Überschreitung gilt als durch das
  // Arbeitseinkommen verursacht, außer das andere Einkommen übersteigt den Bedarf schon allein.
  function kizMinderungEltern(h, bedarf) {
    const gesamt = elternEinkSGB2(h);
    const pers = h.pers || [['lohn', h.brutto]];
    const sumB = pers.reduce((a, x) => a + x[1], 0);
    const nettos = pers.map((x) => (h.liste ? x[2] : sumB > 0 ? h.netto * x[1] / sumB : h.netto / pers.length));
    const andereRoh = pers.reduce((a, x, i) => a + (x[0] === 'lohn' || x[0] === 'wfbm' || x[0] === 'ohne' ? 0 : nettos[i]), 0);
    const andere = Math.min(gesamt, Math.max(0, andereRoh - (h.egFreiSGB || 0) - (h.vPausch || 0)));
    const arbeit = gesamt - andere;
    return andere > bedarf ? andere - bedarf + R.kiz.anrechnung * arbeit : R.kiz.anrechnung * Math.max(0, gesamt - bedarf);
  }
  // Grobe Schätzung als Betrag, auf 10 € gerundet
  const r10 = (x) => Math.round(x / 10) * 10;
  // EU-Staatsangehörige: Leistungsausschluss, wenn das Aufenthaltsrecht nur aus der Arbeitsuche folgt oder fehlt (§ 7 Abs. 1 Satz 2
  // SGB II, § 23 Abs. 3 SGB XII). Rückausnahme: Arbeitnehmer oder Selbstständige (unionsrechtlicher Status) und nach 5 Jahren
  // gewöhnlichem Aufenthalt (§ 7 Abs. 1 Satz 4 SGB II). Die App fragt Arbeit und Aufenthaltsdauer; die genaue Prüfung macht die Stelle.
  const euAusschluss = (h) => h.eu && !h.euJahre5 && !h.euArbeit && !h.selbst && !(h.erwerb && h.brutto > 0);
  // Vermögen nach dem SGB XII (Grundsicherung im Alter, Hilfe zur Pflege, Blindenhilfe) und BAföG: ein Auto zählt mit, außer es wird
  // wegen einer Behinderung oder für die Arbeit gebraucht (§ 90 Abs. 2 Nr. 5 SGB XII bzw. Härte; § 27 BAföG). Im SGB II ist ein
  // angemessenes Auto je erwerbsfähiger Person geschützt (§ 12 SGB II).
  // Ein angemessenes Auto ist auch im SGB XII geschützt (§ 90 Abs. 2 Nr. 10 SGB XII seit 1.1.2023); über dem Prüfwert nur „möglich“ (besondere())
  const vermSGB12 = (h) => h.vermoegen;

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
    const yMaxLo = wgYmax(h.persons, wgMiete(stufen[0], h.persons, h.miete, h.heizkosten ? 1 : 0.9, h.heizkosten));
    const yMaxHi = wgYmax(h.persons, wgMiete(stufen[1], h.persons, h.miete, 1, h.heizkosten));
    // Pauschalabzug je Person und Einkommensart (§ 16 WoGG): Lohn 10-30 %, Rente und Krankengeld 10-20 %, ALG I und Elterngeld 0 %
    const pers = h.pers || [['lohn', h.brutto]];
    let sumB = 0, yA = 0, yB = 0;
    // Nur der ausgezahlte Betrag bekannt: Steuern und Beiträge sind schon abgezogen, das Brutto nach § 16-Abzug liegt nahe daran
    // Elterngeld bis 300 € je Person ist gar kein Einkommen (§ 10 Abs. 1 BEEG): nur der Teil darüber zählt, mit Pauschalabzug
    // Werbungskosten-Pauschbetrag (§ 14 Abs. 1 WoGG i. V. m. § 9a EStG): Lohn und Werkstattlohn 1.230 €, Renten 102 € im Jahr.
    // Nicht bei Selbstständigen (Gewinn ist schon nach Betriebsausgaben) und nicht bei Lohnersatzleistungen.
    let wkSum = 0;
    pers.forEach(function (x) {
      const ab = (x[3] ? R.wgAbzugAuszahlung[x[0]] : R.wgAbzug[x[0]]) || R.wgAbzug.lohn;
      const wk = x[4] ? 0 : x[0] === 'lohn' || x[0] === 'wfbm' ? R.wgWerbung.lohn / 12 : x[0] === 'rente' ? R.wgWerbung.rente / 12 : 0;
      const wkHier = Math.min(wk, x[1]); wkSum += wkHier;
      const zaehlt = x[0] === 'eg' ? Math.max(0, x[1] - R.elterngeldFrei) : x[1] - wkHier;
      sumB += zaehlt; yA += zaehlt * (1 - ab[0]); yB += zaehlt * (1 - ab[1]);
    });
    const wA = sumB > 0 ? yA / sumB : 0.9, wB = sumB > 0 ? yB / sumB : 0.7;
    // Anzeige als Grenze für das Brutto (bzw. den ausgezahlten Betrag bei ALG I und Elterngeld), Werbungskosten wieder dazu
    const lo = yMaxLo / wA + wkSum, hi = yMaxHi / wB + wkSum;

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
    // Betriebs-, Riester- oder private Rente zählt beim Wohngeld wie Rente, bekommt aber keinen Grundrentenfreibetrag
    const zusWG = zusatzVerteilt(h, pers.map((x) => x[1]));
    const grFrei = h.grundrente33 ? pers.reduce((a, x, i) => a + (x[0] === 'rente' ? Math.min(R.grundrente.sockel + R.grundrente.quote * Math.max(0, x[1] - zusWG[i] - R.grundrente.sockel), R.grundrente.max * R.regelbedarf.alleinstehend) : 0), 0) : 0;
    const extra = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - R.wgKindFrei) + (h.kapWG || 0) - freib - grFrei;
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
      const M = wgMiete(h.stufe, h.persons, h.miete, 1, h.heizkosten);
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
  // Nur Rente als Einkommen, Regelaltersgrenze nicht sicher erreicht, Alter unbekannt oder ab 60: könnte eine vorgezogene Altersrente sein
  // (§ 7 Abs. 4 SGB II). Bei bekanntem Alter unter 60 ist das ausgeschlossen (Witwen-, Waisen- oder Erwerbsminderungsrente).
  function vielleichtAltersrente(h) {
    const p = (h.pers || []).filter((x) => x[1] > 0);
    if (!p.length || !p.every((x) => x[0] === 'rente')) return false;
    if (h.alterJahre) return h.alterJahre >= 60;
    return h.gruppe === '' || h.gruppe === '50+';
  }
  // Kinderzuschlag setzt voraus, dass im Haushalt mindestens eine Person dem Grunde nach zum SGB II gehört (§ 6a Abs. 1 Nr. 3 BKGG
  // i. V. m. § 7, § 8 SGB II; DA-KiZ Stand 20.02.2026, D.2 Abs. 1 Satz 5 und B.1 Abs. 5; BSG 13.07.2022, B 7/14 KG 1/21 R):
  // ein erwerbsfähiger Elternteil oder ein Kind ab 15. Altersrentner (Regelaltersgrenze, auch vorgezogene Altersrente, § 7 Abs. 4 SGB II)
  // und voll Erwerbsgeminderte zählen nicht.
  function kinderzuschlag(h) {
    const id = 'kiz';
    if (h.children === 0) return mk(id, 'nein', 'keinKind', [['kiz.keinKind']]);
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'nein', 'ausschluss', [['kiz.ausschluss']]);
    if (h.bezug.kiz) return mk(id, 'na', 'na', [['kiz.na']]);
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['kiz.asyl']]);
    let hinweis = null;
    if (h.young === 0) {
      const em = h.emEltern;
      if (h.adults === 1 && (h.alter || em)) {
        // Allein, kein Kind ab 15 (alle Kinder sicher unter 14 bzw. Alter angegeben und keines von 14 bis 17): kein Anspruch
        if (h.kids14 === 0 && h.kidsAlter) return mk(id, 'nein', 'ausschluss', [[h.alter ? 'kiz.rentnerAllein' : 'kiz.emAllein']]);
        hinweis = 'kiz.nurAb15';
      } else if (h.adults === 1 && (h.alterGrenz || vielleichtAltersrente(h))) hinweis = 'kiz.vorgezogen';
      else if (h.adults === 2 && !h.liste && h.art1 === 'rente' && h.art2 === 'rente' && (h.alter || em)) hinweis = 'kiz.rentnerPaar';
    }
    const r = kizRechnung(h, id);
    if (!hinweis || r.level === 'nein') return r;
    return mk(id, 'vielleicht', r.level === 'ja' ? 'vielleicht' : r.hl, [[hinweis]].concat(r.tx));
  }
  function kizRechnung(h, id) {
    const vermGrenze = h.persons <= 2 ? R.kiz.vermZwei : R.kiz.vermDrei + R.kiz.vermJeWeiteres * (h.persons - 3);
    if (h.vermoegen > vermGrenze) return mk(id, 'nein', 'vermHoch', [['kiz.verm', { n: h.persons, limit: eur(vermGrenze) }]]);
    const minEink = h.adults === 2 ? R.kiz.minPaar : R.kiz.minAlleinerziehend;
    if (h.brutto < minEink) return mk(id, 'nein', 'minEink', [['kiz.minEink', { min: eur(minEink) }]]);

    const gmax = R.kiz.max * h.children;
    const elternAnteil = kizWohnanteil(h.adults, h.children);
    // Mehrbedarfe der Eltern gehören zum Bedarf der Eltern (Schwangerschaft, Warmwasser, 35 % bei Teilhabe am Arbeitsleben)
    const maK = mehrAllg(h, false), mbK = mehrBehSGB2(h);
    const mehrEltern = maK.eltern + (h.bhPerson === 'erwNach25' ? mbK.fest : 0);
    const bemessung = h.regelElt + (h.mehrAE || 0) + mehrEltern + h.miete * elternAnteil;
    // Einkommen der Eltern nach § 11b SGB II (Freibetrag für Arbeit usw.); Einkommen der Kinder (Unterhalt, Unterhaltsvorschuss,
    // eigenes Einkommen über der Minijob-Grenze) mindert den Kinderzuschlag um 45 % (§ 6a Abs. 3 und 6 BKGG)
    const kindAnr = (h.kindZahl || 0) + Math.max(0, (h.kindEink || 0) - h.minijob);
    const est = Math.max(0, gmax - kizMinderungEltern(h, bemessung) - R.kiz.anrechnung * kindAnr);
    const gesamtBedarf = h.regel + h.miete + (h.mehrAE || 0) + maK.fest + mbK.fest;

    if (est <= 0) {
      // Kind vielleicht erst 6 Jahre (Mehrbedarf 36 % statt 12 %): dann ist Kinderzuschlag möglich
      const estHoch = Math.max(0, gmax - kizMinderungEltern(h, bemessung - (h.mehrAE || 0) + (h.mehrAEhoch || 0)) - R.kiz.anrechnung * kindAnr);
      if (estHoch > 0) return mk(id, 'vielleicht', 'vielleicht', [['kiz.ae7']]);
      return mk(id, 'nein', 'einkoHoch', [['kiz.zuHoch']]);
    }
    // Hilfebedürftigkeit muss mit dem Kinderzuschlag enden (§ 6a Abs. 1 Nr. 3 BKGG): bereinigtes Einkommen nach SGB II (mit Freibetrag
    // für Arbeit) plus Kindergeld, Einkommen der Kinder und geschätzter Kinderzuschlag; der Puffer steht für ein mögliches Wohngeld.
    // (Abgleich mit dem KiZ-Lotsen der Familienkasse: bisher mit vollem Netto zu optimistisch.)
    const mitKiz = elternEinkSGB2(h) + h.children * R.kindergeld + (h.kindZahl || 0) + (h.kindEink || 0) + est;
    if (mitKiz + R.kiz.puffer < gesamtBedarf) return mk(id, 'vielleicht', 'einkoNiedrig', [['kiz.zuNiedrig']]);
    // Reicht es nur mit zusätzlichem Wohngeld, ist der Kinderzuschlag offen: beides beantragen
    if (mitKiz < gesamtBedarf) return mk(id, 'vielleicht', 'vielleicht', [['kiz.mitWg', { max: eur(R.kiz.max) }], ['schaetz.eins', { a: eur(Math.max(10, r10(est))) }]]);
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

  // § 7 Abs. 4 SGB II: Wer eine Altersrente bezieht (auch vor der Regelaltersgrenze), bekommt kein Grundsicherungsgeld.
  // Die App kennt die Rentenart nicht: allein, nur Rente, Alter unbekannt oder ab 60 -> höchstens „möglich“ mit Hinweis.
  function grundsicherungsgeld(h) {
    const r = ggeldRechnung(h);
    if (h.adults !== 1 || (r.level !== 'ja' && r.level !== 'vielleicht') || !vielleichtAltersrente(h)) return r;
    return mk(r.id, 'vielleicht', 'vielleicht', r.tx.slice(0, 1).concat([['ggeld.vorgezogen']], r.tx.slice(1)));
  }
  function ggeldRechnung(h) {
    const id = 'ggeld';
    // Paar mit Kindern, eine Person im Rentenalter oder voll erwerbsgemindert: Die andere Person kann erwerbsfähig sein und gehört
    // dann mit den Kindern zum Jobcenter (gemischte Bedarfsgemeinschaft, § 7 Abs. 2 und 3 SGB II); ohne Kinder nur als Hinweis
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);
    if (euAusschluss(h)) return mk(id, 'nein', 'ausschluss', [['ggeld.eu']]);
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
    if (luecke > -(R.grundsicherung.knappPuffer + mb.offen + (h.mehrAEhoch || 0) - (h.mehrAE || 0))) return mk(id, 'vielleicht', 'vielleicht', bedarfTx('vielleicht', bedarf).concat(behTx));
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
  function unterhaltsvorschuss(h, gg) {
    const r = uvgKarte(h, gg);
    // § 1 Abs. 2a UVG: Voraussetzung erfüllt das Kind ODER der Elternteil (deutsches Kind, eigener Titel des Kindes,
    // Beschäftigungsduldung). Im Asylverfahren oder mit Duldung daher höchstens „möglich“.
    if (h.asyl && (r.level === 'ja' || r.level === 'vielleicht')) return mk(r.id, 'vielleicht', 'vielleicht', [['uvg.asyl']].concat(r.tx));
    return r;
  }
  function uvgKarte(h, gg) {
    const id = 'uvg';
    // § 1 Abs. 1 Nr. 1, Abs. 1a UVG: nur bis zum 18. Geburtstag und nur, wenn das Kind beim Elternteil lebt (Heim, Pflege: § 1 Abs. 4 Satz 2)
    if (h.kids === 0) return mk(id, 'nein', 'keinKind', [[h.young > 0 ? 'uvg.volljaehrig' : 'uvg.keinKind']]);
    if (!h.unterhaltFehlt) {
      // Waisenrente eingetragen, Haken fehlt: Ein Elternteil ist wohl gestorben (§ 1 Abs. 1 Nr. 3 b UVG) -> wie mit Haken prüfen,
      // höchstens „möglich“, mit Hinweis auf den Haken
      if (!(h.waisen > 0)) return mk(id, 'nein', 'vorausFehlt', [['uvg.unterhalt']]);
      const r = uvgKarte(Object.assign({}, h, { unterhaltFehlt: true }), gg);
      return r.level === 'nein' ? r : mk(id, 'vielleicht', 'vielleicht', [['uvg.waisenHaken']].concat(r.tx));
    }
    // § 1 Abs. 1 Nr. 2 UVG: verheiratet oder verpartnert mit dem neuen Partner -> nicht mehr alleinstehend
    if (h.uvgPartner === 'ehe') return mk(id, 'nein', 'ausschluss', [['uvg.ehe']]);
    // § 1 Abs. 3 UVG: lebt mit dem anderen Elternteil; gilt je Kind (nur gemeinsame Kinder), bei mehreren Kindern daher offen
    if (h.uvgPartner === 'eltern' && h.kids === 1) return mk(id, 'nein', 'ausschluss', [['uvg.elternteil']]);
    // Wechselmodell (BVerwG 12.12.2023, 5 C 9.22): ab 40 % Betreuung durch den anderen Elternteil kein Anspruch
    if (h.uvgWechsel && h.kids === 1) return mk(id, 'nein', 'vorausFehlt', [['uvg.wechsel']]);
    const betrag = ['uvg.ja', { a: eur(R.uvg.bis5), b: eur(R.uvg.bis11), c: eur(R.uvg.bis17) }];
    // Hinweise für jeden möglichen Anspruch: Rückwirkung höchstens ein Monat (§ 4 UVG), Mitwirkung (§ 1 Abs. 3 UVG), Änderungen melden
    // (§§ 5, 6 UVG), dauernd getrennt auch bei Klinik/Haft des Ehepartners (§ 1 Abs. 2 UVG), Aufenthaltstitel (§ 1 Abs. 2a UVG)
    const hinweise = [['uvg.frist'], ['uvg.mitwirken'], ['uvg.melden']].concat(h.adults === 1 ? [['uvg.getrennt']] : [], !h.eu && !h.asyl ? [['uvg.titel']] : []);
    // Eigenes Einkommen eines Kindes, das die allgemeinbildende Schule verlassen haben kann (14 bis 17 Jahre), § 2 Abs. 4 UVG
    const kindTx = h.kindEink > 0 && h.kids14 > 0 ? [['uvg.kindEink', { wk: eur(R.uvg.wk), az: eur(R.uvg.azubi) }]] : [];
    // Höchster möglicher Unterhaltsvorschuss (ein Kind von 6 bis 13 kann schon 12 sein, wenn ein Kind 12 oder älter ist)
    const hoch = h.kidsU6 * R.uvg.bis5 + h.kids14 * R.uvg.bis17 + (h.kids - h.kidsU6 - h.kids14) * (h.kinder12 ? R.uvg.bis17 : R.uvg.bis11);
    // Gezahlter Unterhalt und Waisenrente werden je Kind angerechnet (§ 2 Abs. 3 UVG). Die App kennt nur die Summe: Bei einem Kind
    // reicht sie für „unwahrscheinlich“, bei mehreren Kindern nie (ein Kind kann alles bekommen, ein anderes nichts) -> „möglich“.
    const anr = h.unterhalt + (h.waisen || 0);
    if (h.kids === 1 && anr >= hoch) return mk(id, 'nein', 'vorausFehlt', [h.waisen > 0 ? ['uvg.genugW', { u: eur(anr) }] : ['uvg.genug', { u: eur(anr) }]]);
    if (h.uvgKindAnr > 0 && anr + h.uvgKindAnr >= hoch) return mk(id, 'nein', 'vorausFehlt', [['uvg.kindEinkGenug', { e: eur(h.kindEink) }]]);
    // Ab 12 Jahren (§ 1 Abs. 1a UVG): Nr. 1 kein Grundsicherungsgeld des Kindes oder Nr. 2 eigenes Einkommen des Elternteils von
    // mindestens 600 € brutto (ohne Kindergeld). Nr. 1 sicher nur, wenn das Grundsicherungsgeld an Einkommen oder Vermögen scheitert;
    // bei anderen Gründen (Studium, Erwerbsminderung, EU-Ausschluss) kann das Kind trotzdem Leistungen beziehen -> „möglich“.
    const ohneGG = !!gg && gg.level === 'nein' && (gg.hl === 'einkoHoch' || gg.hl === 'vermHoch');
    const ab12 = h.kinder12 && h.bruttoEigen < R.uvg.min12 && !ohneGG ? [['uvg.ab12', { min: eur(R.uvg.min12) }]] : [];
    const teil = anr > 0 ? [h.waisen > 0 ? ['uvg.teilW', { u: eur(anr) }] : ['uvg.teil', { u: eur(anr) }]] : [];
    if (h.uvgPartner === 'eltern') return mk(id, 'vielleicht', 'vielleicht', [['uvg.elternteilMehr'], betrag].concat(teil, kindTx, hinweise));
    if (anr > 0) return mk(id, 'vielleicht', 'vielleicht', teil.concat(ab12, [betrag], kindTx, hinweise));
    if (h.adults === 2 && !h.uvgPartner) return mk(id, 'vielleicht', 'vielleicht', [['uvg.zwei'], betrag].concat(kindTx, hinweise));
    if (h.uvgWechsel) return mk(id, 'vielleicht', 'vielleicht', [['uvg.wechselMehr'], betrag].concat(kindTx, hinweise));
    if (ab12.length) return mk(id, 'vielleicht', 'vielleicht', ab12.concat([betrag], kindTx, hinweise));
    // Einkommen eines Kindes nach der Schule mindert den Betrag: sicher (Ausbildung) oder vielleicht (nur ein Kind, Schule unbekannt)
    if (h.uvgKindAnr > 0 || (kindTx.length && h.kids === 1 && h.kindEink > R.uvg.wk)) return mk(id, 'vielleicht', 'vielleicht', kindTx.concat([betrag], hinweise));
    return mk(id, 'ja', 'ja', [betrag].concat(kindTx, hinweise));
  }

  // ---------------------------------------------------------------
  // Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)
  // ---------------------------------------------------------------
  // Betriebs-, Riester- oder private Rente („davon“ in der Rente enthalten): auf die Renten der Personen der Reihe nach verteilt,
  // höchstens bis zur Höhe der jeweiligen Rente. Ergebnis je Eintrag in pers: Anteil der zusätzlichen Altersvorsorge.
  function zusatzVerteilt(h, betraege) {
    let rest = h.zusatzRente || 0;
    return betraege.map((b, i) => { if (!(h.pers || [['lohn']])[i] || (h.pers || [])[i][0] !== 'rente') return 0; const t = Math.min(rest, Math.max(0, b)); rest -= t; return t; });
  }
  const freiStaffel = (x, p, rs1) => (x > 0 ? Math.min(p.sockel + p.quote * Math.max(0, x - p.sockel), p.max * rs1, x) : 0);

  // Einkommen für die Grundsicherung nach dem SGB XII je Einkommen der Person(en) (§ 82 SGB XII)
  function gsaEinkommen(h) {
    const pers = h.pers || [['lohn', h.brutto]];
    const sumB = pers.reduce((a, x) => a + x[1], 0);
    const rs1 = R.regelbedarf.alleinstehend;
    // Netto je Einkommen: in der ausführlichen Version anteilig aus dem Haushaltsnetto
    const nettos = pers.map((x) => (h.liste ? x[2] : sumB > 0 ? h.netto * x[1] / sumB : h.netto / pers.length));
    const zus = zusatzVerteilt(h, nettos);
    return pers.reduce((a, x, i) => {
      const art = x[0], b = x[1];
      const n = nettos[i];
      if (art === 'wfbm') {
        const e = Math.max(0, n - R.wfbm.afoeg);
        const frei = Math.min(e, R.wfbm.achtel * rs1 + R.wfbm.rest * Math.max(0, e - R.wfbm.achtel * rs1));
        return a + e - frei;
      }
      if (art === 'lohn') return a + n - Math.min(R.gsaArbeit.quote * n, R.gsaArbeit.max * rs1);
      if (art === 'eg') return a + Math.max(0, n - (b > R.elterngeldFrei ? R.elterngeldFrei : 0));
      // Rente: Grundrentenfreibetrag nur auf die gesetzliche Rente (§ 82a), Freibetrag für zusätzliche Altersvorsorge auf Betriebs-, Riester- oder private Rente (§ 82 Abs. 4)
      if (art === 'rente') { const z = zus[i], gesetzlich = n - z; return a + n - (h.grundrente33 ? freiStaffel(gesetzlich, R.grundrente, rs1) : 0) - freiStaffel(z, R.vorsorge, rs1); }
      if (art === 'ohne') return a;
      return a + n;
    }, 0);
  }

  function grundsicherungAlter(h) {
    const id = 'gsa';
    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);
    if (!h.alter && !h.erwerbsgemindert && !h.alterGrenz) return mk(id, 'nein', 'vorausFehlt', [['gsa.voraus']]);
    if (euAusschluss(h)) return mk(id, 'nein', 'ausschluss', [['gsa.eu']]);
    if (h.bezug.sozialamt) return mk(id, 'na', 'na', [['gsa.na']]);
    if (h.bezug.grundsicherungsgeld) return mk(id, 'nein', 'schonGrund', [['gsa.ggBezug']]);
    // Barbetrag-Verordnung zu § 90 SGB XII: 10.000 € je volljähriger Person, 500 € je überwiegend unterhaltene Person
    const eigen = h.wohnform !== '';
    const schon = eigen ? R.grundsicherung.schonAllein : R.grundsicherung.schonAllein * h.adults + 500 * h.children;
    if (vermSGB12(h) > schon) return mk(id, 'nein', 'vermHoch', [['gsa.verm', { schon: eur(schon) }]]);
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
    if (h.vermoegen + (h.autoWert || 0) > vermGrenze) return mk(id, 'nein', 'vermHoch', [['bafoeg.vermHoch', { verm: eur(vermGrenze) }]]);
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
    // Selbstständige: Arbeitslosengeld nur mit freiwilliger Arbeitslosenversicherung (§ 28a SGB III)
    if (h.selbst) return mk(id, 'vielleicht', 'vielleicht', [['alg1.selbst'], melden]);
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
    // Selbstständige: Krankengeld nur mit Wahlerklärung oder Wahltarif der Krankenkasse (§ 44 Abs. 2 Nr. 2, § 53 Abs. 6 SGB V)
    if (h.selbst) return mk(id, 'vielleicht', 'vielleicht', [['krank.selbst'], ['krank.78']]);
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
  function elterngeldBerechnen(netto) {
    const E = R.eg;
    // Elterngeld-Netto: vom Netto noch ein Zwölftel des Arbeitnehmer-Pauschbetrags ab (§ 2c Abs. 1 BEEG; so rechnet der Elterngeldrechner des Bundes)
    const n = Math.max(0, netto - E.pausch);
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
      // Geschwisterbonus (§ 2a Abs. 1 BEEG): 10 %, mindestens 75 €, wenn im Haushalt ein weiteres Kind unter 3 oder zwei unter 6 leben.
      // SoLo kennt nur Kinder unter 6: zwei oder mehr sicher, eines nur als Hinweis (ob es unter 3 ist, weiß SoLo nicht).
      const geschw = h.baby === 'bald' ? h.kidsU6 : Math.max(0, h.kidsU6 - 1);
      let basis = elterngeldBerechnen(h.egVor);
      if (geschw >= 2) basis += Math.max(R.eg.bonusMin, basis * R.eg.bonus);
      tx.push(['eg.ja', { basis: eur(basis), plus: eur(basis / 2), monate }], ['schaetz.eins', { a: eur(r10(basis)) }]);
      if (geschw >= 2) tx.push(['eg.geschwister', { min: eur(R.eg.bonusMin) }]);
      else if (geschw === 1) tx.push(['eg.geschwisterVielleicht', { min: eur(R.eg.bonusMin) }]);
    }
    tx.push(['eg.mutterschaft'], ['eg.grenze', { grenze: eur(R.eg.einkommenGrenze) }]);
    return mk(id, h.egVor == null ? 'vielleicht' : 'ja', h.egVor == null ? 'vielleicht' : 'ja', tx);
  }

  // Hilfe zur Pflege (SGB XII, 7. Kapitel): wenn Pflegekasse und eigenes Geld nicht reichen (Pflegedienst, Tagespflege, Heim)
  function hilfeZurPflege(h) {
    const id = 'hzp';
    if (h.pflegegrad < 2 && !h.pflegeAntrag) return mk(id, 'nein', 'vorausFehlt', [['hzp.keine']]);
    if (vermSGB12(h) > R.grundsicherung.schonAllein * h.adults + 500 * h.children) return mk(id, 'nein', 'vermHoch', [['hzp.verm']]);
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
    // Nur zeigen, wenn es gerade passt: ein Kind ist krank und muss zu Hause betreut werden (§ 45 SGB V)
    if (!h.kindKrank) return mk(id, 'nein', 'vorausFehlt', [['kkg.nurKrank']]);
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
    if (vermSGB12(h) > R.grundsicherung.schonAllein * h.adults + 500 * h.children) return mk(id, 'nein', 'vermHoch', [['blh.verm']]);
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
  function rundfunk(h, gg, gsa, weitere) {
    const res = rundfunk0(h, gg, gsa, weitere || {});
    res.tx.push(['rundfunk.mehr']);
    return res;
  }
  function rundfunk0(h, gg, gsa, w) {
    const id = 'rundfunk';
    if (h.bezug.grundsicherungsgeld || h.bezug.sozialamt) return mk(id, 'ja', 'ja', [['rundfunk.bezug']]);
    // § 4 Abs. 1 Nr. 4 RBStV: Leistungen nach dem Asylbewerberleistungsgesetz
    if (h.asyl) return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.asyl']]);
    if (gg.level === 'ja' || gsa.level === 'ja') return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.folgt']]);
    if (gg.level === 'vielleicht' || gsa.level === 'vielleicht') return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.haerte']]);
    // § 4 Abs. 1 RBStV, weitere Befreiungsgründe: Hilfe zur Pflege (SGB XII), Blindenhilfe (§ 72 SGB XII), BAföG nicht bei den Eltern
    const okW = (r) => r && (r.level === 'ja' || r.level === 'vielleicht');
    if (okW(w.hzp) || okW(w.blh) || (okW(w.baf) && h.ausbildung === 'ich' && h.wohnform !== 'eltern')) return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.weitere']].concat(h.mzRF ? [['rundfunk.rf']] : []));
    if (h.mzRF) return mk(id, 'vielleicht', 'vielleicht', [['rundfunk.rf']]);
    return mk(id, 'nein', 'vorausFehlt', [['rundfunk.nein']]);
  }

  // Kostenlose Familienversicherung in der gesetzlichen Krankenversicherung (§ 10 SGB V)
  function famvers(h) {
    const id = 'famvers';
    if (h.adults === 1 && h.kids === 0 && h.young === 0) return mk(id, 'nein', 'vorausFehlt', [['famvers.keine']]);
    const grenze = Math.round((h.heute >= 2027 ? R.famvers.bezug2027 : R.famvers.bezug2026) / 7);
    const tx = [];
    let partnerOk = false;
    if (h.adults === 2) {
      const b2 = h.brutto2 || 0, art = h.art2 || '';
      partnerOk = art === 'ohne' || art === 'eg' || (!art && b2 === 0) || (art === 'lohn' && b2 <= h.minijob) || b2 <= grenze;
      // Arbeitslosengeld, Krankengeld und Werkstatt bringen eine eigene Versicherung mit; Rente schließt nur über der Grenze aus
      if (art === 'alg' || art === 'kg' || art === 'wfbm' || (art === 'rente' && b2 > grenze)) partnerOk = false;
      tx.push(partnerOk ? ['famvers.partner', { grenze: eur(grenze), mini: eur(h.minijob) }] : ['famvers.partnerNein', { grenze: eur(grenze) }]);
    }
    if (h.kids > 0) tx.push(['famvers.kinder']);
    if (h.young > 0) tx.push(['famvers.jung', { grenze: eur(grenze) }]);
    if (!partnerOk && h.kids === 0 && h.young === 0) return mk(id, 'nein', 'einkoHoch', tx);
    return mk(id, 'vielleicht', 'vielleicht', tx);
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
      const gr = (w) => {
        let g = (h.persons <= 1 ? w.ein : w.zwei + (h.persons - 2) * w.weitere) + h.children * w.kind;
        if (w.plus1 && h.persons <= 1) g += w.plus1; else if (w.plus2 && h.persons === 2) g += w.plus2;
        return w.rund ? Math.ceil(Math.round(g * 100) / 100 / w.rund) * w.rund : g;
      };
      const L = R.wbsLand[h.land];
      if (L) {
        const grenze = gr(L), land = BL_NAME[h.land];
        // Stufen: jede mit ihrer Grenze; welche erfüllt das Brutto (sicher), welche vielleicht nach den Abzügen des Amts
        const ST = R.wbsStufen[h.land] || [];
        const gS = (f) => (typeof f === 'number' ? grenze * f : gr(Object.assign({}, L, f, { rund: 0, plus1: 0, plus2: 0 })));
        const stufenTx = (sicher) => {
          if (!ST.length) return [];
          const liste = ST.map((x) => ['wbs.stufe', { name: x[0], grenze: eur(r10(gS(x[1]))) }]);
          const nachAbzug = jahr * (1 - R.wbs.maxAbzug) - freiS;
          const du = ST.find((x) => jahr <= gS(x[1])), vl = ST.find((x) => nachAbzug <= gS(x[1]));
          return liste.concat(du ? [['wbs.stufeDu', { name: du[0] }]] : vl ? [['wbs.stufeVielleicht', { name: vl[0] }]] : []);
        };
        const gdS = gdbNum(h), pgS = h.pflegegrad > 0;
        const freiS = (gdS === 100 || (gdS >= 80 && pgS) ? R.wbs.schwerbFreiHoch : gdS >= 50 && pgS ? R.wbs.schwerbFreiPflege : 0) + (h.bhWeitere || 0) * R.wbs.schwerbFreiPflege + (h.uzBetrag || 0) * 12;
        if (jahr <= grenze) return mk(id, 'ja', 'ja', [['wbs.landGrenze', { land, grenze: eur(grenze), stand: L.stand }]].concat(stufenTx(), [['wbs.landStelle']]));
        // Höchstens 30 % Abzüge (§ 23 WoFG und Landesrecht), dazu Freibeträge (Schwerbehinderung) und gezahlter Unterhalt (§ 24 WoFG);
        // darüber hinaus auch nicht mit der höchsten Landesstufe. 5 % Reserve, weil die Länder ihre Grenzen fortschreiben.
        const gdL = gdbNum(h), pgL = h.pflegegrad > 0;
        const freiL = (gdL === 100 || (gdL >= 80 && pgL) ? R.wbs.schwerbFreiHoch : gdL >= 50 && pgL ? R.wbs.schwerbFreiPflege : 0) + (h.bhWeitere || 0) * R.wbs.schwerbFreiPflege + (h.uzBetrag || 0) * 12;
        if (L.hoch && jahr * (1 - R.wbs.maxAbzug) - freiL > grenze * L.hoch * 1.05) return mk(id, 'nein', 'einkoHoch', [['wbs.landHoch', { land, grenze: eur(grenze * L.hoch) }]]);
        return mk(id, 'vielleicht', 'vielleicht', [['wbs.landUeber', { land, grenze: eur(grenze), stand: L.stand }]].concat(stufenTx(), [['wbs.landStelle']]));
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
    // Was SoLo nicht einrechnet (bei den Leistungen mit Einkommens- und Vermögensprüfung), und wie es nach dem Antrag weitergeht
    if (['ggeld', 'gsa', 'wohngeld', 'kiz'].some((id) => ok(g(id)))) out.push(['z.grenzen']);
    if (r.some(ok)) out.push(['z.verfahren']);
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
    rundfunk: 'Befreiung vom Rundfunkbeitrag', zuzahl: 'Befreiung von Zuzahlungen', famvers: 'Kostenlose Familienversicherung', bab: 'Berufsausbildungsbeihilfe',
    wbs: 'Wohnberechtigungsschein', alg1: 'Arbeitslosengeld I', krankengeld: 'Krankengeld', srente: 'Altersrente für schwerbehinderte Menschen', elterngeld: 'Elterngeld', hzp: 'Hilfe zur Pflege', lpg: 'Landespflegegeld (Bayern)', mutter: 'Mutterschaftsgeld', kkg: 'Kinderkrankengeld', blh: 'Blindenhilfe (Sozialhilfe)', asylblg: 'Asylbewerberleistungen'
  };
  // Unterlagen der neuen Karten: gemeinsame Schlüssel (u.*), damit nicht jede Karte eigene Texte braucht
  const NEWSTEPS = {
    kgBeh: ['u.ausweis', 'u.arzt', 'u.steuerid'], emrente: ['u.ausweis', 'u.arzt', 'u.rentenverlauf'],
    eingl: ['u.ausweis', 'u.arzt', 'u.einkommen'], ausweis: ['u.ausweis', 'u.arzt', 'u.foto'],
    blindengeld: ['u.ausweis', 'u.arzt', 'u.bescheide'], pflegeplus: ['u.versichertenkarte', 'u.pflegebescheid', 'u.kosten'],
    arbeit: ['u.ausweis', 'u.arzt', 'u.vertrag'], rundfunk: ['u.beitragsnr', 'u.bescheide', 'u.ausweis'],
    zuzahl: ['u.versichertenkarte', 'u.quittungen', 'u.einkommen'], famvers: ['u.versichertenkarte', 'u.einkommen'], bab: ['u.ausbildungsvertrag', 'u.einkommen', 'u.mietvertrag'],
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
  // Rechtsgrundlagen je Karte (nur im Beratungsmodus sichtbar). Aus den Quellen in diesem Modul und der Regeltabelle der App;
  // nur Gesetz und Paragraf, keine Beträge. Landesleistungen: Landesgesetz bzw. Landesrecht.
  const RECHT = {
    kindergeld: '§§ 62 ff. EStG, Höhe § 66 EStG; Kinder ab 18: § 32 Abs. 4 EStG', wohngeld: 'Wohngeldgesetz, §§ 12–19 WoGG',
    kiz: '§ 6a BKGG', ggeld: 'SGB II, §§ 7, 9, 11–12, 19–22 SGB II', but: '§ 28 SGB II, § 6b BKGG, § 34 SGB XII',
    uvg: 'Unterhaltsvorschussgesetz, §§ 1–4 UVG', gsa: '§§ 41 ff. SGB XII', bafoeg: 'BAföG', pflege: '§§ 37, 45b SGB XI',
    kgBeh: '§ 32 Abs. 4 Satz 1 Nr. 3 EStG', emrente: '§ 43 SGB VI', eingl: '§§ 90 ff. SGB IX; Kinder mit seelischer Behinderung: § 35a SGB VIII',
    pausch: '§ 33b EStG', ausweis: '§§ 2, 152 SGB IX', blindengeld: 'Landesblindengeldgesetz (Bayern: BayBlindG)',
    pflegeplus: '§§ 39, 40 SGB XI', arbeit: '§ 61 SGB IX', rundfunk: '§ 4 RBStV', zuzahl: '§ 62 SGB V', famvers: '§ 10 SGB V',
    bab: '§§ 56 ff. SGB III', wbs: '§ 9 Abs. 2 WoFG und Landesrecht', alg1: '§§ 136 ff. SGB III', krankengeld: '§§ 44 ff. SGB V',
    srente: '§§ 37, 236a SGB VI', elterngeld: 'BEEG, §§ 1–2 BEEG', hzp: '§§ 61 ff. SGB XII', lpg: 'BayLPflGG',
    mutter: '§ 19 MuSchG, § 24i SGB V', kkg: '§ 45 SGB V', blh: '§ 72 SGB XII', asylblg: 'AsylbLG'
  };

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
  // Einmalige Bedarfe, die extra beantragt werden (nicht im Regelsatz): § 24 Abs. 3 SGB II, § 31 SGB XII; Umzug § 22 Abs. 6 SGB II.
  // Erstausstattung bei Schwangerschaft und Geburt gibt es auch ohne laufende Leistung, wenn das Einkommen dafür nicht reicht (§ 24 Abs. 3 Satz 3).
  function einmalHinweise(h, results) {
    results.forEach(function (r) {
      const offen = r.level === 'ja' || r.level === 'vielleicht';
      if (r.id === 'ggeld' && offen) r.tx = r.tx.concat([['einmal.sgb2'], ['einmal.umzug']]);
      else if (r.id === 'ggeld' && r.level === 'nein' && (r.hl === 'bedarfNein' || r.hl === 'einkoHoch') && (h.schwanger || h.baby === 'bald')) r.tx = r.tx.concat([['einmal.ohneBezug']]);
      if (r.id === 'gsa' && offen) r.tx = r.tx.concat([['einmal.sgb12']]);
    });
  }
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

  // Geschätzte neue Leistung der ersten Person (Arbeitslosengeld I, Krankengeld, Elterngeld): Sie geht Grundsicherungsgeld,
  // Wohngeld und Kinderzuschlag vor und zählt dort als Einkommen. Zweite Rechnung „sobald gezahlt“: Das Einkommen der ersten
  // Person (Lohn oder keins) wird durch die Leistung ersetzt (Mitte der geschätzten Spanne, ausgezahlter Betrag).
  // Nur die ausführliche Version, nur ohne Asyl; Elterngeld nur bei Alleinstehenden vor der Geburt (bei Paaren ist offen, wer es bekommt).
  const spanneMitte = (r) => { const t = r.tx.find((x) => x[0] === 'schaetz.spanne' || x[0] === 'schaetz.eins'); return t ? (t[0] === 'schaetz.eins' ? t[1].a.eur : (t[1].a.eur + t[1].b.eur) / 2) : 0; };
  function zukunft(inp, h, a1, krg, eg) {
    if (h.liste || h.asyl || (h.art1 !== 'lohn' && h.art1 !== 'ohne')) return null;
    let quelle = '', art = '', betrag = 0;
    if (a1.level === 'ja' && h.arbeitSit === 'arbeitslos' && h.lohnVorher > 0) { quelle = 'alg'; art = 'alg'; betrag = spanneMitte(a1); }
    else if ((krg.level === 'ja' || krg.level === 'vielleicht') && (h.krankWochen === 'unter6' || h.krankWochen === 'laeuft') && h.lohnVorher > 0) { quelle = 'kg'; art = 'kg'; betrag = spanneMitte(krg); }
    else if (eg.level === 'ja' && h.baby === 'bald' && h.adults === 1 && h.egVor != null) { quelle = 'eg'; art = 'eg'; betrag = spanneMitte(eg); }
    if (!quelle || !(betrag > 0)) return null;
    const b1 = h.brutto - h.brutto2;
    const netto1 = h.adults === 1 ? h.netto : h.brutto > 0 ? h.netto * b1 / h.brutto : 0;
    const inp2 = Object.assign({}, inp, { art1: art, brutto: betrag + h.brutto2, brutto2: h.brutto2, netto: Math.max(0, h.netto - netto1) + betrag, aus1: true });
    return { h: derive(inp2), quelle, betrag, ohneLohn: h.art1 === 'lohn' && b1 > 0 };
  }
  // Einstufung aus beiden Rechnungen: gleich -> bleibt, sonst „möglich“; dazu ein Hinweis, was sich mit der neuen Leistung ändert
  function mitZukunft(jetzt, dann, zk) {
    if (jetzt.level === 'na' || (jetzt.level === 'nein' && dann.level === 'nein')) return jetzt;
    const level = jetzt.level === dann.level ? jetzt.level : 'vielleicht';
    // Die Texte der jetzigen Lage bleiben (sie beschreiben das heutige Einkommen), der Hinweis danach erklärt die Änderung
    const tx = jetzt.tx.slice();
    tx.push(['zuk.' + zk.quelle, { a: eur(r10(zk.betrag)) }]);
    if (zk.ohneLohn) tx.push(['zuk.ohneLohn']);
    tx.push(['zuk.' + dann.level]);
    if (dann.level !== 'nein') {
      const s = dann.tx.find((t) => t[0] === 'schaetz.eins' || t[0] === 'schaetz.spanne');
      if (s) tx.push(s[0] === 'schaetz.eins' ? ['zuk.betragEins', s[1]] : ['zuk.betragSpanne', s[1]]);
    } else if (jetzt.id === 'ggeld') tx.push(['zuk.ueberbruecken']);
    return { id: jetzt.id, level, hl: level === jetzt.level ? jetzt.hl : level, tx };
  }

  // Änderungen 2027 (Stand 19. November 2026). Beschlossen und eingerechnet: Minijob-Grenze 633 €, Kinderkrankentage 10/20,
  // antragsloses Kindergeld (Gesetz vom Bundesrat am 25.9.2026 gebilligt, Hinweis). Nur geplant und deshalb NICHT eingerechnet,
  // sondern als Hinweis auf der Karte: Kindergeld 267 € (BT-Drs. 21/8235), Sofortzuschlag Kinderzuschlag bleibt, Unterhaltsvorschuss
  // weiter bis 18, Wohngeld ohne Kürzung und ohne Dynamisierung 1.1.2027, Regelsätze gleich bis 30.6.2028 (Haushaltsbegleitgesetz 2027,
  // BT-Drs. 21/7860, Haushaltsausschuss 16.11.2026), Pflegegeld 380/630/890/1.080 € (BT-Drs. 21/8869),
  // Beitragsbemessungsgrenze KV 6.375 € (BR-Drs. 576/26; Krankengeld höchstens 148,75 € je Tag), Grundfreibetrag 12.564 €.
  const PLAN = { stand: '11/2026', kg: 267, pflege: [380, 630, 890, 1080], bbgKv: 6375, kgHoechst: 148.75, gfb: 12564 };
  function plan2027(h, results) {
    const offen = (r) => r.level === 'ja' || r.level === 'vielleicht' || r.level === 'na';
    results.forEach(function (r) {
      const add = (x) => { r.tx = r.tx.concat(x); };
      if (r.id === 'kindergeld' && offen(r)) add([['kg.antraglos'], ['plan.kg', { b: eur(PLAN.kg) }]]);
      else if (r.id === 'kiz' && offen(r)) add([['plan.kiz']]);
      else if (r.id === 'uvg' && offen(r)) add([['plan.uvg']]);
      else if (r.id === 'wohngeld' && offen(r)) add([['plan.wg']].concat(h.heute < 2027 && r.level !== 'na' ? [['plan.wgDez']] : []));
      else if (r.id === 'pflege' && offen(r) && (h.pflegegrad >= 2 || h.pflegeAntrag)) add([['plan.pflege', { a: eur(PLAN.pflege[0]), b: eur(PLAN.pflege[1]), c: eur(PLAN.pflege[2]), d: eur(PLAN.pflege[3]) }]]);
      else if ((r.id === 'ggeld' || r.id === 'gsa') && offen(r)) add([['plan.regel', { rs: eur(R.regelbedarf.alleinstehend) }]]);
      else if (r.id === 'krankengeld' && offen(r) && h.lohnVorher > R.krank.bbg) add([['plan.krank', { bbg: eur(PLAN.bbgKv), max: eur2(PLAN.kgHoechst) }]]);
      else if (r.id === 'kgBeh' && offen(r)) add([['plan.gfb', { gfb: eur(PLAN.gfb) }]]);
    });
  }

  // Angemessene Unterkunftskosten (§ 22 SGB II, § 35 SGB XII): Die Grenze legt jede Stadt oder jeder Kreis selbst fest. Ohne
  // schlüssiges Konzept setzt die Rechtsprechung die Höchstbeträge nach § 12 WoGG plus 10 % an (BSG); die App nimmt das als
  // Orientierung, dazu die Heizkostenkomponente als grobe Heizkosten. Ohne bekannte Mietenstufe, bei Eigentum, bei den Eltern
  // oder im Wohnheim keine Prüfung.
  const kduGrenze = (h) => (h.stufe && !h.eigentum && !h.wohnform ? wgCap(h.stufe, h.persons) * 1.1 + wgHeiz(h.persons) : null);
  function mitKdu(jetzt, dann, grenze) {
    if (jetzt.level === 'na' || (jetzt.level === 'nein' && dann.level === 'nein')) return jetzt;
    const level = jetzt.level === dann.level ? jetzt.level : 'vielleicht';
    return { id: jetzt.id, level, hl: level === jetzt.level ? jetzt.hl : level, tx: jetzt.tx.concat([['kdu.hoch', { grenze: eur(r10(grenze)) }]]) };
  }
  // Besondere Lagen, die die App nicht genau rechnen kann: „wahrscheinlich“ wird zu „möglich“, dazu ein Hinweis
  function besondere(h, results) {
    const zu = (r, key, p) => { r.tx = r.tx.concat([p ? [key, p] : [key]]); };
    const kappe = (r) => { if (r.level === 'ja') { r.level = 'vielleicht'; if (r.hl === 'ja') r.hl = 'vielleicht'; } };
    const offen = (r) => r.level === 'ja' || r.level === 'vielleicht';
    results.forEach(function (r) {
      if (!offen(r)) return;
      const id = r.id;
      if (h.eigentum && (id === 'ggeld' || id === 'gsa')) { kappe(r); zu(r, 'kdu.eigentum'); }
      if (h.eigentum && id === 'wohngeld') { kappe(r); zu(r, 'wohngeld.lasten'); }
      if (h.hhAndere === 'verwandte' && id === 'ggeld') { kappe(r); zu(r, 'ggeld.verwandte'); }
      if (h.hhAndere === 'verwandte' && id === 'wohngeld') { kappe(r); zu(r, 'wohngeld.verwandte'); }
      if (h.hhAndere === 'wg' && (id === 'ggeld' || id === 'gsa' || id === 'wohngeld')) zu(r, 'wg.anteil');
      // Ein angemessenes Auto ist im SGB II geschützt; bei hohem Wert prüft das Jobcenter, ob es noch angemessen ist
      if (h.autoWert > R.autoPruefen && !h.autoBraucht && (id === 'ggeld' || id === 'kiz')) { kappe(r); zu(r, 'auto.hoch', { wert: eur(R.autoPruefen) }); }
      // SGB XII: angemessenes Auto geschützt (§ 90 Abs. 2 Nr. 10); bei hohem Wert prüft das Sozialamt die Angemessenheit
      if (h.autoWert > R.autoPruefen && !h.autoBraucht && !h.mzG && !h.mzAG && (id === 'gsa' || id === 'hzp' || id === 'blh')) { kappe(r); zu(r, 'auto.hochSgb12', { wert: eur(R.autoPruefen) }); }
      if (h.selbst && (id === 'ggeld' || id === 'kiz' || id === 'wohngeld' || id === 'gsa')) zu(r, 'selbst.hinweis');
      if (h.eu && id === 'kindergeld') zu(r, 'kg.eu');
    });
  }

  // Ersparnisse mit unsicherem Schutz: Lebens-/Rentenversicherung (alle Karten) und geförderte Altersvorsorge (nur BAföG, dort nicht
  // ausdrücklich geschützt). Bringt der unsichere Teil eine Karte über die Vermögensgrenze, wird „wahrscheinlich“ zu „möglich“ mit Hinweis.
  function evaluate(inp) {
    const out = evaluateKern(inp);
    const lv = num(inp.vermLV), av = num(inp.vermAV);
    if (!(lv > 0 || av > 0)) return out;
    const vm = num(inp.vermoegen), ohne = { vermLV: '', vermAV: '' };
    const p2 = lv > 0 ? evaluateKern(Object.assign({}, inp, ohne, { vermoegen: vm + lv })) : null;
    const p3 = av > 0 ? evaluateKern(Object.assign({}, inp, ohne, { vermoegen: vm + lv + av })) : null;
    const zuHoch = (o, id) => !!o && (o.results.find((x) => x.id === id) || {}).hl === 'vermHoch';
    out.results = out.results.map((r) => {
      if (r.level === 'nein' || r.level === 'na') return r;
      const key = zuHoch(p2, r.id) ? 'verm.lvUnsicher' : r.id === 'bafoeg' && zuHoch(p3, r.id) ? 'verm.avUnsicher' : '';
      if (!key) return r;
      const level = 'vielleicht';
      return Object.assign({}, r, { level, hl: r.level === level ? r.hl : level, tx: r.tx.concat([[key]]) });
    }).sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.order - b.order);
    return out;
  }
  function evaluateKern(inp) {
    const h = derive(inp);
    const kg = kindergeld(h);
    const a1 = alg1(h), krg = krankengeld(h), eg = elterngeld(h);
    const zk = zukunft(inp, h, a1, krg, eg);
    let wg = wohngeld(h);
    let kz = kinderzuschlag(h);
    let gg = grundsicherungsgeld(h);
    if (zk) { wg = mitZukunft(wg, wohngeld(zk.h), zk); kz = mitZukunft(kz, kinderzuschlag(zk.h), zk); gg = mitZukunft(gg, grundsicherungsgeld(zk.h), zk); }
    const kdu = kduGrenze(h);
    if (kdu && h.miete > kdu) gg = mitKdu(gg, grundsicherungsgeld(Object.assign({}, h, { miete: kdu })), kdu);
    const but = bildungTeilhabe(h, wg, kz, gg);
    const uvg = unterhaltsvorschuss(h, gg);
    let gsa = grundsicherungAlter(h);
    if (kdu && h.miete > kdu) gsa = mitKdu(gsa, grundsicherungAlter(Object.assign({}, h, { miete: kdu })), kdu);
    const baf = bafoeg(h);
    const pf = pflege(h);
    const hzp = hilfeZurPflege(h), blh = blindenhilfe(h);
    const results = [kg, wg, kz, gg, but, uvg, gsa, baf, pf,
      a1, krg, eg, mutterschaftsgeld(h), kinderkrankengeld(h), hzp, landespflegegeld(h), asylbewerber(h), kindergeldBeh(h), erwerbsminderungsrente(h), schwerbRente(h), eingliederungshilfe(h), pauschbetrag(h), ausweis(h), blindengeld(h), blh,
      pflegeplus(h), budgetArbeit(h), rundfunk(h, gg, gsa, { hzp, blh, baf }), zuzahlung(h), famvers(h), bab(h), wbs(h)].map(angabeFehlt(h)).map((x, i) => ({ ...x, name: NAMES[x.id], order: i, steps: STEPS[x.id], recht: RECHT[x.id] }));
    uzHinweise(h, results);
    einmalHinweise(h, results);
    plan2027(h, results);
    besondere(h, results);
    const sorted = results.slice().sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.order - b.order);
    const zus = zusammenspiel(h, results);
    // Hinweis zur vorrangigen Leistung vor den allgemeinen Hinweisen (nicht eingerechnet, Verfahren, Stichtag)
    if (zk) { const i = zus.findIndex((z) => ['z.grenzen', 'z.verfahren', 'z.stichtag'].indexOf(z[0]) >= 0); zus.splice(i < 0 ? zus.length : i, 0, ['z.zuk.' + zk.quelle]); }
    return { h, results: sorted, zusammen: zus };
  }

  return { evaluate, nettoLohn, bruttoAusNetto, nettoRente, bruttoAusNettoRente, lohnAnnahmen, pfaendung, pfaendFreibetrag, pkonto, RULES: R, WG, limits, wgYmax, wgMiete, wgCap, wgHeiz, wgBetrag, roman, sgb2Freibetrag, kizWohnanteil, haushaltsFreibetrag, derive, NAMES, STEPS, RECHT, ZUST_LAND, zustLand };
})();

if (typeof module !== 'undefined') module.exports = Rules;
