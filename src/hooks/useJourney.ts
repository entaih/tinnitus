import { useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useClinical, mergedLatest } from '@/store/clinical';
import { computeJourney, nextJourneyRoute } from '@/clinical/journey';

/** Guided-flow state + a `go()` that replaces the current screen with the next step. */
export function useJourney() {
  const assessments = useClinical((s) => s.assessments);
  const program = useClinical((s) => s.program);
  const params = useLocalSearchParams<{ journey?: string; taskKey?: string }>();
  const inJourney = params.journey === '1';
  const journey = useMemo(() => computeJourney(mergedLatest(assessments), program), [assessments, program]);
  const go = () => {
    const { assessments: as, program: p } = useClinical.getState();
    router.replace(nextJourneyRoute(mergedLatest(as), p) as never);
  };
  /** After finishing a screen: continue the journey, or return to the session/hub. */
  const finish = (fallback: string = '/(tabs)/assess') => {
    if (inJourney) return go();
    if (router.canGoBack()) router.back(); else router.replace(fallback as never);
  };
  return { journey, inJourney, go, finish, taskKey: params.taskKey };
}
