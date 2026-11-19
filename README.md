# SoLo – Sozialleistungslotse

Orientierungscheck für 32 Sozialleistungen in Deutschland (Leistungskarten, Liste in `test/karten.js`): Familie, Wohnen, Grundsicherung, Pflege, Behinderung, Rente, Ausbildung, Krankenversicherung. Es gibt eine Web-Version und Store-Apps für Android und iOS. Alles läuft auf dem Gerät: keine Server, keine Konten, kein Tracking.

## Was die App kann

| Bereich | Inhalt |
|---|---|
| Leistungen prüfen | 32 Karten (u. a. Wohngeld, Kinderzuschlag, Grundsicherungsgeld, Grundsicherung im Alter, Kostenlose Familienversicherung nach § 10 SGB V): „wahrscheinlich“, „möglich“ oder „unwahrscheinlich“, grobe Höhe, zuständige Stelle, Unterlagen. Hinweise auf einmalige Hilfen (Erstausstattung, Umzug, Schwangerschaft) in den Karten Grundsicherungsgeld und Grundsicherung im Alter. |
| Netto aus Brutto | Lohnsteuer, Soli, Kirchensteuer nach amtlichem Programmablaufplan 2026, Sozialabgaben mit Übergangsbereich (`test/test-netto.js`) |
| Ersparnisse | Aufteilung nach Art (Konto, ETF, Bausparen, Versicherungen, Riester/Rürup/Betriebsrente, Zinsen); geschützte Altersvorsorge zählt nicht, Zinsen als Einkommen (`test/test-ersparnis.js`) |
| Schulden | Pfändung von Lohn (§ 850c ZPO, Tabelle 2026, gilt bis 30.6.2027) und P-Konto (§§ 899, 902 ZPO) |
| Geld sparen im Alltag | Strom, Heizen, Essen (Rezepte nur Deutsch), Verträge und Sozialtarife, Schulden |
| Brief prüfen | Bescheide (Grundsicherungsgeld, Grundsicherung im Alter, Wohngeld, Kinderzuschlag), Pflegegutachten, Nebenkosten; Scannen, PDF oder Text; Widerspruch als PDF |
| Antragsmappe | Anschreiben mit Empfänger, Angabenblatt, Unterlagenliste, Hilfe zum Antragsformular |
| Pflege | Pflegegrad selbst einschätzen, Erklärseite zu den Leistungen der Pflegekasse (nur Deutsch) |
| Sprachen | 13 Sprachen und Einfache Sprache |

