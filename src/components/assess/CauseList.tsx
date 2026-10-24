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

/** Ranked probable causes with site, mechanism, confirmatory test and treatment path. */
export function CauseList({ ranked, max = 4 }: { ranked: CauseScore[]; max?: number }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(ranked[0]?.id ?? null);
  const shown = ranked.filter((r, i) => i < max && (i === 0 || r.pct >= 8));
  return (
    <View style={{ gap: space[3] }}>
      {shown.map((r, i) => {
        const def = CAUSES[r.id];
        const isOpen = openId === r.id;
        const curTone = def.curability === 'curable' ? 'success' : def.curability === 'treatable' ? 'info' : 'neutral';
        return (
          <View key={r.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: i === 0 ? colors.primary : colors.border, overflow: 'hidden' }}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpenId(isOpen ? null : r.id)} style={{ padding: space[4], gap: space[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: i === 0 ? colors.primary : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" style={{ color: i === 0 ? colors.onPrimary : colors.primaryPressed, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t(`cause.${r.id}.name`)}</Text>
                  <Text variant="caption" tone="secondary">{t(`cause.${r.id}.site`)}</Text>
                </View>
                {isOpen ? <ChevronUp size={20} color={colors.textMuted} /> : <ChevronDown size={20} color={colors.textMuted} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
                <View style={{ flex: 1, height: 6, backgroundColor: colors.primaryTrack, borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                  <View style={{ width: `${Math.max(4, r.pct)}%`, height: 6, backgroundColor: colors.primary }} />
                </View>
                <Text variant="caption" tone="secondary">{t(`causes.confidence.${r.confidence}`)} · %{r.pct}</Text>
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
      })}
    </View>
  );
}
