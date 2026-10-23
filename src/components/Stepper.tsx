import React from 'react';
import { Pressable, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Stepper({ value, onChange, min = 0, max = 100, step = 1, label, format }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; label?: string; format?: (v: number) => string }) {
  const { colors, radius, space } = useTheme();
  const btn = (icon: React.ReactNode, onPress: () => void, disabled: boolean, a11y: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : pressed ? 0.7 : 1 })}>
      {icon}
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
      {label ? <Text variant="body" style={{ flex: 1 }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        {btn(<Minus size={20} color={colors.primary} />, () => onChange(Math.max(min, value - step)), value <= min, '-')}
        <Text variant="h3" style={{ minWidth: 56, textAlign: 'center' }}>{format ? format(value) : value}</Text>
        {btn(<Plus size={20} color={colors.primary} />, () => onChange(Math.min(max, value + step)), value >= max, '+')}
      </View>
    </View>
  );
}
