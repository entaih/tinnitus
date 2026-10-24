import type { Profile } from '@/clinical/types';

/** Reasons that close programme creation entirely until a clinician has seen the user. */
const HARD_BLOCK = ['triage.selfHarm', 'triage.neuro', 'triage.vertigo', 'triage.suddenHL'];
/** Reasons that require an explicit "I have booked my doctor appointment" acknowledgement first. */
const NEEDS_ACK = ['triage.pulsatile', 'triage.pulsatileUrgent'];

export interface ProgramGate {
  /** Programme cannot be started from the app at all. */
  blocked: boolean;
  /** Programme may start only after the user confirms a physician appointment. */
  needsAck: boolean;
  /** i18n key explaining the gate, or null when there is none. */
  reasonKey: string | null;
}

/**
 * Single rule for results and programme setup: urgent tier 0/1 (or the hard-block reasons) blocks;
 * tier 2 or a pulsatile finding requires an acknowledgement; everything else passes.
 */
export function programGate(profile: Profile | null, tier: number | null): ProgramGate {
  if (!profile) return { blocked: false, needsAck: false, reasonKey: null };
  const reasons = profile.triageReasons;
  const urgent = profile.triage === 'urgent';
  const blocked = urgent && (tier === 0 || tier === 1 || reasons.some((r) => HARD_BLOCK.includes(r)));
  if (blocked) return { blocked: true, needsAck: false, reasonKey: 'results.program.blocked' };
  const needsAck = tier === 2 || urgent || reasons.some((r) => NEEDS_ACK.includes(r));
  return { blocked: false, needsAck, reasonKey: needsAck ? 'results.program.ackWhy' : null };
}
