import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { useT } from '@/i18n';

/** "Screen estimate" chip + the standard "does not replace a clinical test" line; shown with every exam result. */
export function EstimateNote() {
  const { space } = useTheme();
  const t = useT();
  return (
    <View style={{ gap: space[2] }}>
      <Chip small tone="info" label={t('exam.estimate')} />
      <Text variant="bodySmall" tone="secondary">{t('exam.notClinical')}</Text>
    </View>
  );
}
