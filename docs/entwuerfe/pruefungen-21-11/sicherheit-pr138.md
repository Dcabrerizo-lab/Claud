# Unabhängige Sicherheitsprüfung PR 138 (Sicherheit mittel/niedrig)

Geprüft: Branch `claude/b-sicherheit-mittel` (Stand 7285f73) gegen `claude/test-update-naechstes`. Prüfer hat den Code nicht geschrieben.

## Kurzfassung

| Frage | Antwort |
|---|---|
| Wirken die Maßnahmen? | Ja: PIN-Regeln, Fehlversuche, App-CSP, Web-CSP, Prüfsummen, Suchlink, QR-Foto, Sperr-Fenster, Lesefehler |
| Neue Fehler gefunden? | Ja, 3 schwere beim Umstieg auf pdf.js 6 und 2 rote Tests auf GitHub. Alle behoben |
| Entscheidung 21.11.2026 | pdf.js bleibt 3.11.174 mit `isEvalSupported: false`. Kein Umstieg auf 4+/6 in diesem Update |
| Freigabe | Ja, wenn der GitHub-Lauf grün ist. Am Gerät offen: Abschnitt 9 im Gerätetest |

## Entscheidung zu pdf.js

| Punkt | Inhalt |
|---|---|
| Was bleibt | pdf.js 3.11.174, dieselbe Fassung wie bisher (App: mitgeliefert; Web: cdnjs) |
| Warum kein 6.5.438 | Läuft laut Mozilla erst ab Chrome 125 und Safari 18. Die iOS-App erlaubt iOS 15. Auf iOS 15 bis 17.3 ließe sich keine PDF-Datei mehr lesen |
| Lücke CVE-2024-4367 | Geschlossen über die von Mozilla genannte Abhilfe: `isEvalSupported: false` an jedem `getDocument`-Aufruf. Dazu erlaubt keine CSP eval für JavaScript |
| Neu trotzdem | Prüfsummen (SRI) für Programm und Worker von cdnjs; Worker wird mit Prüfsumme geladen |
| **Vermerk fürs übernächste Update** | **pdf.js 4+/6 erst, wenn eine iOS-Mindestversion ab 17.4 entschieden ist.** Dann die Bild-Dekoder (`wasm/`) mitliefern, siehe Nr. 2 |

## Prüfvermerk (21.11.2026)

