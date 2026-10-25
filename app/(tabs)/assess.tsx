import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldAlert, ClipboardList, Activity, Ear, HeartPulse, Brain, Moon, Stethoscope, Headphones, AudioWaveform, Volume2, Timer, Gauge as GaugeIcon,
  Lock, ChevronRight, CircleCheck, ArrowRight, CalendarCheck,
} from 'lucide-react-native';
import { Screen, Text, Card, Button, EvidenceChip, Row, useCitation } from '@/components';
import { JourneyCard, TabHeader } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical, mergedLatest } from '@/store/clinical';
import { QUESTIONNAIRES, type QuestionnaireId } from '@/clinical/questionnaires';
import type { Assessment } from '@/clinical/types';

type Evidence = 'guideline' | 'rct' | 'expert';
interface Module { key: string; route: string; minutes: number; items?: number; evidence: Evidence; citation: string; icon: React.ComponentType<{ size?: number; color?: string }>; lastDone: (a: Assessment[]) => string | null; /** i18n key of a sub-line (e.g. "full form only if positive"). */ note?: string; noteParams?: Record<string, string | number> }

/** Base items of the case history (app/assess/history.tsx `BASE_ITEMS`: 11, plus up to 3 conditional follow-ups), as the journey shows it. */
const HISTORY_BASE_ITEMS = 11;

const REFRESH_DAYS = 28;
const DAY = 24 * 60 * 60 * 1000;

function daysSince(iso: string) { return Math.floor((Date.now() - new Date(iso).getTime()) / DAY); }

function lastWith(assessments: Assessment[], pred: (a: Assessment) => string | null | undefined): string | null {
  for (let i = assessments.length - 1; i >= 0; i--) { const d = pred(assessments[i]); if (d) return d; }
  return null;
}

const qDate = (id: QuestionnaireId) => (as: Assessment[]) => lastWith(as, (a) => a.questionnaires.find((q) => q.id === id)?.date);

const MODULES: { section: string; items: Module[] }[] = [
  {
    section: 'assess.section.required',
    items: [
      { key: 'triage', route: '/assess/triage', minutes: 2, items: 12, evidence: 'guideline', citation: 'nice2020', icon: ShieldAlert, lastDone: (as) => lastWith(as, (a) => (a.redFlags ? a.date : null)) },
      { key: 'history', route: '/assess/history', minutes: 2, items: HISTORY_BASE_ITEMS, evidence: 'guideline', citation: 'cima2019', icon: ClipboardList, lastDone: (as) => lastWith(as, (a) => (a.history ? a.date : null)), note: 'assess.tab.conditional', noteParams: { n: 3 } },
    ],
  },
  {
    section: 'assess.section.questionnaires',
    items: [
      { key: 'THI', route: '/assess/questionnaire/THI', minutes: QUESTIONNAIRES.THI.minutes, items: QUESTIONNAIRES.THI.items.length, evidence: QUESTIONNAIRES.THI.evidence, citation: QUESTIONNAIRES.THI.citation, icon: Activity, lastDone: qDate('THI') },
      // Same inventory as the journey (sprint 3 E10): the 2-item screens; the full HQ-14 / SCI-8 open only when positive.
      { key: 'THS', route: '/assess/questionnaire/THS', minutes: QUESTIONNAIRES.THS.minutes, items: QUESTIONNAIRES.THS.items.length, evidence: QUESTIONNAIRES.THS.evidence, citation: QUESTIONNAIRES.THS.citation, icon: Ear, lastDone: (as) => qDate('THS')(as) ?? qDate('HQ')(as), note: 'assess.tab.fullIfPositive', noteParams: { name: 'HQ-14', n: QUESTIONNAIRES.HQ.items.length } },
      { key: 'PHQ9', route: '/assess/questionnaire/PHQ9', minutes: QUESTIONNAIRES.PHQ9.minutes, items: QUESTIONNAIRES.PHQ9.items.length, evidence: QUESTIONNAIRES.PHQ9.evidence, citation: QUESTIONNAIRES.PHQ9.citation, icon: HeartPulse, lastDone: qDate('PHQ9') },
      { key: 'GAD7', route: '/assess/questionnaire/GAD7', minutes: QUESTIONNAIRES.GAD7.minutes, items: QUESTIONNAIRES.GAD7.items.length, evidence: QUESTIONNAIRES.GAD7.evidence, citation: QUESTIONNAIRES.GAD7.citation, icon: Brain, lastDone: qDate('GAD7') },
      { key: 'SCI02', route: '/assess/questionnaire/SCI02', minutes: QUESTIONNAIRES.SCI02.minutes, items: QUESTIONNAIRES.SCI02.items.length, evidence: QUESTIONNAIRES.SCI02.evidence, citation: QUESTIONNAIRES.SCI02.citation, icon: Moon, lastDone: (as) => qDate('SCI02')(as) ?? qDate('SCI')(as), note: 'assess.tab.fullIfPositive', noteParams: { name: 'SCI-8', n: QUESTIONNAIRES.SCI.items.length } },
      { key: 'RASST', route: '/assess/questionnaire/RASST', minutes: QUESTIONNAIRES.RASST.minutes, items: QUESTIONNAIRES.RASST.items.length, evidence: QUESTIONNAIRES.RASST.evidence, citation: QUESTIONNAIRES.RASST.citation, icon: Stethoscope, lastDone: qDate('RASST') },
    ],
  },
  {
    section: 'assess.section.measure',
    items: [
      { key: 'causes', route: '/assess/causes', minutes: 2, evidence: 'guideline', citation: 'adams2026', icon: Stethoscope, lastDone: (as) => lastWith(as, (a) => (a.causeAnswers ? a.date : null)) },
      { key: 'exam', route: '/assess/exam', minutes: 8, evidence: 'expert', citation: 'chen2021', icon: Activity, lastDone: (as) => lastWith(as, (a) => a.exam?.date) },
      { key: 'hearing', route: '/assess/hearing', minutes: 4, evidence: 'rct', citation: 'chen2021', icon: Headphones, lastDone: (as) => lastWith(as, (a) => a.hearing?.date) },
      { key: 'pitch', route: '/assess/pitch', minutes: 3, evidence: 'rct', citation: 'vielsmeier2020', icon: AudioWaveform, lastDone: (as) => lastWith(as, (a) => (a.psycho?.pitchHz != null ? a.psycho.date : null)) },
      { key: 'loudness', route: '/assess/loudness', minutes: 2, evidence: 'rct', citation: 'wunderlich2015', icon: Volume2, lastDone: (as) => lastWith(as, (a) => (a.psycho?.loudnessDbSl != null ? a.psycho.date : null)) },
      { key: 'mml', route: '/assess/mml', minutes: 2, evidence: 'guideline', citation: 'tunkel2014', icon: GaugeIcon, lastDone: (as) => lastWith(as, (a) => (a.psycho?.mmlDb != null ? a.psycho.date : null)) },
      { key: 'ri', route: '/assess/ri', minutes: 3, evidence: 'rct', citation: 'sendesen2024', icon: Timer, lastDone: (as) => lastWith(as, (a) => (a.psycho?.riCategory != null || a.psycho?.residualInhibitionSec != null ? a.psycho.date : null)) },
    ],
  },
];

