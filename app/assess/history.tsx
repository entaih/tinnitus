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

type BoolKey = 'noiseExposure' | 'hearingDifficulty' | 'soundSensitivity' | 'somaticModulation' | 'neckOrJawPain' | 'ototoxicMeds' | 'earFullness' | 'sleepProblem' | 'stressWorsens' | 'priorAudiometry'
  | 'misophoniaScreen' | 'osaSnoring' | 'osaSleepiness';

type Draft = Partial<CaseHistory>;

type Step = (
  | { kind: 'choice'; key: 'side'; options: Side[] }
  | { kind: 'choice'; key: 'onset'; options: Onset[] }
  | { kind: 'choice'; key: 'pattern'; options: Pattern[] }
  | { kind: 'choice'; key: 'character'; options: Character[] }
  | { kind: 'bool'; key: BoolKey }
  | { kind: 'age'; key: 'age' }
) & { /** Follow-up item shown only when its parent answer makes it relevant. */ when?: (d: Draft) => boolean };

/**
 * Only the questions that change triage or the programme are asked (9 items), plus three short follow-ups
 * (PM sprint 2 A4, physician B5–B6): a misophonia clue under sound sensitivity and a 2-item OSA screen under sleep problem.
 * Pulsatility, ototoxic drugs and Ménière-type fullness are already covered by the safety screen;
 * stress and age do not alter the plan, so they are not asked.
 */
const STEPS: Step[] = [
  { kind: 'choice', key: 'side', options: ['left', 'right', 'both', 'head'] },
  { kind: 'choice', key: 'onset', options: ['lt3m', '3to12m', '1to5y', 'gt5y'] },
  { kind: 'choice', key: 'character', options: ['tonal', 'hissing', 'buzzing', 'roaring', 'clicking', 'multiple'] },
  { kind: 'bool', key: 'noiseExposure' },
  { kind: 'bool', key: 'hearingDifficulty' },
  { kind: 'bool', key: 'priorAudiometry' },
  { kind: 'bool', key: 'soundSensitivity' },
  { kind: 'bool', key: 'misophoniaScreen', when: (d) => d.soundSensitivity === true },
  { kind: 'bool', key: 'somaticModulation' },
  { kind: 'bool', key: 'sleepProblem' },
  { kind: 'bool', key: 'osaSnoring', when: (d) => d.sleepProblem === true },
  { kind: 'bool', key: 'osaSleepiness', when: (d) => d.sleepProblem === true },
];
const BASE_ITEMS = STEPS.filter((s) => !s.when).length;
const visibleSteps = (d: Draft) => STEPS.filter((s) => !s.when || s.when(d));

export default function HistoryScreen() {
  const t = useT();
  const { colors, space } = useTheme();
  const id = useAssessmentId();
  const saveHistory = useClinical((s) => s.saveHistory);
  const existing = useClinical((s) => mergedLatest(s.assessments)?.history);
  const redFlags = useClinical((s) => mergedLatest(s.assessments)?.redFlags);
  const { finish, inJourney } = useJourney();
  const { open, sheet } = useCitation();

  const [phase, setPhase] = useState<'intro' | 'items' | 'done'>(() => (inJourney ? 'items' : 'intro'));
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({ ...(existing ?? {}) }));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const setField = <K extends keyof CaseHistory>(key: K, value: CaseHistory[K]) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    // The visible list may grow right after this item (follow-ups), so the next index is computed on the new draft.
    const list = visibleSteps(next);
    const idx = list.findIndex((s) => s.key === key);
    if (timer.current) clearTimeout(timer.current);
    if (idx < 0 || idx >= list.length - 1) timer.current = setTimeout(() => complete(next), AUTO_ADVANCE_MS);
    else timer.current = setTimeout(() => setStep(idx + 1), AUTO_ADVANCE_MS);
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
      priorAudiometry: !!d.priorAudiometry,
      // Follow-ups are only meaningful under a positive parent answer.
      misophoniaScreen: !!d.soundSensitivity && !!d.misophoniaScreen,
      osaSnoring: !!d.sleepProblem && !!d.osaSnoring,
      osaSleepiness: !!d.sleepProblem && !!d.osaSleepiness,
      ...(existing?.age ? { age: existing.age } : {}),
    };
    saveHistory(id, h);
    setPhase('done');
  };

  const goHub = () => finish('/(tabs)/assess');

  const steps = visibleSteps(draft);
  const current = steps[Math.min(step, steps.length - 1)];

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
            <Text variant="caption" tone="muted">{t('q.intro.items', { n: BASE_ITEMS, min: 2 })}</Text>
            <EvidenceChip level="guideline" onPress={() => open('cima2019')} />
          </View>
          <Button title={t('common.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <QuestionStep
          index={Math.min(step, steps.length - 1)}
          total={steps.length}
          stem={t(`history.q.${current.key}`)}
          hint={inJourney && step === 0 ? t('history.intro.body') : undefined}
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
