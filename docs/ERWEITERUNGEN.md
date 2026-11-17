# SoLo Prüfpaket – Erweiterungen (getrennt von der App)

Stand: 16.11.2026. Diese Bausteine sind **nicht** in SoLo 1.2.0 eingebaut. Sie liegen im Ordner `erweiterungen/`, haben einen
eigenen Build und eigene Tests. `npm test` und die App-Pakete bleiben unverändert.

## Ausprobieren

```
npm run build:erweiterungen     # baut dist/solo-pruefpaket-vorschau.html
npm run test:erweiterungen      # alle Tests der Erweiterungen
```

Die Vorschau ist eine einzelne HTML-Datei. Sie läuft offline im Browser, am Handy und am PC.

## Bausteine

| Datei | Inhalt | Rechtsgrundlage |
|---|---|---|
| `pflege.js` | Pflegegutachten nachrechnen, Grenzfälle finden, jede Bewertung in Alltagssprache erklären, Alter berücksichtigen | § 15 SGB XI mit Anlage 1 und 2 (am Gesetzestext geprüft) |
| `pflege-import.js` | Bewertungen aus Gutachten-Text lesen (PDF oder Texterkennung); jede Zahl bestätigt der Nutzer | – |
| `bescheid-sgb2.js` | Bescheid Grundsicherungsgeld mit den App-Regeln vergleichen | §§ 11, 11b, 20, 21, 22 SGB II |
| `fristen.js` | Widerspruchsfrist (frühester möglicher Tag) und Erinnerung an Folgeanträge | § 37 Abs. 2 SGB X, §§ 64, 66, 84 SGG |
| `widerspruch.js` | Sachlicher Widerspruch aus den Funden; der Nutzer prüft und unterschreibt | Dokumentvorlage (vgl. BGH I ZR 113/20) |
| `lizenz.js` | Profi-Lizenz für Beratungsstellen, offline per Signatur geprüft | – |
| `vorschau.html`, `vorschau.js` | Oberfläche der Vorschau | – |

### Pflegegutachten: Verständlichkeit

- Jeder Bereich hat einen einfachen Namen (z. B. „Sich selbst versorgen“ statt „Selbstversorgung“); der Name aus dem Gutachten steht klein darunter.
- Jede Bewertungsstufe ist in Alltagssprache erklärt, z. B. „überwiegend selbständig“: *Das schafft die Person meistens allein. Sie braucht nur ab und zu Hilfe, zum Beispiel Erinnern, Bereitlegen oder kurzes Stützen.*
- Ergebnis als kurze Sätze: Punkte, Pflegegrad, Vergleich mit dem Bescheid, Abstand zum nächsten Grad, Geld.
- Punkteleiste mit den Grenzen der Pflegegrade, Erklärung „So rechnet die Pflegekasse“.
- Der Test prüft, dass jede Erklärung höchstens 30 Wörter pro Satz hat.

### Pflegegutachten: Alter

Das Alter wird abgefragt (Jahre, bei Kindern unter 2 Jahren zusätzlich Monate):

- **unter 18 Jahren:** Hinweis, dass der Gutachter mit gesunden Kindern gleichen Alters vergleicht (§ 15 Abs. 6); Frühförderung (5.K) wird abgefragt und gezählt.
- **unter 18 Monaten:** 4.1 bis 4.13 werden durch 4.K ersetzt, der Pflegegrad ist eine Stufe höher (§ 15 Abs. 7).
- **ohne Alter:** Hinweis, das Alter einzutragen.

### Grenzen (bewusst nicht geprüft)

- Pflege: Ob eine Bewertung im Alltag stimmt, kann nur der Nutzer beurteilen. SoLo zeigt nur, wo es knapp ist.
- Grundsicherungsgeld: Ernährung, Mehrbedarf bei Behinderung, einmalige Bedarfe, Sanktionen, Aufrechnungen, Selbständige, Azubis, Schüler, Studierende, Kindergeld-Überschuss, Angemessenheit der Miete. Eine gekürzte Miete wird als „bitte prüfen“ gezeigt, nicht als sicherer Fehler.
- Fristen: Es zählen nur bundesweite Feiertage; die Bekanntgabe wird nicht verschoben. Dadurch nennt SoLo eher einen zu frühen als einen zu späten Tag.

## Profi-Lizenz

- Eine Lizenz ist eine JSON-Datei mit Name der Stelle, Plätzen, Laufzeit und einer Signatur (ECDSA P-256).
- Jede Änderung (Name, Datum, Plätze) macht die Signatur ungültig.
- Die Prüfung läuft offline, ohne Server.

**Im Repository liegt nur ein Demo-Schlüssel.** Sein privater Teil wurde nach dem Signieren der Demo-Lizenz verworfen, er existiert nirgends. Vor dem Verkauf:

1. Auf dem eigenen PC einmal ausführen: `node tools/lizenz-schluessel.js`.
   - Der private Schlüssel kommt nach `~/.solo-lizenz/privat.jwk`.
   - Er darf **nie** ins Repository, in eine E-Mail oder in einen Chat. Bitte auf einem USB-Stick sichern.
   - Das Werkzeug weigert sich, den Schlüssel im Projektordner abzulegen oder einen vorhandenen zu überschreiben.
2. Die neue Datei `erweiterungen/lizenz-schluessel.json` (öffentlicher Teil) committen.
3. Lizenz ausstellen: `node tools/lizenz-erstellen.js --stelle "Name der Stelle" --plaetze 10 --bis 2027-12-31`.

## Tests

| Test | Prüfungen |
|---|---|
| `test-pflege.js` | 5.704: alle Punktbereiche der Anlage 2, alle Gewichte, Modul 5 an jeder Grenze, Alter, Verständlichkeit, 600 Zufallsfälle |
| `test-bescheid.js` | 66: durchgerechnete Beispiele, Mehrbedarfe, Freibeträge, Fristen, Widerspruch, Gutachten-Import |
| `test-lizenz.js` | 27: Fälschungen, Ablauf, kein privater Schlüssel im Repository, Werkzeuge |
| `e2e-vorschau.js` | 83: Browser hell und dunkel, Anzeige = Rechnung, Alter, eingeschleuster Code, axe WCAG 2.2 AA, Tippflächen 44 px, 320 px |

Zu den 600 Zufallsfällen in `test-pflege.js`: Jede vorgeschlagene Grenzfall-Kombination wird nachgerechnet, ob sie den nächsten Pflegegrad wirklich erreicht. Außerdem wird geprüft, dass es keine kürzere Kombination gibt.

## Vor dem Einbau in die App offen

- Übersetzungen (bisher nur Deutsch)
- Dokumentscanner (Apple VisionKit, Google ML Kit) und PDF über „Teilen → SoLo“
- Mitteilungen auf dem Handy für die Erinnerungen (Plugin für lokale Mitteilungen)
- Kauf in der App für das Prüfpaket
- Prüfung durch einen Anwalt