| Nr. | Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|---|
| 1 | pdf.js 6.5.438 „legacy“ läuft nicht auf älteren Geräten. Die Aussage im PR („läuft auch in älteren WebViews, z. B. iOS 15/16“) war falsch. Mozilla nennt Chrome 125+ und Safari 18+ („mostly“). Im Code: Klassenblock `static {}` (Safari ab 16.4), `Promise.withResolvers` und `AbortSignal.any` ohne Ersatz (Safari ab 17.4, Chrome ab 119). Aus Code und Mozilla-Angabe abgeleitet, nicht am Gerät getestet. | hoch | Behoben durch Entscheidung: zurück auf 3.11.174 (`app/package.json`, `app/package-lock.json`, `scripts/build-app.js`, `src/app.js`, `tools/scan-muster.js`). Begründung mit Quellen im Kommentar bei `ladePdfjs` | Mozilla pdf.js, FAQ „Which browsers/environments are supported?“ (github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions), abgerufen 21.11.2026; GitHub-Sicherheitshinweis GHSA-wgrm-67xf-hhpq (betroffen bis 4.1.392, behoben 4.2.67, Abhilfe „Set the option isEvalSupported to false“), abgerufen 21.11.2026; `app/ios/App/App.xcodeproj` (15.0), `app/android/variables.gradle` (minSdk 24) |
| 2 | Mit pdf.js 6 blieben eingescannte PDFs weiß: Die Dekoder für Fax-Bilder (CCITT), JBIG2 und JPEG 2000 liegen dort in eigenen Dateien (`wasm/`), der PR lieferte sie nicht mit. | hoch | Entfällt mit 3.11.174 (Dekoder im Programm). Nachweis: `test/app-test.js` liest `test/daten/scan-ccitt.pdf` und `scan-jpx.pdf`, `test/e2e-pdf.js` liest `text-ccitt.pdf`; Seitenbild jeweils nicht weiß. Zusatzdateien und Lizenzzeile wieder entfernt | Läufe lokal 21.11.2026 |
| 3 | Web-Version direkt als Datei geöffnet (file://): mit dem PR keine PDF-Datei lesbar; `e2e-pdf` auf GitHub rot (5 von 13). Die neue CSP blockierte das Laden des Worker-Codes aus der blob-Adresse. | hoch | Behoben: `blob:` in `script-src` der Web-CSP (`scripts/build.js`). Neben `'unsafe-inline'` öffnet das nichts Zusätzliches; der Code ist per Prüfsumme geprüft. `e2e-pdf` grün (14 Prüfungen) | GitHub-Lauf zu 7285f73; Lauf lokal 21.11.2026 |
| 4 | Test `test-vorgang-pin-dom` auf GitHub rot (3 von 26): erwartete noch „4 bis 8 Ziffern“. | mittel | Behoben, 2 Prüfungen dazu (neue PIN mit 4 Ziffern abgelehnt, „123456“ abgelehnt) | GitHub-Lauf zu 7285f73 |
| 5 | Datenschutzerklärung (6 Kopien) nannte für die Vorgang-PIN noch „4 bis 8 Ziffern“. | mittel | Behoben: „6 bis 8 Ziffern“ | `src/vorgaenge.js` (`pinNeuPruefen`) |
| 6 | Fremdanbieter: pdf.js kommt in der Web-Version wieder von cdnjs. | mittel | Datenschutzerklärung (6 Kopien) und Text „Nur Web-Version“ in der App nennen wieder cdnjs für pdf.js; jsDelivr bleibt für die Texterkennung genannt | `src/app.js` (`ladePdfjs`), `datenschutz.html` |
| 7 | Prüfsummen (SRI): Tesseract 5.1.1 und pdf.js 3.11.174 (Programm, Worker) neu berechnet. Dateien aus npm, Dateien von cdnjs und Angaben von cdnjs stimmen überein. | in Ordnung | Hashes in `src/app.js` | cdnjs.cloudflare.com und api.cdnjs.com (Feld `sri`), registry.npmjs.org, abgerufen 21.11.2026 |
| 8 | Web-CSP mit echtem Netz geprüft (Chromium, http und file://): digitales PDF, eingescanntes PDF (CCITT, JPEG 2000), Texterkennung mit Tesseract laufen. | in Ordnung | – | Lauf lokal 21.11.2026 |
| 9 | Ohne Prüfsumme bleiben die Teile, die Tesseract selbst nachlädt (Worker, Kern, Sprachdaten von jsDelivr, feste Versionen). War vorher auch so. | niedrig | Offen. In PRUEFLISTE vermerkt | Netz-Mitschnitt des Laufs |
| 10 | App-CSP: Build erzeugt 13 Skriptdateien, keine Inline-Skripte, keine Ereignisattribute; in den Quellen kein per Code erzeugtes `on…=`. `test/app-test.js`: 73 Prüfungen grün, keine CSP-Verstöße. | in Ordnung | – | Build und Lauf lokal 21.11.2026 |
| 11 | PIN: alte PINs mit 4 oder 5 Ziffern entsperren weiter (App und Vorgang), Ändern mit alter PIN geht. Versuche laufen nacheinander. Grenze bleibt: Wer den Speicher kopiert, probiert ohne Wartezeit; nach App-Neustart mit vorgestellter Uhr ist die Wartezeit weg. Sperrliste fängt keine Geburtsdaten und kein „112233“. | niedrig | Offen (Keystore/Keychain vorgemerkt) | `src/vorgaenge.js`, `test/test-vorgaenge.js` |
| 12 | QR-Foto: Name und Ordner passen zu Capacitor (`BridgeWebChromeClient.createImageFile`, `CameraUtils`, Filesystem `EXTERNAL`). Rest: Startet Android die App während einer Aufnahme neu, kann das Aufräumen beim Start dieses eine Foto löschen (Scan dann wiederholen). | niedrig | Offen (Gerätetest 9.3) | `@capacitor/android` 8.6.2, `@capacitor/camera` 8.2.6, `@capacitor/filesystem` 8.1.5 |
| 13 | Suchlink: Adresse enthält nur den festen Begriff. Datenschutzerklärung und Hinweistext stimmen mit dem Code überein. | in Ordnung | – | `src/app.js` (`empfSuchUrl`), `datenschutz.html` |
| 14 | Texte: 3 neue und 5 geänderte Schlüssel in 13 Sprachen und Einfacher Sprache vorhanden, Zahlen einheitlich (6–12, 6–8). Fremdsprachen nur auf Vollständigkeit und Zahlen geprüft, nicht muttersprachlich. | in Ordnung | – | `src/lang/` |

## Lokal gelaufen (Endstand mit pdf.js 3.11.174)

| Test | Ergebnis |
|---|---|
| `npm run build:web`, `node scripts/build-app.js` | in Ordnung |
| `test/app-test.js` | 73 Prüfungen grün (mit CCITT- und JPEG-2000-PDF) |
| `test/e2e-pdf.js` | 14 Prüfungen grün |
| `test/test-sicherheit.js` | 45 Prüfungen grün |
| Regeln (45 Tests) | grün |
| Oberfläche | nicht noch einmal vollständig lokal (Speicher knapp): auf GitHub prüfen |

Nicht geprüft: echte Geräte (Android, iPhone), siehe `docs/entwuerfe/geraetetest-1.9.md` Abschnitt 9.
