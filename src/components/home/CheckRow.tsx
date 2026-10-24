import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

/** 56 pt checkbox row (label + optional hint) used for explicit acknowledgements. */
export function CheckRow({ checked, label, hint, onToggle }: { checked: boolean; label: string; hint?: string; onToggle: () => void }) {
  const { colors, radius, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={() => { void Haptics.selectionAsync(); onToggle(); }}
      style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[2], opacity: pressed ? 0.8 : 1 })}
    >
      <View style={{ width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, borderColor: checked ? colors.primary : colors.borderStrong, backgroundColor: checked ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {checked ? <Check size={18} color={colors.onPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {hint ? <Text variant="caption" tone="secondary">{hint}</Text> : null}
      </View>
    </Pressable>
  );
}
