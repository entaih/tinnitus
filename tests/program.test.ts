import test from 'node:test';
import assert from 'node:assert/strict';
import { ACUTE_WEEK1_POOL, DAILY_PRACTICE_POOL, dailyPracticeFor, generateProgram, hyperExposureMinutes, measurementTasksFor, regenerateProgram, tasksForDay, type ProgramPrefs } from '../src/clinical/program.ts';
import { splitByBudget } from '../src/components/home/taskBudget.ts';
import { UNITS } from '../src/content/registry.ts';
import type { Profile, Program, ProgramTask } from '../src/clinical/types.ts';

const profile = (over: Partial<Profile> = {}): Profile => ({
  triage: 'selfcare', triageReasons: ['triage.selfcare'], severityScore: 44, severityBand: 'moderate', severitySource: 'THI',
  subtypes: ['phenotype.chronic', 'phenotype.tonal'], phenotypes: ['chronic', 'tonal'], drivers: ['distress', 'insomnia'], recommendations: [], doctorSummary: [], ...over,
});
const prefs = (over: Partial<ProgramPrefs> = {}): ProgramPrefs => ({ minutesPerDay: 15, style: 'cbt', pitchHz: 6000, riPositive: true, hearingDone: true, ...over });
const ids = (p: Program, w: number, d: number) => tasksForDay(p, w, d).map((t) => t.id);
const PRACTICE = new Set(['exercise.pmr', 'exercise.breathing', 'mind.breathingSpace', 'cbt.relax3', 'cbt.relax5', 'cbt.relax6', 'cbt.concentration', 'mind.bodyScan']);
/** Background sound (long player presets) is not an active minute; the mixing point and the RI test are. */
const isBackground = (t: ProgramTask) => t.type === 'sound' && t.route.startsWith('/sound/player');
const activeMin = (p: Program, w: number, d: number) => tasksForDay(p, w, d).filter((t) => !isBackground(t)).reduce((s, t) => s + t.minutes, 0);
const allTasks = (p: Program) => p.weeks.flatMap((w) => w.days.flatMap((d) => d.tasks.map((t) => ({ w: w.week, d: d.day, t }))));

