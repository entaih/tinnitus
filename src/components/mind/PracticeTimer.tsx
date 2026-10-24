import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { PlayControl } from '@/components/PlayControl';
import { useStepTimer, type TimedStep } from '@/components/sound/useStepTimer';
import { useLocale, useT } from '@/i18n';
import type { PracticeStep } from '@/content/modules';

const DEFAULT_STEP_SECONDS = 60;

/** Step-list player for relaxation / mindfulness scripts: play, pause, skip, restart, haptics on step change. */
export function PracticeTimer({ steps, onFinish }: { steps: PracticeStep[]; onFinish?: (elapsedSec: number) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const timed = React.useMemo<TimedStep<PracticeStep>[]>(() => steps.map((s) => ({ data: s, seconds: s.seconds ?? DEFAULT_STEP_SECONDS })), [steps]);
  const timer = useStepTimer(timed, {
    onStep: (_s, i) => { if (i > 0) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
    onFinish: (elapsed) => { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onFinish?.(elapsed); },
  });
  const active = timer.status === 'running' || timer.status === 'paused';
  useKeepAwake();
  useEffect(() => () => { /* timer cleans itself up */ }, []);

  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const current = timer.step?.data;
  const label = timer.status === 'idle' ? t('module.timer.ready') : timer.status === 'done' ? t('module.timer.done') : timer.status === 'paused' ? t('exercise.paused') : t('module.timer.step', { i: timer.index + 1, n: steps.length });

  return (
    <View style={{ gap: space[4] }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack, overflow: 'hidden' }} accessible accessibilityLabel={`${Math.round(timer.progress * 100)}%`}>
        <View style={{ width: `${Math.round(timer.progress * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="secondary">{label}</Text>
        <Text variant="caption" tone="secondary">{active ? mm(timer.remaining) : t('module.timer.total', { n: Math.round(timer.totalSec / 60) })}</Text>
      </View>

      <View style={{ minHeight: 120, backgroundColor: colors.tinted, borderRadius: radius.lg, padding: space[4], justifyContent: 'center' }} accessibilityLiveRegion="polite">
        {timer.status === 'done' ? (
          <View style={{ alignItems: 'center', gap: space[2] }}>
            <CheckCircle2 size={48} color={colors.success} />
            <Text variant="h3" center>{t('module.timer.done')}</Text>
          </View>
        ) : (
          <Text variant="body" center>{active && current ? current[locale] : steps[0]?.[locale]}</Text>
        )}
      </View>

      <View style={{ alignItems: 'center', gap: space[3] }}>
        {timer.status === 'done' ? (
          <Button variant="secondary" title={t('module.timer.restart')} onPress={timer.reset} />
        ) : (
          <PlayControl
            playing={timer.status === 'running'}
            size={72}
            accessibilityLabel={timer.status === 'running' ? t('common.pause') : t('common.play')}
            onPress={() => { if (timer.status === 'idle') timer.start(); else if (timer.status === 'running') timer.pause(); else timer.resume(); }}
          />
        )}
        {active ? (
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Button size="sm" variant="ghost" title={t('module.timer.skip')} onPress={timer.skip} />
            <Button size="sm" variant="ghost" title={t('module.timer.restart')} onPress={timer.reset} />
          </View>
        ) : null}
      </View>

      {!active && timer.status !== 'done' ? (
        <View style={{ gap: space[1] }}>
          {steps.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space[2] }}>
              <Text variant="caption" tone="muted" style={{ minWidth: 40 }}>{mm(s.seconds ?? DEFAULT_STEP_SECONDS)}</Text>
              <Text variant="bodySmall" tone="secondary" style={{ flex: 1 }}>{s[locale]}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
