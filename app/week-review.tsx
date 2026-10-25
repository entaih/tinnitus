import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, Gift, Share2 } from 'lucide-react-native';
import { Button, Card, Disclaimer, Screen, Text } from '@/components';
import { WeeklyGoalRing, activeTasks, formatAvg, isBackground, isMaintenance, maintenanceWeek, planForToday, programFinished, programWeekWindow, taskTitle, weekActiveDays, weekCompare, weeklyGoalOf } from '@/components/home';
import { ProgressCardView, STORE_ANDROID, STORE_IOS, ShareMomentCard, computeProgressStats, inviteLink, shareCardImage, shareMoments, thiSeries } from '@/components/growth';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { today, useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { programPosition, taskKey, tasksForDay } from '@/clinical/program';
import { getModule } from '@/content/modules';
import { pick } from '@/i18n';
import type { ProgramTask } from '@/clinical/types';

/**
 * Sunday "1-minute weekly card" (PM §2.2 / S1-09): active days this week against the weekly goal (5/7, or 3/7 in
 * maintenance), annoyance average vs last week — both over the same programme week (day 1 … today; sprint 2 D12) —
 * the modules completed this week with their first summary bullet ("Bu hafta öğrendikleriniz") and next week's theme.
 * Opened from the `review.weekly` task (?taskKey=…) it completes that task on open. Renders without a programme and
 * without last-week data. "Paylaş" captures the visual progress card (sprint 3 B3) with this week's line as headline and
 * falls back to plain text; "Davet et" sends the invite deep link. Only the user's own numbers leave the device.
 */
export default function WeekReviewScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { taskKey: key } = useLocalSearchParams<{ taskKey?: string }>();
  const program = useClinical((s) => s.program);
  const diary = useClinical((s) => s.diary);
  const sessions = useClinical((s) => s.sessions);
  const assessments = useClinical((s) => s.assessments);
  const completeTask = useClinical((s) => s.completeTask);
  const track = useGrowth((s) => s.track);
  const inviteCode = useGrowth((s) => s.inviteCode);
  const lastShareMomentAt = useGrowth((s) => s.lastShareMomentAt);
  const lastShareMomentId = useGrowth((s) => s.lastShareMomentId);
  const date = today();
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track('weekReviewOpened');
    if (typeof key === 'string' && key) completeTask(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const pos = useMemo(() => (program ? programPosition(program) : null), [program]);
  const activeDays = program && pos ? weekActiveDays(program, pos) : 0;
  const goal = weeklyGoalOf(program);
  const maintenance = isMaintenance(program);
  const window = program && pos ? programWeekWindow(program.startDate, pos) : undefined;
  const compare = useMemo(() => weekCompare(diary, date, 'annoyance', window), [diary, date, window?.from, window?.to]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const learned = completed.map((x) => { const first = getModule(x.id)?.summary; return first ? { id: x.id, line: pick(first, locale)[0] } : null; }).filter((x): x is { id: string; line: string } => !!x && !!x.line);
  const nextTheme = program && pos ? program.weeks[pos.week]?.themeKey ?? null : null;
  const goalMet = activeDays >= goal;
  const avgLine = compare.cur == null
    ? t('week.annoyance.none')
    : compare.prev == null
      ? t('week.annoyance.cur', { cur: formatAvg(compare.cur, locale) })
      : t('home.checkin.compare', { cur: formatAvg(compare.cur, locale), prev: formatAvg(compare.prev, locale) });

  // Share moment (sprint 3 B3): today's numbered steps all done counts as "the day is done" for the first-week card.
  const thi = useMemo(() => thiSeries(assessments), [assessments]);
  const dayDone = useMemo(() => {
    if (!program || !pos) return false;
    const plan = planForToday(program, pos);
    const numbered = activeTasks(plan.shown);
    return numbered.length > 0 && numbered.every((x) => plan.isDone(x));
  }, [program, pos]);
  const moment = useMemo(() => shareMoments({
    program, pos, thi, weekDone: activeDays, weeklyGoal: goal, finished: program ? programFinished(program) : false, dayDone, lastShareMomentAt, lastShareMomentId,
  }), [program, pos, thi, activeDays, goal, dayDone, lastShareMomentAt, lastShareMomentId]);

  const stats = useMemo(() => computeProgressStats({ assessments, program, diary, sessions }), [assessments, program, diary, sessions]);
  const headline = t('week.share.days', { done: activeDays, goal });

  const share = async () => {
    const lines = [t('app.name'), headline, avgLine, completed.length ? t('week.share.modules', { n: completed.length }) : null, '', t('growth.share.card.footer')].filter((x): x is string => x != null);
    setBusy(true);
    try { await shareCardImage(cardRef, { fileName: 'dingin-week', dialogTitle: t('week.title'), fallbackText: lines.join('\n') }); } catch { /* dismissed */ } finally { setBusy(false); }
  };
  const invite = async () => {
    const message = t('growth.invite.message', { link: inviteLink(inviteCode), ios: STORE_IOS, android: STORE_ANDROID });
    try { await Share.share({ message, title: t('growth.invite.title') }); } catch { /* dismissed */ }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('week.title') }} />
      <Screen footer={<Button title={t('common.done')} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)'); }} />}>
        <Text variant="body" tone="secondary">{t(maintenance ? 'week.intro.maintenance' : 'week.intro')}</Text>

        {program && pos ? (
          <Card
            overline={maintenance ? t('home.maintenance.sub', { week: maintenanceWeek(program, pos), done: activeDays, goal }) : t('home.today.sub', { week: pos.week, day: pos.day })}
            title={maintenance ? t('home.maintenance.title') : t(program.weeks[pos.week - 1]?.themeKey ?? '')}
          >
            <WeeklyGoalRing done={activeDays} goal={goal} />
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

        {moment ? <ShareMomentCard moment={moment} /> : null}

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
          <Card title={t('week.learned')}>
            {learned.length ? learned.map((x) => (
              <View key={x.id} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 9 }} />
                <Text variant="body" style={{ flex: 1 }}>{x.line}</Text>
              </View>
            )) : <Text variant="bodySmall" tone="secondary">{t('week.learned.none')}</Text>}
          </Card>
        ) : null}

        {program ? (
          <Card variant="tinted" overline={t('week.next')} title={nextTheme ? t(nextTheme) : t(maintenance ? 'week.next.maintenance' : 'week.next.none')}>
            {nextTheme ? <Text variant="bodySmall" tone="secondary">{t('week.next.body')}</Text> : null}
            <Button size="sm" variant="ghost" title={t('home.today.viewProgram')} icon={<ArrowRight size={16} color={colors.primary} />} onPress={() => router.push('/program')} />
          </Card>
        ) : null}

        {program ? <ProgressCardView ref={cardRef} stats={stats} headline={headline} /> : null}
        <View style={{ gap: space[2] }}>
          <Button variant="secondary" title={t('week.share')} icon={<Share2 size={18} color={colors.primary} />} loading={busy} disabled={busy} onPress={() => { void share(); }} />
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Button variant="ghost" size="sm" style={{ flex: 1 }} title={t('growth.moment.invite')} icon={<Gift size={16} color={colors.primary} />} onPress={() => { void invite(); }} />
            <Button variant="ghost" size="sm" style={{ flex: 1 }} title={t('week.share.full')} onPress={() => router.push('/share')} />
          </View>
          <Text variant="caption" tone="muted">{t('growth.share.privacy')}</Text>
        </View>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
