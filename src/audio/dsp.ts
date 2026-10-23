/**
 * Pure-TypeScript DSP primitives used to synthesise therapeutic sounds on-device.
 * No native modules: everything here runs in Hermes inside Expo Go.
 */

export const SAMPLE_RATE = 44100;

export type NoiseColor = 'white' | 'pink' | 'brown';

/** Deterministic xorshift PRNG so loops are reproducible (helps gapless loop tests). */
export function makeRng(seed = 0x9e3779b9) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296; // [0,1)
  };
}

export function whiteNoise(n: number, rng = makeRng()): Float32Array {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = rng() * 2 - 1;
  return out;
}

/** Paul Kellet's economy pink-noise filter (−3 dB/octave). */
export function pinkNoise(n: number, rng = makeRng()): Float32Array {
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = rng() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return out;
}

/** Brown (red) noise: leaky integration of white noise (−6 dB/octave). */
export function brownNoise(n: number, rng = makeRng()): Float32Array {
  const out = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = rng() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = last * 3.5;
  }
  return out;
}

export function noise(color: NoiseColor, n: number, rng = makeRng()): Float32Array {
  switch (color) {
    case 'white':
      return whiteNoise(n, rng);
    case 'pink':
      return pinkNoise(n, rng);
    case 'brown':
      return brownNoise(n, rng);
  }
}

/** Second-order IIR section (RBJ cookbook). */
export class Biquad {
  private b0 = 1; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  private z1 = 0; private z2 = 0;

  static lowpass(fc: number, q = Math.SQRT1_2, fs = SAMPLE_RATE) {
    const f = new Biquad();
    const w0 = (2 * Math.PI * fc) / fs;
    const cs = Math.cos(w0), sn = Math.sin(w0);
    const alpha = sn / (2 * q);
    const a0 = 1 + alpha;
    f.b0 = ((1 - cs) / 2) / a0; f.b1 = (1 - cs) / a0; f.b2 = ((1 - cs) / 2) / a0;
    f.a1 = (-2 * cs) / a0; f.a2 = (1 - alpha) / a0;
    return f;
  }

  static highpass(fc: number, q = Math.SQRT1_2, fs = SAMPLE_RATE) {
    const f = new Biquad();
    const w0 = (2 * Math.PI * fc) / fs;
    const cs = Math.cos(w0), sn = Math.sin(w0);
    const alpha = sn / (2 * q);
    const a0 = 1 + alpha;
    f.b0 = ((1 + cs) / 2) / a0; f.b1 = (-(1 + cs)) / a0; f.b2 = ((1 + cs) / 2) / a0;
    f.a1 = (-2 * cs) / a0; f.a2 = (1 - alpha) / a0;
    return f;
  }

  static bandpass(fc: number, q: number, fs = SAMPLE_RATE) {
    const f = new Biquad();
    const w0 = (2 * Math.PI * fc) / fs;
    const cs = Math.cos(w0), sn = Math.sin(w0);
    const alpha = sn / (2 * q);
    const a0 = 1 + alpha;
    f.b0 = alpha / a0; f.b1 = 0; f.b2 = -alpha / a0;
    f.a1 = (-2 * cs) / a0; f.a2 = (1 - alpha) / a0;
    return f;
  }

  process(x: Float32Array): Float32Array {
    const out = new Float32Array(x.length);
    let z1 = this.z1, z2 = this.z2;
    const { b0, b1, b2, a1, a2 } = this;
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      const y = b0 * v + z1;
      z1 = b1 * v - a1 * y + z2;
      z2 = b2 * v - a2 * y;
      out[i] = y;
    }
    this.z1 = z1; this.z2 = z2;
    return out;
  }
}

/** 4th-order Butterworth (two cascaded biquads with Q = 0.5412 and 1.3066). */
export function butterworth4(kind: 'lowpass' | 'highpass', fc: number, x: Float32Array): Float32Array {
  const q1 = 0.54119610, q2 = 1.30656296;
  const mk = kind === 'lowpass' ? Biquad.lowpass : Biquad.highpass;
  return mk(fc, q2).process(mk(fc, q1).process(x));
}

/**
 * Band-stop ("notched") filter implemented as the parallel sum of a 4th-order low-pass
 * below the notch and a 4th-order high-pass above it. `octaves` is the total notch width
 * (1.0 = one octave centred on fc, as in tailor-made notched music therapy).
 */
export function notchFilter(x: Float32Array, fc: number, octaves = 1): Float32Array {
  const half = Math.pow(2, octaves / 2);
  const lo = fc / half;
  const hi = Math.min(fc * half, SAMPLE_RATE * 0.45);
  // Three cascaded 4th-order sections (72 dB/octave) give ≈30 dB attenuation at the notch centre.
  let low = x, high = x;
  for (let i = 0; i < 3; i++) { low = butterworth4('lowpass', lo, low); high = butterworth4('highpass', hi, high); }
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = low[i] + high[i];
  return out;
}

