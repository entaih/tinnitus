import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlaskConical, Moon, Star, Volume1 } from 'lucide-react-native';
import { Screen, Text, Card, Chip, EvidenceChip, useCitation } from '@/components';
import { MiniPlayer, useSoundEngine } from '@/components/sound';
import { useTheme } from '@/theme';
import { TabHeader } from '@/components/home';
import { useT } from '@/i18n';
import { useProfile } from '@/hooks/useProfile';
import { presetsByCategory, resolveSpec, type PresetCategory, type SoundPreset } from '@/audio/presets';

const CATEGORIES: PresetCategory[] = ['noise', 'notched', 'nature', 'tone', 'mix'];
const NOTCH_MAX_HZ = 8000;

export default function SoundScreen() {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const router = useRouter();
  const { assessment } = useProfile();
  const pitchHz = assessment?.psycho?.pitchHz;
  const [cat, setCat] = useState<PresetCategory>('noise');
  const [octaves, setOctaves] = useState<1 | 0.5>(1);
  const { open, sheet } = useCitation();
  const eng = useSoundEngine();

  const openPreset = (p: SoundPreset) => {
    const spec = resolveSpec(p, { pitchHz, octaves });
    if (!spec) { router.push('/assess/pitch'); return; }
    if (p.id === 'notched.pink') router.push({ pathname: '/sound/player', params: { preset: 'notched', octaves: String(octaves) } });
    else if (p.id === 'narrowband.pitch') router.push({ pathname: '/sound/player', params: { preset: 'ri' } });
    else router.push({ pathname: '/sound/player', params: { preset: 'custom', spec: JSON.stringify(spec), id: p.id } });
  };

  const presetCard = (p: SoundPreset) => {
    const needsPitch = p.dynamic === 'pitch' && !pitchHz;
    const recommended = p.dynamic === 'pitch' && !!pitchHz && pitchHz <= NOTCH_MAX_HZ;
    return (
      <Card key={p.id} onPress={() => openPreset(p)} accessibilityLabel={`${t(p.nameKey)}. ${t(p.descKey)}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Volume1 size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="h3">{t(p.nameKey)}</Text>
            <Text variant="bodySmall" tone="secondary">{needsPitch ? t('lab.needsPitchShort') : t(p.descKey)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
          {p.evidence ? <EvidenceChip level={p.evidence} onPress={p.citation ? () => open(p.citation!) : undefined} /> : null}
          {p.experimental ? <Chip small tone="warning" icon={<FlaskConical size={14} color={colors.warning} />} label={t('lab.experimental')} /> : null}
          {recommended ? <Chip small tone="primary" icon={<Star size={14} color={colors.primaryPressed} />} label={t('lab.recommended')} /> : null}
        </View>
      </Card>
    );
  };

  const pitchCard = (
    <Card variant="tinted">
      {pitchHz ? (
        <>
          <Text variant="overline" tone="secondary">{t('lab.yourPitch')}</Text>
          <Text variant="numeric">{Math.round(pitchHz).toLocaleString('tr-TR')} Hz</Text>
          {pitchHz > NOTCH_MAX_HZ ? <Text variant="bodySmall" tone="secondary">{t('lab.notchTooHigh')}</Text> : null}
          <Pressable accessibilityRole="link" onPress={() => router.push('/assess/pitch')}><Text variant="bodySmall" tone="primary">{t('lab.rematch')}</Text></Pressable>
        </>
      ) : (
        <>
          <Text variant="h3">{t('lab.needsPitchTitle')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('lab.needsPitchBody')}</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/assess/pitch')}><Text variant="bodyStrong" tone="primary">{t('lab.doPitchMatch')}</Text></Pressable>
        </>
      )}
    </Card>
  );

  const widthSelector = (
    <View style={{ gap: space[2] }}>
      <Text variant="caption" tone="secondary">{t('lab.notchWidth')}</Text>
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        {([1, 0.5] as const).map((o) => {
          const selected = octaves === o;
          return (
            <Pressable key={o} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setOctaves(o)}
              style={{ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, justifyContent: 'center', backgroundColor: selected ? colors.primary : colors.card, borderWidth: 1, borderColor: selected ? colors.primary : colors.borderStrong }}>
              <Text variant="caption" style={{ color: selected ? colors.onPrimary : colors.text }}>{o === 1 ? t('lab.octave1') : t('lab.octaveHalf')}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const mixCards = (
    <>
      <Card onPress={() => router.push({ pathname: '/sound/player', params: { preset: 'enrichment' } })} title={t('player.preset.enrichment')} overline={t('lab.mix.daytime')}>
        <Text variant="bodySmall" tone="secondary">{t('lab.mix.enrichmentDesc')}</Text>
        <EvidenceChip level="guideline" onPress={() => open('sereda2018')} />
      </Card>
      <Card onPress={() => router.push({ pathname: '/sound/player', params: { preset: 'sleep' } })} title={t('player.preset.sleep')} overline={t('lab.mix.night')}
        right={<Moon size={22} color={colors.primary} />}>
        <Text variant="bodySmall" tone="secondary">{t('lab.mix.sleepDesc')}</Text>
        <EvidenceChip level="expert" onPress={() => open('marks2023')} />
      </Card>
      <Card onPress={() => router.push({ pathname: '/sound/player', params: { preset: 'hyperacusis' } })} title={t('player.preset.hyperacusis')} overline={t('lab.mix.graded')}>
        <Text variant="bodySmall" tone="secondary">{t('lab.mix.hyperacusisDesc')}</Text>
        <EvidenceChip level="rct" onPress={() => open('formby2015')} />
      </Card>
      <Card onPress={() => router.push('/sound/mixing-point')} title={t('mixing.title')} overline={t('lab.mix.calibration')}>
        <Text variant="bodySmall" tone="secondary">{t('lab.mix.mixingDesc')}</Text>
      </Card>
      {presetsByCategory('mix').map(presetCard)}
    </>
  );

  return (
    <Screen tab footer={eng.hasLayers ? <MiniPlayer /> : undefined}>
      <TabHeader title={t('lab.title')} />
      <Text variant="bodySmall" tone="secondary">{t('lab.subtitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2] }} accessibilityRole="tablist">
        {CATEGORIES.map((c) => {
          const selected = cat === c;
          return (
            <Pressable key={c} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setCat(c)}
              style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, justifyContent: 'center', backgroundColor: selected ? colors.primary : colors.card, borderWidth: 1, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 })}>
              <Text variant="caption" style={{ color: selected ? colors.onPrimary : colors.text }}>{t(`lab.cat.${c}`)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {cat === 'notched' ? (<>{pitchCard}{pitchHz ? widthSelector : null}</>) : null}
      {cat === 'tone' && !pitchHz ? pitchCard : null}
      {cat === 'mix' ? mixCards : presetsByCategory(cat).map(presetCard)}
      {cat === 'noise' ? <Text variant="caption" tone="secondary">{t('lab.noiseFootnote')}</Text> : null}
      {cat === 'notched' ? <Text variant="caption" tone="secondary">{t('lab.notchedFootnote')}</Text> : null}
      {cat === 'tone' ? <Text variant="caption" tone="secondary">{t('lab.toneFootnote')}</Text> : null}
      {sheet}
    </Screen>
  );
}
