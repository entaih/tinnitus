/**
 * Pure scheduling rules for local notifications (no React Native imports, so `tests/notifications.test.ts`
 * can run them under node). `src/notifications.ts` applies them with expo-notifications.
 */
import type { Program } from '@/clinical/types';

/** Measurement reminders fire at 10:00 local (PM Sprint 2 C1; outside the default 22:00–06:00 quiet hours). */
export const MEASUREMENT_HOUR = 10;

/** Programme weeks whose Sunday carries the THI re-measurement; the acute arm measures once, at week 4. */
export function measurementWeeks(program: Pick<Program, 'arm' | 'weeks'>): number[] {
  const total = program.weeks.length;
  if (program.arm === 'acute') return total >= 4 ? [4] : [];
  return [4, 8, 12].filter((w) => w <= total);
}

/** `YYYY-MM-DD` of a local Date. */
export function localDateISO(d: Date): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local midnight of `startDate` plus `dayIndex` days (0-based programme day). */
export function programDayDate(startDate: string, dayIndex: number): Date {
  const d = new Date(`${startDate}T00:00:00`);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

/**
 * Date (`YYYY-MM-DD`) of the next measurement Sunday: day 7 of week 4/8/12 (programme day index `week*7 − 1`),
 * the first one whose 10:00 reminder is still in the future at `now`. Null when none is left (or the programme
 * is shorter than 4 weeks).
 */
export function nextMeasurementDate(program: Pick<Program, 'arm' | 'weeks' | 'startDate'>, now: Date = new Date(), hour = MEASUREMENT_HOUR): string | null {
  for (const week of measurementWeeks(program)) {
    const d = programDayDate(program.startDate, week * 7 - 1);
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() > now.getTime()) return localDateISO(d);
  }
  return null;
}

/**
 * True when `hour` (0–23) falls inside the quiet hours [nightStart, nightEnd). The range may wrap midnight
 * (22 → 6 means 22:00–05:59 is quiet; 06:00 is not).
 */
export function isQuietHour(hour: number, nightStart: number, nightEnd: number): boolean {
  const h = ((Math.round(hour) % 24) + 24) % 24;
  if (nightStart === nightEnd) return false;
  return nightStart < nightEnd ? h >= nightStart && h < nightEnd : h >= nightStart || h < nightEnd;
}

/** Hour for the measurement reminder: 10:00, or the end of the quiet hours when 10:00 would fall inside them. */
export function measurementReminderHour(nightStart: number, nightEnd: number): number {
  return isQuietHour(MEASUREMENT_HOUR, nightStart, nightEnd) ? ((nightEnd % 24) + 24) % 24 : MEASUREMENT_HOUR;
}

/** Copy variant for the weekday reminders: the light-dose programme gets a single "~8 min, one step" body (C4). */
export function dailyReminderKeys(weekday: number, dose: 'full' | 'light' | null | undefined): { title: string; body: string } {
  if (dose === 'light' && weekday !== 1) return { title: 'notif.day.light.title', body: 'notif.day.light.body' };
  return { title: `notif.day.${weekday}.title`, body: `notif.day.${weekday}.body` };
}
