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
| 2027: Regelsatz noch nicht beschlossen, Nullrunde erwartet: Hinweis, gerechnet wird mit 563 € | ✓ | `plan-2027` |
| Regelbedarfe 2026: 563 / 506 / 451 / 390 € (§ 20, § 23) | ✓ | `gg-regel` |
| Freibetrag für Erwerbstätige (§ 11b Abs. 2, 3): 100 € frei, 20 % bis 520 €, 30 % bis 1.000 €, 10 % bis 1.200 € (mit Kind 1.500 €) | ✓ | `gg-ewt` |
| Freibetrag nur für Einkommen aus Arbeit, nicht für Rente, Arbeitslosengeld, Krankengeld, Elterngeld | ✓ | `gg-ewt-art` |
| Schüler und Azubis unter 25: Einkommen bis zur Minijob-Grenze frei (§ 11b Abs. 2b) | ✓ | `gg-azubi` |
| Minijob-Grenze ab 1.1.2027: 633 € (Mindestlohn 14,60 €), die App schaltet am Stichtag selbst um (auch Krankengeld und Arbeitslosengeld) | ✓ | `minijob-2027` |
| Weitere Beträge 2027 (Kindergeld 267 €, Grundfreibetrag 12.564 €, Beitragsbemessungsgrenzen, Regelsätze, Wohngeld) | ○ (Stand 10.11.2026 nur Entwürfe bzw. offen; erst nach Verkündung einarbeiten; die App weist ab 1.1.2027 darauf hin) | |
| Schüler und Azubis über der Minijob-Grenze: auf den Teil darüber zusätzlich der Freibetrag nach Abs. 3 | ○ (die App rechnet vorsichtig ohne diesen Zusatz, der Betrag fällt also eher zu niedrig aus; von einer Fachperson bestätigen lassen) | |
| Elterngeld 300 € frei bei Einkommen vor der Geburt (§ 10 Abs. 5 BEEG) | ✓ | `gg-eg300` |
| Unterhalt und Unterhaltsvorschuss als Einkommen der Kinder, gedeckelt auf ihren Bedarf | ✓ | `gg-unterhalt` |
| Selbst gezahlter Unterhalt: Abzug vom Einkommen, wenn festgelegt (Unterhaltstitel, Jugendamtsurkunde, notarielle Vereinbarung) und gezahlt (§ 11b Abs. 1 Satz 1 Nr. 7); ohne Titel kein Abzug, Hinweis | ✓ | `uz-sgb2` |
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
| Auto zählt zum Vermögen, außer es wird wegen Behinderung oder für die Arbeit gebraucht (§ 90) | ◐ | `auto` |
| EU-Staatsangehörige: Ausschluss wie § 7 SGB II (§ 23 Abs. 3 SGB XII) | ✓ | `eu` |
| Voraussetzung Rentenalter oder dauerhaft volle Erwerbsminderung (§ 41) | ✓ | `gsa-voraus` |
| Freibetrag Erwerbstätige 30 %, höchstens 50 % RS1 (§ 82 Abs. 3 Satz 1) | ✓ | `gsa-ewt` |
| Selbst gezahlter Unterhalt: in der Regel kein Abzug (§ 82 SGB XII kennt ihn nicht), Hinweis auf Selbstbehalt | ◐ | `uz-gsa` |
| Werkstattlohn: Arbeitsförderungsgeld frei, 1/8 RS1 + 50 % frei (§ 82 Abs. 2 Nr. 5, Abs. 3 Satz 2) | ✓ | `gsa-wfbm` |
| Grundrentenfreibetrag (§ 82a) | ✓ | `gsa-grundrente` |
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
| 2027: geplante Kürzung (BT-Drs. 21/8284) nur als Hinweis; Tipp „Antrag noch 2026“ wegen Bestandsschutz nur vor dem Jahreswechsel | ✓ | `plan-2027` |
| Formel, Höchstbeträge, Klima- und Heizkomponente (§§ 12, 19), Pauschalabzug je Einkommensart (§ 16) | ✓ | `wg-formel` |
| Werbungskosten-Pauschbetrag (§ 14 WoGG mit § 9a EStG: Arbeit 1.230 €, Rente 102 €, nicht bei Selbstständigen) und Mindestwerte für M und Y (Anlage 3 WoGG, ab 1.1.2025); 60 Haushalte gleich wie der amtliche Wohngeldrechner des Bundes | ✓ | `amtlich-wohngeld` |
| Bruttokaltmiete mit angegebenen Heizkosten (freiwilliges Feld), sonst Warmmiete minus Heizkostenkomponente (§§ 9, 12 WoGG) | ✓ | `wg-heiz` |
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
| Geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld als künftiges Einkommen (§ 14 WoGG; Elterngeld bis 300 € frei), zweite Rechnung und Einstufung aus beiden | ✓ | `zuk-einkommen` |

