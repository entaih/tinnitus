import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, Check, CircleDot, Circle } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { useT } from '@/i18n';
import { useJourney } from '@/hooks/useJourney';

/** Hero card: the single next step of the guided assessment, with a compact step list. */
export function JourneyCard() {
  const { colors, space, radius, shadow } = useTheme();
  const t = useT();
  const { journey } = useJourney();
  if (journey.phase !== 'assess') return null;
  const cur = journey.current;
  const total = journey.steps.length;
  const remaining = journey.steps.filter((s) => !s.done).reduce((m, s) => m + s.minutes, 0);
  return (
    <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.e2]}>
      <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space[5], gap: space[3] }}>
        <Text variant="overline" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('journey.step', { n: journey.index + 1, total })}</Text>
        <Text variant="h1" style={{ color: '#FFFFFF' }}>{cur ? t(`journey.title.${cur.id}`) : t('journey.title.results')}</Text>
        <Text variant="body" style={{ color: 'rgba(255,255,255,0.88)' }}>{cur ? t(cur.whyKey) : t('journey.why.results')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[2] }}>
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>{t('journey.remaining', { n: Math.max(1, remaining) })}</Text>
          <Button
            title={cur?.id === 'results' ? t('journey.seeResults') : t('common.start')}
            icon={<ArrowRight size={18} color={colors.primary} />}
            variant="inverse" style={{ minHeight: 48 }}
            accessibilityLabel={cur ? t(`journey.title.${cur.id}`) : t('journey.title.results')}
            onPress={() => router.push((cur ? `${cur.route}${cur.route.includes('?') ? '&' : '?'}journey=1` : '/assess/results') as never)}
          />
        </View>
      </LinearGradient>
      <View style={{ backgroundColor: colors.card, padding: space[4], gap: space[2] }}>
        {journey.steps.map((s, i) => {
          const isCur = i === journey.index;
          const Icon = s.done ? Check : isCur ? CircleDot : Circle;
          const color = s.done ? colors.success : isCur ? colors.primary : colors.textDisabled;
          return (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 32 }}>
              <Icon size={18} color={color} strokeWidth={s.done ? 3 : 2} />
              <Text variant={isCur ? 'bodyStrong' : 'bodySmall'} tone={s.done ? 'secondary' : isCur ? 'default' : 'muted'} style={{ flex: 1 }}>{t(`journey.title.${s.id}`)}</Text>
              {!s.done && s.minutes ? <Text variant="caption" tone="muted">{t('common.minutes', { n: s.minutes })}</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
