# Rechtsmatrix Familienleistungen (Stand 24.11.2026)

Grundlage für künftige Aktualitätsprüfungen. Dauerhafter Regeltest: `test/test-rechtsmatrix-familie.js` mit den Fällen in
`test/rechtsmatrix/familie.json` (130 Fälle: Vollprüfung Claude, Vollprüfung Fable blind, Korrekturfälle). Abrufdatum aller Quellen: 24.11.2026,
wenn nicht anders genannt.

## 1. Rechtsgrundlagen und Beträge

| Leistung | Wert in der App (`src/rules.js`) | Rechtsgrundlage | Quelle |
|---|---|---|---|
| Kindergeld | 259 € je Kind (`R.kindergeld`) | § 66 EStG | gesetze-im-internet.de/estg/__66.html |
| Kindergeld EU-Bürger | erste 3 Monate nur mit inländischen Einkünften; danach nur mit Recht nach § 2 Abs. 2 oder 3 FreizügG/EU, nicht allein zur Arbeitsuche | § 62 Abs. 1a EStG | gesetze-im-internet.de/estg/__62.html |
| Kindergeld Drittstaaten | nur mit bestimmten Titeln (Niederlassungserlaubnis, Erwerbstitel; Ausschlüsse §§ 16b, 16e, 23 Abs. 1, 23a, 25 Abs. 3–5 AufenthG) | § 62 Abs. 2 EStG | wie oben |
| Kinderzuschlag | höchstens 297 € je Kind; Mindesteinkommen 900 € (Paar) / 600 € (allein); Vermögen 40.000 € + 15.000 € je weitere Person; Einkommen des Kindes mindert zu 45 % | § 6a BKGG | gesetze-im-internet.de/bkgg_1996/__6a.html |
| Kinderzuschlag Mindesteinkommen | Unterhalt für Elternteil und Kind zählt zusammen; reiner Kindesunterhalt nicht; Selbstständige: Betriebseinnahmen vor Ausgaben | DA-KiZ Stand 20.02.2026, C.1 Abs. 2 | arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf |
| Kinderzuschlag Lohn des Kindes | 603 € frei (2027: 633 €) und Freibetrag § 11b Abs. 3 SGB II ohne erste Stufe (30 % 520–1.000 €, 10 % bis 1.200 €) | DA-KiZ C.2.2.1 Abs. 3 Satz 9–11 | wie oben |
| Kinderzuschlag Wechselmodell | nur der Elternteil mit Kindergeld; Kind ggf. anteilig (Tage) | DA-KiZ C.3.1.1 Abs. 2, S. 50 (temporäre BG) | wie oben |
| Kinderzuschlag und UVG | kein Anspruch, wenn zumutbare Anstrengungen unterlassen werden, Einkommen des Kindes geltend zu machen | § 6a Abs. 3 Satz 4 BKGG | wie oben |
| Unterhaltsvorschuss | 227 € / 299 € / 394 € | § 2 UVG i. V. m. Mindestunterhalt | gesetze-im-internet.de/uhvorschg/__2.html |
| UVG ab 12 Jahren | nur ohne SGB-II-Bezug des Kindes oder mit eigenem Einkommen des Elternteils ab 600 €; Kind von 14 bis 17 ist immer 12 oder älter | § 1 Abs. 1a UVG | gesetze-im-internet.de/uhvorschg/__1.html |
| Elterngeld | 65–100 %, 300–1.800 €; ElterngeldPlus halb; Geschwisterbonus 10 %, mind. 75 €; Mehrlingszuschlag 300 € | §§ 2, 2a, 4a BEEG | gesetze-im-internet.de/beeg/ |
| Elterngeld Einkommensgrenze | zu versteuerndes Einkommen über 175.000 € (Paar zusammen) im letzten Jahr vor der Geburt: kein Anspruch. App: Brutto aus Arbeit × 12 > 175.000 € höchstens „möglich“, kein „eher nicht“ (zvE nach § 2 Abs. 5 EStG mit Kinderfreibeträgen u. a. und Vorjahr unbekannt; Gegenprüfung 25.11.2026) | § 1 Abs. 8 BEEG | gesetze-im-internet.de/beeg/__1.html |
| Elterngeld Paare | gleichzeitiges Basiselterngeld nur in 1 der ersten 12 Lebensmonate (Ausnahmen Mehrlinge, Frühgeburt, Behinderung, Geschwisterbonus); Partnerschaftsbonus 2–4 Monate ElterngeldPlus bei 24–32 Wochenstunden | § 4 Abs. 6, § 4b BEEG | gesetze-im-internet.de/beeg/__4.html, __4b.html |
| Elterngeld als Einkommen | Wohngeld u. a.: 300 € frei, ElterngeldPlus 150 €, je Kind der Geburt; Grundsicherungsgeld, Sozialhilfe, Kinderzuschlag, AsylbLG: frei höchstens 300 € und nur bis zum Einkommen vor der Geburt (Elterngeld-Netto), ElterngeldPlus die Hälfte, nicht vervielfacht | § 10 Abs. 1, 3, 4, 5 BEEG | buzer.de/10_BEEG.htm (gesetze-im-internet.de nicht erreichbar) |
| Mutterschaftsgeld | Krankenkasse höchstens 13 €/Tag + Arbeitgeberzuschuss; nicht gesetzlich versichert: BAS einmalig 210 €; mit Arbeitslosengeld oder Krankengeld bzw. als „anderes Mitglied“ (Selbstständige mit Krankengeld-Wahl) in Höhe des Krankengeldes | § 24i SGB V, §§ 19, 20 MuSchG | gesetze-im-internet.de/sgb_5/__24i.html |
| Schutzfristen | 6 Wochen vor, 8 (12) nach der Geburt; nach Fehlgeburt ab 13. Woche 2, ab 17. Woche 6, ab 20. Woche 8 Wochen (verzichtbar) | § 3 MuSchG | gesetze-im-internet.de/muschg_2018/__3.html |
| Bildung und Teilhabe | Schulbedarf 195 € im Jahr, Teilhabe 15 € im Monat (nur unter 18); junge Erwachsene bis 25 nur als Schülerinnen und Schüler ohne Ausbildungsvergütung | § 28 Abs. 1 Satz 2, Abs. 3, Abs. 7 SGB II | gesetze-im-internet.de/sgb_2/__28.html |
| Sofortzuschlag | 25 € im Monat je Kind / jungem Erwachsenen mit Regelbedarfsstufe 3–6, auch wenn der Anspruch nur am Kindergeld scheitert; nicht für Kinder, die ihren Bedarf selbst decken; zusätzlich, kein Bedarf | § 72 SGB II (Fassung ab 1.7.2026) | gesetze-im-internet.de/sgb_2/__72.html |
| Mehrbedarf Alleinerziehende im Wechselmodell | bei etwa hälftiger Betreuung halber Mehrbedarf | § 21 Abs. 3 SGB II; BSG 3.3.2009, B 4 AS 50/07 R | – |
| Familiengeld/Krippengeld Bayern | 250 € / 300 €, Krippengeld bis 100 €, nur für bis 31.12.2024 Geborene bis zum 3. Geburtstag (Hinweis in der App nur mit Kind unter 6 und bis Ende 2027) | Art. 9a BayFamGG (GVBl. 2025 S. 570); Art. 29 Abs. 2 BayKiBiG n. F. (GVBl. 2026 S. 401) | verkuendung-bayern.de |
| Entlastungsbetrag | Steuerklasse II nur ohne weitere volljährige Person im Haushalt (App: bei Verwandten/WG Steuerklasse I) | § 24b Abs. 3 EStG | gesetze-im-internet.de/estg/__24b.html |

