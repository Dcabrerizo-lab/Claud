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
| Freibetrag für Betriebs-, Riester- und private Rente (§ 82 Abs. 4), Grundrentenfreibetrag nur auf die gesetzliche Rente | ✓ | `gsa-zusatzrente` |
| Kinderzuschlag: anderes Elterneinkommen über dem Bedarf voll, Arbeitseinkommen zu 45 % (§ 6a Abs. 6 BKGG) | ✓ | `kiz-anderes` |
| Versicherungspauschale 30 € einmal je Person, nicht neben Arbeitseinkommen (§ 6 Bürgergeld-V, § 11b Abs. 2 SGB II) | ✓ | `vpausch-person` |
| Rundfunkbeitrag: Befreiung auch bei Blindenhilfe, Hilfe zur Pflege, BAföG nicht bei den Eltern (§ 4 Abs. 1 RBStV) | ✓ | `rf-weitere` |
| Grundrentenfreibetrag höchstens so hoch wie die Rente | ✓ | `gsa-grundrente-klein` |
| Mehrbedarf G 17 % (§ 30 Abs. 1) | ✓ | `gsa-mb-g` |
| Mehrbedarf Alleinerziehende (§ 30 Abs. 3) | ✓ | `gsa-mb-ae` |
| Mehrbedarf 35 % bei Eingliederungshilfe für Schule oder Ausbildung (§ 30 Abs. 4), nicht neben G | ✓ | `gsa-mb-teilhabe` |
| Mittagessen in der Werkstatt (§ 42b Abs. 2) | ◐ | `gsa-essen` |
| Bei den Eltern: eigene Grundsicherung, Stufe 1, Wohnkosten anteilig (§ 42a Abs. 3); Einkommen der Eltern erst ab 100.000 € (§ 94 Abs. 1a) | ✓ / ◐ Wohnkosten | `gsa-eltern` |
| Wohnheim: Stufe 2, Wohnkosten (§ 42a Abs. 5) | ✓ / ◐ Wohnkosten | `gsa-heim` |
| Schonvermögen 10.000 € je Erwachsenem (Barbetragsverordnung) | ✓ | `gsa-verm` |
| Pflegegeld zählt nicht als Einkommen (§ 13 Abs. 5 SGB XI) | ✓ | `gsa-pflegegeld` |
| Mehrbedarf Schwangerschaft (§ 30 Abs. 2) | ✓ | `gsa-schwanger` |
| Mehrbedarf kostenaufwändige Ernährung (§ 30 Abs. 5) | ◐ | `gsa-ernaehrung` |
| Mehrbedarf dezentrale Warmwasserbereitung (§ 30 Abs. 7) | ✓ | `gsa-warmwasser` |
| Ausschluss: Asylbewerberleistungen (§ 23 Abs. 2) | ✓ | `asyl-ausschluss` |

## Wohngeld (WoGG)
<!-- karten: wohngeld -->

| Regel | Status | Test |
|---|---|---|
| Eigentum: Lastenzuschuss, Belastung nach § 10 WoGG nicht genau gerechnet -> nur „möglich“ | ◐ | `eigentum` |
| Verwandte in derselben Wohnung zählen meist zum Haushalt (§ 5) -> nur „möglich“ | ◐ | `hh-andere` |
| Ausgezahlte Beträge (Arbeitslosengeld, Krankengeld, Elterngeld, Werkstattlohn) nur mit dem kleinen Abzug für Auszahlungen, in einfacher und ausführlicher Version gleich (§ 16 WoGG) | ✓ | `einfach-gleich` |
| Tipp „früh beantragen“ (Wohngeld erst ab dem Antragsmonat, § 25 Abs. 2 WoGG) bei „wahrscheinlich“ oder „möglich“, ohne Datumsbedingung; keine Hinweise aus Gesetzentwürfen (BT-Drs. 21/8284 nicht angezeigt) | ✓ | `recht-geltend` |
| Formel, Höchstbeträge, Klima- und Heizkomponente (§§ 12, 19), Pauschalabzug je Einkommensart (§ 16) | ✓ | `wg-formel` |
| Werbungskosten-Pauschbetrag (§ 14 WoGG mit § 9a EStG: Arbeit 1.230 €, Rente 102 €, nicht bei Selbstständigen) und Mindestwerte für M und Y (Anlage 3 WoGG, ab 1.1.2025); 60 Haushalte gleich wie der amtliche Wohngeldrechner des Bundes | ✓ | `amtlich-wohngeld` |
| Bruttokaltmiete mit angegebenen Heizkosten (freiwilliges Feld), sonst Warmmiete minus Heizkostenkomponente (§§ 9, 12 WoGG) | ✓ | `wg-heiz` |
| Höchstbetrag der Miete unter dem Mietfeld und in der Einfachen Version (Gut zu wissen): Anlage 1 WoGG plus Klimakomponente (§ 12 Abs. 1, 7 WoGG, BGBl. 2024 I Nr. 314, abgerufen 20.11.2026), Vergleich mit der geschätzten Bruttokaltmiete (wie Wohngeld-Rechnung); Mietenstufe unsicher: Spanne und „möglich“; Abgrenzung zu den örtlichen Kosten der Unterkunft (§ 22 Abs. 1 SGB II, § 35 SGB XII); kein Hinweis auf Entwürfe zu 2027 (BT-Drs. 21/8284, nicht beschlossen, Stand 20.11.2026) | ✓ | `mietgrenze`, `mietgrenze-dom` |
| Kinderzuschlag/Grundsicherungsgeld: Mehrbedarf Alleinerziehende 36 % bei Kind unter 7; Kind von 6-13 kann 6 sein -> nie fälschlich „eher nicht“ (§ 21 Abs. 3 SGB II) | ✓ | `kiz-ae7` |
| Freibetrag 1.800 € je schwerbehinderter Person (GdB 100 oder Schwerbehinderung mit Pflege, § 17 Nr. 1) | ✓ | `wg-schwerb` |
| Freibetrag Alleinerziehende 1.320 € (§ 17 Nr. 3) | ✓ | `wg-ae` |
| Freibetrag Einkommen von Kindern 16–24 (§ 17 Nr. 4) | ✓ | `wg-kindeink` |
| Elterngeld bis 300 € frei (§ 10 Abs. 1 BEEG) | ✓ | `wg-eg300` |
| Pflegegeld, Kindergeld und Kinderzuschlag kein Einkommen (§ 14) | ✓ | `wg-keinEink` |
| Grundrentenfreibetrag (§ 17a) | ✓ | `wg-grundrente` |
| Mietenstufe aus der Postleitzahl für ganz Deutschland (Anlage zur WoGV, Stand 1.1.2023); Bayern von Hand geprüft, übrige Länder automatisch und unabhängig gegengeprüft (13.386 Einträge, 0 Abweichungen); nicht eindeutige Orte ohne Stufe | ✓ | `plz-stufe` |
| Vermögen: Regelvermutung der Verwaltungsvorschrift (60.000 € + 30.000 € je weitere Person) | ✓ | `wg-verm` |
| Ausschluss bei Grundsicherungsgeld, Grundsicherung, Asylbewerberleistungen (§ 7) | ✓ | `wg-ausschluss`, `asyl-ausschluss` |
| Ausschluss Azubis und Studierende mit dem Grunde nach förderfähiger Ausbildung (§ 20 Abs. 2) | ✓ | `wg-azubi` |
| Selbst gezahlter Unterhalt (§ 18 WoGG): bis 3.000 € im Jahr je Kind oder sonstiger Person, 6.000 € für frühere oder getrennt lebende Ehe- oder Lebenspartner; ohne Titel vorsichtig nur für „möglich“, mit Titel günstig der ganze Betrag (ob ein Titel über den Höchstbetrag hinaus zählt, ist nicht am Gesetzestext geprüft) | ◐ | `uz-wg` |
| Unterhalt für die Person selbst: ohne Realsplitting voll (§ 14 Abs. 2 Nr. 19 und 20 WoGG), mit Realsplitting sonstige Einkünfte (§ 22 Nr. 1a EStG) nach 102 € Pauschbetrag (§ 9a Satz 1 Nr. 3 EStG); Pauschalabzug § 16 WoGG 0 % (familienversichert) bis 20 % (Steuer und eigene Kranken-/Pflegeversicherung). Realsplitting unbekannt: „wahrscheinlich“ mit 0 % und ohne Pauschbetrag, „möglich“ mit 20 % und Pauschbetrag | ◐ | `unt-wg` |
| Geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld als künftiges Einkommen (§ 14 WoGG; Elterngeld bis 300 € frei), zweite Rechnung und Einstufung aus beiden | ✓ | `zuk-einkommen` |

