# Gerätetest – nächstes Update

Weitere Abschnitte (z. B. Sprachen) ergänzen andere Sitzungen jeweils als eigenen Abschnitt.

## SoLo-Datei direkt öffnen und iPhone-Speicherschutz (Zweig claude/b-native-solo, 21.11.2026)

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
| S1 | Angaben eingeben, iPhone sofort sperren (Seitentaste), 1 Minute warten, entsperren | Angaben noch da, keine Meldung „Speichern nicht möglich“ | |
| S2 | Angaben eingeben, zum Home-Bildschirm wechseln, iPhone sperren, 5 Minuten warten, entsperren, SoLo öffnen | Angaben noch da | |
| S3 | iPhone neu starten, entsperren, SoLo öffnen | Angaben noch da | |
| S4 | Update von der Vorversion (ohne Löschen der App) installieren, SoLo öffnen | alle Vorgänge noch da (Datei wird beim Öffnen auf den neuen Schutz umgestellt) | |
| S5 | mit App-PIN: SoLo offen lassen, iPhone sperren, nach 3 Minuten entsperren | SoLo zeigt den App-Sperrbildschirm, nach PIN alle Angaben da | |
