# Gesamtprüfung Sicherheit und Datenschutz (Web, Android, iOS)

Stand: 21.11.2026 · geprüft: `origin/claude/test-update-1.9` (adae98d) sowie die noch nicht enthaltenen Branches `origin/claude/b-vorgang-pin` (cb35746) und `origin/claude/b-klient-qr` (1587a46). Nur gelesen, nichts geändert.

Methode: Code gelesen (src, erweiterungen, scripts, app/android, app/ios, Workflows), `npm audit` für beide package-lock-Dateien, Git-Verlauf nach Schlüsseln durchsucht. **Nicht** gemacht: Test auf echtem Gerät, Netzwerkmitschnitt, zusammengeführtes Android-Manifest (kein Gradle-Build). Punkte, die das brauchen, sind mit „zu prüfen“ markiert.

Schwere: **hoch** = vor dem nächsten Release klären · **mittel** = einplanen · **niedrig** = bei Gelegenheit. Aufwand: klein (< ½ Tag), mittel (½–2 Tage), groß (> 2 Tage).

## 1. Kurzfassung

| Schwere | Anzahl | Nummern |
|---|---|---|
| hoch | 4 | S1–S4 |
| mittel | 10 | S5–S14 |
| niedrig | 11 | S15–S25 |

Kein Befund „kritisch“: keine Schlüssel im Repo, keine XSS-Lücke gefunden, kein Server, Import fremder Dateien ist streng geprüft.

## 2. Handy verloren: Was ist geschützt?

| Lage | Schutz | Bewertung |
|---|---|---|
| Gerät mit Bildschirmsperre, ausgeschaltet oder gesperrt | Geräteverschlüsselung von Android und iOS | gut. iOS: nur Standardklasse „bis zum ersten Entsperren“ (S6) |
| Gerät ohne Bildschirmsperre, ohne App-PIN | nichts. App öffnen genügt, alle Vorgänge im Klartext | erwartbar, steht so in der Datenschutzerklärung |
| Gerät entsperrt gefunden, App-PIN an | AES-GCM, Inhalt wird erst nach PIN entschlüsselt (echte Verschlüsselung, kein bloßer Sichtschutz) | gut, aber: bis 2 Minuten nach dem Wegwischen offen (S5), Vorschau im App-Wechsler (S2) |
| Fachleute mit Zugriff auf den Speicher (Root, Forensik, Browser-Werkzeuge, iCloud-Sicherung) | PBKDF2 600 000 Durchläufe | 4 Ziffern: Minuten, 6 Ziffern: Minuten bis Stunden mit Grafikkarte. Fehlversuchszähler liegt im selben Speicher und lässt sich zurücksetzen (S7) |
| Geteilte oder gespeicherte PDF, CSV, SoLo-Dateien | keiner (liegen in Downloads, Mail, Messenger) | steht so in der Erklärung; bleiben auch nach Deinstallation (S11) |
| iCloud- oder Finder-Sicherung (iOS) | nur der Schutz des Apple-Kontos | Angaben liegen in der Sicherung (S1) |

## 3. Befunde

### Hoch

