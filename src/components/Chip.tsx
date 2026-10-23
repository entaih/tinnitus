import React from 'react';
import { Pressable, View } from 'react-native';
import { BadgeCheck, Info } from 'lucide-react-native';
import { useTheme, type SeverityBand } from '@/theme';
import { Text } from './Text';
import { useT } from '@/i18n';

export function Chip({ label, tone = 'neutral', icon, onPress, small }: { label: string; tone?: 'neutral' | 'primary' | 'info' | 'accent' | 'success' | 'warning' | 'danger'; icon?: React.ReactNode; onPress?: () => void; small?: boolean }) {
  const { colors, radius, space } = useTheme();
  const map = {
    neutral: { bg: colors.skeleton, fg: colors.textSecondary },
    primary: { bg: colors.primarySoft, fg: colors.primaryPressed },
    info: { bg: colors.infoBg, fg: colors.info },
    accent: { bg: colors.accentSoft, fg: colors.accentText },
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
  }[tone];
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1], backgroundColor: map.bg, borderRadius: radius.full, paddingVertical: small ? 4 : 6, paddingHorizontal: space[3], alignSelf: 'flex-start' }}>
      {icon}
      <Text variant="caption" style={{ color: map.fg }}>{label}</Text>
    </View>
  );
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress}>{body}</Pressable> : body;
}

/** Evidence-level chip; always tappable to a citation sheet. */
export function EvidenceChip({ level, onPress }: { level: 'guideline' | 'rct' | 'expert'; onPress?: () => void }) {
  const { colors } = useTheme();
  const t = useT();
  const tone = level === 'expert' ? 'neutral' : 'info';
  const fg = level === 'expert' ? colors.textSecondary : colors.info;
  return (
    <Chip
      small
      tone={tone}
      label={t(`evidence.${level}`)}
      icon={level === 'expert' ? <Info size={14} color={fg} /> : <BadgeCheck size={14} color={fg} />}
      onPress={onPress}
    />
  );
}

export function SeverityBadge({ band, score, source }: { band: SeverityBand; score?: number; source?: string }) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const c = colors.severity[band];
  const label = t(`severity.${band}`);
  return (
    <View
      accessibilityLabel={t('a11y.severity', { band: label, score: score ?? '' , source: source ?? '' })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: c.bg, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: space[3], alignSelf: 'flex-start' }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.text }} />
      <Text variant="caption" style={{ color: c.text, fontWeight: '600' }}>{label}{score != null ? ` · ${score}` : ''}</Text>
    </View>
  );
}
