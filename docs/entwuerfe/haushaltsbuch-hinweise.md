# Entwurf: Hinweise im Haushaltsbuch zu Mehrbedarf, Erspartem, Pflege- und Steuer-Belegen

Stand: 20.11.2026. Code-Grundlage: `origin/main` (gelesen mit `git show origin/main:<pfad>`). Zeilenangaben beziehen sich auf `origin/main:src/haushalt.js` (848 Zeilen).
Parallele Branches mit Überschneidung: `claude/b-energie` (haushalt.js +330 Zeilen, neuer Hinweis `energie` Prio 75, `leer()` um `energie` erweitert), b-fristen (Arbeitsstand `/home/claude/w-fristen`: `startHinweis()` gibt an `ctx.fristenNeu` ab), Entwurf b-schuldenliste (`csvFeld`-Export aus haushalt.js).

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Im Haushaltsplan und im Haushaltsbuch kommt höchstens **ein** neuer Hinweis aus diesen vier Themen. Er steht in derselben Hinweis-Box wie heute (`#hbHinweise`) und lässt sich wegklicken („Nicht mehr zeigen“).
2. **Mehrbedarf**: Wer Grundsicherungsgeld oder Sozialhilfe bekommt (oder laut Check bekommen könnte) und Ausgaben zu Schwangerschaft, Boiler/Durchlauferhitzer (Strom), besonderer Ernährung oder einem dauernden Sonderbedarf einträgt, sieht: „Dafür gibt es vielleicht mehr Geld.“
3. **Erspartes**: Kommt das Ersparte aus dem Check (plus das, was laut Plan jeden Monat übrig bleibt) nah an die Vermögensgrenze einer Leistung, kommt ein ruhiger Hinweis mit der Grenze und der Quelle.
4. **Belege**: Jede Buchung kann ein Häkchen „Beleg aufheben“ bekommen, mit „für die Steuer“ und/oder „für die Pflegekasse“. Passende Notizen (z. B. „Pflegedienst“, „Handwerker“, „Apotheke“) schlagen das Häkchen vor. Unter „Auswertung“ gibt es eine Belegliste zum Ausdrucken bzw. als CSV.
5. **Pflege-Frist**: Im November/Dezember 2026 ein Hinweis, Entlastungsbetrag-Belege bald einzureichen, weil die Pflegereform (nur Entwurf, BT-Drs. 21/8869) den Entlastungsbetrag ab 2027 ersetzen will: ohne Ansparen und bei Pflegegrad 1 ganz ohne Ersatz in Geld (möglich, nicht beschlossen).

---

## 2. Inhalte und Texte (Deutsch + Einfache Sprache)

Schlüssel im Stil `hb.hw.<art>` (Hinweistext) und `hb.hw.<art>.d` (Aufklappen „Mehr dazu“), wie `hb.hw.wb`/`hb.hw.wb.d` in `src/lang/haushalt/de.json`. Zahlen kommen als Platzhalter aus `RULES` (wegen `test/test-feste-zahlen.js` und `test-sprachen-zahlen.js` keine festen Beträge im Text). Fußnoten → Abschnitt 2.6.

### 2.1 Mehrbedarf (`art: 'mb'`, Unterart `h.was`; nicht `mehr`: `hb.hw.mehr` ist schon der Text „Mehr dazu“ in `hinweisElement`)

| Schlüssel | Deutsch | Einfache Sprache (`src/lang/einfach/haushalt.json`) |
|---|---|---|
| `hb.hw.mb.schwanger` | Du bist schwanger? Ab der 13. Woche gibt es beim Grundsicherungsgeld und bei der Sozialhilfe einen Mehrbedarf (mehr Geld im Monat). Sag es dem Amt.¹ | Du bekommst ein Baby? Ab der 13. Woche gibt es mehr Geld. Das heißt Mehrbedarf. |
| `hb.hw.mb.schwanger.d` | Der Mehrbedarf ist {p} % des Regelbedarfs und gilt bis zum Ende des Monats der Geburt.¹ Zusätzlich gibt es Geld für die Erstausstattung (Babysachen, Umstandskleidung), das man extra beantragen muss.² Zeig dem Jobcenter oder Sozialamt den Mutterpass oder eine Bescheinigung. | Du bekommst dann jeden Monat etwas mehr Geld. Bis zum Monat der Geburt. Für Babysachen gibt es extra Geld. Dafür musst du einen Antrag stellen. Zeig den Mutterpass beim Amt. |
| `hb.hw.mb.ww` | Machst du Warmwasser mit Boiler oder Durchlauferhitzer in der Wohnung? Dann ist dafür ein Mehrbedarf möglich.³ | Machst du warmes Wasser mit Strom in der Wohnung? Zum Beispiel mit einem Boiler? Dann gibt es vielleicht mehr Geld. |
| `hb.hw.mb.ww.d` | Für Erwachsene sind es {p} % des Regelbedarfs, für Kinder weniger.³ Das gilt nur, wenn das Amt das Warmwasser nicht schon mit den Heizkosten bezahlt.³ Sag dem Amt, wie das Warmwasser in deiner Wohnung gemacht wird. Höhere Kosten zählen nur mit eigenem Zähler.³ | Für Erwachsene gibt es etwas mehr als für Kinder. Das gilt nur, wenn das Amt das warme Wasser nicht schon bezahlt. Sag dem Amt: Das warme Wasser kommt aus einem Gerät in der Wohnung. |
| `hb.hw.mb.ern` | Brauchst du wegen einer Krankheit besonderes Essen? Dann ist mehr Geld möglich.⁴ | Bist du krank und brauchst besonderes Essen? Dann gibt es vielleicht mehr Geld. |
| `hb.hw.mb.ern.d` | Das Gesetz nennt keinen festen Betrag („angemessene Höhe“).⁴ Die Ämter richten sich meist nach Empfehlungen des Deutschen Vereins; nicht jede Diät zählt. Du brauchst eine Bescheinigung vom Arzt. | Wie viel, steht nicht fest. Nicht jedes Essen zählt. Du brauchst ein Papier vom Arzt. |
| `hb.hw.mb.ae` | Du erziehst Kinder unter 18 allein? Dafür gibt es einen Mehrbedarf. Prüf im Bescheid, ob er drin steht.⁵ | Du bist allein mit deinen Kindern? Dann gibt es mehr Geld. Schau im Bescheid nach, ob es drin steht. |
| `hb.hw.mb.ae.d` | Die Höhe hängt von Zahl und Alter der Kinder ab, höchstens {max} % des Regelbedarfs.⁵ Er steht dir zu, wenn du allein für die Kinder sorgst. Fehlt er im Bescheid: Widerspruch innerhalb eines Monats, nachdem du den Bescheid bekommen hast.²⁶ | Wie viel, hängt von den Kindern ab. Fehlt das Geld im Bescheid? Dann schreib einen Widerspruch. Dafür hast du einen Monat Zeit. |
| `hb.hw.mb.beh` | Mit einer Behinderung gibt es in bestimmten Fällen einen Mehrbedarf, z. B. bei Hilfe für Arbeit oder Ausbildung oder mit Merkzeichen G.⁶ | Hast du eine Behinderung? Dann gibt es in manchen Fällen mehr Geld. |
| `hb.hw.mb.beh.d` | Beim Grundsicherungsgeld: {p} % bei Leistungen zur Teilhabe am Arbeitsleben.⁶ Bei der Sozialhilfe auch mit Merkzeichen G ab Rentenalter oder bei voller Erwerbsminderung.⁷ Der Leistungs-Check rechnet das schon ein, wenn du es dort angibst. | Der Leistungs-Check rechnet das mit. Gib dort die Behinderung an. |
| `hb.hw.mb.dauer` | Hast du jeden Monat Kosten, die du nicht vermeiden kannst und die viel höher sind als üblich? Dann ist ein Mehrbedarf möglich.⁸ | Musst du jeden Monat für etwas Besonderes viel bezahlen? Und es geht nicht anders? Dann gibt es vielleicht mehr Geld. |
| `hb.hw.mb.dauer.d` | Beispiele aus der Praxis: Fahrten zum Kind beim Umgang, Pflege- und Hygienemittel bei bestimmten Krankheiten. Das Amt prüft jeden Fall einzeln; nur „unabweisbare“ Kosten zählen.⁸ Bei der Sozialhilfe heißt das „höherer Regelsatz“.⁸ Schreib die Kosten auf und heb die Belege auf. | Zum Beispiel: Fahrten zu deinem Kind. Das Amt prüft das genau. Heb alle Belege auf. |
| `hb.hw.mb.melden` (Knopf) | Zum Leistungs-Check | Zum Leistungs-Check |

