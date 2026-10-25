/**
 * Pure decision helpers for the player's personalisation (Sprint 2 C2/C3). No React Native imports, so
 * `tests/sound.test.ts` runs them under node.
 */
import type { PsychoacousticResult } from '@/clinical/types';
import { isQuietHour } from '@/notificationRules';
import { dbToGain, gainToDb } from './dsp';

// ---------------------------------------------------------------------------------------------------
// C2 — pitch match → enrichment auto-tune
// ---------------------------------------------------------------------------------------------------

/** Upper limit for centring the narrow-band component on the pitch match (the DSP band and the evidence stop at 8 kHz). */
export const TUNE_MAX_HZ = 8000;
/** Mix level of the pitch-centred narrow-band layer under the pink-noise bed (0..1, relative to master). */
export const TUNE_BAND_LEVEL = 0.35;

export type TuneReason = 'ok' | 'noPitch' | 'tooHigh' | 'lowConfidence' | 'override';
export interface TuneDecision {
  /** True when the enrichment preset should carry a narrow-band layer centred on `hz`. */
  tuned: boolean;
  hz?: number;
  reason: TuneReason;
}

/**
 * Decide whether the enrichment preset is tuned to the user's pitch match: requires a pitch ≤ 8 kHz with
 * confidence 'medium' or 'high' (an unknown confidence counts as medium) and no manual override.
 */
export function tuneFor(psycho: Pick<PsychoacousticResult, 'pitchHz' | 'pitchConfidence'> | null | undefined, override: boolean): TuneDecision {
  const hz = psycho?.pitchHz;
  if (hz == null || !Number.isFinite(hz) || hz <= 0) return { tuned: false, reason: 'noPitch' };
  if (hz > TUNE_MAX_HZ) return { tuned: false, hz, reason: 'tooHigh' };
  if (psycho?.pitchConfidence === 'low') return { tuned: false, hz, reason: 'lowConfidence' };
  if (override) return { tuned: false, hz, reason: 'override' };
  return { tuned: true, hz: Math.round(hz), reason: 'ok' };
}

// ---------------------------------------------------------------------------------------------------
// C3 — hyperacusis "comfortable level" (Formby 2015 / audiologist B9: start clearly comfortable, small steps, hard ceiling)
// ---------------------------------------------------------------------------------------------------

/** Pink noise starts here on the first graded-exposure open (dBFS). */
export const HYPER_COMFORT_START_DB = -40;
/** One press of "a little louder / quieter". */
export const HYPER_COMFORT_STEP_DB = 2;
/** Never above this in the comfort search or the weekly nudge (dBFS). */
export const HYPER_COMFORT_CEILING_DB = -18;
/** Weekly suggestion: +2 dB, optional. */
export const HYPER_NUDGE_DB = 2;

/** Clamp a comfort level to the allowed range, rounded to whole dB. */
export function clampComfortDb(db: number): number {
  if (!Number.isFinite(db)) return HYPER_COMFORT_START_DB;
  return Math.max(HYPER_COMFORT_START_DB, Math.min(HYPER_COMFORT_CEILING_DB, Math.round(db)));
}

/** Step the comfort search up or down by 2 dB, never past −40 / −18 dBFS. */
export function stepComfortDb(db: number, dir: 'up' | 'down'): { db: number; atCeiling: boolean; atFloor: boolean } {
  const next = clampComfortDb(db + (dir === 'up' ? HYPER_COMFORT_STEP_DB : -HYPER_COMFORT_STEP_DB));
  return { db: next, atCeiling: next >= HYPER_COMFORT_CEILING_DB, atFloor: next <= HYPER_COMFORT_START_DB };
}

/** Level the hyperacusis preset should start at: the stored comfort level, or the search start when none is stored. */
export function hyperStartDb(storedDb: number | null | undefined): number {
  return storedDb == null ? HYPER_COMFORT_START_DB : clampComfortDb(storedDb);
}

/** The optional "+2 dB" nudge is offered every week in the active programme and every 2 weeks in maintenance (Sprint 3 C3). */
export const HYPER_NUDGE_INTERVAL_WEEKS: Record<'active' | 'maintenance', number> = { active: 1, maintenance: 2 };

/** Weeks between two "+2 dB" nudges for a programme phase (undefined phase = active). */
export function hyperNudgeIntervalWeeks(phase: 'active' | 'maintenance' | null | undefined): number {
  return HYPER_NUDGE_INTERVAL_WEEKS[phase === 'maintenance' ? 'maintenance' : 'active'];
}