| Nr | Befund | Fundstelle | Risiko | Empfehlung | Schwere | Aufwand |
|---|---|---|---|---|---|---|
| S1 | **iOS: Angaben landen in der iCloud-/Finder-Sicherung.** Capacitor Preferences speichert in UserDefaults; die werden von iOS mitgesichert. Android ist richtig (`allowBackup="false"`). | `src/app.js:50–67` (StoreRoh), `app/ios/App/App/Info.plist`, keine Ausschluss-Logik in `AppDelegate.swift` | Gesundheits- und Sozialdaten verlassen das Gerät Richtung Apple. Widerspricht „nur auf deinem Gerät“ und „Beim Deinstallieren werden alle Daten gelöscht“ in `datenschutz-ios.html`. Ohne App-PIN im Klartext. | Entweder Speicherort wechseln (Datei in Application Support mit `isExcludedFromBackup` und `NSFileProtectionComplete`) oder die Erklärung ehrlich anpassen. Bis dahin Satz in der iOS-Erklärung ergänzen. Auf Gerät prüfen. | hoch | mittel |
| S2 | **Kein Schutz vor Bildschirmfoto und App-Wechsler-Vorschau.** Android ohne `FLAG_SECURE`, iOS ohne Abdeckung beim Wechsel in den Hintergrund. | `app/android/.../MainActivity.java`, `app/ios/App/App/SceneDelegate.swift` | Einkommen, Diagnosen, Schulden bleiben als Vorschaubild sichtbar, auch bei eingeschalteter PIN (Sperre greift erst nach 2 Minuten). Im Beratungsmodus sieht der nächste Klient die Vorschau des vorigen. | Android: `FLAG_SECURE` setzen, mindestens wenn PIN an ist (Einstellung „Bildschirmfotos erlauben“ für Beratung möglich). iOS: beim `sceneWillResignActive` eine Abdeckung einblenden. | hoch | klein |
| S3 | **Android-Texterkennung (Google ML Kit) sendet nach meinem Wissen Nutzungs- und Diagnosedaten an Google** (Gerätedaten, App-Kennung, Leistungswerte; nicht das Foto). Google verlangt dafür eine Angabe im Play-Formular „Datensicherheit“. **Zu prüfen** mit zusammengeführtem Manifest und Netzwerkmitschnitt. | `app/android/app/build.gradle` (`com.google.mlkit:text-recognition:16.0.1`), `AndroidManifest.xml` (Kommentar „baut keine Verbindungen auf“), `test/app-test.js` prüft nur die WebView | Widerspruch zu „Die App baut keine Verbindung zu Servern auf“, „keine Tracker“ und ggf. zum Play-Formular. Abmahn- und Store-Risiko. | Mitschnitt auf Testgerät. Wenn bestätigt: Erklärung und Play-Formular anpassen oder Texterkennung ohne Google-Übertragung wählen. Amtliche Quelle: Google-Seite „ML Kit – Google Play data disclosure“ abrufen und mit Datum ablegen. | hoch | mittel |
| S4 | **Beim Wechsel des Vorgangs bleiben eingelesene Inhalte des vorigen Klienten stehen.** `vgNeuLaden()` leert Fragebogen, Haushalt, Fristen usw., aber nicht: Scan-Ergebnis und Vorschaubild (`scanFound`, `scanBilder`), eingefügten Text (`sc-text`, `elText`), gesammelten Brieftext (`elGesammelt`), die Teile von „Brief prüfen“ (Prüfpaket), die Zwischenablage. | `src/app.js:3201–3224` (vgNeuLaden), `1829`, `1924`, `3943` | Beratung: Klient B sieht Bescheid oder Gutachten von Klient A. Gilt auch nach „Alle Angaben löschen“. | In `vgNeuLaden()` alle Einlese-Zustände zurücksetzen (Scan, Brief prüfen, Textfelder, Blob-Adressen freigeben). Test in `test/test-beratung.js` ergänzen. | hoch | klein |

### Mittel

