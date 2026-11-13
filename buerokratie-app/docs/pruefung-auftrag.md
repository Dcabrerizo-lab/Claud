# Prüfung des Auftrags (CLAUDE.md) – passt das, macht das Sinn?

Stand: 13.11.2026

**Kurzfassung:** Die Idee ist schlüssig. Die Marktlücke (offline, eigener Tresor, beliebige Formulare) ist technisch machbar, der Spike bestätigt das für AcroForm-PDFs. Der Auftrag hat aber **vier echte Widersprüche** und **einige Annahmen**, die vor M1 geklärt werden sollten.

## 1. Stack-Vergleich mit dem Leistungs-Lotsen (10 Zeilen)

Hinweis: Das Repo `Dcabrerizo-lab/Leistungslotse` enthält nur eine einzelne `index.html`. Das vollständige Projekt (Build, Capacitor, Tests, CI) liegt in **diesem** Repo (`Dcabrerizo-lab/Claud`), und mit diesem habe ich verglichen.

| | Leistungs-Lotse | CLAUDE.md verlangt | Vorschlag |
|---|---|---|---|
| Sprache | reines JavaScript | TypeScript | **TypeScript**: Der Kern soll als Bibliothek veröffentlicht werden (Prototype Fund), Typen sind dann die Schnittstellen-Doku |
| Build | eigene Node-Skripte, alles in **eine** HTML-Datei | Vite | **Vite + Einzeldatei-Plugin**: liefert PWA *und* die Intranet-HTML-Datei aus einem Code, wie beim Lotsen |
| Tests | eigene `check()`-Skripte, jsdom | Vitest | **Vitest** (läuft schon im Spike), Prüfstil „gegen amtliche Quelle“ übernehmen |
| Browsertests | Playwright 1.63 | Playwright | gleich, Version 1.63.0 übernommen |
| App-Hülle | Capacitor 8 (Android + iOS), CI baut APK/AAB | Capacitor | gleich, CI-Aufbau übernehmen |
| PDF | pdf-lib 1.17 + fontkit (Antragsmappe) | pdf-lib + pdf.js | gleich, plus pdf.js für die Vorschau |
| Sprachen | de, en, tr, ar, ru, uk, pl, ro | 8 Sprachen, offen | **dieselben 8** (siehe Fragen) |
| CSP / offline | strenge CSP, Schriften lokal | `connect-src 'none'` | gleich; zusätzlich `'wasm-unsafe-eval'` für Argon2 (siehe unten) |

## 2. Widersprüche im Auftrag

1. **„Einmalkauf“ vs. „9,90 € pro Formular“.** Bei Google Play ist ein Einmalkauf ein fester Preis für die App. 9,90 € pro Formular wäre ein In-App-Kauf pro Formular. Das wirkt doch auf die Technik: Abrechnung über Google Play Billing, Zählen der Formulare, Freischalten offline. Bitte entscheiden.
2. **„Erklärt beliebige Formulare in der Sprache des Nutzers“ vs. „nur amtliche Quellen“ und „keine KI“.** Für ein beliebiges hochgeladenes Formular gibt es keine amtliche Übersetzung. Ohne KI kann die App nur die Felder erklären, die sie dem Feldkatalog zuordnen konnte, mit den Katalogtexten. Nicht zugeordnete Felder bleiben deutsch. Das ist ehrlich und machbar, sollte aber so im Produkttext stehen.
3. **„Beliebige Formulare“ vs. „keine OCR im MVP“.** ~~Es gehen nur PDFs mit echten Formularfeldern.~~ **Entschieden am 13.11.2026:** Papierformulare per Foto kommen in den MVP, als Abschreibhilfe und als ausgefülltes PDF (siehe `plan.md`, `spike-m0b.md`). Reine XFA-Formulare und verschlüsselte PDFs lassen sich weiterhin über den Foto-Weg bearbeiten (ausdrucken, fotografieren).
4. **Leistungs-Lotse hat schon Kamera-Scan mit Texterkennung.** Laut CLAUDE.md gehört OCR nicht in den MVP. Das ist kein Problem, nur ein Hinweis: Das spätere Brief-Scanner-Modul kann den vorhandenen Code übernehmen.

## 3. Annahmen, die ich prüfen würde

- **Eigenständige HTML-Datei im Intranet:** Wird die Datei per `file://` geöffnet, läuft kein Service Worker. IndexedDB verhält sich je nach Browser unterschiedlich (Firefox trennt pro Datei, Chrome teilt). Daten können also beim Verschieben der Datei „verschwinden“. Der verschlüsselte Export ist deshalb wirklich Pflicht, wie im Auftrag steht. Besser ist ein interner Webserver (PWA).
- **Argon2id offline:** Web Crypto kann kein Argon2. Dafür braucht es WebAssembly (z. B. `hash-wasm`, MIT-Lizenz, wird mitgebündelt) und in der CSP `'wasm-unsafe-eval'`. PBKDF2 als Rückfall geht mit Web Crypto direkt.
- **Werte-Zuordnung:** Ankreuzfelder und Auswahllisten haben je Formular eigene Werte (`verheiratet`, `vh`, `2`, `Ja`/`Nein`-Paare). Das Datenmodell braucht neben „Feld → Schlüssel“ auch „Katalogwert → Formularwert“ (im Spike belegt).
- **Arabische Schrift im Formular:** Technisch inzwischen lösbar (siehe Spike). Behörden erwarten Namen aber meist in lateinischer Schrift wie im Pass. Der Tresor sollte deshalb die lateinische Schreibweise speichern.
- **Wohin mit dem Code:** Der Spike liegt vorerst im Unterordner `buerokratie-app/` dieses Repos. Er stört den Leistungs-Lotsen nicht und lässt sich später verschieben. Für Lizenz (Kern Open Source, App proprietär) und Prototype Fund ist **ein eigenes Repo** sauberer, eventuell zwei (Kernbibliothek öffentlich, App privat).
- **Amtliche PDFs im Repo:** Behördenformulare zum Testen einzuchecken ist praktisch. Ob das bei einem öffentlichen Repo unbedenklich ist (§ 5 UrhG, amtliche Werke), ist nicht sicher. Vorerst sind sie per `.gitignore` ausgeschlossen.

## 4. Was gut ist und so bleiben sollte

- Tresor in der Mitte, Module außen, Zugriff nur über `vault.read/write`: genau richtig, auch für die Bibliothek.
- Jede Zuordnung muss bestätigt werden: Das ist auch technisch nötig, weil die Zuordnung über Synonyme nie fehlerfrei sein wird.
- Fachwerte in Datendateien mit Gültigkeitsjahr und Quelle: Das bewährte Verfahren aus dem Lotsen (Quellen-Workflow mit Prüfsumme) lässt sich übernehmen.
- Früh Android-Builds für den geschlossenen Test: Die CI des Lotsen baut schon APK und AAB und kann übernommen werden.
