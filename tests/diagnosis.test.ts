import test from 'node:test';
import assert from 'node:assert/strict';
import { bestPath, certaintyProgress, compareDxSnapshot, diagnose, diagnosisActions, extractFeatures, snapshotOf } from '../src/clinical/diagnosis.ts';
import { buildProfile, computeTriage } from '../src/clinical/engine.ts';
import { programGate } from '../src/components/assess/programGate.ts';
import type { Assessment } from '../src/clinical/types.ts';

const rf = { suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false };
const hist = { side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false } as const;
const thi = { id: 'THI' as const, date: '', answers: Array(25).fill(2), total: 50 };
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '', questionnaires: [thi], redFlags: rf, history: hist, ...over });
const screen = (notch: boolean) => ({ date: '', ambientOk: true, calibrated: false, mode: 'separate' as const, thresholds: [500, 1000, 2000, 3000, 4000, 6000, 8000].flatMap((f) => (['left', 'right'] as const).map((ear) => ({ ear, freq: f, levelDb: notch && (f === 4000 || f === 6000) ? -25 : -60 }))) });
const routes = (a: Assessment) => diagnosisActions(diagnose(a), a).map((x) => x.route);

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

test('comorbidities are coded from screens; the misophonia clue is listed without an ICD code', () => {
  const d = diagnose(base({ questionnaires: [thi, { id: 'GAD7', date: '', answers: [2, 2, 2, 2, 1, 1, 1], total: 11 }, { id: 'HQ', date: '', answers: Array(14).fill(2), total: 28 }] }));
  assert.ok(d.comorbid.some((c) => c.icd === 'F41.1'));
  assert.ok(d.comorbid.some((c) => c.icd === 'H93.23'));
  assert.ok(!d.comorbid.some((c) => c.key === 'dx.comorbid.misophonia'));
  const m = diagnose(base({ history: { ...hist, soundSensitivity: true, misophoniaScreen: true } }));
  assert.ok(m.comorbid.some((c) => c.key === 'dx.comorbid.misophonia'));
});

test('features extract age and chronicity', () => {
  const f = extractFeatures(base({ history: { ...hist, age: 66 } }));
  assert.equal(f.older, true); assert.equal(f.chronic, true);
});

// --- Sprint 2 A2: diagnosisActions / bestPath (6 cases) ---

test('A2-1 tonal user without a pitch match gets the pitch action; it disappears once matched', () => {
  const a = base({ hearing: screen(false), exam: { date: '' }, causeAnswers: { highBp: false } });
  const actions = diagnosisActions(diagnose(a), a);
  assert.deepEqual(actions, [{ key: 'dx.action.pitch', route: '/assess/pitch', minutes: 6 }]);
  assert.deepEqual(routes({ ...a, psycho: { date: '', pitchHz: 6000 } }), []);
});

test('A2-2 certainty is recomputed after the measurement: a left-sided noise user goes from moderate to high once the pitch is high', () => {
  const a = base({ history: { ...hist, side: 'left', character: 'multiple', noiseExposure: true }, hearing: screen(true), exam: { date: '' }, causeAnswers: { highBp: false } });
  const before = diagnose(a);
  assert.equal(before.primary?.id, 'noiseCochlear');
  assert.equal(before.primary?.certainty, 'moderate');
  assert.ok(routes(a).includes('/assess/pitch'));
  const after = diagnose({ ...a, psycho: { date: '', pitchHz: 5000 } });
  assert.equal(after.primary?.certainty, 'high');
  assert.ok(!routes({ ...a, psycho: { date: '', pitchHz: 5000 } }).includes('/assess/pitch'));
});

test('A2-3 SSNHL with high certainty: best path keeps the 24-hour ENT line, treatable by ENT, and the programme gate stays closed', () => {
  const a = base({ redFlags: { ...rf, suddenHearingLoss: true, unilateralSymptoms: true }, history: { ...hist, onset: 'lt3m', side: 'left', earFullness: true } });
  const d = diagnose(a);
  const profile = buildProfile(a);
  const path = bestPath(d, profile);
  assert.equal(path.whenKey, 'rec.ent24h');
  assert.equal(path.curability, 'treatable');
  assert.equal(path.whoKey, 'who.ent');
  assert.equal(path.arm, 'acute');
  assert.equal(path.armKey, 'setup.overview.arm.acute');
  assert.equal(programGate(profile, computeTriage(a).tier).blocked, true);
  assert.ok(profile.recommendations.some((r) => r.key === 'rec.ent24h'));
});

test('A2-4 at most three actions, shortest first, each measurement only once', () => {
  const a = base({ history: { ...hist, side: 'left', somaticModulation: true } });
  const d = diagnose(a);
  assert.equal(d.primary?.id, 'somaticCervical');
  const actions = diagnosisActions(d, a);
  assert.equal(actions.length, 3);
  assert.deepEqual(actions.map((x) => x.route), ['/assess/causes', '/assess/pitch', '/assess/hearing']);
  assert.deepEqual(actions.map((x) => x.minutes), [2, 6, 6]);
  assert.equal(new Set(actions.map((x) => x.route)).size, 3);
  // Exam action when the somatic manoeuvre test is the missing criterion.
  const b = base({ questionnaires: [thi, { id: 'RASST', date: '', answers: [1, 1, 0, 0], total: 2 }], history: { ...hist, character: 'hissing' }, hearing: screen(false), psycho: { date: '', pitchHz: 4000 }, causeAnswers: { highBp: false } });
  assert.ok(routes(b).includes('/assess/exam'));
  assert.ok(!routes({ ...b, exam: { date: '', somaticPositive: false } }).includes('/assess/exam'));
});

