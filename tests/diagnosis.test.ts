import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnose, extractFeatures } from '../src/clinical/diagnosis.ts';
import type { Assessment } from '../src/clinical/types.ts';

const rf = { suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false };
const hist = { side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false } as const;
const thi = { id: 'THI' as const, date: '', answers: Array(25).fill(2), total: 50 };
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '', questionnaires: [thi], redFlags: rf, history: hist, ...over });
const screen = (notch: boolean) => ({ date: '', ambientOk: true, calibrated: false, mode: 'separate' as const, thresholds: [500, 1000, 2000, 3000, 4000, 6000, 8000].flatMap((f) => (['left', 'right'] as const).map((ear) => ({ ear, freq: f, levelDb: notch && (f === 4000 || f === 6000) ? -25 : -60 }))) });

test('noise exposure + notch + high pitch → noise-related cochlear damage with high certainty', () => {
  const d = diagnose(base({ history: { ...hist, noiseExposure: true }, hearing: screen(true), psycho: { date: '', pitchHz: 5000 } }));
  assert.equal(d.primary?.id, 'noiseCochlear');
  assert.equal(d.primary?.certainty, 'high');
  assert.equal(d.base.course, 'chronic');
  assert.ok(d.confirmation.includes('test.audiometryHF'));
});

test('sudden hearing loss becomes the primary diagnosis even though it is a must-exclude aetiology', () => {
  const d = diagnose(base({ redFlags: { ...rf, suddenHearingLoss: true, unilateralSymptoms: true }, history: { ...hist, onset: 'lt3m', side: 'left', earFullness: true } }));
  assert.equal(d.primary?.id, 'ssnhl');
  assert.equal(d.primary?.certainty, 'high');
  assert.equal(d.triageTier, 1);
});

test('one-sided tinnitus with a clean screen → central tinnitus, retrocochlear listed as a differential to exclude', () => {
  const d = diagnose(base({ history: { ...hist, side: 'right' }, hearing: screen(false) }));
  assert.equal(d.primary?.id, 'central');
  assert.ok(d.differentials.some((x) => x.id === 'retrocochlear'));
  assert.equal(d.base.type, 'subjective');
});

test('pulsatile with positional change → vascular differential and pulsatile base type', () => {
  const d = diagnose(base({ redFlags: { ...rf, pulsatile: true }, causeAnswers: { neckModulates: true } }));
  assert.equal(d.base.type, 'pulsatile');
  assert.ok(d.differentials.some((x) => x.id === 'vascular') || d.primary?.id === 'vascular');
});

test('comorbidities are coded from screens', () => {
  const d = diagnose(base({ questionnaires: [thi, { id: 'GAD7', date: '', answers: [2, 2, 2, 2, 1, 1, 1], total: 11 }, { id: 'HQ', date: '', answers: Array(14).fill(2), total: 28 }] }));
  assert.ok(d.comorbid.some((c) => c.icd === 'F41.1'));
  assert.ok(d.comorbid.some((c) => c.icd === 'H93.23'));
});

test('features extract age and chronicity', () => {
  const f = extractFeatures(base({ history: { ...hist, age: 66 } }));
  assert.equal(f.older, true); assert.equal(f.chronic, true);
});
