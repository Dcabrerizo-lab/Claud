#!/usr/bin/env python3
"""Erzeugt eine leise, freundliche Hintergrundmusik (selbst synthetisiert, keine fremden Samples).
  musik.py <sekunden> <ziel.wav>
Akkordfolge C – G – Am – F, 100 BPM: weiche Fläche, gezupftes Arpeggio, Bass. 48 kHz Stereo."""
import sys, wave
import numpy as np

SR = 48000
BPM = 100
TAKT = 4 * 60 / BPM
AKKORDE = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def ton(f, dauer, angriff=0.005, abkling=1.2, obert=0.25):
    t = np.arange(int(dauer * SR)) / SR
    env = np.minimum(1, t / angriff) * np.exp(-t / abkling)
    return env * (np.sin(2 * np.pi * f * t) + obert * np.sin(4 * np.pi * f * t))


def main(sek, ziel):
    n = int(sek * SR)
    L = np.zeros(n + SR * 4, dtype=np.float64); R = np.zeros_like(L)
    takte = int(np.ceil(sek / TAKT))
    achtel = TAKT / 8
    for k in range(takte):
        akk = AKKORDE[k % 4]
        s = int(k * TAKT * SR)
        # Fläche (langsamer Einsatz, leicht verstimmt → breit)
        t = np.arange(int(TAKT * SR)) / SR
        env = np.minimum(1, t / 0.6) * np.minimum(1, (TAKT - t) / 0.5)
        for i, nn in enumerate(akk):
            f = hz(nn)
            L[s:s + len(t)] += 0.05 * env * np.sin(2 * np.pi * f * 1.002 * t)
            R[s:s + len(t)] += 0.05 * env * np.sin(2 * np.pi * f * 0.998 * t)
        # Bass
        b = ton(hz(akk[0] - 24), TAKT, angriff=0.02, abkling=1.0, obert=0.1) * 0.16
        L[s:s + len(b)] += b; R[s:s + len(b)] += b
        # Arpeggio
        muster = [0, 1, 2, 1, 0, 2, 1, 2]
        for j, m in enumerate(muster):
            f = hz(akk[m] + 12)
            p = ton(f, 0.9, abkling=0.28) * 0.07
            st = s + int(j * achtel * SR)
            pan = 0.35 + 0.3 * (m / 2)
            L[st:st + len(p)] += p * (1 - pan); R[st:st + len(p)] += p * pan
    L, R = L[:n], R[:n]
    fade = np.minimum(1, np.arange(n) / (1.0 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.5 * SR))
    st = np.stack([L * fade, R * fade], axis=1)
    st /= max(1e-9, np.abs(st).max()) / 0.7
    with wave.open(ziel, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    main(float(sys.argv[1]), sys.argv[2])
