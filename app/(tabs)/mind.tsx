import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity, BookOpenText, Check, ChevronRight, Dumbbell, PenLine, Wind } from 'lucide-react-native';
import { Screen, Text, Card, Row, SectionHeader, EvidenceChip, useCitation } from '@/components';
import { TabHeader } from '@/components/home';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { MODULES_BY_TRACK, TRACK_CITATION, TRACK_ORDER, type ModuleTrack } from '@/content/modules';
import { ARTICLES } from '@/content/articles';
import { citation } from '@/content/citations';
import { unit } from '@/content/registry';

export default function MindScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { open, sheet } = useCitation();
  const sessions = useClinical((s) => s.sessions);
  const thoughts = useClinical((s) => s.thoughts);
  const readArticles = useClinical((s) => s.readArticles);

  const completed = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) if (s.type === 'module' && s.detail) set.add(s.detail);
    return set;
  }, [sessions]);

  const trackCard = (track: ModuleTrack) => {
    const mods = MODULES_BY_TRACK[track];
    const done = mods.filter((m) => completed.has(m.id)).length;
    const cid = TRACK_CITATION[track];
    const level = citation(cid)?.level ?? 'rct';
    const next = mods.find((m) => !completed.has(m.id));
    const title = t(`mind.track.${track}`);
    return (
      <Card key={track} title={title} right={<EvidenceChip level={level} onPress={() => open(cid)} />}>
        <Text variant="bodySmall" tone="secondary">{t(`mind.track.${track}.desc`)}</Text>
        <View accessible accessibilityLabel={t('mind.progress.a11y', { track: title, done, total: mods.length })} style={{ gap: space[1] }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryTrack, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round((done / mods.length) * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
          <Text variant="caption" tone="secondary">{t('mind.progress', { done, total: mods.length })}</Text>
        </View>
        <View style={{ gap: 2 }}>
          {mods.map((m) => {
            const isDone = completed.has(m.id);
            const isNext = next?.id === m.id;
            return (
              <Pressable key={m.id} accessibilityRole="button" accessibilityLabel={`${m.title[locale]}, ${isDone ? t('mind.module.done') : t('mind.module.minutes', { n: unit(m.id).minutes })}`}
                onPress={() => router.push(`/mind/${m.id}`)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 48, opacity: pressed ? 0.7 : 1 })}>
                <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: isDone ? colors.primary : isNext ? colors.primary : colors.border, backgroundColor: isDone ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? <Check size={16} color={colors.onPrimary} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant={isNext ? 'bodyStrong' : 'body'} style={{ opacity: isDone ? 0.7 : 1 }}>{m.title[locale]}</Text>
                  <Text variant="caption" tone="secondary">{isDone ? t('mind.module.done') : isNext ? `${t('mind.module.locked')} · ${t('mind.module.minutes', { n: unit(m.id).minutes })}` : t('mind.module.minutes', { n: unit(m.id).minutes })}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      </Card>
    );
  };

  const readCount = ARTICLES.filter((a) => readArticles.includes(a.slug)).length;
  const exerciseRow = (icon: React.ReactNode, title: string, href: string) => (
    <Row icon={icon} title={title} onPress={() => router.push(href)} />
  );

  return (
    <Screen tab>
      <TabHeader title={t('mind.title')} />
      <Text variant="bodySmall" tone="secondary">{t('mind.subtitle')}</Text>

      <Card onPress={() => router.push(thoughts.length ? '/mind/thoughts' : '/mind/thought-record')} title={t('mind.thoughts.title')} overline={t('mind.thoughts.count', { n: thoughts.length })} right={<PenLine size={22} color={colors.primary} />}
        accessibilityLabel={`${t('mind.thoughts.title')}: ${t('mind.thoughts.count', { n: thoughts.length })}`}>
        <Text variant="bodySmall" tone="secondary">{thoughts.length ? formatDate(thoughts[0].date, locale) : t('mind.thoughts.empty')}</Text>
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/mind/thought-record')} style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
            <Text variant="caption" style={{ color: colors.onPrimary, fontWeight: '600' }}>{t('mind.thoughts.new')}</Text>
          </Pressable>
          {thoughts.length ? (
            <Pressable accessibilityRole="button" onPress={() => router.push('/mind/thoughts')} style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: space[4], borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}>
              <Text variant="caption" tone="primary" style={{ fontWeight: '600' }}>{t('mind.thoughts.list')}</Text>
            </Pressable>
          ) : null}
        </View>
      </Card>

      {TRACK_ORDER.map(trackCard)}

      <SectionHeader title={t('mind.exercises.title')} />
      <Card>
        {exerciseRow(<Wind size={20} color={colors.primary} />, t('mind.exercises.breathing'), '/exercise/breathing')}
        {exerciseRow(<Activity size={20} color={colors.primary} />, t('mind.exercises.pmr'), '/exercise/pmr')}
        {exerciseRow(<Dumbbell size={20} color={colors.primary} />, t('mind.exercises.cervical'), '/exercise/somatic.cervical')}
        {exerciseRow(<Dumbbell size={20} color={colors.primary} />, t('mind.exercises.orofacial'), '/exercise/somatic.orofacial')}
        {exerciseRow(<Activity size={20} color={colors.primary} />, t('mind.exercises.selfTest'), '/exercise/selftest')}
      </Card>

      <Card onPress={() => router.push('/education')} title={t('mind.education.title')} right={<BookOpenText size={22} color={colors.primary} />}>
        <Text variant="bodySmall" tone="secondary">{t('mind.education.desc', { n: ARTICLES.length })}</Text>
        <Text variant="caption" tone="primary">{t('edu.readCount', { done: readCount, total: ARTICLES.length })}</Text>
      </Card>
      {sheet}
    </Screen>
  );
}
