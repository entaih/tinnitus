import test from 'node:test';
import assert from 'node:assert/strict';
import {
  startPitchRun, choosePitch, pitchRunLength, summarisePitchRuns, octaveCandidates, resolveOctaveChoice, shuffleCandidates,
  startThresholdSearch, respondThreshold, HEARING_SEARCH, TONE_THRESHOLD_SEARCH,
  startMml, mmlStep, mmlHeardNoise, mmlMasked, mmlNotMaskable, mmlAtCap, riMaskerLevel,
  scoreResidualInhibition, applyLevelCap, capDbFor, dbToVolume, loudnessMatch, octavesBetween, median, randomGapMs, pta4FromThresholds,
  type RiRating,
} from '../src/audio/psychoacoustics.ts';

/** Simulate a listener whose tinnitus sits at `trueHz`: always pick the closer stimulus (in log frequency). */
function runListener(trueHz: number, opts?: Parameters<typeof startPitchRun>[0]) {
  let s = startPitchRun(opts);
  let guard = 0;
  while (!s.done && guard++ < 20) {
    const da = octavesBetween(s.a, trueHz);
    const db = octavesBetween(s.b, trueHz);
    s = choosePitch(s, da <= db ? 'a' : 'b', opts);
  }
  return s;
}

test('pitch run starts at 1000 vs 8000 Hz and halves the interval each step', () => {
  const s0 = startPitchRun();
  assert.equal(s0.a, 1000); assert.equal(s0.b, 8000);
  assert.ok(Math.abs(s0.intervalOctaves - 3) < 1e-9);
  const s1 = choosePitch(s0, 'b');
  assert.ok(Math.abs(s1.intervalOctaves - 1.5) < 1e-9);
  // new pair centred on 8000 Hz
  assert.ok(Math.abs(Math.sqrt(s1.a * s1.b) - 8000) < 1e-6);
  assert.ok(Math.abs(octavesBetween(s1.a, s1.b) - 1.5) < 1e-9);
});

test('pitch run converges within one semitone in 6 steps', () => {
  assert.equal(pitchRunLength(), 6);
  for (const trueHz of [1500, 4000, 6300, 11000]) {
    const s = runListener(trueHz);
    assert.ok(s.done);
    assert.equal(s.step, 6);
    assert.equal(s.history.length, 6);
    // final estimate within ~1 semitone of the simulated tinnitus (quantisation of the recursive grid)
    assert.ok(octavesBetween(s.estimateHz!, trueHz) <= 1 / 12 + 1e-9, `${trueHz} → ${s.estimateHz}`);
  }
});

test('anchored run (after octave confusion) starts one octave wide around the anchor', () => {
  const s = startPitchRun({ anchorHz: 4000 });
  assert.ok(Math.abs(octavesBetween(s.a, s.b) - 1) < 1e-9);
  assert.ok(Math.abs(Math.sqrt(s.a * s.b) - 4000) < 1e-6);
  assert.equal(pitchRunLength(1), 4);
  const done = runListener(4300, { anchorHz: 4000 });
  assert.ok(done.done && octavesBetween(done.estimateHz!, 4300) <= 1 / 12 + 1e-9);
});

test('choosing on a finished run is a no-op and frequencies stay inside range', () => {
  const s = runListener(15000);
  assert.deepEqual(choosePitch(s, 'a'), s);
  for (const h of s.history) { assert.ok(h.a >= 125 && h.b <= 16000); }
});

test('run summary: median estimate and confidence bands', () => {
  const high = summarisePitchRuns([4000, 4200, 4400]);
  assert.equal(high.estimateHz, 4200);
  assert.equal(high.confidence, 'high');
  const medium = summarisePitchRuns([3000, 4000, 5000]);
  assert.equal(medium.confidence, 'medium');
  assert.equal(medium.estimateHz, 4000);
  const low = summarisePitchRuns([2000, 4000, 8000]);
  assert.equal(low.confidence, 'low');
  assert.equal(summarisePitchRuns([4000]).confidence, 'low');
  assert.ok(Number.isNaN(summarisePitchRuns([]).estimateHz));
  assert.equal(median([3, 1, 2, 4]), 2.5);
});

