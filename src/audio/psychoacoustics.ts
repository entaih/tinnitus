/**
 * Pure (UI-free, testable) logic for the psychoacoustic characterisation modules:
 * recursive 2AFC pitch matching, octave-confusion check, ascending threshold search,
 * minimum masking level (MML) ramp and residual-inhibition (RI) scoring.
 *
 * Protocol references: Wunderlich 2015 (recursive 2AFC), Vielsmeier 2020 (NBN stimuli,
 * 1/12-octave resolution, repeated runs), Henry 2013 (pitch → loudness → octave → MML → RI),
 * Sendesen & Türkyılmaz 2024 (RI as predictor of sound-enrichment benefit).
 * Levels are expressed in dB relative to the device's full-scale reference (≤ 0), never dB HL.
 */

import type { SoundSpec } from './sounds';

// ---------------------------------------------------------------------------------------------
// Frequency helpers
// ---------------------------------------------------------------------------------------------

export const PITCH_MIN_HZ = 125;
export const PITCH_MAX_HZ = 16000;
export const SEMITONE_OCTAVES = 1 / 12;

export const clampHz = (hz: number, min = PITCH_MIN_HZ, max = PITCH_MAX_HZ) => Math.min(max, Math.max(min, hz));
export const octavesBetween = (a: number, b: number) => Math.abs(Math.log2(b / a));
export const shiftOctaves = (hz: number, octaves: number) => hz * Math.pow(2, octaves);
export const shiftSemitones = (hz: number, semitones: number) => shiftOctaves(hz, semitones * SEMITONE_OCTAVES);
/** Round to the nearest semitone on a 440 Hz-anchored grid (keeps readouts stable). */
export function snapToSemitone(hz: number): number {
  const n = Math.round(12 * Math.log2(hz / 440));
  return 440 * Math.pow(2, n / 12);
}
/** Human-friendly rounding for a Hz readout (3 significant digits, integer). */
export function roundHz(hz: number): number {
  if (hz >= 1000) return Math.round(hz / 10) * 10;
  return Math.round(hz);
}

