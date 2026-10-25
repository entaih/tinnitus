import type { Program } from '@/clinical/types';
import { dayCompletion } from '@/clinical/program';
import type { GrowthEvent } from '@/store/growth';

/**
 * Day-1 → day-2 bridge counters (PM §S1-12). Call `before` a completion is written so the first completion of
 * programme day 2 counts exactly once; `day1Completed` is tracked by the session runner when day 1's shown
 * steps are all done. Pure: returns the events to track, the caller owns the store.
 */
export function returnEventsFor(program: Program, pos: { week: number; day: number; dayIndex: number }): GrowthEvent[] {
  const out: GrowthEvent[] = [];
  if (pos.dayIndex === 1 && dayCompletion(program, pos.week, pos.day).done === 0) out.push('day2Returned');
  return out;
}
