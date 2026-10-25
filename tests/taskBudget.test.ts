import test from 'node:test';
import assert from 'node:assert/strict';
import { MAINTENANCE_GOAL_DAYS, MAX_ACTIVE_STEPS, SUMMARY_MINUTES, WEEKLY_GOAL_DAYS, asSummary, coreTask, isBackground, isEssential, isModuleTask, isSummaryTask, maintenanceWeek, programFinished, refresherActive, splitByBudget, structuredWeeks, taskQuery, totalActiveDays, weeklyGoalOf } from '../src/components/home/taskBudget.ts';
import { generateProgram, tasksForDay, type ProgramPrefs } from '../src/clinical/program.ts';
import type { Profile, Program, ProgramTask } from '../src/clinical/types.ts';

// PM sprint 2 §B1 (defects D1, D2): the weekly card and the week's module are never pushed behind "Daha fazla".

const task = (id: string, type: ProgramTask['type'], minutes: number, over: Partial<ProgramTask> = {}): ProgramTask => ({
  id, type, minutes, titleKey: `unit.${id}`,
  route: id.startsWith('sound.enrichment') || id === 'sleep.sound' ? '/sound/player?preset=x' : type === 'mind' || type === 'sleep' ? `/mind/${id}` : `/${id}`,
  ...over,
});
const ids = (xs: ProgramTask[]) => xs.map((x) => x.id);
const numbered = (xs: ProgramTask[]) => xs.filter((x) => !isBackground(x));

test('B1 acceptance: diary + 15-min core module + 5-min practice + weekly card at 15 min → core and card shown, practice in more', () => {
  const day = [task('diary.daily', 'diary', 1), task('cbt.restructuring', 'mind', 15, { core: true }), task('exercise.breathing', 'exercise', 5), task('review.weekly', 'review', 1)];
  const { shown, more } = splitByBudget(day, 15);
  assert.deepEqual(ids(shown), ['diary.daily', 'cbt.restructuring', 'review.weekly']);
  assert.deepEqual(ids(more), ['exercise.breathing']);
});

test('B1 acceptance: diary + PMR + legacy sleep diary + weekly card → all four shown', () => {
  const day = [task('diary.daily', 'diary', 1), task('exercise.pmr', 'exercise', 12), task('sleep.diary', 'diary', 1), task('review.weekly', 'review', 1)];
  const { shown, more } = splitByBudget(day, 15);
  assert.deepEqual(ids(shown), ['diary.daily', 'exercise.pmr', 'sleep.diary', 'review.weekly']);
  assert.equal(more.length, 0);
});

test('core flag: the first core is shown whatever the budget; optional steps respect cap and budget; essentials never blocked', () => {
  const day = [
    task('diary.daily', 'diary', 1), task('exercise.breathing', 'exercise', 5), task('cbt.relax1', 'mind', 15, { core: true }),
    task('mind.breathingSpace', 'mind', 5), task('edu.sleep', 'education', 5), task('assess.thi', 'assessment', 5), task('review.weekly', 'review', 1),
    task('sound.enrichment', 'sound', 60),
  ];
  const { shown, more } = splitByBudget(day, 15);
  // breathing fits (6 ≤ 15) and is the one optional step; relax1 is core; the rest of the optionals overflow; essentials stay.
  assert.deepEqual(ids(shown), ['diary.daily', 'exercise.breathing', 'cbt.relax1', 'assess.thi', 'review.weekly', 'sound.enrichment']);
  assert.deepEqual(ids(more), ['mind.breathingSpace', 'edu.sleep']);
  assert.equal(coreTask(day)?.id, 'cbt.relax1');
});

test('old programmes without the core flag: the first module/sleep/education task is the core', () => {
  const day = [task('diary.daily', 'diary', 1), task('exercise.pmr', 'exercise', 12), task('cbt.relax1', 'mind', 15), task('review.weekly', 'review', 1)];
  assert.equal(coreTask(day)?.id, 'cbt.relax1');
  const { shown } = splitByBudget(day, 15);
  assert.deepEqual(ids(shown), ['diary.daily', 'exercise.pmr', 'cbt.relax1', 'review.weekly']);
  // No module at all → no core; the first optional is still shown even over budget (the day is never empty).
  assert.equal(coreTask([task('diary.daily', 'diary', 1), task('exercise.pmr', 'exercise', 12)]), null);
  assert.deepEqual(ids(splitByBudget([task('big', 'exercise', 20)], 15).shown), ['big']);
  // A core flagged background sound (hyperacusis day 1) is the core but is listed as background.
  const hyper = [task('diary.daily', 'diary', 1), task('hyper.exposure', 'sound', 10, { route: '/sound/player?preset=hyperacusis', core: true }), task('cbt.welcome', 'mind', 8)];
  assert.equal(coreTask(hyper)?.id, 'hyper.exposure');
  assert.ok(isBackground(coreTask(hyper)!));
  assert.deepEqual(ids(splitByBudget(hyper, 15).shown), ['diary.daily', 'hyper.exposure', 'cbt.welcome']);
});

