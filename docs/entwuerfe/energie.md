# Entwurf b-energie: Energiekosten-Check im Haushaltsplan

Stand: 20.11.2026 · Grundlage: Code-Stand PR #42 (/home/claude/s1) · Nur Entwurf, noch nichts gebaut.

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Im Haushaltsplan, Kategorie „Strom und Gas“: unter dem Betragsfeld der Knopf **„Abschlag prüfen: Droht eine Nachzahlung?“** (keine neue Kachel).
2. Eingeben: Abschlag pro Monat, zwei Zählerstände mit Datum **oder** den Jahresverbrauch von der letzten Rechnung, Preis von der Rechnung (sonst amtlicher Durchschnittspreis von Destatis), Haus oder Wohnung, Warmwasser mit Strom ja/nein. Gas nur, wenn man mit eigenem Gasvertrag heizt.
3. Oben steht zuerst das Ergebnis mit Wort: „**Nachzahlung möglich: ungefähr 104 €**“ / „Passt ungefähr“ / „Guthaben möglich: ungefähr … €“ und ein Vorschlag für den neuen Abschlag.
4. Darunter: Vergleich mit dem Stromspiegel 2025 („Dein Verbrauch ist hoch: mehr als bei jedem zweiten ähnlichen Haushalt“).
5. Zum Aufklappen: Abschlag ändern lassen (mit Brief), was bei einer Nachzahlung mit Grundsicherungsgeld oder Sozialhilfe gilt, was tun bei drohender Sperre, kostenloser Stromspar-Check, Spartipps (die vorhandenen aus „Geld sparen“).

---

## 2. Inhalte und Texte (Deutsch + Einfache Sprache)

Schlüssel-Präfix **`hb.en.*`** in `src/lang/haushalt/<Sprache>.json` (deutsch: `de.json`), Einfache Sprache in `src/lang/einfach/haushalt.json`. Wiederverwendete vorhandene Schlüssel sind mit ♻ markiert und werden **nicht** neu angelegt.

### 2.1 Einstieg (im Feld „Strom und Gas“ des Plans)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.knopf` | Abschlag prüfen: Droht eine Nachzahlung? | Prüfen: Muss ich bald Geld nach-zahlen? |
| `hb.en.h` | Energiekosten prüfen | Strom und Gas prüfen |
| `hb.en.lead` | Das dauert etwa 3 Minuten. Du brauchst deine letzte Rechnung oder deinen Stromzähler. | Das dauert etwa 3 Minuten. Du brauchst deine letzte Rechnung. Oder du liest deinen Strom-Zähler ab. |
| `hb.en.tab.strom` | Strom | Strom |
| `hb.en.tab.gas` | Gas (Heizung) | Gas (Heizung) |

### 2.2 Eingaben

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.heiz` | Wie heizt du? | Wie heizt du? |
| `hb.en.heiz.miete` | Über die Miete (der Vermieter rechnet ab) | Mit der Miete. Der Vermieter rechnet ab. |
| `hb.en.heiz.gas` | Mit eigenem Gasvertrag (Gasetagenheizung, Gastherme) | Mit Gas. Ich habe einen eigenen Gas-Vertrag. |
| `hb.en.heiz.strom` | Mit Strom (Nachtspeicher, Wärmepumpe) | Mit Strom. Zum Beispiel Nacht-Speicher oder Wärme-Pumpe. |
| `hb.en.heiz.andere` | Anders (Öl, Holz, Kohle, Fernwärme mit eigenem Vertrag) | Anders. Zum Beispiel Öl oder Holz. |
| `hb.en.abschlag` | Abschlag pro Monat | So viel zahlst du jeden Monat |
| `hb.en.abschlag.t` | Steht auf der letzten Rechnung oder auf dem Kontoauszug. | Das steht auf der Rechnung. Oder auf dem Konto-Auszug. |
| `hb.en.weg` | Woher kennst du deinen Verbrauch? | Woher weißt du, wie viel du verbrauchst? |
| `hb.en.weg.zaehler` | Ich lese den Zähler ab (zwei Zählerstände) | Ich lese den Zähler ab. |
| `hb.en.weg.rechnung` | Von der letzten Jahresrechnung | Von der letzten Rechnung |
| `hb.en.z1` | Zählerstand bei der letzten Ablesung (kWh) | Zähler-Stand beim letzten Mal (kWh) |
| `hb.en.z1.t` | Steht auf der letzten Rechnung, meist mit Datum. | Das steht auf der letzten Rechnung. |
| `hb.en.d1` | Datum dieser Ablesung | Datum vom letzten Mal |
| `hb.en.z2` | Zählerstand heute (kWh) | Zähler-Stand heute (kWh) |
| `hb.en.z2.t` | Nur die Zahlen vor dem Komma. | Nur die Zahlen vor dem Komma. |
| `hb.en.d2` | Datum heute | Datum heute |
| `hb.en.jahr` | Verbrauch laut letzter Rechnung (kWh im Jahr) | Verbrauch auf der letzten Rechnung (kWh) |
| `hb.en.gas.einheit` | Dein Gaszähler zeigt Kubikmeter (m³). Auf der Rechnung steht, wie viele kWh ein m³ sind (Brennwert × Zustandszahl). | Dein Gas-Zähler zeigt m³. Auf der Rechnung steht eine Zahl zum Umrechnen in kWh. |
| `hb.en.gas.faktor` | kWh je m³ (von der Rechnung) | kWh für 1 m³ (von der Rechnung) |
| `hb.en.ap` | Arbeitspreis (Cent je kWh) | Preis für 1 kWh (Cent) |
| `hb.en.gp` | Grundpreis (€ im Monat) | Grund-Preis (€ im Monat) |
| `hb.en.preis.t` | Beide stehen auf der Rechnung oder im Vertrag. Leer lassen, dann rechnet SoLo mit dem amtlichen Durchschnittspreis.[^destatis] | Das steht auf der Rechnung. Du weißt es nicht? Dann rechnet SoLo mit einem Durch-Schnitts-Preis. |
| `hb.en.geb` | Wohnst du in einer Wohnung oder in einem Haus? | Wohnung oder Haus? |
| `hb.en.geb.wohnung` | Wohnung (Mehrfamilienhaus) | Wohnung |
| `hb.en.geb.haus` | Haus (Einfamilienhaus, Reihenhaus) | Haus |
| `hb.en.ww` | Warmwasser kommt aus einem Boiler oder Durchlauferhitzer mit Strom | Das warme Wasser macht ein Gerät mit Strom. Zum Beispiel ein Boiler. |
| `hb.en.ww.t` | Gilt auch im Leistungs-Check (dort für den Mehrbedarf). | Das gilt auch im Leistungs-Check. |
| `hb.en.personen` | Personen im Haushalt | So viele Menschen wohnen bei dir |

Hinweis: „Warmwasser mit Strom“ ist **dasselbe Feld** wie `warmwasser` im Leistungs-Check (`cb.warmwasser`, Mehrbedarf § 21 Abs. 7 SGB II). Eine Datenquelle, wie bei Miete und Einkommen.

### 2.3 Ergebnis (oben, `aria-live`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.verbrauch` | Hochgerechnet etwa {kwh} kWh im Jahr. | Im ganzen Jahr sind das etwa {kwh} kWh. |
| `hb.en.verbrauch.rechnung` | Laut Rechnung {kwh} kWh im Jahr. | Auf der Rechnung stehen {kwh} kWh. |
| `hb.en.ungenau` | Der Zeitraum ist kurz. Das Ergebnis ist ungenau, im Winter brauchst du meist mehr. | Die Zeit ist kurz. Das Ergebnis ist nicht genau. |
| `hb.en.kosten` | Kosten im Jahr: ungefähr {b} (Abschläge: {a}). | Das kostet im Jahr ungefähr {b}. Du zahlst {a}. |
| `hb.en.nach` | Möglich: Nachzahlung von ungefähr {b} | Vielleicht musst du etwa {b} nach-zahlen. |
| `hb.en.gut` | Möglich: Guthaben von ungefähr {b} | Vielleicht bekommst du etwa {b} zurück. |
| `hb.en.passt` | Dein Abschlag passt ungefähr. | Dein Betrag passt etwa. |
| `hb.en.vorschlag` | Passender Abschlag: etwa {b} im Monat. | Besser wären etwa {b} im Monat. |
| `hb.en.schaetz` | Gerechnet mit dem Durchschnittspreis {ct} Cent je kWh (Destatis, 1. Halbjahr 2026, mit Grundpreis und Steuern). Dein Preis kann deutlich anders sein. | Gerechnet mit einem Durch-Schnitts-Preis. Dein Preis ist vielleicht anders. |
| `hb.en.fehlt` | Für das Ergebnis fehlt noch: {was} | Das fehlt noch: {was} |
| `hb.en.f.rueck` | Der Zählerstand heute ist kleiner als der alte. Wurde der Zähler getauscht? Dann nimm den Verbrauch von der Rechnung. | Die Zahl heute ist kleiner. Vielleicht gibt es einen neuen Zähler. Nimm dann die Zahl von der Rechnung. |
| `hb.en.f.kurz` | Zwischen den Ablesungen müssen mindestens 14 Tage liegen. | Lies den Zähler erst in 14 Tagen wieder ab. |
| `hb.en.hinweis` | Das ist eine Schätzung. Die echte Rechnung kann anders sein, zum Beispiel wegen Preisänderungen. | Das ist nur geschätzt. Die Rechnung kann anders sein. |

