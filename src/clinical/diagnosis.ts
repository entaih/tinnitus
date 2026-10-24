/**
 * Diagnostic engine ("Ön tanı"): criteria-based preliminary diagnosis with ICD-10 coding, certainty grading,
 * comorbid diagnoses, differential diagnoses that must be excluded, and a confirmation plan.
 *
 * Method: every candidate aetiology has REQUIRED, SUPPORTING and CONTRADICTING criteria evaluated on the
 * feature set extracted from the whole assessment (history, red flags, screening audiogram, psychoacoustics,
 * questionnaires, cause questions, phone tests). Certainty:
 *   high     — all required met, ≥2 supporting, no contradiction
 *   moderate — all required met, ≥1 supporting, no contradiction   (or required met with contradiction + ≥3 supporting)
 *   low      — required met only, or supporting only
 * The primary diagnosis is the mechanism-tier aetiology with the highest certainty (ties → cause score).
 * Must-exclude aetiologies (SSNHL, retrocochlear, vascular, Ménière, SSCD, fistula, myoclonus) become the
 * primary only when their certainty is high; otherwise they are listed as differentials requiring exclusion.
 * The base diagnosis is always tinnitus itself (H93.1), typed (subjective/objective/pulsatile, acute/chronic)
 * and graded (THI). Comorbid screen-positive diagnoses are coded separately.
 *
 * This is an investigational diagnostic output: it is designed to be validated in a clinical investigation
 * (sham-controlled, THI primary endpoint) and used under clinician verification until certified.
 */
import type { Assessment } from './types';
import { CAUSES, MUST_EXCLUDE, rankCauses, confirmatoryTests, type CauseId } from './causes';
import { hearingAsymmetry, noiseNotch, pta4Hl, computeTriage } from './engine';
import { scoreQuestionnaire, QUESTIONNAIRES } from './questionnaires';

export type Certainty = 'high' | 'moderate' | 'low';

export const ICD10: Record<CauseId, string> = {
  noiseCochlear: 'H83.3 + H90.3', presbycusis: 'H91.1', ssnhl: 'H91.2', meniere: 'H81.0', conductive: 'H61.2 / H65 / H69.8',
  otosclerosis: 'H80', ototoxic: 'H91.0', somaticCervical: 'M53.0 / M54.2', somaticTmd: 'M26.6', vascular: 'H93.A',
  systemic: 'D64.9 / E05 / I10', retrocochlear: 'D33.3', myoclonus: 'G25.3', sscd: 'H83.8', traumaFistula: 'H83.8 / S09.3', central: 'H93.1',
};

export type FeatureKey =
  | 'suddenHL' | 'rapidWorsening' | 'unilateral' | 'bilateral' | 'asymmetry' | 'pulsatile' | 'pulsatileUrgent' | 'vertigoAttacks' | 'fullness'
  | 'fluctuating' | 'lowPitch' | 'highPitch' | 'noiseExposure' | 'notch' | 'loudEventOnset' | 'hearingLoss' | 'older' | 'ototoxicMeds'
  | 'somaticModulation' | 'rasstPositive' | 'somaticTestPositive' | 'neckPain' | 'jawPain' | 'bruxism' | 'autophony' | 'soundInducedDizzy'
  | 'clicking' | 'objectiveSound' | 'trauma' | 'blockedAfterCold' | 'pressureRelief' | 'otorrhoea' | 'betterInNoise' | 'familyEarlyHL'
  | 'progressiveYoung' | 'palpitations' | 'highBp' | 'imbalance' | 'neckModulates' | 'normalScreen' | 'chronic' | 'acute' | 'stress' | 'distress' | 'hyperacusis' | 'insomnia';

export type Features = Record<FeatureKey, boolean>;

