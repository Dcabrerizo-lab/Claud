#!/usr/bin/env python3
# SoLo - Sozialleistungslotse: Anschriften der Kreise und kreisfreien Städte außerhalb Bayerns sammeln.
# Läuft auf dem Android-Handy in der App Termux (oder auf jedem Computer mit Python 3). Nur Standardbibliothek.
#
# Was das Skript macht:
#  - ruft für jede Behörde die offizielle Startseite auf, sucht den Link zum Impressum und liest dort die Anschrift
#  - höflich: ehrliche Kennung, beachtet robots.txt, 3 Sekunden Pause, lehnt eine Seite ab, wird sie übersprungen
#  - speichert nach jeder Behörde; bricht es ab, einfach neu starten, es macht dort weiter
#  - findet es im Impressum keine Anschrift, liest es die „Adresse der Kreis-/Stadtverwaltung“ aus dem Wikipedia-Artikel
#    (normale Artikelseite, wie im Browser; robots.txt wird auch dort beachtet)
#  - Ergebnis: Datei solo-anschriften.json im Ordner Download des Handys. Diese Datei an Claude schicken.
#
# Die Liste der Behörden (BEHOERDEN unten) erzeugt tools/handy-skript-erzeugen.js aus content/behoerden-deutschland.json.
import json, os, re, sys, time, html, ssl, urllib.request, urllib.parse, urllib.robotparser

KENNUNG = "SoLo-Sozialleistungslotse/1.0 (gemeinnuetzige App; einmaliger Abruf der Impressum-Anschrift)"
PAUSE = 3
BEHOERDEN = []  # wird beim Erzeugen eingefügt

def ziel_datei():
    for d in [os.path.expanduser("~/storage/downloads"), os.path.expanduser("~/Downloads"), "."]:
        if os.path.isdir(d):
            return os.path.join(d, "solo-anschriften.json")
    return "solo-anschriften.json"

def holen(url):
    req = urllib.request.Request(url, headers={"User-Agent": KENNUNG, "Accept": "text/html,*/*;q=0.5", "Accept-Language": "de"})
    with urllib.request.urlopen(req, timeout=25, context=ssl.create_default_context()) as r:
        roh = r.read(1_500_000)
        cs = r.headers.get_content_charset() or "utf-8"
        return r.geturl(), roh.decode(cs, errors="replace")

ROBOTS = {}
def erlaubt(url):
    teile = urllib.parse.urlsplit(url)
    basis = teile.scheme + "://" + teile.netloc
    if basis not in ROBOTS:
        rp = urllib.robotparser.RobotFileParser()
        try:
            req = urllib.request.Request(basis + "/robots.txt", headers={"User-Agent": KENNUNG})
            with urllib.request.urlopen(req, timeout=15, context=ssl.create_default_context()) as r:
                rp.parse(r.read(300_000).decode("utf-8", errors="replace").splitlines())
        except Exception:
            rp.parse([])  # keine robots.txt: erlaubt
        ROBOTS[basis] = rp
    return ROBOTS[basis].can_fetch(KENNUNG, url)

def impressum_link(basis_url, seite):
    treffer = []
    for m in re.finditer(r'<a\b[^>]*href\s*=\s*["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', seite, re.S | re.I):
        href, text = m.group(1), re.sub(r"<[^>]+>", " ", m.group(2))
        t = (href + " " + text).lower()
        if "impressum" in t or "imprint" in t:
            treffer.append(urllib.parse.urljoin(basis_url, html.unescape(href)))
    # bevorzugt Links mit "impressum" in der Adresse
    treffer.sort(key=lambda u: ("impressum" not in u.lower(), len(u)))
    return treffer[0] if treffer else None

def zeilen(seite):
    s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", seite)
    s = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|h\d|address|dd|dt|td|th|span)>", "\n", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("\xa0", " ")
    return [re.sub(r"\s+", " ", z).strip() for z in s.split("\n") if z.strip()]

PLZ_ORT = re.compile(r"^(?:D-\s*)?(\d{5})\s+([A-ZÄÖÜ][\wÄÖÜäöüß .()/\-]{1,60})$")
STRASSE = re.compile(r"(stra(ß|ss)e|str\.|platz|weg|allee|ring|markt|gasse|damm|ufer|hof|berg|tor|graben|park|chaussee|wall|steig|promenade|Postfach)", re.I)

def anschriften(z):
    kand = []
    for i, l in enumerate(z):
        m = PLZ_ORT.match(l)
        if not m:
            # „Musterstraße 1, 12345 Ort“ in einer Zeile
            m2 = re.search(r"([A-ZÄÖÜ][^,]{2,60}?\s\d+\s?[a-zA-Z]?(?:[-–]\d+)?)\s*,\s*(\d{5})\s+([A-ZÄÖÜ][\wÄÖÜäöüß .()/\-]{1,60})", l)
            if m2 and STRASSE.search(m2.group(1)):
                kand.append({"zeilen": [m2.group(1).strip(), m2.group(2) + " " + m2.group(3).strip()], "plz": m2.group(2), "nr": i})
            continue
        davor = z[i - 1] if i > 0 else ""
        if davor and (STRASSE.search(davor) or re.search(r"\d", davor)) and len(davor) < 80:
            kand.append({"zeilen": [davor, m.group(1) + " " + m.group(2).strip()], "plz": m.group(1), "nr": i})
    # Anschriften nahe „Impressum/Anschrift/Herausgeber/Postanschrift“ zuerst
    marker = [i for i, l in enumerate(z) if re.search(r"(impressum|anschrift|herausgeber|postanschrift|hausanschrift|anbieter)", l, re.I)]
    kand.sort(key=lambda k: min([abs(k["nr"] - m) for m in marker] or [999]))
    gesehen, aus = set(), []
    for k in kand:
        s = "|".join(k["zeilen"])
        if s not in gesehen:
            gesehen.add(s); aus.append({"zeilen": k["zeilen"], "plz": k["plz"]})
    return aus[:5]

