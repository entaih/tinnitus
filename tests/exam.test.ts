import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIN_PASS_SRT_DB, DIN_SCORED_FROM_TRIAL, DIN_SCORED_TRIALS, DIN_TRIALS, LDL_LOW_MARGIN_DB, LDL_MAX_PRESENTATIONS, LDL_STEP_DB, LDL_FREQS, SWAY_ABNORMAL_SCORE,
  applicableExamSteps, dinNoiseVolume, dinPassed, dinSnrFloor, examEligibility, gatedExamSteps, hyperacusisCeilingDb, ldlCeilingDb, ldlDynamicRangeDb,
  nextExamRoute, randomTriplet, respondDin, respondLdl, startDin, startLdl, summariseLdl, swayAbnormal, swayRatio, swayStats, tripletCorrect, tripletUtterance,
  type SwaySample,
} from '../src/audio/examTests.ts';
import type { Assessment } from '../src/clinical/types.ts';

const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '2026-10-24', questionnaires: [], ...over });
const rf = (over: Partial<NonNullable<Assessment['redFlags']>>) => ({
  suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false, ...over,
});

// --- battery order -------------------------------------------------------------------------------

test('vascular step only for pulsatile tinnitus; sequence skips the external somatic test', () => {
  assert.ok(!applicableExamSteps({ pulsatile: false }).some((s) => s.id === 'vascular'));
  assert.ok(applicableExamSteps({ pulsatile: true }).some((s) => s.id === 'vascular'));
  assert.equal(nextExamRoute('din', {}), '/assess/exam/ldl');
  assert.equal(nextExamRoute('pressure', { pulsatile: false }), '/assess/exam/balance');
  assert.equal(nextExamRoute('pressure', { pulsatile: true }), '/assess/exam/vascular');
  assert.equal(nextExamRoute('balance', { pulsatile: true }), null);
});

// --- eligibility gate (physician A3) --------------------------------------------------------------

test('eligibility: everything allowed on an empty assessment', () => {
  const e = examEligibility(base());
  assert.equal(e.pressure, true); assert.equal(e.balance, true); assert.equal(e.ldl, true);
  assert.equal(e.vascular, false); assert.equal(e.hyperacusisGate, false); assert.equal(e.hqTotal, null);
  assert.deepEqual(gatedExamSteps(e), []);
  assert.equal(examEligibility(null).pressure, true);
});

test('eligibility: pressure manoeuvres hidden for trauma / sudden loss / vertigo / discharge / barotrauma / Tullio', () => {
  for (const flag of ['headTrauma', 'suddenHearingLoss', 'vertigo', 'otorrhoeaOrPain'] as const) {
    const e = examEligibility(base({ redFlags: rf({ [flag]: true }) }));
    assert.equal(e.pressure, false, flag);
    assert.equal(e.pressureReasons.length, 1);
  }
  assert.equal(examEligibility(base({ causeAnswers: { barotrauma: true } })).pressure, false);
  assert.equal(examEligibility(base({ causeAnswers: { soundInducedDizzy: true } })).pressureReasons[0], 'exam.gate.soundDizzy');
  const e = examEligibility(base({ redFlags: rf({ headTrauma: true, vertigo: true }) }));
  assert.deepEqual(e.pressureReasons, ['exam.gate.headTrauma', 'exam.gate.vertigo']);
  assert.ok(!applicableExamSteps({ eligibility: e }).some((s) => s.id === 'pressure'));
  assert.deepEqual(gatedExamSteps(e).map((g) => g.id), ['pressure', 'balance']);
  assert.equal(nextExamRoute('ldl', { eligibility: e }), null); // pressure and balance gated, not pulsatile
});

test('eligibility: balance disabled for vertigo, Ménière pattern or age ≥ 65', () => {
  assert.equal(examEligibility(base({ redFlags: rf({ vertigo: true }) })).balance, false);
  assert.equal(examEligibility(base({ redFlags: rf({ menierePattern: true }) })).balanceReasons[0], 'exam.gate.meniere');
  const old = base({ history: { side: 'both', onset: 'gt5y', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false, age: 65 } });
  assert.equal(examEligibility(old).balance, false);
  assert.equal(examEligibility({ ...old, history: { ...old.history!, age: 64 } }).balance, true);
});

test('eligibility: LDL disabled and RI gated at HQ ≥ 28; ldlLow also gates RI', () => {
  const hq = (total: number) => base({ questionnaires: [{ id: 'HQ', date: '2026-10-24', answers: [], total }] });
  assert.equal(examEligibility(hq(28)).ldl, false);
  assert.equal(examEligibility(hq(28)).hyperacusisGate, true);
  assert.equal(examEligibility(hq(28)).hqTotal, 28);
  assert.equal(examEligibility(hq(27)).ldl, true);
  assert.equal(examEligibility(hq(27)).hyperacusisGate, false);
  assert.equal(examEligibility(base({ exam: { date: 'x', ldlLow: true } })).hyperacusisGate, true);
  assert.equal(examEligibility(base({ exam: { date: 'x', ldlLow: true } })).ldl, true);
  const e = examEligibility(hq(30));
  assert.ok(!applicableExamSteps({ eligibility: e }).some((s) => s.id === 'ldl'));
  assert.equal(nextExamRoute('din', { eligibility: e }), '/assess/exam/pressure');
});

