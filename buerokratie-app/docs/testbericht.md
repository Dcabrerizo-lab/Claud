# Testbericht

Stand: 13.11.2026 · Abdeckung Kern: 100 % Zeilen, 98,9 % Verzweigungen · geprüft: Kern (Tresor, Verschlüsselung, Speicher, Feldkatalog, Module) und Oberfläche (M1)

## Kurzfassung

Der Kern und die Oberfläche wurden auf sieben Ebenen geprüft, mit insgesamt mehreren Millionen automatisch erzeugten Testfällen. Dabei wurden **13 echte Fehler und Schwachstellen gefunden und behoben** (Liste unten). Kein Test ist zum Bestehen abgeschwächt oder abgeschaltet worden.

Was **nicht** geprüft werden konnte, steht am Ende. Das betrifft vor allem echte Handys und echte Formulare. Diese Punkte gehören vor eine Veröffentlichung.

## Ebenen und Umfang

| Ebene | Was | Umfang (großer Lauf) | Ergebnis |
|---|---|---|---|
| 1. Beispieltests | Abläufe, Abnahmekriterien, Fehlermeldungen | 172 Tests | ✔ |
| 2. Vollständige Prüfung | jedes Datum 1900–2100 in 4 Schreibweisen; alle Tag/Monat-Kombinationen 0–39 × 0–19 | 293 656 + 6 400 Fälle | ✔ |
| 3. Eigenschaftsbasiert (Zufallseingaben) | IBAN (gültige, Tippfehler, Zahlendreher), Beträge, jedes Katalogfeld mit beliebigem Text inkl. Steuerzeichen und Emoji, Verschlüsselung beliebiger Daten, Bitfehler, Passphrasen in allen Schriften | 300 000 IBAN-Fälle; je Eigenschaft bis 200 000 Fälle (`FC_RUNS=50000`) | ✔ |
| 4. Modellbasiert | zufällige Bedienfolgen (Schreiben, Löschen, Hinzufügen, Entfernen, Sperren, Passphrase-Wechsel, Moduldaten), nach **jedem** Schritt Vergleich mit einem Referenzmodell; zusätzlich 2–4 gleichzeitig geöffnete Fenster | 2 000 Folgen mit Ø 31 Schritten (≈ 62 000 Schritte) + 2 000 Mehrfenster-Abläufe | ✔ |
| 5. Fehlereinspeisung | Speicher voll mitten im Speichern, Absturz beim Einrichten, Sperren während des Speicherns, 300 gleichzeitige Änderungen, Tresor in anderem Fenster gelöscht | je hunderte Durchläufe | ✔ |
| 6. Mutationstests | Stryker baut automatisch ≈ 1 040 kleine Fehler in den Kern ein und prüft, ob die Tests sie finden | Mutationswert **73 % → 92–93 %** | siehe unten |
| 7. Oberfläche im Browser | kompletter Ablauf; Robustheit (2 Fenster, Doppeltippen, Sperren/Schließen direkt nach dem Tippen, Code nie bestätigt); Barrierefreiheit (axe-core, WCAG 2.1 AA) in 32 Varianten (hell/dunkel, normale/große Schrift, de/en, 280–1280 px) × 7 Bildschirme; Tastaturbedienung; Zufallseingaben mit feindlichen Werten (`<script>`, SQL, RTL-Zeichen, 201 Zeichen) und Vergleich nach Neuladen | 12 + 8 + 225 Prüfungen; 60 Sitzungen mit 1 756 Feldeingaben | ✔ Chromium, Firefox und WebKit (Safari-Engine, in der CI) |

Zusätzlich gibt es **Referenzwerte**: Argon2id und PBKDF2 liefern exakt dieselben Schlüssel wie die unabhängigen Referenzimplementierungen (argon2-cffi/C-Referenz, Python hashlib). Ein Austausch des Verfahrens würde also sofort auffallen.

**Update-Sicherheit:** `test/fixtures/vault-v1.json` ist ein eingefrorener Tresor im Format von heute. Jede künftige Version muss ihn mit Passphrase und Wiederherstellungscode öffnen und alle Werte unverändert liefern. Sonst schlägt die CI fehl. So kann kein Update die Daten der Nutzer unlesbar machen.

## Gefundene und behobene Fehler

