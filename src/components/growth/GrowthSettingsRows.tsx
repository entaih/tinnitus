import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Building2, LifeBuoy, Scale, Share2 } from 'lucide-react-native';
import { Card, Row, SectionHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { GROWTH_EVENTS, useGrowth } from '@/store/growth';
import { formatClinicCode } from './clinicCode';

/** Settings → "Destek ve paylaşım": share card, crisis card and clinic code rows (one insertion in settings.tsx). */
export function GrowthSettingsRows() {
  const { colors } = useTheme();
  const t = useT();
  const clinic = useGrowth((s) => s.clinic);
  return (
    <>
      <SectionHeader title={t('growth.section')} />
      <Card>
        <Row icon={<Share2 size={20} color={colors.primary} />} title={t('growth.share.title')} subtitle={t('growth.share.subtitle')} onPress={() => router.push('/share')} />
        <Row icon={<LifeBuoy size={20} color={colors.danger} />} title={t('growth.crisis.link')} subtitle={t('growth.crisis.row.subtitle')} onPress={() => router.push('/crisis')} />
        <Row
          icon={<Building2 size={20} color={colors.primary} />}
          title={t('growth.clinic.title')}
          subtitle={clinic ? t('growth.clinic.row.active', { code: formatClinicCode(clinic.code) }) : t('growth.clinic.row.none')}
          onPress={() => router.push('/clinic')}
        />
      </Card>
    </>
  );
}

/** Settings → "Hakkında": evidence page row + the "Yerel sayaçlar" debug line (one insertion in settings.tsx). */
export function AboutGrowthRows() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const counters = useGrowth((s) => s.counters);
  const line = GROWTH_EVENTS.map((e) => `${t(`growth.counters.event.${e}`)} ${counters[e] ?? 0}`).join(' · ');
  return (
    <>
      <Row icon={<Scale size={20} color={colors.primary} />} title={t('growth.evidence.row')} onPress={() => router.push('/evidence')} />
      <View style={{ backgroundColor: colors.skeleton, borderRadius: radius.sm, padding: space[3], gap: 4 }}>
        <Text variant="caption" tone="secondary">{t('growth.counters.title')}</Text>
        <Text variant="caption" tone="muted" accessibilityLabel={`${t('growth.counters.title')}: ${line}`}>{line}</Text>
        <Text variant="caption" tone="muted">{t('growth.counters.body')}</Text>
      </View>
    </>
  );
}