### 2.2 Erspartes und Vermögensgrenzen (`art: 'verm'`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.hw.verm` | Dein Erspartes ({b}) ist nah an der Grenze für {l} ({g}). | Du hast {b} gespart. Bei {l} ist die Grenze {g}. Du bist nah dran. |
| `hb.hw.verm.bald` | Wenn jeden Monat etwa {r} übrig bleibt, erreichst du in etwa {n} Monaten die Grenze für {l} ({g}). | Jeden Monat bleiben etwa {r} übrig. Dann bist du in {n} Monaten an der Grenze für {l} ({g}). |
| `hb.hw.verm.d` (ggeld) | Beim Grundsicherungsgeld zählt Erspartes über dem Freibetrag. Seit 1.7.2026 hängt er vom Alter ab: unter 30 Jahren {a} €, ab 30 {b} €, ab 40 {c} €, ab 50 {d} € je Person.⁹ Hat dein Bewilligungszeitraum vor dem 1.7.2026 begonnen, gelten bis zu seinem Ende noch die alten Regeln mit anderen Beträgen.¹⁰ Ein selbst bewohntes Haus oder eine Eigentumswohnung in üblicher Größe zählt nicht mit.⁹ | Beim Grundsicherungsgeld darfst du etwas Geld behalten. Wie viel, hängt vom Alter ab. Mehr Geld musst du zuerst selbst ausgeben. |
| `hb.hw.verm.d` (gsa) | Bei der Sozialhilfe (z. B. Grundsicherung im Alter) bleiben {a} € je erwachsener Person frei, dazu {k} € für jede Person, die überwiegend unterhalten wird.¹¹ ¹² | Bei der Sozialhilfe darfst du {a} € behalten. |
| `hb.hw.verm.d` (wohngeld) | Das Wohngeldgesetz nennt keinen Betrag, nur „erhebliches Vermögen“.¹³ Die Wohngeldstellen nehmen in der Regel {g1} € für die erste und {g2} € für jede weitere Person.¹⁴ Das ist ein Richtwert, keine feste Grenze: Es kommt auf den Einzelfall an.¹⁴ | Beim Wohngeld gibt es keine feste Grenze im Gesetz. Die Ämter rechnen meist mit {g1} €. |
| `hb.hw.verm.d` (kiz) | Beim Kinderzuschlag bleiben {a} € für die antragstellende Person und {b} € für jede weitere Person frei.¹⁵ Liegt nur wenig darüber, wird oft nur der erste Monat gekürzt.¹⁵ | Beim Kinderzuschlag darfst du {a} € behalten, für jede weitere Person {b} € mehr. |
| `hb.hw.verm.d2` (immer angehängt) | Das ist nur eine Orientierung. Was genau zählt (Konto, Auto, Altersvorsorge), prüft das Amt. Gib Erspartes nicht extra aus und verschenk es nicht, nur um eine Leistung zu bekommen: Das Amt kann dann kürzen oder Geld zurückfordern.²⁷ Die Zahl „Erspartes“ kommt aus dem Leistungs-Check. | Das ist nur ein Tipp. Das Amt prüft genau. Gib das Geld nicht extra aus. Verschenk es nicht. Sonst kann das Amt Geld zurückfordern. |
| `hb.hw.verm.check` (Knopf) | Erspartes im Check ändern | Erspartes ändern |

### 2.3 Pflege-Belege (`art: 'pflege'`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.hw.pflege` | Du hast Pflege-Belege über {b} markiert. Reich sie bei der Pflegekasse ein. Dann kannst du Geld zurückbekommen. | Du hast Belege für die Pflege. Zusammen {b}. Schick sie an die Pflegekasse. Dann bekommst du vielleicht Geld zurück. |
| `hb.hw.pflege.d` | Den Entlastungsbetrag ({e} € im Monat, ab Pflegegrad 1) zahlt die Pflegekasse nur gegen Belege zurück, z. B. für anerkannte Alltagshilfe, Tagespflege oder Kurzzeitpflege.¹⁶ Was du in einem Jahr nicht verbrauchst, kannst du nach heutigem Recht noch bis 30. Juni des nächsten Jahres nutzen.¹⁷ Pflegehilfsmittel zum Verbrauch (z. B. Handschuhe, Bettschutz) bezahlt die Kasse bis {h} € im Monat.¹⁸ Für Verhinderungs- und Kurzzeitpflege gibt es ab Pflegegrad 2 zusammen bis zu {j} € im Jahr.¹⁹ | Die Pflegekasse gibt dir Geld zurück. Dafür brauchst du Belege. Jeden Monat bis {e} €. Nicht ausgegebenes Geld kannst du heute noch bis zum 30. Juni im nächsten Jahr nutzen. |
| `hb.hw.pflege.frist` (nur 1.11.–31.12.2026) | Pflege: Ab 2027 soll sich der Entlastungsbetrag ändern (Gesetz noch nicht beschlossen). Nutze Reste aus 2026 möglichst noch in diesem Jahr und heb die Belege auf.²⁰ ²¹ | Achtung Pflege: Ab 2027 ändert sich vielleicht viel. Gib das Pflege-Geld für 2026 möglichst noch dieses Jahr aus. Heb die Belege auf. |
| `hb.hw.pflege.frist.d` | Das Gesetz ist noch nicht beschlossen (1. Lesung im Bundestag am 5.11.2026).²¹ Laut Entwurf soll ab 1.1.2027 ein „Sozialraumbudget“ den Entlastungsbetrag ersetzen: nur noch ab Pflegegrad 2, nur für anerkannte Alltagshilfen und ohne Ansparen. Bei Pflegegrad 1 soll es statt Geld eine Pflegebegleitung geben. Eine Übergangsregel für Reste aus 2026 steht nicht im Entwurf.²⁰ Nach heutigem Recht kannst du Reste aus 2026 bis 30.6.2027 nutzen.¹⁷ Ob das so bleibt, ist offen. Frag deine Pflegekasse. | Das Gesetz ist noch nicht fertig. Heute gilt noch: Reste aus 2026 gehen bis 30. Juni 2027. Das kann sich ändern. Frag deine Pflegekasse. |
| `hb.hw.pflege.knopf` (Knopf) | Zur Pflege | Zur Pflege |
| `hb.hw.belege` (Knopf) | Belegliste | Belege zeigen |

### 2.4 Steuer-Belege (`art: 'steuer'`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `hb.hw.steuer` | Einige Ausgaben kannst du vielleicht in der Steuererklärung angeben. Markier sie mit „Beleg aufheben“. | Manche Ausgaben helfen bei der Steuer. Heb die Belege auf. |
| `hb.hw.steuer.d` | Haushaltsnahe Dienste, Pflege und Handwerker: 20 % der Arbeitskosten, höchstens {a} € bzw. {hw} € Steuerermäßigung im Jahr. Nur mit Rechnung und Überweisung, nicht bar.²² Was die Pflegekasse oder Krankenkasse erstattet, zählt nicht.²⁸ Krankheitskosten (z. B. Zuzahlungen, Brille) zählen über einer „zumutbaren Belastung“.²³ Mit Behinderung gibt es einen Pauschbetrag, wer unentgeltlich pflegt, einen Pflege-Pauschbetrag (Pflegegrad 2: {p2} €, 3: {p3} €, 4 und 5: {p4} €).²⁴ Arbeitsmittel sind Werbungskosten; sie lohnen sich, wenn alles zusammen mehr als {wk} € im Jahr ist.²⁵ Wer kein oder wenig zu versteuerndes Einkommen hat, hat davon meist nichts. | Das gilt für: Hilfe im Haushalt, Handwerker, Arzt-Kosten, Sachen für die Arbeit. Bezahl Handwerker per Überweisung, nicht bar. Hast du wenig Einkommen? Dann bringt es oft nichts. |
| `hb.beleg` (Häkchen in der Eingabe) | Beleg aufheben | Beleg aufheben |
| `hb.beleg.st` / `hb.beleg.pf` | für die Steuer / für die Pflegekasse | für die Steuer / für die Pflege-Kasse |
| `hb.beleg.vorschlag` | Tipp: Für diese Ausgabe lohnt es sich vielleicht, den Beleg aufzuheben. | Tipp: Heb diesen Beleg auf. |
| `hb.beleg.bar` (bei Steuer + Notiz „bar“) | Achtung: Bar bezahlte Handwerker- und Haushaltsrechnungen zählen bei der Steuer nicht.²² | Bar bezahlt zählt nicht. Bezahl per Überweisung. |
| `hb.beleg.kurz` (Liste) | Beleg | Beleg |
| `hb.bl.h` | Belege {j} | Belege {j} |
| `hb.bl.st` / `hb.bl.pf` | Für die Steuer: {n} Belege, zusammen {b} / Für die Pflegekasse: {n} Belege, zusammen {b} | gleich |
| `hb.bl.leer` | Noch keine Belege markiert. | Du hast noch keine Belege. |
| `hb.bl.drucken` / `hb.bl.csv` | Liste drucken / Als Tabelle teilen (CSV) | Drucken / Als Tabelle teilen |
| `hb.bl.hinweis` | Die Liste ersetzt nicht die Belege. Heb die Originale (Papier oder Foto) auf. | Heb die echten Belege auf. Die Liste reicht nicht. |

Alle Texte sind in 13 Sprachen nötig (`src/lang/haushalt/*.json`) und in Einfacher Sprache (`src/lang/einfach/haushalt.json`). Gesetzesangaben (§) bleiben im Original, wie in `hb.hw.ek.d`.

### 2.5 Wann welcher Hinweis (Regeln, reine App-Auslöser markiert)

