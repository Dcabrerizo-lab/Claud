# Gerätetest Update 1.9 (Entwurf, 21.11.2026)

Für 1.9 gibt es keinen Build. Diese Liste gilt für den ersten Build, der 1.9 enthält.
Testen auf je einem echten Android-Handy und iPhone. Vorher: Testdaten anlegen (Hilfen-Check mit 1 Erwachsenem, Miete 600 €), nichts Echtes eingeben.

Zeichen: ✓ = bestanden, ✗ = Fehler (kurz notieren, was passiert ist), – = nicht zutreffend.

## 1. App-PIN und Vorgang-PIN

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 1.1 | Einstellungen → PIN-Sperre einschalten, PIN 6 Ziffern zweimal eingeben | Kurze Erklärung unter „Neue PIN“; PIN gespeichert | | |
| 1.2 | App ganz schließen, neu öffnen | Sperrbildschirm, mit PIN wieder alles da | | |
| 1.3 | App 2 Minuten in den Hintergrund, zurückholen | App ist wieder gesperrt | | |
| 1.4 | Einstellungen → PIN-Sperre ausschalten (bisherige PIN eingeben); einmal „Abbrechen“ testen | Ausschalten klappt; Abbrechen lässt alles wie vorher; Schalter zeigt den echten Stand | | |
| 1.5 | Mein Ordner → zweiten Vorgang anlegen → Bearbeiten → „Mit PIN sperren“ (6 Ziffern) | In der Liste nur „Gesperrter Vorgang“ mit Schloss | | |
| 1.6 | Gesperrten Vorgang öffnen: einmal falsche PIN, dann richtige | Falsch: Meldung; richtig: Vorgang offen. Nach mehreren Fehlversuchen: Wartezeit | | |
| 1.7 | Zu anderem Vorgang wechseln, dann zurück | Vorgang ist wieder gesperrt; keine Angaben vom anderen Vorgang zu sehen | | |
| 1.8 | Gesperrten Vorgang löschen | Geht ohne PIN, aber mit Rückfrage | | |

## 2. Bildschirmfoto-Schutz

Gilt nur, wenn die **App-PIN** an ist (eine Vorgang-PIN allein schaltet ihn nicht ein).

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 2.1 | App-PIN an. Bildschirmfoto machen | Android: Foto wird verhindert (Meldung oder schwarzes Bild). iPhone: Foto geht (iOS lässt sich nicht sperren) | | |
| 2.2 | App-PIN an. App-Übersicht öffnen (Wischen bzw. Viereck-Taste) | SoLo-Vorschau ist verdeckt (kein Inhalt lesbar) | | |
| 2.3 | Einstellungen → „Bildschirmfotos erlauben“ an, dann 2.1 und 2.2 wiederholen | Fotos möglich, Vorschau sichtbar; Meldung „Jetzt erlaubt …“ | | |
| 2.4 | Schalter wieder aus; App-PIN ganz aus | Ohne App-PIN: Fotos und Vorschau normal | | |
| 2.5 | iPhone: App-Übersicht öffnen und sofort zurück in SoLo | Abdeckung verschwindet, App bedienbar | – | |

## 3. Teilen und Messenger

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 3.1 | Einstellungen → Beratungsmodus an. Hilfen-Check → Ergebnis → „Für Klient zusammenstellen“ → Haken setzen → „Teilen“ | Datenschutz-Hinweis, dann Teilen-Menü des Handys | | |
| 3.2 | An einen Messenger (z. B. an sich selbst) schicken | Blatt kommt lesbar an (PDF) | | |
| 3.3 | „Drucken“ antippen | Druckvorschau des Blatts | | |
| 3.4 | Antragsmappe → „PDF teilen“ | Teilen-Menü, PDF vollständig | | |
| 3.5 | Teilen abbrechen, App schließen und neu starten | Keine Fehlermeldung; Datei-Reste werden still gelöscht | | |

## 4. SoLo-Datei und QR-Code (Weitergabe an Klienten)

