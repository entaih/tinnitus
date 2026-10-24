import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Banner, Button, Card, Chip, Disclaimer, Screen, Text } from '@/components';
import { EstimateNote, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import { applyLevelCap, capDbFor } from '@/audio/psychoacoustics';
import { LDL_FREQS, respondLdl, startLdl, summariseLdl, type LdlState } from '@/audio/examTests';

type Phase = 'intro' | 'run' | 'stopped' | 'result';
const BURST_MS = 1000;
const GAP_MS = 600;

export default function LoudnessDiscomfortScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space } = useTheme();
  const maxVolume = useSettings((s) => s.maxVolume);
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence } = useExamFinish('ldl');
  const capDb = capDbFor(maxVolume);
  const capped = capDb < 0;

  const [phase, setPhase] = useState<Phase>('intro');
  const [freqIndex, setFreqIndex] = useState(0);
  const [run, setRun] = useState<LdlState>(() => startLdl(LDL_FREQS[0], capDb));
  const [runs, setRuns] = useState<LdlState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const runRef = useRef(run);
  runRef.current = run;
  const cancelled = useRef(false);
  /** Run generation: a burst interrupted by stop/repeat must not touch the state of the next run. */
  const gen = useRef(0);

  const stopEverything = useCallback(() => { stopAllOneShots(); void soundEngine.stopAll(); void Speech.stop(); }, []);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; stopEverything(); };
  }, [stopEverything]);

  /** Present the current level (always clamped to the user's cap and 0 dBFS). */
  const present = async (state: LdlState) => {
    const myGen = gen.current;
    const stale = () => cancelled.current || myGen !== gen.current;
    setPlaying(true);
    await sleep(GAP_MS);
    if (stale()) return;
    const lv = applyLevelCap(state.level, maxVolume);
    try {
      const h = await playToneOnce(state.freq, { ms: BURST_MS, levelDb: lv.levelDb, warble: true });
      await h.finished;
    } catch (e) { console.warn(e); }
    if (stale()) return;
    setPlaying(false);
  };

  const startFreq = (index: number) => {
    const s = startLdl(LDL_FREQS[index], capDb);
    setFreqIndex(index);
    setRun(s); runRef.current = s;
    setPhase('run');
    void present(s);
  };

  const begin = () => { gen.current += 1; stopEverything(); setRuns([]); setSaved(false); startFreq(0); };

  const completeRun = (done: LdlState) => {
    const list = [...runs, done];
    setRuns(list);
    const nextIndex = freqIndex + 1;
    if (nextIndex < LDL_FREQS.length) startFreq(nextIndex);
    else { stopEverything(); setPhase('result'); }
  };

  const respond = (uncomfortable: boolean) => {
    if (playing) return;
    void Haptics.selectionAsync();
    const next = respondLdl(runRef.current, uncomfortable);
    runRef.current = next; setRun(next);
    if (next.done) { completeRun(next); return; }
    void present(next);
  };

  const painStop = () => { gen.current += 1; void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); stopEverything(); setPhase('stopped'); };

  const summary = summariseLdl(runs, capDb);
  const save = () => {
    if (saved || phase !== 'result') return;
    saveExam(assessmentId, { ldlDb: summary.ldlDb, ldlLow: summary.ldlLow });
    setSaved(true);
  };

  const range = Math.max(1, capDb - (-50));
  const frac = Math.max(0, Math.min(1, (run.level + 50) / range));

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.ldl.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.ldl.title')}</Text>
          <Banner tone="info" title={t('exam.headphones')} body={t('exam.volumeHint')} />
          <Text variant="body" tone="secondary">{t('exam.ldl.intro.body')}</Text>
          <Banner tone="danger" title={t('exam.ldl.safety.title')} body={t('exam.ldl.safety.body')} />
          {capped ? <Banner tone="info" title={t('exam.capped')} /> : null}
          <Button title={t('common.start')} onPress={begin} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'run' && (
        <>
          <Text variant="overline" tone="secondary">{t('exam.ldl.freq', { hz: run.freq })} · {t('exam.step', { i: freqIndex + 1, n: LDL_FREQS.length })}</Text>
          <Card>
            <Text variant="numeric" center>{t('exam.ldl.level', { db: Math.round(run.level) })}</Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack }}>
              <View style={{ width: `${Math.round(frac * 100)}%`, height: 6, borderRadius: 3, backgroundColor: run.reachedCap ? colors.warning : colors.primary }} />
            </View>
            <Text variant="bodySmall" tone="secondary" center accessibilityLiveRegion="polite">{playing ? t('exam.ldl.playing') : t('exam.ldl.question')}</Text>
          </Card>
          {run.reachedCap ? <Banner tone="warning" title={t('exam.ldl.capReached')} /> : null}
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Button style={{ flex: 1, minHeight: 72 }} variant="secondary" title={t('exam.ldl.comfortable')} disabled={playing} onPress={() => respond(false)} />
            <Button style={{ flex: 1, minHeight: 72 }} title={t('exam.ldl.uncomfortable')} disabled={playing} onPress={() => respond(true)} />
          </View>
          <Button variant="danger" title={t('exam.ldl.pain')} onPress={painStop} />
          <Button variant="ghost" title={t('exam.stop')} onPress={() => { gen.current += 1; stopEverything(); setPhase('intro'); }} />
        </>
      )}

      {phase === 'stopped' && (
        <>
          <Text variant="h1">{t('exam.ldl.title')}</Text>
          <Banner tone="danger" title={t('exam.ldl.stopped')} />
          <Button title={t('common.done')} onPress={finish} />
        </>
      )}

      {phase === 'result' && (
        <>
          <Text variant="h1">{t('exam.ldl.result.title')}</Text>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
              <Text variant="numeric">{t('exam.ldl.result.value', { db: summary.ldlDb })}</Text>
              <Chip tone={summary.ldlLow ? 'warning' : 'success'} label={summary.ldlLow ? t('exam.ldl.result.low') : t('exam.ldl.result.normal')} />
            </View>
            {summary.perFreq.map((p) => (
              <Text key={p.freq} variant="bodySmall" tone="secondary">
                {t('exam.ldl.result.perFreq', { hz: p.freq, db: Math.round(p.levelDb) })}{p.atCap ? ` · ${t('exam.ldl.result.atCap')}` : ''}
              </Text>
            ))}
            <Text variant="bodySmall" tone="secondary">{t('exam.ldl.result.hint')}</Text>
          </Card>
          {summary.ldlLow ? <Banner tone="info" title={t('exam.ldl.result.low')} body={t('exam.ldl.result.lowHint')} /> : null}
          {summary.anyAtCap ? <Banner tone="info" title={t('exam.ldl.capReached')} /> : null}
          <EstimateNote />
          <Button title={inSequence ? t('exam.saveNext') : t('exam.saveFinish')} onPress={() => { save(); finish(); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('exam.repeat')} onPress={begin} />
          {saved ? <Text variant="caption" tone="success">{t('exam.saved')}</Text> : null}
          <Disclaimer />
        </>
      )}
    </Screen>
  );
}
