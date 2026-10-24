/**
 * Guided journey: turns the assessment + programme state into "the one next thing to do".
 * Only steps that change the plan are asked; comorbidity scales open only when the short history flags them.
 */
import type { Assessment, Program } from './types';

export type JourneyStepId = 'safety' | 'history' | 'causes' | 'exam' | 'thi' | 'hq' | 'rasst' | 'sci' | 'phq' | 'gad' | 'results' | 'today';

export interface JourneyStep {
  id: JourneyStepId;
  route: string;
  minutes: number;
  done: boolean;
  /** i18n key explaining why this step exists */
  whyKey: string;
}

export interface Journey {
  phase: 'assess' | 'program';
  steps: JourneyStep[];      // applicable steps, in order
  current: JourneyStep | null;
  index: number;             // index of current (or steps.length when all done)
}

const has = (a: Assessment | null, id: string) => !!a?.questionnaires.some((q) => q.id === id);

export function computeJourney(a: Assessment | null, program: Program | null): Journey {
  if (program) {
    return { phase: 'program', steps: [{ id: 'today', route: '/session', minutes: 0, done: false, whyKey: 'journey.why.today' }], current: { id: 'today', route: '/session', minutes: 0, done: false, whyKey: 'journey.why.today' }, index: 0 };
  }
  const h = a?.history;
  const steps: JourneyStep[] = [
    { id: 'safety', route: '/assess/triage', minutes: 2, done: !!a?.redFlags, whyKey: 'journey.why.safety' },
    { id: 'history', route: '/assess/history', minutes: 2, done: !!h, whyKey: 'journey.why.history' },
    { id: 'thi', route: '/assess/questionnaire/THI', minutes: 4, done: has(a, 'THI'), whyKey: 'journey.why.thi' },
  ];
  if (h?.soundSensitivity) steps.push({ id: 'hq', route: '/assess/questionnaire/HQ', minutes: 2, done: has(a, 'HQ'), whyKey: 'journey.why.hq' });
  if (h?.somaticModulation || h?.neckOrJawPain) steps.push({ id: 'rasst', route: '/assess/questionnaire/RASST', minutes: 1, done: has(a, 'RASST'), whyKey: 'journey.why.rasst' });
  if (h?.sleepProblem) steps.push({ id: 'sci', route: '/assess/questionnaire/SCI', minutes: 2, done: has(a, 'SCI'), whyKey: 'journey.why.sci' });
  steps.push({ id: 'phq', route: '/assess/questionnaire/PHQ9', minutes: 1, done: has(a, 'PHQ9'), whyKey: 'journey.why.phq' });
  steps.push({ id: 'gad', route: '/assess/questionnaire/GAD7', minutes: 1, done: has(a, 'GAD7'), whyKey: 'journey.why.gad' });
  steps.push({ id: 'results', route: '/assess/results', minutes: 1, done: false, whyKey: 'journey.why.results' });
  const index = steps.findIndex((s) => !s.done);
  return { phase: 'assess', steps, current: index === -1 ? null : steps[index], index: index === -1 ? steps.length : index };
}

/** Next route to push when continuing the guided flow (always carries ?journey=1). */
export function nextJourneyRoute(a: Assessment | null, program: Program | null): string {
  const j = computeJourney(a, program);
  const r = j.current?.route ?? '/(tabs)';
  return r.includes('?') ? `${r}&journey=1` : `${r}?journey=1`;
}

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
