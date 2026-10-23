import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

/** Header for tab screens (tabs render without a navigation header). Profile button opens Settings. */
export function TabHeader({ title, subtitle, right, profile = true }: { title: string; subtitle?: string; right?: React.ReactNode; profile?: boolean }) {
  const { colors, space, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <View style={{ paddingTop: insets.top + space[2], flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] }}>
      <View style={{ flex: 1, gap: 2 }}>
        {subtitle ? <Text variant="caption" tone="secondary">{subtitle}</Text> : null}
        <Text variant="h1" accessibilityRole="header">{title}</Text>
      </View>
      {right}
      {profile ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.profile')}
          onPress={() => router.push('/settings')}
          style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
        >
          <UserRound size={22} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
