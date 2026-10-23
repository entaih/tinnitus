import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Play, RotateCcw } from 'lucide-react-native';
import { Banner, Button, Card, Chip, Disclaimer, EvidenceChip, OptionCard, Screen, Text, useCitation } from '@/components';
import { LogSlider } from '@/components/psycho';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId } from '@/hooks/useProfile';
import type { Side } from '@/clinical/types';
import { soundEngine } from '@/audio/engine';
import { playNarrowbandOnce, playToneOnce, sleep, stopAllOneShots } from '@/audio/psychoPlayer';
import {
  applyLevelCap, choosePitch, octaveCandidates, pitchRunLength, resolveOctaveChoice, roundHz, shuffleCandidates, startPitchRun,
  summarisePitchRuns, type OctaveCandidate, type PitchRunState, type PitchSummary,
} from '@/audio/psychoacoustics';

type Phase = 'intro' | 'setup' | 'afc' | 'octave' | 'adjust' | 'result';
type SoundType = 'tonal' | 'hiss' | 'buzz' | 'multiple';
const RUNS = 3;
const STIM_MS = 1500;
const INTER_MS = 400;
/** Comfortable presentation level for the NBN pair (dB re full scale, before the user cap). */
const AFC_LEVEL_DB = -12;

export default function PitchScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space, radius } = useTheme();
  const maxVolume = useSettings((s) => s.maxVolume);
  const savePsycho = useClinical((s) => s.savePsycho);
  const assessmentId = useAssessmentId();
  const { open, sheet } = useCitation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [side, setSide] = useState<Side>('both');
  const [soundType, setSoundType] = useState<SoundType>('tonal');
  const [run, setRun] = useState<PitchRunState>(() => startPitchRun());
  const [runIndex, setRunIndex] = useState(0);
  const [runResults, setRunResults] = useState<number[]>([]);
  const [anchor, setAnchor] = useState<number | undefined>(undefined);
  const [octaveChecked, setOctaveChecked] = useState(false);
  const [playing, setPlaying] = useState<'a' | 'b' | number | null>(null);
  const [canChoose, setCanChoose] = useState(false);
  const [candidates, setCandidates] = useState<OctaveCandidate[]>([]);
  const [summary, setSummary] = useState<PitchSummary | null>(null);
  const [adjustHz, setAdjustHz] = useState(4000);
  const [method, setMethod] = useState<'afc' | 'adjust'>('afc');
  const [finalHz, setFinalHz] = useState<number | null>(null);
  const [capped, setCapped] = useState(false);
  const [saved, setSaved] = useState(false);

  const seq = useRef(0);
  const level = applyLevelCap(AFC_LEVEL_DB, maxVolume);
  useEffect(() => { if (level.capped) setCapped(true); }, [level.capped]);

  const stopAll = useCallback(() => { seq.current++; stopAllOneShots(); void soundEngine.stopAll(); }, []);
  useEffect(() => () => stopAll(), [stopAll]);

  const runOpts = anchor != null ? { anchorHz: anchor } : {};
  const stepsPerRun = pitchRunLength(anchor != null ? 1 : undefined);

  /** Play A then B; enable the buttons afterwards. */
  const playPair = useCallback(async (state: PitchRunState) => {
    const my = ++seq.current;
    stopAllOneShots();
    setCanChoose(false);
    try {
      setPlaying('a');
      const ha = await playNarrowbandOnce(state.a, { ms: STIM_MS, levelDb: level.levelDb });
      await ha.finished;
      if (my !== seq.current) return;
      await sleep(INTER_MS);
      if (my !== seq.current) return;
      setPlaying('b');
      const hb = await playNarrowbandOnce(state.b, { ms: STIM_MS, levelDb: level.levelDb });
      await hb.finished;
    } catch (e) { console.warn(e); }
    if (my !== seq.current) return;
    setPlaying(null);
    setCanChoose(true);
  }, [level.levelDb]);

  const beginRuns = (anchorHz?: number) => {
    setAnchor(anchorHz);
    setRunIndex(0);
    setRunResults([]);
    const s = startPitchRun(anchorHz != null ? { anchorHz } : {});
    setRun(s);
    setPhase('afc');
    void playPair(s);
  };

  const choose = (choice: 'a' | 'b') => {
    if (!canChoose) return;
    void Haptics.selectionAsync();
    const next = choosePitch(run, choice, runOpts);
    if (!next.done) { setRun(next); void playPair(next); return; }
    const results = [...runResults, next.estimateHz!];
    setRunResults(results);
    if (runIndex + 1 < RUNS) {
      const s = startPitchRun(anchor != null ? { anchorHz: anchor } : {});
      setRunIndex(runIndex + 1);
      setRun(s);
      void playPair(s);
      return;
    }
    const sum = summarisePitchRuns(results);
    setSummary(sum);
    if (!octaveChecked) {
      setCandidates(shuffleCandidates(octaveCandidates(sum.estimateHz)));
      setCanChoose(false);
      setPhase('octave');
    } else {
      setAdjustHz(sum.estimateHz);
      setPhase('adjust');
    }
  };

  const playCandidates = useCallback(async (list: OctaveCandidate[]) => {
    const my = ++seq.current;
    stopAllOneShots();
    setCanChoose(false);
    try {
      for (let i = 0; i < list.length; i++) {
        setPlaying(i);
        const h = await playNarrowbandOnce(list[i].hz, { ms: STIM_MS, levelDb: level.levelDb });
        await h.finished;
        if (my !== seq.current) return;
        await sleep(INTER_MS);
        if (my !== seq.current) return;
      }
    } catch (e) { console.warn(e); }
    if (my !== seq.current) return;
    setPlaying(null);
    setCanChoose(true);
  }, [level.levelDb]);

  useEffect(() => { if (phase === 'octave' && candidates.length) void playCandidates(candidates); }, [phase, candidates, playCandidates]);

  const chooseOctave = (c: OctaveCandidate) => {
    if (!canChoose || !summary) return;
    setOctaveChecked(true);
    const r = resolveOctaveChoice(summary.estimateHz, c);
    if (r.rerun) { beginRuns(r.anchorHz); return; }
    setAdjustHz(summary.estimateHz);
    setPhase('adjust');
  };

  const preview = async (hz: number) => {
    const my = ++seq.current;
    stopAllOneShots();
    setPlaying('a');
    try {
      const h = await playToneOnce(hz, { ms: 1000, levelDb: applyLevelCap(-20, maxVolume).levelDb, warble: true });
      await h.finished;
    } catch (e) { console.warn(e); }
    if (my === seq.current) setPlaying(null);
  };

  const finishWith = (hz: number, m: 'afc' | 'adjust') => { stopAll(); setFinalHz(hz); setMethod(m); setPhase('result'); };

  const save = () => {
    if (!finalHz || !summary || saved) return;
    savePsycho(assessmentId, { pitchHz: Math.round(finalHz), pitchConfidence: summary.confidence });
    setSaved(true);
  };

  const restart = () => { stopAll(); setOctaveChecked(false); setSummary(null); setFinalHz(null); setSaved(false); setPhase('setup'); };

  const choiceBtn = (label: string, a11y: string, active: boolean, onPress: () => void) => (
    <Pressable
      accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ disabled: !canChoose, selected: active }}
      disabled={!canChoose} onPress={onPress}
      style={({ pressed }) => ({ flex: 1, height: 120, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 2,
        borderColor: active ? colors.primary : colors.border, backgroundColor: canChoose ? (pressed ? colors.primaryPressed : colors.primary) : active ? colors.primarySoft : colors.card })}
    >
      <Text variant="display" style={{ color: canChoose ? colors.onPrimary : active ? colors.primary : colors.textMuted }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: t('psy.pitch.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.pitch.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.pitch.intro.body')}</Text>
          <Card><Text variant="body">{t('psy.pitch.intro.nbn')}</Text></Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('vielsmeier2020')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.pitch.evidence')}</Text>
          </View>
          <Button title={t('common.continue')} onPress={() => setPhase('setup')} />
        </>
      )}

      {phase === 'setup' && (
        <>
          <Text variant="h2">{t('psy.pitch.side.title')}</Text>
          {(['left', 'right', 'both', 'head'] as Side[]).map((s) => (
            <OptionCard key={s} label={t(`psy.pitch.side.${s}`)} selected={side === s} onPress={() => setSide(s)} />
          ))}
          <Text variant="h2" style={{ marginTop: space[2] }}>{t('psy.pitch.type.title')}</Text>
          {(['tonal', 'hiss', 'buzz', 'multiple'] as SoundType[]).map((s) => (
            <OptionCard key={s} label={t(`psy.pitch.type.${s}`)} selected={soundType === s} onPress={() => setSoundType(s)} />
          ))}
          <Button title={t('common.start')} onPress={() => beginRuns(undefined)} />
        </>
      )}

      {phase === 'afc' && (
        <>
          <Text variant="overline" tone="secondary">{t('psy.pitch.afc.run', { run: runIndex + 1, step: Math.min(run.step + 1, stepsPerRun), n: stepsPerRun })}</Text>
          <View style={{ height: 4, borderRadius: radius.full, backgroundColor: colors.primaryTrack }}>
            <View style={{ width: `${Math.round(((runIndex * stepsPerRun + run.step) / (RUNS * stepsPerRun)) * 100)}%`, height: 4, borderRadius: radius.full, backgroundColor: colors.primary }} />
          </View>
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Text variant="h2" center style={{ marginTop: space[4] }}>{t('psy.pitch.afc.question')}</Text>
          <Text variant="bodySmall" tone="secondary" center accessibilityLiveRegion="polite">
            {playing === 'a' ? t('psy.pitch.afc.playingA') : playing === 'b' ? t('psy.pitch.afc.playingB') : canChoose ? t('psy.pitch.afc.choose') : ' '}
          </Text>
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            {choiceBtn(t('psy.pitch.afc.a'), t('psy.pitch.afc.a11yA'), playing === 'a', () => choose('a'))}
            {choiceBtn(t('psy.pitch.afc.b'), t('psy.pitch.afc.a11yB'), playing === 'b', () => choose('b'))}
          </View>
          <Button variant="secondary" title={t('psy.listenAgain')} disabled={playing != null} icon={<RotateCcw size={18} color={colors.primary} />} onPress={() => void playPair(run)} />
          <Button variant="ghost" title={t('psy.stopTest')} onPress={restart} />
        </>
      )}

      {phase === 'octave' && summary && (
        <>
          <Text variant="h2">{t('psy.pitch.octave.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.pitch.octave.body')}</Text>
          {anchor != null ? <Banner tone="info" title={t('psy.pitch.octave.rerun')} /> : null}
          <Text variant="bodySmall" tone="secondary" center accessibilityLiveRegion="polite">{typeof playing === 'number' ? t('psy.pitch.octave.playing', { n: playing + 1 }) : ' '}</Text>
          {candidates.map((c, i) => (
            <OptionCard key={c.relation} label={t('psy.pitch.octave.opt', { n: i + 1 })} selected={playing === i} onPress={() => chooseOctave(c)} />
          ))}
          <Button variant="secondary" title={t('psy.listenAgain')} disabled={playing != null} icon={<RotateCcw size={18} color={colors.primary} />} onPress={() => void playCandidates(candidates)} />
        </>
      )}

      {phase === 'adjust' && summary && (
        <>
          <Text variant="h2">{t('psy.pitch.adjust.title')}</Text>
          <Text variant="body" tone="secondary">{t('psy.pitch.adjust.body')}</Text>
          <Card>
            <LogSlider value={adjustHz} onChange={setAdjustHz} onCommit={(hz) => void preview(hz)} accessibilityLabel={t('psy.pitch.adjust.a11y')} />
            <Button variant="secondary" title={t('psy.pitch.adjust.preview')} icon={<Play size={18} color={colors.primary} />} onPress={() => void preview(adjustHz)} />
          </Card>
          <Button title={t('psy.pitch.adjust.use')} onPress={() => finishWith(adjustHz, 'adjust')} />
          <Button variant="ghost" title={t('psy.pitch.adjust.skip')} onPress={() => finishWith(summary.estimateHz, 'afc')} />
        </>
      )}

      {phase === 'result' && summary && finalHz != null && (
        <>
          <Text variant="h1">{t('psy.pitch.result.title')}</Text>
          <Card>
            <Text variant="numeric">{roundHz(finalHz).toLocaleString('tr-TR')} Hz</Text>
            <Text variant="bodySmall" tone="secondary">{t('psy.pitch.result.band', { lo: roundHz(summary.lowHz), hi: roundHz(summary.highHz) })}</Text>
            <View style={{ flexDirection: 'row', gap: space[2], flexWrap: 'wrap' }}>
              <Chip tone={summary.confidence === 'high' ? 'success' : summary.confidence === 'medium' ? 'primary' : 'warning'} label={t('psy.pitch.result.conf', { c: t(`psy.pitch.conf.${summary.confidence}`) })} />
              <Chip label={t('psy.pitch.result.method', { m: t(`psy.pitch.method.${method}`) })} />
              <Chip label={t(`psy.pitch.side.${side}`)} />
            </View>
            {summary.confidence === 'low' ? <Text variant="bodySmall" tone="warning">{t('psy.pitch.result.lowHint')}</Text> : null}
            <Text variant="bodySmall" tone="secondary">{t('psy.pitch.result.use')}</Text>
          </Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <EvidenceChip level="rct" onPress={() => open('wunderlich2015')} />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('psy.pitch.evidence')}</Text>
          </View>
          <Button title={saved ? t('psy.pitch.continueLoudness') : t('psy.saveContinue')} onPress={() => { save(); router.replace(`/assess/loudness?hz=${Math.round(finalHz)}`); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('psy.redo')} onPress={restart} />
          <Disclaimer />
        </>
      )}
      {sheet}
    </Screen>
  );
}
