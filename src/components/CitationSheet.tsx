import React from 'react';
import { Modal, Pressable, View, Linking, ScrollView } from 'react-native';
import { X, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';
import { EvidenceChip } from './Chip';
import { citation } from '@/content/citations';
import { useLocale, useT } from '@/i18n';

/** Bottom sheet showing the citation behind an evidence chip. Controlled: pass citationId or null. */
export function CitationSheet({ citationId, onClose }: { citationId: string | null; onClose: () => void }) {
  const { colors, radius, space } = useTheme();
  const locale = useLocale();
  const t = useT();
  const c = citationId ? citation(citationId) : undefined;
  return (
    <Modal visible={!!c} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel={t('common.close')} />
      <View style={{ backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[5], gap: space[3], maxHeight: '70%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {c ? <EvidenceChip level={c.level} /> : null}
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={12}><X size={22} color={colors.textSecondary} /></Pressable>
        </View>
        {c ? (
          <ScrollView contentContainerStyle={{ gap: space[2] }}>
            <Text variant="h3">{c.title}</Text>
            <Text variant="bodySmall" tone="secondary">{c.authors} ({c.year}). {c.journal}.</Text>
            <Text variant="body">{c.summary[locale]}</Text>
            {(c.doi || c.url) ? (
              <Button variant="secondary" title={c.doi ? `DOI ${c.doi}` : t('citation.open')} icon={<ExternalLink size={18} color={colors.primary} />}
                onPress={() => Linking.openURL(c.doi ? `https://doi.org/${c.doi}` : c.url!)} />
            ) : null}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

/** Convenience hook: const { open, sheet } = useCitation(); render {sheet}; call open('id'). */
export function useCitation() {
  const [id, setId] = React.useState<string | null>(null);
  return { open: (cid: string) => setId(cid), sheet: <CitationSheet citationId={id} onClose={() => setId(null)} /> };
}
