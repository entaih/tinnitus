import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Stethoscope, ShieldAlert, FlaskConical, ChevronDown, ChevronUp, Check, Minus, X, Compass } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { Banner } from '@/components/Banner';
import { useT } from '@/i18n';
import type { Diagnosis, DxEntry } from '@/clinical/diagnosis';
import { bestPath, certaintyProgress, diagnosisActions } from '@/clinical/diagnosis';
import type { Assessment, Profile } from '@/clinical/types';

function CriteriaList({ e }: { e: DxEntry }) {
  const { colors, space } = useTheme();
  const t = useT();
  const row = (k: string, icon: React.ReactNode, tone: 'default' | 'muted' | 'danger') => (
    <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 28 }}>
      {icon}
      <Text variant="bodySmall" tone={tone === 'default' ? 'default' : tone === 'muted' ? 'muted' : 'danger'} style={{ flex: 1 }}>{t(`feat.${k}`)}</Text>
    </View>
  );
  return (
    <View style={{ gap: 2 }}>
      <Text variant="caption" tone="secondary">{t('dx.criteria.met')}</Text>
      {e.met.map((k) => row(k, <Check size={16} color={colors.success} />, 'default'))}
      {e.missing.length ? <Text variant="caption" tone="secondary" style={{ marginTop: space[2] }}>{t('dx.criteria.missing')}</Text> : null}
      {e.missing.map((k) => row(k, <Minus size={16} color={colors.textMuted} />, 'muted'))}
      {e.contradictions.length ? <Text variant="caption" tone="secondary" style={{ marginTop: space[2] }}>{t('dx.criteria.contra')}</Text> : null}
      {e.contradictions.map((k) => row(k, <X size={16} color={colors.danger} />, 'danger'))}
    </View>
  );
}

