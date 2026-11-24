# SoLo für Rente & Pflege – Quellen der Seiten „Pflegegrad beantragen“ und „Ich pflege einen Angehörigen“

Stand: 24.11.2026. Code: `src/senioren.js`, Texte `src/lang/senioren/de.json`, Einfache Sprache `src/lang/einfach/senioren.json`, Test `test/test-senioren.js`.

**Wichtig:** Die neuen Werte (Tabelle 1) wurden am 24.11.2026 nicht live gegen den Gesetzestext abgerufen (Abruf der Seiten war in der Sitzung nicht freigegeben).
Sie stammen aus dem Rechtsstand bis Juni 2026 und müssen vor dem Release einmal amtlich abgeglichen werden (Spalte „Abruf“ dann mit Datum füllen). Status: **offen**.

## 1. Neue Werte (nur in `SENIOREN.WERTE`)
| Schlüssel | Wert | Rechtsgrundlage | Quelle | Abruf |
|---|---|---|---|---|
| beratungTage | 14 Tage (Beratungstermin nach Antrag) | § 7b Abs. 1 SGB XI | gesetze-im-internet.de/sgb_11/__7b.html | offen |
| bescheidArbeitstage | 25 Arbeitstage bis zum Bescheid | § 18c Abs. 1 SGB XI | gesetze-im-internet.de/sgb_11/__18c.html | offen |
| verzugJeWoche | 70 € je begonnene Woche Fristüberschreitung; nicht wenn Kasse nicht verantwortlich oder vollstationär mit mind. PG 2 | § 18c Abs. 5 SGB XI | wie oben | offen |
| widerspruchMonate | 1 Monat Widerspruchsfrist | § 84 Abs. 1 SGG | gesetze-im-internet.de/sgg/__84.html | offen |
| akutTage | 10 Arbeitstage je Kalenderjahr (kurzzeitige Arbeitsverhinderung, Pflegeunterstützungsgeld) | § 2 Abs. 1 PflegeZG, § 44a Abs. 3 SGB XI | gesetze-im-internet.de/sgb_11/__44a.html | offen |
| pugProzent | 90 % des ausgefallenen Nettoarbeitsentgelts | § 44a Abs. 3 SGB XI i. V. m. § 45 Abs. 2 Satz 3 SGB V | gesetze-im-internet.de/sgb_5/__45.html | offen |
| pflegezeitMonate | 6 Monate | § 4 Abs. 1 PflegeZG | gesetze-im-internet.de/pflegezg/__4.html | offen |
| pflegezeitBeschaeftigte | mehr als 15 Beschäftigte | § 3 Abs. 1 Satz 2 PflegeZG | gesetze-im-internet.de/pflegezg/__3.html | offen |
| pflegezeitAnkuendigung | 10 Arbeitstage vorher schriftlich | § 3 Abs. 3 PflegeZG | wie oben | offen |
| letzteLebensphaseMonate | 3 Monate | § 3 Abs. 6, § 4 Abs. 3 PflegeZG | gesetze-im-internet.de/pflegezg/__4.html | offen |
| fpzMonate | 24 Monate (auch Höchstdauer Pflegezeit + Familienpflegezeit zusammen) | § 2 Abs. 1, 2 FPfZG | gesetze-im-internet.de/fpfzg/__2.html | offen |
| fpzBeschaeftigte | mehr als 25 Beschäftigte (ohne Auszubildende) | § 2 Abs. 1 Satz 4 FPfZG | wie oben | offen |
| fpzStunden | mindestens 15 Stunden pro Woche | § 2 Abs. 1 Satz 2 FPfZG | wie oben | offen |
| rvStunden | 10 Stunden pro Woche | § 19 Satz 2 SGB XI, § 3 Satz 1 Nr. 1a SGB VI | gesetze-im-internet.de/sgb_11/__19.html | offen |
| rvTage | an mindestens 2 Tagen | § 19 Satz 2 SGB XI | wie oben | offen |
| rvArbeitMax | höchstens 30 Stunden Erwerbsarbeit pro Woche | § 3 Satz 3 SGB VI | gesetze-im-internet.de/sgb_6/__3.html | offen |
| BMG_TEL | Bürgertelefon BMG Pflegeversicherung 030 340 60 66-02 | – | bundesgesundheitsministerium.de/service/buergertelefon | offen |

## 2. Übernommene Werte (aus `src/rules.js`, dort mit Quelle)
| Wert | rules.js | Rechtsgrundlage |
|---|---|---|
| Verhinderungs-/Kurzzeitpflege gemeinsamer Jahresbetrag 3.539 € | `entlastungsbudget` | §§ 39, 42, 42a SGB XI |
| Entlastungsbetrag 131 € | `pflege.entlastung` | § 45b SGB XI |
| Pflegehilfsmittel zum Verbrauch 42 € | `beh.verbrauch` | § 40 Abs. 2 SGB XI |
| Wohnumfeld 4.180 € je Maßnahme | `beh.wohnumfeld` | § 40 Abs. 4 SGB XI |
| Pflege-Pauschbetrag 600 / 1.100 / 1.800 € | `pflegePausch` | § 33b Abs. 6 EStG |

## 3. Aussagen ohne Zahl (zu prüfen)
| Aussage | Rechtsgrundlage |
|---|---|
| Leistungen ab dem Monat der Antragstellung | § 33 Abs. 1 Satz 2, 3 SGB XI |
| Antrag formlos, auch telefonisch | § 33 Abs. 1 SGB XI, § 16 SGB I |
| Gutachten wird mit dem Bescheid zugesandt bzw. kann angefordert werden | § 18c / § 18a SGB XI (genaue Fundstelle prüfen) |
| Verkürzte Begutachtungsfristen im Krankenhaus/Reha | § 18c Abs. 2 SGB XI |
| Höherstufung jederzeit beantragbar | § 33 SGB XI |
| Pflegeunterstützungsgeld zahlt die Pflegekasse der gepflegten Person, ärztliche Bescheinigung nötig | § 44a Abs. 3, 4 SGB XI, § 2 Abs. 2 PflegeZG |
| Zinsloses Darlehen BAFzA bei Pflegezeit/Familienpflegezeit | § 3 FPfZG |
| Altersvollrentner nach Regelaltersgrenze: rentenversicherungsfrei, Verzicht möglich (dann Beiträge der Pflegekasse) | § 5 Abs. 4 SGB VI |
| Unfallversicherung Pflegepersonen (PG 2–5, 10 Std./2 Tage) | § 2 Abs. 1 Nr. 17 SGB VII, § 44 Abs. 2a? SGB XI |
| Arbeitslosenversicherung Pflegepersonen | § 26 Abs. 2b SGB III, § 44 Abs. 2b SGB XI |
| Pflegekurse kostenlos, auch zu Hause, ohne Pflegegrad | § 45 SGB XI |
| Hausnotruf als Pflegehilfsmittel (Zuschuss) | § 40 Abs. 1 SGB XI |