## Kinderzuschlag (BKGG)
<!-- karten: kiz -->

| Regel | Status | Test |
|---|---|---|
| Höchstbetrag, Mindesteinkommen, 45 % Minderung, Vermögen; Einkommen der Eltern nach § 11b SGB II; Mehrbedarf Alleinerziehende | ✓ | `kiz-formel` |
| Kinderzuschlag muss Hilfebedürftigkeit beenden (§ 6a Abs. 1 Nr. 3 BKGG): bereinigtes Einkommen + Kindergeld + Kinderzuschlag; reicht es nur mit Wohngeld: „möglich“, beides beantragen; 40 Familien ohne Widerspruch zum KiZ-Lotsen | ✓ | `amtlich-kiz` |
| Mehrbedarfe der Eltern im Bedarf der Eltern (Schwangerschaft, Warmwasser, 35 % Teilhabe) | ✓ | `kiz-mehr` |
| Vermögensgrenze 40.000 € für die erste, 15.000 € je weitere Person (§ 6a Abs. 3 BKGG, bleibt trotz Grundsicherungsreform) | ✓ | `kiz-verm` |
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
| Behinderung vor dem 25. Geburtstag eingetreten | ✓ | `kgbeh-25` |
| Kind kann sich nicht selbst unterhalten (Grundfreibetrag 12.348 € plus behinderungsbedingter Mehrbedarf) | ✓ | `kgbeh-ja` |

## Bildung und Teilhabe (§ 28 SGB II, § 6b BKGG)
<!-- karten: but -->

| Regel | Status | Test |
|---|---|---|
| Anspruch bei Grundsicherungsgeld, Grundsicherung, Wohngeld oder Kinderzuschlag | ✓ | `but-bezug` |
| Schulbedarf und Teilhabe 15 € im Monat; bei Kindern unter 6 nur Teilhabe | ✓ | `but-inhalt` |
| Junge Erwachsene nur in der Schule, nicht mit Ausbildungsvergütung | ✓ | `but-azubi` |
| Kita und Tagespflege ohne Kostenbeitrag bei Grundsicherung, Wohngeld, Kinderzuschlag, Asylbewerberleistungen (§ 90 Abs. 4 SGB VIII) | ✓ | `but-kita` |

## Unterhaltsvorschuss (UVG)
<!-- karten: uvg -->

| Regel | Status | Test |
|---|---|---|
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
| Auto zählt zum Vermögen (§ 27) | ✓ | `auto` |
| Elternfreibeträge (§ 25) und Grenzbereich | ✓ | `bafoeg-eltern` |
| Unterhalt eines Elternteils für sich selbst: Einkommen nach § 21 Abs. 1 BAföG nur mit Realsplitting (§ 22 Nr. 1a EStG); entscheidet er über die Grenze, höchstens „möglich“ | ◐ | `unt-bafoeg` |
| Höhe der Elternfreibeträge 2026: 2.540 € (verheiratet), 1.690 € (je Elternteil sonst), 770 € je weiteres Kind | ✓ (mehrere Quellen übereinstimmend; Änderung erst zum Sommersemester 2027 geplant, nur Wohnpauschale) | `bafoeg-eltern` |
| Vermögensfreibetrag 15.000 € bis zum 30. Geburtstag, danach 45.000 € (§ 29) | ✓ | `bafoeg-verm` |
| Altersgrenze 45 bei Beginn (§ 10 Abs. 3), Ausnahmen möglich | ✓ | `bafoeg-alter` |
| Betriebliche Ausbildung: kein BAföG, sondern Berufsausbildungsbeihilfe | ✓ | `bafoeg-betrieb` |

## Berufsausbildungsbeihilfe (§§ 56 ff. SGB III)
<!-- karten: bab -->

| Regel | Status | Test |
|---|---|---|
| Betriebliche Ausbildung, Wohnung außerhalb des Elternhauses (§ 60) | ✓ | `bab-voraus` |
| Höhe nach Bedarf und Einkommen der Eltern | ○ (Elterneinkommen wird nicht abgefragt; die Karte zeigt nie „wahrscheinlich“) | |

## Pflege (SGB XI)
<!-- karten: pflege, pflegeplus -->

