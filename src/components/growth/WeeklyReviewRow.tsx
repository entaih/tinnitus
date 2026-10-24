import React, { useEffect, useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { Stepper, Text } from '@/components';
import { Segmented } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useGrowth } from '@/store/growth';
import { cancelWeeklyReview, isScheduled, scheduleWeeklyReview } from '@/notifications';

const WEEKDAYS = [2, 3, 4, 5, 6, 7, 1]; // Monday-first display; values follow expo-notifications (1 = Sunday)

/**
 * Settings toggle for the weekly review notification. Lives inside the reminder card.
 * The daily reminder cancels every scheduled notification when it changes, so this row re-schedules the
 * weekly review whenever `reminderHour` changes and re-checks on mount that the notification still exists.
 */
export function WeeklyReviewRow() {
  const { colors, space } = useTheme();
  const t = useT();
  const weekly = useGrowth((s) => s.weeklyReview);
  const setWeeklyReview = useGrowth((s) => s.setWeeklyReview);
  const reminderHour = useSettings((s) => s.reminderHour);
  const [weekday, setWeekday] = useState(weekly?.weekday ?? 1);
  const [hour, setHour] = useState(weekly?.hour ?? 19);
  const on = weekly != null;

  const apply = async (enable: boolean, d: number, h: number) => {
    if (!enable) { await cancelWeeklyReview(weekly?.notificationId); setWeeklyReview(null); return; }
    const id = await scheduleWeeklyReview(d, h, t('notif.weekly.title'), t('notif.weekly.body'), t('notif.weekly.channel'), weekly?.notificationId);
    if (id) setWeeklyReview({ weekday: d, hour: h, notificationId: id });
    else { setWeeklyReview(null); Alert.alert(t('growth.weekly.toggle'), t('settings.reminder.denied')); }
  };

  // Resync: after the daily reminder was (re)scheduled (which cancels everything) or when the id is gone.
  useEffect(() => {
    if (!weekly) return;
    let active = true;
    void isScheduled(weekly.notificationId).then((ok) => { if (active && !ok) void apply(true, weekly.weekday, weekly.hour); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderHour]);

  const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <View style={{ gap: space[3], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <Text variant="body">{t('growth.weekly.toggle')}</Text>
        <Switch value={on} onValueChange={(v) => { void apply(v, weekday, hour); }} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={t('growth.weekly.toggle')} />
      </View>
      <Segmented
        options={WEEKDAYS.map((d) => ({ value: d, label: t(`growth.weekly.day.${d}`) }))}
        value={weekday}
        onChange={(d) => { setWeekday(d); if (on) void apply(true, d, hour); }}
        accessibilityLabel={t('growth.weekly.day')}
      />
      <Stepper label={t('growth.weekly.hour')} value={hour} min={0} max={23} format={fmtHour} onChange={(h) => { setHour(h); if (on) void apply(true, weekday, h); }} />
      <Text variant="bodySmall" tone="secondary">{t('growth.weekly.body')}</Text>
    </View>
  );
}
