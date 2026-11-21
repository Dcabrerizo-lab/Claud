# Abgleich SoLo mit veröffentlichten Bescheiden und amtlichen Rechenbeispielen

Stand: 21.11.2026. Repo-Stand: `origin/claude/test-update-1.9` (827f1bc). Kein Code geändert, nichts committet.
Nachrechnen: `node /home/claude/ausgabe/abgleich/abgleich.js /home/claude/wt-abgleich` (Ergebnisse auch in `ergebnis.json`).

## 1. Ergebnis in Kürze

| | Anzahl |
|---|---|
| Geprüfte Fälle (alle neu, nicht in `test-ba-beispiele.js` / `test-amtlich.js`) | 43 |
| Stimmen überein (Betrag gleich oder nur Rundung auf 10 €) | 26 |
| Rechenformel stimmt, aber Anzeige oder Zusatzmodul weicht ab | 7 (F1, F3.1–F3.6) |
| Beispiel selbst ungenau oder anderer Begriff (kein SoLo-Fehler) | 4 (F2.1, F2.3, G1, G2) |
| Echte Abweichungen in der Einstufung oder im Betrag | 6 (A6, B5, B6c, D4b, E3, F4b) |

- **Kein schwerer Fehler.** Keine falsche Zusage, kein falscher Grundbetrag. Regelbedarfe, Freibeträge, Wohngeldformel, Kinderzuschlag-Rechnung stimmen mit den amtlichen Beispielen.
- **9 Befunde**, davon 3 mittel und 6 niedrig (Abschnitt 4). Der wichtigste: Bei kleinen Renten zeigt SoLo beim Wohngeld „Einkommen eher zu niedrig“ ohne Betrag, obwohl die Wohngeldstelle Hannover genau für solche Haushalte 342 bis 422 € Wohngeld ausweist.
- Der Musterbescheid Bürgergeld (2023) wird mit den Werten von 2023 **auf den Cent** nachgerechnet (1.644,92 €). Der Musterbescheid Wohngeld Frankfurt (2025) ebenso (355 €).

## 2. Quellen