| Regel | Status | Test |
|---|---|---|
| Pflegegeld, Entlastungsbetrag | ✓ | `pfl-geld` |
| Verhinderungspflege, Kurzzeitpflege (Entlastungsbudget 3.539 €), Pflegehilfsmittel, Wohnumfeld | ✓ | `pfl-plus` |
| Pflegesachleistung und Kombinationsleistung (§§ 36, 38), Tages- und Nachtpflege (§ 41) | ✓ | `pfl-sach` |
| Rentenversicherung für pflegende Angehörige (§ 44) | ◐ | `pfl-rente` |
| Pflegezeit, Familienpflegezeit, Pflegeunterstützungsgeld | ◐ | `pfl-zeit` |
| Pflege-Startkachel „Welche Unterstützung gibt es?“: nur Leistungen des gewählten Pflegegrads (Pflegegrad 1 nach § 28a SGB XI ohne Pflegegeld, Sachleistung, Verhinderungs-/Kurzzeitpflege, Tagespflege, Rentenbeiträge; ohne Pflegegrad nur Pflegekurse und Pflegeberatung) | ✓ | `pu-pg` |
| Feste Beträge 2026 der Übersicht: Pflegegeld, Sachleistung, Tages-/Nachtpflege, Entlastungsbetrag 131 €, gemeinsamer Jahresbetrag 3.539 € (§ 42a), Pflegehilfsmittel 42 €, Wohnumfeld 4.180 € je Maßnahme, Wohngruppenzuschlag 224 € (§ 38a); Quelle BMG, Online-Ratgeber Pflege, Stand 14.9.2026, abgerufen 20.11.2026 | ✓ | `pu-betrag` |
| Verhinderungspflege auch stundenweise (BMG „Verhinderungspflege“, Stand 14.9.2026); Familienentlastende Dienste als anerkanntes Angebot zur Unterstützung im Alltag über den Entlastungsbetrag (BMG „Weitere Leistungen und Angebote zur Unterstützung im Alltag“, Stand 14.9.2026); Bezahlung des FED als Verhinderungspflege nur „möglich“ | ✓ | `pu-fed` |
| Darstellung: „pro Monat“ und „pro Jahr“ getrennt, Alltagswort mit Amtswort in Klammern, kein Hinweis auf den Reformentwurf (nur geltendes Recht), Stellen nur als Art (Pflegekasse, Pflegestützpunkt). Erklärtexte nur Deutsch (wie Pflege-Assistent) | ✓ | `pu-ansicht` |
| Pflege-Korrekturen (abgerufen 20.11.2026): Beratungsbesuch Pflicht halbjährlich bei PG 2–5, PG 4/5 auf Wunsch vierteljährlich (§ 37 Abs. 3 SGB XI); Verhinderungspflege durch nahe Angehörige/Haushalt nicht beruflich höchstens doppeltes Pflegegeld plus nachgewiesene Kosten bis zum Jahresbetrag (§ 39 Abs. 3 SGB XI); aufs Konto Pflegegeld und Wohngruppenzuschlag; ohne Pflegegrad 10 Arbeitstage auch bei voraussichtlicher Pflegebedürftigkeit (§ 2, § 7 Abs. 4 PflegeZG) | ✓ | `pu-korr` |
| Pflegegrad selbst einschätzen, Ergebnisseite: groß „Wahrscheinlich Pflegegrad X“, Hinweis „Das ist eine Einschätzung. Entscheiden tut die Pflegekasse.“, wichtigste Leistungen mit Beträgen nur aus den Rechenregeln (Rules.pflegeFuer), Punkte je Bereich zum Aufklappen; höchstens 3 Kacheln (Antrag bzw. Höherstufung, Was steht mir zu?, Gutachten vergleichen); Ergebnis automatisch gespeichert, „← Zurück“ von den Unterseiten zur Ergebnisseite, Pflege-Startseite zeigt die letzte Einschätzung; in den Leistungs-Check nur, wenn man von dort kam | ✓ | `pflege-ergebnis` |

## Bayerisches Landespflegegeld (BayLPflGG)
<!-- karten: lpg -->

| Regel | Status | Test |
|---|---|---|
| Ab Pflegegrad 2, Hauptwohnsitz Bayern, unabhängig vom Einkommen; ab dem Pflegegeldjahr 2026 500 € im Jahr (vorher 1.000 €) | ✓ | `lpg-ja` |
| Nur in Bayern; ohne Pflegegrad 2 nein, bei laufendem Pflegegrad-Antrag möglich | ✓ | `lpg-voraus` |
| Antrag einmal beim Bayerischen Landesamt für Pflege; Antragsfrist | ◐ (Fristangaben der Quellen widersprüchlich; die App rät zum baldigen Antrag) | `lpg-ja` |
| Empfänger des Antrags: Bayerisches Landesamt für Pflege, Postfach 13 65, 92203 Amberg (Hausanschrift Mildred-Scheel-Str. 4, 92224 Amberg); Quelle lfp.bayern.de (Seite Landespflegegeld und Impressum), abgerufen 19.11.2026; nicht für Wohnorte außerhalb Bayerns | ✓ | `lpg-stelle` |

## Hilfe zur Pflege (SGB XII, 7. Kapitel)
<!-- karten: hzp -->

| Regel | Status | Test |
|---|---|---|
| Voraussetzung Pflegegrad 2–5 oder laufender Antrag (§ 61a) | ✓ | `hzp-voraus` |
| Einkommensgrenze: 2 × Regelsatz Stufe 1 + Wohnkosten + 70 % Familienzuschlag (§ 85) | ✓ | `hzp-grenze` |
| Schonvermögen 10.000 € je Erwachsenem, 500 € je unterhaltener Person | ✓ | `hzp-verm` |
| Heim: Eigenanteil; Unterhalt der Kinder erst ab 100.000 € (§ 94 Abs. 1a) | ◐ | `hzp-heim` |
| Höhe: hängt von den tatsächlichen Pflegekosten ab | ○ (Kosten werden nicht abgefragt; Karte zeigt „möglich“) | |

## Steuer (EStG)
<!-- karten: pausch -->

| Regel | Status | Test |
|---|---|---|
| Behinderten-Pauschbetrag (§ 33b Abs. 3), Übertragung auf die Eltern (§ 33b Abs. 5) | ✓ | `st-pausch` |
| Fahrtkostenpauschale 900 / 4.500 € (§ 33 Abs. 2a) | ✓ | `st-fahrt` |
| Pflege-Pauschbetrag 600 / 1.100 / 1.800 € (§ 33b Abs. 6) | ✓ | `st-pflege` |
| Steuerermäßigung haushaltsnahe Dienstleistungen und Pflege (§ 35a) | ◐ | `st-35a` |

## Schwerbehinderung (SGB IX und andere)
<!-- karten: ausweis, eingl, arbeit -->

