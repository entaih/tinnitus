import React from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';
import { ArcArrow, Arm, Arrow, DeskScene, FrontBody, FrontHead, Ghost, ProfileFigure, type PoseColors } from './kit';
import { WallTuck } from './cervical';
import { RestPosition } from './orofacial';
import type { PoseDef } from './types';

/** Standing posture check: ear above shoulder (ghost = head forward). */
function Scan(c: PoseColors) {
  const s = 0.94;
  const x = 22;
  const y = -12;
  const ear = [138 * s + x, 76 * s + y];
  const shoulder = [146 * s + x, 150 * s + y];
  return (
    <G>
      <Ghost><ProfileFigure c={c} x={x} y={y} s={s} torso={false} head={{ dx: 20, dy: 8 }} eye={false} /></Ghost>
      <ProfileFigure c={c} x={x} y={y} s={s} />
      <Path d={`M${ear[0]} 6 L${ear[0]} 198`} stroke={c.hot} strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
      <Circle cx={ear[0]} cy={ear[1]} r={6} fill={c.hot} stroke={c.halo} strokeWidth={2} />
      <Circle cx={shoulder[0]} cy={shoulder[1]} r={6} fill={c.hot} stroke={c.halo} strokeWidth={2} />
    </G>
  );
}

/** Shoulders circle up, back and down. */
function ShoulderRolls(c: PoseColors) {
  return (
    <G>
      <FrontBody c={c} />
      <FrontHead c={c} />
      <Ellipse cx={208} cy={148} rx={16} ry={10} fill={c.hot} opacity={0.9} />
      <Ellipse cx={92} cy={148} rx={16} ry={10} fill={c.hot} opacity={0.9} />
      <ArcArrow cx={210} cy={140} r={28} from={150} to={-120} color={c.hot} width={4} />
      <ArcArrow cx={90} cy={140} r={28} from={30} to={300} color={c.hot} width={4} />
    </G>
  );
}

/** Hands clasped behind, chest opens forward, shoulders back. */
function ChestOpen(c: PoseColors) {
  const s = 0.86;
  const x = 18;
  const y = 0;
  const P = (px: number, py: number): [number, number] => [px * s + x, py * s + y];
  return (
    <G>
      <ProfileFigure c={c} x={x} y={y} s={s} />
      <Arm c={c} pts={[P(148, 150), P(128, 186), P(104, 204)]} width={18} straight />
      <Circle cx={P(98, 204)[0]} cy={P(98, 204)[1]} r={11} fill={c.hot} stroke={c.halo} strokeWidth={2.5} />
      <Circle cx={P(108, 210)[0]} cy={P(108, 210)[1]} r={11} fill={c.hot} stroke={c.halo} strokeWidth={2.5} />
      <Arrow pts={[P(214, 172), P(254, 172)]} color={c.hot} />
      <ArcArrow cx={P(150, 150)[0]} cy={P(150, 150)[1]} r={30} from={-30} to={-150} color={c.hot} width={4} />
    </G>
  );
}

export const POSTURE: Record<string, PoseDef> = {
  scan: { draw: Scan },
  wallTuck: { draw: WallTuck },
  shoulderRolls: { draw: ShoulderRolls },
  chestOpen: { draw: ChestOpen },
  jawCheck: { draw: RestPosition },
  ergoSetup: { draw: (c) => <DeskScene c={c} variant="setup" /> },
};
