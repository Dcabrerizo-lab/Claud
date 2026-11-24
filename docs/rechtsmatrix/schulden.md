# Rechtsmatrix Schulden, Pfändung, Fristen, Brief prüfen

Stand: 24.11.2026 (Vollprüfung: Prüfer „schulden-briefe“ und Blindprüfung, zusammengeführt). Alle Quellen abgerufen am 24.11.2026.
Dauerhafter Test: `test/test-rechtsmatrix-schulden.js` mit den Fällen in `test/rechtsmatrix/schulden.json` (371 Fälle, dazu 97.302 Pfändungswerte und 1.424 Fristtage gegen eine unabhängige Rechnung).

## Rechtsgrundlagen und Beträge

| Thema | Wert in der App | Rechtsgrundlage | Quelle |
|---|---|---|---|
| Pfändungsfreigrenze (1.7.2026–30.6.2027) | 1.587,40 € Grundbetrag, + 597,42 € erste, + 332,83 € jede weitere unterhaltsberechtigte Person (bis 5), voll pfändbar über 4.866,30 € | § 850c ZPO, Pfändungsfreigrenzenbekanntmachung 2026 | https://www.gesetze-im-internet.de/pf_ndfreigrbek_2026/BJNR0500A0026.html |
| Auf 10 € abrunden, Anteile 7/10 … 1/10 | Rechnung `Rules.pfaendung` | § 850c Abs. 3, 5 ZPO | https://www.gesetze-im-internet.de/zpo/__850c.html |
| P-Konto Sockel | 1.590 € (auf 10 € aufgerundet) | § 899 Abs. 1 ZPO | https://www.gesetze-im-internet.de/zpo/__899.html |
| P-Konto Erhöhungen mit Bescheinigung | Unterhalt wie § 850c; Kindergeld 259 € je Kind; Kinderzuschlag (Betrag im Monat); Hinweis auf weitere: Personen der Bedarfsgemeinschaft ohne Unterhaltspflicht, § 54 Abs. 2/Abs. 3 Nr. 3 SGB I (einmalige Leistungen, Pflegegeld, Blindengeld), eigenes Grundsicherungsgeld über dem Sockel | § 902 Satz 1 Nr. 1 a/b, 2, 4, 5 ZPO; § 903 ZPO | https://www.gesetze-im-internet.de/zpo/__902.html |
| Unpfändbare Sozialleistungen | Kindergeld, Kinderzuschlag (nur für Unterhalt des Kindes pfändbar), Wohngeld, Elterngeld bis 300 €, Pflegegeld/Blindengeld; Grundsicherungsgeld; Sozialhilfe/Grundsicherung im Alter | § 54 Abs. 3 Nr. 1, 2a, 3, Abs. 5 SGB I; § 42 Abs. 4 SGB II; § 17 Abs. 1 Satz 2 SGB XII; § 76 EStG | https://www.gesetze-im-internet.de/sgb_1/__54.html, https://www.gesetze-im-internet.de/sgb_2/__42.html |
| Laufende Leistungen wie Arbeitseinkommen | Rente, ALG I, Krankengeld zählen zum pfändbaren Einkommen | § 54 Abs. 4 SGB I | wie oben |
| Ratenvorschlag (SoLo-Faustregel) | Rate = min(frei − Puffer, pfändbar); pfändbar nur aus dem eigenen Einkommen der Person 1 (Lohn, Selbstständigkeit, Rente, ALG, Krankengeld, Werkstattlohn, Elterngeld über 300 €, Sonstige Einnahmen); ohne Partner-Einkommen, Kindergeld, Unterhalt für die Kinder, „Andere Leistungen“ | § 850c ZPO; § 54 SGB I; § 850b ZPO (Unterhalt für sich selbst nur bedingt pfändbar) | wie oben |
| Widerspruchsfrist Sozialrecht | 1 Monat ab Bekanntgabe; Post: 4. Tag nach Aufgabe, später nur bei späterem Zugang; Ende nicht an Sa/So/Feiertag | § 37 Abs. 2 SGB X; § 84 Abs. 1, § 64 SGG | https://www.gesetze-im-internet.de/sgb_10/__37.html |
| Kindergeld: Rechtsbehelf | Einspruch (nicht Widerspruch), 1 Monat; Bekanntgabe 4. Tag | §§ 347, 355 Abs. 1, § 122 Abs. 2 Nr. 1 AO | https://www.gesetze-im-internet.de/ao_1977/__347.html, https://www.gesetze-im-internet.de/ao_1977/__122.html |
| Wohngeld, BAföG | Widerspruch 1 Monat; in manchen Ländern abgeschafft, dann Klage | § 70 VwGO, § 68 Abs. 1 Satz 2 VwGO | https://www.gesetze-im-internet.de/vwgo/__70.html |
| Mahnbescheid | Widerspruch am besten binnen 2 Wochen; danach noch, solange kein Vollstreckungsbescheid verfügt ist | § 692 Abs. 1 Nr. 3, § 694 Abs. 1 ZPO | https://www.gesetze-im-internet.de/zpo/__694.html |
| Vollstreckungsbescheid | Einspruch 2 Wochen (Notfrist), Ende § 222 ZPO | §§ 700, 339, 222 ZPO | https://www.gesetze-im-internet.de/zpo/__700.html |
| Anhörung, Mitwirkung (Frist aus dem Brief) | „bis (zum) Datum“, „bis spätestens“, „innerhalb von/eines/einer“, „binnen“, „Frist (von): n Wochen“, Monatsnamen; Rechnung §§ 187–193 BGB | § 26 SGB X | https://www.gesetze-im-internet.de/sgb_10/__26.html |
| Bescheiddatum | „Datum:“, „Bescheid vom“ (nicht, wenn auf einen früheren Bescheid verwiesen wird), Briefkopf | § 37 Abs. 2 SGB X | wie oben |
| Bescheid-Check SGB II: Kindergeld volljähriger Kinder | 259 € − 30 € Versicherungspauschale = 229 € (ohne eigenes Erwerbseinkommen des Kindes) | § 11 Abs. 1 Satz 5, § 11b Abs. 1 Satz 1 Nr. 3 SGB II, § 6 Abs. 1 Nr. 1 Grundsicherungsgeld-V | https://www.gesetze-im-internet.de/algiiv_2008/__6.html |
| Heiz-/Nebenkostennachzahlung | Antrag spätestens im Monat der Fälligkeit (Antrag wirkt auf den Monatsersten zurück; Sonderregel Satz 3 nur bis 31.12.2023) | § 22 Abs. 1, § 37 Abs. 2 SGB II | https://www.gesetze-im-internet.de/sgb_2/__37.html |
| Rundfunkbeitrag Befreiung | Nachweis: Bescheid über die befreiende Leistung (Grundsicherungsgeld, Sozialhilfe, BAföG nicht bei den Eltern …), nicht Pflegegeld | § 4 Abs. 1, 7 RBeitrStV | Rundfunkbeitragsstaatsvertrag (Landesrecht) |
| Antragsmappe Grundsicherungsgeld | Anlage WEP für jede weitere Person ab 15 (auch Kinder 15–17), Anlage KI für Kinder unter 15 | BA-Vordrucke | https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/downloads-arbeitslos-arbeit-finden |

