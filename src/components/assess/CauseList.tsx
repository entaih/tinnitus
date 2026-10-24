import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Stethoscope, FlaskConical, HeartPulse } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';
import { CAUSES, type CauseScore } from '@/clinical/causes';
import { ShieldAlert } from 'lucide-react-native';

/** Ranked probable causes with site, mechanism, confirmatory test and treatment path. */
export function CauseList({ ranked, max = 4 }: { ranked: CauseScore[]; max?: number }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(ranked[0]?.id ?? null);
  const exclude = ranked.filter((r) => r.tier === 'exclude');
  const mechanisms = ranked.filter((r) => r.tier === 'mechanism').filter((r, i) => i < max && (i === 0 || r.pct >= 8));
  const renderGroup = (items: CauseScore[], isExclude: boolean) => items.map((r, i) => {
        const def = CAUSES[r.id];
        const isOpen = openId === r.id;
        const curTone = def.curability === 'curable' ? 'success' : def.curability === 'treatable' ? 'info' : 'neutral';
        const highlight = isExclude ? colors.warning : i === 0 ? colors.primary : colors.border;
        return (
          <View key={r.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: highlight, overflow: 'hidden' }}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpenId(isOpen ? null : r.id)} style={{ padding: space[4], gap: space[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isExclude ? colors.warningBg : i === 0 ? colors.primary : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  {isExclude ? <ShieldAlert size={16} color={colors.warning} /> : <Text variant="caption" style={{ color: i === 0 ? colors.onPrimary : colors.primaryPressed, fontWeight: '700' }}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t(`cause.${r.id}.name`)}</Text>
                  <Text variant="caption" tone="secondary">{t(`cause.${r.id}.site`)}</Text>
                </View>
                {isOpen ? <ChevronUp size={20} color={colors.textMuted} /> : <ChevronDown size={20} color={colors.textMuted} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
                <Chip small tone={isExclude ? 'warning' : r.confidence === 'high' ? 'primary' : 'neutral'} label={isExclude ? t('causes.mustExclude') : t(`causes.confidence.${r.confidence}`)} />
                <Chip small tone={curTone} label={t(`causes.curability.${def.curability}`)} />
              </View>
            </Pressable>
            {isOpen ? (
              <View style={{ paddingHorizontal: space[4], paddingBottom: space[4], gap: space[3], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space[3] }}>
                <Text variant="body">{t(`cause.${r.id}.mechanism`)}</Text>
                {r.evidence.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[1] }}>
                    {r.evidence.filter(Boolean).map((e) => <Chip key={e} small tone="primary" label={t(e)} />)}
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                  <FlaskConical size={18} color={colors.info} style={{ marginTop: 3 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="secondary">{t('causes.confirm')}</Text>
                    <Text variant="bodySmall">{t(`cause.${r.id}.confirm`)} · <Text variant="bodySmall" tone="primary">{t(def.who)}</Text></Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                  <HeartPulse size={18} color={colors.success} style={{ marginTop: 3 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="secondary">{t('causes.treat')}</Text>
                    <Text variant="bodySmall">{t(`cause.${r.id}.treat`)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
                  <Stethoscope size={18} color={colors.primary} style={{ marginTop: 3 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="secondary">{t('causes.meanwhile')}</Text>
                    <Text variant="bodySmall">{t(`cause.${r.id}.app`)}</Text>
                  </View>
                </View>
                {def.article ? <Button size="sm" variant="ghost" title={t('causes.readMore')} onPress={() => router.push(`/education/${def.article}`)} /> : null}
              </View>
            ) : null}
          </View>
        );
      });
  return (
    <View style={{ gap: space[3] }}>
      {exclude.length ? (
        <>
          <Text variant="h3">{t('causes.section.exclude')}</Text>
          <Text variant="bodySmall" tone="secondary">{t('causes.section.exclude.body')}</Text>
          {renderGroup(exclude, true)}
        </>
      ) : null}
      <Text variant="h3">{t('causes.section.mechanism')}</Text>
      {renderGroup(mechanisms, false)}
    </View>
  );
}
