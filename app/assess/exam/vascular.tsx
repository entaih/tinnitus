import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { Banner, Button, Card, Disclaimer, OptionCard, Screen, Text } from '@/components';
import { EstimateNote, ManoeuvreCard, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';

type Phase = 'intro' | 'headTurn' | 'headTurnRate' | 'questions' | 'result';
type Change = 'quieter' | 'louder' | 'same';
const CHANGES: Change[] = ['quieter', 'louder', 'same'];
const HEAD_TURN_SECONDS = 10;

/**
 * Vascular self-observation for pulsatile tinnitus: head turns (rated) plus two questions (faster with exercise?
 * changes when lying down?). The jugular-pressure step was removed (physician A3): the user cannot separate the
 * jugular vein from the carotid sinus, so that manoeuvre is listed for the clinician in the doctor summary.
 */
export default function VascularManoeuvresScreen() {
  useKeepAwake();
  const t = useT();
  const { space } = useTheme();
  const { assessment } = useProfile();
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence, eligibility } = useExamFinish('vascular');
  const pulsatile = !!assessment?.redFlags?.pulsatile || eligibility.vascular;

  const [phase, setPhase] = useState<Phase>('intro');
  const [headTurn, setHeadTurn] = useState<Change | null>(null);
  const [exercise, setExercise] = useState<boolean | null>(null);
  const [positional, setPositional] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  const begin = () => { setHeadTurn(null); setExercise(null); setPositional(null); setSaved(false); setPhase('headTurn'); };
  const save = () => {
    if (saved || headTurn == null || positional == null) return;
    saveExam(assessmentId, { headTurnChange: headTurn, positionalChange: positional });
    setSaved(true);
  };

  const rate = (value: Change | null, onChange: (c: Change) => void) => (
    <View style={{ gap: space[2] }}>
      {CHANGES.map((c) => <OptionCard key={c} label={t(`exam.vascular.${c}`)} selected={value === c} onPress={() => onChange(c)} />)}
    </View>
  );
  const yesNo = (value: boolean | null, onChange: (v: boolean) => void) => (
    <View style={{ gap: space[2] }}>
      <OptionCard label={t('common.yes')} selected={value === true} onPress={() => onChange(true)} />
      <OptionCard label={t('common.no')} selected={value === false} onPress={() => onChange(false)} />
    </View>
  );

  const warning = <Banner tone="danger" title={t('exam.vascular.warn.title')} body={t('exam.vascular.warn.body')} />;

  if (!pulsatile && phase === 'intro') {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('exam.vascular.title') }} />
        <Text variant="h1">{t('exam.vascular.title')}</Text>
        <Banner tone="info" title={t('exam.vascular.notNeeded')} />
        <Button title={t('exam.skip')} onPress={finish} />
        <Button variant="ghost" title={t('common.start')} onPress={begin} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.vascular.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.vascular.title')}</Text>
          <Text variant="body" tone="secondary">{t('exam.vascular.intro.body')}</Text>
          {warning}
          <Button title={t('common.start')} onPress={begin} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'headTurn' && (
        <>
          <ManoeuvreCard stepLabel={t('exam.step', { i: 1, n: 2 })} title={t('exam.vascular.step.headTurn')} instruction={t('exam.vascular.step.headTurn.how')}
            seconds={HEAD_TURN_SECONDS} onComplete={() => setPhase('headTurnRate')} skipLabel={t('exam.pressure.skipStep')} onSkip={() => { setHeadTurn('same'); setPhase('questions'); }} />
          <Button variant="ghost" title={t('exam.stop')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'headTurnRate' && (
        <>
          <Text variant="h2">{t('exam.vascular.step.headTurn')}</Text>
          <Text variant="body" tone="secondary">{t('exam.vascular.q')}</Text>
          {rate(headTurn, setHeadTurn)}
          <Button title={t('common.continue')} disabled={headTurn == null} onPress={() => setPhase('questions')} />
        </>
      )}

      {phase === 'questions' && (
        <>
          <Text variant="overline" tone="secondary">{t('exam.step', { i: 2, n: 2 })}</Text>
          <Text variant="h2">{t('exam.vascular.q.exercise')}</Text>
          {yesNo(exercise, setExercise)}
          <Text variant="h2">{t('exam.vascular.q.positional')}</Text>
          {yesNo(positional, setPositional)}
          <Button title={t('common.continue')} disabled={exercise == null || positional == null} onPress={() => setPhase('result')} />
        </>
      )}

      {phase === 'result' && headTurn != null && positional != null && (
        <>
          <Text variant="h1">{t('exam.vascular.result.title')}</Text>
          <Card>
            <Text variant="body">{t('exam.vascular.result.headTurn', { v: t(`exam.vascular.${headTurn}`) })}</Text>
            <Text variant="body">{t('exam.vascular.result.exercise', { v: exercise ? t('common.yes') : t('common.no') })}</Text>
            <Text variant="body">{t('exam.vascular.result.positional', { v: positional ? t('common.yes') : t('common.no') })}</Text>
            <Text variant="bodySmall" tone="secondary">{t('exam.vascular.result.hint')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('exam.vascular.result.clinicNote')}</Text>
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
