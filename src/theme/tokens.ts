/** Design tokens — see design_spec. No raw hex in components; consume through useTheme(). */

export const palette = {
  primary: { 50: '#E6F3F3', 100: '#C4E4E6', 200: '#8FD6D9', 300: '#5FBFC4', 400: '#2E9BA3', 500: '#15808A', 600: '#0E6B75', 700: '#0A525A', 800: '#073D44', 900: '#052A30' },
  accent: { 100: '#F6EBD3', 300: '#E3C285', 500: '#B8863B', 700: '#8A6320' },
  secondary: { 100: '#DDEFF9', 500: '#4A90C8', 700: '#1E5FA8' },
  neutral: { 50: '#F7F9F8', 100: '#EEF2F3', 200: '#D5E0E4', 300: '#B3C2C8', 400: '#8A9BA3', 500: '#6B8591', 600: '#4F6B75', 700: '#2C4A55', 800: '#13262E', 900: '#0F2A33' },
  inkDark: '#0B1A20',
  nightBg: '#070F13',
  textOnDark: '#E6EDF0',
  white: '#FFFFFF',
};

export type SeverityBand = 'none' | 'mild' | 'moderate' | 'severe' | 'catastrophic';

export interface ThemeColors {
  bg: string; card: string; elevated: string; tinted: string; overlay: string;
  border: string; borderStrong: string;
  text: string; textSecondary: string; textMuted: string; textDisabled: string;
  primary: string; primaryPressed: string; onPrimary: string; primarySoft: string; primaryTrack: string;
  accent: string; accentSoft: string; accentText: string;
  secondary: string; secondarySoft: string; secondaryText: string;
  success: string; successBg: string; warning: string; warningBg: string; danger: string; dangerBg: string; info: string; infoBg: string;
  severity: Record<SeverityBand, { text: string; bg: string }>;
  chart: { tfi: string; thi: string; loudness: string; annoyance: string; sleep: string; grid: string };
  tabInactive: string;
  skeleton: string;
}

export const lightColors: ThemeColors = {
  bg: palette.neutral[50], card: palette.white, elevated: palette.white, tinted: palette.primary[50], overlay: 'rgba(15,42,51,0.55)',
  border: palette.neutral[200], borderStrong: palette.neutral[300],
  text: palette.neutral[900], textSecondary: palette.neutral[600], textMuted: palette.neutral[500], textDisabled: palette.neutral[300],
  primary: palette.primary[600], primaryPressed: palette.primary[700], onPrimary: palette.white, primarySoft: palette.primary[50], primaryTrack: palette.primary[100],
  accent: palette.accent[500], accentSoft: palette.accent[100], accentText: palette.accent[700],
  secondary: palette.secondary[500], secondarySoft: palette.secondary[100], secondaryText: palette.secondary[700],
  success: '#1F7A4D', successBg: '#E3F5EA', warning: '#9A5B00', warningBg: '#FBF1DC', danger: '#B42318', dangerBg: '#FBE2DF', info: '#1E5FA8', infoBg: '#DDEFF9',
  severity: {
    none: { text: '#1F7A4D', bg: '#E3F5EA' },
    mild: { text: '#0E6B75', bg: '#E0F2F3' },
    moderate: { text: '#8A6320', bg: '#FBF1DC' },
    severe: { text: '#A8451A', bg: '#FCE8DC' },
    catastrophic: { text: '#8F1D14', bg: '#FBE2DF' },
  },
  chart: { tfi: palette.primary[600], thi: palette.secondary[500], loudness: palette.accent[700], annoyance: '#A8451A', sleep: palette.secondary[700], grid: palette.neutral[200] },
  tabInactive: palette.neutral[500],
  skeleton: palette.neutral[100],
};

export const darkColors: ThemeColors = {
  bg: palette.inkDark, card: palette.neutral[800], elevated: '#1A3139', tinted: '#0F2B30', overlay: 'rgba(0,0,0,0.65)',
  border: palette.neutral[700], borderStrong: palette.neutral[600],
  text: palette.textOnDark, textSecondary: palette.neutral[300], textMuted: palette.neutral[400], textDisabled: palette.neutral[500],
  primary: palette.primary[300], primaryPressed: palette.primary[200], onPrimary: palette.inkDark, primarySoft: '#0F2B30', primaryTrack: palette.primary[800],
  accent: palette.accent[300], accentSoft: '#2E2410', accentText: palette.accent[300],
  secondary: palette.secondary[500], secondarySoft: '#102235', secondaryText: '#8FC3F2',
  success: '#7FD1A6', successBg: '#0F2B20', warning: '#F2C46D', warningBg: '#2E2410', danger: '#F5A09A', dangerBg: '#331512', info: '#8FC3F2', infoBg: '#102235',
  severity: {
    none: { text: '#7FD1A6', bg: '#0F2B20' },
    mild: { text: '#5FBFC4', bg: '#0F2B30' },
    moderate: { text: '#E3C285', bg: '#2E2410' },
    severe: { text: '#F4A27B', bg: '#331A10' },
    catastrophic: { text: '#F5A09A', bg: '#331512' },
  },
  chart: { tfi: palette.primary[300], thi: palette.secondary[500], loudness: palette.accent[300], annoyance: '#F4A27B', sleep: '#8FC3F2', grid: palette.neutral[700] },
  tabInactive: palette.neutral[400],
  skeleton: '#1A3139',
};

export const nightColors: ThemeColors = {
  ...darkColors,
  bg: palette.nightBg,
  card: '#0E1A20',
  elevated: '#13262E',
  text: palette.neutral[300],
  textSecondary: palette.neutral[400],
  primary: palette.primary[400],
  onPrimary: palette.white,
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;

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
  e1: { shadowColor: '#0F2A33', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  e2: { shadowColor: '#0F2A33', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  e3: { shadowColor: '#0F2A33', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
};
