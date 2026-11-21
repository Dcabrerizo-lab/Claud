# Rechenplan je Leistung

Stand 21.11.2026, Code-Stand `origin/claude/b-buendel-n2` (cf3d925). Beschreibt nur, **was `src/rules.js` rechnet**, in derselben Reihenfolge.
Abweichungen vom Gesetz stehen als **Befund** (nicht im Code geändert). Fundstellen: gesetze-im-internet.de bzw. die im Code genannte Quelle, Abruf laut Code-Kommentar (meist 20./21.11.2026).

| Leistung | Datei | Funktion(en) in `src/rules.js` | Unabhängige Referenz (`test/referenz.js`) |
|---|---|---|---|
| Wohngeld | [wohngeld.md](wohngeld.md) | `wohngeld`, `wohngeld0`, `wgEinkommen`, `wgMiete`, `wgBetrag`, `wgYmax`, `wgVorsichtig` | `wohngeld` (schon vorhanden) |
| Kinderzuschlag | [kinderzuschlag.md](kinderzuschlag.md) | `kinderzuschlag`, `kizRechnung`, `kizRechnung0`, `kizMinderungEltern` | `kinderzuschlag`, `kizBetrag` |
| Grundsicherungsgeld | [grundsicherungsgeld.md](grundsicherungsgeld.md) | `grundsicherungsgeld`, `ggeldRechnung`, `ggeldRechnung0` | `grundsicherungsgeld` |
| BAföG | [bafoeg.md](bafoeg.md) | `bafoeg`, `bafoeg0`, `bafSchaetzKind`, `bafSchaetzIch` | `bafoeg` (Einstufung) |
| Elterngeld | [elterngeld.md](elterngeld.md) | `elterngeld`, `elterngeldBerechnen` | `elterngeld`, `egAbgleich` |
| Unterhaltsvorschuss | [uvg.md](uvg.md) | `unterhaltsvorschuss`, `uvgKarte` | `unterhaltsvorschuss` |
| Wohnberechtigungsschein | [wbs.md](wbs.md) | `wbs`, `wbsGrenze` | **neu:** `wbs` |
| Pfändung | [pfaendung.md](pfaendung.md) | `pfaendFreibetrag`, `pfaendung`, `pkonto` | **neu:** `pfaendung`, `pkonto` |

Gemeinsame Konventionen (alle Leistungen):
- Einstufung `ja` = wahrscheinlich, `vielleicht` = möglich, `nein` = unwahrscheinlich, `na` = bekommst du schon. Sortierung `ja, vielleicht, nein, na`.
- „Möglich“ steht immer dort, wo die App eine Angabe nicht kennt oder die Schätzung an einer Grenze liegt (vorsichtige Seite: lieber „möglich“ als ein falsches „unwahrscheinlich“).
- Beträge sind grobe Schätzungen, auf 10 € gerundet (`r10`), außer feste Beträge.
- `besondere()` macht danach aus „wahrscheinlich“ ein „möglich“ bei Eigentum, Verwandten im Haushalt, teurem Auto (über 15.000 €) und ergänzt Hinweise (Selbstständige, WG).
- `evaluate()` rechnet bei Lebens-/Rentenversicherung und geförderter Altersvorsorge ein zweites Mal mit diesen Ersparnissen: kippt die Vermögensgrenze, „möglich“.

Vergleich App ↔ Referenz: `test/test-raster.js` (60.000 Haushalte, Kern-Leistungen) und neu `REFERENZ_FAELLE` Zufallsfälle für WBS und Pfändung (Standard 300, Seed `REFERENZ_SEED`, Standard 20261121).
Für die schweren Tests soll `schwer.yml` später `REFERENZ_FAELLE=50000` setzen (Workflows hier nicht geändert).
