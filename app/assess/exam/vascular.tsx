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

type Phase = 'intro' | 'jugular' | 'jugularRate' | 'headTurn' | 'headTurnRate' | 'result';
type Change = 'quieter' | 'louder' | 'same';
const CHANGES: Change[] = ['quieter', 'louder', 'same'];
const JUGULAR_SECONDS = 5;
const HEAD_TURN_SECONDS = 10;

/** Vascular manoeuvres for pulsatile tinnitus: light jugular pressure and full head turns, each rated. */
export default function VascularManoeuvresScreen() {
  useKeepAwake();
  const t = useT();
  const { space } = useTheme();
  const { assessment } = useProfile();
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence } = useExamFinish('vascular');
  const pulsatile = !!assessment?.redFlags?.pulsatile;

  const [phase, setPhase] = useState<Phase>('intro');
  const [jugular, setJugular] = useState<Change | null>(null);
  const [headTurn, setHeadTurn] = useState<Change | null>(null);
  const [saved, setSaved] = useState(false);

  const begin = () => { setJugular(null); setHeadTurn(null); setSaved(false); setPhase('jugular'); };
  const save = () => {
    if (saved || jugular == null || headTurn == null) return;
    saveExam(assessmentId, { jugularChange: jugular, headTurnChange: headTurn });
    setSaved(true);
  };

  const rate = (value: Change | null, onChange: (c: Change) => void) => (
    <View style={{ gap: space[2] }}>
      {CHANGES.map((c) => <OptionCard key={c} label={t(`exam.vascular.${c}`)} selected={value === c} onPress={() => onChange(c)} />)}
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

      {phase === 'jugular' && (
        <>
          {warning}
          <ManoeuvreCard stepLabel={t('exam.step', { i: 1, n: 2 })} title={t('exam.vascular.step.jugular')} instruction={t('exam.vascular.step.jugular.how')}
            seconds={JUGULAR_SECONDS} onComplete={() => setPhase('jugularRate')} skipLabel={t('exam.pressure.skipStep')} onSkip={() => { setJugular('same'); setPhase('headTurn'); }} />
          <Button variant="ghost" title={t('exam.stop')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'jugularRate' && (
        <>
          <Text variant="h2">{t('exam.vascular.step.jugular')}</Text>
          <Text variant="body" tone="secondary">{t('exam.vascular.q')}</Text>
          {rate(jugular, setJugular)}
          <Button title={t('common.continue')} disabled={jugular == null} onPress={() => setPhase('headTurn')} />
        </>
      )}

      {phase === 'headTurn' && (
        <>
          <ManoeuvreCard stepLabel={t('exam.step', { i: 2, n: 2 })} title={t('exam.vascular.step.headTurn')} instruction={t('exam.vascular.step.headTurn.how')}
            seconds={HEAD_TURN_SECONDS} onComplete={() => setPhase('headTurnRate')} skipLabel={t('exam.pressure.skipStep')} onSkip={() => { setHeadTurn('same'); setPhase('result'); }} />
          <Button variant="ghost" title={t('exam.stop')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'headTurnRate' && (
        <>
          <Text variant="h2">{t('exam.vascular.step.headTurn')}</Text>
          <Text variant="body" tone="secondary">{t('exam.vascular.q')}</Text>
          {rate(headTurn, setHeadTurn)}
          <Button title={t('common.continue')} disabled={headTurn == null} onPress={() => setPhase('result')} />
        </>
      )}

      {phase === 'result' && jugular != null && headTurn != null && (
        <>
          <Text variant="h1">{t('exam.vascular.result.title')}</Text>
          <Card>
            <Text variant="body">{t('exam.vascular.result.jugular', { v: t(`exam.vascular.${jugular}`) })}</Text>
            <Text variant="body">{t('exam.vascular.result.headTurn', { v: t(`exam.vascular.${headTurn}`) })}</Text>
            <Text variant="bodySmall" tone="secondary">{t('exam.vascular.result.hint')}</Text>
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
