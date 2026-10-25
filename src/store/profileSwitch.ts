/**
 * Switches the per-person stores (clinical, growth, module progress) to another profile's storage keys.
 * Order matters: point the persist middleware at the new key first, then reset the in-memory state (which
 * writes an empty record under the new key, never the old one), then rehydrate from whatever that key holds.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useClinical } from './clinical';
import { useGrowth } from './growth';
import { useModuleProgress } from '@/components/home/moduleProgress';
import { useProfiles } from './profiles';
import { DEFAULT_PROFILE_ID, storageKeyFor, storageKeysOf } from './profileRules';

let currentId: string = DEFAULT_PROFILE_ID;
export const currentStoreProfileId = () => currentId;

export async function switchProfileStores(profileId: string): Promise<void> {
  if (profileId === currentId) return;
  currentId = profileId;
  useClinical.persist.setOptions({ name: storageKeyFor('dingin.clinical', profileId) });
  useClinical.getState().wipe();
  await useClinical.persist.rehydrate();
  useGrowth.persist.setOptions({ name: storageKeyFor('dingin.growth', profileId) });
  useGrowth.getState().reset();
  await useGrowth.persist.rehydrate();
  useModuleProgress.persist.setOptions({ name: storageKeyFor('dingin.moduleProgress', profileId) });
  useModuleProgress.getState().clearAll();
  await useModuleProgress.persist.rehydrate();
}

/** Deletes a profile's stored data. Never call for the profile whose stores are currently loaded. */
export async function deleteProfileStorage(profileId: string): Promise<void> {
  try { await AsyncStorage.multiRemove(storageKeysOf(profileId)); } catch { /* best effort */ }
}

/** Creates a person, switches to their (empty) stores and makes them active. */
export async function createAndActivateProfile(name: string): Promise<string | null> {
  const id = useProfiles.getState().add(name);
  if (!id) return null;
  await switchProfileStores(id);
  useProfiles.getState().setActive(id);
  return id;
}

export async function activateProfile(id: string): Promise<void> {
  if (!useProfiles.getState().profiles.some((p) => p.id === id)) return;
  await switchProfileStores(id);
  useProfiles.getState().setActive(id);
}

/** Removes a person and their data; the last person cannot be removed (their data is wiped instead). */
export async function deletePerson(id: string): Promise<void> {
  const st = useProfiles.getState();
  if (st.profiles.length <= 1) {
    useClinical.getState().wipe();
    useGrowth.getState().reset();
    useModuleProgress.getState().clearAll();
    return;
  }
  const { removed, switched } = st.remove(id);
  if (!removed) return;
  if (switched) await switchProfileStores(useProfiles.getState().activeId);
  await deleteProfileStorage(id);
}

/** On app start: once the profile list is hydrated, load the active person's stores. */
export async function bootProfiles(): Promise<void> {
  const st = useProfiles.getState();
  if (!st.hydrated) {
    // Never block the app on storage: give hydration at most 3 s, then continue with the default person.
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => { unsub(); resolve(); }, 3000);
      const unsub = useProfiles.subscribe((s) => { if (s.hydrated) { clearTimeout(timer); unsub(); resolve(); } });
      if (useProfiles.getState().hydrated) { clearTimeout(timer); unsub(); resolve(); }
    });
  }
  try { await switchProfileStores(useProfiles.getState().activeId); } catch { /* keep the default person loaded */ }
}
