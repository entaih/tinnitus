import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { DX_RETURN_ROUTE } from '@/hooks/useJourney';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Ear, Headphones } from 'lucide-react-native';
import { Banner, Button, Card, Chip, Disclaimer, EvidenceChip, OptionCard, Screen, Text, useCitation } from '@/components';
import { AudiogramChart, ThresholdTable, type AudiogramPoint } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { SCREEN_HL_UNCERTAINTY_DB, hearingAsymmetry, noiseNotch, pta4, toHlEstimate } from '@/clinical/engine';
import type { Assessment, HearingScreenResult } from '@/clinical/types';
import { soundEngine, type Channel } from '@/audio/engine';
import { playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import {
  HEARING_SEARCH, SCREENING_FREQS, SCREENING_UNCERTAINTY_DB, applyLevelCap, capDbFor, makeCatchScheduler, randomGapMs, respondThreshold,
  screenReliability, startThresholdSearch, warbleFor, type ScreenReliability, type ThresholdSearchState,
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

/**
 * Hearing screening. Each ear is presented monaurally through a stereo file with one silent channel
 * (no earpiece is removed); tones ≥ 3 kHz are warbled; about one presentation in six is silent (catch trial)
 * and ≥ 2 responses to silence mark the run as low reliability. Levels are dB re device full scale, never dB HL.
 */
export default function HearingScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space, radius } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ ok?: string; hp?: string; from?: string }>();
  /** `?from=dx`: opened from the diagnosis card; the result returns to the results screen (no chaining into the pitch match). */
  const fromDx = params.from === 'dx';
  const ambientOk = params.ok === '1';
  const headphonesVerified = params.hp === '1';
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
  const [catchStats, setCatchStats] = useState({ catches: 0, falsePositives: 0 });
  const [saved, setSaved] = useState(false);

  const ears: EarKey[] = mode === 'separate' ? ['right', 'left'] : ['both'];
  const currentEar = ears[earIndex];

  const cancelled = useRef(false);
  const responder = useRef<((heard: boolean) => void) | null>(null);
  const catchRef = useRef({ catches: 0, falsePositives: 0 });

  const stopEverything = useCallback(() => {
    cancelled.current = true;
    responder.current?.(false);
    responder.current = null;
    stopAllOneShots();
    void soundEngine.stopAll();
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  /**
   * Present one burst (or silence when `levelDb` is null — a catch trial) to `channel` and wait for "Duydum"
   * within the response window. The listening indicator behaves identically so a catch trial is not recognisable.
   */
  const present = async (freq: number, levelDb: number | null, channel: Channel): Promise<boolean> => {
    await sleep(randomGapMs(GAP_MIN_MS, GAP_MAX_MS));
    if (cancelled.current) return false;
    setListening(true);
    let handle: Awaited<ReturnType<typeof playToneOnce>> | null = null;
    if (levelDb != null) {
      const lv = applyLevelCap(levelDb, maxVolume);
      if (lv.capped) setCapped(true);
      try { handle = await playToneOnce(freq, { ms: BURST_MS, levelDb: lv.levelDb, warble: warbleFor(freq), channel }); } catch (e) { console.warn(e); }
    }
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
    const channel: Channel = ear === 'both' ? 'both' : ear;
    const isCatch = makeCatchScheduler();
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
        if (isCatch()) {
          const fp = await present(freq, null, channel);
          if (cancelled.current) return;
          catchRef.current = { catches: catchRef.current.catches + 1, falsePositives: catchRef.current.falsePositives + (fp ? 1 : 0) };
          setCatchStats(catchRef.current);
          continue;
        }
        const heard = await present(freq, s.level, channel);
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

  const resetAll = () => {
    stopEverything();
    setResults({}); setEarIndex(0); setFreqIndex(0); setSaved(false);
    catchRef.current = { catches: 0, falsePositives: 0 };
    setCatchStats(catchRef.current);
  };
  const cancelTest = () => { resetAll(); setPhase('intro'); };
  const redo = () => { resetAll(); setPhase('mode'); };

  // ---- results ----
  const reliability: ScreenReliability = screenReliability(catchStats.falsePositives);
  const toPoints = (th?: EarThresholds): AudiogramPoint[] => SCREENING_FREQS.map((f) => ({ freq: f, levelDb: th?.[f] ?? undefined }));
  const buildResult = (): HearingScreenResult => {
    const thresholds: HearingScreenResult['thresholds'] = [];
    const push = (ear: 'left' | 'right', th?: EarThresholds) => {
      if (!th) return;
      for (const f of SCREENING_FREQS) { const v = th[f]; if (v != null) thresholds.push({ ear, freq: f, levelDb: v }); }
    };
    if (mode === 'separate') { push('right', results.right); push('left', results.left); }
    else { push('right', results.both); push('left', results.both); }
    return { date: new Date().toISOString(), thresholds, ambientOk, calibrated: false, mode, headphonesVerified, reliability };
  };

  const hearing = phase === 'result' ? buildResult() : null;
  const fake: Assessment | null = hearing ? { id: 'preview', date: hearing.date, questionnaires: [], hearing } : null;
  const asym = fake && mode === 'separate' ? hearingAsymmetry(fake) : false;
  const notch = fake ? noiseNotch(fake) : false;
  const pta = fake ? pta4(fake) : null;
  const hl = pta != null ? toHlEstimate(pta) : null;
  const notHeard: Array<{ ear: EarKey; freq: number }> = [];
  for (const ear of ears) for (const f of SCREENING_FREQS) if (results[ear] && results[ear]?.[f] === null) notHeard.push({ ear, freq: f });
  const concern = asym || notch || (hl != null && hl > 25) || notHeard.length > 0;

  const save = () => {
    if (!hearing || saved) return;
    saveHearing(assessmentId, hearing);
    setSaved(true);
  };

  const chartWidth = Math.min(width - space[4] * 2 - space[4] * 2, 420);
  const totalFreqs = ears.length * SCREENING_FREQS.length;

  return (
    <Screen scroll={phase !== 'testing'}>
      <Stack.Screen options={{ title: t('psy.hear.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.hear.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.hear.intro.body')}</Text>
          <Card><Text variant="body">{t('psy.hear.intro.how')}</Text></Card>
          <Text variant="bodySmall" tone="secondary">{t('psy.hear.intro.catch')}</Text>
          {!ambientOk ? <Banner tone="warning" title={t('psy.hear.ambientWarn')} /> : null}
          {!headphonesVerified ? <Banner tone="info" title={t('psy.hear.hpUnverified')} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('chen2021')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.hear.evidence')}</Text>
          </View>
          {ambientOk ? (
            <Button title={t('common.continue')} onPress={() => setPhase('mode')} />
          ) : (
            <>
              <Button title={t('psy.hp.title')} onPress={() => router.replace(`/assess/headphone-check?next=${encodeURIComponent(fromDx ? '/assess/hearing?from=dx' : '/assess/hearing')}`)} />
              <Button variant="ghost" title={t('psy.hear.skipCheck')} onPress={() => setPhase('mode')} />
            </>
          )}
        </>
      )}

      {phase === 'mode' && (
        <>
          <Text variant="h2">{t('psy.hear.mode.title')}</Text>
          <OptionCard label={t('psy.hear.mode.separate')} hint={t('psy.hear.mode.separate.hint')} selected={mode === 'separate'} onPress={() => setMode('separate')} />
          <OptionCard label={t('psy.hear.mode.both')} hint={t('psy.hear.mode.both.hint')} selected={mode === 'both'} onPress={() => setMode('both')} />
          {mode === 'separate' && !headphonesVerified ? <Banner tone="warning" title={t('psy.hear.mode.unverifiedWarn')} /> : null}
          <Text variant="caption" tone="muted">{t('psy.hp.mono.body')}</Text>
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
              <View style={{ width: `${Math.round(((earIndex * SCREENING_FREQS.length + freqIndex) / totalFreqs) * 100)}%`, height: 4, borderRadius: radius.full, backgroundColor: colors.primary }} />
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
          <Banner tone={concern ? 'warning' : 'info'} title={concern ? t('psy.hear.result.concern') : t('psy.hear.result.noPattern')} body={concern ? t('psy.hear.result.concern.body') : t('psy.hear.result.noPattern.body')} />
          {reliability === 'low' ? (
            <Banner tone="warning" title={t('psy.hear.reliability.low')} body={t('psy.hear.reliability.lowBody', { fp: catchStats.falsePositives, n: catchStats.catches })} primary={{ title: t('psy.hear.redo'), onPress: redo }} />
          ) : null}
          <Card>
            <Text variant="overline" tone="secondary">{t('psy.hear.result.pta')}</Text>
            <Text variant="numeric">{pta != null ? `${Math.round(pta)} dBFS` : '—'}</Text>
            <Text variant="caption" tone="muted">{t('psy.hear.unit')}</Text>
            {hl != null ? (
              <>
                <Text variant="bodySmall">{t('psy.hear.result.hlBand', { v: hl, lo: hl - SCREEN_HL_UNCERTAINTY_DB, hi: hl + SCREEN_HL_UNCERTAINTY_DB })}</Text>
                <Text variant="caption" tone="muted">{t('psy.hear.result.hlCaveat')}</Text>
              </>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
              <Chip small label={t(`psy.hear.mode.${mode}`)} />
              <Chip small tone={headphonesVerified ? 'success' : 'neutral'} label={headphonesVerified ? t('psy.hear.hp.verified') : t('psy.hear.hp.unverified')} />
              <Chip small tone={reliability === 'low' ? 'warning' : 'neutral'} label={t('psy.hear.catch.rate', { fp: catchStats.falsePositives, n: catchStats.catches })} />
            </View>
            {asym ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.asym')}</Text> : null}
            {notch ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.notch')}</Text> : null}
            {hl != null && hl > 25 ? <Text variant="bodySmall" tone="warning">• {t('psy.hear.flag.high')}</Text> : null}
            {notHeard.map((n) => <Text key={`${n.ear}-${n.freq}`} variant="bodySmall" tone="warning">• {t(`psy.hear.ear.${n.ear}`)}: {t('psy.hear.flag.notHeard', { hz: n.freq })}</Text>)}
            {mode === 'both' ? <Text variant="bodySmall" tone="secondary">{t('psy.hear.bothNote')}</Text> : null}
            {!ambientOk ? <Text variant="bodySmall" tone="secondary">{t('psy.hear.ambientWarn')}</Text> : null}
          </Card>
          <Card>
            <ThresholdTable ears={ears} values={results} />
            <Text variant="caption" tone="muted">{t('psy.hear.table.band', { db: SCREENING_UNCERTAINTY_DB })}</Text>
          </Card>
          {ears.map((ear) => (
            <Card key={ear}>
              <AudiogramChart ear={ear} points={toPoints(results[ear])} width={chartWidth} />
            </Card>
          ))}
          <Text variant="bodySmall" tone="secondary">{t('psy.hear.notchRule')}</Text>
          <Disclaimer textKey="psy.hear.disclaimer" />
          <Button title={fromDx ? t('dx.backToResults') : saved ? t('psy.hear.continuePitch') : t('psy.saveContinue')} onPress={() => { save(); router.replace(fromDx ? DX_RETURN_ROUTE : '/assess/pitch'); }} />
          <Button variant="secondary" title={t('psy.hear.backHub')} onPress={() => { save(); router.back(); }} />
          <Button variant="ghost" title={t('psy.hear.redo')} onPress={redo} />
          <Disclaimer />
        </>
      )}
      {sheet}
    </Screen>
  );
}
