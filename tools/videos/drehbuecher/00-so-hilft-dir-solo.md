---
titel: So hilft dir SoLo
datei: 00-so-hilft-dir-solo
serie: SoLo erklärt
folge: 0
stimme: erzaehler
tempo: 1.0
musik: ja
musik_abstand_db: 25
untertitel: auto
hervorhebung: [SoLo]
---

# So hilft dir SoLo (App-Vorstellung, Folge 0)

Aufbau nach konzept-2026: Haken 0–2 s → Lotsin hilft → Nutzen (Check, Knall „über 25“, Ergebnis,
Checkliste, Sprachen, Datenschutz) → Handlung + Teilen → letztes Bild greift das erste auf.
Zahlen nur: „über 25 Leistungen“, „13 Sprachen“, „etwa 5 Minuten“.

## 1 Haken
```yaml
hintergrund: warm
kamera: ruck
ruck_bei: 1.6
sprecher: "Briefe vom Amt – und keiner sagt dir, was dir zusteht?"
hervorhebung: [zusteht]
titel: {text: "Was steht\ndir zu?", groesse: 150, start: 0, ausrichtung: center}
laut: {text: "UFF!", x: 700, y: 820, start: 1.5}
bausteine:
  - {was: mutter, mimik: sorge, x: 290, y: 1880, hoehe: 980}
  - {was: brief, x: 760, y: 1120, hoehe: 210, auftritt: plopp, start: 0.25}
  - {was: formular, x: 640, y: 1400, hoehe: 230, auftritt: plopp, start: 0.6}
  - {was: brief_offen, x: 860, y: 1560, hoehe: 200, auftritt: plopp, start: 0.95}
  - {was: frage, x: 520, y: 1000, hoehe: 160, auftritt: plopp, start: 1.2}
```

## 2 Die Lotsin kommt
```yaml
hintergrund: hellblau
kamera: zoom-in
fokus: [600, 900]
sprecher: "Das ist die Lotsin. Sie zeigt dir SoLo."
blase: {text: "Ich bin deine Lotsin. Ich zeig dir SoLo!", x: 80, y: 380, breite: 560, zipfel: [620, 940]}
bausteine:
  - {was: lotsin, pose: winken, x: 720, y: 1880, hoehe: 1040, auftritt: rechts, start: 0.1}
  - {was: mutter, mimik: freundlich, x: 190, y: 1880, hoehe: 760, auftritt: links, start: 0.3}
```

## 3 Kurzer Check
```yaml
hintergrund: hellblau
kamera: ruck
fokus: [300, 1000]
sprecher: "Ein paar Fragen, in etwa 5 Minuten."
oben: "In etwa 5 Minuten"
hervorhebung: ["5", Minuten]
untertitel: false
bausteine:
  - {was: handy-app, x: 330, y: 1540, hoehe: 900, auftritt: unten, start: 0.2, bildschirm: {titel: "Kurzer Check", fortschritt: {von: 5, bis: 95, start: 0.5, ende: 2.8}, zeilen: [{text: "Wer wohnt bei dir?", marke: haken}, {text: "Wohnung und Miete", marke: haken}, {text: "Arbeit und Geld", marke: haken}], knopf: "Weiter"}}
  - {was: lotsin, pose: zeigen, spiegeln: true, x: 840, y: 1880, hoehe: 900}
```

## 4 Knall: über 25 Leistungen
```yaml
hintergrund: navy
strahlen: true
kamera: zoom-out
fokus: [540, 800]
sprecher: "SoLo prüft über 25 Leistungen."
untertitel: false
knall: {oben: "über", text: "25", unten: "Leistungen", y: 470, start: 0.4}
bausteine:
  - {was: stern, x: 170, y: 560, hoehe: 150, auftritt: plopp, start: 0.6}
  - {was: stern, x: 800, y: 1200, hoehe: 120, auftritt: plopp, start: 0.8}
  - {was: lotsin, pose: freuen, x: 540, y: 1880, hoehe: 640, auftritt: unten, start: 0.5}
```

## 5 Ehrliches Ergebnis
```yaml
hintergrund: gruen
kamera: zoom-in
fokus: [400, 1000]
sprecher: "Du siehst ehrlich: wahrscheinlich oder nur möglich."
oben: "Dein Ergebnis"
hervorhebung: [wahrscheinlich, möglich]
blase: {text: "Ehrlich: wahrscheinlich oder möglich.", x: 290, y: 460, breite: 570, zipfel: [820, 1000]}
bausteine:
  - {was: handy-app, x: 320, y: 1540, hoehe: 760, auftritt: unten, start: 0.2, bildschirm: {titel: "Das passt zu dir", zeilen: [{text: "Wohngeld", marke: wahrscheinlich}, {text: "Kinderzuschlag", marke: moeglich}, {text: "Bildung und Teilhabe", marke: wahrscheinlich}]}}
  - {was: lotsin, pose: denken, x: 840, y: 1880, hoehe: 920}
```

