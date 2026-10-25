/**
 * Shared constants and the wording guard for everything that leaves the device as a share
 * (progress card text, share-moment cards, the invite message). Pure; tested in tests/share.test.ts.
 */

/** THI minimal clinically important difference (Zeman 2011): a drop of at least this many points is a share moment. */
export const THI_DROP_MCID = 7;

/**
 * Store lines for the invite message: only links that exist are printed (the App Store URL is known only after the
 * listing is created; it is set in app.json `extra.storeUrls.ios`, see docs/RELEASE.md).
 */
export function storeLinesText(ios: string | null | undefined, android: string | null | undefined): string {
  return [ios ? `App Store: ${ios}` : null, android ? `Google Play: ${android}` : null].filter(Boolean).join('\n');
}

/** Deep link carried by an invite; the code is random and non-identifying (growth store). */
export const inviteLink = (inviteCode: string) => `dingin://invite?from=${encodeURIComponent(inviteCode)}`;

/**
 * Words that must never appear in share copy (PM sprint 3 §2 "tedavi dili yok"): the app describes self-management
 * and the user's own numbers, never a treatment, a cure or a recovery.
 */
export const BANNED_SHARE_WORDS: RegExp[] = [
  /\btedavi\w*/i,
  /\biyileş\w*/i,
  /\bşifa\w*/i,
  /\bcure[sd]?\b/i,
  /\bcuring\b/i,
  /\bheal(s|ed|ing)?\b/i,
  /\btreat(s|ed|ing|ment)?\b/i,
  /\brecover(s|ed|y|ing)?\b/i,
];

/** The first banned word found in `text`, or null when the copy is clean. */
export function findBannedShareWord(text: string): string | null {
  for (const re of BANNED_SHARE_WORDS) {
    const m = text.match(re);
    if (m) return m[0];
  }
  return null;
}
