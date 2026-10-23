import {
  SAMPLE_RATE, amplitudeModulate, bandpassNoise, brownNoise, butterworth4, dbToGain, encodeWav,
  fadeEdges, makeLoopable, makeRng, mix, noise, normalize, notchFilter, sine, swell, warbleTone,
  type NoiseColor,
} from './dsp';

/**
 * Declarative description of every sound the app can synthesise.
 * Specs are serialisable so they can be stored inside a user's programme.
 */
export type SoundSpec =
  | { kind: 'tone'; freq: number; warble?: boolean; seconds?: number }
  | { kind: 'noise'; color: NoiseColor; seconds?: number }
  | { kind: 'notched'; color: NoiseColor; centerHz: number; octaves?: number; seconds?: number }
  | { kind: 'narrowband'; color: NoiseColor; centerHz: number; octaves?: number; seconds?: number }
  | { kind: 'am'; color: NoiseColor; rateHz: number; depth?: number; seconds?: number }
  | { kind: 'nature'; preset: 'rain' | 'ocean' | 'stream' | 'wind' | 'fan'; seconds?: number }
  | { kind: 'binaural'; carrierHz: number; beatHz: number; seconds?: number }
  | { kind: 'silence'; seconds?: number };

export interface RenderedSound {
  channels: Float32Array[];
  sampleRate: number;
  seconds: number;
}

const DEFAULT_SECONDS = 12;
const LOOP_FADE = Math.floor(SAMPLE_RATE * 0.25);

/** Pick a duration that contains an integer number of cycles so a pure tone loops without clicks. */
function toneLoopSamples(freq: number, seconds: number): number {
  const cycles = Math.max(1, Math.round(freq * seconds));
  return Math.round((cycles / freq) * SAMPLE_RATE);
}

export function describeSpec(spec: SoundSpec, t: (k: string) => string): string {
  switch (spec.kind) {
    case 'tone': return `${t('sound.tone')} ${Math.round(spec.freq)} Hz`;
    case 'noise': return t(`sound.noise.${spec.color}`);
    case 'notched': return `${t('sound.notched')} ${t(`sound.noise.${spec.color}`)} · ${Math.round(spec.centerHz)} Hz`;
    case 'narrowband': return `${t('sound.narrowband')} ${Math.round(spec.centerHz)} Hz`;
    case 'am': return `${t('sound.am')} ${spec.rateHz} Hz`;
    case 'nature': return t(`sound.nature.${spec.preset}`);
    case 'binaural': return `${t('sound.binaural')} ${spec.beatHz} Hz`;
    case 'silence': return t('sound.silence');
  }
}

