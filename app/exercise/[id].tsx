import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Card, Button, Banner, Chip, EvidenceChip, Disclaimer, useCitation } from '@/components';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { EXERCISES, SELF_TEST, getExercise, selfTestPositive, sideText, stepSeconds, type ExerciseStep, type ModulationRating } from '@/content/exercises';
import { citation } from '@/content/citations';
import { ExercisePose, hasExercisePose } from '@/components/illustrations';

/** Movement drawing for a step, on a card-coloured panel; nothing when the step has no drawing. */
function PoseCard({ id, side }: { id: string; side?: 'left' | 'right' }) {
  const { colors, radius, space } = useTheme();
  const { width } = useWindowDimensions();
  if (!hasExercisePose(id)) return null;
  const w = Math.min(340, Math.max(240, width - 2 * space[6]));
  return (
    <View style={{ alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: space[2], borderWidth: 1, borderColor: colors.border }}>
      <ExercisePose id={id} side={side} width={w} />
    </View>
  );
}

/** Somatic exercise player for somatic.* ids, plus the somatic-modulation self-test at /exercise/selftest. */
export default function ExerciseScreen() {
  const { id, taskKey } = useLocalSearchParams<{ id: string; taskKey?: string }>();
  const t = useT();
  if (id === 'selftest') return <SelfTest />;
  const ex = getExercise(String(id));
  if (!ex) return (<><Stack.Screen options={{ title: t('mind.exercises.title') }} /><Screen><Text variant="body">{t('somatic.notFound')}</Text></Screen></>);
  return <Player id={ex.id} taskKey={typeof taskKey === 'string' ? taskKey : undefined} />;
}

