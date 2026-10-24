/**
 * Cause analysis ("Neden analizi"): ranks candidate mechanisms of tinnitus from everything the app knows.
 *
 * Each cause carries the anatomical site, the mechanism, the test that confirms it, the clinician who orders it,
 * and whether it is curable / treatable / manageable. Scores are additive log-odds-style weights; the output is a
 * ranked list with a normalised confidence. This is decision support for the clinician visit, never a diagnosis.
 *
 * Feature weights are derived from the clinical pattern descriptions in: Tunkel 2014 / Adams 2026 (AAO-HNS),
 * NICE NG155, Cima 2019, Chandrasekhar 2019 (SSNHL), Lopez-Escamez 2015 (Ménière criteria), Michiels 2018/2022
 * (somatosensory), Basura 2020 (Ménière guideline), and standard otology texts for conductive, otosclerosis,
 * SSCD, vascular and ototoxic patterns.
 */
import type { Assessment } from './types';
import { hearingAsymmetry, noiseNotch, pta4 } from './engine';

export type CauseId =
  | 'noiseCochlear' | 'presbycusis' | 'ssnhl' | 'meniere' | 'conductive' | 'otosclerosis' | 'ototoxic'
  | 'somaticCervical' | 'somaticTmd' | 'vascular' | 'systemic' | 'retrocochlear' | 'myoclonus' | 'sscd'
  | 'traumaFistula' | 'central';

export type Curability = 'curable' | 'treatable' | 'manageable';

export interface CauseDef {
  id: CauseId;
  /** anatomical level: outer/middle ear, cochlea, nerve, brain, vascular, musculoskeletal, systemic */
  level: 'outer' | 'middle' | 'cochlea' | 'nerve' | 'brain' | 'vascular' | 'musculoskeletal' | 'systemic';
  curability: Curability;
  /** who confirms it */
  who: string;            // i18n key who.*
  /** education article slug with the full explanation */
  article?: string;
  prior: number;          // baseline log-odds
}

export const CAUSES: Record<CauseId, CauseDef> = {
  noiseCochlear: { id: 'noiseCochlear', level: 'cochlea', curability: 'manageable', who: 'who.audiology', article: 'hearing-protection', prior: 0.6 },
  presbycusis: { id: 'presbycusis', level: 'cochlea', curability: 'treatable', who: 'who.audiology', article: 'hearing-aids', prior: 0.2 },
  ssnhl: { id: 'ssnhl', level: 'cochlea', curability: 'treatable', who: 'who.ent', article: 'acute-tinnitus', prior: -2.5 },
  meniere: { id: 'meniere', level: 'cochlea', curability: 'treatable', who: 'who.ent', article: 'menieres', prior: -2.0 },
  conductive: { id: 'conductive', level: 'middle', curability: 'curable', who: 'who.ent', article: 'when-to-see-a-doctor', prior: -1.0 },
  otosclerosis: { id: 'otosclerosis', level: 'middle', curability: 'curable', who: 'who.ent', article: 'hearing-aids', prior: -2.2 },
  ototoxic: { id: 'ototoxic', level: 'cochlea', curability: 'treatable', who: 'who.prescriber', article: 'meds-and-tinnitus', prior: -2.2 },
  somaticCervical: { id: 'somaticCervical', level: 'musculoskeletal', curability: 'treatable', who: 'who.physio', article: 'somatosensory', prior: -0.8 },
  somaticTmd: { id: 'somaticTmd', level: 'musculoskeletal', curability: 'treatable', who: 'who.dentist', article: 'somatosensory', prior: -1.0 },
  vascular: { id: 'vascular', level: 'vascular', curability: 'curable', who: 'who.entImaging', article: 'pulsatile-tinnitus', prior: -3.0 },
  systemic: { id: 'systemic', level: 'systemic', curability: 'curable', who: 'who.gp', article: 'pulsatile-tinnitus', prior: -2.0 },
  retrocochlear: { id: 'retrocochlear', level: 'nerve', curability: 'treatable', who: 'who.entImaging', article: 'when-to-see-a-doctor', prior: -3.5 },
  myoclonus: { id: 'myoclonus', level: 'middle', curability: 'treatable', who: 'who.ent', article: 'when-to-see-a-doctor', prior: -3.5 },
  sscd: { id: 'sscd', level: 'middle', curability: 'curable', who: 'who.entImaging', article: 'when-to-see-a-doctor', prior: -3.5 },
  traumaFistula: { id: 'traumaFistula', level: 'cochlea', curability: 'treatable', who: 'who.ent', article: 'when-to-see-a-doctor', prior: -3.5 },
  central: { id: 'central', level: 'brain', curability: 'manageable', who: 'who.entPsych', article: 'habituation', prior: 0.3 },
};

