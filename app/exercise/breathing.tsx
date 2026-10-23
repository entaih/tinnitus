import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Button, Card, Stepper, EvidenceChip, useCitation } from '@/components';
import { BreathingCircle, useStepTimer, type BreathPhase, type TimedStep } from '@/components/sound';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { soundEngine } from '@/audio/engine';

type PatternId = '446' | '478';
const PATTERNS: Record<PatternId, { inhale: number; hold: number; exhale: number }> = { '446': { inhale: 4, hold: 4, exhale: 6 }, '478': { inhale: 4, hold: 7, exhale: 8 } };
const PAD_ID = 'breath-pad';
type StepData = { phase: Exclude<BreathPhase, 'idle' | 'done'>; cycle: number };

export default function BreathingScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const router = useRouter();
  const { taskKey } = useLocalSearchParams<{ taskKey?: string }>();
  const reduceSetting = useSettings((s) => s.reduceMotion);
  const maxVolume = useSettings((s) => s.maxVolume);
  const reduceMotion = useReducedMotion() || reduceSetting;
  const logSession = useClinical((s) => s.logSession);
  const completeTask = useClinical((s) => s.completeTask);
  const { open, sheet } = useCitation();

  const [pattern, setPattern] = useState<PatternId>('446');
  const [cycles, setCycles] = useState(6);
  const [pad, setPad] = useState(false);
  const [animMs, setAnimMs] = useState(4000);
  const [finished, setFinished] = useState(false);

  const steps = useMemo<TimedStep<StepData>[]>(() => {
    const p = PATTERNS[pattern];
    const out: TimedStep<StepData>[] = [];
    for (let c = 1; c <= cycles; c++) {
      out.push({ data: { phase: 'inhale', cycle: c }, seconds: p.inhale });
      out.push({ data: { phase: 'hold', cycle: c }, seconds: p.hold });
      out.push({ data: { phase: 'exhale', cycle: c }, seconds: p.exhale });
    }
    return out;
  }, [pattern, cycles]);

  const timer = useStepTimer(steps, {
    onStep: (s) => {
      setAnimMs(s.seconds * 1000);
      if (s.data.phase === 'hold') { if (reduceMotion) void Haptics.selectionAsync(); }
      else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onFinish: (elapsed) => {
      setFinished(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logSession({ type: 'exercise', minutes: Math.max(1, Math.round(elapsed / 60)), detail: `breathing:${pattern}x${cycles}` });
      if (taskKey) completeTask(taskKey);
      void soundEngine.stop(PAD_ID);
    },
  });

  // Soft brown-noise pad.
  const padOn = useRef(false);
  useEffect(() => {
    const running = timer.status === 'running' || timer.status === 'paused';
    if (pad && running && !padOn.current) { padOn.current = true; void soundEngine.play({ kind: 'noise', color: 'brown' }, { id: PAD_ID, volume: Math.min(0.15, maxVolume) }); }
    if ((!pad || !running) && padOn.current) { padOn.current = false; void soundEngine.stop(PAD_ID); }
  }, [pad, timer.status, maxVolume]);
  useEffect(() => () => { void soundEngine.stop(PAD_ID); }, []);

  const totalSec = timer.totalSec;
  const phase: BreathPhase = timer.status === 'paused' ? 'idle' : timer.status === 'done' ? 'done' : timer.status === 'idle' ? 'idle' : timer.step?.data.phase ?? 'idle';
  const label = timer.status === 'paused' ? t('exercise.paused') : timer.status === 'idle' ? t('exercise.breath.ready') : timer.status === 'done' ? t('exercise.completed') : t(`exercise.breath.${timer.step?.data.phase}`);

  const start = () => { setFinished(false); timer.start(); };
  const resume = () => { setAnimMs(timer.remaining * 1000); timer.resume(); };
  const stop = () => { timer.reset(); setFinished(false); void soundEngine.stop(PAD_ID); };

  const patternChip = (id: PatternId, text: string) => {
    const selected = pattern === id;
    return (
      <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected }} disabled={timer.status === 'running'} onPress={() => setPattern(id)}
        style={{ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, justifyContent: 'center', backgroundColor: selected ? colors.primary : colors.card, borderWidth: 1, borderColor: selected ? colors.primary : colors.borderStrong }}>
        <Text variant="caption" style={{ color: selected ? colors.onPrimary : colors.text }}>{text}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('exercise.breath.title') }} />
      <Screen>
        <View style={{ alignItems: 'center', paddingVertical: space[4] }}>
          {finished ? (
            <View style={{ alignItems: 'center', gap: space[3] }} accessibilityLiveRegion="polite">
              <CheckCircle2 size={72} color={colors.success} />
              <Text variant="h2">{t('exercise.completed')}</Text>
              <Text variant="bodySmall" tone="secondary" center>{t('exercise.completedBody', { n: Math.max(1, Math.round(totalSec / 60)) })}</Text>
            </View>
          ) : (
            <BreathingCircle phase={phase} durationMs={animMs} label={label} remainingSec={timer.remaining} reduceMotion={reduceMotion} phaseProgress={timer.phaseProgress} />
          )}
        </View>
        {timer.status === 'running' || timer.status === 'paused' ? (
          <Text variant="caption" tone="secondary" center>{t('exercise.breath.cycle', { c: timer.step?.data.cycle ?? 1, n: cycles })}</Text>
        ) : null}

        {timer.status === 'idle' && !finished ? (
          <>
            <Card>
              <Text variant="caption" tone="secondary">{t('exercise.breath.pattern')}</Text>
              <View style={{ flexDirection: 'row', gap: space[2] }}>
                {patternChip('446', t('exercise.breath.p446'))}
                {patternChip('478', t('exercise.breath.p478'))}
              </View>
              <Text variant="bodySmall" tone="secondary">{pattern === '446' ? t('exercise.breath.p446Hint') : t('exercise.breath.p478Hint')}</Text>
              <Stepper label={t('exercise.breath.cycles')} value={cycles} onChange={setCycles} min={4} max={20} />
              <Text variant="caption" tone="secondary">{t('exercise.duration', { n: Math.round(totalSec / 60 * 10) / 10 })}</Text>
            </Card>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t('exercise.breath.pad')}</Text>
                  <Text variant="caption" tone="secondary">{t('exercise.breath.padHint')}</Text>
                </View>
                <Switch value={pad} onValueChange={setPad} trackColor={{ true: colors.primary, false: colors.border }} accessibilityLabel={t('exercise.breath.pad')} />
              </View>
            </Card>
            <Text variant="bodySmall" tone="secondary">{t('exercise.breath.intro')}</Text>
            <EvidenceChip level="rct" onPress={() => open('ost1987')} />
            <Button title={t('common.start')} onPress={start} />
          </>
        ) : null}

        {timer.status === 'running' ? (
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Button style={{ flex: 1 }} variant="secondary" title={t('common.pause')} onPress={timer.pause} />
            <Button style={{ flex: 1 }} variant="ghost" title={t('common.stop')} onPress={stop} />
          </View>
        ) : null}
        {timer.status === 'paused' ? (
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Button style={{ flex: 1 }} title={t('common.continue')} onPress={resume} />
            <Button style={{ flex: 1 }} variant="ghost" title={t('common.stop')} onPress={stop} />
          </View>
        ) : null}
        {finished ? (
          <>
            <Button title={t('common.done')} onPress={() => router.back()} />
            <Button variant="ghost" title={t('exercise.again')} onPress={() => { timer.reset(); setFinished(false); }} />
          </>
        ) : null}
        {sheet}
      </Screen>
    </>
  );
}
