import React, { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Share2, FileText, Sparkles, Stethoscope, ArrowRight, Info } from 'lucide-react-native';
import { Screen, Text, Card, Button, Chip, EvidenceChip, SeverityBadge, Banner, Disclaimer, useCitation } from '@/components';
import { Gauge, useInfoSheet } from '@/components/assess';
import { useTheme } from '@/theme';
import { ReferralList } from '@/components/assess';
import { generateProgram } from '@/clinical/program';
import { useLocale, useT, formatDate } from '@/i18n';
import { useProfile } from '@/hooks/useProfile';
import { useClinical } from '@/store/clinical';
import { QUESTIONNAIRES, scoreQuestionnaire } from '@/clinical/questionnaires';
import { pta4 } from '@/clinical/engine';
import type { Assessment, RedFlags } from '@/clinical/types';
import { fmtHz } from '@/utils/format';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const FLAG_KEYS: (keyof RedFlags)[] = ['suddenHearingLoss', 'unilateralSymptoms', 'pulsatile', 'vertigo', 'neuroSigns', 'otorrhoeaOrPain', 'headTrauma', 'selfHarm'];

export default function ResultsScreen() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { colors, space } = useTheme();
  const { assessment, profile } = useProfile();
  const assessments = useClinical((s) => s.assessments);
  const program = useClinical((s) => s.program);
  const setProgram = useClinical((s) => s.setProgram);
  const hardBlocked = !!profile && profile.triage === 'urgent' && (profile.triageReasons.includes('triage.selfHarm') || profile.triageReasons.includes('triage.neuro') || profile.triageReasons.includes('triage.vertigo') || profile.triageReasons.includes('triage.suddenHL'));
  const startProgram = () => {
    if (!profile) return;
    const ps = assessment?.psycho;
    setProgram(generateProgram(profile, { minutesPerDay: 30, style: 'cbt', pitchHz: ps?.pitchHz, riPositive: ps?.riCategory ? ps.riCategory !== 'none' : undefined, hearingDone: !!assessment?.hearing }));
    router.replace('/(tabs)');
  };
  const { open, sheet } = useCitation();
  const info = useInfoSheet();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(false);

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
        accent: colors.primary,
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

  const triageTone = profile.triage === 'urgent' ? 'danger' : profile.triage === 'audiology' ? 'warning' : 'success';
  const prev = thiHistory.length >= 2 ? thiHistory[thiHistory.length - 2] : null;
  const curr = thiHistory.length >= 2 ? thiHistory[thiHistory.length - 1] : null;
  const delta = prev && curr ? curr.total - prev.total : 0;

  return (
    <Screen>
      <Stack.Screen options={{ title: t('results.title') }} />

      {/* Hero */}
      <Card style={{ alignItems: 'center', gap: space[3] }}>
        {thi ? (
          <>
            <Gauge
              value={thi.total}
              band={thi.band}
              label={`${thi.total}`}
              caption="THI / 100"
              accessibilityLabel={t('results.gauge.a11y', { band: t(`severity.${thi.band}`), score: thi.total })}
            />
            <SeverityBadge band={thi.band} score={thi.total} source="THI" />
            <Text variant="bodySmall" tone="secondary" center>{t(thi.key)}</Text>
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: space[2] }}>
            <Text variant="h3">{t('results.hero.noThi')}</Text>
            <Text variant="bodySmall" tone="secondary" center>{t('results.hero.noThi.body')}</Text>
            <Button variant="secondary" size="sm" title={t('results.hero.takeThi')} onPress={() => router.push('/assess/questionnaire/THI')} />
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
          <Info size={16} color={colors.textMuted} style={{ marginTop: 3 }} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{t('results.framing')}</Text>
        </View>
      </Card>

      {/* Triage */}
      <Banner
        tone={triageTone}
        title={t(`results.triage.${profile.triage}`)}
        body={profile.triage === 'selfcare' ? t('triage.selfcare') : t('results.triage.whoBelow')}
      />
      {profile.triage !== 'selfcare' ? (
        <Card variant="tinted" title={t('triage.result.whoToSee')}>
          <ReferralList reasons={profile.triageReasons} />
        </Card>
      ) : null}

      {/* Probable profile */}
      {profile.subtypes.length || profile.drivers.length ? (
        <Card title={t('results.profile.title')} overline={t('results.profile.hint')}>
          {profile.subtypes.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
              {profile.subtypes.map((k) => (
                <Chip key={k} tone="primary" label={t(k)} onPress={() => info.open(t(k), t(`${k}.info`))} />
              ))}
            </View>
          ) : null}
          {profile.drivers.length ? (
            <View style={{ gap: space[2] }}>
              <Text variant="overline" tone="secondary">{t('results.drivers.title')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {profile.drivers.map((d) => (
                  <Chip key={d} tone="accent" label={t(`driver.${d}`)} onPress={() => info.open(t(`driver.${d}`), t(`driver.${d}.info`))} />
                ))}
              </View>
            </View>
          ) : null}
        </Card>
      ) : null}

      {/* Suggested path */}
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

      {/* Doctor summary */}
      <Card title={t('results.doctor.title')} right={<Stethoscope size={20} color={colors.primary} />}>
        <View style={{ gap: space[1] }}>
          {summary.map((line, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space[2] }}>
              <Text variant="bodySmall" tone="muted">·</Text>
              <Text variant="bodySmall" style={{ flex: 1 }}>{line}</Text>
            </View>
          ))}
        </View>
        {pdfError ? <Text variant="caption" tone="danger">{t('results.doctor.pdfError')}</Text> : null}
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" size="sm" title={t('results.doctor.copy')} icon={<Share2 size={16} color={colors.primaryPressed} />} onPress={() => { void shareText(); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" size="sm" title={t('results.doctor.pdf')} loading={pdfBusy} icon={<FileText size={16} color={colors.primaryPressed} />} onPress={() => { void sharePdf(); }} />
          </View>
        </View>
      </Card>

      {/* Compare with previous */}
      {prev && curr ? (
        <Card variant="tinted" title={t('results.compare.title')}>
          <Text variant="body">{t('results.compare.body', { prev: prev.total, curr: curr.total, date: formatDate(prev.date, locale) })}</Text>
          <Text variant="bodySmall" tone={delta <= -7 ? 'success' : delta >= 7 ? 'warning' : 'secondary'}>
            {delta <= -7 ? t('results.compare.better') : delta >= 7 ? t('results.compare.worse') : t('results.compare.same')}
          </Text>
        </Card>
      ) : null}

      {program ? (
        <Button title={t('results.program.goToday')} icon={<ArrowRight size={18} color={colors.onPrimary} />} onPress={() => router.replace('/(tabs)')} />
      ) : (
        <Card variant="tinted" title={t('results.program.autoTitle')}>
          <Text variant="body" tone="secondary">{t('results.program.autoBody')}</Text>
          <Button title={t('results.program.start')} icon={<ArrowRight size={18} color={colors.onPrimary} />} onPress={startProgram} disabled={hardBlocked} />
          {hardBlocked ? <Text variant="bodySmall" tone="danger">{t('results.program.blocked')}</Text> : null}
          <Button variant="ghost" size="sm" title={t('results.program.customize')} onPress={() => router.push('/program/setup')} />
        </Card>
      )}
      <Disclaimer />
      {sheet}
      {info.sheet}
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
  const thi = get('THI');
  if (thi) lines.push(t('results.summary.thi', { total: thi.total, band: t(`severity.${thi.band}`) }));
  const hq = get('HQ'); if (hq) lines.push(t('results.summary.hq', { total: hq.total }));
  const phq = get('PHQ9'); if (phq) lines.push(t('results.summary.phq', { total: phq.total }));
  const gad = get('GAD7'); if (gad) lines.push(t('results.summary.gad', { total: gad.total }));
  const sci = get('SCI'); if (sci) lines.push(t('results.summary.sci', { total: sci.total }));
  const rasst = get('RASST'); if (rasst) lines.push(t('results.summary.rasst', { total: rasst.total }));
  if (h?.sleepProblem) lines.push(t('results.summary.sleep'));
  const ps = a.psycho;
  if (ps?.pitchHz != null) lines.push(t('results.summary.pitch', { v: fmtHz(ps.pitchHz) }));
  if (ps?.loudnessDbSl != null) lines.push(t('results.summary.loudness', { v: Math.round(ps.loudnessDbSl) }));
  if (ps?.mmlDb != null) lines.push(t('results.summary.mml', { v: Math.round(ps.mmlDb) }));
  if (ps?.riCategory) lines.push(t('results.summary.ri', { v: `${t(`results.summary.ri.${ps.riCategory}`)}${ps.residualInhibitionSec != null ? ` (${Math.round(ps.residualInhibitionSec)} s)` : ''}` }));
  const p = pta4(a);
  if (p != null) lines.push(t('results.summary.pta', { v: Math.round(p) }));
  if (a.redFlags) {
    const flags = FLAG_KEYS.filter((k) => a.redFlags?.[k]).map((k) => t(`results.flag.${k}`));
    lines.push(flags.length ? t('results.summary.flags', { v: flags.join(', ') }) : t('results.summary.noFlags'));
  }
  if (!lines.length) lines.push(locale === 'tr' ? 'Henüz kayıt yok.' : 'Nothing recorded yet.');
  return lines;
}

function buildHtml(p: { title: string; dateLabel: string; date: string; lines: string[]; recs: string[]; recsTitle: string; summaryTitle: string; disclaimer: string; accent: string }) {
  const li = (s: string) => `<li>${escapeHtml(s)}</li>`;
  return `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #0F2A33; padding: 32px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; color: ${escapeHtml(p.accent)}; }
  h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #D5E0E4; padding-bottom: 4px; }
  .meta { color: #4F6B75; font-size: 13px; }
  ul { padding-left: 20px; } li { margin: 4px 0; font-size: 14px; }
  .disc { margin-top: 32px; font-size: 12px; color: #4F6B75; background: #EEF2F3; padding: 12px; border-radius: 8px; }
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
