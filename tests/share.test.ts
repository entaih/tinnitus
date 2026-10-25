import test from 'node:test';
import assert from 'node:assert/strict';
import { MAINTENANCE_SHARE_WEEKS, SHARE_MOMENT_COOLDOWN_DAYS, candidateMoments, localDay, shareMoments, type ShareMomentInput } from '../src/components/growth/shareMoments.ts';
import { BANNED_SHARE_WORDS, findBannedShareWord, inviteLink } from '../src/components/growth/shareRules.ts';
import { buildShareText, computeProgressStats, thiBandKey } from '../src/components/growth/progressCard.ts';
import { growthStrings } from '../src/i18n/areas/growth.ts';
import { coreStrings } from '../src/i18n/areas/core.ts';
import type { Program } from '../src/clinical/types.ts';

// PM sprint 3 §B3: share moments are pure, rate-limited to one card a week and never use treatment language.

const program = (over: Partial<Program> = {}): Program => ({
  id: 'p', createdAt: '2026-09-01T00:00:00.000Z', startDate: '2026-09-01', arm: 'soundCbt', completed: {},
  weeks: Array.from({ length: 6 }, (_, i) => ({ week: i + 1, themeKey: 'w', rationaleKeys: [], days: Array.from({ length: 7 }, (_, d) => ({ day: d + 1, tasks: [] })) })),
  ...over,
});
const base = (over: Partial<ShareMomentInput> = {}): ShareMomentInput => ({
  program: program(), pos: { week: 2, day: 3, dayIndex: 9 }, thi: [], weekDone: 1, weeklyGoal: 5, finished: false, dayDone: true,
  lastShareMomentAt: null, lastShareMomentId: null, now: new Date('2026-09-10T12:00:00'), ...over,
});

test('share moments: nothing to share on an ordinary day', () => {
  assert.equal(shareMoments(base()), null);
  assert.deepEqual(candidateMoments(base()), []);
});

test('share moments: first week done on w1d7 only when the day is done, with the active-day count', () => {
  const m = shareMoments(base({ pos: { week: 1, day: 7, dayIndex: 6 }, weekDone: 4 }));
  assert.equal(m?.id, 'firstWeekDone');
  assert.equal(m?.params.days, 4);
  assert.equal(m?.titleKey, 'growth.moment.firstWeekDone.card');
  assert.equal(shareMoments(base({ pos: { week: 1, day: 7, dayIndex: 6 }, weekDone: 4, dayDone: false })), null);
  assert.equal(shareMoments(base({ pos: { week: 1, day: 6, dayIndex: 5 }, weekDone: 4 })), null, 'not before Sunday');
});

test('share moments: weekly goal met (5/7, or the maintenance goal 3/7)', () => {
  assert.equal(shareMoments(base({ weekDone: 5 }))?.id, 'weeklyGoal');
  assert.equal(shareMoments(base({ weekDone: 4 })), null);
  const m = shareMoments(base({ program: program({ phase: 'maintenance', weeklyGoal: 3 }), weeklyGoal: 3, weekDone: 3 }));
  assert.equal(m?.id, 'weeklyGoal');
  assert.deepEqual(m?.params, { done: 3, goal: 3 });
});

test('share moments: THI drop of at least 7 points between the last two measurements', () => {
  const thi = [{ date: '2026-09-01', total: 48 }, { date: '2026-09-29', total: 40 }];
  const m = shareMoments(base({ thi }));
  assert.equal(m?.id, 'thiDrop');
  assert.deepEqual(m?.params, { from: 48, to: 40, drop: 8 });
  assert.equal(shareMoments(base({ thi: [{ date: '2026-09-01', total: 48 }, { date: '2026-09-29', total: 42 }] })), null, '6 points is below the MCID');
  assert.equal(shareMoments(base({ thi: [{ date: '2026-09-01', total: 30 }, { date: '2026-09-29', total: 45 }] })), null, 'a rise is never a share moment');
});

test('share moments: programme done and 12 weeks of maintenance, in priority order', () => {
  const p = program({ completed: { '1-1-a': '2026-09-01T10:00:00.000Z', '1-1-b': '2026-09-01T11:00:00.000Z', '1-2-a': '2026-09-02T10:00:00.000Z' } });
  const m = shareMoments(base({ program: p, finished: true, weekDone: 5 }));
  assert.equal(m?.id, 'programDone');
  assert.deepEqual(m?.params, { weeks: 6, days: 2 });
  const maint = program({ phase: 'maintenance', maintenanceStartDate: '2026-10-13' });
  const now = new Date(`2027-01-06T12:00:00`); // 12 weeks + 1 day later
  const c = candidateMoments(base({ program: maint, now, weekDone: 0 }));
  assert.equal(c[0]?.id, 'maintenance12w');
  assert.equal(c[0]?.params.weeks, MAINTENANCE_SHARE_WEEKS);
  assert.equal(candidateMoments(base({ program: maint, now: new Date('2026-12-01T12:00:00'), weekDone: 0 })).length, 0);
});

