import React from 'react';
import { Pressable, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Volume1, Volume2 } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

interface Props {
  value: number;              // 0..1 (uncapped scale)
  onChange: (v: number) => void;
  /** Hearing-safety cap from settings (0..1). Values above are clamped and a hint is shown. */
  cap?: number;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
}

/** Horizontal volume slider with ± 44 pt steppers, capped by the user's safety setting. */
export function VolumeSlider({ value, onChange, cap = 1, label, compact, disabled }: Props) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [hitCap, setHitCap] = React.useState(false);
  const apply = (v: number) => {
    const c = Math.max(0, Math.min(cap, v));
    setHitCap(v > cap + 0.001);
    onChange(c);
  };
  const step = 0.05;
  const btn = (icon: React.ReactNode, delta: number, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={() => apply(Math.round((value + delta) / step) * step)}
      hitSlop={6}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}
    >
      {icon}
    </Pressable>
  );
  return (
    <View style={{ gap: compact ? 0 : space[1] }}>
      {label || !compact ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label ? <Text variant="caption" tone="secondary">{label}</Text> : <View />}
          <Text variant="caption" tone="secondary">{Math.round(value * 100)} %</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
        {btn(<Volume1 size={20} color={disabled ? colors.textDisabled : colors.textSecondary} />, -step, t('player.a11y.volumeDown'))}
        <Slider
          style={{ flex: 1, height: 44 }}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={value}
          disabled={disabled}
          onValueChange={apply}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.card}
          accessibilityRole="adjustable"
          accessibilityLabel={label ?? t('player.volume')}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100), text: `${Math.round(value * 100)} %` }}
        />
        {btn(<Volume2 size={20} color={disabled ? colors.textDisabled : colors.textSecondary} />, step, t('player.a11y.volumeUp'))}
      </View>
      {hitCap || (cap < 1 && value >= cap - 0.001 && !compact) ? (
        <Text variant="caption" tone="warning" accessibilityLiveRegion="polite">{t('player.volumeCapped')}</Text>
      ) : null}
    </View>
  );
}
