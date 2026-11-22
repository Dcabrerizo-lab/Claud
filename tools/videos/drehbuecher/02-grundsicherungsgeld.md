---
titel: Grundsicherungsgeld
datei: 02-grundsicherungsgeld
serie: SoLo erklärt
folge: 2
stimme: erzaehler
tempo: 1.0
musik: ja
musik_abstand_db: 25
untertitel: auto
untertitel_y: 1060
hervorhebung: [SoLo]
---

# Folge 2 · Grundsicherungsgeld (früher Bürgergeld)

Übertragen aus docs/videos/drehbuecher/2-grundsicherungsgeld.md (Branch claude/b-videos, Stand nach Faktenprüfung,
Commit a72438cb). Texte und Zahlen wörtlich aus dem Drehbuch; Quellen siehe dort (§§ 7, 19, 37 SGB II; BMAS,
arbeitsagentur.de, abgerufen 21./22.11.2026). Figur: Verkäuferin in Teilzeit (Baustein `mutter`, weil der
Sprechertext von „ihr“ spricht). Layout-Regel: Figuren-Köpfe unterhalb y 1170, Untertitel bei y 1060,
Bildunterschrift oben – kein Text über Figuren.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.6
fokus: [540, 900]
sprecher: "Konto leer – obwohl du arbeitest? Dann geht es um Grundsicherungsgeld."
hervorhebung: [obwohl, du, arbeitest]
titel: {text: "Konto leer – obwohl du arbeitest?", groesse: 104, start: 0}
unten: {text: "Grundsicherungsgeld: Hilfe, wenn das Geld nicht reicht.", y: 700, start: 0.6}
schilder:
  - {text: "0,00 €", x: 700, y: 1300, farbe: warm, groesse: 72, start: 0.3}
bausteine:
  - {was: mutter, mimik: sorge, x: 270, y: 1880, hoehe: 700}
  - {was: kalender, x: 760, y: 1600, hoehe: 200, auftritt: plopp, start: 0.7}
  - {was: frage, x: 880, y: 1180, hoehe: 110, auftritt: plopp, start: 1.1}
```

## 2 Die Geschichte beginnt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 600]
sprecher: "Sie arbeitet Teilzeit. Aber Miete und Essen kosten mehr."
hervorhebung: [Teilzeit]
oben: "Teilzeit. Miete. Zu wenig übrig."
blase: {text: "Ich arbeite doch. Warum reicht es nicht?", x: 60, y: 470, breite: 600, zipfel: [260, 1140]}
bausteine:
  - {was: mutter, mimik: sorge, x: 260, y: 1880, hoehe: 740}
  - {was: lotsin, pose: halten, haelt: mappe, x: 820, y: 1880, hoehe: 880, auftritt: rechts, start: 0.2}
```

## 3 Was ist das?
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 560]
sprecher: "Das Bürgergeld heißt jetzt Grundsicherungsgeld. Es kann auch deinen Lohn aufstocken."
hervorhebung: [Grundsicherungsgeld]
oben: "Aufstocken = Lohn plus Geld vom Jobcenter."
blase: {text: "Neuer Name: Grundsicherungsgeld. Es kann deinen Lohn ergänzen.", x: 60, y: 500, breite: 680, zipfel: [800, 1000]}
schilder:
  - {text: "B̶ü̶r̶g̶e̶r̶g̶e̶l̶d̶", x: 330, y: 1120, farbe: warm, groesse: 48, start: 0.4}
  - {text: "Grundsicherungsgeld", x: 360, y: 1260, farbe: gold, groesse: 52, start: 1.4}
bausteine:
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 850, y: 1880, hoehe: 880}
  - {was: muenzen, x: 330, y: 1560, hoehe: 180, auftritt: plopp, start: 2.0}
```

## 4 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [450, 800]
sprecher: "Trifft das zu? Du bist fünfzehn bis Rentenalter. Du kannst arbeiten. Dein Geld reicht nicht."
untertitel: false
hervorhebung: [reicht, nicht]
oben: "Du musst in Deutschland leben. Für manche gibt es Ausnahmen."
checkliste:
  titel: "Trifft das auf dich zu?"
  y: 480
  punkte: ["15 Jahre bis Rentenalter", "Du kannst arbeiten", "Dein Geld reicht nicht zum Leben"]
bausteine:
  - {was: mutter, pose: denken, x: 260, y: 1880, hoehe: 660}
  - {was: lotsin, pose: halten, haelt: formular, x: 820, y: 1880, hoehe: 680}
```

## 5 Großer Bruch: der Betrag
```yaml
hintergrund: gold
strahlen: true
kamera: zoom-out
fokus: [540, 800]
sprecher: "Der Regelbedarf für Alleinstehende: fünfhundertdreiundsechzig Euro im Monat. Plus angemessene Miete und Heizung."
untertitel: false
oben: "Regelbedarf 2026, alleinstehend. Dein Lohn wird angerechnet."
knall: {text: "563 €", unten: "+ Miete und Heizung", y: 545, groesse: 280, start: 0.4}
bausteine:
  - {was: haus, x: 180, y: 1420, hoehe: 200, auftritt: plopp, start: 1.0}
  - {was: muenzen, x: 880, y: 1380, hoehe: 150, auftritt: plopp, start: 0.8}
  - {was: mutter, pose: freuen, mimik: freude, x: 540, y: 1880, hoehe: 600, auftritt: unten, start: 0.5}
```

