import * as stylex from '@stylexjs/stylex';

/**
 * Sfera tokens.
 * Colours are defined here for LIGHT. The DARK values live in themes.ts
 * (darkTheme), one entry per token, so every colour has both modes.
 */

// #region colors
export const colors = stylex.defineVars({
  page: '#FFFFFF', // app background
  well: '#F4F4F5', // soft grey well that holds cards
  wellEdge: '#ECECEE', // hairline inside wells
  surface: '#FFFFFF', // inner cards, inputs
  raised: '#FFFFFF', // menus, popovers, dialogs
  hover: '#F5F5F6', // row / item hover
  pressed: '#EDEDEF',
  border: '#E6E6E9', // hairline
  borderStrong: '#D4D4D9', // input outline
  text: '#121214', // near-black
  textMuted: '#62626B', // secondary text (5.9:1 on white)
  textSubtle: '#8A8A93', // placeholders, captions (3.4:1, large/aux only)
  track: '#EDEDEF', // chart tracks, progress tracks
  scrim: 'rgba(18,18,20,0.32)',
  success: '#1E9E5A',
  warning: '#D99A06',
  danger: '#DC3B40',
  info: '#2E64F0',
  neutral: '#8A8A93',
  codeBg: '#F6F6F7',
  thumb: '#FFFFFF', // segmented / toggle thumbs on a well
});
// #endregion

// #region accent
export const accent = stylex.defineVars({
  base: '#2E64F0',
  hover: '#2556D6',
  onAccent: '#FFFFFF',
});
// #endregion

// #region shadows
export const shadows = stylex.defineVars({
  card: '0 1px 2px rgba(18,18,20,0.04)',
  raised: '0 1px 2px rgba(18,18,20,0.06), 0 8px 24px -6px rgba(18,18,20,0.14)',
  dialog: '0 2px 4px rgba(18,18,20,0.06), 0 24px 56px -12px rgba(18,18,20,0.28)',
  thumb: '0 1px 3px rgba(18,18,20,0.18)',
});
// #endregion

// #region space
export const space = stylex.defineVars({
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s5: '20px',
  s6: '24px',
  s8: '32px',
  s10: '40px',
  s12: '48px',
  s16: '64px',
});
// #endregion

// #region radius
export const radius = stylex.defineVars({
  xs: '6px',
  sm: '8px',
  control: '10px', // buttons, inputs
  card: '16px', // inner white card
  well: '24px', // grey well
  pill: '999px',
});
// #endregion

// #region font
export const font = stylex.defineVars({
  sans: '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
  xs: '12px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  xl: '20px',
  h3: '24px',
  h2: '32px',
  h1: '44px',
});
// #endregion

// #region motion
export const motion = stylex.defineVars({
  // One curve for everything: fast start, long soft landing.
  ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
  fast: '140ms',
  base: '220ms',
  slow: '360ms',
});
// #endregion

// #region control
export const control = stylex.defineVars({
  sm: '32px',
  md: '36px',
  lg: '40px',
});
// #endregion
