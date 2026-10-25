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
import { formatAvg, last7Days, lastEntryBefore, weekCompare } from './checkinStats';
import { returnEventsFor } from './milestones';
import { bumpReentryNudge } from '@/notifications';

type Field = 'annoyance' | 'loudness';

/** 0–10 chips, 44 pt each, wrapping into two rows of six/five. Accessible as a radio group. */
function ChipScale({ value, onSelect, a11yKey }: { value: number | undefined; onSelect: (v: number) => void; a11yKey: string }) {
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
              onPress={() => onSelect(v)}
              style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.primary : colors.primarySoft, borderWidth: sel ? 0 : 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}
            >
              <Text variant="bodyStrong" style={{ color: sel ? colors.onPrimary : colors.primary }}>{v}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[1] }}>
        <Text variant="caption" tone="secondary">{t('diary.scale.low')}</Text>
        <Text variant="caption" tone="secondary">{t('diary.scale.high')}</Text>
      </View>
    </View>
  );
}

/** Seven 8 pt bars for the last 7 days of annoyance (plain Views, theme colours). Days without an entry show a faint stub. */
function MiniBars({ diary, date }: { diary: DiaryEntry[]; date: string }) {
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
}

/**
 * One-tap daily check-in on Home (PM §S1-04): tap an annoyance chip → diary entry upserted, today's `diary.daily`
 * task completed, light haptic, row collapses to "Kaydedildi · Düzenle". Loudness is a second, optional row.
 * Works without a programme (entries start before the assessment). The full form stays at /diary.
 */
export function QuickCheckIn() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { diary, program, upsertDiary, completeTask } = useClinical();
  const track = useGrowth((s) => s.track);
  const date = today();
  const existing = diary.find((d) => d.date === date);
  const [editing, setEditing] = useState<Field | null>(existing ? null : 'annoyance');
  const [loudnessSaved, setLoudnessSaved] = useState(false);
  const compare = useMemo(() => weekCompare(diary, date), [diary, date]);

  const save = (field: Field, v: number) => {
    const last = lastEntryBefore(diary, date);
    const entry: DiaryEntry = {
      ...existing,
      date,
      annoyance: field === 'annoyance' ? v : existing?.annoyance ?? last?.annoyance ?? v,
      loudness: field === 'loudness' ? v : existing?.loudness ?? last?.loudness ?? v,
      mood: existing?.mood ?? 1,
    };
    const isNew = !existing;
    upsertDiary(entry);
    if (program) {
      const pos = programPosition(program);
      const key = taskKey(pos.week, pos.day, 'diary.daily');
      if (tasksForDay(program, pos.week, pos.day).some((x) => x.id === 'diary.daily') && !program.completed[key]) {
        for (const e of returnEventsFor(program, pos)) track(e);
        completeTask(key);
      }
    }
    if (isNew) track('checkinDone');
    void bumpReentryNudge();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(null);
  };

  const savedLine = (field: Field) => {
    const v = existing?.[field];
    if (v == null) return null;
    return (
      <View key={field} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={16} color={colors.success} strokeWidth={3} />
        </View>
        <Text variant="bodySmall" style={{ flex: 1 }}>
          {t('home.checkin.saved')} · {t(field === 'annoyance' ? 'home.checkin.a11y' : 'home.checkin.loudnessA11y', { v })}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t('home.checkin.change')}: ${t(field === 'annoyance' ? 'home.checkin.annoyance' : 'home.checkin.loudness')}`} onPress={() => setEditing(field)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space[2] }}>
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

  const loudnessChips = existing ? (
    <View style={{ gap: space[2] }}>
      <Text variant="bodyStrong">{t('home.checkin.loudness')}</Text>
      <ChipScale value={existing.loudness} onSelect={(v) => { save('loudness', v); setLoudnessSaved(true); }} a11yKey="home.checkin.loudnessA11y" />
    </View>
  ) : null;

  return (
    <Card title={t('home.checkin.title')} overline={t('home.checkin.overline')}>
      {editing === 'annoyance' || !existing ? (
        <ChipScale value={existing?.annoyance} onSelect={(v) => save('annoyance', v)} a11yKey="home.checkin.a11y" />
      ) : savedLine('annoyance')}

      {existing && editing === 'loudness' ? loudnessChips : null}
      {existing && editing !== 'loudness' && loudnessSaved ? savedLine('loudness') : null}
      {existing && editing == null && !loudnessSaved ? (
        <Button size="sm" variant="ghost" title={t('home.checkin.addLoudness')} onPress={() => setEditing('loudness')} accessibilityLabel={t('home.checkin.addLoudnessA11y')} style={{ alignSelf: 'flex-start' }} />
      ) : null}

      <View style={{ gap: space[2], backgroundColor: colors.skeleton, borderRadius: radius.md, padding: space[3] }}>
        <MiniBars diary={diary} date={date} />
        <Text variant="caption" tone="secondary">{compareLine}</Text>
      </View>
    </Card>
  );
}
