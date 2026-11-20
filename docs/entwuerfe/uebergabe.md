# Übergabe für eine neue Sitzung (Stand 20.11.2026, abends)

## Erledigt
- Version 1.6.0 (148) gebaut, signiert (C8:E4:5D:61), schwere Tests grün, iOS bei TestFlight. Play-Store-Upload macht David.
- PR #60 Abhängigkeitstest gemergt.

## Offene PRs fürs nächste Update (NICHT mergen, bevor David die Test-App gesehen hat)
| PR | Branch | Inhalt |
|---|---|---|
| #61 | claude/b-anzeige-sprache | Einstellungen: Sprache wie Schalter, Erklärung in Kachel, eigene Zeile „Erinnerungen“ |
| #62 | claude/b-geld-schulden | Kachel „Geld und Schulden“ mit 6 Unterkacheln |
| #63 | claude/b-pflege-ergebnis | Pflege-Einschätzung mit Ergebnisseite |
| #64 | claude/b-aufenthalt | Asyl/Duldung-Korrekturen, Familienversicherung raus, Abhängigkeitstest erweitert (Fable geprüft: /home/claude/pruefung-pr64.md); Nachtrag läuft: Krankengeld bei Rente, EU-Ausschlüsse, Textfixes |
| (folgt) | claude/b-aufraeumen | Mein Ordner/Profile nur dort, Sicherheit und Daten, Löschen, Ergebniskarten ohne Schritte/Unterlagen, Careleaver raus, Kopfzeile nur Startseite |
| (folgt) | claude/b-navigation | einheitlicher „← Zurück“, Android-Zurück-Taste, iOS-Wischen |
| (folgt) | claude/b-infotexte | weniger Infotexte, Antragsmappe als Aufgabenliste ohne Inhaltsverzeichnis, Fehler „Frist im Brief: Monats“ |
| (folgt) | claude/b-einfach-vollstaendig | Einfache Sprache für alle Texte + Test |
| (folgt) | claude/b-design | Farbkacheln nur Startseite, weiße Karten darunter, Geldbörse statt Sparschwein, Fristen auffällig, Farbrollen, ein Feld-Stil, Schriftstufen, Dunkelmodus |
| (folgt) | claude/b-frage-fuer-frage | Leistungs-Check eine Frage pro Bildschirm, wählbar |

## Nächste Schritte
1. Alle Branches in einen Test-Zweig zusammenführen (Konflikte lösen), zweiter Durchgang Infotexte (Quellen zuklappbar, lange Texte Pflege/Sparen/Ich ziehe aus) und Einfache Sprache für neue Texte.
2. Fable-Prüfung „mit frischen Augen“ (10 Aufgaben, Note je Seite), schlimmste Stolperstellen beheben.
3. Android-Test-App (Debug-APK) + HTML an David. Erst nach seinem „passt“ mergen.
4. Offene Frage an David: Zusatzfrage „Bekommst du Asylbewerberleistungen?“ (macht Wohngeld/BuT genauer).
5. Später: Nutzertest mit 5 Personen (Anleitung erst auf Wunsch), Logo/Name zur Markenprüfung.

## Unterlagen
docs/entwuerfe/: naechstes-update.md (Sammelliste), ux-infotexte.md, ux-vorbilder.md, ux-design-pruefung.md, abhaengigkeiten-pruefung.md, schulden-bereich.md, wbs-aufenthalt.md