test('eligibility: vascular step from red flag or pulsatile history', () => {
  assert.equal(examEligibility(base({ redFlags: rf({ pulsatile: true }) })).vascular, true);
  assert.ok(applicableExamSteps({ eligibility: examEligibility(base({ redFlags: rf({ pulsatile: true }) })) }).some((s) => s.id === 'vascular'));
});

test('hyperacusis ceiling = min(−8, LDL − 15)', () => {
  assert.equal(hyperacusisCeilingDb(null), -8);
  assert.equal(hyperacusisCeilingDb({ ldlDb: null }), -8);
  assert.equal(hyperacusisCeilingDb({ ldlDb: -10 }), -25);
  assert.equal(hyperacusisCeilingDb({ ldlDb: 10 }), -8);
  assert.equal(hyperacusisCeilingDb({ ldlDb: -40 }), -55);
});

// --- digits in noise -----------------------------------------------------------------------------

test('DIN steps 4 dB before the first reversal and 2 dB after', () => {
  let s = startDin();
  assert.equal(s.snrDb, 10);
  s = respondDin(s, true);
  assert.equal(s.snrDb, 6);
  s = respondDin(s, true);
  assert.equal(s.snrDb, 2);
  s = respondDin(s, false); // first reversal
  assert.equal(s.reversals, 1);
  assert.equal(s.snrDb, 4);
  s = respondDin(s, true);
  assert.equal(s.snrDb, 2);
});

test('DIN finishes after 24 trials with SRT = mean SNR of trials 5–24', () => {
  assert.equal(DIN_TRIALS, 24);
  assert.equal(DIN_SCORED_FROM_TRIAL, 5);
  assert.equal(DIN_SCORED_TRIALS, 20);
  let s = startDin();
  // Simulated listener with a true SRT of −6 dB: correct when SNR ≥ −6.
  while (!s.done) s = respondDin(s, s.snrDb >= -6);
  assert.equal(s.trials.length, DIN_TRIALS);
  assert.ok(s.srtDb != null);
  const tail = s.trials.slice(DIN_SCORED_FROM_TRIAL - 1);
  assert.equal(tail.length, DIN_SCORED_TRIALS);
  const mean = tail.reduce((a, t) => a + t.snrDb, 0) / tail.length;
  assert.equal(s.srtDb, Math.round(mean * 10) / 10);
  assert.ok(Math.abs(s.srtDb! - -6) <= 2, `SRT ${s.srtDb} should converge near −6`);
  assert.equal(respondDin(s, true), s); // no change once done
});

test('DIN SNR is clamped to the track range', () => {
  let s = startDin({ minSnrDb: -4, maxSnrDb: 12 });
  for (let i = 0; i < 6; i++) s = respondDin(s, true);
  assert.equal(s.snrDb, -4);
  for (let i = 0; i < 12; i++) s = respondDin(s, false);
  assert.ok(s.snrDb <= 12);
});

test('noise volume follows 10^(−SNR/20) × base and respects the cap', () => {
  assert.ok(Math.abs(dinNoiseVolume(0).volume - 0.12) < 1e-9);
  assert.ok(Math.abs(dinNoiseVolume(20).volume - 0.012) < 1e-9);
  const capped = dinNoiseVolume(-20, 0.5);
  assert.equal(capped.volume, 0.5);
  assert.equal(capped.capped, true);
  assert.ok(dinSnrFloor(1) <= -16);
  assert.ok(dinSnrFloor(0.24) >= -7 && dinSnrFloor(0.24) <= -6);
});

test('triplets are three distinct digits and scoring requires all three in order', () => {
  let x = 0.1;
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  for (let i = 0; i < 50; i++) {
    const tr = randomTriplet(rnd);
    assert.equal(tr.length, 3);
    assert.equal(new Set(tr).size, 3);
    assert.ok(tr.every((d) => d >= 0 && d <= 9));
  }
  assert.equal(tripletCorrect([4, 7, 2], [4, 7, 2]), true);
  assert.equal(tripletCorrect([4, 7, 2], [4, 2, 7]), false);
  assert.equal(tripletCorrect([4, 7, 2], [4, 7]), false);
  assert.equal(tripletUtterance([4, 7, 2]), '4, 7, 2');
  assert.equal(dinPassed(DIN_PASS_SRT_DB), true);
  assert.equal(dinPassed(DIN_PASS_SRT_DB + 0.5), false);
});

// --- loudness discomfort -------------------------------------------------------------------------

