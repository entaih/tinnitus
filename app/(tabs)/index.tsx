import React, { useEffect, useMemo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, AudioWaveform, CalendarCheck, MoonStar, TrendingDown, TrendingUp, Minus, CheckCircle2, Share2, Trophy } from 'lucide-react-native';
import { Banner, Button, Card, Screen, Text } from '@/components';
import { BackgroundSoundRow, JourneyCard, QuickCheckIn, TabHeader, WeeklyGoalRing, activeMinutes, activeTasks, backgroundTasks, coreTask, isBackground, isMaintenance, maintenanceWeek, openTask, planForToday, programFinished, refresherActive, structuredWeeks, taskIcon, taskMeta, taskTitle, totalActiveDays, weekActiveDays, weeklyGoalOf } from '@/components/home';
import { ClinicCodeLine, thiSeries } from '@/components/growth';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { today, useClinical } from '@/store/clinical';
import { useProfile } from '@/hooks/useProfile';
import { programPosition, taskKey } from '@/clinical/program';

function greetingKey(h: number) {
  if (h < 6) return 'home.greeting.night';
  if (h < 12) return 'home.greeting.morning';
  if (h < 18) return 'home.greeting.day';
  if (h < 23) return 'home.greeting.evening';
  return 'home.greeting.night';
}

