import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Banner, Button, Card, Chip, Disclaimer, OptionCard, Screen, Text } from '@/components';
import { EstimateNote, useExamFinish } from '@/components/exam';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import { applyLevelCap, capDbFor } from '@/audio/psychoacoustics';
import { LDL_FREQS, LDL_START_DB, LDL_STEP_DB, ldlCeilingDb, ldlDynamicRangeDb, respondLdl, startLdl, summariseLdl, type LdlResponse, type LdlState } from '@/audio/examTests';

type Phase = 'painQ' | 'intro' | 'run' | 'stopped' | 'result';
const BURST_MS = 1000;
const GAP_MS = 600;
const RESPONSES: LdlResponse[] = ['comfortable', 'loudOk', 'uncomfortable'];

/**
 * "Ses rahatlık öz-bildirimi" — loudness-comfort self-report at 1 kHz: −50 dBFS start, 3 dB steps, ceiling
 * 10 dB below the user's cap, three-level response. Disabled when HQ ≥ 28 or when the user reports that sound
 * causes pain (asked inline). This is not a clinical LDL; the record is in dB re full scale.
 */
export default function LoudnessDiscomfortScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space } = useTheme();
  const { assessment } = useProfile();
  const maxVolume = useSettings((s) => s.maxVolume);
  const saveExam = useClinical((s) => s.saveExam);
  const assessmentId = useAssessmentId();
  const { finish, inSequence, eligibility } = useExamFinish('ldl');
  const capDb = capDbFor(maxVolume);
  const ceilingDb = ldlCeilingDb(capDb);
  const capped = capDb < 0;

  const [phase, setPhase] = useState<Phase>('painQ');
  const [pain, setPain] = useState<boolean | null>(null);
  const [freqIndex, setFreqIndex] = useState(0);
  const [run, setRun] = useState<LdlState>(() => startLdl(LDL_FREQS[0], ceilingDb));
  const [runs, setRuns] = useState<LdlState[]>([]);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const runRef = useRef(run);
  runRef.current = run;
  const cancelled = useRef(false);
  /** Run generation: a burst interrupted by stop/repeat must not touch the state of the next run. */
  const gen = useRef(0);

  const stopEverything = useCallback(() => { stopAllOneShots(); void soundEngine.stopAll(); }, []);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; stopEverything(); };
  }, [stopEverything]);

  /** Present the current level (always clamped to the user's cap and 0 dBFS; the run itself stops at the ceiling). */
  const present = async (state: LdlState) => {
    const myGen = gen.current;
    const stale = () => cancelled.current || myGen !== gen.current;
    setPlaying(true);
    await sleep(GAP_MS);
    if (stale()) return;
    const lv = applyLevelCap(Math.min(state.level, ceilingDb), maxVolume);
    try {
      const h = await playToneOnce(state.freq, { ms: BURST_MS, levelDb: lv.levelDb, warble: true });
      await h.finished;
    } catch (e) { console.warn(e); }
    if (stale()) return;
    setPlaying(false);
  };

  const startFreq = (index: number) => {
    const s = startLdl(LDL_FREQS[index], ceilingDb);
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

  const respond = (r: LdlResponse) => {
    if (playing) return;
    void Haptics.selectionAsync();
    const next = respondLdl(runRef.current, r);
    runRef.current = next; setRun(next);
    if (next.done) { completeRun(next); return; }
    void present(next);
  };

  const painStop = () => { gen.current += 1; void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); stopEverything(); setPhase('stopped'); };

  const summary = summariseLdl(runs, ceilingDb);
  const threshold1k = assessment?.hearing?.thresholds.filter((x) => x.freq === 1000).map((x) => x.levelDb);
  const bestThreshold1k = threshold1k && threshold1k.length ? Math.min(...threshold1k) : null;
  const dynamicRange = ldlDynamicRangeDb(summary.anyAtCap ? null : summary.ldlDb, bestThreshold1k);
  const loudOk = runs.find((r) => r.loudOkDb != null)?.loudOkDb;

  const save = () => {
    if (saved || phase !== 'result') return;
    saveExam(assessmentId, { ldlDb: summary.ldlDb, ldlLow: summary.ldlLow });
    setSaved(true);
  };

  const range = Math.max(1, ceilingDb - LDL_START_DB);
  const frac = Math.max(0, Math.min(1, (run.level - LDL_START_DB) / range));

  const blocked = !eligibility.ldl || pain === true;
  const reasons = [...eligibility.ldlReasons, ...(pain === true ? ['exam.gate.pain'] : [])];

  if (blocked) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('exam.ldl.title') }} />
        <Text variant="h1">{t('exam.ldl.title')}</Text>
        <Banner tone="warning" title={t('exam.gate.disabled')} body={t('exam.gate.ldl.body')} />
        <Card>
          <Text variant="overline" tone="secondary">{t('exam.gate.reasons')}</Text>
          {reasons.map((r) => <Text key={r} variant="body">• {t(r)}</Text>)}
        </Card>
        <Button title={t('exam.skip')} onPress={finish} />
        {pain === true && eligibility.ldl ? <Button variant="ghost" title={t('exam.gate.pain.change')} onPress={() => setPain(null)} /> : null}
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.ldl.title') }} />

      {phase === 'painQ' && (
        <>
          <Text variant="h1">{t('exam.ldl.title')}</Text>
          <Text variant="body" tone="secondary">{t('exam.gate.pain.intro')}</Text>
          <Text variant="h2">{t('exam.gate.pain.q')}</Text>
          <View style={{ gap: space[2] }}>
            <OptionCard label={t('common.yes')} selected={false} onPress={() => setPain(true)} />
            <OptionCard label={t('common.no')} selected={pain === false} onPress={() => { setPain(false); setPhase('intro'); }} />
          </View>
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('exam.ldl.title')}</Text>
          <Banner tone="info" title={t('exam.headphones')} body={t('exam.volumeHint')} />
          <Text variant="body" tone="secondary">{t('exam.ldl.intro.body', { start: LDL_START_DB, step: LDL_STEP_DB, ceil: Math.round(ceilingDb) })}</Text>
          <Banner tone="danger" title={t('exam.ldl.safety.title')} body={t('exam.ldl.safety.body')} />
          {capped ? <Banner tone="info" title={t('exam.capped')} /> : null}
          <Button title={t('common.start')} onPress={begin} />
          <Button variant="ghost" title={t('exam.skip')} onPress={finish} />
        </>
      )}

      {phase === 'run' && (
        <>
          <Text variant="overline" tone="secondary">{t('exam.ldl.freq', { hz: run.freq })} · {t('exam.ldl.presentation', { i: run.presentations + 1 })}</Text>
          <Card>
            <Text variant="numeric" center>{t('exam.ldl.level', { db: Math.round(run.level) })}</Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack }}>
              <View style={{ width: `${Math.round(frac * 100)}%`, height: 6, borderRadius: 3, backgroundColor: run.reachedCap ? colors.warning : colors.primary }} />
            </View>
            <Text variant="bodySmall" tone="secondary" center accessibilityLiveRegion="polite">{playing ? t('exam.ldl.playing') : t('exam.ldl.question')}</Text>
          </Card>
          {run.reachedCap ? <Banner tone="warning" title={t('exam.ldl.capReached')} /> : null}
          <View style={{ gap: space[2] }}>
            {RESPONSES.map((r) => (
              <Button key={r} style={{ minHeight: 60 }} variant={r === 'uncomfortable' ? 'primary' : 'secondary'} title={t(`exam.ldl.resp.${r}`)} disabled={playing} onPress={() => respond(r)} />
            ))}
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
              <Text variant="numeric">{summary.anyAtCap ? t('exam.ldl.result.atCeiling') : t('exam.ldl.result.value', { db: summary.ldlDb })}</Text>
              <Chip tone="info" label={t('exam.result.recorded')} />
            </View>
            {summary.perFreq.map((p) => (
              <Text key={p.freq} variant="bodySmall" tone="secondary">
                {p.atCap ? t('exam.ldl.result.perFreqCap', { hz: p.freq, db: Math.round(ceilingDb) }) : t('exam.ldl.result.perFreq', { hz: p.freq, db: Math.round(p.levelDb) })}
              </Text>
            ))}
            {loudOk != null ? <Text variant="bodySmall" tone="secondary">{t('exam.ldl.result.loudOk', { db: Math.round(loudOk) })}</Text> : null}
            {dynamicRange != null ? <Text variant="bodySmall" tone="secondary">{t('exam.ldl.result.dynamicRange', { db: dynamicRange, th: bestThreshold1k ?? 0 })}</Text> : null}
            <Text variant="bodySmall" tone="secondary">{t('exam.ldl.result.hint')}</Text>
          </Card>
          <Banner tone="info" title={t('exam.ldl.result.clinician')} body={t('exam.ldl.result.clinicianBody')} />
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
