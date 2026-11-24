# SoLo für Rente & Pflege – Quellen der Seiten „Pflegegrad beantragen“ und „Ich pflege einen Angehörigen“

Stand: 24.11.2026. Code: `src/senioren.js`, Texte `src/lang/senioren/de.json`, Einfache Sprache `src/lang/einfach/senioren.json`, Test `test/test-senioren.js`.

**Status:** Alle Werte am 24.11.2026 gegen den amtlichen Wortlaut abgeglichen (unabhängige Prüfung, siehe Prüfvermerk am Ende). Nur geltendes Recht, nichts, was erst ab 1.1.2027 gilt.
Abruf jeweils am 24.11.2026. „GII“ = www.gesetze-im-internet.de (Bundesministerium der Justiz und für Verbraucherschutz).

## 1. Neue Werte (nur in `SENIOREN.WERTE`)
| Schlüssel | Wert | Fundstelle (Paragraf, Absatz, Satz) | Quelle | Abruf | Ergebnis |
|---|---|---|---|---|---|
| beratungTage | Beratungstermin oder Beratungsgutschein innerhalb von 2 Wochen nach Antragseingang; auf Wunsch zu Hause | § 7b Abs. 1 Satz 1 Nr. 1 und 2, Satz 4 SGB XI | GII sgb_11/__7b.html | 24.11.2026 | bestätigt, Text um Gutschein ergänzt |
| bescheidArbeitstage | 25 Arbeitstage nach Eingang des Antrags, schriftlich | § 18c Abs. 1 Satz 1 SGB XI | GII sgb_11/__18c.html | 24.11.2026 | bestätigt |
| verzugJeWoche | 70 € je begonnene Woche; nicht, wenn die Kasse die Verzögerung nicht zu vertreten hat oder bei vollstationärer Pflege mit mind. Pflegegrad 2; Frist ruht, solange angeforderte Unterlagen fehlen | § 18c Abs. 5 Satz 1 und 2, Abs. 6 SGB XI | wie oben | 24.11.2026 | bestätigt, Text um Abs. 6 ergänzt |
| widerspruchMonate | 1 Monat nach Bekanntgabe, schriftlich, elektronisch oder zur Niederschrift | § 84 Abs. 1 Satz 1 SGG | GII sgg/__84.html | 24.11.2026 | bestätigt |
| akutTage | Fernbleiben bis zu 10 Arbeitstage (ohne „je Kalenderjahr“); Pflegeunterstützungsgeld bis zu 10 Arbeitstage je Kalenderjahr, für alle Angehörigen einer pflegebedürftigen Person zusammen, nur ohne Entgeltfortzahlung | § 2 Abs. 1 PflegeZG; § 44a Abs. 3 Satz 1 und 2 SGB XI | GII pflegezg/__2.html, sgb_11/__44a.html | 24.11.2026 | Wert bestätigt, Text korrigiert |
| pugProzent | 90 % des ausgefallenen Nettoarbeitsentgelts (100 % bei Einmalzahlung in den letzten 12 Monaten; Höchstbetrag 70 % der Beitragsbemessungsgrenze) | § 44a Abs. 3 Satz 4 SGB XI i. V. m. § 45 Abs. 2 Satz 3 bis 5 SGB V | GII sgb_5/__45.html | 24.11.2026 | bestätigt, Verweis präzisiert |
| pflegezeitMonate | längstens 6 Monate je nahem Angehörigen | § 4 Abs. 1 Satz 1 PflegeZG | GII pflegezg/__4.html | 24.11.2026 | bestätigt |
| pflegezeitBeschaeftigte | kein Anspruch bei in der Regel 15 oder weniger Beschäftigten; dort Antrag auf Vereinbarung, Antwort binnen 4 Wochen | § 3 Abs. 1 Satz 2, Abs. 6a Satz 1 und 2 PflegeZG | GII pflegezg/__3.html | 24.11.2026 | bestätigt, Text ergänzt |
| pflegezeitAnkuendigung | spätestens 10 Arbeitstage vor Beginn, in Textform (nicht „schriftlich“) | § 3 Abs. 3 Satz 1 PflegeZG | wie oben | 24.11.2026 | Wert bestätigt, Form korrigiert |
| letzteLebensphaseMonate | 3 Monate je nahem Angehörigen | § 3 Abs. 6 Satz 1, § 4 Abs. 3 Satz 2 PflegeZG | GII pflegezg/__3.html, __4.html | 24.11.2026 | bestätigt |
| fpzMonate | längstens 24 Monate; Pflegezeit und Familienpflegezeit zusammen höchstens 24 Monate | § 2 Abs. 1 Satz 1, Abs. 2 FPfZG; § 4 Abs. 1 Satz 4 PflegeZG | GII fpfzg/__2.html | 24.11.2026 | bestätigt |
| fpzBeschaeftigte | kein Anspruch bei in der Regel 25 oder weniger Beschäftigten, ohne die zur Berufsbildung Beschäftigten | § 2 Abs. 1 Satz 4 FPfZG | wie oben | 24.11.2026 | bestätigt |
| fpzStunden | mindestens 15 Stunden pro Woche (im Jahresdurchschnitt) | § 2 Abs. 1 Satz 2 und 3 FPfZG | wie oben | 24.11.2026 | bestätigt |
| fpzAnkuendigungWochen (neu) | Ankündigung spätestens 8 Wochen vorher in Textform (im Anschluss an Pflegezeit: 3 Monate) | § 2a Abs. 1 Satz 1 und 5 FPfZG | GII fpfzg/__2a.html | 24.11.2026 | neu aufgenommen |
| rvStunden | wenigstens 10 Stunden wöchentlich | § 19 Satz 2, § 44 Abs. 1 Satz 2 SGB XI; § 3 Satz 1 Nr. 1a SGB VI | GII sgb_11/__19.html, __44.html, sgb_6/__3.html | 24.11.2026 | bestätigt |
| rvTage | verteilt auf regelmäßig mindestens 2 Tage in der Woche | wie oben | wie oben | 24.11.2026 | bestätigt |
| rvArbeitMax | regelmäßig nicht mehr als 30 Stunden wöchentlich erwerbstätig | § 3 Satz 3 SGB VI; § 44 Abs. 1 Satz 1 SGB XI | GII sgb_6/__3.html | 24.11.2026 | bestätigt |
| BMG_TEL | Bürgertelefon zur Pflegeversicherung (030) 340 60 66-02 | – | bundesgesundheitsministerium.de/service/buergertelefon (Seitenstand 5.8.2026) | 24.11.2026 | bestätigt |

