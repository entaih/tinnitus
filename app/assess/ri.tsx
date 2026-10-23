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
import type { SoundSpec } from '@/audio/sounds';
import {
  RI_MASKER_SECONDS, RI_MAX_RATING_SECONDS, RI_MAX_TRIALS_PER_SESSION, RI_RATING_INTERVAL_SEC, capDbFor, dbToVolume, riMaskerLevel,
  scoreResidualInhibition, type RiRating, type RiResult,
} from '@/audio/psychoacoustics';

type Phase = 'intro' | 'baseline' | 'masker' | 'rating' | 'result';
const LAYER_ID = 'ri-masker';
/** Used when the absolute masking level is unknown (e.g. opened from the hub without the MML route param). */
const FALLBACK_MASK_DB = -24;

export default function ResidualInhibitionScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space } = useTheme();
  const params = useLocalSearchParams<{ mask?: string }>();
  const { assessment } = useProfile();
  const maxVolume = useSettings((s) => s.maxVolume);
  const savePsycho = useClinical((s) => s.savePsycho);
  const assessmentId = useAssessmentId();
  const { open, sheet } = useCitation();

  const hasMml = assessment?.psycho?.mmlDb != null || params.mask != null;
  const pitchHz = assessment?.psycho?.pitchHz;
  const capDb = capDbFor(maxVolume);
  const maskDb = Number.isFinite(Number(params.mask)) && params.mask != null ? Number(params.mask) : FALLBACK_MASK_DB;
  const masker = riMaskerLevel(maskDb, capDb);
  const spec: SoundSpec = pitchHz ? { kind: 'narrowband', color: 'white', centerHz: Math.round(pitchHz), octaves: 0.33, seconds: 8 } : { kind: 'noise', color: 'white', seconds: 8 };

  const [phase, setPhase] = useState<Phase>('intro');
  const [baseline, setBaseline] = useState(5);
  const [remaining, setRemaining] = useState(RI_MASKER_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(5);
  const [ratings, setRatings] = useState<RiRating[]>([]);
  const [result, setResult] = useState<RiResult | null>(null);
  const [trials, setTrials] = useState(0);
  const [saved, setSaved] = useState(false);

  const ratingRef = useRef(rating);
  ratingRef.current = rating;
  const ratingsRef = useRef<RiRating[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => { if (tick.current) clearInterval(tick.current); tick.current = null; };
  const stopEverything = useCallback(() => { clearTick(); stopAllOneShots(); void soundEngine.stopAll(); }, []);
  useEffect(() => () => stopEverything(), [stopEverything]);

  const finishRating = useCallback((list: RiRating[], base: number) => {
    clearTick();
    setRatings(list);
    setResult(scoreResidualInhibition(base, list, RI_RATING_INTERVAL_SEC));
    setPhase('result');
  }, []);

  const startRatingPhase = useCallback((base: number) => {
    ratingsRef.current = [];
    setRatings([]);
    setRating(base);
    ratingRef.current = base;
    setElapsed(0);
    setPhase('rating');
    const t0 = Date.now();
    clearTick();
    tick.current = setInterval(() => {
      const e = Math.round((Date.now() - t0) / 1000);
      setElapsed(e);
      if (e > 0 && e % RI_RATING_INTERVAL_SEC === 0) {
        const list = [...ratingsRef.current, { t: e, value: ratingRef.current }];
        ratingsRef.current = list;
        setRatings(list);
        void Haptics.selectionAsync();
      }
      if (e >= RI_MAX_RATING_SECONDS) finishRating(ratingsRef.current, base);
    }, 1000);
  }, [finishRating]);

  const startMasker = async () => {
    if (baseline <= 0) return;
    setTrials((n) => n + 1);
    setSaved(false);
    setResult(null);
    setRemaining(RI_MASKER_SECONDS);
    setPhase('masker');
    try { await soundEngine.play(spec, { id: LAYER_ID, volume: Math.min(maxVolume, dbToVolume(masker.levelDb)) }); } catch (e) { console.warn(e); }
    const t0 = Date.now();
    clearTick();
    tick.current = setInterval(() => {
      const left = RI_MASKER_SECONDS - Math.round((Date.now() - t0) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearTick();
        void soundEngine.stopAll();
        // Ratings are sampled from the slider every 5 s after masker offset; the first one lands at t = 5 s.
        startRatingPhase(baseline);
      }
    }, 1000);
  };

  const returned = () => {
    const list = [...ratingsRef.current, { t: elapsed, value: Math.max(ratingRef.current, baseline) }];
    finishRating(list, baseline);
  };

  const save = () => {
    if (!result || saved) return;
    savePsycho(assessmentId, { residualInhibitionSec: Math.round(result.durationSec), riCategory: result.category });
    setSaved(true);
  };

  const abort = () => { stopEverything(); setPhase('intro'); };

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

  return (
    <Screen>
      <Stack.Screen options={{ title: t('psy.ri.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.ri.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.ri.intro.body')}</Text>
          <Card><Text variant="body">{t('psy.ri.intro.why')}</Text></Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('sendesen2024')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.ri.evidence')}</Text>
          </View>
          {trials >= RI_MAX_TRIALS_PER_SESSION ? <Banner tone="warning" title={t('psy.ri.limit')} /> : null}
          <Button title={t('common.continue')} disabled={trials >= RI_MAX_TRIALS_PER_SESSION} onPress={() => setPhase('baseline')} />
        </>
      )}

      {phase === 'baseline' && (
        <>
          <Text variant="h2">{t('psy.ri.baseline.title')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('psy.ri.baseline.hint')}</Text>
          <Card>{slider(baseline, setBaseline, t('psy.ri.rating.a11y'))}</Card>
          {baseline <= 0 ? <Banner tone="info" title={t('psy.ri.baselineZero')} /> : null}
          <Card variant="tinted">
            <Text variant="bodySmall" tone="secondary">{pitchHz ? t('psy.ri.stimulus.nbn') : t('psy.ri.stimulus.bbn')} · {t('psy.ri.masker.level')}</Text>
            {masker.capped ? <Text variant="bodySmall" tone="secondary">{t('psy.capped')}</Text> : null}
          </Card>
          <Button title={t('psy.ri.startMasker')} disabled={baseline <= 0} onPress={() => void startMasker()} />
          <Button variant="ghost" title={t('common.back')} onPress={() => setPhase('intro')} />
        </>
      )}

      {phase === 'masker' && (
        <>
          <Text variant="overline" tone="secondary">{t('psy.ri.trials', { n: trials })}</Text>
          <Text variant="body" tone="secondary" center>{t('psy.ri.masker.body')}</Text>
          <CountdownRing remaining={remaining} total={RI_MASKER_SECONDS} size={200} caption={t('psy.ri.masker.level')} />
          {masker.capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Button variant="ghost" title={t('psy.stopTest')} onPress={abort} />
        </>
      )}

      {phase === 'rating' && (
        <>
          <Text variant="overline" tone="secondary">{t('psy.ri.elapsed', { s: elapsed })}</Text>
          <Text variant="h2">{t('psy.ri.rating.title')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('psy.ri.rating.hint')} · {t('psy.ri.rating.next', { s: RI_RATING_INTERVAL_SEC - (elapsed % RI_RATING_INTERVAL_SEC) })}</Text>
          <Card>{slider(rating, setRating, t('psy.ri.rating.a11y'))}</Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
            {ratings.map((r) => <Chip key={r.t} small label={`${r.t}s: ${r.value}`} />)}
          </View>
          <Button title={t('psy.ri.returned')} onPress={returned} />
          <Button variant="ghost" title={t('psy.stopTest')} onPress={abort} />
        </>
      )}

      {phase === 'result' && result && (
        <>
          <Text variant="h1">{t('psy.ri.result.title')}</Text>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
              <Text variant="numeric">{t(`psy.ri.cat.${result.category}`)}</Text>
              <Chip tone={result.positive ? 'success' : 'neutral'} label={result.positive ? 'RI +' : 'RI −'} />
            </View>
            <Text variant="bodySmall" tone="secondary">{t('psy.ri.result.duration', { s: Math.round(result.durationSec) })}{result.censored ? ` · ${t('psy.ri.result.censored')}` : ''}</Text>
            <Text variant="bodySmall" tone="secondary">{t('psy.ri.result.depth', { v: Math.round(result.depth * baseline), b: baseline })}</Text>
          </Card>
          <Banner tone={result.positive ? 'success' : 'info'} title={result.positive ? t('psy.ri.interp.positive') : t('psy.ri.interp.negative')} body={t('psy.ri.interp.note')} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('sendesen2024')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.ri.evidence')}</Text>
          </View>
          <Text variant="caption" tone="muted">{t('psy.ri.trials', { n: trials })}</Text>
          <Button title={saved ? t('psy.ri.done') : t('psy.saveFinish')} onPress={() => { save(); router.back(); }} />
          {trials < RI_MAX_TRIALS_PER_SESSION ? <Button variant="secondary" title={t('psy.ri.again')} onPress={() => { stopEverything(); setPhase('baseline'); }} /> : <Banner tone="info" title={t('psy.ri.limit')} />}
          <Disclaimer />
        </>
      )}
      {sheet}
    </Screen>
  );
}