## Kinderzuschlag (BKGG)
<!-- karten: kiz -->

| Regel | Status | Test |
|---|---|---|
| 2027: geplanter Wegfall des Sofortzuschlags (25 €) nur als Hinweis, noch nicht eingerechnet | ✓ | `plan-2027` |
| Höchstbetrag, Mindesteinkommen, 45 % Minderung, Vermögen; Einkommen der Eltern nach § 11b SGB II; Mehrbedarf Alleinerziehende | ✓ | `kiz-formel` |
| Kinderzuschlag muss Hilfebedürftigkeit beenden (§ 6a Abs. 1 Nr. 3 BKGG): bereinigtes Einkommen + Kindergeld + Kinderzuschlag; reicht es nur mit Wohngeld: „möglich“, beides beantragen; 40 Familien ohne Widerspruch zum KiZ-Lotsen | ✓ | `amtlich-kiz` |
| Mehrbedarfe der Eltern im Bedarf der Eltern (Schwangerschaft, Warmwasser, 35 % Teilhabe) | ✓ | `kiz-mehr` |
| Vermögensgrenze 40.000 € für die erste, 15.000 € je weitere Person (§ 6a Abs. 3 BKGG, bleibt trotz Grundsicherungsreform) | ✓ | `kiz-verm` |
| Ausschluss bei Asylbewerberleistungen (kein Kindergeld) | ✓ | `asyl-ausschluss` |
| Selbst gezahlter, festgelegter Unterhalt mindert das Einkommen der Eltern (§ 11b Abs. 1 Satz 1 Nr. 7 SGB II) | ✓ | `uz-sgb2` |
| Geschätztes Arbeitslosengeld, Krankengeld oder Elterngeld als künftiges Einkommen der Eltern, zweite Rechnung | ✓ | `zuk-einkommen` |

## Kindergeld (EStG, BKGG)
<!-- karten: kindergeld -->

| Regel | Status | Test |
|---|---|---|
| 2027: antragsloses Kindergeld (Gesetz, Bundesrat 25.9.2026) als Hinweis; geplante 267 € nur als Hinweis, gerechnet wird mit 259 € | ✓ | `plan-2027` |
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
| 2027: geplante Altersgrenze 16 statt 18 nur als Hinweis, noch nicht eingerechnet | ✓ | `plan-2027` |
| Beträge je Altersstufe 0–5 / 6–11 / 12–17 (nach Abzug des Kindergeldes) | ✓ | `uvg-betrag` |
| Gezahlter Unterhalt wird angerechnet (§ 2 Abs. 3) | ✓ | `uvg-anrechnung` |
| Ab 12 Jahren: kein Grundsicherungsgeld des Kindes oder Elternteil mit mindestens 600 € brutto (§ 1 Abs. 1a) | ◐ | `uvg-ab12` |
| Elternteil heiratet oder lebt mit dem anderen Elternteil zusammen: kein Anspruch | ◐ | `uvg-paar` |

## BAföG
<!-- karten: bafoeg -->

