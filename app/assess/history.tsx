import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ClipboardList, CircleCheck } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, EvidenceChip, useCitation } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical, mergedLatest } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { useJourney } from '@/hooks/useJourney';
import type { CaseHistory, Character, Onset, Pattern, Side } from '@/clinical/types';

const AUTO_ADVANCE_MS = 350;

type BoolKey = 'noiseExposure' | 'hearingDifficulty' | 'soundSensitivity' | 'somaticModulation' | 'neckOrJawPain' | 'ototoxicMeds' | 'earFullness' | 'sleepProblem' | 'stressWorsens';

type Step =
  | { kind: 'choice'; key: 'side'; options: Side[] }
  | { kind: 'choice'; key: 'onset'; options: Onset[] }
  | { kind: 'choice'; key: 'pattern'; options: Pattern[] }
  | { kind: 'choice'; key: 'character'; options: Character[] }
  | { kind: 'bool'; key: BoolKey }
  | { kind: 'age'; key: 'age' };

/**
 * Only the questions that change triage or the programme are asked (8 items).
 * Pulsatility, ototoxic drugs and Ménière-type fullness are already covered by the safety screen;
 * stress and age do not alter the plan, so they are not asked.
 */
const STEPS: Step[] = [
  { kind: 'choice', key: 'side', options: ['left', 'right', 'both', 'head'] },
  { kind: 'choice', key: 'onset', options: ['lt3m', '3to12m', '1to5y', 'gt5y'] },
  { kind: 'choice', key: 'character', options: ['tonal', 'hissing', 'buzzing', 'roaring', 'clicking', 'multiple'] },
  { kind: 'bool', key: 'noiseExposure' },
  { kind: 'bool', key: 'hearingDifficulty' },
  { kind: 'bool', key: 'soundSensitivity' },
  { kind: 'bool', key: 'somaticModulation' },
  { kind: 'bool', key: 'sleepProblem' },
];

type Draft = Partial<CaseHistory>;

export default function HistoryScreen() {
  const t = useT();
  const router = useRouter();
  const { colors, space } = useTheme();
  const id = useAssessmentId();
  const saveHistory = useClinical((s) => s.saveHistory);
  const existing = useClinical((s) => mergedLatest(s.assessments)?.history);
  const redFlags = useClinical((s) => mergedLatest(s.assessments)?.redFlags);
  const { finish } = useJourney();
  const { open, sheet } = useCitation();

  const [phase, setPhase] = useState<'intro' | 'items' | 'done'>('intro');
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({ ...(existing ?? {}) }));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const advance = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), AUTO_ADVANCE_MS);
  };

  const setField = <K extends keyof CaseHistory>(key: K, value: CaseHistory[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (step >= STEPS.length - 1) { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => complete(next), AUTO_ADVANCE_MS); }
    else advance();
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (step === 0) setPhase('intro'); else setStep(step - 1);
  };

  const complete = (d: Draft) => {
    const h: CaseHistory = {
      side: d.side ?? 'both',
      onset: d.onset ?? '3to12m',
      pattern: redFlags?.pulsatile ? 'pulsatile' : d.pattern ?? 'constant',
      character: d.character ?? 'tonal',
      noiseExposure: !!d.noiseExposure,
      hearingDifficulty: !!d.hearingDifficulty,
      soundSensitivity: !!d.soundSensitivity,
      somaticModulation: !!d.somaticModulation,
      neckOrJawPain: !!d.neckOrJawPain,
      ototoxicMeds: !!(existing?.ototoxicMeds || d.ototoxicMeds),
      earFullness: !!(existing?.earFullness || d.earFullness),
      sleepProblem: !!d.sleepProblem,
      stressWorsens: !!d.stressWorsens,
      ...(existing?.age ? { age: existing.age } : {}),
    };
    saveHistory(id, h);
    setPhase('done');
  };

  const goHub = () => finish('/(tabs)/assess');

  const current = STEPS[step];

  return (
    <Screen>
      <Stack.Screen options={{ title: t('history.title') }} />

      {phase === 'intro' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <ClipboardList size={28} color={colors.primary} />
            <Text variant="h2" style={{ flex: 1 }}>{t('history.intro.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('history.intro.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Text variant="caption" tone="muted">{t('q.intro.items', { n: STEPS.length, min: 2 })}</Text>
            <EvidenceChip level="guideline" onPress={() => open('cima2019')} />
          </View>
          <Button title={t('common.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <QuestionStep
          index={step}
          total={STEPS.length}
          stem={t(`history.q.${current.key}`)}
          onBack={back}
        >
          {current.kind === 'choice' ? (
            (current.options as string[]).map((opt) => (
              <OptionCard
                key={opt}
                label={t(`history.${current.key}.${opt}`)}
                selected={draft[current.key] === opt}
                onPress={() => setField(current.key, opt as never)}
              />
            ))
          ) : current.kind === 'bool' ? (
            <>
              <OptionCard label={t('common.no')} selected={draft[current.key] === false} onPress={() => setField(current.key, false)} />
              <OptionCard label={t('common.yes')} selected={draft[current.key] === true} onPress={() => setField(current.key, true)} />
            </>
          ) : null}
        </QuestionStep>
      ) : null}

      {phase === 'done' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <CircleCheck size={28} color={colors.success} />
            <Text variant="h2" style={{ flex: 1 }}>{t('history.done.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('history.done.body')}</Text>
          <Button title={t('common.continue')} onPress={goHub} />
        </Card>
      ) : null}
      {sheet}
    </Screen>
  );
}
