import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { formatDate, useLocale, useT } from '@/i18n';
import { today, useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { DiaryEntry } from '@/clinical/types';
import { buildCheckinEntry, formatAvg, last7Days, needsSleepRow, weekCompare, type CheckinField } from './checkinStats';
import { returnEventsFor } from './milestones';
import { bumpReentryNudge } from '@/notifications';

type Field = CheckinField;

const LABEL: Record<Field, string> = { annoyance: 'home.checkin.annoyance', loudness: 'home.checkin.loudness', sleep: 'home.checkin.sleep' };
const A11Y: Record<Field, string> = { annoyance: 'home.checkin.a11y', loudness: 'home.checkin.loudnessA11y', sleep: 'home.checkin.sleepA11y' };
const ENTRY_KEY: Record<Field, keyof DiaryEntry> = { annoyance: 'annoyance', loudness: 'loudness', sleep: 'sleepQuality' };

/** 0–10 chips, 44 pt each, wrapping into two rows of six/five. Accessible as a radio group. */
function ChipScale({ value, onSelect, a11yKey, lowKey = 'diary.scale.low', highKey = 'diary.scale.high' }: { value: number | undefined; onSelect: (v: number) => void; a11yKey: string; lowKey?: string; highKey?: string }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  return (
    <View>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
        {Array.from({ length: 11 }, (_, v) => {
          const sel = value === v;
          return (
            <Pressable
              key={v}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={t(a11yKey, { v })}
              accessibilityValue={{ min: 0, max: 10, now: v, text: t(a11yKey, { v }) }}
              onPress={() => onSelect(v)}
              style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : colors.primarySoft, borderWidth: sel ? 0 : 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}
            >
              <Text variant="bodyStrong" style={{ color: sel ? colors.onPrimary : colors.primary }}>{v}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[1] }}>
        <Text variant="caption" tone="secondary">{t(lowKey)}</Text>
        <Text variant="caption" tone="secondary">{t(highKey)}</Text>
      </View>
    </View>
  );
}

/** Seven 8 pt bars for the last 7 days of annoyance (plain Views, theme colours). Days without an entry show a faint stub. Memoised: re-renders only when the diary or the day changes. */
const MiniBars = React.memo(function MiniBars({ diary, date }: { diary: DiaryEntry[]; date: string }) {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const days = useMemo(() => last7Days(diary, date), [diary, date]);
  const H = 40;
  const values = days.map((d) => (d.value == null ? '–' : String(d.value))).join(', ');
  return (
    <View accessible accessibilityLabel={t('home.checkin.chartA11y', { values })} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: space[1] }}>
      {days.map((d, i) => {
        const isToday = i === days.length - 1;
        const h = d.value == null ? 3 : Math.max(3, Math.round((d.value / 10) * H));
        return (
          <View key={d.date} style={{ alignItems: 'center', gap: 4, width: 28 }}>
            <View style={{ height: H, justifyContent: 'flex-end' }}>
              <View style={{ width: 8, height: h, borderRadius: 4, backgroundColor: d.value == null ? colors.chart.grid : colors.chart.annoyance, opacity: isToday || d.value == null ? 1 : 0.7 }} />
            </View>
            <Text variant="caption" tone={isToday ? 'default' : 'muted'} style={{ fontSize: 11 }}>{formatDate(`${d.date}T12:00:00`, locale, { weekday: 'narrow' })}</Text>
          </View>
        );
      })}
    </View>
  );
});

/**
 * One-tap daily check-in on Home (PM §S1-04): tap an annoyance chip → diary entry upserted, today's `diary.daily`
 * task completed, light haptic, row collapses to "Kaydedildi · Düzenle". Loudness is a second, optional row and is
 * written only when that row is used (sprint 2 D6: never carried forward or copied from annoyance). On the CBT-I arm
 * (or any day with the sleep sound) a third row "Uyku kalitesi (dün gece)" replaces the old `sleep.diary` task and
 * completes it when an older programme still schedules it. Works without a programme. The full form stays at /diary.
 */
