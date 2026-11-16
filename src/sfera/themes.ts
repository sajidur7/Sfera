import * as stylex from '@stylexjs/stylex';
import { accent, colors, shadows } from './tokens.stylex';

// #region darkTheme
export const darkColors = stylex.createTheme(colors, {
  page: '#0E0E10',
  well: '#18181B',
  wellEdge: '#222226',
  surface: '#1F1F23',
  raised: '#232328',
  hover: '#26262B',
  pressed: '#2D2D33',
  border: '#2B2B30',
  borderStrong: '#3A3A41',
  text: '#EDEDF0',
  textMuted: '#A1A1AA',
  textSubtle: '#76767F',
  track: '#2A2A2F',
  scrim: 'rgba(0,0,0,0.56)',
  success: '#3DBE78',
  warning: '#E8B02A',
  danger: '#F0595D',
  info: '#5B8BFF',
  neutral: '#8B8B94',
  codeBg: '#17171A',
  thumb: '#34343B',
});

export const darkShadows = stylex.createTheme(shadows, {
  card: '0 0 0 1px rgba(255,255,255,0.02)',
  raised: '0 0 0 1px rgba(255,255,255,0.04), 0 12px 28px -6px rgba(0,0,0,0.6)',
  dialog: '0 0 0 1px rgba(255,255,255,0.05), 0 28px 64px -12px rgba(0,0,0,0.7)',
  thumb: '0 1px 3px rgba(0,0,0,0.5)',
});
// #endregion

// #region accentPresets
// Flat accent presets. White text passes 4.5:1 on every base.
export const accentBlue = stylex.createTheme(accent, { base: '#2E64F0', hover: '#2556D6', onAccent: '#FFFFFF' });
export const accentViolet = stylex.createTheme(accent, { base: '#6D4DE6', hover: '#5D3DD4', onAccent: '#FFFFFF' });
export const accentPink = stylex.createTheme(accent, { base: '#D23A70', hover: '#BC2F61', onAccent: '#FFFFFF' });
export const accentRed = stylex.createTheme(accent, { base: '#D2353B', hover: '#BC2C32', onAccent: '#FFFFFF' });
export const accentOrange = stylex.createTheme(accent, { base: '#C2560A', hover: '#AB4B08', onAccent: '#FFFFFF' });
export const accentGreen = stylex.createTheme(accent, { base: '#17804F', hover: '#126F44', onAccent: '#FFFFFF' });

export type AccentName = 'blue' | 'violet' | 'pink' | 'red' | 'orange' | 'green';

export const accentThemes = {
  blue: accentBlue,
  violet: accentViolet,
  pink: accentPink,
  red: accentRed,
  orange: accentOrange,
  green: accentGreen,
} as const;

// Swatch colours for pickers (plain values, not tokens).
export const accentSwatches: Record<AccentName, string> = {
  blue: '#2E64F0',
  violet: '#6D4DE6',
  pink: '#D23A70',
  red: '#D2353B',
  orange: '#C2560A',
  green: '#17804F',
};
// #endregion
