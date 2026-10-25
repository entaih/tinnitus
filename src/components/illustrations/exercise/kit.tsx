/**
 * Drawing kit for the exercise poses. Every pose is drawn in a 300 x 200 viewBox.
 * Per-side poses are drawn for the user's RIGHT side on the picture's right ("mirror view":
 * the figure moves the way the user sees themselves in a mirror); ExercisePose mirrors them for 'left'.
 */
import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { palette, type ThemeColors } from '@/theme';
import { EAR_CURL, EAR_OUTLINE, HEAD_PROFILE, arcPath } from '../shared';

export type Pt = [number, number];

export interface PoseColors {
  body: string;
  /** lines drawn on top of the body (face features, spine) */
  feature: string;
  hot: string;
  hotBg: string;
  halo: string;
  prop: string;
  propSoft: string;
  accent: string;
  soft: string;
  /** darker than the body in both themes (open mouth) */
  shade: string;
  tooth: string;
}

export function poseColors(c: ThemeColors): PoseColors {
  return {
    body: c.primary, feature: c.primaryTrack, hot: c.warning, hotBg: c.warningBg, halo: c.card,
    prop: c.borderStrong, propSoft: c.border, accent: c.accent, soft: c.primaryTrack, shade: c.gradient[1], tooth: palette.white,
  };
}

const rad = (d: number) => (d * Math.PI) / 180;
const r1 = (n: number) => Math.round(n * 10) / 10;
export const GHOST_OPACITY = 0.22;

/** Ghost of the start position, drawn behind the end position. */
export function Ghost({ children }: { children: React.ReactNode }) {
  return <G opacity={GHOST_OPACITY}>{children}</G>;
}

// ---------- arrows ----------