def wiki_anschriften(titel):
    """Anschrift aus dem Infokasten des Wikipedia-Artikels („Adresse der Kreisverwaltung/Stadtverwaltung“)."""
    url = "https://de.wikipedia.org/wiki/" + urllib.parse.quote(titel.replace(" ", "_"))
    if not erlaubt(url): raise RuntimeError("robots.txt verbietet Wikipedia")
    url2, seite = holen(url); time.sleep(PAUSE)
    trenn = r"(?:\s|&#160;|&nbsp;|<[^>]+>)+"   # Leerraum oder Zeilenumbruch (<br />) im Infokasten
    m = re.search(r"Adresse" + trenn + r"der" + trenn + r"[\wäöüÄÖÜß-]*verwaltung\s*:?", seite, re.I)
    if not m: return url2, []
    stueck = seite[m.end(): m.end() + 2500]
    erg = anschriften(zeilen(stueck))[:3]
    for k in erg: k["zeilen"] = [z.lstrip(":;, ").strip() for z in k["zeilen"]]
    return url2, erg

def main():
    if not BEHOERDEN:
        print("Die Liste der Behörden fehlt. Bitte die Datei verwenden, die Claude geschickt hat."); return
    datei = ziel_datei()
    # Termux: Handy wach halten, damit das Skript auch im Hintergrund und bei ausgeschaltetem Bildschirm weiterläuft
    if os.system("termux-wake-lock >/dev/null 2>&1") == 0:
        print("Handy bleibt wach: Du kannst Termux verlassen und den Bildschirm ausschalten.")
    erg = {}
    if os.path.exists(datei):
        try: erg = json.load(open(datei, encoding="utf-8"))
        except Exception: erg = {}
    gesperrt = set()
    # Neu versuchen: noch nicht abgerufen oder mit vorübergehendem Fehler (kein Netz, Zeitüberschreitung).
    # Nicht neu: Seite lehnt ab (403/429), robots.txt verbietet es, oder es gibt kein Impressum.
    dauerhaft = re.compile(r"robots|403|429|kein Impressum")
    offen = [b for b in BEHOERDEN if b["ags"] not in erg
             or ("fehler" in erg[b["ags"]] and not dauerhaft.search(erg[b["ags"]]["fehler"]))
             or (b.get("wiki") and "wikipedia" not in erg[b["ags"]] and "wiki_fehler" not in erg[b["ags"]])]
    print(f"SoLo: {len(BEHOERDEN)} Behörden, davon noch {len(offen)} offen. Ergebnis: {datei}")
    print("Das dauert etwa 40 bis 60 Minuten. Handy am Strom lassen, Termux geöffnet lassen.\n")
    for n, b in enumerate(offen, 1):
        host = urllib.parse.urlsplit(b["web"]).netloc
        eintrag = {"name": b["name"], "web": b["web"], "zeit": time.strftime("%Y-%m-%d %H:%M")}
        try:
            if host in gesperrt: raise RuntimeError("Anbieter lehnt Abrufe ab")
            if not erlaubt(b["web"]): raise RuntimeError("robots.txt verbietet den Abruf")
            url, seite = holen(b["web"]); time.sleep(PAUSE)
            imp = impressum_link(url, seite)
            if not imp: raise RuntimeError("kein Impressum-Link gefunden")
            if not erlaubt(imp): raise RuntimeError("robots.txt verbietet das Impressum")
            url2, seite2 = holen(imp); time.sleep(PAUSE)
            eintrag.update({"impressum": url2, "kandidaten": anschriften(zeilen(seite2))})
            print(f"[{n}/{len(offen)}] {b['name']}: {len(eintrag['kandidaten'])} Anschrift(en)")
        except Exception as e:
            code = getattr(e, "code", None)
            if code in (403, 429): gesperrt.add(host)
            eintrag["fehler"] = (str(code) + " " if code else "") + str(e)[:200]
            print(f"[{n}/{len(offen)}] {b['name']}: Behördenseite übersprungen ({eintrag['fehler']})")
            time.sleep(PAUSE)
        # Zusätzlich Wikipedia (Ausweichquelle; die Übernahme bevorzugt das Impressum der Behörde)
        if b.get("wiki"):
            try:
                wurl, wk = wiki_anschriften(b["wiki"])
                eintrag.update({"wikipedia": wurl, "wiki_kandidaten": wk})
                if not eintrag.get("kandidaten"): print(f"      Wikipedia: {len(wk)} Anschrift(en)")
            except Exception as e:
                eintrag["wiki_fehler"] = str(e)[:200]
        erg[b["ags"]] = eintrag
        with open(datei, "w", encoding="utf-8") as f:
            json.dump(erg, f, ensure_ascii=False, indent=1)
    ok = sum(1 for e in erg.values() if e.get("kandidaten") or e.get("wiki_kandidaten"))
    print(f"\nFertig: {ok} von {len(erg)} Behörden mit Anschrift. Datei: {datei}")
    print("Bitte diese Datei an Claude schicken (im Chat anhängen).")
    os.system("termux-wake-unlock >/dev/null 2>&1")

if __name__ == "__main__":
    main()
