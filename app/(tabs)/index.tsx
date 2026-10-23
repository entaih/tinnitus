import React, { useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { AudioWaveform, BookOpen, Flame, TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import { Banner, Button, Card, EvidenceChip, ProgressRing, Screen, Text, useCitation } from '@/components';
import { MoodCheck, TabHeader, TaskRow, openTask, type Mood } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { today, useClinical } from '@/store/clinical';
import { useProfile } from '@/hooks/useProfile';
import { computeTriage } from '@/clinical/engine';
import { adherence, dayCompletion, programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { DiaryEntry, QuestionnaireResult } from '@/clinical/types';

const EDU_SLUGS = ['what-is-tinnitus', 'habituation', 'sleep', 'hearing-protection', 'when-to-see-a-doctor', 'supplements'];

function greetingKey(h: number) {
  if (h < 6) return 'home.greeting.night';
  if (h < 12) return 'home.greeting.morning';
  if (h < 18) return 'home.greeting.day';
  if (h < 23) return 'home.greeting.evening';
  return 'home.greeting.night';
}

export default function HomeScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const displayName = useSettings((s) => s.displayName);
  const { assessment, profile } = useProfile();
  const { program, diary, sessions, assessments, redFlagAcknowledgedAt, acknowledgeRedFlag, upsertDiary, completeTask, setProgram } = useClinical();
  const cite = useCitation();
  const now = new Date();

  const greeting = `${t(greetingKey(now.getHours()))}${displayName ? `, ${displayName}` : ''}`;
  const dateLabel = formatDate(now.toISOString(), locale, { weekday: 'long', day: 'numeric', month: 'long' });

  // --- Triage banners ---
  const tier = assessment ? computeTriage(assessment).tier : null;
  const showUrgent = !!profile && profile.triage === 'urgent' && !redFlagAcknowledgedAt;
  const showInfo = !showUrgent && tier === 3 && !redFlagAcknowledgedAt;
  const selfHarm = !!profile?.triageReasons.includes('triage.selfHarm');

  // --- Today's programme ---
  const pos = program ? programPosition(program, now) : null;
  const todayTasks = program && pos ? tasksForDay(program, pos.week, pos.day) : [];
  const completion = program && pos ? dayCompletion(program, pos.week, pos.day) : { done: 0, total: 0 };
  const hasThi = assessments.some((a) => a.questionnaires.some((q) => q.id === 'THI'));

  const toggleTask = (key: string) => {
    if (!program) return;
    if (program.completed[key]) {
      const completed = { ...program.completed };
      delete completed[key];
      setProgram({ ...program, completed });
    } else completeTask(key);
  };

  // --- Mood check ---
  const todayEntry = diary.find((d) => d.date === today());
  const [showSliders, setShowSliders] = useState(false);
  const [loud, setLoud] = useState(todayEntry?.loudness ?? 5);
  const [annoy, setAnnoy] = useState(todayEntry?.annoyance ?? 5);
  const saveMood = (mood: Mood) => {
    const e: DiaryEntry = { ...(todayEntry ?? { date: today(), loudness: loud, annoyance: annoy }), mood };
    upsertDiary(e);
    setShowSliders(true);
  };
  const saveSlider = (field: 'loudness' | 'annoyance', v: number) => {
    const base: DiaryEntry = todayEntry ?? { date: today(), loudness: loud, annoyance: annoy, mood: 1 };
    upsertDiary({ ...base, [field]: v });
  };

  // --- Weekly summary ---
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

  const eduSlug = useMemo(() => EDU_SLUGS[Math.floor(Math.random() * EDU_SLUGS.length)], []);

  const TrendIcon = thiTrend == null ? Minus : thiTrend < 0 ? TrendingDown : thiTrend > 0 ? TrendingUp : Minus;
  const trendLabel = thiTrend == null ? t('home.weekly.thi.none') : thiTrend < 0 ? t('home.weekly.thi.down') : thiTrend > 0 ? t('home.weekly.thi.up') : t('home.weekly.thi.flat');
  const trendTone = thiTrend == null ? colors.textSecondary : thiTrend < 0 ? colors.success : thiTrend > 0 ? colors.warning : colors.textSecondary;

  return (
    <Screen tab>
      <TabHeader title={greeting} subtitle={dateLabel} />

      {showUrgent ? (
        <Banner
          tone="danger"
          title={`${t('home.redflag.title')}`}
          body={selfHarm ? t('home.redflag.selfHarm') : t('home.redflag.body')}
          primary={selfHarm ? { title: t('home.redflag.call'), onPress: () => { void Linking.openURL('tel:112'); } } : { title: t('common.whatToDo'), onPress: () => router.push('/education/when-to-see-a-doctor') }}
          secondary={{ title: t('common.understood'), onPress: acknowledgeRedFlag }}
        />
      ) : null}
      {showInfo ? (
        <Banner tone="info" title={t('home.info.title')} body={t('home.info.body')} secondary={{ title: t('common.understood'), onPress: acknowledgeRedFlag }} />
      ) : null}

      {program && pos ? (
        <Card title={t('home.today')} overline={t('home.today.sub', { week: pos.week, day: pos.day })} right={
          <ProgressRing size={64} stroke={6} progress={completion.total ? completion.done / completion.total : 0} label={`${completion.done}/${completion.total}`} caption={t('home.today.a11y', { done: completion.done, total: completion.total })} />
        }>
          {completion.total > 0 && completion.done === completion.total ? <Text variant="bodySmall" tone="secondary">{t('home.today.allDone')}</Text> : null}
          <View>
            {todayTasks.map((task) => {
              const key = taskKey(pos.week, pos.day, task.id);
              return <TaskRow key={key} task={task} compact connector={false} done={!!program.completed[key]} onStart={() => openTask(task, key)} onToggleDone={() => toggleTask(key)} />;
            })}
          </View>
          <Button variant="ghost" size="sm" title={t('home.today.viewProgram')} onPress={() => router.push('/program')} />
        </Card>
      ) : !assessment || !hasThi ? (
        <Card title={t('home.cta.assess.title')}>
          <Text variant="body" tone="secondary">{t('home.cta.assess.body')}</Text>
          <Button title={t('home.cta.assess.action')} onPress={() => router.push('/(tabs)/assess')} />
        </Card>
      ) : (
        <Card title={t('home.cta.program.title')}>
          <Text variant="body" tone="secondary">{t('home.cta.program.body')}</Text>
          <Button title={t('home.cta.program.action')} onPress={() => router.push('/program/setup')} />
        </Card>
      )}

      <Card onPress={() => router.push('/sound/player?preset=enrichment')} accessibilityLabel={`${t('home.quickSound')}: ${t('home.quickSound.action')}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <View style={{ width: 56, height: 56, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <AudioWaveform size={26} color={colors.onPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h3">{t('home.quickSound')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('home.quickSound.body')}</Text>
          </View>
          <Text variant="bodyStrong" tone="primary">{t('home.quickSound.action')}</Text>
        </View>
      </Card>

      <Card title={t('home.mood.title')} overline={t('home.mood.sub')}>
        <MoodCheck value={todayEntry?.mood} onSelect={saveMood} />
        {showSliders || todayEntry ? (
          <View style={{ gap: space[2] }}>
            {showSliders ? <Text variant="caption" tone="secondary">{t('home.mood.saved')}</Text> : null}
            {([['loudness', loud, setLoud], ['annoyance', annoy, setAnnoy]] as const).map(([field, val, setVal]) => (
              <View key={field}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodySmall">{t(`diary.${field}`)}</Text>
                  <Text variant="bodyStrong">{val}</Text>
                </View>
                <Slider
                  minimumValue={0} maximumValue={10} step={1} value={val}
                  onValueChange={(v: number) => setVal(v)}
                  onSlidingComplete={(v: number) => saveSlider(field, v)}
                  minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary}
                  accessibilityLabel={t(`diary.${field}`)}
                  accessibilityValue={{ text: t('diary.a11y.value', { label: t(`diary.${field}`), v: val }) }}
                />
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card variant="tinted" title={t('home.weekly')}>
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
        <Text variant="bodySmall" tone="secondary">{program ? t('home.weekly.encourage') : t('home.weekly.noProgram')}</Text>
      </Card>

      <Card onPress={() => router.push(`/education/${eduSlug}`)} overline={t('home.edu')} title={t(`home.edu.${eduSlug}`)} right={<BookOpen size={22} color={colors.primary} />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <EvidenceChip level="guideline" onPress={() => cite.open('tunkel2014')} />
          <Text variant="bodyStrong" tone="primary">{t('home.edu.read')}</Text>
        </View>
      </Card>
      {cite.sheet}
    </Screen>
  );
}
