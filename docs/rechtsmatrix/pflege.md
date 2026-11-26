# Rechtsmatrix Pflege & Rente (bereinigt, Stand 24.11.2026)

Grundlage für künftige Aktualitätsprüfungen. Zusammengeführt aus zwei unabhängigen Prüfungen (Claude „pflege-rente“, Fable „fable-pflege-rente“) und der Korrektur vom 24.11.2026. Testfälle: `test/rechtsmatrix/pflege.json`, Läufer `test/test-rechtsmatrix-pflege.js` (Marke `[vp-pflege]`). Abruf aller Quellen: 24.11.2026, wenn nicht anders genannt.

## 1. Rechtsgrundlagen und Beträge

| Thema | Wert 2026 | Rechtsgrundlage | Quelle | Ort im Code |
|---|---|---|---|---|
| Pflegegeld PG 2–5 | 347 / 599 / 800 / 990 € | § 37 SGB XI | BMG Übersicht Leistungsbeträge 2026 (Stand 04.11.2025) | `R.pflege.geld` |
| Pflegesachleistung PG 2–5 | 796 / 1.497 / 1.859 / 2.299 € | § 36 SGB XI | BMG Übersicht 2026 | `R.pflegeSach` |
| Tages-/Nachtpflege PG 2–5 | 721 / 1.357 / 1.685 / 2.085 € | § 41 SGB XI | BMG Übersicht 2026 | `R.pflegeTages` |
| Entlastungsbetrag | 131 € | § 45b SGB XI | BMG Übersicht 2026 | `R.pflege.entlastung` |
| Gemeinsamer Jahresbetrag Verhinderungs-/Kurzzeitpflege | 3.539 € | § 42a SGB XI | BMG Übersicht 2026 | `R.entlastungsbudget` |
| Vollstationäre Pflege PG 1–5 | 131 (Zuschuss) / 805 / 1.319 / 1.855 / 2.096 € | § 43 SGB XI | BMG Übersicht 2026; BMG-Ratgeber „Vollstationäre Pflege im Heim“ (Stand 15.9.2026) | `R.pflegeHeim` |
| Leistungszuschlag Eigenanteil PG 2–5 | 15 % (bis 12 Mon.), 30 % (> 12), 50 % (> 24), 75 % (> 36) | § 43c SGB XI | BMG Übersicht 2026 | `R.pflegeHeimZuschlag` |
| Besondere Wohnform (Eingliederungshilfe) PG 2–5 | 15 % der Vergütung, höchstens 278 € | § 43a SGB XI | BMG Übersicht 2026 | `R.pflege43a` |
| Behinderten-Pauschbetrag | 384–2.840 €; 7.400 € für blinde, taubblinde, hilflose Menschen | § 33b Abs. 3 EStG | gesetze-im-internet.de/estg/__33b.html | `R.beh.pausch` |
| Pflegegrad 4/5 = Merkzeichen H (Steuer) | 7.400 €, auch ohne GdB | § 65 Abs. 2 Satz 2 EStDV | gesetze-im-internet.de/estdv_1955/__65.html; Finanzverwaltung NRW „Steuererleichterungen für Menschen mit einer Behinderung“ | `pauschbetrag` |
| Fahrtkostenpauschale | 900 € (GdB ≥ 80 oder ≥ 70 + G); 4.500 € (aG, Bl, TBl, H; PG 4/5 wie H) | § 33 Abs. 2a, Abs. 4 EStG mit § 65 EStDV | buzer.de/33_EStG.htm; Finanzverwaltung NRW | `pauschbetrag` |
| Pflege-Pauschbetrag | 600 / 1.100 / 1.800 € | § 33b Abs. 6 EStG | gesetze-im-internet.de | `R.pflegePausch` |
| Wertmarke ohne Eigenbeteiligung | blind, hilflos, Bezug SGB II / 3. und 4. Kap. SGB XII / SGB VIII / SGB XIV | § 228 Abs. 4 SGB IX | buzer.de/228_SGB_IX.htm | `ausweis0` |
| Kfz-Steuer-Befreiung | H, Bl, aG | § 3a Abs. 1 KraftStG | – | `ausweis0` |
| Krankenfahrten ambulant: Genehmigung gilt als erteilt | aG, Bl, H; PG 3 (mit dauerhafter Mobilitätseinschränkung), 4, 5 | § 60 Abs. 1 Satz 5 SGB V | buzer.de/60_SGB_V.htm | Text `t.zuzahl.fahrt` |
| Belastungsgrenze Zuzahlungen | 2 %, chronisch krank 1 % der Bruttoeinnahmen; für alle GKV-Versicherten | § 62 Abs. 1 SGB V | buzer.de/62_SGB_V.htm | `zuzahlung` |
| Hilfe zur Pflege bei PG 1 | nur Pflegehilfsmittel, Wohnumfeld, DiPA (+ Unterstützung), Entlastungsbetrag | § 63 Abs. 2 SGB XII | buzer.de/63_SGB_XII.htm | `hilfeZurPflege` |
| Sozialhilfe setzt ein | ab Kenntnis des Trägers (Tag, nicht Monat) | § 18 Abs. 1 SGB XII | buzer.de/18_SGB_XII.htm | Texte `s.hzp.tip`, `s.blh.tip` |
| Elternunterhalt | nur wenn ein Kind jeweils mehr als 100.000 € Gesamteinkommen (§ 16 SGB IV) hat; Vermutung darunter | § 94 Abs. 1a SGB XII | buzer.de/94_SGB_XII.htm | Texte `t.hzp.heim`, `s.gsa.tip`, `pfl.pi.heim.2`, Antragsmappe GSA (`src/formulare.js`: „mehr als“ statt „ab“, 24.11.2026) |
| Blindenhilfe | 951,92 € / unter 18: 476,78 € (ab 1.7.2026) | § 72 Abs. 2 SGB XII | ZBFS-Infoblatt 7/2026 (abgeleitet), siehe Prüfliste | `R.blhBetrag` |
| Anrechnung Pflegegeld auf Blindenhilfe | PG 2: 50 % von PG-2-Pflegegeld; PG 3–5: 40 % von PG-3-Pflegegeld, höchstens 50 % der Blindenhilfe | § 72 Abs. 1 Satz 2 SGB XII | buzer.de/72_SGB_XII.htm | `blindenhilfe` |
| Bayerisches Blindengeld | 809 € / Sehbehinderte 242,70 €; Anrechnung PG 2: 46 % von PG-2-, PG 3–5: 33 % von PG-3-Pflegegeld, mind. 20 € | Art. 2, 4 BayBlindG | gesetze-bayern.de/Content/Document/BayBlindG-4 | `blindengeld0` |
| Landespflegegeld Bayern | 500 € im Jahr ab PG 2, Hauptwohnsitz Bayern | Art. 2 BayLPflGG | gesetze-bayern.de (Abruf 21.11.2026) | `landespflegegeld` |
| Rentenversicherung Pflegeperson | keine Beiträge bei Vollrente wegen Alters nach der Regelaltersgrenze (Teilrente: ja) | § 5 Abs. 4 Satz 1 Nr. 1 SGB VI, § 44 SGB XI | gesetze-im-internet.de | Text `t.pflege.renteAlt` |
| Grundsicherung bei Erwerbsminderung | nur bei dauerhafter voller Erwerbsminderung, ab 18 | § 41 Abs. 3, § 45 SGB XII | buzer.de/41_SGB_XII.htm | `grundsicherungAlter`, Text `t.gsa.emDauer` |
| Pflegegrad-Einschätzung Kinder bis 18 Monate | nur Module 3 und 5, statt Modul 4 nur 4.K (20 Einzelpunkte), aus Modul 1 nur KF 4.1.6; Grad eine Stufe höher | § 15 Abs. 7 SGB XI; Begutachtungs-Richtlinien Kap. 5 (AOK-Download, Fassung 2016) | aok.de/gp/…/begutachtungs_RL_BRi.pdf | `erweiterungen/pflege.js` `rechne` |
| Besondere Bedarfskonstellation | Gebrauchsunfähigkeit beider Arme und Beine → PG 5 | § 15 Abs. 4 SGB XI; BRi 4.9.1 | wie oben | `pflege-assistent.js` Schritt `bk` |
| Renten-Netto (geprüft 26.11.2026) | KV 7,3 % + halber durchschnittlicher Zusatzbeitrag 2,9 % (= 8,75 %), PV allein getragen 3,6 %, kinderlos 4,2 %, je Kind unter 25 ab dem 2. Kind −0,25 (höchstens −1,0 → 2,6 %); bis BBG KV 5.812,50 €. Ohne Angabe zur Elterneigenschaft: Netto aus Brutto ohne Zuschlag (eher höheres Netto), Brutto aus Zahlbetrag ohne Kinder im Haushalt mit Zuschlag; Grundsicherung im Alter: „unwahrscheinlich“ erst, wenn es auch mit Zuschlag nicht reicht | § 247, § 249a SGB V; § 55 Abs. 1, 3, § 59 Abs. 1 SGB XI | BMG „Finanzierung der Pflegeversicherung“ (Stand 14.9.2026, Abruf 26.11.2026) | `nettoRente`, `bruttoAusNettoRente`, `grundsicherungAlter` (`pvOffen`) |
| Wohngeld: Rente nur als Zahlbetrag | Zahlbetrag ≈ 87,65 % Brutto → nach 10 % / 20 % Abzug ≈ 103 % / 91 % des Zahlbetrags | §§ 14, 16 WoGG | gesetze-im-internet.de | `R.wgAbzugAuszahlung.rente = [-0,04, 0,09]` |

