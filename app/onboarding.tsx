import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, Brain, ClipboardList, Lock } from 'lucide-react-native';
import { Button, Card, Screen, Text } from '@/components';
import { CheckRow, Segmented } from '@/components/home';
import { DinginMark } from '@/components/growth';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';

/**
 * Single-screen onboarding (PM sprint 3 §B1, defects E6/E8): title, three value lines (what it does / does not do /
 * data stays on the device), one consent checkbox with the KVKK and terms links, the language switch and "Başla",
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

  const valueLine = (Icon: React.ComponentType<{ size?: number; color?: string }>, key: string, bg: string, tint: string) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={tint} /></View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{t(`onb.value.${key}`)}</Text>
        <Text variant="caption" tone="secondary">{t(`onb.value.${key}Sub`)}</Text>
      </View>
    </View>
  );

  const link = (label: string, onPress: () => void) => (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Text variant="bodySmall" tone="primary" style={{ textDecorationLine: 'underline' }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen footer={<Button title={t('onb.start')} icon={<ArrowRight size={18} color={colors.onPrimary} />} disabled={!consent} onPress={start} accessibilityLabel={t('onb.start.a11y')} />}>
      <View style={{ paddingTop: insets.top }} />
      <View style={{ alignItems: 'center', gap: space[3], paddingVertical: space[4] }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <DinginMark size={40} color={colors.primary} />
        </View>
        <Text variant="overline" tone="primary">{t('app.name')}</Text>
        <Text variant="h1" center accessibilityRole="header">{t('onb.title')}</Text>
        <Text variant="body" tone="secondary" center>{t('onb.subtitle')}</Text>
      </View>

      <Card>
        {valueLine(ClipboardList, 'does', colors.primarySoft, colors.primary)}
        {valueLine(Brain, 'doesNot', colors.accentSoft, colors.accentText)}
        {valueLine(Lock, 'local', colors.secondarySoft, colors.secondaryText)}
      </Card>

      <Card>
        <CheckRow checked={consent} label={t('onb.consent.single')} onToggle={() => setConsent((v) => !v)} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[4] }}>
          {link(t('onb.consent.kvkk'), () => router.push('/evidence'))}
          {link(t('onb.consent.terms'), () => router.push('/evidence'))}
        </View>
      </Card>

      <View style={{ gap: space[2] }}>
        <Text variant="bodyStrong">{t('onb.consent.language')}</Text>
        <Segmented options={[{ value: 'tr', label: 'Türkçe' }, { value: 'en', label: 'English' }]} value={locale} onChange={setLocale} accessibilityLabel={t('onb.consent.language')} />
      </View>
      <Text variant="caption" tone="muted" center>{t('onb.footnote')}</Text>
    </Screen>
  );
}
