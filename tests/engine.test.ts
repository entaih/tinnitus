import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProfile, computeTriage } from '../src/clinical/engine.ts';
import { computeJourney } from '../src/clinical/journey.ts';
import { QUESTIONNAIRES, SCI02, THS, scoreQuestionnaire } from '../src/clinical/questionnaires.ts';
import type { Assessment, CaseHistory, QuestionnaireResult } from '../src/clinical/types.ts';

const history = (over: Partial<CaseHistory> = {}): CaseHistory => ({
  side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false,
  somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false, priorAudiometry: true, ...over,
});
const q = (id: QuestionnaireResult['id'], answers: number[]): QuestionnaireResult => ({ id, date: '2026-10-24', answers, total: answers.reduce((a, b) => a + b, 0) });
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '2026-10-24', questionnaires: [], history: history(), ...over });

test('SCI-02 scale: items are SCI 3 and 7, max 8, ≤2 probable insomnia', () => {
  assert.equal(SCI02.items.length, 2);
  assert.equal(SCI02.items[0], QUESTIONNAIRES.SCI.items[2]);
  assert.equal(SCI02.items[1], QUESTIONNAIRES.SCI.items[6]);
  assert.equal(SCI02.max, 8);
  assert.equal(scoreQuestionnaire(SCI02, [1, 1]).key, 'sci02.probable');
  assert.equal(scoreQuestionnaire(SCI02, [2, 1]).key, 'sci02.ok');
  assert.equal(SCI02.citation, 'espie2014');
});

test('THS-C: two items 0–4, screen positive on C1 ≥ 2 regardless of total', () => {
  assert.equal(THS.max, 8);
  assert.equal(THS.evidence, 'expert');
  assert.equal(THS.citation, 'henry2015');
  assert.equal(scoreQuestionnaire(THS, [2, 0]).key, 'ths.positive');
  assert.equal(scoreQuestionnaire(THS, [1, 3]).key, 'ths.none');
  assert.equal(scoreQuestionnaire(THS, [0, 0]).band, 'none');
});

test('buildProfile: SCI-02 ≤ 2 → insomnia driver; SCI-02 > 2 overrides the history flag', () => {
  const pos = buildProfile(base({ history: history({ sleepProblem: true }), questionnaires: [q('SCI02', [1, 1])] }));
  assert.ok(pos.drivers.includes('insomnia'));
  const neg = buildProfile(base({ history: history({ sleepProblem: true }), questionnaires: [q('SCI02', [3, 2])] }));
  assert.ok(!neg.drivers.includes('insomnia'));
  const historyOnly = buildProfile(base({ history: history({ sleepProblem: true }) }));
  assert.ok(historyOnly.drivers.includes('insomnia'), 'no scale yet → history flag stands');
  const fullSci = buildProfile(base({ questionnaires: [q('SCI02', [4, 4]), q('SCI', [1, 1, 1, 1, 1, 1, 1, 1])] }));
  assert.ok(fullSci.drivers.includes('insomnia'), 'full SCI ≤ 16 still counts');
});

test('buildProfile: THS-C C1 ≥ 2 → hyperacusis phenotype + driver; C1 = 1 does not, even with the history flag', () => {
  const pos = buildProfile(base({ history: history({ soundSensitivity: true }), questionnaires: [q('THS', [2, 1])] }));
  assert.ok(pos.phenotypes.includes('hyperacusis'));
  assert.ok(pos.drivers.includes('hyperacusis'));
  const neg = buildProfile(base({ history: history({ soundSensitivity: true }), questionnaires: [q('THS', [1, 1])] }));
  assert.ok(!neg.phenotypes.includes('hyperacusis'));
  const historyOnly = buildProfile(base({ history: history({ soundSensitivity: true }) }));
  assert.ok(historyOnly.phenotypes.includes('hyperacusis'));
});

test('safety paths unchanged: PHQ item 9 > 0 (even when screened out) → tier 0 crisis path', () => {
  const tri = computeTriage(base({ questionnaires: [{ ...q('PHQ9', [0, 0, 0, 0, 0, 0, 0, 0, 1]), subscales: { screen: 2 } }] }));
  assert.equal(tri.tier, 0);
  assert.equal(tri.reasons[0], 'triage.selfHarm');
});

test('journey: sleep / sound-sensitivity flags open the 2-item screens; the full scales still count as done', () => {
  const j = computeJourney(base({ history: history({ sleepProblem: true, soundSensitivity: true }) }), null);
  const hq = j.steps.find((s) => s.id === 'hq')!;
  const sci = j.steps.find((s) => s.id === 'sci')!;
  assert.equal(hq.route, '/assess/questionnaire/THS');
  assert.equal(hq.minutes, 1);
  assert.equal(sci.route, '/assess/questionnaire/SCI02');
  assert.equal(sci.minutes, 1);
  const done = computeJourney(base({ history: history({ sleepProblem: true, soundSensitivity: true }), questionnaires: [q('HQ', Array(14).fill(1)), q('SCI', Array(8).fill(3))] }), null);
  assert.ok(done.steps.find((s) => s.id === 'hq')!.done);
  assert.ok(done.steps.find((s) => s.id === 'sci')!.done);
});
