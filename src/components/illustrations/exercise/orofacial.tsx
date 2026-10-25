import React from 'react';
import { Ellipse, G, Path } from 'react-native-svg';
import { Arm, Arrow, Face, Hand, LoopArrow, MouthCutaway, ProfileFigure, wrist, type PoseColors, type Pt } from './kit';
import { moonPath, sparklePath } from '../shared';
import type { PoseDef } from './types';

/** Lips together, teeth apart, tongue tip on the palate, breathing through the nose. */
export function RestPosition(c: PoseColors) {
  return <MouthCutaway c={c} breath />;
}

/** Fingers make slow circles on the cheek muscle between cheekbone and jaw angle. */
function Masseter(c: PoseColors) {
  const tips: Pt = [196, 124];
  const w = wrist(tips[0], tips[1], -112);
  return (
    <G>
      <Face c={c} />
      <Ellipse cx={194} cy={130} rx={13} ry={24} fill={c.hotBg} stroke={c.hot} strokeWidth={2} strokeDasharray="4 4" />
      <LoopArrow cx={196} cy={124} r={30} color={c.hot} />
      <Arm c={c} pts={[w, [236, 206]]} width={16} />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={-112} />
    </G>
  );
}

/** Fingertip circles on the temple, above the ear. */
function Temporalis(c: PoseColors) {
  const tips: Pt = [200, 64];
  const w = wrist(tips[0], tips[1], 192);
  return (
    <G>
      <Face c={c} />
      <Path d="M182 40 C200 40 214 54 214 76 C206 84 194 86 186 82 C180 68 178 52 182 40 Z" fill={c.hotBg} stroke={c.hot} strokeWidth={2} strokeDasharray="4 4" />
      <LoopArrow cx={200} cy={62} r={28} color={c.hot} />
      <Arm c={c} pts={[w, [262, 130], [262, 206]]} width={16} />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={192} />
    </G>
  );
}

/** Tongue stays on the palate while the mouth opens straight down. */
function Rocabado(c: PoseColors) {
  return (
    <G>
      <Face c={c} o={{ jdy: 22, tongue: true }} />
      <Path d="M150 150 L150 206" stroke={c.feature} strokeWidth={2.5} strokeDasharray="4 6" strokeLinecap="round" />
      <Arrow pts={[[236, 134], [236, 178]]} color={c.hot} />
    </G>
  );
}

/** Lower jaw slides to the side (teeth slightly apart). */
export function Lateral(c: PoseColors) {
  return (
    <G>
      <Face c={c} o={{ jdx: 16, jdy: 5, hotJaw: true, ghostJaw: true }} />
      <Arrow pts={[[136, 194], [184, 194]]} color={c.hot} />
    </G>
  );
}

/** Profile: lower jaw slides forward. */
export function Protrusive(c: PoseColors) {
  const jaw = 'M158 86 L156 106 C168 116 180 121 190 121 C200 120 206 115 209 108 L210 103 L198 103 C186 103 170 98 158 86 Z';
  return (
    <G>
      <ProfileFigure c={c} x={-118} y={-30} s={1.55} torso={false} />
      <G transform="translate(-118 -30) scale(1.55)">
        <Path d={jaw} fill={c.body} stroke={c.hot} strokeWidth={3} strokeLinejoin="round" transform="translate(9 0)" />
      </G>
      <Arrow pts={[[196, 176], [244, 176]]} color={c.hot} />
    </G>
  );
}

/** Jaw hangs down softly with each out-breath. */
function RelaxJaw(c: PoseColors) {
  return (
    <G>
      <Face c={c} o={{ jdy: 8 }} />
      <Arrow pts={[[236, 136], [236, 168]]} color={c.accent} width={4} />
      <Arrow pts={[[64, 136], [64, 168]]} color={c.accent} width={4} />
    </G>
  );
}

/** Night-time clenching: teeth apart by day, night guard from the dentist. */
function Bruxism(c: PoseColors) {
  return (
    <G>
      <Face c={c} o={{ jdy: 6, teeth: true }} />
      <Path d={moonPath(44, 42, 18)} fill={c.accent} />
      <Path d={sparklePath(72, 24, 6)} fill={c.accent} />
      <Path d="M238 146 C238 178 278 178 278 146" stroke={c.hot} strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d="M238 146 C238 178 278 178 278 146" stroke={c.hotBg} strokeWidth={3} strokeLinecap="round" fill="none" />
    </G>
  );
}

export const OROFACIAL: Record<string, PoseDef> = {
  restPosition: { draw: RestPosition },
  masseter: { draw: Masseter, sided: true },
  temporalis: { draw: Temporalis, sided: true },
  rocabado: { draw: Rocabado },
  lateral: { draw: Lateral, sided: true },
  protrusive: { draw: Protrusive },
  relaxJaw: { draw: RelaxJaw },
  bruxism: { draw: Bruxism },
};
