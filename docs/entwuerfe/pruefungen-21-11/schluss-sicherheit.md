# Schlussprüfung Update 1.9: Sicherheit und Datenschutz

Stand: 21.11.2026 · geprüft: `origin/claude/test-update-1.9` (554fd8c) gegen `origin/main` · unabhängige Prüfung, nicht vom Verfasser des Codes.

Methode: Code gelesen (src/krypto.js, vorgaenge.js, weitergabe.js, klient.js, die geänderten Teile von app.js, Android- und iOS-Hülle, scripts/build.js, beide Datenschutzerklärungen, docs/STORE.md). Mitgelieferte QR-Bibliothek mit dem Original verglichen. Lokal gelaufen: `npm run build:web` und die Sicherheitstests einzeln (siehe unten). **Nicht** gemacht: Test auf echtem Gerät, Netzwerkmitschnitt, Xcode- oder Gradle-Build.

## Ergebnis

| Schwere | Anzahl | Was |
|---|---|---|
| schwer (vor Veröffentlichung) | 1 | P1: Play-Angabe „Datensicherheit“ in docs/STORE.md war falsch. Hier korrigiert; das Formular in der Play Console muss der Inhaber selbst ändern. |
| mittel (nächstes Update) | 4 | P2 bis P5 |
| niedrig | 4 | P6 bis P9 |
| im App-Code | 0 schwere | keine Code-Änderung nötig |

Die vier „hoch“-Punkte aus `sicherheit.md` (S1 bis S4) sind im Stand 554fd8c umgesetzt oder offengelegt. Von den dortigen mittel/niedrig-Punkten ist keiner schwer geworden.

## Prüfvermerk (21.11.2026)

