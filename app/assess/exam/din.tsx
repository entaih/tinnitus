import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Banner, Button, Card, Chip, Disclaimer, Screen, Text } from '@/components';
import { EstimateNote, NumericKeypad, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import type { SoundSpec } from '@/audio/sounds';
import {
  DIN_MIN_SNR_DB, DIN_START_SNR_DB, DIN_TRIALS, dinNoiseVolume, dinPassed, dinSnrFloor, randomTriplet, respondDin, startDin, tripletCorrect, tripletUtterance,
  type DinState,
} from '@/audio/examTests';

type Phase = 'intro' | 'practice' | 'trial' | 'result' | 'ttsFail';
const LAYER_ID = 'din-noise';
/** Speech-shaped masker: white noise band-passed ≈ 300–4000 Hz (1100 Hz centre, 3.5 octaves). */
const NOISE_SPEC: SoundSpec = { kind: 'narrowband', color: 'white', centerHz: 1100, octaves: 3.5, seconds: 8 };
const SPEECH_WATCHDOG_MS = 10_000;
const FEEDBACK_MS = 900;

export default function DigitsInNoiseScreen() {
  useKeepAwake();
  const t = useT();
  const locale = useLocale();
  const { colors, space } = useTheme();
  const maxVolume = useSettings((s) => s.maxVolume);
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence } = useExamFinish('din');

  const snrFloor = dinSnrFloor(maxVolume);
  const [phase, setPhase] = useState<Phase>('intro');
  const [din, setDin] = useState<DinState>(() => startDin({ minSnrDb: snrFloor }));
  const [target, setTarget] = useState<number[]>([]);
  const [answer, setAnswer] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; target: number[] } | null>(null);
  const [saved, setSaved] = useState(false);

  const dinRef = useRef(din);
  dinRef.current = din;
  const cancelled = useRef(false);
  /** Run generation: bumped on start/abort so a trial interrupted by the user is not mistaken for a TTS failure. */
  const gen = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => { const id = setTimeout(() => { if (!cancelled.current) fn(); }, ms); timers.current.push(id); };

  const stopEverything = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopAllOneShots();
    void soundEngine.stopAll();
    void Speech.stop();
  }, []);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; stopEverything(); };
  }, [stopEverything]);

  /** Speak the triplet; resolves true on completion, false on error, interruption or watchdog timeout. */
  const speakTriplet = (digits: number[]) => new Promise<boolean>((resolve) => {
    let settled = false;
    const settle = (ok: boolean) => { if (settled) return; settled = true; clearTimeout(wd); resolve(ok); };
    const wd = setTimeout(() => settle(false), SPEECH_WATCHDOG_MS);
    try {
      Speech.speak(tripletUtterance(digits), {
        language: locale === 'tr' ? 'tr-TR' : 'en-US',
        rate: 0.9,
        useApplicationAudioSession: true,
        onDone: () => settle(true),
        onStopped: () => settle(false),
        onError: () => settle(false),
      });
    } catch (e) { console.warn('speech failed', e); settle(false); }
  });

  const runTrial = async (practice: boolean) => {
    const myGen = gen.current;
    const stale = () => cancelled.current || myGen !== gen.current;
    const digits = randomTriplet();
    setTarget(digits); setAnswer([]); setFeedback(null); setListening(true);
    const snr = practice ? DIN_START_SNR_DB : dinRef.current.snrDb;
    soundEngine.setVolume(LAYER_ID, dinNoiseVolume(snr, maxVolume).volume);
    await sleep(600);
    if (stale()) return;
    const ok = await speakTriplet(digits);
    if (stale()) return;
    if (!ok) { stopEverything(); setPhase('ttsFail'); return; }
    setListening(false);
  };

  const start = async () => {
    stopEverything();
    gen.current += 1;
    const myGen = gen.current;
    const s = startDin({ minSnrDb: snrFloor });
    setDin(s); dinRef.current = s;
    setSaved(false);
    setPhase('practice');
    setListening(true);
    try { await soundEngine.play(NOISE_SPEC, { id: LAYER_ID, volume: dinNoiseVolume(DIN_START_SNR_DB, maxVolume).volume }); } catch (e) { console.warn(e); }
    if (cancelled.current || myGen !== gen.current) return;
    await runTrial(true);
  };

  const submit = () => {
    if (answer.length !== 3 || listening || feedback) return;
    const correct = tripletCorrect(target, answer);
    setFeedback({ correct, target });
    void (correct ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.selectionAsync());
    if (phase === 'practice') { later(() => { setPhase('trial'); void runTrial(false); }, FEEDBACK_MS); return; }
    const next = respondDin(dinRef.current, correct);
    dinRef.current = next; setDin(next);
    if (next.done) { later(() => { stopEverything(); setPhase('result'); }, FEEDBACK_MS); return; }
    later(() => void runTrial(false), FEEDBACK_MS);
  };

  const abort = () => { gen.current += 1; stopEverything(); setPhase('intro'); };

  const srt = din.srtDb;
  const passed = srt != null ? dinPassed(srt) : false;
  const boundedByCap = srt != null && snrFloor > DIN_MIN_SNR_DB && srt <= snrFloor + 1;

  const save = () => {
    if (saved || srt == null) return;
    saveExam(assessmentId, { dinSrtDb: srt, dinPassed: passed });
    setSaved(true);
  };

  const trialNo = Math.min(DIN_TRIALS, din.trials.length + 1);

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.din.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.din.title')}</Text>
          <Banner tone="info" title={t('exam.headphones')} body={t('exam.volumeHint')} />
          <Text variant="body" tone="secondary">{t('exam.din.intro.body')}</Text>
          <Card><Text variant="body">{t('exam.din.intro.how')}</Text></Card>
          <Card variant="tinted">
            <Text variant="bodyStrong">{t('exam.din.practice')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('exam.din.practice.body')}</Text>
          </Card>
          <Button title={t('exam.din.startPractice')} onPress={() => void start()} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {(phase === 'practice' || phase === 'trial') && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="overline" tone="secondary">{phase === 'practice' ? t('exam.din.practice') : t('exam.din.trial', { i: trialNo, n: DIN_TRIALS })}</Text>
            {phase === 'trial' ? <Chip small label={t('exam.din.snr', { db: din.snrDb })} /> : null}
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack }}>
            <View style={{ width: `${phase === 'practice' ? 0 : Math.round((din.trials.length / DIN_TRIALS) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
          </View>
          <Card>
            <Text variant="h3" center accessibilityLiveRegion="polite">
              {listening ? t('exam.din.listening') : feedback ? (feedback.correct ? t('exam.din.correct') : t('exam.din.wrong', { d: feedback.target.join(' ') })) : t('exam.din.enter')}
            </Text>
          </Card>
          <NumericKeypad value={answer} onChange={setAnswer} disabled={listening || !!feedback} />
          <Button title={t('exam.din.submit')} disabled={answer.length !== 3 || listening || !!feedback} onPress={submit} style={{ minHeight: 60 }} />
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Button style={{ flex: 1 }} variant="ghost" title={t('exam.stop')} onPress={abort} />
          </View>
        </>
      )}

      {phase === 'ttsFail' && (
        <>
          <Text variant="h1">{t('exam.din.title')}</Text>
          <Banner tone="warning" title={t('exam.din.ttsFail.title')} body={t('exam.din.ttsFail.body')} />
          <Button title={t('exam.repeat')} onPress={() => void start()} />
          <Button variant="secondary" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'result' && srt != null && (
        <>
          <Text variant="h1">{t('exam.din.result.title')}</Text>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' }}>
              <Text variant="numeric">{t('exam.din.result.value', { db: srt })}</Text>
              <Chip tone={passed ? 'success' : 'warning'} label={passed ? t('exam.din.result.pass') : t('exam.din.result.fail')} />
            </View>
            <Text variant="bodySmall" tone="secondary">{t('exam.din.result.hint')}</Text>
          </Card>
          <Banner tone={passed ? 'success' : 'info'} title={passed ? t('exam.din.result.pass') : t('exam.din.result.fail')} body={passed ? t('exam.din.result.passHint') : t('exam.din.result.failHint')} />
          {boundedByCap ? <Banner tone="info" title={t('exam.din.capped')} /> : null}
          <EstimateNote />
          <Button title={inSequence ? t('exam.saveNext') : t('exam.saveFinish')} onPress={() => { save(); finish(); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('exam.repeat')} onPress={() => void start()} />
          {saved ? <Text variant="caption" tone="success">{t('exam.saved')}</Text> : null}
          <Disclaimer />
        </>
      )}
    </Screen>
  );
}
