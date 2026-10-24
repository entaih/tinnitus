import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheck, Pencil, Phone } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, Banner, EvidenceChip, SeverityBadge, Disclaimer, useCitation } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useLocale, useT, pick } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { useJourney } from '@/hooks/useJourney';
import { QUESTIONNAIRES, scoreQuestionnaire, type QuestionnaireId } from '@/clinical/questionnaires';
import type { QuestionnaireResult } from '@/clinical/types';

const AUTO_ADVANCE_MS = 350;
/** Two-item screeners (PHQ-2 / GAD-2): the full scale opens only when the first two items sum to >= 3. */
const GATE: Partial<Record<QuestionnaireId, { items: number; cutoff: number }>> = { PHQ9: { items: 2, cutoff: 3 }, GAD7: { items: 2, cutoff: 3 } };

export default function QuestionnaireScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { colors, space, radius } = useTheme();
  const assessmentId = useAssessmentId();
  const saveQuestionnaire = useClinical((s) => s.saveQuestionnaire);
  const completeTask = useClinical((s) => s.completeTask);
  const { open, sheet } = useCitation();
  const { finish, inJourney, taskKey } = useJourney();

  const qid = (typeof id === 'string' ? id.toUpperCase() : '') as QuestionnaireId;
  const q = QUESTIONNAIRES[qid];

  const [phase, setPhase] = useState<'intro' | 'items' | 'review' | 'done'>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(q?.items.length ?? 0).fill(null));
  const [result, setResult] = useState<ReturnType<typeof scoreQuestionnaire> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!q) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('assess.title') }} />
        <Banner tone="warning" title={t('q.unknown')} />
        <Button title={t('common.back')} variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const total = q.items.length;
  const name = pick(q.name, locale);

  const select = (value: number) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const gate = GATE[q.id];
      if (gate && step + 1 === gate.items) {
        const screen = next.slice(0, gate.items).reduce<number>((acc, b) => acc + (b ?? 0), 0);
        if (screen < gate.cutoff) { submit(next.map((a) => a ?? 0), true); return; }
      }
      if (step + 1 >= total) setPhase('review'); else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (step === 0) setPhase('intro'); else setStep(step - 1);
  };

  const submit = (given: number[] = answers.map((a) => a ?? 0), screenedOut = false) => {
    const filled = given;
    const scored = scoreQuestionnaire(q, filled);
    const rec: QuestionnaireResult = {
      // The store's result union predates SCI/RaSST; the engine reads them back by id, so the cast is safe.
      id: q.id as QuestionnaireResult['id'],
      date: new Date().toISOString(),
      answers: filled,
      total: scored.total,
      subscales: Object.keys(scored.subscales).length ? scored.subscales : screenedOut ? { screen: 2 } : undefined,
    };
    saveQuestionnaire(assessmentId, rec);
    if (taskKey) completeTask(taskKey);
    setResult(scored);
    setPhase('done');
  };

  const allAnswered = answers.every((a) => a != null);
  const crisis = q.id === 'PHQ9' && (answers[8] ?? 0) > 0;
  const call = (num: string) => { void Linking.openURL(`tel:${num}`); };

  return (
    <Screen>
      <Stack.Screen options={{ title: name }} />

      {phase === 'intro' ? (
        <Card>
          <Text variant="h2">{name}</Text>
          <Text variant="body" tone="secondary">{pick(q.description, locale)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
            <Text variant="caption" tone="muted">{GATE[q.id] ? t('q.intro.gated', { n: GATE[q.id]!.items, total }) : t('q.intro.items', { n: total, min: q.minutes })}</Text>
            <EvidenceChip level={q.evidence} onPress={() => open(q.citation)} />
          </View>
          <Text variant="bodySmall" tone="secondary">{t('q.intro.hint')}</Text>
          <Button title={t('q.intro.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <QuestionStep index={step} total={GATE[q.id] && step < GATE[q.id]!.items ? GATE[q.id]!.items : total} stem={pick(q.items[step], locale)} onBack={back}>
          {q.options.map((o) => (
            <OptionCard
              key={o.value}
              label={pick(o, locale)}
              selected={answers[step] === o.value}
              onPress={() => select(o.value)}
            />
          ))}
        </QuestionStep>
      ) : null}

      {phase === 'review' ? (
        <View style={{ gap: space[4] }}>
          <Text variant="h2">{t('q.review.title')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('q.review.body')}</Text>
          <View style={{ gap: space[2] }}>
            {q.items.map((it, i) => {
              const opt = q.options.find((o) => o.value === answers[i]);
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1}. ${pick(it, locale)}. ${opt ? pick(opt, locale) : ''}. ${t('q.review.change')}`}
                  onPress={() => { setStep(i); setPhase('items'); }}
                  style={({ pressed }) => ({ flexDirection: 'row', gap: space[3], alignItems: 'center', minHeight: 56, padding: space[3], borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: opt ? colors.border : colors.warning, opacity: pressed ? 0.8 : 1 })}
                >
                  <Text variant="caption" tone="muted" style={{ width: 24 }}>{i + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySmall" numberOfLines={2}>{pick(it, locale)}</Text>
                    <Text variant="bodyStrong" tone="primary">{opt ? pick(opt, locale) : '—'}</Text>
                  </View>
                  <Pencil size={18} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
          <Button title={t('q.review.submit')} onPress={() => submit()} disabled={!allAnswered} />
        </View>
      ) : null}

      {phase === 'done' && result ? (
        <View style={{ gap: space[4] }}>
          {crisis ? (
            <Banner
              tone="danger"
              title={t('q.crisis.title')}
              body={t('q.crisis.body')}
              primary={{ title: t('triage.call112'), onPress: () => call('112') }}
            />
          ) : null}
          <Card>
            <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
              <CircleCheck size={28} color={colors.success} />
              <Text variant="h2" style={{ flex: 1 }}>{t('q.done.title')}</Text>
            </View>
            <Text variant="overline" tone="secondary">{t('q.done.total')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[3] }}>
              <Text variant="numeric">{result.total}</Text>
              <Text variant="bodySmall" tone="muted" style={{ paddingBottom: 6 }}>/ {q.max}</Text>
            </View>
            <SeverityBadge band={result.band} score={result.total} source={q.id} />
            {q.id === 'THI' && Object.keys(result.subscales).length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
                {Object.entries(result.subscales).map(([k, v]) => (
                  <Text key={k} variant="caption" tone="secondary">{t(`q.subscale.${k}`)}: {v}</Text>
                ))}
              </View>
            ) : null}
            <Text variant="body">{t(result.key)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
              <EvidenceChip level={q.evidence} onPress={() => open(q.citation)} />
            </View>
          </Card>
          {crisis ? (
            <Button variant="secondary" title={t('triage.call183')} icon={<Phone size={18} color={colors.primaryPressed} />} onPress={() => call('183')} />
          ) : null}
          {inJourney ? (
            <Button title={t('common.continue')} onPress={() => finish()} />
          ) : (
            <>
              <Button title={t('q.done.toResults')} onPress={() => router.replace('/assess/results')} />
              <Button variant="ghost" title={t('q.done.backToHub')} onPress={() => finish('/(tabs)/assess')} />
            </>
          )}
          <Disclaimer />
        </View>
      ) : null}
      {sheet}
    </Screen>
  );
}
