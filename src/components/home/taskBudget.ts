import type { Program, ProgramTask } from '@/clinical/types';
import { dayCompletion, isProgramFinished, maintenanceWeekOf, structuredWeeksOf, taskKey, tasksForDay } from '@/clinical/program';
import type { TFn } from '@/i18n';

/** Default active-minute budget when the programme preferences are not stored (Sprint 1: 30 → 15). */
export const DEFAULT_MINUTES_PER_DAY = 15;
/** At most this many numbered (active, non-background) steps are shown for a day; the rest sit behind "Daha fazla". */
export const MAX_ACTIVE_STEPS = 3;

/** Sound tasks play in the background and do not count against the active-minute budget. */
/**
 * Long-running player presets (enrichment, notched, sleep, graded exposure) run in the background; short interactive
 * sound steps (mixing point, RI) are numbered, as is any player task the generator flags `numbered` (sprint 3 E2: the
 * hyperacusis day-1 "find your comfortable sound").
 */
export const isBackground = (task: ProgramTask) => task.type === 'sound' && task.route.startsWith('/sound/player') && !task.numbered;
/** Daily check-in, measurements and the 1-minute weekly card are always shown, whatever the budget or the step cap. */
export const isEssential = (task: ProgramTask) => task.type === 'diary' || task.type === 'assessment' || task.type === 'review';
/** A module read from the Mind library (CBT/ACT/mindfulness/CBT-I/hyperacusis) — the only task kind with a 2-minute summary variant. */
export const isModuleTask = (task: ProgramTask) => (task.type === 'mind' || task.type === 'sleep') && task.route.startsWith('/mind/');
/** Minutes shown for a module opened in its summary-only variant (PM sprint 2 §B3). */
export const SUMMARY_MINUTES = 2;

/**
 * The one task that defines the day: the first task flagged `core: true` by the generator (sprint 2), or — for
 * programmes generated before the flag existed — the first module/education task. Null on days without one
 * (measurement days are "core = the scale", which is essential anyway). May be a background sound task (day 1 of
 * the hyperacusis arm): the split shows it as background, the Home hero names it.
 */
export function coreTask(tasks: ProgramTask[]): ProgramTask | null {
  const flagged = tasks.find((x) => x.core === true);
  if (flagged) return flagged;
  return tasks.find((x) => !isBackground(x) && !isEssential(x) && (x.type === 'mind' || x.type === 'sleep' || x.type === 'education')) ?? null;
}

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

/** True for a module task generated (light dose) or converted (short split) as its 2-minute summary. */
export const isSummaryTask = (task: Pick<ProgramTask, 'params'>) => task.params?.summary === '1';

/** "{n} dk" for active tasks, "2 dk özet" for summary modules, "Arka planda, gün içinde" for sound tasks (no minute target). */
export function taskMeta(t: TFn, task: ProgramTask): string {
  if (isBackground(task)) return t('task.background');
  if (isSummaryTask(task)) return t('task.summaryMeta', { n: task.minutes });
  return t('common.minutes', { n: task.minutes });
}

