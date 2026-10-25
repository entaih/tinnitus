import type { Program, ProgramTask } from '@/clinical/types';
import { dayCompletion, taskKey, tasksForDay } from '@/clinical/program';
import type { TFn } from '@/i18n';

/** Default active-minute budget when the programme preferences are not stored (Sprint 1: 30 → 15). */
export const DEFAULT_MINUTES_PER_DAY = 15;
/** At most this many numbered (active, non-background) steps are shown for a day; the rest sit behind "Daha fazla". */
export const MAX_ACTIVE_STEPS = 3;

/** Sound tasks play in the background and do not count against the active-minute budget. */
/** Long-running player presets (enrichment, notched, sleep, graded exposure) run in the background; short interactive sound steps (mixing point, RI) are numbered. */
export const isBackground = (task: ProgramTask) => task.type === 'sound' && task.route.startsWith('/sound/player');
/** Daily check-in, measurements and the 1-minute weekly card are always shown, however short the budget (but never beyond MAX_ACTIVE_STEPS). */
export const isEssential = (task: ProgramTask) => task.type === 'diary' || task.type === 'assessment' || task.type === 'review';

/** Sum of active (non-sound) minutes. */
export function activeMinutes(tasks: ProgramTask[]): number {
  return tasks.filter((x) => !isBackground(x)).reduce((s, x) => s + x.minutes, 0);
}

export const hasBackgroundSound = (tasks: ProgramTask[]) => tasks.some(isBackground);
/** Numbered steps of a plan: everything that is not a background sound. */
export const activeTasks = (tasks: ProgramTask[]) => tasks.filter((x) => !isBackground(x));
export const backgroundTasks = (tasks: ProgramTask[]) => tasks.filter(isBackground);

/** Task title without the "(deneysel)" / "(experimental)" suffix; experimental status is shown in the player instead. */
export function taskTitle(t: TFn, task: ProgramTask): string {
  return t(task.titleKey).replace(/\s*\((deneysel|experimental)\)\s*$/i, '');
}

/** "{n} dk" for active tasks, "Arka planda, gün içinde" for sound tasks (no minute target). */
export function taskMeta(t: TFn, task: ProgramTask): string {
  return isBackground(task) ? t('task.background') : t('common.minutes', { n: task.minutes });
}

/**
 * Short split (re-entry after missed days, or the user-chosen "Kısa sürüm"): the check-in plus the shortest
 * other active task. Measurement tasks are kept, and on a measurement day they take the place of the extra task.
 * Background sound stays in the plan.
 */
function shortSplit(tasks: ProgramTask[]): { shown: ProgramTask[]; more: ProgramTask[] } {
  const keep = new Set<string>();
  for (const x of tasks) if (isBackground(x) || isEssential(x)) keep.add(x.id);
  if (!tasks.some((x) => x.type === 'assessment')) {
    const shortest = activeTasks(tasks).filter((x) => !isEssential(x)).sort((a, b) => a.minutes - b.minutes)[0];
    if (shortest) keep.add(shortest.id);
  }
  return { shown: tasks.filter((x) => keep.has(x.id)), more: tasks.filter((x) => !keep.has(x.id)) };
}

/**
 * Splits a day's tasks into the ones shown as "today" and the overflow kept behind "Daha fazla".
 * Background sound is always shown (it is listed separately, not numbered). Essential tasks come first, then the
 * remaining active tasks fill the minute budget in order — but never more than MAX_ACTIVE_STEPS numbered steps.
 * In short mode (re-entry or user choice) only the check-in and the shortest other task are shown.
 */
export function splitByBudget(tasks: ProgramTask[], budget = DEFAULT_MINUTES_PER_DAY, short = false, maxActive = MAX_ACTIVE_STEPS): { shown: ProgramTask[]; more: ProgramTask[] } {
  if (short) return shortSplit(tasks);
  let used = 0;
  let steps = 0;
  const shown: ProgramTask[] = [];
  const more: ProgramTask[] = [];
  for (const x of tasks) {
    if (isBackground(x)) { shown.push(x); continue; }
    if (steps >= maxActive) { more.push(x); continue; }
    const fits = used + x.minutes <= budget || steps === 0;
    if (isEssential(x) || fits) { shown.push(x); used += x.minutes; steps++; }
    else more.push(x);
  }
  return { shown, more };
}

/** Number of consecutive days before `dayIndex` with scheduled tasks and nothing done (max 7). */
export function missedStreak(program: Program, dayIndex: number): number {
  let n = 0;
  for (let i = dayIndex - 1; i >= 0 && n < 7; i--) {
    const c = dayCompletion(program, Math.floor(i / 7) + 1, (i % 7) + 1);
    if (c.total > 0 && c.done === 0) n++; else break;
  }
  return n;
}

/** True when the user has missed at least two days in a row and has not yet done anything today. */
export function isReentry(program: Program, pos: { week: number; day: number; dayIndex: number }): boolean {
  return missedStreak(program, pos.dayIndex) >= 2 && dayCompletion(program, pos.week, pos.day).done === 0;
}

/** Days with at least one completed task among the last `n` programme days up to today, plus how many days that window covers. */
export function activeDaysOf(program: Program, dayIndex: number, n = 7): { done: number; total: number } {
  const from = Math.max(0, dayIndex - n + 1);
  let done = 0;
  for (let i = from; i <= dayIndex; i++) if (dayCompletion(program, Math.floor(i / 7) + 1, (i % 7) + 1).done > 0) done++;
  return { done, total: dayIndex - from + 1 };
}

/** Weekly goal: 5 active days out of 7 (no daily streak — a missed day costs the week nothing). */
export const WEEKLY_GOAL_DAYS = 5;

/** Active days in the current programme week (day 1 … today). */
export function weekActiveDays(program: Program, pos: { week: number; day: number; dayIndex: number }): number {
  return activeDaysOf(program, pos.dayIndex, pos.day).done;
}

/** Tomorrow's first active, non-check-in task (next day of the week, or day 1 of the next week); null on the last day. */
export function tomorrowTask(program: Program, pos: { week: number; day: number }): ProgramTask | null {
  const next = pos.day < 7 ? { week: pos.week, day: pos.day + 1 } : { week: pos.week + 1, day: 1 };
  if (next.week > program.weeks.length) return null;
  return tasksForDay(program, next.week, next.day).find((x) => !isBackground(x) && x.type !== 'diary') ?? null;
}

/** Today's plan for Home and the session runner: budgeted or short list plus the overflow. */
export function planForToday(program: Program, pos: { week: number; day: number; dayIndex: number }, budget = DEFAULT_MINUTES_PER_DAY, opts?: { short?: boolean }) {
  const tasks = tasksForDay(program, pos.week, pos.day);
  const reentry = isReentry(program, pos);
  const short = reentry || !!opts?.short;
  const { shown, more } = splitByBudget(tasks, budget, short);
  const isDone = (x: ProgramTask) => !!program.completed[taskKey(pos.week, pos.day, x.id)];
  return { tasks, shown, more, reentry, short, isDone };
}
