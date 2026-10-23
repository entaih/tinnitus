import { useSettings } from '@/store/settings';

/** True inside the user's configured night window (default 22:00–06:00). */
export function useIsNightWindow(now = new Date()): boolean {
  const { nightStart, nightEnd } = useSettings();
  const h = now.getHours();
  return nightStart > nightEnd ? h >= nightStart || h < nightEnd : h >= nightStart && h < nightEnd;
}
