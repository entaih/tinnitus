import React from 'react';
import { Pressable, View } from 'react-native';
import { Volume2, VolumeX, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { VolumeSlider } from './VolumeSlider';
import { useT } from '@/i18n';

interface Props {
  name: string;
  level: number;          // 0..1 mix level (relative to master)
  muted: boolean;
  onLevel: (v: number) => void;
  onToggleMute: () => void;
  onRemove: () => void;
  removable?: boolean;
}

/** One mixer layer: name, mix-level slider, mute and remove. */
export function LayerRow({ name, level, muted, onLevel, onToggleMute, onRemove, removable = true }: Props) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const iconBtn = (icon: React.ReactNode, onPress: () => void, a11y: string, active?: boolean) => (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ selected: !!active }} onPress={onPress}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primarySoft : 'transparent', opacity: pressed ? 0.6 : 1 })}>
      {icon}
    </Pressable>
  );
  return (
    <View style={{ gap: space[1], paddingVertical: space[2], borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Text variant="bodyStrong" style={{ flex: 1, opacity: muted ? 0.5 : 1 }} numberOfLines={1}>{name}</Text>
        {iconBtn(muted ? <VolumeX size={20} color={colors.warning} /> : <Volume2 size={20} color={colors.textSecondary} />, onToggleMute, muted ? t('player.a11y.unmute', { name }) : t('player.a11y.mute', { name }), muted)}
        {removable ? iconBtn(<X size={20} color={colors.textSecondary} />, onRemove, t('player.a11y.remove', { name })) : null}
      </View>
      <VolumeSlider compact value={level} onChange={onLevel} disabled={muted} label={t('player.layerLevel')} />
    </View>
  );
}
