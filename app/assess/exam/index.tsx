import React from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronRight, CircleCheck, Circle } from 'lucide-react-native';
import { Banner, Button, Card, Disclaimer, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useProfile } from '@/hooks/useProfile';
import { applicableExamSteps, type ExamStepId } from '@/audio/examTests';
import type { ExamResult } from '@/clinical/types';

/** Hub of the guided self-examination battery: step list with status, and "start in order". */
export default function ExamHubScreen() {
  const t = useT();
  const { colors, space } = useTheme();
  const { assessment } = useProfile();
  const exam: ExamResult | undefined = assessment?.exam;
  const pulsatile = !!assessment?.redFlags?.pulsatile;
  const steps = applicableExamSteps({ pulsatile });
  const total = steps.reduce((s, x) => s + x.minutes, 0);

  const yn = (v: boolean | undefined) => (v == null ? '—' : v ? t('common.yes') : t('common.no'));
  const change = (v: 'quieter' | 'louder' | 'same' | null | undefined) => (v ? t(`exam.vascular.${v}`) : '—');

  /** Result line per step, or null when the step has not been done. */
  const resultOf = (id: ExamStepId): string | null => {
    if (!exam) return null;
    switch (id) {
      case 'din': return exam.dinSrtDb != null ? t('exam.hub.result.din', { db: exam.dinSrtDb }) : null;
      case 'ldl': return exam.ldlDb != null ? t('exam.hub.result.ldl', { db: exam.ldlDb }) : null;
      case 'pressure': return exam.valsalvaPop != null || exam.fullnessRelief != null ? t('exam.hub.result.pressure', { pop: yn(exam.valsalvaPop), relief: yn(exam.fullnessRelief) }) : null;
      case 'vascular': return exam.jugularChange != null || exam.headTurnChange != null ? t('exam.hub.result.vascular', { j: change(exam.jugularChange), h: change(exam.headTurnChange) }) : null;
      case 'balance': return exam.swayScore != null ? t('exam.hub.result.balance', { s: exam.swayScore }) : null;
      case 'somatic': return exam.somaticPositive != null ? t(exam.somaticPositive ? 'exam.hub.result.somatic.pos' : 'exam.hub.result.somatic.neg') : null;
      default: return null;
    }
  };

  const firstRoute = `${steps[0].route}?seq=1`;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('exam.title') }} />
      <Text variant="h1">{t('exam.title')}</Text>
      <Text variant="body" tone="secondary">{t('exam.hub.intro')}</Text>
      <Banner tone="warning" title={t('exam.hub.safety')} />

      <Text variant="overline" tone="secondary">{t('exam.hub.steps')} · {t('exam.hub.total', { n: total })}</Text>
      <View style={{ gap: space[2] }}>
        {steps.map((s) => {
          const res = resultOf(s.id);
          const done = res != null;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`${t(`exam.step.${s.id}`)}, ${done ? t('exam.done') : t('exam.notDone')}`}
              onPress={() => router.push(s.route as never)}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  {done ? <CircleCheck size={24} color={colors.success} /> : <Circle size={24} color={colors.textMuted} />}
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong">{t(`exam.step.${s.id}`)}</Text>
                    <Text variant="caption" tone="secondary">{t(`exam.step.${s.id}.desc`)}</Text>
                    <Text variant="caption" tone={done ? 'success' : 'muted'}>{done ? res : `${t('exam.notDone')} · ${t('exam.minutes', { n: s.minutes })}`}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Button title={t('exam.hub.startAll')} onPress={() => router.push(firstRoute as never)} />
      <Text variant="caption" tone="muted">{t('exam.hub.resultsNote')}</Text>
      <Disclaimer textKey="disclaimer.short" />
    </Screen>
  );
}
