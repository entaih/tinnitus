import type React from 'react';
import type { PoseColors } from './kit';

export interface PoseDef {
  /** Draws the pose for the user's RIGHT side (picture right, mirror view). */
  draw: (c: PoseColors) => React.ReactElement;
  /** Mirror for side = 'left'. */
  sided?: boolean;
  /** Always drawn for this side (e.g. self-test lateralL). */
  fixedSide?: 'left' | 'right';
}