| Regel | Status | Test |
|---|---|---|
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
| Erwerbsminderungsrente: unter 3 Stunden voll, 3 bis unter 6 Stunden teilweise; Wartezeit 5 Jahre (§ 43) | ✓ | `rente-em` |
| Werkstatt: volle Erwerbsminderung, Rente nach 20 Jahren (§ 43 Abs. 6) | ✓ | `rente-wfbm` |
| Altersrente für schwerbehinderte Menschen (§§ 37, 236a), Altersgrenzen je Jahrgang | ✓ | `rente-sb` |

## Landesblindengeld (BayBlindG und Gesetze der anderen Länder)
<!-- karten: blindengeld -->

| Regel | Status | Test |
|---|---|---|
| Blindengeld und Sehbehindertengeld, Beträge Stand 7/2026 | ✓ | `bg-betrag` |
| Anrechnung von Pflegegeld: 46 % bei Pflegegrad 2, 33 % ab 3, mindestens 20 € (Art. 4) | ✓ | `bg-pflege` |
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
| Schonvermögen 10.000 € je Erwachsenem | ✓ | `blh-verm` |
| Unter 18 Jahren halber Betrag (§ 72 Abs. 2), Anrechnung von Pflegegeld (§ 72 Abs. 1 Satz 3), Kürzung im Heim (§ 72 Abs. 4) | ◐ | `blh-hinweise` |
| Asylbewerber: erst mit Analogleistungen (§ 2 AsylbLG) | ◐ | `blh-asyl` |
| Höhe der Blindenhilfe 951,92 €, unter 18 Jahren 476,78 € (ab 1.7.2026); Unterschied zum Landesblindengeld, wo dieses belegt ist | ✓ | `blh-betrag` |
| Zuständig in Bayern: Bezirk | ○ (bitte von einer Beratungsstelle bestätigen lassen) | |

## Arbeitslosengeld I (SGB III)
<!-- karten: alg1 -->

| Regel | Status | Test |
|---|---|---|
| Selbstständige nur mit freiwilliger Arbeitslosenversicherung (§ 28a) | ◐ | `selbst` |
| Anwartschaft 12 Monate in 30 Monaten (§§ 142, 143); Minijob zählt nicht (§ 27 Abs. 2) | ✓ | `alg-anwart` |
| 60 %, mit Kind 67 % des pauschalierten Nettos (§ 149), Beitragsbemessungsgrenze (§ 341) | ✓ | `alg-satz` |
| Anspruchsdauer nach Versicherungszeit und Alter (§ 147) | ✓ | `alg-dauer` |
| Sperrzeit bei eigener Kündigung oder Aufhebungsvertrag, 12 Wochen (§ 159) | ◐ | `alg-sperr` |
| Nebeneinkommen: unter 15 Stunden, 165 € frei (§ 155) | ◐ | `alg-neben` |
| Nahtlosigkeit nach dem Krankengeld (§ 145) | ◐ | `alg-nahtlos` |
| Kein Anspruch im Rentenalter (§ 136 Abs. 2) | ✓ | `alg-alter` |

## Krankenversicherung (SGB V)
<!-- karten: krankengeld, zuzahl, famvers -->

| Regel | Status | Test |
|---|---|---|
| 2027: Werte der Sozialversicherungs-Rechengrößenverordnung 2027 (BR-Drs. 576/26, Zustimmung Bundesrat 20.11.2026) erst ab 2027 und nur nach Verkündung im BGBl. (Schalter `svrg2027`; Stand 20.11.2026: nicht verkündet, daher auch 2027 Werte 2026): KV-Grenze 6.375 € (Krankengeld, Netto), RV-Grenze 8.850 € (Arbeitslosengeld, Netto), Bezugsgröße 4.130 € (Familienversicherung 590 €), Kinderkrankengeld höchstens 148,75 € | ✓ | `recht-geltend` |
| Minijob-Hinweis bei Krankengeld und Arbeitslosengeld nennt die Grenze des Jahres (2026: 603 €, ab 2027: 633 €), keine feste Zahl im Text | ✓ | `recht-geltend` |
| Krankengeld 70 % brutto, höchstens 90 % netto, Beitragsbemessungsgrenze (§ 47) | ✓ | `kv-kg` |
| Lohnfortzahlung 6 Wochen, Krankengeld bis 78 Wochen (§ 48) | ◐ | `kv-78` |
| Minijob ohne Krankengeld | ✓ | `kv-minijob` |
| Belastungsgrenze 2 % / 1 % bei chronisch Kranken (GdB ab 60 oder Pflegegrad 3–5) | ✓ | `kv-zuzahl` |
| Fahrtkosten zur ambulanten Behandlung bei aG, Bl, H oder Pflegegrad 3 (mit Einschränkung) bis 5 (§ 60) | ◐ | `kv-fahrt` |
| Familienversicherung (§ 10): Partner mit Einkommen bis 1/7 der Bezugsgröße (2026: 565 €) oder Minijob; Kinder bis 18, bis 23 ohne Arbeit, bis 25 in Ausbildung; ALG I und Krankengeld schließen aus, Rente nur über der Grenze; Elterngeld zählt nicht, Unterhalt nur beim Realsplitting (Hinweis „möglich“) (GKV-Spitzenverband, Grundsätzliche Hinweise Gesamteinkommen 29.09.2022, Anlage und Abschn. 2.3.4.2); Minijob-Grenze nur, wenn Person 2 nur Lohn hat | ◐ | `famvers` |
| Familienversicherung: Ausschluss, wenn der andere Elternteil privat versichert ist und mehr verdient (§ 10 Abs. 3), Mitgliedschaft des Hauptversicherten | ○ (Versicherungsstatus fragt die App nicht ab; Hinweis im Text, „möglich“ statt „wahrscheinlich“) | |

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
| Basiselterngeld 67 %, Ersatzrate bis 100 % unter 1.000 €, bis 65 % über 1.200 € (§ 2 Abs. 2); mindestens 300 €, höchstens 1.800 €; ElterngeldPlus halb so hoch, doppelt so lange (§ 4a); bis zu 14 Monate (§ 4) | ✓ | `eg-satz` |
| Elterngeld-Netto: Netto minus ein Zwölftel des Arbeitnehmer-Pauschbetrags (§ 2c Abs. 1 BEEG, 83,33 €); 33 Einkommen gleich wie der Elterngeldrechner des Bundes | ✓ | `amtlich-elterngeld` |
| Geschwisterbonus 10 %, mindestens 75 € (§ 2a BEEG): bei zwei Kindern unter 6 eingerechnet, bei einem als Hinweis (unter 3?); amtlich geprüft | ✓ | `amtlich-elterngeld` |
| Einkommensgrenze 175.000 € zu versteuerndes Einkommen (§ 1 Abs. 8); Mutterschaftsgeld wird angerechnet (§ 3) | ◐ | `eg-hinweise` |
| Ausländer: Anspruch abhängig vom Aufenthaltstitel (§ 1 Abs. 7) | ◐ | `eg-asyl` |
| Geschwisterbonus, Mehrlingszuschlag (§ 2a) | ○ (Anzahl und Alter der Geschwister werden nicht abgefragt; Spanne reicht bis 1.800 €) | |

