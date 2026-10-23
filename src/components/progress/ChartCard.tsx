import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

/**
 * Card wrapper for a chart: title, legend, the chart (visually), a sibling text summary that also serves
 * as the accessibilityLabel, and a "Nasıl yorumlanır?" disclosure.
 */
export function ChartCard({ title, summary, howToRead, legend, children, footer }: {
  title: string; summary: string; howToRead?: string; legend?: { color: string; label: string; dashed?: boolean }[]; children?: React.ReactNode; footer?: React.ReactNode;
}) {
  const { colors, space } = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Card title={title}>
      {legend?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[3] }}>
          {legend.map((l) => (
            <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: l.color, opacity: l.dashed ? 0.6 : 1 }} />
              <Text variant="caption" tone="secondary">{l.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View accessible accessibilityLabel={t('progress.chart.a11y', { summary })}>
        {children}
      </View>
      <Text variant="bodySmall" tone="secondary">{summary}</Text>
      {footer}
      {howToRead ? (
        <View style={{ gap: space[2] }}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((v) => !v)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text variant="caption" style={{ color: colors.primary }}>{t('progress.howToRead')}</Text>
          </Pressable>
          {open ? <Text variant="bodySmall" tone="secondary">{howToRead}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}
