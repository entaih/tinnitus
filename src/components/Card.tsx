import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  children?: React.ReactNode;
  title?: string;
  overline?: string;
  right?: React.ReactNode;
  variant?: 'default' | 'tinted' | 'outlined';
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({ children, title, overline, right, variant = 'default', style, onPress, accessibilityLabel }: Props) {
  const { colors, radius, space, shadow, isDark } = useTheme();
  const base: ViewStyle = {
    backgroundColor: variant === 'tinted' ? colors.tinted : colors.card,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
    borderWidth: variant === 'outlined' || isDark ? 1 : 0,
    borderColor: colors.border,
    ...(variant === 'default' && !isDark ? shadow.e1 : {}),
  };
  const header = (title || overline || right) ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] }}>
      <View style={{ flex: 1, gap: 2 }}>
        {overline ? <Text variant="overline" tone="secondary">{overline}</Text> : null}
        {title ? <Text variant="h3">{title}</Text> : null}
      </View>
      {right}
    </View>
  ) : null;
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1 }, style]}>
        {header}
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{header}{children}</View>;
}