| Regel | Status | Test |
|---|---|---|
| Auto zählt zum Vermögen (§ 27) | ✓ | `auto` |
| Elternfreibeträge (§ 25) und Grenzbereich | ✓ | `bafoeg-eltern` |
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
| 2027: geplantes Pflegegeld 380 / 630 / 890 / 1.080 € nur als Hinweis (ab Pflegegrad 2), gerechnet wird mit den Beträgen 2026 | ✓ | `plan-2027` |
| Pflegegeld, Entlastungsbetrag | ✓ | `pfl-geld` |
| Verhinderungspflege, Kurzzeitpflege (Entlastungsbudget 3.539 €), Pflegehilfsmittel, Wohnumfeld | ✓ | `pfl-plus` |
| Pflegesachleistung und Kombinationsleistung (§§ 36, 38), Tages- und Nachtpflege (§ 41) | ✓ | `pfl-sach` |
| Rentenversicherung für pflegende Angehörige (§ 44) | ◐ | `pfl-rente` |
| Pflegezeit, Familienpflegezeit, Pflegeunterstützungsgeld | ◐ | `pfl-zeit` |

## Bayerisches Landespflegegeld (BayLPflGG)
<!-- karten: lpg -->

| Regel | Status | Test |
|---|---|---|
| Ab Pflegegrad 2, Hauptwohnsitz Bayern, unabhängig vom Einkommen; ab dem Pflegegeldjahr 2026 500 € im Jahr (vorher 1.000 €) | ✓ | `lpg-ja` |
| Nur in Bayern; ohne Pflegegrad 2 nein, bei laufendem Pflegegrad-Antrag möglich | ✓ | `lpg-voraus` |
| Antrag einmal beim Bayerischen Landesamt für Pflege; Antragsfrist | ◐ (Fristangaben der Quellen widersprüchlich; die App rät zum baldigen Antrag) | `lpg-ja` |

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
<!-- karten: krankengeld, zuzahl -->

| Regel | Status | Test |
|---|---|---|
| 2027: Beitragsbemessungsgrenze 6.375 € (Verordnung, Bundesrat ausstehend) als Hinweis bei hohem Lohn; Krankengeld dann höchstens 148,75 € je Tag | ✓ | `plan-2027` |
| Krankengeld 70 % brutto, höchstens 90 % netto, Beitragsbemessungsgrenze (§ 47) | ✓ | `kv-kg` |
| Lohnfortzahlung 6 Wochen, Krankengeld bis 78 Wochen (§ 48) | ◐ | `kv-78` |
| Minijob ohne Krankengeld | ✓ | `kv-minijob` |
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
| Einkommensgrenzen nach Haushaltsgröße und Kindern; höhere Grenzen per Gebietsverordnung | ✓ | `wbs-grenze` |
| Freibetrag Schwerbehinderte nach § 24 WoFG (4.500 € / 2.100 €) | ✓ | `wbs-schwerb` |
| Länder ohne belegte Landesgrenze (Saarland): unter den Bundeswerten (§ 9 Abs. 2 WoFG: 12.000 / 18.000 €, + 4.100 € je weitere Person, + 500 € je Kind) „wahrscheinlich“, sonst „möglich“ | ◐ | `wbs-land` |
| Landesgrenzen aller übrigen 15 Länder nach amtlichen Quellen (Tabelle `docs/WBS-GRENZEN.md`), mit Aufrundung (RP, SH) und Zuschlag für 1-2 Personen (SH); auf den Euro geprüft; „nein“ nur über der höchsten Stufe nach 30 % Abzug, Freibeträgen und gezahltem Unterhalt mit 5 % Reserve | ✓ | `wbs-land-grenze` |
| Genaue Einkommensgrenzen der anderen 15 Länder | ○ (Quellen widersprüchlich; Annahme: kein Land liegt unter den Bundeswerten, bitte bestätigen) | |

## Elterngeld (BEEG)
<!-- karten: elterngeld -->

