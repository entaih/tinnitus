import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { File } from 'expo-file-system';
import { Headphones, Mic, Volume2 } from 'lucide-react-native';
import { Banner, Button, Card, Screen, Text } from '@/components';
import { LevelMeter } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { playBurst, soundEngine } from '@/audio/engine';
import { invalidatePlaybackMode, stopAllOneShots } from '@/audio/psychoPlayer';
import { applyLevelCap } from '@/audio/psychoacoustics';

const AMBIENT_PASS_DBFS = -40;
const AMBIENT_SAMPLE_MS = 3000;
const DEFAULT_NEXT = '/assess/hearing';

type Phase = 'intro' | 'tone' | 'ambient' | 'done';
type Ambient = 'idle' | 'measuring' | 'ok' | 'noisy' | 'denied' | 'error';

/** Playback audio mode, re-applied after the microphone session so iOS leaves .playAndRecord. */
const PLAYBACK_MODE = { playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' as const, allowsRecording: false };

export default function HeadphoneCheckScreen() {
  const t = useT();
  const { colors, space } = useTheme();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = typeof params.next === 'string' && params.next.startsWith('/') ? params.next : DEFAULT_NEXT;
  const maxVolume = useSettings((s) => s.maxVolume);

  const [phase, setPhase] = useState<Phase>('intro');
  const [tonePlaying, setTonePlaying] = useState(false);
  const [toneHeard, setToneHeard] = useState<boolean | null>(null);
  const [ambient, setAmbient] = useState<Ambient>('idle');
  const [avgDb, setAvgDb] = useState<number | null>(null);
  const [capped, setCapped] = useState(false);

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 200);
  const samples = useRef<number[]>([]);
  const measuring = useRef(false);

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

  useEffect(() => () => {
    void stopRecorder();
    stopAllOneShots();
    void soundEngine.stopAll();
  }, [stopRecorder]);

  const playTone = async () => {
    setTonePlaying(true);
    setToneHeard(null);
    const { levelDb, capped: c } = applyLevelCap(-20, maxVolume);
    setCapped(c);
    try { await playBurst(1000, { ms: 800, levelDb }); } catch (e) { console.warn(e); }
    setTimeout(() => setTonePlaying(false), 900);
  };

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
      if (!vals.length) { setAmbient('error'); return; }
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      setAvgDb(avg);
      setAmbient(avg < AMBIENT_PASS_DBFS ? 'ok' : 'noisy');
    } catch (e) {
      console.warn('ambient check failed', e);
      measuring.current = false;
      await stopRecorder();
      setAmbient('error');
    }
  };

  const finish = (ok: boolean) => {
    void stopRecorder();
    const sep = next.includes('?') ? '&' : '?';
    router.replace(`${next}${sep}ok=${ok ? 1 : 0}`);
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
          <Button title={t('common.continue')} onPress={() => setPhase('tone')} />
          <Button variant="ghost" title={t('psy.hp.skip')} onPress={() => finish(false)} />
        </>
      )}

      {phase === 'tone' && (
        <>
          <Text variant="h1">{t('psy.hp.tone.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.hp.tone.body')}</Text>
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Button title={tonePlaying ? t('psy.playing') : t('psy.hp.playTone')} loading={tonePlaying} onPress={playTone} icon={<Headphones size={20} color={colors.onPrimary} />} />
          {toneHeard === false ? <Banner tone="warning" title={t('psy.hp.notHeard')} body={t('psy.hp.notHeardHint')} /> : null}
          <Card title={t('psy.hp.heardQ')}>
            <View style={{ flexDirection: 'row', gap: space[3] }}>
              <Button style={{ flex: 1 }} title={t('common.yes')} onPress={() => { setToneHeard(true); setPhase('ambient'); }} />
              <Button style={{ flex: 1 }} variant="secondary" title={t('psy.hp.notHeard')} onPress={() => setToneHeard(false)} />
            </View>
          </Card>
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
            <Button title={ambient === 'measuring' ? t('psy.hp.ambient.measuring') : t('psy.hp.ambient.start')} loading={ambient === 'measuring'} onPress={measureAmbient} icon={<Mic size={20} color={colors.onPrimary} />} />
          ) : null}
          {ambient === 'noisy' || ambient === 'error' ? <Button variant="secondary" title={t('psy.hp.ambient.again')} onPress={measureAmbient} /> : null}
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
