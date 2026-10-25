import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TrackArt, type TrackKind } from '@/components/illustrations';
import { ScrollView, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BookOpen, CheckCircle2, Clock3 } from 'lucide-react-native';
import { Screen, Text, Card, Button, Banner, Chip, EvidenceChip, Disclaimer, useCitation } from '@/components';
import { MarkdownLite, PracticeTimer, Worksheet, Checklist, ExposurePractice, SleepWindowCalc, HierarchyBuilder } from '@/components/mind';
import { resumeIndex, useModuleProgress } from '@/components/home/moduleProgress';
import { SUMMARY_MINUTES } from '@/components/home/taskBudget';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { getModule, type ModulePractice } from '@/content/modules';
import { citation } from '@/content/citations';
import { UNITS } from '@/content/registry';

/**
 * Module screen (PM sprint 2 §B3). The 2-minute summary card comes first: three bullets, "Tam modülü oku" and —
 * when opened from a programme task — "Bugün yalnız özet yeter", which completes the task and counts
 * `summaryOnlyUsed`. With `?summary=1` (short session) the full text stays folded until "Tam modülü oku".
 * The section the reader reached is persisted (dingin.moduleProgress) so a half-read module reopens where it was.
 */
/** Header art for a lesson, from its id. */
function trackArtFor(id: string): TrackKind {
  if (id.startsWith('cbti.') || id === 'cbt.sleepGuidelines') return 'sleep';
  if (id.includes('relax') || id.startsWith('mind.') || id === 'cbt.positiveImagery') return 'relax';
  if (id === 'cbt.soundEnrichment' || id.startsWith('hyper.') || id === 'cbt.exposure') return 'sound';
  if (id === 'cbt.hearingTactics') return 'hearing';
  if (id.startsWith('somatic.')) return 'neck';
  if (id === 'cbt.welcome' || id === 'cbt.psychoeducation' || id === 'cbt.relapse' || id === 'cbt.toolbox') return 'learn';
  return 'thoughts';
}

