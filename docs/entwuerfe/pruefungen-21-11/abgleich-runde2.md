# Abgleich Runde 2: alle Leistungen gegen Bescheide, Urteile und amtliche Rechenbeispiele

Stand: 21.11.2026. Repo-Stand: `origin/claude/test-update-1.9` (2127ebf), Worktree `/home/claude/wt-abg2`. Kein Code geändert, nichts committet.
Nachrechnen: `node /home/claude/ausgabe/abgleich2/abgleich2.js /home/claude/wt-abg2` (Ergebnisse in `ergebnis.json`, Kopien der Quellen in `quellen/`).
Runde 1 (43 Fälle, 9 Befunde, werden in `claude/b-abgleich-fixes` behoben) steht in `../abgleich/bericht.md` und wird hier nicht wiederholt.

## 1. Ergebnis in Kürze

| | Anzahl |
|---|---|
| Neue Fälle in Runde 2 | 84 |
| gleich (OK) | 63 |
| nur Rundung | 3 |
| bewusste Vereinfachung, vorsichtige Seite | 7 |
| Beispiel veraltet (Wohngeld-Werte 2023) | 4 |
| **echte Abweichung** | 7 Fälle = **6 neue Befunde** (3 mittel, 3 niedrig) |

- **Kein schwerer Fehler.** Keine falsche Zusage. Alle Grundbeträge stimmen (Regelsätze, Kindergeld, Unterhaltsvorschuss, Pflegegeld, Blindengeld, Elterngeld, Freibeträge).
- **Drei mittlere Befunde**, alle auf der Seite „SoLo sagt zu wenig“: zweimal BAföG („eher nicht“, obwohl es Geld gäbe), einmal Blindengeld Bayern bei Pflegegrad 4 und 5 (66 bis 129 € zu niedrig).
- Zu den 9 Befunden aus Runde 1 habe ich **keine weiteren Belege** gefunden (weder dafür noch dagegen).
- Ehrlich: Echte Bescheide gibt es öffentlich fast nicht. Neu in dieser Runde nur zwei Urteile zu einem Wohngeldbescheid. Alles andere sind amtliche Rechenbeispiele, Merkblätter und Gesetzestexte. Bei 9 Leistungen war nur ein Abgleich von Regeln und Beträgen möglich, bei 5 gar nichts.

## 2. Abdeckung je Leistung (Runde 1 + Runde 2)

„Mit Rechenweg“ = Fall mit Zahlen, den SoLo nachgerechnet hat. „Regel“ = nur Voraussetzung oder Betrag verglichen.

| Leistung (Karte) | Fälle R1 | Fälle R2 | davon mit Rechenweg (R2) | gleich / Rundung (R2) | vereinfacht / veraltet (R2) | Befunde |
|---|---|---|---|---|---|---|
| Grundsicherungsgeld (`ggeld`) | 8 | 5 | 4 | 5 | 0 | R1: Nr. 2 |
| Wohngeld (`wohngeld`) | 15 | 5 | 5 | 1 | 4 veraltet | R1: Nr. 1, 3, 7, 8 |
| Kinderzuschlag (`kiz`) | 14 | 0 | – | – | – | R1: Nr. 4, 5, 6 |
| Kindergeld (`kindergeld`) | 1 | 4 | 1 | 4 | 0 | – |
| Unterhaltsvorschuss (`uvg`) | 1 | 6 | 4 | 3 | 3 | Hinweis H1 |
| Grundsicherung im Alter (`gsa`) | 3 | 4 | 4 | 3 | 0 | R1: Nr. 9; **neu Nr. 14** |
| Elterngeld (`elterngeld`) | 2 | 6 | 6 | 5 | 1 | – |
| Mutterschaftsgeld (`mutter`) | 0 | 4 | 1 | 4 | 0 | – |
| BAföG (`bafoeg`) | 0 | 7 | 6 | 4 | 1 | **neu Nr. 10, 11** |
| Pflegegeld, Entlastungsbetrag (`pflege`) | 0 | 3 | 1 | 3 | 0 | – |
| Hilfe zur Pflege (`hzp`) | 0 | 4 | 4 | 3 | 0 | **neu Nr. 15** |
| Landespflegegeld Bayern (`lpg`) | 0 | 3 | 0 | 2 | 1 | Hinweis H3 |
| Landesblindengeld (`blindengeld`) | 0 | 6 | 5 | 4 | 0 | **neu Nr. 12** |
| Arbeitslosengeld I (`alg1`) | 0 | 4 | 4 | 3 | 0 | **neu Nr. 13** |
| Krankengeld (`krankengeld`) | 0 | 3 | 2 | 3 | 0 | (Nr. 13 gilt mit) |
| Kinderkrankengeld (`kkg`) | 0 | 3 | 0 | 3 | 0 | – |
| Wohnberechtigungsschein (`wbs`) | 0 | 4 | 3 | 3 | 1 | Hinweis H2 |
| **≥ 3 Fälle: 17 Leistungen** | | | | | | |
| Verhinderungspflege, Hilfsmittel (`pflegeplus`) | 0 | 2 | 0 | 2 | 0 | – |
| Blindenhilfe (`blh`) | 0 | 2 | 1 | 2 | 0 | (Nr. 15 gilt mit) |
| Altersrente für schwerbehinderte Menschen (`srente`) | 0 | 2 | 2 | 2 | 0 | – |
| Kindergeld bei Behinderung (`kgBeh`) | 0 | 2 | 0 | 2 | 0 | – |
| Behinderten-Pauschbetrag (`pausch`) | 0 | 1 | 0 | 1 | 0 | – |
| Zuzahlungsbefreiung (`zuzahl`) | 0 | 1 | 0 | 1 | 0 | – |
| Asylbewerberleistungen (`asylblg`) | 0 | 1 | 0 | 1 | 0 | – |
| Berufsausbildungsbeihilfe (`bab`) | 0 | 1 | 0 | 1 | 0 | – |
| Rundfunkbefreiung (`rundfunk`) | 0 | 1 | 0 | 1 | 0 | – |
| **1 bis 2 Fälle: 9 Leistungen** | | | | | | |
| Bildung und Teilhabe (`but`) | 0 | 0 | – | – | – | ohne Beleg-Fall |
| Erwerbsminderungsrente (`emrente`) | 0 | 0 | – | – | – | ohne Beleg-Fall |
| Eingliederungshilfe (`eingl`) | 0 | 0 | – | – | – | ohne Beleg-Fall |
| Budget für Arbeit (`arbeit`) | 0 | 0 | – | – | – | ohne Beleg-Fall |
| Schwerbehindertenausweis (`ausweis`) | 0 | 0 | – | – | – | ohne Beleg-Fall |
| **0 Fälle: 5 Leistungen** | | | | | | |

