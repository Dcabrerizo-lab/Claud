# Entwurf: Bereich „Ich habe Schulden“ neu ordnen (nächstes Update)

Stand: 20.11.2026 · Auftrag David: Startkachel heißt nur „Ich habe Schulden“; alles zu Schulden nur dort; jede Ebene als Kacheln in derselben Form wie die Startseite.

## Prüfung des heutigen Stands (Logik und Bedienbarkeit)
| # | Befund | Folge für Laien |
|---|---|---|
| 1 | Startkachel „Ich habe Schulden: Was bleibt mir?“ öffnet nur den Pfändungsrechner (Lohn/Konto) | Wer einen Inkasso-Brief hat, findet dort keine Hilfe |
| 2 | Tipps, „Was tun, wenn …“ und Schulden-Liste liegen unter Geld sparen → Schulden und Pfändung | Gleiches Thema an zwei Orten; Schulden-Liste ist zwei Ebenen tief versteckt |
| 3 | Knopf „Tipps“ im Rechner springt nach Geld sparen | „Zurück“ führt an eine unerwartete Stelle |
| 4 | Dringende Fälle (Konto gepfändet, Sperre droht, Mahnbescheid mit 2-Wochen-Frist, Kündigung der Wohnung) stehen unten zum Aufklappen | Das, was jetzt zählt, kommt zuletzt |
| 5 | Formen uneinheitlich: Startseite farbige Kacheln, Brief-Auswahl „kachel“, Geld sparen/Pfändung Listen-Knöpfe („weg“), Schulden-Seite Fließtext | Wirkt wie verschiedene Apps |
| 6 | Mahnbescheid/Inkasso auch unter „Brief bekommen → Anderer Brief“ | Zwei Texte zum selben Fall können auseinanderlaufen |

## Vorschlag: „Ich habe Schulden“ mit 6 Kacheln (Form wie Startseite)
| Kachel | Inhalt | Kommt von |
|---|---|---|
| Es ist dringend | Unterkacheln: Konto gepfändet · Strom/Gas-Sperre droht · Mahnbescheid · Wohnung gekündigt/Mietschulden – je Frist und erster Schritt | Fälle aus Geld sparen |
| Brief vom Inkasso oder Gericht | Was prüfen, was antworten; Verweis auf „Brief prüfen“ (ein gemeinsamer Text) | Fälle inkasso, mahn, rate |
| Was bleibt mir? | Pfändungsrechner Lohn oder Konto, P-Konto | heutige Startkachel |
| Meine Schulden-Liste | Überblick, Druckblatt für die Beratung | Schulden-Liste |
| Mein Geld planen | Haushaltsplan, Haushaltsbuch, Energie-Check | Geld sparen → Haushaltsplan |
| Kostenlose Hilfe | Schuldnerberatung finden, erste Schritte, unseriöse Angebote erkennen, Privatinsolvenz | Erste Schritte, Fälle unserioes, insolvenz |

- Geld sparen im Alltag behält nur: Strom, Heizen, Essen (mit Rezepten), Verträge.
- Jede Unterseite: Kacheln, darunter erst Details zum Aufklappen; „Zurück“ immer eine Ebene hoch.
- Farben nur aus docs/FARBEN.md, keine Farbe doppelt in einer Gruppe.
- Inhalte und Quellen bleiben (Kommentar SP_SCHULDEN_FAELLE in src/app.js); Fable prüft vor dem Merge.

## App-weit: einheitliche Kacheln
Alle Unterebenen der Startkacheln (Brief-Absender, Geld sparen, Pfändung Lohn/Konto, Pflege-Auswahl, Ich ziehe aus) in dieselbe Kachel-Form wie die Startseite bringen.