test('A2-5 low certainty with every measurement done → no in-app action (card falls back to "ENT + audiometry"), referral at least routine ENT', () => {
  const a = base({ history: { ...hist, side: 'right', character: 'hissing' }, hearing: screen(false), psycho: { date: '', pitchHz: 4000 }, exam: { date: '', somaticPositive: false }, causeAnswers: { highBp: false } });
  const d = diagnose(a);
  assert.equal(d.primary?.id, 'central');
  assert.equal(d.primary?.certainty, 'low');
  assert.ok(d.differentials.some((x) => x.id === 'retrocochlear'));
  assert.deepEqual(diagnosisActions(d, a), []);
  const path = bestPath(d, buildProfile(a));
  assert.equal(path.whenKey, 'rec.entRoutine');
  assert.equal(path.curability, 'manageable');
  assert.equal(path.whoKey, 'who.entPsych');
});

test('A2-6 best path carries the programme arm and escalates a self-care user with an open differential to a routine ENT visit', () => {
  // Insomnia driver → sleep-first arm; manageable central tinnitus.
  const ins = base({ history: { ...hist, sleepProblem: true, priorAudiometry: true }, hearing: screen(false) });
  const insPath = bestPath(diagnose(ins), buildProfile(ins));
  assert.equal(insPath.arm, 'sleepFirst');
  assert.equal(insPath.armKey, 'setup.overview.arm.sleepFirst');
  assert.equal(insPath.curability, 'manageable');
  assert.equal(insPath.whenKey, 'rec.audiologyOnce');
  // A negative RI (CBT-first recommendation) moves the arm.
  const ri = base({ history: { ...hist, priorAudiometry: true }, hearing: screen(false), psycho: { date: '', pitchHz: 4000, riPositive: false } });
  assert.equal(bestPath(diagnose(ri), buildProfile(ri)).arm, 'cbtFirst');
  // Vertigo episodes answered in the cause questions (no red flag → tier 5) open a Ménière differential: routine ENT, not "once".
  const men = base({ history: { ...hist, priorAudiometry: true }, hearing: screen(false), causeAnswers: { vertigoEpisodes: true } });
  const d = diagnose(men);
  assert.equal(d.triageTier, 5);
  assert.ok(d.differentials.some((x) => x.id === 'meniere'));
  assert.equal(bestPath(d, buildProfile(men)).whenKey, 'rec.entRoutine');
});

// --- Sprint 3 A2: "kesinlik arttı" loop (snapshot + comparison) ---

test('A2-7 snapshot/compare: a tonal noise user goes moderate → high after the pitch match; the same snapshot compares as unchanged; a new primary is "changed"', () => {
  const a = base({ history: { ...hist, side: 'left', character: 'multiple', noiseExposure: true }, hearing: screen(true), exam: { date: '' }, causeAnswers: { highBp: false } });
  const before = diagnose(a);
  const snap = snapshotOf(before, a, new Date('2026-10-25T10:00:00Z'));
  assert.deepEqual(snap, { date: '2026-10-25T10:00:00.000Z', primaryId: 'noiseCochlear', certainty: 'moderate', met: before.primary!.met.length, missing: before.primary!.missing.length, measurements: ['hearing', 'exam', 'causes'] });
  assert.equal(compareDxSnapshot(undefined, before, a), null, 'nothing to compare on the first open');
  assert.equal(compareDxSnapshot(snap, before, a)!.kind, 'unchanged');
  const after = { ...a, psycho: { date: '', pitchHz: 5000 } };
  const delta = compareDxSnapshot(snap, diagnose(after), after)!;
  assert.equal(delta.kind, 'raised');
  assert.equal(delta.before, 'moderate'); assert.equal(delta.after, 'high');
  assert.deepEqual(delta.measurements, ['pitch']);
  assert.ok(delta.metAfter > delta.metBefore);
  assert.equal(delta.primaryId, 'noiseCochlear');
  // Second open with the refreshed snapshot: no banner.
  assert.equal(compareDxSnapshot(snapshotOf(diagnose(after), after), diagnose(after), after)!.kind, 'unchanged');
  // A new primary cause (sudden hearing loss reported later) is reported as "changed", not "raised".
  const changed = { ...a, redFlags: { ...rf, suddenHearingLoss: true, unilateralSymptoms: true }, history: { ...a.history!, onset: 'lt3m' as const, earFullness: true } };
  const c = compareDxSnapshot(snap, diagnose(changed), changed)!;
  assert.equal(c.kind, 'changed'); assert.equal(c.prevPrimaryId, 'noiseCochlear'); assert.equal(c.primaryId, 'ssnhl');
  // Certainty bar: met / (met + missing).
  const prog = certaintyProgress(diagnose(after));
  assert.equal(prog.met, diagnose(after).primary!.met.length);
  assert.equal(prog.total, prog.met + diagnose(after).primary!.missing.length);
  assert.ok(prog.fraction > 0.5 && prog.fraction <= 1);
  // More criteria met at the same certainty still counts as raised.
  const sameLevel = { ...snap, met: snap.met - 1 };
  assert.equal(compareDxSnapshot(sameLevel, before, a)!.kind, 'raised');
});
