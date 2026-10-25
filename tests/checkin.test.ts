import test from 'node:test';
import assert from 'node:assert/strict';
import { averageBetween, buildCheckinEntry, formatAvg, last7Days, lastEntryBefore, needsSleepRow, programWeekWindow, shiftDate, weekCompare } from '../src/components/home/checkinStats.ts';
import { INSIGHTS, insightForDay, insightsAreCited } from '../src/content/insights.ts';
import { splitByBudget, planForToday, tomorrowTask, isBackground, MAX_ACTIVE_STEPS } from '../src/components/home/taskBudget.ts';
import type { DiaryEntry, Program, ProgramTask } from '../src/clinical/types.ts';

const e = (date: string, annoyance: number, loudness = annoyance): DiaryEntry => ({ date, annoyance, loudness, mood: 1 });

// --- check-in statistics ---------------------------------------------------------------------------

test('shiftDate moves across month boundaries', () => {
  assert.equal(shiftDate('2026-10-01', -1), '2026-09-30');
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftDate('2026-03-29', -1), '2026-03-28');
});

test('last7Days: oldest first, nulls for missing days, today last', () => {
  const diary = [e('2026-10-20', 4), e('2026-10-24', 7), e('2026-10-10', 9)];
  const days = last7Days(diary, '2026-10-24');
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-10-18');
  assert.equal(days[6].date, '2026-10-24');
  assert.deepEqual(days.map((d) => d.value), [null, null, 4, null, null, null, 7]);
  assert.deepEqual(last7Days(diary, '2026-10-24', 'loudness').map((d) => d.value), [null, null, 4, null, null, null, 7]);
  // Entries without loudness (one-tap check-in) are skipped by the loudness series, kept by the annoyance series.
  const noLoud: DiaryEntry[] = [{ date: '2026-10-23', annoyance: 5, mood: 1 }, { date: '2026-10-24', annoyance: 6, loudness: 2, mood: 1 }];
  assert.deepEqual(last7Days(noLoud, '2026-10-24', 'loudness').map((d) => d.value).slice(-2), [null, 2]);
  assert.deepEqual(last7Days(noLoud, '2026-10-24').map((d) => d.value).slice(-2), [5, 6]);
  assert.equal(averageBetween(noLoud, '2026-10-18', '2026-10-24', 'loudness'), 2);
});

// --- B2: one-tap check-in writes only the row that was used ------------------------------------------------------

test('buildCheckinEntry: first tap writes annoyance only — loudness stays undefined until its row is used', () => {
  const first = buildCheckinEntry(undefined, '2026-10-24', 'annoyance', 6);
  assert.equal(first.annoyance, 6);
  assert.equal(first.loudness, undefined);
  assert.equal(first.sleepQuality, undefined);
  assert.equal(first.mood, 1);
  assert.ok(!('loudness' in first) || first.loudness === undefined);
  const withLoud = buildCheckinEntry(first, '2026-10-24', 'loudness', 3);
  assert.equal(withLoud.annoyance, 6);
  assert.equal(withLoud.loudness, 3);
  const withSleep = buildCheckinEntry(withLoud, '2026-10-24', 'sleep', 7);
  assert.equal(withSleep.sleepQuality, 7);
  assert.equal(withSleep.loudness, 3);
  // Re-tapping annoyance keeps the other rows.
  const again = buildCheckinEntry(withSleep, '2026-10-24', 'annoyance', 2);
  assert.deepEqual([again.annoyance, again.loudness, again.sleepQuality], [2, 3, 7]);
});

test('needsSleepRow: sleepFirst arm, or a day with the sleep sound / legacy sleep diary', () => {
  assert.equal(needsSleepRow('sleepFirst', []), true);
  assert.equal(needsSleepRow('soundCbt', []), false);
  assert.equal(needsSleepRow('soundCbt', [{ id: 'sleep.sound' }]), true);
  assert.equal(needsSleepRow('cbtFirst', [{ id: 'sleep.diary' }]), true);
  assert.equal(needsSleepRow(undefined, [{ id: 'diary.daily' }]), false);
});

// --- B4: programme-week window for the Sunday card ----------------------------------------------------------------

