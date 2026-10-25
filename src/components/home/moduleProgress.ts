/**
 * Resume position of half-read modules (PM sprint 2 §B3): `progress[moduleId] = index of the last section reached`.
 * Kept as a small zustand slice of its own (AsyncStorage key `dingin.moduleProgress`) so the clinical store stays
 * untouched. Cleared when the module is completed.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ModuleProgressState {
  progress: Record<string, number>;
  setProgress: (moduleId: string, sectionIndex: number) => void;
  clearProgress: (moduleId: string) => void;
}

export const useModuleProgress = create<ModuleProgressState>()(
  persist(
    (set) => ({
      progress: {},
      setProgress: (moduleId, sectionIndex) => set((s) => (s.progress[moduleId] === sectionIndex ? {} : { progress: { ...s.progress, [moduleId]: sectionIndex } })),
      clearProgress: (moduleId) => set((s) => {
        if (!(moduleId in s.progress)) return {};
        const next = { ...s.progress };
        delete next[moduleId];
        return { progress: next };
      }),
    }),
    { name: 'dingin.moduleProgress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Section index to resume from: the saved position when it is past the first section, otherwise null. */
export function resumeIndex(progress: Record<string, number>, moduleId: string, sectionCount: number): number | null {
  const i = progress[moduleId];
  return typeof i === 'number' && i > 0 && i < sectionCount ? i : null;
}