/** Query string for a task's view params (e.g. summary=1) plus the taskKey; values are URI-encoded. Pure (openTask uses it). */
export function taskQuery(task: Pick<ProgramTask, 'params'>, key: string, extra?: Record<string, string>): string {
  const all: Record<string, string> = { ...task.params, ...extra, taskKey: key };
  return Object.entries(all).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

/** The same task shown as its 2-minute summary (id unchanged, so completion keys still match; `params.summary` is view-only). */
export const asSummary = (task: ProgramTask): ProgramTask => ({ ...task, minutes: SUMMARY_MINUTES, params: { ...task.params, summary: '1' } });

/**
 * Short split (re-entry after missed days, or the user-chosen "Kısa sürüm"): the check-in plus one short step.
 * Measurement tasks are kept, and on a measurement day they take the place of the extra step. On a module day the
 * core module is kept as its 2-minute summary variant (PM sprint 2 §B3); otherwise the shortest other active task.
 * Background sound stays in the plan.
 */
function shortSplit(tasks: ProgramTask[]): { shown: ProgramTask[]; more: ProgramTask[] } {
  const keep = new Map<string, ProgramTask>();
  for (const x of tasks) if (isBackground(x) || isEssential(x)) keep.set(x.id, x);
  if (!tasks.some((x) => x.type === 'assessment')) {
    const core = coreTask(tasks);
    if (core && isModuleTask(core)) keep.set(core.id, asSummary(core));
    else {
      const shortest = activeTasks(tasks).filter((x) => !isEssential(x)).sort((a, b) => a.minutes - b.minutes)[0];
      if (shortest) keep.set(shortest.id, shortest);
    }
  }
  return { shown: tasks.filter((x) => keep.has(x.id)).map((x) => keep.get(x.id)!), more: tasks.filter((x) => !keep.has(x.id)) };
}

/**
 * Splits a day's tasks into the ones shown as "today" and the overflow kept behind "Daha fazla" (PM sprint 2 §B1):
 * 1. background sound is always shown (listed separately, not numbered);
 * 2. essentials (check-in, measurements, the 1-minute weekly card) are always shown and never blocked by the cap —
 *    the check-in and measurements count as numbered steps, the weekly card does not;
 * 3. the day's core task (see `coreTask`) is always shown, whatever the budget;
 * 4. the remaining optional tasks fill the minute budget in order, but only while fewer than `maxActive` steps are
 *    numbered — so a module day is at most check-in + core + one optional (+ the weekly card on Sundays).
 * In short mode (re-entry or user choice) see `shortSplit`.
 */
export function splitByBudget(tasks: ProgramTask[], budget = DEFAULT_MINUTES_PER_DAY, short = false, maxActive = MAX_ACTIVE_STEPS): { shown: ProgramTask[]; more: ProgramTask[] } {
  if (short) return shortSplit(tasks);
  const core = coreTask(tasks);
  let used = 0;
  let steps = 0;
  let optionalShown = false;
  const shown: ProgramTask[] = [];
  const more: ProgramTask[] = [];
  for (const x of tasks) {
    if (isBackground(x)) { shown.push(x); continue; }
    if (isEssential(x)) { shown.push(x); used += x.minutes; if (x.type !== 'review') steps++; continue; }
    if (core && x.id === core.id) { shown.push(x); used += x.minutes; steps++; continue; }
    // Optional: within the cap and the budget. A day without a core still shows its first optional step (never empty).
    const fits = used + x.minutes <= budget || (!core && !optionalShown);
    if (steps < maxActive && fits) { shown.push(x); used += x.minutes; steps++; optionalShown = true; }
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
/** Weekly goal in maintenance (PM sprint 3 §2): 3 active days out of 7. */
export const MAINTENANCE_GOAL_DAYS = 3;

/** True once the programme has been switched to maintenance (weeks appended by `enterMaintenance`). */
export const isMaintenance = (p: Pick<Program, 'phase'> | null | undefined) => p?.phase === 'maintenance';

/** The goal the ring targets: `program.weeklyGoal` when the generator wrote it, else 3 in maintenance and 5 otherwise. */
export function weeklyGoalOf(p: Pick<Program, 'phase' | 'weeklyGoal'> | null | undefined): number {
  if (p?.weeklyGoal != null && p.weeklyGoal > 0) return p.weeklyGoal;
  return isMaintenance(p) ? MAINTENANCE_GOAL_DAYS : WEEKLY_GOAL_DAYS;
}

/** True while a refresher block (THI +13 in maintenance) is running: `refresherUntil` is today or later. */
export function refresherActive(p: Pick<Program, 'refresherUntil'> | null | undefined, now = new Date()): boolean {
  if (!p?.refresherUntil) return false;
  return p.refresherUntil >= now.toISOString().slice(0, 10);
}

/** True once the structured weeks are behind the user and maintenance has not started (sprint 3 E1): `isProgramFinished` (Team A, A1). */
export const programFinished = (p: Program, now = new Date()): boolean => isProgramFinished(p, now);

/** Distinct calendar days with at least one completed task over the whole programme (the "{k} etkin gün" of the finished card). */
export function totalActiveDays(p: Pick<Program, 'completed'>): number {
  const days = new Set<string>();
  for (const iso of Object.values(p.completed)) days.add(iso.slice(0, 10));
  return days.size;
}

/** Number of structured (non-maintenance) weeks (the "{n} hafta" of the finished card): all weeks while active, else the weeks before `maintenanceStartDate`. */
export const structuredWeeks = (p: Pick<Program, 'weeks' | 'startDate' | 'maintenanceStartDate' | 'phase'>): number => structuredWeeksOf(p);

/** 1-based maintenance week ("Bakım · 3. hafta"); 0 while the programme is active. */
export function maintenanceWeek(p: Pick<Program, 'weeks' | 'startDate' | 'maintenanceStartDate' | 'phase'>, pos: { week: number }): number {
  return isMaintenance(p) ? Math.max(1, maintenanceWeekOf(p, pos.week)) : 0;
}

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
  // Programmes generated before Oct 2026 still carry a daily check-in task; it is tracking only, so it is hidden.
  const tasks = tasksForDay(program, pos.week, pos.day).filter((x) => x.id !== 'diary.daily');
  const reentry = isReentry(program, pos);
  const short = reentry || !!opts?.short;
  const { shown, more } = splitByBudget(tasks, budget, short);
  const isDone = (x: ProgramTask) => !!program.completed[taskKey(pos.week, pos.day, x.id)];
  return { tasks, shown, more, reentry, short, isDone };
}
