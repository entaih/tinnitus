import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { CheckCircle2, FlaskConical, Moon, Plus, Square, Waves, X } from 'lucide-react-native';
import { Screen, Text, Button, Card, Chip, EvidenceChip, PlayControl, Banner, useCitation, SectionHeader } from '@/components';
import { Collapsible } from '@/components/home';
import { LayerRow, TIMER_OPTIONS, TimerChips, VolumeSlider, formatClock, mixer, useSoundEngine, useTicker } from '@/components/sound';
import { ThemeProvider, useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useProfile } from '@/hooks/useProfile';
import { programPosition } from '@/clinical/program';
import { bumpReentryNudge } from '@/notifications';
import { describeSpec, type SoundSpec } from '@/audio/sounds';
import { PRESETS, presetById, resolveNamedPreset, resolveSpec, type NamedPreset } from '@/audio/presets';
import { useMixingPoint, useOnceFlag } from '@/audio/mixingPoint';
import { hyperacusisCeilingDb } from '@/audio/examTests';
import { dbToGain } from '@/audio/dsp';
import { HYPER_COMFORT_START_DB, TUNE_BAND_LEVEL, comfortGain, hyperStartDb, shouldNudgeComfort, stepComfortDb, targetMinutes, tuneFor } from '@/audio/tuning';

type Params = { preset?: string; spec?: string; id?: string; octaves?: string; taskKey?: string; minutes?: string };
const NAMED: NamedPreset[] = ['enrichment', 'sleep', 'hyperacusis', 'notched', 'ri', 'custom'];
const KEEP_AWAKE_TAG = 'dingin.player';
const TUNED_LAYER_ID = 'narrowband.pitch';

export default function PlayerRoute() {
  const [sleepMode, setSleepMode] = useState(false);
  // Always keep the same tree shape so toggling sleep mode does not remount the player (which would flush the log and reload the preset).
  return (
    <ThemeProvider night={sleepMode}>
      <PlayerScreen sleepMode={sleepMode} onSleepMode={setSleepMode} />
    </ThemeProvider>
  );
}