test('share moments: at most one card a week; the same card may repeat only on the day it was shown', () => {
  const now = new Date('2026-09-13T20:00:00');
  const weekly = base({ weekDone: 5, now });
  assert.equal(shareMoments(weekly)?.id, 'weeklyGoal');
  // Shown earlier today → the same card again (SessionComplete and the weekly card on one Sunday).
  assert.equal(shareMoments({ ...weekly, lastShareMomentAt: '2026-09-13T09:00:00', lastShareMomentId: 'weeklyGoal' })?.id, 'weeklyGoal');
  // Shown yesterday → not again this week, even though the goal is still met.
  assert.equal(shareMoments({ ...weekly, lastShareMomentAt: '2026-09-12T09:00:00', lastShareMomentId: 'weeklyGoal' }), null);
  // A different card within the cooldown is blocked …
  const drop = base({ thi: [{ date: '2026-09-01', total: 48 }, { date: '2026-09-13', total: 30 }], now, lastShareMomentAt: '2026-09-10T09:00:00', lastShareMomentId: 'firstWeekDone' });
  assert.equal(shareMoments(drop), null);
  // … and allowed once the cooldown has passed.
  const later = new Date(now.getTime() + SHARE_MOMENT_COOLDOWN_DAYS * 86_400_000);
  assert.equal(shareMoments({ ...drop, now: later })?.id, 'thiDrop');
  assert.equal(localDay(new Date('2026-09-13T20:00:00')), '2026-09-13');
});

// --- wording guard ---------------------------------------------------------------------------------

const pickKeys = (dict: Record<string, string>, prefixes: string[]) => Object.entries(dict).filter(([k]) => prefixes.some((p) => k.startsWith(p)));
const SHARE_PREFIXES = ['growth.moment.', 'growth.share.', 'growth.invite.', 'week.share', 'home.finished.'];

test('share copy (TR/EN) never uses treatment or cure language', () => {
  assert.ok(BANNED_SHARE_WORDS.length >= 5);
  assert.equal(findBannedShareWord('Bu uygulama tedavi eder'), 'tedavi');
  assert.equal(findBannedShareWord('My tinnitus is cured'), 'cured');
  assert.equal(findBannedShareWord('Çınlamam iyileşti'), 'iyileşti');
  assert.equal(findBannedShareWord('THI 48 → 36 · 12 puan azaldı'), null);
  for (const dict of [growthStrings.tr, growthStrings.en, coreStrings.tr, coreStrings.en] as Record<string, string>[]) {
    for (const [k, v] of pickKeys(dict, SHARE_PREFIXES)) {
      const hit = findBannedShareWord(v);
      assert.equal(hit, null, `${k}: "${hit}" in "${v}"`);
    }
  }
});

test('buildShareText carries only the user\'s numbers and no banned word; invite link carries only the code', () => {
  const stats = computeProgressStats({
    assessments: [{ id: 'a', date: '2026-09-01T10:00:00.000Z', questionnaires: [{ id: 'THI', date: '2026-09-01T10:00:00.000Z', total: 48, answers: [] }, { id: 'THI', date: '2026-09-29T10:00:00.000Z', total: 36, answers: [] }] }] as never,
    program: program(), diary: [], sessions: [],
  }, new Date('2026-09-29T12:00:00'));
  const labels = { appName: growthStrings.tr['app.name'] ?? 'Dingin', thi: growthStrings.tr['growth.share.card.thiShort'], week: growthStrings.tr['growth.share.card.weekLabel'], activeDays: growthStrings.tr['growth.share.card.activeDays'], footer: growthStrings.tr['growth.share.card.footer'], bandOf: (n: number) => thiBandKey(n), noThi: growthStrings.tr['growth.share.card.noThi'] };
  const text = buildShareText(stats, labels);
  assert.equal(findBannedShareWord(text), null, text);
  assert.match(text, /48/);
  assert.match(text, /36/);
  assert.equal(inviteLink('AB12 Z'), 'dingin://invite?from=AB12%20Z');
});
