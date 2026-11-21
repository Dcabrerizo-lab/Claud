# Rückübersetzung PR #142: Französisch „vous“ statt „tu“

Geprüft am 21.11.2026, unabhängig vom Verfasser der Umstellung.
Stand: `origin/claude/b-fr-vous` (4ef6037) gegen `origin/claude/b-sprachen-glossar`.

## Ergebnis in Kürze

| Punkt | Ergebnis |
|---|---|
| Geänderte Texte | 862 in 10 fr-Dateien |
| Gelesen und gegen das deutsche Original rückübersetzt | alle 862 (355 mit Frist, Betrag, Warnung oder Rechtsfolge; 507 übrige, also 100 % statt der verlangten 40 %) |
| Platzhalter (`{…}`), Zahlen, Paragrafen | bei allen 862 Texten vorher und nachher gleich (maschinell verglichen) |
| Reste von „tu“ (tu, te, toi, ton, ta, tes, Verbformen der 2. Person Einzahl) | keine, in allen 2.787 fr-Texten gesucht |
| Knöpfe im Infinitiv | unverändert, keiner wurde zur Aufforderung |
| Fehler gefunden | 14 Befunde in 23 Textstellen, alle korrigiert |
| Neue du-förmige Texte in anderen Branches | 15 (Liste unten) |

Nicht Teil dieser Prüfung: ob die Zahlen und Paragrafen im deutschen Original stimmen. PR #142 ändert keine Zahl und keinen Paragrafen. Geprüft wurde, dass das Französische dasselbe sagt wie das Deutsche.

## Befunde und Korrekturen

Schwere: hoch = Sinn oder Frist kann falsch verstanden werden, mittel = missverständlich, niedrig = Sprache.

| Nr. | Datei: Schlüssel | Befund | Schwere | Korrektur |
|---|---|---|---|---|
| 1 | schulden: `sl.stufe.1` | Aussagesatz wurde zur Aufforderung. Deutsch: „Zuerst: sichert Wohnung, Strom …“ (diese Schulden sichern). Die Umstellung hielt „protège“ für eine du-Aufforderung und machte „protégez“ daraus. | hoch | „D’abord : ce qui protège le logement, …“ |
| 2 | fr: `briefe.ab.lead` | „Lies … ein“ heißt einscannen. Französisch stand „Lisez la lettre“ (den Brief lesen). Fehler schon vor #142. | mittel | „Scannez la lettre ou le formulaire.“ |
| 3 | fristen: `fri.art.mit.t` | „bis zu diesem Tag“ war „avant ce jour“ (vor diesem Tag). Der letzte Tag zählt mit. | mittel | „au plus tard ce jour-là“ |
| 4 | fristen: `fri.art.frist.t` | wie Nr. 3 | mittel | „au plus tard ce jour-là“ |
| 5 | schulden: `sl.frist.mahnbescheid` | „bis {frist}“ war „avant le {frist}“ | mittel | „au plus tard le {frist}“ |
| 6 | schulden: `gs.d.geld.frist` | „droht Ersatzfreiheitsstrafe“ war „s’applique“ (gilt sicher). Zu hart. | mittel | „vous risquez une peine de prison de substitution“ |
| 7 | fr: `sp.schulden.mahn` | Widerspruch und Einspruch heißen beide „opposition“. Im letzten Satz war unklar, welcher gemeint ist. | mittel | „L’opposition (Einspruch) n’arrête pas la saisie …“ |
| 8 | fr: `sp.heizen.5`, `sp.heizen.5.kurz`; ausziehen: `az.p.nebenkosten.t` | „Nachzahlung beim Jobcenter einreichen“ stand als „Remettez le rappel/complément au Jobcenter“. Das liest sich wie „Gib das Geld dem Jobcenter“. | mittel | „Transmettez au Jobcenter la facture de régularisation (Nachzahlung)“ bzw. „le décompte avec le complément à payer (Nachzahlung)“ |
| 9 | haushalt: `hb.hw.nk.d` | Grammatik: „le rappel … où elle est due“ | niedrig | „où il est dû“ |
| 10 | fr: `gs.d.konto.frist.kurz` | Grammatik: „dans 1 mois après la saisie“ | niedrig | „dans un délai de 1 mois après la saisie“ |
| 11 | fr: `gs.d.miete.frist`, `gs.d.miete.frist.kurz`; schulden: `sl.warum.miete` | Räumungsklage hieß mal „demande d’expulsion“, mal „action en expulsion“. „Demande“ klingt nach Bitte des Vermieters, nicht nach Klage. | niedrig | überall „action en expulsion (Räumungsklage)“ |
| 12 | schulden: `sl.hilfe.3`, `sl.warum.energie`, `sl.warum.miete` | Amtsbegriff vertauscht: Sozialhilfe (Leistung) stand als „aide sociale (Sozialamt)“, das Sozialamt als „l’aide sociale“. | niedrig | Leistung: „aide sociale (Sozialhilfe)“, Amt: „Sozialamt“ |
| 13 | ausziehen: `az.p.arzt.t` | „SAMU“ ist eine französische Einrichtung, in Deutschland gibt es sie nicht. | niedrig | „secours“ |
| 14 | fr: `res.beratung`, `t.uz.wg` | „Pas sûr ?“ (nur männlich) und „L’app“ statt sonst „L’appli“ | niedrig | „Un doute ?“, „L’appli“ |

