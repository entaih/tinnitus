import React from 'react';
import { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { IllustrationFrame, SVG_FONT, arcPath, useIllustrationColors, useIllustrationLocale, type IllustrationLocale, type IllustrationProps } from './shared';

export type HeadphoneSide = 'left' | 'right' | 'both';

export interface HeadphonesArtProps extends IllustrationProps {
  /** Which cup is playing; null/undefined = none highlighted. */
  side?: HeadphoneSide | null;
  locale?: IllustrationLocale;
}

const W = 260;
const H = 170;
const CUP_W = 62;
const CUP_H = 92;
const CUP_Y = 66;
const LEFT_X = 44;
const RIGHT_X = W - 44 - CUP_W;

const WORDS: Record<IllustrationLocale, { left: string; right: string }> = {
  tr: { left: 'SOL', right: 'SAĞ' },
  en: { left: 'LEFT', right: 'RIGHT' },
};

/** Over-ear headphones from the front, big L/SOL and R/SAĞ cups; the playing cup is filled and shows sound waves. */
export function HeadphonesArt({ side = null, locale, width, height, accessibilityLabel }: HeadphonesArtProps) {
  const c = useIllustrationColors();
  const loc = useIllustrationLocale(locale);
  const leftOn = side === 'left' || side === 'both';
  const rightOn = side === 'right' || side === 'both';
  const words = WORDS[loc];
  const playing = side === 'both' ? (loc === 'tr' ? 'İki taraf çalıyor' : 'Both sides playing')
    : side === 'left' ? (loc === 'tr' ? 'Sol taraf çalıyor' : 'Left side playing')
    : side === 'right' ? (loc === 'tr' ? 'Sağ taraf çalıyor' : 'Right side playing') : '';
  const label = accessibilityLabel ?? `${loc === 'tr' ? 'Kulaklık: solda L, sağda R' : 'Headphones: L on the left, R on the right'}${playing ? `. ${playing}` : ''}`;

  const cup = (x: number, on: boolean, letter: string, word: string, small: boolean) => {
    const cx = x + CUP_W / 2;
    return (
      <G>
        <Rect x={x} y={CUP_Y} width={CUP_W} height={CUP_H} rx={24} fill={on ? c.primary : c.card} stroke={on ? c.primary : c.borderStrong} strokeWidth={3.5} />
        <Rect x={x + 7} y={CUP_Y + 7} width={CUP_W - 14} height={CUP_H - 14} rx={18} fill="none" stroke={on ? c.onPrimary : c.border} strokeWidth={1.5} opacity={on ? 0.35 : 1} />
        <SvgText x={cx} y={CUP_Y + 47} fontSize={34} fontWeight="800" fontFamily={SVG_FONT} textAnchor="middle" fill={on ? c.onPrimary : c.text}>{letter}</SvgText>
        <SvgText x={cx} y={CUP_Y + 72} fontSize={small ? 13 : 16} fontWeight="800" fontFamily={SVG_FONT} textAnchor="middle" fill={on ? c.onPrimary : c.textSecondary}>{word}</SvgText>
      </G>
    );
  };

  const waves = (cx: number, dir: 'left' | 'right') => [0, 1, 2].map((i) => {
    const r = 44 + i * 12;
    const d = dir === 'left' ? arcPath(cx, CUP_Y + CUP_H / 2, r, 145, 215) : arcPath(cx, CUP_Y + CUP_H / 2, r, -35, 35);
    return <Path key={i} d={d} stroke={c.primary} strokeWidth={5} strokeLinecap="round" fill="none" opacity={1 - i * 0.28} />;
  });

  return (
    <IllustrationFrame vbWidth={W} vbHeight={H} width={width} height={height} label={label}>
      {/* headband */}
      <Path d={`M${LEFT_X + 14} ${CUP_Y + 6} L${LEFT_X + 14} 66 C${LEFT_X + 14} 20 ${RIGHT_X + CUP_W - 14} 20 ${RIGHT_X + CUP_W - 14} 66 L${RIGHT_X + CUP_W - 14} ${CUP_Y + 6}`} stroke={c.textSecondary} strokeWidth={12} strokeLinecap="round" fill="none" />
      <Path d={`M${LEFT_X + 14} 60 C${LEFT_X + 14} 26 ${RIGHT_X + CUP_W - 14} 26 ${RIGHT_X + CUP_W - 14} 60`} stroke={c.border} strokeWidth={3} strokeLinecap="round" fill="none" />
      {leftOn ? waves(LEFT_X + CUP_W / 2, 'left') : null}
      {rightOn ? waves(RIGHT_X + CUP_W / 2, 'right') : null}
      {cup(LEFT_X, leftOn, 'L', words.left, words.left.length > 4)}
      {cup(RIGHT_X, rightOn, 'R', words.right, words.right.length > 4)}
    </IllustrationFrame>
  );
}