| Nr | Befund | Fundstelle | Risiko | Empfehlung | Schwere | Aufwand |
|---|---|---|---|---|---|---|
| S5 | Automatische Sperre erst nach 2 Minuten im Hintergrund; keine Sperre nach Untätigkeit im Vordergrund. | `src/app.js:3188` (`VG_SPERRE_MS = 120000`) | Liegen gelassenes, entsperrtes Handy: App bleibt offen. | Wahl „sofort / 2 Minuten“, Standard mit PIN: sofort beim Verlassen. Zusätzlich Sperre nach z. B. 5 Minuten ohne Eingabe. | mittel | klein |
| S6 | iOS ohne Datenschutzklasse „Complete“; kein Entitlement, keine Datei-Attribute. | `app/ios/App/App/` (keine `.entitlements`) | Nach dem ersten Entsperren sind die Daten für Forensik am gesperrten Gerät lesbar. | Data-Protection-Entitlement `NSFileProtectionComplete` setzen (zusammen mit S1). | mittel | klein |
| S7 | PIN-Stärke: Mindestlänge 4 Ziffern (App-PIN 4–12, Vorgang-PIN 4–8). Schlüssel hängt nur an der PIN; Fehlversuchszähler und Wartezeit stehen unverschlüsselt im selben Speicher, Wartezeit hängt an der Geräteuhr. | `src/vorgaenge.js:9,12,54` (ITER, PIN_RE, wartezeit), Branch b-vorgang-pin `VPIN_RE` | Wer den Speicher kopieren kann, probiert alle 4- bis 6-stelligen PINs in Minuten bis Stunden durch. Die Erklärung sagt ehrlich „Sichtschutz“. | Mindestlänge 6 (wie empfohlen), einfache Folgen (123456, 000000) ablehnen. Mittelfristig Schlüssel zusätzlich an Android Keystore / iOS Keychain binden (dann hilft Kopieren des Speichers nicht mehr). | mittel | klein (Länge) / groß (Keystore) |
| S8 | CSP der App erlaubt `script-src 'unsafe-inline'`. Alle Skripte stehen inline in `index.html`. Es gibt keine `on…`-Attribute (0 gefunden), ein Auslagern ist also möglich. | `scripts/build-app.js:100` | Die CSP ist keine zweite Verteidigungslinie gegen XSS. Ein einziger Escape-Fehler gäbe Zugriff auf Preferences, Filesystem und Browser-Plugin (Abfluss über eine geöffnete Adresse möglich, trotz `connect-src 'self'`). | Im App-Build die Skripte in eine Datei `app.js` schreiben und `script-src 'self'` setzen. `style-src 'unsafe-inline'` kann bleiben. Test in `test/app-test.js`. | mittel | mittel |
| S9 | Web-Version ganz ohne CSP; lädt bei Texterkennung und PDF-Lesen Skripte von cdnjs und jsDelivr ohne Prüfsumme (SRI). | `scripts/build.js` (keine CSP), `src/app.js:1953, 1966, 2028` | Wird ein CDN manipuliert, läuft fremder Code mit Zugriff auf alle Angaben im Browser. IP-Adresse geht an die CDN-Betreiber. | Meta-CSP für die Web-Version mit genau diesen Quellen; `integrity` und `crossorigin` an die nachgeladenen Skripte; besser: Dateien selbst ausliefern. | mittel | klein |
| S10 | `pdfjs-dist 3.11.174` hat eine bekannte Lücke (CVE-2024-4367 / GHSA-wgrm-67xf-hhpq, Schadcode beim Öffnen einer PDF; `npm audit`: 1 × hoch in `app/`). Abgemildert: beide Aufrufe setzen `isEvalSupported: false`, in der App blockt die CSP zusätzlich `eval`. Im Haupt-Lock: 0 Meldungen. | `app/package.json`, `src/app.js:1927, 2008` | Restrisiko: ein neuer `getDocument`-Aufruf ohne die Option öffnet die Lücke wieder (Web ohne CSP besonders). Die 3er-Linie bekommt keine Korrekturen mehr. | Test, der jeden `getDocument(`-Aufruf auf `isEvalSupported: false` prüft. Mittelfristig auf pdfjs-dist ≥ 4.2.67. | mittel | klein / mittel |
| S11 | Reste im Zwischenspeicher: PDF, CSV, SoLo-Datei und Seitenbilder werden in `CACHE` geschrieben und nach dem Teilen gelöscht. Wird die App während des Teilen- oder Druckdialogs beendet, bleiben sie liegen (`solo-pdfseite-*.jpg`, `druck-*.pdf`, `speichern-*.pdf`, Kamerafoto). Android „Speichern“ legt die PDF dauerhaft in Downloads. | `src/app.js:1645–1647, 1714–1719, 1743–1745, 2001`, `src/haushalt.js:888, 1318`, `src/schulden.js:523`, `PdfAusgabePlugin.java` | Vollständige Antragsmappe im Klartext im App-Cache, auch bei eingeschalteter PIN. Downloads überleben die Deinstallation. | Beim App-Start und beim Sperren den Cache-Ordner der App leeren. In der Erklärung ergänzen: gespeicherte PDFs in Downloads bleiben nach dem Deinstallieren. | mittel | klein |
| S12 | Datenschutzerklärung deckt nicht alles ab, was die App tut: (a) Einlesen von Briefen, Bescheiden, Gutachten und PDFs (nur „Foto eines Formulars“ genannt), (b) PDF-Lesen lädt im Web pdf.js von cdnjs (nur „Texterkennung“ genannt), (c) Zwischenablage, (d) Beratungsmodus mit Daten Dritter, (e) Suche über DuckDuckGo (S13). Für die Branches fehlen (f) Vorgang-PIN und (g) Weitergabe per QR-Code/SoLo-Datei; keiner der beiden Branches ändert `datenschutz*.html`. | `datenschutz.html`, `datenschutz-ios.html`, `docs/`, `site/` | Erklärung und Verhalten laufen auseinander (Art. 13 DSGVO). | Abschnitte ergänzen, spätestens mit dem Merge der beiden Branches. `docs/PRUEFLISTE.md` angleichen. Für Beratungsstellen: Hinweis, dass die Stelle selbst verantwortlich ist für Klientendaten auf ihrem Gerät. | mittel | klein |
| S13 | Externer Suchlink enthält Angaben des Nutzers: Behörde plus Ort aus der Anschrift oder PLZ. | `src/app.js:1279–1288` (`suchOrt`, `empfSuchUrl`) | Suchanbieter erfährt Wohnort und welche Leistung gesucht wird. Verstößt gegen „keine Daten in URLs“. Erst nach Tippen. | Vor dem Öffnen kurz sagen, was übermittelt wird, oder nur die Behördenart ohne Ort suchen. In der Erklärung nennen. | mittel | klein |
| S14 | Weitergabe (Branch b-klient-qr): gute Technik, zwei Lücken im Ablauf. (a) Kein ausdrücklicher Hinweis zu Messengern (nur „PIN nicht zusammen mit dem Code schicken“). (b) PIN ist abschaltbar; dann ist „Ganzer Vorgang“ mit allen Eingaben für jeden lesbar, der Datei oder QR-Foto hat. | `src/klient.js` und `src/weitergabe.js` im Branch, Texte `kw.pin.aus`, `kw.wie.t` | Gesundheits- und Finanzdaten im Klartext über WhatsApp und Ähnliches; QR-Code auf dem Bildschirm lässt sich abfotografieren. | Messenger-Hinweis ergänzen (einfache Sprache). Für „Ganzer Vorgang“ die PIN verpflichtend machen oder eine zweite Rückfrage. | mittel | klein |