/** Arrow along a polyline (2 points = straight). Arrowhead at the last point (and the first when `both`). */
export function Arrow({ pts, color, width = 4.5, head = 10, both = false }: { pts: Pt[]; color: string; width?: number; head?: number; both?: boolean }) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${r1(p[0])} ${r1(p[1])}`).join(' ');
  const tri = (a: Pt, b: Pt) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const tip: Pt = [b[0] + Math.cos(ang) * head * 0.55, b[1] + Math.sin(ang) * head * 0.55];
    const back: Pt = [b[0] - Math.cos(ang) * head * 0.45, b[1] - Math.sin(ang) * head * 0.45];
    const n: Pt = [-Math.sin(ang) * head * 0.62, Math.cos(ang) * head * 0.62];
    return `M${r1(tip[0])} ${r1(tip[1])} L${r1(back[0] + n[0])} ${r1(back[1] + n[1])} L${r1(back[0] - n[0])} ${r1(back[1] - n[1])} Z`;
  };
  const last = pts.length - 1;
  return (
    <G>
      <Path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={tri(pts[last - 1], pts[last])} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {both ? <Path d={tri(pts[1], pts[0])} fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" /> : null}
    </G>
  );
}

/** Points on an ellipse arc, angles in degrees (0 = right, clockwise on screen). */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

export function ArcArrow({ cx, cy, r, ry, from, to, color, width, both }: { cx: number; cy: number; r: number; ry?: number; from: number; to: number; color: string; width?: number; both?: boolean }) {
  return <Arrow pts={arcPts(cx, cy, r, ry ?? r, from, to)} color={color} width={width} both={both} />;
}

/** Circular "massage" arrow loop. */
export function LoopArrow({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return <Arrow pts={arcPts(cx, cy, r, r, -60, 230, 30)} color={color} width={3.5} head={9} />;
}

// ---------- hands & arms ----------

export type HandKind = 'tips' | 'pinch' | 'flat';

/** A simple mitten hand. (x, y) is the fingertip contact point, angle the direction the fingers point. */
export function Hand({ x, y, angle, c, kind = 'tips', scale = 1 }: { x: number; y: number; angle: number; c: PoseColors; kind?: HandKind; scale?: number }) {
  const fingers: { y: number; tip: number; len: number }[] = kind === 'pinch'
    ? [{ y: -9, tip: 0, len: 18 }]
    : kind === 'flat'
      ? [{ y: -7, tip: -2, len: 20 }, { y: 0, tip: 0, len: 22 }, { y: 7, tip: -2, len: 20 }]
      : [{ y: -7, tip: -3, len: 15 }, { y: 0, tip: 0, len: 17 }, { y: 7, tip: -3, len: 15 }];
  const thumb = kind === 'pinch' ? { a: [-22, 9] as Pt, b: [-3, 9] as Pt } : { a: [-28, -10] as Pt, b: [-17, -18] as Pt };
  const palmX = kind === 'flat' ? -40 : -36;
  const shapes = (halo: boolean) => {
    const extra = halo ? 4 : 0;
    const col = halo ? c.halo : c.hot;
    return (
      <G>
        <Rect x={palmX - extra / 2} y={-12 - extra / 2} width={24 + extra} height={24 + extra} rx={10} fill={col} />
        {fingers.map((f, i) => (
          <Path key={i} d={`M${f.tip - f.len} ${f.y} L${f.tip - 3.4} ${f.y}`} stroke={col} strokeWidth={6.8 + extra} strokeLinecap="round" />
        ))}
        <Path d={`M${thumb.a[0]} ${thumb.a[1]} L${thumb.b[0]} ${thumb.b[1]}`} stroke={col} strokeWidth={7 + extra} strokeLinecap="round" />
      </G>
    );
  };
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      {shapes(true)}
      {shapes(false)}
    </G>
  );
}

/** Wrist point of a Hand, to attach an arm. */
export function wrist(x: number, y: number, angle: number, kind: HandKind = 'tips', scale = 1): Pt {
  const back = (kind === 'flat' ? 40 : 36) * scale;
  return [x - Math.cos(rad(angle)) * back, y - Math.sin(rad(angle)) * back];
}

/** Arm as a thick stroke (shoulder -> elbow -> wrist) with a halo so it reads over the body. 3 points = smooth bend unless `straight`. */
export function Arm({ pts, c, width = 17, straight = false }: { pts: Pt[]; c: PoseColors; width?: number; straight?: boolean }) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  if (pts.length === 3 && !straight) d += ` Q${r1(pts[1][0])} ${r1(pts[1][1])} ${r1(pts[2][0])} ${r1(pts[2][1])}`;
  else for (let i = 1; i < pts.length; i++) d += ` L${r1(pts[i][0])} ${r1(pts[i][1])}`;
  return (
    <G>
      <Path d={d} stroke={c.halo} strokeWidth={width + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={d} stroke={c.body} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  );
}

/** Soft warm glow ring around a contact point. */
export function PressSpot({ x, y, c, r = 15, marks = true }: { x: number; y: number; c: PoseColors; r?: number; marks?: boolean }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.hotBg} stroke={c.hot} strokeWidth={2} strokeDasharray="4 4" />
      {marks ? <Circle cx={x} cy={y} r={4} fill={c.hot} /> : null}
    </G>
  );
}

/** Warm band over a muscle (drawn on top of the body). */
export function Band({ d, c, width = 11 }: { d: string; c: PoseColors; width?: number }) {
  return (
    <G>
      <Path d={d} stroke={c.hotBg} strokeWidth={width + 6} strokeLinecap="round" fill="none" opacity={0.9} />
      <Path d={d} stroke={c.hot} strokeWidth={width} strokeLinecap="round" fill="none" />
    </G>
  );
}

// ---------- front bust (head, neck, shoulders) ----------

export const FB = {
  headC: [150, 74] as Pt, rx: 30, ry: 36,
  pivot: [150, 120] as Pt,
  shoulderL: [98, 150] as Pt, shoulderR: [202, 150] as Pt,
  torso: 'M58 206 C60 170 74 152 100 144 C114 140 128 134 134 124 L166 124 C172 134 186 140 200 144 C226 152 240 170 242 206 Z',
  trapR: 'M168 128 C178 140 192 145 210 150',
  trapL: 'M132 128 C122 140 108 145 90 150',
};

export interface HeadPose {
  /** side tilt in degrees (+ = top of head to the picture right) */
  tilt?: number;
  /** turn: -1 (face to picture left) .. 1 (face to picture right) */
  turn?: number;
  /** look down amount 0..1 */
  down?: number;
  /** extra translation */
  dx?: number; dy?: number;
  /** eyes closed (calm) */
  closed?: boolean;
  /** draw a warm outline around the head (the moving part) */
  hot?: boolean;
  /** draw only the silhouette (ghost / back view) */
  plain?: boolean;
}

/** Head (front view) with ears and simple face, transformed by a HeadPose. */
export function FrontHead({ c, pose = {} }: { c: PoseColors; pose?: HeadPose }) {
  const { tilt = 0, turn = 0, down = 0, dx = 0, dy = 0, closed = true, hot = false, plain = false } = pose;
  const [hx, hy] = FB.headC;
  const fx = turn * 15;
  const fy = down * 12;
  const showL = turn <= 0.4 || turn > 0.4;
  const showR = turn >= -0.4 || turn < -0.4;
  return (
    <G transform={`translate(${dx} ${dy}) rotate(${tilt} ${FB.pivot[0]} ${FB.pivot[1]})`}>
      {showL ? <Ellipse cx={hx - FB.rx + 1 + Math.max(0, turn) * 6} cy={hy + 4 + fy * 0.4} rx={6} ry={10} fill={c.body} /> : null}
      {showR ? <Ellipse cx={hx + FB.rx - 1 + Math.min(0, turn) * 6} cy={hy + 4 + fy * 0.4} rx={6} ry={10} fill={c.body} /> : null}
      <Ellipse cx={hx} cy={hy} rx={FB.rx} ry={FB.ry} fill={c.body} stroke={hot ? c.hot : 'none'} strokeWidth={hot ? 3.5 : 0} />
      {/* nose sticking out when turned */}
      {Math.abs(turn) > 0.4 ? (
        <Path d={turn > 0 ? `M${hx + 27} ${hy - 2 + fy} L${hx + 38} ${hy + 10 + fy} L${hx + 27} ${hy + 14 + fy} Z` : `M${hx - 27} ${hy - 2 + fy} L${hx - 38} ${hy + 10 + fy} L${hx - 27} ${hy + 14 + fy} Z`} fill={c.body} />
      ) : null}
      {plain ? null : (
        <G>
          {closed ? (
            <G>
              <Path d={arcPath(hx - 11 + fx, hy - 2 + fy, 5, 20, 160)} stroke={c.feature} strokeWidth={2.6} strokeLinecap="round" fill="none" />
              <Path d={arcPath(hx + 11 + fx, hy - 2 + fy, 5, 20, 160)} stroke={c.feature} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            </G>
          ) : (
            <G>
              <Circle cx={hx - 11 + fx} cy={hy + fy} r={3} fill={c.feature} />
              <Circle cx={hx + 11 + fx} cy={hy + fy} r={3} fill={c.feature} />
            </G>
          )}
          <Path d={`M${hx + fx * 1.15} ${hy + 6 + fy} L${hx + fx * 1.15 - 3} ${hy + 15 + fy} L${hx + fx * 1.15 + 2} ${hy + 15 + fy}`} stroke={c.feature} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d={arcPath(hx + fx, hy + 15 + fy, 7, 35, 145)} stroke={c.feature} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </G>
      )}
    </G>
  );
}

/** Neck + shoulders (front or back view). `neckTop` lifts the top of the neck (for a raised head). */
export function FrontBody({ c, spine = false, neckTop = 98 }: { c: PoseColors; spine?: boolean; neckTop?: number }) {
  return (
    <G>
      <Rect x={135} y={neckTop} width={30} height={134 - neckTop} rx={8} fill={c.body} />
      <Path d={FB.torso} fill={c.body} />
      {spine ? <Path d="M150 132 L150 204" stroke={c.feature} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="3 7" /> : null}
    </G>
  );
}

// ---------- profile (facing right) ----------

/** HEAD_PROFILE without the closing line across the neck, for outlines. */
export const HEAD_OPEN = HEAD_PROFILE.replace(/ Z$/, '');

/** Ear outline on a profile head (HEAD_PROFILE coordinates); s = outer scale, to keep line width constant. */
export function ProfileEar({ c, s = 1 }: { c: PoseColors; s?: number }) {
  return (
    <G transform="translate(127 56) scale(0.4)">
      <Path d={EAR_OUTLINE} fill={c.body} stroke={c.feature} strokeWidth={2.6 / s / 0.4} strokeLinejoin="round" />
      <Path d={EAR_CURL} fill="none" stroke={c.feature} strokeWidth={2.4 / s / 0.4} strokeLinecap="round" />
    </G>
  );
}

/** Side-view torso to go under HEAD_PROFILE (same coordinate system). */
export const PROFILE_TORSO = 'M116 214 C110 182 112 152 128 131 L170 131 C188 140 202 164 206 214 Z';

/** Profile figure: HEAD_PROFILE + torso, placed with translate/scale. The head can move separately. */
export function ProfileFigure({ c, x = 0, y = 0, s = 1, head = {}, eye = true, torso = true }: {
  c: PoseColors; x?: number; y?: number; s?: number;
  head?: { dx?: number; dy?: number; rot?: number; hot?: boolean };
  eye?: boolean; torso?: boolean;
}) {
  const { dx = 0, dy = 0, rot = 0, hot = false } = head;
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {torso ? <Path d={PROFILE_TORSO} fill={c.body} /> : null}
      <G transform={`translate(${dx} ${dy}) rotate(${rot} 146 128)`}>
        <Path d={HEAD_PROFILE} fill={c.body} />
        {hot ? <Path d={HEAD_OPEN} fill="none" stroke={c.hot} strokeWidth={3.5 / s} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {eye ? (
          <G>
            <ProfileEar c={c} s={s} />
            <Path d={arcPath(186, 56, 5, 20, 160)} stroke={c.feature} strokeWidth={2.6 / s} strokeLinecap="round" fill="none" />
          </G>
        ) : null}
      </G>
    </G>
  );
}

// ---------- face close-up (front) ----------

export const FACE = {
  upper: 'M88 100 C86 50 114 16 150 16 C186 16 214 50 212 100 C211 118 205 130 194 134 L106 134 C95 130 89 118 88 100 Z',
  jaw: 'M98 112 C99 154 122 180 150 180 C178 180 201 154 202 112 C192 128 174 134 150 134 C126 134 108 128 98 112 Z',
  neck: 'M66 206 C78 188 104 178 122 172 L178 172 C196 178 222 188 234 206 Z',
};

export interface FaceOpts {
  /** lower-jaw offset */
  jdx?: number; jdy?: number;
  /** jaw is the moving part (warm outline) */
  hotJaw?: boolean;
  /** show teeth rows (lips apart) */
  teeth?: boolean;
  /** show the tongue up behind the upper teeth */
  tongue?: boolean;
  /** draw a ghost jaw at the start position */
  ghostJaw?: boolean;
  eyesClosed?: boolean;
  /** frowning brows (effort) */
  effort?: boolean;
}

/** Front face close-up with a separate lower jaw so jaw movements can be shown. */
export function Face({ c, o = {} }: { c: PoseColors; o?: FaceOpts }) {
  const { jdx = 0, jdy = 0, hotJaw = false, teeth = false, tongue = false, ghostJaw = false, eyesClosed = true, effort = false } = o;
  const open = jdy > 2 || Math.abs(jdx) > 2 || teeth;
  const mx0 = Math.min(128, 128 + jdx);
  const mx1 = Math.max(172, 172 + jdx);
  return (
    <G>
      <Path d={FACE.neck} fill={c.body} />
      <Rect x={122} y={150} width={56} height={30} fill={c.body} />
      {/* ears */}
      <Ellipse cx={88} cy={100} rx={10} ry={18} fill={c.body} />
      <Ellipse cx={212} cy={100} rx={10} ry={18} fill={c.body} />
      {ghostJaw ? <Ghost><Path d={FACE.jaw} fill={c.body} /></Ghost> : null}
      <G transform={`translate(${jdx} ${jdy})`}>
        <Path d={FACE.jaw} fill={c.body} stroke={hotJaw ? c.hot : 'none'} strokeWidth={hotJaw ? 4.5 : 0} strokeLinejoin="round" />
      </G>
      {/* cheeks stretch down with the jaw, so no gap opens at the sides */}
      {jdy > 0 ? <Rect x={100 + Math.min(0, jdx) * 0.6} y={108} width={100 + Math.abs(jdx) * 0.6} height={24 + jdy} rx={12} fill={c.body} /> : null}
      <Path d={FACE.upper} fill={c.body} />
      {open ? (
        <G>
          <Rect x={mx0} y={125} width={mx1 - mx0} height={14 + jdy} rx={7} fill={c.shade} />
          {tongue ? <Ellipse cx={150 + jdx / 2} cy={137} rx={12} ry={5} fill={c.hot} /> : null}
          <Rect x={134} y={126} width={32} height={6} rx={2} fill={c.tooth} />
          <Rect x={134 + jdx} y={132 + jdy} width={32} height={6} rx={2} fill={c.tooth} />
        </G>
      ) : (
        <Path d="M134 132 C142 135 158 135 166 132" stroke={c.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
      )}
      {/* eyes, brows, nose */}
      {eyesClosed ? (
        <G>
          <Path d={arcPath(124, 76, 9, 20, 160)} stroke={c.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d={arcPath(176, 76, 9, 20, 160)} stroke={c.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>
      ) : (
        <G>
          <Circle cx={124} cy={80} r={4.5} fill={c.feature} />
          <Circle cx={176} cy={80} r={4.5} fill={c.feature} />
        </G>
      )}
      <Path d={effort ? 'M112 62 L134 68 M188 62 L166 68' : 'M112 64 C118 60 128 60 134 63 M166 63 C172 60 182 60 188 64'} stroke={c.feature} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M150 86 L144 108 L156 108" stroke={c.feature} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  );
}

// ---------- profile mouth cut-away (lower face close-up) ----------

const MC = { s: 1.7, x: -143, y: -50 };
/** Map HEAD_PROFILE coordinates into the close-up. */
export const mc = (x: number, y: number): Pt => [x * MC.s + MC.x, y * MC.s + MC.y];

export function MouthCutaway({ c, breath = false, gapArrow = true }: { c: PoseColors; breath?: boolean; gapArrow?: boolean }) {
  const nose = mc(218, 90);
  return (
    <G>
      <G transform={`translate(${MC.x} ${MC.y}) scale(${MC.s})`}>
        <Path d={PROFILE_TORSO} fill={c.body} />
        <Path d={HEAD_PROFILE} fill={c.body} />
        <Path d={arcPath(186, 56, 5, 20, 160)} stroke={c.feature} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        <ProfileEar c={c} s={MC.s} />
        {/* mouth cavity */}
        <Path d="M170 94 C182 88 198 89 206 94 L207 107 C198 113 182 113 170 107 Z" fill={c.shade} />
        {/* teeth apart */}
        <Rect x={200.5} y={92.5} width={5} height={6.5} rx={1.6} fill={c.tooth} />
        <Rect x={199} y={102} width={5} height={6} rx={1.6} fill={c.tooth} />
        {/* tongue resting up, tip just behind the upper front teeth */}
        <Path d="M171 106 C174 98 186 94 196 93.5 C199.5 93.5 200 96.5 197.5 97.5 C189 100 180 104 175 109 Z" fill={c.hot} />
      </G>
      {gapArrow ? <Arrow pts={[mc(213, 95.5), mc(213, 106)]} color={c.hot} width={2.6} head={7} both /> : null}
      {breath ? (
        <G>
          <Path d={`M${nose[0] + 6} ${nose[1] + 8} C${nose[0] + 16} ${nose[1] + 14} ${nose[0] + 22} ${nose[1] + 22} ${nose[0] + 24} ${nose[1] + 34}`} stroke={c.accent} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d={`M${nose[0] + 16} ${nose[1] + 4} C${nose[0] + 26} ${nose[1] + 8} ${nose[0] + 32} ${nose[1] + 16} ${nose[0] + 34} ${nose[1] + 26}`} stroke={c.accent} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
        </G>
      ) : null}
    </G>
  );
}

// ---------- lying figure (on the back, head left, face up) ----------

export const LY = { X: 72, Y: 124, floor: 172 };

export function LyingFigure({ c, headRot = 0, kneesBent = true, headOnly = false }: { c: PoseColors; headRot?: number; kneesBent?: boolean; headOnly?: boolean }) {
  const { X, Y, floor } = LY;
  const headT = `translate(${X} ${Y}) rotate(${-90 + headRot} 0 0) scale(0.62) translate(-160 -72)`;
  const head = (
    <G transform={headT}>
      <Path d={HEAD_PROFILE} fill={c.body} />
      <Path d={arcPath(186, 56, 5, 20, 160)} stroke={c.feature} strokeWidth={4} strokeLinecap="round" fill="none" />
    </G>
  );
  if (headOnly) return head;
  return (
    <G>
      <Path d={`M24 ${floor} L292 ${floor}`} stroke={c.propSoft} strokeWidth={3} strokeLinecap="round" />
      <Path d={`M${X + 36} ${floor - 19} L222 ${floor - 19}`} stroke={c.body} strokeWidth={36} strokeLinecap="round" />
      {kneesBent ? (
        <Path d={`M222 ${floor - 20} L252 ${floor - 62} L276 ${floor - 8}`} stroke={c.body} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <Path d={`M222 ${floor - 14} L284 ${floor - 10}`} stroke={c.body} strokeWidth={22} strokeLinecap="round" />
      )}
      {head}
    </G>
  );
}

// ---------- props ----------

export function Wall({ c, x, y0 = 0, y1 = 200 }: { c: PoseColors; x: number; y0?: number; y1?: number }) {
  return (
    <G>
      <Rect x={x - 14} y={y0} width={14} height={y1 - y0} fill={c.propSoft} />
      <Path d={`M${x} ${y0} L${x} ${y1}`} stroke={c.prop} strokeWidth={3} />
    </G>
  );
}

/** Seated person at a desk with the top of the monitor at eye level (profile, facing right). */
export function DeskScene({ c, variant }: { c: PoseColors; variant: 'neck' | 'setup' }) {
  const s = 0.62;
  const px = 24;
  const py = 26;
  const P = (x: number, y: number): Pt => [x * s + px, y * s + py];
  const eye = P(186, 56);
  const back = P(112, 170);
  return (
    <G>
      {/* floor */}
      <Path d="M10 192 L290 192" stroke={c.propSoft} strokeWidth={3} strokeLinecap="round" />
      {/* chair: back rest touching the back, seat, leg */}
      <Path d={`M${back[0] - 6} 108 L${back[0] - 6} 160`} stroke={c.prop} strokeWidth={6} strokeLinecap="round" />
      <Path d={`M${back[0] - 8} 158 L${back[0] + 52} 158`} stroke={c.prop} strokeWidth={7} strokeLinecap="round" />
      <Path d={`M${back[0] + 22} 160 L${back[0] + 22} 190 M${back[0] + 2} 190 L${back[0] + 42} 190`} stroke={c.prop} strokeWidth={5} strokeLinecap="round" />
      {/* person: torso + profile head, thigh + shin */}
      <ProfileFigure c={c} x={px} y={py} s={s} />
      <Path d={`M${back[0] + 14} 150 L${back[0] + 64} 150 L${back[0] + 68} 188`} stroke={c.body} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={`M${back[0] + 66} 189 L${back[0] + 82} 189`} stroke={c.body} strokeWidth={8} strokeLinecap="round" />
      {/* arm to keyboard */}
      <Arm c={c} pts={[P(152, 152), P(160, 190), [184, 130]]} width={11} straight />
      {/* desk + keyboard */}
      <Path d="M168 136 L286 136" stroke={c.prop} strokeWidth={7} strokeLinecap="round" />
      <Path d="M276 136 L276 192" stroke={c.prop} strokeWidth={6} strokeLinecap="round" />
      <Rect x={176} y={128} width={30} height={6} rx={2} fill={c.propSoft} />
      {/* monitor: top edge at eye level */}
      <Rect x={234} y={eye[1] - 4} width={12} height={62} rx={4} fill={c.body} />
      <Path d={`M240 ${eye[1] + 56} L240 134 M226 134 L254 134`} stroke={c.body} strokeWidth={6} strokeLinecap="round" />
      {/* eye line */}
      <Path d={`M${eye[0] + 8} ${eye[1]} L228 ${eye[1]}`} stroke={c.hot} strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
      <Path d={`M234 ${eye[1] - 4} L246 ${eye[1] - 4}`} stroke={c.hot} strokeWidth={5} strokeLinecap="round" />
      {variant === 'setup' ? (
        <G>
          {/* low-back support + feet flat */}
          <Path d={`M${back[0] - 2} 122 C${back[0] + 6} 130 ${back[0] + 6} 142 ${back[0] - 2} 150`} stroke={c.hot} strokeWidth={6} strokeLinecap="round" fill="none" />
          <Path d={`M${back[0] + 58} 196 L${back[0] + 88} 196`} stroke={c.hot} strokeWidth={4} strokeLinecap="round" />
          {/* arm's-length distance */}
          <Arrow pts={[[eye[0] + 14, eye[1] + 22], [226, eye[1] + 22]]} color={c.accent} width={3} head={8} both />
        </G>
      ) : (
        <G>
          {/* break clock */}
          <Circle cx={262} cy={30} r={17} fill="none" stroke={c.accent} strokeWidth={4} />
          <Path d="M262 20 L262 30 L270 35" stroke={c.accent} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      )}
    </G>
  );
}