## 2. Übernommene Werte (aus `src/rules.js`, dort mit Quelle)
| Wert | rules.js | Fundstelle | Quelle | Abruf | Ergebnis |
|---|---|---|---|---|---|
| Gemeinsamer Jahresbetrag Verhinderungs- und Kurzzeitpflege 3.539 € je Kalenderjahr, ab Pflegegrad 2 | `entlastungsbudget` | § 42a Abs. 1 SGB XI | GII sgb_11/__42a.html | 24.11.2026 | bestätigt |
| Entlastungsbetrag bis zu 131 € monatlich (häusliche Pflege, ab Pflegegrad 1) | `pflege.entlastung` | § 45b Abs. 1 Satz 1 SGB XI | GII sgb_11/__45b.html | 24.11.2026 | bestätigt |
| Pflegehilfsmittel zum Verbrauch 42 € monatlich | `beh.verbrauch` | § 40 Abs. 2 Satz 1 SGB XI | GII sgb_11/__40.html | 24.11.2026 | bestätigt |
| Wohnumfeld 4.180 € je Maßnahme | `beh.wohnumfeld` | § 40 Abs. 4 SGB XI | wie oben | 24.11.2026 | bestätigt |
| Pflege-Pauschbetrag 600 / 1.100 / 1.800 € (Pflegegrad 2 / 3 / 4 oder 5), ohne Einnahmen, Pflege in eigener Wohnung oder der des Pflegebedürftigen | `pflegePausch` | § 33b Abs. 6 Satz 1 und 3 EStG | GII estg/__33b.html | 24.11.2026 | bestätigt |

