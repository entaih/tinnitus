import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

/** Full-width radio card used by every questionnaire. */
export function OptionCard({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  const { colors, radius, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => { void Haptics.selectionAsync(); onPress(); }}
      style={({ pressed }) => ({
        minHeight: 56, borderRadius: radius.md, paddingHorizontal: space[4], paddingVertical: space[3],
        backgroundColor: selected ? colors.primarySoft : colors.card,
        borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.border,
        flexDirection: 'row', alignItems: 'center', gap: space[3], opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" style={{ color: selected ? colors.primaryPressed : colors.text }}>{label}</Text>
        {hint ? <Text variant="caption" tone="secondary">{hint}</Text> : null}
      </View>
      {selected ? <Check size={20} color={colors.primary} /> : null}
    </Pressable>
  );
}