| Regel | Status | Test |
|---|---|---|
| Basiselterngeld 67 %, Ersatzrate bis 100 % unter 1.000 €, bis 65 % über 1.200 € (§ 2 Abs. 2); mindestens 300 €, höchstens 1.800 €; ElterngeldPlus halb so hoch, doppelt so lange (§ 4a); bis zu 14 Monate (§ 4) | ✓ | `eg-satz` |
| Elterngeld-Netto: Netto minus ein Zwölftel des Arbeitnehmer-Pauschbetrags (§ 2c Abs. 1 BEEG, 83,33 €); 33 Einkommen gleich wie der Elterngeldrechner des Bundes | ✓ | `amtlich-elterngeld` |
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
| Postanschriften außerhalb Bayerns | ○ (noch nicht hinterlegt; die Karte verweist auf die Website der Behörde) | |
| Einzelne Zuständigkeiten (z. B. Thüringen, Niedersachsen, Schleswig-Holstein beim Blindengeld) | ○ (nicht sicher bestätigt, daher die allgemeine Angabe; bitte von Fachleuten prüfen lassen) | |

## Leistungen, die die App (noch) nicht prüft

Damit niemand denkt, die App decke alles ab:

- Ermäßigung der Kita-Gebühren bei mittlerem Einkommen (Satzung der Gemeinde); beitragsfreie Kita bei Sozialleistungen ist eingebaut
- Anschriften der Ämter außerhalb Bayerns (Phase 3); genaue Beträge der Landesleistungen anderer Länder (Gehörlosengeld, Landesblindengeld, WBS-Grenzen), sobald verlässliche Quellen vorliegen
- Härtefallleistungen und einmalige Bedarfe im Einzelfall (z. B. Waschmaschine, Umzug, Mietschulden)
- Schuldnerberatung, Sozialtarife (Strom, Telefon, Kultur), Bildungskredit

## Anzeige und Eingaben (alle Karten)

| Regel | Status | Test |
|---|---|---|
| Jede Karte zeigt Einstufung, Überschrift, Text und jeden Betrag genau wie berechnet, in allen 8 Sprachen; Zählung und Hinweise passen; Speichern und Laden ändert nichts; nirgends NaN, undefined, Platzhalter, negative Beträge oder Rohschlüssel | ✓ | `anzeige-rechnung` |
| Einfache und ausführliche Version rechnen für dieselbe Person gleich | ✓ | `einfach-gleich` |
| Feste Euro-Beträge in Texten, Rechenregeln und Webseite passen zu den Werten der Rechnung | ✓ | `feste-zahlen` |
| Betragseingaben: deutsche und englische Schreibweise, Eurozeichen, Leerzeichen; negative Beträge (auch mit typografischem Minus) und Datumsangaben werden abgewiesen | ✓ | `eingaben` |
| Grenzwerte auf den Euro genau (−1 € / Grenze / +1 €): Schonvermögen, Mindesteinkommen, Minijob 2026 und 2027, Einkommensgrenze § 85 SGB XII, Stufen des Freibetrags für Arbeit | ✓ | `grenzen` |
| Zufalls-Klicktest: tausende zufällige Bedienschritte (Felder, Auswahlen, Sprache, Schriftgröße, einfache/ausführliche Version, Antragsmappe, Neuladen) ohne Skriptfehler, kaputte Anzeige, seitliches Scrollen oder Sackgasse | ✓ | `zufall-klick` |
| Alte Speicherstände aus allen Ausbaustufen (und der einfachen Version) laden richtig und ergeben dasselbe Ergebnis wie im heutigen Format | ✓ | `altstaende` |
| Hinweise auf der Ergebnisseite: was SoLo nicht einrechnet (Selbstständigkeit, Wohneigentum, Auto, Mitbewohner, angemessene Miete, EU-Bürger) und das Verfahren danach (Widerspruch § 84 SGG, Überprüfungsantrag § 44 SGB X, Beratung § 14 SGB I, Weiterleitung § 16 SGB I) | ✓ | `verfahren` |