| Nr | Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|---|
| P1 | docs/STORE.md, „Google Play: Datensicherheit“ sagte „Erhebt oder teilt die App Nutzerdaten? Nein“ und „keine Übertragung“. Die Datenschutzerklärung sagt richtig: Google ML Kit sendet auf Android Diagnosedaten an Google. Google Play zählt Daten, die eine eingebaute Bibliothek vom Gerät sendet, als „erhoben“. Die Angabe „Nein“ ist damit falsch. | schwer | docs/STORE.md korrigiert: Erhebt ja, teilt nein; Datentypen „Diagnose“ und „Geräte- oder andere IDs“, Zweck Analyse, verschlüsselt ja, Pflicht. **Offen (nur der Inhaber): dasselbe in der Play Console eintragen, bevor 1.9 eingereicht wird.** | Google, „ML Kit – Android data disclosure“, Stand 15.07.2026; Google Play Console-Hilfe, „Provide information for Google Play's Data safety section“ (answer/10787469); beide abgerufen 21.11.2026 |
| P1a | Welche ML-Kit-Variante? `com.google.mlkit:text-recognition:16.0.1` ist die gebündelte Variante (Modell in der App). Googles Aufstellung „Data collected in all features“ gilt auch für sie; für gebündelte Funktionen nennt Google „Per-installation identifiers“. Ein Wechsel auf die Variante über Google Play-Dienste ändert daran nichts. | Hinweis | keine | Google, „Text recognition v2 (Android)“ und „ML Kit – Android data disclosure“, abgerufen 21.11.2026 |
| P1b | Lässt sich die Übertragung per Einstellung verhindern? Google beschreibt keinen Schalter. Im Netz kursiert, Dienste der Übertragung im Manifest zu entfernen; das ist nicht von Google dokumentiert und ungetestet, deshalb nicht eingebaut. Sicher vermeidbar nur mit einer anderen Texterkennung. | mittel | keine (nächstes Update: Mitschnitt am Gerät, dann entscheiden) | Google, „ML Kit – Android data disclosure“ (kein Hinweis auf Abschalten), abgerufen 21.11.2026 |
| P2 | Werbetexte in docs/STORE.md („kein Tracking“, „Alles wird offline … berechnet“) stehen neben der neuen Play-Angabe. Rechnen und Lesen laufen auf dem Gerät, das stimmt. „Kein Tracking“ ist mit den Diagnosedaten von Google angreifbar. | mittel | keine (Entscheidung des Inhabers; Vorschlag: „kein Tracking durch SoLo“ oder Satz streichen) | wie P1 |
| P3 | QR-Code scannen (Android): Das Foto kommt über die Dateiauswahl der WebView mit Kamera. Nach meinem Wissen legt Capacitor dieses Foto im App-eigenen Bilderordner ab und löscht es nicht; das Aufräumen beim Start leert nur den Cache. Ohne PIN ist der Inhalt des QR-Codes lesbar. Nicht am Gerät geprüft. | mittel (zu prüfen) | keine | src/template.html (`kwFotoEin`), src/klient.js (`cacheAufraeumen`) |
| P4 | Sperren des geöffneten Vorgangs: Zwischen „Vorgang ist gesperrt“ und dem Neuladen der Oberfläche liegt ein Speichervorgang (Millisekunden). Feuert genau dann ein verzögertes Speichern, landen die Angaben des gesperrten Vorgangs im nächsten offenen Vorgang. Dafür müsste jemand nach „Sperren“ innerhalb etwa einer Sekunde in einem anderen Bereich ein Feld ändern. Praktisch kaum erreichbar. | mittel | keine (nächstes Update: während des Sperrens die Oberfläche sperren oder Schreiben in den Tresor anhalten) | src/app.js `vgGForm`, src/vorgaenge.js `gSperren` |
| P5 | Bildschirmfoto-Schutz gilt nur mit App-PIN. Ein einzeln gesperrter Vorgang ohne App-PIN ist geöffnet nicht geschützt. Die Erklärung sagt es richtig („bei eingeschalteter PIN-Sperre“). | mittel | keine | src/app.js `schutzAnwenden` |
| P6 | iOS: Ist die Datei mit den Angaben einmal nicht lesbar, meldet das Plugin einen Fehler; die App behandelt das wie „leer“. Wird die Datei danach lesbar, kann ein leerer Stand gespeichert werden. Tritt nur vor dem ersten Entsperren nach dem Einschalten auf; dann läuft die App nicht im Vordergrund. | niedrig | keine | app/ios/App/App/SoloSpeicherPlugin.swift, src/app.js `StoreRoh.get` |
| P7 | PIN-Stärke, Zähler der Fehlversuche im selben Speicher, Sperre erst nach 2 Minuten (S5, S7 aus `sicherheit.md`). Die App und die Erklärung nennen es „Sichtschutz“; keine falsche Zusage. | niedrig bis mittel | keine | sicherheit.md S5, S7 |
| P8 | CSP der App mit `'unsafe-inline'`, Web-Version ohne CSP und ohne Prüfsummen für nachgeladene Skripte, pdfjs-dist 3.11.174 (S8 bis S10). Unverändert, abgemildert (`isEvalSupported: false`). | mittel (bekannt) | keine | sicherheit.md S8 bis S10 |
| P9 | Text „Den Namen in der Liste sieht jeder“ (Einzelnen Vorgang sperren): Der echte Name wird verschlüsselt, sichtbar bleibt nur der freiwillige Kurzname. Die Erklärung sagt also eher zu viel als zu wenig. | niedrig | keine | datenschutz.html, src/vorgaenge.js `gSperren` |

## Geprüft, ohne Befund

