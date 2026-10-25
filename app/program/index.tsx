import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { Banner, Button, Card, Chip, Screen, Text, useCitation } from '@/components';
import { RationaleList, TaskRow, WeekTimeline, activeMinutes, hasBackgroundSound, openTask, splitByBudget, type DayState, type TimelineDay } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { adaptationAdvice, adherence, assessmentPrefs, dayCompletion, isProgramFinished, maintenanceWeekOf, programPosition, refresherActive, regenerateProgram, taskKey, tasksForDay, type Dose, type ProgramPrefs } from '@/clinical/program';
import { useProfile } from '@/hooks/useProfile';
import { consequencesOf, consequenceText } from '@/clinical/consequences';
import { QUESTIONNAIRES, scoreQuestionnaire } from '@/clinical/questionnaires';
import { mergedLatest } from '@/store/clinical';
import type { QuestionnaireResult } from '@/clinical/types';

export default function ProgramScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const cite = useCitation();
  const { program, assessments, completeTask, setProgram, programPrefs, enterMaintenance, ensureMaintenance, startRefresher, restartProgram } = useClinical();
  const { assessment, profile } = useProfile();
  const now = new Date();
  const pos = program ? programPosition(program, now) : null;
  // Maintenance blocks are appended as the user reaches the last generated week (A1).
  useEffect(() => { ensureMaintenance(); }, [ensureMaintenance]);

  const [week, setWeek] = useState(pos?.week ?? 1);
  const [day, setDay] = useState(pos?.day ?? 1);
  const [showWhy, setShowWhy] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [doseNote, setDoseNote] = useState<Dose | null>(null);

  const thi = useMemo(() => {
    const all: QuestionnaireResult[] = [];
    for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'THI') all.push(q);
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments]);
  /** Change line for the latest THI against the one before it ("8 puan düşüş — anlamlı iyileşme"). */
  const thiChange = useMemo(() => {
    if (thi.length < 2) return null;
    const last = thi[thi.length - 1];
    const scored = scoreQuestionnaire(QUESTIONNAIRES.THI, last.answers);
    return consequencesOf('THI', { total: scored.total, subscales: scored.subscales, answers: last.answers }, mergedLatest(assessments), thi[thi.length - 2]).find((c) => c.key.startsWith('consequence.thi.change')) ?? null;
  }, [thi, assessments]);
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
  const isDone = (id: string) => !!program.completed[taskKey(week, day, id)];
  const { shown, more } = splitByBudget(tasks);
  const pending = shown.filter((x) => !isDone(x.id));
  const morePending = more.filter((x) => !isDone(x.id));
  const done = tasks.filter((x) => isDone(x.id));
  const dayIdx = (week - 1) * 7 + (day - 1);
  const isFuture = dayIdx > pos.dayIndex;
  const minutesLabel = `${t('prog.minutesActive', { n: activeMinutes(shown) })}${hasBackgroundSound(tasks) ? ` ${t('prog.plusSound')}` : ''}`;

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

  /** Dose change (PM sprint 2 A3): rebuild from this week on, keeping id, start date and everything completed. */
  const changeDose = (dose: Dose) => {
    if (!profile) return;
    const prefs: ProgramPrefs = { minutesPerDay: 15, style: 'cbt', ...programPrefs, ...assessmentPrefs(assessment) };
    setProgram(regenerateProgram(program, profile, prefs, { dose, now }));
    setDoseNote(dose);
  };

  const maintenance = program.phase === 'maintenance';
  const finished = isProgramFinished(program, now);
  const refresher = refresherActive(program, now);
  // Low adherence is advised from week 3 (adaptationAdvice); the THI-based lines need week 4. In maintenance the latest
  // two THI totals decide (a rise of ≥ 13 opens the refresher block).
  const advice = pos.week >= 3 || maintenance ? adaptationAdvice(program, {
    week: pos.week,
    thiBaseline: maintenance && thi.length > 1 ? thi[thi.length - 2].total : thi[0]?.total,
    thiNow: thi.length > 1 ? thi[thi.length - 1].total : undefined,
    adherence14: adherence(program, now, 14),
    phq9: phq?.total,
    phqItem9: phq?.answers[8],
    phase: program.phase,
  }) : [];

  const goToday = () => { setWeek(pos.week); setDay(pos.day); };

  /** Full regeneration (completed map cleared) after a confirmation. */
  const confirmRestart = () => {
    Alert.alert(t('prog.restart.confirm.title'), t('prog.restart.confirm.body'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('prog.restart.confirm.ok'), style: 'destructive', onPress: () => { restartProgram(); setWeek(1); setDay(1); } },
    ]);
  };

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

        {finished ? (
          <Card variant="tinted" title={t('prog.finished.title')}>
            <Text variant="body" tone="secondary">{t('prog.finished.body', { n: program.weeks.length })}</Text>
            <Button title={t('prog.finished.enter')} onPress={enterMaintenance} />
          </Card>
        ) : null}
        {maintenance ? (
          <Card variant="tinted">
            <Text variant="h3">{t('prog.maintenance.title', { n: maintenanceWeekOf(program, pos.week) })}</Text>
            <Text variant="bodySmall" tone="secondary">{t('prog.maintenance.body')}</Text>
          </Card>
        ) : null}
        {refresher && program.refresherUntil ? (
          <Banner tone="info" title={t('prog.refresher.title')} body={t('prog.refresher.body', { until: formatDate(program.refresherUntil, locale) })} />
        ) : null}

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] }}>
            <Text variant="h3" style={{ flex: 1 }}>{maintenance && maintenanceWeekOf(program, week) > 0 ? `${t(w.themeKey)} · ${t('prog.maintenance.week', { n: maintenanceWeekOf(program, week) })}` : t(w.themeKey)}</Text>
            {week !== pos.week || day !== pos.day ? <Button size="sm" variant="ghost" title={t('prog.today')} onPress={goToday} /> : null}
          </View>
          <WeekTimeline days={days} selected={day} onSelect={setDay} />
          <Pressable accessibilityRole="button" onPress={() => setShowWhy(true)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text variant="bodySmall" tone="primary">{t('prog.why')}</Text>
          </Pressable>
        </Card>

        {program.dose === 'light' || doseNote ? (
          <Card variant="tinted">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
              {program.dose === 'light' ? <Chip small tone="info" label={t('prog.dose.light')} /> : null}
              {doseNote ? <Text variant="bodySmall" tone="success" style={{ flex: 1 }}>{t(doseNote === 'light' ? 'prog.adapt.lightened' : 'prog.adapt.restored')}</Text> : null}
            </View>
            {program.dose === 'light' ? <Button size="sm" variant="secondary" title={t('prog.adapt.restore')} onPress={() => changeDose('full')} /> : null}
          </Card>
        ) : null}

        {missedRecently ? (
          <Card variant="tinted" title={t('prog.missed.title')}>
            <Text variant="body" tone="secondary">{t('prog.missed.body')}</Text>
            <Button size="sm" variant="secondary" title={t('prog.missed.action')} onPress={goToday} />
          </Card>
        ) : null}

        <Card title={t('prog.dayTasks')} overline={`${t('prog.day', { n: day })} · ${minutesLabel}`}>
          {isFuture ? <Text variant="bodySmall" tone="secondary">{t('prog.futureDay')}</Text> : null}
          <View>
            {pending.map((task) => {
              const key = taskKey(week, day, task.id);
              return <TaskRow key={key} task={task} done={false} onStart={isFuture ? undefined : () => openTask(task, key)} onToggleDone={isFuture ? undefined : () => toggle(key)} />;
            })}
          </View>
          {pending.length === 0 && morePending.length === 0 && tasks.length > 0 ? <Text variant="bodySmall" tone="secondary">{t('home.today.allDone')}</Text> : null}
          {morePending.length ? (
            <View>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMore }} onPress={() => setShowMore((v) => !v)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="bodySmall" tone="primary">{showMore ? t('prog.less') : t('prog.more', { n: morePending.length })}</Text>
                {showMore ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
              </Pressable>
              {showMore ? (
                <View>
                  <Text variant="caption" tone="secondary">{t('task.optionalExtra')}</Text>
                  {morePending.map((task) => {
                    const key = taskKey(week, day, task.id);
                    return <TaskRow key={key} task={task} done={false} onStart={isFuture ? undefined : () => openTask(task, key)} onToggleDone={isFuture ? undefined : () => toggle(key)} />;
                  })}
                </View>
              ) : null}
            </View>
          ) : null}
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

        {pos.week >= 4 || advice.length ? (
          <Card title={t('prog.adapt.title')}>
            <Text variant="bodySmall" tone="secondary">{t('prog.adapt.body')}</Text>
            {thi.length < 2 && pos.week >= 4 ? <Text variant="bodySmall" tone="secondary">{t('prog.adapt.needThi')}</Text> : null}
            {thiChange ? (
              <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 8, backgroundColor: thiChange.tone === 'success' ? colors.success : thiChange.tone === 'warning' ? colors.warning : colors.primary }} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>{consequenceText(t, thiChange)}</Text>
              </View>
            ) : null}
            {advice.map((k) => (
              <View key={k} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 8, backgroundColor: k === 'adapt.safety' ? colors.danger : k === 'adapt.onTrack' || k === 'adapt.responder' || k === 'adapt.improving' || k === 'adapt.maintenanceImproving' || k === 'adapt.maintenanceSteady' ? colors.success : colors.warning }} />
                <Text variant="body" style={{ flex: 1 }}>{t(k)}</Text>
              </View>
            ))}
            {advice.includes('adapt.lowAdherence') && program.dose !== 'light' ? <Button size="sm" variant="secondary" title={t('prog.adapt.lighten')} onPress={() => changeDose('light')} /> : null}
            {advice.includes('adapt.refresher') && !refresher ? <Button size="sm" variant="secondary" title={t('prog.adapt.startRefresher')} onPress={startRefresher} /> : null}
          </Card>
        ) : null}

        <Button variant="ghost" title={t('prog.regenerate')} onPress={() => router.push('/program/setup')} />
        <Button variant="ghost" title={t('prog.restart')} onPress={confirmRestart} />
      </Screen>

      <Modal visible={showWhy} transparent animationType="slide" onRequestClose={() => setShowWhy(false)}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setShowWhy(false)} accessibilityLabel={t('common.close')} />
        <View style={{ backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[5], gap: space[3], maxHeight: '75%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3">{t('prog.why.title')}</Text>
            <Pressable onPress={() => setShowWhy(false)} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={12} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><X size={22} color={colors.textSecondary} /></Pressable>
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
