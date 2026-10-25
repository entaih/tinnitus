/**
 * Registry of every deliverable "unit" the programme generator can schedule.
 * Content bodies live in src/content/modules.ts (CBT/ACT/mindfulness/CBT-I/hyperacusis),
 * src/content/exercises.ts (somatosensory + breathing) and src/content/articles.ts (education).
 * Keep ids stable: they are persisted inside users' programmes.
 */
export type UnitType = 'mind' | 'exercise' | 'sound' | 'education' | 'sleep' | 'diary' | 'assessment' | 'review';

export interface Unit {
  id: string;
  type: UnitType;
  minutes: number;
  route: string;                   // expo-router href; [id] is substituted
  track: 'cbt' | 'act' | 'mind' | 'cbti' | 'hyper' | 'somatic' | 'sound' | 'edu' | 'core' | 'hearing' | 'acute';
  citation: string;
  evidence: 'guideline' | 'rct' | 'expert';
}

const u = (id: string, type: UnitType, minutes: number, route: string, track: Unit['track'], citation: string, evidence: Unit['evidence'] = 'rct'): Unit =>
  ({ id, type, minutes, route, track, citation, evidence });

export const UNITS: Record<string, Unit> = Object.fromEntries([
  // --- Core CBT (Andersson/Kaldo → Beukes iCBT structure, 8 weeks) ---
  u('cbt.welcome', 'mind', 8, '/mind/cbt.welcome', 'cbt', 'beukes2018'),
  u('cbt.psychoeducation', 'mind', 12, '/mind/cbt.psychoeducation', 'cbt', 'fuller2020', 'guideline'),
  u('cbt.relax1', 'mind', 15, '/mind/cbt.relax1', 'cbt', 'ost1987'),
  u('cbt.relax2', 'mind', 12, '/mind/cbt.relax2', 'cbt', 'ost1987'),
  u('cbt.soundEnrichment', 'mind', 8, '/mind/cbt.soundEnrichment', 'cbt', 'sereda2018', 'guideline'),
  u('cbt.thoughtDiary', 'mind', 10, '/mind/cbt.thoughtDiary', 'cbt', 'fuller2020'),
  u('cbt.sleepGuidelines', 'mind', 10, '/mind/cbt.sleepGuidelines', 'cbt', 'marks2023'),
  u('cbt.relax3', 'mind', 8, '/mind/cbt.relax3', 'cbt', 'ost1987'),
  u('cbt.negativeThoughts', 'mind', 12, '/mind/cbt.negativeThoughts', 'cbt', 'fuller2020'),
  u('cbt.positiveImagery', 'mind', 10, '/mind/cbt.positiveImagery', 'cbt', 'beukes2018'),
  u('cbt.relax4', 'mind', 8, '/mind/cbt.relax4', 'cbt', 'ost1987'),
  u('cbt.restructuring', 'mind', 15, '/mind/cbt.restructuring', 'cbt', 'fuller2020'),
  u('cbt.relax5', 'mind', 5, '/mind/cbt.relax5', 'cbt', 'ost1987'),
  u('cbt.exposure', 'mind', 12, '/mind/cbt.exposure', 'cbt', 'beukes2018'),
  u('cbt.relax6', 'mind', 5, '/mind/cbt.relax6', 'cbt', 'ost1987'),
  u('cbt.attention', 'mind', 10, '/mind/cbt.attention', 'cbt', 'beukes2018'),
  u('cbt.activity', 'mind', 10, '/mind/cbt.activity', 'cbt', 'fuller2020'),
  u('cbt.relapse', 'mind', 12, '/mind/cbt.relapse', 'cbt', 'beukes2018'),
  u('cbt.hearingTactics', 'mind', 8, '/mind/cbt.hearingTactics', 'hearing', 'tunkel2014', 'guideline'),
  u('cbt.concentration', 'mind', 8, '/mind/cbt.concentration', 'cbt', 'beukes2018'),
  u('cbt.toolbox', 'mind', 6, '/mind/cbt.toolbox', 'cbt', 'beukes2018'),
  // --- ACT alternative ---
  u('act.acceptance', 'mind', 12, '/mind/act.acceptance', 'act', 'hesser2012'),
  u('act.defusion', 'mind', 10, '/mind/act.defusion', 'act', 'hesser2012'),
  u('act.values', 'mind', 12, '/mind/act.values', 'act', 'hesser2012'),
  u('act.committed', 'mind', 10, '/mind/act.committed', 'act', 'hesser2012'),
  // --- Mindfulness (MBCT-lite) ---
  u('mind.bodyScan', 'mind', 15, '/mind/mind.bodyScan', 'mind', 'mckenna2017'),
  u('mind.breathingSpace', 'mind', 5, '/mind/mind.breathingSpace', 'mind', 'mckenna2017'),
  u('mind.allowing', 'mind', 12, '/mind/mind.allowing', 'mind', 'mckenna2017'),
  u('mind.thoughtsNotFacts', 'mind', 10, '/mind/mind.thoughtsNotFacts', 'mind', 'mckenna2017'),
  // --- CBT-I ---
  u('cbti.education', 'sleep', 10, '/mind/cbti.education', 'cbti', 'marks2023'),
  u('cbti.stimulusControl', 'sleep', 10, '/mind/cbti.stimulusControl', 'cbti', 'marks2023'),
  u('cbti.compression', 'sleep', 10, '/mind/cbti.compression', 'cbti', 'marks2023'),
  u('cbti.cognitions', 'sleep', 10, '/mind/cbti.cognitions', 'cbti', 'marks2023'),
  u('cbti.windDown', 'sleep', 8, '/mind/cbti.windDown', 'cbti', 'marks2023'),
  u('cbti.relapse', 'sleep', 8, '/mind/cbti.relapse', 'cbti', 'marks2023'),
  u('sleep.diary', 'diary', 1, '/sleep/diary', 'cbti', 'marks2023'),
  u('sleep.sound', 'sound', 30, '/sound/player?preset=sleep', 'cbti', 'sereda2018', 'expert'),
  // --- Hyperacusis ---
  u('hyper.education', 'mind', 10, '/mind/hyper.education', 'hyper', 'juris2014'),
  u('hyper.exposure', 'sound', 30, '/sound/player?preset=hyperacusis', 'hyper', 'formby2015'),
  u('hyper.hierarchy', 'mind', 10, '/mind/hyper.hierarchy', 'hyper', 'juris2014'),
  u('hyper.earplugs', 'mind', 6, '/mind/hyper.earplugs', 'hyper', 'juris2014'),
  // --- Somatosensory ---
  u('somatic.cervical', 'exercise', 12, '/exercise/somatic.cervical', 'somatic', 'michiels2016'),
  u('somatic.orofacial', 'exercise', 10, '/exercise/somatic.orofacial', 'somatic', 'vanderwal2020'),
  u('somatic.posture', 'exercise', 5, '/exercise/somatic.posture', 'somatic', 'michiels2016', 'expert'),
  // --- Relaxation / breathing exercise (guided, animated) ---
  u('exercise.breathing', 'exercise', 5, '/exercise/breathing', 'cbt', 'ost1987'),
  u('exercise.pmr', 'exercise', 12, '/exercise/pmr', 'cbt', 'ost1987'),
  u('exercise.pmrShort', 'exercise', 6, '/exercise/pmr?variant=short', 'cbt', 'ost1987'),
  // --- Sound ---
  u('sound.enrichment', 'sound', 60, '/sound/player?preset=enrichment', 'sound', 'sereda2018', 'guideline'),
  u('sound.mixingPoint', 'sound', 5, '/sound/mixing-point', 'sound', 'scherer2019'),
  u('sound.notched', 'sound', 60, '/sound/player?preset=notched', 'sound', 'okamoto2010'),
  u('sound.ri', 'sound', 3, '/assess/ri', 'sound', 'sendesen2024'),
  // --- Education ---
  u('edu.whatIsTinnitus', 'education', 6, '/education/what-is-tinnitus', 'edu', 'tunkel2014', 'guideline'),
  u('edu.habituation', 'education', 6, '/education/habituation', 'edu', 'cima2019', 'guideline'),
  u('edu.hearingProtection', 'education', 5, '/education/hearing-protection', 'edu', 'chandrasekhar2019', 'guideline'),
  u('edu.supplements', 'education', 5, '/education/supplements', 'edu', 'tunkel2014', 'guideline'),
  u('edu.whenToSeeDoctor', 'education', 5, '/education/when-to-see-a-doctor', 'edu', 'nice2020', 'guideline'),
  u('edu.hearingAids', 'education', 5, '/education/hearing-aids', 'edu', 'tunkel2014', 'guideline'),
  u('edu.neuromodulation', 'education', 6, '/education/neuromodulation', 'edu', 'conlon2020'),
  u('edu.sleep', 'education', 5, '/education/sleep', 'edu', 'marks2023'),
  u('edu.hyperacusis', 'education', 5, '/education/hyperacusis', 'edu', 'juris2014'),
  u('edu.somatic', 'education', 5, '/education/somatosensory', 'edu', 'michiels2018'),
  u('edu.acute', 'education', 5, '/education/acute-tinnitus', 'edu', 'chandrasekhar2019', 'guideline'),
  // --- Core ---
  u('diary.daily', 'diary', 1, '/diary', 'core', 'meikle2012', 'expert'),
  u('assess.thi', 'assessment', 5, '/assess/questionnaire/THI', 'core', 'newman1996', 'guideline'),
  u('assess.mood', 'assessment', 5, '/assess/questionnaire/PHQ9', 'core', 'kroenke2001', 'guideline'),
  u('assess.anxiety', 'assessment', 3, '/assess/questionnaire/GAD7', 'core', 'spitzer2006', 'guideline'),
  u('assess.sleep', 'assessment', 2, '/assess/questionnaire/SCI', 'core', 'espie2014'),
  u('assess.hearing', 'assessment', 6, '/assess/hearing', 'hearing', 'chen2021'),
  u('assess.pitch', 'assessment', 6, '/assess/pitch', 'sound', 'vielsmeier2020'),
  u('assess.causes', 'assessment', 2, '/assess/causes', 'core', 'adams2026', 'expert'),
  u('assess.exam', 'assessment', 8, '/assess/exam', 'core', 'chen2021', 'expert'),
  u('assess.redflags', 'assessment', 2, '/assess/triage', 'core', 'nice2020', 'guideline'),
  u('assess.redflagsShort', 'assessment', 1, '/assess/triage?short=1', 'core', 'nice2020', 'guideline'),
  u('assess.sleepFull', 'assessment', 2, '/assess/questionnaire/SCI', 'core', 'espie2014'),
  u('assess.hyperFull', 'assessment', 3, '/assess/questionnaire/HQ', 'core', 'khalfa2002', 'expert'),
  u('review.weekly', 'review', 1, '/week-review', 'core', 'beukes2018', 'expert'),
  u('hearing.referral', 'education', 3, '/education/hearing-aids', 'hearing', 'tunkel2014', 'guideline'),
].map((x) => [x.id, x]));

export const unit = (id: string): Unit => {
  const x = UNITS[id];
  if (!x) throw new Error(`Unknown unit ${id}`);
  return x;
};
