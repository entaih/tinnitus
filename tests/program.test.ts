import test from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_PRACTICE_POOL, dailyPracticeFor, generateProgram, measurementTasksFor, tasksForDay, type ProgramPrefs } from '../src/clinical/program.ts';
import { UNITS } from '../src/content/registry.ts';
import type { Profile, Program } from '../src/clinical/types.ts';

const profile = (over: Partial<Profile> = {}): Profile => ({
  triage: 'selfcare', triageReasons: ['triage.selfcare'], severityScore: 44, severityBand: 'moderate', severitySource: 'THI',
  subtypes: ['phenotype.chronic', 'phenotype.tonal'], phenotypes: ['chronic', 'tonal'], drivers: ['distress', 'insomnia'], recommendations: [], doctorSummary: [], ...over,
});
const prefs = (over: Partial<ProgramPrefs> = {}): ProgramPrefs => ({ minutesPerDay: 15, style: 'cbt', pitchHz: 6000, riPositive: true, hearingDone: true, ...over });
const ids = (p: Program, w: number, d: number) => tasksForDay(p, w, d).map((t) => t.id);
const PRACTICE = new Set(['exercise.pmr', 'exercise.breathing', 'mind.breathingSpace', 'cbt.relax3', 'cbt.relax5', 'cbt.relax6', 'cbt.concentration', 'mind.bodyScan']);
const activeMin = (p: Program, w: number, d: number) => tasksForDay(p, w, d).filter((t) => t.type !== 'sound').reduce((s, t) => s + t.minutes, 0);

test('registry: new units exist with the agreed routes', () => {
  assert.equal(UNITS['assess.redflagsShort'].route, '/assess/triage?short=1');
  assert.equal(UNITS['assess.redflagsShort'].minutes, 1);
  assert.equal(UNITS['assess.sleepFull'].route, '/assess/questionnaire/SCI');
  assert.equal(UNITS['assess.hyperFull'].route, '/assess/questionnaire/HQ');
  assert.equal(UNITS['review.weekly'].route, '/week-review');
  assert.equal(UNITS['review.weekly'].type, 'review');
  for (const id of ['cbt.concentration', 'act.values', 'cbt.restructuring', 'cbt.exposure', 'cbt.relapse', 'cbt.toolbox', 'cbt.relax5', 'cbt.relax6']) assert.ok(UNITS[id], id);
});

test('day 1: check-in → mixing point → welcome, no PMR, sound enrichment last, ≤ 14 active minutes', () => {
  const p = generateProgram(profile(), prefs());
  const d1 = ids(p, 1, 1);
  assert.deepEqual(d1.slice(0, 3), ['diary.daily', 'sound.mixingPoint', 'cbt.welcome']);
  assert.equal(d1[d1.length - 1], 'sound.enrichment');
  assert.ok(!d1.includes('exercise.pmr'));
  assert.ok(!d1.includes('assess.causes'));
  assert.ok(activeMin(p, 1, 1) <= 14, `active minutes ${activeMin(p, 1, 1)}`);
  // Day 2: PMR + pitch (tonal, pitch missing); day 3 causes + RI; day 4 exam.
  const p2 = generateProgram(profile(), prefs({ pitchHz: undefined, riPositive: undefined, causesDone: false, examDone: false }));
  assert.ok(ids(p2, 1, 2).includes('exercise.pmr'));
  assert.ok(ids(p2, 1, 2).includes('assess.pitch'));
  assert.ok(!ids(p2, 1, 2).includes('assess.exam'));
  assert.ok(ids(p2, 1, 3).includes('assess.causes'));
  assert.ok(ids(p2, 1, 3).includes('sound.ri'));
  assert.ok(ids(p2, 1, 4).includes('assess.exam'));
});