## Mutterschaftsgeld (MuSchG, § 24i SGB V)
<!-- karten: mutter -->

| Regel | Status | Test |
|---|---|---|
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
| Ausschluss vom Grundsicherungsgeld, von der Grundsicherung im Alter, vom Wohngeld und vom Kinderzuschlag | ✓ | `asyl-ausschluss` |
| Höhe der Leistungen (Bedarfsstufen, Sachleistungen in Unterkünften) | ○ (hängt von der Unterbringung ab; die Stelle rechnet) | |

## Zuständige Stellen außerhalb Bayerns
<!-- karten: -->

| Regel | Status | Test |
|---|---|---|
| Versorgungsamt, Elterngeldstelle, Träger der Eingliederungshilfe und Stelle für das Landesblindengeld je Land (ohne Anschrift), sonst allgemeine Angabe | ◐ | `zust-land` |
| Kreisebene außerhalb Bayerns: kreisfreie Städte (außer Berlin, Hamburg) mit Name und offizieller Website für Wohngeld, Grundsicherung, Unterhaltsvorschuss, Bildung und Teilhabe, Asyl; Landkreise nur für Grundsicherung im Alter | ✓ | `beh-de` |
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
| Pfändbarer Betrag nach § 850c ZPO und Pfändungsfreigrenzenbekanntmachung 2026 (BGBl. 2026 I Nr. 80): Netto auf 10 € abgerundet, 70/50/40/30/20/10 % des Mehrbetrags, wie die amtliche Tabelle | ✓ | `pfaendung-tabelle` |
| Über der Höchstgrenze 4.866,30 € voll pfändbar | ✓ | `pfaendung-hoechst` |
| P-Konto: 1.590 € automatisch (§ 899 ZPO), Unterhalt und Kindergeld mit Bescheinigung (§§ 902, 903 ZPO) | ✓ | `pkonto` |
| Pfändung wegen Unterhalt (§ 850d ZPO): andere Freibeträge, Hinweis | ◐ | `pfaendung-tabelle` |
| Unpfändbare Bezüge (§ 850a ZPO), Kindergeld (§ 76 EStG), Erhöhung durch das Gericht (§§ 850f, 906 ZPO), Übertrag (§ 899 ZPO), Nachzahlungen (§ 904 ZPO): Hinweise | ◐ | `pkonto` |
| Wöchentliche oder tägliche Auszahlung, Kinderzuschlag auf dem P-Konto, Unterhaltsberechtigte mit eigenem Einkommen (§ 850c Abs. 6 ZPO) | ○ (Monatslohn ist der Regelfall; die übrigen Fälle entscheidet das Vollstreckungsgericht im Einzelfall) | |
| Geld sparen → „Schulden und Pfändung“: oben Knopf zum Pfändungsrechner, „Erste Schritte“ (4), „Was tun, wenn …“ zum Aufklappen (Inkasso, Mahnbescheid, Kontopfändung/P-Konto, Strom-/Gassperre, Mietschulden, Ratenzahlung, unseriöse Schuldenregulierer, Privatinsolvenz); Tipps sinngemäß nach Verbraucherzentralen, BAG-SB (meine-schulden.de), Caritas/Diakonie, AG SBV (abgerufen 20.11.2026); Fristen: Widerspruch Mahnbescheid möglichst in 2 Wochen (§ 692 Abs. 1 Nr. 3 ZPO), später noch, solange kein Vollstreckungsbescheid verfügt ist (§ 694 Abs. 1 ZPO); Einspruch Vollstreckungsbescheid 2 Wochen, Notfrist (§§ 700, 339 ZPO); Vollstreckungsbescheid: Pfändung sofort möglich (§ 700 ZPO), Einspruch stoppt sie nicht von selbst (§ 719 Abs. 1 ZPO; Text in allen Sprachen angeglichen 20.11.2026); Schonfrist Räumungsklage 2 Monate, einmal in 2 Jahren (§ 569 Abs. 3 Nr. 2 BGB), gilt nicht für eine zusätzliche ordentliche Kündigung; Strom-/Gassperre erst ab 2 Abschlägen und 100 €, Androhung 4 Wochen, Ankündigung 8 Werktage (§ 41f EnWG), Grundversorgung: zinsfreie Raten (§ 41g EnWG, abgerufen 20.11.2026); Verjährung 3 Jahre ab Jahresende (§§ 195, 199 BGB), Restschuldbefreiung in der Regel nach 3 Jahren (§ 287 InsO), Geldstrafen bleiben (§ 302 InsO); Beratungsstellen nur als Art der Stelle | ✓ | `schulden` |
| Pfändungsrechner: Knopf „Tipps bei Schulden“ erst unter dem Ergebnis, nicht vor dem Rechnen | ✓ | `schulden` |
| Schulden-Korrekturen: Strom/Gas-Sperre nach §§ 41f, 41g EnWG statt StromGVV, Vollstreckungsbescheid erlaubt Pfändung (§ 700 ZPO), Schonfrist nicht für ordentliche Kündigung | ✓ | `schulden-korr` |

Die Tabelle gilt bis 30.6.2027, danach zeigt die App einen Warnhinweis. Jedes Jahr zum 1. Juli neue Werte eintragen.

### Schulden-Liste (src/schulden.js)