/** Extra questions. Each is asked only when `when` is true for the current data, so most users see 5–9 items. */
export interface CauseQuestion { id: string; when: (a: Assessment) => boolean }

const h = (a: Assessment) => a.history;
export const CAUSE_QUESTIONS: CauseQuestion[] = [
  { id: 'ageOver60', when: (a) => !h(a)?.age },
  { id: 'autophony', when: () => true },                                        // own voice/breathing loud, echo
  { id: 'blockedAfterCold', when: () => true },                                 // fullness, popping, recent cold/flight
  { id: 'hearingFluctuates', when: (a) => !!(h(a)?.hearingDifficulty || h(a)?.earFullness) },
  { id: 'betterInNoise', when: (a) => !!h(a)?.hearingDifficulty },             // paracusis Willisii
  { id: 'familyEarlyHL', when: (a) => !!h(a)?.hearingDifficulty },
  { id: 'vertigoEpisodes', when: (a) => !a.redFlags?.vertigo },                 // 20 min–12 h attacks
  { id: 'soundInducedDizzy', when: () => true },                                // Tullio / pressure-induced
  { id: 'clicking', when: (a) => h(a)?.character === 'clicking' || h(a)?.character === 'multiple' || !h(a) },
  { id: 'neckModulates', when: (a) => !!a.redFlags?.pulsatile },               // pulsatile changes with neck pressure/head turn
  { id: 'palpitationsFatigue', when: (a) => !!a.redFlags?.pulsatile || h(a)?.side === 'both' || h(a)?.side === 'head' },
  { id: 'highBp', when: () => true },
  { id: 'jawPainClick', when: (a) => !!(h(a)?.somaticModulation || h(a)?.neckOrJawPain) },
  { id: 'neckPainTrauma', when: (a) => !!(h(a)?.somaticModulation || h(a)?.neckOrJawPain) },
  { id: 'loudEventOnset', when: (a) => !!h(a)?.noiseExposure || h(a)?.onset === 'lt3m' },
  { id: 'barotrauma', when: () => true },                                       // diving/flying/straining/head injury onset
  { id: 'highDoseMeds', when: (a) => !h(a)?.ototoxicMeds },
  { id: 'imbalanceUnilateral', when: (a) => h(a)?.side === 'left' || h(a)?.side === 'right' || !!a.redFlags?.unilateralSymptoms },
];

/** Causes a clinician must actively exclude whenever any clue is present; they are listed first, without a probability. */
export const MUST_EXCLUDE: CauseId[] = ['ssnhl', 'retrocochlear', 'vascular', 'meniere', 'sscd', 'traumaFistula', 'myoclonus'];

export interface CauseScore {
  id: CauseId;
  score: number;
  /** strength of the clues for this cause (not a diagnostic probability) */
  confidence: 'high' | 'medium' | 'low';
  /** relative weight among candidates, 0–100 — for internal ordering only, not shown as a probability */
  pct: number;
  evidence: string[];
  /** 'exclude' = must be ruled out by a clinician (any clue present); 'mechanism' = possible mechanism */
  tier: 'exclude' | 'mechanism';
}

