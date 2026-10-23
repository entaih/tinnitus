import React, { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface Bar { label: string; value: number; color?: string; valueLabel?: string }

interface Props { bars: Bar[]; max: number; height?: number; color?: string; showValues?: boolean }

const PAD = { top: 16, right: 4, bottom: 22, left: 4 };

/** Vertical bar chart on react-native-svg. Not accessible by itself — pair with a text summary. */
export function BarChart({ bars, max, height = 160, color, showValues = true }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(0, height - PAD.top - PAD.bottom);
  const n = Math.max(1, bars.length);
  const slot = plotW / n;
  const barW = Math.max(6, Math.min(32, slot * 0.6));
  const fill = color ?? colors.primary;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const safeMax = max > 0 ? max : 1;
  return (
    <View onLayout={onLayout} style={{ width: '100%', height }} accessible={false} importantForAccessibility="no-hide-descendants">
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Line x1={PAD.left} x2={PAD.left + plotW} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={colors.border} strokeWidth={1} />
          {bars.map((b, i) => {
            const h = Math.max(0, Math.min(1, b.value / safeMax)) * plotH;
            const x = PAD.left + slot * i + (slot - barW) / 2;
            const y = PAD.top + plotH - h;
            const showLabel = n <= 8 || i % Math.ceil(n / 8) === 0;
            return (
              <G key={i}>
                <Rect x={x} y={PAD.top} width={barW} height={plotH} rx={4} fill={colors.skeleton} />
                {h > 0 ? <Rect x={x} y={y} width={barW} height={h} rx={4} fill={b.color ?? fill} /> : null}
                {showValues && b.value > 0 && n <= 12 ? <SvgText x={x + barW / 2} y={y - 4} fontSize={10} fill={colors.textSecondary} textAnchor="middle">{b.valueLabel ?? String(Math.round(b.value))}</SvgText> : null}
                {showLabel ? <SvgText x={x + barW / 2} y={height - 6} fontSize={11} fill={colors.textMuted} textAnchor="middle">{b.label}</SvgText> : null}
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