test('short mode: check-in + the core module as a 2-minute summary (params.summary = 1, same id); measurement day keeps the scale', () => {
  const day = [task('diary.daily', 'diary', 1), task('cbt.restructuring', 'mind', 15, { core: true }), task('exercise.breathing', 'exercise', 5), task('review.weekly', 'review', 1)];
  const { shown, more } = splitByBudget(day, 15, true);
  assert.deepEqual(ids(shown), ['diary.daily', 'cbt.restructuring', 'review.weekly']);
  const core = shown[1];
  assert.equal(core.minutes, SUMMARY_MINUTES);
  assert.equal(core.params?.summary, '1');
  assert.deepEqual(ids(more), ['exercise.breathing']);
  assert.ok(isModuleTask(core));
  // The query carries the view param and the task key.
  assert.equal(taskQuery(core, '5-1-cbt.restructuring'), 'summary=1&taskKey=5-1-cbt.restructuring');
  assert.equal(taskQuery(task('x', 'exercise', 5), '1-1-x'), 'taskKey=1-1-x');
  // Measurement day: no summary, the scale replaces the extra step.
  const measure = [task('diary.daily', 'diary', 1), task('assess.thi', 'assessment', 5), task('cbt.toolbox', 'mind', 6, { core: true })];
  assert.deepEqual(ids(splitByBudget(measure, 15, true).shown), ['diary.daily', 'assess.thi']);
  // No module → the shortest other task.
  const noModule = [task('diary.daily', 'diary', 1), task('exercise.pmr', 'exercise', 12), task('exercise.breathing', 'exercise', 5)];
  assert.deepEqual(ids(splitByBudget(noModule, 15, true).shown), ['diary.daily', 'exercise.breathing']);
  assert.equal(asSummary(task('cbt.welcome', 'mind', 8)).minutes, SUMMARY_MINUTES);
});

// --- simulation with the real generator (read-only import) --------------------------------------------------

const profile = (over: Partial<Profile> = {}): Profile => ({
  triage: 'selfcare', triageReasons: ['triage.selfcare'], severityScore: 44, severityBand: 'moderate', severitySource: 'THI',
  subtypes: ['phenotype.chronic', 'phenotype.tonal'], phenotypes: ['chronic', 'tonal'], drivers: ['distress', 'insomnia'], recommendations: [], doctorSummary: [], ...over,
});
const prefs = (over: Partial<ProgramPrefs> = {}): ProgramPrefs => ({ minutesPerDay: 15, style: 'cbt', pitchHz: 6000, riPositive: true, hearingDone: true, ...over });
const USERS: [string, Profile, ProgramPrefs][] = [
  ['moderate/insomnia', profile(), prefs()],
  ['severe/hyperacusis', profile({ severityBand: 'severe', severityScore: 70, drivers: ['distress', 'hyperacusis'], phenotypes: ['chronic', 'hyperacusis'] }), prefs({ riPositive: false })],
  ['mild', profile({ severityBand: 'mild', severityScore: 20, drivers: ['distress'] }), prefs()],
  ['acute', profile({ phenotypes: ['acute', 'tonal'], drivers: ['distress'] }), prefs()],
  ['30 min / act', profile(), prefs({ minutesPerDay: 30, style: 'act' })],
  ['mindfulness', profile({ drivers: ['distress', 'somatic'], phenotypes: ['chronic', 'somatosensory'] }), prefs({ style: 'mindfulness', pitchHz: undefined, riPositive: undefined, causesDone: false, examDone: false })],
];

