# Update 1.3.0: Texte und Ablauf

Version 1.3.0, Build ab 141. Neu: Aufbau mit vier Bereichen, „Brief prüfen“ und „Fristen“, dazu die Rechenverbesserungen nach Build 140 (siehe `docs/AENDERUNGEN.md`).

## Was ist neu: Google Play (max. 500 Zeichen)

**Deutsch**
> Neu: SoLo hat jetzt vier Bereiche. Unter „Brief prüfen“ rechnest du Bescheide von Jobcenter, Sozialamt, Wohngeldstelle und Familienkasse nach, prüfst ein Pflegegutachten oder deine Nebenkostenabrechnung und bekommst Hilfe beim Widerspruch. „Fristen“ zählt die Tage bis zum Fristende. Genauer gerechnet: Betriebsrente bei der Grundsicherung im Alter, Kinderzuschlag bei Rente oder Arbeitslosengeld der Eltern.

**English**
> New: SoLo now has four sections. In “Check a letter” you can recheck decisions from the Jobcenter, Sozialamt, Wohngeldstelle and Familienkasse, check a care assessment or your service charge statement, and get help with an objection. “Deadlines” counts the days you have left. More accurate: company pensions for Grundsicherung im Alter, Kinderzuschlag when parents receive a pension or unemployment benefit.

## Was ist neu: App Store (Neuerungen in dieser Version)

Gleicher Text wie bei Google Play, Deutsch und Englisch.

## TestFlight: „Was testen“

> Bitte probiere die neuen Bereiche unten in der Leiste:
> 1. **Start:** Sind die zwei Wege klar? Wohin würdest du zuerst tippen?
> 2. **Brief prüfen:** Tippe auf einen Absender und lade das Beispiel. Ist das Ergebnis verständlich? Klappt „Schreiben erstellen“ und „Text kopieren“?
> 3. **Fristen:** Trage eine Frist ein, schließe die App und öffne sie wieder. Ist sie noch da? Stimmt die Zahl der Tage?
> 4. **Leistungen:** wie bisher. Bitte kurz prüfen, ob deine alten Angaben noch da sind.
>
> Die Prüfungen unter „Brief prüfen“ gibt es vorerst nur auf Deutsch. Rückmeldungen gern per Screenshot in TestFlight.

## Nachricht an die Tester (zum Kopieren)

> Hallo, es gibt ein Update für SoLo (Version 1.3.0). Neu sind die Bereiche „Brief prüfen“ und „Fristen“: Du kannst damit Bescheide nachrechnen lassen, ein Pflegegutachten prüfen oder die Nebenkostenabrechnung, und die App erinnert dich an Fristen. Bitte einmal ausprobieren und mir sagen, was unklar ist. Danke!

## Ablauf

1. Alle Tests grün (siehe unten), Branch nach `main` zusammenführen.
2. Tag setzen: `git tag v1.3.0 && git push origin v1.3.0`. Die CI baut die Android-APK, das signierte App-Bundle (AAB) und den iOS-Build.
3. **Google Play:** AAB aus dem Artefakt `android-release-aab` im geschlossenen Test hochladen, Text „Was ist neu“ einfügen.
4. **iOS:** Workflow „iOS TestFlight“ starten (Actions → Run workflow). Danach in App Store Connect „Was testen“ einfügen.
5. **Store-Eintrag:** Kurzbeschreibung und Beschreibung aus `docs/STORE.md` aktualisieren (neue Abschnitte „Brief vom Amt? Prüfen lassen“ und „Fristen im Blick“). Neue Screenshots mit der Startseite und „Brief prüfen“ sind sinnvoll.
6. **Datenschutz:** unverändert. Fristen und Prüfungen bleiben auf dem Gerät, nichts wird gesendet. Die Angaben zur Datensicherheit müssen nicht geändert werden.

## Geprüft vor diesem Update

- `npm test`: alle Rechentests, 167.263 Haushalte gegen die unabhängige Referenz, Anzeige-Test in 8 Sprachen
- `npm run test:e2e`: Klicktests, Kleinbild 320 px, neuer Bereiche-Test, 400 Zufallsschritte, Barrierefreiheit (WCAG 2.2 AA) hell und dunkel
- `npm run test:app`: Store-App mit nachgeahmten Plugins, Fristen über den Gerätespeicher, Sicherheitsregeln (CSP)
- `npm run test:erweiterungen`: alle Prüfungen von „Brief prüfen“
- `npm run test:mutation`: absichtlich eingebaute Rechenfehler werden gefunden

## Bekannt und bewusst offen

- „Brief prüfen“ nur auf Deutsch; die Übersetzungen folgen.
- Erinnerung per Mitteilung am Handy, Scannen des Bescheids und die Profi-Version für Beratungsstellen kommen in einem späteren Update.
