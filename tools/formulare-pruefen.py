# Prüft die Jobcenter-Formulare (content/formulare/*.pdf): Für jede Ja/Nein-Frage (Optionsfeld) wird anhand der Lage auf
# der Seite bestimmt, welcher Wert „Ja“ und welcher „Nein“ bedeutet (Text „Ja“/„Nein“ rechts neben dem Kästchen).
# Schreibt content/formulare/katalog.json: je Formular Titel, Stand, Felder (Typ) und für Optionsfelder {ja, nein}.
# Aufruf: python3 -I tools/formulare-pruefen.py
import json, os, re, sys, glob
import pypdf
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DIR = os.path.join(ROOT, 'content', 'formulare')
kat = {}
fehler = []
for f in sorted(glob.glob(os.path.join(DIR, '*.pdf'))):
    name = os.path.basename(f)
    r = pypdf.PdfReader(f)
    fields = r.get_fields() or {}
    text0 = r.pages[0].extract_text() or ''
    stand = (re.search(r'(\d{2}/\d{4})', text0) or [None, ''])[1] if re.search(r'(\d{2}/\d{4})', text0) else ''
    titel = (r.metadata.title if r.metadata else '') or name
    eintrag = {'titel': titel, 'stand': stand, 'seiten': len(r.pages), 'geschuetzt': bool(r.is_encrypted), 'xfa': '/XFA' in r.trailer['/Root'].get('/AcroForm', {}), 'felder': {}}
    # Texte „Ja“/„Nein“ je Seite mit Lage
    for pi, p in enumerate(r.pages):
        jn = []
        def v(t, cm, tm, fd, fs):
            m = re.match(r'^(Ja|Nein)\b', t.strip())
            if m: jn.append((m.group(1), float(tm[4]), float(tm[5])))
        try: p.extract_text(visitor_text=v)
        except Exception: pass
        for a in p.get('/Annots') or []:
            a = a.get_object()
            par = a.get('/Parent')
            fname = par.get_object().get('/T') if par is not None else a.get('/T')
            if not fname or not str(fname).startswith(('rbtn', 'rtbn')) or '/AP' not in a: continue
            states = [k[1:] for k in a['/AP']['/N'].keys() if k != '/Off']
            if not states: continue
            x0, y0, x1, y1 = [float(z) for z in a['/Rect']]
            cy = (y0 + y1) / 2
            nah = [j for j in jn if 0 <= j[1] - x1 <= 40 and abs(j[2] - cy) <= 8]
            ent = eintrag['felder'].setdefault(str(fname), {'typ': 'radio'})
            if len(nah) == 1:
                ent['ja' if nah[0][0] == 'Ja' else 'nein'] = states[0]
    for k, v in fields.items():
        if k in eintrag['felder']: continue
        ft = v.get('/FT')
        eintrag['felder'][k] = {'typ': 'text' if ft == '/Tx' else ('check' if ft == '/Btn' else str(ft))}
    # Zwei Zustände und nur einer zugeordnet: der andere ist das Gegenteil (Zustände aus allen Widgets des Feldes)
    alle = {}
    for pi, p in enumerate(r.pages):
        for a in p.get('/Annots') or []:
            a = a.get_object(); par = a.get('/Parent')
            fname = par.get_object().get('/T') if par is not None else a.get('/T')
            if fname and '/AP' in a: alle.setdefault(str(fname), set()).update(k[1:] for k in a['/AP']['/N'].keys() if k != '/Off')
    for k, e in eintrag['felder'].items():
        if e['typ'] != 'radio': continue
        st = sorted(alle.get(k, []))
        if len(st) == 2 and ('ja' in e) != ('nein' in e):
            if 'ja' in e: e['nein'] = [x for x in st if x != e['ja']][0]
            else: e['ja'] = [x for x in st if x != e['nein']][0]
        if not ('ja' in e and 'nein' in e) or len(st) != 2:
            e['unklar'] = True
    kat[name] = eintrag
with open(os.path.join(DIR, 'katalog.json'), 'w', encoding='utf-8') as out:
    json.dump(kat, out, ensure_ascii=False, indent=1, sort_keys=True)
radios = [(n, k, e) for n, d in kat.items() for k, e in d['felder'].items() if e['typ'] == 'radio']
klar = [x for x in radios if not x[2].get('unklar')]
abw = [x for x in klar if not (x[2]['ja'] == '0' and x[2]['nein'] == '1')]
print('Formulare:', len(kat), '| Ja/Nein-Fragen:', len(radios), '| eindeutig zugeordnet:', len(klar), '| abweichend von Ja=0/Nein=1:', len(abw))
for n, k, e in abw[:20]: print('  ABWEICHEND', n, k, e)
for n, k, e in [x for x in radios if x[2].get('unklar')][:40]: print('  UNKLAR', n, k)