function DxRow({ e, kind }: { e: DxEntry; kind: 'primary' | 'secondary' | 'differential' }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [open, setOpen] = useState(kind === 'primary');
  const tone = kind === 'differential' ? 'warning' : e.certainty === 'high' ? 'success' : e.certainty === 'moderate' ? 'primary' : 'neutral';
  return (
    <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: kind === 'primary' ? colors.primary : kind === 'differential' ? colors.warning : colors.border, backgroundColor: colors.card, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={{ padding: space[3], gap: space[1] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          {kind === 'differential' ? <ShieldAlert size={18} color={colors.warning} /> : <Stethoscope size={18} color={colors.primary} />}
          <Text variant="bodyStrong" style={{ flex: 1 }}>{t(`cause.${e.id}.name`)}</Text>
          {open ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1], alignItems: 'center' }}>
          <Chip small tone="neutral" label={`ICD-10 ${e.icd}`} />
          <Chip small tone={tone} label={kind === 'differential' ? t('dx.exclude') : t(`dx.certainty.${e.certainty}`)} />
        </View>
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: space[3], paddingBottom: space[3], gap: space[2], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[2] }}>
          <Text variant="bodySmall" tone="secondary">{t(`cause.${e.id}.site`)}</Text>
          <CriteriaList e={e} />
          <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
            <FlaskConical size={16} color={colors.info} style={{ marginTop: 3 }} />
            <Text variant="bodySmall" style={{ flex: 1 }}>{t(`cause.${e.id}.confirm`)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Decisive preliminary-diagnosis card (layer 1, directly under the gauge — PM sprint 2 A2):
 * one sentence (cause · site · ICD-10 · certainty), the best path (curability + who + urgency + programme arm),
 * "to raise certainty" buttons that open the in-app measurements, must-exclude chips, comorbidities and a
 * permanent disclaimer. Criteria and the confirmation plan are collapsed. The card is never empty: low certainty
 * without any in-app action states that an ENT examination and audiometry are needed.
 */
export function DiagnosisCard({ d, assessment, profile }: { d: Diagnosis; assessment: Assessment; profile: Profile }) {
  const { colors, space, radius, shadow, isDark } = useTheme();
  const t = useT();
  const router = useRouter();
  const [details, setDetails] = useState(false);
  const primary = d.primary;
  const id = primary?.id ?? 'central';
  const certainty = primary?.certainty ?? 'low';
  const icd = primary?.icd ?? d.base.icd;
  const actions = diagnosisActions(d, assessment);
  const path = bestPath(d, profile);
  const urgent = d.triageTier <= 2;
  const lowNoActions = certainty === 'low' && actions.length === 0;
  const certaintyTone = certainty === 'high' ? 'success' : certainty === 'moderate' ? 'primary' : 'warning';
  const misophonia = d.comorbid.some((c) => c.key === 'dx.comorbid.misophonia');
  const metCount = primary?.met.length ?? 0;
  const missingCount = primary?.missing.length ?? 0;
  const progress = certaintyProgress(d);
  const barColor = certainty === 'high' ? colors.success : certainty === 'moderate' ? colors.primary : colors.warning;

  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space[4], gap: space[3], borderWidth: isDark ? 1 : 0, borderColor: colors.border }, !isDark ? shadow.e1 : {}]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Stethoscope size={22} color={colors.primary} />
        <Text variant="overline" tone="secondary">{t('dx.overline')}</Text>
      </View>
      <Text variant="h2">{t('dx.title')}</Text>

      {/* 1. One sentence: cause · site · ICD-10 · certainty */}
      <Text variant="body">
        <Text variant="bodyStrong">{t('dx.sentence.lead')} {t(`cause.${id}.name`)}</Text>
        {` · ${t(`cause.${id}.site`)} · ICD-10 ${icd} · `}
        <Text variant="bodyStrong" tone={certaintyTone}>{t(`dx.certainty.${certainty}`)}</Text>
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
        <Chip small tone="neutral" label={t(`dx.type.${d.base.type}`)} />
        <Chip small tone="neutral" label={t(`dx.course.${d.base.course}`)} />
        {d.base.severityBand ? <Chip small tone="neutral" label={t('dx.severity', { band: t(`severity.${d.base.severityBand}`), thi: d.base.thi ?? '' })} /> : null}
      </View>

      {/* Certainty bar: criteria met out of all criteria of the primary diagnosis (sprint 3 A2) */}
      <View style={{ gap: space[1] }} accessible accessibilityRole="progressbar" accessibilityLabel={t('dx.certaintyBar', { met: progress.met, total: progress.total })} accessibilityValue={{ min: 0, max: progress.total, now: progress.met }}>
        <Text variant="caption" tone="secondary">{t('dx.certaintyBar', { met: progress.met, total: progress.total })}</Text>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.skeleton, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round(progress.fraction * 100)}%`, height: 6, backgroundColor: barColor }} />
        </View>
      </View>

      {/* 2. Best path: curability + who first + urgency line */}
      <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[3] }}>
        <Compass size={18} color={colors.primary} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: space[1] }}>
          <Text variant="caption" tone="secondary">{t('dx.bestPath')}</Text>
          <Text variant="body">{t(`dx.path.${path.curability}`, { who: t(path.whoKey), arm: t(path.armKey) })}</Text>
          <Text variant="bodySmall" tone={urgent ? 'danger' : 'secondary'}>{t(path.whenKey)}</Text>
        </View>
      </View>

      {/* 3. To raise certainty: in-app measurements (never empty) */}
      {lowNoActions ? <Banner tone="warning" title={t('dx.lowNoActions')} /> : null}
      {actions.length ? (
        <View style={{ gap: space[2] }}>
          <Text variant="caption" tone="secondary">{t('dx.sharpen')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {actions.map((a) => (
              <Button key={a.route} size="sm" variant="secondary" title={`${t(a.key)} · ${t('common.minutes', { n: a.minutes })}`} onPress={() => router.push(`${a.route}?from=dx` as never)} />
            ))}
          </View>
        </View>
      ) : null}

      {/* 4. Must be excluded first */}
      {d.differentials.length ? (
        <View style={{ gap: space[1] }}>
          <Text variant="caption" tone="secondary">{t('dx.differentials')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
            {d.differentials.map((e) => <Chip key={e.id} small tone="warning" icon={<ShieldAlert size={14} color={colors.warning} />} label={`${t(`cause.${e.id}.name`)} · ${e.icd}`} />)}
          </View>
        </View>
      ) : null}

      {d.comorbid.length ? (
        <View style={{ gap: space[1] }}>
          <Text variant="caption" tone="secondary">{t('dx.comorbid')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
            {d.comorbid.map((c) => <Chip key={c.key} small tone="info" label={c.icd === '—' ? t(c.key) : `${t(c.key)} · ${c.icd}`} />)}
          </View>
          {misophonia ? <Text variant="bodySmall" tone="secondary">{t('dx.comorbid.misophonia.info')}</Text> : null}
        </View>
      ) : null}

      {/* Criteria, secondary causes, differential detail and the confirmation plan: collapsed */}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails((v) => !v)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space[2], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[2] }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodySmall" tone="primary">{t('dx.details')}</Text>
          {!details ? <Text variant="caption" tone="secondary">{t('dx.details.summary', { met: metCount, missing: missingCount })}</Text> : null}
        </View>
        {details ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
      </Pressable>
      {details ? (
        <View style={{ gap: space[3] }}>
          <Banner tone="info" title={t('dx.investigational.title')} body={t('dx.investigational.body')} />
          {primary ? <DxRow e={primary} kind="primary" /> : null}
          {d.secondary.length ? (
            <>
              <Text variant="h3">{t('dx.secondary')}</Text>
              {d.secondary.map((e) => <DxRow key={e.id} e={e} kind="secondary" />)}
            </>
          ) : null}
          {d.differentials.length ? (
            <>
              <Text variant="bodySmall" tone="secondary">{t('dx.differentials.body')}</Text>
              {d.differentials.map((e) => <DxRow key={e.id} e={e} kind="differential" />)}
            </>
          ) : null}
          <Text variant="h3">{t('dx.confirmation')}</Text>
          {d.confirmation.map((k) => (
            <View key={k} style={{ flexDirection: 'row', gap: space[2] }}>
              <Text variant="body" tone="secondary">·</Text>
              <Text variant="body" style={{ flex: 1 }}>{t(k)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 5. Permanent honesty line */}
      <Text variant="caption" tone="muted">{t('dx.disclaimer')}</Text>
    </View>
  );
}