/** Rank causes from the merged assessment (+ optional answers to CAUSE_QUESTIONS). */
export function rankCauses(a: Assessment): CauseScore[] {
  const q = a.causeAnswers ?? {};
  const hist = a.history;
  const rf = a.redFlags;
  const ps = a.psycho;
  const s: Record<CauseId, number> = Object.fromEntries(Object.values(CAUSES).map((c) => [c.id, c.prior])) as Record<CauseId, number>;
  const ev = Object.fromEntries(Object.keys(CAUSES).map((k) => [k, [] as string[]])) as unknown as Record<CauseId, string[]>;
  const add = (id: CauseId, w: number, key: string) => { s[id] += w; if (w > 0) ev[id].push(key); };

  const pta = pta4(a);
  const notch = noiseNotch(a);
  const asym = hearingAsymmetry(a);
  const unilateral = hist?.side === 'left' || hist?.side === 'right' || !!rf?.unilateralSymptoms;
  const lowPitch = ps?.pitchHz != null ? ps.pitchHz < 1000 : hist?.character === 'roaring' || hist?.character === 'buzzing';
  const highPitch = ps?.pitchHz != null ? ps.pitchHz >= 3000 : hist?.character === 'tonal' || hist?.character === 'hissing';
  const hearingLoss = (pta != null && pta > 25) || !!hist?.hearingDifficulty;
  const older = !!q.ageOver60 || (hist?.age != null && hist.age >= 60);

  // Cochlear: noise
  if (hist?.noiseExposure) add('noiseCochlear', 1.4, 'ev.noiseExposure');
  if (notch) add('noiseCochlear', 1.6, 'ev.notch');
  if (q.loudEventOnset) add('noiseCochlear', 1.2, 'ev.loudEventOnset');
  if (highPitch) add('noiseCochlear', 0.5, 'ev.highPitch');
  if (hearingLoss) add('noiseCochlear', 0.4, 'ev.hearingLoss');
  // Presbycusis
  if (older) add('presbycusis', 1.6, 'ev.age');
  if (older && hearingLoss) add('presbycusis', 1.0, 'ev.hearingLoss');
  if (hist?.side === 'both' && older) add('presbycusis', 0.5, 'ev.bilateral');
  if (highPitch && older) add('presbycusis', 0.4, 'ev.highPitch');
  // SSNHL
  if (rf?.suddenHearingLoss) add('ssnhl', 4.0, 'ev.suddenHL');
  if (hist?.onset === 'lt3m' && unilateral) add('ssnhl', 0.6, 'ev.recentUnilateral');
  // Ménière
  if (q.vertigoEpisodes || rf?.vertigo) add('meniere', 2.0, 'ev.vertigoEpisodes');
  if (hist?.earFullness) add('meniere', 1.2, 'ev.fullness');
  if (q.hearingFluctuates) add('meniere', 1.4, 'ev.fluctuating');
  if (lowPitch && unilateral) add('meniere', 0.8, 'ev.lowPitchUnilateral');
  // Conductive (wax, effusion, Eustachian tube)
  if (q.blockedAfterCold) add('conductive', 2.0, 'ev.blockedAfterCold');
  if (q.autophony) add('conductive', 1.0, 'ev.autophony');
  if (hist?.earFullness) add('conductive', 0.8, 'ev.fullness');
  if (rf?.otorrhoeaOrPain) add('conductive', 1.2, 'ev.otorrhoea');
  if (lowPitch) add('conductive', 0.4, 'ev.lowPitch');
  // Otosclerosis
  if (q.betterInNoise) add('otosclerosis', 2.2, 'ev.betterInNoise');
  if (q.familyEarlyHL) add('otosclerosis', 1.4, 'ev.familyEarlyHL');
  if (hearingLoss && !older && hist?.onset !== 'lt3m') add('otosclerosis', 0.8, 'ev.progressiveYoung');
  if (lowPitch) add('otosclerosis', 0.4, 'ev.lowPitch');
  // Ototoxic
  if (hist?.ototoxicMeds || q.highDoseMeds) add('ototoxic', 2.8, 'ev.meds');
  if ((hist?.ototoxicMeds || q.highDoseMeds) && hist?.side === 'both') add('ototoxic', 0.6, 'ev.bilateral');
  // Somatosensory
  const rasst = a.questionnaires.find((x) => x.id === 'RASST');
  if (hist?.somaticModulation) { add('somaticCervical', 1.5, 'ev.modulation'); add('somaticTmd', 1.2, 'ev.modulation'); }
  if (rasst && rasst.total >= 2) { add('somaticCervical', 1.2, 'ev.rasst'); add('somaticTmd', 1.0, 'ev.rasst'); }
  if (q.neckPainTrauma) add('somaticCervical', 1.6, 'ev.neckPainTrauma');
  if (q.jawPainClick) add('somaticTmd', 1.8, 'ev.jawPainClick');
  if (rasst && (rasst.answers[3] ?? 0) > 0) add('somaticTmd', 0.8, 'ev.bruxism');
  if (!hearingLoss && (hist?.somaticModulation || q.neckPainTrauma || q.jawPainClick)) { add('somaticCervical', 0.4, 'ev.normalHearing'); add('somaticTmd', 0.4, 'ev.normalHearing'); }
  // Vascular pulsatile
  if (rf?.pulsatile) add('vascular', 3.2, 'ev.pulsatile');
  if (q.neckModulates) add('vascular', 1.4, 'ev.neckModulates');
  if (rf?.pulsatile && unilateral) add('vascular', 0.6, 'ev.unilateral');
  // Systemic (anaemia, thyroid, hypertension)
  if (q.palpitationsFatigue) add('systemic', 1.6, 'ev.palpitationsFatigue');
  if (q.highBp) add('systemic', 1.2, 'ev.highBp');
  if (rf?.pulsatile && hist?.side === 'both') add('systemic', 1.0, 'ev.pulsatileBilateral');
  // Retrocochlear
  if (unilateral) add('retrocochlear', 1.0, 'ev.unilateral');
  if (asym) add('retrocochlear', 1.6, 'ev.asymmetry');
  if (q.imbalanceUnilateral) add('retrocochlear', 1.4, 'ev.imbalance');
  if (unilateral && hearingLoss) add('retrocochlear', 0.6, 'ev.hearingLoss');
  // Myoclonus
  if (q.clicking || hist?.character === 'clicking') add('myoclonus', 3.0, 'ev.clicking');
  // SSCD / third window
  if (q.soundInducedDizzy) add('sscd', 2.2, 'ev.soundInducedDizzy');
  if (q.autophony) add('sscd', 1.4, 'ev.autophony');
  // Trauma / fistula
  if (q.barotrauma || rf?.headTrauma) add('traumaFistula', 2.4, 'ev.barotrauma');
  if ((q.barotrauma || rf?.headTrauma) && (q.soundInducedDizzy || rf?.vertigo)) add('traumaFistula', 1.0, 'ev.pressureVertigo');
  // Central / primary
  if (!hearingLoss && pta != null) add('central', 1.0, 'ev.normalScreen');
  if (hist?.stressWorsens) add('central', 0.6, 'ev.stress');
  if (hist?.side === 'both' || hist?.side === 'head') add('central', 0.5, 'ev.bilateral');
  if (hist?.pattern === 'constant') add('central', 0.3, 'ev.constant');
  const gad = a.questionnaires.find((x) => x.id === 'GAD7'); const phq = a.questionnaires.find((x) => x.id === 'PHQ9');
  if ((gad && gad.total >= 10) || (phq && phq.total >= 10)) add('central', 0.5, 'ev.distress');
  if (hist?.onset === 'gt5y' || hist?.onset === '1to5y') add('central', 0.3, 'ev.chronic');

  // Self-examination battery (phone-only tests)
  const ex = a.exam;
  if (ex) {
    // Digits-in-noise with TTS is uncalibrated and unnormed in Turkish: a weak clue only (audiology/physician reviews).
    if (ex.dinPassed === false && !hearingLoss) { add('noiseCochlear', 0.3, 'ev.dinFailNormalPta'); add('central', 0.2, 'ev.dinFailNormalPta'); }
    if (ex.dinPassed === false && hearingLoss) { add('presbycusis', 0.3, 'ev.dinFail'); add('noiseCochlear', 0.3, 'ev.dinFail'); }
    if (ex.valsalvaPop || ex.fullnessRelief) add('conductive', 1.6, 'ev.pressureRelief');
    if (ex.jugularChange === 'quieter' || ex.jugularChange === 'louder') add('vascular', 1.8, 'ev.jugularChange');
    if (ex.headTurnChange === 'quieter' || ex.headTurnChange === 'louder') add('vascular', 1.0, 'ev.headTurnChange');
    // Accelerometer sway has no validated threshold: recorded for the clinician, not scored.
    if (ex.somaticPositive) { add('somaticCervical', 1.4, 'ev.somaticTest'); add('somaticTmd', 1.2, 'ev.somaticTest'); }
    if (ex.somaticPositive === false) { add('somaticCervical', -0.8, ''); add('somaticTmd', -0.8, ''); }
  }

  // Normalise to a pseudo-probability over the candidate set (softmax on log-odds)
  const ids = Object.keys(s) as CauseId[];
  const max = Math.max(...ids.map((i) => s[i]));
  const exps = ids.map((i) => Math.exp(s[i] - max));
  const sum = exps.reduce((x, y) => x + y, 0);
  const scored = ids.map((id, k) => {
    const pct = Math.round((exps[k] / sum) * 100);
    const evid = ev[id].filter(Boolean);
    const confidence: CauseScore['confidence'] = evid.length >= 3 || (pct >= 45 && evid.length >= 2) ? 'high' : evid.length >= 1 && pct >= 15 ? 'medium' : 'low';
    const tier: CauseScore['tier'] = MUST_EXCLUDE.includes(id) && evid.length >= 1 ? 'exclude' : 'mechanism';
    return { id, score: s[id], confidence, pct, evidence: evid, tier };
  });
  // Must-exclude causes with any clue come first (by clue count), then mechanisms by score.
  return scored.sort((x, y) => {
    if (x.tier !== y.tier) return x.tier === 'exclude' ? -1 : 1;
    if (x.tier === 'exclude') return y.evidence.length - x.evidence.length || y.score - x.score;
    return y.score - x.score;
  });
}

