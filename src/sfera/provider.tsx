import './reset.css';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { colors, font } from './tokens.stylex';
import { accentThemes, darkColors, darkShadows, type AccentName } from './themes';
import { SferaContext, type ThemeMode } from './hooks';
import { ToastProvider } from './overlay';

// #region SferaProvider
const pv = stylex.create({
  root: {
    minHeight: '100dvh',
    backgroundColor: colors.page,
    color: colors.text,
    fontFamily: font.sans,
    fontSize: font.md,
    lineHeight: 1.5,
    colorScheme: 'light',
    fontFeatureSettings: '"ss01", "cv11"',
  },
  dark: { colorScheme: 'dark' },
});
/**
 * Wrap your app once. Applies light/dark, the accent preset, fonts, the
 * portal root for overlays and the toast region.
 */
export function SferaProvider({
  children,
  mode: modeProp,
  defaultMode,
  accent: accentProp,
  defaultAccent = 'blue',
  onModeChange,
  onAccentChange,
}: {
  children: ReactNode;
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  accent?: AccentName;
  defaultAccent?: AccentName;
  onModeChange?: (m: ThemeMode) => void;
  onAccentChange?: (a: AccentName) => void;
}) {
  const [modeInner, setModeInner] = useState<ThemeMode>(
    () => defaultMode ?? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  );
  const [accentInner, setAccentInner] = useState<AccentName>(defaultAccent);
  const mode = modeProp ?? modeInner;
  const accent = accentProp ?? accentInner;
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);
  const value = useMemo(
    () => ({
      mode,
      accent,
      portalRoot,
      setMode: (m: ThemeMode) => (onModeChange ? onModeChange(m) : setModeInner(m)),
      setAccent: (a: AccentName) => (onAccentChange ? onAccentChange(a) : setAccentInner(a)),
    }),
    [mode, accent, portalRoot, onModeChange, onAccentChange],
  );
  return (
    <SferaContext.Provider value={value}>
      <div {...stylex.props(pv.root, mode === 'dark' && [darkColors, darkShadows, pv.dark], accentThemes[accent])}>
        <ToastProvider>{children}</ToastProvider>
        <div ref={setPortalRoot} />
      </div>
    </SferaContext.Provider>
  );
}
// #endregion
