import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack, router, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text as RNText, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';
import { useSettings } from '@/store/settings';
import { useT } from '@/i18n';
import { getLocales } from 'expo-localization';
import { installNotificationHandler } from '@/notifications';
import { bootProfiles } from '@/store/profileSwitch';

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
  // People profiles: load the active person's stores before the first screen renders (a few ms from AsyncStorage).
  const [profilesReady, setProfilesReady] = useState(false);
  useEffect(() => { void bootProfiles().finally(() => setProfilesReady(true)); }, []);
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
          {profilesReady ? <Navigator /> : null}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Friendly last-resort screen: any render error below the root shows this instead of a blank screen.
 * Plain React Native primitives only (the theme or i18n may be what failed). Data stays on the device.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const tr = useSettings.getState().locale !== 'en';
  const button = (label: string, onPress: () => void, primary: boolean) => (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? '#4F46E5' : 'transparent', opacity: pressed ? 0.8 : 1, alignSelf: 'stretch' })}>
      <RNText style={{ color: primary ? '#FFFFFF' : '#4F46E5', fontSize: 17, fontWeight: '600' }}>{label}</RNText>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7FB', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <RNText accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' }}>{tr ? 'Bir şeyler ters gitti' : 'Something went wrong'}</RNText>
      <RNText style={{ fontSize: 17, lineHeight: 24, color: '#4B5563', textAlign: 'center' }}>{tr ? 'Verileriniz güvende. Tekrar deneyin; olmazsa ana sayfaya dönün.' : 'Your data is safe. Try again, or go back to the home screen.'}</RNText>
      {button(tr ? 'Tekrar dene' : 'Try again', () => { void retry(); }, true)}
      {button(tr ? 'Ana sayfaya dön' : 'Go to home', () => { router.replace('/'); }, false)}
    </View>
  );
}
