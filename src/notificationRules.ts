/**
 * Pure scheduling rules for local notifications (no React Native imports, so `tests/notifications.test.ts`
 * can run them under node). `src/notifications.ts` applies them with expo-notifications.
 */
import type { Program } from '@/clinical/types';

export type ProgramPhase = NonNullable<Program['phase']>;
type ReminderProgram = Pick<Program, 'arm' | 'weeks' | 'startDate' | 'phase' | 'maintenanceStartDate' | 'refresherUntil'>;

/** Measurement reminders fire at 10:00 local (PM Sprint 2 C1; outside the default 22:00–06:00 quiet hours). */
export const MEASUREMENT_HOUR = 10;
/** The one-shot "programme completed" notification fires at 18:00 local on the programme's last day (Sprint 3 C2). */
export const PROGRAM_DONE_HOUR = 18;
/** Maintenance: the THI re-measurement falls on every 4th maintenance Sunday (PM Sprint 3 §2 "Bakım modu"). */
export const MAINTENANCE_MEASUREMENT_WEEKS = 4;
/** Maintenance reminder days when the user never chose any: Monday, Wednesday, Sunday (expo numbering, 1 = Sunday). */
export const DEFAULT_MAINTENANCE_REMINDER_DAYS: readonly number[] = [2, 4, 1];
/** All seven weekdays in expo-notifications numbering: 1 = Sunday … 7 = Saturday. */
export const ALL_WEEKDAYS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

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

/** True while the programme is in maintenance (weeks appended by `enterMaintenance`). */
export const isMaintenance = (program: Pick<Program, 'phase'> | null | undefined): boolean => program?.phase === 'maintenance';

/**
 * Maintenance measurement Sundays: day 7 of every 4th maintenance week, counted from `maintenanceStartDate`
 * (day 1 of maintenance week 1), so the k-th one is `maintenanceStartDate + (28k − 1)` days. A running refresher
 * block (`refresherUntil`, inclusive end date) pauses the cadence: Sundays before its end are skipped, so the
 * next measurement is the first 4-weekly Sunday on or after the block ends.
 */
export function maintenanceMeasurementDates(program: Pick<Program, 'startDate' | 'maintenanceStartDate' | 'refresherUntil'>, count = 26): string[] {
  const anchor = program.maintenanceStartDate ?? program.startDate;
  const out: string[] = [];
  for (let k = 1; out.length < count && k <= count * 4; k++) {
    const d = programDayDate(anchor, k * MAINTENANCE_MEASUREMENT_WEEKS * 7 - 1);
    const iso = localDateISO(d);
    if (program.refresherUntil && iso < program.refresherUntil) continue;
    out.push(iso);
  }
  return out;
}

/**
 * Date (`YYYY-MM-DD`) of the next measurement Sunday, the first one whose 10:00 reminder is still in the future at `now`.
 *  - active phase: day 7 of week 4/8/12 (programme day index `week*7 − 1`); null when none is left (or the programme
 *    is shorter than 4 weeks);
 *  - maintenance: every 4th maintenance Sunday from `maintenanceStartDate` (see `maintenanceMeasurementDates`),
 *    a refresher block defers the cadence past its end.
 */
export function nextMeasurementDate(program: ReminderProgram, now: Date = new Date(), hour = MEASUREMENT_HOUR): string | null {
  const candidates = isMaintenance(program)
    ? maintenanceMeasurementDates(program)
    : measurementWeeks(program).map((week) => localDateISO(programDayDate(program.startDate, week * 7 - 1)));
  for (const iso of candidates) {
    const d = new Date(`${iso}T00:00:00`);
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() > now.getTime()) return iso;
  }
  return null;
}

/**
 * Last day (`YYYY-MM-DD`) of the structured programme (`startDate + weeks*7 − 1`): the day the one-shot
 * "programme completed" notification fires. Null in maintenance (the weeks are extended there) or when the
 * programme has no weeks.
 */
export function programEndDate(program: Pick<Program, 'startDate' | 'weeks' | 'phase'>): string | null {
  if (isMaintenance(program) || program.weeks.length === 0) return null;
  return localDateISO(programDayDate(program.startDate, program.weeks.length * 7 - 1));
}

/** `programEndDate` when its `hour`:00 reminder is still in the future at `now`; null otherwise. */
export function programDoneDate(program: Pick<Program, 'startDate' | 'weeks' | 'phase'>, now: Date = new Date(), hour = PROGRAM_DONE_HOUR): string | null {
  const iso = programEndDate(program);
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  d.setHours(hour, 0, 0, 0);
  return d.getTime() > now.getTime() ? iso : null;
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

/** `hour` itself, or the end of the quiet hours when `hour` would fall inside them. */
export function hourOutsideQuiet(hour: number, nightStart: number, nightEnd: number): number {
  return isQuietHour(hour, nightStart, nightEnd) ? ((nightEnd % 24) + 24) % 24 : hour;
}

/** Hour for the measurement reminder: 10:00, or the end of the quiet hours when 10:00 would fall inside them. */
export function measurementReminderHour(nightStart: number, nightEnd: number): number {
  return hourOutsideQuiet(MEASUREMENT_HOUR, nightStart, nightEnd);
}

/** Hour for the "programme completed" notification: 18:00, or the end of the quiet hours when 18:00 is inside them. */
export function programDoneHour(nightStart: number, nightEnd: number): number {
  return hourOutsideQuiet(PROGRAM_DONE_HOUR, nightStart, nightEnd);
}

/** Normalise a user-chosen weekday list: whole numbers 1–7, unique, in calendar order (Sunday first). */
export function normalizeReminderDays(days: readonly number[] | null | undefined): number[] {
  const set = new Set<number>();
  for (const d of days ?? []) { const n = Math.round(d); if (n >= 1 && n <= 7) set.add(n); }
  return [...set].sort((a, b) => a - b);
}

/**
 * Weekdays the daily reminder is scheduled on (expo numbering, 1 = Sunday):
 *  - active phase: all seven;
 *  - maintenance: the user's `reminderDays` (Sprint 3 C2: down to 3/week), or Monday/Wednesday/Sunday when the
 *    list is empty or invalid.
 */
export function reminderWeekdays(phase: ProgramPhase | null | undefined, reminderDays: readonly number[] | null | undefined): number[] {
  if (phase !== 'maintenance') return [...ALL_WEEKDAYS];
  const days = normalizeReminderDays(reminderDays);
  return days.length ? days : normalizeReminderDays(DEFAULT_MAINTENANCE_REMINDER_DAYS);
}

/**
 * Copy variant for the weekday reminders. Sunday always keeps the weekly-card copy; the light-dose programme gets a
 * single "~8 min, one step" body (Sprint 2 C4) and maintenance a single "5 min practice or just the check-in" body
 * (Sprint 3 C2) on the other days.
 */
export function dailyReminderKeys(weekday: number, dose: 'full' | 'light' | null | undefined, phase?: ProgramPhase | null): { title: string; body: string } {
  if (weekday !== 1 && phase === 'maintenance') return { title: 'notif.day.maint.title', body: 'notif.day.maint.body' };
  if (weekday !== 1 && dose === 'light') return { title: 'notif.day.light.title', body: 'notif.day.light.body' };
  return { title: `notif.day.${weekday}.title`, body: `notif.day.${weekday}.body` };
}