## 6 Checkliste
```yaml
hintergrund: warm
kamera: zoom-in
fokus: [450, 800]
sprecher: "Dazu: deine Antragsmappe, die Liste deiner Unterlagen und Hilfe bei Briefen."
untertitel: false
checkliste:
  titel: "Das bekommst du:"
  punkte: ["Antragsmappe mit Formularen", "Liste deiner Unterlagen", "Brief prüfen, Frist merken"]
bausteine:
  - {was: mutter, pose: freuen, x: 260, y: 1880, hoehe: 700}
  - {was: mappe, x: 700, y: 1500, hoehe: 300, auftritt: plopp, start: 1.0}
```

## 7 Sprachen
```yaml
hintergrund: blau
strahlen: true
kamera: zoom-out
fokus: [460, 940]
sprecher: "In 13 Sprachen und in Einfacher Sprache."
oben: "13 Sprachen + Einfache Sprache"
hervorhebung: ["13"]
untertitel: false
schilder:
  - {text: "Hallo", x: 200, y: 520}
  - {text: "Merhaba", x: 480, y: 520}
  - {text: "Bonjour", x: 760, y: 520}
  - {text: "Привіт", x: 210, y: 660}
  - {text: "Cześć", x: 480, y: 660}
  - {text: "Bună", x: 740, y: 660}
  - {text: "مرحبا", x: 150, y: 860}
  - {text: "Hello", x: 150, y: 1000}
  - {text: "سلام", x: 790, y: 860}
  - {text: "Привет", x: 770, y: 1000}
  - {text: "Einfache Sprache", x: 460, y: 1230, farbe: gold, start: 1.8, groesse: 52}
bausteine:
  - {was: weltkugel, x: 460, y: 1160, hoehe: 380, bewegung: pulsieren}
  - {was: rentnerin, mimik: freude, x: 140, y: 1880, hoehe: 680}
  - {was: rollstuhl-pflege, mimik: freude, x: 820, y: 1880, hoehe: 600}
```

## 8 Datenschutz
```yaml
hintergrund: navy
kamera: ruck
fokus: [400, 1000]
sprecher: "Alles bleibt auf deinem Handy. Kein Konto."
oben: "Alles bleibt auf deinem Handy"
hervorhebung: [Konto]
blase: {text: "Kein Konto nötig.", x: 400, y: 470, breite: 460, zipfel: [790, 1010]}
bausteine:
  - {was: handy-app, x: 310, y: 1540, hoehe: 840, auftritt: unten, start: 0.2, bildschirm: {titel: "Deine Daten", zeilen: [{text: "Bleiben auf dem Handy", marke: schloss}, {text: "Ohne Konto", marke: haken}]}}
  - {was: schloss, x: 560, y: 920, hoehe: 220, auftritt: plopp, start: 0.8}
  - {was: lotsin, pose: freuen, x: 830, y: 1880, hoehe: 900}
```

## 9 Handlung
```yaml
hintergrund: hellblau
kamera: ruck
ruck_bei: 3.0
fokus: [540, 1100]
sprecher: "Prüf in 5 Minuten mit SoLo, was dir zusteht. Schick das jemandem, der es braucht!"
hervorhebung: [zusteht, Schick]
hinweis: "Stand: November 2026 · Keine Rechtsberatung"
untertitel_y: 560
bausteine:
  - {was: mutter, pose: freuen, x: 260, y: 1880, hoehe: 780}
  - {was: lotsin, pose: handy, x: 760, y: 1880, hoehe: 880}
  - {was: haken, x: 520, y: 1040, hoehe: 170, auftritt: plopp, start: 1.6}
```

## 10 Schleife (greift Bild 1 auf)
```yaml
basis: 1
kamera: zoom-in
ruck_bei: 99
sprecher: "SoLo. Dein Sozialleistungslotse."
hervorhebung: [SoLo]
titel: {text: "Was steht\ndir zu?", groesse: 150, start: 0.05, auftritt: plopp, ausrichtung: center}
laut: {text: "SoLo!", x: 650, y: 820, start: 0.6, farbe: weiss}
untertitel: "SoLo – dein Sozialleistungslotse"
bausteine:
  - {was: mutter, pose: freuen, x: 330, y: 1880, hoehe: 980}
  - {was: haken, x: 760, y: 1120, hoehe: 200, auftritt: plopp, start: 0.3}
  - {was: mappe, x: 680, y: 1430, hoehe: 230, auftritt: plopp, start: 0.6}
  - {was: handy, x: 880, y: 1600, hoehe: 220, auftritt: plopp, start: 0.9}
```
