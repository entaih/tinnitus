/**
 * Local notification helpers. Local (scheduled) notifications work in Expo Go; remote push does not,
 * so everything here is wrapped so a missing native module never crashes the app.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useSettings } from '@/store/settings';
import { translate } from '@/i18n';

// Loaded lazily: importing expo-notifications at startup prints Expo Go warnings on every launch.
type NotificationsModule = typeof import('expo-notifications');
let cached: NotificationsModule | null = null;
function Notifications(): NotificationsModule {
  if (!cached) cached = require('expo-notifications') as NotificationsModule;
  return cached;
}
/** True inside the Expo Go store client, where remote push is unavailable (local reminders still work on iOS). */
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

export const REMINDER_CHANNEL = 'reminders';

let handlerInstalled = false;

/** Show reminders as banners while the app is in the foreground. Safe to call many times. */
export function installNotificationHandler() {
  if (handlerInstalled) return;
  if (isExpoGo && Platform.OS === 'android') return; // not supported in Expo Go on Android
  handlerInstalled = true;
  try {
    Notifications().setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  } catch {
    // Not available on this platform (e.g. web) — ignore.
  }
}

/** Ask for permission; returns true when granted. Never throws. */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const current = await Notifications().getPermissionsAsync();
    if (current.granted) return true;
    const res = await Notifications().requestPermissionsAsync();
    return !!res.granted;
  } catch {
    return false;
  }
}

async function ensureChannel(channelName: string) {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications().setNotificationChannelAsync(REMINDER_CHANNEL, { name: channelName, importance: Notifications().AndroidImportance.DEFAULT });
  } catch {
    // ignore
  }
}

/** Cancel one scheduled notification by id. Never throws. */
export async function cancelScheduled(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try { await Notifications().cancelScheduledNotificationAsync(id); } catch { /* ignore */ }
}

/** True when notification permission is already granted; never prompts, never throws. */
export async function hasReminderPermission(): Promise<boolean> {
  try {
    const current = await Notifications().getPermissionsAsync();
    return !!current.granted;
  } catch {
    return false;
  }
}

const clampHour = (h: number) => Math.max(0, Math.min(23, Math.round(h)));
const clampMinute = (m: number) => Math.max(0, Math.min(59, Math.round(m)));

/** Read the current locale from the settings store (module code runs outside React, so no hook). */
const currentLocale = () => useSettings.getState().locale;

// ---------------------------------------------------------------------------------------------------
// Weekday reminders (S1-10, PM §2.6): seven WEEKLY triggers, one per weekday, with day-specific copy.
// Their ids live in `settings.reminderIds`, so cancelling them never touches the weekly review or the
// re-entry nudge (those keep their own ids).
// ---------------------------------------------------------------------------------------------------

export const DAILY_REMINDER_KIND = 'dailyReminder';

/** Weekdays in expo-notifications numbering: 1 = Sunday … 7 = Saturday. */
const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Cancel only the seven weekday reminders stored in `settings.reminderIds` and clear the list.
 * Leaves the weekly review and the re-entry nudge alone. Never throws.
 */
export async function cancelReminders(): Promise<void> {
  const { reminderIds, setReminderIds } = useSettings.getState();
  await Promise.all(reminderIds.map((id) => cancelScheduled(id)));
  setReminderIds([]);
}

/**
 * Schedule the seven weekday reminders at `hour`:`minute` local time (WEEKLY triggers, weekday 1–7 with
 * 1 = Sunday), using the `notif.day.N.title/body` copy for the current locale. Replaces the previous set
 * (ids read from and written to `settings.reminderIds`). Returns the new ids — an empty array when
 * permission is missing or nothing could be scheduled (e.g. Expo Go on Android).
 */
export async function scheduleWeekdayReminders(hour: number, minute = 0): Promise<string[]> {
  installNotificationHandler();
  const ok = await requestReminderPermission();
  if (!ok) return [];
  const locale = currentLocale();
  await ensureChannel(translate(locale, 'notif.channel'));
  await cancelReminders();
  const ids: string[] = [];
  for (const weekday of ALL_WEEKDAYS) {
    try {
      const id = await Notifications().scheduleNotificationAsync({
        content: {
          title: translate(locale, `notif.day.${weekday}.title`),
          body: translate(locale, `notif.day.${weekday}.body`),
          data: { kind: DAILY_REMINDER_KIND, weekday },
        },
        trigger: {
          type: Notifications().SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: clampHour(hour),
          minute: clampMinute(minute),
          channelId: REMINDER_CHANNEL,
        },
      });
      ids.push(id);
    } catch {
      // One failed day should not block the others; the id list simply stays shorter.
    }
  }
  useSettings.getState().setReminderIds(ids);
  return ids;
}

// ---------------------------------------------------------------------------------------------------
// Re-entry nudge (PM §2.5/§2.6): a single DATE trigger three days after the last activity, 19:00 local.
// Re-armed after every completed session / quick check-in; a user who keeps coming back never sees it.
// ---------------------------------------------------------------------------------------------------

export const REENTRY_NUDGE_KIND = 'reentryNudge';
export const REENTRY_NUDGE_DAYS = 3;
export const REENTRY_NUDGE_HOUR = 19;

/** Local date for the next re-entry nudge: `now` + 3 days at 19:00 local time. */
export function nextReentryNudgeDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + REENTRY_NUDGE_DAYS);
  d.setHours(REENTRY_NUDGE_HOUR, 0, 0, 0);
  return d;
}

/**
 * Cancel `previousId` (if any) and schedule the one-shot re-entry nudge for +3 days 19:00 local.
 * Does not prompt for permission: when it was never granted the nudge is silently skipped.
 * Returns the new id, or null when nothing was scheduled. Never throws.
 */
