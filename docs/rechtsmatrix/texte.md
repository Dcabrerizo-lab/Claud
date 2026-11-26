# Rechtsmatrix Texte und Sprachen (Stand 24.11.2026)

Grundlage: Vollprüfung vom 24.11.2026 (Teil `texte-sprachen` und Fable-Prüfung „Schulden/Texte“), bereinigt nach den Korrekturen auf Branch `claude/b-vp-texte`.
Test: `node test/test-rechtsmatrix-texte.js` (Fälle in `test/rechtsmatrix/texte.json`, läuft in `test/listen/regeln.txt`).
Sprachen: de, en, ar, fa, fa-AF, fr, pl, ps, ro, ru, so, tr, uk und Einfache Sprache. Anrede: seriöses Du; fa, fa-AF, ps höflich.

## 1. Rechtsaussagen in Texten (Abruf aller Quellen am 24.11.2026)

| Aussage | Schlüssel | Rechtsgrundlage | Quelle | Soll in allen Sprachen |
|---|---|---|---|---|
| Gemischte Bedarfsgemeinschaft: Sozialamt nur ab Regelaltersgrenze oder bei **dauerhafter** voller Erwerbsminderung; nicht dauerhaft → auch Jobcenter möglich | `t.ggeld.gemischt` | § 41 Abs. 3 SGB XII; § 7 Abs. 3, § 19 Abs. 1 Satz 2 SGB II | gesetze-im-internet.de/sgb_12/__41.html, /sgb_2/__19.html | „dauerhaft“ + Satz zur nicht dauerhaften EM (in main schon richtig) |
| Unterhaltsrückgriff auf Eltern erst, wenn **ein Elternteil mehr als 100.000 €** im Jahr hat; „kann … bekommen“ | `t.gsa.eltern` | § 94 Abs. 1a SGB XII („jeweils mehr als 100.000 Euro“) | buzer.de/94_SGB_XII.htm | Betrag als `{eur:100000}` |
| BAföG: Elterneinkommen **nach den Abzügen des BAföG-Amts** unter dem Freibetrag | `t.bafoeg.kindJa` | §§ 21, 25 BAföG | gesetze-im-internet.de/baf_g/__25.html | Einschub in jeder Sprache („BAföG“ zweimal) |
| Zusätzlicher Vermögensfreibetrag 2.300 € je Ehe-/Lebenspartner und Kind | `t.bafoeg.vermEvtl`, `t.bafoeg.vermTeil` | § 29 Abs. 1 BAföG | gesetze-im-internet.de/baf_g/__29.html | `{eur:2300}` |
| KiZ-Vermögen 40.000 € erste Person + 15.000 € je weitere | `t.kiz.verm` | § 6a Abs. 3 BKGG | gesetze-im-internet.de/bkgg_1996/__6a.html | `{eur:40000}`, `{eur:15000}` |
| Grundrentenfreibetrag 100 € + 30 %, höchstens 50 % Regelbedarfsstufe 1 (2026: 281,50 €) | `t.gsa.grundrente`, `es.tipp.grundrente` | § 82a SGB XII | gesetze-im-internet.de/sgb_12/__82a.html | `{eur:100}`, `{max}` aus `R.grundrente.max × R.regelbedarf.alleinstehend` |
| Zusatzrente (Betriebs-, Riester-, private Rente) 100 € + 30 %, höchstens 50 % RS 1 | `ek.zusatzRente.hint` | § 82 Abs. 4 SGB XII | gesetze-im-internet.de/sgb_12/__82.html | `{max}` aus `R.vorsorge.max × R.regelbedarf.alleinstehend` (src/app.js `freiMax`) |
| Miete: Karenzzeit 1 Jahr, aber höchstens das Eineinhalbfache der Grenze; danach Kostensenkungsaufforderung, zu hohe Miete in der Regel noch **bis zu 6 Monate**, dann nur die Grenze | `t.kdu.angemessen`, `t.kdu.hoch`, `el.ks.kern` | § 22 Abs. 1 Satz 2, 6, 9, 10 SGB II i. d. F. ab 1.7.2026 (BGBl. 2026 I Nr. 107) | buzer.de/22_SGB_II.htm | Zahlen 22, 6 (kdu.hoch zusätzlich 10) |
| Schonvermögen nach Alter: unter 30 / ab 30 / ab 40 / ab 50 | `hb.hw.verm.d.ggeld` | § 12 Abs. 2 SGB II n. F. | buzer.de/12_SGB_II.htm | alte Etiketten `gruppe.*` gelöscht |
| „Bürgergeld“ nur als früherer Name | alle | Umgestaltung der Grundsicherung seit 1.7.2026 | bundesregierung.de/breg-de/aktuelles/neue-grundsicherung-2399562 | Regel T53 |

Weitere Zahlen-Regeln (Krankengeld, ALG, UVG, Fristen, P-Konto, Strom, Pflege …): T01–T47 in `test/rechtsmatrix/texte.json`, je mit Quelle.

## 2. Format- und Stilregeln

| Regel | Test |
|---|---|
| Feste Beträge in Texten als `{eur:N}` (Landesformat, z. B. en „€40,000“), aus Regeln abgeleitete als Parameter | T23, T37, T59–T63, T66 (Englisch ohne „40.000 €“) |
| Gesetzesbezeichnungen in jeder Übersetzung wie im Deutschen | T54 |
| Rumänisch durchgehend Du (Mehrzahl „voi“ nur, wo Deutsch „ihr“ sagt) | T52, T65 |
| Store-Text: Pflege nicht „in 13 Sprachen“, solange `src/lang/pflege/ps.json` und `so.json` fehlen (Entscheidung David: Deutsch bis zur Muttersprachler-Prüfung) | T56 |
| `test/test-feste-zahlen.js` erkennt jetzt auch `{eur:N}` in de.json | – |

## 3. Nicht in diesem Zweig (SoLo Pflege & Rente)

| Nr | Thema |
|---|---|
| TS-06 | `sen/src/lang/fr.json` `nh.kirche.q` duzt („Paies-tu …“), Variante siezt → Eintrag in `sen/src/lang/sie/fr.json` |
| K-1 | Variante: Pflege und Senioren auf ps/so fehlen (493 Schlüssel Deutsch) |
| K-2 | Variante hat keine eigenen Store-Texte |

## 4. Bei der nächsten Aktualitätsprüfung (vor 1.1.2027)

- Regelbedarf 2027: `{max}` wandert automatisch mit `R.regelbedarf.alleinstehend`.
- § 94 Abs. 1a SGB XII (100.000 €), § 6a BKGG, § 29 BAföG: Beträge in `test/test-feste-zahlen.js` (GESETZ) bzw. `R` prüfen.
