import React from 'react';
import { Pressable, View } from 'react-native';
import { Frown, Meh, Smile } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';
import type { DiaryEntry } from '@/clinical/types';

export type Mood = DiaryEntry['mood'];

/** Three 56 pt circular icon buttons: Zor / Orta / İyi. */
export function MoodCheck({ value, onSelect }: { value?: Mood; onSelect: (m: Mood) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const items: { mood: Mood; Icon: typeof Smile; key: string }[] = [
    { mood: 0, Icon: Frown, key: 'mood.hard' },
    { mood: 1, Icon: Meh, key: 'mood.ok' },
    { mood: 2, Icon: Smile, key: 'mood.good' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: space[2] }} accessibilityRole="radiogroup">
      {items.map(({ mood, Icon, key }) => {
        const selected = value === mood;
        const label = t(key);
        return (
          <Pressable
            key={mood}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t('mood.a11y', { label })}
            onPress={() => { void Haptics.selectionAsync(); onSelect(mood); }}
            style={({ pressed }) => ({ alignItems: 'center', gap: space[1], opacity: pressed ? 0.8 : 1, minWidth: 72 })}
          >
            <View style={{ width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.primary : colors.primarySoft, borderWidth: selected ? 0 : 1, borderColor: colors.border }}>
              <Icon size={28} color={selected ? colors.onPrimary : colors.primary} />
            </View>
            <Text variant="caption" style={{ color: selected ? colors.primary : colors.textSecondary }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
