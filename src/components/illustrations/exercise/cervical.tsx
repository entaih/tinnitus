import React from 'react';
import { G, Path, Rect } from 'react-native-svg';
import {
  ArcArrow, Arm, Arrow, Band, DeskScene, FB, FrontBody, FrontHead, Ghost, Hand, LY, LyingFigure, PressSpot, ProfileFigure, Wall, arcPts, wrist,
  type PoseColors, type Pt,
} from './kit';
import type { PoseDef } from './types';

/** Standing with back and head against a wall, chin glides straight back (ghost = head poking forward). */
export function WallTuck(c: PoseColors) {
  return (
    <G>
      <Wall c={c} x={100} />
      <Ghost><ProfileFigure c={c} y={-10} torso={false} head={{ dx: 18, dy: 6 }} eye={false} /></Ghost>
      <ProfileFigure c={c} y={-10} head={{ hot: true }} />
      <Band c={c} d="M109 84 C111 100 116 110 124 120" width={7} />
      <Arrow pts={[[272, 94], [232, 94]]} color={c.hot} />
    </G>
  );
}

/** Lying on the back, towel under the head, tiny "yes" nod; two fingers check the front of the neck. */
function Ccf(c: PoseColors) {
  const tips: Pt = [108, 117];
  const w = wrist(tips[0], tips[1], 100, 'tips', 0.85);
  return (
    <G>
      <Rect x={28} y={LY.floor - 8} width={86} height={9} rx={4} fill={c.accent} opacity={0.55} />
      <Ghost><LyingFigure c={c} headRot={-14} headOnly /></Ghost>
      <LyingFigure c={c} />
      <ArcArrow cx={LY.X} cy={LY.Y} r={58} from={-118} to={-58} color={c.hot} />
      <Arm c={c} pts={[[128, 150], [150, 96], w]} width={14} straight />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={100} scale={0.85} />
    </G>
  );
}

/** Seated, head turns to the right; curved arrow over the head. */
function Rotation(c: PoseColors) {
  return (
    <G>
      <FrontBody c={c} />
      <FrontHead c={c} pose={{ turn: 1, hot: true }} />
      <Arrow pts={arcPts(150, 24, 46, 11, 120, -12)} color={c.hot} />
    </G>
  );
}

/** Ear towards the shoulder (tilt right), shoulder stays down. */
function SideFlexion(c: PoseColors) {
  return (
    <G>
      <FrontBody c={c} />
      <Ghost><FrontHead c={c} pose={{ plain: true }} /></Ghost>
      <FrontHead c={c} pose={{ tilt: 24, hot: true }} />
      <ArcArrow cx={FB.pivot[0]} cy={FB.pivot[1]} r={98} from={-100} to={-60} color={c.hot} />
      <Arrow pts={[[222, 118], [222, 140]]} color={c.accent} width={4} head={9} />
    </G>
  );
}

const SCAP_R = 'M170 146 L206 150 C204 162 196 180 182 194 C176 182 172 164 170 146 Z';

/** Back view: shoulder blades pulled together and down ("into the back pockets"). */
function Scapular(c: PoseColors) {
  /** both blades; dx moves them towards the spine, dy down */
  const pair = (fill: string, dx: number, dy: number) => (
    <G>
      <Path d={SCAP_R} fill={fill} transform={`translate(${-dx} ${dy})`} />
      <G transform="translate(300 0) scale(-1 1)"><Path d={SCAP_R} fill={fill} transform={`translate(${-dx} ${dy})`} /></G>
    </G>
  );
  return (
    <G>
      <FrontBody c={c} spine />
      <FrontHead c={c} pose={{ plain: true }} />
      <G opacity={0.45}>{pair(c.feature, -6, -6)}</G>
      {pair(c.hot, 6, 4)}
      <Arrow pts={[[226, 140], [204, 166]]} color={c.hot} />
      <Arrow pts={[[74, 140], [96, 166]]} color={c.hot} />
    </G>
  );
}

/** Opposite hand presses the most tender spot of the upper trapezius. */
function TriggerTrap(c: PoseColors) {
  const tips: Pt = [190, 141];
  const w = wrist(tips[0], tips[1], 68);
  return (
    <G>
      <FrontBody c={c} />
      <FrontHead c={c} />
      <Band c={c} d={FB.trapR} />
      <PressSpot c={c} x={tips[0]} y={tips[1]} />
      <Arm c={c} pts={[[100, 152], [140, 186], w]} straight />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={68} />
    </G>
  );
}

