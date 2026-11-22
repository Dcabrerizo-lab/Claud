# SoLo-Videos: Drehbuch → Comic-Hochformatvideo

Macht aus einem Drehbuch (Markdown, YAML oder JSON) ein Video 1080×1920, 30 fps, im SoLo-Comic-Stil,
mit Sprecherstimme (offline, Piper), kinetischen Untertiteln, Ton-Akzenten und leiser, selbst erzeugter Musik.
Leitlinien für Inhalt und Takt: `KONZEPT-2026.md` (verbindlich).

## Einmalig einrichten

```sh
cd tools/videos
./fonts-laden.sh          # Schibsted Grotesk 800 + Atkinson Hyperlegible 700 (OFL) → fonts/
./stimmen-laden.sh        # Piper-Stimmen → stimmen/ (je ca. 70 MB)
pip install --break-system-packages piper-tts pyyaml numpy
```
Playwright (Chromium) wird aus `node_modules` des Repos genommen, sonst `PLAYWRIGHT_PFAD=/pfad/node_modules/playwright`.
`fonts/`, `stimmen/` und `ausgabe/` sind per `.gitignore` ausgeschlossen (keine Binärdateien ins Repo).

## Aufruf

```sh
node video.js drehbuecher/00-so-hilft-dir-solo.md --aus /home/claude/ausgabe/videos
```

| Schalter | Wirkung |
|---|---|
| `--aus <ordner>` | Zielordner (Video `<datei>.mp4`, Arbeitsdateien in `.arbeit-<datei>/`) |
| `--probe voll` | nur Probebilder (PNG, volle Größe) vom vollsten Moment jeder Szene, kein Video |
| `--probe 1@0,4@2.5` | Probebilder Szene 1 bei 0 s und Szene 4 bei 2,5 s |
| `--nur 3,5` | nur diese Szenen neu rendern, Rest aus `.arbeit-…` wiederverwenden, dann neu zusammenfügen |
| `--aussprache` | Lautschrift (IPA) aller Sprechertexte ausgeben – Aussprache prüfen ohne Anhören |
| `--ohne-ton` | ohne Stimme/Musik |
| `--streng` | Abbruch, wenn Text in den Sicherheitszonen liegt |

Ablauf: Stimme je Szene erzeugen (zwischengespeichert) → Szenendauer = Sprechzeit + ca. 0,6 s (mindestens `dauer`) →
je Szene eine HTML-Seite in EINEM Headless-Chromium, Bild für Bild als JPEG an ffmpeg (libx264, crf 20, veryfast, yuv420p) →
Szenen per concat `-c copy` → Stimme + Musik (Ducking, 25 dB unter der Stimme) + Ton-Akzente → loudnorm −14 LUFS, AAC 192k, 48 kHz.
Rechenzeit auf 2 Kernen: ca. 10–20 s je Szene, 45-s-Video in gut 2 Minuten.

**Arbeitsweise für neue Videos:** Drehbuch schreiben → `--probe voll` → PNGs ansehen (Read) und Warnungen beheben →
ggf. `--probe 1@0` (erstes Bild = Haken!) → volles Rendern. Warnungen „Sicherheitszone“ immer beheben.

## Bildfläche und Sicherheitszonen

Koordinaten in Pixeln der Bühne 1080×1920 (0,0 = oben links). Das Comic-Panel liegt bei x 26–1054, y 26–1894.
**Text** muss liegen in: y ≥ 220, y ≤ 1540, x ≤ 920 (rechts 160 px frei), x ≥ 24. Das Werkzeug prüft alle Texte
am Szenenende und bei jedem Untertitel-Stück und warnt mit Pixelangabe. Figuren/Gegenstände dürfen überall hin.
Kamera-Zoom vergrößert um bis zu 8 % um den `fokus`: Text daher nicht bis an die Grenze legen (rechts ≤ 880).

## Drehbuch-Format (Markdown)

