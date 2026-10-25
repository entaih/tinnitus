import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleCheck, Pencil, Phone } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, Banner, EvidenceChip, SeverityBadge, Disclaimer, useCitation } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useLocale, useT, pick } from '@/i18n';
import { useClinical , latestQuestionnaire, mergedLatest } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { useJourney } from '@/hooks/useJourney';
import { QUESTIONNAIRES, THIS_ENABLED, optionsFor, scoreQuestionnaire, type QuestionnaireId } from '@/clinical/questionnaires';
import { consequencesOf, consequenceText, type Consequence } from '@/clinical/consequences';
import { useGrowth } from '@/store/growth';
import type { QuestionnaireResult } from '@/clinical/types';

const AUTO_ADVANCE_MS = 350;
/**
 * Gated scales: the full scale opens only when the first `items` answers sum to >= cutoff. `alwaysAsk` lists item
 * indices asked even when the gate stays closed (PHQ item 9: self-harm is screened on every mood check).
 * THS-C asks item C2 only when C1 >= 1.
 */
type Gate = { items: number; cutoff: number; alwaysAsk?: number[] };
const GATE: Partial<Record<QuestionnaireId, Gate>> = { PHQ9: { items: 2, cutoff: 3, alwaysAsk: [8] }, GAD7: { items: 2, cutoff: 3 }, THS: { items: 1, cutoff: 1 } };
const gatedCount = (g: Gate) => g.items + (g.alwaysAsk?.length ?? 0);

export default function QuestionnaireScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { colors, space, radius } = useTheme();
  const assessmentId = useAssessmentId();
  const saveQuestionnaire = useClinical((s) => s.saveQuestionnaire);
  const completeTask = useClinical((s) => s.completeTask);
  const track = useGrowth((s) => s.track);
  const { open, sheet } = useCitation();
  const { finish, inJourney, taskKey } = useJourney();

  const qid = (typeof id === 'string' ? id.toUpperCase() : '') as QuestionnaireId;
  // The THI-S stays unreachable until its item table is verified (sprint 3 A4, `THIS_ENABLED`).
  const q = qid === 'THIS' && !THIS_ENABLED ? undefined : QUESTIONNAIRES[qid];

  // In the guided journey the intro card is skipped (one tap less); the first item carries the scale's purpose.
  const [phase, setPhase] = useState<'intro' | 'items' | 'review' | 'done'>(() => (inJourney ? 'items' : 'intro'));
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(q?.items.length ?? 0).fill(null));
  const [result, setResult] = useState<ReturnType<typeof scoreQuestionnaire> | null>(null);
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  /** Index into gate.alwaysAsk while the screen is closed but mandatory items are still asked; null otherwise. */
  const [tail, setTail] = useState<number | null>(null);
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
      if (gate && tail != null) {
        const nextTail = tail + 1;
        if (gate.alwaysAsk && nextTail < gate.alwaysAsk.length) { setTail(nextTail); setStep(gate.alwaysAsk[nextTail]); }
        else { setTail(null); submit(next.map((a) => a ?? 0), true); }
        return;
      }
      if (gate && step + 1 === gate.items) {
        const screen = next.slice(0, gate.items).reduce<number>((acc, b) => acc + (b ?? 0), 0);
        if (screen < gate.cutoff) {
          if (gate.alwaysAsk?.length) { setTail(0); setStep(gate.alwaysAsk[0]); }
          else submit(next.map((a) => a ?? 0), true);
          return;
        }
      }
      if (step + 1 >= total) setPhase('review'); else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    const gate = GATE[q.id];
    if (gate && tail != null) {
      if (tail > 0 && gate.alwaysAsk) { setTail(tail - 1); setStep(gate.alwaysAsk[tail - 1]); }
      else { setTail(null); setStep(gate.items - 1); }
      return;
    }
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
    // Previous result of the same scale (week 4/8/12 change line) and the merged assessment, read before saving.
    const { assessments: before, program } = useClinical.getState();
    const prev = latestQuestionnaire(before, rec.id);
    setConsequences(consequencesOf(q.id, { total: scored.total, subscales: rec.subscales, answers: filled }, mergedLatest(before), prev, { maintenance: program?.phase === 'maintenance' }));
    saveQuestionnaire(assessmentId, rec);
    if (taskKey) { completeTask(taskKey); track('measurementCompleted'); }
    if (screenedOut) track('questionnaireScreenedOut');
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
            <Text variant="caption" tone="muted">{GATE[q.id] ? t('q.intro.gated', { n: gatedCount(GATE[q.id]!), total }) : t('q.intro.items', { n: total, min: q.minutes })}</Text>
            <EvidenceChip level={q.evidence} onPress={() => open(q.citation)} />
          </View>
          <Text variant="bodySmall" tone="secondary">{t('q.intro.hint')}</Text>
          <Button title={t('q.intro.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' ? (
        <QuestionStep
          index={tail != null && GATE[q.id] ? GATE[q.id]!.items + tail : step}
          total={GATE[q.id] && (tail != null || step < GATE[q.id]!.items) ? gatedCount(GATE[q.id]!) : total}
          stem={pick(q.items[step], locale)}
          hint={GATE[q.id] && tail == null && step === GATE[q.id]!.items ? t('q.gate.expanded', { n: total - GATE[q.id]!.items }) : inJourney && step === 0 && tail == null ? pick(q.description, locale) : undefined}
          onBack={back}
        >
          {optionsFor(q, step).map((o) => (
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
              const opt = optionsFor(q, i).find((o) => o.value === answers[i]);
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
          {consequences.length ? (
            <Card variant="tinted" title={t('q.done.consequences.title')}>
              {consequences.slice(0, 3).map((c) => (
                <View key={c.key} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 8, backgroundColor: c.tone === 'danger' ? colors.danger : c.tone === 'warning' ? colors.warning : c.tone === 'success' ? colors.success : colors.primary }} />
                  <Text variant="body" style={{ flex: 1 }}>{consequenceText(t, c)}</Text>
                </View>
              ))}
            </Card>
          ) : null}
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
