import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

/**
 * Card-shaped accordion: title + one-line summary, collapsed by default. The header is a 56 pt button
 * carrying accessibilityState.expanded; children render only when open.
 */
export function Collapsible({ title, summary, defaultOpen = false, right, children, variant = 'default' }: {
  title: string; summary?: string; defaultOpen?: boolean; right?: React.ReactNode; children: React.ReactNode; variant?: 'default' | 'tinted';
}) {
  const { colors, radius, space, shadow, isDark } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[{ backgroundColor: variant === 'tinted' ? colors.tinted : colors.card, borderRadius: radius.lg, borderWidth: isDark ? 1 : 0, borderColor: colors.border, overflow: 'hidden' }, variant === 'default' && !isDark ? shadow.e1 : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={summary ? `${title}. ${summary}` : title}
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], opacity: pressed ? 0.85 : 1 })}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{title}</Text>
          {summary && !open ? <Text variant="bodySmall" tone="secondary" numberOfLines={1}>{summary}</Text> : null}
        </View>
        {right}
        {open ? <ChevronUp size={20} color={colors.textMuted} /> : <ChevronDown size={20} color={colors.textMuted} />}
      </Pressable>
      {open ? <View style={{ paddingHorizontal: space[4], paddingBottom: space[4], gap: space[3] }}>{children}</View> : null}
    </View>
  );
}
