import * as stylex from '@stylexjs/stylex';
import { accent, colors, font, motion } from './tokens.stylex';

// #region shared
/** Small shared style atoms used across every group file. */
export const fx = stylex.create({
  focus: {
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineOffset: 2,
    outlineColor: accent.base,
  },
  press: {
    transitionProperty: 'transform, background-color, border-color, color, box-shadow, opacity',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    transform: { default: null, ':active:not(:disabled)': 'scale(0.97)' },
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  truncate: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
  mono: { fontFamily: font.mono },
  hairline: { borderColor: colors.border },
});

export const spin = stylex.keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } });
export const fadeUp = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(4px) scale(0.98)' },
  to: { opacity: 1, transform: 'none' },
});
export const pulse = stylex.keyframes({ '0%': { opacity: 1 }, '50%': { opacity: 0.45 }, '100%': { opacity: 1 } });
// #endregion

/** Status palette shared by chips, dots, banners. */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const toneVar: Record<Tone, string> = {
  neutral: colors.neutral,
  accent: accent.base,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
};
