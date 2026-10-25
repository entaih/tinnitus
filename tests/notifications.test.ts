import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_WEEKDAYS, DEFAULT_MAINTENANCE_REMINDER_DAYS, MEASUREMENT_HOUR, PROGRAM_DONE_HOUR, dailyReminderKeys, isQuietHour, maintenanceMeasurementDates,
  measurementReminderHour, measurementWeeks, nextMeasurementDate, normalizeReminderDays, programDoneDate, programDoneHour, programEndDate, reminderWeekdays,
} from '../src/notificationRules.ts';
import { notifyStrings } from '../src/i18n/areas/notify.ts';
import type { Program } from '../src/clinical/types.ts';

type ReminderProgram = Pick<Program, 'arm' | 'weeks' | 'startDate' | 'phase' | 'maintenanceStartDate' | 'refresherUntil'>;
const program = (weeks: number, arm: Program['arm'] = 'soundCbt', startDate = '2026-10-05'): ReminderProgram => ({
  arm, startDate,
  weeks: Array.from({ length: weeks }, (_, i) => ({ week: i + 1, themeKey: '', rationaleKeys: [], days: [] })),
});
/** A 6-week programme that entered maintenance on its day 43 (Monday 2026-11-16), weeks extended by 4 as `enterMaintenance` does. */
const maintenance = (extra: Partial<ReminderProgram> = {}): ReminderProgram => ({
  ...program(10), phase: 'maintenance', maintenanceStartDate: '2026-11-16', ...extra,
});

// 2026-10-05 is a Monday, so day 7 of week 4 (day index 27) is Sunday 2026-11-01.

test('nextMeasurementDate: week 4 Sunday from the start of a 12-week programme', () => {
  assert.equal(nextMeasurementDate(program(12), new Date('2026-10-05T12:00:00')), '2026-11-01');
  assert.deepEqual(measurementWeeks(program(12)), [4, 8, 12]);
});

test('nextMeasurementDate: moves on to week 8 once the week-4 reminder time has passed, and to week 12 after week 8', () => {
  // Sunday 2026-11-01 at 09:59 still gets the 10:00 reminder; at 10:00 it has passed.
  assert.equal(nextMeasurementDate(program(12), new Date('2026-11-01T09:59:00')), '2026-11-01');
  assert.equal(nextMeasurementDate(program(12), new Date('2026-11-01T10:00:00')), '2026-11-29');
  assert.equal(nextMeasurementDate(program(12), new Date('2026-12-15T08:00:00')), '2026-12-27');
});

test('nextMeasurementDate: 8-week programme has no week-12 measurement; null after the last one', () => {
  assert.deepEqual(measurementWeeks(program(8)), [4, 8]);
  assert.equal(nextMeasurementDate(program(8), new Date('2026-11-02T08:00:00')), '2026-11-29');
  assert.equal(nextMeasurementDate(program(8), new Date('2026-11-29T10:00:01')), null);
});

test('nextMeasurementDate: acute arm measures once, at week 4', () => {
  assert.deepEqual(measurementWeeks(program(8, 'acute')), [4]);
  assert.equal(nextMeasurementDate(program(8, 'acute'), new Date('2026-10-05T12:00:00')), '2026-11-01');
  assert.equal(nextMeasurementDate(program(8, 'acute'), new Date('2026-11-01T10:00:01')), null);
  assert.equal(nextMeasurementDate(program(3, 'acute'), new Date('2026-10-05T12:00:00')), null);
});

test('quiet hours: wrap-around range, measurement hour stays 10:00 outside them', () => {
  assert.equal(MEASUREMENT_HOUR, 10);
  assert.ok(isQuietHour(22, 22, 6));
  assert.ok(isQuietHour(23, 22, 6));
  assert.ok(isQuietHour(5, 22, 6));
  assert.ok(!isQuietHour(6, 22, 6));
  assert.ok(!isQuietHour(21, 22, 6));
  assert.ok(!isQuietHour(10, 22, 6));
  assert.ok(isQuietHour(13, 12, 14));
  assert.ok(!isQuietHour(9, 9, 9));
  assert.equal(measurementReminderHour(22, 6), 10);
  assert.equal(measurementReminderHour(9, 12), 12);
});

test('daily reminder copy: light dose swaps weekday bodies but keeps the Sunday card', () => {
  assert.deepEqual(dailyReminderKeys(3, 'full'), { title: 'notif.day.3.title', body: 'notif.day.3.body' });
  assert.deepEqual(dailyReminderKeys(3, 'light'), { title: 'notif.day.light.title', body: 'notif.day.light.body' });
  assert.deepEqual(dailyReminderKeys(1, 'light'), { title: 'notif.day.1.title', body: 'notif.day.1.body' });
  assert.deepEqual(dailyReminderKeys(5, null), { title: 'notif.day.5.title', body: 'notif.day.5.body' });
});

// --- Sprint 3 C2: maintenance measurement Sundays, refresher block, programme-done day, reminder days ---------------