Das Ergebnis-Wort folgt `docs/FARBEN.md`: „Möglich: Nachzahlung“ → `--warn`/`--warn-bg`; „Passt ungefähr“ und „Guthaben möglich“ → `--ok`/`--ok-bg`; Eingabefehler → `--bad`. Farbe nie allein (immer das Wort).

### 2.4 Stromspiegel-Vergleich (nur Strom; nicht bei Heizung mit Strom)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.sp.h` | Vergleich mit ähnlichen Haushalten | Vergleich mit anderen Haushalten |
| `hb.en.sp.A` | Gering: Du brauchst viel weniger Strom als ähnliche Haushalte. | Sehr gut. Du brauchst viel weniger Strom als andere. |
| `hb.en.sp.B` | Niedrig: Du brauchst weniger Strom als ähnliche Haushalte. | Gut. Du brauchst weniger Strom als andere. |
| `hb.en.sp.CD` | Mittel: Dein Verbrauch liegt im Schnitt. | Normal. Andere brauchen etwa so viel. |
| `hb.en.sp.EF` | Hoch: Du brauchst mehr Strom als jeder zweite ähnliche Haushalt. Sparen lohnt sich besonders. | Viel. Du brauchst mehr Strom als die Hälfte der anderen. Sparen lohnt sich. |
| `hb.en.sp.G` | Sehr hoch: Du brauchst mehr Strom als 85 von 100 ähnlichen Haushalten. Hol dir Hilfe, zum Beispiel beim kostenlosen Stromspar-Check. | Sehr viel. Hol dir Hilfe. Zum Beispiel beim Strom-Spar-Check. Der kostet nichts. |
| `hb.en.sp.zeile` | Haushalte wie deiner ({n} Personen, {geb}, {ww}): mittel bis {bis} kWh. | Haushalte wie deiner brauchen bis {bis} kWh. |
| `hb.en.sp.ww.ja` | Warmwasser mit Strom | warmes Wasser mit Strom |
| `hb.en.sp.ww.nein` | Warmwasser ohne Strom | warmes Wasser ohne Strom |
| `hb.en.sp.quelle` | Quelle: Stromspiegel für Deutschland 2025, co2online gGmbH (gemeinnützig), www.stromspiegel.de; Stand Mai 2025. Kein amtlicher Wert, nur zur Orientierung.[^ss] | Quelle: Strom-Spiegel 2025 (co2online). Das ist keine Zahl vom Amt. |
| `hb.en.sp.heizstrom` | Heizt du mit Strom, passt der Stromspiegel nicht. Er zählt nur Haushaltsstrom. | Du heizt mit Strom? Dann passt der Vergleich nicht. |

Klassen-Wörter und Schwellen wie im Stromspiegel-Flyer 2025 (A gering, B niedrig, C/D mittel, E/F hoch, G sehr hoch; „mehr als jeder zweite“ bei E/F, „mehr als 85 %“ bei G).[^ss]

### 2.5 Aufklappbare Details (`<details>`, Reihenfolge = Wichtigkeit)