export default function ModuleScreen() {
  const { module: id, taskKey, summary: summaryParam } = useLocalSearchParams<{ module: string; taskKey?: string; summary?: string }>();
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const { logSession, completeTask, sessions, program } = useClinical();
  const track = useGrowth((s) => s.track);
  const progress = useModuleProgress((s) => s.progress);
  const setProgress = useModuleProgress((s) => s.setProgress);
  const clearProgress = useModuleProgress((s) => s.clearProgress);
  const mod = getModule(String(id));
  const [practiceMinutes, setPracticeMinutes] = useState(0);
  const [finished, setFinished] = useState<'full' | 'summary' | null>(null);
  const [showFull, setShowFull] = useState(summaryParam !== '1');
  const startedAt = useMemo(() => Date.now(), []);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const sectionY = useRef<number[]>([]);
  const lastSaved = useRef(-1);
  const resumedOnce = useRef(false);

  const key = typeof taskKey === 'string' && taskKey ? taskKey : null;
  const taskDone = !!(key && program?.completed[key]);
  const sectionCount = mod?.sections.length ?? 0;
  const resumeAt = mod ? resumeIndex(progress, mod.id, sectionCount) : null;
  const [resumeBanner, setResumeBanner] = useState<number | null>(resumeAt);

  const diaryAvg = useMemo(() => {
    const rows: number[] = [];
    for (let i = sessions.length - 1; i >= 0 && rows.length < 7; i--) if (sessions[i].type === 'sleep') rows.push(sessions[i].minutes);
    return rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : undefined;
  }, [sessions]);

  const scrollToSection = useCallback((i: number) => {
    const y = sectionY.current[i];
    if (typeof y === 'number') scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  }, []);

  // Resume: once the sections have been laid out, jump to the saved one (only when the full text is shown).
  const onSectionLayout = (i: number) => (e: LayoutChangeEvent) => {
    sectionY.current[i] = e.nativeEvent.layout.y;
    if (!resumedOnce.current && showFull && resumeAt != null && sectionY.current.slice(0, resumeAt + 1).every((v) => typeof v === 'number')) {
      resumedOnce.current = true;
      setTimeout(() => scrollToSection(resumeAt), 50);
    }
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!mod || !showFull) return;
    const y = e.nativeEvent.contentOffset.y + 80;
    let reached = 0;
    sectionY.current.forEach((sy, i) => { if (typeof sy === 'number' && sy <= y) reached = i; });
    if (reached !== lastSaved.current) { lastSaved.current = reached; setProgress(mod.id, reached); }
  };

  if (!mod) {
    return (
      <>
        <Stack.Screen options={{ title: t('mind.title') }} />
        <Screen><Text variant="body">{t('module.notFound')}</Text></Screen>
      </>
    );
  }
  const unitMinutes = UNITS[mod.id]?.minutes ?? 10;
  const bullets = mod.summary[locale];
  const logExtra = (type: string, detail: unknown, minutes = 0) => logSession({ type, minutes, detail: `${mod.id}:${typeof detail === 'string' ? detail : JSON.stringify(detail)}` });

  const finish = (mode: 'full' | 'summary') => {
    const elapsed = Math.round((Date.now() - startedAt) / 60000);
    const minutes = mode === 'summary'
      ? Math.max(1, Math.min(SUMMARY_MINUTES, Math.max(1, elapsed)))
      : Math.max(1, Math.min(60, Math.max(practiceMinutes, Math.min(elapsed, unitMinutes))));
    logSession({ type: 'module', minutes, detail: mode === 'summary' ? `${mod.id}:summary` : mod.id });
    if (key) completeTask(key);
    if (mode === 'summary') track('summaryOnlyUsed');
    else clearProgress(mod.id);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFinished(mode);
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

  const summaryCard = (
    <Card variant="tinted" overline={t('module.summary.title')} title={mod.title[locale]}>
      <View style={{ alignItems: 'center' }}><TrackArt track={trackArtFor(mod.id)} width={150} accessibilityLabel={mod.title[locale]} /></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
        <Chip label={t('mind.module.minutes', { n: SUMMARY_MINUTES })} />
        {/* One evidence chip per distinct level (three identical "Kılavuz önerisi" chips read as noise). */}
        {Array.from(new Map(mod.citations.map((c) => [citation(c)?.level, c] as const)).values()).map((c) => { const cit = citation(c); return cit ? <EvidenceChip key={c} level={cit.level} onPress={() => open(c)} /> : null; })}
      </View>
      <View style={{ gap: space[2] }} accessibilityRole="list">
        {bullets.map((b, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <Text variant="caption" tone="primary">{i + 1}</Text>
            </View>
            <Text variant="body" style={{ flex: 1 }}>{b}</Text>
          </View>
        ))}
      </View>
      {!finished ? (
        <View style={{ gap: space[2] }}>
          {!showFull ? <Button title={t('module.summary.readFull')} icon={<BookOpen size={18} color={colors.onPrimary} />} onPress={() => setShowFull(true)} /> : null}
          {key && !taskDone ? (
            <>
              <Button variant={showFull ? 'ghost' : 'secondary'} size={showFull ? 'sm' : undefined} title={t('module.summary.onlyToday')} icon={<Clock3 size={16} color={colors.primary} />} onPress={() => finish('summary')} />
              {!showFull ? <Text variant="caption" tone="secondary" center>{t('module.summary.onlyTodayHint')}</Text> : null}
            </>
          ) : null}
        </View>
      ) : null}
    </Card>
  );

  const finishedView = finished ? (
    <View style={{ alignItems: 'center', gap: space[2], paddingVertical: space[4] }} accessibilityLiveRegion="polite">
      <CheckCircle2 size={56} color={colors.success} />
      <Text variant="h3">{finished === 'summary' ? t('module.summary.done') : t('module.completed')}</Text>
      <Text variant="bodySmall" tone="secondary" center>{t('module.completedBody', { n: finished === 'summary' ? SUMMARY_MINUTES : Math.max(practiceMinutes, 1) })}</Text>
    </View>
  ) : null;

  const footer = finished || !showFull ? undefined : (
    <View style={{ gap: space[1] }}>
      <Button title={t('module.complete')} onPress={() => finish('full')} />
      <Text variant="caption" tone="secondary" center>{t('module.completeHint')}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: mod.title[locale] }} />
      <Screen scroll={false} padded={false} contentStyle={{ flex: 1, paddingBottom: 0 }} footer={footer}>
        <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={250} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space[4], paddingBottom: space[6], gap: space[4] }}>
          {summaryCard}
          {finished === 'summary' ? finishedView : null}

          {showFull ? (
            <>
              {resumeBanner != null && !finished ? (
                <Banner
                  tone="info"
                  title={t('module.resume.title')}
                  body={t('module.resume.body', { i: resumeBanner + 1, heading: mod.sections[resumeBanner].heading[locale] })}
                  primary={{ title: t('module.resume.go'), onPress: () => { scrollToSection(resumeBanner); setResumeBanner(null); } }}
                  secondary={{ title: t('module.resume.restart'), onPress: () => { clearProgress(mod.id); setResumeBanner(null); scrollRef.current?.scrollTo({ y: 0, animated: true }); } }}
                />
              ) : null}
              <Text variant="h1" accessibilityRole="header">{mod.title[locale]}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
                <Chip label={t('mind.module.minutes', { n: unitMinutes })} />
              </View>
              <Text variant="body" tone="secondary">{mod.intro[locale]}</Text>

              {mod.sections.map((s, i) => {
                const inner = s.kind === 'warning' ? <Banner tone="warning" title={s.heading[locale]} body={s.body[locale]} />
                  : s.kind === 'tip' ? (
                    <Card variant="tinted" overline={t('module.kind.tip')} title={s.heading[locale]}>
                      <MarkdownLite text={s.body[locale]} />
                    </Card>
                  ) : (
                    <View style={{ gap: space[2] }}>
                      {s.kind === 'exercise' ? <Text variant="overline" tone="primary">{t('module.kind.exercise')}</Text> : null}
                      <Text variant="h2" accessibilityRole="header">{s.heading[locale]}</Text>
                      <MarkdownLite text={s.body[locale]} />
                    </View>
                  );
                return <View key={i} onLayout={onSectionLayout(i)}>{inner}</View>;
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
              {finished === 'full' ? finishedView : null}
            </>
          ) : null}
          <View style={{ paddingHorizontal: space[1], borderRadius: radius.md }}><Disclaimer textKey="disclaimer.short" /></View>
        </ScrollView>
        {sheet}
      </Screen>
    </>
  );
}
