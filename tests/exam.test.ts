import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIN_PASS_SRT_DB, DIN_TRIALS, LDL_LOW_MARGIN_DB, SWAY_ABNORMAL_SCORE, applicableExamSteps, dinNoiseVolume, dinPassed, dinSnrFloor,
  nextExamRoute, randomTriplet, respondDin, respondLdl, startDin, startLdl, summariseLdl, swayAbnormal, swayRatio, swayStats, tripletCorrect, tripletUtterance,
  type SwaySample,
} from '../src/audio/examTests.ts';

// --- battery order -------------------------------------------------------------------------------

test('vascular step only for pulsatile tinnitus; sequence skips the external somatic test', () => {
  assert.ok(!applicableExamSteps({ pulsatile: false }).some((s) => s.id === 'vascular'));
  assert.ok(applicableExamSteps({ pulsatile: true }).some((s) => s.id === 'vascular'));
  assert.equal(nextExamRoute('din', {}), '/assess/exam/ldl');
  assert.equal(nextExamRoute('pressure', { pulsatile: false }), '/assess/exam/balance');
  assert.equal(nextExamRoute('pressure', { pulsatile: true }), '/assess/exam/vascular');
  assert.equal(nextExamRoute('balance', { pulsatile: true }), null);
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

test('DIN finishes after 20 trials with SRT = mean of the last 10 SNRs', () => {
  let s = startDin();
  // Simulated listener with a true SRT of −6 dB: correct when SNR ≥ −6.
  while (!s.done) s = respondDin(s, s.snrDb >= -6);
  assert.equal(s.trials.length, DIN_TRIALS);
  assert.ok(s.srtDb != null);
  const tail = s.trials.slice(-10);
  const mean = tail.reduce((a, t) => a + t.snrDb, 0) / 10;
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

test('LDL ascends 5 dB from −50 and stops at the first uncomfortable response', () => {
  let s = startLdl(1000, 0);
  assert.equal(s.level, -50);
  s = respondLdl(s, false);
  assert.equal(s.level, -45);
  for (let i = 0; i < 4; i++) s = respondLdl(s, false);
  assert.equal(s.level, -25);
  s = respondLdl(s, true);
  assert.equal(s.done, true);
  assert.equal(s.discomfortDb, -25);
});

test('LDL stops at the cap without discomfort and the summary uses the cap value', () => {
  const cap = -10;
  let s = startLdl(4000, cap);
  let guard = 0;
  while (!s.done && guard++ < 30) s = respondLdl(s, false);
  assert.equal(s.done, true);
  assert.equal(s.reachedCap, true);
  assert.equal(s.discomfortDb, undefined);
  const sum = summariseLdl([s], cap);
  assert.equal(sum.ldlDb, cap);
  assert.equal(sum.anyAtCap, true);
  assert.equal(sum.ldlLow, false);
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
