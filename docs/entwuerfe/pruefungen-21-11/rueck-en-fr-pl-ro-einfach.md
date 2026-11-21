# Rückprüfung Übersetzungen en · fr · pl · ro · Einfache Sprache (Update 1.9)

Stand 21.11.2026. Grundlage: `origin/claude/test-update-1.9` (38023de, mit Bündel 1 #90/#96/#99/#100/#101) und `b-rest-19`, `b-anschriften-amtlich`, `b-sicherheit-19`, `b-suche` (neu geholt nach Fetch-Korrektur; keine neuen Textvarianten gegenüber der ersten Prüfung).

## Umfang

| Bereich | Menge | Methode |
|---|---|---|
| Neue/geänderte Schlüssel (alle Branches, `src/lang`) | 226 Schlüssel, 233 Varianten, je en/fr/pl/ro + einfach | vollständig rückübersetzt und mit dem deutschen Original verglichen |
| Einfache-Sprache-Zuordnung `einfach/brief/brief.json` („texte“) | 459 Einträge | alle abweichenden Einträge gelesen |
| Bestand mit Frist/Betrag/§/Warnung | 1 036 Schlüssel × 4 Sprachen + einfach | maschinell: Zahlen, Platzhalter, §; dann 130 Frist-/Warn-Schlüssel von Hand rückübersetzt |
| Suchwörter `suche/woerter` | 90 Listen | nur Stichprobe (Suchbegriffe, kein angezeigter Rat) |
| Glossar `glossar.json` | – | gab es noch nicht; Fachbegriffe gegen den jeweils eigenen Langtext geprüft |

Ergebnis Maschinenprüfung: keine fehlende Übersetzung, kein Platzhalterfehler, keine falsche Zahl, kein falscher § in en/fr/pl/ro. Keine veraltete Übersetzung (de geändert, Übersetzung nicht).

## Ergebnis kurz

| Schwere | Anzahl | Freigabe |
|---|---|---|
| kritisch | 2 (Einfache Sprache, Sinnumkehr) | vor Veröffentlichung beheben |
| mittel | 22 (14 einfach, 8 Fremdsprache) | vor Veröffentlichung beheben |
| gering | ca. 25 | kann später |

Korrekturtexte für kritisch und mittel: `korrekturen-en-fr-pl-ro-einfach.json`.

## Kritisch und mittel

| Schlüssel (Sprache) | Original | Rückübersetzung | Problem | Schwere | Korrekturvorschlag |
|---|---|---|---|---|---|
| texte „Harn: überwiegend oder vollständig inkontinent…“ (einfach, brief.json; schon auf main) | Harn: überwiegend oder vollständig inkontinent, oder Katheter/Urostoma | „Urin: kann ihn meistens oder nie halten“ | Sinnumkehr: „meistens halten“ = kontinent. Falsche Auswahl führt zu falschen Pflegepunkten. | **kritisch** | „Urin: kann ihn meistens **nicht** oder nie halten, oder hat Katheter oder Urostoma“ |
| texte „Stuhl: überwiegend oder vollständig inkontinent…“ (einfach) | Stuhl: überwiegend oder vollständig inkontinent, oder Stoma | „Stuhl: kann ihn meistens oder nie halten“ | wie oben | **kritisch** | „Stuhl: kann ihn meistens **nicht** oder nie halten, oder hat ein Stoma“ |
| sp.schulden.mahn.kurz (en, fr, pl, ro) | Nach Vollstreckungsbescheid: Einspruch innerhalb von 2 Wochen. | „Widerspruch innerhalb von 2 Wochen“ (objection / opposition / sprzeciw / opoziție) | Einspruch mit dem Wort für Widerspruch übersetzt; Langtext nutzt andere Begriffe. Falscher Rechtsbehelf. | mittel | en „appeal (Einspruch)“, fr „opposition (Einspruch)“, pl „zarzut (Einspruch)“, ro „contestație (Einspruch)“ |
| s.rundfunk.tip (pl, ro; b-anschriften) | … Ehe- oder Lebenspartner in derselben Wohnung | „Ehegatte oder Partner“ | „Lebenspartner“ = eingetragen; „Partner“ verspricht Befreiung auch für unverheiratete Paare. | mittel | pl „zarejestrowanego partnera (Lebenspartner)“, ro „partenerul înregistrat (Lebenspartner)“ |
| pf.tipp.umwandeln.kurz (fr, pl, ro) | Innerhalb von 1 Monat ein P-Konto einrichten lassen. | „ein P-Konto eröffnen“ | Neues Konto schützt gesperrtes Guthaben nicht; gemeint ist Umwandlung. | mittel | fr „Fais transformer ton compte en P-Konto…“, pl „przekształć swoje konto w P-Konto“, ro „Transformă-ți contul în P-Konto“ |
| az.p.u25.t (einfach) | …schwerwiegende soziale Gründe, Arbeit **oder ähnlich wichtiger Grund** | nur 2 Gründe | Dritter Anspruchsgrund fehlt. | mittel | „Oder bei einem anderen, ähnlich wichtigen Grund.“ ergänzen |
| sl.warum.miete (einfach, schulden.json) | Bedingungen fristlose Kündigung, Heilung durch Zahlung binnen 2 Monaten, nur 1× in 2 Jahren, ordentliche Kündigung kann bleiben | test-update: „mehr als eine Monatsmiete → Kündigung“; b-anschriften: ohne Vorbehalt ordentliche Kündigung | Bedingungen und Ausnahmen fehlen; Leser glaubt, Zahlen rettet die Wohnung sicher. | mittel | vollständige Fassung siehe JSON |
| sl.warum.energie (einfach) | 2 Abschläge + 100 €, Mahnung, 4 Wochen/8 Werktage, Sperre verboten bei unverhältnismäßiger Härte | test-update: nur „kann abgestellt werden“; b-anschriften: ohne Härtefall | Schwellen bzw. Härtefall-Ausnahme fehlen. | mittel | siehe JSON |
| sl.warum.kranken (einfach) | Ruhen nach 2 Monaten; nicht bei Hilfebedürftigkeit; alle Leistungen, **solange Raten pünktlich** | „Mach Raten aus, dann bezahlt sie alles“ | Bedingung und Ausnahme fehlen. | mittel | siehe JSON |
| el.ks.kern (einfach, kostensenkung.json) | zahlt weiter, solange du nicht senken kannst, meist höchstens 6 Monate | „zahlt meistens noch 6 Monate weiter“ | Klingt nach sicherer 6-Monats-Frist. | mittel | „…solange du sie nicht senken kannst. Das sind meistens höchstens 6 Monate.“ |
| el.ks.tun.umzug (einfach) | Umzugskosten und Kaution nur mit vorheriger Zusicherung | fehlt | Bedingung fehlt. | mittel | Satz ergänzen (JSON) |
| el.ks.d.karenz (einfach) | Karenzzeit gilt nicht bei Mietpreisbremse, qm-Höchstgrenze, früherer Begrenzung | fehlt; „1,5-fache vom normalen Betrag“ | Ausnahmen fehlen; Bezug unklar. | mittel | siehe JSON |
| el.ks.d.sa (einfach) | 1,5-fach von Anfang an; Jobcenter-Karenzzeit wird angerechnet | fehlt | Rechtlich wichtige Grenzen fehlen. | mittel | siehe JSON |
| hb.hw.mb.schwanger.d (einfach, haushalt.json) | bis zum **Ende des Monats** der Geburt | „Bis zum Monat der Geburt“ | Mehrdeutig, kann einen Monat zu kurz gelesen werden. | mittel | „Bis zum Ende von dem Monat, in dem das Kind geboren wird.“ |
| hb.hw.steuer.d (einfach) | 20 % der Arbeitskosten, Höchstbetrag nur § 35a; Krankheitskosten über zumutbarer Belastung | Höchstbetrag auch für Arzt-Kosten und Arbeitsmittel | Sachlich falsch zugeordnet; 20 % fehlt. | mittel | siehe JSON |
| wgmax.d.heiz (einfach, mietgrenze.json) | fester Betrag {heiz} bei {personen} | „Das ist bei allen gleich.“ | Falsch, hängt von Personenzahl ab. | mittel | „Der Betrag hängt nur davon ab, wie viele Personen im Haushalt leben.“ |
| texte „Rente mit 33 Jahren Grundrentenzeiten“ / „Gesetzliche Rente brutto…“ (einfach; nur test-update, b-rest) | Grundrentenzeiten | „33 Jahre Arbeit“ / „Grundrente nach 33 Jahren“ | Grundrentenzeiten umfassen auch Kindererziehung und Pflege; „nach 33 Jahren“ missverständlich. | mittel | „mindestens 33 Jahre Grundrenten-Zeiten (zum Beispiel Arbeit, Kinder-Erziehung, Pflege)“ |

## Gering (später)

| Schlüssel (Sprache) | Problem | Vorschlag |
|---|---|---|
| kb.bis, kb.d.bringen.bis, fri.art.mit.t, sl.frist.mahnbescheid (fr) | „avant le“ = vor dem Tag (bis = einschließlich). Richtung sicher, aber ungenau. | „au plus tard le …“ / „jusqu’au …“ |
| sl.warum.energie, gs.d.strom.* (en, pl, ro) | „Werktage“ als working days / dni robocze / zile lucrătoare (ohne Samstag). | „8 days (excluding Sundays and public holidays)“ o. ä. |
| sl.warum.energie (fr) | „l’aide sociale (Sozialamt)“ für Sozialhilfe | „l’aide sociale (Sozialhilfe)“ |
| az.p.u25.t (pl, ro) | Letzter Satz ohne Subjekt, „kann verzichten“ bezieht sich scheinbar auf den Nutzer | „Jobcenter może…“ / „Jobcenter poate…“ |
| f.pickWege (pl) | grammatisch holprig („przysługują tylko jedno albo drugie“) | „…można dostać tylko jedno z nich“ |
| gs.d.strom.grenze vs .kurz (ro) | „întrerupere“ und „debranșare“ gemischt | einheitlich „întrerupere“ |
| fr/ro allgemein (t.uvg.frist, el.ks.*, hb.hw.verm.d2, hb.hw.mb.ae.d) | „vous/voi“ statt „tu“ | auf „tu“ angleichen |
| Widerspruch (fr „recours/opposition“, pl „sprzeciw/odwołanie“) | Begriff schwankt | je Sprache ein Wort festlegen (Glossar) |
| el.ks.frist.da (pl) | „w „Moim folderze”“ statt UI-Name „Mój folder“ | „w „Mój folder”“ |
| sp.schulden.2, sl.kopf.1 (en) | „fines“ ohne Unterschied Geldstrafe/Bußgeld | „criminal fines (Geldstrafe)“ |
| kw.teil.pflegecheck (en) | „Care assessment“ wirkt wie amtliches Gutachten | „Care self-assessment“ |
| kb.teil.hilfen (fr) | Anglizismus „check“ | „Résultat de la vérification des aides“ |
| tv.laufzeit vs tv.laufzeit.kurz (alle, auch de) | Langtext „etwa 1 Jahr“, Kurztext „höchstens 1 Jahr“ (Quelle uneinheitlich) | im Deutschen angleichen |
| tv.kuendigung (einfach) | „Das steht…“ ohne Bezug | „Die Kündigungs-Frist steht…“ |
| texte „Nur übernehmen, was…“ (einfach) | „wisst nur du und…“ falsche Form | „wissen nur du und die gepflegte Person“ |
| vg.pin.erkl (einfach, test-update) | „nirgends gespeichert“ fehlt | ergänzen |
| fri.rechnung.wid.ohne / .zustellung / .wid.zugang, fri.rechnung.feiertag, fri.art.mb.t (einfach) | günstige Regeln (Wochenende/Feiertag, Widerspruch bis zum VB) weggelassen | optional ergänzen |
| fri.art.termin.t (einfach) | „30 %, Miete und Heizung nicht gekürzt“ fehlt | ergänzen |
| el.ks.deckel, el.ks.d.heiz, el.ks.d.mpb, el.ks.d.tod, hb.hw.verm.d.gsa, sl.warum.geldstrafe, gs.d.geld.frist.kurz (einfach) | Vereinfachungen ohne Fehlaussage | optional |
| Satzlänge Einfache Sprache | 69 von 768 Sätzen über 12 Wörter (meist 13–18 durch §-Angaben); längster: BG-Erklärung (22 Wörter) | §-Angabe in eigenen Satz, Aufzählung teilen |

## Hinweise zum Zusammenführen

- `vg.pin.erkl`: test-update-1.9/b-rest-19 haben die neue Fassung („Sichtschutz…“), b-anschriften-amtlich/b-sicherheit-19/b-suche noch die alte („…auch wir nicht“). Beide Fassungen sind in allen 4 Sprachen korrekt; beim Merge die neue behalten.
- `ra.*` (Raten): b-anschriften-amtlich hat eine andere Logik (Vorrang-Gruppen, Pfändungsgrenze). Übersetzungen beider Fassungen sind korrekt.
- `sl.warum.miete` / `sl.warum.energie` in Einfacher Sprache unterscheiden sich je Branch; Korrektur auf die Fassung anwenden, die gemergt wird.
- Suchwörter (Stichprobe): unauffällig; „basic income“ als Suchwort für Bürgergeld ist unscharf, aber unschädlich.
