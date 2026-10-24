/**
 * Pure (UI-free, testable) logic for the guided self-examination battery ("Otomatik muayene"):
 * digits-in-noise (DIN) adaptive track, loudness-discomfort (LDL) ascending run, accelerometer sway
 * scoring and the step order of the battery. Everything here is a *screening estimate* on an
 * uncalibrated phone; the screens label results accordingly and nothing replaces clinical testing.
 *
 * References: Smits 2004 / Potgieter 2016 (digits-in-noise, 1-up/1-down adaptive track, SRT as mean of
 * the last trials), Sherlock & Formby 2005 (LDL ascending-method instructions), Mancini 2012 (smartphone
 * accelerometer sway, RMS of acceleration).
 */

// ---------------------------------------------------------------------------------------------
// Battery step order
// ---------------------------------------------------------------------------------------------

export type ExamStepId = 'din' | 'ldl' | 'pressure' | 'vascular' | 'balance' | 'somatic';

export interface ExamStepDef { id: ExamStepId; route: string; minutes: number }

export const EXAM_STEPS: ExamStepDef[] = [
  { id: 'din', route: '/assess/exam/din', minutes: 3 },
  { id: 'ldl', route: '/assess/exam/ldl', minutes: 2 },
  { id: 'pressure', route: '/assess/exam/pressure', minutes: 1 },
  { id: 'vascular', route: '/assess/exam/vascular', minutes: 1 },
  { id: 'balance', route: '/assess/exam/balance', minutes: 1 },
  { id: 'somatic', route: '/exercise/selftest', minutes: 3 },
];

/** Steps shown in the hub for this user (vascular only for pulsatile tinnitus). */
export function applicableExamSteps(opts: { pulsatile?: boolean }): ExamStepDef[] {
  return EXAM_STEPS.filter((s) => s.id !== 'vascular' || !!opts.pulsatile);
}

/**
 * Route of the next in-app step after `current` when the battery is run in sequence ("Sırayla başla").
 * The somatic self-test lives outside this folder, so the sequence ends after the balance test.
 */
export function nextExamRoute(current: ExamStepId, opts: { pulsatile?: boolean }): string | null {
  const seq = applicableExamSteps(opts).filter((s) => s.id !== 'somatic');
  const i = seq.findIndex((s) => s.id === current);
  if (i === -1 || i + 1 >= seq.length) return null;
  return seq[i + 1].route;
}

// ---------------------------------------------------------------------------------------------
// Digits-in-noise (DIN)
// ---------------------------------------------------------------------------------------------

export const DIN_TRIALS = 20;
export const DIN_SCORED_TRIALS = 10;
export const DIN_START_SNR_DB = 10;
export const DIN_STEP_BEFORE_REVERSAL_DB = 4;
export const DIN_STEP_AFTER_REVERSAL_DB = 2;
export const DIN_MIN_SNR_DB = -16;
export const DIN_MAX_SNR_DB = 14;
/** Linear noise volume at 0 dB SNR (TTS output is fixed, so the noise carries the SNR). */
export const DIN_BASE_NOISE_VOLUME = 0.12;
/** Screening pass criterion (uncalibrated, heuristic). */
export const DIN_PASS_SRT_DB = -8;

export interface DinTrial { snrDb: number; correct: boolean }

export interface DinState {
  /** SNR to present now (dB). */
  snrDb: number;
  trials: DinTrial[];
  reversals: number;
  /** Direction of the last SNR change ('down' = harder). */
  lastDirection?: 'up' | 'down';
  minSnrDb: number;
  maxSnrDb: number;
  done: boolean;
  /** Mean SNR of the last `DIN_SCORED_TRIALS` trials once done. */
  srtDb?: number;
}

export function startDin(opts: { startSnrDb?: number; minSnrDb?: number; maxSnrDb?: number } = {}): DinState {
  const minSnrDb = opts.minSnrDb ?? DIN_MIN_SNR_DB;
  const maxSnrDb = opts.maxSnrDb ?? DIN_MAX_SNR_DB;
  const snrDb = Math.min(maxSnrDb, Math.max(minSnrDb, opts.startSnrDb ?? DIN_START_SNR_DB));
  return { snrDb, trials: [], reversals: 0, minSnrDb, maxSnrDb, done: false };
}

