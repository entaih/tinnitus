import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import {
  EAR_CURL, EAR_OUTLINE, HEAD_PROFILE, IllustrationFrame, arcPath, moonPath, sparklePath,
  useIllustrationColors, useIllustrationLocale, type IllustrationProps,
} from './shared';

const W = 280;
const H = 180;
const EAR: [number, number] = [178, 108];

/** Calm hero: a head in profile with soft sound waves fading out from the ear, under a small moon. No text. */
export function WelcomeArt({ width, height, accessibilityLabel }: IllustrationProps) {
  const c = useIllustrationColors();
  const loc = useIllustrationLocale();
  const label = accessibilityLabel ?? (loc === 'tr' ? 'Kulağından yumuşak ses dalgaları uzaklaşan sakin bir insan başı' : 'A calm person with soft sound waves fading away from the ear');
  const waves = [54, 74, 94, 114];
  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={label}>
      <Circle cx={150} cy={96} r={84} fill={c.primarySoft} />
      <Ellipse cx={150} cy={176} rx={128} ry={12} fill={c.primaryTrack} />

      {/* moon + stars */}
      <Path d={moonPath(38, 38, 17)} fill={c.accent} />
      <Path d={sparklePath(68, 22, 6)} fill={c.accent} />
      <Path d={sparklePath(62, 58, 4.5)} fill={c.accent} opacity={0.7} />

      {/* sound waves fading out behind the head */}
      {waves.map((r, i) => (
        <Path key={r} d={arcPath(EAR[0], EAR[1], r, 146, 214)} stroke={c.primary} strokeWidth={7 - i} strokeLinecap="round" fill="none" opacity={0.85 - i * 0.22} />
      ))}

      {/* person */}
      <Path d="M126 182 C128 168 148 160 168 158 L210 158 C238 160 256 170 258 182 Z" fill={c.primary} />
      <Rect x={166} y={146} width={44} height={20} fill={c.primary} />
      <G transform="translate(40 34)">
        <Path d={HEAD_PROFILE} fill={c.primary} />
      </G>
      <G transform="translate(168 90) scale(0.42)">
        <Path d={EAR_OUTLINE} fill={c.primaryTrack} />
        <Path d={EAR_CURL} fill="none" stroke={c.primary} strokeWidth={6} strokeLinecap="round" />
      </G>
      {/* closed, relaxed eye */}
      <Path d={arcPath(230, 88, 6, 20, 160)} stroke={c.primaryTrack} strokeWidth={3} strokeLinecap="round" fill="none" />
    </IllustrationFrame>
  );
}