Nach der Korrektur bestanden: `test/test-sprachen-zahlen.js` (33.060 Texte), `test-feste-zahlen`, `test-fristen`, `test-schulden`, `test-haushalt`, `test-ausziehen`.

## Geprüft und in Ordnung

| Prüfpunkt | Ergebnis |
|---|---|
| Sinn gleich, keine neuen Zusagen | ja. „kann“, „meist“, „in der Regel“, „möglich“ sind erhalten. |
| Anrede | durchgehend vous. Possessiv votre/vos und Reflexiv vous stimmen. |
| Verbformen | 2. Person Mehrzahl stimmt, auch Futur und Imparfait (aurez, pouviez, paierez, apprendrez). |
| Zitate | Der Werbespruch in `az.p.raten` steht jetzt als „achetez maintenant, payez plus tard“. Passt. |
| Amtsbegriffe | deutsche Begriffe (Jobcenter, Widerspruch, Bescheid, P-Konto, Mietenstufe …) unverändert |
| Wer-Sätze („Wer lange krank ist, sollte …“) | im Französischen teils als „Si vous …, faites …“. Das stand so schon vor #142 und ändert den Sinn nicht. |

## Offen (kein Fehler, zur Kenntnis)

| Punkt | Hinweis |
|---|---|
| Männliche Formen | „assuré“, „inscrit“, „conseillé“, „exonéré“, „chômeur“ stehen nur männlich. An anderen Stellen steht „marié(e)“, „séparé(e)“, „seul·e“. Einheitlich machen wäre ein eigener Auftrag. |
| „Weiter“-Knopf | In `schritte` heißt er „Continuer“, in der Einfachen Sprache „Suivant“. Beides passt zum jeweiligen Knopf. |
| Landkreis | meist „arrondissement“, einmal „district“ (`sp.vertraege.3`) |

## Neue du-förmige fr-Texte in anderen offenen Branches

Diese Texte kommen mit `origin/claude/b-buendel-n1` und `origin/claude/b-sicherheit-mittel` neu dazu und stehen noch in der du-Form. Dort nicht geändert. Beim Zusammenführen mit #142 die vous-Fassung einsetzen.

Achtung beim Zusammenführen: `t.bafoeg.alter` und `t.kiz.ae7` ändern #142 und b-buendel-n1 beide. Es gilt der Inhalt aus b-buendel-n1 in der vous-Fassung unten.

### b-buendel-n1 (12 Texte)

