import { useMemo, useRef } from 'react';
import { useClinical, mergedLatest, newId } from '@/store/clinical';
import { buildProfile } from '@/clinical/engine';
import type { Profile, Assessment } from '@/clinical/types';

/** Merged latest assessment + derived profile (null until the user has assessed anything). */
export function useProfile(): { assessment: Assessment | null; profile: Profile | null } {
  const assessments = useClinical((s) => s.assessments);
  return useMemo(() => {
    const assessment = mergedLatest(assessments);
    return { assessment, profile: assessment ? buildProfile(assessment) : null };
  }, [assessments]);
}

/**
 * Returns the id of today's assessment record. If none exists yet, a stable id is generated here and the
 * record is created lazily by the first save* action (the store upserts), so no state is set during render.
 */
export function useAssessmentId(): string {
  const assessments = useClinical((s) => s.assessments);
  const fresh = useRef(newId());
  const today = new Date().toISOString().slice(0, 10);
  const existing = assessments.find((a) => a.date.slice(0, 10) === today);
  return existing ? existing.id : fresh.current;
}
