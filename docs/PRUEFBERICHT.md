# Prüfbericht (Stand 8. November 2026)

Gründliche Durchsicht aus zwei Blickwinkeln: fachlich (Sozialrecht) und technisch. Grundlage ist der Code in `src/`.
Eine Prüfung durch eine Sozialberatung oder eine Fachanwältin ersetzt dieser Bericht nicht. Er soll sie erleichtern.

## Fachlich: geprüfte Werte 2026

| Wert | In der App | Rechtsgrundlage |
|---|---|---|
| Regelbedarfe 563 / 506 / 451 / 471 / 390 / 357 € | ✓ | RBSFV 2026, Anlage zu § 28 SGB XII |
| Kindergeld 259 € | ✓ | § 66 EStG |
| Kinderzuschlag höchstens 297 € je Kind, Mindesteinkommen 900 / 600 €, Minderung 45 % | ✓ | § 6a BKGG |
| Vermögen Kinderzuschlag 40.000 € + 15.000 € je weitere Person | ✓ | § 6a Abs. 3 BKGG i. V. m. § 12 SGB II |
| Unterhaltsvorschuss 227 / 299 / 394 € | ✓ | § 2 UVG (Mindestunterhalt minus Kindergeld) |
| BAföG-Freibeträge Eltern 2.540 / 1.690 €, je Kind 770 € | ✓ | § 25 BAföG |
| Pflegegeld 347 / 599 / 800 / 990 €, Entlastungsbetrag 131 € | ✓ | §§ 37, 45b SGB XI |
| Behinderten-Pauschbeträge, Fahrtkosten 900 / 4.500 € | ✓ | § 33b Abs. 3 EStG, § 33 Abs. 2a EStG |
| Grundfreibetrag 12.348 € | ✓ | § 32a EStG |
| Minijob-Grenze 603 € | ✓ | § 8 Abs. 1a SGB IV |
| Beitragsbemessungsgrenzen 8.450 € (ALV) / 5.812,50 € (KV) | ✓ | Sozialversicherungs-Rechengrößen 2026 |
| Wohngeld: Höchstbeträge, Klima- und Heizkomponente, Formel a/b/c | ✓ (von unabhängiger Rechnung bestätigt) | §§ 12, 19 WoGG, Anlagen 1 und 2 |
| Regelaltersgrenze je Geburtsjahr | ✓ | § 235 SGB VI |
| Werkstattlohn: 52 € AFöG frei, 1/8 RS1 + 50 % frei | ✓ | § 82 Abs. 2 Nr. 5, Abs. 3 Satz 2 SGB XII |
| Grundrentenfreibetrag 100 € + 30 %, höchstens 281,50 € | ✓ | § 82a SGB XII |
| Mehrbedarf G 17 %, Alleinerziehende 12–60 % | ✓ | § 30 Abs. 1 und 3 SGB XII, § 21 Abs. 3 SGB II |
| ALG I 60 / 67 %, Dauer nach Versicherungszeit und Alter | ✓ | §§ 147, 149 SGB III |
| Krankengeld 70 % brutto, höchstens 90 % netto, 78 Wochen | ✓ | §§ 47, 48 SGB V |

## Fachlich: bei dieser Durchsicht korrigiert

- **Minijob:** kein Krankengeld (nicht krankenversichert über die Arbeit) und keine Anwartschaft auf Arbeitslosengeld (§ 27 Abs. 2 SGB III).
- **Gemischte Bedarfsgemeinschaft:** Ist bei einem Paar mit Kindern eine Person im Rentenalter oder voll erwerbsgemindert, kann die andere Person mit den Kindern zum Jobcenter gehören. Das zeigt die App jetzt als „möglich“, statt pauschal „nur Sozialamt“.
- **Zuzahlungen:** Als schwerwiegend chronisch krank gilt auch, wer Pflegegrad 3 bis 5 hat (Chroniker-Richtlinie § 2).
- **Fahrtkostenpauschale bei Merkzeichen aG:** 4.500 € statt 900 €.
- **Veraltete Regeln:** Ab dem 1.1.2027 zeigt die App einen deutlichen Hinweis, bis sie aktualisiert ist.

## Fachlich: bekannte Grenzen (bewusst so gelöst)

- **Wohnkosten:** Angemessene Kosten nach örtlicher Richtlinie kennt die App nicht. Sie rechnet mit der tatsächlichen Miete. Bei den Eltern ohne Mietvertrag und im Wohnheim zeigt sie „mindestens“ bzw. „möglich“.
- **Mittagessen in der Werkstatt (§ 42b Abs. 2 SGB XII):** wird nicht als Zahl gerechnet, sondern verbreitert den Bereich „möglich“.
- **Wohnheim in Bayern:** Für die Grundsicherung zeigt die App den Bezirk als zuständige Stelle (Leistungen aus einer Hand). Bitte fachlich bestätigen lassen.
- **Kinderzuschlag:** Der Wohnkostenanteil der Eltern ist eine Näherung an den Existenzminimumbericht.
- **Wohngeld:** Die Grenze „Einkommen eher zu niedrig“ (80 % des Bedarfs) ist eine Faustregel ohne Rechtsgrundlage und als solche gekennzeichnet.
- **Elterngeld Plus:** Für die Hälfte des Freibetrags (150 €) gibt es keine eigene Auswahl.
- **Grundrentenfreibetrag beim Wohngeld (§ 17a WoGG):** ist nicht eingerechnet. Das Wohngeld kann dadurch etwas höher sein.

## Technisch

- **Sicherheit:** Alle Texte aus Eingaben werden vor dem Einfügen ins HTML maskiert (`esc`). Briefe und Angabenblatt stehen nur in `<pre>`/`textarea`. Die App hat eine strenge Content-Security-Policy (`connect-src 'self'`, kein Fremdcode).
- **Datenschutz:** Kein Netzwerkzugriff, keine Konten, keine Analyse. Daten liegen nur auf dem Gerät (Capacitor Preferences bzw. localStorage). Android-Backup ist aus (`allowBackup="false"`). Es gibt keine Kamera-Berechtigung, die App nutzt die System-Kamera.
- **Android:** targetSdk 36, minSdk 24. Debug-APK mit festem Test-Schlüssel, Release mit eigenem Upload-Schlüssel (Play App Signing).
- **Abhängigkeiten:** `npm audit`: 0 bekannte Schwachstellen (App und Werkzeuge).
- **Tests:**
  - Regeln: 6 Testdateien mit rund 680 Einzelprüfungen.
  - Unabhängige Referenzrechnung über rund 144.000 Haushalte, davon vollständige Raster für Werkstatt-Beschäftigte und alle Einkommensgrenzen.
  - Mutationstests zeigen, dass der Test absichtlich eingebaute Fehler findet.
  - Browser: ausführliche Version, einfache Version (49 Prüfungen) und App mit nachgeahmten Plugins.
  - Barrierefreiheit: axe-core, WCAG 2.1 AA, hell und dunkel.
- **Wartbarkeit:** `src/app.js` ist groß (rund 1.400 Zeilen). Eine Aufteilung in Module (Formular, Ergebnis, Mappe, einfache Version, Scan) wäre der nächste Schritt, sobald weitere Funktionen dazukommen.
