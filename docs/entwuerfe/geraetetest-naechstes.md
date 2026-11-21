# Gerätetest nächstes Update (Entwurf, 21.11.2026)

Gilt für den ersten Build, der „Sprachen nur bei Bedarf laden“ enthält (Branch claude/b-sprachladen).
Testen auf je einem echten Android-Handy und iPhone. Nichts Echtes eingeben.

Zeichen: ✓ = bestanden, ✗ = Fehler (kurz notieren, was passiert ist), – = nicht zutreffend.

## Sprachen nur bei Bedarf laden (ohne Netz)

Hintergrund: Beim Start lädt die App nur Deutsch und die gewählte Sprache. Die anderen Sprachen liegen als eigene Dateien im App-Paket und werden erst beim Wechsel geladen – ohne Internet.

| Nr. | Schritte | Erwartet | Android | iOS |
|---|---|---|---|---|
| S.1 | App frisch installieren, Flugmodus **an** (WLAN und mobile Daten aus), App öffnen | Startet normal auf Deutsch (bzw. in der Handy-Sprache, wenn es eine der 13 ist) | | |
| S.2 | Flugmodus an. Einstellungen → Sprache → **Arabisch** | Sofort Arabisch, Schrift von rechts nach links, kein Hinweis „konnte nicht geladen werden“ | | |
| S.3 | Flugmodus an. Sprache → **Ukrainisch** | Sofort Ukrainisch, kein Hinweis | | |
| S.4 | Flugmodus an. Sprache → **Somali** | Sofort Somali, kein Hinweis | | |
| S.5 | Flugmodus an. App ganz schließen (aus der App-Übersicht wischen), neu öffnen | App startet direkt auf Somali, ohne kurz Deutsch zu zeigen | | |
| S.6 | Flugmodus an. Auf der Startseite oben Sprachwahl → Arabisch, dann „Deutsch – Einfache Sprache“ | Beide Wechsel klappen; Einfache Sprache wie bisher | | |
| S.7 | Flugmodus an. Mappe/Ergebnis öffnen, Sprache wechseln (z. B. Russisch) | Inhalt in neuer Sprache neu gezeichnet; PDF teilen geht | | |
| S.8 | Beratungsmodus an → „Für Klient zusammenstellen“ → Blattsprache **Farsi** wählen (App-Sprache Deutsch) | Blatt erscheint (nach höchstens einem Augenblick) auf Farsi | | |
| S.9 | Flugmodus aus, Sprache zurück auf Deutsch | Alles wie vorher | | |
| S.10 | **Größe im Store-Paket**: Play Console → App-Bundle-Explorer bzw. App Store Connect → TestFlight-Build → Größe notieren; dazu Handy: Einstellungen → Apps → SoLo → Speicher | Größe notieren und mit 1.9.0 (VC 151) vergleichen. Erwartung: Paket etwa gleich groß (alle Sprachen bleiben offline im Paket), aber Start spürbar schneller | | |
| S.11 | Startzeit grob: App ganz schließen, öffnen, Stoppuhr bis Startseite sichtbar (je 3×, Mittelwert), alte und neue Fassung | Neue Fassung nicht langsamer, eher schneller | | |

Fehlerbild, auf das zu achten ist: Hinweis „Diese Sprache konnte gerade nicht geladen werden. Die App zeigt Deutsch.“ – darf im Flugmodus bei keiner Sprache erscheinen. Wenn doch: Sprache und Gerät notieren.
