import React from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle2, Clock } from 'lucide-react-native';
import { Screen, Text, Card, SectionHeader, EvidenceChip, useCitation } from '@/components';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { ARTICLE_GROUPS, ARTICLES, articlesByGroup } from '@/content/articles';
import { citation } from '@/content/citations';

export default function EducationIndex() {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const read = useClinical((s) => s.readArticles);
  const readCount = ARTICLES.filter((a) => read.includes(a.slug)).length;

  return (
    <>
      <Stack.Screen options={{ title: t('edu.title') }} />
      <Screen>
        <Text variant="bodySmall" tone="secondary">{t('edu.subtitle')}</Text>
        <Text variant="caption" tone="primary">{t('edu.readCount', { done: readCount, total: ARTICLES.length })}</Text>
        {ARTICLE_GROUPS.map((g) => {
          const list = articlesByGroup(g);
          if (!list.length) return null;
          return (
            <View key={g} style={{ gap: space[3] }}>
              <SectionHeader title={t(`edu.group.${g}`)} />
              {list.map((a) => {
                const cid = a.citations[0];
                const level = citation(cid)?.level ?? 'expert';
                const isRead = read.includes(a.slug);
                return (
                  <Card key={a.slug} onPress={() => router.push(`/education/${a.slug}`)} accessibilityLabel={`${a.title[locale]}. ${t('edu.minutes', { n: a.readingMinutes })}${isRead ? `. ${t('edu.read')}` : ''}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text variant="h3">{a.title[locale]}</Text>
                        <Text variant="bodySmall" tone="secondary" numberOfLines={2}>{a.takeaway[locale]}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap', marginTop: 4 }}>
                          <Clock size={14} color={colors.textMuted} />
                          <Text variant="caption" tone="muted">{t('edu.minutes', { n: a.readingMinutes })}</Text>
                          <EvidenceChip level={level} onPress={() => open(cid)} />
                        </View>
                      </View>
                      {isRead ? <CheckCircle2 size={20} color={colors.success} /> : null}
                    </View>
                  </Card>
                );
              })}
            </View>
          );
        })}
        {sheet}
      </Screen>
    </>
  );
}
