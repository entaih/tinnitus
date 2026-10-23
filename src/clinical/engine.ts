/**
 * Triage + profile engine.
 * Decision rules follow NICE NG155 (2020) referral tiers, AAO-HNS 2014 / AAO-HNSF 2026 update red flags,
 * Cima et al. 2019 duration classes, and the subtyping literature (RaSST, Khalfa HQ, Sendesen 2024 RI rule).
 * The output is a *probable profile*, never a diagnosis.
 */
import type { Assessment, Driver, Phenotype, Profile, Recommendation, Triage } from './types';
import { scoreQuestionnaire, QUESTIONNAIRES, tfiBand } from './questionnaires';
import type { SeverityBand } from '@/theme/tokens';

export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export interface TriageResult { tier: Tier; triage: Triage; reasons: string[] }

function q(a: Assessment, id: keyof typeof QUESTIONNAIRES) {
  const r = a.questionnaires.find((x) => x.id === id);
  return r ? { ...r, ...scoreQuestionnaire(QUESTIONNAIRES[id], r.answers) } : null;
}

/** Interaural asymmetry on the screening audiogram: ≥15 dB at any frequency or ≥10 dB at two contiguous. */
export function hearingAsymmetry(a: Assessment): boolean {
  const h = a.hearing;
  if (!h) return false;
  const freqs = Array.from(new Set(h.thresholds.map((t) => t.freq))).sort((x, y) => x - y);
  const diff = freqs.map((f) => {
    const l = h.thresholds.find((t) => t.ear === 'left' && t.freq === f)?.levelDb;
    const r = h.thresholds.find((t) => t.ear === 'right' && t.freq === f)?.levelDb;
    return l != null && r != null ? Math.abs(l - r) : 0;
  });
  if (diff.some((d) => d >= 15)) return true;
  for (let i = 1; i < diff.length; i++) if (diff[i] >= 10 && diff[i - 1] >= 10) return true;
  return false;
}

