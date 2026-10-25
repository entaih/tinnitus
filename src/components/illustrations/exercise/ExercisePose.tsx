import React from 'react';
import { G } from 'react-native-svg';
import { EXERCISES, SELF_TEST } from '@/content/exercises';
import { IllustrationFrame, useIllustrationColors, useIllustrationLocale, type IllustrationProps } from '../shared';
import { poseColors } from './kit';
import { CERVICAL } from './cervical';
import { OROFACIAL } from './orofacial';
import { POSTURE } from './posture';
import { SELF_TEST_POSES } from './selftest';
import type { PoseDef } from './types';

const POSES: Record<string, PoseDef> = { ...CERVICAL, ...OROFACIAL, ...POSTURE, ...SELF_TEST_POSES };

/** Every step / manoeuvre id that has a drawing. */
export const EXERCISE_POSE_IDS: readonly string[] = Object.keys(POSES);

export function hasExercisePose(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(POSES, id);
}

/** Whether the drawing changes with `side` (per-side steps). */
export function isSidedPose(id: string): boolean {
  return hasExercisePose(id) && !!POSES[id].sided;
}

const NAMES: Record<string, { tr: string; en: string }> = Object.fromEntries([
  ...Object.values(EXERCISES).flatMap((ex) => ex.steps.map((s) => [s.id, s.name] as const)),
  ...SELF_TEST.manoeuvres.map((m) => [m.id, m.name] as const),
]);

export interface ExercisePoseProps extends IllustrationProps {
  /** Step id (e.g. 'chinTuck') or self-test manoeuvre id (e.g. 'rotResL'). */
  id: string;
  /** For per-side steps: which side is being done. Drawings are mirror-view (user's left = picture left). */
  side?: 'left' | 'right';
}

const W = 300;
const H = 200;

/** Movement drawing for a neck / jaw / posture exercise step. Renders nothing for unknown ids. */
export function ExercisePose({ id, side = 'left', width, height, accessibilityLabel }: ExercisePoseProps) {
  const colors = useIllustrationColors();
  const loc = useIllustrationLocale();
  if (!hasExercisePose(id)) return null;
  const def = POSES[id];
  const effSide = def.fixedSide ?? (def.sided ? side : 'right');
  const mirror = effSide === 'left' && (def.sided || def.fixedSide === 'left');
  const name = NAMES[id]?.[loc] ?? id;
  const sideWord = def.sided ? (loc === 'tr' ? (side === 'left' ? ' (sol taraf)' : ' (sağ taraf)') : ` (${side} side)`) : '';
  const label = accessibilityLabel ?? `${loc === 'tr' ? 'Hareket çizimi' : 'Movement drawing'}: ${name}${sideWord}`;
  const drawing = def.draw(poseColors(colors));
  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={label}>
      {mirror ? <G transform={`translate(${W} 0) scale(-1 1)`}>{drawing}</G> : drawing}
    </IllustrationFrame>
  );
}