Leistungen ohne Beleg-Fall, ehrlich vermerkt:
- **Bildung und Teilhabe:** kein Bescheid, kein Rechenbeispiel gefunden. Die Karte hängt nur an Wohngeld, Kinderzuschlag oder Grundsicherung; die Beträge (195 € Schulbedarf, 15 € Teilhabe) habe ich in dieser Runde nicht an einer neuen amtlichen Quelle geprüft.
- **Erwerbsminderungsrente, Eingliederungshilfe, Budget für Arbeit, Schwerbehindertenausweis:** SoLo rechnet hier nichts, sondern nennt Voraussetzungen. Öffentliche Bescheide mit nachrechenbaren Angaben gibt es nicht.
- **Hilfe zum Lebensunterhalt:** SoLo hat dafür **keine eigene Karte** (nur Hinweise in `ggeld`/`gsa`). Nichts zu vergleichen. Das Beispiel der Rentenversicherung mit gemischtem Paar (GS2) deckt den nächsten Fall ab.
- **Asylbewerberleistungen, Berufsausbildungsbeihilfe, Rundfunk, Zuzahlung:** nur Regelabgleich am Gesetz, kein Bescheid, kein Betrag in SoLo.

## 3. Quellen dieser Runde

| Kürzel | Quelle | Stand / Rechtsstand | Fundort |
|---|---|---|---|
| FW-12 | Bundesagentur für Arbeit, Fachliche Weisungen § 12 SGB II (Vermögen) | 01.07.2026 | https://www.arbeitsagentur.de/datei/fw-zu-par-12-sgb2-beruecksichtigung-von-vermoegen_ba058027.pdf |
| VG-BT | VG Bayreuth, Urteile vom 25.06.2025 (B 8 K 25.211) und 25.03.2026 (B 8 K 25.1190) | Wohngeld 2025 | https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2026-N-15416 und …-2025-N-25874 |
| WG-Do | Stadt Dortmund, Flyer „Was ist Wohngeld?“, 4 Beispiele | **2023** (veraltet) | https://www.dortmund.de/dortmund/projekte/rathaus/verwaltung/amt-fuer-wohnen/downloads/services/flyer-was-ist-wohngeld.pdf |
| KG-MB | Familienkasse, Merkblatt Kindergeld | 2026 | https://www.arbeitsagentur.de/datei/kg2-merkblattkindergeld_ba015394.pdf |
| UVG-RL | Bundesfamilienministerium, Richtlinien zum Unterhaltsvorschussgesetz | 12.12.2025 (gültig 2026; Beispiele teils mit Werten 2024) | https://tacheles-sozialhilfe.de/files/Weisungen/UVG/UVG-RL_2026%20%281%29.pdf (Kopie bei Tacheles) |
| DRV-GS | Deutsche Rentenversicherung, „Die Grundsicherung: Hilfe für Rentner“, 20. Auflage | 5/2026 | https://www.deutsche-rentenversicherung.de/SharedDocs/Downloads/DE/Broschueren/national/grundsicherung_hilfe_fuer_rentner.pdf |
| EG-Br | Bundesfamilienministerium, „Elterngeld und Elternzeit“, 28. Auflage | 10/2025 | wie Runde 1 |
| FamP | Familienportal des Bundes, Mutterschaftsleistungen | Abruf 21.11.2026 | https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen |
| BAföG-Bsp | Bundesforschungsministerium, bafög.de, „Beispiele für BAföG“ (Hanna, Alexa, Max, Stefan, Olga) | ab 1.8.2024 (gilt 2026) | https://www.bafög.de → „Von Hanna, Max und Stefan“ |
| BAföG-G | §§ 13, 25, 30 BAföG | Abruf 21.11.2026 | https://www.gesetze-im-internet.de/baf_g/ |
| Kombi | Landkreis Esslingen, Infoblatt Kombinationsleistung | 8/2025 (Werte wie 2026) | landkreis-esslingen.de |
| SGB XI | §§ 37, 40, 42a SGB XI | Abruf 21.11.2026 | https://www.gesetze-im-internet.de/sgb_11/ |
| HzP-B | Pflegestützpunkte Berlin (Land Berlin und Kassen), Informationsblatt Nr. 37 | 12/2025 (Werte 2026) | https://www.pflegestuetzpunkteberlin.de/wp-content/uploads/2026/04/DE-IB-37-Hilfe-zur-Pflege-vom-Bezirksamt.pdf |
| LPflG | Art. 2 Bayerisches Landespflegegeldgesetz | Fassung ab 01.01.2026 | https://www.gesetze-bayern.de/Content/Document/BayLPflGG-2 |
| ZBFS | Zentrum Bayern Familie und Soziales, Infoblatt Blindengeld | 01.07.2026 | https://www.zbfs.bayern.de/imperia/md/content/stmas/zbfs_2022/weitere_aufgaben/blindengeld_infoblatt_2026-07_comp.pdf |
| BlindG | Art. 4 Bayerisches Blindengeldgesetz | Abruf 21.11.2026 | https://www.gesetze-bayern.de/Content/Document/BayBlindG-4 |
| MB-Alg | Bundesagentur für Arbeit, Merkblatt 1 für Arbeitslose | Beispiel mit Lohnsteuertabelle 2025 | https://www.arbeitsagentur.de/datei/merkblatt-fuer-arbeitslose_ba015368.pdf |
| BMG-KK | Bundesgesundheitsministerium, Fragen und Antworten Kinderkrankengeld | Abruf 21.11.2026 | https://www.bundesgesundheitsministerium.de/themen/praevention/kindergesundheit/faq-kinderkrankengeld.html |
| AOK-RG | AOK-Bundesverband, Rechengrößen 2026 | 2026 | aok.de/pp (PDF) |
| DRV-SB | Rentenversicherung Knappschaft-Bahn-See, „Mit Schwerbehinderung früher in die Altersrente“ | 20.04.2026 | deutsche-rentenversicherung.de |
| SH-WBS | Land Schleswig-Holstein, Anlage 1 Einkommensgrenzen Wohnraumförderung | ab 06.01.2026 | transparenz.schleswig-holstein.de |
| BayWoFG | Art. 11 Bayerisches Wohnraumförderungsgesetz | Abruf 21.11.2026 | https://www.gesetze-bayern.de/Content/Document/BayWoFG-11 |
| betanet | betanet.de, Krankengeld-Höhe und Landesblindengeld | 2026, **nicht amtlich** | betanet.de |