/** Pure-tone average (0.5/1/2/4 kHz) of the worse ear, in screening dB. */
export function pta4(a: Assessment): number | null {
  const h = a.hearing;
  if (!h) return null;
  const ears: Array<'left' | 'right'> = ['left', 'right'];
  const avgs = ears.map((ear) => {
    const v = [500, 1000, 2000, 4000].map((f) => h.thresholds.find((t) => t.ear === ear && t.freq === f)?.levelDb).filter((x): x is number => x != null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  }).filter((x): x is number => x != null);
  return avgs.length ? Math.max(...avgs) : null;
}

/** 4–6 kHz notch ≥20 dB worse than 2 kHz and 8 kHz on either ear (noise-exposure pattern). */
export function noiseNotch(a: Assessment): boolean {
  const h = a.hearing;
  if (!h) return false;
  for (const ear of ['left', 'right'] as const) {
    const get = (f: number) => h.thresholds.find((t) => t.ear === ear && t.freq === f)?.levelDb;
    const n = Math.max(get(4000) ?? -99, get(6000) ?? -99);
    const a2 = get(2000), a8 = get(8000);
    if (a2 != null && a8 != null && n - a2 >= 20 && n - a8 >= 15) return true;
  }
  return false;
}

export function computeTriage(a: Assessment): TriageResult {
  const rf = a.redFlags;
  const phq = q(a, 'PHQ9');
  const gad = q(a, 'GAD7');
  const thi = q(a, 'THI');
  const reasons: string[] = [];

  const phqItem9 = phq ? (phq.answers[8] ?? 0) > 0 : false;
  if (rf?.selfHarm || phqItem9) return { tier: 0, triage: 'urgent', reasons: ['triage.selfHarm'] };
  if (rf?.neuroSigns) reasons.push('triage.neuro');
  if (rf?.vertigo) reasons.push('triage.vertigo');
  if (reasons.length) return { tier: 0, triage: 'urgent', reasons };

  if (rf?.suddenHearingLoss) return { tier: 1, triage: 'urgent', reasons: ['triage.suddenHL'] };

  const severeDistress = (thi && thi.total >= 58) || (phq && phq.total >= 20) || (gad && gad.total >= 15);
  if (severeDistress) reasons.push('triage.severeDistress');
  if (reasons.length) return { tier: 2, triage: 'urgent', reasons };

  if (rf?.pulsatile) reasons.push('triage.pulsatile');
  if (rf?.unilateralSymptoms || a.history?.side === 'left' || a.history?.side === 'right') reasons.push('triage.unilateral');
  if (rf?.otorrhoeaOrPain) reasons.push('triage.otorrhoea');
  if (rf?.headTrauma) reasons.push('triage.trauma');
  if (a.history?.ototoxicMeds) reasons.push('triage.ototoxic');
  if (a.history?.earFullness && a.history?.hearingDifficulty) reasons.push('triage.meniere');
  if (hearingAsymmetry(a)) reasons.push('triage.asymmetry');
  if (reasons.length) return { tier: 3, triage: 'audiology', reasons };

  const p = pta4(a);
  if ((p != null && p > 25) || a.history?.hearingDifficulty) reasons.push('triage.hearingLoss');
  if (a.history && a.history.onset !== 'lt3m' && !a.hearing) reasons.push('triage.neverTested');
  if (reasons.length) return { tier: 4, triage: 'audiology', reasons };

  return { tier: 5, triage: 'selfcare', reasons: ['triage.selfcare'] };
}

export function buildProfile(a: Assessment): Profile {
  const tri = computeTriage(a);
  const thi = q(a, 'THI');
  const hq = q(a, 'HQ');
  const phq = q(a, 'PHQ9');
  const gad = q(a, 'GAD7');
  const sci = q(a, 'SCI');
  const rasst = q(a, 'RASST');
  const h = a.history;
  const ps = a.psycho;

  let severityBand: SeverityBand = 'none';
  let severityScore: number | undefined;
  let severitySource: 'THI' | 'TFI' | undefined;
  if (thi) { severityBand = thi.band; severityScore = thi.total; severitySource = 'THI'; }

  const phenotypes: Phenotype[] = [];
  if (h) {
    phenotypes.push(h.onset === 'lt3m' ? 'acute' : 'chronic');
    if (h.character === 'tonal') phenotypes.push('tonal');
    if (h.character === 'hissing' || h.character === 'roaring' || h.character === 'buzzing') phenotypes.push('noiseLike');
    if (h.pattern === 'pulsatile' || a.redFlags?.pulsatile) phenotypes.push('pulsatile');
    if (h.side === 'left' || h.side === 'right') phenotypes.push('unilateral');
    if (h.noiseExposure || noiseNotch(a)) phenotypes.push('noiseInduced');
    if (h.ototoxicMeds) phenotypes.push('ototoxicSuspect');
    if (h.earFullness && h.hearingDifficulty) phenotypes.push('possibleMeniere');
  }
  const p = pta4(a);
  if ((p != null && p > 25) || h?.hearingDifficulty) phenotypes.push('hearingLossAssociated');
  if ((rasst && rasst.total >= 2) || h?.somaticModulation) phenotypes.push('somatosensory');
  if ((hq && hq.total >= 16) || (!hq && h?.soundSensitivity)) phenotypes.push('hyperacusis');

  const drivers: Driver[] = [];
  if (thi && thi.total >= 38) drivers.push('distress');
  if (gad && gad.total >= 10) drivers.push('anxiety');
  if (phq && phq.total >= 10) drivers.push('depression');
  if ((sci && sci.total <= 16) || (!sci && h?.sleepProblem)) drivers.push('insomnia');
  if (phenotypes.includes('hyperacusis')) drivers.push('hyperacusis');
  if (phenotypes.includes('somatosensory')) drivers.push('somatic');
  if (phenotypes.includes('hearingLossAssociated')) drivers.push('hearingLoss');
  if (thi && (thi.subscales.C ?? 0) >= 10) drivers.push('catastrophizing');
  if (thi && (thi.answers[0] ?? 0) + (thi.answers[17] ?? 0) >= 4) drivers.push('attention');

  const highDistress = [gad && gad.total >= 10, sci && sci.total <= 16, phq && phq.total >= 10, hq && hq.total >= 16].filter(Boolean).length >= 2;

  const recs: Recommendation[] = [];
  const add = (key: string, evidence: Recommendation['evidence'], citation: string, priority: Recommendation['priority']) => recs.push({ key, evidence, citation, priority });

  if (tri.tier === 0) add('rec.urgentCare', 'guideline', 'nice2020', 1);
  if (tri.tier === 1) add('rec.ent24h', 'guideline', 'chandrasekhar2019', 1);
  if (tri.tier === 2) add('rec.ent2w', 'guideline', 'nice2020', 1);
  if (tri.tier === 3) add('rec.entRoutine', 'guideline', 'tunkel2014', 1);
  if (tri.tier === 4) add('rec.audiology', 'guideline', 'tunkel2014', 1);
  if (drivers.includes('hearingLoss')) add('rec.hearingAids', 'guideline', 'tunkel2014', 2);
  if (thi && thi.total >= 18) add('rec.cbt', 'guideline', 'fuller2020', highDistress ? 1 : 2);
  if (highDistress) add('rec.clinicianCbt', 'guideline', 'nice2020', 1);
  if (ps?.riCategory === 'complete' || ps?.riCategory === 'partial') add('rec.soundFirst', 'rct', 'sendesen2024', 2);
  if (ps && ps.riCategory === 'none') add('rec.cbtFirst', 'rct', 'sendesen2024', 2);
  if (!ps && thi) add('rec.soundTherapy', 'guideline', 'sereda2018', 3);
  if (phenotypes.includes('tonal') && ps?.pitchHz) add('rec.notched', 'rct', 'okamoto2010', 3);
  if (drivers.includes('insomnia')) add('rec.cbti', 'rct', 'marks2023', 2);
  if (drivers.includes('hyperacusis')) add('rec.hyperacusis', 'expert', 'formby2015', 2);
  if (drivers.includes('somatic')) add('rec.somatic', 'rct', 'michiels2016', 2);
  if (phenotypes.includes('acute')) add('rec.acute', 'guideline', 'cima2019', 2);
  if (drivers.includes('anxiety') || drivers.includes('depression')) add('rec.mentalHealth', 'guideline', 'nice2020', 2);
  add('rec.education', 'guideline', 'tunkel2014', 3);
  add('rec.avoidSupplements', 'guideline', 'tunkel2014', 3);
  recs.sort((x, y) => x.priority - y.priority);

  const subtypes = phenotypes.map((ph) => `phenotype.${ph}`);

  return {
    triage: tri.triage,
    triageReasons: tri.reasons,
    severityScore,
    severityBand,
    severitySource,
    subtypes,
    phenotypes,
    drivers,
    recommendations: recs,
    doctorSummary: [],
  };
}

export { tfiBand };
export const tierOf = (a: Assessment) => computeTriage(a).tier;
