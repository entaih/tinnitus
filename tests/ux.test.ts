import test from 'node:test';
import assert from 'node:assert/strict';
import { primaryBackground } from '../src/components/home/taskBudget.ts';
import type { ProgramTask } from '../src/clinical/types.ts';

const bg = (id: string): ProgramTask => ({ id, type: 'sound', minutes: 30, titleKey: `unit.${id}`, route: id === 'sleep.sound' ? '/sound/player?preset=sleep' : '/sound/player?preset=enrichment' });

test('one background sound at a time: sleep sound at night, daytime sound during the day', () => {
  const both = [bg('sleep.sound'), bg('sound.enrichment')];
  assert.deepEqual(primaryBackground(both, 22).map((x) => x.id), ['sleep.sound']);
  assert.deepEqual(primaryBackground(both, 3).map((x) => x.id), ['sleep.sound']);
  assert.deepEqual(primaryBackground(both, 10).map((x) => x.id), ['sound.enrichment']);
  assert.deepEqual(primaryBackground([bg('sleep.sound')], 10).map((x) => x.id), ['sleep.sound'], 'a single sound is always shown');
  assert.deepEqual(primaryBackground([], 10), []);
  // numbered sound steps (mixing point) are not background rows
  const mp: ProgramTask = { id: 'sound.mixingPoint', type: 'sound', minutes: 5, titleKey: 'x', route: '/sound/mixing-point' };
  assert.deepEqual(primaryBackground([mp], 10), []);
});

test('the most urgent referral wins; self-care only gives none', async () => {
  const { topReferral } = await import('../src/clinical/journey.ts');
  assert.equal(topReferral(['triage.selfcare']), null);
  assert.equal(topReferral([]), null);
  const r = topReferral(['triage.neverTested', 'triage.mentalHealth', 'triage.suddenHL']);
  assert.equal(r?.when, 'h24');
  assert.equal(r?.reason, 'triage.suddenHL');
  assert.equal(topReferral(['triage.selfHarm', 'triage.suddenHL'])?.when, 'now');
  assert.equal(topReferral(['triage.neverTested'])?.when, 'routine');
});
