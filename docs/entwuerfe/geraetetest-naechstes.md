# Gerätetest nächstes Update (Entwurf, 21.11.2026)

Gilt für den ersten Build, der „Sprachen nur bei Bedarf laden“ enthält (Branch claude/b-sprachladen).
Testen auf je einem echten Android-Handy und iPhone. Nichts Echtes eingeben.

Zeichen: ✓ = bestanden, ✗ = Fehler (kurz notieren, was passiert ist), – = nicht zutreffend.

## Sprachen nur bei Bedarf laden (ohne Netz)

Hintergrund: Beim Start lädt die App nur Deutsch und die gewählte Sprache. Die anderen Sprachen liegen als eigene Dateien im App-Paket und werden erst beim Wechsel geladen – ohne Internet.

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| S.1 | App frisch installieren, Flugmodus **an** (WLAN und mobile Daten aus), App öffnen | Startet normal auf Deutsch (bzw. in der Handy-Sprache, wenn es eine der 13 ist) | | |
| S.2 | Flugmodus an. Einstellungen → Sprache → **Arabisch** | Sofort Arabisch, Schrift von rechts nach links, kein Hinweis „konnte nicht geladen werden“ | | |
| S.3 | Flugmodus an. Sprache → **Ukrainisch** | Sofort Ukrainisch, kein Hinweis | | |
| S.4 | Flugmodus an. Sprache → **Somali** | Sofort Somali, kein Hinweis | | |
| S.5 | Flugmodus an. App ganz schließen (aus der App-Übersicht wischen), neu öffnen | App startet direkt auf Somali, ohne kurz Deutsch zu zeigen | | |
| S.6 | Flugmodus an. Auf der Startseite oben Sprachwahl → Arabisch, dann „Deutsch – Einfache Sprache“ | Beide Wechsel klappen; Einfache Sprache wie bisher | | |
| S.7 | Flugmodus an. Mappe/Ergebnis öffnen, Sprache wechseln (z. B. Russisch) | Inhalt in neuer Sprache neu gezeichnet; PDF teilen geht | | |
| S.8 | Beratungsmodus an → „Für Klient zusammenstellen“ → Blattsprache **Farsi** wählen (App-Sprache Deutsch) | Blatt erscheint (nach höchstens einem Augenblick) auf Farsi | | |
| S.9 | Flugmodus aus, Sprache zurück auf Deutsch | Alles wie vorher | | |
| S.10 | **Größe im Store-Paket**: Play Console → App-Bundle-Explorer bzw. App Store Connect → TestFlight-Build → Größe notieren; dazu Handy: Einstellungen → Apps → SoLo → Speicher | Größe notieren und mit 1.9.0 (VC 151) vergleichen. Erwartung: Paket etwa gleich groß (alle Sprachen bleiben offline im Paket), aber Start spürbar schneller | | |
| S.11 | Startzeit grob: App ganz schließen, öffnen, Stoppuhr bis Startseite sichtbar (je 3×, Mittelwert), alte und neue Fassung | Neue Fassung nicht langsamer, eher schneller | | |

Fehlerbild, auf das zu achten ist: Hinweis „Diese Sprache konnte gerade nicht geladen werden. Die App zeigt Deutsch.“ – darf im Flugmodus bei keiner Sprache erscheinen. Wenn doch: Sprache und Gerät notieren.

## SoLo-Datei direkt öffnen und iPhone-Speicherschutz (Branch claude/b-native-solo)

Eigener Abschnitt (Sitzung „native“). Spalten wie oben nicht nötig: Gerät steht in der Zeile.

Vorbereitung: Im Beratungsmodus zwei SoLo-Dateien erzeugen (eine mit PIN, eine ohne) und an das Testgerät schicken. Dazu eine falsche Datei (z. B. eine umbenannte Textdatei `test.solo` oder ein beliebiges PDF).