In Arbeit (offene Pull Requests, noch nicht in `main`): Renten-Netto nach Kranken- und Pflegeversicherung statt pauschal 89 % (#27), Unterhaltsvorschuss vollständig nach UVG (#30).

[![CI](https://github.com/Dcabrerizo-lab/Claud/actions/workflows/ci.yml/badge.svg)](https://github.com/Dcabrerizo-lab/Claud/actions/workflows/ci.yml)

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/rules.js` | Regeln als Daten und Logik (Rechtsstand im Feld `stand`). Liefert Textschlüssel und Beträge als Zahlen. |
| `src/lang/*.json` | Texte in 13 Sprachen (de, en, tr, ar, ru, uk, pl, ro, fr, fa-AF = Dari, fa = Farsi, ps = Paschtu, so = Somali) |
| `src/lang/einfach/` | Einfache Sprache |
| `src/template.html`, `src/app.js` | Oberfläche |
| `src/fmt.js`, `src/plz.js`, `src/behoerden.js` | Betragsformat je Sprache; PLZ → Bundesland, Kreis, Mietenstufe; zuständige Stelle mit Anschrift (siehe „Daten und Quellen“) |
| `content/` | App-Daten (`plz-data.json`, `behoerden-bayern.json`, `behoerden-deutschland.json`) und die amtlichen Originalquellen (`quellen/`) |
| `tools/build-plz-data.js`, `tools/build-behoerden.js` | erzeugen die App-Daten aus den Quellen (`npm run build:data`) und brechen ab, wenn etwas nicht eindeutig ist |
| `tools/wikidata-kreise.js`, `tools/build-behoerden-de.js` | Website und Zuständigkeit der Kreise und Städte außerhalb Bayerns (Wikidata) → `content/behoerden-deutschland.json` |
| `scripts/build.js` | baut die Web-Version → `dist/sozialleistungslotse.html` |
| `scripts/build-app.js` | baut die Store-App → `app/www` (Schriften lokal, strenge CSP, Kamera-Scan, PDF) |
| `app/` | Capacitor-Projekt mit `android/` und `ios/`, PDF-Modul (`app/pdf`), Plugin Texterkennung |
| `test/` | Regeltests (400+ Prüfungen, gegen amtliche Quellen), DOM-, Browser- und App-Tests |
| `docs/` | Quellen, Store-Angaben, Release-Checkliste |
| `datenschutz.html` | Datenschutzerklärung (über GitHub Pages veröffentlicht) |

## Entwickeln

Voraussetzung: Node 22. Für Android Android Studio mit JDK 21, für iOS ein Mac mit Xcode.

```bash
npm ci
(cd app && npm ci)
npx playwright install chromium   # einmalig, für Browser- und App-Tests

npm test            # Regeln + Oberfläche (baut vorher dist/)
npm run test:e2e    # Browsertest
npm run test:app    # Store-App im Browser mit nachgeahmten Plugins
npm run build:app   # app/www bauen und nach Android/iOS synchronisieren
```

Danach `cd app && npx cap open android` bzw. `npx cap open ios`.

## Daten und Quellen

Die PLZ-Daten (GeoNames), die Mietenstufen (Wohngeldverordnung) und die zuständigen Stellen in Bayern werden nicht von Hand gepflegt. Die Stellen sind Landratsämter und kreisfreie Städte (Impressum der Behörden), Jobcenter, Familienkassen, ZBFS-Regionalstellen und Bezirke. Zuständigkeit und Anschriften stammen aus dem BayernPortal, dem amtlichen Behördenverzeichnis des Freistaats. Der Workflow **„Quellen abrufen“** lädt die Originalquellen nach `content/quellen/roh/` und protokolliert Abrufdatum und Prüfsumme. Danach erzeugt `npm run build:data` daraus die App-Daten. Jede Anschrift muss wörtlich in ihrer Quelle stehen, sonst bricht der Build ab.

Abdeckung der Anschriften:

| Gebiet | Anschrift |
|---|---|
| Bayern | vollständig: Landratsämter und kreisfreie Städte, Jobcenter, Familienkassen, ZBFS, Bezirke; Bayerisches Landespflegegeld: Landesamt für Pflege |
| übriges Deutschland | 302 Kreise und kreisfreie Städte mit Anschrift (Impressum der Behörden, Quelle und Abrufdatum je Eintrag): kreisfreie Städte für alle Leistungen der Kreisebene, Landkreise für Wohngeld (mit Weiterleitung nach § 16 SGB I) und Grundsicherung im Alter; Familienkassen in Ländern mit genau einer Familienkasse; Jobcenter nur einzeln belegt |
| bundesweit fest | Rundfunkbeitrag |
| ohne Anschrift | Kranken-, Pflege- und Rentenversicherung (Träger hängt von der Person ab); sonst nur die Art der Stelle, wenn der Empfänger nicht sicher ist |

## CI

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request:
1. alle Tests (auch die langen Browser- und App-Tests; sie laufen nur auf GitHub)
2. Android Debug-APK als Artefakt; bei Version-Tag (`v1.2.3`) zusätzlich ein signiertes App-Bundle für den Play Store
3. iOS-Build für den Simulator (prüft, dass alles kompiliert)

Weitere Workflows: „Schwere Tests“ (`schwer.yml`, jeden Sonntag automatisch), „Amtliche Rechner“ (monatlich und am 2. Januar Abgleich mit den amtlichen Rechnern), großer Abgleich (`gross-*.yml`, von Hand), iOS-Upload (`ios-testflight.yml`, Standard-Rechner `macos-15-intel`).

Dependabot hält die Abhängigkeiten aktuell.

## Veröffentlichen

Siehe [`docs/RELEASE.md`](docs/RELEASE.md) (Checkliste) und [`docs/STORE.md`](docs/STORE.md) (Store-Texte, Datensicherheit).

## Pflege des Rechtsstands

Gesetzesänderungen stehen in `src/rules.js`. Jährlich zum 1. Januar prüfen und Tests laufen lassen. Die Quellen jeder Zahl stehen in `docs/QUELLEN.md` und `docs/quellen/`.

**Hinweis:** SoLo ist eine Orientierung, keine Rechtsberatung.
