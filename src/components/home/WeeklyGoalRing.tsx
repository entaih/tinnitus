import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { ProgressRing } from '@/components/ProgressRing';
import { useT } from '@/i18n';
import { WEEKLY_GOAL_DAYS } from './taskBudget';

/**
 * Weekly goal ring (PM §2.5): "3/5" active days this week, goal 5 of 7. No daily streak; a missed day costs
 * nothing. Turns green with "Haftalık hedef tamam" once the goal is met. Circular progress via react-native-svg.
 */
export function WeeklyGoalRing({ done, goal = WEEKLY_GOAL_DAYS, size = 84 }: { done: number; goal?: number; size?: number }) {
  const { colors, space } = useTheme();
  const t = useT();
  const met = done >= goal;
  const label = t('home.weekly.goalOf', { done: Math.min(done, goal), goal });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
      <ProgressRing progress={goal ? Math.min(1, done / goal) : 0} size={size} stroke={9} label={label} caption={undefined} color={met ? colors.success : colors.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" tone="secondary">{t('home.weekly.goal')}</Text>
        <Text variant="bodyStrong" tone={met ? 'success' : 'default'}>{met ? t('home.weekly.goalMet') : t('home.weekly.goalBody', { left: goal - done })}</Text>
        <Text variant="caption" tone="muted">{t('home.weekly.goalHint', { goal })}</Text>
      </View>
    </View>
  );
}
