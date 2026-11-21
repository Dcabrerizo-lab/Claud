# SoLo – Exit-Analyse (Entwurf)

Stand: 21.11.2026 (Abrufdatum aller Quellen). Bezug: SoLo 1.9.0 laut `docs/STORE.md` und `README.md` auf `origin/main`, Konkurrenzanalyse (Branch `claude/b-konkurrenzanalyse`), Markenrecht-Bericht (Branch `claude/b-markenrecht`).
Für: David (Inhaber, Nebenerwerb, Einzelperson). Erstellt von Claude. **Keine Rechts-, Steuer- oder M&A-Beratung.** Abschnitt 7 sagt, wann eine Fachperson nötig ist.

**Kennzeichnung:** **[F]** = Fakt mit Quelle · **[V]** = Vermutung, Einschätzung oder eigene Rechnung · **[W]** = allgemeines Fachwissen, hier nicht abgerufen, bitte gegenprüfen.

---

## 1. Das Wichtigste in Kürze

| # | Aussage |
|---|---|
| 1 | **Heute ist SoLo kaum verkaufbar.** Ohne Umsatz, Nutzerzahlen und Verträge zahlt ein Käufer nur für Code und Inhalte. Realistisch: **ca. 2.000–15.000 €**, mit Glück bei einem passenden strategischen Käufer bis ca. 30.000 €. [V] |
| 2 | **Der Wert entsteht durch wiederkehrende Lizenzumsätze mit Trägern/Kommunen.** Kleine Software-Firmen werden meist mit dem 1,5- bis 4-Fachen des Jahresumsatzes bzw. dem 2- bis 4-Fachen des Jahresgewinns bewertet. Nach 3 Jahren mit 45–110 T€ Umsatz: **ca. 70.000–350.000 €**. [F] Multiples, [V] Anwendung |
| 3 | **Realistischster Weg:** Verkauf der App mit allen Rechten (Asset-Deal) an einen Software-Anbieter für Träger oder Kommunen bzw. ein GovTech-Start-up, **mit Teilzahlung nach Erfolg (Earn-out)** und Übergangszeit, in der David noch mitarbeitet. Alternative mit Herz: Übergabe an einen gemeinnützigen Träger gegen Vergütung. [V] |
| 4 | **Größte Hindernisse:** (a) Rechte am Code nicht sauber belegt (Code großteils von KI geschrieben, 657 von 761 Commits tragen den Autor „Claude“ [F, `git log`]; Arbeitgeber), (b) Apple-Konto gehört einer anderen Person, (c) Code liegt **öffentlich** auf GitHub ohne Lizenzdatei, (d) Name „Sozialleistungslotse“ nahe an „LeistungsLotse“, (e) alles Fachwissen zur Pflege der Rechtsinhalte steckt in Davids Kopf. [F/V] |
| 5 | **Jetzt tun, was nichts kostet:** Rechte schriftlich klären, Apple-Konto regeln, Repo privat stellen, Pflegehandbuch schreiben, Marke „SoLo“ sichern, Lizenzverträge übertragbar formulieren. Details in Abschnitt 6. [V] |

---

## 2. Exit-Wege im Überblick

