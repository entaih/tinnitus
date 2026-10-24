import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { Screen, Text, Card, Button } from '@/components';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';

export default function ThoughtsListScreen() {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const thoughts = useClinical((s) => s.thoughts);
  const [openId, setOpenId] = useState<string | null>(thoughts[0]?.id ?? null);

  const field = (label: string, value: string) => value ? (
    <View style={{ gap: 2 }}>
      <Text variant="caption" tone="secondary">{label}</Text>
      <Text variant="body">{value}</Text>
    </View>
  ) : null;

  return (
    <>
      <Stack.Screen options={{ title: t('thought.list.title') }} />
      <Screen footer={<Button title={t('mind.thoughts.new')} icon={<Plus size={18} color={colors.onPrimary} />} onPress={() => router.push('/mind/thought-record')} />}>
        {thoughts.length === 0 ? <Text variant="body" tone="secondary">{t('thought.empty')}</Text> : null}
        {thoughts.map((x) => {
          const open = openId === x.id;
          const drop = x.intensity - x.intensityAfter;
          return (
            <Card key={x.id}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenId(open ? null : x.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 44 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="caption" tone="secondary">{formatDate(x.date, locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
                  <Text variant="bodyStrong" numberOfLines={open ? undefined : 2}>{x.thought}</Text>
                  <Text variant="caption" tone={drop > 0 ? 'success' : 'secondary'}>{x.emotion ? `${x.emotion} · ` : ''}{t('thought.change', { b: x.intensity, a: x.intensityAfter })}</Text>
                </View>
                {open ? <ChevronUp size={20} color={colors.textMuted} /> : <ChevronDown size={20} color={colors.textMuted} />}
              </Pressable>
              {open ? (
                <View style={{ gap: space[3] }}>
                  {field(t('thought.situation'), x.situation)}
                  {field(t('thought.evidenceFor'), x.evidenceFor)}
                  {field(t('thought.evidenceAgainst'), x.evidenceAgainst)}
                  {field(t('thought.balanced'), x.balanced)}
                </View>
              ) : null}
            </Card>
          );
        })}
      </Screen>
    </>
  );
}
