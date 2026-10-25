import test from 'node:test';
import assert from 'node:assert/strict';
import { consequencesOf, consequenceText, profileConsequences, psychoConsequences } from '../src/clinical/consequences.ts';
import { QUESTIONNAIRES, scoreQuestionnaire } from '../src/clinical/questionnaires.ts';
import { assessStrings } from '../src/i18n/areas/assess.ts';
import type { Assessment, QuestionnaireResult } from '../src/clinical/types.ts';

const SEVERITY: Record<string, string> = { 'severity.none': 'Çok hafif', 'severity.mild': 'Hafif', 'severity.moderate': 'Orta', 'severity.severe': 'Şiddetli', 'severity.catastrophic': 'Çok şiddetli' };
const t = (k: string, p?: Record<string, string | number>) => {
  let s = assessStrings.tr[k] ?? SEVERITY[k] ?? k;
  for (const [a, b] of Object.entries(p ?? {})) s = s.replace(new RegExp(`\\{${a}\\}`, 'g'), String(b));
  return s;
};

/** THI answers producing a given total (items are 0/2/4). */
const thiAnswers = (total: number, over: Record<number, number> = {}) => {
  const a = Array(25).fill(0);
  let left = total;
  for (let i = 0; i < 25 && left > 0; i++) { a[i] = Math.min(4, left); left -= a[i]; }
  for (const [i, v] of Object.entries(over)) a[Number(i)] = v;
  return a;
};
const scoredThi = (answers: number[]) => { const s = scoreQuestionnaire(QUESTIONNAIRES.THI, answers); return { total: s.total, subscales: s.subscales, answers }; };
const keys = (list: { key: string }[]) => list.map((c) => c.key);
const base = (over: Partial<Assessment> = {}): Assessment => ({ id: 'a', date: '2026-10-24', questionnaires: [], ...over });

test('THI 44 → 12-week line with band; THI 60 → tier-2 ENT line added', () => {
  const a44 = thiAnswers(44);
  const c = consequencesOf('THI', scoredThi(a44), base());
  assert.equal(c[0].key, 'consequence.thi.length12');
  assert.equal(c[0].params?.t, 44);
  assert.match(consequenceText(t, c[0]), /Puanınız 44: Orta\./);
  const c60 = consequencesOf('THI', scoredThi(thiAnswers(60)), base());
  assert.ok(keys(c60).includes('consequence.thi.tier2'));
  assert.equal(c60[0].key, 'consequence.thi.length12');
});

test('THI ≤ 36 → 6-week line; acute onset → 4-week line', () => {
  assert.equal(consequencesOf('THI', scoredThi(thiAnswers(30)), base())[0].key, 'consequence.thi.length6');
  const acute = base({ history: { side: 'both', onset: 'lt3m', pattern: 'constant', character: 'tonal', noiseExposure: false, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: false, stressWorsens: false } });
  assert.equal(consequencesOf('THI', scoredThi(thiAnswers(44)), acute)[0].key, 'consequence.thi.length4');
});

test('THI catastrophizing (C ≥ 8) and attention (items 1 + 18 ≥ 4) lines', () => {
  // Items 5, 8, 11, 19, 23 are the C subscale (0-based 4, 7, 10, 18, 22).
  const cat = thiAnswers(0, { 4: 4, 7: 4, 10: 2 });
  assert.ok(keys(consequencesOf('THI', scoredThi(cat), base())).includes('consequence.thi.catastrophizing'));
  const att = thiAnswers(0, { 0: 4, 17: 2 });
  assert.ok(keys(consequencesOf('THI', scoredThi(att), base())).includes('consequence.thi.attention'));
  assert.ok(!keys(consequencesOf('THI', scoredThi(thiAnswers(0, { 0: 2 })), base())).includes('consequence.thi.attention'));
});

test('second THI: 44 → 36 is an 8-point meaningful drop; 44 → 47 flat; 44 → 56 worse', () => {
  const prev: QuestionnaireResult = { id: 'THI', date: '2026-09-01', answers: thiAnswers(44), total: 44 };
  const good = consequencesOf('THI', scoredThi(thiAnswers(36)), base(), prev);
  assert.equal(good[0].key, 'consequence.thi.change.good');
  assert.equal(good[0].params?.d, 8);
  assert.equal(good[0].tone, 'success');
  assert.match(consequenceText(t, good[0]), /^8 puan düşüş/);
  assert.ok(!keys(good).includes('consequence.thi.length12'), 'no length line on a repeat measurement');
  const flat = consequencesOf('THI', scoredThi(thiAnswers(46)), base(), prev);
  assert.equal(flat[0].key, 'consequence.thi.change.flat');
  assert.equal(flat[0].params?.d, '+2');
  const worse = consequencesOf('THI', scoredThi(thiAnswers(56)), base(), prev);
  assert.equal(worse[0].key, 'consequence.thi.change.worse');
  assert.equal(worse[0].params?.d, 12);
  assert.equal(worse[0].tone, 'warning');
});

