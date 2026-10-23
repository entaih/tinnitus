import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';

interface Props {
  /** Seconds remaining. */
  remaining: number;
  /** Total seconds. */
  total: number;
  size?: number;
  stroke?: number;
  caption?: string;
  accessibilityLabel?: string;
}

/** Static (reduced-motion friendly) countdown ring; re-rendered once per second by the caller. */
export function CountdownRing({ remaining, total, size = 160, stroke = 10, caption, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const mm = Math.floor(Math.max(0, remaining) / 60);
  const ss = Math.max(0, Math.round(remaining)) % 60;
  const label = mm > 0 ? `${mm}:${String(ss).padStart(2, '0')}` : `${ss}`;
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? `${Math.round(remaining)} s`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primaryTrack} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - frac)} />
      </Svg>
      <Text variant="numeric">{label}</Text>
      {caption ? <Text variant="caption" tone="secondary">{caption}</Text> : null}
    </View>
  );
}