| Hinweis | Auslöser | Nicht zeigen, wenn |
|---|---|---|
| `mb.schwanger` | `sgb` (wie Z. 237: Bezug Grundsicherungsgeld/Sozialamt oder Check `ggeld`/`gsa` = ja/vielleicht) **und** Notiz passt `WORTE.schwanger` (`/schwanger\|umstands\|mutterpass\|baby(ausstattung\|erstausstattung)/i` – ohne „Frauenarzt“ und „Kinderwagen“: zu viele falsche Treffer bei einer sehr persönlichen Frage) | `weg['mb-schwanger']`; Check hat `schwanger` angehakt (dann ist er schon drin) |
| `mb.ww` | `sgb` und Notiz `WORTE.ww` (`/boiler\|durchlauferhitzer\|warmwasserspeicher/i` – ohne „Therme“: Gas-Therme läuft meist über die Heizkosten, dann kein Mehrbedarf, § 21 Abs. 7 Satz 1) | Check `warmwasser` angehakt |
| `mb.ern` | `sgb` und Notiz `WORTE.ern` (`/di(ä\|ae)t\|glutenfrei\|z(ö\|oe)liakie\|laktosefrei\|sondennahrung\|ern(ä\|ae)hrung/i`) | Check `ernaehrung` angehakt |
| `mb.ae` | Bezug Grundsicherungsgeld/Sozialamt **und** `adults === 1 && kids > 0` laut Check | nur einmal (wegklicken) |
| `mb.beh` | `sgb` und Check `gdb` gesetzt (nicht `'antrag'`), aber `teilhabe`/`mzG` nicht angehakt | – |
| `mb.dauer` | `sgb` und eine **wiederkehrende** Buchung (`w: true`) in `sonst` mit Notiz `WORTE.dauer` (`/umgang\|besuch.*kind\|fahrt.*kind\|hygiene\|inkontinenz\|medikament/i`) | – |
| `verm` | Für jede Leistung L ∈ {ggeld, gsa, wohngeld, kiz} mit Bezug oder Check-Ergebnis ja/vielleicht: `V = Erspartes laut Check`, `G = Grenze L` (aus Rules). Hinweis, wenn `V ≥ 0,8 × G` (**App-Regel, kein Gesetz**) oder `rest > 0` und `V + 6 × rest > G` (**App-Regel**). Bei mehreren L: die kleinste Grenze. | `V > G` (dann zeigt der Check schon „nein“ mit Grund `vermHoch`); `weg['verm-'+L+'-'+G]` (neue Grenze, z. B. Geburtstag 30/40/50, zeigt ihn wieder) |
| `pflege` | Summe der Buchungen mit `bp: true` im laufenden + vorigen Kalenderhalbjahr > 0 und nicht weggeklickt (`weg['pflege-'+Halbjahr]`) | – |
| `pflege.frist` | Check `pflegegrad` 1–5 (oder Pflege-Belege vorhanden) **und** heute zwischen 1.11.2026 und 31.12.2026 **und** `RULES.pnog.stand === 'entwurf'` (bei Verkündung oder Scheitern Wert ändern → Hinweis verschwindet, neuer Text nötig) | `weg['pflege-frist-2026']` |
| `steuer` | Erstmals eine Buchung, deren Notiz `WORTE.steuer` passt (`/handwerker\|reinigung\|haushaltshilfe\|gärtner\|gaertner\|schornstein\|pflegedienst\|apotheke\|zuzahlung\|brille\|zahnarzt\|arbeitsmittel\|fachbuch\|laptop.*arbeit/i`) und die noch kein Beleg-Häkchen hat | `weg['steuer']` (einmal je Vorgang); **nicht** bei Bezug Grundsicherungsgeld/Sozialamt ohne Lohn (`bezugSgb && ek1Art !== 'lohn'`): keine Steuer, kein Nutzen (Prüfung: aus offener Frage 10 übernommen) |

**Nur ein Hinweis aus dieser Gruppe gleichzeitig:** In `hinweisListe` werden die Kandidaten erst gesammelt und nur der mit der höchsten Prio per `add` übernommen (siehe 4.2).

### 2.6 Quellen (alle abgerufen am 20.11.2026)