| Weg | Was passiert | Passt zu SoLo? | Typischer Preis / Gegenleistung | Bemerkung |
|---|---|---|---|---|
| **A. Verkauf der App (Asset-Deal)** | Käufer übernimmt Code, Inhalte, Marke, Domain, Store-Einträge, Kunden­verträge | **gut** – einfachster Weg für ein Einzelunternehmen | Einmalzahlung, oft + Earn-out | Store-Einträge sind übertragbar (siehe 5.3). Bei Google gehen Nutzer, Bewertungen und Rezensionen mit. [F] |
| **B. Lizenz / White-Label** | David behält SoLo, ein Anbieter oder Verband darf es unter eigenem Namen nutzen | **gut als Zwischenschritt** | Jahresgebühr oder Einmal­lizenz, z. B. pro Kommune oder Verband | Bringt Umsatz und Referenzen, steigert späteren Verkaufspreis. Exklusivität nur gegen viel Geld. [V] |
| **C. Übernahme durch ein Unternehmen** | Käufer übernimmt das Geschäft, David ggf. befristet als Berater | **mittel** – erst mit Umsatz | Kaufpreis nach Umsatz/Gewinn, meist mit Earn-out | Beispiel Großdeal: Wolters Kluwer kaufte 2025 die Berliner Libra Technology (Legal-KI, gegründet 2023) für 30 Mio. € sofort plus bis zu ca. 60 Mio. € erfolgsabhängig; erwarteter wiederkehrender Umsatz ca. 5 Mio. € ([Nasdaq/RTT, 14.11.2025](https://www.nasdaq.com/articles/wolters-kluwer-acquire-libra-technology-eur-90-mln)). [F] Zeigt: Käufer zahlen für wiederkehrenden Umsatz, und ein großer Teil des Preises fließt erst später. |
| **D. Übergabe an gemeinnützigen Träger / Stiftung** | Träger übernimmt SoLo und betreibt es weiter, David bekommt Vergütung oder einen Beratervertrag | **gut**, wenn Gemeinwohl wichtiger ist als Preis | eher niedrig; Kauf­preis muss für Gemeinnützige „angemessen“ sein [W]; oft über Fördermittel | Vorbild Integreat: Tür an Tür – Digitalfabrik gGmbH, 2024 ca. 557.500 € Einnahmen von 130 Kommunen ([Wirkungsbericht 2024](https://integreat-app.de/wp-content/uploads/2025/04/TaT-Digitalfabrik_Wirkungsbericht-2024.pdf), laut `berater-mehrwert.md`). [F] |
| **E. Investor (Business Angel, Impact-/GovTech-Fonds)** | Investor kauft Anteile, Geld für Wachstum | **schlecht** heute | Anteile gegen Geld | Braucht in der Regel UG/GmbH, Vollzeit-Team, Wachstumsplan. Ein Ein-Personen-Nebenerwerb passt nicht ins Raster der meisten Fonds. [W/V] Beispiel Feld: rightmart (Bürgergeld-Widersprüche) bekam ca. 37 Mio. € insgesamt, u. a. von LVM Versicherung ([deutsche-startups.de, 19.02.2024](https://www.deutsche-startups.de/2024/02/19/rightmart-legaltech-bremen/)). [F] |
| **F. Online-Marktplatz** (Flippa, Acquire.com u. ä.) | App wird öffentlich zum Verkauf gestellt | **schlecht** | Mobile Apps: ca. 2,9-facher Gewinn bzw. 2,5-facher Umsatz ([Flippa-Blog, Daten 2024/25](https://flippa.com/blog/business-valuation-multipliers-by-industry/)) [F]; ohne Umsatz meist nur wenige hundert bis wenige tausend € [V] | Gebühren Flippa: Inserat 29–499 $, Erfolgsgebühr 10 % bis 500.000 $ ([ExitBid, 2026](https://www.exitbid.io/blog/flippa-fees-explained-2026), Konkurrenzquelle) [F]. Käufer dort sind meist englischsprachig; eine App für deutsches Sozialrecht braucht Fachwissen, das sie nicht haben. [V] |

---

## 3. Mögliche Käufer

Passung: ●●● hoch · ●● mittel · ● gering. Preise sind Schätzungen [V], keine Angebote.

| Wer | Warum interessant | Passung | Wie sie kaufen / was sie zahlen würden | Wie ansprechen |
|---|---|---|---|---|
| **LeistungsLotse GmbH** (Berlin, B2G, 4 Personen; Kunden Nettetal, Wolfenbüttel, Amberg; Pilot „One-Stream“ Wohngeld NRW) [F, Bericht LeistungsLotse] | Hat Software für Ämter, aber Bürgerseite nur Deutsch + Leichte Sprache. SoLo wäre die mehrsprachige Bürger-App „vor dem Antrag“. Nebeneffekt: Namenskonflikt wäre gelöst. | ●●● | Kleines Start-up, laut Website gefördert (BMWK, ESF, Inkubatoren), kein großes Risikokapital gefunden [F/V] → eher kleiner Kaufpreis, Anteile oder Earn-out; heute ca. 5–25 T€ [V] | Nach den ersten Pilotstellen direkt an die Geschäftsführung; Kooperation zuerst (Verlinkung, Lizenz), Verkauf als Option |
| **NDI GmbH (D-App)** | Viel Kapital (laut Manager Magazin niedriger zweistelliger Mio.-Betrag) [F, Teil A]; hat erst 5 Leistungen, keine Grundsicherung, keinen KiZ, keine Pflege, keine Schulden. SoLos Regelwerk und Texte in 13 Sprachen füllen genau diese Lücke. | ●● | Würde eher **Inhalte/Regelwerk** kaufen oder lizenzieren als die App (Konto- und Cloud-Philosophie passt nicht zu „offline“) [V]; 10–50 T€ für Regelwerk + Pflege-Know-how denkbar [V] | Über d-app.com/ueber-uns; Angebot „Regelwerk 31 Leistungen + Übersetzungen als Lizenz“ |
| **Tür an Tür – Digitalfabrik gGmbH (Integreat)** | 130 zahlende Kommunen, mehrsprachige Integrations-App, gleiche Zielgruppe; SoLo wäre ein Modul „Was steht mir zu?“ | ●●● (Übergabe) | Gemeinnützig, wenig freies Geld → Übernahme über Fördermittel, Lizenz oder Beratervertrag für David; geringer Preis, aber Fortbestand gesichert [V] | Persönlich (Augsburg, Bayern); Pilot „SoLo-Modul in einer Integreat-Kommune“ |
| **Software für Träger: Connext (Vivendi), myneva (Summa Equity), Haufe** | Haben tausende Träger als Kunden, aber kein mehrsprachiges Prüfwerkzeug für den Beratungstisch [V, Teil B]. myneva ist ein Finanzinvestor-Zukauf-Modell in der Sozialwirtschaft (kaufte u. a. SWING und 2025 CareMates/Kuidado) ([Orrick, 08/2025](https://www.orrick.com/de-DE/news/2025/08/caremates-successful-exit-to-myneva-group)) [F]. | ●● heute, ●●● ab ca. 100 zahlenden Stellen | Kaufen Zusatzmodule mit Kunden und Umsatz; Preis nach Umsatz-Vielfachem + Earn-out; ohne Kunden kaum Interesse [V] | Über Produktmanagement; Messe ConSozial Nürnberg [W] |
| **Fachverlage / Behördensoftware: Wolters Kluwer (eGovPraxis Sozialhilfe), AKDB, Dataport** | Kennen Sozialrecht, verkaufen an Ämter. Wolters Kluwer kauft aktiv zu (Libra 2025) [F]. AKDB und Dataport sind öffentlich-rechtlich [W] und kaufen selten Firmen, eher Lizenzen oder Aufträge. | ● | Wolters Kluwer erst bei nachgewiesenem Umsatz; AKDB/Dataport eher Lizenz/Vergabe [V] | Erst mit Referenzkommune |
| **iff e.V. (Hersteller CAWIN, Marktführer Schuldnerberatung)** ([iff](https://www.iff-hamburg.de/software-en/)) [F] | SoLo könnte Vorstufe und Wartezeit-Hilfe vor der Schuldnerberatung sein | ● | Verein, kleines Budget → Lizenz oder Kooperation, kein Kauf [V] | Fachtagung Schuldnerberatung [W] |
| **Wohlfahrtsverbände und IT-Töchter** (Caritas, Diakonie, Paritätischer, AWO) | Viele Beratungsstellen, Bedarf an Sprachen | ●● (Lizenz/Übergabe) | Rahmenvertrag oder Übernahme in eine gGmbH; Kaufpreise selten, Förderung möglich [V] | Landesebene Bayern; Achtung Interessenkonflikt mit eigenem Arbeitgeber |
| **Verbraucherzentralen** | Haben Pflegegrad-Rechner, Rechtsberatung | ● | Auftrag oder Lizenz, kein Kauf [V] | Verbraucherzentrale Bayern |
| **Legal-Tech / Ratgeberportale** (rightmart mit hartz4widerspruch.de; buergergeld.org, gegen-hartz.de) | „Bescheid nachrechnen“ ist für sie ein Kundenzugang (Lead) zu Widerspruchs-Kanzleien. rightmart hat Geld (ca. 500 Mitarbeitende, ca. 37 Mio. € Finanzierung) [F] | ●● (Geld) / ● (Werte) | Würden zahlen, aber für Nutzerzahlen (Reichweite), nicht für Code [V]. **Konflikt:** SoLo wäre dann nicht mehr neutral; Werbung/Tracking würde Träger-Lizenzen entwerten. | Nur mit klarer Haltung verhandeln |
| **Banken / Versicherer** | Schulden- und Sozialthemen, Kundenbindung; LVM investierte in rightmart [F] | ● | Eher Lizenz als Kauf [V] | nicht aktiv verfolgen |
| **Bund / Länder** (Sozialplattform, Deutschland-App) | Bauen selbst, kaufen keine kleinen Apps | ● | Vergabe nach Vergaberecht oder Open Source (z. B. OpenCoDE) [W]; kein Kaufpreis | Höchstens als Lizenznehmer/Auftrag |

**Belege für Übernahmen im Feld (Auswahl):**

| Jahr | Käufer → Ziel | Preis | Quelle |
|---|---|---|---|
| 2022 | ResMed → MEDIFOX DAN (Pflegesoftware, Hildesheim) | ca. 958,6 Mio. € | [MDDI](https://www.mddionline.com/business/resmed-completes-medifox-dan-acquisition-for-958-6-million) [F] |
| 2021–2025 | myneva (BID Equity, dann Summa Equity) kauft Sozialsoftware zu, u. a. SWING, CareMates | nicht veröffentlicht | [Orrick](https://www.orrick.com/de-DE/news/2025/08/caremates-successful-exit-to-myneva-group), [unquote](https://www.unquote.com/dach/official-record/3024375/summa-buys-myneva-from-bid-equity) [F] |
| 2023/24 | rightmart übernimmt Legal One (Verbraucher-Legal-Tech) | nicht veröffentlicht | [deutsche-startups.de](https://www.deutsche-startups.de/2024/02/19/rightmart-legaltech-bremen/) [F] |
| 2025 | Wolters Kluwer → Libra Technology (Legal-KI) | 30 Mio. € + bis ca. 60 Mio. € Earn-out | [Nasdaq/RTT](https://www.nasdaq.com/articles/wolters-kluwer-acquire-libra-technology-eur-90-mln) [F] |

Lesart [V]: Der Markt für Sozial- und Rechtssoftware ist in Bewegung, aber gekauft werden Firmen **mit Kunden und wiederkehrendem Umsatz**. Für Ein-Personen-Apps ohne Umsatz gibt es keine öffentlichen Kaufpreise.

---

## 4. Was ist SoLo wert?

### 4.1 Bewertungsmethoden

| Methode | Wie | Werte | Für SoLo |
|---|---|---|---|
| **Wiederbeschaffungs­kosten** | Was kostet es, SoLo neu zu bauen? | ca. 37.700 Zeilen eigener Code (ohne Bibliotheken), 177 Sprachdateien, 400+ Regeltests [F, Repo]. Klassisch geschätzt 6–12 Personen­monate × ca. 17 T€ (105 €/Std. Durchschnitt IT-Freiberufler 2025, [Computerwoche](https://www.computerwoche.de/article/3853444/freelancer-kompass-2025-it-freiberufler-verdienen-105-euro-in-der-stunde.html) [F]) = **100–200 T€** [V] | **Obergrenze, kein Preis.** Käufer wissen, dass Neubau mit KI-Werkzeugen heute viel billiger ist. Wert hat vor allem das **geprüfte Regelwerk mit Quellen und Tests**, nicht der Code. [V] |
| **Umsatz-Vielfaches (SaaS/B2B)** | Jahresumsatz (wiederkehrend) × Faktor | Kleine SaaS: Median ca. 2,0× Umsatz (633 Angebote auf Acquire.com) ([BigIdeasDB 2026](https://bigideasdb.com/state-of-saas-valuations-2026)); unter 1 Mio. $ ARR ca. 2,5–4× Umsatz ([beancount.io 07/2026](https://beancount.io/de/blog/2026/07/11/bootstrapped-saas-valuation-multiples-2026-acquire-com-indie-founders-guide)) [F]. Angebotspreise, echte Abschlüsse liegen meist darunter [F]. | ab Szenario b) |
| **Gewinn-Vielfaches (Marktplatz)** | Jahresgewinn des Inhabers (SDE) × Faktor | Apps ca. 2,9× ([Flippa](https://flippa.com/blog/business-valuation-multipliers-by-industry/)); kleine SaaS unter ca. 50.000 $ Gewinn ca. 1,7–2,9× ([BigIdeasDB](https://bigideasdb.com/state-of-saas-valuations-2026)); 4–6× SDE, wenn der Gründer noch nötig ist (bis 1 Mio. $ ARR) ([beancount.io](https://beancount.io/de/blog/2026/07/11/bootstrapped-saas-valuation-multiples-2026-acquire-com-indie-founders-guide)) [F] | ab Szenario b) |
| **Nutzer-/Download-Wert** | Preis je aktivem Nutzer | Keine verlässlichen öffentlichen Werte für deutsche Sozial-Apps gefunden. [V] Für Lead-Käufer (Kanzleien) zählt nur Reichweite. | nur mit Nutzerzahlen |

### 4.2 Wertspannen (ehrlich)

| Szenario | Annahmen | Methode | Wertspanne [V] |
|---|---|---|---|
| **(a) Heute** | kein Umsatz, keine Nutzerzahlen, keine Verträge, Rechte nicht dokumentiert, Code öffentlich | Wiederbeschaffung mit hohem Abschlag; Marktplatz-Erfahrung | **0–15 T€**, meist 2–10 T€. Ausreißer bis ca. 30 T€, wenn ein Käufer genau dieses Regelwerk braucht (z. B. D-App, LeistungsLotse). |
| **(b) In 12 Monaten** | Pilotstellen, 30–50 zahlende Stellen à Ø ca. 450 €/Jahr (Konkurrenz­analyse: 45–110 T€ bei 100–250 Stellen) → **ca. 13–23 T€ Umsatz/Jahr**, Gewinn ca. 10–20 T€; Store-Bewertungen | 1,5–3× Umsatz bzw. 2–3× Gewinn; Abschlag, weil alles an David hängt | **20–60 T€**, davon ein Teil als Earn-out |
| **(c) In 3 Jahren** | 100–250 Stellen, **45–110 T€ Umsatz/Jahr**, Gewinn ca. 35–90 T€, Verträge mit Verband/Kommune, Marke eingetragen | 2–4× Gewinn bzw. 1,5–3,5× Umsatz | **70–350 T€**; Mitte ca. 120–200 T€. Mehr nur mit mehrjährigen Kommunen-/Verbandsverträgen oder einem strategischen Käufer. |

Hinweis [V]: Der Preis hängt stark davon ab, wer die **Rechtsänderungen** (Wohngeld 2027, Elterngeld 11/2027, mögliche Zusammenlegung von Leistungen ab 2028) künftig einpflegt. Ein Käufer ohne Sozialrechts-Wissen wird einen großen Abschlag machen oder einen Beratervertrag mit David verlangen.

### 4.3 Was den Wert am stärksten steigert

| Rang | Hebel | Warum |
|---|---|---|
| 1 | **Wiederkehrender Umsatz** mit Jahreslizenzen, automatischer Verlängerung, geringer Kündigungsquote | Alle Multiples rechnen damit; Einmalkäufe für 1,49 € zählen kaum. [F/V] |
| 2 | **Verträge mit Verbänden/Kommunen** (mehrjährig, übertragbar) | Planbar, schwer kopierbar, Referenz für weitere Kunden. [V] |
| 3 | **Saubere Rechte** (Code, Inhalte, Marke, Store-Konten auf dem Verkäufer) | Ohne das scheitert die Prüfung des Käufers (Due Diligence). [F, CMS] |
| 4 | **Kleine Abhängigkeit vom Gründer:** Pflegehandbuch, Rechtsänderungs-Kalender, Quellen-Abruf automatisiert, Tests | Senkt den Abschlag stark; bei Gründerabhängigkeit gelten andere (niedrigere) Bewertungen. [F/V] |
| 5 | **Marke „SoLo“ eingetragen**, Domain gesichert, kein Namensstreit | Käufer übernehmen keine Abmahnrisiken. [V] |
| 6 | **Nutzerzahlen und Bewertungen** | Wichtig für Reichweiten-Käufer; bei Google übertragbar. [F/V] |

---

## 5. Hindernisse und Vorbereitung („Exit-Readiness“)

### 5.1 Ampel

| Thema | Stand | Ampel | Was tun |
|---|---|---|---|
| **KI-generierter Code** | Nach deutschem Recht ist nur eine menschliche „eigene geistige Schöpfung“ geschützt (§ 69a UrhG); vollständig von KI erzeugter Code ist gemeinfrei und nicht lizenzierbar. Käufer prüfen in der Due Diligence, welche KI-Werkzeuge in welchem Umfang genutzt wurden und ob das dokumentiert ist ([CMS, 30.10.2025](https://cms.law/de/deu/legal-updates/ki-generierter-softwarecode-in-der-due-diligence)) [F]. Im Repo stammen 657 von 761 Commits vom Autor „Claude“ [F]. | 🔴 | Menschlichen Anteil belegen: Konzept, Auswahl der Leistungen, Regeln aus Gesetzen, Prüfungen, Abnahme (Übergabe-Dateien, Prüfberichte, Issues sind dafür gut). Ein kurzes **Entwicklungs-Protokoll** führen. Der Wert liegt eher im **Regelwerk, den Texten, den Tests und der Marke** als im Code. [V] |
| **Code öffentlich** | GitHub-Repo `Claud` ist öffentlich, ohne Lizenzdatei [F, GitHub-API]. Ohne Lizenz darf niemand den Code nutzen [W], aber jeder kann ihn lesen und nachbauen. Schutz als Geschäftsgeheimnis setzt Geheimhaltung voraus [F, CMS]. | 🔴 | Repo **privat** stellen (für GitHub Pages aus privatem Repo braucht es einen bezahlten Plan oder ein eigenes Website-Repo [W]); Datei `LICENSE` „Alle Rechte vorbehalten“; Store-Texte/Datenschutz getrennt veröffentlichen. Achtung: Was schon öffentlich war, bleibt in Kopien. |
| **Rechte des Arbeitgebers** | § 69b UrhG gibt dem Arbeitgeber die Vermögensrechte nur an Programmen, die „in Wahrnehmung seiner Aufgaben oder nach den Anweisungen seines Arbeitgebers“ entstehen ([gesetze-im-internet.de](https://www.gesetze-im-internet.de/urhg/__69b.html)) [F]. Als Sozialpädagoge ist Programmieren keine Arbeitsaufgabe → Risiko gering [V]. Risiko steigt, wenn Arbeitszeit, Dienstgeräte oder Wissen/Material des Trägers genutzt wurden oder der eigene Träger Pilot wird. | 🟡 | **Nebentätigkeit schriftlich anzeigen** (bei allen Arbeitgebern) und eine kurze Bestätigung erbitten, dass der Arbeitgeber keine Rechte an SoLo beansprucht. Nichts in der Dienstzeit/auf Dienstgeräten. |
| **Apple-Konto auf anderer Person** | App Store: Anbieterin ist die Inhaberin des Apple-Entwicklerkontos [F, STORE.md]. Ein App-Transfer ist möglich, setzt aber u. a. voraus: mindestens eine im App Store **veröffentlichte** Version, beide Konten mit akzeptierten aktuellen Vereinbarungen, TestFlight-Builds entfernt ([Apple](https://developer.apple.com/help/app-store-connect/transfer-an-app/app-transfer-criteria)) [F]. | 🟡 | Kurzfristig: **schriftliche Vereinbarung**, dass die App David gehört und die Kontoinhaberin sie auf Verlangen überträgt. Mittelfristig: eigenes Konto (später auf UG); Apple empfiehlt bei sensiblen Daten eine juristische Person (Richtlinie 5.1.1(ix)) [F, Markenrecht-Bericht]. |
| **Google-Play-Konto** | Auf David. Transfer an ein anderes Konto möglich; Nutzer, Download-Statistik, Bewertungen und Rezensionen gehen mit; Antwort des Supports in ca. 2 Werktagen; Zielkonto braucht bei Bezahl-Apps ein Zahlungsprofil ([Google](https://support.google.com/googleplay/android-developer/answer/6230247)) [F] | 🟢 | Finanzberichte vor einem Transfer herunterladen. |
| **Marke / Name** | „Leistungslotse“ = Firmenname der LeistungsLotse GmbH (§ 5 MarkenG); „Sozialleistungslotse“ gelb; „SoLo“ als Hauptmarke empfohlen [F, Markenrecht-Bericht] | 🟡 | Registersuche von Hand, Wort-Bild-Marke „SoLo“ (ab ca. 290 €), Domain `sozialleistungslotse.de`. Ein Käufer wie LeistungsLotse könnte das Problem durch Kauf selbst lösen. |
| **Open-Source-Lizenzen** | MIT, Apache 2.0, OFL; keine GPL gefunden; vollständige Lizenztexte fehlen noch teilweise [F, Markenrecht-Bericht] | 🟢 | Lizenztexte beilegen, Liste aller Bibliotheken (mit Version) für den Käufer pflegen; keine GPL/AGPL aufnehmen. |
| **Haftung / RDG** | Regelbasierter Check sehr wahrscheinlich keine Rechtsdienstleistung; Grenzfälle Bescheid nachrechnen, Widerspruchshilfe [F/V, Konkurrenzanalyse] | 🟡 | Vor Bezahlversion/Lizenzverkauf kurz anwaltlich prüfen; Haftungsbegrenzung im Lizenzvertrag. Käufer fragen danach. |
| **Datenschutz** | Offline, kein Server, keine Konten → kaum Altlasten [F, STORE.md] | 🟢 | Großer Pluspunkt beim Verkauf. Beim Käufer bleibt das nur, wenn er die Offline-Architektur behält. |
| **Pflege der Rechtsinhalte** | 31 Leistungen, Rechtsstand je Regel, Quellen-Workflow vorhanden [F, README] | 🟡 | Pflegehandbuch: Welche Quelle, wann ändert sich was (Kalender 2027/28), wie testen, wie veröffentlichen. Ziel: eine Fachkraft ohne David kann ein Update machen. |
| **Rechtsform** | Einzelunternehmen → nur Asset-Deal möglich (Einzelteile verkaufen). Mit UG/GmbH auch Anteilsverkauf (Share-Deal), Verträge bleiben dann einfach bei der Firma. [W] | 🟡 | UG erst, wenn Lizenzumsätze fließen; vorher mit Steuerberater rechnen (Gründungs- und Buchhaltungskosten). |
| **Steuern beim Verkauf** | Gewinn aus dem Verkauf eines ganzen Betriebs: Freibetrag 45.000 € nur ab 55 Jahren (einmal im Leben, sinkt ab 136.000 € Gewinn), sonst Fünftelregelung ([IHK Elbe-Weser](https://www.ihk.de/elbeweser/recht-und-steuern/steuerrecht/veraeusserungsgewinn-6229960), Stand 2020) [F]. Verkauf nur der App statt des ganzen Betriebs kann normaler Gewinn sein (Einkommen- und ggf. Gewerbesteuer); Umsatzsteuer hängt davon ab, ob „Geschäftsveräußerung im Ganzen“ vorliegt [W]. | 🟡 | **Vor jeder Verhandlung Steuerberater fragen.** Einnahmen und Ausgaben von SoLo schon heute getrennt buchen (eigenes Konto). |

### 5.2 Was ein Käufer sehen will (Datenraum-Liste) [V/W]

1. Nachweis der Rechte: Erklärung des Arbeitgebers, Vereinbarung mit der Apple-Kontoinhaberin, Liste der Mitwirkenden (auch Übersetzer, Tester), KI-Nutzung dokumentiert.
2. Liste der Fremd-Bibliotheken und Lizenzen.
3. Marke, Domain, Store-Konten (Zugänge übertragbar).
4. Kennzahlen: Downloads, aktive Nutzer (ohne Tracking: nur Store-Zahlen), Bewertungen, zahlende Stellen, Kündigungen, Umsatz je Monat.
5. Verträge mit Trägern/Kommunen – mit Klausel, dass sie auf einen Käufer übertragen werden dürfen.
6. Pflegehandbuch und Rechtsänderungs-Kalender; Testabdeckung.
7. Rechtliche Prüfungen (RDG, Datenschutz, Barrierefreiheit).

---

## 6. Empfehlung

### 6.1 Realistischster Weg und Zeitpunkt [V]

- **Jetzt nicht verkaufen.** Der Erlös wäre klein (Szenario a), und Davids Fachwissen ist das, was SoLo von KI-Apps unterscheidet.
- **12–24 Monate Lizenzgeschäft aufbauen** (Weg B): Pilotstellen, dann Rahmenvertrag mit einem Verband oder einer Kommune.
- **Exit frühestens ab ca. 20–30 T€ wiederkehrendem Umsatz**, sinnvoller ab 50 T€ (Szenario c). Dann:
  1. **Asset-Deal an einen strategischen Käufer** (Träger-Software, GovTech-Start-up wie LeistungsLotse, ggf. D-App) mit Earn-out und 6–12 Monaten Beratervertrag für David; oder
  2. **Übergabe an einen gemeinnützigen Träger** (z. B. Tür an Tür) mit Vergütung, wenn Fortbestand und Unabhängigkeit wichtiger sind als der Preis.
- Ein Verkauf an Lead-Käufer (Kanzleiportale) bringt eventuell mehr Geld, gefährdet aber Neutralität und Träger-Lizenzen. Nur bewusst entscheiden.

### 6.2 Acht Schritte, die heute schon den Wert sichern

| # | Schritt | Aufwand |
|---|---|---|
| 1 | **Nebentätigkeit schriftlich anzeigen** und Bestätigung „keine Rechte des Arbeitgebers an SoLo“ einholen; nie in Dienstzeit/auf Dienstgeräten arbeiten | 1 Brief |
| 2 | **Vereinbarung mit der Apple-Kontoinhaberin**: App gehört David, Übertragung auf Verlangen; später eigenes Konto (bzw. UG) | 1 Seite |
| 3 | **Repo privat stellen**, `LICENSE` „Alle Rechte vorbehalten“, Bibliotheken-Liste mit Lizenzen | 1 Stunde |
| 4 | **KI-Nutzung und menschlichen Anteil dokumentieren** (Entwicklungs-Protokoll: Konzept, Quellen, Prüfungen, Entscheidungen) | laufend, 10 Min./Woche |
| 5 | **Marke „SoLo“ prüfen und anmelden**, Domain sichern | ca. 300 € |
| 6 | **Lizenzverträge übertragbar** formulieren (Jahreslizenz, automatische Verlängerung, Übertragung auf Rechtsnachfolger erlaubt, Haftungsbegrenzung) | einmal anwaltlich prüfen |
| 7 | **Pflegehandbuch** und Rechtsänderungs-Kalender schreiben; Quellen-Abruf und Tests weiter automatisieren | 1–2 Tage |
| 8 | **Zahlen sammeln und getrennt buchen**: eigenes Geschäftskonto, monatliche Liste Downloads/Bewertungen/zahlende Stellen/Umsatz | laufend |

### 6.3 Was man vermeiden sollte

- SoLo **heute auf Flippa o. ä.** für wenige hundert oder tausend Euro anbieten.
- **Exklusive Lizenzen** oder Vorkaufsrechte ohne hohe Gegenleistung vergeben – sie schrecken andere Käufer ab.
- **Werbung, Tracking, Konto oder Cloud** einbauen: Das zerstört das Datenschutz-Argument, das Träger und Käufer am meisten schätzen.
- Den Namen **„Leistungslotse“** in irgendeiner Form nutzen.
- **Mündliche Absprachen** über Rechte (Apple-Konto, Übersetzer, Helfer).
- **Update-Zusagen** in Verträgen, die ein Ein-Personen-Nebenerwerb nicht halten kann.
- Abhängigkeit von **einem einzigen Großkunden** – das senkt den Preis.
- Den **eigenen Arbeitgeber** als Pilot oder Kunden ohne offene Klärung des Interessenkonflikts.
- Investoren-Anteile abgeben, bevor klar ist, ob SoLo ein Vollzeit-Unternehmen werden soll.

---

## 7. Wann Fachleute sinnvoll sind

| Fachperson | Wann | Wofür |
|---|---|---|
| **Anwalt IT-/Urheber- und Markenrecht** | vor der Markenanmeldung (oder bei Treffern in der Registersuche); vor dem ersten Lizenzvertrag; **bei jeder Abmahnung sofort**; vor Unterschrift einer Absichtserklärung (LOI) eines Käufers | Rechte am Code (KI, Arbeitgeber), Lizenz-AGB, RDG, Kaufvertrag, Gewährleistung |
| **Steuerberater** | vor Gründung einer UG; sobald Lizenzumsätze kommen (Kleinunternehmer-Grenze 25.000 €); **vor jeder Verkaufsverhandlung** | Asset- oder Share-Deal, Einkommen-/Gewerbe-/Umsatzsteuer, Freibeträge |
| **M&A-Berater / Makler** | erst ab ca. 100 T€ Umsatz oder erwartetem Preis über ca. 250 T€ [V] | Käufersuche, Verhandlung; Erfolgsgebühren von ca. 10 % lohnen sich darunter kaum (vgl. Flippa 10 % bis 500.000 $ [F]) |
| **Kostenlose Erstberatung** | jetzt | IHK Nürnberg für Mittelfranken (Gründung, Nachfolge), Social Impact Lab / Gründerzentren [W] |

---

## Grenzen dieser Analyse

- Schreibtisch-Recherche; keine Gespräche mit möglichen Käufern. Alle Preise sind Schätzungen [V].
- Für SoLo lagen keine Downloads, Nutzer- oder Umsatzzahlen vor.
- Multiples stammen überwiegend von US-Marktplätzen und sind Angebotspreise; für den deutschen Sozial-Software-Markt gibt es keine öffentlichen Kaufpreise kleiner Apps.
- Ob die iOS-Version schon im App Store veröffentlicht ist (Voraussetzung für einen Apple-Transfer), wurde nicht geprüft.
- Rechtliche und steuerliche Aussagen sind allgemein und ersetzen keine Beratung.
