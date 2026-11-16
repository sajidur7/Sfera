import * as stylex from '@stylexjs/stylex';
import { Children, cloneElement, forwardRef, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { accent, colors, control, font, motion, radius, space } from './tokens.stylex';
import { fx } from './shared';

const spin = stylex.keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } });
import { useControllable } from './hooks';

// #region Button
export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  xstyle?: stylex.StyleXStyles;
};

const btn = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
    overflow: 'hidden',
    fontFamily: font.sans,
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: radius.control,
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    userSelect: 'none',
    touchAction: 'manipulation',
    textDecoration: 'none',
    position: 'relative',
    // pressed buttons sink 1px; no gradients: depth comes from flat edge light and shadow
    transform: { default: null, ':active:not(:disabled)': 'translateY(1px)' },
    transitionProperty: 'transform, background-color, box-shadow, border-color',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  // Sizes: 36 / 32 / 24 with radius 10 / 8 / 6.
  xs: { height: { default: 24, '@media (pointer: coarse)': 32 }, paddingInline: 8, fontSize: font.xs, fontWeight: 600, borderRadius: 6 },
  sm: { height: control.sm, paddingInline: 8, fontSize: font.md, borderRadius: 8 },
  md: { height: control.md, paddingInline: 8, fontSize: font.md, borderRadius: radius.control },
  lg: { height: control.lg, paddingInline: 12, fontSize: font.md, borderRadius: 12 },
  label: { display: 'inline-flex', alignItems: 'center', flexShrink: 0 },
  labelMd: { paddingInline: 4 },
  labelSm: { paddingInline: 2 },
  // Raised: a light top edge, a darker bottom edge and border, and a soft tinted drop shadow.
  primary: {
    backgroundColor: { default: accent.base, ':hover:not(:disabled)': accent.hover, ':active:not(:disabled)': accent.hover },
    borderColor: { default: `color-mix(in oklab, ${accent.base} 78%, black)`, ':disabled': 'transparent' },
    color: { default: accent.onAccent, ':disabled': `color-mix(in oklab, ${accent.onAccent} 55%, ${accent.base})` },
    boxShadow: {
      default: `inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -2px 0 rgba(0,0,0,0.12), 0 1px 2px rgba(18,18,20,0.14), 0 3px 8px -3px color-mix(in oklab, ${accent.base} 60%, transparent)`,
      ':active:not(:disabled)': 'inset 0 1px 2px rgba(0,0,0,0.18)',
      ':disabled': 'none',
    },
  },
  secondary: {
    backgroundColor: { default: colors.surface, ':hover:not(:disabled)': colors.hover, ':active:not(:disabled)': colors.pressed, ':disabled': colors.well },
    borderColor: { default: colors.border, ':hover:not(:disabled)': colors.borderStrong },
    color: { default: colors.text, ':disabled': colors.textSubtle },
    boxShadow: {
      default: 'inset 0 -2px 0 rgba(18,18,20,0.05), 0 1px 2px rgba(18,18,20,0.08), 0 2px 6px -3px rgba(18,18,20,0.10)',
      ':active:not(:disabled)': 'inset 0 1px 2px rgba(18,18,20,0.10)',
      ':disabled': 'none',
    },
  },
  // Accent-tinted, flat: for the second action next to a primary.
  soft: {
    backgroundColor: {
      default: `color-mix(in oklab, ${accent.base} 13%, ${colors.surface})`,
      ':hover:not(:disabled)': `color-mix(in oklab, ${accent.base} 19%, ${colors.surface})`,
      ':active:not(:disabled)': `color-mix(in oklab, ${accent.base} 24%, ${colors.surface})`,
      ':disabled': colors.well,
    },
    color: { default: `color-mix(in oklab, ${accent.base} 82%, ${colors.text})`, ':disabled': colors.textSubtle },
  },
  ghost: {
    backgroundColor: { default: 'transparent', ':hover:not(:disabled)': colors.hover, ':active:not(:disabled)': colors.pressed },
    color: { default: colors.textMuted, ':hover:not(:disabled)': colors.text, ':disabled': colors.textSubtle },
  },
  danger: {
    backgroundColor: { default: colors.danger, ':hover:not(:disabled)': `color-mix(in oklab, ${colors.danger} 88%, black)` },
    borderColor: { default: `color-mix(in oklab, ${colors.danger} 78%, black)`, ':disabled': 'transparent' },
    color: { default: '#FFFFFF', ':disabled': `color-mix(in oklab, #FFFFFF 55%, ${colors.danger})` },
    boxShadow: {
      default: `inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -2px 0 rgba(0,0,0,0.12), 0 1px 2px rgba(18,18,20,0.14), 0 3px 8px -3px color-mix(in oklab, ${colors.danger} 60%, transparent)`,
      ':active:not(:disabled)': 'inset 0 1px 2px rgba(0,0,0,0.18)',
      ':disabled': 'none',
    },
  },
  full: { width: '100%' },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRightColor: 'transparent',
    animationName: spin,
    animationDuration: '700ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  icon: { display: 'inline-flex', flexShrink: 0 },
});

