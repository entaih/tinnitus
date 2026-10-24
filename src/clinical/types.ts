/** Shared clinical data model. All timestamps are ISO strings; all scores are raw numbers. */

export type Side = 'left' | 'right' | 'both' | 'head';
export type Onset = 'lt3m' | '3to12m' | '1to5y' | 'gt5y';
export type Pattern = 'constant' | 'intermittent' | 'pulsatile';
export type Character = 'tonal' | 'hissing' | 'buzzing' | 'roaring' | 'clicking' | 'multiple';

export interface RedFlags {
  suddenHearingLoss: boolean;
  unilateralSymptoms: boolean;
  pulsatile: boolean;
  vertigo: boolean;
  neuroSigns: boolean;      // facial weakness, numbness, severe headache, visual change
  otorrhoeaOrPain: boolean; // discharge or ear pain
  headTrauma: boolean;
  selfHarm: boolean;        // PHQ-9 item 9 > 0 or direct item
  rapidWorsening?: boolean; // hearing worsening over 4–90 days (NICE 2-week tier)
}

export interface CaseHistory {
  side: Side;
  onset: Onset;
  pattern: Pattern;
  character: Character;
  noiseExposure: boolean;
  hearingDifficulty: boolean;
  soundSensitivity: boolean;   // hyperacusis screen
  somaticModulation: boolean;  // tinnitus changes with jaw/neck movement
  neckOrJawPain: boolean;
  ototoxicMeds: boolean;
  earFullness: boolean;        // Ménière/ETD clue
  sleepProblem: boolean;
  stressWorsens: boolean;
  age?: number;
}

export interface QuestionnaireResult {
  id: 'THI' | 'TFI' | 'HQ' | 'PHQ9' | 'GAD7' | 'SCI' | 'RASST' | 'ISI' | 'TCQ';
  date: string;
  answers: number[];
  total: number;
  subscales?: Record<string, number>;
}

export interface HearingScreenResult {
  date: string;
  /** threshold estimate per frequency per ear (dB relative to device reference) */
  thresholds: { ear: 'left' | 'right'; freq: number; levelDb: number }[];
  ambientOk: boolean;
  calibrated: boolean;
}

export interface PsychoacousticResult {
  date: string;
  pitchHz?: number;
  pitchConfidence?: 'low' | 'medium' | 'high';
  loudnessDbSl?: number;     // dB sensation level relative to the user's threshold at pitch
  mmlDb?: number;            // minimum masking level relative to threshold of noise
  residualInhibitionSec?: number;
  riCategory?: 'complete' | 'partial' | 'none';
}

/** Results of the guided self-examination battery (phone only, no extra hardware). All fields optional. */
export interface ExamResult {
  date: string;
  /** digits-in-noise speech reception threshold estimate (dB SNR, lower = better); null if not done */
  dinSrtDb?: number | null;
  dinPassed?: boolean;
  /** loudness discomfort level estimate (dB relative to the app's full scale; higher magnitude = more tolerant) */
  ldlDb?: number | null;
  ldlLow?: boolean;              // discomfort reached early → hyperacusis pattern
  /** Eustachian-tube manoeuvres */
  valsalvaPop?: boolean;         // ear "pops"/opens on Valsalva or Toynbee
  fullnessRelief?: boolean;      // fullness eases after the manoeuvre
  /** vascular manoeuvres (pulsatile tinnitus only) */
  jugularChange?: 'quieter' | 'louder' | 'same' | null;
  headTurnChange?: 'quieter' | 'louder' | 'same' | null;
  /** balance (accelerometer sway, eyes closed, 30 s) */
  swayScore?: number | null;     // RMS acceleration in m/s² (×100), normalised; higher = more sway
  swayAbnormal?: boolean;
  /** somatic modulation self-test summary */
  somaticPositive?: boolean;
}

export interface DiaryEntry {
  date: string;            // YYYY-MM-DD
  loudness: number;        // 0-10
  annoyance: number;       // 0-10
  mood: 0 | 1 | 2;         // 0 hard, 1 ok, 2 good
  sleepQuality?: number;   // 0-10
  note?: string;
}

export interface Assessment {
  id: string;
  date: string;
  history?: CaseHistory;
  redFlags?: RedFlags;
  questionnaires: QuestionnaireResult[];
  hearing?: HearingScreenResult;
  psycho?: PsychoacousticResult;
  /** answers to the adaptive cause-analysis questions (src/clinical/causes.ts) */
  causeAnswers?: Record<string, boolean>;
  /** guided self-examination results */
  exam?: ExamResult;
}

export type Triage = 'urgent' | 'audiology' | 'selfcare';

export interface Profile {
  triage: Triage;
  triageReasons: string[];           // i18n keys
  severityScore?: number;            // TFI (preferred) or THI
  severityBand: 'none' | 'mild' | 'moderate' | 'severe' | 'catastrophic';
  severitySource?: 'TFI' | 'THI';
  subtypes: string[];                // i18n keys e.g. 'subtype.tonal'
  phenotypes: Phenotype[];
  drivers: Driver[];
  recommendations: Recommendation[];
  doctorSummary: string[];           // plain sentences (already localised)
}

export type Phenotype =
  | 'acute' | 'chronic' | 'tonal' | 'noiseLike' | 'pulsatile' | 'somatosensory' | 'hearingLossAssociated'
  | 'hyperacusis' | 'noiseInduced' | 'possibleMeniere' | 'ototoxicSuspect' | 'unilateral';

export type Driver = 'distress' | 'anxiety' | 'depression' | 'insomnia' | 'hyperacusis' | 'somatic' | 'hearingLoss' | 'attention' | 'catastrophizing';

export interface Recommendation {
  key: string;        // i18n key
  evidence: 'guideline' | 'rct' | 'expert';
  citation: string;   // citation id in content/citations
  priority: 1 | 2 | 3;
}

export interface ProgramTask {
  id: string;
  type: 'sound' | 'mind' | 'education' | 'exercise' | 'sleep' | 'diary' | 'assessment';
  titleKey: string;
  minutes: number;
  route: string;             // expo-router href
  params?: Record<string, string>;
  evidence?: 'guideline' | 'rct' | 'expert';
  citation?: string;
}

export interface ProgramDay { day: number; tasks: ProgramTask[] }
export interface ProgramWeek { week: number; themeKey: string; rationaleKeys: string[]; days: ProgramDay[] }

export interface Program {
  id: string;
  createdAt: string;
  startDate: string;        // YYYY-MM-DD
  weeks: ProgramWeek[];
  arm: 'soundCbt' | 'cbtFirst' | 'hyperacusisFirst' | 'somaticPlus' | 'sleepFirst' | 'acute';
  notchHz?: number;
  completed: Record<string, string>;   // taskKey(week-day-taskId) -> ISO date
}
