import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Bell, Check } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useGrowth } from '@/store/growth';
import { scheduleWeekdayReminders } from '@/notifications';
import { DEFAULT_REMINDER_HOUR, reminderPromptEligible } from './reminderPrompt';

/** `settings.reminderPromptedAt` (Team C, sprint 3 C2) remembers when the card was last shown so "Sonra" re-asks once after 7 days. */
const promptedAt = () => useSettings.getState().reminderPromptedAt ?? null;
const setPromptedAt = (iso: string) => useSettings.getState().setReminderPromptedAt(iso);

/** One-time card on the completion screen: "Yarın hatırlatalım mı? 20:00" → weekday reminders; "Sonra" re-asks once after 7 days. */
export function ReminderPromptCard() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const track = useGrowth((s) => s.track);
  const reminderHour = useSettings((s) => s.reminderHour);
  const setReminderHour = useSettings((s) => s.setReminderHour);
  const hour = reminderHour ?? DEFAULT_REMINDER_HOUR;
  // Eligibility is decided once per mount so that counting the impression does not hide the card mid-render.
  const [eligible] = useState(() => reminderPromptEligible({
    reminderIds: useSettings.getState().reminderIds,
    shownCount: useGrowth.getState().counters.reminderPromptShown ?? 0,
    promptedAt: promptedAt(),
  }));
  const [state, setState] = useState<'idle' | 'busy' | 'granted' | 'denied' | 'later'>('idle');
  const counted = useRef(false);

  useEffect(() => {
    if (!eligible || counted.current) return;
    counted.current = true;
    track('reminderPromptShown');
    setPromptedAt(new Date().toISOString());
  }, [eligible, track]);

  if (!eligible || state === 'later') return null;

  const allow = async () => {
    setState('busy');
    const ids = await scheduleWeekdayReminders(hour);
    if (ids.length > 0) { setReminderHour(hour); track('reminderPromptAccepted'); setState('granted'); } else setState('denied');
  };
  const time = `${String(hour).padStart(2, '0')}:00`;

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Bell size={22} color={colors.accentText} /></View>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{t('session.reminder.title', { time })}</Text>
          <Text variant="bodySmall" tone="secondary">{t('session.reminder.body')}</Text>
        </View>
      </View>
      {state === 'granted' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}><Check size={18} color={colors.success} /><Text variant="bodyStrong" tone="success">{t('session.reminder.granted', { time })}</Text></View>
      ) : (
        <View style={{ gap: space[2] }}>
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Button style={{ flex: 1 }} title={t('session.reminder.yes', { time })} loading={state === 'busy'} disabled={state === 'busy'} onPress={() => { void allow(); }} />
            <Button style={{ flex: 1 }} variant="ghost" title={t('session.reminder.later')} disabled={state === 'busy'} onPress={() => setState('later')} />
          </View>
          {state === 'denied' ? <Text variant="caption" tone="secondary">{t('session.reminder.denied')}</Text> : null}
        </View>
      )}
    </Card>
  );
}
