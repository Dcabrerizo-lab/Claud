# SoLo Prüfpaket – Erweiterungen (getrennt von der App)

Stand: 17.11.2026. Die Bausteine liegen im Ordner `erweiterungen/` und haben eigene Tests. Seit dem neuen Aufbau (nach Build 140)
sind die Prüfungen **in der App eingebaut**, im Bereich „Brief prüfen“; die Widerspruchsfristen gehen in den Bereich „Fristen“.
Eine Quelle für beides: `scripts/build.js` übernimmt die Abschnitte aus `vorschau.html` (Stile auf `.pp` beschränkt) und die
Bausteine samt `vorschau.js`. Nicht in der App: Profi-Lizenz (kommt mit dem Kauf im Store). Getestet in `test/e2e-briefe.js` und `test/a11y.js`.

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
| `bescheid-gsa.js` | Bescheid Grundsicherung im Alter und bei Erwerbsminderung nachrechnen, auch mit dem Freibetrag für Betriebs-, Riester- und private Renten (fehlt in der App) | §§ 27a, 30, 35, 42a, 82, 82a SGB XII |
| `bescheid-wg.js` | Wohngeldbescheid nachrechnen (Miete, Einkommen, Formel); gegen den amtlichen Wohngeldrechner geprüft | §§ 11–17, 19, 21 WoGG |
| `bescheid-kiz.js` | Bescheid Kinderzuschlag nachrechnen (Bedarf der Eltern, Einkommen, 45 % Anrechnung) | § 6a BKGG |
| `nebenkosten.js` | Nebenkostenabrechnung prüfen: Fristen, nicht umlagefähige Posten, Verteilung nach Fläche, Heizkosten, CO₂-Aufteilung; Einwände an den Vermieter und Antrag auf Übernahme der Nachzahlung beim Jobcenter oder Sozialamt | § 556, § 556a, § 259 BGB; §§ 1, 2 BetrKV; §§ 7, 12 HeizkostenV; CO2KostAufG; § 22 SGB II, § 35 SGB XII |
| `fristen.js` | Widerspruchsfrist (frühester möglicher Tag) und Erinnerung an Folgeanträge | § 37 Abs. 2 SGB X, §§ 64, 66, 84 SGG |
| `widerspruch.js` | Widerspruch (Grundsicherungsgeld, Wohngeld, Kinderzuschlag, Pflege) und Antrag auf Höherstufung des Pflegegrades; der Nutzer prüft und unterschreibt | Dokumentvorlage (vgl. BGH I ZR 113/20); Höherstufung § 33 SGB XI, § 48 SGB X |
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
| `test-bescheid.js` | 72: durchgerechnete Beispiele, Mehrbedarfe, Freibeträge, Fristen, Widerspruch, Höherstufung, Gutachten-Import |
| `test-gsa.js` | 21 und 1.347 Rentner: gleicher Betrag wie die App |
| `test-nebenkosten.js` | 75: Einordnung von 39 typischen Posten, Fristen, CO₂-Stufen, ganze Abrechnung, beide Schreiben |
| `test-wohngeld.js` | 21 und 7.060 Ergebnisse des amtlichen Wohngeldrechners: höchstens 1 € Abweichung, 91 % auf den Euro genau |
| `test-kiz.js` | 17 und 1.054 Zufallsfamilien: gleicher Betrag wie die App |
| `test-lizenz.js` | 27: Fälschungen, Ablauf, kein privater Schlüssel im Repository, Werkzeuge |
| `e2e-vorschau.js` | 145: Browser hell und dunkel, Anzeige = Rechnung, Alter, eingeschleuster Code, axe WCAG 2.2 AA, Tippflächen 44 px, 320 px |

Zu den 600 Zufallsfällen in `test-pflege.js`: Jede vorgeschlagene Grenzfall-Kombination wird nachgerechnet, ob sie den nächsten Pflegegrad wirklich erreicht. Außerdem wird geprüft, dass es keine kürzere Kombination gibt.

### Widerspruch oder Höherstufung (Pflege)

- **Widerspruch:** Das Gutachten war schon damals falsch. Frist ein Monat.
- **Höherstufung:** Damals stimmte es, seitdem ist es schlimmer geworden. Jederzeit möglich, mehr Geld ab dem Monat des Antrags.

Die Vorschau erklärt den Unterschied und erstellt das passende Schreiben.

### Wohngeld: Genauigkeit

Der amtliche Wohngeldrechner rundet intern anders: Er liegt bei 9 % der Fälle 1 € unter der Formel. SoLo meldet deshalb erst Abweichungen über 1 €.

## Vor dem Einbau in die App offen

- PDF direkt öffnen. Dafür soll die Bibliothek pdf.js (Mozilla, Apache-Lizenz 2.0) in die Vorschau. Das Installieren braucht deine Freigabe.

- Übersetzungen (bisher nur Deutsch)
- Dokumentscanner (Apple VisionKit, Google ML Kit) und PDF über „Teilen → SoLo“
- Mitteilungen auf dem Handy für die Erinnerungen (Plugin für lokale Mitteilungen)
- Kauf in der App für das Prüfpaket
- Prüfung durch einen Anwalt
