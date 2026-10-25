import React, { useState } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';
import { Stack, router } from 'expo-router';
import Constants from 'expo-constants';
import Slider from '@react-native-community/slider';
import { Gauge, RotateCcw, Share2, Users } from 'lucide-react-native';
import { Button, Card, Disclaimer, Row, Screen, SectionHeader, Stepper, Text } from '@/components';
import { Segmented } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { selectActiveProfile, useProfiles } from '@/store/profiles';
import { cancelReminders, reminderHourBlocked, scheduleWeekdayReminders } from '@/notifications';
import { localDateISO, normalizeReminderDays, programDayDate, programEndDate, reminderWeekdays } from '@/notificationRules';
import { programPosition } from '@/clinical/program';
import { exportCsv, hasExportableData } from '@/utils/exportCsv';
import { AboutGrowthRows, GrowthSettingsRows, WeeklyReviewRow } from '@/components/growth';

export default function SettingsScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const s = useSettings();
  const { diary, assessments, wipe, program, restartProgram } = useClinical();
  const [hour, setHour] = useState(s.reminderHour ?? 20);
  // Quiet hours (settings nightStart–nightEnd, default 22:00–06:00): a reminder inside them is refused with an explanation (C4).
  const quietBlocked = reminderHourBlocked(hour);
  const [name, setName] = useState(s.displayName);
  const activePerson = useProfiles(selectActiveProfile);
  const [vol, setVol] = useState(s.maxVolume);
  const [exporting, setExporting] = useState(false);
  const reminderOn = s.reminderHour != null;

  // Sprint 3 C4 — "Programım": phase, maintenance week, refresher block, dose, restart, reminder days.
  const phase: 'active' | 'maintenance' = program?.phase === 'maintenance' ? 'maintenance' : 'active';
  const todayISO = localDateISO(new Date());
  const endDate = program ? programEndDate(program) : null;
  const finished = !!program && phase === 'active' && !!endDate && todayISO > endDate;
  const maintenanceWeek = program?.maintenanceStartDate
    ? Math.max(1, Math.floor((new Date(`${todayISO}T00:00:00`).getTime() - programDayDate(program.maintenanceStartDate, 0).getTime()) / (7 * 86_400_000)) + 1)
    : 1;
  const refresherOn = !!program?.refresherUntil && program.refresherUntil >= todayISO;
  const pos = program ? programPosition(program) : null;
  const activeDays = reminderWeekdays(phase, s.reminderDays);
  /** Toggle one weekday (1 = Sunday … 7 = Saturday); when reminders are on, re-schedules so exactly the chosen days exist. */
  const toggleDay = (d: number) => {
    const next = s.reminderDays.includes(d) ? s.reminderDays.filter((x) => x !== d) : normalizeReminderDays([...s.reminderDays, d]);
    s.setReminderDays(next);
    if (reminderOn && !reminderHourBlocked(hour)) void scheduleWeekdayReminders(hour);
  };
  const DAY_ORDER = [2, 3, 4, 5, 6, 7, 1];

  const applyReminder = async (on: boolean, h: number) => {
    if (!on) { await cancelReminders(); s.setReminderHour(null); return; }
    if (reminderHourBlocked(h)) { await cancelReminders(); s.setReminderHour(null); return; } // the inline warning below explains why
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
        <SectionHeader title={t('settings.people')} />
        <Card>
          <Row icon={<Users size={20} color={colors.primary} />} title={t('settings.people.row')} subtitle={t('settings.people.sub', { name: activePerson.name || s.displayName || t('profiles.unnamed') })} onPress={() => router.push('/profiles')} />
        </Card>
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
          {quietBlocked ? <Text variant="bodySmall" tone="warning">{t('settings.reminder.quiet', { start: fmtHour(s.nightStart), end: fmtHour(s.nightEnd) })}</Text> : null}
          <WeeklyReviewRow />
        </Card>

        <SectionHeader title={t('settings.program')} />
        <Card>
          {!program ? (
            <Text variant="bodySmall" tone="secondary">{t('settings.program.none')}</Text>
          ) : (
            <>
              <Row
                title={t('settings.program.status')}
                subtitle={phase === 'maintenance' ? t('settings.program.maintenance.sub') : undefined}
                chevron={false}
                right={<Text variant="bodySmall" tone={finished ? 'warning' : 'secondary'} style={{ maxWidth: 170, textAlign: 'right' }}>
                  {phase === 'maintenance' ? t('settings.program.maintenance', { n: maintenanceWeek }) : finished ? t('settings.program.finished') : t('settings.program.active', { w: pos?.week ?? 1, n: program.weeks.length })}
                </Text>}
              />
              {refresherOn && program.refresherUntil ? <Text variant="bodySmall" tone="warning">{t('settings.program.refresher', { date: formatDate(program.refresherUntil, locale) })}</Text> : null}
              <Row icon={<Gauge size={20} color={colors.primary} />} title={t('settings.dose')} subtitle={t('settings.dose.sub')}
                right={<Text variant="bodyStrong">{t(program.dose === 'light' ? 'settings.dose.light' : 'settings.dose.full')}</Text>} onPress={() => router.push('/program/setup')} />
              <Row icon={<RotateCcw size={20} color={colors.primary} />} title={t('settings.program.restart')} subtitle={t('settings.program.restart.sub')} onPress={() => Alert.alert(t('prog.restart.confirm.title'), t('prog.restart.confirm.body'), [{ text: t('common.cancel'), style: 'cancel' }, { text: t('prog.restart.confirm.ok'), style: 'destructive', onPress: () => { restartProgram(); router.push('/program'); } }])} />
            </>
          )}
          <Text variant="bodyStrong">{t('settings.reminderDays')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {DAY_ORDER.map((d) => {
              const on = s.reminderDays.includes(d);
              const label = t(`settings.reminderDays.d${d}`);
              return (
                <Pressable key={d} accessibilityRole="checkbox" accessibilityLabel={t('settings.reminderDays.a11y', { day: label })} accessibilityState={{ checked: on }} onPress={() => toggleDay(d)}
                  style={({ pressed }) => ({ minWidth: 44, minHeight: 44, paddingHorizontal: space[3], borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: on ? colors.primary : colors.borderStrong, backgroundColor: on ? colors.primary : colors.card, opacity: pressed ? 0.8 : 1 })}>
                  <Text variant="caption" style={{ color: on ? colors.onPrimary : colors.text }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="bodySmall" tone="secondary">{phase === 'maintenance' ? t('settings.reminderDays.hint.maintenance', { n: activeDays.length }) : t('settings.reminderDays.hint.active')}</Text>
          {s.reminderDays.length === 0 ? <Text variant="caption" tone="warning">{t('settings.reminderDays.empty')}</Text> : null}
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
        <Card>
          <Text variant="body" tone="secondary">{t('settings.privacy.body')}</Text>
          <Row title={t('onb.consent.kvkk')} onPress={() => router.push('/privacy')} />
          <Row title={t('onb.consent.terms')} onPress={() => router.push('/privacy?doc=terms')} />
        </Card>

        <SectionHeader title={t('settings.about')} />
        <Card>
          <Row title={t('settings.about.version')} right={<Text variant="bodySmall" tone="secondary">{version}</Text>} />
          <AboutGrowthRows />
          <Text variant="bodySmall" tone="secondary">{t('settings.about.regulatory')}</Text>
        </Card>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