function PlayerScreen({ sleepMode, onSleepMode }: { sleepMode: boolean; onSleepMode: (v: boolean) => void }) {
  const { colors, space, radius, night, isDark } = useTheme();
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const maxVolume = useSettings((s) => s.maxVolume);
  const soundTuneOverride = useSettings((s) => s.soundTuneOverride);
  const setSoundTuneOverride = useSettings((s) => s.setSoundTuneOverride);
  const hyperComfortDb = useSettings((s) => s.hyperComfortDb);
  const hyperComfortWeek = useSettings((s) => s.hyperComfortWeek);
  const setHyperComfort = useSettings((s) => s.setHyperComfort);
  const program = useClinical((s) => s.program);
  const logSession = useClinical((s) => s.logSession);
  const completeTask = useClinical((s) => s.completeTask);
  const { assessment } = useProfile();
  const pitchHz = assessment?.psycho?.pitchHz;
  const mp = useMixingPoint();
  const eng = useSoundEngine();
  const now = useTicker(eng.isPlaying || !!eng.timerEndsAt);
  const { open, sheet } = useCitation();
  const androidNote = useOnceFlag('androidBgNote');
  const dimHint = useOnceFlag('nightDimHint');
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [missingPitch, setMissingPitch] = useState(false);

  const presetName = (NAMED as string[]).includes(params.preset ?? '') ? (params.preset as NamedPreset) : null;
  const taskKey = typeof params.taskKey === 'string' && params.taskKey ? params.taskKey : undefined;
  const customSpec = useMemo<SoundSpec | undefined>(() => {
    if (!params.spec) return undefined;
    try { return JSON.parse(params.spec) as SoundSpec; } catch { return undefined; }
  }, [params.spec]);
  const octaves = params.octaves ? Number(params.octaves) : undefined;
  const week = program ? programPosition(program).week : 1;

  // C2 — pitch match → enrichment auto-tune (≤ 8 kHz, confidence not low, no manual override). Notched stays locked to program.notchHz.
  const tune = tuneFor(assessment?.psycho, soundTuneOverride);
  const tuneHz = presetName === 'enrichment' && tune.tuned ? tune.hz : undefined;
  const tunedLayerOn = presetName === 'enrichment' && eng.layers.some((l) => l.id === TUNED_LAYER_ID);

  // C3 — hyperacusis comfortable level: first open searches from −40 dBFS in 2 dB steps (ceiling −18); later opens start at the stored level.
  const ldlCeiling = dbToGain(hyperacusisCeilingDb(assessment?.exam));
  const [searchDb, setSearchDb] = useState(HYPER_COMFORT_START_DB);
  const hyperSearching = presetName === 'hyperacusis' && hyperComfortDb == null;
  const hyperGain = (db: number) => comfortGain(db, maxVolume, ldlCeiling);
  const hyperStartGain = hyperGain(hyperStartDb(hyperComfortDb));
  const hyperStartRef = useRef(hyperStartGain);
  hyperStartRef.current = hyperStartGain;
  const nudge = presetName === 'hyperacusis' && shouldNudgeComfort(hyperComfortDb, hyperComfortWeek, week);

  // Task target (C3): the task's minute target from the `minutes` param (default 20) for the hyperacusis preset or any task that passes minutes.
  const target = taskKey && (presetName === 'hyperacusis' || params.minutes) ? targetMinutes(params.minutes, 20) : null;
  const [done, setDone] = useState(false);
  const played = useRef({ sec: 0, last: null as number | null });
  useEffect(() => {
    if (eng.isPlaying) {
      if (played.current.last != null) played.current.sec += Math.max(0, now - played.current.last) / 1000;
      played.current.last = now;
    } else played.current.last = null;
  }, [now, eng.isPlaying]);
  const playedMin = Math.floor(played.current.sec / 60);
  // 2 s tolerance: the sleep timer stops playback at exactly the target, and the 1 s ticker may have logged slightly less.
  const targetReached = target != null && played.current.sec >= target * 60 - 2;

  const loadPreset = (opts: { tuneHz?: number } = { tuneHz }) => {
    if (!presetName) return;
    const resolved = resolveNamedPreset(presetName, {
      pitchHz, octaves, customSpec, customId: params.id, mixingPoint: mp.value,
      tuneHz: opts.tuneHz, tuneLevel: TUNE_BAND_LEVEL, hyperVolume: hyperStartRef.current,
    });
    if (!resolved) { setMissingPitch(presetName === 'notched' || presetName === 'ri'); return; }
    setMissingPitch(false);
    setLoading(true);
    const timer = presetName === 'hyperacusis' && target != null ? target : resolved.timerMinutes;
    void mixer.load(resolved.layers, Math.min(resolved.volume, maxVolume), timer, resolved.titleKey, resolved.presetId ?? null)
      .catch((e) => console.warn('player load failed', e))
      .finally(() => setLoading(false));
  };

  // Load the requested preset once the mixing point has been read. The tune/comfort inputs are read at load time only,
  // so a manual mixer change never triggers a reload that would wipe the user's layers.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!presetName || !mp.loaded) return;
    const key = `${presetName}|${params.spec ?? ''}|${params.id ?? ''}|${octaves ?? ''}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    loadPreset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetName, params.spec, params.id, octaves, mp.loaded]);

  // Keep the screen awake while playing (Android Expo Go stops background audio after ~3 min with the screen off).
  useEffect(() => {
    if (eng.isPlaying) void activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    else void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    return () => { void deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {}); };
  }, [eng.isPlaying]);

  // Session logging on pause / stop / unmount.
  const detailRef = useRef('');
  detailRef.current = JSON.stringify({ preset: presetName ?? eng.presetId ?? 'custom', layers: eng.layers.map((l) => l.id), master: Math.round(eng.master * 100) / 100, tunedHz: tunedLayerOn ? tune.hz : undefined });
  const flush = () => {
    const minutes = mixer.takeElapsedMinutes();
    if (minutes > 0) logSession({ type: 'sound', minutes, detail: detailRef.current });
  };
  useEffect(() => () => { flush(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const first = eng.layers[0];
  const title = eng.titleKey ? t(eng.titleKey) : first ? describeSpec(first.spec, t) : t('player.title');
  const remaining = eng.timerEndsAt ? Math.max(0, (eng.timerEndsAt - now) / 1000) : null;
  const clock = remaining != null ? formatClock(remaining) : formatClock(mixer.elapsedSec());
  const layerName = (id: string, spec: SoundSpec) => { const p = presetById(id); return p ? t(p.nameKey) : describeSpec(spec, t); };
  const mainPreset = eng.presetId ? presetById(eng.presetId) : undefined;
  const pct = (gain: number) => Math.round(gain * 100);

  const onPlayPress = () => {
    if (eng.isPlaying) { mixer.pause(); flush(); return; }
    if (eng.hasLayers) { mixer.resume(); return; }
    if (presetName) loadPreset();
    else setSheetOpen(true);
  };
  const onStop = () => { flush(); void mixer.stopAll(); };

  // Any manual change to a tuned enrichment mix turns the auto-tune off for good (until "back to auto-tune").
  const markManual = () => { if (presetName === 'enrichment' && tune.tuned) setSoundTuneOverride(true); };
  const addLayer = (id: string, spec: SoundSpec) => { setSheetOpen(false); markManual(); setLoading(true); void mixer.play(spec, id, 0.6).finally(() => setLoading(false)); };
  const onChangeTune = () => { setSoundTuneOverride(true); if (tunedLayerOn) void mixer.remove(TUNED_LAYER_ID); setSheetOpen(true); };
  const onRestoreTune = () => { setSoundTuneOverride(false); if (tune.hz) loadPreset({ tuneHz: tune.hz }); };

  // Hyperacusis comfort search.
  const stepSearch = (dir: 'up' | 'down') => { const r = stepComfortDb(searchDb, dir); setSearchDb(r.db); mixer.setMaster(hyperGain(r.db)); };
  const acceptSearch = () => { setHyperComfort(searchDb, week); mixer.setMaster(hyperGain(searchDb)); };
  const resetComfort = () => { setHyperComfort(null, null); setSearchDb(HYPER_COMFORT_START_DB); mixer.setMaster(hyperGain(HYPER_COMFORT_START_DB)); };
  const acceptNudge = () => { const r = stepComfortDb(hyperComfortDb ?? HYPER_COMFORT_START_DB, 'up'); setHyperComfort(r.db, week); mixer.setMaster(hyperGain(r.db)); };
  const laterNudge = () => { setHyperComfort(hyperComfortDb, week); };
  const atCeiling = stepComfortDb(searchDb, 'up').db === searchDb;

  const onCountDone = () => {
    if (!taskKey || done) return;
    completeTask(taskKey);
    setDone(true);
    void bumpReentryNudge();
  };

  const headerOpts = { title, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.primary, headerTitleStyle: { color: colors.text, fontWeight: '600' as const }, contentStyle: { backgroundColor: colors.bg } };
  const timerOptions = target != null && !TIMER_OPTIONS.includes(target) ? [target, ...TIMER_OPTIONS] : TIMER_OPTIONS;

  return (
    <>
      <Stack.Screen options={headerOpts} />
      {night ? <StatusBar style="light" /> : null}
      <Screen contentStyle={{ opacity: sleepMode ? 0.82 : 1 }}>
        {/* Hero: play control + clock */}
        <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[4] }}>
          <PlayControl size={88} playing={eng.isPlaying} onPress={onPlayPress} onLongPress={() => setSheetOpen(true)}
            accessibilityLabel={eng.isPlaying ? t('player.a11y.pause') : t('player.a11y.play')} />
          {loading ? <View style={{ width: 120, height: 3, borderRadius: 2, backgroundColor: colors.primaryTrack }} accessibilityLabel={t('common.loadingAudio')} /> : null}
          <Text variant="h2" center>{hyperSearching ? t('sound.hyper.first.title') : title}</Text>
          <Text variant="numeric" accessibilityLabel={remaining != null ? t('player.a11y.remaining', { time: clock }) : t('player.a11y.elapsed', { time: clock })}>{clock}</Text>
          <Text variant="caption" tone="secondary">{remaining != null ? t('player.remaining') : eng.isPlaying ? t('player.elapsed') : eng.hasLayers ? t('player.paused') : loading ? t('common.loadingAudio') : t('player.ready')}</Text>
          {tunedLayerOn && tune.hz ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip tone="primary" icon={<Waves size={14} color={colors.primaryPressed} />} label={t('sound.tuned', { hz: tune.hz.toLocaleString('tr-TR') })} />
              <Button variant="ghost" size="sm" title={t('sound.tuned.change')} onPress={onChangeTune} />
            </View>
          ) : null}
          {eng.hasLayers ? <Button variant="ghost" size="sm" title={t('common.stop')} icon={<Square size={16} color={colors.primary} />} onPress={onStop} /> : null}
        </View>

        {missingPitch ? (
          <Card variant="tinted" title={t('lab.needsPitchTitle')}>
            <Text variant="bodySmall" tone="secondary">{t('lab.needsPitchBody')}</Text>
            <Button variant="secondary" title={t('lab.doPitchMatch')} onPress={() => router.push('/assess/pitch')} />
          </Card>
        ) : null}

        {Platform.OS === 'android' && androidNote.show ? (
          <Banner tone="info" title={t('player.androidNote.title')} body={t('player.androidNote.body')} primary={{ title: t('common.understood'), onPress: androidNote.dismiss }} />
        ) : null}

        {/* Hyperacusis: comfortable-level search on the first open (C3) */}
        {hyperSearching ? (
          <Card variant="tinted" title={t('sound.hyper.first.title')} overline={t('player.hyper.week', { week })}>
            <Text variant="body">{t('sound.hyper.first.body')}</Text>
            <Text variant="bodyStrong" tone="warning">{t('player.hyper.never')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('sound.hyper.first.level', { pct: pct(hyperGain(searchDb)) })}</Text>
            {atCeiling ? <Text variant="bodySmall" tone="warning">{t('sound.hyper.first.ceiling')}</Text> : null}
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <View style={{ flex: 1 }}><Button variant="secondary" title={t('sound.hyper.first.down')} disabled={searchDb <= HYPER_COMFORT_START_DB} onPress={() => stepSearch('down')} /></View>
              <View style={{ flex: 1 }}><Button variant="secondary" title={t('sound.hyper.first.up')} disabled={atCeiling} onPress={() => stepSearch('up')} /></View>
            </View>
            <Button title={t('sound.hyper.first.ok')} icon={<CheckCircle2 size={18} color={colors.onPrimary} />} onPress={acceptSearch} />
            <EvidenceChip level="rct" onPress={() => open('formby2015')} />
          </Card>
        ) : null}

        {/* Task target and completion (C3) */}
        {target != null ? (
          <Card title={t('sound.target.title', { n: target })}>
            {done ? (
              <Text variant="bodySmall" tone="success">{t('sound.target.completed')}</Text>
            ) : (
              <>
                <Text variant="bodySmall" tone="secondary">{targetReached ? t('sound.target.reached') : t('sound.target.progress', { played: Math.min(playedMin, target), n: target })}</Text>
                {targetReached ? <Button title={t('sound.target.complete')} icon={<CheckCircle2 size={18} color={colors.onPrimary} />} onPress={onCountDone} /> : null}
              </>
            )}
          </Card>
        ) : null}

        {/* Timer */}
        <SectionHeader title={t('player.timer.title')} />
        <TimerChips value={eng.timerMinutes} options={timerOptions} onChange={(m) => mixer.setTimer(m)} />
        <Text variant="caption" tone="secondary">{t('player.timer.hint')}</Text>

        {/* Volume */}
        <Card>
          <VolumeSlider label={t('player.volume')} value={eng.master} onChange={(v) => mixer.setMaster(v)} cap={maxVolume} />
          {presetName === 'enrichment' || presetName === 'notched' ? (
            <Text variant="bodySmall" tone="secondary">{mp.value != null ? t('player.mixingHint', { pct: Math.round(mp.value * 100) }) : t('player.mixingMissing')}</Text>
          ) : null}
          {presetName === 'enrichment' && tunedLayerOn && tune.hz ? <Text variant="caption" tone="secondary">{t('sound.tuned.hint')}</Text> : null}
          {presetName === 'enrichment' && tune.reason === 'override' ? (
            <View style={{ gap: space[1] }}>
              <Text variant="caption" tone="secondary">{t('sound.tuned.manual')}</Text>
              <Pressable accessibilityRole="button" onPress={onRestoreTune} style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="bodySmall" tone="primary">{t('sound.tuned.restore')}</Text></Pressable>
            </View>
          ) : null}
          <Pressable accessibilityRole="link" onPress={() => router.push('/sound/mixing-point')} style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="bodySmall" tone="primary">{t('player.mixingLink')}</Text></Pressable>
        </Card>

        {/* Preset-specific guidance */}
        {presetName === 'hyperacusis' && !hyperSearching ? (
          <Card variant="tinted" title={t('player.hyper.title')} overline={t('player.hyper.week', { week })}>
            <Text variant="body">{t('player.hyper.body')}</Text>
            <Text variant="bodyStrong" tone="warning">{t('player.hyper.never')}</Text>
            <Text variant="bodySmall" tone="secondary">{t('sound.hyper.comfort', { pct: pct(hyperStartGain) })} {t('sound.hyper.comfort.hint')}</Text>
            {nudge ? (
              <Banner tone="info" title={t('sound.hyper.nudge.title')} body={t('sound.hyper.nudge.body')} primary={{ title: t('sound.hyper.nudge.ok'), onPress: acceptNudge }} secondary={{ title: t('sound.hyper.nudge.later'), onPress: laterNudge }} />
            ) : null}
            <Button variant="secondary" title={t('player.hyper.apply')} onPress={() => mixer.setMaster(hyperStartGain)} />
            <Button variant="ghost" size="sm" title={t('sound.hyper.comfort.reset')} onPress={resetComfort} />
            <EvidenceChip level="rct" onPress={() => open('formby2015')} />
          </Card>
        ) : null}
        {presetName === 'ri' ? (
          <Card variant="tinted" title={t('player.ri.title')}>
            <Text variant="body">{t('player.ri.body')}</Text>
            <EvidenceChip level="rct" onPress={() => open('sendesen2024')} />
          </Card>
        ) : null}
        {presetName === 'notched' && first && first.spec.kind === 'notched' ? (
          <Card variant="tinted" title={t('player.notched.title')}>
            <Text variant="body">{t('player.notched.body', { hz: Math.round(first.spec.centerHz).toLocaleString('tr-TR'), oct: (first.spec.octaves ?? 1) === 1 ? t('lab.octave1') : t('lab.octaveHalf') })}</Text>
            <View style={{ flexDirection: 'row', gap: space[2], flexWrap: 'wrap' }}>
              <Chip small tone="warning" icon={<FlaskConical size={14} color={colors.warning} />} label={t('lab.experimental')} />
              <EvidenceChip level="rct" onPress={() => open('stein2016')} />
            </View>
            <Pressable accessibilityRole="link" onPress={() => router.push('/assess/pitch')}><Text variant="bodySmall" tone="primary">{t('lab.rematch')}</Text></Pressable>
          </Card>
        ) : null}
        {presetName === 'sleep' ? <Text variant="bodySmall" tone="secondary">{t('player.sleepHint')}</Text> : null}
        {presetName === 'custom' && mainPreset?.evidence ? (
          <View style={{ flexDirection: 'row', gap: space[2], flexWrap: 'wrap' }}>
            <EvidenceChip level={mainPreset.evidence} onPress={mainPreset.citation ? () => open(mainPreset.citation!) : undefined} />
            {mainPreset.experimental ? <Chip small tone="warning" icon={<FlaskConical size={14} color={colors.warning} />} label={t('lab.experimental')} /> : null}
          </View>
        ) : null}
        {mainPreset?.id === 'binaural.6' || mainPreset?.id === 'am.40' ? <Text variant="caption" tone="secondary">{t(`preset.note.${mainPreset.id === 'binaural.6' ? 'binaural' : 'am'}`)}</Text> : null}

        {/* Advanced: mixer and layers, collapsed by default */}
        <Collapsible title={t('player.advanced')} summary={t('player.advanced.sub')}>
          <Text variant="bodyStrong">{t('player.mixer')}</Text>
          {eng.layers.length === 0 ? <Text variant="bodySmall" tone="secondary">{t('player.noLayers')}</Text> : null}
          {eng.layers.map((l) => (
            <LayerRow key={l.id} name={layerName(l.id, l.spec)} level={mixer.level(l.id)} muted={mixer.isMuted(l.id)}
              onLevel={(v) => { markManual(); mixer.setLevel(l.id, v); }} onToggleMute={() => { markManual(); mixer.toggleMute(l.id); }} onRemove={() => { markManual(); void mixer.remove(l.id); }} />
          ))}
          <Button variant="secondary" title={t('player.addLayer')} icon={<Plus size={18} color={colors.primary} />} disabled={eng.layers.length >= 3} onPress={() => setSheetOpen(true)} />
          {eng.layers.length >= 3 ? <Text variant="caption" tone="secondary">{t('player.maxLayers')}</Text> : null}
        </Collapsible>

        {/* Sleep mode */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Moon size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('player.sleepMode')}</Text>
              <Text variant="caption" tone="secondary">{t('player.sleepModeHint')}</Text>
            </View>
            <Switch value={sleepMode} onValueChange={onSleepMode} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={isDark ? colors.text : undefined} accessibilityLabel={t('player.sleepMode')} />
          </View>
          {sleepMode && dimHint.show ? (
            <Banner tone="info" title={t('player.dimHint.title')} body={t('player.dimHint.body')} primary={{ title: t('common.understood'), onPress: dimHint.dismiss }} />
          ) : null}
        </Card>
        {sheet}
      </Screen>

      {/* Add-layer sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSheetOpen(false)} accessibilityLabel={t('common.close')} />
        <View style={{ backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[5], gap: space[3], maxHeight: '70%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3">{t('player.addLayer')}</Text>
            <Pressable onPress={() => setSheetOpen(false)} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={12}><X size={22} color={colors.textSecondary} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: space[2] }}>
            {PRESETS.filter((p) => p.id !== 'silence').map((p) => {
              const spec = resolveSpec(p, { pitchHz, octaves });
              const already = eng.layers.some((l) => l.id === p.id);
              return (
                <Pressable key={p.id} accessibilityRole="button" accessibilityState={{ disabled: !spec || already }} disabled={!spec || already} onPress={() => spec && addLayer(p.id, spec)}
                  style={({ pressed }) => ({ minHeight: 56, paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, opacity: !spec || already ? 0.45 : pressed ? 0.8 : 1, flexDirection: 'row', alignItems: 'center', gap: space[2] })}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{t(p.nameKey)}</Text>
                    <Text variant="caption" tone="secondary">{!spec ? t('lab.needsPitchShort') : already ? t('player.alreadyAdded') : t(p.descKey)}</Text>
                  </View>
                  {p.experimental ? <FlaskConical size={16} color={colors.warning} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
