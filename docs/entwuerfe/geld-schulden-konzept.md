# SoLo – Konzept „Geld und Schulden“ (nächstes Update nach 1.7.0)

Stand: 20.11.2026 · Nur Konzept. Kein App-Code geändert, nichts gepusht.
Grundlage: Test-Zweig `claude/test-naechstes-update` (Worktree `/home/claude/wt-test`, Commit 077e083), Web-Build angesehen bei 390×844 (7 Fotos in `/tmp/gsfoto/`), Vorschlag `/home/claude/schuldnerberatung-vorschlag.md` (Quellen [Q1]–[Q13] dort).

---

## (a) Bestandsaufnahme – was es heute gibt

Startseite → Kachel **„Geld und Schulden“** („Schulden, Pfändung, Haushaltsplan, Spartipps und kostenlose Hilfe.“) → Ansicht `sparen` mit 6 Kacheln (`GS_KACHELN` in `src/app.js`):

| # | Kachel | Untertitel | Was darunter liegt | Code / Texte |
|---|---|---|---|---|
| 1 | Es ist dringend | Konto gepfändet, Sperre, Mahnbescheid, Kündigung | 4 Fall-Kacheln (Konto, Strom/Gas, Mahnbescheid, Wohnung). Je Fall: Kasten „Frist“, Kasten „Erster Schritt“, 1 Aufklapp-Tipp, Knopf „Kostenlose Hilfe“, Quellen. Nur bei Konto: Knopf zum Pfändungsrechner. | `GS_DRINGEND`, `spRender`; `gs.d.*`, `sp.schulden.<fall>` |
| 2 | Was bleibt mir? | Pfändung vom Lohn oder Konto ausrechnen. Etwa 2 Minuten. | Eigene Ansicht `pfaendung`: Wahl Lohn/Konto → Zahl der Unterhaltsberechtigten (0–5+) → Netto → Ergebnis; P-Konto-Freibetrag mit Kindergeld; „Das tust du jetzt“; Tipps zum Aufklappen (§§ 850a–850k, 899, 903, 904, 906 ZPO); Verweis „Kostenlose Hilfe“. | `pfRender`, `Rules.pfaendung`; `pf.*` |
| 3 | Meine Schulden-Liste | Alle Schulden auf einen Blick, das Dringende zuerst | Eigene Ansicht `schulden`: Eintrag je Gläubiger (Art aus 12, Betrag Anfang/jetzt, Stand vom, Rate, fällig, Status aus 10, Zustelldatum, Aktenzeichen, Anschrift, Notiz). **Sortiert schon nach Dringlichkeit** (Frist läuft / Dringend / Stufe 1–3) mit „Warum?“ je Art. Fristrechnung Mahn-/Vollstreckungsbescheid. Summen, Abgleich mit Haushaltsplan (Raten zu hoch?). Aufklapper: „Was ist zuerst wichtig?“, „Schuldnerberatung finden“ (5 Absätze), „Bitte mitbringen“ (8 Punkte). Druckblatt „Gläubigerliste für die Schuldnerberatung“ (deutsch, wahlweise mit Haushaltsplan), CSV. Knöpfe zu Haushaltsplan und Pfändungsrechner. Fristen erscheinen in „Mein Ordner“. | `src/schulden.js`; `src/lang/schulden/` (`sl.*`) |
| 4 | Mein Geld planen | Was kommt rein, was geht raus? Plan, Ausgaben und Kassenzettel | Eigene Ansicht `haushalt` mit 3 Reitern: Plan (Einnahmen, 9 Ausgabenbereiche, Rest/Fehlbetrag), Ausgaben (Haushaltsbuch, Kassenzettel-Scan, wiederkehrend), Auswertung (Vergleich Regelbedarf, Belegliste Steuer/Pflegekasse). Energiekosten-Check (Abschlag, Nachzahlung, Brief an Versorger). Hinweise: „Es bleibt wenig übrig → Leistungs-Check“, Mehrbedarfe, Weiterbewilligung, Vermögensgrenzen, Schulden. Übernahme in den Leistungs-Check. Druck/CSV. | `src/haushalt.js`; `src/lang/haushalt/` (`hb.*`) |
| 5 | Geld sparen im Alltag | Strom, Heizen, günstig kochen, Verträge und Sozialtarife. | 4 Themen-Kacheln, je 5–6 Tipps (Symbol + kurzer Satz, Rest aufklappbar); bei Essen Linkkarte Verbraucherzentrale. | `SP_THEMEN`, `SP_TIPPS`; `sp.*` |
| 6 | Kostenlose Hilfe | Schuldnerberatung, erste Schritte, Inkasso, Privatinsolvenz | Eine lange Seite: Kasten „Schuldnerberatung finden“ (1 Tipp), „Erste Schritte“ (3 Tipps), „Was tun, wenn …“ (Inkasso, Rate, unseriöse Anbieter, Privatinsolvenz). | `spRender` Bereich `hilfe`; `sp.schulden.*` |

Weitere vorhandene Bausteine, die das Konzept nutzt:
- **Brief prüfen / Widerspruch** (Ansicht `briefe`, Startkachel „Ich habe einen Brief bekommen“) – für Bescheide, nicht für Inkasso.
- **Text-Vorlagen im Haushaltsplan** (`aenderungsBrief`, `abschlagBrief` in `src/haushalt.js`): editierbares Textfeld, „Drucken oder teilen“ über `ctx.textAusgeben`. Das ist das Muster für die neuen Musterschreiben.
- **Fristen-Übersicht** in „Mein Ordner“ (`src/fristen.js`), nimmt Fristen der Schulden-Liste auf.
- **Vorgänge** (mehrere Haushalte, PIN, automatisches Löschen; `src/vorgaenge.js`) – Schulden-Liste und Haushaltsplan sind je Vorgang gespeichert.
- **Beratungsmodus** (Einstellungen): zeigt Paragrafen in Texten und Rechtsgrundlagen bei Leistungskarten; in der Schulden-Liste nur die Kontrollzeile der Summen. Sonst kein Unterschied.