/** Band-pass noise centred at fc with the given octave bandwidth (used for narrow-band maskers). */
export function bandpassNoise(x: Float32Array, fc: number, octaves = 1): Float32Array {
  const half = Math.pow(2, octaves / 2);
  const lo = fc / half, hi = Math.min(fc * half, SAMPLE_RATE * 0.45);
  return butterworth4('lowpass', hi, butterworth4('highpass', lo, x));
}

export function sine(freq: number, n: number, phase = 0, fs = SAMPLE_RATE): Float32Array {
  const out = new Float32Array(n);
  const k = (2 * Math.PI * freq) / fs;
  for (let i = 0; i < n; i++) out[i] = Math.sin(k * i + phase);
  return out;
}

/** Frequency-modulated ("warble") tone, ±depth (fraction of f0) at rate Hz. Reduces standing waves and adaptation during pitch matching. */
export function warbleTone(f0: number, n: number, rateHz = 5, depth = 0.05, fs = SAMPLE_RATE): Float32Array {
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const inst = f0 * (1 + depth * Math.sin((2 * Math.PI * rateHz * i) / fs));
    phase += (2 * Math.PI * inst) / fs;
    out[i] = Math.sin(phase);
  }
  return out;
}

/** Sinusoidal amplitude modulation (e.g. 40 Hz, depth 0..1). */
export function amplitudeModulate(x: Float32Array, rateHz: number, depth = 1, fs = SAMPLE_RATE): Float32Array {
  const out = new Float32Array(x.length);
  const k = (2 * Math.PI * rateHz) / fs;
  for (let i = 0; i < x.length; i++) out[i] = x[i] * (1 - depth / 2 + (depth / 2) * Math.sin(k * i));
  return out;
}

/** Slow random amplitude swell (used for "ocean" / "rain" textures). */
export function swell(x: Float32Array, periodSec: number, depth = 0.6, fs = SAMPLE_RATE): Float32Array {
  const out = new Float32Array(x.length);
  const k = (2 * Math.PI) / (periodSec * fs);
  for (let i = 0; i < x.length; i++) {
    const env = 1 - depth + depth * (0.5 + 0.5 * Math.sin(k * i - Math.PI / 2));
    out[i] = x[i] * env;
  }
  return out;
}

export function mix(parts: Array<{ buf: Float32Array; gain: number }>, n: number): Float32Array {
  const out = new Float32Array(n);
  for (const p of parts) for (let i = 0; i < n; i++) out[i] += p.buf[i] * p.gain;
  return out;
}

/** Normalise so that peak = target (default −6 dBFS) to leave headroom. */
export function normalize(x: Float32Array, targetPeak = 0.5): Float32Array {
  let peak = 1e-9;
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > peak) peak = a; }
  const g = targetPeak / peak;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * g;
  return out;
}

/** RMS in dBFS. */
export function rmsDb(x: Float32Array): number {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return 20 * Math.log10(Math.sqrt(s / Math.max(1, x.length)) + 1e-12);
}

/** Apply linear fade-in/out of `fadeSamples` at both ends (click-free one-shots). */
export function fadeEdges(x: Float32Array, fadeSamples: number): Float32Array {
  const out = Float32Array.from(x);
  const f = Math.min(fadeSamples, Math.floor(x.length / 2));
  for (let i = 0; i < f; i++) {
    const g = i / f;
    out[i] *= g;
    out[x.length - 1 - i] *= g;
  }
  return out;
}

/**
 * Make a buffer loop seamlessly: the last `fadeSamples` are cross-faded into the first
 * `fadeSamples`, and the tail is trimmed. Works for noise and non-periodic textures.
 */
export function makeLoopable(x: Float32Array, fadeSamples: number): Float32Array {
  const n = x.length - fadeSamples;
  const out = new Float32Array(n);
  out.set(x.subarray(0, n));
  for (let i = 0; i < fadeSamples; i++) {
    const t = i / fadeSamples;
    // equal-power crossfade
    const a = Math.cos((t * Math.PI) / 2), b = Math.sin((t * Math.PI) / 2);
    out[i] = x[n + i] * a + x[i] * b;
  }
  return out;
}

/** Encode mono or stereo Float32 PCM into a 16-bit little-endian WAV byte array. */
export function encodeWav(channels: Float32Array[], sampleRate = SAMPLE_RATE): Uint8Array {
  const numCh = channels.length;
  const n = channels[0].length;
  const dataBytes = n * numCh * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const writeStr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  v.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, numCh, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * numCh * 2, true);
  v.setUint16(32, numCh * 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, 'data');
  v.setUint32(40, dataBytes, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = channels[c][i];
      if (s > 1) s = 1; else if (s < -1) s = -1;
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Uint8Array(buf);
}

/** Convert a dB attenuation (<= 0) to a linear gain. */
export const dbToGain = (db: number) => Math.pow(10, db / 20);
export const gainToDb = (g: number) => 20 * Math.log10(Math.max(g, 1e-6));