```markdown
---
titel: So hilft dir SoLo          # Anzeige im Protokoll
datei: 00-so-hilft-dir-solo       # Name der Ausgabedatei
serie: SoLo erklärt               # Folgen-Abzeichen oben links (Serien-Erkennung)
folge: 0                          # Folgen-Nummer; weglassen = kein Abzeichen
stimme: erzaehler                 # erzaehler (Standard, männlich, freundlich) | thorsten | lotsin (alt, weiblich)
tempo: 1.0                        # Sprechtempo (1.0 = Standard, langsam und deutlich; length_scale = 1/tempo)
musik: ja                         # nein = ohne Musik
musik_abstand_db: 25              # Musik so viel dB unter der Stimme
untertitel: auto                  # auto = kinetische Untertitel in Szenen ohne Sprechblase
untertitel_y: 1330                # Standardhöhe der Untertitel (Oberkante)
hervorhebung: [SoLo]              # Wörter, die überall farbig markiert werden
hervorhebung_farbe: gold          # gold | gruen
effekte: true                     # false = keine Ton-Akzente
schluss_halten: 1.2               # Sekunden, die die letzte Szene länger steht
aussprache: {"Jobcenter": "Dschobcenter"}   # eigene Ersetzungen nur für die Stimme
---

Freitext/Notizen sind erlaubt und werden ignoriert.

## 1 Haken                        ← jede Szene beginnt mit "## "
```yaml                           ← Inhalt als YAML (Zaun empfohlen)
sprecher: "…"
…
```
```

Alternativ eine reine YAML- oder JSON-Datei: dieselben Kopf-Felder auf oberster Ebene plus `szenen:` als Liste der Szenen (mit `name`).

### Felder einer Szene

| Feld | Bedeutung |
|---|---|
| `sprecher` | gesprochener Text (Anzeigeschreibweise; Aussprache wird automatisch angepasst: SoLo→Solo, Lotsin→Lohtsinn [ˈloːtsɪn], Lotse→Lohtße, Jobcenter→Dschopp-ßenter, Wohngeld→Wohn-Geld, Pflegekasse→Pflege-Kasse, BAföG→Bafög, €→Euro, Zahlen 0–99 → Wort, z. B.→zum Beispiel, § → Paragraf …). Pausen: 0,25 s zwischen Sätzen, 0,15 s vor wichtigen Zahlen (Beträge, Fristen, Zahlen mit hundert/tausend; automatisch). Bestimmt die Szenendauer. Erzähler-Perspektive: die Lotsin nicht in Ich-Form sprechen lassen („Die Lotsin zeigt dir …“); Ich-Form nur in Sprechblasen. |
| `dauer` | Mindestdauer in s (sonst Sprechzeit + 0,6 s) |
| `sprecher_start` | Beginn der Stimme in der Szene (Standard: Szene 1 sofort 0,05 s, sonst nach dem Panelwechsel) |
| `stimme`, `tempo` | wie im Kopf, nur für diese Szene |
| `hintergrund` | `hellblau` `blau` `navy` `gruen` `warm` `gold` `weiss` (mit Rasterpunkten) |
| `strahlen` | `true` = Comic-Strahlenkranz (für Höhepunkte) |
| `kamera` | `zoom-in` (Standard) `zoom-out` `schwenk-links` `schwenk-rechts` `ruck` (schneller Ruck-Zoom bei `ruck_bei` s) `ruhig` |
| `fokus` | `[x, y]` Mittelpunkt für Zoom und Strahlen |
| `uebergang` | `keiner` = harter Schnitt statt Panel-Wisch (Standard: Wisch 0,35 s rein / 0,3 s raus, mit „wusch“) |
| `oben` / `unten` | Bildunterschrift-Kasten: Text oder `{text, start, x, y}`; `oben` sitzt unter dem Abzeichen, `unten` direkt über der unteren Sicherheitszone |
| `titel` | großer Titel: Text oder `{text, y, groesse, start, auftritt, stil: hell|dunkel, ausrichtung: center}`; `\n` = Zeilenumbruch; Liste möglich. In Szene 1 standardmäßig ab dem ERSTEN Bild sichtbar („knall“). |
| `blase` / `blasen` | Sprechblase(n): `{text, x, y, breite, zipfel: [x, y], art: sprechen|denken, groesse (≥ 52, Standard 56), start, ende}`. Wörter erscheinen synchron zur Stimme. `zipfel` = Spitze (zum Kopf der Figur). |
| `untertitel` | `true` = Sprechertext als kinetischer Untertitel, `"Text"` = eigener Text, `false` = aus |
| `untertitel_y` | Oberkante der Untertitel in dieser Szene |
| `hervorhebung` | Wörter (Liste), die in Blase, Kasten, Titel, Checkliste und Untertitel farbig markiert werden |
| `laut` | Lautwort im Stern: `{text, x, y, start, farbe: weiss, groesse, drehung}` (x/y = Mitte; Breite automatisch). Sparsam! |
| `schilder` | kleine Wort-Etiketten: Liste `{text, x, y, start, farbe: gold|gruen|warm, groesse}` (x/y = Mitte) |
| `knall` | großer Bruch: `{oben, text, unten, y, start, groesse}` – Zahl/Wort knallt mit Blitz, Wackeln und Knall-Ton ins Bild |
| `checkliste` | `{titel, punkte: [..], x, y, breite, start}` – Häkchen schnappen nacheinander ein (mit „ding“), über die Sprechzeit verteilt; Punkt auch `{text, bei}` |
| `hinweis` | kleiner Text unten (z. B. „Stand: November 2026 · Keine Rechtsberatung“) |
| `ton` | zusätzliche Ton-Akzente: `["ding@1.2", "pop@2", {art: wusch, bei: 0.5, staerke: 0.7}]`; Arten: `pop` `wusch` `ding` `knall` `tick` |
| `basis` | Nummer einer früheren Szene, deren Felder übernommen werden (für die Schleife: letzte Szene `basis: 1`) |
| `bausteine` | Liste der Bildteile (siehe unten) |

