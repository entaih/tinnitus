import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, ReduceMotion } from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';

/**
 * One-item-per-screen layout: overline "SORU n / N", thin progress bar, stem, options, ghost back button.
 * When the question changes, the stem and its options slide out to the left and the next ones slide in from the
 * right, so a user whose eyes are on the options still notices that a new question has arrived. Skipped when the
 * app's or the system's reduce-motion setting is on.
 */
export function QuestionStep({ index, total, stem, hint, children, onBack, backDisabled, progressLabel, stepKey }: {
  index: number; total: number; stem: string; hint?: string; children: React.ReactNode;
  onBack: () => void; backDisabled?: boolean; progressLabel?: string;
  /** Identity of the current question; defaults to index + stem. A change triggers the transition. */
  stepKey?: string;
}) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const appReduceMotion = useSettings((s) => s.reduceMotion);
  const motion = appReduceMotion ? ReduceMotion.Always : ReduceMotion.System;
  const key = stepKey ?? `${index}|${stem}`;
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
      <Animated.View
        key={key}
        entering={FadeInRight.delay(170).duration(240).reduceMotion(motion)}
        exiting={FadeOutLeft.duration(160).reduceMotion(motion)}
        style={{ gap: space[4] }}
      >
        <Text variant="h3" accessibilityRole="header" accessibilityLiveRegion="polite">{stem}</Text>
        {hint ? <Text variant="bodySmall" tone="secondary">{hint}</Text> : null}
        <View style={{ gap: space[2] }}>{children}</View>
      </Animated.View>
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