export default function AssessScreen() {
  const t = useT();
  const router = useRouter();
  const { colors, space, radius } = useTheme();
  const assessments = useClinical((s) => s.assessments);
  const program = useClinical((s) => s.program);
  const { open, sheet } = useCitation();

  const merged = useMemo(() => mergedLatest(assessments), [assessments]);
  const triageDone = !!merged?.redFlags;
  const canSeeResults = !!merged && (!!merged.redFlags || merged.questionnaires.some((q) => q.id === 'THI'));

  const statusOf = (m: Module): { text: string; tone: 'secondary' | 'success' | 'warning'; done: boolean } => {
    const d = m.lastDone(assessments);
    if (!d) return { text: t('assess.status.notDone'), tone: 'secondary', done: false };
    const n = daysSince(d);
    if (n >= REFRESH_DAYS) return { text: t('assess.status.refresh', { n }), tone: 'warning', done: true };
    if (n <= 0) return { text: t('assess.status.today'), tone: 'success', done: true };
    return { text: t('assess.status.daysAgo', { n }), tone: 'success', done: true };
  };

  return (
    <Screen tab>
      <TabHeader title={t('assess.title')} />
      <Text variant="body" tone="secondary">{t('assess.intro')}</Text>

      {program ? (
        <Card>
          <Row icon={<CalendarCheck size={20} color={colors.primary} />} title={t('assess.program.row')} subtitle={t('assess.program.rowSub')} onPress={() => router.push('/program')} />
        </Card>
      ) : null}
      <JourneyCard />
      {canSeeResults ? (
        <Button title={t('assess.seeResults')} onPress={() => router.push('/assess/results')} icon={<ArrowRight size={18} color={colors.onPrimary} />} />
      ) : null}

      {MODULES.map((section) => (
        <View key={section.section} style={{ gap: space[3] }}>
          <Text variant="h2">{t(section.section)}</Text>
          {section.items.map((m) => {
            const status = statusOf(m);
            const locked = !triageDone && m.key !== 'triage';
            const Icon = m.icon;
            // THS / SCI02 names and descriptions live in core.ts (assess.tab.*); the rest in assess.ts (assess.module.*).
            const nameKey = m.key === 'THS' || m.key === 'SCI02' ? `assess.tab.module.${m.key}` : `assess.module.${m.key}`;
            const name = t(nameKey);
            return (
              <Card
                key={m.key}
                onPress={() => router.push(locked ? '/assess/triage' : m.route)}
                accessibilityLabel={t('assess.a11y.module', { name, status: locked ? t('assess.lockHint') : status.text, min: m.minutes })}
              >
                <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
                  <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: space[1] }}>
                    <Text variant="h3">{name}</Text>
                    <Text variant="bodySmall" tone="secondary">{t(`${nameKey}.desc`)}</Text>
                    {m.note ? <Text variant="caption" tone="secondary">{t(m.note, m.noteParams)}</Text> : null}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2], marginTop: space[1] }}>
                      <Text variant="caption" tone="muted">{t('common.minutes', { n: m.minutes })}{m.items ? ` · ${t('assess.items', { n: m.items })}` : ''}</Text>
                      <EvidenceChip level={m.evidence} onPress={() => open(m.citation)} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
                      {locked ? <Lock size={14} color={colors.textMuted} /> : status.done ? <CircleCheck size={14} color={colors[status.tone === 'warning' ? 'warning' : 'success']} /> : null}
                      <Text variant="caption" tone={locked ? 'muted' : status.tone}>{locked ? t('assess.lockHint') : status.text}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} />
                </View>
              </Card>
            );
          })}
        </View>
      ))}
      {sheet}
    </Screen>
  );
}