1. § 21 Abs. 2 SGB II (17 %, nach der 12. Schwangerschaftswoche bis Ende des Entbindungsmonats); gleich § 30 Abs. 2 SGB XII. https://www.gesetze-im-internet.de/sgb_2/__21.html
2. § 24 Abs. 3 Satz 1 Nr. 2 SGB II (Erstausstattung bei Schwangerschaft und Geburt, gesondert erbracht); § 37 Abs. 1 Satz 2 SGB II (Leistungen nach § 24 Abs. 3 „gesondert zu beantragen“); Sozialhilfe: § 31 Abs. 1 Nr. 2 SGB XII. https://www.gesetze-im-internet.de/sgb_2/__24.html , https://www.gesetze-im-internet.de/sgb_2/__37.html , https://www.gesetze-im-internet.de/sgb_12/__31.html (Wortlaut am 20.11.2026 geprüft)
3. § 21 Abs. 7 SGB II (nur „soweit … deshalb keine Bedarfe für zentral bereitgestelltes Warmwasser nach § 22 anerkannt werden“; 2,3 % / 1,4 % / 1,2 % / 0,8 %; höhere Kosten nur mit separater Messeinrichtung); § 30 Abs. 7 SGB XII. URL wie 1. Werte = `RULES.mehr.ww`.
4. § 21 Abs. 5 SGB II („in angemessener Höhe“). URL wie 1. Sozialhilfe: § 30 Abs. 5 SGB XII hat einen anderen Wortlaut („ernährungsbedingter Mehrbedarf“, Aufwendungen „unausweichlich und in mehr als geringem Umfang“ über dem Durchschnitt; ebenfalls kein Betrag). https://www.gesetze-im-internet.de/sgb_12/__30.html
5. § 21 Abs. 3 SGB II (36 % / 12 % je Kind, höchstens 60 %); § 30 Abs. 3 SGB XII. URL wie 1. Werte = `RULES.mehr.ae36/aeJeKind/aeMax`.
6. § 21 Abs. 4 SGB II (35 %). URL wie 1.
7. § 30 Abs. 1 SGB XII (Merkzeichen G, 17 %, ab Altersgrenze oder bei voller Erwerbsminderung), in der App `RULES.mehr.g`; beim Grundsicherungsgeld für nicht Erwerbsfähige ebenso § 23 Nr. 4 SGB II. https://www.gesetze-im-internet.de/sgb_12/__30.html
8. § 21 Abs. 6 SGB II (unabweisbarer, besonderer Bedarf; einmalig nur, wenn Darlehen nach § 24 Abs. 1 nicht möglich/zumutbar). URL wie 1. Sozialhilfe: laufender Sonderbedarf über § 27a Abs. 4 Satz 1 Nr. 2 SGB XII (abweichende Regelsatzfestsetzung, Bedarf „für eine Dauer von voraussichtlich mehr als einem Monat … unausweichlich in mehr als geringem Umfang“ über dem Durchschnitt); § 30 Abs. 10 SGB XII gilt nur für **einmalige** Bedarfe. https://www.gesetze-im-internet.de/sgb_12/__27a.html
9. § 12 Abs. 2 SGB II (Fassung seit 1.7.2026): „bis zur Vollendung des 30. Lebensjahres 5 000“, „ab dem 31. Lebensjahr 10 000“, „ab dem 41. Lebensjahr 12 500“, „ab dem 51. Lebensjahr 20 000“ Euro je Person der Bedarfsgemeinschaft; höherer Betrag ab Beginn des Monats, in dem die Altersgrenze erreicht wird (also ab dem Monat des 30./40./50. Geburtstags); nicht ausgeschöpfte Freibeträge werden übertragen. § 12 Abs. 1 Satz 2 Nr. 5: selbst genutztes Haus bis 140 m² / Eigentumswohnung bis 130 m² (+20 m² je Person ab der fünften) zählt nicht; Satz 3: in der Karenzzeit (ein Jahr, § 22 Abs. 1 Satz 2) ohne Größenprüfung. https://www.gesetze-im-internet.de/sgb_2/__12.html ; ergänzend BA, Fachliche Weisungen § 12 SGB II, Stand 01.07.2026, Rz. 12.36–12.38 (Beispiel: 30. Geburtstag am 12.8. → ab August 10.000 €). https://www.arbeitsagentur.de/datei/fw-zu-par-12-sgb2-beruecksichtigung-von-vermoegen_ba058027.pdf (= `RULES.sgb2.schon`)
10. § 65a Abs. 1 SGB II: „Für Bewilligungszeiträume, die vor dem 1. Juli 2026 begonnen haben, ist § 12 in der bis einschließlich 30. Juni 2026 geltenden Fassung weiter anzuwenden.“ https://www.gesetze-im-internet.de/sgb_2/__65a.html ; Regel-Bewilligungszeitraum ein Jahr: § 41 Abs. 3 Satz 1 SGB II (https://www.gesetze-im-internet.de/sgb_2/__41.html) → Altfälle längstens bis 30.6.2027. Alte Beträge (15.000 € je Person, in der Karenzzeit 40.000 € + 15.000 €; Bürgergeld-Gesetz, BGBl. 2022 I S. 2328) am 20.11.2026 **nicht** amtlich abgerufen → nicht im Nutzertext genannt.
11. § 90 Abs. 2 Nr. 9 SGB XII. https://www.gesetze-im-internet.de/sgb_12/__90.html
12. § 1 VO zu § 90 Abs. 2 Nr. 9 SGB XII: 10.000 € je volljährige Person, 500 € je überwiegend unterhaltene Person. https://www.gesetze-im-internet.de/bshg_88abs2dv_1988/__1.html (= `RULES.grundsicherung.schonAllein`)
13. § 21 Nr. 3 WoGG („erhebliches Vermögen“). https://www.gesetze-im-internet.de/wogg/__21.html
14. Wohngeld-Verwaltungsvorschrift (WoGVwV) Teil A Nr. 21.37 Abs. 1: erhebliches Vermögen „in der Regel“, wenn das verwertbare Vermögen 60 000 Euro für das erste und 30 000 Euro für jedes weitere zu berücksichtigende Haushaltsmitglied übersteigt. Amtlich: https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_28062017_SWII4.htm (Portal der Bundesregierung; Kommentar „nur Sekundärquellen“ in `RULES.wohngeld` kann damit ersetzt werden). Einordnung: VG München, Urteil vom 30.07.2026, M 22 K 25.3366: „Orientierungswert ohne starre Bindungswirkung“; auch Vermögen darunter kann im Einzelfall schaden, darüber unschädlich sein. https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2026-N-23047
15. § 6a Abs. 3 Satz 5 BKGG („Abweichend von § 12 Absatz 2 Satz 1“ SGB II): 40.000 € für die berechtigte Person, 15.000 € je weiteres Mitglied der Bedarfsgemeinschaft; Satz 6 und 7: Übersteigendes Vermögen mindert den Kinderzuschlag des ersten Monats, der Anspruch entfällt nur, wenn es ihn ganz aufzehrt; für Eltern entsprechend Abs. 5 Satz 3, Abs. 6 Satz 5. https://www.gesetze-im-internet.de/bkgg_1996/__6a.html (= `RULES.kiz.vermZwei/vermDrei/vermJeWeiteres`; {a} = `vermZwei − vermJeWeiteres` = 40.000)
16. § 45b Abs. 1 Satz 1 und 3, Abs. 2 SGB XI („bis zu 131 Euro monatlich“; Tages-/Nachtpflege, Kurzzeitpflege, Pflegedienste – in Pflegegrad 2 bis 5 nicht für Selbstversorgung –, nach Landesrecht anerkannte Alltagshilfen; kein Antrag vorab; Erstattung gegen Belege, Leistungsart erkennbar). https://www.gesetze-im-internet.de/sgb_11/__45b.html (= `RULES.pflege.entlastung`)
17. § 45b Abs. 1 Satz 5 SGB XI: „wird die Leistung in einem Kalenderjahr nicht ausgeschöpft, kann der nicht verbrauchte Betrag in das folgende Kalenderhalbjahr übertragen werden“ (also bis 30.6. des Folgejahres; die **Leistung** muss bis dahin genutzt sein). https://www.gesetze-im-internet.de/sgb_11/__45b.html ; ergänzend gesund.bund.de (BMG), „Entlastungsbetrag“. https://gesund.bund.de/entlastungsbetrag
18. § 40 Abs. 2 SGB XI („dürfen monatlich den Betrag von 42 Euro nicht übersteigen“, auch als Kostenerstattung; Bekanntmachung 14.11.2024 zu Beträgen ab 1.1.2025). https://www.gesetze-im-internet.de/sgb_11/__40.html (neu in RULES: `pflege.hilfsmittel: 42`)
19. § 42a SGB XI (gemeinsamer Jahresbetrag bis 3.539 € je Kalenderjahr, ab Pflegegrad 2, Verhinderungs- und Kurzzeitpflege). https://www.gesetze-im-internet.de/sgb_11/__42a.html (= `RULES.entlastungsbudget`)
20. Gesetzentwurf der Bundesregierung, Pflegeneuordnungsgesetz, BT-Drs. 21/8869 vom 02.11.2026 (Vorabfassung), am 20.11.2026 im Volltext gelesen: https://dserver.bundestag.de/btd/21/088/2108869.pdf . Art. 1, § 45b SGB XI-E „Sozialraumbudget“: nur „mit Pflegegrad 2 bis 5“, „monatlich bis zu 175 Euro“ (unter 25 Jahren 300 Euro), nur für Angebote zur Unterstützung im Alltag (§ 45a), Erstattung weiter gegen Belege; der Satz zum Übertrag ins folgende Kalenderhalbjahr fehlt; Begründung zu § 45b Abs. 1: „Ansparmöglichkeit nicht weiter erforderlich“, Pflegegrad 1: statt Entlastungsbetrag Pflegebegleitung (§ 7c-E). § 39 SGB XI-E „Überbrückungsbudget“ bis 2.285 Euro je Kalenderjahr (Pflegegrad 2 bis 5) statt Verhinderungspflege/gemeinsamem Jahresbetrag. 42 Euro für Verbrauchs-Pflegehilfsmittel „keine eigenständige Leistung mehr“ (Teil des Entlastungsbudgets § 37-E). § 144-E: **keine** Übergangsregel für nicht verbrauchte Entlastungsbeträge aus 2026. Art. 11 Abs. 1: Inkrafttreten 1. Januar 2027 (Teile 2028/2029). Alles Entwurf, Änderungen im Verfahren möglich. (DAK-Seite nur noch ergänzend: https://www.dak.de/dak/leistungen/pflege-aenderungen-2027_234662)
21. Deutscher Bundestag, Textarchiv KW 45/2026: 1. Lesung PNOG am 5.11.2026, Drs. 21/8869, überwiesen, federführend Gesundheitsausschuss. https://www.bundestag.de/dokumente/textarchiv/2026/kw45-de-pflegeneuordnungsgesetz-1225076 ; BMG Verfahrensstand, Seite „Laufendes Verfahren“, Stand 19.11.2026 (Referentenentwurf 05.06.2026, Kabinett 30.09.2026, 1. Lesung 05.11.2026, Bundesrat 1. Durchgang 20.11.2026). https://www.bundesgesundheitsministerium.de/service/gesetze-und-verordnungen/detail/pflegeneuordnungsgesetz-pnog.html
22. § 35a EStG: Abs. 1 Minijob 20 %, höchstens 510 €; Abs. 2 haushaltsnahe Dienstleistungen/Pflege 20 %, höchstens 4.000 €; Abs. 3 Handwerker 20 %, höchstens 1.200 €; Abs. 5 Satz 3 Rechnung und Zahlung auf das Konto des Leistenden. https://www.gesetze-im-internet.de/estg/__35a.html
23. § 33 Abs. 3 EStG (zumutbare Belastung 1–7 % je nach Einkünften 15.340 € / 51.130 € und Kinderzahl). https://www.gesetze-im-internet.de/estg/__33.html
24. § 33b Abs. 3 EStG (GdB 20: 384 € … 100: 2.840 €; H/Bl/TBl 7.400 €), Abs. 6 Pflege-Pauschbetrag (PG 2: 600 €, PG 3: 1.100 €, PG 4/5 oder H: 1.800 €; unentgeltlich, persönlich, in der Wohnung; IdNr. der gepflegten Person). https://www.gesetze-im-internet.de/estg/__33b.html (= `RULES.pflegePausch`)
25. § 9a Satz 1 Nr. 1 Buchst. a EStG (Arbeitnehmer-Pauschbetrag 1.230 €). https://www.gesetze-im-internet.de/estg/__9a.html
26. § 84 Abs. 1 Satz 1 SGG (Widerspruch „binnen eines Monats, nachdem der Verwaltungsakt dem Beschwerten bekanntgegeben worden ist“). https://www.gesetze-im-internet.de/sgg/__84.html
27. § 34 Abs. 1 SGB II (Ersatzanspruch, wer die Hilfebedürftigkeit vorsätzlich oder grob fahrlässig ohne wichtigen Grund herbeiführt, erhöht oder aufrechterhält). https://www.gesetze-im-internet.de/sgb_2/__34.html ; § 26 Abs. 1 Satz 1 Nr. 1 SGB XII (Einschränkung der Leistung, wenn Vermögen in der Absicht vermindert wurde, Leistungen zu bekommen). https://www.gesetze-im-internet.de/sgb_12/__26.html
28. § 35a Abs. 1 bis 3 EStG („Aufwendungen des Steuerpflichtigen“) und § 33 Abs. 1 EStG: nur selbst getragene Kosten. Einzelheiten zur Anrechnung von Leistungen der Pflegeversicherung: BMF-Schreiben vom 9.11.2016 zu § 35a EStG (BStBl I S. 1213) – am 20.11.2026 **nicht** abgerufen, vor dem Einbau gegenlesen.

---

## 3. Zahlen und Regeln

