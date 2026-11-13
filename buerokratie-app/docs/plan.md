# Plan (fortgeschrieben)

Stand: 13.11.2026. Grundlage ist die CLAUDE.md, hier mit Davids Entscheidungen seither.

## Entscheidungen

| Datum | Entscheidung | Folge |
|---|---|---|
| 13.11.2026 | Formulare kommen oft auf Papier. **Beide Wege** sollen möglich sein: Abschreibhilfe und ausgefülltes Formular aus dem Foto | OCR und Foto-Formulare kommen in den MVP (abweichend von CLAUDE.md §8). Neuer Spike M0b |

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
- **M0b Foto-Spike** ✔ (`spike-m0b.md`), mit echten Fotos noch nachzutesten
- **M1 Tresor:** Passphrase, Sperren/Entsperren, Stammdaten-Maske, verschlüsselt (unverändert)
- **M2 Zuordnung und Ausfüllen:** PDF-Weg *und* Foto-Weg mit gemeinsamer Bestätigungsansicht. Für Fotos: Kästchen verschieben und Beschriftung von Hand wählen. Vorlagen merken (bei Fotos über einen Layout-Fingerabdruck)
- **M3 Backup** (unverändert)
- **M4 Mehrsprachigkeit** (unverändert)
- danach: Android-Build für den geschlossenen Test, weitere Module
