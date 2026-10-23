import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Ear, Headphones } from 'lucide-react-native';
import { Banner, Button, Card, Disclaimer, EvidenceChip, OptionCard, Screen, Text, useCitation } from '@/components';
import { AudiogramChart, type AudiogramPoint } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { hearingAsymmetry, noiseNotch, pta4 } from '@/clinical/engine';
import type { Assessment, HearingScreenResult } from '@/clinical/types';
import { soundEngine } from '@/audio/engine';
import { playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import {
  HEARING_SEARCH, SCREENING_FREQS, applyLevelCap, capDbFor, randomGapMs, respondThreshold, startThresholdSearch,
  type ThresholdSearchState,
} from '@/audio/psychoacoustics';

type Phase = 'intro' | 'mode' | 'prepare' | 'testing' | 'result';
type Mode = 'separate' | 'both';
type EarKey = 'right' | 'left' | 'both';
/** freq → threshold dB (null = not heard at the safe cap) */
type EarThresholds = Record<number, number | null>;

const BURST_MS = 1000;
const RESPONSE_MS = 2000;
const GAP_MIN_MS = 1000;
const GAP_MAX_MS = 2000;
/** Heuristic: an average threshold within 25 dB of the device cap is "high" for an uncalibrated phone. */
const HIGH_PTA_DB = -25;

export default function HearingScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space, radius } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ ok?: string }>();
  const ambientOk = params.ok === '1';
  const maxVolume = useSettings((s) => s.maxVolume);
  const saveHearing = useClinical((s) => s.saveHearing);
  const assessmentId = useAssessmentId();
  const { open, sheet } = useCitation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('separate');
  const [earIndex, setEarIndex] = useState(0);
  const [freqIndex, setFreqIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [capped, setCapped] = useState(false);
  const [results, setResults] = useState<Partial<Record<EarKey, EarThresholds>>>({});
  const [saved, setSaved] = useState(false);

  const ears: EarKey[] = mode === 'separate' ? ['right', 'left'] : ['both'];
  const currentEar = ears[earIndex];

  const cancelled = useRef(false);
  const responder = useRef<((heard: boolean) => void) | null>(null);

  const stopEverything = useCallback(() => {
    cancelled.current = true;
    responder.current?.(false);
    responder.current = null;
    stopAllOneShots();
    void soundEngine.stopAll();
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  /** Present one burst and wait for "Duydum" within the response window. */
  const present = async (freq: number, levelDb: number): Promise<boolean> => {
    await sleep(randomGapMs(GAP_MIN_MS, GAP_MAX_MS));
    if (cancelled.current) return false;
    const lv = applyLevelCap(levelDb, maxVolume);
    if (lv.capped) setCapped(true);
    setListening(true);
    let handle: Awaited<ReturnType<typeof playToneOnce>> | null = null;
    try { handle = await playToneOnce(freq, { ms: BURST_MS, levelDb: lv.levelDb }); } catch (e) { console.warn(e); }
    const heard = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => { responder.current = null; resolve(false); }, BURST_MS + RESPONSE_MS);
      responder.current = (v) => { clearTimeout(timer); responder.current = null; resolve(v); };
    });
    handle?.stop();
    setListening(false);
    return heard;
  };

  const runEar = async (ear: EarKey) => {
    cancelled.current = false;
    const out: EarThresholds = {};
    let prior: number | undefined;
    for (let i = 0; i < SCREENING_FREQS.length; i++) {
      if (cancelled.current) return;
      const freq = SCREENING_FREQS[i];
      setFreqIndex(i);
      const cap = capDbFor(maxVolume);
      let s: ThresholdSearchState = startThresholdSearch({
        ...HEARING_SEARCH,
        maxDb: Math.min(HEARING_SEARCH.maxDb, cap),
        startDb: prior != null ? prior - HEARING_SEARCH.downStep : HEARING_SEARCH.startDb,
        coarseStep: prior != null ? HEARING_SEARCH.upStep : HEARING_SEARCH.coarseStep,
      });
      while (!s.done && !cancelled.current) {
        const heard = await present(freq, s.level);
        if (cancelled.current) return;
        s = respondThreshold(s, heard);
      }
      if (cancelled.current) return;
      out[freq] = s.thresholdDb ?? null;
      if (s.thresholdDb != null) prior = s.thresholdDb;
    }
    setResults((r) => ({ ...r, [ear]: out }));
    if (earIndex + 1 < ears.length) { setEarIndex(earIndex + 1); setPhase('prepare'); }
    else setPhase('result');
  };

  const onHeard = () => {
    if (!responder.current) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    responder.current(true);
  };

  const startEar = () => { setPhase('testing'); void runEar(currentEar); };

  const cancelTest = () => { stopEverything(); setResults({}); setEarIndex(0); setFreqIndex(0); setPhase('intro'); };

  // ---- results ----
  const toPoints = (th?: EarThresholds): AudiogramPoint[] => SCREENING_FREQS.map((f) => ({ freq: f, levelDb: th?.[f] ?? undefined }));
  const buildResult = (): HearingScreenResult => {
    const thresholds: HearingScreenResult['thresholds'] = [];
    const push = (ear: 'left' | 'right', th?: EarThresholds) => {
      if (!th) return;
      for (const f of SCREENING_FREQS) { const v = th[f]; if (v != null) thresholds.push({ ear, freq: f, levelDb: v }); }
    };
    if (mode === 'separate') { push('right', results.right); push('left', results.left); }
    else { push('right', results.both); push('left', results.both); }
    return { date: new Date().toISOString(), thresholds, ambientOk, calibrated: false };
  };

  const hearing = phase === 'result' ? buildResult() : null;
  const fake: Assessment | null = hearing ? { id: 'preview', date: hearing.date, questionnaires: [], hearing } : null;
  const asym = fake ? hearingAsymmetry(fake) : false;
  const notch = fake ? noiseNotch(fake) : false;
  const pta = fake ? pta4(fake) : null;
  const high = pta != null && pta > HIGH_PTA_DB;
  const notHeard: Array<{ ear: EarKey; freq: number }> = [];
  for (const ear of ears) for (const f of SCREENING_FREQS) if (results[ear] && results[ear]?.[f] === null) notHeard.push({ ear, freq: f });
  const concern = asym || notch || high || notHeard.length > 0;

  const save = () => {
    if (!hearing || saved) return;
    saveHearing(assessmentId, hearing);
    setSaved(true);
  };

  const chartWidth = Math.min(width - space[4] * 2 - space[4] * 2, 420);

  return (
    <Screen scroll={phase !== 'testing'}>
      <Stack.Screen options={{ title: t('psy.hear.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.hear.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.hear.intro.body')}</Text>
          <Card><Text variant="body">{t('psy.hear.intro.how')}</Text></Card>
          {!ambientOk ? <Banner tone="warning" title={t('psy.hear.ambientWarn')} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('chen2021')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.hear.evidence')}</Text>
          </View>
          <Button title={t('common.continue')} onPress={() => setPhase('mode')} />
          {!ambientOk ? <Button variant="ghost" title={t('psy.hp.title')} onPress={() => router.replace('/assess/headphone-check?next=/assess/hearing')} /> : null}
        </>
      )}

      {phase === 'mode' && (
        <>
          <Text variant="h2">{t('psy.hear.mode.title')}</Text>
          <OptionCard label={t('psy.hear.mode.separate')} hint={t('psy.hear.mode.separate.hint')} selected={mode === 'separate'} onPress={() => setMode('separate')} />
          <OptionCard label={t('psy.hear.mode.both')} hint={t('psy.hear.mode.both.hint')} selected={mode === 'both'} onPress={() => setMode('both')} />
          <Button title={t('common.continue')} onPress={() => { setEarIndex(0); setPhase('prepare'); }} />
        </>
      )}

      {phase === 'prepare' && (
        <>
          <Text variant="h2">{t(`psy.hear.ear.${currentEar}`)}</Text>
          <Card>
            <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
              <Headphones size={28} color={colors.primary} />
              <Text variant="body" style={{ flex: 1 }}>{t(`psy.hear.prepare.${currentEar}`)}</Text>
            </View>
          </Card>
          <Text variant="bodySmall" tone="secondary">{t('psy.hear.intro.how')}</Text>
          <Button title={t('psy.hear.startEar', { ear: t(`psy.hear.ear.${currentEar}`) })} onPress={startEar} />
        </>
      )}

      {phase === 'testing' && (
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ gap: space[3] }}>
            <Text variant="overline" tone="secondary">{t('psy.hear.progress', { ear: t(`psy.hear.ear.${currentEar}`), i: freqIndex + 1, n: SCREENING_FREQS.length })}</Text>
            <View style={{ height: 4, borderRadius: radius.full, backgroundColor: colors.primaryTrack }}>
              <View style={{ width: `${Math.round(((earIndex * SCREENING_FREQS.length + freqIndex) / (ears.length * SCREENING_FREQS.length)) * 100)}%`, height: 4, borderRadius: radius.full, backgroundColor: colors.primary }} />
            </View>
            {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          </View>
          <View style={{ alignItems: 'center', gap: space[4] }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: listening ? colors.primarySoft : colors.skeleton, alignItems: 'center', justifyContent: 'center' }}>
              <Ear size={44} color={listening ? colors.primary : colors.textMuted} />
            </View>
            <Text variant="h3" tone={listening ? 'primary' : 'secondary'} accessibilityLiveRegion="polite">{listening ? t('psy.hear.listening') : ' '}</Text>
          </View>
          <View style={{ gap: space[3] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('psy.heard')}
              accessibilityHint={t('psy.hear.heardHint')}
              onPress={onHeard}
              style={({ pressed }) => ({ height: 120, borderRadius: radius.xl, backgroundColor: pressed ? colors.primaryPressed : colors.primary, alignItems: 'center', justifyContent: 'center' })}
            >
              <Text variant="h1" tone="onPrimary">{t('psy.heard')}</Text>
            </Pressable>
            <Button variant="ghost" title={t('psy.stopTest')} onPress={cancelTest} />
          </View>
        </View>
      )}

      {phase === 'result' && hearing && (
        <>
          <Text variant="h1">{t('psy.hear.result.title')}</Text>
          <Banner tone={concern ? 'warning' : 'success'} title={concern ? t('psy.hear.result.concern') : t('psy.hear.result.noConcern')} body={concern ? t('psy.hear.result.concern.body') : t('psy.hear.result.noConcern.body')} />
          <Card>
            <Text variant="overline" tone="secondary">{t('psy.hear.result.pta')}</Text>
            <Text variant="numeric">{pta != null ? `${Math.round(pta)} dB` : '—'}</Text>
            <Text variant="caption" tone="muted">{t('psy.hear.unit')}</Text>
            {asym ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.asym')}</Text> : null}
            {notch ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.notch')}</Text> : null}
            {high ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.high')}</Text> : null}
            {notHeard.map((n) => <Text key={`${n.ear}-${n.freq}`} variant="bodySmall" tone="warning">• {t(`psy.hear.ear.${n.ear}`)}: {t('psy.hear.flag.notHeard', { hz: n.freq })}</Text>)}
            {mode === 'both' ? <Text variant="bodySmall" tone="secondary">{t('psy.hear.bothNote')}</Text> : null}
            {!ambientOk ? <Text variant="bodySmall" tone="secondary">{t('psy.hear.ambientWarn')}</Text> : null}
          </Card>
          {ears.map((ear) => (
            <Card key={ear}>
              <AudiogramChart ear={ear} points={toPoints(results[ear])} width={chartWidth} />
            </Card>
          ))}
          <Disclaimer textKey="psy.hear.disclaimer" />
          <Button title={saved ? t('psy.hear.continuePitch') : t('psy.saveContinue')} onPress={() => { save(); router.replace('/assess/pitch'); }} />
          <Button variant="secondary" title={t('psy.hear.backHub')} onPress={() => { save(); router.back(); }} />
          <Button variant="ghost" title={t('psy.hear.redo')} onPress={cancelTest} />
          <Disclaimer />
        </>
      )}
      {sheet}
    </Screen>
  );
}