Zwei Geräte: Gerät A = Beraterin (Beratungsmodus an), Gerät B = Klient (Privatmodus).

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 4.1 | A: „Für Klient zusammenstellen“ → an SoLo-App weitergeben → „Als SoLo-Datei teilen“, mit PIN | PIN (6 Ziffern) wird angezeigt; Teilen-Menü mit .solo-Datei | | |
| 4.2 | Datei per Messenger an B schicken; B: Datei speichern. B: Mein Ordner → „Von der Beratung bekommen“ → „SoLo-Datei öffnen“ → Datei wählen | PIN-Abfrage; mit richtiger PIN Vorschau „Das bekommst du“ | | |
| 4.3 | B: Haken lassen → „Als neuen Vorgang speichern“ | Neuer Vorgang in Mein Ordner; alte Vorgänge unverändert; Fristen auf Wunsch übernommen | | |
| 4.4 | B: falsche PIN eingeben | Meldung „PIN falsch“, nichts gespeichert | | |
| 4.5 | A: Weitergabe ohne PIN | Hinweis „Wer den Code oder die Datei hat, kann es lesen.“ | | |
| 4.6 | A: „QR-Code zeigen“ (nur ausgewählte Teile). B: „QR-Code scannen“ → Foto vom Bildschirm A | Android: Code wird gelesen, weiter wie 4.2 (falls stattdessen „Scannen geht nicht“: notieren). iPhone: Meldung „Scannen geht auf diesem Gerät nicht … SoLo-Datei“ (nativer Scanner erst im nächsten Update) | | |
| 4.7 | A: ganzer Vorgang als QR-Code | Bei zu viel Inhalt: „bitte als SoLo-Datei teilen“ | | |
| 4.8 | B: .solo-Datei direkt im Messenger antippen | Notieren, was passiert (direktes Öffnen kommt erst im nächsten Update; darf nicht abstürzen) | | |

## 5. Kamera-Scan (Brief einlesen)

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 5.1 | „Ich habe einen Brief bekommen“ → Jobcenter → Foto machen (Musterbescheid ausgedruckt) | Kamera-/Scanner öffnet; Werte werden in Felder eingetragen | | |
| 5.2 | Ergebnis ansehen | Werte gelb markiert, Hinweis „Bitte vergleiche sie mit dem Brief“; Vergleich erst nach „Werte stimmen“ | | |
| 5.3 | Schlechtes Foto (schräg, dunkel) | Unsichere Werte mit „Schwer zu lesen“ markiert; kein Absturz | | |
| 5.4 | PDF statt Foto wählen (Teilen → SoLo oder Datei wählen) | Werte werden gelesen, ohne Internet | | |
| 5.5 | Pflege → Pflegegrad selbst einschätzen → Ergebnis → „Mit dem Gutachten vergleichen“ → Gutachten fotografieren | Tabelle mit Punkten je Bereich, Unterschiede fett | | |
| 5.6 | Galerie öffnen | Kein Foto vom Scan in der Galerie | | |
| 5.7 | Nach dem Scan zu anderem Vorgang wechseln | Scan, Text und Ergebnis sind weg | | |

## 6. iOS-Speicher-Umzug (Angaben ohne iCloud-Sicherung)

Nur iPhone. Braucht ein Gerät mit **installierter 1.8.0 und gespeicherten Angaben** (Update-Weg, nicht Neuinstallation). Prüfen mit Mac: Safari → Entwickler → iPhone → SoLo (Web-Inspektor).

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 6.1 | 1.8.0 mit Angaben, 2 Vorgängen und App-PIN; dann neuen Build darüber installieren, öffnen | Alle Angaben, Vorgänge und PIN noch da | – | |
| 6.2 | Web-Inspektor → Konsole: `Capacitor.Plugins.SoloSpeicher.info()` | Ergebnis enthält `ohneSicherung: true` (und `bereit: true`, `ausweich: false`) | – | |
| 6.3 | Angabe ändern, App schließen, neu öffnen | Änderung gespeichert | – | |
| 6.4 | Neuinstallation (App löschen, neu installieren), 6.2 wiederholen | `ohneSicherung: true`, App startet leer | – | |
| 6.5 | Einstellungen → „Alle Vorgänge löschen“ | Alles weg, auch nach Neustart | – | |

Bei `ohneSicherung: false` oder `ausweich: true`: nicht veröffentlichen, Ergebnis an Claude geben.

## 7. ML-Kit-Netzwerk (nur Android)

Frage: Sendet die Texterkennung (Google ML Kit) Daten ins Netz? Die Datenschutzerklärung sagt „prüfen wir noch“.

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 7.1 | Flugmodus an → Brief per Foto einlesen (wie 5.1) | Texterkennung funktioniert ohne Internet | | – |
| 7.2 | Internet an, Netzwerk mitschneiden (z. B. App „PCAPdroid“, nur SoLo auswählen) → Brief einlesen, 5 Minuten warten | Notieren: Gibt es Verbindungen, zu welchen Adressen (z. B. firebaselogging, googleapis)? | | – |
| 7.3 | iPhone: dasselbe mit Mitschnitt (optional) | Keine Verbindungen (Apple Vision auf dem Gerät) | – | |

Ergebnis an Claude geben: Danach werden Datenschutzerklärung und Store-Angaben (Datensicherheit) angepasst.

