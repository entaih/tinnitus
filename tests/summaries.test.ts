import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_LIST, getModule } from '../src/content/modules.ts';
import { SUMMARIES } from '../src/content/summaries.ts';
import { UNITS, unit } from '../src/content/registry.ts';

// PM sprint 2 §B3: every module has a 2-minute summary — 3 honest bullets per language, ≤ 140 characters each.

const CURE = /\btedavi eder\b|\bgeçer\b|\bgeçirir\b|\bcures?\b|\btreats\b|\bgoes away\b|\bdisappears\b/i;

test('every module (and every /mind/ unit in the registry) has a 3-bullet TR/EN summary, ≤ 140 chars, no cure claims', () => {
  const moduleUnits = Object.values(UNITS).filter((u) => u.route.startsWith('/mind/'));
  assert.ok(moduleUnits.length >= 29, `expected the 29+ scheduled modules, got ${moduleUnits.length}`);
  for (const u of moduleUnits) assert.ok(getModule(u.id), `unit ${u.id} has no module content`);
  for (const m of MODULE_LIST) {
    assert.ok(SUMMARIES[m.id], `${m.id} has no summary`);
    for (const lang of ['tr', 'en'] as const) {
      const bullets = m.summary[lang];
      assert.equal(bullets.length, 3, `${m.id} ${lang}: ${bullets.length} bullets`);
      for (const b of bullets) {
        assert.ok(b.trim().length > 0, `${m.id} ${lang}: empty bullet`);
        assert.ok(b.length <= 140, `${m.id} ${lang}: "${b.slice(0, 40)}…" is ${b.length} chars`);
        assert.ok(!CURE.test(b), `${m.id} ${lang}: cure claim in "${b}"`);
      }
    }
  }
  // No orphan summaries either.
  for (const id of Object.keys(SUMMARIES)) assert.ok(getModule(id), `summary for unknown module ${id}`);
});

test('B4: exercise.pmrShort resolves in the registry as a 6-minute exercise on the PMR screen', () => {
  const u = unit('exercise.pmrShort');
  assert.equal(u.type, 'exercise');
  assert.equal(u.minutes, 6);
  assert.equal(u.route, '/exercise/pmr?variant=short');
  assert.equal(u.citation, 'ost1987');
});
