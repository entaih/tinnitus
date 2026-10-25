import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, ShieldAlert } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, Banner, EvidenceChip, useCitation, Disclaimer } from '@/components';
import { QuestionStep, ReferralList } from '@/components/assess';
import { useJourney } from '@/hooks/useJourney';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { computeTriage, type Tier } from '@/clinical/engine';
import type { RedFlags } from '@/clinical/types';

const BASE = 12;
/** 3-item re-screen (weeks 8/12, `?short=1`): any "Yes" escalates to the full 12 items (PM sprint 1 §1.3). */
const SHORT = 3;
const totalFor = (answers: Answers) => BASE + (answers[5] ? 2 : 0);
const AUTO_ADVANCE_MS = 350;

type Answers = (boolean | null)[];

/** Every answer is persisted so the engine (single source of truth) can recompute the same tier on every screen. */
function toRedFlags(a: boolean[]): RedFlags {
  return {
    selfHarm: !!a[0],
    neuroSigns: !!a[1],
    vertigo: !!a[2],
    suddenHearingLoss: !!a[3],
    rapidWorsening: !!a[4],
    pulsatile: !!a[5],
    unilateralSymptoms: !!a[6] || !!a[7],
    objectiveSound: !!a[8],
    otorrhoeaOrPain: !!a[9],
    headTrauma: !!a[9],
    menierePattern: !!a[10],
    newOtotoxicDrug: !!a[11],
    pulsatileHeadacheVisual: !!a[12],
    pulsatileNewUnilateral: !!a[13],
  };
}

