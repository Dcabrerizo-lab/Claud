# Wohnberechtigungsschein: Einkommensgrenzen der Länder

Geprüft am 14.11.2026 an amtlichen Quellen (Gesetz, Verordnung, Erlass, Ministerium, Amtsblatt, zuständige Stadt).
Werte in `src/rules.js` (`wbsBund`, `wbs` für Bayern, `wbsLand`), Tests `test/test-faelle.js` (Marken `wbs-land`, `wbs-land-grenze`).

Die Grenzen gelten für das **Gesamteinkommen** im Jahr (§§ 20–24 WoFG bzw. Landesrecht): Bruttoeinnahmen minus Werbungskosten,
minus je 10 % für Steuern, Kranken-/Pflege- und Rentenversicherung (wenn gezahlt), minus Freibeträge (z. B. 4.500 € bei GdB 100,
2.100 € bei GdB unter 80 mit Pflegegrad, 4.000 € junge Ehepaare) und gezahlter Unterhalt.

**So rechnet SoLo:** Das Brutto ist nie kleiner als das Gesamteinkommen. Liegt das Brutto unter der Landesgrenze, ist der WBS
„wahrscheinlich“. Darüber „möglich“ (das Amt zieht die Pauschalen und Freibeträge ab). „Eher nicht“ nur, wenn das Einkommen auch nach
30 % Abzug, Freibeträgen und gezahltem Unterhalt über der höchsten Stufe des Landes liegt, mit 5 % Reserve. Länder ohne belegte
höchste Stufe bekommen nie „eher nicht“.

