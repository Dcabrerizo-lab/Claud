---
titel: Kinderzuschlag
datei: 04-kinderzuschlag
serie: SoLo erklärt
folge: 4
stimme: erzaehler
tempo: 1.0
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1040
hervorhebung: [SoLo]
---

# Folge 4 · Kinderzuschlag

Übertragen aus docs/videos/drehbuecher/4-kinderzuschlag.md (Branch claude/b-videos). Texte und Zahlen wörtlich.
Quellen (siehe Drehbuch): § 6a BKGG (gesetze-im-internet.de, abgerufen 22.11.2026);
Bundesagentur für Arbeit „Kinderzuschlag: Anspruch, Höhe, Dauer“ (abgerufen 22.11.2026): höchstens 297 € je Kind,
nicht rückwirkend, 6 Monate. „Klassenfahrt 120 €“ ist nur Requisite.

Aufbau: Text oben (Bildunterschrift, Titel/Blase, Untertitel bei y 1040), Figuren unten ab ca. y 1160.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.7
fokus: [480, 800]
sprecher: "Kinderzuschlag nur ohne Job? Falsch. Du brauchst sogar Einkommen."
oben: "Kinderzuschlag ist für Familien, die arbeiten und knapp sind."
hervorhebung: [Falsch.]
titel: {text: "Kinderzuschlag\nnur ohne Job?", groesse: 104, y: 500, start: 0, ausrichtung: center}
laut: {text: "FALSCH", x: 480, y: 870, start: 1.6, drehung: -8}
bausteine:
  - {was: mutter-kind, mimik: sorge, x: 300, y: 1880, hoehe: 700}
  - {was: kind, x: 820, y: 1880, hoehe: 440, auftritt: plopp, start: 0.3}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Sie arbeitet und hat zwei Kinder. Trotzdem wird es eng."
oben: "Arbeit, zwei Kinder, wenig übrig."
hervorhebung: [Trotzdem, eng]
blase: {text: "Wie soll ich das noch bezahlen?", x: 60, y: 500, breite: 600, zipfel: [230, 1150]}
schilder:
  - {text: "Klassenfahrt 120 €", x: 610, y: 960, farbe: warm, start: 0.8}
bausteine:
  - {was: mutter-kind, mimik: sorge, x: 330, y: 1880, hoehe: 720}
  - {was: kind, x: 820, y: 1880, hoehe: 460}
  - {was: brief, x: 800, y: 1240, hoehe: 180, auftritt: plopp, start: 0.7}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Der Kinderzuschlag kommt zum Kindergeld dazu, bei kleinem Einkommen."
oben: "Kinderzuschlag, kurz KiZ: Extra-Geld für Kinder."
hervorhebung: [zusätzlich]
blase: {text: "Kinderzuschlag gibt es zusätzlich zum Kindergeld.", x: 60, y: 500, breite: 640, zipfel: [800, 1150]}
schilder:
  - {text: "Kindergeld", x: 230, y: 1400, farbe: warm, start: 0.5}
  - {text: "KiZ", x: 470, y: 1400, farbe: gold, start: 1.3}
bausteine:
  - {was: muenzen, x: 230, y: 1330, hoehe: 200, auftritt: plopp, start: 0.4}
  - {was: muenzen, x: 470, y: 1330, hoehe: 200, auftritt: plopp, start: 1.2}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 840, y: 1880, hoehe: 740, auftritt: rechts, start: 0.1}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [480, 800]
sprecher: "Trifft das zu? Du bekommst Kindergeld. Du verdienst im Monat mindestens sechshundert Euro brutto, als Paar neunhundert. Mit Zuschlag reicht das Geld."
oben: "Brutto = Lohn vor Steuern und Abgaben."
hervorhebung: ["600", "900", mindestens]
untertitel: false
checkliste:
  titel: "Trifft das auf dich zu?"
  x: 50
  y: 480
  breite: 860
  punkte: ["Du bekommst Kindergeld", "Einkommen brutto mind. 600 € (allein) oder 900 € (Paar) im Monat", "Mit Zuschlag reicht das Geld für die Familie"]
bausteine:
  - {was: mutter-kind, mimik: denken, x: 300, y: 1880, hoehe: 640}
  - {was: lotsin, pose: stehen, x: 850, y: 1880, hoehe: 680}
```

## 5 Knall: der Betrag
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [480, 720]
sprecher: "Bis zu zweihundertsiebenundneunzig Euro pro Kind und Monat. Je nach Einkommen."
oben: "Höchstbetrag 2026 je Kind. Oft ist es weniger."
untertitel: false
knall: {oben: "bis zu", text: "297 €", unten: "pro Kind", y: 500, groesse: 270, start: 0.4}
bausteine:
  - {was: kind, pose: freuen, x: 190, y: 1880, hoehe: 560, auftritt: links, start: 0.6}
  - {was: muenzen, x: 400, y: 1860, hoehe: 190, auftritt: plopp, start: 0.9}
  - {was: muenzen, x: 640, y: 1860, hoehe: 190, auftritt: plopp, start: 1.1}
  - {was: kind, pose: freuen, spiegeln: true, x: 860, y: 1880, hoehe: 560, auftritt: rechts, start: 0.7}
```

