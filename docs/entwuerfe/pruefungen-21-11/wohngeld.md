# Wohngeld: SoLo gegen den amtlichen Wohngeldrechner (Differenztest, 21.11.2026)

## Kurzfassung

| Punkt | Ergebnis |
|---|---|
| Amtlicher Rechner | Wohngeld-Plus-Rechner des BMWSB (ab 1.1.2025), https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_node.html. Laut Seite „auf der aktuellen Rechtsgrundlage“, ein neuer Rechner kommt erst zur Novelle 2027. Abruf am 21.11.2026 |
| Lauf | GitHub Actions, Run 44902358680, Branch `claude/b-amtlich-wohngeld`, Startwert 2611 |
| Haushalte | 400 abgefragt, 400 mit amtlichem Ergebnis (0 Fehler bei der Eingabe) |
| Gleich (±1 €) | **344 von 400** (267 auf den Euro genau, 29 mit 1 €) |
| Abweichung > 1 € | **56**, alle aus **einer** Ursache: Minijob-Einkommen von Kindern (siehe Fehler 1 und 2) |
| Ohne Kinder-Einkommen | **296 von 296 gleich** (±1 €) |
| Gegenprobe | Mit beiden Fehlern rechnerisch behoben passen auch alle 104 Haushalte mit Kinder-Einkommen: **400 von 400** |
| Gespeicherte frühere amtliche Ergebnisse (7.000 Haushalte aus `test/amtlich-gross-*.json`) | mit demselben Euro-Vergleich alle 7.000 gleich (±1 €) |

## Warum dieser Rechner

| Prüfpunkt | Befund |
|---|---|
| Amtlich | Bundesministerium für Wohnen, Stadtentwicklung und Bauwesen (BMWSB), zuständig für das WoGG |
| Rechtsstand 2026 | Werte ab 1.1.2025 gelten 2026 unverändert (keine Fortschreibung zum 1.1.2026); Seite: „beruht auf der aktuellen Rechtsgrundlage“ |
| Automatisierbar | Einfaches Formular, Berechnung auf dem Server; schon vorher im Repo genutzt (`tools/amtliche-rechner/wg-amtlich.js`) |
| Nutzungsbedingungen / robots.txt | Seite: Rechner „dient lediglich einer ersten Orientierung“, kein Verbot automatischer Nutzung. robots.txt sperrt nur `/SiteGlobals/`, `/DE/Service/` u. a., nicht `/DE/wohnen/`; `Crawl-delay: 1`. Der Lauf: ein Browser, nacheinander, ≥ 2 s Pause je Abfrage, 400 Abfragen |
| Länder-Rechner | Nicht nötig: NRW/Bayern verweisen auf dieselbe Bundesformel; der Bundesrechner ist die Quelle |

## Was verglichen wurde

| Merkmal | Anzahl Haushalte |
|---|---|
| Haushaltsgröße 1–8 (davon 7–8 Personen) | 400 (75) |
| Mietenstufen I–VII | alle |
| Lohn / Rente / Arbeitslosengeld I | 400 / 150 / 85 (gemischt) |
| Angegebene Heizkosten / Heizkostenkomponente | 197 / 203 |
| Alleinerziehend (§ 17 Nr. 3) | 161 |
| GdB 100 (§ 17 Nr. 1) / weitere schwerbehinderte Person | 75 / 28 |
| 33 Jahre Grundrentenzeiten (§ 17a) | 58 |
| Unterhalt für die Kinder (Einkommen der Kinder) | 58 |
| Gezahlter Unterhalt mit Titel (§ 18) | 62 |
| Junge Erwachsene 18–24 | 51 |
| Minijob eines Kindes / zweier Kinder (§ 17 Nr. 4) | 66 / 38 |
| Abzug groß (Lohn 30 %, Rente 20 % = SoLo obere Schätzung) / klein (je 10 % = SoLo untere Schätzung) | 284 / 116 |
| Amtlich kein Wohngeld (unter 10 €) | 70 |

Kindergeld ist beim Wohngeld kein Einkommen (§ 14 Abs. 2 WoGG nennt es nicht). Keiner der beiden Rechner fragt danach, deshalb wird es nicht verglichen.

SoLo wurde über die echte App-Rechnung `evaluate()` in `src/rules.js` gerechnet. Einzige Änderung beim Laden: Die Anzeige rundet auf 10 €, der Test rundet nach Anlage 3 Schritt 3 WoGG auf den Euro. So ist der Vergleich auf den Euro möglich.

## Echte SoLo-Fehler (bitte durch einen Bau-Agenten mit Prüfung beheben)

| Nr. | Fehler | Fundstelle | Recht | Wirkung |
|---|---|---|---|---|
| 1 | **Werbungskosten-Pauschbetrag beim Lohn der Kinder fehlt.** SoLo zieht vom Minijob/Lohn eines Kindes nur den Freibetrag von 100 € ab, nicht den Arbeitnehmer-Pauschbetrag von 102,50 €/Monat (1.230 €/Jahr). Bei den Eltern wird er abgezogen, beim Kind nicht | `src/rules.js` Zeile 962: `Math.max(0, (h.kindEink \|\| 0) - R.wgKindFrei)` | § 14 Abs. 1 WoGG i. V. m. § 2 Abs. 2, § 9a Satz 1 Nr. 1 Buchst. a EStG (Einkünfte = Einnahmen minus Werbungskosten, mindestens Pauschbetrag) | SoLo rechnet zu **wenig** Wohngeld: −7 bis −128 €/Monat; betroffen 31 von 66 Haushalten mit einem und 25 von 38 mit zwei verdienenden Kindern (unter ca. 103 € Kinder-Einkommen keine Wirkung) |
| 2 | **Freibetrag für Kinder-Einkommen nur einmal je Haushalt statt je Kind.** SoLo zieht 100 € einmal von der Summe aller Kinder-Einkommen ab | dieselbe Zeile 962; Wert `wgKindFrei: 100` (Zeile 199) | § 17 Nr. 4 WoGG: Freibetrag „jedes Kindes“, höchstens 1.200 €/Jahr, wenn das Kind Haushaltsmitglied und unter 25 ist | Zusätzlich zu Fehler 1 zu wenig Wohngeld, wenn zwei oder mehr Kinder verdienen (mit Korrektur 1 allein wären 95 von 104 gleich, die übrigen 9 erst mit Korrektur 2) |

