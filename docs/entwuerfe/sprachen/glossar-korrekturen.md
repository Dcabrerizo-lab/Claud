# Glossar-Korrekturen nach der Du-Prüfung (21.11.2026)

Branch `claude/b-glossar` (Basis `claude/b-buendel-n2`). Geändert: nur bestehende Schlüssel in `src/lang/**` (55 Stellen, 15 Dateien) und diese Datei.
`glossar.json` / `glossar.md` liegen auf `claude/b-entwuerfe` und `claude/b-sprachverfahren`, nicht auf diesem Branch. Die Korrekturen unten gelten für diese Dateien und gehen ihnen vor, bis sie dort eingetragen sind.

Alle Quellen abgerufen am 21.11.2026. „amtlich“ = Bundesbehörde oder Bundesministerium.

## 1. Korrekturen am Glossar

| Begriff | Sprache | Glossar bisher | Richtig | Grund und Quelle |
|---|---|---|---|---|
| Bescheid | ru | уведомление (E) | **решение** (A) | Bundesgesundheitsministerium, gesund.bund.de (ru): „решение кассы по уходу“, „с момента получения решения“. Auch die bisherige Glossar-Quelle Handbook Germany trennt: „письменное решение“ = Bescheid, „уведомление“ = bloße Mitteilung. Die App nutzt „уведомление“ genau so für „Hinweis, keine Entscheidung“ (`el.ks.keinWs`). https://gesund.bund.de/ru/vorgehen-gegen-bescheid-der-pflegekasse · https://handbookgermany.de/ru/jobcenter |
| Widerspruch | ru | протест (E) | **возражение** (A) | gesund.bund.de (ru): „в течение месяца можно подать возражение“, „Возражение необходимо подать в течение одного месяца“. „протест“ bleibt in der App nur für den Einspruch gegen den Vollstreckungsbescheid, immer mit „(Einspruch)“. Quelle wie oben. |
| arbeitsuchend gemeldet | ru | (fehlt) | **в качестве лица, ищущего работу** (A) | Familienkasse, Antrag KG 1a russisch: „зарегистрирован(а) в качестве лица, ищущего работу“. Geschlechtsneutral. https://www.arbeitsagentur.de/datei/antrag-kindergeld-fuer-vollwaisen-kg1a-russisch_ba147730.pdf |
| Frist | uk | термін (A) | **строк** (A); „термін дії“ nur für Gültigkeit | Germany4Ukraine (Bundesregierung) nutzt beide Wörter: „обмежена строком до 31 грудня 2023“, „на строк до трьох місяців“, aber „термін дії“ für die Gültigkeit eines Dokuments. Die App nutzt durchgehend „строк“ (90 Texte); das ist das Wort der ukrainischen Rechtssprache für einen Zeitraum. https://www.germany4ukraine.de/UA/arbeit-und-soziales/ukrainer-sozialleistungen/seite_node.html · https://www.germany4ukraine.de/UA/familie-und-kind/finanzielle-unterstuetzung-fuer-familien/seite_node.html |
| Minijob | uk | (fehlt) | **мініджоб (Minijob)** oder nur „Minijob“ | Bundesagentur für Arbeit, Flyer ukrainisch, lässt „Minijob“ deutsch. „мініджоб“ ist die Umschrift davon; „мініробота“ ist nicht belegt. https://www.arbeitsagentur.de/vor-ort/datei/flyer_ukrainisch_fakten_gegen_falschinformationen_ba208997.pdf |
| Einspruch (Kindergeld, Steuer) | pl | (fehlt; Hinweis bei Widerspruch falsch: „dort Einspruch = sprzeciw“) | **odwołanie** (A) | Familienkasse, Merkblatt KG 2 polnisch, Nr. 12: „odwołanie (w przypadku zasiłku na dziecko na podstawie ustawy o podatku dochodowym) lub sprzeciw (… na podstawie ustawy o zasiłku na dziecko)“. Also Einspruch = odwołanie, Widerspruch = sprzeciw. https://www.arbeitsagentur.de/datei/kg2-pl-merkblattkindergeld_ba035415.pdf |
| Einspruch gegen den Vollstreckungsbescheid | pl | (fehlt) | **sprzeciw (Einspruch)** – nicht amtlich belegt, siehe 3. | „zarzut“ ist nirgends belegt. „odwołanie“ ist amtlich nur für das Finanz- und Kindergeldverfahren belegt. Für das gerichtliche Mahnverfahren schreibt die Verbraucherzentrale (öffentlich gefördert, nicht amtlich): „sprzeciw przeciwko nakazowi egzekucyjnemu“. https://www.verbraucherzentrale.de/pl/node/48291 |
| Vollstreckungsbescheid | pl | Lücke, Vorschlag „nakaz egzekucyjny“ | **nakaz egzekucyjny (Vollstreckungsbescheid)** (nicht amtlich) | Verbraucherzentrale: „nakaz egzekucyjny (niem. Vollstreckungsbescheid)“. Quelle wie oben. |
| Mahnbescheid | pl | Lücke, Vorschlag „nakaz zapłaty“ | **sądowy nakaz zapłaty (Mahnbescheid)** (nicht amtlich) | Verbraucherzentrale: „sądowy nakaz zapłaty“. Quelle wie oben. |

## 2. Änderungen in der App je Sprache