test('simulation: no Sunday hides review.weekly; the core is always shown; at most one optional step beside the core', () => {
  for (const [name, pr, pf] of USERS) {
    const p = generateProgram(pr, pf);
    for (const w of p.weeks) for (const d of w.days) {
      const tasks = tasksForDay(p, w.week, d.day);
      const { shown, more } = splitByBudget(tasks, pf.minutesPerDay);
      const label = `${name} w${w.week}d${d.day}`;
      if (d.day === 7) {
        assert.ok(shown.some((x) => x.id === 'review.weekly'), `${label}: review.weekly hidden`);
        assert.ok(!more.some((x) => x.id === 'review.weekly'), `${label}: review.weekly in more`);
      }
      const core = coreTask(tasks);
      if (core) assert.ok(shown.some((x) => x.id === core.id), `${label}: core ${core.id} hidden`);
      for (const x of more) assert.ok(!isEssential(x), `${label}: essential ${x.id} in more`);
      const optional = numbered(shown).filter((x) => !isEssential(x) && x.id !== core?.id);
      assert.ok(optional.length <= MAX_ACTIVE_STEPS - 1, `${label}: ${optional.length} optional steps (${ids(optional).join(',')})`);
      assert.ok(numbered(shown).length <= MAX_ACTIVE_STEPS + 2, `${label}: ${numbered(shown).length} numbered steps (${ids(numbered(shown)).join(',')})`);
    }
  }
});

// --- Sprint 3 (PM §B2): numbered sound steps, summary label, programme end and maintenance helpers ----------------

test('B2: a player task flagged numbered is a numbered step, not a background row (hyperacusis day 1)', () => {
  const bg = task('hyper.exposure', 'sound', 10, { route: '/sound/player?preset=hyper' });
  const numberedStep = task('hyper.exposure', 'sound', 10, { route: '/sound/player?preset=hyper', numbered: true, core: true });
  assert.ok(isBackground(bg));
  assert.ok(!isBackground(numberedStep));
  const day = [task('diary.daily', 'diary', 1), task('cbt.welcome', 'mind', 5), numberedStep];
  const { shown } = splitByBudget(day, 15);
  assert.deepEqual(ids(numbered(shown)), ['diary.daily', 'cbt.welcome', 'hyper.exposure']);
  assert.equal(coreTask(day)?.id, 'hyper.exposure');
  // Mixing point / RI stay numbered as before (not on the player route).
  assert.ok(!isBackground(task('sound.ri', 'sound', 3, { route: '/assess/ri' })));
});

test('B2: light-dose summary tasks are recognised by params.summary', () => {
  assert.ok(isSummaryTask({ params: { summary: '1' } }));
  assert.ok(!isSummaryTask({ params: {} }));
  assert.ok(!isSummaryTask({}));
  assert.ok(isSummaryTask(asSummary(task('cbt.restructuring', 'mind', 16))));
});

const weeks = (n: number) => Array.from({ length: n }, (_, i) => ({ week: i + 1, themeKey: 'w', rationaleKeys: [], days: Array.from({ length: 7 }, (_, d) => ({ day: d + 1, tasks: [] as ProgramTask[] })) }));
const prog = (over: Partial<Program> = {}): Program => ({ id: 'p', createdAt: '2026-09-01T00:00:00.000Z', startDate: '2026-09-01', arm: 'soundCbt', completed: {}, weeks: weeks(6), ...over });

test('B2: a 6-week programme is finished on day 43, not on day 42, and never once in maintenance', () => {
  assert.ok(!programFinished(prog(), new Date('2026-10-12T12:00:00')), 'day 42 = w6d7');
  assert.ok(programFinished(prog(), new Date('2026-10-13T12:00:00')), 'day 43');
  assert.ok(!programFinished(prog({ phase: 'maintenance', maintenanceStartDate: '2026-10-13', weeks: weeks(10) }), new Date('2026-10-13T12:00:00')));
});

test('B2: weekly goal, maintenance week and refresher helpers', () => {
  assert.equal(weeklyGoalOf(null), WEEKLY_GOAL_DAYS);
  assert.equal(weeklyGoalOf(prog()), WEEKLY_GOAL_DAYS);
  assert.equal(weeklyGoalOf(prog({ phase: 'maintenance' })), MAINTENANCE_GOAL_DAYS);
  assert.equal(weeklyGoalOf(prog({ weeklyGoal: 4 })), 4);
  const m = prog({ phase: 'maintenance', maintenanceStartDate: '2026-10-13', weeks: weeks(10) });
  assert.equal(structuredWeeks(m), 6);
  assert.equal(maintenanceWeek(m, { week: 7 }), 1);
  assert.equal(maintenanceWeek(prog(), { week: 3 }), 0);
  assert.equal(totalActiveDays(prog({ completed: { '1-1-a': '2026-09-01T10:00:00.000Z', '1-1-b': '2026-09-01T12:00:00.000Z', '1-3-a': '2026-09-03T10:00:00.000Z' } })), 2);
  assert.ok(refresherActive({ refresherUntil: '2026-10-20' }, new Date('2026-10-20T08:00:00')));
  assert.ok(!refresherActive({ refresherUntil: '2026-10-20' }, new Date('2026-10-21T08:00:00')));
  assert.ok(!refresherActive(prog()));
});
