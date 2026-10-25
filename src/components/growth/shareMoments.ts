/**
 * Share moments (PM sprint 3 §B3, defect E9): the few points in the journey where a visual card is offered.
 * Pure — no store, no UI — so it is testable in node. The caller owns the rate limit state (`lastShareMomentAt`,
 * `lastShareMomentId` in the growth store) and the counters (`shareMomentShown` / `shareMomentUsed`).
 *
 * Rules: numbers are only ever the user's own; wording lives in i18n (`growth.moment.*`) and never uses treatment or
 * cure language (tests/share.test.ts scans it). At most one moment per 7 days; the same moment may be shown again on
 * the day it was first offered (SessionComplete and the weekly card both show it on a Sunday).
 */
import type { Program } from '@/clinical/types';
import { THI_DROP_MCID } from './shareRules';

export type ShareMomentId = 'firstWeekDone' | 'weeklyGoal' | 'thiDrop' | 'programDone' | 'maintenance12w';

export interface ShareMoment {
  id: ShareMomentId;
  /** i18n key of the card headline (growth.moment.{id}.card) with `params`. */
  titleKey: string;
  /** i18n key of the one-line prompt on the completion screen (growth.moment.{id}.prompt). */
  promptKey: string;
  params: Record<string, number | string>;
}

export interface ShareMomentInput {
  program: Program | null;
  pos: { week: number; day: number; dayIndex: number } | null;
  /** Chronological THI totals (oldest first). */
  thi: { date: string; total: number }[];
  /** Active days in the current programme week (day 1 … today). */
  weekDone: number;
  /** The goal the ring targets this week (5, or 3 in maintenance). */
  weeklyGoal: number;
  /** True when the programme's structured weeks are behind the user (taskBudget.programFinished). */
  finished: boolean;
  /** True when the day's numbered steps are all done (SessionComplete passes true; the weekly card checks). */
  dayDone: boolean;
  lastShareMomentAt: string | null;
  lastShareMomentId: string | null;
  now?: Date;
}

export const SHARE_MOMENT_COOLDOWN_DAYS = 7;
/** Weeks of maintenance after which the "12 weeks in maintenance" card is offered. */
export const MAINTENANCE_SHARE_WEEKS = 12;

const moment = (id: ShareMomentId, params: Record<string, number | string>): ShareMoment => ({ id, titleKey: `growth.moment.${id}.card`, promptKey: `growth.moment.${id}.prompt`, params });

const activeDaysOf = (p: Program) => {
  const days = new Set<string>();
  for (const iso of Object.values(p.completed)) days.add(iso.slice(0, 10));
  return days.size;
};

/** Candidate moments in priority order, before the rate limit. Exported for tests. */
export function candidateMoments(input: ShareMomentInput): ShareMoment[] {
  const { program, pos, thi } = input;
  const now = input.now ?? new Date();
  const out: ShareMoment[] = [];
  if (program && input.finished) out.push(moment('programDone', { weeks: program.weeks.length, days: activeDaysOf(program) }));
  if (program?.phase === 'maintenance' && program.maintenanceStartDate) {
    const start = new Date(program.maintenanceStartDate + 'T00:00:00');
    const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 86_400_000));
    if (weeks >= MAINTENANCE_SHARE_WEEKS) out.push(moment('maintenance12w', { weeks, days: activeDaysOf(program) }));
  }
  if (thi.length >= 2) {
    const prev = thi[thi.length - 2].total;
    const last = thi[thi.length - 1].total;
    if (prev - last >= THI_DROP_MCID) out.push(moment('thiDrop', { from: prev, to: last, drop: prev - last }));
  }
  if (program && pos && pos.week === 1 && pos.day === 7 && input.dayDone && program.phase !== 'maintenance') out.push(moment('firstWeekDone', { days: input.weekDone }));
  if (program && pos && input.weeklyGoal > 0 && input.weekDone >= input.weeklyGoal) out.push(moment('weeklyGoal', { done: input.weekDone, goal: input.weeklyGoal }));
  return out;
}

/** The one moment to offer now, or null (nothing happened, or a different card was shown within the last 7 days). */
export function shareMoments(input: ShareMomentInput): ShareMoment | null {
  const now = input.now ?? new Date();
  const candidates = candidateMoments(input);
  if (!candidates.length) return null;
  const last = input.lastShareMomentAt ? new Date(input.lastShareMomentAt) : null;
  const inCooldown = !!last && now.getTime() - last.getTime() < SHARE_MOMENT_COOLDOWN_DAYS * 86_400_000;
  if (!inCooldown) return candidates[0];
  // Inside the week only the same card may be shown again, and only on the day it was first shown (SessionComplete and
  // the weekly card both offer it on one Sunday); it never repeats on later days of that week.
  if (last && localDay(last) === localDay(now)) return candidates.find((m) => m.id === input.lastShareMomentId) ?? null;
  return null;
}

/** Local calendar day (YYYY-MM-DD) of a date; exported for the card component's "already marked today" check. */
export function localDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
