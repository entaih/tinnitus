import React from 'react';
import { Platform, View } from 'react-native';
import { Svg, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme, type ThemeColors } from '@/theme';
import { useLocale } from '@/i18n';

export type IllustrationLocale = 'tr' | 'en';

/** SVG text falls back to a serif face on web; native uses the system font when unset. */
export const SVG_FONT: string | undefined = Platform.OS === 'web' ? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' : undefined;

/** Props every illustration accepts. Width/height scale the drawing (viewBox); pass one to keep the aspect ratio. */
export interface IllustrationProps {
  width?: number;
  height?: number;
  accessibilityLabel?: string;
}

/** Resolve the label locale: explicit prop, else the app setting. */
export function useIllustrationLocale(locale?: IllustrationLocale): IllustrationLocale {
  const appLocale = useLocale();
  return locale ?? appLocale;
}

/** Fill/stroke/detail colours for one drawn part. */
export interface Tone {
  fill: string;
  stroke: string;
  /** small inner lines drawn on top of the fill */
  detail: string;
  /** inner core colour of tube-shaped parts (nerve, cochlea, vessel) */
  core: string;
}

export function calmTone(c: ThemeColors): Tone {
  return { fill: c.primaryTrack, stroke: c.primary, detail: c.primary, core: c.primaryTrack };
}

export function hotTone(c: ThemeColors): Tone {
  return { fill: c.warning, stroke: c.warning, detail: c.warningBg, core: c.accent };
}

export function useIllustrationColors() {
  return useTheme().colors;
}

/** Outer frame: accessible View (role image) + Svg scaled from the default viewBox. */
export function IllustrationFrame({ vbWidth, vbHeight, width, height, label, children }: {
  vbWidth: number; vbHeight: number; width?: number; height?: number; label: string; children: React.ReactNode;
}) {
  const w = width ?? (height != null ? (height * vbWidth) / vbHeight : vbWidth);
  const h = height ?? (width != null ? (width * vbHeight) / vbWidth : vbHeight);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${vbWidth} ${vbHeight}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {children}
      </Svg>
    </View>
  );
}

/** Thick "tube" stroke: a darker outline with a lighter core (or solid when both colours match). */
export function Tube({ d, tone, width = 10 }: { d: string; tone: Tone; width?: number }) {
  return (
    <G>
      <Path d={d} stroke={tone.stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={d} stroke={tone.core} strokeWidth={Math.max(2, width - 5)} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  );
}

/** Rough text width for bold system font, used to size label pills. */
export function textWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) w += /[MWmw]/.test(ch) ? 0.9 : /[iIl.ıİ' ]/.test(ch) ? 0.32 : 0.62;
  return w * size;
}

/** One- or two-line centred label (split on '\n'). Active labels get a warm pill. */
export function Label({ x, y, text, active, colors, size = 14, anchor = 'middle', pill = true }: {
  x: number; y: number; text: string; active: boolean; colors: ThemeColors; size?: number;
  anchor?: 'start' | 'middle' | 'end'; pill?: boolean;
}) {
  const lines = text.split('\n');
  const lh = size + 3;
  const top = y - ((lines.length - 1) * lh) / 2; // y = vertical centre of the block
  const maxW = Math.max(...lines.map((l) => textWidth(l, size)));
  const padX = 8;
  const boxW = maxW + padX * 2;
  const boxH = lines.length * lh + 8;
  const boxX = anchor === 'middle' ? x - boxW / 2 : anchor === 'start' ? x - padX : x - boxW + padX;
  return (
    <G>
      {active && pill ? <Rect x={boxX} y={top - lh / 2 - 4} width={boxW} height={boxH} rx={boxH / 2 > 14 ? 12 : boxH / 2} fill={colors.warningBg} stroke={colors.warning} strokeWidth={2} /> : null}
      {lines.map((l, i) => (
        <SvgText key={i} x={x} y={top + i * lh + size * 0.36} fontSize={size} fontWeight="700" fontFamily={SVG_FONT} textAnchor={anchor} fill={active ? colors.warning : colors.text}>
          {l}
        </SvgText>
      ))}
    </G>
  );
}

// ---------- geometry helpers ----------

const rad = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => Math.round(n * 10) / 10;

/** Circular arc path, angles in degrees, 0 = right, clockwise on screen. */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${f(x0)} ${f(y0)} A${r} ${r} 0 ${large} ${sweep} ${f(x1)} ${f(y1)}`;
}

/** Inward spiral starting at angle `start` on the outer radius. */
export function spiralPath(cx: number, cy: number, rOuter: number, rInner: number, turns: number, start = 180): string {
  const steps = Math.round(turns * 36);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = rOuter - (rOuter - rInner) * t;
    const a = rad(start + t * turns * 360);
    pts.push(`${i === 0 ? 'M' : 'L'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`);
  }
  return pts.join(' ');
}

export function heartPath(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.3} ${cy + s * 0.05} ${cx - s * 0.95} ${cy - s * 1.05} ${cx} ${cy - s * 0.4} C${cx + s * 0.95} ${cy - s * 1.05} ${cx + s * 1.3} ${cy + s * 0.05} ${cx} ${cy + s * 0.9} Z`;
}

/** Crescent moon, horns pointing right. */
export function moonPath(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 0.62} ${r} 0 1 1 ${cx} ${cy - r} Z`;
}

/** Four-point sparkle star. */
export function sparklePath(cx: number, cy: number, r: number): string {
  const k = r * 0.28;
  return `M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r} Z`;
}

export function leafPath(cx: number, cy: number, s: number): string {
  return `M${cx - s} ${cy + s} C${cx - s * 1.1} ${cy - s * 0.4} ${cx - s * 0.2} ${cy - s} ${cx + s} ${cy - s} C${cx + s} ${cy - s * 0.1} ${cx + s * 0.5} ${cy + s * 1.05} ${cx - s} ${cy + s} Z`;
}

/**
 * Ear (auricle) seen from the side, rim on the left, opening on the right.
 * Drawn in a 48 x 90 box with its top-left at (0, 0); position with a G transform.
 */
export const EAR_OUTLINE = 'M30 2 C12 0 0 16 2 36 C4 50 12 58 14 70 C16 84 30 90 36 78 L38 54 C44 36 44 16 30 2 Z';
export const EAR_CURL = 'M30 16 C18 16 14 30 18 40 C22 48 30 46 32 42';

/**
 * Head in profile facing right (skull + face + top of neck). Spans x 100..220, y 14..132.
 * The ear sits around (138, 74).
 */
export const HEAD_PROFILE =
  'M126 132 C110 112 100 90 102 64 C104 34 128 14 158 14 C186 14 204 34 206 58 L207 66 C209 72 216 80 219 86 C220 90 216 92 211 92 L211 97 C213 100 212 103 209 104 C211 107 210 111 205 113 C201 119 191 121 182 120 C174 120 170 124 170 132 Z';
