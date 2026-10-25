/**
 * Guided journey: turns the assessment + programme state into "the one next thing to do".
 * Only steps that change the plan are asked; comorbidity scales open only when the short history flags them.
 *
 * Sprint 3 order (PM §2 "Yolculuk sırası"): safety → "Sesi dene" (optional, 60 s trial, skipped on an urgent tier)
 * → THI → preview card (gauge + programme length) → history (11 base + conditional 3) → short screens → mood
 * (PHQ-2 + item 9 + GAD-2 on one screen) → results. Targets: first sound at ~3 min, preview at ~6 min, full result ≤ 9.
 */
import type { Assessment, Program } from './types';
import { computeTriage } from './engine';

export type JourneyStepId = 'safety' | 'soundTry' | 'thi' | 'preview' | 'history' | 'hq' | 'rasst' | 'sci' | 'mood' | 'results' | 'today'
  // legacy ids kept for callers that still pass them (no longer generated)
  | 'causes' | 'exam' | 'phq' | 'gad';

export interface JourneyStep {
  id: JourneyStepId;
  route: string;
  minutes: number;
  done: boolean;
  /** i18n key explaining why this step exists */
  whyKey: string;
  /** Optional steps never block the journey: they count as done once offered (see `useJourney.go`) or skipped. */
  optional?: boolean;
  /** Number of questions the step asks (for the "Devam: n soru daha" line of the preview card). */
  questions?: number;
}

export interface Journey {
  phase: 'assess' | 'program';
  steps: JourneyStep[];      // applicable steps, in order
  current: JourneyStep | null;
  index: number;             // index of current (or steps.length when all done)
}

/** What the journey needs besides the assessment: the session log (the sound trial writes `detail: 'trial'`). */
export interface JourneyContext { sessions?: { type: string; detail?: string }[] }

/** Route of the optional 60-second sound trial (Team C's trial mode of the player). */
export const SOUND_TRY_ROUTE = '/sound/player?preset=enrichment&trial=1';
/** Triage tiers 0–2 ("urgent") skip the sound trial. */
export const SOUND_TRY_MAX_TIER = 2;
/** Base questions of the short history (misophonia / OSA follow-ups are conditional). */
export const HISTORY_BASE_QUESTIONS = 11;
/** The mood screen asks PHQ-2, PHQ item 9 and GAD-2 (five items; the full scales open only on a positive screen). */
export const MOOD_QUESTIONS = 5;

const has = (a: Assessment | null, id: string) => !!a?.questionnaires.some((q) => q.id === id);

/** True once a sound trial session was logged (`type: 'sound'`, `detail: 'trial'`). */
export const soundTryDone = (sessions: JourneyContext['sessions']): boolean => !!sessions?.some((s) => s.type === 'sound' && s.detail === 'trial');

