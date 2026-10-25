import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HYPER_COMFORT_CEILING_DB, HYPER_COMFORT_START_DB, TUNE_MAX_HZ,
  clampComfortDb, comfortGain, hyperStartDb, shouldNudgeComfort, stepComfortDb, targetMinutes, tuneFor,
} from '../src/audio/tuning.ts';
import { resolveNamedPreset } from '../src/audio/presets.ts';
import { dbToGain } from '../src/audio/dsp.ts';

// --- C2: pitch match → enrichment auto-tune -------------------------------------------------------

test('tuneFor: 4 kHz at medium confidence tunes; low confidence, > 8 kHz, missing pitch and override do not', () => {
  assert.deepEqual(tuneFor({ pitchHz: 4000, pitchConfidence: 'medium' }, false), { tuned: true, hz: 4000, reason: 'ok' });
  assert.equal(tuneFor({ pitchHz: 6100.4, pitchConfidence: 'high' }, false).hz, 6100);
  assert.equal(tuneFor({ pitchHz: 4000 }, false).tuned, true); // unknown confidence counts as medium
  assert.equal(tuneFor({ pitchHz: 4000, pitchConfidence: 'low' }, false).reason, 'lowConfidence');
  assert.equal(tuneFor({ pitchHz: TUNE_MAX_HZ + 1, pitchConfidence: 'high' }, false).reason, 'tooHigh');
  assert.equal(tuneFor({ pitchHz: TUNE_MAX_HZ, pitchConfidence: 'high' }, false).tuned, true);
  assert.equal(tuneFor(undefined, false).reason, 'noPitch');
  assert.equal(tuneFor({ pitchConfidence: 'high' }, false).reason, 'noPitch');
  assert.equal(tuneFor({ pitchHz: 4000, pitchConfidence: 'high' }, true).reason, 'override');
});

test('enrichment preset: tuned → pink bed + narrow band centred on the pitch; untuned → pink only; notched still needs pitchHz', () => {
  const tuned = resolveNamedPreset('enrichment', { tuneHz: 4000, mixingPoint: 0.4 })!;
  assert.deepEqual(tuned.layers.map((l) => l.id), ['noise.pink', 'narrowband.pitch']);
  const band = tuned.layers[1].spec;
  assert.equal(band.kind, 'narrowband');
  if (band.kind === 'narrowband') { assert.equal(band.centerHz, 4000); assert.equal(band.octaves, 0.5); }
  assert.equal(tuned.layers[1].level, 0.35);
  assert.equal(tuned.volume, 0.4);
  const plain = resolveNamedPreset('enrichment', { mixingPoint: 0.4 })!;
  assert.deepEqual(plain.layers.map((l) => l.id), ['noise.pink']);
  assert.equal(resolveNamedPreset('notched', { tuneHz: 4000 }), null);
});

// --- C3: hyperacusis comfortable level ---------------------------------------------------------------

test('comfort stepping: +2 dB steps from −40 dBFS, never above −18 or below −40', () => {
  assert.equal(HYPER_COMFORT_START_DB, -40);
  assert.equal(HYPER_COMFORT_CEILING_DB, -18);
  let db = HYPER_COMFORT_START_DB;
  const seen: number[] = [];
  for (let i = 0; i < 15; i++) { const r = stepComfortDb(db, 'up'); db = r.db; seen.push(db); }
  assert.equal(seen[0], -38);
  assert.equal(db, -18);
  assert.ok(stepComfortDb(-18, 'up').atCeiling);
  assert.equal(stepComfortDb(-18, 'up').db, -18);
  assert.equal(stepComfortDb(-40, 'down').db, -40);
  assert.ok(stepComfortDb(-40, 'down').atFloor);
  assert.equal(stepComfortDb(-30, 'down').db, -32);
  assert.equal(clampComfortDb(-5), -18);
  assert.equal(clampComfortDb(-60), -40);
  assert.equal(clampComfortDb(NaN), -40);
});

test('hyperStartDb / comfortGain: first open starts at −40 dBFS, later opens at the stored level under the caps', () => {
  assert.equal(hyperStartDb(null), -40);
  assert.equal(hyperStartDb(undefined), -40);
  assert.equal(hyperStartDb(-26), -26);
  assert.equal(hyperStartDb(-10), -18);
  assert.ok(Math.abs(comfortGain(-40) - dbToGain(-40)) < 1e-9);
  assert.equal(comfortGain(-18, 0.05), 0.05);
  assert.ok(Math.abs(comfortGain(-18, 0.85, dbToGain(-8)) - dbToGain(-18)) < 1e-9);
});

test('weekly +2 dB nudge: only in a later week than the last answer, and never at the ceiling', () => {
  assert.equal(shouldNudgeComfort(null, null, 3), false);
  assert.equal(shouldNudgeComfort(-30, 1, 1), false);
  assert.equal(shouldNudgeComfort(-30, 1, 2), true);
  assert.equal(shouldNudgeComfort(-30, 2, 2), false);
  assert.equal(shouldNudgeComfort(-18, 1, 5), false);
  assert.equal(shouldNudgeComfort(-30, null, 5), false);
});

test('targetMinutes: minutes param wins, otherwise 20', () => {
  assert.equal(targetMinutes('10'), 10);
  assert.equal(targetMinutes('12.4'), 12);
  assert.equal(targetMinutes(undefined), 20);
  assert.equal(targetMinutes('abc'), 20);
  assert.equal(targetMinutes('0'), 20);
  assert.equal(targetMinutes(undefined, 30), 30);
  const hyper = resolveNamedPreset('hyperacusis', { hyperVolume: dbToGain(-40) })!;
  assert.ok(Math.abs(hyper.volume - 0.01) < 1e-9);
});