Geld sparen → Schulden und Pfändung → „Meine Schulden-Liste“. Grundlage: docs/entwuerfe/schuldenliste.md mit Prüfvermerk und Entscheidung vom 20.11.2026; alle Paragraphen abgerufen 20.11.2026 auf gesetze-im-internet.de.

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
| Hinweise nur bei Auslöser, höchstens 2 sichtbar, „Nicht mehr zeigen“: Weiterbewilligung (§ 41 Abs. 3 SGB II, § 44 Abs. 3 SGB XII, § 25 Abs. 1 WoGG, § 6a Abs. 7 BKGG), Einkommensänderung (§ 60 SGB I), Nebenkosten-Nachzahlung (§ 22 Abs. 1 SGB II, § 35 SGB XII), Darlehen (§ 24 Abs. 1, § 42a SGB II, § 37 Abs. 1 SGB XII), Bildung und Teilhabe (§ 28 SGB II, § 34 SGB XII, § 6b BKGG), Rundfunkbeitrag (§ 4 Abs. 1 RBStV) | ✓ | `hb-hinweise` |
| Regelbedarf zur Orientierung: Anteile nach § 5 RBEG (434,96 €), Stufe 1 aus den Werten der App | ✓ | `hb-regelbedarf` |
| Korrekturen: Meldepflicht je Leistung (Grundsicherungsgeld/Sozialhilfe sofort nach § 60 Abs. 1 SGB I, Wohngeld bei dauerhaft mehr als 15 % nach § 27 Abs. 3 WoGG, Kinderzuschlag meist erst beim nächsten Antrag; abgerufen 20.11.2026), Vorlage „Änderung melden“ nur bei Grundsicherungsgeld oder Sozialhilfe; Nachzahlung: Antrag im Monat der Fälligkeit; ganzes Haushaltsbuch löschen mit Rückgängig; je Vorgang gespeichert und mit PIN verschlüsselt | ✓ | `hb-korr` |
| Energiekosten-Check (im Plan unter „Strom und Gas“): Jahresverbrauch aus zwei Zählerständen (× 365, mind. 14 Tage, unter 60 Tagen „ungenau“, bei Gas und Heizen mit Strom unter 330 Tagen „ungenau“ mit Jahreszeit-Hinweis, über 2 Jahre Hinweis) oder von der Rechnung; Gas in m³ nur mit Faktor von der Rechnung; Kosten mit eigenem Preis oder Destatis-Durchschnitt 37,97 / 11,58 ct/kWh (PM Nr. 345 vom 30.09.2026, 1. Hj. 2026); 11 oder 12 Abschläge; „passt ungefähr“ bis 30 € bzw. 5 % (Faustregel, keine Gesetzesgrenze); Ergebnis immer „möglich“; Arbeitspreis und Gas-Faktor mit bis zu 4 Nachkommastellen (Fehlermeldung unter dem Feld, Speichern ohne Gleitkomma-Verlust); Plan-Hinweis und Brief nur mit eigenem Preis, nicht ungenau und Ablesung höchstens 31 Tage alt (sonst „Bitte lies den Zähler neu ab“); Brief „senken“ (nur Vergleich mit dem Abschlag: „voraussichtlich geringer als bei der Berechnung meines Abschlags angenommen“) mit § 41b Abs. 3 Satz 2 EnWG / § 13 Abs. 1 Satz 4 StromGVV/GasGVV, „erhöhen“ ohne Paragraf; Vergleich nur mit Destatis-Durchschnitt 2021 je Haushaltsgröße (2.105 / 3.470 / 5.411 kWh) ohne Urteil; Stromspiegel nur als Link (Klassen erst nach schriftlicher Erlaubnis von co2online); Warmwasser gemeinsames Feld mit dem Check (§ 21 Abs. 7 SGB II) | ◐ | `en-check` |
| Energie-Texte (abgerufen 20.11.2026): Haushaltsstrom aus dem Regelbedarf, Darlehen nach § 24 Abs. 1 SGB II (ältere Schulden § 22 Abs. 8), Sozialhilfe § 37 Abs. 1, § 36 SGB XII, gesondert zu beantragen; Heizkosten-Nachzahlung im Fälligkeitsmonat (§ 22 Abs. 1 SGB II, § 35 Abs. 1 und 5 SGB XII), Antrag im Fälligkeitsmonat (§ 37 Abs. 2 SGB II); Abwendungsvereinbarung nur Grundversorgung nach Androhung, 6–18 bzw. bei über 300 € 12–24 Monate (§ 41g Abs. 1 EnWG); Korrektur `sp.vertraege.4`: § 41g EnWG statt § 19 StromGVV/GasGVV, Darlehen § 24 Abs. 1 bzw. § 22 Abs. 8 SGB II; Türkisch „kesintisi tehlikesi mi var?“ | ✓ | `en-korr` |
| Spartipps mit Fundstelle (Text „Quelle: …“ unter jedem Tipp): Miete – Verbraucherzentrale, Deutscher Mieterbund, Wohngeldgesetz; Strom und Gas – Stromspiegel für Deutschland, Verbraucherzentrale (Energieberatung); Handy und Internet – Verbraucherzentrale, § 56 Abs. 3 TKG (Kündigung nach der Erstlaufzeit mit 1 Monat Frist, abgerufen 20.11.2026); Versicherungen, Mobilität, Sonstiges – Verbraucherzentrale; Lebensmittel – Verbraucherzentrale, Bundeszentrum für Ernährung; Kinder – § 28 SGB II, § 34 SGB XII, § 6b BKGG (Bildung und Teilhabe), Familienkasse; Raten – BAG-SB (meine-schulden.de). Abrufdatum der allgemeinen Ratgeberseiten vor der Veröffentlichung nachtragen | ◐ | `hb-tipps` |
| Geld-Hinweise im Haushaltsbuch: höchstens einer gleichzeitig **innerhalb der Geld-Gruppe** (Mehrbedarf, Erspartes, Pflege-Belege, Steuer-Belege); die übrigen Hinweise (z. B. Weiterbewilligung, Nebenkosten, Tarife) zählen nicht mit und können daneben stehen; wegklickbar, Details zum Aufklappen | ✓ | `hb-geld`, `hb-einfach`, `hb-amtsbegriffe`, `hb-en` |
| Mehrbedarf nur mit Grundsicherungsgeld/Sozialhilfe (Bezug oder Check ja/vielleicht) und passender Notiz bzw. Angabe: Schwangerschaft ab 13. Woche nur bei Bezug, nicht bei Check „vielleicht“ (§ 21 Abs. 2 SGB II, § 30 Abs. 2 SGB XII), Warmwasser dezentral nur „möglich“ (§ 21 Abs. 7 SGB II, § 30 Abs. 7 SGB XII), Ernährung ohne Betrag (§ 21 Abs. 5 SGB II, § 30 Abs. 5 SGB XII), Alleinerziehende (§ 21 Abs. 3 SGB II, Widerspruch § 84 SGG), Behinderung nur bei GdB ab 50 oder Merkzeichen H/Bl/TBl (§ 21 Abs. 4 SGB II, § 30 Abs. 1 SGB XII), laufender Sonderbedarf (§ 21 Abs. 6 SGB II, § 27a Abs. 4 SGB XII); nicht, wenn im Check schon angehakt; abgerufen 20.11.2026 | ✓ | `hb-mehrbedarf`, `hb-worte` |
| Erspartes nah an der Vermögensgrenze (App-Regel: ab 80 % oder in 6 Monaten, kein Gesetz): Grenzen aus denselben Formeln wie die Karten; Grundsicherungsgeld immer mit Vorbehalt „möglicherweise … etwa“ (Altfälle § 65a SGB II), bei Paaren oder unbekanntem Alter ohne Zahl in der Überschrift (kleinste mögliche Grenze als Auslöser); Wohngeld als „Richtwert“, nicht „Grenze“ (Nr. 21.37 WoGVwV); Kinderzuschlag: nur erster Monat gekürzt, wenn der Betrag darüber kleiner als der monatliche Kinderzuschlag ist (§ 12 Abs. 2, § 65a SGB II; § 90 Abs. 2 Nr. 9 SGB XII mit VO; § 21 Nr. 3 WoGG mit WoGVwV 21.37 als Richtwert; § 6a Abs. 3 BKGG); Warnung vor gezieltem Ausgeben (§ 34 SGB II, § 26 SGB XII); abgerufen 20.11.2026 | ✓ | `hb-verm`, `hb-verm-text`, `hb-verm-ggeld`, `hb-verm-paar`, `hb-verm-wohngeld`, `hb-verm-kiz` |
| Beleg-Häkchen je Buchung (Steuer/Pflegekasse), Belegliste je Kalenderjahr (nur bis heute, wiederkehrende Buchungen ohne künftige Monate, kein Jahr nach dem laufenden) mit Druck und CSV (Formel-Schutz), Pflege-Hinweis: Belege des laufenden Kalenderjahres, bis 30.6. auch des Vorjahres, Pflege-Belege: Entlastungsbetrag 131 € (§ 45b SGB XI, Reste bis 30.6. des Folgejahres), Verbrauchs-Pflegehilfsmittel 42 € (§ 40 Abs. 2 SGB XI), gemeinsamer Jahresbetrag (§ 42a SGB XI); abgerufen 20.11.2026 | ✓ | `hb-belege`, `hb-belege-heute`, `hb-pflege-fenster`, `hb-bereinigen` |
| Nur geltendes Recht: kein Hinweis auf Gesetzentwürfe (Pflegeneuordnungsgesetz, BT-Drs. 21/8869), auch nicht als „Entwurf“; Pflege-Hinweis vor und ab 1.1.2027 gleich (Regel des Nutzers, 20.11.2026) | ✓ | `hb-pflege-recht`, `hb-entwurf` |
| Steuer-Hinweis (§ 35a EStG 20 %, höchstens 4.000 € / 1.200 €, nur unbar; § 33, § 33b, § 9a EStG; abgerufen 20.11.2026), nicht bei Grundsicherungsgeld/Sozialhilfe ohne Lohn oder Selbstständigkeit; nicht für schon als Beleg (Steuer oder Pflegekasse) markierte Buchungen; Bar-Warnung nur bei Handwerker/Haushaltshilfe | ✓ | `hb-steuer`, `hb-bar` |

