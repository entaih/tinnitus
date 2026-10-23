import React from 'react';
import { View } from 'react-native';
import { TriangleAlert, Info, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export function Banner({ tone = 'info', title, body, primary, secondary }: {
  tone?: 'danger' | 'info' | 'warning' | 'success';
  title: string; body?: string;
  primary?: { title: string; onPress: () => void };
  secondary?: { title: string; onPress: () => void };
}) {
  const { colors, radius, space, isDark } = useTheme();
  const solid = tone === 'danger' && !isDark;
  const bg = { danger: solid ? colors.danger : colors.dangerBg, info: colors.infoBg, warning: colors.warningBg, success: colors.successBg }[tone];
  const fg = { danger: solid ? '#FFFFFF' : colors.danger, info: colors.info, warning: colors.warning, success: colors.success }[tone];
  const Icon = tone === 'danger' || tone === 'warning' ? TriangleAlert : tone === 'success' ? CheckCircle2 : Info;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'}
      style={{ backgroundColor: bg, borderRadius: radius.lg, padding: space[4], gap: space[2], borderWidth: isDark ? 1 : 0, borderColor: fg }}
    >
      <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
        <Icon size={22} color={fg} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="bodyStrong" style={{ color: fg }}>{title}</Text>
          {body ? <Text variant="bodySmall" style={{ color: solid ? '#FFFFFF' : colors.text }}>{body}</Text> : null}
        </View>
      </View>
      {(primary || secondary) && (
        <View style={{ flexDirection: 'row', gap: space[2], justifyContent: 'flex-end' }}>
          {secondary ? <Button size="sm" variant="ghost" title={secondary.title} onPress={secondary.onPress} style={solid ? { } : undefined} /> : null}
          {primary ? (
            <Button size="sm" variant={solid ? 'secondary' : 'primary'} title={primary.title} onPress={primary.onPress}
              style={solid ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' } : undefined} />
          ) : null}
        </View>
      )}
    </View>
  );
}
