import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, type SeverityBand } from '@/theme';
import { useSettings } from '@/store/settings';
import { Text } from '@/components/Text';

const AnimatedLine = Animated.createAnimatedComponent(Line);

/** THI grade boundaries (McCombe 2001) as fractions of 0–100. */
const BANDS: { band: SeverityBand; from: number; to: number }[] = [
  { band: 'none', from: 0, to: 17 },
  { band: 'mild', from: 17, to: 37 },
  { band: 'moderate', from: 37, to: 57 },
  { band: 'severe', from: 57, to: 77 },
  { band: 'catastrophic', from: 77, to: 100 },
];

function polar(cx: number, cy: number, r: number, value: number) {
  'worklet';
  const a = Math.PI + (Math.max(0, Math.min(100, value)) / 100) * Math.PI;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const p0 = polar(cx, cy, r, from);
  const p1 = polar(cx, cy, r, to);
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/**
 * Semicircular severity gauge (180°, five bands in theme severity colours).
 * The needle animates 800 ms ease-out unless reduced motion is on.
 */
export function Gauge({ value, band, width = 280, label, caption, accessibilityLabel }: {
  value: number; band: SeverityBand; width?: number; label?: string; caption?: string; accessibilityLabel?: string;
}) {
  const { colors, space } = useTheme();
  const reduce = useSettings((s) => s.reduceMotion);
  const stroke = 18;
  const cx = width / 2;
  const r = width / 2 - stroke;
  const cy = r + stroke;
  const height = cy + stroke / 2 + 8;
  const needleLen = r - stroke * 0.9;

  const v = useSharedValue(reduce ? value : 0);
  useEffect(() => {
    v.value = reduce ? value : withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [value, reduce, v]);
  const needleProps = useAnimatedProps(() => {
    const p = polar(cx, cy, needleLen, v.value);
    return { x2: p.x, y2: p.y };
  });

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ alignItems: 'center', gap: space[1] }}>
      <Svg width={width} height={height}>
        {BANDS.map((b) => (
          <Path
            key={b.band}
            d={arc(cx, cy, r, b.from + (b.from === 0 ? 0 : 0.6), b.to - (b.to === 100 ? 0 : 0.6))}
            stroke={colors.severity[b.band].text}
            strokeOpacity={b.band === band ? 1 : 0.35}
            strokeWidth={stroke}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
        <AnimatedLine x1={cx} y1={cy} animatedProps={needleProps} stroke={colors.text} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={9} fill={colors.card} stroke={colors.text} strokeWidth={3} />
      </Svg>
      {label ? <Text variant="numeric" style={{ marginTop: -space[2] }}>{label}</Text> : null}
      {caption ? <Text variant="caption" tone="secondary">{caption}</Text> : null}
    </View>
  );
}
