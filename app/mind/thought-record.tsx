import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, Text, Card, Button, Disclaimer } from '@/components';
import { SliderRow, TextArea } from '@/components/mind';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { newId, useClinical } from '@/store/clinical';

/** Seven-step thought record (situation → thought → emotion/intensity → evidence for/against → balanced → intensity after).
 *  Drafts live in component state; saved entries go to useClinical().thoughts. */
export default function ThoughtRecordScreen() {
  const { colors, space } = useTheme();
  const t = useT();
  const router = useRouter();
  const addThought = useClinical((s) => s.addThought);
  const [situation, setSituation] = useState('');
  const [thought, setThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balanced, setBalanced] = useState('');
  const [intensityAfter, setIntensityAfter] = useState(50);
  const [touchedAfter, setTouchedAfter] = useState(false);

  const canSave = situation.trim().length > 0 && thought.trim().length > 0;
  const save = () => {
    addThought({ id: newId(), date: new Date().toISOString(), situation: situation.trim(), thought: thought.trim(), emotion: emotion.trim(), intensity, evidenceFor: evidenceFor.trim(), evidenceAgainst: evidenceAgainst.trim(), balanced: balanced.trim(), intensityAfter: touchedAfter ? intensityAfter : intensity });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };
  const step = (i: number, title: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2] }}>
      <Text variant="overline" tone="primary">{t('thought.step', { i })}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('thought.title') }} />
      <Screen footer={<Button title={t('thought.save')} onPress={save} disabled={!canSave} />}>
        <Text variant="bodySmall" tone="secondary">{t('thought.optional')}</Text>
        <Card>
          {step(1, t('thought.situation'))}
          <TextArea label={t('thought.situation')} hint={t('thought.situation.hint')} value={situation} onChange={setSituation} minHeight={72} />
        </Card>
        <Card>
          {step(2, t('thought.thought'))}
          <TextArea label={t('thought.thought')} hint={t('thought.thought.hint')} value={thought} onChange={setThought} minHeight={72} />
        </Card>
        <Card>
          {step(3, t('thought.emotion'))}
          <TextArea label={t('thought.emotion')} hint={t('thought.emotion.hint')} value={emotion} onChange={setEmotion} minHeight={48} />
          <SliderRow label={t('thought.intensity')} value={intensity} onChange={setIntensity} max={100} step={5} low="0" high="100" />
        </Card>
        <Card>
          {step(4, t('thought.evidenceFor'))}
          <TextArea label={t('thought.evidenceFor')} hint={t('thought.evidenceFor.hint')} value={evidenceFor} onChange={setEvidenceFor} />
        </Card>
        <Card>
          {step(5, t('thought.evidenceAgainst'))}
          <TextArea label={t('thought.evidenceAgainst')} hint={t('thought.evidenceAgainst.hint')} value={evidenceAgainst} onChange={setEvidenceAgainst} />
        </Card>
        <Card>
          {step(6, t('thought.balanced'))}
          <TextArea label={t('thought.balanced')} hint={t('thought.balanced.hint')} value={balanced} onChange={setBalanced} />
        </Card>
        <Card>
          {step(7, t('thought.intensityAfter'))}
          <SliderRow label={t('thought.intensityAfter')} value={intensityAfter} onChange={(v) => { setTouchedAfter(true); setIntensityAfter(v); }} max={100} step={5} low="0" high="100" />
          {touchedAfter ? <Text variant="bodySmall" tone={intensityAfter < intensity ? 'success' : 'secondary'}>{t('thought.change', { b: intensity, a: intensityAfter })}</Text> : null}
        </Card>
        <Text variant="caption" tone="secondary" style={{ color: colors.textMuted }}>{t('thought.draftKept')}</Text>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
