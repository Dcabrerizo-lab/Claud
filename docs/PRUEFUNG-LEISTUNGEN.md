# Prüfung aller Leistungen: Beträge, Rechenlogik, Wechselwirkungen

Stand: 17.11.2026. Geprüft am Gesetzestext (gesetze-im-internet.de, abgerufen am 17.11.2026), an den Abgleichen mit den amtlichen Rechnern und mit der unabhängigen Referenzrechnung (`test/referenz.js`).

## 1. Ergebnis in Kürze

- **Beträge:** Alle am Gesetzestext prüfbaren Beträge stimmen.
- **Rechenlogik:** Fünf Fehler gefunden und behoben (Abschnitt 4). Der wichtigste betrifft den Kinderzuschlag: Anderes Einkommen der Eltern wurde nur zu 45 % statt voll angerechnet.
- **Wechselwirkungen:** Ausschlüsse, Vorrang und Anrechnung zwischen den Leistungen sind richtig abgebildet (Abschnitt 3). Beim Rundfunkbeitrag fehlten drei Befreiungsgründe in der Einstufung.

## 2. Beträge (Stand 2026)

| Wert in der App | Betrag | Rechtsquelle | geprüft |
|---|---|---|---|
| Regelbedarfe Stufe 1–6 | 563 / 506 / 451 / 471 / 390 / 357 € | RBSFV 2026, Anlage zu § 28 SGB XII | wie 2025 (Nullrunde) |
| Kindergeld | 259 € | § 6 Abs. 1 BKGG | ✓ Gesetzestext |
| Kinderzuschlag höchstens | 297 € je Kind | § 6a Abs. 2 BKGG | ✓ |
| Anrechnung Kinderzuschlag | 45 % Arbeit, 100 % anderes Einkommen | § 6a Abs. 3, 6 BKGG | ✓ Gesetzestext, **korrigiert** |
| Freibetrag Arbeit SGB II | 100 € + 20 / 30 / 10 % bis 1.200 (1.500) € | § 11b Abs. 2, 3 SGB II | ✓ Gesetzestext |
| Schonvermögen SGB II | 5.000 / 10.000 / 12.500 / 20.000 € | § 12 Abs. 2 SGB II | ✓ Gesetzestext |
| Mehrbedarf Alleinerziehende | 36 % bzw. 12 % je Kind, höchstens 60 % | § 21 Abs. 3 SGB II | ✓ Gesetzestext |
| Mehrbedarf Warmwasser | 2,3 / 1,4 / 1,2 / 0,8 % | § 21 Abs. 7 SGB II | ✓ Gesetzestext |
| Mehrbedarf Merkzeichen G | 17 % | § 30 Abs. 1 SGB XII | ✓ Gesetzestext |
| Freibetrag zusätzliche Altersvorsorge | 100 € + 30 %, höchstens 281,50 € | § 82 Abs. 4 SGB XII | ✓ Gesetzestext, **neu** |
| Pflegegeld | 347 / 599 / 800 / 990 € | § 37 SGB XI | ✓ Gesetzestext |
| Pflegesachleistung | 796 / 1.497 / 1.859 / 2.299 € | § 36 SGB XI | ✓ Gesetzestext |
| Tages- und Nachtpflege | 721 / 1.357 / 1.685 / 2.085 € | § 41 SGB XI | ✓ Gesetzestext |
| Entlastungsbudget | 3.539 € im Jahr | § 42a SGB XI | ✓ Gesetzestext |
| Entlastungsbetrag | 131 € | § 45b SGB XI | ✓ Gesetzestext |
| Elterngeld | 67 / 65 %, 300–1.800 €, Grenzen 1.000 / 1.200 € | § 2 BEEG | ✓ Gesetzestext |
| Kinderkrankengeld 2026 | 15 / 30 Tage, höchstens 35 / 70 | § 45 Abs. 2a SGB V | ✓ Gesetzestext |
| Kinderkrankengeld ab 2027 | 10 / 20 Tage, höchstens 25 / 50 | § 45 Abs. 2 SGB V | ✓ Gesetzestext |
| Arbeitslosengeld I | 60 / 67 % | § 149 SGB III | ✓ Gesetzestext |
| BAföG Freibeträge Eltern | 2.540 / 1.690 € + 770 € je Kind | § 25 BAföG | ✓ Gesetzestext |
| BAföG Vermögen | 15.000 / 45.000 € | § 29 BAföG | ✓ Gesetzestext |
| Grundfreibetrag Einkommensteuer | 12.348 € | § 32a EStG | ✓ Gesetzestext |
| Pflege-Pauschbetrag | 600 / 1.100 / 1.800 € | § 33b Abs. 6 EStG | ✓ Gesetzestext |
| Unterhaltsvorschuss | 227 / 299 / 394 € | § 2 UVG: Mindestunterhalt minus Kindergeld | Rechenweg ✓; Mindestunterhalt 2026 (486 / 558 / 653 €) nicht abrufbar, aus der Düsseldorfer Tabelle 2026 |
| Wohngeld (Höchstbeträge, Formel) | Anlagen 1–3 WoGG | §§ 12, 19 WoGG | ✓ 7.060 Fälle des amtlichen Wohngeldrechners, höchstens 1 € Abweichung |
| Blindenhilfe | 951,92 € (ab 7/2026) | § 72 SGB XII (585 € Stand 2004, angepasst wie die Renten) | Rechenweg plausibel, Betrag aus der Bekanntmachung |
| Landesleistungen (Blindengeld, Landespflegegeld, WBS) | je Land | Landesrecht | nicht auf gesetze-im-internet.de; Quellen in `docs/WBS-GRENZEN.md` und `rules.js` |