**a) Abschlag ändern lassen** (`hb.en.anp.*`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.anp.s` | Abschlag ändern lassen | Den Betrag ändern lassen |
| `hb.en.anp.t` | Du verbrauchst deutlich weniger? Dann muss der Versorger das beim Abschlag angemessen berücksichtigen, wenn du es glaubhaft machst, zum Beispiel mit einem aktuellen Zählerstand.[^41b][^gvv13] Droht eine Nachzahlung, kannst du freiwillig mehr zahlen oder den Versorger bitten, den Abschlag zu erhöhen. Dann kommt am Ende keine große Rechnung. | Du brauchst viel weniger Strom? Dann muss der Betrag kleiner werden. Schick dem Versorger deinen Zähler-Stand. Du musst vielleicht nach-zahlen? Dann zahl lieber jetzt jeden Monat etwas mehr. |
| `hb.en.anp.sgb` | Bekommst du Grundsicherungsgeld oder Sozialhilfe und heizt mit Gas: Schick einen neuen Gas-Abschlag sofort an Jobcenter oder Sozialamt. Er gehört zu den Heizkosten.[^60sgb1][^kdu] | Du bekommst Geld vom Jobcenter oder Sozial-Amt und heizt mit Gas? Schick den neuen Gas-Betrag sofort zum Amt. |
| `hb.en.anp.brief` | Brief an den Versorger schreiben | Brief an den Versorger |
| `hb.en.anp.briefLabel` | Brief (bitte prüfen und ergänzen) | Brief (bitte prüfen) |

Brieftext (nur Deutsch, wie `aenderungsBrief`, Funktion `abschlagBrief`):

```
[Name, Anschrift]

An: [Name des Strom- bzw. Gasversorgers]

Kundennummer: [_____]   Zählernummer: [_____]

Bitte um Anpassung meines Abschlags

Sehr geehrte Damen und Herren,

mein aktueller Zählerstand am {datum} ist {stand} kWh. Daraus ergibt sich ein Verbrauch von etwa {kwh} kWh im Jahr.
Bitte passen Sie meinen monatlichen Abschlag auf etwa {neu} an (§ 41b Abs. 3 EnWG bzw. § 13 StromGVV/GasGVV).
Bitte bestätigen Sie mir die Änderung schriftlich.

Mit freundlichen Grüßen

[Ort], {datum}
[Unterschrift]
```

**b) Nachzahlung: Wer hilft?** (`hb.en.nz.*`, Text je nach Leistung; Leistung aus `check().bezug` bzw. `ergebnis`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.nz.s` | Nachzahlung: Wer hilft? | Nach-Zahlung: Wer hilft? |
| `hb.en.nz.strom.sgb` | Strom für den Haushalt ist im Regelbedarf enthalten. Eine Nachzahlung musst du deshalb grundsätzlich selbst zahlen. Frag zuerst den Versorger nach Raten. Droht eine Sperre und geht es nicht anders, kann das Jobcenter ein Darlehen geben (§ 24 Abs. 1 SGB II), das Sozialamt ebenso (§ 37 Abs. 1 SGB XII). Das Darlehen wird später in kleinen Beträgen von der Leistung einbehalten.[^24][^fw24][^42a] | Strom ist im Regel-Satz. Die Nach-Zahlung musst du meist selbst zahlen. Frag zuerst den Versorger: Kann ich in Raten zahlen? Wird der Strom sonst abgestellt? Dann leiht dir das Amt vielleicht Geld. Das zahlst du später in kleinen Beträgen zurück. |
| `hb.en.nz.heiz.sgb` | Eine Nachzahlung für Heizkosten (auch Gas für die Heizung oder Heizstrom) gehört zu den Kosten der Unterkunft. Sie zählt im Monat, in dem sie fällig ist, soweit die Heizkosten angemessen sind (§ 22 Abs. 1 SGB II, § 35 Abs. 4 SGB XII). Reich die Rechnung sofort ein.[^22][^kdu] | Du musst Heiz-Kosten nach-zahlen? Das bezahlt das Amt vielleicht. Bring die Rechnung sofort zum Amt. |
| `hb.en.nz.heiz.ohne` | Auch ohne laufende Leistung kann eine hohe Heizkosten-Nachzahlung einen Anspruch auf Grundsicherungsgeld für den Monat auslösen, in dem sie fällig ist. Stell den Antrag noch in diesem Monat.[^kdu][^37] | Du bekommst sonst kein Geld vom Amt? Bei hohen Heiz-Kosten hilft das Amt vielleicht trotzdem. Stell den Antrag im selben Monat. |
| `hb.en.nz.ww` | Warmwasser mit Strom: Mit Grundsicherungsgeld oder Sozialhilfe gibt es dafür einen Mehrbedarf. SoLo prüft das im Leistungs-Check.[^21] | Warmes Wasser mit Strom? Dann gibt es vielleicht mehr Geld vom Amt. SoLo prüft das. |
| `hb.en.nz.rb` | Im Regelbedarf ist für Strom und Wohnung instand halten etwa {p} % vorgesehen, für eine alleinstehende Person rund {b} im Monat. Das ist keine Vorgabe, nur eine Orientierung.[^rbeg] | Im Regel-Satz sind für Strom etwa {b} im Monat gedacht. Das ist nur zur Orientierung. |

`hb.en.nz.rb` nutzt `regelbedarfAnteile(st1)` (Eintrag `energie`) aus `src/haushalt.js` Z. 27–32, wie `hb.rb.zeile`. Nur bei einer alleinstehenden Person zeigen (Abteilung 4 gilt für Regelbedarfsstufe 1).

**c) Sperre droht** – ♻ `sp.schulden.strom.s` / `sp.schulden.strom` (vorhanden in `src/lang/de.json`, §§ 41f, 41g EnWG). Ergänzend neu, damit die Abwendungsvereinbarung genauer stimmt:

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.sperre.raten` | In der Grundversorgung: Bitte den Versorger nach einer Abwendungsvereinbarung. Er muss sie dir innerhalb einer Woche schriftlich anbieten, mit zinsfreien Monatsraten, meist über 6 bis 18 Monate, bei mehr als 300 € Rückstand 12 bis 24 Monate. Nimmst du sie vor der Sperre an, darf nicht gesperrt werden.[^41g] | Bitte den Versorger um Raten. Er muss dir in einer Woche ein Angebot schicken. Die Raten kosten keine Zinsen. Sagst du rechtzeitig ja, bleibt der Strom an. |

**d) Kostenloser Stromspar-Check** – ♻ `sp.strom.6`, dazu neu:

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.ssc` | Der Stromspar-Check von Caritas und Energieagenturen ist für Haushalte mit wenig Einkommen kostenlos: Beratung zu Hause oder online, Spartechnik wie LED-Lampen und Sparduschkopf, ein Zuschuss für einen neuen Kühlschrank. Termin über stromspar-check.de oder kostenlos 0800 4443322. Gefördert vom Bundesumweltministerium.[^ssc] | Der Strom-Spar-Check kostet nichts. Für Menschen mit wenig Geld. Jemand kommt zu dir nach Hause und hilft beim Sparen. Du bekommst zum Beispiel LED-Lampen. |

**e) Spartipps** – ♻ `sp.strom.1`–`sp.strom.5` bzw. ♻ `sp.heizen.1`–`sp.heizen.5` (Liste wie in `SP_TIPPS`, `src/app.js` Z. 2285), ♻ `sp.quellen`. Knopf neu: `hb.en.mehrTipps` = „Mehr Spartipps“ / Einfach: „Mehr Tipps zum Sparen“ → öffnet „Geld sparen“ mit Thema Strom bzw. Heizen.

