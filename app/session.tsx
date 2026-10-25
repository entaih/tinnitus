import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, ChevronDown, ChevronUp, MoreHorizontal, SkipForward } from 'lucide-react-native';
import { Banner, Button, Card, EvidenceChip, Screen, Text, useCitation } from '@/components';
import { BackgroundSoundRow, Segmented, SessionComplete, activeMinutes, activeTasks, backgroundTasks, coreTask, isBackground, openTask, planForToday, returnEventsFor, taskIcon, taskMeta, taskTitle, weekActiveDays } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { dayCompletion, programPosition, taskKey, tasksForDay } from '@/clinical/program';
import { bumpReentryNudge } from '@/notifications';
import type { ProgramTask } from '@/clinical/types';

type Mode = 'full' | 'short';

/**
 * Today's session: runs the day's numbered steps one after another. Each step opens its own screen; when the user
 * returns, the runner advances to the next unfinished step and shows a short "completed" banner.
 * Background sound is not a numbered step: it has its own row (Aç / Çalıyor) and can be counted as done after playing.
 * The list is capped to the active-minute budget and at most 3 numbered steps; overflow sits behind "Daha fazla".
 * "Kısa (2–3 dk)" (or ?short=1 from Home) reduces the day to the check-in plus one short step: on a module day the
 * core module opens as its 2-minute summary (task.params.summary = '1', carried by openTask).
 */
