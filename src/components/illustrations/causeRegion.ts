/** Pure mapping from a tinnitus cause id to the body region an illustration should highlight. No React imports. */

export type EarRegion = 'outer' | 'middle' | 'inner' | 'nerve' | 'brain';
export type HeadRegion = 'jaw' | 'neck' | 'vessel' | 'body';

export type CauseRegion =
  | { diagram: 'ear'; highlight: EarRegion }
  | { diagram: 'head'; highlight: HeadRegion };

const MAP: Record<string, CauseRegion> = {
  noiseCochlear: { diagram: 'ear', highlight: 'inner' },
  presbycusis: { diagram: 'ear', highlight: 'inner' },
  ssnhl: { diagram: 'ear', highlight: 'inner' },
  meniere: { diagram: 'ear', highlight: 'inner' },
  ototoxic: { diagram: 'ear', highlight: 'inner' },
  sscd: { diagram: 'ear', highlight: 'inner' },
  traumaFistula: { diagram: 'ear', highlight: 'inner' },
  conductive: { diagram: 'ear', highlight: 'middle' },
  otosclerosis: { diagram: 'ear', highlight: 'middle' },
  myoclonus: { diagram: 'ear', highlight: 'middle' },
  retrocochlear: { diagram: 'ear', highlight: 'nerve' },
  central: { diagram: 'ear', highlight: 'brain' },
  somaticCervical: { diagram: 'head', highlight: 'neck' },
  somaticTmd: { diagram: 'head', highlight: 'jaw' },
  vascular: { diagram: 'head', highlight: 'vessel' },
  systemic: { diagram: 'head', highlight: 'body' },
  unknown: { diagram: 'ear', highlight: 'brain' },
};

/** Which diagram and highlight to show for a cause id. Unrecognised ids fall back to the 'unknown' mapping (ear / brain). */
export function causeRegion(causeId: string): CauseRegion {
  return Object.prototype.hasOwnProperty.call(MAP, causeId) ? MAP[causeId] : MAP.unknown;
}
