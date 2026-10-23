import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'idle' | 'done';

interface Props {
  phase: BreathPhase;
  /** Length of the current phase in ms (drives the scale animation). */
  durationMs: number;
  label: string;
  remainingSec: number;
  /** Static circle + progress bar instead of scaling. */
  reduceMotion?: boolean;
  /** 0..1 progress through the current phase (used by the reduced-motion bar). */
  phaseProgress?: number;
  size?: number;
}

/**
 * Breathing circle per DESIGN §8: 160 pt, primary.100 fill, primary.300 2 px ring over a soft glow.
 * Scale 1 → 1.6 on inhale, steady (ring opacity pulses) on hold, 1.6 → 1 on exhale.
 */
export function BreathingCircle({ phase, durationMs, label, remainingSec, reduceMotion, phaseProgress = 0, size = 160 }: Props) {
  const { colors, night, space, radius } = useTheme();
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) { scale.value = 1; ringOpacity.value = 1; return; }
    cancelAnimation(ringOpacity);
    const easing = Easing.inOut(Easing.cubic);
    switch (phase) {
      case 'inhale':
        ringOpacity.value = 1;
        scale.value = withTiming(1.6, { duration: durationMs, easing });
        break;
      case 'hold':
        scale.value = withTiming(1.6, { duration: 150 });
        ringOpacity.value = withRepeat(withSequence(withTiming(0.6, { duration: 900, easing }), withTiming(1, { duration: 900, easing })), -1, false);
        break;
      case 'exhale':
        ringOpacity.value = 1;
        scale.value = withTiming(1, { duration: durationMs, easing });
        break;
      default:
        ringOpacity.value = 1;
        scale.value = withTiming(1, { duration: 300, easing });
    }
  }, [phase, durationMs, reduceMotion, scale, ringOpacity]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));
  const outer = size * 1.7;

  return (
    <View style={{ alignItems: 'center', gap: space[4] }}>
      <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${label}. ${remainingSec}`}>
        {/* soft radial glow (approximated with a large low-alpha disc; dimmed to 40 % in night mode) */}
        <View style={{ position: 'absolute', width: outer, height: outer, borderRadius: outer / 2, backgroundColor: colors.primarySoft, opacity: night ? 0.4 : 0.9 }} />
        <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryTrack, alignItems: 'center', justifyContent: 'center' }, circleStyle]}>
          <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: colors.primary }, ringStyle]} />
          <Text variant="numeric" style={{ fontSize: 28, lineHeight: 34 }} accessibilityElementsHidden>{phase === 'idle' || phase === 'done' ? '' : String(remainingSec)}</Text>
        </Animated.View>
      </View>
      <Text variant="h2" center accessibilityLiveRegion="polite">{label}</Text>
      {reduceMotion ? (
        <View style={{ width: size * 1.4, height: 8, borderRadius: radius.full, backgroundColor: colors.primaryTrack, overflow: 'hidden' }} accessibilityElementsHidden>
          <View style={{ width: `${Math.round(Math.max(0, Math.min(1, phaseProgress)) * 100)}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
      ) : null}
    </View>
  );
}
