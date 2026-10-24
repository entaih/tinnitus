import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import { Banner, Button, Card, Chip, Disclaimer, EvidenceChip, Screen, Text, useCitation } from '@/components';
import { CountdownRing } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { stopAllOneShots } from '@/audio/psychoPlayer';
import {
  RI_CONFIRM_WINDOW_SEC, RI_MASKER_SECONDS, RI_MAX_RATING_SECONDS, RI_RATING_INTERVAL_SEC, capDbFor, dbToVolume, maskerSpec, riHyperacusisGate,
  riMaskerLevel, riMaxTrials, riRatingSchedule, scoreResidualInhibition, type MmlStimulus, type RiRating, type RiResult,
} from '@/audio/psychoacoustics';

type Phase = 'intro' | 'baseline' | 'masker' | 'rating' | 'result';
const LAYER_ID = 'ri-masker';
/** Used when the absolute masking level is unknown (e.g. opened from the hub without the MML route param). */
const FALLBACK_MASK_DB = -24;
const TICK_MS = 250;

/**
 * Residual inhibition with the same stimulus as the MML (NBN at the pitch or broadband), masker at MML + 10 dB
 * (MML + 5 dB and a single trial under the hyperacusis gate), ratings at 2 s then every 5 s with an active
 * confirmation prompt; an unconfirmed sample is recorded as missing and censors the duration.
 */