Gegenprobe (nur im Test, nicht in der App geändert): Kinder-Einkommen je Kind mit `max(0, Einkommen − 102,50 − 100)` gerechnet → alle 104 Haushalte mit Kinder-Einkommen gleich wie amtlich (±1 €).

Hinweise für die Korrektur:
- SoLo fragt das Kinder-Einkommen als **eine Summe** und als **ausgezahlten Betrag** ab. Für Fehler 2 braucht die App die Zahl der verdienenden Kinder (oder je Kind einen Betrag). Alternative ohne neue Frage: für „möglich“ (obere Schätzung) den Freibetrag je Kind ansetzen, für „wahrscheinlich“ einmal.
- Bei Ausbildungsvergütung ist der ausgezahlte Betrag kleiner als das Brutto; dann fehlen auch die Abzüge nach § 16 WoGG. Getestet wurde nur der Minijob (brutto = ausgezahlt).
- Der Kommentar in Zeile 198 nennt „16 bis 24 Jahre“; § 17 Nr. 4 WoGG nennt nur „noch nicht 25 Jahre alt“, keine Untergrenze.
- Nach der Korrektur: `docs/PRUEFLISTE.md` angleichen und den Differenztest erneut laufen lassen.

## Weitere Abweichungen (keine Fehler)

| Art | Befund | Einordnung |
|---|---|---|
| Rundung | In 29 von 296 Haushalten ohne Kinder-Einkommen ist SoLo genau 1 € höher, nie niedriger. In den 7.000 älteren Fällen gleich (rund 9 %). Bei diesen Fällen liegt der ungerundete Wert nach § 19 Abs. 1 WoGG zwischen ,50 und ,67 €; der amtliche Rechner rundet trotzdem ab | **Rechner-Besonderheit / Rundung.** SoLo rundet nach Anlage 3 Schritt 3 WoGG (ab 0,50 € auf). Die interne Rundung des amtlichen Rechners ließ sich mit naheliegenden Annahmen (Rundung von M oder Y, Jahreswerte, Rundung je Person) nicht nachbilden. Unter der Grenze von 1 €. SoLo zeigt ohnehin auf 10 € gerundet |
| Grundrente | Der amtliche Rechner hat kein Betragsfeld „davon Rente mit 33 Jahren“, nur einen Haken je Person (Formular am 21.11.2026 erkundet). Getestet daher nur Personen, deren ganzes Einkommen Rente ist | **Eingabe nur teilweise vergleichbar.** Alle 58 Fälle gleich |
| Unterhaltspflichten | Nur 30–150 €/Monat mit Titel getestet (unter jedem Höchstbetrag nach § 18 WoGG). Ob der Rechner die Höchstbeträge kürzt, ist nicht geprüft | **Eingabe nicht vergleichbar** oberhalb der Höchstbeträge. Alle 62 Fälle gleich |
| Elterngeld, Selbstständige, Unterhalt für sich selbst | Nicht getestet (der amtliche Rechner kennt keine Einkommensarten, nur Beträge und Haken) | Nicht vergleichbar |

## Dateien

| Datei | Zweck |
|---|---|
| `.github/workflows/amtlich-wohngeld.yml` | Workflow (workflow_dispatch; bis er auf main liegt, Start per Push der Auftragsdatei) |
| `tools/amtliche-rechner/wg-differenz-auftrag.txt` | Auftrag „<modus> <anzahl> <startwert>“, z. B. `abfrage 400 2611` |
| `tools/amtliche-rechner/wg-differenz-faelle.js` | Zufällige Haushalte und Übersetzung für beide Rechner |
| `tools/amtliche-rechner/wg-differenz.js` | Abfrage des amtlichen Rechners (2 s Pause, höchstens 400) |
| `tools/amtliche-rechner/wg-amtlich.js` | erweitert: Haken „Kind unter 25“ und „Grundrente“, Kontrolle der Eingabe vor dem Absenden |
| `tools/amtliche-rechner/wg-erkunden.js` | Formularfelder des Rechners auslesen (Modus `erkunden`) |
| `tools/amtlich-vergleich-wohngeld.js` | SoLo nachrechnen, jede Abweichung > 1 € listen (`--md`, `--json`) |
| `/home/claude/ausgabe/amtlich/wohngeld-amtlich-lauf.json` | Artefakt des Laufs (400 Haushalte mit amtlichem Betrag) |
| `/home/claude/ausgabe/amtlich/wohngeld-abweichungen.json` | Die 56 Abweichungen mit Eingaben |

Neu starten: `node tools/amtlich-vergleich-wohngeld.js <amtlich-wohngeld.json> --md bericht.md`; Abfrage auf GitHub über den Workflow (oder eine Änderung der Auftragsdatei, z. B. anderer Startwert).
