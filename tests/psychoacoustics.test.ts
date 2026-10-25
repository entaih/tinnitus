import test from 'node:test';
import assert from 'node:assert/strict';
import {
  startPitchRun, choosePitch, pitchRunLength, summarisePitchRuns, octaveCandidates, resolveOctaveChoice, shuffleCandidates,
  startThresholdSearch, respondThreshold, HEARING_SEARCH, TONE_THRESHOLD_SEARCH,
  startMml, mmlStep, mmlHeardNoise, mmlMasked, mmlNotMaskable, mmlAtCap, riMaskerLevel,
  scoreResidualInhibition, applyLevelCap, capDbFor, dbToVolume, loudnessMatch, octavesBetween, median, randomGapMs, pta4FromThresholds,
  PITCH_START_PAIRS, SCREENING_FREQS, CATCH_BLOCK, RI_FIRST_RATING_SEC, RI_RATING_INTERVAL_SEC, RI_MAX_TRIALS_PER_SESSION, RI_MAX_TRIALS_HYPERACUSIS,
  makeCatchScheduler, screenReliability, warbleFor, pitchBandwidthOctaves, nbnLevelCompensationDb, notchedPresetEligible, maskerSpec,
  riHyperacusisGate, riMaxTrials, riRatingSchedule,
  type RiRating,
} from '../src/audio/psychoacoustics.ts';

// --- doctor summary audio lines ------------------------------------------------------------------

import { audioReportLines, AUDIO_PROTOCOL_VERSION } from '../src/clinical/reportAudio.ts';
import type { Assessment } from '../src/clinical/types.ts';

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

test('RI masker level = MML + 10 dB (MML + 5 dB under the hyperacusis gate), capped', () => {
  assert.deepEqual(riMaskerLevel(-30, 0), { levelDb: -20, capped: false, aboveMmlDb: 10 });
  assert.deepEqual(riMaskerLevel(-5, -6), { levelDb: -6, capped: true, aboveMmlDb: 10 });
  assert.deepEqual(riMaskerLevel(-30, 0, { hyperacusis: true }), { levelDb: -25, capped: false, aboveMmlDb: 5 });
  assert.equal(riHyperacusisGate(28, false), true);
  assert.equal(riHyperacusisGate(27, false), false);
  assert.equal(riHyperacusisGate(null, true), true);
  assert.equal(riHyperacusisGate(undefined, undefined), false);
  assert.equal(riMaxTrials(true), RI_MAX_TRIALS_HYPERACUSIS);
  assert.equal(riMaxTrials(false), RI_MAX_TRIALS_PER_SESSION);
});

test('RI rating schedule: 2 s then every 5 s', () => {
  assert.deepEqual(riRatingSchedule(20), [2, 5, 10, 15, 20]);
  assert.equal(riRatingSchedule()[0], RI_FIRST_RATING_SEC);
  assert.equal(riRatingSchedule()[1], RI_RATING_INTERVAL_SEC);
  assert.deepEqual(riRatingSchedule(12, 0, 5), [5, 10]);
});

test('RI scoring with the 2 s first sample and a missed (unconfirmed) sample', () => {
  // Short complete RI caught by the 2 s sample: 0 at 2 s and 5 s, back by 10 s → zero span 2→10 = 8 s.
  const short = scoreResidualInhibition(6, r([[2, 0], [5, 0], [10, 6]]));
  assert.equal(short.category, 'complete');
  assert.ok(short.positive);
  assert.equal(short.durationSec, 10);
  // A rating holds at most one interval: a missed sample at 10 s censors instead of extending the suppression.
  const gap = scoreResidualInhibition(6, r([[2, 2], [5, 2], [15, 6]]));
  assert.equal(gap.positive, true);          // 2→10 s at ≤ 50 % (5 s sample holds until 10 s)
  assert.equal(gap.durationSec, 15);
  const gapOnly = scoreResidualInhibition(6, r([[2, 2], [15, 6]]));
  assert.equal(gapOnly.positive, true);      // 2 s sample holds until 7 s → exactly 5 s
  const tiny = scoreResidualInhibition(6, r([[2, 2], [4, 6]]));
  assert.equal(tiny.positive, false);
});

