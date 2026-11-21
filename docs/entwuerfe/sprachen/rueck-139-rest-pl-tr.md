# Rückübersetzungs-Prüfung PR #139: Rest Polnisch und Türkisch (21.11.2026)

Dritte, unabhängige Prüfung. Grundlage: `git diff origin/main...origin/claude/b-sprachen-glossar -- src/lang`.
Die beiden ersten Vermerke nennen nicht, welche unkritischen Texte in der Stichprobe waren. Deshalb wurde die ganze Gruppe gelesen: alle geänderten Texte, deren deutsches Original keine Zahl, keinen Paragrafen und nicht die Wörter Frist, Bescheid, Antrag oder PIN enthält. Die ungelesenen Texte liegen vollständig in dieser Gruppe.

## Umfang

| Sprache | Geändert in PR #139 | Hier zurückübersetzt | Zusätzlich per Suche geprüft | Texte korrigiert |
|---|---|---|---|---|
| pl | 865 | 584 (alle ohne Zahl/Frist, darin die 271 bisher ungelesenen) | Anrede in allen 2 755 polnischen Texten, auch den unveränderten | 139 |
| tr | 701 | 503 (alle ohne Zahl/Frist, darin die 281 bisher ungelesenen) | Anrede in allen 2 755 türkischen Texten, auch den unveränderten | 178 |

