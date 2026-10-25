import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, CalendarDays, ClipboardList, Lock } from 'lucide-react-native';
import { Button, Card, Screen, Text } from '@/components';
import { CheckRow, Segmented } from '@/components/home';
import { WelcomeArt } from '@/components/illustrations';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';

/**
 * Single-screen onboarding: a calm illustration, one headline, three one-line points, one short consent checkbox with
 * the KVKK and terms links, a compact language switch and "Başla",
 * which goes straight to the safety screen of the guided journey (`/assess/triage?journey=1`) — never via Home.
 * No name field (Settings has it), no setup page: the headphone hint lives on the first sound/test screen and the
 * notification permission is asked once on the first completed session (SessionComplete → ReminderPromptCard).
 */
export default function Onboarding() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { locale, setLocale, completeOnboarding } = useSettings();
  const [consent, setConsent] = useState(false);

  const start = () => {
    completeOnboarding('');
    router.replace('/assess/triage?journey=1');
  };

  const point = (Icon: React.ComponentType<{ size?: number; color?: string }>, key: string) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={colors.primary} /></View>
      <Text variant="bodyStrong" style={{ flex: 1, fontSize: 18 }}>{t(key)}</Text>
    </View>
  );

  const link = (label: string, onPress: () => void) => (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Text variant="bodySmall" tone="primary" style={{ textDecorationLine: 'underline' }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen footer={<Button title={t('onb.start')} icon={<ArrowRight size={18} color={colors.onPrimary} />} disabled={!consent} onPress={start} accessibilityLabel={t('onb.start.a11y')} />}>
      <View style={{ paddingTop: insets.top, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View style={{ width: 168 }}>
          <Segmented options={[{ value: 'tr', label: 'Türkçe' }, { value: 'en', label: 'English' }]} value={locale} onChange={setLocale} accessibilityLabel={t('onb.consent.language')} />
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: space[3], paddingTop: space[2] }}>
        <WelcomeArt width={280} height={180} accessibilityLabel={t('app.name')} />
        <Text variant="overline" tone="primary">{t('app.name')}</Text>
        <Text variant="h1" center accessibilityRole="header">{t('onb.title')}</Text>
        <Text variant="body" tone="secondary" center style={{ fontSize: 18, lineHeight: 26 }}>{t('onb.subtitle')}</Text>
      </View>

      <View style={{ gap: space[1] }}>
        {point(ClipboardList, 'onb.point.1')}
        {point(CalendarDays, 'onb.point.2')}
        {point(Lock, 'onb.point.3')}
      </View>

      <Card>
        <CheckRow checked={consent} label={t('onb.consent.single')} onToggle={() => setConsent((v) => !v)} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[4] }}>
          {link(t('onb.consent.kvkk'), () => router.push('/privacy'))}
          {link(t('onb.consent.terms'), () => router.push('/privacy?doc=terms'))}
        </View>
      </Card>
    </Screen>
  );
}
