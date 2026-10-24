import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { useLocale } from '@/i18n';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'bodySmall' | 'caption' | 'overline' | 'numeric';
type Tone = 'default' | 'secondary' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'success' | 'warning' | 'accent' | 'info';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

export function Text({ variant = 'body', tone = 'default', center, style, children, ...rest }: AppTextProps) {
  const { colors, type } = useTheme();
  const locale = useLocale();
  // Overlines are upper-cased with the Turkish locale so ı/i and İ/I stay correct (CSS uppercase breaks them).
  const content = variant === 'overline' && typeof children === 'string' ? children.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US') : children;
  const color = {
    default: colors.text, secondary: colors.textSecondary, muted: colors.textMuted, primary: colors.primary, onPrimary: colors.onPrimary,
    danger: colors.danger, success: colors.success, warning: colors.warning, accent: colors.accentText, info: colors.info,
  }[tone];
  const cap = variant === 'display' || variant === 'numeric' ? 2 : undefined;
  return (
    <RNText maxFontSizeMultiplier={cap} {...rest} style={[type[variant], { color }, center && { textAlign: 'center' }, style]}>
      {content}
    </RNText>
  );
}
