import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_BASE_QUESTIONS, MOOD_QUESTIONS, SOUND_TRY_ROUTE, computeJourney, journeyMinutes, journeyRemaining, nextJourneyRoute, soundTryDone } from '../src/clinical/journey.ts';
import { generateProgram } from '../src/clinical/program.ts';
import { buildProfile } from '../src/clinical/engine.ts';
import type { Assessment, CaseHistory, QuestionnaireResult, RedFlags } from '../src/clinical/types.ts';

const rf = (over: Partial<RedFlags> = {}): RedFlags => ({ suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false, ...over });
const history = (over: Partial<CaseHistory> = {}): CaseHistory => ({
  side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false,
  somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false, priorAudiometry: true, ...over,
});
const q = (id: QuestionnaireResult['id'], answers: number[]): QuestionnaireResult => ({ id, date: '2026-10-25', answers, total: answers.reduce((a, b) => a + b, 0) });
const thi = q('THI', Array(25).fill(2));
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '2026-10-25', questionnaires: [], ...over });
const ids = (a: Assessment | null, sessions: { type: string; detail?: string }[] = []) => computeJourney(a, null, { sessions }).steps.map((s) => s.id);
const TRIAL = [{ type: 'sound', detail: 'trial' }];

test('J1 order: safety → THI → preview → history → mood → results; no sound trial before the history; ≤ 8 minutes', () => {
  const j = computeJourney(base({ redFlags: rf() }), null);
  assert.deepEqual(j.steps.map((s) => s.id), ['safety', 'thi', 'preview', 'history', 'mood', 'results']);
  assert.ok(journeyMinutes(j) <= 8, `journey ${journeyMinutes(j)} min`);
  const upTo = (id: string) => j.steps.slice(0, j.steps.findIndex((s) => s.id === id) + 1).reduce((n, s) => n + s.minutes, 0);
  assert.ok(upTo('preview') <= 6, 'preview within 6 minutes');
  assert.equal(j.steps.find((s) => s.id === 'mood')!.route, '/assess/mood');
  assert.equal(j.steps.find((s) => s.id === 'mood')!.questions, MOOD_QUESTIONS);
  assert.equal(j.steps.find((s) => s.id === 'preview')!.route, '/assess/results?preview=1');
  assert.equal(j.steps.find((s) => s.id === 'history')!.questions, HISTORY_BASE_QUESTIONS);
  assert.ok(!j.steps.some((s) => s.id === 'phq' || s.id === 'gad'), 'PHQ/GAD are one mood screen now');
  assert.equal(computeJourney(null, null).current?.id, 'safety');
  assert.equal(nextJourneyRoute(null, null), '/assess/triage?journey=1');
});

test('J2 no sound trial on any triage tier; after a clear safety screen the THI is next', () => {
  for (const flags of [rf(), rf({ suddenHearingLoss: true }), rf({ selfHarm: true }), rf({ unilateralSymptoms: true })]) {
    assert.ok(!ids(base({ redFlags: flags }), TRIAL).includes('soundTry'));
  }
  assert.equal(computeJourney(base({ redFlags: rf() }), null).current?.id, 'thi');
  assert.equal(nextJourneyRoute(base({ redFlags: rf() }), null), '/assess/questionnaire/THI?journey=1');
  // The trial player itself is still recognised in the session log (used by the player screen).
  assert.equal(SOUND_TRY_ROUTE, '/sound/player?preset=enrichment&trial=1');
  assert.equal(soundTryDone(TRIAL), true);
  assert.equal(soundTryDone([]), false);
});
test('J4 preview card after the THI: "Devam: n soru daha" counts history + mood (+ conditional screens); done once seen or once the mood screen exists', () => {
  const a = base({ redFlags: rf(), questionnaires: [thi], soundTryAt: 'x' });
  const j = computeJourney(a, null);
  assert.equal(j.current?.id, 'preview');
  assert.deepEqual(journeyRemaining(j), { questions: HISTORY_BASE_QUESTIONS + MOOD_QUESTIONS, minutes: 2 });
  assert.equal(nextJourneyRoute(a, null), '/assess/results?preview=1&journey=1');
  const seen = computeJourney({ ...a, previewSeenAt: '2026-10-25T10:05:00Z' }, null);
  assert.equal(seen.current?.id, 'history');
  // Conditional screens open from the history flags and add their questions.
  const flagged = computeJourney({ ...a, history: history({ sleepProblem: true, soundSensitivity: true, neckOrJawPain: true }) }, null);
  assert.deepEqual(flagged.steps.map((s) => s.id), ['safety', 'thi', 'preview', 'history', 'hq', 'rasst', 'sci', 'mood', 'results']);
  assert.equal(journeyRemaining(flagged).questions, 2 + 4 + 2 + MOOD_QUESTIONS);
  assert.ok(journeyMinutes(flagged) <= 12);
  // Legacy user (PHQ-9 already stored, preview never seen) never gets the preview.
  const legacy = computeJourney({ ...a, history: history(), questionnaires: [thi, q('PHQ9', Array(9).fill(0))] }, null);
  assert.equal(legacy.steps.find((s) => s.id === 'preview')!.done, true);
  assert.equal(legacy.current?.id, 'mood', 'GAD-7 still missing → the mood screen');
});

test('J5 mood step needs both PHQ-9 and GAD-7 records; then results; with a programme the journey is "today"', () => {
  const a = base({ redFlags: rf(), questionnaires: [thi, q('PHQ9', [0, 0, 0, 0, 0, 0, 0, 0, 0])], history: history(), previewSeenAt: 'x', soundTryAt: 'x' });
  assert.equal(computeJourney(a, null).current?.id, 'mood');
  const both = { ...a, questionnaires: [...a.questionnaires, q('GAD7', [0, 0, 0, 0, 0, 0, 0])] };
  const j = computeJourney(both, null);
  assert.equal(j.current?.id, 'results');
  assert.equal(nextJourneyRoute(both, null), '/assess/results?journey=1');
  assert.equal(j.steps.filter((s) => !s.done).length, 1);
  const program = generateProgram(buildProfile(both), { minutesPerDay: 15, style: 'cbt' });
  const p = computeJourney(both, program);
  assert.equal(p.phase, 'program');
  assert.equal(p.current?.id, 'today');
});
