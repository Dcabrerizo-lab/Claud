# Technische Prüfung SoLo (Stand 21.11.2026, Branch `claude/test-update-1.9`, Commit adae98d)

Nur geprüft, nichts geändert. Messungen auf 2 Kernen, Rechner war durch andere Sitzungen ausgelastet (Last ca. 3). Die Zeitwerte sind deshalb eher zu hoch. Verglichen wird immer unter gleichen Bedingungen.

## Top 10 (nach Nutzen pro Aufwand)

| # | Befund | Messwert | Empfehlung | Nutzen | Aufwand |
|---|---|---|---|---|---|
| 1 | Die 13 Sprachen machen zwei Drittel der Datei aus | 4,18 MB von 6,35 MB | App: nur Deutsch einbetten, andere Sprachen als eigene Dateien `www/lang/xx.json` erst beim Wechsel laden (lokal, offline) | Datei −3,9 MB; Start auf schwachem Gerät ca. 40 % schneller (5,5 s → 3,2 s bei 6× Drosselung) | mittel (1–2 Tage) |
| 2 | Bei 200 % Schrift scrollt die Ergebnisseite seitlich | Seite 526 px breit statt 390 px (auch bei 320 px) | Lange Wörter in den Karten umbrechen: `overflow-wrap:anywhere; hyphens:auto` für `.card header h3`, `.desc`, `.head2` | WCAG 1.4.4/1.4.10 erfüllt; Android lässt Textzoom bis 200 % zu | klein (1 Std.) |
| 3 | Wackeliger Browsertest `e2e-einfach` (`#es-neu`) | Test wartet 450 ms, App springt nach 350 ms weiter: nur 100 ms Puffer. CI am 21.11. um 11:18 und 11:36: „Timeout 30000ms“, im 2. Versuch grün | Statt fester Wartezeit warten, bis sich der Fragetext ändert (`waitForFunction`), oder Verzögerung im Testmodus auf 0; `.catch(() => {})` in Zeile 88/89 entfernen | weniger Fehlalarme in der CI | klein |
| 4 | Testdatei läuft nie | `test/test-ausziehen.js` (9.315 Prüfungen, grün) steht in keinem npm-Skript und keiner CI | in `test:rules` aufnehmen | „Ich ziehe aus“ wieder geprüft | Minuten |
| 5 | Größentest misst Zeichen statt Bytes; Grenzen widersprechen sich | Test: 5,40 Mio. Zeichen < 6 MB. Tatsächlich 6,35 MB (Arabisch/Russisch brauchen 2 Bytes je Zeichen). STATUS sagt 5 MB, Test sagt 6 MB | Test auf `Buffer.byteLength` umstellen, eine Grenze festlegen | Grenze stimmt wirklich | Minuten (Entscheidung durch David) |
| 6 | Pflege-Hebel-Berechnung probiert alle Kombinationen durch | `hebel()` in `erweiterungen/pflege.js:264`: bis ca. 50.000 Kombinationen, jede baut neue Listen; größter Einzelposten beim Beispiel (424–724 ms bei 6×) | Erst nur Zahlen merken, Wege nur für die 5 besten bauen; abbrechen, wenn schon 5 bessere gefunden sind | Klick auf Beispiel/Pflege-Ergebnis spürbar schneller (ca. −80 % dieser Rechnung) | klein |
| 7 | Code wird nicht verkleinert | JS + CSS 6,13 MB → 5,63 MB mit esbuild (`charset:'utf8'`) | Beim Bauen verkleinern (Quellen bleiben lesbar) | −0,5 MB, etwas schnelleres Einlesen | klein |
| 8 | Kaputte gespeicherte Daten werden still ersetzt | `haushalt.js:1117`, `schulden.js:230`, `ausziehen.js:324`: Fehler beim Lesen → leere Daten; die nächste Änderung überschreibt den alten Stand | Rohtext vorher unter `lotse.<name>.defekt` sichern und Hinweis zeigen | kein stiller Datenverlust | klein |
| 9 | Scroll-Prüfung erzwingt Layout bei jedem Scrollen | `jumpPruefen()` (`src/app.js:870`, `3100`) ruft bei jedem Scroll-Ereignis `getBoundingClientRect` auf | `IntersectionObserver` auf `#ergebnis` | flüssigeres Scrollen auf schwachen Geräten | klein |
| 10 | Schrift für PDFs ist sehr groß (nur App) | `fonts/pdf/NotoSans-*.ttf` 1,26 MB | Auf die nötigen Zeichen reduzieren (Latein, Latein-erweitert, Kyrillisch), z. B. mit pyftsubset | App −0,8 bis −0,9 MB | klein |