## 6 Wichtig: Lohn zählt mit
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [540, 560]
sprecher: "Dein Lohn zählt mit, ein Teil bleibt frei. Das Jobcenter kann die Lücke füllen."
hervorhebung: [Lücke]
oben: "Ein Teil deines Lohns bleibt frei (Freibetrag)."
blase: {text: "Das Jobcenter kann die Lücke füllen.", x: 60, y: 500, breite: 620, zipfel: [810, 1000]}
schilder:
  - {text: "Lohn", x: 190, y: 1110, farbe: warm, groesse: 56, start: 0.4}
  - {text: "Bedarf", x: 520, y: 1110, farbe: gruen, groesse: 56, start: 0.8}
bausteine:
  - {was: muenzen, x: 190, y: 1420, hoehe: 200, auftritt: plopp, start: 0.6}
  - {was: muenzen, x: 520, y: 1420, hoehe: 140, auftritt: plopp, start: 1.4}
  - {was: stapel, x: 520, y: 1600, hoehe: 120, auftritt: plopp, start: 2.0}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 860, y: 1880, hoehe: 880}
```

## 7 Wo beantragen?
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [540, 600]
sprecher: "Der Antrag geht ans Jobcenter. Nimm Mietvertrag und Lohnzettel mit."
hervorhebung: [Jobcenter]
oben: "Zuständig: das Jobcenter an deinem Wohnort."
blase: {text: "Zum Jobcenter: Mietvertrag und Lohnzettel mitnehmen.", x: 60, y: 500, breite: 640, zipfel: [810, 1000]}
schilder:
  - {text: "Jobcenter", x: 400, y: 1090, farbe: gold, groesse: 60, start: 0.4}
bausteine:
  - {was: mutter, pose: halten, haelt: formular, x: 250, y: 1880, hoehe: 720}
  - {was: brief_offen, x: 520, y: 1420, hoehe: 170, auftritt: plopp, start: 1.2}
  - {was: lotsin, pose: stehen, x: 840, y: 1880, hoehe: 880}
```

## 8 Die Falle
```yaml
hintergrund: navy
kamera: ruck
ruck_bei: 2.2
fokus: [540, 900]
sprecher: "Die Falle: Es gilt erst ab dem Monat deines Antrags. Davor gibt es nichts."
hervorhebung: [nicht, warten]
oben: "Gilt ab dem 1. des Antragsmonats. Nicht warten."
titel: {text: "Nicht für Monate vor dem Antrag", groesse: 104, y: 520, start: 0.3}
bausteine:
  - {was: mutter, mimik: sorge, x: 270, y: 1880, hoehe: 700}
  - {was: kalender, x: 720, y: 1520, hoehe: 240, auftritt: plopp, start: 0.6}
  - {was: schloss, x: 880, y: 1330, hoehe: 140, auftritt: plopp, start: 1.2}
```

## 9 Erleichterung
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [540, 500]
dauer: 4
sprecher: "Sie stellt den Antrag noch diesen Monat."
hervorhebung: [diesen, Monat]
oben: "Antrag gestellt – noch im selben Monat."
blase: {text: "Gut, dass ich nicht länger gewartet habe.", x: 60, y: 500, breite: 620, zipfel: [260, 1130]}
bausteine:
  - {was: mutter, pose: freuen, x: 260, y: 1880, hoehe: 740}
  - {was: formular, x: 560, y: 1380, hoehe: 180, auftritt: plopp, start: 0.5}
  - {was: haken, x: 600, y: 1200, hoehe: 120, auftritt: plopp, start: 1.0}
  - {was: lotsin, pose: freuen, x: 840, y: 1880, hoehe: 860}
```

## 10 Prüf es mit SoLo
```yaml
hintergrund: hellblau
kamera: ruck
ruck_bei: 2.5
fokus: [540, 560]
sprecher: "Vielleicht passt Wohngeld besser. Prüf es in etwa fünf Minuten mit SoLo."
hervorhebung: [SoLo]
oben: "SoLo vergleicht, was wahrscheinlich oder möglich ist."
blase: {text: "Prüf es in etwa 5 Minuten mit SoLo.", x: 300, y: 500, breite: 560, zipfel: [820, 1000]}
bausteine:
  - {was: handy-app, x: 320, y: 1600, hoehe: 760, auftritt: unten, start: 0.2, bildschirm: {titel: "Das passt zu dir", zeilen: [{text: "Grundsicherungsgeld", marke: moeglich}, {text: "Wohngeld", marke: wahrscheinlich}, {text: "Kinderzuschlag", marke: moeglich}]}}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 850, y: 1880, hoehe: 880}
```

## 11 Schluss und Schleife
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
sprecher: "Lohn reicht nicht? Prüf es früh. Schick das jemandem, der es braucht."
hervorhebung: [früh]
titel: {text: "Lohn reicht nicht? Früh prüfen.", groesse: 104, start: 0.05, auftritt: plopp}
unten: {text: "Schick das jemandem, der es braucht.", y: 700, start: 0.6}
hinweis: "Stand: 22.11.2026 · keine Rechtsberatung"
schilder: []
bausteine:
  - {was: mutter, pose: freuen, x: 880, y: 1880, hoehe: 640}
  - {was: haken, x: 480, y: 1380, hoehe: 200, auftritt: plopp, start: 0.4}
```
