import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { ArrowRight, Check, CheckCircle2, SkipForward } from 'lucide-react-native';
import { Button, Card, EvidenceChip, Screen, Text, useCitation } from '@/components';
import { openTask, taskIcon } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { dayCompletion, programPosition, taskKey, tasksForDay } from '@/clinical/program';

/**
 * Today's session: runs the day's tasks one after another. Each task opens its own screen; when the user
 * returns, the runner advances to the next unfinished task. Sound tasks are marked done when started
 * (they play in the background). Skipped tasks stay available later in the day.
 */
export default function SessionScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const { program, completeTask } = useClinical();
  const cite = useCitation();
  const [skipped, setSkipped] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((x) => x + 1); }, []));

  if (!program) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('session.title') }} />
        <Card title={t('session.noProgram')}><Button title={t('common.back')} onPress={() => router.back()} /></Card>
      </Screen>
    );
  }
  const pos = programPosition(program);
  const tasks = tasksForDay(program, pos.week, pos.day);
  const keyOf = (id: string) => taskKey(pos.week, pos.day, id);
  const isDone = (id: string) => !!program.completed[keyOf(id)];
  const pending = tasks.filter((x) => !isDone(x.id) && !skipped.includes(x.id));
  const current = pending[0] ?? tasks.find((x) => !isDone(x.id)) ?? null;
  const { done, total } = dayCompletion(program, pos.week, pos.day);
  void tick;

  const start = () => {
    if (!current) return;
    const k = keyOf(current.id);
    if (current.type === 'sound') completeTask(k);
    openTask(current, k);
  };

  return (
    <Screen footer={current ? (
      <View style={{ gap: space[2] }}>
        <Button title={t('session.startTask')} icon={<ArrowRight size={18} color={colors.onPrimary} />} onPress={start} />
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Button size="sm" variant="ghost" title={t('session.markDone')} icon={<Check size={16} color={colors.primary} />} style={{ flex: 1 }} onPress={() => completeTask(keyOf(current.id))} />
          <Button size="sm" variant="ghost" title={t('session.skip')} icon={<SkipForward size={16} color={colors.primary} />} style={{ flex: 1 }} onPress={() => setSkipped((s) => [...s, current.id])} />
        </View>
      </View>
    ) : <Button title={t('session.finish')} onPress={() => router.replace('/(tabs)')} />}>
      <Stack.Screen options={{ title: t('session.title') }} />
      <View style={{ gap: space[1] }}>
        <Text variant="overline" tone="secondary">{t('home.today.sub', { week: pos.week, day: pos.day })}</Text>
        <Text variant="h1">{current ? t('session.progress', { done, total }) : t('session.allDone.title')}</Text>
        <View style={{ height: 6, backgroundColor: colors.primaryTrack, borderRadius: 3, overflow: 'hidden', marginTop: space[2] }}>
          <View style={{ width: `${total ? Math.round((done / total) * 100) : 0}%`, height: 6, backgroundColor: colors.primary }} />
        </View>
      </View>

      {current ? (
        <Card variant="tinted">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>{taskIcon(current.type, colors.primary, 24)}</View>
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone="secondary">{t('session.next')}</Text>
              <Text variant="h2">{t(current.titleKey)}</Text>
            </View>
          </View>
          <Text variant="body" tone="secondary">{t(`session.why.${current.type}`)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
            <Text variant="caption" tone="muted">{t('common.minutes', { n: current.minutes })}</Text>
            {current.evidence && current.citation ? <EvidenceChip level={current.evidence} onPress={() => cite.open(current.citation!)} /> : null}
          </View>
        </Card>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[2] }}>
            <CheckCircle2 size={24} color={colors.success} style={{ marginTop: 2 }} />
            <Text variant="h3" style={{ flex: 1 }}>{t('session.allDone.body')}</Text>
          </View>
        </Card>
      )}

      <Card title={t('session.list')}>
        {tasks.map((task, i) => {
          const d = isDone(task.id);
          const isCur = current?.id === task.id;
          return (
            <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 44 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: d ? colors.success : isCur ? colors.primary : colors.skeleton, alignItems: 'center', justifyContent: 'center' }}>
                {d ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : <Text variant="caption" style={{ color: isCur ? colors.onPrimary : colors.textMuted }}>{i + 1}</Text>}
              </View>
              <Text variant={isCur ? 'bodyStrong' : 'bodySmall'} tone={d ? 'secondary' : 'default'} style={[{ flex: 1 }, d ? { textDecorationLine: 'line-through' } : {}]} numberOfLines={2}>{t(task.titleKey)}</Text>
              <Text variant="caption" tone="muted">{t('common.minutes', { n: task.minutes })}</Text>
            </View>
          );
        })}
      </Card>
      {cite.sheet}
    </Screen>
  );
}
