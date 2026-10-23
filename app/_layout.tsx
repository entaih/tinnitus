import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';
import { useSettings } from '@/store/settings';
import { useT } from '@/i18n';
import { getLocales } from 'expo-localization';
import { installNotificationHandler } from '@/notifications';

function Navigator() {
  const { colors, isDark } = useTheme();
  const t = useT();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: t('common.back'),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const { locale, onboarded, setLocale } = useSettings();
  useEffect(() => {
    installNotificationHandler();
    // First launch: follow the device language if it is one we support.
    if (!onboarded) {
      const lang = getLocales()[0]?.languageCode;
      if (lang === 'en' && locale !== 'en') setLocale('en');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Navigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
