/**
 * Personalised programme generator.
 * Composition rules follow the iCBT structure (Beukes/Andersson), Cochrane 2020, NICE NG155 stepped care,
 * CBT-I (Marks 2023), hyperacusis graded exposure (Formby 2015 / Jüris 2014), somatosensory protocols
 * (Michiels 2016; van der Wal 2020) and the RI-ordering rule (Sendesen 2024).
 *
 * Sprint 2 (PM §2): every day carries at most ONE `core` task (the week's module, the core measurement, or the
 * day-1 sound step); modules never share a day with a core measurement; the daily practice is skipped on days
 * that carry an assessment of ≥ 6 minutes; `sleep.diary` is no longer a task (folded into the check-in).
 */
import type { Assessment, Profile, Program, ProgramDay, ProgramTask, ProgramWeek } from './types';
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

export type Dose = 'full' | 'light';

/** Preference fields that only depend on what the merged assessment already contains (shared by results, setup and dose changes). */
export function assessmentPrefs(a: Assessment | null | undefined): Pick<ProgramPrefs, 'pitchHz' | 'riPositive' | 'hearingDone' | 'causesDone' | 'examDone' | 'sciDone' | 'hqDone'> {
  const ps = a?.psycho;
  const has = (id: string) => !!a?.questionnaires.some((q) => q.id === id);
  return {
    pitchHz: ps?.pitchHz,
    riPositive: ps ? (ps.riPositive ?? (ps.riCategory ? ps.riCategory === 'complete' : undefined)) : undefined,
    hearingDone: !!a?.hearing, causesDone: !!a?.causeAnswers, examDone: !!a?.exam, sciDone: has('SCI'), hqDone: has('HQ'),
  };
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
/** OSA suspect (physician B6): sleep compression is contraindicated until a sleep clinic has seen the user; the rest moves up a week. */
const CBTI_WEEKS_OSA: Record<number, string[]> = { 2: ['cbti.education'], 3: ['cbti.stimulusControl'], 4: ['cbti.cognitions'], 5: ['cbti.windDown'], 6: ['cbti.relapse'] };
const HYPER_WEEKS: Record<number, string[]> = { 2: ['hyper.education'], 3: ['hyper.hierarchy'], 5: ['hyper.earplugs'] };
/** Acute arm week plan (edu + relaxation + psychoeducation; THI via the measurement schedule in week 4). */
const ACUTE_WEEKS: string[][] = [['edu.acute', 'edu.hearingProtection', 'cbt.relax1'], ['cbt.psychoeducation', 'cbt.soundEnrichment'], ['cbt.relax3', 'cbt.sleepGuidelines'], ['cbt.negativeThoughts']];

/** Saturday education drip; the hyperacusis arm reads the hyperacusis article first (w1d6) and everything else shifts a week. */
const EDU_DRIP = ['edu.whatIsTinnitus', 'edu.habituation', 'edu.sleep', 'edu.supplements', 'edu.whenToSeeDoctor', 'edu.hearingAids', 'edu.neuromodulation', 'edu.hearingProtection'];

/**
 * Daily short practice, rotated from a pool so no two consecutive days repeat from week 3 (PM sprint 1 §2.3).
 * The pools follow Öst's applied-relaxation steps: PMR/breathing → release-only → cue-controlled → rapid + attention.
 * Weeks 1–2 carry PMR (12 min) at most twice a week (PM sprint 2 D11). Selection is `pool[(day - 1) % pool.length]`.
 */
export const DAILY_PRACTICE_POOL: Record<number, string[]> = {
  1: ['exercise.pmr', 'exercise.breathing', 'exercise.breathing'],
  2: ['exercise.pmrShort', 'exercise.breathing', 'mind.breathingSpace'],
  3: ['exercise.breathing', 'mind.breathingSpace', 'cbt.relax3'],
  4: ['exercise.breathing', 'mind.breathingSpace', 'cbt.relax3'],
  5: ['cbt.relax5', 'exercise.breathing', 'mind.breathingSpace'],
  6: ['cbt.relax5', 'exercise.breathing', 'mind.breathingSpace'],
  7: ['cbt.relax6', 'mind.breathingSpace', 'exercise.breathing', 'cbt.concentration'],
};
/** Mindfulness style: body scan on days 1 and 4, otherwise breathing space / breathing alternate. */
export const MIND_PRACTICE_POOL = ['mind.breathingSpace', 'exercise.breathing'];
/** Acute arm, week 1: breathing only (no PMR before the first psychoeducation), from day 2. */
export const ACUTE_WEEK1_POOL = ['exercise.breathing', 'mind.breathingSpace'];
/** Light dose keeps only practices of this length or shorter. */
export const LIGHT_PRACTICE_MAX_MIN = 5;

export function dailyPracticeFor(week: number, day: number, style: ProgramPrefs['style'], opts: { acute?: boolean; dose?: Dose } = {}): string {
  if (opts.acute && week === 1) return ACUTE_WEEK1_POOL[(day - 2 + 2 * ACUTE_WEEK1_POOL.length) % ACUTE_WEEK1_POOL.length];
  const light = opts.dose === 'light';
  if (style === 'mindfulness') {
    if (!light && (day === 1 || day === 4)) return 'mind.bodyScan';
    return MIND_PRACTICE_POOL[(day - 1) % MIND_PRACTICE_POOL.length];
  }
  let pool = DAILY_PRACTICE_POOL[Math.min(week, 7)] ?? DAILY_PRACTICE_POOL[7];
  if (light) { const short = pool.filter((id) => unit(id).minutes <= LIGHT_PRACTICE_MAX_MIN); pool = short.length ? short : ['exercise.breathing']; }
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
/** Hyperacusis arm week 12: ear-plug weaning + relapse prevention instead of a third hierarchy pass (D10). */
const LATE_WEEK12_HYPER = ['hyper.earplugs', 'cbt.relapse'];

/**
 * Modules spread over the week in this order of preference; days carrying a core measurement (or a ≥ 6-min week-1
 * measurement) are skipped, so a displaced module lands on the weekend rather than next to a mid-week practice day.
 */
const MODULE_DAY_ORDER = [1, 3, 5, 7, 6, 2, 4];

/**
 * Measurement schedule spread across the days of weeks 4, 8 and 12 (one scale a day; mood + anxiety share day 5
 * because PHQ-2+item 9 and GAD-2 are five items together). Week 4 keeps PHQ item 9 as the only safety re-check;
 * weeks 8/12 add the 3-item red-flag re-screen. The acute arm measures once, at week 4 (mood d5, red flags d6, THI d7).
 */
export function measurementTasksFor(week: number, day: number, opts: { acute: boolean; insomnia: boolean; totalWeeks: number }): string[] {
  const { acute, insomnia, totalWeeks } = opts;
  if (acute) {
    // One scale a day so the Sunday card never pushes a numbered step past the 3-step cap (mood d5, red flags d6, THI d7).
    if (week !== 4) return [];
    if (day === 5) return ['assess.mood'];
    if (day === 6) return ['assess.redflagsShort'];
    if (day === 7) return ['assess.thi'];
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

/** Programme arm from the profile (RI result optional: a negative RI moves a severe user to CBT-first). */
export function programArm(profile: Profile, riPositive?: boolean): Program['arm'] {
  const d = profile.drivers;
  if (profile.phenotypes.includes('acute')) return 'acute';
  if (d.includes('hyperacusis')) return 'hyperacusisFirst';
  if (d.includes('insomnia')) return 'sleepFirst';
  if (d.includes('somatic')) return 'somaticPlus';
  if (riPositive === false) return 'cbtFirst';
  return 'soundCbt';
}

/** Hyperacusis exposure ramp: 10 min on week 1, +5 min a week, capped at 60 (audiologist B9: level cap stays in the player). */
export const hyperExposureMinutes = (week: number) => Math.min(60, 10 + (week - 1) * 5);

function buildWeeks(profile: Profile, prefs: ProgramPrefs, dose: Dose): { weeks: ProgramWeek[]; arm: Program['arm']; notchHz?: number } {
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
  const light = dose === 'light';

  const arm = programArm(profile, prefs.riPositive);
  const core = prefs.style === 'act' ? ACT_WEEKS : prefs.style === 'mindfulness' ? MIND_WEEKS : CBT_WEEKS;
  const totalWeeks = acute ? 4 : mild ? 6 : 12;

  // Add-on priority when capacity is limited: mood (handled via referral) > insomnia > hyperacusis > somatic > hearing > experimental.
  // Add-on modules are weekly (one short module on one day) and the daily 3-step cap handles overflow,
  // so even the 15-minute default carries the single most important add-on (PM sprint 1: the consequence lines promise it).
  // A light dose keeps the add-ons the user already has (PM sprint 2 A3).
  const addOnBudget = prefs.minutesPerDay === 15 ? 1 : prefs.minutesPerDay === 30 ? 2 : 3;
  const addOns: string[] = [];
  if (insomnia) addOns.push('cbti');
  if (hyper) addOns.push('hyper');
  if (somatic) addOns.push('somatic');
  const activeAddOns = addOns.slice(0, addOnBudget);
  const hyperActive = hyper && activeAddOns.includes('hyper');
  const cbtiActive = activeAddOns.includes('cbti');
  const cbtiWeeks = profile.flags?.osaSuspect ? CBTI_WEEKS_OSA : CBTI_WEEKS;
  const notchedExperimental = tonal && activeAddOns.length < 2 && !hyper;
  const soundEnrichmentOn = !hyperActive && (!severe || prefs.riPositive !== false);
  const edu = hyperActive ? ['edu.hyperacusis', ...EDU_DRIP] : EDU_DRIP;

  const weeks: ProgramWeek[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const days: ProgramDay[] = [];
    const rationale: string[] = [];
    let themeKey = `program.theme.week${Math.min(w, 8)}`;
    if (w > 8) themeKey = w <= 10 ? 'program.theme.consolidation' : 'program.theme.booster';
    if (acute) themeKey = 'program.theme.acute';

    // Modules for the week. Week 4 of the acute arm measures THI via the measurement schedule.
    let modules = acute
      ? [...(ACUTE_WEEKS[w - 1] ?? [])]
      : mild && w === 6 ? ['cbt.relapse', 'cbt.toolbox']
      : w <= 8 ? [...core[w - 1]] : [...(LATE_WEEKS[w] ?? ['cbt.toolbox'])];
    if (hyperActive) {
      if (w === 12) modules = [...LATE_WEEK12_HYPER];
      else for (let i = 0; i < modules.length; i++) if (modules[i] === 'cbt.exposure') modules[i] = 'hyper.hierarchy';
    }
    // Light dose (iCBT "light"): one module a week; the others are not carried over.
    if (light) modules = modules.slice(0, 1);

    // Measurements of each day, known before modules are placed: core measurements (weeks 4/8/12 + gated full scales in
    // week 2) and the week-1 plan-changing measurements, only when missing (pitch d2, causes d3, hearing d4, exam d5).
    const coreMeasurements = (day: number): string[] => {
      const list = measurementTasksFor(w, day, { acute, insomnia, totalWeeks });
      if (!acute && w === 2 && day === 2 && insomnia && !prefs.sciDone) list.push('assess.sleepFull');
      if (!acute && w === 2 && day === 4 && hyper && !prefs.hqDone) list.push('assess.hyperFull');
      return list;
    };
    const weekOneMeasurements = (day: number): string[] => {
      if (acute || w !== 1) return [];
      const list: string[] = [];
      if (day === 2 && ph.includes('tonal') && !prefs.pitchHz) list.push('assess.pitch');
      if (day === 3 && !prefs.causesDone) list.push('assess.causes');
      if (day === 3 && prefs.riPositive === undefined) list.push('sound.ri');
      if (day === 4 && !prefs.hearingDone && (hearing || ph.includes('noiseInduced'))) list.push('assess.hearing');
      if (day === 5 && !prefs.examDone) list.push('assess.exam');
      return list;
    };
    /** A day whose assessment load is ≥ 6 min (scale, exam, hearing screen, pitch match) carries no module and no practice (D3). */
    const heavyAssessmentDay = (day: number) => [...coreMeasurements(day), ...weekOneMeasurements(day)].some((id) => unit(id).type === 'assessment' && unit(id).minutes >= 6);
    const moduleDays = MODULE_DAY_ORDER.filter((day) => coreMeasurements(day).length === 0 && !heavyAssessmentDay(day));

    if (!acute) rationale.push('program.rationale.cbt');
    if (acute) rationale.push('program.rationale.acute');

    for (let day = 1; day <= 7; day++) {
      const tasks: ProgramTask[] = [];
      const background: ProgramTask[] = [];
      /** Candidates for the single core of the day, in precedence order: day-1 sound step, module, first core measurement. */
      const coreCandidates: ProgramTask[] = [];
      const firstDay = w === 1 && day === 1;
      // 1. Daily check-in (one tap)
      tasks.push(task('diary.daily'));
      // 2. Day 1 "find your sound": mixing point right after the check-in so sound starts playing before the welcome module.
      if (firstDay && soundEnrichmentOn) { const mp = task('sound.mixingPoint'); tasks.push(mp); coreCandidates.push(mp); }
      // 3. Module(s) of the day
      modules.forEach((m, i) => { if (moduleDays[i] === day) { const mt = task(m); tasks.push(mt); coreCandidates.push(mt); } });
      // 4. Measurements that re-check the plan (weeks 4/8/12, one scale a day), the gated full scales in week 2 and the
      //    week-1 measurements that change the plan (only when missing).
      const measurements = coreMeasurements(day);
      measurements.forEach((id, i) => { const mt = task(id); tasks.push(mt); if (i === 0) coreCandidates.push(mt); });
      weekOneMeasurements(day).forEach((id) => tasks.push(task(id)));
      const measurementDay = measurements.length > 0 || heavyAssessmentDay(day);
      // 4b. Add-on modules of the day come before the daily practice so the 3-step cap never hides them.
      if (cbtiActive) { const m = cbtiWeeks[w]; if (m && day === 2) m.forEach((id) => tasks.push(task(id))); }
      if (hyperActive) { const m = HYPER_WEEKS[w]; if (m && day === 4) m.forEach((id) => tasks.push(task(id))); }
      // Late extras (somatic exercises, hearing pathway, Saturday reading) are collected first so the light-dose
      // practice rule can see them; they are appended after the practice to keep the display order.
      const extras: ProgramTask[] = [];
      if (activeAddOns.includes('somatic') && w <= 9) {
        extras.push(task(ph.includes('somatosensory') && profile.subtypes.includes('phenotype.somatosensory') && day % 2 === 0 ? 'somatic.orofacial' : 'somatic.cervical'));
        if (day === 1) extras.push(task('somatic.posture'));
      }
      if (hearing && w === 1 && day === 2) extras.push(task('hearing.referral'));
      if (hearing && w === 5 && day === 6) extras.push(task('cbt.hearingTactics'));
      if (day === 6 && w <= edu.length) extras.push(task(edu[w - 1]));
      if (somatic && w === 2 && day === 7) extras.push(task('edu.somatic'));
      // 5. Daily practice (rotated pool). Not on day 1 (sound + welcome only) and not on measurement days (the scale is the
      //    core). The acute arm practises from week 1 day 2 with a breathing-only pool (D4). A light dose adds the practice
      //    only on days that would otherwise be empty.
      const otherActive = tasks.some((x) => x.type !== 'diary') || extras.length > 0;
      if (!firstDay && !measurementDay && (!light || !otherActive)) {
        const practice = dailyPracticeFor(w, day, prefs.style, { acute, dose });
        if (!tasks.some((x) => x.id === practice)) tasks.push(task(practice));
      }
      // 6. Sound: graded pink-noise exposure for hyperacusis from day 1 ("find your comfortable sound", D7), otherwise
      //    enrichment (background, listed last).
      if (hyperActive) {
        const ex = task('hyper.exposure', { minutes: hyperExposureMinutes(w), ...(firstDay ? { titleKey: 'unit.hyper.exposure.first' } : {}) });
        background.push(ex);
        if (firstDay) coreCandidates.unshift(ex);
      } else if (soundEnrichmentOn) {
        const target = prefs.riPositive ? 120 : 60;
        if (w <= 8 || day % 2 === 0) background.push(task(notchedExperimental && w >= 3 ? 'sound.notched' : 'sound.enrichment', { minutes: w > 8 ? 30 : target }));
      }
      // 7. Sleep sound add-on (the sleep diary is folded into the check-in since sprint 2); then the extras.
      if (cbtiActive && w >= 2) background.unshift(task('sleep.sound'));
      tasks.push(...extras);
      // 10. Sunday: one-minute weekly card (after the THI on measurement weeks).
      if (day === 7) tasks.push(task('review.weekly'));
      // Background sound is always the last row.
      tasks.push(...background);
      // One core a day: the first candidate in precedence order.
      if (coreCandidates[0]) coreCandidates[0].core = true;
      days.push({ day, tasks });
    }
    if (cbtiActive) rationale.push('program.rationale.cbti');
    if (hyperActive) rationale.push('program.rationale.hyper');
    if (activeAddOns.includes('somatic')) rationale.push('program.rationale.somatic');
    if (hearing) rationale.push('program.rationale.hearing');
    if (prefs.riPositive) rationale.push('program.rationale.riPositive');
    if (prefs.riPositive === false) rationale.push('program.rationale.riNegative');
    if (notchedExperimental) rationale.push('program.rationale.notched');
    weeks.push({ week: w, themeKey, rationaleKeys: rationale, days });
  }
  return { weeks, arm, notchHz: notchedExperimental ? prefs.pitchHz : undefined };
}

export function generateProgram(profile: Profile, prefs: ProgramPrefs, startDate = new Date()): Program {
  const { weeks, arm, notchHz } = buildWeeks(profile, prefs, 'full');
  return {
    id: `${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    startDate: startDate.toISOString().slice(0, 10),
    weeks,
    arm,
    notchHz,
    completed: {},
  };
}

/**
 * Dose change (PM sprint 2 A3): rebuilds the programme from the current week onward at the requested dose, keeping the
 * id, start date, completed map and the weeks already behind the user. `light` = 15 min, one module a week, practices of
 * ≤ 5 min on otherwise empty days, add-ons kept; `full` restores the regular plan.
 */
export function regenerateProgram(prev: Program, profile: Profile, prefs: ProgramPrefs, opts: { dose: Dose; now?: Date }): Program {
  const { weeks, arm, notchHz } = buildWeeks(profile, prefs, opts.dose);
  const pos = programPosition(prev, opts.now ?? new Date());
  const merged = weeks.map((w, i) => (i < pos.week - 1 && prev.weeks[i] ? prev.weeks[i] : w));
  return { ...prev, weeks: merged, arm, notchHz, dose: opts.dose, doseChangedAt: new Date().toISOString() };
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
