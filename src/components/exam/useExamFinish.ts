import { router, useLocalSearchParams } from 'expo-router';
import { useJourney } from '@/hooks/useJourney';
import { useProfile } from '@/hooks/useProfile';
import { examEligibility, nextExamRoute, type ExamStepId } from '@/audio/examTests';

const HUB = '/assess/exam';

/**
 * How an exam screen leaves: in the "start in order" sequence (?seq=1) it replaces itself with the next
 * applicable (eligibility-gated) step and returns to the hub after the last one; otherwise it defers to the
 * guided journey (?journey=1) or simply goes back.
 */
export function useExamFinish(step: ExamStepId) {
  const params = useLocalSearchParams<{ seq?: string; journey?: string; from?: string }>();
  const journey = useJourney();
  const { assessment } = useProfile();
  const inSequence = params.seq === '1';
  const pulsatile = !!assessment?.redFlags?.pulsatile;
  const eligibility = examEligibility(assessment);
  const finish = () => {
    if (inSequence) {
      const next = nextExamRoute(step, { pulsatile, eligibility });
      const fromDx = params.from === 'dx' ? '&from=dx' : '';
      if (next) { router.replace(`${next}?seq=1${fromDx}` as never); return; }
      // Opened from the diagnosis card: return to the results so the "kesinlik arttı" comparison runs.
      if (params.from === 'dx') { router.replace('/assess/results?raised=1' as never); return; }
      router.dismissTo(HUB as never);
      return;
    }
    journey.finish(HUB);
  };
  return { finish, inSequence, eligibility };
}