function Player({ id, taskKey }: { id: keyof typeof EXERCISES; taskKey?: string }) {
  const ex = EXERCISES[id];
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const { logSession, completeTask } = useClinical();
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [side, setSide] = useState<0 | 1>(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  useKeepAwake();

  const step = ex.steps[index];
  const totalMin = useMemo(() => Math.round(ex.steps.reduce((a, s) => a + stepSeconds(s), 0) / 60), [ex]);
  const clear = () => { if (iv.current) clearInterval(iv.current); iv.current = null; setRunning(false); };
  useEffect(() => clear, []);

  const startTimer = (sec: number) => {
    clear(); setRemaining(sec); setRunning(true);
    iv.current = setInterval(() => setRemaining((r) => { if (r <= 1) { clear(); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); return 0; } return r - 1; }), 1000);
  };
  const goTo = (i: number) => {
    clear(); setSide(0);
    if (i >= ex.steps.length) { finish(); return; }
    setIndex(i); setRemaining(ex.steps[i].seconds ?? 0);
    void Haptics.selectionAsync();
  };
  const next = () => {
    if (step.perSide && side === 0) { setSide(1); clear(); setRemaining(step.seconds ?? 0); void Haptics.selectionAsync(); return; }
    goTo(index + 1);
  };
  const finish = () => {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    logSession({ type: 'exercise', minutes: Math.min(minutes, 60), detail: ex.id });
    if (taskKey) completeTask(taskKey);
    setPhase('done');
  };
  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const meta = (s: ExerciseStep) => {
    const parts: string[] = [];
    if (s.reps) parts.push(t('somatic.reps', { n: s.reps }));
    if (s.sets) parts.push(t('somatic.sets', { n: s.sets }));
    if (s.mode === 'reps' && s.seconds) parts.push(t('somatic.hold', { n: s.seconds }));
    if (s.mode === 'timer' && s.seconds) parts.push(t('somatic.seconds', { n: s.seconds }));
    if (s.perSide) parts.push(t('somatic.perSide'));
    return parts.join(' · ');
  };

  const header = <Stack.Screen options={{ title: ex.title[locale] }} />;
  const stopBanner = (
    <Card variant="outlined" title={t('somatic.stopRules')}>
      {ex.stopRules.map((r, i) => <Text key={i} variant="bodySmall">• {r[locale]}</Text>)}
    </Card>
  );

  if (phase === 'intro') return (
    <>
      {header}
      <Screen footer={<Button title={t('somatic.start')} onPress={() => { startedAt.current = Date.now(); setPhase('run'); goTo(0); }} />}>
        <Text variant="h1" accessibilityRole="header">{ex.title[locale]}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
          <Chip label={t('somatic.label')} tone="warning" />
          <Chip label={`${totalMin} ${t('sleep.diary.min')}`} />
          <Chip label={t('somatic.steps', { n: ex.steps.length })} />
          {ex.citations.map((c) => { const cit = citation(c); return cit ? <EvidenceChip key={c} level={cit.level} onPress={() => open(c)} /> : null; })}
        </View>
        <Text variant="body" tone="secondary">{ex.intro[locale]}</Text>
        <Banner tone="info" title={t('somatic.label')} body={ex.disclaimer[locale]} />
        <Card title={t('somatic.frequency')}><Text variant="bodySmall">{ex.frequency[locale]}</Text></Card>
        <Card title={t('somatic.progression')}><Text variant="bodySmall">{ex.progression[locale]}</Text></Card>
        {stopBanner}
        <Card>
          {ex.steps.map((s, i) => (
            <View key={s.id} style={{ flexDirection: 'row', gap: space[3], minHeight: 44, alignItems: 'center' }}>
              <Text variant="caption" tone="muted" style={{ minWidth: 20 }}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{s.name[locale]}</Text>
                <Text variant="caption" tone="secondary">{s.mode === 'read' ? t('somatic.readStep') : meta(s)}</Text>
              </View>
            </View>
          ))}
        </Card>
        <Disclaimer textKey="disclaimer.short" />
        {sheet}
      </Screen>
    </>
  );

  if (phase === 'done') return (
    <>
      {header}
      <Screen footer={<Button title={t('common.done')} onPress={() => router.back()} />}>
        <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[8] }} accessibilityLiveRegion="polite">
          <CheckCircle2 size={72} color={colors.success} />
          <Text variant="h2">{t('somatic.done')}</Text>
          <Text variant="bodySmall" tone="secondary" center>{t('somatic.doneBody', { n: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)) })}</Text>
        </View>
        {stopBanner}
      </Screen>
    </>
  );

  const progress = (index + (step.perSide && side === 1 ? 0.5 : 0)) / ex.steps.length;
  return (
    <>
      {header}
      <Screen footer={(
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Button style={{ flex: 1 }} variant="ghost" title={t('somatic.prev')} disabled={index === 0 && side === 0} onPress={() => (side === 1 ? (setSide(0), clear()) : goTo(index - 1))} />
          <Button style={{ flex: 2 }} title={index === ex.steps.length - 1 && (!step.perSide || side === 1) ? t('somatic.finish') : t('somatic.next')} onPress={next} />
        </View>
      )}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
        <Text variant="caption" tone="secondary">{t('somatic.step', { i: index + 1, n: ex.steps.length })}{step.perSide ? ` · ${side === 0 ? t('somatic.side.left') : t('somatic.side.right')}` : ''}</Text>
        <Text variant="h2" accessibilityRole="header">{step.name[locale]}</Text>
        {step.mode !== 'read' ? <Chip label={meta(step)} tone="primary" /> : null}
        <PoseCard key={`${step.id}-${side}`} id={step.id} side={side === 0 ? 'left' : 'right'} />
        <Card variant="tinted"><Text variant="body">{sideText(step.instruction[locale], step.perSide && side === 1 ? 1 : 0, locale)}</Text></Card>

        {step.mode === 'timer' ? (
          <View style={{ alignItems: 'center', gap: space[3] }}>
            <Text variant="numeric" accessibilityLiveRegion="polite">{mm(remaining)}</Text>
            {!running ? <Button variant="secondary" title={remaining > 0 && remaining < (step.seconds ?? 0) ? t('common.continue') : t('common.start')} onPress={() => startTimer(remaining > 0 ? remaining : step.seconds ?? 60)} />
              : <Button variant="ghost" title={t('common.pause')} onPress={clear} />}
          </View>
        ) : null}
        {step.mode === 'reps' ? (
          <RepCounter key={`${index}-${side}`} reps={step.reps ?? 10} holdSec={step.seconds} sets={step.sets ?? 1} />
        ) : null}
        {step.mode === 'read' ? <Text variant="caption" tone="secondary">{t('somatic.readStep')}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => goTo(ex.steps.length)} style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'center', paddingHorizontal: space[4], borderRadius: radius.full }}>
          <Text variant="bodySmall" tone="secondary">{t('common.stop')}</Text>
        </Pressable>
      </Screen>
    </>
  );
}