| Wert | Betrag | Quelle (Nr. oben) | Abruf | gültig ab | gültig bis / Änderung |
|---|---|---|---|---|---|
| Mehrbedarf Schwangerschaft | 17 % RB | 1 | 20.11.2026 | – | keine Änderung bekannt |
| Mehrbedarf Alleinerziehende | 36 % / 12 % je Kind, max. 60 % | 5 | 20.11.2026 | – | – |
| Mehrbedarf Behinderung (Teilhabe) | 35 % | 6 | 20.11.2026 | – | – |
| Mehrbedarf Merkzeichen G (SGB XII) | 17 % | 7 | (in App) | – | – |
| Warmwasser dezentral | 2,3 / 1,4 / 1,2 / 0,8 % | 3 | 20.11.2026 | – | – |
| Kostenaufwändige Ernährung | kein Betrag im Gesetz (App: „möglich“) | 4 | 20.11.2026 | – | – |
| Schonvermögen SGB II (Neue Grundsicherung) | 5.000 / 10.000 / 12.500 / 20.000 € je Person (unter 30 / ab 30 / ab 40 / ab 50 Jahren, ab dem Monat des Geburtstags) | 9 | 20.11.2026 | 1.7.2026 (für BWZ ab dann) | § 12 a. F. für BWZ mit Beginn vor 1.7.2026 (§ 65a Abs. 1), in der Regel längstens bis 30.6.2027 (§ 41 Abs. 3: „in der Regel für ein Jahr“) |
| Schonvermögen SGB XII | 10.000 € je Volljährigem + 500 € je Unterhaltenem | 11, 12 | 20.11.2026 | 1.1.2023 (lt. App) | – |
| Wohngeld „erhebliches Vermögen“ | Richtwert 60.000 € + 30.000 € je weitere Person (WoGVwV 21.37, „in der Regel“) | 13, 14 | 20.11.2026 | – | Verwaltungsvorschrift, kein Gesetz; gerichtlich nicht bindend → „möglich“ |
| Kinderzuschlag Vermögen | 40.000 € + 15.000 € je weitere Person | 15 | 20.11.2026 | – | durch die Reform nicht geändert (Verweis jetzt auf § 12 Abs. 2 Satz 1 SGB II) |
| Entlastungsbetrag | 131 €/Monat, Reste bis 30.6. Folgejahr | 16, 17 | 20.11.2026 | 1.1.2025 | PNOG-Entwurf (20): ab 1.1.2027 Sozialraumbudget 175 € (unter 25 J. 300 €), nur Pflegegrad 2–5, nur Alltagshilfen, ohne Ansparen; Pflegegrad 1 ohne Geldbetrag (nicht beschlossen) |
| Pflegehilfsmittel zum Verbrauch | 42 €/Monat | 18 | 20.11.2026 | 1.1.2025 | PNOG-Entwurf (20): keine eigene Leistung mehr |
| Gemeinsamer Jahresbetrag | 3.539 €/Jahr ab PG 2 | 19 | 20.11.2026 | 1.7.2025 | PNOG-Entwurf (20): entfällt, „Überbrückungsbudget“ bis 2.285 €/Jahr (§ 39-E) |
| § 35a EStG | 20 %; max. 510 € / 4.000 € / 1.200 € | 22 | 20.11.2026 | – | keine Änderung für 2027 gefunden |
| § 33b Behinderten-Pauschbetrag | 384 … 2.840 €; 7.400 € | 24 | 20.11.2026 | VZ 2021 | – |
| § 33b Pflege-Pauschbetrag | 600 / 1.100 / 1.800 € | 24 | 20.11.2026 | VZ 2021 | Abs. 8: Evaluierung ab Ende 2026 |
| Arbeitnehmer-Pauschbetrag | 1.230 € | 25 | 20.11.2026 | VZ 2023 | – |
| Vermögens-Hinweis „nah“ | 80 % der Grenze bzw. 6 Monate Rest | – | – | App-Regel | kein Gesetz |

Neue Einträge in `src/rules.js` → `RULES` (klein, an einer Stelle):
```js
// § 40 Abs. 2 SGB XI: Pflegehilfsmittel zum Verbrauch bis 42 € im Monat (seit 1.1.2025). Quelle: gesetze-im-internet.de/sgb_11/__40.html, abgerufen 20.11.2026
// Steuer (nur für Hinweistexte): § 35a EStG (20 %, max. 510/4.000/1.200 €), § 9a Nr. 1a EStG (1.230 €). Abgerufen 20.11.2026
// PNOG (BT-Drs. 21/8869): Stand 20.11.2026 Entwurf, 1. Lesung 5.11.2026. Bei Verkündung: pnog.stand ändern, Pflege-Hinweise und Pflege-Bereich umstellen.
pflegeHm: 42, steuer: { quote: 0.2, minijob: 510, hnd: 4000, handwerk: 1200, anPausch: 1230 }, pnog: { stand: 'entwurf' }, // 'entwurf' | 'verkuendet' | 'gescheitert'
```
Die übrigen Werte gibt es schon: `RULES.mehr`, `sgb2.schon`, `grundsicherung.schonAllein`, `wohngeld.vermoegen*`, `kiz.verm*`, `pflege.entlastung`, `entlastungsbudget`, `pflegePausch`.

---

## 4. Bauplan

### 4.1 Dateien und Konfliktlage

| Datei | Änderung | Konflikt mit |
|---|---|---|
| `src/haushalt.js` | `WORTE` (Z. 224–229) um `schwanger, ww, ern, dauer, steuer, pflegeBeleg` ergänzen; `hinweisListe` (Z. 232–262) um einen Block **ans Ende vor `return`**; `normiere` (Z. 297, Buchungen Z. 304) Felder `bs/bp`; `renderEingabe` (≈ Z. 724) Häkchen; `renderBuch` Listenzeile (≈ Z. 653) „· Beleg“; `hinweisElement` (Z. 465–493) zwei Knopf-Zweige; `hinweisDaten` (Z. 454–463) neue Felder; neue reine Funktionen `belegListe`, `belegCsv`, `vermNah`, `halbjahr`; Export im `return` (Z. 835–846) | **b-energie**: ändert `hinweisListe` (neue Zeile `energie` Prio 75 vor `nk`), `hinweisDaten` (Feld `energieNach`), `leer()`, `renderPlan`. → Meinen Block erst **nach** dem Merge von b-energie einbauen; neue Zeilen nur am Ende von `hinweisListe` und am Ende des Objekts in `hinweisDaten` anhängen; `leer()` **nicht** ändern (Felder `bs/bp` liegen an den Buchungen). **b-fristen**: ändert nur `startHinweis` (früher Ausstieg) → ich ändere `startHinweis` **nicht**. **b-schuldenliste**: evtl. `csvFeld` im Export → meine Exporte in eigener Zeile. |
| `src/rules.js` | Neue Konstanten (3.) und in `evaluate` (Z. 1997) `grenzen: { ggeld, gsa, wohngeld, kiz }` mitgeben | gering; `rules.js` ist Konfliktdatei → eine Zeile im Rückgabeobjekt, eine Zeile in `RULES` |
| `src/app.js` | `Haushalt.init` (Z. 3441–3450) um `grenzen: function () { try { return started && edited ? Rules.evaluate(state).grenzen : null; } catch (e) { return null; } }` | gering (eine Zeile, Konflikt möglich mit b-energie, falls dort ctx erweitert wird → manuell zusammenführen) |
| `src/template.html` | CSS `.hb-beleg` (Häkchen-Zeile), `.hb-bl` (Belegliste); keine neue Farbe | gering |
| `src/lang/haushalt/*.json` (13), `src/lang/einfach/haushalt.json` | neue Schlüssel (2.) | b-energie fügt ebenfalls `hb.en.*` an → Konflikte nur am Dateiende, beim Merge beide behalten |
| `docs/PRUEFLISTE.md`, Faktenblatt | neue Zahlen mit Quelle eintragen | – |

### 4.2 `hinweisListe`: neuer Block (am Ende, vor `return`)

```js
// Geld-Hinweise (Mehrbedarf, Erspartes, Pflege, Steuer): höchstens EINER gleichzeitig (Regel des Nutzers: nicht überladen)
var kand = [], k = function (id, prio, extra) { if (!weg[id]) kand.push(Object.assign({ id: id, prio: prio }, extra)); };
var hat = e.angaben || {};                     // aus dem Check: schwanger, warmwasser, ernaehrung, teilhabe, mzG, gdb, adults, kids, pflegegrad, ek1Art
var bezugSgb = !!(bz.grundsicherungsgeld || bz.sozialamt);
if (sgb) {
  if (WORTE.schwanger.test(notizen) && !hat.schwanger) k('mb-schwanger', 56, { art: 'mb', was: 'schwanger' });
  if (WORTE.ww.test(notizen) && !hat.warmwasser) k('mb-ww', 55, { art: 'mb', was: 'ww' });
  if (WORTE.ern.test(notizen) && !hat.ernaehrung) k('mb-ern', 54, { art: 'mb', was: 'ern' });
  if ((e.eintraege || []).some(function (x) { return x.w && x.k === 'sonst' && WORTE.dauer.test(x.n || ''); })) k('mb-dauer', 52, { art: 'mb', was: 'dauer' });
  if (hat.gdb && hat.gdb !== 'antrag' && !hat.teilhabe && !hat.mzG) k('mb-beh', 51, { art: 'mb', was: 'beh' });
}
if (bezugSgb && Number(hat.adults) === 1 && Number(hat.kids) > 0) k('mb-ae', 50, { art: 'mb', was: 'ae' });
var vn = vermNah(e.verm, e.grenzen, e.rest, lv, bz);   // { l, g, v, monate } oder null
if (vn) k('verm-' + vn.l + '-' + vn.g, 58, Object.assign({ art: 'verm' }, vn));
var pf = belegSumme(e.buchAlle, 'bp', halbjahr(e.heute), true);   // laufendes + voriges Halbjahr
if (pf > 0) k('pflege-' + halbjahr(e.heute), 35, { art: 'pflege', b: pf });
if (pflegeFristAktiv(e.heute, e.pnog) && (hat.pflegegrad >= 1 || pf > 0)) k('pflege-frist-2026', 65, { art: 'pflege', frist: true });
if (!(bezugSgb && hat.ek1Art !== 'lohn') && (e.eintraege || []).some(function (x) { return !x.bs && WORTE.steuer.test(x.n || ''); })) k('steuer', 20, { art: 'steuer' });
if (kand.length) { var best = kand.sort(function (a, b) { return b.prio - a.prio; })[0]; out.push(best); }
```
- `pflegeFristAktiv(heute, pnog)`: `heute >= 2026-11-01 && heute <= 2026-12-31 && !!pnog && pnog.stand === 'entwurf'` (Prüfung: die Bedingung im ersten Entwurf war nie falsch). Ist das PNOG bis dahin verkündet, gibt es **keinen** Hinweis, bis ein neuer, geprüfter Text `hb.hw.pflege.frist2` da ist (offene Frage 2).
- `vermNah(v, grenzen, restCent, lv, bz)`: nur Leistungen mit Bezug (`bz.grundsicherungsgeld`→ggeld, `bz.sozialamt`→gsa) oder `lv[id]` ∈ {ja, vielleicht}; `v > G` → null; Treffer bei `v >= 0.8*G` oder `restCent > 0 && v*100 + 6*restCent > G*100`; `monate = ceil((G*100 - v*100)/restCent)` (nur wenn `restCent > 0`). Kleinste Grenze gewinnt. Kein Treffer ohne `v` (Check leer).
- Prio-Einordnung zu Bestehendem: wb 100, ek 90, knapp 80, energie 75 (b-energie), **pflege-frist 65**, kaputt 60, **verm 58**, **mb 50–56**, but 50, schulden 45, tarif 40, **pflege 35**, **steuer 20**. `hinweise()` (Z. 495) zeigt weiter 2 sichtbar + Rest unter „Weitere Hinweise“; neu kommt höchstens einer dazu.