---

## 1. App-Größe

### Zusammensetzung der Web-Datei `dist/sozialleistungslotse.html`
| Teil | Bytes | Anteil |
|---|---|---|
| Sprachtexte `I18N` (13 Sprachen, je 2.648 Schlüssel) | 3,98 MB | 63 % |
| Einfache Sprache `I18N_EINFACH` (1.604 Schlüssel) | 0,20 MB | 3 % |
| PLZ-Daten (8.920 PLZ, 17.442 Einträge) | 0,61 MB | 10 % |
| Behörden (Bayern + Deutschland) | 0,14 MB | 2 % |
| Programmcode (app.js 354 KB, haushalt.js 102 KB, rules.js 172 KB, weitere) | ca. 0,95 MB | 15 % |
| Prüfpaket (erweiterungen/, inkl. Brief-Einfach 19 KB) | 0,33 MB | 5 % |
| CSS | 0,11 MB | 2 % |
| **Gesamt** | **6,35 MB** (5,40 Mio. Zeichen) | gzip 1,74 MB, brotli 1,23 MB |

Größe je Sprache: de 250 KB, en 247, tr 248, pl 256, ro 264, so 267, fr 289, ar 324, ps 352, fa-AF 357, fa 359, uk 381, ru 387 KB (Kyrillisch/Arabisch: 2 Bytes je Zeichen).

Nicht in der Web-Datei: pdf-lib/fontkit (`app/www/pdf.js`, 1,37 MB), pdf.js (`pdf.min.js` 320 KB + Worker 1,09 MB), Schriften. Diese gibt es nur in der App, und sie werden erst bei Bedarf geladen (`src/app.js:1656`, `1966`). Bilder sind nicht eingebettet (keine data:-Bilder).

### Was wenig bringt
- Ungenutzte Schlüssel: Vorsichtig gezählt etwa 32 Schlüssel (ca. 20 KB über alle Sprachen, z. B. `gruppe.*`, `kc.q1–q7`, `sb.w1–w6`). Bitte einzeln prüfen, weil manche Schlüssel im Code zusammengesetzt werden.
- Texte, die in einer Sprache gleich wie im Deutschen sind: je Sprache nur 23–64 (unter 1,2 KB).
- PLZ: Großkunden-PLZ (z. B. „Berliner Verkehrsbetriebe“) nur 83 Einträge (4 KB). Ein Wörterbuch für Ortsnamen spart ca. 28 KB.

### Vorschläge mit geschätzter Ersparnis
| Vorschlag | Ersparnis | Hinweis |
|---|---|---|
| App: Sprachen als eigene Dateien, nur aktive Sprache laden | index.html −3,9 MB | CSP erlaubt `fetch` vom eigenen Ursprung (`connect-src 'self'`). Sprachliste braucht nur `meta.name` aller Sprachen (beim Test ohne diese stürzte die App ab: `Cannot read properties of undefined (reading 'meta.name')`) |
| Web-Einzeldatei: andere Sprachen gzip-komprimiert einbetten, beim Wechsel mit `DecompressionStream` entpacken | ca. −2,6 MB (3,9 MB → ca. 1,4 MB Base64) | Erst ab iOS 16.4; die App hat iOS 15 als Mindestziel → für die App Weg 1 nehmen |
| fa-AF nur als Abweichung von fa speichern | ca. −140 KB | 1.531 von 2.648 Texten sind gleich |
| JS/CSS verkleinern (esbuild, `charset:'utf8'`, sonst wird die Datei durch \u-Zeichen größer) | ca. −0,5 MB | Tests laufen gegen die verkleinerte Datei; Fehlermeldungen mit Quellzuordnung (Sourcemap) |
| PDF-Schrift Noto reduzieren (App) | ca. −0,9 MB | pdf-lib braucht TTF; reduzierte TTF reicht |
| pdf.js auf Version 4 (offener Punkt) | gering | vor allem Sicherheit (CVE-2024-4367 ist durch `isEvalSupported:false` schon entschärft, `src/app.js:1927/2008`) |

Hinweis: Im Store wird die App komprimiert geladen (index.html ca. 1,7 MB gezippt). Die Größe kostet also vor allem **Startzeit und Arbeitsspeicher**, weniger Download.

