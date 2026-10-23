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
  maxVolume: number;              // 0..1 output cap
  nightStart: number; nightEnd: number;
  setLocale: (l: Locale) => void;
  setAppearance: (a: SettingsState['appearance']) => void;
  setReduceMotion: (v: boolean) => void;
  completeOnboarding: (name: string) => void;
  setReminderHour: (h: number | null) => void;
  setMaxVolume: (v: number) => void;
  setDisplayName: (n: string) => void;
  resetAll: () => void;
}

const initial = {
  locale: 'tr' as Locale, appearance: 'system' as const, reduceMotion: false, onboarded: false, consentAt: null,
  displayName: '', reminderHour: 20, maxVolume: 0.85, nightStart: 22, nightEnd: 6,
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
      setMaxVolume: (maxVolume) => set({ maxVolume }),
      setDisplayName: (displayName) => set({ displayName }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'dingin.settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
