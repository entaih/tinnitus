import React, { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { useSettings } from '@/store/settings';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface LinePoint { x: number; y: number }
export interface LineSeries { points: LinePoint[]; color: string; width?: number; dashed?: boolean; dots?: boolean; opacity?: number }
export interface Band { from: number; to: number; color: string; opacity?: number }
export interface AxisLabel { value: number; label: string }

interface Props {
  series: LineSeries[];
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  bands?: Band[];
  hLines?: { y: number; color: string; dashed?: boolean }[];
  xLabels?: AxisLabel[];
  yLabels?: AxisLabel[];
  height?: number;
}

const PAD = { top: 8, right: 8, bottom: 22, left: 30 };

/**
 * Minimal line chart on react-native-svg (no chart libs). Draws background bands, grid, series, points and
 * axis labels; the lines reveal left-to-right in 600 ms (static under reduced motion).
 * The SVG itself is not accessible — put the text summary in a sibling (see ChartCard).
 */
export function LineChart({ series, xMin, xMax, yMin, yMax, bands = [], hLines = [], xLabels = [], yLabels = [], height = 180 }: Props) {
  const { colors } = useTheme();
  const reduce = useSettings((s) => s.reduceMotion);
  const [width, setWidth] = useState(0);
  const reveal = useSharedValue(reduce ? 1 : 0);
  useEffect(() => { reveal.value = reduce ? 1 : withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }); }, [reduce, reveal, series]);
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(0, height - PAD.top - PAD.bottom);
  const sx = (x: number) => PAD.left + (xMax === xMin ? plotW / 2 : ((x - xMin) / (xMax - xMin)) * plotW);
  const sy = (y: number) => PAD.top + (yMax === yMin ? plotH / 2 : (1 - (y - yMin) / (yMax - yMin)) * plotH);
  const clipProps = useAnimatedProps(() => ({ width: Math.max(0, plotW * reveal.value) }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View onLayout={onLayout} style={{ width: '100%', height }} accessible={false} importantForAccessibility="no-hide-descendants">
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <ClipPath id="reveal">
              <AnimatedRect x={PAD.left} y={0} height={height} animatedProps={clipProps} />
            </ClipPath>
          </Defs>
          {bands.map((b, i) => {
            const y1 = sy(Math.min(yMax, Math.max(yMin, b.to)));
            const y2 = sy(Math.min(yMax, Math.max(yMin, b.from)));
            return <Rect key={`b${i}`} x={PAD.left} y={y1} width={plotW} height={Math.max(0, y2 - y1)} fill={b.color} opacity={b.opacity ?? 0.18} />;
          })}
          {yLabels.map((l, i) => (
            <G key={`y${i}`}>
              <Line x1={PAD.left} x2={PAD.left + plotW} y1={sy(l.value)} y2={sy(l.value)} stroke={colors.chart.grid} strokeWidth={1} />
              <SvgText x={PAD.left - 6} y={sy(l.value) + 4} fontSize={11} fill={colors.textMuted} textAnchor="end">{l.label}</SvgText>
            </G>
          ))}
          {hLines.map((h, i) => (
            <Line key={`h${i}`} x1={PAD.left} x2={PAD.left + plotW} y1={sy(h.y)} y2={sy(h.y)} stroke={h.color} strokeWidth={1} strokeDasharray={h.dashed ? '4 4' : undefined} />
          ))}
          <G clipPath="url(#reveal)">
            {series.map((s, i) => {
              const pts = s.points.filter((p) => Number.isFinite(p.y));
              if (!pts.length) return null;
              const str = pts.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
              return (
                <G key={`s${i}`} opacity={s.opacity ?? 1}>
                  {pts.length > 1 ? <Polyline points={str} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '5 4' : undefined} /> : null}
                  {s.dots !== false && pts.length <= 60 ? pts.map((p, j) => <Circle key={j} cx={sx(p.x)} cy={sy(p.y)} r={pts.length > 20 ? 2 : 4} fill={s.color} stroke={colors.card} strokeWidth={1.5} />) : null}
                </G>
              );
            })}
          </G>
          {xLabels.map((l, i) => (
            <SvgText key={`x${i}`} x={sx(l.value)} y={height - 6} fontSize={11} fill={colors.textMuted} textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}>{l.label}</SvgText>
          ))}
          <Line x1={PAD.left} x2={PAD.left + plotW} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={colors.border} strokeWidth={1} />
        </Svg>
      ) : null}
    </View>
  );
}

/** Simple trailing moving average (window n) over an ordered numeric series. */
export function movingAverage(values: number[], n = 7): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - n + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}
