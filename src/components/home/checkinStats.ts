/**
 * Pure helpers behind the one-tap check-in (QuickCheckIn) and the Sunday weekly card. No UI, no storage.
 * "This week" is the last 7 calendar days up to `today` (inclusive); "last week" is the 7 days before that —
 * unless a programme-week window is passed (Sunday card, PM sprint 2 §B4), in which case "this week" is that window
 * and "last week" the 7 days before its first day. Averages are rounded to one decimal; a window without entries
 * yields null.
 */
import type { DiaryEntry, Program, ProgramTask } from '@/clinical/types';

export type DiaryLike = Pick<DiaryEntry, 'date' | 'annoyance'> & Partial<Pick<DiaryEntry, 'loudness'>>;

/** ISO date (YYYY-MM-DD) `offset` days after `date`. Uses local midnight so DST shifts do not skip days. */
export function shiftDate(date: string, offset: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The last 7 days ending on `today`, oldest first; `value` is null on days without an entry. */
export function last7Days(diary: DiaryLike[], today: string, field: 'annoyance' | 'loudness' = 'annoyance'): { date: string; value: number | null }[] {
  const byDate = new Map<string, DiaryLike>();
  for (const e of diary) byDate.set(e.date, e);
  const out: { date: string; value: number | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = shiftDate(today, -i);
    const e = byDate.get(date);
    const v = e ? e[field] : undefined;
    out.push({ date, value: typeof v === 'number' ? v : null });
  }
  return out;
}

/** Mean of a field over the entries dated in [from, to] (inclusive), or null when there is none. */
export function averageBetween(diary: DiaryLike[], from: string, to: string, field: 'annoyance' | 'loudness' = 'annoyance'): number | null {
  const vals: number[] = [];
  for (const e of diary) {
    if (e.date < from || e.date > to) continue;
    const v = e[field];
    if (typeof v === 'number') vals.push(v);
  }
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, x) => s + x, 0) / vals.length) * 10) / 10;
}

export interface WeekCompare {
  /** Mean annoyance over this week's window (today included). */
  cur: number | null;
  /** Mean annoyance over the 7 days before that window. */
  prev: number | null;
  /** cur − prev, rounded to one decimal; null unless both exist. Negative is better. */
  delta: number | null;
  /** Days with an entry in the current window. */
  daysLogged: number;
  /** The window actually used for `cur` (inclusive ISO dates). */
  window: { from: string; to: string };
}

/** Inclusive date window of the current programme week, day 1 up to today (`pos` from `programPosition`). */
export function programWeekWindow(startDate: string, pos: { week: number; day: number }): { from: string; to: string } {
  const from = shiftDate(startDate, (pos.week - 1) * 7);
  return { from, to: shiftDate(from, pos.day - 1) };
}

/** This week vs last week for the comparison line under the mini chart (calendar 7 days) or the Sunday card (programme week). */
export function weekCompare(diary: DiaryLike[], today: string, field: 'annoyance' | 'loudness' = 'annoyance', window?: { from: string; to: string }): WeekCompare {
  const win = window ?? { from: shiftDate(today, -6), to: today };
  const cur = averageBetween(diary, win.from, win.to, field);
  const prev = averageBetween(diary, shiftDate(win.from, -7), shiftDate(win.from, -1), field);
  const delta = cur != null && prev != null ? Math.round((cur - prev) * 10) / 10 : null;
  const logged = new Set<string>();
  for (const e of diary) if (e.date >= win.from && e.date <= win.to && typeof e[field] === 'number') logged.add(e.date);
  return { cur, prev, delta, daysLogged: logged.size, window: win };
}

/** Most recent entry on or before `today`. */
export function lastEntryBefore<T extends DiaryLike>(diary: T[], today: string): T | null {
  let best: T | null = null;
  for (const e of diary) if (e.date <= today && (!best || e.date > best.date)) best = e;
  return best;
}

/** Formats a one-decimal average for display ("4,3" in Turkish, "4.3" in English); "–" when null. */
export function formatAvg(v: number | null, locale: 'tr' | 'en'): string {
  if (v == null) return '–';
  const s = (Math.round(v * 10) / 10).toString();
  return locale === 'tr' ? s.replace('.', ',') : s;
}

// --- one-tap check-in rows (pure; QuickCheckIn renders them) ---------------------------------------------------

export type CheckinField = 'annoyance' | 'loudness' | 'sleep';

/**
 * Builds today's diary entry after a chip tap. Only the field the user touched is written; loudness and sleep
 * quality stay undefined until their own row is used (PM sprint 2 §B2, defect D6: no fabricated loudness).
 */
export function buildCheckinEntry(existing: DiaryEntry | undefined, date: string, field: CheckinField, v: number): DiaryEntry {
  const entry: DiaryEntry = {
    ...existing,
    date,
    annoyance: field === 'annoyance' ? v : existing?.annoyance ?? v,
    mood: existing?.mood ?? 1,
  };
  if (field === 'loudness') entry.loudness = v;
  if (field === 'sleep') entry.sleepQuality = v;
  return entry;
}

/**
 * The "Uyku kalitesi (dün gece)" row is offered on the CBT-I arm (`sleepFirst`) and on any day with the sleep sound,
 * replacing the former `sleep.diary` task (PM sprint 2 §2). Old programmes that still schedule `sleep.diary` get
 * the row too, so the row can complete that task.
 */
export function needsSleepRow(arm: Program['arm'] | undefined, todayTasks: Pick<ProgramTask, 'id'>[]): boolean {
  return arm === 'sleepFirst' || todayTasks.some((x) => x.id === 'sleep.sound' || x.id === 'sleep.diary');
}