Grenzen der Prüfung:
- Lange Dokumente (UVG-RL, Merkblätter, Elterngeld-Broschüre) nur an den Beispiel-Stellen gelesen.
- betanet ist nicht amtlich. Darauf stützen sich nur KR1 (Krankengeld-Beispiel), BG6 (andere Länder) und BH1; kein Befund hängt daran.
- Dortmund: Mietenstufe III angenommen, nicht amtlich nachgeschlagen. Die Beispiele sind von 2023; SoLo rechnet mit den Werten ab 2025. Die Abstände (16 bis 50 €) passen zur Erhöhung 2025, sind aber kein genauer Beweis.
- BAföG: Als „Netto“ habe ich das Einkommen im Sinne des BAföG aus dem Beispiel eingesetzt. Das echte Netto liegt meist etwas höher.
- § 4 Rundfunkbeitragsstaatsvertrag und die BuT-Beträge in dieser Runde nicht neu abgerufen.
- Nicht abrufbar: Einlegeblatt zum Merkblatt SGB II, Flyer Stuttgart und Nürnberg (Wohngeld), Merkblatt UVG Bremen.

## 4. Alle Fälle der Runde 2

Urteil: OK = gleich, RUND = nur Rundung, VEREINF = bewusste Vereinfachung, ALT = Beispiel veraltet, **FEHLER** = Befund.

### Grundsicherungsgeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| GG1 | Eltern 35 und 37, Kind 5, Vermögen 45.000 € (FW-12 Rz. 12.37) | Freibeträge 25.000 €, nicht hilfebedürftig | „eher nicht“, Vermögen zu hoch | OK |
| GG2 | dieselbe Familie, 25.000 € (eigene Fortführung) | frei | „wahrscheinlich“, 1.810 € | OK |
| GG3 | Freibetrag ab dem 30. Geburtstag (FW-12 Rz. 12.36) | 29 Jahre 5.000 €, ab 30: 10.000 € | 9.000 € mit 29: zu hoch; mit 30: frei | OK |
| GG4 | Mehrbedarf Schwangerschaft (FamP; § 21 Abs. 2 SGB II) | 95,71 € | Bedarf 1.109 €, Anzeige 96 € | RUND |
| GG5 | Regelsätze, Mehrbedarf G (HzP-B) | 563 / 95,71 / 451 / 76,67 € | gleich | OK |

### Wohngeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| WG1 | Bescheid laut Urteil: 1 Person, Miete 408,83 € davon Heizung 81,23 € (VG-BT) | zu berücksichtigende Miete 438,00 €; Wohngeld 245 € | Miete 438,00 €; 245 € passen zu 796 € Einkommen | OK (Miete auf den Cent; Betrag nicht prüfbar, Einkommen fehlt im Urteil) |
| WG2 | Rentner, 1.100 € brutto, Miete 500 € (WG-Do) | 236 € (2023) | Formel 2025: 266 €; App 270 bis 320 € | ALT |
| WG3 | Arbeitslosengeld 900 €, Miete 450 € (WG-Do) | 271 € (2023) | 287 €; App 290 € | ALT |
| WG4 | 4 Personen, Lohn 3.000 € brutto, Miete 800 € (WG-Do) | 487 € (2023) | 537 €; App 330 bis 540 € | ALT |
| WG5 | Alleinerziehend, 2 Kinder, Unterhalt 900 + 700 €, Miete 700 € (WG-Do) | 455 € (2023) | 496 €; App 460 bis 530 € | ALT |

### Kindergeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| KG1 | Höhe (KG-MB) | 259 € je Kind | 259 € | OK |
| KG2 | Rückwirkung (KG-MB) | höchstens 6 Monate | Tipp nennt 6 Monate | OK |
| KG3 | Altersgrenzen (KG-MB) | 18 / 21 / 25, Pause 4 Monate | gleich | OK |
| KG4 | Asylverfahren oder Duldung (KG-MB) | nur mit bestimmten Titeln | „möglich“ mit Hinweis | OK |

### Unterhaltsvorschuss
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| UV1 | Beträge 2026 (UVG-RL 2.1) | 227 / 299 / 394 € | gleich | OK |
| UV2 | Kind in Ausbildung, 700 € ausgezahlt (UVG-RL 2.5.4.4) | Anrechnung 248,75 €; mit Werten 2026: 146 € | Anrechnung 248,75 €; 145,25 € | RUND (Amt rundet auf) |
| UV3 | Kinder 13 und 8, Vater zahlt 400 € (UVG-RL 2.3) | 175 + 119 = 294 € | Karte „möglich“ (richtig); interne Schätzung 198 € | VEREINF (Hinweis H1) |
| UV4 | 145 Tage beim Vater / ab 146 Tagen (UVG-RL 1.3.1) | Anspruch / kein Anspruch | ohne Haken „wahrscheinlich“, mit Haken „eher nicht“ | OK |
| UV5 | Kind 17 im Bürgergeld-Bedarf, Elternteil unter 600 € (UVG-RL 1.7.3) | kein Zugang | „möglich“ mit Hinweis auf 600 € | VEREINF |
| UV6 | Geburtsmonat, 11 Tage (UVG-RL 2.2) | anteilig, hier nichts | nicht abgebildet | VEREINF |

### Grundsicherung im Alter
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| GS1 | Gerda M., Merkzeichen G, Rente 325 € (DRV-GS S. 16) | 868,71 € | App 870 €; Check 868,71 € | OK |
| GS2 | Max B. und Inge M., Renten 480 und 765 € (DRV-GS S. 17) | 283 € | App 280 €; Check 283 € | OK |
| GS3 | Harald F., Bruttorente 870 €, 33 Jahre (DRV-GS S. 18) | Freibetrag 281,50 €; 663,50 € | App 660 €; Check 663,50 € | OK |
| GS4 | wie GS3 mit Bruttorente 600 € (eigene Fortführung) | Freibetrag 250,00 €; 873,00 € | Freibetrag 230,50 €; Check 853,50 €; App 850 € | **FEHLER** (Nr. 14) |

### Elterngeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| EG1 | Elterngeld-Netto 700 € (EG-Br 1.4.2) | 82 % = 574 € | 574 € | OK |
| EG2 | Elterngeld-Netto 2.500 € (EG-Br 2.2) | 1.625 € | 1.625 € | OK |
| EG3 | über 2.770 € (EG-Br 2.1) | höchstens 1.800 € | 1.800 € | OK |
| EG4 | ein Geschwisterkind unter 3 (EG-Br 1.4.4) | 1.430 € | 1.300 € plus Hinweis auf den Bonus | VEREINF |
| EG5 | zwei Geschwister unter 6 | 1.430 € | 1.430 € | OK |
| EG6 | Mindestbetrag, Einkommensgrenze | 300 €; 175.000 € | gleich | OK |

### Mutterschaftsgeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| MU1 | Netto 1.800 € (FamP) | 13 € Kasse + 47 € Arbeitgeber am Tag | „wahrscheinlich“, 13 € am Tag, Rest Arbeitgeber | OK |
| MU2 | privat oder familienversichert | höchstens 210 € | 210 € | OK |
| MU3 | Schutzfristen | 6 / 8 / 12 Wochen | gleich | OK |
| MU4 | ohne Arbeit | kein Mutterschaftsgeld, Mehrbedarf | „eher nicht“ mit Hinweis | OK |

### BAföG
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| BA1 | Freibeträge (§ 25 BAföG) | 2.540 / 1.690 / 770 € | gleich | OK |
| BA2 | Alexa, Elterneinkommen 3.106 €, 2 Geschwister | 666 € | „wahrscheinlich“ | OK |
| BA3 | Olga, Elterneinkommen 2.689 € | 459 € | „möglich“ | OK |
| BA4 | Stefan, Elterneinkommen 3.324 €, 1 Bruder | 361 € | „möglich“ | OK |
| BA5 | Stefan selbst, Vermögen 17.000 € | 2.000 € über dem Freibetrag: 166,67 € im Monat weniger, 361 € bleiben | **„eher nicht – Vermögen über 15.000 €“** | **FEHLER** (Nr. 11) |
| BA6 | Studentin auswärts, Eltern 1.500 € über dem Freibetrag (eigene Fortführung, § 25 Abs. 4) | Anrechnung 750 €, 105 € bleiben | **„eher nicht – es bleibt nichts übrig“** | **FEHLER** (Nr. 10) |
| BA7 | Hanna, Bruder verdient selbst | 801 € | „wahrscheinlich“ | VEREINF |