| Bereich | Ergebnis |
|---|---|
| krypto.js | Nur WebCrypto. PBKDF2-HMAC-SHA-256 mit 600 000 Durchläufen, Salz 16 Byte, IV 12 Byte neu bei jedem Speichern, AES-GCM-256, Schlüssel nicht exportierbar, PIN nie gespeichert. |
| Vorgang-PIN | Gesperrte Vorgänge stehen nur verschlüsselt im Speicher (`fuerSpeicher`), mit und ohne App-PIN. Öffnen nur im Arbeitsspeicher; Klartext-Schlüssel werden nach dem Öffnen entfernt. Kopieren und Umbenennen gesperrter Vorgänge sind gesperrt. „Rückgängig“ hebt keine Sperre auf. Versuche laufen nacheinander (Wartezeit nicht umgehbar über die Oberfläche). |
| Speicherung | Alle Inhalte laufen über `Vorgaenge.DATEN` (11 Schlüssel, neu `lotse.klient-blatt`). Außerhalb nur Einstellungen (Sprache, Thema, Schalter). Suche speichert nichts. Module mit eigenem `localStorage`-Rückfall sind in app.js alle auf den Tresor umgestellt. |
| Vorgangswechsel | `einleseResteLeeren` leert Scan, Vorschaubilder, Brieftext, Prüfpaket, Antragsmappe, Blatt für Klienten, offene Import-Vorschau und PIN-Abfrage. |
| Import (QR-Code, SoLo-Datei) | Grenzen: Datei 2 MB, Kode 1 MB, Inhalt 512 KB, Feld 200 KB, Foto 30 MB. Entpacken in Stücken mit Abbruch (Kompressions-Bombe). Nur bekannte Felder, keine Prototyp-Schlüssel, keine Steuer- und Richtungszeichen. Kopf-Bytes sind mit verschlüsselt geprüft. Immer neuer Vorgang. Anzeige nur über `textContent`, feste Element-Zuordnung. Kein Code wird ausgeführt. |
| innerHTML | Alle neuen Stellen im Diff durchgesehen: nur feste Symbole und Texte durch `esc()`. klient.js, weitergabe.js, denetz.js ganz ohne innerHTML. |
| CSV | `csvFeld` schützt vor Formeln (Haushaltsbuch, Belege, Schulden). |
| Android | `FLAG_SECURE` über eigenes Plugin, gesteuert durch App-PIN und Schalter. `allowBackup="false"`, nur Berechtigung INTERNET. |
| iOS | Eigener Speicher in Application Support mit `isExcludedFromBackup` (Ordner und Datei, nach jedem Schreiben neu gesetzt), Übernahme aus UserDefaults erst nach geprüftem Schreiben. Abdeckung im App-Wechsler bei App-PIN. Apple nennt das Merkmal ausdrücklich für „application support files“. |
| Abhängigkeiten | `src/vendor/qrcode.js` ist Byte für Byte `qrcode-generator@2.0.4` (dist/qrcode.js, SHA-256 79ec86f8…f791c), kein `eval`, kein Netz. Sonst keine neuen Laufzeit-Abhängigkeiten. |
| Datenschutzerklärungen | Vier Kopien je Datei sind gleich. Vorgang-PIN, Weitergabe, Bildschirmfoto-Schutz, iOS-Sicherung, ML Kit, Zwischenablage, Suchlink stimmen mit dem Code überein. Die ML-Kit-Liste entspricht Googles Aufstellung (Stand 15.07.2026). |
| Apple „App-Datenschutz“ in STORE.md | „Wir erfassen keine Daten“ bleibt richtig: iOS nutzt Apple Vision, nicht ML Kit. |

## Tests (lokal, einzeln)

| Test | Ergebnis |
|---|---|
| `npm run build:web` | grün |
| test-sicherheit, test-altstaende, test-vorgaenge-app | grün |
| test-weitergabe-dom, test-weitergabe-boese, test-beratung, test-klient-dom, test-vorgang-pin-dom, test-vorgang-wechsel-dom, test-cache-reste | grün |
| test-vorgaenge, test-weitergabe, test-vorgang-pin, test-krypto, test-abhaengigkeiten | grün |
| vollständige Läufe `test:rules` und `test:dom` | lokal nicht vollständig gelaufen; auf GitHub prüfen |
| test-jahreswechsel | lokal vom System beendet („Killed“, Speicher der Prüfumgebung), unabhängig von dieser Änderung; auf GitHub prüfen |

## Quellen (alle abgerufen am 21.11.2026)

- Google: ML Kit – Android data disclosure, developers.google.com/ml-kit/android-data-disclosure (Stand 15.07.2026)
- Google: Text recognition v2 (Android), developers.google.com/ml-kit/vision/text-recognition/v2/android
- Google Play Console-Hilfe: Provide information for Google Play's Data safety section, support.google.com/googleplay/android-developer/answer/10787469
- Apple: URLResourceValues.isExcludedFromBackup, developer.apple.com/documentation/foundation/urlresourcevalues/isexcludedfrombackup
- npm: qrcode-generator 2.0.4 (Vergleich der Datei)
