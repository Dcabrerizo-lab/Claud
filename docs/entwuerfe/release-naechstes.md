# Release-Unterlagen nächstes Update (Entwurf, 21.11.2026)

Nur ein Entwurf. STATUS.md, CLAUDE.md, VersionCode und docs/STORE.md sind nicht geändert.
Grundlage: offene PRs gegen `claude/test-update-naechstes` (#152–#173, Stand 21.11.2026, per `gh api` gelesen), `docs/AENDERUNGEN.md` (Abschnitt „Nächste Version“), `docs/entwuerfe/geraetetest-naechstes.md`, `docs/entwuerfe/geraetetest-1.9.md`.

**Vorbehalt:** Noch ist keiner dieser PRs gemergt. Der Text unten gilt nur, wenn die genannten PRs im Build sind:

| Satz im Text | braucht PR |
|---|---|
| Pflege in allen 13 Sprachen | #173 (Basis #153) |
| Antragsmappe als Aufgabenliste | #159 |
| Zwei Wege im Ergebnis | #160 |
| Geld und Schulden | #152, #170 |
| SoLo-Dateien direkt öffnen, iPhone-Datenschutz | #161 |
| Sprachen laden schneller | #158 |
| Genauer gerechnet | #162, #163; #172 erst nach der Fable-Prüfung („nicht mergen“) |

Fehlt einer davon im Build, den Satz streichen.

## 1. „Was ist neu“ (Play Store „Neuigkeiten“ und App Store „Neu in dieser Version“)

Grenze 500 Zeichen (Play). Gleicher Text für beide Stores.

**Deutsch (490 Zeichen)**

```
Neu: Pflege jetzt in allen 13 Sprachen. Die Antragsmappe führt dich Schritt für Schritt wie eine Aufgabenliste. Gibt es zwei Wege (z. B. Wohngeld oder Grundsicherungsgeld), zeigt das Ergebnis beide. Geld und Schulden: Beratungsstelle in deiner Nähe suchen, Musterschreiben bei Mietschulden und drohender Stromsperre, Fristen klarer. SoLo-Dateien von der Beratung öffnen sich direkt. Sprachen laden schneller, auch offline. Besserer Datenschutz am iPhone. Viele Leistungen genauer gerechnet.
```

**Englisch (492 Zeichen)**

```
New: Care (Pflege) now in all 13 languages. The application folder guides you step by step like a task list. If there are two options (e.g. housing benefit or Grundsicherungsgeld), the result shows both. Money and debts: find a debt advice service near you, sample letters for rent arrears and a threatened power cut, clearer deadlines. SoLo files from your advisor open directly. Languages load faster, also offline. Better data protection on iPhone. Many benefits calculated more precisely.
```

Kürzere Ersatzsätze, falls ein PR fehlt:
- ohne #173: „Pflege jetzt in allen 13 Sprachen.“ streichen.
- ohne #158: „Sprachen laden schneller, auch offline.“ streichen.

## 2. Gerätetest für David (Abhakliste)

Wichtigste zuerst. Nichts Echtes eingeben. Die Nummern in Klammern verweisen auf die ausführlichen Listen (S/D/P = geraetetest-naechstes.md, sonst geraetetest-1.9.md). In 1.9 sind noch keine Ergebnisse eingetragen. Die übernommenen Punkte sind deshalb weiter offen.

### Android

- [ ] **.solo öffnen:** Datei im Messenger antippen → „Öffnen mit“ → SoLo. Erwartet: PIN-Abfrage; das klappt auch, wenn SoLo vorher geschlossen war. Beim Zurückkehren aus „Zuletzt verwendet“ kommt keine zweite Abfrage. (D1, D5, D6)
- [ ] **Falsche Datei** (umbenannte Textdatei, PDF) mit SoLo öffnen. Erwartet: nur der Hinweis „Datei passt nicht“. (D13)
- [ ] **Flugmodus-Sprachwechsel:** Arabisch → Ukrainisch → Somali, dann App ganz schließen und neu öffnen. Erwartet: sofort richtig, nie der Hinweis „konnte nicht geladen werden“, Start direkt auf Somali. (S.1–S.5)
- [ ] **Druck/PDF aus der App:** Schulden-Liste → „Blatt für die Schuldnerberatung“ → Drucken. Erwartet: Beträge beschriftet, Zahlen und Daten nicht umgebrochen, keine Lupe im Druck. Antragsmappe → „Drucken oder teilen“: PDF vollständig. (neu, 3.3, 3.4)
- [ ] **Netto-Helfer:** Lohn, Brutto 3000 → „Netto ausrechnen“ (steht direkt unter Brutto) → Steuerklasse I → Kirche nein. Erwartet: „ungefähr … € im Monat (geschätzt)“. Das Netto-Feld ändert sich erst nach „Übernehmen“, die Tastatur verdeckt nichts.
- [ ] **Bildschirmfoto mit App-PIN:** Erwartet: gesperrt, App-Übersicht verdeckt. (2.1, 2.2)
- [ ] **Brief per Foto und als PDF** (digital und eingescannt). Erwartet: Werte gelb markiert, klappt auch ohne Netz. (5.1, 5.4, 9.1)
- [ ] **ML-Kit-Mitschnitt** (PCAPdroid, nur SoLo): Brief einlesen, 5 Minuten warten, Verbindungen notieren. (7.2) Wichtig für die Store-Angaben.
- [ ] **„Beratungsstelle finden“:** Der Link öffnet den Browser mit meine-schulden.de.
- [ ] **Update über 1.9.0** installieren. Erwartet: Vorgänge, PIN und Fristen noch da. (6.1 sinngemäß)
- [ ] **QR-Code scannen:** Danach liegt kein `JPEG_…jpg` mehr im App-Ordner. (9.3)

### iPhone

- [ ] **.solo öffnen** aus Mail, Messenger und Dateien-App → Teilen → SoLo. Erwartet: PIN-Abfrage, danach keine liegengebliebene Kopie in „Auf meinem iPhone → SoLo“. (D7–D9, D15)
- [ ] **iPhone sperren:** Angaben eingeben, sperren, nach 1 Minute und nach 5 Minuten entsperren, einmal neu starten. Erwartet: Angaben da, keine Meldung „Speichern nicht möglich“. (P1–P3, 9.6)
- [ ] **Mit App-PIN sperren**, nach 3 Minuten entsperren. Erwartet: Sperrbildschirm, danach alles da. (P5)
- [ ] **Update über 1.9.0.** Erwartet: alle Vorgänge da, die Datei wird auf den neuen Schutz umgestellt. (P4)
- [ ] **Flugmodus-Sprachwechsel** wie bei Android. (S.1–S.5)
- [ ] **Druck/PDF aus der App:** Schulden-Blatt → Drucken (AirPrint-Vorschau lesbar), Antragsmappe teilen.
- [ ] **Netto-Helfer** wie bei Android.
- [ ] **App-Übersicht mit App-PIN:** Vorschau verdeckt, die Abdeckung verschwindet beim Zurückkehren. (2.2, 2.5)
- [ ] **Brief-Scan im Flugmodus** (Apple Vision). Erwartet: geht ohne Netz. (5.1)
- [ ] **Älteres iPhone** (iOS 15–17), wenn vorhanden: PDF lesen geht. (9.1a)

### Beide

- [ ] **Startzeit** (3× Stoppuhr, alt gegen neu) und **Paketgröße** notieren. (S.10, S.11)
- [ ] **Pflege in einer Fremdsprache** (z. B. Arabisch): Übersicht und Einschätzung übersetzt, nichts abgeschnitten, auch bei großer Schrift. (8.2 sinngemäß)

## 3. docs/STORE.md: Vorschläge (nicht umgesetzt)

| Stelle | Vorschlag | Grund |
|---|---|---|
| Play „Neuigkeiten“, App Store „Neu in dieser Version“ | Text aus Abschnitt 1 einsetzen | Der jetzige Text beschreibt 1.9.0 |
| Beschreibung, „Mein Ordner“ | Satz ergänzen: „SoLo-Dateien von deiner Beratungsstelle öffnest du direkt aus Messenger oder Mail.“ | #161 |
| Beschreibung, „Pflege“ | „… auch in deiner Sprache.“ | #173 |
| Beschreibung, „Antragsmappe“ | „Schritt für Schritt wie eine Aufgabenliste. Drucken oder als PDF teilen.“ | #159 (Knopf heißt jetzt „Drucken oder teilen“) |
| Beschreibung, „Geld und Schulden“ | „Schuldnerberatung: Stelle in deiner Nähe suchen“ statt „Stelle finden“; „Sparen im Alltag … mit Energie-Check (Abschlag und Tarif)“ | #152 (Link zur BAG-SB-Suche, Energie-Check an einer Stelle) |
| Beschreibung, Länge | Nach den Ergänzungen neu zählen (jetzt 3.982 von 4.000). Dafür Kürzungen nötig, z. B. in der Liste „Was die App prüft“ | Grenze 4.000 Zeichen |
| App-Prüfung „Notes“ | Testschritte anpassen: „Briefe für die Anträge machen“ bzw. „Drucken oder teilen“ statt „Antragsmappe erstellen → PDF teilen“. Satz ergänzen: „.solo-Dateien (Beratungsmodus) lassen sich über Teilen → SoLo öffnen; keine Netzverbindung.“ | #159, #161; die Notes nennen noch Stand 1.8.0 |
| Apple „Nutritional Label“ | Bleibt „keine Daten erfasst“; Hinweis zu .solo steht schon da | #161 bringt keine neue Berechtigung |
| Google „Datensicherheit“ | Bleibt bis zum ML-Kit-Mitschnitt (Gerätetest Android) so; danach Datenschutzerklärung und Formular angleichen | weiter offen |
| Datenschutzerklärung (datenschutz.html / -ios.html) | Prüfen, ob „Speicherschutz iPhone: nur bei entsperrtem Gerät lesbar“ und „.solo öffnen: SoLo liest eine Kopie und löscht sie“ erwähnt werden sollen | #161; nur Klarstellung, keine neue Datenverarbeitung |
| Bildschirmfotos | Neue Motive erwägen: Antragsmappe als Aufgabenliste, Pflege auf Arabisch | Sichtbare Neuerungen |

## 4. Bekannte Grenzen (für Release-Notiz, Support und Tester)

| Grenze | Folge | Stand / nächster Schritt |
|---|---|---|
| 12 Behörden außerhalb Bayerns ohne belegte Anschrift | Nur Name und Website, keine Anschrift | Nachprüfung 21.11.2026; Website gesperrt oder nicht abrufbar |
| Übersetzungen ohne Muttersprachler-Prüfung | Vor allem ps, so, fa, fa-AF und die neuen Texte (Pflege: 404 Schlüssel je Sprache, Geld und Schulden) | Der deutsche Originalsatz steht unter wichtigen Sätzen (Sicherheitsnetz); Prüfung durch Muttersprachler fehlt |
| ML Kit (Android): Datenfluss zu Google nicht gemessen | Store-Angabe folgt Googles Aufstellung | Netzwerk-Mitschnitt (Gerätetest) |
| iPhone: QR-Code scannen geht nicht | Meldung „bitte SoLo-Datei schicken“ | Nativer Scanner noch offen |
| Android: SoLo erscheint auch bei anderen Dateien in „Öffnen mit“ | Falsche Datei ergibt nur einen Hinweis | .solo ist kein eigener Android-Dateityp |
| App-PIN nicht an Keystore/Keychain gebunden | Kein Schutz gegen Kopie des Gerätespeichers durch Fachleute | Großer Umbau, vorgemerkt |
| pdf.js bleibt 3.11.174 | Alte Geräte unterstützt | Neuere Fassung erst bei iOS-Mindestversion 17.4 |
| Schätzungen | Netto-Helfer, Energie-Check, Ratenempfehlung, „Was bleibt mir?“ sind ungefähre Werte und als solche gekennzeichnet | so gewollt |
| Beratungsstellen-Suche ist eine fremde Seite (BAG-SB) | Angaben dort können laut Anbieter veraltet sein | SoLo nennt nur die Art der Stelle |
| Rechtsstand November 2026 | Ab 1.1.2027 Hinweis „Regeln veraltet“; Wohngeld-Reform und Mietenstufen 2027 sind noch Entwurf | Nach Verkündung Regeln und PLZ-Daten tauschen |
| Druck und PDF aus der App | Nur am Computer (Chromium, Druckansicht) geprüft | Gerätetest |
| Stundenweise Verhinderungspflege unter 8 Stunden | Text sagt „kann“ und „frag bei der Pflegekasse“, keine amtliche Fundstelle | Fundstelle nachtragen (rechtsfragen-rot.md, „Offen geblieben“) |
| PR #172 (Rechenplan-Befunde) | Erst nach der Fable-Prüfung mergen | offen |
| Schulden-Liste: Verweis-Kacheln oben | Bewusst so (Entscheidung David), obwohl Audit C anders riet | kein Handlungsbedarf |