## 2. Geschwindigkeit

Playwright/Chromium, 390×844, CPU-Drosselung über CDP. Je 2 Durchläufe.

| Messung | 1× (normal) | 6× (schwaches Gerät) | 6×, nur Deutsch eingebettet |
|---|---|---|---|
| Laden bis DOMContentLoaded | 0,70 s | 5,4–5,7 s | 3,0–3,4 s |
| Skriptzeit beim Start | 0,31 s | 2,2–3,2 s | 1,8–2,1 s |
| Längste Einzelaufgabe (blockiert Bedienung) | 269 ms | 611–776 ms | 563–1.817 ms* |
| JS-Speicher nach Start | 50 MB | 48 MB | 42 MB |
| DOM-Knoten beim Start | ca. 10.000 | | |
| Klick „Leistungen“ | 116 ms | 357–441 ms | 271–356 ms |
| Beispiel 1 (31 Karten) | 75 ms | 424–724 ms | 372–524 ms |
| Sprache auf Arabisch | 121 ms | 753–895 ms | – |
| 3 Eingaben im Feld Miete | 28 ms | 55–163 ms | 43–77 ms |

\* Einzelwert unter Fremdlast; insgesamt war die Variante klar schneller.

Teure Stellen (Profil, normale Geschwindigkeit, Start + Beispiel + Sprachwechsel):
| Stelle | Selbstzeit | Empfehlung |
|---|---|---|
| Einlesen/Übersetzen des Skripts („program“) | ca. 550 ms | Sprachen nachladen (Punkt 1), verkleinern |
| `hebel`/`rek` in `erweiterungen/pflege.js:264` | ca. 140 ms | alle Kombinationen ohne Abkürzung, je Treffer `flatMap` + `Object.assign` → erst Zahlen, dann die 5 besten ausbauen |
| `setLang` | 92 ms | nur die sichtbare Ansicht neu zeichnen |
| `jumpPruefen` (Scroll-Ereignis) | 61 ms | IntersectionObserver |
| Speicherbereinigung | 100 ms | folgt aus großen Objekten |

Große Listen: Das Haushaltsbuch zeigt die Einträge eines Monats ohne Seitenaufteilung; 3.000 Einträge = 213 KB Speichertext, die bei jeder Änderung ganz neu geschrieben werden. Für normale Nutzung unkritisch.

Weitere Idee (mittlerer Aufwand): Alle Ansichten stehen beim Start im DOM (ca. 10.000 Knoten). Selten genutzte Bereiche (Prüfpaket, Haushalt, Einstellungen-Unterseiten) in `<template>` legen und erst beim Öffnen einsetzen.

## 3. Barrierefreiheit (WCAG 2.2 AA)

| Prüfung | Ergebnis |
|---|---|
| axe-core (`test/a11y.js`, 27 Seiten × hell/dunkel, WCAG 2.0–2.2 AA + Best Practice + Tippflächen 44 px) | **keine Probleme** (Laufzeit 1:39 min) |
| Kontrast (`tools/kontrast-pruefen.js`) | alle 59 Farbpaare hell und dunkel ausreichend; Startkacheln auch bei Rot-Grün-Schwäche unterscheidbar (ΔE 13,1) |
| Überschriften | je Ansicht genau eine h1, keine übersprungenen Ebenen (Start, Leistungen, Ergebnis, Ordner, Einstellungen, Briefe) |
| Fokus bei Ansichtswechsel | springt auf die Überschrift der Ansicht (`h-form`, `h-ordner`, `h-einst`, `h-briefe`); einfache Version: auf die Frage (`es-q`, h2, tabindex -1) |
| Vorlesen | 17 `aria-live="polite"`, 36 `role=alert/status`; Sprache und Richtung werden auf `<html>` gesetzt (`lang="ar" dir="rtl"`) |
| Tastatur | Tab-Reihenfolge logisch (Sprache, Hinweis, Kacheln, Leiste), Fokusring an allen getesteten Elementen |
| Bewegung reduziert | 4 Stellen mit `prefers-reduced-motion`; bei „reduziert“ bleiben nur Farbübergänge 0,15 s an Eingabefeldern (zulässig); Scrollen ohne Animation (`smooth()`) |
| **Schrift 200 %** | **Fehler:** Ergebnisseite 526 px breit bei 390 px und 320 px Bildschirm. Ursache: lange Wörter („Wohnberechtigungsschein“, „Unterhaltsvorschuss“) in `.card header h3`, `.desc`, `.head2`, `.karte-mehr` (`src/template.html:299`, `892`) ohne Umbruch. Android übernimmt bis 200 % (`MainActivity.java`), iOS Dynamic Type ebenfalls |
| 320 px bei 100 % | kein seitliches Scrollen |