test('LDL self-report: 1 kHz only, ascends 3 dB from −50, three-level response, first "uncomfortable" is the record', () => {
  assert.deepEqual([...LDL_FREQS], [1000]);
  assert.equal(LDL_STEP_DB, 3);
  let s = startLdl(1000, 0);
  assert.equal(s.level, -50);
  s = respondLdl(s, 'comfortable');
  assert.equal(s.level, -47);
  for (let i = 0; i < 4; i++) s = respondLdl(s, 'comfortable');
  assert.equal(s.level, -35);
  s = respondLdl(s, 'loudOk');            // loud but tolerable → keep ascending, remember the level
  assert.equal(s.level, -32);
  assert.equal(s.loudOkDb, -35);
  assert.equal(s.done, false);
  s = respondLdl(s, 'uncomfortable');
  assert.equal(s.done, true);
  assert.equal(s.discomfortDb, -32);
  assert.equal(s.loudOkDb, -35);
  // boolean form kept for compatibility
  let b = startLdl(1000, 0);
  b = respondLdl(b, false); assert.equal(b.level, -47);
  b = respondLdl(b, true); assert.equal(b.discomfortDb, -47);
});

test('LDL ceiling is 10 dB under the user cap; the run stops there (or after the presentation limit) without discomfort', () => {
  assert.equal(ldlCeilingDb(0), -10);
  assert.equal(ldlCeilingDb(-6), -16);
  assert.equal(ldlCeilingDb(5), -10);
  const ceiling = ldlCeilingDb(-6);
  let s = startLdl(1000, ceiling);
  let guard = 0;
  while (!s.done && guard++ < 40) s = respondLdl(s, 'comfortable');
  assert.equal(s.done, true);
  assert.equal(s.reachedCap, true);
  assert.equal(s.discomfortDb, undefined);
  assert.ok(s.level <= ceiling);
  assert.ok(s.presentations <= LDL_MAX_PRESENTATIONS);
  const sum = summariseLdl([s], ceiling);
  assert.equal(sum.ldlDb, ceiling);
  assert.equal(sum.anyAtCap, true);
  assert.equal(sum.ldlLow, false);
  // presentation limit guards a very low ceiling configuration
  let lim = startLdl(1000, 0, { startDb: -90, stepDb: 1 });
  guard = 0;
  while (!lim.done && guard++ < 100) lim = respondLdl(lim, 'comfortable');
  assert.equal(lim.presentations, LDL_MAX_PRESENTATIONS);
  assert.equal(lim.reachedCap, true);
});

test('LDL dynamic range (dB SL) against the hearing-screen threshold', () => {
  assert.equal(ldlDynamicRangeDb(-20, -60), 40);
  assert.equal(ldlDynamicRangeDb(null, -60), null);
  assert.equal(ldlDynamicRangeDb(-20, undefined), null);
});

test('LDL summary averages frequencies and flags a low tolerance pattern', () => {
  const a = { ...startLdl(1000, 0), done: true, discomfortDb: -30 };
  const b = { ...startLdl(4000, 0), done: true, discomfortDb: -20 };
  const sum = summariseLdl([a, b], 0);
  assert.equal(sum.ldlDb, -25);
  assert.equal(sum.ldlLow, -25 <= -LDL_LOW_MARGIN_DB);
  const c = { ...startLdl(1000, 0), done: true, discomfortDb: -5 };
  assert.equal(summariseLdl([c], 0).ldlLow, false);
});

// --- balance -------------------------------------------------------------------------------------

function series(seconds: number, hz: number, amplitudeG: number, noiseFreqHz = 1): SwaySample[] {
  const out: SwaySample[] = [];
  const n = seconds * hz;
  for (let i = 0; i < n; i++) {
    const t = (i / hz) * 1000;
    out.push({ x: 0, y: amplitudeG * Math.sin(2 * Math.PI * noiseFreqHz * (i / hz)), z: 1, t });
  }
  return out;
}

test('a perfectly still phone gives a sway score of zero and ignores the settling window', () => {
  const still = series(10, 20, 0);
  const st = swayStats(still, 3);
  assert.equal(st.score, 0);
  assert.equal(st.n, 10 * 20 - 3 * 20);
  assert.ok(Math.abs(st.meanMs2 - 9.81) < 1e-6);
  assert.equal(swayStats([], 3).n, 0);
});

test('sway score scales with the amplitude of the magnitude oscillation', () => {
  const small = swayStats(series(30, 20, 0.005), 3);
  const large = swayStats(series(30, 20, 0.05), 3);
  assert.ok(large.score > small.score * 5);
  assert.equal(swayAbnormal(SWAY_ABNORMAL_SCORE), false);
  assert.equal(swayAbnormal(SWAY_ABNORMAL_SCORE + 0.1), true);
  assert.equal(swayRatio(10, 5), 2);
  assert.equal(swayRatio(10, 0), null);
});