| Nr. | Gerät | Schritt | Erwartet | ✓ |
|---|---|---|---|---|
| D1 | Android | .solo im Messenger (z. B. WhatsApp, Signal) antippen → „Öffnen mit“ → SoLo | SoLo öffnet „Mein Ordner“, „Von der Beratung bekommen“ ist aufgeklappt, PIN-Abfrage erscheint | |
| D2 | Android | dieselbe Datei als Mail-Anhang (z. B. Gmail) öffnen | wie D1 | |
| D3 | Android | Dateien-App (z. B. „Dateien von Google“, Download-Ordner) → .solo antippen | wie D1 | |
| D4 | Android | im Messenger Datei lange drücken → „Teilen“ → SoLo | wie D1 (Teilen wird wie Öffnen behandelt) | |
| D5 | Android | SoLo war geschlossen (aus „Zuletzt verwendet“ weggewischt), dann D1 | SoLo startet und zeigt die PIN-Abfrage (nur einmal) | |
| D6 | Android | nach D1 SoLo über „Zuletzt verwendet“ wieder öffnen | keine erneute PIN-Abfrage, keine Fehlermeldung | |
| D7 | iPhone | .solo in Mail antippen → Teilen → SoLo | wie D1 | |
| D8 | iPhone | .solo im Messenger (WhatsApp, Signal) → Teilen → SoLo | wie D1 | |
| D9 | iPhone | Dateien-App → .solo antippen | SoLo erscheint als App für den Dateityp; wie D1 | |
| D10 | beide | richtige PIN → Vorschau → Speichern | neuer Vorgang, kein bestehender überschrieben | |
| D11 | beide | falsche PIN | „PIN falsch“, Abfrage bleibt | |
| D12 | beide | Datei ohne PIN öffnen | gleich die Vorschau „Das bekommst du“ | |
| D13 | beide | falsche Datei (umbenannte Textdatei, PDF) mit SoLo öffnen | nur Hinweis „Datei passt nicht“, keine Vorschau, App läuft normal weiter | |
| D14 | beide | App-PIN an, SoLo länger als 2 Minuten im Hintergrund, dann .solo öffnen | nach dem Entsperren der App: PIN-Abfrage der Datei sichtbar; falls nicht (App lädt beim Sperren neu), Datei noch einmal öffnen – das ist bekannt, bitte notieren | |
| D15 | iPhone | nach D7–D9: Dateien-App → „Auf meinem iPhone“ → SoLo | keine liegengebliebene .solo-Kopie (Ordner „Inbox“ leer oder nicht sichtbar) | |
| D16 | Android | Auswahl „Öffnen mit“ bei einem beliebigen PDF/ZIP ansehen | SoLo kann dort mit auftauchen (bekannt, weil .solo keinen eigenen Dateityp hat); Öffnen damit → Hinweis wie D13 | |

### iPhone: Speicherschutz „nur bei entsperrtem Gerät“ (Datenschutzklasse .complete)

| Nr. | Schritt | Erwartet | ✓ |
|---|---|---|---|
| P1 | Angaben eingeben, iPhone sofort sperren (Seitentaste), 1 Minute warten, entsperren | Angaben noch da, keine Meldung „Speichern nicht möglich“ | |
| P2 | Angaben eingeben, zum Home-Bildschirm wechseln, iPhone sperren, 5 Minuten warten, entsperren, SoLo öffnen | Angaben noch da | |
| P3 | iPhone neu starten, entsperren, SoLo öffnen | Angaben noch da | |
| P4 | Update von der Vorversion (ohne Löschen der App) installieren, SoLo öffnen | alle Vorgänge noch da (Datei wird beim Öffnen auf den neuen Schutz umgestellt) | |
| P5 | mit App-PIN: SoLo offen lassen, iPhone sperren, nach 3 Minuten entsperren | SoLo zeigt den App-Sperrbildschirm, nach PIN alle Angaben da | |
