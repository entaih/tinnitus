import React from 'react';
import { Pressable, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { clampHz, roundHz, shiftSemitones } from '@/audio/psychoacoustics';

interface Props {
  value: number;
  onChange: (hz: number) => void;
  /** Called when the user releases the thumb or taps a stepper (good moment to preview the sound). */
  onCommit?: (hz: number) => void;
  min?: number;
  max?: number;
  /** Stepper step in semitones. */
  stepSemitones?: number;
  accessibilityLabel?: string;
  readoutSuffix?: string;
}

/** Logarithmic (log2) frequency slider with ± semitone steppers, per DESIGN.md §5 "Slider". */
export function LogSlider({ value, onChange, onCommit, min = 125, max = 16000, stepSemitones = 1, accessibilityLabel, readoutSuffix = 'Hz' }: Props) {
  const { colors, radius, space } = useTheme();
  const lo = Math.log2(min);
  const hi = Math.log2(max);
  const pos = (Math.log2(clampHz(value, min, max)) - lo) / (hi - lo);
  const fromPos = (p: number) => clampHz(Math.pow(2, lo + p * (hi - lo)), min, max);
  const nudge = (semis: number) => {
    const v = clampHz(shiftSemitones(value, semis), min, max);
    onChange(v); onCommit?.(v);
  };
  const btn = (icon: React.ReactNode, onPress: () => void, disabled: boolean, label: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : pressed ? 0.7 : 1 })}>
      {icon}
    </Pressable>
  );
  return (
    <View style={{ gap: space[2] }}>
      <Text variant="numeric" center accessibilityLiveRegion="polite">{roundHz(value).toLocaleString('tr-TR')} {readoutSuffix}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        {btn(<Minus size={20} color={colors.primary} />, () => nudge(-stepSemitones), value <= min, '−1')}
        <Slider
          style={{ flex: 1, height: 44 }}
          minimumValue={0}
          maximumValue={1}
          step={1 / 12 / (hi - lo)}
          value={pos}
          onValueChange={(p) => onChange(fromPos(p))}
          onSlidingComplete={(p) => onCommit?.(fromPos(p))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.card}
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ text: `${roundHz(value)} hertz` }}
        />
        {btn(<Plus size={20} color={colors.primary} />, () => nudge(stepSemitones), value >= max, '+1')}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">{min} Hz</Text>
        <Text variant="caption" tone="muted">{max / 1000} kHz</Text>
      </View>
    </View>
  );
}