/** Tap-to-count rep counter with optional hold timer per rep. */
function RepCounter({ reps, holdSec, sets }: { reps: number; holdSec?: number; sets: number }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [count, setCount] = useState(0);
  const [set, setSet] = useState(1);
  const [hold, setHold] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);
  const tap = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (holdSec) {
      if (iv.current) clearInterval(iv.current);
      setHold(holdSec);
      iv.current = setInterval(() => setHold((h) => { if (h <= 1) { if (iv.current) clearInterval(iv.current); void Haptics.selectionAsync(); return 0; } return h - 1; }), 1000);
    }
    setCount((c) => {
      if (c + 1 >= reps) { if (set < sets) { setSet(set + 1); return 0; } return reps; }
      return c + 1;
    });
  };
  const total = reps;
  return (
    <View style={{ alignItems: 'center', gap: space[3] }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${count} / ${total}`} onPress={tap}
        style={({ pressed }) => ({ width: 132, height: 132, borderRadius: 66, backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
        <Text variant="numeric" tone="primary">{count}</Text>
        <Text variant="caption" tone="secondary">/ {total}</Text>
      </Pressable>
      {hold > 0 ? <View style={{ paddingHorizontal: space[3], paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.accentSoft }}><Text variant="caption" tone="accent">{t('somatic.hold', { n: hold })}</Text></View> : null}
      <Text variant="caption" tone="secondary">{sets > 1 ? `${t('somatic.sets', { n: sets })} · ${set}/${sets} · ` : ''}{t('somatic.countReps')}</Text>
    </View>
  );
}

function SelfTest() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const logSession = useClinical((s) => s.logSession);
  const saveExam = useClinical((s) => s.saveExam);
  const examAssessmentId = useAssessmentId();
  const [i, setI] = useState(0);
  const [ratings, setRatings] = useState<Record<string, ModulationRating | undefined>>({});
  const [remaining, setRemaining] = useState(0);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);
  const m = SELF_TEST.manoeuvres[i];
  const startHold = () => {
    if (iv.current) clearInterval(iv.current);
    setRemaining(m.seconds);
    iv.current = setInterval(() => setRemaining((r) => { if (r <= 1) { if (iv.current) clearInterval(iv.current); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); return 0; } return r - 1; }), 1000);
  };
  const rate = (r: ModulationRating) => {
    const next = { ...ratings, [m.id]: r };
    setRatings(next);
    if (i + 1 >= SELF_TEST.manoeuvres.length) setDone(true); else { setI(i + 1); setRemaining(0); }
  };
  const positive = selfTestPositive(ratings);
  const changed = Object.values(ratings).filter((r) => r && r !== 'same').length;

  if (done) return (
    <>
      <Stack.Screen options={{ title: SELF_TEST.title[locale] }} />
      <Screen footer={<Button title={saved ? t('common.done') : t('somatic.selfTest.save')} onPress={() => { if (!saved) { logSession({ type: 'selfTest', minutes: 3, detail: JSON.stringify({ positive, ratings }) }); saveExam(examAssessmentId, { somaticPositive: positive }); setSaved(true); } else router.back(); }} />}>
        <Text variant="h1">{t('somatic.selfTest.result')}</Text>
        <Chip label={positive ? t('somatic.selfTest.positive') : t('somatic.selfTest.negative')} tone={positive ? 'warning' : 'success'} />
        <Text variant="bodySmall" tone="secondary">{t('somatic.selfTest.changed', { n: changed })}</Text>
        <Card variant="tinted"><Text variant="body">{positive ? SELF_TEST.interpretation.positive[locale] : SELF_TEST.interpretation.negative[locale]}</Text></Card>
        <Text variant="bodySmall" tone="secondary">{SELF_TEST.interpretation.note[locale]}</Text>
        <View style={{ flexDirection: 'row', gap: space[2], flexWrap: 'wrap' }}>
          {SELF_TEST.citations.map((c) => { const cit = citation(c); return cit ? <EvidenceChip key={c} level={cit.level} onPress={() => open(c)} /> : null; })}
        </View>
        {positive ? <Button variant="secondary" title={t('mind.exercises.cervical')} onPress={() => router.replace('/exercise/somatic.cervical')} /> : null}
        {saved ? <Text variant="caption" tone="success">{t('somatic.selfTest.saved')}</Text> : null}
        <Disclaimer textKey="disclaimer.short" />
        {sheet}
      </Screen>
    </>
  );

  return (
    <>
      <Stack.Screen options={{ title: SELF_TEST.title[locale] }} />
      <Screen>
        {i === 0 && !ratings[m.id] ? <Text variant="bodySmall" tone="secondary">{SELF_TEST.intro[locale]}</Text> : null}
        <Text variant="caption" tone="secondary">{t('somatic.step', { i: i + 1, n: SELF_TEST.manoeuvres.length })}</Text>
        <Text variant="h2" accessibilityRole="header">{m.name[locale]}</Text>
        <PoseCard id={m.id} />
        <Card variant="tinted"><Text variant="body">{m.instruction[locale]}</Text></Card>
        <View style={{ alignItems: 'center', gap: space[2] }}>
          <Text variant="numeric" accessibilityLiveRegion="polite">{remaining > 0 ? remaining : m.seconds}</Text>
          <Button variant="secondary" title={t('common.start')} onPress={startHold} />
        </View>
        <Text variant="bodyStrong">{t('somatic.selfTest.rate')}</Text>
        <View style={{ gap: space[2] }}>
          {(Object.keys(SELF_TEST.ratings) as ModulationRating[]).map((r) => (
            <Pressable key={r} accessibilityRole="button" onPress={() => rate(r)}
              style={({ pressed }) => ({ minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: space[4], justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
              <Text variant="bodyStrong">{SELF_TEST.ratings[r][locale]}</Text>
            </Pressable>
          ))}
          <Button variant="ghost" title={t('somatic.selfTest.skip')} onPress={() => rate('same')} />
        </View>
      </Screen>
    </>
  );
}