## 8. Einfache Sprache: Pflege

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 8.1 | Einstellungen → Sprache „Einfache Sprache“. Pflege → Pflegegrad selbst einschätzen → Ergebnis → „Mit dem Gutachten vergleichen“ → Abschnitt „Das steht in deinem Gutachten …“ | Haken lauten „Urin: kann ihn **meistens nicht oder nie** halten …“ und „Stuhl: kann ihn **meistens nicht oder nie** halten …“ (vorher falsch: „meistens oder nie“) | | |
| 8.2 | Pflege-Fragen durchgehen (Bereich Selbstversorgung) | Texte verständlich, nichts abgeschnitten, auch bei großer Schrift | | |
| 8.3 | Sprache Somali → Ich ziehe aus → Karte „Unter 25“ (optional) | Text vorhanden, nichts abgeschnitten | | |
| 8.4 | Sprache Arabisch → Fristen oder „Es ist dringend“ | Unter wichtigen Sätzen klein der deutsche Satz; abschaltbar unter Einstellungen → Anzeige und Sprache | | |

## 9. Sicherheitspunkte mittel/niedrig (nächstes Update, Branch claude/b-sicherheit-mittel)

Nur am Gerät prüfbar. Im Code umgesetzt, aber ohne Gerätetest.

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| 9.1 | Brief prüfen → „PDF wählen“: ein digitales PDF und ein eingescanntes PDF (pdf.js 6.5.438, neu). Beim eingescannten PDF möglichst einen Schwarz-Weiß-Scan vom Kopierer oder aus einer Scan-App nehmen (Fax-Bild/CCITT oder JBIG2) | Text bzw. Seitenbild wird gelesen; keine Fehlermeldung; die Vorschau zeigt die Seite, nicht ein weißes Blatt | | |
| 9.1a | Dasselbe auf einem älteren Gerät: iPhone mit iOS 15, 16 oder 17 (vor 17.4) und Android 7 (WebView höchstens 119) | **Offen (Prüfung PR 138):** pdf.js 6.5.438 läuft laut Mozilla erst ab Safari 18 und Chrome 125. Erwartet wird hier die Meldung „Die PDF-Datei ließ sich nicht lesen …“; Foto und Text einfügen gehen weiter. Ergebnis notieren: davon hängt ab, ob 6.5.438 bleibt, die Mindestversion steigt oder 3.11.174 zurückkommt | | |
| 9.2 | Ganze App einmal durchklicken (Start, Hilfen-Check, Mappe, Brief prüfen, Einstellungen) | Alles bedienbar (Skripte liegen jetzt als eigene Dateien, strenge CSP ohne Inline-Skripte); Enter in einem Formularfeld lädt die App nicht neu | | |
| 9.3 | Beratung → QR-Code scannen → Foto vom Code. Danach mit Dateimanager oder `adb shell ls /sdcard/Android/data/<Paket>/files/Pictures` nachsehen | Ordner enthält kein `JPEG_…jpg` mehr (Foto nach dem Lesen gelöscht); ebenso nach Neustart der App | | – |
| 9.4 | Neue PIN „123456“ oder „4711“ festlegen (App-PIN und Vorgang-PIN) | Abgelehnt mit Meldung; „482910“ geht. Eine vorher festgelegte 4-stellige PIN entsperrt weiter | | |
| 9.5 | Antragsmappe ohne bekannte Anschrift → „Zuständige Stelle … suchen“ | Browser öffnet DuckDuckGo nur mit dem Suchbegriff (kein Ort, keine PLZ); Hinweis „Ort selbst dazuschreiben“ steht beim Link | | |
| 9.6 | iPhone neu starten, NICHT entsperren; SoLo nicht öffnen. Dann entsperren und SoLo öffnen (Xcode-Log optional) | Angaben vollständig da. Falls einmal „Deine Angaben lassen sich gerade nicht lesen …“ erscheint: verschwindet nach dem Entsperren von selbst, nichts geht verloren | – | |

Nur dokumentiert, nicht im Code geändert (braucht Gerät oder Entscheidung):
- ML Kit (Android): Netzwerk-Mitschnitt wie Abschnitt 7. Danach Datenschutzerklärung, STORE.md und Play-Formular „Datensicherheit“ angleichen.
- iOS-Datenschutzklasse: Die Datei der Angaben (SoloSpeicherPlugin.swift) hat weiter „bis zum ersten Entsperren“. Ein Wechsel auf `NSFileProtectionComplete` (Entitlement Data Protection) schützt das gesperrte Gerät besser, aber dann kann SoLo im Hintergrund bei gesperrtem Gerät nicht speichern (Speichern beim Verlassen der App kann scheitern). Erst am Gerät testen: Speichern beim Sperren, Wechsel in den Hintergrund, Sperre nach 2 Minuten.
- PIN-Schlüssel an Android Keystore / iOS Keychain binden (Schutz gegen Kopie des Speichers): großer Umbau, vorgemerkt.

## Ergebnis

| Gerät | Modell / Systemversion | Build | Datum | Tester | Alles ✓? |
|---|---|---|---|---|---|
| Android | | | | | |
| iPhone | | | | | |