/** The four simulated user types of PM sprint 2 §0 at the 15-minute default. */
const SIM: Record<string, Program> = {
  moderateInsomnia: generateProgram(profile(), prefs({ pitchHz: undefined, riPositive: undefined, causesDone: false, examDone: false })),
  severeHyperacusis: generateProgram(profile({ severityBand: 'severe', severityScore: 62, drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs({ examDone: false })),
  mild: generateProgram(profile({ severityBand: 'mild', severityScore: 20, drivers: [] }), prefs()),
  acute: generateProgram(profile({ phenotypes: ['acute', 'tonal'], drivers: ['distress'] }), prefs()),
};

test('registry: new units exist with the agreed routes', () => {
  assert.equal(UNITS['assess.redflagsShort'].route, '/assess/triage?short=1');
  assert.equal(UNITS['assess.redflagsShort'].minutes, 1);
  assert.equal(UNITS['assess.sleepFull'].route, '/assess/questionnaire/SCI');
  assert.equal(UNITS['assess.hyperFull'].route, '/assess/questionnaire/HQ');
  assert.equal(UNITS['review.weekly'].route, '/week-review');
  assert.equal(UNITS['review.weekly'].type, 'review');
  for (const id of ['cbt.concentration', 'act.values', 'cbt.restructuring', 'cbt.exposure', 'cbt.relapse', 'cbt.toolbox', 'cbt.relax5', 'cbt.relax6']) assert.ok(UNITS[id], id);
});

test('day 1: check-in → mixing point (core) → welcome, no PMR, sound enrichment last, ≤ 14 active minutes', () => {
  const p = generateProgram(profile(), prefs());
  const d1 = tasksForDay(p, 1, 1);
  assert.deepEqual(d1.slice(0, 3).map((t) => t.id), ['diary.daily', 'sound.mixingPoint', 'cbt.welcome']);
  assert.equal(d1[d1.length - 1].id, 'sound.enrichment');
  assert.equal(d1[1].core, true, 'the day-1 sound step is the core');
  assert.notEqual(d1[2].core, true, 'one core a day: the welcome module is optional on day 1');
  assert.ok(!ids(p, 1, 1).includes('exercise.pmr'));
  assert.ok(!ids(p, 1, 1).includes('assess.causes'));
  assert.ok(activeMin(p, 1, 1) <= 14, `active minutes ${activeMin(p, 1, 1)}`);
  // Measurements already done: PMR on day 2 (first relaxation skill), breathing on days 3/4.
  assert.ok(ids(p, 1, 2).includes('exercise.pmr'));
  // Missing measurements: pitch d2 (6 min → no practice that day), causes + RI d3, exam d5 (D3: no longer d4); w1d4 ≤ 15 min.
  const p2 = SIM.moderateInsomnia;
  assert.ok(ids(p2, 1, 2).includes('assess.pitch'));
  assert.ok(!ids(p2, 1, 2).some((id) => PRACTICE.has(id)), 'a ≥6-min assessment day carries no practice');
  assert.ok(!ids(p2, 1, 2).includes('assess.exam'));
  assert.ok(ids(p2, 1, 3).includes('assess.causes'));
  assert.ok(ids(p2, 1, 3).includes('sound.ri'));
  assert.ok(!ids(p2, 1, 4).includes('assess.exam'));
  assert.ok(ids(p2, 1, 5).includes('assess.exam'));
  assert.ok(activeMin(p2, 1, 4) <= 15, `w1d4 ${activeMin(p2, 1, 4)} min`);
  assert.ok(!ids(p2, 1, 5).some((id) => PRACTICE.has(id)), 'exam day carries no practice');
  // Week-1 practice pool: PMR at most twice a week (D11).
  const pmrDays = [1, 2, 3, 4, 5, 6, 7].filter((d) => ids(p, 1, d).includes('exercise.pmr'));
  assert.ok(pmrDays.length <= 2, `PMR on ${pmrDays.join(',')}`);
  assert.deepEqual(DAILY_PRACTICE_POOL[1], ['exercise.pmr', 'exercise.breathing', 'exercise.breathing']);
  assert.deepEqual(DAILY_PRACTICE_POOL[2], ['exercise.pmrShort', 'exercise.breathing', 'mind.breathingSpace']);
});

test('simulation (15 min, four user types): ≤ 3 numbered steps, one core a day, no sleep diary, modules never share a day with a core measurement', () => {
  for (const [name, p] of Object.entries(SIM)) {
    for (const { w, d, t } of allTasks(p)) assert.notEqual(t.id, 'sleep.diary', `${name} w${w}d${d} sleep.diary`);
    for (const week of p.weeks) for (const day of week.days) {
      const tag = `${name} w${week.week}d${day.day}`;
      const cores = day.tasks.filter((t) => t.core);
      assert.ok(cores.length <= 1, `${tag}: ${cores.length} cores (${cores.map((t) => t.id).join(',')})`);
      const { shown } = splitByBudget(day.tasks, 15);
      const numbered = shown.filter((t) => !isBackground(t));
      assert.ok(numbered.length <= 3, `${tag}: ${numbered.length} numbered steps (${numbered.map((t) => t.id).join(',')})`);
      // A core measurement (weeks 4/8/12, gated full scales) is the core of its day: no module of the week and no practice
      // (weekly add-on modules such as hyper.education may share the day; they are short and never core).
      const coreMeasurement = day.tasks.some((t) => t.type === 'assessment' && t.core);
      if (coreMeasurement) {
        assert.ok(!day.tasks.some((t) => t.type === 'mind' && !PRACTICE.has(t.id) && !t.id.startsWith('hyper.')), `${tag}: module on a measurement day`);
        assert.ok(!day.tasks.some((t) => PRACTICE.has(t.id)), `${tag}: practice on a measurement day`);
      }
      // A ≥6-minute assessment day (week-1 pitch / hearing / exam) carries no practice either.
      if (day.tasks.some((t) => t.type === 'assessment' && t.minutes >= 6)) assert.ok(!day.tasks.some((t) => PRACTICE.has(t.id)), `${tag}: practice on an assessment day`);
    }
    // Every week has at least one core module day; the module of the week is core.
    for (const week of p.weeks) assert.ok(week.days.some((day) => day.tasks.some((t) => t.core && (t.type === 'mind' || t.type === 'education'))), `${name} w${week.week}: no core module`);
  }
  // cbt.restructuring (weeks 5 and 11) is core on its day.
  for (const { w, d, t } of allTasks(SIM.moderateInsomnia)) if (t.id === 'cbt.restructuring') assert.equal(t.core, true, `w${w}d${d}`);
});

test('acute arm: 4 weeks, THI only via the measurement schedule, breathing-only practice from week 1 day 2', () => {
  const p = SIM.acute;
  assert.equal(p.weeks.length, 4);
  assert.equal(p.arm, 'acute');
  assert.equal(allTasks(p).filter(({ t }) => t.id === 'assess.thi').length, 1);
  for (let d = 1; d <= 7; d++) {
    const active = tasksForDay(p, 1, d).filter((t) => !isBackground(t) && t.type !== 'diary');
    assert.ok(active.length >= 1, `acute w1d${d} has only the check-in`);
  }
  assert.ok(ids(p, 1, 2).includes('exercise.breathing'));
  assert.ok(!p.weeks[0].days.some((d) => d.tasks.some((t) => t.id === 'exercise.pmr')), 'no PMR in acute week 1');
  assert.ok(p.weeks[0].days.slice(1).every((d) => d.tasks.some((t) => ACUTE_WEEK1_POOL.includes(t.id))));
  assert.ok(p.weeks[1].days.some((d) => d.tasks.some((t) => PRACTICE.has(t.id))));
  assert.equal(dailyPracticeFor(1, 2, 'cbt', { acute: true }), 'exercise.breathing');
  assert.equal(dailyPracticeFor(1, 3, 'cbt', { acute: true }), 'mind.breathingSpace');
  assert.equal(dailyPracticeFor(2, 2, 'cbt', { acute: true }), dailyPracticeFor(2, 2, 'cbt'), 'normal pool from week 2');
});

test('hyperacusis arm: "find your comfortable sound" from day 1 (10 min, core), +5 min a week, hyperacusis article on w1d6, week 12 = earplugs + relapse', () => {
  const p = SIM.severeHyperacusis;
  assert.equal(p.arm, 'hyperacusisFirst');
  const d1 = tasksForDay(p, 1, 1);
  const ex = d1.find((t) => t.id === 'hyper.exposure');
  assert.ok(ex, 'w1d1 has hyper.exposure');
  assert.equal(ex!.minutes, 10);
  assert.equal(ex!.core, true);
  assert.equal(ex!.titleKey, 'unit.hyper.exposure.first');
  assert.ok(!d1.some((t) => t.id === 'sound.mixingPoint' || t.id === 'sound.enrichment'));
  assert.equal(tasksForDay(p, 2, 1).find((t) => t.id === 'hyper.exposure')!.minutes, 15);
  assert.equal(tasksForDay(p, 2, 1).find((t) => t.id === 'hyper.exposure')!.titleKey, 'unit.hyper.exposure');
  assert.equal(hyperExposureMinutes(11), 60);
  assert.equal(hyperExposureMinutes(12), 60);
  for (const week of p.weeks) for (const day of week.days) assert.ok(day.tasks.some((t) => t.id === 'hyper.exposure'), `w${week.week}d${day.day}: sound every day`);
  assert.ok(ids(p, 1, 6).includes('edu.hyperacusis'));
  assert.ok(ids(p, 2, 6).includes('edu.whatIsTinnitus'));
  assert.ok(!ids(p, 2, 7).includes('edu.hyperacusis'));
  const w12 = p.weeks[11].days.flatMap((d) => d.tasks).map((t) => t.id);
  assert.ok(w12.includes('hyper.earplugs') && w12.includes('cbt.relapse'));
  assert.ok(!w12.includes('hyper.hierarchy'));
  assert.equal(allTasks(p).filter(({ t }) => t.id === 'hyper.hierarchy').length, 2, 'hierarchy twice (weeks 3 and 6), not three times');
});

test('sound enrichment is always the last row of a day; sleep sound stays in the background block', () => {
  const p = generateProgram(profile(), prefs({ minutesPerDay: 30 }));
  for (const w of p.weeks) for (const d of w.days) {
    const list = d.tasks.map((t) => t.id);
    const bg = d.tasks.filter((t) => t.type === 'sound' && t.id !== 'sound.mixingPoint');
    if (bg.length) assert.deepEqual(list.slice(-bg.length), bg.map((t) => t.id), `w${w.week}d${d.day}`);
  }
});

test('measurement week 8 spread across days: ≤ 1 assessment a day except mood + anxiety on day 5; no practice on those days; first scale is the core', () => {
  const p = generateProgram(profile(), prefs());
  for (let d = 1; d <= 7; d++) {
    const list = tasksForDay(p, 8, d);
    const assessments = list.filter((t) => t.type === 'assessment');
    if (d === 5) assert.deepEqual(assessments.map((t) => t.id), ['assess.mood', 'assess.anxiety']);
    else assert.ok(assessments.length <= 1, `w8d${d}: ${assessments.map((t) => t.id).join(',')}`);
    if (assessments.length) {
      assert.ok(!list.some((t) => PRACTICE.has(t.id)), `w8d${d} has practice`);
      assert.equal(assessments[0].core, true, `w8d${d} first scale is core`);
      assert.equal(list.filter((t) => t.core).length, 1, `w8d${d} one core`);
    }
  }
  assert.deepEqual(ids(p, 8, 4).filter((x) => x.startsWith('assess.')), ['assess.redflagsShort']);
  assert.deepEqual(ids(p, 8, 6).filter((x) => x.startsWith('assess.')), ['assess.sleep'], 'insomnia arm sleeps on day 6');
  assert.ok(ids(p, 8, 7).includes('assess.thi'));
  assert.ok(!p.weeks.some((w) => w.days.some((d) => d.tasks.some((t) => t.id === 'assess.redflags'))), 'full red-flag screen replaced by the short re-screen');
  // Week 4: mood on day 5, THI on day 7, nothing else; the third module of week 4 moves off the mood day.
  assert.deepEqual(measurementTasksFor(4, 5, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.mood']);
  assert.deepEqual(measurementTasksFor(4, 7, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.thi']);
  assert.deepEqual(measurementTasksFor(4, 4, { acute: false, insomnia: true, totalWeeks: 12 }), []);
  assert.ok(!ids(p, 4, 5).includes('cbt.relax4'));
  assert.ok(ids(p, 4, 6).includes('cbt.relax4'), 'displaced module lands on the Saturday reading day');
  assert.equal(tasksForDay(p, 4, 6).find((t) => t.id === 'cbt.relax4')!.core, true);
  // Week 12 mirrors week 8 (no sleep scale without insomnia); 6-week programmes never reach it.
  assert.deepEqual(measurementTasksFor(12, 6, { acute: false, insomnia: false, totalWeeks: 12 }), []);
  assert.deepEqual(measurementTasksFor(12, 4, { acute: false, insomnia: false, totalWeeks: 12 }), ['assess.redflagsShort']);
  // Acute arm: once, in week 4, one scale a day (mood d5, red flags d6, THI d7).
  assert.deepEqual(measurementTasksFor(4, 5, { acute: true, insomnia: false, totalWeeks: 4 }), ['assess.mood']);
  assert.deepEqual(measurementTasksFor(4, 6, { acute: true, insomnia: false, totalWeeks: 4 }), ['assess.redflagsShort']);
  assert.deepEqual(measurementTasksFor(4, 7, { acute: true, insomnia: false, totalWeeks: 4 }), ['assess.thi']);
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
  // Light dose: only ≤ 5-minute practices, no body scan.
  for (let w = 1; w <= 12; w++) for (let d = 1; d <= 7; d++) {
    assert.ok(UNITS[dailyPracticeFor(w, d, 'cbt', { dose: 'light' })].minutes <= 5, `light w${w}d${d}`);
    assert.ok(UNITS[dailyPracticeFor(w, d, 'mindfulness', { dose: 'light' })].minutes <= 5, `light mindfulness w${w}d${d}`);
  }
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

test('gated full scales: SCI-8 on w2d2 only for insomnia without SCI; HQ-14 on w2d4 only for hyperacusis without HQ; both are core', () => {
  const ins = generateProgram(profile(), prefs());
  assert.ok(ids(ins, 2, 2).includes('assess.sleepFull'));
  assert.equal(tasksForDay(ins, 2, 2).find((t) => t.id === 'assess.sleepFull')!.core, true);
  assert.ok(!ids(ins, 2, 2).some((id) => PRACTICE.has(id)), 'measurement is the core of the day');
  assert.ok(!ids(generateProgram(profile(), prefs({ sciDone: true })), 2, 2).includes('assess.sleepFull'));
  assert.ok(!ids(generateProgram(profile({ drivers: ['distress'] }), prefs()), 2, 2).includes('assess.sleepFull'));
  const hyp = generateProgram(profile({ drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs());
  assert.equal(hyp.arm, 'hyperacusisFirst');
  assert.ok(ids(hyp, 2, 4).includes('assess.hyperFull'));
  assert.equal(tasksForDay(hyp, 2, 4).find((t) => t.id === 'assess.hyperFull')!.core, true);
  assert.ok(!ids(generateProgram(profile({ drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs({ hqDone: true })), 2, 4).includes('assess.hyperFull'));
});

test('OSA suspect (A4): sleep compression is not generated; the other CBT-I modules move up a week', () => {
  const osa = generateProgram(profile({ flags: { osaSuspect: true } }), prefs());
  const all = allTasks(osa).map(({ t }) => t.id);
  assert.ok(!all.includes('cbti.compression'));
  assert.ok(all.includes('cbti.stimulusControl') && all.includes('cbti.cognitions') && all.includes('cbti.relapse'));
  assert.ok(ids(osa, 4, 2).includes('cbti.cognitions'));
  const normal = generateProgram(profile(), prefs());
  assert.ok(ids(normal, 4, 2).includes('cbti.compression'));
});

test('regenerateProgram (A3): light dose keeps id, startDate, completed and past weeks; one module a week, ≤ 5-min practices, add-ons kept', () => {
  const now = new Date('2026-10-25T12:00:00');
  const start = new Date(now.getTime() - 20 * 86_400_000); // day index 20 → week 3, day 7
  const full = generateProgram(profile(), prefs(), start);
  full.completed = { '1-1-diary.daily': 'x', '1-1-cbt.welcome': 'x', '2-3-cbt.soundEnrichment': 'x', '3-2-diary.daily': 'x' };
  const light = regenerateProgram(full, profile(), prefs(), { dose: 'light', now });
  assert.equal(light.id, full.id);
  assert.equal(light.startDate, full.startDate);
  assert.equal(light.createdAt, full.createdAt);
  assert.deepEqual(light.completed, full.completed);
  assert.equal(light.dose, 'light');
  assert.ok(light.doseChangedAt);
  assert.equal(light.weeks.length, full.weeks.length);
  assert.deepEqual(light.weeks[0], full.weeks[0]);
  assert.deepEqual(light.weeks[1], full.weeks[1]);
  for (let w = 3; w <= 12; w++) {
    const week = light.weeks[w - 1];
    const coreModules = week.days.flatMap((d) => d.tasks).filter((t) => t.core && t.type === 'mind');
    assert.equal(coreModules.length, 1, `light w${w}: ${coreModules.map((t) => t.id).join(',')}`);
    assert.equal(coreModules[0].id, full.weeks[w - 1].days.flatMap((d) => d.tasks).filter((t) => t.core && t.type === 'mind')[0].id, `light w${w} keeps the first module`);
    for (const day of week.days) {
      const tag = `light w${w}d${day.day}`;
      // Practice units only (cbt.concentration / cbt.relax3 also exist as core modules in weeks 9 and 3).
      for (const t of day.tasks) if (PRACTICE.has(t.id) && !t.core) assert.ok(t.minutes <= 5, `${tag}: ${t.id} ${t.minutes} min`);
      const hasModuleOrAddOn = day.tasks.some((t) => (t.core && t.type === 'mind') || t.type === 'sleep' || t.type === 'education');
      if (hasModuleOrAddOn) assert.ok(!day.tasks.some((t) => PRACTICE.has(t.id) && !t.core), `${tag}: practice next to a module`);
      else assert.ok(activeMin(light, w, day.day) <= 10, `${tag}: ${activeMin(light, w, day.day)} active min`);
      assert.ok(day.tasks.filter((t) => t.core).length <= 1, `${tag}: one core`);
    }
  }
  // Add-ons kept: CBT-I modules still scheduled; measurements still scheduled.
  const lightIds = light.weeks.slice(2).flatMap((w) => w.days.flatMap((d) => d.tasks.map((t) => t.id)));
  assert.ok(lightIds.includes('cbti.stimulusControl') && lightIds.includes('cbti.relapse'));
  assert.ok(lightIds.includes('assess.thi') && lightIds.includes('assess.mood'));
  assert.ok(!lightIds.includes('sleep.diary'));
  // Back to the full dose restores the regular plan from the current week on.
  const restored = regenerateProgram(light, profile(), prefs(), { dose: 'full', now });
  assert.equal(restored.dose, 'full');
  assert.deepEqual(restored.completed, full.completed);
  assert.deepEqual(restored.weeks[3].days.map((d) => d.tasks.map((t) => t.id)), full.weeks[3].days.map((d) => d.tasks.map((t) => t.id)));
});
