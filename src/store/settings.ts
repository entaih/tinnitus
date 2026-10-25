import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MAINTENANCE_REMINDER_DAYS, normalizeReminderDays, type ProgramPhase } from '@/notificationRules';

export type Locale = 'tr' | 'en';

interface SettingsState {
  locale: Locale;
  appearance: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
  onboarded: boolean;
  consentAt: string | null;
  displayName: string;
  reminderHour: number | null;    // 0-23 or null
  /** Scheduled ids of the weekday reminders (S1-10); cancelled/replaced together, never the weekly review. */
  reminderIds: string[];
  /**
   * Weekdays (expo numbering, 1 = Sunday … 7 = Saturday) the daily reminder is scheduled on while the programme is
   * in maintenance (Sprint 3 C2); the active phase always reminds on all seven. Default Monday/Wednesday/Sunday.
   */
  reminderDays: number[];
  /** When the one-time "shall we remind you tomorrow?" card was shown after the first completed session (B1); null = not yet. */
  reminderPromptedAt: string | null;
  /** Scheduled id of the one-shot "+3 days 19:00" re-entry nudge, or null. */
  reentryNudgeId: string | null;
  /** Scheduled id of the measurement-week Sunday reminder (weeks 4/8/12, maintenance every 4th Sunday), or null. */
  measurementReminderId: string | null;
  /** Scheduled id of the one-shot "programme completed" notification on the programme's last day, or null. */
  programDoneReminderId: string | null;
  /** Programme dose the weekday reminders were last scheduled with (their copy differs for 'light'); null = never scheduled. */
  reminderDose: 'full' | 'light' | null;
  /** Programme phase the weekday reminders were last scheduled in (maintenance uses fewer days and other copy); null = never scheduled. */
  reminderPhase: ProgramPhase | null;
  /** When the headphone check was last passed or knowingly skipped (first sound / first test); null = never (Sprint 3 C1). */
  headphoneCheckedAt: string | null;
  /** True once the user changed the enrichment mix by hand: the pitch-matched auto-tune stops applying (C2). */
  soundTuneOverride: boolean;
  /** Hyperacusis "comfortable level" in dBFS (−40 … −18) found on the first graded-exposure open; null = not found yet (C3). */
  hyperComfortDb: number | null;
  /** Programme week in which `hyperComfortDb` was last set or the "+2 dB" nudge was answered. */
  hyperComfortWeek: number | null;
  maxVolume: number;              // 0..1 output cap
  nightStart: number; nightEnd: number;
  setLocale: (l: Locale) => void;
  setAppearance: (a: SettingsState['appearance']) => void;
  setReduceMotion: (v: boolean) => void;
  completeOnboarding: (name: string) => void;
  setReminderHour: (h: number | null) => void;
  setReminderIds: (ids: string[]) => void;
  setReminderDays: (days: number[]) => void;
  setReminderPromptedAt: (iso: string | null) => void;
  setReentryNudgeId: (id: string | null) => void;
  setMeasurementReminderId: (id: string | null) => void;
  setProgramDoneReminderId: (id: string | null) => void;
  setReminderDose: (d: 'full' | 'light' | null) => void;
  setReminderPhase: (p: ProgramPhase | null) => void;
  setHeadphoneCheckedAt: (iso: string | null) => void;
  setSoundTuneOverride: (v: boolean) => void;
  setHyperComfort: (db: number | null, week: number | null) => void;
  setMaxVolume: (v: number) => void;
  setDisplayName: (n: string) => void;
  resetAll: () => void;
}

const initial = {
  locale: 'tr' as Locale, appearance: 'system' as const, reduceMotion: false, onboarded: false, consentAt: null,
  displayName: '', reminderHour: 20, maxVolume: 0.85, nightStart: 22, nightEnd: 6,
  reminderIds: [] as string[], reminderDays: [...DEFAULT_MAINTENANCE_REMINDER_DAYS], reminderPromptedAt: null as string | null,
  reentryNudgeId: null as string | null, measurementReminderId: null as string | null, programDoneReminderId: null as string | null,
  reminderDose: null as 'full' | 'light' | null, reminderPhase: null as ProgramPhase | null, headphoneCheckedAt: null as string | null,
  soundTuneOverride: false, hyperComfortDb: null as number | null, hyperComfortWeek: null as number | null,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...initial,
      setLocale: (locale) => set({ locale }),
      setAppearance: (appearance) => set({ appearance }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      completeOnboarding: (displayName) => set({ onboarded: true, consentAt: new Date().toISOString(), displayName }),
      setReminderHour: (reminderHour) => set({ reminderHour }),
      setReminderIds: (reminderIds) => set({ reminderIds }),
      setReminderDays: (days) => set({ reminderDays: normalizeReminderDays(days) }),
      setReminderPromptedAt: (reminderPromptedAt) => set({ reminderPromptedAt }),
      setReentryNudgeId: (reentryNudgeId) => set({ reentryNudgeId }),
      setMeasurementReminderId: (measurementReminderId) => set({ measurementReminderId }),
      setProgramDoneReminderId: (programDoneReminderId) => set({ programDoneReminderId }),
      setReminderDose: (reminderDose) => set({ reminderDose }),
      setReminderPhase: (reminderPhase) => set({ reminderPhase }),
      setHeadphoneCheckedAt: (headphoneCheckedAt) => set({ headphoneCheckedAt }),
      setSoundTuneOverride: (soundTuneOverride) => set({ soundTuneOverride }),
      setHyperComfort: (hyperComfortDb, hyperComfortWeek) => set({ hyperComfortDb, hyperComfortWeek }),
      setMaxVolume: (maxVolume) => set({ maxVolume }),
      setDisplayName: (displayName) => set({ displayName }),
      resetAll: () => set({ ...initial, reminderDays: [...DEFAULT_MAINTENANCE_REMINDER_DAYS] }),
    }),
    { name: 'dingin.settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/**
 * True until the headphone check has been passed or knowingly skipped once (`settings.headphoneCheckedAt`).
 * Sound and test screens gate their first open on it (Sprint 3 C1); the 60-second trial never does.
 */
export function needsHeadphoneCheck(): boolean {
  return useSettings.getState().headphoneCheckedAt == null;
}

/** Record that the headphone check was passed or skipped now (idempotent helper for screens). */
export function markHeadphoneChecked(): void {
  useSettings.getState().setHeadphoneCheckedAt(new Date().toISOString());
}
