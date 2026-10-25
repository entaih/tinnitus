/**
 * Storage retention rules for the persisted clinical store (PM sprint 3 E11 / A4). Pure: the store's `partialize`
 * applies them on every write, so AsyncStorage never grows past these bounds:
 *   - sessions: the newest 500, each `detail` cut to 120 characters (player layer lists were the largest payload);
 *   - diary: the newest 730 entries (one per day → two years).
 */
import type { DiaryEntry } from './types';

export const SESSIONS_MAX = 500;
export const SESSION_DETAIL_MAX = 120;
export const DIARY_MAX_DAYS = 730;

export interface StoredSession { id: string; date: string; type: string; minutes: number; detail?: string }

export function pruneSessions<T extends StoredSession>(sessions: T[]): T[] {
  return sessions.slice(-SESSIONS_MAX).map((s) => (s.detail != null && s.detail.length > SESSION_DETAIL_MAX ? { ...s, detail: s.detail.slice(0, SESSION_DETAIL_MAX) } : s));
}

/** Diary entries are kept sorted by date (one per day), so the newest 730 entries cover the last two years. */
export function pruneDiary(diary: DiaryEntry[]): DiaryEntry[] {
  return diary.length > DIARY_MAX_DAYS ? diary.slice(-DIARY_MAX_DAYS) : diary;
}

/** Applies both rules to the persisted slice; untouched fields are returned as they are. */
export function pruneForStorage<T extends { sessions: StoredSession[]; diary: DiaryEntry[] }>(data: T): T {
  return { ...data, sessions: pruneSessions(data.sessions), diary: pruneDiary(data.diary) };
}
