import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Button, Card, EvidenceChip, useCitation, Disclaimer } from '@/components';
import { VolumeSlider, mixer, useSoundEngine } from '@/components/sound';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { useMixingPoint } from '@/audio/mixingPoint';

const START = 0.08;
const STEP_DOWN = 0.05;

type Step = 'intro' | 'calibrate' | 'done';

export default function MixingPointScreen() {
  const { colors, space } = useTheme();
  const t = useT();
  const router = useRouter();
  const maxVolume = useSettings((s) => s.maxVolume);
  const mp = useMixingPoint();
  const eng = useSoundEngine();
  const { open, sheet } = useCitation();
  const [step, setStep] = useState<Step>('intro');
  const [saved, setSaved] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const keepPlaying = useRef(false);

  useEffect(() => () => { if (!keepPlaying.current) void mixer.stopAll(); }, []);

  const begin = async () => {
    setLoading(true);
    try {
      await mixer.load([{ id: 'noise.pink', spec: { kind: 'noise', color: 'pink' }, level: 1 }], Math.min(START, maxVolume), null, 'player.preset.enrichment', 'noise.pink');
      setStep('calibrate');
    } finally { setLoading(false); }
  };
  const blends = async () => {
    const level = Math.max(0, Math.round((eng.master - STEP_DOWN) * 100) / 100);
    mixer.setMaster(level);
    await mp.set(level);
    setSaved(level);
    setStep('done');
  };
  const goPlayer = () => { keepPlaying.current = true; router.replace({ pathname: '/sound/player', params: { preset: 'enrichment' } }); };
  const finish = () => { void mixer.stopAll(); router.back(); };

  return (
    <>
      <Stack.Screen options={{ title: t('mixing.title') }} />
      <Screen>
        {step === 'intro' ? (
          <>
            <Text variant="h1">{t('mixing.title')}</Text>
            <Text variant="body">{t('mixing.intro1')}</Text>
            <Text variant="body">{t('mixing.intro2')}</Text>
            <Card variant="tinted">
              <Text variant="bodySmall">{t('mixing.evidence')}</Text>
              <EvidenceChip level="rct" onPress={() => open('scherer2019')} />
            </Card>
            {mp.value != null ? <Text variant="bodySmall" tone="secondary">{t('mixing.current', { pct: Math.round(mp.value * 100) })}</Text> : null}
            <Text variant="bodySmall" tone="secondary">{t('mixing.headphones')}</Text>
            <Button title={t('common.start')} onPress={() => void begin()} loading={loading} />
          </>
        ) : null}

        {step === 'calibrate' ? (
          <>
            <Text variant="overline" tone="secondary">{t('mixing.stepLabel', { n: 1 })}</Text>
            <Text variant="h2">{t('mixing.raiseTitle')}</Text>
            <Text variant="body">{t('mixing.raiseBody')}</Text>
            <Card>
              <VolumeSlider label={t('player.volume')} value={eng.master} onChange={(v) => mixer.setMaster(v)} cap={maxVolume} />
            </Card>
            <Text variant="bodySmall" tone="secondary">{t('mixing.neverLoud')}</Text>
            <Button title={t('mixing.blendsNow')} onPress={() => void blends()} disabled={!eng.hasLayers} />
            <Button variant="ghost" title={t('common.cancel')} onPress={finish} />
          </>
        ) : null}

        {step === 'done' ? (
          <>
            <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[4] }}>
              <CheckCircle2 size={56} color={colors.success} />
              <Text variant="h2" center>{t('mixing.savedTitle')}</Text>
              <Text variant="numeric">{Math.round((saved ?? 0) * 100)} %</Text>
              <Text variant="body" center>{t('mixing.savedBody')}</Text>
            </View>
            <Card variant="tinted">
              <Text variant="bodySmall">{t('mixing.useHint')}</Text>
            </Card>
            <Button title={t('mixing.goPlayer')} onPress={goPlayer} />
            <Button variant="ghost" title={t('common.done')} onPress={finish} />
          </>
        ) : null}
        <Disclaimer textKey="disclaimer.short" />
        {sheet}
      </Screen>
    </>
  );
}