/** Icons are sized by the button (18 / 16 / 14px) so every button matches. */
const iconPx: Record<ButtonSize, number> = { xs: 14, sm: 16, md: 18, lg: 18 };
function sized(icon: ReactNode, px: number) {
  return isValidElement(icon) && typeof icon.type !== 'string' ? cloneElement(icon as ReactElement<{ size?: number }>, { size: px }) : icon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', iconStart, iconEnd, loading, fullWidth, xstyle, children, disabled, type = 'button', ...rest },
  ref,
) {
  const px = iconPx[size];
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
      {...stylex.props(btn.base, btn[size], btn[variant], fx.focus, fx.press, fullWidth && btn.full, xstyle)}
    >
      {loading ? <span {...stylex.props(btn.spinner)} aria-hidden /> : iconStart && <span {...stylex.props(btn.icon)}>{sized(iconStart, px)}</span>}
      {children !== undefined && children !== null && children !== false && <span {...stylex.props(btn.label, size === 'md' || size === 'lg' ? btn.labelMd : btn.labelSm)}>{children}</span>}
      {iconEnd && <span {...stylex.props(btn.icon)}>{sized(iconEnd, px)}</span>}
    </button>
  );
});
// #endregion

// #region IconButton
export type IconButtonProps = Omit<ButtonProps, 'iconStart' | 'iconEnd' | 'children' | 'fullWidth'> & {
  label: string;
  icon: ReactNode;
  shape?: 'square' | 'circle';
};
const ib = stylex.create({
  xs: { width: { default: 24, '@media (pointer: coarse)': 32 }, paddingInline: 0 },
  sm: { width: control.sm, paddingInline: 0 },
  md: { width: control.md, paddingInline: 0 },
  lg: { width: control.lg, paddingInline: 0 },
  circle: { borderRadius: radius.pill },
});
/** Icon-only button. `label` becomes the accessible name and the tooltip text. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, size = 'md', variant = 'ghost', shape = 'square', xstyle, ...rest },
  ref,
) {
  return (
    <Button ref={ref} aria-label={label} title={label} size={size} variant={variant} iconStart={icon} xstyle={[ib[size], shape === 'circle' && ib.circle, xstyle]} {...rest} />
  );
});
// #endregion

// #region ButtonGroup
const bg = stylex.create({
  root: { display: 'inline-flex', alignItems: 'stretch' },
  spaced: { gap: space.s2, flexWrap: 'wrap' },
  first: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  middle: { borderRadius: 0, marginLeft: -1 },
  last: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 },
});
/** Groups buttons. `attached` joins them into one outlined strip. */
export function ButtonGroup({ attached = true, children, label }: { attached?: boolean; children: ReactNode; label?: string }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{ xstyle?: stylex.StyleXStyles }>[];
  return (
    <div role="group" aria-label={label} {...stylex.props(bg.root, !attached && bg.spaced)}>
      {attached
        ? items.map((el, i) =>
            cloneElement(el, {
              xstyle: [items.length > 1 && (i === 0 ? bg.first : i === items.length - 1 ? bg.last : bg.middle), el.props.xstyle],
            }),
          )
        : items}
    </div>
  );
}
// #endregion

// #region ToggleButton
const tb = stylex.create({
  on: {
    backgroundColor: { default: `color-mix(in oklab, ${accent.base} 12%, ${colors.surface})`, ':hover:not(:disabled)': `color-mix(in oklab, ${accent.base} 18%, ${colors.surface})` },
    borderColor: `color-mix(in oklab, ${accent.base} 40%, ${colors.border})`,
    color: `color-mix(in oklab, ${accent.base} 82%, ${colors.text})`,
  },
});
export type ToggleButtonProps = Omit<ButtonProps, 'onChange' | 'variant'> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (p: boolean) => void;
};
export function ToggleButton({ pressed, defaultPressed = false, onPressedChange, xstyle, ...rest }: ToggleButtonProps) {
  const [on, setOn] = useControllable(pressed, defaultPressed, onPressedChange);
  return <Button variant="secondary" aria-pressed={on} onClick={() => setOn(!on)} xstyle={[on && tb.on, xstyle]} {...rest} />;
}
// #endregion