Automatische Ton-Akzente: „wusch“ bei jedem Panelwechsel, „pop“ bei Sprechblasen, Lautwörtern, Schildern und
Bausteinen mit `auftritt: plopp`, „ding“ bei Häkchen, „knall“ beim Knall und beim Haken-Titel in Szene 1.

### Bausteine

`- {was: <name>, x: <Mitte>, y: <Unterkante/Füße>, hoehe: <px>, …}`

| Feld | Werte |
|---|---|
| `was` | Figuren: `lotsin` `mutter` `kind` `mutter-kind` `rentnerin` `student` `vater` `pflegerin` `rollstuhl` `rollstuhl-pflege` · Gegenstände: `brief` `brief_offen` `formular` `muenzen` `haus` `kalender` `handy` `lupe` `schloss` `mappe` `haken` `frage` `stapel` `weltkugel` `stern` · App-Bildschirm: `handy-app` |
| `pose` (Figuren) | `stehen` `winken` (Arm bewegt sich) `zeigen` (nach rechts; mit `spiegeln: true` nach links) `zeigenlinks` `denken` `freuen` `halten` `handy` |
| `mimik` | `freundlich` `freude` `sorge` `denken` |
| `haelt` | Gegenstand in der Hand, z. B. `brief` (mit `pose: halten`) |
| `spiegeln` | `true` = waagerecht spiegeln |
| `auftritt` | `keiner` (Standard) `plopp` `links` `rechts` `unten` `oben` `blende` `knall` |
| `start` | Zeitpunkt des Auftritts in s |
| `bewegung` | `wippen` (Standard Figuren) `schweben` (Standard Gegenstände) `pulsieren` `keine` |
| `ebene` | Stapelreihenfolge (höher = vorne) |

Typische Höhen: stehende Figur 850–1050 (Füße bei y 1880), Gruppe/Hintergrund 600–700, Gegenstand 150–300, `handy-app` 760–900.

**`handy-app`** (vereinfachter Comic-Handybildschirm, keine echten Screenshots):
```yaml
- {was: handy-app, x: 320, y: 1540, hoehe: 840, auftritt: unten, start: 0.2, bildschirm: {
    titel: "Das passt zu dir",
    fortschritt: {von: 5, bis: 95, start: 0.5, ende: 2.8},      # optional: Ladebalken
    zeilen: [{text: "Wohngeld", marke: wahrscheinlich}, {text: "Kinderzuschlag", marke: moeglich},
             {text: "Frist gemerkt", marke: frist, start: 2.5}],  # marke: wahrscheinlich moeglich haken frist schloss formular brief
    knopf: "Weiter"}}
```
Bildschirmtext ist kleiner (ca. 35 px) und Teil der Zeichnung; Wichtiges zusätzlich in Blase/Kasten/Untertitel sagen.
Handy-Mitte x ≤ 660, sonst ragt Bildschirmtext in die rechte Sicherheitszone.

Übersicht aller Figuren/Posen/Gegenstände: `node bausteine-blatt.js /tmp/bausteine.png`.

## Gestaltungsregeln (Kurzfassung von KONZEPT-2026.md)

