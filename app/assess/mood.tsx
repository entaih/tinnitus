import React, { useEffect, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Stack } from 'expo-router';
import { CircleCheck, Phone } from 'lucide-react-native';
import { Screen, Text, Card, Button, OptionCard, Banner, EvidenceChip, Disclaimer, useCitation } from '@/components';
import { QuestionStep } from '@/components/assess';
import { useTheme } from '@/theme';
import { useLocale, useT, pick } from '@/i18n';
import { useClinical, latestQuestionnaire, mergedLatest } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { useJourney } from '@/hooks/useJourney';
import { GAD7, PHQ9 } from '@/clinical/questionnaires';
import { consequencesOf, consequenceText, type Consequence } from '@/clinical/consequences';
import { useGrowth } from '@/store/growth';
import type { QuestionnaireResult } from '@/clinical/types';

const AUTO_ADVANCE_MS = 350;
/** Two-item screens open the full scale at ≥ 3 (PHQ-2 / GAD-2, Kroenke 2003 / Kroenke 2007). */
const GATE_CUTOFF = 3;
/** PHQ item 9 (self-harm) is asked on every mood check, whatever the screen says. */
const PHQ_ITEM9 = 8;

type Scale = 'PHQ9' | 'GAD7';
interface MoodItem { scale: Scale; index: number }
const keyOf = (it: MoodItem) => `${it.scale}:${it.index}`;
/** The five base items: PHQ-2, PHQ item 9, GAD-2. */
const BASE_ITEMS: MoodItem[] = [{ scale: 'PHQ9', index: 0 }, { scale: 'PHQ9', index: 1 }, { scale: 'PHQ9', index: PHQ_ITEM9 }, { scale: 'GAD7', index: 0 }, { scale: 'GAD7', index: 1 }];
const PHQ_REST: MoodItem[] = [2, 3, 4, 5, 6, 7].map((index) => ({ scale: 'PHQ9' as const, index }));
const GAD_REST: MoodItem[] = [2, 3, 4, 5, 6].map((index) => ({ scale: 'GAD7' as const, index }));

/**
 * Single mood screen of the guided journey (PM sprint 3 A2): PHQ-2 + PHQ item 9 + GAD-2 on one screen (five items).
 * A screen ≥ 3 opens the remaining items of that scale inline; both results are stored as separate PHQ9 / GAD7
 * records with the same gating semantics as the questionnaire screen (zeros + `{ screen: 2 }` when screened out).
 * Item 9 > 0 keeps the crisis path (112 / 183) unchanged.
 */
