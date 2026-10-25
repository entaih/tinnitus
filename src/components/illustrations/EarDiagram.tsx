import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import {
  EAR_CURL, EAR_OUTLINE, IllustrationFrame, Label, Tube, calmTone, hotTone, spiralPath,
  useIllustrationColors, useIllustrationLocale, type IllustrationLocale, type IllustrationProps, type Tone,
} from './shared';
import type { EarRegion } from './causeRegion';

export type EarPart = EarRegion;
export const EAR_PARTS: readonly EarPart[] = ['outer', 'middle', 'inner', 'nerve', 'brain'];

export const EAR_LABELS: Record<IllustrationLocale, Record<EarPart, string>> = {
  tr: { outer: 'Dış kulak', middle: 'Orta kulak', inner: 'İç kulak', nerve: 'Sinir', brain: 'Beyin' },
  en: { outer: 'Outer ear', middle: 'Middle ear', inner: 'Inner ear', nerve: 'Nerve', brain: 'Brain' },
};

export interface EarDiagramProps extends IllustrationProps {
  highlight?: EarPart | null;
  locale?: IllustrationLocale;
}

const W = 320;
const H = 150;
/** Column centres, left to right. */
const CX: Record<EarPart, number> = { outer: 34, middle: 97, inner: 160, nerve: 223, brain: 286 };
const CY = 54;

function defaultLabel(locale: IllustrationLocale, highlight: EarPart | null): string {
  const base = locale === 'tr' ? 'İşitme yolu: dış kulak, orta kulak, iç kulak, sinir ve beyin' : 'Hearing pathway: outer ear, middle ear, inner ear, nerve and brain';
  if (!highlight) return base;
  return `${base}. ${locale === 'tr' ? 'İşaretli bölge' : 'Highlighted'}: ${EAR_LABELS[locale][highlight]}`;
}

/** Simplified hearing pathway, left to right: outer ear → middle ear → inner ear → nerve → brain. */
export function EarDiagram({ highlight = null, locale, width, height, accessibilityLabel }: EarDiagramProps) {
  const c = useIllustrationColors();
  const loc = useIllustrationLocale(locale);
  const tone = (p: EarPart): Tone => (p === highlight ? hotTone(c) : calmTone(c));
  const labels = EAR_LABELS[loc];

  const outer = tone('outer');
  const middle = tone('middle');
  const inner = tone('inner');
  const nerve = tone('nerve');
  const brain = tone('brain');

  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={accessibilityLabel ?? defaultLabel(loc, highlight)}>
      {/* highlight column: warm glow + ring around drawing and label */}
      {highlight ? (
        <Rect x={CX[highlight] - 30} y={3} width={60} height={H - 6} rx={16} fill={c.warningBg} stroke={c.warning} strokeWidth={2.5} />
      ) : null}

      {/* nerve (drawn first so the cochlea and brain sit on top of its ends) */}
      <Tube d="M184 56 C198 36 212 76 226 56 S248 40 262 60" tone={nerve} width={11} />

      {/* inner ear: cochlea spiral with entry from the oval window */}
      <Tube d={`M126 56 L136 56 ${spiralPath(160, CY + 2, 24, 5, 1.7, 180).replace(/^M/, 'L')}`} tone={inner} width={10} />

      {/* outer ear: canal then auricle */}
      <Rect x={36} y={47} width={34} height={15} rx={7.5} fill={outer.fill} stroke={outer.stroke} strokeWidth={3} />
      <G transform="translate(8 12)">
        <Path d={EAR_OUTLINE} fill={outer.fill} stroke={outer.stroke} strokeWidth={3} strokeLinejoin="round" />
        <Path d={EAR_CURL} fill="none" stroke={outer.detail} strokeWidth={3} strokeLinecap="round" />
      </G>

      {/* middle ear: eardrum + hammer, anvil, stirrup */}
      <Ellipse cx={72} cy={CY} rx={5} ry={21} fill={middle.fill} stroke={middle.stroke} strokeWidth={3} />
      <Path d="M76 52 L88 40" stroke={middle.stroke} strokeWidth={7} strokeLinecap="round" />
      <Circle cx={89} cy={39} r={6.5} fill={middle.fill} stroke={middle.stroke} strokeWidth={3} />
      <Circle cx={102} cy={41} r={7} fill={middle.fill} stroke={middle.stroke} strokeWidth={3} />
      <Path d="M104 47 L108 58" stroke={middle.stroke} strokeWidth={6} strokeLinecap="round" />
      {/* stirrup: small arch with a footplate against the inner ear */}
      <Path d="M108 59 C112 47 118 46 122 48 M108 59 C112 70 118 70 122 67" fill="none" stroke={middle.stroke} strokeWidth={4.5} strokeLinecap="round" />
      <Rect x={120} y={45} width={7} height={25} rx={3.5} fill={middle.fill} stroke={middle.stroke} strokeWidth={3} />

      {/* brain + brainstem */}
      <Tube d="M286 70 L288 88" tone={brain} width={11} />
      <Path
        d="M268 66 C258 62 258 46 266 42 C264 32 276 24 286 28 C292 22 306 24 308 34 C316 38 316 54 310 58 C312 68 300 74 292 70 C286 76 272 74 268 66 Z"
        fill={brain.fill} stroke={brain.stroke} strokeWidth={3} strokeLinejoin="round"
      />
      <Path d="M287 30 C283 38 291 44 287 54 C285 60 289 66 292 70 M268 50 C274 47 278 54 284 51 M298 38 C303 44 296 49 302 56" fill="none" stroke={brain.detail} strokeWidth={2.5} strokeLinecap="round" />

      {/* labels */}
      {(Object.keys(CX) as EarPart[]).map((p) => (
        <Label key={p} x={CX[p]} y={124} text={labels[p].replace(' ', '\n')} active={p === highlight} colors={c} size={14} pill={false} />
      ))}
    </IllustrationFrame>
  );
}