### Wie ein Laie in Not es heute erlebt
- Erste Ebene ist klar und ruhig (6 gleiche Kacheln). Wer seinen Fall unter „Es ist dringend“ findet, bekommt in 2 Tipps Frist und ersten Schritt – das ist gut.
- Wer **mehrere** Probleme hat oder nicht weiß, was zuerst kommt, muss selbst wählen. Es gibt keine Führung.
- Wer einen **Inkasso-Brief** hat, findet ihn nicht unter „dringend“ und nicht als Kachel, sondern als 5. Aufklapp-Zeile unter „Kostenlose Hilfe“.
- Die **Schulden-Liste** kann viel (Reihenfolge, Fristen, Druckblatt), aber die wichtigsten Hilfen stehen zugeklappt am Seitenende. Eine leere Liste zeigt nur einen Knopf und drei zugeklappte Zeilen.
- Von der Schulden-Liste gibt es **keinen Weg zu einem Schreiben** an den Gläubiger.
- „Kostenlose Hilfe“ endet mit „geh zur Schuldnerberatung“. Was man in der **Wartezeit** tun kann, steht nirgends zusammen.

---

## (b) Probleme heute

| # | Problem | Folge für den Nutzer |
|---|---|---|
| 1 | Kein geführter Einstieg („Was ist zuerst dran?“) | Wer mehrere Sorgen hat, fängt beim Falschen an (z. B. Inkasso statt Miete). |
| 2 | „Es ist dringend“ kennt nur 4 Fälle | Es fehlen: Geldstrafe/Haft droht, kein Geld für Essen, Gerichtsvollzieher/Vermögensauskunft, Inkasso-Brief mit „letzter Frist“. Texte zu Geldstrafe gibt es schon (`sl.warum.geldstrafe`), nur an anderer Stelle. |
| 3 | Inkasso, Raten, Insolvenz, unseriöse Anbieter liegen unter „Kostenlose Hilfe“ | Der Titel verrät nicht, dass dort „Was tun bei Inkasso“ steht. Häufigster Anlass (Inkasso-Brief) ist am schlechtesten zu finden. |
| 4 | Dasselbe an 3–4 Stellen | „Schuldnerberatung finden“: `sp.schulden.4`, `sl.hilfe.1–5`, `pf.tipp.beratung`, `hb.hw.schulden`. „Zuerst Miete, Strom …“: `sp.schulden.2`, `sl.prio.lead`, `sl.stufe.*`. „Mitbringen“: nur in der Schulden-Liste. Pflege und Übersetzung werden teuer, Aussagen können auseinanderlaufen. |
| 5 | Zahl-Reihenfolge ist da, aber unsichtbar, solange die Liste leer ist | Der wichtigste Rat der Schuldnerberatung kommt erst nach dem Eintragen. |
| 6 | Unterlagen-Liste und Druckblatt sind versteckt (Aufklapper / Knopf am Seitenende der Schulden-Liste) | Die „Beratungsmappe“ gibt es zu 70 %, aber niemand findet sie. Haken (abhaken, was schon da ist) fehlen. |
| 7 | Keine Schreiben an Gläubiger | Nutzer weiß, *dass* er um Geduld bitten oder eine Forderungsaufstellung verlangen soll, aber nicht *wie*. |
| 8 | „Geld sparen im Alltag“ belegt eine der 6 Kacheln | Für Menschen in der Krise der schwächste Punkt; gehört fachlich zur Budgetberatung (Schritt 4) und Prävention. |
| 9 | Zwei Namen für dieselbe Sache | Kachel „Mein Geld planen“, Seite „Haushaltsplan und Haushaltsbuch“; Kachel „Was bleibt mir?“, Seite „Pfändung: Was bleibt dir?“. |
| 10 | Haushaltsplan → Leistungs-Check ist da (`hb.hw.knapp`), aber nur als Hinweis unter vielen | Die Brücke „es fehlt Geld → steht mir etwas zu?“ (Existenzsicherung durch mehr Einkommen) ist nicht prominent. |
| 11 | Beratungsmodus ändert im Schuldenbereich fast nichts | Für Berater kein Mehrwert gegenüber dem Privatmodus (siehe g). |

Technische Randnotiz: Der Web-Build meldet 5220 KB. Entscheidung laut STATUS.md: Größengrenze der App-Datei 5 MB. Neue Texte in 13 Sprachen kosten Platz; bitte vor dem Bau klären, worauf sich die Grenze bezieht (siehe Umsetzungsliste U0).

---

## (c) Neue Struktur

Leitgedanke: Die Reihenfolge der Kacheln folgt dem Ablauf der Schuldnerberatung – **erst sichern, dann ordnen, dann antworten, dann planen, dann Hilfe**. Jede Kachel beantwortet eine Frage, die der Nutzer selbst so stellen würde.

### Baum

