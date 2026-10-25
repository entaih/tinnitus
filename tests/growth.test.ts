import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicChecksumChar, formatClinicCode, isValidClinicCode, makeClinicCode, normalizeClinicCode } from '../src/components/growth/clinicCode.ts';
import { buildShareText, computeProgressStats, sparklinePoints, thiBandKey } from '../src/components/growth/progressCard.ts';
import { reminderPromptEligible, REMINDER_REASK_DAYS } from '../src/components/home/reminderPrompt.ts';
import type { Assessment, Program } from '../src/clinical/types.ts';

// --- clinic code ---------------------------------------------------------------------------------

test('clinic code: checksum round-trips and rejects a single typo', () => {
  const code = makeClinicCode('KBB-ANK-17');
  assert.equal(code.length, 9);
  assert.ok(isValidClinicCode(code));
  assert.ok(isValidClinicCode(formatClinicCode(code)), 'dashes are ignored');
  assert.ok(isValidClinicCode(code.toLowerCase()), 'case-insensitive');
  const typo = code.slice(0, 3) + (code[3] === 'A' ? 'B' : 'A') + code.slice(4);
  assert.ok(!isValidClinicCode(typo));
  assert.ok(!isValidClinicCode('AB1'), 'too short');
  assert.ok(!isValidClinicCode(''), 'empty');
});

test('clinic code: normalisation folds Turkish i and strips separators', () => {
  assert.equal(normalizeClinicCode('ıst-kbb 01'), 'ISTKBB01');
  assert.equal(clinicChecksumChar('0000'), '0');
  assert.match(clinicChecksumChar('KBBANK17'), /^[0-9A-Z]$/);
});

// --- progress card -------------------------------------------------------------------------------

const thi = (date: string, total: number) => ({ id: 'THI' as const, date, total, answers: [], band: 'mild' as const, interpretationKey: 'thi.grade2' });

test('progress stats: first vs latest THI, programme week and active days', () => {
  const assessments = [
    { id: 'a', date: '2026-09-01T10:00:00.000Z', questionnaires: [thi('2026-09-01T10:00:00.000Z', 48)] },
    { id: 'b', date: '2026-09-29T10:00:00.000Z', questionnaires: [thi('2026-09-29T10:00:00.000Z', 36)] },
  ] as unknown as Assessment[];
  const program = { startDate: '2026-09-01', completed: { '1-1-x': '2026-09-01T12:00:00.000Z', '1-2-x': '2026-09-02T12:00:00.000Z' } } as unknown as Program;
  const stats = computeProgressStats({ assessments, program, diary: [{ date: '2026-09-02' } as never], sessions: [{ id: 's', date: '2026-09-05T08:00:00.000Z', type: 'sound', minutes: 10 }] }, new Date('2026-09-29T12:00:00'));
  assert.equal(stats.thiFirst, 48);
  assert.equal(stats.thiLatest, 36);
  assert.equal(stats.thiChange, -12);
  assert.equal(stats.programWeek, 5);
  assert.equal(stats.activeDays, 3);
  assert.equal(thiBandKey(48), 'moderate');
  assert.equal(thiBandKey(36), 'mild');
  const text = buildShareText(stats, { appName: 'Dingin', thi: 'THI', week: 'Hafta', activeDays: 'Etkin gün', footer: 'Tanı değildir', bandOf: (n) => thiBandKey(n), noThi: 'yok' });
  assert.match(text, /THI: 48 \(moderate\) → 36 \(mild\)/);
  assert.match(text, /Tanı değildir$/);
  assert.ok(sparklinePoints(stats.thi, 100, 50).split(' ').length === 2);
});

test('progress stats: no data yields nulls and zero days', () => {
  const stats = computeProgressStats({ assessments: [], program: null, diary: [], sessions: [] });
  assert.equal(stats.thiFirst, null);
  assert.equal(stats.thiChange, null);
  assert.equal(stats.programWeek, null);
  assert.equal(stats.activeDays, 0);
  assert.equal(sparklinePoints([], 10, 10), '');
});

// --- reminder prompt (PM sprint 3 §B1): after value, once, re-asked once after 7 days ----------------------------

test('reminder prompt: first completed session asks once; "Sonra" re-asks once after 7 days; never a third time', () => {
  const now = new Date('2026-10-20T20:00:00');
  assert.ok(reminderPromptEligible({ reminderIds: [], shownCount: 0, promptedAt: null, now }));
  assert.ok(!reminderPromptEligible({ reminderIds: ['a'], shownCount: 0, promptedAt: null, now }), 'already scheduled');
  assert.ok(!reminderPromptEligible({ reminderIds: [], shownCount: 1, promptedAt: '2026-10-15T20:00:00', now }), '5 days later: not yet');
  assert.ok(reminderPromptEligible({ reminderIds: [], shownCount: 1, promptedAt: new Date(now.getTime() - REMINDER_REASK_DAYS * 86_400_000).toISOString(), now }));
  assert.ok(!reminderPromptEligible({ reminderIds: [], shownCount: 1, promptedAt: null, now }), 'no timestamp (settings field missing): no re-ask');
  assert.ok(!reminderPromptEligible({ reminderIds: [], shownCount: 2, promptedAt: '2026-01-01T00:00:00', now }));
});
