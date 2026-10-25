import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Button, Card, EvidenceChip, useCitation } from '@/components';
import { useStepTimer, type TimedStep } from '@/components/sound';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';

/** Öst (1987) applied relaxation, step 1: progressive tension–release across 10 muscle groups (7 in the 6-minute `?variant=short`). */
const GROUPS = ['hands', 'arms', 'shoulders', 'forehead', 'eyes', 'jaw', 'neck', 'chest', 'abdomen', 'legs'] as const;
type Group = (typeof GROUPS)[number];
type StepKind = 'intro' | 'tense' | 'release' | 'close' | 'breathIn' | 'breathOut';
interface StepData { kind: StepKind; group?: Group; rep?: number }

const TENSE_S = 5, RELEASE_S = 25, INTRO_S = 30, CLOSE_S = 90;   // 30 + 10 × 2 × 30 + 90 = 720 s ≈ 12 min
/** Short version (`exercise.pmrShort`, PM sprint 2 §B4): 7 groups, 5 s tense / 17 s release × 2, 20 + 308 + 32 = 360 s = 6 min. */
const SHORT_GROUPS: Group[] = ['arms', 'shoulders', 'forehead', 'jaw', 'neck', 'abdomen', 'legs'];
const SHORT_TENSE_S = 5, SHORT_RELEASE_S = 17, SHORT_INTRO_S = 20, SHORT_CLOSE_S = 32;

function fullSteps(groups: readonly Group[] = GROUPS, tense = TENSE_S, release = RELEASE_S, intro = INTRO_S, close = CLOSE_S): TimedStep<StepData>[] {
  const out: TimedStep<StepData>[] = [{ data: { kind: 'intro' }, seconds: intro }];
  for (const group of groups) {
    for (let rep = 1; rep <= 2; rep++) {
      out.push({ data: { kind: 'tense', group, rep }, seconds: tense });
      out.push({ data: { kind: 'release', group, rep }, seconds: release });
    }
  }
  out.push({ data: { kind: 'close' }, seconds: close });
  return out;
}
export const shortSteps = () => fullSteps(SHORT_GROUPS, SHORT_TENSE_S, SHORT_RELEASE_S, SHORT_INTRO_S, SHORT_CLOSE_S);

/** "Hızlı gevşeme" (Öst steps 4–5 condensed): cue word on each out-breath, three breaths, ~60 s. */
function rapidSteps(): TimedStep<StepData>[] {
  const out: TimedStep<StepData>[] = [{ data: { kind: 'intro' }, seconds: 10 }];
  for (let rep = 1; rep <= 3; rep++) {
    out.push({ data: { kind: 'breathIn', rep }, seconds: 4 });
    out.push({ data: { kind: 'breathOut', rep }, seconds: 6 });
  }
  out.push({ data: { kind: 'close' }, seconds: 20 });
  return out;
}