## 3. Wechselwirkungen

### Ausschlüsse (nur eine von beiden)

| Leistung A | Leistung B | Regel | in der App |
|---|---|---|---|
| Grundsicherungsgeld | Wohngeld | § 7 Abs. 1 WoGG | ✓ Ausschluss bei Bezug; Hinweis „vergleichen“ |
| Grundsicherungsgeld | Kinderzuschlag | § 6a Abs. 1 Nr. 3 BKGG | ✓ Ausschluss bei Bezug; Kinderzuschlag nur, wenn er die Hilfebedürftigkeit beendet |
| Grundsicherung im Alter | Wohngeld | § 7 Abs. 1 WoGG | ✓ Hinweis „beides prüfen lassen“ |
| Grundsicherungsgeld | Grundsicherung im Alter | §§ 7, 19 SGB II, § 41 SGB XII | ✓ nach Alter und Erwerbsminderung |
| Landesblindengeld | Blindenhilfe | § 72 Abs. 1 SGB XII | ✓ Landesblindengeld wird angerechnet |

### Vorrang und Voraussetzung

| Leistung | setzt voraus oder folgt aus | in der App |
|---|---|---|
| Kinderzuschlag | Kindergeld | ✓ Hinweis „Kindergeld zuerst“ |
| Kinderzuschlag | endet die Hilfebedürftigkeit (auch mit Wohngeld) | ✓ mit 300 € Puffer für Wohngeld |
| Wohngeld und Kinderzuschlag | beide zusammen möglich | ✓ Hinweis „beide beantragen“ |
| Bildung und Teilhabe | Grundsicherungsgeld, Grundsicherung im Alter, Wohngeld oder Kinderzuschlag | ✓ |
| Kita ohne Beitrag | Grundsicherung, Wohngeld, Kinderzuschlag, AsylbLG (§ 90 Abs. 4 SGB VIII) | ✓ |
| Rundfunkbefreiung | Grundsicherung, AsylbLG, Blindenhilfe, Hilfe zur Pflege, BAföG nicht bei den Eltern (§ 4 RBStV) | ✓ **ergänzt**: Blindenhilfe, Hilfe zur Pflege, BAföG |
| Hilfe zur Pflege | nach den Leistungen der Pflegeversicherung | ✓ |

### Was wo als Einkommen zählt

