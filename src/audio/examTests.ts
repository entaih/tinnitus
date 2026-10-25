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

import type { Assessment, ExamResult } from '@/clinical/types';

// ---------------------------------------------------------------------------------------------
// Eligibility gate (physician review A3): contraindication screen before any manoeuvre is offered
// ---------------------------------------------------------------------------------------------

export const BALANCE_MAX_AGE = 65;
/** Khalfa HQ total at or above which sound-exposure tests (LDL) are disabled and RI uses the gentle protocol. */
export const HQ_EXAM_GATE = 28;

export interface ExamEligibility {
  /** Pressure manoeuvres (Toynbee / Valsalva): false → "performed at the ENT examination". */
  pressure: boolean;
  pressureReasons: string[];   // i18n keys (exam.gate.*)
  /** Balance (sway) test: false → disabled. The screen additionally asks about falls inline. */
  balance: boolean;
  balanceReasons: string[];
  /** Loudness-comfort self-report: false → disabled. The screen additionally asks "does sound cause pain" inline. */
  ldl: boolean;
  ldlReasons: string[];
  /** Vascular (head-turn) step is only meaningful for pulsatile tinnitus. */
  vascular: boolean;
  /** HQ ≥ 28 or an early-discomfort LDL record: gentler RI masker and a single trial. */
  hyperacusisGate: boolean;
  hqTotal: number | null;
}

export function examEligibility(a: Assessment | null | undefined): ExamEligibility {
  const rf = a?.redFlags;
  const ca = a?.causeAnswers ?? {};
  const h = a?.history;
  const hq = a?.questionnaires?.find((q) => q.id === 'HQ');
  const hqTotal = hq ? hq.total : null;

  const pressureReasons: string[] = [];
  if (rf?.headTrauma) pressureReasons.push('exam.gate.headTrauma');
  if (rf?.suddenHearingLoss) pressureReasons.push('exam.gate.suddenHL');
  if (rf?.vertigo) pressureReasons.push('exam.gate.vertigo');
  if (rf?.otorrhoeaOrPain) pressureReasons.push('exam.gate.otorrhoea');
  if (ca.barotrauma) pressureReasons.push('exam.gate.barotrauma');
  if (ca.soundInducedDizzy) pressureReasons.push('exam.gate.soundDizzy');

  const balanceReasons: string[] = [];
  if (rf?.vertigo) balanceReasons.push('exam.gate.vertigo');
  if (rf?.menierePattern) balanceReasons.push('exam.gate.meniere');
  if (h?.age != null && h.age >= BALANCE_MAX_AGE) balanceReasons.push('exam.gate.age');

  const ldlReasons: string[] = [];
  if (hqTotal != null && hqTotal >= HQ_EXAM_GATE) ldlReasons.push('exam.gate.hq');

  return {
    pressure: pressureReasons.length === 0, pressureReasons,
    balance: balanceReasons.length === 0, balanceReasons,
    ldl: ldlReasons.length === 0, ldlReasons,
    vascular: !!rf?.pulsatile || a?.history?.pattern === 'pulsatile',
    hyperacusisGate: (hqTotal != null && hqTotal >= HQ_EXAM_GATE) || a?.exam?.ldlLow === true,
    hqTotal,
  };
}

/**
 * Output ceiling (dB re full scale) for hyperacusis sound-exposure presets: never above −8 dBFS and, when a
 * loudness-comfort self-report exists, at least 15 dB below the first "uncomfortable" level (audiologist B9).
 */
export const HYPERACUSIS_CEILING_DB = -8;
export function hyperacusisCeilingDb(exam?: Pick<ExamResult, 'ldlDb'> | null): number {
  const ldl = exam?.ldlDb;
  if (ldl == null || !Number.isFinite(ldl)) return HYPERACUSIS_CEILING_DB;
  return Math.min(HYPERACUSIS_CEILING_DB, ldl - 15);
}

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

