import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Share2, TrendingUp } from 'lucide-react-native';
import { Button, Card, Screen, Text } from '@/components';
import { Segmented, TabHeader } from '@/components/home';
import { BarChart, ChartCard, LineChart, movingAverage, type Bar, type Band } from '@/components/progress';
import { useTheme, type SeverityBand } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { dayCompletion, programPosition } from '@/clinical/program';
import { THI } from '@/clinical/questionnaires';
import type { QuestionnaireResult } from '@/clinical/types';
import { exportCsv, hasExportableData } from '@/utils/exportCsv';

type Range = '4w' | '3m' | '1y';
const RANGE_DAYS: Record<Range, number> = { '4w': 28, '3m': 91, '1y': 365 };
const DAY = 86_400_000;
const THI_BANDS: { band: SeverityBand; from: number; to: number }[] = [
  { band: 'none', from: 0, to: 17 }, { band: 'mild', from: 17, to: 37 }, { band: 'moderate', from: 37, to: 57 }, { band: 'severe', from: 57, to: 77 }, { band: 'catastrophic', from: 77, to: 100 },
];

export default function ProgressScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { diary, assessments, program, sessions } = useClinical();
  const [range, setRange] = useState<Range>('4w');
  const [exporting, setExporting] = useState(false);

  const now = Date.now();
  const cutoff = now - RANGE_DAYS[range] * DAY;
  const cutoffKey = new Date(cutoff).toISOString().slice(0, 10);
  const mcid = THI.mcid ?? 7;

  // --- THI ---
  const thiAll = useMemo(() => {
    const all: QuestionnaireResult[] = [];
    for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'THI') all.push(q);
    return all.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments]);
  const thi = thiAll.filter((q) => new Date(q.date).getTime() >= cutoff);
  const thiBands: Band[] = THI_BANDS.map((b) => ({ from: b.from, to: b.to, color: colors.severity[b.band].text, opacity: 0.08 }));
  let thiSummary = t('progress.thi.none');
  if (thi.length === 1) thiSummary = t('progress.thi.single', { a: thi[0].total });
  if (thi.length >= 2) {
    const a = thi[0].total, b = thi[thi.length - 1].total, diff = b - a;
    thiSummary = t('progress.thi.summary', {
      from: formatDate(thi[0].date, locale), a, b,
      dir: t(diff < 0 ? 'progress.dir.down' : diff > 0 ? 'progress.dir.up' : 'progress.dir.flat'),
      sig: t(Math.abs(diff) >= mcid ? 'progress.sig.yes' : 'progress.sig.no'),
    });
  }

  // --- Daily loudness / annoyance ---
  const entries = diary.filter((d) => d.date >= cutoffKey);
  const loudEntries = entries.filter((d) => d.loudness != null);
  const loud = loudEntries.map((d) => d.loudness as number);
  const ann = entries.map((d) => d.annoyance);
  const loudAvg = movingAverage(loud, 7);
  const annAvg = movingAverage(ann, 7);
  const xOf = (date: string) => new Date(date + 'T12:00:00').getTime();
  const mean = (v: number[]) => (v.length ? (v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : '—');
  const dailySummary = entries.length ? t('progress.daily.summary', { n: entries.length, l: mean(loud), a: mean(ann) }) : t('progress.daily.none');

  // --- Weekly adherence ---
  const adherenceBars: Bar[] = useMemo(() => {
    if (!program) return [];
    const pos = programPosition(program, new Date(now));
    const start = new Date(program.startDate + 'T00:00:00').getTime();
    const bars: Bar[] = [];
    for (let w = 1; w <= pos.week; w++) {
      const weekStart = start + (w - 1) * 7 * DAY;
      if (weekStart + 7 * DAY < cutoff) continue;
      let done = 0, total = 0;
      for (let d = 1; d <= 7; d++) {
        const idx = (w - 1) * 7 + (d - 1);
        if (idx > pos.dayIndex) break;
        const c = dayCompletion(program, w, d);
        done += c.done; total += c.total;
      }
      bars.push({ label: t('prog.weekShort', { n: w }), value: total ? Math.round((done / total) * 100) : 0, valueLabel: total ? `%${Math.round((done / total) * 100)}` : '' });
    }
    return bars;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, cutoff, locale]);
  const adherenceAvg = adherenceBars.length ? Math.round(adherenceBars.reduce((s, b) => s + b.value, 0) / adherenceBars.length) : 0;
  const adherenceSummary = adherenceBars.length ? t('progress.adherence.summary', { n: adherenceBars.length, p: adherenceAvg }) : t('progress.adherence.none');

  // --- Sleep ---
  const sleepSessions = sessions.filter((s) => s.type === 'sleep' && new Date(s.date).getTime() >= cutoff);
  const sleepBars: Bar[] = useMemo(() => {
    const byKey = new Map<string, number>();
    const weekly = sleepSessions.length > 14;
    for (const s of sleepSessions) {
      const d = new Date(s.date);
      const key = weekly ? new Date(d.getTime() - d.getDay() * DAY).toISOString().slice(0, 10) : s.date.slice(0, 10);
      byKey.set(key, (byKey.get(key) ?? 0) + s.minutes);
    }
    return Array.from(byKey.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ label: formatDate(k, locale, { day: 'numeric', month: 'short' }), value: v }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, cutoff, locale]);
  const effs = sleepSessions.map((s) => { try { const j = s.detail ? JSON.parse(s.detail) as { efficiency?: number } : null; return typeof j?.efficiency === 'number' ? j.efficiency : null; } catch { return null; } }).filter((x): x is number => x != null);
  const sleepSummary = sleepSessions.length
    ? t('progress.sleep.summary', { n: sleepSessions.length, m: Math.round(sleepSessions.reduce((s, x) => s + x.minutes, 0) / sleepSessions.length), eff: effs.length ? t('progress.sleep.eff', { e: Math.round(effs.reduce((s, x) => s + x, 0) / effs.length * (effs[0] <= 1 ? 100 : 1)) }) : '' })
    : t('progress.sleep.none');

  const isEmpty = diary.length === 0 && thiAll.length === 0 && !program && sessions.length === 0;

  const doExport = async () => {
    if (!hasExportableData({ diary, assessments })) { Alert.alert(t('progress.export.nothing')); return; }
    setExporting(true);
    try { await exportCsv({ diary, assessments }); } catch { Alert.alert(t('progress.export.fail')); } finally { setExporting(false); }
  };

  const xLabels = [{ value: cutoff, label: formatDate(new Date(cutoff).toISOString(), locale, { day: 'numeric', month: 'short' }) }, { value: now, label: t('common.today') }];

  return (
    <Screen tab>
      <TabHeader title={t('progress.title')} />
      {isEmpty ? (
        <Card>
          <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[4] }}>
            <View style={{ width: 72, height: 72, borderRadius: radius.full, backgroundColor: colors.primaryTrack, alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={32} color={colors.primary} /></View>
            <Text variant="h3" center>{t('progress.empty.title')}</Text>
            <Text variant="body" tone="secondary" center>{t('progress.empty.body')}</Text>
            <Button title={t('progress.empty.action')} onPress={() => router.push('/(tabs)/assess')} />
          </View>
        </Card>
      ) : (
        <>
          <Segmented<Range> options={[{ value: '4w', label: t('progress.range.4w') }, { value: '3m', label: t('progress.range.3m') }, { value: '1y', label: t('progress.range.1y') }]} value={range} onChange={setRange} />

          <ChartCard title={t('progress.thi')} summary={thiSummary} howToRead={t('progress.howToRead.thi')} footer={<Text variant="caption" tone="muted">{t('progress.thi.mcid')}</Text>}>
            <LineChart
              series={[{ points: thi.map((q) => ({ x: new Date(q.date).getTime(), y: q.total })), color: colors.chart.thi, width: 2.5 }]}
              xMin={cutoff} xMax={now} yMin={0} yMax={100} bands={thiBands}
              yLabels={[0, 25, 50, 75, 100].map((v) => ({ value: v, label: String(v) }))} xLabels={xLabels}
            />
          </ChartCard>

          <ChartCard
            title={t('progress.daily')} summary={dailySummary} howToRead={t('progress.howToRead.daily')}
            legend={[{ color: colors.chart.loudness, label: t('progress.daily.loudness') }, { color: colors.chart.annoyance, label: t('progress.daily.annoyance') }, { color: colors.textMuted, label: t('progress.daily.avg'), dashed: true }]}
          >
            <LineChart
              series={[
                { points: loudEntries.map((d, i) => ({ x: xOf(d.date), y: loud[i] })), color: colors.chart.loudness, width: 1.5, opacity: 0.6 },
                { points: entries.map((d, i) => ({ x: xOf(d.date), y: ann[i] })), color: colors.chart.annoyance, width: 1.5, opacity: 0.6 },
                { points: loudEntries.map((d, i) => ({ x: xOf(d.date), y: loudAvg[i] })), color: colors.chart.loudness, width: 3, dots: false },
                { points: entries.map((d, i) => ({ x: xOf(d.date), y: annAvg[i] })), color: colors.chart.annoyance, width: 3, dots: false },
              ]}
              xMin={cutoff} xMax={now} yMin={0} yMax={10}
              yLabels={[0, 5, 10].map((v) => ({ value: v, label: String(v) }))} xLabels={xLabels}
            />
          </ChartCard>

          <ChartCard title={t('progress.adherence')} summary={adherenceSummary} howToRead={t('progress.howToRead.adherence')}>
            <BarChart bars={adherenceBars} max={100} color={colors.primary} />
          </ChartCard>

          <ChartCard title={t('progress.sleep')} summary={sleepSummary} howToRead={t('progress.howToRead.sleep')}>
            <BarChart bars={sleepBars} max={Math.max(60, ...sleepBars.map((b) => b.value))} color={colors.chart.sleep} />
          </ChartCard>

          <Button variant="secondary" title={t('progress.export')} loading={exporting} icon={<Share2 size={18} color={colors.primaryPressed} />} onPress={() => { void doExport(); }} />
        </>
      )}
    </Screen>
  );
}
