import React, { useMemo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Stack } from 'expo-router';
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from 'lucide-react-native';
import { Card, Chip, Disclaimer, EvidenceChip, Screen, SectionHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { CITATIONS, type Citation } from '@/content/citations';

const LEVELS: Citation['level'][] = ['guideline', 'rct', 'expert'];

/**
 * Evidence page ("Dingin neye dayanıyor?"): every citation in src/content/citations.ts grouped by level with
 * DOI links, the claims checklist from the marketing review and the regulatory/KVKK statement.
 */
export default function EvidenceScreen() {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();

  const groups = useMemo(() => {
    const byLevel: Record<Citation['level'], Citation[]> = { guideline: [], rct: [], expert: [] };
    for (const c of Object.values(CITATIONS)) byLevel[c.level].push(c);
    for (const l of LEVELS) byLevel[l].sort((a, b) => b.year - a.year || a.authors.localeCompare(b.authors));
    return byLevel;
  }, []);

  const open = (c: Citation) => {
    const url = c.doi ? `https://doi.org/${c.doi}` : c.url;
    if (url) void Linking.openURL(url);
  };

  const claim = (text: string, ok: boolean, key: string) => (
    <View key={key} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
      {ok ? <CheckCircle2 size={18} color={colors.success} style={{ marginTop: 4 }} /> : <XCircle size={18} color={colors.danger} style={{ marginTop: 4 }} />}
      <Text variant="body" style={{ flex: 1 }}>{text}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('growth.evidence.title') }} />
      <Screen>
        <Text variant="body" tone="secondary">{t('growth.evidence.intro')}</Text>
        <Text variant="bodySmall" tone="secondary">{t('growth.evidence.turkish')}</Text>

        <SectionHeader title={t('growth.evidence.claims.title')} />
        <Card>
          <Text variant="h3">{t('growth.evidence.claims.do.title')}</Text>
          {[1, 2, 3, 4].map((i) => claim(t(`growth.evidence.claims.do.${i}`), true, `do-${i}`))}
          <Text variant="h3" style={{ marginTop: space[2] }}>{t('growth.evidence.claims.dont.title')}</Text>
          {[1, 2, 3, 4].map((i) => claim(t(`growth.evidence.claims.dont.${i}`), false, `dont-${i}`))}
          <Text variant="bodySmall" tone="secondary">{t('growth.evidence.ownData')}</Text>
        </Card>

        {LEVELS.map((level) => (
          <View key={level} style={{ gap: space[3] }}>
            <SectionHeader title={t(`growth.evidence.level.${level}`)} />
            <Chip label={t('growth.evidence.count', { n: groups[level].length })} tone="neutral" small />
            {groups[level].map((c) => {
              const hasLink = !!(c.doi || c.url);
              return (
                <Card key={c.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[2] }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="h3">{c.title}</Text>
                      <Text variant="bodySmall" tone="secondary">{c.authors} ({c.year}). {c.journal}.</Text>
                    </View>
                    <EvidenceChip level={c.level} />
                  </View>
                  <Text variant="body">{c.summary[locale]}</Text>
                  {hasLink ? (
                    <Pressable accessibilityRole="link" accessibilityLabel={`${t('growth.evidence.open')}: ${c.title}`} onPress={() => open(c)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44, opacity: pressed ? 0.7 : 1 })}>
                      <ExternalLink size={16} color={colors.primary} />
                      <Text variant="bodySmall" tone="primary">{c.doi ? `DOI ${c.doi}` : t('growth.evidence.open')}</Text>
                    </Pressable>
                  ) : null}
                </Card>
              );
            })}
          </View>
        ))}

        <SectionHeader title={t('growth.evidence.regulatory.title')} />
        <Card variant="tinted">
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }}>
            <ShieldCheck size={22} color={colors.primary} />
            <Text variant="body" style={{ flex: 1 }}>{t('growth.evidence.regulatory.body')}</Text>
          </View>
          <Text variant="bodySmall" tone="secondary">{t('growth.evidence.advisory')}</Text>
        </Card>
        <Disclaimer textKey="settings.about.regulatory" />
      </Screen>
    </>
  );
}
