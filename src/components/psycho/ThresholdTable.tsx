import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';
import { SCREENING_FREQS } from '@/audio/psychoacoustics';

export type EarColumn = 'right' | 'left' | 'both';

interface Props {
  /** Columns to show, in order. */
  ears: EarColumn[];
  /** ear → freq → threshold (dB re full scale); null = not heard at the safe cap; undefined = not tested. */
  values: Partial<Record<EarColumn, Record<number, number | null | undefined>>>;
}

/**
 * Per-frequency screening thresholds in dB re device full scale. The unit line states explicitly that these
 * are not dB HL and carry ±10 dB uncertainty (audiologist A1 / B10); the clinician reads the table, not a label.
 */
export function ThresholdTable({ ears, values }: Props) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const cell = (v: number | null | undefined) => (v === undefined ? '—' : v === null ? t('psy.hear.chart.notHeard') : `${Math.round(v)}`);
  const summary = ears.map((ear) => `${t(`psy.hear.ear.${ear}`)}: ${SCREENING_FREQS.map((f) => `${f} Hz ${cell(values[ear]?.[f])}`).join(', ')}`).join('. ');
  return (
    <View accessible accessibilityLabel={`${t('psy.hear.table.title')}. ${summary}`} style={{ gap: space[2] }}>
      <Text variant="overline" tone="secondary">{t('psy.hear.table.title')}</Text>
      <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.primarySoft, paddingVertical: space[1], paddingHorizontal: space[2] }}>
          <Text variant="caption" tone="secondary" style={{ flex: 1.2 }}>Hz</Text>
          {ears.map((ear) => <Text key={ear} variant="caption" tone="secondary" style={{ flex: 1, textAlign: 'right' }}>{t(`psy.hear.ear.${ear}`)}</Text>)}
        </View>
        {SCREENING_FREQS.map((f, i) => (
          <View key={f} style={{ flexDirection: 'row', paddingVertical: space[1], paddingHorizontal: space[2], backgroundColor: i % 2 ? colors.card : colors.skeleton }}>
            <Text variant="bodySmall" style={{ flex: 1.2 }}>{f}</Text>
            {ears.map((ear) => <Text key={ear} variant="bodySmall" style={{ flex: 1, textAlign: 'right' }}>{cell(values[ear]?.[f])}</Text>)}
          </View>
        ))}
      </View>
      <Text variant="caption" tone="muted">{t('psy.hear.table.unit')}</Text>
    </View>
  );
}