test('sound enrichment is always the last row of a day; sleep sound stays in the background block', () => {
  const p = generateProgram(profile(), prefs({ minutesPerDay: 30 }));
  for (const w of p.weeks) for (const d of w.days) {
    const list = d.tasks.map((t) => t.id);
    const bg = d.tasks.filter((t) => t.type === 'sound' && t.id !== 'sound.mixingPoint');
    if (bg.length) assert.deepEqual(list.slice(-bg.length), bg.map((t) => t.id), `w${w.week}d${d.day}`);
  }
});

test('measurement week 8 spread across days: ≤ 1 assessment a day except mood + anxiety on day 5; no practice on those days', () => {
  const p = generateProgram(profile(), prefs());
  for (let d = 1; d <= 7; d++) {
    const list = tasksForDay(p, 8, d);
    const assessments = list.filter((t) => t.type === 'assessment').map((t) => t.id);
    if (d === 5) assert.deepEqual(assessments, ['assess.mood', 'assess.anxiety']);
    else assert.ok(assessments.length <= 1, `w8d${d}: ${assessments.join(',')}`);
    if (assessments.length) assert.ok(!list.some((t) => PRACTICE.has(t.id)), `w8d${d} has practice`);
  }
  assert.deepEqual(ids(p, 8, 4).filter((x) => x.startsWith('assess.')), ['assess.redflagsShort']);
  assert.deepEqual(ids(p, 8, 6).filter((x) => x.startsWith('assess.')), ['assess.sleep'], 'insomnia arm sleeps on day 6');
  assert.ok(ids(p, 8, 7).includes('assess.thi'));
  assert.ok(!p.weeks.some((w) => w.days.some((d) => d.tasks.some((t) => t.id === 'assess.redflags'))), 'full red-flag screen replaced by the short re-screen');
  // Week 4: mood on day 5, THI on day 7, nothing else.
  assert.deepEqual(measurementTasksFor(4, 5, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.mood']);
  assert.deepEqual(measurementTasksFor(4, 7, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.thi']);
  assert.deepEqual(measurementTasksFor(4, 4, { acute: false, insomnia: true, totalWeeks: 12 }), []);
  // Week 12 mirrors week 8 (no sleep scale without insomnia); 6-week programmes never reach it.
  assert.deepEqual(measurementTasksFor(12, 6, { acute: false, insomnia: false, totalWeeks: 12 }), []);
  assert.deepEqual(measurementTasksFor(12, 4, { acute: false, insomnia: false, totalWeeks: 12 }), ['assess.redflagsShort']);
  // Acute arm: once, in week 4.
  assert.deepEqual(measurementTasksFor(4, 7, { acute: true, insomnia: false, totalWeeks: 4 }), ['assess.thi', 'assess.redflagsShort']);
  const no8 = generateProgram(profile(), prefs()).weeks[7].days.flatMap((d) => d.tasks).filter((t) => t.type === 'assessment');
  assert.equal(no8.length, 5);
});

test('weekly card: review.weekly on day 7 of every week, after the THI on measurement weeks', () => {
  const p = generateProgram(profile(), prefs());
  for (const w of p.weeks) {
    const d7 = w.days[6].tasks.map((t) => t.id);
    assert.ok(d7.includes('review.weekly'), `week ${w.week}`);
    if (d7.includes('assess.thi')) assert.ok(d7.indexOf('review.weekly') > d7.indexOf('assess.thi'), `week ${w.week} order`);
    for (let d = 1; d <= 6; d++) assert.ok(!ids(p, w.week, d).includes('review.weekly'));
  }
});

test('daily practice rotates: no two consecutive days repeat in weeks 3–8; four consecutive days differ from week 7', () => {
  const p = generateProgram(profile({ drivers: ['distress'] }), prefs());
  const practiceOf = (w: number, d: number) => tasksForDay(p, w, d).map((t) => t.id).find((id) => PRACTICE.has(id) && id === dailyPracticeFor(w, d, 'cbt'));
  for (let w = 3; w <= 8; w++) {
    for (let d = 2; d <= 7; d++) {
      const a = dailyPracticeFor(w, d - 1, 'cbt'), b = dailyPracticeFor(w, d, 'cbt');
      assert.notEqual(a, b, `w${w} d${d - 1}/${d}`);
    }
    for (let d = 1; d <= 4; d++) {
      const window = [d, d + 1, d + 2, d + 3].map((x) => dailyPracticeFor(w, x, 'cbt'));
      assert.ok(new Set(window).size >= 3, `w${w} window ${window.join(',')}`);
      if (w >= 7) assert.equal(new Set(window).size, 4, `w${w} window ${window.join(',')}`);
    }
    // the rotated practice is actually scheduled (except on measurement days)
    for (let d = 1; d <= 7; d++) if (!tasksForDay(p, w, d).some((t) => t.type === 'assessment')) assert.equal(practiceOf(w, d), dailyPracticeFor(w, d, 'cbt'), `w${w}d${d}`);
  }
  assert.deepEqual(DAILY_PRACTICE_POOL[7], ['cbt.relax6', 'mind.breathingSpace', 'exercise.breathing', 'cbt.concentration']);
  assert.equal(dailyPracticeFor(10, 1, 'cbt'), 'cbt.relax6');
  assert.equal(dailyPracticeFor(3, 1, 'mindfulness'), 'mind.bodyScan');
  assert.equal(dailyPracticeFor(3, 4, 'mindfulness'), 'mind.bodyScan');
  assert.notEqual(dailyPracticeFor(3, 2, 'mindfulness'), dailyPracticeFor(3, 3, 'mindfulness'));
});

test('weeks 9–12 each hold at least one module, using the consolidation units', () => {
  const p = generateProgram(profile(), prefs());
  assert.equal(p.weeks.length, 12);
  const modules = (w: number) => p.weeks[w - 1].days.flatMap((d) => d.tasks).filter((t) => t.type === 'mind').map((t) => t.id);
  assert.ok(modules(9).includes('cbt.concentration') && modules(9).includes('cbt.toolbox'));
  assert.ok(modules(10).includes('act.values'));
  assert.ok(modules(11).includes('cbt.restructuring'));
  assert.ok(modules(12).includes('cbt.exposure') && modules(12).includes('cbt.relapse'));
  for (let w = 9; w <= 12; w++) assert.ok(modules(w).length >= 1, `week ${w}`);
});

test('gated full scales: SCI-8 on w2d2 only for insomnia without SCI; HQ-14 on w2d4 only for hyperacusis without HQ', () => {
  const ins = generateProgram(profile(), prefs());
  assert.ok(ids(ins, 2, 2).includes('assess.sleepFull'));
  assert.ok(!ids(ins, 2, 2).some((id) => PRACTICE.has(id)), 'measurement is the core of the day');
  assert.ok(!ids(generateProgram(profile(), prefs({ sciDone: true })), 2, 2).includes('assess.sleepFull'));
  assert.ok(!ids(generateProgram(profile({ drivers: ['distress'] }), prefs()), 2, 2).includes('assess.sleepFull'));
  const hyp = generateProgram(profile({ drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs());
  assert.equal(hyp.arm, 'hyperacusisFirst');
  assert.ok(ids(hyp, 2, 4).includes('assess.hyperFull'));
  assert.ok(!ids(generateProgram(profile({ drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs({ hqDone: true })), 2, 4).includes('assess.hyperFull'));
});

test('acute arm: 4 weeks, THI only via the measurement schedule, practice from week 2', () => {
  const p = generateProgram(profile({ phenotypes: ['acute', 'tonal'], drivers: ['distress'] }), prefs());
  assert.equal(p.weeks.length, 4);
  assert.equal(p.weeks.flatMap((w) => w.days).flatMap((d) => d.tasks).filter((t) => t.id === 'assess.thi').length, 1);
  assert.ok(!p.weeks[0].days.some((d) => d.tasks.some((t) => PRACTICE.has(t.id))));
  assert.ok(p.weeks[1].days.some((d) => d.tasks.some((t) => PRACTICE.has(t.id))));
});