export default function HomeScreen() {
  const { colors, space, radius, shadow } = useTheme();
  const t = useT();
  const locale = useLocale();
  const displayName = useSettings((s) => s.displayName);
  const { profile } = useProfile();
  // Separate selectors (sprint 3 E11): a diary change re-renders Home but does not recompute the programme-dependent plan.
  const program = useClinical((s) => s.program);
  const diary = useClinical((s) => s.diary);
  const sessions = useClinical((s) => s.sessions);
  const assessments = useClinical((s) => s.assessments);
  const redFlagAcknowledgedAt = useClinical((s) => s.redFlagAcknowledgedAt);
  const acknowledgeRedFlag = useClinical((s) => s.acknowledgeRedFlag);
  const date = today();
  const now = new Date();

  const ensureMaintenance = useClinical((s) => s.ensureMaintenance);
  const enterMaintenance = useClinical((s) => s.enterMaintenance);
  // Programme end → maintenance block bookkeeping (A1): extends the block when its last week is reached.
  useEffect(() => { ensureMaintenance(); }, [ensureMaintenance, program?.id, program?.phase, date]);

  const greeting = `${t(greetingKey(now.getHours()))}${displayName ? `, ${displayName}` : ''}`;
  const dateLabel = formatDate(now.toISOString(), locale, { weekday: 'long', day: 'numeric', month: 'long' });

  const showUrgent = !!profile && profile.triage === 'urgent' && !redFlagAcknowledgedAt;
  const selfHarm = !!profile?.triageReasons.includes('triage.selfHarm');

  // Today's plan: budgeted, at most 3 numbered steps (or the short split after missed days). Background sound is a
  // separate row, never the "next" step, and does not count as active minutes. Memoised on the programme and the day.
  const pos = useMemo(() => (program ? programPosition(program, new Date()) : null), [program, date]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = useMemo(() => (program && pos ? planForToday(program, pos) : null), [program, pos]);
  const core = useMemo(() => (plan ? coreTask(plan.tasks) : null), [plan]);
  const finished = useMemo(() => (program ? programFinished(program, new Date()) : false), [program, date]); // eslint-disable-line react-hooks/exhaustive-deps
  const maintenance = isMaintenance(program);
  const refresher = !!program && refresherActive(program);
  const goal = weeklyGoalOf(program);
  const shown = plan?.shown ?? [];
  const numbered = activeTasks(shown);
  const background = backgroundTasks(shown);
  const pendingShown = plan ? numbered.filter((x) => !plan.isDone(x)) : [];
  const nextTask = pendingShown[0] ?? (plan ? plan.more.find((x) => !plan.isDone(x) && !isBackground(x)) : undefined);
  const minutesLeft = activeMinutes(pendingShown);
  const completion = plan ? { done: numbered.filter((x) => plan.isDone(x)).length, total: numbered.length } : { done: 0, total: 0 };
  const reentry = !!plan?.reentry;
  const weekDone = program && pos ? weekActiveDays(program, pos) : null;

  const thiResults = useMemo(() => thiSeries(assessments), [assessments]);
  const thiTrend = thiResults.length >= 2 ? thiResults[thiResults.length - 1].total - thiResults[thiResults.length - 2].total : null;
  const activeDays = useMemo(() => {
    const days = new Set<string>();
    const cutoff = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
    for (const d of diary) if (d.date >= cutoff) days.add(d.date);
    for (const s of sessions) if (s.date.slice(0, 10) >= cutoff) days.add(s.date.slice(0, 10));
    if (program) for (const iso of Object.values(program.completed)) if (iso.slice(0, 10) >= cutoff) days.add(iso.slice(0, 10));
    return days.size;
  }, [diary, sessions, program]);

  const TrendIcon = thiTrend == null ? Minus : thiTrend < 0 ? TrendingDown : thiTrend > 0 ? TrendingUp : Minus;
  const trendLabel = thiTrend == null ? t('home.weekly.thi.none') : thiTrend < 0 ? t('home.weekly.thi.down') : thiTrend > 0 ? t('home.weekly.thi.up') : t('home.weekly.thi.flat');
  const trendTone = thiTrend == null ? colors.textSecondary : thiTrend < 0 ? colors.success : thiTrend > 0 ? colors.warning : colors.textSecondary;

  const tile = (icon: React.ReactNode, title: string, body: string, onPress: () => void, bg: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: space[4], gap: space[2], opacity: pressed ? 0.9 : 1, borderWidth: 1, borderColor: colors.border }, shadow.e1]}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text variant="bodyStrong">{title}</Text>
      <Text variant="caption" tone="secondary">{body}</Text>
    </Pressable>
  );

  // Hero line (PM sprint 2 §B1): "Bugünün tek şeyi: {core} · {dk} dk"; once the core is done, the remaining optional count.
  const coreDone = !!core && !!plan?.isDone(core);
  const optionalLeft = core ? pendingShown.filter((x) => x.id !== core.id && x.type !== 'diary').length : pendingShown.length;
  const heroBody = reentry
    ? t('home.reentry.body', { min: minutesLeft })
    : core && !coreDone
      ? t(isBackground(core) ? 'home.today.coreBackground' : 'home.today.core', { core: taskTitle(t, core), min: core.minutes })
      : core && coreDone
        ? (optionalLeft > 0 ? t('home.today.coreDone', { n: optionalLeft }) : t('home.today.coreDoneNone'))
        : t(plan && background.some((x) => !plan.isDone(x)) ? 'session.hero.bodySound' : 'session.hero.body', { n: pendingShown.length, min: minutesLeft });
  const heroOverline = program && pos
    ? maintenance
      ? t('home.maintenance.sub', { week: maintenanceWeek(program, pos), done: weekDone ?? 0, goal })
      : `${t('home.today.sub', { week: pos.week, day: pos.day })} · ${t(program.weeks[pos.week - 1]?.themeKey ?? '')}`
    : '';

  // Programme end (sprint 3 E1): "Programı tamamladınız" with the user's own numbers, one tap into maintenance, share.
  const finishedWeeks = program ? structuredWeeks(program) : 0;
  const finishedDays = program ? totalActiveDays(program) : 0;
  const finishedHeadline = t('growth.moment.programDone.card', { weeks: finishedWeeks, days: finishedDays });

  return (
    <Screen tab>
      <TabHeader
        title={greeting}
        subtitle={dateLabel}
        right={program ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.program')}
            accessibilityHint={t('home.program.sub')}
            onPress={() => router.push('/program')}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
          >
            <CalendarCheck size={22} color={colors.primary} />
          </Pressable>
        ) : undefined}
      />

      {showUrgent ? (
        <Banner
          tone="danger"
          title={t('home.redflag.title')}
          body={selfHarm ? t('home.redflag.selfHarm') : t('home.redflag.body')}
          primary={selfHarm ? { title: t('home.redflag.call'), onPress: () => { void Linking.openURL('tel:112'); } } : { title: t('common.whatToDo'), onPress: () => router.push('/assess/results') }}
          secondary={{ title: t('common.understood'), onPress: acknowledgeRedFlag }}
        />
      ) : null}

      {program && finished ? (
        <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.e2]}>
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space[5], gap: space[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
              <Trophy size={24} color="#FFFFFF" />
              <Text variant="h1" style={{ color: '#FFFFFF', flex: 1 }} accessibilityRole="header">{t('home.finished.title')}</Text>
            </View>
            <Text variant="body" style={{ color: 'rgba(255,255,255,0.9)' }}>{t('home.finished.body', { n: finishedWeeks, k: finishedDays })}</Text>
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.85)' }}>{t('home.finished.maintenanceHint')}</Text>
            <Button variant="inverse" title={t('home.finished.maintenance')} icon={<ArrowRight size={18} color={colors.primary} />} onPress={enterMaintenance} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.finished.share')}
              onPress={() => router.push({ pathname: '/share', params: { moment: 'programDone', headline: finishedHeadline } })}
              style={({ pressed }) => ({ minHeight: 44, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[3], opacity: pressed ? 0.7 : 1 })}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text variant="bodySmall" style={{ color: '#FFFFFF', textDecorationLine: 'underline' }}>{t('home.finished.share')}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      ) : program && pos ? (
        <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.e2]}>
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space[5], gap: space[3] }}>
            <Text variant="overline" style={{ color: 'rgba(255,255,255,0.85)' }}>{heroOverline}</Text>
            {nextTask ? (
              <>
                <Text variant="h1" style={{ color: '#FFFFFF' }}>{reentry ? t('home.reentry.title') : maintenance ? t('home.maintenance.title') : t('session.hero.title')}</Text>
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.9)' }}>{heroBody}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.md, padding: space[3] }}>
                  <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>{taskIcon(nextTask.type, '#FFFFFF')}</View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>{t('session.next')}</Text>
                    <Text variant="bodyStrong" style={{ color: '#FFFFFF' }} numberOfLines={1}>{taskTitle(t, nextTask)}</Text>
                  </View>
                  <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>{taskMeta(t, nextTask)}</Text>
                </View>
                <Button title={t('session.start')} icon={<ArrowRight size={18} color={colors.primary} />} variant="inverse" onPress={() => router.push('/session')} />
                {!reentry ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={t('home.short')} accessibilityHint={t('session.short.hint')} onPress={() => router.push('/session?short=1')} style={({ pressed }) => ({ minHeight: 44, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: space[3], opacity: pressed ? 0.7 : 1 })}>
                    <Text variant="bodySmall" style={{ color: '#FFFFFF', textDecorationLine: 'underline' }}>{t('home.short')}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <CheckCircle2 size={24} color="#FFFFFF" />
                  <Text variant="h2" style={{ color: '#FFFFFF' }}>{t('session.allDone.title')}</Text>
                </View>
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.9)' }}>{t(maintenance ? 'home.maintenance.allDone' : 'home.today.allDone')}</Text>
                <Button variant="inverse" title={t('home.sleep')} icon={<MoonStar size={18} color={colors.primary} />} onPress={() => router.push('/sleep')} />
              </>
            )}
          </LinearGradient>
          <View style={{ backgroundColor: colors.card, paddingHorizontal: space[4], paddingVertical: space[2] }}>
            {background.map((task) => (
              <BackgroundSoundRow key={task.id} task={task} state={plan?.isDone(task) ? 'done' : 'idle'} onOpen={() => openTask(task, taskKey(pos.week, pos.day, task.id))} />
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="caption" tone="secondary">{t('home.today.tasks', { done: completion.done, total: completion.total })}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/program')} style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="caption" tone="primary">{t('home.today.viewProgram')}</Text></Pressable>
            </View>
          </View>
        </View>
      ) : (
        <>
          <JourneyCard />
          <ClinicCodeLine />
        </>
      )}

      {refresher && program?.refresherUntil ? (
        <Banner tone="info" title={t('home.refresher.title')} body={t('home.refresher.body', { date: formatDate(`${program.refresherUntil}T12:00:00`, locale) })} />
      ) : null}

      <QuickCheckIn />

      <View style={{ flexDirection: 'row', gap: space[3] }}>
        {tile(<AudioWaveform size={22} color={colors.primary} />, t('home.quickSound'), t('home.quickSound.short'), () => router.push('/sound/player?preset=enrichment'), colors.primarySoft)}
        {tile(<MoonStar size={22} color={colors.secondaryText} />, t('home.sleep'), t('home.sleep.short'), () => router.push('/sleep'), colors.secondarySoft)}
      </View>

      {program && pos && weekDone != null && !finished ? (
        <Card title={t('home.weekly')} right={<Pressable accessibilityRole="button" onPress={() => router.push('/week-review')} style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="caption" tone="primary">{t('week.open')}</Text></Pressable>}>
          <WeeklyGoalRing done={weekDone} goal={goal} />
          <View style={{ gap: 2 }}>
            <Text variant="caption" tone="secondary">{t('home.weekly.thi')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TrendIcon size={20} color={trendTone} />
              <Text variant="bodyStrong" style={{ color: trendTone }}>{thiTrend == null ? trendLabel : `${trendLabel} (${thiTrend > 0 ? '+' : ''}${thiTrend})`}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space[3] }}>
            <CalendarCheck size={20} color={colors.accentText} />
            <Text variant="bodyStrong" style={{ color: colors.accentText }}>{t('home.weekly.days', { n: activeDays })}</Text>
          </View>
        </Card>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel={t('growth.crisis.link')} onPress={() => router.push('/crisis')} style={({ pressed }) => ({ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: space[4], opacity: pressed ? 0.7 : 1 })}>
        <Text variant="bodySmall" tone="secondary" style={{ textDecorationLine: 'underline' }}>{t('growth.crisis.link')}</Text>
      </Pressable>
    </Screen>
  );
}