export function median(values: number[]): number {
  if (!values.length) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------------------------------------------------------------------------------------------
// Recursive 2AFC pitch matching
// ---------------------------------------------------------------------------------------------

export interface PitchTrial { a: number; b: number; chosen: number; intervalOctaves: number }

export interface PitchRunState {
  /** Current pair to present (Hz). */
  a: number;
  b: number;
  /** Log-frequency distance between a and b. */
  intervalOctaves: number;
  step: number;
  history: PitchTrial[];
  done: boolean;
  /** Final estimate once done (Hz). */
  estimateHz?: number;
}

export interface PitchRunOptions {
  /** Centre the first pair on this frequency (used after an octave-confusion correction). */
  anchorHz?: number;
  /** Initial interval between the two stimuli in octaves (default 3 → 1000 vs 8000 Hz). */
  startIntervalOctaves?: number;
  /** Stop once the interval would fall below this (default one semitone). */
  minIntervalOctaves?: number;
  /** Hard cap on the number of steps (default 8). */
  maxSteps?: number;
  /** Start pair (Hz) for an un-anchored run; default 1000/8000 Hz. See PITCH_START_PAIRS. */
  startPair?: readonly [number, number];
}

const DEFAULT_START_PAIR: [number, number] = [1000, 8000];

/**
 * Start pairs for the three matching runs (Vielsmeier 2020: varying the start pair makes the run-to-run
 * agreement a real reliability estimate instead of an artefact of a shared starting point). Use
 * `shuffleCandidates(PITCH_START_PAIRS)` to randomise the order per session.
 */
export const PITCH_START_PAIRS: ReadonlyArray<readonly [number, number]> = [[1000, 8000], [500, 6000], [2000, 10000]];

/** How the listener describes the percept; drives the stimulus bandwidth. */
export type PitchPercept = 'tonal' | 'hiss' | 'buzz' | 'multiple';
export const NBN_OCTAVES_TONAL = 0.33;
export const NBN_OCTAVES_NOISELIKE = 0.5;
/** 1/3-octave NBN for tonal percepts (and "multiple": match the dominant component), 1/2 octave for hiss/buzz. */
export const pitchBandwidthOctaves = (percept: PitchPercept) => (percept === 'hiss' || percept === 'buzz' ? NBN_OCTAVES_NOISELIKE : NBN_OCTAVES_TONAL);

/**
 * RMS (dBFS) of the rendered narrowband stimuli after the renderer's *peak* normalisation (0.5), measured
 * from `renderSound({kind:'narrowband', color:'white', octaves:0.33})` with its fixed seed. The spread is
 * small (≈1.5 dB) but systematic, so stimuli are gain-compensated to equal RMS before the 2AFC comparison.
 */
const NBN_RMS_DB: ReadonlyArray<readonly [number, number]> = [
  [250, -17.3], [500, -18.3], [1000, -18.7], [2000, -18.0], [3000, -18.6], [4000, -17.8],
  [6000, -17.7], [8000, -17.7], [10000, -17.8], [12000, -17.2], [14000, -18.1], [16000, -17.4],
];
export const NBN_REFERENCE_HZ = 1000;
const NBN_COMP_LIMIT_DB = 3;

/** Gain (dB) to add so a narrowband burst at `centerHz` has the same RMS as the 1 kHz reference (log-frequency interpolation). */
export function nbnLevelCompensationDb(centerHz: number): number {
  const rmsAt = (hz: number) => {
    const lf = Math.log2(Math.max(1, hz));
    if (lf <= Math.log2(NBN_RMS_DB[0][0])) return NBN_RMS_DB[0][1];
    for (let i = 1; i < NBN_RMS_DB.length; i++) {
      const [f1, r1] = NBN_RMS_DB[i];
      if (lf <= Math.log2(f1)) {
        const [f0, r0] = NBN_RMS_DB[i - 1];
        const w = (lf - Math.log2(f0)) / (Math.log2(f1) - Math.log2(f0));
        return r0 + (r1 - r0) * w;
      }
    }
    return NBN_RMS_DB[NBN_RMS_DB.length - 1][1];
  };
  const comp = rmsAt(NBN_REFERENCE_HZ) - rmsAt(centerHz);
  return Math.round(Math.max(-NBN_COMP_LIMIT_DB, Math.min(NBN_COMP_LIMIT_DB, comp)) * 10) / 10;
}

/** Notched-noise presets are only defensible for a confident match at or below 8 kHz (Stein 2016, treatment.md §3.2). */
export const NOTCHED_MAX_PITCH_HZ = 8000;
export function notchedPresetEligible(pitchHz?: number | null, confidence?: PitchConfidence | null): boolean {
  if (pitchHz == null || !Number.isFinite(pitchHz)) return false;
  return pitchHz <= NOTCHED_MAX_PITCH_HZ && confidence !== 'low';
}

export function startPitchRun(opts: PitchRunOptions = {}): PitchRunState {
  const minInterval = opts.minIntervalOctaves ?? SEMITONE_OCTAVES;
  if (opts.anchorHz != null) {
    const interval = opts.startIntervalOctaves ?? 1;
    return {
      a: clampHz(shiftOctaves(opts.anchorHz, -interval / 2)),
      b: clampHz(shiftOctaves(opts.anchorHz, interval / 2)),
      intervalOctaves: interval, step: 0, history: [], done: false,
    };
  }
  const [a, b] = opts.startPair ?? DEFAULT_START_PAIR;
  const interval = opts.startIntervalOctaves ?? octavesBetween(a, b);
  const state: PitchRunState = { a, b, intervalOctaves: interval, step: 0, history: [], done: false };
  // Defensive: an absurd configuration (start below the minimum) finishes immediately on the midpoint.
  if (interval < minInterval) return { ...state, done: true, estimateHz: Math.sqrt(a * b) };
  return state;
}

/**
 * Apply the listener's choice ('a' | 'b') and compute the next pair: the chosen frequency becomes the
 * centre and the interval halves (recursive 2AFC). The run finishes when the next interval would be
 * below one semitone (≈6 %), which takes 6 steps from a 3-octave start.
 */
export function choosePitch(state: PitchRunState, choice: 'a' | 'b', opts: PitchRunOptions = {}): PitchRunState {
  if (state.done) return state;
  const minInterval = opts.minIntervalOctaves ?? SEMITONE_OCTAVES;
  const maxSteps = opts.maxSteps ?? 8;
  const chosen = choice === 'a' ? state.a : state.b;
  const history = [...state.history, { a: state.a, b: state.b, chosen, intervalOctaves: state.intervalOctaves }];
  const step = state.step + 1;
  const nextInterval = state.intervalOctaves / 2;
  if (nextInterval < minInterval || step >= maxSteps) {
    return { ...state, history, step, done: true, estimateHz: chosen, intervalOctaves: state.intervalOctaves };
  }
  return {
    a: clampHz(shiftOctaves(chosen, -nextInterval / 2)),
    b: clampHz(shiftOctaves(chosen, nextInterval / 2)),
    intervalOctaves: nextInterval, step, history, done: false,
  };
}

/** Number of steps a run will take for a given start interval (useful for progress bars). */
export function pitchRunLength(startIntervalOctaves = octavesBetween(...DEFAULT_START_PAIR), minIntervalOctaves = SEMITONE_OCTAVES, maxSteps = 8): number {
  let n = 0; let interval = startIntervalOctaves;
  while (interval >= minIntervalOctaves && n < maxSteps) { n++; interval /= 2; }
  return n;
}

export type PitchConfidence = 'low' | 'medium' | 'high';

export interface PitchSummary {
  estimateHz: number;
  lowHz: number;
  highHz: number;
  rangeOctaves: number;
  confidence: PitchConfidence;
  runs: number[];
}

/**
 * Combine repeated run estimates: median = pitch estimate; confidence from the spread of runs
 * (high if the range is < 0.5 octave, medium if < 1 octave, otherwise low — Vielsmeier 2020
 * reports a within-subject SD of ≈0.41 octaves for repeated recursive matching).
 */
export function summarisePitchRuns(runs: number[]): PitchSummary {
  const valid = runs.filter((r) => Number.isFinite(r) && r > 0);
  if (!valid.length) return { estimateHz: NaN, lowHz: NaN, highHz: NaN, rangeOctaves: NaN, confidence: 'low', runs: [] };
  const lowHz = Math.min(...valid);
  const highHz = Math.max(...valid);
  const rangeOctaves = octavesBetween(lowHz, highHz);
  const confidence: PitchConfidence = valid.length < 2 ? 'low' : rangeOctaves < 0.5 ? 'high' : rangeOctaves < 1 ? 'medium' : 'low';
  return { estimateHz: median(valid), lowHz, highHz, rangeOctaves, confidence, runs: valid };
}

// ---------------------------------------------------------------------------------------------
// Octave-confusion check
// ---------------------------------------------------------------------------------------------

export interface OctaveCandidate { hz: number; relation: 'half' | 'same' | 'double' }

/** f/2, f, 2f (only those inside the presentable range), in a fixed order. */
export function octaveCandidates(hz: number, min = PITCH_MIN_HZ, max = PITCH_MAX_HZ): OctaveCandidate[] {
  const out: OctaveCandidate[] = [];
  if (hz / 2 >= min) out.push({ hz: hz / 2, relation: 'half' });
  out.push({ hz, relation: 'same' });
  if (hz * 2 <= max) out.push({ hz: hz * 2, relation: 'double' });
  return out;
}

/** Shuffle presentation order with a seeded RNG so the "same" option is not always in the middle. */
export function shuffleCandidates<T>(items: T[], seed = Date.now()): T[] {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** After the octave check: if the listener preferred f/2 or 2f, matching must be re-run anchored there. */
export function resolveOctaveChoice(currentHz: number, chosen: OctaveCandidate): { anchorHz: number; rerun: boolean } {
  return chosen.relation === 'same' ? { anchorHz: currentHz, rerun: false } : { anchorHz: chosen.hz, rerun: true };
}

// ---------------------------------------------------------------------------------------------
// Ascending threshold search (modified Hughson-Westlake with two confirmations)
// ---------------------------------------------------------------------------------------------

export interface ThresholdSearchOptions {
  /** First presentation level (dB re full scale). */
  startDb: number;
  minDb: number;
  maxDb: number;
  /** Ascending step (2 dB for pitch/MML, 5 dB for the hearing screen). */
  upStep: number;
  /** Drop after a response (10 dB). */
  downStep: number;
  /**
   * Optional coarse step used until the first response (lets a −60 dB start reach the threshold
   * quickly); afterwards the search descends and continues with `upStep`.
   */
  coarseStep?: number;
  /** Responses required at the same level on separate ascents (default 2). */
  confirmations?: number;
  /** Safety cap on ascents (default 5): afterwards the median of ascent responses is used. */
  maxAscents?: number;
}

export interface ThresholdSearchState {
  opts: Required<ThresholdSearchOptions>;
  /** Level to present now (dB). */
  level: number;
  /** Whether we are still in the coarse phase (no response yet). */
  coarse: boolean;
  /** Levels at which the listener responded on each ascent. */
  ascentResponses: number[];
  presentations: number;
  done: boolean;
  /** Final threshold (dB), undefined when not heard within the range. */
  thresholdDb?: number;
  /** True when the listener never responded up to maxDb. */
  notHeard: boolean;
  /** True when the cap (maxDb) was reached at least once during the search. */
  reachedCap: boolean;
}

export function startThresholdSearch(options: ThresholdSearchOptions): ThresholdSearchState {
  const opts: Required<ThresholdSearchOptions> = {
    ...options,
    coarseStep: options.coarseStep ?? options.upStep,
    confirmations: options.confirmations ?? 2,
    maxAscents: options.maxAscents ?? 5,
  };
  const level = Math.min(opts.maxDb, Math.max(opts.minDb, opts.startDb));
  return { opts, level, coarse: true, ascentResponses: [], presentations: 0, done: false, notHeard: false, reachedCap: false };
}

/** Lowest level heard on `confirmations` separate ascents, if any. */
function confirmedLevel(responses: number[], confirmations: number): number | undefined {
  const counts = new Map<number, number>();
  for (const r of responses) counts.set(r, (counts.get(r) ?? 0) + 1);
  const confirmed = [...counts.entries()].filter(([, c]) => c >= confirmations).map(([l]) => l);
  return confirmed.length ? Math.min(...confirmed) : undefined;
}

/** Register the listener's response (heard / not heard) to the current `level` and compute the next level. */
export function respondThreshold(state: ThresholdSearchState, heard: boolean): ThresholdSearchState {
  if (state.done) return state;
  const { opts } = state;
  const presentations = state.presentations + 1;
  if (heard) {
    const ascentResponses = [...state.ascentResponses, state.level];
    const confirmed = confirmedLevel(ascentResponses, opts.confirmations);
    if (confirmed != null) {
      return { ...state, ascentResponses, presentations, coarse: false, done: true, thresholdDb: confirmed };
    }
    if (ascentResponses.length >= opts.maxAscents) {
      return { ...state, ascentResponses, presentations, coarse: false, done: true, thresholdDb: median(ascentResponses) };
    }
    // Descend by downStep (at least one step) and begin a new ascent.
    const next = Math.max(opts.minDb, state.level - opts.downStep);
    if (next === state.level) {
      // Already at the floor: the floor itself is the best estimate we can give.
      return { ...state, ascentResponses, presentations, coarse: false, done: true, thresholdDb: state.level };
    }
    return { ...state, ascentResponses, presentations, coarse: false, level: next };
  }
  // Not heard: ascend.
  const step = state.coarse ? opts.coarseStep : opts.upStep;
  if (state.level >= opts.maxDb) {
    // Could not be heard at the cap. If an earlier ascent produced a response, fall back to it.
    const prior = state.ascentResponses.length ? Math.min(...state.ascentResponses) : undefined;
    return { ...state, presentations, done: true, reachedCap: true, notHeard: prior == null, thresholdDb: prior };
  }
  const next = Math.min(opts.maxDb, state.level + step);
  return { ...state, presentations, level: next, reachedCap: state.reachedCap || next >= opts.maxDb };
}

/** Standard settings for the hearing screen (5 dB up / 10 dB down, −60 dB start). */
export const HEARING_SEARCH: ThresholdSearchOptions = { startDb: -60, minDb: -90, maxDb: 0, upStep: 5, downStep: 10, coarseStep: 10, confirmations: 2, maxAscents: 3 };
/** Settings for the loudness-match threshold (2 dB resolution). */
export const TONE_THRESHOLD_SEARCH: ThresholdSearchOptions = { startDb: -60, minDb: -90, maxDb: 0, upStep: 2, downStep: 10, coarseStep: 6, confirmations: 2, maxAscents: 4 };

/** Hearing-screen frequencies in presentation order (3 kHz added: noise notch and "rule 3000" asymmetry). */
export const SCREENING_FREQS = [500, 1000, 2000, 3000, 4000, 6000, 8000] as const;

/** Uncertainty band for an uncalibrated phone screening (dB). */
export const SCREENING_UNCERTAINTY_DB = 10;

/** Warble (±5 %) from 3 kHz upwards: standing waves and earbud seating make a fixed tone unreliable in the ear canal. */
export const WARBLE_FROM_HZ = 3000;
export const warbleFor = (hz: number) => hz >= WARBLE_FROM_HZ;

// Catch trials (silent presentations) — the only quality control available on an uncalibrated phone.
export const CATCH_BLOCK = 6;
export const CATCH_FALSE_POSITIVE_LIMIT = 2;
export type ScreenReliability = 'ok' | 'low';

/**
 * Returns a per-presentation decision function: exactly one randomly placed silent presentation in every
 * block of CATCH_BLOCK presentations (≈1 in 6). Catch presentations do not feed the threshold search.
 */
export function makeCatchScheduler(rnd: () => number = Math.random): () => boolean {
  let index = 0;
  let slot = -1;
  return () => {
    const pos = index % CATCH_BLOCK;
    if (pos === 0) slot = Math.min(CATCH_BLOCK - 1, Math.max(0, Math.floor(rnd() * CATCH_BLOCK)));
    index++;
    return pos === slot;
  };
}

/** ≥ 2 responses to silence → the run is flagged 'low' reliability (instructions should be repeated). */
export const screenReliability = (falsePositives: number): ScreenReliability => (falsePositives >= CATCH_FALSE_POSITIVE_LIMIT ? 'low' : 'ok');

export function pta4FromThresholds(points: { freq: number; levelDb: number }[]): number | null {
  const v = [500, 1000, 2000, 4000].map((f) => points.find((p) => p.freq === f)?.levelDb).filter((x): x is number => x != null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
}

// ---------------------------------------------------------------------------------------------
// Level / volume mapping and safety caps
// ---------------------------------------------------------------------------------------------

/** Linear player volume (0..1) for a level in dB re full scale. */
export const dbToVolume = (db: number) => Math.max(0, Math.min(1, Math.pow(10, db / 20)));
export const volumeToDb = (v: number) => 20 * Math.log10(Math.max(v, 1e-6));

/** The highest level (dB) permitted by the user's output cap (0..1). */
export const capDbFor = (maxVolume: number) => Math.min(0, volumeToDb(Math.max(0.001, Math.min(1, maxVolume))));

/** Clamp a requested level to the user's cap and 0 dBFS; reports whether clamping happened. */
export function applyLevelCap(levelDb: number, maxVolume: number): { levelDb: number; capped: boolean } {
  const cap = capDbFor(maxVolume);
  const clamped = Math.min(cap, levelDb);
  return { levelDb: clamped, capped: clamped < levelDb };
}

// ---------------------------------------------------------------------------------------------
// Loudness match
// ---------------------------------------------------------------------------------------------

export const LOUDNESS_SL_WARN_DB = 30;

/** Sensation level of the loudness match; flags atypical (> 30 dB SL) values for a repeat. */
export function loudnessMatch(levelDb: number, thresholdDb: number): { dbSl: number; atypical: boolean } {
  const dbSl = Math.round(levelDb - thresholdDb);
  return { dbSl, atypical: dbSl > LOUDNESS_SL_WARN_DB };
}

// ---------------------------------------------------------------------------------------------
// Minimum masking level ramp
// ---------------------------------------------------------------------------------------------

export interface MmlState {
  level: number;
  stepDb: number;
  minDb: number;
  maxDb: number;
  phase: 'toThreshold' | 'toMasking' | 'done';
  noiseThresholdDb?: number;
  maskingLevelDb?: number;
  /** MML relative to the noise threshold (dB SL). */
  mmlDb?: number;
  notMaskable: boolean;
}

export function startMml(opts: { startDb?: number; stepDb?: number; minDb?: number; maxDb?: number } = {}): MmlState {
  const minDb = opts.minDb ?? -70;
  return { level: opts.startDb ?? -60, stepDb: opts.stepDb ?? 2, minDb, maxDb: opts.maxDb ?? 0, phase: 'toThreshold', notMaskable: false };
}

/** Advance one step (used by the automatic ramp). Returns the same state when the cap is reached. */
export function mmlStep(state: MmlState): MmlState {
  if (state.phase === 'done') return state;
  const next = Math.min(state.maxDb, state.level + state.stepDb);
  return { ...state, level: next };
}

export const mmlAtCap = (state: MmlState) => state.level >= state.maxDb;

/** "I can hear the noise" at the current level. */
export function mmlHeardNoise(state: MmlState): MmlState {
  if (state.phase !== 'toThreshold') return state;
  return { ...state, phase: 'toMasking', noiseThresholdDb: state.level };
}

/** "I no longer hear my tinnitus" at the current level → MML = level − noise threshold. */
export function mmlMasked(state: MmlState): MmlState {
  if (state.phase !== 'toMasking' || state.noiseThresholdDb == null) return state;
  return { ...state, phase: 'done', maskingLevelDb: state.level, mmlDb: Math.max(0, Math.round(state.level - state.noiseThresholdDb)), notMaskable: false };
}

/** "It does not mask my tinnitus" at the safe cap. */
export function mmlNotMaskable(state: MmlState): MmlState {
  return { ...state, phase: 'done', notMaskable: true, mmlDb: undefined, maskingLevelDb: undefined };
}

export type MmlStimulus = 'nbn' | 'bbn';
export const MML_NBN_OCTAVES = 0.33;

/**
 * The single stimulus shared by MML and RI (Fournier & Hébert 2018 MRIL; Vernon & Meikle): 1/3-octave
 * narrowband noise at the matched pitch when one exists, otherwise broadband white noise.
 */
export function maskerSpec(pitchHz: number | null | undefined, seconds = 8): { spec: SoundSpec; stimulus: MmlStimulus; centerHz?: number } {
  if (pitchHz != null && Number.isFinite(pitchHz) && pitchHz > 0) {
    const centerHz = Math.round(clampHz(pitchHz));
    return { spec: { kind: 'narrowband', color: 'white', centerHz, octaves: MML_NBN_OCTAVES, seconds }, stimulus: 'nbn', centerHz };
  }
  return { spec: { kind: 'noise', color: 'white', seconds }, stimulus: 'bbn' };
}

export const RI_MASKER_ABOVE_MML_DB = 10;
/** Hyperacusis gate (HQ ≥ 28 or an early-discomfort LDL record): gentler masker and a single trial. */
export const RI_MASKER_ABOVE_MML_HYPERACUSIS_DB = 5;
export const HQ_HYPERACUSIS_GATE = 28;
export const RI_MAX_TRIALS_HYPERACUSIS = 1;

export function riHyperacusisGate(hqTotal?: number | null, ldlLow?: boolean | null): boolean {
  return (hqTotal != null && hqTotal >= HQ_HYPERACUSIS_GATE) || ldlLow === true;
}

/** Level for the RI masker: MML + 10 dB (MML + 5 dB under the hyperacusis gate), clamped to the cap. */
export function riMaskerLevel(maskingLevelDb: number, capDb: number, opts: { hyperacusis?: boolean } = {}): { levelDb: number; capped: boolean; aboveMmlDb: number } {
  const aboveMmlDb = opts.hyperacusis ? RI_MASKER_ABOVE_MML_HYPERACUSIS_DB : RI_MASKER_ABOVE_MML_DB;
  const wanted = maskingLevelDb + aboveMmlDb;
  const levelDb = Math.min(capDb, wanted);
  return { levelDb, capped: levelDb < wanted, aboveMmlDb };
}

// ---------------------------------------------------------------------------------------------
// Residual inhibition scoring
// ---------------------------------------------------------------------------------------------

export interface RiRating { /** seconds since masker offset */ t: number; /** 0–10 loudness, 0 = gone */ value: number }

export type RiCategory = 'complete' | 'partial' | 'none';

export interface RiResult {
  category: RiCategory;
  /** True when any rating ≤ 50 % of baseline lasted ≥ 5 s. */
  positive: boolean;
  /** Seconds from offset until the rating returned to ≥ baseline − 1 (censored at the last rating + interval). */
  durationSec: number;
  /** True when tinnitus had not returned by the end of the rating window. */
  censored: boolean;
  /** Minimum rating / baseline (0 = completely gone, 1 = no change). */
  depth: number;
  /** Rebound: any rating above baseline + 1. */
  rebound: boolean;
}

export const RI_MASKER_SECONDS = 60;
export const RI_RATING_INTERVAL_SEC = 5;
/** First rating 2 s after masker offset so a short complete RI is not missed by 5 s sampling. */
export const RI_FIRST_RATING_SEC = 2;
export const RI_MAX_RATING_SECONDS = 180;
export const RI_MAX_TRIALS_PER_SESSION = 3;
/** The listener must confirm a rating within this window, otherwise the sample is recorded as missing (censored). */
export const RI_CONFIRM_WINDOW_SEC = 3;

export const riMaxTrials = (hyperacusis: boolean) => (hyperacusis ? RI_MAX_TRIALS_HYPERACUSIS : RI_MAX_TRIALS_PER_SESSION);

/** Scheduled rating times after masker offset: 2 s, then every 5 s (5, 10, 15, …) up to `maxSec`. */
export function riRatingSchedule(maxSec = RI_MAX_RATING_SECONDS, first = RI_FIRST_RATING_SEC, interval = RI_RATING_INTERVAL_SEC): number[] {
  const out: number[] = [];
  if (first > 0 && first < interval) out.push(first);
  for (let t = interval; t <= maxSec; t += interval) out.push(t);
  return out;
}

/**
 * Score a residual-inhibition trial. Each rating holds until the next rating but never longer than one
 * interval, so a missed (unconfirmed) sample censors rather than extends the suppression. Operational
 * thresholds (Hu 2021-style synthesis): RI-positive when the rating is ≤ 50 % of baseline for ≥ 5 s,
 * complete when it is 0 for ≥ 5 s; duration runs from offset until the first rating ≥ baseline − 1 after
 * suppression started.
 */
export function scoreResidualInhibition(baseline: number, ratings: RiRating[], intervalSec = RI_RATING_INTERVAL_SEC): RiResult {
  const sorted = [...ratings].filter((r) => Number.isFinite(r.t) && Number.isFinite(r.value)).sort((a, b) => a.t - b.t);
  const none: RiResult = { category: 'none', positive: false, durationSec: 0, censored: false, depth: 1, rebound: false };
  if (!sorted.length || baseline <= 0) return none;

  const holdUntil = (i: number) => Math.min(sorted[i].t + intervalSec, i + 1 < sorted.length ? sorted[i + 1].t : Infinity);
  const longestSpan = (pred: (v: number) => boolean) => {
    let best = 0; let start: number | null = null;
    for (let i = 0; i < sorted.length; i++) {
      const ok = pred(sorted[i].value);
      if (ok && start == null) start = sorted[i].t;
      if (ok) best = Math.max(best, holdUntil(i) - start!);
      if (!ok) start = null;
    }
    return best;
  };

  const halfSpan = longestSpan((v) => v <= baseline * 0.5);
  const zeroSpan = longestSpan((v) => v <= 0);
  const positive = halfSpan >= intervalSec;
  const complete = zeroSpan >= intervalSec;
  const minValue = Math.min(...sorted.map((r) => r.value));
  const depth = Math.max(0, Math.min(1, minValue / baseline));
  const rebound = sorted.some((r) => r.value > baseline + 1);

  // Suppression of any size counts as "partial" when it is not RI-positive but a clear drop (≥ 2 points) was recorded.
  const anyDrop = sorted.some((r) => r.value <= baseline - 2);
  const category: RiCategory = complete ? 'complete' : positive || anyDrop ? 'partial' : 'none';

  let durationSec = 0; let censored = false;
  if (category !== 'none') {
    const firstSupp = sorted.findIndex((r) => r.value <= baseline - 2 || r.value <= baseline * 0.5);
    const back = sorted.findIndex((r, i) => i > firstSupp && r.value >= baseline - 1);
    if (back === -1) { durationSec = sorted[sorted.length - 1].t + intervalSec; censored = true; }
    else durationSec = sorted[back].t;
  }
  return { category, positive, durationSec, censored, depth, rebound };
}

// ---------------------------------------------------------------------------------------------
// Timing helpers shared by the automated presentation loops
// ---------------------------------------------------------------------------------------------

/** Randomised inter-stimulus gap in ms (1–3 s by default) so listeners cannot anticipate the burst. */
export function randomGapMs(minMs = 1000, maxMs = 3000, rnd = Math.random): number {
  return Math.round(minMs + (maxMs - minMs) * rnd());
}
