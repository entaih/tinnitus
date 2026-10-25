import React from 'react';
import { causeRegion } from './causeRegion';
import { EarDiagram } from './EarDiagram';
import { HeadDiagram } from './HeadDiagram';
import type { IllustrationLocale, IllustrationProps } from './shared';

export interface CauseIllustrationProps extends IllustrationProps {
  causeId: string;
  locale?: IllustrationLocale;
}

/** Renders the ear or head diagram with the region that matches a cause id highlighted. */
export function CauseIllustration({ causeId, ...rest }: CauseIllustrationProps) {
  const r = causeRegion(causeId);
  return r.diagram === 'ear' ? <EarDiagram highlight={r.highlight} {...rest} /> : <HeadDiagram highlight={r.highlight} {...rest} />;
}
