import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { File } from 'expo-file-system';
import { Headphones, Mic, Volume2 } from 'lucide-react-native';
import { Banner, Button, Card, OptionCard, Screen, Text } from '@/components';
import { LevelMeter } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { playBurst, soundEngine, type Channel } from '@/audio/engine';
import { invalidatePlaybackMode, stopAllOneShots } from '@/audio/psychoPlayer';
import { applyLevelCap } from '@/audio/psychoacoustics';

const AMBIENT_PASS_DBFS = -40;
const AMBIENT_SAMPLE_MS = 3000;
const DEFAULT_NEXT = '/assess/hearing';
const TONE_LEVEL_DB = -20;
const TONE_MS = 800;
/** Channel verification order: left first, then right (audiologist A5). */
const SIDES: Channel[] = ['left', 'right'];

type Phase = 'intro' | 'tone' | 'ambient';
type Ambient = 'idle' | 'measuring' | 'ok' | 'noisy' | 'denied' | 'error';
type SideAnswer = 'left' | 'right' | 'both' | 'none';
const ANSWERS: SideAnswer[] = ['left', 'right', 'both', 'none'];

/** Playback audio mode, re-applied after the microphone session so iOS leaves .playAndRecord. */
const PLAYBACK_MODE = { playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' as const, allowsRecording: false };

/**
 * Headphone check: a 1 kHz burst to the LEFT channel, then to the RIGHT ("which side did you hear it on?").
 * Both answers correct → headphonesVerified (passed on as ?hp=1). Then a 3 s ambient-noise estimate.
 */
export default function HeadphoneCheckScreen() {
  const t = useT();
  const { colors, space } = useTheme();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = typeof params.next === 'string' && params.next.startsWith('/') ? params.next : DEFAULT_NEXT;
  const maxVolume = useSettings((s) => s.maxVolume);

  const [phase, setPhase] = useState<Phase>('intro');
  const [sideIndex, setSideIndex] = useState(0);
  const [answers, setAnswers] = useState<SideAnswer[]>([]);
  const [played, setPlayed] = useState(false);
  const [tonePlaying, setTonePlaying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [ambient, setAmbient] = useState<Ambient>('idle');
  const [avgDb, setAvgDb] = useState<number | null>(null);
  const [capped, setCapped] = useState(false);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 200);
  const samples = useRef<number[]>([]);
  const measuring = useRef(false);
  const cancelled = useRef(false);

  // Collect metering samples while measuring (dBFS, ≤ 0; undefined until recording starts).
  useEffect(() => {
    if (measuring.current && state.isRecording && typeof state.metering === 'number' && Number.isFinite(state.metering)) {
      samples.current.push(Math.max(-80, Math.min(0, state.metering)));
    }
  }, [state.metering, state.isRecording]);

  const stopRecorder = useCallback(async () => {
    measuring.current = false;
    try { if (recorder.isRecording) await recorder.stop(); } catch {}
    try { if (recorder.uri) { const f = new File(recorder.uri); if (f.exists) f.delete(); } } catch {}
    try { await setAudioModeAsync(PLAYBACK_MODE); } catch {}
    invalidatePlaybackMode();
  }, [recorder]);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      void stopRecorder();
      stopAllOneShots();
      void soundEngine.stopAll();
    };
  }, [stopRecorder]);

  const side = SIDES[sideIndex];

  const playSide = async () => {
    setTonePlaying(true);
    const { levelDb, capped: c } = applyLevelCap(TONE_LEVEL_DB, maxVolume);
    setCapped(c);
    try { await playBurst(1000, { ms: TONE_MS, levelDb, channel: side }); } catch (e) { console.warn(e); }
    setTimeout(() => { if (!cancelled.current) { setTonePlaying(false); setPlayed(true); } }, TONE_MS + 100);
  };

  const answerSide = (a: SideAnswer) => {
    const list = [...answers, a];
    if (sideIndex + 1 < SIDES.length) {
      setAnswers(list);
      setSideIndex(sideIndex + 1);
      setPlayed(false);
      return;
    }
    const ok = list.every((ans, i) => ans === SIDES[i]);
    setAnswers(list);
    setVerified(ok);
  };

  const retrySides = () => { setAnswers([]); setSideIndex(0); setPlayed(false); setVerified(null); };

  const measureAmbient = async () => {
    setAmbient('measuring');
    setAvgDb(null);
    samples.current = [];
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) { setAmbient('denied'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      measuring.current = true;
      recorder.record();
      await new Promise<void>((res) => setTimeout(res, AMBIENT_SAMPLE_MS));
      const vals = samples.current;
      measuring.current = false;
      await stopRecorder();
      if (cancelled.current) return;
      if (!vals.length) { setAmbient('error'); return; }
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      setAvgDb(avg);
      setAmbient(avg < AMBIENT_PASS_DBFS ? 'ok' : 'noisy');
    } catch (e) {
      console.warn('ambient check failed', e);
      measuring.current = false;
      await stopRecorder();
      if (!cancelled.current) setAmbient('error');
    }
  };

  const finish = (ambientOk: boolean) => {
    void stopRecorder();
    const sep = next.includes('?') ? '&' : '?';
    router.replace(`${next}${sep}ok=${ambientOk ? 1 : 0}&hp=${verified ? 1 : 0}`);
  };

  const liveDb = ambient === 'measuring' && typeof state.metering === 'number' && Number.isFinite(state.metering) ? state.metering : (avgDb ?? undefined);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('psy.hp.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.hp.intro.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.hp.intro.body')}</Text>
          <Card>
            <Step icon={<Volume2 size={22} color={colors.primary} />} text={t('psy.hp.step.quiet')} />
            <Step icon={<Headphones size={22} color={colors.primary} />} text={t('psy.hp.step.headphones')} />
            <Step icon={<Volume2 size={22} color={colors.primary} />} text={t('psy.hp.step.volume')} />
          </Card>
          <Banner tone="info" title={t('psy.hp.mono.title')} body={t('psy.hp.mono.body')} />
          <Button title={t('common.continue')} onPress={() => setPhase('tone')} />
          <Button variant="ghost" title={t('psy.hp.skip')} onPress={() => finish(false)} />
        </>
      )}

      {phase === 'tone' && (
        <>
          <Text variant="h1">{t('psy.hp.tone.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.hp.tone.body')}</Text>
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          {verified == null ? (
            <>
              <Text variant="overline" tone="secondary">{t('psy.hp.side.step', { i: sideIndex + 1, n: SIDES.length })}</Text>
              <Button title={tonePlaying ? t('psy.playing') : played ? t('psy.listenAgain') : t('psy.hp.playTone')} loading={tonePlaying} onPress={() => void playSide()} icon={<Headphones size={20} color={colors.onPrimary} />} />
              {played ? (
                <Card title={t('psy.hp.side.q')}>
                  <View style={{ gap: space[2] }}>
                    {ANSWERS.map((a) => <OptionCard key={a} label={t(`psy.hp.side.${a}`)} selected={false} onPress={() => answerSide(a)} />)}
                  </View>
                </Card>
              ) : null}
            </>
          ) : verified ? (
            <>
              <Banner tone="success" title={t('psy.hp.side.ok')} body={t('psy.hp.side.okBody')} />
              <Button title={t('common.continue')} onPress={() => setPhase('ambient')} />
            </>
          ) : (
            <>
              <Banner tone="warning" title={t('psy.hp.side.fail')} body={t('psy.hp.side.failBody')} />
              <Button title={t('psy.hp.side.retry')} onPress={retrySides} />
              <Button variant="secondary" title={t('psy.hp.side.continueUnverified')} onPress={() => setPhase('ambient')} />
            </>
          )}
          <Button variant="ghost" title={t('psy.hp.skip')} onPress={() => finish(false)} />
        </>
      )}

      {phase === 'ambient' && (
        <>
          <Text variant="h1">{t('psy.hp.ambient.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.hp.ambient.body')}</Text>
          <Card>
            <LevelMeter dbfs={liveDb} thresholdDbfs={AMBIENT_PASS_DBFS} accessibilityLabel={t('psy.hp.ambient.meter')} />
            {avgDb != null ? <Text variant="bodySmall" tone="secondary">{t('psy.hp.ambient.level', { db: Math.round(avgDb) })} · {t('psy.estimateTag')}</Text> : null}
          </Card>
          {ambient === 'ok' ? <Banner tone="success" title={t('psy.hp.ambient.ok')} /> : null}
          {ambient === 'noisy' ? <Banner tone="warning" title={t('psy.hp.ambient.noisy')} /> : null}
          {ambient === 'denied' ? <Banner tone="info" title={t('psy.hp.ambient.denied')} /> : null}
          {ambient === 'error' ? <Banner tone="info" title={t('psy.hp.ambient.error')} /> : null}
          {ambient === 'idle' || ambient === 'measuring' ? (
            <Button title={ambient === 'measuring' ? t('psy.hp.ambient.measuring') : t('psy.hp.ambient.start')} loading={ambient === 'measuring'} onPress={() => void measureAmbient()} icon={<Mic size={20} color={colors.onPrimary} />} />
          ) : null}
          {ambient === 'noisy' || ambient === 'error' ? <Button variant="secondary" title={t('psy.hp.ambient.again')} onPress={() => void measureAmbient()} /> : null}
          {ambient === 'ok' ? <Button title={t('psy.hp.continue')} onPress={() => finish(true)} /> : null}
          {ambient !== 'idle' && ambient !== 'measuring' && ambient !== 'ok' ? <Button title={t('psy.hp.skip')} onPress={() => finish(false)} /> : null}
          {ambient === 'idle' ? <Button variant="ghost" title={t('psy.hp.skip')} onPress={() => finish(false)} /> : null}
        </>
      )}
    </Screen>
  );
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
      <View style={{ width: 28, alignItems: 'center', paddingTop: 2 }}>{icon}</View>
      <Text variant="body" style={{ flex: 1 }}>{text}</Text>
    </View>
  );
}