| # | Fund | Gefunden durch | Folge ohne Behebung |
|---|---|---|---|
| 1 | Schlug das Speichern fehl (Gerät voll), blieb der neue Wert trotzdem angezeigt | Fehlereinspeisung (geplant) | Nutzer glaubt, gespeichert zu haben; nach dem nächsten Öffnen ist der Wert weg |
| 2 | Betrag „12 5“ wurde stillschweigend als 125 gelesen | Eigenschaftstest | falscher Betrag im Formular |
| 3 | Leeren eines Felds legte einen leeren Haushaltseintrag an | Mutationstest | „Geister-Person“ im Haushalt |
| 4 | **Zwei offene Fenster überschrieben sich gegenseitig** | Durchsicht + Mehrfenster-Test | Datenverlust, z. B. in Beratungsstellen |
| 5 | Doppeltippen auf „Entfernen“ konnte zwei Personen entfernen | Durchsicht + Browsertest | falsche Person gelöscht |
| 6 | Tippen und sofort „Sperren“ oder App schließen: letzte Eingabe verloren | Durchsicht + Browsertest | Eingabe weg |
| 7 | App vor dem Notieren des Wiederherstellungscodes geschlossen: kein Weg zurück | Durchsicht | bei vergessener Passphrase alles weg |
| 8 | Abgebrochenes Einrichten blockierte ein erneutes Einrichten | Fehlereinspeisung | App unbenutzbar |
| 9 | Vier Fenster gleichzeitig: Speichern gab nach 10 Versuchen auf | Mehrfenster-Zufallstest | Fehlermeldung beim Speichern |
| 10 | Knopf „Entfernen“ ragte bei großer Schrift auf 320 px aus dem Bild | Layoutprüfung | seitliches Scrollen |
| 11 | Safari/WebKit: seitliches Scrollen auf kleinen Handys, Kontrast der „Gespeichert“-Meldung | CI mit WebKit | schlechtere Bedienbarkeit auf iPhones |
| 12 | Hinweis „Keine Rechtsberatung“ außerhalb eines Seitenbereichs | axe-core | für Screenreader schwerer auffindbar |
| 13 | Abgleich zwischen Fenstern, der genau beim Sperren eintrifft, warf einen Fehler | Mutationstest | Fehlermeldung in der Konsole |

Außerdem wurde toter Code entfernt (ein nie gelesenes Änderungsprotokoll), und doppelte Prüfungen wurden vereinfacht.

## Mutationstests: was übrig bleibt

Die verbleibenden ≈ 7 % sind ganz überwiegend **gleichwertige Mutanten**: Änderungen, die das Verhalten nicht ändern und daher von keinem Test erkannt werden können. Beispiele:

- Text von Fehlermeldungen, die nur Entwickler sehen
- das Überschreiben von Schlüsselmaterial mit Nullen nach Gebrauch (Sicherheitsmaßnahme, von außen nicht beobachtbar)
- Schleifengrenzen `<` statt `<=`, wo der zusätzliche Durchlauf nichts bewirkt

Alle anderen Funde aus den Mutationstests wurden mit gezielten Tests geschlossen.

## Was nicht geprüft ist (vor Veröffentlichung nötig)

1. **Echte Geräte:** Android-WebView (Capacitor-App), Safari auf iPhone/iPad, ältere und langsame Handys. Firefox und WebKit laufen nur in der CI als Desktop-Engines. Echte Geräte verhalten sich teils anders (Speicherlöschung durch das System, Tastaturen, Hintergrund-Wechsel). Empfehlung: geschlossener Test mit 12 Personen auf verschiedenen Geräten (ohnehin von Google verlangt) und ein Testprotokoll.
2. **Echte Screenreader:** axe-core findet etwa die Hälfte aller Barrierefreiheitsprobleme automatisch. TalkBack (Android) und VoiceOver (iOS) müssen von Hand geprüft werden.
3. **Dauer der Schlüsselableitung auf Handys:** am Rechner 0,3 s, auf alten Handys unbekannt.
4. **Nutzertest mit der Zielgruppe:** Verständlichkeit der Texte, besonders für Menschen mit wenig Deutsch.
5. **Übersetzungen** (tr, ar, ru, uk, pl, ro) gibt es noch nicht. Arabisch (RTL) ist darum noch nicht geprüft.
6. **PDF-Ausfüllen und Foto-Weg** sind noch Spikes (M0, M0b), keine Produktfunktion. Sie werden vor der Freigabe genauso getestet.
7. **Backup** (M3) fehlt noch. Ohne Backup kann ein Datenverlust durch den Browser (Speicher geleert) alles kosten.

## Selbst ausführen

```bash
cd buerokratie-app
npm test                 # alle Logik-Tests (Standardumfang, ~20 s)
npm run test:e2e         # Browser: Ablauf, Robustheit, Barrierefreiheit, Zufallseingaben
npm run test:offline     # Offline-Nachweis Texterkennung
npm run test:big         # großer Lauf: 50 000 Fälle je Eigenschaft, 60 Browser-Sitzungen (~10 min)
npm run test:mutation    # Mutationstests (~10 min)
BROWSER=firefox npm run test:e2e   # nach: npx playwright install firefox
```
