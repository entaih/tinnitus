import React from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';
import {
  EAR_CURL, EAR_OUTLINE, HEAD_PROFILE, IllustrationFrame, Label, Tube, calmTone, heartPath, hotTone,
  useIllustrationColors, useIllustrationLocale, type IllustrationLocale, type IllustrationProps, type Tone,
} from './shared';
import type { HeadRegion } from './causeRegion';

export type HeadPart = HeadRegion;
export const HEAD_PARTS: readonly HeadPart[] = ['jaw', 'neck', 'vessel', 'body'];

export const HEAD_LABELS: Record<IllustrationLocale, Record<HeadPart, string>> = {
  tr: { jaw: 'Çene', neck: 'Boyun', vessel: 'Damar', body: 'Genel sağlık' },
  en: { jaw: 'Jaw', neck: 'Neck', vessel: 'Blood vessel', body: 'General health' },
};

export interface HeadDiagramProps extends IllustrationProps {
  highlight?: HeadPart | null;
  locale?: IllustrationLocale;
}

const W = 320;
const H = 180;
const TORSO = 'M66 182 C66 160 92 144 124 142 L176 142 C210 144 240 160 240 182 Z';
const MUSCLE = 'M131 94 C140 112 137 134 119 153 C113 155 107 152 104 147 C120 131 125 113 124 96 Z';
const VESSEL = 'M148 152 C148 134 142 118 143 104 C143 92 148 84 150 74 L152 62';
const JAW = 'M160 84 L157 106 C172 112 188 114 202 112';

/** Label placement: anchor point on the part, label position, text anchor. */
const PLACES: Record<HeadPart, { from: [number, number]; to: [number, number]; anchor: 'start' | 'end' }> = {
  vessel: { from: [143, 104], to: [92, 82], anchor: 'end' },
  neck: { from: [124, 134], to: [92, 136], anchor: 'end' },
  jaw: { from: [203, 112], to: [234, 108], anchor: 'start' },
  body: { from: [190, 164], to: [234, 160], anchor: 'start' },
};

function defaultLabel(locale: IllustrationLocale, highlight: HeadPart | null): string {
  const base = locale === 'tr' ? 'Baş ve boyun: çene eklemi, boyun kasları, kulak yanındaki damar ve beden' : 'Head and neck: jaw joint, neck muscles, blood vessel near the ear, and body';
  if (!highlight) return base;
  return `${base}. ${locale === 'tr' ? 'İşaretli bölge' : 'Highlighted'}: ${HEAD_LABELS[locale][highlight]}`;
}

/** Head-and-shoulders profile (facing right) showing jaw joint, neck muscles, a vessel near the ear and the body. */
export function HeadDiagram({ highlight = null, locale, width, height, accessibilityLabel }: HeadDiagramProps) {
  const c = useIllustrationColors();
  const loc = useIllustrationLocale(locale);
  const tone = (p: HeadPart): Tone => (p === highlight ? hotTone(c) : calmTone(c));
  const labels = HEAD_LABELS[loc];
  const jaw = tone('jaw');
  const neck = tone('neck');
  const vessel = tone('vessel');
  const body = tone('body');
  const skin = c.card;
  const outline = c.textMuted;

  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={accessibilityLabel ?? defaultLabel(loc, highlight)}>
      {/* body (warm halo when highlighted) */}
      {highlight === 'body' ? <Path d={TORSO} fill="none" stroke={c.warningBg} strokeWidth={16} strokeLinejoin="round" /> : null}
      <Path d={TORSO} fill={body.fill} stroke={body.stroke} strokeWidth={3} strokeLinejoin="round" />
      <Path d={heartPath(180, 164, 10)} fill={body.detail} />

      {/* neck + head (neutral skin) */}
      <Rect x={124} y={118} width={48} height={30} fill={skin} />
      <Path d={HEAD_PROFILE} fill={skin} stroke={outline} strokeWidth={2.5} strokeLinejoin="round" />
      <Rect x={127.5} y={124} width={41} height={22} fill={skin} />
      <Path d="M126 131 L123 146 M170 130 L172 145" stroke={outline} strokeWidth={2.5} strokeLinecap="round" />

      {/* warm halos that follow the highlighted part */}
      {highlight === 'neck' ? <Path d={MUSCLE} fill={c.warningBg} stroke={c.warningBg} strokeWidth={18} strokeLinejoin="round" /> : null}
      {highlight === 'vessel' ? <Path d={VESSEL} fill="none" stroke={c.warningBg} strokeWidth={26} strokeLinecap="round" /> : null}
      {highlight === 'jaw' ? (
        <G>
          <Path d={JAW} fill="none" stroke={c.warningBg} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={160} cy={82} r={17} fill={c.warningBg} />
        </G>
      ) : null}

      {/* neck muscle (back of the neck down to the shoulder) */}
      <Path d={MUSCLE} fill={neck.fill} stroke={neck.stroke} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M128 104 C131 118 127 132 113 146" stroke={neck.detail} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />

      {/* blood vessel running up the neck to the front of the ear */}
      <Tube d={VESSEL} tone={vessel} width={9} />

      {/* ear */}
      <G transform="translate(128 58) scale(0.38)">
        <Path d={EAR_OUTLINE} fill={skin} stroke={outline} strokeWidth={6} strokeLinejoin="round" />
        <Path d={EAR_CURL} fill="none" stroke={outline} strokeWidth={6} strokeLinecap="round" />
      </G>

      {/* jaw bone + joint in front of the ear */}
      <Tube d={JAW} tone={jaw} width={9} />
      <Circle cx={160} cy={82} r={7} fill={jaw.fill} stroke={jaw.stroke} strokeWidth={3} />

      {/* leader lines + labels */}
      {(Object.keys(PLACES) as HeadPart[]).map((p) => {
        const { from, to, anchor } = PLACES[p];
        const active = p === highlight;
        const endX = anchor === 'end' ? to[0] + 12 : to[0] - 12;
        return (
          <G key={p}>
            <Line x1={from[0]} y1={from[1]} x2={endX} y2={to[1]} stroke={active ? c.warning : outline} strokeWidth={active ? 2.5 : 1.8} />
            <Circle cx={from[0]} cy={from[1]} r={3.5} fill={active ? c.warning : outline} />
            <Label x={to[0]} y={to[1]} text={labels[p].replace(' ', '\n')} active={active} colors={c} size={14} anchor={anchor} />
          </G>
        );
      })}
    </IllustrationFrame>
  );
}
