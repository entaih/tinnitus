import React from 'react';
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  size?: 'md' | 'sm';
  accessibilityLabel?: string;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, icon, style, size = 'md', accessibilityLabel }: Props) {
  const { colors, radius, space } = useTheme();
  const isDisabled = disabled || loading;
  const bg = { primary: colors.primary, secondary: 'transparent', ghost: 'transparent', danger: 'transparent', inverse: '#FFFFFF' }[variant];
  const fg = { primary: colors.onPrimary, secondary: colors.primaryPressed, ghost: colors.primary, danger: colors.danger, inverse: colors.primaryPressed }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={() => { void Haptics.selectionAsync(); onPress?.(); }}
      style={({ pressed }) => [
        {
          minHeight: size === 'md' ? 52 : 44,
          paddingHorizontal: space[5],
          borderRadius: radius.md,
          backgroundColor: isDisabled && variant === 'primary' ? colors.border : bg,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space[2],
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          {icon}
          <Text variant="bodyStrong" style={{ color: isDisabled && variant === 'primary' ? colors.textMuted : fg }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
