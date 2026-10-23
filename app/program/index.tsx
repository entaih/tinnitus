import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { Button, Card, Chip, Screen, Text, useCitation } from '@/components';
import { RationaleList, TaskRow, WeekTimeline, openTask, type DayState, type TimelineDay } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { adaptationAdvice, adherence, dayCompletion, programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { QuestionnaireResult } from '@/clinical/types';

export default function ProgramScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const cite = useCitation();
  const { program, assessments, completeTask, setProgram } = useClinical();
  const now = new Date();
  const pos = program ? programPosition(program, now) : null;

  const [week, setWeek] = useState(pos?.week ?? 1);
  const [day, setDay] = useState(pos?.day ?? 1);
  const [showWhy, setShowWhy] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const thi = useMemo(() => {
    const all: QuestionnaireResult[] = [];
    for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'THI') all.push(q);
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments]);
  const phq = useMemo(() => {
    let last: QuestionnaireResult | null = null;
    for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'PHQ9' && (!last || q.date > last.date)) last = q;
    return last;
  }, [assessments]);

  if (!program || !pos) {
    return (
      <>
        <Stack.Screen options={{ title: t('prog.title') }} />
        <Screen>
          <Card title={t('prog.empty.title')}>
            <Text variant="body" tone="secondary">{t('prog.empty.body')}</Text>
            <Button title={t('home.cta.program.action')} onPress={() => router.push('/program/setup')} />
          </Card>
        </Screen>
      </>
    );
  }

  const start = new Date(program.startDate + 'T00:00:00');
  const w = program.weeks[week - 1];
  const days: TimelineDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = i + 1;
    const idx = (week - 1) * 7 + i;
    const date = new Date(start.getTime() + idx * 86_400_000);
    const c = dayCompletion(program, week, d);
    let state: DayState = 'future';
    if (idx <= pos.dayIndex) state = c.total > 0 && c.done === c.total ? 'done' : c.done > 0 ? 'partial' : idx < pos.dayIndex ? 'missed' : 'future';
    return { day: d, label: formatDate(date.toISOString(), locale, { weekday: 'short' }), dateLabel: String(date.getDate()), state, isToday: idx === pos.dayIndex };
  });

  const tasks = tasksForDay(program, week, day);
  const pending = tasks.filter((x) => !program.completed[taskKey(week, day, x.id)]);
  const done = tasks.filter((x) => !!program.completed[taskKey(week, day, x.id)]);
  const totalMin = tasks.reduce((s, x) => s + x.minutes, 0);
  const dayIdx = (week - 1) * 7 + (day - 1);
  const isFuture = dayIdx > pos.dayIndex;

  const toggle = (key: string) => {
    if (program.completed[key]) { const completed = { ...program.completed }; delete completed[key]; setProgram({ ...program, completed }); }
    else completeTask(key);
  };

  // Gentle "missed days" card: the previous 1–3 days had nothing done.
  const missedRecently = [1, 2, 3].some((k) => {
    const idx = pos.dayIndex - k;
    if (idx < 0) return false;
    const c = dayCompletion(program, Math.floor(idx / 7) + 1, (idx % 7) + 1);
    return c.total > 0 && c.done === 0;
  }) && dayCompletion(program, pos.week, pos.day).done === 0;

  const advice = pos.week >= 4 ? adaptationAdvice(program, {
    week: pos.week,
    thiBaseline: thi[0]?.total,
    thiNow: thi.length > 1 ? thi[thi.length - 1].total : undefined,
    adherence14: adherence(program, now, 14),
    phq9: phq?.total,
    phqItem9: phq?.answers[8],
  }) : [];

  const goToday = () => { setWeek(pos.week); setDay(pos.day); };

  return (
    <>
      <Stack.Screen options={{ title: t('prog.title') }} />
      <Screen>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2] }} accessibilityRole="tablist">
          {program.weeks.map((pw) => (
            <Pressable key={pw.week} accessibilityRole="tab" accessibilityState={{ selected: pw.week === week }} onPress={() => { setWeek(pw.week); setDay(pw.week === pos.week ? pos.day : 1); }}
              style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, justifyContent: 'center', backgroundColor: pw.week === week ? colors.primary : colors.card, borderWidth: 1, borderColor: pw.week === week ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 })}>
              <Text variant="caption" style={{ color: pw.week === week ? colors.onPrimary : colors.text, fontWeight: '600' }}>{t('prog.week', { n: pw.week })}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] }}>
            <Text variant="h3" style={{ flex: 1 }}>{t(w.themeKey)}</Text>
            {week !== pos.week || day !== pos.day ? <Button size="sm" variant="ghost" title={t('prog.today')} onPress={goToday} /> : null}
          </View>
          <WeekTimeline days={days} selected={day} onSelect={setDay} />
          <Pressable accessibilityRole="button" onPress={() => setShowWhy(true)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text variant="bodySmall" tone="primary">{t('prog.why')}</Text>
          </Pressable>
        </Card>

        {missedRecently ? (
          <Card variant="tinted" title={t('prog.missed.title')}>
            <Text variant="body" tone="secondary">{t('prog.missed.body')}</Text>
            <Button size="sm" variant="secondary" title={t('prog.missed.action')} onPress={goToday} />
          </Card>
        ) : null}

        <Card title={t('prog.dayTasks')} overline={`${t('prog.day', { n: day })} · ${t('prog.minutesTotal', { n: totalMin })}`}>
          {isFuture ? <Text variant="bodySmall" tone="secondary">{t('prog.futureDay')}</Text> : null}
          <View>
            {pending.map((task) => {
              const key = taskKey(week, day, task.id);
              return <TaskRow key={key} task={task} done={false} onStart={isFuture ? undefined : () => openTask(task, key)} onToggleDone={isFuture ? undefined : () => toggle(key)} />;
            })}
          </View>
          {pending.length === 0 && tasks.length > 0 ? <Text variant="bodySmall" tone="secondary">{t('home.today.allDone')}</Text> : null}
          {done.length ? (
            <View>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: showDone }} onPress={() => setShowDone((v) => !v)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" tone="secondary">{t('prog.completed', { n: done.length })}</Text>
                {showDone ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
              </Pressable>
              {showDone ? done.map((task) => {
                const key = taskKey(week, day, task.id);
                return <TaskRow key={key} task={task} done onToggleDone={() => toggle(key)} />;
              }) : null}
            </View>
          ) : null}
        </Card>

        {pos.week >= 4 ? (
          <Card title={t('prog.adapt.title')}>
            <Text variant="bodySmall" tone="secondary">{t('prog.adapt.body')}</Text>
            {thi.length < 2 ? <Text variant="bodySmall" tone="secondary">{t('prog.adapt.needThi')}</Text> : null}
            {advice.map((k) => (
              <View key={k} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                <Chip small label={k === 'adapt.safety' ? '!' : '•'} tone={k === 'adapt.safety' ? 'danger' : k === 'adapt.onTrack' || k === 'adapt.responder' || k === 'adapt.improving' ? 'success' : 'warning'} />
                <Text variant="body" style={{ flex: 1 }}>{t(k)}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Button variant="ghost" title={t('prog.regenerate')} onPress={() => router.push('/program/setup')} />
      </Screen>

      <Modal visible={showWhy} transparent animationType="slide" onRequestClose={() => setShowWhy(false)}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setShowWhy(false)} accessibilityLabel={t('common.close')} />
        <View style={{ backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[5], gap: space[3], maxHeight: '75%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3">{t('prog.why.title')}</Text>
            <Pressable onPress={() => setShowWhy(false)} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={12}><X size={22} color={colors.textSecondary} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: space[3], paddingBottom: space[6] }}>
            <Text variant="bodyStrong">{t(w.themeKey)}</Text>
            <RationaleList keys={w.rationaleKeys} onCite={(id) => { setShowWhy(false); cite.open(id); }} />
          </ScrollView>
        </View>
      </Modal>
      {cite.sheet}
    </>
  );
}