/**
 * 1-up/1-down track: a correct triplet lowers the SNR (harder), an error raises it. Steps are 4 dB until
 * the first reversal and 2 dB afterwards. After `DIN_TRIALS` the SRT is the mean SNR of the last 10 trials.
 */
export function respondDin(state: DinState, correct: boolean, trialsTotal = DIN_TRIALS, scored = DIN_SCORED_TRIALS): DinState {
  if (state.done) return state;
  const trials = [...state.trials, { snrDb: state.snrDb, correct }];
  const direction: 'up' | 'down' = correct ? 'down' : 'up';
  const reversal = state.lastDirection != null && state.lastDirection !== direction;
  const reversals = state.reversals + (reversal ? 1 : 0);
  if (trials.length >= trialsTotal) {
    const tail = trials.slice(-scored);
    const srtDb = tail.reduce((s, t) => s + t.snrDb, 0) / tail.length;
    return { ...state, trials, reversals, lastDirection: direction, done: true, srtDb: Math.round(srtDb * 10) / 10 };
  }
  const step = reversals >= 1 ? DIN_STEP_AFTER_REVERSAL_DB : DIN_STEP_BEFORE_REVERSAL_DB;
  const wanted = correct ? state.snrDb - step : state.snrDb + step;
  const snrDb = Math.min(state.maxSnrDb, Math.max(state.minSnrDb, wanted));
  return { ...state, trials, reversals, lastDirection: direction, snrDb };
}

/** Linear noise volume for an SNR: 10^(−SNR/20) × base, clamped to [0, cap]. */
export function dinNoiseVolume(snrDb: number, cap = 1, base = DIN_BASE_NOISE_VOLUME): { volume: number; capped: boolean } {
  const wanted = Math.pow(10, -snrDb / 20) * base;
  const volume = Math.max(0, Math.min(cap, wanted));
  return { volume, capped: wanted > cap };
}

/** Lowest SNR that stays under the output cap (the track cannot go below it). */
export function dinSnrFloor(cap: number, base = DIN_BASE_NOISE_VOLUME): number {
  const c = Math.max(1e-3, Math.min(1, cap));
  return Math.max(DIN_MIN_SNR_DB, Math.ceil(-20 * Math.log10(c / base)));
}