```
Geld und Schulden                                   (Startkachel, unverändert)
│
├─ 1  Es ist dringend                               [Warndreieck]
│     ├─ Was ist zuerst dran? (Krisen-Check, 7 Fragen)        NEU (D)
│     │     └─ Ergebnis: 1–3 Schritte in Reihenfolge → springt in die Fälle unten
│     ├─ Mein Konto ist gepfändet            → Knopf „Ausrechnen, was dir bleibt“ (Kachel 2)
│     ├─ Strom- oder Gassperre droht         → Knopf „Abschlag prüfen“ (Energiekosten-Check)
│     ├─ Mahnbescheid vom Gericht            → Knopf „In die Schulden-Liste eintragen (Frist merken)“
│     ├─ Wohnung gekündigt oder Mietschulden
│     ├─ Geldstrafe: Haft droht                               NEU (Text aus sl.warum.geldstrafe)
│     └─ Kein Geld für Essen                                  NEU (nur mit geprüfter Quelle, sonst weglassen)
│
├─ 2  Was bleibt mir?                               [Konto mit Pfeil]   (Pfändung, P-Konto)
│     ├─ Mein Lohn wird gepfändet  → Rechner
│     ├─ Mein Konto ist gepfändet  → Rechner P-Konto
│     └─ Bescheinigung für das P-Konto anfordern (Musterschreiben 4)   NEU (C4)
│
├─ 3  Meine Schulden-Liste                          [Liste]
│     ├─ Oben immer sichtbar: „Was zahle ich zuerst?“ (3 Zeilen, auch bei leerer Liste)   UMGESTELLT (A)
│     ├─ Einträge nach Dringlichkeit (wie heute)
│     │     └─ je Eintrag: „Brief prüfen“ (Prüfliste E) · „Schreiben“ (Muster 1–3, Anschrift aus dem Eintrag)   NEU
│     ├─ Abgleich mit Haushaltsplan (wie heute)
│     └─ Knopf „Für die Beratung drucken“ → Beratungsmappe (Kachel 6)
│
├─ 4  Post vom Inkasso                              [Brief mit Lupe]    NEU als Kachel
│     ├─ Stimmt der Brief? (Prüfliste, 6 Haken)                NEU (E)
│     ├─ Schreiben an Gläubiger (3 Muster)                     NEU (C1–C3)
│     │     ├─ Bitte um Geduld – ich bereite eine Schuldnerberatung vor
│     │     ├─ Bitte um Forderungsaufstellung (§ 13a RDG)
│     │     └─ Widerspruch: Forderung unbekannt oder schon bezahlt
│     ├─ Raten anbieten – worauf achten?            (verschoben aus „Kostenlose Hilfe“: sp.schulden.rate)
│     └─ Gelber Umschlag vom Gericht?  → springt zu 1 › Mahnbescheid
│
├─ 5  Mein Geld planen                              [Geldbörse]
│     ├─ Haushaltsplan (Plan · Ausgaben · Auswertung, wie heute)
│     │     └─ Bei Fehlbetrag oben: Karte „Steht dir Geld zu? Leistungs-Check“   HERVORGEHOBEN (K)
│     ├─ Abschlag prüfen (Energiekosten-Check, wie heute; zusätzlich direkt erreichbar)
│     └─ Geld sparen im Alltag (Strom · Heizen · Essen · Verträge)      VERSCHOBEN (bisher eigene Kachel)
│
└─ 6  Schuldnerberatung                             [Person mit Sprechblase]   UMBENANNT (bisher „Kostenlose Hilfe“)
      ├─ Beratungsstelle finden                     (ein Text statt vier: sl.hilfe.1–5)
      ├─ Bis zum Termin: Wartezeit überbrücken (6 Schritte zum Abhaken)   NEU (H)
      ├─ Beratungsmappe (Unterlagen abhaken + Gläubigerliste + Haushaltsplan drucken)   NEU/UMGESTELLT (B)
      ├─ So läuft eine Schuldnerberatung ab · Privatinsolvenz   (sp.schulden.insolvenz, kurz)
      └─ Vorsicht: unseriöse Anbieter               (sp.schulden.unserioes)
```

### Tabelle: erste Ebene

| # | Titel | Untertitel (kurz) | Symbol-Idee | Inhalt in einem Satz | Änderung |
|---|---|---|---|---|---|
| 1 | Es ist dringend | Kurz-Check: Was ist zuerst dran? | Warndreieck (bleibt) | Geführter Check und 4–6 Notfälle mit Frist und erstem Schritt. | erweitert |
| 2 | Was bleibt mir? | Pfändung und P-Konto. Etwa 2 Minuten. | Konto mit Schutz-Pfeil (bleibt) | Rechnet aus, was bei Lohn- oder Kontopfändung geschützt ist, und hilft zur Bescheinigung. | + Muster 4 |
| 3 | Meine Schulden-Liste | Was zahle ich zuerst? | Liste (bleibt) | Alle Schulden an einem Ort, sortiert nach dem, was Wohnung, Strom und Freiheit sichert. | Reihenfolge sichtbar, Aktionen je Gläubiger |
| 4 | Post vom Inkasso | Brief prüfen und antworten | Brief mit Lupe | Prüfliste für den Inkasso-Brief und fertige Schreiben zum Ausfüllen. | neu |
| 5 | Mein Geld planen | Haushaltsplan, Abschlag, Spartipps | Geldbörse (bleibt) | Einnahmen und Ausgaben ordnen, Fehlbetrag erkennen, Leistungen prüfen, sparen. | nimmt „Sparen“ auf |
| 6 | Schuldnerberatung | Finden, vorbereiten, Wartezeit nutzen | Person mit Sprechblase | Beratungsstelle finden, Mappe für den Termin packen und wissen, was bis dahin zu tun ist. | umbenannt, neu gefüllt |

Bleibt bei 6 Kacheln. „Geld sparen im Alltag“ entfällt als eigene Kachel und liegt unter 5.

### Tabelle: zweite Ebene (weiße Unterkarten in Startkachel-Form, oben „← Zurück“)

| Unter | Titel | Untertitel | Symbol | Inhalt in einem Satz | Neu? |
|---|---|---|---|---|---|
| 1 | Was ist zuerst dran? | 7 Fragen, etwa 1 Minute | Kompass / Wegweiser | Ja/Nein-Fragen, Ergebnis ist eine nummerierte Liste mit 1–3 Schritten, die in die Fälle springen. | D |
| 1 | Mein Konto ist gepfändet | Frist: 1 Monat | Bank | wie heute | – |
| 1 | Strom- oder Gassperre droht | 4 Wochen / 8 Werktage | Blitz | wie heute + Knopf Energiekosten-Check | Verknüpfung |
| 1 | Mahnbescheid vom Gericht | Frist: 2 Wochen | Umschlag | wie heute + Knopf „Frist in die Schulden-Liste“ | Verknüpfung |
| 1 | Wohnung gekündigt oder Mietschulden | Frist: 2 Monate | Haus | wie heute | – |
| 1 | Geldstrafe: Haft droht | Früh Raten beantragen | Waage | Ersatzfreiheitsstrafe, Raten bei der Staatsanwaltschaft, gemeinnützige Arbeit. | Text vorhanden, neuer Ort; Quelle ergänzen |
| 2 | Bescheinigung für das P-Konto | Schreiben zum Ausfüllen | Beleg | Bitte an Familienkasse, Jobcenter, Arbeitgeber oder Beratungsstelle um die Bescheinigung nach § 903 ZPO. | C4 |
| 3 | (Kopfkarte) Was zahle ich zuerst? | Miete, Strom, Unterhalt, Geldstrafe – dann der Rest | Treppe 1-2-3 | Drei Zeilen fest sichtbar, „Warum?“ zum Aufklappen. | A sichtbar machen |
| 4 | Stimmt der Brief? | 6 Punkte zum Abhaken | Lupe | Pflichtangaben nach § 13a RDG abhaken; fehlt etwas, Knopf zum Schreiben „Forderungsaufstellung“. | E |
| 4 | Schreiben an Gläubiger | 3 Muster zum Ausfüllen | Stift auf Blatt | Nutzer wählt Gläubiger aus der Schulden-Liste oder tippt selbst; Text bleibt änderbar. | C1–C3 |
| 4 | Raten anbieten | Erst rechnen, dann zusagen | Kalender | Vorhandener Tipp + Zahl „frei vor Raten“ aus dem Haushaltsplan. | verschoben |
| 5 | Haushaltsplan | Was kommt rein, was geht raus? | Geldbörse | wie heute | – |
| 5 | Abschlag prüfen | Droht eine Nachzahlung? | Blitz mit Uhr | Energiekosten-Check direkt erreichbar. | Abkürzung |
| 5 | Geld sparen im Alltag | Strom, Heizen, Essen, Verträge | Sparschwein | wie heute, eine Ebene tiefer | verschoben |
| 6 | Beratungsstelle finden | Kostenlos, in deiner Nähe | Stecknadel | Suche auf meine-schulden.de, Jobcenter/Sozialamt, Warnung vor Vorkasse. | zusammengelegt |
| 6 | Bis zum Termin | 6 Dinge, die du jetzt tun kannst | Sanduhr | Abhak-Liste: Geduld-Brief, P-Konto, Post sammeln, Schulden-Liste, Haushaltsplan, keine neuen Kredite/Zusagen. | H |
| 6 | Beratungsmappe | Alles für den Termin | Ordner | Unterlagen abhaken, Ordner-Anleitung, ein Knopf „Mappe drucken“ (Gläubigerliste + Haushaltsplan + Unterlagenliste). | B |
| 6 | Ablauf und Privatinsolvenz | In einfachen Schritten | Weg mit Punkten | 5 kurze Zeilen zum Ablauf, Privatinsolvenz zum Aufklappen. | gekürzt, verschoben |
| 6 | Vorsicht: unseriöse Anbieter | Geld im Voraus? Finger weg | Warndreieck | vorhandener Tipp | verschoben |