export function extractFeatures(a: Assessment): Features {
  const h = a.history; const rf = a.redFlags; const q = a.causeAnswers ?? {}; const ps = a.psycho; const ex = a.exam;
  const get = (id: keyof typeof QUESTIONNAIRES) => { const r = a.questionnaires.find((x) => x.id === id); return r ? scoreQuestionnaire(QUESTIONNAIRES[id], r.answers) : null; };
  const rasst = get('RASST'); const hq = get('HQ'); const gad = get('GAD7'); const phq = get('PHQ9'); const sci = get('SCI');
  const hl = pta4Hl(a);
  const unilateral = h?.side === 'left' || h?.side === 'right' || !!rf?.unilateralSymptoms;
  const hearingLoss = (hl != null && hl > 25) || !!h?.hearingDifficulty;
  const older = !!q.ageOver60 || (h?.age != null && h.age >= 60);
  const lowPitch = ps?.pitchHz != null ? ps.pitchHz < 1000 : h?.character === 'roaring' || h?.character === 'buzzing';
  const highPitch = ps?.pitchHz != null ? ps.pitchHz >= 3000 : h?.character === 'tonal' || h?.character === 'hissing';
  return {
    suddenHL: !!rf?.suddenHearingLoss, rapidWorsening: !!rf?.rapidWorsening, unilateral, bilateral: h?.side === 'both' || h?.side === 'head',
    asymmetry: a.hearing?.mode !== 'both' && hearingAsymmetry(a), pulsatile: !!rf?.pulsatile,
    pulsatileUrgent: !!rf?.pulsatile && (!!rf.pulsatileHeadacheVisual || !!rf.pulsatileNewUnilateral),
    vertigoAttacks: !!rf?.menierePattern || !!q.vertigoEpisodes || !!rf?.vertigo, fullness: !!h?.earFullness, fluctuating: !!q.hearingFluctuates,
    lowPitch, highPitch, noiseExposure: !!h?.noiseExposure, notch: noiseNotch(a), loudEventOnset: !!q.loudEventOnset, hearingLoss, older,
    ototoxicMeds: !!h?.ototoxicMeds || !!rf?.newOtotoxicDrug || !!q.highDoseMeds,
    somaticModulation: !!h?.somaticModulation, rasstPositive: !!rasst && rasst.total >= 2, somaticTestPositive: ex?.somaticPositive === true,
    neckPain: !!q.neckPainTrauma || !!h?.neckOrJawPain, jawPain: !!q.jawPainClick, bruxism: !!rasst && (a.questionnaires.find((x) => x.id === 'RASST')?.answers[3] ?? 0) > 0,
    autophony: !!q.autophony, soundInducedDizzy: !!q.soundInducedDizzy, clicking: !!q.clicking || h?.character === 'clicking', objectiveSound: !!rf?.objectiveSound,
    trauma: !!rf?.headTrauma || !!q.barotrauma, blockedAfterCold: !!q.blockedAfterCold, pressureRelief: !!ex?.valsalvaPop || !!ex?.fullnessRelief,
    otorrhoea: !!rf?.otorrhoeaOrPain, betterInNoise: !!q.betterInNoise, familyEarlyHL: !!q.familyEarlyHL,
    progressiveYoung: hearingLoss && !older && h?.onset !== 'lt3m', palpitations: !!q.palpitationsFatigue, highBp: !!q.highBp, imbalance: !!q.imbalanceUnilateral,
    neckModulates: !!q.neckModulates || (!!ex?.headTurnChange && ex.headTurnChange !== 'same') || ex?.positionalChange === true,
    normalScreen: hl != null && hl <= 25, chronic: h?.onset === '1to5y' || h?.onset === 'gt5y' || h?.onset === '3to12m', acute: h?.onset === 'lt3m',
    stress: !!h?.stressWorsens, distress: (!!gad && gad.total >= 10) || (!!phq && phq.total >= 10),
    hyperacusis: (!!hq && hq.total >= 16) || !!h?.soundSensitivity, insomnia: (!!sci && sci.total <= 16) || !!h?.sleepProblem,
  };
}