1. Haken in 0–2 s: großer Titel im ersten Bild (Szene 1, `titel` ohne `start` erscheint sofort) + gesprochener Satz + auffälliges Bild.
2. Thema in den ersten 3 s nennen (Bild + Stimme). Mini-Geschichte mit EINER Alltagsfigur; die Lotsin hilft.
3. Alle 3–5 s neues Panel oder `kamera: ruck`; Szenen über 5 s mit Ruck.
4. In der Mitte ein `knall` auf anderem Hintergrund (z. B. navy + strahlen).
5. Checklisten-Moment („Trifft das auf dich zu?“).
6. Schluss: Ergebnis + Handlung + „Schick das jemandem, der es braucht“ + `hinweis` Stand/keine Rechtsberatung;
   letzte Szene `basis: 1` greift das erste Bild auf (Schleife).
7. 35–60 s, Du-Form, einfache Sprache. Nur belegte Zahlen (Quelle im Drehbuch-Freitext notieren). Keine erfundenen Statistiken.
8. Farben nur aus der Palette: Blau #2b4a9b, Navy #1a2456, Gold #f2b233 (sparsam), Hellblau-Grau #f2f5f9, Grün #17643f/#e2f3ea, Warm #fbefcf.

## Stimmen und Lizenzen

| Name | Modell | Lizenz (MODEL_CARD, geprüft 22.11.2026) | Hinweis |
|---|---|---|---|
| `erzaehler` (Standard, alle Videos) | `de_DE-thorsten_emotional-medium`, Sprecher „amused“ (Index 0, freundlicher Ton), männlich | Datensatz Thorsten-Voice **CC0**, feinjustiert aus `de_DE-thorsten-medium` (CC0) – **keine Namensnennung nötig** | Quelle: huggingface.co/rhasspy/piper-voices, github.com/thorstenMueller/Thorsten-Voice |
| `thorsten` | `de_DE-thorsten-medium` | Datensatz Thorsten-Voice **CC0**, Basismodell rdh CC0 | wie oben |
| `lotsin` (nicht mehr verwendet) | `de_DE-mls-medium`, Sprecher-Index 130 (weiblich) | Datensatz Multilingual LibriSpeech, **CC BY 4.0** – Namensnennung nötig, falls wieder genutzt | schwer verständlich (Entscheidung David, 22.11.2026) |

Alle Videos sprechen mit EINER Männerstimme (`erzaehler`) als Erzähler; die Figur Lotsin bleibt im Bild eine Frau.
Da die MLS-Stimme nicht mehr genutzt wird, ist **keine Namensnennung** in der Videobeschreibung nötig.

Nicht verwenden: `kerstin`, `karlsson`, `pavoque` (Basismodell Ryan bzw. Datensatz CC BY-NC-SA), `thorsten-high`
(Basismodell lessac, Blizzard-Lizenz), `eva_k`, `ramona` (M-AILABS ohne klare Lizenz).
Anderer Sprecher: `STIMMEN` in `stimme.py` anpassen (Pausen: `SATZPAUSE`, `ZAHLPAUSE`). Aussprache mit `--aussprache` prüfen
(Lautschrift; `|` = Satzgrenze, `‖` = Zahlpause). Ohne Hörprobe prüfen: Lautschrift, Lautheit −14 LUFS, keine abgeschnittenen Wörter.

Musik (`musik.py`) und Ton-Akzente (`mischen.py`) sind vollständig selbst synthetisiert (numpy), keine fremden Samples.
Schriften: Schibsted Grotesk und Atkinson Hyperlegible, SIL Open Font License 1.1, werden eingebettet (base64) – offline.

## Dateien

| Datei | Zweck |
|---|---|
| `video.js` | Hauptprogramm (Planung, HTML je Szene, Rendern, Prüfung, Ton) |
| `bausteine/figuren.js` | alle Figuren und Gegenstände als SVG (selbst gezeichnet) |
| `drehbuch.py` | liest .md/.yaml/.json → JSON |
| `stimme.py` | Piper-Stimme, Spur zusammensetzen, Lautschrift |
| `musik.py` | leise Synth-Musik (C–G–Am–F, 100 BPM) |
| `mischen.py` | Stimme + Musik (Ducking) + Ton-Akzente |
| `bausteine-blatt.js` | Übersichtsbild aller Bausteine |
| `drehbuecher/` | Drehbücher (`00-so-hilft-dir-solo.md` = Vorlage) |
