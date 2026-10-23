import React from 'react';
import { View } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { useT } from '@/i18n';

export function Disclaimer({ textKey = 'disclaimer.results' }: { textKey?: string }) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', gap: space[3], backgroundColor: colors.skeleton, borderRadius: radius.sm, padding: space[4] }}>
      <Info size={18} color={colors.textSecondary} />
      <Text variant="bodySmall" tone="secondary" style={{ flex: 1 }}>{t(textKey)}</Text>
    </View>
  );
}
