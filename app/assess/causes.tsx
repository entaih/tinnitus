import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Search, CircleCheck } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, EvidenceChip, useCitation } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';
import { useJourney } from '@/hooks/useJourney';
import { CAUSE_QUESTIONS } from '@/clinical/causes';

const AUTO_ADVANCE_MS = 350;

/** Adaptive cause-analysis questions: only the items that can change the ranking for this user are asked. */
export default function CausesScreen() {
  const t = useT();
  const { colors, space } = useTheme();
  const id = useAssessmentId();
  const { assessment } = useProfile();
  const save = useClinical((s) => s.saveCauseAnswers);
  const { open, sheet } = useCitation();
  const { finish } = useJourney();

  const questions = useMemo(() => {
    const a = assessment ?? { id, date: '', questionnaires: [] };
    return CAUSE_QUESTIONS.filter((q) => q.when(a));
  }, [assessment, id]);

  const [phase, setPhase] = useState<'intro' | 'items' | 'done'>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const select = (value: boolean) => {
    const q = questions[step];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (step + 1 >= questions.length) { save(id, next); setPhase('done'); } else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };
  const back = () => { if (timer.current) clearTimeout(timer.current); if (step === 0) setPhase('intro'); else setStep(step - 1); };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('causes.title') }} />
      {phase === 'intro' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <Search size={28} color={colors.primary} />
            <Text variant="h2" style={{ flex: 1 }}>{t('causes.intro.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('causes.intro.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Text variant="caption" tone="muted">{t('q.intro.items', { n: questions.length, min: 2 })}</Text>
            <EvidenceChip level="guideline" onPress={() => open('adams2026')} />
          </View>
          <Button title={t('common.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}
      {phase === 'items' && questions[step] ? (
        <QuestionStep index={step} total={questions.length} stem={t(`causeq.${questions[step].id}`)} hint={t(`causeq.${questions[step].id}.hint`) !== `causeq.${questions[step].id}.hint` ? t(`causeq.${questions[step].id}.hint`) : undefined} onBack={back}>
          <OptionCard label={t('common.no')} selected={answers[questions[step].id] === false} onPress={() => select(false)} />
          <OptionCard label={t('common.yes')} selected={answers[questions[step].id] === true} onPress={() => select(true)} />
        </QuestionStep>
      ) : null}
      {phase === 'done' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <CircleCheck size={28} color={colors.success} />
            <Text variant="h2" style={{ flex: 1 }}>{t('causes.done.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('causes.done.body')}</Text>
          <Button title={t('common.continue')} onPress={() => finish('/(tabs)/assess')} />
        </Card>
      ) : null}
      {sheet}
    </Screen>
  );
}
