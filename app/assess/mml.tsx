import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { Banner, Button, Card, Chip, Disclaimer, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useClinical } from '@/store/clinical';
import { useAssessmentId, useProfile } from '@/hooks/useProfile';
import { soundEngine } from '@/audio/engine';
import { stopAllOneShots } from '@/audio/psychoPlayer';
import { capDbFor, dbToVolume, maskerSpec, mmlAtCap, mmlHeardNoise, mmlMasked, mmlNotMaskable, mmlStep, startMml, type MmlState } from '@/audio/psychoacoustics';

type Phase = 'intro' | 'ramp' | 'result';
const LAYER_ID = 'mml-noise';
const RAMP_MS = 1500;

/**
 * Minimum masking level with the SAME stimulus the RI test will use (Fournier & Hébert 2018): 1/3-octave
 * narrowband noise at the matched pitch when one exists, otherwise broadband white noise. "Not maskable" is
 * stored as a flag (mmlNotMaskable) with the cap distance kept only as a record.
 */
export default function MmlScreen() {
  useKeepAwake();
  const t = useT();
  const { colors, space } = useTheme();
  const { assessment } = useProfile();
  const pitchHz = assessment?.psycho?.pitchHz;
  const maxVolume = useSettings((s) => s.maxVolume);
  const savePsycho = useClinical((s) => s.savePsycho);
  const assessmentId = useAssessmentId();
  const capDb = capDbFor(maxVolume);
  const capped = capDb < 0;
  const masker = maskerSpec(pitchHz);

  const [phase, setPhase] = useState<Phase>('intro');
  const [mml, setMml] = useState<MmlState>(() => startMml({ maxDb: capDb }));
  const [paused, setPaused] = useState(false);
  const [saved, setSaved] = useState(false);
  const mmlRef = useRef(mml);
  mmlRef.current = mml;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopNoise = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stopAllOneShots();
    void soundEngine.stopAll();
  }, []);
  useEffect(() => () => stopNoise(), [stopNoise]);

  const applyVolume = (levelDb: number) => soundEngine.setVolume(LAYER_ID, Math.min(maxVolume, dbToVolume(levelDb)));

  const stepTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      const cur = mmlRef.current;
      if (cur.phase === 'done' || mmlAtCap(cur)) return;
      const next = mmlStep(cur);
      mmlRef.current = next;
      setMml(next);
      applyVolume(next.level);
    }, RAMP_MS);
  };

  const startRamp = async () => {
    const s = startMml({ maxDb: capDb });
    setMml(s); mmlRef.current = s;
    setPaused(false);
    setPhase('ramp');
    try { await soundEngine.play(masker.spec, { id: LAYER_ID, volume: Math.min(maxVolume, dbToVolume(s.level)) }); } catch (e) { console.warn(e); }
    stepTimer();
  };

  const togglePause = () => {
    if (paused) { setPaused(false); stepTimer(); }
    else { setPaused(true); if (timer.current) clearInterval(timer.current); timer.current = null; }
  };

  const heardNoise = () => { void Haptics.selectionAsync(); const n = mmlHeardNoise(mmlRef.current); mmlRef.current = n; setMml(n); };
  const finish = (n: MmlState) => { mmlRef.current = n; setMml(n); stopNoise(); setPhase('result'); };
  const masked = () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); finish(mmlMasked(mmlRef.current)); };
  const notMaskable = () => finish(mmlNotMaskable(mmlRef.current));

  /** Cap distance above the noise threshold (record only; the flag carries the meaning). */
  const capDistance = Math.round(capDb - (mml.noiseThresholdDb ?? capDb));

  const save = () => {
    if (saved || mml.phase !== 'done') return;
    savePsycho(assessmentId, {
      mmlDb: mml.notMaskable ? capDistance : mml.mmlDb ?? 0,
      mmlNotMaskable: mml.notMaskable,
      mmlStimulus: masker.stimulus,
      mmlCenterHz: masker.centerHz,
    });
    setSaved(true);
  };

  const restart = () => { stopNoise(); setSaved(false); setPhase('intro'); };
  const maskLevel = mml.maskingLevelDb != null ? Math.round(mml.maskingLevelDb) : mml.notMaskable ? Math.round(capDb) : null;
  const riParams = maskLevel != null ? `?mask=${maskLevel}&stim=${masker.stimulus}${masker.centerHz ? `&hz=${masker.centerHz}` : ''}` : '';
  const stimulusLabel = masker.stimulus === 'nbn' ? t('psy.mml.stimulus.nbn', { hz: masker.centerHz ?? 0 }) : t('psy.mml.stimulus.bbn');

  return (
    <Screen>
      <Stack.Screen options={{ title: t('psy.mml.title') }} />

      {phase === 'intro' && (
        <>
          <Text variant="h1">{t('psy.mml.title')}</Text>
          <Banner tone="info" title={t('psy.headphones')} />
          <Text variant="body" tone="secondary">{t('psy.mml.intro.body')}</Text>
          <Card variant="tinted">
            <Text variant="bodyStrong">{stimulusLabel}</Text>
            <Text variant="bodySmall" tone="secondary">{t(masker.stimulus === 'nbn' ? 'psy.mml.stimulus.why.nbn' : 'psy.mml.stimulus.why.bbn')}</Text>
          </Card>
          <Card><Text variant="body">{t('psy.mml.phase1')}</Text></Card>
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          <Button title={t('psy.mml.start')} onPress={() => void startRamp()} />
        </>
      )}

      {phase === 'ramp' && (
        <>
          <Text variant="overline" tone="secondary">{mml.phase === 'toThreshold' ? t('psy.mml.phase1') : t('psy.mml.phase2')}</Text>
          <Card>
            <Text variant="numeric" center>{t('psy.mml.level', { db: Math.round(mml.level) })}</Text>
            {mml.noiseThresholdDb != null ? <Text variant="bodySmall" tone="secondary" center>{t('psy.mml.noiseThreshold', { db: mml.noiseThresholdDb })}</Text> : null}
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack }}>
              <View style={{ width: `${Math.round(((mml.level - mml.minDb) / (mml.maxDb - mml.minDb)) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: mmlAtCap(mml) ? colors.warning : colors.primary }} />
            </View>
            <Text variant="caption" tone="muted" center>{stimulusLabel}</Text>
          </Card>
          {mmlAtCap(mml) ? <Banner tone="warning" title={t('psy.mml.capReached')} /> : null}
          {capped ? <Banner tone="info" title={t('psy.capped')} /> : null}
          {mml.phase === 'toThreshold' ? (
            <Button title={t('psy.mml.heardNoise')} onPress={heardNoise} style={{ minHeight: 72 }} />
          ) : (
            <Button title={t('psy.mml.masked')} onPress={masked} style={{ minHeight: 72 }} />
          )}
          {mml.phase === 'toMasking' && mmlAtCap(mml) ? <Button variant="secondary" title={t('psy.mml.notMaskable')} onPress={notMaskable} /> : null}
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Button style={{ flex: 1 }} variant="secondary" title={paused ? t('psy.mml.resume') : t('psy.mml.pause')} onPress={togglePause} />
            <Button style={{ flex: 1 }} variant="ghost" title={t('psy.stopTest')} onPress={restart} />
          </View>
        </>
      )}

      {phase === 'result' && mml.phase === 'done' && (
        <>
          <Text variant="h1">{t('psy.mml.result.title')}</Text>
          <Card>
            {mml.notMaskable ? (
              <>
                <Text variant="h2">{t('psy.mml.notMaskable')}</Text>
                <Text variant="bodySmall" tone="secondary">{t('psy.mml.result.notMaskableDetail', { cap: Math.round(capDb), th: mml.noiseThresholdDb != null ? Math.round(mml.noiseThresholdDb) : '—' })}</Text>
                <Text variant="bodySmall" tone="secondary">{t('psy.mml.result.notMaskable')}</Text>
              </>
            ) : (
              <>
                <Text variant="numeric">{t('psy.mml.result.value', { db: mml.mmlDb ?? 0 })}</Text>
                <Text variant="caption" tone="muted">{t('psy.mml.result.valueHint')}</Text>
                <Text variant="bodySmall" tone="secondary">{t('psy.mml.result.absolute', { th: mml.noiseThresholdDb != null ? Math.round(mml.noiseThresholdDb) : '—', m: maskLevel ?? '—' })}</Text>
                <Text variant="bodySmall" tone="secondary">{t('psy.mml.result.hint')}</Text>
              </>
            )}
            <Chip small label={stimulusLabel} />
          </Card>
          <Button title={saved ? t('psy.mml.continueRi') : t('psy.saveContinue')} onPress={() => { save(); router.replace(`/assess/ri${riParams}`); }} />
          <Button variant="secondary" title={t('common.save')} disabled={saved} onPress={save} />
          <Button variant="ghost" title={t('psy.repeat')} onPress={restart} />
          <Disclaimer />
        </>
      )}
    </Screen>
  );
}
