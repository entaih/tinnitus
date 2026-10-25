import { useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useClinical, mergedLatest } from '@/store/clinical';
import { computeJourney, nextJourneyRoute } from '@/clinical/journey';

/** Where a measurement opened from the diagnosis card returns to (sprint 3 A2: the "kesinlik arttı" banner). */
export const DX_RETURN_ROUTE = '/assess/results?raised=1';

/**
 * Guided-flow state + a `go()` that replaces the current screen with the next step.
 * `?from=dx` (a measurement opened from the diagnosis card's "kesinliği artır" buttons) makes `finish()` return to the
 * results screen instead of chaining the next measurement or the journey.
 */
export function useJourney() {
  const assessments = useClinical((s) => s.assessments);
  const program = useClinical((s) => s.program);
  const sessions = useClinical((s) => s.sessions);
  const params = useLocalSearchParams<{ journey?: string; taskKey?: string; from?: string }>();
  const inJourney = params.journey === '1';
  const fromDx = params.from === 'dx';
  const journey = useMemo(() => computeJourney(mergedLatest(assessments), program, { sessions }), [assessments, program, sessions]);
  const go = () => {
    const { assessments: as, program: p, sessions: ss, markSoundTry } = useClinical.getState();
    const next = computeJourney(mergedLatest(as), p, { sessions: ss });
    const route = nextJourneyRoute(mergedLatest(as), p, { sessions: ss });
    // The optional sound trial counts as offered the moment the journey routes to it (it never blocks the journey), and it
    // is pushed, not replaced, so "Devam et" in the player returns to this screen whose "Devam" carries on with the THI.
    if (next.current?.id === 'soundTry') { markSoundTry(); router.push(route as never); return; }
    router.replace(route as never);
  };
  /** After finishing a screen: return to the diagnosis card, continue the journey, or return to the session/hub. */
  const finish = (fallback: string = '/(tabs)/assess') => {
    if (fromDx) return router.replace(DX_RETURN_ROUTE as never);
    if (inJourney) return go();
    if (router.canGoBack()) router.back(); else router.replace(fallback as never);
  };
  return { journey, inJourney, fromDx, go, finish, taskKey: params.taskKey };
}