test('octave candidates respect the presentable range and resolve to a re-run anchor', () => {
  const c = octaveCandidates(4000);
  assert.deepEqual(c.map((x) => x.relation), ['half', 'same', 'double']);
  assert.deepEqual(octaveCandidates(12000).map((x) => x.relation), ['half', 'same']);
  assert.deepEqual(octaveCandidates(200).map((x) => x.relation), ['same', 'double']);
  assert.deepEqual(resolveOctaveChoice(4000, c[1]), { anchorHz: 4000, rerun: false });
  assert.deepEqual(resolveOctaveChoice(4000, c[0]), { anchorHz: 2000, rerun: true });
  const shuffled = shuffleCandidates(c, 42);
  assert.equal(shuffled.length, 3);
  assert.deepEqual([...shuffled].sort((a, b) => a.hz - b.hz), c);
});

/** Listener with a fixed threshold: hears everything at or above it. */
function runThreshold(opts: typeof HEARING_SEARCH, trueDb: number) {
  let s = startThresholdSearch(opts);
  const levels: number[] = [];
  let guard = 0;
  while (!s.done && guard++ < 60) { levels.push(s.level); s = respondThreshold(s, s.level >= trueDb); }
  return { s, levels };
}

test('hearing threshold search: 5 up / 10 down, two confirmations, ≤ ~10 presentations', () => {
  for (const trueDb of [-50, -37, -25, -5]) {
    const { s, levels } = runThreshold(HEARING_SEARCH, trueDb);
    assert.ok(s.done && !s.notHeard);
    // threshold quantised upwards to the 5 dB grid
    assert.ok(s.thresholdDb! >= trueDb && s.thresholdDb! < trueDb + 5, `${trueDb} → ${s.thresholdDb}`);
    assert.ok(levels.length <= 12, `too many presentations: ${levels.length}`);
    assert.equal(s.ascentResponses.length >= 2, true);
  }
});

test('tone threshold search resolves to 2 dB steps', () => {
  const { s } = runThreshold(TONE_THRESHOLD_SEARCH, -33);
  assert.ok(s.thresholdDb! >= -33 && s.thresholdDb! < -31);
});

test('threshold search reports not heard when nothing is heard up to the cap', () => {
  const { s } = runThreshold(HEARING_SEARCH, 5);
  assert.ok(s.done && s.notHeard && s.reachedCap);
  assert.equal(s.thresholdDb, undefined);
});

test('threshold search handles a listener who hears everything (floor)', () => {
  const { s } = runThreshold(HEARING_SEARCH, -200);
  assert.ok(s.done);
  assert.equal(s.thresholdDb, -70);
});

test('threshold search falls back to the median after maxAscents disagreeing responses', () => {
  let s = startThresholdSearch({ startDb: -40, minDb: -70, maxDb: 0, upStep: 2, downStep: 10, confirmations: 2, maxAscents: 3 });
  // an inconsistent listener: responds at -40, then -48, then -46
  s = respondThreshold(s, true);   // -40 heard → next -50
  s = respondThreshold(s, false);  // -50 → -48
  s = respondThreshold(s, true);   // -48 heard → next -58
  for (let i = 0; i < 6; i++) s = respondThreshold(s, false); // -58..-48
  assert.equal(s.level, -46);
  s = respondThreshold(s, true);
  assert.ok(s.done);
  assert.equal(s.thresholdDb, -46);
});

test('level cap: never above 0 dBFS or the user cap', () => {
  assert.equal(capDbFor(1), 0);
  assert.ok(Math.abs(capDbFor(0.5) + 6.02) < 0.01);
  assert.deepEqual(applyLevelCap(-3, 0.5), { levelDb: capDbFor(0.5), capped: true });
  assert.deepEqual(applyLevelCap(-20, 0.5), { levelDb: -20, capped: false });
  assert.equal(dbToVolume(0), 1);
  assert.ok(Math.abs(dbToVolume(-20) - 0.1) < 1e-9);
  assert.equal(dbToVolume(10), 1);
});

