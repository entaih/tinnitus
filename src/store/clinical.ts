import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment, CaseHistory, DiaryEntry, HearingScreenResult, Program, PsychoacousticResult, QuestionnaireResult, RedFlags } from '@/clinical/types';

export interface ThoughtRecord {
  id: string; date: string; situation: string; thought: string; emotion: string; intensity: number;
  evidenceFor: string; evidenceAgainst: string; balanced: string; intensityAfter: number;
}

export interface SessionLog { id: string; date: string; type: string; minutes: number; detail?: string }

interface ClinicalState {
  assessments: Assessment[];           // newest last
  diary: DiaryEntry[];
  thoughts: ThoughtRecord[];
  sessions: SessionLog[];
  program: Program | null;
  readArticles: string[];
  redFlagAcknowledgedAt: string | null;

  startAssessment: () => string;
  saveHistory: (id: string, h: CaseHistory) => void;
  saveRedFlags: (id: string, r: RedFlags) => void;
  saveQuestionnaire: (id: string, q: QuestionnaireResult) => void;
  saveHearing: (id: string, h: HearingScreenResult) => void;
  savePsycho: (id: string, p: Partial<PsychoacousticResult>) => void;
  upsertDiary: (e: DiaryEntry) => void;
  addThought: (t: ThoughtRecord) => void;
  logSession: (s: Omit<SessionLog, 'id' | 'date'>) => void;
  setProgram: (p: Program | null) => void;
  completeTask: (taskKey: string) => void;
  markRead: (slug: string) => void;
  acknowledgeRedFlag: () => void;
  wipe: () => void;
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
export const today = () => new Date().toISOString().slice(0, 10);

/** Apply fn to the assessment with this id, creating the record first if it does not exist yet. */
const update = (list: Assessment[], id: string, fn: (a: Assessment) => Assessment) => {
  if (!list.some((a) => a.id === id)) list = [...list, { id, date: new Date().toISOString(), questionnaires: [] }];
  return list.map((a) => (a.id === id ? fn(a) : a));
};

export const useClinical = create<ClinicalState>()(
  persist(
    (set, get) => ({
      assessments: [], diary: [], thoughts: [], sessions: [], program: null, readArticles: [], redFlagAcknowledgedAt: null,

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
      upsertDiary: (e) => set((s) => ({ diary: [...s.diary.filter((d) => d.date !== e.date), e].sort((a, b) => a.date.localeCompare(b.date)) })),
      addThought: (t) => set((s) => ({ thoughts: [t, ...s.thoughts] })),
      logSession: (x) => set((s) => ({ sessions: [...s.sessions, { ...x, id: newId(), date: new Date().toISOString() }].slice(-2000) })),
      setProgram: (program) => set({ program }),
      completeTask: (taskKey) => set((s) => (s.program ? { program: { ...s.program, completed: { ...s.program.completed, [taskKey]: new Date().toISOString() } } } : {})),
      markRead: (slug) => set((s) => ({ readArticles: s.readArticles.includes(slug) ? s.readArticles : [...s.readArticles, slug] })),
      acknowledgeRedFlag: () => set({ redFlagAcknowledgedAt: new Date().toISOString() }),
      wipe: () => set({ assessments: [], diary: [], thoughts: [], sessions: [], program: null, readArticles: [], redFlagAcknowledgedAt: null }),
    }),
    { name: 'dingin.clinical', storage: createJSONStorage(() => AsyncStorage) },
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
    for (const q of a.questionnaires) merged.questionnaires = [...merged.questionnaires.filter((x) => x.id !== q.id), q];
  }
  return merged;
}