export async function scheduleReentryNudge(previousId: string | null): Promise<string | null> {
  await cancelScheduled(previousId);
  installNotificationHandler();
  if (!(await hasReminderPermission())) return null;
  const locale = currentLocale();
  await ensureChannel(translate(locale, 'notif.channel'));
  try {
    return await Notifications().scheduleNotificationAsync({
      content: { title: translate(locale, 'notif.reentry.title'), body: translate(locale, 'notif.reentry.body'), data: { kind: REENTRY_NUDGE_KIND } },
      trigger: { type: Notifications().SchedulableTriggerInputTypes.DATE, date: nextReentryNudgeDate(), channelId: REMINDER_CHANNEL },
    });
  } catch {
    return null;
  }
}

/**
 * One-line helper for screens: re-arm the re-entry nudge after a completed session or quick check-in.
 * Reads the previous id from the settings store, replaces it and stores the new one. Never throws.
 */
export async function bumpReentryNudge(): Promise<string | null> {
  const { reentryNudgeId, setReentryNudgeId } = useSettings.getState();
  const id = await scheduleReentryNudge(reentryNudgeId);
  setReentryNudgeId(id);
  return id;
}

/** Cancel the re-entry nudge stored in settings (e.g. when the user turns reminders off). Never throws. */
export async function cancelReentryNudge(): Promise<void> {
  const { reentryNudgeId, setReentryNudgeId } = useSettings.getState();
  await cancelScheduled(reentryNudgeId);
  setReentryNudgeId(null);
}

// ---------------------------------------------------------------------------------------------------
// Measurement week (weeks 4/8/12): one DATE trigger on the Sunday morning of a measurement week.
// ---------------------------------------------------------------------------------------------------

export const MEASUREMENT_KIND = 'measurement';
export const MEASUREMENT_HOUR = 9;

/**
 * Resolve the trigger date for a measurement reminder. A date-only ISO string (`YYYY-MM-DD`) means
 * 09:00 local on that day; a full timestamp is used as-is. Returns null for an invalid or past date.
 */
export function measurementReminderDate(dateISO: string, now: Date = new Date()): Date | null {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateISO);
  const d = dateOnly ? new Date(`${dateISO}T00:00:00`) : new Date(dateISO);
  if (Number.isNaN(d.getTime())) return null;
  if (dateOnly) d.setHours(MEASUREMENT_HOUR, 0, 0, 0);
  return d.getTime() > now.getTime() ? d : null;
}

/**
 * Cancel `previousId` (if any) and schedule the measurement-week reminder for `dateISO`
 * (`YYYY-MM-DD` → 09:00 local). Does not prompt for permission. Returns the new id or null. Never throws.
 */
export async function scheduleMeasurementReminder(dateISO: string, previousId: string | null): Promise<string | null> {
  await cancelScheduled(previousId);
  const date = measurementReminderDate(dateISO);
  if (!date) return null;
  installNotificationHandler();
  if (!(await hasReminderPermission())) return null;
  const locale = currentLocale();
  await ensureChannel(translate(locale, 'notif.channel'));
  try {
    return await Notifications().scheduleNotificationAsync({
      content: { title: translate(locale, 'notif.measure.title'), body: translate(locale, 'notif.measure.body'), data: { kind: MEASUREMENT_KIND } },
      trigger: { type: Notifications().SchedulableTriggerInputTypes.DATE, date, channelId: REMINDER_CHANNEL },
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------------
// Weekly review (growth): one local notification per week, scheduled separately from the weekday
// reminders. Since S1-10 the weekday reminders cancel only their own ids, so the weekly review survives
// a reminder-hour change.
// ---------------------------------------------------------------------------------------------------

export const WEEKLY_REVIEW_KIND = 'weeklyReview';

/** Clamp to expo-notifications' weekday range: 1 = Sunday … 7 = Saturday. */
export const clampWeekday = (d: number) => Math.max(1, Math.min(7, Math.round(d)));

/** True when a notification with this id is still scheduled (false on any error). */
export async function isScheduled(id: string | null | undefined): Promise<boolean> {
  if (!id) return false;
  try {
    const all = await Notifications().getAllScheduledNotificationsAsync();
    return all.some((n) => n.identifier === id);
  } catch {
    return false;
  }
}

/**
 * Schedule the weekly review notification (WEEKLY trigger: weekday 1–7 with 1 = Sunday, hour 0–23, minute 0).
 * Replaces a previous weekly review when `previousId` is given; leaves the daily reminder untouched.
 * Returns the notification id, or null when permission is missing or scheduling failed.
 */
export async function scheduleWeeklyReview(weekday: number, hour: number, title: string, body: string, channelName = title, previousId?: string | null): Promise<string | null> {
  installNotificationHandler();
  const ok = await requestReminderPermission();
  if (!ok) return null;
  await ensureChannel(channelName);
  await cancelScheduled(previousId);
  try {
    return await Notifications().scheduleNotificationAsync({
      content: { title, body, data: { kind: WEEKLY_REVIEW_KIND } },
      trigger: {
        type: Notifications().SchedulableTriggerInputTypes.WEEKLY,
        weekday: clampWeekday(weekday),
        hour: Math.max(0, Math.min(23, Math.round(hour))),
        minute: 0,
        channelId: REMINDER_CHANNEL,
      },
    });
  } catch {
    return null;
  }
}

/** Cancel the weekly review by id. Never throws. */
export async function cancelWeeklyReview(id: string | null | undefined): Promise<void> {
  await cancelScheduled(id);
}
