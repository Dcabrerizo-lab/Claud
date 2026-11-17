# Update 1.3.1: Texte und Ablauf

Version 1.3.1, Build 142. Gegenüber 1.3.0 (Build 141): ohne den Bereich „Fristen“, neues Logo in den Store-Bildern. Inhalt seit Build 140: Aufbau mit drei Bereichen und „Brief prüfen“, dazu die Rechenverbesserungen (siehe `docs/AENDERUNGEN.md`).

## Was ist neu: Google Play (max. 500 Zeichen)

**Deutsch**
> Neu: SoLo hat jetzt drei Bereiche. Unter „Brief prüfen“ rechnest du Bescheide von Jobcenter, Sozialamt, Wohngeldstelle und Familienkasse nach, prüfst ein Pflegegutachten oder deine Nebenkostenabrechnung und bekommst Hilfe beim Widerspruch. Genauer gerechnet: Betriebsrente bei der Grundsicherung im Alter, Kinderzuschlag bei Rente oder Arbeitslosengeld der Eltern.

**English**
> New: SoLo now has three sections. In “Check a letter” you can recheck decisions from the Jobcenter, Sozialamt, Wohngeldstelle and Familienkasse, check a care assessment or your service charge statement, and get help with an objection. More accurate: company pensions for Grundsicherung im Alter, Kinderzuschlag when parents receive a pension or unemployment benefit.

## Was ist neu: App Store (Neuerungen in dieser Version)

Gleicher Text wie bei Google Play, Deutsch und Englisch.

## TestFlight: „Was testen“

> Bitte probiere die Bereiche unten in der Leiste:
> 1. **Start:** Sind die zwei Wege klar? Wohin würdest du zuerst tippen?
> 2. **Brief prüfen:** Tippe auf einen Absender und lade das Beispiel. Ist das Ergebnis verständlich? Klappt „Schreiben erstellen“ und „Text kopieren“?
> 3. **Leistungen:** wie bisher. Bitte kurz prüfen, ob deine alten Angaben noch da sind.
>
> Die Prüfungen unter „Brief prüfen“ gibt es vorerst nur auf Deutsch. Rückmeldungen gern per Screenshot in TestFlight.

## Nachricht an die Tester (zum Kopieren)

> Hallo, es gibt ein Update für SoLo (Version 1.3.1). Neu ist der Bereich „Brief prüfen“: Du kannst damit Bescheide nachrechnen lassen, ein Pflegegutachten prüfen oder die Nebenkostenabrechnung und bekommst Hilfe beim Widerspruch. Bitte einmal ausprobieren und mir sagen, was unklar ist. Danke!

## Store-Eintrag

- Kurzbeschreibung und Beschreibung aus `docs/STORE.md` (neuer Abschnitt „Brief vom Amt? Prüfen lassen“, Kurzbeschreibung „Sozialleistungen finden und Bescheide prüfen. Offline, ohne Anmeldung.“)
- Bilder aus `node tools/store-bilder.js`: App-Symbol 512 px, Werbegrafik 1024 × 500, 7 Screenshots
- Datenschutz unverändert: Prüfungen bleiben auf dem Gerät, nichts wird gesendet.

## Geprüft vor diesem Update

- `npm test`, `npm run test:e2e` (mit Bereiche-Test und Barrierefreiheit), `npm run test:app`, `npm run test:erweiterungen`, `npm run test:mutation`

## Bekannt und bewusst offen

- „Brief prüfen“ nur auf Deutsch; die Übersetzungen folgen.
- Brief einscannen mit Erkennung des Absenders und Vergleich mit den Angaben aus „Leistungen“: geplant.
- Das App-Symbol in der App selbst ist noch das alte; das neue Logo ist bisher nur in den Store-Bildern.