### Pflege, Hilfe zur Pflege, Blindenhilfe
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| PF1 | Pflegegrad 3, Pflegedienst 1.092,81 € (Kombi) | 161,73 € Pflegegeld | 161,73 € | OK |
| PF2 | Pflegegeld (§ 37 SGB XI) | 347 / 599 / 800 / 990 € | gleich | OK |
| PF3 | Pflegegrad 1 (AOK-RG) | 131 € Entlastungsbetrag | gleich | OK |
| PP1 | Jahresbetrag (§ 42a SGB XI) | 3.539 € | gleich | OK |
| PP2 | Pflegehilfsmittel (§ 40 SGB XI) | 42 € | gleich | OK |
| HP1 | allein, Unterkunft 500 € (HzP-B) | Grenze 1.626 € | 1.626 € | OK |
| HP2 | Ehepaar | 2.021 € | 2.020,10 € | RUND |
| HP3 | Warmmiete 600 € davon Heizung 100 €, Netto 1.680 € | Grenze 1.626 €, Einkommen darüber | Grenze 1.726 €, „unter der Grenze“ | **FEHLER** (Nr. 15) |
| HP4 | Schonvermögen Ehepaar | 20.000 € | gleich | OK |
| BH1 | Blindenhilfe ab 7/2026 (betanet, ZBFS) | 951,92 / 476,78 € | gleich | OK |
| BH2 | Bayern: Rest nach Blindengeld | 142,92 € | 142,92 € | OK |

### Landespflegegeld, Landesblindengeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| LP1 | Pflegegrad 2 in Bayern (LPflG) | 500 € im Jahr | „wahrscheinlich“, 500 € | OK |
| LP2 | Pflegegrad 1 / anderes Land | kein Anspruch | „eher nicht“ | OK |
| LP3 | Auszahlung | bis 31. Januar des Folgejahres | steht nicht im Text | VEREINF (Hinweis H3) |
| BG1 | Bayern blind / hochgradig sehbehindert (ZBFS) | 809 / 242,70 € | gleich | OK |
| BG2 | Pflegegrad 2 | 649,38 / 83,08 € | gleich | OK |
| BG3 | Pflegegrad 3 (BlindG Art. 4) | Kürzung 197,67 €, Rest 611,33 € | gleich | OK |
| BG4 | Pflegegrad 4 | Kürzung 197,67 €, Rest 611,33 € | Kürzung 264,00 €, Rest 545,00 € | **FEHLER** (Nr. 12) |
| BG5 | Pflegegrad 5 | Kürzung 197,67 €, Rest 611,33 € | Kürzung 326,70 €, Rest 482,30 € | **FEHLER** (Nr. 12) |
| BG6 | andere Länder (betanet) | BW 410, HE 818,65, MV 430, NI 450, RP 410, SH 350 € | gleich | OK |

### Arbeitslosengeld, Krankengeld, Kinderkrankengeld
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| AL1 | 16 Monate gearbeitet (MB-Alg) | 8 Monate | 8 Monate | OK |
| AL2 | 48 Monate ab 58 / 36 Monate ab 55 | 24 / 18 Monate | gleich | OK |
| AL3 | 2.400 € brutto, Steuerklasse III, Kind (MB-Alg Abschnitt 4) | 42,88 € am Tag = 1.286,40 € | Spanne 960 bis 1.160 € | **FEHLER** (Nr. 13) |
| AL4 | vorher Minijob | kein Anspruch daraus | „möglich“ mit Hinweis | OK |
| KR1 | brutto 3.000, netto 2.100 € (betanet) | 1.655,70 € | Spanne 1.420 bis 1.700 € | OK |
| KR2 | Höchstbetrag (AOK-RG) | 135,63 € am Tag | gleich | OK |
| KR3 | Minijob | kein Krankengeld | „eher nicht“ | OK |
| KK1 | Tage 2026 (BMG-KK) | 15 / 35; allein 30 / 70 | gleich | OK |
| KK2 | Höhe | 90 % vom Netto, höchstens 135,63 € | gleich | OK |
| KK3 | Minijob | kein Anspruch | „eher nicht“ | OK |

### Rente, Wohnberechtigungsschein, kleine Karten
| Nr. | Fall (Quelle) | Amtlich | SoLo | Urteil |
|---|---|---|---|---|
| SR1 | Jahrgang 1964 (DRV-SB) | 65 / 62 Jahre, höchstens 10,8 % | gleich | OK |
| SR2 | Jahrgänge 1960 und 1963 | 64 J. 4 M. / 64 J. 10 M. | gleich | OK |
| WB1 | Schleswig-Holstein, 7 Haushaltstypen (SH-WBS) | 23.000 bis 53.200 € | alle 7 gleich | OK |
| WB2 | allein, Angestellte, 34.087 € brutto | 1. Förderweg | „möglich“, nennt 2. Förderweg | VEREINF (Hinweis H2) |
| WB3 | Paar, 2 Kinder, 68.230 / 100.000 € | Basis eingehalten / zu hoch | „möglich“ / „eher nicht“ | OK |
| WB4 | Bayern, höchste Grenze (BayWoFG) | 28.300 / 43.200 / 10.700 / 3.200 € | gleich | OK |
| PB1 | Pauschbetrag (§ 33b EStG) | 384 bis 2.840; 7.400 € | gleich | OK |
| KB1 | Kindergeld bei Behinderung (KG-MB 4.6) | Grundfreibetrag 12.348 € | gleich | OK |
| KB2 | Behinderung nach dem 25. Geburtstag | kein Anspruch | „eher nicht“ | OK |
| ZZ1 | Belastungsgrenze (AOK-RG) | 2 % / 1 % | Text gleich, kein Betrag | OK |
| AS1 | Analogleistungen (§ 2 AsylbLG) | nach 36 Monaten | Text gleich | OK |
| BB1 | BAB: bei den Eltern / nicht (§ 60 SGB III) | nein / ja | „eher nicht“ / „möglich“ | OK |
| RF1 | Rundfunk bei Grundsicherungsgeld | Befreiung | „bekommst du“ | OK |

