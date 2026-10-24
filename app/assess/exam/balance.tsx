import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Accelerometer } from 'expo-sensors';
import { Banner, Button, Card, Chip, Disclaimer, OptionCard, Screen, Text } from '@/components';
import { CountdownRing } from '@/components/psycho';
import { EstimateNote, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { stopAllOneShots } from '@/audio/psychoPlayer';
import {
  SWAY_BASELINE_IGNORE_SECONDS, SWAY_BASELINE_SECONDS, SWAY_IGNORE_SECONDS, SWAY_TEST_SECONDS, swayRatio, swayStats,
  type SwaySample, type SwayStats,
} from '@/audio/examTests';

type Phase = 'falls' | 'intro' | 'unavailable' | 'open' | 'transition' | 'closed' | 'result';
const UPDATE_MS = 50;
const TRANSITION_SECONDS = 3;
/** Fewer usable samples than this (≈5 s at 20 Hz) means the sensor did not deliver; ask for a repeat. */
const MIN_SAMPLES = 100;

type Sub = ReturnType<typeof Accelerometer.addListener>;

/**
 * Accelerometer sway test: 10 s eyes open (baseline) then 30 s eyes closed, phone held against the chest, feet
 * shoulder-width apart with a hand's reach of a wall. Disabled for vertigo, Ménière pattern, age ≥ 65 or a
 * self-reported fall (asked inline). The score is recorded for the clinician; it is never labelled.
 */
export default function BalanceScreen() {
  useKeepAwake();
  const t = useT();
  const locale = useLocale();
  const { space } = useTheme();
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence, eligibility } = useExamFinish('balance');

  const [phase, setPhase] = useState<Phase>('falls');
  const [falls, setFalls] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [openStats, setOpenStats] = useState<SwayStats | null>(null);
  const [closedStats, setClosedStats] = useState<SwayStats | null>(null);
  const [saved, setSaved] = useState(false);

  const samples = useRef<SwaySample[]>([]);
  const sub = useRef<Sub | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelled = useRef(false);

  const stopCapture = () => { try { sub.current?.remove(); } catch {} sub.current = null; };
  const clearTick = () => { if (tick.current) clearInterval(tick.current); tick.current = null; };
  const stopEverything = useCallback(() => {
    stopCapture(); clearTick();
    timeouts.current.forEach(clearTimeout); timeouts.current = [];
    void Speech.stop();
    stopAllOneShots();
    void soundEngine.stopAll();
  }, []);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; stopEverything(); };
  }, [stopEverything]);

  const cue = (key: string, haptic: 'start' | 'end') => {
    void (haptic === 'start' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    try { Speech.speak(t(key), { language: locale === 'tr' ? 'tr-TR' : 'en-US', rate: 0.95 }); } catch {}
  };

  const startCapture = () => {
    samples.current = [];
    stopCapture();
    try {
      Accelerometer.setUpdateInterval(UPDATE_MS);
      sub.current = Accelerometer.addListener(({ x, y, z }) => { samples.current.push({ x, y, z, t: Date.now() }); });
    } catch (e) { console.warn('accelerometer', e); }
  };

  /** Run a countdown of `seconds`; `onEnd` receives the samples captured meanwhile. */
  const runWindow = (seconds: number, onEnd: (captured: SwaySample[]) => void) => {
    startCapture();
    setRemaining(seconds);
    const t0 = Date.now();
    clearTick();
    tick.current = setInterval(() => {
      const left = seconds - Math.round((Date.now() - t0) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearTick();
        stopCapture();
        if (!cancelled.current) onEnd(samples.current);
      }
    }, 250);
  };

  const startClosed = () => {
    setPhase('closed');
    cue('exam.balance.cue.start', 'start');
    runWindow(SWAY_TEST_SECONDS, (captured) => {
      cue('exam.balance.cue.end', 'end');
      setClosedStats(swayStats(captured, SWAY_IGNORE_SECONDS));
      setPhase('result');
    });
  };

  const startOpen = () => {
    setPhase('open');
    cue('exam.balance.cue.start', 'start');
    runWindow(SWAY_BASELINE_SECONDS, (captured) => {
      setOpenStats(swayStats(captured, SWAY_BASELINE_IGNORE_SECONDS));
      setPhase('transition');
      cue('exam.balance.closeEyes', 'end');
      setRemaining(TRANSITION_SECONDS);
      const t0 = Date.now();
      clearTick();
      tick.current = setInterval(() => {
        const left = TRANSITION_SECONDS - Math.round((Date.now() - t0) / 1000);
        setRemaining(Math.max(0, left));
        if (left <= 0) { clearTick(); if (!cancelled.current) startClosed(); }
      }, 250);
    });
  };

  const begin = async () => {
    setOpenStats(null); setClosedStats(null); setSaved(false);
    let ok = false;
    try { ok = await Accelerometer.isAvailableAsync(); } catch { ok = false; }
    if (cancelled.current) return;
    if (!ok) { setPhase('unavailable'); return; }
    startOpen();
  };

  const abort = () => { stopEverything(); setPhase('intro'); };

  const tooFew = closedStats != null && closedStats.n < MIN_SAMPLES;
  const score = closedStats?.score ?? 0;
  const ratio = openStats && closedStats ? swayRatio(closedStats.score, openStats.score) : null;

  const save = () => {
    if (saved || !closedStats || tooFew) return;
    // Recorded for the clinician only; the arbitrary "abnormal" cut-off is no longer applied (physician B8).
    saveExam(assessmentId, { swayScore: score, swayAbnormal: undefined });
    setSaved(true);
  };

  const blocked = !eligibility.balance || falls === true;
  const reasons = [...eligibility.balanceReasons, ...(falls === true ? ['exam.gate.falls'] : [])];

  if (blocked) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('exam.balance.title') }} />
        <Text variant="h1">{t('exam.balance.title')}</Text>
        <Banner tone="warning" title={t('exam.gate.disabled')} body={t('exam.gate.balance.body')} />
        <Card>
          <Text variant="overline" tone="secondary">{t('exam.gate.reasons')}</Text>
          {reasons.map((r) => <Text key={r} variant="body">• {t(r)}</Text>)}
        </Card>
        <Button title={t('exam.skip')} onPress={finish} />
        {falls === true && eligibility.balance ? <Button variant="ghost" title={t('exam.gate.falls.change')} onPress={() => setFalls(null)} /> : null}
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.balance.title') }} />

      {phase === 'falls' && (
        <>
          <Text variant="h1">{t('exam.balance.title')}</Text>
          <Text variant="body" tone="secondary">{t('exam.gate.falls.intro')}</Text>
          <Text variant="h2">{t('exam.gate.falls.q')}</Text>
          <View style={{ gap: space[2] }}>
            <OptionCard label={t('common.yes')} selected={falls === true} onPress={() => setFalls(true)} />
            <OptionCard label={t('common.no')} selected={falls === false} onPress={() => { setFalls(false); setPhase('intro'); }} />
          </View>
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.balance.title')}</Text>
          <Text variant="body" tone="secondary">{t('exam.balance.intro.body')}</Text>
          <Card><Text variant="body">{t('exam.balance.how')}</Text></Card>
          <Banner tone="warning" title={t('exam.balance.safety')} />
          <Button title={t('common.start')} onPress={() => void begin()} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'unavailable' && (
        <>
          <Text variant="h1">{t('exam.balance.title')}</Text>
          <Banner tone="info" title={t('exam.balance.unavailable')} />
          <Button title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {(phase === 'open' || phase === 'closed' || phase === 'transition') && (
        <>
          <Text variant="overline" tone="secondary" center>{phase === 'closed' ? t('exam.balance.phase.closed') : t('exam.balance.phase.open')}</Text>
          <Text variant="h2" center accessibilityLiveRegion="assertive">
            {phase === 'transition' ? t('exam.balance.closeEyes') : t('exam.balance.keepStill')}
          </Text>
          <CountdownRing remaining={remaining} total={phase === 'open' ? SWAY_BASELINE_SECONDS : phase === 'closed' ? SWAY_TEST_SECONDS : TRANSITION_SECONDS} size={200} caption={t('exam.seconds')} />
          <Text variant="bodySmall" tone="secondary" center>{t('exam.balance.safety')}</Text>
          <Button variant="ghost" title={t('exam.stop')} onPress={abort} />
        </>
      )}

      {phase === 'result' && closedStats && (
        <>
          <Text variant="h1">{t('exam.balance.result.title')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('exam.balance.openEyes')}</Text>
          {tooFew ? <Banner tone="warning" title={t('exam.balance.tooFew')} /> : (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
                <Text variant="numeric">{t('exam.balance.result.value', { s: score })}</Text>
                <Chip tone="info" label={t('exam.result.recorded')} />
              </View>
              {openStats ? <Text variant="bodySmall" tone="secondary">{t('exam.balance.result.baseline', { s: openStats.score })}</Text> : null}
              {ratio != null ? <Text variant="bodySmall" tone="secondary">{t('exam.balance.result.ratio', { r: ratio })}</Text> : null}
              <Text variant="bodySmall" tone="secondary">{t('exam.balance.result.hint')}</Text>
            </Card>
          )}
          <EstimateNote />
          {!tooFew ? <Button title={inSequence ? t('exam.saveNext') : t('exam.saveFinish')} onPress={() => { save(); finish(); }} /> : null}
          {!tooFew ? <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} /> : null}
          <Button variant={tooFew ? 'primary' : 'ghost'} title={t('exam.repeat')} onPress={() => void begin()} />
          {tooFew ? <Button variant="ghost" title={t('exam.skip')} onPress={finish} /> : null}
          {saved ? <Text variant="caption" tone="success">{t('exam.saved')}</Text> : null}
          <Disclaimer textKey="disclaimer.short" />
        </>
      )}
    </Screen>
  );
}