**f) So rechnet SoLo** (`hb.en.wie`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.en.wie.s` | So rechnet SoLo | So rechnet SoLo |
| `hb.en.wie` | Verbrauch pro Tag = (Zählerstand heute − alter Zählerstand) ÷ Tage dazwischen; mal 365 = Jahresverbrauch. Kosten = Jahresverbrauch × Arbeitspreis + 12 × Grundpreis. Abschläge = 12 × Abschlag. Weicht das um weniger als 5 % der Kosten oder weniger als 30 € ab, gilt es als „passt ungefähr“ (eine Faustregel von SoLo, keine gesetzliche Grenze). | SoLo rechnet: Wie viel brauchst du an einem Tag? Mal 365 Tage. Mal den Preis. Dann vergleicht SoLo mit deinen Zahlungen. |

---

## 3. Zahlen und Regeln (Quelle, Abruf 20.11.2026)

| Zahl / Regel | Wert | Quelle (URL) | gültig ab / bis |
|---|---|---|---|
| Durchschnittlicher Strompreis private Haushalte (mit Grundpreis, Netzentgelt, Steuern, Abgaben) | **37,97 ct/kWh** (1. Hj. 2026; −4,9 % ggü. 1. Hj. 2025) | Destatis, PM Nr. 345 vom 30.09.2026: destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_345_61243.html | 1. Halbjahr 2026; nächster Wert ca. Ende März 2027 (2. Hj. 2026) |
| Strompreis Haushalte unter 1.000 kWh/Jahr | 57,99 ct/kWh | ebd. | 1. Hj. 2026 |
| Durchschnittlicher Gaspreis private Haushalte | **11,58 ct/kWh** | ebd. | 1. Hj. 2026 |
| Zum Vergleich: BNetzA Monitoringbericht 2025, Haushaltskunden Frühjahr 2025 | Strom 40,1 ct/kWh, Gas 12,13 ct/kWh | bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251126_Monitoringbericht.html (PM 26.11.2025) | Frühjahr 2025 (älter als Destatis, daher nicht verwenden) |
| BDEW-Strompreisanalyse | nicht verwenden (Verband, nicht amtlich) | – | – |
| Stromspiegel 2025: Klassengrenzen A–F (kWh/Jahr), Wohnung, Warmwasser **ohne** Strom, 1 / 2 / 3 / 4 / 5+ Personen | 1: 700·900·1.100·1.400·1.500·2.000 · 2: 1.200·1.500·1.700·2.000·2.400·3.000 · 3: 1.500·1.900·2.200·2.600·3.000·3.700 · 4: 1.700·2.000·2.500·2.900·3.400·4.100 · 5+: 2.000·2.400·2.800·3.500·4.000·5.000 (darüber G) | Stromspiegel-Flyer 2025, S. 3: stromspiegel.de/fileadmin/ssi/stromspiegel/Downloads/stromspiegel-flyer-2025-web.pdf | Stand Mai 2025, 1. Auflage; bis neue Ausgabe (keine Ausgabe 2026 gefunden) |
| … Wohnung, Warmwasser **mit** Strom | 1: 900·1.200·1.500·1.700·2.000·2.700 · 2: 1.600·2.000·2.500·2.800·3.200·4.000 · 3: 2.000·2.800·3.300·3.700·4.500·5.500 · 4: 2.400·3.000·3.700·4.200·4.900·6.000 · 5+: 2.500·3.700·4.500·5.000·6.500·8.000 | ebd. | wie oben |
| … Haus, Warmwasser **ohne** Strom | 1: 1.100·1.500·1.700·2.000·2.400·3.000 · 2: 1.900·2.200·2.500·2.900·3.300·4.000 · 3: 2.400·2.800·3.200·3.600·4.000·5.000 · 4: 2.600·3.100·3.500·4.000·4.500·5.600 · 5+: 3.000·3.600·4.100·4.800·5.500·7.000 | ebd. | wie oben |
| … Haus, Warmwasser **mit** Strom | 1: 1.300·1.600·2.000·2.300·2.900·4.000 · 2: 2.000·2.500·3.000·3.500·4.000·5.500 · 3: 2.700·3.400·3.900·4.500·5.100·7.000 · 4: 3.000·3.700·4.300·5.000·6.000·7.900 · 5+: 3.700·4.600·5.400·6.300·7.400·10.000 | ebd. | wie oben |
| Stromspiegel: Datengrundlage, Herausgeber | 57.000 Stromrechnungen; Herausgeberin co2online gGmbH, unterstützt von eaD e. V. und Öko-Institut e. V. | Flyer 2025 (Impressum); PM 13.05.2025: stromspiegel.de/fileadmin/pressemitteilungen/250513-pm-stromspiegel.pdf | – |
| Stromspiegel: Förderung | **Kein** Förderhinweis in Flyer und Impressum. Auf stromspiegel.de nur ein Ministeriums-Logo (Alt-Text BMWK, Link und Dateiname BMUKN) ohne Erklärung. → In der App **nicht** „gefördert vom Ministerium“ schreiben. | stromspiegel.de/impressum/ | – |
| Stromspiegel: Nutzung | Impressum: „Alle Inhalte sind urheberrechtlich geschützt“, Vervielfältigung nur mit schriftlicher Genehmigung. Begleitmaterial (Flyer, Tabelle): „honorarfrei redaktionell“ mit Quelle www.stromspiegel.de, Beleg an Kampagnenbüro. → Vor Veröffentlichung schriftliche Erlaubnis von co2online einholen (siehe Abschnitt 5). | stromspiegel.de/impressum/; stromspiegel.de/presse/begleitmaterial/ | – |
| Abschlag nach Verbrauch; geringeren Verbrauch glaubhaft machen → angemessen berücksichtigen | außerhalb der Grundversorgung: § 41b Abs. 3 EnWG | gesetze-im-internet.de/enwg_2005/__41b.html | geltendes Recht |
| dasselbe in der Grundversorgung; Abschlag bei Preisänderung anpassbar; Überzahlung unverzüglich erstatten | § 13 Abs. 1–3 StromGVV (Gas: § 13 GasGVV gleichlautend) | gesetze-im-internet.de/stromgvv/__13.html; gesetze-im-internet.de/gasgvv/__13.html | geltendes Recht |
| § 40b EnWG (im Auftrag vermutet) | regelt **Abrechnungszeiträume und -informationen** (höchstens 1 Jahr; monatlich, vierteljährlich, halbjährlich auf Wunsch; Verbrauchshistorie 3 Jahre), **nicht** den Abschlag | gesetze-im-internet.de/enwg_2005/__40b.html | – |
| Sperre: Mindestrückstand | doppelter monatlicher Abschlag (ohne Abschlag: 1/6 der Jahresrechnung) **und** mind. 100 € | § 41f Abs. 3 EnWG: gesetze-im-internet.de/enwg_2005/__41f.html | geltendes Recht |
| Sperre: Androhung / Ankündigung | Sperre frühestens 4 Wochen nach Androhung; Beginn 8 Werktage vorher per Brief ankündigen; Unverhältnismäßigkeit (Gesundheit, Alter, Gefahr für Leib und Leben) in Textform geltend machen | § 41f Abs. 1, 2, 5 EnWG | geltendes Recht |
| Abwendungsvereinbarung (Grundversorgung) | Angebot binnen 1 Woche nach Bitte, spätestens mit der Ankündigung; zinsfreie Monatsraten 6–18 Monate, bei > 300 € Rückstand 12–24 Monate; Annahme vor Sperre → keine Sperre; Einwände gegen die Forderung binnen 1 Monat | § 41g EnWG: gesetze-im-internet.de/enwg_2005/__41g.html | geltendes Recht |
| Haushaltsstrom-Nachzahlung im Bezug | aus dem Regelbedarf; Darlehen nach § 24 Abs. 1 SGB II nur, wenn unabweisbar (Sperre droht) und nicht anders deckbar (z. B. Ratenvereinbarung mit Versorger); Direktzahlung an Versorger möglich; Altschulden (vor Bedarfszeit fällig) und Heizkosten-Schulden **nicht** § 24, sondern § 22 Abs. 8 | BA, Fachliche Weisungen § 24 SGB II, Rz. 24.2–24.3, Stand 01.07.2023: arbeitsagentur.de/datei/dok_ba035755.pdf | Stand der Weisung 01.07.2023 |
| Heizkosten-Nachzahlung | einmaliger Bedarf im **Fälligkeitsmonat**, soweit angemessen; kein gesonderter Antrag nötig im laufenden Bezug; ohne laufende Leistung kann ein einmaliger Bedarf Hilfebedürftigkeit auslösen | Bayer. StMAS, Vollzugshinweise KdU (AMS vom 02.01.2025), Abschn. XV.1 S. 62–64 und S. 40: stmas.bayern.de/imperia/md/images/stmas/stmas_inet/grundsicherung/250102_ams_kdu-allgemeines.pdf (zitiert BSG 22.03.2010 B 4 AS 62/09 R; 08.05.2019 B 14 AS 20/18 R; 19.05.2021 B 14 AS 19/20 R) | Stand 02.01.2025 (BA hat zu § 22 keine eigenen Fachlichen Weisungen; KdU ist kommunal) |
| Unterkunft und Heizung, Guthaben, Schulden | § 22 Abs. 1, 3, 7, 8 SGB II | gesetze-im-internet.de/sgb_2/__22.html | in der Fassung seit 01.07.2026 („Neue Grundsicherung“, Leistung heißt Grundsicherungsgeld) |
| Neue Grundsicherung | schrittweise in Kraft ab 01.07.2026; Bundestag 05.03.2026, Bundesrat 27.03.2026; zu Heizkosten-Nachzahlung/Energieschulden auf der Seite keine Änderung genannt | bundesregierung.de/breg-de/aktuelles/bundesrat-neue-grundsicherung-2399562 | ab 01.07.2026 |
| Mehrbedarf dezentrale Warmwassererzeugung | 2,3 % (Erw.), 1,4 % (15. Lj.), 1,2 % (7–14), 0,8 % (bis 6) des Regelbedarfs | § 21 Abs. 7 SGB II; BA FW § 21 Rz. 21.46 ff., Stand 25.11.2024: arbeitsagentur.de/datei/dok_ba034415.pdf; § 30 Abs. 7 SGB XII. Schon in `src/rules.js` Z. 95 (`mehr.ww`) | geltendes Recht |
| Darlehen Sozialhilfe / Heizung / Schulden | § 37 Abs. 1, § 35 Abs. 4, § 36 SGB XII | gesetze-im-internet.de/sgb_12/ | geltendes Recht |
| Aufrechnung Darlehen | § 42a SGB II (Höhe der Tilgung im Text **nicht** nennen, siehe Abschnitt 5) | gesetze-im-internet.de/sgb_2/__42a.html | – |
| Antragswirkung | Antrag wirkt auf den Monatsersten zurück | § 37 Abs. 2 SGB II | – |
| Anteil Abt. 4 im Regelbedarf | 36,87 € von 434,96 € (≈ 8 %) | § 5 RBEG: gesetze-im-internet.de/rbeg_2021/__5.html (schon in `src/haushalt.js` Z. 26, `RBEG5`) | bis neues RBEG |
| Regelbedarf 2027 | noch nicht festgesetzt; Haushaltsbegleitgesetz 2027 (BR-Drs. 442/26 vom 14.08.2026) ändert nur das Fortschreibungsverfahren | dserver.bundestag.de/brd/2026/0442-26.pdf | offen |
| Stromspar-Check | läuft 2026: BMUKN finanziert über KTF, 2026 gut 18 Mio. €, ab 2027 Ausweitung (bis zu 65 Mio. €/Jahr vorgesehen); Träger Caritas und eaD, ca. 115 Standorte | BMUKN-PM Nr. 019/26 vom 02.03.2026: bundesumweltministerium.de/pressemitteilung/bundesumweltminister-schneider-stromspar-check-wird-ausgeweitet-…; stromspar-check.de (Telefon 0800 4443322, Einkommens-Rechner) | 2026, Ausweitung ab 2027 |
| Kühlschrank 7 °C, Gefrierfach −18 °C | (für ♻ `sp.strom.4`) | umweltbundesamt.de/umwelttipps-fuer-den-alltag/elektrogeraete/kuehlschrank | – |

Feste Zahlen in neuen Texten, die `test/test-feste-zahlen.js` als Gesetzeszahl kennen muss: **300 €** (§ 41g Abs. 3 EnWG) in `hb.en.sperre.raten`. (100 € steht schon in `sp.schulden.strom`.) „30 €“/„5 %“ in `hb.en.wie` sind Faustregeln von SoLo → entweder als Platzhalter aus der Konstante einsetzen (`{tolEur}`, `{tolProz}`) oder in der Ausnahmeliste begründen. Empfehlung: Platzhalter.

---

## 4. Bauplan

### 4.1 Dateien und Funktionen

**`src/haushalt.js`** (Hauptarbeit; reine Rechnung oben, Oberfläche unten, wie bestehend)

Neue Konstanten (nach `RBEG5`, Z. 26):
```js
// Destatis PM 345 vom 30.09.2026, 1. Hj. 2026, mit Grundpreis, Steuern, Abgaben; abgerufen 20.11.2026
var PREIS = { strom: 37.97, gas: 11.58, stand: '2026-1' }; // ct/kWh
// Stromspiegel für Deutschland 2025 (co2online, Stand Mai 2025), obere Grenzen der Klassen A–F in kWh; darüber G. Erlaubnis siehe docs/entwuerfe/energie.md
var STROMSPIEGEL = {
  wohnung: { ohne: [[700,900,1100,1400,1500,2000],[1200,1500,1700,2000,2400,3000],[1500,1900,2200,2600,3000,3700],[1700,2000,2500,2900,3400,4100],[2000,2400,2800,3500,4000,5000]],
             mit:  [[900,1200,1500,1700,2000,2700],[1600,2000,2500,2800,3200,4000],[2000,2800,3300,3700,4500,5500],[2400,3000,3700,4200,4900,6000],[2500,3700,4500,5000,6500,8000]] },
  haus:    { ohne: [[1100,1500,1700,2000,2400,3000],[1900,2200,2500,2900,3300,4000],[2400,2800,3200,3600,4000,5000],[2600,3100,3500,4000,4500,5600],[3000,3600,4100,4800,5500,7000]],
             mit:  [[1300,1600,2000,2300,2900,4000],[2000,2500,3000,3500,4000,5500],[2700,3400,3900,4500,5100,7000],[3000,3700,4300,5000,6000,7900],[3700,4600,5400,6300,7400,10000]] }
};
var TOL = { cent: 3000, anteil: 0.05 }; // „passt ungefähr“: Faustregel, keine Grenze aus einem Gesetz
```

Neue reine Funktionen (alle exportieren, Node-testbar):

| Funktion | Ein / Aus |
|---|---|
| `tageZwischen(isoA, isoB)` | ganze Tage (UTC-Mittag, damit Sommerzeit nicht stört) |
| `jahresVerbrauch(e)` | `e = { z1, d1, z2, d2, jahr }` → `{ kwh, quelle: 'zaehler'\|'rechnung', tage, ungenau, fehler: ''\|'rueck'\|'kurz'\|'fehlt' }`. Zähler: `round((z2−z1)/tage×365)`; `tage < 14` → `kurz`; `14 ≤ tage < 60` → `ungenau`; `z2 < z1` → `rueck`. Sonst `jahr` (Rechnung). Zähler hat Vorrang, wenn vollständig. |
| `gasKwh(m3, faktor)` | `round(m3 × faktor)`; ohne Faktor `null` (kein Standardwert, er steht auf der Rechnung) |
| `jahresKosten(kwh, ap, gpCent, art)` | `ap` in ct/kWh (Zahl, z. B. 36.5) oder `null` → Durchschnitt `PREIS[art]`, `gp` dann 0 (im Durchschnitt enthalten). Ergebnis `{ cent, geschaetzt }` |
| `abschlagVergleich(kostenCent, abschlagCent)` | `{ gezahlt: 12×a, diff: kosten−gezahlt, art: 'nach'\|'gut'\|'passt', vorschlag: ceil(kosten/12/100)×100 }`; `passt`, wenn `|diff| ≤ max(TOL.cent, TOL.anteil×kosten)` |
| `stromspiegelKlasse(kwh, geb, ww, personen)` | `'A'…'G'` oder `null` (geb unbekannt, personen < 1). `personen > 5` → Zeile 5. Grenze inklusiv („bis 2.000“ → 2.000 ist noch D). |
| `klasseWort(k)` | `A`→`A`, `B`→`B`, `C`/`D`→`CD`, `E`/`F`→`EF`, `G`→`G` (Schlüssel `hb.en.sp.*`) |
| `energieCheck(en, s)` | fasst alles zusammen: `en` = Energiedaten, `s` = Check-State (für `warmwasser`, `adults+kids+young`) → `{ strom: {…}, gas: {…}, klasse, mittelBis }` (`mittelBis` = obere Grenze D) |
| `abschlagBrief(o)` | Text wie oben (nur Deutsch), analog `aenderungsBrief` Z. 263 |

`hinweisListe(e)` (Z. 232): neuer Hinweis `add('energie', 75, { art: 'energie', heiz: bool })`, wenn `e.energie` eine Nachzahlung „möglich“ meldet (Strom oder Gas). Text `hb.hw.energie` / `hb.hw.energie.d` (siehe 4.3), Knopf „Abschlag prüfen“ öffnet den Check. Steht zwischen `knapp` (80) und `nk` (70).

**Datenmodell** (in `leer()` Z. 280 und `normiere()` Z. 297 ergänzen, sonst gehen die Daten beim Laden verloren):
```js
energie: {
  heiz: '',            // 'miete' | 'gas' | 'strom' | 'andere'
  geb: '',             // 'wohnung' | 'haus'
  personen: null,      // nur wenn der Check leer ist; sonst adults + kids + young aus dem Check
  strom: { a: null, weg: 'zaehler', z1: null, d1: '', z2: null, d2: '', jahr: null, ap: null, gp: null },
  gas:   { a: null, weg: 'rechnung', z1: null, d1: '', z2: null, d2: '', jahr: null, m3: false, faktor: null, ap: null, gp: null }
}
```
`a`, `gp` in Cent (ganze Zahl); `z*`, `jahr` in kWh (bzw. m³ wenn `m3`), ganze Zahl ≥ 0; `ap` Zahl mit höchstens 2 Nachkommastellen (0 < ap < 200); `faktor` 5–15; Datum `JJJJ-MM-TT`. `normiere` verwirft alles andere. Gespeichert wird mit dem Plan unter `lotse.haushalt` → automatisch je Vorgang und mit PIN verschlüsselt (`src/vorgaenge.js` Z. 7, `DATEN`). Kein neuer Speicherschlüssel.

`warmwasser` wird **nicht** in `energie` gespeichert, sondern über `ctx.daten()`/`ctx.setze({ warmwasser })` im Check (wie Miete). Ist der Check schon ausgefüllt und der Wert anders: Rückfrage wie `fragen()` Z. 338 (neuer Text `hb.en.frage.ww` = „Im Leistungs-Check steht etwas anderes zum Warmwasser. Willst du es dort auch ändern?“ / Einfach: „Im Leistungs-Check steht etwas anderes. Soll SoLo es dort auch ändern?“).

Abschlag → Plan: Summe Strom-Abschlag + Gas-Abschlag in `daten.plan.aus.energie` übernehmen; nach `aenderung()` (Z. 192): leer → schreiben, anders → fragen (`hb.en.frage.plan` = „Im Plan steht für Strom und Gas {alt}. {neu} übernehmen?“).

**Oberfläche** (in `src/haushalt.js`):
- `renderPlan()` Z. 425–435: Wenn `offenKat === 'energie'`, unter `geldFeld` einen Knopf `hb.en.knopf` (`aria-expanded`, `aria-controls="hbEnergie"`) einfügen; Zustand `enOffen` (Modul-Variable wie `ueOffen`).
- Neue Funktion `energieBox()` → `<section class="hb-karte hb-en" id="hbEnergie">`:
  1. `<h3 tabindex="-1">` `hb.en.h`, `hb.en.lead`
  2. Ergebnis `<p id="hbEnErgebnis" aria-live="polite">` + Status-Wort + Vorschlag + Stromspiegel-Zeile (das Wichtigste zuerst)
  3. Frage „Wie heizt du?“ (`<select>`); bei `gas` erscheint die Reiter-Gruppe Strom | Gas (zwei Knöpfe mit Symbol, `aria-pressed`)
  4. Eingaben (wiederverwendet: `geldFeld()` Z. 326 für Abschlag und Grundpreis; neue Hilfsfunktion `zahlFeld(id, label, wert, hint, einheit, onWert)` für kWh, ct, m³, Faktor; `<input type="date">` für Datum, Vorgabe heute bei `d2`)
  5. `<details>` a–f aus Abschnitt 2.5; Knöpfe „Brief an den Versorger“ (`ctx.textAusgeben`, wie Z. 487), „Mehr Spartipps“ (`ctx.sparen('strom'|'heizen')`), „Zum Leistungs-Check“ (bei `hb.en.nz.ww`)
- Neuberechnung bei jedem `change` (nicht bei `input`, wie bisher), `sichern()` danach.
- Auswertung (`renderAusw` Z. 798–803): beim Tipp `energie` zusätzlich Knopf `hb.en.knopf` → `ansicht = 'plan'; offenKat = 'energie'; enOffen = true; render('hb-en-h')`.
- Druckblatt `planText()` Z. 591: wenn ein Ergebnis da ist, eine Zeile „Energie: Nachzahlung möglich, ungefähr … €“ anhängen (Fachkräfte).

**`src/app.js`** (eine Stelle, ~Z. 3386 im `Haushalt.init({...})`-Objekt):
```js
sparen: function (thema) { sp.thema = thema; sp.rezepte = false; oeffneVon('sparen', true); },
```
Sonst nichts in `app.js`. Die Sperre-Texte (`sp.schulden.strom*`) und Spartipps (`sp.strom.*`, `sp.heizen.*`) holt `haushalt.js` über `ctx.t` (die Haushalt-Schlüssel werden beim Build in dieselbe `I18N` gemischt, `scripts/build.js` Z. 35). Die Liste der Tipps nicht kopieren: `haushalt.js` erzeugt `['sp.strom.1'…'sp.strom.5']` bzw. `sp.heizen.1…5` selbst; `sp.strom.6` (Stromspar-Check) erscheint im Abschnitt d.

**`src/template.html`**:
- CSS für `.hb-en`, `.hb-en-erg`, `.hb-en-tabs` neben den übrigen `.hb-*`-Regeln (Z. 350–411), nur Variablen.
- Im Block „Gruppenfarben“ (Z. 850–867) zwei Regeln:
```css
.app .hb-en .hb-en-tabs > button:nth-child(1) .hb-sym { background: var(--c-wohngeld); } /* gruppe energie */
.app .hb-en .hb-en-tabs > button:nth-child(2) .hb-sym { background: var(--c-briefe); } /* gruppe energie */
```
  (Strom = Meerblau, Heizen = Ziegel, genau wie in der Gruppe „Geld sparen“ → dieselbe Sache, dieselbe Farbe; innerhalb der Gruppe keine Farbe doppelt.) Gedrückter Reiter: Rand `--accent` (Bedienfarbe), wie `.hb-kat[aria-pressed]`.
- Stromspiegel-Klasse als Text-Plakette: A/B → `--ok-bg`, C/D → `--na-bg`, E/F/G → `--warn-bg` (Warnung; laut FARBEN.md erlaubt); immer mit Wort.
- Keine neue Ansicht, keine neue Startkachel.

**`tools/kontrast-pruefen.js`** Z. 84–90: `erwartet.energie = 2` ergänzen.

**`docs/FARBEN.md`** Tabelle „Gruppenfarben“: Zeile „Energie-Check (Haushaltsplan) | Strom Meerblau, Gas/Heizen Ziegel“.

**`docs/PRUEFLISTE.md`** / Faktenblatt: Destatis-Preis, Stromspiegel 2025, §§ 41b, 41f, 41g EnWG, § 13 StromGVV/GasGVV eintragen (laut `CLAUDE.md` nach Textänderungen).

### 4.2 Symbole
Strom: vorhandenes Blitz-SVG (`KAT` Z. 11 / `SP_THEMEN` Z. 2279). Gas/Heizen: Flammen-SVG aus `SP_THEMEN` Z. 2280 (in `haushalt.js` als Konstante übernehmen, da `SP_THEMEN` in `app.js` privat ist).

### 4.3 Neue i18n-Schlüssel (vollständige Liste)

`hb.en.knopf, hb.en.h, hb.en.lead, hb.en.tab.strom, hb.en.tab.gas, hb.en.heiz, hb.en.heiz.miete, hb.en.heiz.gas, hb.en.heiz.strom, hb.en.heiz.andere, hb.en.abschlag, hb.en.abschlag.t, hb.en.weg, hb.en.weg.zaehler, hb.en.weg.rechnung, hb.en.z1, hb.en.z1.t, hb.en.d1, hb.en.z2, hb.en.z2.t, hb.en.d2, hb.en.jahr, hb.en.gas.einheit, hb.en.gas.faktor, hb.en.ap, hb.en.gp, hb.en.preis.t, hb.en.geb, hb.en.geb.wohnung, hb.en.geb.haus, hb.en.ww, hb.en.ww.t, hb.en.personen, hb.en.verbrauch, hb.en.verbrauch.rechnung, hb.en.ungenau, hb.en.kosten, hb.en.nach, hb.en.gut, hb.en.passt, hb.en.vorschlag, hb.en.schaetz, hb.en.fehlt, hb.en.f.rueck, hb.en.f.kurz, hb.en.hinweis, hb.en.sp.h, hb.en.sp.A, hb.en.sp.B, hb.en.sp.CD, hb.en.sp.EF, hb.en.sp.G, hb.en.sp.zeile, hb.en.sp.ww.ja, hb.en.sp.ww.nein, hb.en.sp.quelle, hb.en.sp.heizstrom, hb.en.anp.s, hb.en.anp.t, hb.en.anp.sgb, hb.en.anp.brief, hb.en.anp.briefLabel, hb.en.nz.s, hb.en.nz.strom.sgb, hb.en.nz.heiz.sgb, hb.en.nz.heiz.ohne, hb.en.nz.ww, hb.en.nz.rb, hb.en.sperre.raten, hb.en.ssc, hb.en.mehrTipps, hb.en.wie.s, hb.en.wie, hb.en.frage.ww, hb.en.frage.plan, hb.hw.energie, hb.hw.energie.d`

Dazu:
- `hb.hw.energie` = „Bei Strom oder Gas ist eine Nachzahlung möglich. Prüf deinen Abschlag.“ / Einfach: „Vielleicht musst du Strom oder Gas nach-zahlen. Prüf deinen Betrag.“
- `hb.hw.energie.d` = „SoLo hat aus deinen Angaben ungefähr {b} Nachzahlung geschätzt. Ein höherer Abschlag verteilt die Kosten auf das Jahr.“ / Einfach: „SoLo schätzt: etwa {b}. Zahl lieber jeden Monat etwas mehr.“
- Alle in 13 Sprachen (`src/lang/haushalt/*.json`) + `src/lang/einfach/haushalt.json`. Paragrafen in Klammern blendet `Fmt.ohnePara` außerhalb des Beratungsmodus aus (`src/app.js` Z. 45) → Texte so schreiben, dass sie ohne Klammer-Inhalt vollständig bleiben (oben beachtet).
- `hb.en.d2`/Datum: Anzeige über `ctx.datum`.

### 4.4 Neue Tests

**`test/test-haushalt.js`** (Node, reine Rechnung) – neue Fälle:

| Fall | Erwartung |
|---|---|
| `jahresVerbrauch({z1:10000,d1:'2026-01-01',z2:10500,d2:'2026-04-01'})` | `kwh 2028`, `tage 90`, `ungenau false` |
| dasselbe mit `d2:'2026-01-31'` (30 Tage) | `ungenau true` |
| `d2` 10 Tage nach `d1` | `fehler 'kurz'` |
| `z2 < z1` | `fehler 'rueck'` |
| nur `jahr: 2500` | `kwh 2500`, `quelle 'rechnung'` |
| Zählerstände über Sommerzeit-Wechsel (`2026-03-01`→`2026-04-01`) | `tage 31` |
| `jahresKosten(2028, 36.5, 1200, 'strom')` | `cent 88422`, `geschaetzt false` |
| `jahresKosten(2000, null, null, 'strom')` | `cent 75940` (2000 × 37,97 ct), `geschaetzt true` |
| `abschlagVergleich(88422, 6500)` | `art 'nach'`, `diff 10422`, `vorschlag 7400` |
| `abschlagVergleich(88422, 7200)` | `diff 2022` ≤ 4421 → `passt` |
| `abschlagVergleich(60000, 6500)` | `diff −18000` → `gut` |
| `stromspiegelKlasse(2028,'wohnung',false,2)` | `'E'` |
| `stromspiegelKlasse(2000,'wohnung',false,2)` | `'D'` (Grenze inklusiv) |
| `stromspiegelKlasse(1900,'wohnung',false,2)` | `'D'` (passt zum PM-Durchschnitt 1.900 kWh) |
| `stromspiegelKlasse(10001,'haus',true,7)` | `'G'` (7 Personen → Zeile 5+) |
| `stromspiegelKlasse(1500,'',false,2)` | `null` |
| `gasKwh(1200, 10.3)` | `12360`; `gasKwh(1200, null)` → `null` |
| Tabelle `STROMSPIEGEL`: jede Zeile 6 Werte, streng steigend; jede Spalte steigt mit der Personenzahl; „mit Strom“ ≥ „ohne Strom“ | alle wahr (fängt Tippfehler) |
| `normiere({energie:{strom:{a:'x', ap:999, d1:'2026-13-01'}}})` | `a null`, `ap null`, `d1 ''`; gültige Werte bleiben |
| `hinweisListe` mit Energie-Nachzahlung | enthält `energie` mit prio 75, sortiert vor `nk` |
| `abschlagBrief` | enthält „§ 41b Abs. 3 EnWG“, Zählerstand und neuen Betrag |
| Schlüssel-Abdeckung | alle `hb.en.*` in `de.json` und in allen 13 Sprachen + Einfach vorhanden |
| Quelle | `hb.en.sp.quelle` nennt „2025“ und „co2online“, **nicht** „Ministerium“ |

**`test/test-haushalt-dom.js`** (DOM) – neue Fälle: Knopf erscheint nur bei `offenKat === 'energie'`; Ergebnis steht vor den Eingabefeldern; Gas-Reiter nur bei `heiz === 'gas'`; Stromspiegel-Zeile fehlt bei `heiz === 'strom'`; Warmwasser-Haken schreibt nach Rückfrage in den Check (`ctx.setze` mit `warmwasser`); Nachzahlungs-Text `hb.en.nz.strom.sgb` nur bei `bezug.grundsicherungsgeld || bezug.sozialamt`, `hb.en.nz.heiz.ohne` nur ohne Bezug und `heiz` in `gas|strom`; `hb.en.nz.rb` nur bei `adults === 1 && kids + young === 0`; Fokus nach Öffnen auf `#hb-en-h`; Daten überleben `Haushalt.neuLaden()` (Vorgangswechsel).

**`tools/kontrast-pruefen.js`**: Gruppe `energie` mit 2 Farben, keine doppelt (läuft in `npm test`).

**`test/test-feste-zahlen.js`**: `300` mit Begründung „§ 41g Abs. 3 EnWG“ in `GESETZ`; Destatis-Preis kommt per Platzhalter `{ct}` aus `PREIS` (kein fester Text).

**`test/test-sprachen-zahlen.js`** / **`test-einfach-gleich.js`**: laufen automatisch mit; Einfach-Texte enthalten bewusst keine anderen Zahlen als Deutsch (Ausnahme: Einfach lässt Zahlen weg, das ist erlaubt, falls der Test das zulässt – sonst Zahlen in Einfach mit übernehmen).

### 4.5 Konfliktrisiko mit parallelen Aufgaben

| Datei | Wer noch | Risiko |
|---|---|---|
| `src/haushalt.js` (`leer`, `normiere`, `hinweisListe`, `renderPlan`) | **b-schuldenliste** (Raten/Schulden-Hinweis Z. 257, evtl. eigenes Datenfeld), **b-fristen** (liest `Haushalt.rest()`, `bewilligt`) | **hoch** bei `leer()`/`normiere()`/`hinweisListe()` – Feldnamen absprechen (`energie` vs. `schulden`), Prioritäten 75 vs. andere |
| `src/lang/haushalt/*.json`, `src/lang/einfach/haushalt.json` | b-schuldenliste, evtl. b-fristen | mittel (JSON-Zusammenführung; Präfix `hb.en.` vermeidet Namensgleichheit) |
| `src/template.html` Gruppenfarben-Block | **b-fristen** (Mein-Ordner-Karten) | mittel (nur Zeilen anhängen) |
| `tools/kontrast-pruefen.js` `erwartet` | b-fristen | niedrig–mittel |
| `src/app.js` (eine Zeile im `Haushalt.init`-Objekt) | alle | niedrig |
| `sp.schulden.strom`, `sp.vertraege.4` (`src/lang/*.json`) | **b-schuldenliste** | mittel, falls dort korrigiert wird (siehe Abschnitt 5, Punkt 4) |
| Heizkosten-/Nebenkosten-Nachzahlung (`hb.hw.nk`, `erweiterungen/nebenkosten.js`) | **b-kostensenkung** | inhaltlich: gleiche Aussage zu Fälligkeitsmonat und Angemessenheit verwenden |
| `test/test-feste-zahlen.js` `GESETZ` | alle mit neuen Zahlen | niedrig |

---

## 5. Offene Fragen und Unsicherheiten

1. **Stromspiegel: Nutzungsrecht klären (vor dem Bau der Tabelle).** Das Impressum verlangt für Vervielfältigung eine schriftliche Genehmigung; das Begleitmaterial ist „honorarfrei redaktionell“ nutzbar. Eine App ist keine redaktionelle Nutzung. Die vollständige Tabelle (70 Werte aus 57.000 Rechnungen) kann zudem unter das Datenbankrecht (§ 87b UrhG) fallen. **Empfehlung:** co2online (Kampagnenbüro Stromspiegel) schriftlich um Erlaubnis bitten. Bis dahin Rückfallweg: nur Verbrauch und Kosten zeigen und einen Link „Mit dem Stromspiegel vergleichen: www.stromspiegel.de“; die Konstante `STROMSPIEGEL` erst nach Zusage einbauen.
2. **Stromspiegel ist nicht amtlich** und laut eigenen Angaben **nicht** ausdrücklich vom Ministerium gefördert (nur ein Logo ohne Erklärung auf der Website; Flyer nennt eaD und Öko-Institut). Der Auftrag nahm „gefördert vom Bundesministerium“ an: das ist **nicht belegt** → in der App nicht schreiben. Eine Ausgabe 2026 gab es bis 20.11.2026 nicht (nur einen „PV-Stromspiegel“ vom 24.02.2026, für Haushalte mit Solaranlage; nicht eingeplant).
3. **§ 40b EnWG** regelt nicht den Abschlag. Rechtsgrundlage für die Anpassung: § 41b Abs. 3 EnWG (Sonderverträge) und § 13 StromGVV/GasGVV (Grundversorgung). Ein „Recht auf Anpassung nach Wunsch“ gibt es nicht; nur: Versorger muss deutlich geringeren, glaubhaft gemachten Verbrauch angemessen berücksichtigen. Texte sind entsprechend vorsichtig.
4. **Vorhandene Texte prüfen (Befund, nicht Teil dieses Auftrags):** `sp.vertraege.4` sagt „Das Jobcenter kann Energieschulden als Darlehen übernehmen (§ 22 Abs. 8 SGB II)“. Nach BA-Weisung § 24 Rz. 24.2/24.3 gilt für Haushaltsstrom-Schulden **während** des Bezugs § 24 Abs. 1 SGB II; § 22 Abs. 8 nur für Altschulden und Heizkosten. Vorschlag: „… als Darlehen übernehmen (§ 24 Abs. 1 oder § 22 Abs. 8 SGB II)“. `sp.schulden.strom` („muss … Ratenzahlung anbieten“) stimmt, könnte ergänzen: „auf deine Bitte, innerhalb einer Woche“. Absprechen mit b-schuldenliste.
5. **Fachliche Weisungen § 24** haben Stand 01.07.2023 (vor der Neuen Grundsicherung). Ob die BA sie zum 01.07.2026 neu gefasst hat, war nicht abrufbar (Wissensdatenbank lieferte Fehler). Inhaltlich hat sich laut Bundesregierung bei Energieschulden nichts geändert; vor Veröffentlichung neu abrufen.
6. **Heizkosten-Nachzahlung im Fälligkeitsmonat:** Die BA hat zu § 22 keine eigenen Fachlichen Weisungen (kommunale Leistung). Belegt über die Vollzugshinweise des Bayerischen Sozialministeriums (02.01.2025) und die dort zitierten BSG-Urteile. Für andere Länder gleiche Rechtslage (Bundesrecht), aber Verwaltungspraxis kann abweichen → Text sagt „soweit angemessen“.
7. **Tilgung des Darlehens (§ 42a SGB II):** Höhe der monatlichen Aufrechnung nach der Reform nicht geprüft → im Text bewusst ohne Prozentsatz.
8. **Strom-Guthaben im Bezug:** § 22 Abs. 3 SGB II nimmt Rückzahlungen für Haushaltsenergie von der Minderung der Unterkunftskosten aus. Ob ein Strom-Guthaben als Einkommen zählt, ist nicht abschließend geprüft → in diesem Entwurf **keine** Aussage dazu („Guthaben möglich“ ohne Folgehinweis).
9. **Destatis-Durchschnitt** enthält den Grundpreis umgelegt auf die kWh. Für kleine Verbräuche (< 1.000 kWh) ist der echte Preis je kWh viel höher (57,99 ct). Vorschlag: bei `kwh < 1000` den Bandwert 57,99 ct nehmen, sonst 37,97 ct. Ob die Mehrwertsteuer im Haushaltswert enthalten ist, sagt die Pressemitteilung nicht ausdrücklich (EU-Methodik: ja) → vor dem Bau in der Destatis-Tabelle 61243 prüfen.
10. **Hochrechnung aus Zählerständen** ist bei Heizstrom und elektrischem Warmwasser stark jahreszeitabhängig. Lösung im Entwurf: Hinweis „ungenau“ unter 60 Tagen und immer „ungefähr“. Eine Jahreszeit-Korrektur (Gewichtung nach Monaten) gibt es amtlich nicht → nicht einbauen.
11. **Abrechnungszeitraum:** Der Vergleich rechnet aufs ganze Jahr (12 Abschläge). Wer den Beginn des Abrechnungsjahres kennt, könnte die Rest-Monate einbeziehen („bis zur Rechnung im März fehlen noch …“). Bewusst weggelassen (nicht überladen); spätere Ausbaustufe.
12. **Gas in m³:** Kein Standard-Umrechnungsfaktor, da er je Netzgebiet schwankt und auf der Rechnung steht. Fehlt er, bittet SoLo um die kWh von der Rechnung.
13. **Regelbedarf 2027** ist noch nicht festgesetzt (Haushaltsbegleitgesetz 2027 ändert nur das Verfahren). `hb.en.nz.rb` nutzt `ctx.regeln().regelbedarf.alleinstehend` und bleibt dadurch automatisch aktuell.
14. **Stromspar-Check-Zielgruppe:** Die Website arbeitet inzwischen mit einem Einkommens-Rechner statt fester Leistungsliste. Text sagt deshalb „Haushalte mit wenig Einkommen“, nicht „nur mit Bürgergeld“. Ausweitung ab 2027 ist angekündigt; Details (neue Zielgruppen) offen.

---

### Quellen-Fußnoten (alle abgerufen am 20.11.2026)

[^destatis]: Statistisches Bundesamt, Pressemitteilung Nr. 345 vom 30.09.2026 „Strom- und Gaspreise für Haushalte im 1. Halbjahr 2026 gesunken“, https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/09/PD26_345_61243.html
[^ss]: co2online gGmbH, Stromspiegel für Deutschland 2025, Flyer (Stand Mai 2025), https://www.stromspiegel.de/fileadmin/ssi/stromspiegel/Downloads/stromspiegel-flyer-2025-web.pdf; Pressemitteilung 13.05.2025, https://www.stromspiegel.de/fileadmin/pressemitteilungen/250513-pm-stromspiegel.pdf; Impressum https://www.stromspiegel.de/impressum/; Begleitmaterial https://www.stromspiegel.de/presse/begleitmaterial/
[^41b]: § 41b Abs. 3 EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41b.html
[^gvv13]: § 13 StromGVV, https://www.gesetze-im-internet.de/stromgvv/__13.html; § 13 GasGVV, https://www.gesetze-im-internet.de/gasgvv/__13.html
[^41g]: § 41g EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41g.html; § 41f EnWG, https://www.gesetze-im-internet.de/enwg_2005/__41f.html
[^60sgb1]: § 60 Abs. 1 Satz 1 Nr. 2 SGB I, https://www.gesetze-im-internet.de/sgb_1/__60.html
[^kdu]: Bayerisches Staatsministerium für Familie, Arbeit und Soziales, Vollzugshinweise Kosten der Unterkunft – Allgemeines, AMS vom 02.01.2025, Abschn. XV.1 (S. 62–64) und S. 40, https://stmas.bayern.de/imperia/md/images/stmas/stmas_inet/grundsicherung/250102_ams_kdu-allgemeines.pdf
[^22]: § 22 SGB II, https://www.gesetze-im-internet.de/sgb_2/__22.html; § 35 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__35.html
[^37]: § 37 Abs. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__37.html
[^24]: § 24 Abs. 1 SGB II, https://www.gesetze-im-internet.de/sgb_2/__24.html; § 37 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__37.html
[^fw24]: Bundesagentur für Arbeit, Fachliche Weisungen § 24 SGB II, Rz. 24.2–24.3, Stand 01.07.2023, https://www.arbeitsagentur.de/datei/dok_ba035755.pdf
[^42a]: § 42a SGB II, https://www.gesetze-im-internet.de/sgb_2/__42a.html
[^21]: § 21 Abs. 7 SGB II, https://www.gesetze-im-internet.de/sgb_2/__21.html; BA, Fachliche Weisungen § 21 SGB II, Rz. 21.46–21.48, Stand 25.11.2024, https://www.arbeitsagentur.de/datei/dok_ba034415.pdf; § 30 Abs. 7 SGB XII
[^rbeg]: § 5 RBEG, https://www.gesetze-im-internet.de/rbeg_2021/__5.html
[^ssc]: Bundesumweltministerium, Pressemitteilung Nr. 019/26 vom 02.03.2026 „Stromspar-Check wird ausgeweitet …“, https://www.bundesumweltministerium.de/pressemitteilung/bundesumweltminister-schneider-stromspar-check-wird-ausgeweitet-um-mehr-haushalte-mit-geringem-einkommen-beim-energiesparen-zu-unterstuetzen; https://www.stromspar-check.de/
