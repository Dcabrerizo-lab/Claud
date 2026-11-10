# Anschriften mit dem Android-Handy sammeln

SoLo kennt die Anschriften der Ämter bisher nur für Bayern. Für die anderen Bundesländer sammelt dieses Skript die Anschriften aus den Impressum-Seiten der rund 300 Landkreise und kreisfreien Städte. Es läuft auf deinem Android-Handy in der kostenlosen App **Termux**. Dauer: etwa 20 bis 40 Minuten.

## 1. Termux installieren (einmalig)

1. Installiere **F-Droid** (ein seriöser, freier App-Store): auf dem Handy `f-droid.org` öffnen, „F-Droid herunterladen“, die Datei antippen und installieren. Das Handy fragt nach „Unbekannte Apps erlauben“, das für den Browser erlauben.
2. In F-Droid nach **Termux** suchen und installieren. Wichtig: Termux aus F-Droid nehmen, nicht aus dem Play Store, die Version dort ist veraltet.
3. Termux öffnen. Es erscheint ein schwarzes Fenster mit Text, das ist richtig.

## 2. Python einrichten (einmalig)

Tippe in Termux nacheinander diese Zeilen ein und bestätige jede mit der Eingabetaste:

```
pkg update -y
pkg install -y python
termux-setup-storage
```

Bei `pkg update` kommen eventuell Fragen, einfach mit Eingabetaste bestätigen. Bei `termux-setup-storage` fragt das Handy, ob Termux auf Dateien zugreifen darf: **Erlauben**.

## 3. Skript starten

1. Lade die Datei **`solo-anschriften.py`** aus dem Chat auf das Handy. Sie landet im Ordner **Download**.
2. Tippe in Termux:

```
python ~/storage/downloads/solo-anschriften.py
```

3. Das Skript zeigt, welche Behörde es gerade abruft, zum Beispiel `[12/302] Stadt Köln: 1 Anschrift(en)`. Das Handy am Ladekabel lassen und Termux geöffnet lassen.
4. Bricht es ab (Bildschirm aus, Netz weg), einfach denselben Befehl noch einmal eingeben. Es macht dort weiter, wo es aufgehört hat.

## 4. Ergebnis schicken

Am Ende steht `Fertig: ... Datei: .../solo-anschriften.json`. Die Datei **`solo-anschriften.json`** liegt im Ordner **Download**. Schick sie mir hier im Chat (über das Büroklammer-Symbol anhängen).

Ich übernehme dann nur Anschriften, deren Postleitzahl im eigenen Kreis der Behörde liegt. Alles andere wird verworfen.

## Was das Skript tut und was nicht

- Es ruft nur öffentliche Seiten auf: die Startseite und das Impressum jeder Behörde.
- Es meldet sich ehrlich als „SoLo-Sozialleistungslotse“, beachtet die Regeln der Seiten (robots.txt) und wartet 3 Sekunden zwischen den Abrufen.
- Lehnt eine Seite den Abruf ab, wird sie übersprungen, nicht umgangen.
- Es sendet keine Daten von dir irgendwohin und speichert nur die eine Ergebnisdatei.
- Datenvolumen: etwa 50 bis 150 MB. Am besten im WLAN starten.
