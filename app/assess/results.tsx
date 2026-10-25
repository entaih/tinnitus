import React, { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share2, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { Screen, Text, Card, Button, Chip, EvidenceChip, Banner, Disclaimer, useCitation } from '@/components';
import { Gauge, useInfoSheet, ReferralList, CauseList, DiagnosisCard } from '@/components/assess';
import { diagnose, diagnosisStatement } from '@/clinical/diagnosis';
import { programGate } from '@/components/assess/programGate';
import { CheckRow, Collapsible, GlossaryTerm, useGlossary } from '@/components/home';
import { useTheme } from '@/theme';
import { rankCauses, confirmatoryTests } from '@/clinical/causes';
import { computeTriage } from '@/clinical/engine';
import { assessmentPrefs, generateProgram, type ProgramPrefs } from '@/clinical/program';
import { consequenceText, profileConsequences } from '@/clinical/consequences';
import { useLocale, useT, formatDate } from '@/i18n';
import { useProfile } from '@/hooks/useProfile';
import { useClinical } from '@/store/clinical';
import { QUESTIONNAIRES, scoreQuestionnaire } from '@/clinical/questionnaires';
import { audioReportLines } from '@/clinical/reportAudio';
import type { Assessment, RedFlags } from '@/clinical/types';
import { fmtHz } from '@/utils/format';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const FLAG_KEYS: (keyof RedFlags)[] = ['suddenHearingLoss', 'rapidWorsening', 'unilateralSymptoms', 'pulsatile', 'pulsatileHeadacheVisual', 'pulsatileNewUnilateral', 'vertigo', 'neuroSigns', 'otorrhoeaOrPain', 'objectiveSound', 'headTrauma', 'menierePattern', 'newOtotoxicDrug', 'selfHarm'];

/**
 * Layered results page: gauge + one-line meaning + triage (layer 1, sticky "Programı başlat" footer),
 * programme card and suggested path (layer 2), collapsed accordions for causes / profile / doctor summary / comparison (layer 3).
 */
export default function ResultsScreen() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { colors, space } = useTheme();
  const { assessment, profile } = useProfile();
  const assessments = useClinical((s) => s.assessments);
  const program = useClinical((s) => s.program);
  const setProgram = useClinical((s) => s.setProgram);
  const setProgramPrefs = useClinical((s) => s.setProgramPrefs);
  const { open, sheet } = useCitation();
  const info = useInfoSheet();
  const glossary = useGlossary();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [acked, setAcked] = useState(false);

  const tier = assessment ? computeTriage(assessment).tier : null;
  const gate = programGate(profile, tier);
  const canStart = !gate.blocked && (!gate.needsAck || acked);

  /** Default preferences (15 min a day, CBT); setup lets the user change duration and style. */
  const prefs = useMemo<ProgramPrefs>(() => ({ minutesPerDay: 15, style: 'cbt', ...assessmentPrefs(assessment) }), [assessment]);
  /** Arm and length of the programme that "Programı başlat" would create (or the stored one). */
  const plan = useMemo(() => {
    if (program) return { arm: program.arm, weeks: program.weeks.length, min: 15 };
    if (!profile) return null;
    const p = generateProgram(profile, prefs);
    return { arm: p.arm, weeks: p.weeks.length, min: prefs.minutesPerDay };
  }, [program, profile, prefs]);
  const determinants = useMemo(() => profileConsequences(assessment ?? null, 5), [assessment]);

  const startProgram = () => {
    if (!profile || !canStart) return;
    setProgramPrefs(prefs);
    setProgram(generateProgram(profile, prefs));
    router.replace('/(tabs)');
  };

  const thi = useMemo(() => {
    const r = assessment?.questionnaires.find((q) => q.id === 'THI');
    return r ? { ...r, ...scoreQuestionnaire(QUESTIONNAIRES.THI, r.answers) } : null;
  }, [assessment]);

  /** All THI results in chronological order, for the compare row. */
  const thiHistory = useMemo(() => {
    const list = assessments.flatMap((a) => a.questionnaires.filter((q) => q.id === 'THI'));
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [assessments]);

  const summary = useMemo(() => (assessment ? buildSummary(assessment, t, locale) : []), [assessment, t, locale]);
  const ranked = useMemo(() => (assessment ? rankCauses(assessment) : []), [assessment]);

  if (!assessment || !profile) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('results.title') }} />
        <Card>
          <Text variant="h2">{t('results.empty.title')}</Text>
          <Text variant="body" tone="secondary">{t('results.empty.body')}</Text>
          <Button title={t('results.empty.cta')} onPress={() => router.replace('/(tabs)/assess')} />
        </Card>
        <Disclaimer />
      </Screen>
    );
  }

  const shareText = async () => {
    const message = `${t('results.pdf.title')}\n\n${summary.map((l) => `• ${l}`).join('\n')}\n\n${t('results.pdf.disclaimer')}`;
    try { await Share.share({ message, title: t('results.doctor.shareTitle') }); } catch { /* user dismissed */ }
  };

  const sharePdf = async () => {
    setPdfBusy(true); setPdfError(false);
    try {
      const html = buildHtml({
        title: t('results.pdf.title'),
        dateLabel: t('results.pdf.date'),
        date: formatDate(new Date().toISOString(), locale, { day: 'numeric', month: 'long', year: 'numeric' }),
        lines: summary,
        recs: profile.recommendations.map((r) => t(r.key)),
        recsTitle: t('results.path.title'),
        summaryTitle: t('results.doctor.title'),
        disclaimer: t('results.pdf.disclaimer'),
        accent: colors.primaryPressed,
        ink: colors.text,
        muted: colors.textSecondary,
        line: colors.border,
        soft: colors.skeleton,
      });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: t('results.doctor.shareTitle') });
      } else {
        await Share.share({ url: uri, title: t('results.doctor.shareTitle'), message: uri });
      }
    } catch {
      setPdfError(true);
    } finally {
      setPdfBusy(false);
    }
  };

  const selfcare = profile.triage === 'selfcare';
  const triageTone = profile.triage === 'urgent' ? 'danger' : 'warning';
  const prev = thiHistory.length >= 2 ? thiHistory[thiHistory.length - 2] : null;
  const curr = thiHistory.length >= 2 ? thiHistory[thiHistory.length - 1] : null;
  const delta = prev && curr ? curr.total - prev.total : 0;
  const needsMore = !assessment.causeAnswers || !assessment.exam;
  const tests = confirmatoryTests(ranked, 3);
  const topCause = ranked.find((r) => r.tier === 'mechanism') ?? ranked[0];
  const profileSummary = [...profile.subtypes.map((k) => t(k)), ...profile.drivers.map((d) => t(`driver.${d}`))].slice(0, 2).join(' · ');

  const footer = program ? (
    <Button title={t('results.program.goToday')} icon={<ArrowRight size={18} color={colors.onPrimary} />} onPress={() => router.replace('/(tabs)')} />
  ) : (
    <View style={{ gap: space[1] }}>
      {gate.needsAck ? <CheckRow checked={acked} label={t('results.program.ack')} hint={acked ? undefined : t('setup.ack.hint')} onToggle={() => setAcked((v) => !v)} /> : null}
      <Button title={t('results.program.start')} icon={<ArrowRight size={18} color={canStart ? colors.onPrimary : colors.textMuted} />} onPress={startProgram} disabled={!canStart} />
      {gate.blocked ? <Text variant="caption" tone="danger">{t('results.program.blocked')}</Text> : null}
    </View>
  );

  return (
    <Screen footer={footer}>
      <Stack.Screen options={{ title: t('results.title') }} />

      {/* Layer 1 — score shown once, one-line meaning, triage line */}
      <Card style={{ alignItems: 'center', gap: space[3] }}>
        {thi ? (
          <>
            <Gauge
              value={thi.total}
              band={thi.band}
              label={`${thi.total}`}
              accessibilityLabel={t('results.gauge.a11y', { band: t(`severity.${thi.band}`), score: thi.total })}
            />
            <Text variant="caption" tone="secondary" center style={{ marginTop: -space[2] }}>
              {t('results.gauge.caption', { band: t(`severity.${thi.band}`) })} · <GlossaryTerm id="thi" variant="caption" tone="primary" open={glossary.open} />
            </Text>
            <Text variant="body" center>{t(thi.key)}</Text>
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: space[2] }}>
            <Text variant="h3">{t('results.hero.noThi')}</Text>
            <Text variant="bodySmall" tone="secondary" center>{t('results.hero.noThi.body')}</Text>
            <Button variant="secondary" size="sm" title={t('results.hero.takeThi')} onPress={() => router.push('/assess/questionnaire/THI')} />
          </View>
        )}
        {selfcare ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[3] }}>
            <CheckCircle2 size={20} color={colors.success} />
            <Text variant="bodySmall" tone="success" style={{ flex: 1 }}>{t('results.triage.selfcare')}</Text>
          </View>
        ) : null}
      </Card>

      {/* Layer 1 — decisive preliminary diagnosis directly under the gauge (PM sprint 2 A2) */}
      <DiagnosisCard d={diagnose(assessment)} assessment={assessment} profile={profile} />

      {!selfcare ? (
        <>
          <Banner tone={triageTone} title={t(`results.triage.${profile.triage}`)} body={t('results.triage.whoBelow')} />
          <Card variant="tinted" title={t('triage.result.whoToSee')}>
            <ReferralList reasons={profile.triageReasons} />
            <Text variant="caption" tone="secondary">{t('results.terms')}: <GlossaryTerm id="referral" variant="caption" tone="primary" open={glossary.open} /></Text>
          </Card>
        </>
      ) : null}

      {/* Layer 2 — programme: arm + length + daily minutes, then what each score changed (consequences.ts) */}
      <Card variant="tinted" title={t('results.program.determinants')}>
        {plan ? <Text variant="bodyStrong">{t('results.program.plan', { arm: t(`setup.overview.arm.${plan.arm}`), n: plan.weeks, min: plan.min })}</Text> : null}
        {determinants.map((c) => (
          <View key={c.key} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 8, backgroundColor: c.tone === 'danger' ? colors.danger : c.tone === 'warning' ? colors.warning : c.tone === 'success' ? colors.success : colors.primary }} />
            <Text variant="body" style={{ flex: 1 }}>{consequenceText(t, c)}</Text>
          </View>
        ))}
        {gate.reasonKey && !program ? <Text variant="bodySmall" tone={gate.blocked ? 'danger' : 'warning'}>{t(gate.reasonKey)}</Text> : null}
        <Button variant="ghost" size="sm" title={t('results.program.customize')} onPress={() => router.push('/program/setup')} />
      </Card>

      <Card title={t('results.path.title')} right={<Sparkles size={20} color={colors.primary} />}>
        {profile.recommendations.map((r, i) => (
          <View key={`${r.key}-${i}`} style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start', borderTopWidth: i ? 1 : 0, borderTopColor: colors.border, paddingTop: i ? space[3] : 0 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: r.priority === 1 ? colors.primary : colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <Text variant="caption" style={{ color: r.priority === 1 ? colors.onPrimary : colors.primary }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: space[1] }}>
              <Text variant="body">{t(r.key)}</Text>
              <EvidenceChip level={r.evidence} onPress={() => open(r.citation)} />
            </View>
          </View>
        ))}
      </Card>

      {/* Layer 3 — collapsed accordions */}
      <Collapsible title={t('causes.result.title')} summary={topCause ? t('results.acc.causes.summary', { name: t(`cause.${topCause.id}.name`) }) : t('results.acc.causes.empty')}>
        <Text variant="bodySmall" tone="secondary">{t('causes.result.body')}</Text>
        {needsMore ? (
          <Banner tone="info" title={t('causes.result.moreData')} primary={{ title: t('causes.result.moreData.action'), onPress: () => router.push(!assessment.causeAnswers ? '/assess/causes' : '/assess/exam') }} />
        ) : null}
        <CauseList ranked={ranked} />
        {tests.length ? (
          <View style={{ gap: space[1] }}>
            <Text variant="h3">{t('causes.result.tests')}</Text>
            {tests.map((k) => (
              <View key={k} style={{ flexDirection: 'row', gap: space[2] }}>
                <Text variant="body" tone="secondary">·</Text>
                <Text variant="body" style={{ flex: 1 }}>{t(k)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Collapsible>

      {profile.subtypes.length || profile.drivers.length ? (
        <Collapsible title={t('results.profile.title')} summary={profileSummary}>
          <Text variant="caption" tone="secondary">{t('results.profile.hint')}</Text>
          {profile.subtypes.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
              {profile.subtypes.map((k) => (
                <Chip key={k} tone="primary" label={t(k)} onPress={() => info.open(t(k), t(`${k}.info`))} />
              ))}
            </View>
          ) : null}
          {profile.drivers.length ? (
            <View style={{ gap: space[2] }}>
              <Text variant="caption" tone="secondary">{t('results.drivers.title')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {profile.drivers.map((d) => (
                  <Chip key={d} tone="accent" label={t(`driver.${d}`)} onPress={() => info.open(t(`driver.${d}`), t(`driver.${d}.info`))} />
                ))}
              </View>
            </View>
          ) : null}
        </Collapsible>
      ) : null}

      <Collapsible title={t('results.doctor.title')} summary={t('results.acc.doctor.summary', { n: summary.length })}>
        <View style={{ gap: space[1] }}>
          {summary.map((line, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space[2] }}>
              <Text variant="bodySmall" tone="muted">·</Text>
              <Text variant="bodySmall" style={{ flex: 1 }}>{line}</Text>
            </View>
          ))}
        </View>
        <Text variant="caption" tone="secondary">
          {t('results.terms')}: <GlossaryTerm id="thi" variant="caption" tone="primary" open={glossary.open} /> · <GlossaryTerm id="ri" variant="caption" tone="primary" open={glossary.open} /> · <GlossaryTerm id="pitch" variant="caption" tone="primary" open={glossary.open} /> · <GlossaryTerm id="referral" variant="caption" tone="primary" open={glossary.open} />
        </Text>
        {pdfError ? <Text variant="caption" tone="danger">{t('results.doctor.pdfError')}</Text> : null}
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" size="sm" title={t('results.doctor.copy')} icon={<Share2 size={16} color={colors.primaryPressed} />} onPress={() => { void shareText(); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" size="sm" title={t('results.doctor.pdf')} loading={pdfBusy} icon={<FileText size={16} color={colors.primaryPressed} />} onPress={() => { void sharePdf(); }} />
          </View>
        </View>
      </Collapsible>

      {prev && curr ? (
        <Collapsible title={t('results.compare.title')} summary={t('results.acc.compare.summary', { prev: prev.total, curr: curr.total })} variant="tinted">
          <Text variant="body">{t('results.compare.body', { prev: prev.total, curr: curr.total, date: formatDate(prev.date, locale) })}</Text>
          <Text variant="bodySmall" tone={delta <= -7 ? 'success' : delta >= 7 ? 'warning' : 'secondary'}>
            {delta <= -7 ? t('results.compare.better') : delta >= 7 ? t('results.compare.worse') : t('results.compare.same')}
          </Text>
        </Collapsible>
      ) : null}

      <Disclaimer />
      {sheet}
      {info.sheet}
      {glossary.sheet}
    </Screen>
  );
}

/** Plain-language summary lines from the merged assessment. */
function buildSummary(a: Assessment, t: (k: string, p?: Record<string, string | number>) => string, locale: 'tr' | 'en'): string[] {
  const lines: string[] = [];
  const h = a.history;
  if (h) {
    lines.push(t('results.summary.duration', { v: t(`history.onset.${h.onset}`) }));
    lines.push(t('results.summary.side', { v: t(`history.side.${h.side}`) }));
    lines.push(t('results.summary.character', { v: t(`history.character.${h.character}`) }));
    lines.push(t('results.summary.pattern', { v: t(`history.pattern.${h.pattern}`) }));
  }
  const get = (id: keyof typeof QUESTIONNAIRES) => {
    const r = a.questionnaires.find((q) => q.id === id);
    return r ? scoreQuestionnaire(QUESTIONNAIRES[id], r.answers) : null;
  };
  const dx = diagnose(a);
  lines.push(t('results.summary.dx', { v: diagnosisStatement(dx, t) }));
  if (dx.secondary.length) lines.push(t('results.summary.dxSecondary', { v: dx.secondary.map((e) => `${t(`cause.${e.id}.name`)} (${e.icd}, ${t(`dx.certainty.${e.certainty}`)})`).join(', ') }));
  if (dx.differentials.length) lines.push(t('results.summary.dxDifferential', { v: dx.differentials.map((e) => `${t(`cause.${e.id}.name`)} (${e.icd})`).join(', ') }));
  if (dx.comorbid.length) lines.push(t('results.summary.dxComorbid', { v: dx.comorbid.map((c) => `${t(c.key)} (${c.icd})`).join(', ') }));
  const tri = computeTriage(a);
  lines.push(t('results.summary.triage', { tier: tri.tier, v: tri.reasons.map((r) => t(r)).join(', ') }));
  if (h?.age) lines.push(t('results.summary.age', { v: h.age }));
  if (h?.priorAudiometry != null) lines.push(h.priorAudiometry ? t('results.summary.priorAudiometry.yes') : t('results.summary.priorAudiometry.no'));
  const thi = get('THI');
  if (thi) lines.push(t('results.summary.thi', { total: thi.total, band: t(`severity.${thi.band}`) }));
  const hq = get('HQ'); if (hq) lines.push(t('results.summary.hq', { total: hq.total }));
  const phqRaw = a.questionnaires.find((x) => x.id === 'PHQ9');
  const phq = get('PHQ9'); if (phq) lines.push(t('results.summary.phq', { total: phq.total, item9: phqRaw?.answers[8] ?? 0 }));
  const gad = get('GAD7'); if (gad) lines.push(t('results.summary.gad', { total: gad.total }));
  const sci = get('SCI'); if (sci) lines.push(t('results.summary.sci', { total: sci.total }));
  // Short baseline screens are reported as screens, never as the full scales.
  const sci02 = get('SCI02'); if (sci02) lines.push(t('results.summary.sci02', { total: sci02.total }));
  const ths = get('THS'); if (ths) lines.push(t('results.summary.ths', { total: ths.total, c1: a.questionnaires.find((x) => x.id === 'THS')?.answers[0] ?? 0 }));
  const rasst = get('RASST'); if (rasst) lines.push(t('results.summary.rasst', { total: rasst.total }));
  if (h?.sleepProblem) lines.push(t('results.summary.sleep'));
  if (h?.osaSnoring && h?.osaSleepiness) lines.push(t('results.summary.osa'));
  if (h?.misophoniaScreen) lines.push(t('results.summary.misophonia'));
  // Hearing screen, psychoacoustics and phone-test records with units, methods and caveats (audiology review).
  lines.push(...audioReportLines(a, t));
  if (a.redFlags) {
    const flags = FLAG_KEYS.filter((k) => a.redFlags?.[k]).map((k) => t(`results.flag.${k}`));
    lines.push(flags.length ? t('results.summary.flags', { v: flags.join(', ') }) : t('results.summary.noFlags'));
  }
  const all = rankCauses(a);
  const excl = all.filter((r) => r.tier === 'exclude');
  if (excl.length) lines.push(t('results.summary.exclude', { v: excl.map((r) => t(`cause.${r.id}.name`)).join(', ') }));
  const mech = all.filter((r) => r.tier === 'mechanism').slice(0, 3).filter((r, i) => i === 0 || r.pct >= 8);
  if (mech.length) lines.push(t('results.summary.causes', { v: mech.map((r) => `${t(`cause.${r.id}.name`)} (${t(`causes.confidence.${r.confidence}`)})`).join(', ') }));
  const tests = confirmatoryTests(rankCauses(a), 3);
  if (tests.length) lines.push(t('results.summary.tests', { v: tests.map((k) => t(k)).join(', ') }));
  if (!lines.length) lines.push(locale === 'tr' ? 'Henüz kayıt yok.' : 'Nothing recorded yet.');
  return lines;
}

function buildHtml(p: { title: string; dateLabel: string; date: string; lines: string[]; recs: string[]; recsTitle: string; summaryTitle: string; disclaimer: string; accent: string; ink: string; muted: string; line: string; soft: string }) {
  const li = (s: string) => `<li>${escapeHtml(s)}</li>`;
  return `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: ${escapeHtml(p.ink)}; padding: 32px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; color: ${escapeHtml(p.accent)}; }
  h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid ${escapeHtml(p.line)}; padding-bottom: 4px; }
  .meta { color: ${escapeHtml(p.muted)}; font-size: 13px; }
  ul { padding-left: 20px; } li { margin: 4px 0; font-size: 14px; }
  .disc { margin-top: 32px; font-size: 12px; color: ${escapeHtml(p.muted)}; background: ${escapeHtml(p.soft)}; padding: 12px; border-radius: 8px; }
</style></head><body>
<h1>${escapeHtml(p.title)}</h1>
<div class="meta">${escapeHtml(p.dateLabel)}: ${escapeHtml(p.date)}</div>
<h2>${escapeHtml(p.summaryTitle)}</h2>
<ul>${p.lines.map(li).join('')}</ul>
<h2>${escapeHtml(p.recsTitle)}</h2>
<ul>${p.recs.map(li).join('')}</ul>
<div class="disc">${escapeHtml(p.disclaimer)}</div>
</body></html>`;
}
