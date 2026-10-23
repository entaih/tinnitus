import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';
import { Screen, Text, Button, Card, Stepper, SectionHeader, Row, Disclaimer } from '@/components';
import { ThemeProvider, useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';

interface SleepDetail {
  bed: string; wake: string; sol: number; awakenings: number; waso: number; quality: number;
  tib: number; tst: number; efficiency: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const hm = (h: number, m: number) => `${pad2(h)}:${pad2(m)}`;

function computeSleep(bedH: number, bedM: number, wakeH: number, wakeM: number, sol: number, waso: number) {
  const tib = ((wakeH * 60 + wakeM) - (bedH * 60 + bedM) + 1440) % 1440;
  const tst = Math.max(0, tib - sol - waso);
  const efficiency = tib > 0 ? Math.round((tst / tib) * 100) : 0;
  return { tib, tst, efficiency };
}

export default function SleepDiaryRoute() {
  return (
    <ThemeProvider night>
      <SleepDiary />
    </ThemeProvider>
  );
}

function SleepDiary() {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const logSession = useClinical((s) => s.logSession);
  const sessions = useClinical((s) => s.sessions);

  const [bedH, setBedH] = useState(23); const [bedM, setBedM] = useState(0);
  const [sol, setSol] = useState(20);
  const [awakenings, setAwakenings] = useState(1);
  const [waso, setWaso] = useState(15);
  const [wakeH, setWakeH] = useState(7); const [wakeM, setWakeM] = useState(0);
  const [quality, setQuality] = useState(5);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const calc = computeSleep(bedH, bedM, wakeH, wakeM, sol, waso);
  const hrs = (min: number) => `${Math.floor(min / 60)} ${t('sleep.diary.h')} ${min % 60} ${t('sleep.diary.min')}`;

  const last7 = useMemo(() => {
    const rows: { id: string; date: string; d: SleepDetail }[] = [];
    for (let i = sessions.length - 1; i >= 0 && rows.length < 7; i--) {
      const s = sessions[i];
      if (s.type !== 'sleep' || !s.detail) continue;
      try { rows.push({ id: s.id, date: s.date, d: JSON.parse(s.detail) as SleepDetail }); } catch {}
    }
    return rows;
  }, [sessions]);

  const save = () => {
    const d: SleepDetail = { bed: hm(bedH, bedM), wake: hm(wakeH, wakeM), sol, awakenings, waso, quality, ...calc };
    logSession({ type: 'sleep', minutes: calc.tst, detail: JSON.stringify(d) });
    setSavedAt(Date.now());
  };

  const effTone = calc.efficiency >= 85 ? 'success' : calc.efficiency >= 75 ? 'default' : 'warning';

  return (
    <>
      <Stack.Screen options={{ title: t('sleep.diary.title'), headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.primary, headerTitleStyle: { color: colors.text, fontWeight: '600' }, contentStyle: { backgroundColor: colors.bg } }} />
      <StatusBar style="light" />
      <Screen>
        <Text variant="h1">{t('sleep.diary.title')}</Text>
        <Text variant="bodySmall" tone="secondary">{t('sleep.diary.subtitle')}</Text>

        <Card title={t('sleep.diary.bedtime')}>
          <Stepper label={t('sleep.diary.hour')} value={bedH} onChange={setBedH} min={0} max={23} format={(v) => pad2(v)} />
          <Stepper label={t('sleep.diary.minute')} value={bedM} onChange={setBedM} min={0} max={45} step={15} format={(v) => pad2(v)} />
        </Card>
        <Card>
          <Stepper label={t('sleep.diary.sol')} value={sol} onChange={setSol} min={0} max={180} step={5} format={(v) => `${v} ${t('sleep.diary.min')}`} />
          <Stepper label={t('sleep.diary.awakenings')} value={awakenings} onChange={setAwakenings} min={0} max={10} />
          <Stepper label={t('sleep.diary.waso')} value={waso} onChange={setWaso} min={0} max={240} step={5} format={(v) => `${v} ${t('sleep.diary.min')}`} />
        </Card>
        <Card title={t('sleep.diary.wakeTime')}>
          <Stepper label={t('sleep.diary.hour')} value={wakeH} onChange={setWakeH} min={0} max={23} format={(v) => pad2(v)} />
          <Stepper label={t('sleep.diary.minute')} value={wakeM} onChange={setWakeM} min={0} max={45} step={15} format={(v) => pad2(v)} />
        </Card>
        <Card title={t('sleep.diary.quality')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Text variant="caption" tone="secondary">0</Text>
            <Slider style={{ flex: 1, height: 44 }} minimumValue={0} maximumValue={10} step={1} value={quality} onValueChange={setQuality}
              minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.card}
              accessibilityRole="adjustable" accessibilityLabel={t('sleep.diary.quality')} accessibilityValue={{ min: 0, max: 10, now: quality }} />
            <Text variant="caption" tone="secondary">10</Text>
          </View>
          <Text variant="h3" center>{quality} / 10</Text>
        </Card>

        <Card variant="tinted" title={t('sleep.diary.summary')}>
          <Text variant="bodySmall" tone="secondary">{t('sleep.diary.tib')}: {hrs(calc.tib)}</Text>
          <Text variant="bodySmall" tone="secondary">{t('sleep.diary.tst')}: {hrs(calc.tst)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2] }}>
            <Text variant="numeric" tone={effTone}>{calc.efficiency} %</Text>
            <Text variant="bodySmall" tone="secondary">{t('sleep.diary.efficiency')}</Text>
          </View>
          <Text variant="caption" tone="secondary">{t('sleep.diary.efficiencyHint')}</Text>
        </Card>

        <Button title={savedAt ? t('sleep.diary.saved') : t('common.save')} onPress={save} disabled={!!savedAt} />
        {savedAt ? <Button variant="ghost" title={t('common.done')} onPress={() => router.back()} /> : null}

        <SectionHeader title={t('sleep.diary.last7')} />
        {last7.length === 0 ? (
          <Text variant="bodySmall" tone="secondary">{t('sleep.diary.empty')}</Text>
        ) : (
          <Card>
            {last7.map((r) => (
              <Row key={r.id} title={`${formatDate(r.date, locale)} · ${r.d.efficiency} %`} subtitle={`${r.d.bed} → ${r.d.wake} · ${hrs(r.d.tst)} · ${t('sleep.diary.qualityShort')} ${r.d.quality}/10`} />
            ))}
          </Card>
        )}
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
