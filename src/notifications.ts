/**
 * Local notification helpers. Local (scheduled) notifications work in Expo Go; remote push does not,
 * so everything here is wrapped so a missing native module never crashes the app.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

/** Cancel every scheduled reminder. Never throws. */
export async function cancelReminders(): Promise<void> {
  try { await Notifications().cancelAllScheduledNotificationsAsync(); } catch { /* ignore */ }
}

/**
 * Schedule one daily reminder at `hour`:00 local time (replacing any previous reminder).
 * Returns the notification id, or null when permission is missing or scheduling failed.
 */
export async function scheduleDailyReminder(hour: number, title: string, body: string, channelName = title): Promise<string | null> {
  installNotificationHandler();
  const ok = await requestReminderPermission();
  if (!ok) return null;
  await ensureChannel(channelName);
  await cancelReminders();
  try {
    return await Notifications().scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications().SchedulableTriggerInputTypes.DAILY, hour: Math.max(0, Math.min(23, Math.round(hour))), minute: 0, channelId: REMINDER_CHANNEL },
    });
  } catch {
    return null;
  }
}
