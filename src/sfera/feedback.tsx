import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { accent, colors, font, motion, radius, space } from './tokens.stylex';
import { fx, type Tone } from './shared';

const pulse = stylex.keyframes({ '0%': { opacity: 1 }, '50%': { opacity: 0.45 }, '100%': { opacity: 1 } });
const spin = stylex.keyframes({ from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } });
import { IconButton } from './action';

// Tone styles: soft tinted fill + readable ink, mixed from the tone colour so
// they work in light and dark without extra tokens.
const tone = stylex.create({
  neutral: { backgroundColor: `color-mix(in oklab, ${colors.neutral} 14%, transparent)`, color: colors.textMuted },
  accent: { backgroundColor: `color-mix(in oklab, ${accent.base} 13%, transparent)`, color: `color-mix(in oklab, ${accent.base} 78%, ${colors.text})` },
  success: { backgroundColor: `color-mix(in oklab, ${colors.success} 15%, transparent)`, color: `color-mix(in oklab, ${colors.success} 70%, ${colors.text})` },
  warning: { backgroundColor: `color-mix(in oklab, ${colors.warning} 18%, transparent)`, color: `color-mix(in oklab, ${colors.warning} 58%, ${colors.text})` },
  danger: { backgroundColor: `color-mix(in oklab, ${colors.danger} 13%, transparent)`, color: `color-mix(in oklab, ${colors.danger} 78%, ${colors.text})` },
  info: { backgroundColor: `color-mix(in oklab, ${colors.info} 13%, transparent)`, color: `color-mix(in oklab, ${colors.info} 78%, ${colors.text})` },
});
const dotTone = stylex.create({
  neutral: { backgroundColor: colors.neutral },
  accent: { backgroundColor: accent.base },
  success: { backgroundColor: colors.success },
  warning: { backgroundColor: colors.warning },
  danger: { backgroundColor: colors.danger },
  info: { backgroundColor: colors.info },
});

// #region Badge
const bdg = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    paddingInline: 7,
    borderRadius: radius.pill,
    fontSize: font.xs,
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  solid: { backgroundColor: accent.base, color: accent.onAccent },
  outline: { backgroundColor: 'transparent', color: colors.textMuted, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border },
  mono: { fontFamily: font.mono, fontWeight: 400 },
});
/** Small count or label. `variant="solid"` uses the accent. */
export function Badge({ children, tone: t = 'neutral', variant = 'soft', mono }: { children: ReactNode; tone?: Tone; variant?: 'soft' | 'solid' | 'outline'; mono?: boolean }) {
  return <span {...stylex.props(bdg.root, variant === 'soft' && tone[t], variant === 'solid' && bdg.solid, variant === 'outline' && bdg.outline, mono && bdg.mono)}>{children}</span>;
}
// #endregion

// #region StatusDot
const sd = stylex.create({
  dot: { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  lg: { width: 9, height: 9 },
  ring: { boxShadow: `0 0 0 2px ${colors.surface}` },
  live: { animationName: pulse, animationDuration: '1.6s', animationIterationCount: 'infinite' },
});
export function StatusDot({ tone: t = 'neutral', size = 'md', live, ring, label }: { tone?: Tone; size?: 'md' | 'lg'; live?: boolean; ring?: boolean; label?: string }) {
  return <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...stylex.props(sd.dot, dotTone[t], size === 'lg' && sd.lg, live && sd.live, ring && sd.ring)} />;
}
// #endregion

// #region StatusChip
const sc = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 9,
    borderRadius: radius.pill,
    fontSize: font.sm,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  dot: { backgroundColor: 'transparent', color: colors.text, borderWidth: 1, borderStyle: 'solid', borderColor: colors.border, paddingInline: 9 },
  sm: { height: 20, paddingInline: 7, fontSize: font.xs },
});
/**
 * Status as text plus colour, never colour alone.
 * `variant="soft"` = tinted fill; `variant="dot"` = outlined pill with a coloured dot.
 */
