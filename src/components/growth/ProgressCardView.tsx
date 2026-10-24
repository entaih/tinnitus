import React, { forwardRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { sparklinePoints, thiBandKey, type ProgressStats } from './progressCard';

/** The Dingin mark: a calm ring with a flattening wave — drawn, not an image, so it scales and themes. */
export function DinginMark({ size = 28, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel="Dingin">
      <Circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2.5" fill="none" />
      <Path d="M7 18 C 10 12, 13 12, 16 16 S 22 20, 25 15" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/**
 * The shareable progress card. Rendered on-screen and captured as an image with react-native-view-shot.
 * Shows only the user's own numbers (first vs latest THI, programme week, active days) and a "not a diagnosis" footer.
 */
export const ProgressCardView = forwardRef<React.ComponentRef<typeof View>, { stats: ProgressStats }>(function ProgressCardView({ stats }, ref) {
  const { colors, space, radius, shadow } = useTheme();
  const t = useT();
  const band = (total: number) => t(`severity.${thiBandKey(total)}`);
  const change = stats.thiChange;
  const changeText = change == null ? t('growth.share.card.change.none') : change < 0 ? t('growth.share.card.change.down', { n: -change }) : change > 0 ? t('growth.share.card.change.up', { n: change }) : t('growth.share.card.change.flat');
  const changeTone = change == null ? colors.textSecondary : change < 0 ? colors.success : change > 0 ? colors.warning : colors.textSecondary;
  const W = 280; const H = 72;

  return (
    <View ref={ref} collapsable={false} style={[{ backgroundColor: colors.card, borderRadius: radius.xl, padding: space[5], gap: space[4], borderWidth: 1, borderColor: colors.border }, shadow.e2]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <DinginMark color={colors.primary} />
        <Text variant="overline" tone="primary">{t('app.name')}</Text>
        <View style={{ flex: 1 }} />
        <Text variant="caption" tone="muted">{stats.programWeek != null ? t('growth.share.card.week', { n: stats.programWeek }) : t('growth.share.card.noProgram')}</Text>
      </View>

      <View style={{ gap: 2 }}>
        <Text variant="caption" tone="secondary">{t('growth.share.card.thi')}</Text>
        {stats.thiFirst != null && stats.thiLatest != null ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[3], flexWrap: 'wrap' }}>
            <View>
              <Text variant="caption" tone="muted">{t('growth.share.card.first')}</Text>
              <Text variant="numeric">{stats.thiFirst}</Text>
              <Text variant="caption" tone="secondary">{band(stats.thiFirst)}</Text>
            </View>
            {stats.thi.length >= 2 ? (
              <>
                <Text variant="h2" tone="muted" style={{ paddingBottom: 18 }}>→</Text>
                <View>
                  <Text variant="caption" tone="muted">{t('growth.share.card.latest')}</Text>
                  <Text variant="numeric" style={{ color: changeTone }}>{stats.thiLatest}</Text>
                  <Text variant="caption" tone="secondary">{band(stats.thiLatest)}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <Text variant="bodyStrong" tone="secondary">{t('growth.share.card.noThi')}</Text>
        )}
        <Text variant="bodySmall" style={{ color: changeTone }}>{changeText}</Text>
      </View>

      {stats.thi.length >= 2 ? (
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" accessibilityLabel={t('growth.share.card.thi')}>
          <Polyline points={sparklinePoints(stats.thi, W, H)} fill="none" stroke={colors.chart.thi} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space[3] }}>
        <View style={{ flex: 1, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: space[3], gap: 2 }}>
          <Text variant="caption" tone="secondary">{t('growth.share.card.weekLabel')}</Text>
          <Text variant="h2">{stats.programWeek ?? '—'}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space[3], gap: 2 }}>
          <Text variant="caption" tone="secondary">{t('growth.share.card.activeDays')}</Text>
          <Text variant="h2" style={{ color: colors.accentText }}>{stats.activeDays}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.secondarySoft, borderRadius: radius.md, padding: space[3], gap: 2 }}>
          <Text variant="caption" tone="secondary">{t('growth.share.card.sessions')}</Text>
          <Text variant="h2" style={{ color: colors.secondaryText }}>{stats.sessionsCount}</Text>
        </View>
      </View>

      <Text variant="caption" tone="muted">{t('growth.share.card.footer')}</Text>
    </View>
  );
});
