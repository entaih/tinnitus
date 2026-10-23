import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Button, Card, Screen, Text } from '@/components';
import { MoodCheck, type Mood } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { today, useClinical } from '@/store/clinical';

function ScaleRow({ label, value, onChange, low, high }: { label: string; value: number; onChange: (v: number) => void; low: string; high: string }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="bodyStrong">{label}</Text>
        <Text variant="h3">{value}</Text>
      </View>
      <Slider
        minimumValue={0} maximumValue={10} step={1} value={value} onValueChange={(v: number) => onChange(v)}
        minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary}
        accessibilityLabel={label} accessibilityValue={{ text: t('diary.a11y.value', { label, v: value }) }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="secondary">{low}</Text>
        <Text variant="caption" tone="secondary">{high}</Text>
      </View>
    </View>
  );
}

/** Daily check-in: ~10 seconds. Loudness, annoyance, mood; optional sleep quality and note. */
export default function DiaryScreen() {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const { taskKey } = useLocalSearchParams<{ taskKey?: string }>();
  const { diary, upsertDiary, completeTask } = useClinical();
  const existing = diary.find((d) => d.date === today());

  const [loudness, setLoudness] = useState(existing?.loudness ?? 5);
  const [annoyance, setAnnoyance] = useState(existing?.annoyance ?? 5);
  const [mood, setMood] = useState<Mood>(existing?.mood ?? 1);
  const [withSleep, setWithSleep] = useState(existing?.sleepQuality != null);
  const [sleep, setSleep] = useState(existing?.sleepQuality ?? 5);
  const [note, setNote] = useState(existing?.note ?? '');

  const save = () => {
    upsertDiary({ date: today(), loudness, annoyance, mood, sleepQuality: withSleep ? sleep : undefined, note: note.trim() || undefined });
    if (typeof taskKey === 'string' && taskKey) completeTask(taskKey);
    if (router.canGoBack()) router.back(); else router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen options={{ title: t('diary.title') }} />
      <Screen footer={<Button title={t('diary.save')} onPress={save} />}>
        <Text variant="body" tone="secondary">{t('diary.intro')}</Text>
        <Card>
          <ScaleRow label={t('diary.loudness')} value={loudness} onChange={setLoudness} low={t('diary.scale.low')} high={t('diary.scale.high')} />
          <ScaleRow label={t('diary.annoyance')} value={annoyance} onChange={setAnnoyance} low={t('diary.scale.low')} high={t('diary.scale.high')} />
        </Card>
        <Card title={t('diary.mood')}>
          <MoodCheck value={mood} onSelect={setMood} />
        </Card>
        <Card>
          {withSleep ? (
            <ScaleRow label={t('diary.sleep')} value={sleep} onChange={setSleep} low={t('diary.scale.sleepLow')} high={t('diary.scale.sleepHigh')} />
          ) : (
            <Button variant="ghost" size="sm" title={t('diary.sleep.add')} onPress={() => setWithSleep(true)} />
          )}
          <Text variant="bodyStrong">{t('diary.note')}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('diary.notePlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={280}
            accessibilityLabel={t('diary.note')}
            style={{ minHeight: 72, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: space[3], color: colors.text, fontSize: 17, textAlignVertical: 'top', backgroundColor: colors.card }}
          />
        </Card>
      </Screen>
    </>
  );
}
