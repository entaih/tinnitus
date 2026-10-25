import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACUTE_WEEK1_POOL, DAILY_PRACTICE_POOL, MODULE_DAY_ORDER, REFRESHER_SLOTS, adaptationAdvice, buildMaintenanceWeeks, dailyPracticeFor, enterMaintenance, extendMaintenance,
  generateProgram, hyperExposureMinutes, isProgramFinished, maintenanceWeekOf, measurementTasksFor, programDateOf, programPosition, refresherActive, regenerateProgram,
  startRefresher, structuredWeeksOf, tasksForDay, thiWeeksOf, type ProgramPrefs,
} from '../src/clinical/program.ts';
import { splitByBudget } from '../src/components/home/taskBudget.ts';
import { UNITS } from '../src/content/registry.ts';
import { THIS_ENABLED } from '../src/clinical/questionnaires.ts';
import type { Profile, Program, ProgramTask } from '../src/clinical/types.ts';

const profile = (over: Partial<Profile> = {}): Profile => ({
  triage: 'selfcare', triageReasons: ['triage.selfcare'], severityScore: 44, severityBand: 'moderate', severitySource: 'THI',
  subtypes: ['phenotype.chronic', 'phenotype.tonal'], phenotypes: ['chronic', 'tonal'], drivers: ['distress', 'insomnia'], recommendations: [], doctorSummary: [], ...over,
});
const prefs = (over: Partial<ProgramPrefs> = {}): ProgramPrefs => ({ minutesPerDay: 15, style: 'cbt', pitchHz: 6000, riPositive: true, hearingDone: true, ...over });
const ids = (p: Program, w: number, d: number) => tasksForDay(p, w, d).map((t) => t.id);
const PRACTICE = new Set(['exercise.pmr', 'exercise.breathing', 'mind.breathingSpace', 'cbt.relax3', 'cbt.relax5', 'cbt.relax6', 'cbt.concentration', 'mind.bodyScan']);
/** Background sound (long player presets) is not an active minute; the mixing point, the RI test and a `numbered` player step are. */
const isBackground = (t: ProgramTask) => t.type === 'sound' && t.route.startsWith('/sound/player') && !t.numbered;
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