export default function PmrScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const router = useRouter();
  const { taskKey, variant } = useLocalSearchParams<{ taskKey?: string; variant?: string }>();
  const rapid = variant === 'rapid';
  const short = variant === 'short';
  const logSession = useClinical((s) => s.logSession);
  const completeTask = useClinical((s) => s.completeTask);
  const { open, sheet } = useCitation();
  const [finished, setFinished] = useState(false);

  const steps = useMemo(() => (rapid ? rapidSteps() : short ? shortSteps() : fullSteps()), [rapid, short]);
  const timer = useStepTimer(steps, {
    onStep: (s) => {
      if (s.data.kind === 'tense') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (s.data.kind === 'release' || s.data.kind === 'breathOut') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else void Haptics.selectionAsync();
    },
    onFinish: (elapsed) => {
      setFinished(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logSession({ type: 'exercise', minutes: Math.max(1, Math.round(elapsed / 60)), detail: rapid ? 'pmr:rapid' : short ? 'pmr:short' : 'pmr:full' });
      if (taskKey) completeTask(taskKey);
    },
  });

  const title = rapid ? t('exercise.pmr.rapidTitle') : short ? t('exercise.pmrShort.title') : t('exercise.pmr.title');
  const s = timer.step?.data;
  const groupName = s?.group ? t(`exercise.pmr.group.${s.group}`) : '';
  const heading = !s ? '' : s.kind === 'intro' ? t('exercise.pmr.introTitle') : s.kind === 'close' ? t('exercise.pmr.closeTitle')
    : s.kind === 'tense' ? t('exercise.pmr.tense', { group: groupName }) : s.kind === 'release' ? t('exercise.pmr.release', { group: groupName })
    : s.kind === 'breathIn' ? t('exercise.breath.inhale') : t('exercise.pmr.cueWord');
  const body = !s ? '' : s.kind === 'intro' ? (rapid ? t('exercise.pmr.rapidIntroBody') : t('exercise.pmr.introBody')) : s.kind === 'close' ? (rapid ? t('exercise.pmr.rapidCloseBody') : t('exercise.pmr.closeBody'))
    : s.kind === 'tense' ? t(`exercise.pmr.cue.${s.group}`) : s.kind === 'release' ? t('exercise.pmr.releaseBody')
    : s.kind === 'breathIn' ? t('exercise.pmr.breathInBody') : t('exercise.pmr.breathOutBody');

  const active = timer.status === 'running' || timer.status === 'paused';
  const totalMin = Math.round(timer.totalSec / 60);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen>
        {finished ? (
          <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[6] }} accessibilityLiveRegion="polite">
            <CheckCircle2 size={72} color={colors.success} />
            <Text variant="h2">{t('exercise.completed')}</Text>
            <Text variant="bodySmall" tone="secondary" center>{t('exercise.completedBody', { n: Math.max(1, totalMin) })}</Text>
            <Button title={t('common.done')} onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
            <Button variant="ghost" title={t('exercise.again')} onPress={() => { timer.reset(); setFinished(false); }} />
          </View>
        ) : null}

        {!finished && timer.status === 'idle' ? (
          <>
            <Text variant="h1">{title}</Text>
            <Text variant="body">{rapid ? t('exercise.pmr.rapidIntro') : short ? t('exercise.pmrShort.intro') : t('exercise.pmr.intro')}</Text>
            <Card variant="tinted">
              <Text variant="bodySmall">{rapid ? t('exercise.pmr.rapidHow') : short ? t('exercise.pmrShort.how', { tense: SHORT_TENSE_S, release: SHORT_RELEASE_S }) : t('exercise.pmr.how', { tense: TENSE_S, release: RELEASE_S })}</Text>
              <Text variant="caption" tone="secondary">{t('exercise.duration', { n: totalMin })}</Text>
            </Card>
            <Text variant="bodySmall" tone="secondary">{t('exercise.pmr.safety')}</Text>
            <EvidenceChip level="rct" onPress={() => open('ost1987')} />
            <Button title={t('common.start')} onPress={timer.start} />
            {!rapid && !short ? <Button variant="ghost" title={t('exercise.pmr.tryRapid')} onPress={() => router.setParams({ variant: 'rapid' })} /> : null}
          </>
        ) : null}

        {!finished && active && s ? (
          <>
            {/* overall progress */}
            <View style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.primaryTrack, overflow: 'hidden' }} accessibilityLabel={t('exercise.progress', { pct: Math.round(timer.progress * 100) })}>
              <View style={{ width: `${Math.round(timer.progress * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
            </View>
            <Text variant="overline" tone="secondary">{t('exercise.stepOf', { i: timer.index + 1, n: steps.length })}</Text>
            <Card style={{ minHeight: 280, justifyContent: 'center', alignItems: 'center', gap: space[4], backgroundColor: s.kind === 'tense' ? colors.accentSoft : colors.card }}>
              <Text variant="h1" center accessibilityLiveRegion="polite">{timer.status === 'paused' ? t('exercise.paused') : heading}</Text>
              <Text variant="numeric">{timer.remaining}</Text>
              <Text variant="body" center tone="secondary">{body}</Text>
              {s.kind === 'breathOut' ? <Text variant="display" tone="primary" center>{t('exercise.pmr.cueWord')}</Text> : null}
              {s.rep && s.kind !== 'breathIn' && s.kind !== 'breathOut' ? <Text variant="caption" tone="secondary">{t('exercise.pmr.rep', { n: s.rep })}</Text> : null}
            </Card>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              {timer.status === 'running'
                ? <Button style={{ flex: 1 }} variant="secondary" title={t('common.pause')} onPress={timer.pause} />
                : <Button style={{ flex: 1 }} title={t('common.continue')} onPress={timer.resume} />}
              <Button style={{ flex: 1 }} variant="ghost" title={t('exercise.skipStep')} onPress={timer.skip} />
            </View>
            <Button variant="ghost" title={t('common.stop')} onPress={() => { timer.reset(); }} />
          </>
        ) : null}
        {sheet}
      </Screen>
    </>
  );
}
