/** Pure rules behind the post-value reminder card (PM sprint 3 §B1, defect E8). UI in ReminderPromptCard.tsx. */

export const REMINDER_REASK_DAYS = 7;
export const DEFAULT_REMINDER_HOUR = 20;

/**
 * Whether the one-time "Yarın hatırlatalım mı?" card may show now: never before a completed session (the caller renders
 * it only on the completion screen), never once weekday reminders are scheduled, once at the first completed session
 * and once more 7 days after "Sonra" — never a third time.
 */
export function reminderPromptEligible(input: { reminderIds: string[]; shownCount: number; promptedAt: string | null; now?: Date }): boolean {
  if (input.reminderIds.length > 0) return false;
  if (input.shownCount >= 2) return false;
  if (input.shownCount === 0) return true;
  if (!input.promptedAt) return false;
  const now = input.now ?? new Date();
  return now.getTime() - new Date(input.promptedAt).getTime() >= REMINDER_REASK_DAYS * 86_400_000;
}
