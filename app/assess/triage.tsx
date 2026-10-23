import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Phone, ShieldAlert } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, Banner, EvidenceChip, useCitation, Disclaimer } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical, mergedLatest } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { computeTriage, type Tier } from '@/clinical/engine';
import type { RedFlags } from '@/clinical/types';

const TOTAL = 12;
const AUTO_ADVANCE_MS = 350;

type Answers = (boolean | null)[];

function toRedFlags(a: boolean[]): RedFlags {
  return {
    selfHarm: a[0],
    neuroSigns: a[1],
    vertigo: a[2],
    suddenHearingLoss: a[3],
    pulsatile: a[5],
    unilateralSymptoms: a[6] || a[7],
    otorrhoeaOrPain: a[8] || a[9],
    headTrauma: a[9],
    rapidWorsening: a[4],
  };
}

export default function TriageScreen() {
  const t = useT();
  const router = useRouter();
  const { colors, space } = useTheme();
  const id = useAssessmentId();
  const saveRedFlags = useClinical((s) => s.saveRedFlags);
  const saveHistory = useClinical((s) => s.saveHistory);
  const { open, sheet } = useCitation();

  const [phase, setPhase] = useState<'intro' | 'items' | 'result'>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => Array(TOTAL).fill(null));
  const [result, setResult] = useState<{ tier: Tier; reasons: string[]; mh: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const finish = (final: boolean[]) => {
    const flags = toRedFlags(final);
    saveRedFlags(id, flags);
    // Merge the history-type items (A5 rapid worsening, A8 asymmetry, A11 Ménière pattern, A12 ototoxic) into the most recent history; keep other fields.
    const prior = mergedLatest(useClinical.getState().assessments)?.history;
    if (prior) {
      saveHistory(id, {
        ...prior,
        hearingDifficulty: prior.hearingDifficulty || final[4] || final[7],
        earFullness: prior.earFullness || final[10],
        ototoxicMeds: prior.ototoxicMeds || final[11],
      });
    }
    const after = useClinical.getState().assessments.find((a) => a.id === id) ?? { id, date: new Date().toISOString(), questionnaires: [] };
    const tri = computeTriage({ ...after, redFlags: flags });
    let tier: Tier = tri.tier;
    let reasons = tri.reasons;
    // Research §6.6: rapid worsening (A5) is a 2-week tier even without the history form; the engine only sees it through hearingDifficulty.
    if (final[4] && tier > 2) { tier = 2; reasons = ['triage.rapidWorsening', ...reasons.filter((r) => r !== 'triage.selfcare')]; }
    // A11/A12 are routine-ENT items even when no history exists yet.
    if ((final[10] || final[11]) && tier > 3) { tier = 3; reasons = [...(final[10] ? ['triage.meniere'] : []), ...(final[11] ? ['triage.ototoxic'] : []), ...reasons.filter((r) => r !== 'triage.selfcare')]; }
    setResult({ tier, reasons, mh: final[0] });
    setPhase('result');
  };

  const select = (value: boolean) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (step + 1 >= TOTAL) finish(next.map((v) => !!v));
      else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (step === 0) setPhase('intro'); else setStep(step - 1);
  };

  const goHub = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/assess'); };

  const call = (num: string) => { void Linking.openURL(`tel:${num}`); };

  return (
    <Screen>
      <Stack.Screen options={{ title: t('triage.title') }} />

      {phase === 'intro' ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <ShieldAlert size={28} color={colors.primary} />
            <Text variant="h2" style={{ flex: 1 }}>{t('triage.intro.title')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('triage.intro.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Text variant="caption" tone="muted">{t('q.intro.items', { n: TOTAL, min: 2 })}</Text>
            <EvidenceChip level="guideline" onPress={() => open('nice2020')} />
          </View>
          <Button title={t('common.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <QuestionStep
          index={step}
          total={TOTAL}
          progressLabel={t('triage.progress', { n: step + 1, total: TOTAL })}
          stem={t(`triage.q${step + 1}`)}
          hint={step === 0 ? t('triage.hint.q1') : step === 9 ? t('triage.hint.q10') : undefined}
          onBack={back}
        >
          <OptionCard label={t('common.no')} selected={answers[step] === false} onPress={() => select(false)} />
          <OptionCard label={t('common.yes')} selected={answers[step] === true} onPress={() => select(true)} />
        </QuestionStep>
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

          {result.reasons.length ? (
            <Card variant="tinted" title={t('triage.result.reasons')}>
              {result.reasons.map((r) => (
                <View key={r} style={{ flexDirection: 'row', gap: space[2] }}>
                  <Text variant="body" tone="secondary">·</Text>
                  <Text variant="body" style={{ flex: 1 }}>{t(r)}</Text>
                </View>
              ))}
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
