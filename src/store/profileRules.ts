/**
 * Pure rules for on-device "kişiler" (people) profiles. Each profile owns its own copy of the clinical store,
 * growth counters and module progress, kept under suffixed AsyncStorage keys. The first profile keeps the
 * legacy (unsuffixed) keys so existing installs lose nothing. Settings (language, theme, reminders, sound safety)
 * stay device-wide.
 */
export interface PersonProfile {
  id: string;
  name: string;
  createdAt: string;
}

export const DEFAULT_PROFILE_ID = 'default';
export const MAX_PROFILES = 8;
export const PROFILE_NAME_MAX = 40;

/** AsyncStorage keys that are duplicated per profile (base names of the zustand persist stores). */
export const SCOPED_STORE_BASES = ['dingin.clinical', 'dingin.growth', 'dingin.moduleProgress'] as const;

/** Storage key of a scoped store for a profile: the default profile keeps the legacy unsuffixed key. */
export const storageKeyFor = (base: string, profileId: string) => (profileId === DEFAULT_PROFILE_ID ? base : `${base}.${profileId}`);

export const newProfileId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const cleanProfileName = (name: string) => name.replace(/\s+/g, ' ').trim().slice(0, PROFILE_NAME_MAX);

export interface ProfilesData { profiles: PersonProfile[]; activeId: string }

export const initialProfiles = (defaultName = ''): ProfilesData => ({
  profiles: [{ id: DEFAULT_PROFILE_ID, name: defaultName, createdAt: new Date().toISOString() }],
  activeId: DEFAULT_PROFILE_ID,
});

/** Adds a profile (not yet active). Returns the unchanged data when the limit is reached or the name is empty. */
export function addProfile(d: ProfilesData, name: string, id = newProfileId(), now = new Date()): { data: ProfilesData; id: string | null } {
  const clean = cleanProfileName(name);
  if (!clean || d.profiles.length >= MAX_PROFILES || d.profiles.some((p) => p.id === id)) return { data: d, id: null };
  return { data: { ...d, profiles: [...d.profiles, { id, name: clean, createdAt: now.toISOString() }] }, id };
}

export function renameProfile(d: ProfilesData, id: string, name: string): ProfilesData {
  const clean = cleanProfileName(name);
  if (!clean) return d;
  return { ...d, profiles: d.profiles.map((p) => (p.id === id ? { ...p, name: clean } : p)) };
}

/**
 * Removes a profile. The last remaining profile cannot be removed (its data is wiped instead, by the caller).
 * When the active profile is removed, the first remaining one becomes active; `switched` tells the caller to reload stores.
 */
export function removeProfile(d: ProfilesData, id: string): { data: ProfilesData; removed: boolean; switched: boolean } {
  if (d.profiles.length <= 1 || !d.profiles.some((p) => p.id === id)) return { data: d, removed: false, switched: false };
  const profiles = d.profiles.filter((p) => p.id !== id);
  const switched = d.activeId === id;
  return { data: { profiles, activeId: switched ? profiles[0].id : d.activeId }, removed: true, switched };
}

export const activeProfile = (d: ProfilesData): PersonProfile => d.profiles.find((p) => p.id === d.activeId) ?? d.profiles[0];

/** All storage keys owned by a profile (for deletion). */
export const storageKeysOf = (profileId: string) => SCOPED_STORE_BASES.map((b) => storageKeyFor(b, profileId));
