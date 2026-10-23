import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

export const TIMER_OPTIONS: (number | null)[] = [15, 30, 45, 60, 90, null];

/** Sleep-timer chips: 15/30/45/60/90 dk and "Sabaha kadar" (null = no timer, plays until stopped). */
export function TimerChips({ value, onChange, options = TIMER_OPTIONS }: { value: number | null; onChange: (m: number | null) => void; options?: (number | null)[] }) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2], paddingVertical: 2 }}>
      {options.map((m) => {
        const selected = value === m;
        return (
          <Pressable
            key={String(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={m == null ? t('player.timer.untilMorning') : t('common.minutes', { n: m })}
            onPress={() => { void Haptics.selectionAsync(); onChange(m); }}
            style={({ pressed }) => ({
              minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, justifyContent: 'center',
              backgroundColor: selected ? colors.primary : colors.card,
              borderWidth: 1, borderColor: selected ? colors.primary : colors.borderStrong,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View>
              <Text variant="caption" style={{ color: selected ? colors.onPrimary : colors.text }}>
                {m == null ? t('player.timer.untilMorning') : t('common.minutes', { n: m })}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
