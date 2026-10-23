import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import { Ear, Play } from 'lucide-react-native';
import { Banner, Button, Card, Disclaimer, Screen, Stepper, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import {
  TONE_THRESHOLD_SEARCH, applyLevelCap, capDbFor, loudnessMatch, randomGapMs, respondThreshold, startThresholdSearch,
  type ThresholdSearchState,
} from '@/audio/psychoacoustics';

type Phase = 'intro' | 'threshold' | 'match' | 'result';
const BURST_MS = 1000;
const RESPONSE_MS = 2000;

export default function LoudnessScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space, radius } = useTheme();
  const params = useLocalSearchParams<{ hz?: string }>();
  const { assessment } = useProfile();
  const pitchHz = Number(params.hz) > 0 ? Number(params.hz) : assessment?.psycho?.pitchHz;
  const maxVolume = useSettings((s) => s.maxVolume);
  const savePsycho = useClinical((s) => s.savePsycho);
  const assessmentId = useAssessmentId();
  const capDb = capDbFor(maxVolume);

  const [phase, setPhase] = useState<Phase>('intro');
  const [listening, setListening] = useState(false);
  const [capped, setCapped] = useState(false);
  const [thresholdDb, setThresholdDb] = useState<number | null>(null);
  const [notHeard, setNotHeard] = useState(false);
  const [level, setLevel] = useState(-40);
  const [previewing, setPreviewing] = useState(false);
  const [dbSl, setDbSl] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [presentations, setPresentations] = useState(0);

  const cancelled = useRef(false);
  const responder = useRef<((heard: boolean) => void) | null>(null);
  const seq = useRef(0);

  const stopEverything = useCallback(() => {
    cancelled.current = true; seq.current++;
    responder.current?.(false); responder.current = null;
    stopAllOneShots(); void soundEngine.stopAll();
  }, []);
  useEffect(() => () => stopEverything(), [stopEverything]);

  const present = async (freq: number, levelDb: number): Promise<boolean> => {
    await sleep(randomGapMs(1000, 2000));
    if (cancelled.current) return false;
    const lv = applyLevelCap(levelDb, maxVolume);
    if (lv.capped) setCapped(true);
    setListening(true);
    setPresentations((n) => n + 1);
    let handle: Awaited<ReturnType<typeof playToneOnce>> | null = null;
    try { handle = await playToneOnce(freq, { ms: BURST_MS, levelDb: lv.levelDb, warble: true }); } catch (e) { console.warn(e); }
    const heard = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => { responder.current = null; resolve(false); }, BURST_MS + RESPONSE_MS);
      responder.current = (v) => { clearTimeout(timer); responder.current = null; resolve(v); };
    });
    handle?.stop();
    setListening(false);
    return heard;
  };

  const runThreshold = async () => {
    if (!pitchHz) return;
    cancelled.current = false;
    setNotHeard(false);
    setPresentations(0);
    let s: ThresholdSearchState = startThresholdSearch({ ...TONE_THRESHOLD_SEARCH, maxDb: Math.min(TONE_THRESHOLD_SEARCH.maxDb, capDb) });
    while (!s.done && !cancelled.current) {
      const heard = await present(pitchHz, s.level);
      if (cancelled.current) return;
      s = respondThreshold(s, heard);
    }
    if (cancelled.current) return;
    if (s.thresholdDb == null) { setNotHeard(true); setPhase('intro'); return; }
    setThresholdDb(s.thresholdDb);
    setLevel(Math.min(capDb, s.thresholdDb + 10));
    setPhase('match');
  };

  const onHeard = () => { if (!responder.current) return; void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); responder.current(true); };

  const preview = async (lv: number) => {
    if (!pitchHz) return;
    const my = ++seq.current;
    stopAllOneShots();
    const c = applyLevelCap(lv, maxVolume);
    if (c.capped) setCapped(true);
    setPreviewing(true);
    try { const h = await playToneOnce(pitchHz, { ms: 1500, levelDb: c.levelDb, warble: true }); await h.finished; } catch (e) { console.warn(e); }
    if (my === seq.current) setPreviewing(false);
  };

  const setLevelSafe = (v: number) => { const c = applyLevelCap(Math.round(v), maxVolume); if (c.capped) setCapped(true); setLevel(Math.max(thresholdDb ?? -70, c.levelDb)); };

  const match = () => {
    if (thresholdDb == null) return;
    stopAllOneShots();
    setDbSl(loudnessMatch(level, thresholdDb).dbSl);
    setPhase('result');
  };

  const save = () => {
    if (dbSl == null || saved) return;
    savePsycho(assessmentId, { loudnessDbSl: dbSl });
    setSaved(true);
  };

  const restart = () => { stopEverything(); setThresholdDb(null); setDbSl(null); setSaved(false); setPhase('intro'); };

  if (!pitchHz) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('psy.loud.title') }} />
        <Text variant="h1">{t('psy.loud.title')}</Text>
        <Banner tone="info" title={t('psy.loud.noPitch')} />
        <Button title={t('psy.loud.goPitch')} onPress={() => router.replace('/assess/pitch')} />
      </Screen>
    );
  }

  const atypical = dbSl != null && loudnessMatch(level, thresholdDb ?? 0).atypical;

  return (
    <Screen scroll={phase !== 'threshold'}>
      <Stack.Screen options={{ title: t('psy.loud.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.loud.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.loud.intro.body')}</Text>
          <Card><Text variant="bodyStrong">{t('psy.loud.pitch', { hz: Math.round(pitchHz) })}</Text><Text variant="body">{t('psy.loud.phase1.body')}</Text></Card>
          {notHeard ? <Banner tone="warning" title={t('psy.loud.notHeard')} /> : null}
          <Button title={t('common.start')} onPress={() => { setPhase('threshold'); void runThreshold(); }} />
        </>
      )}

      {phase === 'threshold' && (
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ gap: space[2] }}>
            <Text variant="overline" tone="secondary">{t('psy.loud.phase1')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('psy.loud.phase1.body')}</Text>
            {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          </View>
          <View style={{ alignItems: 'center', gap: space[4] }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: listening ? colors.primarySoft : colors.skeleton, alignItems: 'center', justifyContent: 'center' }}>
              <Ear size={44} color={listening ? colors.primary : colors.textMuted} />
            </View>
            <Text variant="h3" tone={listening ? 'primary' : 'secondary'} accessibilityLiveRegion="polite">{listening ? t('psy.hear.listening') : ' '}</Text>
            <Text variant="caption" tone="muted">{presentations}</Text>
          </View>
          <View style={{ gap: space[3] }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('psy.heard')} accessibilityHint={t('psy.hear.heardHint')} onPress={onHeard}
              style={({ pressed }) => ({ height: 120, borderRadius: radius.xl, backgroundColor: pressed ? colors.primaryPressed : colors.primary, alignItems: 'center', justifyContent: 'center' })}>
              <Text variant="h1" tone="onPrimary">{t('psy.heard')}</Text>
            </Pressable>
            <Button variant="ghost" title={t('psy.stopTest')} onPress={restart} />
          </View>
        </View>
      )}

      {phase === 'match' && thresholdDb != null && (
        <>
          <Text variant="overline" tone="secondary">{t('psy.loud.phase2')}</Text>
          <Text variant="body" tone="secondary">{t('psy.loud.phase2.body')}</Text>
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Card>
            <Text variant="caption" tone="secondary">{t('psy.loud.threshold', { db: thresholdDb })}</Text>
            <Text variant="numeric" center>{t('psy.loud.aboveThreshold', { db: Math.round(level - thresholdDb) })}</Text>
            {level - thresholdDb > 30 ? <Text variant="bodySmall" tone="warning" center>{t('psy.loud.result.atypical')}</Text> : null}
            <Slider
              style={{ height: 44 }}
              minimumValue={thresholdDb}
              maximumValue={capDb}
              step={1}
              value={level}
              onValueChange={(v) => setLevelSafe(v)}
              onSlidingComplete={(v) => { setLevelSafe(v); void preview(Math.round(v)); }}
              minimumTrackTintColor={level - thresholdDb > 30 ? colors.warning : colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.card}
              accessibilityLabel={t('psy.level')}
              accessibilityValue={{ text: `${Math.round(level - thresholdDb)} dB` }}
            />
            <Stepper value={level} min={thresholdDb} max={capDb} step={1} onChange={(v) => { setLevelSafe(v); void preview(v); }} label={t('psy.level')} format={(v) => `${v} dB`} />
            <Button variant="secondary" title={previewing ? t('psy.playing') : t('psy.listen')} icon={<Play size={18} color={colors.primary} />} onPress={() => void preview(level)} />
          </Card>
          <Button title={t('psy.loud.match')} onPress={match} />
          <Button variant="ghost" title={t('psy.repeat')} onPress={restart} />
        </>
      )}

      {phase === 'result' && dbSl != null && (
        <>
          <Text variant="h1">{t('psy.loud.result.title')}</Text>
          <Card>
            <Text variant="numeric">{t('psy.loud.result.sl', { db: dbSl })}</Text>
            <Text variant="caption" tone="muted">{t('psy.loud.result.slHint')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('psy.loud.result.typical')}</Text>
          </Card>
          {atypical ? <Banner tone="warning" title={t('psy.loud.result.atypical')} primary={{ title: t('psy.repeat'), onPress: restart }} /> : null}
          <Button title={saved ? t('psy.loud.continueMml') : t('psy.saveContinue')} onPress={() => { save(); router.replace('/assess/mml'); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('psy.repeat')} onPress={restart} />
          <Disclaimer />
        </>
      )}
    </Screen>
  );
}
