import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

/** Small bottom sheet with a title and one paragraph (used for profile chips). */
export function InfoSheet({ title, body, onClose }: { title: string | null; body?: string; onClose: () => void }) {
  const { colors, radius, space } = useTheme();
  const t = useT();
  return (
    <Modal visible={!!title} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel={t('common.close')} />
      <View style={{ backgroundColor: colors.elevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[5], gap: space[3], maxHeight: '60%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] }}>
          <Text variant="h3" style={{ flex: 1 }}>{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={12} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <X size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView><Text variant="body">{body}</Text></ScrollView>
      </View>
    </Modal>
  );
}

/** Convenience hook: const info = useInfoSheet(); render {info.sheet}; call info.open(title, body). */
export function useInfoSheet() {
  const [state, setState] = React.useState<{ title: string; body: string } | null>(null);
  return {
    open: (title: string, body: string) => setState({ title, body }),
    sheet: <InfoSheet title={state?.title ?? null} body={state?.body} onClose={() => setState(null)} />,
  };
}
