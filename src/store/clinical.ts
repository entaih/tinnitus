import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment, CaseHistory, DiaryEntry, ExamResult, HearingScreenResult, Program, PsychoacousticResult, QuestionnaireResult, RedFlags } from '@/clinical/types';
import * as prog from '@/clinical/program';
import type { ProgramPrefs } from '@/clinical/program';
import { buildProfile } from '@/clinical/engine';
import { pruneForStorage } from '@/clinical/retention';
import type { DxSnapshot } from '@/clinical/diagnosis';

export interface ThoughtRecord {
  id: string; date: string; situation: string; thought: string; emotion: string; intensity: number;
  evidenceFor: string; evidenceAgainst: string; balanced: string; intensityAfter: number;
}

export interface SessionLog { id: string; date: string; type: string; minutes: number; detail?: string }

interface ClinicalData {
  assessments: Assessment[];           // newest last
  diary: DiaryEntry[];
  thoughts: ThoughtRecord[];
  sessions: SessionLog[];
  program: Program | null;
  /** Preferences the current programme was generated with (needed to regenerate it at another dose). */
  programPrefs: ProgramPrefs | null;
  readArticles: string[];
  redFlagAcknowledgedAt: string | null;
}

interface ClinicalState extends ClinicalData {
  startAssessment: () => string;
  saveHistory: (id: string, h: CaseHistory) => void;
  saveRedFlags: (id: string, r: RedFlags) => void;
  saveQuestionnaire: (id: string, q: QuestionnaireResult) => void;
  saveHearing: (id: string, h: HearingScreenResult) => void;
  savePsycho: (id: string, p: Partial<PsychoacousticResult>) => void;
  saveCauseAnswers: (id: string, answers: Record<string, boolean>) => void;
  saveExam: (id: string, e: Partial<ExamResult>) => void;
  /** Sprint 3 A2: snapshot of the preliminary diagnosis (results screen), preview card seen, sound trial offered/skipped. */
  saveDxSnapshot: (snap: DxSnapshot) => void;
  markPreviewSeen: () => void;
  markSoundTry: () => void;
  upsertDiary: (e: DiaryEntry) => void;
  addThought: (t: ThoughtRecord) => void;
  logSession: (s: Omit<SessionLog, 'id' | 'date'>) => void;
  setProgram: (p: Program | null) => void;
  setProgramPrefs: (p: ProgramPrefs | null) => void;
  completeTask: (taskKey: string) => void;
  /** Sprint 3 A1: maintenance mode. `enterMaintenance` appends the first 4-week block; `ensureMaintenance` (Home open)
   *  appends further blocks on the last week; `startRefresher` rebuilds the next two weeks as a refresher block;
   *  `restartProgram` regenerates from scratch (completed map cleared). */
  enterMaintenance: () => void;
  ensureMaintenance: () => void;
  startRefresher: () => void;
  restartProgram: () => void;
  markRead: (slug: string) => void;
  acknowledgeRedFlag: () => void;
  wipe: () => void;
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
export const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: ClinicalData = { assessments: [], diary: [], thoughts: [], sessions: [], program: null, programPrefs: null, readArticles: [], redFlagAcknowledgedAt: null };

/** Apply fn to the assessment with this id, creating the record first if it does not exist yet. */
const update = (list: Assessment[], id: string, fn: (a: Assessment) => Assessment) => {
  if (!list.some((a) => a.id === id)) list = [...list, { id, date: new Date().toISOString(), questionnaires: [] }];
  return list.map((a) => (a.id === id ? fn(a) : a));
};

/** Apply fn to the newest assessment (the one the journey and the results screen work on), creating one if none exists. */
const updateLatest = (list: Assessment[], fn: (a: Assessment) => Assessment) => {
  const last = list[list.length - 1];
  return update(list, last ? last.id : newId(), fn);
};

/** Profile + preferences the programme helpers need, derived from the stored assessments (null without an assessment). */
const programContext = (s: ClinicalData): { profile: ReturnType<typeof buildProfile>; prefs: ProgramPrefs } | null => {
  const a = mergedLatest(s.assessments);
  if (!a) return null;
  return { profile: buildProfile(a), prefs: { minutesPerDay: 15, style: 'cbt', ...s.programPrefs, ...prog.assessmentPrefs(a) } };
};

export const useClinical = create<ClinicalState>()(
  persist(
    (set, get) => ({
      ...EMPTY,

      startAssessment: () => {
        // Reuse an assessment started today so the hub accumulates results into one record.
        const existing = get().assessments.find((a) => a.date.slice(0, 10) === today());
        if (existing) return existing.id;
        const id = newId();
        set((s) => ({ assessments: [...s.assessments, { id, date: new Date().toISOString(), questionnaires: [] }] }));
        return id;
      },
      saveHistory: (id, history) => set((s) => ({ assessments: update(s.assessments, id, (a) => ({ ...a, history })) })),
      saveRedFlags: (id, redFlags) => set((s) => ({ assessments: update(s.assessments, id, (a) => ({ ...a, redFlags })), redFlagAcknowledgedAt: null })),
      saveQuestionnaire: (id, q) => set((s) => ({
        assessments: update(s.assessments, id, (a) => ({ ...a, questionnaires: [...a.questionnaires.filter((x) => x.id !== q.id), q] })),
      })),
      saveHearing: (id, hearing) => set((s) => ({ assessments: update(s.assessments, id, (a) => ({ ...a, hearing })) })),
      savePsycho: (id, p) => set((s) => ({
        assessments: update(s.assessments, id, (a) => ({ ...a, psycho: { ...(a.psycho ?? { date: new Date().toISOString() }), ...p, date: new Date().toISOString() } })),
      })),
      saveExam: (id, e) => set((s) => ({ assessments: update(s.assessments, id, (a) => ({ ...a, exam: { ...(a.exam ?? { date: new Date().toISOString() }), ...e, date: new Date().toISOString() } })) })),
      saveCauseAnswers: (id, answers) => set((s) => ({ assessments: update(s.assessments, id, (a) => ({ ...a, causeAnswers: { ...(a.causeAnswers ?? {}), ...answers } })) })),
      saveDxSnapshot: (dxSnapshot) => set((s) => ({ assessments: updateLatest(s.assessments, (a) => ({ ...a, dxSnapshot })) })),
      markPreviewSeen: () => set((s) => ({ assessments: updateLatest(s.assessments, (a) => (a.previewSeenAt ? a : { ...a, previewSeenAt: new Date().toISOString() })) })),
      markSoundTry: () => set((s) => ({ assessments: updateLatest(s.assessments, (a) => (a.soundTryAt ? a : { ...a, soundTryAt: new Date().toISOString() })) })),
      upsertDiary: (e) => set((s) => ({ diary: [...s.diary.filter((d) => d.date !== e.date), e].sort((a, b) => a.date.localeCompare(b.date)) })),
      addThought: (t) => set((s) => ({ thoughts: [t, ...s.thoughts] })),
      logSession: (x) => set((s) => ({ sessions: [...s.sessions, { ...x, id: newId(), date: new Date().toISOString() }].slice(-2000) })),
      setProgram: (program) => set({ program }),
      setProgramPrefs: (programPrefs) => set({ programPrefs }),
      completeTask: (taskKey) => set((s) => (s.program ? { program: { ...s.program, completed: { ...s.program.completed, [taskKey]: new Date().toISOString() } } } : {})),
      enterMaintenance: () => set((s) => {
        const ctx = programContext(s);
        if (!s.program || !ctx) return {};
        return { program: prog.enterMaintenance(s.program, ctx.profile, ctx.prefs) };
      }),
      ensureMaintenance: () => set((s) => {
        if (!s.program || s.program.phase !== 'maintenance') return {};
        const ctx = programContext(s);
        if (!ctx) return {};
        const next = prog.extendMaintenance(s.program, ctx.profile, ctx.prefs);
        return next === s.program ? {} : { program: next };
      }),
      startRefresher: () => set((s) => {
        const ctx = programContext(s);
        if (!s.program || !ctx) return {};
        return { program: prog.startRefresher(s.program, ctx.profile, ctx.prefs) };
      }),
      restartProgram: () => set((s) => {
        const ctx = programContext(s);
        if (!ctx) return {};
        return { program: prog.generateProgram(ctx.profile, ctx.prefs), programPrefs: ctx.prefs };
      }),
      markRead: (slug) => set((s) => ({ readArticles: s.readArticles.includes(slug) ? s.readArticles : [...s.readArticles, slug] })),
      acknowledgeRedFlag: () => set({ redFlagAcknowledgedAt: new Date().toISOString() }),
      wipe: () => set({ ...EMPTY }),
    }),
    {
      name: 'dingin.clinical',
      storage: createJSONStorage(() => AsyncStorage),
      // Sprint 3 E11: only data is persisted, with the session log capped at 500 entries (detail ≤ 120 chars) and the diary at 730 days.
      partialize: (s) => pruneForStorage({
        assessments: s.assessments, diary: s.diary, thoughts: s.thoughts, sessions: s.sessions, program: s.program,
        programPrefs: s.programPrefs, readArticles: s.readArticles, redFlagAcknowledgedAt: s.redFlagAcknowledgedAt,
      }) as unknown as ClinicalState,
    },
  ),
);

/** Latest assessment (may be partial). */
export const selectLatest = (s: ClinicalState) => s.assessments[s.assessments.length - 1] ?? null;

/** Most recent value of a questionnaire across assessments. */
export function latestQuestionnaire(assessments: Assessment[], id: QuestionnaireResult['id']): QuestionnaireResult | null {
  for (let i = assessments.length - 1; i >= 0; i--) {
    const q = assessments[i].questionnaires.find((x) => x.id === id);
    if (q) return q;
  }
  return null;
}

/** Merge the newest value of each component across assessments (so a profile can use last week's THI with today's pitch match). */
export function mergedLatest(assessments: Assessment[]): Assessment | null {
  if (!assessments.length) return null;
  const merged: Assessment = { id: 'merged', date: assessments[assessments.length - 1].date, questionnaires: [] };
  for (const a of assessments) {
    if (a.history) merged.history = a.history;
    if (a.redFlags) merged.redFlags = a.redFlags;
    if (a.hearing) merged.hearing = a.hearing;
    if (a.psycho) merged.psycho = { ...(merged.psycho ?? { date: a.psycho.date }), ...a.psycho };
    if (a.causeAnswers) merged.causeAnswers = { ...(merged.causeAnswers ?? {}), ...a.causeAnswers };
    if (a.exam) merged.exam = { ...(merged.exam ?? { date: a.exam.date }), ...a.exam };
    if (a.dxSnapshot) merged.dxSnapshot = a.dxSnapshot;
    if (a.previewSeenAt) merged.previewSeenAt = a.previewSeenAt;
    if (a.soundTryAt) merged.soundTryAt = a.soundTryAt;
    for (const q of a.questionnaires) merged.questionnaires = [...merged.questionnaires.filter((x) => x.id !== q.id), q];
  }
  return merged;
}
