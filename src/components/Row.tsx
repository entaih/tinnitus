import React from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function Row({ icon, title, subtitle, right, onPress, chevron = true }: { icon?: React.ReactNode; title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void; chevron?: boolean }) {
  const { colors, space, radius } = useTheme();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56, paddingVertical: space[2] }}>
      {icon ? <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View> : null}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? <Text variant="bodySmall" tone="secondary">{subtitle}</Text> : null}
      </View>
      {right}
      {onPress && chevron ? <ChevronRight size={20} color={colors.textMuted} /> : null}
    </View>
  );
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>{body}</Pressable> : body;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space[2] }}>
      <Text variant="h2">{title}</Text>
      {action && onAction ? <Pressable accessibilityRole="button" onPress={onAction}><Text variant="bodySmall" tone="primary">{action}</Text></Pressable> : null}
    </View>
  );
}