export function computeJourney(a: Assessment | null, program: Program | null, ctx: JourneyContext = {}): Journey {
  if (program) {
    return { phase: 'program', steps: [{ id: 'today', route: '/session', minutes: 0, done: false, whyKey: 'journey.why.today' }], current: { id: 'today', route: '/session', minutes: 0, done: false, whyKey: 'journey.why.today' }, index: 0 };
  }
  const h = a?.history;
  const urgent = !!a?.redFlags && computeTriage(a).tier <= SOUND_TRY_MAX_TIER;
  const steps: JourneyStep[] = [
    { id: 'safety', route: '/assess/triage', minutes: 2, done: !!a?.redFlags, whyKey: 'journey.why.safety', questions: 12 },
  ];
  // "Sesi dene": optional one-minute trial right after the safety screen (first value before any scale); never on an urgent tier.
  if (!urgent) steps.push({ id: 'soundTry', route: SOUND_TRY_ROUTE, minutes: 1, done: soundTryDone(ctx.sessions) || !!a?.soundTryAt, whyKey: 'journey.why.soundTry', optional: true, questions: 0 });
  steps.push({ id: 'thi', route: '/assess/questionnaire/THI', minutes: 4, done: has(a, 'THI'), whyKey: 'journey.why.thi', questions: 25 });
  // Preview card right after the THI (band + programme length). Users who already finished the mood screen never see it.
  steps.push({ id: 'preview', route: '/assess/results?preview=1', minutes: 0, done: !!a?.previewSeenAt || has(a, 'PHQ9'), whyKey: 'journey.why.preview', questions: 0 });
  steps.push({ id: 'history', route: '/assess/history', minutes: 1, done: !!h, whyKey: 'journey.why.history', questions: HISTORY_BASE_QUESTIONS });
  // Short screens at baseline (PM sprint 1 §1.2): THS-C (2 items) and SCI-02 (2 items); the full HQ-14 / SCI-8 open as week-2 programme tasks when positive.
  if (h?.soundSensitivity) steps.push({ id: 'hq', route: '/assess/questionnaire/THS', minutes: 1, done: has(a, 'THS') || has(a, 'HQ'), whyKey: 'journey.why.hqShort', questions: 2 });
  if (h?.somaticModulation || h?.neckOrJawPain) steps.push({ id: 'rasst', route: '/assess/questionnaire/RASST', minutes: 1, done: has(a, 'RASST'), whyKey: 'journey.why.rasst', questions: 4 });
  if (h?.sleepProblem) steps.push({ id: 'sci', route: '/assess/questionnaire/SCI02', minutes: 1, done: has(a, 'SCI02') || has(a, 'SCI'), whyKey: 'journey.why.sciShort', questions: 2 });
  steps.push({ id: 'mood', route: '/assess/mood', minutes: 1, done: has(a, 'PHQ9') && has(a, 'GAD7'), whyKey: 'journey.why.mood', questions: MOOD_QUESTIONS });
  steps.push({ id: 'results', route: '/assess/results', minutes: 0, done: false, whyKey: 'journey.why.results', questions: 0 });
  const index = steps.findIndex((s) => !s.done);
  return { phase: 'assess', steps, current: index === -1 ? null : steps[index], index: index === -1 ? steps.length : index };
}

/** Next route to push when continuing the guided flow (always carries ?journey=1). */
export function nextJourneyRoute(a: Assessment | null, program: Program | null, ctx: JourneyContext = {}): string {
  const j = computeJourney(a, program, ctx);
  const r = j.current?.route ?? '/(tabs)';
  return r.includes('?') ? `${r}&journey=1` : `${r}?journey=1`;
}

/** Questions and minutes still ahead after the current step (the preview card's "Devam: n soru daha (≈m dk)"). */
export function journeyRemaining(j: Journey): { questions: number; minutes: number } {
  const ahead = j.steps.filter((s, i) => i > j.index && !s.done && !s.optional);
  return { questions: ahead.reduce((n, s) => n + (s.questions ?? 0), 0), minutes: ahead.reduce((n, s) => n + s.minutes, 0) };
}

/** Total minutes of the applicable steps (the ≤ 9-minute journey budget). */
export const journeyMinutes = (j: Journey) => j.steps.reduce((n, s) => n + s.minutes, 0);

/** Which clinician each triage reason points to, and how soon. Keys resolve to i18n strings. */
export const REFERRAL: Record<string, { who: string; when: 'now' | 'h24' | 'w2' | 'routine' | 'none' }> = {
  'triage.selfHarm': { who: 'who.crisis', when: 'now' },
  'triage.neuro': { who: 'who.emergency', when: 'now' },
  'triage.vertigo': { who: 'who.emergency', when: 'now' },
  'triage.suddenHL': { who: 'who.ent', when: 'h24' },
  'triage.rapidWorsening': { who: 'who.ent', when: 'w2' },
  'triage.severeDistress': { who: 'who.entPsych', when: 'w2' },
  'triage.pulsatile': { who: 'who.entImaging', when: 'routine' },
  'triage.unilateral': { who: 'who.entAudiology', when: 'routine' },
  'triage.otorrhoea': { who: 'who.ent', when: 'routine' },
  'triage.trauma': { who: 'who.ent', when: 'routine' },
  'triage.ototoxic': { who: 'who.prescriber', when: 'routine' },
  'triage.meniere': { who: 'who.ent', when: 'routine' },
  'triage.asymmetry': { who: 'who.entAudiology', when: 'routine' },
  'triage.hearingLoss': { who: 'who.audiology', when: 'routine' },
  'triage.neverTested': { who: 'who.audiology', when: 'routine' },
  'triage.objective': { who: 'who.ent', when: 'routine' },
  'triage.pulsatileUrgent': { who: 'who.entImaging', when: 'w2' },
  'triage.mentalHealth': { who: 'who.psych', when: 'w2' },
  'triage.selfcare': { who: 'who.none', when: 'none' },
};
