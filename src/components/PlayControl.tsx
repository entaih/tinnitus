import React from 'react';
import { Pressable, View } from 'react-native';
import { Pause, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

export function PlayControl({ playing, onPress, size = 88, onLongPress, accessibilityLabel }: { playing: boolean; onPress: () => void; size?: number; onLongPress?: () => void; accessibilityLabel?: string }) {
  const { colors, shadow, night } = useTheme();
  const Icon = playing ? Pause : Play;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: playing }}
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      onLongPress={onLongPress}
      style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: night ? colors.primaryTrack : colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.97 : 1 }] }, shadow.e3]}
    >
      <View style={{ marginLeft: playing ? 0 : size * 0.05 }}>
        <Icon size={size * 0.42} color={night ? colors.primary : colors.onPrimary} fill={night ? colors.primary : colors.onPrimary} />
      </View>
    </Pressable>
  );
}