const r = (pairs: [number, number][]): RiRating[] => pairs.map(([t, value]) => ({ t, value }));

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

test('pitch start pairs vary per run and bandwidth follows the percept', () => {
  assert.equal(PITCH_START_PAIRS.length, 3);
  const s = startPitchRun({ startPair: [500, 6000] });
  assert.equal(s.a, 500); assert.equal(s.b, 6000);
  assert.ok(Math.abs(s.intervalOctaves - octavesBetween(500, 6000)) < 1e-9);
  for (const pair of PITCH_START_PAIRS) {
    const n = pitchRunLength(octavesBetween(pair[0], pair[1]));
    assert.ok(n >= 5 && n <= 6, `${pair} → ${n} steps`);
    const done = runListener(3000, { startPair: pair });
    assert.ok(done.done && octavesBetween(done.estimateHz!, 3000) <= 1 / 12 + 1e-9, `${pair} → ${done.estimateHz}`);
  }
  const shuffled = shuffleCandidates([...PITCH_START_PAIRS], 7);
  assert.deepEqual([...shuffled].sort((x, y) => x[0] - y[0]), [...PITCH_START_PAIRS].sort((x, y) => x[0] - y[0]));
  assert.equal(pitchBandwidthOctaves('tonal'), 0.33);
  assert.equal(pitchBandwidthOctaves('multiple'), 0.33);
  assert.equal(pitchBandwidthOctaves('hiss'), 0.5);
  assert.equal(pitchBandwidthOctaves('buzz'), 0.5);
});

test('narrowband RMS compensation is small, zero at the reference and interpolated', () => {
  assert.equal(nbnLevelCompensationDb(1000), 0);
  for (const hz of [125, 250, 500, 1414, 3000, 8000, 12000, 16000, 20000]) {
    const c = nbnLevelCompensationDb(hz);
    assert.ok(Math.abs(c) <= 3, `${hz} → ${c}`);
    assert.equal(c, Math.round(c * 10) / 10);
  }
  // between 500 (−0.4) and 1000 (0): monotone interpolation
  const mid = nbnLevelCompensationDb(707);
  assert.ok(mid <= 0 && mid >= nbnLevelCompensationDb(500));
});

test('notched preset lock: pitch > 8 kHz or low confidence', () => {
  assert.equal(notchedPresetEligible(4000, 'high'), true);
  assert.equal(notchedPresetEligible(8000, 'medium'), true);
  assert.equal(notchedPresetEligible(8001, 'high'), false);
  assert.equal(notchedPresetEligible(4000, 'low'), false);
  assert.equal(notchedPresetEligible(undefined, 'high'), false);
});

test('hearing screen: 3 kHz included, warble from 3 kHz, catch trials 1 in 6, reliability flag', () => {
  assert.deepEqual([...SCREENING_FREQS], [500, 1000, 2000, 3000, 4000, 6000, 8000]);
  assert.equal(warbleFor(2000), false);
  assert.equal(warbleFor(3000), true);
  assert.equal(warbleFor(8000), true);
  let x = 0.37;
  const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const isCatch = makeCatchScheduler(rnd);
  const flags: boolean[] = [];
  for (let i = 0; i < 10 * CATCH_BLOCK; i++) flags.push(isCatch());
  for (let b = 0; b < 10; b++) {
    const block = flags.slice(b * CATCH_BLOCK, (b + 1) * CATCH_BLOCK);
    assert.equal(block.filter(Boolean).length, 1, `block ${b}`);
  }
  // the slot moves around (not always the same position)
  const positions = new Set<number>();
  for (let b = 0; b < 10; b++) positions.add(flags.slice(b * CATCH_BLOCK, (b + 1) * CATCH_BLOCK).indexOf(true));
  assert.ok(positions.size > 1);
  assert.equal(screenReliability(0), 'ok');
  assert.equal(screenReliability(1), 'ok');
  assert.equal(screenReliability(2), 'low');
});