## 5. Neue Befunde (Nummern schließen an Runde 1 an)

| Nr. | Schwere | Was | Fundstelle | Amtliche Quelle | Korrekturvorschlag |
|---|---|---|---|---|---|
| 10 | **mittel** | BAföG, Elterneinkommen: SoLo sagt „eher nicht – es bleibt voraussichtlich nichts übrig“, sobald das Einkommen mehr als 1.200 € über dem Freibetrag liegt. Amtlich bleibt die Hälfte des Betrags über dem Freibetrag frei (plus 5 % je Kind mit Freibetrag). Bei einem Bedarf von 855 bis 992 € gibt es BAföG bis rund 1.700 bis 2.200 € über dem Freibetrag. Beispiel: 1.500 € darüber → 105 € (mit eigener Krankenversicherung 242 €). Falsche Absage. | `src/rules.js` Z. 229 (`spanne: 1200`), Z. 1307–1308; Text `t.bafoeg.kindNein` | § 25 Abs. 4 BAföG; bafög.de „Welche Freibeträge werden gewährt?“ und Beispiele Hanna, Olga, Stefan | `spanne` auf 2.200 € anheben (992 € : 0,45). Genauer: `992 / (0,5 − 0,05 × Kinder mit Freibetrag)`. Text `kindNein` erst darüber. |
| 11 | **mittel** | BAföG, eigenes Vermögen: SoLo sagt „eher nicht“, sobald Vermögen plus Auto über 15.000 € (ab 30: 45.000 €) liegt. Amtlich wird nur der Betrag **über** dem Freibetrag angerechnet, verteilt auf die Monate des Bewilligungszeitraums. Beispiel Stefan: 17.000 € → 166,67 € im Monat weniger, 361 € BAföG bleiben. | `src/rules.js` Z. 1315–1316; Text `t.bafoeg.vermHoch` | § 30 BAföG; bafög.de Beispiel „Stefan (19)“ | „eher nicht“ erst, wenn der Betrag über dem Freibetrag größer ist als 12 × 992 € (rund 12.000 €). Dazwischen „möglich“ mit Hinweis „Vermögen über {verm} mindert das BAföG“. |
| 12 | **mittel** | Blindengeld Bayern bei Pflegegrad 4 und 5: SoLo kürzt um 33 % des Pflegegeldes des **eigenen** Pflegegrads (264,00 € bzw. 326,70 €). Das Gesetz kürzt bei Pflegegrad 3, 4 und 5 einheitlich um 33 % des Pflegegeldes von **Pflegegrad 3** (197,67 €). SoLo zeigt 545 € bzw. 482,30 € statt 611,33 €. Gilt genauso für hochgradig Sehbehinderte (45,03 € statt Mindestbetrag 20 €). | `src/rules.js` Z. 1651 | Art. 4 Abs. 1 Satz 2 BayBlindG; ZBFS-Infoblatt 7/2026 | `const anrech = h.pflegegrad === 2 ? 0.46 * R.pflege.geld[2] : 0.33 * R.pflege.geld[3];` |
| 13 | niedrig bis mittel | Arbeitslosengeld I, Höhe: SoLo nimmt über 2.000 € Brutto höchstens 72 % Netto an. Das Amt zieht pauschal 20 % Sozialversicherung plus Lohnsteuer ab. In Steuerklasse III (oft keine Lohnsteuer) sind das 80 %. Amtliches Beispiel: 1.286 €, SoLo-Spanne endet bei 1.160 €. Dieselbe Annahme deckelt auch die Krankengeld-Spanne. Folgefehler: Die Rechnung „sobald gezahlt“ für Wohngeld, Kinderzuschlag, Grundsicherungsgeld nimmt die Mitte dieser zu niedrigen Spanne. | `src/rules.js` Z. 84 (`netto: [0.6, 0.72]`), Z. 1374, Z. 1401–1404, Z. 1429–1433 | Merkblatt 1 für Arbeitslose, Abschnitt 4 (Beispiel) und 4.2 | Obere Grenze für alle Löhne 80 % (Steuerklasse III ohne Lohnsteuer). Oder die Lohnsteuer mit `nettoLohn` je Steuerklasse rechnen, Sozialpauschale fest 20 %. |
| 14 | niedrig | Grundsicherung im Alter, Freibetrag bei 33 Jahren Grundrentenzeiten: SoLo rechnet 100 € + 30 % aus der **Netto**-Rente, amtlich aus der **Brutto**-Rente. Unterschied nur bei Bruttorenten unter rund 705 € (darüber greift der Deckel 281,50 €). Beispiel 600 € brutto: 19,50 € zu wenig. Vorsichtige Seite. Betrifft App und Bescheid-Check. | `src/rules.js` Z. 1232; `erweiterungen/bescheid-gsa.js` Z. 13, 31 (nur Feld `renteNetto`) | § 82a Abs. 1 SGB XII; Broschüre Rentenversicherung S. 18 („Brutto Rente 870,00“) | App: Freibetrag aus `x[1]` (Brutto) statt `n`. Bescheid-Check: Feld „Rente brutto“ ergänzen, sonst in „Nicht geprüft“ nennen. |
| 15 | niedrig | Hilfe zur Pflege und Blindenhilfe, Einkommensgrenze: SoLo setzt die ganze Warmmiete an. Amtlich zählen die Kosten der Unterkunft **ohne Heizung**. Mit angegebenen Heizkosten liegt die Grenze um diese zu hoch; der Text sagt dann „unter der Grenze“ statt „darüber“. Einstufung bleibt „möglich“. Nebenbei: Familienzuschlag 394,10 € statt 395 € (aufrunden). | `src/rules.js` Z. 1486, Z. 1539 | § 85 Abs. 1 Nr. 2 und 3 SGB XII; Informationsblatt Nr. 37 Berlin („Kosten der Unterkunft (ohne Heizung)“, „395,00 €“) | `h.miete − h.heizkosten` verwenden (ohne Angabe: minus Heizkostenkomponente, wie beim Wohngeld). `Math.ceil(0.7 × Regelsatz)`. |

