# Update 1.4.0: übersichtlicher, PDF, Pflege

Version 1.4.0, Build 145. Gegenüber Build 144: Hinweise „Wo steht das im Brief?“ bei allen Feldern mit Amtsbegriffen, „formloser Antrag“ erklärt, Pflegegutachten empfiehlt Scannen oder PDF, Kachel „Zwei Wege“ beginnt mit dem, was zu tun ist, klarerer Hinweis bei fremder Sprache. Build 143 und 144 nicht mehr verwenden.

## Was ist neu: Google Play (max. 500 Zeichen)

**Deutsch**
> Neu: Briefe vom Amt auch als PDF prüfen, digital oder eingescannt. Pflegegrad selbst einschätzen, einfacher und mit Erklärungen; beim Pflegegutachten zeigt SoLo jede zu niedrige Bewertung und hilft beim Widerspruch. Übersichtlicheres Ergebnis: zuerst, was auf dich zutrifft, zum Aufklappen. Neue Seite erklärt die Leistungen der Pflegekasse: Pflegegeld aufs Konto, Entlastungsbetrag als Budget.

**English**
> New: check letters from offices as a PDF too, digital or scanned. Estimate the care level yourself, simpler and with explanations; for a care assessment SoLo shows every rating that is too low and helps with an objection. Clearer results: what applies to you comes first, tap to expand. A new page explains care insurance benefits: Pflegegeld to your account, Entlastungsbetrag as a budget.

## Was ist neu: App Store (Neuerungen in dieser Version)

Gleicher Text wie bei Google Play, Deutsch und Englisch.

## App Store (App Store Connect → App → Version 1.4.0)

| Feld | Text |
|---|---|
| Name | SoLo – Sozialleistungslotse |
| Untertitel (30) | Hilfen finden, Briefe prüfen |
| Werbetext (170) | Welche Hilfen stehen dir zu? Prüfe 31 Sozialleistungen in etwa 5 Minuten, lass Bescheide nachrechnen, auch als PDF. Offline, ohne Anmeldung, in 8 Sprachen. |
| Stichwörter (100) | Wohngeld,Bürgergeld,Grundsicherung,Kinderzuschlag,Bescheid,Widerspruch,Pflegegrad,Sozialhilfe,Antrag |
| Beschreibung | aus `docs/STORE.md` (aktualisiert) |
| Neuerungen | Text „Was ist neu“ oben |
| Review-Hinweis | aus `docs/STORE.md`, Abschnitt Apple (aktualisiert: kein „Beispiel laden“ mehr) |

## TestFlight und Play-Test: „Was testen“

> 1. **Leistungen:** Ist das Ergebnis übersichtlich? Stimmt die Reihenfolge (zuerst, was zutrifft)? Klappt „Mehr anzeigen“?
> 2. **Pflegegrad selbst einschätzen:** Ist der Ablauf klar? Bei Medikamenten und Behandlungen gibt es jetzt eine Liste zum Ankreuzen.
> 3. **Brief prüfen:** Kachel wählen, dann Scannen, PDF, Text einfügen oder Werte selbst eingeben. Beim Pflegegutachten: Erscheinen die Abweichungen zur eigenen Einschätzung?
>
> Die Prüfungen unter „Brief prüfen“ gibt es vorerst nur auf Deutsch.

## Nachricht an die Tester (zum Kopieren)

> Hallo, es gibt ein Update für SoLo (Version 1.4.0). Neu: Briefe auch als PDF prüfen, eine einfachere Pflegegrad-Einschätzung mit Vergleich zum Gutachten und ein übersichtlicheres Ergebnis. Bitte einmal ausprobieren und mir sagen, was unklar ist. Danke!

## Geprüft vor diesem Update

- `npm test`, `npm run test:erweiterungen`, `npm run test:e2e` (Bereiche, Pflege, PDF, Zufalls-Klicktest, Barrierefreiheit), `npm run test:app`

## Bekannt und bewusst offen

- „Brief prüfen“ und die Pflege-Einschätzung nur auf Deutsch.
- Eingescannte PDFs im Browser brauchen die Texterkennung aus dem Internet; in der App läuft sie auf dem Gerät.
- Mietobergrenze für Grundsicherungsgeld: Orientierung (Wohngeld-Höchstbetrag plus 10 %), nicht die genaue Grenze der Stadt.