interface Criteria { required: FeatureKey[][]; supporting: FeatureKey[]; contradicting: FeatureKey[] }
/** required = list of OR-groups, every group must have at least one true feature */
export const CRITERIA: Record<CauseId, Criteria> = {
  noiseCochlear: { required: [['noiseExposure', 'loudEventOnset']], supporting: ['notch', 'highPitch', 'hearingLoss', 'bilateral'], contradicting: ['suddenHL'] },
  presbycusis: { required: [['older']], supporting: ['hearingLoss', 'bilateral', 'highPitch', 'chronic'], contradicting: ['suddenHL', 'unilateral'] },
  ssnhl: { required: [['suddenHL']], supporting: ['unilateral', 'acute', 'fullness'], contradicting: [] },
  meniere: { required: [['vertigoAttacks']], supporting: ['fullness', 'fluctuating', 'lowPitch', 'unilateral', 'hearingLoss'], contradicting: [] },
  conductive: { required: [['blockedAfterCold', 'fullness', 'pressureRelief', 'otorrhoea']], supporting: ['autophony', 'lowPitch', 'pressureRelief', 'blockedAfterCold'], contradicting: ['notch'] },
  otosclerosis: { required: [['hearingLoss']], supporting: ['betterInNoise', 'familyEarlyHL', 'progressiveYoung', 'lowPitch'], contradicting: ['suddenHL', 'older'] },
  ototoxic: { required: [['ototoxicMeds']], supporting: ['bilateral', 'highPitch', 'hearingLoss', 'acute'], contradicting: [] },
  somaticCervical: { required: [['somaticModulation', 'rasstPositive', 'somaticTestPositive']], supporting: ['neckPain', 'normalScreen', 'unilateral'], contradicting: [] },
  somaticTmd: { required: [['somaticModulation', 'rasstPositive', 'somaticTestPositive']], supporting: ['jawPain', 'bruxism', 'normalScreen'], contradicting: [] },
  vascular: { required: [['pulsatile']], supporting: ['neckModulates', 'unilateral', 'pulsatileUrgent'], contradicting: [] },
  systemic: { required: [['palpitations', 'highBp']], supporting: ['pulsatile', 'bilateral'], contradicting: [] },
  retrocochlear: { required: [['unilateral', 'asymmetry']], supporting: ['asymmetry', 'imbalance', 'hearingLoss', 'unilateral'], contradicting: [] },
  myoclonus: { required: [['clicking', 'objectiveSound']], supporting: ['clicking', 'objectiveSound'], contradicting: [] },
  sscd: { required: [['soundInducedDizzy', 'autophony']], supporting: ['soundInducedDizzy', 'autophony'], contradicting: [] },
  traumaFistula: { required: [['trauma']], supporting: ['fluctuating', 'soundInducedDizzy', 'vertigoAttacks', 'acute'], contradicting: [] },
  central: { required: [], supporting: ['normalScreen', 'stress', 'distress', 'chronic', 'bilateral'], contradicting: [] },
};

export interface DxEntry {
  id: CauseId;
  icd: string;
  certainty: Certainty;
  met: FeatureKey[];          // criteria met (required + supporting)
  missing: FeatureKey[];      // supporting criteria not met (what would raise certainty)
  contradictions: FeatureKey[];
  requiredMet: boolean;
  mustExclude: boolean;
}

export interface Diagnosis {
  /** base diagnosis of the symptom itself */
  base: { icd: 'H93.1'; type: 'subjective' | 'objective' | 'pulsatile'; course: 'acute' | 'subacute' | 'chronic' | 'unknown'; severityBand?: string; thi?: number };
  primary: DxEntry | null;
  secondary: DxEntry[];             // other mechanism-tier aetiologies with ≥ moderate certainty
  differentials: DxEntry[];         // must-exclude aetiologies with any criterion met (not primary)
  comorbid: { key: string; icd: string }[];   // screen-positive comorbidities
  confirmation: string[];           // test.* keys
  triageTier: number;
  features: Features;
}

function evaluate(id: CauseId, f: Features): DxEntry {
  const c = CRITERIA[id];
  const requiredMet = c.required.every((group) => group.some((k) => f[k]));
  const reqMetKeys = c.required.flatMap((g) => g.filter((k) => f[k]));
  const supMet = c.supporting.filter((k) => f[k]);
  const missing = c.supporting.filter((k) => !f[k]);
  const contradictions = c.contradicting.filter((k) => f[k]);
  let certainty: Certainty = 'low';
  if (requiredMet && c.required.length > 0) {
    if (contradictions.length === 0 && supMet.length >= 2) certainty = 'high';
    else if ((contradictions.length === 0 && supMet.length >= 1) || supMet.length >= 3) certainty = 'moderate';
  } else if (c.required.length === 0) {
    certainty = supMet.length >= 3 ? 'high' : supMet.length >= 2 ? 'moderate' : 'low';
  }
  return { id, icd: ICD10[id], certainty, met: Array.from(new Set([...reqMetKeys, ...supMet])), missing, contradictions, requiredMet, mustExclude: MUST_EXCLUDE.includes(id) };
}

const RANK: Record<Certainty, number> = { high: 3, moderate: 2, low: 1 };

