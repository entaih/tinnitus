import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_ACTIVE_STEPS, SUMMARY_MINUTES, asSummary, coreTask, isBackground, isEssential, isModuleTask, splitByBudget, taskQuery } from '../src/components/home/taskBudget.ts';
import { generateProgram, tasksForDay, type ProgramPrefs } from '../src/clinical/program.ts';
import type { Profile, ProgramTask } from '../src/clinical/types.ts';

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