export interface ExamStepOptions { pulsatile?: boolean; eligibility?: ExamEligibility }

/**
 * Steps shown in the hub for this user: vascular only for pulsatile tinnitus; pressure, balance and LDL
 * only when the eligibility gate allows them (the gated ones are listed separately as "done at the ENT exam").
 */
export function applicableExamSteps(opts: ExamStepOptions): ExamStepDef[] {
  const e = opts.eligibility;
  return EXAM_STEPS.filter((s) => {
    if (s.id === 'vascular') return !!opts.pulsatile || !!e?.vascular;
    if (!e) return true;
    if (s.id === 'pressure') return e.pressure;
    if (s.id === 'balance') return e.balance;
    if (s.id === 'ldl') return e.ldl;
    return true;
  });
}

/** Steps hidden by the eligibility gate, with their reasons (i18n keys). */
export function gatedExamSteps(e: ExamEligibility): { id: ExamStepId; reasons: string[] }[] {
  const out: { id: ExamStepId; reasons: string[] }[] = [];
  if (!e.pressure) out.push({ id: 'pressure', reasons: e.pressureReasons });
  if (!e.ldl) out.push({ id: 'ldl', reasons: e.ldlReasons });
  if (!e.balance) out.push({ id: 'balance', reasons: e.balanceReasons });
  return out;
}

/**
 * Route of the next in-app step after `current` when the battery is run in sequence ("Sırayla başla").
 * The somatic self-test lives outside this folder, so the sequence ends after the last in-app step.
 */
export function nextExamRoute(current: ExamStepId, opts: ExamStepOptions): string | null {
  const seq = applicableExamSteps(opts).filter((s) => s.id !== 'somatic');
  const i = seq.findIndex((s) => s.id === current);
  if (i === -1 || i + 1 >= seq.length) return null;
  return seq[i + 1].route;
}

// ---------------------------------------------------------------------------------------------
// Digits-in-noise (DIN)
// ---------------------------------------------------------------------------------------------

/** 24 triplets; SRT = mean SNR of trials 5–24 (Smits 2013 / De Sousa 2020 adaptive track). */
export const DIN_TRIALS = 24;
export const DIN_SCORED_FROM_TRIAL = 5;
export const DIN_SCORED_TRIALS = DIN_TRIALS - DIN_SCORED_FROM_TRIAL + 1;
export const DIN_START_SNR_DB = 10;
export const DIN_STEP_BEFORE_REVERSAL_DB = 4;
export const DIN_STEP_AFTER_REVERSAL_DB = 2;
export const DIN_MIN_SNR_DB = -16;
export const DIN_MAX_SNR_DB = 14;
/** Linear noise volume at 0 dB SNR (TTS output is fixed, so the noise carries the SNR). */
export const DIN_BASE_NOISE_VOLUME = 0.12;
/**
 * @deprecated No Turkish triplet norm exists and the TTS output level is not fixed, so the app no longer
 * labels a DIN result as pass/fail (physician B8). Kept only for legacy records.
 */
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
 * the first reversal and 2 dB afterwards. After `DIN_TRIALS` the SRT is the mean SNR of the last `scored` trials.
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

/** @deprecated see DIN_PASS_SRT_DB — results are recorded, not labelled. */
export const dinPassed = (srtDb: number) => srtDb <= DIN_PASS_SRT_DB;

/** Spoken form of a triplet: digits separated by commas so the TTS engine inserts a short pause. */
export const tripletUtterance = (digits: number[]) => digits.join(', ');

// ---------------------------------------------------------------------------------------------
// Loudness discomfort level (LDL)
// ---------------------------------------------------------------------------------------------

/**
 * "Ses rahatlık öz-bildirimi" (loudness-comfort self-report): −50 dBFS start, 3 dB steps, 1 kHz only,
 * ceiling 10 dB below the user's output cap, three-level response (Cox 1997 contour / Sherlock & Formby
 * 2005: the record is the first "uncomfortable", not "loud but tolerable"). Not a clinical LDL.
 */