### Verknüpfungen (jede Karte endet mit genau einem „Nächster Schritt“-Knopf)

| Von | Nach | Auslöser |
|---|---|---|
| Krisen-Check Ergebnis | Fall unter „Es ist dringend“ / Pfändungsrechner / Schulden-Liste / Leistungs-Check | je Antwort „Ja“ |
| Krisen-Check: alles „Nein“ | Schulden-Liste („Dann verschaff dir zuerst einen Überblick“) | – |
| Es ist dringend › Konto | Was bleibt mir? → Bescheinigung P-Konto | Knopf |
| Es ist dringend › Mahnbescheid | Schulden-Liste, neuer Eintrag mit Status „Mahnbescheid“ vorbelegt | Knopf |
| Es ist dringend › Strom | Energiekosten-Check | Knopf |
| Schulden-Liste › Eintrag | Prüfliste „Stimmt der Brief?“ (nur bei Status Inkasso) · Schreiben (Gläubiger, Aktenzeichen, Anschrift vorbelegt) | Knöpfe im Eintrag |
| Schulden-Liste | Beratungsmappe | Knopf „Für die Beratung drucken“ |
| Schulden-Liste | Haushaltsplan (wie heute) | Abgleich Raten |
| Prüfliste: Angabe fehlt | Schreiben „Forderungsaufstellung“ | Knopf |
| Haushaltsplan: Fehlbetrag oder knapp | Leistungs-Check (Angaben werden übernommen, wie heute) | Karte oben statt Hinweis unten |
| Haushaltsplan: Zeile „Raten und Schulden“ > 0 | Schulden-Liste | Hinweis (vorhanden, Ziel ändern) |
| Wartezeit-Karte | Geduld-Brief, P-Konto, Schulden-Liste, Haushaltsplan | je Zeile ein Sprung; Haken setzen sich teils von selbst (Liste hat Einträge, Plan ist ausgefüllt) |
| Beratungsmappe | Mein Ordner | erscheint dort als Eintrag wie die Schulden-Liste |

### Der Krisen-Check im Detail (D)

Eine Frage pro Bildschirm, große Ja/Nein-Knöpfe, überspringbar. Die Reihenfolge der Fragen ist zugleich die Reihenfolge im Ergebnis.

| # | Frage | Bei „Ja“ → |
|---|---|---|
| 1 | Hast du Post vom Gericht im gelben Umschlag? | Mahnbescheid (Frist 2 Wochen) |
| 2 | Droht dir Haft wegen einer Geldstrafe? | Geldstrafe |
| 3 | Ist dir die Wohnung gekündigt oder schuldest du Miete? | Miete |
| 4 | Ist eine Strom- oder Gassperre angedroht? | Strom/Gas |
| 5 | Ist dein Konto gesperrt oder gepfändet? | Konto → Was bleibt mir? |
| 6 | Reicht das Geld diese Woche nicht für Essen? | Leistungs-Check + (falls Quelle geprüft) Fall „Kein Geld für Essen“ |
| 7 | Bekommst du Briefe von Inkasso oder Anwalt? | Post vom Inkasso |

Ergebnis: „Das ist zuerst dran“ – höchstens 3 nummerierte Karten, der Rest unter „Danach“. Immer am Ende: „Schuldnerberatung finden“. Kein Urteil über den Einzelfall, nur Reihenfolge (Existenzsicherung zuerst, [Q1] S. 11–12).

### Regeln (für alle neuen Seiten)

- Weiße Unterkarten in Startkachel-Form (`skKachel`, Klasse `uk-karte`), einheitliches „← Zurück“ oben aus `src/navigation.js`, eine Ebene je Tipp.
- Je Zeile Symbol + ein kurzer Satz (`tippEl` mit `.kurz`), Rest zum Aufklappen. Fristen und Beträge stehen im kurzen Satz, nicht im Aufklapper.
- RDG: nur allgemeine Information, Checklisten und Vorlagen, die der Nutzer selbst ausfüllt. Kein „Diese Forderung ist verjährt/unberechtigt“. Ergebnis immer „möglich – lass es prüfen“. Unter jedem Muster: „Allgemeines Muster, keine Rechtsberatung. Bei Post vom Gericht läuft eine Frist: sofort Beratung.“
- Gläubiger-Anschrift nie vorschlagen, nur aus dem Eintrag des Nutzers. Fehlt sie: Platzhalter-Zeile und Hinweis.
- Nur geltendes Recht, jede Frist/Zahl mit Paragraf und Abrufdatum in `docs/PRUEFLISTE.md` und Faktenblatt.
- Zurückgestellt bleiben F (Verjährungs-Rechner) und G (Inkassokosten-Beträge).

