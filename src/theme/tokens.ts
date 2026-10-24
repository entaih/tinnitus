/** Design tokens — see design_spec. No raw hex in components; consume through useTheme(). */

export const palette = {
  primary: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81' },
  accent: { 100: '#FFEDD5', 300: '#FDBA74', 500: '#F97316', 700: '#C2410C' },
  secondary: { 100: '#E0F2FE', 500: '#0EA5E9', 700: '#0369A1' },
  neutral: { 50: '#F6F7FB', 100: '#EEF0F6', 200: '#E2E6EF', 300: '#C5CBD8', 400: '#98A2B3', 500: '#6B7488', 600: '#4B5565', 700: '#2E3646', 800: '#161C2D', 900: '#0F1422' },
  inkDark: '#0B0F1A',
  nightBg: '#06080F',
  textOnDark: '#E8ECF5',
  white: '#FFFFFF',
};

export type SeverityBand = 'none' | 'mild' | 'moderate' | 'severe' | 'catastrophic';

export interface ThemeColors {
  bg: string; card: string; elevated: string; tinted: string; overlay: string;
  border: string; borderStrong: string;
  text: string; textSecondary: string; textMuted: string; textDisabled: string;
  primary: string; primaryPressed: string; onPrimary: string; primarySoft: string; primaryTrack: string;
  /** gradient pair for hero surfaces */
  gradient: [string, string];
  accent: string; accentSoft: string; accentText: string;
  secondary: string; secondarySoft: string; secondaryText: string;
  success: string; successBg: string; warning: string; warningBg: string; danger: string; dangerBg: string; info: string; infoBg: string;
  severity: Record<SeverityBand, { text: string; bg: string }>;
  chart: { tfi: string; thi: string; loudness: string; annoyance: string; sleep: string; grid: string };
  tabInactive: string;
  skeleton: string;
}

export const lightColors: ThemeColors = {
  bg: palette.neutral[50], card: palette.white, elevated: palette.white, tinted: palette.primary[50], overlay: 'rgba(15,20,34,0.55)',
  border: palette.neutral[200], borderStrong: palette.neutral[300],
  text: palette.neutral[900], textSecondary: palette.neutral[600], textMuted: palette.neutral[500], textDisabled: palette.neutral[300],
  primary: palette.primary[600], primaryPressed: palette.primary[700], onPrimary: palette.white, primarySoft: palette.primary[50], primaryTrack: palette.primary[100],
  gradient: ['#4F46E5', '#7C3AED'],
  accent: palette.accent[500], accentSoft: palette.accent[100], accentText: palette.accent[700],
  secondary: palette.secondary[500], secondarySoft: palette.secondary[100], secondaryText: palette.secondary[700],
  success: '#15803D', successBg: '#DCFCE7', warning: '#B45309', warningBg: '#FEF3C7', danger: '#B91C1C', dangerBg: '#FEE2E2', info: '#1D4ED8', infoBg: '#DBEAFE',
  severity: {
    none: { text: '#15803D', bg: '#DCFCE7' },
    mild: { text: '#0369A1', bg: '#E0F2FE' },
    moderate: { text: '#B45309', bg: '#FEF3C7' },
    severe: { text: '#C2410C', bg: '#FFEDD5' },
    catastrophic: { text: '#B91C1C', bg: '#FEE2E2' },
  },
  chart: { tfi: palette.primary[600], thi: palette.secondary[500], loudness: '#7C3AED', annoyance: '#F97316', sleep: palette.secondary[700], grid: palette.neutral[200] },
  tabInactive: palette.neutral[400],
  skeleton: palette.neutral[100],
};

export const darkColors: ThemeColors = {
  bg: palette.inkDark, card: palette.neutral[800], elevated: '#1C2438', tinted: '#1A1F3D', overlay: 'rgba(0,0,0,0.65)',
  border: palette.neutral[700], borderStrong: palette.neutral[600],
  text: palette.textOnDark, textSecondary: palette.neutral[300], textMuted: palette.neutral[400], textDisabled: palette.neutral[500],
  primary: palette.primary[400], primaryPressed: palette.primary[300], onPrimary: palette.white, primarySoft: '#1E2246', primaryTrack: '#2A2F63',
  gradient: ['#4338CA', '#6D28D9'],
  accent: palette.accent[300], accentSoft: '#3A2410', accentText: palette.accent[300],
  secondary: palette.secondary[500], secondarySoft: '#0C2A3F', secondaryText: '#7DD3FC',
  success: '#4ADE80', successBg: '#0F2E1B', warning: '#FBBF24', warningBg: '#3A2A0A', danger: '#F87171', dangerBg: '#3B1111', info: '#93C5FD', infoBg: '#10243F',
  severity: {
    none: { text: '#4ADE80', bg: '#0F2E1B' },
    mild: { text: '#7DD3FC', bg: '#0C2A3F' },
    moderate: { text: '#FBBF24', bg: '#3A2A0A' },
    severe: { text: '#FDBA74', bg: '#3A1F0A' },
    catastrophic: { text: '#F87171', bg: '#3B1111' },
  },
  chart: { tfi: palette.primary[400], thi: palette.secondary[500], loudness: '#A78BFA', annoyance: '#FDBA74', sleep: '#7DD3FC', grid: palette.neutral[700] },
  tabInactive: palette.neutral[400],
  skeleton: '#1C2438',
};

export const nightColors: ThemeColors = {
  ...darkColors,
  bg: palette.nightBg,
  card: '#0E1322',
  elevated: '#161C2D',
  text: palette.neutral[300],
  textSecondary: palette.neutral[400],
  primary: palette.primary[500],
  onPrimary: palette.white,
  gradient: ['#312E81', '#4C1D95'],
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, full: 999 } as const;

export const type = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: -0.4 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 26, fontWeight: '400' as const },
  bodyStrong: { fontSize: 17, lineHeight: 26, fontWeight: '600' as const },
  bodySmall: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const, letterSpacing: 0.2 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  numeric: { fontSize: 40, lineHeight: 44, fontWeight: '700' as const, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
};

export const shadow = {
  e1: { shadowColor: '#0F1422', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  e2: { shadowColor: '#0F1422', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  e3: { shadowColor: '#0F1422', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
};
