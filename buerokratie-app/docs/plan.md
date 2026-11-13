# Plan (fortgeschrieben)

Stand: 13.11.2026. Grundlage ist die CLAUDE.md, hier mit Davids Entscheidungen seither.

## Entscheidungen

| Datum | Entscheidung | Folge |
|---|---|---|
| 13.11.2026 | Formulare kommen oft auf Papier. **Beide Wege** sollen möglich sein: Abschreibhilfe und ausgefülltes Formular aus dem Foto | Neuer Spike M0b |
| 13.11.2026 | Der Foto-Weg kommt **nur in die App, wenn er offline zuverlässig funktioniert** | Freigabe-Bedingung unten. Bis dahin bleibt der Foto-Weg ein getrenntes Modul hinter einem Schalter, der MVP hängt nicht davon ab |

## Freigabe-Bedingung Foto-Weg (Vorschlag, von David zu bestätigen)

Der Foto-Weg geht in die App, wenn **alle** Punkte erfüllt und per Test belegt sind:

| # | Kriterium | Stand |
|---|---|---|
| 1 | **Offline:** Erkennung läuft bei gesperrtem Netz, kein Aufruf verlässt das Gerät | ✔ Chromium (`npm run test:offline`) · offen: Android-WebView, iOS |
| 2 | **Erkennung echter Fotos:** mindestens 20 Fotos von mindestens 5 verschiedenen Papierformularen (gutes und schlechtes Licht, schief): mindestens 90 % der Beschriftungen erkannt | offen (nur simulierte Fotos: 58/60 = 97 %) |
| 3 | **Keine falschen Werte:** keine falsche Zuordnung bei sicher erkannten Feldern. Jede Zuordnung wird ohnehin vom Nutzer bestätigt | offen (simuliert: 0 falsch) |
| 4 | **Kästchen:** bei mindestens 90 % der erkannten Felder sitzt der Text im richtigen Kästchen (Sichtprüfung der erzeugten PDFs) | offen (simuliert: alle) |
| 5 | **Dauer:** höchstens 5 Sekunden pro Seite auf einem Mittelklasse-Android-Handy (3–4 Jahre alt) | offen, braucht echtes Gerät |
| 6 | **Kein Steckenbleiben:** Erkennt die App nichts, kann der Nutzer Felder antippen und selbst zuordnen, oder er nutzt die Abschreibhilfe | offen (M2) |

Ist ein Punkt nicht erreichbar, bleibt der Foto-Weg draußen, und der MVP umfasst nur PDFs mit Formularfeldern.

## Drei Eingangswege, ein Tresor

```
                ┌───────────── Tresor (verschlüsselt) ─────────────┐
                │  Feldkatalog-Schlüssel: person.nachname, …       │
                └───────────────▲──────────────────────────────────┘
                                │ vault.read / vault.write
     ┌──────────────────────────┼──────────────────────────────┐
 PDF mit Feldern          Foto/Scan Papier                 Foto/Scan Papier
 (src/pdf)                Stufe 1 Abschreibhilfe           Stufe 2 Werte ins Foto
     │                         │                                │
     └──── gemeinsame Bestätigungsansicht „Feld → Wert“ (Bearbeiten, Ablehnen) ────┘
```

## Meilensteine

- **M0 PDF-Spike** ✔ (`spike-m0.md`), mit echten amtlichen PDFs noch nachzutesten
- **M0b Foto-Spike** ✔ (`spike-m0b.md`), Freigabe offen (siehe oben)
- **M1 Tresor** ✔ (`m1-tresor.md`): Passphrase plus Wiederherstellungscode, Sperren/Entsperren, Stammdaten-Maske, Modul-Schnittstelle
- **M2 Zuordnung und Ausfüllen:** PDF-Weg; Foto-Weg nur nach Freigabe, mit gemeinsamer Bestätigungsansicht. Für Fotos: Kästchen verschieben und Beschriftung von Hand wählen. Vorlagen merken (bei Fotos über einen Layout-Fingerabdruck)
- **M3 Sicherung** ✔ (`m3-sicherung.md`): verschlüsselter Export/Import, Einspielen mit Passphrase oder Wiederherstellungscode, Erinnerung
- **M4 Mehrsprachigkeit** (unverändert)
- danach: Android-Build für den geschlossenen Test, weitere Module
