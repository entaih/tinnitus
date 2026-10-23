import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

interface Props {
  /** Current level in dBFS (≤ 0); undefined when not measuring. */
  dbfs?: number;
  /** Pass threshold in dBFS; levels above are tinted warning. */
  thresholdDbfs?: number;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
}

/** Horizontal ambient-noise meter (relative dBFS, not calibrated SPL). */
export function LevelMeter({ dbfs, thresholdDbfs = -40, min = -80, max = 0, accessibilityLabel }: Props) {
  const { colors, radius, space } = useTheme();
  const v = dbfs == null ? min : Math.max(min, Math.min(max, dbfs));
  const frac = (v - min) / (max - min);
  const thr = (Math.max(min, Math.min(max, thresholdDbfs)) - min) / (max - min);
  const noisy = dbfs != null && dbfs > thresholdDbfs;
  return (
    <View accessible accessibilityLabel={accessibilityLabel} accessibilityValue={{ text: dbfs == null ? '' : `${Math.round(dbfs)} dBFS` }} style={{ gap: space[1] }}>
      <View style={{ height: 14, borderRadius: radius.full, backgroundColor: colors.border, overflow: 'hidden' }}>
        <View style={{ width: `${Math.round(frac * 100)}%`, height: '100%', borderRadius: radius.full, backgroundColor: noisy ? colors.warning : colors.primary }} />
        <View style={{ position: 'absolute', left: `${Math.round(thr * 100)}%`, top: 0, bottom: 0, width: 2, backgroundColor: colors.textSecondary }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">{min} dBFS</Text>
        <Text variant="caption" tone="muted">{dbfs == null ? '—' : `${Math.round(dbfs)} dBFS`}</Text>
        <Text variant="caption" tone="muted">{max} dBFS</Text>
      </View>
    </View>
  );
}
