import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stethoscope, ShieldAlert, FlaskConical, ChevronDown, ChevronUp, Check, Minus, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Banner } from '@/components/Banner';
import { useT } from '@/i18n';
import type { Diagnosis, DxEntry } from '@/clinical/diagnosis';
import { diagnosisStatement } from '@/clinical/diagnosis';

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

/** Preliminary diagnosis card: statement, primary, secondary, differentials to exclude, comorbidities, confirmation plan. */
export function DiagnosisCard({ d }: { d: Diagnosis }) {
  const { colors, space, radius, shadow, isDark } = useTheme();
  const t = useT();
  const statement = diagnosisStatement(d, t);
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space[4], gap: space[3], borderWidth: isDark ? 1 : 0, borderColor: colors.border }, !isDark ? shadow.e1 : {}]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Stethoscope size={22} color={colors.primary} />
        <Text variant="overline" tone="secondary">{t('dx.overline')}</Text>
      </View>
      <Text variant="h2">{t('dx.title')}</Text>
      <Text variant="body">{statement}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
        <Chip small tone="neutral" label={`ICD-10 ${d.base.icd}`} />
        <Chip small tone="neutral" label={t(`dx.type.${d.base.type}`)} />
        <Chip small tone="neutral" label={t(`dx.course.${d.base.course}`)} />
      </View>
      <Banner tone="info" title={t('dx.investigational.title')} body={t('dx.investigational.body')} />
      {d.primary ? <DxRow e={d.primary} kind="primary" /> : null}
      {d.secondary.length ? (
        <>
          <Text variant="h3">{t('dx.secondary')}</Text>
          {d.secondary.map((e) => <DxRow key={e.id} e={e} kind="secondary" />)}
        </>
      ) : null}
      {d.differentials.length ? (
        <>
          <Text variant="h3">{t('dx.differentials')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('dx.differentials.body')}</Text>
          {d.differentials.map((e) => <DxRow key={e.id} e={e} kind="differential" />)}
        </>
      ) : null}
      {d.comorbid.length ? (
        <>
          <Text variant="h3">{t('dx.comorbid')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
            {d.comorbid.map((c) => <Chip key={c.key} small tone="info" label={`${t(c.key)} · ${c.icd}`} />)}
          </View>
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
  );
}