---

## (d) Nutzerwege

| Persona | Schritte |
|---|---|
| **Alleinerziehende, Konto gepfändet** | 1. Geld und Schulden → „Es ist dringend“ → Krisen-Check: Ja bei „Konto gesperrt“. 2. Karte „Konto“: Frist 1 Monat, P-Konto heute umwandeln. 3. „Ausrechnen, was dir bleibt“: 1 Kind, Kindergeld → geschützter Betrag. 4. „Bescheinigung für das P-Konto“ → Schreiben an die Familienkasse drucken. 5. Hinweis „Steht dir Geld zu?“ → Leistungs-Check (Unterhaltsvorschuss, Wohngeld, Kinderzuschlag). |
| **Rentner, Stromsperre angedroht** | 1. „Es ist dringend“ → „Strom- oder Gassperre droht“. 2. Frist (4 Wochen / 8 Werktage) und erster Schritt: Versorger anrufen, Raten verlangen. 3. „Abschlag prüfen“ → Energiekosten-Check zeigt passenden Abschlag, Brief an Versorger. 4. Hinweis Darlehen vom Sozialamt (vorhandener Text) → Leistungs-Check Grundsicherung im Alter. 5. Später: „Mein Geld planen“ › Spartipps Strom, Stromspar-Check. |
| **Junger Mensch, Inkasso-Briefe** | 1. Kachel „Post vom Inkasso“. 2. „Stimmt der Brief?“ – 6 Haken; Auftraggeber und Vertragsdatum fehlen. 3. Knopf → Schreiben „Bitte um Forderungsaufstellung“, Firma aus dem Brief eintragen, drucken. 4. „In die Schulden-Liste eintragen“ → Liste zeigt: Inkasso steht in Stufe 3, „kann meist warten, bis du beraten wurdest“; Warnung „nichts unterschreiben, keine Rate zusagen“. 5. Kommt ein gelber Umschlag: Sprung zu Mahnbescheid mit Frist. |
| **Familie, die „nie hinkommt“** | 1. Kachel „Mein Geld planen“ → Haushaltsplan (5 Minuten). 2. Ergebnis „Im Monat fehlen etwa … €“ → Karte oben „Steht dir Geld zu?“ → Leistungs-Check mit übernommenen Angaben (Wohngeld, Kinderzuschlag, Bildung und Teilhabe). 3. Zurück im Plan: „Abschlag prüfen“. 4. „Geld sparen im Alltag“ für die größten Posten. 5. Stehen Raten im Plan: Hinweis → Schulden-Liste. |
| **Wartet auf Schuldnerberatung** | 1. Kachel „Schuldnerberatung“ → „Bis zum Termin“. 2. Haken 1: Geduld-Brief an jeden Gläubiger (Muster, Anschrift aus der Liste). 3. Haken 2–4: P-Konto, Post sortieren (Ordner-Anleitung), Schulden-Liste füllen – zuerst zahlen, was oben steht. 4. Haken 5: Haushaltsplan. 5. „Beratungsmappe“ → Unterlagen abhaken → „Mappe drucken“ und zum Termin mitnehmen. |

---

## (e) Umsetzungsliste für Bau-Agenten

Reihenfolge so, dass parallele Agenten sich wenig in die Quere kommen. `src/app.js` und `src/lang/de.json` sind Konfliktdateien: dort nur U1 strukturell, alle anderen klein.

