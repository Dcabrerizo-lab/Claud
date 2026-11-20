# Entwurf: Zweites Einkommen auch für Paare (b-paar-einkommen)

Stand: 20.11.2026 · Code gelesen: `/home/claude/s1` (Stand PR #42) · Alle Abrufe am 20.11.2026

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Bei zwei Erwachsenen gibt es unter **„Dein Einkommen“** und unter **„Einkommen deines Partners …“** je ein Aufklappfeld **„+ Weiteres Einkommen“**. Allein Lebende haben das schon, dort ändert sich nichts.
2. Darin stehen dieselbe Auswahl wie heute bei Alleinstehenden (Lohn/Minijob, Selbstständig, Rente, Arbeitslosengeld I, Krankengeld, Elterngeld, Werkstattlohn, Unterhalt für sich selbst) und ein Betragsfeld („was ankommt“).
3. Der bisherige Rat „das größte wählen und die Summe eintragen“ fällt weg. Bisher bekam damit zum Beispiel Unterhalt den Freibetrag für Arbeit, ein Nebenjob neben Arbeitslosengeld aber keinen.
4. Die App rechnet jede Leistung **pro Person und pro Einkommensart**: den Freibetrag für Arbeit je erwerbstätiger Person, die Versicherungspauschale je Person, die Werbungskosten beim Wohngeld einmal je Person, das Mindesteinkommen beim Kinderzuschlag aus allen Einkommen.
5. Das zweite Einkommen kommt auch in den Haushaltsplan (als eigene Zeile) und in die Antragsmappe (je Person). Gespeicherte Vorgänge laden ohne Änderung.

---

## 2. Inhalte und Texte (de + Einfache Sprache)

### 2.1 Befund: was es heute gibt

| | Allein (adults = 1) | Paar (adults = 2) |
|---|---|---|
| Hauptfeld je Person | `ek1Art` + `ek1Brutto`/`ek1Netto` | `ek1Art…` und `ek2Art` + `ek2Brutto`/`ek2Netto` |
| Zweites Einkommen | **ja**: `ek1bArt` + `ek1bBetrag` (`src/template.html` Z. 1282–1292, `.cond-ek1b`) | **nein**. `ek1b` wird bei zwei Erwachsenen zurückgesetzt (`src/app.js` Z. 180) und ausgeblendet (Z. 202). Für Person 2 gibt es kein Feld. |
| Hinweis im Formular | – | `ek.art.hint`: „Bei mehreren Einkommen dieser Person …: das größte wählen und die Summe eintragen.“ (`ekFelder()`, Z. 289) |
| Weg in die Regeln | mit `ek1b`: Liste `state.einkommen = [{art,b,n},{art,b}]` (`syncEinkommen()`, Z. 270–273) → `derive()`: `liste` | immer Summenfelder `brutto`, `brutto2`, `netto`, `art1`, `art2` → `derive()`: `pers = [[art1, brutto−brutto2], [art2, brutto2]]` (Z. 572) |

**In den Regeln** (`src/rules.js`, `derive()` Z. 517–680) gilt die Liste bisher als **eine Person**:
- `brutto2 = adults === 2 && !liste ? … : 0` (Z. 531). Mit Liste ist bei Paaren `brutto2 = 0`.
- `haushaltsFreibetrag()` (Z. 777–784) rechnet mit Liste **einen** Freibetrag aus der Summe aller Löhne (falsch für zwei Erwerbstätige).
- `vPausch` (Z. 635) gibt mit Liste höchstens einmal 30 €.
- `kinderzuschlag()` Z. 924 (`!h.liste`), `alg1()` Z. 1256, `krankengeld()` Z. 1285, `famvers()` Z. 1573 und `zukunft()` Z. 1811 lesen nur `art1`/`art2`/`brutto2`.
- `wohngeld()` Z. 835–845 gibt den Werbungskosten-Pauschbetrag **je Eintrag**. Schon heute bekommt eine allein lebende Person mit Lohn und Minijob ihn doppelt. Das ist ein bestehender kleiner Fehler: der Wert ist zu günstig, auch für „wahrscheinlich“.
- `gsaEinkommen()` Z. 1102–1124 deckelt den Freibetrag für Arbeit (§ 82 Abs. 3 SGB XII) **je Eintrag** statt je Person.

**Was für Paare fehlt:** Für Person 1 **und** Person 2 je eine zweite Einkommensart, und die Zuordnung „wem gehört welches Einkommen“ in der Liste. Heute führt der Summen-Rat zu falschen Zahlen (Rechnung mit dem heutigen Code, Fälle aus Abschnitt 4.6):

| Fall | heute (Summe bei der größten Art) | richtig (neu) |
|---|---|---|
| F1 Paar + Kind, P1 Lohn 1.200 € + Unterhalt 300 €, P2 Lohn 1.800 € | Grundsicherungsgeld ≈ 250 €, Kinderzuschlag ≈ 280 € (Unterhalt bekommt Freibetrag für Arbeit) | ≈ 220 € / ≈ 260 € |
| F3 Rentnerpaar, P1 Rente 800 € + Minijob 300 €, P2 Rente 650 € | Grundsicherung im Alter „möglich“ (Minijob ohne Freibetrag) | „wahrscheinlich“, ≈ 100 € |
| F4 Paar + 2 Kinder, P1 ALG I 1.100 € + Nebenjob 165 €, P2 Lohn 1.400 € | Grundsicherungsgeld ≈ 290 € (Nebenjob ohne Freibetrag) | ≈ 380 € |

### 2.2 Anrechnung je Leistung (Rechtsstand 20.11.2026)

**Grundsicherungsgeld (SGB II, seit 1.7.2026 „Neue Grundsicherung“)**
- Einkommen sind alle Einnahmen in Geld, abzüglich § 11b.[^1] Kindergeld zählt beim Kind.[^1]
- **Freibetrag für Arbeit je erwerbstätiger Person einzeln**:[^2][^3] 100 € Grundabsetzbetrag, 20 % von 100 bis 520 €, 30 % von 520 bis 1.000 €, 10 % von 1.000 bis 1.200 € (1.500 € mit minderjährigem Kind).[^2] Die Fachlichen Weisungen sagen: „Der Freibetrag wird jedem erwerbsfähigen Mitglied einer BG eingeräumt, das Einkommen aus einer Erwerbstätigkeit erzielt“ (Rz. 11.144).[^3] Er gilt nur für Erwerbseinkommen (Rz. 11.145).[^3]
- **Mehrere Jobs einer Person** (Lohn + Minijob): Brutto und Netto werden addiert, also **ein** Freibetrag aus der Summe (Rz. 11.15).[^3]
- **Selbstständigkeit**: Freibetrag wie Lohn, berechnet vom Gewinn (Rz. 11.33).[^3]
- **Versicherungspauschale 30 €** vom Einkommen jedes volljährigen Mitglieds (§ 6 Abs. 1 Nr. 1 GrusiGV;[^4] Rz. 11.125[^3]). Bei Erwerbstätigen steckt sie im Grundabsetzbetrag von 100 € (§ 11b Abs. 2,[^2] Rz. 11.151[^3]). Der Grundabsetzbetrag darf nur vom Erwerbseinkommen abgezogen werden (Rz. 11.155).[^3]
- **Unterhalt für sich selbst** (Trennungs- oder nachehelicher Unterhalt), **Rente, ALG I, Krankengeld**: Einkommen ohne Freibetrag für Arbeit, aber mit 30 € Pauschale, wenn die Person keinen Lohn hat. ALG I mit Nebenjob: Freibetrag nur auf den Nebenjob (Rz. 11.56–11.57).[^3]
- **Elterngeld**: zählt als Einkommen, ein Freibetrag bis 300 € bleibt frei in Höhe des Einkommens vor der Geburt (ElterngeldPlus: die Hälfte).[^5]
- Gezahlter Unterhalt mit Titel wird abgesetzt (§ 11b Abs. 1 Satz 1 Nr. 7).[^2]

**Grundsicherung im Alter und bei Erwerbsminderung (SGB XII)**
- Freibetrag für Arbeit: 30 % des Einkommens aus selbstständiger und nichtselbstständiger Tätigkeit, höchstens 50 % der Regelbedarfsstufe 1 (2026: 281,50 €), **je leistungsberechtigter Person**.[^6] Werkstattlohn: ein Achtel RS 1 plus 50 % des Rests.[^6]
- Zusätzliche Altersvorsorge (Betriebs-, Riester-Rente): 100 € plus 30 % des Rests, höchstens 50 % RS 1.[^6]
- Rente, Unterhalt, ALG I, Krankengeld: voll (nach den Abzügen in Abs. 2).[^6]

**Wohngeld (§§ 14–17 WoGG)**
- Jahreseinkommen ist die Summe der positiven Einkünfte **jedes zu berücksichtigenden Haushaltsmitglieds** plus die Beträge aus § 14 Abs. 2, minus Abzug nach § 16.[^7]
- **§ 16 WoGG: je 10 %** für Steuern vom Einkommen, Pflichtbeiträge zur Kranken- und Pflegeversicherung und Pflichtbeiträge zur Rentenversicherung. Also 0, 10, 20 oder 30 %, bestimmt **je Person** für ihr ganzes Einkommen.[^8] Wer Lohn mit voller Sozialversicherung bekommt, hat deshalb auch auf den Unterhalt 30 %.
- Werbungskosten: Arbeitnehmer-Pauschbetrag 1.230 € und 102 € für Renten/Unterhalt (§ 9a EStG). Das ist im Code schon so belegt (`R.wgWerbung`) und gilt **einmal je Person**.
- Unterhalt vom geschiedenen oder dauernd getrennt lebenden Ehegatten: § 14 Abs. 2 Nr. 20 (steuerfrei, also voll); mit Realsplitting sind es sonstige Einkünfte.[^7] Lohnersatzleistungen (ALG I, Krankengeld, Elterngeld): § 14 Abs. 2 Nr. 6.[^7] Minijob (pauschal versteuert): § 14 Abs. 1 Satz 3 Nr. 2, abzüglich der Aufwendungen.[^7]
- Elterngeld bis 300 € im Monat ist kein Einkommen (§ 10 Abs. 1 BEEG).[^5]

**Kinderzuschlag (§ 6a BKGG)**
- Mindesteinkommen **900 € (Paar) / 600 € (allein erziehend)**: Einkommen nach § 11 Abs. 1 Satz 1 und 2 SGB II **ohne Abzüge nach § 11b**, ohne Wohngeld, Kindergeld und Kinderzuschlag.[^9] Es zählen also Lohn brutto, Unterhalt, Rente, ALG I, Elterngeld **beider** Eltern.
- Elterneinkommen über dem Elternbedarf: Erwerbseinkommen mindert den Zuschlag um 45 %, anderes Einkommen in voller Höhe. Die Überschreitung gilt zuerst als durch Erwerbseinkommen verursacht.[^9]
- Elterngeld: Freibetrag wie im SGB II (§ 10 Abs. 5 BEEG nennt § 6a BKGG).[^5]

**Unterhaltsvorschuss (§ 1 Abs. 1a UVG)**
- Für Kinder ab 12: eigenes Einkommen des Elternteils nach § 11 Abs. 1 Satz 1 SGB II von mindestens 600 €, ohne Kindergeld und ohne Abzüge nach § 11b.[^10] Es zählt **nur Person 1** (der Elternteil), aber mit **allen** ihren Einkommen, auch Unterhalt für sich selbst.

**Bildung und Teilhabe**: kein eigenes Einkommen, folgt aus Grundsicherungsgeld, Wohngeld und Kinderzuschlag (`bildungTeilhabe()`). Nichts zu ändern.

**Familienversicherung** (`famvers()`): prüft das Einkommen von Person 2 (`brutto2`, `art2`). Mit der Liste muss `brutto2` die Summe aller Einkommen von Person 2 sein.

### 2.3 Rechtsstand ab 1.1.2027

| Thema | Stand 20.11.2026 | Bewertung |
|---|---|---|
| Freibeträge § 11b Abs. 2/3 SGB II | Durch das 13. SGB-II-ÄndG (BGBl. 2026 I Nr. 107, in Kraft 1.7.2026)[^11] **nicht geändert**; der geltende Text hat die bekannten Stufen.[^2] Für 2027 ist keine Änderung beschlossen. | gilt weiter |
| Minijob-Grenze / § 11b Abs. 2b | Mindestlohn ab 1.1.2027 14,60 €[^12] → Grenze 633 € (`R.minijob2027`, schon im Code) | im Code vorhanden |
| Regelbedarfe 2027 | Entwurf Haushaltsbegleitgesetz 2027 (BR-Drs. 442/26 vom 14.8.2026) ändert nur den Fortschreibungs-Mechanismus, **ohne Eurobeträge**.[^13] | **offen**: Testwerte mit 2026er Werten (`heute: 2026.9`) |
| Sofortzuschlag Kinderzuschlag (25 €) | Derselbe Entwurf streicht ihn in § 6a Abs. 2 BKGG.[^13] Heute gilt er noch.[^9] | **möglich** ab 2027; betrifft `R.kiz.max`, nicht diesen Entwurf |
| Wohngeld 2027 | Kabinett: Erhöhung ausgesetzt, Formel und Heizkosten sollten sich ändern.[^14] Keine Aussage zur Einkommensermittlung. Nach Presseberichten vom 16.11.2026 sollen Formeländerung und Heizkosten-Halbierung wieder entfallen; noch nicht verkündet. | §§ 14–17 WoGG nach heutigem Stand unverändert; Aufgabe b-mietgrenze |

### 2.4 Texte (i18n), deutsch und Einfache Sprache

Die Schlüssel folgen dem vorhandenen Stil `ek.*` (Hauptdatei `src/lang/de.json`, Einfach `src/lang/einfach/d.json`) und `hb.*` (`src/lang/haushalt/de.json`, `src/lang/einfach/haushalt.json`). Alle 13 Sprachen nachziehen.

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `ek.art.hint` (**geändert**) | Hat diese Person zwei Einkommen, zum Beispiel Lohn und Unterhalt? Hier das größere wählen. Das zweite unten bei „+ Weiteres Einkommen“ eintragen. | Hat diese Person 2 Einkommen? Zum Beispiel Lohn und Unterhalt. Wähle hier das größere Einkommen. Das zweite Einkommen trägst du unten ein. Tippe dafür auf „+ Weiteres Einkommen“. |
| `ek.weiteres.auf` (neu) | + Weiteres Einkommen | + Weiteres Einkommen |
| `ek.weiteres` (unverändert, Person 1) | Bekommst du noch ein zweites Einkommen? | Hast du noch ein zweites Einkommen? |
| `ek.weiteres2` (neu, Person 2) | Bekommt dein Partner oder deine Partnerin noch ein zweites Einkommen? | Hat dein Partner oder deine Partnerin noch ein zweites Einkommen? |
| `ek.weiteres.hint` (**geändert**) | Zum Beispiel Lohn und Unterhalt, Rente und Minijob, Arbeitslosengeld und Nebenjob oder Werkstattlohn und Rente. Dann hier das zweite wählen. | Zum Beispiel: Lohn und Unterhalt. Oder Rente und Minijob. Oder Arbeitslosengeld und ein kleiner Job. Wähle hier das zweite Einkommen. |
| `ek.weiteres.hint.lohn` (neu, nur bei Art Lohn/Selbstständig) | Bei Lohn: den Betrag eintragen, der ankommt. Bei einem Minijob ist das meist auch das Brutto. Bei einem zweiten Job mit Steuerklasse VI: lieber den Lohn vor Abzügen eintragen. | Bei Lohn: Trage den Betrag ein, der auf dem Konto ankommt. Bei einem Minijob ist das meistens der ganze Lohn. |
| `ek.weiteres.betrag` (unverändert) | Betrag im Monat (was ankommt) | Betrag im Monat (das, was ankommt) |
| `hb.ek1b` (neu) | Dein zweites Einkommen (netto) | Dein zweites Einkommen (das, was ankommt) |
| `hb.ek2b` (neu) | Zweites Einkommen deines Partners oder deiner Partnerin (netto) | Zweites Einkommen von deinem Partner oder deiner Partnerin (das, was ankommt) |

Antragsmappe (`src/app.js` Z. 1162–1176, nur Deutsch wie bisher): je Person eine Zeile, zum Beispiel
„Einkommen (ich): Lohn oder Gehalt, brutto 1.200 €, netto 950 € im Monat; dazu Unterhalt für sich selbst (Zahlbetrag) 300 € im Monat“.

---

## 3. Zahlen und Regeln

| Regel | Wert | Quelle | Abruf | gültig ab / bis |
|---|---|---|---|---|
| Freibetrag Arbeit SGB II, je erwerbstätiger Person | 100 € + 20 % (100–520) + 30 % (520–1.000) + 10 % (1.000–1.200 bzw. 1.500 mit Kind) | § 11b Abs. 2, 3 SGB II[^2]; FW Rz. 11.144[^3] | 20.11.2026 | unverändert seit 1.7.2023; auch nach 1.7.2026; 2027 keine Änderung bekannt |
| Mehrere Erwerbseinkommen einer Person | addiert, ein Freibetrag | FW Rz. 11.15[^3] | 20.11.2026 | – |
| Versicherungspauschale | 30 € je volljährige Person; bei Erwerbstätigen im Grundabsetzbetrag enthalten | § 6 Abs. 1 Nr. 1 GrusiGV[^4]; FW Rz. 11.125, 11.151, 11.155[^3] | 20.11.2026 | – |
| Elterngeld-Freibetrag SGB II/XII/KiZ | bis 300 € (Plus 150 €) in Höhe des Einkommens vor der Geburt | § 10 Abs. 5 BEEG[^5] | 20.11.2026 | – |
| Elterngeld beim Wohngeld | bis 300 € kein Einkommen | § 10 Abs. 1 BEEG[^5] | 20.11.2026 | – |
| Freibetrag Arbeit SGB XII, je Person | 30 %, höchstens 50 % RS 1 (2026: 281,50 €) | § 82 Abs. 3 SGB XII[^6]; RS 1 563 € (`R.regelbedarf`, RBSFV 2026) | 20.11.2026 | RS 1 2027 offen[^13] |
| Wohngeld Abzug § 16 | je 10 % für Steuer, KV/PV, RV (0–30 %), je Person | § 16 WoGG[^8] | 20.11.2026 | 2027: Einkommensregeln nach heutigem Stand unverändert[^14] |
| Wohngeld Werbungskosten | 1.230 € (Lohn) / 102 € (Rente, Unterhalt) im Jahr, einmal je Person | § 14 Abs. 1 WoGG[^7] i. V. m. § 9a EStG (im Code `R.wgWerbung`) | 20.11.2026 | – |
| Wohngeld Unterhalt Ehegatte | voll (steuerfrei) bzw. sonstige Einkünfte | § 14 Abs. 2 Nr. 20 WoGG[^7] | 20.11.2026 | – |
| KiZ Mindesteinkommen | 900 € Paar / 600 € allein erziehend, brutto (ohne § 11b) | § 6a Abs. 1 Nr. 2 BKGG[^9] | 20.11.2026 | – |
| KiZ Minderung | Erwerb 45 %, anderes 100 % | § 6a Abs. 6 BKGG[^9] | 20.11.2026 | – |
| KiZ Sofortzuschlag | 25 € (im Höchstbetrag) | § 6a Abs. 2 BKGG[^9] | 20.11.2026 | Streichung ab 2027 **möglich** (Entwurf)[^13] |
| UVG ab 12 | Einkommen des Elternteils ≥ 600 € (ohne Kindergeld, ohne § 11b) | § 1 Abs. 1a UVG[^10] | 20.11.2026 | – |
| Minijob-Grenze | 603 € (2026), 633 € (ab 1.1.2027) | MiLoV 5 (13,90 € / 14,60 €)[^12]; § 8 Abs. 1a SGB IV | 20.11.2026 | 633 € ab 1.1.2027 |

---

## 4. Bauplan

### 4.1 Datenmodell

**Formular-Zustand** (`src/app.js`, `blankState()` Z. 90):
- vorhanden: `ek1bArt`, `ek1bBetrag` (gilt künftig auch bei zwei Erwachsenen für Person 1)
- **neu**: `ek2bArt: ''`, `ek2bBetrag: ''`

**Eingabe der Regeln** (`state.einkommen`, gebaut in `syncEinkommen()`): Liste von Einträgen
`{ p: 1|2, art, b, n? }`. `p` fehlt = 1, so laden alte Listen (Einfache Version `esEingabe()`, gespeicherte Stände) unverändert. `p: 2` zählt nur bei `adults === 2`.

**Intern** (`derive()`): Eintrag `[art, b, n, nurAuszahlung, selbst, p]`, also ein neues **sechstes Feld `x[5]`**. In der Summen-Version (ohne Liste) bleibt `pers` wie heute. Dort gilt Person = Index + 1.

### 4.2 `src/rules.js` (klein halten, nur diese Stellen)

Der Patch wurde für diesen Entwurf im Speicher auf `/home/claude/s1/src/rules.js` angewendet und mit allen Testfällen aus 4.6 gerechnet. Die Zahlen dort stammen aus diesem Lauf und stimmen mit der Rechnung von Hand überein.

1. **`derive()` Liste** (Z. 527): Person anhängen
   `return [aSel(x.art), num(x.b), nurAus ? num(x.b) : num(x.n), nurAus, x.art === 'selbst', adults === 2 && Number(x.p) === 2 ? 2 : 1];`
2. **`brutto2`** (Z. 531):
   `const brutto2 = adults !== 2 ? 0 : liste ? liste.reduce((a, x) => a + (x[5] === 2 ? x[1] : 0), 0) : Math.min(num(inp.brutto2), brutto);`
   Damit stimmen auch `bruttoEigen` (UVG, nur Person 1) und `famvers()` (Person 2) ohne weitere Änderung.
3. **`art1`/`art2`** (Z. 563 f.): Hilfsfunktion
   `const hauptArt = (p) => { const e = liste.filter((x) => x[5] === p); return e.some((x) => x[0] === 'lohn') ? 'lohn' : e.length ? e[0][0] : 'ohne'; };`
   `art1 = liste ? hauptArt(1) : …` · `art2 = liste && adults === 2 ? hauptArt(2) : …` (bei Alleinstehenden gleiches Ergebnis wie heute).
4. **`vPausch`** (Z. 635): je Person 30 €, wenn die Person anderes Einkommen und keinen Lohn hat
   `liste ? [1, 2].reduce((a, p) => { const e = pers.filter((x) => x[5] === p); return a + (e.some((x) => x[0] !== 'lohn' && x[0] !== 'ohne' && x[1] > 0) && !e.some((x) => x[0] === 'lohn' && x[1] > 0) ? R.versPauschale : 0); }, 0) : …`
5. **`erwerb`/`erwerb2`** (Z. 652):
   `erwerb: liste ? liste.some((x) => x[0] === 'lohn' && x[5] === 1) : pers[0][0] === 'lohn', erwerb2: liste ? liste.some((x) => x[0] === 'lohn' && x[5] === 2) : art2 === 'lohn'`
6. **`haushaltsFreibetrag()`** (Z. 777–784): je Person aus der Summe ihrer Löhne
   `const lohnVon = (p) => h.pers.filter((x) => x[0] === 'lohn' && x[5] === p).reduce((a, x) => a + x[1], 0);`
   `b1 = h.liste ? lohnVon(1) : …` · `f2 = … sgb2Freibetrag(h.liste ? lohnVon(2) : h.brutto2, mk_)`
7. **`gsaEinkommen()`** (Z. 1116): Lohn ohne Abzug addieren, danach je Person `min(30 % · Lohnnetto_p, 50 % · RS1)` abziehen (Person: `h.liste ? x[5] : i + 1`).
8. **`wohngeld()`** (nur der Block `pers.forEach` Z. 835–845):
   - Werbungskosten-Rest je Person: `wkL = {1: 1230/12, 2: 1230/12}` für Lohn/Werkstatt (nicht Selbstständige), `wkR = {1: 102/12, 2: 102/12}` für Rente (für „wahrscheinlich“ und „möglich“) und Unterhalt (nur „möglich“, `wkOpt`). Verbrauchtes wird abgezogen.
   - **Obere Grenze des § 16-Abzugs je Person**: `ab[1] = max(Tabelle des Eintrags, höchster Wert der Person)`. Die untere Grenze (für „wahrscheinlich“) bleibt je Eintrag, also vorsichtig. Das verhindert ein falsches „unwahrscheinlich“, wenn Unterhalt neben vollem Lohn nur mit 20 % statt 30 % gerechnet würde.
9. **`kinderzuschlag()`** Z. 924: `!h.liste && h.art1 === 'rente' && h.art2 === 'rente'` ersetzen durch
   `[1, 2].every((p) => h.pers.some((x, i) => x[0] === 'rente' && (h.liste ? x[5] : i + 1) === p))`.
10. **`alg1()`** Z. 1256 / **`krankengeld()`** Z. 1285: zusätzlich `h.pers.some((x) => x[0] === 'alg' && x[1] > 0)` bzw. `'kg'`. Behebt auch den heutigen Fall „allein: Lohn + ALG I als zweites Einkommen“ (Karte zeigt sonst nicht „beziehst du schon“).
11. Nicht ändern: `kizMinderungEltern()`, `elternEinkSGB2()`, `kizRechnung()` (Mindesteinkommen aus `h.brutto` = Summe aller `b`), `unterhaltAnrechenbar()` (Einkommen der Kinder, nicht betroffen), `bildungTeilhabe()`, `uvgKarte()`. `zukunft()` bleibt bei Listen aus (`return null`), wie heute bei Alleinstehenden mit zweitem Einkommen.
12. Kommentare: Z. 81 und 634 nennen „Bürgergeld-V“, richtig heißt sie jetzt **GrusiGV**.[^4]

Für Alleinstehende mit Liste ändern sich nur die Punkte 7 und 8 (der Werbungskosten-Pauschbetrag kommt einmal statt doppelt, der SGB-XII-Deckel gilt für Lohn + Minijob zusammen). Das ist eine Korrektur. `test-faelle.js` und `test-raster.js` sind vor dem Merge darauf zu prüfen.

### 4.3 `src/app.js`

| Stelle | Änderung |
|---|---|
| `blankState()` Z. 90 | `ek2bArt: '', ek2bBetrag: ''` |
| Reset Z. 180 f. | `if (!state.ek1Art \|\| state.ek1Art === 'ohne') reset(['ek1bArt','ek1bBetrag']);` (die Bedingung `adults !== 1` entfällt) · neu: `if (state.adults !== 2 \|\| !state.ek2Art \|\| state.ek2Art === 'ohne') reset(['ek2bArt','ek2bBetrag']); if (!state.ek2bArt) reset(['ek2bBetrag']);` · Z. 182/183: `ek2bArt` bei `rente`/`wfbm` mitprüfen |
| `show()` Z. 202–205 | `.cond-ek1b`: `!!state.ek1Art && state.ek1Art !== 'ohne'` (ohne `adults === 1`) · neu `.cond-ek2b`: `state.adults === 2 && !!state.ek2Art && state.ek2Art !== 'ohne'` · `.cond-ek2bBetrag`: `!!state.ek2bArt` · `.cond-rente`/`.cond-wfbm` zusätzlich `state.ek2bArt` |
| `syncEinkommen()` Z. 255–275 | Liste bauen, wenn bei Person 1 **oder** (Paar) Person 2 ein zweites Einkommen > 0 da ist **und** alle Erwachsenen eine Art haben. Einträge: Hauptfeld P1 (wie heute, mit `n` geschätzt über `nettoSchaetzen(p1, 1)`), `ek1b` als `{p:1, art, b}`, Hauptfeld P2 als `{p:2, …}` (`nettoSchaetzen(p2, 2)`), `ek2b` als `{p:2, art, b}`. Hauptfeld mit Art `ohne`: kein Eintrag. `state.brutto/netto/brutto2/art1/art2` weiter wie heute aus den Hauptfeldern (für Anzeigen; die Regeln nehmen bei Liste die Liste). |
| `ekFelder()` Z. 289 | `ek.art.hint` bleibt nur bei zwei Erwachsenen sichtbar (neuer Text) · Hinweis `ek.weiteres.hint.lohn` unter `ek1bArt`/`ek2bArt`, wenn Art `lohn`/`selbst` |
| `buildSelects()` Z. 399 | `fillSelect('ek2bArt', …)` wie `ek1bArt` |
| `SELECTS`/`NUMS` Z. 564 f. | `'ek2bArt'` bzw. `'ek2bBetrag'` ergänzen |
| `writeForm()` | `details#ek1bBox`/`#ek2bBox`: `open = !!state.ek?bArt` (offen, wenn etwas eingetragen ist) |
| Antragsmappe Z. 1174 | Bei Liste nicht mehr alles in einer Zeile (bei Paaren käme Person 2 doppelt): `ekZeile(i, wer)` um „; dazu ARTDE[ek{i}bArt] Betrag im Monat“ ergänzen, die Listenzeile nur noch bei `adults === 1` |

### 4.4 `src/template.html` (Z. 1282–1292 und nach Z. 1316)

Die vorhandene `subbox cond-ek1b` in ein Aufklappfeld fassen. Dasselbe im Kasten `ekbox2` für Person 2:

```html
<details class="optblock ek-mehr cond-ek2b" id="ek2bBox">
  <summary data-t="ek.weiteres.auf"></summary>
  <div class="field">
    <label for="ek2bArt" data-t="ek.weiteres2"></label>
    <select id="ek2bArt"></select>
    <span class="hint" data-t="ek.weiteres.hint"></span>
    <span class="hint" id="ek2bLohnHint" data-t="ek.weiteres.hint.lohn" hidden></span>
  </div>
  <div class="field cond-ek2bBetrag">
    <label for="ek2bBetrag" data-t="ek.weiteres.betrag"></label>
    <div class="money"><input type="text" inputmode="decimal" pattern="[0-9.,]*" autocomplete="off" id="ek2bBetrag"><span aria-hidden="true">€</span></div>
  </div>
</details>
```

**Farben:** keine neuen. `details.optblock` (Z. 280 f.) nutzt `--line`, `--surface`, `--ink`. Der Summary-Text hat die Bedienfarbe Petrol (`--accent`) wie alle Aufklapper. Es entsteht keine neue Kachel- oder Knopfgruppe, `tools/kontrast-pruefen.js` braucht keinen Eintrag. Keine Startkachel.

### 4.5 `src/haushalt.js` (Haushaltsplan) und `src/vorgaenge.js`

- `ausCheck()` Z. 175–189: zusätzlich `o.ek1b`, `o.ek1bArt`, `o.ek2b`, `o.ek2bArt` (Cent, aus `ek?bBetrag`, nur wenn `ek?bArt` gesetzt; `ek2b` nur bei `zwei`). Heute fehlt das zweite Einkommen auch bei Alleinstehenden im Plan.
- `planEin()` Z. 316–319 und `planText()` Z. 593: `g.ek1b` und `g.zwei ? g.ek2b : null` einfügen.
- Einnahmen-Karte Z. 375 ff.: Zeile `hb-ek1b`/`hb-ek2b` (`geldFeld`, Label `hb.ek1b`/`hb.ek2b`), nur wenn die Art gesetzt ist. Rückschreiben mit `geteiltSetzen(feld, 'ek' + i + 'bBetrag', …)`. Die Art wird im Check gewählt, keine eigene Auswahl im Plan (hält die Karte schlank).
- `uebernahme()` Z. 198–217: `da.push({ was: 'ek', i, zweit: true, art: s['ek'+i+'bArt'], c })`. Anzeige über `hb.ue.ek` wie bisher.
- `hinweisDaten()` Z. 456: `ekJetzt` inklusive `ek1b`/`ek2b`.
- **`src/vorgaenge.js`: keine Änderung.** Der Zustand liegt als Ganzes (verschlüsselt mit PIN) unter `lotse.state`. Neue Felder kommen über `Object.assign(blankState(), …)` (`set` Z. 2139) mit `''` dazu.
- Abwärtskompatibilität: Alte Paar-Stände haben kein `ek1b`/`ek2b` (wurde zurückgesetzt), also keine Liste und dasselbe Ergebnis. Alte Einzel-Stände mit `ek1b` haben eine Liste ohne `p`, also Person 1 und dasselbe Ergebnis (außer den Korrekturen aus 4.2 Punkt 7/8). `migriereEinkommen()` bleibt unverändert.

### 4.6 Tests

**Neue Datei `test/test-paar-einkommen.js`** (in `package.json` → `test:rules` einhängen). Stil wie `test/test-unterhalt-selbst.js`: `base = { kids: 0, young: 0, vermoegen: 0, bezug: {}, gebJahr: 1985, heute: 2026.9 }`, ohne Mietenstufe, außer wo genannt. RS 2026: 563/506/390/357, Kindergeld 259 €.

| # | Fall (Eingabe `einkommen`) | Rechenweg | Erwartung |
|---|---|---|---|
| **F1** Paar Lohn + Unterhalt | `adults 2, kids 1, miete 950`; P1 `{lohn b1200 n950}`, `{unt b300}`; P2 `{lohn b1800 n1350}` | Bedarf 2·506 + 390 + 950 = **2.352**. Freibetrag P1 aus 1.200 (mit Kind): 100 + 84 + 144 + 20 = 348; P2 aus 1.800: 100 + 84 + 144 + 50 = 378 (nicht aus 1.500 wie beim Summen-Rat). Keine Pauschale (beide mit Lohn). Eltern 2.600 − 726 = 1.874; + KG 259 = 2.133. Lücke 219. KiZ: Elternbedarf 1.012 + 0,83·950 = 1.800,50; Überschreitung 73,50 (Unterhalt 300 < Bedarf → zählt als Erwerb) → 45 % = 33,08; 297 − 33,08 = 263,92 | `ggeld` ja, ≈ **220 €** · `kiz` ja, ≈ **260 €** · `h.brutto2 = 1800`, `haushaltsFreibetrag = 726` |
| **F2** Paar Lohn + Lohn + Minijob | `adults 2, miete 800, mietstufe '3'`; P1 `{lohn b2000 n1480}`, `{lohn b300}`; P2 `{lohn b603 n603}` | Freibetrag P1 aus **2.300 zusammen** (Rz. 11.15): 348 (nicht 348 + 140); P2 aus 603: 100 + 84 + 24,90 = 208,90 → 556,90. Einkommen 2.383 − 556,90 = 1.826,10; Bedarf 1.812 → Lücke −14,10 | `ggeld` **möglich** (`bedarfRand`) · Wohngeld: Werbungskosten P1 nur einmal → `grenzeStufe` lo **2.464**, hi **3.145**, `schaetz.bis` 80 · `famvers` möglich (603 ≤ Minijob-Grenze) |
| **F2b** Gegenprobe: Minijob bei P2 | wie F2, aber `{lohn b300}` bei **P2** | P1 aus 2.000: 348; P2 aus 903: 100 + 84 + 114,90 = 298,90 → 646,90; Lücke 1.812 − (2.383 − 646,90) = 75,90 | `ggeld` ja, ≈ **80 €** · `famvers` unwahrscheinlich (903 €) |
| **F3** Paar Rente + Rente (+ Minijob) | `adults 2, gebJahr 1950, miete 750`; P1 `{rente b910 n800}`, `{lohn b300}`; P2 `{rente b740 n650}` | SGB XII: Bedarf 1.012 + 750 = 1.762; Einkommen 800 + 300 − min(90; 281,50) + 650 = 1.660 → Lücke 102 | `gsa` ja, ≈ **100 €** (heute mit Summe: „möglich“) · `famvers` unwahrscheinlich (Rente P2 740 € > 565 €) |
| **F4** Paar ALG I + Nebenjob + Lohn | `adults 2, kids 2, kidsU6 1, miete 1000`; P1 `{alg b1100}`, `{lohn b165}`; P2 `{lohn b1400 n1080}` | Bedarf 1.012 + 357 + 390 + 1.000 = 2.759. Freibetrag P1 nur auf 165: 100 + 13 = 113 (keine Pauschale, Rz. 11.151); P2 aus 1.400: 368. Eltern 2.345 − 481 = 1.864; + 518 = 2.382 → Lücke 377. KiZ: Bedarf 1.012 + 0,71·1.000 = 1.722; Überschreitung 142, anderes Einkommen (ALG 1.100) < Bedarf → 45 % = 63,90; 594 − 63,90 = 530,10 | `ggeld` ja, ≈ **380 €** (heute 290 €) · `kiz` ja, ≈ **530 €** · `alg1` = **na** („beziehst du schon“) |
| **F5** Grenzfall KiZ-Mindesteinkommen | `adults 2, kids 1, miete 900`; P1 `{lohn b300}`, `{unt b200}`; P2 `{lohn b400 n400}` | Brutto 300 + 200 + 400 = **900 €** = Grenze (Unterhalt zählt mit, § 6a Abs. 1 Nr. 2). SGB II: Freibetrag 140 + 160 = 300; 900 − 300 + 259 = 859; Bedarf 2.302 → Lücke 1.443 | `kiz` **nicht** `minEink` (Ergebnis „möglich“, `einkoNiedrig`) · `ggeld` ja, ≈ **1.440 €** |
| **F5b** knapp darunter | wie F5, Unterhalt **150** | Brutto 850 < 900 | `kiz` nein, `hl === 'minEink'` |
| **F6** Wohngeld, § 16 je Person | `adults 2, miete 700, mietstufe '3'`; P1 `{lohn b1500 n1150}`, `{unt b300}`; P2 `{rente b1000 n890}` | Monat, „möglich“-Rechnung: Lohn (1.500 − 102,50) · 0,7 = 978,25; Unterhalt (300 − 8,50) · **0,7** (30 % wie der Lohn derselben Person) = 204,05; Rente (1.000 − 8,50) · 0,8 = 793,20 → Y = 1.975,50. „Wahrscheinlich“: 1.257,75 + 300 + 892,35 = 2.450,10 | `wohngeld` möglich, `grenzeStufe` lo **2.313**, hi **2.896**, `schaetz.bis` **30** |
| **F7** Grenzfall kleiner Lohn | `adults 2, miete 700`; P1 `{lohn b80 n80}`, `{unt b400}`; P2 `{ohne b0}` | Grundabsetzbetrag nur bis 80 (Rz. 11.155), keine Pauschale extra (vorsichtig, siehe offene Fragen). 480 − 80 = 400; Bedarf 1.712 → 1.312 | `ggeld` ja, ≈ **1.310 €** · `h.vPausch === 0` |
| **F8** Elterngeld + Teilzeit | `adults 2, kids 1, kidsU6 1, miete 850`; P1 `{eg b600}`, `{lohn b450 n450}`; P2 `{lohn b2100 n1580}` | Bedarf 1.012 + 357 + 850 = 2.219. Freibetrag P1 aus 450: 170; P2: 378; Elterngeld-Freibetrag 300. 2.630 − 548 − 300 = 1.782; + 259 = 2.041 → 178. KiZ: Bedarf 1.012 + 705,50 = 1.717,50; Überschreitung 64,50 → 29,03; 297 − 29,03 = 267,97 | `ggeld` ja, ≈ **180 €** · `kiz` ja, ≈ **270 €** |
| **F9** Regression allein | `adults 1, miete 500`; `{lohn b1200 n950}`, `{unt b300}` (ohne `p`) | 1.250 − 348 = 902; Bedarf 1.063 → 161 | `ggeld` ja, ≈ **160 €** (gleich wie heute) |
| **F10** Rentnerpaar, zwei Renten bei P1 | `adults 2, gebJahr 1950, miete 650, mietstufe '2'`; P1 `{rente b790 n700}`, `{rente b340 n300}`; P2 `{rente b680 n600}` | SGB XII: 1.012 + 650 = 1.662 − 1.600 = 62. Wohngeld: Renten-Werbungskosten bei P1 nur einmal | `gsa` ja, ≈ **60 €** · `wohngeld` ja, `schaetz.spanne` **170–240 €**, lo 2.208, hi 2.531 |
| **F11** KiZ-Hinweis Rentnerpaar mit Liste | `adults 2, kids 1, gebJahr 1955, miete 800`; P1 `{rente b1000 n880}`, `{lohn b200}`; P2 `{rente b800 n700}` | beide haben Rente, Regelaltersgrenze erreicht. GSA: 1.012 + 390 + 800 = 2.202 − (880 + 200 − 60 + 700 + 259) = 223 | `kiz` möglich mit **`kiz.rentnerPaar`** · `gsa` ja, ≈ **220 €** |

Ergänzend:
- **`test/test-einkommen-app.js`** (DOM): (a) Paar, `ek1bArt: 'unt', ek1bBetrag: 300` → `state.einkommen` mit `p: 1`, Feld sichtbar (`.cond-ek1b` bei `adults 2`); (b) `ek2bArt: 'lohn', ek2bBetrag: 200` → Eintrag `{p: 2, art: 'lohn', b: 200}`, Hauptfeld P2 mit geschätztem `n`; (c) Wechsel auf `adults 1` → `ek2b*` leer; (d) `ek2Art: 'ohne'` → `#ek2bBox` ausgeblendet; (e) `['ek1bArt','ek2bArt']` enthalten `unt`, nicht `ohne`; (f) `#ek2bBox.open === true`, wenn `ek2bArt` gesetzt.
- **`test/test-altstaende.js`**: neuer Fall „Version vom 20.11.2026 (Paar ohne zweites Einkommen)“ → gleiches Ergebnis; Fall „heutiges Format mit `ek2bArt`/`ek2bBetrag`“, `feld: ['ek2bBetrag', '300']`.
- **`test/test-haushalt.js`**: `ausCheck({adults:2, ek1Art:'lohn', ek1Netto:1000, ek1bArt:'unt', ek1bBetrag:300, ek2Art:'lohn', ek2Netto:900, ek2bArt:'lohn', ek2bBetrag:150}, 259)` → `ek1b === 30000`, `ek2b === 15000`; bei `adults: 1` → `ek2b === null`; `uebernahme()` meldet beide als `da`.
- **`test/test-eigenschaften.js`** (Monotonie): zufällige Paar-Listen; mehr Einkommen einer Person ergibt nie mehr Grundsicherungsgeld, Wohngeld oder Kinderzuschlag (ab Mindesteinkommen).

### 4.7 Konfliktrisiko

| Datei | Risiko | mit |
|---|---|---|
| `src/rules.js` `wohngeld()` Z. 835–845 | **hoch** | **b-mietgrenze** (Wohngeld). Nur den `pers.forEach`-Block anfassen, Miet- und Formelteil nicht |
| `src/rules.js` `derive()` Z. 527–652, `haushaltsFreibetrag`, `gsaEinkommen` | mittel | alle, die an `derive()` Felder ergänzen (Rückgabeobjekt Z. 627 ff.) |
| `src/haushalt.js` `ausCheck`/`uebernahme`/Einnahmen-Karte | **hoch** | **b-energie** (Haushaltsplan) |
| `src/app.js` Z. 90, 180–205, 255–275, 399, 564 f., 1174 | mittel | b-kostensenkung, b-fristen (andere Bereiche, aber dieselbe Datei) |
| `src/template.html` Z. 1282–1316 | niedrig | – |
| `src/lang/*.json` (13 + Einfach + haushalt) | mittel | alle mit neuen Texten (nur Schlüssel ergänzen, nichts umsortieren) |
| `package.json` `test:rules` | niedrig | jede Aufgabe mit neuer Testdatei |

Empfohlene Reihenfolge: zuerst `rules.js` mit `test-paar-einkommen.js` (eigener kleiner PR), danach UI + Haushaltsplan.

---

## 5. Offene Fragen / Unsicherheiten

1. **Versicherungspauschale bei sehr kleinem Lohn** (F7): FW Rz. 11.155 erlaubt, nicht ausgeschöpfte Absetzungen nach § 11b Abs. 1 Nr. 3/4 vom weiteren Einkommen abzuziehen.[^3] Ob die 30 € bei Lohn unter 100 € zusätzlich vom Unterhalt abgehen, ist im Wortlaut nicht eindeutig. Die App rechnet vorsichtig ohne (Unterschied höchstens 30 €, liegt im Bereich „möglich“).
2. **Zweiter Lohn nur als Auszahlbetrag**: Bei einem zweiten Job mit Steuerklasse VI ist das Brutto höher als der eingetragene Betrag. Dann fallen Freibetrag und KiZ-Mindesteinkommen zu niedrig aus (vorsichtig). Nahe an 900/600 € kann das ein falsches „nein“ beim Kinderzuschlag geben. Möglich wäre: bei Art `lohn` mit Betrag über der Minijob-Grenze nach dem Brutto fragen (später, eigenes Feld).
3. **Minijob beim Wohngeld**: § 16 (RV-Befreiung → 0 %) und Werbungskosten bei pauschal versteuertem Lohn (tatsächliche statt Pauschbetrag?) sind je Fall verschieden.[^7][^8] Die App behält die heutige Spanne.
4. **Elterngeld-Freibetrag ≤ 300 €**: `egFreiSGB` gibt bei Elterngeld genau 300 € keinen Freibetrag (bestehende Vorsicht, weil Mindestelterngeld auch ohne Einkommen vor der Geburt gezahlt wird). Nicht Teil dieses Auftrags.
5. **EU-Ausschluss** (`euAusschluss`, Z. 767) schaut nur auf die Arbeit von Person 1. Arbeit von Person 2 kann den Familienangehörigen ein Aufenthaltsrecht geben. Gehört nicht zu diesem Auftrag, aber prüfen.
6. **2027**: Regelbedarfe 2027 und der Wegfall des KiZ-Sofortzuschlags stehen noch nicht fest (nur Entwurf).[^13] Wohngeld-Änderungen 2027 sind noch nicht verkündet.[^14] Die Tests deshalb mit `heute: 2026.9` und die Erwartungswerte wo möglich aus `R.RULES` rechnen.
7. **Wer ist Person 1?** UVG und Elterngeld-Zukunft nehmen Person 1 als Elternteil. Das steht so schon im Formular („Dein Einkommen“), bleibt unverändert.

---

[^1]: § 11 Abs. 1 SGB II, https://www.gesetze-im-internet.de/sgb_2/__11.html (abgerufen 20.11.2026)
[^2]: § 11b SGB II, https://www.gesetze-im-internet.de/sgb_2/__11b.html (abgerufen 20.11.2026)
[^3]: Bundesagentur für Arbeit, Fachliche Weisungen §§ 11–11b SGB II (Stand 01.07.2023), Rz. 11.15, 11.33, 11.56 f., 11.125, 11.129, 11.144 f., 11.150 f., 11.155, 11.162, https://www.arbeitsagentur.de/datei/fw-p11-11b-sgb-ii-stand-01072023_ba044381.pdf (abgerufen 20.11.2026; neuere Fassung nach dem 13. SGB-II-ÄndG vor dem Bau gegenprüfen)
[^4]: § 6 Abs. 1 Nr. 1 Grundsicherungsgeld-Verordnung (GrusiGV), https://www.gesetze-im-internet.de/algiiv_2008/__6.html (abgerufen 20.11.2026)
[^5]: § 10 BEEG, https://www.gesetze-im-internet.de/beeg/__10.html (abgerufen 20.11.2026)
[^6]: § 82 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__82.html (abgerufen 20.11.2026)
[^7]: § 14 WoGG, https://www.gesetze-im-internet.de/wogg/__14.html (abgerufen 20.11.2026)
[^8]: § 16 WoGG, https://www.gesetze-im-internet.de/wogg/__16.html (abgerufen 20.11.2026)
[^9]: § 6a BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__6a.html (abgerufen 20.11.2026)
[^10]: § 1 UVG, https://www.gesetze-im-internet.de/uhvorschg/__1.html (abgerufen 20.11.2026)
[^11]: Dreizehntes Gesetz zur Änderung des SGB II und anderer Gesetze vom 16.04.2026, BGBl. 2026 I Nr. 107 (Änderungen ab 01.07.2026); Fundstelle laut Synopse https://www.buzer.de/gesetz/2602/v338903-2026-07-01.htm (abgerufen 20.11.2026; nicht amtlich, Fundstelle im BGBl. gegenprüfen)
[^12]: Fünfte Mindestlohnanpassungsverordnung (MiLoV 5): 13,90 € ab 01.01.2026, 14,60 € ab 01.01.2027, https://www.gesetze-im-internet.de/milov5/BJNR10C0A0025.html (abgerufen 20.11.2026)
[^13]: Entwurf eines Haushaltsbegleitgesetzes 2027, BR-Drs. 442/26 vom 14.08.2026, https://dserver.bundestag.de/brd/2026/0442-26.pdf (abgerufen 20.11.2026; Entwurf, keine Beträge der Regelbedarfe)
[^14]: Bundesregierung, „Wohngeld wird neu geordnet“, 06.07.2026, https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/neuordnung-wohngeld-2445796 (abgerufen 20.11.2026); Stand des Verfahrens laut Presse (gegen-hartz.de, 16.11.2026, nicht amtlich): Formeländerung und Heizkosten-Halbierung sollen entfallen, Erhöhung bleibt ausgesetzt
