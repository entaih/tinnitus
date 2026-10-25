import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Check, Lightbulb } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { EvidenceChip } from '@/components/Chip';
import { pick, useLocale, useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { CITATIONS } from '@/content/citations';
import { insightForDay } from '@/content/insights';
import type { Program, ProgramTask } from '@/clinical/types';
import { taskTitle, tomorrowTask } from './taskBudget';

/**
 * The single completion moment of a session (PM §2.1): animated check, summary line, "Yarın: …" bridge to the next
 * day and the "Günün notu" insight (variable reward; one of 24 cited notes, never the same on consecutive days).
 */
export function SessionComplete({ program, pos, steps, minutes, withSound, weekDay, onCite }: {
  program: Program; pos: { week: number; day: number; dayIndex: number };
  steps: number; minutes: number; withSound: boolean; weekDay: number; onCite: (id: string) => void;
}) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);
  useEffect(() => { scale.value = reduceMotion ? 1 : withSpring(1, { damping: 12, stiffness: 160 }); }, [reduceMotion, scale]);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const tomorrow: ProgramTask | null = tomorrowTask(program, pos);
  const insight = insightForDay(program.id, pos.dayIndex);
  const level = CITATIONS[insight.citation]?.level;

  return (
    <>
      <Card style={{ alignItems: 'center', gap: space[3], paddingVertical: space[6] }}>
        <Animated.View style={checkStyle}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
            <Check size={44} color={colors.success} strokeWidth={3} />
          </View>
        </Animated.View>
        <Text variant="h2" center accessibilityRole="header">{t('session.complete.title')}</Text>
        <Text variant="body" tone="secondary" center>{t('session.complete.line')}</Text>
        <Text variant="bodyStrong" center>{t('session.complete.summary', { n: steps, min: minutes })}{withSound ? ` ${t('prog.plusSound')}` : ''} · {t('session.complete.weekDay', { k: weekDay })}</Text>
        {tomorrow ? (
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingHorizontal: space[3], paddingVertical: space[2] }}>
            <Text variant="bodySmall" tone="primary" center>{t('session.complete.tomorrowLine', { title: taskTitle(t, tomorrow), min: tomorrow.minutes })}</Text>
          </View>
        ) : null}
      </Card>
      <Card variant="tinted" overline={t('session.insight.title')}>
        <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
          <Lightbulb size={22} color={colors.accentText} />
          <Text variant="body" style={{ flex: 1 }}>{pick(insight, locale)}</Text>
        </View>
        {level ? <EvidenceChip level={level} onPress={() => onCite(insight.citation)} /> : null}
      </Card>
    </>
  );
}
