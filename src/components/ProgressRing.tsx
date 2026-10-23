import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { useSettings } from '@/store/settings';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({ progress, size = 120, stroke = 10, label, caption, color }: { progress: number; size?: number; stroke?: number; label?: string; caption?: string; color?: string }) {
  const { colors } = useTheme();
  const reduce = useSettings((s) => s.reduceMotion);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(reduce ? progress : 0);
  useEffect(() => { p.value = reduce ? progress : withTiming(progress, { duration: 700, easing: Easing.out(Easing.cubic) }); }, [progress, reduce, p]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, p.value))) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={caption} accessible>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primaryTrack} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={color ?? colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} animatedProps={animatedProps} />
      </Svg>
      {label ? <Text variant={size >= 100 ? 'numeric' : 'h2'} style={{ fontSize: size >= 100 ? 32 : 18 }}>{label}</Text> : null}
      {caption ? <Text variant="caption" tone="secondary">{caption}</Text> : null}
    </View>
  );
}
