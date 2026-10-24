import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { Banner, Button, Card, Disclaimer, OptionCard, Screen, Text } from '@/components';
import { EstimateNote, ManoeuvreCard, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';

type Phase = 'intro' | 'steps' | 'questions' | 'result';
type StepId = 'toynbee' | 'valsalva' | 'yawn';
const STEPS: StepId[] = ['toynbee', 'valsalva', 'yawn'];
const HOLD_SECONDS = 10;

/** Guided Eustachian-tube manoeuvres (Toynbee, gentle Valsalva, yawning) + two yes/no questions. */
export default function PressureManoeuvresScreen() {
  useKeepAwake();
  const t = useT();
  const { space } = useTheme();
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence } = useExamFinish('pressure');

  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [pop, setPop] = useState<boolean | null>(null);
  const [relief, setRelief] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  const step = STEPS[index];
  const advance = () => {
    if (index + 1 < STEPS.length) setIndex(index + 1);
    else setPhase('questions');
  };
  const begin = () => { setIndex(0); setPop(null); setRelief(null); setSaved(false); setPhase('steps'); };

  const save = () => {
    if (saved || pop == null || relief == null) return;
    saveExam(assessmentId, { valsalvaPop: pop, fullnessRelief: relief });
    setSaved(true);
  };

  const yesNo = (value: boolean | null, onChange: (v: boolean) => void) => (
    <View style={{ gap: space[2] }}>
      <OptionCard label={t('common.yes')} selected={value === true} onPress={() => onChange(true)} />
      <OptionCard label={t('common.no')} selected={value === false} onPress={() => onChange(false)} />
    </View>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.pressure.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.pressure.title')}</Text>
          <Text variant="body" tone="secondary">{t('exam.pressure.intro.body')}</Text>
          <Banner tone="warning" title={t('exam.pressure.warn')} />
          <Button title={t('common.start')} onPress={begin} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'steps' && (
        <>
          {step === 'valsalva' ? <Banner tone="warning" title={t('exam.pressure.warn')} /> : null}
          <ManoeuvreCard
            stepLabel={t('exam.step', { i: index + 1, n: STEPS.length })}
            title={t(`exam.pressure.${step}`)}
            instruction={t(`exam.pressure.${step}.how`)}
            seconds={HOLD_SECONDS}
            onComplete={advance}
            skipLabel={t('exam.pressure.skipStep')}
            onSkip={advance}
          />
          <Button variant="ghost" title={t('exam.stop')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'questions' && (
        <>
          <Text variant="h2">{t('exam.pressure.q.pop')}</Text>
          {yesNo(pop, setPop)}
          <Text variant="h2">{t('exam.pressure.q.relief')}</Text>
          {yesNo(relief, setRelief)}
          <Button title={t('common.continue')} disabled={pop == null || relief == null} onPress={() => setPhase('result')} />
        </>
      )}

      {phase === 'result' && pop != null && relief != null && (
        <>
          <Text variant="h1">{t('exam.pressure.result.title')}</Text>
          <Card>
            <Text variant="body">{t('exam.pressure.q.pop')} <Text variant="bodyStrong">{pop ? t('common.yes') : t('common.no')}</Text></Text>
            <Text variant="body">{t('exam.pressure.q.relief')} <Text variant="bodyStrong">{relief ? t('common.yes') : t('common.no')}</Text></Text>
            <Text variant="bodySmall" tone="secondary">{t('exam.pressure.result.hint')}</Text>
          </Card>
          <EstimateNote />
          <Button title={inSequence ? t('exam.saveNext') : t('exam.saveFinish')} onPress={() => { save(); finish(); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('exam.repeat')} onPress={begin} />
          {saved ? <Text variant="caption" tone="success">{t('exam.saved')}</Text> : null}
          <Disclaimer textKey="disclaimer.short" />
        </>
      )}
    </Screen>
  );
}