export function diagnose(a: Assessment): Diagnosis {
  const f = extractFeatures(a);
  const ranked = rankCauses(a);
  const scoreOf = (id: CauseId) => ranked.find((r) => r.id === id)?.score ?? -99;
  const entries = (Object.keys(CAUSES) as CauseId[]).map((id) => evaluate(id, f));

  const mechanisms = entries.filter((e) => !e.mustExclude && (e.requiredMet || e.id === 'central') && e.met.length > 0);
  const excludes = entries.filter((e) => e.mustExclude && e.met.length > 0);
  const byStrength = (x: DxEntry, y: DxEntry) => RANK[y.certainty] - RANK[x.certainty] || scoreOf(y.id) - scoreOf(x.id);
  mechanisms.sort(byStrength); excludes.sort(byStrength);

  // A must-exclude aetiology with HIGH certainty is the primary diagnosis (e.g. sudden SNHL, Ménière with full criteria).
  const strongExclude = excludes.find((e) => e.certainty === 'high');
  let primary: DxEntry | null = strongExclude ?? mechanisms.find((m) => m.id !== 'central' && RANK[m.certainty] >= 2) ?? null;
  if (!primary) {
    const central = entries.find((e) => e.id === 'central')!;
    // Primary/central tinnitus is a diagnosis of exclusion: certainty capped at moderate until the screen is clean.
    primary = { ...central, certainty: f.normalScreen && excludes.length === 0 ? 'moderate' : 'low' };
  }
  const secondary = mechanisms.filter((m) => m.id !== primary!.id && m.id !== 'central' && RANK[m.certainty] >= 2);
  const differentials = excludes.filter((e) => e.id !== primary!.id);

  const comorbid: Diagnosis['comorbid'] = [];
  if (f.hearingLoss && primary.id !== 'noiseCochlear' && primary.id !== 'presbycusis' && primary.id !== 'ssnhl') comorbid.push({ key: 'dx.comorbid.hearingLoss', icd: f.unilateral ? 'H90.4' : 'H90.3' });
  if (f.hyperacusis) comorbid.push({ key: 'dx.comorbid.hyperacusis', icd: 'H93.23' });
  if (f.insomnia) comorbid.push({ key: 'dx.comorbid.insomnia', icd: 'G47.0' });
  const gad = a.questionnaires.find((x) => x.id === 'GAD7'); const phq = a.questionnaires.find((x) => x.id === 'PHQ9');
  if (gad && gad.total >= 10) comorbid.push({ key: 'dx.comorbid.anxiety', icd: 'F41.1' });
  if (phq && phq.total >= 10) comorbid.push({ key: 'dx.comorbid.depression', icd: 'F32.A' });
  if (f.somaticModulation || f.rasstPositive) comorbid.push({ key: 'dx.comorbid.somatic', icd: 'H93.1 (somatosensoriyel)' });

  const thi = a.questionnaires.find((x) => x.id === 'THI');
  const thiScored = thi ? scoreQuestionnaire(QUESTIONNAIRES.THI, thi.answers) : null;
  const onset = a.history?.onset;
  const course: Diagnosis['base']['course'] = onset === 'lt3m' ? 'acute' : onset === '3to12m' ? 'subacute' : onset ? 'chronic' : 'unknown';
  const type: Diagnosis['base']['type'] = f.pulsatile ? 'pulsatile' : f.objectiveSound || f.clicking ? 'objective' : 'subjective';

  const confirmation = confirmatoryTests([...(primary ? [{ ...ranked.find((r) => r.id === primary!.id)!, tier: 'mechanism' as const }] : []), ...ranked.filter((r) => differentials.some((d) => d.id === r.id)).map((r) => ({ ...r, tier: 'exclude' as const })), ...ranked.filter((r) => secondary.some((d) => d.id === r.id))], 3);

  return {
    base: { icd: 'H93.1', type, course, severityBand: thiScored?.band, thi: thiScored?.total },
    primary, secondary, differentials, comorbid, confirmation, triageTier: computeTriage(a).tier, features: f,
  };
}

/** One-sentence diagnostic statement (localised via t). */
export function diagnosisStatement(d: Diagnosis, t: (k: string, p?: Record<string, string | number>) => string): string {
  const typeKey = `dx.type.${d.base.type}`; const courseKey = `dx.course.${d.base.course}`;
  const sev = d.base.severityBand ? t('dx.severity', { band: t(`severity.${d.base.severityBand}`), thi: d.base.thi ?? '' }) : t('dx.severity.unknown');
  const primaryName = d.primary ? `${t(`cause.${d.primary.id}.name`)} (${d.primary.icd})` : t('cause.central.name');
  return t('dx.statement', { course: t(courseKey), type: t(typeKey), primary: primaryName, certainty: t(`dx.certainty.${d.primary?.certainty ?? 'low'}`), severity: sev });
}