test('nextMeasurementDate: maintenance measures on every 4th maintenance Sunday from maintenanceStartDate', () => {
  // Maintenance week 1 day 1 = Monday 2026-11-16 → week 4 day 7 = Sunday 2026-12-13, then 2027-01-10, 2027-02-07.
  assert.deepEqual(maintenanceMeasurementDates(maintenance(), 3), ['2026-12-13', '2027-01-10', '2027-02-07']);
  assert.equal(nextMeasurementDate(maintenance(), new Date('2026-11-16T12:00:00')), '2026-12-13');
  assert.equal(nextMeasurementDate(maintenance(), new Date('2026-12-13T09:59:00')), '2026-12-13');
  assert.equal(nextMeasurementDate(maintenance(), new Date('2026-12-13T10:00:00')), '2027-01-10');
  // The active-phase week-4/8/12 rule is not used in maintenance (week 8 Sunday of the extended 10-week grid would be 2026-11-29).
  assert.notEqual(nextMeasurementDate(maintenance(), new Date('2026-11-16T12:00:00')), '2026-11-29');
  // Without maintenanceStartDate the cadence falls back to the programme start.
  assert.equal(nextMeasurementDate(maintenance({ maintenanceStartDate: undefined }), new Date('2026-10-05T12:00:00')), '2026-11-01');
});

test('nextMeasurementDate: a refresher block defers the maintenance measurement past its end', () => {
  // THI +13 on 2026-12-13 → 2-week refresher until 2026-12-27: the 2026-12-13 Sunday is inside/at the start, the cadence resumes on 2027-01-10.
  const p = maintenance({ refresherUntil: '2026-12-27' });
  assert.equal(nextMeasurementDate(p, new Date('2026-12-14T12:00:00')), '2027-01-10');
  assert.equal(nextMeasurementDate(p, new Date('2026-11-16T12:00:00')), '2027-01-10');
  // A refresher that already ended changes nothing.
  assert.equal(nextMeasurementDate(maintenance({ refresherUntil: '2026-11-20' }), new Date('2026-11-21T12:00:00')), '2026-12-13');
});

test('programEndDate / programDoneDate: the one-shot programme-done notification fires at 18:00 on the last programme day, never in maintenance', () => {
  // 6 weeks from Monday 2026-10-05 → last day Sunday 2026-11-15.
  assert.equal(programEndDate(program(6)), '2026-11-15');
  assert.equal(PROGRAM_DONE_HOUR, 18);
  assert.equal(programDoneDate(program(6), new Date('2026-10-05T12:00:00')), '2026-11-15');
  assert.equal(programDoneDate(program(6), new Date('2026-11-15T17:59:00')), '2026-11-15');
  assert.equal(programDoneDate(program(6), new Date('2026-11-15T18:00:00')), null);
  assert.equal(programDoneDate(maintenance(), new Date('2026-10-05T12:00:00')), null);
  assert.equal(programEndDate(program(0)), null);
  assert.equal(programDoneHour(22, 6), 18);
  assert.equal(programDoneHour(17, 20), 20);
});

test('reminderWeekdays: all 7 in the active programme, settings.reminderDays (default Mon/Wed/Sun = 3) in maintenance', () => {
  assert.deepEqual(reminderWeekdays('active', [2, 4, 1]), [...ALL_WEEKDAYS]);
  assert.deepEqual(reminderWeekdays(undefined, []), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(DEFAULT_MAINTENANCE_REMINDER_DAYS, [2, 4, 1]);
  assert.equal(reminderWeekdays('maintenance', [...DEFAULT_MAINTENANCE_REMINDER_DAYS]).length, 3);
  assert.deepEqual(reminderWeekdays('maintenance', [2, 4, 1]), [1, 2, 4]);
  // The scheduled count equals reminderDays.length for any valid choice (C4 acceptance).
  for (const days of [[2], [2, 5], [1, 3, 5, 7], [1, 2, 3, 4, 5, 6, 7]]) assert.equal(reminderWeekdays('maintenance', days).length, days.length);
  // Empty or invalid lists fall back to the default three; duplicates and out-of-range values are dropped.
  assert.deepEqual(reminderWeekdays('maintenance', []), [1, 2, 4]);
  assert.deepEqual(reminderWeekdays('maintenance', [0, 8, 9]), [1, 2, 4]);
  assert.deepEqual(normalizeReminderDays([5, 5, 2, 0, 8]), [2, 5]);
});

test('daily reminder copy: maintenance uses the short-practice copy on weekdays, Sunday keeps the card', () => {
  assert.deepEqual(dailyReminderKeys(3, 'full', 'maintenance'), { title: 'notif.day.maint.title', body: 'notif.day.maint.body' });
  assert.deepEqual(dailyReminderKeys(3, 'light', 'maintenance'), { title: 'notif.day.maint.title', body: 'notif.day.maint.body' });
  assert.deepEqual(dailyReminderKeys(1, 'full', 'maintenance'), { title: 'notif.day.1.title', body: 'notif.day.1.body' });
  assert.deepEqual(dailyReminderKeys(3, 'full', 'active'), { title: 'notif.day.3.title', body: 'notif.day.3.body' });
  assert.equal(notifyStrings.tr['notif.day.maint.title'], 'Bakım: 5 dakikalık kısa uygulama');
  assert.ok(notifyStrings.tr['notif.programDone.title'].startsWith('Programı tamamladınız'));
});

test('notify copy: no treatment claims and every key exists in both locales', () => {
  const banned = ['tedavi eder', 'iyileştirir', 'geçirir', 'cures'];
  for (const locale of ['tr', 'en'] as const) {
    for (const [key, value] of Object.entries(notifyStrings[locale])) {
      const lower = value.toLocaleLowerCase('tr-TR');
      for (const w of banned) assert.ok(!lower.includes(w), `${locale} ${key} contains "${w}"`);
    }
  }
  assert.deepEqual(Object.keys(notifyStrings.tr).sort(), Object.keys(notifyStrings.en).sort());
});