test('MML/RI share one stimulus: NBN at the pitch, broadband otherwise', () => {
  const nbn = maskerSpec(4120);
  assert.equal(nbn.stimulus, 'nbn');
  assert.equal(nbn.centerHz, 4120);
  assert.deepEqual(nbn.spec, { kind: 'narrowband', color: 'white', centerHz: 4120, octaves: 0.33, seconds: 8 });
  const bbn = maskerSpec(undefined);
  assert.equal(bbn.stimulus, 'bbn');
  assert.equal(bbn.centerHz, undefined);
  assert.deepEqual(bbn.spec, { kind: 'noise', color: 'white', seconds: 8 });
  assert.equal(maskerSpec(NaN).stimulus, 'bbn');
  assert.equal(maskerSpec(20000).centerHz, 16000);
});

test('utility helpers', () => {
  assert.equal(randomGapMs(1000, 3000, () => 0), 1000);
  assert.equal(randomGapMs(1000, 3000, () => 1), 3000);
  assert.equal(pta4FromThresholds([{ freq: 500, levelDb: -40 }, { freq: 1000, levelDb: -40 }, { freq: 2000, levelDb: -30 }, { freq: 4000, levelDb: -10 }, { freq: 8000, levelDb: 0 }]), -30);
  assert.equal(pta4FromThresholds([]), null);
});

/** Key + params stub so the structure (which lines, which values) is asserted without the real dictionaries. */
const tStub = (k: string, p?: Record<string, string | number>) => (p ? `${k} ${JSON.stringify(p)}` : k);

test('audio report: nothing without audio data; header + hearing table in dBFS with method lines', () => {
  assert.deepEqual(audioReportLines({ id: 'a', date: 'd', questionnaires: [] }, tStub), []);
  const a: Assessment = {
    id: 'a', date: 'd', questionnaires: [],
    hearing: {
      date: 'd', ambientOk: true, calibrated: false, mode: 'separate', headphonesVerified: true, reliability: 'ok',
      thresholds: [
        // right: full set with a 4 kHz notch (−35 vs −60 at 2 and 8 kHz); left: 8 kHz missing, 6 kHz 15 dB different from the right
        ...[500, 1000, 2000, 3000, 4000, 6000, 8000].map((freq) => ({ ear: 'right' as const, freq, levelDb: freq === 4000 ? -35 : -60 })),
        ...[500, 1000, 2000, 3000, 4000, 6000].map((freq) => ({ ear: 'left' as const, freq, levelDb: freq === 4000 ? -30 : freq === 6000 ? -45 : -60 })),
      ],
    },
  };
  const lines = audioReportLines(a, tStub);
  assert.ok(lines[0].startsWith('psy.rep.header'));
  assert.ok(lines[0].includes(AUDIO_PROTOCOL_VERSION));
  const right = lines.find((l) => l.startsWith('psy.rep.hear.ear') && l.includes('psy.hear.ear.right'))!;
  assert.ok(right.includes('500/1k/2k/3k/4k/6k/8k Hz: -60/-60/-60/-60/-35/-60/-60'));
  const left = lines.find((l) => l.startsWith('psy.rep.hear.ear') && l.includes('psy.hear.ear.left'))!;
  assert.ok(left.includes('-60/-60/-60/-60/-30/-45/—'));
  const pta = lines.find((l) => l.startsWith('psy.rep.hear.pta'))!;
  assert.ok(pta.includes('"raw":"-52"'));           // worse ear: left (−60,−60,−60,−30 → −52.5; JS rounds half up)
  assert.ok(pta.includes('"hl":18'));
  const meta = lines.find((l) => l.startsWith('psy.rep.hear.meta'))!;
  assert.ok(meta.includes('psy.rep.yes') && meta.includes('psy.rep.hear.rel.ok') && meta.includes('psy.rep.hear.amb.ok'));
  const asym = lines.find((l) => l.startsWith('psy.rep.hear.asym'))!;
  assert.ok(asym.includes('6000 Hz: 15 dB') && !asym.includes('4000'));
  assert.ok(lines.some((l) => l.startsWith('psy.rep.hear.notch')));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.hear.notHeard'))!.includes('8000'));
});