| Nr | Aufgabe | Dateien | Tests | Quellen |
|---|---|---|---|---|
| U0 | Größengrenze klären (Web-Build 5220 KB, Grenze 5 MB): worauf bezieht sie sich, wie viel Platz haben neue Texte × 13 Sprachen? | `scripts/build.js`, STATUS.md (nur lesen) | – | STATUS.md Entscheidung 20.11.2026 |
| U1 | **Struktur der Seite**: `GS_KACHELN` neu (Reihenfolge, „Post vom Inkasso“, „Schuldnerberatung“ statt „Kostenlose Hilfe“, „Sparen“ unter „Mein Geld planen“); Zwischenseite für Kachel 5 und 6 mit Unterkarten; `spEbeneZurueck`, `gsSprung`, Deep-Link `sparen-…` (Zeile ~2904) und Farben „gruppe geld“ anpassen; alte Sprünge (`gs-zur-hilfe`, `pf-zur-hilfe`, `hb.hw.schulden`) auf neue Ziele | `src/app.js`, `src/template.html` (CSS), `src/lang/de.json` + alle `src/lang/*.json`, `src/lang/einfach/` | `test/test-navigation.js`, `test/dom-test.js`, `test/test-infotexte-dom.js`, `test/e2e-klein.js`, `tools/store-bilder.js` prüfen | – |
| U2 | **Krisen-Check** (D): eigenes kleines Modul mit reiner Funktion `ergebnis(antworten)` → sortierte Liste; Oberfläche als erste Karte unter „Es ist dringend“; neuer Fall „Geldstrafe“ (Text aus `sl.warum.geldstrafe` übernehmen, nicht doppeln) | neu `src/krisencheck.js`, `src/lang/schulden/*.json` (Schlüssel `kc.*`), Einhängen in `src/app.js`, `scripts/build.js` | neu `test/test-krisencheck.js` (alle 128 Kombinationen: Reihenfolge fest, höchstens 3 „zuerst“), `test/test-krisencheck-dom.js` | [Q1] S. 11–12; Geldstrafe: § 43 StGB, § 459a StPO, Art. 293 EGStGB (am amtlichen Text prüfen, Abrufdatum) |
| U3 | **Schulden-Liste** (A sichtbar): Kopfkarte „Was zahle ich zuerst?“ immer oben (auch leer); je Eintrag Knöpfe „Brief prüfen“ (nur Status Inkasso/Mahnung) und „Schreiben“; Knopf „Für die Beratung drucken“ → Mappe; Aufklapper „Schuldnerberatung finden“ und „Bitte mitbringen“ durch einen Sprung zu Kachel 6 ersetzen (Texte ziehen um, Schlüssel bleiben) | `src/schulden.js`, `src/lang/schulden/*.json` | `test/test-schulden.js`, `test/test-schulden-dom.js` | [Q3], [Q1] S. 12 (vorhanden) |
| U4 | **Musterschreiben** (C1–C4): Vorlagen als Textbausteine mit Feldern {gläubiger}, {anschrift}, {aktenzeichen}, {datum}; Ausgabe über vorhandenes `ctx.textAusgeben` (wie `abschlagBrief`); immer Deutsch, bei anderer App-Sprache Erklärung in der App-Sprache darüber; Pflicht-Hinweis unter jedem Muster; kein Versand, nur Drucken/Teilen | neu `src/schreiben.js`, neu `src/lang/schreiben/de.json` (+ Erklärtexte in allen Sprachen), Einhängen `src/app.js`, `src/schulden.js` | neu `test/test-schreiben.js` (kein Platzhalter bleibt stehen; ohne Anschrift keine erfundene; Hinweis vorhanden; Text enthält keine Einzelfall-Wertung), `test/test-sicherheit.js` (Eingaben nur als Text) | C1: [Q3]; C2: § 13a Abs. 1–2 RDG [Q7]; C3: Musterbrief VZ [Q5] (eigene Worte, nicht kopieren); C4: § 903 ZPO [Q9] |
| U5 | **Prüfliste „Stimmt der Brief?“** (E): 6 Haken nach § 13a Abs. 1 RDG; Ergebnis nur „Diese Angaben fehlen in deinem Brief“ + Knopf zu C2; 3 feste Warnzeilen (nichts unterschreiben, Raten kosten oft extra, gelber Umschlag = Frist) | `src/schreiben.js` oder eigenes `src/pruefliste-inkasso.js`, `src/lang/schulden/*.json` (`ip.*`) | neu `test/test-inkasso-pruefliste-dom.js` | § 13a RDG [Q7] – **Wortlaut der Nummern beim Bau neu abrufen**, Liste 1:1 am Gesetz ausrichten |
| U6 | **Kachel 6 „Schuldnerberatung“**: „Beratungsstelle finden“ (ein Text, `sl.hilfe.1–5` als Quelle, `sp.schulden.4` und `pf.tipp.beratung` verweisen nur noch), „Bis zum Termin“ (H, Haken gespeichert je Vorgang), „Beratungsmappe“ (B: `sl.u.1–8` als Haken + Ordner-Anleitung + ein Druck aus `blattSeite` + `planText`), Ablauf/Insolvenz, unseriös | `src/app.js` (klein), `src/schulden.js` (Druck), `src/haushalt.js` (nur Export nutzen), `src/vorgaenge.js` (neuer Datenschlüssel `lotse.beratung-haken` in `DATEN`), `src/lang/schulden/*.json` | `test/test-vorgaenge.js` (neuer Schlüssel wird je Vorgang gesichert/gelöscht), `test/test-schulden-dom.js`, `test/e2e-pdf.js` (Druck) | [Q3], [Q4], [Q13]; Insolvenz: §§ 287, 305 InsO [Q8] |
| U7 | **Brücke Haushaltsplan → Leistungs-Check** (K): bei Fehlbetrag/knapp Karte direkt unter dem Ergebnis statt in der Hinweisliste; Sprung „Raten“ → Schulden-Liste; Titel angleichen („Mein Geld planen“ überall) | `src/haushalt.js`, `src/lang/haushalt/*.json` | `test/test-haushalt-dom.js`, `test/test-haushalt-geld-dom.js` | [Q1] S. 12 |
| U8 | **Beratungsmodus im Schuldenbereich** (Stufe 1 aus g): Tabellenansicht der Gläubigerliste, alle Felder offen, Paragrafen/Rechenweg sichtbar, Pfändung auf einer Seite, Notiz mitdrucken vorbelegt | `src/schulden.js`, `src/app.js` (`pfRender`), `src/lang/de.json` (Berater-Texte nur Deutsch) | `test/test-beratung.js` (neu: **im Privatmodus kein einziges zusätzliches Element** – DOM-Vergleich vor/nach U8) | wie vorhanden |
| U9 | **Doku und Prüfung**: `docs/PRUEFLISTE.md`, Faktenblatt, `docs/QUELLEN.md`, `docs/AENDERUNGEN.md`; Einfache Sprache; unabhängige Inhaltsprüfung (Fable) aller neuen Texte auf RDG-Grenze; Fotos 390×844 je neuer Seite | `docs/*`, `src/lang/einfach/schulden*.json` | `test/test-pruefliste.js`, `test/test-einfach-vollstaendig.js`, `test/test-sprachen-zahlen.js`, `npm test`, `npm run test:erweiterungen` | alle oben |

Parallelisierung: U1 zuerst (allein). Danach parallel U2 · U3+U6 (beide `schulden.js`, ein Agent) · U4+U5 · U7. U8 und U9 zum Schluss.
Sprachen: neue Bedientexte in allen 13 Sprachen + Einfache Sprache; Musterschreiben und Druckblätter nur Deutsch (wie Antragsmappe).

---

## (f) Offene Fragen an David

1. **Krisen-Check als Einstieg:** Soll er die erste Karte *in* „Es ist dringend“ sein (Empfehlung, 6 Kacheln bleiben ruhig) oder als breite Karte *über* den 6 Kacheln stehen (auffälliger, aber ein 7. Element)?
2. **„Geld sparen im Alltag“ eine Ebene tiefer** (unter „Mein Geld planen“), damit „Post vom Inkasso“ eine eigene Kachel bekommt – einverstanden? Alternative: Sparen bleibt, Inkasso wandert unter „Meine Schulden-Liste“.
3. **Beratungsmodus:** Reicht fürs nächste Update Stufe 1 (andere Ansicht derselben Daten, siehe g), und das Gläubiger- und Forderungsverzeichnis im Format des amtlichen Insolvenz-Vordrucks kommt später nach Fachprüfung?

---

## (g) Persona Schuldnerberater/in und Sozialberatung – Beratungsmodus

### Kann ein Berater heute damit arbeiten?

Teilweise. SoLo ist für die **Vorarbeit mit dem Klienten** und für **Sozialberatung ohne Fachsoftware** brauchbar, nicht als Fallakte.