## Konstellationen mit Soll-Ergebnis (Auszug; vollständig in der Fall-Datei)

| Nr | Konstellation | Soll |
|---|---|---|
| RA-1 | Single, Lohn 2.500 €, Ausgaben 1.800 € | Rate 450 € |
| RA-2 | Alleinerziehend, 1 Kind, Lohn 1.700 €, Wohngeld, KiZ, UVG | nichts pfändbar → kein Ratenvorschlag (`ra.unpf`) |
| RA-3 | Paar, 3 Kinder, Lohn 2.000 € + Grundsicherungsgeld | nichts pfändbar |
| RA-4 | Rentner, Rente 1.200 € + Grundsicherung im Alter | nichts pfändbar |
| RA-Paar | Paar, je 1.500 € Lohn, 1 Unterhaltsberechtigter | nichts pfändbar (Partner-Einkommen zählt nicht) |
| PK-1-1-kiz | P-Konto, 1 Unterhaltspflicht, 1 Kind mit Kindergeld, KiZ 297 € | 2.743,42 € |
| BS-2 | Bescheid-Check SGB II, Paar + Kind 19 | Kindergeld 229 € |
| brief-datum-aenderungsbescheid | Kopf 20.11.2026, Text „mein Bescheid vom 12.03.2026 wird geändert“ | Datum 20.11.2026 |
| brief-frist-1/3/6 | „bis 15.12.2026“, „innerhalb einer Woche“, „bis zum 15. Dezember 2026“ | Frist erkannt |
| BL-KG-1 | Kindergeld-Aufhebung mit Einspruch | Art Kindergeld (nur Erklärung: Einspruch § 347 AO) |
| BL-KG-3 | Anhörung der Familienkasse zum Kindergeld | Anhörung |
| BL-F-1 | „01.01.2026 bis 30.06.2026 bewilligt“ | keine Frist |
| FO-AW-1 | Antragsmappe, Kind 14–17 | Hinweis Anlage WEP |

## Offen / zu klären (nicht als harte Erwartung im Test)
- Kindergeld (AO): Bekanntgabe am Wochenende verschiebt der BFH auf den nächsten Werktag (§ 108 Abs. 3 AO); die App verschiebt nicht (früheres Ende = vorsichtig).
- Fundstelle BSG 6.5.2010, B 14 AS 12/09 R (Bekanntgabe nicht verschoben) bei der nächsten Rechtsprüfung bestätigen.
- Kindergeldbetrag ab 1.1.2027 (P-Konto, Bescheid-Check) vor dem Jahreswechsel prüfen.
- § 41f Abs. 3 EnWG (1/6 der Jahresrechnung ohne Abschläge) wird nicht genannt.