`hinweisDaten` (Z. 454) am Ende des Objekts ergänzen: `angaben: angabenAusCheck(s)`, `verm: s ? Number(s.vermoegen) || null : null`, `grenzen: ctx.grenzen ? ctx.grenzen() : null`, `rest: r.leer ? 0 : r.rest`, `buchAlle: daten.buch`, `pnog: (ctx.regeln && ctx.regeln().pnog) || null`. `eintraege` bleibt wie heute (laufender + voriger Monat).

### 4.3 `hinweisElement` (Z. 465)

- Text: `h.art === 'mb'` → `t('hb.hw.mb.' + h.was, platzhalterMehr(h.was))`; `verm` → `h.monate && h.v < 0.8*h.g ? 'hb.hw.verm.bald' : 'hb.hw.verm'` mit `{ b: {eur: v}, g: {eur: g}, l: t('hb.wb.' + mapL(h.l)), r: {eur: rest/100}, n: String(monate) }`; Details: `hb.hw.verm.d.<l>` + `hb.hw.verm.d2`; `pflege` → `h.frist ? 'hb.hw.pflege.frist' : 'hb.hw.pflege'`.
  (Achtung: `hb.wb.<l>` kennt nur `sgb2, sgb12, wohngeld, kiz` → Abbildung ggeld→sgb2, gsa→sgb12.)
- Knöpfe: `mb`/`verm` → „Zum Leistungs-Check“ (`ctx.zeige('leistungen', true)`, wie Z. 475); `pflege` → `hb.hw.belege` (öffnet Reiter „Auswertung“, Belegliste) und `hb.hw.pflege.knopf` (`ctx.zeige('pflegestart', true)`); `steuer` → `hb.hw.belege`. Wegklicken wie Z. 474.
- `d.id = 'hb-hw-' + h.art` bleibt (pro Art nur ein Element, passt zur Ein-Hinweis-Regel).
- **Wichtig:** Die Zeile für den Aufklapp-Text (Z. 470, `t('hb.hw.' + h.art + '.d')`) braucht für `mb`, `verm` und `pflege` (Frist) eigene Zweige, sonst wird ein Schlüssel gesucht, den es nicht gibt. Alle Texte weiter nur über `el(…, txt)` (`textContent`) setzen, nie `innerHTML`.

### 4.4 Datenmodell (Buchung in `daten.buch`, gespeichert in `lotse.haushalt` über die Vorgänge, PIN-verschlüsselt)

```js
{ id, d: 'JJJJ-MM-TT', c: 1234, k: 'sonst', n: 'Pflegedienst Mai', w: false, bis?: 'JJJJ-MM',
  bs?: true,   // Beleg aufheben: Steuer
  bp?: true }  // Beleg aufheben: Pflegekasse
```
- `normiere` (Z. 304): nach dem Filter `x.buch = x.buch.map(function (e) { var o = { id: e.id, d: e.d, c: e.c, k: e.k, n: e.n, w: e.w }; if (e.bis) o.bis = e.bis; if (e.bs === true) o.bs = true; if (e.bp === true) o.bp = true; return o; })` – heute werden Buchungen ungefiltert übernommen; die Bereinigung ist zugleich Schutz gegen manipulierte Stände. **Prüfen**, dass dabei kein Feld verloren geht, das b-energie o. a. an Buchungen hängt (stand 20.11. keins).
- `daten.v` bleibt 1 (Felder optional, alte Stände gültig, `test-altstaende.js`).
- Speichern (`renderEingabe`, Z. 733): `e.bs = !!eingabe.bs || undefined; e.bp = …`; `neueEingabe` (Z. 634) Standard `bs: false, bp: false`; Bearbeiten (Z. 657) übernimmt `o.bs/o.bp`.
- Wiederkehrende Buchungen: Beleg-Häkchen gilt für alle Monate (eine Buchung) – für Pflegedienst-Monatsrechnungen passend.

### 4.5 Oberfläche

- **Eingabe** (`renderEingabe`, nach dem Häkchen „wiederkehrend“ Z. 724): `<fieldset class="hb-beleg">` mit Häkchen `hb-beleg` „Beleg aufheben“; nur wenn angehakt zwei weitere Häkchen `hb-beleg-st`, `hb-beleg-pf` (Standard: Steuer an). Tippt man eine Notiz, die `WORTE.steuer`/`WORTE.pflegeBeleg` (`/pflegedienst\|alltagshilfe\|alltagsbegleit\|tagespflege\|kurzzeitpflege\|verhinderungspflege\|betreuungsdienst\|inkontinenz\|einmalhandschuh\|bettschutz/i`) trifft, erscheint `hb.beleg.vorschlag` als `p.hint` (kein automatisches Anhaken). Bei Steuer + Notiz `/\bbar\b/i` zusätzlich `hb.beleg.bar` in `--warn`.
- **Liste** (`renderBuch` Z. 653): Zusatz `' · ' + t('hb.beleg.kurz')` wie bei `hb.wieder.kurz`.
- **Auswertung** (`renderAusw`): unter den Spartipps ein `<details class="hb-karte hb-bl">` „Belege {Jahr}“ mit Jahr-Umschalter (‹ ›, Muster `monatsLeiste`), zwei Summenzeilen (`hb.bl.st`, `hb.bl.pf`), Liste (Datum, Kategorie, Notiz, Betrag), `hb.bl.hinweis`, Knöpfe `hb.bl.drucken` (`ctx.textAusgeben(belegText(...))`, wie `drucken()` Z. 600) und `hb.bl.csv` (Weg wie `exportCsv()` Z. 601–620, Dateiname `Belege-<Jahr>-<steuer|pflege>.csv`).
- Reine Funktionen (Node-testbar, im Export):
  - `belegListe(buch, art /* 'bs'|'bp' */, vonIso, bisIso)` → Einträge je Monat aufgelöst (wiederkehrende über `monatsEintraege`), sortiert nach Datum.
  - `belegCsv(liste, kopf, katName)` → Spalten `Datum;Kategorie;Notiz;Betrag`, Semikolon, CRLF, `csvFeld` (Z. 160) wiederverwenden (CSV-Injection-Schutz). Notizen in der Belegliste auf dem Bildschirm nur mit `textContent` bzw. `esc()` (wie Z. 653) ausgeben. Druckblatt und CSV ohne Name/Anschrift; sie enthalten aber die Notizen (können Gesundheitsangaben sein) und liegen nach dem Teilen **außerhalb** des PIN-Schutzes → ein Satz dazu in `hb.bl.hinweis` („Die Datei ist nicht geschützt. Gib sie nur weiter, wenn du das willst.“).
  - `halbjahr(date)` → `'2026-2'`; `belegSumme(buch, art, hj, mitVorigem)`.
  - `vermNah(...)`, `pflegeFristAktiv(...)`.
- **Querverbindungen**: Leistungs-Check (Knopf, Ersparnis-Feld `vermoegen`), Pflege-Bereich (`ctx.zeige('pflegestart', true)`; dort umgekehrt in der Unterstützungs-Karte „Entlastungsbetrag“ ein Satz „Belege im Haushaltsbuch markieren“ mit Knopf `ctx.zeige('haushalt')` – optional, eigene kleine Aufgabe, Konflikt mit `erweiterungen/pflege*.js` vermeiden), Fristen (nach Merge b-fristen: Pflege-Frist 30.6. **nicht** im Haushalt-`startHinweis`, sondern als Vorschlag `art: 'frist'` in der Fristenliste – offene Frage 4).
- **Farben** (docs/FARBEN.md): Hinweis-Box wie bisher (`.hb-hinweis`, keine Gruppenfarbe). Häkchen in `--accent`. Pflege-Knopf `btn ghost klein` ohne Bereichsfarbe; wenn farbig gewünscht: Rand `--c-pflege-t`. `hb.beleg.bar` in `--warn` (Warnung). Keine neue Kachel-/Knopfgruppe → keine Doppel-Farben-Prüfung nötig.

### 4.6 Tests