export default function ResidualInhibitionScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space } = useTheme();
  const params = useLocalSearchParams<{ mask?: string; stim?: string; hz?: string }>();
  const { assessment } = useProfile();
  const maxVolume = useSettings((s) => s.maxVolume);
  const savePsycho = useClinical((s) => s.savePsycho);
  const assessmentId = useAssessmentId();
  const { open, sheet } = useCitation();

  const psycho = assessment?.psycho;
  const hasMml = psycho?.mmlDb != null || params.mask != null;
  const capDb = capDbFor(maxVolume);
  const maskDb = Number.isFinite(Number(params.mask)) && params.mask != null ? Number(params.mask) : FALLBACK_MASK_DB;

  // Stimulus: the one the MML was taken with (route param → saved record → pitch fallback).
  const stimParam: MmlStimulus | undefined = params.stim === 'nbn' || params.stim === 'bbn' ? params.stim : undefined;
  const stimulus: MmlStimulus = stimParam ?? psycho?.mmlStimulus ?? (psycho?.pitchHz ? 'nbn' : 'bbn');
  const hzParam = Number(params.hz) > 0 ? Number(params.hz) : undefined;
  const centerHz = stimulus === 'nbn' ? (hzParam ?? psycho?.mmlCenterHz ?? psycho?.pitchHz) : undefined;
  const masker = maskerSpec(stimulus === 'nbn' ? centerHz : undefined);

  // Hyperacusis gate: HQ ≥ 28 or early-discomfort LDL record → MML + 5 dB and one trial only.
  const hqTotal = assessment?.questionnaires.find((q) => q.id === 'HQ')?.total ?? null;
  const hyperacusis = riHyperacusisGate(hqTotal, assessment?.exam?.ldlLow);
  const level = riMaskerLevel(maskDb, capDb, { hyperacusis });
  const maxTrials = riMaxTrials(hyperacusis);
  const schedule = riRatingSchedule(RI_MAX_RATING_SECONDS);

  const [phase, setPhase] = useState<Phase>('intro');
  const [baseline, setBaseline] = useState(5);
  const [remaining, setRemaining] = useState(RI_MASKER_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(5);
  const [ratings, setRatings] = useState<RiRating[]>([]);
  const [missed, setMissed] = useState(0);
  /** Pending confirmation prompt: scheduled time and the deadline (ms epoch). */
  const [prompt, setPrompt] = useState<{ t: number; until: number } | null>(null);
  const [result, setResult] = useState<RiResult | null>(null);
  const [trials, setTrials] = useState(0);
  const [saved, setSaved] = useState(false);

  const ratingRef = useRef(rating);
  ratingRef.current = rating;
  const ratingsRef = useRef<RiRating[]>([]);
  const promptRef = useRef<{ t: number; until: number } | null>(null);
  const scheduleIndex = useRef(0);
  const missedRef = useRef(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => { if (tick.current) clearInterval(tick.current); tick.current = null; };
  const stopEverything = useCallback(() => { clearTick(); stopAllOneShots(); void soundEngine.stopAll(); }, []);
  useEffect(() => () => stopEverything(), [stopEverything]);

  const finishRating = useCallback((list: RiRating[], base: number) => {
    clearTick();
    promptRef.current = null; setPrompt(null);
    setRatings(list);
    setResult(scoreResidualInhibition(base, list, RI_RATING_INTERVAL_SEC));
    setPhase('result');
  }, []);

  const startRatingPhase = useCallback((base: number) => {
    ratingsRef.current = []; setRatings([]);
    missedRef.current = 0; setMissed(0);
    scheduleIndex.current = 0;
    promptRef.current = null; setPrompt(null);
    setRating(base); ratingRef.current = base;
    setElapsed(0);
    setPhase('rating');
    const t0 = Date.now();
    clearTick();
    tick.current = setInterval(() => {
      const now = Date.now();
      const e = (now - t0) / 1000;
      setElapsed(Math.floor(e));
      // Expire an unanswered prompt → missing sample (censored).
      if (promptRef.current && now > promptRef.current.until) {
        promptRef.current = null; setPrompt(null);
        missedRef.current += 1; setMissed(missedRef.current);
      }
      // Open the next scheduled prompt.
      const nextT = schedule[scheduleIndex.current];
      if (nextT != null && e >= nextT && !promptRef.current) {
        scheduleIndex.current += 1;
        promptRef.current = { t: nextT, until: now + RI_CONFIRM_WINDOW_SEC * 1000 };
        setPrompt(promptRef.current);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      if (e >= RI_MAX_RATING_SECONDS) finishRating(ratingsRef.current, base);
    }, TICK_MS);
  }, [finishRating, schedule]);

  const startMasker = async () => {
    if (baseline <= 0 || trials >= maxTrials) return;
    setTrials((n) => n + 1);
    setSaved(false);
    setResult(null);
    setRemaining(RI_MASKER_SECONDS);
    setPhase('masker');
    try { await soundEngine.play(masker.spec, { id: LAYER_ID, volume: Math.min(maxVolume, dbToVolume(level.levelDb)) }); } catch (e) { console.warn(e); }
    const t0 = Date.now();
    clearTick();
    tick.current = setInterval(() => {
      const left = RI_MASKER_SECONDS - Math.round((Date.now() - t0) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearTick();
        void soundEngine.stopAll();
        startRatingPhase(baseline);
      }
    }, 1000);
  };

  /** Active confirmation: record the slider value for the scheduled time of the open prompt. */
  const confirmRating = () => {
    const p = promptRef.current;
    if (!p) return;
    void Haptics.selectionAsync();
    const list = [...ratingsRef.current, { t: p.t, value: ratingRef.current }];
    ratingsRef.current = list; setRatings(list);
    promptRef.current = null; setPrompt(null);
  };

  const returned = () => {
    const list = [...ratingsRef.current, { t: Math.floor(elapsed), value: Math.max(ratingRef.current, baseline) }];
    finishRating(list, baseline);
  };

  const save = () => {
    if (!result || saved) return;
    savePsycho(assessmentId, {
      riPositive: result.positive,
      riDepth: Math.round(result.depth * 100) / 100,
      riCategory: result.category,
      residualInhibitionSec: Math.round(result.durationSec),
    });
    setSaved(true);
  };

  const abort = () => { stopEverything(); promptRef.current = null; setPrompt(null); setPhase('intro'); };

  if (!hasMml) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('psy.ri.title') }} />
        <Text variant="h1">{t('psy.ri.title')}</Text>
        <Banner tone="info" title={t('psy.ri.noMml')} />
        <Button title={t('psy.ri.goMml')} onPress={() => router.replace('/assess/mml')} />
      </Screen>
    );
  }

  const slider = (value: number, onChange: (v: number) => void, label: string) => (
    <View style={{ gap: space[1] }}>
      <Text variant="numeric" center accessibilityLiveRegion="polite">{value}</Text>
      <Slider style={{ height: 44 }} minimumValue={0} maximumValue={10} step={1} value={value} onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.card}
        accessibilityLabel={label} accessibilityValue={{ text: `${value} / 10` }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">0</Text>
        <Text variant="caption" tone="muted">10</Text>
      </View>
    </View>
  );

  const stimulusLabel = stimulus === 'nbn' ? t('psy.ri.stimulus.nbn', { hz: masker.centerHz ?? 0 }) : t('psy.ri.stimulus.bbn');
  const levelLabel = t('psy.ri.masker.level', { db: level.aboveMmlDb });
  const nextT = schedule[scheduleIndex.current];
  const trialsLabel = t('psy.ri.trials', { n: trials, max: maxTrials });

  return (
    <Screen>
      <Stack.Screen options={{ title: t('psy.ri.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.ri.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.ri.intro.body')}</Text>
          <Card><Text variant="body">{t('psy.ri.intro.why')}</Text></Card>
          <Banner tone="info" title={t('psy.ri.rebound.title')} body={t('psy.ri.rebound.body')} />
          {hyperacusis ? <Banner tone="warning" title={t('psy.ri.hyper.title')} body={t('psy.ri.hyper.body')} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('sendesen2024')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.ri.evidence')}</Text>
          </View>
          {trials >= maxTrials ? <Banner tone="warning" title={t('psy.ri.limit', { max: maxTrials })} /> : null}
          <Button title={t('common.continue')} disabled={trials >= maxTrials} onPress={() => setPhase('baseline')} />
        </>
      )}

      {phase === 'baseline' && (
        <>
          <Text variant="h2">{t('psy.ri.baseline.title')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('psy.ri.baseline.hint')}</Text>
          <Card>{slider(baseline, setBaseline, t('psy.ri.rating.a11y'))}</Card>
          {baseline <= 0 ? <Banner tone="info" title={t('psy.ri.baselineZero')} /> : null}
          <Card variant="tinted">
            <Text variant="bodySmall" tone="secondary">{stimulusLabel} · {levelLabel}</Text>
            <Text variant="caption" tone="muted">{t('psy.ri.schedule')}</Text>
            {level.capped ? <Text variant="bodySmall" tone="secondary">{t('psy.capped')}</Text> : null}
          </Card>
          <Button title={t('psy.ri.startMasker')} disabled={baseline <= 0} onPress={() => void startMasker()} />
          <Button variant="ghost" title={t('common.back')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'masker' && (
        <>
          <Text variant="overline" tone="secondary">{trialsLabel}</Text>
          <Text variant="body" tone="secondary" center>{t('psy.ri.masker.body')}</Text>
          <CountdownRing remaining={remaining} total={RI_MASKER_SECONDS} size={200} caption={levelLabel} />
          {level.capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Button variant="ghost" title={t('psy.stopTest')} onPress={abort} />
        </>
      )}

      {phase === 'rating' && (
        <>
          <Text variant="overline" tone="secondary">{t('psy.ri.elapsed', { s: elapsed })}</Text>
          <Text variant="h2">{t('psy.ri.rating.title')}</Text>
          <Text variant="bodySmall" tone="secondary" accessibilityLiveRegion="polite">
            {prompt ? t('psy.ri.rating.confirmHint', { s: Math.max(0, Math.ceil((prompt.until - Date.now()) / 1000)) }) : nextT != null ? t('psy.ri.rating.next', { s: Math.max(0, Math.ceil(nextT - elapsed)) }) : ' '}
          </Text>
          <Card variant={prompt ? 'tinted' : 'default'}>
            {slider(rating, setRating, t('psy.ri.rating.a11y'))}
            <Text variant="caption" tone="muted">{t('psy.ri.rating.hint')}</Text>
          </Card>
          <Button title={prompt ? t('psy.ri.rating.now') : t('psy.ri.rating.wait')} disabled={!prompt} onPress={confirmRating} style={{ minHeight: 72 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
            {ratings.map((r) => <Chip key={r.t} small label={`${r.t}s: ${r.value}`} />)}
            {missed > 0 ? <Chip small tone="warning" label={t('psy.ri.rating.missed', { n: missed })} /> : null}
          </View>
          <Button variant="secondary" title={t('psy.ri.returned')} onPress={returned} />
          <Button variant="ghost" title={t('psy.stopTest')} onPress={abort} />
        </>
      )}

      {phase === 'result' && result && (
        <>
          <Text variant="h1">{t('psy.ri.result.title')}</Text>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
              <Chip tone={result.positive ? 'success' : 'neutral'} label={result.positive ? t('psy.ri.badge.positive') : t('psy.ri.badge.negative')} />
              <Text variant="bodyStrong">{t('psy.ri.result.category', { c: t(`psy.ri.cat.${result.category}`) })}</Text>
            </View>
            <Text variant="bodySmall" tone="secondary">{t('psy.ri.result.duration', { s: Math.round(result.durationSec) })}{result.censored ? ` · ${t('psy.ri.result.censored')}` : ''}</Text>
            <Text variant="bodySmall" tone="secondary">{t('psy.ri.result.depth', { v: Math.round(result.depth * baseline), b: baseline, pct: Math.round(result.depth * 100) })}</Text>
            {missed > 0 ? <Text variant="bodySmall" tone="secondary">{t('psy.ri.rating.missed', { n: missed })}</Text> : null}
            {result.rebound ? <Text variant="bodySmall" tone="secondary">{t('psy.ri.result.rebound')}</Text> : null}
            <Text variant="caption" tone="muted">{stimulusLabel} · {levelLabel} · {RI_MASKER_SECONDS} s</Text>
          </Card>
          <Banner tone={result.positive ? 'success' : 'info'} title={result.positive ? t('psy.ri.interp.positive') : t('psy.ri.interp.negative')} body={t('psy.ri.interp.note')} />
          <Text variant="bodySmall" tone="secondary">{t('psy.ri.rebound.body')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('sendesen2024')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.ri.evidence')}</Text>
          </View>
          <Text variant="caption" tone="muted">{trialsLabel}</Text>
          <Button title={saved ? t('psy.ri.done') : t('psy.saveFinish')} onPress={() => { save(); router.back(); }} />
          {trials < maxTrials ? <Button variant="secondary" title={t('psy.ri.again')} onPress={() => { stopEverything(); setPhase('baseline'); }} /> : <Banner tone="info" title={t('psy.ri.limit', { max: maxTrials })} />}
          <Disclaimer />
        </>
      )}
      {sheet}
    </Screen>
  );
}
