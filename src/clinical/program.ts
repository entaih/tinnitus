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
  /** full SCI-8 already taken (otherwise scheduled in week 2 when the SCI-02 screen was positive) */
  sciDone?: boolean;
  /** full HQ-14 already taken (otherwise scheduled in week 2 when the THS-C screen was positive) */
  hqDone?: boolean;
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

/**
 * Daily short practice, rotated from a pool so no two consecutive days repeat (PM sprint 1 §2.3).
 * The pools follow Öst's applied-relaxation steps: PMR/breathing → release-only → cue-controlled → rapid + attention.
 * Selection is `pool[(day - 1) % pool.length]`.
 */
export const DAILY_PRACTICE_POOL: Record<number, string[]> = {
  1: ['exercise.pmr', 'exercise.breathing'],
  2: ['exercise.pmr', 'exercise.breathing'],
  3: ['exercise.breathing', 'mind.breathingSpace', 'cbt.relax3'],
  4: ['exercise.breathing', 'mind.breathingSpace', 'cbt.relax3'],
  5: ['cbt.relax5', 'exercise.breathing', 'mind.breathingSpace'],
  6: ['cbt.relax5', 'exercise.breathing', 'mind.breathingSpace'],
  7: ['cbt.relax6', 'mind.breathingSpace', 'exercise.breathing', 'cbt.concentration'],
};
/** Mindfulness style: body scan on days 1 and 4, otherwise breathing space / breathing alternate. */
export const MIND_PRACTICE_POOL = ['mind.breathingSpace', 'exercise.breathing'];

export function dailyPracticeFor(week: number, day: number, style: ProgramPrefs['style']): string {
  if (style === 'mindfulness') return day === 1 || day === 4 ? 'mind.bodyScan' : MIND_PRACTICE_POOL[(day - 1) % MIND_PRACTICE_POOL.length];
  const pool = DAILY_PRACTICE_POOL[Math.min(week, 7)] ?? DAILY_PRACTICE_POOL[7];
  // Week 1 has no practice on day 1 (sound + welcome), so the rotation starts on day 2 with PMR (§2.4 "Yarın: ilk gevşeme becerisi").
  const offset = week === 1 ? 1 : 0;
  return pool[(day - 1 - offset + pool.length) % pool.length];
}

/** Weeks 9–12 (12-week programmes): consolidation with units the 8-week core does not use. */
const LATE_WEEKS: Record<number, string[]> = {
  9: ['cbt.concentration', 'cbt.toolbox'],
  10: ['act.values'],
  11: ['cbt.restructuring'],
  12: ['cbt.exposure', 'cbt.relapse'],
};

/**
 * Measurement schedule spread across the days of weeks 4, 8 and 12 (one scale a day; mood + anxiety share day 5
 * because PHQ-2+item 9 and GAD-2 are five items together). Week 4 keeps PHQ item 9 as the only safety re-check;
 * weeks 8/12 add the 3-item red-flag re-screen. The acute arm measures once, at week 4.
 */
