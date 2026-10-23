import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';
import { SCREENING_FREQS, SCREENING_UNCERTAINTY_DB } from '@/audio/psychoacoustics';

export interface AudiogramPoint { freq: number; /** dB re device reference (≤ 0); undefined = not heard at cap */ levelDb?: number }

interface Props {
  ear: 'left' | 'right' | 'both';
  points: AudiogramPoint[];
  width?: number;
  height?: number;
  /** Half-width of the shaded uncertainty band in dB. */
  bandDb?: number;
  minDb?: number;
  maxDb?: number;
}

/**
 * Screening "audiogram": log-frequency x-axis, level y-axis with the loud end (0 dB) at the bottom so a
 * worse threshold sits lower, as on a clinical chart. The ear is encoded by the marker shape (O right,
 * X left) and by the title, never by colour alone. One series per chart, so no legend is needed.
 */
export function AudiogramChart({ ear, points, width = 320, height = 200, bandDb = SCREENING_UNCERTAINTY_DB, minDb = -70, maxDb = 0 }: Props) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const pad = { l: 40, r: 12, t: 12, b: 28 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const freqs = SCREENING_FREQS as readonly number[];
  const lf0 = Math.log2(freqs[0]);
  const lf1 = Math.log2(freqs[freqs.length - 1]);
  const x = (f: number) => pad.l + ((Math.log2(f) - lf0) / (lf1 - lf0)) * iw;
  const y = (db: number) => pad.t + ((db - minDb) / (maxDb - minDb)) * ih; // minDb (soft) at top, 0 at bottom
  const clampY = (db: number) => y(Math.max(minDb, Math.min(maxDb, db)));

  const heard = points.filter((p): p is Required<AudiogramPoint> => p.levelDb != null).sort((a, b) => a.freq - b.freq);
  const linePath = heard.map((p, i) => `${i ? 'L' : 'M'}${x(p.freq).toFixed(1)},${y(p.levelDb).toFixed(1)}`).join(' ');
  const bandPath = heard.length >= 2
    ? [
      ...heard.map((p, i) => `${i ? 'L' : 'M'}${x(p.freq).toFixed(1)},${clampY(p.levelDb - bandDb).toFixed(1)}`),
      ...[...heard].reverse().map((p) => `L${x(p.freq).toFixed(1)},${clampY(p.levelDb + bandDb).toFixed(1)}`),
      'Z',
    ].join(' ')
    : '';

  const series = ear === 'left' ? colors.chart.thi : colors.chart.annoyance;
  const earLabel = t(`psy.hear.ear.${ear}`);
  const summary = points.map((p) => `${p.freq} Hz: ${p.levelDb != null ? `${Math.round(p.levelDb)} dB` : t('psy.hear.chart.notHeard')}`).join(', ');
  const gridDb = [-70, -60, -50, -40, -30, -20, -10, 0];
  const mark = 5;

  return (
    <View style={{ gap: space[2] }}>
      <Text variant="bodyStrong">{earLabel}</Text>
      <View accessible accessibilityLabel={t('psy.hear.chart.a11y', { ear: earLabel, summary })} style={{ backgroundColor: colors.card, borderRadius: radius.md }}>
        <Svg width={width} height={height} accessible={false}>
          {gridDb.map((db) => (
            <G key={db}>
              <Line x1={pad.l} x2={pad.l + iw} y1={y(db)} y2={y(db)} stroke={colors.chart.grid} strokeWidth={1} />
              <SvgText x={pad.l - 6} y={y(db) + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">{db}</SvgText>
            </G>
          ))}
          {freqs.map((f) => (
            <G key={f}>
              <Line x1={x(f)} x2={x(f)} y1={pad.t} y2={pad.t + ih} stroke={colors.chart.grid} strokeWidth={1} />
              <SvgText x={x(f)} y={height - 10} fontSize={10} fill={colors.textMuted} textAnchor="middle">{f >= 1000 ? `${f / 1000}k` : f}</SvgText>
            </G>
          ))}
          {bandPath ? <Path d={bandPath} fill={series} fillOpacity={0.14} stroke="none" /> : null}
          {heard.length >= 2 ? <Path d={linePath} stroke={series} strokeWidth={2} fill="none" strokeLinejoin="round" /> : null}
          {heard.map((p) => (
            ear === 'left' ? (
              <G key={p.freq}>
                <Line x1={x(p.freq) - mark} x2={x(p.freq) + mark} y1={y(p.levelDb) - mark} y2={y(p.levelDb) + mark} stroke={series} strokeWidth={2} />
                <Line x1={x(p.freq) - mark} x2={x(p.freq) + mark} y1={y(p.levelDb) + mark} y2={y(p.levelDb) - mark} stroke={series} strokeWidth={2} />
              </G>
            ) : (
              <Circle key={p.freq} cx={x(p.freq)} cy={y(p.levelDb)} r={mark} stroke={series} strokeWidth={2} fill={colors.card} />
            )
          ))}
          {points.filter((p) => p.levelDb == null).map((p) => (
            // not heard at the cap: downward arrow at the bottom edge
            <G key={`nh-${p.freq}`}>
              <Line x1={x(p.freq)} x2={x(p.freq)} y1={y(maxDb) - 12} y2={y(maxDb) - 2} stroke={colors.textMuted} strokeWidth={2} />
              <Path d={`M${x(p.freq) - 4},${y(maxDb) - 7} L${x(p.freq)},${y(maxDb) - 2} L${x(p.freq) + 4},${y(maxDb) - 7}`} stroke={colors.textMuted} strokeWidth={2} fill="none" />
            </G>
          ))}
        </Svg>
      </View>
      <Text variant="caption" tone="muted">{t('psy.hear.unit')} · {t('psy.hear.band')}</Text>
    </View>
  );
}