## 3. Aussagen ohne Zahl
| Aussage | Fundstelle | Quelle | Abruf | Ergebnis |
|---|---|---|---|---|
| Leistungen ab Antragstellung, bei späterem Antrag ab Beginn des Antragsmonats | § 33 Abs. 1 Satz 2 und 3 SGB XI | GII sgb_11/__33.html | 24.11.2026 | bestätigt |
| Antrag auch telefonisch; Angehörige können ihn mit Vollmacht stellen | BMG, Online-Ratgeber Pflege „Pflegebedürftig. Was nun?“ (Seitenstand 14.9.2026) | bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/pflegebeduerftig-was-nun | 24.11.2026 | bestätigt (§ 16 SGB I war nicht abrufbar, wird nicht benötigt) |
| Gutachten wird mit dem Bescheid übersandt, außer bei Widerspruch gegen die Übersendung; kann auch später verlangt werden | § 18c Abs. 2 Satz 1 und 5 SGB XI | GII sgb_11/__18c.html | 24.11.2026 | Fundstelle geklärt, Text angepasst |
| Verkürzte Begutachtungsfristen: spätestens am 5. Arbeitstag bei Krankenhaus, stationärer Reha, Hospiz, ambulanter Palliativversorgung; 10 Arbeitstage zu Hause bei angekündigter Pflegezeit oder vereinbarter Familienpflegezeit | § 18a Abs. 5 Satz 1 und 3, Abs. 6 Nr. 1 SGB XI (nicht § 18c Abs. 2) | GII sgb_11/__18a.html | 24.11.2026 | Fundstelle korrigiert, Text ergänzt (ohne Tageszahlen) |
| Höherstufung auf Antrag | § 33 Abs. 1 Satz 1 SGB XI | GII sgb_11/__33.html | 24.11.2026 | bestätigt |
| Pflegeunterstützungsgeld zahlt die Pflegekasse des Pflegebedürftigen auf unverzüglichen Antrag; Bescheinigung von Arzt oder Pflegefachperson | § 44a Abs. 3 Satz 3 SGB XI, § 2 Abs. 2 Satz 2 PflegeZG | GII sgb_11/__44a.html, pflegezg/__2.html | 24.11.2026 | korrigiert (vorher nur „ärztlich“) |
| Zinsloses Darlehen des BAFzA bei Pflegezeit und Familienpflegezeit, Hälfte der Nettolohn-Differenz | § 3 Abs. 1 und 2 FPfZG, § 3 Abs. 7 PflegeZG | GII fpfzg/__3.html | 24.11.2026 | bestätigt, Text präzisiert („ein Teil“, Rückzahlung) |
| Altersvollrente nach Regelaltersgrenze: versicherungsfrei. Ein Verzicht ist nur für Beschäftigte und Selbständige vorgesehen, nicht für Pflegepersonen. Weg: Teilrente (10 bis 99,99 %), dann wieder Beiträge der Pflegekasse | § 5 Abs. 4 Satz 1 Nr. 1, Satz 2 und 4 SGB VI; § 42 Abs. 1 SGB VI; DRV-Broschüre „Rente für Pflegepersonen“, 20. Auflage (6/2026), S. 8 und 11 | GII sgb_6/__5.html, __42.html; deutsche-rentenversicherung.de (Broschüre Nr. 403) | 24.11.2026 | **korrigiert** (vorher falsch: „Antrag bei der Rentenversicherung“) |
| Unfallversicherung der Pflegepersonen (mind. Pflegegrad 2, 10 Std. an 2 Tagen; keine 30-Stunden-Grenze); kommunaler Unfallversicherungsträger | § 2 Abs. 1 Nr. 17, § 129 Abs. 1 Nr. 7 SGB VII; § 44 Abs. 2a SGB XI | GII sgb_7/__2.html, __129.html | 24.11.2026 | korrigiert (vorher „gleiche Bedingungen wie bei der Rente“) |
| Arbeitslosenversicherung der Pflegepersonen: mind. Pflegegrad 2, 10 Std. an 2 Tagen, unmittelbar vorher versicherungspflichtig oder Anspruch auf Entgeltersatzleistung; nicht bei anderer Versicherungspflicht | § 26 Abs. 2b, Abs. 3 Satz 5 SGB III; § 44 Abs. 2b SGB XI | GII sgb_3/__26.html, sgb_11/__44.html | 24.11.2026 | bestätigt, Text präzisiert |
| Pflegekurse unentgeltlich, auf Wunsch zu Hause, auch für Interessierte | § 45 Abs. 1 Satz 1 und 3 SGB XI | GII sgb_11/__45.html | 24.11.2026 | bestätigt |
| Tagespflege ab Pflegegrad 2, mit Beförderung, ohne Anrechnung auf Pflegegeld | § 41 Abs. 1 und 3 SGB XI | GII sgb_11/__41.html | 24.11.2026 | bestätigt, „ab Pflegegrad 2“ ergänzt |
| Verhinderungspflege: Erstattungsantrag bis Ende des Folgejahres; bei nahen Verwandten oder Haushaltsangehörigen (nicht erwerbsmäßig) in der Regel nur Pflegegeld für bis zu 2 Monate | § 39 Abs. 1 Satz 2, Abs. 3 Satz 2 SGB XI | GII sgb_11/__39.html | 24.11.2026 | ergänzt |
| Hausnotruf ist ein technisches Pflegehilfsmittel; die Pflegekasse prüft die Notwendigkeit | § 40 Abs. 1 SGB XI; BMG-Broschüre „Pflegeleistungen zum Nachschlagen“, Stand 07/2026, Abschnitt 1.8.2 | bundesgesundheitsministerium.de/fileadmin/Dateien/5_Publikationen/Pflege/Broschueren/BMG_Pflegeleistungen_zum_Nachschlagen_bf.pdf | 24.11.2026 | bestätigt; Text sagt „kann bezuschussen“ |

