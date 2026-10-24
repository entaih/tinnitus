import test from 'node:test';
import assert from 'node:assert/strict';
import { rankCauses, confirmatoryTests, CAUSE_QUESTIONS } from '../src/clinical/causes.ts';
import type { Assessment } from '../src/clinical/types.ts';

const rf = { suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false };
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '', questionnaires: [], redFlags: rf, history: { side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false }, ...over });

test('noise exposure + notch ranks cochlear noise damage first', () => {
  const a = base({ history: { ...base().history!, noiseExposure: true }, hearing: { date: '', ambientOk: true, calibrated: false, thresholds: [500, 1000, 2000, 4000, 6000, 8000].flatMap((f) => (['left', 'right'] as const).map((ear) => ({ ear, freq: f, levelDb: f === 4000 || f === 6000 ? -20 : -45 }))) } });
  const r = rankCauses(a);
  assert.equal(r[0].id, 'noiseCochlear');
  assert.ok(r[0].evidence.includes('ev.notch'));
});

test('pulsatile + neck modulation ranks vascular first and asks for imaging', () => {
  const a = base({ redFlags: { ...rf, pulsatile: true }, causeAnswers: { neckModulates: true } });
  const r = rankCauses(a);
  assert.equal(r[0].id, 'vascular');
  assert.ok(confirmatoryTests(r, 1).includes('test.vascularImaging'));
});

test('blocked ear after a cold with autophony ranks conductive (curable) first', () => {
  const a = base({ causeAnswers: { blockedAfterCold: true, autophony: true }, exam: { date: '', valsalvaPop: true, fullnessRelief: true } });
  assert.equal(rankCauses(a)[0].id, 'conductive');
});

test('sudden hearing loss dominates everything', () => {
  const a = base({ redFlags: { ...rf, suddenHearingLoss: true } });
  assert.equal(rankCauses(a)[0].id, 'ssnhl');
});

test('normal screen, no clues → central tinnitus leads', () => {
  const a = base({ hearing: { date: '', ambientOk: true, calibrated: false, thresholds: [{ ear: 'left', freq: 1000, levelDb: -50 }, { ear: 'right', freq: 1000, levelDb: -50 }] } });
  assert.equal(rankCauses(a)[0].id, 'central');
});

test('adaptive question pool asks fewer than 12 items for a typical case', () => {
  const n = CAUSE_QUESTIONS.filter((q) => q.when(base())).length;
  assert.ok(n <= 12 && n >= 5, `asked ${n}`);
});
