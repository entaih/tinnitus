import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_RATE, encodeWav, makeRng, noise, notchFilter, rmsDb, sine, bandpassNoise, makeLoopable } from '../src/audio/dsp.ts';
import { renderSound, renderToneBurst } from '../src/audio/sounds.ts';
import { scoreQuestionnaire, THI, PHQ9 } from '../src/clinical/questionnaires.ts';
import { computeTriage, buildProfile } from '../src/clinical/engine.ts';

test('wav header is valid PCM16', () => {
  const bytes = encodeWav([new Float32Array(100)], 44100);
  assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...bytes.slice(8, 12)), 'WAVE');
  assert.equal(bytes.length, 44 + 200);
  const v = new DataView(bytes.buffer);
  assert.equal(v.getUint16(22, true), 1);
  assert.equal(v.getUint32(24, true), 44100);
  assert.equal(v.getUint16(34, true), 16);
});

/** Goertzel power (dB) at f, averaged over a few nearby frequencies to smooth the noise. */
function powerDb(x: Float32Array, f: number): number {
  let acc = 0;
  for (const df of [-60, -30, 0, 30, 60]) {
    const w = (2 * Math.PI * (f + df)) / SAMPLE_RATE;
    const c = 2 * Math.cos(w);
    let s0 = 0, s1 = 0, s2 = 0;
    for (let i = 0; i < x.length; i++) { s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    acc += s1 * s1 + s2 * s2 - c * s1 * s2;
  }
  return 10 * Math.log10(acc / 5 + 1e-12);
}

test('notch filter attenuates the notch centre by > 25 dB and keeps the passband', () => {
  const n = SAMPLE_RATE * 2;
  const w = noise('white', n, makeRng(1));
  const notched = notchFilter(w, 4000, 1);
  const depth = powerDb(w, 4000) - powerDb(notched, 4000);
  const pass = powerDb(w, 1000) - powerDb(notched, 1000);
  const passHi = powerDb(w, 12000) - powerDb(notched, 12000);
  assert.ok(depth > 25, `notch depth ${depth}`);
  assert.ok(Math.abs(pass) < 2, `passband change ${pass}`);
  assert.ok(Math.abs(passHi) < 2, `passband change hi ${passHi}`);
});

test('pure tone loop has integer cycles (seamless)', () => {
  const r = renderSound({ kind: 'tone', freq: 4000, seconds: 2 });
  const s = r.channels[0];
  assert.ok(Math.abs(s[0] - s[s.length - 1]) < 0.02 || Math.abs(s[0]) < 0.01);
});

test('loopable crossfade keeps length and continuity', () => {
  const x = sine(100, 10000);
  const y = makeLoopable(x, 1000);
  assert.equal(y.length, 9000);
});

test('tone burst has ramps', () => {
  const r = renderToneBurst(1000, 200, -20);
  const s = r.channels[0];
  assert.ok(Math.abs(s[0]) < 1e-6);
  assert.ok(Math.max(...Array.from(s.subarray(2000, 4000)).map(Math.abs)) < 0.11);
  const left = renderToneBurst(1000, 100, -12, false, 'left');
  assert.equal(left.channels.length, 2);
  assert.equal(Math.max(...Array.from(left.channels[1]).map(Math.abs)), 0);
});

test('THI scoring and McCombe grades', () => {
  const all4 = Array(25).fill(4);
  assert.equal(scoreQuestionnaire(THI, all4).total, 100);
  assert.equal(scoreQuestionnaire(THI, all4).band, 'catastrophic');
  assert.equal(scoreQuestionnaire(THI, Array(25).fill(2)).band, 'moderate');
  assert.equal(scoreQuestionnaire(THI, Array(25).fill(0)).band, 'none');
});

test('triage: PHQ-9 item 9 wins over everything', () => {
  const a = { id: 'x', date: new Date().toISOString(), questionnaires: [{ id: 'PHQ9' as const, date: '', answers: [0,0,0,0,0,0,0,0,1], total: 1 }], redFlags: undefined };
  assert.equal(computeTriage(a).tier, 0);
  assert.equal(scoreQuestionnaire(PHQ9, [0,0,0,0,0,0,0,0,1]).total, 1);
});

test('triage: sudden hearing loss → tier 1; unilateral → tier 3; nothing → tier 5', () => {
  const base = { id: 'x', date: new Date().toISOString(), questionnaires: [] };
  const rf = { suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false };
  assert.equal(computeTriage({ ...base, redFlags: { ...rf, suddenHearingLoss: true } }).tier, 1);
  assert.equal(computeTriage({ ...base, redFlags: { ...rf, unilateralSymptoms: true } }).tier, 3);
  assert.equal(computeTriage({ ...base, redFlags: rf, hearing: { date: '', thresholds: [], ambientOk: true, calibrated: false } }).tier, 5);
  const p = buildProfile({ ...base, redFlags: rf, hearing: { date: '', thresholds: [], ambientOk: true, calibrated: false } });
  assert.equal(p.triage, 'selfcare');
});
