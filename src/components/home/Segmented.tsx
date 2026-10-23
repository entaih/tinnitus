import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

/** Segmented control (range pickers, appearance, language). 44 pt tall, accessible as tabs. */
export function Segmented<T extends string | number>({ options, value, onChange, accessibilityLabel }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; accessibilityLabel?: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', backgroundColor: colors.skeleton, borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: sel }}
            onPress={() => { void Haptics.selectionAsync(); onChange(o.value); }}
            style={({ pressed }) => ({ flex: 1, minHeight: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.card : 'transparent', borderWidth: sel ? 1 : 0, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}
          >
            <Text variant="caption" style={{ color: sel ? colors.primary : colors.textSecondary, fontWeight: '600' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
