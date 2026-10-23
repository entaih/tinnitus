import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BookOpenText, Check, Moon, NotebookPen, Wind } from 'lucide-react-native';
import { Screen, Text, Card, Row, SectionHeader, EvidenceChip, useCitation } from '@/components';
import { ThemeProvider, useTheme } from '@/theme';
import { useT } from '@/i18n';

const CHECKLIST = ['screens', 'caffeine', 'light', 'sound', 'worry'] as const;

export default function SleepRoute() {
  return (
    <ThemeProvider night>
      <SleepHub />
    </ThemeProvider>
  );
}

function SleepHub() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <>
      <Stack.Screen options={{ title: t('sleep.title'), headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.primary, headerTitleStyle: { color: colors.text, fontWeight: '600' }, contentStyle: { backgroundColor: colors.bg } }} />
      <StatusBar style="light" />
      <Screen>
        <Text variant="h1">{t('sleep.title')}</Text>
        <Text variant="bodySmall" tone="secondary">{t('sleep.subtitle')}</Text>

        <Card onPress={() => router.push({ pathname: '/sound/player', params: { preset: 'sleep' } })} title={t('sleep.card.sound')} right={<Moon size={24} color={colors.primary} />}>
          <Text variant="bodySmall" tone="secondary">{t('sleep.card.soundDesc')}</Text>
        </Card>
        <Card onPress={() => router.push('/exercise/breathing')} title={t('sleep.card.breath')} right={<Wind size={24} color={colors.primary} />}>
          <Text variant="bodySmall" tone="secondary">{t('sleep.card.breathDesc')}</Text>
        </Card>
        <Card onPress={() => router.push('/sleep/diary')} title={t('sleep.card.diary')} right={<NotebookPen size={24} color={colors.primary} />}>
          <Text variant="bodySmall" tone="secondary">{t('sleep.card.diaryDesc')}</Text>
        </Card>

        <SectionHeader title={t('sleep.windDown.title')} />
        <Card>
          <Text variant="bodySmall" tone="secondary">{t('sleep.windDown.intro')}</Text>
          {CHECKLIST.map((k) => {
            const on = !!done[k];
            return (
              <Pressable key={k} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setDone((d) => ({ ...d, [k]: !d[k] }))}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 48, opacity: pressed ? 0.7 : 1 })}>
                <View style={{ width: 26, height: 26, borderRadius: radius.sm, borderWidth: 1.5, borderColor: on ? colors.primary : colors.borderStrong, backgroundColor: on ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Check size={16} color={colors.onPrimary} /> : null}
                </View>
                <Text variant="body" style={{ flex: 1, opacity: on ? 0.6 : 1 }}>{t(`sleep.windDown.${k}`)}</Text>
              </Pressable>
            );
          })}
        </Card>

        <Card variant="tinted">
          <Row icon={<BookOpenText size={20} color={colors.primary} />} title={t('sleep.cbti.title')} subtitle={t('sleep.cbti.body')} onPress={() => router.push('/mind/cbti.education')} />
          <EvidenceChip level="rct" onPress={() => open('marks2023')} />
        </Card>
        {sheet}
      </Screen>
    </>
  );
}