### Niedrig

| Nr | Befund | Fundstelle | Risiko | Empfehlung | Schwere | Aufwand |
|---|---|---|---|---|---|---|
| S15 | Vorgang-PIN (Branch): gesperrte Vorgänge lassen sich ohne PIN löschen (so gewollt). Ohne App-PIN bleiben Zeitstempel und die Namen der anderen Vorgänge sichtbar. | Branch b-vorgang-pin `src/vorgaenge.js` (`loeschen`), `src/app.js` Liste | Jemand mit Zugriff kann Daten vernichten; Klientennamen in der Liste sind für den nächsten Klienten sichtbar. | Im Beratungsmodus empfehlen: App-PIN an und Vorgänge sperren. Hinweis in der Erklärung der Sperre. | niedrig | klein |
| S16 | Zusammenspiel der beiden Branches: `b-klient-qr` rechnet schon mit `gesperrt`, kennt aber `oeffneGesperrt` nur über die Schnittstelle des anderen Branchs; `lotse.klient-blatt` kommt neu in `DATEN`. Probe-Merge: Konflikte nur in `package.json` und `docs/PRUEFLISTE.md`. | beide Branches | Nach dem Zusammenführen ungetestete Wege: gesperrten Vorgang weitergeben, importierten Vorgang sperren, „Rückgängig“ nach Import. | Nach dem Merge einen gemeinsamen Test: sperren → weitergeben → importieren → sperren. | niedrig | klein |
| S17 | App-PIN: mehrere Entsperrversuche gleichzeitig sind nicht hintereinandergeschaltet (nur der Knopf ist gesperrt). Bei der Vorgang-PIN ist das gelöst (`gVersuch`). | `src/vorgaenge.js:163–183` (`entsperren`) | Wartezeit nur über die Oberfläche durchgesetzt. Praktisch kaum nutzbar. | `entsperren` wie `gVersuch` in die Kette hängen. | niedrig | klein |
| S18 | Android `file_paths.xml` gibt den ganzen externen Speicher frei (`external-path path="."`). | `app/android/app/src/main/res/xml/file_paths.xml` | Unnötig breit; nur über von der App vergebene Rechte nutzbar. | Auf `cache-path` begrenzen (Kamera- und Teilen-Dateien liegen im Cache). Auf Gerät testen. | niedrig | klein |
| S19 | Android: `allowBackup="false"` ist gesetzt, aber keine `dataExtractionRules`. Geräte-zu-Geräte-Übertragung (Android 12+) ist damit nicht ausdrücklich ausgeschlossen. | `AndroidManifest.xml` | Angaben können beim Handy-Umzug mitwandern. | `android:dataExtractionRules` mit Ausschluss für Cloud und Geräteübertragung ergänzen. | niedrig | klein |
| S20 | Zwischenablage: kopierte Werte (Name, IBAN, Brieftext) bleiben dort, bis etwas anderes kopiert wird. | `src/app.js:1796–1803, 1912–1914, 2403`, `erweiterungen/kostensenkung.js:188` | Andere Apps oder der nächste Nutzer können einfügen. | Hinweis „kopiert“ reicht; optional beim Sperren und Vorgangswechsel leeren. | niedrig | klein |
| S21 | Tastatur lernt mit: Felder haben `autocomplete="off"`, das verhindert aber nicht das Lernen der Bildschirmtastatur (Namen, Anschrift). | `src/template.html` Eingabefelder | Vorschläge der Tastatur zeigen Klientennamen. | Für Name/Anschrift/Notizen `autocorrect="off" autocapitalize` prüfen; in der Beratungs-Anleitung erwähnen. | niedrig | klein |
| S22 | Android-Release ohne Code-Verkleinerung (`minifyEnabled false`), fester Debug-Schlüssel im Repo (nur Test-App mit eigener Paket-ID). | `app/android/app/build.gradle` | Gering: Debug-Schlüssel ist öffentlich, betrifft nur `…​.test`. | So lassen; sicherstellen, dass nie ein Debug-Build in den Store geht (Workflow prüft Signatur `C8:E4:5D:61`). | niedrig | – |
| S23 | Demo-Lizenzschlüssel (nur öffentlicher Teil) und Demo-Lizenz im Repo; Lizenzprüfung nur in der Vorschau, nicht in der App. | `erweiterungen/lizenz-schluessel.json`, `demo-lizenz.json`, `lizenz.js` | Keins, solange vor dem Verkauf ein eigener Schlüssel erzeugt wird. Offline-Lizenz ist grundsätzlich umgehbar (Geräteuhr, Code ändern). | Vor Verkauf `tools/lizenz-schluessel.js` ausführen; Build abbrechen lassen, wenn `demo: true` im Verkaufs-Build. | niedrig | klein |
| S24 | iOS-Erklärung enthält Android-Angaben (Internet-Berechtigung, ML Kit); die beiden Erklärungen nennen unterschiedliche Verantwortliche bei gleicher Kontaktadresse. | `datenschutz-ios.html` | Verwirrung, kein Sicherheitsrisiko. | Bestätigen, dass die zwei Verantwortlichen so gewollt sind; iOS-Text entschlacken. | niedrig | klein |
| S25 | „Scan mit Claude“ (nur Web in Claude): Bild geht nach Einwilligung an Anthropic; Antwort wird begrenzt und nur als Text gezeigt. | `src/app.js:2086–2130` | Einwilligung je Bild vorhanden; in der App nicht enthalten (`build-app.js` ersetzt den Block). | So lassen. | niedrig | – |

