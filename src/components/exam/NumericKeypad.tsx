import React from 'react';
import { Pressable, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

interface Props {
  value: number[];
  onChange: (digits: number[]) => void;
  maxDigits?: number;
  disabled?: boolean;
}

const ROWS: (number | 'del' | null)[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [null, 0, 'del']];

/** Large numeric keypad with a slot display, used by the digits-in-noise test. */
export function NumericKeypad({ value, onChange, maxDigits = 3, disabled }: Props) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const press = (k: number | 'del') => {
    if (disabled) return;
    void Haptics.selectionAsync();
    if (k === 'del') { onChange(value.slice(0, -1)); return; }
    if (value.length >= maxDigits) return;
    onChange([...value, k]);
  };
  return (
    <View style={{ gap: space[3] }}>
      <View accessible accessibilityLabel={value.join(' ')} style={{ flexDirection: 'row', justifyContent: 'center', gap: space[3] }}>
        {Array.from({ length: maxDigits }).map((_, i) => (
          <View key={i} style={{ width: 56, height: 64, borderRadius: radius.md, borderWidth: 2, borderColor: value[i] != null ? colors.primary : colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="numeric">{value[i] != null ? String(value[i]) : ''}</Text>
          </View>
        ))}
      </View>
      {ROWS.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: space[3] }}>
          {row.map((k, c) => k == null ? <View key={c} style={{ flex: 1 }} /> : (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? t('exam.keypad.delete') : t('exam.keypad.digit', { d: k })}
              accessibilityState={{ disabled: !!disabled }}
              disabled={disabled}
              onPress={() => press(k)}
              style={({ pressed }) => ({
                flex: 1, minHeight: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
                backgroundColor: k === 'del' ? colors.skeleton : colors.card, borderWidth: 1, borderColor: colors.border,
                opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
              })}
            >
              {k === 'del' ? <Delete size={24} color={colors.textSecondary} /> : <Text variant="h2">{String(k)}</Text>}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