export default function SessionScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const { short: shortParam } = useLocalSearchParams<{ short?: string }>();
  const { program, completeTask } = useClinical();
  const track = useGrowth((s) => s.track);
  const cite = useCitation();
  const [mode, setMode] = useState<Mode>(shortParam === '1' ? 'short' : 'full');
  const [skipped, setSkipped] = useState<string[]>([]);
  const [playing, setPlaying] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [toastId, setToastId] = useState<string | null>(null);
  const seenDone = useRef<Set<string>>(new Set(Object.keys(program?.completed ?? {})));
  const tracked = useRef<Set<string>>(new Set());
  const [, setTick] = useState(0);
  const once = useCallback((key: string, event: Parameters<typeof track>[0]) => {
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    track(event);
  }, [track]);

  // On every return to this screen: re-render and detect steps completed elsewhere (task screens mark them via taskKey).
  useFocusEffect(useCallback(() => {
    setTick((x) => x + 1);
    const p = useClinical.getState().program;
    if (!p) return;
    const pos = programPosition(p);
    const prefix = `${pos.week}-${pos.day}-`;
    const fresh = Object.keys(p.completed).filter((k) => !seenDone.current.has(k));
    for (const k of fresh) seenDone.current.add(k);
    const freshToday = fresh.filter((k) => k.startsWith(prefix));
    const todayId = freshToday[0]?.slice(prefix.length);
    if (todayId) setToastId(todayId);
    // First completion(s) of programme day 2 made from a task screen → "day2Returned".
    if (freshToday.length && pos.dayIndex === 1 && dayCompletion(p, pos.week, pos.day).done === freshToday.length) once('day2', 'day2Returned');
  }, [once]));
  useEffect(() => {
    if (!toastId) return;
    const h = setTimeout(() => setToastId(null), 1800);
    return () => clearTimeout(h);
  }, [toastId]);

  const pos = program ? programPosition(program) : null;
  const plan = program && pos ? planForToday(program, pos, undefined, { short: mode === 'short' }) : null;
  const shown = plan?.shown ?? [];
  const numbered = activeTasks(shown);
  const background = backgroundTasks(shown);
  const more = plan?.more ?? [];
  const isDone = (x: ProgramTask) => !!plan?.isDone(x);
  const allDone = numbered.length > 0 && numbered.every(isDone);
  const dayIndex = pos?.dayIndex ?? -1;

  // Short mode chosen by the user (not forced by re-entry) counts once per visit.
  useEffect(() => { if (mode === 'short' && plan && !plan.reentry) once('short', 'shortSessionUsed'); }, [mode, plan, once]);
  // Completion moment: day-1 and generic session counters, once per visit, only on the transition.
  const wasAllDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !wasAllDone.current) {
      once('session', 'sessionCompleted');
      if (dayIndex === 0) once('day1', 'day1Completed');
    }
    wasAllDone.current = allDone;
  }, [allDone, dayIndex, once]);

  if (!program || !pos || !plan) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('session.title') }} />
        <Card title={t('session.noProgram')}><Button title={t('common.back')} onPress={() => router.back()} /></Card>
      </Screen>
    );
  }

  const keyOf = (id: string) => taskKey(pos.week, pos.day, id);
  const pending = numbered.filter((x) => !isDone(x) && !skipped.includes(x.id));
  const current = pending[0] ?? null;
  const core = coreTask(plan.tasks);
  const currentIsCore = !!current && !!core && current.id === core.id;
  const done = numbered.filter(isDone).length;
  const total = numbered.length;
  const doneMinutes = activeMinutes(numbered.filter(isDone));
  const weekDays = weekActiveDays(program, pos);
  const toastTask = toastId ? tasksForDay(program, pos.week, pos.day).find((x) => x.id === toastId) : undefined;

  const markDone = (task: ProgramTask) => {
    const k = keyOf(task.id);
    for (const e of returnEventsFor(program, pos)) once(e, e);
    if (plan.reentry) once('reentry', 'reentryUsed');
    seenDone.current.add(k);
    completeTask(k);
    void bumpReentryNudge();
    setPlaying((p) => p.filter((id) => id !== task.id));
    setShowOptions(false);
    setToastId(task.id);
  };
  const start = (task: ProgramTask) => {
    if (isBackground(task)) setPlaying((p) => (p.includes(task.id) ? p : [...p, task.id]));
    setShowOptions(false);
    openTask(task, keyOf(task.id));
  };

  const footer = current ? (
    <View style={{ gap: space[2] }}>
      <Button title={t('session.startTask')} icon={<ArrowRight size={18} color={colors.onPrimary} />} onPress={() => start(current)} />
      <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}>
        <Button size="sm" variant="ghost" title={t('session.skip')} icon={<SkipForward size={16} color={colors.primary} />} style={{ flex: 1 }} onPress={() => setSkipped((s) => [...s, current.id])} />
        {showOptions ? (
          <Button size="sm" variant="ghost" title={t('session.markDone')} icon={<Check size={16} color={colors.primary} />} style={{ flex: 1 }} onPress={() => markDone(current)} />
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={t('session.more')} accessibilityState={{ expanded: showOptions }} onPress={() => setShowOptions(true)} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
            <MoreHorizontal size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  ) : (
    <View style={{ gap: space[2] }}>
      <Button title={t('session.finish')} onPress={() => router.replace('/(tabs)')} />
      {allDone ? <Button size="sm" variant="ghost" title={t('session.complete.tomorrow')} onPress={() => router.push('/program')} /> : null}
    </View>
  );

  const row = (task: ProgramTask, i: number | null, extra?: React.ReactNode) => {
    const d = isDone(task);
    const isCur = current?.id === task.id;
    return (
      <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 48 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: d ? colors.success : isCur ? colors.primary : colors.skeleton, alignItems: 'center', justifyContent: 'center' }}>
          {d ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : i != null ? <Text variant="caption" style={{ color: isCur ? colors.onPrimary : colors.textMuted }}>{i + 1}</Text> : taskIcon(task.type, colors.textMuted, 14)}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant={isCur ? 'bodyStrong' : 'bodySmall'} tone={d ? 'secondary' : 'default'} numberOfLines={2}>{taskTitle(t, task)}</Text>
          <Text variant="caption" tone="muted">{taskMeta(t, task)}</Text>
        </View>
        {extra}
      </View>
    );
  };

  return (
    <Screen footer={footer}>
      <Stack.Screen options={{ title: t('session.title') }} />
      <View style={{ gap: space[1] }}>
        <Text variant="overline" tone="secondary">{t('home.today.sub', { week: pos.week, day: pos.day })}</Text>
        <Text variant="h1">{allDone ? t('session.allDone.title') : t('session.progress', { done, total })}</Text>
        <View style={{ height: 6, backgroundColor: colors.primaryTrack, borderRadius: 3, overflow: 'hidden', marginTop: space[2] }}>
          <View style={{ width: `${total ? Math.round((done / total) * 100) : 0}%`, height: 6, backgroundColor: colors.primary }} />
        </View>
      </View>

      {!plan.reentry && !allDone ? (
        <View style={{ gap: space[2] }}>
          <Segmented<Mode>
            accessibilityLabel={t('session.mode.a11y')}
            value={mode}
            onChange={(m) => { setMode(m); setSkipped([]); setShowMore(false); }}
            options={[{ value: 'full', label: t('session.mode.full') }, { value: 'short', label: t('session.mode.short') }]}
          />
          {mode === 'short' ? <Text variant="caption" tone="secondary" center>{t('session.short.hint')}</Text> : null}
        </View>
      ) : null}
      {plan.reentry && !allDone ? <Banner tone="info" title={t('home.reentry.title')} body={t('session.short.hint')} /> : null}

      {toastTask ? <Banner tone="success" title={t('session.taskDone', { title: taskTitle(t, toastTask), n: toastTask.minutes })} /> : null}

      {current ? (
        <Card variant="tinted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>{taskIcon(current.type, colors.primary, 24)}</View>
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone={currentIsCore ? 'primary' : 'secondary'}>{currentIsCore ? t('session.core.label') : t('session.next')}</Text>
              <Text variant="h2">{taskTitle(t, current)}</Text>
            </View>
          </View>
          <Text variant="body" tone="secondary">{t(`session.why.${current.type}`)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
            <Text variant="caption" tone="muted">{taskMeta(t, current)}</Text>
            {current.evidence && current.citation ? <EvidenceChip level={current.evidence} onPress={() => cite.open(current.citation!)} /> : null}
          </View>
        </Card>
      ) : allDone ? (
        <SessionComplete program={program} pos={pos} steps={done} minutes={doneMinutes} withSound={background.length > 0} weekDay={weekDays} onCite={cite.open} />
      ) : (
        <Card><Text variant="body" tone="secondary">{t('session.remaining.body')}</Text></Card>
      )}

      <Card title={t('session.list')}>
        {numbered.map((task, i) => {
          const d = isDone(task);
          const wasSkipped = skipped.includes(task.id) && !d;
          const extra = wasSkipped && !current ? <Button size="sm" variant="ghost" title={t('task.start')} onPress={() => start(task)} /> : undefined;
          return row(task, i, extra);
        })}
        {more.length ? (
          <View>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMore }} onPress={() => setShowMore((v) => !v)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="bodySmall" tone="primary">{showMore ? t('prog.less') : t('prog.more', { n: more.length })}</Text>
              {showMore ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
            </Pressable>
            {showMore ? (
              <View style={{ gap: space[1] }}>
                <Text variant="caption" tone="secondary">{t('task.optionalExtra')}</Text>
                {more.map((task) => row(task, null, isDone(task) ? undefined : <Button size="sm" variant="ghost" title={t('task.start')} onPress={() => start(task)} />))}
              </View>
            ) : null}
          </View>
        ) : null}
      </Card>

      {background.length ? (
        <Card>
          {background.map((task) => (
            <BackgroundSoundRow
              key={task.id}
              task={task}
              state={isDone(task) ? 'done' : playing.includes(task.id) ? 'playing' : 'idle'}
              onOpen={() => start(task)}
              onMarkDone={() => markDone(task)}
            />
          ))}
        </Card>
      ) : null}
      {cite.sheet}
    </Screen>
  );
}