test('PHQ-2 screened out → "programınız değişmedi"; ≥10 moderate; ≥15 high; item 9 → danger line first', () => {
  const out = consequencesOf('PHQ9', { total: 1, subscales: { screen: 2 }, answers: [1, 0, 0, 0, 0, 0, 0, 0, 0] }, base());
  assert.deepEqual(keys(out), ['consequence.phq.screenedOut']);
  assert.match(consequenceText(t, out[0]), /programınız değişmedi/);
  // imported result without the marker: first two < 3 and nothing else answered
  assert.deepEqual(keys(consequencesOf('PHQ9', { total: 2, answers: [1, 1, 0, 0, 0, 0, 0, 0, 0] }, base())), ['consequence.phq.screenedOut']);
  assert.deepEqual(keys(consequencesOf('PHQ9', { total: 8, answers: [2, 2, 1, 1, 1, 1, 0, 0, 0] }, base())), ['consequence.phq.low']);
  assert.deepEqual(keys(consequencesOf('PHQ9', { total: 12, answers: [2, 2, 2, 2, 2, 2, 0, 0, 0] }, base())), ['consequence.phq.moderate']);
  assert.deepEqual(keys(consequencesOf('PHQ9', { total: 16, answers: [3, 3, 3, 3, 2, 2, 0, 0, 0] }, base())), ['consequence.phq.high']);
  const crisis = consequencesOf('PHQ9', { total: 2, subscales: { screen: 2 }, answers: [1, 0, 0, 0, 0, 0, 0, 0, 1] }, base());
  assert.equal(crisis[0].key, 'consequence.phq.item9');
  assert.equal(crisis[0].tone, 'danger');
});

test('GAD: screened out / moderate / high; SCI-02, THS-C, RaSST, HQ lines', () => {
  assert.deepEqual(keys(consequencesOf('GAD7', { total: 1, subscales: { screen: 2 }, answers: [1, 0, 0, 0, 0, 0, 0] }, base())), ['consequence.gad.screenedOut']);
  assert.deepEqual(keys(consequencesOf('GAD7', { total: 11, answers: [2, 2, 2, 2, 2, 1, 0] }, base())), ['consequence.gad.moderate']);
  assert.deepEqual(keys(consequencesOf('GAD7', { total: 16, answers: [3, 3, 3, 3, 2, 2, 0] }, base())), ['consequence.gad.pos']);
  assert.deepEqual(keys(consequencesOf('SCI02', { total: 2, answers: [1, 1] }, base())), ['consequence.sci02.pos']);
  assert.deepEqual(keys(consequencesOf('SCI02', { total: 3, answers: [2, 1] }, base())), ['consequence.sci02.neg']);
  assert.deepEqual(keys(consequencesOf('SCI', { total: 12, answers: [] }, base())), ['consequence.sci02.pos']);
  assert.deepEqual(keys(consequencesOf('THS', { total: 2, answers: [2, 0] }, base())), ['consequence.ths.pos']);
  assert.deepEqual(keys(consequencesOf('THS', { total: 2, answers: [1, 1] }, base())), ['consequence.ths.neg'], 'C1 decides, not the total');
  assert.deepEqual(keys(consequencesOf('HQ', { total: 30, answers: [] }, base())), ['consequence.hq.strong']);
  assert.deepEqual(keys(consequencesOf('HQ', { total: 20, answers: [] }, base())), ['consequence.ths.pos']);
  assert.deepEqual(keys(consequencesOf('RASST', { total: 2, answers: [1, 1, 0, 0] }, base())), ['consequence.rasst.pos']);
  assert.deepEqual(keys(consequencesOf('RASST', { total: 1, answers: [1, 0, 0, 0] }, base())), ['consequence.rasst.neg']);
});

test('results card: first line per scale family (short screen or full form), pitch and RI, capped at 5', () => {
  const a = base({
    questionnaires: [
      { id: 'THI', date: '2026-10-01', answers: thiAnswers(44), total: 44 },
      { id: 'SCI02', date: '2026-10-01', answers: [1, 1], total: 2 },
      { id: 'SCI', date: '2026-10-08', answers: [1, 1, 1, 1, 1, 1, 1, 1], total: 8 },
      { id: 'THS', date: '2026-10-01', answers: [0, 0], total: 0 },
      { id: 'RASST', date: '2026-10-01', answers: [1, 1, 0, 0], total: 2 },
      { id: 'PHQ9', date: '2026-10-01', answers: [1, 0, 0, 0, 0, 0, 0, 0, 0], total: 1, subscales: { screen: 2 } },
      { id: 'GAD7', date: '2026-10-01', answers: [0, 0, 0, 0, 0, 0, 0], total: 0, subscales: { screen: 2 } },
    ],
    psycho: { date: '2026-10-02', pitchHz: 6100, riPositive: true },
  });
  const all = profileConsequences(a, 20);
  assert.deepEqual(keys(all), ['consequence.thi.length12', 'consequence.sci02.pos', 'consequence.ths.neg', 'consequence.rasst.pos', 'consequence.phq.screenedOut', 'consequence.gad.screenedOut', 'consequence.pitch', 'consequence.ri.pos']);
  assert.equal(profileConsequences(a).length, 5);
  assert.equal(profileConsequences(null).length, 0);
  assert.deepEqual(keys(psychoConsequences(base({ psycho: { date: 'x', riCategory: 'none' } }))), ['consequence.ri.neg']);
  assert.match(consequenceText(t, all[6]), /6100 Hz/);
});

test('honesty rule: no consequence line promises a cure ("tedavi eder", "geçer", "iyileştirir")', () => {
  for (const loc of ['tr', 'en'] as const) {
    for (const [k, v] of Object.entries(assessStrings[loc])) {
      if (!k.startsWith('consequence.')) continue;
      assert.doesNotMatch(v, /tedavi eder|geçer\b|geçirir|iyileştirir|kür\b|\bcure/i, `${loc} ${k}`);
    }
    assert.ok(Object.keys(assessStrings[loc]).filter((k) => k.startsWith('consequence.')).length >= 24, `${loc} consequence keys present`);
  }
});
