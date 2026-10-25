import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONNAIRES, THI, THIS, THIS_ENABLED, THIS_ITEM_INDICES, scoreQuestionnaire } from '../src/clinical/questionnaires.ts';
import { consequencesOf } from '../src/clinical/consequences.ts';
import { DIARY_MAX_DAYS, SESSIONS_MAX, SESSION_DETAIL_MAX, pruneDiary, pruneForStorage, pruneSessions } from '../src/clinical/retention.ts';
import type { DiaryEntry } from '../src/clinical/types.ts';

test('THI-S (A4): defined as a 0–40 trend scale with no band, disabled until its 10 items are verified against Newman 2008', () => {
  assert.equal(THIS.id, 'THIS');
  assert.equal(THIS.max, 40);
  assert.equal(THIS.citation, 'newman2008');
  assert.equal(THIS.options, THI.options, 'same 0/2/4 response format as the THI');
  assert.equal(THIS_ENABLED, false);
  assert.equal(THIS_ITEM_INDICES, null);
  assert.equal(THIS.items.length, 0, 'no item text is shipped before verification');
  assert.equal(QUESTIONNAIRES.THIS, THIS);
  const s = scoreQuestionnaire(THIS, [4, 2, 0, 4]);
  assert.equal(s.band, 'none');
  assert.equal(s.key, 'this.trend');
  // Consequence lines give a trend only (never a band or a decision).
  assert.deepEqual(consequencesOf('THIS', { total: 18, answers: [] }, null).map((c) => c.key), ['consequence.this.first']);
  const trend = consequencesOf('THIS', { total: 14, answers: [] }, null, { id: 'THIS', date: '2026-10-01', answers: [], total: 18 });
  assert.equal(trend[0].key, 'consequence.this.trend');
  assert.deepEqual(trend[0].params, { prev: 18, now: 14, d: '−4' });
  assert.equal(trend[0].tone, 'info');
});

test('storage pruning (E11): sessions capped at 500 with detail ≤ 120 chars, diary at 730 days; everything else untouched', () => {
  assert.equal(SESSIONS_MAX, 500); assert.equal(SESSION_DETAIL_MAX, 120); assert.equal(DIARY_MAX_DAYS, 730);
  const sessions = Array.from({ length: 620 }, (_, i) => ({ id: `s${i}`, date: `2026-01-01T00:${String(i % 60).padStart(2, '0')}:00Z`, type: 'sound', minutes: 5, detail: i % 2 ? 'x'.repeat(300) : 'trial' }));
  const pruned = pruneSessions(sessions);
  assert.equal(pruned.length, 500);
  assert.equal(pruned[0].id, 's120', 'the newest 500 are kept');
  assert.equal(pruned[pruned.length - 1].id, 's619');
  assert.ok(pruned.every((s) => (s.detail?.length ?? 0) <= 120));
  assert.equal(pruned.find((s) => s.id === 's120')!.detail, 'trial', 'short details are left alone');
  const diary: DiaryEntry[] = Array.from({ length: 800 }, (_, i) => ({ date: `d${String(i).padStart(4, '0')}`, annoyance: 3, mood: 1 }));
  const d = pruneDiary(diary);
  assert.equal(d.length, 730);
  assert.equal(d[0].date, 'd0070');
  const small = diary.slice(0, 10);
  assert.equal(pruneDiary(small), small, 'short diaries are returned as they are');
  const all = pruneForStorage({ sessions, diary, program: null, readArticles: ['a'] });
  assert.equal(all.sessions.length, 500); assert.equal(all.diary.length, 730); assert.deepEqual(all.readArticles, ['a']); assert.equal(all.program, null);
});

test('SCI items carry their own answer wording; stems hold no parenthesised scale', async () => {
  const { SCI, SCI02, optionsFor } = await import('../src/clinical/questionnaires.ts');
  for (const q of [SCI, SCI02]) {
    q.items.forEach((it, i) => {
      assert.ok(!/\(\s*\d/.test(it.tr) && !/\(\s*\d/.test(it.en), `${q.id} item ${i + 1} still has the scale in the stem`);
      const opts = optionsFor(q, i);
      assert.equal(opts.length, 5);
      assert.deepEqual([...opts.map((o) => o.value)].sort(), [0, 1, 2, 3, 4]);
      assert.ok(opts.every((o) => !/^\d$/.test(o.tr)), 'options are words, not bare numbers');
    });
  }
  // Scoring is unchanged: best answers score 4 per item.
  assert.equal(SCI02.items.length, 2);
});
