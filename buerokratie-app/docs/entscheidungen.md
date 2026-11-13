# Entscheidungen

David hat am 13.11.2026 die technischen Entscheidungen übertragen: „Zuverlässig, nutzerfreundlich, am Leistungs-Lotsen orientiert, passend für ihn und spätere Ideen. Muss nicht wie in der CLAUDE.md sein.“ Hier steht, was entschieden ist und warum. Neue Entscheidungen kommen unten dazu.

## E1 Offline-Regel: `connect-src 'self'` plus Test
Wie im Leistungs-Lotsen. `'none'` (CLAUDE.md) sperrt auch die eigenen App-Dateien (Sprachdaten, Schriften) und lässt sich nur mit Schlupflöchern umgehen. Der eigentliche Nachweis „kein Aufruf nach außen“ ist ein Test, der jede Anfrage außerhalb der App blockiert und zählt (`npm run test:offline`).

## E2 Technik wie der Lotse, plus TypeScript
- Oberfläche ohne Framework (wie der Lotse), Texte als flache JSON-Dateien pro Sprache mit `meta.dir`, dieselben 8 Sprachen (de, en, tr, ar, ru, uk, pl, ro), dieselben Schriften (Atkinson Hyperlegible für Lesbarkeit, Schibsted Grotesk für Überschriften), dieselben Farben, Hell/Dunkel und der Schalter „große Schrift“.
- TypeScript statt reinem JavaScript, weil der Kern als Bibliothek veröffentlicht werden soll und die Typen dort die Schnittstelle beschreiben.
- Build mit Vite: eine einzelne HTML-Datei (Web/Intranet, wie `dist/leistungs-lotse.html`) und `www/` für Capacitor (Android, iOS).

## E3 Kern ohne Oberfläche: `src/core/`
Tresor, Krypto, Speicher, Feldkatalog und Modul-Schnittstelle hängen nicht vom Browser-DOM ab. Damit sind sie als eigenständige Open-Source-Bibliothek veröffentlichbar (Prototype Fund) und in Node testbar.

## E4 Verschlüsselung
- AES-GCM 256 für die Daten. Ein zufälliger Datenschlüssel wird zweimal verpackt: mit der **Passphrase** und mit einem **Wiederherstellungscode** (20 Zeichen ohne Verwechsler, z. B. `7KQM-…`).
- Grund: Die Zielgruppe vergisst Passphrasen. Ohne Wiederherstellung wären alle Daten weg. Zum Ändern der Passphrase muss außerdem nichts neu verschlüsselt werden, und später lässt sich derselbe Mechanismus für die **Berater-Freigabe** nutzen.
- Schlüssel aus Passphrase: Argon2id (64 MiB, 3 Durchläufe, WebAssembly über hash-wasm, MIT). Rückfall PBKDF2-SHA256 mit 600 000 Runden. Dauer am Rechner ≈ 0,3 s, auf Handys erwartbar 1–3 s.
- Mindestens 8 Zeichen. Bewusst keine PIN: Ohne Hardware-Schlüsselspeicher im Browser wäre eine 6-stellige PIN bei gestohlenem Gerät in Minuten erraten.
- Manipulierte Daten werden erkannt (AES-GCM-Authentifizierung).

## E5 Speicher: IndexedDB
Ein verschlüsselter Datensatz `data` plus `meta` (verpackte Schlüssel, Parameter). Der Lotse nutzt Preferences/localStorage für kleine Klartext-Einstellungen. Der Tresor braucht mehr Platz und speichert nur Geheimtext, dafür passt IndexedDB (funktioniert in Browser, PWA und Capacitor-WebView). Zusätzlich wird der Browser gebeten, die Daten nicht zu löschen (`navigator.storage.persist`). Der verschlüsselte Export (M3) bleibt trotzdem Pflicht.

## E6 Feldkatalog als gemeinsames Vokabular
`data/feldkatalog.json`: stabile Schlüssel (`person.vorname`, Listen wie `haushalt[2].geburtsdatum`), Typ, Beschriftung je Sprache, Hilfetext, Synonyme für die Formularerkennung. Werte werden einheitlich gespeichert: Datum ISO, Betrag als Zahl, IBAN geprüft. Der Katalog deckt die Angaben des Lotsen ab (Haushalt, Kinder, Einkommen, Miete, PLZ, Bundesland, Vermögen, Pflegegrad, GdB), damit der Lotse später aus dem Tresor lesen kann (siehe E7). Schlüssel werden nie umbenannt, nur ergänzt.

## E7 Module
- Jedes Modul meldet an, welche Schlüssel es liest und schreibt (`reads`, `writes`), und bekommt nur damit Zugriff. Fehlende Werte fragt es einmal ab und schreibt sie zurück. Jedes Modul kann eigene Daten verschlüsselt im Tresor ablegen (z. B. Formular-Vorlagen, Fristen).
- Änderungen werden an alle Module gemeldet, die den Schlüssel lesen dürfen.
- **Leistungs-Lotse als Modul:** Im Test ist ein Dummy „Anspruchs-Check“ mit den Lotse-Angaben ohne Umbau angebunden. Der echte Lotse bekommt später einen kleinen Adapter `Tresor ↔ Lotse-Zustand` (`adults`, `kids`, `miete`, `netto`, `plz` …). Nebeneffekt: Seine persönlichen Angaben (Name, Geburtsdatum, Anschrift), die heute unverschlüsselt im Gerät liegen, wären dann im Tresor geschützt.

## E8 Namen in lateinischer Schrift
Namen werden so gespeichert, wie sie im Pass oder Aufenthaltstitel stehen (lateinische Schrift). Behörden erwarten das, und es vermeidet die RTL-Probleme im PDF. Die Oberfläche bleibt in allen 8 Sprachen nutzbar, Arabisch von rechts nach links.

## E9 Foto-Weg nur nach Freigabe
Kriterien in `plan.md`. Bis dahin ist er ein getrenntes Modul hinter einem Schalter. Der MVP hängt nicht davon ab.

## E10 Sperren
Automatisch nach 5 Minuten ohne Bedienung und sofort, wenn die App in den Hintergrund geht (Capacitor). Gesperrt heißt: Schlüssel und Klartext werden aus dem Speicher entfernt.

## E11 Ablage im Repo
Vorerst `buerokratie-app/` neben dem Lotsen im selben Repo. Das erleichtert das spätere Zusammenführen (gemeinsame Schriften, Texte, Build). Wird der Kern als Bibliothek veröffentlicht, zieht `src/core/` in ein eigenes öffentliches Paket um.

## E12 Nur in sicheren Kontexten
Ohne `https://` (oder Datei bzw. installierte App) gibt der Browser keine Verschlüsselung frei. Die App läuft dann bewusst nicht und erklärt, warum. Einrichtungen stellen sie per https bereit oder verteilen die Datei.
