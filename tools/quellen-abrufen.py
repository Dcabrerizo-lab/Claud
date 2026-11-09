#!/usr/bin/env python3
# Lädt die Quellen aus content/quellen/QUELLEN.txt nach content/quellen/roh/ und schreibt content/quellen/abruf.json.
# Bewusst NICHT als GitHub-Workflow: von Hand auf dem eigenen Rechner starten, nur wenn Daten aktualisiert werden sollen
# (etwa einmal im Jahr). Höflich: ehrliche Kennung, Pause zwischen den Abrufen, keine Umgehung von Sperren. Lehnt eine Seite
# den Abruf ab (403/429), werden weitere Seiten desselben Anbieters übersprungen.
# Aufruf: python3 tools/quellen-abrufen.py [--alle]
import json, hashlib, subprocess, datetime, pathlib, sys, time, urllib.parse

WURZEL = pathlib.Path(__file__).resolve().parent.parent
ROH = WURZEL / "content/quellen/roh"
LOG = WURZEL / "content/quellen/abruf.json"
UA = "SoLo-Sozialleistungslotse-Datenabruf/1.0 (manueller Abruf fuer eine gemeinnuetzige App)"
PAUSE = 3  # Sekunden zwischen zwei Abrufen

def main():
    alle = "--alle" in sys.argv
    ROH.mkdir(parents=True, exist_ok=True)
    alt = {}
    try: alt = {e["datei"]: e for e in json.load(open(LOG, encoding="utf-8"))}
    except Exception: pass
    gesperrt, log = set(), []
    for line in open(WURZEL / "content/quellen/QUELLEN.txt", encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"): continue
        name, url = line.split(None, 1)
        f, e0 = ROH / name, alt.get(name)
        host = urllib.parse.urlparse(url).hostname
        if not alle and e0 and e0.get("url") == url and (f.exists() or not e0.get("ok")):
            log.append(e0); continue
        if host in gesperrt:
            print("SPERRE", name, "(Anbieter lehnt Abrufe ab, übersprungen)"); log.append(e0 or {"datei": name, "url": url, "ok": False, "http": 0}); continue
        r = subprocess.run(["curl", "-sSL", "-A", UA, "--connect-timeout", "20", "--max-time", "90", "-o", str(f), "-w", "%{http_code}", url],
                           capture_output=True, text=True)
        code = int(r.stdout.strip()) if r.stdout.strip().isdigit() else 0
        ok = code == 200 and f.exists() and f.stat().st_size > 0
        if not ok and f.exists(): f.unlink()
        if code in (403, 429): gesperrt.add(host)
        e = {"datei": name, "url": url, "http": code, "ok": ok, "bytes": f.stat().st_size if ok else 0,
             "sha256": hashlib.sha256(f.read_bytes()).hexdigest() if ok else None,
             "abgerufen": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        print(("OK    " if ok else "FEHLT ") + f"{code} {e['bytes']:>9} {name}")
        log.append(e)
        time.sleep(PAUSE)
    json.dump(log, open(LOG, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("Fertig. Danach: npm run build:data && npm test")

if __name__ == "__main__":
    main()
