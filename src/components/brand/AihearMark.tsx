import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

// Placeholder wordmarks until the official AIHEAR logo is dropped into assets/brand/ under the same names.
const LOGO_DARK = require('../../../assets/brand/aihear-logo.png');
const LOGO_WHITE = require('../../../assets/brand/aihear-logo-white.png');
const RATIO = 961 / 208;

/** AIHEAR logo, light/dark aware (`onColor` forces the white version, e.g. on the indigo gradient). */
export function AihearLogo({ height = 18, onColor = false }: { height?: number; onColor?: boolean }) {
  const { isDark } = useTheme();
  return <Image source={onColor || isDark ? LOGO_WHITE : LOGO_DARK} style={{ height, width: height * RATIO }} resizeMode="contain" accessibilityRole="image" accessibilityLabel="AIHEAR" />;
}

/** "Bir AIHEAR uygulaması" line with the logo, for onboarding and Settings → Hakkında. */
export function MadeByAihear({ center = true }: { center?: boolean }) {
  const { space } = useTheme();
  const t = useT();
  return (
    <View accessible accessibilityLabel={t('brand.madeBy.a11y')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', gap: space[2], paddingVertical: space[1] }}>
      <Text variant="caption" tone="secondary">{t('brand.madeBy')}</Text>
      <AihearLogo height={14} />
      {t('brand.madeBy.post') ? <Text variant="caption" tone="secondary">{t('brand.madeBy.post')}</Text> : null}
    </View>
  );
}