export default function TriageScreen() {
  const t = useT();
  const router = useRouter();
  const { colors, space } = useTheme();
  const id = useAssessmentId();
  const saveRedFlags = useClinical((s) => s.saveRedFlags);
  const completeTask = useClinical((s) => s.completeTask);
  const { open, sheet } = useCitation();
  const { finish: finishJourney, taskKey } = useJourney();
  const params = useLocalSearchParams<{ short?: string }>();

  const [mode, setMode] = useState<'short' | 'full'>(params.short === '1' ? 'short' : 'full');
  const [escalated, setEscalated] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'items' | 'result' | 'clear'>('intro');
  const [step, setStep] = useState(0);
  const [shortAnswers, setShortAnswers] = useState<Answers>(() => Array(SHORT).fill(null));
  const [answers, setAnswers] = useState<Answers>(() => Array(BASE + 2).fill(null));
  const [result, setResult] = useState<{ tier: Tier; reasons: string[]; mh: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const finish = (final: boolean[]) => {
    const flags = toRedFlags(final);
    saveRedFlags(id, flags);
    const after = useClinical.getState().assessments.find((a) => a.id === id) ?? { id, date: new Date().toISOString(), questionnaires: [] };
    const tri = computeTriage({ ...after, redFlags: flags });
    const tier: Tier = tri.tier;
    const reasons = tri.reasons;
    setResult({ tier, reasons, mh: final[0] });
    if (taskKey) completeTask(taskKey);
    setPhase('result');
  };

  const select = (value: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    if (mode === 'short') {
      const next = [...shortAnswers];
      next[step] = value;
      setShortAnswers(next);
      timer.current = setTimeout(() => {
        if (next.some((v) => v === true)) {
          // Any "Yes": the full 12-item screen runs and computeTriage re-evaluates the tier.
          setMode('full'); setEscalated(true); setStep(0);
        } else if (step + 1 >= SHORT) {
          if (taskKey) completeTask(taskKey);
          setPhase('clear');
        } else setStep(step + 1);
      }, AUTO_ADVANCE_MS);
      return;
    }
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    timer.current = setTimeout(() => {
      if (step + 1 >= totalFor(next)) finish(next.map((v) => !!v));
      else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (step === 0) setPhase('intro'); else setStep(step - 1);
  };

  const isShort = mode === 'short';
  const total = isShort ? SHORT : totalFor(answers);
  const current = isShort ? shortAnswers[step] : answers[step];

  const goHub = () => finishJourney('/(tabs)/assess');

  const call = (num: string) => { void Linking.openURL(`tel:${num}`); };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('triage.title') }} />

      {phase === 'intro' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <ShieldAlert size={28} color={colors.primary} />
            <Text variant="h2" style={{ flex: 1 }}>{t(isShort ? 'triage.short.intro.title' : 'triage.intro.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t(isShort ? 'triage.short.intro.body' : 'triage.intro.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Text variant="caption" tone="muted">{t('q.intro.items', { n: isShort ? SHORT : BASE, min: isShort ? 1 : 2 })}</Text>
            <EvidenceChip level="guideline" onPress={() => open('nice2020')} />
          </View>
          <Button title={t('common.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <View style={{ gap: space[3] }}>
          {escalated ? <Banner tone="warning" title={t('triage.short.escalate')} /> : null}
          <QuestionStep
            index={step}
            total={total}
            progressLabel={t('triage.progress', { n: step + 1, total })}
            stem={t(isShort ? `triage.short.q${step + 1}` : `triage.q${step + 1}`)}
            hint={isShort ? undefined : step === 0 ? t('triage.hint.q1') : step === 9 ? t('triage.hint.q10') : undefined}
            onBack={back}
          >
            <OptionCard label={t('common.no')} selected={current === false} onPress={() => select(false)} />
            <OptionCard label={t('common.yes')} selected={current === true} onPress={() => select(true)} />
          </QuestionStep>
        </View>
      ) : null}

      {phase === 'clear' ? (
        <View style={{ gap: space[4] }}>
          <Banner tone="success" title={t('triage.short.clear.title')} body={t('triage.short.clear.body')} />
          <Button title={t('common.continue')} onPress={() => finishJourney('/(tabs)')} />
          <Disclaimer textKey="disclaimer.short" />
        </View>
      ) : null}

      {phase === 'result' && result ? (
        <View style={{ gap: space[4] }}>
          <Text variant="overline" tone="secondary">{t('triage.result.title')}</Text>
          {result.tier === 0 ? (
            <View accessibilityLabel={t('triage.a11y.alert', { title: t('triage.result.tier0.title') })} style={{ gap: space[3] }}>
              <Banner
                tone="danger"
                title={t('triage.result.tier0.title')}
                body={result.mh ? t('triage.result.tier0.mh') : t('triage.result.tier0.neuro')}
                primary={{ title: t('triage.call112'), onPress: () => call('112') }}
              />
              {result.mh ? (
                <Button variant="secondary" title={t('triage.call183')} icon={<Phone size={18} color={colors.primaryPressed} />} onPress={() => call('183')} />
              ) : null}
            </View>
          ) : result.tier === 1 ? (
            <Banner tone="danger" title={t('triage.result.tier1.title')} body={t('triage.result.tier1.body')} />
          ) : result.tier === 2 ? (
            <Banner tone="warning" title={t('triage.result.tier2.title')} body={t('triage.result.tier2.body')} />
          ) : result.tier === 3 ? (
            <Banner tone="warning" title={t('triage.result.tier3.title')} body={t('triage.result.tier3.body')} />
          ) : result.tier === 4 ? (
            <Banner tone="info" title={t('triage.result.tier4.title')} body={t('triage.result.tier4.body')} />
          ) : (
            <Banner tone="success" title={t('triage.result.tier5.title')} body={t('triage.result.tier5.body')} />
          )}

          {result.reasons.some((r) => r !== 'triage.selfcare') ? (
            <Card variant="tinted" title={t('triage.result.whoToSee')}>
              <ReferralList reasons={result.reasons} />
              <Text variant="bodySmall" tone="secondary">{t('triage.result.continueNote')}</Text>
            </Card>
          ) : null}

          <Button title={t('common.continue')} onPress={goHub} />
          <Disclaimer textKey="disclaimer.short" />
        </View>
      ) : null}
      {sheet}
    </Screen>
  );
}
