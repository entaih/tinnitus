import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Card, Button, Banner, Chip, EvidenceChip, Disclaimer, useCitation } from '@/components';
import { MarkdownLite, PracticeTimer, Worksheet, Checklist, ExposurePractice, SleepWindowCalc, HierarchyBuilder } from '@/components/mind';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { getModule, type ModulePractice } from '@/content/modules';
import { citation } from '@/content/citations';
import { UNITS } from '@/content/registry';

export default function ModuleScreen() {
  const { module: id, taskKey } = useLocalSearchParams<{ module: string; taskKey?: string }>();
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const { logSession, completeTask, sessions } = useClinical();
  const mod = getModule(String(id));
  const [practiceMinutes, setPracticeMinutes] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useMemo(() => Date.now(), []);

  const diaryAvg = useMemo(() => {
    const rows: number[] = [];
    for (let i = sessions.length - 1; i >= 0 && rows.length < 7; i--) if (sessions[i].type === 'sleep') rows.push(sessions[i].minutes);
    return rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : undefined;
  }, [sessions]);

  if (!mod) {
    return (
      <>
        <Stack.Screen options={{ title: t('mind.title') }} />
        <Screen><Text variant="body">{t('module.notFound')}</Text></Screen>
      </>
    );
  }
  const unitMinutes = UNITS[mod.id]?.minutes ?? 10;
  const logExtra = (type: string, detail: unknown, minutes = 0) => logSession({ type, minutes, detail: `${mod.id}:${typeof detail === 'string' ? detail : JSON.stringify(detail)}` });

  const complete = () => {
    const elapsed = Math.round((Date.now() - startedAt) / 60000);
    const minutes = Math.max(1, Math.min(60, Math.max(practiceMinutes, Math.min(elapsed, unitMinutes))));
    logSession({ type: 'module', minutes, detail: mod.id });
    if (typeof taskKey === 'string' && taskKey) completeTask(taskKey);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFinished(true);
    setTimeout(() => router.back(), 900);
  };

  const renderPractice = (p: ModulePractice) => {
    switch (p.kind) {
      case 'timer':
        return <PracticeTimer steps={p.steps ?? []} onFinish={(sec) => setPracticeMinutes(Math.max(1, Math.round(sec / 60)))} />;
      case 'worksheet':
        return <Worksheet items={p.items ?? []} onSave={(answers) => { logExtra('worksheet', answers); setPracticeMinutes((m) => Math.max(m, p.minutes ?? 5)); }} />;
      case 'checklist':
        return <Checklist items={p.items ?? []} onChange={(checked) => { if (checked.some(Boolean)) setPracticeMinutes((m) => Math.max(m, p.minutes ?? 3)); }} />;
      case 'exposure':
        return <ExposurePractice defaultMinutes={p.minutes ?? 5} onFinish={(r) => { logExtra('exposure', r, r.minutes); setPracticeMinutes((m) => Math.max(m, r.minutes)); }} />;
      case 'sleepWindow':
        return <SleepWindowCalc diaryAvgMinutes={diaryAvg} onSave={(r) => { logExtra('sleepWindow', r); setPracticeMinutes((m) => Math.max(m, p.minutes ?? 5)); }} />;
      case 'hierarchy':
        return <HierarchyBuilder examples={p.items ?? []} onSave={(items) => { logExtra('hierarchy', items); setPracticeMinutes((m) => Math.max(m, p.minutes ?? 10)); }} />;
      case 'thoughtRecord':
        return (
          <View style={{ gap: space[3] }}>
            <Text variant="bodySmall" tone="secondary">{t('module.thoughtRecord.hint')}</Text>
            <Button variant="secondary" title={t('module.thoughtRecord.open')} onPress={() => { setPracticeMinutes((m) => Math.max(m, p.minutes ?? 5)); router.push('/mind/thought-record'); }} />
          </View>
        );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: mod.title[locale] }} />
      <Screen footer={finished ? undefined : (
        <View style={{ gap: space[1] }}>
          <Button title={t('module.complete')} onPress={complete} />
          <Text variant="caption" tone="secondary" center>{t('module.completeHint')}</Text>
        </View>
      )}>
        <Text variant="h1" accessibilityRole="header">{mod.title[locale]}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
          <Chip label={t('mind.module.minutes', { n: unitMinutes })} />
          {mod.citations.map((c) => { const cit = citation(c); return cit ? <EvidenceChip key={c} level={cit.level} onPress={() => open(c)} /> : null; })}
        </View>
        <Text variant="body" tone="secondary">{mod.intro[locale]}</Text>

        {mod.sections.map((s, i) => {
          if (s.kind === 'warning') return <Banner key={i} tone="warning" title={s.heading[locale]} body={s.body[locale]} />;
          if (s.kind === 'tip') return (
            <Card key={i} variant="tinted" overline={t('module.kind.tip')} title={s.heading[locale]}>
              <MarkdownLite text={s.body[locale]} />
            </Card>
          );
          return (
            <View key={i} style={{ gap: space[2] }}>
              {s.kind === 'exercise' ? <Text variant="overline" tone="primary">{t('module.kind.exercise')}</Text> : null}
              <Text variant="h2" accessibilityRole="header">{s.heading[locale]}</Text>
              <MarkdownLite text={s.body[locale]} />
            </View>
          );
        })}

        {mod.practice ? (
          <Card title={t('module.practice')} overline={mod.practice.minutes ? t('mind.module.minutes', { n: mod.practice.minutes }) : undefined}>
            {renderPractice(mod.practice)}
          </Card>
        ) : null}

        <Card variant="tinted" overline={t('module.takeaway')}>
          <Text variant="bodyStrong">{mod.keyTakeaway[locale]}</Text>
        </Card>

        <View style={{ gap: space[2] }}>
          <Text variant="h3">{t('module.sources')}</Text>
          {mod.citations.map((c) => { const cit = citation(c); if (!cit) return null; return (
            <Text key={c} variant="bodySmall" tone="primary" onPress={() => open(c)} accessibilityRole="link" style={{ paddingVertical: 4 }}>{cit.authors} ({cit.year}). {cit.title}.</Text>
          ); })}
        </View>
        <Disclaimer textKey="disclaimer.short" />

        {finished ? (
          <View style={{ alignItems: 'center', gap: space[2], paddingVertical: space[4] }} accessibilityLiveRegion="polite">
            <CheckCircle2 size={56} color={colors.success} />
            <Text variant="h3">{t('module.completed')}</Text>
            <Text variant="bodySmall" tone="secondary" center>{t('module.completedBody', { n: Math.max(practiceMinutes, 1) })}</Text>
          </View>
        ) : null}
        {sheet}
      </Screen>
    </>
  );
}
