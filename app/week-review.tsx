import React, { useEffect, useMemo } from 'react';
import { Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, Share2 } from 'lucide-react-native';
import { Button, Card, Disclaimer, Screen, Text } from '@/components';
import { WeeklyGoalRing, WEEKLY_GOAL_DAYS, formatAvg, isBackground, taskTitle, weekActiveDays, weekCompare } from '@/components/home';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { today, useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { ProgramTask } from '@/clinical/types';

/**
 * Sunday "1-minute weekly card" (PM §2.2 / S1-09): active days this week against the 5/7 goal, annoyance average
 * vs last week, the modules completed this week and next week's theme. Opened from the `review.weekly` task
 * (?taskKey=…) it completes that task on open. Renders without a programme and without last-week data.
 * Sharing sends only the user's own numbers as plain text; the full progress card lives at /share.
 */
export default function WeekReviewScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { taskKey: key } = useLocalSearchParams<{ taskKey?: string }>();
  const { program, diary, completeTask } = useClinical();
  const track = useGrowth((s) => s.track);
  const date = today();

  useEffect(() => {
    track('weekReviewOpened');
    if (typeof key === 'string' && key) completeTask(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const pos = program ? programPosition(program) : null;
  const activeDays = program && pos ? weekActiveDays(program, pos) : 0;
  const compare = useMemo(() => weekCompare(diary, date), [diary, date]);

  // Distinct non-check-in, non-sound tasks completed on this programme week's days up to today.
  const completed = useMemo(() => {
    if (!program || !pos) return [] as ProgramTask[];
    const seen = new Set<string>();
    const out: ProgramTask[] = [];
    for (let d = 1; d <= pos.day; d++) {
      for (const x of tasksForDay(program, pos.week, d)) {
        if (isBackground(x) || x.type === 'diary' || x.type === 'review' || seen.has(x.id)) continue;
        if (program.completed[taskKey(pos.week, d, x.id)]) { seen.add(x.id); out.push(x); }
      }
    }
    return out;
  }, [program, pos]);

  const nextTheme = program && pos ? program.weeks[pos.week]?.themeKey ?? null : null;
  const goalMet = activeDays >= WEEKLY_GOAL_DAYS;
  const avgLine = compare.cur == null
    ? t('week.annoyance.none')
    : compare.prev == null
      ? t('week.annoyance.cur', { cur: formatAvg(compare.cur, locale) })
      : t('home.checkin.compare', { cur: formatAvg(compare.cur, locale), prev: formatAvg(compare.prev, locale) });

  const share = async () => {
    const lines = [
      t('app.name'),
      t('week.share.days', { done: activeDays, goal: WEEKLY_GOAL_DAYS }),
      avgLine,
      completed.length ? t('week.share.modules', { n: completed.length }) : null,
      '',
      t('growth.share.card.footer'),
    ].filter((x): x is string => x != null);
    try { await Share.share({ message: lines.join('\n'), title: t('week.title') }); } catch { /* dismissed */ }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('week.title') }} />
      <Screen footer={<Button title={t('common.done')} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)'); }} />}>
        <Text variant="body" tone="secondary">{t('week.intro')}</Text>

        {program && pos ? (
          <Card overline={t('home.today.sub', { week: pos.week, day: pos.day })} title={t(program.weeks[pos.week - 1]?.themeKey ?? '')}>
            <WeeklyGoalRing done={activeDays} />
            {goalMet ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.successBg, borderRadius: radius.md, padding: space[3] }}>
                <Check size={20} color={colors.success} strokeWidth={3} />
                <Text variant="bodyStrong" tone="success" style={{ flex: 1 }}>{t('week.goalMet')}</Text>
              </View>
            ) : (
              <Text variant="bodySmall" tone="secondary">{t('week.goalMissed')}</Text>
            )}
          </Card>
        ) : (
          <Card><Text variant="body" tone="secondary">{t('week.noProgram')}</Text></Card>
        )}

        <Card title={t('week.annoyance')}>
          <Text variant="h2">{avgLine}</Text>
          {compare.delta != null ? (
            <Text variant="bodySmall" tone={compare.delta < 0 ? 'success' : compare.delta > 0 ? 'warning' : 'secondary'}>
              {compare.delta < 0 ? t('week.annoyance.down', { d: formatAvg(Math.abs(compare.delta), locale) }) : compare.delta > 0 ? t('week.annoyance.up', { d: formatAvg(compare.delta, locale) }) : t('week.annoyance.flat')}
            </Text>
          ) : <Text variant="caption" tone="muted">{t('home.checkin.firstWeek')}</Text>}
        </Card>

        {program ? (
          <Card title={t('week.modules')}>
            {completed.length ? completed.map((x) => (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 32 }}>
                <Check size={18} color={colors.success} strokeWidth={3} />
                <Text variant="body" style={{ flex: 1 }}>{taskTitle(t, x)}</Text>
                <Text variant="caption" tone="muted">{t('common.minutes', { n: x.minutes })}</Text>
              </View>
            )) : <Text variant="body" tone="secondary">{t('week.modules.none')}</Text>}
          </Card>
        ) : null}

        {program ? (
          <Card variant="tinted" overline={t('week.next')} title={nextTheme ? t(nextTheme) : t('week.next.none')}>
            {nextTheme ? <Text variant="bodySmall" tone="secondary">{t('week.next.body')}</Text> : null}
            <Button size="sm" variant="ghost" title={t('home.today.viewProgram')} icon={<ArrowRight size={16} color={colors.primary} />} onPress={() => router.push('/program')} />
          </Card>
        ) : null}

        <View style={{ gap: space[2] }}>
          <Button variant="secondary" title={t('week.share')} icon={<Share2 size={18} color={colors.primary} />} onPress={() => { void share(); }} />
          <Button variant="ghost" size="sm" title={t('week.share.full')} onPress={() => router.push('/share')} />
        </View>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