export const LDL_START_DB = -50;
export const LDL_STEP_DB = 3;
export const LDL_FREQS = [1000] as const;
export const LDL_CEILING_BELOW_CAP_DB = 10;
export const LDL_MAX_PRESENTATIONS = 16;
/** Discomfort at least this far below the ceiling is recorded as an early-discomfort pattern (heuristic, uncalibrated). */
export const LDL_LOW_MARGIN_DB = 20;
/** Dynamic range (LDL − threshold at the same frequency) below this is the audiologist's "reduced tolerance" pattern. */
export const LDL_DYNAMIC_RANGE_LOW_DB = 55;

export type LdlResponse = 'comfortable' | 'loudOk' | 'uncomfortable';

/** Ceiling for the LDL stimulus: 10 dB under the user's cap, never above −10 dBFS. */
export const ldlCeilingDb = (capDb: number) => Math.min(0, capDb) - LDL_CEILING_BELOW_CAP_DB;

export interface LdlState {
  freq: number;
  level: number;
  stepDb: number;
  /** Ceiling of the run (already includes the margin under the user's cap). */
  capDb: number;
  presentations: number;
  done: boolean;
  /** Level at the first "uncomfortable" response; undefined when the ceiling was reached without discomfort. */
  discomfortDb?: number;
  /** Level at the first "loud but tolerable" response (informational). */
  loudOkDb?: number;
  reachedCap: boolean;
}

export function startLdl(freq: number, ceilingDb: number, opts: { startDb?: number; stepDb?: number } = {}): LdlState {
  const cap = Math.min(0, ceilingDb);
  const level = Math.min(cap, opts.startDb ?? LDL_START_DB);
  return { freq, level, stepDb: opts.stepDb ?? LDL_STEP_DB, capDb: cap, presentations: 0, done: false, reachedCap: level >= cap };
}

/**
 * "Comfortable" / "loud but tolerable" → ascend one step (stop at the ceiling or after LDL_MAX_PRESENTATIONS);
 * "uncomfortable" → done at the current level. A boolean is accepted for backwards compatibility (true = uncomfortable).
 */
export function respondLdl(state: LdlState, response: LdlResponse | boolean): LdlState {
  if (state.done) return state;
  const r: LdlResponse = typeof response === 'boolean' ? (response ? 'uncomfortable' : 'comfortable') : response;
  const presentations = state.presentations + 1;
  if (r === 'uncomfortable') return { ...state, presentations, done: true, discomfortDb: state.level };
  const loudOkDb = state.loudOkDb ?? (r === 'loudOk' ? state.level : undefined);
  if (state.level >= state.capDb || presentations >= LDL_MAX_PRESENTATIONS) return { ...state, presentations, loudOkDb, done: true, reachedCap: true };
  const level = Math.min(state.capDb, state.level + state.stepDb);
  return { ...state, presentations, loudOkDb, level, reachedCap: level >= state.capDb };
}

/** LDL − hearing threshold at the same frequency (dB SL dynamic range); null when either is unknown. */
export function ldlDynamicRangeDb(ldlDb: number | null | undefined, thresholdDb: number | null | undefined): number | null {
  if (ldlDb == null || thresholdDb == null || !Number.isFinite(ldlDb) || !Number.isFinite(thresholdDb)) return null;
  return Math.round(ldlDb - thresholdDb);
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
/** @deprecated The accelerometer RMS cut-off is arbitrary (physician B8); sway is recorded for the clinician, never labelled. */
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

/** @deprecated see SWAY_ABNORMAL_SCORE. */
export const swayAbnormal = (score: number) => score > SWAY_ABNORMAL_SCORE;

/** Eyes-closed / eyes-open ratio (Romberg-like); null when the baseline is too small to divide by. */
export function swayRatio(closedScore: number, openScore: number): number | null {
  if (!(openScore > 0.5)) return null;
  return Math.round((closedScore / openScore) * 10) / 10;
}