Empfehlung: Umbruchregeln ergänzen und `test/a11y.js` um eine Prüfung „200 % Schrift, kein seitliches Scrollen“ auf Ergebnis und Antragsmappe erweitern.

## 4. Robustheit

| Bereich | Befund | Empfehlung |
|---|---|---|
| Speicher voll | Vorgangsdaten (`Vorgaenge.DATEN`, 10 Schlüssel) melden „Speicher voll oder gesperrt“ sichtbar (getestet in `test-vorgaenge-app.js:286`). Die Module Haushalt, Schulden, Ausziehen bekommen aber immer „gespeichert“ zurück (`src/app.js:4103`, `4119`, `4138`: `cb(null)`); nur Fristen werten das Ergebnis aus (`4123`) | Rückgabewert von `Store.set` wie bei Fristen weitergeben |
| Alte gespeicherte Daten | `migriereFragen`/`migriereEinkommen` und `test-altstaende.js` vorhanden (gut). Moduldaten haben `v: 1`, aber noch keinen Umbauweg | bei der nächsten Formatänderung `v` auswerten und testen |
| Kaputte Daten | Lesefehler → leere Daten; die nächste Änderung überschreibt (siehe Top 8). Kein Test dazu | sichern + Hinweis + Test |
| Kein Netz | App: alles lokal (strenge CSP). Web: Texterkennung (Tesseract) und PDF-Lesen von cdnjs; ohne Netz kommt die Meldung `el.fehler` (kein Absturz). Skripte werden **ohne `integrity`** (SRI) geladen | `integrity` + `crossorigin` setzen |
| Android-Zurück | `backButton` → gemeinsame Navigation; auf der Startseite erst nach oben scrollen, dann beenden (`src/app.js:934`) | in Ordnung |
| iOS-Wischen | `allowsBackForwardNavigationGestures = true` (`MainViewController.swift:14`) + History API (`src/navigation.js`) | in Ordnung |

## 5. Test-Abdeckung

| Befund | Messwert | Empfehlung |
|---|---|---|
| Verwaiste Testdatei | `test/test-ausziehen.js` läuft nirgends (9.315 Prüfungen, lokal grün) | in `test:rules` aufnehmen |
| Wackeliger Test `e2e-einfach` | feste Wartezeit 450 ms (`test/e2e-einfach.js:16`) gegen 350 ms Verzögerung der App (`src/app.js:2249`). CI-Läufe 44898338841 und 44899806030: „ABSTURZ page.click: Timeout 30000ms“, im 2. Versuch grün. `.catch(() => {})` bei `#es-neu` (Zeile 88) verdeckt Fehler | auf Zustand warten statt auf Zeit; insgesamt 18 `waitForTimeout` in den Browsertests prüfen |
| CI-Ausfälle durch Infrastruktur | mehrere Läufe am 21.11. scheiterten offenbar schon beim Schritt `playwright install-deps` (apt) | Browser zwischenspeichern oder Playwright-Container-Image nutzen |
| Größentest | misst Zeichen (`test/dom-test.js:272`), nicht Bytes | `Buffer.byteLength` |
| Ohne Test | 200 % Schrift/Umbruch; Startzeit (kein Leistungs-Budget); kaputte Moduldaten; Web ohne Netz beim PDF-Lesen; Rückgabe „nicht gespeichert“ bei Haushalt/Schulden | je ein kleiner Test; Leistungs-Budget z. B. „Start bei 4× unter X s“ nur in `schwer.yml` |
| Gut abgedeckt | Regeln (viele Fall- und Eigenschaftstests, Mutationstest), Navigation, Altstände, Vorgänge/Speicher voll, a11y mit axe, App-Test mit PDF | – |

## Messskripte (nur im Scratch, nicht im Repo)
`/tmp/groesse.js`, `/tmp/g2.js`–`/tmp/g4.js` (Größe), `/tmp/perf/messen.js` (Start/Interaktion mit Drosselung), `/tmp/perf/prof.js` (Profil), `/tmp/perf/a11y2.js`, `/tmp/perf/a11y3.js` (Überschriften, Tastatur, 200 %), `/tmp/perf/variante.js` (Variante nur Deutsch).
