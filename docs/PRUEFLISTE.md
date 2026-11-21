# Prüfliste vom Gesetz her (Stand 8. November 2026)

Diese Liste geht **vom Gesetz aus, nicht vom Code**. Sie zählt je Leistung die Voraussetzungen, Freibeträge, Mehrbedarfe und Sonderregeln auf und hält fest, ob die App sie kennt.
Die Rechentests (auch die unabhängige Referenzrechnung) prüfen nur, ob die App ihre Regeln richtig rechnet. Ob eine Regel ganz fehlt, zeigt nur diese Liste.

**So ist die Liste mit den Tests verbunden** (geprüft von `test/test-pruefliste.js`, läuft bei jedem `npm test`):

1. Jede Karte der App (Liste in `test/karten.js`) muss hier in einem Abschnitt stehen (unsichtbarer Kommentar „karten:“ unter der Überschrift). Eine neue Leistung ohne Prüfung vom Gesetz her lässt den Test scheitern.
2. Jede Zeile mit ✓ oder ◐ muss in der Spalte „Test“ mindestens eine Testmarke haben, und zu jeder Marke muss es einen Test geben, dessen Name sie in eckigen Klammern trägt, z. B. `[gg-ewt]`.
3. Eine Zeile mit ✗ lässt den Test scheitern. Eine Lücke kann also nicht unbemerkt bleiben.
4. ○ ist nur erlaubt mit Begründung, warum die App die Regel bewusst nicht rechnet.

Bei jeder neuen Regel und jedes Jahr zum 1. Januar durchgehen. Vor der Veröffentlichung sollte eine Fachperson (Sozialberatung oder Fachanwalt für Sozialrecht) die Liste einmal gegenlesen: Die Liste ist nur so vollständig wie das Wissen, mit dem sie geschrieben wurde.

Status: ✓ eingebaut und gerechnet · ◐ als Hinweis oder als „möglich“ (keine feste Zahl möglich, weil sie vom Einzelfall abhängt) · ○ bewusst nicht eingebaut (mit Begründung) · ✗ fehlt

## Grundsicherungsgeld (SGB II)
<!-- karten: ggeld -->