| Was es heute gibt | Nutzen für Berater | Grenze |
|---|---|---|
| Mehrere Vorgänge je Gerät, PIN-Verschlüsselung (AES-GCM), automatisches Löschen | Mehrere Klienten offline auf einem Tablet, z. B. in der aufsuchenden Arbeit | Name höchstens 24 Zeichen, kein schneller Wechsel aus dem Schuldenbereich, keine Weitergabe eines einzelnen Vorgangs |
| Schulden-Liste mit Art, Beträgen, Status, Zustelldatum, Aktenzeichen, Anschrift, Notiz | Deckt die Kernfelder einer Gläubigerliste ab | Kein Feld für ursprünglichen Gläubiger/Vertreter getrennt, Hauptforderung/Zinsen/Kosten nicht getrennt, kein Titel-Datum; Eingabe nur als Formular je Eintrag |
| Druckblatt „Gläubigerliste“ + Haushaltsplan, CSV | Klient bringt geordnete Unterlagen mit; CSV lässt sich in Tabellen öffnen | Kein Format, das eine Fachsoftware einliest; nicht das amtliche Verzeichnis |
| Pfändungsrechner mit Unterhaltspflichten 0–5+, P-Konto mit Kindergeld | Schnelle Auskunft im Gespräch | Frage für Frage statt eine Maske; kein Tabellenauszug; § 850d/850f nur als Hinweis |
| Fristrechnung Mahn-/Vollstreckungsbescheid, Fristen in „Mein Ordner“ | Überblick über laufende Fristen je Klient | Nur zwei Fristarten; keine Übersicht über alle Klienten |
| Beratungsmodus: Paragrafen in Texten, Rechtsgrundlagen im Leistungs-Check | Nachvollziehbarkeit, Zitierbarkeit | Im Schuldenbereich fast wirkungslos (nur Kontrollzeile) |
| Leistungs-Check, Brief prüfen, Antragsmappe | Existenzsicherung (Schritt 2) in einem Werkzeug – das ist die Stärke gegenüber reinen Schulden-Programmen | – |

### Abgrenzung