## Ich ziehe aus (src/ausziehen.js)

Eigener Bereich für junge Menschen; keine Rechnung, nur Hinweise. Quellen mit Abrufdatum 20.11.2026 in `Ausziehen.Q`.

| Regel | Status | Test |
|---|---|---|
| Übersicht mit 7 Kacheln (2 Spalten, jede Kachel eine eigene Palettenfarbe, keine Hex-Werte im Modul), Unterseiten mit „Zurück“ (Herkunft gemerkt), Checklisten mit Fortschritt, wichtige Punkte offen, weitere zum Aufklappen | ✓ | `az-aufbau`, `az-oberflaeche` |
| Unter 25 mit Grundsicherungsgeld: Zusicherung vor Vertragsschluss, Pflicht-Gründe, keine Erstausstattung ohne Zusicherung, weniger Regelbedarf (§ 22 Abs. 5, § 24 Abs. 6, § 20 Abs. 3 SGB II), Verzicht bei wichtigem Grund, deutliche Warnung | ✓ | `az-aufbau`, `az-oberflaeche` |
| Kaution höchstens 3 Kaltmieten ohne Betriebskosten, 3 Monatsraten (§ 551 BGB); Kaution als Darlehen, Umzugskosten mit Zusicherung (§ 22 Abs. 6 SGB II); Erstausstattung vor dem Kauf beantragen (§ 24 Abs. 3, § 37 SGB II) | ✓ | `az-quellen` |
| Ummelden in 2 Wochen, Wohnungsgeberbestätigung (§ 17 Abs. 1, § 19 BMG); Grundversorgung melden (§ 2 StromGVV); Rundfunk je Wohnung, Befreiung nur auf Antrag und nur für die Person (§ 2, § 4 Abs. 1 RBeitrStV); Laufzeit 24 Monate, danach jederzeit kündbar (§ 56 TKG); Kfz-Anschrift unverzüglich (§ 15 FZV); Steuer-ID an Arbeitgeber (§ 39e Abs. 4 EStG) | ✓ | `az-quellen` |
| Basiskonto, 10 Geschäftstage (§ 31 ZKG); P-Konto (§ 850k ZPO); Lastschrift 8 Wochen (§ 675x BGB); Nebenkostenabrechnung 12 Monate, danach keine Nachforderung, 12 Monate für Einwände (§ 556 Abs. 3 BGB); Aufbewahren nach Verbraucherzentrale (Stand 23.10.2025) | ✓ | `az-quellen` |
| Kostenfallen: Widerruf 14 Tage (§ 312g, § 355 BGB), Bestellknopf (§ 312j BGB), Dispo-Beratung 6 Monate/75 % (§ 504a BGB), Widerspruch 1 Monat (§ 84 SGG), Datenkopie kostenlos (Art. 15 Abs. 3 DSGVO); „Später zahlen“ und Kredite „ohne Schufa“ nach Verbraucherzentrale | ✓ | `az-quellen` |
| Versicherungen gestuft nach Verbraucherzentrale (Stand 21.11.2025, VZ Hamburg 15.04.2026), Kfz-Haftpflicht unter „Unbedingt“, Auslandsreise-Krankenversicherung unter „Kommt drauf an“; Familienversicherung bis 18/23/25, Ausnahme privat versicherter Elternteil, Grenze 1/7 Bezugsgröße aus `R.famvers` (§ 10 Abs. 2 und 3 SGB V); Gesundheitsfragen (§ 19 VVG); keine Anbieter, keine Preise | ✓ | `az-quellen`, `az-oberflaeche` |
| Hilfen nur „möglich“: BAB (§ 56, § 60 SGB III), BAföG (§ 2), Wohngeld-Ausschluss (§ 20 Abs. 2 WoGG), Kindergeld bis 18/21/25 und Abzweigung (§ 32 Abs. 4, § 74 EStG), Kindergeld für sich selbst (§ 1 Abs. 2 BKGG), Unterhalt der Eltern bis Ende der ersten Ausbildung (§ 1610 Abs. 2 BGB, Beratung § 18 Abs. 4 SGB VIII), Grundsicherungsgeld (§ 7 Abs. 5, § 22, § 24, § 27 SGB II), Bildung und Teilhabe (§ 28 SGB II), Waisenrente bis 18 immer, in Ausbildung oder Freiwilligendienst bis 27 (§ 48 Abs. 4 SGB VI) | ✓ | `az-aufbau`, `az-oberflaeche` |
| Careleaver: § 41 (in der Regel bis 21, Rückkehr möglich), § 41a, § 41 Abs. 3 und § 36b, kein Kostenbeitrag aus eigenem Einkommen, Ausnahmen Kindergeld und zweckgleiche Leistungen (§ 92 Abs. 1a, § 93 Abs. 1, § 94 Abs. 3, Abs. 6 weggefallen), Krankenhilfe (§ 40, § 41 Abs. 2), Ombudsstelle (§ 9a SGB VIII); Briefvorlage nur „An das Jugendamt“, keine Anschrift, Zuständigkeit (§ 86a Abs. 4), schriftlicher Bescheid erbeten | ✓ | `az-quellen`, `az-oberflaeche` |
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
## Aufforderung zur Senkung der Unterkunftskosten (erweiterungen/kostensenkung.js)

