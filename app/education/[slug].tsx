import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ALargeSmall } from 'lucide-react-native';
import { Screen, Text, Card, Chip, EvidenceChip, Disclaimer, useCitation } from '@/components';
import { MarkdownLite } from '@/components/mind';
import { useTheme } from '@/theme';
import { useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { getArticle } from '@/content/articles';
import { citation } from '@/content/citations';

type FontSize = 'small' | 'normal' | 'large';
const SCALE: Record<FontSize, number> = { small: 0.9, normal: 1, large: 1.2 };
const NEXT: Record<FontSize, FontSize> = { small: 'normal', normal: 'large', large: 'small' };

export default function ArticleScreen() {
  const { slug, taskKey } = useLocalSearchParams<{ slug: string; taskKey?: string }>();
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const { open, sheet } = useCitation();
  const { markRead, completeTask } = useClinical();
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const article = getArticle(String(slug));

  useEffect(() => {
    if (article) markRead(article.slug);
    if (typeof taskKey === 'string' && taskKey) completeTask(taskKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.slug, taskKey]);

  if (!article) return (<><Stack.Screen options={{ title: t('edu.title') }} /><Screen><Text variant="body">{t('edu.notFound')}</Text></Screen></>);
  const scale = SCALE[fontSize];
  const onCitation = (n: number) => { const id = article.citations[n - 1]; if (id) open(id); };
  const level = citation(article.citations[0])?.level ?? 'expert';

  return (
    <>
      <Stack.Screen options={{
        title: article.title[locale],
        headerRight: () => (
          <Pressable accessibilityRole="button" accessibilityLabel={`${t('edu.fontSize')}: ${t(`edu.font.${fontSize}`)}`} onPress={() => setFontSize(NEXT[fontSize])} hitSlop={8}
            style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <ALargeSmall size={24} color={colors.primary} />
          </Pressable>
        ),
      }} />
      <Screen>
        <Text variant="h1" accessibilityRole="header" style={{ fontSize: 28 * scale, lineHeight: 34 * scale }}>{article.title[locale]}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
          <Text variant="caption" tone="secondary">{article.reviewedLine[locale]} · {t('edu.minutes', { n: article.readingMinutes })}</Text>
          <EvidenceChip level={level} onPress={() => open(article.citations[0])} />
        </View>
        <Card variant="tinted" overline={t('edu.takeaway')}>
          <Text variant="bodyStrong" style={{ fontSize: 17 * scale, lineHeight: 26 * scale }}>{article.takeaway[locale]}</Text>
        </Card>
        <MarkdownLite text={article.body[locale]} scale={scale} onCitation={onCitation} />
        <View style={{ gap: space[2], marginTop: space[2] }}>
          <Text variant="h3">{t('edu.sources')}</Text>
          {article.citations.map((c, i) => { const cit = citation(c); if (!cit) return null; return (
            <Pressable key={c} accessibilityRole="link" accessibilityLabel={t('edu.citation.a11y', { n: i + 1 })} onPress={() => open(c)}
              style={({ pressed }) => ({ flexDirection: 'row', gap: space[2], minHeight: 44, paddingVertical: space[1], opacity: pressed ? 0.7 : 1 })}>
              <View style={{ width: 24, height: 24, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text variant="caption" tone="primary">{i + 1}</Text></View>
              <Text variant="bodySmall" tone="secondary" style={{ flex: 1 }}>{cit.authors} ({cit.year}). {cit.title}. {cit.journal}.</Text>
            </Pressable>
          ); })}
        </View>
        <Chip label={t('edu.read')} tone="success" small />
        <Disclaimer />
        {sheet}
      </Screen>
    </>
  );
}
