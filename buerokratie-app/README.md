# Bürokratie-App (Arbeitsname)

Offline-App mit verschlüsseltem Stammdatentresor, die PDF-Formulare und fotografierte Papierformulare ausfüllt. Auftrag: siehe CLAUDE.md von David Cabrerizo.

**Stand: M1 (Tresor und Stammdaten-Maske) und M3 (Sicherung) fertig; Spikes M0 (PDF) und M0b (Foto) abgeschlossen.** Der Code liegt vorerst in diesem Unterordner des Leistungs-Lotse-Repos und ist unabhängig davon (eigene `package.json`).

| Pfad | Inhalt |
|---|---|
| `src/core/` | **Kern (Bibliothek):** Tresor, Verschlüsselung, Speicher, Feldkatalog, Modul-Schnittstelle |
| `src/ui/`, `src/lang/`, `index.html` | Oberfläche (Einrichten, Entsperren, Wiederherstellen, Stammdaten-Maske), Texte de/en |
| `data/feldkatalog.json` | Feldkatalog v1 (stabile Schlüssel, Typen, Beschriftungen, Synonyme) |
| `src/pdf/inspect.ts` | Formularfelder auslesen (Name, Typ, Beschriftung, Datumsformat, XFA, Verschlüsselung) |
| `src/pdf/fill.ts` | Felder befüllen mit Schutzregeln (Schriftwahl je Wert, Schreibschutz, gültige Listenwerte, XFA) |
| `src/pdf/dates.ts` | ISO-Datum → Format des Feldes |
| `src/scan/` | Papierformulare: Texterkennung-Adapter, Beschriftungen zuordnen, Kästchen finden, Werte ins Foto schreiben |
| `spike/m0/`, `spike/m0b/` | Testformulare und simulierte Fotos (synthetisch), Testdaten (erfunden), Spike-Läufe |
| `test/` | Vitest |
| `docs/spike-m0.md` | **Ergebnis M0**: was pdf-lib kann und wo es scheitert |
| `docs/spike-m0b.md` | **Ergebnis M0b**: Papierformulare per Foto (Abschreibhilfe und ausgefülltes PDF) |
| `docs/m1-tresor.md` | **Ergebnis M1** |
| `docs/m3-sicherung.md` | **Ergebnis M3** (Sicherung) |
| `docs/testbericht.md` | **Testbericht**: Prüfebenen, gefundene und behobene Fehler, was noch fehlt |
| `docs/entscheidungen.md` | technische Entscheidungen mit Begründung |
| `docs/plan.md` | fortgeschriebener Plan mit Davids Entscheidungen |
| `docs/pruefung-auftrag.md` | Prüfung des Auftrags, Stack-Vergleich, Widersprüche |

```bash
npm ci
npm run dev        # App im Browser entwickeln
npm run build      # dist/daten-tresor.html (eine Datei, offline)
npm test           # Logik-Tests
npm run test:e2e   # Browser: Ablauf, Robustheit, Barrierefreiheit, Zufallseingaben
npm run test:big   # großer Lauf (50 000 Fälle je Eigenschaft, 60 Browser-Sitzungen)
npm run test:mutation  # Mutationstests (Qualität der Tests)
npm run typecheck
npm run spike:fixtures && npm run spike && npm run spike:render   # PDF-Weg
npm run spike:photos && npm run spike:scan                         # Foto-Weg
```

**Hinweis:** Hilfe beim Ausfüllen, keine Rechtsberatung.
