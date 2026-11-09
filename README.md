# SoLo – Sozialleistungslotse

Orientierungscheck für 21 Sozialleistungen in Deutschland: Familie, Wohnen, Grundsicherung, Pflege, Behinderung, Rente, Ausbildung. Es gibt eine Web-Version und Store-Apps für Android und iOS. Alles läuft auf dem Gerät: keine Server, keine Konten, kein Tracking.

[![CI](https://github.com/Dcabrerizo-lab/Claud/actions/workflows/ci.yml/badge.svg)](https://github.com/Dcabrerizo-lab/Claud/actions/workflows/ci.yml)

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/rules.js` | Regeln als Daten und Logik (Rechtsstand im Feld `stand`). Liefert Textschlüssel und Beträge als Zahlen. |
| `src/lang/*.json` | Texte in 8 Sprachen (de, en, tr, ar, ru, uk, pl, ro) |
| `src/template.html`, `src/app.js` | Oberfläche |
| `src/fmt.js`, `src/plz.js`, `src/behoerden.js` | Betragsformat je Sprache; PLZ → Bundesland, Kreis, Mietenstufe; zuständige Stelle mit Anschrift (Bayern) |
| `content/` | App-Daten (`plz-data.json`, `behoerden-bayern.json`) und die amtlichen Originalquellen (`quellen/`) |
| `tools/build-plz-data.js`, `tools/build-behoerden.js` | erzeugen die App-Daten aus den Quellen (`npm run build:data`) und brechen ab, wenn etwas nicht eindeutig ist |
| `scripts/build.js` | baut die Web-Version → `dist/leistungs-lotse.html` |
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

## CI

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request:
1. alle Tests
2. Android Debug-APK als Artefakt; bei Version-Tag (`v1.2.3`) zusätzlich ein signiertes App-Bundle für den Play Store
3. iOS-Build für den Simulator (prüft, dass alles kompiliert)

Dependabot hält die Abhängigkeiten aktuell.

## Veröffentlichen

Siehe [`docs/RELEASE.md`](docs/RELEASE.md) (Checkliste) und [`docs/STORE.md`](docs/STORE.md) (Store-Texte, Datensicherheit).

## Pflege des Rechtsstands

Gesetzesänderungen stehen in `src/rules.js`. Jährlich zum 1. Januar prüfen und Tests laufen lassen. Die Quellen jeder Zahl stehen in `docs/QUELLEN.md` und `docs/quellen/`.

**Hinweis:** SoLo ist eine Orientierung, keine Rechtsberatung.