Hinweise ohne Fehler-Rang (bewusste Vereinfachungen, die man mit wenig Aufwand verbessern kann):

| Nr. | Was | Fundstelle | Quelle | Vorschlag |
|---|---|---|---|---|
| H1 | Unterhaltsvorschuss als Einkommen der Kinder: Ein Kind von 12 oder 13 Jahren zählt intern mit 299 statt 394 €. Die Schätzung liegt bis 95 € zu niedrig, Kinderzuschlag und Grundsicherungsgeld dadurch leicht zu hoch. Die Karte selbst ist richtig. | `src/rules.js` Z. 643–645 | UVG-RL 2.1, 2.3 | Ist „ein Kind ist 12 oder älter“ angekreuzt und kein Kind 14 bis 17: ein Kind der mittleren Gruppe mit 394 € rechnen (oder Spanne). |
| H2 | Wohnberechtigungsschein: SoLo zieht 30 % ab, aber nicht den Arbeitnehmer-Pauschbetrag (1.230 €). Knapp an der Grenze nennt SoLo die nächsthöhere Stufe. Einstufung „möglich“ bleibt richtig. | `src/rules.js` Z. 1794, 1815 | SH-WBS, Fußnote zur Tabelle | Bei Lohn vor dem Abzug 1.230 € je erwerbstätiger Person abziehen. |
| H3 | Landespflegegeld: Es fehlt, dass das Geld für ein Jahr erst bis Ende Januar des Folgejahres kommt. | Text `t.lpg.antrag` | Art. 2 Abs. 4 BayLPflGG | Satz ergänzen. |
| H4 | Elterngeld: Bonus bei einem Geschwisterkind unter 3 nur als Hinweis (130 € weniger). | `src/rules.js` Z. 1462–1467 | EG-Br 1.4.4 | Optional Frage „Geschwisterkind unter 3?“. |

## 6. Vorschläge für neue Testfälle

Eingaben für `Rules.evaluate` mit `heute: 2026.9`, `vermoegen: 0`, wenn nichts anderes steht. Vollständig lauffähig in `abgleich2.js`.