/** Three distinct digits 0–9 (distinct digits are easier to hear apart and to type). */
export function randomTriplet(rnd: () => number = Math.random): number[] {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out: number[] = [];
  while (out.length < 3) {
    const i = Math.min(pool.length - 1, Math.floor(rnd() * pool.length));
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

export const tripletCorrect = (target: number[], answer: number[]) =>
  target.length === 3 && answer.length === 3 && target.every((d, i) => d === answer[i]);

export const dinPassed = (srtDb: number) => srtDb <= DIN_PASS_SRT_DB;

/** Spoken form of a triplet: digits separated by commas so the TTS engine inserts a short pause. */
export const tripletUtterance = (digits: number[]) => digits.join(', ');

// ---------------------------------------------------------------------------------------------
// Loudness discomfort level (LDL)
// ---------------------------------------------------------------------------------------------

export const LDL_START_DB = -50;
export const LDL_STEP_DB = 5;
export const LDL_FREQS = [1000, 4000] as const;
/** Discomfort at least this far below the cap is flagged as a low tolerance pattern (heuristic). */
export const LDL_LOW_MARGIN_DB = 20;

export interface LdlState {
  freq: number;
  level: number;
  stepDb: number;
  capDb: number;
  presentations: number;
  done: boolean;
  /** Level at the first "uncomfortable" response; undefined when the cap was reached without discomfort. */
  discomfortDb?: number;
  reachedCap: boolean;
}

export function startLdl(freq: number, capDb: number, opts: { startDb?: number; stepDb?: number } = {}): LdlState {
  const cap = Math.min(0, capDb);
  const level = Math.min(cap, opts.startDb ?? LDL_START_DB);
  return { freq, level, stepDb: opts.stepDb ?? LDL_STEP_DB, capDb: cap, presentations: 0, done: false, reachedCap: level >= cap };
}

/** "Comfortable" → ascend one step (stop at the cap); "uncomfortable" → done at the current level. */
export function respondLdl(state: LdlState, uncomfortable: boolean): LdlState {
  if (state.done) return state;
  const presentations = state.presentations + 1;
  if (uncomfortable) return { ...state, presentations, done: true, discomfortDb: state.level };
  if (state.level >= state.capDb) return { ...state, presentations, done: true, reachedCap: true };
  const level = Math.min(state.capDb, state.level + state.stepDb);
  return { ...state, presentations, level, reachedCap: level >= state.capDb };
}

export interface LdlSummary {
  /** Mean discomfort level across frequencies (dB re full scale); cap value used where never uncomfortable. */
  ldlDb: number;
  /** True when the mean discomfort level sits ≥ LDL_LOW_MARGIN_DB below the cap. */
  ldlLow: boolean;
  /** True when at least one run ended at the cap without discomfort. */
  anyAtCap: boolean;
  perFreq: { freq: number; levelDb: number; atCap: boolean }[];
}

export function summariseLdl(runs: LdlState[], capDb: number): LdlSummary {
  const cap = Math.min(0, capDb);
  const perFreq = runs.filter((r) => r.done).map((r) => ({ freq: r.freq, levelDb: r.discomfortDb ?? cap, atCap: r.discomfortDb == null }));
  if (!perFreq.length) return { ldlDb: cap, ldlLow: false, anyAtCap: false, perFreq };
  const ldlDb = Math.round(perFreq.reduce((s, p) => s + p.levelDb, 0) / perFreq.length);
  return { ldlDb, ldlLow: ldlDb <= cap - LDL_LOW_MARGIN_DB, anyAtCap: perFreq.some((p) => p.atCap), perFreq };
}

// ---------------------------------------------------------------------------------------------
// Balance (accelerometer sway)
// ---------------------------------------------------------------------------------------------

export const SWAY_BASELINE_SECONDS = 10;
export const SWAY_TEST_SECONDS = 30;
export const SWAY_IGNORE_SECONDS = 3;
export const SWAY_BASELINE_IGNORE_SECONDS = 2;
/** swayScore above this is flagged (heuristic, uncalibrated). */
export const SWAY_ABNORMAL_SCORE = 12;
export const G_MS2 = 9.81;

export interface SwaySample { x: number; y: number; z: number; /** ms */ t: number }

export interface SwayStats {
  /** RMS of |a| − mean(|a|) in m/s². */
  rmsMs2: number;
  /** rmsMs2 × 100, rounded to one decimal. */
  score: number;
  /** Samples used after the ignore window. */
  n: number;
  /** Mean magnitude (m/s²) — ≈ 9.81 when the phone is held still. */
  meanMs2: number;
}

/**
 * RMS of the deviation of the acceleration-vector magnitude from its mean over the window, after dropping
 * the first `ignoreSec` seconds (settling). Input values are in g (expo-sensors) and converted to m/s².
 */
export function swayStats(samples: SwaySample[], ignoreSec = SWAY_IGNORE_SECONDS, gToMs2 = G_MS2): SwayStats {
  if (!samples.length) return { rmsMs2: 0, score: 0, n: 0, meanMs2: 0 };
  const t0 = samples[0].t + ignoreSec * 1000;
  const mags = samples.filter((s) => s.t >= t0).map((s) => Math.hypot(s.x, s.y, s.z) * gToMs2);
  if (mags.length < 2) return { rmsMs2: 0, score: 0, n: mags.length, meanMs2: mags[0] ?? 0 };
  const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
  const rms = Math.sqrt(mags.reduce((a, m) => a + (m - mean) * (m - mean), 0) / mags.length);
  return { rmsMs2: rms, score: Math.round(rms * 100 * 10) / 10, n: mags.length, meanMs2: mean };
}

export const swayAbnormal = (score: number) => score > SWAY_ABNORMAL_SCORE;

/** Eyes-closed / eyes-open ratio (Romberg-like); null when the baseline is too small to divide by. */
export function swayRatio(closedScore: number, openScore: number): number | null {
  if (!(openScore > 0.5)) return null;
  return Math.round((closedScore / openScore) * 10) / 10;
}