## Prüfvermerk (24.11.2026)
Unabhängige Prüfung aller Werte und Rechtsaussagen gegen den amtlichen Wortlaut. Einige Seiten von gesetze-im-internet.de brachen beim Abruf mehrfach ab und wurden wiederholt, bis sie vollständig vorlagen. Nicht abrufbar blieben § 18 SGB XI und § 16 SGB I; beide werden für keine Aussage gebraucht.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Altersvollrentner nach Regelaltersgrenze: Text versprach Rentenbeiträge „auf Antrag bei der Rentenversicherung“. Einen solchen Verzicht gibt es für Pflegepersonen nicht | hoch | Text neu: keine Beiträge; Weg über Teilrente (z. B. 99,99 %), Hinweis Betriebsrente, Beratung, Pflegekasse informieren | § 5 Abs. 4 SGB VI, § 42 Abs. 1 SGB VI, DRV-Broschüre Nr. 403 (6/2026) S. 8, 11 |
| Kurzzeitige Arbeitsverhinderung: „10 Arbeitstage im Jahr“ vermischte Fernbleiben (§ 2 PflegeZG, ohne Jahresbezug) und Pflegeunterstützungsgeld (je Kalenderjahr, je pflegebedürftiger Person für alle Angehörigen zusammen, nur ohne Lohnfortzahlung) | mittel | Text getrennt; „mit Geld“ zu „oft mit Geld“; Antrag „sofort“ | § 2 Abs. 1 PflegeZG, § 44a Abs. 3 Satz 1 bis 3 SGB XI |
| Bescheinigung nur „ärztlich“; das Gesetz lässt auch die Bescheinigung einer Pflegefachperson zu | mittel | ergänzt | § 2 Abs. 2 Satz 2 PflegeZG, § 44a Abs. 3 Satz 3 SGB XI |
| Einfache Sprache: „Lohn ohne Abzüge“ kann als Brutto verstanden werden | mittel | „Netto-Lohn. Das ist der Lohn, der auf dein Konto kommt.“ | § 45 Abs. 2 Satz 3 SGB V |
| Pflegezeit-Ankündigung „schriftlich“; das Gesetz verlangt Textform (E-Mail genügt) | niedrig | korrigiert | § 3 Abs. 3 Satz 1 PflegeZG |
| Unfallversicherung „unter den gleichen Bedingungen wie bei der Rente“: Die 30-Stunden-Grenze gilt dort nicht | mittel | eigene Voraussetzungen genannt, Träger präzisiert | § 2 Abs. 1 Nr. 17, § 129 Abs. 1 Nr. 7 SGB VII |
| Familienpflegezeit: Ankündigungsfrist fehlte; Darlehen deckt nur die Hälfte der Differenz und ist zurückzuzahlen | mittel | 8 Wochen als neuer Wert `fpzAnkuendigungWochen`; „ein Teil“, „zurückzahlen“ | § 2a Abs. 1 Satz 1, § 3 Abs. 2 FPfZG |
| Verhinderungspflege: Frist für die Erstattung und geringerer Betrag bei nahen Verwandten fehlten | mittel | ergänzt | § 39 Abs. 1 Satz 2, Abs. 3 Satz 2 SGB XI |
| Verkürzte Begutachtungsfristen mit falscher Fundstelle (§ 18c Abs. 2); Hospiz, Palliativversorgung und Pflegezeit fehlten | niedrig | Fundstelle § 18a Abs. 5 und 6; Text ergänzt | § 18a Abs. 5, 6 SGB XI |
| Beratung: Statt Termin kann die Kasse einen Beratungsgutschein ausstellen; Frist ruht bei angeforderten Unterlagen | niedrig | ergänzt | § 7b Abs. 1 Satz 1 Nr. 2, § 18c Abs. 6 SGB XI |
| Arbeitslosenversicherung: „vorher versichert“ ungenau, „arbeitest weniger“ kann falsche Erwartung wecken | niedrig | „direkt vorher“, Pflegeumfang genannt | § 26 Abs. 2b, Abs. 3 Satz 5 SGB III |
| Entlastungsbetrag ohne „bis zu“; Tagespflege ohne „ab Pflegegrad 2“ | niedrig | ergänzt | § 45b Abs. 1 Satz 1, § 41 Abs. 1 SGB XI |
| Rechtsgrundlagen in `SENIOREN.WERTE` ohne Satzangabe | niedrig | Satzangaben eingetragen | siehe Tabelle 1 |
| Sicherheit: `innerHTML` nur für feste SVG-Pfade aus `SYM`, Texte per `textContent`, keine Speicherung, keine neuen Farben oder Startkacheln | ohne Befund | – | `src/senioren.js` |

Hinweis: Die BMG-Seite „Pflegebedürftig. Was nun?“ nennt für die verkürzten Fristen „eine Woche“ und „zwei Wochen“, das Gesetz den 5. und 10. Arbeitstag. Maßgeblich ist das Gesetz; die App nennt hier bewusst keine Tageszahl.
