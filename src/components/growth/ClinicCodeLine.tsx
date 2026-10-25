import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Building2, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useGrowth } from '@/store/growth';

/** One line on Home before a programme exists (PM sprint 3 §B3): "Klinik kodunuz var mı?" → /clinic. Hidden once a code is stored. */
export function ClinicCodeLine() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const clinic = useGrowth((s) => s.clinic);
  if (clinic) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('growth.clinic.line')}
      accessibilityHint={t('growth.clinic.line.hint')}
      onPress={() => router.push('/clinic')}
      style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[3], borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}
    >
      <Building2 size={18} color={colors.textSecondary} />
      <View style={{ flex: 1 }}><Text variant="bodySmall" tone="secondary">{t('growth.clinic.line')}</Text></View>
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}
