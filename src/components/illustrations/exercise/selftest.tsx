import React from 'react';
import { Ellipse, G } from 'react-native-svg';
import { ArcArrow, Arm, Arrow, Face, FrontBody, FrontHead, Hand, PressSpot, ProfileFigure, arcPts, wrist, type PoseColors, type Pt } from './kit';
import { Lateral, Protrusive } from './orofacial';
import type { PoseDef } from './types';

/** Teeth clenched: both chewing muscles work. */
function Clench(c: PoseColors) {
  return (
    <G>
      <Face c={c} o={{ teeth: true, effort: true }} />
      <Ellipse cx={104} cy={136} rx={11} ry={20} fill={c.hotBg} stroke={c.hot} strokeWidth={2} strokeDasharray="4 4" />
      <Ellipse cx={196} cy={136} rx={11} ry={20} fill={c.hotBg} stroke={c.hot} strokeWidth={2} strokeDasharray="4 4" />
      <Arrow pts={[[70, 190], [70, 160]]} color={c.hot} />
      <Arrow pts={[[230, 190], [230, 160]]} color={c.hot} />
    </G>
  );
}

/** Hand on the right temple blocks the head turning right (head does not move). */
function RotRes(c: PoseColors) {
  const tips: Pt = [181, 36];
  const w = wrist(tips[0], tips[1], -95, 'flat');
  return (
    <G>
      <FrontBody c={c} />
      <FrontHead c={c} pose={{ closed: false }} />
      <Arrow pts={arcPts(150, 22, 40, 10, 115, 10)} color={c.hot} />
      <Arm c={c} pts={[[204, 152], [236, 124], w]} straight />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={-95} kind="flat" />
    </G>
  );
}

/** Profile: hand on the forehead blocks the head bending forward. */
function FlexRes(c: PoseColors) {
  const s = 0.92;
  const x = 4;
  const y = 4;
  const P = (px: number, py: number): Pt => [px * s + x, py * s + y];
  const tips = P(205, 24);
  const w = wrist(tips[0], tips[1], -84, 'flat');
  return (
    <G>
      <ProfileFigure c={c} x={x} y={y} s={s} />
      <ArcArrow cx={P(150, 110)[0]} cy={P(150, 110)[1]} r={96} from={-98} to={-58} color={c.hot} />
      <Arm c={c} pts={[P(162, 152), P(250, 152), w]} straight />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={-84} kind="flat" />
    </G>
  );
}

/** Fingers of both hands press the temples. */
function Temples(c: PoseColors) {
  const side = (mirror: boolean) => {
    const tips: Pt = [200, 64];
    const w = wrist(tips[0], tips[1], 192);
    return (
      <G transform={mirror ? 'translate(300 0) scale(-1 1)' : undefined}>
        <PressSpot c={c} x={tips[0]} y={tips[1]} r={14} />
        <Arm c={c} pts={[w, [262, 130], [262, 206]]} width={16} />
        <Hand c={c} x={tips[0]} y={tips[1]} angle={192} />
      </G>
    );
  };
  return (
    <G>
      <Face c={c} />
      {side(false)}
      {side(true)}
    </G>
  );
}

/** Profile close-up: a finger presses the bony bump behind the ear lobe. */
function Mastoid(c: PoseColors) {
  const s = 1.55;
  const x = -118;
  const y = -30;
  const tips: Pt = [123 * s + x, 95 * s + y];
  const w = wrist(tips[0], tips[1], -8);
  return (
    <G>
      <ProfileFigure c={c} x={x} y={y} s={s} torso={false} />
      <PressSpot c={c} x={tips[0]} y={tips[1]} r={15} />
      <Arm c={c} pts={[w, [20, 150], [10, 206]]} width={16} />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={-8} />
    </G>
  );
}

export const SELF_TEST_POSES: Record<string, PoseDef> = {
  clench: { draw: Clench },
  protrusion: { draw: Protrusive },
  lateralL: { draw: Lateral, fixedSide: 'left' },
  lateralR: { draw: Lateral, fixedSide: 'right' },
  rotResL: { draw: RotRes, fixedSide: 'left' },
  rotResR: { draw: RotRes, fixedSide: 'right' },
  flexRes: { draw: FlexRes },
  temples: { draw: Temples },
  mastoid: { draw: Mastoid },
};
