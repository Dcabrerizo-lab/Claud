#!/usr/bin/env python3
"""Mischt Stimme (mono), Musik (stereo, optional) und Ton-Akzente mit Ducking.
  mischen.py <stimme.wav> <musik.wav|-> <ziel.wav> [abstand_db=25] [effekte.json]
Musik liegt während der Sprache <abstand_db> dB unter dem Sprachpegel (RMS), in Sprechpausen 8 dB lauter.
Ton-Akzente (alle selbst synthetisiert): pop, wusch, ding, knall, tick."""
import sys, wave
import numpy as np

SR = 48000


def lies(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2)
        else:
            a = np.stack([a, a], axis=1)
        assert w.getframerate() == SR
    return a


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def effekt(art, st=1.0):
    rng = np.random.default_rng(7)
    def t_(d): return np.arange(int(d * SR)) / SR
    if art == 'pop':  # kurzer, weicher Plopp: Sinus mit fallender Tonhöhe
        t = t_(0.09); f = 900 * np.exp(-t * 28) + 260
        a = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.55
    elif art == 'tick':
        t = t_(0.03); a = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160) * 0.35
    elif art == 'ding':  # Glöckchen
        t = t_(0.9); a = sum(g * np.sin(2 * np.pi * 1318.5 * k * t) * np.exp(-t * (5 + 4 * k)) for k, g in [(1, .5), (2.01, .18), (3.0, .08)])
        a *= np.minimum(1, t / 0.003) * 0.7
    elif art == 'wusch':  # gefiltertes Rauschen, das an- und abschwillt
        t = t_(0.32); n = rng.standard_normal(len(t))
        k = np.exp(-np.linspace(-2.2, 2.2, len(t)) ** 2)
        b = np.convolve(n, np.ones(9) / 9, 'same') - np.convolve(n, np.ones(60) / 60, 'same')
        a = b * k * 0.5
    elif art == 'knall':  # tiefer Schlag + kurzes Rauschen
        t = t_(0.5); f = 120 * np.exp(-t * 9) + 45
        a = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 0.9
        n = rng.standard_normal(len(t)) * np.exp(-t * 40) * 0.25
        a = a + np.convolve(n, np.ones(5) / 5, 'same')
    else:
        return np.zeros(1)
    return a * st


def main(sp, mu, ziel, abstand=25.0, eff=None):
    v = lies(sp)
    m = lies(mu) if mu != '-' else np.zeros_like(v)
    n = max(len(v), len(m))
    v = np.pad(v, ((0, n - len(v)), (0, 0))); m = np.pad(m, ((0, n - len(m)), (0, 0)))
    mono = v[:, 0]
    # Sprach-Hüllkurve (10-ms-Blöcke)
    blk = SR // 100
    nb = n // blk
    e = np.sqrt(np.mean(mono[: nb * blk].reshape(nb, blk) ** 2, axis=1))
    aktiv = e > (np.max(e) * 0.03 if np.max(e) > 0 else 1)
    sprach_rms = rms_db(mono[: nb * blk].reshape(nb, blk)[aktiv]) if aktiv.any() else -20
    musik_rms = rms_db(m[:, 0]) if np.any(m) else 0
    # Ziel-Musikpegel während Sprache
    g_sprache = 10 ** ((sprach_rms - abstand - musik_rms) / 20)
    g_pause = g_sprache * 10 ** (8 / 20)
    # Gate mit Halten + Glätten (Angriff 60 ms, Freigabe 450 ms)
    halt = np.convolve(aktiv.astype(float), np.ones(25), 'same') > 0
    ziel_g = np.where(halt, g_sprache, g_pause)
    g = np.empty_like(ziel_g); cur = g_pause
    for i, z in enumerate(ziel_g):
        k = 1 - np.exp(-1 / (6 if z < cur else 45))
        cur += (z - cur) * k; g[i] = cur
    gs = np.repeat(g, blk)
    gs = np.pad(gs, (0, n - len(gs)), mode='edge')
    out = v + m * gs[:, None]
    if eff:
        import json
        ereignisse = json.load(open(eff))
        spitze = np.abs(mono).max() or 0.5
        for e in ereignisse:
            a = effekt(e['art'], float(e.get('staerke') or 1.0)) * spitze * 0.55
            s0 = int(e['t'] * SR)
            if s0 >= n:
                continue
            a = a[: n - s0]
            out[s0:s0 + len(a), 0] += a; out[s0:s0 + len(a), 1] += a
    out /= max(1.0, np.abs(out).max() / 0.98)
    with wave.open(ziel, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 25.0, sys.argv[5] if len(sys.argv) > 5 else None)