| Sprache | Schlüssel | Änderung |
|---|---|---|
| ru | `f.alg1.meldung`, `s.alg1.wo`, `s.alg1.tip`, `t.alg1.melden`, `ausziehen: az.p.kindergeld.t` | „как ищущий работу“ → „в качестве лица, ищущего работу“ (Wortlaut der Familienkasse); „как безработный“ → „встать на учёт по безработице (arbeitslos)“ |
| ru | `arbeit.label`, `arbeit.arbeitslos`, `schritte: sf.q.arbeitSit` | „безработный“ → „без работы“, „уволен“ → „уволен(а)“ |
| ru | Bescheid / Widerspruch | Keine Änderung: App nutzt schon durchgehend „решение“ / „возражение“. Das Glossar war falsch (siehe 1). |
| uk | `eu.arbeit.label`, `ausziehen: az.p.kv.t` | „мініробота“ → „мініджоб“ |
| uk | `sp.vertraege.6` | „Після першого терміну“ → „Після першого строку дії“ (einzige Stelle mit „термін“ für einen Zeitraum) |
| pl | `fristen: fri.art.vb`, `gs.d.mahn.frist`, `sp.schulden.mahn`, `sp.schulden.mahn.kurz`, `schulden: sl.frist.vollstreckungsbescheid`, `…vorbei` | „zarzut (Einspruch)“ → „sprzeciw (Einspruch)“. Weil der Widerspruch gegen den Mahnbescheid auch „sprzeciw“ heißt, steht das deutsche Wort jetzt an jeder Stelle in Klammern dabei. |
| tr | `ausziehen: az.p.u25.t` | „anne baban“ → „ailen“ (deutsch: „deine Familie“, nicht „deine Eltern“) |
| tr | `uz.an.exk`, `schritte: sf.h.uzBetrag` | „eski eş“ → „eski eş veya partner“ (deutsch: „frühere Partner“, auch unverheiratet) |
| fr | `az.p.kv.t`, `az.p.kindergeld.t`, `az.p.wohngeld.t`, `t.wohngeld.ausreise`, `t.wbs.ausreise`, `t.uvg.wechsel`, `t.gsa.eltern`, `t.wohngeld.eltern`, `nh.s1`, `nh.s2`, `ek.art.selbst`, `eu.arbeit.label`, `aufenthalt.eu`, `sl.stufe.3`, `sl.warum.kranken` | Form mit „(e)“ wie schon sonst in der Datei (marié(e), déclaré(e)) |
| fr | `az.p.haftpflicht.t`, `az.p.phv.t`, `az.p.hausrat.t`, `eo.a.t`, `sp.vertraege.1`, `hb.hw.tarif`, `t.alg1.keine`, `f.alg1.meldung`, `s.alg1.wo`, `uz.an.ex` | neutral umgestellt: „te faire exonérer“, „l'assurance de tes parents te couvre“, „s'inscrire au chômage (arbeitslos)“ |
| fr | `f.alg1.meldung`, `s.alg1.wo`, `s.alg1.tip`, `t.alg1.melden`, `az.p.kindergeld.t` | „demandeur d'emploi“ → „demandeur(se) d'emploi (arbeitsuchend)“. Grundwort wie im Merkblatt KG 2 französisch („inscrit comme demandeur d'emploi“). https://www.arbeitsagentur.de/datei/kg2-f-merkblattkindergeld_ba035400.pdf |

Bewusst nicht geändert (tr): `t.bab.ja` „eşinin“ und `t.uz.wg` „eski eş“. Der deutsche Text sagt „Partner“, meint dort aber rechtlich Ehe- oder Lebenspartner. Diese beiden Rechtsaussagen wurden hier nicht gegen das Gesetz nachgeprüft.

## 3. Offen

| Punkt | Warum offen |
|---|---|
| pl: amtlicher Beleg für „sprzeciw“ beim Vollstreckungsbescheid | Die amtlichen Fundstellen waren am 21.11.2026 nicht abrufbar: e-justice.europa.eu (Länderseite Deutschland, polnisch) sperrt den Zugriff nach Land, eur-lex.europa.eu (Verordnung (EG) Nr. 1896/2006, polnische Fassung) lieferte eine leere Antwort. Sperren wurden nicht umgangen. Bitte dort gegenlesen, ob „Einspruch“ mit „sprzeciw“ übersetzt ist. |
| uk: „строк“ als Wort der Rechtssprache | Das ukrainische Zivilgesetzbuch (zakon.rada.gov.ua) war nicht abrufbar (Verbindung abgebrochen). Belegt ist nur die Verwendung bei Germany4Ukraine. |
| ru/uk/pl: Muttersprachler-Prüfung der neuen Formulierungen | Keine unabhängige Prüfung in dieser Sitzung. |
| uk: „Minijob“ steht in 5 Texten nur deutsch, in 9 als „мініджоб“ | Beides ist zulässig; nicht vereinheitlicht. |
| fr: `t.kindergeld.mehr` („inscrits comme chômeurs“) | Nicht angefasst: `claude/b-regeln-h12` schreibt diesen Satz inhaltlich neu; eine zweite Änderung hier gäbe nur einen Konflikt. |
| Zusammenführen | Konflikt-Check meldet Überschneidungen mit `claude/b-regeln-h12` (`haushalt/fr.json` hb.hw.tarif neben hb.hw.tarif.d), `claude/b-ux-ergebnis` (`fr.json` eo.a.t) und `claude/b-ux-mappe` (`fr.json`, `ru.json` f.alg1.meldung neben f.stichtag). Kein Konflikt mit `main` und `claude/test-update-naechstes`. Auflösung: jeweils beide Änderungen übernehmen. |
| fr: Suchwörter (`suche/woerter/fr.json`, z. B. „chômeur“) und Aussagen über Dritte („un colocataire non exonéré“) | Bewusst männlich gelassen: Suchwörter müssen zu Eingaben passen. |