export function StatusChip({ tone: t = 'neutral', children, variant = 'soft', size = 'md' }: { tone?: Tone; children: ReactNode; variant?: 'soft' | 'dot'; size?: 'sm' | 'md' }) {
  return (
    <span {...stylex.props(sc.root, variant === 'soft' ? tone[t] : sc.dot, size === 'sm' && sc.sm)}>
      {variant === 'dot' && <StatusDot tone={t} />}
      {children}
    </span>
  );
}
// #endregion

// #region Banner
const bn = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 10px 10px 12px',
    borderRadius: 12,
    fontSize: font.md,
    lineHeight: 1.5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  icon: { display: 'inline-flex', marginTop: 2, flexShrink: 0 },
  body: { flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingBlock: 1 },
  title: { fontWeight: 500, color: colors.text },
  desc: { color: colors.textMuted, fontSize: font.sm },
  action: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
  neutralBox: { backgroundColor: colors.well, borderColor: colors.wellEdge },
});
const bnIcon = { neutral: Info, accent: Info, info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };
export function Banner({
  tone: t = 'info',
  title,
  children,
  action,
  onDismiss,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}) {
  const I = bnIcon[t];
  return (
    <div role={t === 'danger' || t === 'warning' ? 'alert' : 'status'} {...stylex.props(bn.root, t === 'neutral' ? bn.neutralBox : tone[t])}>
      <span {...stylex.props(bn.icon)}>
        <I size={16} />
      </span>
      <div {...stylex.props(bn.body)}>
        {title && <span {...stylex.props(bn.title)}>{title}</span>}
        {children && <span {...stylex.props(bn.desc)}>{children}</span>}
      </div>
      {(action || onDismiss) && (
        <div {...stylex.props(bn.action)}>
          {action}
          {onDismiss && <IconButton label="Dismiss" size="sm" icon={<X size={14} />} onClick={onDismiss} />}
        </div>
      )}
    </div>
  );
}
// #endregion

// #region ProgressBar
const pb = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 6, width: '100%', minWidth: 0 },
  head: { display: 'flex', justifyContent: 'space-between', gap: space.s2, fontSize: font.sm },
  label: { color: colors.text, fontWeight: 500 },
  value: { color: colors.textMuted, fontFamily: font.mono, fontSize: font.xs, fontVariantNumeric: 'tabular-nums' },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' },
  thick: { height: 10 },
  bar: {
    height: '100%',
    width: '100%',
    borderRadius: radius.pill,
    transformOrigin: 'left',
    transitionProperty: 'transform',
    transitionDuration: motion.slow,
    transitionTimingFunction: motion.ease,
  },
  scale: (p: number) => ({ transform: `scaleX(${p})` }),
});
export function ProgressBar({ value, max = 100, label, tone: t = 'accent', showValue = true, thick }: { value: number; max?: number; label?: ReactNode; tone?: Tone; showValue?: boolean; thick?: boolean }) {
  const p = Math.max(0, Math.min(1, value / max));
  return (
    <div {...stylex.props(pb.root)}>
      {(label || showValue) && (
        <div {...stylex.props(pb.head)}>
          <span {...stylex.props(pb.label)}>{label}</span>
          {showValue && <span {...stylex.props(pb.value)}>{Math.round(p * 100)}%</span>}
        </div>
      )}
      <div role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={typeof label === 'string' ? label : undefined} {...stylex.props(pb.track, thick && pb.thick)}>
        <div {...stylex.props(pb.bar, dotTone[t], pb.scale(p))} />
      </div>
    </div>
  );
}
// #endregion

