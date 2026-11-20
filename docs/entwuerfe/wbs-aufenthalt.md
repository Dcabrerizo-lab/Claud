# Entwurf: WBS-Prüfung beachtet den Aufenthalt (für die Version nach 1.6.0)

Stand: 20.11.2026 · Status: vorgemerkt, noch nicht umgesetzt

## Fehler in 1.6.0 (148)
`wbs(h)` in `src/rules.js` prüft nur das Einkommen. Wer „Asylverfahren/Duldung“ angibt (`h.asyl`), bekommt bei geringem Einkommen „Ja“. Das ist meist falsch. Bei Wohngeld, Kinderzuschlag und Grundsicherungsgeld fragt die App den Aufenthalt schon ab.

## Rechtslage (vor dem Einbau mit amtlicher Quelle bestätigen)
- § 27 Abs. 2 Satz 2 WoFG: Wohnberechtigt ist nur, wer rechtlich in der Lage ist, auf längere Dauer einen Wohnsitz zu begründen. https://www.gesetze-im-internet.de/wofg/__27.html (Abruf 20.11.2026)
- Duldung: in der Regel kein WBS (Rechtsprechung, z. B. asyl.net M29312, M19823)
- Ausbildungsduldung mit noch mindestens 1 Jahr Gültigkeit: WBS möglich (asyl.net M27626, M27364)
- Aufenthaltsgestattung: meist nein, in Ausnahmefällen möglich; Praxis je Land verschieden (asyl.net M19823, M29575)
- Offen: Landesrecht Bayern (BayWoFG) und die anderen Länder prüfen

## Vorschlag
- Bei `h.asyl`: höchstens „möglich“, nie „Ja“
- Hinweis (Entwurf): „Mit Duldung oder Aufenthaltsgestattung gibt es den Wohnberechtigungsschein meist nicht. Ausnahme zum Beispiel bei Ausbildungsduldung. Frage beim Wohnungsamt.“
- Übersetzungen in allen Sprachen + Einfache Sprache; Amtsbegriff „Wohnberechtigungsschein“ deutsch erhalten
- Test in `test/` ergänzen (asyl + niedriges Einkommen → nicht „ja“)
- Vor dem Merge: unabhängige Prüfung (Fable)