// #region SegmentedControl
export type SegmentOption = { value: string; label: ReactNode; icon?: ReactNode };
const seg = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 3,
    gap: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.well,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.wellEdge,
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  full: { display: 'flex', width: '100%' },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.thumb,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
    transitionProperty: 'transform, width',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    pointerEvents: 'none',
  },
  item: {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: { default: 28, '@media (pointer: coarse)': 34 },
    paddingInline: 12,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: radius.pill,
    fontSize: font.sm,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    color: { default: colors.textMuted, ':hover': colors.text },
    transitionProperty: 'color',
    transitionDuration: motion.fast,
    flexShrink: 0,
  },
  grow: { flexGrow: 1 },
  sm: { height: { default: 24, '@media (pointer: coarse)': 32 }, paddingInline: 10, fontSize: font.xs },
  active: { color: colors.text },
});
export type SegmentedControlProps = {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  label?: string;
};
/** Pill segmented control. The white thumb slides to the selected option. */
export function SegmentedControl({ options, value, defaultValue, onChange, size = 'md', fullWidth, label }: SegmentedControlProps) {
  const [v, setV] = useControllable(value, defaultValue ?? options[0]?.value, onChange);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const el = refs.current[v];
    if (!el) return;
    const measure = () => setInd({ x: el.offsetLeft, w: el.offsetWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [v, options.length]);
  const onKey = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === v);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = options[(i + d + options.length) % options.length];
    setV(next.value);
    refs.current[next.value]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey} {...stylex.props(seg.root, fullWidth && seg.full)}>
      {ind && <span aria-hidden {...stylex.props(seg.indicator)} style={{ transform: `translateX(${ind.x}px)`, width: ind.w }} />}
      {options.map((o) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[o.value] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.value === v}
          tabIndex={o.value === v ? 0 : -1}
          onClick={() => setV(o.value)}
          {...stylex.props(seg.item, size === 'sm' && seg.sm, fullWidth && seg.grow, o.value === v && seg.active, fx.focus)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
// #endregion

// #region Link
const lk = stylex.create({
  base: {
    position: 'relative',
    '::before': { content: '""', position: 'absolute', inset: { default: 0, '@media (pointer: coarse)': '-7px -2px' } },
    color: `color-mix(in oklab, ${accent.base} 86%, ${colors.text})`,
    textDecorationLine: 'underline',
    textDecorationColor: { default: `color-mix(in oklab, ${accent.base} 35%, transparent)`, ':hover': 'currentColor' },
    textUnderlineOffset: 3,
    textDecorationThickness: 1,
    cursor: 'pointer',
    borderRadius: 4,
    transitionProperty: 'text-decoration-color',
    transitionDuration: motion.fast,
  },
  subtle: { color: { default: colors.textMuted, ':hover': colors.text }, textDecorationLine: { default: 'none', ':hover': 'underline' } },
  icon: { display: 'inline-flex', verticalAlign: '-2px', marginLeft: 3 },
});
export function Link({
  subtle,
  external,
  children,
  ...rest
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'style' | 'className'> & { subtle?: boolean; external?: boolean }) {
  return (
    <a {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest} {...stylex.props(lk.base, subtle && lk.subtle, fx.focus)}>
      {children}
      {external && (
        <span {...stylex.props(lk.icon)} aria-hidden>
          <ArrowUpRight size={12} />
        </span>
      )}
    </a>
  );
}
// #endregion

// #region Toolbar
const tbar = stylex.create({
  root: { display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none' },
  sep: { width: 1, height: 18, backgroundColor: colors.border, marginInline: 4, flexShrink: 0 },
});
/** A row of related controls. Arrow keys move between them (roving focus). */
export function Toolbar({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const items = Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled)'));
    const i = items.indexOf(document.activeElement as HTMLElement);
    const n = items[(i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
    n?.focus();
    e.preventDefault();
  };
  return (
    <div ref={ref} role="toolbar" aria-label={label} onKeyDown={onKey} {...stylex.props(tbar.root)}>
      {children}
    </div>
  );
}
export function ToolbarSeparator() {
  return <span role="separator" aria-orientation="vertical" {...stylex.props(tbar.sep)} />;
}
// #endregion
