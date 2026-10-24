/**
 * Personalised programme generator.
 * Composition rules follow the iCBT structure (Beukes/Andersson), Cochrane 2020, NICE NG155 stepped care,
 * CBT-I (Marks 2023), hyperacusis graded exposure (Formby 2015 / Jüris 2014), somatosensory protocols
 * (Michiels 2016; van der Wal 2020) and the RI-ordering rule (Sendesen 2024).
 */
import type { Profile, Program, ProgramDay, ProgramTask, ProgramWeek } from './types';
import { unit } from '@/content/registry';

export interface ProgramPrefs {
  minutesPerDay: 15 | 30 | 45;
  style: 'cbt' | 'act' | 'mindfulness';
  pitchHz?: number;
  riPositive?: boolean;
  /** hearing screen already done */
  hearingDone?: boolean;
  causesDone?: boolean;
  examDone?: boolean;
}

const task = (id: string, overrides: Partial<ProgramTask> = {}): ProgramTask => {
  const u = unit(id);
  return { id, type: u.type, titleKey: `unit.${id}`, minutes: u.minutes, route: u.route, evidence: u.evidence, citation: u.citation, ...overrides };
};

/** Weekly core-CBT module plan (2–3 modules/week, 8 weeks). */
const CBT_WEEKS: string[][] = [
  ['cbt.welcome', 'cbt.psychoeducation', 'cbt.relax1'],
  ['cbt.relax2', 'cbt.soundEnrichment', 'cbt.thoughtDiary'],
  ['cbt.sleepGuidelines', 'cbt.relax3'],
  ['cbt.negativeThoughts', 'cbt.positiveImagery', 'cbt.relax4'],
  ['cbt.restructuring', 'cbt.relax5'],
  ['cbt.exposure', 'cbt.relax6'],
  ['cbt.attention', 'cbt.activity'],
  ['cbt.relapse', 'cbt.toolbox'],
];
const ACT_WEEKS: string[][] = [
  ['cbt.welcome', 'cbt.psychoeducation', 'cbt.relax1'],
  ['act.acceptance', 'cbt.soundEnrichment', 'cbt.relax2'],
  ['act.defusion', 'cbt.relax3'],
  ['act.values', 'cbt.sleepGuidelines'],
  ['act.committed', 'cbt.relax5'],
  ['cbt.exposure', 'act.acceptance'],
  ['cbt.attention', 'cbt.activity'],
  ['cbt.relapse', 'cbt.toolbox'],
];
const MIND_WEEKS: string[][] = [
  ['cbt.welcome', 'cbt.psychoeducation', 'mind.breathingSpace'],
  ['mind.bodyScan', 'cbt.soundEnrichment'],
  ['mind.breathingSpace', 'cbt.sleepGuidelines'],
  ['mind.bodyScan', 'mind.allowing'],
  ['mind.thoughtsNotFacts', 'mind.breathingSpace'],
  ['mind.allowing', 'cbt.exposure'],
  ['cbt.attention', 'cbt.activity'],
  ['cbt.relapse', 'cbt.toolbox'],
];
const CBTI_WEEKS: Record<number, string[]> = { 2: ['cbti.education'], 3: ['cbti.stimulusControl'], 4: ['cbti.compression'], 5: ['cbti.cognitions'], 6: ['cbti.windDown'], 7: ['cbti.relapse'] };
const HYPER_WEEKS: Record<number, string[]> = { 2: ['hyper.education'], 3: ['hyper.hierarchy'], 5: ['hyper.earplugs'] };

const DAILY_PRACTICE: Record<number, string> = { 1: 'exercise.pmr', 2: 'exercise.pmr', 3: 'exercise.breathing', 4: 'exercise.breathing', 5: 'exercise.breathing', 6: 'exercise.breathing', 7: 'exercise.breathing', 8: 'exercise.breathing' };

