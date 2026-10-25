import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PROFILE_ID, MAX_PROFILES, activeProfile, addProfile, cleanProfileName, initialProfiles, removeProfile, renameProfile, storageKeyFor, storageKeysOf } from '../src/store/profileRules.ts';

test('storage keys: the default person keeps the legacy keys, others are suffixed', () => {
  assert.equal(storageKeyFor('dingin.clinical', DEFAULT_PROFILE_ID), 'dingin.clinical');
  assert.equal(storageKeyFor('dingin.clinical', 'pabc'), 'dingin.clinical.pabc');
  assert.deepEqual(storageKeysOf('pabc'), ['dingin.clinical.pabc', 'dingin.growth.pabc', 'dingin.moduleProgress.pabc']);
});

test('add: trims the name, refuses empty names and the limit', () => {
  const d0 = initialProfiles('Ayşe');
  const r = addProfile(d0, '  Mehmet   Yılmaz ', 'p1');
  assert.equal(r.id, 'p1');
  assert.equal(r.data.profiles[1].name, 'Mehmet Yılmaz');
  assert.equal(r.data.activeId, DEFAULT_PROFILE_ID, 'adding does not switch');
  assert.equal(addProfile(d0, '   ').id, null);
  let d = d0;
  for (let i = 1; i < MAX_PROFILES; i++) d = addProfile(d, `K${i}`, `k${i}`).data;
  assert.equal(d.profiles.length, MAX_PROFILES);
  assert.equal(addProfile(d, 'fazla').id, null);
  assert.equal(cleanProfileName('a'.repeat(100)).length, 40);
});

test('remove: last person cannot be removed; removing the active one switches to the first remaining', () => {
  const d0 = initialProfiles('Ayşe');
  assert.equal(removeProfile(d0, DEFAULT_PROFILE_ID).removed, false);
  const d1 = addProfile(d0, 'Can', 'p1').data;
  const r1 = removeProfile(d1, 'p1');
  assert.equal(r1.removed, true); assert.equal(r1.switched, false); assert.equal(r1.data.profiles.length, 1);
  const r2 = removeProfile({ ...d1, activeId: 'p1' }, 'p1');
  assert.equal(r2.switched, true); assert.equal(r2.data.activeId, DEFAULT_PROFILE_ID);
  assert.equal(removeProfile(d1, 'nope').removed, false);
});

test('rename and active lookup', () => {
  const d = addProfile(initialProfiles(''), 'Can', 'p1').data;
  assert.equal(renameProfile(d, 'p1', ' Canan ').profiles[1].name, 'Canan');
  assert.equal(renameProfile(d, 'p1', '  ').profiles[1].name, 'Can');
  assert.equal(activeProfile({ ...d, activeId: 'p1' }).id, 'p1');
  assert.equal(activeProfile({ ...d, activeId: 'ghost' }).id, DEFAULT_PROFILE_ID);
});