test('audio report: psychoacoustics with stimulus and exam records without pass/fail labels', () => {
  const a: Assessment = {
    id: 'a', date: 'd', questionnaires: [],
    hearing: { date: 'd', ambientOk: false, calibrated: false, mode: 'both', thresholds: [{ ear: 'right', freq: 1000, levelDb: -62 }, { ear: 'left', freq: 1000, levelDb: -62 }] },
    psycho: { date: 'd', pitchHz: 4120, pitchConfidence: 'medium', loudnessDbSl: 12, mmlDb: 14, mmlStimulus: 'nbn', mmlCenterHz: 4120, riPositive: true, riDepth: 0.25, riCategory: 'partial', residualInhibitionSec: 20 },
    exam: { date: 'd', dinSrtDb: -7.1, ldlDb: -20, ldlLow: false, valsalvaPop: true, fullnessRelief: false, headTurnChange: 'quieter', positionalChange: true, swayScore: 9.5, somaticPositive: false },
  };
  const lines = audioReportLines(a, tStub);
  const ear = lines.filter((l) => l.startsWith('psy.rep.hear.ear'));
  assert.equal(ear.length, 1);                      // 'both' mode → one row, not a copied left/right pair
  assert.ok(ear[0].includes('psy.hear.ear.both'));
  assert.ok(!lines.some((l) => l.startsWith('psy.rep.hear.asym')));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.pitch'))!.includes('"hz":4120'));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.loud'))!.includes('"db":12'));
  const mml = lines.find((l) => l.startsWith('psy.rep.mml '))!;
  assert.ok(mml.includes('"db":14') && mml.includes('psy.rep.stim.nbn'));
  const ri = lines.find((l) => l.startsWith('psy.rep.ri '))!;
  assert.ok(ri.includes('psy.rep.ri.positive') && ri.includes('"depth":25') && ri.includes('"dur":20'));
  const din = lines.find((l) => l.startsWith('psy.rep.exam.din'))!;
  assert.ok(din.includes('"db":"-7.1"') && din.includes('"n":24') && din.includes('"from":5'));
  const ldl = lines.find((l) => l.startsWith('psy.rep.exam.ldl '))!;
  assert.ok(ldl.includes('"db":"-20"') && ldl.includes('psy.rep.exam.ldl.dr') && /db\\?":42/.test(ldl));
  assert.ok(lines.some((l) => l.startsWith('psy.rep.exam.pressure')));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.exam.vascular'))!.includes('exam.vascular.quieter'));
  assert.ok(lines.some((l) => l === 'psy.rep.exam.jugularClinic'));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.exam.sway'))!.includes('9.5'));
  assert.ok(lines.some((l) => l.startsWith('psy.rep.exam.somatic')));
  assert.ok(!lines.some((l) => /pass|fail|normal/i.test(l)));
});

test('audio report: not-maskable MML is a flag, not a number', () => {
  const a: Assessment = { id: 'a', date: 'd', questionnaires: [], psycho: { date: 'd', mmlDb: 48, mmlNotMaskable: true, mmlStimulus: 'bbn', riPositive: false, riCategory: 'none', riDepth: 1, residualInhibitionSec: 0 } };
  const lines = audioReportLines(a, tStub);
  assert.ok(!lines.some((l) => l.startsWith('psy.rep.mml ')));
  const nm = lines.find((l) => l.startsWith('psy.rep.mml.notMaskable'))!;
  assert.ok(nm.includes('psy.rep.stim.bbn') && nm.includes('"db":48'));
  assert.ok(lines.find((l) => l.startsWith('psy.rep.ri '))!.includes('psy.rep.ri.negative'));
});