/**
 * Whether to offer the optional "+2 dB" nudge: a comfort level exists, it is below the ceiling, and at least
 * `everyWeeks` programme weeks (1 in the active programme, 2 in maintenance) have passed since the week it was
 * last set or answered in.
 */
export function shouldNudgeComfort(storedDb: number | null | undefined, setWeek: number | null | undefined, currentWeek: number, everyWeeks = 1): boolean {
  if (storedDb == null) return false;
  if (clampComfortDb(storedDb) >= HYPER_COMFORT_CEILING_DB) return false;
  if (setWeek == null) return false;
  return currentWeek - setWeek >= Math.max(1, Math.round(everyWeeks));
}

/** Linear master gain for a comfort level, capped by the user's output cap and the LDL-derived ceiling (both 0..1). */
export function comfortGain(db: number, ...caps: number[]): number {
  return Math.min(dbToGain(clampComfortDb(db)), ...caps.filter((c) => Number.isFinite(c)));
}

/** Whole-dB comfort level for a linear gain (inverse of `comfortGain` without caps). */
export const gainToComfortDb = (gain: number) => clampComfortDb(gainToDb(gain));

// ---------------------------------------------------------------------------------------------------
// Task target inside the player
// ---------------------------------------------------------------------------------------------------

/** Minute target for a task opened in the player: the `minutes` query param when valid, else `fallback`. */
export function targetMinutes(param: string | undefined, fallback = 20): number {
  const n = param == null ? NaN : Number(param);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/** Background-sound target in maintenance: 30 minutes a day (PM Sprint 3 A1 "arka plan ses 30 dk"). */
export const MAINTENANCE_SOUND_MINUTES = 30;
/** Hyperacusis graded exposure without any other hint: 20 minutes. */
export const HYPER_DEFAULT_MINUTES = 20;

/**
 * Minute target for a programme sound task opened in the player (Sprint 3 C3). Null when the player was not
 * opened from a task (`taskKey` missing): no target card. Otherwise, in order:
 *  - maintenance: always 30 (the maintenance background-sound dose);
 *  - the `minutes` query param when valid;
 *  - the task's own `minutes` (light dose: the reduced task length);
 *  - the hyperacusis preset: 20; any other preset: no target.
 */
export function resolveTargetMinutes(opts: {
  taskKey?: string | null; minutesParam?: string; taskMinutes?: number | null;
  phase?: 'active' | 'maintenance' | null; preset?: string | null;
}): number | null {
  if (!opts.taskKey) return null;
  if (opts.phase === 'maintenance') return MAINTENANCE_SOUND_MINUTES;
  const param = opts.minutesParam == null ? NaN : Number(opts.minutesParam);
  if (Number.isFinite(param) && param > 0) return Math.round(param);
  if (opts.taskMinutes != null && Number.isFinite(opts.taskMinutes) && opts.taskMinutes > 0) return Math.round(opts.taskMinutes);
  return opts.preset === 'hyperacusis' ? HYPER_DEFAULT_MINUTES : null;
}

// ---------------------------------------------------------------------------------------------------
// Night timer (Sprint 3 C3): the sleep preset opened inside the quiet hours defaults to a 45-minute timer
// (sleep hygiene: the sound should not run all night), otherwise the preset's own default (90 minutes).
// ---------------------------------------------------------------------------------------------------

export const NIGHT_SLEEP_TIMER_MINUTES = 45;

/** Timer (minutes, null = none) the sleep preset starts with: 45 inside the quiet hours, else `presetDefault`. */
export function sleepTimerFor(preset: string | null | undefined, hour: number, nightStart: number, nightEnd: number, presetDefault: number | null): number | null {
  if (preset !== 'sleep') return presetDefault;
  return isQuietHour(hour, nightStart, nightEnd) ? NIGHT_SLEEP_TIMER_MINUTES : presetDefault;
}

// ---------------------------------------------------------------------------------------------------
// 60-second trial (Sprint 3 C1): a single-button, task-free taste of sound enrichment during the journey.
// ---------------------------------------------------------------------------------------------------

export const TRIAL_SECONDS = 60;
/** `SessionLog.detail` written when the trial completes; the journey's `soundTry.done` reads any sound session. */
export const TRIAL_DETAIL = 'trial';

/** True once `playedSec` reaches the trial length (the trial stops itself there). */
export const trialFinished = (playedSec: number) => playedSec >= TRIAL_SECONDS;