## 2. Konstellationen mit Soll-Ergebnis (Auswahl; vollständig in `test/rechtsmatrix/familie.json`)

| Konstellation | Soll | Rechtsgrundlage |
|---|---|---|
| Alleinerziehend, Kind 14–17, Haken „12 oder älter“ nicht gesetzt, Elternteil unter 600 € | UVG „möglich“ (Hinweis 600 €), Grundsicherungsgeld ohne UVG gerechnet | § 1 Abs. 1a UVG |
| Paar, 2 Kinder (0–5, 6–13), kein Einkommen, Miete 900 | Grundsicherungsgeld etwa 2.190 € (2.141 + 2 × 25 €) | §§ 20–22, 72 SGB II |
| AE, Baby da + Geschwister, Elterngeld 375 € ohne Einkommen vor der Geburt | kein Elterngeld-Freibetrag beim Grundsicherungsgeld; etwa 1.370 € | § 10 Abs. 5 BEEG |
| Elterngeld 200 € (sicher ElterngeldPlus) | Wohngeld: 150 € frei; Grundsicherungsgeld: 150 € frei (Einkommen vor der Geburt ergibt sich aus dem Betrag über 150 €) | § 10 Abs. 3, 5 BEEG |
| Elterngeld 600 €, Basis oder Plus unbekannt | Grundsicherungsgeld/KiZ vorsichtig 150 € frei, für „eher nicht“ und KiZ-Obergrenze 300 € | § 10 Abs. 5 BEEG |
| Paar 25.000 € brutto im Monat, Baby kommt | Elterngeld höchstens „möglich“, Grenze vorn | § 1 Abs. 8 BEEG |
| Paar 16.000 € brutto im Monat | Elterngeld höchstens „möglich“, Grenze vorn | § 1 Abs. 8 BEEG |
| Selbstständige Schwangere | Mutterschaftsgeld „möglich“, Text ohne Arbeitgeber | § 24i Abs. 1, 2 SGB V |
| Krankengeld, Baby bald | Mutterschaftsgeld „wahrscheinlich“ | § 24i Abs. 1, 2 SGB V |
| EU-Bürgerin ohne Arbeit, unter 5 Jahren, Kind | Kindergeld „möglich“, Hinweis Freizügigkeit | § 62 Abs. 1a EStG |
| Bayern, nur Kinder ab 6 | kein Familiengeld-Hinweis | BayFamGG |
| Nur junge Erwachsene, Schülerjob, Haushalt mit Grundsicherungsgeld | Bildung und Teilhabe „möglich“ (nur Schule, kein Studium) | § 28 Abs. 1 Satz 2 SGB II |
| Nur junge Erwachsene in betrieblicher Ausbildung | Bildung und Teilhabe „eher nicht“ | § 28 Abs. 1 Satz 2 SGB II |
| Wechselmodell | Grundsicherungsgeld und KiZ höchstens „möglich“, Betrag „bis“ | BSG B 4 AS 50/07 R; DA-KiZ C.3.1.1 |
| Selbstständige AE, Gewinn 400 € | KiZ „möglich“ (Einnahmen vor Ausgaben) | DA-KiZ C.1 Abs. 2 |
| AE, Kind 19 in Ausbildung, 900 € Vergütung | KiZ etwa 215 € (603 € + 114 € frei) | DA-KiZ C.2.2.1 |
| Baby ist da, kein Kind gezählt | Kindergeld „wahrscheinlich“, Baby zählt als Kind unter 6 | §§ 62, 63 EStG |
| Volljähriges Kind mit Behinderung (vor 25), sonst keine Kinder | Kindergeld-Karte verweist auf Karte „erwachsene Kinder mit Behinderung“ | § 32 Abs. 4 Satz 1 Nr. 3 EStG |

## 3. Zu beobachten (noch nicht geltend, nicht eingebaut)

| Punkt | Stand 24.11.2026 | Folge |
|---|---|---|
| Kindergeld 267 € ab 2027 (BT-Drs. 21/8235) | nicht verkündet | mit UVG (Mindestunterhalt − Kindergeld) und KiZ-Höchstbetrag zusammen umstellen |
| Sofortzuschlag 2027 (§ 72 SGB II, § 6a BKGG) | Streichung aus dem Haushaltsbegleitgesetz 2027 herausgenommen, Gesetz nicht verkündet | nach Verkündung bestätigen |
| Sächsisches Landeserziehungsgeld | geltendes Landesrecht (SächsLErzGG) | in der App nicht genannt (keine neue Karte); Entscheidung offen |
| Bayern: 100-€-Kita-Zuschuss | geht ab 1.1.2027 im Qualitätsbonus auf | nicht als Elternleistung nennen |
