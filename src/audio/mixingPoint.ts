import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The user's "mixing point": the playback level (0..1) just below which their tinnitus and the
 * enrichment noise start to blend (docs/research/treatment.md §3.3 — enrichment sits just below it).
 * Stored outside the settings store so this module can be owned by the sound area.
 */
const KEY = 'dingin.mixingPoint';
const FLAG_PREFIX = 'dingin.flag.';

let cache: number | null | undefined;
const listeners = new Set<() => void>();

export async function getMixingPoint(): Promise<number | null> {
  if (cache !== undefined) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const v = raw == null ? null : Number(raw);
    cache = v == null || Number.isNaN(v) ? null : Math.max(0, Math.min(1, v));
  } catch {
    cache = null;
  }
  return cache;
}

export async function setMixingPoint(value: number | null): Promise<void> {
  cache = value == null ? null : Math.max(0, Math.min(1, value));
  listeners.forEach((l) => l());
  try {
    if (cache == null) await AsyncStorage.removeItem(KEY);
    else await AsyncStorage.setItem(KEY, String(cache));
  } catch (e) {
    console.warn('mixingPoint persist failed', e);
  }
}

/** Reactive accessor. `loaded` is false until AsyncStorage has been read once. */
export function useMixingPoint(): { value: number | null; loaded: boolean; set: (v: number | null) => Promise<void> } {
  const [value, setValue] = useState<number | null>(cache ?? null);
  const [loaded, setLoaded] = useState(cache !== undefined);
  useEffect(() => {
    let alive = true;
    void getMixingPoint().then((v) => { if (alive) { setValue(v); setLoaded(true); } });
    const l = () => setValue(cache ?? null);
    listeners.add(l);
    return () => { alive = false; listeners.delete(l); };
  }, []);
  const set = useCallback((v: number | null) => setMixingPoint(v), []);
  return { value, loaded, set };
}

/** One-shot boolean flags (e.g. "Android background note shown"). */
export async function getFlag(name: string): Promise<boolean> {
  try { return (await AsyncStorage.getItem(FLAG_PREFIX + name)) === '1'; } catch { return false; }
}
export async function setFlag(name: string, on = true): Promise<void> {
  try {
    if (on) await AsyncStorage.setItem(FLAG_PREFIX + name, '1');
    else await AsyncStorage.removeItem(FLAG_PREFIX + name);
  } catch {}
}

/** True until the flag has been set; `dismiss()` sets it. Returns false while loading. */
export function useOnceFlag(name: string): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    void getFlag(name).then((seen) => { if (alive) setShow(!seen); });
    return () => { alive = false; };
  }, [name]);
  const dismiss = useCallback(() => { setShow(false); void setFlag(name, true); }, [name]);
  return { show, dismiss };
}