/** Back view: fingers on the upper inner corner of the shoulder blade (levator scapulae). */
function TriggerLevator(c: PoseColors) {
  const tips: Pt = [178, 148];
  return (
    <G>
      <FrontBody c={c} spine />
      <FrontHead c={c} pose={{ plain: true }} />
      <Path d={SCAP_R} fill="none" stroke={c.feature} strokeWidth={2.5} opacity={0.7} />
      <G transform="translate(300 0) scale(-1 1)"><Path d={SCAP_R} fill="none" stroke={c.feature} strokeWidth={2.5} opacity={0.7} /></G>
      <Band c={c} d="M160 104 C166 120 172 134 176 148" width={9} />
      <PressSpot c={c} x={tips[0]} y={tips[1]} />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={95} />
    </G>
  );
}

/** Head tilted slightly to the same side, thumb and index finger gently pinch the SCM. */
function TriggerSCM(c: PoseColors) {
  const tips: Pt = [174, 108];
  const w = wrist(tips[0], tips[1], -40, 'pinch', 0.85);
  return (
    <G>
      <FrontBody c={c} neckTop={80} />
      <FrontHead c={c} pose={{ tilt: 10, dy: -14 }} />
      <Band c={c} d="M184 84 C178 100 168 118 156 134" width={9} />
      <Arm c={c} pts={[[102, 154], [122, 192], w]} straight />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={-40} kind="pinch" scale={0.85} />
    </G>
  );
}

/** One hand rests on the head while it tilts; the other side (warm) is stretched; other hand holds the chair. */
function stretch(c: PoseColors, levator: boolean) {
  const head = levator ? { tilt: 16, turn: 0.8, down: 1, dy: 8 } : { tilt: 26 };
  const tips: Pt = levator ? [160, 56] : [160, 44];
  const w = wrist(tips[0], tips[1], 172, 'flat');
  return (
    <G>
      {/* chair edge held by the other hand */}
      <Path d="M16 192 L76 192" stroke={c.prop} strokeWidth={7} strokeLinecap="round" />
      <FrontBody c={c} />
      <Ghost><FrontHead c={c} pose={{ plain: true }} /></Ghost>
      <FrontHead c={c} pose={head} />
      <Band c={c} d={levator ? 'M138 116 C130 132 118 142 104 148' : FB.trapL} />
      <Arm c={c} pts={[[204, 152], [268, 92], w]} />
      <Hand c={c} x={tips[0]} y={tips[1]} angle={172} kind="flat" />
      <Arm c={c} pts={[[96, 152], [58, 160], [46, 178]]} width={16} />
      <Hand c={c} x={46} y={198} angle={92} scale={0.85} />
      {levator
        ? <ArcArrow cx={FB.pivot[0]} cy={FB.pivot[1]} r={72} from={-34} to={14} color={c.hot} />
        : <ArcArrow cx={FB.pivot[0]} cy={FB.pivot[1]} r={108} from={-100} to={-64} color={c.hot} />}
    </G>
  );
}

/** Lying, fingers under the base of the skull; the head rests its weight on them. */
function Suboccipital(c: PoseColors) {
  return (
    <G>
      <LyingFigure c={c} />
      <PressSpot c={c} x={92} y={156} r={16} marks={false} />
      <Arm c={c} pts={[[126, 152], [118, 100], [100, 152]]} width={14} />
      <Path d="M76 158 C80 150 104 148 110 156 C110 164 84 166 76 158 Z" fill={c.hot} stroke={c.halo} strokeWidth={2} />
      <ArcArrow cx={LY.X} cy={LY.Y} r={58} from={-112} to={-70} color={c.accent} width={4} />
    </G>
  );
}

export const CERVICAL: Record<string, PoseDef> = {
  chinTuck: { draw: WallTuck },
  ccf: { draw: Ccf },
  rotation: { draw: Rotation, sided: true },
  sideFlexion: { draw: SideFlexion, sided: true },
  scapular: { draw: Scapular },
  triggerTrap: { draw: TriggerTrap, sided: true },
  triggerLevator: { draw: TriggerLevator, sided: true },
  triggerSCM: { draw: TriggerSCM, sided: true },
  stretchTrap: { draw: (c) => stretch(c, false), sided: true },
  stretchLevator: { draw: (c) => stretch(c, true), sided: true },
  suboccipital: { draw: Suboccipital },
  ergonomics: { draw: (c) => <DeskScene c={c} variant="neck" /> },
};