## 2. Konstellationen mit Soll-Ergebnis

| Konstellation | Karte | Soll | Testfall |
|---|---|---|---|
| Pflegegrad 4 oder 5, ohne GdB | pausch | ja, 7.400 € + Fahrtkosten 4.500 € (`pausch.hilflos`) | C-BEH-01, F-pa-pg4, X-pausch-pg4 |
| Blind mit GdB 100 | pausch | ja, 7.400 € + 4.500 € | C-BEH-03, F-pa-bl-100 |
| Blind ohne GdB-Angabe | pausch | möglich, 7.400 € | F-pa-bl-0, X-pausch-blind0 |
| Pflegegrad 3 ohne GdB | pausch | nein | X-pausch-pg3 |
| GdB 80 mit aG | ausweis | ja, `ausweis.ag` (Kfz-Steuer frei, Wertmarke mit Eigenbeteiligung), kein `ausweis.frei` | F-aus-04, X-ausweis-ag |
| Kind unter 18, GdB 60 | ausweis | ja, `ausweis.schwerKind`, ohne Zusatzurlaub/Kündigungsschutz | X-ausweis-kind |
| allein, über Regelaltersgrenze, GdB 30/40 | ausweis | nein, `ausweis.niedrigRente` | X-ausweis-rente40 |
| Pflegegrad 1, kleine Rente | hzp | möglich, `hzp.pg1` | C-HZP-04, F-hzp-04, X-hzp-pg1 |
| Pflegegrad 3 ohne Bundesland | lpg | möglich, `lpg.ohneLand` | F-lpg-unbekannt, X-lpg-ohneLand |
| Blind ohne Bundesland | blindengeld | ja mit Spanne, Bayern nur Beispiel | F-bl-12, X-bg-ohneLand |
| Blind, PG 3, Bayern | blh | Rest 100,99 € | F-bl-11 |
| Blind, PG 2, Bayern | blh | Rest 129,04 € | X-blh-pg2 |
| Blind, PG 3, anderes Land | blh | kein Restbetrag | X-blh-pg3-nw |
| Rentnerin ohne Behinderung | zuzahl | möglich | F-zz-01, C-BEH-11 (korrigiert) |
| Junge Person ohne Behinderung | zuzahl | eher nicht, Text: Grenze gilt für alle | X-zz-jung |
| Besondere Wohnform, PG 3 | pflege, pflegeplus | möglich, 15 %, höchstens 278 € | C-PFL-10, X-pflege-heim |
| Rentnerhaushalt pflegt | pflege | Hinweis `pflege.renteAlt` | X-pflege-renteAlt |
| Voll erwerbsgemindert (Angabe), unter Altersgrenze | gsa | Hinweis `gsa.emDauer` | X-gsa-emDauer |
| Kind 10–12 Monate, Module 1/2/6 angekreuzt | NBA | 0 Punkte, kein Pflegegrad | C-NBA-07, F-nba-15 |
| Kind 10 Monate mit 4.K | NBA | Pflegegrad 3 | C-NBA-08 |
| Kind unter 18 Monate mit Gebrauchsunfähigkeit beider Arme und Beine | NBA | Pflegegrad 5 | X-nba-bk |
| Paar, ältere Person über Regelaltersgrenze, jüngere erwerbsgemindert | emrente, srente, ggeld | möglich (nicht „nein“) | C-EMR-03, F-em-08, F-sr-06 (schon in main, PR #189) |
| Kind unter 18 mit Werkstatt-Haken | gsa | nein, `gsa.kindU18` | F-gsa-23 (schon in main) |
| Rente nur als Zahlbetrag (Wohngeld) | wohngeld | untere Schätzung ≤ Schätzung mit Brutto | fest im Läufer |
| Grundsicherung im Alter, Lohn 1.000 brutto / 800 netto, Miete 500 | gsa | ja, Spanne 500–540 € (§ 82 Abs. 3 SGB XII: Brutto-Lesart oben, Netto-Lesart unten) | R-GSA-AE1, R-GSA-AE2 |
| Rente 600 + Minijob 400 (brutto = netto) | gsa | ja, ein Betrag 130 € | R-GSA-AE3 |
| Rente 520 + Lohn 900/720, Miete 500 | gsa | möglich, Spanne bis 90 €, Text `bedarfRand` | R-GSA-AE4 |
| Rente nur brutto 1.300, keine Kinder, Miete 471 | gsa | möglich (Kinderlosen-Zuschlag offen); mit eingegebenem Netto: nein | R-PV-01, R-PV-02 |
| Renten-Netto 5 bzw. 7 Kinder | nettoRente | 886,50 € (PV 2,6 %) | R-PV-03, R-PV-04 |
| Brutto aus Zahlbetrag, ohne Kinder / 1 Kind | bruttoAusNettoRente | 1.000 € aus 870,50 € / 876,50 € | R-PV-05, R-PV-06 |
| Volle Erwerbsminderung unter der Altersgrenze (nicht Werkstatt) | gsa, hlu | Grundsicherung „wahrscheinlich“ mit Hinweis + Verweis; Hilfe zum Lebensunterhalt „möglich“ (nur bei befristeter Erwerbsminderung, § 19 Abs. 2, § 27, § 41 Abs. 3, 3a SGB XII), ohne doppelten Betrag; bei den Eltern Hinweis § 39 SGB XII (seit 25.11.2026) | HLU-P01 bis HLU-P05 |

## 3. Offen / zu klären (nicht als harte Erwartung im Test)

- Erwerbsminderungsrente „wahrscheinlich“ bei eigener Angabe „unter 3 Stunden“ (Z3 Claude).
- `nettoRente` ohne Kinderlosen-Zuschlag als Standard (Z4 Claude): bleibt (vorsichtig: eher höheres Netto); seit 26.11.2026 bei der Grundsicherung im Alter kein „unwahrscheinlich“ allein wegen des offenen Zuschlags. Genauer wäre eine Frage „Hast du Kinder (auch erwachsene)?“ – Entscheidung David.
- Digitale Pflegeanwendungen, § 92c-Zuschuss, Zuschüsse § 44a Abs. 1 in der Übersicht (Z5 Claude).
- Krankengeld als Zahlbetrag beim Wohngeld (`wgAbzugAuszahlung.kg`), gleiche Herleitung wie Rente, nicht geändert.
- Landesblindengeld SH (350 € oder 300 €), BW/MV/NI/RP einzeln nachprüfen (K2, K3 Fable).
- Regelbedarfe und Pflegebeträge 2027 erst nach Verkündung (Z8 Claude, K9 Fable).
