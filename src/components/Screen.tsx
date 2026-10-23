import React from 'react';
import { ScrollView, View, type ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** extra bottom padding for tab bars */
  tab?: boolean;
  footer?: React.ReactNode;
}

export function Screen({ children, scroll = true, padded = true, style, contentStyle, tab, footer }: Props) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = padded ? space[4] : 0;
  const bottom = (tab ? 0 : insets.bottom) + space[6];
  const inner = (
    <View style={[{ paddingHorizontal: pad, paddingBottom: bottom, gap: space[4] }, contentStyle]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: space[2] }}>
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: space[2] }}>{inner}</View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: (tab ? 0 : insets.bottom) + space[3], backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border }}>
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