`test/test-haushalt.js` (Node, `heute = new Date(2026, 10, 20)`):
1. Mehrbedarf nur mit `sgb`: Notiz „Mutterpass Kopie“ ohne Bezug → kein `mb`; mit `bezug.grundsicherungsgeld` → `mb`/`schwanger`; Notiz nur „Frauenarzt“ oder „Kinderwagen“ → keiner; mit `angaben.schwanger: true` → keiner.
2. Warmwasser/Ernährung/Dauer analog; `mb-dauer` nur mit `w: true` in `sonst`.
3. Alleinerziehend nur mit Bezug und `adults 1, kids > 0`.
4. Höchstens ein Geld-Hinweis: Schwangerschaft + Steuer-Notiz + Pflege-Beleg → genau ein Eintrag mit `art ∈ {mb, verm, pflege, steuer}`, und zwar der mit der höchsten Prio.
5. `vermNah`: ggeld Grenze 10.000, `verm` 7.999 → null; 8.000 → Treffer; 10.001 → null; `verm` 5.000 + `rest` 90.000 Cent → Treffer mit `monate = 6`; ohne Check-Ergebnis/Bezug → null; Wohngeld 60.000 bei 1 Person, kleinste Grenze gewinnt.
6. Weg-ID mit Grenze: `weg['verm-ggeld-10000']` blendet aus, bei Grenze 12.500 (Alter 40) wieder sichtbar.
7. Pflege-Frist: 31.10.2026 nein, 1.11.2026 und 31.12.2026 ja (mit `angaben.pflegegrad = 2`), 1.1.2027 nein; ohne Pflegegrad und ohne Belege nein; mit `pnog.stand = 'verkuendet'` nein.
7a. Steuer-Hinweis: mit `bezug.grundsicherungsgeld` und `ek1Art: ''` kein Hinweis, mit `ek1Art: 'lohn'` oder ohne Bezug ja.
8. `belegListe`/`belegSumme`: wiederkehrende Buchung mit `bp` über drei Monate = 3 Einträge; Halbjahr-Grenze 30.6./1.7.
9. `belegCsv`: Kopfzeile, `=SUMME(…)` in der Notiz wird mit `'` entschärft, Semikolon in der Notiz in Anführungszeichen.
10. `normiere`: `bs: 'ja'` (kein Boolean) wird verworfen, `bs: true` bleibt, fremde Felder an Buchungen (`x: 1`) verschwinden, alter Stand ohne `bs/bp` unverändert lesbar.
11. Zahlen: `RULES.pflegeHm === 42`, `RULES.steuer.hnd === 4000` (in `test-feste-zahlen.js` aufnehmen) und Texte enthalten keine festen Beträge (Platzhalter).

`test/test-haushalt-dom.js` (jsdom):
12. Häkchen „Beleg aufheben“ speichert `bs/bp`, Liste zeigt „· Beleg“, Bearbeiten übernimmt den Zustand.
13. Hinweis-Box: nie zwei Elemente mit `id` `hb-hw-mb|verm|pflege|steuer` gleichzeitig; „Nicht mehr zeigen“ setzt `daten.weg[id]` und Fokus geht auf den nächsten Knopf (wie bestehender Test).
14. Belegliste in „Auswertung“: Summe, Jahr-Umschalter, CSV-Knopf ruft den Exportweg (Mock).
15. Sprachen: alle neuen Schlüssel in 13 Sprachen + Einfach vorhanden (`test-einfach-gleich.js`, `test-sprachen-zahlen.js` laufen mit).

Nicht nötig: e2e; die schweren Tests laufen wie üblich auf GitHub.

### 4.7 Reihenfolge

1. Nach Merge von **b-energie** (und b-fristen) Branch von `origin/main` anlegen.
2. `rules.js` (Konstanten + `grenzen`), `app.js` (ctx `grenzen`).
3. `haushalt.js`: reine Funktionen + `hinweisListe`-Block + Tests 1–11.
4. Oberfläche (Eingabe, Liste, Belegliste) + DOM-Tests.
5. Texte de + einfach, dann 12 Übersetzungen; PRUEFLISTE/Faktenblatt.

---

## 5. Offene Fragen und Unsicherheiten

1. **PNOG (Pflegereform)**: nur Entwurf (BT-Drs. 21/8869, 1. Lesung 5.11.2026, Bundesrat 20.11.2026). Inkrafttreten laut Art. 11 Abs. 1 am 1.1.2027, aber nicht sicher; der Entwurf enthält **keine** Übergangsregel für Reste des Entlastungsbetrags aus 2026 und streicht den Betrag bei Pflegegrad 1 ganz (Quelle 20, Volltext gelesen). Der Frist-Hinweis sagt deshalb nur „möglichst“ und nennt das geltende Recht (30.6.2027). Bei Verkündung: Texte, `RULES.pnog`, 42-€-Hilfsmittel und gemeinsamen Jahresbetrag umstellen (auch Pflege-Bereich `rules.js` Z. 1556–1589). Die Prüfung am 1.12.2026 (STATUS.md) sollte das PNOG einschließen.
2. Soll der Frist-Hinweis nach Verkündung bis 31.12. bleiben (dann mit sicherem Text) oder entfallen, falls eine Übergangsregel kommt?
3. **Wohngeld-Vermögen**: 60.000/30.000 € sind nur Verwaltungsvorschrift (amtlich gefunden, Quelle 14), Gericht: „Orientierungswert“. Hinweistext sagt das; trotzdem wird bei Wohngeld vielleicht besser **nur** bei `V > 0,8 × G` ein Hinweis gezeigt und nie „Grenze erreicht“.
4. **Fristen-Übersicht**: Pflege-Frist 30.6. als Eintrag in der Fristenliste (b-fristen) oder nur im Haushaltsbuch? Vorschlag: nach b-fristen-Merge als Vorschlag dort, nicht im `startHinweis` (der gehört nach dem Merge den Fristen).
5. **Erspartes**: Das Haushaltsbuch kennt kein Kontoguthaben; der Hinweis nutzt `vermoegen` aus dem Check plus den Monats-Rest aus dem Plan. Ein eigenes Feld „Erspartes“ im Haushaltsplan wäre doppelt gespeichert (wie `uh` → über `geteiltSetzen` mit dem Check teilen?). Vorschlag: kein neues Feld.
6. **SGB II Übergang**: Für Bewilligungszeiträume, die vor dem 1.7.2026 begonnen haben, gelten bis zum Ende noch Karenzzeit und alte Freibeträge (40.000 € + 15.000 € im ersten Jahr). Die App kennt den Beginn des BWZ nicht (nur das Ende in `daten.bewilligt.sgb2`). Folge: Der Hinweis kann zu früh kommen; ab 50 Jahren auch zu spät, weil der alte Freibetrag nach der Karenzzeit (15.000 € je Person, heute nicht amtlich abgerufen) unter dem neuen (20.000 €) liegt. Bei laufendem Bezug wird Vermögen aber in der Regel erst beim nächsten Antrag neu bewertet (§ 12 Abs. 3 SGB II), dann schon nach neuem Recht. Im Text erwähnt; ab 1.7.2027 den Übergangssatz streichen. Akzeptabel?
7. Erledigt in der Prüfung: § 24 Abs. 3, § 37 Abs. 1 Satz 2 und § 41 Abs. 3 SGB II am 20.11.2026 abgerufen. Offen bleiben nur: alte Freibeträge § 12 a. F. (Quelle 10) und BMF-Schreiben zu § 35a (Quelle 28).
8. § 21 SGB II: Die am 20.11.2026 abgerufene Fassung ist die nach der Reform (sie enthält in den Nachbarparagrafen schon „Grundsicherungsgeld“, § 12 und § 65a neu); Absätze 2 bis 7 mit den bekannten Sätzen. Kein weiterer Abgleich nötig.
9. Steuer 2027: keine beschlossene Änderung zu §§ 33, 33b, 35a, 9a gefunden; § 33b Abs. 8 sieht eine Evaluierung des Pflege-Pauschbetrags ab Ende 2026 vor (möglich, dass sich etwas ändert).
10. Wer kein zu versteuerndes Einkommen hat (viele Nutzer mit Grundsicherungsgeld), hat von Steuer-Belegen nichts. Soll der Steuer-Hinweis bei `bezug.grundsicherungsgeld/sozialamt` ganz entfallen? Vorschlag: ja, außer es gibt Erwerbseinkommen (`ek1Art === 'lohn'`). **In der Prüfung so in 2.5 und 4.2 eingebaut** (weniger Hinweise, kein Nutzen ohne Steuer); bei anderem Wunsch dort eine Bedingung streichen.

---

## Prüfvermerk Fable (20.11.2026)

