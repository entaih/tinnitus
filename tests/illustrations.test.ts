import test from 'node:test';
import assert from 'node:assert/strict';
import { causeRegion } from '../src/components/illustrations/causeRegion.ts';
import { CAUSES } from '../src/clinical/causes.ts';

const expected: Record<string, string> = {
    noiseCochlear: 'ear/inner', presbycusis: 'ear/inner', ssnhl: 'ear/inner', meniere: 'ear/inner', ototoxic: 'ear/inner', sscd: 'ear/inner', traumaFistula: 'ear/inner',
    conductive: 'ear/middle', otosclerosis: 'ear/middle', myoclonus: 'ear/middle',
    retrocochlear: 'ear/nerve', central: 'ear/brain',
    somaticCervical: 'head/neck', somaticTmd: 'head/jaw', vascular: 'head/vessel', systemic: 'head/body',
    unknown: 'ear/brain',
};

test('causeRegion maps every cause id to the expected diagram region', () => {
  for (const [id, want] of Object.entries(expected)) {
    const r = causeRegion(id);
    assert.equal(`${r.diagram}/${r.highlight}`, want, id);
  }
});

test('every clinical CauseId has an explicit mapping', () => {
  for (const id of Object.keys(CAUSES)) {
    assert.ok(id in expected, `${id} missing from the illustration mapping`);
  }
});

test('unrecognised ids fall back to ear/brain', () => {
  assert.deepEqual(causeRegion('nope'), { diagram: 'ear', highlight: 'brain' });
  assert.deepEqual(causeRegion('toString'), { diagram: 'ear', highlight: 'brain' });
});
