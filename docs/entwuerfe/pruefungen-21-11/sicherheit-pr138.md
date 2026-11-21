# Unabhängige Sicherheitsprüfung PR 138 (Sicherheit mittel/niedrig)

Geprüft: Branch `claude/b-sicherheit-mittel` (Stand 7285f73) gegen `claude/test-update-naechstes`. Prüfer hat den Code nicht geschrieben.

## Kurzfassung

| Frage | Antwort |
|---|---|
| Wirken die Maßnahmen? | Ja: PIN-Regeln, Fehlversuche, App-CSP, Web-CSP, Prüfsummen, Suchlink, QR-Foto, Sperr-Fenster, Lesefehler |
| Neue Fehler gefunden? | Ja, 3 schwere bei pdf.js 6 (2 behoben, 1 offen) und 2 rote Tests auf GitHub (behoben) |
| Freigabe | Zusammenführen in den Testzweig: ja, wenn GitHub grün ist. **Release: nein**, bis Punkt 1 entschieden ist |

## Prüfvermerk (21.11.2026)

| Nr. | Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|---|
| 1 | pdf.js 6.5.438 „legacy“ läuft nicht auf älteren Geräten. Die Aussage im PR und im Code („läuft auch in älteren WebViews, z. B. iOS 15/16“) ist falsch. Mozilla nennt für diese Ausgabe Chrome 125+ und Safari 18+ („mostly“). Im Code: Klassenblock `static {}` (Safari ab 16.4), `Promise.withResolvers` und `AbortSignal.any` ohne Ersatz (Safari ab 17.4, Chrome ab 119). Die iOS-App erlaubt iOS 15.0, Android ab 7 (WebView höchstens 119). Folge: Auf iOS 15 bis 17.3 lässt sich keine PDF-Datei mehr lesen (Meldung „ließ sich nicht lesen“). Mit 3.11.174 ging das. | hoch | **Offen (Entscheidung).** Falsche Aussage in `src/app.js`, `scripts/build-app.js`, PRUEFLISTE berichtigt; Gerätetest 9.1a ergänzt. Wege: (a) 6.5.438 behalten und Mindestversion fürs PDF-Lesen hinnehmen oder iOS-Mindestversion anheben; (b) zurück auf 3.11.174 mit `isEvalSupported: false` (das ist die von Mozilla genannte Abhilfe für CVE-2024-4367 und steht schon im Code); (c) beide Fassungen mitliefern und je nach Gerät laden | Mozilla pdf.js, FAQ „Which browsers/environments are supported?“ (github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions), abgerufen 21.11.2026; GitHub-Sicherheitshinweis GHSA-wgrm-67xf-hhpq (betroffen bis 4.1.392, behoben 4.2.67, Abhilfe `isEvalSupported: false`), abgerufen 21.11.2026; `app/ios/App/App.xcodeproj` (15.0), `app/android/variables.gradle` (minSdk 24); Datei `legacy/build/pdf.mjs` aus npm |
| 2 | Eingescannte PDFs blieben weiß. pdf.js 6 hat die Dekoder für Fax-Bilder (CCITT, übliches Format von Schwarz-Weiß-Scans), JBIG2 und JPEG 2000 nicht mehr im Programm, sondern in eigenen Dateien (`wasm/`). Der PR lieferte sie nicht mit. Folge: Seite weiß, Texterkennung findet nichts. Nachgestellt mit 2 Test-PDFs (App und Web). | hoch | Behoben. App: `scripts/build-app.js` kopiert `jbig2.wasm`, `openjpeg.wasm`, die JavaScript-Fassungen und die Lizenztexte nach `pdfjs/wasm/` (+0,8 MB). `src/app.js`: `pdfOptionen` und Klasse `PdfDaten`. Web: nur diese 2 Dateien von jsDelivr, nur mit Prüfsumme. Tests: `test/app-test.js` (2 neue), `test/e2e-pdf.js` (1 neue), `test/test-sicherheit.js` (4 neue). Gegenprobe: ohne Dateien rot; veränderte Datei wird abgelehnt | Lauf lokal 21.11.2026; Dateien aus npm `pdfjs-dist@6.5.438` (Prüfsumme des Pakets wie in der npm-Registry), mit cdn.jsdelivr.net Byte für Byte verglichen, abgerufen 21.11.2026 |
| 3 | Web-Version direkt als Datei geöffnet (file://): keine PDF-Datei lesbar. Der Browser startet den Worker aus der blob-Adresse dort nicht; der Rückfall von pdf.js (Code im Fenster laden) wurde von der neuen CSP blockiert. Auf GitHub war `e2e-pdf` deshalb rot (5 von 13). | hoch | Behoben: `blob:` in `script-src` der Web-CSP (`scripts/build.js`). Neben `'unsafe-inline'` öffnet das nichts Zusätzliches; der Code ist per Prüfsumme geprüft. `e2e-pdf` grün (14 Prüfungen) | GitHub-Lauf zu 7285f73 (Job „Browser – Fälle … PDF“); Lauf lokal 21.11.2026 |
| 4 | Test `test-vorgang-pin-dom` auf GitHub rot (3 von 26): erwartete noch „4 bis 8 Ziffern“. | mittel | Behoben: Erwartungen angepasst, 2 Prüfungen dazu (neue PIN mit 4 Ziffern abgelehnt, „123456“ abgelehnt) | GitHub-Lauf zu 7285f73 (Job „Oberfläche 1/2“) |
| 5 | Datenschutzerklärung (6 Kopien) nannte für die Vorgang-PIN noch „4 bis 8 Ziffern“. | mittel | Behoben: „6 bis 8 Ziffern“ | `src/vorgaenge.js` (`pinNeuPruefen`) |
| 6 | Lizenzen: Die Dekoder stammen aus PDFium (BSD 3 Klauseln, Apache 2.0) und OpenJPEG (BSD 2 Klauseln). Sie standen nicht in „Über die App → Lizenzen“. | niedrig | Behoben: Zeile in `src/template.html`, Lizenztexte im App-Paket | `wasm/LICENSE_JBIG2`, `wasm/LICENSE_OPENJPEG` im npm-Paket |
| 7 | `isEvalSupported: false` hat in pdf.js 6 keine Wirkung mehr (Option gibt es nicht; kein `eval`, kein `new Function` in den Dateien). | Hinweis | Bleibt stehen (schadet nicht, schützt bei Rückstufung) | Suche in `pdf.min.mjs`, `pdf.worker.min.mjs` |
| 8 | Prüfsummen (SRI) nachgerechnet: Tesseract 5.1.1 (cdnjs), pdf.js-Programm und Worker (jsDelivr) stimmen mit `src/app.js` überein. pdf.js 6.5.438 ist `latest`, Lizenz Apache-2.0. | in Ordnung | – | cdnjs.cloudflare.com, cdn.jsdelivr.net, registry.npmjs.org/pdfjs-dist, abgerufen 21.11.2026 |
| 9 | Web-CSP mit echtem Netz geprüft (Chromium, http und file://): digitales PDF, eingescanntes PDF, Texterkennung mit Tesseract laufen ohne CSP-Verstoß. | in Ordnung | – | Lauf lokal 21.11.2026 |
| 10 | Ohne Prüfsumme bleiben die Teile, die Tesseract selbst nachlädt (Worker, Kern, Sprachdaten von jsDelivr, feste Versionen). War vorher auch so. | niedrig | Offen. In PRUEFLISTE vermerkt | Netz-Mitschnitt des Laufs |
| 11 | App-CSP: Build erzeugt 13 Skriptdateien, keine Inline-Skripte, keine Ereignisattribute; in den Quellen kein per Code erzeugtes `on…=`. `test/app-test.js`: 73 Prüfungen grün, keine CSP-Verstöße. | in Ordnung | – | `npm`-Build und Lauf lokal 21.11.2026 |
| 12 | PIN: alte PINs mit 4 oder 5 Ziffern entsperren weiter (App und Vorgang), Ändern mit alter PIN geht. Versuche laufen nacheinander. Grenze bleibt: Wer den Speicher kopiert, probiert ohne Wartezeit; nach App-Neustart mit vorgestellter Uhr ist die Wartezeit weg. Sperrliste fängt keine Geburtsdaten und kein „112233“. | niedrig | Offen (Keystore/Keychain vorgemerkt) | `src/vorgaenge.js`, `test/test-vorgaenge.js` |
| 13 | QR-Foto: Name und Ordner passen zu Capacitor (`BridgeWebChromeClient.createImageFile`, `CameraUtils`, Filesystem `EXTERNAL`). Rest: Startet Android die App während einer Aufnahme neu, kann das Aufräumen beim Start dieses eine Foto löschen (Scan dann wiederholen). | niedrig | Offen (Gerätetest 9.3) | `@capacitor/android` 8.6.2, `@capacitor/camera` 8.2.6, `@capacitor/filesystem` 8.1.5 |
| 14 | Suchlink: Adresse enthält nur den festen Begriff. Datenschutzerklärung und Hinweistext stimmen mit dem Code überein. jsDelivr und cdnjs sind in der Datenschutzerklärung genannt (mit IP-Adresse). | in Ordnung | – | `src/app.js` (`empfSuchUrl`), `datenschutz.html` |
| 15 | Texte: 3 neue und 5 geänderte Schlüssel in 13 Sprachen und Einfacher Sprache vorhanden, Zahlen einheitlich (6–12, 6–8). Fremdsprachen nur auf Vollständigkeit und Zahlen geprüft, nicht muttersprachlich. | in Ordnung | – | `src/lang/` |

## Lokal gelaufen

| Test | Ergebnis |
|---|---|
| `npm run build:web`, `node scripts/build-app.js` (mit pdfjs-dist 6.5.438) | in Ordnung; Web-Datei 6,76 MB (Grenze 7 MB) |
| `test/app-test.js` | 73 Prüfungen grün |
| `test/e2e-pdf.js` | 14 Prüfungen grün |
| Regeln (45 Tests) | grün |
| Oberfläche (31 Tests) | 30 grün; `test-jahreswechsel` lokal wegen Speichermangel abgebrochen (auf GitHub prüfen) |
| eslint | keine Fehler |

Nicht geprüft: echte Geräte (Android, iPhone), siehe `docs/entwuerfe/geraetetest-1.9.md` Abschnitt 9.
