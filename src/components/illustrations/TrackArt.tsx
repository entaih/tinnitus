import React from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import {
  EAR_CURL, EAR_OUTLINE, HEAD_PROFILE, IllustrationFrame, arcPath, leafPath, moonPath, sparklePath,
  useIllustrationColors, useIllustrationLocale, type IllustrationProps,
} from './shared';
import type { ThemeColors } from '@/theme';

export type TrackKind = 'sound' | 'sleep' | 'relax' | 'thoughts' | 'hearing' | 'neck' | 'learn';
export const TRACK_KINDS: readonly TrackKind[] = ['sound', 'sleep', 'relax', 'thoughts', 'hearing', 'neck', 'learn'];

export interface TrackArtProps extends IllustrationProps {
  track: TrackKind;
}

const W = 120;
const H = 90;

const LABELS: Record<'tr' | 'en', Record<TrackKind, string>> = {
  tr: { sound: 'Ses: hoparlör ve ses dalgaları', sleep: 'Uyku: yastık üstünde ay ve yıldızlar', relax: 'Gevşeme: nefes halkası ve yaprak', thoughts: 'Düşünceler: düşünce balonlu bir baş', hearing: 'İşitme: kulak ve işitme cihazı', neck: 'Boyun: boyun esnetme', learn: 'Öğren: açık kitap' },
  en: { sound: 'Sound: speaker and sound waves', sleep: 'Sleep: moon and stars over a pillow', relax: 'Relax: breathing circle and leaf', thoughts: 'Thoughts: head with a thought bubble', hearing: 'Hearing: ear and hearing aid', neck: 'Neck: neck stretch', learn: 'Learn: open book' },
};

function Sound({ c }: { c: ThemeColors }) {
  return (
    <G>
      <Rect x={24} y={34} width={16} height={22} rx={4} fill={c.primary} />
      <Path d="M38 34 L58 18 L58 72 L38 56 Z" fill={c.primary} strokeLinejoin="round" stroke={c.primary} strokeWidth={4} />
      {[14, 26, 38].map((r, i) => (
        <Path key={r} d={arcPath(60, 45, r, -42, 42)} stroke={c.accent} strokeWidth={6} strokeLinecap="round" fill="none" opacity={1 - i * 0.25} />
      ))}
    </G>
  );
}

function Sleep({ c }: { c: ThemeColors }) {
  return (
    <G>
      <Path d={moonPath(44, 28, 15)} fill={c.accent} />
      <Path d={sparklePath(76, 18, 7)} fill={c.primary} />
      <Path d={sparklePath(94, 36, 5)} fill={c.primary} opacity={0.7} />
      <Rect x={16} y={52} width={88} height={28} rx={14} fill={c.card} stroke={c.primary} strokeWidth={3.5} />
      <Path d="M30 66 C46 60 74 60 90 66" stroke={c.primary} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.5} />
    </G>
  );
}

function Relax({ c }: { c: ThemeColors }) {
  return (
    <G>
      <Circle cx={60} cy={45} r={38} fill={c.primaryTrack} />
      <Circle cx={60} cy={45} r={27} fill={c.card} stroke={c.primary} strokeWidth={3.5} />
      <Path d={leafPath(60, 45, 13)} fill={c.success} />
      <Path d="M49 56 L68 37" stroke={c.successBg} strokeWidth={2.5} strokeLinecap="round" />
    </G>
  );
}

function Thoughts({ c }: { c: ThemeColors }) {
  const cloud: [number, number, number][] = [[78, 27, 11], [90, 19, 12], [101, 28, 10], [89, 34, 11]];
  return (
    <G>
      <G transform="translate(-38 22) scale(0.5)">
        <Path d={HEAD_PROFILE} fill={c.primary} />
      </G>
      {cloud.map(([x, y, r], i) => <Circle key={`s${i}`} cx={x} cy={y} r={r} fill={c.primary} stroke={c.primary} strokeWidth={7} />)}
      {cloud.map(([x, y, r], i) => <Circle key={`f${i}`} cx={x} cy={y} r={r} fill={c.card} />)}
      <Circle cx={72} cy={45} r={4.5} fill={c.card} stroke={c.primary} strokeWidth={3} />
      <Circle cx={65} cy={53} r={2.5} fill={c.primary} />
      {[81, 89, 97].map((x) => <Circle key={x} cx={x} cy={28} r={2.6} fill={c.accent} />)}
    </G>
  );
}

