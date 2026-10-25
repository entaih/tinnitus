/**
 * Pure helpers behind the one-tap check-in (QuickCheckIn) and the Sunday weekly card. No UI, no storage.
 * "This week" is the last 7 calendar days up to `today` (inclusive); "last week" is the 7 days before that.
 * Averages are rounded to one decimal; a window without entries yields null.
 */
import type { DiaryEntry } from '@/clinical/types';

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
  /** Mean annoyance over the last 7 days (today included). */
  cur: number | null;
  /** Mean annoyance over the 7 days before that. */
  prev: number | null;
  /** cur − prev, rounded to one decimal; null unless both exist. Negative is better. */
  delta: number | null;
  /** Days with an entry in the current 7-day window. */
  daysLogged: number;
}

/** This week vs last week for the comparison line under the mini chart. */
export function weekCompare(diary: DiaryLike[], today: string, field: 'annoyance' | 'loudness' = 'annoyance'): WeekCompare {
  const cur = averageBetween(diary, shiftDate(today, -6), today, field);
  const prev = averageBetween(diary, shiftDate(today, -13), shiftDate(today, -7), field);
  const delta = cur != null && prev != null ? Math.round((cur - prev) * 10) / 10 : null;
  const daysLogged = last7Days(diary, today, field).filter((d) => d.value != null).length;
  return { cur, prev, delta, daysLogged };
}

/** Most recent entry on or before `today` (used to carry loudness forward on a one-tap check-in). */
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