- SoLo bleibt offline und ohne Server. Es ersetzt **keine Fallsoftware** und keine Aktenführung der Stelle (Statistik, Serienbriefe, Dokumentation, Aufbewahrung).
- Gängige Fachprogramme, soweit belegt: **CAWIN** (iff – institut für finanzdienstleistungen e.V., Hamburg; nach eigener Angabe Marktführer in der Schuldner- und Insolvenzberatung; https://www.iff-hamburg.de/software-en/, abgerufen 20.11.2026) und **InsoSB plus** (Insolvenzsoftware für außergerichtliche Einigung und Insolvenzanträge, nennt Schuldnerberatungsstellen als Zielgruppe; https://www.softguide.de/programm/insosb, abgerufen 20.11.2026). Weitere Namen nenne ich nicht, weil ich sie nicht belegt habe.
- Amtliche Vordrucke für die Verbraucherinsolvenz regelt die Verbraucherinsolvenzformularverordnung (VbrInsFV, zuletzt geändert 16.12.2022; https://www.gesetze-im-internet.de/vbrinsvv/BJNR070300002.html, abgerufen 20.11.2026). Dazu gehören u. a. Vermögensübersicht, Vermögensverzeichnis, **Gläubiger- und Forderungsverzeichnis** und Schuldenbereinigungsplan. Die Nummern der Anlagen und die genauen Spalten habe ich **nicht** geprüft; vor einem Export in diesem Format am amtlichen Vordruck abgleichen.
- RDG: Im Beratungsmodus arbeitet eine zur Rechtsdienstleistung befugte Stelle. Die App rechnet und ordnet trotzdem nur, sie bewertet keine Forderung. Der Schuldenbereinigungsplan bleibt Sache der Stelle.
- Datenschutz/Schweigepflicht: Klientendaten auf einem Dienstgerät sind Sache des Trägers (Auftrag, Löschfristen, Gerätesicherung). SoLo kann helfen (PIN-Pflicht im Beratungsmodus empfehlen, Kürzel statt Namen, automatisches Löschen), aber keine Zusage „DSGVO-konform für Beratungsstellen“ machen.

### Grundsatz: zwei Ansichten, dieselben Daten

- **Privat (Standard):** geführt, Frage für Frage, kurze Sätze ohne Paragrafen, ein nächster Schritt.
- **Beratungsmodus (Schalter in den Einstellungen, wie heute):** dieselben Daten, aber dichte Ansicht. Alles, was der Berater zusätzlich sieht, ist an `beratung === true` gebunden. **Im Privatmodus erscheint kein zusätzliches Feld, kein Knopf, keine Zeile** – abgesichert durch einen Test (U8).
- Berater-Texte nur auf Deutsch (spart Größe und Übersetzung); Musterschreiben und Druck sind ohnehin Deutsch.

### Tabelle „Seite | Privat | Beratungsmodus“

| Seite | Privat | Beratungsmodus (zusätzlich oder anders) |
|---|---|---|
| Geld und Schulden (6 Kacheln) | 6 Kacheln, Krisen-Check als Einstieg | Gleiche Kacheln. Oben eine schmale Zeile „Klient: ‹Kürzel› · wechseln“ (schneller Vorgangswechsel). |
| Es ist dringend / Krisen-Check | Eine Frage pro Bildschirm; Ergebnis 1–3 Schritte | Alle 7 Fragen als eine Checkliste auf einer Seite; Ergebnis mit Paragrafen und Frist-Normen; Knopf „Als Gesprächsnotiz drucken“. |
| Fälle (Konto, Strom, Mahnbescheid, Miete, Geldstrafe) | Frist + erster Schritt, Rest zugeklappt | Details aufgeklappt, Paragrafen sichtbar (wie heute über `tL`), Quellen offen. |
| Was bleibt mir? (Pfändung) | Lohn/Konto wählen → Schritte → Ergebnis in einem Satz | Eine Maske: Netto, Zahl der Unterhaltsberechtigten, Kindergeld-Kinder; Ergebnis mit Rechenweg (Grundfreibetrag, Erhöhungsbeträge, pfändbarer Betrag), Gültigkeit der Tabelle, Zeile zu § 850d/§ 850f/§ 906 ZPO als Prüfhinweis; Auszug der Tabelle rund um das Netto (aus `Rules.pfaendung`, keine neuen Zahlen). |
| Bescheinigung P-Konto | Schreiben „Bitte um Bescheinigung“ an Familienkasse/Jobcenter/Arbeitgeber | Rechenblatt der Freibeträge (Grundfreibetrag + Unterhalt + Kindergeld) zum Übertragen in die Bescheinigung der Stelle. SoLo stellt selbst **keine** Bescheinigung aus. |
| Meine Schulden-Liste | Karten je Gläubiger, sortiert nach Dringlichkeit, „Warum?“ zum Aufklappen, Formular mit „Weitere Angaben“ zugeklappt | Umschalter Karten/Tabelle; Tabelle mit Gläubiger, Art, Aktenzeichen, Stand, Rate, Status, Frist; alle Felder im Formular offen; Zusatzfelder (nur hier): Vertreter/Inkasso getrennt vom ursprünglichen Gläubiger, Hauptforderung · Zinsen · Kosten, Titel ja/nein mit Datum, Forderungsgrund; Sortierung auch nach Gläubiger oder Betrag; Kontrollzeile der Summen (vorhanden). |
| Druck / Export Schulden | „Blatt für die Schuldnerberatung“ (ohne Namen), CSV | Zusätzlich: „Gläubigerübersicht für die Akte“ (mit Kürzel, Aktenzeichen, Anschrift, Notizen vorbelegt); CSV mit allen Zusatzfeldern. **Später:** Ausgabe in Reihenfolge und Spalten des amtlichen Gläubiger- und Forderungsverzeichnisses (VbrInsFV) – erst nach Abgleich am Vordruck. |
| Post vom Inkasso – Prüfliste | 6 Haken in einfachen Worten | Jede Zeile mit Fundstelle (§ 13a Abs. 1 Nr. … RDG), zusätzlich Prüfhinweise § 13a Abs. 3–4, § 13e RDG als Text (keine Beträge). |
| Schreiben an Gläubiger | Muster wählen, Gläubiger wählen, drucken | Zusätzlich Absender „für ‹Kürzel›, vertreten durch ‹Stelle›“ als freies Feld; Schreiben für mehrere Gläubiger nacheinander erzeugen. |
| Mein Geld planen (Haushaltsplan) | Bereiche antippen, Betrag eintragen, „Im Monat bleiben …“ | Alle Posten als eine Tabelle; Druck im Beratungsformat (Einnahmen/Ausgaben/Rest, „frei vor Raten“, Vergleich Regelbedarf mit Quelle); Paragrafen bei Mehrbedarf-Hinweisen. |
| Schuldnerberatung (Kachel 6) | Finden · Bis zum Termin · Mappe · Ablauf | „Finden“ und „Unseriös“ ausgeblendet oder nachrangig; stattdessen „Für den Klienten mitgeben“: Wartezeit-Liste und Unterlagenliste als Handzettel drucken (in der Sprache des Klienten). |
| Leistungs-Check-Ergebnis | Karten „möglich/eher nicht“, kurze Begründung | Wie heute: Rechtsgrundlage je Karte, Paragrafen. Neu sinnvoll: Rechenweg mit Freibeträgen und Bedarfen offen, Formular-Kürzel der Anträge. |
| Brief prüfen | Geführte Prüfung, einfacher Text | Paragrafen und Fristnormen sichtbar; Ergebnis als Prüfvermerk druckbar. |
| Antragsmappe | Aufgabenliste, Briefe, Angabenblatt | Rechtsgrundlage je Antrag (vorhanden), Formularbezeichnungen. |
| Mein Ordner | Vorgänge, Fristen, Checklisten | Fristen aller Vorgänge in einer Liste (sortiert nach Datum, mit Kürzel); Vorgang als verschlüsselte Datei weitergeben/einlesen (Übergabe an Klient oder Kollegin) – später. |

### Bewertung und Vorschlag

Nutzen ★–★★★ · Aufwand S/M/L · Risiko niedrig/mittel/hoch

| # | Baustein | Nutzen | Aufwand | Risiko | Wann |
|---|---|---|---|---|---|
| B1 | Tabellenansicht der Gläubigerliste, alle Felder offen, Sortierung | ★★★ | S–M | niedrig | **nächstes Update** (U8) |
| B2 | Pfändung als eine Maske mit Rechenweg und Tabellenauszug | ★★★ | S–M | niedrig (vorhandene Werte) | **nächstes Update** (U8) |
| B3 | Paragrafen/Details im Schuldenbereich offen, Prüfliste mit Fundstellen | ★★ | S | niedrig | **nächstes Update** |
| B4 | Schneller Klientenwechsel + Kürzel-Zeile | ★★★ | S | niedrig | **nächstes Update** |
| B5 | „Gläubigerübersicht für die Akte“ (Druck) und CSV mit allen Feldern | ★★ | S | niedrig | **nächstes Update** |
| B6 | Handzettel für Klienten (Wartezeit, Unterlagen) in Klientensprache | ★★★ | S | niedrig | **nächstes Update** (fällt bei U6 ab) |
| B7 | Zusatzfelder (Hauptforderung/Zinsen/Kosten, Titel, Vertreter) | ★★ | M | niedrig; Datenformat `lotse.schulden` v2 mit Umstellung alter Stände | später (1 Update danach) |
| B8 | Haushaltsplan im Beratungsformat (Tabelle, Druck) | ★★ | M | niedrig | später |
| B9 | Fristen über alle Klienten | ★★ | M | mittel (bei PIN nur nach Entsperren; Datenschutz) | später |
| B10 | Export im Format des amtlichen Gläubiger- und Forderungsverzeichnisses | ★★★ für Insolvenzberatung | L | **mittel–hoch** (Vordruck muss exakt stimmen, ändert sich; Nähe zur Rechtsdienstleistung) | später, nur nach Fachprüfung und Rückmeldung einer Beratungsstelle |
| B11 | Vorgang als verschlüsselte Datei weitergeben/einlesen | ★★ | M–L | mittel (Datenschutz, Fehlbedienung) | später |
| B12 | Schnittstelle zu Fachsoftware | ★ | L | hoch (kein belegtes offenes Format) | nicht geplant |

Empfehlung: Im nächsten Update B1–B6 (Beratungsmodus als *andere Sicht*, keine neuen Daten). Vor B7/B10 zwei bis drei Schuldnerberater/innen fragen, was sie im Gespräch wirklich brauchen – David hat über den Träger Zugang zu Fachkräften.