Brief prüfen → Jobcenter, Sozialamt oder Anderer Brief; keine Rechnung, nur Erklärung. Quellen mit Abrufdatum 20.11.2026 in `docs/entwuerfe/kostensenkung.md`. Erkennung zusätzlich in `test/erweiterungen/test-kostensenkung.js`.

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
| Feste Euro-Beträge in Texten, Rechenregeln und Webseite passen zu den Werten der Rechnung | ✓ | `feste-zahlen` |
| Betragseingaben: deutsche und englische Schreibweise, Eurozeichen, Leerzeichen; negative Beträge (auch mit typografischem Minus) und Datumsangaben werden abgewiesen | ✓ | `eingaben` |
| Grenzwerte auf den Euro genau (−1 € / Grenze / +1 €): Schonvermögen, Mindesteinkommen, Minijob 2026 und 2027, Einkommensgrenze § 85 SGB XII, Stufen des Freibetrags für Arbeit | ✓ | `grenzen` |
| Zufalls-Klicktest: tausende zufällige Bedienschritte (Felder, Auswahlen, Sprache, Schriftgröße, einfache/ausführliche Version, Antragsmappe, Neuladen) ohne Skriptfehler, kaputte Anzeige, seitliches Scrollen oder Sackgasse | ✓ | `zufall-klick` |
| Antragsmappe: Empfänger je Anschreiben bearbeitbar (Vorschlag der App vorbefüllt; Änderung sofort in Brief, Kopiertext und PDF; leeres Feld ergibt Linie; Eingabe nie als HTML; Wiederherstellen; Feld nicht im Druck); Suchlink „Zuständige Stelle suchen“ (DuckDuckGo, kurzer Suchbegriff je Leistung und Ortsname, öffnet extern) | ✓ | `empf` |
| Geburtsjahr im Formular: nur 4 Ziffern von 1900 bis heute minus 15 Jahre (wie in der einfachen Version); sonst sichtbare Meldung „4 Ziffern, zum Beispiel 1962“ und kein Ergebnis (z. B. „54“, „1854“, „2030“) | ✓ | `geb` |
| Einkommensfelder: „Lohn/Rente im Monat vor Abzügen (brutto)“ je Art; Minijob-Hinweis nur bei Lohn; allein lebend zweites Einkommen über eigenes Feld, zu zweit Summe je Person; Schalter „Kurzer Check für Menschen mit Behinderung (eine Person)“ | ✓ | `formular` |
| Alte Speicherstände aus allen Ausbaustufen (und der einfachen Version) laden richtig und ergeben dasselbe Ergebnis wie im heutigen Format | ✓ | `altstaende` |
| Vorgänge (Haushalte): speichern, öffnen, umbenennen, „Kopie zum Ausprobieren“, löschen; zu einem Vorgang gehören Fragebogen mit Briefdaten, einfache Version, Pflege-Einschätzung, Pfändung, Haushaltsplan/-buch, Checklisten-Haken sowie Haken und Notizen aus „Ich ziehe aus“ (`lotse.haken`, `lotse.haushalt`, `lotse.ausziehen` in `Vorgaenge.DATEN`, also mit PIN verschlüsselt; Einstellungen wie Sprache und Beratungsmodus gelten für alle); „Alle Angaben löschen“ leert den geöffneten Vorgang mit Rückgängig, „Alle Vorgänge löschen“ und „Diesen Vorgang löschen“ in den Einstellungen unter „Sicherheit und Daten“ (dort auch PIN-Sperre und automatisches Löschen), Verwaltung der Vorgänge in „Mein Ordner“ → „Alle Haushalte und Vorgänge“; alte Speicherstände werden übernommen; Beispiel überschreibt nie einen gespeicherten Vorgang; PIN-Sperre (Sichtschutz) verschlüsselt alles mit WebCrypto (PBKDF2-SHA-256, 600.000 Durchläufe, AES-GCM, zufälliges Salt und IV), PIN nie gespeichert, Wartezeit nach 5 Fehlversuchen; automatisches Löschen nach 30/90 Tagen mit Datum; Speicher voll oder gesperrt wird gemeldet | ✓ | `vorgaenge` |
| Leiste unten: Start, Mein Ordner, Einstellungen (Leistungen und Briefe über die Startkacheln, markieren Start; #leistungen und #briefe gehen weiter). Mein Ordner: geöffneter Vorgang mit „Wechseln“, letztes Ergebnis, Antragsmappe, Haushaltsplan (Rest im Monat), Pflege-Einschätzung, Pfändung, „Ich ziehe aus“ nur mit Modul; leere Bereiche ausgeblendet, Leerzustand mit „Los geht's“, keine Fristen. „Kurzer Check für Menschen mit Behinderung (eine Person)“ als Link am Anfang des Leistungs-Checks, nicht mehr in den Einstellungen. Einstellungen als Liste mit Unterseiten (Anzeige und Sprache mit Schaltern und Hell/Dunkel/wie Gerät, Sicherheit und Daten, Für Fachkräfte, Über die App) | ✓ | `navigation` |
| Hinweise auf der Ergebnisseite: was SoLo nicht einrechnet (Selbstständigkeit, Wohneigentum, Auto, Mitbewohner, angemessene Miete, EU-Bürger) und das Verfahren danach (Widerspruch § 84 SGG, Überprüfungsantrag § 44 SGB X, Beratung § 14 SGB I, Weiterleitung § 16 SGB I) | ✓ | `verfahren` |
