import React from 'react';
import { Tabs } from 'expo-router';
import { House, ClipboardList, AudioWaveform, Brain, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

export default function TabLayout() {
  const { colors } = useTheme();
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tab.home'), tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="assess" options={{ title: t('tab.assess'), tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="sound" options={{ title: t('tab.sound'), tabBarIcon: ({ color, size }) => <AudioWaveform color={color} size={size} /> }} />
      <Tabs.Screen name="mind" options={{ title: t('tab.mind'), tabBarIcon: ({ color, size }) => <Brain color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: t('tab.progress'), tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }} />
    </Tabs>
  );
}