## 6 Wo beantragen?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [460, 900]
sprecher: "Antrag bei der Familienkasse, mit Lohnzetteln der letzten sechs Monate."
oben: "Zuständig: die Familienkasse, wie beim Kindergeld."
hervorhebung: [Familienkasse]
blase: {text: "Familienkasse, mit Lohnzetteln der letzten 6 Monate.", x: 60, y: 500, breite: 640, zipfel: [800, 1150]}
schilder:
  - {text: "Familienkasse – Kinderzuschlag", x: 420, y: 1060, farbe: warm, start: 0.6, groesse: 40}
bausteine:
  - {was: mutter, pose: handy, x: 230, y: 1880, hoehe: 720}
  - {was: stapel, x: 520, y: 1860, hoehe: 220, auftritt: plopp, start: 1.0}
  - {was: lotsin, pose: stehen, x: 840, y: 1880, hoehe: 740}
```

## 7 Die Falle
```yaml
hintergrund: navy
kamera: ruck
ruck_bei: 2.4
fokus: [480, 900]
sprecher: "Die Falle: Für die Zeit vor dem Antrag gibt es nichts. Und nach sechs Monaten neu beantragen."
oben: "Gilt ab dem Antragsmonat, jeweils für 6 Monate."
hervorhebung: [neu, beantragen.]
titel: {text: "Nicht rückwirkend.\nAlle 6 Monate neu.", groesse: 92, y: 500, start: 0.3}
ton: ["ding@3.0"]
bausteine:
  - {was: kalender, x: 280, y: 1700, hoehe: 380, auftritt: plopp, start: 0.4}
  - {was: schloss, x: 400, y: 1720, hoehe: 170, auftritt: plopp, start: 1.4}
  - {was: kalender, x: 740, y: 1700, hoehe: 380, auftritt: plopp, start: 2.6, bewegung: pulsieren}
```

## 8 Gut zu wissen
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [460, 900]
sprecher: "Dazu kannst du Bildung und Teilhabe beantragen, etwa für Klassenfahrten."
oben: "Bildung und Teilhabe extra beantragen."
hervorhebung: [Klassenfahrt]
blase: {text: "Auch die Klassenfahrt kann bezahlt werden.", x: 60, y: 500, breite: 620, zipfel: [800, 1150]}
schilder:
  - {text: "Bildung und Teilhabe", x: 320, y: 900, farbe: gruen, start: 0.6, groesse: 46}
  - {text: "Klassenfahrt", x: 260, y: 1090, farbe: warm, start: 1.0}
bausteine:
  - {was: kind, pose: halten, haelt: brief, x: 260, y: 1880, hoehe: 600}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 840, y: 1880, hoehe: 740}
```

## 9 Erleichterung
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [460, 900]
sprecher: "Antrag raus. Der nächste steht im Kalender."
oben: "Antrag gestellt. Erinnerung gesetzt."
hervorhebung: [Kalender.]
blase: {text: "Und in sechs Monaten denke ich dran.", x: 60, y: 500, breite: 600, zipfel: [240, 1150]}
bausteine:
  - {was: mutter, pose: handy, mimik: freude, x: 240, y: 1880, hoehe: 720}
  - {was: kind, pose: freuen, x: 520, y: 1880, hoehe: 440}
  - {was: kalender, x: 560, y: 1330, hoehe: 200, auftritt: plopp, start: 1.0}
  - {was: haken, x: 640, y: 1260, hoehe: 110, auftritt: plopp, start: 1.4}
  - {was: lotsin, pose: freuen, x: 850, y: 1880, hoehe: 720}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [400, 1000]
sprecher: "Dazu kann Wohngeld passen. Prüf es in etwa fünf Minuten mit Solo."
oben: "SoLo zeigt, was wahrscheinlich oder möglich ist."
hervorhebung: ["5", Minuten]
blase: {text: "Prüf es in etwa 5 Minuten mit SoLo.", x: 60, y: 500, breite: 600, zipfel: [820, 1080]}
bausteine:
  - {was: handy-app, x: 320, y: 1540, hoehe: 700, auftritt: unten, start: 0.2, bildschirm: {zeilen: [{text: "Kinderzuschlag"}, {text: "Wohngeld"}, {text: "Bildung und Teilhabe"}]}}
  - {was: lotsin, pose: handy, x: 850, y: 1880, hoehe: 800}
```

## 11 Schluss und Schleife (greift Bild 1 auf)
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
fokus: [480, 800]
sprecher: "Arbeit und Kinderzuschlag passen zusammen. Schick das einer Familie, die es braucht."
oben: "Schick das jemandem, der es braucht."
hervorhebung: [auch, mit, Job]
titel: {text: "Kinderzuschlag:\nauch mit Job", groesse: 104, y: 480, start: 0.05, auftritt: plopp, ausrichtung: center}
laut: null
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
bausteine:
  - {was: haken, x: 760, y: 960, hoehe: 190, auftritt: plopp, start: 0.4}
  - {was: mutter, pose: freuen, x: 890, y: 1880, hoehe: 700}
  - {was: kind, pose: freuen, x: 220, y: 1880, hoehe: 330}
  - {was: kind, pose: freuen, spiegeln: true, x: 560, y: 1880, hoehe: 330}
```
