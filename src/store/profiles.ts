import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type PersonProfile, type ProfilesData, activeProfile, addProfile, initialProfiles, removeProfile, renameProfile } from './profileRules';

interface ProfilesState extends ProfilesData {
  hydrated: boolean;
  /** Registers a new person (does not switch the stores — see profileSwitch.ts). Returns the id or null. */
  add: (name: string) => string | null;
  rename: (id: string, name: string) => void;
  /** Removes the profile record; returns whether the active profile changed. */
  remove: (id: string) => { removed: boolean; switched: boolean };
  setActive: (id: string) => void;
}

export const useProfiles = create<ProfilesState>()(
  persist(
    (set, get) => ({
      ...initialProfiles(),
      hydrated: false,
      add: (name) => {
        const r = addProfile(get(), name);
        if (r.id) set({ profiles: r.data.profiles });
        return r.id;
      },
      rename: (id, name) => set((s) => ({ profiles: renameProfile(s, id, name).profiles })),
      remove: (id) => {
        const r = removeProfile(get(), id);
        if (r.removed) set({ profiles: r.data.profiles, activeId: r.data.activeId });
        return { removed: r.removed, switched: r.switched };
      },
      setActive: (id) => set((s) => (s.profiles.some((p) => p.id === id) ? { activeId: id } : {})),
    }),
    {
      name: 'dingin.profiles',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profiles: s.profiles, activeId: s.activeId }),
      onRehydrateStorage: () => () => { useProfiles.setState({ hydrated: true }); },
    },
  ),
);

export const selectActiveProfile = (s: ProfilesData): PersonProfile => activeProfile(s);