| Kürzel | Quelle | Stand / Rechtsstand | Fundort |
|---|---|---|---|
| KiZ-MB | Familienkasse, Merkblatt Kinderzuschlag | Juli 2026 / 2026 | https://www.arbeitsagentur.de/datei/kiz2-merkblattkinderzuschlag_ba015395.pdf |
| DA-KiZ | Familienkasse Direktion, Durchführungsanweisung Kinderzuschlag | 20.02.2026 / 2026 | https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf |
| MB-SGB II | Bundesagentur für Arbeit, Merkblatt „Grundsicherung für Arbeitsuchende“ | August 2026 / neue Grundsicherung ab 1.7.2026 | https://www.arbeitsagentur.de/datei/merkblatt-sgb2_ba043375.pdf |
| BG-Muster | „Musterbescheid zum Bürgergeld“ (Jobcenter Nürnberg-Stadt, Vorlage von jobcenter.digital) mit Berechnungsbogen | Februar 2023 / 2023 | https://www.buergergeld.org/wp-content/uploads/buergergeld-bescheid-muster.pdf (Kopie auf einer privaten Seite, das Original bei jobcenter.digital habe ich nicht abgerufen) |
| WG-Muster | Stadt Frankfurt am Main, Musterbescheid Wohngeld | 03.06.2025 / 2025 (Werte wie 2026) | https://www.frankfurtpass.de/files/Musterbescheid_Wohngeld.pdf |
| WG-Han | Landeshauptstadt Hannover, Faltblatt „Wohngeld für Seniorinnen und Senioren“, Wohngeld-Musterberechnungen | Januar 2025 / 2025 | hannover.gov.de (Download-Link aus der Suche, Datei `wg-hannover.pdf`) |
| WG-Muc | Landeshauptstadt München, „Wohngeld – Einkommensgrenzen 2025“ | Januar 2025 / 2025 | https://stadt.muenchen.de/dam/Home/Stadtverwaltung/Sozialreferat/wohnungsamt/wohngeld/Einkommensgrenzen-ab-dem-01-01-2025-Wohngeld_Plus-Gesetz.pdf |
| WG-12 | Bundesbauministerium, Hinweise zu Nr. 19.31 WoGVwV (mehr als 12 Haushaltsmitglieder) | 02.12.2024 / ab 1.1.2025 | https://www.tacheles-sozialhilfe.de/files/Weisungen/WoGG/241202-hinweise-wogmehrals12hmer_geschwaerzt.pdf |
| WG-Plaus | Bundesinnenministerium, Hinweise zu Nr. 15.01 WoGVwV (Plausibilitätsprüfung) | 11.03.2020 / Beispiel mit Werten 2020 | https://www.tacheles-sozialhilfe.de/files/Weisungen/WoGG/200311-hinweisezurplausibilittsprfung_geschwaerzt.pdf |
| GSA-Han | Region Hannover, Faltblatt Grundsicherung im Alter, Beispielrechnung | 4/2024 / 2024 (Regelsatz 563 € wie 2026) | https://www.Hannover.de/content/download/919080/file/Grundsicherung_im_Alter_Flyer_2024.pdf |
| GSA-Bo | Stadt Bochum, Merkblatt Grundsicherung, Beispiele a) und b) | Werte ab 1.1.2024 (wie 2026) | bochum.de, `merkblatt_grusi.pdf` |
| EG-Br | Bundesfamilienministerium, Broschüre „Elterngeld und Elternzeit“, 28. Auflage | Oktober 2025 | https://www.bmbfsfj.bund.de/resource/blob/185424/bcc9d1bfeadbaf621a32c838a1491467/elterngeld-und-elternzeit-data.pdf |
| AE-2026 | Bundesfamilienministerium, Einlegeblatt „Leistungen für Alleinerziehende 2026“; UVG-Merkblatt Berlin 2026 | 2026 | https://www.bmbfsfj.bund.de/resource/blob/256052/2b19e389612f4244069d5b1a686e82f8/einlegeblatt-leistungen-fuer-alleinerziehende-2026-data.pdf |

Alle Dateien am 21.11.2026 abgerufen. Lange Dokumente (DA-KiZ, Merkblatt SGB II, Elterngeld-Broschüre) habe ich nur an den Beispiel-Stellen gelesen, nicht vollständig.
Nicht gefunden: amtliche Rechenbeispiele des Bundesbauministeriums mit Endbetrag (nur der Rechner, schon im Repo abgeglichen); Unterhaltsvorschuss-Beispiele mit Teilanrechnung; ein Musterbescheid Kinderzuschlag oder Grundsicherung im Alter.

## 3. Alle Fälle

„App“ = `Rules.evaluate` (Erste Einschätzung, auf 10 € gerundet). „Check“ = Bescheid-Check im Prüfpaket (`erweiterungen/bescheid-*.js`, auf den Cent).

### Kinderzuschlag

| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| A1 | Paar, 3 Kinder, Miete 900, Einkommen 1.585 + 330 (KiZ-MB 2.2 Bsp. 1) | 736 € | App 740 €, Check 735,75 € | gleich |
| A2 | Paar, 1 Kind, Miete 800, Einkommen 2.100 (KiZ-MB 2.2 Bsp. 2) | 106 € | App 110 €, Check 106,20 € | gleich |
| A3 | Unterhalt 300 € fürs Kind (KiZ-MB 2.1) | 162 € | App 160 €, Check 162 € | gleich |
| A4 | Paar, Kinder 11 und 16, Bedarf 2.773 €, Einkommen 1.600, Wohngeld 450 (KiZ-MB 1.3 Bsp. 1) | Anspruch, 594 € | Bedarf 2.773 €; „möglich, nur mit Wohngeld“, 590 € | gleich (vorsichtige Einstufung) |
| A5 | wie A4, Einkommen 700, Wohngeld 800 (KiZ-MB 1.3 Bsp. 2) | kein Kinderzuschlag | „möglich – Einkommen eher zu niedrig“ | gleich |
| A6 | wie A4, Einkommen 1.030, Wohngeld 600 (KiZ-MB 1.4, erweiterter Zugang) | Anspruch, 594 € (es fehlen nur 31 €) | „möglich – Einkommen eher zu niedrig“, kein Betrag | **Abweichung** (Befund 4) |
| B1 | Alleinerziehend, 2 Kinder, Unterhalt 450 + Lohn 600, Miete 400 (DA-KiZ C.3.2) | 579,46 € | 580 € | gleich |
| B2 | Rentner-Ehepaar, 3 Kinder, Rente 1.450 + Lohn 300 (DA-KiZ C.3.2) | 718 € | 720 € | gleich |
| B3 | Patchwork, 2 Kinder, Einkommen 1.538, Kind 100 €, Miete 600 (DA-KiZ C.3.2) | 504 € | 500 € | gleich |
| B4 | Vater Altersrente 1.350, Mutter arbeitslos, 2 Kinder, Miete 380 (DA-KiZ D.2 Bsp. 1) | 561 € | 560 € | gleich (Sonderrechnung nicht abgebildet, trotzdem 5 € genau) |
| B5 | Alleinerziehender Altersrentner 900 €, Kind 16, Miete 360 (DA-KiZ D.2 Bsp. 2) | 238 € | „möglich“, 300 € | **Abweichung** (Befund 6) |
| B6a | Kind 17, Unterhalt 400 € (DA-KiZ C.2.2.2) | 117 € | 120 € | gleich |
| B6b | wie B6a, Vermögen 1.500 € über dem Freibetrag | Ablehnung | „eher nicht“ | gleich |
| B6c | wie B6a, Vermögen 100 € über dem Freibetrag | 1. Monat 17 €, danach 117 € | „eher nicht“ | **Abweichung** (Befund 5) |

### Grundsicherungsgeld / Bürgergeld

| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| C1 | Musterbescheid 2/2023: Paar + Kind 7, Lohn 500/400, Arbeitslosengeld 180, Miete 990, Warmwasser dezentral; Werte 2023 in den Check eingesetzt | 1.644,92 € (Regel 1.250; Warmwasser 24,92; Einkommen 370; Kindergeld 250) | 1.644,92 € (alle Posten gleich) | gleich, auf den Cent |
| C2 | derselbe Haushalt mit Werten 2026 | 1.644,92 + 152 (Regelbedarfe 506/506/390 statt 451/451/348) + 3,04 (Warmwasser) − 9 (Kindergeld 259 statt 250) = 1.790,96 € | App 1.790 €, Check 1.790,96 € | gleich; Unterschied nur durch geänderte Werte |
| D1 | 1.900 € brutto, 1.500 € netto (MB-SGB II 9.2) | 348 € frei | 348 € | gleich |
| D2 | Minijob 603 € (MB-SGB II 9.2) | 208,90 € frei | 208,90 € | gleich |
| D3 | mit minderjährigem Kind (MB-SGB II 9.2) | 30 € mehr | 378 € | gleich |
| D4a | Paar 32 und 59 Jahre, Vermögen 30.000 € (MB-SGB II 9.5) | Freibeträge 10.000 + 20.000, übertragbar: nichts anzurechnen | „wahrscheinlich“ | gleich |
| D4b | dasselbe Paar, Vermögen 35.000 € (eigene Fortführung des Beispiels) | 5.000 € über dem Freibetrag | „wahrscheinlich“ (SoLo-Grenze 40.000 €) | **Abweichung** (Befund 2) |

### Grundsicherung im Alter

| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| E1 | 68 Jahre, Rente 690,59, Merkzeichen G, Miete 330 + Heizung 50 (GSA-Han) | Bedarf 1.038,71; Leistung 348,12 € | App 350 €, Check 348,12 € | gleich |
| E2 | 68 Jahre, Rente 550, Merkzeichen G, Miete 250 + 50 (GSA-Bo a) | 408,71 € | App 410 €, Check 408,71 € | gleich |
| E3 | Ehepaar, beide Merkzeichen G, Renten 800 + 350, Miete 260 + 66 (GSA-Bo b) | 360,04 € | Check 360,04 €; App 270 € | Check gleich; App **86 € zu niedrig** (Befund 9) |

### Wohngeld

| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| F1 | Musterbescheid Frankfurt: 2 Personen, Stufe VI, EM-Rente 1.470, Arbeitslosengeld 620, GdB 100, 33 Jahre Grundrentenzeiten, Miete 900 davon Heizung 110 | Miete 912,40; Einkommen 1.503,85; Wohngeld 355 € | Formel: 912,40 / 1.503,85 / 354,83 → 355 €; App 350 bis 430 €; Check 207 € | Formel und App gleich; **Check falsch** (Befund 3) |
| F2.1 | 1 Person, Rente 800, Kaltmiete 420 (WG-Han) | 342 € | Formel 345 € | Beispiel 3 € daneben (siehe unten) |
| F2.2 | 1 Person, Rente 1.000, Kaltmiete 540 | 349 € | Formel 349 € | gleich |
| F2.3 | wie F2.1 mit GdB 100 | 402 € | Formel 405 € | Beispiel 3 € daneben |
| F2.4 | wie F2.2 mit GdB 100 | 422 € | Formel 422 € | gleich |
| F2.5 | 2 Personen, Rente 1.300, Kaltmiete 600 | 412 € | Formel 412 € | gleich |
| F2 App | alle fünf Hannover-Haushalte in der App | Wohngeld 342 bis 422 € | „möglich – Einkommen eher zu niedrig“, **kein Betrag** | **Abweichung** (Befund 1) |
| F3.1–F3.6 | Einkommensgrenzen München, Stufe VII, 1 bis 6 Personen (WG-Muc) | 1.619 / 2.181 / 2.717 / 3.671 / 4.200 / 4.717 € | Formel bei 10 € Wohngeld: genau diese Werte. Angezeigte Grenze (Wohngeld 0 €): 1.634 / 2.197 / 2.734 / 3.691 / 4.219 / 4.736 € | Formel gleich; **Anzeige 15 bis 19 € zu hoch** (Befund 8) |
| F4a | 12 Personen, Stufe III, Miete 1.600, Einkommen 4.688,25 (WG-12) | 1.204,9782 → 1.205 € | 1.204,9782 € | gleich (4 Nachkommastellen) |
| F4b | 14 Personen (WG-12) | 1.335 € | 1.205 € | **Abweichung** (Befund 7) |

Zu F2.1 und F2.3: Die 3 € entstehen genau dann, wenn man den Werbungskosten-Pauschbetrag für Renten (102 € im Jahr) weglässt. Die anderen drei Hannover-Fälle stimmen nur **mit** dem Pauschbetrag. Vermutung: Das Faltblatt ist in sich nicht einheitlich. Nicht geprüft. SoLo stimmt hier mit dem amtlichen Wohngeldrechner überein (7.060 Fälle im Repo). Hannover ist mit Mietenstufe V gerechnet (nur damit passen F2.2 und F2.4); die Stufe habe ich nicht amtlich nachgeschlagen.

### Elterngeld, Beträge

| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| G1 | Netto vor der Geburt 2.000 € (EG-Br 1.4.1) | 1.300 €, ElterngeldPlus 650 € | 1.246 € / 623 € | anderer Begriff, kein Fehler |
| G2 | Netto 1.000 € (EG-Br 1.7) | 670 € | 652 € | anderer Begriff, kein Fehler |
| H1 | Mehrbedarf Alleinerziehende 12 / 36 / 48 / 60 % (AE-2026, DA-KiZ) | 67,56 / 202,68 / 270,24 / 337,80 € | gleich | gleich |
| H2 | Unterhaltsvorschuss 2026 (AE-2026, Merkblatt Berlin) | 227 / 299 / 394 €; ab 12: 600 € brutto | gleich | gleich |
| H3 | Regelbedarfe, Kindergeld, Kinderzuschlag, Mindesteinkommen (AE-2026) | 563 / 357 / 390 / 471; 259; 297; 600 / 900 € | gleich | gleich |

Zu G1/G2: Die Broschüre rechnet mit dem „Elterngeld-Netto“ (schon nach Abzug von 83,33 € Werbungskosten). SoLo fragt das ausgezahlte Netto ab und zieht die 83,33 € selbst ab, wie der amtliche Elterngeldrechner (33 Fälle im Repo auf den Euro gleich). Mit 2.083,33 € bzw. 1.083,33 € Eingabe liefert SoLo genau 1.300 € und 670 €.

## 4. Befunde (echte Abweichungen)