## 4. Was in Ordnung ist (geprüft, kein Befund)

| Bereich | Ergebnis |
|---|---|
| Speicherorte | Alle Inhaltsdaten (10 Schlüssel in `Vorgaenge.DATEN`) laufen über den Tresor; mit App-PIN steht nur noch `lotse.vorgaenge` verschlüsselt im Speicher, Klartext-Reste werden entfernt. Außerhalb liegen nur Einstellungen (Sprache, Beratungsmodus, Datum des Fristen-Hinweises). Kein IndexedDB, kein Service Worker, keine Cookies. |
| Verschlüsselung | PBKDF2-SHA-256 mit 600 000 Durchläufen, AES-GCM-256, zufälliges Salz, neuer IV bei jedem Speichern, PIN nie gespeichert, Schlüssel nicht exportierbar. Sperrbildschirm entschlüsselt erst nach richtiger PIN. |
| XSS | 60 `innerHTML`-Stellen in 4 Dateien durchgesehen (app.js 40, haushalt.js 12, schritte.js 6, ausziehen.js 2, übrige nur Kommentare): Nutzereingaben gehen überall durch `esc()` oder `textContent`; unescaped stehen nur feste Kennungen, Symbole und Zahlen. `esc()` maskiert `& < > "`; alle Attribute stehen in doppelten Anführungszeichen. Kein `eval`, kein `new Function`, kein `postMessage`. `test/test-sicherheit.js` deckt Freitextfelder und manipulierte Speicherstände ab. |
| CSV | Schutz vor Formeln vorhanden (`csvFeld`). |
| Import fremder Dateien/QR (Branch) | Größenlimits, Schutz vor Kompressions-Bomben, nur bekannte Felder, keine Prototyp-Schlüssel, keine Steuer- und Richtungszeichen, Anzeige nur als Text, immer neuer Vorgang, eigener Test mit bösartigen Dateien. |
| Externe Links | Alle mit `target="_blank" rel="noopener"`; in der App über das Browser-Plugin im Systembrowser. Rückmelde-Mail ohne Angaben aus dem Fragebogen. |
| Scan in der App | Erkennung auf dem Gerät, `saveToGallery: false`, Foto und Seitenbild werden nach dem Lesen gelöscht (Ausnahme: Abbruch der App, S11). |
| Android-Manifest | `allowBackup="false"`, nur die Start-Activity exportiert, FileProvider nicht exportiert, kein Klartext-Verkehr, nur Berechtigung INTERNET. |
| iOS | Keine ATS-Ausnahmen, Kamera-Text passend. |
| Benachrichtigungen | Keine System-Mitteilungen, kein Kalendereintrag (kein Plugin dafür). |
| Schlüssel | Kein Upload-Schlüssel, kein Passwort, kein privater Lizenzschlüssel im Repo oder im Git-Verlauf (alle Branches durchsucht). Signier-Geheimnisse nur als GitHub-Secrets. `.gitignore` sperrt `*.jks` und `*.keystore`. |
| Abhängigkeiten | Haupt-Lock: 0 Meldungen. App-Lock: nur pdfjs-dist (S10). Capacitor 8.6.2 aktuell. |

## 5. Vorschlag für die Reihenfolge

| Schritt | Befunde | Aufwand |
|---|---|---|
| 1 | S4 (Reste beim Vorgangswechsel), S2 (Bildschirmfoto/Vorschau), S5 (sofort sperren), S11 (Cache leeren) | zusammen etwa 1 Tag |
| 2 | S3 (ML Kit mitschneiden), S1 + S6 (iOS-Sicherung und Schutzklasse) | 1–2 Tage, Gerät nötig |
| 3 | S12, S13, S14, S24 (Texte der Erklärung, Messenger-Hinweis) zusammen mit dem Merge der beiden Branches | ½ Tag |
| 4 | S8, S9, S10 (CSP, SRI, pdf.js-Test) | 1 Tag |
| 5 | S7 (PIN-Länge sofort, Keystore später), Rest | nach Bedarf |