test('weekCompare with a programme-week window: cur over day 1 … today, prev over the 7 days before day 1', () => {
  const diary = [
    e('2026-10-11', 8), e('2026-10-13', 6),                       // 7 days before the programme week
    e('2026-10-19', 5), e('2026-10-20', 4), e('2026-10-25', 3),   // programme week 1 (starts Monday 10-19)
    e('2026-10-18', 9),                                           // the Sunday before: inside the calendar window, outside the programme week
  ];
  const win = programWeekWindow('2026-10-19', { week: 1, day: 7 });
  assert.deepEqual(win, { from: '2026-10-19', to: '2026-10-25' });
  assert.deepEqual(programWeekWindow('2026-10-19', { week: 3, day: 2 }), { from: '2026-11-02', to: '2026-11-03' });
  const c = weekCompare(diary, '2026-10-25', 'annoyance', win);
  assert.equal(c.cur, 4);
  assert.equal(c.prev, 7.5); // 10-13 (6) and 10-18 (9); 10-11 is outside the 7 days before day 1
  assert.equal(c.daysLogged, 3);
  assert.deepEqual(c.window, win);
  // Calendar default is unchanged: the last 7 days ending today, "last week" the 7 before (which include 10-18).
  const cal = weekCompare(diary, '2026-10-25');
  assert.equal(cal.cur, 4);
  assert.equal(cal.prev, 7.5);
  assert.deepEqual(cal.window, { from: '2026-10-19', to: '2026-10-25' });
  const shifted = weekCompare(diary, '2026-10-24');
  assert.deepEqual(shifted.window, { from: '2026-10-18', to: '2026-10-24' });
  assert.equal(shifted.cur, 6);
});

test('weekCompare: this week vs last week, one-decimal rounding, first-week case', () => {
  const diary = [
    e('2026-10-11', 8), e('2026-10-13', 6),              // last week (10-11 … 10-17)
    e('2026-10-18', 5), e('2026-10-20', 4), e('2026-10-24', 3), // this week (10-18 … 10-24)
  ];
  const c = weekCompare(diary, '2026-10-24');
  assert.equal(c.cur, 4);
  assert.equal(c.prev, 7);
  assert.equal(c.delta, -3);
  assert.equal(c.daysLogged, 3);
  const first = weekCompare([e('2026-10-24', 5), e('2026-10-23', 6)], '2026-10-24');
  assert.equal(first.cur, 5.5);
  assert.equal(first.prev, null);
  assert.equal(first.delta, null);
  assert.equal(averageBetween([], '2026-10-01', '2026-10-07'), null);
  const empty = weekCompare([], '2026-10-24');
  assert.equal(empty.cur, null);
  assert.equal(empty.daysLogged, 0);
});

test('lastEntryBefore and formatAvg', () => {
  const diary = [e('2026-10-01', 2), e('2026-10-20', 6), e('2026-10-30', 9)];
  assert.equal(lastEntryBefore(diary, '2026-10-24')?.date, '2026-10-20');
  assert.equal(lastEntryBefore([], '2026-10-24'), null);
  assert.equal(formatAvg(4.25, 'tr'), '4,3');
  assert.equal(formatAvg(4.25, 'en'), '4.3');
  assert.equal(formatAvg(null, 'tr'), '–');
});

// --- insights ----------------------------------------------------------------------------------------

test('insights: 24 cited notes, ≤160 chars, honest wording, no repeat on 24 consecutive days', () => {
  assert.equal(INSIGHTS.length, 24);
  assert.ok(insightsAreCited());
  for (const i of INSIGHTS) {
    assert.ok(i.tr.length <= 160, `${i.id} tr too long (${i.tr.length})`);
    assert.ok(i.en.length <= 160, `${i.id} en too long (${i.en.length})`);
    assert.ok(!/\btedavi eder\b|\bgeçirir\b|\bcures\b/i.test(i.tr + ' ' + i.en), `${i.id} claims a cure`);
  }
  assert.equal(new Set(INSIGHTS.map((i) => i.id)).size, 24);
  const seen = new Set<string>();
  for (let d = 0; d < 24; d++) seen.add(insightForDay('prog-abc', d).id);
  assert.equal(seen.size, 24);
  assert.notEqual(insightForDay('prog-abc', 0).id, insightForDay('prog-abc', 1).id);
});

// --- budget split ---------------------------------------------------------------------------------------

const task = (id: string, type: ProgramTask['type'], minutes: number): ProgramTask => ({ id, type, minutes, titleKey: `unit.${id}`, route: id === 'sound.enrichment' ? '/sound/player?preset=enrichment' : type === 'mind' ? `/mind/${id}` : `/${id}` });
const day1 = [task('diary.daily', 'diary', 1), task('sound.mixingPoint', 'sound', 5), task('cbt.welcome', 'mind', 8), task('exercise.pmr', 'exercise', 12), task('assess.causes', 'assessment', 2), task('sound.enrichment', 'sound', 120)];