export function generateProgram(profile: Profile, prefs: ProgramPrefs, startDate = new Date()): Program {
  const d = profile.drivers;
  const ph = profile.phenotypes;
  const acute = ph.includes('acute');
  const hyper = d.includes('hyperacusis');
  const insomnia = d.includes('insomnia');
  const somatic = d.includes('somatic');
  const hearing = d.includes('hearingLoss');
  const tonal = ph.includes('tonal') && !!prefs.pitchHz && prefs.pitchHz <= 8000;
  const severe = profile.severityBand === 'severe' || profile.severityBand === 'catastrophic';
  const mild = profile.severityBand === 'none' || profile.severityBand === 'mild';

  let arm: Program['arm'] = 'soundCbt';
  if (acute) arm = 'acute';
  else if (hyper) arm = 'hyperacusisFirst';
  else if (insomnia) arm = 'sleepFirst';
  else if (somatic) arm = 'somaticPlus';
  else if (prefs.riPositive === false) arm = 'cbtFirst';

  const core = prefs.style === 'act' ? ACT_WEEKS : prefs.style === 'mindfulness' ? MIND_WEEKS : CBT_WEEKS;
  const totalWeeks = acute ? 4 : mild ? 6 : 12;

  // Add-on priority when capacity is limited: mood (handled via referral) > insomnia > hyperacusis > somatic > hearing > experimental.
  const addOnBudget = prefs.minutesPerDay === 15 ? 0 : prefs.minutesPerDay === 30 ? 1 : 2;
  const addOns: string[] = [];
  if (insomnia) addOns.push('cbti');
  if (hyper) addOns.push('hyper');
  if (somatic) addOns.push('somatic');
  const activeAddOns = addOns.slice(0, addOnBudget);
  const notchedExperimental = tonal && activeAddOns.length < 2 && !hyper;

  const weeks: ProgramWeek[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const days: ProgramDay[] = [];
    const rationale: string[] = [];
    let themeKey = `program.theme.week${Math.min(w, 8)}`;
    if (w > 8) themeKey = w <= 10 ? 'program.theme.consolidation' : 'program.theme.booster';
    if (acute) themeKey = 'program.theme.acute';

    // Modules for the week (spread across days 1,3,5)
    let modules = acute
      ? [['edu.acute', 'edu.hearingProtection', 'cbt.relax1'], ['cbt.psychoeducation', 'cbt.soundEnrichment'], ['cbt.relax3', 'cbt.sleepGuidelines'], ['cbt.negativeThoughts', 'assess.thi']][w - 1] ?? []
      : mild && w === 6 ? ['cbt.relapse', 'cbt.toolbox']
      : w <= 8 ? [...core[w - 1]] : w <= 10 ? ['cbt.toolbox'] : ['cbt.restructuring', 'cbt.exposure'];
    const moduleDays = [1, 3, 5, 2, 4, 6, 7];
    if (hyper && activeAddOns.includes('hyper')) for (let i = 0; i < modules.length; i++) if (modules[i] === 'cbt.exposure') modules[i] = 'hyper.hierarchy';

    if (!acute) rationale.push('program.rationale.cbt');
    if (acute) rationale.push('program.rationale.acute');

    for (let day = 1; day <= 7; day++) {
      const tasks: ProgramTask[] = [];
      // 1. Daily check-in (10 s)
      tasks.push(task('diary.daily'));
      // 2. Module(s) of the day
      modules.forEach((m, i) => { if (moduleDays[i] === day) tasks.push(task(m)); });
      // 3. Daily practice (relaxation) — twice daily in the iCBT protocol; we schedule once with a hint.
      if (!acute || w >= 2) {
        const practice = DAILY_PRACTICE[Math.min(w, 8)] ?? 'exercise.breathing';
        if (prefs.minutesPerDay > 15 || day % 2 === 1) tasks.push(task(prefs.style === 'mindfulness' ? 'mind.breathingSpace' : practice));
      }
      // 4. Sound enrichment — default on; replaced by graded pink-noise exposure for hyperacusis.
      if (hyper && activeAddOns.includes('hyper')) {
        if (w >= 2) tasks.push(task('hyper.exposure', { minutes: Math.min(60, 20 + (w - 2) * 5) }));
      } else if (!severe || prefs.riPositive !== false) {
        if (w === 1 && day === 1) tasks.push(task('sound.mixingPoint'));
        const target = prefs.riPositive ? 120 : 60;
        if (w <= 8 || day % 2 === 0) tasks.push(task(notchedExperimental && w >= 3 ? 'sound.notched' : 'sound.enrichment', { minutes: w > 8 ? 30 : target }));
      }
      // 5. Add-ons
      if (activeAddOns.includes('cbti')) {
        const m = CBTI_WEEKS[w];
        if (m && day === 2) m.forEach((id) => tasks.push(task(id)));
        if (w >= 2 && w <= 8) tasks.push(task('sleep.diary'));
        if (w >= 2) tasks.push(task('sleep.sound'));
      }
      if (activeAddOns.includes('hyper')) {
        const m = HYPER_WEEKS[w];
        if (m && day === 4) m.forEach((id) => tasks.push(task(id)));
      }
      if (activeAddOns.includes('somatic') && w <= 9) {
        tasks.push(task(ph.includes('somatosensory') && profile.subtypes.includes('phenotype.somatosensory') && day % 2 === 0 ? 'somatic.orofacial' : 'somatic.cervical'));
        if (day === 1) tasks.push(task('somatic.posture'));
      }
      // 5b. Measurements that change the plan, scheduled once in week 1 only when missing:
      //     pitch match (tonal tinnitus → notched / narrow-band sound), residual inhibition (sound-first vs CBT-first),
      //     hearing screen (referral decision) when hearing difficulty or noise exposure is reported.
      if (!acute && w === 1) {
        if (day === 1 && !prefs.causesDone) tasks.push(task('assess.causes'));
        if (day === 2 && !prefs.examDone) tasks.push(task('assess.exam'));
        if (day === 2 && ph.includes('tonal') && !prefs.pitchHz) tasks.push(task('assess.pitch'));
        if (day === 3 && prefs.riPositive === undefined) tasks.push(task('sound.ri'));
        if (day === 4 && !prefs.hearingDone && (hearing || ph.includes('noiseInduced'))) tasks.push(task('assess.hearing'));
      }
      // 6. Hearing pathway: referral task in week 1, hearing tactics in week 5.
      if (hearing && w === 1 && day === 2) tasks.push(task('hearing.referral'));
      if (hearing && w === 5 && day === 6) tasks.push(task('cbt.hearingTactics'));
      // 7. Education drip
      const edu = ['edu.whatIsTinnitus', 'edu.habituation', 'edu.sleep', 'edu.supplements', 'edu.whenToSeeDoctor', 'edu.hearingAids', 'edu.neuromodulation', 'edu.hearingProtection'];
      if (day === 6 && w <= edu.length) tasks.push(task(edu[w - 1]));
      if (somatic && w === 2 && day === 7) tasks.push(task('edu.somatic'));
      if (hyper && w === 2 && day === 7) tasks.push(task('edu.hyperacusis'));
      // 8. Measurement schedule: THI at weeks 4, 8, 12 (+ mood/anxiety/sleep at 8); red flags re-screened at 4 and 12.
      if (day === 7 && (w === 4 || w === 8 || w === 12 || (acute && w === 4))) {
        tasks.push(task('assess.thi'));
        tasks.push(task('assess.redflags'));
        tasks.push(task('assess.mood'));
        if (w === 8 || w === 12) { tasks.push(task('assess.anxiety')); if (insomnia) tasks.push(task('assess.sleep')); }
      }
      days.push({ day, tasks });
    }
    if (activeAddOns.includes('cbti')) rationale.push('program.rationale.cbti');
    if (activeAddOns.includes('hyper')) rationale.push('program.rationale.hyper');
    if (activeAddOns.includes('somatic')) rationale.push('program.rationale.somatic');
    if (hearing) rationale.push('program.rationale.hearing');
    if (prefs.riPositive) rationale.push('program.rationale.riPositive');
    if (prefs.riPositive === false) rationale.push('program.rationale.riNegative');
    if (notchedExperimental) rationale.push('program.rationale.notched');
    weeks.push({ week: w, themeKey, rationaleKeys: rationale, days });
  }

  return {
    id: `${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    startDate: startDate.toISOString().slice(0, 10),
    weeks,
    arm,
    notchHz: notchedExperimental ? prefs.pitchHz : undefined,
    completed: {},
  };
}

export const taskKey = (week: number, day: number, taskId: string) => `${week}-${day}-${taskId}`;

/** Which week/day of the programme is "today" (1-based). Days beyond the end clamp to the last day. */
export function programPosition(p: Program, now = new Date()): { week: number; day: number; dayIndex: number } {
  const start = new Date(p.startDate + 'T00:00:00');
  const diff = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
  const total = p.weeks.length * 7;
  const idx = Math.min(diff, total - 1);
  return { week: Math.floor(idx / 7) + 1, day: (idx % 7) + 1, dayIndex: idx };
}

export function tasksForDay(p: Program, week: number, day: number): ProgramTask[] {
  return p.weeks[week - 1]?.days[day - 1]?.tasks ?? [];
}

export function dayCompletion(p: Program, week: number, day: number): { done: number; total: number } {
  const tasks = tasksForDay(p, week, day);
  const done = tasks.filter((t) => p.completed[taskKey(week, day, t.id)]).length;
  return { done, total: tasks.length };
}

/** Adherence over the last n days (fraction of scheduled tasks completed). */
export function adherence(p: Program, now = new Date(), nDays = 7): number {
  const pos = programPosition(p, now);
  let done = 0, total = 0;
  for (let i = Math.max(0, pos.dayIndex - nDays + 1); i <= pos.dayIndex; i++) {
    const w = Math.floor(i / 7) + 1, d = (i % 7) + 1;
    const c = dayCompletion(p, w, d);
    done += c.done; total += c.total;
  }
  return total ? done / total : 0;
}

/**
 * Outcome-driven adaptation (research_treatment §12.5). Returns i18n keys of suggested actions.
 * thiBaseline/thiNow are the latest two THI totals; adherence is the fraction of the last 14 days' tasks done.
 */
export function adaptationAdvice(p: Program, opts: { week: number; thiBaseline?: number; thiNow?: number; adherence14: number; phq9?: number; phqItem9?: number; somatic?: boolean }): string[] {
  const out: string[] = [];
  const { week, thiBaseline, thiNow } = opts;
  const change = thiBaseline != null && thiNow != null ? thiBaseline - thiNow : undefined;
  if (opts.phqItem9 != null && opts.phqItem9 > 0) out.push('adapt.safety');
  if (opts.phq9 != null && opts.phq9 >= 20) out.push('adapt.safety');
  if (opts.adherence14 < 0.5 && week >= 3) out.push('adapt.lowAdherence');
  if (week >= 4 && week < 8 && change != null) {
    if (change <= -11) out.push('adapt.worsened');
    else if (change < 7) out.push('adapt.earlyNonResponse');
    else out.push('adapt.onTrack');
  }
  if (opts.somatic && week >= 6 && change != null && change < 7) out.push('adapt.somaticRefer');
  if (week >= 8 && change != null) {
    if (change >= 11) out.push('adapt.responder');
    else if (change >= 7) out.push('adapt.improving');
    else out.push('adapt.changeStrategy');
  }
  return Array.from(new Set(out));
}
