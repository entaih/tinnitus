import React from 'react';
import { useTheme } from '@/theme';
import { Text, type AppTextProps } from '@/components/Text';
import { useT } from '@/i18n';
import { useInfoSheet } from '@/components/assess/InfoSheet';

export type GlossaryId = 'thi' | 'ri' | 'pitch' | 'referral';

/**
 * Dotted-underline term that opens a plain-language definition (glossary.<id>.def) in an InfoSheet.
 * Pass `open` from `useGlossary()` so one sheet serves every term on the screen. Works inline inside a Text.
 */
export function GlossaryTerm({ id, label, open, variant = 'body', tone = 'default', style }: {
  id: GlossaryId; label?: string; open: (id: GlossaryId) => void; variant?: AppTextProps['variant']; tone?: AppTextProps['tone']; style?: AppTextProps['style'];
}) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <Text
      variant={variant}
      tone={tone}
      accessibilityRole="button"
      accessibilityHint={t('glossary.a11yHint')}
      onPress={() => open(id)}
      style={[{ textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: colors.primary }, ...(Array.isArray(style) ? style : style ? [style] : [])]}
    >
      {label ?? t(`glossary.${id}.term`)}
    </Text>
  );
}

/** const g = useGlossary(); render {g.sheet}; use <GlossaryTerm id="thi" open={g.open} />. */
export function useGlossary() {
  const t = useT();
  const info = useInfoSheet();
  return { open: (id: GlossaryId) => info.open(t(`glossary.${id}.term`), t(`glossary.${id}.def`)), sheet: info.sheet };
}