// #region Spinner
const sp = stylex.create({
  root: {
    display: 'inline-block',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: colors.track,
    borderTopColor: accent.base,
    animationName: spin,
    animationDuration: '700ms',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    flexShrink: 0,
  },
  sm: { width: 14, height: 14, borderWidth: 2 },
  md: { width: 20, height: 20, borderWidth: 2 },
  lg: { width: 28, height: 28, borderWidth: 3 },
});
export function Spinner({ size = 'md', label = 'Loading' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  return <span role="status" aria-label={label} {...stylex.props(sp.root, sp[size])} />;
}
// #endregion

// #region Skeleton
const sk = stylex.create({
  root: { display: 'block', backgroundColor: colors.track, borderRadius: 8, animationName: pulse, animationDuration: '1.4s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' },
  text: { height: 10, borderRadius: 999 },
  circle: { borderRadius: '50%' },
  size: (w: string, h: string) => ({ width: w, height: h }),
});
export function Skeleton({ width = '100%', height = 14, shape = 'rect' }: { width?: number | string; height?: number | string; shape?: 'rect' | 'text' | 'circle' }) {
  const w = typeof width === 'number' ? `${width}px` : width;
  const h = typeof height === 'number' ? `${height}px` : height;
  return <span aria-hidden {...stylex.props(sk.root, shape === 'text' && sk.text, shape === 'circle' && sk.circle, sk.size(w, shape === 'text' ? '10px' : h))} />;
}
// #endregion

// #region EmptyState
const es = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 6,
    padding: { default: '36px 24px', '@media (max-width: 640px)': '28px 16px' },
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  plain: { borderWidth: 0 },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: colors.well,
    color: colors.textMuted,
  },
  title: { margin: 0, fontSize: font.md, fontWeight: 500, color: colors.text },
  desc: { margin: 0, maxWidth: 340, fontSize: font.sm, lineHeight: 1.5, color: colors.textMuted },
  actions: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
});
/** Says what is empty and offers the next action. Dashed outline by default. */
export function EmptyState({ icon, title, description, actions, bordered = true }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; bordered?: boolean }) {
  return (
    <div {...stylex.props(es.root, !bordered && es.plain)}>
      {icon && <span {...stylex.props(es.icon)}>{icon}</span>}
      <p {...stylex.props(es.title)}>{title}</p>
      {description && <p {...stylex.props(es.desc)}>{description}</p>}
      {actions && <div {...stylex.props(es.actions)}>{actions}</div>}
    </div>
  );
}
// #endregion

// #region AnimatedNumber
const an = stylex.create({
  root: { display: 'inline-flex', alignItems: 'flex-start', height: '1.1em', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', verticalAlign: 'bottom', lineHeight: 1.1 },
  col: { display: 'inline-flex', flexDirection: 'column', transitionProperty: 'transform', transitionDuration: '600ms', transitionTimingFunction: motion.ease },
  digit: { height: '1.1em', display: 'block', textAlign: 'center' },
  y: (n: number) => ({ transform: `translateY(${-n * 1.1}em)` }),
});
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
/** Digits roll to their new value on a drum. Non-digits render as-is. */
export function AnimatedNumber({ value, format = (n: number) => n.toLocaleString('en-US') }: { value: number; format?: (n: number) => string }) {
  const text = format(value);
  return (
    <span aria-label={text} role="text" {...stylex.props(an.root)}>
      {text.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={text.length - i} aria-hidden {...stylex.props(an.col, an.y(Number(ch)))}>
            {DIGITS.map((d) => (
              <span key={d} {...stylex.props(an.digit)}>
                {d}
              </span>
            ))}
          </span>
        ) : (
          <span key={`s${text.length - i}`} aria-hidden {...stylex.props(an.digit)}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
// #endregion

/** Counts up once when mounted. Useful for stat cells. */
export function useCountUp(target: number, ms = 700) {
  const [n, setN] = useState(target);
  const first = useRef(true);
  useEffect(() => {
    if (!first.current) return setN(target);
    first.current = false;
    const t0 = performance.now();
    let r = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) r = requestAnimationFrame(tick);
    };
    r = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r);
  }, [target, ms]);
  return n;
}

export { tone as toneStyles, dotTone };
// fx re-exported for docs examples that need focus atoms
export { fx };
