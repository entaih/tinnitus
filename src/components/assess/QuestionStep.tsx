import React from 'react';
import { View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';

/**
 * One-item-per-screen layout: overline "SORU n / N", thin progress bar, stem, options, ghost back button.
 */
export function QuestionStep({ index, total, stem, hint, children, onBack, backDisabled, progressLabel }: {
  index: number; total: number; stem: string; hint?: string; children: React.ReactNode;
  onBack: () => void; backDisabled?: boolean; progressLabel?: string;
}) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const pct = Math.max(0, Math.min(1, (index + 1) / total));
  return (
    <View style={{ gap: space[4] }}>
      <View style={{ gap: space[2] }}>
        <Text variant="overline" tone="secondary">{progressLabel ?? t('q.progress', { n: index + 1, total })}</Text>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: total, now: index + 1 }}
          style={{ height: 4, borderRadius: radius.full, backgroundColor: colors.primaryTrack, overflow: 'hidden' }}
        >
          <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
      </View>
      <Text variant="h3" accessibilityRole="header">{stem}</Text>
      {hint ? <Text variant="bodySmall" tone="secondary">{hint}</Text> : null}
      <View style={{ gap: space[2] }}>{children}</View>
      <View style={{ alignItems: 'flex-start' }}>
        <Button
          variant="ghost"
          size="sm"
          title={t('common.back')}
          disabled={backDisabled}
          onPress={onBack}
          icon={<ChevronLeft size={18} color={backDisabled ? colors.textMuted : colors.primary} />}
        />
      </View>
    </View>
  );
}
