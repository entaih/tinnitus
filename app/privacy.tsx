import React from 'react';
import { View } from 'react-native';
import Constants from 'expo-constants';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { formatDate, useLocale } from '@/i18n';
import { privacyDoc, termsDoc } from '@/content/legal';

/** `/privacy` shows the privacy notice (KVKK aydınlatma); `/privacy?doc=terms` the terms of use. */
export default function PrivacyScreen() {
  const { space } = useTheme();
  const locale = useLocale();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const legal = (Constants.expoConfig?.extra as { legal?: { controller?: string; contact?: string } } | undefined)?.legal;
  // Filled in app.json `extra.legal` before a store build (scripts/release-check.js refuses an empty value).
  const controller = legal?.controller || (locale === 'en' ? 'The app developer' : 'Uygulama geliştiricisi');
  const contact = legal?.contact || '';
  const d = doc === 'terms' ? termsDoc(locale) : privacyDoc(locale, controller, contact);
  return (
    <>
      <Stack.Screen options={{ title: d.title }} />
      <Screen>
        <Text variant="caption" tone="secondary">{formatDate(`${d.updated}T12:00:00`, locale, { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        {d.sections.map((s) => (
          <Card key={s.title}>
            <View style={{ gap: space[2] }}>
              <Text variant="h3" accessibilityRole="header">{s.title}</Text>
              <Text variant="body">{s.body}</Text>
            </View>
          </Card>
        ))}
      </Screen>
    </>
  );
}