export function renderSound(spec: SoundSpec): RenderedSound {
  const seconds = spec.seconds ?? DEFAULT_SECONDS;
  const rng = makeRng(0xC0FFEE);
  switch (spec.kind) {
    case 'tone': {
      const n = toneLoopSamples(spec.freq, seconds);
      const buf = spec.warble ? warbleTone(spec.freq, n + LOOP_FADE) : sine(spec.freq, n);
      const out = spec.warble ? makeLoopable(buf, LOOP_FADE) : buf;
      return { channels: [normalize(out, 0.4)], sampleRate: SAMPLE_RATE, seconds: out.length / SAMPLE_RATE };
    }
    case 'noise': {
      const n = Math.round(seconds * SAMPLE_RATE) + LOOP_FADE;
      const out = makeLoopable(noise(spec.color, n, rng), LOOP_FADE);
      return mono(out);
    }
    case 'notched': {
      const n = Math.round(seconds * SAMPLE_RATE) + LOOP_FADE;
      const base = noise(spec.color, n, rng);
      const out = makeLoopable(notchFilter(base, spec.centerHz, spec.octaves ?? 1), LOOP_FADE);
      return mono(out);
    }
    case 'narrowband': {
      const n = Math.round(seconds * SAMPLE_RATE) + LOOP_FADE;
      const out = makeLoopable(bandpassNoise(noise(spec.color, n, rng), spec.centerHz, spec.octaves ?? 0.5), LOOP_FADE);
      return mono(out);
    }
    case 'am': {
      const n = Math.round(seconds * SAMPLE_RATE) + LOOP_FADE;
      // keep whole modulation cycles inside the loop
      const cycles = Math.max(1, Math.round(spec.rateHz * seconds));
      const loopN = Math.round((cycles / spec.rateHz) * SAMPLE_RATE);
      const base = noise(spec.color, loopN + LOOP_FADE, rng);
      const out = makeLoopable(base, LOOP_FADE);
      return mono(amplitudeModulate(out, spec.rateHz, spec.depth ?? 1));
    }
    case 'nature': {
      const n = Math.round(seconds * SAMPLE_RATE) + LOOP_FADE;
      let out: Float32Array;
      switch (spec.preset) {
        case 'rain': {
          const hiss = butterworth4('highpass', 1200, noise('white', n, rng));
          const body = butterworth4('lowpass', 2500, noise('pink', n, makeRng(7)));
          out = mix([{ buf: hiss, gain: 0.35 }, { buf: body, gain: 0.8 }], n);
          break;
        }
        case 'ocean': {
          const wave = swell(butterworth4('lowpass', 900, noise('brown', n, rng)), seconds / 2, 0.75);
          const foam = swell(butterworth4('highpass', 2000, noise('pink', n, makeRng(11))), seconds / 2, 0.9);
          out = mix([{ buf: wave, gain: 1 }, { buf: foam, gain: 0.25 }], n);
          break;
        }
        case 'stream': {
          const a = bandpassNoise(noise('white', n, rng), 1500, 2);
          const b = bandpassNoise(noise('white', n, makeRng(3)), 4000, 1.5);
          out = mix([{ buf: a, gain: 0.8 }, { buf: swell(b, 1.7, 0.4), gain: 0.35 }], n);
          break;
        }
        case 'wind': {
          out = swell(butterworth4('lowpass', 600, noise('pink', n, rng)), seconds / 3, 0.7);
          break;
        }
        case 'fan':
        default: {
          const hum = sine(120, n);
          const air = butterworth4('lowpass', 3000, noise('brown', n, rng));
          out = mix([{ buf: hum, gain: 0.08 }, { buf: air, gain: 1 }], n);
        }
      }
      return mono(makeLoopable(out, LOOP_FADE));
    }
    case 'binaural': {
      const n = toneLoopSamples(spec.beatHz, seconds);
      const l = sine(spec.carrierHz, n);
      const r = sine(spec.carrierHz + spec.beatHz, n);
      const pad = brownNoise(n, rng);
      const L = mix([{ buf: l, gain: 0.3 }, { buf: pad, gain: 0.25 }], n);
      const R = mix([{ buf: r, gain: 0.3 }, { buf: pad, gain: 0.25 }], n);
      return { channels: [normalize(L, 0.4), normalize(R, 0.4)], sampleRate: SAMPLE_RATE, seconds: n / SAMPLE_RATE };
    }
    case 'silence': {
      const n = Math.round(seconds * SAMPLE_RATE);
      return { channels: [new Float32Array(n)], sampleRate: SAMPLE_RATE, seconds };
    }
  }
}

function mono(out: Float32Array): RenderedSound {
  return { channels: [normalize(out, 0.5)], sampleRate: SAMPLE_RATE, seconds: out.length / SAMPLE_RATE };
}

/** A short one-shot tone burst (for audiometry / pitch matching), with click-free 20 ms ramps. */
export function renderToneBurst(freq: number, ms = 1000, levelDb = 0, warble = false): RenderedSound {
  const n = Math.round((ms / 1000) * SAMPLE_RATE);
  const raw = warble ? warbleTone(freq, n) : sine(freq, n);
  const g = dbToGain(levelDb);
  const out = fadeEdges(raw, Math.round(SAMPLE_RATE * 0.02));
  for (let i = 0; i < n; i++) out[i] *= 0.5 * g;
  return { channels: [out], sampleRate: SAMPLE_RATE, seconds: ms / 1000 };
}

export function toWavBytes(r: RenderedSound): Uint8Array {
  return encodeWav(r.channels, r.sampleRate);
}

/** Stable cache key for a spec (used as the file name). */
export function specKey(spec: SoundSpec): string {
  return Object.entries(spec)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}-${typeof v === 'number' ? Math.round(v * 100) / 100 : v}`)
    .join('_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
}
