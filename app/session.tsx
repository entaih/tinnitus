import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ArrowRight, Check, ChevronDown, ChevronUp, MoreHorizontal, SkipForward } from 'lucide-react-native';
import { Banner, Button, Card, EvidenceChip, Screen, Text, useCitation } from '@/components';
import { activeMinutes, activeDaysOf, hasBackgroundSound, isBackground, openTask, planForToday, taskIcon, taskMeta, taskTitle } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { programPosition, taskKey, tasksForDay } from '@/clinical/program';
import type { ProgramTask } from '@/clinical/types';

/**
 * Today's session: runs the day's tasks one after another. Each task opens its own screen; when the user
 * returns, the runner advances to the next unfinished task and shows a short "completed" banner.
 * Sound tasks are not auto-completed: they are marked "Çalıyor" and can be counted as done after the player returns.
 * The list is capped to the active-minute budget; overflow tasks sit behind "Daha fazla".
 */
export default function SessionScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const { program, completeTask } = useClinical();
  const cite = useCitation();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [playing, setPlaying] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [toastId, setToastId] = useState<string | null>(null);
  const seenDone = useRef<Set<string>>(new Set(Object.keys(program?.completed ?? {})));
  const [, setTick] = useState(0);

  // On every return to this screen: re-render and detect tasks completed elsewhere (task screens mark them via taskKey).
  useFocusEffect(useCallback(() => {
    setTick((x) => x + 1);
    const p = useClinical.getState().program;
    if (!p) return;
    const pos = programPosition(p);
    const prefix = `${pos.week}-${pos.day}-`;
    const fresh = Object.keys(p.completed).filter((k) => !seenDone.current.has(k));
    for (const k of fresh) seenDone.current.add(k);
    const todayId = fresh.find((k) => k.startsWith(prefix))?.slice(prefix.length);
    if (todayId) setToastId(todayId);
  }, []));
  useEffect(() => {
    if (!toastId) return;
    const h = setTimeout(() => setToastId(null), 1800);
    return () => clearTimeout(h);
  }, [toastId]);

  const pos = program ? programPosition(program) : null;
  const plan = program && pos ? planForToday(program, pos) : null;
  const shown = plan?.shown ?? [];
  const more = plan?.more ?? [];
  const isDone = (x: ProgramTask) => !!plan?.isDone(x);
  const allDone = shown.length > 0 && shown.every(isDone);

  // Completion moment: the check scales in once (skipped under reduced motion).
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);
  useEffect(() => { scale.value = allDone && !reduceMotion ? withSpring(1, { damping: 12, stiffness: 160 }) : 1; }, [allDone, reduceMotion, scale]);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!program || !pos || !plan) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('session.title') }} />
        <Card title={t('session.noProgram')}><Button title={t('common.back')} onPress={() => router.back()} /></Card>
      </Screen>
    );
  }

  const keyOf = (id: string) => taskKey(pos.week, pos.day, id);
  const pending = shown.filter((x) => !isDone(x) && !skipped.includes(x.id) && !playing.includes(x.id));
  const current = pending[0] ?? null;
  const done = shown.filter(isDone).length;
  const total = shown.length;
  const doneMinutes = activeMinutes(shown.filter(isDone));
  const weekDays = activeDaysOf(program, pos.dayIndex, pos.day).done;
  const playingTasks = shown.filter((x) => playing.includes(x.id) && !isDone(x));
  const toastTask = toastId ? tasksForDay(program, pos.week, pos.day).find((x) => x.id === toastId) : undefined;

  const markDone = (task: ProgramTask) => {
    const k = keyOf(task.id);
    seenDone.current.add(k);
    completeTask(k);
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
    const isPlaying = playing.includes(task.id) && !d;
    return (
      <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 48 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: d ? colors.success : isCur ? colors.primary : colors.skeleton, alignItems: 'center', justifyContent: 'center' }}>
          {d ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : i != null ? <Text variant="caption" style={{ color: isCur ? colors.onPrimary : colors.textMuted }}>{i + 1}</Text> : taskIcon(task.type, colors.textMuted, 14)}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant={isCur ? 'bodyStrong' : 'bodySmall'} tone={d ? 'secondary' : 'default'} numberOfLines={2}>{taskTitle(t, task)}</Text>
          <Text variant="caption" tone={isPlaying ? 'success' : 'muted'}>{isPlaying ? t('task.playing') : taskMeta(t, task)}</Text>
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

      {toastTask ? <Banner tone="success" title={t('session.taskDone', { title: taskTitle(t, toastTask), n: toastTask.minutes })} /> : null}

      {playingTasks.map((task) => (
        <Card key={task.id} variant="tinted" title={t('session.playing.title')}>
          <Text variant="bodySmall" tone="secondary">{t('session.playing.body', { title: taskTitle(t, task) })}</Text>
          <Button size="sm" variant="secondary" title={t('session.playing.markDone')} icon={<Check size={16} color={colors.primaryPressed} />} onPress={() => markDone(task)} />
        </Card>
      ))}

      {current ? (
        <Card variant="tinted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>{taskIcon(current.type, colors.primary, 24)}</View>
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone="secondary">{t('session.next')}</Text>
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
        <Card style={{ alignItems: 'center', gap: space[3], paddingVertical: space[6] }}>
          <Animated.View style={checkStyle}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={44} color={colors.success} strokeWidth={3} />
            </View>
          </Animated.View>
          <Text variant="h2" center accessibilityRole="header">{t('session.complete.title')}</Text>
          <Text variant="body" tone="secondary" center>{t('session.complete.line')}</Text>
          <Text variant="bodyStrong" center>{t('session.complete.summary', { n: done, min: doneMinutes })}{hasBackgroundSound(shown) ? ` ${t('prog.plusSound')}` : ''} · {t('session.complete.weekDay', { k: weekDays })}</Text>
        </Card>
      ) : (
        <Card><Text variant="body" tone="secondary">{t('session.remaining.body')}</Text></Card>
      )}

      <Card title={t('session.list')}>
        {shown.map((task, i) => {
          const d = isDone(task);
          const isPlaying = playing.includes(task.id) && !d;
          const wasSkipped = skipped.includes(task.id) && !d && !isPlaying;
          const extra = isPlaying
            ? <Button size="sm" variant="ghost" title={t('session.playing.markDone')} onPress={() => markDone(task)} />
            : wasSkipped && !current ? <Button size="sm" variant="ghost" title={t('task.start')} onPress={() => start(task)} /> : undefined;
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
      {cite.sheet}
    </Screen>
  );
}