| Test | Eingaben | Erwartet | Quelle |
|---|---|---|---|
| Vermögen Familie | `adults 2, kids 1, kidsU6 1, gebJahr 1989, miete 700, vermoegen 45000` / `25000` | `ggeld` „nein/vermHoch“ / nicht „vermHoch“ | FW-12 Rz. 12.37 |
| Vermögen 30. Geburtstag | allein, `vermoegen 9000`, `gebJahr 1997` / `1996` | „vermHoch“ / frei | FW-12 Rz. 12.36 |
| Wohngeld-Miete Urteil | `wgMiete(2, 1, 408.83, 1, 81.23)` | 438,00 | VG Bayreuth 25.06.2025 |
| UVG Ausbildung | `adults 1, kids 1, kids14 1, kinder12, ausbildung 'kindBetrieb', kindEink 700, unterhaltFehlt` | `derive().uvgKindAnr` 248,75; `uvgEst` 145,25 | UVG-RL 2.5.4.4 |
| UVG Wechselmodell | 1 Kind, `unterhaltFehlt`, mit und ohne `uvgWechsel` | „nein“ / „ja“ | UVG-RL 1.3.1 |
| UVG zwei Kinder (nach H1) | `kids 2, kinder12, unterhalt 400, unterhaltFehlt` | `uvgEst` 293 (394 + 299 − 400) | UVG-RL 2.3 |
| Grundsicherung Gerda M. | `rente 325/325, miete 535, heizkosten 35, gebJahr 1958, mzG, gdb '50'`; Check `{mzG, renteNetto 325}`, Miete 500 + 35 | App 870 €; Check 868,71 | DRV-GS S. 16 |
| Grundsicherung Paar | Renten 480 (P1) und 765 (P2), `miete 516, gebJahr 1958, erwerbsgemindert` | App 280 €; Check 283,00 | DRV-GS S. 17 |
| Grundsicherung Harald F. | `rente b 870, n 776, grundrente33, miete 595, gebJahr 1955` | App 660 €; Check 663,50 | DRV-GS S. 18 |
| Grundrente brutto (nach Nr. 14) | `rente b 600, n 535, grundrente33`, sonst wie oben | 873,00 (App 870 €) | § 82a SGB XII |
| Elterngeld klein | `egVor 783.33` | 574 | EG-Br 1.4.2 |
| Elterngeld 65 % | `egVor 2583.33` | 1.625 | EG-Br 2.2 |
| Elterngeld Geschwister | `egVor 2083.33, kids 2, kidsU6 2, baby 'bald'` | 1.430 | EG-Br 1.4.4 |
| Mutterschaftsgeld | allein, `baby 'bald'`, Lohn 2.500/1.800 | „ja“, `tag` 13, `bas` 210, 6/8/12 | FamP |
| BAföG Alexa | `adults 2, young 1, kids 2, ausbildung 'kind'`, Netto 3.106,28 | „ja“ | bafög.de |
| BAföG Olga | `adults 2, young 1`, Netto 2.689,39 | „vielleicht“ | bafög.de |
| BAföG Teilförderung (nach Nr. 10) | Netto 4.040 (1.500 über dem Freibetrag) | nicht „nein“ | § 25 Abs. 4 BAföG |
| BAföG Vermögen (nach Nr. 11) | `ausbildung 'ich', gebJahr 2007, vermoegen 14500, autoWert 2500` | nicht „nein“ | bafög.de Stefan; § 30 BAföG |
| Kombinationsleistung | `pflegeKombi(3, 1092.81)` | 161,73 | Landkreis Esslingen |
| Hilfe zur Pflege | allein, `miete 500, pflegegrad '3'`; Ehepaar | Grenze 1.626; 2.021 (nach Nr. 15) | HzP-B |
| Hilfe zur Pflege Heizung (nach Nr. 15) | `miete 600, heizkosten 100`, Netto 1.680 | Grenze 1.626, Text `hzp.ueber` | § 85 SGB XII |
| Blindengeld Bayern | `blind 'blind', bundesland 'BY'`, `pflegegrad` leer / 2 / 3 | 809; Rest 649,38; 611,33 | ZBFS 7/2026 |
| Blindengeld PG 4, 5 (nach Nr. 12) | `pflegegrad '4'` / `'5'` | Kürzung 197,67; Rest 611,33 | Art. 4 BayBlindG |
| Sehbehindertengeld PG 2 | `blind 'hoch', pflegegrad '2'` | Rest 83,08 | ZBFS 7/2026 |
| Landespflegegeld | `pflegegrad '2', bundesland 'BY'` / `'HE'` | „ja“, 500 / „nein“ | Art. 2 BayLPflGG |
| Arbeitslosengeld Dauer | `arbeitSit 'arbeitslos', algZeit, algMonate 16` / `48, gebJahr 1966` | 8 / 24 Monate | MB-Alg |
| Arbeitslosengeld Höhe (nach Nr. 13) | `lohnVorher 2400, kids 1` | Spanne enthält 1.286 | MB-Alg Abschnitt 4 |
| Krankengeld | `lohnVorher 3000, arbeitSit 'krank', krankWochen 'laeuft'` | Spanne enthält 1.656 | § 47 SGB V (Beispiel betanet) |
| Kinderkrankengeld | `kids 1, kindKrank`, Lohn über Minijob, 1 und 2 Erwachsene | 30/70 und 15/35 Tage; 90 %; 135,63 | BMG-KK; AOK-RG |
| Rente Schwerbehinderung | `gdb '50', gebJahr 1960` / `1963` / `1964` | 64+4 / 64+10 / 65+0; früh 61+4 / 61+10 / 62+0 | DRV-SB; § 236a SGB VI |
| WBS Schleswig-Holstein | `bundesland 'SH'`, 7 Haushaltstypen | 23.000 / 32.000 / 32.800 / 37.700 / 38.600 / 45.500 / 53.200 | SH-WBS 2026 |
| Pauschbetrag | `R.RULES.beh.pausch` | 384 / 620 / 860 / 1.140 / … / 2.840 / 7.400 | § 33b EStG |

## 7. Empfehlung

1. Befunde 10, 11, 12 zuerst (je wenige Zeilen, amtliche Regel eindeutig). 10 und 11 sind falsche Absagen beim BAföG.
2. Befund 13 danach: betrifft jede Schätzung von Arbeitslosengeld und Krankengeld über 2.000 € Brutto.
3. Befunde 14, 15 und Hinweise H1 bis H4 gesammelt in einem kleinen PR.
4. Testfälle aus Abschnitt 6 als zweiten Block in `test/test-musterbescheide.js` (alle ohne Internet prüfbar).
5. Offen für David: Echte, geschwärzte Bescheide fehlen weiter für fast alle Leistungen. Am meisten bringen würden: Kinderzuschlag, Grundsicherung im Alter, Unterhaltsvorschuss, BAföG, Arbeitslosengeld I, Bildung und Teilhabe (`docs/BESCHEID-VERGLEICH.md`).
6. Prüfen lassen (Weichenstellung): Für Bildung und Teilhabe, Erwerbsminderungsrente, Eingliederungshilfe, Budget für Arbeit und Schwerbehindertenausweis gibt es keinen Beleg-Fall. Dort trägt allein die Prüfliste.