| Nr. | Schwere | Was | Fundstelle | Amtliche Quelle | Korrekturvorschlag |
|---|---|---|---|---|---|
| 1 | **mittel** | Wohngeld, Mindesteinkommen: SoLo prüft `Netto < 80 % × (Regelbedarf + Miete)` **ohne** das Wohngeld mitzuzählen. Amtlich: Einnahmen **plus Wohngeld** (auch Kindergeld, Kinderzuschlag) müssen 100 % der Miete und rund 80 % des Regelbedarfs decken; Mehrbedarfe zählen nicht. Folge: Rentner mit 800 bis 1.300 € Rente sehen „Einkommen eher zu niedrig“ und keinen Betrag, die Wohngeldstelle weist 342 bis 422 € aus. | `src/rules.js` Z. 24 (`mindestAnteil`, „reine Heuristik“), Z. 982–989 | WG-Plaus Nr. 15.01 Abs. 1 Satz 6 bis 9 mit Beispiel; WG-Han | Prüfung umstellen: `Netto + Kindergeld + Kinder-Einkommen + geschätztes Wohngeld (vorsichtiger Wert) − Miete >= 0,8 × Regelbedarf` (ohne Mehrbedarf). Betrag auch bei „Einkommen eher zu niedrig“ anzeigen. |
| 2 | **mittel** | Grundsicherungsgeld, Vermögen bei Paaren: SoLo nimmt den Freibetrag der ältesten Person für beide (2 × 20.000 €). Ist die zweite Person jünger, liegt die echte Grenze tiefer (Beispiel 30.000 €). Zwischen den Werten bleibt die Einstufung „wahrscheinlich“. Die kleinste mögliche Grenze (`ggeldMin`) ist schon berechnet, wird aber nur im Haushaltsbuch benutzt. | `src/rules.js` Z. 1097–1098, `vermGrenzen` Z. 2066–2071 | MB-SGB II 9.5 mit Beispiel (§ 12 Abs. 2 SGB II) | Bei zwei Erwachsenen oder unbekanntem Alter: Vermögen über `ggeldMin` → höchstens „möglich“ mit Hinweis „hängt vom Alter beider ab“. Oder zweites Geburtsjahr abfragen. |
| 3 | **mittel** (nur Prüfpaket) | Bescheid-Check Wohngeld kennt den Freibetrag für Grundrentenzeiten (§ 17a WoGG) nicht. Beim Frankfurter Musterbescheid erwartet er 207 € statt 355 € und meldet ein höheres Einkommen als im Bescheid. | `erweiterungen/bescheid-wg.js` Z. 42–45; Eingabe `erweiterungen/vorschau.js` Z. 484–486 | WG-Muster („Freibetrag nach § 17a WoGG 3.378 €“) | Haken „33 Jahre Grundrentenzeiten“ je Mitglied; Freibetrag wie in `rules.js` (100 € + 30 %, höchstens 281,50 €). Bis dahin in „Nicht geprüft“ nennen. |
| 4 | niedrig bis mittel | Kinderzuschlag: fester Puffer von 300 € für Wohngeld. Größere Familien bekommen mehr Wohngeld (Merkblatt: 450 bis 800 €). Folge in A6: „Einkommen eher zu niedrig“, amtlich Anspruch. Einstufung bleibt „möglich“, also keine falsche Absage. | `src/rules.js` Z. 18 (`puffer: 300`), Z. 1057 | KiZ-MB 1.4 Beispiel | Statt 300 € die eigene Wohngeld-Schätzung der App einsetzen (vorsichtiger Wert), plus 100 € für den erweiterten Zugang. |
| 5 | niedrig | Kinderzuschlag, Vermögen knapp über der Grenze: SoLo sagt „eher nicht“. Amtlich wird nur der erste Monat gekürzt, wenn der übersteigende Betrag kleiner ist als der Kinderzuschlag eines Monats. | `src/rules.js` Z. 1030–1031 | KiZ-MB 2.3; DA-KiZ C.2.2.2.3 Abs. 3 | Übersteigt das Vermögen die Grenze um weniger als den geschätzten Monatsbetrag: „möglich“ mit Hinweis. |
| 6 | niedrig | Kinderzuschlag bei Altersrentnern: amtlich zählt die Rente nur, soweit sie den eigenen Bedarf mit **Kopfteil** der Miete übersteigt, der Überschuss mindert voll. SoLo rechnet mit dem Tabellenanteil (77 %). In B5 300 € statt 238 € (Einstufung „möglich“). | `src/rules.js` Z. 1017–1021, Z. 1040 | DA-KiZ D.2 Abs. 1 Satz 9–11, Beispiele 1 und 2 | Sonderrechnung für Elternteile im Rentenalter einbauen oder in diesem Fall keinen Betrag zeigen. |
| 7 | niedrig | Wohngeld bei mehr als 12 Personen: Zuschlag von 65 € je weiterer Person fehlt (App und Bescheid-Check). | `src/rules.js` Z. 277, Z. 310–314; `erweiterungen/bescheid-wg.js` Z. 46 | WG-12; § 19 Abs. 3 WoGG | Nach der Rundung `+ 65 × (n − 12)`. |
| 8 | niedrig | Wohngeld, angezeigte Einkommensgrenze: SoLo rechnet bis Wohngeld 0 €. Unter 10 € wird kein Wohngeld gezahlt. Die Anzeige liegt 15 bis 19 € (bei Lohn bis 27 € brutto) über der amtlichen Grenze. | `src/rules.js` Z. 315–319 (`wgYmax`), Z. 331 | WG-Muc; § 21 Nr. 1 WoGG | In `wgYmax` mit `M − 10/1,15` statt `M` rechnen (Grenze bei 10 € Wohngeld). Vor dem Umbau prüfen, ob `test-amtlich.js` weiter besteht. |
| 9 | niedrig (bewusst vereinfacht) | Grundsicherung im Alter: Merkzeichen G nur für eine Person. Bei Paaren mit zwei Ausweisen 86 € zu wenig (vorsichtige Seite). Der Bescheid-Check rechnet richtig. | `src/rules.js` Z. 1253 | GSA-Bo Beispiel b); § 30 Abs. 1 SGB XII | Hinweis in der Karte („bei beiden: Betrag höher“) oder zweiten Haken. |