export function QuickCheckIn() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const diary = useClinical((s) => s.diary);
  const program = useClinical((s) => s.program);
  const upsertDiary = useClinical((s) => s.upsertDiary);
  const completeTask = useClinical((s) => s.completeTask);
  const track = useGrowth((s) => s.track);
  const date = today();
  const existing = diary.find((d) => d.date === date);
  const [editing, setEditing] = useState<Field | null>(existing ? null : 'annoyance');
  const compare = useMemo(() => weekCompare(diary, date), [diary, date]);

  const pos = program ? programPosition(program) : null;
  const todayTasks = program && pos ? tasksForDay(program, pos.week, pos.day) : [];
  const sleepRow = needsSleepRow(program?.arm, todayTasks);

  const completeToday = (id: string) => {
    if (!program || !pos) return;
    const key = taskKey(pos.week, pos.day, id);
    if (todayTasks.some((x) => x.id === id) && !program.completed[key]) {
      for (const e of returnEventsFor(program, pos)) track(e);
      completeTask(key);
    }
  };

  const save = (field: Field, v: number) => {
    const isNew = !existing;
    upsertDiary(buildCheckinEntry(existing, date, field, v));
    completeToday('diary.daily');
    if (field === 'sleep') completeToday('sleep.diary');
    if (isNew) track('checkinDone');
    void bumpReentryNudge();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(null);
  };

  const savedLine = (field: Field) => {
    const v = existing?.[ENTRY_KEY[field]];
    if (typeof v !== 'number') return null;
    return (
      <View key={field} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={16} color={colors.success} strokeWidth={3} />
        </View>
        <Text variant="bodySmall" style={{ flex: 1 }}>
          {t('home.checkin.saved')} · {t(A11Y[field], { v })}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('home.checkin.change')}: ${t(LABEL[field])}`} onPress={() => setEditing(field)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space[2] }}>
          <Text variant="caption" tone="primary">{t('home.checkin.change')}</Text>
        </Pressable>
        {field === 'annoyance' ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.edit')} accessibilityHint={t('home.checkin.editHint')} onPress={() => router.push('/diary')} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space[2] }}>
            <Text variant="caption" tone="primary">{t('common.edit')}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const compareLine = compare.prev != null && compare.cur != null
    ? t('home.checkin.compare', { cur: formatAvg(compare.cur, locale), prev: formatAvg(compare.prev, locale) })
    : t('home.checkin.firstWeek');

  const scaleRow = (field: 'loudness' | 'sleep') => (
    <View style={{ gap: space[2] }}>
      <Text variant="bodyStrong">{t(LABEL[field])}</Text>
      <ChipScale
        value={field === 'loudness' ? existing?.loudness : existing?.sleepQuality}
        onSelect={(v) => save(field, v)}
        a11yKey={A11Y[field]}
        lowKey={field === 'sleep' ? 'diary.scale.sleepLow' : undefined}
        highKey={field === 'sleep' ? 'diary.scale.sleepHigh' : undefined}
      />
    </View>
  );

  const hasLoudness = typeof existing?.loudness === 'number';
  const hasSleep = typeof existing?.sleepQuality === 'number';

  return (
    <Card title={t('home.checkin.title')} overline={t('home.checkin.overline')}>
      {editing === 'annoyance' || !existing ? (
        <ChipScale value={existing?.annoyance} onSelect={(v) => save('annoyance', v)} a11yKey="home.checkin.a11y" />
      ) : savedLine('annoyance')}

      {/* Sleep quality: offered right after the first tap on the CBT-I arm (it replaces a task), otherwise not shown. */}
      {existing && sleepRow ? (editing === 'sleep' || !hasSleep ? scaleRow('sleep') : savedLine('sleep')) : null}

      {existing && editing === 'loudness' ? scaleRow('loudness') : null}
      {existing && editing !== 'loudness' && hasLoudness ? savedLine('loudness') : null}
      {existing && editing == null && !hasLoudness ? (
        <Button size="sm" variant="ghost" title={t('home.checkin.addLoudness')} onPress={() => setEditing('loudness')} accessibilityLabel={t('home.checkin.addLoudnessA11y')} style={{ alignSelf: 'flex-start' }} />
      ) : null}

      <View style={{ gap: space[2], backgroundColor: colors.skeleton, borderRadius: radius.md, padding: space[3] }}>
        <MiniBars diary={diary} date={date} />
        <Text variant="caption" tone="secondary">{compareLine}</Text>
      </View>
    </Card>
  );
}
