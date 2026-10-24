/**
 * Growth & trust store (zustand + AsyncStorage). Everything here stays on the device:
 * - anonymous local funnel counters (no network, no scores, no free text — only event name + count),
 * - the 3-3-3 crisis safety plan the user fills in,
 * - the clinic attribution code (B2B2C) — nothing is sent anywhere,
 * - the weekly review reminder setting and an invite code for the share sheet.
 *
 * Other screens may adopt `useGrowth().track(event)`; nothing in the app reads these counters except
 * the "Yerel sayaçlar" debug line in Settings → Hakkında.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatClinicCode, isValidClinicCode, normalizeClinicCode } from '@/components/growth/clinicCode';

export type GrowthEvent = 'install' | 'assessmentStarted' | 'assessmentCompleted' | 'programStarted' | 'sessionCompleted' | 'shareOpened';
export const GROWTH_EVENTS: GrowthEvent[] = ['install', 'assessmentStarted', 'assessmentCompleted', 'programStarted', 'sessionCompleted', 'shareOpened'];

export interface SafetyPlan {
  /** 3 people I can call. */
  people: [string, string, string];
  /** 3 places where I feel safe. */
  places: [string, string, string];
  /** 3 activities that help me through the next hour. */
  activities: [string, string, string];
  updatedAt: string | null;
}

export interface ClinicAttribution {
  /** Normalised code, e.g. KBBANK17X. */
  code: string;
  /** Derived label only ("Klinik KBB-ANK-17X"); clinic names are never shown for promotion. */
  clinicName: string;
  enteredAt: string;
}

export interface WeeklyReviewSetting {
  /** 1 = Sunday … 7 = Saturday (expo-notifications convention). */
  weekday: number;
  /** 0–23 local time. */
  hour: number;
  /** Scheduled notification id, so it can be cancelled without touching the daily reminder. */
  notificationId: string | null;
}

interface GrowthState {
  counters: Partial<Record<GrowthEvent, number>>;
  firstEventAt: string | null;
  lastEventAt: string | null;
  safetyPlan: SafetyPlan;
  clinic: ClinicAttribution | null;
  weeklyReview: WeeklyReviewSetting | null;
  /** Random, non-identifying code embedded in the invite deep link (dingin://invite?from=…). */
  inviteCode: string;

  track: (event: GrowthEvent) => void;
  setSafetyPlanItem: (group: 'people' | 'places' | 'activities', index: 0 | 1 | 2, value: string) => void;
  clearSafetyPlan: () => void;
  /** Validates the checksum; returns false (and stores nothing) for an invalid code. */
  setClinicCode: (input: string) => boolean;
  clearClinic: () => void;
  setWeeklyReview: (v: WeeklyReviewSetting | null) => void;
  resetCounters: () => void;
  reset: () => void;
}

const emptyPlan = (): SafetyPlan => ({ people: ['', '', ''], places: ['', '', ''], activities: ['', '', ''], updatedAt: null });
const makeInviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const initial = {
  counters: {} as Partial<Record<GrowthEvent, number>>,
  firstEventAt: null as string | null,
  lastEventAt: null as string | null,
  safetyPlan: emptyPlan(),
  clinic: null as ClinicAttribution | null,
  weeklyReview: null as WeeklyReviewSetting | null,
};

export const clinicLabel = (code: string) => `Klinik ${formatClinicCode(code)}`;

export const useGrowth = create<GrowthState>()(
  persist(
    (set, get) => ({
      ...initial,
      inviteCode: makeInviteCode(),

      track: (event) => set((s) => {
        const now = new Date().toISOString();
        return { counters: { ...s.counters, [event]: (s.counters[event] ?? 0) + 1 }, firstEventAt: s.firstEventAt ?? now, lastEventAt: now };
      }),
      setSafetyPlanItem: (group, index, value) => set((s) => {
        const list = [...s.safetyPlan[group]] as [string, string, string];
        list[index] = value.slice(0, 80);
        return { safetyPlan: { ...s.safetyPlan, [group]: list, updatedAt: new Date().toISOString() } };
      }),
      clearSafetyPlan: () => set({ safetyPlan: emptyPlan() }),
      setClinicCode: (input) => {
        if (!isValidClinicCode(input)) return false;
        const code = normalizeClinicCode(input);
        set({ clinic: { code, clinicName: clinicLabel(code), enteredAt: new Date().toISOString() } });
        return true;
      },
      clearClinic: () => set({ clinic: null }),
      setWeeklyReview: (weeklyReview) => set({ weeklyReview }),
      resetCounters: () => set({ counters: {}, firstEventAt: null, lastEventAt: null }),
      reset: () => set({ ...initial, inviteCode: get().inviteCode || makeInviteCode() }),
    }),
    { name: 'dingin.growth', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** True once the user has written at least one item of the safety plan. */
export const hasSafetyPlan = (p: SafetyPlan) => [...p.people, ...p.places, ...p.activities].some((x) => x.trim().length > 0);