Verfahren: jeden Text ins Deutsche zurückgelesen und mit dem deutschen Text des gleichen Schlüssels verglichen (Sinn, Zusagen, Anrede, Grammatik, deutsche Amtsbegriffe). Die Rechtsaussagen der deutschen Originale waren nicht Gegenstand; es wurde keine Zahl, Frist oder Paragrafen-Angabe geändert.

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| pl und tr: Die Anrede war nicht einheitlich. In unveränderten Hinweistexten stand weiter die Du-Form (pl zum Beispiel „Nie wliczaj“, „Zbieraj“, „Zasięgnij porady“, „Działaj dziś“, „wasz majątek“; tr zum Beispiel „kontrol et“, „öde“, „yeni kredi alma“, „dikkat et“, „Lütfen … bekle“). Beide früheren Vermerke meldeten „keine Du-Form mehr“ | hoch | pl rund 45 Texte auf „Proszę …“/„Państwa“, tr rund 55 Texte auf siz-Form umgestellt | Vorgabe Anrede; Suche über alle Dateien in `src/lang` |
| tr: „Eltern“ als „aileniz“ (Familie) in Texten mit Rechtsfolge, zum Beispiel Befreiung vom Rundfunkbeitrag, BAB, Auszug unter 25, Kindergeld, Unterhalt. „Wenn Sie nicht bei Ihrer Familie wohnen“ hat einen anderen Sinn | hoch | durchgehend „anne babanız“ (rund 17 Texte) | de.json, gleicher Schlüssel |
| tr Kurz-Check: Schwerbehindertenausweis nur „Kimlik“ (= Personalausweis) in 10 Texten | mittel | „Engelli kimliği“, an drei Stellen mit „(Schwerbehindertenausweis)“ | de.json |
| tr `hb.hw.verm.gg*` (4 Texte): „möglicherweise“ als „muhtemelen“ (= wahrscheinlich) | mittel | „… olabilir“ / „ulaşabilirsiniz“ | de.json |
| tr `es.q.rente`, `es.q.renteBetrag`: „Rente“ nur als „emekli maaşı“ (Altersrente); gemeint ist auch die Erwerbsminderungsrente | mittel | „Aylık (Rente) … emekli veya malullük aylığı“ | de.json |
| pl und tr `sl.hilfe.3`: „muss darauf hinweisen“ als „muss dorthin überweisen“ übersetzt; tr „soll übernehmen“ als „muss“ | mittel | „poinformować“ / „bildirmek“; tr „kural olarak karşılaması gerekir“ | de.json; zur Soll-Regel siehe Vermerk rueck-139-pl-so-ps-faAF.md |
| pl `t.blindengeld.hochLand`, `t.blindengeld.pflegeLand`, `t.ausweis.gl`, `t.wbs.landJa`: „Bundesland“ nur als „kraj“ (liest sich als Staat, „in Ihrem Land“) | mittel | „kraj związkowy“ | de.json |
| pl `sc.f.haushalt`: „Verhältnis zu dir“ als „pokrewieństwo“ (Verwandtschaft; Partner fehlen) | mittel | „kim są dla Państwa“ | de.json |
| pl `t.wohngeld.eltern`: „Wohngeld składają rodzice“ (Wohngeld „einreichen“) | mittel | „O Wohngeld wnioskują … rodzice“ | de.json |
| pl `es.tipp.b`, tr `es.tipp.b`: „mit Bus und Bahn“ fehlte; pl `sp.schulden.rate.kurz`: „auf Dauer“ fehlte; pl `ip.w2.kurz`: „dann zusagen“ fehlte | niedrig | ergänzt | de.json |
| pl `sl.hilfe.2`: „kein fester Anspruch“ als „bez stałego prawa“ | niedrig | „nie ma do tego gwarantowanego prawa“ | de.json |
| pl `sl.warum.bussgeld`: Bußgeld als „mandat“ | niedrig | „grzywna administracyjna (Bußgeld)“, „(Erzwingungshaft)“ | de.json |
| pl und tr `sc.f.aufenthalt`: „Aufenthaltstitel“ stand als Klammer hinter „Aufenthaltsstatus“ | niedrig | Klammer an das richtige Wort gesetzt | de.json |
| pl `vg.pin.erkl`: Satz mit 13 Wörtern, `test/test-vorgaenge-app.js` rot (Fehler aus der ersten Prüfung) | niedrig | gekürzt, Test grün | test/test-vorgaenge-app.js |
| pl und tr: deutsche Amtsbegriffe fehlten (unter anderem Mahnbescheid, Vollstreckungsbescheid, Notfrist, Widerspruch, Wohngeldbescheid, Wohngeldgesetz, Mehrbedarf, Bildung und Teilhabe, Verbraucherzentrale, Wohnberechtigungsschein, gemischte Bedarfsgemeinschaft, Landesblindengeld, Budget für Arbeit, Betriebsrente, Darlehen, Sozialhilfeträger) | niedrig | in Klammern ergänzt | de.json |
| pl, tr: einzelne Sprachfehler (pl „Niewidomy i mało pieniędzy?“, „mieszkają we własnym?“, „Jako uczeń zawodu zgłasza …“; tr „Şüphede“, „En geç sonra“, „Size para hakkı var mı?“, „köprüleyebilir“, „{tag}'ya kadar“) | niedrig | berichtigt, Sinn unverändert | de.json |

## Vereinheitlicht

| Sprache | Begriff | Einheitliche Form | Texte |
|---|---|---|---|
| pl | Schuldnerberatung | „poradnia dłużników (Schuldnerberatung)“; Verbandsnamen deutsch (Bundesarbeitsgemeinschaft Schuldnerberatung) | 27 |
| pl | Rundfunkbeitrag | „opłata radiowo-telewizyjna (Rundfunkbeitrag)“ | 15 |
| pl | Regelbedarf, Regelsatz | „stawka podstawowa (Regelbedarf)“ beziehungsweise „(Regelsatz)“ | 13 |
| tr | Wohngeld | „kira yardımı (Wohngeld)“, auch Wohngeldstelle und Wohngeldgesetz | 12 |
| tr | Schuldnerberatung | „borç danışmanlığı (Schuldnerberatung)“ | 26 |
| tr | Rundfunkbeitrag | „yayın ücreti (Rundfunkbeitrag)“ | 15 |
| tr | Mietenstufe | „kira kademesi (Mietenstufe)“ | 6 |

Der Leistungsname in Klammern hinter dem deutschen Namen (`n.wohngeld`, `n.rundfunk`) bleibt ohne deutschen Zusatz, weil die App den deutschen Namen schon davorsetzt (`src/app.js`, Zeile 1160).

## Geprüft

| Prüfung | Ergebnis |
|---|---|
| `npm run build:web` | läuft |
| `node test/test-sprachen-zahlen.js` | bestanden, 33 060 Texte |
| `node tools/test-betroffen.js` | 25 von 26 grün, darunter test-vorgaenge-app.js nach der Korrektur |
| `node test/test-anzeige.js` | hier nicht lauffähig: der Prozess wird ohne Ausgabe beendet (Exit 137), auch auf dem unveränderten Branch. Ergebnis kommt von GitHub |

## Offen

- Knöpfe und Kacheln stehen in beiden Sprachen weiter in der kurzen Befehlsform („Zapisz“, „Sprawdź pismo“, „Kaydet“, „Kontrol et“). Das ist in polnischen und türkischen Apps üblich und wurde von den ersten Prüfern so gelassen. Wer auch dort die Höflichkeitsform will, muss etwa 150 Beschriftungen je Sprache ändern; das ist eine Entscheidung des Inhabers.
- Die türkische Du-Form lässt sich nicht an einer Endung erkennen. Gesucht wurde mit einer Liste von rund 130 Verben und über das letzte Wort jedes Satzes. Ein übersehener Rest in einem unveränderten Text ist möglich.
- tr: Kinderzuschlag heißt weiter „çocuk ek yardımı“, „çocuk ek ödeneği“ und „çocuk ek ödemesi“, immer mit dem deutschen Begriff. pl: „Pakiet edukacji i uczestnictwa“ (Leistungsname) neben „pakiet edukacyjny (Bildungspaket)“.
- pl: „Haft“ steht als „areszt“. Verständlich; genauer wäre bei der Ersatzfreiheitsstrafe „pozbawienie wolności“.
- Die 281 polnischen und 198 türkischen geänderten Texte mit Zahl, Frist, Bescheid, Antrag oder PIN wurden hier nicht noch einmal gelesen; sie sind laut den beiden ersten Vermerken vollständig geprüft. In dieser Gruppe hat diese Prüfung nur Anrede und Begriffe angeglichen.
- Kein Muttersprachler hat gelesen; die Prüfung ist eine Rückübersetzung durch ein Sprachmodell.

## Freigabe

pl ja · tr ja – beide nach den Korrekturen dieser Prüfung, mit den oben genannten offenen Punkten.