export default function MoodScreen() {
  const t = useT();
  const locale = useLocale();
  const { colors, space } = useTheme();
  const assessmentId = useAssessmentId();
  const saveQuestionnaire = useClinical((s) => s.saveQuestionnaire);
  const completeTask = useClinical((s) => s.completeTask);
  const track = useGrowth((s) => s.track);
  const { open, sheet } = useCitation();
  const { finish, taskKey } = useJourney();

  const [phase, setPhase] = useState<'intro' | 'items' | 'more' | 'done'>('intro');
  const [items, setItems] = useState<MoodItem[]>(BASE_ITEMS);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [consequences, setConsequences] = useState<Consequence[]>([]);
  const [crisis, setCrisis] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const scaleOf = (s: Scale) => (s === 'PHQ9' ? PHQ9 : GAD7);
  const sum = (a: Record<string, number>, s: Scale, idx: number[]) => idx.reduce((n, i) => n + (a[`${s}:${i}`] ?? 0), 0);

  const submit = (a: Record<string, number>, list: MoodItem[]) => {
    const asked = (s: Scale) => list.filter((it) => it.scale === s).map((it) => it.index);
    const { assessments: before, program } = useClinical.getState();
    const merged = mergedLatest(before);
    const out: Consequence[] = [];
    for (const s of ['PHQ9', 'GAD7'] as const) {
      const q = scaleOf(s);
      const filled = q.items.map((_, i) => a[`${s}:${i}`] ?? 0);
      const screenedOut = asked(s).length <= (s === 'PHQ9' ? 3 : 2);
      const rec: QuestionnaireResult = { id: s, date: new Date().toISOString(), answers: filled, total: filled.reduce((x, y) => x + y, 0), subscales: screenedOut ? { screen: 2 } : undefined };
      out.push(...consequencesOf(s, { total: rec.total, subscales: rec.subscales, answers: filled }, merged, latestQuestionnaire(before, s), { maintenance: program?.phase === 'maintenance' }));
      saveQuestionnaire(assessmentId, rec);
      if (screenedOut) track('questionnaireScreenedOut');
    }
    if (taskKey) { completeTask(taskKey); track('measurementCompleted'); }
    setCrisis((a[`PHQ9:${PHQ_ITEM9}`] ?? 0) > 0);
    setConsequences(out);
    setPhase('done');
  };

  const select = (value: number) => {
    const it = items[step];
    const next = { ...answers, [keyOf(it)]: value };
    setAnswers(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      let list = items;
      // After the five base items: open the rest of each scale whose two-item screen is positive.
      if (step + 1 === BASE_ITEMS.length && list.length === BASE_ITEMS.length) {
        const extra: MoodItem[] = [];
        if (sum(next, 'PHQ9', [0, 1]) >= GATE_CUTOFF) extra.push(...PHQ_REST);
        if (sum(next, 'GAD7', [0, 1]) >= GATE_CUTOFF) extra.push(...GAD_REST);
        if (extra.length) {
          list = [...list, ...extra]; setItems(list);
          // Explain the extension before the counter jumps from 5 to the longer total.
          setStep(step + 1); setPhase('more');
          return;
        }
      }
      if (step + 1 >= list.length) submit(next, list); else setStep(step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (step === 0) { setPhase('intro'); return; }
    // Going back from the first extra item returns to the explanation, from there to the last base item.
    if (step === BASE_ITEMS.length && items.length > BASE_ITEMS.length && phase === 'items') { setPhase('more'); return; }
    setStep(step - 1);
  };
  const backFromMore = () => { setItems(BASE_ITEMS); setStep(BASE_ITEMS.length - 1); setPhase('items'); };
  const extraCount = items.length - BASE_ITEMS.length;
  const extraScales = Array.from(new Set(items.slice(BASE_ITEMS.length).map((it) => it.scale)));
  const inExtra = step >= BASE_ITEMS.length && extraCount > 0;

  const call = (num: string) => { void Linking.openURL(`tel:${num}`); };
  const current = items[step];
  const q = current ? scaleOf(current.scale) : PHQ9;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('mood.title') }} />

      {phase === 'intro' ? (
        <Card>
          <Text variant="h2">{t('mood.intro.title')}</Text>
          <Text variant="body" tone="secondary">{t('mood.intro.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
            <Text variant="caption" tone="muted">{t('mood.intro.items', { n: BASE_ITEMS.length })}</Text>
            <EvidenceChip level="guideline" onPress={() => open(PHQ9.citation)} />
          </View>
          <Text variant="bodySmall" tone="secondary">{t('q.intro.hint')}</Text>
          <Button title={t('q.intro.start')} onPress={() => { setStep(0); setPhase('items'); }} />
        </Card>
      ) : null}

      {phase === 'items' && current ? (
        <QuestionStep
          index={inExtra ? step - BASE_ITEMS.length : step}
          total={inExtra ? extraCount : BASE_ITEMS.length}
          progressLabel={inExtra ? t('mood.more.progress', { n: step - BASE_ITEMS.length + 1, total: extraCount }) : undefined}
          stem={pick(q.items[current.index], locale)}
          hint={pick(q.description, locale)}
          onBack={back}
        >
          {q.options.map((o) => (
            <OptionCard key={o.value} label={pick(o, locale)} selected={answers[keyOf(current)] === o.value} onPress={() => select(o.value)} />
          ))}
        </QuestionStep>
      ) : null}

      {phase === 'more' ? (
        <Card>
          <Text variant="h2">{t('mood.more.title')}</Text>
          <Text variant="body" tone="secondary">
            {t(extraScales.length === 2 ? 'mood.more.body.both' : extraScales[0] === 'PHQ9' ? 'mood.more.body.phq' : 'mood.more.body.gad', { n: extraCount })}
          </Text>
          <Text variant="bodySmall" tone="secondary">{t('mood.more.note')}</Text>
          <Button title={t('mood.more.cta', { n: extraCount })} onPress={() => setPhase('items')} />
          <Button variant="ghost" size="sm" title={t('common.back')} onPress={backFromMore} />
        </Card>
      ) : null}

      {phase === 'done' ? (
        <View style={{ gap: space[4] }}>
          {crisis ? (
            <Banner tone="danger" title={t('q.crisis.title')} body={t('q.crisis.body')} primary={{ title: t('triage.call112'), onPress: () => call('112') }} />
          ) : null}
          <Card>
            <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
              <CircleCheck size={28} color={colors.success} />
              <Text variant="h2" style={{ flex: 1 }}>{t('mood.done.title')}</Text>
            </View>
            <Text variant="body" tone="secondary">{t('mood.done.body')}</Text>
          </Card>
          {consequences.length ? (
            <Card variant="tinted" title={t('q.done.consequences.title')}>
              {consequences.slice(0, 4).map((c) => (
                <View key={c.key} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 8, backgroundColor: c.tone === 'danger' ? colors.danger : c.tone === 'warning' ? colors.warning : c.tone === 'success' ? colors.success : colors.primary }} />
                  <Text variant="body" style={{ flex: 1 }}>{consequenceText(t, c)}</Text>
                </View>
              ))}
            </Card>
          ) : null}
          {crisis ? <Button variant="secondary" title={t('triage.call183')} icon={<Phone size={18} color={colors.primaryPressed} />} onPress={() => call('183')} /> : null}
          <Button title={t('common.continue')} onPress={() => finish()} />
          <Disclaimer />
        </View>
      ) : null}
      {sheet}
    </Screen>
  );
}