function Hearing({ c }: { c: ThemeColors }) {
  return (
    <G>
      <G transform="translate(44 14) scale(0.7)">
        <Path d={EAR_OUTLINE} fill={c.primaryTrack} stroke={c.primary} strokeWidth={5} strokeLinejoin="round" />
        <Path d={EAR_CURL} fill="none" stroke={c.primary} strokeWidth={5} strokeLinecap="round" />
      </G>
      {/* behind-the-ear hearing aid + tube */}
      <Path d="M58 10 C40 8 30 24 33 44" stroke={c.accent} strokeWidth={11} strokeLinecap="round" fill="none" />
      <Path d="M60 10 C74 10 78 26 70 40" stroke={c.accent} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Circle cx={69} cy={42} r={4.5} fill={c.accent} />
      {[12, 22].map((r, i) => (
        <Path key={r} d={arcPath(82, 50, r, -40, 40)} stroke={c.primary} strokeWidth={5} strokeLinecap="round" fill="none" opacity={1 - i * 0.35} />
      ))}
    </G>
  );
}

function Neck({ c }: { c: ThemeColors }) {
  const r = 58;
  const a1 = -54;
  const end: [number, number] = [60 + r * Math.cos((a1 * Math.PI) / 180), 64 + r * Math.sin((a1 * Math.PI) / 180)];
  // tangent (clockwise) and normal at the arrow end
  const t: [number, number] = [-Math.sin((a1 * Math.PI) / 180), Math.cos((a1 * Math.PI) / 180)];
  const n: [number, number] = [-t[1], t[0]];
  const tip = [end[0] + t[0] * 10, end[1] + t[1] * 10];
  const b1 = [end[0] + n[0] * 7, end[1] + n[1] * 7];
  const b2 = [end[0] - n[0] * 7, end[1] - n[1] * 7];
  return (
    <G>
      <Path d="M16 90 C18 72 34 64 50 62 L70 62 C86 64 102 72 104 90 Z" fill={c.primary} />
      <G transform="rotate(22 60 64)">
        <Rect x={52} y={40} width={16} height={26} rx={4} fill={c.primary} />
        <Circle cx={60} cy={28} r={16} fill={c.primary} />
      </G>
      <Path d={arcPath(60, 64, r, -124, a1)} stroke={c.accent} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      <Path d={`M${tip[0]} ${tip[1]} L${b1[0]} ${b1[1]} L${b2[0]} ${b2[1]} Z`} fill={c.accent} stroke={c.accent} strokeWidth={2} strokeLinejoin="round" />
    </G>
  );
}

function Learn({ c }: { c: ThemeColors }) {
  return (
    <G>
      <Path d="M12 30 L12 78 C30 74 48 74 60 82 C72 74 90 74 108 78 L108 30 Z" fill={c.primary} />
      <Path d="M60 26 C48 18 30 18 18 22 L18 70 C30 66 48 66 60 74 Z" fill={c.card} stroke={c.primary} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M60 26 C72 18 90 18 102 22 L102 70 C90 66 72 66 60 74 Z" fill={c.card} stroke={c.primary} strokeWidth={3} strokeLinejoin="round" />
      {[34, 44, 54].map((y) => (
        <Path key={y} d={`M26 ${y - 2} C34 ${y - 4} 44 ${y - 4} 52 ${y}`} stroke={c.primary} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.45} />
      ))}
      {[44, 54].map((y) => (
        <Path key={y} d={`M68 ${y} C76 ${y - 4} 86 ${y - 4} 94 ${y - 2}`} stroke={c.primary} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.45} />
      ))}
      <Path d="M80 20 L80 38 L85 34 L90 38 L90 19" fill={c.accent} />
    </G>
  );
}

const ART: Record<TrackKind, (p: { c: ThemeColors }) => React.ReactElement> = {
  sound: Sound, sleep: Sleep, relax: Relax, thoughts: Thoughts, hearing: Hearing, neck: Neck, learn: Learn,
};

/** Small header art for a lesson track, on a soft rounded tile. No text. */
export function TrackArt({ track, width, height, accessibilityLabel }: TrackArtProps) {
  const c = useIllustrationColors();
  const loc = useIllustrationLocale();
  const Art = ART[track] ?? Learn;
  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={accessibilityLabel ?? LABELS[loc][track] ?? ''}>
      <Rect x={0} y={0} width={W} height={H} rx={18} fill={c.primarySoft} />
      <Art c={c} />
    </IllustrationFrame>
  );
}
