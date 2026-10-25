import test from 'node:test';
import assert from 'node:assert/strict';
import { MEASUREMENT_HOUR, dailyReminderKeys, isQuietHour, measurementReminderHour, measurementWeeks, nextMeasurementDate } from '../src/notificationRules.ts';
import type { Program } from '../src/clinical/types.ts';

const program = (weeks: number, arm: Program['arm'] = 'soundCbt', startDate = '2026-10-05'): Pick<Program, 'arm' | 'weeks' | 'startDate'> => ({
  arm, startDate,
  weeks: Array.from({ length: weeks }, (_, i) => ({ week: i + 1, themeKey: '', rationaleKeys: [], days: [] })),
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