export function measurementTasksFor(week: number, day: number, opts: { acute: boolean; insomnia: boolean; totalWeeks: number }): string[] {
  const { acute, insomnia, totalWeeks } = opts;
  if (acute) {
    if (week !== 4) return [];
    if (day === 5) return ['assess.mood'];
    if (day === 7) return ['assess.thi', 'assess.redflagsShort'];
    return [];
  }
  if (week === 4) {
    if (day === 5) return ['assess.mood'];
    if (day === 7) return ['assess.thi'];
    return [];
  }
  if (week === 8 || (week === 12 && totalWeeks >= 12)) {
    if (day === 4) return ['assess.redflagsShort'];
    if (day === 5) return ['assess.mood', 'assess.anxiety'];
    if (day === 6) return insomnia ? ['assess.sleep'] : [];
    if (day === 7) return ['assess.thi'];
  }
  return [];
}

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
  // Add-on modules are weekly (one short module on one day) and the daily 3-step cap handles overflow,
  // so even the 15-minute default carries the single most important add-on (PM sprint 1: the consequence lines promise it).
  const addOnBudget = prefs.minutesPerDay === 15 ? 1 : prefs.minutesPerDay === 30 ? 2 : 3;
  const addOns: string[] = [];
  if (insomnia) addOns.push('cbti');
  if (hyper) addOns.push('hyper');
  if (somatic) addOns.push('somatic');
  const activeAddOns = addOns.slice(0, addOnBudget);
  const notchedExperimental = tonal && activeAddOns.length < 2 && !hyper;
  const soundEnrichmentOn = !(hyper && activeAddOns.includes('hyper')) && (!severe || prefs.riPositive !== false);

  const weeks: ProgramWeek[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const days: ProgramDay[] = [];
    const rationale: string[] = [];
    let themeKey = `program.theme.week${Math.min(w, 8)}`;
    if (w > 8) themeKey = w <= 10 ? 'program.theme.consolidation' : 'program.theme.booster';
    if (acute) themeKey = 'program.theme.acute';

    // Modules for the week (spread across days 1,3,5). Week 4 of the acute arm measures THI via the measurement schedule.
    let modules = acute
      ? [['edu.acute', 'edu.hearingProtection', 'cbt.relax1'], ['cbt.psychoeducation', 'cbt.soundEnrichment'], ['cbt.relax3', 'cbt.sleepGuidelines'], ['cbt.negativeThoughts']][w - 1] ?? []
      : mild && w === 6 ? ['cbt.relapse', 'cbt.toolbox']
      : w <= 8 ? [...core[w - 1]] : [...(LATE_WEEKS[w] ?? ['cbt.toolbox'])];
    const moduleDays = [1, 3, 5, 2, 4, 6, 7];
    if (hyper && activeAddOns.includes('hyper')) for (let i = 0; i < modules.length; i++) if (modules[i] === 'cbt.exposure') modules[i] = 'hyper.hierarchy';

    if (!acute) rationale.push('program.rationale.cbt');
    if (acute) rationale.push('program.rationale.acute');

    for (let day = 1; day <= 7; day++) {
      const tasks: ProgramTask[] = [];
      const background: ProgramTask[] = [];
      const firstDay = w === 1 && day === 1;
      // 1. Daily check-in (one tap)
      tasks.push(task('diary.daily'));
      // 2. Day 1 "find your sound": mixing point right after the check-in so sound starts playing before the welcome module.
      if (firstDay && soundEnrichmentOn) tasks.push(task('sound.mixingPoint'));
      // 3. Module(s) of the day
      modules.forEach((m, i) => { if (moduleDays[i] === day) tasks.push(task(m)); });
      // 4. Measurements that re-check the plan (weeks 4/8/12, one scale a day) and the gated full scales in week 2.
      const measurements = measurementTasksFor(w, day, { acute, insomnia, totalWeeks });
      if (!acute && w === 2 && day === 2 && insomnia && !prefs.sciDone) measurements.push('assess.sleepFull');
      if (!acute && w === 2 && day === 4 && hyper && !prefs.hqDone) measurements.push('assess.hyperFull');
      measurements.forEach((id) => tasks.push(task(id)));
      const measurementDay = measurements.length > 0;
      // 4b. Add-on modules of the day come before the daily practice so the 3-step cap never hides them.
      if (activeAddOns.includes('cbti')) { const m = CBTI_WEEKS[w]; if (m && day === 2) m.forEach((id) => tasks.push(task(id))); }
      if (activeAddOns.includes('hyper')) { const m = HYPER_WEEKS[w]; if (m && day === 4) m.forEach((id) => tasks.push(task(id))); }
      // 5. Daily practice (rotated pool). Not on day 1 (sound + welcome only) and not on measurement days (the scale is the core).
      if (!firstDay && !measurementDay && (!acute || w >= 2)) {
        const practice = dailyPracticeFor(w, day, prefs.style);
        if (!tasks.some((x) => x.id === practice)) tasks.push(task(practice));
      }
      // 6. Sound: enrichment (background, listed last) or graded pink-noise exposure for hyperacusis.
      if (hyper && activeAddOns.includes('hyper')) {
        if (w >= 2) background.push(task('hyper.exposure', { minutes: Math.min(60, 20 + (w - 2) * 5) }));
      } else if (soundEnrichmentOn) {
        const target = prefs.riPositive ? 120 : 60;
        if (w <= 8 || day % 2 === 0) background.push(task(notchedExperimental && w >= 3 ? 'sound.notched' : 'sound.enrichment', { minutes: w > 8 ? 30 : target }));
      }
      // 7. Add-ons
      if (activeAddOns.includes('cbti')) {
        if (w >= 2 && w <= 8) tasks.push(task('sleep.diary'));
        if (w >= 2) background.unshift(task('sleep.sound'));
      }
      if (activeAddOns.includes('somatic') && w <= 9) {
        tasks.push(task(ph.includes('somatosensory') && profile.subtypes.includes('phenotype.somatosensory') && day % 2 === 0 ? 'somatic.orofacial' : 'somatic.cervical'));
        if (day === 1) tasks.push(task('somatic.posture'));
      }
      // 7b. Week-1 measurements that change the plan, only when missing: pitch (day 2), cause questions + residual
      //     inhibition (day 3), self-exam + hearing screen (day 4). Day 1 stays sound + welcome; day 2 is PMR (+ pitch).
      if (!acute && w === 1) {
        if (day === 2 && ph.includes('tonal') && !prefs.pitchHz) tasks.push(task('assess.pitch'));
        if (day === 3 && !prefs.causesDone) tasks.push(task('assess.causes'));
        if (day === 3 && prefs.riPositive === undefined) tasks.push(task('sound.ri'));
        if (day === 4 && !prefs.examDone) tasks.push(task('assess.exam'));
        if (day === 4 && !prefs.hearingDone && (hearing || ph.includes('noiseInduced'))) tasks.push(task('assess.hearing'));
      }
      // 8. Hearing pathway: referral task in week 1, hearing tactics in week 5.
      if (hearing && w === 1 && day === 2) tasks.push(task('hearing.referral'));
      if (hearing && w === 5 && day === 6) tasks.push(task('cbt.hearingTactics'));
      // 9. Education drip (Saturday reading day)
      const edu = ['edu.whatIsTinnitus', 'edu.habituation', 'edu.sleep', 'edu.supplements', 'edu.whenToSeeDoctor', 'edu.hearingAids', 'edu.neuromodulation', 'edu.hearingProtection'];
      if (day === 6 && w <= edu.length) tasks.push(task(edu[w - 1]));
      if (somatic && w === 2 && day === 7) tasks.push(task('edu.somatic'));
      if (hyper && w === 2 && day === 7) tasks.push(task('edu.hyperacusis'));
      // 10. Sunday: one-minute weekly card (after the THI on measurement weeks).
      if (day === 7) tasks.push(task('review.weekly'));
      // Background sound is always the last row.
      tasks.push(...background);
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
