import React, { useState } from 'react';
import { Alert, Switch, TextInput, View } from 'react-native';
import { Stack, router } from 'expo-router';
import Constants from 'expo-constants';
import Slider from '@react-native-community/slider';
import { BookOpen, Share2 } from 'lucide-react-native';
import { Button, Card, Disclaimer, Row, Screen, SectionHeader, Stepper, Text } from '@/components';
import { Segmented } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { cancelReminders, scheduleWeekdayReminders } from '@/notifications';
import { exportCsv, hasExportableData } from '@/utils/exportCsv';
import { AboutGrowthRows, GrowthSettingsRows, WeeklyReviewRow } from '@/components/growth';

export default function SettingsScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const s = useSettings();
  const { diary, assessments, wipe } = useClinical();
  const [hour, setHour] = useState(s.reminderHour ?? 20);
  const [name, setName] = useState(s.displayName);
  const [vol, setVol] = useState(s.maxVolume);
  const [exporting, setExporting] = useState(false);
  const reminderOn = s.reminderHour != null;

  const applyReminder = async (on: boolean, h: number) => {
    if (!on) { await cancelReminders(); s.setReminderHour(null); return; }
    // Re-schedules all 7 weekday reminders (ids kept in settings); the weekly review and re-entry nudge are untouched.
    const ids = await scheduleWeekdayReminders(h);
    if (ids.length > 0) s.setReminderHour(h);
    else { s.setReminderHour(null); Alert.alert(t('settings.reminder'), t('settings.reminder.denied')); }
  };

  const doExport = async () => {
    if (!hasExportableData({ diary, assessments })) { Alert.alert(t('progress.export.nothing')); return; }
    setExporting(true);
    try { await exportCsv({ diary, assessments }); } catch { Alert.alert(t('progress.export.fail')); } finally { setExporting(false); }
  };

  const confirmWipe = () => Alert.alert(t('settings.data.wipe.title'), t('settings.data.wipe.body'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('settings.data.wipe.confirm'), style: 'destructive', onPress: () => { wipe(); } },
  ]);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />
      <Screen>
        <SectionHeader title={t('settings.language')} />
        <Card>
          <Segmented options={[{ value: 'tr', label: t('settings.language.tr') }, { value: 'en', label: t('settings.language.en') }]} value={s.locale} onChange={s.setLocale} accessibilityLabel={t('settings.language')} />
          <Text variant="bodyStrong">{t('settings.name')}</Text>
          <TextInput
            value={name} onChangeText={setName} onEndEditing={() => s.setDisplayName(name.trim())} maxLength={40} autoCapitalize="words"
            placeholder={t('onb.consent.namePlaceholder')} placeholderTextColor={colors.textMuted} accessibilityLabel={t('settings.name')}
            style={{ minHeight: 48, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: space[3], color: colors.text, fontSize: 17, backgroundColor: colors.card }}
          />
        </Card>

        <SectionHeader title={t('settings.reminder')} />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
            <Text variant="body">{t('settings.reminder.toggle')}</Text>
            <Switch value={reminderOn} onValueChange={(v) => { void applyReminder(v, hour); }} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={t('settings.reminder.toggle')} />
          </View>
          <Stepper label={t('settings.reminder.hour')} value={hour} min={0} max={23} format={fmtHour} onChange={(h) => { setHour(h); if (reminderOn) void applyReminder(true, h); }} />
          <Text variant="bodySmall" tone="secondary">{t('settings.reminder.body')}</Text>
          <WeeklyReviewRow />
        </Card>

        <SectionHeader title={t('settings.appearance')} />
        <Card>
          <Segmented options={[{ value: 'system', label: t('settings.appearance.system') }, { value: 'light', label: t('settings.appearance.light') }, { value: 'dark', label: t('settings.appearance.dark') }]} value={s.appearance} onChange={s.setAppearance} accessibilityLabel={t('settings.appearance')} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: space[3] }}>
            <View style={{ flex: 1 }}>
              <Text variant="body">{t('settings.reduceMotion')}</Text>
              <Text variant="caption" tone="secondary">{t('settings.reduceMotion.sub')}</Text>
            </View>
            <Switch value={s.reduceMotion} onValueChange={s.setReduceMotion} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={t('settings.reduceMotion')} />
          </View>
        </Card>

        <SectionHeader title={t('settings.soundSafety')} />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body">{t('settings.maxVolume')}</Text>
            <Text variant="bodyStrong">%{Math.round(vol * 100)}</Text>
          </View>
          <Slider
            minimumValue={0.3} maximumValue={1} step={0.05} value={vol} onValueChange={(v: number) => setVol(v)} onSlidingComplete={(v: number) => s.setMaxVolume(Math.round(v * 100) / 100)}
            minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary}
            accessibilityLabel={t('settings.maxVolume')} accessibilityValue={{ text: `%${Math.round(vol * 100)}` }}
          />
          <Text variant="bodySmall" tone="secondary">{t('settings.maxVolume.body')}</Text>
        </Card>

        <SectionHeader title={t('settings.data')} />
        <Card>
          <Row icon={<Share2 size={20} color={colors.primary} />} title={t('settings.data.export')} subtitle={t('settings.data.exportSub')} onPress={() => { void doExport(); }} right={exporting ? <Text variant="caption" tone="secondary">…</Text> : undefined} />
          <Button variant="danger" title={t('settings.data.wipe')} onPress={confirmWipe} />
        </Card>

        <GrowthSettingsRows />

        <SectionHeader title={t('settings.privacy')} />
        <Card><Text variant="body" tone="secondary">{t('settings.privacy.body')}</Text></Card>

        <SectionHeader title={t('settings.about')} />
        <Card>
          <Row title={t('settings.about.version')} right={<Text variant="bodySmall" tone="secondary">{version}</Text>} />
          <Row icon={<BookOpen size={20} color={colors.primary} />} title={t('settings.about.evidence')} onPress={() => router.push('/education/digital-therapeutics-evidence')} />
          <AboutGrowthRows />
          <Text variant="bodySmall" tone="secondary">{t('settings.about.regulatory')}</Text>
        </Card>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
