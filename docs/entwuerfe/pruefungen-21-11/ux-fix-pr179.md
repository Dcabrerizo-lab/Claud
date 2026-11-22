# Prüfung PR #179 (UX-Nachprüfung: Karten-Knopf, offener Weg, Unterlagen, Suchlink, große Schrift)

Unabhängige Prüfung von Recht, Unterlagen und Übersetzung. Stand der Quellen: abgerufen am 22.11.2026.

## Prüfvermerk (22.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Tipp „Weg noch nicht gewählt“ (Wohngeld und Kinderzuschlag gegen Grundsicherungsgeld): „Die Stellen prüfen … Frag dort nach“ schließt das Jobcenter ein. Der Antrag dort braucht keine Form (§ 37 SGB II schreibt keine vor); schon eine Vorsprache kann als Antrag gelten. Ein Antrag auf Leistungen nach dem SGB II sperrt den erweiterten Zugang zum Kinderzuschlag. | hoch | Neuer Text `f.weg.tippGgKiz` (13 Sprachen, Einfache Sprache), sobald Kinderzuschlag im Weg ist: „Frag zuerst bei der Familienkasse oder der Wohngeldstelle nach …“. Der alte Text bleibt nur für den Weg ohne Kinderzuschlag. Test `[ux-weg-offen]` ergänzt. | § 6a Abs. 1a Nr. 3 BKGG („erhält oder beantragt hat“), § 37 Abs. 1 SGB II, § 12a Satz 2 Nr. 2 SGB II; gesetze-im-internet.de |
| Tipp bei Rente („nicht gleichzeitig. Lass beides prüfen und frag, mit welchem Weg du mehr bekommst“) | in Ordnung | keine. Kein Vorrang, keine Zusage, kein Kinderzuschlag betroffen. | § 7 Abs. 1 Satz 1 Nr. 5 WoGG, § 8 Abs. 1 WoGG; BSG 23.03.2021, B 8 SO 2/20 R (bsg.bund.de: Nachrang nach § 2 SGB XII ist keine Ausschlussnorm) |
| Ausweis stand in „Für mehrere Anträge“, auch wenn nur ein Antrag ihn nennt. Das behauptet eine Anforderung ohne Quelle (z. B. Kinderzuschlag, Kindergeld). | mittel | Gemeinsame Liste nur für Punkte, die mindestens zwei gewählte Anträge nennen. Der Ausweis steht sonst bei seinem Antrag. Test und Prüfliste angepasst. | KiZ 1 Hinweise der Familienkasse (Stand Juli 2026) nennen keinen Ausweis als Nachweis |
| Einkommenstext „für Wohngeld von allen im Haushalt, meist der letzten 12 Monate“ | in Ordnung | keine. „meist“ ist nötig: das Gesetz nennt keinen festen Zeitraum, die Formulare fragen 12 Monate ab. | § 15 Abs. 1 WoGG (zu erwartendes Einkommen, Verhältnisse vor dem Antrag); Verdienstbescheinigung zum Wohngeldantrag, Muster 2 der Anlage 3, SMBl. NRW 2374 (recht.nrw.de): „in den letzten zwölf Monaten vor Stellung des Antrags“ |
| Einkommenstext „für Kinderzuschlag von den Eltern, meist der letzten 6 Monate“ | niedrig, offen | Zeitraum stimmt. Offen: Die Familienkasse verlangt auch Nachweise zum Einkommen der Kinder (z. B. Unterhalt). Der Text stammt wörtlich aus `s.kiz.u2` (vor dem PR). Ergänzung wäre eine Änderung in 13 Sprachen. | § 6a Abs. 8 Satz 1 BKGG; KiZ 1 Hinweise der Familienkasse, Stand Juli 2026 (arbeitsagentur.de) |
| fa, fa-AF, ps: „Lass beides prüfen“ war als „Prüfen Sie beides (selbst)“ übersetzt; „mehr bekommst“ unklar. so: „viel“ statt „mehr“. | mittel | 4 Texte `f.weg.tippGsa` berichtigt (höfliche Anrede bleibt). | Verfahren Übersetzung, Schritte 1–2 (Rückübersetzung gegen Deutsch) |
| Übrige neue Texte (12 Schlüssel × 12 Sprachen, `f.empfSuche`): Bedeutung, Verneinung, Zahlen 12/6, Platzhalter, Anrede | in Ordnung | keine | wie oben |
| Farbe `--papier-accent` (#0f6b5c) fehlte in `docs/FARBEN.md` | niedrig | nachgetragen (gleicher Wert wie `--accent` hell, keine neue Farbe) | docs/FARBEN.md |
| Sicherheit: neue Ausgaben alle über `esc()`, keine neue Speicherung, Suchlink weiter ohne Ort und PLZ | in Ordnung | keine | src/app.js |
| Kommentar in `src/app.js` verweist auf `docs/entwuerfe/entweder-oder.md`; die Datei liegt nur im Branch `claude/b-entweder-oder` | niedrig, offen | keine (kommt mit dem anderen Branch) | – |
