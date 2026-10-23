import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, nightColors, radius, shadow, space, type, type ThemeColors } from './tokens';
import { useSettings } from '@/store/settings';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  night: boolean;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  shadow: typeof shadow;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children, night = false }: { children: React.ReactNode; night?: boolean }) {
  const system = useColorScheme();
  const pref = useSettings((s) => s.appearance);
  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const value = useMemo<Theme>(() => {
    const colors = night ? nightColors : isDark ? darkColors : lightColors;
    return { colors, isDark: isDark || night, night, space, radius, type, shadow: isDark || night ? { e1: {}, e2: {}, e3: {} } as typeof shadow : shadow };
  }, [isDark, night]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}
