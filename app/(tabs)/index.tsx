import React, { useMemo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, AudioWaveform, Flame, MoonStar, TrendingDown, TrendingUp, Minus, CheckCircle2 } from 'lucide-react-native';
import { Banner, Button, Card, Screen, Text } from '@/components';
import { JourneyCard, TabHeader, taskIcon } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useProfile } from '@/hooks/useProfile';
import { adherence, dayCompletion, programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { QuestionnaireResult } from '@/clinical/types';

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
  const { program, diary, sessions, assessments, redFlagAcknowledgedAt, acknowledgeRedFlag } = useClinical();
  const now = new Date();

  const greeting = `${t(greetingKey(now.getHours()))}${displayName ? `, ${displayName}` : ''}`;
  const dateLabel = formatDate(now.toISOString(), locale, { weekday: 'long', day: 'numeric', month: 'long' });

  const showUrgent = !!profile && profile.triage === 'urgent' && !redFlagAcknowledgedAt;
  const selfHarm = !!profile?.triageReasons.includes('triage.selfHarm');

  const pos = program ? programPosition(program, now) : null;
  const todayTasks = program && pos ? tasksForDay(program, pos.week, pos.day) : [];
  const completion = program && pos ? dayCompletion(program, pos.week, pos.day) : { done: 0, total: 0 };
  const nextTask = program && pos ? todayTasks.find((task) => !program.completed[taskKey(pos.week, pos.day, task.id)]) : undefined;
  const minutesLeft = program && pos ? todayTasks.filter((task) => !program.completed[taskKey(pos.week, pos.day, task.id)]).reduce((m, x) => m + Math.min(x.minutes, 30), 0) : 0;

  const weekAdherence = program ? Math.round(adherence(program, now, 7) * 100) : null;
  const thiResults = useMemo(() => {
    const all: QuestionnaireResult[] = [];
    for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'THI') all.push(q);
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments]);
  const thiTrend = thiResults.length >= 2 ? thiResults[thiResults.length - 1].total - thiResults[thiResults.length - 2].total : null;
  const activeDays = useMemo(() => {
    const days = new Set<string>();
    const cutoff = new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
    for (const d of diary) if (d.date >= cutoff) days.add(d.date);
    for (const s of sessions) if (s.date.slice(0, 10) >= cutoff) days.add(s.date.slice(0, 10));
    if (program) for (const iso of Object.values(program.completed)) if (iso.slice(0, 10) >= cutoff) days.add(iso.slice(0, 10));
    return days.size;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <Screen tab>
      <TabHeader title={greeting} subtitle={dateLabel} />

      {showUrgent ? (
        <Banner
          tone="danger"
          title={t('home.redflag.title')}
          body={selfHarm ? t('home.redflag.selfHarm') : t('home.redflag.body')}
          primary={selfHarm ? { title: t('home.redflag.call'), onPress: () => { void Linking.openURL('tel:112'); } } : { title: t('common.whatToDo'), onPress: () => router.push('/assess/results') }}
          secondary={{ title: t('common.understood'), onPress: acknowledgeRedFlag }}
        />
      ) : null}

      {program && pos ? (
        <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.e2]}>
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space[5], gap: space[3] }}>
            <Text variant="overline" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('home.today.sub', { week: pos.week, day: pos.day })} · {t(program.weeks[pos.week - 1]?.themeKey ?? '')}</Text>
            {nextTask ? (
              <>
                <Text variant="h1" style={{ color: '#FFFFFF' }}>{t('session.hero.title')}</Text>
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.88)' }}>{t('session.hero.body', { n: completion.total - completion.done, min: minutesLeft })}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.md, padding: space[3] }}>
                  <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>{taskIcon(nextTask.type, '#FFFFFF')}</View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" style={{ color: 'rgba(255,255,255,0.75)' }}>{t('session.next')}</Text>
                    <Text variant="bodyStrong" style={{ color: '#FFFFFF' }} numberOfLines={1}>{t(nextTask.titleKey)}</Text>
                  </View>
                  <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>{t('common.minutes', { n: nextTask.minutes })}</Text>
                </View>
                <Button title={t('session.start')} icon={<ArrowRight size={18} color={colors.primary} />} variant="inverse" onPress={() => router.push('/session')} />
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <CheckCircle2 size={24} color="#FFFFFF" />
                  <Text variant="h2" style={{ color: '#FFFFFF' }}>{t('session.allDone.title')}</Text>
                </View>
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.88)' }}>{t('home.today.allDone')}</Text>
                <Button variant="inverse" title={t('home.today.viewProgram')} onPress={() => router.push('/program')} />
              </>
            )}
          </LinearGradient>
          <View style={{ backgroundColor: colors.card, paddingHorizontal: space[4], paddingVertical: space[3], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="caption" tone="secondary">{t('home.today.tasks', { done: completion.done, total: completion.total })}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/program')}><Text variant="caption" tone="primary">{t('home.today.viewProgram')}</Text></Pressable>
          </View>
        </View>
      ) : (
        <JourneyCard />
      )}

      <View style={{ flexDirection: 'row', gap: space[3] }}>
        {tile(<AudioWaveform size={22} color={colors.primary} />, t('home.quickSound'), t('home.quickSound.short'), () => router.push('/sound/player?preset=enrichment'), colors.primarySoft)}
        {tile(<MoonStar size={22} color={colors.secondaryText} />, t('home.sleep'), t('home.sleep.short'), () => router.push('/sleep'), colors.secondarySoft)}
      </View>

      {program ? (
        <Card title={t('home.weekly')}>
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="secondary">{t('home.weekly.adherence')}</Text>
              <Text variant="h2">{weekAdherence == null ? '—' : `%${weekAdherence}`}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="secondary">{t('home.weekly.thi')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TrendIcon size={20} color={trendTone} />
                <Text variant="bodyStrong" style={{ color: trendTone }}>{thiTrend == null ? trendLabel : `${trendLabel} (${thiTrend > 0 ? '+' : ''}${thiTrend})`}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space[3] }}>
            <Flame size={20} color={colors.accentText} />
            <Text variant="bodyStrong" style={{ color: colors.accentText }}>{t('home.weekly.days', { n: activeDays })}</Text>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