| Regel | Status | Test |
|---|---|---|
| Vermögensfreibeträge Familie und ab dem 30. Geburtstag wie FW § 12 SGB II Rz. 12.36/12.37 (Stand 01.07.2026) (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-ggeld` |
| Angemessene Unterkunftskosten (§ 22 SGB II): Orientierung WoGG-Höchstbetrag + 10 % plus Heizkostenkomponente (Rechtsprechung ohne schlüssiges Konzept); darüber zusätzlich mit der Grenze gerechnet, Einstufung aus beiden, Hinweis | ◐ | `kdu-grenze` |
| Selbstständige: Gewinn wie Einkommen aus Arbeit (§ 11b Abs. 3), Hinweis auf vorläufige Bewilligung (§ 41a) | ✓ | `selbst` |
| Selbst bewohntes Eigentum: geschützt (§ 12), Unterkunftskosten ohne Tilgung -> nur „möglich“ | ◐ | `eigentum` |
| Angemessenes Auto geschützt (§ 12); über 15.000 € (bisherige Weisungslage) nur „möglich“ | ◐ | `auto` |
| Verwandte in der Wohnung: Vermutung der Unterstützung (§ 9 Abs. 5) -> nur „möglich“; WG: eigener Mietanteil | ◐ | `hh-andere` |
| EU-Staatsangehörige ohne Arbeit, unter 5 Jahren: Leistungsausschluss (§ 7 Abs. 1 Satz 2 und 4) | ✓ | `eu` |
| Altersrente schließt aus, auch vor der Regelaltersgrenze (§ 7 Abs. 4 SGB II): allein, nur Rente, Alter unbekannt oder ab 60 -> höchstens „möglich“ mit Hinweis auf das Sozialamt (Hilfe zum Lebensunterhalt) | ✓ | `kiz-rentner` |
| Regelbedarfe 2026: 563 / 506 / 451 / 390 € (§ 20, § 23) | ✓ | `gg-regel` |
| Freibetrag für Erwerbstätige (§ 11b Abs. 2, 3): 100 € frei, 20 % bis 520 €, 30 % bis 1.000 €, 10 % bis 1.200 € (mit Kind 1.500 €) | ✓ | `gg-ewt` |
| Freibetrag nur für Einkommen aus Arbeit, nicht für Rente, Arbeitslosengeld, Krankengeld, Elterngeld | ✓ | `gg-ewt-art` |
| Schüler und Azubis unter 25: Einkommen bis zur Minijob-Grenze frei (§ 11b Abs. 2b) | ✓ | `gg-azubi` |
| Minijob-Grenze ab 1.1.2027: 633 € (Mindestlohn 14,60 €), die App schaltet am Stichtag selbst um (auch Krankengeld und Arbeitslosengeld) | ✓ | `minijob-2027` |
| Weitere Beträge 2027 (Kindergeld 267 €, Grundfreibetrag 12.564 €, Regelsätze, Wohngeld, Pflegegeld) | ○ (Stand 20.11.2026 nur Entwürfe; werden nicht angezeigt, auch nicht als „geplant“ (Nutzerregel 20.11.2026: nur geltendes Recht); erst nach Verkündung und ab Stichtag einarbeiten; die App weist ab 1.1.2027 auf veraltete Regeln hin) | |
| Schüler und Azubis über der Minijob-Grenze: auf den Teil darüber zusätzlich der Freibetrag nach Abs. 3 | ○ (die App rechnet vorsichtig ohne diesen Zusatz, der Betrag fällt also eher zu niedrig aus; von einer Fachperson bestätigen lassen) | |
| Elterngeld 300 € frei bei Einkommen vor der Geburt (§ 10 Abs. 5 BEEG) | ✓ | `gg-eg300` |
| Unterhalt und Unterhaltsvorschuss als Einkommen der Kinder, gedeckelt auf ihren Bedarf | ✓ | `gg-unterhalt` |
| Selbst gezahlter Unterhalt: Abzug vom Einkommen, wenn festgelegt (Unterhaltstitel, Jugendamtsurkunde, notarielle Vereinbarung) und gezahlt (§ 11b Abs. 1 Satz 1 Nr. 7); ohne Titel kein Abzug, Hinweis | ✓ | `uz-sgb2` |
| Unterhalt für die Person selbst (Trennungs- oder Ehegattenunterhalt, Unterhalt von den Eltern; Einkommensart „Unterhalt für dich“): voll Einkommen (§ 11 Abs. 1), kein Freibetrag für Arbeit, nur Versicherungspauschale 30 € (§ 6 Abs. 1 Nr. 1 Bürgergeld-V); Netto = Zahlbetrag ohne Steuer-/Beitragsschätzung | ✓ | `unt-sgb2` |
| Zweites Einkommen je Person (auch bei Paaren, Liste mit Person 1/2): Freibetrag für Arbeit je erwerbstätiger Person aus der Summe ihrer Löhne (§ 11b Abs. 3; BA-FW Rz. 11.144, 11.15); Versicherungspauschale 30 € je Person ohne Lohn, bei Lohn unter 30 € nur der Rest (§ 6 Abs. 1 Nr. 1 GrusiGV; Rz. 11.155); beim Wohngeld Werbungskosten-Pauschbetrag einmal je Person (§ 9a EStG) und § 16-Abzug je Person; SGB-XII-Freibetrag für Arbeit je Person (§ 82 Abs. 3 SGB XII); KiZ-Mindesteinkommen aus allen Einkommen beider Eltern; Familienversicherung aus allen Einkommen von Person 2 | ✓ | `paar-ek` |
| Vorrangige Leistungen (§ 12a SGB II): geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld (über 300 €) zählt als Einkommen; zweite Rechnung „sobald gezahlt“ (statt des Lohns der ersten Person), Einstufung aus beiden, Hinweis aufs Überbrücken | ✓ | `zuk-einkommen` |
| Schonvermögen nach Alter (§ 12 Abs. 2, ab 1.7.2026): 5.000 € bis zum 30. Geburtstag, dann 10.000 €, ab dem 40. 12.500 €, ab dem 50. 20.000 € je Person | ✓ | `gg-verm` |
| Paar: Freibetrag je Person nach eigenem Alter (§ 12 Abs. 2 SGB II; Merkblatt SGB II 8/2026 Nr. 9.5); die App kennt nur das Alter der ältesten Person: über der kleinsten möglichen Grenze (zweite Person unter 30) höchstens „möglich“ mit Hinweis „hängt vom Alter beider ab“; abgerufen 21.11.2026 | ✓ | `gg-verm-paar` |
| Mehrbedarf Alleinerziehende (§ 21 Abs. 3) | ✓ | `gg-mb-ae` |
| Mehrbedarf 35 % bei Teilhabe am Arbeitsleben bzw. Schule und Ausbildung (§ 21 Abs. 4, § 23 Nr. 2); bei Kindern Alter unbekannt | ✓ / ◐ | `gg-mb-teilhabe`, `gg-mb-kind` |
| Mehrbedarf G für nicht erwerbsfähige Personen (§ 23 Nr. 4) | ◐ | `gg-mb-kind` |
| Gemischte Bedarfsgemeinschaft (eine Person im Rentenalter oder voll erwerbsgemindert) | ◐ | `gg-gemischt` |
| Mehrbedarf Schwangerschaft 17 % ab der 13. Woche (§ 21 Abs. 2), Hinweis Erstausstattung (§ 24 Abs. 3) | ✓ | `gg-schwanger` |
| Mehrbedarf kostenaufwändige Ernährung (§ 21 Abs. 5): Höhe je Krankheit | ◐ | `gg-ernaehrung` |
| Mehrbedarf dezentrale Warmwasserbereitung (§ 21 Abs. 7) | ✓ | `gg-warmwasser` |
| Mehrbedarf Schulbücher (§ 21 Abs. 6a); in Bayern Lernmittelfreiheit | ◐ | `gg-schulbuch` |
| Angemessenheit der Miete nach örtlicher Richtlinie | ◐ | `gg-kdu` |
| Ausschluss: Rentenalter oder volle Erwerbsminderung (Sozialamt zuständig, § 7 Abs. 1) | ✓ | `gg-alter` |
| Ausschluss: Studium und förderfähige Ausbildung (§ 7 Abs. 5) | ✓ | `gg-studium` |
| Ausschluss: Asylbewerberleistungen (§ 7 Abs. 1 Satz 2 Nr. 3) | ✓ | `asyl-ausschluss` |

## Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)
<!-- karten: gsa -->

| Regel | Status | Test |
|---|---|---|
| Angemessene Unterkunftskosten (§ 35 SGB XII) wie beim Grundsicherungsgeld | ◐ | `kdu-grenze` |
| Angemessenes Auto geschützt (§ 90 Abs. 2 Nr. 10 SGB XII); über 15.000 € nur „möglich“; gebraucht (Behinderung, Arbeit) ohne Einschränkung | ◐ | `auto` |
| EU-Staatsangehörige: Ausschluss wie § 7 SGB II (§ 23 Abs. 3 SGB XII) | ✓ | `eu` |
| Voraussetzung Rentenalter oder dauerhaft volle Erwerbsminderung (§ 41) | ✓ | `gsa-voraus` |
| Freibetrag Erwerbstätige 30 %, höchstens 50 % RS1 (§ 82 Abs. 3 Satz 1) | ✓ | `gsa-ewt` |
| Selbst gezahlter Unterhalt: in der Regel kein Abzug (§ 82 SGB XII kennt ihn nicht), Hinweis auf Selbstbehalt | ◐ | `uz-gsa` |
| Unterhalt für die Person selbst: voll Einkommen (§ 82 Abs. 1 SGB XII), kein Freibetrag nach § 82 Abs. 3 | ✓ | `unt-sgb12` |
| Werkstattlohn: Arbeitsförderungsgeld frei, 1/8 RS1 + 50 % frei (§ 82 Abs. 2 Nr. 5, Abs. 3 Satz 2) | ✓ | `gsa-wfbm` |
| Grundrentenfreibetrag (§ 82a) | ✓ | `gsa-grundrente` |
| Grundrentenfreibetrag aus der Bruttorente (§ 82a Abs. 1: „aus der gesetzlichen Rente“; Antwort der Bundesregierung BT-Drs. 19/27495 S. 16 f.: „Der auf die Bruttorente anzuwendende Grundrentenfreibetrag“; DRV „Die Grundsicherung“ 5/2026 S. 18), höchstens die Netto-Rente; Bescheid-Check mit Feld „Rente brutto“, ohne Brutto Hinweis; amtliche Beispiele Gerda M., Max B./Inge M., Harald F., Befund 14 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-gsa` |
| Freibetrag für Betriebs-, Riester- und private Rente (§ 82 Abs. 4), Grundrentenfreibetrag nur auf die gesetzliche Rente | ✓ | `gsa-zusatzrente` |
| Kinderzuschlag: anderes Elterneinkommen über dem Bedarf voll, Arbeitseinkommen zu 45 % (§ 6a Abs. 6 BKGG) | ✓ | `kiz-anderes` |
| Versicherungspauschale 30 € einmal je Person, nicht neben Arbeitseinkommen (§ 6 Bürgergeld-V, § 11b Abs. 2 SGB II) | ✓ | `vpausch-person` |
| Rundfunkbeitrag: Befreiung auch bei Blindenhilfe, Hilfe zur Pflege, BAföG nicht bei den Eltern (§ 4 Abs. 1 RBStV) | ✓ | `rf-weitere` |
| Rundfunkbeitrag: Befreiung ab dem Monat, in dem der Bescheid gilt, rückwirkend höchstens 3 Jahre vor dem Antragsmonat, keine Zwei-Monats-Frist (§ 4 Abs. 4 RBStV, abgerufen 21.11.2026; Text s.rundfunk.tip) | ✓ | `rf-frist` |
| Grundrentenfreibetrag höchstens so hoch wie die Rente | ✓ | `gsa-grundrente-klein` |
| Mehrbedarf G 17 % (§ 30 Abs. 1) | ✓ | `gsa-mb-g` |
| Mehrbedarf Alleinerziehende (§ 30 Abs. 3) | ✓ | `gsa-mb-ae` |
| Mehrbedarf 35 % bei Eingliederungshilfe für Schule oder Ausbildung (§ 30 Abs. 4), nicht neben G | ✓ | `gsa-mb-teilhabe` |
| Mittagessen in der Werkstatt (§ 42b Abs. 2) | ◐ | `gsa-essen` |
| Bei den Eltern: eigene Grundsicherung, Stufe 1, Wohnkosten anteilig (§ 42a Abs. 3); Einkommen der Eltern erst ab 100.000 € (§ 94 Abs. 1a) | ✓ / ◐ Wohnkosten | `gsa-eltern` |
| Wohnheim: Stufe 2, Wohnkosten (§ 42a Abs. 5) | ✓ / ◐ Wohnkosten | `gsa-heim` |
| Schonvermögen 10.000 € je Erwachsenem (Barbetragsverordnung) | ✓ | `gsa-verm` |
| Merkzeichen G nur für eine Person abgefragt; bei Paaren Hinweis, dass der Mehrbedarf (17 %) mit zwei Ausweisen für jede Person gilt (§ 30 Abs. 1 SGB XII; Merkblatt Bochum Beispiel b); Bescheid-Check rechnet beide; abgerufen 21.11.2026 | ✓ | `gsa-g-paar` |
| Pflegegeld zählt nicht als Einkommen (§ 13 Abs. 5 SGB XI) | ✓ | `gsa-pflegegeld` |
| Mehrbedarf Schwangerschaft (§ 30 Abs. 2) | ✓ | `gsa-schwanger` |
| Mehrbedarf kostenaufwändige Ernährung (§ 30 Abs. 5) | ◐ | `gsa-ernaehrung` |
| Mehrbedarf dezentrale Warmwasserbereitung (§ 30 Abs. 7) | ✓ | `gsa-warmwasser` |
| Ausschluss: Asylbewerberleistungen (§ 23 Abs. 2) | ✓ | `asyl-ausschluss` |

## Wohngeld (WoGG)
<!-- karten: wohngeld -->

| Regel | Status | Test |
|---|---|---|
| Zu berücksichtigende Miete wie im Bescheid laut VG Bayreuth 25.06.2025 (B 8 K 25.211): 438,00 € (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-wohngeld` |
| Asylverfahren oder Duldung: nicht pauschal ausgeschlossen (§ 3 Abs. 5 Satz 1 Nr. 2, 4 WoGG; ausreisepflichtig ohne Duldung nicht berechtigt). Ohne Einkommensart „Asylbewerberleistungen“ normal gerechnet, auch „wahrscheinlich“, Hinweis vorn (Entscheidung David 20.11.2026); mit ihr „unwahrscheinlich“ mit Hinweis Sozialamt (§ 7 Abs. 1 Satz 1 Nr. 8 WoGG) (Abruf 20.11.2026) | ◐ | `wg-asyl` `asyl-bezug` |
| Aufenthalt „ausreisepflichtig ohne Duldung“ (eigene Auswahl, sonst wie Asylverfahren/Duldung): Wohngeld „unwahrscheinlich“ (in § 3 Abs. 5 Satz 1 Nr. 1 bis 6 WoGG nicht genannt), WBS „unwahrscheinlich“ ohne Ausnahme (§ 27 Abs. 2 WoFG) (Abruf 20.11.2026) | ✓ | `ausreise` |
| Eigentum: Lastenzuschuss, Belastung nach § 10 WoGG nicht genau gerechnet -> nur „möglich“ | ◐ | `eigentum` |
| Verwandte in derselben Wohnung zählen meist zum Haushalt (§ 5) -> nur „möglich“ | ◐ | `hh-andere` |
| Ausgezahlte Beträge (Arbeitslosengeld, Krankengeld, Elterngeld, Werkstattlohn) nur mit dem kleinen Abzug für Auszahlungen, in einfacher und ausführlicher Version gleich (§ 16 WoGG) | ✓ | `einfach-gleich` |
| Tipp „früh beantragen“ (Wohngeld erst ab dem Antragsmonat, § 25 Abs. 2 WoGG) bei „wahrscheinlich“ oder „möglich“, ohne Datumsbedingung; keine Hinweise aus Gesetzentwürfen (BT-Drs. 21/8284 nicht angezeigt) | ✓ | `recht-geltend` |
| Formel, Höchstbeträge, Klima- und Heizkomponente (§§ 12, 19), Pauschalabzug je Einkommensart (§ 16) | ✓ | `wg-formel` |
| Werbungskosten-Pauschbetrag (§ 14 WoGG mit § 9a EStG: Arbeit 1.230 €, Rente 102 €, nicht bei Selbstständigen) und Mindestwerte für M und Y (Anlage 3 WoGG, ab 1.1.2025); 60 Haushalte gleich wie der amtliche Wohngeldrechner des Bundes | ✓ | `amtlich-wohngeld` |
| Abgleich mit veröffentlichten Musterbescheiden und amtlichen Rechenbeispielen (Merkblatt und DA Kinderzuschlag 2026, Merkblatt SGB II 8/2026, Musterbescheid Bürgergeld 2023 auf den Cent, Musterbescheid Wohngeld Frankfurt 2025, Wohngeld Hannover/München 2025, BMWSB-Hinweise 12+ Personen, Grundsicherung im Alter Hannover/Bochum, Elterngeld-Broschüre 2025), 23 feste Fälle, abgerufen 21.11.2026 | ✓ | `musterbescheide` |
| Bruttokaltmiete mit angegebenen Heizkosten (freiwilliges Feld), sonst Warmmiete minus Heizkostenkomponente (§§ 9, 12 WoGG) | ✓ | `wg-heiz` |
| Höchstbetrag der Miete unter dem Mietfeld und in der Einfachen Version (Gut zu wissen): Anlage 1 WoGG plus Klimakomponente (§ 12 Abs. 1, 7 WoGG, BGBl. 2024 I Nr. 314, abgerufen 20.11.2026), Vergleich mit der geschätzten Bruttokaltmiete (wie Wohngeld-Rechnung); Mietenstufe unsicher: Spanne und „möglich“; Abgrenzung zu den örtlichen Kosten der Unterkunft (§ 22 Abs. 1 SGB II, § 35 SGB XII); kein Hinweis auf Entwürfe zu 2027 (BT-Drs. 21/8284, nicht beschlossen, Stand 20.11.2026) | ✓ | `mietgrenze`, `mietgrenze-dom` |
| Kinderzuschlag/Grundsicherungsgeld: Mehrbedarf Alleinerziehende 36 % bei Kind unter 7; Kind von 6-13 kann 6 sein -> nie fälschlich „eher nicht“ (§ 21 Abs. 3 SGB II) | ✓ | `kiz-ae7` |
| Freibetrag 1.800 € je schwerbehinderter Person (GdB 100 oder Schwerbehinderung mit Pflege, § 17 Nr. 1) | ✓ | `wg-schwerb` |
| Freibetrag Alleinerziehende 1.320 € (§ 17 Nr. 3) | ✓ | `wg-ae` |
| Einkommen von Kindern unter 25: je Kind Arbeitnehmer-Pauschbetrag 102,50 €/Monat (§ 14 Abs. 1 WoGG, § 9a EStG) und Freibetrag bis 100 €/Monat (§ 17 Nr. 4); nur Summe bekannt: „wahrscheinlich“ wie ein verdienendes Kind (über der Minijob-Grenze vorsichtig ohne Pauschbetrag, weil die Auszahlung kleiner ist als das Brutto), obere Schätzung verteilt auf alle Kinder ab 6, dort mindert der Freibetrag auch Unterhalt, Waisenrente und Unterhaltsvorschuss der Kinder (höchstens bis zu deren Höhe, § 13 Abs. 1 WoGG); 13 Fälle auf den Euro gleich wie der amtliche Wohngeldrechner | ✓ | `wg-kindeink`, `wg-kind-wk`, `wg-kind-frei` |
| Elterngeld bis 300 € frei (§ 10 Abs. 1 BEEG) | ✓ | `wg-eg300` |
| Pflegegeld, Kindergeld und Kinderzuschlag kein Einkommen (§ 14) | ✓ | `wg-keinEink` |
| Grundrentenfreibetrag (§ 17a) | ✓ | `wg-grundrente` |
| Grundrentenfreibetrag (§ 17a) auch im Bescheid-Check (Art „Rente mit 33 Jahren Grundrentenzeiten“); Musterbescheid Frankfurt 6/2025 auf den Euro (355 €), abgerufen 21.11.2026 | ✓ | `bwg-17a` |
| Plausibilitätsprüfung Nr. 15.01 WoGVwV (amtlich: WoGVwV 28.06.2017 Nr. 15.01 Abs. 1 Satz 3, „Einnahmen zuzüglich Wohngeld“, verwaltungsvorschriften-im-internet.de; strengere Lesart nach den BMI-Hinweisen 11.03.2020, nicht amtlich veröffentlicht): Einnahmen plus vorsichtig geschätztes Wohngeld plus Kindergeld müssen 100 % der Miete und 80 % der Regelbedarfe decken, ohne Mehrbedarfe; sonst „möglich – Einkommen eher zu niedrig“ mit Betrag (keine Ablehnung, Nr. 15.01 Abs. 2); Abgleich Wohngeldstelle Hannover 1/2025, abgerufen 21.11.2026 | ✓ | `wg-plaus` |
| Einkommensgrenze bei 9,50 € ungerundetem Wohngeld (unter 10 € kein Wohngeld, § 21 Nr. 1 WoGG; Rundung Anlage 3 Nr. 3); Einkommensgrenzen München 2025 genau getroffen, abgerufen 21.11.2026 | ✓ | `wg-grenze10` |
| Mehr als 12 Haushaltsmitglieder: je weitere Person 65 € mehr, höchstens bis zur Miete (§ 19 Abs. 3 WoGG; BMWSB-Hinweise 02.12.2024), App und Bescheid-Check, abgerufen 21.11.2026 | ✓ | `wg-ueber12` |
| Mietenstufe aus der Postleitzahl für ganz Deutschland (Anlage zur WoGV, Stand 1.1.2023); Bayern von Hand geprüft, übrige Länder automatisch und unabhängig gegengeprüft (13.386 Einträge, 0 Abweichungen); nicht eindeutige Orte ohne Stufe | ✓ | `plz-stufe` |
| Vermögen: Regelvermutung der Verwaltungsvorschrift (60.000 € + 30.000 € je weitere Person) | ✓ | `wg-verm` |
| Ausschluss bei Grundsicherungsgeld, Grundsicherung im Alter und Hilfe zum Lebensunterhalt (§ 7 Abs. 1 Satz 1 Nr. 1, 5, 6 WoGG; Nr. 3 ist weggefallen); Asylbewerberleistungen siehe Zeile Asylverfahren | ✓ | `wg-ausschluss`, `asyl-ausschluss` |
| Ausschluss Azubis und Studierende mit dem Grunde nach förderfähiger Ausbildung (§ 20 Abs. 2) | ✓ | `wg-azubi` |
| Selbst gezahlter Unterhalt (§ 18 WoGG): bis 3.000 € im Jahr je Kind oder sonstiger Person, 6.000 € für frühere oder getrennt lebende Ehe- oder Lebenspartner; ohne Titel vorsichtig nur für „möglich“, mit Titel günstig der ganze Betrag (ob ein Titel über den Höchstbetrag hinaus zählt, ist nicht am Gesetzestext geprüft) | ◐ | `uz-wg` |
| Unterhalt für die Person selbst: ohne Realsplitting voll (§ 14 Abs. 2 Nr. 19 und 20 WoGG), mit Realsplitting sonstige Einkünfte (§ 22 Nr. 1a EStG) nach 102 € Pauschbetrag (§ 9a Satz 1 Nr. 3 EStG); Pauschalabzug § 16 WoGG 0 % (familienversichert) bis 20 % (Steuer und eigene Kranken-/Pflegeversicherung). Realsplitting unbekannt: „wahrscheinlich“ mit 0 % und ohne Pauschbetrag, „möglich“ mit 20 % und Pauschbetrag | ◐ | `unt-wg` |
| Geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld als künftiges Einkommen (§ 14 WoGG; Elterngeld bis 300 € frei), zweite Rechnung und Einstufung aus beiden | ✓ | `zuk-einkommen` |

## Kinderzuschlag (BKGG)
<!-- karten: kiz -->

| Regel | Status | Test |
|---|---|---|
| Höchstbetrag, Mindesteinkommen, 45 % Minderung, Vermögen; Einkommen der Eltern nach § 11b SGB II; Mehrbedarf Alleinerziehende | ✓ | `kiz-formel` |
| Einkommen der Kinder (Unterhalt, Unterhaltsvorschuss) ohne Abzüge zu 45 %, je Kind höchstens bis 0 (§ 6a Abs. 3 BKGG; DA-KiZ Stand 20.02.2026 C.2.2.1 Abs. 3 und 5, Beispiele Mia, Frau T., Ehepaar X., Patchwork; abgerufen 21.11.2026); die 9 Widerspruchsfälle zum KiZ-Lotsen (der Lotse rechnet Einkommen der Kinder nicht ein); knapp (reicht mit 30 € Versicherungspauschale je Kind) -> „möglich“ mit Hinweis; sonst „eher nicht“ mit Erklärung | ✓ | `kiz-kindeink` |
| Lohn der Kinder (Ausbildung): SoLo zieht nur 603 € ab; die Familienkasse zieht je Kind 603 € und bis zu 164 € Freibetrag ab (§ 11b Abs. 2b, Abs. 3 Satz 4 SGB II; DA-KiZ C.2.2.1 Abs. 3 Satz 9-11; abgerufen 21.11.2026) -> reicht es damit, „möglich“; Hinweis im Bescheid-Check. Versicherungspauschale 30 € nur bei Unterhalt, Unterhaltsvorschuss, Waisenrente (§ 6 Abs. 1 Nr. 2 Grundsicherungsgeld-Verordnung, früher Bürgergeld-V) | ◐ | `kiz-kindlohn` |
| Alter der Kinder nur grob bekannt: geschätzter Kinderzuschlag als Spanne (sicherer Mehrbedarf bis 36 %), der Bescheid-Check mit genauem Alter liegt darin | ✓ | `kiz-spanne` |
| Mehrbedarf Alleinerziehende: zwei Kinder von 14 bis 17 können beide unter 16 sein (36 %, § 21 Abs. 3 Nr. 1 SGB II) -> nie fälschlich „eher nicht“ | ✓ | `kiz-ae16` |
| Kinderzuschlag muss Hilfebedürftigkeit beenden (§ 6a Abs. 1 Nr. 3 BKGG): bereinigtes Einkommen + Kindergeld + Kinderzuschlag; reicht es nur mit Wohngeld: „möglich“, beides beantragen; 40 Familien ohne Widerspruch zum KiZ-Lotsen | ✓ | `amtlich-kiz` |
| Mehrbedarfe der Eltern im Bedarf der Eltern (Schwangerschaft, Warmwasser, 35 % Teilhabe) | ✓ | `kiz-mehr` |
| Vermögensgrenze 40.000 € für die erste, 15.000 € je weitere Person (§ 6a Abs. 3 BKGG, bleibt trotz Grundsicherungsreform) | ✓ | `kiz-verm` |
| Vermögen knapp über der Grenze: mindert nur den 1. Monat, wenn der übersteigende Betrag kleiner als der Monatsbetrag ist (§ 6a Abs. 3 Satz 6-7 BKGG; DA-KiZ C.2.2.2) -> „möglich“ mit Hinweis, sonst „eher nicht“; abgerufen 21.11.2026 | ✓ | `kiz-verm-knapp` |
| Wohngeld bei der Hilfebedürftigkeit: vorsichtige Wohngeld-Schätzung der App statt fester 300 € (DA-KiZ C.4.1 Abs. 7, fiktives Wohngeld) plus erweiterter Zugang: höchstens 100 € dürfen fehlen, wenn die Freibeträge aus Arbeit mindestens 100 € sind (§ 6a Abs. 1a BKGG; DA-KiZ C.4.2); abgerufen 21.11.2026 | ✓ | `kiz-wg-schaetz` |
| Alleinerziehend mit Altersrente: Rente zählt nur über dem eigenen Bedarf mit Kopfteil der Miete, der Überschuss mindert voll (DA-KiZ D.2 Abs. 1 Satz 9-11, Beispiel 2: 238 €); Paare mit einer Person in Altersrente bei der Tabelle (Beispiel 1: 560 statt 561 €); abgerufen 21.11.2026 | ✓ | `kiz-rentner-kopf` |
| Ausschluss bei Asylbewerberleistungen (kein Kindergeld) | ✓ | `asyl-ausschluss` |
| Im Haushalt muss jemand dem Grunde nach zum SGB II gehören (§ 6a Abs. 1 Nr. 3 BKGG i. V. m. § 7, § 8 SGB II; DA-KiZ Stand 20.02.2026, D.2 Abs. 1 Satz 5 und B.1 Abs. 5; BSG 13.07.2022, B 7/14 KG 1/21 R): allein mit Regelaltersgrenze oder voller Erwerbsminderung und nur Kindern unter 14 „eher nicht“; Kinderalter unbekannt oder Kind 14-17: höchstens „möglich“ (nur mit Kind ab 15); junge Erwachsene: normale Rechnung; Paar mit erwerbsfähigem Partner unverändert; beide Rente: höchstens „möglich“; nur Rente ab 60 oder Alter unbekannt (vorgezogene Altersrente, § 7 Abs. 4 SGB II): höchstens „möglich“ | ✓ | `kiz-rentner` |
| Selbst gezahlter, festgelegter Unterhalt mindert das Einkommen der Eltern (§ 11b Abs. 1 Satz 1 Nr. 7 SGB II) | ✓ | `uz-sgb2` |
| Unterhalt für einen Elternteil selbst: zählt für das Mindesteinkommen (§ 6a Abs. 1 Nr. 2 BKGG: Einkommen nach § 11 Abs. 1 Satz 1 und 2 SGB II, nur Wohngeld, Kindergeld, Kinderzuschlag ausgenommen); mindert als „anderes Einkommen“ in voller Höhe, die Überschreitung gilt zuerst als Erwerbseinkommen (§ 6a Abs. 6 BKGG) | ✓ | `unt-kiz` |
| Geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld als künftiges Einkommen der Eltern, zweite Rechnung | ✓ | `zuk-einkommen` |

## Kindergeld (EStG, BKGG)
<!-- karten: kindergeld -->

| Regel | Status | Test |
|---|---|---|
| 2027: antragsloses Kindergeld bei Geburt (§ 67 Abs. 2 i. V. m. § 69 Satz 3 EStG n. F.; Gesetz vom 15.10.2026, BGBl. 2026 I Nr. 307, ausgegeben 20.10.2026, in Kraft 1.1.2027) als Hinweis erst ab 1.1.2027, ohne Prognose; Entwurf 267 € wird nicht angezeigt, gerechnet wird mit 259 € | ✓ | `recht-geltend` |
| 259 € je Kind und Monat (2026); bis 18, bis 25 in Ausbildung oder Studium (§ 32 Abs. 4 Nr. 2) | ✓ | `kg-betrag` |
| Bis 21 arbeitslos gemeldet, bis 25 Freiwilligendienst, Ausbildungsplatzsuche, Übergangszeit bis 4 Monate; nach erster Ausbildung höchstens 20 Stunden Arbeit (§ 32 Abs. 4) | ◐ | `kg-mehr` |
| Ausländer: nur mit bestimmten Aufenthaltstiteln (§ 62 Abs. 2) | ◐ | `kg-asyl` |
| Bayern: Familiengeld (250 €, ab dem 3. Kind 300 €, 13. bis 36. Lebensmonat) und Krippengeld (bis 100 €) nur noch für Kinder, die bis Ende 2024 geboren sind | ◐ (Geburtsdatum der Kinder wird nicht abgefragt, daher Hinweis) | `kg-familiengeld` |
| Bayern: angekündigtes Kinderstartgeld | ○ (nach neueren Berichten nicht eingeführt; ohne amtliche Bestätigung nicht erwähnt) | |

## Kindergeld für erwachsene Kinder mit Behinderung (§ 32 Abs. 4 Satz 1 Nr. 3 EStG)
<!-- karten: kgBeh -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: Aufenthaltsvoraussetzung wie Kindergeld (§ 62 Abs. 2 EStG), höchstens „möglich“ mit Hinweis (Abruf 20.11.2026) | ◐ | `kgbeh-asyl` |
| Behinderung vor dem 25. Geburtstag eingetreten | ✓ | `kgbeh-25` |
| Kind kann sich nicht selbst unterhalten (Grundfreibetrag 12.348 € plus behinderungsbedingter Mehrbedarf) | ✓ | `kgbeh-ja` |

## Bildung und Teilhabe (§ 28 SGB II, § 6b BKGG)
<!-- karten: but -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: Bildung und Teilhabe auch mit Asylbewerberleistungen (§ 3 Abs. 4 AsylbLG), „möglich“ statt „nein“ (Abruf 20.11.2026) | ◐ | `but-asyl` |
| Anspruch bei Grundsicherungsgeld, Grundsicherung, Wohngeld oder Kinderzuschlag | ✓ | `but-bezug` |
| Schulbedarf und Teilhabe 15 € im Monat; bei Kindern unter 6 nur Teilhabe | ✓ | `but-inhalt` |
| Junge Erwachsene nur in der Schule, nicht mit Ausbildungsvergütung | ✓ | `but-azubi` |
| Kita und Tagespflege ohne Kostenbeitrag bei Grundsicherung, Wohngeld, Kinderzuschlag, Asylbewerberleistungen (§ 90 Abs. 4 SGB VIII) | ✓ | `but-kita` |
| Hort für Schulkinder ebenso ohne Kostenbeitrag, auf Antrag beim Jugendamt; nicht Mittagsbetreuung/Offener Ganztag der Schule (§ 90 Abs. 4, § 22 Abs. 1 SGB VIII, Abruf 20.11.2026) | ✓ | `but-hort` |

## Unterhaltsvorschuss (UVG)
<!-- karten: uvg -->

| Regel | Status | Test |
|---|---|---|
| Beispiele UVG-RL 2.5.4.4 (Ausbildungsvergütung 700 €: Anrechnung 248,75 €) und 1.3.1 (ab 40 % beim anderen Elternteil kein Anspruch) (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-uvg` |
| Beträge je Altersstufe 0–5 / 6–11 / 12–17 (nach Abzug des Kindergeldes) | ✓ | `uvg-betrag` |
| Beträge 2026 = Mindestunterhalt 486/558/653 € minus volles Kindergeld 259 € (§ 2 Abs. 1 und 2; BMBFSFJ, Einlegeblatt 2026) | ✓ | `uvg-amtlich` |
| Gezahlter Unterhalt wird je Kind angerechnet (§ 2 Abs. 3 Nr. 1); „unwahrscheinlich“ nur bei einem Kind, wenn er den höchsten Betrag nach Alter erreicht; bei mehreren Kindern höchstens „möglich“ (nur die Summe bekannt) | ✓ | `uvg-anrechnung`, `uvg-hand` |
| Waisenrente (auch Halbwaisenrente nach Tod des anderen Elternteils) wird angerechnet (§ 1 Abs. 1 Nr. 3 b, § 2 Abs. 3 Nr. 2) und zählt bei anderen Leistungen als Einkommen der Kinder | ✓ | `uvg-waise` |
| Waisenrente eingetragen, aber nicht angekreuzt, dass Unterhalt fehlt oder der andere Elternteil gestorben ist: „möglich“ mit Hinweis, den Haken zu setzen (Waisenrente deutet auf einen verstorbenen Elternteil, § 1 Abs. 1 Nr. 3 b) | ✓ | `uvg-witwe` |
| Eigenes Einkommen des Kindes nach der allgemeinbildenden Schule: minus 102,50 € (1/12 Arbeitnehmer-Pauschbetrag), in Ausbildung minus weitere 100 €, davon die Hälfte (§ 2 Abs. 4). Sicher nur bei einem Kind (14–17) in betrieblicher Ausbildung (Auszahlung = untere Grenze), sonst „möglich“ bzw. Hinweis | ◐ | `uvg-kindeink` |
| Ab 12 Jahren: kein Grundsicherungsgeld des Kindes (Karte Grundsicherungsgeld „unwahrscheinlich“ wegen Einkommen oder Vermögen; bei anderem Ausschlussgrund wie Studium nur „möglich“) oder Elternteil mit mindestens 600 € Einkommen brutto ohne Kindergeld, Partnereinkommen zählt nicht (§ 1 Abs. 1a); Hinweis auch, wenn Unterhalt oder Waisenrente angerechnet wird | ◐ | `uvg-ab12` |
| Zwei Erwachsene ohne Angabe, wer die zweite Person ist: nur „möglich“ | ✓ | `uvg-paar` |
| Neue Partnerschaft ohne Trauschein: Anspruch bleibt (familienportal.de) | ✓ | `uvg-partner` |
| Mit neuem Partner verheiratet oder verpartnert (Stiefelternteil): kein Anspruch (§ 1 Abs. 1 Nr. 2) | ✓ | `uvg-stiefelternteil` |
| Lebt mit dem anderen Elternteil zusammen: kein Anspruch für gemeinsame Kinder (§ 1 Abs. 3); bei mehreren Kindern „möglich“ | ✓ | `uvg-elternteil` |
| Wechselmodell: anderer Elternteil betreut zu 40 % oder mehr, kein Anspruch für dieses Kind (BVerwG, 12.12.2023, 5 C 9.22) | ✓ | `uvg-wechsel` |
| Aufenthaltsgestattung oder Duldung: höchstens „möglich“, weil Kind oder Elternteil die Voraussetzung erfüllen kann (deutsches Kind, eigener Titel des Kindes, Beschäftigungsduldung, § 1 Abs. 2a); ohne deutsche oder EU-Staatsangehörigkeit Hinweis auf nötige Aufenthaltstitel | ◐ | `uvg-aufenthalt`, `uvg-hand` |
| Verweigerte Angaben zum anderen Elternteil oder keine Mitwirkung bei der Vaterschaft: kein Anspruch; Vater unbekannt oder gestorben: möglich (§ 1 Abs. 3) – nur Hinweis | ◐ | `uvg-mitwirkung` |
| Rückwirkend höchstens für den Monat vor dem Antrag (§ 4) – Hinweis | ✓ | `uvg-rueckwirkung` |
| Änderungen sofort melden, sonst Rückzahlung (§§ 5, 6); verheiratet und dauernd getrennt, auch bei mindestens 6 Monaten Klinik, Heim oder Haft des Ehepartners (§ 1 Abs. 2) – Hinweise | ✓ | `uvg-hinweise` |
| Nur volljährige Kinder: kein Unterhaltsvorschuss, Hinweis auf Unterhalt, Beratung des Jugendamts bis 21 (§ 18 Abs. 4 SGB VIII), BAföG/Berufsausbildungsbeihilfe; Kind im Heim oder in Pflegefamilie: kein Anspruch (Hinweis) | ✓ | `uvg-volljaehrig` |
| Unterhaltsvorschuss zählt als Einkommen der Kinder bei Grundsicherungsgeld (voll, bis zum Bedarf), Kinderzuschlag (45 %) und Wohngeld, auch bei neuer Partnerschaft ohne Trauschein | ✓ | `uvg-einkommen`, `gg-unterhalt` |

## BAföG
<!-- karten: bafoeg -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: Gestattung nur über § 8 Abs. 3, Duldung erst nach 15 Monaten (§ 8 Abs. 2a BAföG): höchstens „möglich“ mit Hinweis (Abruf 20.11.2026) | ◐ | `bafoeg-asyl` |
| EU-Bürger ohne Arbeit, unter 5 Jahren: BAföG nur mit Daueraufenthaltsrecht, als Arbeitnehmer/Selbstständiger oder Familienangehöriger oder nach Beschäftigung (§ 8 Abs. 1 Nr. 2 bis 4 BAföG): höchstens „möglich“ mit Hinweis, Arbeit der Eltern kennt die App nicht (Abruf 20.11.2026) | ◐ | `bafoeg-eu` |
| Auto zählt zum Vermögen (§ 27) | ✓ | `auto` |
| Elternfreibeträge (§ 25) und Grenzbereich | ✓ | `bafoeg-eltern` |
| Einkommen über dem Freibetrag: 50 % und 5 % je Kind mit Freibetrag anrechnungsfrei (§ 25 Abs. 4 BAföG); „eher nicht“ erst, wenn die Anrechnung den höchsten Bedarf 1.088 € übersteigt (475 + 380 € nach § 13, 185 + 48 € nach § 13a Abs. 2; bafög.de nennt 992 € mit § 13a Abs. 1), Befund 10 (Abgleich 2, Abruf 21.11.2026); seit Update BAföG-Betrag auch dann, wenn Geschwister in förderfähiger Ausbildung wären (§ 11 Abs. 4: geteilt, ohne 770 €) | ✓ | `mb2-bafoeg`, `bafoeg-eltern` |
| Unterhalt eines Elternteils für sich selbst: Einkommen nach § 21 Abs. 1 BAföG nur mit Realsplitting (§ 22 Nr. 1a EStG); entscheidet er über die Grenze, höchstens „möglich“ | ◐ | `unt-bafoeg` |
| Höhe der Elternfreibeträge 2026: 2.540 € (verheiratet), 1.690 € (je Elternteil sonst), 770 € je weiteres Kind | ✓ (mehrere Quellen übereinstimmend; Änderung erst zum Sommersemester 2027 geplant, nur Wohnpauschale) | `bafoeg-eltern` |
| Vermögensfreibetrag 15.000 € bis zum 30. Geburtstag, danach 45.000 € (§ 29); zusätzlich 2.300 € nur für Ehe- oder eingetragene Lebenspartner und je eigenes Kind (§ 29 Abs. 1 Nr. 2, 3): Einstufung mit dem größten Freibetrag, Betrag als Spanne, Text `bafoeg.vermTeil`/`bafoeg.vermEvtl` (Abruf 21.11.2026) | ✓ | `bafoeg-verm`, `bafoeg-betrag` |
| Vermögen über dem Freibetrag: nur der Rest, geteilt durch 12 Monate Bewilligungszeitraum, mindert das BAföG (§ 30 BAföG, bafög.de Beispiel „Stefan“): „möglich“ mit Hinweis und Betrag im Monat, „eher nicht“ erst über 12 × 1.088 €, Befund 11 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-bafoeg`, `bafoeg-verm`, `auto` |
| Altersgrenze bei Beginn: 45. Lebensjahr noch nicht vollendet, also unter 45 (§ 10 Abs. 3, Abruf 21.11.2026), Ausnahmen möglich | ✓ | `bafoeg-alter` |
| Grob geschätzter Betrag (nur Studium): Bedarf 475 € + 59/380 € Wohnen (§ 13), + 0 / 102 + 35 / bis 185 + 48 € KV/PV (§ 13a), + 160 € je eigenem Kind unter 14 (§ 14b) minus Anrechnung: Eltern §§ 21, 25 (Einkommen über 2.540/1.690 € + 770 € je Kind, davon 50 % − 5 % je Kind), Geschwister in Ausbildung § 11 Abs. 4 (Spanne über alle Fälle), eigenes Einkommen § 23 (389 € frei, Bek. 18.11.2025, BGBl. 2025 I Nr. 279), Ehegatte § 25 Abs. 1 Nr. 2, Vermögen §§ 29, 30; § 51 Abs. 3, 4 (Rundung, unter 10 € nichts). Unbekanntes als Spanne; Elternteil allein und Studierende unter 37 (§ 11 Abs. 3 Nr. 2: maßgeblich ist das Alter bei Beginn des Ausbildungsabschnitts, die App kennt nur das Alter heute): nur „bis etwa“. Annahme im Text `bafoeg.kindHinweis`: Erwachsene im Haushalt sind die Eltern, Einkommen wie heute. Amtlicher Abgleich (BAföG Digital, 200 Fälle, 21.11.2026): alle amtlichen Beträge in SoLos Spanne (`tools/amtlich-vergleich-bafoeg-eg.js`) | ✓ | `bafoeg-betrag` |
| Betriebliche Ausbildung: kein BAföG, sondern Berufsausbildungsbeihilfe | ✓ | `bafoeg-betrieb` |

## Berufsausbildungsbeihilfe (§§ 56 ff. SGB III)
<!-- karten: bab -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: mit Gestattung keine BAB, mit Duldung nach 15 Monaten (§ 60 Abs. 3 SGB III): Hinweis (Abruf 20.11.2026) | ◐ | `bab-asyl` |
| Betriebliche Ausbildung, Wohnung außerhalb des Elternhauses (§ 60) | ✓ | `bab-voraus` |
| Höhe nach Bedarf und Einkommen der Eltern | ○ (Elterneinkommen wird nicht abgefragt; die Karte zeigt nie „wahrscheinlich“) | |

## Pflege (SGB XI)
<!-- karten: pflege, pflegeplus -->

| Regel | Status | Test |
|---|---|---|
| Kombinationsleistung Pflegegrad 3, Pflegedienst 1.092,81 €: 161,73 € (Infoblatt Landkreis Esslingen 8/2025) (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-pflege` |
| Pflegegeld, Entlastungsbetrag | ✓ | `pfl-geld` |
| Verhinderungspflege, Kurzzeitpflege (Entlastungsbudget 3.539 €), Pflegehilfsmittel, Wohnumfeld | ✓ | `pfl-plus` |
| Pflegesachleistung und Kombinationsleistung (§§ 36, 38), Tages- und Nachtpflege (§ 41) | ✓ | `pfl-sach` |
| Rentenversicherung für pflegende Angehörige (§ 44) | ◐ | `pfl-rente` |
| Pflegezeit, Familienpflegezeit, Pflegeunterstützungsgeld | ◐ | `pfl-zeit` |
| Pflege-Startkachel „Welche Unterstützung gibt es?“: nur Leistungen des gewählten Pflegegrads (Pflegegrad 1 nach § 28a SGB XI ohne Pflegegeld, Sachleistung, Verhinderungs-/Kurzzeitpflege, Tagespflege, Rentenbeiträge; ohne Pflegegrad nur Pflegekurse und Pflegeberatung) | ✓ | `pu-pg` |
| Feste Beträge 2026 der Übersicht: Pflegegeld, Sachleistung, Tages-/Nachtpflege, Entlastungsbetrag 131 €, gemeinsamer Jahresbetrag 3.539 € (§ 42a), Pflegehilfsmittel 42 €, Wohnumfeld 4.180 € je Maßnahme, Wohngruppenzuschlag 224 € (§ 38a); Quelle BMG, Online-Ratgeber Pflege, Stand 14.9.2026, abgerufen 20.11.2026 | ✓ | `pu-betrag` |
| Verhinderungspflege auch stundenweise (BMG „Verhinderungspflege“, Stand 14.9.2026); Familienentlastende Dienste als anerkanntes Angebot zur Unterstützung im Alltag über den Entlastungsbetrag (BMG „Weitere Leistungen und Angebote zur Unterstützung im Alltag“, Stand 14.9.2026); Bezahlung des FED als Verhinderungspflege nur „möglich“ | ✓ | `pu-fed` |
| Darstellung: „pro Monat“ und „pro Jahr“ getrennt, Alltagswort mit Amtswort in Klammern, kein Hinweis auf den Reformentwurf (nur geltendes Recht), Stellen nur als Art (Pflegekasse, Pflegestützpunkt). Erklärtexte nur Deutsch (wie Pflege-Assistent) | ✓ | `pu-ansicht` |
| Pflege-Übersicht aufgeräumt (21.11.2026): Einleitung ein Satz, Rest zum Aufklappen; grüner Hauptknopf „Pflegegrad selbst einschätzen“ unter den Leistungen (nicht bei Grad 5 und nicht aus der Ergebnisseite); Hinweis als Tipp mit Symbol „Kostenlose Hilfe: Pflegekasse oder Pflegestützpunkt“ (§ 7a Abs. 1, § 7c SGB XI, abgerufen 21.11.2026) | ✓ | `pu-aufr` |
| Pflege-Korrekturen (abgerufen 20.11.2026): Beratungsbesuch Pflicht halbjährlich bei PG 2–5, PG 4/5 auf Wunsch vierteljährlich (§ 37 Abs. 3 SGB XI); Verhinderungspflege durch nahe Angehörige/Haushalt nicht beruflich höchstens doppeltes Pflegegeld plus nachgewiesene Kosten bis zum Jahresbetrag (§ 39 Abs. 3 SGB XI); aufs Konto Pflegegeld und Wohngruppenzuschlag; ohne Pflegegrad 10 Arbeitstage auch bei voraussichtlicher Pflegebedürftigkeit (§ 2, § 7 Abs. 4 PflegeZG) | ✓ | `pu-korr` |
| Pflegegrad selbst einschätzen, Ergebnisseite: groß „Wahrscheinlich Pflegegrad X“, Hinweis „Das ist eine Einschätzung. Entscheiden tut die Pflegekasse.“, wichtigste Leistungen mit Beträgen nur aus den Rechenregeln (Rules.pflegeFuer), Punkte je Bereich zum Aufklappen; höchstens 3 Kacheln in dieser Reihenfolge (Pflegegrad beantragen bzw. Höherstufung beantragen, Mit dem Gutachten vergleichen, Was steht mir zu?); Ergebnis automatisch gespeichert, „← Zurück“ von den Unterseiten zur Ergebnisseite, Pflege-Startseite zeigt die letzte Einschätzung; in den Leistungs-Check nur, wenn man von dort kam | ✓ | `pflege-ergebnis` |
| Kachel „Mit dem Gutachten vergleichen“ öffnet die Gutachten-Prüfung (Brief → Pflegekasse) mit der Selbsteinschätzung; nach Eingabe der Gutachten-Werte Tabelle Bereich / Deine Punkte / Gutachten / Unterschied (gewichtet nach § 15 SGB XI, Rechnung aus pflege.js), Bereiche mit weniger Punkten im Gutachten fett; Texte in 13 Sprachen und Einfacher Sprache | ✓ | `pflege-vergleich` |

## Bayerisches Landespflegegeld (BayLPflGG)
<!-- karten: lpg -->

| Regel | Status | Test |
|---|---|---|
| Auszahlung bis 31. Januar des Folgejahres (Art. 2 Abs. 4 Satz 2 BayLPflGG), Satz im Antragshinweis in allen Sprachen, als „in der Regel“ (Antrag bis 3 Monate nach Jahresende möglich, Art. 3 Abs. 1 Satz 1); PG 2 in Bayern 500 €, anderes Land nein, Hinweis H3 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-lpg` |
| Ab Pflegegrad 2, Hauptwohnsitz Bayern, unabhängig vom Einkommen; ab dem Pflegegeldjahr 2026 500 € im Jahr (vorher 1.000 €) | ✓ | `lpg-ja` |
| Nur in Bayern; ohne Pflegegrad 2 nein, bei laufendem Pflegegrad-Antrag möglich | ✓ | `lpg-voraus` |
| Antrag einmal beim Bayerischen Landesamt für Pflege; Antragsfrist | ◐ (Fristangaben der Quellen widersprüchlich; die App rät zum baldigen Antrag) | `lpg-ja` |
| Empfänger des Antrags: Bayerisches Landesamt für Pflege, Postfach 13 65, 92203 Amberg (Hausanschrift Mildred-Scheel-Str. 4, 92224 Amberg); Quelle lfp.bayern.de (Seite Landespflegegeld und Impressum), abgerufen 19.11.2026; nicht für Wohnorte außerhalb Bayerns | ✓ | `lpg-stelle` |

## Hilfe zur Pflege (SGB XII, 7. Kapitel)
<!-- karten: hzp -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: keine Sozialhilfe (§ 23 Abs. 2 SGB XII), nach 36 Monaten § 2 AsylbLG, davor Einzelfall § 6 AsylbLG: „möglich“ mit eigenem Hinweis (Abruf 20.11.2026) | ◐ | `hzp-asyl` |
| EU-Bürger ohne Arbeit, unter 5 Jahren: keine Leistungen nach § 23 Abs. 1 SGB XII, Ausnahmen Härte und nach 5 Jahren (§ 23 Abs. 3 Satz 1, 6, 7 SGB XII): „unwahrscheinlich“ wie Grundsicherung im Alter, Hinweis Sozialhilfe (Abruf 20.11.2026) | ✓ | `sh-eu` |
| Voraussetzung Pflegegrad 2–5 oder laufender Antrag (§ 61a) | ✓ | `hzp-voraus` |
| Einkommensgrenze: 2 × Regelsatz Stufe 1 + Wohnkosten + 70 % Familienzuschlag (§ 85) | ✓ | `hzp-grenze` |
| Einkommensgrenze: Unterkunft mit Heizung, also ganze Warmmiete (BSG 30.04.2020, B 8 SO 1/19 R, Leitsatz; § 85 nennt die Heizung nicht; manche Träger rechnen ohne Heizung, z. B. Infoblatt Nr. 37 Pflegestützpunkte Berlin 12/2025, deshalb Karte „möglich“ und „etwa“), Familienzuschlag auf volle Euro aufgerundet (395 €, § 85 Abs. 1 Nr. 3), Befund 15 (Abgleich 2 und Prüfung, Abruf 21.11.2026) | ✓ | `mb2-hzp` |
| Schonvermögen 10.000 € je Erwachsenem, 500 € je unterhaltener Person | ✓ | `hzp-verm` |
| Heim: Eigenanteil; Unterhalt der Kinder erst ab 100.000 € (§ 94 Abs. 1a) | ◐ | `hzp-heim` |
| Höhe: hängt von den tatsächlichen Pflegekosten ab | ○ (Kosten werden nicht abgefragt; Karte zeigt „möglich“) | |

## Steuer (EStG)
<!-- karten: pausch -->

| Regel | Status | Test |
|---|---|---|
| Pauschbeträge § 33b Abs. 3 EStG (384 bis 2.840 €, 7.400 €) (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-pausch` |
| Behinderten-Pauschbetrag (§ 33b Abs. 3), Übertragung auf die Eltern (§ 33b Abs. 5) | ✓ | `st-pausch` |
| Fahrtkostenpauschale 900 / 4.500 € (§ 33 Abs. 2a) | ✓ | `st-fahrt` |
| Pflege-Pauschbetrag 600 / 1.100 / 1.800 € (§ 33b Abs. 6) | ✓ | `st-pflege` |
| Steuerermäßigung haushaltsnahe Dienstleistungen und Pflege (§ 35a) | ◐ | `st-35a` |

## Schwerbehinderung (SGB IX und andere)
<!-- karten: ausweis, eingl, arbeit -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: Eingliederungshilfe ausgeschlossen (§ 100 Abs. 2 SGB IX), nach 36 Monaten § 2 AsylbLG, davor Einzelfall; Kinder mit seelischer Behinderung § 6 Abs. 2 SGB VIII: eigener Hinweis (Abruf 20.11.2026) | ◐ | `eingl-asyl` |
| Asylverfahren oder Duldung: Schwerbehinderteneigenschaft verlangt „rechtmäßigen“ Wohnsitz oder Arbeitsplatz (§ 2 Abs. 2 SGB IX); mit Duldung Anspruch auf Feststellung, wenn der Aufenthalt voraussichtlich länger als 6 Monate dauert (BSG 29.04.2010, B 9 SB 2/09 R, rechtsprechung-im-internet.de). Die Prognose fragt die App nicht ab: höchstens „möglich“ (Abruf 20.11.2026) | ◐ | `ausweis-asyl` |
| Schwerbehindertenausweis ab GdB 50, Gleichstellung ab 30, Zusatzurlaub 5 Tage (§ 2, § 208) | ✓ | `sb-ausweis` |
| Wertmarke kostenlos bei H/Bl/TBl/aG und mit G bei Grundsicherung (§ 228); Kfz-Steuer-Ermäßigung bei G, Befreiung bei H/Bl/aG | ✓ | `sb-frei` |
| Besonderer Kündigungsschutz (§ 168) | ◐ | `sb-kuendigung` |
| Parkerleichterungen bei aG/Bl | ◐ | `sb-park` |
| Eingliederungshilfe (SGB IX Teil 2, § 35a SGB VIII für Kinder mit seelischer Behinderung) | ◐ | `sb-eingl` |
| Budget für Arbeit statt Werkstatt, Lohnkostenzuschuss bis 75 % (§ 61) | ◐ | `sb-budget` |
| Merkzeichen Gl: Freifahrt mit Wertmarke; Gehörlosengeld nur in einigen Ländern (z. B. Hessen, Sachsen-Anhalt) | ◐ (Länderliste und Beträge in den Quellen uneinheitlich, daher Hinweis ohne Betrag) | `sb-gl` |

## Renten (SGB VI)
<!-- karten: emrente, srente -->

| Regel | Status | Test |
|---|---|---|
| Altersrente für schwerbehinderte Menschen, Jahrgänge 1960, 1963, 1964 wie DRV Knappschaft-Bahn-See 20.04.2026 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-srente` |
| Erwerbsminderungsrente: unter 3 Stunden voll, 3 bis unter 6 Stunden teilweise; Wartezeit 5 Jahre (§ 43) | ✓ | `rente-em` |
| Werkstatt: volle Erwerbsminderung, Rente nach 20 Jahren (§ 43 Abs. 6) | ✓ | `rente-wfbm` |
| Altersrente für schwerbehinderte Menschen (§§ 37, 236a), Altersgrenzen je Jahrgang | ✓ | `rente-sb` |

## Landesblindengeld (BayBlindG und Gesetze der anderen Länder)
<!-- karten: blindengeld -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: § 9 Abs. 1 AsylbLG schließt Leistungen nach „vergleichbaren Landesgesetzen“ aus; ob das Landesblindengeld darunter fällt, ist offen (Art. 1, 3 BayBlindG ohne Regel): höchstens „möglich“ (Abruf 20.11.2026) | ◐ | `blindengeld-asyl` |
| Blindengeld und Sehbehindertengeld, Beträge Stand 7/2026 | ✓ | `bg-betrag` |
| Anrechnung von Pflegegeld: 46 % bei Pflegegrad 2, 33 % ab 3, mindestens 20 € (Art. 4) | ✓ | `bg-pflege` |
| Pflegegrad 3 bis 5 einheitlich 33 % des Pflegegeldes von Pflegegrad 3 (197,67 €, Art. 4 Abs. 1 Satz 2 BayBlindG; ZBFS-Infoblatt 7/2026: 611,33 €), Befund 12 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-blind` |
| Andere Länder: blinde Menschen „wahrscheinlich“ (Landesblindengeld gibt es in jedem Land), Spanne für Erwachsene etwa 350 bis 950 €; hochgradig Sehbehinderte nur „möglich“; Hinweis Pflegegeld-Anrechnung | ◐ | `bg-land` |
| Landesblindengeld mit belegtem Betrag (Stand 11/2026): Baden-Württemberg 410 €, Hessen 818,65 € (86 % der Blindenhilfe), Mecklenburg-Vorpommern 430 €, Niedersachsen 450 €, Rheinland-Pfalz 410 €, Schleswig-Holstein 350 €; übrige Länder (Quellen widersprüchlich) weiter mit Spanne | ✓ | `bg-land-betrag` |
| Genaue Beträge und Anrechnungsregeln der anderen 15 Länder | ○ (die Quellen widersprechen sich stark; ohne geprüfte Quelle je Land keine feste Zahl) | |

## Blindenhilfe (SGB XII, § 72)
<!-- karten: blh -->

| Regel | Status | Test |
|---|---|---|
| Nur für blinde Menschen (§ 72 Abs. 5), nicht bei hochgradiger Sehbehinderung | ✓ | `blh-voraus` |
| Landesblindengeld wird voll angerechnet (§ 72 Abs. 1 Satz 2); in Bayern meist nur ein kleiner Unterschiedsbetrag | ◐ | `blh-land` |
| Einkommensgrenze wie bei Hilfe zur Pflege (§ 85), darüber höchstens 40 % eingesetzt (§ 87 Abs. 1 Satz 3) | ✓ | `blh-grenze` |
| Unterkunft mit Heizung wie bei Hilfe zur Pflege (BSG B 8 SO 1/19 R), Befund 15 (Abgleich 2 und Prüfung, Abruf 21.11.2026) | ✓ | `mb2-blh` |
| EU-Bürger ohne Arbeit, unter 5 Jahren: Blindenhilfe wie Hilfe zur Pflege ausgeschlossen (§ 23 Abs. 3 SGB XII), Ausnahmen Härte und nach 5 Jahren (Abruf 20.11.2026) | ✓ | `sh-eu` |
| Schonvermögen 10.000 € je Erwachsenem | ✓ | `blh-verm` |
| Unter 18 Jahren halber Betrag (§ 72 Abs. 2), Anrechnung von Pflegegeld (§ 72 Abs. 1 Satz 3), Kürzung im Heim (§ 72 Abs. 4) | ◐ | `blh-hinweise` |
| Asylbewerber: erst mit Analogleistungen (§ 2 AsylbLG) | ◐ | `blh-asyl` |
| Höhe der Blindenhilfe 951,92 €, unter 18 Jahren 476,78 € (ab 1.7.2026); Unterschied zum Landesblindengeld, wo dieses belegt ist | ✓ | `blh-betrag` |
| Zuständig in Bayern: Bezirk | ○ (bitte von einer Beratungsstelle bestätigen lassen) | |

## Arbeitslosengeld I (SGB III)
<!-- karten: alg1 -->

| Regel | Status | Test |
|---|---|---|
| Höhe: obere Grenze der Spanne mindestens Leistungsentgelt Steuerklasse III = Brutto − 20 % Sozialversicherungspauschale − Lohnsteuer/Soli (§ 153 Abs. 1 SGB III); amtliches Beispiel Merkblatt 1 Abschnitt 4 (2.400 €, Steuerklasse III, Kind: 1.286,40 €) liegt in der Spanne; Dauer 8 / 24 Monate wie Merkblatt, Befund 13 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-alg` |
| Asylverfahren oder Duldung: verfügbar nur, wer arbeiten „kann und darf“ (§ 138 Abs. 5 Nr. 1 SGB III), also mit Arbeitserlaubnis: höchstens „möglich“ (Abruf 20.11.2026) | ◐ | `alg-asyl` |
| Selbstständige nur mit freiwilliger Arbeitslosenversicherung (§ 28a) | ◐ | `selbst` |
| Anwartschaft 12 Monate in 30 Monaten (§§ 142, 143); Minijob zählt nicht (§ 27 Abs. 2) | ✓ | `alg-anwart` |
| 60 %, mit Kind 67 % des pauschalierten Nettos (§ 149), Beitragsbemessungsgrenze (§ 341) | ✓ | `alg-satz` |
| Anspruchsdauer nach Versicherungszeit und Alter (§ 147) | ✓ | `alg-dauer` |
| Sperrzeit bei eigener Kündigung oder Aufhebungsvertrag, 12 Wochen (§ 159) | ◐ | `alg-sperr` |
| Nebeneinkommen: unter 15 Stunden, 165 € frei (§ 155) | ◐ | `alg-neben` |
| Nahtlosigkeit nach dem Krankengeld (§ 145) | ◐ | `alg-nahtlos` |
| Kein Anspruch im Rentenalter (§ 136 Abs. 2) | ✓ | `alg-alter` |

## Krankenversicherung (SGB V)
<!-- karten: krankengeld, zuzahl -->

| Regel | Status | Test |
|---|---|---|
| Krankengeld: obere Grenze mit dem Netto Steuerklasse III (§ 47 Abs. 1 SGB V); Rechnung zu Fuß nach § 47 Abs. 1 SGB V (brutto 3.000 €, netto 2.100 €: rund 1.655 €) in der Spanne, Befund 13 (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-krank` |
| 2027: Werte der Sozialversicherungs-Rechengrößenverordnung 2027 (BR-Drs. 576/26, Zustimmung Bundesrat 20.11.2026) erst ab 2027 und nur nach Verkündung im BGBl. (Schalter `svrg2027`; Stand 20.11.2026: nicht verkündet, daher auch 2027 Werte 2026): KV-Grenze 6.375 € (Krankengeld, Netto), RV-Grenze 8.850 € (Arbeitslosengeld, Netto), Bezugsgröße 4.130 € (Familienversicherung 590 €, nur noch in „Ich ziehe aus“), Kinderkrankengeld höchstens 148,75 € | ✓ | `recht-geltend` |
| Minijob-Hinweis bei Krankengeld und Arbeitslosengeld nennt die Grenze des Jahres (2026: 603 €, ab 2027: 633 €), keine feste Zahl im Text | ✓ | `recht-geltend` |
| Krankengeld 70 % brutto, höchstens 90 % netto, Beitragsbemessungsgrenze (§ 47) | ✓ | `kv-kg` |
| Lohnfortzahlung 6 Wochen, Krankengeld bis 78 Wochen (§ 48) | ◐ | `kv-78` |
| Minijob ohne Krankengeld | ✓ | `kv-minijob` |
| Rente (erste Person): Vollrente wegen Alters oder volle Erwerbsminderungsrente beendet den Anspruch, Teilrente kürzt ihn (§ 50 Abs. 1 Satz 1 Nr. 1, Abs. 2 SGB V). Welche Rente, fragt die App nicht: höchstens „möglich“, Hinweis vorn (Abruf 20.11.2026) | ◐ | `krank-rente` |
| Belastungsgrenze 2 % / 1 % bei chronisch Kranken (GdB ab 60 oder Pflegegrad 3–5) | ✓ | `kv-zuzahl` |
| Fahrtkosten zur ambulanten Behandlung bei aG, Bl, H oder Pflegegrad 3 (mit Einschränkung) bis 5 (§ 60) | ◐ | `kv-fahrt` |

## Rundfunkbeitrag (RBStV)
<!-- karten: rundfunk -->

| Regel | Status | Test |
|---|---|---|
| Befreiung bei Grundsicherungsgeld und Grundsicherung (§ 4 Abs. 1) | ✓ | `rf-bezug` |
| Befreiung bei Asylbewerberleistungen (§ 4 Abs. 1 Nr. 4) | ✓ | `rf-asyl` |
| Weitere Befreiungen: BAföG, Berufsausbildungsbeihilfe außerhalb des Elternhauses, Hilfe zur Pflege, Blindenhilfe, Taubblindheit; Härtefall | ◐ | `rf-mehr` |
| Ermäßigung auf ein Drittel bei Merkzeichen RF (§ 4 Abs. 2) | ◐ | `rf-rf` |

## Wohnberechtigungsschein (BayWoFG, WoFG und Landesrecht)
<!-- karten: wbs -->

| Regel | Status | Test |
|---|---|---|
| Asylverfahren oder Duldung: WBS nur bei Möglichkeit eines dauerhaften Wohnsitzes (§ 27 Abs. 2 WoFG, Art. 14 Abs. 2 BayWoFG): „unwahrscheinlich“ mit Hinweis auf Ausnahmen (z. B. Ausbildungsduldung: VG Berlin, Urteil vom 25.06.2019, VG 8 K 202.18) und Wohnungsamt (Entscheidung David 20.11.2026; Abruf 20.11.2026) | ◐ | `wbs-asyl` |
| Einkommensgrenzen nach Haushaltsgröße und Kindern; höhere Grenzen per Gebietsverordnung | ✓ | `wbs-grenze` |
| Freibetrag Schwerbehinderte nach § 24 WoFG (4.500 € / 2.100 €) | ✓ | `wbs-schwerb` |
| Länder ohne belegte Landesgrenze (Saarland): unter den Bundeswerten (§ 9 Abs. 2 WoFG: 12.000 / 18.000 €, + 4.100 € je weitere Person, + 500 € je Kind) „wahrscheinlich“, sonst „möglich“ | ◐ | `wbs-land` |
| Landesgrenzen aller übrigen 15 Länder nach amtlichen Quellen (Tabelle `docs/WBS-GRENZEN.md`), mit Aufrundung (RP, SH) und Zuschlag für 1-2 Personen (SH); auf den Euro geprüft; „nein“ nur über der höchsten Stufe nach 30 % Abzug, Freibeträgen und gezahltem Unterhalt mit 5 % Reserve | ✓ | `wbs-land-grenze` |
| WBS-Stufen je Land (Berlin WBS 140/180/220, Förderwege HH/SH/MV, NRW Gruppe A/B, HB, RP, ST, TH) mit Grenzen und erreichter Stufe | ✓ | `wbs-stufen` |
| Empfänger des WBS-Antrags: Wohnungsamt der kreisfreien Stadt mit Anschrift; Bayern: Landratsamt, aber nur in Landkreisen ohne Große Kreisstadt oder Große Delegationsgemeinde (29 + 8 Gemeinden; Liste laut BayernPortal, gegengeprüft am 19.11.2026 mit § 1 BayDVWoR, BayMBl. 2025 Nr. 41 und § 5 Abs. 1 ZustVBau; dort bewusst ohne Anschrift); Landkreise anderer Länder sowie Berlin und Hamburg (Bezirksämter) ohne Anschrift, dort bleibt „Wohnungsamt deiner Stadt oder Gemeinde“; Quelle der Anschrift jeweils Impressum der Behörde | ✓ | `wbs-stelle` |
| Genaue Einkommensgrenzen der anderen 15 Länder | ○ (Quellen widersprüchlich; Annahme: kein Land liegt unter den Bundeswerten, bitte bestätigen) | |

## Elterngeld (BEEG)
<!-- karten: elterngeld -->

| Regel | Status | Test |
|---|---|---|
| Beispiele der Broschüre „Elterngeld und Elternzeit“ (10/2025): 574 €, 1.625 €, Geschwisterbonus 1.430 € (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-eg` |
| Basiselterngeld 67 %, Ersatzrate bis 100 % unter 1.000 €, bis 65 % über 1.200 € (§ 2 Abs. 2); mindestens 300 €, höchstens 1.800 €; ElterngeldPlus halb so hoch, doppelt so lange (§ 4a); bis zu 14 Monate (§ 4) | ✓ | `eg-satz` |
| Elterngeld-Netto: Netto minus ein Zwölftel des Arbeitnehmer-Pauschbetrags (§ 2c Abs. 1 BEEG i. V. m. § 9a EStG: 1.230 € / 12 = 102,50 €; Entscheidung David 21.11.2026: Gesetz gilt). Unterschied zum Elterngeld-Schnellrechner des Bundes (rechnet mit 83,33 €) genau erklärt: bei festem Satz SoLo um Satz × 19,17 € niedriger, bei Mindest- und Höchstbetrag gleich | ✓ | `amtlich-elterngeld` |
| Geschwisterbonus 10 %, mindestens 75 € (§ 2a BEEG): bei zwei Kindern unter 6 eingerechnet, bei einem als Hinweis (unter 3?); amtlich geprüft | ✓ | `amtlich-elterngeld` |
| Einkommensgrenze 175.000 € zu versteuerndes Einkommen (§ 1 Abs. 8); Mutterschaftsgeld wird angerechnet (§ 3) | ◐ | `eg-hinweise` |
| Ausländer: Anspruch abhängig vom Aufenthaltstitel (§ 1 Abs. 7) | ◐ | `eg-asyl` |
| Mehrlingszuschlag 300 € je weiteres Kind der Geburt, auch neben dem Geschwisterbonus (§ 2a Abs. 4); Kinder der Geburt zählen nicht als Geschwister (§ 2a Abs. 1 Satz 2); beim ElterngeldPlus halbiert (§ 4a Abs. 2 Satz 3 Nr. 3) (Abruf 21.11.2026) | ✓ | `eg-mehrlinge` |
| Teilzeit nach der Geburt: Prozentsatz nach dem Einkommen vorher auf den Unterschied, Einkommen vorher höchstens 2.770 € (§ 2 Abs. 3), mindestens 300 € (§ 2 Abs. 4); ElterngeldPlus höchstens die Hälfte des Basiselterngelds ohne Einkommen, Mindestbetrag und Mindest-Geschwisterbonus halbiert (§ 4a Abs. 2) (Abruf 21.11.2026) | ✓ | `eg-teilzeit` |
| Teilzeit: Hinweis auf höchstens 32 Wochenstunden (§ 1 Abs. 6 Nr. 1); schon laufendes Elterngeld bei Mehrlingen: Freibetrag beim Wohngeld 300 € je Kind der Geburt (§ 10 Abs. 4), bei Grundsicherung, Sozialhilfe und Kinderzuschlag nicht vervielfacht und nur über Mindestbetrag plus Mehrlingszuschlag (§ 10 Abs. 5; Richtlinien zum BEEG 07/2026 Nr. 10.4, 10.5.2) (Abruf 21.11.2026) | ✓ | `eg-mehrlinge-frei` |

## Mutterschaftsgeld (MuSchG, § 24i SGB V)
<!-- karten: mutter -->

| Regel | Status | Test |
|---|---|---|
| Familienportal: 13 € am Tag, 210 € Bundesamt für Soziale Sicherung, Schutzfristen 6/8/12 Wochen (Abgleich 2, Abruf 21.11.2026) | ✓ | `mb2-mutter` |
| Angestellte: Krankenkasse höchstens 13 € je Kalendertag, Arbeitgeber zahlt den Unterschied zum Netto (§ 20 MuSchG) | ✓ | `mu-lohn` |
| Nicht gesetzlich versichert oder Minijob ohne eigene Versicherung: Bundesamt für Soziale Sicherung einmalig höchstens 210 € | ◐ (Versicherungsart wird nicht abgefragt, daher Hinweis) | `mu-lohn` |
| Arbeitslosengeld: Mutterschaftsgeld in Höhe des Arbeitslosengeldes | ✓ | `mu-alg` |
| Schutzfrist 6 Wochen vor, 8 (12) Wochen nach der Geburt | ✓ | `mu-lohn` |
| Ohne Arbeit oder Arbeitslosengeld kein Mutterschaftsgeld, Hinweis auf Mehrbedarf und Erstausstattung | ✓ | `mu-ohne` |
| Bei zwei Erwachsenen unbekannt, wer schwanger ist: nur „möglich“ | ✓ | `mu-ohne` |

## Kinderkrankengeld (§ 45 SGB V)
<!-- karten: kkg -->

| Regel | Status | Test |
|---|---|---|
| 2026: 15 Arbeitstage je Kind und Elternteil (Alleinerziehende 30), höchstens 35 (70); ab 2027 wieder 10 (20), höchstens 25 (50), automatische Umstellung | ✓ | `kkg-tage` |
| 90 % des Nettos, höchstens 135,63 € am Tag; Kind unter 12 (mit Behinderung ohne Altersgrenze) | ◐ (Alter der Kinder unbekannt, daher „möglich“) | `kkg-tage` |
| Nur gesetzlich versicherte Eltern mit Arbeit (nicht Minijob) | ✓ | `kkg-ohne` |
| Nur wenn gerade ein Kind krank ist und ein Elternteil deshalb nicht arbeiten kann (Frage im Fragebogen bei den Kindern) | ✓ | `kkg-krank` |

## Asylbewerberleistungen (AsylbLG)
<!-- karten: asylblg -->

| Regel | Status | Test |
|---|---|---|
| Eigene Leistung bei Aufenthaltsgestattung, Duldung, Ausreisepflicht (§ 1); Analogleistungen nach 36 Monaten (§ 2) | ✓ / ◐ | `asyl-ja` |
| Ausschluss vom Grundsicherungsgeld, von der Grundsicherung im Alter und vom Kinderzuschlag; Wohnberechtigungsschein „unwahrscheinlich“; Wohngeld nur ohne AsylbLG-Bezug (§ 7 Abs. 1 Satz 1 Nr. 8 WoGG) | ✓ | `asyl-ausschluss` |
| Einkommensart „Asylbewerberleistungen“ (nur bei Aufenthalt „asyl“ wählbar): Karte „bekommst du schon“, Wohngeld „unwahrscheinlich“ (§ 7 Abs. 1 Satz 1 Nr. 8 WoGG), Bildung und Teilhabe „bekommst du“ über das Sozialamt (§ 3 Abs. 4 AsylbLG), Kita ohne Beitrag (§ 90 Abs. 4 Satz 2 SGB VIII), Rundfunkbeitrag befreit (§ 4 Abs. 1 Nr. 4 RBStV); Zuzahlung unverändert „möglich“ (Abruf 20.11.2026) | ✓ | `asyl-bezug` |
| Höhe der Leistungen (Bedarfsstufen, Sachleistungen in Unterkünften) | ○ (hängt von der Unterbringung ab; die Stelle rechnet) | |

## Zuständige Stellen außerhalb Bayerns
<!-- karten: -->

| Regel | Status | Test |
|---|---|---|
| Versorgungsamt, Elterngeldstelle, Träger der Eingliederungshilfe und Stelle für das Landesblindengeld je Land (ohne Anschrift), sonst allgemeine Angabe; Sachsen-Anhalt seit 1.4.2026: Landesamt für Soziales, Jugend und Gesundheit (LAS) für Ausweis und Blindengeld; Eingliederungshilfe: Antrag beim Sozialamt des Landkreises oder der kreisfreien Stadt, Träger ist das LAS (las.sachsen-anhalt.de, abgerufen 21.11.2026) | ◐ | `zust-land` |
| Kreisebene außerhalb Bayerns: kreisfreie Städte (außer Berlin, Hamburg) mit Name und offizieller Website für Wohngeld, Grundsicherung, Unterhaltsvorschuss, Bildung und Teilhabe, Asyl; Landkreise nur für Grundsicherung im Alter; Anschrift nur aus Impressum oder Kontaktseite der Behörde selbst; die 60 früheren Wikipedia-Anschriften am 21.11.2026 gegen die Behörden-Website geprüft: 32 bestätigt, 15 korrigiert (Frankfurt (Oder), Dresden, Suhl, Kreis Rottweil, Darmstadt, Kreis Osterholz, Oldenburg, Essen, Köln, Münster, Bochum, Dortmund, Mainz, Kreis Mainz-Bingen, Bremerhaven; Essen und Münster nur Großkunden-PLZ, Bremerhaven Postfach), 13 nicht belegbar (Website nicht abrufbar: Nordwestmecklenburg, Jerichower Land, Erfurt, Weimarer Land, Saalfeld-Rudolstadt, Ulm, Bremen, Frankfurt am Main, Kreis Fulda, Remscheid, Solingen, Wuppertal, Ludwigshafen) – dort weiter nur Name, Website und „Anschrift auf der Website“; Test: keine angezeigte Anschrift mit wikipedia.org als Quelle | ✓ | `beh-de` |
| Familienkasse außerhalb Bayerns für Kindergeld und Kinderzuschlag: nur dort, wo ein Land (oder Land-Gruppe) genau eine Familienkasse hat (Hessen; Niedersachsen und Bremen; Sachsen; Sachsen-Anhalt und Thüringen; Berlin und Brandenburg; Hamburg, Schleswig-Holstein und Mecklenburg-Vorpommern; Rheinland-Pfalz und Saarland); Postanschrift laut arbeitsagentur.de, abgerufen 19.11.2026. Bei Nord und Rheinland-Pfalz-Saarland nur indirekt belegt (alle Dienststellen mit gleichem Namen und gleicher Postanschrift). Nordrhein-Westfalen und Baden-Württemberg (mehrere Familienkassen, Kreiszuordnung nicht amtlich belegt) ohne Anschrift | ◐ | `fk-land` |
| Jobcenter außerhalb Bayerns: nur einzeln belegte Fälle (Stuttgart, Bonn, Wiesbaden) mit Anschrift aus Impressum/Kontaktseite, abgerufen 19.11.2026; alle übrigen ohne Anschrift (Impressen trennen Post- und Hausanschrift meist nicht, viele Seiten nicht abrufbar) | ◐ | `jobcenter-de` |
| Postanschriften außerhalb Bayerns | ○ (noch nicht hinterlegt; die Karte verweist auf die Website der Behörde) | |
| Einzelne Zuständigkeiten (z. B. Thüringen, Niedersachsen, Schleswig-Holstein beim Blindengeld) | ○ (nicht sicher bestätigt, daher die allgemeine Angabe; bitte von Fachleuten prüfen lassen) | |

## Leistungen, die die App (noch) nicht prüft

Damit niemand denkt, die App decke alles ab:

- Ermäßigung der Kita-Gebühren bei mittlerem Einkommen (Satzung der Gemeinde); beitragsfreie Kita bei Sozialleistungen ist eingebaut
- Anschriften der Ämter außerhalb Bayerns (Phase 3); genaue Beträge der Landesleistungen anderer Länder (Gehörlosengeld, Landesblindengeld, WBS-Grenzen), sobald verlässliche Quellen vorliegen
- Härtefallleistungen und einmalige Bedarfe im Einzelfall (z. B. Waschmaschine, Umzug, Mietschulden)
- Schuldnerberatung, Sozialtarife (Strom, Telefon, Kultur), Bildungskredit

## Ersparnisse und Kapitalerträge (alle Karten mit Vermögens- oder Einkommensprüfung)

| Regel | Status | Test |
|---|---|---|
| Geförderte Altersvorsorge (Riester, Rürup, Betriebsrente) zählt nicht als Vermögen (§ 12 Abs. 1 Satz 2 Nr. 3 SGB II, § 90 Abs. 2 Nr. 2 SGB XII, WoGVwV 21.37); BAföG: nicht sicher -> „möglich“, wenn sie über die Grenze bringt | ✓ | `verm-av` |
| Lebens- und Rentenversicherung: geschützt, wenn Altersvorsorge (Einzelfall) -> „möglich“, wenn sie über die Grenze bringt | ◐ | `verm-lv` |
| Zinsen, Dividenden, Ausschüttungen: Grundsicherungsgeld bis 100 € im Jahr frei (§ 1 Abs. 1 Nr. 3 GrusiGV), Rest Einkommen ohne Freibetrag für Arbeit; ebenso im SGB XII und beim Kinderzuschlag | ✓ | `kap-sgb2` |
| Wohngeld: Kapitalerträge gehören zum Jahreseinkommen, auch der steuerfreie Teil, soweit sie 100 € im Jahr übersteigen (§ 14 Abs. 2 Nr. 15 WoGG); vorsichtig ohne Pauschalabzug | ◐ | `kap-wg` |
| Einmalige Bedarfe als Hinweis: Erstausstattung Wohnung, Kleidung, Schwangerschaft/Geburt, therapeutische Geräte (§ 24 Abs. 3 SGB II, § 31 SGB XII), auch ohne laufende Leistung bei Schwangerschaft; Umzug nur mit Zusicherung (§ 22 Abs. 6 SGB II) | ◐ | `einmal` |
| ETF und Aktien zum Tageswert, Kursschwankungen | ○ (die Stelle nimmt den Wert am Tag des Antrags; die App nimmt den eingetragenen Wert) | |

## Netto aus Brutto (§ 39b EStG, Programmablaufplan 2026; SGB IV)

Wird nur das Brutto eingetragen, schätzt die App das Netto. Gilt für alle Karten, die mit dem Netto rechnen.

| Regel | Status | Test |
|---|---|---|
| Lohnsteuer, Solidaritätszuschlag und Kirchensteuer wie der amtliche Programmablaufplan 2026 (BMF 12.11.2025), Monatslohn, gesetzlich versichert | ✓ | `netto-pap` |
| Steuerklassen I bis VI (II mit Entlastungsbetrag, III Splitting, V/VI eigene Formel) | ✓ | `netto-stkl` |
| Arbeitnehmeranteile: RV 9,3 %, AV 1,3 %, KV 7,3 % + halber Zusatzbeitrag 2,9 %, PV 1,8 % (Sachsen 2,3 %), kinderlos +0,6, ab 2. Kind −0,25; Übergangsbereich bis 2.000 € (§ 20 Abs. 2a SGB IV); Minijob ohne Abzug | ✓ | `netto-sv` |
| Steuerklasse ohne Angabe: allein I, allein mit Kind II, Paar mit einem Einkommen III (vorsichtig, auch wenn nicht verheiratet), mit zwei Einkommen IV; ohne Kirchensteuer; Nutzer kann im Netto-Helfer wählen | ◐ | `netto-annahme` |
| Brutto aus Netto (Lohn), wenn nur die Auszahlung bekannt ist | ✓ | `netto-umkehr` |
| Krankenversicherung Arbeitnehmer: halber allgemeiner Beitragssatz 7,3 % (§ 241, § 249 SGB V) + halber Zusatzbeitrag; der ermäßigte Satz 7,0 % nur in der Vorsorgepauschale der Lohnsteuer | ✓ | `netto-kv` |
| Rente netto (gesetzlich pflichtversichert): KV allgemeiner Satz + Zusatzbeitrag (§ 247 SGB V), davon die Hälfte durch die Rentenversicherung (§ 249a SGB V) = 7,3 % + halber Zusatzbeitrag; Pflege 3,6 % allein (§ 59 Abs. 1 SGB XI; Satz seit Beitragssatz-Anpassung 1.1.2025, Gesetzestext § 55 Abs. 1 nennt noch 3,4 %), ab 2. Kind −0,25 bis 5. Kind (§ 55 Abs. 3 SGB XI, Kinder im Haushalt als Näherung), bis Beitragsgrenze KV; Netto ohne Kinderlosen-Zuschlag und ohne Steuer (vorsichtig); Brutto aus Rente netto ohne Kinder mit Zuschlag 0,6 (vorsichtig) | ◐ | `netto-rente` |
| Paar: eine Person mit Netto, die andere nur mit Brutto: fehlendes Netto je Person geschätzt (Lohn, Rente, Selbstständige 80 %); allein mit zweitem Einkommen ebenso | ✓ | `netto-person` |
| Arbeitende Altersrentner: Lohn ohne Renten- und Arbeitslosenversicherung, KV 7,0 % (ermäßigt) | ○ (selten in der Zielgruppe; Netto von der Lohnabrechnung geht vor; App rechnet mit vollen Beiträgen, also eher zu wenig Netto und eher zu viel Leistung) | |
| Pflegereform 2027: Kinderlosen-Zuschlag 0,9 % statt 0,6 % | ○ (bei Stand 20.11.2026 nur Entwurf, wird nicht angezeigt; nach Verkündung nachtragen) | |
| 2027: Programmablaufplan 2027 und Tarif 2027 bei Stand 19.11.2026 noch Entwurf; Steuer weiter nach 2026, Minijob 633 € eingerechnet, Beitragsgrenzen 2027 erst nach Verkündung (Schalter `svrg2027`); nach Veröffentlichung nachtragen | ○ (amtliche Werte 2027 stehen noch nicht fest; Unterschied für die Zielgruppe wenige Euro im Monat) | |
| Privat Krankenversicherte, Versorgungsbezüge, Einmalzahlungen, Freibeträge auf der Lohnsteuerkarte | ○ (für die Zielgruppe selten; das echte Netto von der Lohnabrechnung geht immer vor) | |

## Pfändung und P-Konto (§§ 850 ff., 899 ff. ZPO)

| Regel | Status | Test |
|---|---|---|
| Pfändbarer Betrag nach § 850c ZPO und Pfändungsfreigrenzenbekanntmachung 2026 vom 19.3.2026 (BGBl. 2026 I Nr. 80; nicht Nr. 160, das ist die Bekanntmachung 2024): Netto auf 10 € abgerundet, 70/50/40/30/20/10 % des Mehrbetrags, wie die amtliche Tabelle | ✓ | `pfaendung-tabelle` |
| Über der Höchstgrenze 4.866,30 € voll pfändbar | ✓ | `pfaendung-hoechst` |
| P-Konto: 1.590 € automatisch (§ 899 ZPO), Unterhalt und Kindergeld mit Bescheinigung (§§ 902, 903 ZPO) | ✓ | `pkonto` |
| Pfändung wegen Unterhalt (§ 850d ZPO): andere Freibeträge, Hinweis | ◐ | `pfaendung-tabelle` |
| Unpfändbare Bezüge (§ 850a ZPO), Kindergeld (§ 76 EStG), Erhöhung durch das Gericht (§§ 850f, 906 ZPO), Übertrag (§ 899 ZPO), Nachzahlungen (§ 904 ZPO): Hinweise | ◐ | `pkonto` |
| Wöchentliche oder tägliche Auszahlung, Kinderzuschlag auf dem P-Konto, Unterhaltsberechtigte mit eigenem Einkommen (§ 850c Abs. 6 ZPO) | ○ (Monatslohn ist der Regelfall; die übrigen Fälle entscheidet das Vollstreckungsgericht im Einzelfall) | |
| Startkachel „Geld und Schulden“ (Entscheidung David 20.11.2026, docs/entwuerfe/schulden-bereich.md) mit 6 Kacheln in der Form der Startseite, neue Reihenfolge nach dem Ablauf der Schuldnerberatung (Konzept geld-schulden-konzept.md, Entscheidung David 20.11.2026): Es ist dringend (Krisen-Check als erste Karte; Konto gepfändet, Strom-/Gassperre, Mahnbescheid, Wohnung gekündigt/Mietschulden, Geldstrafe – je Frist und erster Schritt, Einzelheiten zum Aufklappen; Konto mit Knopf zum Pfändungsrechner und zur P-Konto-Bescheinigung, Strom mit „Abschlag prüfen“, Mahnbescheid mit „In die Schulden-Liste eintragen“), Was bleibt mir? (Pfändungsrechner, Bescheinigung P-Konto), Meine Schulden-Liste, Post vom Inkasso (Prüfliste, Musterschreiben, Raten anbieten, Gelber Umschlag → Mahnbescheid), Mein Geld planen (Haushaltsplan, darunter Sparen im Alltag: Strom und Heizen je mit den Kacheln „Abschlag prüfen“ und „Tarife vergleichen“, Essen mit Link zur Verbraucherzentrale (Seite in einfacher Sprache), Verträge – ohne Sperre/Schulden), Schuldnerberatung (Beratungsstelle finden, Bis zum Termin, Beratungsmappe, Ablauf und Privatinsolvenz, unseriöse Anbieter); jeder Text nur an einer Stelle; „← Zurück“ oben führt eine Ebene hoch; Frist P-Konto: Umwandlung binnen eines Monats schützt gesperrtes Guthaben (§ 899 Abs. 1 ZPO), Bank ab dem 4. Geschäftstag (§ 850k ZPO); Tipps sinngemäß nach Verbraucherzentralen, BAG-SB (meine-schulden.de), Caritas/Diakonie, AG SBV (abgerufen 20.11.2026); Fristen: Widerspruch Mahnbescheid möglichst in 2 Wochen (§ 692 Abs. 1 Nr. 3 ZPO), später noch, solange kein Vollstreckungsbescheid verfügt ist (§ 694 Abs. 1 ZPO); Einspruch Vollstreckungsbescheid 2 Wochen, Notfrist (§§ 700, 339 ZPO); Vollstreckungsbescheid: Pfändung sofort möglich (§ 700 ZPO), Einspruch stoppt sie nicht von selbst (§ 719 Abs. 1 ZPO; Text in allen Sprachen angeglichen 20.11.2026); Schonfrist Räumungsklage 2 Monate, einmal in 2 Jahren (§ 569 Abs. 3 Nr. 2 BGB), gilt nicht für eine zusätzliche ordentliche Kündigung; Strom-/Gassperre erst ab 2 Abschlägen und 100 €, Androhung 4 Wochen, Ankündigung 8 Werktage (§ 41f EnWG), Grundversorgung: zinsfreie Raten (§ 41g EnWG, abgerufen 20.11.2026); Verjährung 3 Jahre ab Jahresende (§§ 195, 199 BGB), Neubeginn bei Anerkenntnis z. B. durch Ratenzahlung (§ 212 Abs. 1 Nr. 1 BGB), 30 Jahre nach Vollstreckungsbescheid oder Urteil (§ 197 Abs. 1 Nr. 3 BGB; abgerufen 20.11.2026), Restschuldbefreiung in der Regel nach 3 Jahren (§ 287 InsO), Geldstrafen bleiben (§ 302 InsO); Beratungsstellen nur als Art der Stelle | ✓ | `schulden`, `geld` |
| Pfändungsrechner: Knopf „Schuldnerberatung“ erst unter dem Ergebnis, nicht vor dem Rechnen; Zurück von dort führt zu den 6 Kacheln (kein Kreis); dritte Karte „Bescheinigung für das P-Konto“ (Musterschreiben nach § 903 Abs. 1 und 3 ZPO, abgerufen 20.11.2026) | ✓ | `geld`, `pfaendung` |
| Krisen-Check „Was ist zuerst dran?“: 7 Ja/Nein-Fragen, eine je Bildschirm, überspringbar; Ergebnis höchstens 3 „zuerst“ in fester Reihenfolge (Gerichtspost, Geldstrafe, Miete, Strom/Gas, Konto, Essen, Inkasso – Existenzsicherung zuerst nach AG SBV 2018, S. 11–12), Rest „danach“, ohne Ja die Schulden-Liste, immer „Beratungsstelle finden“ am Ende; nur Reihenfolge, keine Prüfung des Falls; Fall „Kein Geld für Essen“ nicht gebaut (keine geprüfte Quelle), stattdessen Leistungs-Check | ✓ | `kc`, `krisencheck` |
| Fall Geldstrafe: keine feste Frist, Ersatzfreiheitsstrafe 1 Tag für 2 Tagessätze (§ 43 StGB), Zahlungserleichterung bei der Staatsanwaltschaft als Vollstreckungsbehörde (§§ 451, 459a StPO), Abwendung durch freie Arbeit nach Landesrecht (Art. 293 EGStGB); Wortlaut abgerufen 20.11.2026 | ✓ | `geld`, `quellen` |
| Prüfliste „Stimmt der Brief?“: 6 Haken nach § 13a Abs. 1 RDG (Nr. 1 Auftraggeber, Nr. 2 Forderungsgrund, Nr. 3+4 Zinsen, Nr. 5+6 Inkassokosten, Nr. 8 Aufsichtsbehörde, Nr. 7 Herkunft der Anschrift; Wortlaut abgerufen 20.11.2026); Ergebnis nur „fehlt im Brief“ bzw. „alle Punkte stehen drin – sagt nichts über die Forderung“, Knopf zum Schreiben „Forderungsaufstellung“; Warnungen Schuldanerkenntnis (§ 13a Abs. 4 RDG), Kosten von Raten (§ 13a Abs. 3 RDG), gelber Umschlag 2 Wochen (§ 692 ZPO); nicht angehakte Punkte heißen „nicht angehakt“ (bedingte Punkte gelten nur, wenn sie zutreffen), darunter immer „Erste Einschätzung, keine Rechtsberatung“ (Prüfung 20.11.2026) | ✓ | `ip`, `inkasso` |
| Musterschreiben (immer Deutsch, als Vorlage): Bitte um Geduld, Forderungsaufstellung (§ 13a Abs. 1 und 2 RDG, für Rechtsanwälte § 43d BRAO; ohne Zahlungsverweigerung), Widerspruch (unbekannt/bezahlt, mit Warnung), P-Konto-Bescheinigung (§ 903 ZPO); Gläubiger, Anschrift, Aktenzeichen nur aus Eingabe oder Schulden-Liste, sonst Lücke [ … ]; Eingaben nur als Text; Pflicht-Hinweis „Allgemeines Muster, keine Rechtsberatung. Bei Post vom Gericht läuft eine Frist“; keine Wertung des Einzelfalls; Ausgabe nur Drucken/Teilen | ✓ | `ms`, `schreiben` |
| Raten anbieten: Ratenempfehlung als SoLo-Faustregel (keine Rechtsaussage): frei = Einnahmen − Ausgaben aus dem Haushaltsplan (nur gelesen), Puffer 10 % der Einnahmen (auf den Cent aufgerundet), mind. 50 €, Rate abgerundet auf volle 5 €, unter 5 € keine Rate (Verweis Schuldnerberatung); ohne ausgefüllten Plan nur Vermerk mit Knopf zum Plan; mehrere offene Schulden mit Betrag: Aufteilung nach Forderung, je Gläubiger auf ganze Euro abgerundet, Gläubiger des Schreibens hervorgehoben; „Übernehmen“ setzt die Rate ins Schreiben „Ratenzahlung anbieten“ (fragt nach Kosten, vgl. § 13a Abs. 3 RDG); Hinweis: Ratenangebot kann Anerkenntnis sein (§ 212 Abs. 1 Nr. 1 BGB); Schreiben mit Vorbehalt „ohne Anerkennung einer Rechtspflicht“, kein Anerkenntnis von Zinsen und Kosten | ✓ | `rate`, `rate-dom` |
| Ratenvorschlag (Prüfung Richtigkeit 21.11.2026): nur wenn Einnahmen, Miete und Essen im Plan stehen; Rate höchstens der pfändbare Betrag nach § 850c ZPO (Werte 2026, Einnahmen ohne Kindergeld, Unterhaltsberechtigte aus Pfändungsrechner oder Check); nichts pfändbar: kein Vorschlag, Hinweis Pfändungstabelle und Schuldnerberatung, Miete/Strom zuerst, Geldstrafe: Raten bei der Staatsanwaltschaft; „Übernehmen“ setzt nie 0 € ins Schreiben | ✓ | `rate-pf` |
| Aufteilung der Rate nach Vorrang wie die Schulden-Liste (Stufe 1 Miete, Strom, Unterhalt, Geldstrafe, Krankenversicherung; 2 Bußgeld, Amt; 3 Banken, Inkasso), innerhalb der Stufe anteilig, je Gläubiger höchstens die Forderung; Hinweis, vorrangige Raten direkt abzusprechen | ✓ | `rate-vor` |
| Antragsmappe: bei Entweder-oder (Grundsicherungsgeld oder Wohngeld/Kinderzuschlag; bei Rente Grundsicherung im Alter oder Wohngeld; § 7 Abs. 1 WoGG, § 6a BKGG, § 12a SGB II) Optionsfelder mit beschreibenden Namen und „Ich weiß es noch nicht“ statt leerer Haken; vorbelegt nach `out.wege` der Regeln (aVor → Wohngeld/Kinderzuschlag, bUeblich → Grundsicherung, knapp/unklar → „Ich weiß es noch nicht“ mit Lage-Satz und Notfall-Satz); Satz „Beträge der zwei Wege nicht zusammenzählen“; je nach Wahl passende Anträge, Formulare und Unterlagen (docs/entwuerfe/entweder-oder.md, 21.11.2026) | ✓ | `weg` |
| Antragsmappe: Vorauswahl – Geld-Leistungen mit Betrag (und wahrscheinliche Leistungen) vorab angehakt und zuerst; WBS, Rundfunk, Zuzahlungen zugeklappt unter „Weitere Hilfen“; kein Satz „siehe Tipp oben“ | ✓ | `vorauswahl` |
| Antragsmappe als Aufgabenliste (GOV.UK „Complete multiple tasks“, NHS task list): 1 Deine Angaben für die Briefe, 2 Anträge stellen, 3 Unterlagen sammeln, 4 Unterschreiben und abschicken; jede Zeile enthält ihren Inhalt (aufklappbar) mit Status, erster offener Schritt aufgeklappt, „Erledigt“-Haken; kein Inhaltsverzeichnis mit Sprungknöpfen | ✓ | `aufgaben` |
| Antragsmappe, Anträge: amtliche Formulare vor den Anschreiben, je Leistung genau eine Aktion („Amtliches Formular öffnen“ oder „Anschreiben ansehen“, Empfänger in der Zeile), Satz unter dem Formular-Knopf übersetzt (fw.*, deutscher Text gleich formulare.js) | ✓ | `antraege` |
| Antragsmappe, Unterlagen: eine Liste ohne Doppelungen („Für alle Anträge“/„Für mehrere Anträge“, dann „Zusätzlich für …“); gleiche Sachen zusammengefasst, ausführlichster vorhandener Text; Haken je Sache, alte Haken je Leistung zählen weiter | ✓ | `unterlagen`, `altstaende-mappe` |
| Antragsmappe: Ausgabe nur einmal im letzten Schritt, ein Name „Drucken oder teilen“ (wie in der Ergebnisliste); Druck/PDF vollständig: Briefe (förmlich, DIN 5008), Angabenblatt, Unterlagen- und Formularliste mit Adressen, „Keine Rechtsberatung“ | ✓ | `drucken` |
| Absender einmal eintragen, überall nutzen: person in lotse.state (Vorgaenge.DATEN, je Vorgang, mit PIN verschlüsselt, „Alles löschen“/Wechsel leert auch die Felder der Schreiben); Antragsmappe, Widerspruch/Antworten an Jobcenter, Sozialamt, Wohngeldstelle, Familienkasse, Pflegekasse, Vermieter, Kostensenkung, Musterschreiben Geld und Schulden (inkl. Ratenangebot), Änderungsmitteilung Haushaltsplan; Änderung an einer Stelle gilt für alle; ohne Angaben Lücken zum Ausfüllen von Hand; PLZ und Ort aus dem Fragebogen vorbelegt | ✓ | `absender` |
| Kachel „Schuldnerberatung“: Beratungsstelle finden (ein Text statt vier), Bis zum Termin (6 Haken, Sprünge zu Geduld-Brief, P-Konto, Schulden-Liste, Haushaltsplan; Liste und Plan haken sich selbst), Beratungsmappe (8 Unterlagen, Ordner-Anleitung nach VZ NRW, ein Druck: Blatt der Schulden-Liste mit Haushaltsplan und Unterlagenliste); Haken je Vorgang in `lotse.beratung-haken` (PIN, Kopie, Löschen) | ✓ | `beratung-kachel`, `haken` |
| Schulden-Liste: Kopfkarte „Was ist zuerst wichtig?“ immer oben (auch leer); je Eintrag „Stimmt der Brief?“ (nur Stand Inkasso/Mahnung) und „Schreiben“ (Gläubiger, Anschrift, Aktenzeichen vorbelegt); statt Aufklapper „Beratungsstelle finden“/„Bitte mitbringen“ ein Sprung zur Kachel „Schuldnerberatung“. Haushaltsplan: bei knappem Plan oder Fehlbetrag Karte „Leistungs-Check“ direkt unter dem Ergebnis; Hinweis „Raten“ führt zur Schulden-Liste | ✓ | `geld`, `schuldenliste` |
| Beratungsmodus im Schuldenbereich = dichtere Sicht auf dieselben Daten (B1–B6, nur Deutsch): Klient-Zeile mit Wechsel, Krisen-Check als eine Checkliste mit Normen und Gesprächsnotiz, Prüfliste mit Fundstellen und Prüfhinweisen (§ 13a Abs. 3–4, § 13e RDG), Absender-Zusatz im Schreiben, Pfändung auf einer Seite mit Rechenweg (Werte aus Rules), Schulden-Liste als Tabelle mit Sortierung und allen Feldern offen, Notizen im Druck und in der CSV vorbelegt, Handzettel für Klienten in der App-Sprache. Privatmodus: kein einziges zusätzliches Element, nach dem Ausschalten jede Seite wie vorher; amtliches Gläubigerverzeichnis bewusst nicht gebaut | ✓ ○ (Gläubigerverzeichnis nach VbrInsFV erst nach Fachprüfung, Entscheidung David 20.11.2026) | `ber-geld` |
| Schulden-Korrekturen: Strom/Gas-Sperre nach §§ 41f, 41g EnWG statt StromGVV, Vollstreckungsbescheid erlaubt Pfändung (§ 700 ZPO), Schonfrist nicht für ordentliche Kündigung | ✓ | `schulden-korr` |
| „Es ist dringend“ aufgeräumt (21.11.2026): alle Fallseiten gleich – Frist (.frist), „Das tust du jetzt“ (Schritte), Tipps, Knöpfe (Beratungsstelle zuletzt), Quellen; Konto: Bescheinigung (§ 903 ZPO) und Grundfreibetrag aus Rules; Strom/Gas: 3 Schritte + Tipp „Sperre erst ab 2 Abschlägen und 100 €“ (§ 41f EnWG); „Stimmt der Brief?“: Hinweis „keine Rechtsberatung“ unter dem letzten Tipp | ✓ | `aufraeumen` |
| Geld und Schulden ohne Dopplungen (21.11.2026): Schuldnerberatung ohne Kachel „unseriöse Anbieter“ (Tipp steht in „Beratungsstelle finden“); „Gelber Umschlag vom Gericht?“ öffnet direkt die Seite Mahnbescheid, Zurück zu „Post vom Inkasso“; „Schreiben an Gläubiger“ ohne P-Konto-Bescheinigung (bleibt unter „Was bleibt mir?“); „Die Anschrift fehlt noch“ erst beim Drucken/Teilen; Konto gepfändet: „Jeder darf nur ein P-Konto haben“ (§ 850k Abs. 3 ZPO, abgerufen 21.11.2026) | ✓ | `aufr-geld` |
| Hilfen-Check aufgeräumt (21.11.2026): grüner Knopf „Briefe für die Anträge machen“ direkt unter den passenden Karten, kein Kasten „Ausfüllhilfe“ mehr; Name, Anschrift und Auswahl der Leistungen oben in der Antragsmappe (wie bisher nur auf dem Gerät gespeichert); „Zwei Wege“, „Entweder oder“, „Gut zu wissen für alle Anträge“ und „Unsicher? Beratungsstelle“ als kurze Tipps (Symbol + Satz, Inhalt unverändert zugeklappt); „Erste Einschätzung, keine Rechtsberatung“ bleibt klein unten; ohne Angaben kein Kasten „So geht's“; Startseite: Datenschutz-Satz als kleine Zeile ohne Kasten; „Kurzer Check für Menschen mit Behinderung“ als dritte Wahl oben (Logik unverändert) | ✓ | `hilfen-aufraeumen` |

Die Tabelle gilt bis 30.6.2027, danach zeigt die App einen Warnhinweis. Jedes Jahr zum 1. Juli neue Werte eintragen.

### Schulden-Liste (src/schulden.js)

Geld und Schulden → „Meine Schulden-Liste“. Grundlage: docs/entwuerfe/schuldenliste.md mit Prüfvermerk und Entscheidung vom 20.11.2026; alle Paragraphen abgerufen 20.11.2026 auf gesetze-im-internet.de.

| Regel | Status | Test |
|---|---|---|
| Stufen: 1 Miete (§§ 543, 569 BGB), Energie (§§ 41f, 41g EnWG), Unterhalt (§ 170 StGB, § 850d ZPO), Geldstrafe (§ 43 StGB, §§ 459a, 459e StPO), Krankenversicherung (§ 16 Abs. 3a SGB V, § 193 VVG; wie `sp.schulden.2`); 2 Bußgeld (§ 96 OWiG), Rückforderung vom Amt (§ 43 SGB II, § 84 SGG); 3 Bank, Inkasso, Handy, Versand, Sonstiges (BAG-SB „Vorbereitung Erstgespräch“, Aktualisierung 09.07.2026); Mahn- und Vollstreckungsbescheid immer „Frist läuft“, Drohung und Pfändung „dringend“ | ✓ | `schuldenliste` |
| Summen in Cent, „Jetzt“ vor „Anfang“, erledigte zählen nicht; Kontrolle: Stufen und Arten ergeben lückenlos die Gesamtsumme (5000 Zufallslisten, Mutationstest); Vergleich mit dem Haushaltsplan ohne Doppelzählung (frei vor Raten = Rest + Plan-Raten) | ✓ | `schuldenliste` |
| Fristende: Zustellung + 14 Tage, Wochenende und 9 bundesweite Feiertage → nächster Werktag (§ 222 Abs. 2 ZPO), als „ungefähr“ gekennzeichnet (Landesfeiertage fehlen); Rechenkern austauschbar (`Schulden.fristRechner`); abgelaufene Frist eigener Text; `Schulden.fristen()` liefert `mb`/`vb` ohne Gläubigernamen für den Dublettenschutz | ✓ | `schuldenliste` |
| Speicherung nur über `lotse.schulden` in `Vorgaenge.DATEN` (je Vorgang, mit PIN verschlüsselt, „Alle Angaben löschen“); Ausgabe nur als Text; „Mein Ordner“ nur Anzahl, keine Summe; Blatt für die Beratung deutsch, ohne Namen, Aktenzeichen/Anschriften/Notizen per Haken; CSV wie das Haushaltsbuch mit Schutz gegen Formeln | ✓ | `schuldenliste` |
| 13 Sprachen und Einfache Sprache: alle Schlüssel, gleiche Platzhalter, Zahlen und Paragraphen | ✓ | `schuldenliste` |


## Haushaltsplan und Haushaltsbuch (src/haushalt.js)

| Regel | Status | Test |
|---|---|---|
| Plan: Einnahmen minus feste Ausgaben in Cent, Ergebnis auf ganze Euro („etwa“); Monatswechsel, wiederkehrende Ausgaben (31. → Monatsletzter), Vormonat | ✓ | `hb-plan` |
| Kassenzettel: Gesamtsumme (ZU ZAHLEN, SUMME, GESAMT, EUR), Datum (nicht Zukunft, höchstens 3 Jahre alt), Geschäft und Kategorie; nur Vorschlag, nie ungefragt gespeichert; Foto nicht gespeichert | ✓ | `hb-kassenzettel` |
| Eine Datenquelle mit dem Leistungs-Check (Netto, Miete warm, Unterhalt für die Kinder, Kinderzahl → Kindergeld); vorhandene Werte nur nach Rückfrage; Brutto, Art (Lohn/Rente), Heizung, Kindergeld-Bezug nie still übernommen | ✓ | `hb-uebernahme` |
| Hinweise (seit 1.9 nur in der Auswertung, nicht mehr unter der Eingabe; „Bewilligt bis“ entfernt) nur bei Auslöser, höchstens 2 sichtbar, „Nicht mehr zeigen“: Einkommensänderung (§ 60 SGB I), Nebenkosten-Nachzahlung (§ 22 Abs. 1 SGB II, § 35 SGB XII), Darlehen (§ 24 Abs. 1, § 42a SGB II, § 37 Abs. 1 SGB XII), Bildung und Teilhabe (§ 28 SGB II, § 34 SGB XII, § 6b BKGG), Rundfunkbeitrag (§ 4 Abs. 1 RBStV) | ✓ | `hb-hinweise` |
| Regelbedarf zur Orientierung: Anteile nach § 5 RBEG (434,96 €), Stufe 1 aus den Werten der App | ✓ | `hb-regelbedarf` |
| Korrekturen: Meldepflicht je Leistung (Grundsicherungsgeld/Sozialhilfe sofort nach § 60 Abs. 1 SGB I, Wohngeld bei dauerhaft mehr als 15 % nach § 27 Abs. 3 WoGG, Kinderzuschlag meist erst beim nächsten Antrag; abgerufen 20.11.2026), Vorlage „Änderung melden“ nur bei Grundsicherungsgeld oder Sozialhilfe; Nachzahlung: Antrag im Monat der Fälligkeit; ganzes Haushaltsbuch löschen mit Rückgängig; je Vorgang gespeichert und mit PIN verschlüsselt | ✓ | `hb-korr` |
| Abschlag prüfen (seit 1.9 auf den Seiten „Strom“ und „Heizen“, erst Kacheln Strom/Gas, „Zurück“ je eine Ebene; ohne Brief, Plan-Hinweis, Destatis-Vergleich, Warmwasser und Zusatztipps): Jahresverbrauch aus zwei Zählerständen (× 365, mind. 14 Tage, unter 60 Tagen „ungenau“, bei Gas und Heizen mit Strom unter 330 Tagen „ungenau“ mit Jahreszeit-Hinweis, über 2 Jahre Hinweis) oder von der Rechnung; Gas in m³ nur mit Faktor von der Rechnung; Kosten mit eigenem Preis oder Destatis-Durchschnitt 37,97 / 11,58 ct/kWh (PM Nr. 345 vom 30.09.2026, 1. Hj. 2026); 11 oder 12 Abschläge; „passt ungefähr“ bis 30 € bzw. 5 % (Faustregel, keine Gesetzesgrenze); Ergebnis immer „möglich“; Arbeitspreis und Gas-Faktor mit bis zu 4 Nachkommastellen; Ablesung älter als 31 Tage: „Bitte lies den Zähler neu ab“. Tarife vergleichen (offline, nichts gespeichert): Jahreskosten = kWh × ct + 12 × Grundpreis, Cent-genau gerundet; Bonus nur im 1. Jahr (Verbraucherzentrale, Bonus-Tarife, Stand 05.08.2026); Hinweise Bonus, keine Vorkasse/Pakettarife (VZ RLP 03/2020, VZ Hamburg 04.09.2025), Laufzeit/Preisgarantie (VZ 29.07.2026), Kündigungsfrist (Grundversorgung 2 Wochen, VZ 28.10.2026/11.11.2026), Fernwärme kein Wechsel (VZ 09.07.2025); Link nur zur Verbraucherzentrale (einfache Sprache), keine Portale | ◐ | `en-check`, `tv` |
| Energie-Texte (abgerufen 20.11.2026): Haushaltsstrom aus dem Regelbedarf, Darlehen nach § 24 Abs. 1 SGB II (ältere Schulden § 22 Abs. 8), Sozialhilfe § 37 Abs. 1, § 36 SGB XII, gesondert zu beantragen; Heizkosten-Nachzahlung im Fälligkeitsmonat (§ 22 Abs. 1 SGB II, § 35 Abs. 1 und 5 SGB XII), Antrag im Fälligkeitsmonat (§ 37 Abs. 2 SGB II); Abwendungsvereinbarung nur Grundversorgung nach Androhung, 6–18 bzw. bei über 300 € 12–24 Monate (§ 41g Abs. 1 EnWG); Korrektur `sp.vertraege.4`: § 41g EnWG statt § 19 StromGVV/GasGVV, Darlehen § 24 Abs. 1 bzw. § 22 Abs. 8 SGB II; Türkisch „kesintisi tehlikesi mi var?“ | ✓ | `en-korr` |
| Spartipps mit Fundstelle (Text „Quelle: …“ unter jedem Tipp): Miete – Verbraucherzentrale, Deutscher Mieterbund, Wohngeldgesetz; Strom und Gas – Stromspiegel für Deutschland, Verbraucherzentrale (Energieberatung); Handy und Internet – Verbraucherzentrale, § 56 Abs. 3 TKG (Kündigung nach der Erstlaufzeit mit 1 Monat Frist, abgerufen 20.11.2026); Versicherungen, Mobilität, Sonstiges – Verbraucherzentrale; Lebensmittel – Verbraucherzentrale, Bundeszentrum für Ernährung; Kinder – § 28 SGB II, § 34 SGB XII, § 6b BKGG (Bildung und Teilhabe), Familienkasse; Raten – BAG-SB (meine-schulden.de). Abrufdatum der allgemeinen Ratgeberseiten vor der Veröffentlichung nachtragen | ◐ | `hb-tipps` |
| Geld-Hinweise im Haushaltsbuch: höchstens einer gleichzeitig **innerhalb der Geld-Gruppe** (Mehrbedarf, Erspartes, Pflege-Belege, Steuer-Belege); die übrigen Hinweise (z. B. Nebenkosten, Tarife) zählen nicht mit und können daneben stehen; wegklickbar, Details zum Aufklappen | ✓ | `hb-geld`, `hb-einfach`, `hb-amtsbegriffe`, `hb-en` |
| Mehrbedarf nur mit Grundsicherungsgeld/Sozialhilfe (Bezug oder Check ja/vielleicht) und passender Notiz bzw. Angabe: Schwangerschaft ab 13. Woche nur bei Bezug, nicht bei Check „vielleicht“ (§ 21 Abs. 2 SGB II, § 30 Abs. 2 SGB XII), Warmwasser dezentral nur „möglich“ (§ 21 Abs. 7 SGB II, § 30 Abs. 7 SGB XII), Ernährung ohne Betrag (§ 21 Abs. 5 SGB II, § 30 Abs. 5 SGB XII), Alleinerziehende (§ 21 Abs. 3 SGB II, Widerspruch § 84 SGG), Behinderung nur bei GdB ab 50 oder Merkzeichen H/Bl/TBl (§ 21 Abs. 4 SGB II, § 30 Abs. 1 SGB XII), laufender Sonderbedarf (§ 21 Abs. 6 SGB II, § 27a Abs. 4 SGB XII); nicht, wenn im Check schon angehakt; abgerufen 20.11.2026 | ✓ | `hb-mehrbedarf`, `hb-worte` |
| Erspartes nah an der Vermögensgrenze (App-Regel: ab 80 % oder in 6 Monaten, kein Gesetz): Grenzen aus denselben Formeln wie die Karten; Grundsicherungsgeld immer mit Vorbehalt „möglicherweise … etwa“ (Altfälle § 65a SGB II), bei Paaren oder unbekanntem Alter ohne Zahl in der Überschrift (kleinste mögliche Grenze als Auslöser); Wohngeld als „Richtwert“, nicht „Grenze“ (Nr. 21.37 WoGVwV); Kinderzuschlag: nur erster Monat gekürzt, wenn der Betrag darüber kleiner als der monatliche Kinderzuschlag ist (§ 12 Abs. 2, § 65a SGB II; § 90 Abs. 2 Nr. 9 SGB XII mit VO; § 21 Nr. 3 WoGG mit WoGVwV 21.37 als Richtwert; § 6a Abs. 3 BKGG); Warnung vor gezieltem Ausgeben (§ 34 SGB II, § 26 SGB XII); abgerufen 20.11.2026 | ✓ | `hb-verm`, `hb-verm-text`, `hb-verm-ggeld`, `hb-verm-paar`, `hb-verm-wohngeld`, `hb-verm-kiz` |
| Beleg-Häkchen je Buchung (Steuer/Pflegekasse), Belegliste je Kalenderjahr (nur bis heute, wiederkehrende Buchungen ohne künftige Monate, kein Jahr nach dem laufenden) mit Druck und CSV (Formel-Schutz), Pflege-Hinweis: Belege des laufenden Kalenderjahres, bis 30.6. auch des Vorjahres, Pflege-Belege: Entlastungsbetrag 131 € (§ 45b SGB XI, Reste bis 30.6. des Folgejahres), Verbrauchs-Pflegehilfsmittel 42 € (§ 40 Abs. 2 SGB XI), gemeinsamer Jahresbetrag (§ 42a SGB XI); abgerufen 20.11.2026 | ✓ | `hb-belege`, `hb-belege-heute`, `hb-pflege-fenster`, `hb-bereinigen` |
| Nur geltendes Recht: kein Hinweis auf Gesetzentwürfe (Pflegeneuordnungsgesetz, BT-Drs. 21/8869), auch nicht als „Entwurf“; Pflege-Hinweis vor und ab 1.1.2027 gleich (Regel des Nutzers, 20.11.2026) | ✓ | `hb-pflege-recht`, `hb-entwurf` |
| Steuer-Hinweis (§ 35a EStG 20 %, höchstens 4.000 € / 1.200 €, nur unbar; § 33, § 33b, § 9a EStG; abgerufen 20.11.2026), nicht bei Grundsicherungsgeld/Sozialhilfe ohne Lohn oder Selbstständigkeit; nicht für schon als Beleg (Steuer oder Pflegekasse) markierte Buchungen; Bar-Warnung nur bei Handwerker/Haushaltshilfe | ✓ | `hb-steuer`, `hb-bar` |

## Ich ziehe aus (src/ausziehen.js)

Eigener Bereich für junge Menschen; keine Rechnung, nur Hinweise. Quellen mit Abrufdatum 20.11.2026 in `Ausziehen.Q`.

| Regel | Status | Test |
|---|---|---|
| Übersicht mit 6 Kacheln (2 Spalten, jede Kachel eine eigene Palettenfarbe, keine Hex-Werte im Modul), Unterseiten mit „Zurück“ (Herkunft gemerkt), Checklisten mit Fortschritt, wichtige Punkte offen, weitere zum Aufklappen | ✓ | `az-aufbau`, `az-oberflaeche` |
| Unter 25 mit Grundsicherungsgeld: Zusicherung vor Vertragsschluss, Pflicht-Gründe, keine Erstausstattung ohne Zusicherung, weniger Regelbedarf (§ 22 Abs. 5, § 24 Abs. 6, § 20 Abs. 3 SGB II), Verzicht bei wichtigem Grund, deutliche Warnung | ✓ | `az-aufbau`, `az-oberflaeche` |
| Kaution höchstens 3 Kaltmieten ohne Betriebskosten, 3 Monatsraten (§ 551 BGB); Kaution als Darlehen, Umzugskosten mit Zusicherung (§ 22 Abs. 6 SGB II); Erstausstattung vor dem Kauf beantragen (§ 24 Abs. 3, § 37 SGB II) | ✓ | `az-quellen` |
| Ummelden in 2 Wochen, Wohnungsgeberbestätigung (§ 17 Abs. 1, § 19 BMG); Grundversorgung melden (§ 2 StromGVV); Rundfunk je Wohnung, Befreiung nur auf Antrag und nur für die Person (§ 2, § 4 Abs. 1 RBeitrStV); Laufzeit 24 Monate, danach jederzeit kündbar (§ 56 TKG); Kfz-Anschrift unverzüglich (§ 15 FZV); Steuer-ID an Arbeitgeber (§ 39e Abs. 4 EStG) | ✓ | `az-quellen` |
| Basiskonto, 10 Geschäftstage (§ 31 ZKG); P-Konto (§ 850k ZPO); Lastschrift 8 Wochen (§ 675x BGB); Nebenkostenabrechnung 12 Monate, danach keine Nachforderung, 12 Monate für Einwände (§ 556 Abs. 3 BGB); Aufbewahren nach Verbraucherzentrale (Stand 23.10.2025) | ✓ | `az-quellen` |
| Kostenfallen: Widerruf 14 Tage (§ 312g, § 355 BGB), Bestellknopf (§ 312j BGB), Dispo-Beratung 6 Monate/75 % (§ 504a BGB), Widerspruch 1 Monat (§ 84 SGG), Datenkopie kostenlos (Art. 15 Abs. 3 DSGVO); „Später zahlen“ und Kredite „ohne Schufa“ nach Verbraucherzentrale | ✓ | `az-quellen` |
| Versicherungen gestuft nach Verbraucherzentrale (Stand 21.11.2025, VZ Hamburg 15.04.2026), Kfz-Haftpflicht unter „Unbedingt“, Auslandsreise-Krankenversicherung unter „Kommt drauf an“; Familienversicherung bis 18/23/25, Ausnahme privat versicherter Elternteil, Grenze 1/7 Bezugsgröße aus `R.famvers` (§ 10 Abs. 2 und 3 SGB V); Gesundheitsfragen (§ 19 VVG); keine Anbieter, keine Preise | ✓ | `az-quellen`, `az-oberflaeche` |
| Hilfen nur „möglich“: BAB (§ 56, § 60 SGB III), BAföG (§ 2), Wohngeld-Ausschluss (§ 20 Abs. 2 WoGG), Kindergeld bis 18/21/25 und Abzweigung (§ 32 Abs. 4, § 74 EStG), Kindergeld für sich selbst (§ 1 Abs. 2 BKGG), Unterhalt der Eltern bis Ende der ersten Ausbildung (§ 1610 Abs. 2 BGB, Beratung § 18 Abs. 4 SGB VIII), Grundsicherungsgeld (§ 7 Abs. 5, § 22, § 24, § 27 SGB II), Bildung und Teilhabe (§ 28 SGB II), Waisenrente bis 18 immer, in Ausbildung oder Freiwilligendienst bis 27 (§ 48 Abs. 4 SGB VI) | ✓ | `az-aufbau`, `az-oberflaeche` |
| Abhaken und Notizen lokal (`lotse.ausziehen`, Schnittstelle `Ausziehen.speicherOrt`), nur bekannte Einträge, Speicherfehler gemeldet, „Alle Angaben löschen“ leert alles | ✓ | `az-speichern`, `az-oberflaeche` |
| 13 Sprachen und Einfache Sprache: alle Schlüssel, gleiche Platzhalter und Vorschriften, keine Rohschlüssel | ✓ | `az-sprachen`, `az-oberflaeche` |

## Fristen in „Mein Ordner“ (src/fristen.js)

Liste je Vorgang (`lotse.fristliste` in `Vorgaenge.DATEN`), kein eigener Bereich, kein Kalender, keine Mitteilung des Systems. Quellen abgerufen am 20.11.2026.

| Regel | Status | Test |
|---|---|---|
| Widerspruch: Bescheid gilt am 4. Tag nach Aufgabe zur Post als bekannt gegeben, nicht auf Werktag verschoben (§ 37 Abs. 2 SGB X seit 1.1.2025; BSG 6.5.2010, B 14 AS 12/09 R); 1 Monat (§ 84 Abs. 1 SGG), Ende nach § 64 SGG, Sa/So/Feiertag → nächster Werktag | ✓ | `fristen` |
| Rechtsweg je Stelle, gleicher Tag, anderes Wort: Wohngeld Verwaltungsrechtsweg (SGB X gilt, § 68 Nr. 10 SGB I; Widerspruch § 70 VwGO, wo je Land abgeschafft Klage, § 68 Abs. 1 Satz 2, § 74 Abs. 1 Satz 2 VwGO; Ende § 57 VwGO, § 222 ZPO): Titel „Widerspruch oder Klage“ mit Hinweis auf die Rechtsbehelfsbelehrung; Kindergeld Einspruch (§ 355 Abs. 1 AO, 4. Tag § 122 Abs. 2 Nr. 1 AO, Ende § 108 AO): Frist aus „Brief prüfen“ ohne Stelle heißt „Widerspruch, Einspruch oder Klage“; Kinderzuschlag Widerspruch (§ 15 BKGG, § 84 SGG); gesetze-im-internet.de, abgerufen 20.11.2026 | ✓ | `fristen`, `fristen-dom` |
| Anhörung und Mitwirkung ohne 4-Tage-Regel: ab Tag des Erhalts, sonst ab Briefdatum („Ungefähr“, nie zu spät); „ab Datum dieses Schreibens“ immer ab Briefdatum, ohne Feld „bekommen am“ (§ 26 SGB X, §§ 187, 188 BGB); Mahnbescheid/Vollstreckungsbescheid 2 Wochen ab Zustellung (§ 692, § 700, § 339, § 222 ZPO); Daten aus dem Brief nie verschoben (§ 26 Abs. 5 SGB X) | ✓ | `fristen` |
| Nur die 9 bundesweiten Feiertage, Hinweis auf Landesfeiertage; nie ein zu später Tag | ✓ | `fristen`, `fristen-dom` |
| Folgeantrag aus dem Haushaltsplan (Vorlauf 42/60 Tage, App-Regel), nur ein Hinweis auf der Startseite | ✓ | `fristen`, `fristen-dom` |
| Aus „Brief prüfen“ nur per Knopf „Frist merken“, nie automatisch; Frist nur aus Zeilen mit Frist-Wort (äußern, Unterlagen, Frist …), bei mehreren das früheste, Zeile und Tag vor dem Speichern sichtbar, Tag änderbar; kein Brieftext gespeichert; „Rückgängig“ nach Vorgangswechsel ungültig; „Gemerkt“ nur, wenn das Speichern geklappt hat; Dublettenschutz; Schnittstelle `FristenOrdner.hinzu({art, datum, titel, stelle, quelle, notiz})` | ✓ | `fristen-dom` |
| Hinweis beim Öffnen höchstens 1× am Tag (Merker `lotse.fristTag` nur JJJJ-MM-TT, bei jeder Tagesprüfung gesetzt), Erledigt/Später/Ansehen, andere Vorgänge nur Ansehen, Schalter, mit PIN erst nach dem Entsperren und kein Klartext | ✓ | `fristen-dom` |
| Eigene Titel und Notizen nur als Text (kein HTML), Laden mit Prüfung (feste Listen, höchstens 50: zuerst erledigte kürzen, bei 50 offenen „Liste voll“; erledigte nach 30 Tagen weg); Datenschutzerklärung und Löschtext nennen die Fristen | ✓ | `fristen`, `fristen-dom` |
| Sicherheit 1.9 (21.11.2026): Wechsel des Vorgangs leert Scan-Ergebnis, Vorschaubilder, eingefügten Brief- und Formulartext, Ergebnis und Felder von „Brief prüfen“, offene Kachel und Blatt für Klienten (S4); Bildschirmfoto-Schutz mit App-PIN (Android FLAG_SECURE, iOS Abdeckung im App-Wechsler), Schalter „Bildschirmfotos erlauben“ (S2); iOS-Angaben ohne iCloud-/Finder-Sicherung (SoloSpeicherPlugin.swift, Übernahme aus Preferences, Gerätetest offen) (S1); Datenschutzerklärung: Einlesen, Zwischenablage, Vorgang-PIN, Weitergabe mit Messenger-Hinweis, Bildschirmfoto-Schutz, ML-Kit-Diagnosedaten laut Google (Gerätetest offen) (S12/S3). Unabhängige Prüfung 21.11.2026: Wechsel leert zusätzlich Name und Anschrift in den Schreiben der Prüfungen, selbst geänderte Empfänger und Texte der Antragsmappe, Ergebnisblatt mit Kürzel, gezeichnete Pflegegrad-Einschätzung, Vermögens-Helfer, Vorschau „Von der Beratung bekommen“; iOS-Speicher schreibt nie über eine nicht lesbare Datei (beschädigte Datei wird aufgehoben); Datenschutzerklärung: iOS-Ausschluss von der Sicherung ist nur ein Hinweis an iOS (Apple, „Optimizing Your App’s Data for iCloud Backup“, abgerufen 21.11.2026), Suchlink mit Ort, Dateien bleiben nach dem Deinstallieren, PDF-Lesen im Web; iOS kompiliert (Workflow `ios-build-check.yml`, Simulator, ohne Signatur). Zweite unabhängige Prüfung 21.11.2026 (nach Zusammenführen mit Weitergabe und Vorgang-PIN): Wechsel schließt auch Vorschau und PIN-Abfrage von „Von der Beratung bekommen“ und verwirft ein noch laufendes Entschlüsseln, schließt die PIN-Abfrage eines Vorgangs; iOS-Speicher weicht mit vorhandener Datei nie auf UserDefaults aus, bei der Übernahme gewinnt die Datei; Datenschutzerklärung: ältere iOS-Sicherungen können die Angaben noch enthalten | ✓ | `wechsel`, `wechsel2`, `wechsel3`, `schutz`, `anbieter` |
## Aufforderung zur Senkung der Unterkunftskosten (erweiterungen/kostensenkung.js)

Brief prüfen → Jobcenter, Sozialamt oder „Anderer Brief oder Formular“ (Brief mit Frist oder Mahnung); keine Rechnung, nur Erklärung. Quellen mit Abrufdatum 20.11.2026 in `docs/entwuerfe/kostensenkung.md`. Erkennung zusätzlich in `test/erweiterungen/test-kostensenkung.js`.

| Regel | Status | Test |
|---|---|---|
| In der Regel noch keine Kürzung, Weiterzahlung in der Regel höchstens 6 Monate (§ 22 Abs. 1 Satz 9–10 SGB II, § 35 Abs. 3 SGB XII); Heizkosten ohne Karenzzeit | ✓ | `ks` |
| Grenze vom 1,5-Fachen ab dem ersten Tag seit 1.7.2026, ohne 6 Monate; Ausnahmen im ersten Jahr im Einzelfall, z. B. mit Kindern (§ 22 Abs. 1 Satz 6–7 SGB II, § 35 Abs. 1 SGB XII); Hinweis sichtbar, wenn Miete > 1,5 × Grenze oder der Brief es nennt, nie bei Heizkosten | ✓ | `ks` |
| Kein Widerspruch gegen den Hinweis (BSG B 14 AS 31/20 R); steht eine Rechtsbehelfsbelehrung im Brief: „Widerspruch möglich, Frist in der Regel ein Monat“ (§ 84 Abs. 1 SGG) | ✓ | `ks` |
| Antwort-Entwurf nur mit angehakten Gründen, Paragraf passend zum Träger (§ 22 Abs. 1 Satz 11/12 SGB II bzw. § 35 Abs. 3 Satz 4/3 SGB XII, unbekannt: beide); Empfänger nur Stelle aus dem Brief oder Art der Stelle; Haken werden nicht gespeichert | ✓ | `ks` |
| Frist nur aus dem Brief, mit Belegzeile; keine selbst berechnete Frist; Knopf „Frist übernehmen“ nur mit `FristenOrdner.hinzu` | ✓ | `ks` |
| U25: ohne vorherige Zusicherung nach Umzug möglicherweise keine Unterkunftskosten (§ 22 Abs. 5 SGB II), auch in Einfacher Sprache | ✓ | `ks` |
| 13 Sprachen und Einfache Sprache: keine Rohschlüssel, Zahlen und Paragrafen gleich | ✓ | `ks` |

## Anzeige und Eingaben (alle Karten)

| Regel | Status | Test |
|---|---|---|
| Jede Karte zeigt Einstufung, Überschrift, Text und jeden Betrag genau wie berechnet, in allen 13 Sprachen; Zählung und Hinweise passen; Speichern und Laden ändert nichts; nirgends NaN, undefined, Platzhalter, negative Beträge oder Rohschlüssel | ✓ | `anzeige-rechnung` |
| Einfache und ausführliche Version rechnen für dieselbe Person gleich | ✓ | `einfach-gleich` |
| Leistungs-Check „Schritt für Schritt“: jede Formular-Angabe hat eine Frage, nur nötige Folgefragen, „← Zurück“ eine Frage zurück, Übersicht mit „ändern“, gleiches Ergebnis wie „Alles auf einer Seite“ | ✓ | `schritte` |
| Einfache Sprache vollständig: jeder deutsche Text hat eine einfache Fassung (oder „=“, wenn der Standardtext schon einfach ist), ohne neue Zahlen oder Platzhalter | ✓ | `einfach-vollstaendig` |
| „Brief prüfen“ in Einfacher Sprache: jeder sichtbare feste Text (vorschau.html, vorschau.js, brief-lesen.js) hat eine einfache Fassung; Zahlen, Fristen und Paragrafen bleiben; Schreiben an Ämter bleiben förmlich; Schalter aus stellt den Standardtext her | ✓ | `brief-einfach` |
| Brief-Stellen aufgeräumt (21.11.2026): Jobcenter-Briefart Einladung/Anhörung/Unterlagen mit eigener Überschrift, ohne „Was prüft SoLo genau?“, „Wörter im Bescheid“ und Scan-Satz des Bescheids | ✓ | `brief-art` |
| Alle 7 Brief-Stellen ohne großen weißen Rahmen um den Einstieg (Inhalt und Reihenfolge unverändert) | ✓ | `brief-rahmen` |
| „Anderer Brief oder Formular“: nur eine Überschrift (Seitenkopf) | ✓ | `brief-ab` |
| Prüfung mit frischen Augen (#75): Widerspruch mit Zahlen-Begründung nur bei vollständigen Angaben (sonst „Begründung folgt“), Frist im Frist-Muster ganz oben, Vorbefüllung nur mit echten Eingaben, Sprachwahl auf der Startseite, Brief-Prüfung in allen Sprachen (Schreiben an Ämter bleiben Deutsch, mit Hinweis) | ✓ | `frisch` |
| Geld und Schulden, Pfändung: jeder Tipp mit Symbol und einem kurzen Satz (Fristen und Beträge sichtbar), Einzelheiten zum Aufklappen; „Quellen und Stand“ zugeklappt am Seitenende | ✓ | `geld-tipp` (dom-test) |
| Einfache Sprache in der Pflege-Einschätzung: jede Frage, Antwort, jeder Hinweis und jeder Text der Ergebnisseite hat eine einfache Fassung (src/lang/einfach/pflege/pflege.json); Zahlen, Paragrafen und Platzhalter gleich; Antwortstufen, Werte und Punkte unverändert | ✓ | `pflege-einfach` |
| Feste Euro-Beträge in Texten, Rechenregeln und Webseite passen zu den Werten der Rechnung | ✓ | `feste-zahlen` |
| Betragseingaben: deutsche und englische Schreibweise, Eurozeichen, Leerzeichen; negative Beträge (auch mit typografischem Minus) und Datumsangaben werden abgewiesen | ✓ | `eingaben` |
| Grenzwerte auf den Euro genau (−1 € / Grenze / +1 €): Schonvermögen, Mindesteinkommen, Minijob 2026 und 2027, Einkommensgrenze § 85 SGB XII, Stufen des Freibetrags für Arbeit | ✓ | `grenzen` |
| Zufalls-Klicktest: tausende zufällige Bedienschritte (Felder, Auswahlen, Sprache, Schriftgröße, einfache/ausführliche Version, Antragsmappe, Neuladen) ohne Skriptfehler, kaputte Anzeige, seitliches Scrollen oder Sackgasse | ✓ | `zufall-klick` |
| Ergebniskarten ohne „Nächste Schritte“ und „Unterlagen“, nur der Satz „Unterlagen und nächste Schritte findest du in der Antragsmappe.“; die Antragsmappe zeigt Unterlagen zum Abhaken (`lotse.haken`, Schritt „Unterlagen sammeln“) sowie „Die genaue Liste nennt dir die zuständige Stelle.“; Stelle und Tipp je Leistung im Druck (`m-unterlagen`) und in der Zeile der Leistung | ✓ | `karte-mappe` |
| Antragsmappe: Empfänger je Anschreiben bearbeitbar (Vorschlag der App vorbefüllt; Änderung sofort in Brief, Kopiertext und PDF; leeres Feld ergibt Linie; Eingabe nie als HTML; Wiederherstellen; Feld nicht im Druck); Suchlink „Zuständige Stelle suchen“ (DuckDuckGo, nur kurzer Suchbegriff je Leistung, ohne Ort und PLZ in der Adresse, Hinweis „Ort selbst dazuschreiben“, öffnet extern) | ✓ | `empf` |
| Geburtsjahr im Formular: nur 4 Ziffern von 1900 bis heute minus 15 Jahre (wie in der einfachen Version); sonst sichtbare Meldung „4 Ziffern, zum Beispiel 1962“ und kein Ergebnis (z. B. „54“, „1854“, „2030“) | ✓ | `geb` |
| Einkommensfelder: „Lohn/Rente im Monat vor Abzügen (brutto)“ je Art; Minijob-Hinweis nur bei Lohn; allein lebend zweites Einkommen über eigenes Feld, zu zweit Summe je Person; Schalter „Kurzer Check für Menschen mit Behinderung (eine Person)“ | ✓ | `formular` |
| Weitergabe an die SoLo-App des Klienten (nur Beratungsmodus; Öffnen für alle): Auswahl ganzer Vorgang (`Weitergabe.FELDER`, ohne `lotse.beratung-haken`) oder ausgewählte Teile (Blatt als Daten, keine PDF); QR-Code (qrcode-generator, offline, Fehlerkorrektur L, höchstens Version 25, sonst Hinweis „SoLo-Datei“) und SoLo-Datei (.solo); PIN je Weitergabe (Standard an, 6 Ziffern, PBKDF2-SHA-256 600.000 Durchläufe, Salz 16, IV 12, AES-GCM, Kopf-Bytes mit geschützt), PIN steht nicht beim QR-Code, ohne PIN Hinweis; Import von Fremden ist Angriffsfläche (`test/test-weitergabe-boese.js`): Größen (Datei 2 MB, entpackt 512 KB, Entpacken in kleinen Stücken gegen Kompressions-Bomben, Foto 30 MB), nur bekannte Felder und Datentypen je Feld, keine Schlüssel wie `__proto__`/`constructor`/`toString`, keine Steuerzeichen und keine Richtungs-Umkehr (U+202A–U+202E), Anzeige nur mit textContent, Vorschau mit Haken, immer neuer Vorgang (`tresor.importieren`), Fristen mit eigenem, abwählbarem Haken und nur nach Prüfung (`FristenOrdner.normiere`); Blatt in `lotse.klient-blatt`; Lizenzhinweis qrcode-generator (MIT) unter „Über die App“ | ✓ | `weitergabe` |
| Alte Speicherstände aus allen Ausbaustufen (und der einfachen Version) laden richtig und ergeben dasselbe Ergebnis wie im heutigen Format | ✓ | `altstaende` |
| Vorgänge (Haushalte): speichern, öffnen, umbenennen, „Kopie zum Ausprobieren“, löschen; zu einem Vorgang gehören Fragebogen mit Briefdaten, einfache Version, Pflege-Einschätzung, Pfändung, Haushaltsplan/-buch, Checklisten-Haken sowie Haken und Notizen aus „Ich ziehe aus“ (`lotse.haken`, `lotse.haushalt`, `lotse.ausziehen` in `Vorgaenge.DATEN`, also mit PIN verschlüsselt; Einstellungen wie Sprache und Beratungsmodus gelten für alle); Vorgänge nur in „Mein Ordner“ (kein Schild im Kopf, kein Kasten beim Ergebnis): mit einem Vorgang keine Liste, nur „+ Weiteren Vorgang anlegen“; ab zwei eine Liste mit Initialen-Kreis, geöffneter markiert, Wechseln mit einem Tipp, „+ Neuen Vorgang anlegen“, Umbenennen/Kopie/Löschen erst nach „Bearbeiten“; Löschen nur in „Sicherheit und Daten“ mit zwei Zeilen („Nur „Name“ löschen“ = dieser Vorgang mit allen Teilen aus `Vorgaenge.DATEN`; „Alles auf diesem Gerät löschen“ = alle Vorgänge und PIN, Sprache/Anzeige/„Automatisch löschen“ bleiben), jede mit Rückfrage („Abbrechen“ / „Ja, endgültig löschen“) und Meldung; im Leistungs-Check nur ein Link dorthin; PIN-Sperre als Schalter, kurze Erklärung (ganze App gesperrt, PIN merken, vergessen = niemand kann öffnen) als Hinweiszeile direkt unter dem Feld „Neue PIN“ (Festlegen und Ändern), Erklärungen unter „Mehr dazu“; alte Speicherstände werden übernommen; Beispiel überschreibt nie einen gespeicherten Vorgang; PIN-Sperre (Sichtschutz) verschlüsselt alles mit WebCrypto (PBKDF2-SHA-256, 600.000 Durchläufe, AES-GCM, zufälliges Salt und IV), PIN nie gespeichert, Wartezeit nach 5 Fehlversuchen; automatisches Löschen nach 30/90 Tagen mit Datum; Speicher voll oder gesperrt wird gemeldet | ✓ | `vorgaenge` |
| Vorgänge (Haushalte): speichern, öffnen, umbenennen, „Kopie zum Ausprobieren“, löschen; zu einem Vorgang gehören Fragebogen mit Briefdaten, einfache Version, Pflege-Einschätzung, Pfändung, Haushaltsplan/-buch, Checklisten-Haken sowie Haken und Notizen aus „Ich ziehe aus“ (`lotse.haken`, `lotse.haushalt`, `lotse.ausziehen` in `Vorgaenge.DATEN`, also mit PIN verschlüsselt; Einstellungen wie Sprache und Beratungsmodus gelten für alle); Vorgänge nur in „Mein Ordner“ (kein Schild im Kopf, kein Kasten beim Ergebnis): mit einem Vorgang keine Liste, nur „+ Weiteren Vorgang anlegen“; ab zwei eine Liste mit Initialen-Kreis, geöffneter markiert, Wechseln mit einem Tipp, „+ Neuen Vorgang anlegen“, Umbenennen/Kopie/Löschen erst nach „Bearbeiten“; Löschen nur in „Sicherheit und Daten“ mit zwei Zeilen („Nur „Name“ löschen“ = dieser Vorgang mit allen Teilen aus `Vorgaenge.DATEN`; „Alles auf diesem Gerät löschen“ = alle Vorgänge und PIN, Sprache/Anzeige/„Automatisch löschen“ bleiben), jede mit Rückfrage („Abbrechen“ / „Ja, endgültig löschen“) und Meldung; im Leistungs-Check nur ein Link dorthin; PIN-Sperre als Schalter, Warnung „PIN vergessen“ erst beim Festlegen, Erklärungen unter „Mehr dazu“; alte Speicherstände werden übernommen; Beispiel überschreibt nie einen gespeicherten Vorgang; PIN-Sperre (Sichtschutz) verschlüsselt alles mit WebCrypto (PBKDF2-SHA-256, 600.000 Durchläufe, AES-GCM, zufälliges Salt und IV), PIN nie gespeichert, Wartezeit nach 5 Fehlversuchen; automatisches Löschen nach 30/90 Tagen mit Datum; Speicher voll oder gesperrt wird gemeldet | ✓ | `vorgaenge` |
| Einzelne Vorgänge mit eigener PIN sperren (zusätzlich zur App-PIN): PBKDF2-SHA-256 (600.000 Durchläufe, Salz je Vorgang) → AES-GCM 256 (neuer IV je Speichern); Name und Angaben nur verschlüsselt, PIN nie gespeichert, Prüfung nur über Entschlüsselung; Liste zeigt „Gesperrter Vorgang“ mit Schloss (Kurzname nur freiwillig, nur als Text); Öffnen nur mit PIN (neue PIN 6–8 Ziffern, ältere mit 4–5 Ziffern öffnen weiter), Wartezeit nach 5 Fehlversuchen; nach Wechsel, 2 Minuten Hintergrund und Neustart wieder gesperrt; geöffnet nie im Klartext gespeichert; Fristen nur solange geöffnet; keine Kopie/Umbenennen im gesperrten Zustand; Löschen ohne PIN mit Rückfrage; Sperre aufheben mit PIN; `Vorgaenge.oeffneGesperrt(id, pin)` liest nur; Erklärung nennt „Sichtschutz, kein Schutz gegen Fachleute mit Spezialwerkzeug“; PIN-Versuche laufen nacheinander (Wartezeit nicht durch gleichzeitige Versuche umgehbar); „Rückgängig“ hebt keine Sperre auf und setzt den Zähler nicht zurück; ein mit PIN geöffneter Vorgang bleibt offen, wenn ein anderer gesperrt oder gelöscht wird (Angaben der übrigen bleiben nach Neustart) | ✓ | `vorgang-pin`, `vorgang-pin-dom` |
| PIN-Stärke (Sicherheitsprüfung 21.11.2026, S7): neue App-PIN 6–12 Ziffern, neue Vorgang-PIN 6–8 Ziffern; leicht zu ratende PINs (alle gleich, auf-/absteigend auch über 9→0, Wechsel/Wiederholung wie 121212, 123123) abgelehnt mit verständlicher Meldung in 13 Sprachen + Einfach; ältere PINs mit 4–5 Ziffern entsperren weiter | ✓ | `pin-staerke` |
| Fehlversuche der App-PIN (S7, S17): Versuche laufen nacheinander (gleichzeitige Versuche umgehen die Wartezeit nicht); Wartezeit zusätzlich im Arbeitsspeicher mit einer Uhr seit dem Start (Vorstellen der Geräteuhr verkürzt sie nicht); Geräteuhr zurückgestellt: höchstens die Wartezeit zum Zähler. Grenze: Kopie des Speichers lässt sich weiter offline durchprobieren (Keystore/Keychain vorgemerkt) | ✓ | `fehlversuche` |
| Den geöffneten Vorgang sperren (Schlussprüfung P4): bis das Ergebnis feststeht, nimmt der Tresor nichts an (kein verzögertes Speichern in den danach geöffneten Vorgang); das Sperren eines anderen Vorgangs hält nichts an | ✓ | `sperren` |
| Lesefehler des Speichers (Schlussprüfung P6, iOS vor dem ersten Entsperren): nicht als „leer“ behandelt, nichts überschrieben, Hinweis in 13 Sprachen + Einfach, erneutes Lesen nach 5 s und beim Zurückkehren in die App | ✓ | `lesefehler` |
| CSP der App ohne 'unsafe-inline' für Skripte (S8): Skripte als eigene Dateien (js/sN.js), onsubmit="return false" → data-kein-senden, Build bricht bei übrigen Inline-Skripten/Ereignisattributen ab | ✓ | `csp-app` |
| CSP der Web-Version (S9): Skripte nur eigene, cdnjs, jsDelivr und blob: (der mit Prüfsumme geladene pdf.js-Worker startet aus einer blob-Adresse; ohne Worker lädt pdf.js denselben Code im Fenster); kein eval für JavaScript (nur wasm-unsafe-eval für die Texterkennung), object-src/base-uri/form-action 'none' | ✓ | `csp-web` |
| Prüfsummen (SRI) für nachgeladene Skripte (S9): Tesseract (integrity), pdf.js-Programm (integrity) und pdf.js-Worker (fetch mit integrity, blob-Adresse), beide von cdnjs; mit app/node_modules gegen die Dateien geprüft. Ohne Prüfsumme bleiben die von Tesseract selbst nachgeladenen Teile (Worker, Kern, Sprachdaten von jsDelivr, feste Versionen) | ✓ | `sri` |
| pdf.js bleibt 3.11.174 (S10, Entscheidung 21.11.2026): neuere Fassungen laufen nicht auf iOS 15 bis 17.3 (pdf.js 6 laut Mozilla erst ab Chrome 125 / Safari 18). CVE-2024-4367 über die von Mozilla genannte Abhilfe geschlossen: jeder getDocument-Aufruf mit isEvalSupported: false (GHSA-wgrm-67xf-hhpq, abgerufen 21.11.2026); dazu keine CSP mit eval. Gleiche Version in App und Web (cdnjs). Eingescannte PDFs mit Fax-Bild (CCITT) und JPEG 2000 werden gelesen (`test/app-test.js`, `test/e2e-pdf.js`). Vorgemerkt: pdf.js 4+/6 erst, wenn eine iOS-Mindestversion ab 17.4 entschieden ist | ✓ | `pdfjs` |
| Suchlink „Zuständige Stelle suchen“ (S13): Adresse enthält nur den festen Suchbegriff, keinen Ort und keine PLZ; Hinweis, den Ort selbst dazuzuschreiben | ✓ | `suchlink`, `empf` |
| Foto vom QR-Code und Kamerafotos (Schlussprüfung P3, Android): nach dem Einlesen und beim Start nur Dateien JPEG_Datum_Zeit_Zahl.jpg im App-Bilderordner gelöscht. Am Gerät zu prüfen | ✓ | `qr-foto` |
| Neue Sicherheitstexte in allen 13 Sprachen und Einfacher Sprache, alte Angabe „4 bis …“ entfernt | ✓ | `texte` |
| Leiste unten: Start, Mein Ordner, Einstellungen (Leistungen und Briefe über die Startkacheln, markieren Start; #leistungen und #briefe gehen weiter). Mein Ordner: geöffneter Vorgang, letztes Ergebnis, Antragsmappe, Haushaltsplan (Rest im Monat), Pflege-Einschätzung, Pfändung, „Ich ziehe aus“ nur mit Modul; leere Bereiche ausgeblendet, kein Kasten „Los geht's“, darunter die gespeicherten Vorgänge, keine Fristen. Kopfzeile (Logo, Name, Satz „Prüfe in etwa 5 Minuten …“) nur auf der Startseite, sonst nur für Screenreader (h1 bleibt). „Kurzer Check für Menschen mit Behinderung (eine Person)“ als Link am Anfang des Leistungs-Checks, nicht mehr in den Einstellungen. Einstellungen als Liste mit Unterseiten (Anzeige und Sprache mit Schaltern und Hell/Dunkel/wie Gerät, Sicherheit und Daten, Für Fachkräfte, Über die App) | ✓ | `navigation` |
| Leiste unten: Start, Mein Ordner, Einstellungen (Leistungen und Briefe über die Startkacheln, markieren Start; #leistungen und #briefe gehen weiter). Mein Ordner: geöffneter Vorgang, letztes Ergebnis, Antragsmappe, Haushaltsplan (Rest im Monat), Pflege-Einschätzung, Pfändung, „Ich ziehe aus“ nur mit Modul; leere Bereiche ausgeblendet, kein Kasten „Los geht's“, darunter die gespeicherten Vorgänge, keine Fristen. Kopfzeile (Logo, Name, Satz „Prüfe in etwa 5 Minuten …“) nur auf der Startseite, sonst nur für Screenreader (h1 bleibt). „Kurzer Check für Menschen mit Behinderung (eine Person)“ als dritte Wahl oben im Leistungs-Check (Karte auf der Auswahlseite, sonst Link unter „Schritt für Schritt / Alles auf einer Seite“), nicht in den Einstellungen. Einstellungen als Liste mit Unterseiten (Anzeige und Sprache mit Schaltern und Hell/Dunkel/wie Gerät, Sicherheit und Daten, Für Fachkräfte, Über die App) | ✓ | `navigation` |
| Hinweise auf der Ergebnisseite: was SoLo nicht einrechnet (Selbstständigkeit, Wohneigentum, Auto, Mitbewohner, angemessene Miete, EU-Bürger) und das Verfahren danach (Widerspruch § 84 SGG, Überprüfungsantrag § 44 SGB X, Beratung § 14 SGB I, Weiterleitung § 16 SGB I) | ✓ | `verfahren` |