Keine Fehler, nur zur Einordnung:
- Rundung: Die App rundet auf 10 € (Erste Einschätzung), die Familienkasse auf volle Euro, der Bescheid-Check auf Cent.
- A4: SoLo stuft „möglich“ statt „wahrscheinlich“ ein, weil der Anspruch vom Wohngeld abhängt. Das ist gewollt.
- Das Einlegeblatt des Familienministeriums für 2026 nennt beim Vermögen noch die alten Bürgergeld-Werte (40.000 / 15.000 €). SoLo folgt dem neueren Merkblatt der Bundesagentur (August 2026). Das Einlegeblatt ist an dieser Stelle veraltet.

## 5. Vorschläge für neue Testfälle

Alle Eingaben für `Rules.evaluate` mit `heute: 2026.9`, `vermoegen: 0`, wenn nichts anderes steht. `F` = `Rules.sgb2Freibetrag`.

| Test | Eingaben | Erwartet | Quelle |
|---|---|---|---|
| KiZ-MB 2.2 Bsp. 1 | `adults 2, kids 3, kidsAlter, einkommen [{lohn, b 2500, n 1585+F(2500,true), p 1}, {lohn, b 750, n 330+F(750,true), p 2}], miete 900, bezug {kindergeld}` | Karte `kiz` „ja“, 740 €; `BescheidKiZ.rechne`: Bedarf 1.570, KiZ 735,75 | KiZ-MB 7/2026 |
| KiZ-MB 2.2 Bsp. 2 | `adults 2, kids 1, einkommen [{lohn, b 3300, n 2100+F(3300,true)}], miete 800` | „ja“, 110 €; Check 106,20 | KiZ-MB 7/2026 |
| KiZ-MB 2.1 | `adults 1, kids 1, lohn 1500/1200, unterhalt 300, miete 600` | 160 €; Check 162 | KiZ-MB 7/2026 |
| KiZ-MB 1.3 | `adults 2, kids 2, kids14 1, einkommen [{lohn, b 2700, n 1600+378}], miete 900` | Bedarf 2.773 (Karte `ggeld`), `kiz` nicht „nein“, 590 € | KiZ-MB 7/2026 |
| DA-KiZ Mutter T. | `adults 1, kids 2, einkommen [{lohn, b 1000, n 928}, {unt, b 450, n 450}], miete 400` | 580 € (genau 579,46) | DA-KiZ 20.02.2026, C.3.2 |
| DA-KiZ Ehepaar X | `adults 2, kids 3, kids14 2, einkommen [{rente, b 1480, n 1480, p 1}, {lohn, b 500, n 480, p 2}], miete 645.16` | 720 € (genau 718) | DA-KiZ C.3.2 |
| DA-KiZ Patchwork | `adults 2, kids 2, kidsU6 1, einkommen [{lohn, b 2500, n 1916}], unterhalt 100, miete 600` | 500 € (genau 504) | DA-KiZ C.3.2 |
| DA-KiZ Mia | `adults 1, kids 1, kids14 1, lohn 1500/1200, unterhalt 400, miete 600`; dazu `vermoegen 56500` | 120 €; mit Vermögen „nein“ | DA-KiZ C.2.2.2 |
| Musterbescheid 2023 | `BescheidSGB2.pruefe` mit Regelbedarfen 2023 (502/451/402/420/348/318), Kindergeld 250; Personen: Erw. Lohn 500/400, Erw. sonstiges 180, Kind 7; Warmwasser dezentral; Miete 900 + 90 | Regel 1.250; Warmwasser 24,92; Einkommen 370; Kindergeld 250; Zahlbetrag 1.644,92 | BG-Muster 2/2023 |
| Musterbescheid, Werte 2026 | dieselben Personen, `Rules` unverändert; App: `adults 2, kids 1, einkommen [{lohn, 500/400, p 1}, {alg, b 180, p 2}], miete 990, warmwasser true` | Check 1.790,96; App 1.790 € | BG-Muster, umgerechnet |
| Freibetrag Minijob | `F(603, false)` | 208,90 | MB-SGB II 8/2026, 9.2 |
| Vermögen Paar | `adults 2, einkommen [], miete 600, gebJahr 1967, vermoegen 30000` | `ggeld` nicht „nein“ (nach Korrektur Befund 2: bei 35.000 nicht „ja“) | MB-SGB II 9.5 |
| GSA Hannover | `adults 1, einkommen [{rente, 690.59}], miete 380, gebJahr 1956, mzG, gdb '50'`; Check: `{mzG, renteNetto 690.59}`, Miete 330 + 50 | App 350 €, Bedarf 1.039; Check 348,12 | GSA-Han 4/2024 |
| GSA Bochum a) | Rente 550, Miete 250 + 50, Merkzeichen G | App 410 €; Check 408,71 | GSA-Bo |
| GSA Bochum b) | Check: zwei Personen mit `mzG`, Renten 800 und 350, Miete 260 + 66 | Check 360,04 | GSA-Bo |
| Wohngeld Frankfurt | `wgMiete(6, 2, 900, 1, 110)`; `wgBetrag(2, 912.4, 1503.85)`; App: `adults 2, einkommen [{rente, b 1470, n 1300, p 1}, {alg, b 620, p 2}], miete 900, heizkosten 110, mietstufe '6', gdb '100', grundrente33` | 912,40; gerundet 355; App-Spanne enthält 355 (350 bis 430) | WG-Muster 6/2025 |
| Wohngeld Hannover | `round(wgBetrag(n, kalt + wgHeiz(n), (rente − 8,5) × 0,9 − Freibetrag))` für (1; 1000; 540), (1; 1000; 540; GdB 100), (2; 1300; 600), Stufe V | 349 / 422 / 412 | WG-Han 1/2025 |
| Wohngeld München | Einkommen Y, bei dem `wgBetrag(n, wgCap(7,n)+wgHeiz(n), Y)` = 9,50 € | 1.619 / 2.181 / 2.717 / 3.671 / 4.200 / 4.717 (abgerundet) | WG-Muc 1/2025 |
| Wohngeld 12 Personen | `wgCap(3,12)`, `wgBetrag(12, 1600 + wgHeiz(12), 4688.25)` | 1.689,80; 1.204,9782 | WG-12 |
| Wohngeld 14 Personen (nach Korrektur Befund 7) | wie oben mit 14 Personen | 1.335 | WG-12 |
| Plausibilität (nach Korrektur Befund 1) | 1 Person, Rente 800 brutto, Kaltmiete 420, Heizung 80, Stufe V | Karte `wohngeld` mit Betrag rund 340 bis 350 €, nicht „Einkommen eher zu niedrig“ | WG-Han; WG-Plaus |
| Elterngeld Broschüre | `egVor 2083.33` und `1083.33` | 1.300 und 670 | EG-Br 10/2025 |
| Mehrbedarf Alleinerziehende | `derive({adults 1, kids …}).mehrAE` für 1 Kind ab 7; 1 Kind unter 6; 4 Kinder; 5 Kinder | 67,56 / 202,68 / 270,24 / 337,80 | AE-2026 |

## 6. Empfehlung

1. Befund 1 (Wohngeld-Mindesteinkommen) zuerst beheben: betrifft viele Rentner-Haushalte, amtliche Regel liegt vor.
2. Befund 2 (Vermögen bei Paaren) und Befund 3 (§ 17a im Bescheid-Check) danach.
3. Befunde 4 bis 9 gesammelt in einem kleinen PR; für 6 und 9 reicht ein Hinweistext.
4. Die Testfälle aus Abschnitt 5 als `test/test-musterbescheide.js` aufnehmen (alle ohne Internet prüfbar).
5. Offen für David: Ein echter, geschwärzter Bescheid Kinderzuschlag und Grundsicherung im Alter fehlt weiter (öffentlich nichts gefunden). `docs/BESCHEID-VERGLEICH.md` bleibt dafür der Weg.
