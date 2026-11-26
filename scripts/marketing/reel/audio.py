"""
Sound design for the Dingin reel (30 s, 48 kHz stereo WAV).
0–10 s: night room tone, a thin tinnitus-like ring that slowly rises (kept quiet and short), a soft heartbeat for tension.
~10 s: a swell, the ring fades out and a warm chord blooms. 10–30 s: calm piano-like arpeggios over a soft pad; final chord.
Pure numpy, deterministic. Usage: python3 audio.py out.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def env(start, attack, hold, release):
    """Linear-in, hold, cosine-out envelope over the whole timeline."""
    e = np.zeros(N)
    a0, a1 = int(start * SR), int((start + attack) * SR)
    h1 = int((start + attack + hold) * SR)
    r1 = int((start + attack + hold + release) * SR)
    a1, h1, r1 = min(a1, N), min(h1, N), min(r1, N)
    if a1 > a0:
        e[a0:a1] = np.linspace(0, 1, a1 - a0)
    e[a1:h1] = 1
    if r1 > h1:
        e[h1:r1] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, r1 - h1)))
    return e


def db(x):
    return 10 ** (x / 20)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # one-pole, fine for 30 s
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def brown(n):
    w = rng.standard_normal(n)
    b = np.cumsum(w)
    b -= np.convolve(b, np.ones(4801) / 4801, mode='same')  # remove drift
    return b / (np.max(np.abs(b)) + 1e-9)


def note_freq(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o + 1) - 69) / 12)


L = np.zeros(N)
R = np.zeros(N)

# --- Act 1: night ------------------------------------------------------------------------------------------
room = brown(N) * db(-46) * (env(0, 0.4, 9.4, 1.2))
L += room
R += np.roll(room, 911)

ring_env = np.clip((t - 0.3) / 9.0, 0, 1) ** 1.4  # slow rise
ring_level = db(-46) + (db(-33) - db(-46)) * ring_env  # kept gentle: the audience already lives with this sound
ring_env_total = ring_level * env(0.3, 0.6, 8.9, 1.6)
ring = (np.sin(2 * np.pi * 6150 * t) + 0.35 * np.sin(2 * np.pi * 6190 * t + 1.1)) * (1 + 0.06 * np.sin(2 * np.pi * 0.7 * t))
L += ring * ring_env_total * 0.92
R += ring * ring_env_total

# heartbeat (3.2–9.8 s), lub-dub every ~0.92 s, rising tension
hb = np.zeros(N)
beat_t = 3.4
while beat_t < 9.6:
    for off, amp in ((0.0, 1.0), (0.22, 0.7)):
        s0 = int((beat_t + off) * SR)
        n = int(0.18 * SR)
        tt = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (58 - 18 * tt / 0.18) * tt) * np.exp(-tt * 26)
        hb[s0:s0 + n] += thump[: max(0, min(n, N - s0))] * amp
    beat_t += 0.92 - 0.04 * (beat_t - 3.4) / 6.2
hb *= db(-17) * np.clip((t - 3.2) / 3.0, 0.35, 1.0)
L += hb
R += hb

# --- Transition swell (8.8–10.6) and bloom (10.4) ----------------------------------------------------------
sw = rng.standard_normal(N) * env(8.6, 1.9, 0.0, 0.5)
sw = lowpass(sw * np.clip((t - 8.6) / 2.0, 0, 1), 2400) * db(-18)
L += sw
R += np.roll(sw, 300)


def pad_chord(notes, start, dur, level):
    out = np.zeros(N)
    e = env(start, 1.2, max(0.0, dur - 2.4), 1.8)
    for nm in notes:
        f = note_freq(nm)
        for det in (-0.12, 0.0, 0.12):
            ph = rng.uniform(0, 2 * np.pi)
            out += (np.sin(2 * np.pi * f * (1 + det / 100) * t + ph) + 0.25 * np.sin(2 * np.pi * 2 * f * t + ph)) / 3
    return out * e * level


def pluck(nm, start, level, decay=1.6):
    out = np.zeros(N)
    s0 = int(start * SR)
    n = min(int(3.5 * SR), N - s0)
    if n <= 0:
        return out
    tt = np.arange(n) / SR
    f = note_freq(nm)
    tone = np.sin(2 * np.pi * f * tt) + 0.42 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3) + 0.18 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 5)
    a = np.minimum(1, tt / 0.006)
    out[s0:s0 + n] = tone * a * np.exp(-tt * decay) * level
    return out


music = np.zeros(N)
# Progression (F major, warm): Fmaj9 → C/E → Dm9 → Bbmaj9 → Fmaj9 (end)
chords = [
    (['F3', 'A3', 'C4', 'E4', 'G4'], 10.4),
    (['E3', 'G3', 'C4', 'E4', 'G4'], 14.6),
    (['D3', 'F3', 'A3', 'C4', 'E4'], 18.8),
    (['Bb2', 'D3', 'F3', 'A3', 'C4'], 22.4),
    (['F2', 'C3', 'F3', 'A3', 'C4', 'G4'], 26.6),
]
for i, (notes, st) in enumerate(chords):
    end = chords[i + 1][1] if i + 1 < len(chords) else DUR
    music += pad_chord(notes, st - 0.3, end - st + 1.4, db(-27))
# bloom hit
for nm in ['F3', 'C4', 'A4', 'E5']:
    music += pluck(nm, 10.4, db(-21), decay=0.9)
# arpeggio, 76 bpm eighths, from 11.2 s; gentle, lower in the end card
arps = {10.4: ['F4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5', 'A4'], 14.6: ['E4', 'G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4'],
        18.8: ['D4', 'F4', 'A4', 'C5', 'E5', 'C5', 'A4', 'F4'], 22.4: ['D4', 'F4', 'A4', 'C5', 'D5', 'C5', 'A4', 'F4'],
        26.6: ['F4', 'A4', 'C5', 'G5']}
step = 60 / 76 / 2
for st, seq in arps.items():
    x = st + (0.8 if st == 10.4 else 0.0)
    i = 0
    end = min([c for c in arps if c > st] + [DUR - 1.2])
    while x < end - 0.05:
        nm = seq[i % len(seq)]
        lvl = db(-25) if st < 26 else db(-27)
        music += pluck(nm, x, lvl * (0.85 + 0.15 * ((i % 4) == 0)))
        x += step * (2 if st == 26.6 else 1)
        i += 1
# final low note
music += pluck('F2', 26.6, db(-18), decay=0.6)

# simple stereo reverb: a few feedback delays, then mix
def reverb(x, taps=((0.031, 0.5), (0.047, 0.42), (0.061, 0.36), (0.083, 0.3)), fb=0.55, mix=0.32):
    y = x.copy()
    for d, g in taps:
        k = int(d * SR)
        buf = np.zeros_like(x)
        for rep in range(1, 7):
            sh = k * rep
            if sh >= len(x):
                break
            buf[sh:] += x[:-sh] * (g * fb ** (rep - 1))
        y += buf * mix
    return y

music_l = reverb(music)
music_r = reverb(np.roll(music, 211), taps=((0.037, 0.5), (0.053, 0.42), (0.067, 0.36), (0.089, 0.3)))
music_env = np.clip((t - 10.0) / 0.6, 0, 1) * env(0, 0.0, DUR - 1.4, 1.4)
L += music_l * music_env
R += music_r * music_env

# --- Master ------------------------------------------------------------------------------------------------
st = np.stack([L, R], axis=1)
st -= st.mean(axis=0)
peak = np.max(np.abs(st))
st = st / peak * db(-1.0)
# gentle loudness lift for phones: soft-clip limiter after +3 dB
st = np.tanh(st * db(3)) / np.tanh(db(3) * db(-1.0)) * db(-1.0)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'reel-audio.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote audio', st.shape, 'peak', float(np.max(np.abs(st))))
