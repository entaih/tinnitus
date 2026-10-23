import { useMemo } from 'react';
import { useClinical, mergedLatest } from '@/store/clinical';
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

/** Returns the id of today's assessment record, creating it if needed. */
export function useAssessmentId(): string {
  const start = useClinical((s) => s.startAssessment);
  const assessments = useClinical((s) => s.assessments);
  const today = new Date().toISOString().slice(0, 10);
  const existing = assessments.find((a) => a.date.slice(0, 10) === today);
  return existing ? existing.id : start();
}
