import type { Program, ProgramTask } from '@/clinical/types';
import { dayCompletion, taskKey, tasksForDay } from '@/clinical/program';
import type { TFn } from '@/i18n';

/** Default active-minute budget when the programme preferences are not stored. */
export const DEFAULT_MINUTES_PER_DAY = 30;

/** Sound tasks play in the background and do not count against the active-minute budget. */
export const isBackground = (task: ProgramTask) => task.type === 'sound';
/** Daily check-in and measurements are always shown, however short the budget. */
export const isEssential = (task: ProgramTask) => task.type === 'diary' || task.type === 'assessment';

/** Sum of active (non-sound) minutes. */
export function activeMinutes(tasks: ProgramTask[]): number {
  return tasks.filter((x) => !isBackground(x)).reduce((s, x) => s + x.minutes, 0);
}

export const hasBackgroundSound = (tasks: ProgramTask[]) => tasks.some(isBackground);

/** Task title without the "(deneysel)" / "(experimental)" suffix; experimental status is shown in the player instead. */
export function taskTitle(t: TFn, task: ProgramTask): string {
  return t(task.titleKey).replace(/\s*\((deneysel|experimental)\)\s*$/i, '');
}

/** "{n} dk" for active tasks, "Arka planda · en az {n} dk" for sound tasks. */
export function taskMeta(t: TFn, task: ProgramTask): string {
  return isBackground(task) ? t('task.background', { n: task.minutes }) : t('common.minutes', { n: task.minutes });
}

/**
 * Splits a day's tasks into the ones shown as "today" and the overflow kept behind "Daha fazla".
 * Essential and background tasks are always shown; the remaining active tasks fill the minute budget in order.
 * In re-entry mode (after missed days) only the two shortest active tasks are shown.
 */
export function splitByBudget(tasks: ProgramTask[], budget = DEFAULT_MINUTES_PER_DAY, reentry = false): { shown: ProgramTask[]; more: ProgramTask[] } {
  if (reentry) {
    const active = tasks.filter((x) => !isBackground(x));
    const keep = new Set([...active].sort((a, b) => a.minutes - b.minutes).slice(0, 2).map((x) => x.id));
    for (const x of tasks) if (isBackground(x)) keep.add(x.id);
    return { shown: tasks.filter((x) => keep.has(x.id)), more: tasks.filter((x) => !keep.has(x.id)) };
  }
  let used = 0;
  const shown: ProgramTask[] = [];
  const more: ProgramTask[] = [];
  for (const x of tasks) {
    if (isBackground(x) || isEssential(x)) { shown.push(x); if (!isBackground(x)) used += x.minutes; continue; }
    if (used + x.minutes <= budget || shown.filter((s) => !isEssential(s) && !isBackground(s)).length === 0) { shown.push(x); used += x.minutes; }
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

/** Today's plan for Home and the session runner: budgeted or re-entry list plus the overflow. */
export function planForToday(program: Program, pos: { week: number; day: number; dayIndex: number }, budget = DEFAULT_MINUTES_PER_DAY) {
  const tasks = tasksForDay(program, pos.week, pos.day);
  const reentry = isReentry(program, pos);
  const { shown, more } = splitByBudget(tasks, budget, reentry);
  const isDone = (x: ProgramTask) => !!program.completed[taskKey(pos.week, pos.day, x.id)];
  return { tasks, shown, more, reentry, isDone };
}