test('day 1: mixing point (core) → welcome, no check-in task, no PMR, sound enrichment last, ≤ 14 active minutes', () => {
  const p = generateProgram(profile(), prefs());
  const d1 = tasksForDay(p, 1, 1);
  assert.deepEqual(d1.slice(0, 2).map((t) => t.id), ['sound.mixingPoint', 'cbt.welcome']);
  assert.ok(!p.weeks.some((w) => w.days.some((d) => d.tasks.some((t) => t.id === 'diary.daily'))), 'no tracking-only daily check-in task');
  assert.equal(d1[d1.length - 1].id, 'sound.enrichment');
  assert.equal(d1[0].core, true, 'the day-1 sound step is the core');
  assert.notEqual(d1[1].core, true, 'one core a day: the welcome module is optional on day 1');
  assert.ok(!ids(p, 1, 1).includes('exercise.pmr'));
  assert.ok(!ids(p, 1, 1).includes('assess.causes'));
  assert.ok(activeMin(p, 1, 1) <= 14, `active minutes ${activeMin(p, 1, 1)}`);
  // Measurements already done: PMR on day 2 (first relaxation skill), breathing on days 3/4.
  assert.ok(ids(p, 1, 2).includes('exercise.pmr'));
  // Missing measurements: pitch d2 (6 min → no practice that day), causes d3, RI d4 (sprint 3 E7), exam d5 (D3: no longer d4); w1d4 ≤ 15 min.
  const p2 = SIM.moderateInsomnia;
  assert.ok(ids(p2, 1, 2).includes('assess.pitch'));
  assert.ok(!ids(p2, 1, 2).some((id) => PRACTICE.has(id)), 'a ≥6-min assessment day carries no practice');
  assert.ok(!ids(p2, 1, 2).includes('assess.exam'));
  assert.ok(ids(p2, 1, 3).includes('assess.causes'));
  assert.ok(ids(p2, 1, 4).includes('sound.ri'));
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

test('measurement week 8: red flags d4, mood d5, THI d7 — no tracking-only anxiety/sleep re-measures; no practice on those days; the scale is the core', () => {
  const p = generateProgram(profile(), prefs());
  for (let d = 1; d <= 7; d++) {
    const list = tasksForDay(p, 8, d);
    const assessments = list.filter((t) => t.type === 'assessment');
    assert.ok(assessments.length <= 1, `w8d${d}: ${assessments.map((t) => t.id).join(',')}`);
    if (assessments.length) {
      assert.ok(!list.some((t) => PRACTICE.has(t.id)), `w8d${d} has practice`);
      assert.equal(assessments[0].core, true, `w8d${d} first scale is core`);
      assert.equal(list.filter((t) => t.core).length, 1, `w8d${d} one core`);
    }
  }
  assert.deepEqual(ids(p, 8, 4).filter((x) => x.startsWith('assess.')), ['assess.redflagsShort']);
  assert.deepEqual(ids(p, 8, 6).filter((x) => x.startsWith('assess.')), [], 'no sleep re-measure (tracking only)');
  assert.ok(!p.weeks.some((w) => w.days.some((d) => d.tasks.some((t) => t.id === 'assess.anxiety' || t.id === 'assess.sleep'))), 'no anxiety/sleep re-measures');
  assert.ok(!ids(p, 4, 7).includes('assess.thi'), 'no week-4 THI (tracking only)');
  assert.ok(ids(p, 8, 7).includes('assess.thi'));
  assert.ok(!p.weeks.some((w) => w.days.some((d) => d.tasks.some((t) => t.id === 'assess.redflags'))), 'full red-flag screen replaced by the short re-screen');
  // Week 4: mood on day 5 only (safety); the third module of week 4 moves off the mood day.
  assert.deepEqual(measurementTasksFor(4, 5, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.mood']);
  assert.deepEqual(measurementTasksFor(4, 7, { acute: false, insomnia: true, totalWeeks: 12 }), []);
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
  assert.equal(no8.length, 3, "week 8: red flags, mood, THI");
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

// ---------------------------------------------------------------------------------------------------------------------
// Sprint 3 A3: generator fixes (E2 hyperacusis day 1, E3 Sunday never a module day, E4 light dose ≤ 8 min, E7 RI on w1d4)
// ---------------------------------------------------------------------------------------------------------------------

const moduleOf = (t: ProgramTask) => (t.type === 'mind' || t.type === 'sleep') && t.route.startsWith('/mind/') && !PRACTICE.has(t.id);

test('A3-E2 hyperacusis day 1: numbered steps = check-in, "find your comfortable sound" (core, numbered) and the welcome summary', () => {
  const d1 = tasksForDay(SIM.severeHyperacusis, 1, 1);
  const ex = d1.find((t) => t.id === 'hyper.exposure')!;
  assert.equal(ex.numbered, true);
  assert.equal(ex.core, true);
  assert.ok(!isBackground(ex), 'the day-1 sound step is not a background row');
  const { shown } = splitByBudget(d1, 15);
  assert.deepEqual(shown.filter((t) => !isBackground(t)).map((t) => t.id), ['hyper.exposure', 'cbt.welcome']);
  assert.equal(d1.find((t) => t.id === 'cbt.welcome')!.params?.summary, '1', 'welcome fits the budget as its 2-minute summary');
  // From day 2 the exposure is the background row again, and it is never numbered.
  for (const week of SIM.severeHyperacusis.weeks) for (const day of week.days) {
    if (week.week === 1 && day.day === 1) continue;
    const bg = day.tasks.find((t) => t.id === 'hyper.exposure')!;
    assert.ok(isBackground(bg) && !bg.numbered, `w${week.week}d${day.day}`);
  }
});

test('A3-E3 Sunday is never a module day: no arm has w1d7 > 8 active minutes; displaced modules land on d6 then d4', () => {
  assert.deepEqual(MODULE_DAY_ORDER, [1, 3, 5, 6, 4, 2]);
  const arms: Record<string, Program> = { ...SIM, sleepFirst: generateProgram(profile({ drivers: ['distress', 'insomnia'] }), prefs()), mindfulness: generateProgram(profile(), prefs({ style: 'mindfulness' })), act: generateProgram(profile(), prefs({ style: 'act' })) };
  for (const [name, p] of Object.entries(arms)) {
    assert.ok(activeMin(p, 1, 7) <= 8, `${name} w1d7 ${activeMin(p, 1, 7)} min`);
    for (const week of p.weeks) assert.ok(!week.days[6].tasks.some(moduleOf), `${name} w${week.week}d7 carries a module: ${week.days[6].tasks.map((t) => t.id).join(',')}`);
  }
  // Week 1 of the insomnia sim: exam on d5 pushes the third module to Saturday (not Sunday).
  assert.ok(ids(SIM.moderateInsomnia, 1, 6).includes('cbt.relax1'));
  assert.ok(!ids(SIM.moderateInsomnia, 1, 7).includes('cbt.relax1'));
  // Week 8 of the insomnia sim (red flags d4, mood d5, sleep d6, THI d7): both modules land on d1/d3, none on d4–d7.
  const w8 = SIM.moderateInsomnia.weeks[7].days;
  assert.deepEqual(w8.map((d) => d.tasks.some(moduleOf)), [true, false, true, false, false, false, false]);
  // Preference once d5 and d6 are both taken: d4 before d2, never d7.
  assert.deepEqual(MODULE_DAY_ORDER.filter((d) => d !== 5 && d !== 6), [1, 3, 4, 2]);
});

test('A3-E7 residual inhibition: w1d4, core, shown in the numbered list, no practice that day', () => {
  const p = SIM.moderateInsomnia;
  const d4 = tasksForDay(p, 1, 4);
  const ri = d4.find((t) => t.id === 'sound.ri')!;
  assert.equal(ri.core, true);
  assert.ok(!ids(p, 1, 3).includes('sound.ri'));
  assert.ok(!d4.some((t) => PRACTICE.has(t.id)), 'RI day carries no practice');
  const { shown } = splitByBudget(d4, 15);
  assert.ok(shown.some((t) => t.id === 'sound.ri'), 'RI is in the shown list');
  assert.ok(!shown.some((t) => t.id === 'sound.ri' && isBackground(t)));
  assert.equal(d4.filter((t) => t.core).length, 1);
  // Already measured → no RI task anywhere.
  assert.ok(!allTasks(SIM.mild).some(({ t }) => t.id === 'sound.ri'));
});

test('A3-E4 light dose: modules are 2-minute summaries, add-on modules on even weeks only (in sequence), no day > 8 active minutes from week 2', () => {
  const now = new Date('2026-10-25T12:00:00');
  const start = new Date(now.getTime() - 7 * 86_400_000); // day index 7 → week 2 day 1
  const sims: Record<string, [Profile, ProgramPrefs]> = {
    moderateInsomnia: [profile(), prefs({ pitchHz: undefined, riPositive: undefined, causesDone: false, examDone: false })],
    severeHyperacusis: [profile({ severityBand: 'severe', severityScore: 62, drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs({ examDone: false })],
    mild: [profile({ severityBand: 'mild', severityScore: 20, drivers: [] }), prefs()],
    acute: [profile({ phenotypes: ['acute', 'tonal'], drivers: ['distress'] }), prefs()],
    hearing: [profile({ drivers: ['distress', 'hearingLoss'], phenotypes: ['chronic', 'tonal', 'hearingLossAssociated'] }), prefs()],
  };
  for (const [name, [pr, pf]] of Object.entries(sims)) {
    const light = regenerateProgram(generateProgram(pr, pf, start), pr, pf, { dose: 'light', now });
    for (const week of light.weeks.slice(1)) for (const day of week.days) {
      const tag = `${name} light w${week.week}d${day.day}`;
      assert.ok(activeMin(light, week.week, day.day) <= 8, `${tag}: ${activeMin(light, week.week, day.day)} active min (${day.tasks.map((t) => `${t.id}:${t.minutes}`).join(',')})`);
      for (const t of day.tasks) if (moduleOf(t)) { assert.equal(t.params?.summary, '1', `${tag}: ${t.id} not a summary`); assert.equal(t.minutes, 2, `${tag}: ${t.id} minutes`); }
      for (const t of day.tasks) if (PRACTICE.has(t.id) && !t.core) assert.ok(t.minutes <= 5, `${tag}: practice ${t.id} ${t.minutes} min`);
      if (week.week % 2 === 1) assert.ok(!day.tasks.some((t) => t.type === 'sleep' || t.id.startsWith('hyper.') && t.type === 'mind'), `${tag}: add-on module on an odd week`);
    }
  }
  // Add-on sequence at half pace: CBT-I education w2, stimulus control w4, compression w6, cognitions w8, wind-down w10, relapse w12.
  const ins = regenerateProgram(generateProgram(profile(), prefs(), start), profile(), prefs(), { dose: 'light', now });
  const cbti = (w: number) => ins.weeks[w - 1].days.flatMap((d) => d.tasks).filter((t) => t.type === 'sleep' && t.route.startsWith('/mind/')).map((t) => t.id);
  assert.deepEqual(cbti(2), ['cbti.education']); assert.deepEqual(cbti(3), []); assert.deepEqual(cbti(4), ['cbti.stimulusControl']);
  assert.deepEqual(cbti(6), ['cbti.compression']); assert.deepEqual(cbti(12), ['cbti.relapse']);
  // Light measurement week: anxiety moves to day 6 so day 5 stays ≤ 8 minutes.
  assert.deepEqual(measurementTasksFor(8, 5, { acute: false, insomnia: true, totalWeeks: 12, light: true }), ['assess.mood']);
  assert.deepEqual(measurementTasksFor(8, 6, { acute: false, insomnia: true, totalWeeks: 12, light: true }), []);
  assert.deepEqual(measurementTasksFor(8, 5, { acute: false, insomnia: true, totalWeeks: 12 }), ['assess.mood']);
  // Full dose is untouched: modules keep their full length.
  for (const { t } of allTasks(SIM.moderateInsomnia)) if (moduleOf(t)) assert.notEqual(t.params?.summary, '1', t.id);
});

// ---------------------------------------------------------------------------------------------------------------------
// Sprint 3 A1: programme end, maintenance mode, refresher block (E1)
// ---------------------------------------------------------------------------------------------------------------------

const at = (start: Date, dayIndex: number) => new Date(start.getTime() + dayIndex * 86_400_000 + 12 * 3_600_000);
const MILD = profile({ severityBand: 'mild', severityScore: 20, drivers: [] });

test('A1 6-week programme: finished on day 43 (index 42), not before; enterMaintenance → week 7 day 1, goal 3, THI on week 10 Sunday', () => {
  const start = new Date('2026-09-13T00:00:00');
  const p = generateProgram(MILD, prefs(), start);
  assert.equal(p.weeks.length, 6);
  assert.equal(isProgramFinished(p, at(start, 41)), false);
  assert.equal(isProgramFinished(p, at(start, 42)), true);
  assert.deepEqual(programPosition(p, at(start, 42)), { week: 6, day: 7, dayIndex: 41 }, 'before maintenance the position clamps to the last day');
  const m = enterMaintenance(p, MILD, prefs(), at(start, 42));
  assert.equal(m.phase, 'maintenance');
  assert.equal(m.weeklyGoal, 3);
  assert.equal(m.maintenanceStartDate, programDateOf(p.startDate, 42));
  assert.equal(m.maintenanceStartDate, '2026-10-25');
  assert.equal(m.weeks.length, 10);
  assert.equal(structuredWeeksOf(m), 6);
  assert.equal(isProgramFinished(m, at(start, 42)), false);
  assert.deepEqual(programPosition(m, at(start, 42)), { week: 7, day: 1, dayIndex: 42 });
  assert.equal(maintenanceWeekOf(m, 7), 1);
  assert.equal(maintenanceWeekOf(m, 10), 4);
  assert.deepEqual(m.weeks.slice(0, 6), p.weeks, 'structured weeks untouched');
  assert.equal(m.completed, p.completed);
  // Week 10 Sunday: THI (core) before the weekly card; weeks 7–9 have no THI; every day check-in + optional practice + 30-min sound.
  const d7 = tasksForDay(m, 10, 7).map((t) => t.id);
  assert.ok(d7.includes('assess.thi') && d7.includes('review.weekly'));
  assert.ok(d7.indexOf('assess.thi') < d7.indexOf('review.weekly'));
  assert.equal(tasksForDay(m, 10, 7).find((t) => t.id === 'assess.thi')!.core, true);
  assert.deepEqual(thiWeeksOf(m), [10]);
  for (let w = 7; w <= 10; w++) for (let d = 1; d <= 7; d++) {
    const tasks = tasksForDay(m, w, d);
    assert.ok(!tasks.some((t) => t.id === 'diary.daily'), `w${w}d${d} no check-in task`);
    assert.ok(tasks.filter((t) => t.core).length <= 1, `w${w}d${d} one core`);
    assert.ok(!tasks.some(moduleOf), `w${w}d${d}: no module outside a refresher`);
    const sound = tasks.find((t) => t.id === 'sound.enrichment');
    assert.ok(sound && sound.minutes === 30 && isBackground(sound), `w${w}d${d} background sound 30 min`);
    if (!(w === 10 && d === 7)) assert.ok(tasks.some((t) => PRACTICE.has(t.id) && !t.core), `w${w}d${d} optional practice`);
    if (d === 7) assert.ok(tasks.some((t) => t.id === 'review.weekly'));
    if (w < 10 || d < 7) assert.ok(!tasks.some((t) => t.id === 'assess.thi'), `w${w}d${d} no THI`);
  }
  assert.equal(m.weeks[6].themeKey, 'program.theme.maintenance');
  // Idempotent: entering again does not append another block before the last week.
  assert.equal(enterMaintenance(m, MILD, prefs(), at(start, 45)).weeks.length, 10);
});

test('A1 ensureMaintenance/extendMaintenance: a new 4-week block on the last week (THI cadence continues), nothing earlier; safety re-screen every 12th week', () => {
  const start = new Date('2026-09-13T00:00:00');
  const m = enterMaintenance(generateProgram(MILD, prefs(), start), MILD, prefs(), at(start, 42));
  assert.equal(extendMaintenance(m, MILD, prefs(), at(start, 50)), m, 'same object while not on the last week');
  const ext = extendMaintenance(m, MILD, prefs(), at(start, 63)); // week 10 = last generated week
  assert.equal(ext.weeks.length, 14);
  assert.deepEqual(thiWeeksOf(ext), [10, 14], 'every 4th maintenance Sunday');
  assert.deepEqual(programPosition(ext, at(start, 63)), { week: 10, day: 1, dayIndex: 63 });
  // Far past the end (no Home open for weeks): enough blocks are appended so the position never clamps.
  const far = extendMaintenance(m, MILD, prefs(), at(start, 42 + 70));
  assert.ok(far.weeks.length > 16);
  assert.deepEqual(programPosition(far, at(start, 112)), { week: 17, day: 1, dayIndex: 112 });
  // Red-flag re-screen on the Wednesday of maintenance week 12 (core on that day).
  const block = buildMaintenanceWeeks(MILD, prefs(), 4, { from: 8, weekStart: 15 });
  assert.equal(block[3].week, 18);
  assert.ok(block[3].days[3].tasks.some((t) => t.id === 'assess.redflagsShort' && t.core));
  assert.ok(!block[2].days[3].tasks.some((t) => t.id === 'assess.redflagsShort'));
  assert.ok(block[3].days[6].tasks.some((t) => t.id === 'assess.thi'), 'maintenance week 12 is also a THI week');
});

test('A1 refresher: THI 30 → 45 in maintenance → adapt.refresher; startRefresher rebuilds the next two weeks with 3 core modules and sets refresherUntil', () => {
  const start = new Date('2026-09-13T00:00:00');
  const m = enterMaintenance(generateProgram(MILD, prefs(), start), MILD, prefs(), at(start, 42));
  const now = at(start, 69); // week 10 day 7: the maintenance THI Sunday
  assert.deepEqual(adaptationAdvice(m, { week: 10, thiBaseline: 30, thiNow: 45, adherence14: 0.4, phase: 'maintenance' }), ['adapt.refresher']);
  assert.deepEqual(adaptationAdvice(m, { week: 10, thiBaseline: 30, thiNow: 42, adherence14: 0.4 }), ['adapt.maintenanceSteady'], 'phase read from the programme; +12 is not enough; no week-based lines in maintenance');
  assert.deepEqual(adaptationAdvice(m, { week: 10, thiBaseline: 45, thiNow: 30, adherence14: 1 }), ['adapt.maintenanceImproving']);
  assert.deepEqual(adaptationAdvice(m, { week: 10, thiBaseline: 30, thiNow: 45, adherence14: 1, phqItem9: 1 }), ['adapt.safety', 'adapt.refresher']);
  assert.ok(!adaptationAdvice(generateProgram(profile(), prefs()), { week: 8, thiBaseline: 30, thiNow: 45, adherence14: 1 }).includes('adapt.refresher'), 'never in the active phase');
  const r = startRefresher(m, MILD, prefs(), now);
  assert.equal(refresherActive(m, now), false);
  assert.equal(refresherActive(r, now), true);
  assert.equal(r.refresherUntil, programDateOf(r.startDate, 12 * 7 - 1));
  assert.equal(refresherActive(r, at(start, 12 * 7 - 1)), true);
  assert.equal(refresherActive(r, at(start, 12 * 7)), false);
  assert.ok(r.weeks.length >= 12);
  const cores = [11, 12].flatMap((w) => r.weeks[w - 1].days.flatMap((d) => d.tasks.filter((t) => t.core && moduleOf(t)).map((t) => `${w}-${d.day}-${t.id}`)));
  assert.deepEqual(cores, ['11-1-cbt.restructuring', '11-5-cbt.exposure', '12-3-cbt.relapse']);
  assert.deepEqual(REFRESHER_SLOTS, [[1, 1], [1, 5], [2, 3]]);
  assert.equal(r.weeks[10].themeKey, 'program.theme.refresher');
  assert.equal(r.weeks[12].themeKey, 'program.theme.maintenance');
  for (const w of [11, 12]) for (const d of r.weeks[w - 1].days) assert.ok(d.tasks.some((t) => PRACTICE.has(t.id)), `refresher w${w}d${d.day} daily practice`);
  assert.ok(!r.weeks.slice(6, 10).some((w) => w.days.some((d) => d.tasks.some(moduleOf))), 'maintenance weeks before the block untouched');
  assert.deepEqual(thiWeeksOf(r), [10, 14], 'the 4-weekly THI cadence is unchanged by the refresher');
  // Hyperacusis arm: hyper.hierarchy replaces cbt.exposure; the background sound stays the graded exposure.
  const HYPER = profile({ severityBand: 'severe', drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] });
  const hb = buildMaintenanceWeeks(HYPER, prefs(), 2, { refresher: true });
  const hm = hb.flatMap((w) => w.days.flatMap((d) => d.tasks)).filter((t) => t.core && moduleOf(t)).map((t) => t.id);
  assert.deepEqual(hm, ['cbt.restructuring', 'hyper.hierarchy', 'cbt.relapse']);
  assert.ok(hb[0].days[0].tasks.some((t) => t.id === 'hyper.exposure' && t.minutes === 30 && isBackground(t)));
  assert.ok(!hb[0].days[0].tasks.some((t) => t.id === 'sound.enrichment'));
  // Refresher week 1 skips a THI Sunday (the reminder rules skip Sundays before refresherUntil); week 2 keeps it.
  const skip = buildMaintenanceWeeks(MILD, prefs(), 2, { refresher: true, from: 3 });
  assert.ok(!skip[0].days[6].tasks.some((t) => t.id === 'assess.thi'));
  const keep = buildMaintenanceWeeks(MILD, prefs(), 2, { refresher: true, from: 2 });
  assert.ok(keep[1].days[6].tasks.some((t) => t.id === 'assess.thi'));
  assert.equal(startRefresher(generateProgram(MILD, prefs(), start), MILD, prefs(), now).refresherUntil, undefined, 'no-op outside maintenance');
});

test('A4 THI-S: not scheduled while the item table is unverified (THIS_ENABLED=false)', () => {
  assert.equal(THIS_ENABLED, false);
  for (const [name, p] of Object.entries(SIM)) assert.ok(!allTasks(p).some(({ t }) => t.id === 'assess.thiShort'), name);
});