| Land | allein | 2 Personen | je weitere Person | je Kind | höhere Stufe | Stand | Quelle |
|---|---|---|---|---|---|---|---|
| Bund (§ 9 Abs. 2 WoFG) | 12.000 | 18.000 | 4.100 | 500 | – | – | [gesetze-im-internet.de](https://www.gesetze-im-internet.de/wofg/__9.html) |
| Baden-Württemberg | 60.350 | 60.350 | 9.000 (ab 3. Person) | – | – | 1.12.2025 | [Erlass MLW, Anlage Einkommensgrenzen](https://mlw.baden-wuerttemberg.de/fileadmin/redaktion/m-mlw/intern/Dateien/03_Bauen-Wohnen/Wohnungsbau/Wohnraumfoerderung/2025_12_VwV-Wohnungsbau_BW_2022_Anlage_zum_Erlass_vom_01.12.2025_ge.pdf) (Bezugsgröße 71.000 € − 15 %) |
| Bayern | 17.500 | 27.500 | 5.000 | 1.300 | bis 28.300 / 43.200 / 10.700 / 3.200 (Art. 11 BayWoFG, Gemeindeverordnung) | 1.8.2024 | [Art. 4 BayWoBindG](https://www.gesetze-bayern.de/Content/Document/BayWoBindG-4) |
| Berlin | 16.800 | 25.200 | 5.740 | 700 | WBS 180, WBS 220 (Bund +120 %) | 2026 | [berlin.de Mietratgeber](https://www.berlin.de/sen/wohnen/wissen-fuer-mieter/berliner-mietratgeber/wohnberechtigungsschein/) (WBS 140 = Bund +40 %) |
| Brandenburg | 18.500 | 26.000 | 5.800 | 2.000 | – | 1.1.2024 | [§ 22 BbgWoFG](https://bravors.brandenburg.de/gesetze/bbgwofg), [Amtsblatt 28/2023](https://bravors.brandenburg.de/fm/76/Amtsblatt%2028_23.pdf) |
| Bremen | 13.200 | 19.800 | 4.510 | 550 | eingeschränkt bis Bund +60 % | 2026 | [Senatorin für Bau, Erläuterungen zum Antrag](https://bau.bremen.de/sixcms/media.php/13/05.%20Erl%C3%A4uterungen%20zum%20Antrag_Stand%20Juli%202023.pdf) (Bund +10 %) |
| Hamburg | 19.200 | 28.800 | 6.560 | 800 | 2. Förderweg +100 %, 3. Förderweg +140 % | 2026 | [hamburg.de Sozialwohnungen](https://www.hamburg.de/politik-und-verwaltung/behoerden/behoerde-fuer-stadtentwicklung-und-wohnen/themen/wohnen/wohnfoerderung/sozialwohnungen-377576), [Fachanweisung](https://www.hamburg.de/resource/blob/159146/abfe7dd6b7ff1790af0e800beb1d2332/fachanweisung-wohnraumfoerderung-wohnraumbindung-data.pdf) (§ 8 HmbWoFG = Bund, 1. Förderweg +60 %) |
| Hessen | 20.146 | 30.565 | 6.948 | 924 | – | 1.1.2026 | [Hessisches Wirtschaftsministerium](https://wirtschaft.hessen.de/wohnen-und-bauen/sozialer-wohnungsbau/fehlbelegungsabgabe) |
| Mecklenburg-Vorpommern | 25.800 | 38.700 | 8.800 | 1.500 | 2. Förderweg 27.000 / 40.500 / 9.200 | 7/2026 | [Hansestadt Rostock, Infoblatt](https://rathaus.rostock.de/media/rostock_01.a.4984.de/datei/Informationsblatt%20zum%20Wohnberechtigungsschein.pdf) (Einkommensgrenzenverordnung MV) |
| Niedersachsen | 21.250 | 28.750 | 3.750 | 3.750 | – | 1.3.2025 | [§ 3 NWoFG](https://voris.wolterskluwer-online.de/browse/document/2bfb74ce-61e3-362f-a037-844e39a67302) |
| Nordrhein-Westfalen | 23.540 | 28.350 | 6.530 | 860 | Gruppe B +40 % | 1.1.2025 | [Einkommenserlass Wohnen](https://recht.nrw.de/system/files/pdf/state-law-ministerial-gazette/2025/10/17/943c91/2025-10-01-eewo-nrw-einkommenserlass-wohnen-nordrh.pdf), [MB.NRW 2026 Nr. 82](https://recht.nrw.de/system/files/pdf/announcement/2026/03/31/2865ea/mb-nrw-2026-nr-82.pdf) |
| Rheinland-Pfalz | 19.998,91 | 28.665,10 | 6.666,31 | 1.333,25 | „speziell“ +60 % | 1.1.2026 | [Bekanntmachung FM 12.12.2025](https://mkbwk.rlp.de/fileadmin/07/Bilder/Themen/Bauen_und_Wohnen/Wohnraumfoerderung/Landeswohnraumfoerderungsgesetz/Einkommensgrenze_ab_2026.pdf), Summe auf volle 100 € aufgerundet |
| Saarland | – | – | – | – | – | – | Landeswert nicht abrufbar (Server sperrt). SoLo nutzt die Bundeswerte als sichere Untergrenze. |
| Sachsen | 20.520 | 30.780 | 7.011 | 855 | – | 1.1.2026 | [SächsEinkGrenzVO, Landeshauptstadt Dresden](https://www.dresden.de/de/rathaus/aktuelles/pressemitteilungen/12/pm_055.php) |
| Sachsen-Anhalt | 12.000 | 18.000 | 4.100 | 500 | Landesprogramme +20 % | 2026 | [Bürgerservice Sachsen-Anhalt](https://buerger.sachsen-anhalt.de/detail?areaId=9712977&infotype=0&pstId=183733), [Merkblatt Halle](https://konservatorium.halle.de/Publications/777/merkblatt_-_einkommensgrenzen_f_r_wohnberechtigung.pdf) |
| Schleswig-Holstein | 23.000 | 32.000 | 6.925,68 | 831,08 | 2. Förderweg +20 %, 3. +40 % | 1.1.2025 | [Anlage Dynamisierungserlass 2025](https://transparenz.schleswig-holstein.de/dataset/f5e2b805-a3e7-4fe5-8b2e-5280bd1fbd18/resource/ba4468c3-3264-494b-ac86-e4860294c759/download/anlage-zum-dynamisierungserlass-2025.pdf) (19.945,94 + 3.000 bzw. 29.918,91 + 2.000, aufgerundet; SoLo rechnet die Tabelle exakt nach) |
| Thüringen | 14.400 | 21.600 | 5.000 | 1.000 | Richtlinie bis +40 % | 2026 | [Thüringer Formularservice, Erläuterungen Einkommenserklärung](https://thformular.thueringen.de/thueform/cfs/eject/pdf/101.pdf?MANDANTID=18&FORMUID=THUERBAU-008-TH-FL) (§ 10 ThürWoFG) |

Alle Beträge in Euro im Jahr. Fortschreibung: BB 1.1.2028, HE 1.1.2029, SH alle 2 Jahre (nächste 1.1.2027), NW, RP und SN durch
Bekanntmachung. Bei der Jahresprüfung zum 1.12. diese Tabelle neu prüfen.