test('loudness match in dB SL flags atypical values', () => {
  assert.deepEqual(loudnessMatch(-30, -42), { dbSl: 12, atypical: false });
  assert.deepEqual(loudnessMatch(-5, -42), { dbSl: 37, atypical: true });
});

test('MML ramp: noise threshold then masking level; not maskable at cap', () => {
  let m = startMml();
  assert.equal(m.level, -60);
  for (let i = 0; i < 10; i++) m = mmlStep(m);
  assert.equal(m.level, -40);
  m = mmlHeardNoise(m);
  assert.equal(m.phase, 'toMasking'); assert.equal(m.noiseThresholdDb, -40);
  for (let i = 0; i < 7; i++) m = mmlStep(m);
  m = mmlMasked(m);
  assert.equal(m.phase, 'done'); assert.equal(m.mmlDb, 14); assert.equal(m.maskingLevelDb, -26);
  assert.equal(mmlStep(m).level, m.level);

  let n = startMml({ startDb: -4, maxDb: 0 });
  n = mmlHeardNoise(n);
  n = mmlStep(n); n = mmlStep(n); n = mmlStep(n);
  assert.ok(mmlAtCap(n)); assert.equal(n.level, 0);
  n = mmlNotMaskable(n);
  assert.ok(n.notMaskable && n.phase === 'done' && n.mmlDb === undefined);
  // masked before hearing the noise is ignored
  assert.equal(mmlMasked(startMml()).phase, 'toThreshold');
});

test('RI masker level = MML + 10 dB, capped', () => {
  assert.deepEqual(riMaskerLevel(-30, 0), { levelDb: -20, capped: false });
  assert.deepEqual(riMaskerLevel(-5, -6), { levelDb: -6, capped: true });
});

const r = (pairs: Array<[number, number]>): RiRating[] => pairs.map(([t, value]) => ({ t, value }));

test('RI scoring: complete, partial, none, censored, rebound', () => {
  const complete = scoreResidualInhibition(6, r([[0, 0], [5, 0], [10, 2], [15, 4], [20, 5], [25, 6]]));
  assert.equal(complete.category, 'complete');
  assert.ok(complete.positive);
  assert.equal(complete.durationSec, 20);
  assert.equal(complete.depth, 0);
  assert.equal(complete.censored, false);

  const partial = scoreResidualInhibition(6, r([[0, 3], [5, 3], [10, 5], [15, 6]]));
  assert.equal(partial.category, 'partial');
  assert.ok(partial.positive);
  assert.equal(partial.durationSec, 10);

  const mild = scoreResidualInhibition(8, r([[0, 6], [5, 7], [10, 8]]));
  assert.equal(mild.category, 'partial');
  assert.equal(mild.positive, false);
  assert.equal(mild.durationSec, 5);

  const none = scoreResidualInhibition(6, r([[0, 6], [5, 6], [10, 7]]));
  assert.equal(none.category, 'none');
  assert.equal(none.durationSec, 0);
  assert.equal(none.rebound, false);

  const censored = scoreResidualInhibition(6, r([[0, 0], [5, 0], [10, 1]]));
  assert.ok(censored.censored);
  assert.equal(censored.durationSec, 15);

  const rebound = scoreResidualInhibition(5, r([[0, 2], [5, 7], [10, 5]]));
  assert.ok(rebound.rebound);

  // a single 0 rating followed immediately by a return does not count as ≥ 5 s at zero
  const blip = scoreResidualInhibition(6, r([[0, 0], [2, 6]]));
  assert.equal(blip.category, 'partial');
  assert.equal(blip.positive, false);

  assert.equal(scoreResidualInhibition(0, r([[0, 0]])).category, 'none');
  assert.equal(scoreResidualInhibition(5, []).category, 'none');
});

test('utility helpers', () => {
  assert.equal(randomGapMs(1000, 3000, () => 0), 1000);
  assert.equal(randomGapMs(1000, 3000, () => 1), 3000);
  assert.equal(pta4FromThresholds([{ freq: 500, levelDb: -40 }, { freq: 1000, levelDb: -40 }, { freq: 2000, levelDb: -30 }, { freq: 4000, levelDb: -10 }, { freq: 8000, levelDb: 0 }]), -30);
  assert.equal(pta4FromThresholds([]), null);
});
