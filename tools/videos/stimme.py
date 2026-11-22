#!/usr/bin/env python3
"""Sprecherstimme offline mit Piper (piper-tts).

  stimme.py sprechen <auftrag.json>   → erzeugt WAVs, gibt {id: sekunden} aus
  stimme.py spur <spur.json>          → setzt WAVs an Zeitpunkte, schreibt eine Mono-Spur

Stimmen (Lizenz geprüft, kommerzielle Nutzung erlaubt):
  lotsin    = de_DE-mls-medium, Sprecher-Index 130 (MLS-Sprecher "4463"), Datensatz CC BY 4.0 (Namensnennung nötig)
  erzaehler = de_DE-thorsten-medium, Datensatz CC0
"""
import hashlib, json, os, sys, wave
import numpy as np

STIMMEN = {
    'lotsin': {'modell': 'de_DE-mls-medium.onnx', 'sprecher': 130},
    'erzaehler': {'modell': 'de_DE-thorsten-medium.onnx', 'sprecher': None},
}
_geladen = {}


def stimme(name, ordner):
    from piper import PiperVoice
    cfg = STIMMEN[name]
    if name not in _geladen:
        _geladen[name] = PiperVoice.load(os.path.join(ordner, cfg['modell']))
    return _geladen[name], cfg


def sprechen(auftrag):
    from piper import SynthesisConfig
    ordner, ziel = auftrag['stimmen'], auftrag['ziel']
    os.makedirs(ziel, exist_ok=True)
    aus = {}
    for a in auftrag['texte']:
        name = a.get('stimme') or 'lotsin'
        tempo = float(a.get('tempo') or 1.0)
        h = hashlib.sha1(f"{name}|{tempo}|{a['text']}".encode()).hexdigest()[:12]
        pfad = os.path.join(ziel, f"{a['id']}-{h}.wav")
        if not os.path.exists(pfad):
            v, cfg = stimme(name, ordner)
            sc = SynthesisConfig(speaker_id=cfg['sprecher'], length_scale=1.0 / tempo)
            teile = list(v.synthesize(a['text'], sc))
            audio = np.concatenate([t.audio_int16_array for t in teile])
            # Stille am Anfang/Ende kappen
            schwelle = 300
            idx = np.where(np.abs(audio) > schwelle)[0]
            if len(idx):
                audio = audio[max(0, idx[0] - 400): idx[-1] + 1600]
            with wave.open(pfad + '.tmp', 'wb') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(teile[0].sample_rate)
                w.writeframes(audio.astype(np.int16).tobytes())
            os.replace(pfad + '.tmp', pfad)
        with wave.open(pfad) as w:
            aus[a['id']] = {'datei': pfad, 'sekunden': w.getnframes() / w.getframerate(), 'rate': w.getframerate()}
    return aus


def spur(auftrag):
    """auftrag: {laenge, ziel, teile:[{datei, start}]} → 48-kHz-Monospur (resampling linear)."""
    sr = 48000
    gesamt = np.zeros(int(auftrag['laenge'] * sr) + sr, dtype=np.float32)
    for t in auftrag['teile']:
        with wave.open(t['datei']) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            r = w.getframerate()
        if r != sr:
            x = np.arange(0, len(a) * sr / r) * r / sr
            a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
        s = int(t['start'] * sr)
        gesamt[s:s + len(a)] += a[: max(0, len(gesamt) - s)]
    gesamt = gesamt[: int(auftrag['laenge'] * sr)]
    with wave.open(auftrag['ziel'], 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(gesamt, -1, 1) * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    befehl, datei = sys.argv[1], sys.argv[2]
    auftrag = json.load(open(datei, encoding='utf-8'))
    if befehl == 'sprechen':
        json.dump(sprechen(auftrag), sys.stdout)
    elif befehl == 'lautschrift':
        for a in auftrag['texte']:
            v, _ = stimme(a.get('stimme') or 'lotsin', auftrag['stimmen'])
            print(a['id'], a['text'])
            print('   ', ' | '.join(''.join(x) for x in v.phonemize(a['text'])))
    elif befehl == 'spur':
        spur(auftrag)