| Datei: Schlüssel | Stelle in du-Form | vous-Fassung (ganzer Text) |
|---|---|---|
| fr: `t.bafoeg.alter` | Renseigne-toi | En règle générale, le BAföG n'est versé que si l'on a moins de 45 ans au début de la formation. Il y a des exceptions. Renseignez-vous auprès du service. |
| fr: `t.bafoeg.vermEvtl` | tes propres enfants | Le patrimoine dépasse {verm}. 2 300 € de plus chacun ne sont exonérés que pour un conjoint ou partenaire enregistré et pour chacun de vos propres enfants (§ 29 BAföG). Sinon, le patrimoine réduit le BAföG de jusqu'à environ {monat} par mois. |
| fr: `t.bafoeg.ab30` | tu avais, tes, ton, tu étais | Si vous aviez déjà 30 ans au début de la formation, le revenu de vos parents ne compte alors pas (§ 11 Abs. 3 BAföG). Seuls comptent votre revenu, votre patrimoine et le revenu de votre conjoint ou partenaire enregistré. Si vous étiez plus jeune au début, le montant peut être plus bas. |
| fr: `egNach.hint` | Laisse vide | À remplir seulement si la personne qui reçoit l'Elterngeld travaille à temps partiel après la naissance. L'Elterngeld est alors calculé sur la différence avec le net d'avant la naissance. Laissez vide si elle ne travaille pas. |
| fr: `t.eg.teilzeitOffen` | Indique | Travailler à temps partiel après la naissance réduit l'Elterngeld. Indiquez alors le net après la naissance : l'appli en tiendra compte. |
| fr: `t.eg.teilzeit` | Ton net | Votre net à temps partiel ({nach}) est pris en compte : l'Elterngeld est versé sur la différence avec le net d'avant la naissance. Du net d'avant la naissance, {deckel} au plus sont retenus. |
| fr: `t.eg.teilzeitMin` | Ton net | Votre net à temps partiel ({nach}) est pris en compte. Il est si élevé qu'il ne reste que le montant minimum de {min} (du net d'avant la naissance, {deckel} au plus sont retenus). |
| fr: `t.eg.teilzeitStunden` | tu ne reçois, tu travailles | Important : vous ne recevez l'Elterngeld que si vous travaillez au plus 32 heures par semaine en moyenne. |
| fr: `t.kiz.ae7` | Fais la demande | Si un enfant n'a pas encore 7 ans, ou si deux ou trois enfants ont moins de 16 ans, un besoin supplémentaire plus élevé pour les parents seuls (Mehrbedarf für Alleinerziehende, 36 %) compte pour le supplément pour enfants (Kinderzuschlag). Il peut alors rester du Kinderzuschlag. Faites la demande, la Familienkasse calcule avec l'âge exact. |
| fr: `t.kiz.knappKindEink` | Fais la demande | C'est juste : la pension alimentaire (Unterhalt) ou l'avance sur pension (Unterhaltsvorschuss) des enfants compte à 45 % comme revenu pour le Kinderzuschlag. Si un enfant a sa propre assurance (par exemple responsabilité civile), la Familienkasse déduit d'abord 30 € par mois. Il peut alors rester du Kinderzuschlag. Faites la demande, la Familienkasse calcule précisément. |
| fr: `t.kiz.kindEinkNein` | Tu peux | Sans la pension alimentaire (Unterhalt) ou l'avance sur pension (Unterhaltsvorschuss) des enfants, il resterait du Kinderzuschlag. Mais la Familienkasse compte 45 % de ce revenu des enfants (§ 6a Abs. 3 BKGG). Les calculateurs en ligne qui ne le comptent pas affichent donc plutôt un droit. Vous pouvez quand même faire la demande. |
| zusatz: `t.bafoeg.vermTeil` | tes propres enfants | Le patrimoine dépasse l'abattement de {verm}. Les 2 300 € supplémentaires ne sont accordés que pour un conjoint ou partenaire enregistré et pour chacun de vos propres enfants. Seule la partie au-dessus de l'abattement compte : répartie sur 12 mois, elle réduit le BAföG d'environ {monat} par mois. L'Amt für Ausbildungsförderung fait le calcul exact. |

Die übrigen 20 neuen oder geänderten fr-Texte dieses Branches (zum Beispiel `egKinder.*`, `t.eg.mehrlinge*`, `sf.q.egKinder`) haben keine Anrede und bleiben, wie sie sind.

### b-sicherheit-mittel (3 Texte)

| Datei: Schlüssel | Stelle in du-Form | vous-Fassung (ganzer Text) |
|---|---|---|
| zusatz: `vg.pin.einfach` | Choisis-en | Ce code PIN est facile à deviner (par exemple 123456 ou 111111). Choisissez-en un autre. |
| zusatz: `vg.lesefehler` | Tes données, Déverrouille, rouvre | Vos données ne peuvent pas être lues pour le moment. Déverrouillez l'appareil et rouvrez SoLo. D'ici là, SoLo n'enregistre rien, pour que rien ne se perde. |
| zusatz: `f.empfSucheOrt` | tes données, Ajoute toi-même ta ville | La recherche ne contient aucune de vos données. Ajoutez vous-même votre ville dans le moteur de recherche. |

Die 5 geänderten PIN-Texte dieses Branches (`vg.pin.label`, `vg.pin.kurz`, `vgp.pin`, `vgp.pinNeu`, `vgp.format`) haben keine Anrede.

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| 862 Texte vollständig rückübersetzt; 14 Befunde in 23 Textstellen (siehe oben) | 1 hoch, 7 mittel, 6 niedrig | alle in den fr-Dateien korrigiert | deutsches Original `src/lang/**/de.json` im selben Stand |
| Platzhalter, Zahlen, Paragrafen unverändert | – | keine nötig | maschineller Vergleich alt/neu; `test/test-sprachen-zahlen.js` bestanden |
| Keine Reste der du-Form in #142 | – | keine nötig | Suche über alle 2.787 fr-Texte |
| 15 du-förmige Texte in b-buendel-n1 (12) und b-sicherheit-mittel (3) | mittel, erst beim Zusammenführen | vous-Fassungen oben, dort nicht geändert | `git diff origin/main...origin/claude/<branch>` |
| Sachliche Richtigkeit der Zahlen im deutschen Original | nicht geprüft | – | nicht Gegenstand von #142 |

Freigabe für #142: ja, mit den Korrekturen dieses Commits.