test('splitByBudget: essentials always shown (assessment beyond the cap too), the welcome module is the core, overflow behind more', () => {
  const { shown, more } = splitByBudget(day1, 15);
  const numbered = shown.filter((x) => !isBackground(x));
  // diary (essential) + mixing point (optional, fits) + welcome (core, first module) + causes (essential measurement); PMR overflows.
  assert.deepEqual(numbered.map((x) => x.id), ['diary.daily', 'sound.mixingPoint', 'cbt.welcome', 'assess.causes']);
  assert.ok(shown.some((x) => x.id === 'sound.enrichment') && shown.some((x) => x.id === 'sound.mixingPoint'));
  assert.deepEqual(more.map((x) => x.id), ['exercise.pmr']);
  // A day of nothing but essentials shows them all (measurements are never hidden); optionals are then capped out.
  const many = [task('diary.daily', 'diary', 1), task('a', 'assessment', 3), task('b', 'assessment', 3), task('c', 'assessment', 3), task('x', 'exercise', 3)];
  assert.deepEqual(splitByBudget(many, 15).shown.map((x) => x.id), ['diary.daily', 'a', 'b', 'c']);
  assert.ok(splitByBudget(many, 15).shown.filter((x) => !isBackground(x)).length <= MAX_ACTIVE_STEPS + 1);
  // The first non-essential step is shown even when it exceeds the budget (the day is never empty).
  assert.deepEqual(splitByBudget([task('big', 'mind', 20)], 15).shown.map((x) => x.id), ['big']);
});

test('splitByBudget short mode: check-in + shortest practice; measurement kept instead of a practice', () => {
  const s = splitByBudget(day1, 15, true);
  const numbered = s.shown.filter((x) => !isBackground(x)).map((x) => x.id);
  assert.deepEqual(numbered, ['diary.daily', 'assess.causes']);
  // On a module day the core module is kept as its 2-minute summary instead of the shortest practice (sprint 2 §B3).
  const noAssess = splitByBudget([task('diary.daily', 'diary', 1), task('cbt.welcome', 'mind', 8), task('exercise.breathing', 'exercise', 3), task('sound.enrichment', 'sound', 120)], 15, true);
  assert.deepEqual(noAssess.shown.map((x) => x.id), ['diary.daily', 'cbt.welcome', 'sound.enrichment']);
  assert.equal(noAssess.shown[1].minutes, 2);
  assert.equal(noAssess.shown[1].params?.summary, '1');
  assert.ok(noAssess.shown.filter((x) => !isBackground(x)).length <= 2);
  const noModule = splitByBudget([task('diary.daily', 'diary', 1), task('exercise.pmr', 'exercise', 12), task('exercise.breathing', 'exercise', 3)], 15, true);
  assert.deepEqual(noModule.shown.map((x) => x.id), ['diary.daily', 'exercise.breathing']);
});

const program: Program = {
  id: 'p1', createdAt: '2026-10-19T00:00:00.000Z', startDate: '2026-10-19', arm: 'soundCbt', completed: {},
  weeks: [
    { week: 1, themeKey: 'w1', rationaleKeys: [], days: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, tasks: i === 0 ? day1 : [task('diary.daily', 'diary', 1), task('exercise.breathing', 'exercise', 5), task('sound.enrichment', 'sound', 120)] })) },
    { week: 2, themeKey: 'w2', rationaleKeys: [], days: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, tasks: [task('diary.daily', 'diary', 1), task('cbt.thoughts', 'mind', 8)] })) },
  ],
};

test('planForToday: short option, tomorrow task skips check-in and sound, nothing after the last day', () => {
  const full = planForToday(program, { week: 1, day: 1, dayIndex: 0 });
  assert.equal(full.short, false);
  assert.equal(full.shown.filter((x) => !isBackground(x)).length, 4); // diary, mixing point, welcome (core), causes (measurement)
  const short = planForToday(program, { week: 1, day: 1, dayIndex: 0 }, undefined, { short: true });
  assert.equal(short.short, true);
  assert.ok(short.shown.filter((x) => !isBackground(x)).length <= 2);
  assert.equal(tomorrowTask(program, { week: 1, day: 1 })?.id, 'exercise.breathing');
  assert.equal(tomorrowTask(program, { week: 1, day: 7 })?.id, 'cbt.thoughts');
  assert.equal(tomorrowTask(program, { week: 2, day: 7 }), null);
});
