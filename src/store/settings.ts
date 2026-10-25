import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locale = 'tr' | 'en';

interface SettingsState {
  locale: Locale;
  appearance: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
  onboarded: boolean;
  consentAt: string | null;
  displayName: string;
  reminderHour: number | null;    // 0-23 or null
  /** Scheduled ids of the 7 weekday reminders (S1-10); cancelled/replaced together, never the weekly review. */
  reminderIds: string[];
  /** Scheduled id of the one-shot "+3 days 19:00" re-entry nudge, or null. */
  reentryNudgeId: string | null;
  /** Scheduled id of the measurement-week Sunday reminder (weeks 4/8/12), or null. */
  measurementReminderId: string | null;
  maxVolume: number;              // 0..1 output cap
  nightStart: number; nightEnd: number;
  setLocale: (l: Locale) => void;
  setAppearance: (a: SettingsState['appearance']) => void;
  setReduceMotion: (v: boolean) => void;
  completeOnboarding: (name: string) => void;
  setReminderHour: (h: number | null) => void;
  setReminderIds: (ids: string[]) => void;
  setReentryNudgeId: (id: string | null) => void;
  setMeasurementReminderId: (id: string | null) => void;
  setMaxVolume: (v: number) => void;
  setDisplayName: (n: string) => void;
  resetAll: () => void;
}

const initial = {
  locale: 'tr' as Locale, appearance: 'system' as const, reduceMotion: false, onboarded: false, consentAt: null,
  displayName: '', reminderHour: 20, maxVolume: 0.85, nightStart: 22, nightEnd: 6,
  reminderIds: [] as string[], reentryNudgeId: null as string | null, measurementReminderId: null as string | null,
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
      setReentryNudgeId: (reentryNudgeId) => set({ reentryNudgeId }),
      setMeasurementReminderId: (measurementReminderId) => set({ measurementReminderId }),
      setMaxVolume: (maxVolume) => set({ maxVolume }),
      setDisplayName: (displayName) => set({ displayName }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'dingin.settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