| Einkommen | Grundsicherungsgeld | Grundsicherung im Alter | Wohngeld | Kinderzuschlag |
|---|---|---|---|---|
| Lohn | nach Freibetrag § 11b | 30 % frei, höchstens 281,50 € | nach Werbungskosten und Pauschalabzug | nach Freibetrag; über dem Bedarf zu 45 % |
| Rente | voll, 30 € Pauschale | voll; Grundrentenfreibetrag; **Betriebs-/Riester-Rente mit Freibetrag** | nach Werbungskosten und Pauschalabzug | **über dem Bedarf voll** |
| Arbeitslosengeld I, Krankengeld | voll, 30 € Pauschale | voll | voll | **über dem Bedarf voll** |
| Elterngeld | über 300 € (wenn vorher Arbeit) | über 300 € | über 300 € | über 300 €; **über dem Bedarf voll** |
| Kindergeld | beim Kind | beim Kind | zählt nicht | zählt nicht |
| Unterhalt, Unterhaltsvorschuss | beim Kind bis zu dessen Bedarf | beim Kind | voll | mindert zu 45 % beim Kind |
| Pflegegeld | zählt nicht (§ 13 Abs. 5 SGB XI) | zählt nicht | zählt nicht | zählt nicht |
| Wohngeld | – (Ausschluss) | – (Ausschluss) | – | zählt bei der Prüfung der Hilfebedürftigkeit |

Geprüft wird das laufend: Der Raster-Test vergleicht App und unabhängige Referenz in 167.263 Haushalten.

## 4. Gefundene Fehler und Korrekturen

| # | Fehler | Wirkung | Korrektur | Test |
|---|---|---|---|---|
| 1 | Freibetrag für Betriebs-, Riester- und private Renten fehlte (§ 82 Abs. 4 SGB XII) | Grundsicherung im Alter bis 281,50 € im Monat unterschätzt | neues Feld „Davon Betriebsrente, Riester-Rente oder private Rente“, 8 Sprachen | `gsa-zusatzrente` |
| 2 | Grundrentenfreibetrag auch auf Betriebsrenten; bei Renten unter 100 € höher als die Rente | zu hohe Freibeträge; bei sehr kleinen Renten minderte er anderes Einkommen | nur auf die gesetzliche Rente, höchstens bis zur Höhe der Rente | `gsa-zusatzrente`, `gsa-grundrente-klein` |
| 3 | Kinderzuschlag: Rente, ALG I, Krankengeld, Elterngeld der Eltern über ihrem Bedarf nur zu 45 % angerechnet | Kinderzuschlag zu hoch eingeschätzt, z. B. 500 statt 380 € bei ALG I; Familien ohne Arbeitseinkommen bekamen „wahrscheinlich“ statt „nein“ | Trennung nach § 6a Abs. 6 BKGG mit Vorrangregel | `kiz-anderes` |
| 4 | Versicherungspauschale 30 € zusätzlich zum Grundfreibetrag, wenn eine Person Lohn und Rente hat | Grundsicherungsgeld bis 30 € im Monat zu hoch | einmal je Person, nicht neben Arbeitseinkommen | `vpausch-person` |
| 5 | Rundfunkbefreiung bei Blindenhilfe, Hilfe zur Pflege und BAföG (nicht bei den Eltern) nicht eingestuft | Karte zeigte „eher nicht“ | Einstufung „möglich“ mit eigenem Text, 8 Sprachen | `rf-weitere` |

Fehler 2 (kleine Renten) und 3 steckten in App und Referenz gleich und waren deshalb im Vergleich unsichtbar. Beide Rechnungen wurden unabhängig voneinander korrigiert.

Nach der Korrektur weiter ohne Widerspruch:
- **Amtliche Rechner:** 3.800 Familien im KiZ-Lotsen, 7.000 Wohngeld- und 1.000 Elterngeld-Fälle.
- **Mutationstest:** jeder eingebaute Fehler wird erkannt, auch die neuen Mutationen zu Fehler 1 und 2.

## 5. Bewusste Vereinfachungen und offene Punkte

- **Elterngeld als Einkommen:** Bei ElterngeldPlus ist der Freibetrag halb so hoch (150 €). Die App kennt die Variante nicht und rechnet mit 300 €.
- **BAföG für Kinder:** Die Prüfung nutzt das Netto der Eltern statt des Einkommens nach § 21 BAföG und zeigt deshalb eine breite Spanne.
- **Werkstattlohn beim Kinderzuschlag:** wird als Arbeitseinkommen gezählt (45 %). Betrifft fast nur Fälle der Grundsicherung im Alter.
- **Unterhaltsvorschuss:** Die Mindestunterhaltsverordnung ließ sich nicht abrufen. Die Beträge folgen dem gesetzlichen Rechenweg mit dem Mindestunterhalt 2026.
- **Landesrecht:** Die Beträge stehen mit Quelle in `rules.js` und `docs/WBS-GRENZEN.md`. Für das Saarland fehlt noch eine amtliche WBS-Grenze.