/** Confirmatory tests implied by the top causes (deduplicated, in priority order). Keys resolve to test.* strings. */
export function confirmatoryTests(ranked: CauseScore[], top = 3): string[] {
  const map: Record<CauseId, string[]> = {
    noiseCochlear: ['test.audiometryHF', 'test.oae'],
    presbycusis: ['test.audiometry'],
    ssnhl: ['test.audiometryUrgent'],
    meniere: ['test.audiometry', 'test.entExam', 'test.vestibular'],
    conductive: ['test.otoscopy', 'test.tympanometry'],
    otosclerosis: ['test.audiometryBone', 'test.tympanometry'],
    ototoxic: ['test.medReview', 'test.audiometrySerial'],
    somaticCervical: ['test.physioExam'],
    somaticTmd: ['test.dentalExam'],
    vascular: ['test.vascularImaging', 'test.entExam'],
    systemic: ['test.bloodTests', 'test.bloodPressure'],
    retrocochlear: ['test.mri', 'test.audiometry'],
    myoclonus: ['test.entExam', 'test.tympanometry'],
    sscd: ['test.ctTemporal', 'test.vemp'],
    traumaFistula: ['test.entExam', 'test.audiometry'],
    central: ['test.audiometry'],
  };
  const out: string[] = [];
  const pick = [...ranked.filter((r) => r.tier === 'exclude'), ...ranked.filter((r) => r.tier === 'mechanism').slice(0, top)];
  for (const r of pick) for (const tkey of map[r.id]) if (!out.includes(tkey)) out.push(tkey);
  return out;
}