Unabhängige Prüfung. Alle Normen am 20.11.2026 direkt bei gesetze-im-internet.de abgerufen (§§ 12, 21, 22, 23, 24, 34, 37, 41, 65a SGB II; §§ 26, 27a, 30, 31, 90 SGB XII; VO zu § 90 Abs. 2 Nr. 9; § 21 WoGG; § 6a BKGG; §§ 40, 42a, 45b, 144 SGB XI; §§ 9a, 33, 33b, 35a EStG; § 84 SGG), dazu BT-Drs. 21/8869 im Volltext, BA-Weisung § 12 (Stand 01.07.2026), WoGVwV 21.37, VG München, Bundestag und BMG zum Verfahrensstand. Code: `origin/main` (Stand d5144f7). Korrekturen stehen direkt im Text oben.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Pflege-Frist: Entwurf nannte nur „Ansparen entfällt“. Laut Gesetzentwurf fällt der Entlastungsbetrag bei **Pflegegrad 1 ganz weg** (statt Geld Pflegebegleitung), das neue Sozialraumbudget gilt nur für Pflegegrad 2–5 und nur für Alltagshilfen (nicht mehr Tagespflege, Kurzzeitpflege, Pflegedienst); keine Übergangsregel für Reste 2026 | Fehler (unvollständig, für Pflegegrad 1 irreführend) | Texte `hb.hw.pflege.frist(.d)`, Kurzfassung, Tabelle 3, offene Frage 1 ergänzt; alles weiter als „Entwurf, nicht beschlossen“ | BT-Drs. 21/8869, Art. 1 § 45b-E, § 39-E, § 144-E, Art. 11; Begründung zu § 45b |
| PNOG nur über DAK-Seite belegt, Drucksache „nicht abgerufen“; 2.285 € „nur DAK“ | Fehler (Quellenregel) | Fußnote 20 auf die Drucksache umgestellt, DAK nur ergänzend | https://dserver.bundestag.de/btd/21/088/2108869.pdf |
| Übertrag des Entlastungsbetrags bis 30.6. nur mit gesund.bund.de belegt | Hinweis | Gesetz zitiert | § 45b Abs. 1 Satz 5 SGB XI |
| SGB II-Freibeträge nur mit BA-Weisung belegt; Text „bis 30 Jahre … ab 30“ widersprüchlich | Fehler (Quelle, Wortlaut) | Gesetz als Quelle; Text „unter 30 / ab 30 / ab 40 / ab 50“, höherer Betrag ab dem Monat des Geburtstags. Beträge 5.000/10.000/12.500/20.000 stimmen und passen zu `RULES.sgb2.schon` | § 12 Abs. 2 SGB II; BA-FW Rz. 12.36 |
| „Ein selbst bewohntes Haus zählt im ersten Jahr nicht“: falsch herum. Angemessenes Wohneigentum (140/130 m²) ist dauerhaft geschützt; im ersten Jahr entfällt nur die Größenprüfung | Fehler | Satz ersetzt | § 12 Abs. 1 Satz 2 Nr. 5, Satz 3 SGB II |
| Übergang Altfälle: Quelle war BA-Weisung; Aussage „Hinweis nie zu spät“ falsch (ab 50 Jahren ist der alte Freibetrag niedriger als der neue) | Fehler | § 65a Abs. 1 zitiert; offene Frage 6 berichtigt; alte Beträge nicht im Nutzertext | § 65a Abs. 1, § 41 Abs. 3 SGB II |
| Laufender Sonderbedarf (`mb.dauer`) auch für Sozialhilfe als „Mehrbedarf“ beschrieben. Im SGB XII gibt es dafür keinen Mehrbedarf (§ 30 Abs. 10 nur einmalig), sondern den höheren Regelsatz | Fehler | Text und Fußnote 8 ergänzt | § 21 Abs. 6 SGB II; § 27a Abs. 4, § 30 Abs. 10 SGB XII |
| Ernährung: Fußnote behauptete gleichen Wortlaut in § 30 Abs. 5 SGB XII | Hinweis | Fußnote 4 berichtigt (Ergebnis gleich: kein Betrag) | § 30 Abs. 5 SGB XII |
| Warmwasser: Zusage „gibt es“ und Auslösewort „Therme“. Mehrbedarf nur, wenn Warmwasser nicht schon über Heizkosten anerkannt wird | Risiko (falsche Zusage) | „möglich“, Bedingung im Aufklapptext, „Therme“ gestrichen | § 21 Abs. 7 Satz 1 SGB II; § 30 Abs. 7 SGB XII |
| Auslöseworte „Frauenarzt“, „Kinderwagen“ für die Frage „Du bist schwanger?“ | Risiko (falscher, sehr persönlicher Hinweis) | gestrichen, Testfall ergänzt | – (Gestaltung) |
| Wohngeld: WoGVwV „nicht amtlich gefunden“ | Fehler (Quelle) | amtliche Fundstelle eingesetzt; 60.000/30.000 € „in der Regel“ bestätigt; „Orientierungswert“ bestätigt | WoGVwV Teil A Nr. 21.37 Abs. 1; VG München 30.07.2026, M 22 K 25.3366 |
| Kinderzuschlag: 40.000/15.000 € stimmen (auch nach der Reform). Es fehlte, dass Vermögen darüber oft nur den ersten Monat kürzt | Hinweis | Satz und Fußnote 15 ergänzt; {a} aus `vermZwei − vermJeWeiteres` | § 6a Abs. 3 Satz 5–7 BKGG |
| § 90 SGB XII / Barbetrags-VO: 10.000 € je volljährige Person, 500 € je überwiegend unterhaltene Person | ohne Befund | – | § 90 Abs. 2 Nr. 9 SGB XII; § 1 VO |
| Mehrbedarfe 17 % / 36 %, 12 %, max. 60 % / 35 % / 2,3–0,8 %; Merkzeichen G 17 % | ohne Befund | Alleinerziehend: „Kinder unter 18“ ergänzt; Widerspruchsfrist mit Quelle | § 21 SGB II; § 30 SGB XII; § 84 SGG |
| Erstausstattung „extra beantragen“: stimmte, war aber nicht abgerufen | Hinweis | Quelle ergänzt | § 24 Abs. 3, § 37 Abs. 1 Satz 2 SGB II; § 31 SGB XII |
| Pflege: 131 €, 42 €, 3.539 € ab Pflegegrad 2 | ohne Befund | „damit du das Geld zurückbekommst“ → „kannst“ (keine Zusage: nicht jede markierte Ausgabe ist erstattungsfähig) | §§ 45b, 40 Abs. 2, 42a SGB XI |
| Steuer: 20 %, 510/4.000/1.200 €; Rechnung + Überweisung; zumutbare Belastung; 600/1.100/1.800 €; 1.230 € | ohne Befund | Ergänzt: Erstattetes zählt nicht (wichtig, weil eine Buchung „Steuer“ und „Pflegekasse“ zugleich haben kann) | §§ 35a, 33, 33b, 9a EStG |
| Vermögens-Hinweis: Satz „Erspartes darfst du für nötige Dinge ausgeben“ kann als Rat zum Ausgeben verstanden werden | Risiko | durch Warnung mit Quelle ersetzt | § 34 SGB II; § 26 Abs. 1 Nr. 1 SGB XII |
| Schlüssel/Art `mehr` kollidiert mit `hb.hw.mehr` („Mehr dazu“) und dem Standardweg `t('hb.hw.' + h.art)` in `hinweisElement` | Fehler (Bauplan) | Art und Schlüssel in `mb` / `hb.hw.mb.*` umbenannt; Zweig für den Aufklapp-Text vermerkt | `src/haushalt.js` Z. 465–470, `de.json` |
| `pflegeFristAktiv`: Bedingung mit `pnog.verworfen` war immer wahr, Hinweis hätte auch nach Verkündung den Entwurfs-Text gezeigt | Fehler (Bauplan) | `pnog.stand === 'entwurf'`, Test ergänzt | – |
| Steuer-Hinweis für Menschen mit Grundsicherungsgeld/Sozialhilfe ohne Lohn nutzlos; Auslöser (Apotheke, Brille) treffen fast jeden | Risiko (überladen) | Hinweis dort unterdrückt (Vorschlag aus Frage 10 eingebaut) | Vorgabe „nicht überladen“ |
| Zeilenangaben leicht daneben (WORTE 224, normiere 297, hinweise 495, return 835); `adults`/`kids` können Text sein; `gdb: 'antrag'` löste Behinderungs-Hinweis aus | Hinweis | berichtigt | `origin/main:src/haushalt.js`, `src/app.js` |
| Sicherheit: Speicherung über `Store` → Vorgänge/PIN passt; Hinweis-Texte über `textContent`; `csvFeld` schützt vor Formeln. Offen war: Belegliste (Notizen) als Druck/CSV liegt ungeschützt außerhalb | Hinweis | Vorgabe `textContent`/`esc` und Warnsatz in `hb.bl.hinweis` ergänzt | `src/haushalt.js` Z. 160, 324, 653; `src/app.js` Z. 3437–3441 |
| Gestaltung: höchstens ein Hinweis aus der Gruppe ist umgesetzt (`kand` → bester). Keine neue Startkachel, keine neue Farbe, keine neue Knopfgruppe | ohne Befund | Eingabe: drei Häkchen + Tipp + Warnung sind die Obergrenze; beim Bau prüfen, ob „Steuer/Pflegekasse“ erst nach dem ersten Häkchen erscheint (so geplant) | `docs/FARBEN.md` |

**Offen (nicht amtlich abgerufen, vor dem Einbau gegenlesen):** alte Freibeträge § 12 SGB II a. F. (BGBl. 2022 I S. 2328); BMF-Schreiben 9.11.2016 zu § 35a EStG; ob die WoGVwV-Fassung im Portal die letzte Änderung enthält (Nr. 21.37 Abs. 1 dort mit 60.000/30.000 €); Parallel-Branch b-energie nicht erneut gegengelesen. Das PNOG ist im Verfahren (Bundesrat 1. Durchgang 20.11.2026): vor jedem Release neu prüfen.

## Entscheidung beim Bau (20.11.2026)

- Neue Regel des Nutzers: Nur geltendes Recht. Der Hinweis `pflege.frist` (Pflegereform, BT-Drs. 21/8869) und `RULES.pnog` sind **nicht** eingebaut, auch nicht als „Entwurf“. Der Pflege-Hinweis nennt nur geltendes Recht (131 €, Reste bis 30.6. des Folgejahres). Test `[hb-pflege-recht]`: vor und ab 1.1.2027 gleich.
- Steuer-Hinweis: unterdrückt bei Grundsicherungsgeld/Sozialhilfe ohne Erwerbseinkommen; als Erwerbseinkommen zählen Lohn und Selbstständigkeit (Person 1 oder 2).
- Belegliste: eine CSV-Datei `Belege-<Jahr>.csv` mit Spalte „Für“ (Steuer/Pflegekasse) statt zwei Dateien.
- Neue Werte in `RULES`: `pflegeHm`, `schonUnterhalten` (500 €, vorher fest im Code), `steuer`. Grenzen je Leistung: `Rules.evaluate(...).grenzen`.
